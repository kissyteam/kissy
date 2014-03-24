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
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[122] = 0;
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
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['57'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['70'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['83'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['101'] = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['101'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['101'][1].init(2740, 37, 'commandRet21 && commandRet21.isBuffer');
function visit51_101_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['83'][1].init(456, 37, 'commandRet18 && commandRet18.isBuffer');
function visit50_83_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['70'][1].init(1170, 16, '(id13) === (id14)');
function visit49_70_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['57'][1].init(594, 37, 'commandRet10 && commandRet10.isBuffer');
function visit48_57_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit47_11_2(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit46_11_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit45_8_1(result) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[8]++;
  if (visit45_8_1("1.50" !== S.version)) {
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[11]++;
  if (visit46_11_1(visit47_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[25]++;
  buffer.write('');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[26]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[29]++;
  var params1 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[30]++;
  var id2 = scope.resolve(["months"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[31]++;
  params1.push(id2);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[32]++;
  option0.params = params1;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[33]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[35]++;
  buffer.write('\n<tr role="row">\n    ');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[40]++;
  var id6 = scope.resolve(["xindex"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[41]++;
  var id5 = scope.resolve(["months", id6]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[42]++;
  params4.push(id5);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[43]++;
  option3.params = params4;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[44]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[46]++;
  buffer.write('\n    <td role="gridcell"\n        title="');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[47]++;
  var id7 = scope.resolve(["title"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[48]++;
  buffer.write(id7, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[49]++;
  buffer.write('"\n        class="');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[50]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[53]++;
  var params9 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[54]++;
  params9.push('cell');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[55]++;
  option8.params = params9;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[56]++;
  var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[57]++;
  if (visit48_57_1(commandRet10 && commandRet10.isBuffer)) {
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[58]++;
    buffer = commandRet10;
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[59]++;
    commandRet10 = undefined;
  }
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[61]++;
  buffer.write(commandRet10, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[62]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[63]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[66]++;
  var params12 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[67]++;
  var id13 = scope.resolve(["month"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[68]++;
  var exp15 = id13;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[69]++;
  var id14 = scope.resolve(["value"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[70]++;
  exp15 = visit49_70_1((id13) === (id14));
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[71]++;
  params12.push(exp15);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[72]++;
  option11.params = params12;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[73]++;
  option11.fn = function(scope, buffer) {
  _$jscoverage['/picker/month-panel/months-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[75]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[76]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[79]++;
  var params17 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[80]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[81]++;
  option16.params = params17;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[82]++;
  var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 8);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[83]++;
  if (visit50_83_1(commandRet18 && commandRet18.isBuffer)) {
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[84]++;
    buffer = commandRet18;
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[85]++;
    commandRet18 = undefined;
  }
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[87]++;
  buffer.write(commandRet18, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[88]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[90]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[92]++;
  buffer = ifCommand.call(engine, scope, option11, buffer, 7, payload);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[93]++;
  buffer.write('\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[94]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[97]++;
  var params20 = [];
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[98]++;
  params20.push('month');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[99]++;
  option19.params = params20;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[100]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 14);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[101]++;
  if (visit51_101_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[102]++;
    buffer = commandRet21;
    _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[103]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[105]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[106]++;
  buffer.write('">\n            ');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[107]++;
  var id22 = scope.resolve(["content"]);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[108]++;
  buffer.write(id22, true);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[109]++;
  buffer.write('\n        </a>\n    </td>\n    ');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[111]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[113]++;
  buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[114]++;
  buffer.write('\n</tr>\n');
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[116]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[118]++;
  buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[119]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[121]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/month-panel/months-xtpl.js'].lineData[122]++;
  return t;
});
