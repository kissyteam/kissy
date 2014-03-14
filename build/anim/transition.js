/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:39
*/
/*
 Combined modules by KISSY Module Compiler: 

 anim/transition
*/

KISSY.add("anim/transition", ["dom", "./base"], function(S, require) {
  var Dom = require("dom");
  var AnimBase = require("./base");
  var Feature = S.Feature;
  var getCssVendorInfo = Feature.getCssVendorInfo;
  var transitionVendorInfo = getCssVendorInfo("transition");
  var vendorPrefix = transitionVendorInfo.propertyNamePrefix;
  var TRANSITION_END_EVENT = vendorPrefix ? [vendorPrefix.toLowerCase() + "TransitionEnd"] : ["transitionend", "webkitTransitionEnd"];
  var TRANSITION = transitionVendorInfo.propertyName;
  var DEFAULT_EASING = "ease-in";
  var css3Anim = {ease:1, linear:1, "ease-in":1, "ease-out":1, "ease-in-out":1};
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
  function onTransitionEnd(self, e) {
    var allCompleted = 1, propertyName = e.propertyName, propsData = self._propsData;
    if(!propsData[propertyName]) {
      return
    }
    if(propsData[propertyName].pos === 1) {
      return
    }
    propsData[propertyName].pos = 1;
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
  }
  function bindEnd(el, fn, remove) {
    S.each(TRANSITION_END_EVENT, function(e) {
      el[remove ? "removeEventListener" : "addEventListener"](e, fn, false)
    })
  }
  function unCamelCase(propertyName) {
    return propertyName.replace(/[A-Z]/g, function(m) {
      return"-" + m.toLowerCase()
    })
  }
  function TransitionAnim(node, to, duration, easing, complete) {
    var self = this;
    if(!(self instanceof TransitionAnim)) {
      return new TransitionAnim(node, to, duration, easing, complete)
    }
    TransitionAnim.superclass.constructor.apply(self, arguments);
    self._onTransitionEnd = function(e) {
      onTransitionEnd(self, e)
    }
  }
  S.extend(TransitionAnim, AnimBase, {prepareFx:function() {
    var self = this, propsData = self._propsData;
    var newProps = {};
    var val;
    var vendorInfo;
    for(var propertyName in propsData) {
      val = propsData[propertyName];
      if(typeof val.easing === "string") {
        if(!S.startsWith(val.easing, "cubic-bezier") && !css3Anim[val.easing]) {
          val.easing = DEFAULT_EASING
        }
      }else {
        val.easing = DEFAULT_EASING
      }
      vendorInfo = getCssVendorInfo(propertyName);
      if(!vendorInfo) {
        S.error("unsupported css property for transition anim: " + propertyName)
      }
      newProps[unCamelCase(vendorInfo.propertyName)] = propsData[propertyName]
    }
    self._propsData = newProps
  }, doStart:function() {
    var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], propsCss = {};
    S.each(_propsData, function(propData, prop) {
      var v = propData.value, currentValue = Dom.css(node, prop);
      Dom.css(node, prop, currentValue);
      if(typeof v === "number") {
        currentValue = parseFloat(currentValue)
      }
      if(currentValue === v) {
        setTimeout(function() {
          self._onTransitionEnd({propertyName:prop})
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
    bindEnd(node, self._onTransitionEnd);
    setTimeout(function() {
      Dom.css(node, propsCss)
    }, 0)
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
  }, doStop:function(finish) {
    var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
    bindEnd(node, self._onTransitionEnd, 1);
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
  S.mix(TransitionAnim, AnimBase.Statics);
  return TransitionAnim
});

