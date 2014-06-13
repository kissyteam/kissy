/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:43
*/
(function(d){d.use("util,querystring",function(a,b,c){b.mix(a,b);a.param=c.stringify;a.unparam=c.parse});d.add("event",["util","event/dom","event/custom"],function(a,b){var c=a.Event={};b("util").mix(c,b("event/dom"));c.Target=b("event/custom").Target;return c});var i={ua:"UA",json:"JSON",cookie:"Cookie","dom/base":"DOM",event:"Event",io:"IO","anim/timer":"Anim","anim/transition":"Anim",base:"Base"},j={core:{alias:"dom,event,io,anim,base,node,json,ua,cookie".split(",")},node:{afterAttach:function(a){d.Node=
d.NodeList=a;d.one=a.one;d.all=a.all}}},e;for(e in i)(function(a,b){j[a]={afterAttach:function(a){d[b]=d[b]||a}}})(e,i[e]);d.config("modules",j);d.namespace=function(){var a=d.makeArray(arguments),b=a.length,c=null,h,f,g,e=!0===a[b-1]&&b--;for(h=0;h<b;h++){g=(""+a[h]).split(".");c=e?window:this;for(f=window[g[0]]===c?1:0;f<g.length;++f)c=c[g[f]]=c[g[f]]||{}}return c}})(KISSY);
