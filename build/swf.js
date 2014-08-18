/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: Jul 23 14:31
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 swf/ua
 swf
*/

KISSY.add("swf/ua", [], function(S) {
  var fpvCached, firstRun = true, win = S.Env.host;
  function getFlashVersion() {
    var ver, SF = "ShockwaveFlash";
    if(navigator.plugins && navigator.mimeTypes.length) {
      ver = (navigator.plugins["Shockwave Flash"] || 0).description
    }else {
      try {
        ver = (new win.ActiveXObject(SF + "." + SF)).GetVariable("$version")
      }catch(ex) {
      }
    }
    if(!ver) {
      return undefined
    }
    return getArrayVersion(ver)
  }
  function getArrayVersion(ver) {
    return ver.match(/\d+/g).splice(0, 3)
  }
  function getNumberVersion(ver) {
    var arr = typeof ver === "string" ? getArrayVersion(ver) : ver, ret = ver;
    if(S.isArray(arr)) {
      ret = parseFloat(arr[0] + "." + pad(arr[1], 3) + pad(arr[2], 5))
    }
    return ret || 0
  }
  function pad(num, n) {
    num = num || 0;
    num += "";
    var padding = n + 1 - num.length;
    return(new Array(padding > 0 ? padding : 0)).join("0") + num
  }
  function fpv(force) {
    if(force || firstRun) {
      firstRun = false;
      fpvCached = getFlashVersion()
    }
    return fpvCached
  }
  function fpvGTE(ver, force) {
    return getNumberVersion(fpv(force)) >= getNumberVersion(ver)
  }
  return{fpv:fpv, fpvGTE:fpvGTE}
});
KISSY.add("swf", ["dom", "json", "attribute", "swf/ua"], function(S, require) {
  var Dom = require("dom");
  var Json = require("json");
  var Attribute = require("attribute");
  var FlashUA = require("swf/ua");
  var OLD_IE = !!S.Env.host.ActiveXObject, TYPE = "application/x-shockwave-flash", CID = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000", FLASHVARS = "flashvars", EMPTY = "", LT = "<", GT = ">", doc = S.Env.host.document, fpv = FlashUA.fpv, fpvGEQ = FlashUA.fpvGEQ, fpvGTE = FlashUA.fpvGTE, OBJECT_TAG = "object", encode = encodeURIComponent, PARAMS = {wmode:EMPTY, allowscriptaccess:EMPTY, allownetworking:EMPTY, allowfullscreen:EMPTY, play:"false", loop:EMPTY, menu:EMPTY, quality:EMPTY, scale:EMPTY, salign:EMPTY, 
  bgcolor:EMPTY, devicefont:EMPTY, hasPriority:EMPTY, base:EMPTY, swliveconnect:EMPTY, seamlesstabbing:EMPTY};
  var SWF;
  SWF = Attribute.extend({constructor:function(config) {
    var self = this;
    self.callSuper(config);
    var expressInstall = self.get("expressInstall"), swf, html, id, htmlMode = self.get("htmlMode"), flashVars, params = self.get("params"), attrs = self.get("attrs"), doc = self.get("document"), placeHolder = Dom.create("<span>", undefined, doc), elBefore = self.get("elBefore"), installedSrc = self.get("src"), version = self.get("version");
    id = attrs.id = attrs.id || S.guid("ks-swf-");
    if(!fpv()) {
      self.set("status", SWF.Status.NOT_INSTALLED);
      return
    }
    if(version && !fpvGTE(version)) {
      self.set("status", SWF.Status.TOO_LOW);
      if(expressInstall) {
        installedSrc = expressInstall;
        if(!("width" in attrs) || !/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310) {
          attrs.width = "310"
        }
        if(!("height" in attrs) || !/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137) {
          attrs.height = "137"
        }
        flashVars = params.flashVars = params.flashVars || {};
        S.mix(flashVars, {MMredirectURL:location.href, MMplayerType:OLD_IE ? "ActiveX" : "PlugIn", MMdoctitle:doc.title.slice(0, 47) + " - Flash Player Installation"})
      }
    }
    if(htmlMode === "full") {
      html = _stringSWFFull(installedSrc, attrs, params)
    }else {
      html = _stringSWFDefault(installedSrc, attrs, params)
    }
    self.set("html", html);
    if(elBefore) {
      Dom.insertBefore(placeHolder, elBefore)
    }else {
      Dom.append(placeHolder, self.get("render"))
    }
    if("outerHTML" in placeHolder) {
      placeHolder.outerHTML = html
    }else {
      placeHolder.parentNode.replaceChild(Dom.create(html), placeHolder)
    }
    swf = Dom.get("#" + id, doc);
    if(htmlMode === "full") {
      if(OLD_IE) {
        self.set("swfObject", swf)
      }else {
        self.set("swfObject", swf.parentNode)
      }
    }else {
      self.set("swfObject", swf)
    }
    self.set("el", swf);
    if(!self.get("status")) {
      self.set("status", SWF.Status.SUCCESS)
    }
  }, callSWF:function(func, args) {
    var swf = this.get("el"), ret, params;
    args = args || [];
    try {
      if(swf[func]) {
        ret = swf[func].apply(swf, args)
      }
    }catch(e) {
      params = "";
      if(args.length !== 0) {
        params = '"' + args.join('", "') + '"'
      }
      ret = (new Function("swf", "return swf." + func + "(" + params + ");"))(swf)
    }
    return ret
  }, destroy:function() {
    var self = this;
    var swfObject = self.get("swfObject");
    if(OLD_IE) {
      swfObject.style.display = "none";
      (function remove() {
        if(swfObject.readyState === 4) {
          removeObjectInIE(swfObject)
        }else {
          setTimeout(remove, 10)
        }
      })()
    }else {
      swfObject.parentNode.removeChild(swfObject)
    }
  }}, {ATTRS:{expressInstall:{value:S.config("base") + "swf/assets/expressInstall.swf"}, src:{}, version:{value:"9"}, params:{value:{}}, attrs:{value:{}}, render:{setter:function(v) {
    if(typeof v === "string") {
      v = Dom.get(v, this.get("document"))
    }
    return v
  }, valueFn:function() {
    return document.body
  }}, elBefore:{setter:function(v) {
    if(typeof v === "string") {
      v = Dom.get(v, this.get("document"))
    }
    return v
  }}, document:{value:doc}, status:{}, el:{}, swfObject:{}, html:{}, htmlMode:{value:"default"}}, getSrc:function(swf) {
    swf = Dom.get(swf);
    var srcElement = getSrcElements(swf)[0], nodeName = srcElement && Dom.nodeName(srcElement);
    if(nodeName === "embed") {
      return Dom.attr(srcElement, "src")
    }else {
      if(nodeName === "object") {
        return Dom.attr(srcElement, "data")
      }else {
        if(nodeName === "param") {
          return Dom.attr(srcElement, "value")
        }
      }
    }
    return null
  }, Status:{TOO_LOW:"flash version is too low", NOT_INSTALLED:"flash is not installed", SUCCESS:"success"}, HtmlMode:{DEFAULT:"default", FULL:"full"}, fpv:fpv, fpvGEQ:fpvGEQ, fpvGTE:fpvGTE});
  function removeObjectInIE(obj) {
    for(var i in obj) {
      if(typeof obj[i] === "function") {
        obj[i] = null
      }
    }
    obj.parentNode.removeChild(obj)
  }
  function getSrcElements(swf) {
    var url = "", params, i, param, elements = [], nodeName = Dom.nodeName(swf);
    if(nodeName === "object") {
      url = Dom.attr(swf, "data");
      if(url) {
        elements.push(swf)
      }
      params = swf.childNodes;
      for(i = 0;i < params.length;i++) {
        param = params[i];
        if(param.nodeType === 1) {
          if((Dom.attr(param, "name") || "").toLowerCase() === "movie") {
            elements.push(param)
          }else {
            if(Dom.nodeName(param) === "embed") {
              elements.push(param)
            }else {
              if(Dom.nodeName(params[i]) === "object") {
                elements.push(param)
              }
            }
          }
        }
      }
    }else {
      if(nodeName === "embed") {
        elements.push(swf)
      }
    }
    return elements
  }
  function collectionParams(params) {
    var par = EMPTY;
    S.each(params, function(v, k) {
      k = k.toLowerCase();
      if(k in PARAMS) {
        par += stringParam(k, v)
      }else {
        if(k === FLASHVARS) {
          par += stringParam(k, toFlashVars(v))
        }
      }
    });
    return par
  }
  function _stringSWFDefault(src, attrs, params) {
    return _stringSWF(src, attrs, params, OLD_IE) + LT + "/" + OBJECT_TAG + GT
  }
  function _stringSWF(src, attrs, params, ie) {
    var res, attr = EMPTY, par = EMPTY;
    S.each(attrs, function(v, k) {
      attr += stringAttr(k, v)
    });
    if(ie) {
      attr += stringAttr("classid", CID);
      par += stringParam("movie", src)
    }else {
      attr += stringAttr("data", src);
      attr += stringAttr("type", TYPE)
    }
    par += collectionParams(params);
    res = LT + OBJECT_TAG + attr + GT + par;
    return res
  }
  function _stringSWFFull(src, attrs, params) {
    var outside, inside;
    if(OLD_IE) {
      outside = _stringSWF(src, attrs, params, 1);
      delete attrs.id;
      delete attrs.style;
      inside = _stringSWF(src, attrs, params, 0)
    }else {
      inside = _stringSWF(src, attrs, params, 0);
      delete attrs.id;
      delete attrs.style;
      outside = _stringSWF(src, attrs, params, 1)
    }
    return outside + inside + LT + "/" + OBJECT_TAG + GT + LT + "/" + OBJECT_TAG + GT
  }
  function toFlashVars(obj) {
    var arr = [], ret;
    S.each(obj, function(data, prop) {
      if(typeof data !== "string") {
        data = Json.stringify(data)
      }
      if(data) {
        arr.push(prop + "=" + encode(data))
      }
    });
    ret = arr.join("&");
    return ret
  }
  function stringParam(key, value) {
    return'<param name="' + key + '" value="' + value + '"></param>'
  }
  function stringAttr(key, value) {
    return" " + key + "=" + '"' + value + '"'
  }
  return SWF
});

