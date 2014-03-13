/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 23:48
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
  function normalizeCssName(propsData) {
    var names = S.keys(propsData);
    var newProps = {};
    for(var i = 0, l = names.length;i < l;i++) {
      newProps[getCssVendorInfo(names[i]).name] = propsData[names[i]]
    }
    return newProps
  }
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
  S.extend(TransitionAnim, AnimBase, {doStart:function() {
    var self = this, node = self.node, elStyle = node.style, _propsData, original = elStyle[TRANSITION], propsCss = {};
    _propsData = self._propsData = normalizeCssName(self._propsData);
    S.each(_propsData, function(propData, prop) {
      var v = propData.value, currentValue = Dom.css(node, prop);
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

