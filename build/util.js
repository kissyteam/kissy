/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 util/array
 util/escape
 util/function
 util/object
 util/string
 util/type
 util/web
 util
*/

KISSY.add("util/array", [], function(S, undefined) {
  var TRUE = true, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
  S.mix(S, {indexOf:indexOf ? function(item, arr, fromIndex) {
    return fromIndex === undefined ? indexOf.call(arr, item) : indexOf.call(arr, item, fromIndex)
  } : function(item, arr, fromIndex) {
    for(var i = fromIndex || 0, len = arr.length;i < len;++i) {
      if(arr[i] === item) {
        return i
      }
    }
    return-1
  }, lastIndexOf:lastIndexOf ? function(item, arr, fromIndex) {
    return fromIndex === undefined ? lastIndexOf.call(arr, item) : lastIndexOf.call(arr, item, fromIndex)
  } : function(item, arr, fromIndex) {
    if(fromIndex === undefined) {
      fromIndex = arr.length - 1
    }
    for(var i = fromIndex;i >= 0;i--) {
      if(arr[i] === item) {
        break
      }
    }
    return i
  }, unique:function(a, override) {
    var b = a.slice();
    if(override) {
      b.reverse()
    }
    var i = 0, n, item;
    while(i < b.length) {
      item = b[i];
      while((n = S.lastIndexOf(item, b)) !== i) {
        b.splice(n, 1)
      }
      i += 1
    }
    if(override) {
      b.reverse()
    }
    return b
  }, inArray:function(item, arr) {
    return S.indexOf(item, arr) > -1
  }, filter:filter ? function(arr, fn, context) {
    return filter.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var ret = [];
    S.each(arr, function(item, i, arr) {
      if(fn.call(context || this, item, i, arr)) {
        ret.push(item)
      }
    });
    return ret
  }, map:map ? function(arr, fn, context) {
    return map.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var len = arr.length, res = new Array(len);
    for(var i = 0;i < len;i++) {
      var el = typeof arr === "string" ? arr.charAt(i) : arr[i];
      if(el || i in arr) {
        res[i] = fn.call(context || this, el, i, arr)
      }
    }
    return res
  }, reduce:function(arr, callback, initialValue) {
    var len = arr.length;
    if(typeof callback !== "function") {
      throw new TypeError("callback is not function!");
    }
    if(len === 0 && arguments.length === 2) {
      throw new TypeError("arguments invalid");
    }
    var k = 0;
    var accumulator;
    if(arguments.length >= 3) {
      accumulator = initialValue
    }else {
      do {
        if(k in arr) {
          accumulator = arr[k++];
          break
        }
        k += 1;
        if(k >= len) {
          throw new TypeError;
        }
      }while(TRUE)
    }
    while(k < len) {
      if(k in arr) {
        accumulator = callback.call(undefined, accumulator, arr[k], k, arr)
      }
      k++
    }
    return accumulator
  }, every:every ? function(arr, fn, context) {
    return every.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var len = arr && arr.length || 0;
    for(var i = 0;i < len;i++) {
      if(i in arr && !fn.call(context, arr[i], i, arr)) {
        return FALSE
      }
    }
    return TRUE
  }, some:some ? function(arr, fn, context) {
    return some.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var len = arr && arr.length || 0;
    for(var i = 0;i < len;i++) {
      if(i in arr && fn.call(context, arr[i], i, arr)) {
        return TRUE
      }
    }
    return FALSE
  }, makeArray:function(o) {
    if(o == null) {
      return[]
    }
    if(S.isArray(o)) {
      return o
    }
    var lengthType = typeof o.length, oType = typeof o;
    if(lengthType !== "number" || typeof o.nodeName === "string" || o != null && o == o.window || oType === "string" || oType === "function" && !("item" in o && lengthType === "number")) {
      return[o]
    }
    var ret = [];
    for(var i = 0, l = o.length;i < l;i++) {
      ret[i] = o[i]
    }
    return ret
  }})
});
KISSY.add("util/escape", [], function(S) {
  var EMPTY = "", htmlEntities = {"&amp;":"&", "&gt;":">", "&lt;":"<", "&#x60;":"`", "&#x2F;":"/", "&quot;":'"', "&#x27;":"'"}, reverseEntities = {}, escapeHtmlReg, unEscapeHtmlReg, possibleEscapeHtmlReg = /[&<>"'`]/, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  (function() {
    for(var k in htmlEntities) {
      reverseEntities[htmlEntities[k]] = k
    }
  })();
  escapeHtmlReg = getEscapeReg();
  unEscapeHtmlReg = getUnEscapeReg();
  function getEscapeReg() {
    var str = EMPTY;
    S.each(htmlEntities, function(entity) {
      str += entity + "|"
    });
    str = str.slice(0, -1);
    escapeHtmlReg = new RegExp(str, "g");
    return escapeHtmlReg
  }
  function getUnEscapeReg() {
    var str = EMPTY;
    S.each(reverseEntities, function(entity) {
      str += entity + "|"
    });
    str += "&#(\\d{1,5});";
    unEscapeHtmlReg = new RegExp(str, "g");
    return unEscapeHtmlReg
  }
  S.mix(S, {escapeHtml:function(str) {
    if(!str && str !== 0) {
      return""
    }
    str = "" + str;
    if(!possibleEscapeHtmlReg.test(str)) {
      return str
    }
    return(str + "").replace(escapeHtmlReg, function(m) {
      return reverseEntities[m]
    })
  }, escapeRegExp:function(str) {
    return str.replace(escapeRegExp, "\\$&")
  }, unEscapeHtml:function(str) {
    return str.replace(unEscapeHtmlReg, function(m, n) {
      return htmlEntities[m] || String.fromCharCode(+n)
    })
  }});
  S.escapeHTML = S.escapeHtml;
  S.unEscapeHTML = S.unEscapeHtml
});
KISSY.add("util/function", [], function(S, undefined) {
  function bindFn(r, fn, obj) {
    function FNOP() {
    }
    var slice = [].slice, args = slice.call(arguments, 3), bound = function() {
      var inArgs = slice.call(arguments);
      return fn.apply(this instanceof FNOP ? this : obj || this, r ? inArgs.concat(args) : args.concat(inArgs))
    };
    FNOP.prototype = fn.prototype;
    bound.prototype = new FNOP;
    return bound
  }
  S.mix(S, {noop:function() {
  }, bind:bindFn(0, bindFn, null, 0), rbind:bindFn(0, bindFn, null, 1), later:function(fn, when, periodic, context, data) {
    when = when || 0;
    var m = fn, d = S.makeArray(data), f, r;
    if(typeof fn === "string") {
      m = context[fn]
    }
    if(!m) {
      S.error("method undefined")
    }
    f = function() {
      m.apply(context, d)
    };
    r = periodic ? setInterval(f, when) : setTimeout(f, when);
    return{id:r, interval:periodic, cancel:function() {
      if(this.interval) {
        clearInterval(r)
      }else {
        clearTimeout(r)
      }
    }}
  }, throttle:function(fn, ms, context) {
    ms = ms || 150;
    if(ms === -1) {
      return function() {
        fn.apply(context || this, arguments)
      }
    }
    var last = S.now();
    return function() {
      var now = S.now();
      if(now - last > ms) {
        last = now;
        fn.apply(context || this, arguments)
      }
    }
  }, buffer:function(fn, ms, context) {
    ms = ms || 150;
    if(ms === -1) {
      return function() {
        fn.apply(context || this, arguments)
      }
    }
    var bufferTimer = null;
    function f() {
      f.stop();
      bufferTimer = S.later(fn, ms, 0, context || this, arguments)
    }
    f.stop = function() {
      if(bufferTimer) {
        bufferTimer.cancel();
        bufferTimer = 0
      }
    };
    return f
  }})
});
KISSY.add("util/object", [], function(S, undefined) {
  var logger = S.getLogger("s/util");
  var MIX_CIRCULAR_DETECTION = "__MIX_CIRCULAR", STAMP_MARKER = "__~ks_stamped", host = S.Env.host, TRUE = true, EMPTY = "", Obj = Object, objectCreate = Obj.create;
  mix(S, {stamp:function(o, readOnly, marker) {
    marker = marker || STAMP_MARKER;
    var guid = o[marker];
    if(guid) {
      return guid
    }else {
      if(!readOnly) {
        try {
          guid = o[marker] = S.guid(marker)
        }catch(e) {
          guid = undefined
        }
      }
    }
    return guid
  }, mix:function(r, s, ov, wl, deep) {
    if(typeof ov === "object") {
      wl = ov.whitelist;
      deep = ov.deep;
      ov = ov.overwrite
    }
    if(wl && typeof wl !== "function") {
      var originalWl = wl;
      wl = function(name, val) {
        return S.inArray(name, originalWl) ? val : undefined
      }
    }
    if(ov === undefined) {
      ov = TRUE
    }
    var cache = [], c, i = 0;
    mixInternal(r, s, ov, wl, deep, cache);
    while(c = cache[i++]) {
      delete c[MIX_CIRCULAR_DETECTION]
    }
    return r
  }, merge:function(varArgs) {
    varArgs = S.makeArray(arguments);
    var o = {}, i, l = varArgs.length;
    for(i = 0;i < l;i++) {
      S.mix(o, varArgs[i])
    }
    return o
  }, augment:function(r, varArgs) {
    var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
    args[1] = varArgs;
    if(!S.isArray(wl)) {
      ov = wl;
      wl = undefined;
      len++
    }
    if(typeof ov !== "boolean") {
      ov = undefined;
      len++
    }
    for(;i < len;i++) {
      arg = args[i];
      if(proto = arg.prototype) {
        arg = S.mix({}, proto, true, removeConstructor)
      }
      S.mix(r.prototype, arg, ov, wl)
    }
    return r
  }, extend:function(r, s, px, sx) {
    if("@DEBUG@") {
      if(!r) {
        logger.error("extend r is null")
      }
      if(!s) {
        logger.error("extend s is null")
      }
      if(!s || !r) {
        return r
      }
    }
    var sp = s.prototype, rp;
    sp.constructor = s;
    rp = createObject(sp, r);
    r.prototype = S.mix(rp, r.prototype);
    r.superclass = sp;
    if(px) {
      S.mix(rp, px)
    }
    if(sx) {
      S.mix(r, sx)
    }
    return r
  }, namespace:function() {
    var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = args[l - 1] === TRUE && l--;
    for(i = 0;i < l;i++) {
      p = (EMPTY + args[i]).split(".");
      o = global ? host : this;
      for(j = host[p[0]] === o ? 1 : 0;j < p.length;++j) {
        o = o[p[j]] = o[p[j]] || {}
      }
    }
    return o
  }});
  function Empty() {
  }
  function createObject(proto, constructor) {
    var newProto;
    if(objectCreate) {
      newProto = objectCreate(proto)
    }else {
      Empty.prototype = proto;
      newProto = new Empty
    }
    newProto.constructor = constructor;
    return newProto
  }
  function mix(r, s) {
    for(var i in s) {
      r[i] = s[i]
    }
  }
  function mixInternal(r, s, ov, wl, deep, cache) {
    if(!s || !r) {
      return r
    }
    var i, p, keys, len;
    s[MIX_CIRCULAR_DETECTION] = r;
    cache.push(s);
    keys = S.keys(s);
    len = keys.length;
    for(i = 0;i < len;i++) {
      p = keys[i];
      if(p !== MIX_CIRCULAR_DETECTION) {
        _mix(p, r, s, ov, wl, deep, cache)
      }
    }
    return r
  }
  function removeConstructor(k, v) {
    return k === "constructor" ? undefined : v
  }
  function _mix(p, r, s, ov, wl, deep, cache) {
    if(ov || !(p in r) || deep) {
      var target = r[p], src = s[p];
      if(target === src) {
        if(target === undefined) {
          r[p] = target
        }
        return
      }
      if(wl) {
        src = wl.call(s, p, src)
      }
      if(deep && src && (S.isArray(src) || S.isPlainObject(src))) {
        if(src[MIX_CIRCULAR_DETECTION]) {
          r[p] = src[MIX_CIRCULAR_DETECTION]
        }else {
          var clone = target && (S.isArray(target) || S.isPlainObject(target)) ? target : S.isArray(src) ? [] : {};
          r[p] = clone;
          mixInternal(clone, src, ov, wl, TRUE, cache)
        }
      }else {
        if(src !== undefined && (ov || !(p in r))) {
          r[p] = src
        }
      }
    }
  }
});
KISSY.add("util/string", [], function(S, undefined) {
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = "";
  var RE_DASH = /-([a-z])/ig;
  function upperCase() {
    return arguments[1].toUpperCase()
  }
  S.mix(S, {camelCase:function(name) {
    return name.replace(RE_DASH, upperCase)
  }, substitute:function(str, o, regexp) {
    if(typeof str !== "string" || !o) {
      return str
    }
    return str.replace(regexp || SUBSTITUTE_REG, function(match, name) {
      if(match.charAt(0) === "\\") {
        return match.slice(1)
      }
      return o[name] === undefined ? EMPTY : o[name]
    })
  }, ucfirst:function(s) {
    s += "";
    return s.charAt(0).toUpperCase() + s.substring(1)
  }})
});
KISSY.add("util/type", [], function(S, undefined) {
  var class2type = {}, FALSE = false, noop = S.noop, OP = Object.prototype, toString = OP.toString;
  function hasOwnProperty(o, p) {
    return OP.hasOwnProperty.call(o, p)
  }
  S.mix(S, {type:function(o) {
    return o == null ? String(o) : class2type[toString.call(o)] || "object"
  }, isPlainObject:function(obj) {
    if(!obj || S.type(obj) !== "object" || obj.nodeType || obj.window == obj) {
      return FALSE
    }
    var key, objConstructor;
    try {
      if((objConstructor = obj.constructor) && !hasOwnProperty(obj, "constructor") && !hasOwnProperty(objConstructor.prototype, "isPrototypeOf")) {
        return FALSE
      }
    }catch(e) {
      return FALSE
    }
    for(key in obj) {
    }
    return key === undefined || hasOwnProperty(obj, key)
  }});
  if("@DEBUG@") {
    S.mix(S, {isBoolean:noop, isNumber:noop, isString:noop, isFunction:noop, isArray:noop, isDate:noop, isRegExp:noop, isObject:noop})
  }
  S.each("Boolean Number String Function Date RegExp Object Array".split(" "), function(name, lc) {
    class2type["[object " + name + "]"] = lc = name.toLowerCase();
    S["is" + name] = function(o) {
      return S.type(o) === lc
    }
  });
  S.isArray = Array.isArray || S.isArray
});
KISSY.add("util/web", [], function(S, undefined) {
  var logger = S.getLogger("s/web");
  var win = S.Env.host, doc = win.document || {}, docElem = doc.documentElement, location = win.location, EMPTY = "", domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = doc.attachEvent || standardEventModel, DOM_READY_EVENT = "DOMContentLoaded", READY_STATE_CHANGE_EVENT = "readystatechange", LOAD_EVENT = "load", COMPLETE = "complete", addEventListener = standardEventModel ? 
  function(el, type, fn) {
    el.addEventListener(type, fn, false)
  } : function(el, type, fn) {
    el.attachEvent("on" + type, fn)
  }, removeEventListener = standardEventModel ? function(el, type, fn) {
    el.removeEventListener(type, fn, false)
  } : function(el, type, fn) {
    el.detachEvent("on" + type, fn)
  };
  S.mix(S, {isWindow:function(obj) {
    return obj != null && obj == obj.window
  }, parseXML:function(data) {
    if(data.documentElement) {
      return data
    }
    var xml;
    try {
      if(win.DOMParser) {
        xml = (new DOMParser).parseFromString(data, "text/xml")
      }else {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = false;
        xml.loadXML(data)
      }
    }catch(e) {
      logger.error("parseXML error :");
      logger.error(e);
      xml = undefined
    }
    if(!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
      S.error("Invalid XML: " + data)
    }
    return xml
  }, globalEval:function(data) {
    if(data && RE_NOT_WHITESPACE.test(data)) {
      if(win.execScript) {
        win.execScript(data)
      }else {
        (function(data) {
          win["eval"].call(win, data)
        })(data)
      }
    }
  }, ready:function(fn) {
    if(domReady) {
      try {
        fn(S)
      }catch(e) {
        S.log(e.stack || e, "error");
        setTimeout(function() {
          throw e;
        }, 0)
      }
    }else {
      callbacks.push(fn)
    }
    return this
  }, available:function(id, fn) {
    id = (id + EMPTY).match(RE_ID_STR)[1];
    var retryCount = 1;
    var timer = S.later(function() {
      if(++retryCount > POLL_RETIRES) {
        timer.cancel();
        return
      }
      var node = doc.getElementById(id);
      if(node) {
        fn(node);
        timer.cancel()
      }
    }, POLL_INTERVAL, true)
  }});
  function fireReady() {
    if(domReady) {
      return
    }
    if(win && win.setTimeout) {
      removeEventListener(win, LOAD_EVENT, fireReady)
    }
    domReady = 1;
    for(var i = 0;i < callbacks.length;i++) {
      try {
        callbacks[i](S)
      }catch(e) {
        S.log(e.stack || e, "error");
        setTimeout(function() {
          throw e;
        }, 0)
      }
    }
  }
  function bindReady() {
    if(!doc || doc.readyState === COMPLETE) {
      fireReady();
      return
    }
    addEventListener(win, LOAD_EVENT, fireReady);
    if(standardEventModel) {
      var domReady = function() {
        removeEventListener(doc, DOM_READY_EVENT, domReady);
        fireReady()
      };
      addEventListener(doc, DOM_READY_EVENT, domReady)
    }else {
      var stateChange = function() {
        if(doc.readyState === COMPLETE) {
          removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
          fireReady()
        }
      };
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      var notframe, doScroll = docElem && docElem.doScroll;
      try {
        notframe = win.frameElement === null
      }catch(e) {
        notframe = false
      }
      if(doScroll && notframe) {
        var readyScroll = function() {
          try {
            doScroll("left");
            fireReady()
          }catch(ex) {
            setTimeout(readyScroll, POLL_INTERVAL)
          }
        };
        readyScroll()
      }
    }
  }
  if(location && (location.search || EMPTY).indexOf("ks-debug") !== -1) {
    S.Config.debug = true
  }
  if(supportEvent) {
    bindReady()
  }
  try {
    doc.execCommand("BackgroundImageCache", false, true)
  }catch(e) {
  }
});
KISSY.add("util", ["util/array", "util/escape", "util/function", "util/object", "util/string", "util/type", "util/web"], function(S, require) {
  var FALSE = false, CLONE_MARKER = "__~ks_cloned";
  require("util/array");
  require("util/escape");
  require("util/function");
  require("util/object");
  require("util/string");
  require("util/type");
  require("util/web");
  S.mix(S, {clone:function(input, filter) {
    var memory = {}, ret = cloneInternal(input, filter, memory);
    S.each(memory, function(v) {
      v = v.input;
      if(v[CLONE_MARKER]) {
        try {
          delete v[CLONE_MARKER]
        }catch(e) {
          v[CLONE_MARKER] = undefined
        }
      }
    });
    memory = null;
    return ret
  }});
  function cloneInternal(input, f, memory) {
    var destination = input, isArray, isPlainObject, k, stamp;
    if(!input) {
      return destination
    }
    if(input[CLONE_MARKER]) {
      return memory[input[CLONE_MARKER]].destination
    }else {
      if(typeof input === "object") {
        var Constructor = input.constructor;
        if(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])) {
          destination = new Constructor(input.valueOf())
        }else {
          if(isArray = S.isArray(input)) {
            destination = f ? S.filter(input, f) : input.concat()
          }else {
            if(isPlainObject = S.isPlainObject(input)) {
              destination = {}
            }
          }
        }
        input[CLONE_MARKER] = stamp = S.guid("c");
        memory[stamp] = {destination:destination, input:input}
      }
    }
    if(isArray) {
      for(var i = 0;i < destination.length;i++) {
        destination[i] = cloneInternal(destination[i], f, memory)
      }
    }else {
      if(isPlainObject) {
        for(k in input) {
          if(k !== CLONE_MARKER && (!f || f.call(input, input[k], k, input) !== FALSE)) {
            destination[k] = cloneInternal(input[k], f, memory)
          }
        }
      }
    }
    return destination
  }
  return S
});

