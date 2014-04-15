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
  _$jscoverage['/node/base.js'].lineData[26] = 0;
  _$jscoverage['/node/base.js'].lineData[27] = 0;
  _$jscoverage['/node/base.js'].lineData[30] = 0;
  _$jscoverage['/node/base.js'].lineData[31] = 0;
  _$jscoverage['/node/base.js'].lineData[34] = 0;
  _$jscoverage['/node/base.js'].lineData[35] = 0;
  _$jscoverage['/node/base.js'].lineData[39] = 0;
  _$jscoverage['/node/base.js'].lineData[40] = 0;
  _$jscoverage['/node/base.js'].lineData[41] = 0;
  _$jscoverage['/node/base.js'].lineData[43] = 0;
  _$jscoverage['/node/base.js'].lineData[45] = 0;
  _$jscoverage['/node/base.js'].lineData[46] = 0;
  _$jscoverage['/node/base.js'].lineData[47] = 0;
  _$jscoverage['/node/base.js'].lineData[49] = 0;
  _$jscoverage['/node/base.js'].lineData[50] = 0;
  _$jscoverage['/node/base.js'].lineData[51] = 0;
  _$jscoverage['/node/base.js'].lineData[54] = 0;
  _$jscoverage['/node/base.js'].lineData[57] = 0;
  _$jscoverage['/node/base.js'].lineData[58] = 0;
  _$jscoverage['/node/base.js'].lineData[59] = 0;
  _$jscoverage['/node/base.js'].lineData[62] = 0;
  _$jscoverage['/node/base.js'].lineData[79] = 0;
  _$jscoverage['/node/base.js'].lineData[80] = 0;
  _$jscoverage['/node/base.js'].lineData[81] = 0;
  _$jscoverage['/node/base.js'].lineData[82] = 0;
  _$jscoverage['/node/base.js'].lineData[84] = 0;
  _$jscoverage['/node/base.js'].lineData[87] = 0;
  _$jscoverage['/node/base.js'].lineData[99] = 0;
  _$jscoverage['/node/base.js'].lineData[100] = 0;
  _$jscoverage['/node/base.js'].lineData[101] = 0;
  _$jscoverage['/node/base.js'].lineData[103] = 0;
  _$jscoverage['/node/base.js'].lineData[105] = 0;
  _$jscoverage['/node/base.js'].lineData[106] = 0;
  _$jscoverage['/node/base.js'].lineData[108] = 0;
  _$jscoverage['/node/base.js'].lineData[109] = 0;
  _$jscoverage['/node/base.js'].lineData[110] = 0;
  _$jscoverage['/node/base.js'].lineData[112] = 0;
  _$jscoverage['/node/base.js'].lineData[124] = 0;
  _$jscoverage['/node/base.js'].lineData[131] = 0;
  _$jscoverage['/node/base.js'].lineData[144] = 0;
  _$jscoverage['/node/base.js'].lineData[146] = 0;
  _$jscoverage['/node/base.js'].lineData[147] = 0;
  _$jscoverage['/node/base.js'].lineData[148] = 0;
  _$jscoverage['/node/base.js'].lineData[151] = 0;
  _$jscoverage['/node/base.js'].lineData[158] = 0;
  _$jscoverage['/node/base.js'].lineData[166] = 0;
  _$jscoverage['/node/base.js'].lineData[167] = 0;
  _$jscoverage['/node/base.js'].lineData[176] = 0;
  _$jscoverage['/node/base.js'].lineData[185] = 0;
  _$jscoverage['/node/base.js'].lineData[187] = 0;
  _$jscoverage['/node/base.js'].lineData[188] = 0;
  _$jscoverage['/node/base.js'].lineData[190] = 0;
  _$jscoverage['/node/base.js'].lineData[192] = 0;
  _$jscoverage['/node/base.js'].lineData[193] = 0;
  _$jscoverage['/node/base.js'].lineData[202] = 0;
  _$jscoverage['/node/base.js'].lineData[205] = 0;
  _$jscoverage['/node/base.js'].lineData[206] = 0;
  _$jscoverage['/node/base.js'].lineData[208] = 0;
  _$jscoverage['/node/base.js'].lineData[212] = 0;
  _$jscoverage['/node/base.js'].lineData[225] = 0;
  _$jscoverage['/node/base.js'].lineData[230] = 0;
  _$jscoverage['/node/base.js'].lineData[231] = 0;
  _$jscoverage['/node/base.js'].lineData[232] = 0;
  _$jscoverage['/node/base.js'].lineData[234] = 0;
  _$jscoverage['/node/base.js'].lineData[236] = 0;
  _$jscoverage['/node/base.js'].lineData[238] = 0;
  _$jscoverage['/node/base.js'].lineData[251] = 0;
  _$jscoverage['/node/base.js'].lineData[252] = 0;
  _$jscoverage['/node/base.js'].lineData[262] = 0;
  _$jscoverage['/node/base.js'].lineData[264] = 0;
  _$jscoverage['/node/base.js'].lineData[266] = 0;
  _$jscoverage['/node/base.js'].lineData[268] = 0;
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
  _$jscoverage['/node/base.js'].branchData['30'] = [];
  _$jscoverage['/node/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['34'] = [];
  _$jscoverage['/node/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['39'] = [];
  _$jscoverage['/node/base.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['41'] = [];
  _$jscoverage['/node/base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['45'] = [];
  _$jscoverage['/node/base.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['49'] = [];
  _$jscoverage['/node/base.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['80'] = [];
  _$jscoverage['/node/base.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['81'] = [];
  _$jscoverage['/node/base.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['99'] = [];
  _$jscoverage['/node/base.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['105'] = [];
  _$jscoverage['/node/base.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['148'] = [];
  _$jscoverage['/node/base.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['167'] = [];
  _$jscoverage['/node/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['187'] = [];
  _$jscoverage['/node/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['205'] = [];
  _$jscoverage['/node/base.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['225'] = [];
  _$jscoverage['/node/base.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['226'] = [];
  _$jscoverage['/node/base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['227'] = [];
  _$jscoverage['/node/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['227'][2] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['228'] = [];
  _$jscoverage['/node/base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['230'] = [];
  _$jscoverage['/node/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['231'] = [];
  _$jscoverage['/node/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/node/base.js'].branchData['234'] = [];
  _$jscoverage['/node/base.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/node/base.js'].branchData['234'][1].init(149, 32, 'context.ownerDocument || context');
function visit45_234_1(result) {
  _$jscoverage['/node/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['231'][1].init(26, 18, 'context.getDOMNode');
function visit44_231_1(result) {
  _$jscoverage['/node/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['230'][1].init(22, 7, 'context');
function visit43_230_1(result) {
  _$jscoverage['/node/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['228'][1].init(40, 73, 'S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit42_228_1(result) {
  _$jscoverage['/node/base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['227'][2].init(210, 20, 'selector.length >= 3');
function visit41_227_2(result) {
  _$jscoverage['/node/base.js'].branchData['227'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['227'][1].init(48, 114, 'selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit40_227_1(result) {
  _$jscoverage['/node/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['226'][1].init(49, 163, '(selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit39_226_1(result) {
  _$jscoverage['/node/base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['225'][2].init(108, 28, 'typeof selector === \'string\'');
function visit38_225_2(result) {
  _$jscoverage['/node/base.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['225'][1].init(108, 213, 'typeof selector === \'string\' && (selector = S.trim(selector)) && selector.length >= 3 && S.startsWith(selector, \'<\') && S.endsWith(selector, \'>\')');
function visit37_225_1(result) {
  _$jscoverage['/node/base.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['205'][1].init(151, 3, 'ret');
function visit36_205_1(result) {
  _$jscoverage['/node/base.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['187'][1].init(70, 15, 'self.length > 0');
function visit35_187_1(result) {
  _$jscoverage['/node/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['167'][1].init(51, 21, 'self.__parent || self');
function visit34_167_1(result) {
  _$jscoverage['/node/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['148'][1].init(67, 12, 'context || n');
function visit33_148_1(result) {
  _$jscoverage['/node/base.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['105'][1].init(259, 19, 'index === undefined');
function visit32_105_1(result) {
  _$jscoverage['/node/base.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['99'][1].init(18, 27, 'typeof context === \'number\'');
function visit31_99_1(result) {
  _$jscoverage['/node/base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['81'][1].init(22, 20, 'index >= self.length');
function visit30_81_1(result) {
  _$jscoverage['/node/base.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['80'][1].init(48, 25, 'typeof index === \'number\'');
function visit29_80_1(result) {
  _$jscoverage['/node/base.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['49'][1].init(762, 38, 'S.isArray(html) || isDomNodeList(html)');
function visit28_49_1(result) {
  _$jscoverage['/node/base.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['45'][1].init(160, 52, 'domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit27_45_1(result) {
  _$jscoverage['/node/base.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['41'][1].init(375, 24, 'typeof html === \'string\'');
function visit26_41_1(result) {
  _$jscoverage['/node/base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['39'][1].init(319, 5, '!html');
function visit25_39_1(result) {
  _$jscoverage['/node/base.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['34'][1].init(148, 23, '!(self instanceof Node)');
function visit24_34_1(result) {
  _$jscoverage['/node/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].branchData['30'][1].init(64, 20, 'html instanceof Node');
function visit23_30_1(result) {
  _$jscoverage['/node/base.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/node/base.js'].functionData[0]++;
  _$jscoverage['/node/base.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/node/base.js'].lineData[8]++;
  var Event = require('event/dom');
  _$jscoverage['/node/base.js'].lineData[9]++;
  var AP = Array.prototype, slice = AP.slice, NodeType = Dom.NodeType, push = AP.push, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList;
  _$jscoverage['/node/base.js'].lineData[26]++;
  function Node(html, props, ownerDocument) {
    _$jscoverage['/node/base.js'].functionData[1]++;
    _$jscoverage['/node/base.js'].lineData[27]++;
    var self = this, domNode;
    _$jscoverage['/node/base.js'].lineData[30]++;
    if (visit23_30_1(html instanceof Node)) {
      _$jscoverage['/node/base.js'].lineData[31]++;
      return html.slice();
    }
    _$jscoverage['/node/base.js'].lineData[34]++;
    if (visit24_34_1(!(self instanceof Node))) {
      _$jscoverage['/node/base.js'].lineData[35]++;
      return new Node(html, props, ownerDocument);
    }
    _$jscoverage['/node/base.js'].lineData[39]++;
    if (visit25_39_1(!html)) {
      _$jscoverage['/node/base.js'].lineData[40]++;
      return self;
    } else {
      _$jscoverage['/node/base.js'].lineData[41]++;
      if (visit26_41_1(typeof html === 'string')) {
        _$jscoverage['/node/base.js'].lineData[43]++;
        domNode = Dom.create(html, props, ownerDocument);
        _$jscoverage['/node/base.js'].lineData[45]++;
        if (visit27_45_1(domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/node/base.js'].lineData[46]++;
          push.apply(this, makeArray(domNode.childNodes));
          _$jscoverage['/node/base.js'].lineData[47]++;
          return self;
        }
      } else {
        _$jscoverage['/node/base.js'].lineData[49]++;
        if (visit28_49_1(S.isArray(html) || isDomNodeList(html))) {
          _$jscoverage['/node/base.js'].lineData[50]++;
          push.apply(self, makeArray(html));
          _$jscoverage['/node/base.js'].lineData[51]++;
          return self;
        } else {
          _$jscoverage['/node/base.js'].lineData[54]++;
          domNode = html;
        }
      }
    }
    _$jscoverage['/node/base.js'].lineData[57]++;
    self[0] = domNode;
    _$jscoverage['/node/base.js'].lineData[58]++;
    self.length = 1;
    _$jscoverage['/node/base.js'].lineData[59]++;
    return self;
  }
  _$jscoverage['/node/base.js'].lineData[62]++;
  Node.prototype = {
  constructor: Node, 
  isNode: true, 
  length: 0, 
  item: function(index) {
  _$jscoverage['/node/base.js'].functionData[2]++;
  _$jscoverage['/node/base.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[80]++;
  if (visit29_80_1(typeof index === 'number')) {
    _$jscoverage['/node/base.js'].lineData[81]++;
    if (visit30_81_1(index >= self.length)) {
      _$jscoverage['/node/base.js'].lineData[82]++;
      return null;
    } else {
      _$jscoverage['/node/base.js'].lineData[84]++;
      return new Node(self[index]);
    }
  } else {
    _$jscoverage['/node/base.js'].lineData[87]++;
    return new Node(index);
  }
}, 
  add: function(selector, context, index) {
  _$jscoverage['/node/base.js'].functionData[3]++;
  _$jscoverage['/node/base.js'].lineData[99]++;
  if (visit31_99_1(typeof context === 'number')) {
    _$jscoverage['/node/base.js'].lineData[100]++;
    index = context;
    _$jscoverage['/node/base.js'].lineData[101]++;
    context = undefined;
  }
  _$jscoverage['/node/base.js'].lineData[103]++;
  var list = Node.all(selector, context).getDOMNodes(), ret = new Node(this);
  _$jscoverage['/node/base.js'].lineData[105]++;
  if (visit32_105_1(index === undefined)) {
    _$jscoverage['/node/base.js'].lineData[106]++;
    push.apply(ret, list);
  } else {
    _$jscoverage['/node/base.js'].lineData[108]++;
    var args = [index, 0];
    _$jscoverage['/node/base.js'].lineData[109]++;
    args.push.apply(args, list);
    _$jscoverage['/node/base.js'].lineData[110]++;
    AP.splice.apply(ret, args);
  }
  _$jscoverage['/node/base.js'].lineData[112]++;
  return ret;
}, 
  slice: function() {
  _$jscoverage['/node/base.js'].functionData[4]++;
  _$jscoverage['/node/base.js'].lineData[124]++;
  return new Node(slice.apply(this, arguments));
}, 
  getDOMNodes: function() {
  _$jscoverage['/node/base.js'].functionData[5]++;
  _$jscoverage['/node/base.js'].lineData[131]++;
  return slice.call(this);
}, 
  each: function(fn, context) {
  _$jscoverage['/node/base.js'].functionData[6]++;
  _$jscoverage['/node/base.js'].lineData[144]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[146]++;
  S.each(self, function(n, i) {
  _$jscoverage['/node/base.js'].functionData[7]++;
  _$jscoverage['/node/base.js'].lineData[147]++;
  n = new Node(n);
  _$jscoverage['/node/base.js'].lineData[148]++;
  return fn.call(visit33_148_1(context || n), n, i, self);
});
  _$jscoverage['/node/base.js'].lineData[151]++;
  return self;
}, 
  getDOMNode: function() {
  _$jscoverage['/node/base.js'].functionData[8]++;
  _$jscoverage['/node/base.js'].lineData[158]++;
  return this[0];
}, 
  end: function() {
  _$jscoverage['/node/base.js'].functionData[9]++;
  _$jscoverage['/node/base.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/node/base.js'].lineData[167]++;
  return visit34_167_1(self.__parent || self);
}, 
  filter: function(filter) {
  _$jscoverage['/node/base.js'].functionData[10]++;
  _$jscoverage['/node/base.js'].lineData[176]++;
  return new Node(Dom.filter(this, filter));
}, 
  all: function(selector) {
  _$jscoverage['/node/base.js'].functionData[11]++;
  _$jscoverage['/node/base.js'].lineData[185]++;
  var ret, self = this;
  _$jscoverage['/node/base.js'].lineData[187]++;
  if (visit35_187_1(self.length > 0)) {
    _$jscoverage['/node/base.js'].lineData[188]++;
    ret = Node.all(selector, self);
  } else {
    _$jscoverage['/node/base.js'].lineData[190]++;
    ret = new Node();
  }
  _$jscoverage['/node/base.js'].lineData[192]++;
  ret.__parent = self;
  _$jscoverage['/node/base.js'].lineData[193]++;
  return ret;
}, 
  one: function(selector) {
  _$jscoverage['/node/base.js'].functionData[12]++;
  _$jscoverage['/node/base.js'].lineData[202]++;
  var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
  _$jscoverage['/node/base.js'].lineData[205]++;
  if (visit36_205_1(ret)) {
    _$jscoverage['/node/base.js'].lineData[206]++;
    ret.__parent = self;
  }
  _$jscoverage['/node/base.js'].lineData[208]++;
  return ret;
}};
  _$jscoverage['/node/base.js'].lineData[212]++;
  S.mix(Node, {
  all: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[13]++;
  _$jscoverage['/node/base.js'].lineData[225]++;
  if (visit37_225_1(visit38_225_2(typeof selector === 'string') && visit39_226_1((selector = S.trim(selector)) && visit40_227_1(visit41_227_2(selector.length >= 3) && visit42_228_1(S.startsWith(selector, '<') && S.endsWith(selector, '>')))))) {
    _$jscoverage['/node/base.js'].lineData[230]++;
    if (visit43_230_1(context)) {
      _$jscoverage['/node/base.js'].lineData[231]++;
      if (visit44_231_1(context.getDOMNode)) {
        _$jscoverage['/node/base.js'].lineData[232]++;
        context = context[0];
      }
      _$jscoverage['/node/base.js'].lineData[234]++;
      context = visit45_234_1(context.ownerDocument || context);
    }
    _$jscoverage['/node/base.js'].lineData[236]++;
    return new Node(selector, undefined, context);
  }
  _$jscoverage['/node/base.js'].lineData[238]++;
  return new Node(Dom.query(selector, context));
}, 
  one: function(selector, context) {
  _$jscoverage['/node/base.js'].functionData[14]++;
  _$jscoverage['/node/base.js'].lineData[251]++;
  var all = Node.all(selector, context);
  _$jscoverage['/node/base.js'].lineData[252]++;
  return all.length ? all.slice(0, 1) : null;
}});
  _$jscoverage['/node/base.js'].lineData[262]++;
  Node.NodeType = NodeType;
  _$jscoverage['/node/base.js'].lineData[264]++;
  Node.KeyCode = Event.KeyCode;
  _$jscoverage['/node/base.js'].lineData[266]++;
  Node.REPLACE_HISTORY = Event.REPLACE_HISTORY;
  _$jscoverage['/node/base.js'].lineData[268]++;
  return Node;
});
