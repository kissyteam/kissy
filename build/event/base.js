/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: Aug 28 12:46
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/base/utils
 event/base/object
 event/base/observer
 event/base/observable
 event/base
*/

KISSY.add("event/base/utils", [], function(S) {
  var splitAndRun, getGroupsRe;
  function getTypedGroups(type) {
    if(type.indexOf(".") < 0) {
      return[type, ""]
    }
    var m = type.match(/([^.]+)?(\..+)?$/), t = m[1], ret = [t], gs = m[2];
    if(gs) {
      gs = gs.split(".").sort();
      ret.push(gs.join("."))
    }else {
      ret.push("")
    }
    return ret
  }
  return{splitAndRun:splitAndRun = function(type, fn) {
    if(S.isArray(type)) {
      S.each(type, fn);
      return
    }
    type = S.trim(type);
    if(type.indexOf(" ") === -1) {
      fn(type)
    }else {
      S.each(type.split(/\s+/), fn)
    }
  }, normalizeParam:function(type, fn, context) {
    var cfg = fn || {};
    if(typeof fn === "function") {
      cfg = {fn:fn, context:context}
    }else {
      cfg = S.merge(cfg)
    }
    var typedGroups = getTypedGroups(type);
    type = typedGroups[0];
    cfg.groups = typedGroups[1];
    cfg.type = type;
    return cfg
  }, batchForType:function(fn, num) {
    var args = S.makeArray(arguments), types = args[2 + num];
    if(types && typeof types === "object") {
      S.each(types, function(value, type) {
        var args2 = [].concat(args);
        args2.splice(0, 2);
        args2[num] = type;
        args2[num + 1] = value;
        fn.apply(null, args2)
      })
    }else {
      splitAndRun(types, function(type) {
        var args2 = [].concat(args);
        args2.splice(0, 2);
        args2[num] = type;
        fn.apply(null, args2)
      })
    }
  }, fillGroupsForEvent:function(type, eventData) {
    var typedGroups = getTypedGroups(type), _ksGroups = typedGroups[1];
    if(_ksGroups) {
      _ksGroups = getGroupsRe(_ksGroups);
      eventData._ksGroups = _ksGroups
    }
    eventData.type = typedGroups[0]
  }, getGroupsRe:getGroupsRe = function(groups) {
    return new RegExp(groups.split(".").join(".*\\.") + "(?:\\.|$)")
  }}
});
KISSY.add("event/base/object", [], function(S) {
  var returnFalse = function() {
    return false
  }, returnTrue = function() {
    return true
  };
  function EventObject() {
    var self = this;
    self.timeStamp = S.now();
    self.target = undefined;
    self.currentTarget = undefined
  }
  EventObject.prototype = {constructor:EventObject, isDefaultPrevented:returnFalse, isPropagationStopped:returnFalse, isImmediatePropagationStopped:returnFalse, preventDefault:function() {
    this.isDefaultPrevented = returnTrue
  }, stopPropagation:function() {
    this.isPropagationStopped = returnTrue
  }, stopImmediatePropagation:function() {
    var self = this;
    self.isImmediatePropagationStopped = returnTrue;
    self.stopPropagation()
  }, halt:function(immediate) {
    var self = this;
    if(immediate) {
      self.stopImmediatePropagation()
    }else {
      self.stopPropagation()
    }
    self.preventDefault()
  }};
  return EventObject
});
KISSY.add("event/base/observer", [], function(S) {
  function Observer(cfg) {
    S.mix(this, cfg)
  }
  Observer.prototype = {constructor:Observer, equals:function(s2) {
    var s1 = this;
    return!!S.reduce(s1.keys, function(v, k) {
      return v && s1[k] === s2[k]
    }, 1)
  }, simpleNotify:function(event, ce) {
    var ret, self = this;
    ret = self.fn.call(self.context || ce.currentTarget, event, self.data);
    if(self.once) {
      ce.removeObserver(self)
    }
    return ret
  }, notifyInternal:function(event, ce) {
    var ret = this.simpleNotify(event, ce);
    if(ret === false) {
      event.halt()
    }
    return ret
  }, notify:function(event, ce) {
    var self = this, _ksGroups = event._ksGroups;
    if(_ksGroups && (!self.groups || !self.groups.match(_ksGroups))) {
      return undefined
    }
    return self.notifyInternal(event, ce)
  }};
  return Observer
});
KISSY.add("event/base/observable", [], function(S) {
  function Observable(cfg) {
    var self = this;
    self.currentTarget = null;
    S.mix(self, cfg);
    self.reset()
  }
  Observable.prototype = {constructor:Observable, hasObserver:function() {
    return!!this.observers.length
  }, reset:function() {
    var self = this;
    self.observers = []
  }, removeObserver:function(observer) {
    var self = this, i, observers = self.observers, len = observers.length;
    for(i = 0;i < len;i++) {
      if(observers[i] === observer) {
        observers.splice(i, 1);
        break
      }
    }
    self.checkMemory()
  }, checkMemory:function() {
  }, findObserver:function(observer) {
    var observers = this.observers, i;
    for(i = observers.length - 1;i >= 0;--i) {
      if(observer.equals(observers[i])) {
        return i
      }
    }
    return-1
  }};
  return Observable
});
KISSY.add("event/base", ["./base/utils", "./base/object", "./base/observer", "./base/observable"], function(S, require) {
  var Utils = require("./base/utils");
  var Object = require("./base/object");
  var Observer = require("./base/observer");
  var Observable = require("./base/observable");
  return{Utils:Utils, Object:Object, Observer:Observer, Observable:Observable}
});

