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
if (! _$jscoverage['/filter-menu/render-xtpl.js']) {
  _$jscoverage['/filter-menu/render-xtpl.js'] = {};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[84] = 0;
}
if (! _$jscoverage['/filter-menu/render-xtpl.js'].functionData) {
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/filter-menu/render-xtpl.js'].branchData) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData = {};
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['20'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['32'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['46'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['63'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['76'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['76'][1] = new BranchData();
}
_$jscoverage['/filter-menu/render-xtpl.js'].branchData['76'][1].init(3164, 31, 'callRet12 && callRet12.isBuffer');
function visit5_76_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['63'][1].init(2564, 29, 'callRet9 && callRet9.isBuffer');
function visit4_63_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['46'][1].init(1883, 29, 'callRet5 && callRet5.isBuffer');
function visit3_46_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['32'][1].init(1351, 29, 'callRet2 && callRet2.isBuffer');
function visit2_32_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['20'][1].init(802, 21, '"5.0.0" !== S.version');
function visit1_20_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[20]++;
  if (visit1_20_1("5.0.0" !== S.version)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[21]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[23]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[24]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[27]++;
  var params1 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[28]++;
  params1.push('input-wrap');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[29]++;
  option0.params = params1;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[30]++;
  var callRet2;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[31]++;
  callRet2 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[32]++;
  if (visit2_32_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[33]++;
    buffer = callRet2;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[34]++;
    callRet2 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[36]++;
  buffer.write(callRet2, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[37]++;
  buffer.write('">\r\n    <div class="', 0);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[38]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[41]++;
  var params4 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[42]++;
  params4.push('placeholder');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[43]++;
  option3.params = params4;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[44]++;
  var callRet5;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[45]++;
  callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[46]++;
  if (visit3_46_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[47]++;
    buffer = callRet5;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[48]++;
    callRet5 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[50]++;
  buffer.write(callRet5, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[51]++;
  buffer.write('">\r\n        ', 0);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[52]++;
  var id6 = scope.resolve(["placeholder"], 0);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[53]++;
  buffer.write(id6, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[54]++;
  buffer.write('\r\n    </div>\r\n    <input class="', 0);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[55]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[58]++;
  var params8 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[59]++;
  params8.push('input');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[60]++;
  option7.params = params8;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[61]++;
  var callRet9;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[62]++;
  callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 5);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[63]++;
  if (visit4_63_1(callRet9 && callRet9.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[64]++;
    buffer = callRet9;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[65]++;
    callRet9 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[67]++;
  buffer.write(callRet9, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[68]++;
  buffer.write('"\r\n            autocomplete="off"/>\r\n</div>\r\n', 0);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[69]++;
  var option10 = {};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[70]++;
  var params11 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[71]++;
  params11.push('component/extension/content-xtpl');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[72]++;
  option10.params = params11;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[73]++;
  require("component/extension/content-xtpl");
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[74]++;
  var callRet12;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[75]++;
  callRet12 = includeCommand.call(engine, scope, option10, buffer, 8, payload);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[76]++;
  if (visit5_76_1(callRet12 && callRet12.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[77]++;
    buffer = callRet12;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[78]++;
    callRet12 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[80]++;
  buffer.write(callRet12, false);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[81]++;
  return buffer;
};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[83]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[84]++;
  return t;
});
