/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 ua
*/

KISSY.add("ua", [], function(S, undefined) {
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = navigator && navigator.userAgent || "";
  function numberify(s) {
    var c = 0;
    return parseFloat(s.replace(/\./g, function() {
      return c++ === 0 ? "." : ""
    }))
  }
  function setTridentVersion(ua, UA) {
    var core, m;
    UA[core = "trident"] = 0.1;
    if((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
      UA[core] = numberify(m[1])
    }
    UA.core = core
  }
  function getIEVersion(ua) {
    var m, v;
    if((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = m[1] || m[2])) {
      return numberify(v)
    }
    return 0
  }
  function getDescriptorFromUserAgent(ua) {
    var EMPTY = "", os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = "{{version}}", IE_DETECT_TPL = "<!--[if IE " + VERSION_PLACEHOLDER + "]><" + "s></s><![endif]--\>", div = doc && doc.createElement("div"), s = [];
    var UA = {webkit:undefined, trident:undefined, gecko:undefined, presto:undefined, chrome:undefined, safari:undefined, firefox:undefined, ie:undefined, ieMode:undefined, opera:undefined, mobile:undefined, core:undefined, shell:undefined, phantomjs:undefined, os:undefined, ipad:undefined, iphone:undefined, ipod:undefined, ios:undefined, android:undefined, nodejs:undefined};
    if(div && div.getElementsByTagName) {
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, "");
      s = div.getElementsByTagName("s")
    }
    if(s.length > 0) {
      setTridentVersion(ua, UA);
      for(v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1];v <= end;v++) {
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        if(s.length > 0) {
          UA[shell = "ie"] = v;
          break
        }
      }
      if(!UA.ie && (ieVersion = getIEVersion(ua))) {
        UA[shell = "ie"] = ieVersion
      }
    }else {
      if(((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/))) && m[1]) {
        UA[core = "webkit"] = numberify(m[1]);
        if((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1]) {
          UA[shell = "opera"] = numberify(m[1])
        }else {
          if((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            UA[shell = "chrome"] = numberify(m[1])
          }else {
            if((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
              UA[shell = "safari"] = numberify(m[1])
            }else {
              UA.safari = UA.webkit
            }
          }
        }
        if(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
          UA.mobile = "apple";
          m = ua.match(/OS ([^\s]*)/);
          if(m && m[1]) {
            UA.ios = numberify(m[1].replace("_", "."))
          }
          os = "ios";
          m = ua.match(/iPad|iPod|iPhone/);
          if(m && m[0]) {
            UA[m[0].toLowerCase()] = UA.ios
          }
        }else {
          if(/ Android/i.test(ua)) {
            if(/Mobile/.test(ua)) {
              os = UA.mobile = "android"
            }
            m = ua.match(/Android ([^\s]*);/);
            if(m && m[1]) {
              UA.android = numberify(m[1])
            }
          }else {
            if(m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/)) {
              UA.mobile = m[0].toLowerCase()
            }
          }
        }
        if((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
          UA.phantomjs = numberify(m[1])
        }
      }else {
        if((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
          UA[core = "presto"] = numberify(m[1]);
          if((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
            UA[shell = "opera"] = numberify(m[1]);
            if((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
              UA[shell] = numberify(m[1])
            }
            if((m = ua.match(/Opera Mini[^;]*/)) && m) {
              UA.mobile = m[0].toLowerCase()
            }else {
              if((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                UA.mobile = m[0]
              }
            }
          }
        }else {
          if(ieVersion = getIEVersion(ua)) {
            UA[shell = "ie"] = ieVersion;
            setTridentVersion(ua, UA)
          }else {
            if(m = ua.match(/Gecko/)) {
              UA[core = "gecko"] = 0.1;
              if((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                UA[core] = numberify(m[1]);
                if(/Mobile|Tablet/.test(ua)) {
                  UA.mobile = "firefox"
                }
              }
              if((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                UA[shell = "firefox"] = numberify(m[1])
              }
            }
          }
        }
      }
    }
    if(!os) {
      if(/windows|win32/i.test(ua)) {
        os = "windows"
      }else {
        if(/macintosh|mac_powerpc/i.test(ua)) {
          os = "macintosh"
        }else {
          if(/linux/i.test(ua)) {
            os = "linux"
          }else {
            if(/rhino/i.test(ua)) {
              os = "rhino"
            }
          }
        }
      }
    }
    UA.os = os;
    UA.core = UA.core || core;
    UA.shell = shell;
    UA.ieMode = UA.ie && doc.documentMode || UA.ie;
    return UA
  }
  var UA = S.UA = getDescriptorFromUserAgent(ua);
  if(typeof process === "object") {
    var versions, nodeVersion;
    if((versions = process.versions) && (nodeVersion = versions.node)) {
      UA.os = process.platform;
      UA.nodejs = numberify(nodeVersion)
    }
  }
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  var browsers = ["webkit", "trident", "gecko", "presto", "chrome", "safari", "firefox", "ie", "opera"], documentElement = doc && doc.documentElement, className = "";
  if(documentElement) {
    S.each(browsers, function(key) {
      var v = UA[key];
      if(v) {
        className += " ks-" + key + (parseInt(v, 10) + "");
        className += " ks-" + key
      }
    });
    if(S.trim(className)) {
      documentElement.className = S.trim(documentElement.className + className)
    }
  }
  return UA
});

