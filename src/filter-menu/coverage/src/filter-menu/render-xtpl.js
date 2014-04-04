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
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[89] = 0;
}
if (! _$jscoverage['/filter-menu/render-xtpl.js'].functionData) {
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/filter-menu/render-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/filter-menu/render-xtpl.js'].branchData) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData = {};
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['33'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['68'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['81'] = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['81'][1] = new BranchData();
}
_$jscoverage['/filter-menu/render-xtpl.js'].branchData['81'][1].init(3570, 37, 'commandRet15 && commandRet15.isBuffer');
function visit5_81_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['68'][1].init(2908, 37, 'commandRet12 && commandRet12.isBuffer');
function visit4_68_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['49'][1].init(2087, 35, 'commandRet7 && commandRet7.isBuffer');
function visit3_49_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['33'][1].init(1408, 35, 'commandRet3 && commandRet3.isBuffer');
function visit2_33_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu/render-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
function visit1_8_1(result) {
  _$jscoverage['/filter-menu/render-xtpl.js'].branchData['8'][1].ranCondition(result);
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
  if (visit1_8_1("1.50" !== S.version)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[22]++;
  buffer.write('<div id="ks-filter-menu-input-wrap-');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[23]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[24]++;
  buffer.write(id0, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[25]++;
  buffer.write('"\n     class="');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[26]++;
  var option1 = {
  escape: 1};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[29]++;
  var params2 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[30]++;
  params2.push('input-wrap');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[31]++;
  option1.params = params2;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[32]++;
  var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[33]++;
  if (visit2_33_1(commandRet3 && commandRet3.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[34]++;
    buffer = commandRet3;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[35]++;
    commandRet3 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[37]++;
  buffer.write(commandRet3, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[38]++;
  buffer.write('">\n    <div id="ks-filter-menu-placeholder-');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[39]++;
  var id4 = scope.resolve(["id"]);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[40]++;
  buffer.write(id4, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[41]++;
  buffer.write('"\n         class="');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[42]++;
  var option5 = {
  escape: 1};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[45]++;
  var params6 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[46]++;
  params6.push('placeholder');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[47]++;
  option5.params = params6;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[48]++;
  var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[49]++;
  if (visit3_49_1(commandRet7 && commandRet7.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[50]++;
    buffer = commandRet7;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[51]++;
    commandRet7 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[53]++;
  buffer.write(commandRet7, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[54]++;
  buffer.write('">\n        ');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[55]++;
  var id8 = scope.resolve(["placeholder"]);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[56]++;
  buffer.write(id8, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[57]++;
  buffer.write('\n    </div>\n    <input id="ks-filter-menu-input-');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[58]++;
  var id9 = scope.resolve(["id"]);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[59]++;
  buffer.write(id9, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[60]++;
  buffer.write('"\n           class="');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[61]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[64]++;
  var params11 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[65]++;
  params11.push('input');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[66]++;
  option10.params = params11;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[67]++;
  var commandRet12 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 8);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[68]++;
  if (visit4_68_1(commandRet12 && commandRet12.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[69]++;
    buffer = commandRet12;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[70]++;
    commandRet12 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[72]++;
  buffer.write(commandRet12, true);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[73]++;
  buffer.write('"\n            autocomplete="off"/>\n</div>\n');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[74]++;
  var option13 = {};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[75]++;
  var params14 = [];
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[76]++;
  params14.push('component/extension/content-xtpl');
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[77]++;
  option13.params = params14;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[78]++;
  require("component/extension/content-xtpl");
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[79]++;
  option13.params[0] = module.resolve(option13.params[0]);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[80]++;
  var commandRet15 = includeCommand.call(engine, scope, option13, buffer, 11, payload);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[81]++;
  if (visit5_81_1(commandRet15 && commandRet15.isBuffer)) {
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[82]++;
    buffer = commandRet15;
    _$jscoverage['/filter-menu/render-xtpl.js'].lineData[83]++;
    commandRet15 = undefined;
  }
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[85]++;
  buffer.write(commandRet15, false);
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[86]++;
  return buffer;
};
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[88]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/filter-menu/render-xtpl.js'].lineData[89]++;
  return t;
});
