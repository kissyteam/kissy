/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/base/add-event
 event/gesture/base/touch
 event/gesture/base/single-touch
 event/gesture/base/tap
 event/gesture/base
*/

KISSY.add("event/gesture/base/add-event", ["dom", "event/dom/base"], function(S, require) {
  var Dom = require("dom");
  var eventHandleMap = {};
  var DomEvent = require("event/dom/base");
  var Special = DomEvent.Special;
  var key = S.guid("touch-handle"), Feature = S.Feature, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  function isTouchEvent(type) {
    return S.startsWith(type, "touch")
  }
  function isMouseEvent(type) {
    return S.startsWith(type, "mouse")
  }
  function isPointerEvent(type) {
    return S.startsWith(type, "MSPointer") || S.startsWith(type, "pointer")
  }
  var DUP_TIMEOUT = 2500;
  var DUP_DIST = 25;
  if(Feature.isTouchEventSupported()) {
    if(S.UA.ios) {
      gestureEndEvent = "touchend touchcancel";
      gestureStartEvent = "touchstart";
      gestureMoveEvent = "touchmove"
    }else {
      gestureEndEvent = "touchend touchcancel mouseup";
      gestureStartEvent = "touchstart mousedown";
      gestureMoveEvent = "touchmove mousemove"
    }
  }else {
    if(Feature.isPointerSupported()) {
      gestureStartEvent = "pointerdown";
      gestureMoveEvent = "pointermove";
      gestureEndEvent = "pointerup pointercancel"
    }else {
      if(Feature.isMsPointerSupported()) {
        gestureStartEvent = "MSPointerDown";
        gestureMoveEvent = "MSPointerMove";
        gestureEndEvent = "MSPointerUp MSPointerCancel"
      }else {
        gestureStartEvent = "mousedown";
        gestureMoveEvent = "mousemove";
        gestureEndEvent = "mouseup"
      }
    }
  }
  function DocumentHandler(doc) {
    var self = this;
    self.doc = doc;
    self.eventHandles = [];
    self.init();
    self.touches = [];
    self.inTouch = 0
  }
  DocumentHandler.prototype = {constructor:DocumentHandler, lastTouches:[], firstTouch:null, init:function() {
    var self = this, doc = self.doc;
    DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
    if(!isPointerEvent(gestureMoveEvent)) {
      DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self)
    }
    DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self)
  }, addTouch:function(originalEvent) {
    originalEvent.identifier = originalEvent.pointerId;
    this.touches.push(originalEvent)
  }, removeTouch:function(originalEvent) {
    var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
    for(;i < l;i++) {
      touch = touches[i];
      if(touch.pointerId === pointerId) {
        touches.splice(i, 1);
        break
      }
    }
  }, updateTouch:function(originalEvent) {
    var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
    for(;i < l;i++) {
      touch = touches[i];
      if(touch.pointerId === pointerId) {
        touches[i] = originalEvent
      }
    }
  }, isPrimaryTouch:function(inTouch) {
    return this.firstTouch === inTouch.identifier
  }, setPrimaryTouch:function(inTouch) {
    if(this.firstTouch === null) {
      this.firstTouch = inTouch.identifier
    }
  }, removePrimaryTouch:function(inTouch) {
    if(this.isPrimaryTouch(inTouch)) {
      this.firstTouch = null
    }
  }, dupMouse:function(inEvent) {
    var lts = this.lastTouches;
    var t = inEvent.changedTouches[0];
    if(this.isPrimaryTouch(t)) {
      var lt = {x:t.clientX, y:t.clientY};
      lts.push(lt);
      setTimeout(function() {
        var i = lts.indexOf(lt);
        if(i > -1) {
          lts.splice(i, 1)
        }
      }, DUP_TIMEOUT)
    }
  }, isEventSimulatedFromTouch:function(inEvent) {
    var lts = this.lastTouches;
    var x = inEvent.clientX, y = inEvent.clientY;
    for(var i = 0, l = lts.length, t;i < l && (t = lts[i]);i++) {
      var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
      if(dx <= DUP_DIST && dy <= DUP_DIST) {
        return true
      }
    }
    return 0
  }, normalize:function(e) {
    var type = e.type, notUp, touchEvent, touchList;
    if(touchEvent = isTouchEvent(type)) {
      touchList = type === "touchend" || type === "touchcancel" ? e.changedTouches : e.touches;
      e.gestureType = "touch"
    }else {
      if(isPointerEvent(type)) {
        e.gestureType = e.originalEvent.pointerType
      }else {
        if(isMouseEvent(type)) {
          e.gestureType = "mouse"
        }
      }
      touchList = this.touches
    }
    if(touchList && touchList.length === 1) {
      e.which = 1;
      e.pageX = touchList[0].pageX;
      e.pageY = touchList[0].pageY
    }
    if(touchEvent) {
      return e
    }
    notUp = !type.match(/(up|cancel)$/i);
    e.touches = notUp ? touchList : [];
    e.targetTouches = notUp ? touchList : [];
    e.changedTouches = touchList;
    return e
  }, onTouchStart:function(event) {
    var e, h, self = this, type = event.type, eventHandles = self.eventHandles;
    if(isTouchEvent(type)) {
      self.setPrimaryTouch(event.changedTouches[0]);
      self.dupMouse(event)
    }else {
      if(isMouseEvent(type)) {
        if(self.isEventSimulatedFromTouch(event)) {
          return
        }
        self.touches = [event]
      }else {
        if(isPointerEvent(type)) {
          self.addTouch(event.originalEvent);
          if(self.touches.length === 1) {
            DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self)
          }
        }else {
          throw new Error("unrecognized touch event: " + event.type);
        }
      }
    }
    for(var i = 0, l = eventHandles.length;i < l;i++) {
      e = eventHandles[i];
      h = eventHandles[e].handle;
      h.isActive = 1
    }
    self.callEventHandle("onTouchStart", event)
  }, onTouchMove:function(event) {
    var self = this, type = event.type;
    if(isMouseEvent(type)) {
      if(self.isEventSimulatedFromTouch(type)) {
        return
      }
      self.touches = [event]
    }else {
      if(isPointerEvent(type)) {
        self.updateTouch(event.originalEvent)
      }else {
        if(!isTouchEvent(type)) {
          throw new Error("unrecognized touch event: " + event.type);
        }
      }
    }
    self.callEventHandle("onTouchMove", event)
  }, onTouchEnd:function(event) {
    var self = this, type = event.type;
    if(isMouseEvent(type)) {
      if(self.isEventSimulatedFromTouch(event)) {
        return
      }
    }
    self.callEventHandle("onTouchEnd", event);
    if(isTouchEvent(type)) {
      self.dupMouse(event);
      S.makeArray(event.changedTouches).forEach(function(touch) {
        self.removePrimaryTouch(touch)
      })
    }else {
      if(isMouseEvent(type)) {
        self.touches = []
      }else {
        if(isPointerEvent(type)) {
          self.removeTouch(event.originalEvent);
          if(!self.touches.length) {
            DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self)
          }
        }
      }
    }
  }, callEventHandle:function(method, event) {
    var self = this, eventHandles = self.eventHandles, handleArray = eventHandles.concat(), e, h;
    event = self.normalize(event);
    var gestureType = event.gestureType;
    if(!event.changedTouches.length) {
      return
    }
    for(var i = 0, l = handleArray.length;i < l;i++) {
      e = handleArray[i];
      if(eventHandles[e]) {
        h = eventHandles[e].handle;
        if(h.requiredGestureType && gestureType !== h.requiredGestureType) {
          continue
        }
        if(h.processed) {
          continue
        }
        h.processed = 1;
        if(h.isActive && h[method] && h[method](event) === false) {
          h.isActive = 0
        }
      }
    }
    for(i = 0, l = handleArray.length;i < l;i++) {
      e = eventHandles[i];
      if(eventHandles[e]) {
        h = eventHandles[e].handle;
        h.processed = 0
      }
    }
  }, addEventHandle:function(event) {
    var self = this, eventHandles = self.eventHandles, handle = eventHandleMap[event].handle;
    if(eventHandles[event]) {
      eventHandles[event].count++
    }else {
      eventHandles.push(event);
      self.sortEventHandles();
      eventHandles[event] = {count:1, handle:handle}
    }
  }, sortEventHandles:function() {
    this.eventHandles.sort(function(e1, e2) {
      var e1Config = eventHandleMap[e1];
      var e2Config = eventHandleMap[e2];
      return e1Config.order - e2Config.order
    })
  }, removeEventHandle:function(event) {
    var eventHandles = this.eventHandles;
    if(eventHandles[event]) {
      eventHandles[event].count--;
      if(!eventHandles[event].count) {
        eventHandles.splice(S.indexOf(event, eventHandles), 1);
        delete eventHandles[event]
      }
    }
  }, destroy:function() {
    var self = this, doc = self.doc;
    DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
    DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
    DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self)
  }};
  function setup(event) {
    addDocumentHandle(this, event)
  }
  function tearDown(event) {
    removeDocumentHandle(this, event)
  }
  function setupExtra(event) {
    setup.call(this, event);
    eventHandleMap[event].setup.apply(this, arguments)
  }
  function tearDownExtra(event) {
    tearDown.call(this, event);
    eventHandleMap[event].tearDown.apply(this, arguments)
  }
  function addDocumentHandle(el, event) {
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    if(!handle) {
      Dom.data(doc, key, handle = new DocumentHandler(doc))
    }
    if(event) {
      handle.addEventHandle(event)
    }
  }
  function removeDocumentHandle(el, event) {
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    if(handle) {
      if(event) {
        handle.removeEventHandle(event)
      }
      if(!handle.eventHandles.length) {
        handle.destroy();
        Dom.removeData(doc, key)
      }
    }
  }
  return function(events, config) {
    if(typeof events === "string") {
      events = [events]
    }
    S.each(events, function(event) {
      var specialEvent = {};
      specialEvent.setup = config.setup ? setupExtra : setup;
      specialEvent.tearDown = config.tearDown ? tearDownExtra : tearDown;
      specialEvent.add = config.add;
      specialEvent.remove = config.remove;
      config.order = config.order || 100;
      eventHandleMap[event] = config;
      Special[event] = specialEvent
    })
  }
});
KISSY.add("event/gesture/base/touch", [], function(S) {
  var noop = S.noop;
  function Touch() {
  }
  Touch.prototype = {constructor:Touch, requiredTouchCount:0, onTouchStart:function(e) {
    var self = this, requiredTouchesCount = self.requiredTouchCount, touches = e.touches, touchesCount = touches.length;
    if(touchesCount === requiredTouchesCount) {
      if(!self.isTracking) {
        self.isTracking = true;
        self.isStarted = false
      }
      self.lastTouches = e.touches;
      self.startTime = e.timeStamp;
      return self.start(e)
    }else {
      if(touchesCount > requiredTouchesCount) {
        self.onTouchEnd(e, true)
      }
    }
    return undefined
  }, onTouchMove:function(e) {
    var self = this;
    if(!self.isTracking) {
      return undefined
    }
    self.lastTouches = e.touches;
    return self.move(e)
  }, onTouchEnd:function(e, moreTouches) {
    var self = this;
    if(self.isTracking) {
      self.isTracking = false;
      if(self.isStarted) {
        self.isStarted = false;
        self.end(e, moreTouches)
      }
    }
  }, start:noop, move:noop, end:noop};
  return Touch
});
KISSY.add("event/gesture/base/single-touch", ["./touch"], function(S, require) {
  var Touch = require("./touch");
  function SingleTouch() {
  }
  S.extend(SingleTouch, Touch, {requiredTouchCount:1, start:function() {
    SingleTouch.superclass.start.apply(this, arguments);
    var self = this, touches = self.lastTouches;
    self.lastXY = {pageX:touches[0].pageX, pageY:touches[0].pageY}
  }});
  return SingleTouch
});
KISSY.add("event/gesture/base/tap", ["./add-event", "event/dom/base", "./single-touch"], function(S, require) {
  var addGestureEvent = require("./add-event");
  var DomEvent = require("event/dom/base");
  var SingleTouch = require("./single-touch");
  var SINGLE_TAP_EVENT = "singleTap", DOUBLE_TAP_EVENT = "doubleTap", TAP_HOLD_EVENT = "tapHold", TAP_EVENT = "tap", TAP_HOLD_DELAY = 1E3, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  function preventDefault(e) {
    e.preventDefault()
  }
  function clearTimers(self) {
    if(self.singleTapTimer) {
      clearTimeout(self.singleTapTimer);
      self.singleTapTimer = 0
    }
    if(self.tapHoldTimer) {
      clearTimeout(self.tapHoldTimer);
      self.tapHoldTimer = 0
    }
  }
  function Tap() {
    Tap.superclass.constructor.apply(this, arguments)
  }
  S.extend(Tap, SingleTouch, {start:function(e) {
    var self = this;
    Tap.superclass.start.call(self, e);
    clearTimers(self);
    var currentTouch = self.lastTouches[0];
    self.tapHoldTimer = setTimeout(function() {
      var eventObj = S.mix({touch:currentTouch, which:1, TAP_HOLD_DELAY:(S.now() - e.timeStamp) / 1E3}, self.lastXY);
      self.tapHoldTimer = 0;
      self.lastXY = 0;
      DomEvent.fire(currentTouch.target, TAP_HOLD_EVENT, eventObj)
    }, TAP_HOLD_DELAY);
    self.isStarted = true;
    return undefined
  }, move:function() {
    var self = this, lastXY;
    if(!(lastXY = self.lastXY)) {
      return false
    }
    var currentTouch = self.lastTouches[0];
    if(!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY) {
      clearTimers(self);
      return false
    }
    return undefined
  }, end:function(e, moreTouches) {
    var self = this, lastXY;
    clearTimers(self);
    if(moreTouches) {
      return
    }
    if(!(lastXY = self.lastXY)) {
      return
    }
    var touch = self.lastTouches[0];
    var target = touch.target;
    var eventObject = new DomEventObject(e.originalEvent);
    S.mix(eventObject, {type:TAP_EVENT, which:1, pageX:lastXY.pageX, pageY:lastXY.pageY, target:target, currentTarget:target});
    eventObject.touch = touch;
    DomEvent.fire(target, TAP_EVENT, eventObject);
    if(eventObject.isDefaultPrevented() && S.UA.mobile) {
      if(S.UA.ios) {
        e.preventDefault()
      }else {
        DomEvent.on(target.ownerDocument || target, "click", {fn:preventDefault, once:1})
      }
    }
    var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
    self.lastEndTime = time;
    if(lastEndTime) {
      duration = time - lastEndTime;
      if(duration < SINGLE_TAP_DELAY) {
        self.lastEndTime = 0;
        DomEvent.fire(target, DOUBLE_TAP_EVENT, {touch:touch, pageX:lastXY.pageX, pageY:lastXY.pageY, which:1, duration:duration / 1E3});
        return
      }
    }
    duration = time - self.startTime;
    if(duration > SINGLE_TAP_DELAY) {
      DomEvent.fire(target, SINGLE_TAP_EVENT, {touch:touch, pageX:lastXY.pageX, pageY:lastXY.pageY, which:1, duration:duration / 1E3})
    }else {
      self.singleTapTimer = setTimeout(function() {
        DomEvent.fire(target, SINGLE_TAP_EVENT, {touch:touch, pageX:lastXY.pageX, pageY:lastXY.pageY, which:1, duration:duration / 1E3})
      }, SINGLE_TAP_DELAY)
    }
  }});
  addGestureEvent([TAP_EVENT, DOUBLE_TAP_EVENT, SINGLE_TAP_EVENT, TAP_HOLD_EVENT], {handle:new Tap});
  return{tap:TAP_EVENT, TAP:TAP_EVENT, singleTap:SINGLE_TAP_EVENT, SINGLE_TAP:SINGLE_TAP_EVENT, DOUBLE_TAP:DOUBLE_TAP_EVENT, doubleTap:DOUBLE_TAP_EVENT, TAP_HOLD:TAP_HOLD_EVENT}
});
KISSY.add("event/gesture/base", ["event/dom/base", "./base/add-event", "./base/tap", "./base/touch", "./base/single-touch"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var addGestureEvent = require("./base/add-event");
  var Enumeration = {start:"gestureStart", START:"gestureStart", move:"gestureMove", MOVE:"gestureMove", end:"gestureEnd", END:"gestureEnd"};
  function addGestureBaseEvent(event, onHandler) {
    var handle = {isActive:1};
    handle[onHandler] = function(e) {
      DomEvent.fire(e.target, event, e)
    };
    addGestureEvent(event, {order:1, handle:handle})
  }
  addGestureBaseEvent(Enumeration.START, "onTouchStart");
  addGestureBaseEvent(Enumeration.MOVE, "onTouchMove");
  addGestureBaseEvent(Enumeration.END, "onTouchEnd");
  S.mix(Enumeration, require("./base/tap"));
  return{Enumeration:Enumeration, addEvent:addGestureEvent, Touch:require("./base/touch"), SingleTouch:require("./base/single-touch")}
});

