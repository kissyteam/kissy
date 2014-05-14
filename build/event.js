/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:26
*/
KISSY.add("event",["util","event/dom","event/custom"],function(c,a){var b=c.Event={};a("util").mix(b,a("event/dom"));b.Target=a("event/custom").Target;return b});
