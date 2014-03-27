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
if (! _$jscoverage['/bar/bar-xtpl.js']) {
  _$jscoverage['/bar/bar-xtpl.js'] = {};
  _$jscoverage['/bar/bar-xtpl.js'].lineData = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[108] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].functionData) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData = [];
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].branchData) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData = {};
  _$jscoverage['/bar/bar-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['56'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['80'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['96'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['96'][1] = new BranchData();
}
_$jscoverage['/bar/bar-xtpl.js'].branchData['96'][1].init(3986, 37, 'commandRet17 && commandRet17.isBuffer');
function visit10_96_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['80'][1].init(3307, 37, 'commandRet13 && commandRet13.isBuffer');
function visit9_80_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['56'][1].init(952, 35, 'commandRet8 && commandRet8.isBuffer');
function visit8_56_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['43'][1].init(380, 35, 'commandRet5 && commandRet5.isBuffer');
function visit7_43_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit6_11_2(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit5_11_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit4_8_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[8]++;
  if (visit4_8_1("1.50" !== S.version)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[11]++;
  if (visit5_11_1(visit6_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25]++;
  buffer.write('');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29]++;
  var params1 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30]++;
  var id2 = scope.resolve(["withTitle"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[31]++;
  params1.push(id2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32]++;
  option0.params = params1;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35]++;
  buffer.write('\r\n<div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40]++;
  params4.push('title-wrap');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43]++;
  if (visit7_43_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[44]++;
    buffer = commandRet5;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[45]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[47]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48]++;
  buffer.write('">\r\n    <div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52]++;
  var params7 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53]++;
  params7.push('title');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54]++;
  option6.params = params7;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[55]++;
  var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56]++;
  if (visit8_56_1(commandRet8 && commandRet8.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[57]++;
    buffer = commandRet8;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[58]++;
    commandRet8 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60]++;
  buffer.write(commandRet8, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61]++;
  buffer.write('" id="ks-navigation-bar-title-');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[62]++;
  var id9 = scope.resolve(["id"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63]++;
  buffer.write(id9, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64]++;
  buffer.write('">');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65]++;
  var id10 = scope.resolve(["title"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66]++;
  buffer.write(id10, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67]++;
  buffer.write('</div>\r\n</div>\r\n');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71]++;
  buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72]++;
  buffer.write('\r\n<div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[76]++;
  var params12 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[77]++;
  params12.push('content');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78]++;
  option11.params = params12;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[80]++;
  if (visit9_80_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[81]++;
    buffer = commandRet13;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[82]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[84]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[85]++;
  buffer.write('" id="ks-navigation-bar-content-');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[86]++;
  var id14 = scope.resolve(["id"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[87]++;
  buffer.write(id14, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[88]++;
  buffer.write('">\r\n    <div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[89]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[92]++;
  var params16 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[93]++;
  params16.push('center');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[94]++;
  option15.params = params16;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[95]++;
  var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[96]++;
  if (visit10_96_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[97]++;
    buffer = commandRet17;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[98]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[100]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[101]++;
  buffer.write('" id="ks-navigation-bar-center-');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[102]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[103]++;
  buffer.write(id18, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[104]++;
  buffer.write('"></div>\r\n</div>');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[105]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[107]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[108]++;
  return t;
});
