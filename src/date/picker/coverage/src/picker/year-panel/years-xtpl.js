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
if (! _$jscoverage['/picker/year-panel/years-xtpl.js']) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[122] = 0;
}
if (! _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['69'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['89'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['89'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['89'][1].init(3130, 11, 'id27 > id28');
function visit71_89_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['69'][1].init(2043, 11, 'id20 < id21');
function visit70_69_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['49'][1].init(957, 13, 'id13 === id14');
function visit69_49_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit68_9_2(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit67_9_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[9]++;
  if (visit67_9_1(visit68_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[17]++;
  buffer += '';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[18]++;
  var config0 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[19]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20]++;
  var id2 = getPropertyUtil(engine, scope, "years", 0, 1);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21]++;
  params1.push(id2);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[22]++;
  config0.params = params1;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[23]++;
  config0.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[25]++;
  buffer += '\n<tr role="row">\n    ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[26]++;
  var config3 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28]++;
  var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29]++;
  var id5 = getPropertyUtil(engine, scope, "years." + id6 + "", 0, 3);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30]++;
  params4.push(id5);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[31]++;
  config3.params = params4;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[32]++;
  config3.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[34]++;
  buffer += '\n    <td role="gridcell"\n        title="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[35]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 5);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36]++;
  buffer += renderOutputUtil(id7, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37]++;
  buffer += '"\n        class="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38]++;
  var config9 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39]++;
  var params10 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40]++;
  params10.push('cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41]++;
  config9.params = params10;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42]++;
  var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 6);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43]++;
  buffer += renderOutputUtil(id8, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[44]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[45]++;
  var config11 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[47]++;
  var id13 = getPropertyUtil(engine, scope, "content", 0, 7);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[48]++;
  var id14 = getPropertyUtil(engine, scope, "year", 0, 7);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49]++;
  params12.push(visit69_49_1(id13 === id14));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50]++;
  config11.params = params12;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51]++;
  config11.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[54]++;
  var config16 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[57]++;
  config16.params = params17;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[58]++;
  var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 8);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[59]++;
  buffer += renderOutputUtil(id15, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63]++;
  buffer += runBlockCommandUtil(engine, scope, config11, "if", 7);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65]++;
  var config18 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66]++;
  var params19 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67]++;
  var id20 = getPropertyUtil(engine, scope, "content", 0, 10);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68]++;
  var id21 = getPropertyUtil(engine, scope, "startYear", 0, 10);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69]++;
  params19.push(visit70_69_1(id20 < id21));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[70]++;
  config18.params = params19;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[71]++;
  config18.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[73]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[74]++;
  var config23 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75]++;
  var params24 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76]++;
  params24.push('last-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77]++;
  config23.params = params24;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78]++;
  var id22 = runInlineCommandUtil(engine, scope, config23, "getBaseCssClasses", 11);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79]++;
  buffer += renderOutputUtil(id22, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[80]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83]++;
  buffer += runBlockCommandUtil(engine, scope, config18, "if", 10);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85]++;
  var config25 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86]++;
  var params26 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87]++;
  var id27 = getPropertyUtil(engine, scope, "content", 0, 13);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[88]++;
  var id28 = getPropertyUtil(engine, scope, "endYear", 0, 13);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[89]++;
  params26.push(visit71_89_1(id27 > id28));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90]++;
  config25.params = params26;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[91]++;
  config25.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[92]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94]++;
  var config30 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95]++;
  var params31 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96]++;
  params31.push('next-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97]++;
  config30.params = params31;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98]++;
  var id29 = runInlineCommandUtil(engine, scope, config30, "getBaseCssClasses", 14);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99]++;
  buffer += renderOutputUtil(id29, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[100]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103]++;
  buffer += runBlockCommandUtil(engine, scope, config25, "if", 13);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104]++;
  buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105]++;
  var config33 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106]++;
  var params34 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107]++;
  params34.push('year');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108]++;
  config33.params = params34;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109]++;
  var id32 = runInlineCommandUtil(engine, scope, config33, "getBaseCssClasses", 20);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110]++;
  buffer += renderOutputUtil(id32, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111]++;
  buffer += '">\n            ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112]++;
  var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 21);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113]++;
  buffer += renderOutputUtil(id35, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[114]++;
  buffer += '\n        </a>\n    </td>\n    ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117]++;
  buffer += runBlockCommandUtil(engine, scope, config3, "each", 3);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[118]++;
  buffer += '\n</tr>\n';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[121]++;
  buffer += runBlockCommandUtil(engine, scope, config0, "each", 1);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[122]++;
  return buffer;
};
});
