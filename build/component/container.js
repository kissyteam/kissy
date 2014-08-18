/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:16
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/container/render
 component/container
*/

KISSY.add("component/container/render", ["component/control", "component/manager"], function(S, require) {
  var Control = require("component/control");
  var Manager = require("component/manager");
  return Control.getDefaultRender().extend([], {decorateDom:function() {
    var self = this, childrenContainerEl = self.getChildrenContainerEl(), control = self.control, defaultChildCfg = control.get("defaultChildCfg"), prefixCls = defaultChildCfg.prefixCls, defaultChildXClass = defaultChildCfg.xclass, childrenComponents = [], children = childrenContainerEl.children();
    children.each(function(c) {
      var ChildUI = self.getComponentConstructorByNode(prefixCls, c) || defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass);
      if(ChildUI) {
        childrenComponents.push(new ChildUI(S.merge(defaultChildCfg, {srcNode:c})))
      }
    });
    control.set("children", childrenComponents)
  }, getChildrenContainerEl:function() {
    return this.$el
  }}, {name:"ContainerRender"})
});
KISSY.add("component/container", ["component/control", "./container/render"], function(S, require) {
  var Control = require("component/control");
  var ContainerRender = require("./container/render");
  function defAddChild(e) {
    var self = this;
    if(e.target !== self) {
      return
    }
    var c = e.component, children = self.get("children"), index = e.index;
    children.splice(index, 0, c);
    children = self.get("children");
    c = children[index];
    c.setInternal("parent", self);
    if(self.get("rendered")) {
      self.renderChild(index)
    }
    self.fire("afterAddChild", {component:c, index:index})
  }
  function defRemoveChild(e) {
    var self = this;
    if(e.target !== self) {
      return
    }
    var c = e.component, cDOMParentEl, cDOMEl, destroy = e.destroy, children = self.get("children"), index = e.index;
    if(index !== -1) {
      children.splice(index, 1)
    }
    c.setInternal("parent", null);
    if(destroy) {
      if(c.destroy) {
        c.destroy()
      }
    }else {
      if(c.get && (cDOMEl = c.el)) {
        if(cDOMParentEl = cDOMEl.parentNode) {
          cDOMParentEl.removeChild(cDOMEl)
        }
      }
    }
    self.fire("afterRemoveChild", {component:c, index:index})
  }
  return Control.extend({isContainer:true, initializer:function() {
    var self = this, prefixCls = self.get("prefixCls"), defaultChildCfg = self.get("defaultChildCfg");
    self.publish("beforeAddChild", {defaultFn:defAddChild});
    self.publish("beforeRemoveChild", {defaultFn:defRemoveChild});
    defaultChildCfg.prefixCls = defaultChildCfg.prefixCls || prefixCls
  }, createDom:function() {
    this.createChildren()
  }, renderUI:function() {
    this.renderChildren()
  }, renderChildren:function() {
    var i, self = this, children = self.get("children");
    for(i = 0;i < children.length;i++) {
      self.renderChild(i)
    }
  }, createChildren:function() {
    var i, self = this, children = self.get("children");
    for(i = 0;i < children.length;i++) {
      self.createChild(i)
    }
  }, addChild:function(c, index) {
    var self = this, children = self.get("children");
    if(index === undefined) {
      index = children.length
    }
    self.fire("beforeAddChild", {component:c, index:index})
  }, renderChild:function(childIndex) {
    var self = this, children = self.get("children");
    self.createChild(childIndex).render();
    self.fire("afterRenderChild", {component:children[childIndex], index:childIndex})
  }, createChild:function(childIndex) {
    var self = this, c, elBefore, domContentEl, children = self.get("children"), cEl, contentEl;
    c = children[childIndex];
    contentEl = self.view.getChildrenContainerEl();
    domContentEl = contentEl[0];
    elBefore = domContentEl.children[childIndex] || null;
    if(c.get("rendered")) {
      cEl = c.el;
      if(cEl.parentNode !== domContentEl) {
        domContentEl.insertBefore(cEl, elBefore)
      }
    }else {
      if(elBefore) {
        c.set("elBefore", elBefore)
      }else {
        c.set("render", contentEl)
      }
      c.create()
    }
    self.fire("afterCreateChild", {component:c, index:childIndex});
    return c
  }, removeChild:function(c, destroy) {
    if(destroy === undefined) {
      destroy = true
    }
    this.fire("beforeRemoveChild", {component:c, index:S.indexOf(c, this.get("children")), destroy:destroy})
  }, removeChildren:function(destroy) {
    var self = this, i, t = [].concat(self.get("children"));
    for(i = 0;i < t.length;i++) {
      self.removeChild(t[i], destroy)
    }
    return self
  }, getChildAt:function(index) {
    var children = this.get("children");
    return children[index] || null
  }, destructor:function() {
    var i, children = this.get("children");
    for(i = 0;i < children.length;i++) {
      if(children[i].destroy) {
        children[i].destroy()
      }
    }
  }}, {ATTRS:{children:{value:[], getter:function(v) {
    var defaultChildCfg = null, i, c, self = this;
    for(i = 0;i < v.length;i++) {
      c = v[i];
      if(!c.isControl) {
        defaultChildCfg = defaultChildCfg || self.get("defaultChildCfg");
        S.mix(c, defaultChildCfg, false);
        v[i] = this.createComponent(c)
      }
    }
    return v
  }, setter:function(v) {
    var i, c;
    for(i = 0;i < v.length;i++) {
      c = v[i];
      if(c.isControl) {
        c.setInternal("parent", this)
      }
    }
  }}, defaultChildCfg:{value:{}}, xrender:{value:ContainerRender}}, name:"container"})
});

