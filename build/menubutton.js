/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 27 14:15
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 menubutton/menubutton-xtpl
 menubutton/render
 menubutton/control
 menubutton/select
 menubutton/option
 menubutton
*/

KISSY.add("menubutton/menubutton-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += "";
    var config1 = {};
    var params2 = [];
    params2.push("component/extension/content-xtpl");
    config1.params = params2;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      config1.params[0] = moduleWrap.resolveByName(config1.params[0])
    }
    var id0 = runInlineCommandUtil(engine, scope, config1, "include", 1);
    buffer += renderOutputUtil(id0, false);
    buffer += '\n<div class="';
    var config4 = {};
    var params5 = [];
    params5.push("dropdown");
    config4.params = params5;
    var id3 = runInlineCommandUtil(engine, scope, config4, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id3, true);
    buffer += '">\n    <div class="';
    var config7 = {};
    var params8 = [];
    params8.push("dropdown-inner");
    config7.params = params8;
    var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 3);
    buffer += renderOutputUtil(id6, true);
    buffer += '">\n    </div>\n</div>';
    return buffer
  }
});
KISSY.add("menubutton/render", ["button", "./menubutton-xtpl", "component/extension/content-render"], function(S, require) {
  var Button = require("button");
  var MenuButtonTpl = require("./menubutton-xtpl");
  var ContentRenderExtension = require("component/extension/content-render");
  return Button.getDefaultRender().extend([ContentRenderExtension], {decorateDom:function(el) {
    var control = this.control, prefixCls = control.get("prefixCls");
    var popupMenuEl = el.one("." + prefixCls + "popupmenu");
    var docBody = popupMenuEl[0].ownerDocument.body;
    docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
    var PopupMenuClass = this.getComponentConstructorByNode(prefixCls, popupMenuEl);
    control.setInternal("menu", new PopupMenuClass({srcNode:popupMenuEl, prefixCls:prefixCls}))
  }, beforeCreateDom:function(renderData) {
    S.mix(renderData.elAttrs, {"aria-expanded":false, "aria-haspopup":true})
  }, _onSetCollapsed:function(v) {
    var self = this, el = self.$el, cls = self.getBaseCssClass("open");
    el[v ? "removeClass" : "addClass"](cls).attr("aria-expanded", !v)
  }}, {ATTRS:{contentTpl:{value:MenuButtonTpl}}})
});
KISSY.add("menubutton/control", ["node", "button", "./render"], function(S, require) {
  var Node = require("node");
  var Button = require("button");
  var MenuButtonRender = require("./render");
  var KeyCode = Node.KeyCode;
  return Button.extend({isMenuButton:1, _onSetCollapsed:function(v) {
    var self = this, menu = self.get("menu");
    if(v) {
      menu.hide()
    }else {
      var el = self.$el;
      if(!menu.get("visible")) {
        var align = {node:el, points:["bl", "tl"], overflow:{adjustX:1, adjustY:1}};
        S.mix(menu.get("align"), align, false);
        if(self.get("matchElWidth")) {
          menu.render();
          var menuEl = menu.get("el");
          var borderWidth = (parseInt(menuEl.css("borderLeftWidth")) || 0) + (parseInt(menuEl.css("borderRightWidth")) || 0);
          menu.set("width", menu.get("align").node[0].offsetWidth - borderWidth)
        }
        menu.show();
        el.attr("aria-haspopup", menu.get("el").attr("id"))
      }
    }
  }, bindUI:function() {
    var self = this;
    self.on("afterHighlightedItemChange", onMenuAfterHighlightedItemChange, self);
    self.on("click", onMenuItemClick, self)
  }, handleKeyDownInternal:function(e) {
    var self = this, keyCode = e.keyCode, type = String(e.type), menu = self.get("menu");
    if(keyCode === KeyCode.SPACE) {
      e.preventDefault();
      if(type !== "keyup") {
        return undefined
      }
    }else {
      if(type !== "keydown") {
        return undefined
      }
    }
    if(menu.get("rendered") && menu.get("visible")) {
      var handledByMenu = menu.handleKeyDownInternal(e);
      if(keyCode === KeyCode.ESC) {
        self.set("collapsed", true);
        return true
      }
      return handledByMenu
    }
    if(keyCode === KeyCode.SPACE || keyCode === KeyCode.DOWN || keyCode === KeyCode.UP) {
      self.set("collapsed", false);
      return true
    }
    return undefined
  }, handleClickInternal:function() {
    var self = this;
    self.set("collapsed", !self.get("collapsed"))
  }, handleBlurInternal:function(e) {
    var self = this;
    self.callSuper(e);
    self.set("collapsed", true)
  }, addItem:function(item, index) {
    var menu = this.get("menu");
    menu.addChild(item, index)
  }, removeItem:function(c, destroy) {
    var menu = this.get("menu");
    menu.removeChild(c, destroy)
  }, removeItems:function(destroy) {
    var menu = this.get("menu");
    if(menu) {
      if(menu.removeChildren) {
        menu.removeChildren(destroy)
      }else {
        if(menu.children) {
          menu.children = []
        }
      }
    }
  }, getItemAt:function(index) {
    var menu = this.get("menu");
    return menu.get("rendered") && menu.getChildAt(index)
  }, _onSetDisabled:function(v) {
    if(!v) {
      this.set("collapsed", true)
    }
  }, destructor:function() {
    this.get("menu").destroy()
  }}, {ATTRS:{matchElWidth:{value:true}, collapseOnClick:{value:false}, menu:{value:{}, getter:function(v) {
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
  }}, collapsed:{value:false, view:1}, xrender:{value:MenuButtonRender}}, xclass:"menu-button"});
  function onMenuItemClick(e) {
    if(e.target.isMenuItem && this.get("collapseOnClick")) {
      this.set("collapsed", true)
    }
  }
  function onMenuAfterHighlightedItemChange(e) {
    if(e.target.isMenu) {
      var el = this.el, menuItem = e.newVal;
      el.setAttribute("aria-activedescendant", menuItem && menuItem.el.id || "")
    }
  }
});
KISSY.add("menubutton/select", ["node", "./control"], function(S, require) {
  var Node = require("node");
  var MenuButton = require("./control");
  function getSelectedItem(self) {
    var menu = self.get("menu"), cs = menu.children || menu.get && menu.get("children") || [], value = self.get("value"), c, i;
    for(i = 0;i < cs.length;i++) {
      c = cs[i];
      if(getItemValue(c) === value) {
        return c
      }
    }
    return null
  }
  function getItemValue(c) {
    var v;
    if(c) {
      if(c.get) {
        if((v = c.get("value")) === undefined) {
          v = c.get("textContent") || c.get("content")
        }
      }else {
        if((v = c.value) === undefined) {
          v = c.textContent || c.content
        }
      }
    }
    return v
  }
  function deSelectAllExcept(self) {
    var menu = self.get("menu"), value = self.get("value"), cs = menu && menu.get && menu.get("children");
    S.each(cs, function(c) {
      if(c && c.set) {
        c.set("selected", getItemValue(c) === value)
      }
    })
  }
  function _handleMenuShow(e) {
    var self = this, selectedItem = getSelectedItem(self), m = self.get("menu");
    if(e.target === m) {
      var item = selectedItem || m.getChildAt(0);
      if(item) {
        item.set("highlighted", true)
      }
      if(selectedItem) {
        selectedItem.set("selected", true)
      }
    }
  }
  function _updateCaption(self) {
    var item = getSelectedItem(self), textContent = item && (item.textContent || item.get && item.get("textContent")), content = item && (item.content || item.get && item.get("content"));
    self.set("content", textContent || content || self.get("defaultCaption"))
  }
  function handleMenuClick(e) {
    var self = this, target = e.target;
    if(target.isMenuItem) {
      var newValue = getItemValue(target), oldValue = self.get("value");
      self.set("value", newValue);
      if(newValue !== oldValue) {
        self.fire("change", {prevVal:oldValue, newVal:newValue})
      }
    }
  }
  var Select = MenuButton.extend({bindUI:function() {
    this.on("click", handleMenuClick, this);
    this.on("show", _handleMenuShow, this)
  }, removeItems:function() {
    var self = this;
    self.callSuper.apply(self, arguments);
    self.set("value", null)
  }, removeItem:function(c, destroy) {
    var self = this;
    self.callSuper(c, destroy);
    if(c.get("value") === self.get("value")) {
      self.set("value", null)
    }
  }, _onSetValue:function() {
    var self = this;
    deSelectAllExcept(self);
    _updateCaption(self)
  }, _onSetDefaultCaption:function() {
    _updateCaption(this)
  }}, {ATTRS:{value:{}, defaultCaption:{value:""}, collapseOnClick:{value:true}}, decorate:function(element, cfg) {
    element = S.one(element);
    cfg = cfg || {};
    cfg.elBefore = element;
    var name, allItems = [], select, selectedItem = null, curValue = element.val(), options = element.all("option");
    options.each(function(option) {
      var item = {xclass:"option", content:option.text(), elCls:option.attr("class"), value:option.val()};
      if(curValue === option.val()) {
        selectedItem = {content:item.content, value:item.value}
      }
      allItems.push(item)
    });
    cfg.menu = cfg.menu || cfg.menuCfg || {};
    cfg.menu.children = allItems;
    delete cfg.menuCfg;
    select = (new Select(S.mix(cfg, selectedItem))).render();
    if(name = element.attr("name")) {
      var input = (new Node("<input" + ' type="hidden"' + ' name="' + name + '" value="' + curValue + '">')).insertBefore(element, undefined);
      select.on("afterValueChange", function(e) {
        input.val(e.newVal || "")
      })
    }
    element.remove();
    return select
  }, xclass:"select"});
  return Select
});
KISSY.add("menubutton/option", ["menu"], function(S, require) {
  var Menu = require("menu");
  var MenuItem = Menu.Item;
  return MenuItem.extend({}, {ATTRS:{selectable:{value:true}, textContent:{}}, xclass:"option"})
});
KISSY.add("menubutton", ["menubutton/control", "menubutton/select", "menubutton/option"], function(S, require) {
  var MenuButton = require("menubutton/control");
  var Select = require("menubutton/select");
  var Option = require("menubutton/option");
  MenuButton.Select = Select;
  MenuButton.Option = Option;
  return MenuButton
});

