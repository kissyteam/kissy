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
if (! _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js']) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'] = {};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[141] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['46'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['62'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['87'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['103'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['116'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['132'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['132'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['132'][1].init(5968, 37, 'commandRet28 && commandRet28.isBuffer');
function visit15_132_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['116'][1].init(5130, 37, 'commandRet24 && commandRet24.isBuffer');
function visit14_116_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['103'][1].init(4597, 37, 'commandRet21 && commandRet21.isBuffer');
function visit13_103_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['87'][1].init(3846, 37, 'commandRet17 && commandRet17.isBuffer');
function visit12_87_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['62'][1].init(2696, 37, 'commandRet10 && commandRet10.isBuffer');
function visit11_62_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['46'][1].init(1956, 35, 'commandRet6 && commandRet6.isBuffer');
function visit10_46_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['30'][1].init(1254, 35, 'commandRet2 && commandRet2.isBuffer');
function visit9_30_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
function visit8_8_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[8]++;
  if (visit8_8_1("1.50" !== S.version)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[27]++;
  params1.push('header');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[29]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[30]++;
  if (visit9_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[35]++;
  buffer.write('">\n    <a id="ks-date-picker-decade-panel-previous-century-btn-');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[36]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[37]++;
  buffer.write(id3, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[38]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[39]++;
  var option4 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[42]++;
  var params5 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[43]++;
  params5.push('prev-century-btn');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[44]++;
  option4.params = params5;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[45]++;
  var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[46]++;
  if (visit10_46_1(commandRet6 && commandRet6.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[47]++;
    buffer = commandRet6;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[48]++;
    commandRet6 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[50]++;
  buffer.write(commandRet6, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\n       href="#"\n       role="button"\n       title="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[52]++;
  var id7 = scope.resolve(["previousCenturyLabel"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[53]++;
  buffer.write(id7, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[54]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n    <div class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[55]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[58]++;
  var params9 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[59]++;
  params9.push('century');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[60]++;
  option8.params = params9;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[61]++;
  var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[62]++;
  if (visit11_62_1(commandRet10 && commandRet10.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[63]++;
    buffer = commandRet10;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[64]++;
    commandRet10 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[66]++;
  buffer.write(commandRet10, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[67]++;
  buffer.write('"\n         id="ks-date-picker-decade-panel-century-');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[68]++;
  var id11 = scope.resolve(["id"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[69]++;
  buffer.write(id11, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[70]++;
  buffer.write('">\n                ');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[71]++;
  var id12 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[72]++;
  buffer.write(id12, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[73]++;
  buffer.write('-');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[74]++;
  var id13 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[75]++;
  buffer.write(id13, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[76]++;
  buffer.write('\n    </div>\n    <a id="ks-date-picker-decade-panel-next-century-btn-');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[77]++;
  var id14 = scope.resolve(["id"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[78]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[79]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[80]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[83]++;
  var params16 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[84]++;
  params16.push('next-century-btn');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[85]++;
  option15.params = params16;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[86]++;
  var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 14);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[87]++;
  if (visit12_87_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[88]++;
    buffer = commandRet17;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[89]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[91]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[92]++;
  buffer.write('"\n       href="#"\n       role="button"\n       title="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[93]++;
  var id18 = scope.resolve(["nextCenturyLabel"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[94]++;
  buffer.write(id18, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[95]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[96]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[99]++;
  var params20 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[100]++;
  params20.push('body');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[101]++;
  option19.params = params20;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[102]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 21);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[103]++;
  if (visit13_103_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[104]++;
    buffer = commandRet21;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[105]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[107]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[108]++;
  buffer.write('">\n    <table class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[109]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[112]++;
  var params23 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[113]++;
  params23.push('table');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[114]++;
  option22.params = params23;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[115]++;
  var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 22);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[116]++;
  if (visit14_116_1(commandRet24 && commandRet24.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[117]++;
    buffer = commandRet24;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[118]++;
    commandRet24 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[120]++;
  buffer.write(commandRet24, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[121]++;
  buffer.write('" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-decade-panel-tbody-');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[122]++;
  var id25 = scope.resolve(["id"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[123]++;
  buffer.write(id25, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[124]++;
  buffer.write('">\n        ');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[125]++;
  var option26 = {};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[126]++;
  var params27 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[127]++;
  params27.push('date/picker/decade-panel/decades-xtpl');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[128]++;
  option26.params = params27;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[129]++;
  require("date/picker/decade-panel/decades-xtpl");
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[130]++;
  option26.params[0] = module.resolve(option26.params[0]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[131]++;
  var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 24, payload);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[132]++;
  if (visit15_132_1(commandRet28 && commandRet28.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[133]++;
    buffer = commandRet28;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[134]++;
    commandRet28 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[136]++;
  buffer.write(commandRet28, false);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[137]++;
  buffer.write('\n        </tbody>\n    </table>\n</div>');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[138]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[140]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[141]++;
  return t;
});
