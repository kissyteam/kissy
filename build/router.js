/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Jan 8 13:16
*/
/*
 Combined modules by KISSY Module Compiler: 

 router/utils
 router/route
 router/request
 router
*/

KISSY.add("router/utils", [], function(S) {
  return{endWithSlash:function(str) {
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
    return uri.getFragment().replace(/^!/, "")
  }}
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
KISSY.add("router", ["./router/utils", "./router/route", "uri", "./router/request", "event/dom"], function(S, require, exports) {
  var middlewares = [];
  var routes = [];
  var utils = require("./router/utils");
  var Route = require("./router/route");
  var Uri = require("uri");
  var Request = require("./router/request");
  var DomEvent = require("event/dom");
  var started = false;
  var useHash;
  var urlRoot;
  var win = S.Env.host;
  var history = win.history;
  var supportNativeHashChange = S.Features.isHashChangeSupported();
  var supportNativeHistory = !!(history && history.pushState);
  var BREATH_INTERVAL = 100;
  var uuid = 10;
  var pageIdHistory = [uuid];
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
  function dispatch(backward) {
    var url = getUrlForRouter();
    var uri = new S.Uri(url);
    var query = uri.query.get();
    uri.query.reset();
    var path = uri.toString() || "/";
    var request = new Request({query:query, backward:backward, path:path, url:url, originalUrl:url});
    var response = {redirect:exports.navigate};
    fireMiddleWare(request, response, fireRoutes)
  }
  exports.use = function(prefix, callback) {
    if(typeof prefix !== "string") {
      callback = prefix;
      prefix = ""
    }
    middlewares.push([prefix, callback])
  };
  exports.navigate = function(path, opts) {
    opts = opts || {};
    var replaceHistory = opts.replaceHistory, normalizedPath;
    if(getUrlForRouter() !== path) {
      if(!replaceHistory) {
        uuid++;
        pageIdHistory.push(uuid)
      }
      if(!useHash && supportNativeHistory) {
        history[replaceHistory ? "replaceState" : "pushState"]({pageDepth:uuid}, "", utils.getFullPath(path, urlRoot));
        dispatch()
      }else {
        normalizedPath = "#!" + path;
        if(replaceHistory) {
          if(supportNativeHistory) {
            history.replaceState({pageDepth:uuid}, "", normalizedPath);
            dispatch()
          }else {
            location.replace(normalizedPath + (supportNativeHashChange ? "" : DomEvent.REPLACE_HISTORY))
          }
        }else {
          if(supportNativeHistory) {
            history.pushState({pageDepth:uuid}, "", normalizedPath);
            dispatch()
          }else {
            location.hash = normalizedPath
          }
        }
      }
    }else {
      if(opts && opts.triggerRoute) {
        dispatch()
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
  exports.start = function(opts) {
    opts = opts || {};
    if(started) {
      return opts.success && opts.success.call(exports)
    }
    opts.urlRoot = (opts.urlRoot || "").replace(/\/$/, "");
    useHash = opts.useHash;
    urlRoot = opts.urlRoot;
    var locPath = location.pathname, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
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
        }
      }
    }
    setTimeout(function() {
      var needReplaceHistory = supportNativeHistory;
      if(supportNativeHistory) {
        DomEvent.on(win, "popstate", function(e) {
          var state = e.originalEvent.state;
          var backward = false;
          if(state.pageDepth === pageIdHistory[pageIdHistory.length - 2]) {
            backward = true;
            pageIdHistory.pop()
          }else {
            pageIdHistory.push(state.pageDepth)
          }
          dispatch(backward)
        })
      }else {
        DomEvent.on(win, "hashchange", dispatch);
        opts.triggerRoute = 1
      }
      if(useHash) {
        if(!getUrlForRouter()) {
          exports.navigate("/", {replaceHistory:1});
          opts.triggerRoute = 0;
          needReplaceHistory = false
        }
      }
      if(needReplaceHistory) {
        history.replaceState({pageDepth:uuid}, "", location.href)
      }
      if(opts.triggerRoute) {
        dispatch()
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
    DomEvent.detach(win, "popstate hashchange", dispatch)
  }
});

