/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:32
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 xtemplate
*/

KISSY.add("xtemplate", ["xtemplate/runtime", "xtemplate/compiler"], function(S, require) {
  var XTemplateRuntime = require("xtemplate/runtime");
  var compiler = require("xtemplate/compiler");
  var cache = XTemplate.cache = {};
  function compile(tpl, config) {
    var fn;
    if(config.cache && (fn = cache[tpl])) {
      return fn
    }
    fn = compiler.compileToFn(tpl, config);
    if(config.cache) {
      cache[tpl] = fn
    }
    return fn
  }
  var defaultCfg = {cache:true};
  function XTemplate(tpl, config) {
    var self = this;
    config = S.merge(defaultCfg, config);
    if(typeof tpl === "string") {
      tpl = compile(tpl, config)
    }
    XTemplate.superclass.constructor.call(self, tpl, config)
  }
  S.extend(XTemplate, XTemplateRuntime, {}, {compiler:compiler, Scope:XTemplateRuntime.Scope, RunTime:XTemplateRuntime, addCommand:XTemplateRuntime.addCommand, removeCommand:XTemplateRuntime.removeCommand});
  return XTemplate
});

