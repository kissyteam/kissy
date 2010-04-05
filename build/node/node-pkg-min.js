/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 522 Apr 5 22:24
*/
KISSY.add("node",function(b){function f(a,c,e){var g;if(!(this instanceof f))return new f(a,c,e);if(!a)return null;if(a.nodeType)g=a;else if(typeof a==="string")g=h.create(a,e);c&&b.error("not implemented");this[0]=g}var h=b.DOM,d=f.prototype;b.each(["attr","removeAttr","css"],function(a){d[a]=function(c,e){var g=this[0];if(e===undefined)return h[a](g,c);else{h[a](g,c,e);return this}}});b.each(["val","text","html"],function(a){d[a]=function(c){var e=this[0];if(c===undefined)return h[a](e);else{h[a](e,
c);return this}}});b.each(["children","siblings","next","prev","parent"],function(a){d[a]=function(){var c=h[a](this[0]);return c?new b[c.length?"NodeList":"Node"](c):null}});b.each(["hasClass","addClass","removeClass","replaceClass","toggleClass"],function(a){d[a]=function(){var c=h[a].apply(h,[this[0]].concat(b.makeArray(arguments)));return typeof c==="boolean"?c:this}});b.mix(d,b.EventTarget);d._addEvent=function(a,c){b.Event._simpleAdd(this[0],a,c)};delete d.fire;b.mix(d,{one:function(a){return b.one(a,
this[0])},all:function(a){return b.all(a,this[0])}});b.one=function(a,c){return new f(b.get(a,c))};b.Node=f});KISSY.add("nodelist",function(b){function f(d){if(!(this instanceof f))return new f(d);h.apply(this,d||[])}var h=Array.prototype.push;b.mix(f.prototype,{length:0,each:function(d,a){for(var c=this.length,e=0,g;e<c;++e){g=new b.Node(this[e]);d.call(a||g,g,e,this)}return this}});b.all=function(d,a){return new f(b.query(d,a,true))};b.NodeList=f});
