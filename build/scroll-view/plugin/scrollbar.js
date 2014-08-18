/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:30
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 scroll-view/plugin/scrollbar/scrollbar-xtpl
 scroll-view/plugin/scrollbar/render
 scroll-view/plugin/scrollbar/control
 scroll-view/plugin/scrollbar
*/

KISSY.add("scroll-view/plugin/scrollbar/scrollbar-xtpl", [], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div id="ks-scrollbar-arrow-up-';
    var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '"\n        class="';
    var config2 = {};
    var params3 = [];
    var id4 = getPropertyUtil(engine, scope, "axis", 0, 2);
    params3.push(id4 + "-arrow-up");
    config2.params = params3;
    var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id1, true);
    buffer += '">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-';
    var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 5);
    buffer += renderOutputUtil(id5, true);
    buffer += '"\n        class="';
    var config7 = {};
    var params8 = [];
    var id9 = getPropertyUtil(engine, scope, "axis", 0, 6);
    params8.push(id9 + "-arrow-down");
    config7.params = params8;
    var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 6);
    buffer += renderOutputUtil(id6, true);
    buffer += '">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-';
    var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 9);
    buffer += renderOutputUtil(id10, true);
    buffer += '"\n     class="';
    var config12 = {};
    var params13 = [];
    var id14 = getPropertyUtil(engine, scope, "axis", 0, 10);
    params13.push(id14 + "-track");
    config12.params = params13;
    var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 10);
    buffer += renderOutputUtil(id11, true);
    buffer += '">\n<div id="ks-scrollbar-drag-';
    var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 11);
    buffer += renderOutputUtil(id15, true);
    buffer += '"\n     class="';
    var config17 = {};
    var params18 = [];
    var id19 = getPropertyUtil(engine, scope, "axis", 0, 12);
    params18.push(id19 + "-drag");
    config17.params = params18;
    var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 12);
    buffer += renderOutputUtil(id16, true);
    buffer += '">\n<div class="';
    var config21 = {};
    var params22 = [];
    var id23 = getPropertyUtil(engine, scope, "axis", 0, 13);
    params22.push(id23 + "-drag-top");
    config21.params = params22;
    var id20 = runInlineCommandUtil(engine, scope, config21, "getBaseCssClasses", 13);
    buffer += renderOutputUtil(id20, true);
    buffer += '">\n</div>\n<div class="';
    var config25 = {};
    var params26 = [];
    var id27 = getPropertyUtil(engine, scope, "axis", 0, 15);
    params26.push(id27 + "-drag-center");
    config25.params = params26;
    var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 15);
    buffer += renderOutputUtil(id24, true);
    buffer += '">\n</div>\n<div class="';
    var config29 = {};
    var params30 = [];
    var id31 = getPropertyUtil(engine, scope, "axis", 0, 17);
    params30.push(id31 + "-drag-bottom");
    config29.params = params30;
    var id28 = runInlineCommandUtil(engine, scope, config29, "getBaseCssClasses", 17);
    buffer += renderOutputUtil(id28, true);
    buffer += '">\n</div>\n</div>\n</div>';
    return buffer
  }
});
KISSY.add("scroll-view/plugin/scrollbar/render", ["component/control", "./scrollbar-xtpl"], function(S, require) {
  var Control = require("component/control");
  var ScrollBarTpl = require("./scrollbar-xtpl");
  var isTransform3dSupported = S.Features.isTransform3dSupported();
  var supportCss3 = S.Features.getVendorCssPropPrefix("transform") !== false;
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
    var transformProperty = S.Features.getVendorCssPropName("transform");
    methods._onSetDragLeft = function(v) {
      this.control.dragEl.style[transformProperty] = "translateX(" + v + "px)" + " translateY(" + this.control.get("dragTop") + "px)" + (isTransform3dSupported ? " translateZ(0)" : "")
    };
    methods._onSetDragTop = function(v) {
      this.control.dragEl.style[transformProperty] = "translateX(" + this.control.get("dragLeft") + "px)" + " translateY(" + v + "px)" + (isTransform3dSupported ? " translateZ(0)" : "")
    }
  }
  return Control.getDefaultRender().extend(methods, {ATTRS:{contentTpl:{value:ScrollBarTpl}}})
});
KISSY.add("scroll-view/plugin/scrollbar/control", ["node", "component/control", "./render"], function(S, require) {
  var Node = require("node");
  var $document = Node.all(document);
  var Control = require("component/control");
  var ScrollBarRender = require("./render");
  var MIN_BAR_LENGTH = 20;
  var SCROLLBAR_EVENT_NS = ".ks-scrollbar";
  var Gesture = Node.Gesture;
  function preventDefault(e) {
    e.preventDefault()
  }
  function onDragStartHandler(e) {
    e.stopPropagation();
    if(!e.isTouch) {
      e.preventDefault()
    }
    var self = this;
    if(self.get("disabled")) {
      return
    }
    self.startMousePos = e[self.pageXyProperty];
    self.startScroll = self.scrollView.get(self.scrollProperty);
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self)
  }
  function onDragHandler(e) {
    var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    scrollView.scrollToWithBounds(scrollCfg)
  }
  function onDragEndHandler() {
    $document.detach(Gesture.move, onDragHandler, this).detach(Gesture.end, onDragEndHandler, this)
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
    if(this.get("disabled")) {
      return
    }
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
    if(self.get("disabled")) {
      return
    }
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
  }, bindUI:function() {
    var self = this, autoHide = self.get("autoHide"), scrollView = self.scrollView;
    if(autoHide) {
      self.hideFn = S.bind(self.hide, self)
    }else {
      S.each([self.$downBtn, self.$upBtn], function(b) {
        b.on(Gesture.start, onUpDownBtnMouseDown, self).on(Gesture.end, onUpDownBtnMouseUp, self)
      });
      self.$trackEl.on(Gesture.start, onTrackElMouseDown, self);
      self.$dragEl.on("dragstart", preventDefault).on(Gesture.start, onDragStartHandler, self)
    }
    scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on("scrollEnd" + SCROLLBAR_EVENT_NS, onScrollEnd, self).on("afterDisabledChange" + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on("reflow" + SCROLLBAR_EVENT_NS, onScrollViewReflow, self)
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

