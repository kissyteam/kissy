/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:40
*/
/*
 Combined modules by KISSY Module Compiler: 

 scroll-view/plugin/scrollbar/scrollbar-xtpl
 scroll-view/plugin/scrollbar/render
 scroll-view/plugin/scrollbar/control
 scroll-view/plugin/scrollbar
*/

KISSY.add("scroll-view/plugin/scrollbar/scrollbar-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += '<div id="ks-scrollbar-arrow-up-';
    var id0 = scope.resolve(["id"]);
    buffer += escapeHtml(id0);
    buffer += '"\n        class="';
    var option2 = {};
    var params3 = [];
    var id4 = scope.resolve(["axis"]);
    params3.push(id4 + "-arrow-up");
    option2.params = params3;
    var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
    buffer += escapeHtml(id1);
    buffer += '">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-';
    var id5 = scope.resolve(["id"]);
    buffer += escapeHtml(id5);
    buffer += '"\n        class="';
    var option7 = {};
    var params8 = [];
    var id9 = scope.resolve(["axis"]);
    params8.push(id9 + "-arrow-down");
    option7.params = params8;
    var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 6);
    buffer += escapeHtml(id6);
    buffer += '">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-';
    var id10 = scope.resolve(["id"]);
    buffer += escapeHtml(id10);
    buffer += '"\n     class="';
    var option12 = {};
    var params13 = [];
    var id14 = scope.resolve(["axis"]);
    params13.push(id14 + "-track");
    option12.params = params13;
    var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 10);
    buffer += escapeHtml(id11);
    buffer += '">\n<div id="ks-scrollbar-drag-';
    var id15 = scope.resolve(["id"]);
    buffer += escapeHtml(id15);
    buffer += '"\n     class="';
    var option17 = {};
    var params18 = [];
    var id19 = scope.resolve(["axis"]);
    params18.push(id19 + "-drag");
    option17.params = params18;
    var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 12);
    buffer += escapeHtml(id16);
    buffer += '">\n<div class="';
    var option21 = {};
    var params22 = [];
    var id23 = scope.resolve(["axis"]);
    params22.push(id23 + "-drag-top");
    option21.params = params22;
    var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 13);
    buffer += escapeHtml(id20);
    buffer += '">\n</div>\n<div class="';
    var option25 = {};
    var params26 = [];
    var id27 = scope.resolve(["axis"]);
    params26.push(id27 + "-drag-center");
    option25.params = params26;
    var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 15);
    buffer += escapeHtml(id24);
    buffer += '">\n</div>\n<div class="';
    var option29 = {};
    var params30 = [];
    var id31 = scope.resolve(["axis"]);
    params30.push(id31 + "-drag-bottom");
    option29.params = params30;
    var id28 = callCommandUtil(engine, scope, option29, "getBaseCssClasses", 17);
    buffer += escapeHtml(id28);
    buffer += '">\n</div>\n</div>\n</div>';
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
KISSY.add("scroll-view/plugin/scrollbar/control", ["node", "component/control", "./render", "event/gesture/drag"], function(S, require) {
  var Node = require("node");
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
    var control = this, scrollView = control.scrollView, trackEl = control.trackEl, scrollWHProperty = control.scrollWHProperty, whProperty = control.whProperty, clientWHProperty = control.clientWHProperty, dragWHProperty = control.dragWHProperty, ratio, trackElSize, barSize;
    if(scrollView.allowScroll[control.scrollType]) {
      control.scrollLength = scrollView[scrollWHProperty];
      trackElSize = control.trackElSize = whProperty === "width" ? trackEl.offsetWidth : trackEl.offsetHeight;
      ratio = scrollView[clientWHProperty] / control.scrollLength;
      barSize = ratio * trackElSize;
      control.set(dragWHProperty, barSize);
      control.barSize = barSize;
      syncOnScroll(control);
      control.set("visible", true)
    }else {
      control.set("visible", false)
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
  }}, {ATTRS:{minLength:{value:MIN_BAR_LENGTH}, scrollView:{}, axis:{view:1}, autoHide:{value:S.UA.ios}, visible:{valueFn:function() {
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

