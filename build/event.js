/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

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

