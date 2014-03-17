/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 17 21:36
*/
/*
 Combined modules by KISSY Module Compiler: 

 xtemplate
*/

KISSY.add("xtemplate", ["xtemplate/runtime", "xtemplate/compiler"], function(S, require) {
  var XTemplateRuntime = require("xtemplate/runtime");
  var compiler = require("xtemplate/compiler");
  var cache = XTemplate.cache = {};
  function XTemplate() {
    XTemplate.superclass.constructor.apply(this, arguments)
  }
  S.extend(XTemplate, XTemplateRuntime, {compile:function() {
    var fn, self = this, config = self.config, tpl = self.tpl;
    if(config.cache !== false && (fn = cache[tpl])) {
      return fn
    }
    fn = compiler.compileToFn(tpl, self.name);
    if(config.cache !== false) {
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

