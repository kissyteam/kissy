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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132] = 0;
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
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['22'] = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['22'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-xtpl.js'].branchData['22'][1].init(762, 10, 'moduleWrap');
function visit8_22_1(result) {
  _$jscoverage['/overlay/dialog-xtpl.js'].branchData['22'][1].ranCondition(result);
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
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[17]++;
  buffer += '';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[18]++;
  var config1 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[19]++;
  var params2 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[20]++;
  params2.push('overlay/close-xtpl');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[21]++;
  config1.params = params2;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[22]++;
  if (visit8_22_1(moduleWrap)) {
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[23]++;
    require("overlay/close-xtpl");
    _$jscoverage['/overlay/dialog-xtpl.js'].lineData[24]++;
    config1.params[0] = moduleWrap.resolveByName(config1.params[0]);
  }
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[26]++;
  var id0 = runInlineCommandUtil(engine, scope, config1, "include", 1);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[27]++;
  buffer += renderOutputUtil(id0, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[28]++;
  buffer += '\n<div id="ks-content-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[29]++;
  var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[30]++;
  buffer += renderOutputUtil(id3, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[31]++;
  buffer += '"\n     class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[32]++;
  var config5 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[33]++;
  var params6 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[34]++;
  params6.push('content');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[35]++;
  config5.params = params6;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[36]++;
  var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[37]++;
  buffer += renderOutputUtil(id4, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[38]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[39]++;
  var config8 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[40]++;
  var params9 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[41]++;
  params9.push('header');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[42]++;
  config8.params = params9;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[43]++;
  var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 4);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[44]++;
  buffer += renderOutputUtil(id7, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[45]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[46]++;
  var config10 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[47]++;
  var params11 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[48]++;
  var id12 = getPropertyUtil(engine, scope, "headerStyle", 0, 6);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[49]++;
  params11.push(id12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[50]++;
  config10.params = params11;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[51]++;
  config10.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[52]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[53]++;
  buffer += ' \n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[54]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 7);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[55]++;
  buffer += renderOutputUtil(id13, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[56]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[57]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 7);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[58]++;
  buffer += renderOutputUtil(id14, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[59]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[60]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[62]++;
  buffer += runBlockCommandUtil(engine, scope, config10, "each", 6);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[63]++;
  buffer += '\n"\n         id="ks-stdmod-header-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[64]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[65]++;
  buffer += renderOutputUtil(id15, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[66]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[67]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "headerContent", 0, 10);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[68]++;
  buffer += renderOutputUtil(id16, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[69]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[70]++;
  var config18 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[71]++;
  var params19 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[72]++;
  params19.push('body');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[73]++;
  config18.params = params19;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[74]++;
  var id17 = runInlineCommandUtil(engine, scope, config18, "getBaseCssClasses", 12);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[75]++;
  buffer += renderOutputUtil(id17, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[76]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[77]++;
  var config20 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[78]++;
  var params21 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[79]++;
  var id22 = getPropertyUtil(engine, scope, "bodyStyle", 0, 14);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[80]++;
  params21.push(id22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[81]++;
  config20.params = params21;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[82]++;
  config20.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[83]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[84]++;
  buffer += ' \n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[85]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 15);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[86]++;
  buffer += renderOutputUtil(id23, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[87]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[88]++;
  var id24 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 15);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[89]++;
  buffer += renderOutputUtil(id24, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[90]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[91]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[93]++;
  buffer += runBlockCommandUtil(engine, scope, config20, "each", 14);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[94]++;
  buffer += '\n"\n         id="ks-stdmod-body-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[95]++;
  var id25 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 18);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[96]++;
  buffer += renderOutputUtil(id25, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[97]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[98]++;
  var id26 = getPropertyOrRunCommandUtil(engine, scope, {}, "bodyContent", 0, 18);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[99]++;
  buffer += renderOutputUtil(id26, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[100]++;
  buffer += '</div>\n\n    <div class="';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[101]++;
  var config28 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[102]++;
  var params29 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[103]++;
  params29.push('footer');
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[104]++;
  config28.params = params29;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[105]++;
  var id27 = runInlineCommandUtil(engine, scope, config28, "getBaseCssClasses", 20);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[106]++;
  buffer += renderOutputUtil(id27, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[107]++;
  buffer += '"\n         style="\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[108]++;
  var config30 = {};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[109]++;
  var params31 = [];
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[110]++;
  var id32 = getPropertyUtil(engine, scope, "footerStyle", 0, 22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[111]++;
  params31.push(id32);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[112]++;
  config30.params = params31;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[113]++;
  config30.fn = function(scope) {
  _$jscoverage['/overlay/dialog-xtpl.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[114]++;
  var buffer = "";
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[115]++;
  buffer += ' \n ';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[116]++;
  var id33 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 23);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[117]++;
  buffer += renderOutputUtil(id33, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[118]++;
  buffer += ':';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[119]++;
  var id34 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 23);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[120]++;
  buffer += renderOutputUtil(id34, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[121]++;
  buffer += ';\n';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[122]++;
  return buffer;
};
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[124]++;
  buffer += runBlockCommandUtil(engine, scope, config30, "each", 22);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[125]++;
  buffer += '\n"\n         id="ks-stdmod-footer-';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[126]++;
  var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 26);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[127]++;
  buffer += renderOutputUtil(id35, true);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[128]++;
  buffer += '">';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[129]++;
  var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "footerContent", 0, 26);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[130]++;
  buffer += renderOutputUtil(id36, false);
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[131]++;
  buffer += '</div>\n</div>\n<div tabindex="0"></div>';
  _$jscoverage['/overlay/dialog-xtpl.js'].lineData[132]++;
  return buffer;
};
});
