/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/touch/double-touch
 event/gesture/touch/pinch
 event/gesture/touch/rotate
 event/gesture/touch/swipe
 event/gesture/touch
*/

KISSY.add("event/gesture/touch/double-touch", ["dom", "event/gesture/base"], function(S, require) {
  var Dom = require("dom");
  var Touch = require("event/gesture/base").Touch;
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
KISSY.add("event/gesture/touch/pinch", ["event/gesture/base", "event/dom/base", "./double-touch"], function(S, require) {
  var addGestureEvent = require("event/gesture/base").addEvent;
  var DomEvent = require("event/dom/base");
  var DoubleTouch = require("./double-touch");
  var PINCH = "pinch", PINCH_START = "pinchStart", PINCH_END = "pinchEnd";
  function getDistance(p1, p2) {
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  function Pinch() {
  }
  S.extend(Pinch, DoubleTouch, {requiredGestureType:"touch", move:function(e) {
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
  addGestureEvent([PINCH_START, PINCH_END], {handle:p});
  function prevent(e) {
    if(e.targetTouches.length === 2) {
      e.preventDefault()
    }
  }
  var config = {handle:p};
  if(S.Feature.isTouchEventSupported()) {
    config.setup = function() {
      this.addEventListener("touchmove", prevent, false)
    };
    config.tearDown = function() {
      this.removeEventListener("touchmove", prevent, false)
    }
  }
  addGestureEvent(PINCH, config);
  return{PINCH:PINCH, PINCH_START:PINCH_START, PINCH_END:PINCH_END}
});
KISSY.add("event/gesture/touch/rotate", ["event/gesture/base", "event/dom/base", "./double-touch"], function(S, require) {
  var addGestureEvent = require("event/gesture/base").addEvent;
  var DomEvent = require("event/dom/base");
  var DoubleTouch = require("./double-touch");
  var ROTATE_START = "rotateStart", ROTATE = "rotate", RAD_2_DEG = 180 / Math.PI, ROTATE_END = "rotateEnd";
  function Rotate() {
  }
  S.extend(Rotate, DoubleTouch, {requiredGestureType:"touch", move:function(e) {
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
  addGestureEvent([ROTATE_END, ROTATE_START], {handle:r});
  var config = {handle:r};
  if(S.Feature.isTouchEventSupported()) {
    config.setup = function() {
      this.addEventListener("touchmove", prevent, false)
    };
    config.tearDown = function() {
      this.removeEventListener("touchmove", prevent, false)
    }
  }
  addGestureEvent(ROTATE, config);
  return{ROTATE_START:ROTATE_START, ROTATE:ROTATE, ROTATE_END:ROTATE_END}
});
KISSY.add("event/gesture/touch/swipe", ["event/gesture/base", "event/dom/base"], function(S, require) {
  var GestureBase = require("event/gesture/base");
  var addGestureEvent = GestureBase.addEvent;
  var DomEvent = require("event/dom/base");
  var SingleTouch = GestureBase.SingleTouch;
  var SWIPE = "swipe", SWIPING = "swiping", MAX_DURATION = 1E3, MAX_OFFSET = 35, MIN_DISTANCE = 50;
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
    DomEvent.fire(touch.target, ing ? SWIPING : SWIPE, {originalEvent:e.originalEvent, pageX:touch.pageX, pageY:touch.pageY, which:1, touch:touch, direction:direction, distance:distance, duration:(e.timeStamp - self.startTime) / 1E3});
    return undefined
  }
  function Swipe() {
  }
  S.extend(Swipe, SingleTouch, {requiredGestureType:"touch", start:function() {
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
  addGestureEvent([SWIPE, SWIPING], {handle:new Swipe});
  return{SWIPE:SWIPE, SWIPING:SWIPING}
});
KISSY.add("event/gesture/touch", ["./touch/pinch", "./touch/rotate", "./touch/swipe"], function(S, require) {
  return S.merge(require("./touch/pinch"), require("./touch/rotate"), require("./touch/swipe"))
});

