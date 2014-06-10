/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 9 12:04
*/
(function(a){a.use("util",function(a,b){b.mix(a,b)});a.add("event",["util","event/dom","event/custom"],function(a,b){var d=a.Event={};b("util").mix(d,b("event/dom"));d.Target=b("event/custom").Target;return d});var e={ua:"UA",json:"JSON",cookie:"Cookie","dom/base":"DOM",event:"Event",node:"Node",io:"IO","anim/timer":"Anim","anim/transition":"Anim",base:"Base"},f={},c;for(c in e)(function(c,b){f[c]={afterAttach:function(c){a[b]=a[b]||c}}})(c,e[c]);a.config("modules",f)})(KISSY);
