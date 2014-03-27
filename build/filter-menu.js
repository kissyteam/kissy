/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 27 21:58
*/
/*
 Combined modules by KISSY Module Compiler: 

 filter-menu/render-xtpl
 filter-menu/render
 filter-menu
*/

KISSY.add("filter-menu/render-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  var t = function(scope, S, buffer, payload, undefined) {
    var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("1.50" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div id="ks-filter-menu-input-wrap-');
    var id0 = scope.resolve(["id"]);
    buffer.write(id0, true);
    buffer.write('"\n     class="');
    var option1 = {escape:1};
    var params2 = [];
    params2.push("input-wrap");
    option1.params = params2;
    var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
    if(commandRet3 && commandRet3.isBuffer) {
      buffer = commandRet3;
      commandRet3 = undefined
    }
    buffer.write(commandRet3, true);
    buffer.write('">\n    <div id="ks-filter-menu-placeholder-');
    var id4 = scope.resolve(["id"]);
    buffer.write(id4, true);
    buffer.write('"\n         class="');
    var option5 = {escape:1};
    var params6 = [];
    params6.push("placeholder");
    option5.params = params6;
    var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
    if(commandRet7 && commandRet7.isBuffer) {
      buffer = commandRet7;
      commandRet7 = undefined
    }
    buffer.write(commandRet7, true);
    buffer.write('">\n        ');
    var id8 = scope.resolve(["placeholder"]);
    buffer.write(id8, true);
    buffer.write('\n    </div>\n    <input id="ks-filter-menu-input-');
    var id9 = scope.resolve(["id"]);
    buffer.write(id9, true);
    buffer.write('"\n           class="');
    var option10 = {escape:1};
    var params11 = [];
    params11.push("input");
    option10.params = params11;
    var commandRet12 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 8);
    if(commandRet12 && commandRet12.isBuffer) {
      buffer = commandRet12;
      commandRet12 = undefined
    }
    buffer.write(commandRet12, true);
    buffer.write('"\n            autocomplete="off"/>\n</div>\n');
    var option13 = {};
    var params14 = [];
    params14.push("component/extension/content-xtpl");
    option13.params = params14;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      option13.params[0] = moduleWrap.resolve(option13.params[0])
    }
    var commandRet15 = includeCommand.call(engine, scope, option13, buffer, 11, payload);
    if(commandRet15 && commandRet15.isBuffer) {
      buffer = commandRet15;
      commandRet15 = undefined
    }
    buffer.write(commandRet15, false);
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

