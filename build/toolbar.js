/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:31
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 toolbar/render
 toolbar
*/

KISSY.add("toolbar/render", ["component/container"], function(S, require) {
  var Container = require("component/container");
  return Container.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = "toolbar"
  }})
});
KISSY.add("toolbar", ["component/container", "component/extension/delegate-children", "toolbar/render", "node"], function(S, require) {
  var Container = require("component/container");
  var DelegateChildrenExtension = require("component/extension/delegate-children");
  var ToolbarRender = require("toolbar/render");
  var Node = require("node");
  var KeyCode = Node.KeyCode;
  function getNextEnabledItem(index, direction, self) {
    var children = self.get("children"), count = 0, childrenLength = children.length;
    if(index === undefined) {
      if(direction === 1) {
        index = 0
      }else {
        index = childrenLength - 1
      }
      if(!children[index].get("disabled")) {
        return children[index]
      }
    }
    do {
      count++;
      index = (index + childrenLength + direction) % childrenLength
    }while(count < childrenLength && children[index].get("disabled"));
    if(count !== childrenLength) {
      return children[index]
    }
    return null
  }
  function afterCollapsedChange(e) {
    var self = this;
    if(e.newVal) {
      self.set("expandedItem", null)
    }else {
      self.set("expandedItem", e.target)
    }
  }
  function afterHighlightedChange(e) {
    var self = this, expandedItem, children, target = e.target;
    if(self !== target && (target.isMenuItem || target.isButton)) {
      if(e.newVal) {
        children = self.get("children");
        if((expandedItem = self.get("expandedItem")) && S.inArray(target, children)) {
          self.set("expandedItem", target.isMenuButton ? target : null)
        }
        self.set("highlightedItem", target)
      }else {
        if(!e.byPassSetToolbarHighlightedItem) {
          self.set("highlightedItem", null)
        }
      }
    }
  }
  function getChildByHighlightedItem(toolbar) {
    var children = toolbar.get("children"), i, child;
    for(i = 0;i < children.length;i++) {
      child = children[i];
      if(child.get("highlighted") || child.isMenuButton && !child.get("collapsed")) {
        return child
      }
    }
    return null
  }
  return Container.extend([DelegateChildrenExtension], {_onSetHighlightedItem:function(item, e) {
    var id, itemEl, self = this, prevVal = e && e.prevVal, children = self.get("children"), el = self.el;
    if(prevVal && S.inArray(prevVal, children)) {
      prevVal.set("highlighted", false, {data:{byPassSetToolbarHighlightedItem:1}})
    }
    if(item) {
      if(el.ownerDocument.activeElement !== el) {
        self.focus()
      }
      itemEl = item.el;
      id = itemEl.id;
      if(!id) {
        itemEl.id = id = S.guid("ks-toolbar-item")
      }
      el.setAttribute("aria-activedescendant", id)
    }else {
      el.setAttribute("aria-activedescendant", "")
    }
  }, _onSetExpandedItem:function(v, e) {
    if(e && e.prevVal) {
      e.prevVal.set("collapsed", true)
    }
    if(v) {
      v.set("collapsed", false)
    }
  }, bindUI:function() {
    var self = this;
    self.on("afterCollapsedChange", afterCollapsedChange, self);
    self.on("afterHighlightedChange", afterHighlightedChange, self)
  }, handleBlurInternal:function(e) {
    var self = this, highlightedItem;
    self.callSuper(e);
    self.set("expandedItem", null);
    if(highlightedItem = self.get("highlightedItem")) {
      highlightedItem.set("highlighted", false)
    }
  }, getNextItemByKeyDown:function(e, current) {
    var self = this, children = self.get("children"), childIndex = current && S.indexOf(current, children);
    if(current) {
      if(current.handleKeyDownInternal(e)) {
        return true
      }
    }
    if(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
      return false
    }
    switch(e.keyCode) {
      case KeyCode.ESC:
        self.view.getKeyEventTarget().fire("blur");
        return true;
      case KeyCode.HOME:
        current = getNextEnabledItem(undefined, 1, self);
        break;
      case KeyCode.END:
        current = getNextEnabledItem(undefined, -1, self);
        break;
      case KeyCode.UP:
        current = getNextEnabledItem(childIndex, -1, self);
        break;
      case KeyCode.LEFT:
        current = getNextEnabledItem(childIndex, -1, self);
        break;
      case KeyCode.DOWN:
        current = getNextEnabledItem(childIndex, 1, self);
        break;
      case KeyCode.RIGHT:
        current = getNextEnabledItem(childIndex, 1, self);
        break;
      default:
        return false
    }
    return current
  }, handleKeyDownInternal:function(e) {
    var self = this, currentChild = getChildByHighlightedItem(self), nextHighlightedItem = self.getNextItemByKeyDown(e, currentChild);
    if(typeof nextHighlightedItem === "boolean") {
      return nextHighlightedItem
    }
    if(nextHighlightedItem) {
      nextHighlightedItem.set("highlighted", true)
    }
    return true
  }}, {xclass:"toolbar", ATTRS:{highlightedItem:{}, expandedItem:{}, defaultChildCfg:{value:{xclass:"button", handleMouseEvents:false, focusable:false}}, xrender:{value:ToolbarRender}}})
});

