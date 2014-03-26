/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 26 16:51
*/
/*
 Combined modules by KISSY Module Compiler: 

 combobox/combobox-xtpl
 combobox/render
 combobox/control
 combobox/local-data-source
 combobox/remote-data-source
 combobox
*/

KISSY.add("combobox/combobox-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, buffer, payload, undefined) {
    var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("1.50" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div id="ks-combobox-invalid-el-');
    var id0 = scope.resolve(["id"]);
    buffer.write(id0, true);
    buffer.write('"\n     class="');
    var option1 = {escape:1};
    var params2 = [];
    params2.push("invalid-el");
    option1.params = params2;
    var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
    if(commandRet3 && commandRet3.isBuffer) {
      buffer = commandRet3;
      commandRet3 = undefined
    }
    buffer.write(commandRet3, true);
    buffer.write('">\n    <div class="');
    var option4 = {escape:1};
    var params5 = [];
    params5.push("invalid-inner");
    option4.params = params5;
    var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
    if(commandRet6 && commandRet6.isBuffer) {
      buffer = commandRet6;
      commandRet6 = undefined
    }
    buffer.write(commandRet6, true);
    buffer.write('"></div>\n</div>\n\n');
    var option7 = {escape:1};
    var params8 = [];
    var id9 = scope.resolve(["hasTrigger"]);
    params8.push(id9);
    option7.params = params8;
    option7.fn = function(scope, buffer) {
      buffer.write('\n<div id="ks-combobox-trigger-');
      var id10 = scope.resolve(["id"]);
      buffer.write(id10, true);
      buffer.write('"\n     class="');
      var option11 = {escape:1};
      var params12 = [];
      params12.push("trigger");
      option11.params = params12;
      var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 8);
      if(commandRet13 && commandRet13.isBuffer) {
        buffer = commandRet13;
        commandRet13 = undefined
      }
      buffer.write(commandRet13, true);
      buffer.write('">\n    <div class="');
      var option14 = {escape:1};
      var params15 = [];
      params15.push("trigger-inner");
      option14.params = params15;
      var commandRet16 = callCommandUtil(engine, scope, option14, buffer, "getBaseCssClasses", 9);
      if(commandRet16 && commandRet16.isBuffer) {
        buffer = commandRet16;
        commandRet16 = undefined
      }
      buffer.write(commandRet16, true);
      buffer.write('">&#x25BC;</div>\n</div>\n');
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option7, buffer, 6, payload);
    buffer.write('\n\n<div class="');
    var option17 = {escape:1};
    var params18 = [];
    params18.push("input-wrap");
    option17.params = params18;
    var commandRet19 = callCommandUtil(engine, scope, option17, buffer, "getBaseCssClasses", 13);
    if(commandRet19 && commandRet19.isBuffer) {
      buffer = commandRet19;
      commandRet19 = undefined
    }
    buffer.write(commandRet19, true);
    buffer.write('">\n\n    <input id="ks-combobox-input-');
    var id20 = scope.resolve(["id"]);
    buffer.write(id20, true);
    buffer.write('"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ');
    var option21 = {escape:1};
    var params22 = [];
    var id23 = scope.resolve(["disabled"]);
    params22.push(id23);
    option21.params = params22;
    option21.fn = function(scope, buffer) {
      buffer.write("\n    disabled\n    ");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option21, buffer, 22, payload);
    buffer.write('\n\n    autocomplete="off"\n    class="');
    var option24 = {escape:1};
    var params25 = [];
    params25.push("input");
    option24.params = params25;
    var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 27);
    if(commandRet26 && commandRet26.isBuffer) {
      buffer = commandRet26;
      commandRet26 = undefined
    }
    buffer.write(commandRet26, true);
    buffer.write('"\n\n    value="');
    var id27 = scope.resolve(["value"]);
    buffer.write(id27, true);
    buffer.write('"\n    />\n\n\n    <label id="ks-combobox-placeholder-');
    var id28 = scope.resolve(["id"]);
    buffer.write(id28, true);
    buffer.write('"\n           for="ks-combobox-input-');
    var id29 = scope.resolve(["id"]);
    buffer.write(id29, true);
    buffer.write("\"\n            style='display:");
    var option30 = {escape:1};
    var params31 = [];
    var id32 = scope.resolve(["value"]);
    params31.push(id32);
    option30.params = params31;
    option30.fn = function(scope, buffer) {
      buffer.write("none");
      return buffer
    };
    option30.inverse = function(scope, buffer) {
      buffer.write("block");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option30, buffer, 35, payload);
    buffer.write(";'\n    class=\"");
    var option33 = {escape:1};
    var params34 = [];
    params34.push("placeholder");
    option33.params = params34;
    var commandRet35 = callCommandUtil(engine, scope, option33, buffer, "getBaseCssClasses", 36);
    if(commandRet35 && commandRet35.isBuffer) {
      buffer = commandRet35;
      commandRet35 = undefined
    }
    buffer.write(commandRet35, true);
    buffer.write('">\n    ');
    var id36 = scope.resolve(["placeholder"]);
    buffer.write(id36, true);
    buffer.write("\n    </label>\n</div>\n");
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("combobox/render", ["component/control", "./combobox-xtpl"], function(S, require) {
  var Control = require("component/control");
  var ComboboxTpl = require("./combobox-xtpl");
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData, childrenElSelectors) {
    S.mix(childrenElSelectors, {input:"#ks-combobox-input-{id}", trigger:"#ks-combobox-trigger-{id}", invalidEl:"#ks-combobox-invalid-el-{id}", placeholderEl:"#ks-combobox-placeholder-{id}"})
  }, getKeyEventTarget:function() {
    return this.control.get("input")
  }, _onSetCollapsed:function(v) {
    this.control.get("input").attr("aria-expanded", !v)
  }, _onSetDisabled:function(v, e) {
    this.callSuper(v, e);
    this.control.get("input").attr("disabled", v)
  }}, {ATTRS:{contentTpl:{value:ComboboxTpl}}, HTML_PARSER:{value:function(el) {
    return el.one("." + this.getBaseCssClass("input")).val()
  }, input:function(el) {
    return el.one("." + this.getBaseCssClass("input"))
  }, trigger:function(el) {
    return el.one("." + this.getBaseCssClass("trigger"))
  }, invalidEl:function(el) {
    return el.one("." + this.getBaseCssClass("invalid-el"))
  }, placeholderEl:function(el) {
    return el.one("." + this.getBaseCssClass("placeholder"))
  }}})
});
KISSY.add("combobox/control", ["node", "component/control", "./render", "menu"], function(S, require) {
  var Node = require("node");
  var Control = require("component/control");
  var ComboBoxRender = require("./render");
  require("menu");
  var ComboBox, KeyCode = Node.KeyCode;
  ComboBox = Control.extend([], {initializer:function() {
    this.publish("afterRenderData", {bubbles:false})
  }, _savedValue:null, normalizeData:function(data) {
    var self = this, contents, v, i, c;
    if(data && data.length) {
      data = data.slice(0, self.get("maxItemCount"));
      if(self.get("format")) {
        contents = self.get("format").call(self, self.getCurrentValue(), data)
      }else {
        contents = []
      }
      for(i = 0;i < data.length;i++) {
        v = data[i];
        c = contents[i] = S.mix({content:v, textContent:v, value:v}, contents[i])
      }
      return contents
    }
    return contents
  }, bindUI:function() {
    var self = this, input = self.get("input");
    input.on("input", onValueChange, self);
    self.on("click", onMenuItemClick, self);
    var menu = self.get("menu");
    if(menu.get("rendered")) {
      onMenuAfterRenderUI.call(self)
    }else {
      menu.on("afterRenderUI", onMenuAfterRenderUI, self)
    }
  }, destructor:function() {
    this.get("menu").destroy()
  }, getCurrentValue:function() {
    return this.get("value")
  }, setCurrentValue:function(value, setCfg) {
    this.set("value", value, setCfg)
  }, _onSetValue:function(v, e) {
    var self = this, value;
    if(e.causedByInputEvent) {
      value = self.getCurrentValue();
      if(value === undefined) {
        self.set("collapsed", true);
        return
      }
      self._savedValue = value;
      self.sendRequest(value)
    }else {
      self.get("input").val(v)
    }
  }, handleFocusInternal:function() {
    var self = this, placeholderEl;
    if(self.get("invalidEl")) {
      setInvalid(self, false)
    }
    if(placeholderEl = self.get("placeholderEl")) {
      placeholderEl.hide()
    }
  }, handleBlurInternal:function(e) {
    var self = this, placeholderEl = self.get("placeholderEl");
    self.callSuper(e);
    delayHide(self);
    if(self.get("invalidEl")) {
      self.validate(function(error, val) {
        if(error) {
          if(!self.get("focused") && val === self.get("value")) {
            setInvalid(self, error)
          }
        }else {
          setInvalid(self, false)
        }
      })
    }
    if(placeholderEl && !self.get("value")) {
      placeholderEl.show()
    }
  }, handleMouseDownInternal:function(e) {
    var self = this, target, trigger;
    self.callSuper(e);
    target = e.target;
    trigger = self.get("trigger");
    if(trigger && (trigger[0] === target || trigger.contains(target))) {
      if(self.get("collapsed")) {
        self.focus();
        self.sendRequest("")
      }else {
        self.set("collapsed", true)
      }
      e.preventDefault()
    }
  }, handleKeyDownInternal:function(e) {
    var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get("menu");
    input = self.get("input");
    updateInputOnDownUp = self.get("updateInputOnDownUp");
    if(menu.get("visible")) {
      highlightedItem = menu.get("highlightedItem");
      if(updateInputOnDownUp && highlightedItem) {
        var menuChildren = menu.get("children");
        if(keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)) {
          self.setCurrentValue(self._savedValue);
          highlightedItem.set("highlighted", false);
          return true
        }
      }
      handledByMenu = menu.handleKeyDownInternal(e);
      highlightedItem = menu.get("highlightedItem");
      if(keyCode === KeyCode.ESC) {
        self.set("collapsed", true);
        if(updateInputOnDownUp) {
          self.setCurrentValue(self._savedValue)
        }
        return true
      }
      if(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])) {
        self.setCurrentValue(highlightedItem.get("textContent"))
      }
      if(keyCode === KeyCode.TAB && highlightedItem) {
        highlightedItem.handleClickInternal(e);
        if(self.get("multiple")) {
          return true
        }
      }
      return handledByMenu
    }else {
      if(keyCode === KeyCode.DOWN || keyCode === KeyCode.UP) {
        var v = self.getCurrentValue();
        if(v !== undefined) {
          self.sendRequest(v);
          return true
        }
      }
    }
    return undefined
  }, validate:function(callback) {
    var self = this, validator = self.get("validator"), val = self.getCurrentValue();
    if(validator) {
      validator(val, function(error) {
        callback(error, val)
      })
    }else {
      callback(false, val)
    }
  }, sendRequest:function(value) {
    var self = this, dataSource = self.get("dataSource");
    dataSource.fetchData(value, renderData, self)
  }, _onSetCollapsed:function(v) {
    var self = this, el = self.$el, menu = self.get("menu");
    if(v) {
      menu.hide()
    }else {
      clearDismissTimer(self);
      if(!menu.get("visible")) {
        if(self.get("matchElWidth")) {
          menu.render();
          var menuEl = menu.get("el");
          var borderWidth = (parseInt(menuEl.css("borderLeftWidth"), 10) || 0) + (parseInt(menuEl.css("borderRightWidth"), 10) || 0);
          menu.set("width", el[0].offsetWidth - borderWidth)
        }
        menu.show()
      }
    }
  }}, {ATTRS:{input:{}, value:{value:"", sync:0, view:1}, trigger:{}, placeholder:{view:1}, placeholderEl:{}, validator:{}, invalidEl:{}, allowTextSelection:{value:true}, hasTrigger:{value:true, view:1}, menu:{value:{}, getter:function(v) {
    if(!v.isControl) {
      v.xclass = v.xclass || "popupmenu";
      v = this.createComponent(v);
      this.setInternal("menu", v)
    }
    return v
  }, setter:function(m) {
    if(m.isControl) {
      m.setInternal("parent", this);
      var align = {node:this.$el, points:["bl", "tl"], overflow:{adjustX:1, adjustY:1}};
      S.mix(m.get("align"), align, false)
    }
  }}, collapsed:{view:1, value:true}, dataSource:{}, maxItemCount:{value:99999}, matchElWidth:{value:true}, format:{}, updateInputOnDownUp:{value:true}, autoHighlightFirst:{}, highlightMatchItem:{value:true}, xrender:{value:ComboBoxRender}}, xclass:"combobox"});
  function getFirstEnabledItem(children) {
    for(var i = 0;i < children.length;i++) {
      if(!children[i].get("disabled")) {
        return children[i]
      }
    }
    return null
  }
  function onMenuFocusout() {
    delayHide(this)
  }
  function onMenuFocusin() {
    var self = this;
    setTimeout(function() {
      clearDismissTimer(self)
    }, 0)
  }
  function onMenuMouseOver() {
    var self = this;
    self.focus();
    clearDismissTimer(self)
  }
  function onMenuMouseDown() {
    var self = this;
    self.setCurrentValue(self.getCurrentValue(), {force:1})
  }
  function onMenuAfterRenderUI(e) {
    var self = this, contentEl;
    var menu = self.get("menu");
    if(!e || menu === e.target) {
      var input = self.get("input");
      var el = menu.get("el");
      contentEl = menu.get("contentEl");
      input.attr("aria-owns", el.attr("id"));
      el.on("focusout", onMenuFocusout, self);
      el.on("focusin", onMenuFocusin, self);
      contentEl.on("mouseover", onMenuMouseOver, self);
      contentEl.on("mousedown", onMenuMouseDown, self)
    }
  }
  function onMenuItemClick(e) {
    var item = e.target, self = this, textContent;
    if(item.isMenuItem) {
      textContent = item.get("textContent");
      self.setCurrentValue(textContent);
      self._savedValue = textContent;
      self.set("collapsed", true)
    }
  }
  function setInvalid(self, error) {
    var $el = self.$el, cls = self.view.getBaseCssClasses("invalid"), invalidEl = self.get("invalidEl");
    if(error) {
      $el.addClass(cls);
      invalidEl.attr("title", error);
      invalidEl.show()
    }else {
      $el.removeClass(cls);
      invalidEl.hide()
    }
  }
  function delayHide(self) {
    if(self._focusoutDismissTimer) {
      return
    }
    self._focusoutDismissTimer = setTimeout(function() {
      if(self._focusoutDismissTimer) {
        self.set("collapsed", true)
      }
    }, 50)
  }
  function clearDismissTimer(self) {
    var t = self._focusoutDismissTimer;
    if(t) {
      clearTimeout(t);
      self._focusoutDismissTimer = null
    }
  }
  function onValueChange(e) {
    this.set("value", e.target.value, {data:{causedByInputEvent:1}})
  }
  function renderData(data) {
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get("menu");
    data = self.normalizeData(data);
    menu.removeChildren(true);
    if(highlightedItem = menu.get("highlightedItem")) {
      highlightedItem.set("highlighted", false)
    }
    if(data && data.length) {
      for(i = 0;i < data.length;i++) {
        v = data[i];
        menu.addChild(v)
      }
      children = menu.get("children");
      val = self.getCurrentValue();
      if(self.get("highlightMatchItem")) {
        for(i = 0;i < children.length;i++) {
          if(children[i].get("textContent") === val) {
            children[i].set("highlighted", true);
            matchVal = true;
            break
          }
        }
      }
      if(!matchVal && self.get("autoHighlightFirst")) {
        for(i = 0;i < children.length;i++) {
          if(!children[i].get("disabled")) {
            children[i].set("highlighted", true);
            break
          }
        }
      }
      self.set("collapsed", false);
      self.fire("afterRenderData")
    }else {
      self.set("collapsed", true)
    }
  }
  return ComboBox
});
KISSY.add("combobox/local-data-source", ["attribute"], function(S, require) {
  var Attribute = require("attribute");
  return Attribute.extend({fetchData:function(inputVal, callback, context) {
    var parse = this.get("parse"), data = this.get("data");
    data = parse(inputVal, data);
    callback.call(context, data)
  }}, {ATTRS:{data:{value:[]}, parse:{value:parser}}});
  function parser(inputVal, data) {
    var ret = [], count = 0;
    if(!inputVal) {
      return data
    }
    S.each(data, function(d) {
      if(d.indexOf(inputVal) !== -1) {
        ret.push(d)
      }
      count++
    });
    return ret
  }
});
KISSY.add("combobox/remote-data-source", ["io", "attribute"], function(S, require) {
  var IO = require("io");
  var Attribute = require("attribute");
  return Attribute.extend({fetchData:function(inputVal, callback, context) {
    var self = this, v, paramName = self.get("paramName"), parse = self.get("parse"), cache = self.get("cache"), allowEmpty = self.get("allowEmpty");
    self.caches = self.caches || {};
    if(self.io) {
      self.io.abort();
      self.io = null
    }
    if(!inputVal && allowEmpty !== true) {
      return callback.call(context, [])
    }
    if(cache) {
      if(v = self.caches[inputVal]) {
        return callback.call(context, v)
      }
    }
    var xhrCfg = self.get("xhrCfg");
    xhrCfg.data = xhrCfg.data || {};
    xhrCfg.data[paramName] = inputVal;
    xhrCfg.success = function(data) {
      if(parse) {
        data = parse(inputVal, data)
      }
      self.setInternal("data", data);
      if(cache) {
        self.caches[inputVal] = data
      }
      callback.call(context, data)
    };
    self.io = IO(xhrCfg);
    return undefined
  }}, {ATTRS:{paramName:{value:"q"}, allowEmpty:{}, cache:{}, parse:{}, xhrCfg:{value:{}}}})
});
KISSY.add("combobox", ["combobox/control", "combobox/local-data-source", "combobox/remote-data-source"], function(S, require) {
  var ComboBox = require("combobox/control");
  var LocalDataSource = require("combobox/local-data-source");
  var RemoteDataSource = require("combobox/remote-data-source");
  ComboBox.LocalDataSource = LocalDataSource;
  ComboBox.RemoteDataSource = RemoteDataSource;
  return ComboBox
});

