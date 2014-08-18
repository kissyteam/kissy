/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 filter-menu/render-xtpl
 filter-menu/render
 filter-menu
*/

KISSY.add("filter-menu/render-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div id="ks-filter-menu-input-wrap-';
    var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '"\n     class="';
    var config2 = {};
    var params3 = [];
    params3.push("input-wrap");
    config2.params = params3;
    var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id1, true);
    buffer += '">\n    <div id="ks-filter-menu-placeholder-';
    var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
    buffer += renderOutputUtil(id4, true);
    buffer += '"\n         class="';
    var config6 = {};
    var params7 = [];
    params7.push("placeholder");
    config6.params = params7;
    var id5 = runInlineCommandUtil(engine, scope, config6, "getBaseCssClasses", 4);
    buffer += renderOutputUtil(id5, true);
    buffer += '">\n        ';
    var id8 = getPropertyOrRunCommandUtil(engine, scope, {}, "placeholder", 0, 5);
    buffer += renderOutputUtil(id8, true);
    buffer += '\n    </div>\n    <input id="ks-filter-menu-input-';
    var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
    buffer += renderOutputUtil(id9, true);
    buffer += '"\n           class="';
    var config11 = {};
    var params12 = [];
    params12.push("input");
    config11.params = params12;
    var id10 = runInlineCommandUtil(engine, scope, config11, "getBaseCssClasses", 8);
    buffer += renderOutputUtil(id10, true);
    buffer += '"\n            autocomplete="off"/>\n</div>\n';
    var config14 = {};
    var params15 = [];
    params15.push("component/extension/content-xtpl");
    config14.params = params15;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      config14.params[0] = moduleWrap.resolveByName(config14.params[0])
    }
    var id13 = runInlineCommandUtil(engine, scope, config14, "include", 11);
    buffer += renderOutputUtil(id13, false);
    return buffer
  }
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
    filterInput.on("valuechange", self.handleFilterEvent, self)
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

