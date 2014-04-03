/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Apr 3 17:41
*/
/*
 Combined modules by KISSY Module Compiler: 

 xtemplate
*/

KISSY.add("xtemplate", ["util", "xtemplate/runtime", "xtemplate/compiler"], function(S, require) {
  require("util");
  var XTemplateRuntime = require("xtemplate/runtime");
  var Compiler = require("xtemplate/compiler");
  var cache = XTemplate.cache = {};
  function compile(tpl, config) {
    var fn;
    var cacheable = !config || config.cache !== false;
    if(cacheable && (fn = cache[tpl])) {
      return fn
    }
    fn = Compiler.compileToFn(tpl, config && config.name);
    if(cacheable) {
      cache[tpl] = fn
    }
    return fn
  }
  function XTemplate(tpl, config) {
    if(typeof tpl === "string") {
      tpl = compile(tpl, config)
    }
    XTemplate.superclass.constructor.call(this, tpl, config)
  }
  S.extend(XTemplate, XTemplateRuntime, {}, {Compiler:Compiler, Scope:XTemplateRuntime.Scope, RunTime:XTemplateRuntime, addCommand:XTemplateRuntime.addCommand, removeCommand:XTemplateRuntime.removeCommand});
  return XTemplate
});

