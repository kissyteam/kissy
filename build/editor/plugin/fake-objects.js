/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:09
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/fake-objects
*/

KISSY.add("editor/plugin/fake-objects", ["editor", "html-parser"], function(S, require) {
  var Editor = require("editor");
  var HtmlParser = require("html-parser");
  var Node = S.Node, Dom = S.DOM, Utils = Editor.Utils, SPACER_GIF = Utils.debugUrl("theme/spacer.gif");
  Editor.addMembers({createFakeElement:function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
    var style = realElement.attr("style") || "";
    if(realElement.attr("width")) {
      style = "width:" + realElement.attr("width") + "px;" + style
    }
    if(realElement.attr("height")) {
      style = "height:" + realElement.attr("height") + "px;" + style
    }
    var self = this, existClass = S.trim(realElement.attr("class")), attributes = {"class":className + " " + existClass, src:SPACER_GIF, _keRealElement:encodeURIComponent(outerHTML || realElement.outerHtml()), _keRealNodeType:realElement[0].nodeType, style:style};
    if(attrs) {
      delete attrs.width;
      delete attrs.height;
      S.mix(attributes, attrs, false)
    }
    if(realElementType) {
      attributes._keRealElementType = realElementType
    }
    if(isResizable) {
      attributes._keResizable = isResizable
    }
    return new Node("<img/>", attributes, self.get("document")[0])
  }, restoreRealElement:function(fakeElement) {
    if(fakeElement.attr("_keRealNodeType") !== Dom.NodeType.ELEMENT_NODE) {
      return null
    }
    var html = S.urlDecode(fakeElement.attr("_keRealElement"));
    var temp = new Node("<div>", null, this.get("document")[0]);
    temp.html(html);
    return temp.first().remove()
  }});
  var htmlFilterRules = {tags:{$:function(element) {
    var realHTML = element.getAttribute("_keRealElement");
    var realFragment;
    if(realHTML) {
      realFragment = (new HtmlParser.Parser(S.urlDecode(realHTML))).parse()
    }
    var realElement = realFragment && realFragment.childNodes[0];
    if(realElement) {
      var style = element.getAttribute("style");
      if(style) {
        var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style), width = match && match[1];
        match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
        var height = match && match[1];
        if(width) {
          realElement.setAttribute("width", width)
        }
        if(height) {
          realElement.setAttribute("height", height)
        }
      }
      return realElement
    }
  }}};
  return{init:function(editor) {
    var dataProcessor = editor.htmlDataProcessor, htmlFilter = dataProcessor && dataProcessor.htmlFilter;
    if(dataProcessor.createFakeParserElement) {
      return
    }
    if(htmlFilter) {
      htmlFilter.addRules(htmlFilterRules)
    }
    S.mix(dataProcessor, {restoreRealElement:function(fakeElement) {
      if(fakeElement.attr("_keRealNodeType") !== Dom.NodeType.ELEMENT_NODE) {
        return null
      }
      var html = S.urlDecode(fakeElement.attr("_keRealElement"));
      var temp = new Node("<div>", null, editor.get("document")[0]);
      temp.html(html);
      return temp.first().remove()
    }, createFakeParserElement:function(realElement, className, realElementType, isResizable, attrs) {
      var html = HtmlParser.serialize(realElement);
      var style = realElement.getAttribute("style") || "";
      if(realElement.getAttribute("width")) {
        style = "width:" + realElement.getAttribute("width") + "px;" + style
      }
      if(realElement.getAttribute("height")) {
        style = "height:" + realElement.getAttribute("height") + "px;" + style
      }
      var existClass = S.trim(realElement.getAttribute("class")), attributes = {"class":className + " " + existClass, src:SPACER_GIF, _keRealElement:encodeURIComponent(html), _keRealNodeType:realElement.nodeType + "", style:style, align:realElement.getAttribute("align") || ""};
      if(attrs) {
        delete attrs.width;
        delete attrs.height;
        S.mix(attributes, attrs, false)
      }
      if(realElementType) {
        attributes._keRealElementType = realElementType
      }
      if(isResizable) {
        attributes._keResizable = "_keResizable"
      }
      return new HtmlParser.Tag("img", attributes)
    }})
  }}
});

