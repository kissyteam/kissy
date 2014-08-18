/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: Jul 23 14:31
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 io/form-serializer
 io/base
 io/xhr-transport-base
 io/xdr-flash-transport
 io/sub-domain-transport
 io/xhr-transport
 io/script-transport
 io/jsonp
 io/form
 io/iframe-transport
 io/methods
 io
*/

KISSY.add("io/form-serializer", ["dom"], function(S, require) {
  var Dom = require("dom");
  var rselectTextarea = /^(?:select|textarea)/i, rCRLF = /\r?\n/g, FormSerializer, rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
  function normalizeCRLF(v) {
    return v.replace(rCRLF, "\r\n")
  }
  FormSerializer = {serialize:function(forms, serializeArray) {
    return S.param(FormSerializer.getFormData(forms), undefined, undefined, serializeArray || false)
  }, getFormData:function(forms) {
    var elements = [], data = {};
    S.each(Dom.query(forms), function(el) {
      var subs = el.elements ? S.makeArray(el.elements) : [el];
      elements.push.apply(elements, subs)
    });
    elements = S.filter(elements, function(el) {
      return el.name && !el.disabled && (el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type))
    });
    S.each(elements, function(el) {
      var val = Dom.val(el), vs;
      if(val === null) {
        return
      }
      if(S.isArray(val)) {
        val = S.map(val, normalizeCRLF)
      }else {
        val = normalizeCRLF(val)
      }
      vs = data[el.name];
      if(vs === undefined) {
        data[el.name] = val;
        return
      }
      if(!S.isArray(vs)) {
        vs = data[el.name] = [vs]
      }
      vs.push.apply(vs, S.makeArray(val))
    });
    return data
  }};
  return FormSerializer
});
KISSY.add("io/base", ["event/custom", "promise"], function(S, require) {
  var CustomEvent = require("event/custom"), Promise = require("promise");
  var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/, rspace = /\s+/, mirror = function(s) {
    return s
  }, rnoContent = /^(?:GET|HEAD)$/, win = S.Env.host, location = win.location || {}, simulatedLocation = new S.Uri(location.href), isLocal = simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme()), transports = {}, defaultConfig = {type:"GET", contentType:"application/x-www-form-urlencoded; charset=UTF-8", async:true, serializeArray:true, processData:true, accepts:{xml:"application/xml, text/xml", html:"text/html", text:"text/plain", json:"application/json, text/javascript", "*":"*/*"}, 
  converters:{text:{json:S.parseJson, html:mirror, text:mirror, xml:S.parseXML}}, headers:{"X-Requested-With":"XMLHttpRequest"}, contents:{xml:/xml/, html:/html/, json:/json/}};
  defaultConfig.converters.html = defaultConfig.converters.text;
  function setUpConfig(c) {
    var context = c.context;
    delete c.context;
    c = S.mix(S.clone(defaultConfig), c, {deep:true});
    c.context = context || c;
    var data, uri, type = c.type, dataType = c.dataType;
    uri = c.uri = simulatedLocation.resolve(c.url);
    c.uri.setQuery("");
    if(!("crossDomain" in c)) {
      c.crossDomain = !c.uri.isSameOriginAs(simulatedLocation)
    }
    type = c.type = type.toUpperCase();
    c.hasContent = !rnoContent.test(type);
    if(c.processData && (data = c.data) && typeof data !== "string") {
      c.data = S.param(data, undefined, undefined, c.serializeArray)
    }
    dataType = c.dataType = S.trim(dataType || "*").split(rspace);
    if(!("cache" in c) && S.inArray(dataType[0], ["script", "jsonp"])) {
      c.cache = false
    }
    if(!c.hasContent) {
      if(c.data) {
        uri.query.add(S.unparam(c.data))
      }
      if(c.cache === false) {
        uri.query.set("_ksTS", S.now() + "_" + S.guid())
      }
    }
    return c
  }
  function IO(c) {
    var self = this;
    if(!(self instanceof IO)) {
      return new IO(c)
    }
    Promise.call(self);
    c = setUpConfig(c);
    S.mix(self, {responseData:null, config:c || {}, timeoutTimer:null, responseText:null, responseXML:null, responseHeadersString:"", responseHeaders:null, requestHeaders:{}, readyState:0, state:0, statusText:null, status:0, transport:null});
    Promise.Defer(self);
    var TransportConstructor, transport;
    IO.fire("start", {ajaxConfig:c, io:self});
    TransportConstructor = transports[c.dataType[0]] || transports["*"];
    transport = new TransportConstructor(self);
    self.transport = transport;
    if(c.contentType) {
      self.setRequestHeader("Content-Type", c.contentType)
    }
    var dataType = c.dataType[0], i, timeout = c.timeout, context = c.context, headers = c.headers, accepts = c.accepts;
    self.setRequestHeader("Accept", dataType && accepts[dataType] ? accepts[dataType] + (dataType === "*" ? "" : ", */*; q=0.01") : accepts["*"]);
    for(i in headers) {
      self.setRequestHeader(i, headers[i])
    }
    if(c.beforeSend && c.beforeSend.call(context, self, c) === false) {
      return self
    }
    self.readyState = 1;
    IO.fire("send", {ajaxConfig:c, io:self});
    if(c.async && timeout > 0) {
      self.timeoutTimer = setTimeout(function() {
        self.abort("timeout")
      }, timeout * 1E3)
    }
    try {
      self.state = 1;
      transport.send()
    }catch(e) {
      if(self.state < 2) {
        S.log(e.stack || e, "error");
        if("@DEBUG@") {
          setTimeout(function() {
            throw e;
          }, 0)
        }
        self._ioReady(-1, e.message || "send error")
      }else {
        S.error(e)
      }
    }
    return self
  }
  S.mix(IO, CustomEvent.Target);
  S.mix(IO, {isLocal:isLocal, setupConfig:function(setting) {
    S.mix(defaultConfig, setting, {deep:true})
  }, setupTransport:function(name, fn) {
    transports[name] = fn
  }, getTransport:function(name) {
    return transports[name]
  }, getConfig:function() {
    return defaultConfig
  }});
  return IO
});
KISSY.add("io/xhr-transport-base", ["./base"], function(S, require) {
  var IO = require("./base");
  var logger = S.getLogger("s/io");
  var OK_CODE = 200, win = S.Env.host, XDomainRequest_ = S.UA.ieMode > 7 && win.XDomainRequest, NO_CONTENT_CODE = 204, NOT_FOUND_CODE = 404, NO_CONTENT_CODE2 = 1223, XhrTransportBase = {proto:{}}, lastModifiedCached = {}, eTagCached = {};
  IO.__lastModifiedCached = lastModifiedCached;
  IO.__eTagCached = eTagCached;
  function createStandardXHR(_, refWin) {
    try {
      return new (refWin || win).XMLHttpRequest
    }catch(e) {
    }
    return undefined
  }
  function createActiveXHR(_, refWin) {
    try {
      return new (refWin || win).ActiveXObject("Microsoft.XMLHTTP")
    }catch(e) {
    }
    return undefined
  }
  XhrTransportBase.nativeXhr = win.ActiveXObject ? function(crossDomain, refWin) {
    if(!supportCORS && crossDomain && XDomainRequest_) {
      return new XDomainRequest_
    }
    return!IO.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin)
  } : createStandardXHR;
  XhrTransportBase.XDomainRequest_ = XDomainRequest_;
  var supportCORS = XhrTransportBase.supportCORS = "withCredentials" in XhrTransportBase.nativeXhr();
  function isInstanceOfXDomainRequest(xhr) {
    return XDomainRequest_ && xhr instanceof XDomainRequest_
  }
  function getIfModifiedKey(c) {
    var ifModified = c.ifModified, ifModifiedKey;
    if(ifModified) {
      ifModifiedKey = c.uri;
      if(c.cache === false) {
        ifModifiedKey = ifModifiedKey.clone();
        ifModifiedKey.query.remove("_ksTS")
      }
      ifModifiedKey = ifModifiedKey.toString()
    }
    return ifModifiedKey
  }
  S.mix(XhrTransportBase.proto, {sendInternal:function() {
    var self = this, io = self.io, c = io.config, nativeXhr = self.nativeXhr, files = c.files, type = files ? "post" : c.type, async = c.async, username, mimeType = io.mimeType, requestHeaders = io.requestHeaders || {}, url = io._getUrlForSend(), xhrFields, ifModifiedKey = getIfModifiedKey(c), cacheValue, i;
    if(ifModifiedKey) {
      if(cacheValue = lastModifiedCached[ifModifiedKey]) {
        requestHeaders["If-Modified-Since"] = cacheValue
      }
      if(cacheValue = eTagCached[ifModifiedKey]) {
        requestHeaders["If-None-Match"] = cacheValue
      }
    }
    if(username = c.username) {
      nativeXhr.open(type, url, async, username, c.password)
    }else {
      nativeXhr.open(type, url, async)
    }
    xhrFields = c.xhrFields || {};
    if("withCredentials" in xhrFields) {
      if(!supportCORS) {
        delete xhrFields.withCredentials
      }
    }
    for(i in xhrFields) {
      try {
        nativeXhr[i] = xhrFields[i]
      }catch(e) {
        logger.error(e)
      }
    }
    if(mimeType && nativeXhr.overrideMimeType) {
      nativeXhr.overrideMimeType(mimeType)
    }
    var xRequestHeader = requestHeaders["X-Requested-With"];
    if(xRequestHeader === false) {
      delete requestHeaders["X-Requested-With"]
    }
    if(typeof nativeXhr.setRequestHeader !== "undefined") {
      for(i in requestHeaders) {
        nativeXhr.setRequestHeader(i, requestHeaders[i])
      }
    }
    var sendContent = c.hasContent && c.data || null;
    if(files) {
      var originalSentContent = sendContent, data = {};
      if(originalSentContent) {
        data = S.unparam(originalSentContent)
      }
      data = S.mix(data, files);
      sendContent = new FormData;
      S.each(data, function(vs, k) {
        if(S.isArray(vs)) {
          S.each(vs, function(v) {
            sendContent.append(k + (c.serializeArray ? "[]" : ""), v)
          })
        }else {
          sendContent.append(k, vs)
        }
      })
    }
    nativeXhr.send(sendContent);
    if(!async || nativeXhr.readyState === 4) {
      self._callback()
    }else {
      if(isInstanceOfXDomainRequest(nativeXhr)) {
        nativeXhr.onload = function() {
          nativeXhr.readyState = 4;
          nativeXhr.status = 200;
          self._callback()
        };
        nativeXhr.onerror = function() {
          nativeXhr.readyState = 4;
          nativeXhr.status = 500;
          self._callback()
        }
      }else {
        nativeXhr.onreadystatechange = function() {
          self._callback()
        }
      }
    }
  }, abort:function() {
    this._callback(0, 1)
  }, _callback:function(event, abort) {
    var self = this, nativeXhr = self.nativeXhr, io = self.io, ifModifiedKey, lastModified, eTag, statusText, xml, c = io.config;
    try {
      if(abort || nativeXhr.readyState === 4) {
        if(isInstanceOfXDomainRequest(nativeXhr)) {
          nativeXhr.onerror = S.noop;
          nativeXhr.onload = S.noop
        }else {
          nativeXhr.onreadystatechange = S.noop
        }
        if(abort) {
          if(nativeXhr.readyState !== 4) {
            nativeXhr.abort()
          }
        }else {
          ifModifiedKey = getIfModifiedKey(c);
          var status = nativeXhr.status;
          if(!isInstanceOfXDomainRequest(nativeXhr)) {
            io.responseHeadersString = nativeXhr.getAllResponseHeaders()
          }
          if(ifModifiedKey) {
            lastModified = nativeXhr.getResponseHeader("Last-Modified");
            eTag = nativeXhr.getResponseHeader("ETag");
            if(lastModified) {
              lastModifiedCached[ifModifiedKey] = lastModified
            }
            if(eTag) {
              eTagCached[eTag] = eTag
            }
          }
          xml = nativeXhr.responseXML;
          if(xml && xml.documentElement) {
            io.responseXML = xml
          }
          var text = io.responseText = nativeXhr.responseText;
          if(c.files && text) {
            var bodyIndex, lastBodyIndex;
            if((bodyIndex = text.indexOf("<body>")) !== -1) {
              lastBodyIndex = text.lastIndexOf("</body>");
              if(lastBodyIndex === -1) {
                lastBodyIndex = text.length
              }
              text = text.slice(bodyIndex + 6, lastBodyIndex)
            }
            io.responseText = S.unEscapeHtml(text)
          }
          try {
            statusText = nativeXhr.statusText
          }catch(e) {
            logger.error("xhr statusText error: ");
            logger.error(e);
            statusText = ""
          }
          if(!status && IO.isLocal && !c.crossDomain) {
            status = io.responseText ? OK_CODE : NOT_FOUND_CODE
          }else {
            if(status === NO_CONTENT_CODE2) {
              status = NO_CONTENT_CODE
            }
          }
          io._ioReady(status, statusText)
        }
      }
    }catch(e) {
      S.log(e.stack || e, "error");
      if("@DEBUG@") {
        setTimeout(function() {
          throw e;
        }, 0)
      }
      nativeXhr.onreadystatechange = S.noop;
      if(!abort) {
        io._ioReady(-1, e.message || "process error")
      }
    }
  }});
  return XhrTransportBase
});
KISSY.add("io/xdr-flash-transport", ["./base", "dom"], function(S, require) {
  var IO = require("./base"), Dom = require("dom");
  var logger = S.getLogger("s/io");
  var maps = {}, ID = "io_swf", flash, doc = S.Env.host.document, init = false;
  function _swf(uri, _, uid) {
    if(init) {
      return
    }
    init = true;
    var o = '<object id="' + ID + '" type="application/x-shockwave-flash" data="' + uri + '" width="0" height="0">' + '<param name="movie" value="' + uri + '" />' + '<param name="FlashVars" value="yid=' + _ + "&uid=" + uid + '&host=KISSY.IO" />' + '<param name="allowScriptAccess" value="always" />' + "</object>", c = doc.createElement("div");
    Dom.prepend(c, doc.body || doc.documentElement);
    c.innerHTML = o
  }
  function XdrFlashTransport(io) {
    logger.info("use XdrFlashTransport for: " + io.config.url);
    this.io = io
  }
  S.augment(XdrFlashTransport, {send:function() {
    var self = this, io = self.io, c = io.config, xdr = c.xdr || {};
    _swf(xdr.src || S.Config.base + "io/assets/io.swf", 1, 1);
    if(!flash) {
      setTimeout(function() {
        self.send()
      }, 200);
      return
    }
    self._uid = S.guid();
    maps[self._uid] = self;
    flash.send(io._getUrlForSend(), {id:self._uid, uid:self._uid, method:c.type, data:c.hasContent && c.data || {}})
  }, abort:function() {
    flash.abort(this._uid)
  }, _xdrResponse:function(e, o) {
    var self = this, ret, id = o.id, responseText, c = o.c, io = self.io;
    if(c && (responseText = c.responseText)) {
      io.responseText = decodeURI(responseText)
    }
    switch(e) {
      case "success":
        ret = {status:200, statusText:"success"};
        delete maps[id];
        break;
      case "abort":
        delete maps[id];
        break;
      case "timeout":
      ;
      case "transport error":
      ;
      case "failure":
        delete maps[id];
        ret = {status:"status" in c ? c.status : 500, statusText:c.statusText || e};
        break
    }
    if(ret) {
      io._ioReady(ret.status, ret.statusText)
    }
  }});
  IO.applyTo = function(_, cmd, args) {
    var cmds = cmd.split(".").slice(1), func = IO;
    S.each(cmds, function(c) {
      func = func[c]
    });
    func.apply(null, args)
  };
  IO.xdrReady = function() {
    flash = doc.getElementById(ID)
  };
  IO.xdrResponse = function(e, o) {
    var xhr = maps[o.uid];
    if(xhr) {
      xhr._xdrResponse(e, o)
    }
  };
  return XdrFlashTransport
});
KISSY.add("io/sub-domain-transport", ["event/dom", "dom", "./xhr-transport-base"], function(S, require) {
  var Event = require("event/dom"), Dom = require("dom"), XhrTransportBase = require("./xhr-transport-base");
  var logger = S.getLogger("s/io");
  var PROXY_PAGE = "/sub_domain_proxy.html", doc = S.Env.host.document, iframeMap = {};
  function SubDomainTransport(io) {
    var self = this, c = io.config;
    self.io = io;
    c.crossDomain = false;
    logger.info("use SubDomainTransport for: " + c.url)
  }
  S.augment(SubDomainTransport, XhrTransportBase.proto, {send:function() {
    var self = this, c = self.io.config, uri = c.uri, hostname = uri.getHostname(), iframe, iframeUri, iframeDesc = iframeMap[hostname];
    var proxy = PROXY_PAGE;
    if(c.xdr && c.xdr.subDomain && c.xdr.subDomain.proxy) {
      proxy = c.xdr.subDomain.proxy
    }
    if(iframeDesc && iframeDesc.ready) {
      self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
      if(self.nativeXhr) {
        self.sendInternal()
      }else {
        S.error("document.domain not set correctly!")
      }
      return
    }
    if(!iframeDesc) {
      iframeDesc = iframeMap[hostname] = {};
      iframe = iframeDesc.iframe = doc.createElement("iframe");
      Dom.css(iframe, {position:"absolute", left:"-9999px", top:"-9999px"});
      Dom.prepend(iframe, doc.body || doc.documentElement);
      iframeUri = new S.Uri;
      iframeUri.setScheme(uri.getScheme());
      iframeUri.setPort(uri.getPort());
      iframeUri.setHostname(hostname);
      iframeUri.setPath(proxy);
      iframe.src = iframeUri.toString()
    }else {
      iframe = iframeDesc.iframe
    }
    Event.on(iframe, "load", _onLoad, self)
  }});
  function _onLoad() {
    var self = this, c = self.io.config, uri = c.uri, hostname = uri.getHostname(), iframeDesc = iframeMap[hostname];
    iframeDesc.ready = 1;
    Event.detach(iframeDesc.iframe, "load", _onLoad, self);
    self.send()
  }
  return SubDomainTransport
});
KISSY.add("io/xhr-transport", ["./base", "./xhr-transport-base", "./xdr-flash-transport", "./sub-domain-transport"], function(S, require) {
  var IO = require("./base"), XhrTransportBase = require("./xhr-transport-base"), XdrFlashTransport = require("./xdr-flash-transport"), SubDomainTransport = require("./sub-domain-transport");
  var logger = S.getLogger("s/io");
  var win = S.Env.host, doc = win.document, XDomainRequest_ = XhrTransportBase.XDomainRequest_;
  function isSubDomain(hostname) {
    return doc.domain && S.endsWith(hostname, doc.domain)
  }
  function XhrTransport(io) {
    var c = io.config, crossDomain = c.crossDomain, self = this, xhr, xdrCfg = c.xdr || {}, subDomain = xdrCfg.subDomain = xdrCfg.subDomain || {};
    self.io = io;
    if(crossDomain && !XhrTransportBase.supportCORS) {
      if(isSubDomain(c.uri.getHostname())) {
        if(subDomain.proxy !== false) {
          return new SubDomainTransport(io)
        }
      }
      if(String(xdrCfg.use) === "flash" || !XDomainRequest_) {
        return new XdrFlashTransport(io)
      }
    }
    xhr = self.nativeXhr = XhrTransportBase.nativeXhr(crossDomain);
    var msg = "crossDomain: " + crossDomain + ", use " + (XDomainRequest_ && xhr instanceof XDomainRequest_ ? "XDomainRequest" : "XhrTransport") + " for: " + c.url;
    logger.debug(msg);
    return self
  }
  S.augment(XhrTransport, XhrTransportBase.proto, {send:function() {
    this.sendInternal()
  }});
  IO.setupTransport("*", XhrTransport);
  return IO
});
KISSY.add("io/script-transport", ["./base"], function(S, require) {
  var IO = require("./base");
  var logger = S.getLogger("s/io");
  var OK_CODE = 200, ERROR_CODE = 500;
  IO.setupConfig({accepts:{script:"text/javascript, " + "application/javascript, " + "application/ecmascript, " + "application/x-ecmascript"}, contents:{script:/javascript|ecmascript/}, converters:{text:{script:function(text) {
    S.globalEval(text);
    return text
  }}}});
  function ScriptTransport(io) {
    var config = io.config, self = this;
    if(!config.crossDomain) {
      return new (IO.getTransport("*"))(io)
    }
    self.io = io;
    logger.info("use ScriptTransport for: " + config.url);
    return self
  }
  S.augment(ScriptTransport, {send:function() {
    var self = this, io = self.io, c = io.config;
    self.script = S.getScript(io._getUrlForSend(), {charset:c.scriptCharset, success:function() {
      self._callback("success")
    }, error:function() {
      self._callback("error")
    }})
  }, _callback:function(event, abort) {
    var self = this, script = self.script, io = self.io;
    if(!script) {
      return
    }
    self.script = undefined;
    if(abort) {
      return
    }
    if(event !== "error") {
      io._ioReady(OK_CODE, "success")
    }else {
      if(event === "error") {
        io._ioReady(ERROR_CODE, "script error")
      }
    }
  }, abort:function() {
    this._callback(0, 1)
  }});
  IO.setupTransport("script", ScriptTransport);
  return IO
});
KISSY.add("io/jsonp", ["./base"], function(S, require) {
  var IO = require("./base");
  var win = S.Env.host;
  IO.setupConfig({jsonp:"callback", jsonpCallback:function() {
    return S.guid("jsonp")
  }});
  IO.on("start", function(e) {
    var io = e.io, c = io.config, dataType = c.dataType;
    if(dataType[0] === "jsonp") {
      delete c.contentType;
      var response, cJsonpCallback = c.jsonpCallback, converters, jsonpCallback = typeof cJsonpCallback === "function" ? cJsonpCallback() : cJsonpCallback, previous = win[jsonpCallback];
      c.uri.query.set(c.jsonp, jsonpCallback);
      win[jsonpCallback] = function(r) {
        if(arguments.length > 1) {
          r = S.makeArray(arguments)
        }
        response = [r]
      };
      io.fin(function() {
        win[jsonpCallback] = previous;
        if(previous === undefined) {
          try {
            delete win[jsonpCallback]
          }catch(e) {
          }
        }else {
          if(response) {
            previous(response[0])
          }
        }
      });
      converters = c.converters;
      converters.script = converters.script || {};
      converters.script.json = function() {
        if(!response) {
          throw new Error("not call jsonpCallback: " + jsonpCallback);
        }
        return response[0]
      };
      dataType.length = 2;
      dataType[0] = "script";
      dataType[1] = "json"
    }
  });
  return IO
});
KISSY.add("io/form", ["./base", "dom", "./form-serializer"], function(S, require) {
  var IO = require("./base");
  var Dom = require("dom");
  var FormSerializer = require("./form-serializer");
  var win = S.Env.host, slice = Array.prototype.slice, FormData = win.FormData;
  IO.on("start", function(e) {
    var io = e.io, form, d, dataType, formParam, data, c = io.config, tmpForm = c.form;
    if(tmpForm) {
      form = Dom.get(tmpForm);
      data = c.data;
      var isUpload = false;
      var files = {};
      var inputs = Dom.query("input", form);
      for(var i = 0, l = inputs.length;i < l;i++) {
        var input = inputs[i];
        if(input.type.toLowerCase() === "file") {
          isUpload = true;
          if(!FormData) {
            break
          }
          var selected = slice.call(input.files, 0);
          files[Dom.attr(input, "name")] = selected.length > 1 ? selected : selected[0] || null
        }
      }
      if(isUpload && FormData) {
        c.files = c.files || {};
        S.mix(c.files, files);
        delete c.contentType
      }
      if(!isUpload || FormData) {
        formParam = FormSerializer.getFormData(form);
        if(c.hasContent) {
          formParam = S.param(formParam, undefined, undefined, c.serializeArray);
          if(data) {
            c.data += "&" + formParam
          }else {
            c.data = formParam
          }
        }else {
          c.uri.query.add(formParam)
        }
      }else {
        dataType = c.dataType;
        d = dataType[0];
        if(d === "*") {
          d = "text"
        }
        dataType.length = 2;
        dataType[0] = "iframe";
        dataType[1] = d
      }
    }
  });
  return IO
});
KISSY.add("io/iframe-transport", ["dom", "./base", "event/dom"], function(S, require) {
  var Dom = require("dom"), IO = require("./base"), Event = require("event/dom");
  var logger = S.getLogger("s/io");
  var doc = S.Env.host.document, OK_CODE = 200, ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = S.clone(IO.getConfig().converters.text);
  iframeConverter.json = function(str) {
    return S.parseJson(S.unEscapeHtml(str))
  };
  IO.setupConfig({converters:{iframe:iframeConverter, text:{iframe:function(text) {
    return text
  }}, xml:{iframe:function(xml) {
    return xml
  }}}});
  function createIframe(xhr) {
    var id = S.guid("io-iframe"), iframe, src = Dom.getEmptyIframeSrc();
    iframe = xhr.iframe = Dom.create("<iframe " + (src ? ' src="' + src + '" ' : "") + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    Dom.prepend(iframe, doc.body || doc.documentElement);
    return iframe
  }
  function addDataToForm(query, form, serializeArray) {
    var ret = [], isArray, vs, i, e;
    S.each(query, function(data, k) {
      isArray = S.isArray(data);
      vs = S.makeArray(data);
      for(i = 0;i < vs.length;i++) {
        e = doc.createElement("input");
        e.type = "hidden";
        e.name = k + (isArray && serializeArray ? "[]" : "");
        e.value = vs[i];
        Dom.append(e, form);
        ret.push(e)
      }
    });
    return ret
  }
  function removeFieldsFromData(fields) {
    Dom.remove(fields)
  }
  function IframeTransport(io) {
    this.io = io;
    logger.info("use IframeTransport for: " + io.config.url)
  }
  S.augment(IframeTransport, {send:function() {
    var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
    self.attrs = {target:Dom.attr(form, "target") || "", action:Dom.attr(form, "action") || "", encoding:Dom.attr(form, "encoding"), enctype:Dom.attr(form, "enctype"), method:Dom.attr(form, "method")};
    self.form = form;
    iframe = createIframe(io);
    Dom.attr(form, {target:iframe.id, action:io._getUrlForSend(), method:"post", enctype:"multipart/form-data", encoding:"multipart/form-data"});
    if(data) {
      query = S.unparam(data)
    }
    if(query) {
      fields = addDataToForm(query, form, c.serializeArray)
    }
    self.fields = fields;
    function go() {
      Event.on(iframe, "load error", self._callback, self);
      form.submit()
    }
    if(S.UA.ie === 6) {
      setTimeout(go, 0)
    }else {
      go()
    }
  }, _callback:function(event) {
    var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
    if(!iframe) {
      return
    }
    if(eventType === "abort" && S.UA.ie === 6) {
      setTimeout(function() {
        Dom.attr(form, self.attrs)
      }, 0)
    }else {
      Dom.attr(form, self.attrs)
    }
    removeFieldsFromData(this.fields);
    Event.detach(iframe);
    setTimeout(function() {
      Dom.remove(iframe)
    }, BREATH_INTERVAL);
    io.iframe = null;
    if(eventType === "load") {
      try {
        iframeDoc = iframe.contentWindow.document;
        if(iframeDoc && iframeDoc.body) {
          io.responseText = Dom.html(iframeDoc.body);
          if(S.startsWith(io.responseText, "<?xml")) {
            io.responseText = undefined
          }
        }
        if(iframeDoc && iframeDoc.XMLDocument) {
          io.responseXML = iframeDoc.XMLDocument
        }else {
          io.responseXML = iframeDoc
        }
        if(iframeDoc) {
          io._ioReady(OK_CODE, "success")
        }else {
          io._ioReady(ERROR_CODE, "parser error")
        }
      }catch(e) {
        io._ioReady(ERROR_CODE, "parser error")
      }
    }else {
      if(eventType === "error") {
        io._ioReady(ERROR_CODE, "error")
      }
    }
  }, abort:function() {
    this._callback({type:"abort"})
  }});
  IO.setupTransport("iframe", IframeTransport);
  return IO
});
KISSY.add("io/methods", ["promise", "./base"], function(S, require) {
  var Promise = require("promise"), IO = require("./base");
  var OK_CODE = 200, MULTIPLE_CHOICES = 300, NOT_MODIFIED = 304, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  function handleResponseData(io) {
    var text = io.responseText, xml = io.responseXML, c = io.config, converts = c.converters, type, contentType, responseData, contents = c.contents, dataType = c.dataType;
    if(text || xml) {
      contentType = io.mimeType || io.getResponseHeader("Content-Type");
      while(dataType[0] === "*") {
        dataType.shift()
      }
      if(!dataType.length) {
        for(type in contents) {
          if(contents[type].test(contentType)) {
            if(dataType[0] !== type) {
              dataType.unshift(type)
            }
            break
          }
        }
      }
      dataType[0] = dataType[0] || "text";
      for(var dataTypeIndex = 0;dataTypeIndex < dataType.length;dataTypeIndex++) {
        if(dataType[dataTypeIndex] === "text" && text !== undefined) {
          responseData = text;
          break
        }else {
          if(dataType[dataTypeIndex] === "xml" && xml !== undefined) {
            responseData = xml;
            break
          }
        }
      }
      if(!responseData) {
        var rawData = {text:text, xml:xml};
        S.each(["text", "xml"], function(prevType) {
          var type = dataType[0], converter = converts[prevType] && converts[prevType][type];
          if(converter && rawData[prevType]) {
            dataType.unshift(prevType);
            responseData = prevType === "text" ? text : xml;
            return false
          }
          return undefined
        })
      }
    }
    var prevType = dataType[0];
    for(var i = 1;i < dataType.length;i++) {
      type = dataType[i];
      var converter = converts[prevType] && converts[prevType][type];
      if(!converter) {
        throw new Error("no covert for " + prevType + " => " + type);
      }
      responseData = converter(responseData);
      prevType = type
    }
    io.responseData = responseData
  }
  S.extend(IO, Promise, {setRequestHeader:function(name, value) {
    var self = this;
    self.requestHeaders[name] = value;
    return self
  }, getAllResponseHeaders:function() {
    var self = this;
    return self.state === 2 ? self.responseHeadersString : null
  }, getResponseHeader:function(name) {
    var match, self = this, responseHeaders;
    name = name.toLowerCase();
    if(self.state === 2) {
      if(!(responseHeaders = self.responseHeaders)) {
        responseHeaders = self.responseHeaders = {};
        while(match = rheaders.exec(self.responseHeadersString)) {
          responseHeaders[match[1].toLowerCase()] = match[2]
        }
      }
      match = responseHeaders[name]
    }
    return match === undefined ? null : match
  }, overrideMimeType:function(type) {
    var self = this;
    if(!self.state) {
      self.mimeType = type
    }
    return self
  }, abort:function(statusText) {
    var self = this;
    statusText = statusText || "abort";
    if(self.transport) {
      self.transport.abort(statusText)
    }
    self._ioReady(0, statusText);
    return self
  }, getNativeXhr:function() {
    var transport = this.transport;
    if(transport) {
      return transport.nativeXhr
    }
    return null
  }, _ioReady:function(status, statusText) {
    var self = this;
    if(self.state === 2) {
      return
    }
    self.state = 2;
    self.readyState = 4;
    var isSuccess;
    if(status >= OK_CODE && status < MULTIPLE_CHOICES || status === NOT_MODIFIED) {
      if(status === NOT_MODIFIED) {
        statusText = "not modified";
        isSuccess = true
      }else {
        try {
          handleResponseData(self);
          statusText = "success";
          isSuccess = true
        }catch(e) {
          S.log(e.stack || e, "error");
          if("@DEBUG@") {
            setTimeout(function() {
              throw e;
            }, 0)
          }
          statusText = e.message || "parser error"
        }
      }
    }else {
      if(status < 0) {
        status = 0
      }
    }
    self.status = status;
    self.statusText = statusText;
    var defer = self.defer, config = self.config, timeoutTimer;
    if(timeoutTimer = self.timeoutTimer) {
      clearTimeout(timeoutTimer);
      self.timeoutTimer = 0
    }
    var handler = isSuccess ? "success" : "error", h, v = [self.responseData, statusText, self], context = config.context, eventObject = {ajaxConfig:config, io:self};
    if(h = config[handler]) {
      h.apply(context, v)
    }
    if(h = config.complete) {
      h.apply(context, v)
    }
    IO.fire(handler, eventObject);
    IO.fire("complete", eventObject);
    defer[isSuccess ? "resolve" : "reject"](v)
  }, _getUrlForSend:function() {
    var c = this.config, uri = c.uri, originalQuery = S.Uri.getComponents(c.url).query || "", url = uri.toString.call(uri, c.serializeArray);
    return url + (originalQuery ? (uri.query.has() ? "&" : "?") + originalQuery : originalQuery)
  }})
});
KISSY.add("io", ["io/form-serializer", "io/base", "io/xhr-transport", "io/script-transport", "io/jsonp", "io/form", "io/iframe-transport", "io/methods"], function(S, require) {
  var serializer = require("io/form-serializer"), IO = require("io/base");
  require("io/xhr-transport");
  require("io/script-transport");
  require("io/jsonp");
  require("io/form");
  require("io/iframe-transport");
  require("io/methods");
  function get(url, data, callback, dataType, type) {
    if(typeof data === "function") {
      dataType = callback;
      callback = data;
      data = undefined
    }
    return IO({type:type || "get", url:url, data:data, success:callback, dataType:dataType})
  }
  S.mix(IO, {serialize:serializer.serialize, get:get, post:function(url, data, callback, dataType) {
    if(typeof data === "function") {
      dataType = callback;
      callback = data;
      data = undefined
    }
    return get(url, data, callback, dataType, "post")
  }, jsonp:function(url, data, callback) {
    if(typeof data === "function") {
      callback = data;
      data = undefined
    }
    return get(url, data, callback, "jsonp")
  }, getScript:S.getScript, getJSON:function(url, data, callback) {
    if(typeof data === "function") {
      callback = data;
      data = undefined
    }
    return get(url, data, callback, "json")
  }, upload:function(url, form, data, callback, dataType) {
    if(typeof data === "function") {
      dataType = callback;
      callback = data;
      data = undefined
    }
    return IO({url:url, type:"post", dataType:dataType, form:form, data:data, success:callback})
  }});
  S.mix(S, {Ajax:IO, IO:IO, ajax:IO, io:IO, jsonp:IO.jsonp});
  return IO
});

