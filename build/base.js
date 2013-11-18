/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 18 18:53
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 base
*/

KISSY.add("base", function(S, Attribute, CustomEvent) {
  var module = this;
  module.exports = Base;
  var ATTRS = "ATTRS", ucfirst = S.ucfirst, ON_SET = "_onSet", noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  function replaceToUpper() {
    return arguments[1].toUpperCase()
  }
  function CamelCase(name) {
    return name.replace(RE_DASH, replaceToUpper)
  }
  function __getHook(method, reverse) {
    return function(origFn) {
      return function wrap() {
        var self = this;
        if(reverse) {
          origFn.apply(self, arguments)
        }else {
          self.callSuper.apply(self, arguments)
        }
        var extensions = arguments.callee.__owner__.__extensions__ || [];
        if(reverse) {
          extensions.reverse()
        }
        callExtensionsMethod(self, extensions, method, arguments);
        if(reverse) {
          self.callSuper.apply(self, arguments)
        }else {
          origFn.apply(self, arguments)
        }
      }
    }
  }
  function Base(config) {
    var self = this, c = self.constructor;
    self.userConfig = config;
    while(c) {
      addAttrs(self, c[ATTRS]);
      c = c.superclass ? c.superclass.constructor : null
    }
    initAttrs(self, config);
    var listeners = self.get("listeners");
    for(var n in listeners) {
      self.on(n, listeners[n])
    }
    self.initializer();
    constructPlugins(self);
    callPluginsMethod.call(self, "pluginInitializer");
    self.bindInternal();
    self.syncInternal()
  }
  S.augment(Base, Attribute, CustomEvent.Target, {initializer:noop, __getHook:__getHook, __callPluginsMethod:callPluginsMethod, callSuper:function() {
    var method, obj, self = this, args = arguments;
    if(typeof self == "function" && self.__name__) {
      method = self;
      obj = args[0];
      args = Array.prototype.slice.call(args, 1)
    }else {
      method = arguments.callee.caller;
      if(method.__wrapped__) {
        method = method.caller
      }
      obj = self
    }
    var name = method.__name__;
    if(!name) {
      return undefined
    }
    var member = method.__owner__.superclass[name];
    if(!member) {
      return undefined
    }
    return member.apply(obj, args || [])
  }, bindInternal:function() {
    var self = this, attrs = self["getAttrs"](), attr, m;
    for(attr in attrs) {
      m = ON_SET + ucfirst(attr);
      if(self[m]) {
        self.on("after" + ucfirst(attr) + "Change", onSetAttrChange)
      }
    }
  }, syncInternal:function() {
    var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
    while(c) {
      cs.push(c);
      c = c.superclass && c.superclass.constructor
    }
    cs.reverse();
    for(i = 0;i < cs.length;i++) {
      var ATTRS = cs[i].ATTRS || {};
      for(var attributeName in ATTRS) {
        if(attributeName in attrs) {
          var attributeValue, onSetMethod;
          var onSetMethodName = ON_SET + ucfirst(attributeName);
          if((onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined) {
            onSetMethod.call(self, attributeValue)
          }
        }
      }
    }
  }, plug:function(plugin) {
    var self = this;
    if(typeof plugin === "function") {
      plugin = new plugin
    }
    if(plugin["pluginInitializer"]) {
      plugin["pluginInitializer"](self)
    }
    self.get("plugins").push(plugin);
    return self
  }, unplug:function(plugin) {
    var plugins = [], self = this, isString = typeof plugin == "string";
    S.each(self.get("plugins"), function(p) {
      var keep = 0, pluginId;
      if(plugin) {
        if(isString) {
          pluginId = p.get && p.get("pluginId") || p.pluginId;
          if(pluginId != plugin) {
            plugins.push(p);
            keep = 1
          }
        }else {
          if(p != plugin) {
            plugins.push(p);
            keep = 1
          }
        }
      }
      if(!keep) {
        p.pluginDestructor(self)
      }
    });
    self.setInternal("plugins", plugins);
    return self
  }, getPlugin:function(id) {
    var plugin = null;
    S.each(this.get("plugins"), function(p) {
      var pluginId = p.get && p.get("pluginId") || p.pluginId;
      if(pluginId == id) {
        plugin = p;
        return false
      }
      return undefined
    });
    return plugin
  }, destructor:S.noop, destroy:function() {
    var self = this;
    if(!self.get("destroyed")) {
      callPluginsMethod.call(self, "pluginDestructor");
      self.destructor();
      self.set("destroyed", true);
      self.fire("destroy");
      self.detach()
    }
  }});
  S.mix(Base, {__hooks__:{initializer:__getHook(), destructor:__getHook("__destructor", true)}, ATTRS:{plugins:{value:[]}, destroyed:{value:false}, listeners:{value:[]}}, extend:function extend(extensions, px, sx) {
    var SuperClass = this, name, SubClass;
    if(!S.isArray(extensions)) {
      sx = px;
      px = extensions;
      extensions = []
    }
    sx = sx || {};
    name = sx.name || "BaseDerived";
    px = S.merge(px);
    if(px.hasOwnProperty("constructor")) {
      SubClass = px.constructor
    }else {
      if("@DEBUG@") {
        eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}")
      }else {
        SubClass = function() {
          this.callSuper.apply(this, arguments)
        }
      }
    }
    px.constructor = SubClass;
    var hooks = SuperClass.__hooks__;
    if(hooks) {
      sx.__hooks__ = S.merge(hooks, sx.__hooks__)
    }
    SubClass.__extensions__ = extensions;
    wrapProtoForSuper(px, SubClass, sx.__hooks__ || {});
    var sp = SuperClass.prototype;
    var inheritedStatics = sp["__inheritedStatics__"] = sp["__inheritedStatics__"] || sx["inheritedStatics"];
    if(sx["inheritedStatics"] && inheritedStatics !== sx["inheritedStatics"]) {
      S.mix(inheritedStatics, sx["inheritedStatics"])
    }
    if(inheritedStatics) {
      S.mix(SubClass, inheritedStatics)
    }
    delete sx["inheritedStatics"];
    S.extend(SubClass, SuperClass, px, sx);
    if(extensions.length) {
      var attrs = {}, prototype = {};
      S.each(extensions["concat"](SubClass), function(ext) {
        if(ext) {
          S.each(ext[ATTRS], function(v, name) {
            var av = attrs[name] = attrs[name] || {};
            S.mix(av, v)
          });
          var exp = ext.prototype, p;
          for(p in exp) {
            if(exp.hasOwnProperty(p)) {
              prototype[p] = exp[p]
            }
          }
        }
      });
      SubClass[ATTRS] = attrs;
      prototype.constructor = SubClass;
      S.augment(SubClass, prototype)
    }
    SubClass.extend = SubClass.extend || extend;
    SubClass.addMembers = addMembers;
    return SubClass
  }});
  function addMembers(px) {
    var SubClass = this;
    wrapProtoForSuper(px, SubClass, SubClass.__hooks__ || {});
    S.mix(SubClass.prototype, px)
  }
  function onSetAttrChange(e) {
    var self = this, method;
    if(e.target == self) {
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      method.call(self, e.newVal, e)
    }
  }
  function addAttrs(host, attrs) {
    if(attrs) {
      for(var attr in attrs) {
        host.addAttr(attr, attrs[attr], false)
      }
    }
  }
  function initAttrs(host, config) {
    if(config) {
      for(var attr in config) {
        host.setInternal(attr, config[attr])
      }
    }
  }
  function constructPlugins(self) {
    var plugins = self.get("plugins");
    S.each(plugins, function(plugin, i) {
      if(typeof plugin === "function") {
        plugins[i] = new plugin
      }
    })
  }
  function wrapper(fn) {
    return function() {
      return fn.apply(this, arguments)
    }
  }
  function wrapProtoForSuper(px, SubClass, hooks) {
    var extensions = SubClass.__extensions__;
    if(extensions.length) {
      for(p in hooks) {
        px[p] = px[p] || noop
      }
    }
    for(var p in hooks) {
      if(p in px) {
        px[p] = hooks[p](px[p])
      }
    }
    S.each(px, function(v, p) {
      if(typeof v == "function") {
        var wrapped = 0;
        if(v.__owner__) {
          var originalOwner = v.__owner__;
          delete v.__owner__;
          delete v.__name__;
          wrapped = v.__wrapped__ = 1;
          var newV = wrapper(v);
          newV.__owner__ = originalOwner;
          newV.__name__ = p;
          originalOwner.prototype[p] = newV
        }else {
          if(v.__wrapped__) {
            wrapped = 1
          }
        }
        if(wrapped) {
          px[p] = v = wrapper(v)
        }
        v.__owner__ = SubClass;
        v.__name__ = p
      }
    })
  }
  function callPluginsMethod(method) {
    var len, self = this, plugins = self.get("plugins");
    if(len = plugins.length) {
      for(var i = 0;i < len;i++) {
        plugins[i][method] && plugins[i][method](self)
      }
    }
  }
  function callExtensionsMethod(self, extensions, method, args) {
    var len;
    if(len = extensions && extensions.length) {
      for(var i = 0;i < len;i++) {
        var fn = extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]);
        if(fn) {
          fn.apply(self, args || [])
        }
      }
    }
  }
}, {requires:["attribute", "event/custom"]});

