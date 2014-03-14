/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:40
*/
/*
 Combined modules by KISSY Module Compiler: 

 overlay/extension/loading
 overlay/extension/mask
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
KISSY.add("overlay/overlay-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += "";
    var option0 = {};
    var params1 = [];
    params1.push("ks-overlay-closable");
    option0.params = params1;
    option0.fn = function(scope) {
      var buffer = "";
      buffer += "\n    ";
      var option2 = {};
      var params3 = [];
      var id4 = scope.resolve(["closable"]);
      params3.push(id4);
      option2.params = params3;
      option2.fn = function(scope) {
        var buffer = "";
        buffer += '\n        <a href="javascript:void(\'close\')"\n           id="ks-overlay-close-';
        var id5 = scope.resolve(["id"]);
        buffer += escapeHtml(id5);
        buffer += '"\n           class="';
        var option7 = {};
        var params8 = [];
        params8.push("close");
        option7.params = params8;
        var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 5);
        buffer += escapeHtml(id6);
        buffer += "\"\n           role='button'>\n            <span class=\"";
        var option10 = {};
        var params11 = [];
        params11.push("close-x");
        option10.params = params11;
        var id9 = callCommandUtil(engine, scope, option10, "getBaseCssClasses", 7);
        buffer += escapeHtml(id9);
        buffer += '">close</span>\n        </a>\n    ';
        return buffer
      };
      buffer += ifCommand.call(engine, scope, option2, payload);
      buffer += "\n";
      return buffer
    };
    buffer += blockCommand.call(engine, scope, option0, payload);
    buffer += '\n\n<div id="ks-content-';
    var id12 = scope.resolve(["id"]);
    buffer += escapeHtml(id12);
    buffer += '"\n     class="';
    var option14 = {};
    var params15 = [];
    params15.push("content");
    option14.params = params15;
    var id13 = callCommandUtil(engine, scope, option14, "getBaseCssClasses", 13);
    buffer += escapeHtml(id13);
    buffer += '">\n    ';
    var option16 = {};
    var params17 = [];
    params17.push("ks-overlay-content");
    option16.params = params17;
    option16.fn = function(scope) {
      var buffer = "";
      buffer += "\n        ";
      var id18 = scope.resolve(["content"]);
      if(id18 || id18 === 0) {
        buffer += id18
      }
      buffer += "\n    ";
      return buffer
    };
    buffer += blockCommand.call(engine, scope, option16, payload);
    buffer += "\n</div>";
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
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
  function processTarget(self, show, callback) {
    if(self.__effectGhost) {
      self.__effectGhost.stop(1, 1)
    }
    var el = self.$el, $ = S.all, effectCfg = self.get("effect"), target = $(effectCfg.target), duration = effectCfg.duration, targetBox = S.mix(target.offset(), {width:target.width(), height:target.height()}), elBox = S.mix(el.offset(), {width:el.width(), height:el.height()}), from, to, ghost = getGhost(self), easing = effectCfg.easing;
    ghost.insertAfter(el);
    if(show) {
      from = targetBox;
      to = elBox
    }else {
      from = elBox;
      to = targetBox
    }
    el.css("visibility", "hidden");
    ghost.css(from);
    self.__effectGhost = ghost;
    ghost.animate(to, {duration:duration, easing:easing, complete:function() {
      self.__effectGhost = null;
      ghost.remove();
      el.css("visibility", "");
      callback()
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
  }}, {ATTRS:{contentEl:{}, closable:{value:false, view:1}, closeBtn:{view:1}, closeAction:{value:HIDE}, focusable:{value:false}, allowTextSelection:{value:true}, handleGestureEvents:{value:false}, visible:{value:false}, xrender:{value:OverlayRender}}, xclass:"overlay"})
});
KISSY.add("overlay/dialog-xtpl", ["./overlay-xtpl"], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += "";
    var option1 = {};
    var params2 = [];
    params2.push("./overlay-xtpl");
    option1.params = params2;
    if(moduleWrap) {
      require("./overlay-xtpl");
      option1.params[0] = moduleWrap.resolveByName(option1.params[0])
    }
    var id0 = extendCommand.call(engine, scope, option1, payload);
    if(id0 || id0 === 0) {
      buffer += id0
    }
    buffer += "\n";
    var option3 = {};
    var params4 = [];
    params4.push("ks-overlay-content");
    option3.params = params4;
    option3.fn = function(scope) {
      var buffer = "";
      buffer += '\n    <div class="';
      var option6 = {};
      var params7 = [];
      params7.push("header");
      option6.params = params7;
      var id5 = callCommandUtil(engine, scope, option6, "getBaseCssClasses", 3);
      buffer += escapeHtml(id5);
      buffer += '"\n         style="\n';
      var option8 = {};
      var params9 = [];
      var id10 = scope.resolve(["headerStyle"]);
      params9.push(id10);
      option8.params = params9;
      option8.fn = function(scope) {
        var buffer = "";
        buffer += "\n ";
        var id11 = scope.resolve(["xindex"]);
        buffer += escapeHtml(id11);
        buffer += ":";
        var id12 = scope.resolve(["this"]);
        buffer += escapeHtml(id12);
        buffer += ";\n";
        return buffer
      };
      buffer += eachCommand.call(engine, scope, option8, payload);
      buffer += '\n"\n         id="ks-stdmod-header-';
      var id13 = scope.resolve(["id"]);
      buffer += escapeHtml(id13);
      buffer += '">';
      var id14 = scope.resolve(["headerContent"]);
      if(id14 || id14 === 0) {
        buffer += id14
      }
      buffer += '</div>\n\n    <div class="';
      var option16 = {};
      var params17 = [];
      params17.push("body");
      option16.params = params17;
      var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 11);
      buffer += escapeHtml(id15);
      buffer += '"\n         style="\n';
      var option18 = {};
      var params19 = [];
      var id20 = scope.resolve(["bodyStyle"]);
      params19.push(id20);
      option18.params = params19;
      option18.fn = function(scope) {
        var buffer = "";
        buffer += "\n ";
        var id21 = scope.resolve(["xindex"]);
        buffer += escapeHtml(id21);
        buffer += ":";
        var id22 = scope.resolve(["this"]);
        buffer += escapeHtml(id22);
        buffer += ";\n";
        return buffer
      };
      buffer += eachCommand.call(engine, scope, option18, payload);
      buffer += '\n"\n         id="ks-stdmod-body-';
      var id23 = scope.resolve(["id"]);
      buffer += escapeHtml(id23);
      buffer += '">';
      var id24 = scope.resolve(["bodyContent"]);
      if(id24 || id24 === 0) {
        buffer += id24
      }
      buffer += '</div>\n\n    <div class="';
      var option26 = {};
      var params27 = [];
      params27.push("footer");
      option26.params = params27;
      var id25 = callCommandUtil(engine, scope, option26, "getBaseCssClasses", 19);
      buffer += escapeHtml(id25);
      buffer += '"\n         style="\n';
      var option28 = {};
      var params29 = [];
      var id30 = scope.resolve(["footerStyle"]);
      params29.push(id30);
      option28.params = params29;
      option28.fn = function(scope) {
        var buffer = "";
        buffer += "\n ";
        var id31 = scope.resolve(["xindex"]);
        buffer += escapeHtml(id31);
        buffer += ":";
        var id32 = scope.resolve(["this"]);
        buffer += escapeHtml(id32);
        buffer += ";\n";
        return buffer
      };
      buffer += eachCommand.call(engine, scope, option28, payload);
      buffer += '\n"\n         id="ks-stdmod-footer-';
      var id33 = scope.resolve(["id"]);
      buffer += escapeHtml(id33);
      buffer += '">';
      var id34 = scope.resolve(["footerContent"]);
      if(id34 || id34 === 0) {
        buffer += id34
      }
      buffer += '</div>\n    <div tabindex="0"></div>\n';
      return buffer
    };
    buffer += blockCommand.call(engine, scope, option3, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
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

