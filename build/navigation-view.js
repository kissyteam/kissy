/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Jan 7 20:36
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
    if(!subView) {
      subView = new (self.get("SubView"));
      navigationView.addChild(subView);
      subView.get("el").css("transform", "translateX(-9999px) translateZ(0)")
    }
    subView.controller = self;
    if(navigationView.get("activeView") !== subView || self.needNavigation(request)) {
      self.reload();
      self.go(request)
    }
    var route = request.route;
    var routes = self.get("routes");
    self[routes[route.path]].apply(self, arguments)
  }
  return Base.extend({router:router, initializer:function() {
    var self = this;
    var path;
    self.doRoute = S.bind(doRoute, self);
    var routes = self.get("routes");
    for(path in routes) {
      router.get(path, self.doRoute)
    }
  }, needNavigation:function() {
    return true
  }, leave:function() {
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
  }, reload:function() {
    this.getSubView().reset("title");
    this.defer = new Promise.Defer;
    this.promise = this.defer.promise
  }, push:function(url) {
    router.navigate(url)
  }, go:function(request) {
    this.get("navigationView")[request.backward ? "pop" : "push"](this.getSubView())
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
    buffer += '"></div>\r\n</div>';
    return buffer
  }
});
KISSY.add("navigation-view/bar-render", ["./bar-xtpl", "component/control"], function(S, require) {
  var tpl = require("./bar-xtpl");
  var Control = require("component/control");
  return Control.getDefaultRender().extend({createDom:function() {
    this.fillChildrenElsBySelectors({titleEl:"#ks-navigation-bar-title-{id}", contentEl:"#ks-navigation-bar-content-{id}"})
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
    this.set("backBtn", backBtn = (new Button({prefixCls:prefixCls + "navigation-bar-back-", elBefore:this.get("contentEl")[0].firstChild, visible:false, content:this.get("backText")})).render())
  }, forward:function(title) {
    this.go(title, true)
  }, go:function(title, hasPrevious, reverse) {
    var self = this;
    var backEl = this.get("backBtn").get("el");
    var backElProps = {width:backEl[0].offsetWidth};
    var ghostBackEl = createGhost(backEl);
    backEl.css("opacity", 0);
    backEl[hasPrevious ? "show" : "hide"]();
    var titleEl = this.get("titleEl");
    var ghostTitleEl = createGhost(titleEl.parent());
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
        ghostBackEl.remove()
      })
    }else {
      ghostBackEl.remove()
    }
    anim(ghostTitleEl, anims.title.ghost.to, function() {
      ghostTitleEl.remove()
    })
  }, back:function(title, hasPrevious) {
    this.go(title, hasPrevious, true)
  }}, {xclass:"navigation-bar", ATTRS:{handleMouseEvents:{value:false}, focusable:{value:false}, xrender:{value:BarRender}, contentEl:{view:1}, titleEl:{view:1}, title:{value:"", view:1}, backText:{value:"Back", view:1}}})
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
  }, push:function(subView) {
    var self = this;
    var bar = this.get("bar");
    subView.get("el").css("transform", "translateX(-9999px) translateZ(0)");
    var activeView;
    var loadingEl = this.get("loadingEl");
    this.viewStack.push(subView);
    if(activeView = this.get("activeView")) {
      var activeEl = activeView.get("el");
      loadingEl.css("left", "100%");
      activeEl.animate({transform:"translateX(-" + activeEl[0].offsetWidth + "px) translateZ(0)"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
      loadingEl.show();
      loadingEl.animate({left:"0"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
      this.set("activeView", null);
      bar.forward(subView.get("title"));
      activeView.controller.leave()
    }else {
      bar.set("title", subView.get("title"))
    }
    if(self.waitingView) {
      self.waitingView.controller.leave()
    }
    self.waitingView = subView;
    subView.uuid = uuid++;
    subView.controller.promise.then(function() {
      if(self.waitingView.uuid === subView.uuid) {
        self.set("activeView", subView);
        self.waitingView = null;
        bar.set("title", subView.get("title"));
        subView.get("el").css("transform", "");
        loadingEl.hide()
      }
    })
  }, pop:function() {
    var self = this;
    if(this.viewStack.length) {
      this.viewStack.pop();
      var subView = this.viewStack[this.viewStack.length - 1];
      var activeView;
      var loadingEl = this.get("loadingEl");
      var bar = this.get("bar");
      loadingEl.show();
      if(activeView = this.get("activeView")) {
        loadingEl.css("left", "-100%");
        this.animEl = activeView.get("el");
        this.animEl.animate({transform:"translateX(" + activeView.get("el")[0].offsetWidth + "px) translateZ(0)"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
        loadingEl.show();
        loadingEl.animate({left:"0"}, {useTransition:true, easing:"ease-in-out", duration:0.25});
        this.set("activeView", null);
        activeView.controller.leave()
      }else {
        if(self.waitingView) {
          self.waitingView.controller.leave()
        }
      }
      bar.back(subView.get("title"), this.viewStack.length > 1);
      self.waitingView = subView;
      subView.uuid = uuid++;
      subView.controller.promise.then(function() {
        if(self.waitingView.uuid === subView.uuid) {
          self.waitingView = null;
          self.set("activeView", subView);
          bar.set("title", subView.get("title"));
          subView.get("el").css("transform", "");
          loadingEl.hide()
        }
      })
    }
  }}, {SubView:SubView, Controller:Controller, xclass:"navigation-view", ATTRS:{activeView:{}, loadingEl:{}, handleMouseEvents:{value:false}, focusable:{value:false}, xrender:{value:NavigationViewRender}, contentTpl:{value:ContentTpl}, defaultChildCfg:{value:{xclass:"navigation-sub-view"}}}})
});

