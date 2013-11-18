/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 19 01:46
*/
KISSY.add("event",function(b,a,c){a=b.Event=b.merge(a,{DomEvent:a,CustomEvent:c});a.global=c.global;b.EventTarget=a.Target=c.Target;return a},{requires:["event/dom","event/custom"]});
