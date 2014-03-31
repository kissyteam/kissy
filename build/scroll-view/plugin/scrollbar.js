/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 31 19:30
*/
/*
 Combined modules by KISSY Module Compiler: 

 scroll-view/plugin/scrollbar/scrollbar-xtpl
 scroll-view/plugin/scrollbar/render
 scroll-view/plugin/scrollbar/control
 scroll-view/plugin/scrollbar
*/

KISSY.add("scroll-view/plugin/scrollbar/scrollbar-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, buffer, payload, undefined) {
    var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("1.50" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div id="ks-scrollbar-arrow-up-');
    var id0 = scope.resolve(["id"]);
    buffer.write(id0, true);
    buffer.write('"\n        class="');
    var option1 = {escape:1};
    var params2 = [];
    var id3 = scope.resolve(["axis"]);
    var exp4 = id3;
    exp4 = id3 + "-arrow-up";
    params2.push(exp4);
    option1.params = params2;
    var commandRet5 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
    if(commandRet5 && commandRet5.isBuffer) {
      buffer = commandRet5;
      commandRet5 = undefined
    }
    buffer.write(commandRet5, true);
    buffer.write('">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-');
    var id6 = scope.resolve(["id"]);
    buffer.write(id6, true);
    buffer.write('"\n        class="');
    var option7 = {escape:1};
    var params8 = [];
    var id9 = scope.resolve(["axis"]);
    var exp10 = id9;
    exp10 = id9 + "-arrow-down";
    params8.push(exp10);
    option7.params = params8;
    var commandRet11 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 6);
    if(commandRet11 && commandRet11.isBuffer) {
      buffer = commandRet11;
      commandRet11 = undefined
    }
    buffer.write(commandRet11, true);
    buffer.write('">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-');
    var id12 = scope.resolve(["id"]);
    buffer.write(id12, true);
    buffer.write('"\n     class="');
    var option13 = {escape:1};
    var params14 = [];
    var id15 = scope.resolve(["axis"]);
    var exp16 = id15;
    exp16 = id15 + "-track";
    params14.push(exp16);
    option13.params = params14;
    var commandRet17 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 10);
    if(commandRet17 && commandRet17.isBuffer) {
      buffer = commandRet17;
      commandRet17 = undefined
    }
    buffer.write(commandRet17, true);
    buffer.write('">\n<div id="ks-scrollbar-drag-');
    var id18 = scope.resolve(["id"]);
    buffer.write(id18, true);
    buffer.write('"\n     class="');
    var option19 = {escape:1};
    var params20 = [];
    var id21 = scope.resolve(["axis"]);
    var exp22 = id21;
    exp22 = id21 + "-drag";
    params20.push(exp22);
    option19.params = params20;
    var commandRet23 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 12);
    if(commandRet23 && commandRet23.isBuffer) {
      buffer = commandRet23;
      commandRet23 = undefined
    }
    buffer.write(commandRet23, true);
    buffer.write('">\n<div class="');
    var option24 = {escape:1};
    var params25 = [];
    var id26 = scope.resolve(["axis"]);
    var exp27 = id26;
    exp27 = id26 + "-drag-top";
    params25.push(exp27);
    option24.params = params25;
    var commandRet28 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 13);
    if(commandRet28 && commandRet28.isBuffer) {
      buffer = commandRet28;
      commandRet28 = undefined
    }
    buffer.write(commandRet28, true);
    buffer.write('">\n</div>\n<div class="');
    var option29 = {escape:1};
    var params30 = [];
    var id31 = scope.resolve(["axis"]);
    var exp32 = id31;
    exp32 = id31 + "-drag-center";
    params30.push(exp32);
    option29.params = params30;
    var commandRet33 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 15);
    if(commandRet33 && commandRet33.isBuffer) {
      buffer = commandRet33;
      commandRet33 = undefined
    }
    buffer.write(commandRet33, true);
    buffer.write('">\n</div>\n<div class="');
    var option34 = {escape:1};
    var params35 = [];
    var id36 = scope.resolve(["axis"]);
    var exp37 = id36;
    exp37 = id36 + "-drag-bottom";
    params35.push(exp37);
    option34.params = params35;
    var commandRet38 = callCommandUtil(engine, scope, option34, buffer, "getBaseCssClasses", 17);
    if(commandRet38 && commandRet38.isBuffer) {
      buffer = commandRet38;
      commandRet38 = undefined
    }
    buffer.write(commandRet38, true);
    buffer.write('">\n</div>\n</div>\n</div>');
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("scroll-view/plugin/scrollbar/render", ["component/control", "./scrollbar-xtpl"], function(S, require) {
  var Control = require("component/control");
  var ScrollBarTpl = require("./scrollbar-xtpl");
  var Feature = S.Feature;
  var isTransform3dSupported = Feature.isTransform3dSupported();
  var transformVendorInfo = Feature.getCssVendorInfo("transform");
  var supportCss3 = !!transformVendorInfo;
  var methods = {beforeCreateDom:function(renderData, childrenElSelectors) {
    renderData.elCls.push(renderData.prefixCls + "scrollbar-" + renderData.axis);
    S.mix(childrenElSelectors, {dragEl:"#ks-scrollbar-drag-{id}", downBtn:"#ks-scrollbar-arrow-down-{id}", upBtn:"#ks-scrollbar-arrow-up-{id}", trackEl:"#ks-scrollbar-track-{id}"})
  }, createDom:function() {
    var control = this.control;
    control.$dragEl = control.get("dragEl");
    control.$trackEl = control.get("trackEl");
    control.$downBtn = control.get("downBtn");
    control.$upBtn = control.get("upBtn");
    control.dragEl = control.$dragEl[0];
    control.trackEl = control.$trackEl[0];
    control.downBtn = control.$downBtn[0];
    control.upBtn = control.$upBtn[0]
  }, _onSetDragHeight:function(v) {
    this.control.dragEl.style.height = v + "px"
  }, _onSetDragWidth:function(v) {
    this.control.dragEl.style.width = v + "px"
  }, _onSetDragLeft:function(v) {
    this.control.dragEl.style.left = v + "px"
  }, _onSetDragTop:function(v) {
    this.control.dragEl.style.top = v + "px"
  }};
  if(supportCss3) {
    var transformProperty = transformVendorInfo.propertyName;
    methods._onSetDragLeft = function(v) {
      this.control.dragEl.style[transformProperty] = "translateX(" + v + "px)" + " translateY(" + this.control.get("dragTop") + "px)" + (isTransform3dSupported ? " translateZ(0)" : "")
    };
    methods._onSetDragTop = function(v) {
      this.control.dragEl.style[transformProperty] = "translateX(" + this.control.get("dragLeft") + "px)" + " translateY(" + v + "px)" + (isTransform3dSupported ? " translateZ(0)" : "")
    }
  }
  return Control.getDefaultRender().extend(methods, {ATTRS:{contentTpl:{value:ScrollBarTpl}}})
});
KISSY.add("scroll-view/plugin/scrollbar/control", ["node", "ua", "component/control", "./render", "event/gesture/drag"], function(S, require) {
  var Node = require("node");
  var UA = require("ua");
  var Control = require("component/control");
  var ScrollBarRender = require("./render");
  var DragType = require("event/gesture/drag");
  var MIN_BAR_LENGTH = 20;
  var SCROLLBAR_EVENT_NS = ".ks-scrollbar";
  var Gesture = Node.Gesture;
  function preventDefault(e) {
    e.preventDefault()
  }
  function onDragStartHandler(e) {
    e.stopPropagation();
    var self = this;
    self.startScroll = self.scrollView.get(self.scrollProperty)
  }
  function onDragHandler(e) {
    var self = this, diff = self.pageXyProperty === "pageX" ? e.deltaX : e.deltaY, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    scrollView.scrollToWithBounds(scrollCfg)
  }
  function onScrollViewReflow() {
    var self = this, scrollView = self.scrollView, trackEl = self.trackEl, scrollWHProperty = self.scrollWHProperty, whProperty = self.whProperty, clientWHProperty = self.clientWHProperty, dragWHProperty = self.dragWHProperty, ratio, trackElSize, barSize;
    if(scrollView.allowScroll[self.scrollType]) {
      self.scrollLength = scrollView[scrollWHProperty];
      trackElSize = self.trackElSize = whProperty === "width" ? trackEl.offsetWidth : trackEl.offsetHeight;
      ratio = scrollView[clientWHProperty] / self.scrollLength;
      barSize = ratio * trackElSize;
      self.set(dragWHProperty, barSize);
      self.barSize = barSize;
      syncOnScroll(self);
      self.set("visible", true)
    }else {
      self.set("visible", false)
    }
  }
  function onScrollViewDisabled(e) {
    this.set("disabled", e.newVal)
  }
  function onScrollEnd() {
    var self = this;
    if(self.hideFn) {
      startHideTimer(self)
    }
  }
  function afterScrollChange() {
    var self = this;
    var scrollView = self.scrollView;
    if(!scrollView.allowScroll[self.scrollType]) {
      return
    }
    clearHideTimer(self);
    self.set("visible", true);
    if(self.hideFn && !scrollView.isScrolling) {
      startHideTimer(self)
    }
    syncOnScroll(self)
  }
  function onUpDownBtnMouseDown(e) {
    e.halt();
    var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = target === self.downBtn || self.$downBtn.contains(target) ? 1 : -1;
    clearInterval(self.mouseInterval);
    function doScroll() {
      var scrollCfg = {};
      scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
      scrollView.scrollToWithBounds(scrollCfg)
    }
    self.mouseInterval = setInterval(doScroll, 100);
    doScroll()
  }
  function onTrackElMouseDown(e) {
    var self = this;
    var target = e.target;
    var dragEl = self.dragEl;
    var $dragEl = self.$dragEl;
    if(dragEl === target || $dragEl.contains(target)) {
      return
    }
    var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
    scrollCfg[scrollType] = per * self.scrollLength;
    scrollView.scrollToWithBounds(scrollCfg);
    e.halt()
  }
  function onUpDownBtnMouseUp() {
    clearInterval(this.mouseInterval)
  }
  function syncOnScroll(control) {
    var scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
    if(val > maxScroll) {
      dragVal = maxScroll / contentSize * trackElSize;
      control.set(dragWHProperty, barSize - (val - maxScroll));
      control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty))
    }else {
      if(val < minScroll) {
        dragVal = minScroll / contentSize * trackElSize;
        control.set(dragWHProperty, barSize - (minScroll - val));
        control.set(dragLTProperty, dragVal)
      }else {
        dragVal = val / contentSize * trackElSize;
        control.set(dragLTProperty, dragVal);
        control.set(dragWHProperty, barSize)
      }
    }
  }
  function startHideTimer(self) {
    clearHideTimer(self);
    self.hideTimer = setTimeout(self.hideFn, self.get("hideDelay") * 1E3)
  }
  function clearHideTimer(self) {
    if(self.hideTimer) {
      clearTimeout(self.hideTimer);
      self.hideTimer = null
    }
  }
  return Control.extend({initializer:function() {
    var self = this;
    var scrollType = self.scrollType = self.get("axis") === "x" ? "left" : "top";
    var ucScrollType = S.ucfirst(scrollType);
    self.pageXyProperty = scrollType === "left" ? "pageX" : "pageY";
    var wh = self.whProperty = scrollType === "left" ? "width" : "height";
    var ucWH = S.ucfirst(wh);
    self.afterScrollChangeEvent = "afterScroll" + ucScrollType + "Change";
    self.scrollProperty = "scroll" + ucScrollType;
    self.dragWHProperty = "drag" + ucWH;
    self.dragLTProperty = "drag" + ucScrollType;
    self.clientWHProperty = "client" + ucWH;
    self.scrollWHProperty = "scroll" + ucWH;
    self.scrollView = self.get("scrollView")
  }, _onSetDisabled:function(v) {
    var self = this;
    var action = v ? "detach" : "on";
    if(!self.get("autoHide")) {
      self.$dragEl[action]("dragstart mousedown", preventDefault)[action](DragType.DRAG_START, onDragStartHandler, self)[action](DragType.DRAG, onDragHandler, self);
      S.each([self.$downBtn, self.$upBtn], function(b) {
        b[action](Gesture.start, onUpDownBtnMouseDown, self)[action](Gesture.end, onUpDownBtnMouseUp, self)
      });
      self.$trackEl[action](Gesture.start, onTrackElMouseDown, self)
    }
  }, bindUI:function() {
    var self = this, autoHide = self.get("autoHide"), scrollView = self.scrollView;
    if(autoHide) {
      self.hideFn = S.bind(self.hide, self)
    }
    scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on("scrollTouchEnd" + SCROLLBAR_EVENT_NS, onScrollEnd, self).on("afterDisabledChange" + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on("reflow" + SCROLLBAR_EVENT_NS, onScrollViewReflow, self)
  }, syncUI:function() {
    onScrollViewReflow.call(this)
  }, destructor:function() {
    this.scrollView.detach(SCROLLBAR_EVENT_NS);
    clearHideTimer(this)
  }}, {ATTRS:{minLength:{value:MIN_BAR_LENGTH}, scrollView:{}, axis:{view:1}, autoHide:{value:UA.ios}, visible:{valueFn:function() {
    return!this.get("autoHide")
  }}, hideDelay:{value:0.1}, dragWidth:{setter:function(v) {
    var minLength = this.get("minLength");
    if(v < minLength) {
      return minLength
    }
    return v
  }, view:1}, dragHeight:{setter:function(v) {
    var minLength = this.get("minLength");
    if(v < minLength) {
      return minLength
    }
    return v
  }, view:1}, dragLeft:{view:1, value:0}, dragTop:{view:1, value:0}, dragEl:{}, downBtn:{}, upBtn:{}, trackEl:{}, focusable:{value:false}, xrender:{value:ScrollBarRender}}, xclass:"scrollbar"})
});
KISSY.add("scroll-view/plugin/scrollbar", ["base", "./scrollbar/control"], function(S, require) {
  var Base = require("base");
  var ScrollBar = require("./scrollbar/control");
  function onScrollViewReflow() {
    var self = this;
    var scrollView = self.scrollView;
    var minLength = self.get("minLength");
    var autoHideX = self.get("autoHideX");
    var autoHideY = self.get("autoHideY");
    var cfg;
    if(!self.scrollBarX && scrollView.allowScroll.left) {
      cfg = {axis:"x", scrollView:scrollView, elBefore:scrollView.$contentEl};
      if(minLength !== undefined) {
        cfg.minLength = minLength
      }
      if(autoHideX !== undefined) {
        cfg.autoHide = autoHideX
      }
      self.scrollBarX = (new ScrollBar(cfg)).render()
    }
    if(!self.scrollBarY && scrollView.allowScroll.top) {
      cfg = {axis:"y", scrollView:scrollView, elBefore:scrollView.$contentEl};
      if(minLength !== undefined) {
        cfg.minLength = minLength
      }
      if(autoHideY !== undefined) {
        cfg.autoHide = autoHideY
      }
      self.scrollBarY = (new ScrollBar(cfg)).render()
    }
  }
  return Base.extend({pluginId:this.getName(), pluginBindUI:function(scrollView) {
    var self = this;
    self.scrollView = scrollView;
    scrollView.on("reflow", onScrollViewReflow, self)
  }, pluginDestructor:function(scrollView) {
    var self = this;
    if(self.scrollBarX) {
      self.scrollBarX.destroy();
      self.scrollBarX = null
    }
    if(self.scrollBarY) {
      self.scrollBarY.destroy();
      self.scrollBarY = null
    }
    scrollView.detach("reflow", onScrollViewReflow, self)
  }}, {ATTRS:{minLength:{}, autoHideX:{}, autoHideY:{}}})
});

