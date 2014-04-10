/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 19:04
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/edge-drag
*/

KISSY.add("event/gesture/edge-drag", ["event/gesture/util", "event/dom/base"], function(S, require) {
  var GestureUtil = require("event/gesture/util");
  var addGestureEvent = GestureUtil.addEvent;
  var DomEvent = require("event/dom/base");
  var SingleTouch = GestureUtil.SingleTouch;
  var MAX_OFFSET = 35, EDGE_DRAG_START = "edgeDragStart", EDGE_DRAG = "edgeDrag", EDGE_DRAG_END = "edgeDragEnd", MIN_EDGE_DISTANCE = 60;
  function fire(self, e, move) {
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, event, direction;
    if(self.isVertical && absDeltaX > MAX_OFFSET) {
      self.isVertical = 0
    }
    if(self.isHorizontal && absDeltaY > MAX_OFFSET) {
      self.isHorizontal = 0
    }
    if(self.isVertical && self.isHorizontal) {
      if(absDeltaY > absDeltaX) {
        self.isHorizontal = 0
      }else {
        self.isVertical = 0
      }
    }
    if(self.isHorizontal) {
      direction = self.direction = deltaX < 0 ? "left" : "right"
    }else {
      if(self.isVertical) {
        direction = self.direction = deltaY < 0 ? "up" : "down"
      }else {
        direction = self.direction
      }
    }
    if(direction === "up" || direction === "down") {
      distance = absDeltaY
    }else {
      distance = absDeltaX
    }
    var velocityX, velocityY;
    var duration = e.timeStamp - self.startTime;
    if(!move) {
      event = EDGE_DRAG_END;
      if(direction === "left" || direction === "right") {
        velocityX = distance / duration
      }else {
        velocityY = distance / duration
      }
    }else {
      if(self.isStarted) {
        event = EDGE_DRAG
      }else {
        event = EDGE_DRAG_START;
        var win = window;
        var invalidRegion = {left:win.pageXOffset + MIN_EDGE_DISTANCE, right:win.pageXOffset + win.innerWidth - MIN_EDGE_DISTANCE, top:win.pageYOffset + MIN_EDGE_DISTANCE, bottom:win.pageYOffset + win.innerHeight - MIN_EDGE_DISTANCE};
        if(direction === "right" && x > invalidRegion.left) {
          return false
        }else {
          if(direction === "left" && x < invalidRegion.right) {
            return false
          }else {
            if(direction === "down" && y > invalidRegion.top) {
              return false
            }else {
              if(direction === "up" && y < invalidRegion.bottom) {
                return false
              }
            }
          }
        }
        self.isStarted = 1;
        self.startTime = e.timeStamp
      }
    }
    DomEvent.fire(touch.target, event, {originalEvent:e.originalEvent, pageX:touch.pageX, pageY:touch.pageY, which:1, touch:touch, direction:direction, distance:distance, duration:duration / 1E3, velocityX:velocityX, velocityY:velocityY});
    return undefined
  }
  function EdgeDrag() {
  }
  S.extend(EdgeDrag, SingleTouch, {requiredGestureType:"touch", start:function() {
    var self = this;
    EdgeDrag.superclass.start.apply(self, arguments);
    var touch = self.lastTouches[0];
    self.isHorizontal = 1;
    self.isVertical = 1;
    self.startX = touch.pageX;
    self.startY = touch.pageY
  }, move:function(e) {
    EdgeDrag.superclass.move.apply(this, arguments);
    return fire(this, e, 1)
  }, end:function(e) {
    EdgeDrag.superclass.end.apply(this, arguments);
    return fire(this, e, 0)
  }});
  addGestureEvent([EDGE_DRAG, EDGE_DRAG_END, EDGE_DRAG_START], {handle:new EdgeDrag});
  return{EDGE_DRAG:EDGE_DRAG, EDGE_DRAG_START:EDGE_DRAG_START, EDGE_DRAG_END:EDGE_DRAG_END}
});

