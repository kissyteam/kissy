/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 19 12:02
*/
KISSY.add("anim",["anim/base","anim/timer",KISSY.Features.isTransitionSupported()?"anim/transition":""],function(b){function a(a,e,d,f,c){if(a.node)c=a;else{"string"==typeof e?(e=b.unparam(""+e,";",":"),b.each(e,function(c,a){var d=b.trim(a);d&&(e[d]=b.trim(c));(!d||d!=a)&&delete e[a]})):e=b.clone(e);if(b.isPlainObject(d))c=b.clone(d);else if(c={complete:c},d&&(c.duration=d),f)c.easing=f;c.node=a;c.to=e}c=b.merge(defaultConfig,c,{useTransition:b.config("anim/useTransition")});if(c.useTransition&&
g)return"use transition anim",new g(c);"use js timer anim";return new h(c)}var i=this.require("anim/base"),h=this.require("anim/timer"),g=this.require(KISSY.Features.isTransitionSupported()?"anim/transition":"");b.each(["pause","resume"],function(b){a[b]=function(a,d){return null===d||"string"==typeof d||!1===d?Utils.pauseOrResumeQueue(a,d,b):Utils.pauseOrResumeQueue(a,void 0,b)}});a.isRunning=Utils.isElRunning;a.isPaused=Utils.isElPaused;a.stop=Utils.stopEl;a.Easing=h.Easing;b.Anim=a;a.Q=i.Q;return a});
