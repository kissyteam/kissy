/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:19
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 dom/ie/create
 dom/ie/insertion
 dom/ie/style
 dom/ie/traversal
 dom/ie/transform
 dom/ie/input-selection
 dom/ie/attr
 dom/ie
*/

KISSY.add("dom/ie/create", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  Dom._fixCloneAttributes = function(src, dest) {
    if(dest.clearAttributes) {
      dest.clearAttributes()
    }
    if(dest.mergeAttributes) {
      dest.mergeAttributes(src)
    }
    var nodeName = dest.nodeName.toLowerCase(), srcChildren = src.childNodes;
    if(nodeName === "object" && !dest.childNodes.length) {
      for(var i = 0;i < srcChildren.length;i++) {
        dest.appendChild(srcChildren[i].cloneNode(true))
      }
    }else {
      if(nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
        if(src.checked) {
          dest.defaultChecked = dest.checked = src.checked
        }
        if(dest.value !== src.value) {
          dest.value = src.value
        }
      }else {
        if(nodeName === "option") {
          dest.selected = src.defaultSelected
        }else {
          if(nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
            dest.value = src.value
          }
        }
      }
    }
    dest.removeAttribute(Dom.__EXPANDO)
  };
  var creators = Dom._creators, defaultCreator = Dom._defaultCreator, R_TBODY = /<tbody/i;
  if(S.UA.ieMode < 8) {
    creators.table = function(html, ownerDoc) {
      var frag = defaultCreator(html, ownerDoc), hasTBody = R_TBODY.test(html);
      if(hasTBody) {
        return frag
      }
      var table = frag.firstChild, tableChildren = S.makeArray(table.childNodes);
      S.each(tableChildren, function(c) {
        if(Dom.nodeName(c) === "tbody" && !c.childNodes.length) {
          table.removeChild(c)
        }
      });
      return frag
    }
  }
});
KISSY.add("dom/ie/insertion", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  var UA = S.UA;
  if(UA.ieMode < 8) {
    Dom._fixInsertionChecked = function fixChecked(ret) {
      for(var i = 0;i < ret.length;i++) {
        var el = ret[i];
        if(el.nodeType === Dom.NodeType.DOCUMENT_FRAGMENT_NODE) {
          fixChecked(el.childNodes)
        }else {
          if(Dom.nodeName(el) === "input") {
            fixCheckedInternal(el)
          }else {
            if(el.nodeType === Dom.NodeType.ELEMENT_NODE) {
              var cs = el.getElementsByTagName("input");
              for(var j = 0;j < cs.length;j++) {
                fixChecked(cs[j])
              }
            }
          }
        }
      }
    }
  }
  function fixCheckedInternal(el) {
    if(el.type === "checkbox" || el.type === "radio") {
      el.defaultChecked = el.checked
    }
  }
});
KISSY.add("dom/ie/style", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  var logger = S.getLogger("s/dom");
  var cssProps = Dom._cssProps, UA = S.UA, FLOAT = "float", HUNDRED = 100, doc = S.Env.host.document, docElem = doc && doc.documentElement, OPACITY = "opacity", STYLE = "style", RE_POS = /^(top|right|bottom|left)$/, FILTER = "filter", CURRENT_STYLE = "currentStyle", RUNTIME_STYLE = "runtimeStyle", LEFT = "left", PX = "px", cssHooks = Dom._cssHooks, backgroundPosition = "backgroundPosition", R_OPACITY = /opacity\s*=\s*([^)]*)/, R_ALPHA = /alpha\([^)]*\)/i;
  cssProps[FLOAT] = "styleFloat";
  cssHooks[backgroundPosition] = {get:function(elem, computed) {
    if(computed) {
      return elem[CURRENT_STYLE][backgroundPosition + "X"] + " " + elem[CURRENT_STYLE][backgroundPosition + "Y"]
    }else {
      return elem[STYLE][backgroundPosition]
    }
  }};
  try {
    if(docElem.style[OPACITY] == null) {
      cssHooks[OPACITY] = {get:function(elem, computed) {
        return R_OPACITY.test((computed && elem[CURRENT_STYLE] ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || "") ? parseFloat(RegExp.$1) / HUNDRED + "" : computed ? "1" : ""
      }, set:function(elem, val) {
        val = parseFloat(val);
        var style = elem[STYLE], currentStyle = elem[CURRENT_STYLE], opacity = isNaN(val) ? "" : "alpha(" + OPACITY + "=" + val * HUNDRED + ")", filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || "");
        style.zoom = 1;
        if((val >= 1 || !opacity) && !S.trim(filter.replace(R_ALPHA, ""))) {
          style.removeAttribute(FILTER);
          if(!opacity || currentStyle && !currentStyle[FILTER]) {
            return
          }
        }
        style.filter = R_ALPHA.test(filter) ? filter.replace(R_ALPHA, opacity) : filter + (filter ? ", " : "") + opacity
      }}
    }
  }catch(ex) {
    logger.debug("IE filters ActiveX is disabled. ex = " + ex)
  }
  var IE8 = UA.ie === 8, BORDER_MAP = {}, BORDERS = ["", "Top", "Left", "Right", "Bottom"];
  BORDER_MAP.thin = IE8 ? "1px" : "2px";
  BORDER_MAP.medium = IE8 ? "3px" : "4px";
  BORDER_MAP.thick = IE8 ? "5px" : "6px";
  S.each(BORDERS, function(b) {
    var name = "border" + b + "Width", styleName = "border" + b + "Style";
    cssHooks[name] = {get:function(elem, computed) {
      var currentStyle = computed ? elem[CURRENT_STYLE] : 0, current = currentStyle && String(currentStyle[name]) || undefined;
      if(current && current.indexOf("px") < 0) {
        if(BORDER_MAP[current] && currentStyle[styleName] !== "none") {
          current = BORDER_MAP[current]
        }else {
          current = 0
        }
      }
      return current
    }}
  });
  Dom._getComputedStyle = function(elem, name) {
    name = cssProps[name] || name;
    var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];
    if(Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)) {
      var style = elem[STYLE], left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];
      elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
      style[LEFT] = name === "fontSize" ? "1em" : ret || 0;
      ret = style.pixelLeft + PX;
      style[LEFT] = left;
      elem[RUNTIME_STYLE][LEFT] = rsLeft
    }
    return ret === "" ? "auto" : ret
  }
});
KISSY.add("dom/ie/traversal", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  Dom._contains = function(a, b) {
    if(a.nodeType === Dom.NodeType.DOCUMENT_NODE) {
      a = a.documentElement
    }
    b = b.parentNode;
    if(a === b) {
      return true
    }
    if(b && b.nodeType === Dom.NodeType.ELEMENT_NODE) {
      return a.contains && a.contains(b)
    }else {
      return false
    }
  };
  var div = document.createElement("div");
  div.appendChild(document.createComment(""));
  var getElementsByTagName;
  if(div.getElementsByTagName("*").length) {
    getElementsByTagName = function(name, context) {
      var nodes = context.getElementsByTagName(name), needsFilter = name === "*";
      if(needsFilter || typeof nodes.length !== "number") {
        var ret = [], i = 0, el;
        while(el = nodes[i++]) {
          if(!needsFilter || el.nodeType === 1) {
            ret.push(el)
          }
        }
        return ret
      }else {
        return nodes
      }
    }
  }else {
    getElementsByTagName = function(name, context) {
      return context.getElementsByTagName(name)
    }
  }
  Dom._getElementsByTagName = getElementsByTagName;
  var getAttr = Dom._getSimpleAttr;
  Dom._getElementById = function(id, doc) {
    var el = doc.getElementById(id);
    if(el && getAttr(el, "id") !== id) {
      var children = getElementsByTagName("*", doc);
      for(var i = 0, l = children.length;i < l;i++) {
        if(getAttr(children[i], "id") === id) {
          return children[i]
        }
      }
    }
    return el
  }
});
KISSY.add("dom/ie/transform", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  var cssHooks = Dom._cssHooks;
  var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;
  cssHooks.transform = {get:function(elem, computed) {
    var elemStyle = elem[computed ? "currentStyle" : "style"], matrix;
    if(elemStyle && rMatrix.test(elemStyle.filter)) {
      matrix = RegExp.$1.split(",");
      var dx = 0, dy = 0;
      var dxs = matrix[4] && matrix[4].split("=");
      var dys = matrix[5] && matrix[5].split("=");
      if(dxs && dxs[0].toLowerCase() === "dx") {
        dx = parseFloat(dxs[1])
      }
      if(dys && dys[0].toLowerCase() === "dy") {
        dy = parseFloat(dys[1])
      }
      matrix = [matrix[0].split("=")[1], matrix[2].split("=")[1], matrix[1].split("=")[1], matrix[3].split("=")[1], dx, dy]
    }else {
      return computed ? "none" : ""
    }
    return"matrix(" + matrix.join(",") + ")"
  }, set:function(elem, value) {
    var elemStyle = elem.style, afterCenter, currentStyle = elem.currentStyle, matrixVal, region = {width:elem.clientWidth, height:elem.clientHeight}, center = {x:region.width / 2, y:region.height / 2}, origin = parseOrigin(elem.style.transformOrigin, region), filter;
    elemStyle.zoom = 1;
    if(value) {
      value = matrix(value);
      afterCenter = getCenterByOrigin(value, origin, center);
      afterCenter.x = afterCenter[0][0];
      afterCenter.y = afterCenter[1][0];
      matrixVal = ["progid:DXImageTransform.Microsoft.Matrix(" + "M11=" + value[0][0], "M12=" + value[0][1], "M21=" + value[1][0], "M22=" + value[1][1], "Dx=" + value[0][2], "Dy=" + value[1][2], 'SizingMethod="auto expand"'].join(",") + ")"
    }else {
      matrixVal = ""
    }
    filter = currentStyle && currentStyle.filter || elemStyle.filter || "";
    if(!matrixVal && !S.trim(filter.replace(rMatrix, ""))) {
      elemStyle.removeAttribute("filter");
      if(!matrixVal || currentStyle && !currentStyle.filter) {
        return
      }
    }
    elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, matrixVal) : filter + (filter ? ", " : "") + matrixVal;
    if(matrixVal) {
      var realCenter = {x:elem.offsetWidth / 2, y:elem.offsetHeight / 2};
      elemStyle.marginLeft = afterCenter.x - realCenter.x + "px";
      elemStyle.marginTop = afterCenter.y - realCenter.y + "px"
    }else {
      elemStyle.marginLeft = elemStyle.marginTop = 0
    }
  }};
  function getCenterByOrigin(m, origin, center) {
    var w = origin[0], h = origin[1];
    return multipleMatrix([[1, 0, w], [0, 1, h], [0, 0, 1]], m, [[1, 0, -w], [0, 1, -h], [0, 0, 1]], [[center.x], [center.y], [1]])
  }
  function parseOrigin(origin, region) {
    origin = origin || "50% 50%";
    origin = origin.split(/\s+/);
    if(origin.length === 1) {
      origin[1] = origin[0]
    }
    for(var i = 0;i < origin.length;i++) {
      var val = parseFloat(origin[i]);
      if(S.endsWith(origin[i], "%")) {
        origin[i] = val * region[i ? "height" : "width"] / 100
      }else {
        origin[i] = val
      }
    }
    return origin
  }
  function matrix(transform) {
    transform = transform.split(")");
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]), curr;
    while(++i < l) {
      split = transform[i].split("(");
      prop = trim(split[0]);
      val = split[1];
      curr = [1, 0, 0, 1, 0, 0];
      switch(prop) {
        case "translateX":
          curr[4] = parseInt(val, 10);
          break;
        case "translateY":
          curr[5] = parseInt(val, 10);
          break;
        case "translate":
          val = val.split(",");
          curr[4] = parseInt(val[0], 10);
          curr[5] = parseInt(val[1] || 0, 10);
          break;
        case "rotate":
          val = toRadian(val);
          curr[0] = Math.cos(val);
          curr[1] = Math.sin(val);
          curr[2] = -Math.sin(val);
          curr[3] = Math.cos(val);
          break;
        case "scaleX":
          curr[0] = +val;
          break;
        case "scaleY":
          curr[3] = +val;
          break;
        case "scale":
          val = val.split(",");
          curr[0] = +val[0];
          curr[3] = val.length > 1 ? +val[1] : +val[0];
          break;
        case "skewX":
          curr[2] = Math.tan(toRadian(val));
          break;
        case "skewY":
          curr[1] = Math.tan(toRadian(val));
          break;
        case "skew":
          val = val.split(",");
          curr[2] = Math.tan(toRadian(val[0]));
          if(val.length > 1) {
            curr[1] = Math.tan(toRadian(val[1]))
          }
          break;
        case "matrix":
          val = val.split(",");
          curr[0] = +val[0];
          curr[1] = +val[1];
          curr[2] = +val[2];
          curr[3] = +val[3];
          curr[4] = parseInt(val[4], 10);
          curr[5] = parseInt(val[5], 10);
          break
      }
      ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr))
    }
    return ret
  }
  function cssMatrixToComputableMatrix(matrix) {
    return[[matrix[0], matrix[2], matrix[4]], [matrix[1], matrix[3], matrix[5]], [0, 0, 1]]
  }
  function setMatrix(m, x, y, v) {
    if(!m[x]) {
      m[x] = []
    }
    m[x][y] = v
  }
  function multipleMatrix(m1, m2) {
    var i;
    if(arguments.length > 2) {
      var ret = m1;
      for(i = 1;i < arguments.length;i++) {
        ret = multipleMatrix(ret, arguments[i])
      }
      return ret
    }
    var m = [], r1 = m1.length, r2 = m2.length, c2 = m2[0].length;
    for(i = 0;i < r1;i++) {
      for(var k = 0;k < c2;k++) {
        var sum = 0;
        for(var j = 0;j < r2;j++) {
          sum += m1[i][j] * m2[j][k]
        }
        setMatrix(m, i, k, sum)
      }
    }
    return m
  }
  function toRadian(value) {
    return value.indexOf("deg") > -1 ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value)
  }
});
KISSY.add("dom/ie/input-selection", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  var propHooks = Dom._propHooks;
  propHooks.selectionStart = {set:function(elem, start) {
    var selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
    if(inputRange.inRange(selectionRange)) {
      var end = getStartEnd(elem, 1)[1], diff = getMovedDistance(elem, start, end);
      selectionRange.collapse(false);
      selectionRange.moveStart("character", -diff);
      if(start > end) {
        selectionRange.collapse(true)
      }
      selectionRange.select()
    }
  }, get:function(elem) {
    return getStartEnd(elem)[0]
  }};
  propHooks.selectionEnd = {set:function(elem, end) {
    var selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
    if(inputRange.inRange(selectionRange)) {
      var start = getStartEnd(elem)[0], diff = getMovedDistance(elem, start, end);
      selectionRange.collapse(true);
      selectionRange.moveEnd("character", diff);
      if(start > end) {
        selectionRange.collapse(false)
      }
      selectionRange.select()
    }
  }, get:function(elem) {
    return getStartEnd(elem, 1)[1]
  }};
  function getStartEnd(elem, includeEnd) {
    var start = 0, end = 0, selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
    if(inputRange.inRange(selectionRange)) {
      inputRange.setEndPoint("EndToStart", selectionRange);
      start = getRangeText(elem, inputRange).length;
      if(includeEnd) {
        end = start + getRangeText(elem, selectionRange).length
      }
    }
    return[start, end]
  }
  function getSelectionRange(elem) {
    return elem.ownerDocument.selection.createRange()
  }
  function getInputRange(elem) {
    if(elem.type === "textarea") {
      var range = elem.document.body.createTextRange();
      range.moveToElementText(elem);
      return range
    }else {
      return elem.createTextRange()
    }
  }
  function getMovedDistance(elem, s, e) {
    var start = Math.min(s, e);
    var end = Math.max(s, e);
    if(start === end) {
      return 0
    }
    if(elem.type === "textarea") {
      var l = elem.value.substring(start, end).replace(/\r\n/g, "\n").length;
      if(s > e) {
        l = -l
      }
      return l
    }else {
      return e - s
    }
  }
  function getRangeText(elem, range) {
    if(elem.type === "textarea") {
      var ret = range.text, testRange = range.duplicate();
      if(testRange.compareEndPoints("StartToEnd", testRange) === 0) {
        return ret
      }
      testRange.moveEnd("character", -1);
      if(testRange.text === ret) {
        ret += "\r\n"
      }
      return ret
    }else {
      return range.text
    }
  }
});
KISSY.add("dom/ie/attr", ["dom/base"], function(S, require) {
  var Dom = require("dom/base");
  var attrHooks = Dom._attrHooks, attrNodeHook = Dom._attrNodeHook, NodeType = Dom.NodeType, valHooks = Dom._valHooks, propFix = Dom._propFix, HREF = "href", hrefFix, IE_VERSION = S.UA.ieMode;
  if(IE_VERSION < 8) {
    attrHooks.style.set = function(el, val) {
      el.style.cssText = val
    };
    S.mix(attrNodeHook, {get:function(elem, name) {
      var ret = elem.getAttributeNode(name);
      return ret && (ret.specified || ret.nodeValue) ? ret.nodeValue : undefined
    }, set:function(elem, value, name) {
      var ret = elem.getAttributeNode(name), attr;
      if(ret) {
        ret.nodeValue = value
      }else {
        try {
          attr = elem.ownerDocument.createAttribute(name);
          attr.value = value;
          elem.setAttributeNode(attr)
        }catch(e) {
          return elem.setAttribute(name, value, 0)
        }
      }
    }});
    S.mix(Dom._attrFix, propFix);
    attrHooks.tabIndex = attrHooks.tabindex;
    S.each([HREF, "src", "width", "height", "colSpan", "rowSpan"], function(name) {
      attrHooks[name] = {get:function(elem) {
        var ret = elem.getAttribute(name, 2);
        return ret === null ? undefined : ret
      }}
    });
    valHooks.button = attrHooks.value = attrNodeHook;
    attrHooks.placeholder = {get:function(elem, name) {
      return elem[name] || attrNodeHook.get(elem, name)
    }};
    valHooks.option = {get:function(elem) {
      var val = elem.attributes.value;
      return!val || val.specified ? elem.value : elem.text
    }}
  }
  hrefFix = attrHooks[HREF] = attrHooks[HREF] || {};
  hrefFix.set = function(el, val, name) {
    var childNodes = el.childNodes, b, len = childNodes.length, allText = len > 0;
    for(len = len - 1;len >= 0;len--) {
      if(childNodes[len].nodeType !== NodeType.TEXT_NODE) {
        allText = 0
      }
    }
    if(allText) {
      b = el.ownerDocument.createElement("b");
      b.style.display = "none";
      el.appendChild(b)
    }
    el.setAttribute(name, "" + val);
    if(b) {
      el.removeChild(b)
    }
  };
  function getText(el) {
    var ret = "", nodeType = el.nodeType;
    if(nodeType === Dom.NodeType.ELEMENT_NODE) {
      for(el = el.firstChild;el;el = el.nextSibling) {
        ret += getText(el)
      }
    }else {
      if(nodeType === NodeType.TEXT_NODE || nodeType === NodeType.CDATA_SECTION_NODE) {
        ret += el.nodeValue
      }
    }
    return ret
  }
  Dom._getText = getText;
  return Dom
});
KISSY.add("dom/ie", ["./ie/create", "./ie/insertion", "./ie/style", "./ie/traversal", "./ie/transform", "./ie/input-selection", "./ie/attr"], function(S, require) {
  require("./ie/create");
  require("./ie/insertion");
  require("./ie/style");
  require("./ie/traversal");
  require("./ie/transform");
  require("./ie/input-selection");
  return require("./ie/attr")
});

