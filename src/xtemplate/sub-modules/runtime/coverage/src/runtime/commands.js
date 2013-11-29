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
if (! _$jscoverage['/runtime/commands.js']) {
  _$jscoverage['/runtime/commands.js'] = {};
  _$jscoverage['/runtime/commands.js'].lineData = [];
  _$jscoverage['/runtime/commands.js'].lineData[6] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[7] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[8] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[9] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[11] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[13] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[14] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[15] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[17] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[18] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[19] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[22] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[24] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[25] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[29] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[41] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[42] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[44] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[45] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[48] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[52] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[53] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[61] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[64] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[65] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[68] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[74] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[75] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[78] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[82] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[84] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[88] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[95] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[97] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[101] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[102] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[107] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[108] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[127] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[131] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[132] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[134] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[136] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[139] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[152] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[153] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[155] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[157] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[159] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[164] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].functionData) {
  _$jscoverage['/runtime/commands.js'].functionData = [];
  _$jscoverage['/runtime/commands.js'].functionData[0] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[1] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[2] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[3] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[4] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[5] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[6] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[7] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[8] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['15'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['22'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['24'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['26'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['33'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['44'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['52'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['62'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['67'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['77'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['78'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['81'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['95'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['101'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['110'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['111'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['136'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['138'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['148'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['148'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['148'][1].init(107, 6, '!macro');
function visit20_148_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['138'][1].init(80, 18, '!macros[macroName]');
function visit19_138_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['136'][1].init(210, 9, 'config.fn');
function visit18_136_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['111'][1].init(21, 24, 'myName === \'unspecified\'');
function visit17_111_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['110'][1].init(501, 28, 'subTplName.charAt(0) === \'.\'');
function visit16_110_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['101'][1].init(239, 11, 'config.hash');
function visit15_101_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['95'][2].init(69, 19, 'params.length !== 1');
function visit14_95_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['95'][1].init(58, 30, '!params || params.length !== 1');
function visit13_95_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['81'][1].init(254, 14, 'config.inverse');
function visit12_81_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['78'][1].init(21, 9, 'config.fn');
function visit11_78_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['77'][1].init(122, 6, 'param0');
function visit10_77_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['67'][1].init(345, 14, 'config.inverse');
function visit9_67_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['62'][1].init(122, 6, 'param0');
function visit8_62_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['52'][1].init(1624, 14, 'config.inverse');
function visit7_52_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['44'][1].init(184, 9, 'valueName');
function visit6_44_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['33'][1].init(325, 9, 'valueName');
function visit5_33_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['26'][1].init(86, 15, 'xindex < xcount');
function visit4_26_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['24'][1].init(60, 17, 'S.isArray(param0)');
function visit3_24_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['22'][1].init(344, 6, 'param0');
function visit2_22_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['15'][1].init(106, 21, 'params[2] || \'xindex\'');
function visit1_15_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime/commands.js'].functionData[0]++;
  _$jscoverage['/runtime/commands.js'].lineData[7]++;
  var commands;
  _$jscoverage['/runtime/commands.js'].lineData[8]++;
  var Path = require('path');
  _$jscoverage['/runtime/commands.js'].lineData[9]++;
  var Scope = require('./scope');
  _$jscoverage['/runtime/commands.js'].lineData[11]++;
  commands = {
  'each': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[1]++;
  _$jscoverage['/runtime/commands.js'].lineData[13]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[14]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[15]++;
  var xindexName = visit1_15_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[16]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[17]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[18]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[19]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[20]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[22]++;
  if (visit2_22_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[23]++;
    opScope = new Scope();
    _$jscoverage['/runtime/commands.js'].lineData[24]++;
    if (visit3_24_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[25]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[26]++;
      for (var xindex = 0; visit4_26_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[28]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[29]++;
        affix = opScope.affix = {
  xcount: xcount};
        _$jscoverage['/runtime/commands.js'].lineData[32]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[33]++;
        if (visit5_33_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[34]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[36]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[37]++;
        buffer += config.fn(opScope);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[40]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[41]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[42]++;
        affix = opScope.affix = {};
        _$jscoverage['/runtime/commands.js'].lineData[43]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[44]++;
        if (visit6_44_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[45]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[47]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[48]++;
        buffer += config.fn(opScope);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[52]++;
    if (visit7_52_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[53]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[55]++;
  return buffer;
}, 
  'with': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[59]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[60]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[61]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[62]++;
  if (visit8_62_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[64]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[65]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[66]++;
    buffer = config.fn(opScope);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[67]++;
    if (visit9_67_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[68]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[70]++;
  return buffer;
}, 
  'if': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[74]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[75]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[76]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[77]++;
  if (visit10_77_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[78]++;
    if (visit11_78_1(config.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[79]++;
      buffer = config.fn(scope);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[81]++;
    if (visit12_81_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[82]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[84]++;
  return buffer;
}, 
  'set': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[88]++;
  scope.mix(config.hash);
  _$jscoverage['/runtime/commands.js'].lineData[89]++;
  return '';
}, 
  include: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[93]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[95]++;
  if (visit13_95_1(!params || visit14_95_2(params.length !== 1))) {
    _$jscoverage['/runtime/commands.js'].lineData[96]++;
    S.error('include must has one param');
    _$jscoverage['/runtime/commands.js'].lineData[97]++;
    return '';
  }
  _$jscoverage['/runtime/commands.js'].lineData[101]++;
  if (visit15_101_1(config.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[102]++;
    var newScope = new Scope(config.hash);
    _$jscoverage['/runtime/commands.js'].lineData[103]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[104]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[107]++;
  var myName = this.config.name;
  _$jscoverage['/runtime/commands.js'].lineData[108]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[110]++;
  if (visit16_110_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[111]++;
    if (visit17_111_1(myName === 'unspecified')) {
      _$jscoverage['/runtime/commands.js'].lineData[112]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[113]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[115]++;
    subTplName = Path.resolve(myName, '../', subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[118]++;
  var tpl = this.config.loader.call(this, subTplName);
  _$jscoverage['/runtime/commands.js'].lineData[120]++;
  config = S.merge(this.config);
  _$jscoverage['/runtime/commands.js'].lineData[122]++;
  config.name = subTplName;
  _$jscoverage['/runtime/commands.js'].lineData[124]++;
  config.commands = this.config.commands;
  _$jscoverage['/runtime/commands.js'].lineData[126]++;
  config.macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[127]++;
  return this.invokeEngine(tpl, scope, config);
}, 
  'macro': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[131]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[132]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[133]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[134]++;
  var macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[136]++;
  if (visit18_136_1(config.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[138]++;
    if (visit19_138_1(!macros[macroName])) {
      _$jscoverage['/runtime/commands.js'].lineData[139]++;
      macros[macroName] = {
  paramNames: params1, 
  fn: config.fn};
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[145]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[146]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[148]++;
    if (visit20_148_1(!macro)) {
      _$jscoverage['/runtime/commands.js'].lineData[149]++;
      S.error('can not find macro:' + name);
    }
    _$jscoverage['/runtime/commands.js'].lineData[152]++;
    S.each(macro.paramNames, function(p, i) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[153]++;
  paramValues[p] = params1[i];
});
    _$jscoverage['/runtime/commands.js'].lineData[155]++;
    var newScope = new Scope(paramValues);
    _$jscoverage['/runtime/commands.js'].lineData[157]++;
    return macro.fn.call(this, newScope);
  }
  _$jscoverage['/runtime/commands.js'].lineData[159]++;
  return '';
}, 
  parse: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[164]++;
  return commands.include.call(this, new Scope(), config);
}};
  _$jscoverage['/runtime/commands.js'].lineData[168]++;
  return commands;
});
