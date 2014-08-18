/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/flash-bridge
*/

KISSY.add("editor/plugin/flash-bridge", ["editor", "swf", "event"], function(S, require) {
  var Editor = require("editor");
  var SWF = require("swf");
  var Event = require("event");
  var instances = {};
  var logger = S.getLogger("s/editor/plugin/flash-bridge");
  function FlashBridge(cfg) {
    this._init(cfg)
  }
  S.augment(FlashBridge, Event.Target, {_init:function(cfg) {
    var self = this, id = S.guid("flash-bridge-"), callback = "KISSY.require('editor').FlashBridge.EventHandler";
    cfg.id = id;
    cfg.attrs = cfg.attrs || {};
    cfg.params = cfg.params || {};
    var attrs = cfg.attrs, params = cfg.params, flashVars = params.flashVars = params.flashVars || {};
    S.mix(attrs, {width:1, height:1}, false);
    S.mix(params, {allowScriptAccess:"always", allowNetworking:"all", scale:"noScale"}, false);
    S.mix(flashVars, {shareData:false, useCompression:false}, false);
    var swfCore = {YUISwfId:id, YUIBridgeCallback:callback};
    if(cfg.ajbridge) {
      swfCore = {swfID:id, jsEntry:callback}
    }
    S.mix(flashVars, swfCore);
    instances[id] = self;
    self.id = id;
    self.swf = new SWF(cfg);
    self._expose(cfg.methods)
  }, _expose:function(methods) {
    var self = this;
    for(var i = 0;i < methods.length;i++) {
      var m = methods[i];
      (function(m) {
        self[m] = function() {
          return self._callSWF(m, S.makeArray(arguments))
        }
      })(m)
    }
  }, _callSWF:function(func, args) {
    return this.swf.callSWF(func, args)
  }, _eventHandler:function(event) {
    var self = this, type = event.type;
    if(type === "log") {
      logger.debug(event.message)
    }else {
      if(type) {
        self.fire(type, event)
      }
    }
  }, ready:function(fn) {
    var self = this;
    if(self._ready) {
      fn.call(this)
    }else {
      self.on("contentReady", fn)
    }
  }, destroy:function() {
    this.swf.destroy();
    delete instances[this.id]
  }});
  FlashBridge.EventHandler = function(id, event) {
    logger.debug("fire event: " + event.type);
    var instance = instances[id];
    if(instance) {
      setTimeout(function() {
        instance._eventHandler.call(instance, event)
      }, 100)
    }
  };
  Editor.FlashBridge = FlashBridge;
  return FlashBridge
});

