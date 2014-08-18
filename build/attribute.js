/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:15
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 attribute
*/

KISSY.add("attribute", ["event/custom"], function(S, require, exports, module) {
  var RE_DASH = /(?:^|-)([a-z])/ig;
  var CustomEvent = require("event/custom");
  module.exports = Attribute;
  var bind = S.bind;
  function replaceToUpper() {
    return arguments[1].toUpperCase()
  }
  function camelCase(name) {
    return name.replace(RE_DASH, replaceToUpper)
  }
  var INVALID = {};
  var FALSE = false;
  function normalFn(host, method) {
    if(typeof method === "string") {
      return host[method]
    }
    return method
  }
  function getAttrVals(self) {
    return self.__attrVals || (self.__attrVals = {})
  }
  function whenAttrChangeEventName(when, name) {
    return when + S.ucfirst(name) + "Change"
  }
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    attrName = attrName || name;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({attrName:attrName, subAttrName:subAttrName, prevVal:prevVal, newVal:newVal}, data))
  }
  function ensureNonEmpty(obj, name, doNotCreate) {
    var ret = obj[name];
    if(!doNotCreate && !ret) {
      obj[name] = ret = {}
    }
    return ret || {}
  }
  function getValueByPath(o, path) {
    for(var i = 0, len = path.length;o !== undefined && i < len;i++) {
      o = o[path[i]]
    }
    return o
  }
  function setValueByPath(o, path, val) {
    var len = path.length - 1, s = o;
    if(len >= 0) {
      for(var i = 0;i < len;i++) {
        o = o[path[i]]
      }
      if(o !== undefined) {
        o[path[i]] = val
      }else {
        s = undefined
      }
    }
    return s
  }
  function getPathNamePair(name) {
    var path;
    if(name.indexOf(".") !== -1) {
      path = name.split(".");
      name = path.shift()
    }
    return{path:path, name:name}
  }
  function getValueBySubValue(prevVal, path, value) {
    var tmp = value;
    if(path) {
      if(prevVal === undefined) {
        tmp = {}
      }else {
        tmp = S.clone(prevVal)
      }
      setValueByPath(tmp, path, value)
    }
    return tmp
  }
  function prepareDefaultSetFn(self, name) {
    var defaultBeforeFns = ensureNonEmpty(self, "__defaultBeforeFns");
    if(defaultBeforeFns[name]) {
      return
    }
    defaultBeforeFns[name] = 1;
    var beforeChangeEventName = whenAttrChangeEventName("before", name);
    self.publish(beforeChangeEventName, {defaultFn:defaultSetFn})
  }
  function setInternal(self, name, value, opts, attrs) {
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    name = pathNamePair.name;
    path = pathNamePair.path;
    prevVal = self.get(name);
    prepareDefaultSetFn(self, name);
    if(path) {
      subVal = getValueByPath(prevVal, path)
    }
    if(!opts.force) {
      if(!path && prevVal === value) {
        return undefined
      }else {
        if(path && subVal === value) {
          return undefined
        }
      }
    }
    value = getValueBySubValue(prevVal, path, value);
    var beforeEventObject = S.mix({attrName:name, subAttrName:fullName, prevVal:prevVal, newVal:value, _opts:opts, _attrs:attrs, target:self}, opts.data);
    if(opts.silent) {
      if(FALSE === defaultSetFn.call(self, beforeEventObject)) {
        return FALSE
      }
    }else {
      if(FALSE === self.fire(whenAttrChangeEventName("before", name), beforeEventObject)) {
        return FALSE
      }
    }
    return self
  }
  function defaultSetFn(e) {
    if(e.target !== this) {
      return undefined
    }
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    var ret = self.setInternal(name, value);
    if(ret === FALSE) {
      return ret
    }
    if(!opts.silent) {
      value = getAttrVals(self)[name];
      __fireAttrChange(self, "after", name, prevVal, value, fullName, null, opts.data);
      if(attrs) {
        attrs.push({prevVal:prevVal, newVal:value, attrName:name, subAttrName:fullName})
      }else {
        __fireAttrChange(self, "", "*", [prevVal], [value], [fullName], [name], opts.data)
      }
    }
    return undefined
  }
  function Attribute(config) {
    var self = this, c = self.constructor;
    self.userConfig = config;
    while(c) {
      addAttrs(self, c.ATTRS);
      c = c.superclass ? c.superclass.constructor : null
    }
    initAttrs(self, config)
  }
  function wrapProtoForSuper(px, SubClass) {
    var hooks = SubClass.__hooks__ || {};
    for(var p in hooks) {
      if(p in px) {
        px[p] = hooks[p](px[p])
      }
    }
    S.each(px, function(v, p) {
      if(typeof v === "function") {
        var wrapped = 0;
        if(v.__owner__) {
          var originalOwner = v.__owner__;
          delete v.__owner__;
          delete v.__name__;
          wrapped = v.__wrapped__ = 1;
          var newV = bind(v);
          newV.__owner__ = originalOwner;
          newV.__name__ = p;
          originalOwner.prototype[p] = newV
        }else {
          if(v.__wrapped__) {
            wrapped = 1
          }
        }
        if(wrapped) {
          px[p] = v = bind(v)
        }
        v.__owner__ = SubClass;
        v.__name__ = p
      }
    })
  }
  function addMembers(px) {
    var SubClass = this;
    wrapProtoForSuper(px, SubClass);
    S.mix(SubClass.prototype, px)
  }
  Attribute.extend = function extend(px, sx) {
    var SubClass, SuperClass = this;
    sx = sx || {};
    px = px || {};
    var hooks, sxHooks = sx.__hooks__;
    if(hooks = SuperClass.__hooks__) {
      sxHooks = sx.__hooks__ = sx.__hooks__ || {};
      S.mix(sxHooks, hooks, false)
    }
    var name = sx.name || "AttributeDerived";
    if(px.hasOwnProperty("constructor")) {
      SubClass = px.constructor
    }else {
      if("@DEBUG@") {
        SubClass = (new Function("return function " + camelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);" + "}"))()
      }else {
        SubClass = function() {
          this.callSuper.apply(this, arguments)
        }
      }
    }
    px.constructor = SubClass;
    SubClass.__hooks__ = sxHooks;
    wrapProtoForSuper(px, SubClass);
    var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
    if(inheritedStatics = SuperClass.inheritedStatics) {
      sxInheritedStatics = sx.inheritedStatics = sx.inheritedStatics || {};
      S.mix(sxInheritedStatics, inheritedStatics, false)
    }
    S.extend(SubClass, SuperClass, px, sx);
    if(sxInheritedStatics) {
      S.mix(SubClass, sxInheritedStatics)
    }
    SubClass.extend = sx.extend || extend;
    SubClass.addMembers = addMembers;
    return SubClass
  };
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
  S.augment(Attribute, CustomEvent.Target, {INVALID:INVALID, callSuper:function() {
    var method, obj, self = this, args = arguments;
    if(typeof self === "function" && self.__name__) {
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
  }, getAttrs:function() {
    return this.__attrs || (this.__attrs = {})
  }, getAttrVals:function() {
    var self = this, o = {}, a, attrs = self.getAttrs();
    for(a in attrs) {
      o[a] = self.get(a)
    }
    return o
  }, addAttr:function(name, attrConfig, override) {
    var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
    if(attr = attrs[name]) {
      S.mix(attr, cfg, override)
    }else {
      attrs[name] = cfg
    }
    return self
  }, addAttrs:function(attrConfigs, initialValues) {
    var self = this;
    S.each(attrConfigs, function(attrConfig, name) {
      self.addAttr(name, attrConfig)
    });
    if(initialValues) {
      self.set(initialValues)
    }
    return self
  }, hasAttr:function(name) {
    return this.getAttrs().hasOwnProperty(name)
  }, removeAttr:function(name) {
    var self = this;
    var __attrVals = getAttrVals(self);
    var __attrs = self.getAttrs();
    if(self.hasAttr(name)) {
      delete __attrs[name];
      delete __attrVals[name]
    }
    return self
  }, set:function(name, value, opts) {
    var self = this, e;
    if(S.isPlainObject(name)) {
      opts = value;
      opts = opts || {};
      var all = Object(name), attrs = [], errors = [];
      for(name in all) {
        if((e = validate(self, name, all[name], all)) !== undefined) {
          errors.push(e)
        }
      }
      if(errors.length) {
        if(opts.error) {
          opts.error(errors)
        }
        return FALSE
      }
      for(name in all) {
        setInternal(self, name, all[name], opts, attrs)
      }
      var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
      S.each(attrs, function(attr) {
        prevVals.push(attr.prevVal);
        newVals.push(attr.newVal);
        attrNames.push(attr.attrName);
        subAttrNames.push(attr.subAttrName)
      });
      if(attrNames.length) {
        __fireAttrChange(self, "", "*", prevVals, newVals, subAttrNames, attrNames, opts.data)
      }
      return self
    }
    opts = opts || {};
    e = validate(self, name, value);
    if(e !== undefined) {
      if(opts.error) {
        opts.error(e)
      }
      return FALSE
    }
    return setInternal(self, name, value, opts)
  }, setInternal:function(name, value) {
    var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
    if(setter && (setter = normalFn(self, setter))) {
      setValue = setter.call(self, value, name)
    }
    if(setValue === INVALID) {
      return FALSE
    }
    if(setValue !== undefined) {
      value = setValue
    }
    getAttrVals(self)[name] = value;
    return undefined
  }, get:function(name) {
    var self = this, dot = ".", path, attrVals = getAttrVals(self), attrConfig, getter, ret;
    if(name.indexOf(dot) !== -1) {
      path = name.split(dot);
      name = path.shift()
    }
    attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
    getter = attrConfig.getter;
    ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
    if(getter && (getter = normalFn(self, getter))) {
      ret = getter.call(self, ret, name)
    }
    if(!(name in attrVals) && ret !== undefined) {
      attrVals[name] = ret
    }
    if(path) {
      ret = getValueByPath(ret, path)
    }
    return ret
  }, reset:function(name, opts) {
    var self = this;
    if(typeof name === "string") {
      if(self.hasAttr(name)) {
        return self.set(name, getDefAttrVal(self, name), opts)
      }else {
        return self
      }
    }
    opts = name;
    var attrs = self.getAttrs(), values = {};
    for(name in attrs) {
      values[name] = getDefAttrVal(self, name)
    }
    self.set(values, opts);
    return self
  }});
  function getDefAttrVal(self, name) {
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    if(valFn && (valFn = normalFn(self, valFn))) {
      val = valFn.call(self);
      if(val !== undefined) {
        attrConfig.value = val
      }
      delete attrConfig.valueFn;
      attrs[name] = attrConfig
    }
    return attrConfig.value
  }
  function validate(self, name, value, all) {
    var path, prevVal, pathNamePair;
    pathNamePair = getPathNamePair(name);
    name = pathNamePair.name;
    path = pathNamePair.path;
    if(path) {
      prevVal = self.get(name);
      value = getValueBySubValue(prevVal, path, value)
    }
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    if(validator && (validator = normalFn(self, validator))) {
      e = validator.call(self, value, name, all);
      if(e !== undefined && e !== true) {
        return e
      }
    }
    return undefined
  }
});

