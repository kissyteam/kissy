/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/dom/touch/handle-map
 event/dom/touch/single-touch
 event/dom/touch/tap
 event/dom/touch/swipe
 event/dom/touch/multi-touch
 event/dom/touch/pinch
 event/dom/touch/rotate
 event/dom/touch/handle
 event/dom/touch
*/

KISSY.add("event/dom/touch/handle-map", [], function() {
  return{}
});
KISSY.add("event/dom/touch/single-touch", [], function(S) {
  function SingleTouch() {
  }
  SingleTouch.prototype = {constructor:SingleTouch, requiredTouchCount:1, onTouchStart:function(e) {
    var self = this, touches;
    if(e.touches.length !== self.requiredTouchCount) {
      return false
    }
    touches = self.lastTouches = e.touches;
    self.lastXY = {pageX:touches[0].pageX, pageY:touches[0].pageY};
    return undefined
  }, onTouchMove:S.noop, onTouchEnd:S.noop};
  return SingleTouch
});
KISSY.add("event/dom/touch/tap", ["./handle-map", "event/dom/base", "./single-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var SingleTouch = require("./single-touch");
  var SINGLE_TAP_EVENT = "singleTap", DOUBLE_TAP_EVENT = "doubleTap", TAP_HOLD_EVENT = "tapHold", TAP_EVENT = "tap", TAP_HOLD_DELAY = 1E3, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  function preventDefault(e) {
    e.preventDefault()
  }
  function Tap() {
    Tap.superclass.constructor.apply(this, arguments)
  }
  S.extend(Tap, SingleTouch, {onTouchStart:function(e) {
    var self = this;
    if(Tap.superclass.onTouchStart.call(self, e) === false) {
      return false
    }
    if(self.tapHoldTimer) {
      clearTimeout(self.tapHoldTimer)
    }
    self.tapHoldTimer = setTimeout(function() {
      var eventObj = S.mix({touch:e.touches[0], which:1, TAP_HOLD_DELAY:(S.now() - e.timeStamp) / 1E3}, self.lastXY);
      self.tapHoldTimer = 0;
      self.lastXY = 0;
      DomEvent.fire(e.target, TAP_HOLD_EVENT, eventObj)
    }, TAP_HOLD_DELAY);
    self.startTime = e.timeStamp;
    if(self.singleTapTimer) {
      clearTimeout(self.singleTapTimer);
      self.singleTapTimer = 0
    }
    return undefined
  }, onTouchMove:function(e) {
    var self = this, lastXY;
    if(!(lastXY = self.lastXY)) {
      return false
    }
    var currentTouch = e.changedTouches[0];
    if(!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY) {
      return false
    }
    return undefined
  }, onTouchEnd:function(e) {
    var self = this, lastXY;
    if(!(lastXY = self.lastXY)) {
      return
    }
    var target = e.target;
    var touch = e.changedTouches[0];
    if(self.tapHoldTimer) {
      clearTimeout(self.tapHoldTimer);
      self.tapHoldTimer = 0
    }
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
  eventHandleMap[TAP_EVENT] = eventHandleMap[DOUBLE_TAP_EVENT] = eventHandleMap[SINGLE_TAP_EVENT] = eventHandleMap[TAP_HOLD_EVENT] = {handle:new Tap};
  return Tap
});
KISSY.add("event/dom/touch/swipe", ["./handle-map", "event/dom/base", "./single-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var SingleTouch = require("./single-touch");
  var event = "swipe", ingEvent = "swiping", MAX_DURATION = 1E3, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  function fire(self, e, ing) {
    var touches = e.changedTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, direction;
    if(ing) {
      if(self.isVertical && self.isHorizontal) {
        if(Math.max(absDeltaX, absDeltaY) < 5) {
          return undefined
        }
        if(absDeltaY > absDeltaX) {
          self.isHorizontal = 0
        }else {
          self.isVertical = 0
        }
      }
    }else {
      if(self.isVertical && absDeltaY < MIN_DISTANCE) {
        self.isVertical = 0
      }
      if(self.isHorizontal && absDeltaX < MIN_DISTANCE) {
        self.isHorizontal = 0
      }
    }
    if(self.isHorizontal) {
      direction = deltaX < 0 ? "left" : "right";
      distance = absDeltaX
    }else {
      if(self.isVertical) {
        direction = deltaY < 0 ? "up" : "down";
        distance = absDeltaY
      }else {
        return false
      }
    }
    DomEvent.fire(e.target, ing ? ingEvent : event, {originalEvent:e.originalEvent, pageX:touch.pageX, pageY:touch.pageY, which:1, touch:touch, direction:direction, distance:distance, duration:(e.timeStamp - self.startTime) / 1E3});
    return undefined
  }
  function Swipe() {
  }
  S.extend(Swipe, SingleTouch, {onTouchStart:function(e) {
    var self = this;
    if(Swipe.superclass.onTouchStart.apply(self, arguments) === false) {
      return false
    }
    var touch = e.touches[0];
    self.startTime = e.timeStamp;
    self.isHorizontal = 1;
    self.isVertical = 1;
    self.startX = touch.pageX;
    this.startY = touch.pageY;
    if(e.type.toLowerCase().indexOf("mouse") !== -1) {
      e.preventDefault()
    }
    return undefined
  }, onTouchMove:function(e) {
    var self = this, touch = e.changedTouches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), time = e.timeStamp;
    if(time - self.startTime > MAX_DURATION) {
      return false
    }
    if(self.isVertical && absDeltaX > MAX_OFFSET) {
      self.isVertical = 0
    }
    if(self.isHorizontal && absDeltaY > MAX_OFFSET) {
      self.isHorizontal = 0
    }
    return fire(self, e, 1)
  }, onTouchEnd:function(e) {
    var self = this;
    if(self.onTouchMove(e) === false) {
      return false
    }
    return fire(self, e, 0)
  }});
  eventHandleMap[event] = eventHandleMap[ingEvent] = {handle:new Swipe};
  return Swipe
});
KISSY.add("event/dom/touch/multi-touch", ["dom"], function(S, require) {
  var Dom = require("dom");
  function MultiTouch() {
  }
  MultiTouch.prototype = {constructor:MultiTouch, requiredTouchCount:2, onTouchStart:function(e) {
    var self = this, requiredTouchesCount = self.requiredTouchCount, touches = e.touches, touchesCount = touches.length;
    if(touchesCount === requiredTouchesCount) {
      self.start()
    }else {
      if(touchesCount > requiredTouchesCount) {
        self.end(e)
      }
    }
  }, onTouchEnd:function(e) {
    this.end(e)
  }, start:function() {
    var self = this;
    if(!self.isTracking) {
      self.isTracking = true;
      self.isStarted = false
    }
  }, fireEnd:S.noop, getCommonTarget:function(e) {
    var touches = e.touches, t1 = touches[0].target, t2 = touches[1].target;
    if(t1 === t2) {
      return t1
    }
    if(Dom.contains(t1, t2)) {
      return t1
    }
    while(1) {
      if(Dom.contains(t2, t1)) {
        return t2
      }
      t2 = t2.parentNode
    }
    S.error("getCommonTarget error!");
    return undefined
  }, end:function(e) {
    var self = this;
    if(self.isTracking) {
      self.isTracking = false;
      if(self.isStarted) {
        self.isStarted = false;
        self.fireEnd(e)
      }
    }
  }};
  return MultiTouch
});
KISSY.add("event/dom/touch/pinch", ["./handle-map", "event/dom/base", "./multi-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var MultiTouch = require("./multi-touch");
  var PINCH = "pinch", PINCH_START = "pinchStart", PINCH_END = "pinchEnd";
  function getDistance(p1, p2) {
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  function Pinch() {
  }
  S.extend(Pinch, MultiTouch, {onTouchMove:function(e) {
    var self = this;
    if(!self.isTracking) {
      return
    }
    var touches = e.touches;
    if(!(touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0)) {
      return
    }
    var distance = getDistance(touches[0], touches[1]);
    self.lastTouches = touches;
    if(!self.isStarted) {
      self.isStarted = true;
      self.startDistance = distance;
      var target = self.target = self.getCommonTarget(e);
      DomEvent.fire(target, PINCH_START, S.mix(e, {distance:distance, scale:1}))
    }else {
      DomEvent.fire(self.target, PINCH, S.mix(e, {distance:distance, scale:distance / self.startDistance}))
    }
  }, fireEnd:function(e) {
    var self = this;
    DomEvent.fire(self.target, PINCH_END, S.mix(e, {touches:self.lastTouches}))
  }});
  var p = new Pinch;
  eventHandleMap[PINCH_START] = eventHandleMap[PINCH_END] = {handle:p};
  function prevent(e) {
    if(e.targetTouches.length === 2) {
      e.preventDefault()
    }
  }
  var config = eventHandleMap[PINCH] = {handle:p};
  if(S.Features.isTouchEventSupported()) {
    config.setup = function() {
      this.addEventListener("touchmove", prevent, false)
    };
    config.tearDown = function() {
      this.removeEventListener("touchmove", prevent, false)
    }
  }
  return Pinch
});
KISSY.add("event/dom/touch/rotate", ["./handle-map", "event/dom/base", "./multi-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var MultiTouch = require("./multi-touch");
  var ROTATE_START = "rotateStart", ROTATE = "rotate", RAD_2_DEG = 180 / Math.PI, ROTATE_END = "rotateEnd";
  function Rotate() {
  }
  S.extend(Rotate, MultiTouch, {onTouchMove:function(e) {
    var self = this;
    if(!self.isTracking) {
      return
    }
    var touches = e.touches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
    if(lastAngle !== undefined) {
      var diff = Math.abs(angle - lastAngle);
      var positiveAngle = (angle + 360) % 360;
      var negativeAngle = (angle - 360) % 360;
      if(Math.abs(positiveAngle - lastAngle) < diff) {
        angle = positiveAngle
      }else {
        if(Math.abs(negativeAngle - lastAngle) < diff) {
          angle = negativeAngle
        }
      }
    }
    self.lastTouches = touches;
    self.lastAngle = angle;
    if(!self.isStarted) {
      self.isStarted = true;
      self.startAngle = angle;
      self.target = self.getCommonTarget(e);
      DomEvent.fire(self.target, ROTATE_START, S.mix(e, {angle:angle, rotation:0}))
    }else {
      DomEvent.fire(self.target, ROTATE, S.mix(e, {angle:angle, rotation:angle - self.startAngle}))
    }
  }, end:function() {
    var self = this;
    self.lastAngle = undefined;
    Rotate.superclass.end.apply(self, arguments)
  }, fireEnd:function(e) {
    var self = this;
    DomEvent.fire(self.target, ROTATE_END, S.mix(e, {touches:self.lastTouches}))
  }});
  function prevent(e) {
    if(e.targetTouches.length === 2) {
      e.preventDefault()
    }
  }
  var r = new Rotate;
  eventHandleMap[ROTATE_END] = eventHandleMap[ROTATE_START] = {handle:r};
  var config = eventHandleMap[ROTATE] = {handle:r};
  if(S.Features.isTouchEventSupported()) {
    config.setup = function() {
      this.addEventListener("touchmove", prevent, false)
    };
    config.tearDown = function() {
      this.removeEventListener("touchmove", prevent, false)
    }
  }
  return Rotate
});
KISSY.add("event/dom/touch/handle", ["dom", "./handle-map", "event/dom/base", "./tap", "./swipe", "./pinch", "./rotate"], function(S, require) {
  var Dom = require("dom");
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  require("./tap");
  require("./swipe");
  require("./pinch");
  require("./rotate");
  var key = S.guid("touch-handle"), Features = S.Features, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
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
  if(Features.isTouchEventSupported()) {
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
    if(Features.isPointerSupported()) {
      gestureStartEvent = "pointerdown";
      gestureMoveEvent = "pointermove";
      gestureEndEvent = "pointerup pointercancel"
    }else {
      if(Features.isMsPointerSupported()) {
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
    self.eventHandle = {};
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
      e.isTouch = 1
    }else {
      if(isPointerEvent(type)) {
        var pointerType = e.originalEvent.pointerType;
        if(pointerType === "touch") {
          e.isTouch = 1
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
    var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
    if(isTouchEvent(type)) {
      self.setPrimaryTouch(event.changedTouches[0]);
      self.dupMouse(event)
    }else {
      if(isMouseEvent(type)) {
        if(self.isEventSimulatedFromTouch(event)) {
          return
        }
        self.touches = [event.originalEvent]
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
    for(e in eventHandle) {
      h = eventHandle[e].handle;
      h.isActive = 1
    }
    self.callEventHandle("onTouchStart", event)
  }, onTouchMove:function(event) {
    var self = this, type = event.type;
    if(isMouseEvent(type)) {
      if(self.isEventSimulatedFromTouch(type)) {
        return
      }
      self.touches = [event.originalEvent]
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
    var self = this, eventHandle = self.eventHandle, e, h;
    event = self.normalize(event);
    if(!event.changedTouches.length) {
      return
    }
    for(e in eventHandle) {
      h = eventHandle[e].handle;
      if(h.processed) {
        continue
      }
      h.processed = 1;
      if(h.isActive && h[method] && h[method](event) === false) {
        h.isActive = 0
      }
    }
    for(e in eventHandle) {
      h = eventHandle[e].handle;
      h.processed = 0
    }
  }, addEventHandle:function(event) {
    var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
    if(eventHandle[event]) {
      eventHandle[event].count++
    }else {
      eventHandle[event] = {count:1, handle:handle}
    }
  }, removeEventHandle:function(event) {
    var eventHandle = this.eventHandle;
    if(eventHandle[event]) {
      eventHandle[event].count--;
      if(!eventHandle[event].count) {
        delete eventHandle[event]
      }
    }
  }, destroy:function() {
    var self = this, doc = self.doc;
    DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
    DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
    DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self)
  }};
  return{addDocumentHandle:function(el, event) {
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    if(!handle) {
      Dom.data(doc, key, handle = new DocumentHandler(doc))
    }
    if(event) {
      handle.addEventHandle(event)
    }
  }, removeDocumentHandle:function(el, event) {
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    if(handle) {
      if(event) {
        handle.removeEventHandle(event)
      }
      if(S.isEmptyObject(handle.eventHandle)) {
        handle.destroy();
        Dom.removeData(doc, key)
      }
    }
  }}
});
KISSY.add("event/dom/touch", ["event/dom/base", "./touch/handle-map", "./touch/handle"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var eventHandleMap = require("./touch/handle-map");
  var eventHandle = require("./touch/handle");
  var Gesture = DomEvent.Gesture;
  var startEvent = Gesture.start = "KSPointerDown";
  var moveEvent = Gesture.move = "KSPointerMove";
  var endEvent = Gesture.end = "KSPointerUp";
  Gesture.tap = "tap";
  Gesture.singleTap = "singleTap";
  Gesture.doubleTap = "doubleTap";
  eventHandleMap[startEvent] = {handle:{isActive:1, onTouchStart:function(e) {
    DomEvent.fire(e.target, startEvent, e)
  }}};
  eventHandleMap[moveEvent] = {handle:{isActive:1, onTouchMove:function(e) {
    DomEvent.fire(e.target, moveEvent, e)
  }}};
  eventHandleMap[endEvent] = {handle:{isActive:1, onTouchEnd:function(e) {
    DomEvent.fire(e.target, endEvent, e)
  }}};
  function setupExtra(event) {
    setup.call(this, event);
    eventHandleMap[event].setup.apply(this, arguments)
  }
  function tearDownExtra(event) {
    tearDown.call(this, event);
    eventHandleMap[event].tearDown.apply(this, arguments)
  }
  function setup(event) {
    eventHandle.addDocumentHandle(this, event)
  }
  function tearDown(event) {
    eventHandle.removeDocumentHandle(this, event)
  }
  var Special = DomEvent.Special, specialEvent, e, eventHandleValue;
  for(e in eventHandleMap) {
    specialEvent = {};
    eventHandleValue = eventHandleMap[e];
    if(eventHandleValue.setup) {
      specialEvent.setup = setupExtra
    }else {
      specialEvent.setup = setup
    }
    if(eventHandleValue.tearDown) {
      specialEvent.tearDown = tearDownExtra
    }else {
      specialEvent.tearDown = tearDown
    }
    if(eventHandleValue.add) {
      specialEvent.add = eventHandleValue.add
    }
    if(eventHandleValue.remove) {
      specialEvent.remove = eventHandleValue.remove
    }
    Special[e] = specialEvent
  }
});

