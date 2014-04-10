/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:35
*/
/*
 Combined modules by KISSY Module Compiler: 

 combobox/combobox-xtpl
 combobox/control
 combobox/local-data-source
 combobox/remote-data-source
 combobox
*/

KISSY.add("combobox/combobox-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("invalid-el");
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
    params4.push("invalid-inner");
    option3.params = params4;
    var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
    if(commandRet5 && commandRet5.isBuffer) {
      buffer = commandRet5;
      commandRet5 = undefined
    }
    buffer.write(commandRet5, true);
    buffer.write('"></div>\n</div>\n\n');
    var option6 = {escape:1};
    var params7 = [];
    var id8 = scope.resolve(["hasTrigger"]);
    params7.push(id8);
    option6.params = params7;
    option6.fn = function(scope, buffer) {
      buffer.write('\n<div class="');
      var option9 = {escape:1};
      var params10 = [];
      params10.push("trigger");
      option9.params = params10;
      var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 6);
      if(commandRet11 && commandRet11.isBuffer) {
        buffer = commandRet11;
        commandRet11 = undefined
      }
      buffer.write(commandRet11, true);
      buffer.write('">\n    <div class="');
      var option12 = {escape:1};
      var params13 = [];
      params13.push("trigger-inner");
      option12.params = params13;
      var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 7);
      if(commandRet14 && commandRet14.isBuffer) {
        buffer = commandRet14;
        commandRet14 = undefined
      }
      buffer.write(commandRet14, true);
      buffer.write('">&#x25BC;</div>\n</div>\n');
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option6, buffer, 5, payload);
    buffer.write('\n\n<div class="');
    var option15 = {escape:1};
    var params16 = [];
    params16.push("input-wrap");
    option15.params = params16;
    var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 11);
    if(commandRet17 && commandRet17.isBuffer) {
      buffer = commandRet17;
      commandRet17 = undefined
    }
    buffer.write(commandRet17, true);
    buffer.write('">\n\n    <input id="ks-combobox-input-');
    var id18 = scope.resolve(["id"]);
    buffer.write(id18, true);
    buffer.write('"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ');
    var option19 = {escape:1};
    var params20 = [];
    var id21 = scope.resolve(["disabled"]);
    params20.push(id21);
    option19.params = params20;
    option19.fn = function(scope, buffer) {
      buffer.write("\n    disabled\n    ");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option19, buffer, 20, payload);
    buffer.write('\n\n    autocomplete="off"\n    class="');
    var option22 = {escape:1};
    var params23 = [];
    params23.push("input");
    option22.params = params23;
    var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 25);
    if(commandRet24 && commandRet24.isBuffer) {
      buffer = commandRet24;
      commandRet24 = undefined
    }
    buffer.write(commandRet24, true);
    buffer.write('"\n\n    value="');
    var id25 = scope.resolve(["value"]);
    buffer.write(id25, true);
    buffer.write('"\n    />\n\n\n    <label for="ks-combobox-input-');
    var id26 = scope.resolve(["id"]);
    buffer.write(id26, true);
    buffer.write("\"\n            style='display:");
    var option27 = {escape:1};
    var params28 = [];
    var id29 = scope.resolve(["value"]);
    params28.push(id29);
    option27.params = params28;
    option27.fn = function(scope, buffer) {
      buffer.write("none");
      return buffer
    };
    option27.inverse = function(scope, buffer) {
      buffer.write("block");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option27, buffer, 32, payload);
    buffer.write(";'\n    class=\"");
    var option30 = {escape:1};
    var params31 = [];
    params31.push("placeholder");
    option30.params = params31;
    var commandRet32 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 33);
    if(commandRet32 && commandRet32.isBuffer) {
      buffer = commandRet32;
      commandRet32 = undefined
    }
    buffer.write(commandRet32, true);
    buffer.write('">\n    ');
    var id33 = scope.resolve(["placeholder"]);
    buffer.write(id33, true);
    buffer.write("\n    </label>\n</div>\n");
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("combobox/control", ["node", "component/control", "./combobox-xtpl", "menu"], function(S, require) {
  var Node = require("node");
  var Control = require("component/control");
  var ComboboxTpl = require("./combobox-xtpl");
  require("menu");
  var ComboBox, KeyCode = Node.KeyCode;
  ComboBox = Control.extend({initializer:function() {
    this.publish("afterRenderData", {bubbles:false})
  }, _savedValue:null, bindUI:function() {
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
    var self = this;
    self.get("menu").destroy();
    self.$el.getWindow().detach("resize", onWindowResize, self)
  }, normalizeData:function(data) {
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
    clearDismissTimer(self);
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
  }, getKeyEventTarget:function() {
    return this.get("input")
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
    this.get("input").attr("aria-expanded", !v)
  }, _onSetDisabled:function(v, e) {
    this.callSuper(v, e);
    this.get("input").attr("disabled", v)
  }}, {ATTRS:{contentTpl:{value:ComboboxTpl}, input:{selector:function() {
    return"." + this.getBaseCssClass("input")
  }}, value:{value:"", sync:0, render:1, parse:function() {
    return this.get("input").val()
  }}, trigger:{selector:function() {
    return"." + this.getBaseCssClass("trigger")
  }}, placeholder:{render:1, sync:0, parse:function() {
    var placeHolder = this.get("placeholderEl");
    return placeHolder && placeHolder.html()
  }}, placeholderEl:{selector:function() {
    return"." + this.getBaseCssClass("placeholder")
  }}, validator:{}, invalidEl:{selector:function() {
    return"." + this.getBaseCssClass("invalid-el")
  }}, allowTextSelection:{value:true}, hasTrigger:{value:true, sync:0, render:1}, menu:{value:{}, getter:function(v) {
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
  }}, collapsed:{render:1, sync:0, value:true}, dataSource:{}, maxItemCount:{value:99999}, matchElWidth:{value:true}, format:{}, updateInputOnDownUp:{value:true}, autoHighlightFirst:{}, highlightMatchItem:{value:true}}, xclass:"combobox"});
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
      contentEl.on("mousedown", onMenuMouseDown, self);
      if(self.get("matchElWidth")) {
        el.getWindow().on("resize", onWindowResize, self)
      }
    }
  }
  function onWindowResize() {
    var self = this;
    var menu = self.get("menu");
    if(menu.get("visible")) {
      var el = self.get("el");
      var menuEl = menu.get("el");
      var borderWidth = (parseInt(menuEl.css("borderLeftWidth"), 10) || 0) + (parseInt(menuEl.css("borderRightWidth"), 10) || 0);
      menu.set("width", el[0].offsetWidth - borderWidth)
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
    var $el = self.$el, cls = self.getBaseCssClasses("invalid"), invalidEl = self.get("invalidEl");
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

