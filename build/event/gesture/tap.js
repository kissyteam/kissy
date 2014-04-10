/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 19:04
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/tap
*/

KISSY.add("event/gesture/tap", ["event/gesture/util", "event/dom/base", "ua"], function(S, require) {
  var GestureUtil = require("event/gesture/util");
  var addGestureEvent = GestureUtil.addEvent;
  var DomEvent = require("event/dom/base");
  var SingleTouch = GestureUtil.SingleTouch;
  var UA = require("ua");
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
    if(eventObject.isDefaultPrevented() && UA.mobile) {
      if(UA.ios) {
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
  return{TAP:TAP_EVENT, SINGLE_TAP:SINGLE_TAP_EVENT, DOUBLE_TAP:DOUBLE_TAP_EVENT, TAP_HOLD:TAP_HOLD_EVENT}
});

