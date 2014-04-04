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
if (! _$jscoverage['/overlay/overlay-xtpl.js']) {
  _$jscoverage['/overlay/overlay-xtpl.js'] = {};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[117] = 0;
}
if (! _$jscoverage['/overlay/overlay-xtpl.js'].functionData) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/overlay/overlay-xtpl.js'].branchData) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData = {};
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['52'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['65'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['91'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['91'][1] = new BranchData();
}
_$jscoverage['/overlay/overlay-xtpl.js'].branchData['91'][1].init(3905, 37, 'commandRet15 && commandRet15.isBuffer');
function visit40_91_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['65'][1].init(1297, 37, 'commandRet11 && commandRet11.isBuffer');
function visit39_65_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['52'][1].init(632, 35, 'commandRet8 && commandRet8.isBuffer');
function visit38_52_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
function visit37_8_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[8]++;
  if (visit37_8_1("1.50" !== S.version)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[22]++;
  buffer.write('');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[27]++;
  params1.push('ks-overlay-closable');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[29]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[31]++;
  buffer.write('\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[32]++;
  var option2 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[35]++;
  var params3 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[36]++;
  var id4 = scope.resolve(["closable"]);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[37]++;
  params3.push(id4);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[38]++;
  option2.params = params3;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[39]++;
  option2.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[41]++;
  buffer.write('\n        <a href="javascript:void(\'close\')"\n           id="ks-overlay-close-');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[42]++;
  var id5 = scope.resolve(["id"]);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[43]++;
  buffer.write(id5, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[44]++;
  buffer.write('"\n           class="');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[45]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[48]++;
  var params7 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[49]++;
  params7.push('close');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[50]++;
  option6.params = params7;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[51]++;
  var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 5);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[52]++;
  if (visit38_52_1(commandRet8 && commandRet8.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[53]++;
    buffer = commandRet8;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[54]++;
    commandRet8 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[56]++;
  buffer.write(commandRet8, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[57]++;
  buffer.write('"\n           role=\'button\'>\n            <span class="');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[58]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[61]++;
  var params10 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[62]++;
  params10.push('close-x');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[63]++;
  option9.params = params10;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[64]++;
  var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[65]++;
  if (visit39_65_1(commandRet11 && commandRet11.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[66]++;
    buffer = commandRet11;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[67]++;
    commandRet11 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[69]++;
  buffer.write(commandRet11, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[70]++;
  buffer.write('">close</span>\n        </a>\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[72]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[74]++;
  buffer = ifCommand.call(engine, scope, option2, buffer, 2, payload);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[75]++;
  buffer.write('\n');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[77]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[79]++;
  buffer = blockCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[80]++;
  buffer.write('\n\n<div id="ks-content-');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[81]++;
  var id12 = scope.resolve(["id"]);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[82]++;
  buffer.write(id12, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[83]++;
  buffer.write('"\n     class="');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[84]++;
  var option13 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[87]++;
  var params14 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[88]++;
  params14.push('content');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[89]++;
  option13.params = params14;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[90]++;
  var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 13);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[91]++;
  if (visit40_91_1(commandRet15 && commandRet15.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[92]++;
    buffer = commandRet15;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[93]++;
    commandRet15 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[95]++;
  buffer.write(commandRet15, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[96]++;
  buffer.write('">\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[97]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[100]++;
  var params17 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[101]++;
  params17.push('ks-overlay-content');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[102]++;
  option16.params = params17;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[103]++;
  option16.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[105]++;
  buffer.write('\n        ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[106]++;
  var id18 = scope.resolve(["content"]);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[107]++;
  buffer.write(id18, false);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[108]++;
  buffer.write('\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[110]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[112]++;
  buffer = blockCommand.call(engine, scope, option16, buffer, 14, payload);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[113]++;
  buffer.write('\n</div>');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[114]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[116]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[117]++;
  return t;
});
