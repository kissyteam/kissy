/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:40
*/
/*
 Combined modules by KISSY Module Compiler: 

 navigation-view
*/

KISSY.add("navigation-view", ["component/container", "component/control", "component/extension/content-xtpl", "component/extension/content-render"], function(S, require) {
  var vendorInfo = S.Feature.getCssVendorInfo("animation");
  var vendorPrefix = vendorInfo && vendorInfo.propertyNamePrefix;
  var ANIMATION_END_EVENT = vendorPrefix ? vendorPrefix.toLowerCase() + "AnimationEnd" : "animationend webkitAnimationEnd";
  var Container = require("component/container");
  var Control = require("component/control");
  var ContentTpl = require("component/extension/content-xtpl");
  var ContentRender = require("component/extension/content-render");
  function getAnimCss(prefixCls, animation, enter) {
    return prefixCls + "navigation-view-" + ("anim-" + animation + "-" + (enter ? "enter" : "leave")) + " " + prefixCls + "navigation-view-anim-ing"
  }
  function getAnimValueFromView(view, enter, backward) {
    var animation = view.get("animation");
    if(typeof animation === "string") {
      return animation
    }
    var animationValue;
    if(backward) {
      animationValue = enter ? animation[1] : animation[0]
    }else {
      animationValue = enter ? animation[0] : animation[1]
    }
    return animationValue
  }
  function transition(view, enter, backward) {
    clearAnimCss(view);
    var animationValue = getAnimValueFromView(view, enter, backward);
    if(animationValue === "none") {
      if(enter) {
        view.show()
      }else {
        view.hide()
      }
      return
    }
    view.show();
    view.$el.addClass(view._viewAnimCss = getAnimCss(view.get("prefixCls"), animationValue, enter))
  }
  function loadingTransition(loadingView, view, enter, backward) {
    clearAnimCss(loadingView);
    var animationValue = getAnimValueFromView(view, enter, backward);
    if(animationValue === "none") {
      if(enter) {
        loadingView.show()
      }else {
        loadingView.hide()
      }
      return
    }
    loadingView.show();
    loadingView.$el.addClass(loadingView._viewAnimCss = getAnimCss(view.get("prefixCls"), animationValue, enter))
  }
  function clearAnimCss(self) {
    if(self._viewAnimCss) {
      self.$el.removeClass(self._viewAnimCss);
      self._viewAnimCss = null
    }
  }
  var LoadingView = Control.extend({bindUI:function() {
    var self = this;
    self.$el.on(ANIMATION_END_EVENT, function() {
      clearAnimCss(self);
      if(!self.active) {
        self.hide()
      }
    })
  }, transition:function(enter, backward) {
    var self = this;
    self.active = enter;
    loadingTransition(self, self.navigationView.get("activeView"), enter, backward)
  }}, {xclass:"navigation-view-loading", ATTRS:{handleGestureEvents:{value:false}, visible:{value:false}}});
  function getViewInstance(navigationView, config) {
    var children = navigationView.get("children");
    var viewId = config.viewId;
    for(var i = 0;i < children.length;i++) {
      if(children[i].constructor.xclass === config.xclass) {
        if(viewId) {
          if(children[i].get("viewId") === viewId) {
            return children[i]
          }
        }else {
          return children[i]
        }
      }
    }
    return null
  }
  function switchTo(navigationView, view, backward) {
    var loadingView = navigationView.loadingView;
    var oldView = navigationView.get("activeView");
    navigationView.fire("beforeInnerViewChange", {oldView:oldView, newView:view, backward:backward});
    if(oldView && oldView.leave) {
      oldView.leave()
    }
    navigationView.set("activeView", view);
    if(view.enter) {
      view.enter()
    }
    var promise = view.promise;
    if(promise) {
      if(oldView) {
        transition(oldView, false, backward);
        loadingView.transition(true, backward)
      }else {
        loadingView.show()
      }
      promise.then(function() {
        if(navigationView.get("activeView") === view) {
          loadingView.hide();
          view.show();
          navigationView.fire("afterInnerViewChange", {newView:view, oldView:oldView, backward:backward})
        }
      })
    }else {
      if(loadingView.get("visible")) {
        loadingView.transition(false, backward);
        transition(view, true, backward)
      }else {
        if(oldView) {
          transition(oldView, false, backward);
          transition(view, true, backward)
        }else {
          view.show()
        }
      }
      navigationView.fire("afterInnerViewChange", {newView:view, oldView:oldView, backward:backward})
    }
    gc(navigationView)
  }
  function gc(navigationView) {
    var children = navigationView.get("children").concat();
    var viewCacheSize = navigationView.get("viewCacheSize");
    if(children.length <= viewCacheSize) {
      return
    }
    var removedSize = Math.floor(viewCacheSize / 3);
    children.sort(function(a, b) {
      return a.timeStamp - b.timeStamp
    });
    for(var i = 0;i < removedSize;i++) {
      navigationView.removeChild(children[i])
    }
  }
  function onViewAnimEnd() {
    var view = this;
    clearAnimCss(view);
    if(view.get("navigationView").get("activeView") === view) {
      view.show()
    }else {
      view.hide()
    }
  }
  function createView(self, config) {
    var view = getViewInstance(self, config);
    if(!view) {
      view = self.addChild(config);
      view.$el.on(ANIMATION_END_EVENT, onViewAnimEnd, view)
    }else {
      view.set(config)
    }
    view.timeStamp = S.now();
    return view
  }
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender]);
  return Container.extend({initializer:function() {
    this.viewStack = []
  }, createDom:function() {
    var self = this;
    var loadingHtml = self.get("loadingHtml");
    if(loadingHtml !== false) {
      self.loadingView = (new LoadingView({content:loadingHtml, render:self.contentEl})).render();
      self.loadingView.navigationView = self
    }
  }, _onSetLoadingHtml:function(v) {
    if(this.loadingView) {
      this.loadingView.set("content", v)
    }
  }, push:function(config) {
    var self = this, nextView, viewStack = self.viewStack;
    config.animation = config.animation || self.get("animation");
    config.navigationView = self;
    nextView = createView(self, config);
    viewStack.push(config);
    switchTo(self, nextView)
  }, replace:function(config) {
    var self = this, viewStack = self.viewStack;
    S.mix(viewStack[viewStack.length - 1], config);
    self.get("activeView").set(config)
  }, pop:function(config) {
    var self = this, nextView, viewStack = self.viewStack;
    if(viewStack.length > 1) {
      viewStack.pop();
      config = viewStack[viewStack.length - 1];
      nextView = createView(self, config);
      switchTo(self, nextView, true)
    }
  }}, {xclass:"navigation-view", ATTRS:{animation:{value:["slide-right", "slide-left"]}, loadingHtml:{sync:0}, handleGestureEvents:{value:false}, viewCacheSize:{value:10}, focusable:{value:false}, allowTextSelection:{value:true}, xrender:{value:NavigationViewRender}, contentTpl:{value:ContentTpl}, defaultChildCfg:{value:{handleGestureEvents:false, visible:false, allowTextSelection:true}}}})
});

