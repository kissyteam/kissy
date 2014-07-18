/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
event/gesture/util
event/gesture/util/add-event
event/gesture/util/touch
event/gesture/util/single-touch
event/gesture/util/double-touch
*/
KISSY.add('event/gesture/util', [
    './util/add-event',
    './util/touch',
    './util/single-touch',
    './util/double-touch'
], function (S, require, exports, module) {
    /**
 * utils for gesture events
 * @author yiminghe@gmail.com
 */
    var addGestureEvent = require('./util/add-event');
    module.exports = {
        addEvent: addGestureEvent,
        Touch: require('./util/touch'),
        SingleTouch: require('./util/single-touch'),
        DoubleTouch: require('./util/double-touch')
    };
});
KISSY.add('event/gesture/util/add-event', [
    'util',
    'dom',
    'ua',
    'event/dom/base',
    'feature'
], function (S, require, exports, module) {
    /**
 * @ignore
 * base handle for touch gesture, mouse and touch normalization
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Dom = require('dom');
    var eventHandleMap = {};
    var UA = require('ua');
    var DomEvent = require('event/dom/base');
    var Special = DomEvent.Special;
    var key = util.guid('touch-handle'), Feature = require('feature'), gestureStartEvent, gestureMoveEvent, gestureEndEvent;
    function isTouchEvent(type) {
        return util.startsWith(type, 'touch');
    }
    function isMouseEvent(type) {
        return util.startsWith(type, 'mouse');
    }
    function isPointerEvent(type) {
        return util.startsWith(type, 'MSPointer') || util.startsWith(type, 'pointer');
    }    // This should be long enough to ignore compatible mouse events made by touch
    // This should be long enough to ignore compatible mouse events made by touch
    var DUP_TIMEOUT = 2500;    // radius around touchend that swallows mouse events
    // radius around touchend that swallows mouse events
    var DUP_DIST = 25;
    if (Feature.isTouchEventSupported()) {
        if (UA.ios) {
            // ios mousedown is buggy
            gestureEndEvent = 'touchend touchcancel';
            gestureStartEvent = 'touchstart';
            gestureMoveEvent = 'touchmove';
        } else {
            gestureEndEvent = 'touchend touchcancel mouseup';    // allow touch and mouse both!
            // allow touch and mouse both!
            gestureStartEvent = 'touchstart mousedown';
            gestureMoveEvent = 'touchmove mousemove';
        }
    } else if (Feature.isPointerSupported()) {
        // ie11 requires lowercase
        // https://github.com/kissyteam/kissy/issues/509
        gestureStartEvent = 'pointerdown';
        gestureMoveEvent = 'pointermove';
        gestureEndEvent = 'pointerup pointercancel';
    } else if (Feature.isMsPointerSupported()) {
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
        self.eventHandles = [];
        self.init();    // normalize pointer event to touch event
        // normalize pointer event to touch event
        self.touches = [];    // touches length of touch event
        // touches length of touch event
        self.inTouch = 0;
    }
    DocumentHandler.prototype = {
        constructor: DocumentHandler,
        lastTouches: [],
        firstTouch: null,
        init: function () {
            var self = this, doc = self.doc;
            DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);    // pointermove will be fired regardless of pointerdown
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
            var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
            for (; i < l; i++) {
                touch = touches[i];
                if (touch.pointerId === pointerId) {
                    touches.splice(i, 1);
                    break;
                }
            }
        },
        updateTouch: function (originalEvent) {
            var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
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
            var t = inEvent.changedTouches[0];    // only the primary finger will dup mouse events
            // only the primary finger will dup mouse events
            if (this.isPrimaryTouch(t)) {
                // remember x/y of last touch
                var lt = {
                        x: t.clientX,
                        y: t.clientY
                    };
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
            var x = inEvent.clientX, y = inEvent.clientY;
            for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
                // simulated mouse events will be swallowed near a primary touchend
                var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
                if (dx <= DUP_DIST && dy <= DUP_DIST) {
                    return true;
                }
            }
            return 0;
        },
        normalize: function (e) {
            var type = e.type, notUp, touchEvent, touchList;
            if (touchEvent = isTouchEvent(type)) {
                touchList = type === 'touchend' || type === 'touchcancel' ? e.changedTouches : e.touches;
                e.gestureType = 'touch';
            } else {
                if (isPointerEvent(type)) {
                    e.gestureType = e.originalEvent.pointerType;
                } else if (isMouseEvent(type)) {
                    e.gestureType = 'mouse';
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
            var e, h, self = this, type = event.type, eventHandles = self.eventHandles;
            if (isTouchEvent(type)) {
                self.setPrimaryTouch(event.changedTouches[0]);
                self.dupMouse(event);
            } else if (isMouseEvent(type)) {
                if (self.isEventSimulatedFromTouch(event)) {
                    return;
                }
                self.touches = [event];
            } else if (isPointerEvent(type)) {
                self.addTouch(event.originalEvent);
                if (self.touches.length === 1) {
                    DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
                }
            } else {
                throw new Error('unrecognized touch event: ' + event.type);
            }
            for (var i = 0, l = eventHandles.length; i < l; i++) {
                e = eventHandles[i];
                h = eventHandles[e].handle;
                h.isActive = 1;
            }    // if preventDefault, will not trigger click event
            // if preventDefault, will not trigger click event
            self.callEventHandle('onTouchStart', event);
        },
        onTouchMove: function (event) {
            var self = this, type = event.type;
            if (isMouseEvent(type)) {
                if (self.isEventSimulatedFromTouch(type)) {
                    return;
                }
                self.touches = [event];
            } else if (isPointerEvent(type)) {
                self.updateTouch(event.originalEvent);
            } else if (!isTouchEvent(type)) {
                throw new Error('unrecognized touch event: ' + event.type);
            }    // no throttle! to allow preventDefault
            // no throttle! to allow preventDefault
            self.callEventHandle('onTouchMove', event);
        },
        onTouchEnd: function (event) {
            var self = this, type = event.type;
            if (isMouseEvent(type)) {
                if (self.isEventSimulatedFromTouch(event)) {
                    return;
                }
            }
            self.callEventHandle('onTouchEnd', event);
            if (isTouchEvent(type)) {
                self.dupMouse(event);
                util.makeArray(event.changedTouches).forEach(function (touch) {
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
            var self = this, eventHandles = self.eventHandles, handleArray = eventHandles.concat(), e, h;
            event = self.normalize(event);
            var gestureType = event.gestureType;    // ie touchstart on iframe then touchend on parent
            // ie touchstart on iframe then touchend on parent
            if (!event.changedTouches.length) {
                return;
            }
            for (var i = 0, l = handleArray.length; i < l; i++) {
                e = handleArray[i];
                if (eventHandles[e]) {
                    // event processor shared by multiple events
                    h = eventHandles[e].handle;    // touch only gesture
                    // touch only gesture
                    if (h.requiredGestureType && gestureType !== h.requiredGestureType) {
                        continue;
                    }
                    if (h.processed) {
                        continue;
                    }
                    h.processed = 1;
                    if (h.isActive && h[method] && h[method](event) === false) {
                        h.isActive = 0;
                    }
                }
            }
            for (i = 0, l = handleArray.length; i < l; i++) {
                e = eventHandles[i];
                if (eventHandles[e]) {
                    h = eventHandles[e].handle;
                    h.processed = 0;
                }
            }
        },
        addEventHandle: function (event) {
            var self = this, eventHandles = self.eventHandles, handle = eventHandleMap[event].handle;
            if (eventHandles[event]) {
                eventHandles[event].count++;
            } else {
                eventHandles.push(event);
                self.sortEventHandles();
                eventHandles[event] = {
                    count: 1,
                    handle: handle
                };
            }
        },
        sortEventHandles: function () {
            this.eventHandles.sort(function (e1, e2) {
                var e1Config = eventHandleMap[e1];
                var e2Config = eventHandleMap[e2];
                return e1Config.order - e2Config.order;
            });
        },
        removeEventHandle: function (event) {
            var eventHandles = this.eventHandles;
            if (eventHandles[event]) {
                eventHandles[event].count--;
                if (!eventHandles[event].count) {
                    eventHandles.splice(util.indexOf(event, eventHandles), 1);
                    delete eventHandles[event];
                }
            }
        },
        destroy: function () {
            var self = this, doc = self.doc;
            DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
            DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
            DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
        }
    };
    function setup(event) {
        addDocumentHandle(this, event);
    }
    function tearDown(event) {
        removeDocumentHandle(this, event);
    }
    function setupExtra(event) {
        setup.call(this, event);
        eventHandleMap[event].setup.apply(this, arguments);
    }
    function tearDownExtra(event) {
        tearDown.call(this, event);
        eventHandleMap[event].tearDown.apply(this, arguments);
    }
    function addDocumentHandle(el, event) {
        var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
        if (!handle) {
            Dom.data(doc, key, handle = new DocumentHandler(doc));
        }
        if (event) {
            handle.addEventHandle(event);
        }
    }
    function removeDocumentHandle(el, event) {
        var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
        if (handle) {
            if (event) {
                handle.removeEventHandle(event);
            }
            if (!handle.eventHandles.length) {
                handle.destroy();
                Dom.removeData(doc, key);
            }
        }
    }
    module.exports = function (events, config) {
        if (typeof events === 'string') {
            events = [events];
        }
        util.each(events, function (event) {
            var specialEvent = {};
            specialEvent.setup = config.setup ? setupExtra : setup;
            specialEvent.tearDown = config.tearDown ? tearDownExtra : tearDown;
            specialEvent.add = config.add;
            specialEvent.remove = config.remove;
            config.order = config.order || 100;    // specialEvent.preFire = config.preFire;
            // specialEvent.preFire = config.preFire;
            eventHandleMap[event] = config;
            Special[event] = specialEvent;
        });
    };    /*
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
});





KISSY.add('event/gesture/util/touch', [], function (S, require, exports, module) {
    /**
 * @ignore
 * touch base
 * @author yiminghe@gmail.com
 */
    var noop = function () {
    };
    function Touch() {
    }
    Touch.prototype = {
        constructor: Touch,
        requiredTouchCount: 0,
        onTouchStart: function (e) {
            var self = this, requiredTouchesCount = self.requiredTouchCount, touches = e.touches, touchesCount = touches.length;
            if (touchesCount === requiredTouchesCount) {
                if (!self.isTracking) {
                    self.isTracking = true;
                    self.isStarted = false;
                }    // record valid touches
                // record valid touches
                self.lastTouches = e.touches;
                self.startTime = e.timeStamp;
                return self.start(e);
            } else if (touchesCount > requiredTouchesCount) {
                // if more or less touches are triggered, then end
                self.onTouchEnd(e, true);
            }
            return undefined;
        },
        onTouchMove: function (e) {
            var self = this;
            if (!self.isTracking) {
                return undefined;
            }    // record valid touches
            // record valid touches
            self.lastTouches = e.touches;
            return self.move(e);
        },
        onTouchEnd: function (e, moreTouches) {
            var self = this;    // finger1 down, finger2 down -> start multi touch
                                // move finger1 or finger2 -> double-touch move
                                // finger2 up -> end multi touch
                                // finger1 move -> ignore
            // finger1 down, finger2 down -> start multi touch
            // move finger1 or finger2 -> double-touch move
            // finger2 up -> end multi touch
            // finger1 move -> ignore
            if (self.isTracking) {
                self.isTracking = false;
                if (self.isStarted) {
                    self.isStarted = false;
                    self.end(e, moreTouches);
                }
            }
        },
        start: noop,
        move: noop,
        end: noop
    };
    module.exports = Touch;
});
KISSY.add('event/gesture/util/single-touch', [
    './touch',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
    var Touch = require('./touch');
    var util = require('util');
    function SingleTouch() {
    }
    util.extend(SingleTouch, Touch, {
        requiredTouchCount: 1,
        start: function () {
            SingleTouch.superclass.start.apply(this, arguments);
            var self = this, touches = self.lastTouches;    // ios will share touches with touchmove...
            // ios will share touches with touchmove...
            self.lastXY = {
                pageX: touches[0].pageX,
                pageY: touches[0].pageY
            };
        }
    });
    module.exports = SingleTouch;
});
KISSY.add('event/gesture/util/double-touch', [
    'dom',
    './touch',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * double-touch base
 * @author yiminghe@gmail.com
 */
    var Dom = require('dom');
    var Touch = require('./touch');
    var util = require('util');
    function DoubleTouch() {
    }
    util.extend(DoubleTouch, Touch, {
        requiredTouchCount: 2,
        getCommonTarget: function (e) {
            var touches = e.touches, t1 = touches[0].target, t2 = touches[1].target;
            if (t1 === t2) {
                return t1;
            }
            if (Dom.contains(t1, t2)) {
                return t1;
            }
            while (t2) {
                if (Dom.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            return undefined;
        }
    });
    module.exports = DoubleTouch;
});
