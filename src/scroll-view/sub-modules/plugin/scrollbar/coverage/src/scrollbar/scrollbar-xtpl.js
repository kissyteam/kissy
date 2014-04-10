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
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[23] = 0;
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
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39] = 0;
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
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55] = 0;
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
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71] = 0;
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
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[138] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['33'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['65'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['81'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['113'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['129'] = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['129'][1] = new BranchData();
}
_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['129'][1].init(5384, 37, 'commandRet34 && commandRet34.isBuffer');
function visit29_129_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['113'][1].init(4726, 37, 'commandRet29 && commandRet29.isBuffer');
function visit28_113_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['97'][1].init(4068, 37, 'commandRet24 && commandRet24.isBuffer');
function visit27_97_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['81'][1].init(3422, 37, 'commandRet19 && commandRet19.isBuffer');
function visit26_81_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['65'][1].init(2775, 37, 'commandRet14 && commandRet14.isBuffer');
function visit25_65_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'][1].init(2073, 35, 'commandRet9 && commandRet9.isBuffer');
function visit24_49_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['33'][1].init(1378, 35, 'commandRet4 && commandRet4.isBuffer');
function visit23_33_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit22_8_1(result) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[8]++;
  if (visit22_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27]++;
  var id2 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28]++;
  var exp3 = id2;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29]++;
  exp3 = (id2) + ('-arrow-up arrow-up');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30]++;
  params1.push(exp3);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31]++;
  option0.params = params1;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32]++;
  var commandRet4 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33]++;
  if (visit23_33_1(commandRet4 && commandRet4.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34]++;
    buffer = commandRet4;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35]++;
    commandRet4 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37]++;
  buffer.write(commandRet4, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38]++;
  buffer.write('">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42]++;
  var params6 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43]++;
  var id7 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44]++;
  var exp8 = id7;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45]++;
  exp8 = (id7) + ('-arrow-down arrow-down');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46]++;
  params6.push(exp8);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47]++;
  option5.params = params6;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48]++;
  var commandRet9 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49]++;
  if (visit24_49_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50]++;
    buffer = commandRet9;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54]++;
  buffer.write('">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58]++;
  var params11 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59]++;
  var id12 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60]++;
  var exp13 = id12;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61]++;
  exp13 = (id12) + ('-track track');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62]++;
  params11.push(exp13);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63]++;
  option10.params = params11;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64]++;
  var commandRet14 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65]++;
  if (visit25_65_1(commandRet14 && commandRet14.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66]++;
    buffer = commandRet14;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67]++;
    commandRet14 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[69]++;
  buffer.write(commandRet14, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70]++;
  buffer.write('">\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74]++;
  var params16 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75]++;
  var id17 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76]++;
  var exp18 = id17;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77]++;
  exp18 = (id17) + ('-drag drag');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78]++;
  params16.push(exp18);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79]++;
  option15.params = params16;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80]++;
  var commandRet19 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 8);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81]++;
  if (visit26_81_1(commandRet19 && commandRet19.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[82]++;
    buffer = commandRet19;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[83]++;
    commandRet19 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[85]++;
  buffer.write(commandRet19, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[86]++;
  buffer.write('">\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[87]++;
  var option20 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[90]++;
  var params21 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[91]++;
  var id22 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[92]++;
  var exp23 = id22;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[93]++;
  exp23 = (id22) + ('-drag-top');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[94]++;
  params21.push(exp23);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[95]++;
  option20.params = params21;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[96]++;
  var commandRet24 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[97]++;
  if (visit27_97_1(commandRet24 && commandRet24.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[98]++;
    buffer = commandRet24;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[99]++;
    commandRet24 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[101]++;
  buffer.write(commandRet24, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[102]++;
  buffer.write('">\n</div>\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[103]++;
  var option25 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[106]++;
  var params26 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[107]++;
  var id27 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[108]++;
  var exp28 = id27;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[109]++;
  exp28 = (id27) + ('-drag-center');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[110]++;
  params26.push(exp28);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[111]++;
  option25.params = params26;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[112]++;
  var commandRet29 = callCommandUtil(engine, scope, option25, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[113]++;
  if (visit28_113_1(commandRet29 && commandRet29.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[114]++;
    buffer = commandRet29;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[115]++;
    commandRet29 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[117]++;
  buffer.write(commandRet29, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[118]++;
  buffer.write('">\n</div>\n<div class="');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[119]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[122]++;
  var params31 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[123]++;
  var id32 = scope.resolve(["axis"]);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[124]++;
  var exp33 = id32;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[125]++;
  exp33 = (id32) + ('-drag-bottom');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[126]++;
  params31.push(exp33);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[127]++;
  option30.params = params31;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[128]++;
  var commandRet34 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 13);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[129]++;
  if (visit29_129_1(commandRet34 && commandRet34.isBuffer)) {
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[130]++;
    buffer = commandRet34;
    _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[131]++;
    commandRet34 = undefined;
  }
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[133]++;
  buffer.write(commandRet34, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[134]++;
  buffer.write('">\n</div>\n</div>\n</div>');
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[135]++;
  return buffer;
};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[137]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[138]++;
  return t;
});
