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
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[38] = 0;
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
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[148] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['60'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['80'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['111'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['125'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['138'] = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['138'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['138'][1].init(5665, 31, 'callRet27 && callRet27.isBuffer');
function visit10_138_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['125'][1].init(5144, 31, 'callRet24 && callRet24.isBuffer');
function visit9_125_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['111'][1].init(4573, 31, 'callRet21 && callRet21.isBuffer');
function visit8_111_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['97'][1].init(4034, 31, 'callRet18 && callRet18.isBuffer');
function visit7_97_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['80'][1].init(3259, 31, 'callRet14 && callRet14.isBuffer');
function visit6_80_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['60'][1].init(2431, 29, 'callRet9 && callRet9.isBuffer');
function visit5_60_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'][1].init(1671, 29, 'callRet5 && callRet5.isBuffer');
function visit4_43_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['29'][1].init(1139, 29, 'callRet2 && callRet2.isBuffer');
function visit3_29_1(result) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[4]++;
  var decadePanel = function(scope, buffer, undefined) {
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[20]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[25]++;
  params1.push('header');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[27]++;
  var callRet2;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[28]++;
  callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[29]++;
  if (visit3_29_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[30]++;
    buffer = callRet2;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[31]++;
    callRet2 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[33]++;
  buffer.write(callRet2, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[34]++;
  buffer.write('">\r\n    <a class="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[35]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[38]++;
  var params4 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[39]++;
  params4.push('prev-century-btn');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[40]++;
  option3.params = params4;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[41]++;
  var callRet5;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[42]++;
  callRet5 = callFnUtil(tpl, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[43]++;
  if (visit4_43_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[44]++;
    buffer = callRet5;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[45]++;
    callRet5 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[47]++;
  buffer.write(callRet5, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[48]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[49]++;
  var id6 = scope.resolve(["previousCenturyLabel"], 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[50]++;
  buffer.write(id6, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <div class="', 0);
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
  var callRet9;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[59]++;
  callRet9 = callFnUtil(tpl, scope, option7, buffer, ["getBaseCssClasses"], 0, 8);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[60]++;
  if (visit5_60_1(callRet9 && callRet9.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[61]++;
    buffer = callRet9;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[62]++;
    callRet9 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[64]++;
  buffer.write(callRet9, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[65]++;
  buffer.write('">\r\n                ', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[66]++;
  var id10 = scope.resolve(["startYear"], 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[67]++;
  buffer.write(id10, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[68]++;
  buffer.write('-', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[69]++;
  var id11 = scope.resolve(["endYear"], 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[70]++;
  buffer.write(id11, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[71]++;
  buffer.write('\r\n    </div>\r\n    <a class="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[72]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[75]++;
  var params13 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[76]++;
  params13.push('next-century-btn');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[77]++;
  option12.params = params13;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[78]++;
  var callRet14;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[79]++;
  callRet14 = callFnUtil(tpl, scope, option12, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[80]++;
  if (visit6_80_1(callRet14 && callRet14.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[81]++;
    buffer = callRet14;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[82]++;
    callRet14 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[84]++;
  buffer.write(callRet14, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[85]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[86]++;
  var id15 = scope.resolve(["nextCenturyLabel"], 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[87]++;
  buffer.write(id15, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[88]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[89]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[92]++;
  var params17 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[93]++;
  params17.push('body');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[94]++;
  option16.params = params17;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[95]++;
  var callRet18;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[96]++;
  callRet18 = callFnUtil(tpl, scope, option16, buffer, ["getBaseCssClasses"], 0, 18);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[97]++;
  if (visit7_97_1(callRet18 && callRet18.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[98]++;
    buffer = callRet18;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[99]++;
    callRet18 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[101]++;
  buffer.write(callRet18, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[102]++;
  buffer.write('">\r\n    <table class="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[103]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[106]++;
  var params20 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[107]++;
  params20.push('table');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[108]++;
  option19.params = params20;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[109]++;
  var callRet21;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[110]++;
  callRet21 = callFnUtil(tpl, scope, option19, buffer, ["getBaseCssClasses"], 0, 19);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[111]++;
  if (visit8_111_1(callRet21 && callRet21.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[112]++;
    buffer = callRet21;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[113]++;
    callRet21 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[115]++;
  buffer.write(callRet21, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[116]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[117]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[120]++;
  var params23 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[121]++;
  params23.push('tbody');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[122]++;
  option22.params = params23;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[123]++;
  var callRet24;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[124]++;
  callRet24 = callFnUtil(tpl, scope, option22, buffer, ["getBaseCssClasses"], 0, 20);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[125]++;
  if (visit9_125_1(callRet24 && callRet24.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[126]++;
    buffer = callRet24;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[127]++;
    callRet24 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[129]++;
  buffer.write(callRet24, true);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[130]++;
  buffer.write('">\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[131]++;
  var option25 = {};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[132]++;
  var params26 = [];
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[133]++;
  params26.push('./decades-xtpl');
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[134]++;
  option25.params = params26;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[135]++;
  require("./decades-xtpl");
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[136]++;
  var callRet27;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[137]++;
  callRet27 = includeCommand.call(tpl, scope, option25, buffer, 21);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[138]++;
  if (visit10_138_1(callRet27 && callRet27.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[139]++;
    buffer = callRet27;
    _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[140]++;
    callRet27 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[142]++;
  buffer.write(callRet27, false);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[143]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[144]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[146]++;
  decadePanel.TPL_NAME = module.name;
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[147]++;
  decadePanel.version = "5.0.0";
  _$jscoverage['/picker/decade-panel/decade-panel-xtpl.js'].lineData[148]++;
  return decadePanel;
});
