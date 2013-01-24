/**
 * scroller controller
 * @author yiminghe@gmail.com
 */
KISSY.add('scroller/base', function (S, DD, Component, Extension, Render, Event) {

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

    function onDragAxis(self, e, axis, startMousePos) {
        var pageXY = axis == 'left' ? 'pageX' : 'pageY';
        if (self._allowScroll[axis]) {
            var diff = e[pageXY] - startMousePos[axis],
                direction;
            if (self._lastPageXY[pageXY]) {
                direction = ( e[pageXY] - self._lastPageXY[pageXY]) > 0;
            }
            var scroll = self._startScroll[axis] + diff;
            var bound;
            var now = S.now();
            if (scroll < self._minScroll[axis]) {
                bound = self._minScroll[axis] - scroll;
                bound *= OUT_OF_BOUND_FACTOR;
                scroll = self._minScroll[axis] - bound;
            } else if (scroll > self._maxScroll[axis]) {
                bound = scroll - self._maxScroll[axis];
                bound *= OUT_OF_BOUND_FACTOR;
                scroll = self._maxScroll[axis] + bound;
            }

            var timeDiff = (now - self._swipe[axis].startTime);

            // swipe sample
            if (self._lastDirection[axis] !== undefined &&
                self._lastDirection[axis] !== direction ||
                timeDiff > SWIPE_SAMPLE_INTERVAL) {
                self._swipe[axis].startTime = now;
                self._swipe[axis].scroll = scroll;
                S.log('record for swipe: ' + timeDiff + ' : ' + scroll);
            }

            self.set('scroll' + S.ucfirst(axis), scroll);
            self._lastDirection[axis] = direction;
        }
        self._lastPageXY[pageXY] = e[pageXY];
    }

    function onDragEndAxis(self, e, axis) {
        if (!self._allowScroll[axis]) {
            return;
        }
        var scrollAxis = 'scroll' + S.ucfirst(axis);
        var contentEl = self.get('contentEl');
        var scroll = self.get(scrollAxis);

        S.log('drag end: ' + scroll);

        var anim = {}, bound;
        if (scroll < self._minScroll[axis]) {
            bound = self._minScroll[axis];
        } else if (scroll > self._maxScroll[axis]) {
            bound = self._maxScroll[axis];
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
                queue: false
            });
            return;
        }

        var duration = e.timeStamp - self._swipe[axis].startTime;

        S.log('duration: ' + duration);

        if (duration == 0) {
            return;
        }

        var distance = (scroll - self._swipe[axis].scroll);

        S.log('distance: ' + distance);

        if (distance == 0) {
            return;
        }

        var velocity = distance / duration;

        velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);

        S.log('velocity: ' + velocity);

        anim[axis] = {
            fx: {
                frame: makeMomentumFx(self, velocity, scroll,
                    scrollAxis, self._maxScroll[axis],
                    self._minScroll[axis])
            }
        };

        contentEl.animate(anim, {
            duration: 9999,
            queue: false
        });
    }

    var FRICTION = 0.5;
    var ACCELERATION = 30;
    var THETA = Math.log(1 - (FRICTION / 10));
    var ALPHA = THETA / ACCELERATION;
    var SPRING_TENSION = 0.3;

    function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
        var velocity = startVelocity * ACCELERATION;
        var inertia = 1;
        var bounceStartTime = 0;
        return function (anim) {
            var now = S.now(),
                deltaTime,
                value;

            if (inertia) {
                deltaTime = now - anim.startTime;
                // Math.exp(-0.1) -> Math.exp(-999)
                // big -> small
                // 1 -> 0
                var frictionFactor = Math.exp(deltaTime * ALPHA);
                value = parseInt(startScroll - velocity * (1 - frictionFactor) / THETA);
                if (value > minScroll && value < maxScroll) {
                    // inertia
                    if (this.lastValue === value) {
                        this.finished = 1;
                    }
                    this.lastValue = value;
                    self.set(scrollAxis, value);
                    return;
                }
                inertia = 0;
                velocity = velocity * frictionFactor;
                S.log('start bounce: ' + velocity);
                startScroll = value < minScroll ? minScroll : maxScroll;
                bounceStartTime = now;
            } else {
                deltaTime = now - bounceStartTime;
                // bounce
                var theta = (deltaTime / ACCELERATION),
                // long tail hump
                    powTime = theta * Math.exp(-SPRING_TENSION * theta);
                value = parseInt(velocity * powTime);
                if (value === 0) {
                    this.finished = 1;
                }
                self.set(scrollAxis, startScroll + value);
            }
        };
    }

    return Component.Controller.extend([Extension.ContentBox], {

        bindUI: function () {
            var dd = this.dd = new DD.Draggable({
                node: this.get('el'),
                //clickPixelThresh: 0,
                move: 0
            });
            dd.on('dragstart', this._onDragStart, this)
                .on('drag', this._onDrag, this)
                .on('dragend', this._onDragEnd, this);

            this.get('el').on(Event.Gesture.start, this._onGestureStart, this);
        },

        _onGestureStart: function () {
            this.get('contentEl').stop();
        },

        syncUI: function () {
            var el = this.get('el'),
                contentEl = this.get('contentEl');
            var axis = this.get('axis'),
                contentElHeight = contentEl.height() ,
                contentElWidth = contentEl.width(),
                elHeight = el.height(),
                elWidth = el.width();

            if (!axis) {
                axis = '';
                if (contentElHeight > elHeight) {
                    axis += 'y';
                }
                if (contentElWidth > elWidth) {
                    axis += 'x';
                }
            }

            this._allowScroll = {};

            if (axis.indexOf('x') >= 0) {
                this._allowScroll.left = 1;
            }

            if (axis.indexOf('y') >= 0) {
                this._allowScroll.top = 1;
            }

            this._maxScroll = {
                left: 0,
                top: 0
            };

            this._minScroll = {
                left: elWidth - contentElWidth,
                top: elHeight - contentElHeight
            };

            this._initStates();
        },

        _initStates: function () {
            this._lastPageXY = {};

            this._lastDirection = {};

            this._swipe = {
                left: {},
                top: {}
            };

            this._startScroll = {};
        },

        _onDragStart: function (e) {
            S.log('dragstart: ' + e.timeStamp);
            this._initStates();
            onDragStart(this, e, 'left');
            onDragStart(this, e, 'top');
        },

        _onDrag: function (e) {
            S.log('drag: ' + e.timeStamp);
            var startMousePos = this.dd.get('startMousePos');
            onDragAxis(this, e, 'left', startMousePos);
            onDragAxis(this, e, 'top', startMousePos);
        },

        _onDragEnd: function (e) {
            S.log('dragend: ' + e.timeStamp);
            onDragEndAxis(this, e, 'left');
            onDragEndAxis(this, e, 'top');
        },

        destructor: function () {
            this.dd.destroy();
            this.get('contentEl').stop();
        }

    }, {
        ATTRS: {
            axis: {
            },
            scrollLeft: {
                view: 1
            },
            scrollTop: {
                view: 1
            },
            bounceDuration: {
                value: 0.4
            },
            bounceEasing: {
                value: 'easeOut'
            },
            focusable: {
                value: false
            },
            allowTextSelection: {
                value: true
            },
            handleMouseEvents: {
                value: false
            },
            xrender: {
                value: Render
            }
        }
    }, {
        xclass: 'scroller'
    });

}, {
    requires: ['dd/base', 'component/base', 'component/extension', './render', 'event']
});