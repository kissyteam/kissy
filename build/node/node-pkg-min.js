/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 520 Apr 2 22:20
*/
KISSY.add("node",function(b){function e(a,c,d){var g;if(!(this instanceof e))return new e(a,c,d);if(!a)return null;if(a.nodeType)g=a;else if(typeof a==="string")g=h.create(a,d);c&&b.error("not implemented");this[0]=g}var h=b.DOM,f=e.prototype;b.each(["attr","removeAttr"],function(a){f[a]=function(c,d){var g=this[0];if(d===undefined)return h[a](g,c);else{h[a](g,c,d);return this}}});b.each(["val","text"],function(a){f[a]=function(c){var d=this[0];if(c===undefined)return h[a](d);else{h[a](d,c);return this}}});
b.each(["hasClass","addClass","removeClass","replaceClass","toggleClass"],function(a){f[a]=function(){var c=h[a].apply(h,[this[0]].concat(b.makeArray(arguments)));return typeof c==="boolean"?c:this}});b.mix(f,{one:function(a){return b.one(a,this[0])},all:function(a){return b.all(a,this[0])}});b.one=function(a,c){return new e(b.get(a,c))};b.Node=e});
KISSY.add("nodelist",function(b){function e(f){if(!(this instanceof e))return new e(f);h.apply(this,f||[])}var h=Array.prototype.push;b.mix(e.prototype,{length:0,each:function(f,a){for(var c=this.length,d=0,g;d<c;++d){g=new b.Node(this[d]);f.call(a||g,g,d,this)}return this}});b.all=function(f,a){return new e(b.query(f,a,true))};b.NodeList=e});
