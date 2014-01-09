/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Jan 9 20:36
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
    this.getSubView().reset("title");
    this.defer = new Promise.Defer;
    this.promise = this.defer.promise;
    self.enter();
    var route = request.route;
    var routes = self.get("routes");
    if(routes[route.path]) {
      self[routes[route.path]].apply(self, arguments)
    }
    if(!request.replace || !activeView) {
      if(activeView) {
        activeView.controller.leave()
      }
      if(navigationView.waitingView) {
        navigationView.waitingView.controller.leave()
      }
      self.switchView(request, !self.promise.isResolved())
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
  }, switchView:function(request, async) {
    this.get("navigationView")[request.backward ? "pop" : "push"](this.getSubView(), async)
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
    buffer += '<div class="';
    var config1 = {};
    var params2 = [];
    params2.push("title-wrap");
    config1.params = params2;
    var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '">\r\n    <div class="';
    var config4 = {};
    var params5 = [];
    params5.push("title");
    config4.params = params5;
    var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '" id="ks-navigation-bar-title-';
    var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
    buffer += renderOutputUtil(id6, true);
    buffer += '">';
    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 2);
    buffer += renderOutputUtil(id7, true);
    buffer += '</div>\r\n</div>\r\n<div class="';
    var config9 = {};
    var params10 = [];
    params10.push("content");
    config9.params = params10;
    var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 4);
    buffer += renderOutputUtil(id8, true);
    buffer += '" id="ks-navigation-bar-content-';
    var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 4);
    buffer += renderOutputUtil(id11, true);
    buffer += '">\r\n    <div class="';
    var config13 = {};
    var params14 = [];
    params14.push("center");
    config13.params = params14;
    var id12 = runInlineCommandUtil(engine, scope, config13, "getBaseCssClasses", 5);
    buffer += renderOutputUtil(id12, true);
    buffer += '" id="ks-navigation-bar-center-';
    var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 5);
    buffer += renderOutputUtil(id15, true);
    buffer += '"></div>\r\n</div>';
    return buffer
  }
});
KISSY.add("navigation-view/bar-render", ["./bar-xtpl", "component/control"], function(S, require) {
  var tpl = require("./bar-xtpl");
  var Control = require("component/control");
  return Control.getDefaultRender().extend({createDom:function() {
    this.fillChildrenElsBySelectors({titleEl:"#ks-navigation-bar-title-{id}", centerEl:"#ks-navigation-bar-center-{id}", contentEl:"#ks-navigation-bar-content-{id}"})
  }, _onSetTitle:function(v) {
    this.control.get("titleEl").html(v)
  }, _onSetBackText:function(v) {
    this.control.get("backButton").set("content", v)
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
  return Control.extend({renderUI:function() {
    var prefixCls = this.get("prefixCls");
    var backBtn;
    this.set("backBtn", backBtn = (new Button({prefixCls:prefixCls + "navigation-bar-", elCls:prefixCls + "navigation-bar-back", elBefore:this.get("contentEl")[0].firstChild, visible:false, content:this.get("backText")})).render());
    this._buttons = {}
  }, addButton:function(name, config) {
    var prefixCls = this.get("prefixCls");
    config.prefixCls = prefixCls + "navigation-bar-";
    if(!config.elBefore && !config.render) {
      var align = config.align = config.align || "left";
      if(align === "left") {
        config.elBefore = this.get("centerEl")
      }else {
        if(align === "right") {
          config.render = this.get("contentEl")
        }
      }
      delete config.align
    }
    this._buttons[name] = (new Button(config)).render();
    return this._buttons[name]
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
    var backEl = this.get("backBtn").get("el");
    backEl.stop(true);
    if(self.ghostBackEl) {
      self.ghostBackEl.stop(true)
    }
    var backElProps = {width:backEl[0].offsetWidth};
    var ghostBackEl = createGhost(backEl);
    self.ghostBackEl = ghostBackEl;
    backEl.css("opacity", 0);
    backEl[hasPrevious ? "show" : "hide"]();
    var titleEl = this.get("titleEl");
    titleEl.stop(true);
    if(self.ghostBackEl) {
      self.ghostBackEl.stop(true)
    }
    var ghostTitleEl = createGhost(titleEl.parent());
    self.ghostTitleEl = ghostTitleEl;
    titleEl.css("opacity", 0);
    this.set("title", title);
    var anims = getAnimProps(self, backEl, backElProps, reverse);
    backEl.css(anims.back.element.from);
    if(backEl.css("display") !== "none") {
      anim(backEl, anims.back.element.to)
    }
    titleEl.css(anims.title.element.from);
    anim(titleEl, anims.title.element.to);
    if(ghostBackEl.css("display") !== "none") {
      anim(ghostBackEl, anims.back.ghost.to, function() {
        ghostBackEl.remove();
        self.ghostBackEl = null
      })
    }else {
      ghostBackEl.remove();
      self.ghostBackEl = null
    }
    anim(ghostTitleEl, anims.title.ghost.to, function() {
      ghostTitleEl.remove();
      self.ghostTitleEl = null
    })
  }, back:function(title, hasPrevious) {
    this.go(title, hasPrevious, true)
  }}, {xclass:"navigation-bar", ATTRS:{handleMouseEvents:{value:false}, focusable:{value:false}, xrender:{value:BarRender}, centerEl:{}, contentEl:{}, titleEl:{}, title:{value:"", view:1}, backText:{value:"Back", view:1}}})
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
    this.setInternal("bar", bar = (new Bar({elBefore:this.get("el")[0].firstChild})).render());
    bar.get("backBtn").on("click", this.onBack, this)
  }, onBack:function() {
    history.back()
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
          bar.set("title", nextView.get("title"));
          nextView.get("el").css("transform", "");
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
            bar.set("title", nextView.get("title"));
            nextView.get("el").css("transform", "");
            loadingEl.hide()
          }
        })
      }
    }
  }}, {SubView:SubView, Controller:Controller, xclass:"navigation-view", ATTRS:{activeView:{}, loadingEl:{}, handleMouseEvents:{value:false}, focusable:{value:false}, xrender:{value:NavigationViewRender}, contentTpl:{value:ContentTpl}, defaultChildCfg:{value:{xclass:"navigation-sub-view"}}}})
});

