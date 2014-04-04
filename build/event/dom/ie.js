/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Apr 4 12:22
*/
/*
 Combined modules by KISSY Module Compiler: 

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
    var self = this;
    if(isFormElement(self)) {
      if(isCheckBoxOrRadio(self)) {
        DomEvent.on(self, "propertychange", propertyChange);
        DomEvent.on(self, "click", onClick)
      }else {
        return false
      }
    }else {
      DomEvent.on(self, "beforeactivate", beforeActivate)
    }
  }, tearDown:function() {
    var self = this;
    if(isFormElement(self)) {
      if(isCheckBoxOrRadio(self)) {
        DomEvent.remove(self, "propertychange", propertyChange);
        DomEvent.remove(self, "click", onClick)
      }else {
        return false
      }
    }else {
      DomEvent.remove(self, "beforeactivate", beforeActivate);
      Dom.query("textarea,input,select", self).each(function(fel) {
        if(fel.__changeHandler) {
          fel.__changeHandler = 0;
          DomEvent.remove(fel, "change", {fn:changeHandler, last:1})
        }
      })
    }
  }};
  function propertyChange(e) {
    if(e.originalEvent.propertyName === "checked") {
      var self = this;
      self.__changed = 1;
      if(self.__changeTimer) {
        clearTimeout(self.__changeTimer)
      }
      self.__changeTimer = setTimeout(function() {
        self.__changed = 0;
        self.__changeTimer = null
      }, 50)
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
    var self = this;
    if(e.isPropagationStopped() || isCheckBoxOrRadio(self)) {
      return
    }
    var p;
    if(p = self.parentNode) {
      DomEvent.fire(p, "change", e)
    }
  }
});
KISSY.add("event/dom/ie/submit", ["event/dom/base", "dom"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Dom = require("dom");
  var Special = DomEvent.Special, getNodeName = Dom.nodeName;
  Special.submit = {setup:function() {
    var self = this;
    if(getNodeName(self) === "form") {
      return false
    }
    DomEvent.on(self, "click keypress", detector)
  }, tearDown:function() {
    var self = this;
    if(getNodeName(self) === "form") {
      return false
    }
    DomEvent.remove(self, "click keypress", detector);
    Dom.query("form", self).each(function(form) {
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
    var self = this;
    if(self.parentNode && !e.isPropagationStopped() && !e.synthetic) {
      DomEvent.fire(self.parentNode, "submit", e)
    }
  }
});
KISSY.add("event/dom/ie", ["./ie/change", "./ie/submit"], function(S, require) {
  require("./ie/change");
  require("./ie/submit")
});

