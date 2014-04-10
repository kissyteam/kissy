/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:48
*/
/*
 Combined modules by KISSY Module Compiler: 

 menu/control
 menu/menuitem
 menu/check-menuitem-xtpl
 menu/check-menuitem
 menu/submenu-xtpl
 menu/submenu
 menu/popupmenu
 menu
*/

KISSY.add("menu/control", ["node", "component/container", "component/extension/delegate-children"], function(S, require) {
  var Node = require("node");
  var Container = require("component/container");
  var DelegateChildrenExtension = require("component/extension/delegate-children");
  var KeyCode = Node.KeyCode;
  return Container.extend([DelegateChildrenExtension], {isMenu:1, beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = "menu"
  }, bindUI:function() {
    var self = this;
    self.on("afterHighlightedItemChange", afterHighlightedItemChange, self)
  }, _onSetHighlightedItem:function(v, ev) {
    var highlightedItem;
    if(v && ev && (highlightedItem = ev.prevVal)) {
      highlightedItem.set("highlighted", false, {data:{byPassSetHighlightedItem:1}})
    }
  }, _onSetVisible:function(v, e) {
    this.callSuper(v, e);
    var highlightedItem;
    if(!v && (highlightedItem = this.get("highlightedItem"))) {
      highlightedItem.set("highlighted", false)
    }
  }, getRootMenu:function() {
    return this
  }, handleMouseEnterInternal:function(e) {
    this.callSuper(e);
    var rootMenu = this.getRootMenu();
    if(rootMenu && rootMenu._popupAutoHideTimer) {
      clearTimeout(rootMenu._popupAutoHideTimer);
      rootMenu._popupAutoHideTimer = null
    }
    this.focus()
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
    var $el = self.$el;
    if(!self.get("visible") || !$el) {
      return false
    }
    if($el && ($el[0] === element || $el.contains(element))) {
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
  }}, {ATTRS:{highlightedItem:{value:null}, defaultChildCfg:{value:{xclass:"menuitem"}}}, xclass:"menu"});
  function afterHighlightedItemChange(e) {
    if(e.target.isMenu) {
      var el = this.el, menuItem = e.newVal;
      el.setAttribute("aria-activedescendant", menuItem && menuItem.el.id || "")
    }
  }
});
KISSY.add("menu/menuitem", ["component/control", "node"], function(S, require) {
  var Control = require("component/control");
  var $ = require("node").all;
  return Control.extend({isMenuItem:1, beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = renderData.selectable ? "menuitemradio" : "menuitem";
    if(renderData.selected) {
      renderData.elCls.push(this.getBaseCssClasses("selected"))
    }
  }, handleClickInternal:function(ev) {
    var self = this;
    self.callSuper(ev);
    ev.preventDefault();
    if(self.get("selectable")) {
      self.set("selected", true)
    }
    self.fire("click");
    return true
  }, _onSetHighlighted:function(v, e) {
    var self = this, parent = self.get("parent");
    self.callSuper(v, e);
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
  }, _onSetSelected:function(v) {
    var self = this, cls = self.getBaseCssClasses("selected");
    self.$el[v ? "addClass" : "removeClass"](cls)
  }, containsElement:function(element) {
    var $el = this.$el;
    return $el && ($el[0] === element || $el.contains(element))
  }}, {ATTRS:{focusable:{value:false}, handleGestureEvents:{value:false}, selectable:{sync:0, render:1, parse:function(el) {
    return el.hasClass(this.getBaseCssClass("selectable"))
  }}, value:{}, selected:{sync:0, render:1}}, xclass:"menuitem"})
});
KISSY.add("menu/check-menuitem-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("checkbox");
    option0.params = params1;
    var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write('">\n</div>\n');
    var option3 = {};
    var params4 = [];
    params4.push("component/extension/content-xtpl");
    option3.params = params4;
    require("component/extension/content-xtpl");
    option3.params[0] = module.resolve(option3.params[0]);
    var commandRet5 = includeCommand.call(engine, scope, option3, buffer, 3, payload);
    if(commandRet5 && commandRet5.isBuffer) {
      buffer = commandRet5;
      commandRet5 = undefined
    }
    buffer.write(commandRet5, false);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("menu/check-menuitem", ["./menuitem", "component/extension/content-box", "./check-menuitem-xtpl"], function(S, require) {
  var MenuItem = require("./menuitem");
  var ContentBox = require("component/extension/content-box");
  var CheckMenuItemTpl = require("./check-menuitem-xtpl");
  return MenuItem.extend([ContentBox], {beforeCreateDom:function(renderData) {
    if(renderData.checked) {
      renderData.elCls.push(this.getBaseCssClasses("checked"))
    }
  }, _onSetChecked:function(v) {
    var self = this, cls = self.getBaseCssClasses("checked");
    self.$el[v ? "addClass" : "removeClass"](cls)
  }, handleClickInternal:function(e) {
    var self = this;
    self.callSuper(e);
    self.set("checked", !self.get("checked"));
    self.fire("click");
    return true
  }}, {ATTRS:{checked:{render:1, sync:0}, contentTpl:{value:CheckMenuItemTpl}}, xclass:"check-menuitem"})
});
KISSY.add("menu/submenu-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("content");
    option0.params = params1;
    var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write('">');
    var id3 = scope.resolve(["content"]);
    buffer.write(id3, false);
    buffer.write('</div>\n<span class="');
    var id4 = scope.resolve(["prefixCls"]);
    buffer.write(id4, true);
    buffer.write('submenu-arrow">\u25ba</span>');
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("menu/submenu", ["node", "./submenu-xtpl", "./menuitem", "component/extension/content-box"], function(S, require) {
  var Node = require("node");
  var SubMenuTpl = require("./submenu-xtpl");
  var MenuItem = require("./menuitem");
  var ContentBox = require("component/extension/content-box");
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
  return MenuItem.extend([ContentBox], {isSubMenu:1, decorateDom:function(el) {
    var self = this, prefixCls = self.get("prefixCls");
    var popupMenuEl = el.one("." + prefixCls + "popupmenu");
    var docBody = popupMenuEl[0].ownerDocument.body;
    docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
    var PopupMenuClass = this.getComponentConstructorByNode(prefixCls, popupMenuEl);
    self.setInternal("menu", new PopupMenuClass({srcNode:popupMenuEl, prefixCls:prefixCls}))
  }, bindUI:function() {
    var self = this;
    self.on("afterHighlightedChange", afterHighlightedChange, self)
  }, clearShowPopupMenuTimers:function() {
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
    self.callSuper(v, e);
    if(!e) {
      return
    }
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
  }, handleClickInternal:function(e) {
    var self = this;
    showMenu.call(self);
    self.callSuper(e)
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
  }}, contentTpl:{value:SubMenuTpl}}, xclass:"submenu"});
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
KISSY.add("menu/popupmenu", ["component/extension/align", "component/extension/shim", "./control", "component/extension/content-box"], function(S, require) {
  var AlignExtension = require("component/extension/align");
  var Shim = require("component/extension/shim");
  var Menu = require("./control");
  var ContentBox = require("component/extension/content-box");
  return Menu.extend([ContentBox, Shim, AlignExtension], {getRootMenu:function() {
    var self = this, cur = self, last;
    do {
      last = cur;
      cur = cur.get("parent")
    }while(cur && (cur.isMenuItem || cur.isMenu));
    return last === self ? null : last
  }, handleMouseLeaveInternal:function(e) {
    var self = this;
    self.callSuper(e);
    if(self.get("autoHideOnMouseLeave")) {
      var rootMenu = self.getRootMenu();
      if(rootMenu) {
        clearTimeout(rootMenu._popupAutoHideTimer);
        rootMenu._popupAutoHideTimer = setTimeout(function() {
          var item;
          if(item = rootMenu.get("highlightedItem")) {
            item.set("highlighted", false)
          }
        }, self.get("parent").get("menuDelay") * 1E3)
      }
    }
  }, isPopupMenu:1, handleBlurInternal:function(e) {
    var self = this;
    self.callSuper(e);
    self.hide()
  }}, {ATTRS:{focusable:{value:false}, autoHideOnMouseLeave:{}, contentEl:{}, visible:{value:false}}, xclass:"popupmenu"})
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

