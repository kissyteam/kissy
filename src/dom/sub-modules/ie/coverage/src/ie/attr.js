function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/ie/attr.js']) {
  _$jscoverage['/ie/attr.js'] = {};
  _$jscoverage['/ie/attr.js'].lineData = [];
  _$jscoverage['/ie/attr.js'].lineData[6] = 0;
  _$jscoverage['/ie/attr.js'].lineData[7] = 0;
  _$jscoverage['/ie/attr.js'].lineData[8] = 0;
  _$jscoverage['/ie/attr.js'].lineData[17] = 0;
  _$jscoverage['/ie/attr.js'].lineData[18] = 0;
  _$jscoverage['/ie/attr.js'].lineData[19] = 0;
  _$jscoverage['/ie/attr.js'].lineData[23] = 0;
  _$jscoverage['/ie/attr.js'].lineData[25] = 0;
  _$jscoverage['/ie/attr.js'].lineData[27] = 0;
  _$jscoverage['/ie/attr.js'].lineData[36] = 0;
  _$jscoverage['/ie/attr.js'].lineData[37] = 0;
  _$jscoverage['/ie/attr.js'].lineData[38] = 0;
  _$jscoverage['/ie/attr.js'].lineData[40] = 0;
  _$jscoverage['/ie/attr.js'].lineData[41] = 0;
  _$jscoverage['/ie/attr.js'].lineData[42] = 0;
  _$jscoverage['/ie/attr.js'].lineData[43] = 0;
  _$jscoverage['/ie/attr.js'].lineData[49] = 0;
  _$jscoverage['/ie/attr.js'].lineData[56] = 0;
  _$jscoverage['/ie/attr.js'].lineData[59] = 0;
  _$jscoverage['/ie/attr.js'].lineData[63] = 0;
  _$jscoverage['/ie/attr.js'].lineData[64] = 0;
  _$jscoverage['/ie/attr.js'].lineData[66] = 0;
  _$jscoverage['/ie/attr.js'].lineData[67] = 0;
  _$jscoverage['/ie/attr.js'].lineData[74] = 0;
  _$jscoverage['/ie/attr.js'].lineData[76] = 0;
  _$jscoverage['/ie/attr.js'].lineData[78] = 0;
  _$jscoverage['/ie/attr.js'].lineData[85] = 0;
  _$jscoverage['/ie/attr.js'].lineData[87] = 0;
  _$jscoverage['/ie/attr.js'].lineData[88] = 0;
  _$jscoverage['/ie/attr.js'].lineData[98] = 0;
  _$jscoverage['/ie/attr.js'].lineData[99] = 0;
  _$jscoverage['/ie/attr.js'].lineData[100] = 0;
  _$jscoverage['/ie/attr.js'].lineData[104] = 0;
  _$jscoverage['/ie/attr.js'].lineData[105] = 0;
  _$jscoverage['/ie/attr.js'].lineData[106] = 0;
  _$jscoverage['/ie/attr.js'].lineData[109] = 0;
  _$jscoverage['/ie/attr.js'].lineData[110] = 0;
  _$jscoverage['/ie/attr.js'].lineData[111] = 0;
  _$jscoverage['/ie/attr.js'].lineData[112] = 0;
  _$jscoverage['/ie/attr.js'].lineData[114] = 0;
  _$jscoverage['/ie/attr.js'].lineData[115] = 0;
  _$jscoverage['/ie/attr.js'].lineData[116] = 0;
  _$jscoverage['/ie/attr.js'].lineData[121] = 0;
  _$jscoverage['/ie/attr.js'].lineData[122] = 0;
  _$jscoverage['/ie/attr.js'].lineData[125] = 0;
  _$jscoverage['/ie/attr.js'].lineData[126] = 0;
  _$jscoverage['/ie/attr.js'].lineData[127] = 0;
  _$jscoverage['/ie/attr.js'].lineData[129] = 0;
  _$jscoverage['/ie/attr.js'].lineData[130] = 0;
  _$jscoverage['/ie/attr.js'].lineData[132] = 0;
  _$jscoverage['/ie/attr.js'].lineData[135] = 0;
  _$jscoverage['/ie/attr.js'].lineData[137] = 0;
}
if (! _$jscoverage['/ie/attr.js'].functionData) {
  _$jscoverage['/ie/attr.js'].functionData = [];
  _$jscoverage['/ie/attr.js'].functionData[0] = 0;
  _$jscoverage['/ie/attr.js'].functionData[1] = 0;
  _$jscoverage['/ie/attr.js'].functionData[2] = 0;
  _$jscoverage['/ie/attr.js'].functionData[3] = 0;
  _$jscoverage['/ie/attr.js'].functionData[4] = 0;
  _$jscoverage['/ie/attr.js'].functionData[5] = 0;
  _$jscoverage['/ie/attr.js'].functionData[6] = 0;
  _$jscoverage['/ie/attr.js'].functionData[7] = 0;
  _$jscoverage['/ie/attr.js'].functionData[8] = 0;
  _$jscoverage['/ie/attr.js'].functionData[9] = 0;
}
if (! _$jscoverage['/ie/attr.js'].branchData) {
  _$jscoverage['/ie/attr.js'].branchData = {};
  _$jscoverage['/ie/attr.js'].branchData['17'] = [];
  _$jscoverage['/ie/attr.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['27'] = [];
  _$jscoverage['/ie/attr.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['29'] = [];
  _$jscoverage['/ie/attr.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['37'] = [];
  _$jscoverage['/ie/attr.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['67'] = [];
  _$jscoverage['/ie/attr.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['78'] = [];
  _$jscoverage['/ie/attr.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['88'] = [];
  _$jscoverage['/ie/attr.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['98'] = [];
  _$jscoverage['/ie/attr.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['103'] = [];
  _$jscoverage['/ie/attr.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['104'] = [];
  _$jscoverage['/ie/attr.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['105'] = [];
  _$jscoverage['/ie/attr.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['109'] = [];
  _$jscoverage['/ie/attr.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['115'] = [];
  _$jscoverage['/ie/attr.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['125'] = [];
  _$jscoverage['/ie/attr.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['129'] = [];
  _$jscoverage['/ie/attr.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['129'][3] = new BranchData();
}
_$jscoverage['/ie/attr.js'].branchData['129'][3].init(283, 40, 'nodeType === NodeType.CDATA_SECTION_NODE');
function visit17_129_3(result) {
  _$jscoverage['/ie/attr.js'].branchData['129'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['129'][2].init(248, 31, 'nodeType === NodeType.TEXT_NODE');
function visit16_129_2(result) {
  _$jscoverage['/ie/attr.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['129'][1].init(248, 75, 'nodeType === NodeType.TEXT_NODE || nodeType === NodeType.CDATA_SECTION_NODE');
function visit15_129_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['125'][1].init(72, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit14_125_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['115'][1].init(499, 1, 'b');
function visit13_115_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['109'][1].init(303, 7, 'allText');
function visit12_109_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['105'][1].init(17, 47, 'childNodes[len].nodeType !== NodeType.TEXT_NODE');
function visit11_105_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['104'][1].init(152, 8, 'len >= 0');
function visit10_104_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['103'][1].init(105, 7, 'len > 0');
function visit9_103_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['98'][1].init(3573, 21, 'attrHooks[HREF] || {}');
function visit8_98_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['88'][1].init(73, 21, '!val || val.specified');
function visit7_88_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['78'][1].init(24, 42, 'elem[name] || attrNodeHook.get(elem, name)');
function visit6_78_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['67'][1].init(86, 12, 'ret === null');
function visit5_67_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['37'][1].init(229, 3, 'ret');
function visit4_37_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['29'][1].init(-1, 30, 'ret.specified || ret.nodeValue');
function visit3_29_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['27'][1].init(-1, 92, 'ret && (ret.specified || ret.nodeValue)');
function visit2_27_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['17'][1].init(296, 14, 'IE_VERSION < 8');
function visit1_17_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/attr.js'].functionData[0]++;
  _$jscoverage['/ie/attr.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/attr.js'].lineData[8]++;
  var attrHooks = Dom._attrHooks, attrNodeHook = Dom._attrNodeHook, NodeType = Dom.NodeType, valHooks = Dom._valHooks, propFix = Dom._propFix, HREF = 'href', hrefFix, IE_VERSION = S.UA.ieMode;
  _$jscoverage['/ie/attr.js'].lineData[17]++;
  if (visit1_17_1(IE_VERSION < 8)) {
    _$jscoverage['/ie/attr.js'].lineData[18]++;
    attrHooks.style.set = function(el, val) {
  _$jscoverage['/ie/attr.js'].functionData[1]++;
  _$jscoverage['/ie/attr.js'].lineData[19]++;
  el.style.cssText = val;
};
    _$jscoverage['/ie/attr.js'].lineData[23]++;
    S.mix(attrNodeHook, {
  get: function(elem, name) {
  _$jscoverage['/ie/attr.js'].functionData[2]++;
  _$jscoverage['/ie/attr.js'].lineData[25]++;
  var ret = elem.getAttributeNode(name);
  _$jscoverage['/ie/attr.js'].lineData[27]++;
  return visit2_27_1(ret && (visit3_29_1(ret.specified || ret.nodeValue))) ? ret.nodeValue : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/ie/attr.js'].functionData[3]++;
  _$jscoverage['/ie/attr.js'].lineData[36]++;
  var ret = elem.getAttributeNode(name), attr;
  _$jscoverage['/ie/attr.js'].lineData[37]++;
  if (visit4_37_1(ret)) {
    _$jscoverage['/ie/attr.js'].lineData[38]++;
    ret.nodeValue = value;
  } else {
    _$jscoverage['/ie/attr.js'].lineData[40]++;
    try {
      _$jscoverage['/ie/attr.js'].lineData[41]++;
      attr = elem.ownerDocument.createAttribute(name);
      _$jscoverage['/ie/attr.js'].lineData[42]++;
      attr.value = value;
      _$jscoverage['/ie/attr.js'].lineData[43]++;
      elem.setAttributeNode(attr);
    }    catch (e) {
  _$jscoverage['/ie/attr.js'].lineData[49]++;
  return elem.setAttribute(name, value, 0);
}
  }
}});
    _$jscoverage['/ie/attr.js'].lineData[56]++;
    S.mix(Dom._attrFix, propFix);
    _$jscoverage['/ie/attr.js'].lineData[59]++;
    attrHooks.tabIndex = attrHooks.tabindex;
    _$jscoverage['/ie/attr.js'].lineData[63]++;
    S.each([HREF, 'src', 'width', 'height', 'colSpan', 'rowSpan'], function(name) {
  _$jscoverage['/ie/attr.js'].functionData[4]++;
  _$jscoverage['/ie/attr.js'].lineData[64]++;
  attrHooks[name] = {
  get: function(elem) {
  _$jscoverage['/ie/attr.js'].functionData[5]++;
  _$jscoverage['/ie/attr.js'].lineData[66]++;
  var ret = elem.getAttribute(name, 2);
  _$jscoverage['/ie/attr.js'].lineData[67]++;
  return visit5_67_1(ret === null) ? undefined : ret;
}};
});
    _$jscoverage['/ie/attr.js'].lineData[74]++;
    valHooks.button = attrHooks.value = attrNodeHook;
    _$jscoverage['/ie/attr.js'].lineData[76]++;
    attrHooks.placeholder = {
  get: function(elem, name) {
  _$jscoverage['/ie/attr.js'].functionData[6]++;
  _$jscoverage['/ie/attr.js'].lineData[78]++;
  return visit6_78_1(elem[name] || attrNodeHook.get(elem, name));
}};
    _$jscoverage['/ie/attr.js'].lineData[85]++;
    valHooks.option = {
  get: function(elem) {
  _$jscoverage['/ie/attr.js'].functionData[7]++;
  _$jscoverage['/ie/attr.js'].lineData[87]++;
  var val = elem.attributes.value;
  _$jscoverage['/ie/attr.js'].lineData[88]++;
  return visit7_88_1(!val || val.specified) ? elem.value : elem.text;
}};
  }
  _$jscoverage['/ie/attr.js'].lineData[98]++;
  hrefFix = attrHooks[HREF] = visit8_98_1(attrHooks[HREF] || {});
  _$jscoverage['/ie/attr.js'].lineData[99]++;
  hrefFix.set = function(el, val, name) {
  _$jscoverage['/ie/attr.js'].functionData[8]++;
  _$jscoverage['/ie/attr.js'].lineData[100]++;
  var childNodes = el.childNodes, b, len = childNodes.length, allText = visit9_103_1(len > 0);
  _$jscoverage['/ie/attr.js'].lineData[104]++;
  for (len = len - 1; visit10_104_1(len >= 0); len--) {
    _$jscoverage['/ie/attr.js'].lineData[105]++;
    if (visit11_105_1(childNodes[len].nodeType !== NodeType.TEXT_NODE)) {
      _$jscoverage['/ie/attr.js'].lineData[106]++;
      allText = 0;
    }
  }
  _$jscoverage['/ie/attr.js'].lineData[109]++;
  if (visit12_109_1(allText)) {
    _$jscoverage['/ie/attr.js'].lineData[110]++;
    b = el.ownerDocument.createElement('b');
    _$jscoverage['/ie/attr.js'].lineData[111]++;
    b.style.display = 'none';
    _$jscoverage['/ie/attr.js'].lineData[112]++;
    el.appendChild(b);
  }
  _$jscoverage['/ie/attr.js'].lineData[114]++;
  el.setAttribute(name, '' + val);
  _$jscoverage['/ie/attr.js'].lineData[115]++;
  if (visit13_115_1(b)) {
    _$jscoverage['/ie/attr.js'].lineData[116]++;
    el.removeChild(b);
  }
};
  _$jscoverage['/ie/attr.js'].lineData[121]++;
  function getText(el) {
    _$jscoverage['/ie/attr.js'].functionData[9]++;
    _$jscoverage['/ie/attr.js'].lineData[122]++;
    var ret = '', nodeType = el.nodeType;
    _$jscoverage['/ie/attr.js'].lineData[125]++;
    if (visit14_125_1(nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/ie/attr.js'].lineData[126]++;
      for (el = el.firstChild; el; el = el.nextSibling) {
        _$jscoverage['/ie/attr.js'].lineData[127]++;
        ret += getText(el);
      }
    } else {
      _$jscoverage['/ie/attr.js'].lineData[129]++;
      if (visit15_129_1(visit16_129_2(nodeType === NodeType.TEXT_NODE) || visit17_129_3(nodeType === NodeType.CDATA_SECTION_NODE))) {
        _$jscoverage['/ie/attr.js'].lineData[130]++;
        ret += el.nodeValue;
      }
    }
    _$jscoverage['/ie/attr.js'].lineData[132]++;
    return ret;
  }
  _$jscoverage['/ie/attr.js'].lineData[135]++;
  Dom._getText = getText;
  _$jscoverage['/ie/attr.js'].lineData[137]++;
  return Dom;
});
