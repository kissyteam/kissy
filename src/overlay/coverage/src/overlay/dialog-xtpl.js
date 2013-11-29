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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].functionData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/overlay/dialog-xtpl.js'].branchData) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'][1].init(648, 10, 'moduleWrap');
function visit8_20_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit7_9_2(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit6_9_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[1]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[9]++;
  if (visit6_9_1(visit7_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, getExpressionUtil = utils.getExpression, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[15]++;
  buffer += '';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[16]++;
  var config1 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[17]++;
  var params2 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[18]++;
  params2.push('overlay/close-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[19]++;
  config1.params = params2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20]++;
  if (visit8_20_1(moduleWrap)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21]++;
    require("overlay/close-xtpl");
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22]++;
    config1.params[0] = moduleWrap.resolveByName(config1.params[0]);
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, config1, "include", 0, 1, false, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[25]++;
  buffer += id0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  buffer += '\n<div id="ks-content-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  buffer += getExpressionUtil(id3, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  buffer += '"\n     class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
  var config5 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
  params6.push('content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
  config5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  var id4 = getPropertyOrRunCommandUtil(engine, scope, config5, "getBaseCssClasses", 0, 3, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35]++;
  buffer += id4;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  var config8 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  params9.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  config8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, config8, "getBaseCssClasses", 0, 4, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  buffer += id7;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  var config10 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  var params11 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "headerStyle", 0, 6, undefined, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  params11.push(id12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  config10.params = params11;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  config10.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  buffer += ' \n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 7, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  buffer += getExpressionUtil(id13, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 7, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  buffer += getExpressionUtil(id14, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60]++;
  buffer += runBlockCommandUtil(engine, scope, config10, "each", 6);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[61]++;
  buffer += '\n"\n         id="ks-stdmod-header-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  buffer += getExpressionUtil(id15, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "headerContent", 0, 10, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  buffer += getExpressionUtil(id16, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  var config18 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  var params19 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  params19.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  config18.params = params19;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scope, config18, "getBaseCssClasses", 0, 12, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  buffer += id17;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  var config20 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  var params21 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "bodyStyle", 0, 14, undefined, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  params21.push(id22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  config20.params = params21;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  config20.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  buffer += ' \n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 15, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  buffer += getExpressionUtil(id23, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  var id24 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 15, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  buffer += getExpressionUtil(id24, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
  buffer += runBlockCommandUtil(engine, scope, config20, "each", 14);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[92]++;
  buffer += '\n"\n         id="ks-stdmod-body-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  var id25 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 18, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer += getExpressionUtil(id25, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  var id26 = getPropertyOrRunCommandUtil(engine, scope, {}, "bodyContent", 0, 18, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97]++;
  buffer += getExpressionUtil(id26, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  var config28 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  var params29 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  params29.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  config28.params = params29;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scope, config28, "getBaseCssClasses", 0, 20, true, undefined);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  buffer += id27;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  var config30 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  var params31 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
  var id32 = getPropertyOrRunCommandUtil(engine, scope, {}, "footerStyle", 0, 22, undefined, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  params31.push(id32);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  config30.params = params31;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111]++;
  config30.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  buffer += ' \n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  var id33 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 23, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  buffer += getExpressionUtil(id33, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  var id34 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 23, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  buffer += getExpressionUtil(id34, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  buffer += runBlockCommandUtil(engine, scope, config30, "each", 22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[123]++;
  buffer += '\n"\n         id="ks-stdmod-footer-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 26, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  buffer += getExpressionUtil(id35, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
  var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "footerContent", 0, 26, undefined, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
  buffer += getExpressionUtil(id36, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129]++;
  buffer += '</div>\n</div>\n<div tabindex="0"></div>';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  return buffer;
};
});
