/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:05
*/
/*
combined modules:
scroll-view/touch
*/
KISSY.add('scroll-view/touch', [
    'util',
    './base',
    'anim/timer',
    'event/gesture/basic',
    'event/gesture/pan'
], function (S, require, exports, module) {
    /**
 * @ignore
 * allow body to drag
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var ScrollViewBase = require('./base');
    var TimerAnim = require('anim/timer');
    var OUT_OF_BOUND_FACTOR = 0.5;
    var MAX_SWIPE_VELOCITY = 6;
    var BasicGesture = require('event/gesture/basic');
    var PanGesture = require('event/gesture/pan');
    function onDragScroll(self, e, scrollType) {
        if (forbidDrag(self, scrollType)) {
            return;
        }
        var diff = scrollType === 'left' ? e.deltaX : e.deltaY, scroll = self.startScroll[scrollType] - diff, bound, minScroll = self.minScroll, maxScroll = self.maxScroll;
        if (!self._bounce) {
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
        self.set('scroll' + util.ucfirst(scrollType), scroll);
    }
    function forbidDrag(self, scrollType) {
        var lockXY = scrollType === 'left' ? 'lockX' : 'lockY';
        if (!self.allowScroll[scrollType] && self['_' + lockXY]) {
            return 1;
        }
        return 0;
    }
    function onDragEndAxis(self, e, scrollType, endCallback) {
        if (forbidDrag(self, scrollType)) {
            endCallback();
            return;
        }
        var scrollAxis = 'scroll' + util.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, bound;
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
        var velocity = scrollType === 'left' ? -e.velocityX : -e.velocityY;
        velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
        var animCfg = {
                node: {},
                to: {},
                duration: 9999,
                queue: false,
                complete: endCallback,
                frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])
            };
        animCfg.node[scrollType] = scroll;
        animCfg.to[scrollType] = null;
        self.scrollAnims.push(new TimerAnim(animCfg).run());
    }
    var FRICTION = 0.5;
    var ACCELERATION = 20;
    var THETA = Math.log(1 - FRICTION / 10);    // -0.05129329438755058
    // -0.05129329438755058
    var ALPHA = THETA / ACCELERATION;    // -0.0017097764795850194
    // -0.0017097764795850194
    var SPRING_TENSION = 0.3;
    function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
        // velocity>0 touch upward, move downward, scrollTop++
        var velocity = startVelocity * ACCELERATION;
        var inertia = 1;
        var bounceStartTime = 0;
        return function (anim, fx) {
            var now = util.now(), deltaTime, value;
            if (inertia) {
                deltaTime = now - anim.startTime;    // Math.exp(-0.1) -> Math.exp(-999)
                                                     // big -> small
                                                     // 1 -> 0
                // Math.exp(-0.1) -> Math.exp(-999)
                // big -> small
                // 1 -> 0
                var frictionFactor = Math.exp(deltaTime * ALPHA);    // 1 - e^-t
                // 1 - e^-t
                value = parseInt(startScroll + velocity * (1 - frictionFactor) / (0 - THETA), 10);
                if (value > minScroll && value < maxScroll) {
                    // inertia
                    if (fx.lastValue === value) {
                        fx.pos = 1;
                        return;
                    }
                    fx.lastValue = value;
                    self.set(scrollAxis, value);
                    return;
                }
                inertia = 0;
                velocity = velocity * frictionFactor;    // S.log('before bounce value: ' + value);
                                                         // S.log('before bounce startScroll: ' + value);
                                                         // S.log('start bounce velocity: ' + velocity);
                                                         // S.log('before bounce minScroll: ' + minScroll);
                                                         // S.log('before bounce maxScroll: ' + maxScroll);
                // S.log('before bounce value: ' + value);
                // S.log('before bounce startScroll: ' + value);
                // S.log('start bounce velocity: ' + velocity);
                // S.log('before bounce minScroll: ' + minScroll);
                // S.log('before bounce maxScroll: ' + maxScroll);
                startScroll = value <= minScroll ? minScroll : maxScroll;    // S.log('startScroll value: ' + startScroll);
                // S.log('startScroll value: ' + startScroll);
                bounceStartTime = now;
            } else {
                deltaTime = now - bounceStartTime;    // bounce
                // bounce
                var theta = deltaTime / ACCELERATION,
                    // long tail hump
                    // t * e^-t
                    powTime = theta * Math.exp(0 - SPRING_TENSION * theta);
                value = parseInt(velocity * powTime, 10);
                if (value === 0) {
                    fx.pos = 1;
                }
                self.set(scrollAxis, startScroll + value);
            }
        };
    }
    function onDragStartHandler(e) {
        var self = this;    // snap mode can not stop anim in the middle
        // snap mode can not stop anim in the middle
        if (self.isScrolling && self.pagesOffset) {
            return;
        }
        if (onDragPreHandler.call(self, e)) {
            return;
        }
        self.startScroll = {};
        self.dragInitDirection = null;
        self.isScrolling = 1;
        self.startScroll.left = self.get('scrollLeft');
        self.startScroll.top = self.get('scrollTop');
    }
    function onDragPreHandler(e) {
        var self = this;
        if (e.gestureType !== 'touch') {
            return true;
        }
        var lockX = self._lockX, lockY = self._lockY;    // if lockX or lockY then do not prevent native scroll on some condition
        // if lockX or lockY then do not prevent native scroll on some condition
        if (lockX || lockY) {
            var direction = e.direction;
            if (lockX && direction === 'left' && !self.allowScroll[direction]) {
                self.isScrolling = 0;
                if (self._preventDefaultX) {
                    e.preventDefault();
                }
                return true;
            }
            if (lockY && direction === 'top' && !self.allowScroll[direction]) {
                self.isScrolling = 0;
                if (self._preventDefaultY) {
                    e.preventDefault();
                }
                return true;
            }
        }
        e.preventDefault();
    }
    function onDragHandler(e) {
        var self = this;
        if (onDragPreHandler.call(self, e)) {
            return;
        }
        onDragScroll(self, e, 'left');
        onDragScroll(self, e, 'top');
        self.fire('touchMove');
    }
    function onDragEndHandler(e) {
        var self = this;
        if (onDragPreHandler.call(self, e)) {
            return;
        }
        self.fire('touchEnd', {
            pageX: e.pageX,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            pageY: e.pageY,
            velocityX: e.velocityX,
            velocityY: e.velocityY
        });
    }
    function defaultTouchEndHandler(e) {
        var self = this;
        var count = 0;
        var offsetX = -e.deltaX;
        var offsetY = -e.deltaY;
        var snapThreshold = self._snapThresholdCfg;
        var allowX = self.allowScroll.left && Math.abs(offsetX) > snapThreshold;
        var allowY = self.allowScroll.top && Math.abs(offsetY) > snapThreshold;
        function endCallback() {
            count++;
            if (count === 2) {
                var scrollEnd = function () {
                    self.isScrolling = 0;
                    self.fire('scrollTouchEnd', {
                        pageX: e.pageX,
                        pageY: e.pageY,
                        deltaX: -offsetX,
                        deltaY: -offsetY,
                        fromPageIndex: pageIndex,
                        pageIndex: self.get('pageIndex')
                    });
                };
                if (!self.pagesOffset) {
                    scrollEnd();
                    return;
                }
                var snapDuration = self._snapDurationCfg;
                var snapEasing = self._snapEasingCfg;
                var pageIndex = self.get('pageIndex');
                var scrollLeft = self.get('scrollLeft');
                var scrollTop = self.get('scrollTop');
                var animCfg = {
                        duration: snapDuration,
                        easing: snapEasing,
                        complete: scrollEnd
                    };
                var pagesOffset = self.pagesOffset;
                var pagesOffsetLen = pagesOffset.length;
                self.isScrolling = 0;
                if (allowX || allowY) {
                    if (allowX && allowY) {
                        var prepareX = [], i, newPageIndex;
                        var nowXY = {
                                left: scrollLeft,
                                top: scrollTop
                            };
                        for (i = 0; i < pagesOffsetLen; i++) {
                            var offset = pagesOffset[i];
                            if (offset) {
                                if (offsetX > 0 && offset.left > nowXY.left) {
                                    prepareX.push(offset);
                                } else if (offsetX < 0 && offset.left < nowXY.left) {
                                    prepareX.push(offset);
                                }
                            }
                        }
                        var min;
                        var prepareXLen = prepareX.length;
                        var x;
                        if (offsetY > 0) {
                            min = Number.MAX_VALUE;
                            for (i = 0; i < prepareXLen; i++) {
                                x = prepareX[i];
                                if (x.top > nowXY.top) {
                                    if (min < x.top - nowXY.top) {
                                        min = x.top - nowXY.top;
                                        newPageIndex = prepareX.index;
                                    }
                                }
                            }
                        } else {
                            min = Number.MAX_VALUE;
                            for (i = 0; i < prepareXLen; i++) {
                                x = prepareX[i];
                                if (x.top < nowXY.top) {
                                    if (min < nowXY.top - x.top) {
                                        min = nowXY.top - x.top;
                                        newPageIndex = prepareX.index;
                                    }
                                }
                            }
                        }
                        if (newPageIndex !== undefined) {
                            if (newPageIndex !== pageIndex) {
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
                            var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
                            self.scrollToPage(toPageIndex, animCfg);
                        } else {
                            self.scrollToPage(pageIndex);
                            scrollEnd();
                        }
                    }
                }
            }
        }
        onDragEndAxis(self, e, 'left', endCallback);
        onDragEndAxis(self, e, 'top', endCallback);
    }
    function onGestureStart(e) {
        var self = this;
        if (self.isScrolling && e.gestureType === 'touch') {
            e.preventDefault();
        }    // snap mode can not stop anim in the middle
        // snap mode can not stop anim in the middle
        if (self.isScrolling && self.pagesOffset) {
            return;
        }
        if (self.isScrolling) {
            self.stopAnimation();
            self.fire('scrollTouchEnd', {
                pageX: e.pageX,
                pageY: e.pageY
            });
        }
    }
    function bindUI(self) {
        var action = self.get('disabled') ? 'detach' : 'on';    // bind to $el in case $contentEl is out of bound
        // bind to $el in case $contentEl is out of bound
        self.$el[action](PanGesture.PAN_START, onDragStartHandler, self)    // click
[// click
        action](BasicGesture.START, onGestureStart, self)[action](PanGesture.PAN, onDragHandler, self)[action](PanGesture.PAN_END, onDragEndHandler, self);
    }    /**
 * allow touch drag for scroll view.
 * module scroll-view will be this class on touch device
 * @class KISSY.ScrollView.Drag
 * @extends KISSY.ScrollView.Base
 */
    /**
 * allow touch drag for scroll view.
 * module scroll-view will be this class on touch device
 * @class KISSY.ScrollView.Drag
 * @extends KISSY.ScrollView.Base
 */
    module.exports = ScrollViewBase.extend({
        initializer: function () {
            var self = this;
            self._preventDefaultY = self.get('preventDefaultY');
            self._preventDefaultX = self.get('preventDefaultX');
            self._lockX = self.get('lockX');
            self._lockY = self.get('lockY');
            self._bounce = self.get('bounce');
            self._snapThresholdCfg = self.get('snapThreshold');
            self._snapDurationCfg = self.get('snapDuration');
            self._snapEasingCfg = self.get('snapEasing');
            self.publish('touchEnd', {
                defaultFn: defaultTouchEndHandler,
                // only process its own default function
                defaultTargetOnly: true
            });
        },
        bindUI: function () {
            bindUI(this);
        },
        _onSetDisabled: function (v) {
            var self = this;
            self.callSuper(v);
            bindUI(self);
        },
        destructor: function () {
            this.stopAnimation();
        },
        stopAnimation: function () {
            this.callSuper();
            this.isScrolling = 0;
        }
    }, {
        ATTRS: {
            /**
             * whether allow drag in x direction when content size is less than container size.
             * Defaults to: true, does not allow.
             * @cfg {Boolean} lockX
             */
            /**
             * @ignore
             */
            lockX: { value: true },
            /**
             * whether allow browser default action on x direction if reach x direction limitation.
             * Defaults to: true, does not allow.
             * @cfg {Boolean} preventDefaultX
             */
            /**
             * @ignore
             */
            preventDefaultX: { value: true },
            /**
             * whether allow drag in y direction when content size is less than container size.
             * Defaults to: false, allow.
             * @cfg {Boolean} lockY
             */
            /**
             * @ignore
             */
            lockY: { value: false },
            /**
             * whether allow browser default action on y direction if reach y direction limitation.
             * Defaults to: true, does not allow.
             * @cfg {Boolean} preventDefaultY
             */
            /**
             * @ignore
             */
            preventDefaultY: { value: false },
            /**
             * snapDuration, Defaults to 0.3
             * @cfg {Number} snapDuration
             */
            /**
             * @ignore
             */
            snapDuration: { value: 0.3 },
            /**
             * snapEasing, Defaults to 'easeOut'
             * @cfg {String} snapEasing
             */
            /**
             * @ignore
             */
            snapEasing: { value: 'easeOut' },
            /**
             * px diff to start x or y snap gesture
             * Defaults to: 5.
             * @cfg {Boolean} snapThreshold
             */
            /**
             * @ignore
             */
            snapThreshold: { value: 5 },
            /**
             * whether allow bounce effect
             * Defaults to: true.
             * @cfg {Boolean} bounce
             */
            /**
             * @ignore
             */
            bounce: { value: true },
            /**
             * bounce effect duration.
             * Defaults to: 0.4.
             * @cfg {Number} bounceDuration
             */
            /**
             * @ignore
             */
            bounceDuration: { value: 0.4 },
            /**
             * bounce easing config.
             * Defaults to: easeOut.
             * @cfg {Boolean} bounceEasing
             */
            /**
             * @ignore
             */
            bounceEasing: { value: 'easeOut' }
        }
    });    /**
 * @ignore
 * refer
 * - https://developers.google.com/mobile/articles/webapp_fixed_ui
 * - http://yuilibrary.com/yui/docs/scroll-view/
 * - http://docs.sencha.com/touch/2-1/#!/api/Ext.dataview.List
 * - http://cubiq.org/iscroll-4
 * - http://developer.apple.com/library/ios/#documentation/uikit/reference/UIScrollView_Class/Reference/UIScrollView.html
 */
});




