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
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js']) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'] = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[116] = 0;
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'][2] = new BranchData();
}
_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'][2].init(5248, 10, 'id30 === 0');
function visit26_109_2(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'][1].init(5240, 18, 'id30 || id30 === 0');
function visit25_109_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'][1].init(4971, 10, 'moduleWrap');
function visit24_104_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit23_10_2(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit22_10_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[10]++;
  if (visit22_10_1(visit23_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[23]++;
  buffer += '<div class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[24]++;
  var option1 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[25]++;
  var params2 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26]++;
  params2.push('header');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[27]++;
  option1.params = params2;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[28]++;
  var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30]++;
  buffer += '">\n    <a id="ks-date-picker-month-panel-previous-year-btn-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32]++;
  buffer += escapeHtml(id3);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[33]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34]++;
  var option5 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35]++;
  var params6 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[36]++;
  params6.push('prev-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[37]++;
  option5.params = params6;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[38]++;
  var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39]++;
  buffer += escapeHtml(id4);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41]++;
  var id7 = scope.resolve(["previousYearLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[43]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n\n\n        <a class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[44]++;
  var option9 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45]++;
  var params10 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[46]++;
  params10.push('year-select');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47]++;
  option9.params = params10;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48]++;
  var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 11);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49]++;
  buffer += escapeHtml(id8);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50]++;
  buffer += '"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51]++;
  var id11 = scope.resolve(["yearSelectLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[52]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[53]++;
  buffer += '"\n           id="ks-date-picker-month-panel-year-select-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[54]++;
  var id12 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55]++;
  buffer += escapeHtml(id12);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56]++;
  buffer += '">\n            <span id="ks-date-picker-month-panel-year-select-content-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57]++;
  var id13 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58]++;
  buffer += escapeHtml(id13);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[59]++;
  buffer += '">';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[60]++;
  var id14 = scope.resolve(["year"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61]++;
  buffer += escapeHtml(id14);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[62]++;
  buffer += '</span>\n            <span class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63]++;
  var option16 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64]++;
  var params17 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65]++;
  params17.push('year-select-arrow');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66]++;
  option16.params = params17;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67]++;
  var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 18);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[68]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[69]++;
  buffer += '">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[70]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71]++;
  buffer += escapeHtml(id18);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73]++;
  var option20 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74]++;
  var params21 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75]++;
  params21.push('next-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76]++;
  option20.params = params21;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77]++;
  var id19 = callCommandUtil(engine, scope, option20, "getBaseCssClasses", 22);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[78]++;
  buffer += escapeHtml(id19);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80]++;
  var id22 = scope.resolve(["nextYearLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81]++;
  buffer += escapeHtml(id22);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83]++;
  var option24 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[84]++;
  var params25 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[85]++;
  params25.push('body');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[86]++;
  option24.params = params25;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87]++;
  var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 29);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88]++;
  buffer += escapeHtml(id23);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89]++;
  buffer += '">\n    <table class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90]++;
  var option27 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91]++;
  var params28 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92]++;
  params28.push('table');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[93]++;
  option27.params = params28;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[94]++;
  var id26 = callCommandUtil(engine, scope, option27, "getBaseCssClasses", 30);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95]++;
  buffer += escapeHtml(id26);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96]++;
  buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97]++;
  var id29 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[98]++;
  buffer += escapeHtml(id29);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[99]++;
  buffer += '">\n        ';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[100]++;
  var option31 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[101]++;
  var params32 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102]++;
  params32.push('date/picker/month-panel/months-xtpl');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103]++;
  option31.params = params32;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[104]++;
  if (visit24_104_1(moduleWrap)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[105]++;
    require("date/picker/month-panel/months-xtpl");
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[106]++;
    option31.params[0] = moduleWrap.resolveByName(option31.params[0]);
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[108]++;
  var id30 = includeCommand.call(engine, scope, option31, payload);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[109]++;
  if (visit25_109_1(id30 || visit26_109_2(id30 === 0))) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[110]++;
    buffer += id30;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[112]++;
  buffer += '\n        </tbody>\n    </table>\n</div>';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[113]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[115]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/picker/src/picker/month-panel/month-panel.xtpl.html";
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[116]++;
  return t;
});
