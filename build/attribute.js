/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 18 18:52
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 attribute
*/

KISSY.add("attribute", function(S, undefined) {
  var INVALID = {};
  var FALSE = false;
  function normalFn(host, method) {
    if(typeof method == "string") {
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
    for(var i = 0, len = path.length;o != undefined && i < len;i++) {
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
      if(o != undefined) {
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
    if(opts["silent"]) {
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
    if(!opts["silent"]) {
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
  return{INVALID:INVALID, getAttrs:function() {
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
    var self = this;
    if(S.isPlainObject(name)) {
      opts = value;
      opts = opts || {};
      var all = Object(name), attrs = [], e, errors = [];
      for(name in all) {
        if((e = validate(self, name, all[name], all)) !== undefined) {
          errors.push(e)
        }
      }
      if(errors.length) {
        if(opts["error"]) {
          opts["error"](errors)
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
      if(opts["error"]) {
        opts["error"](e)
      }
      return FALSE
    }
    return setInternal(self, name, value, opts)
  }, setInternal:function(name, value) {
    var self = this, setValue = undefined, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig["setter"];
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
    getter = attrConfig["getter"];
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
    if(typeof name == "string") {
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
  }};
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
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig["validator"];
    if(validator && (validator = normalFn(self, validator))) {
      e = validator.call(self, value, name, all);
      if(e !== undefined && e !== true) {
        return e
      }
    }
    return undefined
  }
});

