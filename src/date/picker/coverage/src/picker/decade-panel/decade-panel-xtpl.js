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
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[129] = 0;
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
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['59'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['78'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['94'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['107'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['120'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['120'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['120'][1].init(5336, 37, 'commandRet24 && commandRet24.isBuffer');
function visit15_120_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['107'][1].init(4648, 37, 'commandRet21 && commandRet21.isBuffer');
function visit14_107_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['94'][1].init(4113, 37, 'commandRet18 && commandRet18.isBuffer');
function visit13_94_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['78'][1].init(3348, 37, 'commandRet14 && commandRet14.isBuffer');
function visit12_78_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['59'][1].init(2536, 35, 'commandRet9 && commandRet9.isBuffer');
function visit11_59_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'][1].init(1785, 35, 'commandRet5 && commandRet5.isBuffer');
function visit10_43_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['30'][1].init(1256, 35, 'commandRet2 && commandRet2.isBuffer');
function visit9_30_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
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
  if (visit8_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
  buffer.write('">\r\n    <a class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[40]++;
  params4.push('prev-century-btn');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[42]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[43]++;
  if (visit10_43_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[44]++;
    buffer = commandRet5;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[45]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[47]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[48]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[49]++;
  var id6 = scope.resolve(["previousCenturyLabel"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[50]++;
  buffer.write(id6, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[52]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[55]++;
  var params8 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[56]++;
  params8.push('century');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[57]++;
  option7.params = params8;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[58]++;
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 8);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[59]++;
  if (visit11_59_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[60]++;
    buffer = commandRet9;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[61]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[63]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[64]++;
  buffer.write('">\r\n                ');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[65]++;
  var id10 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[66]++;
  buffer.write(id10, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[67]++;
  buffer.write('-');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[68]++;
  var id11 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[69]++;
  buffer.write(id11, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[70]++;
  buffer.write('\r\n    </div>\r\n    <a class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[71]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[74]++;
  var params13 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[75]++;
  params13.push('next-century-btn');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[76]++;
  option12.params = params13;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[77]++;
  var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[78]++;
  if (visit12_78_1(commandRet14 && commandRet14.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[79]++;
    buffer = commandRet14;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[80]++;
    commandRet14 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[82]++;
  buffer.write(commandRet14, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[83]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[84]++;
  var id15 = scope.resolve(["nextCenturyLabel"]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[85]++;
  buffer.write(id15, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[86]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[87]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[90]++;
  var params17 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[91]++;
  params17.push('body');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[92]++;
  option16.params = params17;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[93]++;
  var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 18);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[94]++;
  if (visit13_94_1(commandRet18 && commandRet18.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[95]++;
    buffer = commandRet18;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[96]++;
    commandRet18 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[98]++;
  buffer.write(commandRet18, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[99]++;
  buffer.write('">\r\n    <table class="');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[100]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[103]++;
  var params20 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[104]++;
  params20.push('table');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[105]++;
  option19.params = params20;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[106]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 19);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[107]++;
  if (visit14_107_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[108]++;
    buffer = commandRet21;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[109]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[111]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[112]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <tbody>\r\n        ');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[113]++;
  var option22 = {};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[114]++;
  var params23 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[115]++;
  params23.push('date/picker/decade-panel/decades-xtpl');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[116]++;
  option22.params = params23;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[117]++;
  require("date/picker/decade-panel/decades-xtpl");
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[118]++;
  option22.params[0] = module.resolve(option22.params[0]);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[119]++;
  var commandRet24 = includeCommand.call(engine, scope, option22, buffer, 21, payload);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[120]++;
  if (visit15_120_1(commandRet24 && commandRet24.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[121]++;
    buffer = commandRet24;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[122]++;
    commandRet24 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[124]++;
  buffer.write(commandRet24, false);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[125]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[126]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[128]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[129]++;
  return t;
});
