/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:47
*/
/*
 Combined modules by KISSY Module Compiler: 

 filter-menu/render-xtpl
 filter-menu
*/

KISSY.add("filter-menu/render-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("input-wrap");
    option0.params = params1;
    var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write('">\n    <div class="');
    var option3 = {escape:1};
    var params4 = [];
    params4.push("placeholder");
    option3.params = params4;
    var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
    if(commandRet5 && commandRet5.isBuffer) {
      buffer = commandRet5;
      commandRet5 = undefined
    }
    buffer.write(commandRet5, true);
    buffer.write('">\n        ');
    var id6 = scope.resolve(["placeholder"]);
    buffer.write(id6, true);
    buffer.write('\n    </div>\n    <input class="');
    var option7 = {escape:1};
    var params8 = [];
    params8.push("input");
    option7.params = params8;
    var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 5);
    if(commandRet9 && commandRet9.isBuffer) {
      buffer = commandRet9;
      commandRet9 = undefined
    }
    buffer.write(commandRet9, true);
    buffer.write('"\n            autocomplete="off"/>\n</div>\n');
    var option10 = {};
    var params11 = [];
    params11.push("component/extension/content-xtpl");
    option10.params = params11;
    require("component/extension/content-xtpl");
    option10.params[0] = module.resolve(option10.params[0]);
    var commandRet12 = includeCommand.call(engine, scope, option10, buffer, 8, payload);
    if(commandRet12 && commandRet12.isBuffer) {
      buffer = commandRet12;
      commandRet12 = undefined
    }
    buffer.write(commandRet12, false);
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("filter-menu", ["menu", "./filter-menu/render-xtpl", "component/extension/content-box"], function(S, require) {
  var Menu = require("menu");
  var FilterMenuTpl = require("./filter-menu/render-xtpl");
  var HIT_CLS = "menuitem-hit";
  var ContentBox = require("component/extension/content-box");
  return Menu.extend([ContentBox], {bindUI:function() {
    var self = this, filterInput = self.get("filterInput");
    filterInput.on("input", self.handleFilterEvent, self)
  }, handleMouseEnterInternal:function(e) {
    var self = this;
    self.callSuper(e);
    self.getKeyEventTarget()[0].select()
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
  }, _onSetPlaceholder:function(v) {
    this.get("placeholderEl").html(v)
  }, getKeyEventTarget:function() {
    return this.get("filterInput")
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
  }}, {ATTRS:{allowTextSelection:{value:true}, filterInput:{selector:function() {
    return"." + this.getBaseCssClass("input")
  }}, filterInputWrap:{selector:function() {
    return"." + this.getBaseCssClass("input-wrap")
  }}, placeholder:{render:1, sync:0, parse:function() {
    var placeholderEl = this.get("placeholderEl");
    return placeholderEl && placeholderEl.html()
  }}, placeholderEl:{selector:function() {
    return"." + this.getBaseCssClass("placeholder")
  }}, filterStr:{}, enteredItems:{value:[]}, allowMultiple:{value:false}, contentTpl:{value:FilterMenuTpl}}, xclass:"filter-menu"})
});

