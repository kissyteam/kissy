/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:16
*/
KISSY.add("editor/plugin/flash-bridge",function(d,h,i){function e(a){this._init(a)}var f={};d.augment(e,d.EventTarget,{_init:function(a){var b=d.guid("flashbridge-");a.id=b;a.attrs=a.attrs||{};a.params=a.params||{};var c=a.attrs,g=a.params,e=g.flashVars=g.flashVars||{};d.mix(c,{width:1,height:1},!1);d.mix(g,{allowScriptAccess:"always",allowNetworking:"all",scale:"noScale"},!1);d.mix(e,{shareData:!1,useCompression:!1},!1);c={YUISwfId:b,YUIBridgeCallback:"KISSY.Editor.FlashBridge.EventHandler"};a.ajbridge&&
(c={swfID:b,jsEntry:"KISSY.Editor.FlashBridge.EventHandler"});d.mix(e,c);f[b]=this;this.id=b;this.swf=new h(a);this._expose(a.methods)},_expose:function(a){for(var b=this,c=0;c<a.length;c++)(function(a){b[a]=function(){return b._callSWF(a,d.makeArray(arguments))}})(a[c])},_callSWF:function(a,b){return this.swf.callSWF(a,b)},_eventHandler:function(a){var b=a.type;"log"!==b&&b&&this.fire(b,a)},ready:function(a){if(this._ready)a.call(this);else this.on("contentReady",a)},destroy:function(){this.swf.destroy();
delete f[this.id]}});e.EventHandler=function(a,b){var c=f[a];c&&setTimeout(function(){c._eventHandler.call(c,b)},100)};return i.FlashBridge=e},{requires:["swf","editor"]});
