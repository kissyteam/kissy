/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 19:04
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/gesture/base
*/

KISSY.add("event/gesture/base", ["event/dom/base", "event/gesture/util"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var GestureUtil = require("event/gesture/util");
  var addGestureEvent = GestureUtil.addEvent;
  var BaseGesture = {START:"gestureStart", MOVE:"gestureMove", END:"gestureEnd"};
  function addBaseGestureEvent(event, onHandler) {
    var handle = {isActive:1};
    handle[onHandler] = function(e) {
      DomEvent.fire(e.target, event, e)
    };
    addGestureEvent(event, {order:1, handle:handle})
  }
  addBaseGestureEvent(BaseGesture.START, "onTouchStart");
  addBaseGestureEvent(BaseGesture.MOVE, "onTouchMove");
  addBaseGestureEvent(BaseGesture.END, "onTouchEnd");
  return BaseGesture
});

