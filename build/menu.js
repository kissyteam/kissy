/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:29
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 menu/menu-render
 menu/control
 menu/menuitem-render
 menu/menuitem
 menu/check-menuitem-xtpl
 menu/check-menuitem-render
 menu/check-menuitem
 menu/submenu-xtpl
 menu/submenu-render
 menu/submenu
 menu/popupmenu-render
 menu/popupmenu
 menu
*/

KISSY.add("menu/menu-render", ["component/container"], function(S, require) {
  var Container = require("component/container");
  return Container.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = "menu"
  }, containsElement:function(element) {
    var $el = this.$el;
    return $el && ($el[0] === element || $el.contains(element))
  }})
});
KISSY.add("menu/control", ["node", "component/container", "component/extension/delegate-children", "./menu-render"], function(S, require) {
  var Node = require("node");
  var Container = require("component/container");
  var DelegateChildrenExtension = require("component/extension/delegate-children");
  var MenuRender = require("./menu-render");
  var KeyCode = Node.KeyCode;
  return Container.extend([DelegateChildrenExtension], {isMenu:1, _onSetHighlightedItem:function(v, ev) {
    var highlightedItem;
    if(v && ev && (highlightedItem = ev.prevVal)) {
      highlightedItem.set("highlighted", false, {data:{byPassSetHighlightedItem:1}})
    }
  }, _onSetVisible:function(v, e) {
    this.callSuper(e);
    var highlightedItem;
    if(!v && (highlightedItem = this.get("highlightedItem"))) {
      highlightedItem.set("highlighted", false)
    }
  }, bindUI:function() {
    var self = this;
    self.on("afterHighlightedItemChange", afterHighlightedItemChange, self)
  }, getRootMenu:function() {
    return this
  }, handleMouseEnterInternal:function(e) {
    this.callSuper(e);
    var rootMenu = this.getRootMenu();
    if(rootMenu && rootMenu._popupAutoHideTimer) {
      clearTimeout(rootMenu._popupAutoHideTimer);
      rootMenu._popupAutoHideTimer = null
    }
  }, handleBlurInternal:function(e) {
    this.callSuper(e);
    var highlightedItem;
    if(highlightedItem = this.get("highlightedItem")) {
      highlightedItem.set("highlighted", false)
    }
  }, _getNextEnabledHighlighted:function(index, dir) {
    var children = this.get("children"), len = children.length, o = index;
    do {
      var c = children[index];
      if(!c.get("disabled") && c.get("visible") !== false) {
        return children[index]
      }
      index = (index + dir + len) % len
    }while(index !== o);
    return undefined
  }, handleKeyDownInternal:function(e) {
    var self = this;
    var highlightedItem = self.get("highlightedItem");
    if(highlightedItem && highlightedItem.handleKeyDownInternal(e)) {
      return true
    }
    var children = self.get("children"), len = children.length;
    if(len === 0) {
      return undefined
    }
    var index, destIndex, nextHighlighted;
    switch(e.keyCode) {
      case KeyCode.ESC:
        if(highlightedItem = self.get("highlightedItem")) {
          highlightedItem.set("highlighted", false)
        }
        break;
      case KeyCode.HOME:
        nextHighlighted = self._getNextEnabledHighlighted(0, 1);
        break;
      case KeyCode.END:
        nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
        break;
      case KeyCode.UP:
        if(!highlightedItem) {
          destIndex = len - 1
        }else {
          index = S.indexOf(highlightedItem, children);
          destIndex = (index - 1 + len) % len
        }
        nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
        break;
      case KeyCode.DOWN:
        if(!highlightedItem) {
          destIndex = 0
        }else {
          index = S.indexOf(highlightedItem, children);
          destIndex = (index + 1 + len) % len
        }
        nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
        break
    }
    if(nextHighlighted) {
      nextHighlighted.set("highlighted", true, {data:{fromKeyboard:1}});
      return true
    }else {
      return undefined
    }
  }, containsElement:function(element) {
    var self = this;
    if(!self.get("visible") || !self.$el) {
      return false
    }
    if(self.view.containsElement(element)) {
      return true
    }
    var children = self.get("children");
    for(var i = 0, count = children.length;i < count;i++) {
      var child = children[i];
      if(child.containsElement && child.containsElement(element)) {
        return true
      }
    }
    return false
  }}, {ATTRS:{highlightedItem:{value:null}, xrender:{value:MenuRender}, defaultChildCfg:{value:{xclass:"menuitem"}}}, xclass:"menu"});
  function afterHighlightedItemChange(e) {
    if(e.target.isMenu) {
      var el = this.el, menuItem = e.newVal;
      el.setAttribute("aria-activedescendant", menuItem && menuItem.el.id || "")
    }
  }
});
KISSY.add("menu/menuitem-render", ["component/control"], function(S, require) {
  var Control = require("component/control");
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = renderData.selectable ? "menuitemradio" : "menuitem";
    if(renderData.selected) {
      renderData.elCls.push(this.getBaseCssClasses("selected"))
    }
  }, _onSetSelected:function(v) {
    var self = this, cls = self.getBaseCssClasses("selected");
    self.$el[v ? "addClass" : "removeClass"](cls)
  }, containsElement:function(element) {
    var $el = this.$el;
    return $el && ($el[0] === element || $el.contains(element))
  }}, {HTML_PARSER:{selectable:function(el) {
    return el.hasClass(this.getBaseCssClass("selectable"))
  }}})
});
KISSY.add("menu/menuitem", ["component/control", "./menuitem-render", "node"], function(S, require) {
  var Control = require("component/control");
  var MenuItemRender = require("./menuitem-render");
  var $ = require("node").all;
  return Control.extend({isMenuItem:1, handleClickInternal:function() {
    var self = this;
    self.callSuper();
    if(self.get("selectable")) {
      self.set("selected", true)
    }
    self.fire("click");
    return true
  }, _onSetHighlighted:function(v, e) {
    var self = this, parent = self.get("parent");
    if(!(e && e.byPassSetHighlightedItem)) {
      if(self.get("rendered")) {
        parent.set("highlightedItem", v ? self : null)
      }else {
        if(v) {
          parent.set("highlightedItem", self)
        }
      }
    }
    if(v) {
      var el = self.$el, p = el.parent(function(e) {
        return $(e).css("overflow") !== "visible"
      }, parent.get("el").parent());
      if(!p) {
        return
      }
      el.scrollIntoView(p, {alignWithTop:true, allowHorizontalScroll:true, onlyScrollIfNeeded:true})
    }
  }, containsElement:function(element) {
    return this.view.containsElement(element)
  }}, {ATTRS:{focusable:{value:false}, handleMouseEvents:{value:false}, selectable:{view:1}, value:{}, selected:{view:1}, xrender:{value:MenuItemRender}}, xclass:"menuitem"})
});
KISSY.add("menu/check-menuitem-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div class="';
    var config1 = {};
    var params2 = [];
    params2.push("checkbox");
    config1.params = params2;
    var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '">\n</div>\n';
    var config4 = {};
    var params5 = [];
    params5.push("component/extension/content-xtpl");
    config4.params = params5;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      config4.params[0] = moduleWrap.resolveByName(config4.params[0])
    }
    var id3 = runInlineCommandUtil(engine, scope, config4, "include", 3);
    buffer += renderOutputUtil(id3, false);
    return buffer
  }
});
KISSY.add("menu/check-menuitem-render", ["./menuitem-render", "component/extension/content-render", "./check-menuitem-xtpl"], function(S, require) {
  var MenuItemRender = require("./menuitem-render");
  var ContentRenderExtension = require("component/extension/content-render");
  var CheckMenuItemTpl = require("./check-menuitem-xtpl");
  return MenuItemRender.extend([ContentRenderExtension], {beforeCreateDom:function(renderData) {
    if(renderData.checked) {
      renderData.elCls.push(this.getBaseCssClasses("checked"))
    }
  }, _onSetChecked:function(v) {
    var self = this, cls = self.getBaseCssClasses("checked");
    self.$el[v ? "addClass" : "removeClass"](cls)
  }}, {ATTRS:{contentTpl:{value:CheckMenuItemTpl}}})
});
KISSY.add("menu/check-menuitem", ["./menuitem", "./check-menuitem-render"], function(S, require) {
  var MenuItem = require("./menuitem");
  var CheckMenuItemRender = require("./check-menuitem-render");
  return MenuItem.extend({handleClickInternal:function() {
    var self = this;
    self.callSuper();
    self.set("checked", !self.get("checked"));
    self.fire("click");
    return true
  }}, {ATTRS:{checked:{view:1}, xrender:{value:CheckMenuItemRender}}, xclass:"check-menuitem"})
});
KISSY.add("menu/submenu-xtpl", [], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div id="ks-content-';
    var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '"\n     class="';
    var config2 = {};
    var params3 = [];
    params3.push("content");
    config2.params = params3;
    var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id1, true);
    buffer += '">';
    var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 2);
    buffer += renderOutputUtil(id4, false);
    buffer += '</div>\n<span class="';
    var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "prefixCls", 0, 3);
    buffer += renderOutputUtil(id5, true);
    buffer += 'submenu-arrow">\u25ba</span>';
    return buffer
  }
});
KISSY.add("menu/submenu-render", ["./submenu-xtpl", "./menuitem-render", "component/extension/content-render"], function(S, require) {
  var SubMenuTpl = require("./submenu-xtpl");
  var MenuItemRender = require("./menuitem-render");
  var ContentRenderExtension = require("component/extension/content-render");
  return MenuItemRender.extend([ContentRenderExtension], {decorateDom:function(el) {
    var control = this.control, prefixCls = control.get("prefixCls");
    var popupMenuEl = el.one("." + prefixCls + "popupmenu");
    var docBody = popupMenuEl[0].ownerDocument.body;
    docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
    var PopupMenuClass = this.getComponentConstructorByNode(prefixCls, popupMenuEl);
    control.setInternal("menu", new PopupMenuClass({srcNode:popupMenuEl, prefixCls:prefixCls}))
  }}, {ATTRS:{contentTpl:{value:SubMenuTpl}}})
});
KISSY.add("menu/submenu", ["node", "./menuitem", "./submenu-render"], function(S, require) {
  var Node = require("node");
  var MenuItem = require("./menuitem");
  var SubMenuRender = require("./submenu-render");
  var KeyCode = Node.KeyCode, MENU_DELAY = 0.15;
  function afterHighlightedChange(e) {
    var target = e.target, self = this;
    if(target !== self && target.isMenuItem && e.newVal) {
      self.clearHidePopupMenuTimers();
      if(!self.get("highlighted")) {
        self.set("highlighted", true);
        target.set("highlighted", false);
        target.set("highlighted", true)
      }
    }
  }
  return MenuItem.extend({isSubMenu:1, clearShowPopupMenuTimers:function() {
    var showTimer;
    if(showTimer = this._showTimer) {
      showTimer.cancel();
      this._showTimer = null
    }
  }, clearHidePopupMenuTimers:function() {
    var dismissTimer;
    if(dismissTimer = this._dismissTimer) {
      dismissTimer.cancel();
      this._dismissTimer = null
    }
  }, clearSubMenuTimers:function() {
    this.clearHidePopupMenuTimers();
    this.clearShowPopupMenuTimers()
  }, bindUI:function() {
    var self = this;
    self.on("afterHighlightedChange", afterHighlightedChange, self)
  }, handleMouseLeaveInternal:function() {
    var self = this;
    self.set("highlighted", false, {data:{fromMouse:1}});
    self.clearSubMenuTimers();
    var menu = self.get("menu");
    if(menu.get("visible")) {
      self._dismissTimer = S.later(hideMenu, self.get("menuDelay") * 1E3, false, self)
    }
  }, handleMouseEnterInternal:function() {
    var self = this;
    self.set("highlighted", true, {data:{fromMouse:1}});
    self.clearSubMenuTimers();
    var menu = self.get("menu");
    if(!menu.get("visible")) {
      self._showTimer = S.later(showMenu, self.get("menuDelay") * 1E3, false, self)
    }
  }, _onSetHighlighted:function(v, e) {
    var self = this;
    if(!e) {
      return
    }
    self.callSuper(e);
    if(e.fromMouse) {
      return
    }
    if(v && !e.fromKeyboard) {
      showMenu.call(self)
    }else {
      if(!v) {
        hideMenu.call(self)
      }
    }
  }, handleClickInternal:function() {
    var self = this;
    showMenu.call(self);
    self.callSuper()
  }, handleKeyDownInternal:function(e) {
    var self = this, menu = self.get("menu"), menuChildren, menuChild, hasKeyboardControl_ = menu.get("visible"), keyCode = e.keyCode;
    if(!hasKeyboardControl_) {
      if(keyCode === KeyCode.RIGHT) {
        showMenu.call(self);
        menuChildren = menu.get("children");
        if(menuChild = menuChildren[0]) {
          menuChild.set("highlighted", true, {data:{fromKeyboard:1}})
        }
      }else {
        if(keyCode === KeyCode.ENTER) {
          return self.handleClickInternal(e)
        }else {
          return undefined
        }
      }
    }else {
      if(!menu.handleKeyDownInternal(e)) {
        if(keyCode === KeyCode.LEFT) {
          self.set("highlighted", false);
          self.set("highlighted", true, {data:{fromKeyboard:1}})
        }else {
          return undefined
        }
      }
    }
    return true
  }, containsElement:function(element) {
    return this.get("menu").containsElement(element)
  }, destructor:function() {
    var self = this, menu = self.get("menu");
    self.clearSubMenuTimers();
    menu.destroy()
  }}, {ATTRS:{menuDelay:{value:MENU_DELAY}, menu:{value:{}, getter:function(v) {
    if(!v.isControl) {
      v.xclass = v.xclass || "popupmenu";
      v = this.createComponent(v);
      this.setInternal("menu", v)
    }
    return v
  }, setter:function(m) {
    if(m.isControl) {
      m.setInternal("parent", this)
    }
  }}, xrender:{value:SubMenuRender}}, xclass:"submenu"});
  function showMenu() {
    var self = this, menu = self.get("menu");
    var align = {node:this.$el, points:["tr", "tl"], overflow:{adjustX:1, adjustY:1}};
    S.mix(menu.get("align"), align, false);
    menu.show();
    self.el.setAttribute("aria-haspopup", menu.get("el").attr("id"))
  }
  function hideMenu() {
    this.get("menu").hide()
  }
});
KISSY.add("menu/popupmenu-render", ["component/extension/content-render", "./menu-render"], function(S, require) {
  var ContentRenderExtension = require("component/extension/content-render");
  var MenuRender = require("./menu-render");
  return MenuRender.extend([ContentRenderExtension])
});
KISSY.add("menu/popupmenu", ["component/extension/align", "component/extension/shim", "./control", "./popupmenu-render"], function(S, require) {
  var AlignExtension = require("component/extension/align");
  var Shim = require("component/extension/shim");
  var Menu = require("./control");
  var PopupMenuRender = require("./popupmenu-render");
  return Menu.extend([Shim, AlignExtension], {getRootMenu:function() {
    var cur = this, last;
    do {
      last = cur;
      cur = cur.get("parent")
    }while(cur && (cur.isMenuItem || cur.isMenu));
    return last === this ? null : last
  }, handleMouseLeaveInternal:function(e) {
    this.callSuper(e);
    if(this.get("autoHideOnMouseLeave")) {
      var rootMenu = this.getRootMenu();
      if(rootMenu) {
        clearTimeout(rootMenu._popupAutoHideTimer);
        rootMenu._popupAutoHideTimer = setTimeout(function() {
          var item;
          if(item = rootMenu.get("highlightedItem")) {
            item.set("highlighted", false)
          }
        }, this.get("parent").get("menuDelay") * 1E3)
      }
    }
  }, isPopupMenu:1, handleBlurInternal:function(e) {
    var self = this;
    self.callSuper(e);
    self.hide()
  }}, {ATTRS:{focusable:{value:false}, autoHideOnMouseLeave:{}, contentEl:{}, visible:{value:false}, xrender:{value:PopupMenuRender}}, xclass:"popupmenu"})
});
KISSY.add("menu", ["menu/control", "menu/menuitem", "menu/check-menuitem", "menu/submenu", "menu/popupmenu"], function(S, require) {
  var Menu = require("menu/control");
  var Item = require("menu/menuitem");
  var CheckItem = require("menu/check-menuitem");
  var SubMenu = require("menu/submenu");
  var PopupMenu = require("menu/popupmenu");
  Menu.Item = Item;
  Menu.CheckItem = CheckItem;
  Menu.SubMenu = SubMenu;
  Menu.PopupMenu = PopupMenu;
  return Menu
});

