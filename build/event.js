/*
Copyright 2013, KISSY v1.42
MIT Licensed
build time: Dec 4 22:16
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

