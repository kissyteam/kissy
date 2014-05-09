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
if (! _$jscoverage['/overlay/dialog-xtpl.js']) {
  _$jscoverage['/overlay/dialog-xtpl.js'] = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[157] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].functionData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[5] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].branchData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['50'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['86'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['122'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['122'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['122'][1].init(3598, 31, 'callRet25 && callRet25.isBuffer');
function visit6_122_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['86'][1].init(1994, 31, 'callRet16 && callRet16.isBuffer');
function visit5_86_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['50'][1].init(401, 29, 'callRet7 && callRet7.isBuffer');
function visit4_50_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'][1].init(1117, 29, 'callRet2 && callRet2.isBuffer');
function visit3_28_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  var dialogXtpl = function(scope, buffer, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20]++;
  buffer.write('', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21]++;
  var option0 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22]++;
  var params1 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23]++;
  params1.push('./overlay-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  option0.params = params1;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  require("./overlay-xtpl");
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  var callRet2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  callRet2 = extendCommand.call(tpl, scope, option0, buffer, 1);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  if (visit3_28_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
    buffer = callRet2;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
    callRet2 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
  buffer.write(callRet2, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
  buffer.write('\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  var params4 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38]++;
  params4.push('ks-overlay-content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  option3.params = params4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  buffer.write('\r\n    <div class="', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  params6.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  option5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  var callRet7;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  callRet7 = callFnUtil(tpl, scope, option5, buffer, ["getBaseCssClasses"], 0, 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  if (visit4_50_1(callRet7 && callRet7.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
    buffer = callRet7;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
    callRet7 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  buffer.write(callRet7, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  buffer.write('"\r\n         style="\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60]++;
  var id10 = scope.resolve(["headerStyle"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  params9.push(id10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  option8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  option8.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  var id11 = scope.resolve(["xindex"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  buffer.write(id11, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  buffer.write(':', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  var id12 = scope.resolve(["this"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  buffer.write(id12, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  buffer = eachCommand.call(tpl, scope, option8, buffer, 5);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  var id13 = scope.resolve(["headerContent"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  buffer.write(id13, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  buffer.write('</div>\r\n\r\n    <div class="', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  var params15 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  params15.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  option14.params = params15;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  var callRet16;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  callRet16 = callFnUtil(tpl, scope, option14, buffer, ["getBaseCssClasses"], 0, 10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  if (visit5_86_1(callRet16 && callRet16.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
    buffer = callRet16;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
    callRet16 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
  buffer.write(callRet16, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
  buffer.write('"\r\n         style="\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92]++;
  var option17 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  var params18 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  var id19 = scope.resolve(["bodyStyle"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97]++;
  params18.push(id19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  option17.params = params18;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  option17.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  var id20 = scope.resolve(["xindex"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  buffer.write(id20, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  buffer.write(':', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  var id21 = scope.resolve(["this"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  buffer.write(id21, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  buffer = eachCommand.call(tpl, scope, option17, buffer, 12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111]++;
  var id22 = scope.resolve(["bodyContent"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  buffer.write(id22, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  buffer.write('</div>\r\n\r\n    <div class="', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  var params24 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  params24.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119]++;
  option23.params = params24;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  var callRet25;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121]++;
  callRet25 = callFnUtil(tpl, scope, option23, buffer, ["getBaseCssClasses"], 0, 17);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  if (visit6_122_1(callRet25 && callRet25.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
    buffer = callRet25;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
    callRet25 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  buffer.write(callRet25, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
  buffer.write('"\r\n         style="\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131]++;
  var params27 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132]++;
  var id28 = scope.resolve(["footerStyle"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[133]++;
  params27.push(id28);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134]++;
  option26.params = params27;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135]++;
  option26.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137]++;
  var id29 = scope.resolve(["xindex"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138]++;
  buffer.write(id29, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139]++;
  buffer.write(':', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[140]++;
  var id30 = scope.resolve(["this"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141]++;
  buffer.write(id30, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145]++;
  buffer = eachCommand.call(tpl, scope, option26, buffer, 19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147]++;
  var id31 = scope.resolve(["footerContent"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148]++;
  buffer.write(id31, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149]++;
  buffer.write('</div>\r\n    <div tabindex="0"></div>\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152]++;
  buffer = blockCommand.call(tpl, scope, option3, buffer, 2);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155]++;
  dialogXtpl.TPL_NAME = module.name;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[156]++;
  dialogXtpl.version = "5.0.0";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[157]++;
  return dialogXtpl;
});
