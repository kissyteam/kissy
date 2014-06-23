/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 23 17:04
*/
(function(a){a.use(["util","querystring"],function(b,a,c){a.mix(b,a);b.param=c.stringify;b.unparam=c.parse});a.add("event",["util","event/dom","event/custom"],function(b,a){var c=b.Event={};a("util").mix(c,a("event/dom"));b.EventTarget=c.Target=a("event/custom").Target;return c});var i={ua:"UA",json:"JSON",cookie:"Cookie","dom/base":"DOM","anim/timer":"Anim","anim/transition":"Anim",base:"Base"},j={core:{alias:"dom,event,io,anim,base,node,json,ua,cookie".split(",")},io:{afterAttach:function(b){a.ajax=
a.Ajax=a.io=a.IO=b}},node:{afterAttach:function(b){a.Node=a.NodeList=b;a.one=b.one;a.all=b.all}}},e;for(e in i)(function(b,d){j[b]={afterAttach:function(b){a[d]=a[d]||b}}})(e,i[e]);a.config("modules",j);a.namespace=function(){var b=a.makeArray(arguments),d=b.length,c=null,h,f,g,e=!0===b[d-1]&&d--;for(h=0;h<d;h++){g=(""+b[h]).split(".");c=e?window:this;for(f=window[g[0]]===c?1:0;f<g.length;++f)c=c[g[f]]=c[g[f]]||{}}return c};KISSY.use("UA",function(a,d){a.UA=d})})(KISSY);
