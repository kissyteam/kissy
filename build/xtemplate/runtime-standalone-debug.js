var XTemplateRuntime = (function(){ var module = {};

var _xtemplateRuntime_;
_xtemplateRuntime_ = function (exports) {
  /*
  combined modules:
  xtemplate/runtime
  xtemplate/runtime/util
  xtemplate/runtime/commands
  xtemplate/runtime/scope
  xtemplate/runtime/linked-buffer
  */
  var xtemplateRuntimeUtil, xtemplateRuntimeScope, xtemplateRuntimeLinkedBuffer, xtemplateRuntimeCommands, xtemplateRuntime;
  xtemplateRuntimeUtil = function (exports) {
    // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
    // http://wonko.com/post/html-escaping
    var htmlEntities = {
      '&': '&amp;',
      '>': '&gt;',
      '<': '&lt;',
      '`': '&#x60;',
      '/': '&#x2F;',
      '"': '&quot;',
      /*jshint quotmark:false*/
      '\'': '&#x27;'
    };
    var possibleEscapeHtmlReg = /[&<>"'`]/;
    var escapeHtmlReg = getEscapeReg();
    var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
    var win = typeof global !== 'undefined' ? global : window;
    function getEscapeReg() {
      var str = '';
      for (var entity in htmlEntities) {
        str += entity + '|';
      }
      str = str.slice(0, -1);
      escapeHtmlReg = new RegExp(str, 'g');
      return escapeHtmlReg;
    }
    var util;
    var toString = Object.prototype.toString;
    exports = util = {
      isArray: Array.isArray || function (obj) {
        return toString.call(obj);
      },
      keys: Object.keys || function (o) {
        var result = [];
        var p;
        for (p in o) {
          if (o.hasOwnProperty(p)) {
            result.push(p);
          }
        }
        return result;
      },
      each: function (object, fn, context) {
        if (object) {
          var key, val, keys;
          var i = 0;
          var length = object && object.length;
          var isObj = length === undefined || Object.prototype.toString.call(object) === '[object Function]';
          context = context || null;
          if (isObj) {
            keys = util.keys(object);
            for (; i < keys.length; i++) {
              key = keys[i];
              if (fn.call(context, object[key], key, object) === false) {
                break;
              }
            }
          } else {
            for (val = object[0]; i < length; val = object[++i]) {
              if (fn.call(context, val, i, object) === false) {
                break;
              }
            }
          }
        }
        return object;
      },
      mix: function (t, s) {
        for (var p in s) {
          t[p] = s[p];
        }
        return t;
      },
      globalEval: function (data) {
        if (win.execScript) {
          win.execScript(data);
        } else {
          (function (data) {
            win['eval'].call(win, data);
          }(data));
        }
      },
      substitute: function (str, o, regexp) {
        if (typeof str !== 'string' || !o) {
          return str;
        }
        return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
          if (match.charAt(0) === '\\') {
            return match.slice(1);
          }
          return o[name] === undefined ? '' : o[name];
        });
      },
      escapeHtml: function (str) {
        str = '' + str;
        if (!possibleEscapeHtmlReg.test(str)) {
          return str;
        }
        return (str + '').replace(escapeHtmlReg, function (m) {
          return htmlEntities[m];
        });
      },
      log: function () {
        if (typeof console !== 'undefined') {
          console.log.apply(console, arguments);
        }
      }
    };
    return exports;
  }();
  xtemplateRuntimeScope = function (exports) {
    var undef;
    function Scope(data) {
      if (data !== undef) {
        this.data = data;
      } else {
        this.data = {};
      }
      this.root = this;
    }
    Scope.prototype = {
      isScope: 1,
      setParent: function (parentScope) {
        this.parent = parentScope;
        this.root = parentScope.root;
      },
      set: function (name, value) {
        if (!this.affix) {
          this.affix = {};
        }
        this.affix[name] = value;
      },
      setData: function (data) {
        this.data = data;
      },
      getData: function () {
        return this.data;
      },
      mix: function (v) {
        var affix = this.affix;
        if (!affix) {
          affix = this.affix = {};
        }
        for (var name in v) {
          affix[name] = v[name];
        }
      },
      get: function (name) {
        var data = this.data;
        var v;
        var affix = this.affix;
        v = affix && affix[name];
        if (v !== undef) {
          return v;
        }
        if (data !== undef && data !== null) {
          v = data[name];
        }
        if (v !== undef) {
          return v;
        }
        if (name === 'this') {
          return data;
        } else if (name === 'root') {
          return this.root.data;
        }
        return v;
      },
      resolve: function (parts, depth) {
        var self = this;
        var v;
        if (!depth && parts.length === 1) {
          v = self.get(parts[0]);
          if (v !== undef) {
            return v;
          } else {
            depth = 1;
          }
        }
        var len = parts.length;
        var scope = self;
        var i;
        if (len && parts[0] === 'root') {
          parts.shift();
          scope = scope.root;
          len--;
        } else if (depth) {
          while (scope && depth--) {
            scope = scope.parent;
          }
        }
        if (!scope) {
          return undef;
        }
        if (!len) {
          return scope.data;
        }
        var part0 = parts[0];
        do {
          v = scope.get(part0);
        } while (v === undef && (scope = scope.parent));
        if (v && scope) {
          for (i = 1; v && i < len; i++) {
            v = v[parts[i]];
          }
          return v;
        } else {
          return undef;
        }
      }
    };
    exports = Scope;
    return exports;
  }();
  xtemplateRuntimeLinkedBuffer = function (exports) {
    var undef;
    var util = xtemplateRuntimeUtil;
    function Buffer(list) {
      this.list = list;
      this.init();
    }
    Buffer.prototype = {
      constructor: Buffer,
      isBuffer: 1,
      init: function () {
        this.data = '';
      },
      append: function (data) {
        this.data += data;
        return this;
      },
      write: function (data) {
        if (data != null) {
          this.append(data);
        }
        return this;
      },
      writeEscaped: function (data) {
        if (data != null) {
          this.append(util.escapeHtml(data));
        }
        return this;
      },
      async: function (fn) {
        var self = this;
        var list = self.list;
        var asyncFragment = new Buffer(list);
        var nextFragment = new Buffer(list);
        nextFragment.next = self.next;
        asyncFragment.next = nextFragment;
        self.next = asyncFragment;
        self.ready = true;
        fn(asyncFragment);
        return nextFragment;
      },
      error: function (reason) {
        var callback = this.list.callback;
        if (callback) {
          callback(reason, undef);
          this.list.callback = null;
        }
      },
      end: function () {
        var self = this;
        if (self.list.callback) {
          self.ready = true;
          self.list.flush();
        }
        return self;
      }
    };
    function LinkedBuffer(callback, config) {
      var self = this;
      self.config = config;
      self.head = new Buffer(self);
      self.callback = callback;
      this.init();
    }
    LinkedBuffer.prototype = {
      constructor: LinkedBuffer,
      init: function () {
        this.data = '';
      },
      append: function (data) {
        this.data += data;
      },
      end: function () {
        this.callback(null, this.data);
      },
      flush: function () {
        var self = this;
        var fragment = self.head;
        while (fragment) {
          if (fragment.ready) {
            this.append(fragment.data);
          } else {
            return;
          }
          fragment = fragment.next;
          self.head = fragment;
        }
        self.end();
      }
    };
    LinkedBuffer.Buffer = Buffer;
    exports = LinkedBuffer;
    return exports;
  }();
  xtemplateRuntimeCommands = function (exports) {
    var Scope = xtemplateRuntimeScope;
    var util = xtemplateRuntimeUtil;
    var commands = {
      range: function (scope, option) {
        var params = option.params;
        var start = params[0];
        var end = params[1];
        var step = params[2];
        if (!step) {
          step = start > end ? -1 : 1;
        } else if (start > end && step > 0 || start < end && step < 0) {
          step = -step;
        }
        var ret = [];
        for (var i = start; start < end ? i < end : i > end; i += step) {
          ret.push(i);
        }
        return ret;
      },
      each: function (scope, option, buffer) {
        var params = option.params;
        var param0 = params[0];
        var xindexName = params[2] || 'xindex';
        var valueName = params[1];
        var xcount;
        var opScope;
        var affix;
        if (param0) {
          if (util.isArray(param0)) {
            xcount = param0.length;
            for (var xindex = 0; xindex < xcount; xindex++) {
              opScope = new Scope(param0[xindex]);
              affix = opScope.affix = { xcount: xcount };
              affix[xindexName] = xindex;
              if (valueName) {
                affix[valueName] = param0[xindex];
              }
              opScope.setParent(scope);
              buffer = option.fn(opScope, buffer);
            }
          } else {
            for (var name in param0) {
              opScope = new Scope(param0[name]);
              affix = opScope.affix = {};
              affix[xindexName] = name;
              if (valueName) {
                affix[valueName] = param0[name];
              }
              opScope.setParent(scope);
              buffer = option.fn(opScope, buffer);
            }
          }
        }
        return buffer;
      },
      'with': function (scope, option, buffer) {
        var params = option.params;
        var param0 = params[0];
        if (param0) {
          var opScope = new Scope(param0);
          opScope.setParent(scope);
          buffer = option.fn(opScope, buffer);
        }
        return buffer;
      },
      'if': function (scope, option, buffer) {
        var params = option.params;
        var param0 = params[0];
        if (param0) {
          var fn = option.fn;
          if (fn) {
            buffer = fn(scope, buffer);
          }
        } else {
          var matchElseIf = false;
          var elseIfs = option.elseIfs;
          var inverse = option.inverse;
          if (elseIfs) {
            for (var i = 0, len = elseIfs.length; i < len; i++) {
              var elseIf = elseIfs[i];
              matchElseIf = elseIf.test(scope);
              if (matchElseIf) {
                buffer = elseIf.fn(scope, buffer);
                break;
              }
            }
          }
          if (!matchElseIf && inverse) {
            buffer = inverse(scope, buffer);
          }
        }
        return buffer;
      },
      set: function (scope, option, buffer) {
        scope.mix(option.hash);
        return buffer;
      },
      include: function (scope, option, buffer) {
        var params = option.params;
        var i, newScope;
        var l = params.length;
        newScope = scope;
        if (option.hash) {
          newScope = new Scope(option.hash);
          newScope.setParent(scope);
        }
        for (i = 0; i < l; i++) {
          buffer = this.root.include(params[i], this, newScope, option, buffer);
        }
        return buffer;
      },
      parse: function (scope, option, buffer) {
        return commands.include.call(this, new Scope(), option, buffer);
      },
      extend: function (scope, option, buffer) {
        this.runtime.extendTplName = option.params[0];
        return buffer;
      },
      block: function (scope, option, buffer) {
        var self = this;
        var runtime = self.runtime;
        var params = option.params;
        var blockName = params[0];
        var type;
        if (params.length === 2) {
          type = params[0];
          blockName = params[1];
        }
        var blocks = runtime.blocks = runtime.blocks || {};
        var head = blocks[blockName], cursor;
        var current = {
          fn: option.fn,
          type: type
        };
        if (!head) {
          blocks[blockName] = current;
        } else if (head.type) {
          if (head.type === 'append') {
            current.next = head;
            blocks[blockName] = current;
          } else if (head.type === 'prepend') {
            var prev;
            cursor = head;
            while (cursor && cursor.type === 'prepend') {
              prev = cursor;
              cursor = cursor.next;
            }
            current.next = cursor;
            prev.next = current;
          }
        }
        if (!runtime.extendTplName) {
          cursor = blocks[blockName];
          while (cursor) {
            if (cursor.fn) {
              buffer = cursor.fn.call(self, scope, buffer);
            }
            cursor = cursor.next;
          }
        }
        return buffer;
      },
      macro: function (scope, option, buffer) {
        var hash = option.hash;
        var params = option.params;
        var macroName = params[0];
        var params1 = params.slice(1);
        var self = this;
        var runtime = self.runtime;
        var macros = runtime.macros = runtime.macros || {};
        if (option.fn) {
          macros[macroName] = {
            paramNames: params1,
            hash: hash,
            fn: option.fn
          };
        } else {
          var macro = macros[macroName];
          var paramValues = macro.hash || {};
          var paramNames;
          if (macro && (paramNames = macro.paramNames)) {
            for (var i = 0, len = paramNames.length; i < len; i++) {
              var p = paramNames[i];
              paramValues[p] = params1[i];
            }
            if (hash) {
              for (var h in hash) {
                paramValues[h] = hash[h];
              }
            }
            var newScope = new Scope(paramValues);
            buffer = macro.fn.call(self, newScope, buffer);
          } else {
            var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + self.pos.line + ', col ' + self.pos.col;
            throw new Error(error);
          }
        }
        return buffer;
      }
    };
    commands['debugger'] = function () {
      if ('@DEBUG@') {
        util.globalEval('debugger');
      }
    };
    exports = commands;
    return exports;
  }();
  xtemplateRuntime = function (exports) {
    var util = xtemplateRuntimeUtil;
    var nativeCommands = xtemplateRuntimeCommands;
    var commands = {};
    var Scope = xtemplateRuntimeScope;
    var LinkedBuffer = xtemplateRuntimeLinkedBuffer;
    function findCommand(runtimeCommands, instanceCommands, parts) {
      var name = parts[0];
      var cmd = runtimeCommands && runtimeCommands[name] || instanceCommands && instanceCommands[name] || commands[name];
      if (parts.length === 1) {
        return cmd;
      }
      if (cmd) {
        var len = parts.length;
        for (var i = 1; i < len; i++) {
          cmd = cmd[parts[i]];
          if (!cmd) {
            break;
          }
        }
      }
      return cmd;
    }
    function getSubNameFromParentName(parentName, subName) {
      var parts = parentName.split('/');
      var subParts = subName.split('/');
      parts.pop();
      for (var i = 0, l = subParts.length; i < l; i++) {
        var subPart = subParts[i];
        if (subPart === '.') {
        } else if (subPart === '..') {
          parts.pop();
        } else {
          parts.push(subPart);
        }
      }
      return parts.join('/');
    }
    function renderTpl(tpl, scope, buffer) {
      buffer = tpl.fn(scope, buffer);
      var runtime = tpl.runtime;
      var extendTplName = runtime.extendTplName;
      if (extendTplName) {
        runtime.extendTplName = null;
        buffer = tpl.root.include(extendTplName, tpl, scope, null, buffer);
      }
      return buffer.end();
    }
    function callFn(tpl, scope, option, buffer, parts, depth) {
      var error, caller, fn, command1;
      if (!depth) {
        command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
      }
      if (command1) {
        return command1.call(tpl, scope, option, buffer);
      } else {
        error = 'in file: ' + tpl.name + ' can not call: ' + parts.join('.') + '" at line ' + tpl.pos.line + ', col ' + tpl.pos.col;
      }
      caller = scope.resolve(parts.slice(0, -1), depth);
      fn = caller[parts[parts.length - 1]];
      if (fn) {
        return fn.apply(caller, option.params);
      }
      if (error) {
        throw new Error(error);
      }
      return buffer;
    }
    var utils = {
      callFn: callFn,
      callCommand: function (tpl, scope, option, buffer, parts) {
        return callFn(tpl, scope, option, buffer, parts);
      }
    };
    var loader = {
      cache: {},
      load: function (params, callback) {
        var name = params.name;
        var cache = this.cache;
        if (cache[name]) {
          return callback(undefined, cache[name]);
        }
        require([name], function (tpl) {
          cache[name] = tpl;
          callback(undefined, tpl);
        }, function () {
          var error = 'template "' + params.name + '" does not exist';
          util.log(error, 'error');
          callback(error);
        });
      }
    };
    function XTemplateRuntime(fn, config) {
      var self = this;
      self.fn = fn;
      config = self.config = config || {};
      config.loader = config.loader || XTemplateRuntime.loader;
      this.subNameResolveCache = {};
    }
    util.mix(XTemplateRuntime, {
      loader: loader,
      version: '1.3.0',
      nativeCommands: nativeCommands,
      utils: utils,
      util: util,
      addCommand: function (commandName, fn) {
        commands[commandName] = fn;
      },
      removeCommand: function (commandName) {
        delete commands[commandName];
      }
    });
    XTemplateRuntime.prototype = {
      constructor: XTemplateRuntime,
      Scope: Scope,
      nativeCommands: nativeCommands,
      utils: utils,
      removeCommand: function (commandName) {
        var config = this.config;
        if (config.commands) {
          delete config.commands[commandName];
        }
      },
      addCommand: function (commandName, fn) {
        var config = this.config;
        config.commands = config.commands || {};
        config.commands[commandName] = fn;
      },
      resolve: function (subName, parentName) {
        if (subName.charAt(0) !== '.') {
          return subName;
        }
        if (!parentName) {
          var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subName;
          throw new Error(error);
        }
        var nameResolveCache = this.subNameResolveCache[parentName] = this.subNameResolveCache[parentName] || {};
        if (nameResolveCache[subName]) {
          return nameResolveCache[subName];
        }
        subName = nameResolveCache[subName] = getSubNameFromParentName(parentName, subName);
        return subName;
      },
      include: function (subTplName, tpl, scope, option, buffer) {
        var self = this;
        var parentName = tpl.name;
        var resolvedSubTplName = self.resolve(subTplName, parentName);
        return buffer.async(function (newBuffer) {
          self.config.loader.load({
            root: self,
            parentName: parentName,
            originalName: subTplName,
            name: resolvedSubTplName,
            scope: scope,
            option: option
          }, function (error, tplFn) {
            if (error) {
              newBuffer.error(error);
            } else if (typeof tplFn === 'string') {
              if (option && option.escaped) {
                newBuffer.writeEscaped(tplFn);
              } else {
                newBuffer.append(tplFn);
              }
              newBuffer.end();
            } else {
              renderTpl({
                root: tpl.root,
                fn: tplFn,
                name: resolvedSubTplName,
                runtime: tpl.runtime
              }, scope, newBuffer);
            }
          });
        });
      },
      render: function (data, option, callback) {
        var html = '';
        var self = this;
        var fn = self.fn;
        if (typeof option === 'function') {
          callback = option;
          option = null;
        }
        option = option || {};
        callback = callback || function (error, ret) {
          if (error) {
            if (!(error instanceof Error)) {
              error = new Error(error);
            }
            throw error;
          }
          html = ret;
        };
        var name = self.config.name;
        if (!name && fn.TPL_NAME) {
          name = fn.TPL_NAME;
        }
        var scope = new Scope(data);
        var buffer = new XTemplateRuntime.LinkedBuffer(callback, self.config).head;
        renderTpl({
          name: name,
          fn: fn,
          runtime: { commands: option.commands },
          root: self
        }, scope, buffer);
        return html;
      }
    };
    XTemplateRuntime.Scope = Scope;
    XTemplateRuntime.LinkedBuffer = LinkedBuffer;
    exports = XTemplateRuntime;
    return exports;
  }();
  exports = xtemplateRuntime;
  return exports;
}();
return _xtemplateRuntime_;
})();