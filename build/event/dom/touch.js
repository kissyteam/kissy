/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 28 14:33
*/
/**
 * @ignore
 * gesture single tap double tap
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/double-tap',
    function (S, eventHandleMap, Event, SingleTouch) {

        var SINGLE_TAP = 'singleTap',
            DOUBLE_TAP = 'doubleTap',
        // same with native click delay
            MAX_DURATION = 300;

        function DoubleTap() {
        }

        S.extend(DoubleTap, SingleTouch, {

            onTouchStart: function (e) {
                var self = this;
                if (DoubleTap.superclass.onTouchStart.apply(self, arguments) === false) {
                    return false;
                }
                self.startTime = e.timeStamp;
                if (self.singleTapTimer) {
                    clearTimeout(self.singleTapTimer);
                    self.singleTapTimer = 0;
                }
            },

            onTouchMove: function () {
                return false;
            },

            onTouchEnd: function (e) {
                var self = this,
                    lastEndTime = self.lastEndTime,
                    time = e.timeStamp,
                    target = e.target,
                    touch = e.changedTouches[0],
                    duration = time - self.startTime;
                self.lastEndTime = time;
                // second touch end
                if (lastEndTime) {
                    // time between current up and last up
                    duration = time - lastEndTime;
                    // a double tap
                    if (duration < MAX_DURATION) {
                        // a new double tap cycle
                        self.lastEndTime = 0;

                        Event.fire(target, DOUBLE_TAP, {
                            touch: touch,
                            duration: duration / 1000
                        });
                        return;
                    }
                    // else treat as the first tap cycle
                }

                // time between down and up is long enough
                // then a singleTap
                duration = time - self.startTime;
                if (duration > MAX_DURATION) {
                    Event.fire(target, SINGLE_TAP, {
                        touch: touch,
                        duration: duration / 1000
                    })
                } else {
                    // buffer singleTap
                    // wait for a second tap
                    self.singleTapTimer = setTimeout(function () {
                        Event.fire(target, SINGLE_TAP, {
                            touch: touch,
                            duration: duration / 1000
                        });
                    }, MAX_DURATION);
                }

            }
        });

        eventHandleMap[SINGLE_TAP] = eventHandleMap[DOUBLE_TAP] = {
            handle: new DoubleTap()
        };

        return DoubleTap;

    }, {
        requires: ['./handle-map', 'event/dom/base', './single-touch']
    });/**
 * @ignore
 * patch gesture for touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/gesture', function (S, EventDomBase) {
    var Gesture = EventDomBase.Gesture,
        Features = S.Features,
        startEvent,
        moveEvent,
        endEvent;

    // 不能同时绑定 touchstart 与 mousedown 会导致 ios 不能选择文本
    // bind mousedown to turn element into clickable element
    if (Features.isTouchSupported()) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
    }


//    else if (Features.isMsPointerEnabled) {
//        startEvent = 'MSPointerDown';
//        moveEvent = 'MSPointerMove';
//        endEvent = 'MSPointerUp';
//    }

    // force to load event/dom/touch in pc to use mouse to simulate touch
    if (startEvent) {
        Gesture.start = startEvent;
        Gesture.move = moveEvent;
        Gesture.end = endEvent;
        Gesture.tap = 'tap';
        Gesture.doubleTap = 'doubleTap';
    }

    return Gesture;
}, {
    requires: ['event/dom/base']
});/**
 * @ignore
 * handles for gesture events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle-map', function () {

    return {

    };

});/**
 * @ignore
 * base handle for touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle', function (S, DOM, eventHandleMap, Event, Gesture) {

    'use strict';

    var key = S.guid('touch-handle'),
        Features = S.Features,
        MOVE_DELAY = 30,
        touchEvents = {
        };

    touchEvents[Gesture.start] = 'onTouchStart';
    touchEvents[Gesture.move] = 'onTouchMove';
    touchEvents[Gesture.end] = 'onTouchEnd';

    if (Gesture.start !== 'mousedown') {
        touchEvents.touchcancel = 'onTouchEnd';
    }

    function DocumentHandler(doc) {

        var self = this;

        self.doc = doc;

        self.eventHandle = {
        };

        self.init();

    }

    // 一个应用 一个 document 只需要注册一个 move
    var throttleTouchMove = S.throttle(function (e) {
        this.callEventHandle('onTouchMove', e);
    }, MOVE_DELAY);

    DocumentHandler.prototype = {

        init: function () {
            var self = this,
                doc = self.doc,
                e, h;

            for (e in touchEvents) {
                h = touchEvents[e];
                Event.on(doc, e, self[h], self);
            }
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchList;
            if (Features.isTouchSupported()) {
                return e;
            } else {
                if (type.indexOf('mouse') != -1 && e.which != 1) {
                    return undefined;
                }
                touchList = [e];
                notUp = !type.match(/up$/i);
                e.touches = notUp ? touchList : [];
                e.targetTouches = notUp ? touchList : [];
                e.changedTouches = touchList;
                return e;
            }
        },

        onTouchMove: function (e) {
            throttleTouchMove.call(this, e);
        },

        onTouchStart: function (event) {
            var e, h,
                self = this,
                eventHandle = self.eventHandle;
            for (e in eventHandle) {
                h = eventHandle[e];
                h.isActive = 1;
            }
            self.callEventHandle('onTouchStart', event);
        },

        onTouchEnd: function (event) {
            this.callEventHandle('onTouchEnd', event);
        },

        callEventHandle: function (method, event) {
            var self = this,
                eventHandle = self.eventHandle,
                e, h;
            event = self.normalize(event);
            if (event) {
                for (e in eventHandle) {
                    // event processor shared by multiple events
                    h = eventHandle[e];
                    if (h.processed) {
                        continue;
                    }
                    h.processed = 1;
                    if (h.isActive && h[method](event) === false) {
                        h.isActive = 0;
                    }
                }

                for (e in eventHandle) {
                    h = eventHandle[e];
                    h.processed = 0;
                }
            }
        },

        addEventHandle: function (event) {
            var self = this,
                handle = eventHandleMap[event].handle;
            if (!self.eventHandle[event]) {
                self.eventHandle[event] = handle;
            }
        },

        'removeEventHandle': function (event) {
            delete this.eventHandle[event];
        },

        destroy: function () {
            var self = this,
                doc = self.doc,
                e, h;
            for (e in touchEvents) {
                h = touchEvents[e];
                Event.detach(doc, e, self[h], self);
            }
        }

    };

    return {

        addDocumentHandle: function (el, event) {
            var win = DOM.getWindow(el.ownerDocument || el),
                doc = win.document,
                setup = eventHandleMap[event].setup,
                handle = DOM.data(doc, key);
            if (!handle) {
                DOM.data(doc, key, handle = new DocumentHandler(doc));
            }
            if (setup) {
                setup.call(el, event);
            }
            handle.addEventHandle(event);
        },

        removeDocumentHandle: function (el, event) {
            var win = DOM.getWindow(el.ownerDocument || el),
                doc = win.document,
                tearDown = eventHandleMap[event].tearDown,
                handle = DOM.data(doc, key);
            if (tearDown) {
                tearDown.call(el, event);
            }
            if (handle) {
                handle.removeEventHandle(event);
                if (S.isEmptyObject(handle.eventHandle)) {
                    handle.destroy();
                    DOM.removeData(doc, key);
                }
            }
        }

    };

}, {
    requires: [
        'dom',
        './handle-map',
        'event/dom/base',
        './gesture',
        './tap',
        './swipe',
        './double-tap',
        './pinch',
        './tap-hold',
        './rotate'
    ]
});/**
 * @ignore
 * multi-touch base
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/multi-touch', function (S, DOM) {

    function MultiTouch() {
    }

    MultiTouch.prototype = {

        requiredTouchCount: 2,

        onTouchStart: function (e) {
            var self = this,
                requiredTouchesCount = self.requiredTouchCount,
                touches = e.touches,
                touchesCount = touches.length;

            if (touchesCount === requiredTouchesCount) {
                self.start();
            }
            else if (touchesCount > requiredTouchesCount) {
                self.end(e);
            }
        },

        onTouchEnd: function (e) {
            this.end(e);
        },

        start: function () {
            var self = this;
            if (!self.isTracking) {
                self.isTracking = true;
                self.isStarted = false;
            }
        },

        fireEnd: S.noop,

        getCommonTarget: function (e) {
            var touches = e.touches,
                t1 = touches[0].target,
                t2 = touches[1].target;
            if (t1 == t2) {
                return t1;
            }
            if (DOM.contains(t1, t2)) {
                return t1;
            }

            while (1) {
                if (DOM.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            S.error('getCommonTarget error!');
            return undefined;
        },

        end: function (e) {
            var self = this;
            if (self.isTracking) {
                self.isTracking = false;

                if (self.isStarted) {
                    self.isStarted = false;
                    self.fireEnd(e);
                }
            }
        }
    };

    return MultiTouch;

}, {
    requires: ['dom']
});/**
 * @ignore
 * gesture pinch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/pinch', function (S, eventHandleMap, Event, MultiTouch, Gesture) {

    var PINCH = 'pinch',
        PINCH_START = 'pinchStart',
        PINCH_END = 'pinchEnd';

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function Pinch() {
    }

    S.extend(Pinch, MultiTouch, {

        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches;
            var distance = getDistance(touches[0], touches[1]);

            self.lastTouches = touches;

            if (!self.isStarted) {
                self.isStarted = true;
                self.startDistance = distance;
                var target = self.target = self.getCommonTarget(e);

                Event.fire(target,
                    PINCH_START, S.mix(e, {
                        distance: distance,
                        scale: 1
                    }));
            } else {
                Event.fire(self.target,
                    PINCH, S.mix(e, {
                        distance: distance,
                        scale: distance / self.startDistance
                    }));
            }
        },

        fireEnd: function (e) {
            var self = this;
            Event.fire(self.target, PINCH_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }

    });

    var p = new Pinch();

    eventHandleMap[PINCH_START] =
        eventHandleMap[PINCH_END] = {
            handle: p
        };

    function preventTwoFinger(e) {
        // android can not throttle
        // need preventDefault always
        if (!e.touches || e.touches.length == 2) {
            e.preventDefault();
        }
    }

    eventHandleMap[PINCH] = {
        handle: p,
        setup: function () {
            Event.on(this, Gesture.move, preventTwoFinger);
        },
        tearDown: function () {
            Event.detach(this, Gesture.move, preventTwoFinger);
        }
    };

    return Pinch;

}, {
    requires: ['./handle-map', 'event/dom/base', './multi-touch', './gesture']
});/**
 * @ignore
 * fired when rotate using two fingers
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/rotate', function (S, eventHandleMap, MultiTouch, Event, Gesture, undefined) {
    var ROTATE_START = 'rotateStart',
        ROTATE = 'rotate',
        RAD_2_DEG = 180 / Math.PI,
        ROTATE_END = 'rotateEnd';

    function Rotate() {
    }

    S.extend(Rotate, MultiTouch, {

        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches,
                one = touches[0],
                two = touches[1],
                lastAngle = self.lastAngle,
                angle = Math.atan2(two.pageY - one.pageY,
                    two.pageX - one.pageX) * RAD_2_DEG;

            if (lastAngle !== undefined) {
                // more smooth
                // 5 4 3 2 1 -1 -2 -3 -4
                // 170 180 190 200
                var diff = Math.abs(angle - lastAngle);
                var positiveAngle = (angle + 360) % 360;
                var negativeAngle = (angle - 360) % 360;

                // process '>' scenario: top -> bottom
                if (Math.abs(positiveAngle - lastAngle) < diff) {
                    angle = positiveAngle;
                }
                // process '>' scenario: bottom -> top
                else if (Math.abs(negativeAngle - lastAngle) < diff) {
                    angle = negativeAngle;
                }
            }

            self.lastTouches = touches;
            self.lastAngle = angle;

            if (!self.isStarted) {
                self.isStarted = true;

                self.startAngle = angle;

                self.target = self.getCommonTarget(e);

                Event.fire(self.target, ROTATE_START, S.mix(e, {
                    angle: angle,
                    rotation: 0
                }));

            } else {
                Event.fire(self.target, ROTATE, S.mix(e, {
                    angle: angle,
                    rotation: angle - self.startAngle
                }));
            }
        },

        end: function () {
            var self = this;
            self.lastAngle = undefined;
            Rotate.superclass.end.apply(self, arguments);
        },

        fireEnd: function (e) {
            var self = this;
            Event.fire(self.target, ROTATE_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }
    });

    function preventTwoFinger(e) {
        // android can not throttle
        // need preventDefault always
        if (!e.touches || e.touches.length == 2) {
            e.preventDefault();
        }
    }

    var r = new Rotate();

    eventHandleMap[ROTATE_END] =
        eventHandleMap[ROTATE_START] = {
            handle: r
        };

    eventHandleMap[ROTATE] = {
        handle: r,
        setup: function () {
            Event.on(this, Gesture.move, preventTwoFinger);
        },
        tearDown: function () {
            Event.detach(this, Gesture.move, preventTwoFinger);
        }
    };

    return Rotate;

}, {
    requires: ['./handle-map', './multi-touch', 'event/dom/base', './gesture']
});/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch', function (S) {

    function SingleTouch() {
    }

    SingleTouch.prototype = {
        requiredTouchCount: 1,
        onTouchStart: function (e) {
            var self = this;
            if (e.touches.length != self.requiredTouchCount) {
                return false;
            }
            self.lastTouches = e.touches;
            return undefined;
        },
        onTouchMove: S.noop,
        onTouchEnd: S.noop
    };

    return SingleTouch;

});/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event, SingleTouch, Gesture) {

    var event = 'swipe';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function Swipe() {
    }

    S.extend(Swipe, SingleTouch, {

        onTouchStart: function (e) {
            var self = this;
            if (Swipe.superclass.onTouchStart.apply(self, arguments) === false) {
                return false;
            }
            var touch = e.touches[0];
            self.startTime = e.timeStamp;

            self.isHorizontal = 1;
            self.isVertical = 1;

            self.startX = touch.pageX;
            this.startY = touch.pageY;

            if (e.type.indexOf('mouse') != -1) {
                e.preventDefault();
            }
        },

        onTouchMove: function (e) {
            var self = this,
                touch = e.changedTouches[0],
                x = touch.pageX,
                y = touch.pageY,
                absDeltaX = Math.abs(x - self.startX),
                absDeltaY = Math.abs(y - self.startY),
                time = e.timeStamp;

            if (time - self.startTime > MAX_DURATION) {
                return false;
            }

            if (self.isVertical && absDeltaX > MAX_OFFSET) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
                self.isHorizontal = 0;
            }

            if (!self.isHorizontal && !self.isVertical) {
                return false;
            }
        },

        onTouchEnd: function (e) {
            var self = this;
            if (self.onTouchMove(e) === false) {
                return false;
            }

            var touches = e.changedTouches,
                touch = touches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - self.startX,
                deltaY = y - self.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                distance,
                direction;

            if (self.isVertical && absDeltaY < MIN_DISTANCE) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaX < MIN_DISTANCE) {
                self.isHorizontal = 0;
            }

            if (self.isHorizontal) {
                direction = deltaX < 0 ? 'left' : 'right';
                distance = absDeltaX;
            } else if (self.isVertical) {
                direction = deltaY < 0 ? 'up' : 'down';
                distance = absDeltaY;
            } else {
                return false;
            }

            Event.fire(e.target, event, {
                /**
                 *
                 * native touch property **only for touch event**.
                 *
                 * @property touch
                 * @member KISSY.Event.DOMEventObject
                 */
                touch: touch,
                /**
                 *
                 * direction property **only for event swipe/singleTap/doubleTap**.
                 *
                 * can be one of 'up' 'down' 'left' 'right'
                 * @property {String} direction
                 * @member KISSY.Event.DOMEventObject
                 */
                direction: direction,
                /**
                 *
                 * distance property **only for event swipe**.
                 *
                 * the distance swipe gesture costs
                 * @property {Number} distance
                 * @member KISSY.Event.DOMEventObject
                 */
                distance: distance,
                /**
                 *
                 * duration property **only for touch event**.
                 *
                 * the duration swipe gesture costs
                 * @property {Number} duration
                 * @member KISSY.Event.DOMEventObject
                 */
                duration: (e.timeStamp - self.startTime) / 1000
            });
        }

    });

    function prevent(e) {
        if (!e.touches || e.touches.length == 1) {
            e.preventDefault();
        }
    }

    eventHandleMap[event] = {
        setup: function () {
            // prevent native scroll
            Event.on(this, Gesture.move, prevent);
        },
        tearDown: function () {
            Event.detach(this, Gesture.move, prevent);
        },
        handle: new Swipe()
    };

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch', './gesture']
});/**
 * @ignore
 * fired when tap and hold for more than 1s
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap-hold', function (S, eventHandleMap, SingleTouch, Event, Gesture) {
    var event = 'tapHold';

    var duration = 1000;

    function TapHold() {
    }

    S.extend(TapHold, SingleTouch, {
        onTouchStart: function (e) {
            var self = this;
            if (TapHold.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }
            self.timer = setTimeout(function () {
                Event.fire(e.target, event, {
                    touch: e.touches[0],
                    duration: (S.now() - e.timeStamp) / 1000
                });
            }, duration);
        },

        onTouchMove: function () {
            clearTimeout(this.timer);
            return false;
        },

        onTouchEnd: function () {
            clearTimeout(this.timer);
        }
    });

    function prevent(e) {
        if (!e.touches || e.touches.length == 1) {
            e.preventDefault();
        }
    }

    eventHandleMap[event] = {
        setup: function () {
            // prevent native scroll
            Event.on(this, Gesture.start, prevent);
        },
        tearDown: function () {
            Event.detach(this, Gesture.start, prevent);
        },
        handle: new TapHold()
    };

    return TapHold;

}, {
    requires: ['./handle-map', './single-touch', 'event/dom/base', './gesture']
});/**
 * @ignore
 * gesture tap or click for pc
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'tap';

    function Tap() {
    }

    S.extend(Tap, SingleTouch, {

        onTouchMove: function () {
            return false;
        },

        onTouchEnd: function (e) {
            Event.fire(e.target, event, {
                touch: e.changedTouches[0]
            });
        }

    });

    eventHandleMap[event] = {
        handle: new Tap()
    };

    return Tap;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});
/**
 * @ignore
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
 *//**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, EventDomBase, eventHandleMap, eventHandle) {

    var Special = EventDomBase._Special;

    var specialEvent = {
        setup: function (event) {
            eventHandle.addDocumentHandle(this, event);
        },
        tearDown: function (event) {
            eventHandle.removeDocumentHandle(this, event);
        }
    }, e;

    for (e in eventHandleMap) {
        Special[e] = specialEvent;
    }

}, {
    requires: ['event/dom/base', './touch/handle-map', './touch/handle']
});
