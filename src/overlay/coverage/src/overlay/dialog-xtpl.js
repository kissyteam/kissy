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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[159] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['31'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['53'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['125'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['125'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['125'][1].init(3631, 31, 'callRet25 && callRet25.isBuffer');
function visit7_125_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'][1].init(2012, 31, 'callRet16 && callRet16.isBuffer');
function visit6_89_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['53'][1].init(404, 29, 'callRet7 && callRet7.isBuffer');
function visit5_53_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['31'][1].init(1334, 29, 'callRet2 && callRet2.isBuffer');
function visit4_31_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'][1].init(802, 21, '"5.0.0" !== S.version');
function visit3_20_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20]++;
  if (visit3_20_1("5.0.0" !== S.version)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23]++;
  buffer.write('', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  var option0 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  var params1 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  params1.push('./overlay-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  option0.params = params1;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  require("./overlay-xtpl");
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  var callRet2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
  callRet2 = extendCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
  if (visit4_31_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
    buffer = callRet2;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
    callRet2 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35]++;
  buffer.write(callRet2, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
  buffer.write('\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  var params4 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  params4.push('ks-overlay-content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  option3.params = params4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  buffer.write('\r\n    <div class="', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  params6.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  option5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  var callRet7;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  callRet7 = callFnUtil(engine, scope, option5, buffer, ["getBaseCssClasses"], 0, 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  if (visit5_53_1(callRet7 && callRet7.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
    buffer = callRet7;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
    callRet7 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  buffer.write(callRet7, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  buffer.write('"\r\n         style="\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  var id10 = scope.resolve(["headerStyle"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  params9.push(id10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  option8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  option8.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  var id11 = scope.resolve(["xindex"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  buffer.write(id11, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  buffer.write(':', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  var id12 = scope.resolve(["this"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  buffer.write(id12, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  buffer = eachCommand.call(engine, scope, option8, buffer, 5, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  var id13 = scope.resolve(["headerContent"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  buffer.write(id13, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  buffer.write('</div>\r\n\r\n    <div class="', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  var params15 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  params15.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  option14.params = params15;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  var callRet16;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  callRet16 = callFnUtil(engine, scope, option14, buffer, ["getBaseCssClasses"], 0, 10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  if (visit6_89_1(callRet16 && callRet16.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
    buffer = callRet16;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
    callRet16 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  buffer.write(callRet16, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer.write('"\r\n         style="\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  var option17 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  var params18 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  var id19 = scope.resolve(["bodyStyle"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  params18.push(id19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  option17.params = params18;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  option17.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  var id20 = scope.resolve(["xindex"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  buffer.write(id20, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  buffer.write(':', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  var id21 = scope.resolve(["this"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
  buffer.write(id21, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  buffer = eachCommand.call(engine, scope, option17, buffer, 12, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  var id22 = scope.resolve(["bodyContent"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  buffer.write(id22, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  buffer.write('</div>\r\n\r\n    <div class="', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  var params24 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121]++;
  params24.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  option23.params = params24;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
  var callRet25;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  callRet25 = callFnUtil(engine, scope, option23, buffer, ["getBaseCssClasses"], 0, 17);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  if (visit7_125_1(callRet25 && callRet25.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
    buffer = callRet25;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
    callRet25 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129]++;
  buffer.write(callRet25, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  buffer.write('"\r\n         style="\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134]++;
  var params27 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135]++;
  var id28 = scope.resolve(["footerStyle"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136]++;
  params27.push(id28);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137]++;
  option26.params = params27;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138]++;
  option26.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[140]++;
  var id29 = scope.resolve(["xindex"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141]++;
  buffer.write(id29, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142]++;
  buffer.write(':', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143]++;
  var id30 = scope.resolve(["this"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[144]++;
  buffer.write(id30, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148]++;
  buffer = eachCommand.call(engine, scope, option26, buffer, 19, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150]++;
  var id31 = scope.resolve(["footerContent"], 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[151]++;
  buffer.write(id31, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152]++;
  buffer.write('</div>\r\n    <div tabindex="0"></div>\r\n', 0);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155]++;
  buffer = blockCommand.call(engine, scope, option3, buffer, 2, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[156]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[158]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[159]++;
  return t;
});
