/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/dom/base/utils
 event/dom/base/special
 event/dom/base/observer
 event/dom/base/object
 event/dom/base/observable
 event/dom/base/dom-event
 event/dom/base/key-codes
 event/dom/base/gesture
 event/dom/base/special-events
 event/dom/base/mouseenter
 event/dom/base/valuechange
 event/dom/base
*/

KISSY.add("event/dom/base/utils", ["dom"], function(S, require) {
  var Dom = require("dom");
  var EVENT_GUID = "ksEventTargetId_" + S.now(), doc = S.Env.host.document, simpleAdd = doc && doc.addEventListener ? function(el, type, fn, capture) {
    if(el.addEventListener) {
      el.addEventListener(type, fn, !!capture)
    }
  } : function(el, type, fn) {
    if(el.attachEvent) {
      el.attachEvent("on" + type, fn)
    }
  }, simpleRemove = doc && doc.removeEventListener ? function(el, type, fn, capture) {
    if(el.removeEventListener) {
      el.removeEventListener(type, fn, !!capture)
    }
  } : function(el, type, fn) {
    if(el.detachEvent) {
      el.detachEvent("on" + type, fn)
    }
  };
  return{simpleAdd:simpleAdd, simpleRemove:simpleRemove, data:function(elem, v) {
    return Dom.data(elem, EVENT_GUID, v)
  }, removeData:function(elem) {
    return Dom.removeData(elem, EVENT_GUID)
  }}
});
KISSY.add("event/dom/base/special", [], function() {
  return{}
});
KISSY.add("event/dom/base/observer", ["event/base", "./special"], function(S, require) {
  var BaseEvent = require("event/base");
  var Special = require("./special");
  function DomEventObserver(cfg) {
    DomEventObserver.superclass.constructor.call(this, cfg)
  }
  S.extend(DomEventObserver, BaseEvent.Observer, {keys:["fn", "filter", "data", "context", "originalType", "groups", "last"], notifyInternal:function(event, ce) {
    var self = this, s, t, ret, type = event.type, originalType;
    if(originalType = self.originalType) {
      event.type = originalType
    }else {
      originalType = type
    }
    if((s = Special[originalType]) && s.handle) {
      t = s.handle(event, self, ce);
      if(t && t.length > 0) {
        ret = t[0]
      }
    }else {
      ret = self.simpleNotify(event, ce)
    }
    if(ret === false) {
      event.halt()
    }
    event.type = type;
    return ret
  }});
  return DomEventObserver
});
KISSY.add("event/dom/base/object", ["event/base"], function(S, require) {
  var BaseEvent = require("event/base");
  var DOCUMENT = S.Env.host.document, TRUE = true, FALSE = false, commonProps = ["altKey", "bubbles", "cancelable", "ctrlKey", "currentTarget", "eventPhase", "metaKey", "shiftKey", "target", "timeStamp", "view", "type"], eventNormalizers = [{reg:/^key/, props:["char", "charCode", "key", "keyCode", "which"], fix:function(event, originalEvent) {
    if(event.which == null) {
      event.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode
    }
    if(event.metaKey === undefined) {
      event.metaKey = event.ctrlKey
    }
  }}, {reg:/^touch/, props:["touches", "changedTouches", "targetTouches"]}, {reg:/^gesturechange$/i, props:["rotation", "scale"]}, {reg:/^(mousewheel|DOMMouseScroll)$/, props:[], fix:function(event, originalEvent) {
    var deltaX, deltaY, delta, wheelDelta = originalEvent.wheelDelta, axis = originalEvent.axis, wheelDeltaY = originalEvent.wheelDeltaY, wheelDeltaX = originalEvent.wheelDeltaX, detail = originalEvent.detail;
    if(wheelDelta) {
      delta = wheelDelta / 120
    }
    if(detail) {
      delta = -(detail % 3 === 0 ? detail / 3 : detail)
    }
    if(axis !== undefined) {
      if(axis === event.HORIZONTAL_AXIS) {
        deltaY = 0;
        deltaX = -1 * delta
      }else {
        if(axis === event.VERTICAL_AXIS) {
          deltaX = 0;
          deltaY = delta
        }
      }
    }
    if(wheelDeltaY !== undefined) {
      deltaY = wheelDeltaY / 120
    }
    if(wheelDeltaX !== undefined) {
      deltaX = -1 * wheelDeltaX / 120
    }
    if(!deltaX && !deltaY) {
      deltaY = delta
    }
    if(deltaX !== undefined) {
      event.deltaX = deltaX
    }
    if(deltaY !== undefined) {
      event.deltaY = deltaY
    }
    if(delta !== undefined) {
      event.delta = delta
    }
  }}, {reg:/^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i, props:["buttons", "clientX", "clientY", "button", "offsetX", "relatedTarget", "which", "fromElement", "toElement", "offsetY", "pageX", "pageY", "screenX", "screenY"], fix:function(event, originalEvent) {
    var eventDoc, doc, body, target = event.target, button = originalEvent.button;
    if(event.pageX == null && originalEvent.clientX != null) {
      eventDoc = target.ownerDocument || DOCUMENT;
      doc = eventDoc.documentElement;
      body = eventDoc.body;
      event.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
    }
    if(!event.which && button !== undefined) {
      event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0
    }
    if(!event.relatedTarget && event.fromElement) {
      event.relatedTarget = event.fromElement === target ? event.toElement : event.fromElement
    }
    return event
  }}];
  function retTrue() {
    return TRUE
  }
  function retFalse() {
    return FALSE
  }
  function DomEventObject(originalEvent) {
    var self = this, type = originalEvent.type;
    DomEventObject.superclass.constructor.call(self);
    self.originalEvent = originalEvent;
    var isDefaultPrevented = retFalse;
    if("defaultPrevented" in originalEvent) {
      isDefaultPrevented = originalEvent.defaultPrevented ? retTrue : retFalse
    }else {
      if("getPreventDefault" in originalEvent) {
        isDefaultPrevented = originalEvent.getPreventDefault() ? retTrue : retFalse
      }else {
        if("returnValue" in originalEvent) {
          isDefaultPrevented = originalEvent.returnValue === FALSE ? retTrue : retFalse
        }
      }
    }
    self.isDefaultPrevented = isDefaultPrevented;
    var fixFns = [], fixFn, l, prop, props = commonProps.concat();
    S.each(eventNormalizers, function(normalizer) {
      if(type.match(normalizer.reg)) {
        props = props.concat(normalizer.props);
        if(normalizer.fix) {
          fixFns.push(normalizer.fix)
        }
      }
      return undefined
    });
    l = props.length;
    while(l) {
      prop = props[--l];
      self[prop] = originalEvent[prop]
    }
    if(!self.target) {
      self.target = originalEvent.srcElement || DOCUMENT
    }
    if(self.target.nodeType === 3) {
      self.target = self.target.parentNode
    }
    l = fixFns.length;
    while(l) {
      fixFn = fixFns[--l];
      fixFn(self, originalEvent)
    }
  }
  S.extend(DomEventObject, BaseEvent.Object, {constructor:DomEventObject, preventDefault:function() {
    var self = this, e = self.originalEvent;
    if(e.preventDefault) {
      e.preventDefault()
    }else {
      e.returnValue = FALSE
    }
    DomEventObject.superclass.preventDefault.call(self)
  }, stopPropagation:function() {
    var self = this, e = self.originalEvent;
    if(e.stopPropagation) {
      e.stopPropagation()
    }else {
      e.cancelBubble = TRUE
    }
    DomEventObject.superclass.stopPropagation.call(self)
  }});
  return DomEventObject
});
KISSY.add("event/dom/base/observable", ["event/base", "dom", "./special", "./utils", "./observer", "./object"], function(S, require) {
  var BaseEvent = require("event/base");
  var Dom = require("dom");
  var Special = require("./special");
  var DomEventUtils = require("./utils");
  var DomEventObserver = require("./observer");
  var DomEventObject = require("./object");
  var BaseUtils = BaseEvent.Utils;
  var logger = S.getLogger("s/event");
  function DomEventObservable(cfg) {
    var self = this;
    S.mix(self, cfg);
    self.reset()
  }
  S.extend(DomEventObservable, BaseEvent.Observable, {setup:function() {
    var self = this, type = self.type, s = Special[type] || {}, currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
    if(!s.setup || s.setup.call(currentTarget, type) === false) {
      DomEventUtils.simpleAdd(currentTarget, type, handle)
    }
  }, constructor:DomEventObservable, reset:function() {
    var self = this;
    DomEventObservable.superclass.reset.call(self);
    self.delegateCount = 0;
    self.lastCount = 0
  }, notify:function(event) {
    var target = event.target, eventType = event.type, self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = self.delegateCount || 0, len, currentTargetObservers, currentTargetObserver, observer;
    if(delegateCount && target.nodeType) {
      while(target !== currentTarget) {
        if(target.disabled !== true || eventType !== "click") {
          var cachedMatch = {}, matched, key, filter;
          currentTargetObservers = [];
          for(i = 0;i < delegateCount;i++) {
            observer = observers[i];
            filter = observer.filter;
            key = filter + "";
            matched = cachedMatch[key];
            if(matched === undefined) {
              matched = cachedMatch[key] = Dom.test(target, filter)
            }
            if(matched) {
              currentTargetObservers.push(observer)
            }
          }
          if(currentTargetObservers.length) {
            allObservers.push({currentTarget:target, currentTargetObservers:currentTargetObservers})
          }
        }
        target = target.parentNode || currentTarget
      }
    }
    if(delegateCount < observers.length) {
      allObservers.push({currentTarget:currentTarget, currentTargetObservers:observers.slice(delegateCount)})
    }
    for(i = 0, len = allObservers.length;!event.isPropagationStopped() && i < len;++i) {
      observerObj = allObservers[i];
      currentTargetObservers = observerObj.currentTargetObservers;
      currentTarget0 = observerObj.currentTarget;
      event.currentTarget = currentTarget0;
      for(j = 0;!event.isImmediatePropagationStopped() && j < currentTargetObservers.length;j++) {
        currentTargetObserver = currentTargetObservers[j];
        ret = currentTargetObserver.notify(event, self);
        if(gRet !== false && ret !== undefined) {
          gRet = ret
        }
      }
    }
    return gRet
  }, fire:function(event, onlyHandlers) {
    event = event || {};
    var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = Special[eventType] || {}, bubbles = specialEvent.bubbles !== false, currentTarget = self.currentTarget;
    if(specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false) {
      return
    }
    if(!(event instanceof DomEventObject)) {
      eventData = event;
      event = new DomEventObject({currentTarget:currentTarget, type:eventType, target:currentTarget});
      S.mix(event, eventData)
    }
    if(specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false) {
      return
    }
    var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = "on" + eventType, eventPathIndex = 0;
    do {
      eventPath.push(cur);
      cur = cur.parentNode || cur.ownerDocument || cur === curDocument && win
    }while(!onlyHandlers && cur && bubbles);
    cur = eventPath[eventPathIndex];
    do {
      event.currentTarget = cur;
      domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
      if(domEventObservable) {
        ret = domEventObservable.notify(event);
        if(ret !== undefined && gret !== false) {
          gret = ret
        }
      }
      if(cur[ontype] && cur[ontype].call(cur) === false) {
        event.preventDefault()
      }
      cur = eventPath[++eventPathIndex]
    }while(!onlyHandlers && cur && !event.isPropagationStopped());
    if(!onlyHandlers && !event.isDefaultPrevented()) {
      try {
        if(currentTarget[eventType] && !S.isWindow(currentTarget)) {
          DomEventObservable.triggeredEvent = eventType;
          currentTarget[eventType]()
        }
      }catch(eError) {
        logger.debug("trigger action error: " + eError)
      }
      DomEventObservable.triggeredEvent = ""
    }
    return gret
  }, on:function(cfg) {
    var self = this, observers = self.observers, s = Special[self.type] || {}, observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
    if(S.Config.debug) {
      if(!observer.fn) {
        S.error("lack event handler for " + self.type)
      }
    }
    if(self.findObserver(observer) === -1) {
      if(observer.filter) {
        observers.splice(self.delegateCount, 0, observer);
        self.delegateCount++
      }else {
        if(observer.last) {
          observers.push(observer);
          self.lastCount++
        }else {
          observers.splice(observers.length - self.lastCount, 0, observer)
        }
      }
      if(s.add) {
        s.add.call(self.currentTarget, observer)
      }
    }
  }, detach:function(cfg) {
    var groupsRe, self = this, s = Special[self.type] || {}, hasFilter = "filter" in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
    if(!observers.length) {
      return
    }
    if(groups) {
      groupsRe = BaseUtils.getGroupsRe(groups)
    }
    var i, j, t, observer, observerContext, len = observers.length;
    if(fn || hasFilter || groupsRe) {
      context = context || currentTarget;
      for(i = 0, j = 0, t = [];i < len;++i) {
        observer = observers[i];
        observerContext = observer.context || currentTarget;
        if(context !== observerContext || fn && fn !== observer.fn || hasFilter && (filter && filter !== observer.filter || !filter && !observer.filter) || groupsRe && !observer.groups.match(groupsRe)) {
          t[j++] = observer
        }else {
          if(observer.filter && self.delegateCount) {
            self.delegateCount--
          }
          if(observer.last && self.lastCount) {
            self.lastCount--
          }
          if(s.remove) {
            s.remove.call(currentTarget, observer)
          }
        }
      }
      self.observers = t
    }else {
      self.reset()
    }
    self.checkMemory()
  }, checkMemory:function() {
    var self = this, type = self.type, domEventObservables, handle, s = Special[type] || {}, currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
    if(eventDesc) {
      domEventObservables = eventDesc.observables;
      if(!self.hasObserver()) {
        handle = eventDesc.handle;
        if(!s.tearDown || s.tearDown.call(currentTarget, type) === false) {
          DomEventUtils.simpleRemove(currentTarget, type, handle)
        }
        delete domEventObservables[type]
      }
      if(S.isEmptyObject(domEventObservables)) {
        eventDesc.handle = null;
        DomEventUtils.removeData(currentTarget)
      }
    }
  }});
  DomEventObservable.triggeredEvent = "";
  DomEventObservable.getDomEventObservable = function(node, type) {
    var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
    if(domEventObservablesHolder) {
      domEventObservables = domEventObservablesHolder.observables
    }
    if(domEventObservables) {
      return domEventObservables[type]
    }
    return null
  };
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
    var domEventObservables = DomEventUtils.data(node);
    if(!domEventObservables && create) {
      DomEventUtils.data(node, domEventObservables = {})
    }
    return domEventObservables
  };
  return DomEventObservable
});
KISSY.add("event/dom/base/dom-event", ["event/base", "./utils", "dom", "./special", "./observable", "./object"], function(S, require) {
  var BaseEvent = require("event/base");
  var DomEventUtils = require("./utils");
  var Dom = require("dom");
  var Special = require("./special");
  var DomEventObservable = require("./observable");
  var DomEventObject = require("./object");
  var BaseUtils = BaseEvent.Utils;
  function fixType(cfg, type) {
    var s = Special[type] || {}, typeFix;
    if(!cfg.originalType && (typeFix = s.typeFix)) {
      cfg.originalType = type;
      type = typeFix
    }
    return type
  }
  function addInternal(currentTarget, type, cfg) {
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    cfg = S.merge(cfg);
    type = fixType(cfg, type);
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    if(!(handle = domEventObservablesHolder.handle)) {
      handle = domEventObservablesHolder.handle = function(event) {
        var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
        if(DomEventObservable.triggeredEvent === type || typeof KISSY === "undefined") {
          return undefined
        }
        domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
        if(domEventObservable) {
          event.currentTarget = currentTarget;
          event = new DomEventObject(event);
          return domEventObservable.notify(event)
        }
        return undefined
      };
      handle.currentTarget = currentTarget
    }
    if(!(domEventObservables = domEventObservablesHolder.observables)) {
      domEventObservables = domEventObservablesHolder.observables = {}
    }
    domEventObservable = domEventObservables[type];
    if(!domEventObservable) {
      domEventObservable = domEventObservables[type] = new DomEventObservable({type:type, currentTarget:currentTarget});
      domEventObservable.setup()
    }
    domEventObservable.on(cfg);
    currentTarget = null
  }
  function removeInternal(currentTarget, type, cfg) {
    cfg = S.merge(cfg);
    var customEvent;
    type = fixType(cfg, type);
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (domEventObservablesHolder || {}).observables;
    if(!domEventObservablesHolder || !domEventObservables) {
      return
    }
    if(!type) {
      for(type in domEventObservables) {
        domEventObservables[type].detach(cfg)
      }
      return
    }
    customEvent = domEventObservables[type];
    if(customEvent) {
      customEvent.detach(cfg)
    }
  }
  var DomEvent = {on:function(targets, type, fn, context) {
    targets = Dom.query(targets);
    BaseUtils.batchForType(function(targets, type, fn, context) {
      var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
      type = cfg.type;
      for(i = targets.length - 1;i >= 0;i--) {
        t = targets[i];
        addInternal(t, type, cfg)
      }
    }, 1, targets, type, fn, context);
    return targets
  }, detach:function(targets, type, fn, context) {
    targets = Dom.query(targets);
    BaseUtils.batchForType(function(targets, singleType, fn, context) {
      var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
      singleType = cfg.type;
      for(i = targets.length - 1;i >= 0;i--) {
        t = targets[i];
        removeInternal(t, singleType, cfg);
        if(cfg.deep && t.getElementsByTagName) {
          elChildren = t.getElementsByTagName("*");
          for(j = elChildren.length - 1;j >= 0;j--) {
            removeInternal(elChildren[j], singleType, cfg)
          }
        }
      }
    }, 1, targets, type, fn, context);
    return targets
  }, delegate:function(targets, eventType, filter, fn, context) {
    return DomEvent.on(targets, eventType, {fn:fn, context:context, filter:filter})
  }, undelegate:function(targets, eventType, filter, fn, context) {
    return DomEvent.detach(targets, eventType, {fn:fn, context:context, filter:filter})
  }, fire:function(targets, eventType, eventData, onlyHandlers) {
    var ret;
    eventData = eventData || {};
    eventData.synthetic = 1;
    BaseUtils.splitAndRun(eventType, function(eventType) {
      var r, i, target, domEventObservable;
      BaseUtils.fillGroupsForEvent(eventType, eventData);
      eventType = eventData.type;
      var s = Special[eventType];
      var originalType = eventType;
      if(s && s.typeFix) {
        originalType = s.typeFix
      }
      targets = Dom.query(targets);
      for(i = targets.length - 1;i >= 0;i--) {
        target = targets[i];
        domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
        if(!onlyHandlers && !domEventObservable) {
          domEventObservable = new DomEventObservable({type:originalType, currentTarget:target})
        }
        if(domEventObservable) {
          r = domEventObservable.fire(eventData, onlyHandlers);
          if(ret !== false && r !== undefined) {
            ret = r
          }
        }
      }
    });
    return ret
  }, fireHandler:function(targets, eventType, eventData) {
    return DomEvent.fire(targets, eventType, eventData, 1)
  }, clone:function(src, dest) {
    var domEventObservablesHolder, domEventObservables;
    if(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))) {
      return
    }
    var srcData = DomEventUtils.data(src);
    if(srcData && srcData === DomEventUtils.data(dest)) {
      DomEventUtils.removeData(dest)
    }
    domEventObservables = domEventObservablesHolder.observables;
    S.each(domEventObservables, function(customEvent, type) {
      S.each(customEvent.observers, function(observer) {
        addInternal(dest, type, observer)
      })
    })
  }};
  return DomEvent
});
KISSY.add("event/dom/base/key-codes", [], function(S) {
  var UA = S.UA, KeyCode = {MAC_ENTER:3, BACKSPACE:8, TAB:9, NUM_CENTER:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, PAUSE:19, CAPS_LOCK:20, ESC:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, PRINT_SCREEN:44, INSERT:45, DELETE:46, ZERO:48, ONE:49, TWO:50, THREE:51, FOUR:52, FIVE:53, SIX:54, SEVEN:55, EIGHT:56, NINE:57, QUESTION_MARK:63, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, 
  V:86, W:87, X:88, Y:89, Z:90, META:91, WIN_KEY_RIGHT:92, CONTEXT_MENU:93, NUM_ZERO:96, NUM_ONE:97, NUM_TWO:98, NUM_THREE:99, NUM_FOUR:100, NUM_FIVE:101, NUM_SIX:102, NUM_SEVEN:103, NUM_EIGHT:104, NUM_NINE:105, NUM_MULTIPLY:106, NUM_PLUS:107, NUM_MINUS:109, NUM_PERIOD:110, NUM_DIVISION:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, NUMLOCK:144, SEMICOLON:186, DASH:189, EQUALS:187, COMMA:188, PERIOD:190, SLASH:191, APOSTROPHE:192, SINGLE_QUOTE:222, 
  OPEN_SQUARE_BRACKET:219, BACKSLASH:220, CLOSE_SQUARE_BRACKET:221, WIN_KEY:224, MAC_FF_META:224, WIN_IME:229};
  KeyCode.isTextModifyingKeyEvent = function(e) {
    var keyCode = e.keyCode;
    if(e.altKey && !e.ctrlKey || e.metaKey || keyCode >= KeyCode.F1 && keyCode <= KeyCode.F12) {
      return false
    }
    switch(keyCode) {
      case KeyCode.ALT:
      ;
      case KeyCode.CAPS_LOCK:
      ;
      case KeyCode.CONTEXT_MENU:
      ;
      case KeyCode.CTRL:
      ;
      case KeyCode.DOWN:
      ;
      case KeyCode.END:
      ;
      case KeyCode.ESC:
      ;
      case KeyCode.HOME:
      ;
      case KeyCode.INSERT:
      ;
      case KeyCode.LEFT:
      ;
      case KeyCode.MAC_FF_META:
      ;
      case KeyCode.META:
      ;
      case KeyCode.NUMLOCK:
      ;
      case KeyCode.NUM_CENTER:
      ;
      case KeyCode.PAGE_DOWN:
      ;
      case KeyCode.PAGE_UP:
      ;
      case KeyCode.PAUSE:
      ;
      case KeyCode.PRINT_SCREEN:
      ;
      case KeyCode.RIGHT:
      ;
      case KeyCode.SHIFT:
      ;
      case KeyCode.UP:
      ;
      case KeyCode.WIN_KEY:
      ;
      case KeyCode.WIN_KEY_RIGHT:
        return false;
      default:
        return true
    }
  };
  KeyCode.isCharacterKey = function(keyCode) {
    if(keyCode >= KeyCode.ZERO && keyCode <= KeyCode.NINE) {
      return true
    }
    if(keyCode >= KeyCode.NUM_ZERO && keyCode <= KeyCode.NUM_MULTIPLY) {
      return true
    }
    if(keyCode >= KeyCode.A && keyCode <= KeyCode.Z) {
      return true
    }
    if(UA.webkit && keyCode === 0) {
      return true
    }
    switch(keyCode) {
      case KeyCode.SPACE:
      ;
      case KeyCode.QUESTION_MARK:
      ;
      case KeyCode.NUM_PLUS:
      ;
      case KeyCode.NUM_MINUS:
      ;
      case KeyCode.NUM_PERIOD:
      ;
      case KeyCode.NUM_DIVISION:
      ;
      case KeyCode.SEMICOLON:
      ;
      case KeyCode.DASH:
      ;
      case KeyCode.EQUALS:
      ;
      case KeyCode.COMMA:
      ;
      case KeyCode.PERIOD:
      ;
      case KeyCode.SLASH:
      ;
      case KeyCode.APOSTROPHE:
      ;
      case KeyCode.SINGLE_QUOTE:
      ;
      case KeyCode.OPEN_SQUARE_BRACKET:
      ;
      case KeyCode.BACKSLASH:
      ;
      case KeyCode.CLOSE_SQUARE_BRACKET:
        return true;
      default:
        return false
    }
  };
  return KeyCode
});
KISSY.add("event/dom/base/gesture", [], function() {
  return{start:"mousedown", move:"mousemove", end:"mouseup", tap:"click", singleTap:"click", doubleTap:"dblclick"}
});
KISSY.add("event/dom/base/special-events", ["./dom-event", "./special"], function(S, require) {
  var DomEvent = require("./dom-event");
  var Special = require("./special");
  var UA = S.UA, MOUSE_WHEEL = UA.gecko ? "DOMMouseScroll" : "mousewheel";
  return S.mix(Special, {mousewheel:{typeFix:MOUSE_WHEEL}, load:{bubbles:false}, click:{fire:function(onlyHandlers) {
    var target = this;
    if(!onlyHandlers && String(target.type) === "checkbox" && target.click && target.nodeName.toLowerCase() === "input") {
      target.click();
      return false
    }
    return undefined
  }}, focus:{bubbles:false, preFire:function(event, onlyHandlers) {
    if(!onlyHandlers) {
      return DomEvent.fire(this, "focusin")
    }
  }, fire:function(onlyHandlers) {
    var target = this;
    if(!onlyHandlers && target.ownerDocument) {
      if(target !== target.ownerDocument.activeElement && target.focus) {
        target.focus();
        return false
      }
    }
    return undefined
  }}, blur:{bubbles:false, preFire:function(event, onlyHandlers) {
    if(!onlyHandlers) {
      return DomEvent.fire(this, "focusout")
    }
  }, fire:function(onlyHandlers) {
    var target = this;
    if(!onlyHandlers && target.ownerDocument) {
      if(target === target.ownerDocument.activeElement && target.blur) {
        target.blur();
        return false
      }
    }
    return undefined
  }}})
});
KISSY.add("event/dom/base/mouseenter", ["dom", "./special"], function(S, require) {
  var Dom = require("dom");
  var Special = require("./special");
  S.each([{name:"mouseenter", fix:"mouseover"}, {name:"mouseleave", fix:"mouseout"}], function(o) {
    Special[o.name] = {typeFix:o.fix, handle:function(event, observer, ce) {
      var currentTarget = event.currentTarget, relatedTarget = event.relatedTarget;
      if(!relatedTarget || relatedTarget !== currentTarget && !Dom.contains(currentTarget, relatedTarget)) {
        return[observer.simpleNotify(event, ce)]
      }
    }}
  })
});
KISSY.add("event/dom/base/valuechange", ["dom", "./dom-event", "./special"], function(S, require) {
  var Dom = require("dom");
  var DomEvent = require("./dom-event");
  var Special = require("./special");
  var VALUE_CHANGE = "valuechange", getNodeName = Dom.nodeName, KEY = "event/valuechange", HISTORY_KEY = KEY + "/history", POLL_KEY = KEY + "/poll", interval = 50;
  function clearPollTimer(target) {
    if(Dom.hasData(target, POLL_KEY)) {
      var poll = Dom.data(target, POLL_KEY);
      clearTimeout(poll);
      Dom.removeData(target, POLL_KEY)
    }
  }
  function stopPoll(target) {
    Dom.removeData(target, HISTORY_KEY);
    clearPollTimer(target)
  }
  function stopPollHandler(ev) {
    clearPollTimer(ev.target)
  }
  function checkChange(target) {
    var v = target.value, h = Dom.data(target, HISTORY_KEY);
    if(v !== h) {
      DomEvent.fireHandler(target, VALUE_CHANGE, {prevVal:h, newVal:v});
      Dom.data(target, HISTORY_KEY, v)
    }
  }
  function startPoll(target) {
    if(Dom.hasData(target, POLL_KEY)) {
      return
    }
    Dom.data(target, POLL_KEY, setTimeout(function check() {
      checkChange(target);
      Dom.data(target, POLL_KEY, setTimeout(check, interval))
    }, interval))
  }
  function startPollHandler(ev) {
    var target = ev.target;
    if(ev.type === "focus") {
      Dom.data(target, HISTORY_KEY, target.value)
    }
    startPoll(target)
  }
  function webkitSpeechChangeHandler(e) {
    checkChange(e.target)
  }
  function monitor(target) {
    unmonitored(target);
    DomEvent.on(target, "blur", stopPollHandler);
    DomEvent.on(target, "webkitspeechchange", webkitSpeechChangeHandler);
    DomEvent.on(target, "mousedown keyup keydown focus", startPollHandler)
  }
  function unmonitored(target) {
    stopPoll(target);
    DomEvent.detach(target, "blur", stopPollHandler);
    DomEvent.detach(target, "webkitspeechchange", webkitSpeechChangeHandler);
    DomEvent.detach(target, "mousedown keyup keydown focus", startPollHandler)
  }
  Special[VALUE_CHANGE] = {setup:function() {
    var target = this, nodeName = getNodeName(target);
    if(nodeName === "input" || nodeName === "textarea") {
      monitor(target)
    }
  }, tearDown:function() {
    var target = this;
    unmonitored(target)
  }};
  return DomEvent
});
KISSY.add("event/dom/base", ["./base/dom-event", "./base/object", "./base/key-codes", "./base/gesture", "./base/special-events", "./base/mouseenter", "./base/valuechange"], function(S, require) {
  var DomEvent = require("./base/dom-event");
  var DomEventObject = require("./base/object");
  var KeyCode = require("./base/key-codes");
  var Gesture = require("./base/gesture");
  var Special = require("./base/special-events");
  require("./base/mouseenter");
  require("./base/valuechange");
  return S.merge({add:DomEvent.on, remove:DomEvent.detach, KeyCode:KeyCode, Gesture:Gesture, Special:Special, Object:DomEventObject}, DomEvent)
});

