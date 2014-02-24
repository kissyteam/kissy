/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 00:53
*/
/*
 Combined modules by KISSY Module Compiler: 

 xtemplate
*/

KISSY.add("xtemplate", ["xtemplate/runtime", "xtemplate/compiler"], function(S, require) {
  var XTemplateRuntime = require("xtemplate/runtime");
  var compiler = require("xtemplate/compiler");
  var cache = XTemplate.cache = {};
  function XTemplate(tpl, config) {
    var self = this;
    if(config && config.cache === false) {
      self.cache = false
    }
    XTemplate.superclass.constructor.call(self, tpl, config)
  }
  S.extend(XTemplate, XTemplateRuntime, {cache:true, derive:function() {
    var engine = XTemplate.superclass.derive.apply(this, arguments);
    engine.cache = this.cache;
    return engine
  }, compile:function() {
    var fn, self = this, tpl = self.tpl;
    if(self.cache && (fn = cache[tpl])) {
      return fn
    }
    fn = compiler.compileToFn(tpl, self.name);
    if(self.cache) {
      cache[tpl] = fn
    }
    return fn
  }, render:function() {
    var self = this;
    if(!self.compiled) {
      self.compiled = 1;
      var tpl = self.tpl;
      if(typeof tpl === "string") {
        self.tpl = self.compile()
      }
    }
    return XTemplate.superclass.render.apply(self, arguments)
  }}, {compiler:compiler, Scope:XTemplateRuntime.Scope, RunTime:XTemplateRuntime, addCommand:XTemplateRuntime.addCommand, removeCommand:XTemplateRuntime.removeCommand});
  return XTemplate
});

