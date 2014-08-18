/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:30
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 scroll-view/base/render
 scroll-view/base
*/

KISSY.add("scroll-view/base/render", ["component/container", "component/extension/content-render"], function(S, require) {
  var Container = require("component/container");
  var ContentRenderExtension = require("component/extension/content-render");
  var Feature = S.Features, floor = Math.floor, transformProperty;
  var isTransform3dSupported = S.Features.isTransform3dSupported();
  var supportCss3 = S.Features.getVendorCssPropPrefix("transform") !== false;
  var methods = {syncUI:function() {
    var self = this, control = self.control, el = control.el, contentEl = control.contentEl;
    var scrollHeight = Math.max(contentEl.offsetHeight, contentEl.scrollHeight), scrollWidth = Math.max(contentEl.offsetWidth, contentEl.scrollWidth);
    var clientHeight = el.clientHeight, clientWidth = el.clientWidth;
    control.set("dimension", {scrollHeight:scrollHeight, scrollWidth:scrollWidth, clientWidth:clientWidth, clientHeight:clientHeight})
  }, _onSetScrollLeft:function(v) {
    this.control.contentEl.style.left = -v + "px"
  }, _onSetScrollTop:function(v) {
    this.control.contentEl.style.top = -v + "px"
  }};
  if(supportCss3) {
    transformProperty = Feature.getVendorCssPropName("transform");
    methods._onSetScrollLeft = function(v) {
      var control = this.control;
      control.contentEl.style[transformProperty] = "translateX(" + floor(-v) + "px)" + " translateY(" + floor(-control.get("scrollTop")) + "px)" + (isTransform3dSupported ? " translateZ(0)" : "")
    };
    methods._onSetScrollTop = function(v) {
      var control = this.control;
      control.contentEl.style[transformProperty] = "translateX(" + floor(-control.get("scrollLeft")) + "px)" + " translateY(" + floor(-v) + "px)" + (isTransform3dSupported ? " translateZ(0)" : "")
    }
  }
  return Container.getDefaultRender().extend([ContentRenderExtension], methods, {name:"ScrollViewRender"})
});
KISSY.add("scroll-view/base", ["node", "anim", "component/container", "./base/render"], function(S, require) {
  var Node = require("node");
  var Anim = require("anim");
  var Container = require("component/container");
  var Render = require("./base/render");
  var $ = S.all, KeyCode = Node.KeyCode;
  function onElScroll() {
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    if(scrollTop) {
      self.set("scrollTop", scrollTop + self.get("scrollTop"))
    }
    if(scrollLeft) {
      self.set("scrollLeft", scrollLeft + self.get("scrollLeft"))
    }
    el.scrollTop = el.scrollLeft = 0
  }
  function frame(anim, fx) {
    anim.scrollView.set(fx.prop, fx.val)
  }
  function reflow(v) {
    var control = this, $contentEl = control.$contentEl;
    var scrollHeight = v.scrollHeight, scrollWidth = v.scrollWidth;
    var clientHeight = v.clientHeight, allowScroll, clientWidth = v.clientWidth;
    control.scrollHeight = scrollHeight;
    control.scrollWidth = scrollWidth;
    control.clientHeight = clientHeight;
    control.clientWidth = clientWidth;
    allowScroll = control.allowScroll = {};
    if(scrollHeight > clientHeight) {
      allowScroll.top = 1
    }
    if(scrollWidth > clientWidth) {
      allowScroll.left = 1
    }
    control.minScroll = {left:0, top:0};
    var maxScrollLeft, maxScrollTop;
    control.maxScroll = {left:maxScrollLeft = scrollWidth - clientWidth, top:maxScrollTop = scrollHeight - clientHeight};
    delete control.scrollStep;
    var snap = control.get("snap"), scrollLeft = control.get("scrollLeft"), scrollTop = control.get("scrollTop");
    if(snap) {
      var elOffset = $contentEl.offset();
      var pages = control.pages = typeof snap === "string" ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get("pageIndex"), pagesOffset = control.pagesOffset = [];
      pages.each(function(p, i) {
        var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
        if(left <= maxScrollLeft && top <= maxScrollTop) {
          pagesOffset[i] = {left:left, top:top, index:i}
        }
      });
      if(pageIndex) {
        control.scrollToPage(pageIndex);
        return
      }
    }
    control.scrollToWithBounds({left:scrollLeft, top:scrollTop});
    control.fire("reflow", v)
  }
  return Container.extend({initializer:function() {
    this.scrollAnims = []
  }, bindUI:function() {
    var self = this, $el = self.$el;
    $el.on("mousewheel", self.handleMouseWheel, self).on("scroll", onElScroll, self)
  }, _onSetDimension:reflow, handleKeyDownInternal:function(e) {
    var target = e.target, $target = $(target), nodeName = $target.nodeName();
    if(nodeName === "input" || nodeName === "textarea" || nodeName === "select" || $target.hasAttr("contenteditable")) {
      return undefined
    }
    var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok;
    var allowX = self.allowScroll.left;
    var allowY = self.allowScroll.top;
    if(allowY) {
      var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get("scrollTop");
      if(keyCode === KeyCode.DOWN) {
        self.scrollToWithBounds({top:scrollTop + scrollStepY});
        ok = true
      }else {
        if(keyCode === KeyCode.UP) {
          self.scrollToWithBounds({top:scrollTop - scrollStepY});
          ok = true
        }else {
          if(keyCode === KeyCode.PAGE_DOWN) {
            self.scrollToWithBounds({top:scrollTop + clientHeight});
            ok = true
          }else {
            if(keyCode === KeyCode.PAGE_UP) {
              self.scrollToWithBounds({top:scrollTop - clientHeight});
              ok = true
            }
          }
        }
      }
    }
    if(allowX) {
      var scrollStepX = scrollStep.left;
      var scrollLeft = self.get("scrollLeft");
      if(keyCode === KeyCode.RIGHT) {
        self.scrollToWithBounds({left:scrollLeft + scrollStepX});
        ok = true
      }else {
        if(keyCode === KeyCode.LEFT) {
          self.scrollToWithBounds({left:scrollLeft - scrollStepX});
          ok = true
        }
      }
    }
    return ok
  }, getScrollStep:function() {
    var control = this;
    if(control.scrollStep) {
      return control.scrollStep
    }
    var elDoc = $(this.get("el")[0].ownerDocument);
    var clientHeight = control.clientHeight;
    var clientWidth = control.clientWidth;
    control.scrollStep = {top:Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), left:Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
    return control.scrollStep
  }, handleMouseWheel:function(e) {
    if(this.get("disabled")) {
      return
    }
    var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
    if((deltaY = e.deltaY) && self.allowScroll.top) {
      var scrollTop = self.get("scrollTop");
      max = maxScroll.top;
      min = minScroll.top;
      if(!(scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0)) {
        self.scrollToWithBounds({top:scrollTop - e.deltaY * scrollStep.top});
        e.preventDefault()
      }
    }
    if((deltaX = e.deltaX) && self.allowScroll.left) {
      var scrollLeft = self.get("scrollLeft");
      max = maxScroll.left;
      min = minScroll.left;
      if(!(scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0)) {
        self.scrollToWithBounds({left:scrollLeft - e.deltaX * scrollStep.left});
        e.preventDefault()
      }
    }
  }, stopAnimation:function() {
    var self = this;
    if(self.scrollAnims.length) {
      S.each(self.scrollAnims, function(scrollAnim) {
        scrollAnim.stop()
      });
      self.scrollAnims = []
    }
    self.scrollToWithBounds({left:self.get("scrollLeft"), top:self.get("scrollTop")})
  }, _uiSetPageIndex:function(v) {
    this.scrollToPage(v)
  }, getPageIndexFromXY:function(v, allowX, direction) {
    var pagesOffset = this.pagesOffset.concat([]);
    var p2 = allowX ? "left" : "top";
    var i, offset;
    pagesOffset.sort(function(e1, e2) {
      return e1[p2] - e2[p2]
    });
    if(direction > 0) {
      for(i = 0;i < pagesOffset.length;i++) {
        offset = pagesOffset[i];
        if(offset[p2] >= v) {
          return offset.index
        }
      }
    }else {
      for(i = pagesOffset.length - 1;i >= 0;i--) {
        offset = pagesOffset[i];
        if(offset[p2] <= v) {
          return offset.index
        }
      }
    }
    return undefined
  }, scrollToPage:function(index, animCfg) {
    var self = this, pageOffset;
    if((pageOffset = self.pagesOffset) && pageOffset[index]) {
      self.set("pageIndex", index);
      self.scrollTo(pageOffset[index], animCfg)
    }
  }, scrollToWithBounds:function(cfg, anim) {
    var self = this;
    var maxScroll = self.maxScroll;
    var minScroll = self.minScroll;
    if(cfg.left) {
      cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left)
    }
    if(cfg.top) {
      cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top)
    }
    self.scrollTo(cfg, anim)
  }, scrollTo:function(cfg, animCfg) {
    var self = this, left = cfg.left, top = cfg.top;
    if(animCfg) {
      var node = {}, to = {};
      if(left !== undefined) {
        to.scrollLeft = left;
        node.scrollLeft = self.get("scrollLeft")
      }
      if(top !== undefined) {
        to.scrollTop = top;
        node.scrollTop = self.get("scrollTop")
      }
      animCfg.frame = frame;
      animCfg.node = node;
      animCfg.to = to;
      var anim;
      self.scrollAnims.push(anim = new Anim(animCfg));
      anim.scrollView = self;
      anim.run()
    }else {
      if(left !== undefined) {
        self.set("scrollLeft", left)
      }
      if(top !== undefined) {
        self.set("scrollTop", top)
      }
    }
  }}, {ATTRS:{contentEl:{}, scrollLeft:{view:1, value:0}, scrollTop:{view:1, value:0}, dimension:{}, focusable:{value:true}, allowTextSelection:{value:true}, handleMouseEvents:{value:false}, snap:{value:false}, pageIndex:{value:0}, xrender:{value:Render}}, xclass:"scroll-view"})
});

