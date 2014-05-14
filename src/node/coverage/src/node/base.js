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
  _$jscoverage['/node/base.js'].lineData[9] = 0;
  _$jscoverage['/node/base.js'].lineData[10] = 0;
  _$jscoverage['/node/base.js'].lineData[27] = 0;
  _$jscoverage['/node/base.js'].lineData[28] = 0;
  _$jscoverage['/node/base.js'].lineData[31] = 0;
  _$jscoverage['/node/base.js'].lineData[32] = 0;
  _$jscoverage['/node/base.js'].lineData[35] = 0;
  _$jscoverage['/node/base.js'].lineData[36] = 0;
  _$jscoverage['/node/base.js'].lineData[40] = 0;
  _$jscoverage['/node/base.js'].lineData[41] = 0;
  _$jscoverage['/node/base.js'].lineData[42] = 0;
  _$jscoverage['/node/base.js'].lineData[44] = 0;
  _$jscoverage['/node/base.js'].lineData[46] = 0;
  _$jscoverage['/node/base.js'].lineData[47] = 0;
  _$jscoverage['/node/base.js'].lineData[48] = 0;
  _$jscoverage['/node/base.js'].lineData[50] = 0;
  _$jscoverage['/node/base.js'].lineData[51] = 0;
  _$jscoverage['/node/base.js'].lineData[52] = 0;
  _$jscoverage['/node/base.js'].lineData[55] = 0;
  _$jscoverage['/node/base.js'].lineData[58] = 0;
  _$jscoverage['/node/base.js'].lineData[59] = 0;
  _$jscoverage['/node/base.js'].lineData[60] = 0;
  _$jscoverage['/node/base.js'].lineData[63] = 0;
  _$jscoverage['/node/base.js'].lineData[80] = 0;
  _$jscoverage['/node/base.js'].lineData[81] = 0;
  _$jscoverage['/node/base.js'].lineData[82] = 0;
  _$jscoverage['/node/base.js'].lineData[83] = 0;
  _$jscoverage['/node/base.js'].lineData[85] = 0;
  _$jscoverage['/node/base.js'].lineData[88] = 0;
  _$jscoverage['/node/base.js'].lineData[100] = 0;
  _$jscoverage['/node/base.js'].lineData[101] = 0;
  _$jscoverage['/node/base.js'].lineData[102] = 0;
  _$jscoverage['/node/base.js'].lineData[104] = 0;
  _$jscoverage['/node/base.js'].lineData[106] = 0;
  _$jscoverage['/node/base.js'].lineData[107] = 0;
  _$jscoverage['/node/base.js'].lineData[109] = 0;
  _$jscoverage['/node/base.js'].lineData[110] = 0;
  _$jscoverage['/node/base.js'].lineData[111] = 0;
  _$jscoverage['/node/base.js'].lineData[113] = 0;
  _$jscoverage['/node/base.js'].lineData[125] = 0;
  _$jscoverage['/node/base.js'].lineData[132] = 0;
  _$jscoverage['/node/base.js'].lineData[145] = 0;
  _$jscoverage['/node/base.js'].lineData[147] = 0;
  _$jscoverage['/node/base.js'].lineData[148] = 0;
  _$jscoverage['/node/base.js'].lineData[149] = 0;
  _$jscoverage['/node/base.js'].lineData[152] = 0;
  _$jscoverage['/node/base.js'].lineData[159] = 0;
  _$jscoverage['/node/base.js'].lineData[167] = 0;
  _$jscoverage['/node/base.js'].lineData[168] = 0;
  _$jscoverage['/node/base.js'].lineData[177] = 0;
  _$jscoverage['/node/base.js'].lineData[186] = 0;
  _$jscoverage['/node/base.js'].lineData[188] = 0;
  _$jscoverage['/node/base.js'].lineData[189] = 0;
  _$jscoverage['/node/base.js'].lineData[191] = 0;
  _$jscoverage['/node/base.js'].lineData[193] = 0;
  _$jscoverage['/node/base.js'].lineData[194] = 0;
  _$jscoverage['/node/base.js'].lineData[203] = 0;
  _$jscoverage['/node/base.js'].lineData[206] = 0;
  _$jscoverage['/node/base.js'].lineData[207] = 0;
  _$jscoverage['/node/base.js'].lineData[209] = 0;
  _$jscoverage['/node/base.js'].lineData[213] = 0;
  _$jscoverage['/node/base.js'].lineData[226] = 0;
  _$jscoverage['/node/base.js'].lineData[231] = 0;
  _$jscoverage['/node/base.js'].lineData[232] = 0;
  _$jscoverage['/node/base.js'].lineData[233] = 0;
  _$jscoverage['/node/base.js'].lineData[235] = 0;
  _$jscoverage['/node/base.js'].lineData[237] = 0;
  _$jscoverage['/node/base.js'].lineData[239] = 0;
  _$jscoverage['/node/base.js'].lineData[252] = 0;
  _$jscoverage['/node/base.js'].lineData[253] = 0;
  _$jscoverage['/node/base.js'].lineData[263] = 0;
  _$jscoverage['/node/base.js'].lineData[265] = 0;
  _$jscoverage['/node/base.js'].lineData[267] = 0;
  _$jscoverage['/node/base.js'].lineData[269] = 0;
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
  _$jscoverage['/node/base.js'].branchData['35'] = [];
  _$jscoverage['/node/base.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['40'] = [];
  _$jscoverage['/node/base.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['42'] = [];
  _$jscoverage['/node/base.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['46'] = [];
  _$jscoverage['/node/base.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['50'] = [];
  _$jscoverage['/node/base.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['81'] = [];
  _$jscoverage['/node/base.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['82'] = [];
  _$jscoverage['/node/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['100'] = [];
  _$jscoverage['/node/base.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['106'] = [];
  _$jscoverage['/node/base.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['149'] = [];
  _$jscoverage['/node/base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['168'] = [];
  _$jscoverage['/node/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['188'] = [];
  _$jscoverage['/node/base.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['206'] = [];
  _$jscoverage['/node/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['226'] = [];
  _$jscoverage['/node/base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['227'] = [];
  _$jscoverage['/node/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['228'] = [];
  _$jscoverage['/node/base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['229'] = [];
  _$jscoverage['/node/base.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['231'] = [];
  _$jscoverage['/node/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['232'] = [];
  _$jscoverage['/node/base.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['235'] = [];
  _$jscoverage['/node/base.js'].branchData['235'][1] = new BranchData();
}
_$jscoverage['/node/base.js'].branchData['235'][1].init(149, 32, 'context.ownerDocument || context');
function visit45_235_1(result) {
  _$jscoverage['/node/base.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['232'][1].init(26, 18, 'context.getDOMNode');
function visit44_232_1(result) {
  _$jscoverage['/node/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['231'][1].init(22, 7, 'context');
function visit43_231_1(result) {
  _$jscoverage['/node/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['229'][1].init(40, 79, 'util.startsWith(selector, \'<\') && util.endsWith(selector, \'>\')');
function visit42_229_1(result) {
  _$jscoverage['/node/base.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['228'][2].init(213, 20, 'selector.length >= 3');
function visit41_228_2(result) {
  _$jscoverage['/node/base.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['228'][1].init(51, 120, 'selector.length >= 3 && util.startsWith(selector, \'<\') && util.endsWith(selector, \'>\')');
function visit40_228_1(result) {
  _$jscoverage['/node/base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['227'][1].init(49, 172, '(selector = util.trim(selector)) && selector.length >= 3 && util.startsWith(selector, \'<\') && util.endsWith(selector, \'>\')');
function visit39_227_1(result) {
  _$jscoverage['/node/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['226'][2].init(108, 28, 'typeof selector === \'string\'');
function visit38_226_2(result) {
  _$jscoverage['/node/base.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['226'][1].init(108, 222, 'typeof selector === \'string\' && (selector = util.trim(selector)) && selector.length >= 3 && util.startsWith(selector, \'<\') && util.endsWith(selector, \'>\')');
function visit37_226_1(result) {
  _$jscoverage['/node/base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['206'][1].init(151, 3, 'ret');
function visit36_206_1(result) {
  _$jscoverage['/node/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['188'][1].init(70, 15, 'self.length > 0');
function visit35_188_1(result) {
  _$jscoverage['/node/base.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['168'][1].init(51, 21, 'self.__parent || self');
function visit34_168_1(result) {
  _$jscoverage['/node/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['149'][1].init(67, 12, 'context || n');
function visit33_149_1(result) {
  _$jscoverage['/node/base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['106'][1].init(259, 19, 'index === undefined');
function visit32_106_1(result) {
  _$jscoverage['/node/base.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['100'][1].init(18, 27, 'typeof context === \'number\'');
function visit31_100_1(result) {
  _$jscoverage['/node/base.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['82'][1].init(22, 20, 'index >= self.length');
function visit30_82_1(result) {
  _$jscoverage['/node/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['81'][1].init(48, 25, 'typeof index === \'number\'');
function visit29_81_1(result) {
  _$jscoverage['/node/base.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['50'][1].init(762, 41, 'util.isArray(html) || isDomNodeList(html)');
function visit28_50_1(result) {
  _$jscoverage['/node/base.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['46'][1].init(160, 52, 'domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit27_46_1(result) {
  _$jscoverage['/node/base.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['42'][1].init(375, 24, 'typeof html === \'string\'');
function visit26_42_1(result) {
  _$jscoverage['/node/base.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['40'][1].init(319, 5, '!html');
function visit25_40_1(result) {
  _$jscoverage['/node/base.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['35'][1].init(148, 23, '!(self instanceof Node)');
function visit24_35_1(result) {
  _$jscoverage['/node/base.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['31'][1].init(64, 20, 'html instanceof Node');
function visit23_31_1(result) {
  _$jscoverage['/node/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/node/base.js'].functionData[0]++;
  _$jscoverage['/node/base.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/node/base.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/node/base.js'].lineData[9]++;
  var Event = require('event/dom');
  _$jscoverage['/node/base.js'].lineData[10]++;
  var AP = Array.prototype, slice = AP.slice, NodeType = Dom.NodeType, push = AP.push, makeArray = util.makeArray, isDomNodeList = Dom.isDomNodeList;
  _$jscoverage['/node/base.js'].lineData[27]++;
  function Node(html, props, ownerDocument) {
    _$jscoverage['/node/base.js'].functionData[1]++;
    _$jscoverage['/node/base.js'].lineData[28]++;
    var self = this, domNode;
    _$jscoverage['/node/base.js'].lineData[31]++;
    if (visit23_31_1(html instanceof Node)) {
      _$jscoverage['/node/base.js'].lineData[32]++;
      return html.slice();
    }
    _$jscoverage['/node/base.js'].lineData[35]++;
    if (visit24_35_1(!(self instanceof Node))) {
      _$jscoverage['/node/base.js'].lineData[36]++;
      return new Node(html, props, ownerDocument);
    }
    _$jscoverage['/node/base.js'].lineData[40]++;
    if (visit25_40_1(!html)) {
      _$jscoverage['/node/base.js'].lineData[41]++;
      return self;
    } else {
      _$jscoverage['/node/base.js'].lineData[42]++;
      if (visit26_42_1(typeof html === 'string')) {
        _$jscoverage['/node/base.js'].lineData[44]++;
        domNode = Dom.create(html, props, ownerDocument);
        _$jscoverage['/node/base.js'].lineData[46]++;
        if (visit27_46_1(domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/node/base.js'].lineData[47]++;
          push.apply(this, makeArray(domNode.childNodes));
          _$jscoverage['/node/base.js'].lineData[48]++;
          return self;
        }
      } else {
        _$jscoverage['/node/base.js'].lineData[50]++;
        if (visit28_50_1(util.isArray(html) || isDomNodeList(html))) {
          _$jscoverage['/node/base.js'].lineData[51]++;
          push.apply(self, makeArray(html));
          _$jscoverage['/node/base.js'].lineData[52]++;
          return self;
        } else {
          _$jscoverage['/node/base.js'].lineData[55]++;
          domNode = html;
        }
      }
    }
    _$jscoverage['/node/base.js'].lineData[58]++;
    self[0] = domNode;
    _$jscoverage['/node/base.js'].lineData[59]++;
    self.length = 1;
    _$jscoverage['/node/base.js'].lineData[60]++;
    return self;
  }
  _$jscoverage['/node/base.js'].lineData[63]++;
  Node.prototype = {
  constructor: Node, 
  isNode: true, 
  length: 0, 
  item: function(index) {
  _$jscoverage['/node/base.js'].functionData[2]++;
  _$jscoverage['/node/base.js'].lineData[80]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[81]++;
  if (visit29_81_1(typeof index === 'number')) {
    _$jscoverage['/node/base.js'].lineData[82]++;
    if (visit30_82_1(index >= self.length)) {
      _$jscoverage['/node/base.js'].lineData[83]++;
      return null;
    } else {
      _$jscoverage['/node/base.js'].lineData[85]++;
      return new Node(self[index]);
    }
  } else {
    _$jscoverage['/node/base.js'].lineData[88]++;
    return new Node(index);
  }
}, 
  add: function(selector, context, index) {
  _$jscoverage['/node/base.js'].functionData[3]++;
  _$jscoverage['/node/base.js'].lineData[100]++;
  if (visit31_100_1(typeof context === 'number')) {
    _$jscoverage['/node/base.js'].lineData[101]++;
    index = context;
    _$jscoverage['/node/base.js'].lineData[102]++;
    context = undefined;
  }
  _$jscoverage['/node/base.js'].lineData[104]++;
  var list = Node.all(selector, context).getDOMNodes(), ret = new Node(this);
  _$jscoverage['/node/base.js'].lineData[106]++;
  if (visit32_106_1(index === undefined)) {
    _$jscoverage['/node/base.js'].lineData[107]++;
    push.apply(ret, list);
  } else {
    _$jscoverage['/node/base.js'].lineData[109]++;
    var args = [index, 0];
    _$jscoverage['/node/base.js'].lineData[110]++;
    args.push.apply(args, list);
    _$jscoverage['/node/base.js'].lineData[111]++;
    AP.splice.apply(ret, args);
  }
  _$jscoverage['/node/base.js'].lineData[113]++;
  return ret;
}, 
  slice: function() {
  _$jscoverage['/node/base.js'].functionData[4]++;
  _$jscoverage['/node/base.js'].lineData[125]++;
  return new Node(slice.apply(this, arguments));
}, 
  getDOMNodes: function() {
  _$jscoverage['/node/base.js'].functionData[5]++;
  _$jscoverage['/node/base.js'].lineData[132]++;
  return slice.call(this);
}, 
  each: function(fn, context) {
  _$jscoverage['/node/base.js'].functionData[6]++;
  _$jscoverage['/node/base.js'].lineData[145]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[147]++;
  util.each(self, function(n, i) {
  _$jscoverage['/node/base.js'].functionData[7]++;
  _$jscoverage['/node/base.js'].lineData[148]++;
  n = new Node(n);
  _$jscoverage['/node/base.js'].lineData[149]++;
  return fn.call(visit33_149_1(context || n), n, i, self);
});
  _$jscoverage['/node/base.js'].lineData[152]++;
  return self;
}, 
  getDOMNode: function() {
  _$jscoverage['/node/base.js'].functionData[8]++;
  _$jscoverage['/node/base.js'].lineData[159]++;
  return this[0];
}, 
  end: function() {
  _$jscoverage['/node/base.js'].functionData[9]++;
  _$jscoverage['/node/base.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[168]++;
  return visit34_168_1(self.__parent || self);
}, 
  filter: function(filter) {
  _$jscoverage['/node/base.js'].functionData[10]++;
  _$jscoverage['/node/base.js'].lineData[177]++;
  return new Node(Dom.filter(this, filter));
}, 
  all: function(selector) {
  _$jscoverage['/node/base.js'].functionData[11]++;
  _$jscoverage['/node/base.js'].lineData[186]++;
  var ret, self = this;
  _$jscoverage['/node/base.js'].lineData[188]++;
  if (visit35_188_1(self.length > 0)) {
    _$jscoverage['/node/base.js'].lineData[189]++;
    ret = Node.all(selector, self);
  } else {
    _$jscoverage['/node/base.js'].lineData[191]++;
    ret = new Node();
  }
  _$jscoverage['/node/base.js'].lineData[193]++;
  ret.__parent = self;
  _$jscoverage['/node/base.js'].lineData[194]++;
  return ret;
}, 
  one: function(selector) {
  _$jscoverage['/node/base.js'].functionData[12]++;
  _$jscoverage['/node/base.js'].lineData[203]++;
  var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
  _$jscoverage['/node/base.js'].lineData[206]++;
  if (visit36_206_1(ret)) {
    _$jscoverage['/node/base.js'].lineData[207]++;
    ret.__parent = self;
  }
  _$jscoverage['/node/base.js'].lineData[209]++;
  return ret;
}};
  _$jscoverage['/node/base.js'].lineData[213]++;
  util.mix(Node, {
  all: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[13]++;
  _$jscoverage['/node/base.js'].lineData[226]++;
  if (visit37_226_1(visit38_226_2(typeof selector === 'string') && visit39_227_1((selector = util.trim(selector)) && visit40_228_1(visit41_228_2(selector.length >= 3) && visit42_229_1(util.startsWith(selector, '<') && util.endsWith(selector, '>')))))) {
    _$jscoverage['/node/base.js'].lineData[231]++;
    if (visit43_231_1(context)) {
      _$jscoverage['/node/base.js'].lineData[232]++;
      if (visit44_232_1(context.getDOMNode)) {
        _$jscoverage['/node/base.js'].lineData[233]++;
        context = context[0];
      }
      _$jscoverage['/node/base.js'].lineData[235]++;
      context = visit45_235_1(context.ownerDocument || context);
    }
    _$jscoverage['/node/base.js'].lineData[237]++;
    return new Node(selector, undefined, context);
  }
  _$jscoverage['/node/base.js'].lineData[239]++;
  return new Node(Dom.query(selector, context));
}, 
  one: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[14]++;
  _$jscoverage['/node/base.js'].lineData[252]++;
  var all = Node.all(selector, context);
  _$jscoverage['/node/base.js'].lineData[253]++;
  return all.length ? all.slice(0, 1) : null;
}});
  _$jscoverage['/node/base.js'].lineData[263]++;
  Node.NodeType = NodeType;
  _$jscoverage['/node/base.js'].lineData[265]++;
  Node.KeyCode = Event.KeyCode;
  _$jscoverage['/node/base.js'].lineData[267]++;
  Node.REPLACE_HISTORY = Event.REPLACE_HISTORY;
  _$jscoverage['/node/base.js'].lineData[269]++;
  return Node;
});
