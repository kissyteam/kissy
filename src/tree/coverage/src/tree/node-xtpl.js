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
if (! _$jscoverage['/tree/node-xtpl.js']) {
  _$jscoverage['/tree/node-xtpl.js'] = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[180] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].functionData) {
  _$jscoverage['/tree/node-xtpl.js'].functionData = [];
  _$jscoverage['/tree/node-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].branchData) {
  _$jscoverage['/tree/node-xtpl.js'].branchData = {};
  _$jscoverage['/tree/node-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['33'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['56'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['77'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['106'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['127'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['140'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['156'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['156'][1] = new BranchData();
}
_$jscoverage['/tree/node-xtpl.js'].branchData['156'][1].init(6520, 37, 'commandRet33 && commandRet33.isBuffer');
function visit33_156_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['140'][1].init(5835, 37, 'commandRet29 && commandRet29.isBuffer');
function visit32_140_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['127'][1].init(5196, 37, 'commandRet26 && commandRet26.isBuffer');
function visit31_127_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['106'][1].init(689, 37, 'commandRet22 && commandRet22.isBuffer');
function visit30_106_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['77'][1].init(3126, 37, 'commandRet13 && commandRet13.isBuffer');
function visit29_77_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['56'][1].init(372, 35, 'commandRet9 && commandRet9.isBuffer');
function visit28_56_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['33'][1].init(1392, 35, 'commandRet3 && commandRet3.isBuffer');
function visit27_33_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
function visit26_8_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[0]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[1]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/tree/node-xtpl.js'].lineData[8]++;
  if (visit26_8_1("1.50" !== S.version)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/tree/node-xtpl.js'].lineData[22]++;
  buffer.write('<div id="ks-tree-node-row-');
  _$jscoverage['/tree/node-xtpl.js'].lineData[23]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[24]++;
  buffer.write(id0, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[25]++;
  buffer.write('"\n     class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[26]++;
  var option1 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[29]++;
  var params2 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[30]++;
  params2.push('row');
  _$jscoverage['/tree/node-xtpl.js'].lineData[31]++;
  option1.params = params2;
  _$jscoverage['/tree/node-xtpl.js'].lineData[32]++;
  var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/tree/node-xtpl.js'].lineData[33]++;
  if (visit27_33_1(commandRet3 && commandRet3.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[34]++;
    buffer = commandRet3;
    _$jscoverage['/tree/node-xtpl.js'].lineData[35]++;
    commandRet3 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[37]++;
  buffer.write(commandRet3, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[38]++;
  buffer.write('\n     ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[39]++;
  var option4 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[42]++;
  var params5 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[43]++;
  var id6 = scope.resolve(["selected"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[44]++;
  params5.push(id6);
  _$jscoverage['/tree/node-xtpl.js'].lineData[45]++;
  option4.params = params5;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46]++;
  option4.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[2]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[48]++;
  buffer.write('\n        ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[49]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[52]++;
  var params8 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[53]++;
  params8.push('selected');
  _$jscoverage['/tree/node-xtpl.js'].lineData[54]++;
  option7.params = params8;
  _$jscoverage['/tree/node-xtpl.js'].lineData[55]++;
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 4);
  _$jscoverage['/tree/node-xtpl.js'].lineData[56]++;
  if (visit28_56_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[57]++;
    buffer = commandRet9;
    _$jscoverage['/tree/node-xtpl.js'].lineData[58]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[60]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[61]++;
  buffer.write('\n     ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[63]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[65]++;
  buffer = ifCommand.call(engine, scope, option4, buffer, 3, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[66]++;
  buffer.write('\n     ">\n    <div id="ks-tree-node-expand-icon-');
  _$jscoverage['/tree/node-xtpl.js'].lineData[67]++;
  var id10 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[68]++;
  buffer.write(id10, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[69]++;
  buffer.write('"\n         class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[70]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[73]++;
  var params12 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[74]++;
  params12.push('expand-icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[75]++;
  option11.params = params12;
  _$jscoverage['/tree/node-xtpl.js'].lineData[76]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 8);
  _$jscoverage['/tree/node-xtpl.js'].lineData[77]++;
  if (visit29_77_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[78]++;
    buffer = commandRet13;
    _$jscoverage['/tree/node-xtpl.js'].lineData[79]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[81]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[82]++;
  buffer.write('">\n    </div>\n    ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[83]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[86]++;
  var params15 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[87]++;
  var id16 = scope.resolve(["checkable"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[88]++;
  params15.push(id16);
  _$jscoverage['/tree/node-xtpl.js'].lineData[89]++;
  option14.params = params15;
  _$jscoverage['/tree/node-xtpl.js'].lineData[90]++;
  option14.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[3]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[92]++;
  buffer.write('\n    <div id="ks-tree-node-checked-');
  _$jscoverage['/tree/node-xtpl.js'].lineData[93]++;
  var id17 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[94]++;
  buffer.write(id17, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[95]++;
  buffer.write('"\n         class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[96]++;
  var option18 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[99]++;
  var params19 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[100]++;
  var exp21 = 'checked';
  _$jscoverage['/tree/node-xtpl.js'].lineData[101]++;
  var id20 = scope.resolve(["checkState"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[102]++;
  exp21 = ('checked') + (id20);
  _$jscoverage['/tree/node-xtpl.js'].lineData[103]++;
  params19.push(exp21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[104]++;
  option18.params = params19;
  _$jscoverage['/tree/node-xtpl.js'].lineData[105]++;
  var commandRet22 = callCommandUtil(engine, scope, option18, buffer, "getBaseCssClasses", 12);
  _$jscoverage['/tree/node-xtpl.js'].lineData[106]++;
  if (visit30_106_1(commandRet22 && commandRet22.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[107]++;
    buffer = commandRet22;
    _$jscoverage['/tree/node-xtpl.js'].lineData[108]++;
    commandRet22 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[110]++;
  buffer.write(commandRet22, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[111]++;
  buffer.write('"></div>\n    ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[113]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[115]++;
  buffer = ifCommand.call(engine, scope, option14, buffer, 10, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[116]++;
  buffer.write('\n    <div id="ks-tree-node-icon-');
  _$jscoverage['/tree/node-xtpl.js'].lineData[117]++;
  var id23 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[118]++;
  buffer.write(id23, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[119]++;
  buffer.write('"\n         class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[120]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[123]++;
  var params25 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[124]++;
  params25.push('icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[125]++;
  option24.params = params25;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126]++;
  var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 15);
  _$jscoverage['/tree/node-xtpl.js'].lineData[127]++;
  if (visit31_127_1(commandRet26 && commandRet26.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[128]++;
    buffer = commandRet26;
    _$jscoverage['/tree/node-xtpl.js'].lineData[129]++;
    commandRet26 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[131]++;
  buffer.write(commandRet26, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[132]++;
  buffer.write('">\n\n    </div>\n    ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[133]++;
  var option27 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[134]++;
  var params28 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[135]++;
  params28.push('component/extension/content-xtpl');
  _$jscoverage['/tree/node-xtpl.js'].lineData[136]++;
  option27.params = params28;
  _$jscoverage['/tree/node-xtpl.js'].lineData[137]++;
  require("component/extension/content-xtpl");
  _$jscoverage['/tree/node-xtpl.js'].lineData[138]++;
  option27.params[0] = module.resolve(option27.params[0]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[139]++;
  var commandRet29 = includeCommand.call(engine, scope, option27, buffer, 18, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[140]++;
  if (visit32_140_1(commandRet29 && commandRet29.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[141]++;
    buffer = commandRet29;
    _$jscoverage['/tree/node-xtpl.js'].lineData[142]++;
    commandRet29 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[144]++;
  buffer.write(commandRet29, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[145]++;
  buffer.write('\n</div>\n<div id="ks-tree-node-children-');
  _$jscoverage['/tree/node-xtpl.js'].lineData[146]++;
  var id30 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[147]++;
  buffer.write(id30, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[148]++;
  buffer.write('"\n     class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[149]++;
  var option31 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[152]++;
  var params32 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[153]++;
  params32.push('children');
  _$jscoverage['/tree/node-xtpl.js'].lineData[154]++;
  option31.params = params32;
  _$jscoverage['/tree/node-xtpl.js'].lineData[155]++;
  var commandRet33 = callCommandUtil(engine, scope, option31, buffer, "getBaseCssClasses", 21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[156]++;
  if (visit33_156_1(commandRet33 && commandRet33.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[157]++;
    buffer = commandRet33;
    _$jscoverage['/tree/node-xtpl.js'].lineData[158]++;
    commandRet33 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[160]++;
  buffer.write(commandRet33, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[161]++;
  buffer.write('"\n');
  _$jscoverage['/tree/node-xtpl.js'].lineData[162]++;
  var option34 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[165]++;
  var params35 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[166]++;
  var id36 = scope.resolve(["expanded"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[167]++;
  params35.push(!(id36));
  _$jscoverage['/tree/node-xtpl.js'].lineData[168]++;
  option34.params = params35;
  _$jscoverage['/tree/node-xtpl.js'].lineData[169]++;
  option34.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[4]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[171]++;
  buffer.write('\nstyle="display:none"\n');
  _$jscoverage['/tree/node-xtpl.js'].lineData[173]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[175]++;
  buffer = ifCommand.call(engine, scope, option34, buffer, 22, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[176]++;
  buffer.write('\n>\n</div>');
  _$jscoverage['/tree/node-xtpl.js'].lineData[177]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[179]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/tree/node-xtpl.js'].lineData[180]++;
  return t;
});
