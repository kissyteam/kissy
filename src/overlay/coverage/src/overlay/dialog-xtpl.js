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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'][2] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'][2].init(4419, 10, 'id34 === 0');
function visit14_140_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'][1].init(4411, 18, 'id34 || id34 === 0');
function visit13_140_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'][2].init(2924, 10, 'id24 === 0');
function visit12_107_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'][1].init(2916, 18, 'id24 || id24 === 0');
function visit11_107_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'][2].init(1437, 10, 'id14 === 0');
function visit10_74_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'][1].init(1429, 18, 'id14 || id14 === 0');
function visit9_74_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'][2].init(1350, 9, 'id0 === 0');
function visit8_34_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'][1].init(1343, 16, 'id0 || id0 === 0');
function visit7_34_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['29'][1].init(1100, 10, 'moduleWrap');
function visit6_29_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit5_10_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit4_10_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[10]++;
  if (visit4_10_1(visit5_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  buffer += '';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  var option1 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  var params2 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  params2.push('./overlay-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  option1.params = params2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  if (visit6_29_1(moduleWrap)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
    require("./overlay-xtpl");
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
    option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
  var id0 = extendCommand.call(engine, scope, option1, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  if (visit7_34_1(id0 || visit8_34_2(id0 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35]++;
    buffer += id0;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  buffer += '\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38]++;
  var option3 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  params4.push('ks-overlay-content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  option3.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  buffer += '\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  var option6 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  var params7 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  params7.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  option6.params = params7;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  var id5 = callCommandUtil(engine, scope, option6, "getBaseCssClasses", 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  buffer += escapeHtml(id5);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  var option8 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  var id10 = scope.resolve(["headerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  params9.push(id10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  option8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  option8.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
  buffer += '\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60]++;
  var id11 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  var id12 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  buffer += escapeHtml(id12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  buffer += eachCommand.call(engine, scope, option8, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  buffer += '\n"\n         id="ks-stdmod-header-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  var id13 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  buffer += escapeHtml(id13);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  var id14 = scope.resolve(["headerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  if (visit9_74_1(id14 || visit10_74_2(id14 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
    buffer += id14;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  var option16 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  var params17 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  params17.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  option16.params = params17;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 11);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  var option18 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  var params19 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  var id20 = scope.resolve(["bodyStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  params19.push(id20);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  option18.params = params19;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
  option18.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92]++;
  buffer += '\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  var id21 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer += escapeHtml(id21);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  var id22 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97]++;
  buffer += escapeHtml(id22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  buffer += eachCommand.call(engine, scope, option18, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  buffer += '\n"\n         id="ks-stdmod-body-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  var id23 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  buffer += escapeHtml(id23);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  var id24 = scope.resolve(["bodyContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  if (visit11_107_1(id24 || visit12_107_2(id24 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
    buffer += id24;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111]++;
  var option26 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  var params27 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  params27.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  option26.params = params27;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  var id25 = callCommandUtil(engine, scope, option26, "getBaseCssClasses", 19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  buffer += escapeHtml(id25);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  var option28 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119]++;
  var params29 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  var id30 = scope.resolve(["footerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121]++;
  params29.push(id30);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  option28.params = params29;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
  option28.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  buffer += '\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  var id31 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
  buffer += escapeHtml(id31);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129]++;
  var id32 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  buffer += escapeHtml(id32);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134]++;
  buffer += eachCommand.call(engine, scope, option28, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135]++;
  buffer += '\n"\n         id="ks-stdmod-footer-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136]++;
  var id33 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137]++;
  buffer += escapeHtml(id33);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139]++;
  var id34 = scope.resolve(["footerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[140]++;
  if (visit13_140_1(id34 || visit14_140_2(id34 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141]++;
    buffer += id34;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143]++;
  buffer += '</div>\n    <div tabindex="0"></div>\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[144]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146]++;
  buffer += blockCommand.call(engine, scope, option3, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150]++;
  return t;
});
