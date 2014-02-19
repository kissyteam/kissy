/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 19 15:47
*/
/*
 Combined modules by KISSY Module Compiler: 

 xtemplate/nodejs
*/

KISSY.add("xtemplate/nodejs", ["xtemplate"], function(S, require) {
  var fs = requireNode("fs");
  var XTemplate = require("xtemplate");
  var cached = {};
  return{loadFromModuleName:function(moduleName, config) {
    config = config || {};
    config.extname = config.extname || "html";
    var loader = getLoader(config);
    config.name = moduleName;
    config.loader = loader;
    var tpl = loader(moduleName);
    delete config.extname;
    return new XTemplate(tpl, config)
  }};
  function getLoader(cfg) {
    var cacheFile = cfg.cache;
    var extname = cfg.extname;
    return function(subTplName) {
      if(cacheFile && cached[subTplName]) {
        return cached[subTplName]
      }
      var module = new S.Loader.Module({name:subTplName, type:extname, runtime:S});
      var tpl = fs.readFileSync((new S.Uri(module.getPath())).getPath(), {encoding:"utf-8"});
      if(cacheFile) {
        cached[subTplName] = tpl
      }
      return tpl
    }
  }
});

