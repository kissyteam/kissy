/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 6 11:39
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/dom/touch/handle-map
 event/dom/touch/touch
 event/dom/touch/single-touch
 event/dom/touch/tap
 event/dom/touch/swipe
 event/dom/touch/double-touch
 event/dom/touch/pinch
 event/dom/touch/rotate
 event/dom/touch/drag
 event/dom/touch/handle
 event/dom/touch
*/

KISSY.add("event/dom/touch/handle-map", [], function() {
  return{}
});
KISSY.add("event/dom/touch/touch", [], function(S) {
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
KISSY.add("event/dom/touch/single-touch", ["./touch"], function(S, require) {
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
KISSY.add("event/dom/touch/tap", ["./handle-map", "event/dom/base", "./single-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
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
  eventHandleMap[TAP_EVENT] = eventHandleMap[DOUBLE_TAP_EVENT] = eventHandleMap[SINGLE_TAP_EVENT] = eventHandleMap[TAP_HOLD_EVENT] = {handle:new Tap};
  return Tap
});
KISSY.add("event/dom/touch/swipe", ["./handle-map", "event/dom/base", "./single-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var SingleTouch = require("./single-touch");
  var event = "swipe", ingEvent = "swiping", MAX_DURATION = 1E3, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  function fire(self, e, ing) {
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, direction;
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
    DomEvent.fire(touch.target, ing ? ingEvent : event, {originalEvent:e.originalEvent, pageX:touch.pageX, pageY:touch.pageY, which:1, touch:touch, direction:direction, distance:distance, duration:(e.timeStamp - self.startTime) / 1E3});
    return undefined
  }
  function Swipe() {
  }
  S.extend(Swipe, SingleTouch, {start:function(e) {
    if(!e.isTouch) {
      return false
    }
    var self = this;
    Swipe.superclass.start.apply(self, arguments);
    self.isStarted = true;
    var touch = self.lastTouches[0];
    self.isHorizontal = 1;
    self.isVertical = 1;
    self.startX = touch.pageX;
    self.startY = touch.pageY
  }, move:function(e) {
    var self = this, time = e.timeStamp;
    Swipe.superclass.move.apply(self, arguments);
    if(time - self.startTime > MAX_DURATION) {
      return false
    }
    var touch = self.lastTouches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
    if(self.isVertical && absDeltaX > MAX_OFFSET) {
      self.isVertical = 0
    }
    if(self.isHorizontal && absDeltaY > MAX_OFFSET) {
      self.isHorizontal = 0
    }
    return fire(self, e, 1)
  }, end:function(e) {
    var self = this;
    if(self.move(e) === false) {
      return false
    }
    return fire(self, e, 0)
  }});
  eventHandleMap[event] = eventHandleMap[ingEvent] = {handle:new Swipe};
  return Swipe
});
KISSY.add("event/dom/touch/double-touch", ["dom", "./touch"], function(S, require) {
  var Dom = require("dom");
  var Touch = require("./touch");
  function DoubleTouch() {
  }
  S.extend(DoubleTouch, Touch, {requiredTouchCount:2, getCommonTarget:function(e) {
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
  }});
  return DoubleTouch
});
KISSY.add("event/dom/touch/pinch", ["./handle-map", "event/dom/base", "./double-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var DoubleTouch = require("./double-touch");
  var PINCH = "pinch", PINCH_START = "pinchStart", PINCH_END = "pinchEnd";
  function getDistance(p1, p2) {
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  function Pinch() {
  }
  S.extend(Pinch, DoubleTouch, {move:function(e) {
    var self = this;
    Pinch.superclass.move.apply(self, arguments);
    var touches = self.lastTouches;
    if(!(touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0)) {
      return
    }
    var distance = getDistance(touches[0], touches[1]);
    if(!self.isStarted) {
      self.isStarted = true;
      self.startDistance = distance;
      var target = self.target = self.getCommonTarget(e);
      DomEvent.fire(target, PINCH_START, S.mix(e, {distance:distance, scale:1}))
    }else {
      DomEvent.fire(self.target, PINCH, S.mix(e, {distance:distance, scale:distance / self.startDistance}))
    }
  }, end:function(e) {
    var self = this;
    Pinch.superclass.end.apply(self, arguments);
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
  if(S.Feature.isTouchEventSupported()) {
    config.setup = function() {
      this.addEventListener("touchmove", prevent, false)
    };
    config.tearDown = function() {
      this.removeEventListener("touchmove", prevent, false)
    }
  }
  return Pinch
});
KISSY.add("event/dom/touch/rotate", ["./handle-map", "event/dom/base", "./double-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var DoubleTouch = require("./double-touch");
  var ROTATE_START = "rotateStart", ROTATE = "rotate", RAD_2_DEG = 180 / Math.PI, ROTATE_END = "rotateEnd";
  function Rotate() {
  }
  S.extend(Rotate, DoubleTouch, {move:function(e) {
    var self = this;
    Rotate.superclass.move.apply(self, arguments);
    var touches = self.lastTouches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
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
    self.lastAngle = angle;
    if(!self.isStarted) {
      self.isStarted = true;
      self.startAngle = angle;
      self.target = self.getCommonTarget(e);
      DomEvent.fire(self.target, ROTATE_START, S.mix(e, {angle:angle, rotation:0}))
    }else {
      DomEvent.fire(self.target, ROTATE, S.mix(e, {angle:angle, rotation:angle - self.startAngle}))
    }
  }, end:function(e) {
    var self = this;
    Rotate.superclass.end.apply(self, arguments);
    self.lastAngle = undefined;
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
  if(S.Feature.isTouchEventSupported()) {
    config.setup = function() {
      this.addEventListener("touchmove", prevent, false)
    };
    config.tearDown = function() {
      this.removeEventListener("touchmove", prevent, false)
    }
  }
  return Rotate
});
KISSY.add("event/dom/touch/drag", ["./handle-map", "event/dom/base", "./single-touch"], function(S, require) {
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  var SingleTouch = require("./single-touch");
  var dragStartEvent = "dragStart", dragEndEvent = "dragEnd", dragEvent = "drag", SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
  function getDistance(p1, p2) {
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  function startDrag(self, e) {
    var currentTouch = self.lastTouches[0];
    var startPos = self.startPos;
    if(getDistance(currentTouch, startPos) > MIN_DISTANCE) {
      self.isStarted = true;
      sample(self, e);
      DomEvent.fire(currentTouch.target, dragStartEvent, getEventObject(self, e))
    }
  }
  function sample(self, e) {
    var currentTouch = self.lastTouches[0];
    var currentTime = e.timeStamp;
    if(currentTime - self.lastTime > SAMPLE_INTERVAL) {
      self.lastPos = {pageX:currentTouch.pageX, pageY:currentTouch.pageY};
      self.lastTime = currentTime
    }
  }
  function getEventObject(self, e, ret) {
    var startPos = self.startPos;
    ret = ret || {};
    var currentTouch = self.lastTouches[0];
    ret.pageX = currentTouch.pageX;
    ret.pageY = currentTouch.pageY;
    ret.originalEvent = e.originalEvent;
    ret.deltaX = currentTouch.pageX - startPos.pageX;
    ret.deltaY = currentTouch.pageY - startPos.pageY;
    ret.startTime = self.startTime;
    ret.startPos = self.startPos;
    ret.isTouch = e.isTouch;
    ret.touch = currentTouch;
    return ret
  }
  function Drag() {
  }
  S.extend(Drag, SingleTouch, {start:function() {
    var self = this;
    Drag.superclass.start.apply(self, arguments);
    var touch = self.lastTouches[0];
    self.lastTime = self.startTime;
    self.startPos = self.lastPos = {pageX:touch.pageX, pageY:touch.pageY}
  }, move:function(e) {
    var self = this;
    Drag.superclass.move.apply(self, arguments);
    if(!self.isStarted) {
      startDrag(self, e)
    }else {
      sample(self, e);
      DomEvent.fire(self.lastTouches[0].target, dragEvent, getEventObject(self, e))
    }
  }, end:function(e) {
    var self = this;
    var currentTouch = self.lastTouches[0];
    var currentTime = e.timeStamp;
    var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
    var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
    DomEvent.fire(currentTouch.target, dragEndEvent, getEventObject(self, e, {velocityX:velocityX, velocityY:velocityY}))
  }});
  eventHandleMap[dragStartEvent] = eventHandleMap[dragEvent] = eventHandleMap[dragEndEvent] = {handle:new Drag};
  return Drag
});
KISSY.add("event/dom/touch/handle", ["dom", "./handle-map", "event/dom/base", "./tap", "./swipe", "./pinch", "./rotate", "./drag"], function(S, require) {
  var Dom = require("dom");
  var eventHandleMap = require("./handle-map");
  var DomEvent = require("event/dom/base");
  require("./tap");
  require("./swipe");
  require("./pinch");
  require("./rotate");
  require("./drag");
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

