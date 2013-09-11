/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 11 12:42
*/
KISSY.add("anim",function(b,k,g,h,i){function a(a,e,d,f,c){if(a.node)c=a;else{"string"==typeof e?(e=b.unparam(""+e,";",":"),b.each(e,function(c,a){var d=b.trim(a);d&&(e[d]=b.trim(c));(!d||d!=a)&&delete e[a]})):e=b.clone(e);if(b.isPlainObject(d))c=b.clone(d);else if(c={complete:c},d&&(c.duration=d),f)c.easing=f;c.node=a;c.to=e}c=b.merge(j,c,{useTransition:b.config("anim/useTransition")});if(c.useTransition&&i)return"use transition anim",new i(c);"use js timer anim";return new h(c)}var f=g.Utils,j=
{duration:1,easing:"linear"};b.each(["pause","resume"],function(b){a[b]=function(a,d){return null===d||"string"==typeof d||!1===d?f.pauseOrResumeQueue(a,d,b):f.pauseOrResumeQueue(a,void 0,b)}});a.isRunning=f.isElRunning;a.isPaused=f.isElPaused;a.stop=f.stopEl;a.Easing=h.Easing;b.Anim=a;a.Q=g.Q;return a},{requires:["dom","anim/base","anim/timer",KISSY.Features.isTransitionSupported()?"anim/transition":""]});
