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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[13] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[131] = 0;
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
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['55'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['75'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['95'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['95'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['95'][1].init(2889, 11, 'id27 > id28');
function visit77_95_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['75'][1].init(1869, 11, 'id20 < id21');
function visit76_75_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['55'][1].init(849, 13, 'id13 === id14');
function visit75_55_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit74_10_2(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit73_10_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[10]++;
  if (visit73_10_1(visit74_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[23]++;
  buffer += '';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24]++;
  var option0 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[25]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[26]++;
  var id2 = scope.resolve(["years"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27]++;
  params1.push(id2);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29]++;
  option0.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[31]++;
  buffer += '\n<tr role="row">\n    ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[32]++;
  var option3 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[34]++;
  var id6 = scope.resolve(["xindex"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[35]++;
  var id5 = scope.resolve("years." + id6 + "");
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36]++;
  params4.push(id5);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37]++;
  option3.params = params4;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38]++;
  option3.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40]++;
  buffer += '\n    <td role="gridcell"\n        title="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41]++;
  var id7 = scope.resolve(["title"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43]++;
  buffer += '"\n        class="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[44]++;
  var option9 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[45]++;
  var params10 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46]++;
  params10.push('cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[47]++;
  option9.params = params10;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[48]++;
  var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 6);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49]++;
  buffer += escapeHtml(id8);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51]++;
  var option11 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53]++;
  var id13 = scope.resolve(["content"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[54]++;
  var id14 = scope.resolve(["year"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55]++;
  params12.push(visit75_55_1(id13 === id14));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56]++;
  option11.params = params12;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[57]++;
  option11.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[58]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[59]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60]++;
  var option16 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[62]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64]++;
  var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 8);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69]++;
  buffer += ifCommand.call(engine, scope, option11, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[70]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[71]++;
  var option18 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72]++;
  var params19 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[73]++;
  var id20 = scope.resolve(["content"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[74]++;
  var id21 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75]++;
  params19.push(visit76_75_1(id20 < id21));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76]++;
  option18.params = params19;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77]++;
  option18.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[80]++;
  var option23 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81]++;
  var params24 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82]++;
  params24.push('last-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83]++;
  option23.params = params24;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84]++;
  var id22 = callCommandUtil(engine, scope, option23, "getBaseCssClasses", 11);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85]++;
  buffer += escapeHtml(id22);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[89]++;
  buffer += ifCommand.call(engine, scope, option18, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[91]++;
  var option25 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[92]++;
  var params26 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93]++;
  var id27 = scope.resolve(["content"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94]++;
  var id28 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95]++;
  params26.push(visit77_95_1(id27 > id28));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96]++;
  option25.params = params26;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97]++;
  option25.fn = function(scope) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98]++;
  var buffer = "";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99]++;
  buffer += '\n         ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[100]++;
  var option30 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101]++;
  var params31 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102]++;
  params31.push('next-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103]++;
  option30.params = params31;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104]++;
  var id29 = callCommandUtil(engine, scope, option30, "getBaseCssClasses", 14);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105]++;
  buffer += escapeHtml(id29);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106]++;
  buffer += '\n        ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109]++;
  buffer += ifCommand.call(engine, scope, option25, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110]++;
  buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111]++;
  var option33 = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112]++;
  var params34 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113]++;
  params34.push('year');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[114]++;
  option33.params = params34;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115]++;
  var id32 = callCommandUtil(engine, scope, option33, "getBaseCssClasses", 20);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116]++;
  buffer += escapeHtml(id32);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117]++;
  buffer += '">\n            ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[118]++;
  var id35 = scope.resolve(["content"]);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119]++;
  buffer += escapeHtml(id35);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120]++;
  buffer += '\n        </a>\n    </td>\n    ';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[121]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[123]++;
  buffer += eachCommand.call(engine, scope, option3, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[124]++;
  buffer += '\n</tr>\n';
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[125]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[127]++;
  buffer += eachCommand.call(engine, scope, option0, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[128]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[130]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/picker/src/picker/year-panel/years.xtpl.html";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[131]++;
  return t;
});
