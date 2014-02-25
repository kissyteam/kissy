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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].functionData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].branchData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'][2] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'][2].init(5795, 10, 'id36 === 0');
function visit16_142_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'][1].init(5787, 18, 'id36 || id36 === 0');
function visit15_142_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'][2].init(4432, 10, 'id26 === 0');
function visit14_109_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'][1].init(4424, 18, 'id26 || id26 === 0');
function visit13_109_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'][2].init(3077, 10, 'id16 === 0');
function visit12_76_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'][1].init(3069, 18, 'id16 || id16 === 0');
function visit11_76_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'][2].init(1297, 9, 'id0 === 0');
function visit10_33_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'][1].init(1290, 16, 'id0 || id0 === 0');
function visit9_33_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'][1].init(1042, 10, 'moduleWrap');
function visit8_28_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit7_10_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit6_10_1(result) {
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
  if (visit6_10_1(visit7_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23]++;
  buffer += '';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  var option1 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  var params2 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  params2.push('overlay/close-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  option1.params = params2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  if (visit8_28_1(moduleWrap)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
    require("overlay/close-xtpl");
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
    option1.params[0] = moduleWrap.resolveByName(option1.params[0]);
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
  var id0 = includeCommand.call(engine, scope, option1, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
  if (visit9_33_1(id0 || visit10_33_2(id0 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
    buffer += id0;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
  buffer += '\n<div id="ks-content-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38]++;
  buffer += escapeHtml(id3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  buffer += '"\n     class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  var option5 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  params6.push('content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43]++;
  option5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  buffer += escapeHtml(id4);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  var option8 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  params9.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  option8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 4);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  var option10 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  var params11 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  var id12 = scope.resolve(["headerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  params11.push(id12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  option10.params = params11;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
  option10.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  buffer += '\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  var id13 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  buffer += escapeHtml(id13);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  var id14 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  buffer += escapeHtml(id14);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  buffer += eachCommand.call(engine, scope, option10, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  buffer += '\n"\n         id="ks-stdmod-header-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  var id15 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  var id16 = scope.resolve(["headerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  if (visit11_76_1(id16 || visit12_76_2(id16 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
    buffer += id16;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  var option18 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  var params19 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  params19.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  option18.params = params19;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  var id17 = callCommandUtil(engine, scope, option18, "getBaseCssClasses", 12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  buffer += escapeHtml(id17);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  var option20 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  var params21 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  var id22 = scope.resolve(["bodyStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
  params21.push(id22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
  option20.params = params21;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92]++;
  option20.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer += '\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  var id23 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  buffer += escapeHtml(id23);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  var id24 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  buffer += escapeHtml(id24);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  buffer += eachCommand.call(engine, scope, option20, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  buffer += '\n"\n         id="ks-stdmod-body-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  var id25 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  buffer += escapeHtml(id25);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
  var id26 = scope.resolve(["bodyContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  if (visit13_109_1(id26 || visit14_109_2(id26 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
    buffer += id26;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  var option28 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  var params29 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  params29.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  option28.params = params29;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  var id27 = callCommandUtil(engine, scope, option28, "getBaseCssClasses", 20);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  buffer += escapeHtml(id27);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  var option30 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121]++;
  var params31 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  var id32 = scope.resolve(["footerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
  params31.push(id32);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  option30.params = params31;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  option30.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
  buffer += '\n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
  var id33 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129]++;
  buffer += escapeHtml(id33);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131]++;
  var id34 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132]++;
  buffer += escapeHtml(id34);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[133]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136]++;
  buffer += eachCommand.call(engine, scope, option30, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137]++;
  buffer += '\n"\n         id="ks-stdmod-footer-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138]++;
  var id35 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139]++;
  buffer += escapeHtml(id35);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[140]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141]++;
  var id36 = scope.resolve(["footerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142]++;
  if (visit15_142_1(id36 || visit16_142_2(id36 === 0))) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143]++;
    buffer += id36;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145]++;
  buffer += '</div>\n</div>\n<div tabindex="0"></div>';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/overlay/src/overlay/dialog.xtpl.html";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149]++;
  return t;
});
