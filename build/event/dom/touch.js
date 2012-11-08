/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 8 17:37
*/
/**
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
            var self = this;
            if (!self.eventHandle[event]) {
                self.eventHandle[event] = new (eventHandleMap[event])();
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
        './swipe'
    ]
});/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event) {

    var event = 'swipe';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function Swipe() {
        this.event = event;
    }

    Swipe.prototype = {

        onTouchStart: function (e) {
            var touches = e.touches, touch;
            // single touch(mouse)down/up
            if (touches.length > 1) {
                return false;
            }
            touch = touches[0];
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
            var touches = e.changedTouches,
                touch = touches[0],
                x = touch.pageX,
                y = touch.pageY,
                absDeltaX = Math.abs(x - this.startX),
                absDeltaY = Math.abs(y - this.startY),
                time = e.timeStamp;

            if (time - this.startTime > MAX_DURATION) {
                return false;
            }

            if (this.isVertical && absDeltaX > MAX_OFFSET) {
                this.isVertical = 0;
            }

            if (this.isHorizontal && absDeltaY > MAX_OFFSET) {
                this.isHorizontal = 0;
            }

            if (!this.isHorizontal && !this.isVertical) {
                return false;
            }

        },

        onTouchEnd: function (e) {
            if (this.onTouchMove(e) === false) {
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
                touch: touch,
                direction: direction,
                distance: distance,
                duration: e.timeStamp - this.startTime
            });
        }

    };

    eventHandleMap[event] = Swipe;

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base']
});/**
 * @ignore
 * gesture tap or click for pc
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap', function (S, eventHandleMap, Event) {

    var event = 'tap';

    function Tap() {

    }

    Tap.prototype = {

        onTouchStart: function (e) {
            // single touch(mouse)down/up
            if (e.touches.length > 1) {
                return false;
            }
        },

        onTouchMove: function () {
            return false;
        },

        onTouchEnd: function (e) {
            Event.fire(e.target, event, e);
        }

    };

    eventHandleMap[event] = Tap;

    return Tap;

}, {
    requires: ['./handle-map', 'event/dom/base']
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
