/**
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
});