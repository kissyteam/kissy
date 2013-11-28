/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 28 17:03
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 xtemplate/runtime/commands
 xtemplate/runtime
*/

KISSY.add("xtemplate/runtime/commands", ["path"], function(S, require) {
  var commands;
  var Path = require("path");
  commands = {each:function(scopes, config) {
    var params = config.params;
    var param0 = params[0];
    var buffer = "";
    var xcount;
    if(param0) {
      var opScopes = [0, 0].concat(scopes);
      if(S.isArray(param0)) {
        xcount = param0.length;
        for(var xindex = 0;xindex < xcount;xindex++) {
          opScopes[0] = param0[xindex];
          opScopes[1] = {xcount:xcount, xindex:xindex};
          buffer += config.fn(opScopes)
        }
      }else {
        for(var name in param0) {
          opScopes[0] = param0[name];
          opScopes[1] = {xindex:name};
          buffer += config.fn(opScopes)
        }
      }
    }else {
      if(config.inverse) {
        buffer = config.inverse(scopes)
      }
    }
    return buffer
  }, "with":function(scopes, config) {
    var params = config.params;
    var param0 = params[0];
    var opScopes = [0].concat(scopes);
    var buffer = "";
    if(param0) {
      opScopes[0] = param0;
      buffer = config.fn(opScopes)
    }else {
      if(config.inverse) {
        buffer = config.inverse(scopes)
      }
    }
    return buffer
  }, "if":function(scopes, config) {
    var params = config.params;
    var param0 = params[0];
    var buffer = "";
    if(param0) {
      if(config.fn) {
        buffer = config.fn(scopes)
      }
    }else {
      if(config.inverse) {
        buffer = config.inverse(scopes)
      }
    }
    return buffer
  }, set:function(scopes, config) {
    for(var i = scopes.length - 1;i >= 0;i--) {
      if(typeof scopes[i] === "object") {
        S.mix(scopes[i], config.hash);
        break
      }
    }
    return""
  }, include:function(scopes, config) {
    var params = config.params;
    var extra = config.hash ? [config.hash] : [];
    scopes = extra.concat(scopes);
    if(!params || params.length !== 1) {
      S.error("include must has one param");
      return""
    }
    var myName = this.config.name;
    var subTplName = params[0];
    if(subTplName.charAt(0) === ".") {
      if(myName === "unspecified") {
        S.error("parent template does not have name" + " for relative sub tpl name: " + subTplName);
        return""
      }
      subTplName = Path.resolve(myName, "../", subTplName)
    }
    var tpl = this.config.loader.call(this, subTplName);
    config = S.merge(this.config);
    config.name = subTplName;
    config.commands = this.config.commands;
    config.macros = this.config.macros;
    return this.invokeEngine(tpl, scopes, config)
  }, macro:function(scopes, config) {
    var params = config.params;
    var macroName = params[0];
    var params1 = params.slice(1);
    var macros = this.config.macros;
    if(config.fn) {
      if(!macros[macroName]) {
        macros[macroName] = {paramNames:params1, fn:config.fn}
      }
    }else {
      var paramValues = {};
      var macro = macros[macroName];
      if(!macro) {
        macro = S.require(macroName);
        if(!macro) {
          S.error("can not find macro module:" + name)
        }
      }
      S.each(macro.paramNames, function(p, i) {
        paramValues[p] = params1[i]
      });
      var newScopes = scopes.concat();
      newScopes.unshift(paramValues);
      return macro.fn.call(this, newScopes)
    }
    return""
  }, parse:function(scopes, config) {
    return commands.include.call(this, [], config)
  }};
  return commands
});
KISSY.add("xtemplate/runtime", ["./runtime/commands"], function(S, require) {
  var commands = require("./runtime/commands");
  var escapeHtml = S.escapeHtml;
  var logger = S.getLogger("s/xtemplate");
  function info(s) {
    logger.info(s)
  }
  function findCommand(commands, name) {
    var parts = name.split(".");
    var cmd = commands;
    var len = parts.length;
    for(var i = 0;i < len;i++) {
      cmd = cmd[parts[i]];
      if(!cmd) {
        break
      }
    }
    return cmd
  }
  function getProperty(parts, scopes, depth) {
    if(parts === ".") {
      parts = "this"
    }
    parts = parts.split(".");
    var len = parts.length, i, j = depth || 0, v, p, valid, sl = scopes.length;
    if(parts[0] === "root") {
      j = sl - 1;
      parts.shift();
      len--
    }
    var endScopeFind = 0;
    for(;j < sl;j++) {
      v = scopes[j];
      valid = 1;
      for(i = 0;i < len;i++) {
        p = parts[i];
        if(p === "this") {
          endScopeFind = 1;
          continue
        }else {
          if(typeof v !== "object" || !(p in v)) {
            valid = 0;
            break
          }
        }
        v = v[p]
      }
      if(valid) {
        if(typeof v === "function") {
          v = v.call(scopes[0])
        }
        return[v]
      }
      if(endScopeFind) {
        break
      }
    }
    return false
  }
  var utils = {runBlockCommand:function(engine, scopes, options, name, line) {
    var config = engine.config;
    var logFn = config.silent ? info : S.error;
    var commands = config.commands;
    var command = findCommand(commands, name);
    if(!command) {
      if(!options.params && !options.hash) {
        var property = getProperty(name, scopes);
        if(property === false) {
          logFn('can not find property: "' + name + '" at line ' + line);
          property = ""
        }else {
          property = property[0]
        }
        command = commands["if"];
        if(S.isArray(property)) {
          command = commands.each
        }else {
          if(typeof property === "object") {
            command = commands["with"]
          }
        }
        options.params = [property]
      }else {
        S.error("can not find command module: " + name + '" at line ' + line);
        return""
      }
    }
    var ret = "";
    try {
      ret = command.call(engine, scopes, options)
    }catch(e) {
      S.error(e.message + ': "' + name + '" at line ' + line)
    }
    if(ret === undefined) {
      ret = ""
    }
    return ret
  }, getExpression:function(exp, escaped) {
    if(exp === undefined) {
      exp = ""
    }
    return escaped && exp ? escapeHtml(exp) : exp
  }, getPropertyOrRunCommand:function(engine, scopes, options, name, depth, line, escape, preserveUndefined) {
    var id0;
    var config = engine.config;
    var commands = config.commands;
    var command1 = findCommand(commands, name);
    var logFn = config.silent ? info : S.error;
    if(command1) {
      try {
        id0 = command1.call(engine, scopes, options)
      }catch(e) {
        S.error(e.message + ': "' + name + '" at line ' + line);
        return""
      }
    }else {
      var tmp2 = getProperty(name, scopes, depth);
      if(tmp2 === false) {
        logFn('can not find property: "' + name + '" at line ' + line, "warn");
        return preserveUndefined ? undefined : ""
      }else {
        id0 = tmp2[0]
      }
    }
    if(!preserveUndefined && id0 === undefined) {
      id0 = ""
    }
    return escape && id0 ? escapeHtml(id0) : id0
  }}, defaultConfig = {silent:true, name:"unspecified", loader:function(subTplName) {
    var tpl = S.require(subTplName);
    if(!tpl) {
      S.error('template "' + subTplName + '" does not exist, ' + "need to be required or used first!")
    }
    return tpl
  }};
  function XTemplateRuntime(tpl, config) {
    var self = this;
    self.tpl = tpl;
    config = S.merge(defaultConfig, config);
    config.commands = S.merge(config.commands, commands);
    config.utils = utils;
    config.macros = config.macros || {};
    this.config = config
  }
  S.mix(XTemplateRuntime, {commands:commands, utils:utils, addCommand:function(commandName, fn) {
    commands[commandName] = fn
  }, removeCommand:function(commandName) {
    delete commands[commandName]
  }});
  XTemplateRuntime.prototype = {constructor:XTemplateRuntime, invokeEngine:function(tpl, scopes, config) {
    return(new this.constructor(tpl, config)).render(scopes, true)
  }, removeCommand:function(commandName) {
    delete this.config.commands[commandName]
  }, addCommand:function(commandName, fn) {
    this.config.commands[commandName] = fn
  }, render:function(data, keepDataFormat) {
    if(!keepDataFormat) {
      data = [data]
    }
    return this.tpl(data, S)
  }};
  return XTemplateRuntime
});

