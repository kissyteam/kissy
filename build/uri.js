/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:43
*/
/*
 Combined modules by KISSY Module Compiler: 

 uri
*/

KISSY.add("uri", ["path"], function(S, require) {
  var Path = require ? require("path") : S.Path;
  var logger = S.getLogger("s/uri");
  var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, reDisallowedInQuery = /[#@]/g, reDisallowedInFragment = /#/g, URI_SPLIT_REG = new RegExp("^" + "(?:([\\w\\d+.-]+):)?" + "(?://" + "(?:([^/?#@]*)@)?" + "(" + "[\\w\\d\\-\\u0100-\\uffff.+%]*" + "|" + "\\[[^\\]]+\\]" + ")" + "(?::([0-9]+))?" + ")?" + "([^?#]+)?" + "(?:\\?([^#]*))?" + "(?:#(.*))?" + "$"), REG_INFO = {scheme:1, userInfo:2, hostname:3, port:4, path:5, query:6, fragment:7};
  function parseQuery(self) {
    if(!self._queryMap) {
      self._queryMap = S.unparam(self._query)
    }
  }
  function Query(query) {
    this._query = query || ""
  }
  Query.prototype = {constructor:Query, clone:function() {
    return new Query(this.toString())
  }, reset:function(query) {
    var self = this;
    self._query = query || "";
    self._queryMap = null;
    return self
  }, count:function() {
    var self = this, count = 0, _queryMap, k;
    parseQuery(self);
    _queryMap = self._queryMap;
    for(k in _queryMap) {
      if(S.isArray(_queryMap[k])) {
        count += _queryMap[k].length
      }else {
        count++
      }
    }
    return count
  }, has:function(key) {
    var self = this, _queryMap;
    parseQuery(self);
    _queryMap = self._queryMap;
    if(key) {
      return key in _queryMap
    }else {
      return!S.isEmptyObject(_queryMap)
    }
  }, get:function(key) {
    var self = this, _queryMap;
    parseQuery(self);
    _queryMap = self._queryMap;
    if(key) {
      return _queryMap[key]
    }else {
      return _queryMap
    }
  }, keys:function() {
    var self = this;
    parseQuery(self);
    return S.keys(self._queryMap)
  }, set:function(key, value) {
    var self = this, _queryMap;
    parseQuery(self);
    _queryMap = self._queryMap;
    if(typeof key === "string") {
      self._queryMap[key] = value
    }else {
      if(key instanceof Query) {
        key = key.get()
      }
      S.each(key, function(v, k) {
        _queryMap[k] = v
      })
    }
    return self
  }, remove:function(key) {
    var self = this;
    parseQuery(self);
    if(key) {
      delete self._queryMap[key]
    }else {
      self._queryMap = {}
    }
    return self
  }, add:function(key, value) {
    var self = this, _queryMap, currentValue;
    if(typeof key === "string") {
      parseQuery(self);
      _queryMap = self._queryMap;
      currentValue = _queryMap[key];
      if(currentValue === undefined) {
        currentValue = value
      }else {
        currentValue = [].concat(currentValue).concat(value)
      }
      _queryMap[key] = currentValue
    }else {
      if(key instanceof Query) {
        key = key.get()
      }
      for(var k in key) {
        self.add(k, key[k])
      }
    }
    return self
  }, toString:function(serializeArray) {
    var self = this;
    parseQuery(self);
    return S.param(self._queryMap, undefined, undefined, serializeArray)
  }};
  function padding2(str) {
    return str.length === 1 ? "0" + str : str
  }
  function equalsIgnoreCase(str1, str2) {
    return str1.toLowerCase() === str2.toLowerCase()
  }
  function encodeSpecialChars(str, specialCharsReg) {
    return encodeURI(str).replace(specialCharsReg, function(m) {
      return"%" + padding2(m.charCodeAt(0).toString(16))
    })
  }
  function Uri(uriStr) {
    if(uriStr instanceof Uri) {
      return uriStr.clone()
    }
    var components, self = this;
    S.mix(self, {scheme:"", userInfo:"", hostname:"", port:"", path:"", query:"", fragment:""});
    components = Uri.getComponents(uriStr);
    S.each(components, function(v, key) {
      v = v || "";
      if(key === "query") {
        self.query = new Query(v)
      }else {
        try {
          v = S.urlDecode(v)
        }catch(e) {
          logger.error(e + "urlDecode error : " + v)
        }
        self[key] = v
      }
    });
    return self
  }
  Uri.prototype = {constructor:Uri, clone:function() {
    var uri = new Uri, self = this;
    S.each(REG_INFO, function(index, key) {
      uri[key] = self[key]
    });
    uri.query = uri.query.clone();
    return uri
  }, resolve:function(relativeUri) {
    if(typeof relativeUri === "string") {
      relativeUri = new Uri(relativeUri)
    }
    var self = this, override = 0, lastSlashIndex, order = ["scheme", "userInfo", "hostname", "port", "path", "query", "fragment"], target = self.clone();
    S.each(order, function(o) {
      if(o === "path") {
        if(override) {
          target[o] = relativeUri[o]
        }else {
          var path = relativeUri.path;
          if(path) {
            override = 1;
            if(!S.startsWith(path, "/")) {
              if(target.hostname && !target.path) {
                path = "/" + path
              }else {
                if(target.path) {
                  lastSlashIndex = target.path.lastIndexOf("/");
                  if(lastSlashIndex !== -1) {
                    path = target.path.slice(0, lastSlashIndex + 1) + path
                  }
                }
              }
            }
            target.path = Path.normalize(path)
          }
        }
      }else {
        if(o === "query") {
          if(override || relativeUri.query.toString()) {
            target.query = relativeUri.query.clone();
            override = 1
          }
        }else {
          if(override || relativeUri[o]) {
            target[o] = relativeUri[o];
            override = 1
          }
        }
      }
    });
    return target
  }, getScheme:function() {
    return this.scheme
  }, setScheme:function(scheme) {
    this.scheme = scheme;
    return this
  }, getHostname:function() {
    return this.hostname
  }, setHostname:function(hostname) {
    this.hostname = hostname;
    return this
  }, setUserInfo:function(userInfo) {
    this.userInfo = userInfo;
    return this
  }, getUserInfo:function() {
    return this.userInfo
  }, setPort:function(port) {
    this.port = port;
    return this
  }, getPort:function() {
    return this.port
  }, setPath:function(path) {
    this.path = path;
    return this
  }, getPath:function() {
    return this.path
  }, setQuery:function(query) {
    if(typeof query === "string") {
      if(S.startsWith(query, "?")) {
        query = query.slice(1)
      }
      query = new Query(encodeSpecialChars(query, reDisallowedInQuery))
    }
    this.query = query;
    return this
  }, getQuery:function() {
    return this.query
  }, getFragment:function() {
    return this.fragment
  }, setFragment:function(fragment) {
    var self = this;
    if(S.startsWith(fragment, "#")) {
      fragment = fragment.slice(1)
    }
    self.fragment = fragment;
    return self
  }, isSameOriginAs:function(other) {
    var self = this;
    return equalsIgnoreCase(self.hostname, other.hostname) && equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)
  }, toString:function(serializeArray) {
    var out = [], self = this, scheme, hostname, path, port, fragment, query, userInfo;
    if(scheme = self.scheme) {
      out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
      out.push(":")
    }
    if(hostname = self.hostname) {
      out.push("//");
      if(userInfo = self.userInfo) {
        out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
        out.push("@")
      }
      out.push(encodeURIComponent(hostname));
      if(port = self.port) {
        out.push(":");
        out.push(port)
      }
    }
    if(path = self.path) {
      if(hostname && !S.startsWith(path, "/")) {
        path = "/" + path
      }
      path = Path.normalize(path);
      out.push(encodeSpecialChars(path, reDisallowedInPathName))
    }
    if(query = self.query.toString(serializeArray)) {
      out.push("?");
      out.push(query)
    }
    if(fragment = self.fragment) {
      out.push("#");
      out.push(encodeSpecialChars(fragment, reDisallowedInFragment))
    }
    return out.join("")
  }};
  Uri.Query = Query;
  Uri.getComponents = function(url) {
    url = url || "";
    var m = url.match(URI_SPLIT_REG) || [], ret = {};
    S.each(REG_INFO, function(index, key) {
      ret[key] = m[index]
    });
    return ret
  };
  S.Uri = Uri;
  return Uri
});

