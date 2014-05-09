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
  _$jscoverage['/bar/bar-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[82] = 0;
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
  _$jscoverage['/bar/bar-xtpl.js'].lineData[97] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].functionData) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData = [];
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2] = 0;
}
if (! _$jscoverage['/bar/bar-xtpl.js'].branchData) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData = {};
  _$jscoverage['/bar/bar-xtpl.js'].branchData['38'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['52'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['73'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/bar/bar-xtpl.js'].branchData['87'] = [];
  _$jscoverage['/bar/bar-xtpl.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/bar/bar-xtpl.js'].branchData['87'][1].init(3461, 31, 'callRet15 && callRet15.isBuffer');
function visit4_87_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['73'][1].init(2924, 31, 'callRet12 && callRet12.isBuffer');
function visit3_73_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['52'][1].init(980, 29, 'callRet8 && callRet8.isBuffer');
function visit2_52_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].branchData['38'][1].init(401, 29, 'callRet5 && callRet5.isBuffer');
function visit1_38_1(result) {
  _$jscoverage['/bar/bar-xtpl.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar/bar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[0]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[4]++;
  var bar = function(scope, buffer, undefined) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[1]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[20]++;
  buffer.write('', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[25]++;
  var id2 = scope.resolve(["withTitle"], 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[26]++;
  params1.push(id2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[27]++;
  option0.params = params1;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[28]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/bar/bar-xtpl.js'].functionData[2]++;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[29]++;
  buffer.write('\r\n<div class="', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[30]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[33]++;
  var params4 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[34]++;
  params4.push('title-wrap');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[35]++;
  option3.params = params4;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[36]++;
  var callRet5;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[37]++;
  callRet5 = callFnUtil(tpl, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[38]++;
  if (visit1_38_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[39]++;
    buffer = callRet5;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[40]++;
    callRet5 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[42]++;
  buffer.write(callRet5, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[43]++;
  buffer.write('">\r\n    <div class="', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[44]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[47]++;
  var params7 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[48]++;
  params7.push('title');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[49]++;
  option6.params = params7;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[50]++;
  var callRet8;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[51]++;
  callRet8 = callFnUtil(tpl, scope, option6, buffer, ["getBaseCssClasses"], 0, 3);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[52]++;
  if (visit2_52_1(callRet8 && callRet8.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[53]++;
    buffer = callRet8;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[54]++;
    callRet8 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[56]++;
  buffer.write(callRet8, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[57]++;
  buffer.write('">', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[58]++;
  var id9 = scope.resolve(["title"], 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[59]++;
  buffer.write(id9, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[60]++;
  buffer.write('</div>\r\n</div>\r\n', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[61]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[63]++;
  buffer = ifCommand.call(tpl, scope, option0, buffer, 1);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[64]++;
  buffer.write('\r\n<div class="', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[65]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[68]++;
  var params11 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[69]++;
  params11.push('content');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[70]++;
  option10.params = params11;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[71]++;
  var callRet12;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[72]++;
  callRet12 = callFnUtil(tpl, scope, option10, buffer, ["getBaseCssClasses"], 0, 6);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[73]++;
  if (visit3_73_1(callRet12 && callRet12.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[74]++;
    buffer = callRet12;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[75]++;
    callRet12 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[77]++;
  buffer.write(callRet12, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[78]++;
  buffer.write('">\r\n    <div class="', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[79]++;
  var option13 = {
  escape: 1};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[82]++;
  var params14 = [];
  _$jscoverage['/bar/bar-xtpl.js'].lineData[83]++;
  params14.push('center');
  _$jscoverage['/bar/bar-xtpl.js'].lineData[84]++;
  option13.params = params14;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[85]++;
  var callRet15;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[86]++;
  callRet15 = callFnUtil(tpl, scope, option13, buffer, ["getBaseCssClasses"], 0, 7);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[87]++;
  if (visit4_87_1(callRet15 && callRet15.isBuffer)) {
    _$jscoverage['/bar/bar-xtpl.js'].lineData[88]++;
    buffer = callRet15;
    _$jscoverage['/bar/bar-xtpl.js'].lineData[89]++;
    callRet15 = undefined;
  }
  _$jscoverage['/bar/bar-xtpl.js'].lineData[91]++;
  buffer.write(callRet15, true);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[92]++;
  buffer.write('"></div>\r\n</div>', 0);
  _$jscoverage['/bar/bar-xtpl.js'].lineData[93]++;
  return buffer;
};
  _$jscoverage['/bar/bar-xtpl.js'].lineData[95]++;
  bar.TPL_NAME = module.name;
  _$jscoverage['/bar/bar-xtpl.js'].lineData[96]++;
  bar.version = "5.0.0";
  _$jscoverage['/bar/bar-xtpl.js'].lineData[97]++;
  return bar;
});
