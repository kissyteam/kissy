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
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js']) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'][2] = new BranchData();
}
_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'][2].init(5382, 10, 'id31 === 0');
function visit72_112_2(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'][1].init(5374, 18, 'id31 || id31 === 0');
function visit71_112_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'][1].init(5107, 10, 'moduleWrap');
function visit70_107_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit69_10_2(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit68_10_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[10]++;
  if (visit68_10_1(visit69_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23]++;
  buffer += '<div class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24]++;
  var option1 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[25]++;
  var params2 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26]++;
  params2.push('header');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27]++;
  option1.params = params2;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28]++;
  var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30]++;
  buffer += '">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32]++;
  buffer += escapeHtml(id3);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34]++;
  var option5 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35]++;
  var params6 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36]++;
  params6.push('prev-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37]++;
  option5.params = params6;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38]++;
  var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39]++;
  buffer += escapeHtml(id4);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41]++;
  var id7 = scope.resolve(["previousDecadeLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n\n    <a class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44]++;
  var option9 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45]++;
  var params10 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46]++;
  params10.push('decade-select');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47]++;
  option9.params = params10;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48]++;
  var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 10);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49]++;
  buffer += escapeHtml(id8);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50]++;
  buffer += '"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51]++;
  var id11 = scope.resolve(["decadeSelectLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53]++;
  buffer += '"\n       id="ks-date-picker-year-panel-decade-select-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54]++;
  var id12 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55]++;
  buffer += escapeHtml(id12);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[56]++;
  buffer += '">\n            <span id="ks-date-picker-year-panel-decade-select-content-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[57]++;
  var id13 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58]++;
  buffer += escapeHtml(id13);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59]++;
  buffer += '">\n                ';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60]++;
  var id14 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61]++;
  buffer += escapeHtml(id14);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62]++;
  buffer += '-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63]++;
  var id15 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65]++;
  buffer += '\n            </span>\n        <span class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66]++;
  var option17 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67]++;
  var params18 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68]++;
  params18.push('decade-select-arrow');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69]++;
  option17.params = params18;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70]++;
  var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 19);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71]++;
  buffer += escapeHtml(id16);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72]++;
  buffer += '">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73]++;
  var id19 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74]++;
  buffer += escapeHtml(id19);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76]++;
  var option21 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77]++;
  var params22 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78]++;
  params22.push('next-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79]++;
  option21.params = params22;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80]++;
  var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 23);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81]++;
  buffer += escapeHtml(id20);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83]++;
  var id23 = scope.resolve(["nextDecadeLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84]++;
  buffer += escapeHtml(id23);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86]++;
  var option25 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87]++;
  var params26 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88]++;
  params26.push('body');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89]++;
  option25.params = params26;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90]++;
  var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 30);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91]++;
  buffer += escapeHtml(id24);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92]++;
  buffer += '">\n    <table class="';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93]++;
  var option28 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94]++;
  var params29 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95]++;
  params29.push('table');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96]++;
  option28.params = params29;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97]++;
  var id27 = callCommandUtil(engine, scope, option28, "getBaseCssClasses", 31);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98]++;
  buffer += escapeHtml(id27);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99]++;
  buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100]++;
  var id30 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101]++;
  buffer += escapeHtml(id30);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102]++;
  buffer += '">\n        ';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103]++;
  var option32 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105]++;
  params33.push('date/picker/year-panel/years-xtpl');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106]++;
  option32.params = params33;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107]++;
  if (visit70_107_1(moduleWrap)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108]++;
    require("date/picker/year-panel/years-xtpl");
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109]++;
    option32.params[0] = moduleWrap.resolveByName(option32.params[0]);
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111]++;
  var id31 = includeCommand.call(engine, scope, option32, payload);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112]++;
  if (visit71_112_1(id31 || visit72_112_2(id31 === 0))) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113]++;
    buffer += id31;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115]++;
  buffer += '\n        </tbody>\n    </table>\n</div>';
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/picker/src/picker/year-panel/year-panel.xtpl.html";
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119]++;
  return t;
});
