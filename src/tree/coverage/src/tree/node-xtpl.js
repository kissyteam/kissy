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
  _$jscoverage['/tree/node-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[130] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[178] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['53'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['71'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['110'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['128'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['141'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['154'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['154'][1] = new BranchData();
}
_$jscoverage['/tree/node-xtpl.js'].branchData['154'][1].init(6327, 37, 'commandRet31 && commandRet31.isBuffer');
function visit29_154_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['141'][1].init(5790, 37, 'commandRet28 && commandRet28.isBuffer');
function visit28_141_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['128'][1].init(5151, 37, 'commandRet25 && commandRet25.isBuffer');
function visit27_128_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['110'][1].init(1090, 37, 'commandRet22 && commandRet22.isBuffer');
function visit26_110_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['97'][1].init(525, 37, 'commandRet19 && commandRet19.isBuffer');
function visit25_97_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['71'][1].init(2829, 37, 'commandRet11 && commandRet11.isBuffer');
function visit24_71_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['53'][1].init(372, 35, 'commandRet8 && commandRet8.isBuffer');
function visit23_53_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['30'][1].init(1253, 35, 'commandRet2 && commandRet2.isBuffer');
function visit22_30_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit21_8_1(result) {
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
  if (visit21_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/tree/node-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[27]++;
  params1.push('row');
  _$jscoverage['/tree/node-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/tree/node-xtpl.js'].lineData[30]++;
  if (visit22_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/tree/node-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[35]++;
  buffer.write('\n     ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[40]++;
  var id5 = scope.resolve(["selected"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[41]++;
  params4.push(id5);
  _$jscoverage['/tree/node-xtpl.js'].lineData[42]++;
  option3.params = params4;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[2]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[45]++;
  buffer.write('\n        ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[46]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[49]++;
  var params7 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[50]++;
  params7.push('selected');
  _$jscoverage['/tree/node-xtpl.js'].lineData[51]++;
  option6.params = params7;
  _$jscoverage['/tree/node-xtpl.js'].lineData[52]++;
  var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/tree/node-xtpl.js'].lineData[53]++;
  if (visit23_53_1(commandRet8 && commandRet8.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[54]++;
    buffer = commandRet8;
    _$jscoverage['/tree/node-xtpl.js'].lineData[55]++;
    commandRet8 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[57]++;
  buffer.write(commandRet8, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[58]++;
  buffer.write('\n     ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[60]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[62]++;
  buffer = ifCommand.call(engine, scope, option3, buffer, 2, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[63]++;
  buffer.write('\n     ">\n    <div class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[64]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[67]++;
  var params10 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[68]++;
  params10.push('expand-icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[69]++;
  option9.params = params10;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70]++;
  var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/tree/node-xtpl.js'].lineData[71]++;
  if (visit24_71_1(commandRet11 && commandRet11.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[72]++;
    buffer = commandRet11;
    _$jscoverage['/tree/node-xtpl.js'].lineData[73]++;
    commandRet11 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[75]++;
  buffer.write(commandRet11, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[76]++;
  buffer.write('">\n    </div>\n    ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[77]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[80]++;
  var params13 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[81]++;
  var id14 = scope.resolve(["checkable"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[82]++;
  params13.push(id14);
  _$jscoverage['/tree/node-xtpl.js'].lineData[83]++;
  option12.params = params13;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84]++;
  option12.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[3]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[86]++;
  buffer.write('\n    <div class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[87]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[90]++;
  var params16 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[91]++;
  var exp18 = 'checked';
  _$jscoverage['/tree/node-xtpl.js'].lineData[92]++;
  var id17 = scope.resolve(["checkState"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[93]++;
  exp18 = ('checked') + (id17);
  _$jscoverage['/tree/node-xtpl.js'].lineData[94]++;
  params16.push(exp18);
  _$jscoverage['/tree/node-xtpl.js'].lineData[95]++;
  option15.params = params16;
  _$jscoverage['/tree/node-xtpl.js'].lineData[96]++;
  var commandRet19 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/tree/node-xtpl.js'].lineData[97]++;
  if (visit25_97_1(commandRet19 && commandRet19.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[98]++;
    buffer = commandRet19;
    _$jscoverage['/tree/node-xtpl.js'].lineData[99]++;
    commandRet19 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[101]++;
  buffer.write(commandRet19, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[102]++;
  buffer.write(' ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[103]++;
  var option20 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[106]++;
  var params21 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[107]++;
  params21.push('checked');
  _$jscoverage['/tree/node-xtpl.js'].lineData[108]++;
  option20.params = params21;
  _$jscoverage['/tree/node-xtpl.js'].lineData[109]++;
  var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/tree/node-xtpl.js'].lineData[110]++;
  if (visit26_110_1(commandRet22 && commandRet22.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[111]++;
    buffer = commandRet22;
    _$jscoverage['/tree/node-xtpl.js'].lineData[112]++;
    commandRet22 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[114]++;
  buffer.write(commandRet22, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[115]++;
  buffer.write('"></div>\n    ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[117]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[119]++;
  buffer = ifCommand.call(engine, scope, option12, buffer, 8, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[120]++;
  buffer.write('\n    <div class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[121]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[124]++;
  var params24 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[125]++;
  params24.push('icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[126]++;
  option23.params = params24;
  _$jscoverage['/tree/node-xtpl.js'].lineData[127]++;
  var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/tree/node-xtpl.js'].lineData[128]++;
  if (visit27_128_1(commandRet25 && commandRet25.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[129]++;
    buffer = commandRet25;
    _$jscoverage['/tree/node-xtpl.js'].lineData[130]++;
    commandRet25 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[132]++;
  buffer.write(commandRet25, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[133]++;
  buffer.write('">\n\n    </div>\n    ');
  _$jscoverage['/tree/node-xtpl.js'].lineData[134]++;
  var option26 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[135]++;
  var params27 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[136]++;
  params27.push('component/extension/content-xtpl');
  _$jscoverage['/tree/node-xtpl.js'].lineData[137]++;
  option26.params = params27;
  _$jscoverage['/tree/node-xtpl.js'].lineData[138]++;
  require("component/extension/content-xtpl");
  _$jscoverage['/tree/node-xtpl.js'].lineData[139]++;
  option26.params[0] = module.resolve(option26.params[0]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[140]++;
  var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 14, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[141]++;
  if (visit28_141_1(commandRet28 && commandRet28.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[142]++;
    buffer = commandRet28;
    _$jscoverage['/tree/node-xtpl.js'].lineData[143]++;
    commandRet28 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[145]++;
  buffer.write(commandRet28, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[146]++;
  buffer.write('\n</div>\n<div class="');
  _$jscoverage['/tree/node-xtpl.js'].lineData[147]++;
  var option29 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[150]++;
  var params30 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[151]++;
  params30.push('children');
  _$jscoverage['/tree/node-xtpl.js'].lineData[152]++;
  option29.params = params30;
  _$jscoverage['/tree/node-xtpl.js'].lineData[153]++;
  var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 16);
  _$jscoverage['/tree/node-xtpl.js'].lineData[154]++;
  if (visit29_154_1(commandRet31 && commandRet31.isBuffer)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[155]++;
    buffer = commandRet31;
    _$jscoverage['/tree/node-xtpl.js'].lineData[156]++;
    commandRet31 = undefined;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[158]++;
  buffer.write(commandRet31, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[159]++;
  buffer.write('"\n');
  _$jscoverage['/tree/node-xtpl.js'].lineData[160]++;
  var option32 = {
  escape: 1};
  _$jscoverage['/tree/node-xtpl.js'].lineData[163]++;
  var params33 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[164]++;
  var id34 = scope.resolve(["expanded"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[165]++;
  params33.push(!(id34));
  _$jscoverage['/tree/node-xtpl.js'].lineData[166]++;
  option32.params = params33;
  _$jscoverage['/tree/node-xtpl.js'].lineData[167]++;
  option32.fn = function(scope, buffer) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[4]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[169]++;
  buffer.write('\nstyle="display:none"\n');
  _$jscoverage['/tree/node-xtpl.js'].lineData[171]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[173]++;
  buffer = ifCommand.call(engine, scope, option32, buffer, 17, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[174]++;
  buffer.write('\n>\n</div>');
  _$jscoverage['/tree/node-xtpl.js'].lineData[175]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[177]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/tree/node-xtpl.js'].lineData[178]++;
  return t;
});
