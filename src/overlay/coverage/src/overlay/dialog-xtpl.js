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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[163] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['52'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['126'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['126'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['126'][1].init(3535, 37, 'commandRet25 && commandRet25.isBuffer');
function visit7_126_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'][1].init(1952, 37, 'commandRet16 && commandRet16.isBuffer');
function visit6_89_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['52'][1].init(380, 35, 'commandRet7 && commandRet7.isBuffer');
function visit5_52_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'][1].init(1310, 35, 'commandRet2 && commandRet2.isBuffer');
function visit4_30_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit3_8_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[8]++;
  if (visit3_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22]++;
  buffer.write('');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23]++;
  var option0 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  params1.push('./overlay-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  require("./overlay-xtpl");
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  option0.params[0] = module.resolve(option0.params[0]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  var commandRet2 = extendCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
  if (visit4_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35]++;
  buffer.write('\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  params4.push('ks-overlay-content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  buffer.write('\r\n    <div class="');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  params6.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  option5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  if (visit5_52_1(commandRet7 && commandRet7.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
    buffer = commandRet7;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
    commandRet7 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  buffer.write(commandRet7, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  buffer.write('"\r\n         style="\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  var id10 = scope.resolve(["headerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  params9.push(id10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  option8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  option8.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  buffer.write('\r\n ');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  var id11 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  buffer.write(id11, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  buffer.write(':');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  var id12 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  buffer.write(id12, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  buffer.write(';\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  buffer = eachCommand.call(engine, scope, option8, buffer, 5, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  buffer.write('\r\n">');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  var id13 = scope.resolve(["headerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  buffer.write(id13, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  buffer.write('</div>\r\n\r\n    <div class="');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  var params15 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  params15.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  option14.params = params15;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  var commandRet16 = callCommandUtil(engine, scope, option14, buffer, "getBaseCssClasses", 10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  if (visit6_89_1(commandRet16 && commandRet16.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
    buffer = commandRet16;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
    commandRet16 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  buffer.write(commandRet16, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer.write('"\r\n         style="\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  var option17 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  var params18 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  var id19 = scope.resolve(["bodyStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  params18.push(id19);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  option17.params = params18;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  option17.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  buffer.write('\r\n ');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  var id20 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  buffer.write(id20, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  buffer.write(':');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
  var id21 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  buffer.write(id21, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  buffer.write(';\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  buffer = eachCommand.call(engine, scope, option17, buffer, 12, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  buffer.write('\r\n">');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  var id22 = scope.resolve(["bodyContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  buffer.write(id22, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  buffer.write('</div>\r\n\r\n    <div class="');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  var params24 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
  params24.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  option23.params = params24;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 17);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  if (visit7_126_1(commandRet25 && commandRet25.isBuffer)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
    buffer = commandRet25;
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
    commandRet25 = undefined;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  buffer.write(commandRet25, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131]++;
  buffer.write('"\r\n         style="\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[135]++;
  var params27 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[136]++;
  var id28 = scope.resolve(["footerStyle"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[137]++;
  params27.push(id28);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[138]++;
  option26.params = params27;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[139]++;
  option26.fn = function(scope, buffer) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[141]++;
  buffer.write('\r\n ');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[142]++;
  var id29 = scope.resolve(["xindex"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[143]++;
  buffer.write(id29, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[144]++;
  buffer.write(':');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[145]++;
  var id30 = scope.resolve(["this"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[146]++;
  buffer.write(id30, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[147]++;
  buffer.write(';\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[149]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[151]++;
  buffer = eachCommand.call(engine, scope, option26, buffer, 19, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[152]++;
  buffer.write('\r\n">');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[153]++;
  var id31 = scope.resolve(["footerContent"]);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[154]++;
  buffer.write(id31, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[155]++;
  buffer.write('</div>\r\n    <div tabindex="0"></div>\r\n');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[157]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[159]++;
  buffer = blockCommand.call(engine, scope, option3, buffer, 2, payload);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[160]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[162]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[163]++;
  return t;
});
