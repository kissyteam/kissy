/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/dom/ie/change
 event/dom/ie/submit
 event/dom/ie
*/

KISSY.add("event/dom/ie/change", ["event/dom/base", "dom"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Dom = require("dom");
  var Special = DomEvent.Special, R_FORM_EL = /^(?:textarea|input|select)$/i;
  function isFormElement(n) {
    return R_FORM_EL.test(n.nodeName)
  }
  function isCheckBoxOrRadio(el) {
    var type = el.type;
    return type === "checkbox" || type === "radio"
  }
  Special.change = {setup:function() {
    var el = this;
    if(isFormElement(el)) {
      if(isCheckBoxOrRadio(el)) {
        DomEvent.on(el, "propertychange", propertyChange);
        DomEvent.on(el, "click", onClick)
      }else {
        return false
      }
    }else {
      DomEvent.on(el, "beforeactivate", beforeActivate)
    }
  }, tearDown:function() {
    var el = this;
    if(isFormElement(el)) {
      if(isCheckBoxOrRadio(el)) {
        DomEvent.remove(el, "propertychange", propertyChange);
        DomEvent.remove(el, "click", onClick)
      }else {
        return false
      }
    }else {
      DomEvent.remove(el, "beforeactivate", beforeActivate);
      S.each(Dom.query("textarea,input,select", el), function(fel) {
        if(fel.__changeHandler) {
          fel.__changeHandler = 0;
          DomEvent.remove(fel, "change", {fn:changeHandler, last:1})
        }
      })
    }
  }};
  function propertyChange(e) {
    if(e.originalEvent.propertyName === "checked") {
      this.__changed = 1
    }
  }
  function onClick(e) {
    if(this.__changed) {
      this.__changed = 0;
      DomEvent.fire(this, "change", e)
    }
  }
  function beforeActivate(e) {
    var t = e.target;
    if(isFormElement(t) && !t.__changeHandler) {
      t.__changeHandler = 1;
      DomEvent.on(t, "change", {fn:changeHandler, last:1})
    }
  }
  function changeHandler(e) {
    var fel = this;
    if(e.isPropagationStopped() || isCheckBoxOrRadio(fel)) {
      return
    }
    var p;
    if(p = fel.parentNode) {
      DomEvent.fire(p, "change", e)
    }
  }
});
KISSY.add("event/dom/ie/submit", ["event/dom/base", "dom"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Dom = require("dom");
  var Special = DomEvent.Special, getNodeName = Dom.nodeName;
  Special.submit = {setup:function() {
    var el = this;
    if(getNodeName(el) === "form") {
      return false
    }
    DomEvent.on(el, "click keypress", detector)
  }, tearDown:function() {
    var el = this;
    if(getNodeName(el) === "form") {
      return false
    }
    DomEvent.remove(el, "click keypress", detector);
    S.each(Dom.query("form", el), function(form) {
      if(form.__submitFix) {
        form.__submitFix = 0;
        DomEvent.remove(form, "submit", {fn:submitBubble, last:1})
      }
    })
  }};
  function detector(e) {
    var t = e.target, nodeName = getNodeName(t), form = nodeName === "input" || nodeName === "button" ? t.form : null;
    if(form && !form.__submitFix) {
      form.__submitFix = 1;
      DomEvent.on(form, "submit", {fn:submitBubble, last:1})
    }
  }
  function submitBubble(e) {
    var form = this;
    if(form.parentNode && !e.isPropagationStopped() && !e.synthetic) {
      DomEvent.fire(form.parentNode, "submit", e)
    }
  }
});
KISSY.add("event/dom/ie", ["./ie/change", "./ie/submit"], function(S, require) {
  require("./ie/change");
  require("./ie/submit")
});

