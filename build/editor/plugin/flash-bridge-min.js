/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
KISSY.add("editor/plugin/flash-bridge",["editor","swf","event"],function(d,e){function f(a){this._init(a)}var i=e("editor"),j=e("swf"),k=e("event"),g={};d.augment(f,k.Target,{_init:function(a){var b=d.guid("flash-bridge-");a.id=b;a.attrs=a.attrs||{};a.params=a.params||{};var c=a.attrs,h=a.params,e=h.flashVars=h.flashVars||{};d.mix(c,{width:1,height:1},!1);d.mix(h,{allowScriptAccess:"always",allowNetworking:"all",scale:"noScale"},!1);d.mix(e,{shareData:!1,useCompression:!1},!1);c={YUISwfId:b,YUIBridgeCallback:"KISSY.require('editor').FlashBridge.EventHandler"};
a.ajbridge&&(c={swfID:b,jsEntry:"KISSY.require('editor').FlashBridge.EventHandler"});d.mix(e,c);g[b]=this;this.id=b;this.swf=new j(a);this._expose(a.methods)},_expose:function(a){for(var b=this,c=0;c<a.length;c++)(function(a){b[a]=function(){return b._callSWF(a,d.makeArray(arguments))}})(a[c])},_callSWF:function(a,b){return this.swf.callSWF(a,b)},_eventHandler:function(a){var b=a.type;"log"!==b&&b&&this.fire(b,a)},ready:function(a){if(this._ready)a.call(this);else this.on("contentReady",a)},destroy:function(){this.swf.destroy();
delete g[this.id]}});f.EventHandler=function(a,b){var c=g[a];c&&setTimeout(function(){c._eventHandler.call(c,b)},100)};return i.FlashBridge=f});
