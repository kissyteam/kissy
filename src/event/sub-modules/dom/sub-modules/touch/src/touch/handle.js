/**
 * @ignore
 * base handle for touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle', function (S, Dom, eventHandleMap, DomEvent) {
    var key = S.guid('touch-handle'),
        Features = S.Features,
        UA = S.UA,
        isMsPointerSupported = Features.isMsPointerSupported(),
        touchEvents = {},
        startEvent,
        moveEvent,
        cancelEvent,
        endEvent;

    if (Features.isTouchEventSupported()) {
        endEvent = 'touchend';
        cancelEvent = 'touchcancel';
        // mouse event on android chrome is buggy...
        if (UA.webkit && !UA.android) {
            startEvent = 'touchstart mousedown';
            moveEvent = 'touchmove mousemove';
        } else {
            startEvent = 'touchstart';
            moveEvent = 'touchmove';
        }
    } else if (isMsPointerSupported) {
        startEvent = 'MSPointerDown';
        moveEvent = 'MSPointerMove';
        endEvent = 'MSPointerUp';
        cancelEvent = 'MSPointerCancel';
    } else {
        startEvent = 'mousedown';
        moveEvent = 'mousemove';
        endEvent = 'mouseup';
    }

    touchEvents[startEvent] = 'onTouchStart';
    touchEvents[moveEvent] = 'onTouchMove';
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
        // touches length of touch event
        self.inTouch = 0;
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
            var e, h,
                self = this,
                eventHandle = self.eventHandle;
            // log('start: ' + event.type);
            if ('touches' in event) {
                self.inTouch = event.touches.length;
                // will prevent mousedown and click....
                //event.preventDefault();
            } else {
                if (self.inTouch) {
                    // ignore mouse
                    return;
                } else if (!isMsPointerSupported) {
                    // only setup mouseup , in case dual end event handler calls
                    DomEvent.on(self.doc, 'mouseup', {
                        fn: self.onTouchEnd,
                        context: self,
                        once: true
                    });
                }
            }
            for (e in eventHandle) {
                h = eventHandle[e].handle;
                h.isActive = 1;
            }
            if ('touches' in event) {
                self.touches = S.makeArray(event.touches);
            } else if (isMsPointerSupported) {
                self.addTouch(event.originalEvent);
            } else {
                // mouse mode
                self.touches = [event.originalEvent];
            }
            // if preventDefault, will not trigger click event
            self.callEventHandle('onTouchStart', event);
        },

        onTouchMove: function (e) {
            var self = this;
            if (!('touches' in e)) {
                // ignore mouse
                if (self.inTouch) {
                    return;
                }
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
            var self = this,
            // detect before callEventHandle
                isTouchSupported = 'touches' in event;
            self.callEventHandle('onTouchEnd', event);
            if (isTouchSupported) {
                self.touches = S.makeArray(event.touches);
                // if touch mode is ended
                self.inTouch = self.touches.length;
            } else if (isMsPointerSupported) {
                self.removeTouch(event.originalEvent);
            } else {
                self.touches = [];
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
                    //type=event.type;
                    if (h.isActive && h[method] && h[method](event) === false) {
                        h.isActive = 0;
                    }
                    //event.type=type;
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
        './tap',
        './swipe',
        './double-tap',
        './pinch',
        './tap-hold',
        './rotate'
    ]
});
/**
 2013-08-28
 - chrome android bug: first series touchstart is not fired!
 - chrome android bug when bind mousedown and touch together to ordinary div
   chrome pc ：
   touchstart mousedown touchend
   chrome android ：
   touchstart touchend mousedown
   safari no mousedown
 - https://code.google.com/p/chromium/issues/detail?id=280516
 - https://code.google.com/p/chromium/issues/detail?id=280507

 2013-07-23 yiminghe@gmail.com
 - bind both mouse and touch for start
 - but bind mousemove or touchmove for move


 in order to make tap/doubleTap bubbling same with native event.
 register event on document and then bubble programmatically!
 */