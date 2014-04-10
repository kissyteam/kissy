/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 20:12
*/
/*
 Combined modules by KISSY Module Compiler: 

 navigation-view/bar/bar-xtpl
 navigation-view/bar
*/

KISSY.add("navigation-view/bar/bar-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write("");
    var option0 = {escape:1};
    var params1 = [];
    var id2 = scope.resolve(["withTitle"]);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function(scope, buffer) {
      buffer.write('\r\n<div class="');
      var option3 = {escape:1};
      var params4 = [];
      params4.push("title-wrap");
      option3.params = params4;
      var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
      if(commandRet5 && commandRet5.isBuffer) {
        buffer = commandRet5;
        commandRet5 = undefined
      }
      buffer.write(commandRet5, true);
      buffer.write('">\r\n    <div class="');
      var option6 = {escape:1};
      var params7 = [];
      params7.push("title");
      option6.params = params7;
      var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
      if(commandRet8 && commandRet8.isBuffer) {
        buffer = commandRet8;
        commandRet8 = undefined
      }
      buffer.write(commandRet8, true);
      buffer.write('">');
      var id9 = scope.resolve(["title"]);
      buffer.write(id9, true);
      buffer.write("</div>\r\n</div>\r\n");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
    buffer.write('\r\n<div class="');
    var option10 = {escape:1};
    var params11 = [];
    params11.push("content");
    option10.params = params11;
    var commandRet12 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 6);
    if(commandRet12 && commandRet12.isBuffer) {
      buffer = commandRet12;
      commandRet12 = undefined
    }
    buffer.write(commandRet12, true);
    buffer.write('">\r\n    <div class="');
    var option13 = {escape:1};
    var params14 = [];
    params14.push("center");
    option13.params = params14;
    var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 7);
    if(commandRet15 && commandRet15.isBuffer) {
      buffer = commandRet15;
      commandRet15 = undefined
    }
    buffer.write(commandRet15, true);
    buffer.write('"></div>\r\n</div>');
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("navigation-view/bar", ["component/control", "button", "./bar/bar-xtpl"], function(S, require) {
  var Control = require("component/control");
  var Button = require("button");
  var tpl = require("./bar/bar-xtpl");
  function createGhost(elem) {
    var ghost, width;
    ghost = elem.clone(true);
    ghost[0].id = elem[0].id + "-proxy";
    elem.parent().append(ghost);
    var offset = elem.offset();
    ghost.css("position", "absolute");
    ghost.offset(offset);
    ghost.css({width:width = elem.css("width"), height:elem.css("height")});
    return ghost
  }
  function anim(el, props, complete) {
    el.animate(props, {duration:0.25, easing:"ease-in-out", complete:complete})
  }
  function getAnimProps(self, backEl, backElProps, reverse) {
    var barElement = self.get("el"), titleElement = self.get("titleEl"), minOffset = Math.min(barElement[0].offsetWidth / 3, 200), newLeftWidth = backEl[0].offsetWidth, barWidth = barElement[0].offsetWidth, titleX = titleElement.offset().left - barElement.offset().left, titleWidth = titleElement[0].offsetWidth, oldBackWidth = backElProps.width, newOffset, oldOffset, backElAnims, titleAnims, omega, theta;
    if(reverse) {
      newOffset = -oldBackWidth;
      oldOffset = Math.min(titleX - oldBackWidth, minOffset)
    }else {
      oldOffset = -oldBackWidth;
      newOffset = Math.min(titleX, minOffset)
    }
    backElAnims = {element:{from:{transform:"translateX(" + newOffset + "px) translateZ(0)"}, to:{transform:"translateX(0) translateZ(0)", opacity:1}}, ghost:{to:{transform:"translateX(" + oldOffset + "px) translateZ(0)", opacity:0}}};
    theta = -titleX + newLeftWidth;
    if(titleWidth > titleX) {
      omega = -titleX - titleWidth
    }
    if(reverse) {
      oldOffset = barWidth - titleX - titleWidth;
      if(omega !== undefined) {
        newOffset = omega
      }else {
        newOffset = theta
      }
    }else {
      newOffset = barWidth - titleX - titleWidth;
      if(omega !== undefined) {
        oldOffset = omega
      }else {
        oldOffset = theta
      }
      newOffset = Math.max(0, newOffset)
    }
    titleAnims = {element:{from:{transform:"translateX(" + newOffset + "px) translateZ(0)"}, to:{transform:"translateX(0) translateZ(0)", opacity:1}}, ghost:{to:{transform:"translateX(" + oldOffset + "px) translateZ(0)", opacity:0}}};
    return{back:backElAnims, title:titleAnims}
  }
  function onBackButtonClick() {
    this.fire("backward")
  }
  function onBack() {
    this.get("navigationView").pop()
  }
  function afterInnerViewChange(e) {
    this.set("title", e.newView.get("title") || "")
  }
  function beforeInnerViewChange(e) {
    var self = this;
    var oldView = e.oldView;
    var newView = e.newView;
    var backward = e.backward;
    if(oldView) {
      self[backward ? "backward" : "forward"](newView.get("title") || "")
    }
  }
  return Control.extend({initializer:function() {
    this._withTitle = this.get("withTitle");
    this._stack = [];
    this.publish("backward", {defaultFn:onBack, defaultTargetOnly:true})
  }, renderUI:function() {
    var self = this, prefixCls = self.get("prefixCls");
    self._buttons = {};
    if(self.get("withBackButton")) {
      self._backBtn = (new Button({prefixCls:prefixCls + "navigation-bar-", elCls:prefixCls + "navigation-bar-backward", elBefore:self.get("contentEl")[0].firstChild, visible:false, content:self.get("backText")})).render()
    }
  }, bindUI:function() {
    if(this._backBtn) {
      this._backBtn.on("click", onBackButtonClick, this)
    }
    var navigationView = this.get("navigationView");
    navigationView.on("afterInnerViewChange", afterInnerViewChange, this);
    navigationView.on("beforeInnerViewChange", beforeInnerViewChange, this)
  }, addButton:function(name, config) {
    var self = this, prefixCls = self.get("prefixCls");
    config.prefixCls = prefixCls + "navigation-bar-";
    if(!config.elBefore && !config.render) {
      var align = config.align = config.align || "left";
      if(align === "left") {
        config.elBefore = self.get("centerEl")
      }else {
        if(align === "right") {
          config.render = self.get("contentEl")
        }
      }
      delete config.align
    }
    self._buttons[name] = (new Button(config)).render();
    return self._buttons[name]
  }, insertButtonBefore:function(name, config, button) {
    config.elBefore = button.get("el");
    return this.addButton(name, config)
  }, removeButton:function(name) {
    this._buttons[name].destroy();
    delete this._buttons[name]
  }, getButton:function(name) {
    return this._buttons[name]
  }, forward:function(title) {
    this._stack.push(title);
    this.go(title, true)
  }, go:function(title, hasPrevious, reverse) {
    var self = this;
    var backBtn = self._backBtn;
    if(!(backBtn && self._withTitle)) {
      if(self._withTitle) {
        self.get("titleEl").html(title)
      }
      if(backBtn) {
        backBtn[hasPrevious ? "show" : "hide"]()
      }
      return
    }
    var backEl = backBtn.get("el");
    backEl.stop(true);
    if(self.ghostBackEl) {
      self.ghostBackEl.stop(true)
    }
    var backElProps = {width:backEl[0].offsetWidth};
    var ghostBackEl = createGhost(backEl);
    self.ghostBackEl = ghostBackEl;
    backEl.css("opacity", 0);
    backBtn[hasPrevious ? "show" : "hide"]();
    if(self.ghostBackEl) {
      self.ghostBackEl.stop(true)
    }
    var anims = getAnimProps(self, backEl, backElProps, reverse);
    backEl.css(anims.back.element.from);
    if(backBtn.get("visible")) {
      anim(backEl, anims.back.element.to)
    }
    if(ghostBackEl.css("display") !== "none") {
      anim(ghostBackEl, anims.back.ghost.to, function() {
        ghostBackEl.remove();
        self.ghostBackEl = null
      })
    }else {
      ghostBackEl.remove();
      self.ghostBackEl = null
    }
    var titleEl = self.get("titleEl");
    titleEl.stop(true);
    var ghostTitleEl = createGhost(titleEl.parent());
    self.ghostTitleEl = ghostTitleEl;
    titleEl.css("opacity", 0);
    self.set("title", title);
    titleEl.css(anims.title.element.from);
    anim(titleEl, anims.title.element.to);
    anim(ghostTitleEl, anims.title.ghost.to, function() {
      ghostTitleEl.remove();
      self.ghostTitleEl = null
    })
  }, backward:function(title) {
    if(this._stack.length) {
      this._stack.pop();
      this.go(title, this._stack.length, true)
    }
  }, _onSetTitle:function(v) {
    var titleEl = this.get("titleEl");
    if(titleEl) {
      titleEl.html(v)
    }
  }, _onSetBackText:function(v) {
    if(this._backBtn) {
      this._backBtn.set("content", v)
    }
  }}, {xclass:"navigation-bar", ATTRS:{contentTpl:{value:tpl}, handleGestureEvents:{value:false}, focusable:{value:false}, centerEl:{selector:function() {
    return"." + this.getBaseCssClass("center")
  }}, contentEl:{selector:function() {
    return"." + this.getBaseCssClass("content")
  }}, titleEl:{selector:function() {
    return"." + this.getBaseCssClass("title")
  }}, title:{value:"", render:1, sync:0}, withBackButton:{value:1}, withTitle:{value:1, render:1, sync:0}, backText:{value:"Back", render:1, sync:0}}})
});

