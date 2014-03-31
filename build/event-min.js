/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 31 19:28
*/
KISSY.add("event",["event/dom","event/custom","event/gesture"],function(c,a){var b=a("event/dom"),d=a("event/custom"),e=a("event/gesture"),b=c.merge(b,{Target:d.Target,global:d.global,Gesture:e.Enumeration});return c.Event=b});
