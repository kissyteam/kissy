/**
 * @ignore
 * base handle for touch gesture, mouse and touch normalization
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');
    var eventHandleMap = require('./handle-map');
    var DomEvent = require('event/dom/base');
    require('./tap');
    require('./swipe');
    require('./pinch');
    require('./rotate');

    var key = S.guid('touch-handle'),
        Features = S.Features,
        gestureStartEvent,
        gestureMoveEvent,
        gestureEndEvent;

    function isTouchEvent(type) {
        return S.startsWith(type, 'touch');
    }

    function isMouseEvent(type) {
        return S.startsWith(type, 'mouse');
    }

    function isPointerEvent(type) {
        return S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer');
    }

    // This should be long enough to ignore compatible mouse events made by touch
    var DUP_TIMEOUT = 2500;
    // radius around touchend that swallows mouse events
    var DUP_DIST = 25;

    if (Features.isTouchEventSupported()) {
        if (S.UA.ios) {
            // ios mousedown is buggy
            gestureEndEvent = 'touchend touchcancel';
            gestureStartEvent = 'touchstart';
            gestureMoveEvent = 'touchmove';
        } else {
            gestureEndEvent = 'touchend touchcancel mouseup';
            // allow touch and mouse both!
            gestureStartEvent = 'touchstart mousedown';
            gestureMoveEvent = 'touchmove mousemove';
        }
    } else if (Features.isPointerSupported()) {
        // ie11 requires lowercase
        // https://github.com/kissyteam/kissy/issues/509
        gestureStartEvent = 'pointerdown';
        gestureMoveEvent = 'pointermove';
        gestureEndEvent = 'pointerup pointercancel';
    } else if (Features.isMsPointerSupported()) {
        gestureStartEvent = 'MSPointerDown';
        gestureMoveEvent = 'MSPointerMove';
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
    } else {
        gestureStartEvent = 'mousedown';
        gestureMoveEvent = 'mousemove';
        gestureEndEvent = 'mouseup';
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

        lastTouches: [],

        firstTouch: null,

        init: function () {
            var self = this,
                doc = self.doc;
            DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
            // pointermove will be fired regardless of pointerdown
            if (!isPointerEvent(gestureMoveEvent)) {
                DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
            }
            DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
        },

        addTouch: function (originalEvent) {
            originalEvent.identifier = originalEvent.pointerId;
            this.touches.push(originalEvent);
        },

        removeTouch: function (originalEvent) {
            var i = 0,
                touch,
                pointerId = originalEvent.pointerId,
                touches = this.touches,
                l = touches.length;
            for (; i < l; i++) {
                touch = touches[i];
                if (touch.pointerId === pointerId) {
                    touches.splice(i, 1);
                    break;
                }
            }
        },

        updateTouch: function (originalEvent) {
            var i = 0,
                touch,
                pointerId = originalEvent.pointerId,
                touches = this.touches,
                l = touches.length;
            for (; i < l; i++) {
                touch = touches[i];
                if (touch.pointerId === pointerId) {
                    touches[i] = originalEvent;
                }
            }
        },

        isPrimaryTouch: function (inTouch) {
            return this.firstTouch === inTouch.identifier;
        },

        setPrimaryTouch: function (inTouch) {
            if (this.firstTouch === null) {
                this.firstTouch = inTouch.identifier;
            }
        },

        removePrimaryTouch: function (inTouch) {
            if (this.isPrimaryTouch(inTouch)) {
                this.firstTouch = null;
            }
        },

        // prevent mouse events from creating pointer events
        dupMouse: function (inEvent) {
            var lts = this.lastTouches;
            var t = inEvent.changedTouches[0];
            // only the primary finger will dup mouse events
            if (this.isPrimaryTouch(t)) {
                // remember x/y of last touch
                var lt = {x: t.clientX, y: t.clientY};
                lts.push(lt);
                setTimeout(function () {
                    var i = lts.indexOf(lt);
                    if (i > -1) {
                        lts.splice(i, 1);
                    }
                }, DUP_TIMEOUT);
            }
        },

        // collide with the touch event
        isEventSimulatedFromTouch: function (inEvent) {
            var lts = this.lastTouches;
            var x = inEvent.clientX,
                y = inEvent.clientY;
            for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
                // simulated mouse events will be swallowed near a primary touchend
                var dx = Math.abs(x - t.x),
                    dy = Math.abs(y - t.y);
                if (dx <= DUP_DIST && dy <= DUP_DIST) {
                    return true;
                }
            }
            return 0;
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchEvent,
                touchList;
            if ((touchEvent = isTouchEvent(type))) {
                touchList = (type === 'touchend' || type === 'touchcancel') ?
                    e.changedTouches :
                    e.touches;
                e.isTouch = 1;
            } else {
                if (isPointerEvent(type)) {
                    var pointerType = e.originalEvent.pointerType;
                    if (pointerType === 'touch') {
                        e.isTouch = 1;
                    }
                }
                touchList = this.touches;
            }
            if (touchList && touchList.length === 1) {
                e.which = 1;
                e.pageX = touchList[0].pageX;
                e.pageY = touchList[0].pageY;
            }
            if (touchEvent) {
                return e;
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
                type = event.type,
                eventHandle = self.eventHandle;
            if (isTouchEvent(type)) {
                self.setPrimaryTouch(event.changedTouches[0]);
                self.dupMouse(event);
            } else if (isMouseEvent(type)) {
                if (self.isEventSimulatedFromTouch(event)) {
                    return;
                }
                self.touches = [event.originalEvent];
            } else if (isPointerEvent(type)) {
                self.addTouch(event.originalEvent);
                if (self.touches.length === 1) {
                    DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
                }
            } else {
                throw new Error('unrecognized touch event: ' + event.type);
            }

            for (e in eventHandle) {
                h = eventHandle[e].handle;
                h.isActive = 1;
            }
            // if preventDefault, will not trigger click event
            self.callEventHandle('onTouchStart', event);
        },

        onTouchMove: function (event) {
            var self = this,
                type = event.type;
            if (isMouseEvent(type)) {
                if (self.isEventSimulatedFromTouch(type)) {
                    return;
                }
                self.touches = [event.originalEvent];
            } else if (isPointerEvent(type)) {
                self.updateTouch(event.originalEvent);
            } else if (!isTouchEvent(type)) {
                throw new Error('unrecognized touch event: ' + event.type);
            }
            // no throttle! to allow preventDefault
            self.callEventHandle('onTouchMove', event);
        },

        onTouchEnd: function (event) {
            var self = this,
                type = event.type;
            if (isMouseEvent(type)) {
                if (self.isEventSimulatedFromTouch(event)) {
                    return;
                }
            }

            self.callEventHandle('onTouchEnd', event);
            if (isTouchEvent(type)) {
                self.dupMouse(event);
                S.makeArray(event.changedTouches).forEach(function (touch) {
                    self.removePrimaryTouch(touch);
                });
            } else if (isMouseEvent(type)) {
                self.touches = [];
            } else if (isPointerEvent(type)) {
                self.removeTouch(event.originalEvent);
                if (!self.touches.length) {
                    DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
                }
            }
        },

        callEventHandle: function (method, event) {
            var self = this,
                eventHandle = self.eventHandle,
                e,
                h;
            event = self.normalize(event);
            // ie touchstart on iframe then touchend on parent
            if (!event.changedTouches.length) {
                return;
            }
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
                doc = self.doc;
            DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
            DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
            DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
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
});
/*
 2013-08-29 yiminghe@gmail.com
 - ios bug
 create new element on touchend handler
 then a mousedown event will be fired on the new element
 - refer: https://github.com/Polymer/PointerEvents/

 2013-08-28 yiminghe@gmail.com
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

 2012 yiminghe@gmail.com
 in order to make tap/doubleTap bubbling same with native event.
 register event on document and then bubble
 */