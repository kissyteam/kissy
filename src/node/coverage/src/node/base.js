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
  _$jscoverage['/node/base.js'].lineData[7] = 0;
  _$jscoverage['/node/base.js'].lineData[8] = 0;
  _$jscoverage['/node/base.js'].lineData[10] = 0;
  _$jscoverage['/node/base.js'].lineData[27] = 0;
  _$jscoverage['/node/base.js'].lineData[28] = 0;
  _$jscoverage['/node/base.js'].lineData[31] = 0;
  _$jscoverage['/node/base.js'].lineData[32] = 0;
  _$jscoverage['/node/base.js'].lineData[36] = 0;
  _$jscoverage['/node/base.js'].lineData[37] = 0;
  _$jscoverage['/node/base.js'].lineData[40] = 0;
  _$jscoverage['/node/base.js'].lineData[42] = 0;
  _$jscoverage['/node/base.js'].lineData[44] = 0;
  _$jscoverage['/node/base.js'].lineData[45] = 0;
  _$jscoverage['/node/base.js'].lineData[46] = 0;
  _$jscoverage['/node/base.js'].lineData[50] = 0;
  _$jscoverage['/node/base.js'].lineData[51] = 0;
  _$jscoverage['/node/base.js'].lineData[52] = 0;
  _$jscoverage['/node/base.js'].lineData[57] = 0;
  _$jscoverage['/node/base.js'].lineData[60] = 0;
  _$jscoverage['/node/base.js'].lineData[61] = 0;
  _$jscoverage['/node/base.js'].lineData[62] = 0;
  _$jscoverage['/node/base.js'].lineData[65] = 0;
  _$jscoverage['/node/base.js'].lineData[83] = 0;
  _$jscoverage['/node/base.js'].lineData[84] = 0;
  _$jscoverage['/node/base.js'].lineData[85] = 0;
  _$jscoverage['/node/base.js'].lineData[86] = 0;
  _$jscoverage['/node/base.js'].lineData[88] = 0;
  _$jscoverage['/node/base.js'].lineData[91] = 0;
  _$jscoverage['/node/base.js'].lineData[103] = 0;
  _$jscoverage['/node/base.js'].lineData[104] = 0;
  _$jscoverage['/node/base.js'].lineData[105] = 0;
  _$jscoverage['/node/base.js'].lineData[107] = 0;
  _$jscoverage['/node/base.js'].lineData[109] = 0;
  _$jscoverage['/node/base.js'].lineData[110] = 0;
  _$jscoverage['/node/base.js'].lineData[112] = 0;
  _$jscoverage['/node/base.js'].lineData[113] = 0;
  _$jscoverage['/node/base.js'].lineData[114] = 0;
  _$jscoverage['/node/base.js'].lineData[116] = 0;
  _$jscoverage['/node/base.js'].lineData[128] = 0;
  _$jscoverage['/node/base.js'].lineData[135] = 0;
  _$jscoverage['/node/base.js'].lineData[148] = 0;
  _$jscoverage['/node/base.js'].lineData[150] = 0;
  _$jscoverage['/node/base.js'].lineData[151] = 0;
  _$jscoverage['/node/base.js'].lineData[152] = 0;
  _$jscoverage['/node/base.js'].lineData[155] = 0;
  _$jscoverage['/node/base.js'].lineData[162] = 0;
  _$jscoverage['/node/base.js'].lineData[170] = 0;
  _$jscoverage['/node/base.js'].lineData[171] = 0;
  _$jscoverage['/node/base.js'].lineData[180] = 0;
  _$jscoverage['/node/base.js'].lineData[189] = 0;
  _$jscoverage['/node/base.js'].lineData[191] = 0;
  _$jscoverage['/node/base.js'].lineData[192] = 0;
  _$jscoverage['/node/base.js'].lineData[194] = 0;
  _$jscoverage['/node/base.js'].lineData[196] = 0;
  _$jscoverage['/node/base.js'].lineData[197] = 0;
  _$jscoverage['/node/base.js'].lineData[206] = 0;
  _$jscoverage['/node/base.js'].lineData[209] = 0;
  _$jscoverage['/node/base.js'].lineData[210] = 0;
  _$jscoverage['/node/base.js'].lineData[212] = 0;
  _$jscoverage['/node/base.js'].lineData[216] = 0;
  _$jscoverage['/node/base.js'].lineData[229] = 0;
  _$jscoverage['/node/base.js'].lineData[234] = 0;
  _$jscoverage['/node/base.js'].lineData[235] = 0;
  _$jscoverage['/node/base.js'].lineData[236] = 0;
  _$jscoverage['/node/base.js'].lineData[238] = 0;
  _$jscoverage['/node/base.js'].lineData[240] = 0;
  _$jscoverage['/node/base.js'].lineData[242] = 0;
  _$jscoverage['/node/base.js'].lineData[255] = 0;
  _$jscoverage['/node/base.js'].lineData[256] = 0;
  _$jscoverage['/node/base.js'].lineData[266] = 0;
  _$jscoverage['/node/base.js'].lineData[268] = 0;
  _$jscoverage['/node/base.js'].lineData[270] = 0;
  _$jscoverage['/node/base.js'].lineData[272] = 0;
  _$jscoverage['/node/base.js'].lineData[274] = 0;
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
  _$jscoverage['/node/base.js'].branchData['31'] = [];
  _$jscoverage['/node/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['36'] = [];
  _$jscoverage['/node/base.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['40'] = [];
  _$jscoverage['/node/base.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['44'] = [];
  _$jscoverage['/node/base.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['50'] = [];
  _$jscoverage['/node/base.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['84'] = [];
  _$jscoverage['/node/base.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['85'] = [];
  _$jscoverage['/node/base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['103'] = [];
  _$jscoverage['/node/base.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['109'] = [];
  _$jscoverage['/node/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['152'] = [];
  _$jscoverage['/node/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['171'] = [];
  _$jscoverage['/node/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['191'] = [];
  _$jscoverage['/node/base.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['209'] = [];
  _$jscoverage['/node/base.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['229'] = [];
  _$jscoverage['/node/base.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['230'] = [];
  _$jscoverage['/node/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['231'] = [];
  _$jscoverage['/node/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['232'] = [];
  _$jscoverage['/node/base.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['234'] = [];
  _$jscoverage['/node/base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['235'] = [];
  _$jscoverage['/node/base.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['238'] = [];
  _$jscoverage['/node/base.js'].branchData['238'][1] = new BranchData();
}
_$jscoverage['/node/base.js'].branchData['238'][1].init(145, 32, 'context.ownerDocument || context');
function visit36_238_1(result) {
  _$jscoverage['/node/base.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['235'][1].init(25, 18, 'context.getDOMNode');
function visit35_235_1(result) {
  _$jscoverage['/node/base.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['234'][1].init(21, 7, 'context');
function visit34_234_1(result) {
  _$jscoverage['/node/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['232'][1].init(39, 72, 'S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit33_232_1(result) {
  _$jscoverage['/node/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['231'][2].init(205, 20, 'selector.length >= 3');
function visit32_231_2(result) {
  _$jscoverage['/node/base.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['231'][1].init(47, 112, 'selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit31_231_1(result) {
  _$jscoverage['/node/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['230'][1].init(48, 160, '(selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit30_230_1(result) {
  _$jscoverage['/node/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['229'][2].init(105, 28, 'typeof selector === \'string\'');
function visit29_229_2(result) {
  _$jscoverage['/node/base.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['229'][1].init(105, 209, 'typeof selector === \'string\' && (selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit28_229_1(result) {
  _$jscoverage['/node/base.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['209'][1].init(147, 3, 'ret');
function visit27_209_1(result) {
  _$jscoverage['/node/base.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['191'][1].init(67, 15, 'self.length > 0');
function visit26_191_1(result) {
  _$jscoverage['/node/base.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['171'][1].init(49, 21, 'self.__parent || self');
function visit25_171_1(result) {
  _$jscoverage['/node/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['152'][1].init(69, 12, 'context || n');
function visit24_152_1(result) {
  _$jscoverage['/node/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['109'][1].init(260, 19, 'index === undefined');
function visit23_109_1(result) {
  _$jscoverage['/node/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['103'][1].init(17, 27, 'typeof context === \'number\'');
function visit22_103_1(result) {
  _$jscoverage['/node/base.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['85'][1].init(21, 20, 'index >= self.length');
function visit21_85_1(result) {
  _$jscoverage['/node/base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['84'][1].init(46, 25, 'typeof index === \'number\'');
function visit20_84_1(result) {
  _$jscoverage['/node/base.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['50'][1].init(701, 35, 'S.isArray(html) || isNodeList(html)');
function visit19_50_1(result) {
  _$jscoverage['/node/base.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['44'][1].init(160, 52, 'domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit18_44_1(result) {
  _$jscoverage['/node/base.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['40'][1].init(309, 24, 'typeof html === \'string\'');
function visit17_40_1(result) {
  _$jscoverage['/node/base.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['36'][1].init(246, 5, '!html');
function visit16_36_1(result) {
  _$jscoverage['/node/base.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['31'][1].init(60, 27, '!(self instanceof NodeList)');
function visit15_31_1(result) {
  _$jscoverage['/node/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/node/base.js'].functionData[0]++;
  _$jscoverage['/node/base.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/node/base.js'].lineData[8]++;
  var Event = require('event/dom');
  _$jscoverage['/node/base.js'].lineData[10]++;
  var AP = Array.prototype, slice = AP.slice, NodeType = Dom.NodeType, push = AP.push, makeArray = S.makeArray, isNodeList = Dom.isDomNodeList;
  _$jscoverage['/node/base.js'].lineData[27]++;
  function NodeList(html, props, ownerDocument) {
    _$jscoverage['/node/base.js'].functionData[1]++;
    _$jscoverage['/node/base.js'].lineData[28]++;
    var self = this, domNode;
    _$jscoverage['/node/base.js'].lineData[31]++;
    if (visit15_31_1(!(self instanceof NodeList))) {
      _$jscoverage['/node/base.js'].lineData[32]++;
      return new NodeList(html, props, ownerDocument);
    }
    _$jscoverage['/node/base.js'].lineData[36]++;
    if (visit16_36_1(!html)) {
      _$jscoverage['/node/base.js'].lineData[37]++;
      return self;
    } else {
      _$jscoverage['/node/base.js'].lineData[40]++;
      if (visit17_40_1(typeof html === 'string')) {
        _$jscoverage['/node/base.js'].lineData[42]++;
        domNode = Dom.create(html, props, ownerDocument);
        _$jscoverage['/node/base.js'].lineData[44]++;
        if (visit18_44_1(domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/node/base.js'].lineData[45]++;
          push.apply(this, makeArray(domNode.childNodes));
          _$jscoverage['/node/base.js'].lineData[46]++;
          return self;
        }
      } else {
        _$jscoverage['/node/base.js'].lineData[50]++;
        if (visit19_50_1(S.isArray(html) || isNodeList(html))) {
          _$jscoverage['/node/base.js'].lineData[51]++;
          push.apply(self, makeArray(html));
          _$jscoverage['/node/base.js'].lineData[52]++;
          return self;
        } else {
          _$jscoverage['/node/base.js'].lineData[57]++;
          domNode = html;
        }
      }
    }
    _$jscoverage['/node/base.js'].lineData[60]++;
    self[0] = domNode;
    _$jscoverage['/node/base.js'].lineData[61]++;
    self.length = 1;
    _$jscoverage['/node/base.js'].lineData[62]++;
    return self;
  }
  _$jscoverage['/node/base.js'].lineData[65]++;
  NodeList.prototype = {
  constructor: NodeList, 
  isNodeList: true, 
  length: 0, 
  item: function(index) {
  _$jscoverage['/node/base.js'].functionData[2]++;
  _$jscoverage['/node/base.js'].lineData[83]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[84]++;
  if (visit20_84_1(typeof index === 'number')) {
    _$jscoverage['/node/base.js'].lineData[85]++;
    if (visit21_85_1(index >= self.length)) {
      _$jscoverage['/node/base.js'].lineData[86]++;
      return null;
    } else {
      _$jscoverage['/node/base.js'].lineData[88]++;
      return new NodeList(self[index]);
    }
  } else {
    _$jscoverage['/node/base.js'].lineData[91]++;
    return new NodeList(index);
  }
}, 
  add: function(selector, context, index) {
  _$jscoverage['/node/base.js'].functionData[3]++;
  _$jscoverage['/node/base.js'].lineData[103]++;
  if (visit22_103_1(typeof context === 'number')) {
    _$jscoverage['/node/base.js'].lineData[104]++;
    index = context;
    _$jscoverage['/node/base.js'].lineData[105]++;
    context = undefined;
  }
  _$jscoverage['/node/base.js'].lineData[107]++;
  var list = NodeList.all(selector, context).getDOMNodes(), ret = new NodeList(this);
  _$jscoverage['/node/base.js'].lineData[109]++;
  if (visit23_109_1(index === undefined)) {
    _$jscoverage['/node/base.js'].lineData[110]++;
    push.apply(ret, list);
  } else {
    _$jscoverage['/node/base.js'].lineData[112]++;
    var args = [index, 0];
    _$jscoverage['/node/base.js'].lineData[113]++;
    args.push.apply(args, list);
    _$jscoverage['/node/base.js'].lineData[114]++;
    AP.splice.apply(ret, args);
  }
  _$jscoverage['/node/base.js'].lineData[116]++;
  return ret;
}, 
  slice: function() {
  _$jscoverage['/node/base.js'].functionData[4]++;
  _$jscoverage['/node/base.js'].lineData[128]++;
  return new NodeList(slice.apply(this, arguments));
}, 
  getDOMNodes: function() {
  _$jscoverage['/node/base.js'].functionData[5]++;
  _$jscoverage['/node/base.js'].lineData[135]++;
  return slice.call(this);
}, 
  each: function(fn, context) {
  _$jscoverage['/node/base.js'].functionData[6]++;
  _$jscoverage['/node/base.js'].lineData[148]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[150]++;
  S.each(self, function(n, i) {
  _$jscoverage['/node/base.js'].functionData[7]++;
  _$jscoverage['/node/base.js'].lineData[151]++;
  n = new NodeList(n);
  _$jscoverage['/node/base.js'].lineData[152]++;
  return fn.call(visit24_152_1(context || n), n, i, self);
});
  _$jscoverage['/node/base.js'].lineData[155]++;
  return self;
}, 
  getDOMNode: function() {
  _$jscoverage['/node/base.js'].functionData[8]++;
  _$jscoverage['/node/base.js'].lineData[162]++;
  return this[0];
}, 
  end: function() {
  _$jscoverage['/node/base.js'].functionData[9]++;
  _$jscoverage['/node/base.js'].lineData[170]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[171]++;
  return visit25_171_1(self.__parent || self);
}, 
  filter: function(filter) {
  _$jscoverage['/node/base.js'].functionData[10]++;
  _$jscoverage['/node/base.js'].lineData[180]++;
  return new NodeList(Dom.filter(this, filter));
}, 
  all: function(selector) {
  _$jscoverage['/node/base.js'].functionData[11]++;
  _$jscoverage['/node/base.js'].lineData[189]++;
  var ret, self = this;
  _$jscoverage['/node/base.js'].lineData[191]++;
  if (visit26_191_1(self.length > 0)) {
    _$jscoverage['/node/base.js'].lineData[192]++;
    ret = NodeList.all(selector, self);
  } else {
    _$jscoverage['/node/base.js'].lineData[194]++;
    ret = new NodeList();
  }
  _$jscoverage['/node/base.js'].lineData[196]++;
  ret.__parent = self;
  _$jscoverage['/node/base.js'].lineData[197]++;
  return ret;
}, 
  one: function(selector) {
  _$jscoverage['/node/base.js'].functionData[12]++;
  _$jscoverage['/node/base.js'].lineData[206]++;
  var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
  _$jscoverage['/node/base.js'].lineData[209]++;
  if (visit27_209_1(ret)) {
    _$jscoverage['/node/base.js'].lineData[210]++;
    ret.__parent = self;
  }
  _$jscoverage['/node/base.js'].lineData[212]++;
  return ret;
}};
  _$jscoverage['/node/base.js'].lineData[216]++;
  S.mix(NodeList, {
  all: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[13]++;
  _$jscoverage['/node/base.js'].lineData[229]++;
  if (visit28_229_1(visit29_229_2(typeof selector === 'string') && visit30_230_1((selector = S.trim(selector)) && visit31_231_1(visit32_231_2(selector.length >= 3) && visit33_232_1(S.startsWith(selector, '<') && S.endsWith(selector, '>')))))) {
    _$jscoverage['/node/base.js'].lineData[234]++;
    if (visit34_234_1(context)) {
      _$jscoverage['/node/base.js'].lineData[235]++;
      if (visit35_235_1(context.getDOMNode)) {
        _$jscoverage['/node/base.js'].lineData[236]++;
        context = context[0];
      }
      _$jscoverage['/node/base.js'].lineData[238]++;
      context = visit36_238_1(context.ownerDocument || context);
    }
    _$jscoverage['/node/base.js'].lineData[240]++;
    return new NodeList(selector, undefined, context);
  }
  _$jscoverage['/node/base.js'].lineData[242]++;
  return new NodeList(Dom.query(selector, context));
}, 
  one: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[14]++;
  _$jscoverage['/node/base.js'].lineData[255]++;
  var all = NodeList.all(selector, context);
  _$jscoverage['/node/base.js'].lineData[256]++;
  return all.length ? all.slice(0, 1) : null;
}});
  _$jscoverage['/node/base.js'].lineData[266]++;
  NodeList.NodeType = NodeType;
  _$jscoverage['/node/base.js'].lineData[268]++;
  NodeList.KeyCode = Event.KeyCode;
  _$jscoverage['/node/base.js'].lineData[270]++;
  NodeList.Gesture = Event.Gesture;
  _$jscoverage['/node/base.js'].lineData[272]++;
  NodeList.REPLACE_HISTORY = Event.REPLACE_HISTORY;
  _$jscoverage['/node/base.js'].lineData[274]++;
  return NodeList;
});
