/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 26 16:52
*/
/*
 Combined modules by KISSY Module Compiler: 

 combobox/multi-word/cursor
 combobox/multi-word
*/

KISSY.add("combobox/multi-word/cursor", ["node"], function(S, require) {
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
KISSY.add("combobox/multi-word", ["./multi-word/cursor", "combobox"], function(S, require) {
  var SUFFIX = "suffix", rWhitespace = /\s|\xa0/;
  var getCursor = require("./multi-word/cursor");
  var ComboBox = require("combobox");
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
  }, getCurrentValue:function() {
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
  }, setCurrentValue:function(value, setCfg) {
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

