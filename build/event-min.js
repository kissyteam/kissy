/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 18:00
*/
KISSY.add("event",["event/dom","event/custom","event/gesture"],function(a,b){var d=b("event/dom"),c=b("event/custom"),e=b("event/gesture");a.Event=a.merge(d,{DomEvent:d,Target:c.Target,global:c.global,Gesture:e.Enumeration,CustomEvent:c});return a.Event});
