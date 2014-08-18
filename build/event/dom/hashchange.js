/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/dom/hashchange
*/

KISSY.add("event/dom/hashchange", ["event/dom/base", "dom"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Dom = require("dom");
  var UA = S.UA, Special = DomEvent.Special, win = S.Env.host, doc = win.document, docMode = UA.ieMode, REPLACE_HISTORY = "__replace_history_" + S.now(), ie = docMode || UA.ie, HASH_CHANGE = "hashchange";
  DomEvent.REPLACE_HISTORY = REPLACE_HISTORY;
  function getIframeDoc(iframe) {
    return iframe.contentWindow.document
  }
  var POLL_INTERVAL = 50, IFRAME_TEMPLATE = "<html><head><title>" + (doc && doc.title || "") + " - {hash}</title>{head}</head><body>{hash}</body></html>", getHash = function() {
    var uri = new S.Uri(location.href);
    return"#" + uri.getFragment()
  }, timer, lastHash, poll = function() {
    var hash = getHash(), replaceHistory;
    if(replaceHistory = S.endsWith(hash, REPLACE_HISTORY)) {
      hash = hash.slice(0, -REPLACE_HISTORY.length);
      location.hash = hash
    }
    if(hash !== lastHash) {
      lastHash = hash;
      hashChange(hash, replaceHistory)
    }
    timer = setTimeout(poll, POLL_INTERVAL)
  }, hashChange = ie && ie < 8 ? function(hash, replaceHistory) {
    var html = S.substitute(IFRAME_TEMPLATE, {hash:S.escapeHtml(hash), head:Dom.isCustomDomain() ? "<script>" + "document." + 'domain = "' + doc.domain + '";<\/script>' : ""}), iframeDoc = getIframeDoc(iframe);
    try {
      if(replaceHistory) {
        iframeDoc.open("text/html", "replace")
      }else {
        iframeDoc.open()
      }
      iframeDoc.write(html);
      iframeDoc.close()
    }catch(e) {
    }
  } : function() {
    notifyHashChange()
  }, notifyHashChange = function() {
    DomEvent.fireHandler(win, HASH_CHANGE)
  }, setup = function() {
    if(!timer) {
      poll()
    }
  }, tearDown = function() {
    if(timer) {
      clearTimeout(timer)
    }
    timer = 0
  }, iframe;
  if(ie && ie < 8) {
    setup = function() {
      if(!iframe) {
        var iframeSrc = Dom.getEmptyIframeSrc();
        iframe = Dom.create("<iframe " + (iframeSrc ? 'src="' + iframeSrc + '"' : "") + ' style="display: none" ' + 'height="0" ' + 'width="0" ' + 'tabindex="-1" ' + 'title="empty"/>');
        Dom.prepend(iframe, doc.documentElement);
        DomEvent.add(iframe, "load", function() {
          DomEvent.remove(iframe, "load");
          hashChange(getHash());
          DomEvent.add(iframe, "load", onIframeLoad);
          poll()
        });
        doc.onpropertychange = function() {
          try {
            if(event.propertyName === "title") {
              getIframeDoc(iframe).title = doc.title + " - " + getHash()
            }
          }catch(e) {
          }
        };
        var onIframeLoad = function() {
          var c = S.trim(getIframeDoc(iframe).body.innerText), ch = getHash();
          if(c !== ch) {
            location.hash = c;
            lastHash = c
          }
          notifyHashChange()
        }
      }
    };
    tearDown = function() {
      if(timer) {
        clearTimeout(timer)
      }
      timer = 0;
      DomEvent.detach(iframe);
      Dom.remove(iframe);
      iframe = 0
    }
  }
  Special[HASH_CHANGE] = {setup:function() {
    if(this !== win) {
      return
    }
    lastHash = getHash();
    setup()
  }, tearDown:function() {
    if(this !== win) {
      return
    }
    tearDown()
  }}
});

