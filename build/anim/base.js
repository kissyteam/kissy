/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:39
*/
/*
 Combined modules by KISSY Module Compiler: 

 anim/base/queue
 anim/base/utils
 anim/base/short-hand
 anim/base
*/

KISSY.add("anim/base/queue", ["dom"], function(S, require) {
  var Dom = require("dom");
  var queueCollectionKey = S.guid("ks-queue-" + S.now() + "-"), queueKey = S.guid("ks-queue-" + S.now() + "-"), Q;
  function getQueue(node, name, readOnly) {
    name = name || queueKey;
    var qu, quCollection = Dom.data(node, queueCollectionKey);
    if(!quCollection && !readOnly) {
      Dom.data(node, queueCollectionKey, quCollection = {})
    }
    if(quCollection) {
      qu = quCollection[name];
      if(!qu && !readOnly) {
        qu = quCollection[name] = []
      }
    }
    return qu
  }
  Q = {queueCollectionKey:queueCollectionKey, queue:function(node, queue, item) {
    var qu = getQueue(node, queue);
    qu.push(item);
    return qu
  }, remove:function(node, queue, item) {
    var qu = getQueue(node, queue, 1), index;
    if(qu) {
      index = S.indexOf(item, qu);
      if(index > -1) {
        qu.splice(index, 1)
      }
    }
    if(qu && !qu.length) {
      Q.clearQueue(node, queue)
    }
    return qu
  }, clearQueues:function(node) {
    Dom.removeData(node, queueCollectionKey)
  }, clearQueue:function clearQueue(node, queue) {
    queue = queue || queueKey;
    var quCollection = Dom.data(node, queueCollectionKey);
    if(quCollection) {
      delete quCollection[queue]
    }
    if(S.isEmptyObject(quCollection)) {
      Dom.removeData(node, queueCollectionKey)
    }
  }, dequeue:function(node, queue) {
    var qu = getQueue(node, queue, 1);
    if(qu) {
      qu.shift();
      if(!qu.length) {
        Q.clearQueue(node, queue)
      }
    }
    return qu
  }};
  return Q
});
KISSY.add("anim/base/utils", ["./queue", "dom"], function(S, require) {
  var Q = require("./queue"), Dom = require("dom");
  var runningKey = S.guid("ks-anim-unqueued-" + S.now() + "-");
  function saveRunningAnim(anim) {
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    if(!allRunning) {
      Dom.data(node, runningKey, allRunning = {})
    }
    allRunning[S.stamp(anim)] = anim
  }
  function removeRunningAnim(anim) {
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    if(allRunning) {
      delete allRunning[S.stamp(anim)];
      if(S.isEmptyObject(allRunning)) {
        Dom.removeData(node, runningKey)
      }
    }
  }
  function isAnimRunning(anim) {
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    if(allRunning) {
      return!!allRunning[S.stamp(anim)]
    }
    return 0
  }
  var pausedKey = S.guid("ks-anim-paused-" + S.now() + "-");
  function savePausedAnim(anim) {
    var node = anim.node, paused = Dom.data(node, pausedKey);
    if(!paused) {
      Dom.data(node, pausedKey, paused = {})
    }
    paused[S.stamp(anim)] = anim
  }
  function removePausedAnim(anim) {
    var node = anim.node, paused = Dom.data(node, pausedKey);
    if(paused) {
      delete paused[S.stamp(anim)];
      if(S.isEmptyObject(paused)) {
        Dom.removeData(node, pausedKey)
      }
    }
  }
  function isAnimPaused(anim) {
    var node = anim.node, paused = Dom.data(node, pausedKey);
    if(paused) {
      return!!paused[S.stamp(anim)]
    }
    return 0
  }
  function pauseOrResumeQueue(node, queue, action) {
    var allAnims = Dom.data(node, action === "resume" ? pausedKey : runningKey), anims = S.merge(allAnims);
    S.each(anims, function(anim) {
      if(queue === undefined || anim.config.queue === queue) {
        anim[action]()
      }
    })
  }
  return{saveRunningAnim:saveRunningAnim, removeRunningAnim:removeRunningAnim, isAnimPaused:isAnimPaused, removePausedAnim:removePausedAnim, savePausedAnim:savePausedAnim, isAnimRunning:isAnimRunning, isElPaused:function(node) {
    var paused = Dom.data(node, pausedKey);
    return paused && !S.isEmptyObject(paused)
  }, isElRunning:function(node) {
    var allRunning = Dom.data(node, runningKey);
    return allRunning && !S.isEmptyObject(allRunning)
  }, pauseOrResumeQueue:pauseOrResumeQueue, stopEl:function(node, end, clearQueue, queue) {
    if(clearQueue) {
      if(queue === undefined) {
        Q.clearQueues(node)
      }else {
        if(queue !== false) {
          Q.clearQueue(node, queue)
        }
      }
    }
    var allRunning = Dom.data(node, runningKey), anims = S.merge(allRunning);
    S.each(anims, function(anim) {
      if(queue === undefined || anim.config.queue === queue) {
        anim.stop(end)
      }
    })
  }}
});
KISSY.add("anim/base/short-hand", [], function() {
  return{background:["backgroundColor"], border:["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor"], borderColor:["borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor"], borderBottom:["borderBottomWidth", "borderBottomColor"], borderLeft:["borderLeftWidth", "borderLeftColor"], borderTop:["borderTopWidth", "borderTopColor"], borderRight:["borderRightWidth", "borderRightColor"], 
  font:["fontSize", "fontWeight"], margin:["marginBottom", "marginLeft", "marginRight", "marginTop"], padding:["paddingBottom", "paddingLeft", "paddingRight", "paddingTop"]}
});
KISSY.add("anim/base", ["dom", "./base/utils", "./base/queue", "promise", "./base/short-hand"], function(S, require) {
  var Dom = require("dom"), Utils = require("./base/utils"), Q = require("./base/queue"), Promise = require("promise"), NodeType = Dom.NodeType, camelCase = S.camelCase, noop = S.noop, specialVals = {toggle:1, hide:1, show:1};
  var SHORT_HANDS = require("./base/short-hand");
  var defaultConfig = {duration:1, easing:"linear"};
  function syncComplete(self) {
    var _backupProps, complete = self.config.complete;
    if(!S.isEmptyObject(_backupProps = self._backupProps)) {
      Dom.css(self.node, _backupProps)
    }
    if(complete) {
      complete.call(self)
    }
  }
  function AnimBase(node, to, duration, easing, complete) {
    var self = this;
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
    config = S.merge(defaultConfig, config);
    AnimBase.superclass.constructor.call(self);
    Promise.Defer(self);
    self.config = config;
    node = config.node;
    if(!S.isPlainObject(node)) {
      node = Dom.get(config.node)
    }
    self.node = self.el = node;
    self._backupProps = {};
    self._propsData = {};
    var newTo = {};
    to = config.to;
    for(var prop in to) {
      newTo[camelCase(prop)] = to[prop]
    }
    config.to = newTo
  }
  S.extend(AnimBase, Promise, {prepareFx:noop, runInternal:function() {
    var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = config.delay || 0, defaultDuration = config.duration;
    Utils.saveRunningAnim(self);
    S.each(to, function(val, prop) {
      if(!S.isPlainObject(val)) {
        val = {value:val}
      }
      _propsData[prop] = S.mix({delay:defaultDelay, easing:config.easing, frame:config.frame, duration:defaultDuration}, val)
    });
    S.each(SHORT_HANDS, function(shortHands, p) {
      var origin, _propData = _propsData[p], val;
      if(_propData) {
        val = _propData.value;
        origin = {};
        S.each(shortHands, function(sh) {
          origin[sh] = Dom.css(node, sh)
        });
        Dom.css(node, p, val);
        S.each(origin, function(val, sh) {
          if(!(sh in _propsData)) {
            _propsData[sh] = S.merge(_propData, {value:Dom.css(node, sh)})
          }
          Dom.css(node, sh, val)
        });
        delete _propsData[p]
      }
    });
    if(node.nodeType === NodeType.ELEMENT_NODE) {
      if(to.width || to.height) {
        var elStyle = node.style;
        S.mix(_backupProps, {overflow:elStyle.overflow, "overflow-x":elStyle.overflowX, "overflow-y":elStyle.overflowY});
        elStyle.overflow = "hidden";
        if(Dom.css(node, "display") === "inline" && Dom.css(node, "float") === "none") {
          if(S.UA.ieMode < 10) {
            elStyle.zoom = 1
          }else {
            elStyle.display = "inline-block"
          }
        }
      }
      var exit, hidden;
      hidden = Dom.css(node, "display") === "none";
      S.each(_propsData, function(_propData, prop) {
        val = _propData.value;
        if(specialVals[val]) {
          if(val === "hide" && hidden || val === "show" && !hidden) {
            self.stop(true);
            exit = false;
            return exit
          }
          _backupProps[prop] = Dom.style(node, prop);
          if(val === "toggle") {
            val = hidden ? "show" : "hide"
          }
          if(val === "hide") {
            _propData.value = 0;
            _backupProps.display = "none"
          }else {
            _propData.value = Dom.css(node, prop);
            Dom.css(node, prop, 0);
            Dom.show(node)
          }
        }
        return undefined
      });
      if(exit === false) {
        return
      }
    }
    self.startTime = S.now();
    if(S.isEmptyObject(_propsData)) {
      self.__totalTime = defaultDuration * 1E3;
      self.__waitTimeout = setTimeout(function() {
        self.stop(true)
      }, self.__totalTime)
    }else {
      self.prepareFx();
      self.doStart()
    }
  }, isRunning:function() {
    return Utils.isAnimRunning(this)
  }, isPaused:function() {
    return Utils.isAnimPaused(this)
  }, pause:function() {
    var self = this;
    if(self.isRunning()) {
      self._runTime = S.now() - self.startTime;
      self.__totalTime -= self._runTime;
      Utils.removeRunningAnim(self);
      Utils.savePausedAnim(self);
      if(self.__waitTimeout) {
        clearTimeout(self.__waitTimeout)
      }else {
        self.doStop()
      }
    }
    return self
  }, doStop:noop, doStart:noop, resume:function() {
    var self = this;
    if(self.isPaused()) {
      self.startTime = S.now() - self._runTime;
      Utils.removePausedAnim(self);
      Utils.saveRunningAnim(self);
      if(self.__waitTimeout) {
        self.__waitTimeout = setTimeout(function() {
          self.stop(true)
        }, self.__totalTime)
      }else {
        self.beforeResume();
        self.doStart()
      }
    }
    return self
  }, beforeResume:noop, run:function() {
    var self = this, q, queue = self.config.queue;
    if(queue === false) {
      self.runInternal()
    }else {
      q = Q.queue(self.node, queue, self);
      if(q.length === 1) {
        self.runInternal()
      }
    }
    return self
  }, stop:function(finish) {
    var self = this, node = self.node, q, queue = self.config.queue;
    if(self.isResolved() || self.isRejected()) {
      return self
    }
    if(self.__waitTimeout) {
      clearTimeout(self.__waitTimeout);
      self.__waitTimeout = 0
    }
    if(!self.isRunning() && !self.isPaused()) {
      if(queue !== false) {
        Q.remove(node, queue, self)
      }
      return self
    }
    self.doStop(finish);
    Utils.removeRunningAnim(self);
    Utils.removePausedAnim(self);
    var defer = self.defer;
    if(finish) {
      syncComplete(self);
      defer.resolve([self])
    }else {
      defer.reject([self])
    }
    if(queue !== false) {
      q = Q.dequeue(node, queue);
      if(q && q[0]) {
        q[0].runInternal()
      }
    }
    return self
  }});
  var Statics = AnimBase.Statics = {isRunning:Utils.isElRunning, isPaused:Utils.isElPaused, stop:Utils.stopEl, Q:Q};
  S.each(["pause", "resume"], function(action) {
    Statics[action] = function(node, queue) {
      if(queue === null || typeof queue === "string" || queue === false) {
        return Utils.pauseOrResumeQueue(node, queue, action)
      }
      return Utils.pauseOrResumeQueue(node, undefined, action)
    }
  });
  return AnimBase
});

