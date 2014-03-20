/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 21 02:07
*/
/*
 Combined modules by KISSY Module Compiler: 

 xtemplate/runtime/scope
 xtemplate/runtime/commands
 xtemplate/runtime/linked-buffer
 xtemplate/runtime
*/

KISSY.add("xtemplate/runtime/scope", [], function(S) {
  function Scope(data, affix) {
    this.data = data || {};
    this.affix = affix;
    this.root = this
  }
  Scope.prototype = {isScope:1, setParent:function(parentScope) {
    this.parent = parentScope;
    this.root = parentScope.root
  }, getParent:function() {
    return this.parent
  }, getRoot:function() {
    return this.root
  }, set:function(name, value) {
    if(!this.affix) {
      this.affix = {}
    }
    this.affix[name] = value
  }, setData:function(data) {
    this.data = data
  }, getData:function() {
    return this.data
  }, mix:function(v) {
    if(!this.affix) {
      this.affix = {}
    }
    S.mix(this.affix, v)
  }, has:function(name) {
    var data = this.data;
    var affix = this.affix;
    if(name === "this") {
      return true
    }
    if(affix && name in affix) {
      return true
    }
    return typeof data === "object" && name in data
  }, get:function(name) {
    var data = this.data;
    var affix = this.affix;
    if(name === "this") {
      return this.data
    }
    if(affix && name in affix) {
      return affix[name]
    }
    if(typeof data === "object" && name in data) {
      return data[name]
    }
    return undefined
  }, resolve:function(name, depth) {
    var scope = this;
    if(!depth && typeof name !== "string" && name.length === 1) {
      if(scope.has(name[0])) {
        return scope.get(name[0])
      }
    }
    var parts = name;
    if(typeof name === "string") {
      parts = name.split(".")
    }
    var len, i, v, p, valid;
    if(parts[0] === "root") {
      parts.shift();
      scope = scope.root
    }else {
      if(depth) {
        while(scope && depth--) {
          scope = scope.parent
        }
      }
    }
    var endScopeFind = 0;
    len = parts.length;
    while(scope) {
      valid = 1;
      v = scope;
      for(i = 0;i < len;i++) {
        p = parts[i];
        if(p === "this") {
          endScopeFind = 1;
          continue
        }
        if(v === scope) {
          if(scope.has(p)) {
            v = scope.get(p);
            endScopeFind = 1
          }else {
            valid = 0;
            break
          }
        }else {
          if(v == null || typeof v !== "object" || !(p in v)) {
            valid = 0;
            break
          }
          v = v[p]
        }
      }
      if(valid) {
        if(v && v.isScope) {
          v = v.data
        }
        if(typeof v === "function") {
          v = v.call(this.data)
        }
        return v
      }
      if(endScopeFind) {
        break
      }
      scope = scope.parent
    }
    return undefined
  }};
  return Scope
});
KISSY.add("xtemplate/runtime/commands", ["./scope"], function(S, require) {
  var commands;
  var Scope = require("./scope");
  function getSubNameFromParentName(parentName, subName) {
    var parts = parentName.split("/");
    var subParts = subName.split("/");
    parts.pop();
    for(var i = 0, l = subParts.length;i < l;i++) {
      var subPart = subParts[i];
      if(subPart === ".") {
      }else {
        if(subPart === "..") {
          parts.pop()
        }else {
          parts.push(subPart)
        }
      }
    }
    return parts.join("/")
  }
  commands = {each:function(scope, option, buffer) {
    var params = option.params;
    var param0 = params[0];
    var xindexName = params[2] || "xindex";
    var valueName = params[1];
    var xcount;
    var opScope;
    var affix;
    if(param0) {
      if(S.isArray(param0)) {
        xcount = param0.length;
        opScope = new Scope;
        affix = opScope.affix = {xcount:xcount};
        for(var xindex = 0;xindex < xcount;xindex++) {
          opScope.data = param0[xindex];
          affix[xindexName] = xindex;
          if(valueName) {
            affix[valueName] = param0[xindex]
          }
          opScope.setParent(scope);
          buffer = option.fn(opScope, buffer)
        }
      }else {
        opScope = new Scope;
        affix = opScope.affix = {};
        for(var name in param0) {
          opScope.data = param0[name];
          affix[xindexName] = name;
          if(valueName) {
            affix[valueName] = param0[name]
          }
          opScope.setParent(scope);
          buffer = option.fn(opScope, buffer)
        }
      }
    }else {
      if(option.inverse) {
        buffer = option.inverse(scope, buffer)
      }
    }
    return buffer
  }, "with":function(scope, option, buffer) {
    var params = option.params;
    var param0 = params[0];
    if(param0) {
      var opScope = new Scope(param0);
      opScope.setParent(scope);
      buffer = option.fn(opScope, buffer)
    }else {
      if(option.inverse) {
        buffer = option.inverse(scope, buffer)
      }
    }
    return buffer
  }, "if":function(scope, option, buffer) {
    var params = option.params;
    var param0 = params[0];
    if(param0) {
      if(option.fn) {
        buffer = option.fn(scope, buffer)
      }
    }else {
      if(option.inverse) {
        buffer = option.inverse(scope, buffer)
      }
    }
    return buffer
  }, set:function(scope, option, buffer) {
    scope.mix(option.hash);
    return buffer
  }, include:function(scope, option, buffer, payload) {
    var params = option.params;
    var self = this;
    if(option.hash) {
      var newScope = new Scope(option.hash);
      newScope.setParent(scope);
      scope = newScope
    }
    var myName = self.name;
    var subTplName = params[0];
    if(subTplName.charAt(0) === ".") {
      if(!myName) {
        var error = "parent template does not have name" + " for relative sub tpl name: " + subTplName;
        S.error(error);
        return buffer
      }
      subTplName = getSubNameFromParentName(myName, subTplName)
    }
    return self.load(subTplName).render(scope, undefined, buffer, payload)
  }, parse:function(scope, option, buffer, payload) {
    return commands.include.call(this, new Scope, option, buffer, payload)
  }, extend:function(scope, option, buffer, payload) {
    payload.extendTplName = option.params[0];
    return buffer
  }, block:function(scope, option, buffer, payload) {
    var self = this;
    var params = option.params;
    var blockName = params[0];
    var type;
    if(params.length === 2) {
      type = params[0];
      blockName = params[1]
    }
    var blocks = payload.blocks = payload.blocks || {};
    var head = blocks[blockName], cursor;
    var current = {fn:option.fn, type:type};
    if(!head) {
      blocks[blockName] = current
    }else {
      if(head.type) {
        if(head.type === "append") {
          current.next = head;
          blocks[blockName] = current
        }else {
          if(head.type === "prepend") {
            var prev;
            cursor = head;
            while(cursor && cursor.type === "prepend") {
              prev = cursor;
              cursor = cursor.next
            }
            current.next = cursor;
            prev.next = current
          }
        }
      }
    }
    if(!payload.extendTplName) {
      cursor = blocks[blockName];
      while(cursor) {
        if(cursor.fn) {
          buffer = cursor.fn.call(self, scope, buffer)
        }
        cursor = cursor.next
      }
    }
    return buffer
  }, macro:function(scope, option, buffer, payload) {
    var params = option.params;
    var macroName = params[0];
    var params1 = params.slice(1);
    var self = this;
    var macros = payload.macros = payload.macros || {};
    if(option.fn) {
      macros[macroName] = {paramNames:params1, fn:option.fn}
    }else {
      var paramValues = {};
      var macro = macros[macroName];
      var paramNames;
      if(macro && (paramNames = macro.paramNames)) {
        for(var i = 0, len = paramNames.length;i < len;i++) {
          var p = paramNames[i];
          paramValues[p] = params1[i]
        }
        var newScope = new Scope(paramValues);
        buffer = macro.fn.call(self, newScope, buffer)
      }else {
        var error = "can not find macro:" + name;
        S.error(error)
      }
    }
    return buffer
  }};
  if("@DEBUG@") {
    commands["debugger"] = function(scope, option, buffer) {
      S.globalEval("debugger");
      return buffer
    }
  }
  return commands
});
KISSY.add("xtemplate/runtime/linked-buffer", [], function(S) {
  function Buffer(list) {
    this.list = list;
    this.data = ""
  }
  Buffer.prototype = {constructor:Buffer, isBuffer:1, write:function(data, escape) {
    if(data || data === 0) {
      this.data += escape ? S.escapeHtml(data) : data
    }
    return this
  }, async:function(fn) {
    var self = this;
    var list = self.list;
    var asyncFragment = new Buffer(list);
    var nextFragment = new Buffer(list);
    nextFragment.next = self.next;
    asyncFragment.next = nextFragment;
    self.next = asyncFragment;
    self.ready = true;
    fn(asyncFragment);
    return nextFragment
  }, end:function(data, escape) {
    this.write(data, escape);
    this.ready = true;
    this.list.flush();
    return this
  }};
  function LinkedBuffer(callback) {
    this.current = this.head = new Buffer(this);
    this.callback = callback;
    this.data = ""
  }
  LinkedBuffer.prototype = {constructor:LinkedBuffer, flush:function() {
    var fragment = this.head;
    while(fragment) {
      if(fragment.ready) {
        this.data += fragment.data
      }else {
        return
      }
      fragment = fragment.next;
      this.head = fragment
    }
    this.callback(null, this.data)
  }};
  LinkedBuffer.Buffer = Buffer;
  return LinkedBuffer
});
KISSY.add("xtemplate/runtime", ["./runtime/commands", "./runtime/scope", "./runtime/linked-buffer"], function(S, require) {
  var nativeCommands = require("./runtime/commands");
  var commands = {};
  var Scope = require("./runtime/scope");
  var LinkedBuffer = require("./runtime/linked-buffer");
  function findCommand(localCommands, name) {
    if(name.indexOf(".") === -1) {
      return localCommands && localCommands[name] || commands[name]
    }
    var parts = name.split(".");
    var cmd = localCommands && localCommands[parts[0]] || commands[parts[0]];
    if(cmd) {
      var len = parts.length;
      for(var i = 1;i < len;i++) {
        cmd = cmd[parts[i]];
        if(!cmd) {
          break
        }
      }
    }
    return cmd
  }
  var utils = {callCommand:function(engine, scope, option, buffer, name, line) {
    var commands = engine.config.commands;
    var error;
    var command1 = findCommand(commands, name);
    if(command1) {
      return command1.call(engine, scope, option, buffer)
    }else {
      error = "in file: " + engine.name + " can not find command: " + name + '" at line ' + line;
      S.error(error)
    }
    return buffer
  }};
  function XTemplateRuntime(tpl, config) {
    var self = this;
    self.tpl = tpl;
    config = config || {};
    if(config.name) {
      self.name = config.name
    }
    self.config = config
  }
  S.mix(XTemplateRuntime, {nativeCommands:nativeCommands, utils:utils, addCommand:function(commandName, fn) {
    commands[commandName] = fn
  }, removeCommand:function(commandName) {
    delete commands[commandName]
  }});
  XTemplateRuntime.prototype = {constructor:XTemplateRuntime, nativeCommands:nativeCommands, utils:utils, load:function(subTplName) {
    var tpl = S.require(subTplName);
    if(!tpl) {
      S.error('template "' + subTplName + '" does not exist, need to be required or used first!')
    }
    var engine = new this.constructor(tpl, this.config);
    engine.name = subTplName;
    return engine
  }, removeCommand:function(commandName) {
    var config = this.config;
    if(config.commands) {
      delete config.commands[commandName]
    }
  }, addCommand:function(commandName, fn) {
    var config = this.config;
    config.commands = config.commands || {};
    config.commands[commandName] = fn
  }, render:function(data, callback, buffer, payload) {
    var root = data;
    var self = this;
    var tpl = self.tpl;
    var isTopRender = !payload;
    if(!(root && root.isScope)) {
      root = new Scope(data)
    }
    var html = "";
    if(!buffer) {
      callback = callback || function(error, ret) {
        html = ret
      };
      buffer = (new LinkedBuffer(callback)).head
    }
    payload = payload || {};
    payload.extendTplName = null;
    if(tpl.TPL_NAME && !self.name) {
      self.name = tpl.TPL_NAME
    }
    buffer = tpl.call(self, root, S, buffer, payload);
    var extendTplName = payload.extendTplName;
    if(extendTplName) {
      nativeCommands.include.call(self, root, {params:[extendTplName]}, buffer, payload)
    }
    if(isTopRender) {
      buffer.end();
      return html
    }else {
      return buffer
    }
  }};
  XTemplateRuntime.Scope = Scope;
  return XTemplateRuntime
});

