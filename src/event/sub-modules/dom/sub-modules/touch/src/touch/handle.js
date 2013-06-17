/**
 * @ignore
 * base handle for touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle', function (S, DOM, eventHandleMap, DOMEvent, Gesture) {

    var key = S.guid('touch-handle'),
        Features = S.Features,
        isMsPointerSupported = Features.isMsPointerSupported(),
        touchEvents = {};

    touchEvents[Gesture.start] = 'onTouchStart';
    touchEvents[Gesture.move] = 'onTouchMove';
    touchEvents[Gesture.end] = 'onTouchEnd';
    if (Gesture.cancel) {
        touchEvents[Gesture.cancel] = 'onTouchEnd';
    }

    function DocumentHandler(doc) {

        var self = this;

        self.doc = doc;

        self.eventHandle = {
        };

        self.init();

        // normalize pointer event to touch event
        self.touches = [];

    }

    DocumentHandler.prototype = {

        constructor: DocumentHandler,

        addTouch: function (t) {
            this.touches.push(t);
        },

        removeTouch: function (t) {
            var touches = this.touches;
            S.each(touches, function (tt, index) {
                if (tt.pointerId ==
                    t.pointerId) {
                    touches.splice(index, 1);
                    return false;
                }
                return undefined;
            });
        },

        updateTouch: function (t) {
            var touches = this.touches;
            S.each(touches, function (tt, index) {
                if (tt.pointerId ==
                    t.pointerId) {
                    touches[index] = t;
                    return false;
                }
                return undefined;
            });
        },

        init: function () {
            var self = this,
                doc = self.doc,
                e, h;

            for (e in touchEvents) {
                h = touchEvents[e];
                DOMEvent.on(doc, e, self[h], self);
            }
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchList;
            if (Features.isTouchEventSupported()) {
                touchList = (type == 'touchend' || type == 'touchcancel') ?
                    e.changedTouches : e.touches;
                if (touchList.length == 1) {
                    e.which = 1;
                    e.pageX = touchList.pageX;
                    e.pageY = touchList.pageY;
                }
                return e;
            }
            else if (isMsPointerSupported) {
                touchList = this.touches;
            } else {
                if (type.indexOf('mouse') != -1 && e.which != 1) {
                    return undefined;
                }
                touchList = [e];
            }
            notUp = !type.match(/(up|cancel)$/i);
            e.touches = notUp ? touchList : [];
            e.targetTouches = notUp ? touchList : [];
            e.changedTouches = touchList;
            return e;
        },

        onTouchMove: function (e) {
            if (isMsPointerSupported) {
                this.updateTouch(e.originalEvent);
            }
            // no throttle! to allow preventDefault
            this.callEventHandle('onTouchMove', e);
        },

        onTouchStart: function (event) {
            var e, h,
                self = this,
                eventHandle = self.eventHandle;
            for (e in eventHandle) {
                h = eventHandle[e].handle;
                h.isActive = 1;
            }
            if (isMsPointerSupported) {
                self.addTouch(event.originalEvent);
            }
            self.callEventHandle('onTouchStart', event);
        },

        onTouchEnd: function (event) {
            this.callEventHandle('onTouchEnd', event);
            if (isMsPointerSupported) {
                this.removeTouch(event.originalEvent);
            }
        },

        callEventHandle: function (method, event) {
            var self = this,
                eventHandle = self.eventHandle,
                e, h;
            event = self.normalize(event);
            if (event) {
                for (e in eventHandle) {
                    // event processor shared by multiple events
                    h = eventHandle[e].handle;
                    if (h.processed) {
                        continue;
                    }
                    h.processed = 1;
                    if (h.isActive && h[method](event) === false) {
                        h.isActive = 0;
                    }
                }

                for (e in eventHandle) {
                    h = eventHandle[e].handle;
                    h.processed = 0;
                }
            }
        },

        addEventHandle: function (event) {
            var self = this,
                eventHandle = self.eventHandle,
                handle = eventHandleMap[event].handle;
            if (eventHandle[event]) {
                eventHandle[event].count++;
            } else {
                eventHandle[event] = {
                    count: 1,
                    handle: handle
                };
            }
        },

        'removeEventHandle': function (event) {
            var eventHandle = this.eventHandle;
            if (eventHandle[event]) {
                eventHandle[event].count--;
                if (!eventHandle[event].count) {
                    delete eventHandle[event];
                }
            }

        },

        destroy: function () {
            var self = this,
                doc = self.doc,
                e, h;
            for (e in touchEvents) {
                h = touchEvents[e];
                DOMEvent.detach(doc, e, self[h], self);
            }
        }

    };

    return {

        addDocumentHandle: function (el, event) {
            var win = DOM.getWindow(el.ownerDocument || el),
                doc = win.document,
                handle = DOM.data(doc, key);
            if (!handle) {
                DOM.data(doc, key, handle = new DocumentHandler(doc));
            }
            handle.addEventHandle(event);
        },

        removeDocumentHandle: function (el, event) {
            var win = DOM.getWindow(el.ownerDocument || el),
                doc = win.document,
                handle = DOM.data(doc, key);
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
        './rotate',
        './single-touch-start'
    ]
});
/**
 * in order to make tap/doubleTap bubbling same with native event.
 * register event on document and then bubble programmatically!
 */