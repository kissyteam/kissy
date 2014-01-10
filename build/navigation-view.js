/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Jan 10 12:28
*/
/*
 Combined modules by KISSY Module Compiler: 

 navigation-view/controller
 navigation-view/sub-view
 navigation-view/bar-xtpl
 navigation-view/bar-render
 navigation-view/bar
 navigation-view
*/

KISSY.add("navigation-view/controller", ["base", "router", "promise"], function(S, require) {
  var Base = require("base");
  var router = require("router");
  var Promise = require("promise");
  function doRoute(request) {
    var self = this;
    var subView = self.getSubView();
    var navigationView = self.get("navigationView");
    var activeView = navigationView.get("activeView");
    if(!subView) {
      subView = new (self.get("SubView"));
      navigationView.addChild(subView);
      subView.get("el").css("transform", "translateX(-9999px) translateZ(0)")
    }
    subView.controller = self;
    this.defer = new Promise.Defer;
    this.promise = this.defer.promise;
    if(!request.replace || !activeView) {
      if(activeView) {
        activeView.controller.leave()
      }
      if(navigationView.waitingView) {
        navigationView.waitingView.controller.leave()
      }
    }
    self.enter();
    var route = request.route;
    var routes = self.get("routes");
    if(routes[route.path]) {
      self[routes[route.path]].apply(self, arguments)
    }
    if(!request.replace || !activeView) {
      var async = !self.promise.isResolved();
      if(async) {
        subView.reset("title")
      }
      navigationView[request.backward ? "pop" : "push"](subView, async)
    }
  }
  return Base.extend({router:router, initializer:function() {
    var self = this;
    var path;
    self.doRoute = S.bind(doRoute, self);
    var routes = self.get("routes");
    for(path in routes) {
      router.get(path, self.doRoute)
    }
  }, leave:function() {
  }, enter:function() {
  }, getSubView:function() {
    var self = this;
    var navigationView = self.get("navigationView");
    var SubView = self.get("SubView");
    var children = navigationView.get("children");
    for(var i = children.length - 1;i >= 0;i--) {
      if(children[i].constructor === SubView) {
        return children[i]
      }
    }
    return undefined
  }, navigate:function(url, options) {
    router.navigate(url, options)
  }, isSubViewActive:function() {
    return this.get("navigationView").get("activeView") === this.getSubView()
  }}, {ATTRS:{routes:{}, SubView:{}}})
});
KISSY.add("navigation-view/sub-view", ["component/control"], function(S, require) {
  var Control = require("component/control");
  return Control.extend({isActiveView:function() {
    return this.get("parent").get("activeView") === this
  }, _onSetTitle:function(v) {
    if(this.isActiveView()) {
      this.get("parent").get("bar").set("title", v)
    }
  }}, {xclass:"navigation-sub-view", ATTRS:{handleMouseEvents:{value:false}, title:{value:"..."}, focusable:{value:false}}})
});
KISSY.add("navigation-view/bar-xtpl", [], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config0 = {};
    var params1 = [];
    var id2 = getPropertyUtil(engine, scope, "withTitle", 0, 1);
    params1.push(id2);
    config0.params = params1;
    config0.fn = function(scope) {
      var buffer = "";
      buffer += '\r\n<div class="';
      var config4 = {};
      var params5 = [];
      params5.push("title-wrap");
      config4.params = params5;
      var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
      buffer += renderOutputUtil(id3, true);
      buffer += '">\r\n    <div class="';
      var config7 = {};
      var params8 = [];
      params8.push("title");
      config7.params = params8;
      var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 3);
      buffer += renderOutputUtil(id6, true);
      buffer += '" id="ks-navigation-bar-title-';
      var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
      buffer += renderOutputUtil(id9, true);
      buffer += '">';
      var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 3);
      buffer += renderOutputUtil(id10, true);
      buffer += "</div>\r\n</div>\r\n";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config0, "if", 1);
    buffer += '\r\n<div class="';
    var config12 = {};
    var params13 = [];
    params13.push("content");
    config12.params = params13;
    var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 6);
    buffer += renderOutputUtil(id11, true);
    buffer += '" id="ks-navigation-bar-content-';
    var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 6);
    buffer += renderOutputUtil(id14, true);
    buffer += '">\r\n    <div class="';
    var config16 = {};
    var params17 = [];
    params17.push("center");
    config16.params = params17;
    var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 7);
    buffer += renderOutputUtil(id15, true);
    buffer += '" id="ks-navigation-bar-center-';
    var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
    buffer += renderOutputUtil(id18, true);
    buffer += '"></div>\r\n</div>';
    return buffer
  }
});
KISSY.add("navigation-view/bar-render", ["./bar-xtpl", "component/control"], function(S, require) {
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
KISSY.add("navigation-view/bar", ["component/control", "./bar-render", "button"], function(S, require) {
  var Control = require("component/control");
  var BarRender = require("./bar-render");
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
    el.animate(props, {duration:0.25, useTransition:true, easing:"ease-in-out", complete:complete})
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
    history.back()
  }
  return Control.extend({initializer:function() {
    this._withTitle = this.get("withTitle")
  }, renderUI:function() {
    var self = this, prefixCls = self.get("prefixCls");
    self._buttons = {};
    if(self.get("withBackButton")) {
      self._backBtn = (new Button({prefixCls:prefixCls + "navigation-bar-", elCls:prefixCls + "navigation-bar-back", elBefore:self.get("contentEl")[0].firstChild, visible:false, content:self.get("backText")})).render()
    }
  }, bindUI:function() {
    if(this._backBtn) {
      this._backBtn.on("click", onBackButtonClick)
    }
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
  }, back:function(title, hasPrevious) {
    this.go(title, hasPrevious, true)
  }}, {xclass:"navigation-bar", ATTRS:{handleMouseEvents:{value:false}, focusable:{value:false}, xrender:{value:BarRender}, centerEl:{}, contentEl:{}, titleEl:{}, title:{value:"", view:1}, withBackButton:{value:1}, withTitle:{value:1, view:1}, backText:{value:"Back", view:1}}})
});
KISSY.add("navigation-view", ["node", "navigation-view/controller", "component/container", "navigation-view/sub-view", "navigation-view/bar", "component/extension/content-xtpl", "component/extension/content-render"], function(S, require) {
  var $ = require("node").all;
  var Controller = require("navigation-view/controller");
  var Container = require("component/container");
  var SubView = require("navigation-view/sub-view");
  var Bar = require("navigation-view/bar");
  var ContentTpl = require("component/extension/content-xtpl");
  var ContentRender = require("component/extension/content-render");
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + "</div>" + "</div>";
  var uuid = 0;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {renderUI:function() {
    var loadingEl = $(S.substitute(LOADING_HTML, {prefixCls:this.control.get("prefixCls")}));
    this.control.get("contentEl").append(loadingEl);
    this.control.setInternal("loadingEl", loadingEl)
  }});
  return Container.extend({renderUI:function() {
    this.viewStack = [];
    var bar;
    var barCfg = this.get("barCfg");
    barCfg.elBefore = this.get("el")[0].firstChild;
    this.setInternal("bar", bar = (new Bar(barCfg)).render())
  }, push:function(nextView, async) {
    var self = this;
    var bar = this.get("bar");
    var nextViewEl = nextView.get("el");
    nextViewEl.css("transform", "translateX(-9999px) translateZ(0)");
    nextView.uuid = uuid++;
    var activeView;
    var loadingEl = this.get("loadingEl");
    this.viewStack.push(nextView);
    if(activeView = this.get("activeView")) {
      var activeEl = activeView.get("el");
      activeEl.stop(true);
      activeEl.animate({transform:"translateX(-" + activeEl[0].offsetWidth + "px) translateZ(0)"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
      if(async) {
        loadingEl.stop(true);
        loadingEl.css("left", "100%");
        loadingEl.show();
        loadingEl.animate({left:"0"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
        this.set("activeView", null)
      }else {
        nextViewEl.stop(true);
        nextViewEl.css("transform", "translateX(" + activeEl[0].offsetWidth + "px) translateZ(0)");
        nextViewEl.animate({transform:""}, {useTransition:true, easing:"ease-in-out", duration:0.25});
        this.set("activeView", nextView);
        self.waitingView = null
      }
      bar.forward(nextView.get("title"))
    }else {
      bar.set("title", nextView.get("title"));
      if(!async) {
        nextView.get("el").css("transform", "");
        this.set("activeView", nextView);
        self.waitingView = null;
        loadingEl.hide()
      }
    }
    if(async) {
      self.waitingView = nextView;
      nextView.controller.promise.then(function() {
        if(self.waitingView && self.waitingView.uuid === nextView.uuid) {
          self.set("activeView", nextView);
          self.waitingView = null;
          nextView.get("el").css("transform", "");
          bar.set("title", nextView.get("title"));
          loadingEl.hide()
        }
      })
    }
  }, pop:function(nextView, async) {
    var self = this;
    if(this.viewStack.length > 1) {
      this.viewStack.pop();
      nextView.uuid = uuid++;
      var activeView;
      var loadingEl = this.get("loadingEl");
      var bar = this.get("bar");
      if(activeView = this.get("activeView")) {
        var activeEl = this.animEl = activeView.get("el");
        activeEl.stop(true);
        activeEl.animate({transform:"translateX(" + activeView.get("el")[0].offsetWidth + "px) translateZ(0)"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
        if(async) {
          this.set("activeView", null);
          loadingEl.stop(true);
          loadingEl.css("left", "-100%");
          loadingEl.show();
          loadingEl.animate({left:"0"}, {useTransition:true, easing:"ease-in-out", duration:0.25})
        }else {
          var nextViewEl = nextView.get("el");
          nextViewEl.stop(true);
          nextViewEl.css("transform", "translateX(-" + activeEl[0].offsetWidth + "px) translateZ(0)");
          nextViewEl.animate({transform:""}, {useTransition:true, easing:"ease-in-out", duration:0.25});
          this.set("activeView", nextView)
        }
      }else {
        if(!async) {
          nextView.get("el").css("transform", "");
          this.set("activeView", nextView);
          self.waitingView = null;
          loadingEl.hide()
        }
      }
      bar.back(nextView.get("title"), this.viewStack.length > 1);
      if(async) {
        self.waitingView = nextView;
        nextView.controller.promise.then(function() {
          if(self.waitingView && self.waitingView.uuid === nextView.uuid) {
            self.waitingView = null;
            self.set("activeView", nextView);
            nextView.get("el").css("transform", "");
            bar.set("title", nextView.get("title"));
            loadingEl.hide()
          }
        })
      }
    }
  }}, {SubView:SubView, Controller:Controller, xclass:"navigation-view", ATTRS:{barCfg:{}, activeView:{}, loadingEl:{}, handleMouseEvents:{value:false}, focusable:{value:false}, xrender:{value:NavigationViewRender}, contentTpl:{value:ContentTpl}, defaultChildCfg:{value:{xclass:"navigation-sub-view"}}}})
});

