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
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[13] = 0;
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
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66] = 0;
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
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88] = 0;
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
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138] = 0;
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
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'][2] = new BranchData();
}
_$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit2_10_2(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit1_10_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[10]++;
  if (visit1_10_1(visit2_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23]++;
  buffer += '<div id="ks-combobox-invalid-el-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26]++;
  buffer += '"\n     class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27]++;
  var option2 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28]++;
  var params3 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29]++;
  params3.push('invalid-el');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30]++;
  option2.params = params3;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31]++;
  var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32]++;
  buffer += escapeHtml(id1);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34]++;
  var option5 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35]++;
  var params6 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36]++;
  params6.push('invalid-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37]++;
  option5.params = params6;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38]++;
  var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39]++;
  buffer += escapeHtml(id4);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40]++;
  buffer += '"></div>\n</div>\n\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41]++;
  var option7 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42]++;
  var params8 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43]++;
  var id9 = scope.resolve(["hasTrigger"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44]++;
  params8.push(id9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45]++;
  option7.params = params8;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46]++;
  option7.fn = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48]++;
  buffer += '\n<div id="ks-combobox-trigger-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49]++;
  var id10 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50]++;
  buffer += escapeHtml(id10);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51]++;
  buffer += '"\n     class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52]++;
  var option12 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53]++;
  var params13 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54]++;
  params13.push('trigger');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55]++;
  option12.params = params13;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56]++;
  var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 8);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58]++;
  buffer += '">\n    <div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59]++;
  var option15 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60]++;
  var params16 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61]++;
  params16.push('trigger-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62]++;
  option15.params = params16;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63]++;
  var id14 = callCommandUtil(engine, scope, option15, "getBaseCssClasses", 9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64]++;
  buffer += escapeHtml(id14);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65]++;
  buffer += '">&#x25BC;</div>\n</div>\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68]++;
  buffer += ifCommand.call(engine, scope, option7, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[69]++;
  buffer += '\n\n<div class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70]++;
  var option18 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71]++;
  var params19 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72]++;
  params19.push('input-wrap');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73]++;
  option18.params = params19;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74]++;
  var id17 = callCommandUtil(engine, scope, option18, "getBaseCssClasses", 13);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75]++;
  buffer += escapeHtml(id17);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76]++;
  buffer += '">\n\n    <input id="ks-combobox-input-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77]++;
  var id20 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78]++;
  buffer += escapeHtml(id20);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79]++;
  buffer += '"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80]++;
  var option21 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81]++;
  var params22 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82]++;
  var id23 = scope.resolve(["disabled"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[83]++;
  params22.push(id23);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84]++;
  option21.params = params22;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85]++;
  option21.fn = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87]++;
  buffer += '\n    disabled\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90]++;
  buffer += ifCommand.call(engine, scope, option21, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[91]++;
  buffer += '\n\n    autocomplete="off"\n    class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92]++;
  var option25 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93]++;
  var params26 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94]++;
  params26.push('input');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95]++;
  option25.params = params26;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96]++;
  var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 27);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97]++;
  buffer += escapeHtml(id24);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98]++;
  buffer += '"\n\n    value="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99]++;
  var id27 = scope.resolve(["value"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100]++;
  buffer += escapeHtml(id27);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101]++;
  buffer += '"\n    />\n\n\n    <label id="ks-combobox-placeholder-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102]++;
  var id28 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103]++;
  buffer += escapeHtml(id28);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104]++;
  buffer += '"\n           for="ks-combobox-input-';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105]++;
  var id29 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106]++;
  buffer += escapeHtml(id29);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107]++;
  buffer += '"\n            style=\'display:';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108]++;
  var option30 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109]++;
  var params31 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110]++;
  var id32 = scope.resolve(["value"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111]++;
  params31.push(id32);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112]++;
  option30.params = params31;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113]++;
  option30.fn = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115]++;
  buffer += 'none';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[116]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118]++;
  option30.inverse = function(scope) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119]++;
  var buffer = "";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120]++;
  buffer += 'block';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123]++;
  buffer += ifCommand.call(engine, scope, option30, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124]++;
  buffer += ';\'\n    class="';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125]++;
  var option34 = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126]++;
  var params35 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127]++;
  params35.push('placeholder');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128]++;
  option34.params = params35;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129]++;
  var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 36);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130]++;
  buffer += escapeHtml(id33);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[131]++;
  buffer += '">\n    ';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[132]++;
  var id36 = scope.resolve(["placeholder"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133]++;
  buffer += escapeHtml(id36);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134]++;
  buffer += '\n    </label>\n</div>\n';
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/combobox/src/combobox/combobox.xtpl.html";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138]++;
  return t;
});
