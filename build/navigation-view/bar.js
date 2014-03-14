/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:40
*/
/*
 Combined modules by KISSY Module Compiler: 

 navigation-view/bar/bar-xtpl
 navigation-view/bar/bar-render
 navigation-view/bar
*/

KISSY.add("navigation-view/bar/bar-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += "";
    var option0 = {};
    var params1 = [];
    var id2 = scope.resolve(["withTitle"]);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function(scope) {
      var buffer = "";
      buffer += '\r\n<div class="';
      var option4 = {};
      var params5 = [];
      params5.push("title-wrap");
      option4.params = params5;
      var id3 = callCommandUtil(engine, scope, option4, "getBaseCssClasses", 2);
      buffer += escapeHtml(id3);
      buffer += '">\r\n    <div class="';
      var option7 = {};
      var params8 = [];
      params8.push("title");
      option7.params = params8;
      var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 3);
      buffer += escapeHtml(id6);
      buffer += '" id="ks-navigation-bar-title-';
      var id9 = scope.resolve(["id"]);
      buffer += escapeHtml(id9);
      buffer += '">';
      var id10 = scope.resolve(["title"]);
      buffer += escapeHtml(id10);
      buffer += "</div>\r\n</div>\r\n";
      return buffer
    };
    buffer += ifCommand.call(engine, scope, option0, payload);
    buffer += '\r\n<div class="';
    var option12 = {};
    var params13 = [];
    params13.push("content");
    option12.params = params13;
    var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 6);
    buffer += escapeHtml(id11);
    buffer += '" id="ks-navigation-bar-content-';
    var id14 = scope.resolve(["id"]);
    buffer += escapeHtml(id14);
    buffer += '">\r\n    <div class="';
    var option16 = {};
    var params17 = [];
    params17.push("center");
    option16.params = params17;
    var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 7);
    buffer += escapeHtml(id15);
    buffer += '" id="ks-navigation-bar-center-';
    var id18 = scope.resolve(["id"]);
    buffer += escapeHtml(id18);
    buffer += '"></div>\r\n</div>';
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("navigation-view/bar/bar-render", ["./bar-xtpl", "component/control"], function(S, require) {
  var tpl = require("./bar-xtpl");
  var Control = require("component/control");
  return Control.getDefaultRender().extend({createDom:function() {
    var selectors = {centerEl:"#ks-navigation-bar-center-{id}", contentEl:"#ks-navigation-bar-content-{id}"};
    if(this.control._withTitle) {
      selectors.titleEl = "#ks-navigation-bar-title-{id}"
    }
    this.fillChildrenElsBySelectors(selectors)
  }, _onSetTitle:function(v) {
    if(this.control._withTitle) {
      this.control.get("titleEl").html(v)
    }
  }, _onSetBackText:function(v) {
    if(this.control._backBtn) {
      this.control._backBtn.set("content", v)
    }
  }}, {ATTRS:{contentTpl:{value:tpl}}})
});
KISSY.add("navigation-view/bar", ["component/control", "./bar/bar-render", "button"], function(S, require) {
  var Control = require("component/control");
  var BarRender = require("./bar/bar-render");
  var Button = require("button");
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
  }}, {xclass:"navigation-bar", ATTRS:{handleGestureEvents:{value:false}, focusable:{value:false}, xrender:{value:BarRender}, centerEl:{}, contentEl:{}, titleEl:{}, title:{value:"", view:1}, withBackButton:{value:1}, withTitle:{value:1, view:1}, backText:{value:"Back", view:1}}})
});

