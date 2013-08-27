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
if (! _$jscoverage['/node/base.js']) {
  _$jscoverage['/node/base.js'] = {};
  _$jscoverage['/node/base.js'].lineData = [];
  _$jscoverage['/node/base.js'].lineData[6] = 0;
  _$jscoverage['/node/base.js'].lineData[8] = 0;
  _$jscoverage['/node/base.js'].lineData[29] = 0;
  _$jscoverage['/node/base.js'].lineData[30] = 0;
  _$jscoverage['/node/base.js'].lineData[33] = 0;
  _$jscoverage['/node/base.js'].lineData[34] = 0;
  _$jscoverage['/node/base.js'].lineData[38] = 0;
  _$jscoverage['/node/base.js'].lineData[39] = 0;
  _$jscoverage['/node/base.js'].lineData[42] = 0;
  _$jscoverage['/node/base.js'].lineData[44] = 0;
  _$jscoverage['/node/base.js'].lineData[46] = 0;
  _$jscoverage['/node/base.js'].lineData[47] = 0;
  _$jscoverage['/node/base.js'].lineData[48] = 0;
  _$jscoverage['/node/base.js'].lineData[52] = 0;
  _$jscoverage['/node/base.js'].lineData[53] = 0;
  _$jscoverage['/node/base.js'].lineData[54] = 0;
  _$jscoverage['/node/base.js'].lineData[59] = 0;
  _$jscoverage['/node/base.js'].lineData[62] = 0;
  _$jscoverage['/node/base.js'].lineData[63] = 0;
  _$jscoverage['/node/base.js'].lineData[64] = 0;
  _$jscoverage['/node/base.js'].lineData[67] = 0;
  _$jscoverage['/node/base.js'].lineData[86] = 0;
  _$jscoverage['/node/base.js'].lineData[87] = 0;
  _$jscoverage['/node/base.js'].lineData[88] = 0;
  _$jscoverage['/node/base.js'].lineData[89] = 0;
  _$jscoverage['/node/base.js'].lineData[91] = 0;
  _$jscoverage['/node/base.js'].lineData[94] = 0;
  _$jscoverage['/node/base.js'].lineData[106] = 0;
  _$jscoverage['/node/base.js'].lineData[107] = 0;
  _$jscoverage['/node/base.js'].lineData[108] = 0;
  _$jscoverage['/node/base.js'].lineData[110] = 0;
  _$jscoverage['/node/base.js'].lineData[112] = 0;
  _$jscoverage['/node/base.js'].lineData[113] = 0;
  _$jscoverage['/node/base.js'].lineData[115] = 0;
  _$jscoverage['/node/base.js'].lineData[116] = 0;
  _$jscoverage['/node/base.js'].lineData[117] = 0;
  _$jscoverage['/node/base.js'].lineData[119] = 0;
  _$jscoverage['/node/base.js'].lineData[132] = 0;
  _$jscoverage['/node/base.js'].lineData[139] = 0;
  _$jscoverage['/node/base.js'].lineData[152] = 0;
  _$jscoverage['/node/base.js'].lineData[154] = 0;
  _$jscoverage['/node/base.js'].lineData[155] = 0;
  _$jscoverage['/node/base.js'].lineData[156] = 0;
  _$jscoverage['/node/base.js'].lineData[159] = 0;
  _$jscoverage['/node/base.js'].lineData[166] = 0;
  _$jscoverage['/node/base.js'].lineData[174] = 0;
  _$jscoverage['/node/base.js'].lineData[175] = 0;
  _$jscoverage['/node/base.js'].lineData[184] = 0;
  _$jscoverage['/node/base.js'].lineData[193] = 0;
  _$jscoverage['/node/base.js'].lineData[195] = 0;
  _$jscoverage['/node/base.js'].lineData[196] = 0;
  _$jscoverage['/node/base.js'].lineData[198] = 0;
  _$jscoverage['/node/base.js'].lineData[200] = 0;
  _$jscoverage['/node/base.js'].lineData[201] = 0;
  _$jscoverage['/node/base.js'].lineData[210] = 0;
  _$jscoverage['/node/base.js'].lineData[213] = 0;
  _$jscoverage['/node/base.js'].lineData[214] = 0;
  _$jscoverage['/node/base.js'].lineData[216] = 0;
  _$jscoverage['/node/base.js'].lineData[220] = 0;
  _$jscoverage['/node/base.js'].lineData[233] = 0;
  _$jscoverage['/node/base.js'].lineData[238] = 0;
  _$jscoverage['/node/base.js'].lineData[239] = 0;
  _$jscoverage['/node/base.js'].lineData[240] = 0;
  _$jscoverage['/node/base.js'].lineData[242] = 0;
  _$jscoverage['/node/base.js'].lineData[244] = 0;
  _$jscoverage['/node/base.js'].lineData[246] = 0;
  _$jscoverage['/node/base.js'].lineData[259] = 0;
  _$jscoverage['/node/base.js'].lineData[260] = 0;
  _$jscoverage['/node/base.js'].lineData[270] = 0;
  _$jscoverage['/node/base.js'].lineData[272] = 0;
  _$jscoverage['/node/base.js'].lineData[274] = 0;
  _$jscoverage['/node/base.js'].lineData[276] = 0;
  _$jscoverage['/node/base.js'].lineData[278] = 0;
}
if (! _$jscoverage['/node/base.js'].functionData) {
  _$jscoverage['/node/base.js'].functionData = [];
  _$jscoverage['/node/base.js'].functionData[0] = 0;
  _$jscoverage['/node/base.js'].functionData[1] = 0;
  _$jscoverage['/node/base.js'].functionData[2] = 0;
  _$jscoverage['/node/base.js'].functionData[3] = 0;
  _$jscoverage['/node/base.js'].functionData[4] = 0;
  _$jscoverage['/node/base.js'].functionData[5] = 0;
  _$jscoverage['/node/base.js'].functionData[6] = 0;
  _$jscoverage['/node/base.js'].functionData[7] = 0;
  _$jscoverage['/node/base.js'].functionData[8] = 0;
  _$jscoverage['/node/base.js'].functionData[9] = 0;
  _$jscoverage['/node/base.js'].functionData[10] = 0;
  _$jscoverage['/node/base.js'].functionData[11] = 0;
  _$jscoverage['/node/base.js'].functionData[12] = 0;
  _$jscoverage['/node/base.js'].functionData[13] = 0;
  _$jscoverage['/node/base.js'].functionData[14] = 0;
}
if (! _$jscoverage['/node/base.js'].branchData) {
  _$jscoverage['/node/base.js'].branchData = {};
  _$jscoverage['/node/base.js'].branchData['33'] = [];
  _$jscoverage['/node/base.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['38'] = [];
  _$jscoverage['/node/base.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['42'] = [];
  _$jscoverage['/node/base.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['46'] = [];
  _$jscoverage['/node/base.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['52'] = [];
  _$jscoverage['/node/base.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['87'] = [];
  _$jscoverage['/node/base.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['88'] = [];
  _$jscoverage['/node/base.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['106'] = [];
  _$jscoverage['/node/base.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['112'] = [];
  _$jscoverage['/node/base.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['156'] = [];
  _$jscoverage['/node/base.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['175'] = [];
  _$jscoverage['/node/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['195'] = [];
  _$jscoverage['/node/base.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['213'] = [];
  _$jscoverage['/node/base.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['233'] = [];
  _$jscoverage['/node/base.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['234'] = [];
  _$jscoverage['/node/base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['235'] = [];
  _$jscoverage['/node/base.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['236'] = [];
  _$jscoverage['/node/base.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['238'] = [];
  _$jscoverage['/node/base.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['239'] = [];
  _$jscoverage['/node/base.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['242'] = [];
  _$jscoverage['/node/base.js'].branchData['242'][1] = new BranchData();
}
_$jscoverage['/node/base.js'].branchData['242'][1].init(152, 35, 'context[\'ownerDocument\'] || context');
function visit36_242_1(result) {
  _$jscoverage['/node/base.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['239'][1].init(26, 21, 'context[\'getDOMNode\']');
function visit35_239_1(result) {
  _$jscoverage['/node/base.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['238'][1].init(22, 7, 'context');
function visit34_238_1(result) {
  _$jscoverage['/node/base.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['236'][1].init(40, 73, 'S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit33_236_1(result) {
  _$jscoverage['/node/base.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['235'][2].init(209, 20, 'selector.length >= 3');
function visit32_235_2(result) {
  _$jscoverage['/node/base.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['235'][1].init(48, 114, 'selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit31_235_1(result) {
  _$jscoverage['/node/base.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['234'][1].init(48, 163, '(selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit30_234_1(result) {
  _$jscoverage['/node/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['233'][2].init(108, 27, 'typeof selector == \'string\'');
function visit29_233_2(result) {
  _$jscoverage['/node/base.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['233'][1].init(108, 212, 'typeof selector == \'string\' && (selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit28_233_1(result) {
  _$jscoverage['/node/base.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['213'][1].init(151, 3, 'ret');
function visit27_213_1(result) {
  _$jscoverage['/node/base.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['195'][1].init(70, 15, 'self.length > 0');
function visit26_195_1(result) {
  _$jscoverage['/node/base.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['175'][1].init(51, 21, 'self.__parent || self');
function visit25_175_1(result) {
  _$jscoverage['/node/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['156'][1].init(71, 12, 'context || n');
function visit24_156_1(result) {
  _$jscoverage['/node/base.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['112'][1].init(265, 19, 'index === undefined');
function visit23_112_1(result) {
  _$jscoverage['/node/base.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['106'][1].init(18, 25, 'typeof context === \'number\'');
function visit22_106_1(result) {
  _$jscoverage['/node/base.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['88'][1].init(22, 20, 'index >= self.length');
function visit21_88_1(result) {
  _$jscoverage['/node/base.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['87'][1].init(48, 23, 'typeof index === \'number\'');
function visit20_87_1(result) {
  _$jscoverage['/node/base.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['52'][1].init(723, 35, 'S.isArray(html) || isNodeList(html)');
function visit19_52_1(result) {
  _$jscoverage['/node/base.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['46'][1].init(164, 52, 'domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit18_46_1(result) {
  _$jscoverage['/node/base.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['42'][1].init(322, 23, 'typeof html == \'string\'');
function visit17_42_1(result) {
  _$jscoverage['/node/base.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['38'][1].init(255, 5, '!html');
function visit16_38_1(result) {
  _$jscoverage['/node/base.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['33'][1].init(64, 27, '!(self instanceof NodeList)');
function visit15_33_1(result) {
  _$jscoverage['/node/base.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].lineData[6]++;
KISSY.add('node/base', function(S, Dom, Event, undefined) {
  _$jscoverage['/node/base.js'].functionData[0]++;
  _$jscoverage['/node/base.js'].lineData[8]++;
  var AP = Array.prototype, slice = AP.slice, NodeType = Dom.NodeType, push = AP.push, makeArray = S.makeArray, isNodeList = Dom.isDomNodeList;
  _$jscoverage['/node/base.js'].lineData[29]++;
  function NodeList(html, props, ownerDocument) {
    _$jscoverage['/node/base.js'].functionData[1]++;
    _$jscoverage['/node/base.js'].lineData[30]++;
    var self = this, domNode;
    _$jscoverage['/node/base.js'].lineData[33]++;
    if (visit15_33_1(!(self instanceof NodeList))) {
      _$jscoverage['/node/base.js'].lineData[34]++;
      return new NodeList(html, props, ownerDocument);
    }
    _$jscoverage['/node/base.js'].lineData[38]++;
    if (visit16_38_1(!html)) {
      _$jscoverage['/node/base.js'].lineData[39]++;
      return self;
    } else {
      _$jscoverage['/node/base.js'].lineData[42]++;
      if (visit17_42_1(typeof html == 'string')) {
        _$jscoverage['/node/base.js'].lineData[44]++;
        domNode = Dom.create(html, props, ownerDocument);
        _$jscoverage['/node/base.js'].lineData[46]++;
        if (visit18_46_1(domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/node/base.js'].lineData[47]++;
          push.apply(this, makeArray(domNode.childNodes));
          _$jscoverage['/node/base.js'].lineData[48]++;
          return self;
        }
      } else {
        _$jscoverage['/node/base.js'].lineData[52]++;
        if (visit19_52_1(S.isArray(html) || isNodeList(html))) {
          _$jscoverage['/node/base.js'].lineData[53]++;
          push.apply(self, makeArray(html));
          _$jscoverage['/node/base.js'].lineData[54]++;
          return self;
        } else {
          _$jscoverage['/node/base.js'].lineData[59]++;
          domNode = html;
        }
      }
    }
    _$jscoverage['/node/base.js'].lineData[62]++;
    self[0] = domNode;
    _$jscoverage['/node/base.js'].lineData[63]++;
    self.length = 1;
    _$jscoverage['/node/base.js'].lineData[64]++;
    return self;
  }
  _$jscoverage['/node/base.js'].lineData[67]++;
  NodeList.prototype = {
  constructor: NodeList, 
  isNodeList: true, 
  length: 0, 
  item: function(index) {
  _$jscoverage['/node/base.js'].functionData[2]++;
  _$jscoverage['/node/base.js'].lineData[86]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[87]++;
  if (visit20_87_1(typeof index === 'number')) {
    _$jscoverage['/node/base.js'].lineData[88]++;
    if (visit21_88_1(index >= self.length)) {
      _$jscoverage['/node/base.js'].lineData[89]++;
      return null;
    } else {
      _$jscoverage['/node/base.js'].lineData[91]++;
      return new NodeList(self[index]);
    }
  } else {
    _$jscoverage['/node/base.js'].lineData[94]++;
    return new NodeList(index);
  }
}, 
  add: function(selector, context, index) {
  _$jscoverage['/node/base.js'].functionData[3]++;
  _$jscoverage['/node/base.js'].lineData[106]++;
  if (visit22_106_1(typeof context === 'number')) {
    _$jscoverage['/node/base.js'].lineData[107]++;
    index = context;
    _$jscoverage['/node/base.js'].lineData[108]++;
    context = undefined;
  }
  _$jscoverage['/node/base.js'].lineData[110]++;
  var list = NodeList.all(selector, context).getDOMNodes(), ret = new NodeList(this);
  _$jscoverage['/node/base.js'].lineData[112]++;
  if (visit23_112_1(index === undefined)) {
    _$jscoverage['/node/base.js'].lineData[113]++;
    push.apply(ret, list);
  } else {
    _$jscoverage['/node/base.js'].lineData[115]++;
    var args = [index, 0];
    _$jscoverage['/node/base.js'].lineData[116]++;
    args.push.apply(args, list);
    _$jscoverage['/node/base.js'].lineData[117]++;
    AP.splice.apply(ret, args);
  }
  _$jscoverage['/node/base.js'].lineData[119]++;
  return ret;
}, 
  slice: function(start, end) {
  _$jscoverage['/node/base.js'].functionData[4]++;
  _$jscoverage['/node/base.js'].lineData[132]++;
  return new NodeList(slice.apply(this, arguments));
}, 
  getDOMNodes: function() {
  _$jscoverage['/node/base.js'].functionData[5]++;
  _$jscoverage['/node/base.js'].lineData[139]++;
  return slice.call(this);
}, 
  each: function(fn, context) {
  _$jscoverage['/node/base.js'].functionData[6]++;
  _$jscoverage['/node/base.js'].lineData[152]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[154]++;
  S.each(self, function(n, i) {
  _$jscoverage['/node/base.js'].functionData[7]++;
  _$jscoverage['/node/base.js'].lineData[155]++;
  n = new NodeList(n);
  _$jscoverage['/node/base.js'].lineData[156]++;
  return fn.call(visit24_156_1(context || n), n, i, self);
});
  _$jscoverage['/node/base.js'].lineData[159]++;
  return self;
}, 
  getDOMNode: function() {
  _$jscoverage['/node/base.js'].functionData[8]++;
  _$jscoverage['/node/base.js'].lineData[166]++;
  return this[0];
}, 
  end: function() {
  _$jscoverage['/node/base.js'].functionData[9]++;
  _$jscoverage['/node/base.js'].lineData[174]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[175]++;
  return visit25_175_1(self.__parent || self);
}, 
  filter: function(filter) {
  _$jscoverage['/node/base.js'].functionData[10]++;
  _$jscoverage['/node/base.js'].lineData[184]++;
  return new NodeList(Dom.filter(this, filter));
}, 
  all: function(selector) {
  _$jscoverage['/node/base.js'].functionData[11]++;
  _$jscoverage['/node/base.js'].lineData[193]++;
  var ret, self = this;
  _$jscoverage['/node/base.js'].lineData[195]++;
  if (visit26_195_1(self.length > 0)) {
    _$jscoverage['/node/base.js'].lineData[196]++;
    ret = NodeList.all(selector, self);
  } else {
    _$jscoverage['/node/base.js'].lineData[198]++;
    ret = new NodeList();
  }
  _$jscoverage['/node/base.js'].lineData[200]++;
  ret.__parent = self;
  _$jscoverage['/node/base.js'].lineData[201]++;
  return ret;
}, 
  one: function(selector) {
  _$jscoverage['/node/base.js'].functionData[12]++;
  _$jscoverage['/node/base.js'].lineData[210]++;
  var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
  _$jscoverage['/node/base.js'].lineData[213]++;
  if (visit27_213_1(ret)) {
    _$jscoverage['/node/base.js'].lineData[214]++;
    ret.__parent = self;
  }
  _$jscoverage['/node/base.js'].lineData[216]++;
  return ret;
}};
  _$jscoverage['/node/base.js'].lineData[220]++;
  S.mix(NodeList, {
  all: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[13]++;
  _$jscoverage['/node/base.js'].lineData[233]++;
  if (visit28_233_1(visit29_233_2(typeof selector == 'string') && visit30_234_1((selector = S.trim(selector)) && visit31_235_1(visit32_235_2(selector.length >= 3) && visit33_236_1(S.startsWith(selector, '<') && S.endsWith(selector, '>')))))) {
    _$jscoverage['/node/base.js'].lineData[238]++;
    if (visit34_238_1(context)) {
      _$jscoverage['/node/base.js'].lineData[239]++;
      if (visit35_239_1(context['getDOMNode'])) {
        _$jscoverage['/node/base.js'].lineData[240]++;
        context = context[0];
      }
      _$jscoverage['/node/base.js'].lineData[242]++;
      context = visit36_242_1(context['ownerDocument'] || context);
    }
    _$jscoverage['/node/base.js'].lineData[244]++;
    return new NodeList(selector, undefined, context);
  }
  _$jscoverage['/node/base.js'].lineData[246]++;
  return new NodeList(Dom.query(selector, context));
}, 
  one: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[14]++;
  _$jscoverage['/node/base.js'].lineData[259]++;
  var all = NodeList.all(selector, context);
  _$jscoverage['/node/base.js'].lineData[260]++;
  return all.length ? all.slice(0, 1) : null;
}});
  _$jscoverage['/node/base.js'].lineData[270]++;
  NodeList.NodeType = NodeType;
  _$jscoverage['/node/base.js'].lineData[272]++;
  NodeList.KeyCode = Event.KeyCode;
  _$jscoverage['/node/base.js'].lineData[274]++;
  NodeList.Gesture = Event.Gesture;
  _$jscoverage['/node/base.js'].lineData[276]++;
  NodeList.REPLACE_HISTORY = Event.REPLACE_HISTORY;
  _$jscoverage['/node/base.js'].lineData[278]++;
  return NodeList;
}, {
  requires: ['dom', 'event/dom']});
