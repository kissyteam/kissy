/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:48
*/
/*
 Combined modules by KISSY Module Compiler: 

 overlay/extension/loading
 overlay/extension/mask
 overlay/extension/overlay-effect
 overlay/overlay-xtpl
 overlay/control
 overlay/dialog-xtpl
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
    if(this._loadingExtEl) {
      this._loadingExtEl.hide()
    }
  }};
  return Loading
});
KISSY.add("overlay/extension/mask", ["ua", "node", "event/gesture/tap"], function(S, require) {
  var UA = require("ua"), Node = require("node"), ie6 = UA.ie === 6, $ = Node.all;
  var TapGesture = require("event/gesture/tap");
  var tap = TapGesture.TAP;
  function docWidth() {
    return ie6 ? "expression(KISSY.DOM.docWidth())" : "100%"
  }
  function docHeight() {
    return ie6 ? "expression(KISSY.DOM.docHeight())" : "100%"
  }
  function initMask(self, hiddenCls) {
    var maskCls = self.getBaseCssClasses("mask"), mask = $("<div " + ' style="width:' + docWidth() + ";" + "left:0;" + "top:0;" + "height:" + docHeight() + ";" + "position:" + (ie6 ? "absolute" : "fixed") + ';"' + ' class="' + maskCls + " " + hiddenCls + '">' + (ie6 ? "<" + "iframe " + 'style="position:absolute;' + "left:" + "0" + ";" + "top:" + "0" + ";" + "background:red;" + "width: expression(this.parentNode.offsetWidth);" + "height: expression(this.parentNode.offsetHeight);" + "filter:alpha(opacity=0);" + 
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
    var maskNode = self.get("maskNode"), hiddenCls = self.getBaseCssClasses("mask-hidden");
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
      self.set("maskNode", initMask(self, self.get("visible") ? "" : self.getBaseCssClasses("mask-hidden")))
    }
  }, __bindUI:function() {
    var self = this, maskNode, mask;
    if(mask = self.get("mask")) {
      maskNode = self.get("maskNode");
      if(mask.closeOnClick) {
        maskNode.on(tap, self.close, self)
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
    ghost.animate(to, {Anim:effectCfg.Anim, duration:duration, easing:easing, complete:function() {
      self.__effectGhost = null;
      ghost.remove();
      el.css("visibility", "")
    }})
  }
  function processEffect(self, show) {
    var el = self.$el, effectCfg = self.get("effect"), effect = effectCfg.effect || "none", target = effectCfg.target;
    if(effect === "none" && !target) {
      return
    }
    if(target) {
      processTarget(self, show);
      return
    }
    var duration = effectCfg.duration, easing = effectCfg.easing, index = show ? 1 : 0;
    el.stop(1, 1);
    el.css({visibility:"visible", display:show ? "none" : "block"});
    var m = effect + effects[effect][index];
    el[m]({duration:duration, Anim:effectCfg.Anim, complete:function() {
      el.css({display:"block", visibility:""})
    }, easing:easing})
  }
  function afterVisibleChange(e) {
    processEffect(this, e.newVal)
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
  }, __bindUI:function() {
    this.on("afterVisibleChange", afterVisibleChange, this)
  }};
  return OverlayEffect
});
KISSY.add("overlay/overlay-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write("");
    var option0 = {escape:1};
    var params1 = [];
    params1.push("ks-overlay-closable");
    option0.params = params1;
    option0.fn = function(scope, buffer) {
      buffer.write("\n    ");
      var option2 = {escape:1};
      var params3 = [];
      var id4 = scope.resolve(["closable"]);
      params3.push(id4);
      option2.params = params3;
      option2.fn = function(scope, buffer) {
        buffer.write('\n        <a href="javascript:void(\'close\')"\n           class="');
        var option5 = {escape:1};
        var params6 = [];
        params6.push("close");
        option5.params = params6;
        var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
        if(commandRet7 && commandRet7.isBuffer) {
          buffer = commandRet7;
          commandRet7 = undefined
        }
        buffer.write(commandRet7, true);
        buffer.write("\"\n           role='button'>\n            <span class=\"");
        var option8 = {escape:1};
        var params9 = [];
        params9.push("close-x");
        option8.params = params9;
        var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
        if(commandRet10 && commandRet10.isBuffer) {
          buffer = commandRet10;
          commandRet10 = undefined
        }
        buffer.write(commandRet10, true);
        buffer.write('">close</span>\n        </a>\n    ');
        return buffer
      };
      buffer = ifCommand.call(engine, scope, option2, buffer, 2, payload);
      buffer.write("\n");
      return buffer
    };
    buffer = blockCommand.call(engine, scope, option0, buffer, 1, payload);
    buffer.write('\n\n<div class="');
    var option11 = {escape:1};
    var params12 = [];
    params12.push("content");
    option11.params = params12;
    var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 11);
    if(commandRet13 && commandRet13.isBuffer) {
      buffer = commandRet13;
      commandRet13 = undefined
    }
    buffer.write(commandRet13, true);
    buffer.write('">\n    ');
    var option14 = {escape:1};
    var params15 = [];
    params15.push("ks-overlay-content");
    option14.params = params15;
    option14.fn = function(scope, buffer) {
      buffer.write("\n        ");
      var id16 = scope.resolve(["content"]);
      buffer.write(id16, false);
      buffer.write("\n    ");
      return buffer
    };
    buffer = blockCommand.call(engine, scope, option14, buffer, 12, payload);
    buffer.write("\n</div>");
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("overlay/control", ["component/container", "component/extension/shim", "component/extension/align", "./extension/loading", "./extension/mask", "./extension/overlay-effect", "component/extension/content-box", "./overlay-xtpl"], function(S, require) {
  var Container = require("component/container");
  var Shim = require("component/extension/shim");
  var AlignExtension = require("component/extension/align");
  var Loading = require("./extension/loading");
  var Mask = require("./extension/mask");
  var OverlayEffect = require("./extension/overlay-effect");
  var ContentBox = require("component/extension/content-box");
  var OverlayTpl = require("./overlay-xtpl");
  var HIDE = "hide", actions = {hide:HIDE, destroy:"destroy"};
  return Container.extend([ContentBox, Shim, Loading, AlignExtension, Mask, OverlayEffect], {bindUI:function() {
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
  }}, {ATTRS:{contentEl:{}, closable:{value:false, sync:0, render:1, parse:function() {
    return!!this.get("closeBtn")
  }}, closeBtn:{selector:function() {
    return"." + this.getBaseCssClass("close")
  }}, closeAction:{value:HIDE}, focusable:{value:false}, allowTextSelection:{value:true}, handleGestureEvents:{value:false}, visible:{value:false}, contentTpl:{value:OverlayTpl}}, xclass:"overlay"})
});
KISSY.add("overlay/dialog-xtpl", ["./overlay-xtpl"], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write("");
    var option0 = {};
    var params1 = [];
    params1.push("./overlay-xtpl");
    option0.params = params1;
    require("./overlay-xtpl");
    option0.params[0] = module.resolve(option0.params[0]);
    var commandRet2 = extendCommand.call(engine, scope, option0, buffer, 1, payload);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, false);
    buffer.write("\n");
    var option3 = {escape:1};
    var params4 = [];
    params4.push("ks-overlay-content");
    option3.params = params4;
    option3.fn = function(scope, buffer) {
      buffer.write('\n    <div class="');
      var option5 = {escape:1};
      var params6 = [];
      params6.push("header");
      option5.params = params6;
      var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 3);
      if(commandRet7 && commandRet7.isBuffer) {
        buffer = commandRet7;
        commandRet7 = undefined
      }
      buffer.write(commandRet7, true);
      buffer.write('"\n         style="\n');
      var option8 = {escape:1};
      var params9 = [];
      var id10 = scope.resolve(["headerStyle"]);
      params9.push(id10);
      option8.params = params9;
      option8.fn = function(scope, buffer) {
        buffer.write("\n ");
        var id11 = scope.resolve(["xindex"]);
        buffer.write(id11, true);
        buffer.write(":");
        var id12 = scope.resolve(["this"]);
        buffer.write(id12, true);
        buffer.write(";\n");
        return buffer
      };
      buffer = eachCommand.call(engine, scope, option8, buffer, 5, payload);
      buffer.write('\n">');
      var id13 = scope.resolve(["headerContent"]);
      buffer.write(id13, false);
      buffer.write('</div>\n\n    <div class="');
      var option14 = {escape:1};
      var params15 = [];
      params15.push("body");
      option14.params = params15;
      var commandRet16 = callCommandUtil(engine, scope, option14, buffer, "getBaseCssClasses", 10);
      if(commandRet16 && commandRet16.isBuffer) {
        buffer = commandRet16;
        commandRet16 = undefined
      }
      buffer.write(commandRet16, true);
      buffer.write('"\n         style="\n');
      var option17 = {escape:1};
      var params18 = [];
      var id19 = scope.resolve(["bodyStyle"]);
      params18.push(id19);
      option17.params = params18;
      option17.fn = function(scope, buffer) {
        buffer.write("\n ");
        var id20 = scope.resolve(["xindex"]);
        buffer.write(id20, true);
        buffer.write(":");
        var id21 = scope.resolve(["this"]);
        buffer.write(id21, true);
        buffer.write(";\n");
        return buffer
      };
      buffer = eachCommand.call(engine, scope, option17, buffer, 12, payload);
      buffer.write('\n">');
      var id22 = scope.resolve(["bodyContent"]);
      buffer.write(id22, false);
      buffer.write('</div>\n\n    <div class="');
      var option23 = {escape:1};
      var params24 = [];
      params24.push("footer");
      option23.params = params24;
      var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 17);
      if(commandRet25 && commandRet25.isBuffer) {
        buffer = commandRet25;
        commandRet25 = undefined
      }
      buffer.write(commandRet25, true);
      buffer.write('"\n         style="\n');
      var option26 = {escape:1};
      var params27 = [];
      var id28 = scope.resolve(["footerStyle"]);
      params27.push(id28);
      option26.params = params27;
      option26.fn = function(scope, buffer) {
        buffer.write("\n ");
        var id29 = scope.resolve(["xindex"]);
        buffer.write(id29, true);
        buffer.write(":");
        var id30 = scope.resolve(["this"]);
        buffer.write(id30, true);
        buffer.write(";\n");
        return buffer
      };
      buffer = eachCommand.call(engine, scope, option26, buffer, 19, payload);
      buffer.write('\n">');
      var id31 = scope.resolve(["footerContent"]);
      buffer.write(id31, false);
      buffer.write('</div>\n    <div tabindex="0"></div>\n');
      return buffer
    };
    buffer = blockCommand.call(engine, scope, option3, buffer, 2, payload);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("overlay/dialog", ["./control", "node", "./dialog-xtpl"], function(S, require) {
  var Overlay = require("./control");
  var Node = require("node");
  var DialogTpl = require("./dialog-xtpl");
  function _setStdModRenderContent(self, part, v) {
    part = self.get(part);
    part.html(v)
  }
  var Dialog = Overlay.extend({beforeCreateDom:function(renderData) {
    S.mix(renderData.elAttrs, {role:"dialog", "aria-labelledby":"ks-stdmod-header-" + this.get("id")})
  }, getChildrenContainerEl:function() {
    return this.get("body")
  }, __afterCreateEffectGhost:function(ghost) {
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
    self.callSuper(v, e);
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
  }, _onSetBodyContent:function(v) {
    _setStdModRenderContent(this, "body", v)
  }, _onSetHeaderContent:function(v) {
    _setStdModRenderContent(this, "header", v)
  }, _onSetFooterContent:function(v) {
    _setStdModRenderContent(this, "footer", v)
  }}, {ATTRS:{contentTpl:{value:DialogTpl}, header:{selector:function() {
    return"." + this.getBaseCssClass("header")
  }}, body:{selector:function() {
    return"." + this.getBaseCssClass("body")
  }}, footer:{selector:function() {
    return"." + this.getBaseCssClass("footer")
  }}, bodyStyle:{value:{}, sync:0}, footerStyle:{value:{}, render:1}, headerStyle:{value:{}, render:1}, headerContent:{value:"", sync:0, render:1, parse:function() {
    return this.get("header").html()
  }}, bodyContent:{value:"", sync:0, render:1, parse:function() {
    return this.get("body").html()
  }}, footerContent:{value:"", sync:0, render:1, parse:function() {
    return this.get("footer").html()
  }}, closable:{value:true}, focusable:{value:true}, escapeToClose:{value:true}}, xclass:"dialog"});
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
  function bindTriggerMouse() {
    var self = this, trigger = self.get("trigger"), timer;
    self.__mouseEnterPopup = function(ev) {
      clearHiddenTimer.call(self);
      timer = S.later(function() {
        showing.call(self, ev);
        timer = undefined
      }, self.get("mouseDelay") * 1E3)
    };
    trigger.on("mouseenter", self.__mouseEnterPopup);
    self._mouseLeavePopup = function() {
      if(timer) {
        timer.cancel();
        timer = undefined
      }
      setHiddenTimer.call(self)
    };
    trigger.on("mouseleave", self._mouseLeavePopup)
  }
  function setHiddenTimer() {
    var self = this;
    var delay = self.get("mouseDelay") * 1E3;
    self._hiddenTimer = S.later(function() {
      hiding.call(self)
    }, delay)
  }
  function clearHiddenTimer() {
    var self = this;
    if(self._hiddenTimer) {
      self._hiddenTimer.cancel();
      self._hiddenTimer = undefined
    }
  }
  function bindTriggerClick() {
    var self = this;
    self.__clickPopup = function(ev) {
      ev.preventDefault();
      if(self.get("toggle")) {
        (self.get("visible") ? hiding : showing).call(self, ev)
      }else {
        showing.call(self, ev)
      }
    };
    self.get("trigger").on("click", self.__clickPopup)
  }
  function showing(ev) {
    var self = this;
    self.set("currentTrigger", S.one(ev.target));
    self.show()
  }
  function hiding() {
    this.set("currentTrigger", undefined);
    this.hide()
  }
  return Overlay.extend({initializer:function() {
    var self = this, trigger = self.get("trigger");
    if(trigger) {
      if(self.get("triggerType") === "mouse") {
        bindTriggerMouse.call(self)
      }else {
        bindTriggerClick.call(self)
      }
    }
  }, bindUI:function() {
    var self = this, trigger = self.get("trigger");
    if(trigger) {
      if(self.get("triggerType") === "mouse") {
        self.$el.on("mouseleave", setHiddenTimer, self).on("mouseenter", clearHiddenTimer, self)
      }
    }
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
    if($el) {
      $el.detach("mouseleave", setHiddenTimer, self).detach("mouseenter", clearHiddenTimer, self)
    }
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

