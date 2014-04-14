/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 14 14:16
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/swipe
*/

KISSY.add("event/gesture/swipe", ["event/gesture/util", "event/dom/base"], function(S, require) {
  var GestureUtil = require("event/gesture/util");
  var addGestureEvent = GestureUtil.addEvent;
  var DomEvent = require("event/dom/base");
  var SingleTouch = GestureUtil.SingleTouch;
  var SWIPE = "swipe", SWIPE_START = "swipeStart", SWIPING = "swiping", MAX_DURATION = 1E3, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  function fire(self, e, ing) {
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, time = e.timeStamp, direction;
    if(time - self.startTime > MAX_DURATION) {
      return false
    }
    if(self.isVertical && absDeltaX > MAX_OFFSET) {
      self.isVertical = 0
    }
    if(self.isHorizontal && absDeltaY > MAX_OFFSET) {
      self.isHorizontal = 0
    }
    if(ing) {
      if(self.isVertical && self.isHorizontal) {
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
    var event;
    if(!ing) {
      event = SWIPE
    }else {
      if(direction && !self.isStarted) {
        self.isStarted = 1;
        event = SWIPE_START
      }else {
        event = SWIPING
      }
    }
    DomEvent.fire(touch.target, event, {originalEvent:e.originalEvent, pageX:touch.pageX, pageY:touch.pageY, which:1, touch:touch, direction:direction, distance:distance, duration:(e.timeStamp - self.startTime) / 1E3});
    return undefined
  }
  function Swipe() {
  }
  S.extend(Swipe, SingleTouch, {requiredGestureType:"touch", start:function() {
    var self = this;
    Swipe.superclass.start.apply(self, arguments);
    var touch = self.lastTouches[0];
    self.isHorizontal = 1;
    self.isVertical = 1;
    self.startX = touch.pageX;
    self.startY = touch.pageY
  }, move:function(e) {
    Swipe.superclass.move.apply(this, arguments);
    return fire(this, e, 1)
  }, end:function(e) {
    Swipe.superclass.end.apply(this, arguments);
    return fire(this, e, 0)
  }});
  addGestureEvent([SWIPE, SWIPING], {handle:new Swipe});
  return{SWIPE:SWIPE, SWIPING:SWIPING}
});

