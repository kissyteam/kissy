/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:29
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 node/base
 node/attach
 node/override
 node/anim
 node
*/

KISSY.add("node/base", ["dom", "event/dom"], function(S, require) {
  var Dom = require("dom");
  var Event = require("event/dom");
  var AP = Array.prototype, slice = AP.slice, NodeType = Dom.NodeType, push = AP.push, makeArray = S.makeArray, isNodeList = Dom.isDomNodeList;
  function NodeList(html, props, ownerDocument) {
    var self = this, domNode;
    if(!(self instanceof NodeList)) {
      return new NodeList(html, props, ownerDocument)
    }
    if(!html) {
      return self
    }else {
      if(typeof html === "string") {
        domNode = Dom.create(html, props, ownerDocument);
        if(domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
          push.apply(this, makeArray(domNode.childNodes));
          return self
        }
      }else {
        if(S.isArray(html) || isNodeList(html)) {
          push.apply(self, makeArray(html));
          return self
        }else {
          domNode = html
        }
      }
    }
    self[0] = domNode;
    self.length = 1;
    return self
  }
  NodeList.prototype = {constructor:NodeList, isNodeList:true, length:0, item:function(index) {
    var self = this;
    if(typeof index === "number") {
      if(index >= self.length) {
        return null
      }else {
        return new NodeList(self[index])
      }
    }else {
      return new NodeList(index)
    }
  }, add:function(selector, context, index) {
    if(typeof context === "number") {
      index = context;
      context = undefined
    }
    var list = NodeList.all(selector, context).getDOMNodes(), ret = new NodeList(this);
    if(index === undefined) {
      push.apply(ret, list)
    }else {
      var args = [index, 0];
      args.push.apply(args, list);
      AP.splice.apply(ret, args)
    }
    return ret
  }, slice:function() {
    return new NodeList(slice.apply(this, arguments))
  }, getDOMNodes:function() {
    return slice.call(this)
  }, each:function(fn, context) {
    var self = this;
    S.each(self, function(n, i) {
      n = new NodeList(n);
      return fn.call(context || n, n, i, self)
    });
    return self
  }, getDOMNode:function() {
    return this[0]
  }, end:function() {
    var self = this;
    return self.__parent || self
  }, filter:function(filter) {
    return new NodeList(Dom.filter(this, filter))
  }, all:function(selector) {
    var ret, self = this;
    if(self.length > 0) {
      ret = NodeList.all(selector, self)
    }else {
      ret = new NodeList
    }
    ret.__parent = self;
    return ret
  }, one:function(selector) {
    var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
    if(ret) {
      ret.__parent = self
    }
    return ret
  }};
  S.mix(NodeList, {all:function(selector, context) {
    if(typeof selector === "string" && (selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, "<") && S.endsWith(selector, ">")) {
      if(context) {
        if(context.getDOMNode) {
          context = context[0]
        }
        context = context.ownerDocument || context
      }
      return new NodeList(selector, undefined, context)
    }
    return new NodeList(Dom.query(selector, context))
  }, one:function(selector, context) {
    var all = NodeList.all(selector, context);
    return all.length ? all.slice(0, 1) : null
  }});
  NodeList.NodeType = NodeType;
  NodeList.KeyCode = Event.KeyCode;
  NodeList.Gesture = Event.Gesture;
  NodeList.REPLACE_HISTORY = Event.REPLACE_HISTORY;
  return NodeList
});
KISSY.add("node/attach", ["dom", "event/dom", "./base"], function(S, require) {
  var Dom = require("dom");
  var Event = require("event/dom");
  var NodeList = require("./base");
  var NLP = NodeList.prototype, makeArray = S.makeArray, DOM_INCLUDES_NORM = ["nodeName", "isCustomDomain", "getEmptyIframeSrc", "equals", "contains", "index", "scrollTop", "scrollLeft", "height", "width", "innerHeight", "innerWidth", "outerHeight", "outerWidth", "addStyleSheet", "appendTo", "prependTo", "insertBefore", "before", "after", "insertAfter", "test", "hasClass", "addClass", "removeClass", "replaceClass", "toggleClass", "removeAttr", "hasAttr", "hasProp", "scrollIntoView", "remove", "empty", 
  "removeData", "hasData", "unselectable", "wrap", "wrapAll", "replaceWith", "wrapInner", "unwrap"], DOM_INCLUDES_NORM_NODE_LIST = ["getWindow", "getDocument", "filter", "first", "last", "parent", "closest", "next", "prev", "clone", "siblings", "contents", "children"], DOM_INCLUDES_NORM_IF = {attr:1, text:0, css:1, style:1, val:0, prop:1, offset:0, html:0, outerHTML:0, outerHtml:0, data:1}, EVENT_INCLUDES_SELF = ["on", "detach", "delegate", "undelegate"], EVENT_INCLUDES_RET = ["fire", "fireHandler"];
  NodeList.KeyCode = Event.KeyCode;
  function accessNorm(fn, self, args) {
    args.unshift(self);
    var ret = Dom[fn].apply(Dom, args);
    if(ret === undefined) {
      return self
    }
    return ret
  }
  function accessNormList(fn, self, args) {
    args.unshift(self);
    var ret = Dom[fn].apply(Dom, args);
    if(ret === undefined) {
      return self
    }else {
      if(ret === null) {
        return null
      }
    }
    return new NodeList(ret)
  }
  function accessNormIf(fn, self, index, args) {
    if(args[index] === undefined && !S.isObject(args[0])) {
      args.unshift(self);
      return Dom[fn].apply(Dom, args)
    }
    return accessNorm(fn, self, args)
  }
  S.each(DOM_INCLUDES_NORM, function(k) {
    NLP[k] = function() {
      var args = makeArray(arguments);
      return accessNorm(k, this, args)
    }
  });
  S.each(DOM_INCLUDES_NORM_NODE_LIST, function(k) {
    NLP[k] = function() {
      var args = makeArray(arguments);
      return accessNormList(k, this, args)
    }
  });
  S.each(DOM_INCLUDES_NORM_IF, function(index, k) {
    NLP[k] = function() {
      var args = makeArray(arguments);
      return accessNormIf(k, this, index, args)
    }
  });
  S.each(EVENT_INCLUDES_SELF, function(k) {
    NLP[k] = function() {
      var self = this, args = makeArray(arguments);
      args.unshift(self);
      Event[k].apply(Event, args);
      return self
    }
  });
  S.each(EVENT_INCLUDES_RET, function(k) {
    NLP[k] = function() {
      var self = this, args = makeArray(arguments);
      args.unshift(self);
      return Event[k].apply(Event, args)
    }
  })
});
KISSY.add("node/override", ["dom", "./base", "./attach"], function(S, require) {
  var Dom = require("dom");
  var NodeList = require("./base");
  require("./attach");
  var NLP = NodeList.prototype;
  S.each(["append", "prepend", "before", "after"], function(insertType) {
    NLP[insertType] = function(html) {
      var newNode = html, self = this;
      if(typeof newNode !== "object") {
        newNode = Dom.create(newNode + "")
      }
      if(newNode) {
        Dom[insertType](newNode, self)
      }
      return self
    }
  });
  S.each(["wrap", "wrapAll", "replaceWith", "wrapInner"], function(fixType) {
    var orig = NLP[fixType];
    NLP[fixType] = function(others) {
      var self = this;
      if(typeof others === "string") {
        others = NodeList.all(others, self[0].ownerDocument)
      }
      return orig.call(self, others)
    }
  })
});
KISSY.add("node/anim", ["./base", "dom", "anim"], function(S, require) {
  var Node = require("./base");
  var Dom = require("dom");
  var Anim = require("anim");
  var FX = [["height", "margin-top", "margin-bottom", "padding-top", "padding-bottom"], ["width", "margin-left", "margin-right", "padding-left", "padding-right"], ["opacity"]];
  function getFxs(type, num, from) {
    var ret = [], obj = {};
    for(var i = from || 0;i < num;i++) {
      ret.push.apply(ret, FX[i])
    }
    for(i = 0;i < ret.length;i++) {
      obj[ret[i]] = type
    }
    return obj
  }
  S.augment(Node, {animate:function() {
    var self = this, originArgs = S.makeArray(arguments);
    S.each(self, function(elem) {
      var args = S.clone(originArgs), arg0 = args[0];
      if(arg0.to) {
        arg0.node = elem;
        (new Anim(arg0)).run()
      }else {
        Anim.apply(undefined, [elem].concat(args)).run()
      }
    });
    return self
  }, stop:function(end, clearQueue, queue) {
    var self = this;
    S.each(self, function(elem) {
      Anim.stop(elem, end, clearQueue, queue)
    });
    return self
  }, pause:function(end, queue) {
    var self = this;
    S.each(self, function(elem) {
      Anim.pause(elem, queue)
    });
    return self
  }, resume:function(end, queue) {
    var self = this;
    S.each(self, function(elem) {
      Anim.resume(elem, queue)
    });
    return self
  }, isRunning:function() {
    var self = this;
    for(var i = 0;i < self.length;i++) {
      if(Anim.isRunning(self[i])) {
        return true
      }
    }
    return false
  }, isPaused:function() {
    var self = this;
    for(var i = 0;i < self.length;i++) {
      if(Anim.isPaused(self[i])) {
        return true
      }
    }
    return false
  }});
  S.each({show:getFxs("show", 3), hide:getFxs("hide", 3), toggle:getFxs("toggle", 3), fadeIn:getFxs("show", 3, 2), fadeOut:getFxs("hide", 3, 2), fadeToggle:getFxs("toggle", 3, 2), slideDown:getFxs("show", 1), slideUp:getFxs("hide", 1), slideToggle:getFxs("toggle", 1)}, function(v, k) {
    Node.prototype[k] = function(duration, complete, easing) {
      var self = this;
      if(Dom[k] && !duration) {
        Dom[k](self)
      }else {
        S.each(self, function(elem) {
          (new Anim(elem, v, duration, easing, complete)).run()
        })
      }
      return self
    }
  })
});
KISSY.add("node", ["node/base", "node/attach", "node/override", "node/anim"], function(S, require) {
  var Node = require("node/base");
  require("node/attach");
  require("node/override");
  require("node/anim");
  S.mix(S, {Node:Node, NodeList:Node, one:Node.one, all:Node.all});
  return Node
});

