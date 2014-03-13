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
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js']) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'] = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'][2] = new BranchData();
}
_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit23_10_2(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit22_10_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[10]++;
  if (visit22_10_1(visit23_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[24]++;
  buffer += '<div id="ks-scrollbar-arrow-up-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27]++;
  buffer += '"\n        class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28]++;
  var option2 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29]++;
  var params3 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30]++;
  var id4 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31]++;
  params3.push(id4 + ('-arrow-up'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32]++;
  option2.params = params3;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33]++;
  var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34]++;
  buffer += escapeHtml(id1);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35]++;
  buffer += '">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36]++;
  var id5 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37]++;
  buffer += escapeHtml(id5);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38]++;
  buffer += '"\n        class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39]++;
  var option7 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[40]++;
  var params8 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41]++;
  var id9 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42]++;
  params8.push(id9 + ('-arrow-down'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43]++;
  option7.params = params8;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44]++;
  var id6 = callCommandUtil(engine, scope, option7, "getBaseCssClasses", 6);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45]++;
  buffer += escapeHtml(id6);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46]++;
  buffer += '">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47]++;
  var id10 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48]++;
  buffer += escapeHtml(id10);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49]++;
  buffer += '"\n     class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50]++;
  var option12 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51]++;
  var params13 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[52]++;
  var id14 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53]++;
  params13.push(id14 + ('-track'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54]++;
  option12.params = params13;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55]++;
  var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 10);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[56]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[57]++;
  buffer += '">\n<div id="ks-scrollbar-drag-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58]++;
  var id15 = scope.resolve(["id"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59]++;
  buffer += escapeHtml(id15);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60]++;
  buffer += '"\n     class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61]++;
  var option17 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62]++;
  var params18 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63]++;
  var id19 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64]++;
  params18.push(id19 + ('-drag'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65]++;
  option17.params = params18;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66]++;
  var id16 = callCommandUtil(engine, scope, option17, "getBaseCssClasses", 12);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67]++;
  buffer += escapeHtml(id16);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[68]++;
  buffer += '">\n<div class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[69]++;
  var option21 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70]++;
  var params22 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71]++;
  var id23 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72]++;
  params22.push(id23 + ('-drag-top'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[73]++;
  option21.params = params22;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74]++;
  var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 13);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75]++;
  buffer += escapeHtml(id20);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76]++;
  buffer += '">\n</div>\n<div class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77]++;
  var option25 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78]++;
  var params26 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79]++;
  var id27 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80]++;
  params26.push(id27 + ('-drag-center'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81]++;
  option25.params = params26;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82]++;
  var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 15);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83]++;
  buffer += escapeHtml(id24);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[84]++;
  buffer += '">\n</div>\n<div class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85]++;
  var option29 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[86]++;
  var params30 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[87]++;
  var id31 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[88]++;
  params30.push(id31 + ('-drag-bottom'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[89]++;
  option29.params = params30;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[90]++;
  var id28 = callCommandUtil(engine, scope, option29, "getBaseCssClasses", 17);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[91]++;
  buffer += escapeHtml(id28);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92]++;
  buffer += '">\n</div>\n</div>\n</div>';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93]++;
  return buffer;
};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96]++;
  return t;
});
