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
if (! _$jscoverage['/control/render-xtpl.js']) {
  _$jscoverage['/control/render-xtpl.js'] = {};
  _$jscoverage['/control/render-xtpl.js'].lineData = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[93] = 0;
}
if (! _$jscoverage['/control/render-xtpl.js'].functionData) {
  _$jscoverage['/control/render-xtpl.js'].functionData = [];
  _$jscoverage['/control/render-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/control/render-xtpl.js'].branchData) {
  _$jscoverage['/control/render-xtpl.js'].branchData = {};
  _$jscoverage['/control/render-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/control/render-xtpl.js'].branchData['29'][1] = new BranchData();
}
_$jscoverage['/control/render-xtpl.js'].branchData['29'][1].init(1163, 29, 'callRet2 && callRet2.isBuffer');
function visit12_29_1(result) {
  _$jscoverage['/control/render-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/control/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[4]++;
  var render = function(scope, buffer, undefined) {
  _$jscoverage['/control/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/control/render-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/control/render-xtpl.js'].lineData[20]++;
  buffer.write('<div id="', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[21]++;
  var id0 = scope.resolve(["id"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[22]++;
  buffer.write(id0, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[23]++;
  buffer.write('"\r\n class="', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[24]++;
  var option1 = {
  escape: 1};
  _$jscoverage['/control/render-xtpl.js'].lineData[27]++;
  var callRet2;
  _$jscoverage['/control/render-xtpl.js'].lineData[28]++;
  callRet2 = callFnUtil(tpl, scope, option1, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/control/render-xtpl.js'].lineData[29]++;
  if (visit12_29_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/control/render-xtpl.js'].lineData[30]++;
    buffer = callRet2;
    _$jscoverage['/control/render-xtpl.js'].lineData[31]++;
    callRet2 = undefined;
  }
  _$jscoverage['/control/render-xtpl.js'].lineData[33]++;
  buffer.write(callRet2, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[34]++;
  buffer.write('\r\n', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[35]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/control/render-xtpl.js'].lineData[38]++;
  var params4 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[39]++;
  var id5 = scope.resolve(["elCls"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[40]++;
  params4.push(id5);
  _$jscoverage['/control/render-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/control/render-xtpl.js'].lineData[42]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/control/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[43]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[44]++;
  var id6 = scope.resolve(["this"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[45]++;
  buffer.write(id6, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[46]++;
  buffer.write('\r\n', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[47]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[49]++;
  buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
  _$jscoverage['/control/render-xtpl.js'].lineData[50]++;
  buffer.write('\r\n"\r\n\r\n', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[51]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/control/render-xtpl.js'].lineData[54]++;
  var params8 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[55]++;
  var id9 = scope.resolve(["elAttrs"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[56]++;
  params8.push(id9);
  _$jscoverage['/control/render-xtpl.js'].lineData[57]++;
  option7.params = params8;
  _$jscoverage['/control/render-xtpl.js'].lineData[58]++;
  option7.fn = function(scope, buffer) {
  _$jscoverage['/control/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[59]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[60]++;
  var id10 = scope.resolve(["xindex"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[61]++;
  buffer.write(id10, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[62]++;
  buffer.write('="', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[63]++;
  var id11 = scope.resolve(["this"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[64]++;
  buffer.write(id11, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[65]++;
  buffer.write('"\r\n', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[66]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[68]++;
  buffer = eachCommand.call(tpl, scope, option7, buffer, 8);
  _$jscoverage['/control/render-xtpl.js'].lineData[69]++;
  buffer.write('\r\n\r\nstyle="\r\n', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[70]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/control/render-xtpl.js'].lineData[73]++;
  var params13 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[74]++;
  var id14 = scope.resolve(["elStyle"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[75]++;
  params13.push(id14);
  _$jscoverage['/control/render-xtpl.js'].lineData[76]++;
  option12.params = params13;
  _$jscoverage['/control/render-xtpl.js'].lineData[77]++;
  option12.fn = function(scope, buffer) {
  _$jscoverage['/control/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[78]++;
  buffer.write('\r\n ', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[79]++;
  var id15 = scope.resolve(["xindex"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[80]++;
  buffer.write(id15, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[81]++;
  buffer.write(':', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[82]++;
  var id16 = scope.resolve(["this"], 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[83]++;
  buffer.write(id16, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[84]++;
  buffer.write(';\r\n', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[85]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[87]++;
  buffer = eachCommand.call(tpl, scope, option12, buffer, 13);
  _$jscoverage['/control/render-xtpl.js'].lineData[88]++;
  buffer.write('\r\n">', 0);
  _$jscoverage['/control/render-xtpl.js'].lineData[89]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[91]++;
  render.TPL_NAME = module.name;
  _$jscoverage['/control/render-xtpl.js'].lineData[92]++;
  render.version = "5.0.0";
  _$jscoverage['/control/render-xtpl.js'].lineData[93]++;
  return render;
});
