/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 19:04
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/rotate
*/

KISSY.add("event/gesture/rotate", ["event/gesture/util", "event/dom/base"], function(S, require) {
  var GestureUtil = require("event/gesture/util");
  var DoubleTouch = GestureUtil.DoubleTouch;
  var addGestureEvent = GestureUtil.addEvent;
  var DomEvent = require("event/dom/base");
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

