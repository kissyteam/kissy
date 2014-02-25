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
if (! _$jscoverage['/picker/month-panel/months-xtpl.js']) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'] = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[91] = 0;
}
if (! _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['55'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['55'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['55'][1].init(848, 13, 'id13 === id14');
function visit29_55_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit28_10_2(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit27_10_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[10]++;
  if (visit27_10_1(visit28_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[23]++;
  buffer += '';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[24]++;
  var option0 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[25]++;
  var params1 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[26]++;
  var id2 = scope.resolve(["months"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[27]++;
  params1.push(id2);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[29]++;
  option0.fn = function(scope) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[30]++;
  var buffer = "";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[31]++;
  buffer += '\n<tr role="row">\n    ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[32]++;
  var option3 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[33]++;
  var params4 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[34]++;
  var id6 = scope.resolve(["xindex"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[35]++;
  var id5 = scope.resolve("months." + id6 + "");
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[36]++;
  params4.push(id5);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[37]++;
  option3.params = params4;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[38]++;
  option3.fn = function(scope) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[39]++;
  var buffer = "";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[40]++;
  buffer += '\n    <td role="gridcell"\n        title="';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[41]++;
  var id7 = scope.resolve(["title"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[42]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[43]++;
  buffer += '"\n        class="';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[44]++;
  var option9 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[45]++;
  var params10 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[46]++;
  params10.push('cell');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[47]++;
  option9.params = params10;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[48]++;
  var id8 = callCommandUtil(engine, scope, option9, "getBaseCssClasses", 6);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[49]++;
  buffer += escapeHtml(id8);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[50]++;
  buffer += '\n        ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[51]++;
  var option11 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[52]++;
  var params12 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[53]++;
  var id13 = scope.resolve(["month"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[54]++;
  var id14 = scope.resolve(["value"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[55]++;
  params12.push(visit29_55_1(id13 === id14));
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[56]++;
  option11.params = params12;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[57]++;
  option11.fn = function(scope) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[58]++;
  var buffer = "";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[59]++;
  buffer += '\n        ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[60]++;
  var option16 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[61]++;
  var params17 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[62]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[63]++;
  option16.params = params17;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[64]++;
  var id15 = callCommandUtil(engine, scope, option16, "getBaseCssClasses", 8);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[65]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[66]++;
  buffer += '\n        ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[67]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[69]++;
  buffer += ifCommand.call(engine, scope, option11, payload);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[70]++;
  buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[71]++;
  var option19 = {};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[72]++;
  var params20 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[73]++;
  params20.push('month');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[74]++;
  option19.params = params20;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[75]++;
  var id18 = callCommandUtil(engine, scope, option19, "getBaseCssClasses", 13);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[76]++;
  buffer += escapeHtml(id18);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[77]++;
  buffer += '">\n            ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[78]++;
  var id21 = scope.resolve(["content"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[79]++;
  buffer += escapeHtml(id21);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[80]++;
  buffer += '\n        </a>\n    </td>\n    ';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[81]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[83]++;
  buffer += eachCommand.call(engine, scope, option3, payload);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[84]++;
  buffer += '\n</tr>\n';
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[85]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[87]++;
  buffer += eachCommand.call(engine, scope, option0, payload);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[88]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[90]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/date/picker/src/picker/month-panel/months.xtpl.html";
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[91]++;
  return t;
});
