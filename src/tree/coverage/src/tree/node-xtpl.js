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
if (! _$jscoverage['/tree/node-xtpl.js']) {
  _$jscoverage['/tree/node-xtpl.js'] = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].functionData) {
  _$jscoverage['/tree/node-xtpl.js'].functionData = [];
  _$jscoverage['/tree/node-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/tree/node-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/tree/node-xtpl.js'].branchData) {
  _$jscoverage['/tree/node-xtpl.js'].branchData = {};
  _$jscoverage['/tree/node-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['94'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['94'][1] = new BranchData();
}
_$jscoverage['/tree/node-xtpl.js'].branchData['94'][1].init(4346, 10, 'moduleWrap');
function visit28_94_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit27_9_2(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit26_9_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[0]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[1]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/tree/node-xtpl.js'].lineData[9]++;
  if (visit26_9_1(visit27_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/tree/node-xtpl.js'].lineData[17]++;
  buffer += '<div id="ks-tree-node-row-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[18]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
  _$jscoverage['/tree/node-xtpl.js'].lineData[19]++;
  buffer += renderOutputUtil(id0, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[20]++;
  buffer += '"\n     class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[21]++;
  var config2 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[22]++;
  var params3 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[23]++;
  params3.push('row');
  _$jscoverage['/tree/node-xtpl.js'].lineData[24]++;
  config2.params = params3;
  _$jscoverage['/tree/node-xtpl.js'].lineData[25]++;
  var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
  _$jscoverage['/tree/node-xtpl.js'].lineData[26]++;
  buffer += renderOutputUtil(id1, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[27]++;
  buffer += '\n     ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[28]++;
  var config4 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[29]++;
  var params5 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[30]++;
  var id6 = getPropertyUtil(engine, scope, "selected", 0, 3);
  _$jscoverage['/tree/node-xtpl.js'].lineData[31]++;
  params5.push(id6);
  _$jscoverage['/tree/node-xtpl.js'].lineData[32]++;
  config4.params = params5;
  _$jscoverage['/tree/node-xtpl.js'].lineData[33]++;
  config4.fn = function(scope) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[2]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[34]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[35]++;
  buffer += '\n        ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[36]++;
  var config8 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[37]++;
  var params9 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[38]++;
  params9.push('selected');
  _$jscoverage['/tree/node-xtpl.js'].lineData[39]++;
  config8.params = params9;
  _$jscoverage['/tree/node-xtpl.js'].lineData[40]++;
  var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 4);
  _$jscoverage['/tree/node-xtpl.js'].lineData[41]++;
  buffer += renderOutputUtil(id7, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[42]++;
  buffer += '\n     ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[43]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[45]++;
  buffer += runBlockCommandUtil(engine, scope, config4, "if", 3);
  _$jscoverage['/tree/node-xtpl.js'].lineData[46]++;
  buffer += '\n     ">\n    <div id="ks-tree-node-expand-icon-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[47]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
  _$jscoverage['/tree/node-xtpl.js'].lineData[48]++;
  buffer += renderOutputUtil(id10, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[49]++;
  buffer += '"\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[50]++;
  var config12 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[51]++;
  var params13 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[52]++;
  params13.push('expand-icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[53]++;
  config12.params = params13;
  _$jscoverage['/tree/node-xtpl.js'].lineData[54]++;
  var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 8);
  _$jscoverage['/tree/node-xtpl.js'].lineData[55]++;
  buffer += renderOutputUtil(id11, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[56]++;
  buffer += '">\n    </div>\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[57]++;
  var config14 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[58]++;
  var params15 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[59]++;
  var id16 = getPropertyUtil(engine, scope, "checkable", 0, 10);
  _$jscoverage['/tree/node-xtpl.js'].lineData[60]++;
  params15.push(id16);
  _$jscoverage['/tree/node-xtpl.js'].lineData[61]++;
  config14.params = params15;
  _$jscoverage['/tree/node-xtpl.js'].lineData[62]++;
  config14.fn = function(scope) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[3]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[63]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[64]++;
  buffer += '\n    <div id="ks-tree-node-checked-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[65]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 11);
  _$jscoverage['/tree/node-xtpl.js'].lineData[66]++;
  buffer += renderOutputUtil(id17, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[67]++;
  buffer += '"\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[68]++;
  var config19 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[69]++;
  var params20 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[70]++;
  var id21 = getPropertyUtil(engine, scope, "checkState", 0, 12);
  _$jscoverage['/tree/node-xtpl.js'].lineData[71]++;
  params20.push(('checked') + id21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[72]++;
  config19.params = params20;
  _$jscoverage['/tree/node-xtpl.js'].lineData[73]++;
  var id18 = runInlineCommandUtil(engine, scope, config19, "getBaseCssClasses", 12);
  _$jscoverage['/tree/node-xtpl.js'].lineData[74]++;
  buffer += renderOutputUtil(id18, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[75]++;
  buffer += '"></div>\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[76]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[78]++;
  buffer += runBlockCommandUtil(engine, scope, config14, "if", 10);
  _$jscoverage['/tree/node-xtpl.js'].lineData[79]++;
  buffer += '\n    <div id="ks-tree-node-icon-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[80]++;
  var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 14);
  _$jscoverage['/tree/node-xtpl.js'].lineData[81]++;
  buffer += renderOutputUtil(id22, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[82]++;
  buffer += '"\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[83]++;
  var config24 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[84]++;
  var params25 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[85]++;
  params25.push('icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[86]++;
  config24.params = params25;
  _$jscoverage['/tree/node-xtpl.js'].lineData[87]++;
  var id23 = runInlineCommandUtil(engine, scope, config24, "getBaseCssClasses", 15);
  _$jscoverage['/tree/node-xtpl.js'].lineData[88]++;
  buffer += renderOutputUtil(id23, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[89]++;
  buffer += '">\n\n    </div>\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[90]++;
  var config27 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[91]++;
  var params28 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[92]++;
  params28.push('component/extension/content-xtpl');
  _$jscoverage['/tree/node-xtpl.js'].lineData[93]++;
  config27.params = params28;
  _$jscoverage['/tree/node-xtpl.js'].lineData[94]++;
  if (visit28_94_1(moduleWrap)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[95]++;
    require("component/extension/content-xtpl");
    _$jscoverage['/tree/node-xtpl.js'].lineData[96]++;
    config27.params[0] = moduleWrap.resolveByName(config27.params[0]);
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[98]++;
  var id26 = runInlineCommandUtil(engine, scope, config27, "include", 18);
  _$jscoverage['/tree/node-xtpl.js'].lineData[99]++;
  buffer += renderOutputUtil(id26, false);
  _$jscoverage['/tree/node-xtpl.js'].lineData[100]++;
  buffer += '\n</div>\n<div id="ks-tree-node-children-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[101]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 20);
  _$jscoverage['/tree/node-xtpl.js'].lineData[102]++;
  buffer += renderOutputUtil(id29, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[103]++;
  buffer += '"\n     class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[104]++;
  var config31 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[105]++;
  var params32 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[106]++;
  params32.push('children');
  _$jscoverage['/tree/node-xtpl.js'].lineData[107]++;
  config31.params = params32;
  _$jscoverage['/tree/node-xtpl.js'].lineData[108]++;
  var id30 = runInlineCommandUtil(engine, scope, config31, "getBaseCssClasses", 21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[109]++;
  buffer += renderOutputUtil(id30, true);
  _$jscoverage['/tree/node-xtpl.js'].lineData[110]++;
  buffer += '"\n';
  _$jscoverage['/tree/node-xtpl.js'].lineData[111]++;
  var config33 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[112]++;
  var params34 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[113]++;
  var id35 = getPropertyUtil(engine, scope, "expanded", 0, 22);
  _$jscoverage['/tree/node-xtpl.js'].lineData[114]++;
  params34.push(id35);
  _$jscoverage['/tree/node-xtpl.js'].lineData[115]++;
  config33.params = params34;
  _$jscoverage['/tree/node-xtpl.js'].lineData[116]++;
  config33.fn = function(scope) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[4]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[117]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[118]++;
  buffer += '\nstyle="display:none"\n';
  _$jscoverage['/tree/node-xtpl.js'].lineData[119]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[121]++;
  var inverse36 = config33.fn;
  _$jscoverage['/tree/node-xtpl.js'].lineData[122]++;
  config33.fn = config33.inverse;
  _$jscoverage['/tree/node-xtpl.js'].lineData[123]++;
  config33.inverse = inverse36;
  _$jscoverage['/tree/node-xtpl.js'].lineData[124]++;
  buffer += runBlockCommandUtil(engine, scope, config33, "if", 22);
  _$jscoverage['/tree/node-xtpl.js'].lineData[125]++;
  buffer += '\n>\n</div>';
  _$jscoverage['/tree/node-xtpl.js'].lineData[126]++;
  return buffer;
};
});
