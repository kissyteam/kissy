/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 18:00
*/
/*
 Combined modules by KISSY Module Compiler: 

 filter-menu/render-xtpl
 filter-menu/render
 filter-menu
*/

KISSY.add("filter-menu/render-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += '<div id="ks-filter-menu-input-wrap-';
    var id0 = scope.resolve(["id"]);
    buffer += escapeHtml(id0);
    buffer += '"\n     class="';
    var option2 = {};
    var params3 = [];
    params3.push("input-wrap");
    option2.params = params3;
    var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
    buffer += escapeHtml(id1);
    buffer += '">\n    <div id="ks-filter-menu-placeholder-';
    var id4 = scope.resolve(["id"]);
    buffer += escapeHtml(id4);
    buffer += '"\n         class="';
    var option6 = {};
    var params7 = [];
    params7.push("placeholder");
    option6.params = params7;
    var id5 = callCommandUtil(engine, scope, option6, "getBaseCssClasses", 4);
    buffer += escapeHtml(id5);
    buffer += '">\n        ';
    var id8 = scope.resolve(["placeholder"]);
    buffer += escapeHtml(id8);
    buffer += '\n    </div>\n    <input id="ks-filter-menu-input-';
    var id9 = scope.resolve(["id"]);
    buffer += escapeHtml(id9);
    buffer += '"\n           class="';
    var option11 = {};
    var params12 = [];
    params12.push("input");
    option11.params = params12;
    var id10 = callCommandUtil(engine, scope, option11, "getBaseCssClasses", 8);
    buffer += escapeHtml(id10);
    buffer += '"\n            autocomplete="off"/>\n</div>\n';
    var option14 = {};
    var params15 = [];
    params15.push("component/extension/content-xtpl");
    option14.params = params15;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      option14.params[0] = moduleWrap.resolveByName(option14.params[0])
    }
    var id13 = includeCommand.call(engine, scope, option14, payload);
    if(id13 || id13 === 0) {
      buffer += id13
    }
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("filter-menu/render", ["menu", "./render-xtpl", "component/extension/content-render"], function(S, require) {
  var Menu = require("menu");
  var FilterMenuTpl = require("./render-xtpl");
  var ContentRenderExtension = require("component/extension/content-render");
  return Menu.getDefaultRender().extend([ContentRenderExtension], {beforeCreateDom:function(renderData, childrenElSelectors) {
    S.mix(childrenElSelectors, {placeholderEl:"#ks-filter-menu-placeholder-{id}", filterInputWrap:"#ks-filter-menu-input-wrap-{id}", filterInput:"#ks-filter-menu-input-{id}"})
  }, getKeyEventTarget:function() {
    return this.control.get("filterInput")
  }, _onSetPlaceholder:function(v) {
    this.control.get("placeholderEl").html(v)
  }}, {ATTRS:{contentTpl:{value:FilterMenuTpl}}, HTML_PARSER:{placeholderEl:function(el) {
    return el.one("." + this.getBaseCssClass("placeholder"))
  }, filterInputWrap:function(el) {
    return el.one("." + this.getBaseCssClass("input-wrap"))
  }, filterInput:function(el) {
    return el.one("." + this.getBaseCssClass("input"))
  }}})
});
KISSY.add("filter-menu", ["menu", "filter-menu/render"], function(S, require) {
  var Menu = require("menu");
  var FilterMenuRender = require("filter-menu/render");
  var HIT_CLS = "menuitem-hit";
  return Menu.extend({bindUI:function() {
    var self = this, filterInput = self.get("filterInput");
    filterInput.on("input", self.handleFilterEvent, self)
  }, handleMouseEnterInternal:function(e) {
    var self = this;
    self.callSuper(e);
    self.view.getKeyEventTarget()[0].select()
  }, handleFilterEvent:function() {
    var self = this, str, filterInput = self.get("filterInput"), highlightedItem = self.get("highlightedItem");
    self.set("filterStr", filterInput.val());
    str = filterInput.val();
    if(self.get("allowMultiple")) {
      str = str.replace(/^.+,/, "")
    }
    if(!str && highlightedItem) {
      highlightedItem.set("highlighted", false)
    }else {
      if(str && (!highlightedItem || !highlightedItem.get("visible"))) {
        highlightedItem = self._getNextEnabledHighlighted(0, 1);
        if(highlightedItem) {
          highlightedItem.set("highlighted", true)
        }
      }
    }
  }, _onSetFilterStr:function(v) {
    this.filterItems(v)
  }, filterItems:function(str) {
    var self = this, prefixCls = self.get("prefixCls"), _placeholderEl = self.get("placeholderEl"), filterInput = self.get("filterInput");
    _placeholderEl[str ? "hide" : "show"]();
    if(self.get("allowMultiple")) {
      var enteredItems = [], lastWord;
      var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
      var items = [];
      if(match) {
        items = match[1].split(/[,\uff0c]/)
      }
      if(/[,\uff0c]$/.test(str)) {
        enteredItems = [];
        if(match) {
          enteredItems = items;
          lastWord = items[items.length - 1];
          var item = self.get("highlightedItem"), content = item && item.get("content");
          if(content && content.indexOf(lastWord) > -1 && lastWord) {
            enteredItems[enteredItems.length - 1] = content
          }
          filterInput.val(enteredItems.join(",") + ",")
        }
        str = ""
      }else {
        if(match) {
          str = match[2] || ""
        }
        enteredItems = items
      }
      var oldEnteredItems = self.get("enteredItems");
      if(oldEnteredItems.length !== enteredItems.length) {
        self.set("enteredItems", enteredItems)
      }
    }
    var children = self.get("children"), strExp = str && new RegExp(S.escapeRegExp(str), "ig");
    S.each(children, function(c) {
      var content = c.get("content");
      if(!str) {
        c.get("el").html(content);
        c.set("visible", true)
      }else {
        if(content.indexOf(str) > -1) {
          c.set("visible", true);
          c.get("el").html(content.replace(strExp, function(m) {
            return'<span class="' + prefixCls + HIT_CLS + '">' + m + "<" + "/span>"
          }))
        }else {
          c.set("visible", false)
        }
      }
    })
  }, reset:function() {
    var self = this;
    self.set("filterStr", "");
    self.set("enteredItems", []);
    self.get("filterInput").val("")
  }}, {ATTRS:{allowTextSelection:{value:true}, placeholder:{view:1}, filterStr:{}, enteredItems:{value:[]}, allowMultiple:{value:false}, xrender:{value:FilterMenuRender}}, xclass:"filter-menu"})
});

