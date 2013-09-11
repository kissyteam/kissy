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
  _$jscoverage['/ie/attr.js'].lineData[17] = 0;
  _$jscoverage['/ie/attr.js'].lineData[19] = 0;
  _$jscoverage['/ie/attr.js'].lineData[20] = 0;
  _$jscoverage['/ie/attr.js'].lineData[24] = 0;
  _$jscoverage['/ie/attr.js'].lineData[26] = 0;
  _$jscoverage['/ie/attr.js'].lineData[28] = 0;
  _$jscoverage['/ie/attr.js'].lineData[38] = 0;
  _$jscoverage['/ie/attr.js'].lineData[39] = 0;
  _$jscoverage['/ie/attr.js'].lineData[40] = 0;
  _$jscoverage['/ie/attr.js'].lineData[42] = 0;
  _$jscoverage['/ie/attr.js'].lineData[43] = 0;
  _$jscoverage['/ie/attr.js'].lineData[44] = 0;
  _$jscoverage['/ie/attr.js'].lineData[45] = 0;
  _$jscoverage['/ie/attr.js'].lineData[51] = 0;
  _$jscoverage['/ie/attr.js'].lineData[58] = 0;
  _$jscoverage['/ie/attr.js'].lineData[61] = 0;
  _$jscoverage['/ie/attr.js'].lineData[65] = 0;
  _$jscoverage['/ie/attr.js'].lineData[66] = 0;
  _$jscoverage['/ie/attr.js'].lineData[68] = 0;
  _$jscoverage['/ie/attr.js'].lineData[69] = 0;
  _$jscoverage['/ie/attr.js'].lineData[76] = 0;
  _$jscoverage['/ie/attr.js'].lineData[78] = 0;
  _$jscoverage['/ie/attr.js'].lineData[80] = 0;
  _$jscoverage['/ie/attr.js'].lineData[87] = 0;
  _$jscoverage['/ie/attr.js'].lineData[89] = 0;
  _$jscoverage['/ie/attr.js'].lineData[90] = 0;
  _$jscoverage['/ie/attr.js'].lineData[100] = 0;
  _$jscoverage['/ie/attr.js'].lineData[101] = 0;
  _$jscoverage['/ie/attr.js'].lineData[102] = 0;
  _$jscoverage['/ie/attr.js'].lineData[106] = 0;
  _$jscoverage['/ie/attr.js'].lineData[107] = 0;
  _$jscoverage['/ie/attr.js'].lineData[108] = 0;
  _$jscoverage['/ie/attr.js'].lineData[111] = 0;
  _$jscoverage['/ie/attr.js'].lineData[112] = 0;
  _$jscoverage['/ie/attr.js'].lineData[113] = 0;
  _$jscoverage['/ie/attr.js'].lineData[114] = 0;
  _$jscoverage['/ie/attr.js'].lineData[116] = 0;
  _$jscoverage['/ie/attr.js'].lineData[117] = 0;
  _$jscoverage['/ie/attr.js'].lineData[118] = 0;
  _$jscoverage['/ie/attr.js'].lineData[123] = 0;
  _$jscoverage['/ie/attr.js'].lineData[124] = 0;
  _$jscoverage['/ie/attr.js'].lineData[127] = 0;
  _$jscoverage['/ie/attr.js'].lineData[128] = 0;
  _$jscoverage['/ie/attr.js'].lineData[129] = 0;
  _$jscoverage['/ie/attr.js'].lineData[131] = 0;
  _$jscoverage['/ie/attr.js'].lineData[132] = 0;
  _$jscoverage['/ie/attr.js'].lineData[134] = 0;
  _$jscoverage['/ie/attr.js'].lineData[137] = 0;
  _$jscoverage['/ie/attr.js'].lineData[139] = 0;
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
  _$jscoverage['/ie/attr.js'].branchData['28'] = [];
  _$jscoverage['/ie/attr.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['30'] = [];
  _$jscoverage['/ie/attr.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['39'] = [];
  _$jscoverage['/ie/attr.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['69'] = [];
  _$jscoverage['/ie/attr.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['80'] = [];
  _$jscoverage['/ie/attr.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['90'] = [];
  _$jscoverage['/ie/attr.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['100'] = [];
  _$jscoverage['/ie/attr.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['105'] = [];
  _$jscoverage['/ie/attr.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['106'] = [];
  _$jscoverage['/ie/attr.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['107'] = [];
  _$jscoverage['/ie/attr.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['111'] = [];
  _$jscoverage['/ie/attr.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['117'] = [];
  _$jscoverage['/ie/attr.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['127'] = [];
  _$jscoverage['/ie/attr.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['131'] = [];
  _$jscoverage['/ie/attr.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/ie/attr.js'].branchData['131'][3] = new BranchData();
}
_$jscoverage['/ie/attr.js'].branchData['131'][3].init(290, 39, 'nodeType == NodeType.CDATA_SECTION_NODE');
function visit17_131_3(result) {
  _$jscoverage['/ie/attr.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['131'][2].init(256, 30, 'nodeType == NodeType.TEXT_NODE');
function visit16_131_2(result) {
  _$jscoverage['/ie/attr.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['131'][1].init(256, 73, 'nodeType == NodeType.TEXT_NODE || nodeType == NodeType.CDATA_SECTION_NODE');
function visit15_131_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['127'][1].init(76, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit14_127_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['117'][1].init(514, 1, 'b');
function visit13_117_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['111'][1].init(312, 7, 'allText');
function visit12_111_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['107'][1].init(18, 46, 'childNodes[len].nodeType != NodeType.TEXT_NODE');
function visit11_107_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['106'][1].init(157, 8, 'len >= 0');
function visit10_106_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['105'][1].init(108, 7, 'len > 0');
function visit9_105_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['100'][1].init(3660, 21, 'attrHooks[HREF] || {}');
function visit8_100_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['90'][1].init(75, 21, '!val || val.specified');
function visit7_90_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['80'][1].init(25, 42, 'elem[name] || attrNodeHook.get(elem, name)');
function visit6_80_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['69'][1].init(88, 12, 'ret === null');
function visit5_69_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['39'][1].init(233, 3, 'ret');
function visit4_39_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['30'][1].init(-1, 55, 'ret.specified || ret.nodeValue');
function visit3_30_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['28'][1].init(-1, 119, 'ret && (ret.specified || ret.nodeValue)');
function visit2_28_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].branchData['17'][1].init(269, 14, 'IE_VERSION < 8');
function visit1_17_1(result) {
  _$jscoverage['/ie/attr.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/attr.js'].lineData[6]++;
KISSY.add('dom/ie/attr', function(S, Dom) {
  _$jscoverage['/ie/attr.js'].functionData[0]++;
  _$jscoverage['/ie/attr.js'].lineData[7]++;
  var attrHooks = Dom._attrHooks, attrNodeHook = Dom._attrNodeHook, NodeType = Dom.NodeType, valHooks = Dom._valHooks, propFix = Dom._propFix, HREF = 'href', hrefFix, IE_VERSION = S.UA.ie;
  _$jscoverage['/ie/attr.js'].lineData[17]++;
  if (visit1_17_1(IE_VERSION < 8)) {
    _$jscoverage['/ie/attr.js'].lineData[19]++;
    attrHooks['style'].set = function(el, val) {
  _$jscoverage['/ie/attr.js'].functionData[1]++;
  _$jscoverage['/ie/attr.js'].lineData[20]++;
  el.style.cssText = val;
};
    _$jscoverage['/ie/attr.js'].lineData[24]++;
    S.mix(attrNodeHook, {
  get: function(elem, name) {
  _$jscoverage['/ie/attr.js'].functionData[2]++;
  _$jscoverage['/ie/attr.js'].lineData[26]++;
  var ret = elem.getAttributeNode(name);
  _$jscoverage['/ie/attr.js'].lineData[28]++;
  return visit2_28_1(ret && (visit3_30_1(ret.specified || ret.nodeValue))) ? ret.nodeValue : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/ie/attr.js'].functionData[3]++;
  _$jscoverage['/ie/attr.js'].lineData[38]++;
  var ret = elem.getAttributeNode(name), attr;
  _$jscoverage['/ie/attr.js'].lineData[39]++;
  if (visit4_39_1(ret)) {
    _$jscoverage['/ie/attr.js'].lineData[40]++;
    ret.nodeValue = value;
  } else {
    _$jscoverage['/ie/attr.js'].lineData[42]++;
    try {
      _$jscoverage['/ie/attr.js'].lineData[43]++;
      attr = elem.ownerDocument.createAttribute(name);
      _$jscoverage['/ie/attr.js'].lineData[44]++;
      attr.value = value;
      _$jscoverage['/ie/attr.js'].lineData[45]++;
      elem.setAttributeNode(attr);
    }    catch (e) {
  _$jscoverage['/ie/attr.js'].lineData[51]++;
  return elem.setAttribute(name, value, 0);
}
  }
}});
    _$jscoverage['/ie/attr.js'].lineData[58]++;
    S.mix(Dom._attrFix, propFix);
    _$jscoverage['/ie/attr.js'].lineData[61]++;
    attrHooks.tabIndex = attrHooks.tabindex;
    _$jscoverage['/ie/attr.js'].lineData[65]++;
    S.each([HREF, 'src', 'width', 'height', 'colSpan', 'rowSpan'], function(name) {
  _$jscoverage['/ie/attr.js'].functionData[4]++;
  _$jscoverage['/ie/attr.js'].lineData[66]++;
  attrHooks[name] = {
  get: function(elem) {
  _$jscoverage['/ie/attr.js'].functionData[5]++;
  _$jscoverage['/ie/attr.js'].lineData[68]++;
  var ret = elem.getAttribute(name, 2);
  _$jscoverage['/ie/attr.js'].lineData[69]++;
  return visit5_69_1(ret === null) ? undefined : ret;
}};
});
    _$jscoverage['/ie/attr.js'].lineData[76]++;
    valHooks.button = attrHooks.value = attrNodeHook;
    _$jscoverage['/ie/attr.js'].lineData[78]++;
    attrHooks.placeholder = {
  get: function(elem, name) {
  _$jscoverage['/ie/attr.js'].functionData[6]++;
  _$jscoverage['/ie/attr.js'].lineData[80]++;
  return visit6_80_1(elem[name] || attrNodeHook.get(elem, name));
}};
    _$jscoverage['/ie/attr.js'].lineData[87]++;
    valHooks['option'] = {
  get: function(elem) {
  _$jscoverage['/ie/attr.js'].functionData[7]++;
  _$jscoverage['/ie/attr.js'].lineData[89]++;
  var val = elem.attributes.value;
  _$jscoverage['/ie/attr.js'].lineData[90]++;
  return visit7_90_1(!val || val.specified) ? elem.value : elem.text;
}};
  }
  _$jscoverage['/ie/attr.js'].lineData[100]++;
  hrefFix = attrHooks[HREF] = visit8_100_1(attrHooks[HREF] || {});
  _$jscoverage['/ie/attr.js'].lineData[101]++;
  hrefFix.set = function(el, val, name) {
  _$jscoverage['/ie/attr.js'].functionData[8]++;
  _$jscoverage['/ie/attr.js'].lineData[102]++;
  var childNodes = el.childNodes, b, len = childNodes.length, allText = visit9_105_1(len > 0);
  _$jscoverage['/ie/attr.js'].lineData[106]++;
  for (len = len - 1; visit10_106_1(len >= 0); len--) {
    _$jscoverage['/ie/attr.js'].lineData[107]++;
    if (visit11_107_1(childNodes[len].nodeType != NodeType.TEXT_NODE)) {
      _$jscoverage['/ie/attr.js'].lineData[108]++;
      allText = 0;
    }
  }
  _$jscoverage['/ie/attr.js'].lineData[111]++;
  if (visit12_111_1(allText)) {
    _$jscoverage['/ie/attr.js'].lineData[112]++;
    b = el.ownerDocument.createElement('b');
    _$jscoverage['/ie/attr.js'].lineData[113]++;
    b.style.display = 'none';
    _$jscoverage['/ie/attr.js'].lineData[114]++;
    el.appendChild(b);
  }
  _$jscoverage['/ie/attr.js'].lineData[116]++;
  el.setAttribute(name, '' + val);
  _$jscoverage['/ie/attr.js'].lineData[117]++;
  if (visit13_117_1(b)) {
    _$jscoverage['/ie/attr.js'].lineData[118]++;
    el.removeChild(b);
  }
};
  _$jscoverage['/ie/attr.js'].lineData[123]++;
  function getText(el) {
    _$jscoverage['/ie/attr.js'].functionData[9]++;
    _$jscoverage['/ie/attr.js'].lineData[124]++;
    var ret = "", nodeType = el.nodeType;
    _$jscoverage['/ie/attr.js'].lineData[127]++;
    if (visit14_127_1(nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/ie/attr.js'].lineData[128]++;
      for (el = el.firstChild; el; el = el.nextSibling) {
        _$jscoverage['/ie/attr.js'].lineData[129]++;
        ret += getText(el);
      }
    } else {
      _$jscoverage['/ie/attr.js'].lineData[131]++;
      if (visit15_131_1(visit16_131_2(nodeType == NodeType.TEXT_NODE) || visit17_131_3(nodeType == NodeType.CDATA_SECTION_NODE))) {
        _$jscoverage['/ie/attr.js'].lineData[132]++;
        ret += el.nodeValue;
      }
    }
    _$jscoverage['/ie/attr.js'].lineData[134]++;
    return ret;
  }
  _$jscoverage['/ie/attr.js'].lineData[137]++;
  Dom._getText = getText;
  _$jscoverage['/ie/attr.js'].lineData[139]++;
  return Dom;
}, {
  requires: ['dom/base']});
