/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:27
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/word-filter
*/

KISSY.add("editor/plugin/word-filter", ["html-parser"], function(S, require) {
  var HtmlParser = require("html-parser");
  var $ = S.all, UA = S.UA, dtd = HtmlParser.DTD, wordFilter = new HtmlParser.Filter, cssLengthRelativeUnit = /^([.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz){1}?/i, emptyMarginRegex = /^(?:\b0[^\s]*\s*){1,4}$/, romanLiteralPattern = "^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$", lowerRomanLiteralRegex = new RegExp(romanLiteralPattern), upperRomanLiteralRegex = new RegExp(romanLiteralPattern.toUpperCase()), orderedPatterns = {decimal:/\d+/, "lower-roman":lowerRomanLiteralRegex, 
  "upper-roman":upperRomanLiteralRegex, "lower-alpha":/^[a-z]+$/, "upper-alpha":/^[A-Z]+$/}, unorderedPatterns = {disc:/[l\u00B7\u2002]/, circle:/[\u006F\u00D8]/, square:/[\u006E\u25C6]/}, listMarkerPatterns = {ol:orderedPatterns, ul:unorderedPatterns}, romans = [[1E3, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]], alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function fromRoman(str) {
    str = str.toUpperCase();
    var l = romans.length, retVal = 0;
    for(var i = 0;i < l;++i) {
      for(var j = romans[i], k = j[1].length;str.substr(0, k) === j[1];str = str.substr(k)) {
        retVal += j[0]
      }
    }
    return retVal
  }
  function fromAlphabet(str) {
    str = str.toUpperCase();
    var l = alphabets.length, retVal = 1;
    for(var x = 1;str.length > 0;x *= l) {
      retVal += alphabets.indexOf(str.charAt(str.length - 1)) * x;
      str = str.substr(0, str.length - 1)
    }
    return retVal
  }
  function setStyle(element, str) {
    if(str) {
      element.setAttribute("style", str)
    }else {
      element.removeAttribute("style")
    }
  }
  var convertToPx = function() {
    var calculator;
    return function(cssLength) {
      if(!calculator) {
        calculator = $('<div style="position:absolute;left:-9999px;' + 'top:-9999px;margin:0px;padding:0px;border:0px;"' + "></div>").prependTo("body")
      }
      if(!/%$/.test(cssLength)) {
        calculator.css("width", cssLength);
        return calculator[0].clientWidth
      }
      return cssLength
    }
  }();
  var listBaseIndent = 0, previousListItemMargin = null, previousListId;
  function onlyChild(elem) {
    var childNodes = elem.childNodes || [], count = childNodes.length, firstChild = count === 1 && childNodes[0];
    return firstChild || null
  }
  function removeAnyChildWithName(elem, tagName) {
    var children = elem.childNodes || [], ret = [], child;
    for(var i = 0;i < children.length;i++) {
      child = children[i];
      if(!child.nodeName) {
        continue
      }
      if(child.nodeName === tagName) {
        ret.push(child);
        children.splice(i--, 1)
      }
      ret = ret.concat(removeAnyChildWithName(child, tagName))
    }
    return ret
  }
  function getAncestor(elem, tagNameRegex) {
    var parent = elem.parentNode;
    while(parent && !(parent.nodeName && parent.nodeName.match(tagNameRegex))) {
      parent = parent.parentNode
    }
    return parent
  }
  function firstChild(elem, evaluator) {
    var child, i, children = elem.childNodes || [];
    for(i = 0;i < children.length;i++) {
      child = children[i];
      if(evaluator(child)) {
        return child
      }else {
        if(child.nodeName) {
          child = firstChild(child, evaluator);
          if(child) {
            return child
          }
        }
      }
    }
    return null
  }
  function addStyle(elem, name, value, isPrepend) {
    var styleText, addingStyleText = "", style;
    if(typeof value === "string") {
      addingStyleText += name + ":" + value + ";"
    }else {
      if(typeof name === "object") {
        for(style in name) {
          addingStyleText += style + ":" + name[style] + ";"
        }
      }else {
        addingStyleText += name
      }
      isPrepend = value
    }
    styleText = elem.getAttribute("style");
    styleText = (isPrepend ? [addingStyleText, styleText] : [styleText, addingStyleText]).join(";");
    setStyle(elem, styleText.replace(/^;|;(?=;)/, ""))
  }
  function parentOf(tagName) {
    var result = {}, tag;
    for(tag in dtd) {
      if(tag.indexOf("$") === -1 && dtd[tag][tagName]) {
        result[tag] = 1
      }
    }
    return result
  }
  var filters = {flattenList:function(element, level) {
    level = typeof level === "number" ? level : 1;
    var listStyleType;
    switch(element.getAttribute("type")) {
      case "a":
        listStyleType = "lower-alpha";
        break;
      case "1":
        listStyleType = "decimal";
        break
    }
    var children = element.childNodes || [], child;
    for(var i = 0;i < children.length;i++) {
      child = children[i];
      if(child.nodeName in dtd.$listItem) {
        var listItemChildren = child.childNodes || [], count = listItemChildren.length, last = listItemChildren[count - 1];
        if(last.nodeName in dtd.$list) {
          element.insertAfter(child);
          if(!--listItemChildren.length) {
            element.removeChild(children[i--])
          }
        }
        child.setTagName("ke:li");
        if(element.getAttribute("start") && !i) {
          element.setAttribute("value", element.getAttribute("start"))
        }
        filters.stylesFilter([["tab-stops", null, function(val) {
          var margin = val.split(" ")[1].match(cssLengthRelativeUnit);
          if(margin) {
            previousListItemMargin = convertToPx(margin[0])
          }
        }], level === 1 ? ["mso-list", null, function(val) {
          val = val.split(" ");
          var listId = Number(val[0].match(/\d+/));
          if(listId !== previousListId) {
            child.setAttribute("ke:reset", 1)
          }
          previousListId = listId
        }] : null])(child.getAttribute("style"));
        child.setAttribute("ke:indent", level);
        child.setAttribute("ke:listtype", element.nodeName);
        child.setAttribute("ke:list-style-type", listStyleType)
      }else {
        if(child.nodeName in dtd.$list) {
          arguments.callee.apply(this, [child, level + 1]);
          children = children.slice(0, i).concat(child.childNodes).concat(children.slice(i + 1));
          element.empty();
          for(var j = 0, num = children.length;j < num;j++) {
            element.appendChild(children[j])
          }
        }
      }
    }
    element.nodeName = element.tagName = null;
    element.setAttribute("ke:list", 1)
  }, assembleList:function(element) {
    var children = element.childNodes || [], child, listItem, listItemIndent, lastIndent, lastListItem, list, openedLists = [], previousListStyleType, previousListType;
    var bullet, listType, listStyleType, itemNumeric;
    for(var i = 0;i < children.length;i++) {
      child = children[i];
      if("ke:li" === child.nodeName) {
        child.setTagName("li");
        listItem = child;
        bullet = listItem.getAttribute("ke:listsymbol");
        bullet = bullet && bullet.match(/^(?:[(]?)([^\s]+?)([.)]?)$/);
        listType = listStyleType = itemNumeric = null;
        if(listItem.getAttribute("ke:ignored")) {
          children.splice(i--, 1);
          continue
        }
        if(listItem.getAttribute("ke:reset")) {
          list = lastIndent = lastListItem = null
        }
        listItemIndent = Number(listItem.getAttribute("ke:indent"));
        if(listItemIndent !== lastIndent) {
          previousListType = previousListStyleType = null
        }
        if(!bullet) {
          listType = listItem.getAttribute("ke:listtype") || "ol";
          listStyleType = listItem.getAttribute("ke:list-style-type")
        }else {
          if(previousListType && listMarkerPatterns[previousListType][previousListStyleType].test(bullet[1])) {
            listType = previousListType;
            listStyleType = previousListStyleType
          }else {
            for(var type in listMarkerPatterns) {
              for(var style in listMarkerPatterns[type]) {
                if(listMarkerPatterns[type][style].test(bullet[1])) {
                  if(type === "ol" && /alpha|roman/.test(style)) {
                    var num = /roman/.test(style) ? fromRoman(bullet[1]) : fromAlphabet(bullet[1]);
                    if(!itemNumeric || num < itemNumeric) {
                      itemNumeric = num;
                      listType = type;
                      listStyleType = style
                    }
                  }else {
                    listType = type;
                    listStyleType = style;
                    break
                  }
                }
              }
            }
          }
          if(!listType) {
            listType = bullet[2] ? "ol" : "ul"
          }
        }
        previousListType = listType;
        previousListStyleType = listStyleType || (listType === "ol" ? "decimal" : "disc");
        if(listStyleType && listStyleType !== (listType === "ol" ? "decimal" : "disc")) {
          addStyle(listItem, "list-style-type", listStyleType)
        }
        if(listType === "ol" && bullet) {
          switch(listStyleType) {
            case "decimal":
              itemNumeric = Number(bullet[1]);
              break;
            case "lower-roman":
            ;
            case "upper-roman":
              itemNumeric = fromRoman(bullet[1]);
              break;
            case "lower-alpha":
            ;
            case "upper-alpha":
              itemNumeric = fromAlphabet(bullet[1]);
              break
          }
          listItem.setAttribute("value", itemNumeric)
        }
        if(!list) {
          openedLists.push(list = new HtmlParser.Tag(listType));
          list.appendChild(listItem);
          element.replaceChild(list, children[i])
        }else {
          if(listItemIndent > lastIndent) {
            openedLists.push(list = new HtmlParser.Tag(listType));
            list.appendChild(listItem);
            lastListItem.appendChild(list)
          }else {
            if(listItemIndent < lastIndent) {
              var diff = lastIndent - listItemIndent, parent;
              while(diff-- && (parent = list.parentNode)) {
                list = parent.parentNode
              }
              list.appendChild(listItem)
            }else {
              list.appendChild(listItem)
            }
          }
          children.splice(i--, 1)
        }
        lastListItem = listItem;
        lastIndent = listItemIndent
      }else {
        if(list && !(child.nodeType === 3 && !S.trim(child.nodeValue))) {
          list = lastIndent = lastListItem = null
        }
      }
    }
    for(i = 0;i < openedLists.length;i++) {
      postProcessList(openedLists[i])
    }
  }, falsyFilter:function() {
    return false
  }, stylesFilter:function(styles, whitelist) {
    return function(styleText, element) {
      var rules = [];
      (styleText || "").replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
        name = name.toLowerCase();
        if(name === "font-family") {
          value = value.replace(/['']/g, "")
        }
        var namePattern, valuePattern, newValue, newName;
        for(var i = 0;i < styles.length;i++) {
          if(styles[i]) {
            namePattern = styles[i][0];
            valuePattern = styles[i][1];
            newValue = styles[i][2];
            newName = styles[i][3];
            if(name.match(namePattern) && (!valuePattern || value.match(valuePattern))) {
              name = newName || name;
              if(whitelist) {
                newValue = newValue || value
              }
              if(typeof newValue === "function") {
                newValue = newValue(value, element, name)
              }
              if(newValue && newValue.push) {
                name = newValue[0];
                newValue = newValue[1]
              }
              if(typeof newValue === "string") {
                rules.push([name, newValue])
              }
              return
            }
          }
        }
        if(!whitelist) {
          rules.push([name, value])
        }
      });
      for(var i = 0;i < rules.length;i++) {
        rules[i] = rules[i].join(":")
      }
      return rules.length ? rules.join(";") + ";" : false
    }
  }, applyStyleFilter:null};
  function postProcessList(list) {
    var children = list.childNodes || [], child, count = children.length, match, mergeStyle, styleTypeRegexp = /list-style-type:(.*?)(?:;|$)/, stylesFilter = filters.stylesFilter;
    if(styleTypeRegexp.exec(list.getAttribute("style"))) {
      return
    }
    for(var i = 0;i < count;i++) {
      child = children[i];
      if(child.getAttribute("value") && Number(child.getAttribute("value")) === i + 1) {
        child.removeAttribute("value")
      }
      match = styleTypeRegexp.exec(child.getAttribute("style"));
      if(match) {
        if(match[1] === mergeStyle || !mergeStyle) {
          mergeStyle = match[1]
        }else {
          mergeStyle = null;
          break
        }
      }
    }
    if(mergeStyle) {
      for(i = 0;i < count;i++) {
        var style = children[i].getAttribute("style");
        if(style) {
          style = stylesFilter([["list-style-type"]])(style);
          setStyle(children[i], style)
        }
      }
      addStyle(list, "list-style-type", mergeStyle)
    }
  }
  var utils = {createListBulletMarker:function(bullet, bulletText) {
    var marker = new HtmlParser.Tag("ke:listbullet");
    marker.setAttribute("ke:listsymbol", bullet[0]);
    marker.appendChild(new HtmlParser.Text(bulletText));
    return marker
  }, isListBulletIndicator:function(element) {
    var styleText = element.getAttribute("style");
    if(/mso-list\s*:\s*Ignore/i.test(styleText)) {
      return true
    }
  }, isContainingOnlySpaces:function(element) {
    var text;
    return(text = onlyChild(element)) && /^(:?\s|&nbsp;)+$/.test(text.nodeValue)
  }, resolveList:function(element) {
    var listMarker;
    if((listMarker = removeAnyChildWithName(element, "ke:listbullet")) && listMarker.length && (listMarker = listMarker[0])) {
      element.setTagName("ke:li");
      if(element.getAttribute("style")) {
        var styleStr = filters.stylesFilter([["text-indent"], ["line-height"], [/^margin(:?-left)?$/, null, function(margin) {
          var values = margin.split(" ");
          margin = convertToPx(values[3] || values[1] || values[0]);
          if(!listBaseIndent && previousListItemMargin !== null && margin > previousListItemMargin) {
            listBaseIndent = margin - previousListItemMargin
          }
          previousListItemMargin = margin;
          if(listBaseIndent) {
            element.setAttribute("ke:indent", listBaseIndent && Math.ceil(margin / listBaseIndent) + 1 || 1)
          }
        }], [/^mso-list$/, null, function(val) {
          val = val.split(" ");
          var listId = Number(val[0].match(/\d+/)), indent = Number(val[1].match(/\d+/));
          if(indent === 1) {
            if(listId !== previousListId) {
              element.setAttribute("ke:reset", 1)
            }
            previousListId = listId
          }
          element.setAttribute("ke:indent", indent)
        }]])(element.getAttribute("style"), element);
        setStyle(element, styleStr)
      }
      if(!element.getAttribute("ke:indent")) {
        previousListItemMargin = 0;
        element.setAttribute("ke:indent", 1)
      }
      S.each(listMarker.attributes, function(a) {
        element.setAttribute(a.name, a.value)
      });
      return true
    }else {
      previousListId = previousListItemMargin = listBaseIndent = null
    }
    return false
  }, getStyleComponents:function() {
    var calculator = $('<div style="position:absolute;left:-9999px;top:-9999px;"></div>').prependTo("body");
    return function(name, styleValue, fetchList) {
      calculator.css(name, styleValue);
      var styles = {}, count = fetchList.length;
      for(var i = 0;i < count;i++) {
        styles[fetchList[i]] = calculator.css(fetchList[i])
      }
      return styles
    }
  }(), listDtdParents:parentOf("ol")};
  (function() {
    var blockLike = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), falsyFilter = filters.falsyFilter, stylesFilter = filters.stylesFilter, createListBulletMarker = utils.createListBulletMarker, flattenList = filters.flattenList, assembleList = filters.assembleList, isListBulletIndicator = utils.isListBulletIndicator, containsNothingButSpaces = utils.isContainingOnlySpaces, resolveListItem = utils.resolveList, convertToPxStr = function(value) {
      value = convertToPx(value);
      return isNaN(value) ? value : value + "px"
    }, getStyleComponents = utils.getStyleComponents, listDtdParents = utils.listDtdParents;
    wordFilter.addRules({tagNames:[[/meta|link|script/, ""]], root:function(element) {
      element.filterChildren();
      assembleList(element)
    }, tags:{"^":function(element) {
      var applyStyleFilter;
      if(UA.gecko && (applyStyleFilter = filters.applyStyleFilter)) {
        applyStyleFilter(element)
      }
    }, $:function(element) {
      var tagName = element.nodeName || "";
      if(tagName in blockLike && element.getAttribute("style")) {
        setStyle(element, stylesFilter([[/^(:?width|height)$/, null, convertToPxStr]])(element.getAttribute("style")))
      }
      if(tagName.match(/h\d/)) {
        element.filterChildren();
        if(resolveListItem(element)) {
          return
        }
      }else {
        if(tagName in dtd.$inline) {
          element.filterChildren();
          if(containsNothingButSpaces(element)) {
            element.setTagName(null)
          }
        }else {
          if(tagName.indexOf(":") !== -1 && tagName.indexOf("ke") === -1) {
            element.filterChildren();
            if(tagName === "v:imagedata") {
              var href = element.getAttribute("o:href");
              if(href) {
                element.setAttribute("src", href)
              }
              element.setTagName("img");
              return
            }
            element.setTagName(null)
          }
        }
      }
      if(tagName in listDtdParents) {
        element.filterChildren();
        assembleList(element)
      }
    }, style:function(element) {
      if(UA.gecko) {
        var styleDefSection = onlyChild(element).nodeValue.match(/\/\* Style Definitions \*\/([\s\S]*?)\/\*/), styleDefText = styleDefSection && styleDefSection[1], rules = {};
        if(styleDefText) {
          styleDefText.replace(/[\n\r]/g, "").replace(/(.+?)\{(.+?)\}/g, function(rule, selectors, styleBlock) {
            selectors = selectors.split(",");
            var length = selectors.length;
            for(var i = 0;i < length;i++) {
              S.trim(selectors[i]).replace(/^(\w+)(\.[\w-]+)?$/g, function(match, tagName, className) {
                tagName = tagName || "*";
                className = className.substring(1, className.length);
                if(className.match(/MsoNormal/)) {
                  return
                }
                if(!rules[tagName]) {
                  rules[tagName] = {}
                }
                if(className) {
                  rules[tagName][className] = styleBlock
                }else {
                  rules[tagName] = styleBlock
                }
              })
            }
          });
          filters.applyStyleFilter = function(element) {
            var name = rules["*"] ? "*" : element.nodeName, className = element.getAttribute("class"), style;
            if(name in rules) {
              style = rules[name];
              if(typeof style === "object") {
                style = style[className]
              }
              if(style) {
                addStyle(element, style, true)
              }
            }
          }
        }
      }
      return false
    }, p:function(element) {
      if(/MsoListParagraph/.exec(element.getAttribute("class"))) {
        var bulletText = firstChild(element, function(node) {
          return node.nodeType === 3 && !containsNothingButSpaces(node.parentNode)
        });
        var bullet = bulletText && bulletText.parentNode;
        if(bullet && !bullet.getAttribute("style")) {
          bullet.setAttribute("style", "mso-list: Ignore;")
        }
      }
      element.filterChildren();
      resolveListItem(element)
    }, div:function(element) {
      var singleChild = onlyChild(element);
      if(singleChild && singleChild.nodeName === "table") {
        var attrs = element.attributes;
        S.each(attrs, function(attr) {
          singleChild.setAttribute(attr.name, attr.value)
        });
        if(element.getAttribute("style")) {
          addStyle(singleChild, element.getAttribute("style"))
        }
        var clearFloatDiv = new HtmlParser.Tag("div");
        addStyle(clearFloatDiv, "clear", "both");
        element.appendChild(clearFloatDiv);
        element.setTagName(null)
      }
    }, td:function(element) {
      if(getAncestor(element, "thead")) {
        element.setTagName("th")
      }
    }, ol:flattenList, ul:flattenList, dl:flattenList, font:function(element) {
      if(isListBulletIndicator(element.parentNode)) {
        element.setTagName(null);
        return
      }
      element.filterChildren();
      var styleText = element.getAttribute("style"), parent = element.parentNode;
      if("font" === parent.name) {
        S.each(element.attributes, function(attr) {
          parent.setAttribute(attr.name, attr.value)
        });
        if(styleText) {
          addStyle(parent, styleText)
        }
        element.setTagName(null)
      }else {
        styleText = styleText || "";
        if(element.getAttribute("color")) {
          if(element.getAttribute("color") !== "#000000") {
            styleText += "color:" + element.getAttribute("color") + ";"
          }
          element.removeAttribute("color")
        }
        if(element.getAttribute("face")) {
          styleText += "font-family:" + element.getAttribute("face") + ";";
          element.removeAttribute("face")
        }
        var size = element.getAttribute("size");
        if(size) {
          styleText += "font-size:" + (size > 3 ? "large" : size < 3 ? "small" : "medium") + ";";
          element.removeAttribute("size")
        }
        element.setTagName("span");
        addStyle(element, styleText)
      }
    }, span:function(element) {
      if(isListBulletIndicator(element.parentNode)) {
        return false
      }
      element.filterChildren();
      if(containsNothingButSpaces(element)) {
        element.setTagName(null);
        return null
      }
      if(isListBulletIndicator(element)) {
        var listSymbolNode = firstChild(element, function(node) {
          return node.nodeValue || node.nodeName === "img"
        });
        var listSymbol = listSymbolNode && (listSymbolNode.nodeValue || "l."), listType = listSymbol && listSymbol.match(/^(?:[(]?)([^\s]+?)([.)]?)$/);
        if(listType) {
          var marker = createListBulletMarker(listType, listSymbol);
          var ancestor = getAncestor(element, "span");
          if(ancestor && / mso-hide:\s*all|display:\s*none /.test(ancestor.getAttribute("style"))) {
            marker.setAttribute("ke:ignored", 1)
          }
          return marker
        }
      }
      var styleText = element.getAttribute("style");
      if(styleText) {
        setStyle(element, stylesFilter([[/^line-height$/], [/^font-family$/], [/^font-size$/], [/^color$/], [/^background-color$/]])(styleText, element))
      }
    }, a:function(element) {
      var href;
      if(!(href = element.getAttribute("href")) && element.getAttribute("name")) {
        element.setTagName(null)
      }else {
        if(UA.webkit && href && href.match(/file:\/\/\/[\S]+#/i)) {
          element.setAttribute("href", href.replace(/file:\/\/\/[^#]+/i, ""))
        }
      }
    }, "ke:listbullet":function(element) {
      if(getAncestor(element, /h\d/)) {
        element.setTagName(null)
      }
    }}, attributeNames:[[/^onmouse(:?out|over)/, ""], [/^onload$/, ""], [/(?:v|o):\w+/, ""], [/^lang/, ""]], attributes:{style:stylesFilter([[/^list-style-type$/], [/^margin$|^margin-(?!bottom|top)/, null, function(value, element, name) {
      if(element.nodeName in {p:1, div:1}) {
        var indentStyleName = "margin-left";
        if(name === "margin") {
          value = getStyleComponents(name, value, [indentStyleName])[indentStyleName]
        }else {
          if(name !== indentStyleName) {
            return null
          }
        }
        if(value && !emptyMarginRegex.test(value)) {
          return[indentStyleName, value]
        }
      }
      return null
    }], [/^clear$/], [/^border.*|margin.*|vertical-align|float$/, null, function(value, element) {
      if(element.nodeName === "img") {
        return value
      }
    }], [/^width|height$/, null, function(value, element) {
      if(element.nodeName in {table:1, td:1, th:1, img:1}) {
        return value
      }
    }]], 1), width:function(value, element) {
      if(element.nodeName in dtd.$tableContent) {
        return false
      }
    }, border:function(value, element) {
      if(element.nodeName in dtd.$tableContent) {
        return false
      }
    }, "class":falsyFilter, bgcolor:falsyFilter, valign:function(value, element) {
      addStyle(element, "vertical-align", value);
      return false
    }}, comment:UA.ie ? function(value, node) {
      var imageInfo = value.match(/<img.*?>/), listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);
      if(listInfo) {
        var listSymbol = listInfo[1] || imageInfo && "l.", listType = listSymbol && listSymbol.match(/>(?:[(]?)([^\s]+?)([.)]?)</);
        return createListBulletMarker(listType, listSymbol)
      }
      if(UA.gecko && imageInfo) {
        var img = (new HtmlParser.Parser(imageInfo[0])).parse().childNodes[0], previousComment = node.previousSibling, imgSrcInfo = previousComment && previousComment.toHtml().match(/<v:imagedata[^>]*o:href=[''](.*?)['']/), imgSrc = imgSrcInfo && imgSrcInfo[1];
        if(imgSrc) {
          img.setAttribute("src", imgSrc)
        }
        return img
      }
      return false
    } : falsyFilter})
  })();
  return{toDataFormat:function(html, editor) {
    if(UA.gecko) {
      html = html.replace(/(<!--\[if[^<]*?\])--\>([\S\s]*?)<!--(\[endif\]--\>)/gi, "$1$2$3")
    }
    html = editor.htmlDataProcessor.toDataFormat(html, wordFilter);
    return html
  }}
});

