/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:29
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 mvc/sync
 mvc/model
 mvc/view
 mvc/collection
 mvc/router
 mvc
*/

KISSY.add("mvc/sync", ["io", "json"], function(S, require) {
  var io = require("io");
  var Json = require("json");
  var methodMap = {create:"POST", update:"POST", "delete":"POST", read:"GET"};
  function sync(self, method, options) {
    var type = methodMap[method], ioParam = S.merge({type:type, dataType:"json"}, options), data, url;
    data = ioParam.data = ioParam.data || {};
    data._method = method;
    if(!ioParam.url) {
      url = self.get("url");
      ioParam.url = typeof url === "string" ? url : url.call(self)
    }
    if(method === "create" || method === "update") {
      data.model = Json.stringify(self.toJSON())
    }
    return io(ioParam)
  }
  return sync
});
KISSY.add("mvc/model", ["attribute"], function(S, require) {
  var Attribute = require("attribute");
  var blacklist = ["idAttribute", "destroyed", "plugins", "listeners", "clientId", "urlRoot", "url", "parse", "sync"];
  return Attribute.extend({getCollections:function() {
    return this.collections || (this.collections = {})
  }, addToCollection:function(c) {
    this.getCollections()[S.stamp(c)] = c;
    this.addTarget(c)
  }, removeFromCollection:function(c) {
    delete this.getCollections()[S.stamp(c)];
    this.removeTarget(c)
  }, getId:function() {
    return this.get(this.get("idAttribute"))
  }, setId:function(id) {
    return this.set(this.get("idAttribute"), id)
  }, setInternal:function() {
    this.__isModified = 1;
    return this.callSuper.apply(this, arguments)
  }, isNew:function() {
    return!this.getId()
  }, isModified:function() {
    return!!(this.isNew() || this.__isModified)
  }, destroy:function(opts) {
    var self = this;
    opts = opts || {};
    var success = opts.success;
    opts.success = function(resp) {
      var lists = self.getCollections();
      if(resp) {
        var v = self.get("parse").call(self, resp);
        if(v) {
          self.set(v, opts)
        }
      }
      for(var l in lists) {
        lists[l].remove(self, opts)
      }
      self.fire("destroy");
      if(success) {
        success.apply(self, arguments)
      }
    };
    if(!self.isNew() && opts["delete"]) {
      self.get("sync").call(self, self, "delete", opts)
    }else {
      opts.success();
      if(opts.complete) {
        opts.complete()
      }
    }
    return self
  }, load:function(opts) {
    var self = this;
    opts = opts || {};
    var success = opts.success;
    opts.success = function(resp) {
      if(resp) {
        var v = self.get("parse").call(self, resp);
        if(v) {
          self.set(v, opts)
        }
      }
      self.__isModified = 0;
      if(success) {
        success.apply(self, arguments)
      }
    };
    self.get("sync").call(self, self, "read", opts);
    return self
  }, save:function(opts) {
    var self = this;
    opts = opts || {};
    var success = opts.success;
    opts.success = function(resp) {
      if(resp) {
        var v = self.get("parse").call(self, resp);
        if(v) {
          self.set(v, opts)
        }
      }
      self.__isModified = 0;
      if(success) {
        success.apply(self, arguments)
      }
    };
    self.get("sync").call(self, self, self.isNew() ? "create" : "update", opts);
    return self
  }, toJSON:function() {
    var ret = this.getAttrVals();
    S.each(blacklist, function(b) {
      delete ret[b]
    });
    return ret
  }}, {ATTRS:{idAttribute:{value:"id"}, clientId:{valueFn:function() {
    return S.guid("mvc-client")
  }}, url:{value:url}, urlRoot:{value:""}, sync:{value:function() {
    S.require("mvc").sync.apply(this, arguments)
  }}, parse:{value:function(resp) {
    return resp
  }}}});
  function getUrl(o) {
    var u;
    if(o && (u = o.get("url"))) {
      if(typeof u === "string") {
        return u
      }
      return u.call(o)
    }
    return u
  }
  function url() {
    var c, cv, collections = this.getCollections();
    for(c in collections) {
      if(collections.hasOwnProperty(c)) {
        cv = collections[c];
        break
      }
    }
    var base = getUrl(cv) || this.get("urlRoot");
    if(this.isNew()) {
      return base
    }
    base = base + (base.charAt(base.length - 1) === "/" ? "" : "/");
    return base + encodeURIComponent(this.getId()) + "/"
  }
});
KISSY.add("mvc/view", ["node", "attribute"], function(S, require) {
  var Node = require("node");
  var Attribute = require("attribute");
  var $ = Node.all;
  function normFn(self, f) {
    if(typeof f === "string") {
      return self[f]
    }
    return f
  }
  return Attribute.extend({constructor:function() {
    this.callSuper.apply(this, arguments);
    var events;
    if(events = this.get("events")) {
      this._afterEventsChange({newVal:events})
    }
  }, _afterEventsChange:function(e) {
    var prevVal = e.prevVal;
    if(prevVal) {
      this._removeEvents(prevVal)
    }
    this._addEvents(e.newVal)
  }, _removeEvents:function(events) {
    var el = this.get("el");
    for(var selector in events) {
      var event = events[selector];
      for(var type in event) {
        var callback = normFn(this, event[type]);
        el.undelegate(type, selector, callback, this)
      }
    }
  }, _addEvents:function(events) {
    var el = this.get("el");
    for(var selector in events) {
      var event = events[selector];
      for(var type in event) {
        var callback = normFn(this, event[type]);
        el.delegate(type, selector, callback, this)
      }
    }
  }, render:function() {
    return this
  }, destroy:function() {
    this.get("el").remove()
  }}, {ATTRS:{el:{value:"<div />", getter:function(s) {
    if(typeof s === "string") {
      s = $(s);
      this.setInternal("el", s)
    }
    return s
  }}, events:{}}})
});
KISSY.add("mvc/collection", ["./model", "attribute"], function(S, require) {
  var Model = require("./model");
  var Attribute = require("attribute");
  function findModelIndex(mods, mod, comparator) {
    var i = mods.length;
    if(comparator) {
      var k = comparator(mod);
      for(i = 0;i < mods.length;i++) {
        var k2 = comparator(mods[i]);
        if(k < k2) {
          break
        }
      }
    }
    return i
  }
  return Attribute.extend({sort:function() {
    var comparator = this.get("comparator");
    if(comparator) {
      this.get("models").sort(function(a, b) {
        return comparator(a) - comparator(b)
      })
    }
  }, toJSON:function() {
    return S.map(this.get("models"), function(m) {
      return m.toJSON()
    })
  }, add:function(model, opts) {
    var self = this, ret = true;
    if(S.isArray(model)) {
      var orig = [].concat(model);
      S.each(orig, function(m) {
        var t = self._add(m, opts);
        ret = ret && t
      })
    }else {
      ret = self._add(model, opts)
    }
    return ret
  }, remove:function(model, opts) {
    var self = this;
    if(S.isArray(model)) {
      var orig = [].concat(model);
      S.each(orig, function(m) {
        self._remove(m, opts)
      })
    }else {
      if(model) {
        self._remove(model, opts)
      }
    }
  }, at:function(i) {
    return this.get("models")[i]
  }, _normModel:function(model) {
    var ret = true;
    if(!(model instanceof Model)) {
      var data = model, ModelConstructor = this.get("model");
      model = new ModelConstructor;
      ret = model.set(data, {silent:1})
    }
    return ret && model
  }, load:function(opts) {
    var self = this;
    opts = opts || {};
    var success = opts.success;
    opts.success = function(resp) {
      if(resp) {
        var v = self.get("parse").call(self, resp);
        if(v) {
          self.set("models", v, opts)
        }
      }
      S.each(self.get("models"), function(m) {
        m.__isModified = 0
      });
      if(success) {
        success.apply(self, arguments)
      }
    };
    self.get("sync").call(self, self, "read", opts);
    return self
  }, create:function(model, opts) {
    var self = this;
    opts = opts || {};
    model = this._normModel(model);
    if(model) {
      model.addToCollection(self);
      var success = opts.success;
      opts.success = function() {
        self.add(model, opts);
        if(success) {
          success()
        }
      };
      model.save(opts)
    }
    return model
  }, _add:function(model, opts) {
    model = this._normModel(model);
    if(model) {
      opts = opts || {};
      var index = findModelIndex(this.get("models"), model, this.get("comparator"));
      this.get("models").splice(index, 0, model);
      model.addToCollection(this);
      if(!opts.silent) {
        this.fire("add", {model:model})
      }
    }
    return model
  }, _remove:function(model, opts) {
    opts = opts || {};
    var index = S.indexOf(model, this.get("models"));
    if(index !== -1) {
      this.get("models").splice(index, 1);
      model.removeFromCollection(this)
    }
    if(!opts.silent) {
      this.fire("remove", {model:model})
    }
  }, getById:function(id) {
    var models = this.get("models");
    for(var i = 0;i < models.length;i++) {
      var model = models[i];
      if(model.getId() === id) {
        return model
      }
    }
    return null
  }, getByCid:function(cid) {
    var models = this.get("models");
    for(var i = 0;i < models.length;i++) {
      var model = models[i];
      if(model.get("clientId") === cid) {
        return model
      }
    }
    return null
  }}, {ATTRS:{model:{value:Model}, models:{setter:function(models) {
    var prev = this.get("models");
    this.remove(prev, {silent:1});
    this.add(models, {silent:1});
    return this.get("models")
  }, value:[]}, url:{value:""}, comparator:{}, sync:{value:function() {
    S.require("mvc").sync.apply(this, arguments)
  }}, parse:{value:function(resp) {
    return resp
  }}}})
});
KISSY.add("mvc/router", ["attribute", "node"], function(S, require) {
  var Attribute = require("attribute");
  var Node = require("node");
  var each = S.each, BREATH_INTERVAL = 100, grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g, allRoutes = [], win = S.Env.host, $ = Node.all, $win = $(win), ie = S.UA.ieMode, history = win.history, supportNativeHistory = !!(history && history.pushState), ROUTER_MAP = "__routerMap";
  function findFirstCaptureGroupIndex(regStr) {
    var r, i;
    for(i = 0;i < regStr.length;i++) {
      r = regStr.charAt(i);
      if(r === "\\") {
        i++
      }else {
        if(r === "(") {
          return i
        }
      }
    }
    throw new Error("impossible to not to get capture group in kissy mvc route");
  }
  function getHash(url) {
    return(new S.Uri(url)).getFragment().replace(/^!/, "")
  }
  function getFragment(url) {
    url = url || location.href;
    if(Router.nativeHistory && supportNativeHistory) {
      url = new S.Uri(url);
      var query = url.getQuery().toString();
      return url.getPath().substr(Router.urlRoot.length) + (query ? "?" + query : "")
    }else {
      return getHash(url)
    }
  }
  function endWithSlash(str) {
    return S.endsWith(str, "/")
  }
  function startWithSlash(str) {
    return S.startsWith(str, "/")
  }
  function removeEndSlash(str) {
    if(endWithSlash(str)) {
      str = str.substring(0, str.length - 1)
    }
    return str
  }
  function removeStartSlash(str) {
    if(startWithSlash(str)) {
      str = str.substring(1)
    }
    return str
  }
  function addEndSlash(str) {
    return removeEndSlash(str) + "/"
  }
  function addStartSlash(str) {
    if(str) {
      return"/" + removeStartSlash(str)
    }else {
      return str
    }
  }
  function equalsIgnoreSlash(str1, str2) {
    str1 = removeEndSlash(str1);
    str2 = removeEndSlash(str2);
    return str1 === str2
  }
  function getFullPath(fragment) {
    return location.protocol + "//" + location.host + removeEndSlash(Router.urlRoot) + addStartSlash(fragment)
  }
  function dispatch() {
    var query, path, arg, finalRoute = 0, finalMatchLength = -1, finalRegStr = "", finalFirstCaptureGroupIndex = -1, finalCallback = 0, finalRouteName = "", pathUri = new S.Uri(getFragment()), finalParam = 0;
    path = pathUri.clone();
    path.query.reset();
    path = path.toString();
    each(allRoutes, function(route) {
      var routeRegs = route[ROUTER_MAP], exactlyMatch = 0;
      each(routeRegs, function(desc) {
        var reg = desc.reg, regStr = desc.regStr, paramNames = desc.paramNames, firstCaptureGroupIndex = -1, m, name = desc.name, callback = desc.callback;
        if(m = path.match(reg)) {
          m.shift();
          var genParam = function() {
            if(paramNames) {
              var params = {};
              each(m, function(sm, i) {
                params[paramNames[i]] = sm
              });
              return params
            }else {
              return[].concat(m)
            }
          };
          var upToFinal = function() {
            finalRegStr = regStr;
            finalFirstCaptureGroupIndex = firstCaptureGroupIndex;
            finalCallback = callback;
            finalParam = genParam();
            finalRoute = route;
            finalRouteName = name;
            finalMatchLength = m.length
          };
          if(!m.length) {
            upToFinal();
            exactlyMatch = 1;
            return false
          }else {
            if(regStr) {
              firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);
              if(firstCaptureGroupIndex > finalFirstCaptureGroupIndex) {
                upToFinal()
              }else {
                if(firstCaptureGroupIndex === finalFirstCaptureGroupIndex && finalMatchLength >= m.length) {
                  if(m.length < finalMatchLength) {
                    upToFinal()
                  }else {
                    if(regStr.length > finalRegStr.length) {
                      upToFinal()
                    }
                  }
                }else {
                  if(!finalRoute) {
                    upToFinal()
                  }
                }
              }
            }else {
              upToFinal();
              exactlyMatch = 1;
              return false
            }
          }
        }
        return undefined
      });
      if(exactlyMatch) {
        return false
      }
      return undefined
    });
    if(finalParam) {
      query = pathUri.query.get();
      finalCallback.apply(finalRoute, [finalParam, query, {path:path, url:location.href}]);
      arg = {name:finalRouteName, paths:finalParam, path:path, url:location.href, query:query};
      finalRoute.fire("route:" + finalRouteName, arg);
      finalRoute.fire("route", arg)
    }
  }
  function transformRouterReg(self, str, callback) {
    var name = str, paramNames = [];
    if(typeof callback === "function") {
      str = S.escapeRegExp(str);
      str = str.replace(grammar, function(m, g1, g2, g3, g4) {
        paramNames.push(g2 || g4);
        if(g2) {
          return"([^/]+)"
        }else {
          if(g4) {
            return"(.*)"
          }
        }
        return undefined
      });
      return{name:name, paramNames:paramNames, reg:new RegExp("^" + str + "$"), regStr:str, callback:callback}
    }else {
      return{name:name, reg:callback.reg, callback:normFn(self, callback.callback)}
    }
  }
  function normFn(self, callback) {
    if(typeof callback === "function") {
      return callback
    }else {
      if(typeof callback === "string") {
        return self[callback]
      }
    }
    return callback
  }
  function _afterRoutesChange(e) {
    var self = this;
    self[ROUTER_MAP] = {};
    self.addRoutes(e.newVal)
  }
  var Router;
  Router = Attribute.extend({constructor:function() {
    var self = this;
    self.callSuper.apply(self, arguments);
    self.on("afterRoutesChange", _afterRoutesChange, self);
    _afterRoutesChange.call(self, {newVal:self.get("routes")});
    allRoutes.push(self)
  }, addRoutes:function(routes) {
    var self = this;
    each(routes, function(callback, name) {
      self[ROUTER_MAP][name] = transformRouterReg(self, name, normFn(self, callback))
    })
  }}, {ATTRS:{routes:{}}, hasRoute:function(path) {
    var match = 0;
    each(allRoutes, function(route) {
      var routeRegs = route[ROUTER_MAP];
      each(routeRegs, function(desc) {
        var reg = desc.reg;
        if(path.match(reg)) {
          match = 1;
          return false
        }
        return undefined
      });
      if(match) {
        return false
      }
      return undefined
    });
    return!!match
  }, removeRoot:function(url) {
    var u = new S.Uri(url);
    return u.getPath().substr(Router.urlRoot.length)
  }, navigate:function(path, opts) {
    opts = opts || {};
    var replaceHistory = opts.replaceHistory, normalizedPath;
    if(getFragment() !== path) {
      if(Router.nativeHistory && supportNativeHistory) {
        history[replaceHistory ? "replaceState" : "pushState"]({}, "", getFullPath(path));
        dispatch()
      }else {
        normalizedPath = "#!" + path;
        if(replaceHistory) {
          location.replace(normalizedPath + (ie && ie < 8 ? Node.REPLACE_HISTORY : ""))
        }else {
          location.hash = normalizedPath
        }
      }
    }else {
      if(opts && opts.triggerRoute) {
        dispatch()
      }
    }
  }, start:function(opts) {
    opts = opts || {};
    if(Router.__started) {
      return opts.success && opts.success()
    }
    opts.urlRoot = (opts.urlRoot || "").replace(/\/$/, "");
    var urlRoot, nativeHistory = opts.nativeHistory, locPath = location.pathname, hash = getFragment(), hashIsValid = location.hash.match(/#!.+/);
    urlRoot = Router.urlRoot = opts.urlRoot;
    Router.nativeHistory = nativeHistory;
    if(nativeHistory) {
      if(supportNativeHistory) {
        if(hashIsValid) {
          if(equalsIgnoreSlash(locPath, urlRoot)) {
            history.replaceState({}, "", getFullPath(hash));
            opts.triggerRoute = 1
          }else {
            S.error("location path must be same with urlRoot!")
          }
        }
      }else {
        if(!equalsIgnoreSlash(locPath, urlRoot)) {
          location.replace(addEndSlash(urlRoot) + "#!" + hash);
          return undefined
        }
      }
    }
    setTimeout(function() {
      if(nativeHistory && supportNativeHistory) {
        $win.on("popstate", dispatch)
      }else {
        $win.on("hashchange", dispatch);
        opts.triggerRoute = 1
      }
      if(opts.triggerRoute) {
        dispatch()
      }
      if(opts.success) {
        opts.success()
      }
    }, BREATH_INTERVAL);
    Router.__started = 1;
    return undefined
  }, stop:function() {
    Router.__started = 0;
    $win.detach("popstate", dispatch);
    $win.detach("hashchange", dispatch);
    allRoutes = []
  }});
  return Router
});
KISSY.add("mvc", ["mvc/sync", "mvc/model", "mvc/view", "mvc/collection", "mvc/router"], function(S, require) {
  return{sync:require("mvc/sync"), Model:require("mvc/model"), View:require("mvc/view"), Collection:require("mvc/collection"), Router:require("mvc/router")}
});

