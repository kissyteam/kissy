/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
KISSY.add("editor/plugin/flash-bridge",["logger-manager","util","editor","swf","event/custom"],function(h,d,k,i){function e(a){this._init(a)}d("logger-manager");var f=d("util"),h=d("editor"),j=d("swf"),d=d("event/custom"),g={};f.augment(e,d.Target,{_init:function(a){var b=f.guid("flash-bridge-");a.id=b;a.attrs=a.attrs||{};a.params=a.params||{};var c=a.attrs,d=a.params,e=d.flashVars=d.flashVars||{};f.mix(c,{width:1,height:1},!1);f.mix(d,{allowScriptAccess:"always",allowNetworking:"all",scale:"noScale"},
!1);f.mix(e,{shareData:!1,useCompression:!1},!1);c={YUISwfId:b,YUIBridgeCallback:"KISSY.require('editor').FlashBridge.EventHandler"};a.ajbridge&&(c={swfID:b,jsEntry:"KISSY.require('editor').FlashBridge.EventHandler"});f.mix(e,c);g[b]=this;this.id=b;this.swf=new j(a);this._expose(a.methods)},_expose:function(a){for(var b=this,c=0;c<a.length;c++)(function(a){b[a]=function(){return b._callSWF(a,f.makeArray(arguments))}})(a[c])},_callSWF:function(a,b){return this.swf.callSWF(a,b)},_eventHandler:function(a){var b=
a.type;"log"!==b&&b&&this.fire(b,a)},ready:function(a){if(this._ready)a.call(this);else this.on("contentReady",a)},destroy:function(){this.swf.destroy();delete g[this.id]}});e.EventHandler=function(a,b){var c=g[a];c&&setTimeout(function(){c._eventHandler.call(c,b)},100)};h.FlashBridge=e;i.exports=e});
