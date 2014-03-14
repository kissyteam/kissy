/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/dom/input
*/

KISSY.add("event/dom/input", ["event/dom/base", "dom"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Dom = require("dom");
  var noop = S.noop;
  var Special = DomEvent.Special;
  function canFireInput(n) {
    var nodeName = (n.nodeName || "").toLowerCase();
    if(nodeName === "textarea") {
      return true
    }else {
      if(nodeName === "input") {
        return n.type === "text" || n.type === "password"
      }
    }
    return false
  }
  var INPUT_CHANGE = "input", KEY = "event/input", HISTORY_KEY = KEY + "/history", POLL_KEY = KEY + "/poll", interval = 50;
  function clearPollTimer(target) {
    if(Dom.hasData(target, POLL_KEY)) {
      var poll = Dom.data(target, POLL_KEY);
      clearTimeout(poll);
      Dom.removeData(target, POLL_KEY)
    }
  }
  function stopPoll(target) {
    Dom.removeData(target, HISTORY_KEY);
    clearPollTimer(target)
  }
  function stopPollHandler(ev) {
    clearPollTimer(ev.target)
  }
  function checkChange(target) {
    var v = target.value, h = Dom.data(target, HISTORY_KEY);
    if(v !== h) {
      DomEvent.fire(target, INPUT_CHANGE);
      Dom.data(target, HISTORY_KEY, v)
    }
  }
  function startPoll(target) {
    if(Dom.hasData(target, POLL_KEY)) {
      return
    }
    Dom.data(target, POLL_KEY, setTimeout(function check() {
      checkChange(target);
      Dom.data(target, POLL_KEY, setTimeout(check, interval))
    }, interval))
  }
  function startPollHandler(ev) {
    var target = ev.target;
    if(ev.type === "focus") {
      Dom.data(target, HISTORY_KEY, target.value)
    }
    startPoll(target)
  }
  function monitor(target) {
    unmonitored(target);
    DomEvent.on(target, "blur", stopPollHandler);
    DomEvent.on(target, "mousedown keyup keydown focus", startPollHandler)
  }
  function unmonitored(target) {
    stopPoll(target);
    DomEvent.detach(target, "blur", stopPollHandler);
    DomEvent.detach(target, "mousedown keyup keydown focus", startPollHandler)
  }
  Special.input = {setup:function() {
    var el = this;
    if(canFireInput(el)) {
      monitor(el)
    }else {
      DomEvent.on(el, "focusin", beforeActivate)
    }
  }, tearDown:function() {
    var el = this;
    if(canFireInput(el)) {
      unmonitored(el)
    }else {
      DomEvent.remove(el, "focusin", beforeActivate);
      Dom.query("textarea,input", el).each(function(fel) {
        if(fel.__inputHandler) {
          fel.__inputHandler = 0;
          DomEvent.remove(fel, "input", noop)
        }
      })
    }
  }};
  function beforeActivate(e) {
    var t = e.target;
    if(canFireInput(t) && !t.__inputHandler) {
      t.__inputHandler = 1;
      DomEvent.on(t, "input", noop)
    }
  }
});

