/**
 * scrollview controller
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base/control', function (S, DOM, DD, Component, Extension, Render, Event) {

    var undefined = undefined;

    var $ = S.all;

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

    function onDragAxis(self, e, axis, startMousePos) {
        var pageXY = axis == 'left' ? 'pageX' : 'pageY';
        if (self._allowScroll[axis]) {
            var diff = e[pageXY] - startMousePos[axis],
            // touchend == last touchmove
                eqWithLastPoint,
                direction;
            if (self._lastPageXY[pageXY]) {
                eqWithLastPoint = e[pageXY] == self._lastPageXY[pageXY];
                direction = ( e[pageXY] - self._lastPageXY[pageXY]) > 0;
            }
            var scroll = self._startScroll[axis] - diff;
            var bound;
            var now = e.timeStamp;
            if (scroll < self.minScroll[axis]) {
                bound = self.minScroll[axis] - scroll;
                bound *= OUT_OF_BOUND_FACTOR;
                scroll = self.minScroll[axis] - bound;
            } else if (scroll > self.maxScroll[axis]) {
                bound = scroll - self.maxScroll[axis];
                bound *= OUT_OF_BOUND_FACTOR;
                scroll = self.maxScroll[axis] + bound;
            }

            var timeDiff = (now - self._swipe[axis].startTime);

            // swipe sample
            if (!eqWithLastPoint &&
                self._lastDirection[axis] !== undefined &&
                self._lastDirection[axis] !== direction ||
                timeDiff > SWIPE_SAMPLE_INTERVAL) {
                self._swipe[axis].startTime = now;
                self._swipe[axis].scroll = scroll;
                // S.log('record for swipe: ' + timeDiff + ' : ' + scroll);
            }

            self.set(axis == 'left' ? 'scrollLeft' : 'scrollTop', scroll);
            self._lastDirection[axis] = direction;
        }
        self._lastPageXY[pageXY] = e[pageXY];
    }

    function fireScrollEnd(self, xy) {
        self.fire('scrollEnd', {
            axis: xy
        });
    }

    function onDragEndAxis(self, e, axis) {
        if (!self._allowScroll[axis]) {
            return;
        }
        var scrollAxis = 'scroll' + S.ucfirst(axis);
        var contentEl = self.get('contentEl');
        var scroll = self.get(scrollAxis);
        var xy = axis == 'left' ? 'x' : 'y';

        // S.log('drag end: ' + scroll);

        var anim = {}, bound;
        if (scroll < self.minScroll[axis]) {
            bound = self.minScroll[axis];
        } else if (scroll > self.maxScroll[axis]) {
            bound = self.maxScroll[axis];
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
                    fireScrollEnd(self, xy);
                }
            });
            return;
        }

        var duration = e.timeStamp - self._swipe[axis].startTime;

        // S.log('duration: ' + duration);

        if (duration == 0) {
            fireScrollEnd(self, xy);
            return;
        }

        var distance = (scroll - self._swipe[axis].scroll);

        // S.log('distance: ' + distance);

        if (distance == 0) {
            fireScrollEnd(self, xy);
            return;
        }

        // duration is too long in android when momentum
        // touchend time - touchstart time
        // sencha solve this problem, but i do not know how!
        // hack!
        if (S.UA.android && duration > 50) {
            // duration -= 50;
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
                    scrollAxis, self.maxScroll[axis],
                    self.minScroll[axis])
            }
        };

        contentEl.animate(anim, {
            duration: 9999,
            queue: false,
            complete: function () {
                fireScrollEnd(self, xy);
            }
        });
    }

    var FRICTION = 0.5;
    var ACCELERATION = 30;
    var THETA = Math.log(1 - (FRICTION / 10));
    var ALPHA = THETA / ACCELERATION;
    var SPRING_TENSION = 0.3;

    function constrain(v, max, min) {
        return Math.min(Math.max(v, min), max);
    }

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
                    this.finished = 1;
                }
                self.set(scrollAxis, startScroll + value);
            }
        };
    }

    return Component.Controller.extend([Extension.ContentBox], {

        bindUI: function () {
            var el = this.get('el');
            if (this.get('allowDrag')) {
                var dd = this.dd = new DD.Draggable({
                    node: this.get('el'),
                    // allow nested scrollview
                    halt: true,
                    move: 0
                });
                dd.on('dragstart', this._onDragStart, this)
                    .on('drag', this._onDrag, this)
                    .on('dragend', this._onDragEnd, this);

                el.on(Event.Gesture.start, this._onGestureStart, this);
            }
            el.on('mousewheel', this._onMouseWheel, this);
            // textarea enter cause el to scroll
            // bug: left top scroll does not fire scroll event, because scrollTop is 0!
            el.on('scroll', this._onElScroll, this);
            $(DOM.getWindow(el[0].document))
                .on('resize orientationchange', S.UA.ie < 9 ?
                    S.buffer(this.sync, 30) :
                    this.sync, this);
        },

        _onElScroll: function () {
            var el = this.get('el'),
                scrollTop = el[0].scrollTop,
                scrollLeft = el[0].scrollLeft;
            if (scrollTop)
                this.set('scrollTop', scrollTop + this.get('scrollTop'));
            if (scrollLeft)
                this.set('scrollLeft', scrollLeft + this.get('scrollLeft'));
            el[0].scrollTop = el[0].scrollLeft = 0;
        },

        handleKeyEventInternal: function (e) {
            var nodeName = e.target.nodeName.toLowerCase();
            // editable element
            if (nodeName == 'input' ||
                nodeName == 'textarea' ||
                nodeName == 'select' ||
                DOM.hasAttr(e.target, 'contenteditable')) {
                return undefined;
            }
            var keyCode = e.keyCode;
            var allowX = this.isAxisEnabled('x');
            var allowY = this.isAxisEnabled('y');
            var minScroll = this.minScroll;
            var maxScroll = this.maxScroll;
            var scrollStep = this.scrollStep;
            var isMax, isMin;
            var ok = 0;
            if (allowY) {
                var scrollStepY = scrollStep.top;
                var clientHeight = this.clientHeight;
                var scrollTop = this.get('scrollTop');
                isMax = scrollTop == maxScroll.top;
                isMin = scrollTop == minScroll.top;
                if (keyCode == KeyCodes.DOWN) {
                    if (isMax) {
                        return undefined;
                    }
                    this.scrollTo(undefined, scrollTop + scrollStepY);
                    ok = 1;
                } else if (keyCode == KeyCodes.UP) {
                    if (isMin) {
                        return undefined;
                    }
                    this.scrollTo(undefined, scrollTop - scrollStepY);
                    ok = 1;
                } else if (keyCode == KeyCodes.PAGE_DOWN) {
                    if (isMax) {
                        return undefined;
                    }
                    this.scrollTo(undefined, scrollTop + clientHeight);
                    ok = 1;
                } else if (keyCode == KeyCodes.PAGE_UP) {
                    if (isMin) {
                        return undefined;
                    }
                    this.scrollTo(undefined, scrollTop - clientHeight);
                    ok = 1;
                }
            }
            if (allowX) {
                var scrollStepX = scrollStep.left;
                var scrollLeft = this.get('scrollLeft');
                isMax = scrollLeft == maxScroll.left;
                isMin = scrollLeft == minScroll.left;
                if (keyCode == KeyCodes.RIGHT) {
                    if (isMax) {
                        return undefined;
                    }
                    this.scrollTo(scrollLeft + scrollStepX);
                    ok = 1;
                } else if (keyCode == KeyCodes.LEFT) {
                    if (isMin) {
                        return undefined;
                    }
                    this.scrollTo(scrollLeft - scrollStepX);
                    ok = 1;
                }
            }

            if (ok) {
                // allow nested
                return true;
            }
            return undefined;
        },

        _onMouseWheel: function (e) {
            var max,
                min,
                scrollStep = this.scrollStep,
                deltaY,
                deltaX,
                maxScroll = this.maxScroll,
                minScroll = this.minScroll;

            if ((deltaY = e.deltaY) && this.isAxisEnabled('y')) {
                var scrollTop = this.get('scrollTop');
                max = maxScroll.top;
                min = minScroll.top;
                if (scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0) {
                } else {
                    this.scrollTo(undefined, scrollTop - e.deltaY * scrollStep['top']);
                    e.preventDefault();
                }
            }

            if ((deltaX = e.deltaX) && this.isAxisEnabled('x')) {
                var scrollLeft = this.get('scrollLeft');
                max = maxScroll.left;
                min = minScroll.left;
                if (scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0) {
                } else {
                    this.scrollTo(scrollLeft - e.deltaX * scrollStep['left']);
                    e.preventDefault();
                }
            }
        },

        _onGestureStart: function () {
            this._stopMomentumAnim();
        },

        syncUI: function () {
            var domEl = this.get('el')[0];
            var domContentEl = this.get('contentEl')[0];
            var axis = this.get('axis'),
                scrollHeight = Math.max(domEl.scrollHeight, domContentEl.offsetHeight),
            // contentEl[0].scrollWidth is same with el.innerWidth()!
                scrollWidth = Math.max(domEl.scrollWidth, domContentEl.offsetWidth) ,
                clientHeight = domEl.clientHeight,
                clientWidth = domEl.clientWidth;

            this.scrollHeight = scrollHeight;
            this.scrollWidth = scrollWidth;
            this.clientHeight = clientHeight;
            this.clientWidth = clientWidth;

            if (!axis) {
                axis = '';
                if (scrollHeight > clientHeight) {
                    axis += 'y';
                }
                if (scrollWidth > clientWidth) {
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

            this.minScroll = {
                left: 0,
                top: 0
            };

            this.maxScroll = {
                left: scrollWidth - clientWidth,
                top: scrollHeight - clientHeight
            };

            var elDoc = $(domEl.ownerDocument);

            this.scrollStep = {
                top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20),
                left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)
            };

            this._initStates();

            var scrollLeft = this.get('scrollLeft'),
                scrollTop = this.get('scrollTop');

            // in case content is reduces
            this.scrollTo(scrollLeft, scrollTop);
        },

        'isAxisEnabled': function (axis) {
            axis = axis == 'x' ? 'left' : 'top';
            return this._allowScroll[axis];
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
            // S.log('dragstart: ' + e.timeStamp);
            this._initStates();
            onDragStart(this, e, 'left');
            onDragStart(this, e, 'top');
            this.fire('scrollStart');
        },

        _onDrag: function (e) {
            // S.log('drag: ' + e.timeStamp);
            var startMousePos = this.dd.get('startMousePos');
            onDragAxis(this, e, 'left', startMousePos);
            onDragAxis(this, e, 'top', startMousePos);
            // touchmove frequency is slow on android
        },

        _onDragEnd: function (e) {
            // S.log('dragend: ' + e.timeStamp);
            onDragEndAxis(this, e, 'left');
            onDragEndAxis(this, e, 'top');
        },

        _stopMomentumAnim: function () {
            this.get('contentEl').stop();
        },

        destructor: function () {
            if (this.dd) {
                this.dd.destroy();
            }
            this._stopMomentumAnim();
        },

        scrollTo: function (left, top) {
            this._stopMomentumAnim();
            var maxScroll = this.maxScroll,
                minScroll = this.minScroll;
            if (left != undefined) {
                left = constrain(left, maxScroll.left, minScroll.left);
                this.set('scrollLeft', left);
            }
            if (top != undefined) {
                top = constrain(top, maxScroll.top, minScroll.top);
                this.set('scrollTop', top);
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
                value: S.Features.isTouchSupported()
            },
            bounceDuration: {
                value: 0.4
            },
            bounceEasing: {
                value: 'easeOut'
            },
            focusable: {
                // need process keydown
                value: !S.Features.isTouchSupported()
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