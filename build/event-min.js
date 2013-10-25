/*
Copyright 2013, KISSY v1.40
MIT Licensed
build time: Sep 18 00:20
*/
KISSY.add("event",function(b,a,c){a=b.Event=b.merge(a,{DomEvent:a,CustomEvent:c});a.global=c.global;b.EventTarget=a.Target=c.targetObject;return a},{requires:["event/dom","event/custom"]});
