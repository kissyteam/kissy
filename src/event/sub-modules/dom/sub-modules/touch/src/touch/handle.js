/**
 * @ignore
 * base handle for touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle', function (S, Dom, eventHandleMap, DomEvent, Gesture) {
    var key = S.guid('touch-handle'),
        Features = S.Features,
        isMsPointerSupported = Features.isMsPointerSupported(),
        touchEvents = {},
        startEvent,
        cancelEvent,
        endEvent;

    var eventsMap = {
        onTouchStart: 'gestureStart',
        onTouchMove: 'gestureMove',
        // for none touchable event, end and start are maybe fired on different target.
        onTouchEnd: 'gestureEnd'
    };

    function getMoveEventFromStartEvent(startEvent) {
        if (startEvent == 'MSPointerDown') {
            return 'MSPointerMove';
        } else if (startEvent == 'touchstart') {
            return 'touchmove';
        } else if (startEvent == 'mousedown') {
            return 'mousemove';
        }
        throw new Error('unknown start event: ' + startEvent);
    }

    // 'MSPointerMove'

    if (Features.isTouchEventSupported()) {
        startEvent = 'touchstart mousedown';
        endEvent = 'touchend mouseup';
        cancelEvent = 'touchcancel';
    } else if (Features.isMsPointerSupported()) {
        startEvent = 'MSPointerDown';
        endEvent = 'MSPointerUp';
        cancelEvent = 'MSPointerCancel';
    } else {
        startEvent = 'mousedown';
        endEvent = 'mouseup';
    }

    touchEvents[startEvent] = 'onTouchStart';
    touchEvents[endEvent] = 'onTouchEnd';
    if (cancelEvent) {
        touchEvents[cancelEvent] = 'onTouchEnd';
    }

    function DocumentHandler(doc) {
        var self = this;
        self.doc = doc;
        self.eventHandle = {};
        self.init();
        // normalize pointer event to touch event
        self.touches = [];
    }

    DocumentHandler.prototype = {
        constructor: DocumentHandler,

        addTouch: function (t) {
            t.identifier = t.pointerId;
            this.touches.push(t);
        },

        removeTouch: function (t) {
            var touches = this.touches;
            S.each(touches, function (tt, index) {
                if (tt.pointerId == t.pointerId) {
                    touches.splice(index, 1);
                    return false;
                }
                return undefined;
            });
        },

        updateTouch: function (t) {
            var touches = this.touches;
            S.each(touches, function (tt, index) {
                if (tt.pointerId == t.pointerId) {
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
                DomEvent.on(doc, e, self[h], self);
            }
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchList;
            if (S.startsWith(type, 'touch')) {
                touchList = (type == 'touchend' || type == 'touchcancel') ?
                    e.changedTouches :
                    e.touches;
                if (touchList.length == 1) {
                    e.which = 1;
                    e.pageX = touchList[0].pageX;
                    e.pageY = touchList[0].pageY;
                }
                return e;
            }
            else {
                touchList = this.touches;
            }
            notUp = !type.match(/(up|cancel)$/i);
            e.touches = notUp ? touchList : [];
            e.targetTouches = notUp ? touchList : [];
            e.changedTouches = touchList;
            return e;
        },

        onTouchStart: function (event) {
            // if touch prevent mousedown/up event
            event.preventDefault();
            var e, h,
                self = this,
                type = event.type,
                eventHandle = self.eventHandle;
            for (e in eventHandle) {
                h = eventHandle[e].handle;
                h.isActive = 1;
            }
            var originalTouchesLength = self.touches.length;
            if ('touches' in event) {
                self.touches = S.makeArray(event.touches);
            } else {
                self.addTouch(event.originalEvent);
            }
            self.callEventHandle('onTouchStart', event);
            if (!originalTouchesLength && self.touches.length) {
                DomEvent.on(self.doc,
                    self.startEvent = getMoveEventFromStartEvent(type),
                    self.onTouchMove, self);
            }
        },

        onTouchMove: function (e) {
            var self = this;
            if (!('touches' in e)) {
                if (isMsPointerSupported) {
                    self.updateTouch(e.originalEvent);
                } else {
                    self.touches = [e.originalEvent];
                }
            }
            // no throttle! to allow preventDefault
            self.callEventHandle('onTouchMove', e);
        },

        onTouchEnd: function (event) {
            // if touch prevent mousedown/up event
            event.preventDefault();
            var self = this;
            self.callEventHandle('onTouchEnd', event);
            if ('touches' in event) {
                self.touches = S.makeArray(event.touches);
            } else if (isMsPointerSupported) {
                self.removeTouch(event.originalEvent);
            } else {
                self.touches = [];
            }
            if (!self.touches.length) {
                DomEvent.detach(self.doc, self.startEvent, self.onTouchMove, self);
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
            DomEvent.fire(event.target, eventsMap[method], event);
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
                DomEvent.detach(doc, e, self[h], self);
            }
        }
    };

    return {
        addDocumentHandle: function (el, event) {
            var doc = Dom.getDocument(el),
                handle = Dom.data(doc, key);
            if (!handle) {
                Dom.data(doc, key, handle = new DocumentHandler(doc));
            }
            if (event) {
                handle.addEventHandle(event);
            }

        },

        removeDocumentHandle: function (el, event) {
            var doc = Dom.getDocument(el),
                handle = Dom.data(doc, key);
            if (handle) {
                if (event) {
                    handle.removeEventHandle(event);
                }
                if (S.isEmptyObject(handle.eventHandle)) {
                    handle.destroy();
                    Dom.removeData(doc, key);
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
 * 2013-07-23 yiminghe@gmail.com
 * - bind both mouse and touch for start
 * - but bind mousemove or touchmove for move
 *
 *
 * in order to make tap/doubleTap bubbling same with native event.
 * register event on document and then bubble programmatically!
 */