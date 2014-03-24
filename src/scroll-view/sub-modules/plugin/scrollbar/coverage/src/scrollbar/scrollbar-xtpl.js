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
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js']) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'] = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[153] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['39'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['58'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['77'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['96'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['112'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['128'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['144'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['144'][1] = new BranchData();
}
_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['144'][1].init(6080, 37, 'commandRet38 && commandRet38.isBuffer');
function visit31_144_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['128'][1].init(5422, 37, 'commandRet33 && commandRet33.isBuffer');
function visit30_128_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['112'][1].init(4764, 37, 'commandRet28 && commandRet28.isBuffer');
function visit29_112_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['96'][1].init(4117, 37, 'commandRet23 && commandRet23.isBuffer');
function visit28_96_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['77'][1].init(3330, 37, 'commandRet17 && commandRet17.isBuffer');
function visit27_77_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['58'][1].init(2483, 37, 'commandRet11 && commandRet11.isBuffer');
function visit26_58_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['39'][1].init(1644, 35, 'commandRet5 && commandRet5.isBuffer');
function visit25_39_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit24_11_2(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit23_11_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit22_8_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[8]++;
  if (visit22_8_1("1.50" !== S.version)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[11]++;
  if (visit23_11_1(visit24_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25]++;
  buffer.write('<div id="ks-scrollbar-arrow-up-');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27]++;
  buffer.write(id0, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28]++;
  buffer.write('"\n        class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29]++;
  var option1 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32]++;
  var params2 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33]++;
  var id3 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34]++;
  var exp4 = id3;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35]++;
  exp4 = (id3) + ('-arrow-up');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36]++;
  params2.push(exp4);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37]++;
  option1.params = params2;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38]++;
  var commandRet5 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39]++;
  if (visit25_39_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[40]++;
    buffer = commandRet5;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44]++;
  buffer.write('">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45]++;
  var id6 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46]++;
  buffer.write(id6, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47]++;
  buffer.write('"\n        class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51]++;
  var params8 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[52]++;
  var id9 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53]++;
  var exp10 = id9;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54]++;
  exp10 = (id9) + ('-arrow-down');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55]++;
  params8.push(exp10);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[56]++;
  option7.params = params8;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[57]++;
  var commandRet11 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58]++;
  if (visit26_58_1(commandRet11 && commandRet11.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59]++;
    buffer = commandRet11;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60]++;
    commandRet11 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62]++;
  buffer.write(commandRet11, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63]++;
  buffer.write('">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64]++;
  var id12 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65]++;
  buffer.write(id12, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66]++;
  buffer.write('"\n     class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67]++;
  var option13 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70]++;
  var params14 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71]++;
  var id15 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72]++;
  var exp16 = id15;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[73]++;
  exp16 = (id15) + ('-track');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74]++;
  params14.push(exp16);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75]++;
  option13.params = params14;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76]++;
  var commandRet17 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 10);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77]++;
  if (visit27_77_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78]++;
    buffer = commandRet17;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82]++;
  buffer.write('">\n<div id="ks-scrollbar-drag-');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[84]++;
  buffer.write(id18, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85]++;
  buffer.write('"\n     class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[86]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[89]++;
  var params20 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[90]++;
  var id21 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[91]++;
  var exp22 = id21;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92]++;
  exp22 = (id21) + ('-drag');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93]++;
  params20.push(exp22);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[94]++;
  option19.params = params20;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95]++;
  var commandRet23 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 12);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96]++;
  if (visit28_96_1(commandRet23 && commandRet23.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[97]++;
    buffer = commandRet23;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[98]++;
    commandRet23 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[100]++;
  buffer.write(commandRet23, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[101]++;
  buffer.write('">\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[102]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[105]++;
  var params25 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[106]++;
  var id26 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[107]++;
  var exp27 = id26;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[108]++;
  exp27 = (id26) + ('-drag-top');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[109]++;
  params25.push(exp27);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[110]++;
  option24.params = params25;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[111]++;
  var commandRet28 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 13);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[112]++;
  if (visit29_112_1(commandRet28 && commandRet28.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[113]++;
    buffer = commandRet28;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[114]++;
    commandRet28 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[116]++;
  buffer.write(commandRet28, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[117]++;
  buffer.write('">\n</div>\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[118]++;
  var option29 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[121]++;
  var params30 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[122]++;
  var id31 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[123]++;
  var exp32 = id31;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[124]++;
  exp32 = (id31) + ('-drag-center');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[125]++;
  params30.push(exp32);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[126]++;
  option29.params = params30;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[127]++;
  var commandRet33 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 15);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[128]++;
  if (visit30_128_1(commandRet33 && commandRet33.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[129]++;
    buffer = commandRet33;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[130]++;
    commandRet33 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[132]++;
  buffer.write(commandRet33, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[133]++;
  buffer.write('">\n</div>\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[134]++;
  var option34 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[137]++;
  var params35 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[138]++;
  var id36 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[139]++;
  var exp37 = id36;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[140]++;
  exp37 = (id36) + ('-drag-bottom');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[141]++;
  params35.push(exp37);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[142]++;
  option34.params = params35;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[143]++;
  var commandRet38 = callCommandUtil(engine, scope, option34, buffer, "getBaseCssClasses", 17);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[144]++;
  if (visit31_144_1(commandRet38 && commandRet38.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[145]++;
    buffer = commandRet38;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[146]++;
    commandRet38 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[148]++;
  buffer.write(commandRet38, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[149]++;
  buffer.write('">\n</div>\n</div>\n</div>');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[150]++;
  return buffer;
};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[152]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[153]++;
  return t;
});
