/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:23
*/
/**
 * allow body to drag
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/drag', function (S, ScrollViewBase, DD, Event) {

    var OUT_OF_BOUND_FACTOR = 0.5;

    var SWIPE_SAMPLE_INTERVAL = 300;

    var MAX_SWIPE_VELOCITY = 6;

    function onDragStart(self, e, axis) {
        var now = e.timeStamp,
            scroll = self.get('scroll' + S.ucfirst(axis));
        self._startScroll[axis] = scroll;
        self._swipe[axis].startTime = now;
        self._swipe[axis].scroll = scroll;
    }

    function onDragAxis(self, e, axis, dragStartMousePos) {
        if (forbidDrag(self, axis)) {
            return;
        }
        var pageXY = axis == 'left' ? 'pageX' : 'pageY',
            _lastPageXY = self._lastPageXY;
        var diff = e[pageXY] - dragStartMousePos[axis],
        // touchend == last touchmove
            eqWithLastPoint,
            scroll = self._startScroll[axis] - diff,
            bound,
            now = e.timeStamp,
            minScroll = self.minScroll,
            maxScroll = self.maxScroll,
            _lastDirection = self._lastDirection,
            _swipe = self._swipe,
            direction;
        if (_lastPageXY[pageXY]) {
            eqWithLastPoint = e[pageXY] == _lastPageXY[pageXY];
            direction = ( e[pageXY] - _lastPageXY[pageXY]) > 0;
        }
        if (scroll < minScroll[axis]) {
            bound = minScroll[axis] - scroll;
            bound *= OUT_OF_BOUND_FACTOR;
            scroll = minScroll[axis] - bound;
        } else if (scroll > maxScroll[axis]) {
            bound = scroll - maxScroll[axis];
            bound *= OUT_OF_BOUND_FACTOR;
            scroll = maxScroll[axis] + bound;
        }

        var timeDiff = (now - _swipe[axis].startTime);

        // swipe sample
        if (!eqWithLastPoint && _lastDirection[axis] !== undefined &&
            _lastDirection[axis] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL) {
            _swipe[axis].startTime = now;
            _swipe[axis].scroll = scroll;
            // S.log('record for swipe: ' + timeDiff + ' : ' + scroll);
        }

        self.set(axis == 'left' ? 'scrollLeft' : 'scrollTop', scroll);
        _lastDirection[axis] = direction;

        _lastPageXY[pageXY] = e[pageXY];
    }

    function fireScrollEnd(self, xy, e) {
        self.fire('scrollEnd', {
            axis: xy,
            pageX: e.pageX,
            pageY: e.pageY
        });
    }

    function forbidDrag(self, axis) {
        var lockXY = axis == 'left' ? 'lockX' : 'lockY';
        if (!self._allowScroll[axis] && self.get(lockXY)) {
            return 1;
        }
        return 0;
    }

    function onDragEndAxis(self, e, axis) {
        if (forbidDrag(self, axis)) {
            return;
        }
        var scrollAxis = 'scroll' + (axis == 'left' ? 'Left' : 'Top'),
            contentEl = self.get('contentEl'),
            scroll = self.get(scrollAxis),
            xy = axis == 'left' ? 'x' : 'y',
            anim = {},
            minScroll = self.minScroll,
            maxScroll = self.maxScroll,
            now = e.timeStamp,
            _swipe = self._swipe,
            bound;
        if (scroll < minScroll[axis]) {
            bound = minScroll[axis];
        } else if (scroll > maxScroll[axis]) {
            bound = maxScroll[axis];
        }
        if (bound !== undefined) {
            anim[axis] = {
                fx: {
                    frame: function (anim, fx) {
                        self.set(scrollAxis, scroll + fx.pos * (bound - scroll));
                    }
                }
            };
            // bounce
            contentEl.animate(anim, {
                duration: self.get('bounceDuration'),
                easing: self.get('bounceEasing'),
                queue: false,
                complete: function () {
                    fireScrollEnd(self, xy, e);
                }
            });
            return;
        }

        var duration = now - _swipe[axis].startTime;

        // S.log('duration: ' + duration);

        if (duration == 0) {
            fireScrollEnd(self, xy, e);
            return;
        }

        var distance = (scroll - _swipe[axis].scroll);

        // S.log('distance: ' + distance);

        if (distance == 0) {
            fireScrollEnd(self, xy, e);
            return;
        }

        //alert('duration:' + duration);
        //log('distance:' + distance);

        var velocity = distance / duration;


        velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);

        // S.log('velocity: ' + velocity);

        // S.log('after dragend scroll value: ' + scroll);
        anim[axis] = {
            fx: {
                frame: makeMomentumFx(self, velocity, scroll,
                    scrollAxis, maxScroll[axis],
                    minScroll[axis])
            }
        };

        contentEl.animate(anim, {
            duration: 9999,
            queue: false,
            complete: function () {
                fireScrollEnd(self, xy, e);
            }
        });
    }

    var FRICTION = 0.5;
    var ACCELERATION = 20;
    var THETA = Math.log(1 - (FRICTION / 10)); // -0.05129329438755058
    var ALPHA = THETA / ACCELERATION; // -0.0017097764795850194
    var SPRING_TENSION = 0.3;

    function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
        // velocity>0 touch upward, move downward, scrollTop++
        var velocity = startVelocity * ACCELERATION;
        var inertia = 1;
        var bounceStartTime = 0;
        return function (anim) {
            var now = S.now(),
                fx = this,
                deltaTime,
                value;

            if (inertia) {
                deltaTime = now - anim.startTime;
                // Math.exp(-0.1) -> Math.exp(-999)
                // big -> small
                // 1 -> 0
                var frictionFactor = Math.exp(deltaTime * ALPHA);
                // 1 - e^-t
                value = parseInt(startScroll + velocity * (1 - frictionFactor) / (-THETA));
                if (value > minScroll && value < maxScroll) {
                    // inertia
                    if (fx.lastValue === value) {
                        fx.finished = 1;
                    }
                    fx.lastValue = value;
                    self.set(scrollAxis, value);
                    return;
                }
                inertia = 0;
                velocity = velocity * frictionFactor;
                // S.log('before bounce value: ' + value);
                // S.log('before bounce startScroll: ' + value);
                // S.log('start bounce velocity: ' + velocity);
                // S.log('before bounce minScroll: ' + minScroll);
                // S.log('before bounce maxScroll: ' + maxScroll);
                startScroll = value <= minScroll ? minScroll : maxScroll;
                // S.log('startScroll value: ' + startScroll);
                bounceStartTime = now;
            } else {
                deltaTime = now - bounceStartTime;
                // bounce
                var theta = (deltaTime / ACCELERATION),
                // long tail hump
                // t * e^-t
                    powTime = theta * Math.exp(-SPRING_TENSION * theta);
                value = parseInt(velocity * powTime);
                if (value === 0) {
                    fx.finished = 1;
                }
                self.set(scrollAxis, startScroll + value);
            }
        };
    }

    return ScrollViewBase.extend({

        bindUI: function () {
            var self = this,
                contentEl = self.get('contentEl'),
                dd = self.dd = new DD.Draggable({
                    node: contentEl,
                    groups: false,
                    // allow nested scrollview
                    halt: true
                });
            dd.on('dragstart', self._onDragStart, self)
                .on('drag', self._onDrag, self)
                .on('dragend', self._onDragEnd, self);

            self.get('el').on(Event.Gesture.start, self._onGestureStart, self);
            contentEl.on(Event.Gesture.start, self._onGestureStart, self);
        },


        syncUI: function () {
            this._initStates();
        },

        destructor: function () {
            this.dd.destroy();
            this.stopAnimation();
        },

        _onGestureStart: function () {
            this.stopAnimation();
        },


        _onDragStart: function (e) {
            // S.log('dragstart: ' + e.timeStamp);
            var self = this;
            self._initStates();
            self._dragStartMousePos = {
                left: e.pageX,
                top: e.pageY
            };
            onDragStart(self, e, 'left');
            onDragStart(self, e, 'top');
            self.fire('scrollStart', {
                pageX: e.pageX,
                pageY: e.pageY
            });
        },

        _onDrag: function (e) {
            // S.log('drag: ' + e.timeStamp);
            var self = this,
                dragStartMousePos = self._dragStartMousePos;
            onDragAxis(self, e, 'left', dragStartMousePos);
            onDragAxis(self, e, 'top', dragStartMousePos);
            // touchmove frequency is slow on android
        },

        _onDragEnd: function (e) {
            // S.log('dragend: ' + e.timeStamp);
            onDragEndAxis(this, e, 'left');
            onDragEndAxis(this, e, 'top');
        },


        _initStates: function () {
            var self = this;

            self._lastPageXY = {};

            self._lastDirection = {};

            self._swipe = {
                left: {},
                top: {}
            };

            self._startScroll = {};
        },

        _onSetDisabled: function (v) {
            this.dd.set('disabled', v);
        }

    }, {
        ATTRS: {
            /**
             * whether allow drag in x direction when content size is less than container size.
             * Defaults to: true, does not allow.
             */
            /**
             * @ignore
             */
            lockX: {
                value: true
            },
            /**
             * whether allow drag in y direction when content size is less than container size.
             * Defaults to: false, allow.
             */
            /**
             * @ignore
             */
            lockY: {
                value: false
            },
            bounceDuration: {
                value: 0.4
            },
            bounceEasing: {
                value: 'easeOut'
            }
        }
    });

}, {
    requires: ['./base', 'dd/base', 'event']
});

/**
 * @ignore
 * refer
 * - https://developers.google.com/mobile/articles/webapp_fixed_ui
 * - http://yuilibrary.com/yui/docs/scrollview/
 * - http://docs.sencha.com/touch/2-1/#!/api/Ext.dataview.List
 * - http://cubiq.org/iscroll-4
 * - http://developer.apple.com/library/ios/#documentation/uikit/reference/UIScrollView_Class/Reference/UIScrollView.html
 */
