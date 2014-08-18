/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:15
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 anim
*/

KISSY.add("anim", ["anim/base", "anim/timer", "anim/transition?"], function(S, require) {
  var AnimBase = require("anim/base"), TimerAnim = require("anim/timer");
  var TransitionAnim = require("anim/transition?");
  var logger = S.getLogger("s/anim");
  var Utils = AnimBase.Utils, defaultConfig = {duration:1, easing:"linear"};
  function Anim(node, to, duration, easing, complete) {
    var config;
    if(node.node) {
      config = node
    }else {
      if(typeof to === "string") {
        to = S.unparam(String(to), ";", ":");
        S.each(to, function(value, prop) {
          var trimProp = S.trim(prop);
          if(trimProp) {
            to[trimProp] = S.trim(value)
          }
          if(!trimProp || trimProp !== prop) {
            delete to[prop]
          }
        })
      }else {
        to = S.clone(to)
      }
      if(S.isPlainObject(duration)) {
        config = S.clone(duration)
      }else {
        config = {complete:complete};
        if(duration) {
          config.duration = duration
        }
        if(easing) {
          config.easing = easing
        }
      }
      config.node = node;
      config.to = to
    }
    config = S.merge(defaultConfig, config, {useTransition:S.config("anim/useTransition")});
    if(config.useTransition && TransitionAnim) {
      logger.info("use transition anim");
      return new TransitionAnim(config)
    }else {
      logger.info("use js timer anim");
      return new TimerAnim(config)
    }
  }
  S.each(["pause", "resume"], function(action) {
    Anim[action] = function(node, queue) {
      if(queue === null || typeof queue === "string" || queue === false) {
        return Utils.pauseOrResumeQueue(node, queue, action)
      }
      return Utils.pauseOrResumeQueue(node, undefined, action)
    }
  });
  Anim.isRunning = Utils.isElRunning;
  Anim.isPaused = Utils.isElPaused;
  Anim.stop = Utils.stopEl;
  Anim.Easing = TimerAnim.Easing;
  S.Anim = Anim;
  Anim.Q = AnimBase.Q;
  return Anim
});

