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
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[111] = 0;
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
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['62'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['85'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['85'][1] = new BranchData();
}
_$jscoverage['/overlay/overlay-xtpl.js'].branchData['85'][1].init(3616, 37, 'commandRet13 && commandRet13.isBuffer');
function visit39_85_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['62'][1].init(1131, 37, 'commandRet10 && commandRet10.isBuffer');
function visit38_62_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['49'][1].init(465, 35, 'commandRet7 && commandRet7.isBuffer');
function visit37_49_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit36_8_1(result) {
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
  if (visit36_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
  buffer.write('\r\n    ');
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
  buffer.write('\r\n        <a href="javascript:void(\'close\')"\r\n           class="');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[42]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[45]++;
  var params6 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[46]++;
  params6.push('close');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[47]++;
  option5.params = params6;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[48]++;
  var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[49]++;
  if (visit37_49_1(commandRet7 && commandRet7.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[50]++;
    buffer = commandRet7;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[51]++;
    commandRet7 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[53]++;
  buffer.write(commandRet7, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[54]++;
  buffer.write('"\r\n           role=\'button\'>\r\n            <span class="');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[55]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[58]++;
  var params9 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[59]++;
  params9.push('close-x');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[60]++;
  option8.params = params9;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[61]++;
  var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[62]++;
  if (visit38_62_1(commandRet10 && commandRet10.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[63]++;
    buffer = commandRet10;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[64]++;
    commandRet10 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[66]++;
  buffer.write(commandRet10, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[67]++;
  buffer.write('">close</span>\r\n        </a>\r\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[69]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[71]++;
  buffer = ifCommand.call(engine, scope, option2, buffer, 2, payload);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[72]++;
  buffer.write('\r\n');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[74]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[76]++;
  buffer = blockCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[77]++;
  buffer.write('\r\n\r\n<div class="');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[78]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[81]++;
  var params12 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[82]++;
  params12.push('content');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[83]++;
  option11.params = params12;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[84]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[85]++;
  if (visit39_85_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[86]++;
    buffer = commandRet13;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[87]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[89]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[90]++;
  buffer.write('">\r\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[91]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[94]++;
  var params15 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[95]++;
  params15.push('ks-overlay-content');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[96]++;
  option14.params = params15;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[97]++;
  option14.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[99]++;
  buffer.write('\r\n        ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[100]++;
  var id16 = scope.resolve(["content"]);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[101]++;
  buffer.write(id16, false);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[102]++;
  buffer.write('\r\n    ');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[104]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[106]++;
  buffer = blockCommand.call(engine, scope, option14, buffer, 12, payload);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[107]++;
  buffer.write('\r\n</div>');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[108]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[110]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[111]++;
  return t;
});
