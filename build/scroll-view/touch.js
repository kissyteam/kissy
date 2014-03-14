/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:40
*/
/*
 Combined modules by KISSY Module Compiler: 

 scroll-view/touch
*/

KISSY.add("scroll-view/touch", ["./base", "node", "anim/timer"], function(S, require) {
  var ScrollViewBase = require("./base");
  var Node = require("node");
  var TimerAnim = require("anim/timer");
  var OUT_OF_BOUND_FACTOR = 0.5;
  var Gesture = Node.Gesture;
  var MAX_SWIPE_VELOCITY = 6;
  function onDragScroll(self, e, scrollType) {
    if(forbidDrag(self, scrollType)) {
      return
    }
    var diff = scrollType === "left" ? e.deltaX : e.deltaY, scroll = self.startScroll[scrollType] - diff, bound, minScroll = self.minScroll, maxScroll = self.maxScroll;
    if(!self._bounce) {
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType])
    }
    if(scroll < minScroll[scrollType]) {
      bound = minScroll[scrollType] - scroll;
      bound *= OUT_OF_BOUND_FACTOR;
      scroll = minScroll[scrollType] - bound
    }else {
      if(scroll > maxScroll[scrollType]) {
        bound = scroll - maxScroll[scrollType];
        bound *= OUT_OF_BOUND_FACTOR;
        scroll = maxScroll[scrollType] + bound
      }
    }
    self.set("scroll" + S.ucfirst(scrollType), scroll)
  }
  function forbidDrag(self, scrollType) {
    var lockXY = scrollType === "left" ? "lockX" : "lockY";
    if(!self.allowScroll[scrollType] && self["_" + lockXY]) {
      return 1
    }
    return 0
  }
  function onDragEndAxis(self, e, scrollType, endCallback) {
    if(forbidDrag(self, scrollType)) {
      endCallback();
      return
    }
    var scrollAxis = "scroll" + S.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, bound;
    if(scroll < minScroll[scrollType]) {
      bound = minScroll[scrollType]
    }else {
      if(scroll > maxScroll[scrollType]) {
        bound = maxScroll[scrollType]
      }
    }
    if(bound !== undefined) {
      var scrollCfg = {};
      scrollCfg[scrollType] = bound;
      self.scrollTo(scrollCfg, {duration:self.get("bounceDuration"), easing:self.get("bounceEasing"), queue:false, complete:endCallback});
      return
    }
    if(self.pagesOffset) {
      endCallback();
      return
    }
    var velocity = scrollType === "left" ? -e.velocityX : -e.velocityY;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    var animCfg = {node:{}, to:{}, duration:9999, queue:false, complete:endCallback, frame:makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    animCfg.node[scrollType] = scroll;
    animCfg.to[scrollType] = null;
    self.scrollAnims.push((new TimerAnim(animCfg)).run())
  }
  var FRICTION = 0.5;
  var ACCELERATION = 20;
  var THETA = Math.log(1 - FRICTION / 10);
  var ALPHA = THETA / ACCELERATION;
  var SPRING_TENSION = 0.3;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    var velocity = startVelocity * ACCELERATION;
    var inertia = 1;
    var bounceStartTime = 0;
    return function(anim, fx) {
      var now = S.now(), deltaTime, value;
      if(inertia) {
        deltaTime = now - anim.startTime;
        var frictionFactor = Math.exp(deltaTime * ALPHA);
        value = parseInt(startScroll + velocity * (1 - frictionFactor) / -THETA, 10);
        if(value > minScroll && value < maxScroll) {
          if(fx.lastValue === value) {
            fx.pos = 1;
            return
          }
          fx.lastValue = value;
          self.set(scrollAxis, value);
          return
        }
        inertia = 0;
        velocity = velocity * frictionFactor;
        startScroll = value <= minScroll ? minScroll : maxScroll;
        bounceStartTime = now
      }else {
        deltaTime = now - bounceStartTime;
        var theta = deltaTime / ACCELERATION, powTime = theta * Math.exp(-SPRING_TENSION * theta);
        value = parseInt(velocity * powTime, 10);
        if(value === 0) {
          fx.pos = 1
        }
        self.set(scrollAxis, startScroll + value)
      }
    }
  }
  function onDragStartHandler(e) {
    var self = this;
    if(e.gestureType !== "touch" || self.isScrolling && self.pagesOffset) {
      return
    }
    self.startScroll = {};
    self.dragInitDirection = null;
    self.isScrolling = 1;
    self.startScroll.left = self.get("scrollLeft");
    self.startScroll.top = self.get("scrollTop")
  }
  var onDragHandler = function(e) {
    var self = this;
    if(e.gestureType !== "touch" || !self.isScrolling) {
      return
    }
    var xDiff = Math.abs(e.deltaX);
    var yDiff = Math.abs(e.deltaY);
    var lockX = self._lockX, lockY = self._lockY;
    if(lockX || lockY) {
      var dragInitDirection;
      if(!(dragInitDirection = self.dragInitDirection)) {
        self.dragInitDirection = dragInitDirection = xDiff > yDiff ? "left" : "top"
      }
      if(lockX && dragInitDirection === "left" && !self.allowScroll[dragInitDirection]) {
        self.isScrolling = 0;
        if(self._preventDefaultX) {
          e.preventDefault()
        }
        return
      }
      if(lockY && dragInitDirection === "top" && !self.allowScroll[dragInitDirection]) {
        self.isScrolling = 0;
        if(self._preventDefaultY) {
          e.preventDefault()
        }
        return
      }
    }
    e.preventDefault();
    onDragScroll(self, e, "left");
    onDragScroll(self, e, "top")
  };
  function onDragEndHandler(e) {
    var self = this;
    if(e.gestureType !== "touch" || !self.isScrolling) {
      return
    }
    self.fire("touchEnd", {pageX:e.pageX, deltaX:e.deltaX, deltaY:e.deltaY, pageY:e.pageY, velocityX:e.velocityX, velocityY:e.velocityY})
  }
  function defaultTouchEndHandler(e) {
    var self = this;
    var count = 0;
    var offsetX = -e.deltaX;
    var offsetY = -e.deltaY;
    var snapThreshold = self._snapThresholdCfg;
    var allowX = self.allowScroll.left && Math.abs(offsetX) > snapThreshold;
    var allowY = self.allowScroll.top && Math.abs(offsetY) > snapThreshold;
    function endCallback() {
      count++;
      if(count === 2) {
        var scrollEnd = function() {
          self.isScrolling = 0;
          self.fire("scrollTouchEnd", {pageX:e.pageX, pageY:e.pageY, deltaX:-offsetX, deltaY:-offsetY, fromPageIndex:pageIndex, pageIndex:self.get("pageIndex")})
        };
        if(!self.pagesOffset) {
          scrollEnd();
          return
        }
        var snapDuration = self._snapDurationCfg;
        var snapEasing = self._snapEasingCfg;
        var pageIndex = self.get("pageIndex");
        var scrollLeft = self.get("scrollLeft");
        var scrollTop = self.get("scrollTop");
        var animCfg = {duration:snapDuration, easing:snapEasing, complete:scrollEnd};
        var pagesOffset = self.pagesOffset;
        var pagesOffsetLen = pagesOffset.length;
        self.isScrolling = 0;
        if(allowX || allowY) {
          if(allowX && allowY) {
            var prepareX = [], i, newPageIndex;
            var nowXY = {left:scrollLeft, top:scrollTop};
            for(i = 0;i < pagesOffsetLen;i++) {
              var offset = pagesOffset[i];
              if(offset) {
                if(offsetX > 0 && offset.left > nowXY.left) {
                  prepareX.push(offset)
                }else {
                  if(offsetX < 0 && offset.left < nowXY.left) {
                    prepareX.push(offset)
                  }
                }
              }
            }
            var min;
            var prepareXLen = prepareX.length;
            var x;
            if(offsetY > 0) {
              min = Number.MAX_VALUE;
              for(i = 0;i < prepareXLen;i++) {
                x = prepareX[i];
                if(x.top > nowXY.top) {
                  if(min < x.top - nowXY.top) {
                    min = x.top - nowXY.top;
                    newPageIndex = prepareX.index
                  }
                }
              }
            }else {
              min = Number.MAX_VALUE;
              for(i = 0;i < prepareXLen;i++) {
                x = prepareX[i];
                if(x.top < nowXY.top) {
                  if(min < nowXY.top - x.top) {
                    min = nowXY.top - x.top;
                    newPageIndex = prepareX.index
                  }
                }
              }
            }
            if(newPageIndex !== undefined) {
              if(newPageIndex !== pageIndex) {
                self.scrollToPage(newPageIndex, animCfg)
              }else {
                self.scrollToPage(newPageIndex);
                scrollEnd()
              }
            }else {
              scrollEnd()
            }
          }else {
            if(allowX || allowY) {
              var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              self.scrollToPage(toPageIndex, animCfg)
            }else {
              self.scrollToPage(pageIndex);
              scrollEnd()
            }
          }
        }
      }
    }
    onDragEndAxis(self, e, "left", endCallback);
    onDragEndAxis(self, e, "top", endCallback)
  }
  function onGestureStart(e) {
    var self = this;
    if(e.gestureType === "touch") {
      e.preventDefault()
    }
    if(self.isScrolling && self.pagesOffset) {
      return
    }
    if(self.isScrolling) {
      self.stopAnimation();
      self.fire("scrollTouchEnd", {pageX:e.pageX, pageY:e.pageY})
    }
  }
  return ScrollViewBase.extend({initializer:function() {
    var self = this;
    self._preventDefaultY = self.get("preventDefaultY");
    self._preventDefaultX = self.get("preventDefaultX");
    self._lockX = self.get("lockX");
    self._lockY = self.get("lockY");
    self._bounce = self.get("bounce");
    self._snapThresholdCfg = self.get("snapThreshold");
    self._snapDurationCfg = self.get("snapDuration");
    self._snapEasingCfg = self.get("snapEasing");
    self.publish("touchEnd", {defaultFn:defaultTouchEndHandler, defaultTargetOnly:true})
  }, _onSetDisabled:function(v) {
    var action = v ? "detach" : "on";
    var self = this;
    self.$contentEl[action]("gestureDragStart", onDragStartHandler, self)[action](Gesture.start, onGestureStart, self)[action]("gestureDrag", onDragHandler, self)[action]("gestureDragEnd", onDragEndHandler, self)
  }, destructor:function() {
    this.stopAnimation()
  }, stopAnimation:function() {
    this.callSuper();
    this.isScrolling = 0
  }}, {ATTRS:{lockX:{value:true}, preventDefaultX:{value:true}, lockY:{value:false}, preventDefaultY:{value:false}, snapDuration:{value:0.3}, snapEasing:{value:"easeOut"}, snapThreshold:{value:5}, bounce:{value:true}, bounceDuration:{value:0.4}, bounceEasing:{value:"easeOut"}}})
});

