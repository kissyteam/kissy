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
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[107] = 0;
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
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['46'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['60'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['82'] = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['82'][1] = new BranchData();
}
_$jscoverage['/overlay/overlay-xtpl.js'].branchData['82'][1].init(3510, 31, 'callRet13 && callRet13.isBuffer');
function visit37_82_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['60'][1].init(1168, 31, 'callRet10 && callRet10.isBuffer');
function visit36_60_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].branchData['46'][1].init(490, 29, 'callRet7 && callRet7.isBuffer');
function visit35_46_1(result) {
  _$jscoverage['/overlay/overlay-xtpl.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/overlay-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[4]++;
  var overlayXtpl = function(scope, buffer, undefined) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[20]++;
  buffer.write('', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[25]++;
  params1.push('ks-overlay-closable');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[27]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[28]++;
  buffer.write('\r\n    ', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[29]++;
  var option2 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[32]++;
  var params3 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[33]++;
  var id4 = scope.resolve(["closable"], 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[34]++;
  params3.push(id4);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[35]++;
  option2.params = params3;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[36]++;
  option2.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[37]++;
  buffer.write('\r\n        <a href="javascript:void(\'close\')"\r\n           class="', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[38]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[41]++;
  var params6 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[42]++;
  params6.push('close');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[43]++;
  option5.params = params6;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[44]++;
  var callRet7;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[45]++;
  callRet7 = callFnUtil(tpl, scope, option5, buffer, ["getBaseCssClasses"], 0, 4);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[46]++;
  if (visit35_46_1(callRet7 && callRet7.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[47]++;
    buffer = callRet7;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[48]++;
    callRet7 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[50]++;
  buffer.write(callRet7, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n           role=\'button\'>\r\n            <span class="', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[52]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[55]++;
  var params9 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[56]++;
  params9.push('close-x');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[57]++;
  option8.params = params9;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[58]++;
  var callRet10;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[59]++;
  callRet10 = callFnUtil(tpl, scope, option8, buffer, ["getBaseCssClasses"], 0, 6);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[60]++;
  if (visit36_60_1(callRet10 && callRet10.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[61]++;
    buffer = callRet10;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[62]++;
    callRet10 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[64]++;
  buffer.write(callRet10, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[65]++;
  buffer.write('">close</span>\r\n        </a>\r\n    ', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[66]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[68]++;
  buffer = ifCommand.call(tpl, scope, option2, buffer, 2);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[69]++;
  buffer.write('\r\n', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[70]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[72]++;
  buffer = blockCommand.call(tpl, scope, option0, buffer, 1);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[73]++;
  buffer.write('\r\n\r\n<div class="', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[74]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[77]++;
  var params12 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[78]++;
  params12.push('content');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[79]++;
  option11.params = params12;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[80]++;
  var callRet13;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[81]++;
  callRet13 = callFnUtil(tpl, scope, option11, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[82]++;
  if (visit37_82_1(callRet13 && callRet13.isBuffer)) {
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[83]++;
    buffer = callRet13;
    _$jscoverage['/overlay/overlay-xtpl.js'].lineData[84]++;
    callRet13 = undefined;
  }
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[86]++;
  buffer.write(callRet13, true);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[87]++;
  buffer.write('">\r\n    ', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[88]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[91]++;
  var params15 = [];
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[92]++;
  params15.push('ks-overlay-content');
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[93]++;
  option14.params = params15;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[94]++;
  option14.fn = function(scope, buffer) {
  _$jscoverage['/overlay/overlay-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[95]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[96]++;
  var id16 = scope.resolve(["content"], 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[97]++;
  buffer.write(id16, false);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[98]++;
  buffer.write('\r\n    ', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[99]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[101]++;
  buffer = blockCommand.call(tpl, scope, option14, buffer, 12);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[102]++;
  buffer.write('\r\n</div>', 0);
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[103]++;
  return buffer;
};
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[105]++;
  overlayXtpl.TPL_NAME = module.name;
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[106]++;
  overlayXtpl.version = "5.0.0";
  _$jscoverage['/overlay/overlay-xtpl.js'].lineData[107]++;
  return overlayXtpl;
});
