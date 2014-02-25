/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 19:45
*/
/*
 Combined modules by KISSY Module Compiler: 

 router/utils
 router/route
 router/request
 router
*/

KISSY.add("router/utils", [], function(S) {
  var utils;
  function removeVid(str) {
    return str.replace(/__ks-vid=.+$/, "")
  }
  function getVidFromHash(hash) {
    var m;
    if(m = hash.match(/__ks-vid=(.+)$/)) {
      return parseInt(m[1], 10)
    }
    return 0
  }
  utils = {endWithSlash:function(str) {
    return S.endsWith(str, "/")
  }, startWithSlash:function(str) {
    return S.startsWith(str, "/")
  }, removeEndSlash:function(str) {
    if(this.endWithSlash(str)) {
      str = str.substring(0, str.length - 1)
    }
    return str
  }, removeStartSlash:function(str) {
    if(this.startWithSlash(str)) {
      str = str.substring(1)
    }
    return str
  }, addEndSlash:function(str) {
    return this.removeEndSlash(str) + "/"
  }, addStartSlash:function(str) {
    if(str) {
      return"/" + this.removeStartSlash(str)
    }else {
      return str
    }
  }, getFullPath:function(fragment, urlRoot) {
    return location.protocol + "//" + location.host + this.removeEndSlash(urlRoot) + this.addStartSlash(fragment)
  }, equalsIgnoreSlash:function(str1, str2) {
    str1 = this.removeEndSlash(str1);
    str2 = this.removeEndSlash(str2);
    return str1 === str2
  }, getHash:function(uri) {
    return removeVid(uri.getFragment().replace(/^!/, ""))
  }, removeVid:removeVid, hasVid:function(str) {
    return str.indexOf("__ks-vid=") !== -1
  }, addVid:function(str, vid) {
    return str + "__ks-vid=" + vid
  }, getVidFromUrlWithHash:function(url) {
    return getVidFromHash((new S.Uri(url)).getFragment())
  }, getVidFromHash:getVidFromHash};
  return utils
});
KISSY.add("router/route", [], function(S) {
  var grammar = /(:([\w\d]+\??))|(\\\*([\w\d]+))/g;
  function pathRegexp(path) {
    var keys = [];
    path = S.escapeRegExp(path);
    path = path.replace(grammar, function(m, g1, g2, g3, g4) {
      var key = {};
      if(g2 && S.endsWith(g2, "?")) {
        key.optional = true;
        g2 = g2.slice(0, -1)
      }
      key.name = g2 || g4;
      keys.push(key);
      if(g2) {
        return"([^/]+)"
      }else {
        if(g4) {
          return"(.*)"
        }
      }
      return undefined
    });
    return{keys:keys, regexp:new RegExp("^" + path + "$")}
  }
  function Route(path, callbacks) {
    this.path = path;
    this.callbacks = callbacks;
    if(typeof path === "string") {
      S.mix(this, pathRegexp(path))
    }else {
      this.regexp = path
    }
  }
  Route.prototype = {match:function(path) {
    var self = this, m = path.match(self.regexp);
    if(!m) {
      return false
    }
    var keys = self.keys || [], params = [];
    for(var i = 1, len = m.length;i < len;++i) {
      var key = keys[i - 1];
      var val = "string" === typeof m[i] ? S.urlDecode(m[i]) : m[i];
      if(key) {
        params[key.name] = val
      }else {
        params.push(val)
      }
    }
    return params
  }, removeCallback:function(callback) {
    var callbacks = this.callbacks || [];
    for(var i = callbacks.length - 1;i >= 0;i++) {
      if(callbacks === callback) {
        callbacks.splice(i, 1)
      }
    }
  }};
  return Route
});
KISSY.add("router/request", [], function(S) {
  function Request(data) {
    S.mix(this, data)
  }
  Request.prototype = {param:function(name) {
    var self = this;
    if(name in self.params) {
      return self.params[name]
    }
    return self.query[name]
  }};
  return Request
});
KISSY.add("router", ["./router/utils", "./router/route", "uri", "./router/request", "event/dom", "event/custom"], function(S, require, exports) {
  var middlewares = [];
  var routes = [];
  var utils = require("./router/utils");
  var Route = require("./router/route");
  var Uri = require("uri");
  var Request = require("./router/request");
  var DomEvent = require("event/dom");
  var CustomEvent = require("event/custom");
  var started = false;
  var useHash;
  var urlRoot;
  var getVidFromUrlWithHash = utils.getVidFromUrlWithHash;
  var win = S.Env.host;
  var history = win.history;
  var supportNativeHashChange = S.Feature.isHashChangeSupported();
  var supportNativeHistory = !!(history && history.pushState);
  var BREATH_INTERVAL = 100;
  var viewUniqueId = 10;
  var viewsHistory = [viewUniqueId];
  function setPathByHash(path, replace) {
    var hash = utils.addVid("#!" + path + (supportNativeHashChange ? "" : DomEvent.REPLACE_HISTORY), viewUniqueId);
    if(replace) {
      location.replace(hash)
    }else {
      location.hash = hash
    }
  }
  function getUrlForRouter(url) {
    url = url || location.href;
    var uri = new Uri(url);
    if(!useHash && supportNativeHistory) {
      var query = uri.query;
      return uri.getPath().substr(urlRoot.length) + (query.has() ? "?" + query.toString() : "")
    }else {
      return utils.getHash(uri)
    }
  }
  function fireMiddleWare(request, response, cb) {
    var index = -1;
    var len = middlewares.length;
    function next() {
      index++;
      if(index === len) {
        cb(request, response)
      }else {
        var middleware = middlewares[index];
        if(S.startsWith(request.path + "/", middleware[0] + "/")) {
          var prefixLen = middleware[0].length;
          request.url = request.url.slice(prefixLen);
          var path = request.path;
          request.path = request.path.slice(prefixLen);
          middleware[1](request, next);
          request.url = request.originalUrl;
          request.path = path
        }else {
          next()
        }
      }
    }
    next()
  }
  function fireRoutes(request, response) {
    var index = -1;
    var len = routes.length;
    function next() {
      index++;
      if(index !== len) {
        var route = routes[index];
        if(request.params = route.match(request.path)) {
          var callbackIndex = -1;
          var callbacks = route.callbacks;
          var callbacksLen = callbacks.length;
          var nextCallback = function(cause) {
            if(cause === "route") {
              nextCallback = null;
              next()
            }else {
              callbackIndex++;
              if(callbackIndex !== callbacksLen) {
                request.route = route;
                callbacks[callbackIndex](request, response, nextCallback)
              }
            }
          };
          nextCallback("")
        }else {
          next()
        }
      }
    }
    next()
  }
  function dispatch(backward, replace) {
    var url = getUrlForRouter();
    var uri = new S.Uri(url);
    var query = uri.query.get();
    uri.query.reset();
    var path = uri.toString() || "/";
    var request = new Request({query:query, backward:backward === true, replace:replace === true, forward:backward === false && replace === false, path:path, url:url, originalUrl:url});
    var response = {redirect:exports.navigate};
    exports.fire("dispatch", {request:request, response:response});
    fireMiddleWare(request, response, fireRoutes)
  }
  S.mix(exports, CustomEvent.Target);
  exports.use = function(prefix, callback) {
    if(typeof prefix !== "string") {
      callback = prefix;
      prefix = ""
    }
    middlewares.push([prefix, callback])
  };
  exports.navigate = function(path, opts) {
    opts = opts || {};
    var replace = opts.replace || false;
    if(getUrlForRouter() !== path) {
      if(!replace) {
        viewUniqueId++;
        viewsHistory.push(viewUniqueId)
      }
      if(!useHash && supportNativeHistory) {
        history[replace ? "replaceState" : "pushState"]({vid:viewUniqueId}, "", utils.getFullPath(path, urlRoot));
        dispatch(false, replace)
      }else {
        if(supportNativeHistory) {
          history[replace ? "replaceState" : "pushState"]({vid:viewUniqueId}, "", "#!" + path);
          dispatch(false, replace)
        }else {
          setPathByHash(path, replace)
        }
      }
    }else {
      if(opts && opts.triggerRoute) {
        dispatch(false, true)
      }
    }
  };
  exports.get = function(routePath) {
    var callbacks = S.makeArray(arguments).slice(1);
    routes.push(new Route(routePath, callbacks))
  };
  exports.matchRoute = function(path) {
    for(var i = 0, l = routes.length;i < l;i++) {
      if(routes[i].match(path)) {
        return routes[i]
      }
    }
    return false
  };
  exports.removeRoute = function(routePath, callback) {
    for(var i = routes.length - 1;i >= 0;i--) {
      var r = routes[i];
      if(r.path === routePath) {
        if(callback) {
          r.removeCallback(callback);
          if(!r.callbacks.length) {
            routes.splice(i, 1)
          }
        }else {
          routes.splice(i, 1)
        }
      }
    }
  };
  exports.clearRoutes = function() {
    middlewares = [];
    routes = []
  };
  exports.hasRoute = function(routePath) {
    for(var i = 0, l = routes.length;i < l;i++) {
      if(routes[i].path === routePath) {
        return routes[i]
      }
    }
    return false
  };
  function dispatchByVid(vid) {
    var backward = false;
    var replace = false;
    if(vid === viewsHistory[viewsHistory.length - 2]) {
      backward = true;
      viewsHistory.pop()
    }else {
      if(vid !== viewsHistory[viewsHistory.length - 1]) {
        viewsHistory.push(vid)
      }else {
        replace = true
      }
    }
    dispatch(backward, replace)
  }
  function onPopState(e) {
    var state = e.originalEvent.state;
    if(!state) {
      return
    }
    dispatchByVid(state.vid)
  }
  function onHashChange(e) {
    var newURL = e.newURL || location.href;
    var vid = getVidFromUrlWithHash(newURL);
    if(!vid) {
      return
    }
    dispatchByVid(vid)
  }
  exports.start = function(opts) {
    opts = opts || {};
    if(started) {
      return opts.success && opts.success.call(exports)
    }
    opts.urlRoot = (opts.urlRoot || "").replace(/\/$/, "");
    useHash = opts.useHash;
    urlRoot = opts.urlRoot;
    if(useHash === undefined) {
      useHash = true
    }
    if(opts.useHashChange) {
      supportNativeHistory = false
    }
    var locPath = location.pathname, href = location.href, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
    if(!useHash) {
      if(supportNativeHistory) {
        if(hashIsValid) {
          if(utils.equalsIgnoreSlash(locPath, urlRoot)) {
            history.replaceState({}, "", utils.getFullPath(hash, urlRoot));
            opts.triggerRoute = 1
          }else {
            S.error("router: location path must be same with urlRoot!")
          }
        }
      }else {
        if(!utils.equalsIgnoreSlash(locPath, urlRoot)) {
          location.replace(utils.addEndSlash(urlRoot) + "#!" + hash);
          return undefined
        }else {
          useHash = true
        }
      }
    }
    setTimeout(function() {
      var needReplaceHistory = supportNativeHistory;
      if(supportNativeHistory) {
        DomEvent.on(win, "popstate", onPopState)
      }else {
        DomEvent.on(win, "hashchange", onHashChange);
        opts.triggerRoute = 1
      }
      if(useHash) {
        if(!getUrlForRouter()) {
          exports.navigate("/", {replace:1});
          opts.triggerRoute = 0;
          needReplaceHistory = false
        }else {
          if(!supportNativeHistory && getVidFromUrlWithHash(href) !== viewUniqueId) {
            setPathByHash(utils.getHash(new S.Uri(href)), true);
            opts.triggerRoute = 0
          }else {
            if(supportNativeHistory && utils.hasVid(href)) {
              location.replace(href = utils.removeVid(href))
            }
          }
        }
      }
      if(needReplaceHistory) {
        history.replaceState({vid:viewUniqueId}, "", href)
      }
      if(opts.triggerRoute) {
        dispatch(false, true)
      }
      if(opts.success) {
        opts.success()
      }
    }, BREATH_INTERVAL);
    started = true;
    return exports
  };
  exports.stop = function() {
    started = false;
    DomEvent.detach(win, "hashchange", onHashChange);
    DomEvent.detach(win, "popstate", onPopState)
  }
});

