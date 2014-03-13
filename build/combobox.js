/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:47
*/
/*
 Combined modules by KISSY Module Compiler: 

 combobox/combobox-xtpl
 combobox/render
 combobox/control
 combobox/cursor
 combobox/multi-value-combobox
 combobox/filter-select
 combobox/local-data-source
 combobox/remote-data-source
 combobox
*/

KISSY.add("combobox/combobox-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += '<div id="ks-combobox-invalid-el-';
    var id0 = scope.resolve(["id"]);
    buffer += escapeHtml(id0);
    buffer += '"\n     class="';
    var option2 = {};
    var params3 = [];
    params3.push("invalid-el");
    option2.params = params3;
    var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
    buffer += escapeHtml(id1);
    buffer += '">\n    <div class="';
    var option5 = {};
    var params6 = [];
    params6.push("invalid-inner");
    option5.params = params6;
    var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
    buffer += escapeHtml(id4);
    buffer += '"></div>\n</div>\n\n';
    var option7 = {};
    var params8 = [];
    var id9 = scope.resolve(["hasTrigger"]);
    params8.push(id9);
    option7.params = params8;
    option7.fn = function(scope) {
      var buffer = "";
      buffer += '\n<div id="ks-combobox-trigger-';
      var id10 = scope.resolve(["id"]);
      buffer += escapeHtml(id10);
      buffer += '"\n     class="';
      var option12 = {};
      var params13 = [];
      params13.push("trigger");
      option12.params = params13;
      var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 8);
      buffer += escapeHtml(id11);
      buffer += '">\n    <div class="';
      var option15 = {};
      var params16 = [];
      params16.push("trigger-inner");
      option15.params = params16;
      var id14 = callCommandUtil(engine, scope, option15, "getBaseCssClasses", 9);
      buffer += escapeHtml(id14);
      buffer += '">&#x25BC;</div>\n</div>\n';
      return buffer
    };
    buffer += ifCommand.call(engine, scope, option7, payload);
    buffer += '\n\n<div class="';
    var option18 = {};
    var params19 = [];
    params19.push("input-wrap");
    option18.params = params19;
    var id17 = callCommandUtil(engine, scope, option18, "getBaseCssClasses", 13);
    buffer += escapeHtml(id17);
    buffer += '">\n\n    <input id="ks-combobox-input-';
    var id20 = scope.resolve(["id"]);
    buffer += escapeHtml(id20);
    buffer += '"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ';
    var option21 = {};
    var params22 = [];
    var id23 = scope.resolve(["disabled"]);
    params22.push(id23);
    option21.params = params22;
    option21.fn = function(scope) {
      var buffer = "";
      buffer += "\n    disabled\n    ";
      return buffer
    };
    buffer += ifCommand.call(engine, scope, option21, payload);
    buffer += '\n\n    autocomplete="off"\n    class="';
    var option25 = {};
    var params26 = [];
    params26.push("input");
    option25.params = params26;
    var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 27);
    buffer += escapeHtml(id24);
    buffer += '"\n\n    value="';
    var id27 = scope.resolve(["value"]);
    buffer += escapeHtml(id27);
    buffer += '"\n    />\n\n\n    <label id="ks-combobox-placeholder-';
    var id28 = scope.resolve(["id"]);
    buffer += escapeHtml(id28);
    buffer += '"\n           for="ks-combobox-input-';
    var id29 = scope.resolve(["id"]);
    buffer += escapeHtml(id29);
    buffer += "\"\n            style='display:";
    var option30 = {};
    var params31 = [];
    var id32 = scope.resolve(["value"]);
    params31.push(id32);
    option30.params = params31;
    option30.fn = function(scope) {
      var buffer = "";
      buffer += "none";
      return buffer
    };
    option30.inverse = function(scope) {
      var buffer = "";
      buffer += "block";
      return buffer
    };
    buffer += ifCommand.call(engine, scope, option30, payload);
    buffer += ";'\n    class=\"";
    var option34 = {};
    var params35 = [];
    params35.push("placeholder");
    option34.params = params35;
    var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 36);
    buffer += escapeHtml(id33);
    buffer += '">\n    ';
    var id36 = scope.resolve(["placeholder"]);
    buffer += escapeHtml(id36);
    buffer += "\n    </label>\n</div>\n";
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
        contents = self.get("format").call(self, self.getValueForAutocomplete(), data)
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
  }, getValueForAutocomplete:function() {
    return this.get("value")
  }, setValueFromAutocomplete:function(value, setCfg) {
    this.set("value", value, setCfg)
  }, _onSetValue:function(v, e) {
    var self = this, value;
    if(e.causedByInputEvent) {
      value = self.getValueForAutocomplete();
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
          self.setValueFromAutocomplete(self._savedValue);
          highlightedItem.set("highlighted", false);
          return true
        }
      }
      handledByMenu = menu.handleKeyDownInternal(e);
      highlightedItem = menu.get("highlightedItem");
      if(keyCode === KeyCode.ESC) {
        self.set("collapsed", true);
        if(updateInputOnDownUp) {
          self.setValueFromAutocomplete(self._savedValue)
        }
        return true
      }
      if(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])) {
        self.setValueFromAutocomplete(highlightedItem.get("textContent"))
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
        var v = self.getValueForAutocomplete();
        if(v !== undefined) {
          self.sendRequest(v);
          return true
        }
      }
    }
    return undefined
  }, validate:function(callback) {
    var self = this, validator = self.get("validator"), val = self.getValueForAutocomplete();
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
    var combobox = this;
    delayHide(combobox)
  }
  function onMenuFocusin() {
    var combobox = this;
    setTimeout(function() {
      clearDismissTimer(combobox)
    }, 0)
  }
  function onMenuMouseOver() {
    var combobox = this;
    combobox.focus();
    clearDismissTimer(combobox)
  }
  function onMenuMouseDown() {
    var combobox = this;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {force:1})
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
      self.setValueFromAutocomplete(textContent);
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
      val = self.getValueForAutocomplete();
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
KISSY.add("combobox/cursor", ["node"], function(S, require) {
  var Node = require("node");
  var $ = Node.all, FAKE_DIV_HTML = '<div style="' + "z-index:-9999;" + "overflow:hidden;" + "position: fixed;" + "left:-9999px;" + "top:-9999px;" + "opacity:0;" + "white-space:pre-wrap;" + "word-wrap:break-word;" + '"></div>', FAKE_DIV, MARKER = "<span>" + "x" + "</span>", STYLES = ["paddingLeft", "paddingTop", "paddingBottom", "paddingRight", "marginLeft", "marginTop", "marginBottom", "marginRight", "borderLeftStyle", "borderTopStyle", "borderBottomStyle", "borderRightStyle", "borderLeftWidth", 
  "borderTopWidth", "borderBottomWidth", "borderRightWidth", "line-height", "outline", "height", "fontFamily", "fontSize", "fontWeight", "fontVariant", "fontStyle"], supportInputScrollLeft, findSupportInputScrollLeft;
  function getFakeDiv(elem) {
    var fake = FAKE_DIV;
    if(!fake) {
      fake = $(FAKE_DIV_HTML)
    }
    if(String(elem[0].type.toLowerCase()) === "textarea") {
      fake.css("width", elem.css("width"))
    }else {
      fake.css("width", 9999)
    }
    S.each(STYLES, function(s) {
      fake.css(s, elem.css(s))
    });
    if(!FAKE_DIV) {
      fake.insertBefore(elem[0].ownerDocument.body.firstChild)
    }
    FAKE_DIV = fake;
    return fake
  }
  findSupportInputScrollLeft = function() {
    var doc = document, input = $("<input>");
    input.css({width:1, position:"absolute", left:-9999, top:-9999});
    input.val("123456789");
    input.appendTo(doc.body);
    input[0].focus();
    supportInputScrollLeft = input[0].scrollLeft > 0;
    input.remove();
    findSupportInputScrollLeft = S.noop
  };
  supportInputScrollLeft = false;
  return function(elem) {
    var $elem = $(elem);
    elem = $elem[0];
    var doc = elem.ownerDocument, $doc = $(doc), elemOffset, range, fake, selectionStart, offset, marker, elemScrollTop = elem.scrollTop, elemScrollLeft = elem.scrollLeft;
    if(doc.selection) {
      range = doc.selection.createRange();
      return{left:range.boundingLeft + elemScrollLeft + $doc.scrollLeft(), top:range.boundingTop + elemScrollTop + range.boundingHeight + $doc.scrollTop()}
    }
    elemOffset = $elem.offset();
    if(!supportInputScrollLeft && elem.type !== "textarea") {
      elemOffset.top += elem.offsetHeight;
      return elemOffset
    }
    fake = getFakeDiv($elem);
    selectionStart = elem.selectionStart;
    fake.html(S.escapeHtml(elem.value.substring(0, selectionStart - 1)) + MARKER);
    offset = elemOffset;
    fake.offset(offset);
    marker = fake.last();
    offset = marker.offset();
    offset.top += marker.height();
    if(selectionStart > 0) {
      offset.left += marker.width()
    }
    offset.top -= elemScrollTop;
    offset.left -= elemScrollLeft;
    return offset
  }
});
KISSY.add("combobox/multi-value-combobox", ["./cursor", "./control"], function(S, require) {
  var SUFFIX = "suffix", rWhitespace = /\s|\xa0/;
  var getCursor = require("./cursor");
  var ComboBox = require("./control");
  function strContainsChar(str, c) {
    return c && str.indexOf(c) !== -1
  }
  function beforeVisibleChange(e) {
    if(e.newVal && e.target === this.get("menu")) {
      this.alignWithCursor()
    }
  }
  return ComboBox.extend({syncUI:function() {
    var self = this, menu;
    if(self.get("alignWithCursor")) {
      menu = self.get("menu");
      menu.setInternal("align", null);
      menu.on("beforeVisibleChange", beforeVisibleChange, this)
    }
  }, getValueForAutocomplete:function() {
    var self = this, inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex, separator = self.get("separator"), separatorType = self.get("separatorType"), token = tokens[tokenIndex], l = token.length - 1;
    if(separatorType !== SUFFIX) {
      if(strContainsChar(separator, token.charAt(0))) {
        token = token.slice(1)
      }else {
        return undefined
      }
    }else {
      if(separatorType === SUFFIX && strContainsChar(separator, token.charAt(l))) {
        token = token.slice(0, l)
      }
    }
    return token
  }, setValueFromAutocomplete:function(value, setCfg) {
    var self = this, input = self.get("input"), inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = Math.max(0, inputDesc.tokenIndex), separator = self.get("separator"), cursorPosition, l, separatorType = self.get("separatorType"), nextToken = tokens[tokenIndex + 1] || "", token = tokens[tokenIndex];
    if(separatorType !== SUFFIX) {
      tokens[tokenIndex] = token.charAt(0) + value;
      if(value && !(nextToken && rWhitespace.test(nextToken.charAt(0)))) {
        tokens[tokenIndex] += " "
      }
    }else {
      tokens[tokenIndex] = value;
      l = token.length - 1;
      if(strContainsChar(separator, token.charAt(l))) {
        tokens[tokenIndex] += token.charAt(l)
      }else {
        if(separator.length === 1) {
          tokens[tokenIndex] += separator
        }
      }
    }
    cursorPosition = tokens.slice(0, tokenIndex + 1).join("").length;
    self.set("value", tokens.join(""), setCfg);
    input.prop("selectionStart", cursorPosition);
    input.prop("selectionEnd", cursorPosition)
  }, alignWithCursor:function() {
    var self = this;
    var menu = self.get("menu"), cursorOffset, input = self.get("input");
    cursorOffset = getCursor(input);
    menu.move(cursorOffset.left, cursorOffset.top)
  }}, {ATTRS:{separator:{value:",;"}, separatorType:{value:SUFFIX}, literal:{value:'"'}, alignWithCursor:{}}, xclass:"multi-value-combobox"});
  function getInputDesc(self) {
    var input = self.get("input"), inputVal = self.get("value"), tokens = [], cache = [], literal = self.get("literal"), separator = self.get("separator"), separatorType = self.get("separatorType"), inLiteral = false, allowWhitespaceAsStandaloneToken = separatorType !== SUFFIX, cursorPosition = input.prop("selectionStart"), i, c, tokenIndex = -1;
    for(i = 0;i < inputVal.length;i++) {
      c = inputVal.charAt(i);
      if(literal) {
        if(c === literal) {
          inLiteral = !inLiteral
        }
      }
      if(inLiteral) {
        cache.push(c);
        continue
      }
      if(i === cursorPosition) {
        tokenIndex = tokens.length
      }
      if(allowWhitespaceAsStandaloneToken && rWhitespace.test(c)) {
        if(cache.length) {
          tokens.push(cache.join(""))
        }
        cache = [];
        cache.push(c)
      }else {
        if(strContainsChar(separator, c)) {
          if(separatorType === SUFFIX) {
            cache.push(c);
            if(cache.length) {
              tokens.push(cache.join(""))
            }
            cache = []
          }else {
            if(cache.length) {
              tokens.push(cache.join(""))
            }
            cache = [];
            cache.push(c)
          }
        }else {
          cache.push(c)
        }
      }
    }
    if(cache.length) {
      tokens.push(cache.join(""))
    }
    if(!tokens.length) {
      tokens.push("")
    }
    if(tokenIndex === -1) {
      if(separatorType === SUFFIX && strContainsChar(separator, c)) {
        tokens.push("")
      }
      tokenIndex = tokens.length - 1
    }
    return{tokens:tokens, cursorPosition:cursorPosition, tokenIndex:tokenIndex}
  }
});
KISSY.add("combobox/filter-select", ["./control"], function(S, require, exports, module) {
  var Combobox = require("./control");
  function valInAutoCompleteList(inputVal, _saveData) {
    var valid = false;
    if(_saveData) {
      for(var i = 0;i < _saveData.length;i++) {
        if(_saveData[i].textContent === inputVal) {
          return _saveData[i]
        }
      }
    }
    return valid
  }
  module.exports = Combobox.extend({validate:function(callback) {
    var self = this;
    self.callSuper(function(error, val) {
      if(!error) {
        self.get("dataSource").fetchData(val, function(data) {
          var d = valInAutoCompleteList(val, self.normalizeData(data));
          callback(d ? "" : self.get("invalidMessage"), val, d)
        })
      }else {
        callback(error, val)
      }
    })
  }}, {ATTRS:{invalidMessage:{value:"invalid input"}}})
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
KISSY.add("combobox", ["combobox/control", "combobox/multi-value-combobox", "combobox/filter-select", "combobox/local-data-source", "combobox/remote-data-source"], function(S, require) {
  var ComboBox = require("combobox/control");
  var MultiValueComboBox = require("combobox/multi-value-combobox");
  var FilterSelect = require("combobox/filter-select");
  var LocalDataSource = require("combobox/local-data-source");
  var RemoteDataSource = require("combobox/remote-data-source");
  ComboBox.LocalDataSource = LocalDataSource;
  ComboBox.RemoteDataSource = RemoteDataSource;
  ComboBox.FilterSelect = FilterSelect;
  ComboBox.MultiValueComboBox = MultiValueComboBox;
  return ComboBox
});

