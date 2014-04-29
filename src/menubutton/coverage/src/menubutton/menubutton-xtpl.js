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
if (! _$jscoverage['/menubutton/menubutton-xtpl.js']) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'] = {};
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[68] = 0;
}
if (! _$jscoverage['/menubutton/menubutton-xtpl.js'].functionData) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].functionData = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData = {};
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['20'] = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['31'] = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['45'] = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['59'] = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['59'][1] = new BranchData();
}
_$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['59'][1].init(2430, 29, 'callRet8 && callRet8.isBuffer');
function visit31_59_1(result) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['45'][1].init(1895, 29, 'callRet5 && callRet5.isBuffer');
function visit30_45_1(result) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['31'][1].init(1371, 29, 'callRet2 && callRet2.isBuffer');
function visit29_31_1(result) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['20'][1].init(802, 21, '"5.0.0" !== S.version');
function visit28_20_1(result) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].functionData[0]++;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/menubutton/menubutton-xtpl.js'].functionData[1]++;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[20]++;
  if (visit28_20_1("5.0.0" !== S.version)) {
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[21]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[23]++;
  buffer.write('', 0);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[24]++;
  var option0 = {};
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[25]++;
  var params1 = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[26]++;
  params1.push('component/extension/content-xtpl');
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[27]++;
  option0.params = params1;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[28]++;
  require("component/extension/content-xtpl");
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[29]++;
  var callRet2;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[30]++;
  callRet2 = includeCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[31]++;
  if (visit29_31_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[32]++;
    buffer = callRet2;
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[33]++;
    callRet2 = undefined;
  }
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[35]++;
  buffer.write(callRet2, false);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[36]++;
  buffer.write('\r\n<div class="', 0);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[37]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[40]++;
  var params4 = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[41]++;
  params4.push('dropdown');
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[42]++;
  option3.params = params4;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[43]++;
  var callRet5;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[44]++;
  callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[45]++;
  if (visit30_45_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[46]++;
    buffer = callRet5;
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[47]++;
    callRet5 = undefined;
  }
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[49]++;
  buffer.write(callRet5, true);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[50]++;
  buffer.write('">\r\n    <div class="', 0);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[51]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[54]++;
  var params7 = [];
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[55]++;
  params7.push('dropdown-inner');
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[56]++;
  option6.params = params7;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[57]++;
  var callRet8;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[58]++;
  callRet8 = callFnUtil(engine, scope, option6, buffer, ["getBaseCssClasses"], 0, 3);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[59]++;
  if (visit31_59_1(callRet8 && callRet8.isBuffer)) {
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[60]++;
    buffer = callRet8;
    _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[61]++;
    callRet8 = undefined;
  }
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[63]++;
  buffer.write(callRet8, true);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[64]++;
  buffer.write('">\r\n    </div>\r\n</div>', 0);
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[65]++;
  return buffer;
};
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[67]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/menubutton/menubutton-xtpl.js'].lineData[68]++;
  return t;
});
