/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 8 21:37
*/
/**
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/base-touch', function (S) {

    function BaseTouch() {
        this.requiredTouchCount = 1;
    }

    BaseTouch.prototype = {
        onTouchStart: function (e) {
            if (e.touches.length != this.requiredTouchCount) {
                return false;
            }
        },
        onTouchMove: function (e) {
            // ignore current move
            if (e.touches.length != this.requiredTouchCount) {
                return false;
            }
        },
        onTouchEnd: S.noop
    };

    return BaseTouch;

});/**
 * @ignore
 * gesture single tap double tap
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/double-tap',
    function (S, eventHandleMap, Event, SingleTouch) {

        var SINGLE_TAP = 'singleTap',
            DOUBLE_TAP = 'doubleTap';

        var MAX_DURATION = 300;

        function DoubleTap() {
            this.requiredTouchCount=1;
        }

        S.extend(DoubleTap, SingleTouch, {

            onTouchStart: function (e) {
                if (DoubleTap.superclass.onTouchStart.apply(this, arguments) === false) {
                    return false;
                }
                this.startTime = e.timeStamp;
                if (this.singleTapTimer) {
                    clearTimeout(this.singleTapTimer);
                    this.singleTapTimer = 0;
                }
            },

            onTouchMove: function () {
                return false;
            },

            onTouchEnd: function (e) {
                var lastEndTime = this.lastEndTime,
                    time = e.timeStamp,
                    target = e.target,
                    touch = e.changedTouches[0],
                    duration = time - this.startTime;
                this.lastEndTime = time;
                // second touch end
                if (lastEndTime) {
                    // time between current up and last up
                    duration = time - lastEndTime;
                    // a double tap
                    if (duration < MAX_DURATION) {
                        // a new double tap cycle
                        this.lastEndTime = 0;

                        Event.fire(target, DOUBLE_TAP, {
                            touch: touch,
                            duration: duration
                        });
                        return;
                    }
                    // else treat as the first tap cycle
                }

                // time between down and up is long enough
                // then a singleTap
                duration = time - this.startTime;
                if (duration > MAX_DURATION) {
                    Event.fire(target, SINGLE_TAP, {
                        touch: touch,
                        duration: duration
                    })
                } else {
                    // buffer singleTap
                    // wait for a second tap
                    this.singleTapTimer = setTimeout(function () {
                        Event.fire(target, SINGLE_TAP, {
                            touch: touch,
                            duration: duration
                        });
                    }, MAX_DURATION);
                }

            }
        });

        eventHandleMap[SINGLE_TAP] = eventHandleMap[DOUBLE_TAP] = DoubleTap;

        return DoubleTap;

    }, {
        requires: ['./handle-map', 'event/dom/base', './base-touch']
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
    if (Features.isTouchSupported) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
    } else if (Features.isMsPointerEnabled) {
        startEvent = 'MSPointerDown';
        moveEvent = 'MSPointerMove';
        endEvent = 'MSPointerUp';
    }

    // force to load event/dom/touch in pc to use mouse to simulate touch
    if (startEvent) {
        Gesture.start = startEvent;
        Gesture.move = moveEvent;
        Gesture.end = endEvent;
        Gesture.tap = 'tap';
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

    DocumentHandler.prototype = {

        init: function () {
            var self = this,
                doc = self.doc,
                e, h;
            self.onTouchMove = S.throttle(self.onTouchMove, MOVE_DELAY);
            for (e in touchEvents) {
                h = touchEvents[e];
                Event.on(doc, e, self[h], self);
            }
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchList;
            if (Features.isTouchSupported) {
                return e;
            } else {
                if (type.indexOf('mouse') != -1 && e.which != 1) {
                    return;
                }
                touchList = [e];
                notUp = !type.match(/up$/i);
                e.touches = notUp ? touchList : [];
                e.targetTouches = notUp ? touchList : [];
                e.changedTouches = touchList;
                return e;
            }
        },

        onTouchStart: function (event) {
            var e, h,
                self = this;
            for (e in self.eventHandle) {
                h = self.eventHandle[e];
                h.isActive = true;
            }
            self.callEventHandle('onTouchStart', event);
        },

        onTouchMove: function (event) {
            this.callEventHandle('onTouchMove', event);
        },

        onTouchEnd: function (event) {
            this.callEventHandle('onTouchEnd', event);
        },

        callEventHandle: function (method, event) {
            var self = this,
                e, h;
            event = self.normalize(event);
            if (event) {
                for (e in self.eventHandle) {
                    h = self.eventHandle[e];
                    if (h.isActive && h[method](event) === false) {
                        h.isActive = false;
                    }
                }
            }
        },

        addEventHandle: function (event) {
            var self = this, constructor = eventHandleMap[event];
            if (!self.eventHandle[event] &&
                // event processor shared by multiple events
                !constructor.used) {
                self.eventHandle[event] = new constructor();
                constructor.used = 1;
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
            var win = DOM._getWin(el.ownerDocument || el),
                doc = win.document,
                handle = DOM.data(doc, key);
            if (!handle) {
                DOM.data(doc, key, handle = new DocumentHandler(doc));
            }
            handle.addEventHandle(event);
        },

        removeDocumentHandle: function (el, event) {
            var win = DOM._getWin(el.ownerDocument || el),
                doc = win.document,
                handle = DOM.data(doc, key);
            if (handle) {
                handle.removeEventHandle(event);
                if (S.isEmptyObject(eventHandle)) {
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
        './pinch'
    ]
});/**
 * @ignore
 * gesture pinch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/pinch', function (S, eventHandleMap, Event, BaseTouch, DOM) {

    var PINCH = 'pinch',
        PINCH_START = 'pinchStart',
        PINCH_END = 'pinchEnd';

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function getCommonTarget(t1, t2) {
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
    }

    function Pinch() {
        this.requiredTouchCount = 2;
        this.event = event;
    }

    S.extend(Pinch, BaseTouch, {

        onTouchStart: function (e) {
            //S.log('onTouchStart'+ e.touches.length);
            if (Pinch.superclass.onTouchStart.apply(this, arguments) === false) {
                return false;
            }
            var touches = e.touches,
                distance = getDistance(touches[0], touches[1]);

            this.startDistance = distance;

            var target = this.target = getCommonTarget(touches[0].target, touches[1].target);

            Event.fire(target,
                PINCH_START, {
                    touches: touches,
                    distance: distance,
                    scale: 1
                });
        },

        onTouchMove: function (e) {
            //S.log('onTouchMove'+' : ' +e.touches.length+' : '+ e.changedTouches.length);
            var r = Pinch.superclass.onTouchMove.apply(this, arguments);
            if (r === false) {
                return false;
            }
            if (r === true) {
                return;
            }
            var touches = e.touches,
                distance = getDistance(touches[0], touches[1]);

            Event.fire(this.target,
                PINCH, {
                    touches: touches,
                    distance: distance,
                    scale: distance / this.startDistance
                });

            this.lastTouches = touches;
        },

        onTouchEnd: function () {
            //S.log('touchend');
            Event.fire(this.target, PINCH_END, {
                touches: this.lastTouches
            });
        }

    });

    eventHandleMap[PINCH] =
        eventHandleMap[PINCH_END] =
            eventHandleMap[PINCH_END] = Pinch;

    return Pinch;

}, {
    requires: ['./handle-map', 'event/dom/base', './base-touch', 'dom']
});/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'swipe';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function Swipe() {
        this.requiredTouchCount = 1;
        this.event = event;
    }

    function checkSwipeMove(self, e, touches) {
        var touch = touches[0],
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

        return undefined;
    }

    S.extend(Swipe, SingleTouch, {

        onTouchStart: function (e) {
            if (Swipe.superclass.onTouchStart.apply(this, arguments) === false) {
                return false;
            }
            var touch = e.touches[0];
            this.startTime = e.timeStamp;

            this.isHorizontal = 1;
            this.isVertical = 1;

            this.startX = touch.pageX;
            this.startY = touch.pageY;

            if (e.type.indexOf('mouse') != -1) {
                e.preventDefault();
            }
        },

        onTouchMove: function (e) {
            // ignore
            if (Swipe.superclass.onTouchMove.apply(this, arguments) === true) {
                return;
            }
            if (checkSwipeMove(this, e, e.touches) == false) {
                return false;
            }
        },

        onTouchEnd: function (e) {
            if (checkSwipeMove(this, e, e.changedTouches) == false) {
                return false;
            }

            var touches = e.changedTouches,
                touch = touches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - this.startX,
                deltaY = y - this.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                distance,
                direction;

            if (this.isVertical && absDeltaY < MIN_DISTANCE) {
                this.isVertical = 0;
            }

            if (this.isHorizontal && absDeltaX < MIN_DISTANCE) {
                this.isHorizontal = 0;
            }

            if (this.isHorizontal) {
                direction = deltaX < 0 ? 'left' : 'right';
                distance = absDeltaX;
            } else if (this.isVertical) {
                direction = deltaY < 0 ? 'up' : 'down';
                distance = absDeltaY;
            } else {
                return false;
            }

            Event.fire(e.target, this.event, {
                /**
                 *
                 * native touch property **only for event swipe**.
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
                 * duration property **only for event swipe**.
                 *
                 * the duration swipe gesture costs
                 * @property {Number} duration
                 * @member KISSY.Event.DOMEventObject
                 */
                duration: e.timeStamp - this.startTime
            });
        }

    });

    eventHandleMap[event] = Swipe;

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base', './base-touch']
});/**
 * @ignore
 * gesture tap or click for pc
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'tap';

    function Tap() {
        this.requiredTouchCount = 1;
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

    eventHandleMap[event] = Tap;

    return Tap;

}, {
    requires: ['./handle-map', 'event/dom/base', './base-touch']
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
