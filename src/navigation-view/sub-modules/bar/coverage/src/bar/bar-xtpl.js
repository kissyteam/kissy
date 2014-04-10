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
  _$jscoverage['/bar/bar-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[96] = 0;
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
  _$jscoverage['/bar/bar-xtpl.js'].branchData['40'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['53'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['74'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['87'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/bar/bar-xtpl.js'].branchData['87'][1].init(3558, 37, 'commandRet15 && commandRet15.isBuffer');
function visit5_87_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['74'][1].init(3025, 37, 'commandRet12 && commandRet12.isBuffer');
function visit4_74_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['53'][1].init(952, 35, 'commandRet8 && commandRet8.isBuffer');
function visit3_53_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['40'][1].init(380, 35, 'commandRet5 && commandRet5.isBuffer');
function visit2_40_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit1_8_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[8]++;
  if (visit1_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[22]++;
  buffer.write('');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27]++;
  var id2 = scope.resolve(["withTitle"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28]++;
  params1.push(id2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29]++;
  option0.params = params1;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[32]++;
  buffer.write('\r\n<div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36]++;
  var params4 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37]++;
  params4.push('title-wrap');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38]++;
  option3.params = params4;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40]++;
  if (visit2_40_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[41]++;
    buffer = commandRet5;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[42]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[45]++;
  buffer.write('">\r\n    <div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[46]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49]++;
  var params7 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50]++;
  params7.push('title');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51]++;
  option6.params = params7;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52]++;
  var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53]++;
  if (visit3_53_1(commandRet8 && commandRet8.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[54]++;
    buffer = commandRet8;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[55]++;
    commandRet8 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57]++;
  buffer.write(commandRet8, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58]++;
  buffer.write('">');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59]++;
  var id9 = scope.resolve(["title"]);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60]++;
  buffer.write(id9, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61]++;
  buffer.write('</div>\r\n</div>\r\n');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65]++;
  buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[66]++;
  buffer.write('\r\n<div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[67]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70]++;
  var params11 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71]++;
  params11.push('content');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72]++;
  option10.params = params11;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73]++;
  var commandRet12 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[74]++;
  if (visit4_74_1(commandRet12 && commandRet12.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[75]++;
    buffer = commandRet12;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[76]++;
    commandRet12 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78]++;
  buffer.write(commandRet12, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79]++;
  buffer.write('">\r\n    <div class="');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[80]++;
  var option13 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[83]++;
  var params14 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[84]++;
  params14.push('center');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[85]++;
  option13.params = params14;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[86]++;
  var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[87]++;
  if (visit5_87_1(commandRet15 && commandRet15.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[88]++;
    buffer = commandRet15;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[89]++;
    commandRet15 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[91]++;
  buffer.write(commandRet15, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[92]++;
  buffer.write('"></div>\r\n</div>');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[93]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[95]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[96]++;
  return t;
});
