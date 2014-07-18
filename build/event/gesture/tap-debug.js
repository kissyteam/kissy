/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
/*
combined modules:
event/gesture/tap
*/
KISSY.add('event/gesture/tap', [
    'event/gesture/util',
    'event/dom/base',
    'ua',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * gesture tap
 * @author yiminghe@gmail.com
 */
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var DomEvent = require('event/dom/base');
    var SingleTouch = GestureUtil.SingleTouch;
    var UA = require('ua');
    var util = require('util');    /**
 * fired when tap.
 * @event TAP
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 */
                                   /**
 * fired when singleTap.
 * @event SINGLE_TAP
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 * @param {Number} e.duration time duration(s) between current time and last touch start
 */
                                   /**
 * fired when doubleTap.
 * @event DOUBLE_TAP
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 * @param {Number} e.duration time duration(s) between current time and last touch up
 */
                                   /**
 * fired when tapHold.
 * @event HOLD
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 * @param {Number} e.duration time duration(s) between current time and current touch start
 */
    /**
 * fired when tap.
 * @event TAP
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 */
    /**
 * fired when singleTap.
 * @event SINGLE_TAP
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 * @param {Number} e.duration time duration(s) between current time and last touch start
 */
    /**
 * fired when doubleTap.
 * @event DOUBLE_TAP
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 * @param {Number} e.duration time duration(s) between current time and last touch up
 */
    /**
 * fired when tapHold.
 * @event HOLD
 * @member KISSY.Event.Gesture.Tap
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX tap pageX
 * @param {Number} e.pageY tap pageY
 * @param {Number} e.duration time duration(s) between current time and current touch start
 */
    var SINGLE_TAP = 'singleTap', DOUBLE_TAP = 'doubleTap', HOLD = 'hold', TAP = 'tap', TAP_HOLD_DELAY = 1000,
        // same with native click delay
        SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
    function preventDefault(e) {
        e.preventDefault();
    }
    function clearTimers(self) {
        if (self.singleTapTimer) {
            clearTimeout(self.singleTapTimer);
            self.singleTapTimer = 0;
        }
        if (self.tapHoldTimer) {
            clearTimeout(self.tapHoldTimer);
            self.tapHoldTimer = 0;
        }
    }
    function Tap() {
        Tap.superclass.constructor.apply(this, arguments);
    }
    util.extend(Tap, SingleTouch, {
        start: function (e) {
            var self = this;
            Tap.superclass.start.call(self, e);
            clearTimers(self);
            var currentTouch = self.lastTouches[0];
            self.tapHoldTimer = setTimeout(function () {
                var eventObj = util.mix({
                        which: 1,
                        duration: (util.now() - e.timeStamp) / 1000
                    }, self.lastXY);
                self.tapHoldTimer = 0;
                self.lastXY = 0;
                DomEvent.fire(currentTouch.target, HOLD, eventObj);
            }, TAP_HOLD_DELAY);
            self.isStarted = true;
            return undefined;
        },
        move: function () {
            var self = this, lastXY;
            if (!(lastXY = self.lastXY)) {
                return false;
            }
            var currentTouch = self.lastTouches[0];    // some TOUCH_MOVE_SENSITIVITY
                                                       // android browser will trigger touchmove event finger is not moved ...
                                                       // ie10 will has no touch when mouse
            // some TOUCH_MOVE_SENSITIVITY
            // android browser will trigger touchmove event finger is not moved ...
            // ie10 will has no touch when mouse
            if (!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY) {
                clearTimers(self);
                return false;
            }
            return undefined;
        },
        end: function (e, moreTouches) {
            var self = this, lastXY;
            clearTimers(self);
            if (moreTouches) {
                return;
            }    // tapHold fired
            // tapHold fired
            if (!(lastXY = self.lastXY)) {
                return;
            }
            var touch = self.lastTouches[0];
            var target = touch.target;    // fire tap
            // fire tap
            var eventObject = new DomEventObject(e.originalEvent);
            util.mix(eventObject, {
                type: TAP,
                which: 1,
                pageX: lastXY.pageX,
                pageY: lastXY.pageY,
                target: target,
                currentTarget: target
            });
            DomEvent.fire(target, TAP, eventObject);    // call e.preventDefault on tap event to prevent tap penetration in real touch device
            // call e.preventDefault on tap event to prevent tap penetration in real touch device
            if (eventObject.isDefaultPrevented() && UA.mobile) {
                if (UA.ios) {
                    e.preventDefault();
                } else {
                    DomEvent.on(target.ownerDocument || target, 'click', {
                        fn: preventDefault,
                        once: 1
                    });
                }
            }    // fire singleTap or doubleTap
            // fire singleTap or doubleTap
            var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
            self.lastEndTime = time;    // second touch end
            // second touch end
            if (lastEndTime) {
                // time between current up and last up
                duration = time - lastEndTime;    // a double tap
                // a double tap
                if (duration < SINGLE_TAP_DELAY) {
                    // a new double tap cycle
                    self.lastEndTime = 0;
                    DomEvent.fire(target, DOUBLE_TAP, {
                        pageX: lastXY.pageX,
                        pageY: lastXY.pageY,
                        which: 1,
                        duration: duration / 1000
                    });
                    return;
                }    // else treat as the first tap cycle
            }    // time between down and up is long enough
                 // then a singleTap
            // else treat as the first tap cycle
            // time between down and up is long enough
            // then a singleTap
            duration = time - self.startTime;
            if (duration > SINGLE_TAP_DELAY) {
                DomEvent.fire(target, SINGLE_TAP, {
                    pageX: lastXY.pageX,
                    pageY: lastXY.pageY,
                    which: 1,
                    duration: duration / 1000
                });
            } else {
                // buffer singleTap
                // wait for a second tap
                self.singleTapTimer = setTimeout(function () {
                    DomEvent.fire(target, SINGLE_TAP, {
                        pageX: lastXY.pageX,
                        pageY: lastXY.pageY,
                        which: 1,
                        duration: (util.now() - self.startTime) / 1000
                    });
                }, SINGLE_TAP_DELAY);
            }
        }
    });
    addGestureEvent([
        TAP,
        DOUBLE_TAP,
        SINGLE_TAP,
        HOLD
    ], { handle: new Tap() });
    module.exports = {
        TAP: TAP,
        SINGLE_TAP: SINGLE_TAP,
        DOUBLE_TAP: DOUBLE_TAP,
        HOLD: HOLD
    };    /**
 * @ignore
 * yiminghe@gmail.com 2013-12-20
 *
 * - tap 和 tapHold 互斥触发
 *
 *
 * yiminghe@gmail.com 2012-10-31
 *
 * 页面改动必须先用桌面 chrome 刷新下，再用 ios 刷新，否则很可能不生效??
 *
 * why to implement tap:
 * 1.   click 造成 clickable element 有 -webkit-tap-highlight-color 其内不能选择文字
 * 2.   touchstart touchdown 时间间隔非常短不会触发 click (touchstart)
 * 3.   click 在touchmove 到其他地方后仍然会触发（如果没有组织touchmove默认行为导致的屏幕移动）
 *
 * tap:
 * 1.   长按可以选择文字，
 *      可以选择阻止 document 的 touchstart 来阻止整个程序的文字选择功能:
 *      同时阻止了touch 的 mouse/click 相关事件触发
 * 2.   反应更灵敏
 *
 * https://developers.google.com/mobile/articles/fast_buttons
 */
});



