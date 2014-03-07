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
  _$jscoverage['/runtime/commands.js'].lineData[15] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[17] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[18] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[19] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[21] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[22] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[24] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[25] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[27] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[35] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[38] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[42] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[44] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[45] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[46] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[49] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[50] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[54] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[61] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[64] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[68] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[72] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[78] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[84] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[86] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[95] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[97] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[98] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[99] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[105] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[106] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[109] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[129] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[134] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[135] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[136] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[140] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[150] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[151] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[154] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[155] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[157] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[159] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[161] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[166] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[170] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[171] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[172] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
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
  _$jscoverage['/runtime/commands.js'].functionData[9] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['17'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['24'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['26'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['28'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['35'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['46'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['54'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['64'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['69'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['79'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['80'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['83'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['97'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['103'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['112'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['113'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['138'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['140'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['150'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['170'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['170'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['170'][1].init(5516, 9, '\'@DEBUG@\'');
function visit21_170_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['150'][1].init(107, 6, '!macro');
function visit20_150_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['140'][1].init(80, 18, '!macros[macroName]');
function visit19_140_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['138'][1].init(210, 9, 'config.fn');
function visit18_138_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['113'][1].init(21, 24, 'myName === \'unspecified\'');
function visit17_113_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['112'][1].init(501, 28, 'subTplName.charAt(0) === \'.\'');
function visit16_112_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['103'][1].init(239, 11, 'config.hash');
function visit15_103_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['97'][2].init(69, 19, 'params.length !== 1');
function visit14_97_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['97'][1].init(58, 30, '!params || params.length !== 1');
function visit13_97_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['83'][1].init(254, 14, 'config.inverse');
function visit12_83_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['80'][1].init(21, 9, 'config.fn');
function visit11_80_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['79'][1].init(122, 6, 'param0');
function visit10_79_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['69'][1].init(345, 14, 'config.inverse');
function visit9_69_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['64'][1].init(122, 6, 'param0');
function visit8_64_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['54'][1].init(1624, 14, 'config.inverse');
function visit7_54_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['46'][1].init(184, 9, 'valueName');
function visit6_46_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['35'][1].init(325, 9, 'valueName');
function visit5_35_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['28'][1].init(86, 15, 'xindex < xcount');
function visit4_28_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['26'][1].init(60, 17, 'S.isArray(param0)');
function visit3_26_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['24'][1].init(344, 6, 'param0');
function visit2_24_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['17'][1].init(106, 21, 'params[2] || \'xindex\'');
function visit1_17_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['17'][1].ranCondition(result);
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
  'debugger': S.noop, 
  'each': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[1]++;
  _$jscoverage['/runtime/commands.js'].lineData[15]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[16]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[17]++;
  var xindexName = visit1_17_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[18]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[19]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[20]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[21]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[22]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[24]++;
  if (visit2_24_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[25]++;
    opScope = new Scope();
    _$jscoverage['/runtime/commands.js'].lineData[26]++;
    if (visit3_26_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[27]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[28]++;
      for (var xindex = 0; visit4_28_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[30]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[31]++;
        affix = opScope.affix = {
  xcount: xcount};
        _$jscoverage['/runtime/commands.js'].lineData[34]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[35]++;
        if (visit5_35_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[36]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[38]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[39]++;
        buffer += config.fn(opScope);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[42]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[43]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[44]++;
        affix = opScope.affix = {};
        _$jscoverage['/runtime/commands.js'].lineData[45]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[46]++;
        if (visit6_46_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[47]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[49]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[50]++;
        buffer += config.fn(opScope);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[54]++;
    if (visit7_54_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[55]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[57]++;
  return buffer;
}, 
  'with': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[61]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[62]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[63]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[64]++;
  if (visit8_64_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[66]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[67]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[68]++;
    buffer = config.fn(opScope);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[69]++;
    if (visit9_69_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[70]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[72]++;
  return buffer;
}, 
  'if': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[76]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[77]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[78]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[79]++;
  if (visit10_79_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[80]++;
    if (visit11_80_1(config.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[81]++;
      buffer = config.fn(scope);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[83]++;
    if (visit12_83_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[84]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[86]++;
  return buffer;
}, 
  'set': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[90]++;
  scope.mix(config.hash);
  _$jscoverage['/runtime/commands.js'].lineData[91]++;
  return '';
}, 
  include: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[95]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[97]++;
  if (visit13_97_1(!params || visit14_97_2(params.length !== 1))) {
    _$jscoverage['/runtime/commands.js'].lineData[98]++;
    S.error('include must has one param');
    _$jscoverage['/runtime/commands.js'].lineData[99]++;
    return '';
  }
  _$jscoverage['/runtime/commands.js'].lineData[103]++;
  if (visit15_103_1(config.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[104]++;
    var newScope = new Scope(config.hash);
    _$jscoverage['/runtime/commands.js'].lineData[105]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[106]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[109]++;
  var myName = this.config.name;
  _$jscoverage['/runtime/commands.js'].lineData[110]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[112]++;
  if (visit16_112_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[113]++;
    if (visit17_113_1(myName === 'unspecified')) {
      _$jscoverage['/runtime/commands.js'].lineData[114]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[115]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[117]++;
    subTplName = Path.resolve(myName, '../', subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[120]++;
  var tpl = this.config.loader.call(this, subTplName);
  _$jscoverage['/runtime/commands.js'].lineData[122]++;
  config = S.merge(this.config);
  _$jscoverage['/runtime/commands.js'].lineData[124]++;
  config.name = subTplName;
  _$jscoverage['/runtime/commands.js'].lineData[126]++;
  config.commands = this.config.commands;
  _$jscoverage['/runtime/commands.js'].lineData[128]++;
  config.macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[129]++;
  return this.invokeEngine(tpl, scope, config);
}, 
  'macro': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[133]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[134]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[135]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[136]++;
  var macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[138]++;
  if (visit18_138_1(config.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[140]++;
    if (visit19_140_1(!macros[macroName])) {
      _$jscoverage['/runtime/commands.js'].lineData[141]++;
      macros[macroName] = {
  paramNames: params1, 
  fn: config.fn};
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[147]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[148]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[150]++;
    if (visit20_150_1(!macro)) {
      _$jscoverage['/runtime/commands.js'].lineData[151]++;
      S.error('can not find macro:' + name);
    }
    _$jscoverage['/runtime/commands.js'].lineData[154]++;
    S.each(macro.paramNames, function(p, i) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[155]++;
  paramValues[p] = params1[i];
});
    _$jscoverage['/runtime/commands.js'].lineData[157]++;
    var newScope = new Scope(paramValues);
    _$jscoverage['/runtime/commands.js'].lineData[159]++;
    return macro.fn.call(this, newScope);
  }
  _$jscoverage['/runtime/commands.js'].lineData[161]++;
  return '';
}, 
  parse: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[166]++;
  return commands.include.call(this, new Scope(), config);
}};
  _$jscoverage['/runtime/commands.js'].lineData[170]++;
  if (visit21_170_1('@DEBUG@')) {
    _$jscoverage['/runtime/commands.js'].lineData[171]++;
    commands['debugger'] = function() {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[172]++;
  S.globalEval('debugger');
};
  }
  _$jscoverage['/runtime/commands.js'].lineData[176]++;
  return commands;
});
