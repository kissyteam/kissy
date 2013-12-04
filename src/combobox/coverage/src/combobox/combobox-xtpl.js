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
if (! _$jscoverage['/combobox/combobox-xtpl.js']) {
  _$jscoverage['/combobox/combobox-xtpl.js'] = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].functionData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].branchData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'][2] = new BranchData();
}
_$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit2_9_2(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit1_9_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[9]++;
  if (visit1_9_1(visit2_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[17]++;
  buffer += '<div id="ks-combobox-invalid-el-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[18]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[19]++;
  buffer += renderOutputUtil(id0, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[20]++;
  buffer += '"\n     class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[21]++;
  var config2 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[22]++;
  var params3 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23]++;
  params3.push('invalid-el');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24]++;
  config2.params = params3;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25]++;
  var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26]++;
  buffer += renderOutputUtil(id1, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28]++;
  var config5 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29]++;
  var params6 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30]++;
  params6.push('invalid-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31]++;
  config5.params = params6;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32]++;
  var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33]++;
  buffer += renderOutputUtil(id4, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34]++;
  buffer += '"></div>\n</div>\n\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35]++;
  var config7 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36]++;
  var params8 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37]++;
  var id9 = getPropertyUtil(engine, scope, "hasTrigger", 0, 6);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38]++;
  params8.push(id9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39]++;
  config7.params = params8;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40]++;
  config7.fn = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42]++;
  buffer += '\n<div id="ks-combobox-trigger-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44]++;
  buffer += renderOutputUtil(id10, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45]++;
  buffer += '"\n     class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46]++;
  var config12 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47]++;
  var params13 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48]++;
  params13.push('trigger');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49]++;
  config12.params = params13;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50]++;
  var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 8);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51]++;
  buffer += renderOutputUtil(id11, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53]++;
  var config15 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54]++;
  var params16 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55]++;
  params16.push('trigger-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56]++;
  config15.params = params16;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57]++;
  var id14 = runInlineCommandUtil(engine, scope, config15, "getBaseCssClasses", 9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58]++;
  buffer += renderOutputUtil(id14, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59]++;
  buffer += '">&#x25BC;</div>\n</div>\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62]++;
  buffer += runBlockCommandUtil(engine, scope, config7, "if", 6);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63]++;
  buffer += '\n\n<div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64]++;
  var config18 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65]++;
  var params19 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66]++;
  params19.push('input-wrap');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67]++;
  config18.params = params19;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68]++;
  var id17 = runInlineCommandUtil(engine, scope, config18, "getBaseCssClasses", 13);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[69]++;
  buffer += renderOutputUtil(id17, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70]++;
  buffer += '">\n\n    <input id="ks-combobox-input-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71]++;
  var id20 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 15);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72]++;
  buffer += renderOutputUtil(id20, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73]++;
  buffer += '"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74]++;
  var config21 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75]++;
  var params22 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76]++;
  var id23 = getPropertyUtil(engine, scope, "disabled", 0, 22);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77]++;
  params22.push(id23);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78]++;
  config21.params = params22;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79]++;
  config21.fn = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81]++;
  buffer += '\n    disabled\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84]++;
  buffer += runBlockCommandUtil(engine, scope, config21, "if", 22);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85]++;
  buffer += '\n\n    autocomplete="off"\n    class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86]++;
  var config25 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87]++;
  var params26 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88]++;
  params26.push('input');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89]++;
  config25.params = params26;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90]++;
  var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 27);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[91]++;
  buffer += renderOutputUtil(id24, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92]++;
  buffer += '"\n\n    value="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "value", 0, 29);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94]++;
  buffer += renderOutputUtil(id27, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95]++;
  buffer += '"\n    />\n\n\n    <label id="ks-combobox-placeholder-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96]++;
  var id28 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 33);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97]++;
  buffer += renderOutputUtil(id28, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98]++;
  buffer += '"\n           for="ks-combobox-input-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 34);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100]++;
  buffer += renderOutputUtil(id29, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101]++;
  buffer += '"\n            style=\'display:';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102]++;
  var config30 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103]++;
  var params31 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104]++;
  var id32 = getPropertyUtil(engine, scope, "value", 0, 35);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105]++;
  params31.push(id32);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106]++;
  config30.params = params31;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107]++;
  config30.fn = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109]++;
  buffer += 'none';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112]++;
  config30.inverse = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114]++;
  buffer += 'block';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[117]++;
  buffer += runBlockCommandUtil(engine, scope, config30, "if", 35);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118]++;
  buffer += ';\'\n    class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119]++;
  var config34 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120]++;
  var params35 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121]++;
  params35.push('placeholder');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[122]++;
  config34.params = params35;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123]++;
  var id33 = runInlineCommandUtil(engine, scope, config34, "getBaseCssClasses", 36);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124]++;
  buffer += renderOutputUtil(id33, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125]++;
  buffer += '">\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126]++;
  var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "placeholder", 0, 37);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127]++;
  buffer += renderOutputUtil(id36, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128]++;
  buffer += '\n    </label>\n</div>\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129]++;
  return buffer;
};
});
