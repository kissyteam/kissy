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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[16] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[62] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['47'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['87'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['87'][1].init(3356, 11, 'id27 > id28');
function visit74_87_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'][1].init(2200, 11, 'id20 < id21');
function visit73_67_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['47'][1].init(1045, 13, 'id13 === id14');
function visit72_47_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit71_9_2(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit70_9_1(result) {
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
  if (visit70_9_1(visit71_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, getExpressionUtil = utils.getExpression, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[15]++;
  buffer += '';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[16]++;
  var config0 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[17]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[18]++;
  var id2 = getPropertyOrRunCommandUtil(engine, scope, {}, "years", 0, 1, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[19]++;
  params1.push(id2);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20]++;
  config0.params = params1;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21]++;
  config0.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[22]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[23]++;
  buffer += '\n<tr role="row">\n    ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24]++;
  var config3 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[25]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[26]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 3, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27]++;
  var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "years." + id6 + "", 0, 3, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28]++;
  params4.push(id5);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29]++;
  config3.params = params4;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30]++;
  config3.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[31]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[32]++;
  buffer += '\n    <td role="gridcell"\n        title="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 5, undefined, false);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[34]++;
  buffer += getExpressionUtil(id7, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[35]++;
  buffer += '"\n        class="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36]++;
  var config9 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37]++;
  var params10 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38]++;
  params10.push('cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39]++;
  config9.params = params10;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40]++;
  var id8 = getPropertyOrRunCommandUtil(engine, scope, config9, "getBaseCssClasses", 0, 6, true, undefined);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41]++;
  buffer += id8;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43]++;
  var config11 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[44]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[45]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 7, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "year", 0, 7, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[47]++;
  params12.push(visit72_47_1(id13 === id14));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[48]++;
  config11.params = params12;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49]++;
  config11.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52]++;
  var config16 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[54]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55]++;
  config16.params = params17;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scope, config16, "getBaseCssClasses", 0, 8, true, undefined);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[57]++;
  buffer += id15;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[58]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[59]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61]++;
  buffer += runBlockCommandUtil(engine, scope, config11, "if", 7);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[62]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63]++;
  var config18 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64]++;
  var params19 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65]++;
  var id20 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 10, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66]++;
  var id21 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 10, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67]++;
  params19.push(visit73_67_1(id20 < id21));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68]++;
  config18.params = params19;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69]++;
  config18.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[70]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[71]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72]++;
  var config23 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[73]++;
  var params24 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[74]++;
  params24.push('last-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75]++;
  config23.params = params24;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76]++;
  var id22 = getPropertyOrRunCommandUtil(engine, scope, config23, "getBaseCssClasses", 0, 11, true, undefined);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77]++;
  buffer += id22;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81]++;
  buffer += runBlockCommandUtil(engine, scope, config18, "if", 10);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83]++;
  var config25 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84]++;
  var params26 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 13, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86]++;
  var id28 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 13, undefined, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87]++;
  params26.push(visit74_87_1(id27 > id28));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[88]++;
  config25.params = params26;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[89]++;
  config25.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[91]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[92]++;
  var config30 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93]++;
  var params31 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94]++;
  params31.push('next-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95]++;
  config30.params = params31;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scope, config30, "getBaseCssClasses", 0, 14, true, undefined);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97]++;
  buffer += id29;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101]++;
  buffer += runBlockCommandUtil(engine, scope, config25, "if", 13);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102]++;
  buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103]++;
  var config33 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104]++;
  var params34 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105]++;
  params34.push('year');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106]++;
  config33.params = params34;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107]++;
  var id32 = getPropertyOrRunCommandUtil(engine, scope, config33, "getBaseCssClasses", 0, 19, true, undefined);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108]++;
  buffer += id32;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109]++;
  buffer += '">\n            ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110]++;
  var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 20, undefined, false);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111]++;
  buffer += getExpressionUtil(id35, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112]++;
  buffer += '\n        </a>\n    </td>\n    ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115]++;
  buffer += runBlockCommandUtil(engine, scope, config3, "each", 3);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116]++;
  buffer += '\n</tr>\n';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119]++;
  buffer += runBlockCommandUtil(engine, scope, config0, "each", 1);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120]++;
  return buffer;
};
});
