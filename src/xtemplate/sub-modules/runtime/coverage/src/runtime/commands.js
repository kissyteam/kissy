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
  _$jscoverage['/runtime/commands.js'].lineData[19] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[21] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[22] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[25] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[35] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[44] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[45] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[52] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[53] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[54] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[68] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[71] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[73] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[74] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[85] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[87] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[88] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[95] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[99] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[100] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[102] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[105] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[107] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[116] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[119] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[131] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[137] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[140] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[151] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[160] = 0;
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
  _$jscoverage['/runtime/commands.js'].branchData['19'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['21'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['23'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['44'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['54'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['59'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['69'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['70'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['73'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['87'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['93'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['102'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['103'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['128'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['130'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['140'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['140'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['140'][1].init(107, 6, '!macro');
function visit17_140_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['130'][1].init(80, 18, '!macros[macroName]');
function visit16_130_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['128'][1].init(210, 9, 'config.fn');
function visit15_128_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['103'][1].init(21, 24, 'myName === \'unspecified\'');
function visit14_103_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['102'][1].init(501, 28, 'subTplName.charAt(0) === \'.\'');
function visit13_102_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['93'][1].init(239, 11, 'config.hash');
function visit12_93_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['87'][2].init(69, 19, 'params.length !== 1');
function visit11_87_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['87'][1].init(58, 30, '!params || params.length !== 1');
function visit10_87_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['73'][1].init(254, 14, 'config.inverse');
function visit9_73_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['70'][1].init(21, 9, 'config.fn');
function visit8_70_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['69'][1].init(122, 6, 'param0');
function visit7_69_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['59'][1].init(345, 14, 'config.inverse');
function visit6_59_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['54'][1].init(122, 6, 'param0');
function visit5_54_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['44'][1].init(1244, 14, 'config.inverse');
function visit4_44_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['23'][1].init(86, 15, 'xindex < xcount');
function visit3_23_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['21'][1].init(60, 17, 'S.isArray(param0)');
function visit2_21_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['19'][1].init(230, 6, 'param0');
function visit1_19_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['19'][1].ranCondition(result);
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
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[16]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[17]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[19]++;
  if (visit1_19_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[20]++;
    opScope = new Scope();
    _$jscoverage['/runtime/commands.js'].lineData[21]++;
    if (visit2_21_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[22]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[23]++;
      for (var xindex = 0; visit3_23_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[25]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[26]++;
        opScope.affix = {
  xcount: xcount, 
  xindex: xindex};
        _$jscoverage['/runtime/commands.js'].lineData[30]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[31]++;
        buffer += config.fn(opScope);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[34]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[35]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[36]++;
        opScope.affix = {
  xindex: name};
        _$jscoverage['/runtime/commands.js'].lineData[39]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[40]++;
        buffer += config.fn(opScope);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[44]++;
    if (visit4_44_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[45]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[47]++;
  return buffer;
}, 
  'with': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[51]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[52]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[53]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[54]++;
  if (visit5_54_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[56]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[57]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[58]++;
    buffer = config.fn(opScope);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[59]++;
    if (visit6_59_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[60]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[62]++;
  return buffer;
}, 
  'if': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[66]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[67]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[68]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[69]++;
  if (visit7_69_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[70]++;
    if (visit8_70_1(config.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[71]++;
      buffer = config.fn(scope);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[73]++;
    if (visit9_73_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[74]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[76]++;
  return buffer;
}, 
  'set': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[80]++;
  scope.mix(config.hash);
  _$jscoverage['/runtime/commands.js'].lineData[81]++;
  return '';
}, 
  include: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[85]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[87]++;
  if (visit10_87_1(!params || visit11_87_2(params.length !== 1))) {
    _$jscoverage['/runtime/commands.js'].lineData[88]++;
    S.error('include must has one param');
    _$jscoverage['/runtime/commands.js'].lineData[89]++;
    return '';
  }
  _$jscoverage['/runtime/commands.js'].lineData[93]++;
  if (visit12_93_1(config.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[94]++;
    var newScope = new Scope(config.hash);
    _$jscoverage['/runtime/commands.js'].lineData[95]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[96]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[99]++;
  var myName = this.config.name;
  _$jscoverage['/runtime/commands.js'].lineData[100]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[102]++;
  if (visit13_102_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[103]++;
    if (visit14_103_1(myName === 'unspecified')) {
      _$jscoverage['/runtime/commands.js'].lineData[104]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[105]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[107]++;
    subTplName = Path.resolve(myName, '../', subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[110]++;
  var tpl = this.config.loader.call(this, subTplName);
  _$jscoverage['/runtime/commands.js'].lineData[112]++;
  config = S.merge(this.config);
  _$jscoverage['/runtime/commands.js'].lineData[114]++;
  config.name = subTplName;
  _$jscoverage['/runtime/commands.js'].lineData[116]++;
  config.commands = this.config.commands;
  _$jscoverage['/runtime/commands.js'].lineData[118]++;
  config.macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[119]++;
  return this.invokeEngine(tpl, scope, config);
}, 
  'macro': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[123]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[124]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[125]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[126]++;
  var macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[128]++;
  if (visit15_128_1(config.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[130]++;
    if (visit16_130_1(!macros[macroName])) {
      _$jscoverage['/runtime/commands.js'].lineData[131]++;
      macros[macroName] = {
  paramNames: params1, 
  fn: config.fn};
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[137]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[138]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[140]++;
    if (visit17_140_1(!macro)) {
      _$jscoverage['/runtime/commands.js'].lineData[141]++;
      S.error('can not find macro:' + name);
    }
    _$jscoverage['/runtime/commands.js'].lineData[144]++;
    S.each(macro.paramNames, function(p, i) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[145]++;
  paramValues[p] = params1[i];
});
    _$jscoverage['/runtime/commands.js'].lineData[147]++;
    var newScope = new Scope(paramValues);
    _$jscoverage['/runtime/commands.js'].lineData[149]++;
    return macro.fn.call(this, newScope);
  }
  _$jscoverage['/runtime/commands.js'].lineData[151]++;
  return '';
}, 
  parse: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[156]++;
  return commands.include.call(this, new Scope(), config);
}};
  _$jscoverage['/runtime/commands.js'].lineData[160]++;
  return commands;
});
