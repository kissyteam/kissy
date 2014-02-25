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
  _$jscoverage['/tree/node-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[13] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[49] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[82] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[106] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/tree/node-xtpl.js'].lineData[135] = 0;
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
  _$jscoverage['/tree/node-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['100'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['105'] = [];
  _$jscoverage['/tree/node-xtpl.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/tree/node-xtpl.js'].branchData['105'][2] = new BranchData();
}
_$jscoverage['/tree/node-xtpl.js'].branchData['105'][2].init(4541, 10, 'id26 === 0');
function visit30_105_2(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['105'][1].init(4533, 18, 'id26 || id26 === 0');
function visit29_105_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['100'][1].init(4267, 10, 'moduleWrap');
function visit28_100_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit27_10_2(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit26_10_1(result) {
  _$jscoverage['/tree/node-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[0]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[1]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/tree/node-xtpl.js'].lineData[10]++;
  if (visit26_10_1(visit27_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/tree/node-xtpl.js'].lineData[23]++;
  buffer += '<div id="ks-tree-node-row-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[24]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[25]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/tree/node-xtpl.js'].lineData[26]++;
  buffer += '"\n     class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[27]++;
  var option2 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[28]++;
  var params3 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[29]++;
  params3.push('row');
  _$jscoverage['/tree/node-xtpl.js'].lineData[30]++;
  option2.params = params3;
  _$jscoverage['/tree/node-xtpl.js'].lineData[31]++;
  var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
  _$jscoverage['/tree/node-xtpl.js'].lineData[32]++;
  buffer += escapeHtml(id1);
  _$jscoverage['/tree/node-xtpl.js'].lineData[33]++;
  buffer += '\n     ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[34]++;
  var option4 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[35]++;
  var params5 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[36]++;
  var id6 = scope.resolve(["selected"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[37]++;
  params5.push(id6);
  _$jscoverage['/tree/node-xtpl.js'].lineData[38]++;
  option4.params = params5;
  _$jscoverage['/tree/node-xtpl.js'].lineData[39]++;
  option4.fn = function(scope) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[2]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[40]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[41]++;
  buffer += '\n        ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[42]++;
  var option8 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[43]++;
  var params9 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[44]++;
  params9.push('selected');
  _$jscoverage['/tree/node-xtpl.js'].lineData[45]++;
  option8.params = params9;
  _$jscoverage['/tree/node-xtpl.js'].lineData[46]++;
  var id7 = callCommandUtil(engine, scope, option8, "getBaseCssClasses", 4);
  _$jscoverage['/tree/node-xtpl.js'].lineData[47]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/tree/node-xtpl.js'].lineData[48]++;
  buffer += '\n     ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[49]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[51]++;
  buffer += ifCommand.call(engine, scope, option4, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[52]++;
  buffer += '\n     ">\n    <div id="ks-tree-node-expand-icon-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[53]++;
  var id10 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[54]++;
  buffer += escapeHtml(id10);
  _$jscoverage['/tree/node-xtpl.js'].lineData[55]++;
  buffer += '"\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[56]++;
  var option12 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[57]++;
  var params13 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[58]++;
  params13.push('expand-icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[59]++;
  option12.params = params13;
  _$jscoverage['/tree/node-xtpl.js'].lineData[60]++;
  var id11 = callCommandUtil(engine, scope, option12, "getBaseCssClasses", 8);
  _$jscoverage['/tree/node-xtpl.js'].lineData[61]++;
  buffer += escapeHtml(id11);
  _$jscoverage['/tree/node-xtpl.js'].lineData[62]++;
  buffer += '">\n    </div>\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[63]++;
  var option14 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[64]++;
  var params15 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[65]++;
  var id16 = scope.resolve(["checkable"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[66]++;
  params15.push(id16);
  _$jscoverage['/tree/node-xtpl.js'].lineData[67]++;
  option14.params = params15;
  _$jscoverage['/tree/node-xtpl.js'].lineData[68]++;
  option14.fn = function(scope) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[3]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[69]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[70]++;
  buffer += '\n    <div id="ks-tree-node-checked-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[71]++;
  var id17 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[72]++;
  buffer += escapeHtml(id17);
  _$jscoverage['/tree/node-xtpl.js'].lineData[73]++;
  buffer += '"\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[74]++;
  var option19 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[75]++;
  var params20 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[76]++;
  var id21 = scope.resolve(["checkState"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[77]++;
  params20.push(('checked') + id21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[78]++;
  option19.params = params20;
  _$jscoverage['/tree/node-xtpl.js'].lineData[79]++;
  var id18 = callCommandUtil(engine, scope, option19, "getBaseCssClasses", 12);
  _$jscoverage['/tree/node-xtpl.js'].lineData[80]++;
  buffer += escapeHtml(id18);
  _$jscoverage['/tree/node-xtpl.js'].lineData[81]++;
  buffer += '"></div>\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[82]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[84]++;
  buffer += ifCommand.call(engine, scope, option14, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[85]++;
  buffer += '\n    <div id="ks-tree-node-icon-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[86]++;
  var id22 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[87]++;
  buffer += escapeHtml(id22);
  _$jscoverage['/tree/node-xtpl.js'].lineData[88]++;
  buffer += '"\n         class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[89]++;
  var option24 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[90]++;
  var params25 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[91]++;
  params25.push('icon');
  _$jscoverage['/tree/node-xtpl.js'].lineData[92]++;
  option24.params = params25;
  _$jscoverage['/tree/node-xtpl.js'].lineData[93]++;
  var id23 = callCommandUtil(engine, scope, option24, "getBaseCssClasses", 15);
  _$jscoverage['/tree/node-xtpl.js'].lineData[94]++;
  buffer += escapeHtml(id23);
  _$jscoverage['/tree/node-xtpl.js'].lineData[95]++;
  buffer += '">\n\n    </div>\n    ';
  _$jscoverage['/tree/node-xtpl.js'].lineData[96]++;
  var option27 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[97]++;
  var params28 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[98]++;
  params28.push('component/extension/content-xtpl');
  _$jscoverage['/tree/node-xtpl.js'].lineData[99]++;
  option27.params = params28;
  _$jscoverage['/tree/node-xtpl.js'].lineData[100]++;
  if (visit28_100_1(moduleWrap)) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[101]++;
    require("component/extension/content-xtpl");
    _$jscoverage['/tree/node-xtpl.js'].lineData[102]++;
    option27.params[0] = moduleWrap.resolveByName(option27.params[0]);
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[104]++;
  var id26 = includeCommand.call(engine, scope, option27, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[105]++;
  if (visit29_105_1(id26 || visit30_105_2(id26 === 0))) {
    _$jscoverage['/tree/node-xtpl.js'].lineData[106]++;
    buffer += id26;
  }
  _$jscoverage['/tree/node-xtpl.js'].lineData[108]++;
  buffer += '\n</div>\n<div id="ks-tree-node-children-';
  _$jscoverage['/tree/node-xtpl.js'].lineData[109]++;
  var id29 = scope.resolve(["id"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[110]++;
  buffer += escapeHtml(id29);
  _$jscoverage['/tree/node-xtpl.js'].lineData[111]++;
  buffer += '"\n     class="';
  _$jscoverage['/tree/node-xtpl.js'].lineData[112]++;
  var option31 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[113]++;
  var params32 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[114]++;
  params32.push('children');
  _$jscoverage['/tree/node-xtpl.js'].lineData[115]++;
  option31.params = params32;
  _$jscoverage['/tree/node-xtpl.js'].lineData[116]++;
  var id30 = callCommandUtil(engine, scope, option31, "getBaseCssClasses", 21);
  _$jscoverage['/tree/node-xtpl.js'].lineData[117]++;
  buffer += escapeHtml(id30);
  _$jscoverage['/tree/node-xtpl.js'].lineData[118]++;
  buffer += '"\n';
  _$jscoverage['/tree/node-xtpl.js'].lineData[119]++;
  var option33 = {};
  _$jscoverage['/tree/node-xtpl.js'].lineData[120]++;
  var params34 = [];
  _$jscoverage['/tree/node-xtpl.js'].lineData[121]++;
  var id35 = scope.resolve(["expanded"]);
  _$jscoverage['/tree/node-xtpl.js'].lineData[122]++;
  id35 = !id35;
  _$jscoverage['/tree/node-xtpl.js'].lineData[123]++;
  params34.push(id35);
  _$jscoverage['/tree/node-xtpl.js'].lineData[124]++;
  option33.params = params34;
  _$jscoverage['/tree/node-xtpl.js'].lineData[125]++;
  option33.fn = function(scope) {
  _$jscoverage['/tree/node-xtpl.js'].functionData[4]++;
  _$jscoverage['/tree/node-xtpl.js'].lineData[126]++;
  var buffer = "";
  _$jscoverage['/tree/node-xtpl.js'].lineData[127]++;
  buffer += '\nstyle="display:none"\n';
  _$jscoverage['/tree/node-xtpl.js'].lineData[128]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[130]++;
  buffer += ifCommand.call(engine, scope, option33, payload);
  _$jscoverage['/tree/node-xtpl.js'].lineData[131]++;
  buffer += '\n>\n</div>';
  _$jscoverage['/tree/node-xtpl.js'].lineData[132]++;
  return buffer;
};
  _$jscoverage['/tree/node-xtpl.js'].lineData[134]++;
  t.TPL_NAME = "E:/code/kissy_git/kissy/kissy/src/tree/src/tree/node.xtpl.html";
  _$jscoverage['/tree/node-xtpl.js'].lineData[135]++;
  return t;
});
