/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 20 17:32
*/
/*
 Combined modules by KISSY Module Compiler: 

 xtemplate/nodejs
*/

KISSY.add("xtemplate/nodejs", ["xtemplate"], function(S, require) {
  var fs = requireNode("fs");
  var iconv = requireNode("iconv-lite");
  var XTemplate = require("xtemplate");
  var cached = {};
  var globalConfig = {extname:"html", encoding:"utf-8"};
  function merge(config) {
    var ret = {};
    for(var i in globalConfig) {
      ret[i] = globalConfig[i]
    }
    if(config) {
      for(i in config) {
        ret[i] = config[i]
      }
    }
    return ret
  }
  return{config:function(options) {
    S.mix(globalConfig, options)
  }, loadFromModuleName:function(moduleName, config) {
    config = merge(config);
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
    var encoding = cfg.encoding;
    return function(subTplName) {
      if(cacheFile && cached[subTplName]) {
        return cached[subTplName]
      }
      var module = new S.Loader.Module({name:subTplName, type:extname, runtime:S});
      var tpl;
      if(encoding === "utf-8") {
        tpl = fs.readFileSync((new S.Uri(module.getPath())).getPath(), {encoding:"utf-8"})
      }else {
        var buf = fs.readFileSync((new S.Uri(module.getPath())).getPath());
        tpl = iconv.decode(buf, encoding)
      }
      if(cacheFile) {
        cached[subTplName] = tpl
      }
      return tpl
    }
  }
});

