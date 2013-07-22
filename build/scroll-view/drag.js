/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 22 18:42
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 scroll-view/drag
*/

/**
 * allow body to drag
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/drag', function (S, ScrollViewBase, DD, Node) {

    var OUT_OF_BOUND_FACTOR = 0.5;

    var Gesture = Node.Gesture;

    var singleTouchStart = Gesture.singleTouchStart;

    var SWIPE_SAMPLE_INTERVAL = 300;

    var MAX_SWIPE_VELOCITY = 6;

    function onDragStart(self, e, axis) {
        var now = e.timeStamp,
            scroll = self.get('scroll' + S.ucfirst(axis));
        self.startScroll[axis] = scroll;
        self.swipe[axis].startTime = now;
        self.swipe[axis].scroll = scroll;
    }

    function onDragAxis(self, e, axis, startMousePos) {
        if (forbidDrag(self, axis)) {
            return;
        }
        var pageXy = axis == 'left' ? 'pageX' : 'pageY',
            lastPageXY = self.lastPageXY;
        var diff = e[pageXy] - startMousePos[axis],
        // touchend == last touchmove
            eqWithLastPoint,
            scroll = self.startScroll[axis] - diff,
            bound,
            now = e.timeStamp,
            minScroll = self.minScroll,
            maxScroll = self.maxScroll,
            lastDirection = self.lastDirection,
            swipe = self.swipe,
            direction;
        if (lastPageXY[pageXy]) {
            eqWithLastPoint = e[pageXy] == lastPageXY[pageXy];
            direction = ( e[pageXy] - lastPageXY[pageXy]) > 0;
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

        var timeDiff = (now - swipe[axis].startTime);

        // swipe sample
        if (!eqWithLastPoint && lastDirection[axis] !== undefined &&
            lastDirection[axis] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL) {
            swipe[axis].startTime = now;
            swipe[axis].scroll = scroll;
            // S.log('record for swipe: ' + timeDiff + ' : ' + scroll);
        }

        self.set(axis == 'left' ? 'scrollLeft' : 'scrollTop', scroll);
        lastDirection[axis] = direction;

        lastPageXY[pageXy] = e[pageXy];
    }

    function forbidDrag(self, axis) {
        var lockXY = axis == 'left' ? 'lockX' : 'lockY';
        if (!self.allowScroll[axis] && self.get(lockXY)) {
            return 1;
        }
        return 0;
    }

    function onDragEndAxis(self, e, axis, endCallback) {
        if (forbidDrag(self, axis)) {
            endCallback();
            return;
        }
        var isX = axis == 'left',
            scrollAxis = 'scroll' + (isX ? 'Left' : 'Top'),
            $contentEl = self.$contentEl,
            scroll = self.get(scrollAxis),
            anim = {},
            minScroll = self.minScroll,
            maxScroll = self.maxScroll,
            now = e.timeStamp,
            swipe = self.swipe,
            bound;
        if (scroll < minScroll[axis]) {
            bound = minScroll[axis];
        } else if (scroll > maxScroll[axis]) {
            bound = maxScroll[axis];
        }
        if (bound !== undefined) {
            var scrollCfg = {};
            scrollCfg[axis] = bound;
            self.scrollTo(scrollCfg, {
                duration: self.get('bounceDuration'),
                easing: self.get('bounceEasing'),
                queue: false,
                complete: endCallback
            });
            return;
        }

        if (self.pagesXY) {
            endCallback();
            return;
        }

        var duration = now - swipe[axis].startTime;
        var distance = (scroll - swipe[axis].scroll);

        // S.log('duration: ' + duration);

        if (duration == 0 || distance == 0) {
            endCallback();
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

        $contentEl.animate(anim, {
            duration: 9999,
            queue: false,
            complete: endCallback
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

    function onSingleGestureStart(e) {
        var self = this;
        self.stopAnimation();
        if (self.isScrolling) {
            var pageIndex = self.get('pageIndex');
            self.isScrolling = 0;
            self.fire('scrollEnd', {
                pageX: e.pageX,
                pageY: e.pageY,
                fromPageIndex: pageIndex,
                pageIndex: pageIndex
            });
        }
    }

    function onDragStartHandler(e) {
        // S.log('dragstart: ' + e.timeStamp);
        var self = this;
        initStates(self);
        self.startMousePos = {
            left: e.pageX,
            top: e.pageY
        };
        onDragStart(self, e, 'left');
        onDragStart(self, e, 'top');
        self.fire('scrollStart', {
            pageX: e.pageX,
            pageY: e.pageY
        });
        self.isScrolling = 1;
    }

    function onDragHandler(e) {
        var self = this,
            startMousePos = self.startMousePos;
        onDragAxis(self, e, 'left', startMousePos);
        onDragAxis(self, e, 'top', startMousePos);
        // touchmove frequency is slow on android
        self.fire('scrollMove', {
            pageX: e.pageX,
            pageY: e.pageY
        });
    }

    function onDragEndHandler(e) {
        var self = this;
        var count = 0;
        var startMousePos = self.startMousePos;
        var xDirection = startMousePos.left - e.pageX;
        var yDirection = startMousePos.top - e.pageY;
        var snapThreshold = self.get('snapThreshold');
        var xValid = Math.abs(xDirection) > snapThreshold;
        var yValid = Math.abs(yDirection) > snapThreshold;
        var allowX = self.allowScroll.left;
        var allowY = self.allowScroll.top;

        self.fire('dragend', {
            pageX: e.pageX,
            pageY: e.pageY
        });

        function endCallback() {
            count++;
            if (count == 2) {
                function scrollEnd() {
                    self.fire('scrollEnd', {
                        pageX: e.pageX,
                        pageY: e.pageY,
                        fromPageIndex: pageIndex,
                        pageIndex: self.get('pageIndex')
                    });
                }

                if (!self.pagesXY) {
                    scrollEnd();
                    return;
                }

                var snapThreshold = self.get('snapThreshold');
                var snapDuration = self.get('snapDuration');
                var snapEasing = self.get('snapEasing');
                var pageIndex = self.get('pageIndex');
                var scrollLeft = self.get('scrollLeft');
                var scrollTop = self.get('scrollTop');

                var animCfg = {
                    duration: snapDuration,
                    easing: snapEasing,
                    complete: scrollEnd
                };

                var pagesXY = self.pagesXY.concat([]);

                self.isScrolling = 0;

                if (allowX || allowY) {
                    if (allowX && allowY && xValid && yValid) {
                        var prepareX = [],
                            newPageIndex = undefined;
                        var nowXY = {
                            x: scrollLeft,
                            y: scrollTop
                        };
                        S.each(pagesXY, function (xy) {
                            if (!xy) {
                                return;
                            }
                            if (xDirection > 0 && xy.x > nowXY.x) {
                                prepareX.push(xy);
                            } else if (xDirection < 0 && xy.x < nowXY.x) {
                                prepareX.push(xy);
                            }
                        });
                        var min;
                        if (yDirection > 0) {
                            min = Number.MAX_VALUE;
                            S.each(prepareX, function (x) {
                                if (x.y > nowXY.y) {
                                    if (min < x.y - nowXY.y) {
                                        min = x.y - nowXY.y;
                                        newPageIndex = prepareX.index;
                                    }
                                }
                            });
                        } else {
                            min = Number.MAX_VALUE;
                            S.each(prepareX, function (x) {
                                if (x.y < nowXY.y) {
                                    if (min < nowXY.y - x.y) {
                                        min = nowXY.y - x.y;
                                        newPageIndex = prepareX.index;
                                    }
                                }
                            });
                        }
                        if (newPageIndex != undefined) {
                            if (newPageIndex != pageIndex) {
                                self.scrollToPage(newPageIndex, animCfg);
                            } else {
                                self.scrollToPage(newPageIndex);
                                scrollEnd();
                            }
                        } else {
                            scrollEnd();
                        }
                    } else {
                        if (allowX && xValid || allowY && yValid) {
                            var toPageIndex = self._getPageIndexFromXY(
                                allowX ? scrollLeft : scrollTop, allowX,
                                allowX ? xDirection : yDirection);
                            self.scrollToPage(toPageIndex, animCfg);
                        } else {
                            self.scrollToPage(self.get('pageIndex'));
                            scrollEnd();
                        }
                    }
                }
            }
        }

        onDragEndAxis(self, e, 'left', endCallback);
        onDragEndAxis(self, e, 'top', endCallback);
    }

    function initStates(self) {
        self.lastPageXY = {};

        self.lastDirection = {};

        self.swipe = {
            left: {},
            top: {}
        };

        self.startScroll = {};
    }

    return ScrollViewBase.extend({

            bindUI: function () {
                var self = this,
                    $contentEl = self.$contentEl,
                    dd = self.dd = new DD.Draggable({
                        node: $contentEl,
                        groups: false,
                        // allow nested scroll-view
                        halt: true
                    });
                dd.on('dragstart', onDragStartHandler, self)
                    .on('drag', onDragHandler, self)
                    .on('dragend', onDragEndHandler, self);

                self.get('el').on(singleTouchStart, onSingleGestureStart, self);
                $contentEl.on(singleTouchStart, onSingleGestureStart, self);
            },


            syncUI: function () {
                initStates(this);
            },

            destructor: function () {
                this.dd.destroy();
                this.stopAnimation();
            },

            _onSetDisabled: function (v) {
                this.dd.set('disabled', v);
            }

        },
        {
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
                snapThreshold: {
                    value: 5
                },
                bounceDuration: {
                    value: 0.4
                },
                bounceEasing: {
                    value: 'easeOut'
                }
            },
            xclass: 'scroll-view'
        }
    );

}, {
    requires: ['./base', 'dd', 'node']
});

/**
 * @ignore
 * refer
 * - https://developers.google.com/mobile/articles/webapp_fixed_ui
 * - http://yuilibrary.com/yui/docs/scroll-view/
 * - http://docs.sencha.com/touch/2-1/#!/api/Ext.dataview.List
 * - http://cubiq.org/iscroll-4
 * - http://developer.apple.com/library/ios/#documentation/uikit/reference/UIScrollView_Class/Reference/UIScrollView.html
 */

