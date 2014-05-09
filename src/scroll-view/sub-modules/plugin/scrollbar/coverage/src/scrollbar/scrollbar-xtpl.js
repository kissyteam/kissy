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
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js']) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'] = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[144] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['32'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['66'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['83'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['100'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['117'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['134'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['134'][1] = new BranchData();
}
_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['134'][1].init(5335, 31, 'callRet34 && callRet34.isBuffer');
function visit28_134_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['117'][1].init(4666, 31, 'callRet29 && callRet29.isBuffer');
function visit27_117_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['100'][1].init(3997, 31, 'callRet24 && callRet24.isBuffer');
function visit26_100_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['83'][1].init(3342, 31, 'callRet19 && callRet19.isBuffer');
function visit25_83_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['66'][1].init(2686, 31, 'callRet14 && callRet14.isBuffer');
function visit24_66_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'][1].init(1971, 29, 'callRet9 && callRet9.isBuffer');
function visit23_49_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['32'][1].init(1264, 29, 'callRet4 && callRet4.isBuffer');
function visit22_32_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4]++;
  var scrollbar = function(scope, buffer, undefined) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[20]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25]++;
  var id2 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26]++;
  var exp3 = id2;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27]++;
  exp3 = (id2) + ('-arrow-up arrow-up');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28]++;
  params1.push(exp3);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29]++;
  option0.params = params1;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30]++;
  var callRet4;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31]++;
  callRet4 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32]++;
  if (visit22_32_1(callRet4 && callRet4.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33]++;
    buffer = callRet4;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34]++;
    callRet4 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36]++;
  buffer.write(callRet4, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37]++;
  buffer.write('">\r\n    <a href="javascript:void(\'up\')">up</a>\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41]++;
  var params6 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42]++;
  var id7 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43]++;
  var exp8 = id7;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44]++;
  exp8 = (id7) + ('-arrow-down arrow-down');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45]++;
  params6.push(exp8);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46]++;
  option5.params = params6;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47]++;
  var callRet9;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48]++;
  callRet9 = callFnUtil(tpl, scope, option5, buffer, ["getBaseCssClasses"], 0, 4);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49]++;
  if (visit23_49_1(callRet9 && callRet9.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50]++;
    buffer = callRet9;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51]++;
    callRet9 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53]++;
  buffer.write(callRet9, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54]++;
  buffer.write('">\r\n    <a href="javascript:void(\'down\')">down</a>\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58]++;
  var params11 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59]++;
  var id12 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60]++;
  var exp13 = id12;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61]++;
  exp13 = (id12) + ('-track track');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62]++;
  params11.push(exp13);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63]++;
  option10.params = params11;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64]++;
  var callRet14;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65]++;
  callRet14 = callFnUtil(tpl, scope, option10, buffer, ["getBaseCssClasses"], 0, 7);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66]++;
  if (visit24_66_1(callRet14 && callRet14.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67]++;
    buffer = callRet14;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[68]++;
    callRet14 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70]++;
  buffer.write(callRet14, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71]++;
  buffer.write('">\r\n<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75]++;
  var params16 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76]++;
  var id17 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77]++;
  var exp18 = id17;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78]++;
  exp18 = (id17) + ('-drag drag');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79]++;
  params16.push(exp18);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80]++;
  option15.params = params16;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81]++;
  var callRet19;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82]++;
  callRet19 = callFnUtil(tpl, scope, option15, buffer, ["getBaseCssClasses"], 0, 8);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83]++;
  if (visit25_83_1(callRet19 && callRet19.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[84]++;
    buffer = callRet19;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85]++;
    callRet19 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[87]++;
  buffer.write(callRet19, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[88]++;
  buffer.write('">\r\n<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[89]++;
  var option20 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92]++;
  var params21 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93]++;
  var id22 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[94]++;
  var exp23 = id22;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95]++;
  exp23 = (id22) + ('-drag-top');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96]++;
  params21.push(exp23);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[97]++;
  option20.params = params21;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[98]++;
  var callRet24;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[99]++;
  callRet24 = callFnUtil(tpl, scope, option20, buffer, ["getBaseCssClasses"], 0, 9);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[100]++;
  if (visit26_100_1(callRet24 && callRet24.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[101]++;
    buffer = callRet24;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[102]++;
    callRet24 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[104]++;
  buffer.write(callRet24, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[105]++;
  buffer.write('">\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[106]++;
  var option25 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[109]++;
  var params26 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[110]++;
  var id27 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[111]++;
  var exp28 = id27;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[112]++;
  exp28 = (id27) + ('-drag-center');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[113]++;
  params26.push(exp28);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[114]++;
  option25.params = params26;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[115]++;
  var callRet29;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[116]++;
  callRet29 = callFnUtil(tpl, scope, option25, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[117]++;
  if (visit27_117_1(callRet29 && callRet29.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[118]++;
    buffer = callRet29;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[119]++;
    callRet29 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[121]++;
  buffer.write(callRet29, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[122]++;
  buffer.write('">\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[123]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[126]++;
  var params31 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[127]++;
  var id32 = scope.resolve(["axis"], 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[128]++;
  var exp33 = id32;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[129]++;
  exp33 = (id32) + ('-drag-bottom');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[130]++;
  params31.push(exp33);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[131]++;
  option30.params = params31;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[132]++;
  var callRet34;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[133]++;
  callRet34 = callFnUtil(tpl, scope, option30, buffer, ["getBaseCssClasses"], 0, 13);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[134]++;
  if (visit28_134_1(callRet34 && callRet34.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[135]++;
    buffer = callRet34;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[136]++;
    callRet34 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[138]++;
  buffer.write(callRet34, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[139]++;
  buffer.write('">\r\n</div>\r\n</div>\r\n</div>', 0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[140]++;
  return buffer;
};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[142]++;
  scrollbar.TPL_NAME = module.name;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[143]++;
  scrollbar.version = "5.0.0";
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[144]++;
  return scrollbar;
});
