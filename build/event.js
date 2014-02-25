/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 19:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 event
*/

KISSY.add("event", ["event/dom", "event/custom"], function(S, require) {
  var DomEvent = require("event/dom");
  var CustomEvent = require("event/custom");
  var Event = S.Event = S.merge(DomEvent, {DomEvent:DomEvent, CustomEvent:CustomEvent});
  Event.global = CustomEvent.global;
  S.EventTarget = Event.Target = CustomEvent.Target;
  return Event
});

