/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 27 13:24
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

    var SWIPE_SAMPLE_INTERVAL = 300;

    var MAX_SWIPE_VELOCITY = 6;

    function onDragStart(self, e, scrollType) {
        var now = e.timeStamp,
            scroll = self.get('scroll' + S.ucfirst(scrollType));
        self.startScroll[scrollType] = scroll;
        self.swipe[scrollType].startTime = now;
        self.swipe[scrollType].scroll = scroll;
    }

    function onDragScroll(self, e, scrollType, startMousePos) {
        if (forbidDrag(self, scrollType)) {
            return;
        }
        var pageOffsetProperty = scrollType == 'left' ? 'pageX' : 'pageY',
            lastPageXY = self.lastPageXY;
        var diff = e[pageOffsetProperty] - startMousePos[scrollType],
        // touchend == last touchmove
            eqWithLastPoint,
            scroll = self.startScroll[scrollType] - diff,
            bound,
            now = e.timeStamp,
            minScroll = self.minScroll,
            maxScroll = self.maxScroll,
            lastDirection = self.lastDirection,
            swipe = self.swipe,
            direction;
        if (lastPageXY[pageOffsetProperty]) {
            eqWithLastPoint = e[pageOffsetProperty] == lastPageXY[pageOffsetProperty];
            direction = ( e[pageOffsetProperty] - lastPageXY[pageOffsetProperty]) > 0;
        }

        if (!self.get('bounce')) {
            scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
        }

        if (scroll < minScroll[scrollType]) {
            bound = minScroll[scrollType] - scroll;
            bound *= OUT_OF_BOUND_FACTOR;
            scroll = minScroll[scrollType] - bound;
        } else if (scroll > maxScroll[scrollType]) {
            bound = scroll - maxScroll[scrollType];
            bound *= OUT_OF_BOUND_FACTOR;
            scroll = maxScroll[scrollType] + bound;
        }

        var timeDiff = (now - swipe[scrollType].startTime);

        // swipe sample
        if (!eqWithLastPoint && lastDirection[scrollType] !== undefined &&
            lastDirection[scrollType] !== direction || timeDiff > SWIPE_SAMPLE_INTERVAL) {
            swipe[scrollType].startTime = now;
            swipe[scrollType].scroll = scroll;
            // S.log('record for swipe: ' + timeDiff + ' : ' + scroll);
        }

        self.set('scroll' + S.ucfirst(scrollType), scroll);
        lastDirection[scrollType] = direction;

        lastPageXY[pageOffsetProperty] = e[pageOffsetProperty];
    }

    function forbidDrag(self, scrollType) {
        var lockXY = scrollType == 'left' ? 'lockX' : 'lockY';
        if (!self.allowScroll[scrollType] && self.get(lockXY)) {
            return 1;
        }
        return 0;
    }

    function onDragEndAxis(self, e, scrollType, endCallback) {
        if (forbidDrag(self, scrollType)) {
            endCallback();
            return;
        }
        var scrollAxis = 'scroll' + S.ucfirst(scrollType),
            $contentEl = self.$contentEl,
            scroll = self.get(scrollAxis),
            anim = {},
            minScroll = self.minScroll,
            maxScroll = self.maxScroll,
            now = e.timeStamp,
            swipe = self.swipe,
            bound;
        if (scroll < minScroll[scrollType]) {
            bound = minScroll[scrollType];
        } else if (scroll > maxScroll[scrollType]) {
            bound = maxScroll[scrollType];
        }
        if (bound !== undefined) {
            var scrollCfg = {};
            scrollCfg[scrollType] = bound;
            self.scrollTo(scrollCfg, {
                duration: self.get('bounceDuration'),
                easing: self.get('bounceEasing'),
                queue: false,
                complete: endCallback
            });
            return;
        }

        if (self.pagesOffset) {
            endCallback();
            return;
        }

        var duration = now - swipe[scrollType].startTime;
        var distance = (scroll - swipe[scrollType].scroll);

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

        anim[scrollType] = {
            fx: {
                frame: makeMomentumFx(self, velocity, scroll,
                    scrollAxis, maxScroll[scrollType],
                    minScroll[scrollType])
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
        self.startMousePos = self.dd.get('startMousePos');
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

        if (!startMousePos) {
            return;
        }

        var lockX = self.get('lockX'),
            lockY = self.get('lockY');

        // if lockX or lockY then do not prevent native scroll on some condition
        if (lockX || lockY) {
            var dragInitDirection;

            if (!(dragInitDirection = self.dragInitDirection)) {
                self.dragInitDirection = dragInitDirection = Math.abs(
                    e.pageX - startMousePos.left
                ) > Math.abs(
                    e.pageY - startMousePos.top
                ) ? 'left' : 'top';
            }

            if (lockX && dragInitDirection == 'left' && !self.allowScroll[dragInitDirection]) {
                self.dd.stopDrag();
                return;
            }

            if (lockY && dragInitDirection == 'top' && !self.allowScroll[dragInitDirection]) {
                self.dd.stopDrag();
                return;
            }
        }

        e.preventDefault();
        e.domEvent.preventDefault();

        onDragScroll(self, e, 'left', startMousePos);
        onDragScroll(self, e, 'top', startMousePos);

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
        if (!startMousePos) {
            return;
        }
        var offsetX = startMousePos.left - e.pageX;
        var offsetY = startMousePos.top - e.pageY;
        var snapThreshold = self.get('snapThreshold');
        var allowX = self.allowScroll.left && Math.abs(offsetX) > snapThreshold;
        var allowY = self.allowScroll.top && Math.abs(offsetY) > snapThreshold;

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

                if (!self.pagesOffset) {
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

                var pagesOffset = self.pagesOffset.concat([]);

                self.isScrolling = 0;

                if (allowX || allowY) {
                    if (allowX && allowY) {
                        var prepareX = [],
                            newPageIndex = undefined;
                        var nowXY = {
                            left: scrollLeft,
                            top: scrollTop
                        };
                        S.each(pagesOffset, function (offset) {
                            if (!offset) {
                                return;
                            }
                            if (offsetX > 0 && offset.left > nowXY.left) {
                                prepareX.push(offset);
                            } else if (offsetX < 0 && offset.left < nowXY.left) {
                                prepareX.push(offset);
                            }
                        });
                        var min;
                        if (offsetY > 0) {
                            min = Number.MAX_VALUE;
                            S.each(prepareX, function (x) {
                                if (x.top > nowXY.top) {
                                    if (min < x.top - nowXY.top) {
                                        min = x.top - nowXY.top;
                                        newPageIndex = prepareX.index;
                                    }
                                }
                            });
                        } else {
                            min = Number.MAX_VALUE;
                            S.each(prepareX, function (x) {
                                if (x.top < nowXY.top) {
                                    if (min < nowXY.top - x.top) {
                                        min = nowXY.top - x.top;
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
                        if (allowX || allowY) {
                            var toPageIndex = self._getPageIndexFromXY(
                                allowX ? scrollLeft : scrollTop, allowX,
                                allowX ? offsetX : offsetY);
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

        self.startMousePos = null;

        self.startScroll = {};

        self.dragInitDirection = null;
    }

    return ScrollViewBase.extend({
            bindUI: function () {
                var self = this,
                    $contentEl = self.$contentEl;
                // before dd
                $contentEl.on(Gesture.start, onSingleGestureStart, self);
                var dd = self.dd = new DD.Draggable({
                    node: $contentEl,
                    groups: false,
                    // do not prevent native scroll on some condition
                    preventDefaultOnMove: false,
                    // allow nested scroll-view
                    halt: true
                });
                dd.on('dragstart', onDragStartHandler, self)
                    .on('drag', onDragHandler, self)
                    .on('dragend', onDragEndHandler, self);
            },

            syncUI: function () {
                initStates(this);
            },

            destructor: function () {
                this.dd.destroy();
                this.stopAnimation();
            },

            stopAnimation: function () {
                this.callSuper();
                // stop dd
                // in case pinch setting scrollLeft conflicts with dd setting scrollLeft
                this.dd.stopDrag();
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
                bounce: {
                    value: true
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

