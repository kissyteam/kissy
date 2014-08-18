/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:15
*/
KISSY.add("anim",["anim/base","anim/timer","anim/transition?"],function(b,g){function a(a,e,d,f,c){if(a.node)c=a;else{"string"===typeof e?(e=b.unparam(""+e,";",":"),b.each(e,function(c,a){var d=b.trim(a);d&&(e[d]=b.trim(c));(!d||d!==a)&&delete e[a]})):e=b.clone(e);if(b.isPlainObject(d))c=b.clone(d);else if(c={complete:c},d&&(c.duration=d),f)c.easing=f;c.node=a;c.to=e}c=b.merge(k,c,{useTransition:b.config("anim/useTransition")});return c.useTransition&&h?new h(c):new i(c)}var j=g("anim/base"),i=g("anim/timer"),
h=g("anim/transition?"),f=j.Utils,k={duration:1,easing:"linear"};b.each(["pause","resume"],function(b){a[b]=function(a,d){return null===d||"string"===typeof d||!1===d?f.pauseOrResumeQueue(a,d,b):f.pauseOrResumeQueue(a,void 0,b)}});a.isRunning=f.isElRunning;a.isPaused=f.isElPaused;a.stop=f.stopEl;a.Easing=i.Easing;b.Anim=a;a.Q=j.Q;return a});
