/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Feb 25 18:29
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 anim/transition
*/

KISSY.add("anim/transition", ["dom", "event/dom", "./base"], function(S, require) {
  var Dom = require("dom");
  var Event = require("event/dom");
  var AnimBase = require("./base");
  var Features = S.Features;
  var vendorPrefix = Features.getVendorCssPropPrefix("transition");
  var R_UPPER = /([A-Z]|^ms)/g;
  var TRANSITION_END_EVENT = vendorPrefix ? vendorPrefix.toLowerCase() + "TransitionEnd" : "transitionend webkitTransitionEnd";
  var TRANSITION = Features.getVendorCssPropName("transition");
  function genTransition(propsData) {
    var str = "";
    S.each(propsData, function(propData, prop) {
      if(str) {
        str += ","
      }
      str += prop + " " + propData.duration + "s " + propData.easing + " " + propData.delay + "s"
    });
    return str
  }
  function TransitionAnim() {
    TransitionAnim.superclass.constructor.apply(this, arguments)
  }
  S.extend(TransitionAnim, AnimBase, {doStart:function() {
    var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], transform, propsCss = {};
    if(transform = _propsData.transform) {
      delete _propsData.transform;
      _propsData[Features.getVendorCssPropName("transform").replace(R_UPPER, "-$1").toLowerCase()] = transform
    }
    S.each(_propsData, function(propData, prop) {
      var v = propData.value, currentValue = Dom.css(node, prop);
      if(typeof v === "number") {
        currentValue = parseFloat(currentValue)
      }
      if(currentValue === v) {
        setTimeout(function() {
          self._onTransitionEnd({originalEvent:{propertyName:prop}})
        }, 0)
      }
      propsCss[prop] = v
    });
    if(original.indexOf("none") !== -1) {
      original = ""
    }else {
      if(original) {
        original += ","
      }
    }
    elStyle[TRANSITION] = original + genTransition(_propsData);
    Event.on(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
    Dom.css(node, propsCss)
  }, beforeResume:function() {
    var self = this, propsData = self._propsData, tmpPropsData = S.merge(propsData), runTime = self._runTime / 1E3;
    S.each(tmpPropsData, function(propData, prop) {
      var tRunTime = runTime;
      if(propData.delay >= tRunTime) {
        propData.delay -= tRunTime
      }else {
        tRunTime -= propData.delay;
        propData.delay = 0;
        if(propData.duration >= tRunTime) {
          propData.duration -= tRunTime
        }else {
          delete propsData[prop]
        }
      }
    })
  }, _onTransitionEnd:function(e) {
    e = e.originalEvent;
    var self = this, allCompleted = 1, propsData = self._propsData;
    if(!propsData[e.propertyName]) {
      return
    }
    if(propsData[e.propertyName].pos === 1) {
      return
    }
    propsData[e.propertyName].pos = 1;
    S.each(propsData, function(propData) {
      if(propData.pos !== 1) {
        allCompleted = 0;
        return false
      }
      return undefined
    });
    if(allCompleted) {
      self.stop(true)
    }
  }, doStop:function(finish) {
    var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
    Event.detach(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
    S.each(_propsData, function(propData, prop) {
      if(!finish) {
        propsCss[prop] = Dom.css(node, prop)
      }
      propList.push(prop)
    });
    clear = S.trim(elStyle[TRANSITION].replace(new RegExp("(^|,)" + "\\s*(?:" + propList.join("|") + ")\\s+[^,]+", "gi"), "$1")).replace(/^,|,,|,$/g, "") || "none";
    elStyle[TRANSITION] = clear;
    Dom.css(node, propsCss)
  }});
  return TransitionAnim
});

