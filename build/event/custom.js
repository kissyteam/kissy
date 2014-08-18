/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/custom/observer
 event/custom/object
 event/custom/observable
 event/custom/target
 event/custom
*/

KISSY.add("event/custom/observer", ["event/base"], function(S, require) {
  var BaseEvent = require("event/base");
  function CustomEventObserver() {
    CustomEventObserver.superclass.constructor.apply(this, arguments)
  }
  S.extend(CustomEventObserver, BaseEvent.Observer, {keys:["fn", "context", "groups"]});
  return CustomEventObserver
});
KISSY.add("event/custom/object", ["event/base"], function(S, require) {
  var BaseEvent = require("event/base");
  function CustomEventObject(data) {
    CustomEventObject.superclass.constructor.call(this);
    S.mix(this, data)
  }
  S.extend(CustomEventObject, BaseEvent.Object);
  return CustomEventObject
});
KISSY.add("event/custom/observable", ["event/base", "./observer", "./object"], function(S, require) {
  var BaseEvent = require("event/base");
  var CustomEventObserver = require("./observer");
  var CustomEventObject = require("./object");
  var Utils = BaseEvent.Utils;
  function CustomEventObservable() {
    var self = this;
    CustomEventObservable.superclass.constructor.apply(self, arguments);
    self.defaultFn = null;
    self.defaultTargetOnly = false;
    self.bubbles = true
  }
  S.extend(CustomEventObservable, BaseEvent.Observable, {on:function(cfg) {
    var observer = new CustomEventObserver(cfg);
    if(S.Config.debug) {
      if(!observer.fn) {
        S.error("lack event handler for " + this.type)
      }
    }
    if(this.findObserver(observer) === -1) {
      this.observers.push(observer)
    }
  }, fire:function(eventData) {
    eventData = eventData || {};
    var self = this, bubbles = self.bubbles, currentTarget = self.currentTarget, parents, parentsLen, type = self.type, defaultFn = self.defaultFn, i, customEventObject = eventData, gRet, ret;
    eventData.type = type;
    if(!(customEventObject instanceof CustomEventObject)) {
      customEventObject.target = currentTarget;
      customEventObject = new CustomEventObject(customEventObject)
    }
    customEventObject.currentTarget = currentTarget;
    ret = self.notify(customEventObject);
    if(gRet !== false && ret !== undefined) {
      gRet = ret
    }
    if(bubbles && !customEventObject.isPropagationStopped()) {
      parents = currentTarget.getTargets();
      parentsLen = parents && parents.length || 0;
      for(i = 0;i < parentsLen && !customEventObject.isPropagationStopped();i++) {
        ret = parents[i].fire(type, customEventObject);
        if(gRet !== false && ret !== undefined) {
          gRet = ret
        }
      }
    }
    if(defaultFn && !customEventObject.isDefaultPrevented()) {
      var target = customEventObject.target, lowestCustomEventObservable = target.getCustomEventObservable(customEventObject.type);
      if(!self.defaultTargetOnly && !lowestCustomEventObservable.defaultTargetOnly || currentTarget === target) {
        gRet = defaultFn.call(currentTarget, customEventObject)
      }
    }
    return gRet
  }, notify:function(event) {
    var observers = [].concat(this.observers), ret, gRet, len = observers.length, i;
    for(i = 0;i < len && !event.isImmediatePropagationStopped();i++) {
      ret = observers[i].notify(event, this);
      if(gRet !== false && ret !== undefined) {
        gRet = ret
      }
    }
    return gRet
  }, detach:function(cfg) {
    var groupsRe, self = this, fn = cfg.fn, context = cfg.context, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
    if(!observers.length) {
      return
    }
    if(groups) {
      groupsRe = Utils.getGroupsRe(groups)
    }
    var i, j, t, observer, observerContext, len = observers.length;
    if(fn || groupsRe) {
      context = context || currentTarget;
      for(i = 0, j = 0, t = [];i < len;++i) {
        observer = observers[i];
        observerContext = observer.context || currentTarget;
        if(context !== observerContext || fn && fn !== observer.fn || groupsRe && !observer.groups.match(groupsRe)) {
          t[j++] = observer
        }
      }
      self.observers = t
    }else {
      self.reset()
    }
  }});
  return CustomEventObservable
});
KISSY.add("event/custom/target", ["event/base", "./observable"], function(S, require) {
  var BaseEvent = require("event/base");
  var CustomEventObservable = require("./observable");
  var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, KS_BUBBLE_TARGETS = "__~ks_bubble_targets";
  var KS_CUSTOM_EVENTS = "__~ks_custom_events";
  return{isTarget:1, getCustomEventObservable:function(type, create) {
    var target = this, customEvent, customEventObservables = target.getCustomEvents();
    customEvent = customEventObservables && customEventObservables[type];
    if(!customEvent && create) {
      customEvent = customEventObservables[type] = new CustomEventObservable({currentTarget:target, type:type})
    }
    return customEvent
  }, fire:function(type, eventData) {
    var self = this, ret, targets = self.getTargets(), hasTargets = targets && targets.length;
    eventData = eventData || {};
    splitAndRun(type, function(type) {
      var r2, customEventObservable;
      Utils.fillGroupsForEvent(type, eventData);
      type = eventData.type;
      customEventObservable = self.getCustomEventObservable(type);
      if(!customEventObservable && !hasTargets) {
        return
      }
      if(customEventObservable) {
        if(!customEventObservable.hasObserver() && !customEventObservable.defaultFn) {
          if(customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles) {
            return
          }
        }
      }else {
        customEventObservable = new CustomEventObservable({currentTarget:self, type:type})
      }
      r2 = customEventObservable.fire(eventData);
      if(ret !== false && r2 !== undefined) {
        ret = r2
      }
    });
    return ret
  }, publish:function(type, cfg) {
    var customEventObservable, self = this;
    splitAndRun(type, function(t) {
      customEventObservable = self.getCustomEventObservable(t, true);
      S.mix(customEventObservable, cfg)
    });
    return self
  }, addTarget:function(anotherTarget) {
    var self = this, targets = self.getTargets();
    if(!S.inArray(anotherTarget, targets)) {
      targets.push(anotherTarget)
    }
    return self
  }, removeTarget:function(anotherTarget) {
    var self = this, targets = self.getTargets(), index = S.indexOf(anotherTarget, targets);
    if(index !== -1) {
      targets.splice(index, 1)
    }
    return self
  }, getTargets:function() {
    return this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = [])
  }, getCustomEvents:function() {
    return this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {})
  }, on:function(type, fn, context) {
    var self = this;
    Utils.batchForType(function(type, fn, context) {
      var cfg = Utils.normalizeParam(type, fn, context), customEvent;
      type = cfg.type;
      customEvent = self.getCustomEventObservable(type, true);
      if(customEvent) {
        customEvent.on(cfg)
      }
    }, 0, type, fn, context);
    return self
  }, detach:function(type, fn, context) {
    var self = this;
    Utils.batchForType(function(type, fn, context) {
      var cfg = Utils.normalizeParam(type, fn, context), customEvents, customEvent;
      type = cfg.type;
      if(type) {
        customEvent = self.getCustomEventObservable(type, true);
        if(customEvent) {
          customEvent.detach(cfg)
        }
      }else {
        customEvents = self.getCustomEvents();
        S.each(customEvents, function(customEvent) {
          customEvent.detach(cfg)
        })
      }
    }, 0, type, fn, context);
    return self
  }}
});
KISSY.add("event/custom", ["./custom/target"], function(S, require) {
  var Target = require("./custom/target");
  return{Target:Target, global:S.mix({}, Target)}
});

