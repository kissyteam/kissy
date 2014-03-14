/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
/*
 Combined modules by KISSY Module Compiler: 

 event
*/

KISSY.add("event", ["event/dom", "event/custom", "event/gesture"], function(S, require) {
  var DomEvent = require("event/dom");
  var CustomEvent = require("event/custom");
  var Gesture = require("event/gesture");
  S.Event = S.merge(DomEvent, {DomEvent:DomEvent, Target:CustomEvent.Target, global:CustomEvent.global, Gesture:Gesture.Enumeration, CustomEvent:CustomEvent});
  return S.Event
});

