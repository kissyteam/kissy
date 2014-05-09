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
if (! _$jscoverage['/tree/node-xtpl.js']) {
  _$jscoverage['/tree/node-xtpl.js'] = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[182] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].functionData) {
  _$jscoverage['/tree/node-xtpl.js'].functionData = [];
  _$jscoverage['/tree/node-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].branchData) {
  _$jscoverage['/tree/node-xtpl.js'].branchData = {};
  _$jscoverage['/tree/node-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['52'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['70'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['96'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['110'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['128'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['142'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['159'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['159'][1] = new BranchData();
}
_$jscoverage['/tree/node-xtpl.js'].branchData['159'][1].init(6313, 31, 'callRet32 && callRet32.isBuffer');
function visit28_159_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['142'][1].init(5635, 31, 'callRet28 && callRet28.isBuffer');
function visit27_142_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['128'][1].init(5078, 31, 'callRet25 && callRet25.isBuffer');
function visit26_128_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['110'][1].init(1125, 31, 'callRet22 && callRet22.isBuffer');
function visit25_110_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['96'][1].init(552, 31, 'callRet19 && callRet19.isBuffer');
function visit24_96_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['70'][1].init(2728, 31, 'callRet11 && callRet11.isBuffer');
function visit23_70_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['52'][1].init(395, 29, 'callRet8 && callRet8.isBuffer');
function visit22_52_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['29'][1].init(1136, 29, 'callRet2 && callRet2.isBuffer');
function visit21_29_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[0]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4]++;
  var node = function(scope, buffer, undefined) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[1]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/tree/node-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/tree/node-xtpl.js'].lineData[20]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[25]++;
  params1.push('row');
  _$jscoverage['/tree/node-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/tree/node-xtpl.js'].lineData[27]++;
  var callRet2;
  _$jscoverage['/tree/node-xtpl.js'].lineData[28]++;
  callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/tree/node-xtpl.js'].lineData[29]++;
  if (visit21_29_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[30]++;
    buffer = callRet2;
    _$jscoverage['/tree/node-xtpl.js'].lineData[31]++;
    callRet2 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[33]++;
  buffer.write(callRet2, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[34]++;
  buffer.write('\r\n     ', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[35]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[38]++;
  var params4 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[39]++;
  var id5 = scope.resolve(["selected"], 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[40]++;
  params4.push(id5);
  _$jscoverage['/tree/node-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/tree/node-xtpl.js'].lineData[42]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[2]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[44]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[47]++;
  var params7 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[48]++;
  params7.push('selected');
  _$jscoverage['/tree/node-xtpl.js'].lineData[49]++;
  option6.params = params7;
  _$jscoverage['/tree/node-xtpl.js'].lineData[50]++;
  var callRet8;
  _$jscoverage['/tree/node-xtpl.js'].lineData[51]++;
  callRet8 = callFnUtil(tpl, scope, option6, buffer, ["getBaseCssClasses"], 0, 3);
  _$jscoverage['/tree/node-xtpl.js'].lineData[52]++;
  if (visit22_52_1(callRet8 && callRet8.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[53]++;
    buffer = callRet8;
    _$jscoverage['/tree/node-xtpl.js'].lineData[54]++;
    callRet8 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[56]++;
  buffer.write(callRet8, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[57]++;
  buffer.write('\r\n     ', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[58]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[60]++;
  buffer = ifCommand.call(tpl, scope, option3, buffer, 2);
  _$jscoverage['/tree/node-xtpl.js'].lineData[61]++;
  buffer.write('\r\n     ">\r\n    <div class="', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[62]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[65]++;
  var params10 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[66]++;
  params10.push('expand-icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[67]++;
  option9.params = params10;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68]++;
  var callRet11;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69]++;
  callRet11 = callFnUtil(tpl, scope, option9, buffer, ["getBaseCssClasses"], 0, 6);
  _$jscoverage['/tree/node-xtpl.js'].lineData[70]++;
  if (visit23_70_1(callRet11 && callRet11.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[71]++;
    buffer = callRet11;
    _$jscoverage['/tree/node-xtpl.js'].lineData[72]++;
    callRet11 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[74]++;
  buffer.write(callRet11, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[75]++;
  buffer.write('">\r\n    </div>\r\n    ', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[76]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[79]++;
  var params13 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[80]++;
  var id14 = scope.resolve(["checkable"], 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[81]++;
  params13.push(id14);
  _$jscoverage['/tree/node-xtpl.js'].lineData[82]++;
  option12.params = params13;
  _$jscoverage['/tree/node-xtpl.js'].lineData[83]++;
  option12.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[3]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84]++;
  buffer.write('\r\n    <div class="', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[85]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[88]++;
  var params16 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[89]++;
  var exp18 = 'checked';
  _$jscoverage['/tree/node-xtpl.js'].lineData[90]++;
  var id17 = scope.resolve(["checkState"], 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[91]++;
  exp18 = ('checked') + (id17);
  _$jscoverage['/tree/node-xtpl.js'].lineData[92]++;
  params16.push(exp18);
  _$jscoverage['/tree/node-xtpl.js'].lineData[93]++;
  option15.params = params16;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94]++;
  var callRet19;
  _$jscoverage['/tree/node-xtpl.js'].lineData[95]++;
  callRet19 = callFnUtil(tpl, scope, option15, buffer, ["getBaseCssClasses"], 0, 9);
  _$jscoverage['/tree/node-xtpl.js'].lineData[96]++;
  if (visit24_96_1(callRet19 && callRet19.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[97]++;
    buffer = callRet19;
    _$jscoverage['/tree/node-xtpl.js'].lineData[98]++;
    callRet19 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[100]++;
  buffer.write(callRet19, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[101]++;
  buffer.write(' ', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[102]++;
  var option20 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[105]++;
  var params21 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[106]++;
  params21.push('checked');
  _$jscoverage['/tree/node-xtpl.js'].lineData[107]++;
  option20.params = params21;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108]++;
  var callRet22;
  _$jscoverage['/tree/node-xtpl.js'].lineData[109]++;
  callRet22 = callFnUtil(tpl, scope, option20, buffer, ["getBaseCssClasses"], 0, 9);
  _$jscoverage['/tree/node-xtpl.js'].lineData[110]++;
  if (visit25_110_1(callRet22 && callRet22.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[111]++;
    buffer = callRet22;
    _$jscoverage['/tree/node-xtpl.js'].lineData[112]++;
    callRet22 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[114]++;
  buffer.write(callRet22, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[115]++;
  buffer.write('"></div>\r\n    ', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[116]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[118]++;
  buffer = ifCommand.call(tpl, scope, option12, buffer, 8);
  _$jscoverage['/tree/node-xtpl.js'].lineData[119]++;
  buffer.write('\r\n    <div class="', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[120]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[123]++;
  var params24 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[124]++;
  params24.push('icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[125]++;
  option23.params = params24;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126]++;
  var callRet25;
  _$jscoverage['/tree/node-xtpl.js'].lineData[127]++;
  callRet25 = callFnUtil(tpl, scope, option23, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/tree/node-xtpl.js'].lineData[128]++;
  if (visit26_128_1(callRet25 && callRet25.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[129]++;
    buffer = callRet25;
    _$jscoverage['/tree/node-xtpl.js'].lineData[130]++;
    callRet25 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[132]++;
  buffer.write(callRet25, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[133]++;
  buffer.write('">\r\n\r\n    </div>\r\n    <div class="', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[134]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[137]++;
  var params27 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[138]++;
  params27.push('content');
  _$jscoverage['/tree/node-xtpl.js'].lineData[139]++;
  option26.params = params27;
  _$jscoverage['/tree/node-xtpl.js'].lineData[140]++;
  var callRet28;
  _$jscoverage['/tree/node-xtpl.js'].lineData[141]++;
  callRet28 = callFnUtil(tpl, scope, option26, buffer, ["getBaseCssClasses"], 0, 14);
  _$jscoverage['/tree/node-xtpl.js'].lineData[142]++;
  if (visit27_142_1(callRet28 && callRet28.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[143]++;
    buffer = callRet28;
    _$jscoverage['/tree/node-xtpl.js'].lineData[144]++;
    callRet28 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[146]++;
  buffer.write(callRet28, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[147]++;
  buffer.write('">', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[148]++;
  var id29 = scope.resolve(["content"], 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[149]++;
  buffer.write(id29, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[150]++;
  buffer.write('</div>\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[151]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[154]++;
  var params31 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[155]++;
  params31.push('children');
  _$jscoverage['/tree/node-xtpl.js'].lineData[156]++;
  option30.params = params31;
  _$jscoverage['/tree/node-xtpl.js'].lineData[157]++;
  var callRet32;
  _$jscoverage['/tree/node-xtpl.js'].lineData[158]++;
  callRet32 = callFnUtil(tpl, scope, option30, buffer, ["getBaseCssClasses"], 0, 16);
  _$jscoverage['/tree/node-xtpl.js'].lineData[159]++;
  if (visit28_159_1(callRet32 && callRet32.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[160]++;
    buffer = callRet32;
    _$jscoverage['/tree/node-xtpl.js'].lineData[161]++;
    callRet32 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[163]++;
  buffer.write(callRet32, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[164]++;
  buffer.write('"\r\n', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[165]++;
  var option33 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[168]++;
  var params34 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[169]++;
  var id35 = scope.resolve(["expanded"], 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[170]++;
  params34.push(!(id35));
  _$jscoverage['/tree/node-xtpl.js'].lineData[171]++;
  option33.params = params34;
  _$jscoverage['/tree/node-xtpl.js'].lineData[172]++;
  option33.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[4]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[173]++;
  buffer.write('\r\nstyle="display:none"\r\n', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[174]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[176]++;
  buffer = ifCommand.call(tpl, scope, option33, buffer, 17);
  _$jscoverage['/tree/node-xtpl.js'].lineData[177]++;
  buffer.write('\r\n>\r\n</div>', 0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[178]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[180]++;
  node.TPL_NAME = module.name;
  _$jscoverage['/tree/node-xtpl.js'].lineData[181]++;
  node.version = "5.0.0";
  _$jscoverage['/tree/node-xtpl.js'].lineData[182]++;
  return node;
});
