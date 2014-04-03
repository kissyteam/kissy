/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Apr 3 18:21
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
  }, get:function(name) {
    var data = this.data;
    var v = data[name];
    if(v !== undefined) {
      return v
    }
    var affix = this.affix;
    if(affix && name in affix) {
      return affix[name]
    }
    if(name === "this") {
      return data
    }
    if(name === "root") {
      return this.root.data
    }
    return v
  }, resolve:function(parts, depth) {
    var self = this;
    if(!depth && parts.length === 1) {
      return self.get(parts[0])
    }
    var len, i, v;
    var scope = self;
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
    len = parts.length;
    var part0 = parts[0];
    do {
      v = scope.get(part0)
    }while(v === undefined && (scope = scope.parent));
    if(v && scope) {
      for(i = 1;v && i < len;i++) {
        v = v[parts[i]]
      }
      if(typeof v === "function") {
        v = v.call(this.data)
      }
      return v
    }else {
      return undefined
    }
  }};
  return Scope
});
KISSY.add("xtemplate/runtime/commands", ["./scope"], function(S, require) {
  var Scope = require("./scope");
  var commands = {each:function(scope, option, buffer) {
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
  }, include:function(scope, option, buffer, lineNumber, payload) {
    var params = option.params;
    if(option.hash) {
      var newScope = new Scope(option.hash);
      newScope.setParent(scope);
      scope = newScope
    }
    return this.include(params[0], scope, buffer, payload)
  }, parse:function(scope, option, buffer, lineNumber, payload) {
    return commands.include.call(this, new Scope, option, buffer, payload)
  }, extend:function(scope, option, buffer, lineNumber, payload) {
    payload.extendTplName = option.params[0];
    return buffer
  }, block:function(scope, option, buffer, lineNumber, payload) {
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
  }, macro:function(scope, option, buffer, lineNumber, payload) {
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
        var error = "in file: " + self.name + " can not find macro: " + name + '" at line ' + lineNumber;
        S.error(error)
      }
    }
    return buffer
  }};
  if("@DEBUG@") {
    commands["debugger"] = function() {
      S.globalEval("debugger")
    }
  }
  return commands
});
KISSY.add("xtemplate/runtime/linked-buffer", [], function(S, undefined) {
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
  }, error:function(reason) {
    var callback = this.list.callback;
    if(callback) {
      callback(reason, undefined);
      this.list.callback = null
    }
  }, end:function(data, escape) {
    var self = this;
    if(self.list.callback) {
      self.write(data, escape);
      self.ready = true;
      self.list.flush()
    }
    return self
  }};
  function LinkedBuffer(callback) {
    var self = this;
    self.head = new Buffer(self);
    self.callback = callback;
    self.data = ""
  }
  LinkedBuffer.prototype = {constructor:LinkedBuffer, flush:function() {
    var self = this;
    var fragment = self.head;
    while(fragment) {
      if(fragment.ready) {
        self.data += fragment.data
      }else {
        return
      }
      fragment = fragment.next;
      self.head = fragment
    }
    self.callback(null, self.data)
  }};
  LinkedBuffer.Buffer = Buffer;
  return LinkedBuffer
});
KISSY.add("xtemplate/runtime", ["util", "./runtime/commands", "./runtime/scope", "./runtime/linked-buffer"], function(S, require) {
  require("util");
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
  function renderTpl(self, scope, buffer, payload) {
    var tpl = self.tpl;
    payload = payload || {};
    payload.extendTplName = null;
    if(tpl.TPL_NAME && !self.name) {
      self.name = tpl.TPL_NAME
    }
    buffer = tpl.call(self, scope, S, buffer, payload);
    var extendTplName = payload.extendTplName;
    if(extendTplName) {
      buffer = self.include(extendTplName, scope, buffer, payload)
    }
    return buffer.end()
  }
  function callCommand(engine, scope, option, buffer, name, line) {
    var commands = engine.config.commands;
    var error;
    var command1 = findCommand(commands, name);
    if(command1) {
      return command1.call(engine, scope, option, buffer, line)
    }else {
      error = "in file: " + engine.name + " can not find command: " + name + '" at line ' + line;
      S.error(error)
    }
    return buffer
  }
  var utils = {callCommand:callCommand};
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
  XTemplateRuntime.prototype = {constructor:XTemplateRuntime, Scope:Scope, nativeCommands:nativeCommands, utils:utils, load:function(subTplName, callback) {
    var tpl = S.require(subTplName);
    if(tpl) {
      callback(undefined, tpl)
    }else {
      var warning = 'template "' + subTplName + '" does not exist, ' + "better required or used first for performance!";
      S.log(warning, "error");
      callback(warning, undefined)
    }
  }, removeCommand:function(commandName) {
    var config = this.config;
    if(config.commands) {
      delete config.commands[commandName]
    }
  }, addCommand:function(commandName, fn) {
    var config = this.config;
    config.commands = config.commands || {};
    config.commands[commandName] = fn
  }, include:function(subTplName, scope, buffer, payload) {
    var self = this;
    var myName = self.name;
    if(subTplName.charAt(0) === ".") {
      if(!myName) {
        var error = "parent template does not have name" + " for relative sub tpl name: " + subTplName;
        throw new Error(error);
      }
      subTplName = getSubNameFromParentName(myName, subTplName)
    }
    return buffer.async(function(newBuffer) {
      self.load(subTplName, function(error, engine) {
        if(error) {
          newBuffer.error(error)
        }else {
          if(!(engine instanceof XTemplateRuntime)) {
            engine = new self.constructor(engine, self.config);
            engine.name = subTplName
          }
          renderTpl(engine, scope, newBuffer, payload)
        }
      })
    })
  }, render:function(data, callback) {
    var html = "";
    var self = this;
    callback = callback || function(error, ret) {
      html = ret
    };
    if(!self.name && self.tpl.TPL_NAME) {
      self.name = self.tpl.TPL_NAME
    }
    renderTpl(self, new Scope(data), (new LinkedBuffer(callback)).head);
    return html
  }};
  XTemplateRuntime.Scope = Scope;
  return XTemplateRuntime
});

