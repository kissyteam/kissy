/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:15
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 base
*/

KISSY.add("base", ["attribute"], function(S, require) {
  var Attribute = require("attribute");
  var ucfirst = S.ucfirst, ON_SET = "_onSet", noop = S.noop;
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
  var Base = Attribute.extend({constructor:function() {
    var self = this;
    self.callSuper.apply(self, arguments);
    var listeners = self.get("listeners");
    for(var n in listeners) {
      self.on(n, listeners[n])
    }
    self.initializer();
    constructPlugins(self);
    callPluginsMethod.call(self, "pluginInitializer");
    self.bindInternal();
    self.syncInternal()
  }, initializer:noop, __getHook:__getHook, __callPluginsMethod:callPluginsMethod, bindInternal:function() {
    var self = this, attrs = self.getAttrs(), attr, m;
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
      var Plugin = plugin;
      plugin = new Plugin
    }
    if(plugin.pluginInitializer) {
      plugin.pluginInitializer(self)
    }
    self.get("plugins").push(plugin);
    return self
  }, unplug:function(plugin) {
    var plugins = [], self = this, isString = typeof plugin === "string";
    S.each(self.get("plugins"), function(p) {
      var keep = 0, pluginId;
      if(plugin) {
        if(isString) {
          pluginId = p.get && p.get("pluginId") || p.pluginId;
          if(pluginId !== plugin) {
            plugins.push(p);
            keep = 1
          }
        }else {
          if(p !== plugin) {
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
      if(pluginId === id) {
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
    if(!S.isArray(extensions)) {
      sx = px;
      px = extensions;
      extensions = []
    }
    sx = sx || {};
    px = px || {};
    var SubClass = Attribute.extend.call(this, px, sx);
    SubClass.__extensions__ = extensions;
    baseAddMembers.call(SubClass, {});
    if(extensions.length) {
      var attrs = {}, prototype = {};
      S.each(extensions.concat(SubClass), function(ext) {
        if(ext) {
          S.each(ext.ATTRS, function(v, name) {
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
      SubClass.ATTRS = attrs;
      prototype.constructor = SubClass;
      S.augment(SubClass, prototype)
    }
    SubClass.extend = sx.extend || extend;
    SubClass.addMembers = baseAddMembers;
    return SubClass
  }});
  var addMembers = Base.addMembers;
  function baseAddMembers(px) {
    var SubClass = this;
    var extensions = SubClass.__extensions__, hooks = SubClass.__hooks__, proto = SubClass.prototype;
    if(extensions.length && hooks) {
      for(var h in hooks) {
        if(proto.hasOwnProperty(h) && !px.hasOwnProperty(h)) {
          continue
        }
        px[h] = px[h] || noop
      }
    }
    return addMembers.call(SubClass, px)
  }
  function onSetAttrChange(e) {
    var self = this, method;
    if(e.target === self) {
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      method.call(self, e.newVal, e)
    }
  }
  function constructPlugins(self) {
    var plugins = self.get("plugins"), Plugin;
    S.each(plugins, function(plugin, i) {
      if(typeof plugin === "function") {
        Plugin = plugin;
        plugins[i] = new Plugin
      }
    })
  }
  function callPluginsMethod(method) {
    var len, self = this, plugins = self.get("plugins");
    if(len = plugins.length) {
      for(var i = 0;i < len;i++) {
        if(plugins[i][method]) {
          plugins[i][method](self)
        }
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
  S.Base = Base;
  return Base
});

