/**
 * @ignore
 * gesture tap
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var eventHandleMap = require('./handle-map');
    var DomEvent = require('event/dom/base');
    var SingleTouch = require('./single-touch');

    var SINGLE_TAP_EVENT = 'singleTap',
        DOUBLE_TAP_EVENT = 'doubleTap',
        TAP_HOLD_EVENT = 'tapHold',
        TAP_EVENT = 'tap',
        TAP_HOLD_DELAY = 1000,
    // same with native click delay
        SINGLE_TAP_DELAY = 300,
        TOUCH_MOVE_SENSITIVITY = 5,
        DomEventObject = DomEvent.Object;

    function preventDefault(e) {
        e.preventDefault();
    }

    function Tap() {
        Tap.superclass.constructor.apply(this, arguments);
    }

    S.extend(Tap, SingleTouch, {
        onTouchStart: function (e) {
            var self = this;
            if (Tap.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }

            // tapHold
            if (self.tapHoldTimer) {
                clearTimeout(self.tapHoldTimer);
            }
            self.tapHoldTimer = setTimeout(function () {
                var eventObj = S.mix({
                    touch: e.touches[0],
                    which: 1,
                    TAP_HOLD_DELAY: (S.now() - e.timeStamp) / 1000
                }, self.lastXY);
                self.tapHoldTimer = 0;
                self.lastXY = 0;
                DomEvent.fire(e.target, TAP_HOLD_EVENT, eventObj);
            }, TAP_HOLD_DELAY);

            // doubleTap and singleTap
            self.startTime = e.timeStamp;
            if (self.singleTapTimer) {
                clearTimeout(self.singleTapTimer);
                self.singleTapTimer = 0;
            }

            return undefined;
        },
        onTouchMove: function (e) {
            var self = this,
                lastXY;
            if (!(lastXY = self.lastXY)) {
                return false;
            }
            var currentTouch = e.changedTouches[0];
            // some TOUCH_MOVE_SENSITIVITY
            // android browser will trigger touchmove event finger is not moved ...
            // ie10 will has no touch when mouse
            if (!currentTouch ||
                Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY ||
                Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY) {
                return false;
            }
            return undefined;
        },

        onTouchEnd: function (e) {
            var self = this, lastXY;
            // tapHold fired
            if (!(lastXY = self.lastXY)) {
                return;
            }
            var target = e.target;
            var touch = e.changedTouches[0];

            // cancel tapHold
            if (self.tapHoldTimer) {
                clearTimeout(self.tapHoldTimer);
                self.tapHoldTimer = 0;
            }

            // fire tap
            var eventObject = new DomEventObject(e.originalEvent);

            S.mix(eventObject, {
                type: TAP_EVENT,
                which: 1,
                pageX: lastXY.pageX,
                pageY: lastXY.pageY,
                target: target,
                currentTarget: target
            });

            eventObject.touch = touch;
            DomEvent.fire(target, TAP_EVENT, eventObject);

            // call e.preventDefault on tap event to prevent tap penetration in real touch device
            if (eventObject.isDefaultPrevented() && S.UA.mobile) {
                if (S.UA.ios) {
                    e.preventDefault();
                } else {
                    DomEvent.on(target.ownerDocument || target, 'click', {
                        fn: preventDefault,
                        once: 1
                    });
                }
            }

            // fire singleTap or doubleTap
            var lastEndTime = self.lastEndTime,
                time = e.timeStamp,
                duration;
            self.lastEndTime = time;
            // second touch end
            if (lastEndTime) {
                // time between current up and last up
                duration = time - lastEndTime;
                // a double tap
                if (duration < SINGLE_TAP_DELAY) {
                    // a new double tap cycle
                    self.lastEndTime = 0;
                    DomEvent.fire(target, DOUBLE_TAP_EVENT, {
                        touch: touch,
                        pageX: lastXY.pageX,
                        pageY: lastXY.pageY,
                        which: 1,
                        duration: duration / 1000
                    });
                    return;
                }
                // else treat as the first tap cycle
            }

            // time between down and up is long enough
            // then a singleTap
            duration = time - self.startTime;
            if (duration > SINGLE_TAP_DELAY) {
                DomEvent.fire(target, SINGLE_TAP_EVENT, {
                    touch: touch,
                    pageX: lastXY.pageX,
                    pageY: lastXY.pageY,
                    which: 1,
                    duration: duration / 1000
                });
            } else {
                // buffer singleTap
                // wait for a second tap
                self.singleTapTimer = setTimeout(function () {
                    DomEvent.fire(target, SINGLE_TAP_EVENT, {
                        touch: touch,
                        pageX: lastXY.pageX,
                        pageY: lastXY.pageY,
                        which: 1,
                        duration: duration / 1000
                    });
                }, SINGLE_TAP_DELAY);
            }
        }
    });

    eventHandleMap[TAP_EVENT] = eventHandleMap[DOUBLE_TAP_EVENT] = eventHandleMap[SINGLE_TAP_EVENT] = eventHandleMap[TAP_HOLD_EVENT] = {
        handle: new Tap()
    };

    return Tap;
});
/**
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