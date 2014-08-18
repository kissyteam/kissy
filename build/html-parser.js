/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 html-parser/dtd
 html-parser/lexer/cursor
 html-parser/lexer/index
 html-parser/lexer/page
 html-parser/nodes/node
 html-parser/nodes/text
 html-parser/nodes/cdata
 html-parser/utils
 html-parser/nodes/attribute
 html-parser/nodes/tag
 html-parser/nodes/comment
 html-parser/lexer/lexer
 html-parser/nodes/fragment
 html-parser/nodes/document
 html-parser/scanners/special-scanners
 html-parser/scanners/tag-scanner
 html-parser/scanners/cdata-scanner
 html-parser/scanners/quote-cdata-scanner
 html-parser/scanners/textarea-scanner
 html-parser/scanner
 html-parser/parser
 html-parser/writer/basic
 html-parser/writer/beautify
 html-parser/writer/minify
 html-parser/writer/filter
 html-parser
*/

KISSY.add("html-parser/dtd", [], function(S) {
  var merge = S.merge, A = {isindex:1, fieldset:1}, B = {input:1, button:1, select:1, textarea:1, label:1}, C = merge({a:1}, B), D = merge({iframe:1}, C), E = {hr:1, ul:1, menu:1, div:1, blockquote:1, noscript:1, table:1, center:1, address:1, dir:1, pre:1, h5:1, dl:1, h4:1, noframes:1, h6:1, ol:1, h1:1, h3:1, h2:1}, F = {ins:1, del:1, script:1, style:1}, G = merge({b:1, acronym:1, bdo:1, "var":1, "#text":1, abbr:1, code:1, br:1, i:1, cite:1, kbd:1, u:1, strike:1, s:1, tt:1, strong:1, q:1, samp:1, 
  em:1, dfn:1, span:1}, F), H = merge({sub:1, img:1, object:1, sup:1, basefont:1, map:1, applet:1, font:1, big:1, small:1}, G), I = merge({p:1}, H), J = merge({iframe:1}, H, B), K = {img:1, noscript:1, br:1, kbd:1, center:1, button:1, basefont:1, h5:1, h4:1, samp:1, h6:1, ol:1, h1:1, h3:1, h2:1, form:1, font:1, "#text":1, select:1, menu:1, ins:1, abbr:1, label:1, code:1, table:1, script:1, cite:1, input:1, iframe:1, strong:1, textarea:1, noframes:1, big:1, small:1, span:1, hr:1, sub:1, bdo:1, "var":1, 
  div:1, object:1, sup:1, strike:1, dir:1, map:1, dl:1, applet:1, del:1, isindex:1, fieldset:1, ul:1, b:1, acronym:1, a:1, blockquote:1, i:1, u:1, s:1, tt:1, address:1, q:1, pre:1, p:1, em:1, dfn:1}, L = merge({a:1}, J), M = {tr:1}, N = {"#text":1}, O = merge({param:1}, K), P = merge({form:1}, A, D, E, I), Q = {li:1}, R = {style:1, script:1}, headTags = {base:1, link:1, meta:1, title:1}, T = merge(headTags, R), U = {head:1, body:1}, V = {html:1};
  var block = {address:1, blockquote:1, center:1, dir:1, div:1, dl:1, fieldset:1, form:1, h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, hr:1, isindex:1, menu:1, noframes:1, ol:1, p:1, pre:1, table:1, ul:1};
  var dtd = {$nonBodyContent:merge(V, U, headTags), $block:block, $blockLimit:{body:1, div:1, td:1, th:1, caption:1, form:1}, $inline:L, $body:merge({script:1, style:1}, block), $cdata:{script:1, style:1}, $empty:{area:1, base:1, br:1, col:1, hr:1, img:1, input:1, link:1, meta:1, param:1}, $listItem:{dd:1, dt:1, li:1}, $list:{ul:1, ol:1, dl:1}, $nonEditable:{applet:1, button:1, embed:1, iframe:1, map:1, object:1, option:1, script:1, textarea:1, param:1}, $removeEmpty:{abbr:1, acronym:1, address:1, 
  b:1, bdo:1, big:1, cite:1, code:1, del:1, dfn:1, em:1, font:1, i:1, ins:1, label:1, kbd:1, q:1, s:1, samp:1, small:1, span:1, strike:1, strong:1, sub:1, sup:1, tt:1, u:1, "var":1}, $tabIndex:{a:1, area:1, button:1, input:1, object:1, select:1, textarea:1}, $tableContent:{caption:1, col:1, colgroup:1, tbody:1, td:1, tfoot:1, th:1, thead:1, tr:1}, html:U, head:T, style:N, body:P, base:{}, link:{}, meta:{}, title:N, col:{}, tr:{td:1, th:1}, img:{}, colgroup:{col:1}, noscript:P, td:P, br:{}, th:P, 
  center:P, kbd:L, button:merge(I, E), basefont:{}, h5:L, h4:L, samp:L, h6:L, ol:Q, h1:L, h3:L, option:N, h2:L, form:merge(A, D, E, I), select:{optgroup:1, option:1}, font:L, ins:L, menu:Q, abbr:L, label:L, table:{thead:1, col:1, tbody:1, tr:1, colgroup:1, caption:1, tfoot:1}, code:L, script:N, tfoot:M, cite:L, li:P, input:{}, iframe:P, strong:L, textarea:N, noframes:P, big:L, small:L, span:L, hr:{}, dt:L, sub:L, optgroup:{option:1}, param:{}, bdo:L, "var":L, div:P, object:O, sup:L, dd:P, strike:L, 
  area:{}, dir:Q, map:merge({area:1, form:1, p:1}, A, F, E), applet:O, dl:{dt:1, dd:1}, del:L, isindex:{}, fieldset:merge({legend:1}, K), thead:M, ul:Q, acronym:L, b:L, a:J, blockquote:P, caption:L, i:L, u:L, tbody:M, s:L, address:merge(D, I), tt:L, legend:L, q:L, pre:merge(G, C), p:L, em:L, dfn:L};
  (function() {
    var i, html5Tags = ["article", "figure", "nav", "aside", "section", "footer"];
    for(var p in dtd) {
      for(var p2 in dtd[p]) {
        if(p2 === "div") {
          for(i = 0;i < html5Tags.length;i++) {
            dtd[p][html5Tags[i]] = dtd[p][p2]
          }
        }
      }
    }
    for(i = 0;i < html5Tags.length;i++) {
      dtd[html5Tags[i]] = dtd.div
    }
    dtd.$empty["!doctype"] = 1
  })();
  return dtd
});
KISSY.add("html-parser/lexer/cursor", [], function() {
  function Cursor(offset) {
    this.position = offset || 0
  }
  Cursor.prototype = {constructor:Cursor, advance:function() {
    this.position++
  }, clone:function() {
    var c = new Cursor;
    c.position = this.position;
    return c
  }, retreat:function() {
    this.position = Math.max(--this.position, 0)
  }};
  return Cursor
});
KISSY.add("html-parser/lexer/index", [], function() {
  function Index() {
    this.lineCursors = []
  }
  Index.prototype = {constructor:Index, add:function(cursor) {
    var index = indexOfCursorForInsert(this.lineCursors, cursor);
    if(index !== -1) {
      this.lineCursors.splice(index, 0, cursor.clone())
    }
  }, remove:function(cursor) {
    var cs = this.lineCursors;
    var index = indexOfCursor(this.lineCursors, cursor);
    if(index !== -1) {
      cs.splice(index, 1)
    }
  }, row:function(cursor) {
    var cs = this.lineCursors;
    for(var i = 0;i < cs.length;i++) {
      if(cs[i].position > cursor.position) {
        return i - 1
      }
    }
    return i
  }, col:function(cursor) {
    var linePosition = 0, lineCursor = this.lineCursors[this.row(cursor) - 1];
    if(lineCursor) {
      linePosition = lineCursor.position
    }
    return cursor.position - linePosition
  }};
  function indexOfCursor(cs, c) {
    var cPosition = c.position;
    for(var i = 0;i < cs.length;i++) {
      var iPosition = cs[i].position;
      if(iPosition === cPosition) {
        return i
      }else {
        if(iPosition < cPosition) {
          return-1
        }
      }
    }
    return-1
  }
  function indexOfCursorForInsert(cs, c) {
    var cPosition = c.position;
    for(var i = 0;i < cs.length;i++) {
      var iPosition = cs[i].position;
      if(iPosition === cPosition) {
        return-1
      }else {
        if(iPosition > cPosition) {
          return i
        }
      }
    }
    return i
  }
  return Index
});
KISSY.add("html-parser/lexer/page", ["./index"], function(S, require) {
  var Index = require("./index");
  function Page(source) {
    this.source = source;
    this.lineIndex = new Index
  }
  Page.prototype = {constructor:Page, getChar:function(cursor) {
    var source = this.source;
    var i = cursor.position;
    if(i >= source.length) {
      return-1
    }
    var ret = source.charAt(i);
    cursor.advance();
    if("\r" === ret) {
      ret = "\n";
      i = cursor.position;
      var next = source.charAt(i);
      if(next === "\n") {
        cursor.advance()
      }
    }
    if("\n" === ret) {
      this.lineIndex.add(cursor)
    }
    return ret
  }, ungetChar:function(cursor) {
    var source = this.source;
    cursor.retreat();
    var i = cursor.position, ch = source.charAt(i);
    if(ch === "\n" && 0 !== i) {
      ch = source.charAt(i - 1);
      if("\r" === ch) {
        cursor.retreat()
      }
    }
  }, getText:function(start, end) {
    return this.source.slice(start, end)
  }, row:function(cursor) {
    return this.lineIndex.row(cursor)
  }, col:function(cursor) {
    return this.lineIndex.col(cursor)
  }};
  return Page
});
KISSY.add("html-parser/nodes/node", [], function() {
  function lineCount(str) {
    var i = 0;
    str.replace(/\n/g, function() {
      i++
    });
    return i
  }
  function Node(page, startPosition, endPosition) {
    this.parentNode = null;
    this.page = page;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.nodeName = null;
    this.previousSibling = null;
    this.nextSibling = null
  }
  Node.prototype = {constructor:Node, getStartLine:function() {
    if(this.page) {
      if("startLine" in this) {
        return this.startLine
      }
      this.startLine = lineCount(this.page.getText(0, this.startPosition))
    }
    return-1
  }, getEndLine:function() {
    if(this.page) {
      if("endLine" in this) {
        return this.endLine
      }
      this.endLine = lineCount(this.page.getText(0, this.endPosition))
    }
    return-1
  }, toHtml:function() {
    if(this.page && this.page.getText) {
      return this.page.getText(this.startPosition, this.endPosition)
    }
    return""
  }, toDebugString:function() {
    var ret = [], self = this;
    ret.push(self.nodeName + "  [ " + self.startPosition + "|" + self.getStartLine() + " : " + self.endPosition + "|" + self.getEndLine() + " ]\n");
    ret.push(self.toHtml());
    return ret.join("")
  }};
  return Node
});
KISSY.add("html-parser/nodes/text", ["./node"], function(S, require) {
  var Node = require("./node");
  function Text(v) {
    if(typeof v === "string") {
      this.nodeValue = v;
      Text.superclass.constructor.apply(this, [null, -1, -1])
    }else {
      Text.superclass.constructor.apply(this, arguments);
      this.nodeValue = this.toHtml()
    }
    this.nodeType = 3;
    this.nodeName = "#text"
  }
  S.extend(Text, Node, {writeHtml:function(writer, filter) {
    var ret;
    if(!filter || (ret = filter.onText(this)) !== false) {
      if(ret) {
        if(this !== ret) {
          ret.writeHtml(writer, filter);
          return
        }
      }
      writer.text(this.toHtml())
    }
  }, toHtml:function() {
    if(this.nodeValue) {
      return this.nodeValue
    }else {
      return Text.superclass.toHtml.apply(this, arguments)
    }
  }});
  return Text
});
KISSY.add("html-parser/nodes/cdata", ["./text"], function(S, require) {
  var Text = require("./text");
  function CData() {
    CData.superclass.constructor.apply(this, arguments);
    this.nodeType = 4;
    this.nodeName = "#cdata"
  }
  S.extend(CData, Text, {writeHtml:function(writer, filter) {
    var ret;
    if(!filter || (ret = filter.onCData(this)) !== false) {
      if(ret) {
        if(this !== ret) {
          ret.writeHtml(writer, filter);
          return
        }
      }
      writer.cdata(this.toHtml())
    }
  }});
  return CData
});
KISSY.add("html-parser/utils", [], function() {
  return{isBooleanAttribute:function(attrName) {
    return/^(?:checked|disabled|selected|readonly|defer|multiple|nohref|noshape|nowrap|noresize|compact|ismap)$/i.test(attrName)
  }, collapseWhitespace:function(str) {
    return str.replace(/[\s\xa0]+/g, " ")
  }, isLetter:function(ch) {
    return"a" <= ch && "z" >= ch || "A" <= ch && "Z" >= ch
  }, isValidAttributeNameStartChar:function(ch) {
    return!this.isWhitespace(ch) && ch !== '"' && ch !== "'" && ch !== ">" && ch !== "" < "" && ch !== "/" && ch !== "="
  }, isWhitespace:function(ch) {
    return/^[\s\xa0]$/.test(ch)
  }}
});
KISSY.add("html-parser/nodes/attribute", [], function(S) {
  function Attribute(name, assignment, value, quote) {
    this.nodeType = 2;
    this.name = name;
    this.assignment = assignment;
    this.value = value;
    this.quote = quote
  }
  S.augment(Attribute, {clone:function() {
    var ret = new Attribute;
    S.mix(ret, this);
    return ret
  }, equals:function(other) {
    return this.name === other.name && this.value === other.value && this.nodeType === other.nodeType
  }});
  Attribute.prototype.clone = function() {
    var ret = new Attribute;
    S.mix(ret, this);
    return ret
  };
  return Attribute
});
KISSY.add("html-parser/nodes/tag", ["./node", "./attribute", "../dtd"], function(S, require) {
  var Node = require("./node");
  var Attribute = require("./attribute");
  var Dtd = require("../dtd");
  function createTag(self, tagName, attrs) {
    self.nodeName = self.tagName = tagName.toLowerCase();
    self._updateSelfClosed();
    S.each(attrs, function(v, n) {
      self.setAttribute(n, v)
    })
  }
  function Tag(page, startPosition, endPosition, attributes) {
    var self = this;
    self.childNodes = [];
    self.firstChild = null;
    self.lastChild = null;
    self.attributes = attributes || [];
    self.nodeType = 1;
    if(typeof page === "string") {
      createTag.apply(null, [self].concat(S.makeArray(arguments)))
    }else {
      Tag.superclass.constructor.apply(self, arguments);
      attributes = self.attributes;
      if(attributes[0]) {
        self.nodeName = attributes[0].name.toLowerCase();
        self.tagName = self.nodeName.replace(/\//, "");
        self._updateSelfClosed();
        attributes.splice(0, 1)
      }
      var lastAttr = attributes[attributes.length - 1], lastSlash = !!(lastAttr && /\/$/.test(lastAttr.name));
      if(lastSlash) {
        attributes.length = attributes.length - 1
      }
      self.isSelfClosed = self.isSelfClosed || lastSlash;
      self.closed = self.isSelfClosed
    }
    self.closedStartPosition = -1;
    self.closedEndPosition = -1
  }
  function refreshChildNodes(self) {
    var c = self.childNodes;
    self.firstChild = c[0];
    self.lastChild = c[c.length - 1];
    if(c.length >= 1) {
      c[0].nextSibling = c[0].nextSibling = null;
      c[0].parentNode = self
    }
    if(c.length > 1) {
      for(var i = 0;i < c.length - 1;i++) {
        c[i].nextSibling = c[i + 1];
        c[i + 1].previousSibling = c[i];
        c[i + 1].parentNode = self
      }
      c[c.length - 1].nextSibling = null
    }
  }
  S.extend(Tag, Node, {_updateSelfClosed:function() {
    var self = this;
    self.isSelfClosed = !!Dtd.$empty[self.nodeName];
    if(!self.isSelfClosed) {
      self.isSelfClosed = /\/$/.test(self.nodeName)
    }
    self.closed = self.isSelfClosed
  }, clone:function() {
    var ret = new Tag, attrs = [];
    S.each(this.attributes, function(a) {
      attrs.push(a.clone())
    });
    S.mix(ret, {childNodes:[], firstChild:null, lastChild:null, attributes:attrs, nodeType:this.nodeType, nodeName:this.nodeName, tagName:this.tagName, isSelfClosed:this.isSelfClosed, closed:this.closed, closedStartPosition:this.closedStartPosition, closedEndPosition:this.closedEndPosition});
    return ret
  }, setTagName:function(v) {
    var self = this;
    self.nodeName = self.tagName = v;
    if(v) {
      self._updateSelfClosed()
    }
  }, equals:function(tag) {
    if(!tag || this.nodeName !== tag.nodeName) {
      return 0
    }
    if(this.nodeType !== tag.nodeType) {
      return 0
    }
    if(this.attributes.length !== tag.attributes.length) {
      return 0
    }
    for(var i = 0;i < this.attributes.length;i++) {
      if(!this.attributes[i].equals(tag.attributes[i])) {
        return 0
      }
    }
    return 1
  }, isEndTag:function() {
    return/^\//.test(this.nodeName)
  }, appendChild:function(node) {
    this.childNodes.push(node);
    refreshChildNodes(this)
  }, replace:function(ref) {
    var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
    silbing[index] = this;
    refreshChildNodes(ref.parentNode)
  }, replaceChild:function(newC, refC) {
    var self = this, childNodes = self.childNodes;
    var index = S.indexOf(refC, childNodes);
    childNodes[index] = newC;
    refreshChildNodes(self)
  }, prepend:function(node) {
    this.childNodes.unshift(node);
    refreshChildNodes(this)
  }, insertBefore:function(ref) {
    var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
    silbing.splice(index, 0, this);
    refreshChildNodes(ref.parentNode)
  }, insertAfter:function(ref) {
    var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
    if(index === silbing.length - 1) {
      ref.parentNode.appendChild(this)
    }else {
      this.insertBefore(ref.parentNode.childNodes[[index + 1]])
    }
  }, empty:function() {
    this.childNodes = [];
    refreshChildNodes(this)
  }, removeChild:function(node) {
    var silbing = node.parentNode.childNodes, index = S.indexOf(node, silbing);
    silbing.splice(index, 1);
    refreshChildNodes(node.parentNode)
  }, getAttribute:function(name) {
    var attr = findAttributeByName(this.attributes, name);
    return attr && attr.value
  }, setAttribute:function(name, value) {
    var attr = findAttributeByName(this.attributes, name);
    if(attr) {
      attr.value = value
    }else {
      this.attributes.push(new Attribute(name, "=", value, '"'))
    }
  }, removeAttribute:function(name) {
    var attr = findAttributeByName(this.attributes, name);
    if(attr) {
      var index = S.indexOf(attr, this.attributes);
      this.attributes.splice(index, 1)
    }
  }, filterChildren:function() {
    var self = this;
    if(!self.isChildrenFiltered) {
      var writer = new (S.require("html-parser/writer/basic"));
      self._writeChildrenHTML(writer);
      var parser = new (S.require("html-parser/parser"))(writer.getHtml()), children = parser.parse().childNodes;
      self.empty();
      S.each(children, function(c) {
        self.appendChild(c)
      });
      self.isChildrenFiltered = 1
    }
  }, writeHtml:function(writer, filter) {
    var el = this, tmp, attrName, tagName = el.tagName;
    if(tagName === "!doctype") {
      writer.append(this.toHtml() + "\n");
      return
    }
    el.__filter = filter;
    el.isChildrenFiltered = 0;
    if(filter) {
      if(!(tagName = filter.onTagName(tagName))) {
        return
      }
      el.tagName = tagName;
      tmp = filter.onTag(el);
      if(tmp === false) {
        return
      }
      if(tmp) {
        el = tmp
      }
      if(el.nodeType !== 1) {
        el.writeHtml(writer, filter);
        return
      }
      if(!el.tagName) {
        el._writeChildrenHTML(writer);
        return
      }
    }
    writer.openTag(el);
    var attributes = el.attributes;
    for(var i = 0;i < attributes.length;i++) {
      var attr = attributes[i];
      attrName = attr.name;
      if(filter) {
        if(!(attrName = filter.onAttributeName(attrName, el))) {
          continue
        }
        attr.name = attrName;
        if(filter.onAttribute(attr, el) === false) {
          continue
        }
      }
      writer.attribute(attr, el)
    }
    writer.openTagClose(el);
    if(!el.isSelfClosed) {
      el._writeChildrenHTML(writer);
      writer.closeTag(el)
    }
  }, _writeChildrenHTML:function(writer) {
    var self = this, filter = self.isChildrenFiltered ? 0 : self.__filter;
    S.each(self.childNodes, function(child) {
      child.writeHtml(writer, filter)
    })
  }});
  function findAttributeByName(attributes, name) {
    if(attributes && attributes.length) {
      for(var i = 0;i < attributes.length;i++) {
        if(attributes[i].name === name) {
          return attributes[i]
        }
      }
    }
    return null
  }
  return Tag
});
KISSY.add("html-parser/nodes/comment", ["./text"], function(S, require) {
  var Text = require("./text");
  function Comment() {
    Comment.superclass.constructor.apply(this, arguments);
    this.nodeType = 8;
    this.nodeName = "#comment"
  }
  S.extend(Comment, Text, {writeHtml:function(writer, filter) {
    var ret;
    if(!filter || (ret = filter.onComment(this)) !== false) {
      if(ret) {
        if(this !== ret) {
          ret.writeHtml(writer, filter);
          return
        }
      }
      writer.comment(this.toHtml())
    }
  }, toHtml:function() {
    if(this.nodeValue) {
      return this.nodeValue
    }else {
      var value = Text.superclass.toHtml.apply(this, arguments);
      return value.substring(4, value.length - 3)
    }
  }});
  return Comment
});
KISSY.add("html-parser/lexer/lexer", ["./cursor", "./page", "../nodes/text", "../nodes/cdata", "../utils", "../nodes/attribute", "../nodes/tag", "../nodes/comment"], function(S, require) {
  var Cursor = require("./cursor");
  var Page = require("./page");
  var TextNode = require("../nodes/text");
  var CData = require("../nodes/cdata");
  var Utils = require("../utils");
  var Attribute = require("../nodes/attribute");
  var TagNode = require("../nodes/tag");
  var CommentNode = require("../nodes/comment");
  function Lexer(text, cfg) {
    var self = this;
    self.page = new Page(text);
    self.cursor = new Cursor;
    self.nodeFactory = this;
    this.cfg = cfg || {}
  }
  Lexer.prototype = {constructor:Lexer, setPosition:function(p) {
    this.cursor.position = p
  }, getPosition:function() {
    return this.cursor.position
  }, nextNode:function(quoteSmart) {
    var start, ch, ret, cursor = this.cursor, page = this.page;
    start = cursor.position;
    ch = page.getChar(cursor);
    switch(ch) {
      case -1:
        ret = null;
        break;
      case "<":
        ch = page.getChar(cursor);
        if(ch === -1) {
          ret = this.makeString(start, cursor.position)
        }else {
          if(ch === "/" || Utils.isLetter(ch)) {
            page.ungetChar(cursor);
            ret = this.parseTag(start)
          }else {
            if("!" === ch || "?" === ch) {
              ch = page.getChar(cursor);
              if(ch === -1) {
                ret = this.makeString(start, cursor.position)
              }else {
                if(">" === ch) {
                  ret = this.makeComment(start, cursor.position)
                }else {
                  page.ungetChar(cursor);
                  if("-" === ch) {
                    ret = this.parseComment(start, quoteSmart)
                  }else {
                    page.ungetChar(cursor);
                    ret = this.parseTag(start)
                  }
                }
              }
            }else {
              page.ungetChar(cursor);
              ret = this.parseString(start, quoteSmart)
            }
          }
        }
        break;
      default:
        page.ungetChar(cursor);
        ret = this.parseString(start, quoteSmart);
        break
    }
    return ret
  }, makeComment:function(start, end) {
    var length, ret;
    length = end - start;
    if(0 !== length) {
      if(2 > length) {
        return this.makeString(start, end)
      }
      ret = this.nodeFactory.createCommentNode(this.page, start, end)
    }else {
      ret = null
    }
    return ret
  }, makeString:function(start, end) {
    var ret = null, l;
    l = end - start;
    if(l > 0) {
      ret = this.nodeFactory.createStringNode(this.page, start, end)
    }
    return ret
  }, makeCData:function(start, end) {
    var ret = null, l;
    l = end - start;
    if(l > 0) {
      ret = this.nodeFactory.createCDataNode(this.page, start, end)
    }
    return ret
  }, makeTag:function(start, end, attributes) {
    var length, ret;
    length = end - start;
    if(0 !== length) {
      if(2 > length) {
        return this.makeString(start, end)
      }
      ret = this.nodeFactory.createTagNode(this.page, start, end, attributes)
    }else {
      ret = null
    }
    return ret
  }, createTagNode:function(page, start, end, attributes) {
    return new TagNode(page, start, end, attributes)
  }, createStringNode:function(page, start, end) {
    return new TextNode(page, start, end)
  }, createCDataNode:function(page, start, end) {
    return new CData(page, start, end)
  }, createCommentNode:function(page, start, end) {
    return new CommentNode(page, start, end)
  }, parseTag:function(start) {
    var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
    if(strict) {
      checkError = function() {
        if(strict && ch === -1 && attributes.length) {
          throw new Error(attributes[0].name + " syntax error at row " + (page.row(cursor) + 1) + " , col " + (page.col(cursor) + 1));
        }
      }
    }
    bookmarks[0] = cursor.position;
    while(!done) {
      bookmarks[state + 1] = cursor.position;
      ch = page.getChar(cursor);
      switch(state) {
        case 0:
          if(ch === -1 || ">" === ch || "<" === ch) {
            if("<" === ch) {
              page.ungetChar(cursor);
              bookmarks[state + 1] = cursor.position
            }
            done = true
          }else {
            if(!attributes.length) {
              if(ch === "/" || Utils.isValidAttributeNameStartChar(ch)) {
                state = 1
              }
            }else {
              if(ch === "/" || Utils.isValidAttributeNameStartChar(ch)) {
                state = 1
              }
            }
          }
          break;
        case 1:
          if(-1 === ch || ">" === ch || "<" === ch) {
            if("<" === ch) {
              page.ungetChar(cursor);
              bookmarks[state + 1] = cursor.getPosition
            }
            this.standalone(attributes, bookmarks);
            done = true
          }else {
            if(Utils.isWhitespace(ch)) {
              bookmarks[6] = bookmarks[2];
              state = 6
            }else {
              if("=" === ch) {
                state = 2
              }
            }
          }
          break;
        case 2:
          if(-1 === ch || ">" === ch) {
            this.standalone(attributes, bookmarks);
            done = true
          }else {
            if("'" === ch) {
              state = 4;
              bookmarks[4] = bookmarks[3]
            }else {
              if('"' === ch) {
                state = 5;
                bookmarks[5] = bookmarks[3]
              }else {
                if(!Utils.isWhitespace(ch)) {
                  state = 3
                }
              }
            }
          }
          break;
        case 3:
          if(-1 === ch || ">" === ch) {
            this.naked(attributes, bookmarks);
            done = true
          }else {
            if(Utils.isWhitespace(ch)) {
              this.naked(attributes, bookmarks);
              bookmarks[0] = bookmarks[4];
              state = 0
            }
          }
          break;
        case 4:
          if(-1 === ch) {
            this.singleQuote(attributes, bookmarks);
            done = true
          }else {
            if("'" === ch) {
              this.singleQuote(attributes, bookmarks);
              bookmarks[0] = bookmarks[5] + 1;
              state = 0
            }
          }
          break;
        case 5:
          if(-1 === ch) {
            this.doubleQuote(attributes, bookmarks);
            done = true
          }else {
            if('"' === ch) {
              this.doubleQuote(attributes, bookmarks);
              bookmarks[0] = bookmarks[6] + 1;
              state = 0
            }
          }
          break;
        case 6:
          if(-1 === ch) {
            this.standalone(attributes, bookmarks);
            bookmarks[0] = bookmarks[6];
            page.ungetChar(cursor);
            state = 0
          }else {
            if("=" === ch) {
              bookmarks[2] = bookmarks[6];
              bookmarks[3] = bookmarks[7];
              state = 2
            }else {
              if(!Utils.isWhitespace(ch)) {
                this.standalone(attributes, bookmarks);
                bookmarks[0] = bookmarks[6];
                page.ungetChar(cursor);
                state = 0
              }
            }
          }
          break;
        default:
          throw new Error("how ** did we get in state " + state);
      }
      checkError()
    }
    return this.makeTag(start, cursor.position, attributes)
  }, parseComment:function(start, quoteSmart) {
    var done, ch, page = this.page, cursor = this.cursor, state;
    done = false;
    state = 0;
    while(!done) {
      ch = page.getChar(cursor);
      if(-1 === ch) {
        done = true
      }else {
        switch(state) {
          case 0:
            if(">" === ch) {
              done = true
            }else {
              if("-" === ch) {
                state = 1
              }else {
                return this.parseString(start, quoteSmart)
              }
            }
            break;
          case 1:
            if("-" === ch) {
              ch = page.getChar(cursor);
              if(-1 === ch) {
                done = true
              }else {
                if(">" === ch) {
                  done = true
                }else {
                  page.ungetChar(cursor);
                  state = 2
                }
              }
            }else {
              return this.parseString(start, quoteSmart)
            }
            break;
          case 2:
            if("-" === ch) {
              state = 3
            }else {
              if(-1 === ch) {
                return this.parseString(start, quoteSmart)
              }
            }
            break;
          case 3:
            if("-" === ch) {
              state = 4
            }else {
              state = 2
            }
            break;
          case 4:
            if(">" === ch) {
              done = true
            }else {
              if(!Utils.isWhitespace(ch)) {
                state = 2
              }
            }
            break;
          default:
            throw new Error("how ** did we get in state " + state);
        }
      }
    }
    return this.makeComment(start, cursor.position)
  }, parseString:function(start, quoteSmart) {
    var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
    while(!done) {
      ch = page.getChar(cursor);
      if(-1 === ch) {
        done = 1
      }else {
        if(quoteSmart && 0 === quote && ('"' === ch || "'" === ch)) {
          quote = ch
        }else {
          if(quoteSmart && 0 !== quote && "\\" === ch) {
            ch = page.getChar(cursor);
            if(-1 !== ch && "\\" !== ch && ch !== quote) {
              page.ungetChar(cursor)
            }
          }else {
            if(quoteSmart && ch === quote) {
              quote = 0
            }else {
              if(quoteSmart && 0 === quote && ch === "/") {
                ch = page.getChar(cursor);
                if(-1 === ch) {
                  done = 1
                }else {
                  if("/" === ch) {
                    do {
                      ch = page.getChar(cursor)
                    }while(-1 !== ch && "\n" !== ch)
                  }else {
                    if("*" === ch) {
                      do {
                        do {
                          ch = page.getChar(cursor)
                        }while(-1 !== ch && "*" !== ch);
                        ch = page.getChar(cursor);
                        if(ch === "*") {
                          page.ungetChar(cursor)
                        }
                      }while(-1 !== ch && "/" !== ch)
                    }else {
                      page.ungetChar(cursor)
                    }
                  }
                }
              }else {
                if(0 === quote && "<" === ch) {
                  ch = page.getChar(cursor);
                  if(-1 === ch) {
                    done = 1
                  }else {
                    if("/" === ch || Utils.isLetter(ch) || "!" === ch || "?" === ch) {
                      done = 1;
                      page.ungetChar(cursor);
                      page.ungetChar(cursor)
                    }else {
                      page.ungetChar(cursor)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return this.makeString(start, cursor.position)
  }, parseCDATA:function(quoteSmart, tagName) {
    var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
    start = mCursor.position;
    state = 0;
    done = false;
    quote = "";
    comment = false;
    while(!done) {
      ch = mPage.getChar(mCursor);
      switch(state) {
        case 0:
          switch(ch) {
            case -1:
              done = true;
              break;
            case "'":
              if(quoteSmart && !comment) {
                if("" === quote) {
                  quote = "'"
                }else {
                  if("'" === quote) {
                    quote = ""
                  }
                }
              }
              break;
            case '"':
              if(quoteSmart && !comment) {
                if("" === quote) {
                  quote = '"'
                }else {
                  if('"' === quote) {
                    quote = ""
                  }
                }
              }
              break;
            case "\\":
              if(quoteSmart) {
                if("" !== quote) {
                  ch = mPage.getChar(mCursor);
                  if(-1 === ch) {
                    done = true
                  }else {
                    if(ch !== "\\" && ch !== quote) {
                      mPage.ungetChar(mCursor)
                    }
                  }
                }
              }
              break;
            case "/":
              if(quoteSmart) {
                if("" === quote) {
                  ch = mPage.getChar(mCursor);
                  if(-1 === ch) {
                    done = true
                  }else {
                    if("/" === ch) {
                      comment = true
                    }else {
                      if("*" === ch) {
                        do {
                          do {
                            ch = mPage.getChar(mCursor)
                          }while(-1 !== ch && "*" !== ch);
                          ch = mPage.getChar(mCursor);
                          if(ch === "*") {
                            mPage.ungetChar(mCursor)
                          }
                        }while(-1 !== ch && "/" !== ch)
                      }else {
                        mPage.ungetChar(mCursor)
                      }
                    }
                  }
                }
              }
              break;
            case "\n":
              comment = false;
              break;
            case "<":
              if(quoteSmart) {
                if("" === quote) {
                  state = 1
                }
              }else {
                state = 1
              }
              break;
            default:
              break
          }
          break;
        case 1:
          switch(ch) {
            case -1:
              done = true;
              break;
            case "/":
              if(!tagName || mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)) {
                state = 2
              }else {
                state = 0
              }
              break;
            case "!":
              ch = mPage.getChar(mCursor);
              if(-1 === ch) {
                done = true
              }else {
                if("-" === ch) {
                  ch = mPage.getChar(mCursor);
                  if(-1 === ch) {
                    done = true
                  }else {
                    if("-" === ch) {
                      state = 3
                    }else {
                      state = 0
                    }
                  }
                }else {
                  state = 0
                }
              }
              break;
            default:
              state = 0;
              break
          }
          break;
        case 2:
          comment = false;
          if(-1 === ch) {
            done = true
          }else {
            if(Utils.isLetter(ch)) {
              done = true;
              mPage.ungetChar(mCursor);
              mPage.ungetChar(mCursor);
              mPage.ungetChar(mCursor)
            }else {
              state = 0
            }
          }
          break;
        case 3:
          comment = false;
          if(-1 === ch) {
            done = true
          }else {
            if("-" === ch) {
              ch = mPage.getChar(mCursor);
              if(-1 === ch) {
                done = true
              }else {
                if("-" === ch) {
                  ch = mPage.getChar(mCursor);
                  if(-1 === ch) {
                    done = true
                  }else {
                    if(">" === ch) {
                      state = 0
                    }else {
                      mPage.ungetChar(mCursor);
                      mPage.ungetChar(mCursor)
                    }
                  }
                }else {
                  mPage.ungetChar(mCursor)
                }
              }
            }
          }
          break;
        default:
          throw new Error("unexpected " + state);
      }
    }
    end = mCursor.position;
    return this.makeCData(start, end)
  }, singleQuote:function(attributes, bookmarks) {
    var page = this.page;
    attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"))
  }, doubleQuote:function(attributes, bookmarks) {
    var page = this.page;
    attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'))
  }, standalone:function(attributes, bookmarks) {
    var page = this.page;
    attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])))
  }, naked:function(attributes, bookmarks) {
    var page = this.page;
    attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])))
  }};
  return Lexer
});
KISSY.add("html-parser/nodes/fragment", ["./tag"], function(S, require) {
  var Tag = require("./tag");
  function Fragment() {
    this.childNodes = [];
    this.nodeType = 9;
    this.nodeName = "#fragment"
  }
  S.extend(Fragment, Tag, {writeHtml:function(writer, filter) {
    this.__filter = filter;
    this.isChildrenFiltered = 0;
    if(filter) {
      filter.onFragment(this)
    }
    this._writeChildrenHTML(writer)
  }});
  return Fragment
});
KISSY.add("html-parser/nodes/document", ["./tag"], function(S, require) {
  var Tag = require("./tag");
  function Document() {
    this.childNodes = [];
    this.nodeType = 9;
    this.nodeName = "#document"
  }
  S.extend(Document, Tag, {writeHtml:function(writer, filter) {
    this.__filter = filter;
    this._writeChildrenHTML(writer)
  }});
  return Document
});
KISSY.add("html-parser/scanners/special-scanners", [], function() {
  return{}
});
KISSY.add("html-parser/scanners/tag-scanner", ["../dtd", "../nodes/tag", "./special-scanners"], function(S, require) {
  var dtd = require("../dtd");
  var Tag = require("../nodes/tag");
  var SpecialScanners = require("./special-scanners");
  var wrapper = {li:"ul", dt:"dl", dd:"dl"};
  var impliedEndTag = {dd:{dl:1}, dt:{dl:1}, li:{ul:1, ol:1}, option:{select:1}, optgroup:{select:1}};
  function fixCloseTagByDtd(tag, opts) {
    tag.closed = 1;
    if(!opts.fixByDtd) {
      return 0
    }
    var valid = 1, childNodes = [].concat(tag.childNodes);
    S.each(childNodes, function(c) {
      if(!canHasNodeAsChild(tag, c)) {
        valid = 0;
        return false
      }
    });
    if(valid) {
      return 0
    }
    var holder = tag.clone(), prev = tag, recursives = [];
    function closeCurrentHolder() {
      if(holder.childNodes.length) {
        holder.insertAfter(prev);
        prev = holder;
        holder = tag.clone()
      }
    }
    for(var i = 0;i < childNodes.length;i++) {
      var c = childNodes[i];
      if(canHasNodeAsChild(holder, c)) {
        holder.appendChild(c)
      }else {
        if(c.nodeType !== 1) {
          continue
        }
        var currentChildName = c.tagName;
        if(dtd.$listItem[currentChildName]) {
          closeCurrentHolder();
          var pTagName = wrapper[c.tagName], pTag = new Tag;
          pTag.nodeName = pTag.tagName = pTagName;
          while(i < childNodes.length) {
            if(childNodes[i].tagName === currentChildName) {
              pTag.appendChild(childNodes[i])
            }else {
              if(childNodes[i].nodeType === 3 && S.trim(childNodes[i].toHtml())) {
                break
              }
            }
            i++
          }
          pTag.insertAfter(prev);
          prev = pTag;
          i--;
          continue
        }
        closeCurrentHolder();
        if(!c.equals(holder)) {
          if(canHasNodeAsChild(c, holder)) {
            holder = tag.clone();
            S.each(c.childNodes, function(cc) {
              holder.appendChild(cc)
            });
            c.empty();
            c.insertAfter(prev);
            prev = c;
            c.appendChild(holder);
            recursives.push(holder);
            holder = tag.clone()
          }else {
            c.insertAfter(prev);
            prev = c
          }
        }else {
          c.insertAfter(prev);
          prev = c
        }
      }
    }
    if(holder.childNodes.length) {
      holder.insertAfter(prev)
    }
    tag.parentNode.removeChild(tag);
    S.each(recursives, function(r) {
      fixCloseTagByDtd(r, opts)
    });
    return 1
  }
  function canHasNodeAsChild(tag, node) {
    if(tag.nodeType === 9) {
      return 1
    }
    if(!dtd[tag.tagName]) {
      S.error("dtd[" + tag.tagName + "] === undefined!")
    }
    if(node.nodeType === 8) {
      return 1
    }
    var nodeName = node.tagName || node.nodeName;
    return!!dtd[tag.tagName][nodeName]
  }
  return{scan:function(tag, lexer, opts) {
    function closeStackOpenTag(end, from) {
      for(i = end;i > from;i--) {
        var currentStackItem = stack[i], preStackItem = stack[i - 1];
        preStackItem.appendChild(currentStackItem);
        fixCloseTagByDtd(currentStackItem, opts)
      }
      tag = stack[from];
      stack.length = from
    }
    function processImpliedEndTag(node) {
      var needFix = 0, endParentTagName;
      if(endParentTagName = impliedEndTag[node.tagName]) {
        var from = stack.length - 1, parent = stack[from];
        while(parent && !(parent.tagName in endParentTagName)) {
          if(parent.tagName === node.tagName) {
            needFix = 1;
            break
          }
          from--;
          parent = stack[from]
        }
        if(needFix) {
          closeStackOpenTag(stack.length - 1, from - 1)
        }
      }
      return needFix
    }
    var node, i, stack;
    stack = opts.stack = opts.stack || [];
    do {
      node = lexer.nextNode();
      if(node) {
        if(node.nodeType === 1) {
          if(node.isEndTag() && node.tagName === tag.tagName) {
            node = null
          }else {
            if(!node.isEndTag()) {
              if(SpecialScanners[node.tagName]) {
                SpecialScanners[node.tagName].scan(node, lexer, opts);
                tag.appendChild(node)
              }else {
                if(node.isSelfClosed) {
                  tag.appendChild(node)
                }else {
                  stack.push(tag);
                  if(processImpliedEndTag(node)) {
                    stack.push(tag)
                  }
                  tag = node
                }
              }
            }else {
              if(node.isEndTag()) {
                var index = -1;
                for(i = stack.length - 1;i >= 0;i--) {
                  var c = stack[i];
                  if(c.tagName === node.tagName) {
                    index = i;
                    break
                  }
                }
                if(index !== -1) {
                  stack[stack.length - 1].appendChild(tag);
                  fixCloseTagByDtd(tag, opts);
                  closeStackOpenTag(stack.length - 1, index);
                  node = null
                }
              }
            }
          }
        }else {
          tag.appendChild(node)
        }
      }
      if(node === null) {
        if(stack.length > 0) {
          node = stack[stack.length - 1];
          if(!SpecialScanners[node.tagName]) {
            stack.length = stack.length - 1;
            node.appendChild(tag);
            fixCloseTagByDtd(tag, opts);
            tag = node
          }else {
            node = null
          }
        }
      }
    }while(node);
    fixCloseTagByDtd(tag, opts)
  }}
});
KISSY.add("html-parser/scanners/cdata-scanner", [], function() {
  return{scan:function(tag, lexer, opts) {
    var content = lexer.parseCDATA(opts.quoteSmart, tag.nodeName), position = lexer.getPosition(), node = lexer.nextNode();
    if(node) {
      if(node.nodeType !== 1 || !(node.isEndTag() && node.tagName === tag.tagName)) {
        lexer.setPosition(position);
        node = null
      }
    }
    tag.closed = true;
    if(content) {
      tag.appendChild(content)
    }
  }}
});
KISSY.add("html-parser/scanners/quote-cdata-scanner", ["./cdata-scanner", "../dtd", "./special-scanners"], function(S, require) {
  var CDataScanner = require("./cdata-scanner");
  var Dtd = require("../dtd");
  var SpecialScanners = require("./special-scanners");
  var ret = {scan:function(tag, lexer, opts) {
    opts = opts || {};
    opts.quoteSmart = 1;
    CDataScanner.scan(tag, lexer, opts);
    opts.quoteSmart = 0
  }};
  for(var t in Dtd.$cdata) {
    SpecialScanners[t] = ret
  }
  return ret
});
KISSY.add("html-parser/scanners/textarea-scanner", ["./cdata-scanner", "./special-scanners"], function(S, require) {
  var CDataScanner = require("./cdata-scanner");
  var SpecialScanners = require("./special-scanners");
  SpecialScanners.textarea = {scan:function(tag, lexer, opts) {
    opts = opts || {};
    CDataScanner.scan(tag, lexer, opts)
  }};
  return SpecialScanners.textarea
});
KISSY.add("html-parser/scanner", ["./scanners/tag-scanner", "./scanners/special-scanners", "./scanners/quote-cdata-scanner", "./scanners/textarea-scanner"], function(S, require) {
  var TagScanner = require("./scanners/tag-scanner");
  var SpecialScanners = require("./scanners/special-scanners");
  require("./scanners/quote-cdata-scanner");
  require("./scanners/textarea-scanner");
  return{getScanner:function(nodeName) {
    return SpecialScanners[nodeName] || TagScanner
  }}
});
KISSY.add("html-parser/parser", ["./dtd", "./nodes/tag", "./nodes/fragment", "./lexer/lexer", "./nodes/document", "./scanner"], function(S, require) {
  var dtd = require("./dtd");
  var Tag = require("./nodes/tag");
  var Fragment = require("./nodes/fragment");
  var Lexer = require("./lexer/lexer");
  var Document = require("./nodes/document");
  var Scanner = require("./scanner");
  function Parser(html, opts) {
    html = S.trim(html);
    this.originalHTML = html;
    if(/^(<!doctype|<html|<body)/i.test(html)) {
      html = "<document>" + html + "</document>"
    }else {
      html = "<body>" + html + "</body>"
    }
    this.lexer = new Lexer(html);
    this.opts = opts || {}
  }
  Parser.prototype = {constructor:Parser, elements:function() {
    var root, doc, lexer = this.lexer, opts = this.opts;
    doc = root = lexer.nextNode();
    if(root.tagName !== "document") {
      doc = new Document;
      doc.appendChild(root)
    }
    doc.nodeType = 9;
    Scanner.getScanner("div").scan(root, lexer, opts);
    var body = fixBody(doc);
    if(body && opts.autoParagraph) {
      autoParagraph(body)
    }
    postProcess(doc);
    var originalHTML = this.originalHTML, fragment = new Fragment, cs;
    if(/^(<!doctype|<html|<body)/i.test(originalHTML)) {
      cs = doc.childNodes
    }else {
      cs = body.childNodes
    }
    S.each(cs, function(c) {
      fragment.appendChild(c)
    });
    return fragment
  }, parse:function() {
    return this.elements()
  }};
  function fixBody(doc) {
    var body = findTagWithName(doc, "body", 3);
    if(body) {
      var parent = body.parentNode, silbing = parent.childNodes, bodyIndex = S.indexOf(body, silbing);
      if(bodyIndex !== silbing.length - 1) {
        var fixes = silbing.slice(bodyIndex + 1, silbing.length);
        for(var i = 0;i < fixes.length;i++) {
          parent.removeChild(fixes[i]);
          if(fixes[i].tagName === "body") {
            S.each(fixes[i].childNodes, function(c) {
              body.appendChild(c)
            })
          }else {
            body.appendChild(fixes[i])
          }
        }
      }
    }
    return body
  }
  function autoParagraph(doc) {
    var childNodes = doc.childNodes, c, i, pDtd = dtd.p, needFix = 0;
    for(i = 0;i < childNodes.length;i++) {
      c = childNodes[i];
      if(c.nodeType === 3 || c.nodeType === 1 && pDtd[c.nodeName]) {
        needFix = 1;
        break
      }
    }
    if(needFix) {
      var newChildren = [], holder = new Tag;
      holder.nodeName = holder.tagName = "p";
      for(i = 0;i < childNodes.length;i++) {
        c = childNodes[i];
        if(c.nodeType === 3 || c.nodeType === 1 && pDtd[c.nodeName]) {
          holder.appendChild(c)
        }else {
          if(holder.childNodes.length) {
            newChildren.push(holder);
            holder = holder.clone()
          }
          newChildren.push(c)
        }
      }
      if(holder.childNodes.length) {
        newChildren.push(holder)
      }
      doc.empty();
      for(i = 0;i < newChildren.length;i++) {
        doc.appendChild(newChildren[i])
      }
    }
  }
  function findTagWithName(root, tagName, level) {
    if(level === 0) {
      return 0
    }
    if(typeof level === "number") {
      level--
    }
    var r, childNodes = root.childNodes;
    if(childNodes) {
      for(var i = 0;i < childNodes.length;i++) {
        if(childNodes[i].tagName === tagName) {
          return childNodes[i]
        }
        if(r = findTagWithName(childNodes[i], tagName, level)) {
          return r
        }
      }
    }
    return 0
  }
  function postProcess(doc) {
    var childNodes = [].concat(doc.childNodes);
    for(var i = 0;i < childNodes.length;i++) {
      if(childNodes[i].nodeName === "html") {
        var html = childNodes[i];
        for(var j = 0;j < i;j++) {
          if(childNodes[j].nodeType === 3 && !S.trim(childNodes[j].toHtml())) {
            doc.removeChild(childNodes[j])
          }
        }
        while(html.firstChild && html.firstChild.nodeType === 3 && !S.trim(html.firstChild.toHtml())) {
          html.removeChild(html.firstChild)
        }
        break
      }
    }
  }
  return Parser
});
KISSY.add("html-parser/writer/basic", ["../utils"], function(S, require) {
  var Utils = require("../utils");
  var isBooleanAttribute = Utils.isBooleanAttribute;
  function escapeAttrValue(str) {
    return String(str).replace(/'/g, "&quot;")
  }
  function BasicWriter() {
    this.output = []
  }
  BasicWriter.prototype = {constructor:BasicWriter, append:function() {
    var o = this.output, args = arguments, arg;
    for(var i = 0;i < args.length;i++) {
      arg = args[i];
      if(arg.length > 1) {
        for(var j = 0;j < arg.length;j++) {
          o.push(arg.charAt(j))
        }
      }else {
        o.push(arg)
      }
    }
    return this
  }, openTag:function(el) {
    this.append("<", el.tagName)
  }, openTagClose:function(el) {
    if(el.isSelfClosed) {
      this.append(" ", "/")
    }
    this.append(">")
  }, closeTag:function(el) {
    this.append("</", el.tagName, ">")
  }, attribute:function(attr) {
    var value = attr.value || "", name = attr.name;
    if(isBooleanAttribute(name) && !value) {
      value = name
    }
    this.append(" ", name, '="', escapeAttrValue(value), '"')
  }, text:function(text) {
    this.append(text)
  }, cdata:function(cdata) {
    this.append(cdata)
  }, comment:function(comment) {
    this.append("<!--" + comment + "--\>")
  }, getHtml:function() {
    return this.output.join("")
  }};
  return BasicWriter
});
KISSY.add("html-parser/writer/beautify", ["./basic", "../dtd", "../utils"], function(S, require) {
  var BasicWriter = require("./basic");
  var dtd = require("../dtd");
  var Utils = require("../utils");
  function BeautifyWriter() {
    var self = this;
    BeautifyWriter.superclass.constructor.apply(self, arguments);
    self.inPre = 0;
    self.indentChar = "\t";
    self.indentLevel = 0;
    self.allowIndent = 0;
    self.rules = {};
    var beauty = S.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {select:1, script:1, style:1});
    for(var e in beauty) {
      self.setRules(e, {allowIndent:1, breakBeforeOpen:1, breakAfterOpen:1, breakBeforeClose:1, breakAfterClose:1})
    }
    S.each(["p", "h1", "h2", "h3", "h4", "h5", "h6"], function(e) {
      self.setRules(e, {allowIndent:0, breakAfterOpen:0, breakBeforeClose:0})
    });
    self.setRules("option", {breakBeforeOpen:1});
    self.setRules("optiongroup", {breakBeforeOpen:1});
    self.setRules("br", {breakAfterOpen:1});
    self.setRules("title", {allowIndent:0, breakBeforeClose:0, breakAfterOpen:0});
    self.setRules("pre", {breakAfterOpen:1, allowIndent:0})
  }
  S.extend(BeautifyWriter, BasicWriter, {indentation:function() {
    if(!this.inPre) {
      this.append((new Array(this.indentLevel + 1)).join(this.indentChar))
    }
    this.allowIndent = 0
  }, lineBreak:function() {
    var o = this.output;
    if(!this.inPre && o.length) {
      for(var j = o.length - 1;j >= 0;j--) {
        if(!/[\r\n\t ]/.test(o[j])) {
          break
        }
      }
      o.length = j + 1;
      this.append("\n")
    }
    this.allowIndent = 1
  }, setRules:function(tagName, rule) {
    if(!this.rules[tagName]) {
      this.rules[tagName] = {}
    }
    S.mix(this.rules[tagName], rule)
  }, openTag:function(el) {
    var tagName = el.tagName, rules = this.rules[tagName] || {};
    if(this.allowIndent) {
      this.indentation()
    }else {
      if(rules.breakBeforeOpen) {
        this.lineBreak();
        this.indentation()
      }
    }
    BeautifyWriter.superclass.openTag.apply(this, arguments)
  }, openTagClose:function(el) {
    var tagName = el.tagName;
    var rules = this.rules[tagName] || {};
    if(el.isSelfClosed) {
      this.append(" />")
    }else {
      this.append(">");
      if(rules.allowIndent) {
        this.indentLevel++
      }
    }
    if(rules.breakAfterOpen) {
      this.lineBreak()
    }
    if(tagName === "pre") {
      this.inPre = 1
    }
  }, closeTag:function(el) {
    var self = this, tagName = el.tagName, rules = self.rules[tagName] || {};
    if(rules.allowIndent) {
      self.indentLevel--
    }
    if(self.allowIndent) {
      self.indentation()
    }else {
      if(rules.breakBeforeClose) {
        self.lineBreak();
        self.indentation()
      }
    }
    BeautifyWriter.superclass.closeTag.apply(self, arguments);
    if(tagName === "pre") {
      self.inPre = 0
    }
    if(rules.breakAfterClose) {
      self.lineBreak()
    }
  }, text:function(text) {
    if(this.allowIndent) {
      this.indentation()
    }
    if(!this.inPre) {
      text = Utils.collapseWhitespace(text)
    }
    this.append(text)
  }, comment:function(comment) {
    if(this.allowIndent) {
      this.indentation()
    }
    this.append("<!--" + comment + "--\>")
  }, cdata:function(text) {
    if(this.allowIndent) {
      this.indentation()
    }
    this.append(S.trim(text))
  }});
  return BeautifyWriter
});
KISSY.add("html-parser/writer/minify", ["./basic", "../utils"], function(S, require) {
  var BasicWriter = require("./basic");
  var Utils = require("../utils");
  var trim = S.trim, isBooleanAttribute = Utils.isBooleanAttribute, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp("^(?:class|id|style|title|lang|dir|on" + "(?:focus|blur|change|click|dblclick|mouse(" + "?:down|up|over|move|out)|key(?:press|down|up)))$");
  function escapeAttrValue(str) {
    return String(str).replace(/"/g, "&quot;")
  }
  function canDeleteEmptyAttribute(tag, attr) {
    var attrValue = attr.value || "", attrName = attr.name;
    if(!trim(attrValue)) {
      return tag === "input" && attrName === "value" || reEmptyAttribute.test(attrName)
    }
    return 0
  }
  function canRemoveAttributeQuotes(value) {
    return!/[ "'=<>`]/.test(value)
  }
  function isAttributeRedundant(el, attr) {
    var tag = el.nodeName, attrName = attr.name, attrValue = attr.value || "";
    attrValue = trim(attrValue.toLowerCase());
    return tag === "script" && attrName === "language" && attrValue === "javascript" || tag === "form" && attrName === "method" && attrValue === "get" || tag === "input" && attrName === "type" && attrValue === "text" || tag === "script" && attrName === "type" && attrValue === "text/javascript" || tag === "style" && attrName === "type" && attrValue === "text/css" || tag === "area" && attrName === "shape" && attrValue === "rect"
  }
  function isConditionalComment(text) {
    return/\[if[^\]]+\]/.test(text)
  }
  function isEventAttribute(attrName) {
    return/^on[a-z]+/.test(attrName)
  }
  function isUriTypeAttribute(attrName, tag) {
    return/^(?:a|area|link|base)$/.test(tag) && attrName === "href" || tag === "img" && /^(?:src|longdesc|usemap)$/.test(attrName) || tag === "object" && /^(?:classid|codebase|data|usemap)$/.test(attrName) || tag === "q" && attrName === "cite" || tag === "blockquote" && attrName === "cite" || (tag === "ins" || tag === "del") && attrName === "cite" || tag === "form" && attrName === "action" || tag === "input" && (attrName === "src" || attrName === "usemap") || tag === "head" && attrName === "profile" || 
    tag === "script" && (attrName === "src" || attrName === "for")
  }
  function isNumberTypeAttribute(attrName, tag) {
    return/^(?:a|area|object|button)$/.test(tag) && attrName === "tabindex" || tag === "input" && (attrName === "maxlength" || attrName === "tabindex") || tag === "select" && (attrName === "size" || attrName === "tabindex") || tag === "textarea" && /^(?:rows|cols|tabindex)$/.test(attrName) || tag === "colgroup" && attrName === "span" || tag === "col" && attrName === "span" || (tag === "th" || tag === "td") && (attrName === "rowspan" || attrName === "colspan")
  }
  function cleanAttributeValue(el, attr) {
    var tag = el.nodeName, attrName = attr.name, attrValue = attr.value || "";
    if(isEventAttribute(attrName)) {
      attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, "").replace(/[\s\xa0]*;$/, "")
    }else {
      if(attrName === "class") {
        attrValue = collapseWhitespace(trim(attrValue))
      }else {
        if(isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)) {
          attrValue = trim(attrValue)
        }else {
          if(attrName === "style") {
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, "")
          }
        }
      }
    }
    return attrValue
  }
  function cleanConditionalComment(comment) {
    return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, "$1").replace(/[\s\xa0]*(<!\[endif\])$/, "$1")
  }
  function removeCDATASections(text) {
    return trim(text).replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, "").replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, "")
  }
  function MinifyWriter() {
    var self = this;
    MinifyWriter.superclass.constructor.apply(self, arguments);
    self.inPre = 0
  }
  S.extend(MinifyWriter, BasicWriter, {comment:function(text) {
    if(isConditionalComment(text)) {
      text = cleanConditionalComment(text);
      MinifyWriter.superclass.comment.call(this, text)
    }
  }, openTag:function(el) {
    var self = this;
    if(el.tagName === "pre") {
      self.inPre = 1
    }
    MinifyWriter.superclass.openTag.apply(self, arguments)
  }, closeTag:function(el) {
    var self = this;
    if(el.tagName === "pre") {
      self.inPre = 0
    }
    MinifyWriter.superclass.closeTag.apply(self, arguments)
  }, cdata:function(cdata) {
    cdata = removeCDATASections(cdata);
    MinifyWriter.superclass.cdata.call(this, cdata)
  }, attribute:function(attr, el) {
    var self = this, name = attr.name, normalizedValue, value = attr.value || "";
    if(canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr)) {
      return
    }
    if(isBooleanAttribute(name)) {
      self.append(" ", name);
      return
    }
    normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
    if(!(value && canRemoveAttributeQuotes(value))) {
      normalizedValue = '"' + normalizedValue + '"'
    }
    self.append(" ", name, "=", normalizedValue)
  }, text:function(text) {
    var self = this;
    if(!self.inPre) {
      text = collapseWhitespace(text)
    }
    self.append(text)
  }});
  return MinifyWriter
});
KISSY.add("html-parser/writer/filter", [], function(S) {
  function Filter() {
    this.tagNames = [];
    this.attributeNames = [];
    this.tags = [];
    this.comment = [];
    this.text = [];
    this.cdata = [];
    this.attributes = [];
    this.root = []
  }
  function findIndexToInsert(arr, p) {
    for(var i = 0;arr && i < arr.length;i++) {
      if(arr[i].priority > p) {
        return i
      }
    }
    return arr.length
  }
  function filterName(arr, v) {
    for(var i = 0;arr && i < arr.length;i++) {
      var items = arr[i].value;
      S.each(items, function(item) {
        v = v.replace(item[0], item[1])
      })
    }
    return v
  }
  function filterFn(arr, args, el) {
    var item, i, ret;
    for(i = 0;arr && i < arr.length;i++) {
      item = arr[i].value;
      if((ret = item.apply(null, args)) === false) {
        return false
      }
      if(el && ret && ret !== el) {
        if(typeof ret === "string") {
          if(el.toHtml() === ret) {
            return el
          }
          el.nodeValue = ret;
          ret = el
        }
        return this.onNode(ret)
      }
    }
    return el
  }
  function filterAttr(arr, attrNode, el, _default) {
    for(var i = 0;arr && i < arr.length;i++) {
      var item = arr[i].value, ret, name = attrNode.name;
      if(item[name] && (ret = item[name].call(null, attrNode.value, el)) === false) {
        return ret
      }
      if(typeof ret === "string") {
        attrNode.value = ret
      }
    }
    return _default
  }
  Filter.prototype = {constructor:Filter, addRules:function(rules, priority) {
    priority = priority || 10;
    for(var r in rules) {
      var holder = this[r];
      if(holder) {
        var index = findIndexToInsert(holder, priority);
        holder.splice(index, 0, {value:rules[r], priority:priority})
      }
    }
  }, onTagName:function(v) {
    return filterName(this.tagNames, v)
  }, onAttributeName:function(v) {
    return filterName(this.attributeNames, v)
  }, onText:function(el) {
    return filterFn.call(this, this.text, [el.toHtml(), el], el)
  }, onCData:function(el) {
    return filterFn.call(this, this.cdata, [el.toHtml(), el], el)
  }, onAttribute:function(attrNode, el) {
    return filterAttr(this.attributes, attrNode, el, attrNode)
  }, onComment:function(el) {
    return filterFn.call(this, this.comment, [el.toHtml(), el], el)
  }, onNode:function(el) {
    var t = el.nodeType;
    if(t === 1) {
      return this.onTag(el)
    }else {
      if(t === 3) {
        return this.onText(el)
      }else {
        if(t === 8) {
          return this.onComment(el)
        }
      }
    }
  }, onFragment:function(el) {
    return filterFn.call(this, this.root, [el], el)
  }, onTag:function(el) {
    var filters = ["^", el.tagName, "$"], tags = this.tags, ret;
    for(var i = 0;i < filters.length;i++) {
      var filter = filters[i];
      for(var j = 0;j < tags.length;j++) {
        var element = tags[j].value;
        if(element[filter]) {
          if((ret = element[filter](el)) === false) {
            return false
          }
          if(ret && ret !== el) {
            return this.onNode(ret)
          }
          if(!el.tagName) {
            return el
          }
        }
      }
    }
    return el
  }};
  return Filter
});
KISSY.add("html-parser", ["html-parser/dtd", "html-parser/lexer/lexer", "html-parser/parser", "html-parser/writer/basic", "html-parser/writer/beautify", "html-parser/writer/minify", "html-parser/writer/filter", "html-parser/nodes/cdata", "html-parser/nodes/comment", "html-parser/nodes/node", "html-parser/nodes/tag", "html-parser/nodes/text"], function(S, require) {
  var DTD = require("html-parser/dtd");
  var Lexer = require("html-parser/lexer/lexer");
  var Parser = require("html-parser/parser");
  var BasicWriter = require("html-parser/writer/basic");
  var BeautifyWriter = require("html-parser/writer/beautify");
  var MinifyWriter = require("html-parser/writer/minify");
  var Filter = require("html-parser/writer/filter");
  var CData = require("html-parser/nodes/cdata");
  var Comment = require("html-parser/nodes/comment");
  var Node = require("html-parser/nodes/node");
  var Tag = require("html-parser/nodes/tag");
  var Text = require("html-parser/nodes/text");
  return{CData:CData, Comment:Comment, Node:Node, Tag:Tag, Text:Text, Lexer:Lexer, Parser:Parser, BasicWriter:BasicWriter, BeautifyWriter:BeautifyWriter, MinifyWriter:MinifyWriter, Filter:Filter, DTD:DTD, serialize:function(n, filter) {
    var basicWriter = new BasicWriter;
    n.writeHtml(basicWriter, filter);
    return basicWriter.getHtml()
  }, parse:function(html) {
    return(new Parser(html)).parse()
  }}
});

