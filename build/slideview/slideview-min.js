/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-22 23:10:48
Revision: 333
*/
KISSY.add("slideview",function(d){var g=YAHOO.util,e=g.Dom,c=g.Event,f=YAHOO.lang,a={};function b(h,i){if(!(this instanceof arguments.callee)){return new arguments.callee(h,i)}this.container=e.get(h);this.config=d.merge(a,i||{});this._init()}d.mix(b.prototype,{_init:function(){}});d.mix(b.prototype,d.Triggerable);d.SlideView=b});
