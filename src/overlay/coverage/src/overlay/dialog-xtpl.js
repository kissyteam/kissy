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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[177] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['35'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['57'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['137'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['137'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['137'][1].init(3821, 37, 'commandRet27 && commandRet27.isBuffer');
function visit11_137_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['97'][1].init(2095, 37, 'commandRet17 && commandRet17.isBuffer');
function visit10_97_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['57'][1].init(378, 35, 'commandRet7 && commandRet7.isBuffer');
function visit9_57_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['35'][1].init(1498, 35, 'commandRet2 && commandRet2.isBuffer');
function visit8_35_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'][1].init(1236, 10, 'moduleWrap');
function visit7_30_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit6_11_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit5_11_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit4_8_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[8]++;
  if (visit4_8_1("1.50" !== S.version)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[11]++;
  if (visit5_11_1(visit6_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  buffer.write('');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  var option0 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  var params1 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  params1.push('./overlay-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  option0.params = params1;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
  if (visit7_30_1(moduleWrap)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
    require("./overlay-xtpl");
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
    option0.params[0] = moduleWrap.resolveByName(option0.params[0]);
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  var commandRet2 = extendCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35]++;
  if (visit8_35_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
    buffer = commandRet2;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  buffer.write(commandRet2, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  buffer.write('\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  var params4 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  params4.push('ks-overlay-content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  option3.params = params4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  buffer.write('\n    <div class="');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  params6.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  option5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  if (visit9_57_1(commandRet7 && commandRet7.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
    buffer = commandRet7;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
    commandRet7 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  buffer.write(commandRet7, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  buffer.write('"\n         style="\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  var id10 = scope.resolve(["headerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  params9.push(id10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  option8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  option8.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  buffer.write('\n ');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  var id11 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  buffer.write(id11, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  buffer.write(':');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  var id12 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  buffer.write(id12, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  buffer.write(';\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  buffer = eachCommand.call(engine, scope, option8, buffer, 5, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  buffer.write('\n"\n         id="ks-stdmod-header-');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  var id13 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  buffer.write(id13, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  buffer.write('">');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  var id14 = scope.resolve(["headerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  buffer.write(id14, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  buffer.write('</div>\n\n    <div class="');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  var params16 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  params16.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  option15.params = params16;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97]++;
  if (visit10_97_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
    buffer = commandRet17;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  buffer.write('"\n         style="\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  var option18 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  var params19 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  var id20 = scope.resolve(["bodyStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
  params19.push(id20);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  option18.params = params19;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  option18.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  buffer.write('\n ');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  var id21 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  buffer.write(id21, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  buffer.write(':');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  var id22 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  buffer.write(id22, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  buffer.write(';\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  buffer = eachCommand.call(engine, scope, option18, buffer, 13, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
  buffer.write('\n"\n         id="ks-stdmod-body-');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  var id23 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  buffer.write(id23, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  buffer.write('">');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
  var id24 = scope.resolve(["bodyContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
  buffer.write(id24, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129]++;
  buffer.write('</div>\n\n    <div class="');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  var option25 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[133]++;
  var params26 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[134]++;
  params26.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135]++;
  option25.params = params26;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136]++;
  var commandRet27 = callCommandUtil(engine, scope, option25, buffer, "getBaseCssClasses", 19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137]++;
  if (visit11_137_1(commandRet27 && commandRet27.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138]++;
    buffer = commandRet27;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139]++;
    commandRet27 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141]++;
  buffer.write(commandRet27, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142]++;
  buffer.write('"\n         style="\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143]++;
  var option28 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146]++;
  var params29 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147]++;
  var id30 = scope.resolve(["footerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[148]++;
  params29.push(id30);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149]++;
  option28.params = params29;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[150]++;
  option28.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152]++;
  buffer.write('\n ');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153]++;
  var id31 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[154]++;
  buffer.write(id31, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155]++;
  buffer.write(':');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[156]++;
  var id32 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[157]++;
  buffer.write(id32, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[158]++;
  buffer.write(';\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[160]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[162]++;
  buffer = eachCommand.call(engine, scope, option28, buffer, 21, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[163]++;
  buffer.write('\n"\n         id="ks-stdmod-footer-');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[164]++;
  var id33 = scope.resolve(["id"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[165]++;
  buffer.write(id33, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[166]++;
  buffer.write('">');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[167]++;
  var id34 = scope.resolve(["footerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[168]++;
  buffer.write(id34, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[169]++;
  buffer.write('</div>\n    <div tabindex="0"></div>\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[171]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[173]++;
  buffer = blockCommand.call(engine, scope, option3, buffer, 2, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[174]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[176]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[177]++;
  return t;
});
