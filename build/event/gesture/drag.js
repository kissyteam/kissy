/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/drag
*/

KISSY.add("event/gesture/drag", ["event/gesture/base", "event/dom/base"], function(S, require) {
  var GestureBase = require("event/gesture/base");
  var addGestureEvent = GestureBase.addEvent;
  var DomEvent = require("event/dom/base");
  var SingleTouch = GestureBase.SingleTouch;
  var DRAG_START = "gestureDragStart", DRAG_END = "gestureDragEnd", DRAG = "gestureDrag", SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
  var doc = document;
  function getDistance(p1, p2) {
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
  function startDrag(self, e) {
    var currentTouch = self.lastTouches[0];
    var startPos = self.startPos;
    if(getDistance(currentTouch, startPos) > MIN_DISTANCE) {
      if(self.isStarted) {
        sample(self, e)
      }else {
        if(doc.body.setCapture) {
          doc.body.setCapture()
        }
        self.isStarted = true
      }
      DomEvent.fire(self.dragTarget, DRAG_START, getEventObject(self, e))
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
    ret.touch = currentTouch;
    ret.gestureType = e.gestureType;
    return ret
  }
  function Drag() {
  }
  S.extend(Drag, SingleTouch, {start:function() {
    var self = this;
    Drag.superclass.start.apply(self, arguments);
    var touch = self.lastTouches[0];
    self.lastTime = self.startTime;
    self.dragTarget = touch.target;
    self.startPos = self.lastPos = {pageX:touch.pageX, pageY:touch.pageY}
  }, move:function(e) {
    var self = this;
    Drag.superclass.move.apply(self, arguments);
    if(!self.isStarted) {
      startDrag(self, e)
    }else {
      sample(self, e);
      DomEvent.fire(self.dragTarget, DRAG, getEventObject(self, e))
    }
  }, end:function(e) {
    var self = this;
    var currentTouch = self.lastTouches[0];
    var currentTime = e.timeStamp;
    var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
    var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
    DomEvent.fire(self.dragTarget, DRAG_END, getEventObject(self, e, {velocityX:velocityX || 0, velocityY:velocityY || 0}));
    if(doc.body.releaseCapture) {
      doc.body.releaseCapture()
    }
  }});
  addGestureEvent([DRAG_START, DRAG, DRAG_END], {handle:new Drag});
  return{DRAG_START:DRAG_START, DRAG:DRAG, DRAG_END:DRAG_END}
});

