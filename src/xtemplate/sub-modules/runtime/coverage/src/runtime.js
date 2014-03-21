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
if (! _$jscoverage['/runtime.js']) {
  _$jscoverage['/runtime.js'] = {};
  _$jscoverage['/runtime.js'].lineData = [];
  _$jscoverage['/runtime.js'].lineData[6] = 0;
  _$jscoverage['/runtime.js'].lineData[7] = 0;
  _$jscoverage['/runtime.js'].lineData[8] = 0;
  _$jscoverage['/runtime.js'].lineData[9] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[12] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[30] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[43] = 0;
  _$jscoverage['/runtime.js'].lineData[46] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[53] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[56] = 0;
  _$jscoverage['/runtime.js'].lineData[57] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[62] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[90] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[93] = 0;
  _$jscoverage['/runtime.js'].lineData[94] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[128] = 0;
  _$jscoverage['/runtime.js'].lineData[143] = 0;
  _$jscoverage['/runtime.js'].lineData[144] = 0;
  _$jscoverage['/runtime.js'].lineData[145] = 0;
  _$jscoverage['/runtime.js'].lineData[146] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[149] = 0;
  _$jscoverage['/runtime.js'].lineData[150] = 0;
  _$jscoverage['/runtime.js'].lineData[158] = 0;
  _$jscoverage['/runtime.js'].lineData[159] = 0;
  _$jscoverage['/runtime.js'].lineData[160] = 0;
  _$jscoverage['/runtime.js'].lineData[170] = 0;
  _$jscoverage['/runtime.js'].lineData[171] = 0;
  _$jscoverage['/runtime.js'].lineData[172] = 0;
  _$jscoverage['/runtime.js'].lineData[176] = 0;
  _$jscoverage['/runtime.js'].lineData[177] = 0;
  _$jscoverage['/runtime.js'].lineData[178] = 0;
  _$jscoverage['/runtime.js'].lineData[179] = 0;
  _$jscoverage['/runtime.js'].lineData[181] = 0;
  _$jscoverage['/runtime.js'].lineData[183] = 0;
  _$jscoverage['/runtime.js'].lineData[185] = 0;
  _$jscoverage['/runtime.js'].lineData[195] = 0;
  _$jscoverage['/runtime.js'].lineData[196] = 0;
  _$jscoverage['/runtime.js'].lineData[197] = 0;
  _$jscoverage['/runtime.js'].lineData[198] = 0;
  _$jscoverage['/runtime.js'].lineData[200] = 0;
  _$jscoverage['/runtime.js'].lineData[201] = 0;
  _$jscoverage['/runtime.js'].lineData[204] = 0;
  _$jscoverage['/runtime.js'].lineData[205] = 0;
  _$jscoverage['/runtime.js'].lineData[209] = 0;
  _$jscoverage['/runtime.js'].lineData[211] = 0;
}
if (! _$jscoverage['/runtime.js'].functionData) {
  _$jscoverage['/runtime.js'].functionData = [];
  _$jscoverage['/runtime.js'].functionData[0] = 0;
  _$jscoverage['/runtime.js'].functionData[1] = 0;
  _$jscoverage['/runtime.js'].functionData[2] = 0;
  _$jscoverage['/runtime.js'].functionData[3] = 0;
  _$jscoverage['/runtime.js'].functionData[4] = 0;
  _$jscoverage['/runtime.js'].functionData[5] = 0;
  _$jscoverage['/runtime.js'].functionData[6] = 0;
  _$jscoverage['/runtime.js'].functionData[7] = 0;
  _$jscoverage['/runtime.js'].functionData[8] = 0;
  _$jscoverage['/runtime.js'].functionData[9] = 0;
  _$jscoverage['/runtime.js'].functionData[10] = 0;
  _$jscoverage['/runtime.js'].functionData[11] = 0;
  _$jscoverage['/runtime.js'].functionData[12] = 0;
  _$jscoverage['/runtime.js'].functionData[13] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['13'] = [];
  _$jscoverage['/runtime.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['14'] = [];
  _$jscoverage['/runtime.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['17'] = [];
  _$jscoverage['/runtime.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['17'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['18'] = [];
  _$jscoverage['/runtime.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['20'] = [];
  _$jscoverage['/runtime.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['22'] = [];
  _$jscoverage['/runtime.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['34'] = [];
  _$jscoverage['/runtime.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['36'] = [];
  _$jscoverage['/runtime.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['37'] = [];
  _$jscoverage['/runtime.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['48'] = [];
  _$jscoverage['/runtime.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['50'] = [];
  _$jscoverage['/runtime.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['56'] = [];
  _$jscoverage['/runtime.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['67'] = [];
  _$jscoverage['/runtime.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['91'] = [];
  _$jscoverage['/runtime.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['93'] = [];
  _$jscoverage['/runtime.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['145'] = [];
  _$jscoverage['/runtime.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['159'] = [];
  _$jscoverage['/runtime.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['171'] = [];
  _$jscoverage['/runtime.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['177'] = [];
  _$jscoverage['/runtime.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['178'] = [];
  _$jscoverage['/runtime.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['197'] = [];
  _$jscoverage['/runtime.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['200'] = [];
  _$jscoverage['/runtime.js'].branchData['200'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['200'][1].init(175, 31, '!self.name && self.tpl.TPL_NAME');
function visit87_200_1(result) {
  _$jscoverage['/runtime.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['197'][1].init(80, 77, 'callback || function(error, ret) {\n  html = ret;\n}');
function visit86_197_1(result) {
  _$jscoverage['/runtime.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['178'][1].init(21, 7, '!myName');
function visit85_178_1(result) {
  _$jscoverage['/runtime.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['177'][1].init(53, 28, 'subTplName.charAt(0) === \'.\'');
function visit84_177_1(result) {
  _$jscoverage['/runtime.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['171'][1].init(69, 21, 'config.commands || {}');
function visit83_171_1(result) {
  _$jscoverage['/runtime.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['159'][1].init(55, 15, 'config.commands');
function visit82_159_1(result) {
  _$jscoverage['/runtime.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['145'][1].init(91, 4, '!tpl');
function visit81_145_1(result) {
  _$jscoverage['/runtime.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['93'][1].init(134, 11, 'config.name');
function visit80_93_1(result) {
  _$jscoverage['/runtime.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['91'][1].init(67, 12, 'config || {}');
function visit79_91_1(result) {
  _$jscoverage['/runtime.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(147, 8, 'command1');
function visit78_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['56'][1].init(360, 13, 'extendTplName');
function visit77_56_1(result) {
  _$jscoverage['/runtime.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['50'][1].init(112, 26, 'tpl.TPL_NAME && !self.name');
function visit76_50_1(result) {
  _$jscoverage['/runtime.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['48'][1].init(47, 13, 'payload || {}');
function visit75_48_1(result) {
  _$jscoverage['/runtime.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][1].init(99, 16, 'subPart === \'..\'');
function visit74_37_1(result) {
  _$jscoverage['/runtime.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['36'][1].init(56, 15, 'subPart === \'.\'');
function visit73_36_1(result) {
  _$jscoverage['/runtime.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['34'][1].init(153, 5, 'i < l');
function visit72_34_1(result) {
  _$jscoverage['/runtime.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['22'][1].init(58, 4, '!cmd');
function visit71_22_1(result) {
  _$jscoverage['/runtime.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][1].init(65, 7, 'i < len');
function visit70_20_1(result) {
  _$jscoverage['/runtime.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['18'][1].init(257, 3, 'cmd');
function visit69_18_1(result) {
  _$jscoverage['/runtime.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['17'][2].init(181, 40, 'localCommands && localCommands[parts[0]]');
function visit68_17_2(result) {
  _$jscoverage['/runtime.js'].branchData['17'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['17'][1].init(181, 62, 'localCommands && localCommands[parts[0]] || commands[parts[0]]');
function visit67_17_1(result) {
  _$jscoverage['/runtime.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['14'][2].init(20, 36, 'localCommands && localCommands[name]');
function visit66_14_2(result) {
  _$jscoverage['/runtime.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['14'][1].init(20, 54, 'localCommands && localCommands[name] || commands[name]');
function visit65_14_1(result) {
  _$jscoverage['/runtime.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['13'][1].init(13, 24, 'name.indexOf(\'.\') === -1');
function visit64_13_1(result) {
  _$jscoverage['/runtime.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var nativeCommands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[8]++;
  var commands = {};
  _$jscoverage['/runtime.js'].lineData[9]++;
  var Scope = require('./runtime/scope');
  _$jscoverage['/runtime.js'].lineData[10]++;
  var LinkedBuffer = require('./runtime/linked-buffer');
  _$jscoverage['/runtime.js'].lineData[12]++;
  function findCommand(localCommands, name) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[13]++;
    if (visit64_13_1(name.indexOf('.') === -1)) {
      _$jscoverage['/runtime.js'].lineData[14]++;
      return visit65_14_1(visit66_14_2(localCommands && localCommands[name]) || commands[name]);
    }
    _$jscoverage['/runtime.js'].lineData[16]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[17]++;
    var cmd = visit67_17_1(visit68_17_2(localCommands && localCommands[parts[0]]) || commands[parts[0]]);
    _$jscoverage['/runtime.js'].lineData[18]++;
    if (visit69_18_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[19]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[20]++;
      for (var i = 1; visit70_20_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[21]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[22]++;
        if (visit71_22_1(!cmd)) {
          _$jscoverage['/runtime.js'].lineData[23]++;
          break;
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[27]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[30]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[31]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime.js'].lineData[32]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime.js'].lineData[33]++;
    parts.pop();
    _$jscoverage['/runtime.js'].lineData[34]++;
    for (var i = 0, l = subParts.length; visit72_34_1(i < l); i++) {
      _$jscoverage['/runtime.js'].lineData[35]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime.js'].lineData[36]++;
      if (visit73_36_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime.js'].lineData[37]++;
        if (visit74_37_1(subPart === '..')) {
          _$jscoverage['/runtime.js'].lineData[38]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime.js'].lineData[40]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[43]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime.js'].lineData[46]++;
  function renderTpl(self, scope, buffer, payload) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[47]++;
    var tpl = self.tpl;
    _$jscoverage['/runtime.js'].lineData[48]++;
    payload = visit75_48_1(payload || {});
    _$jscoverage['/runtime.js'].lineData[49]++;
    payload.extendTplName = null;
    _$jscoverage['/runtime.js'].lineData[50]++;
    if (visit76_50_1(tpl.TPL_NAME && !self.name)) {
      _$jscoverage['/runtime.js'].lineData[51]++;
      self.name = tpl.TPL_NAME;
    }
    _$jscoverage['/runtime.js'].lineData[53]++;
    buffer = tpl.call(self, scope, S, buffer, payload);
    _$jscoverage['/runtime.js'].lineData[54]++;
    var extendTplName = payload.extendTplName;
    _$jscoverage['/runtime.js'].lineData[56]++;
    if (visit77_56_1(extendTplName)) {
      _$jscoverage['/runtime.js'].lineData[57]++;
      buffer = self.include(extendTplName, scope, buffer, payload);
    }
    _$jscoverage['/runtime.js'].lineData[59]++;
    return buffer;
  }
  _$jscoverage['/runtime.js'].lineData[62]++;
  var utils = {
  'callCommand': function(engine, scope, option, buffer, name, line) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[64]++;
  var commands = engine.config.commands;
  _$jscoverage['/runtime.js'].lineData[65]++;
  var error;
  _$jscoverage['/runtime.js'].lineData[66]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[67]++;
  if (visit78_67_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[68]++;
    return command1.call(engine, scope, option, buffer);
  } else {
    _$jscoverage['/runtime.js'].lineData[70]++;
    error = 'in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line;
    _$jscoverage['/runtime.js'].lineData[71]++;
    S.error(error);
  }
  _$jscoverage['/runtime.js'].lineData[73]++;
  return buffer;
}};
  _$jscoverage['/runtime.js'].lineData[88]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[5]++;
    _$jscoverage['/runtime.js'].lineData[89]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[90]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[91]++;
    config = visit79_91_1(config || {});
    _$jscoverage['/runtime.js'].lineData[93]++;
    if (visit80_93_1(config.name)) {
      _$jscoverage['/runtime.js'].lineData[94]++;
      self.name = config.name;
    }
    _$jscoverage['/runtime.js'].lineData[96]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[99]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[113]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[124]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[128]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  Scope: Scope, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[144]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[145]++;
  if (visit81_145_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[146]++;
    S.error('template "' + subTplName + '" does not exist, need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[148]++;
  var engine = new self.constructor(tpl, self.config);
  _$jscoverage['/runtime.js'].lineData[149]++;
  engine.name = subTplName;
  _$jscoverage['/runtime.js'].lineData[150]++;
  return engine;
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[158]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[159]++;
  if (visit82_159_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[160]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[170]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[171]++;
  config.commands = visit83_171_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[172]++;
  config.commands[commandName] = fn;
}, 
  include: function(subTplName, scope, buffer, payload) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[176]++;
  var myName = this.name;
  _$jscoverage['/runtime.js'].lineData[177]++;
  if (visit84_177_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime.js'].lineData[178]++;
    if (visit85_178_1(!myName)) {
      _$jscoverage['/runtime.js'].lineData[179]++;
      var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subTplName;
      _$jscoverage['/runtime.js'].lineData[181]++;
      throw new Error(error);
    }
    _$jscoverage['/runtime.js'].lineData[183]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime.js'].lineData[185]++;
  return renderTpl(this.load(subTplName), scope, buffer, payload);
}, 
  render: function(data, callback) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[195]++;
  var html = '';
  _$jscoverage['/runtime.js'].lineData[196]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[197]++;
  callback = visit86_197_1(callback || function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[198]++;
  html = ret;
});
  _$jscoverage['/runtime.js'].lineData[200]++;
  if (visit87_200_1(!self.name && self.tpl.TPL_NAME)) {
    _$jscoverage['/runtime.js'].lineData[201]++;
    self.name = self.tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[204]++;
  renderTpl(self, new Scope(data), new LinkedBuffer(callback).head).end();
  _$jscoverage['/runtime.js'].lineData[205]++;
  return html;
}};
  _$jscoverage['/runtime.js'].lineData[209]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[211]++;
  return XTemplateRuntime;
});
