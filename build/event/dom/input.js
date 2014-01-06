/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Jan 6 18:33
*/
/*
 Combined modules by KISSY Module Compiler: 

 event/dom/input
*/

KISSY.add("event/dom/input", ["dom", "event/dom/base"], function(S, require) {
  var Dom = require("dom");
  var DomEvent = require("event/dom/base");
  var Special = DomEvent.Special;
  var INPUT_EVENT = "input", getNodeName = Dom.nodeName, KEY = "event/input", HISTORY_KEY = KEY + "/history", POLL_KEY = KEY + "/poll", interval = 50;
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
      DomEvent.fire(target, INPUT_EVENT);
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
  Special[INPUT_EVENT] = {setup:function() {
    var target = this, nodeName = getNodeName(target);
    if(nodeName === "input" || nodeName === "textarea") {
      return monitor(target)
    }else {
      return false
    }
  }, tearDown:function() {
    var target = this, nodeName = getNodeName(target);
    if(nodeName === "input" || nodeName === "textarea") {
      return monitor(target)
    }else {
      return false
    }
  }};
  return DomEvent
});

