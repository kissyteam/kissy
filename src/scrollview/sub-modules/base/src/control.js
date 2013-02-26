/**
 * scrollview controller
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base/control', function (S, DOM, DD, Component, Extension, Render, Event) {

    var undefined = undefined;

    var $ = S.all;

    var isTouchSupported = S.Features.isTouchSupported();

    var OUT_OF_BOUND_FACTOR = 0.5;

    var SWIPE_SAMPLE_INTERVAL = 300;

    var MAX_SWIPE_VELOCITY = 6;

    var KeyCodes = Event.KeyCodes;

    function onDragStart(self, e, axis) {
        var now = e.timeStamp,
            scroll = self.get('scroll' + S.ucfirst(axis));
        self._startScroll[axis] = scroll;
        self._swipe[axis].startTime = now;
        self._swipe[axis].scroll = scroll;
    }

    function onDragAxis(self, e, axis, dragStartMousePos) {
        var pageXY = axis == 'left' ? 'pageX' : 'pageY',
            _lastPageXY = self._lastPageXY;
        if (self._allowScroll[axis]) {
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
        }
        _lastPageXY[pageXY] = e[pageXY];
    }

    function fireScrollEnd(self, xy, e) {
        self.fire('scrollEnd', {
            axis: xy,
            pageX: e.pageX,
            pageY: e.pageY
        });
    }

    function onDragEndAxis(self, e, axis) {
        if (!self._allowScroll[axis]) {
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

    function constrain(v, max, min) {
        return Math.min(Math.max(v, min), max);
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
                    powTime = theta * Math.exp(-SPRING_TENSION * theta);
                value = parseInt(velocity * powTime);
                if (value === 0) {
                    fx.finished = 1;
                }
                self.set(scrollAxis, startScroll + value);
            }
        };
    }

    return Component.Controller.extend([Extension.ContentBox], {

        bindUI: function () {
            var self = this,
                el = self.get('el');
            if (self.get('allowDrag')) {
                var dd = self.dd = new DD.Draggable({
                    node: el,
                    groups: false,
                    // allow nested scrollview
                    halt: true
                });
                dd.on('dragstart', self._onDragStart, self)
                    .on('drag', self._onDrag, self)
                    .on('dragend', self._onDragEnd, self);

                el.on(Event.Gesture.start, self._onGestureStart, self);
            }
            el.on('mousewheel', self._onMouseWheel, self);
            // textarea enter cause el to scroll
            // bug: left top scroll does not fire scroll event, because scrollTop is 0!
            el.on('scroll', self._onElScroll, self);
        },

        _onElScroll: function () {
            var self = this,
                el = self.get('el'),
                domEl = el[0],
                scrollTop = domEl.scrollTop,
                scrollLeft = domEl.scrollLeft;
            if (scrollTop) {
                self.set('scrollTop', scrollTop + self.get('scrollTop'));
            }
            if (scrollLeft) {
                self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
            }
            domEl.scrollTop = domEl.scrollLeft = 0;
        },

        handleKeyEventInternal: function (e) {
            // no need to process disabled (already processed by Component)
            var target = e.target,
                nodeName = DOM.nodeName(target);
            // editable element
            if (nodeName == 'input' ||
                nodeName == 'textarea' ||
                nodeName == 'select' ||
                DOM.hasAttr(target, 'contenteditable')) {
                return undefined;
            }
            var self = this,
                keyCode = e.keyCode,
                allowX = self.isAxisEnabled('x'),
                allowY = self.isAxisEnabled('y'),
                minScroll = self.minScroll,
                maxScroll = self.maxScroll,
                scrollStep = self.scrollStep,
                isMax, isMin,
                ok = undefined;
            if (allowY) {
                var scrollStepY = scrollStep.top,
                    clientHeight = self.clientHeight,
                    scrollTop = self.get('scrollTop');
                isMax = scrollTop == maxScroll.top;
                isMin = scrollTop == minScroll.top;
                if (keyCode == KeyCodes.DOWN) {
                    if (isMax) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop + scrollStepY);
                    ok = true;
                } else if (keyCode == KeyCodes.UP) {
                    if (isMin) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop - scrollStepY);
                    ok = true;
                } else if (keyCode == KeyCodes.PAGE_DOWN) {
                    if (isMax) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop + clientHeight);
                    ok = true;
                } else if (keyCode == KeyCodes.PAGE_UP) {
                    if (isMin) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop - clientHeight);
                    ok = true;
                }
            }
            if (allowX) {
                var scrollStepX = scrollStep.left,
                    scrollLeft = self.get('scrollLeft');
                isMax = scrollLeft == maxScroll.left;
                isMin = scrollLeft == minScroll.left;
                if (keyCode == KeyCodes.RIGHT) {
                    if (isMax) {
                        return undefined;
                    }
                    self.scrollTo(scrollLeft + scrollStepX);
                    ok = true;
                } else if (keyCode == KeyCodes.LEFT) {
                    if (isMin) {
                        return undefined;
                    }
                    self.scrollTo(scrollLeft - scrollStepX);
                    ok = true;
                }
            }
            return ok;
        },

        _onMouseWheel: function (e) {
            if (this.get('disabled')) {
                return;
            }
            var max,
                min,
                self = this,
                scrollStep = self.scrollStep,
                deltaY,
                deltaX,
                maxScroll = self.maxScroll,
                minScroll = self.minScroll;

            if ((deltaY = e.deltaY) && self.isAxisEnabled('y')) {
                var scrollTop = self.get('scrollTop');
                max = maxScroll.top;
                min = minScroll.top;
                if (scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0) {
                } else {
                    self.scrollTo(undefined, scrollTop - e.deltaY * scrollStep['top']);
                    e.preventDefault();
                }
            }

            if ((deltaX = e.deltaX) && self.isAxisEnabled('x')) {
                var scrollLeft = self.get('scrollLeft');
                max = maxScroll.left;
                min = minScroll.left;
                if (scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0) {
                } else {
                    self.scrollTo(scrollLeft - e.deltaX * scrollStep['left']);
                    e.preventDefault();
                }
            }
        },

        _onGestureStart: function () {
            this.stopAnimation();
        },

        syncUI: function () {
            var self = this,
                domEl = this.get('el')[0],
                domContentEl = this.get('contentEl')[0],
                axis = this.get('axis'),
                scrollHeight = Math.max(domEl.scrollHeight, domContentEl.offsetHeight),
            // contentEl[0].scrollWidth is same with el.innerWidth()!
                scrollWidth = Math.max(domEl.scrollWidth, domContentEl.offsetWidth) ,
                clientHeight = domEl.clientHeight,
                _allowScroll,
                clientWidth = domEl.clientWidth;

            self.scrollHeight = scrollHeight;
            self.scrollWidth = scrollWidth;
            self.clientHeight = clientHeight;
            self.clientWidth = clientWidth;

            if (!axis) {
                axis = '';
                if (scrollHeight > clientHeight) {
                    axis += 'y';
                }
                if (scrollWidth > clientWidth) {
                    axis += 'x';
                }
            }

            _allowScroll = self._allowScroll = {};

            if (axis.indexOf('x') >= 0) {
                _allowScroll.left = 1;
            }

            if (axis.indexOf('y') >= 0) {
                _allowScroll.top = 1;
            }

            self.minScroll = {
                left: 0,
                top: 0
            };

            self.maxScroll = {
                left: scrollWidth - clientWidth,
                top: scrollHeight - clientHeight
            };

            var elDoc = $(domEl.ownerDocument);

            self.scrollStep = {
                top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20),
                left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)
            };

            self._initStates();

            var scrollLeft = self.get('scrollLeft'),
                scrollTop = self.get('scrollTop');

            // in case content is reduces
            self.scrollTo(scrollLeft, scrollTop);
        },

        'isAxisEnabled': function (axis) {
            return this._allowScroll[axis == 'x' ? 'left' : 'top'];
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

        stopAnimation: function () {
            this.get('contentEl').stop();
        },

        destructor: function () {
            if (this.dd) {
                this.dd.destroy();
            }
            this.stopAnimation();
        },

        scrollTo: function (left, top) {
            var self = this,
                maxScroll = self.maxScroll,
                minScroll = self.minScroll;
            self.stopAnimation();
            if (left != undefined) {
                left = constrain(left, maxScroll.left, minScroll.left);
                self.set('scrollLeft', left);
            }
            if (top != undefined) {
                top = constrain(top, maxScroll.top, minScroll.top);
                self.set('scrollTop', top);
            }
        },

        _onSetDisabled: function (v) {
            if (this.dd) {
                this.dd.set('disabled', v);
            }
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
            /**
             * whether allow drag for scrollview.
             * Defaults: true for touch device, false for non-touch device.
             * @cfg {Boolean} allowDrag
             */
            /**
             * @ignore
             */
            allowDrag: {
                value: isTouchSupported
            },
            bounceDuration: {
                value: 0.4
            },
            bounceEasing: {
                value: 'easeOut'
            },
            focusable: {
                // need process keydown
                value: !isTouchSupported
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
        xclass: 'scrollview'
    });

}, {
    requires: ['dom', 'dd/base', 'component/base', 'component/extension', './render', 'event']
});