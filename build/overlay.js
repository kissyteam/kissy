/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:29
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 overlay/extension/loading
 overlay/extension/mask
 overlay/close-xtpl
 overlay/overlay-xtpl
 overlay/overlay-render
 overlay/extension/overlay-effect
 overlay/control
 overlay/dialog-xtpl
 overlay/dialog-render
 overlay/dialog
 overlay/popup
 overlay
*/

KISSY.add("overlay/extension/loading", ["node"], function(S, require) {
  var Node = require("node");
  function Loading() {
  }
  Loading.prototype = {loading:function() {
    var self = this;
    if(!self._loadingExtEl) {
      self._loadingExtEl = (new Node("<div " + 'class="' + self.get("prefixCls") + 'ext-loading"' + ' style="position: absolute;' + "border: none;" + "width: 100%;" + "top: 0;" + "left: 0;" + "z-index: 99999;" + "height:100%;" + "*height: expression(this.parentNode.offsetHeight);" + '"/>')).appendTo(self.$el)
    }
    self._loadingExtEl.show()
  }, unloading:function() {
    var lel = this._loadingExtEl;
    if(lel) {
      lel.hide()
    }
  }};
  return Loading
});
KISSY.add("overlay/extension/mask", ["node"], function(S, require) {
  var UA = S.UA, Node = require("node"), ie6 = UA.ie === 6, $ = Node.all;
  function docWidth() {
    return ie6 ? "expression(KISSY.DOM.docWidth())" : "100%"
  }
  function docHeight() {
    return ie6 ? "expression(KISSY.DOM.docHeight())" : "100%"
  }
  function initMask(self, hiddenCls) {
    var maskCls = self.view.getBaseCssClasses("mask"), mask = $("<div " + ' style="width:' + docWidth() + ";" + "left:0;" + "top:0;" + "height:" + docHeight() + ";" + "position:" + (ie6 ? "absolute" : "fixed") + ';"' + ' class="' + maskCls + " " + hiddenCls + '">' + (ie6 ? "<" + "iframe " + 'style="position:absolute;' + "left:" + "0" + ";" + "top:" + "0" + ";" + "background:red;" + "width: expression(this.parentNode.offsetWidth);" + "height: expression(this.parentNode.offsetHeight);" + "filter:alpha(opacity=0);" + 
    'z-index:-1;"></iframe>' : "") + "</div>").prependTo("body");
    mask.unselectable();
    mask.on("mousedown", function(e) {
      e.preventDefault()
    });
    return mask
  }
  function Mask() {
  }
  Mask.ATTRS = {mask:{value:false}, maskNode:{}};
  var NONE = "none", effects = {fade:["Out", "In"], slide:["Up", "Down"]};
  function setMaskVisible(self, shown) {
    var maskNode = self.get("maskNode"), hiddenCls = self.view.getBaseCssClasses("mask-hidden");
    if(shown) {
      maskNode.removeClass(hiddenCls)
    }else {
      maskNode.addClass(hiddenCls)
    }
  }
  function processMask(mask, el, show, self) {
    var effect = mask.effect || NONE;
    setMaskVisible(self, show);
    if(effect === NONE) {
      return
    }
    var duration = mask.duration, easing = mask.easing, m, index = show ? 1 : 0;
    el.stop(1, 1);
    el.css("display", show ? NONE : "block");
    m = effect + effects[effect][index];
    el[m](duration, function() {
      el.css("display", "")
    }, easing)
  }
  function afterVisibleChange(e) {
    var v, self = this, maskNode = self.get("maskNode");
    if(v = e.newVal) {
      var elZIndex = Number(self.$el.css("z-index"));
      if(!isNaN(elZIndex)) {
        maskNode.css("z-index", elZIndex)
      }
    }
    processMask(self.get("mask"), maskNode, v, self)
  }
  Mask.prototype = {__renderUI:function() {
    var self = this;
    if(self.get("mask")) {
      self.set("maskNode", initMask(self, self.get("visible") ? "" : self.view.getBaseCssClasses("mask-hidden")))
    }
  }, __bindUI:function() {
    var self = this, maskNode, mask;
    if(mask = self.get("mask")) {
      maskNode = self.get("maskNode");
      if(mask.closeOnClick) {
        maskNode.on(Node.Gesture.tap, self.close, self)
      }
      self.on("afterVisibleChange", afterVisibleChange)
    }
  }, __destructor:function() {
    var mask;
    if(mask = this.get("maskNode")) {
      mask.remove()
    }
  }};
  return Mask
});
KISSY.add("overlay/close-xtpl", [], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config0 = {};
    var params1 = [];
    var id2 = getPropertyUtil(engine, scope, "closable", 0, 1);
    params1.push(id2);
    config0.params = params1;
    config0.fn = function(scope) {
      var buffer = "";
      buffer += '\n<a href="javascript:void(\'close\')"\n   id="ks-overlay-close-';
      var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
      buffer += renderOutputUtil(id3, true);
      buffer += '"\n   class="';
      var config5 = {};
      var params6 = [];
      params6.push("close");
      config5.params = params6;
      var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 4);
      buffer += renderOutputUtil(id4, true);
      buffer += "\"\n   role='button'>\n    <span class=\"";
      var config8 = {};
      var params9 = [];
      params9.push("close-x");
      config8.params = params9;
      var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 6);
      buffer += renderOutputUtil(id7, true);
      buffer += '">close</span>\n</a>\n';
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config0, "if", 1);
    buffer += "\n";
    return buffer
  }
});
KISSY.add("overlay/overlay-xtpl", ["overlay/close-xtpl", "component/extension/content-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config1 = {};
    var params2 = [];
    params2.push("overlay/close-xtpl");
    config1.params = params2;
    if(moduleWrap) {
      require("overlay/close-xtpl");
      config1.params[0] = moduleWrap.resolveByName(config1.params[0])
    }
    var id0 = runInlineCommandUtil(engine, scope, config1, "include", 1);
    buffer += renderOutputUtil(id0, false);
    buffer += "\n";
    var config4 = {};
    var params5 = [];
    params5.push("component/extension/content-xtpl");
    config4.params = params5;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      config4.params[0] = moduleWrap.resolveByName(config4.params[0])
    }
    var id3 = runInlineCommandUtil(engine, scope, config4, "include", 2);
    buffer += renderOutputUtil(id3, false);
    return buffer
  }
});
KISSY.add("overlay/overlay-render", ["component/container", "./overlay-xtpl", "component/extension/content-render"], function(S, require) {
  var Container = require("component/container");
  var OverlayTpl = require("./overlay-xtpl");
  var ContentRenderExtension = require("component/extension/content-render");
  return Container.getDefaultRender().extend([ContentRenderExtension], {createDom:function() {
    this.fillChildrenElsBySelectors({closeBtn:"#ks-overlay-close-{id}"})
  }}, {ATTRS:{contentTpl:{value:OverlayTpl}}, HTML_PARSER:{closeBtn:function(el) {
    return el.one("." + this.getBaseCssClass("close"))
  }}})
});
KISSY.add("overlay/extension/overlay-effect", [], function(S) {
  var effects = {fade:["Out", "In"], slide:["Up", "Down"]};
  function getGhost(self) {
    var el = self.$el, ghost = el.clone(true);
    ghost.css({visibility:"visible", overflow:"hidden"}).addClass(self.get("prefixCls") + "overlay-ghost");
    return self.__afterCreateEffectGhost(ghost)
  }
  function processTarget(self, show) {
    if(self.__effectGhost) {
      self.__effectGhost.stop(1, 1)
    }
    var el = self.$el, $ = S.all, effectCfg = self.get("effect"), target = $(effectCfg.target), duration = effectCfg.duration, targetBox = {width:target.width(), height:target.height()}, targetOffset = target.offset(), elBox = {width:el.width(), height:el.height()}, elOffset = el.offset(), from, to, fromOffset, toOffset, ghost = getGhost(self), easing = effectCfg.easing;
    ghost.insertAfter(el);
    if(show) {
      from = targetBox;
      fromOffset = targetOffset;
      to = elBox;
      toOffset = elOffset
    }else {
      from = elBox;
      fromOffset = elOffset;
      to = targetBox;
      toOffset = targetOffset
    }
    ghost.offset(toOffset);
    S.mix(to, {left:ghost.css("left"), top:ghost.css("top")});
    el.css("visibility", "hidden");
    ghost.css(from);
    ghost.offset(fromOffset);
    self.__effectGhost = ghost;
    ghost.css("visibility", "visible");
    ghost.animate(to, {Anim:effectCfg.Anim, duration:duration, easing:easing, complete:function() {
      self.__effectGhost = null;
      ghost.remove();
      el.css("visibility", "")
    }})
  }
  function processEffect(self, show, callback) {
    var el = self.$el, effectCfg = self.get("effect"), effect = effectCfg.effect || "none", target = effectCfg.target;
    if(effect === "none" && !target) {
      callback();
      return
    }
    if(target) {
      processTarget(self, show, callback);
      return
    }
    var duration = effectCfg.duration, easing = effectCfg.easing, index = show ? 1 : 0;
    el.stop(1, 1);
    el.css({visibility:"visible", display:show ? "none" : "block"});
    var m = effect + effects[effect][index];
    el[m](duration, function() {
      el.css({display:"block", visibility:""});
      callback()
    }, easing)
  }
  function OverlayEffect() {
  }
  OverlayEffect.ATTRS = {effect:{value:{effect:"", target:null, duration:0.5, easing:"easeOut"}, setter:function(v) {
    var effect = v.effect;
    if(typeof effect === "string" && !effects[effect]) {
      v.effect = ""
    }
  }}};
  OverlayEffect.prototype = {__afterCreateEffectGhost:function(ghost) {
    return ghost
  }, _onSetVisible:function(v) {
    var self = this;
    processEffect(self, v, function() {
      self.fire(v ? "show" : "hide")
    })
  }};
  return OverlayEffect
});
KISSY.add("overlay/control", ["component/container", "component/extension/shim", "component/extension/align", "./extension/loading", "./extension/mask", "./overlay-render", "./extension/overlay-effect"], function(S, require) {
  var Container = require("component/container");
  var Shim = require("component/extension/shim");
  var AlignExtension = require("component/extension/align");
  var Loading = require("./extension/loading");
  var Mask = require("./extension/mask");
  var OverlayRender = require("./overlay-render");
  var OverlayEffect = require("./extension/overlay-effect");
  var HIDE = "hide", actions = {hide:HIDE, destroy:"destroy"};
  return Container.extend([Shim, Loading, AlignExtension, Mask, OverlayEffect], {bindUI:function() {
    var self = this, closeBtn = self.get("closeBtn");
    if(closeBtn) {
      closeBtn.on("click", function(ev) {
        self.close();
        ev.preventDefault()
      })
    }
  }, close:function() {
    var self = this;
    self[actions[self.get("closeAction")] || HIDE]();
    return self
  }}, {ATTRS:{contentEl:{}, closable:{value:false, view:1}, closeBtn:{view:1}, closeAction:{value:HIDE}, focusable:{value:false}, allowTextSelection:{value:true}, handleMouseEvents:{value:false}, visible:{value:false}, xrender:{value:OverlayRender}}, xclass:"overlay"})
});
KISSY.add("overlay/dialog-xtpl", ["overlay/close-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config1 = {};
    var params2 = [];
    params2.push("overlay/close-xtpl");
    config1.params = params2;
    if(moduleWrap) {
      require("overlay/close-xtpl");
      config1.params[0] = moduleWrap.resolveByName(config1.params[0])
    }
    var id0 = runInlineCommandUtil(engine, scope, config1, "include", 1);
    buffer += renderOutputUtil(id0, false);
    buffer += '\n<div id="ks-content-';
    var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '"\n     class="';
    var config5 = {};
    var params6 = [];
    params6.push("content");
    config5.params = params6;
    var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
    buffer += renderOutputUtil(id4, true);
    buffer += '">\n    <div class="';
    var config8 = {};
    var params9 = [];
    params9.push("header");
    config8.params = params9;
    var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 4);
    buffer += renderOutputUtil(id7, true);
    buffer += '"\n         style="\n';
    var config10 = {};
    var params11 = [];
    var id12 = getPropertyUtil(engine, scope, "headerStyle", 0, 6);
    params11.push(id12);
    config10.params = params11;
    config10.fn = function(scope) {
      var buffer = "";
      buffer += " \n ";
      var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 7);
      buffer += renderOutputUtil(id13, true);
      buffer += ":";
      var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 7);
      buffer += renderOutputUtil(id14, true);
      buffer += ";\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config10, "each", 6);
    buffer += '\n"\n         id="ks-stdmod-header-';
    var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10);
    buffer += renderOutputUtil(id15, true);
    buffer += '">';
    var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "headerContent", 0, 10);
    buffer += renderOutputUtil(id16, false);
    buffer += '</div>\n\n    <div class="';
    var config18 = {};
    var params19 = [];
    params19.push("body");
    config18.params = params19;
    var id17 = runInlineCommandUtil(engine, scope, config18, "getBaseCssClasses", 12);
    buffer += renderOutputUtil(id17, true);
    buffer += '"\n         style="\n';
    var config20 = {};
    var params21 = [];
    var id22 = getPropertyUtil(engine, scope, "bodyStyle", 0, 14);
    params21.push(id22);
    config20.params = params21;
    config20.fn = function(scope) {
      var buffer = "";
      buffer += " \n ";
      var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 15);
      buffer += renderOutputUtil(id23, true);
      buffer += ":";
      var id24 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 15);
      buffer += renderOutputUtil(id24, true);
      buffer += ";\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config20, "each", 14);
    buffer += '\n"\n         id="ks-stdmod-body-';
    var id25 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 18);
    buffer += renderOutputUtil(id25, true);
    buffer += '">';
    var id26 = getPropertyOrRunCommandUtil(engine, scope, {}, "bodyContent", 0, 18);
    buffer += renderOutputUtil(id26, false);
    buffer += '</div>\n\n    <div class="';
    var config28 = {};
    var params29 = [];
    params29.push("footer");
    config28.params = params29;
    var id27 = runInlineCommandUtil(engine, scope, config28, "getBaseCssClasses", 20);
    buffer += renderOutputUtil(id27, true);
    buffer += '"\n         style="\n';
    var config30 = {};
    var params31 = [];
    var id32 = getPropertyUtil(engine, scope, "footerStyle", 0, 22);
    params31.push(id32);
    config30.params = params31;
    config30.fn = function(scope) {
      var buffer = "";
      buffer += " \n ";
      var id33 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 23);
      buffer += renderOutputUtil(id33, true);
      buffer += ":";
      var id34 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 23);
      buffer += renderOutputUtil(id34, true);
      buffer += ";\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config30, "each", 22);
    buffer += '\n"\n         id="ks-stdmod-footer-';
    var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 26);
    buffer += renderOutputUtil(id35, true);
    buffer += '">';
    var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "footerContent", 0, 26);
    buffer += renderOutputUtil(id36, false);
    buffer += '</div>\n</div>\n<div tabindex="0"></div>';
    return buffer
  }
});
KISSY.add("overlay/dialog-render", ["./overlay-render", "./dialog-xtpl"], function(S, require) {
  var OverlayRender = require("./overlay-render");
  var DialogTpl = require("./dialog-xtpl");
  function _setStdModRenderContent(self, part, v) {
    part = self.control.get(part);
    part.html(v)
  }
  return OverlayRender.extend({beforeCreateDom:function(renderData) {
    S.mix(renderData.elAttrs, {role:"dialog", "aria-labelledby":"ks-stdmod-header-" + this.control.get("id")})
  }, createDom:function() {
    this.fillChildrenElsBySelectors({header:"#ks-stdmod-header-{id}", body:"#ks-stdmod-body-{id}", footer:"#ks-stdmod-footer-{id}"})
  }, getChildrenContainerEl:function() {
    return this.control.get("body")
  }, _onSetBodyStyle:function(v) {
    this.control.get("body").css(v)
  }, _onSetHeaderStyle:function(v) {
    this.control.get("header").css(v)
  }, _onSetFooterStyle:function(v) {
    this.control.get("footer").css(v)
  }, _onSetBodyContent:function(v) {
    _setStdModRenderContent(this, "body", v)
  }, _onSetHeaderContent:function(v) {
    _setStdModRenderContent(this, "header", v)
  }, _onSetFooterContent:function(v) {
    _setStdModRenderContent(this, "footer", v)
  }}, {ATTRS:{contentTpl:{value:DialogTpl}}, HTML_PARSER:{header:function(el) {
    return el.one("." + this.getBaseCssClass("header"))
  }, body:function(el) {
    return el.one("." + this.getBaseCssClass("body"))
  }, footer:function(el) {
    return el.one("." + this.getBaseCssClass("footer"))
  }, headerContent:function(el) {
    return el.one("." + this.getBaseCssClass("header")).html()
  }, bodyContent:function(el) {
    return el.one("." + this.getBaseCssClass("body")).html()
  }, footerContent:function(el) {
    var footer = el.one("." + this.getBaseCssClass("footer"));
    return footer && footer.html()
  }}})
});
KISSY.add("overlay/dialog", ["./control", "./dialog-render", "node"], function(S, require) {
  var Overlay = require("./control");
  var DialogRender = require("./dialog-render");
  var Node = require("node");
  var Dialog = Overlay.extend({__afterCreateEffectGhost:function(ghost) {
    var self = this, elBody = self.get("body");
    ghost.all("." + self.get("prefixCls") + "stdmod-body").css({height:elBody.height(), width:elBody.width()}).html("");
    return ghost
  }, handleKeyDownInternal:function(e) {
    if(this.get("escapeToClose") && e.keyCode === Node.KeyCode.ESC) {
      if(!(e.target.nodeName.toLowerCase() === "select" && !e.target.disabled)) {
        this.close();
        e.halt()
      }
      return
    }
    trapFocus.call(this, e)
  }, _onSetVisible:function(v, e) {
    var self = this, el = self.el;
    if(v) {
      self.__lastActive = el.ownerDocument.activeElement;
      self.focus();
      el.setAttribute("aria-hidden", "false")
    }else {
      el.setAttribute("aria-hidden", "true");
      try {
        if(self.__lastActive) {
          self.__lastActive.focus()
        }
      }catch(ee) {
      }
    }
    self.callSuper(v, e)
  }}, {ATTRS:{header:{view:1}, body:{view:1}, footer:{view:1}, bodyStyle:{value:{}, view:1}, footerStyle:{value:{}, view:1}, headerStyle:{value:{}, view:1}, headerContent:{value:"", view:1}, bodyContent:{value:"", view:1}, footerContent:{value:"", view:1}, closable:{value:true}, xrender:{value:DialogRender}, focusable:{value:true}, escapeToClose:{value:true}}, xclass:"dialog"});
  var KEY_TAB = Node.KeyCode.TAB;
  function trapFocus(e) {
    var self = this, keyCode = e.keyCode;
    if(keyCode !== KEY_TAB) {
      return
    }
    var $el = self.$el;
    var node = Node.all(e.target);
    var lastFocusItem = $el.last();
    if(node.equals($el) && e.shiftKey) {
      lastFocusItem[0].focus();
      e.halt()
    }else {
      if(node.equals(lastFocusItem) && !e.shiftKey) {
        self.focus();
        e.halt()
      }else {
        if(node.equals($el) || $el.contains(node)) {
          return
        }
      }
    }
    e.halt()
  }
  return Dialog
});
KISSY.add("overlay/popup", ["./control"], function(S, require) {
  var Overlay = require("./control");
  return Overlay.extend({initializer:function() {
    var self = this, trigger = self.get("trigger");
    if(trigger) {
      if(self.get("triggerType") === "mouse") {
        self._bindTriggerMouse();
        self.on("afterRenderUI", function() {
          self._bindContainerMouse()
        })
      }else {
        self._bindTriggerClick()
      }
    }
  }, _bindTriggerMouse:function() {
    var self = this, trigger = self.get("trigger"), timer;
    self.__mouseEnterPopup = function(ev) {
      self._clearHiddenTimer();
      timer = S.later(function() {
        self._showing(ev);
        timer = undefined
      }, self.get("mouseDelay") * 1E3)
    };
    trigger.on("mouseenter", self.__mouseEnterPopup);
    self._mouseLeavePopup = function() {
      if(timer) {
        timer.cancel();
        timer = undefined
      }
      self._setHiddenTimer()
    };
    trigger.on("mouseleave", self._mouseLeavePopup)
  }, _bindContainerMouse:function() {
    var self = this;
    self.$el.on("mouseleave", self._setHiddenTimer, self).on("mouseenter", self._clearHiddenTimer, self)
  }, _setHiddenTimer:function() {
    var self = this;
    self._hiddenTimer = S.later(function() {
      self._hiding()
    }, self.get("mouseDelay") * 1E3)
  }, _clearHiddenTimer:function() {
    var self = this;
    if(self._hiddenTimer) {
      self._hiddenTimer.cancel();
      self._hiddenTimer = undefined
    }
  }, _bindTriggerClick:function() {
    var self = this;
    self.__clickPopup = function(ev) {
      ev.preventDefault();
      if(self.get("toggle")) {
        self[self.get("visible") ? "_hiding" : "_showing"](ev)
      }else {
        self._showing(ev)
      }
    };
    self.get("trigger").on("click", self.__clickPopup)
  }, _showing:function(ev) {
    var self = this;
    self.set("currentTrigger", S.one(ev.target));
    self.show()
  }, _hiding:function() {
    this.set("currentTrigger", undefined);
    this.hide()
  }, destructor:function() {
    var self = this, $el = self.$el, t = self.get("trigger");
    if(t) {
      if(self.__clickPopup) {
        t.detach("click", self.__clickPopup)
      }
      if(self.__mouseEnterPopup) {
        t.detach("mouseenter", self.__mouseEnterPopup)
      }
      if(self._mouseLeavePopup) {
        t.detach("mouseleave", self._mouseLeavePopup)
      }
    }
    $el.detach("mouseleave", self._setHiddenTimer, self).detach("mouseenter", self._clearHiddenTimer, self)
  }}, {ATTRS:{trigger:{setter:function(v) {
    return S.all(v)
  }}, triggerType:{value:"click"}, currentTrigger:{}, mouseDelay:{value:0.1}, toggle:{value:false}}, xclass:"popup"})
});
KISSY.add("overlay", ["overlay/control", "overlay/dialog", "overlay/popup"], function(S, require) {
  var O = require("overlay/control");
  var D = require("overlay/dialog");
  var P = require("overlay/popup");
  O.Dialog = D;
  S.Dialog = D;
  O.Popup = P;
  S.Overlay = O;
  return O
});

