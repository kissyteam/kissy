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
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[25] = 0;
  _$jscoverage['/runtime.js'].lineData[26] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[62] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[98] = 0;
  _$jscoverage['/runtime.js'].lineData[102] = 0;
  _$jscoverage['/runtime.js'].lineData[115] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[117] = 0;
  _$jscoverage['/runtime.js'].lineData[119] = 0;
  _$jscoverage['/runtime.js'].lineData[120] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[130] = 0;
  _$jscoverage['/runtime.js'].lineData[131] = 0;
  _$jscoverage['/runtime.js'].lineData[141] = 0;
  _$jscoverage['/runtime.js'].lineData[142] = 0;
  _$jscoverage['/runtime.js'].lineData[143] = 0;
  _$jscoverage['/runtime.js'].lineData[155] = 0;
  _$jscoverage['/runtime.js'].lineData[156] = 0;
  _$jscoverage['/runtime.js'].lineData[157] = 0;
  _$jscoverage['/runtime.js'].lineData[158] = 0;
  _$jscoverage['/runtime.js'].lineData[159] = 0;
  _$jscoverage['/runtime.js'].lineData[160] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[164] = 0;
  _$jscoverage['/runtime.js'].lineData[165] = 0;
  _$jscoverage['/runtime.js'].lineData[167] = 0;
  _$jscoverage['/runtime.js'].lineData[169] = 0;
  _$jscoverage['/runtime.js'].lineData[170] = 0;
  _$jscoverage['/runtime.js'].lineData[171] = 0;
  _$jscoverage['/runtime.js'].lineData[172] = 0;
  _$jscoverage['/runtime.js'].lineData[174] = 0;
  _$jscoverage['/runtime.js'].lineData[175] = 0;
  _$jscoverage['/runtime.js'].lineData[177] = 0;
  _$jscoverage['/runtime.js'].lineData[178] = 0;
  _$jscoverage['/runtime.js'].lineData[183] = 0;
  _$jscoverage['/runtime.js'].lineData[184] = 0;
  _$jscoverage['/runtime.js'].lineData[185] = 0;
  _$jscoverage['/runtime.js'].lineData[188] = 0;
  _$jscoverage['/runtime.js'].lineData[193] = 0;
  _$jscoverage['/runtime.js'].lineData[195] = 0;
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
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['19'] = [];
  _$jscoverage['/runtime.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['20'] = [];
  _$jscoverage['/runtime.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['20'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['23'] = [];
  _$jscoverage['/runtime.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['24'] = [];
  _$jscoverage['/runtime.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['26'] = [];
  _$jscoverage['/runtime.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['28'] = [];
  _$jscoverage['/runtime.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['41'] = [];
  _$jscoverage['/runtime.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['65'] = [];
  _$jscoverage['/runtime.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['67'] = [];
  _$jscoverage['/runtime.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['116'] = [];
  _$jscoverage['/runtime.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['130'] = [];
  _$jscoverage['/runtime.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['142'] = [];
  _$jscoverage['/runtime.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['159'] = [];
  _$jscoverage['/runtime.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['159'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['163'] = [];
  _$jscoverage['/runtime.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['164'] = [];
  _$jscoverage['/runtime.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['169'] = [];
  _$jscoverage['/runtime.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['171'] = [];
  _$jscoverage['/runtime.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['177'] = [];
  _$jscoverage['/runtime.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['183'] = [];
  _$jscoverage['/runtime.js'].branchData['183'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['183'][1].init(1060, 11, 'isTopRender');
function visit90_183_1(result) {
  _$jscoverage['/runtime.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['177'][1].init(834, 13, 'extendTplName');
function visit89_177_1(result) {
  _$jscoverage['/runtime.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['171'][1].init(563, 26, 'tpl.TPL_NAME && !self.name');
function visit88_171_1(result) {
  _$jscoverage['/runtime.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['169'][1].init(490, 13, 'payload || {}');
function visit87_169_1(result) {
  _$jscoverage['/runtime.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['164'][1].init(28, 85, 'callback || function(error, ret) {\n  html = ret;\n}');
function visit86_164_1(result) {
  _$jscoverage['/runtime.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['163'][1].init(271, 7, '!buffer');
function visit85_163_1(result) {
  _$jscoverage['/runtime.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['159'][2].init(149, 20, 'root && root.isScope');
function visit84_159_2(result) {
  _$jscoverage['/runtime.js'].branchData['159'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['159'][1].init(147, 23, '!(root && root.isScope)');
function visit83_159_1(result) {
  _$jscoverage['/runtime.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['142'][1].init(69, 21, 'config.commands || {}');
function visit82_142_1(result) {
  _$jscoverage['/runtime.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['130'][1].init(55, 15, 'config.commands');
function visit81_130_1(result) {
  _$jscoverage['/runtime.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['116'][1].init(62, 4, '!tpl');
function visit80_116_1(result) {
  _$jscoverage['/runtime.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(134, 11, 'config.name');
function visit79_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['65'][1].init(67, 12, 'config || {}');
function visit78_65_1(result) {
  _$jscoverage['/runtime.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['41'][1].init(147, 8, 'command1');
function visit77_41_1(result) {
  _$jscoverage['/runtime.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['28'][1].init(58, 4, '!cmd');
function visit76_28_1(result) {
  _$jscoverage['/runtime.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['26'][1].init(65, 7, 'i < len');
function visit75_26_1(result) {
  _$jscoverage['/runtime.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['24'][1].init(257, 3, 'cmd');
function visit74_24_1(result) {
  _$jscoverage['/runtime.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][2].init(181, 40, 'localCommands && localCommands[parts[0]]');
function visit73_23_2(result) {
  _$jscoverage['/runtime.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][1].init(181, 62, 'localCommands && localCommands[parts[0]] || commands[parts[0]]');
function visit72_23_1(result) {
  _$jscoverage['/runtime.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][2].init(20, 36, 'localCommands && localCommands[name]');
function visit71_20_2(result) {
  _$jscoverage['/runtime.js'].branchData['20'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][1].init(20, 54, 'localCommands && localCommands[name] || commands[name]');
function visit70_20_1(result) {
  _$jscoverage['/runtime.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['19'][1].init(13, 24, 'name.indexOf(\'.\') === -1');
function visit69_19_1(result) {
  _$jscoverage['/runtime.js'].branchData['19'][1].ranCondition(result);
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
  _$jscoverage['/runtime.js'].lineData[18]++;
  function findCommand(localCommands, name) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[19]++;
    if (visit69_19_1(name.indexOf('.') === -1)) {
      _$jscoverage['/runtime.js'].lineData[20]++;
      return visit70_20_1(visit71_20_2(localCommands && localCommands[name]) || commands[name]);
    }
    _$jscoverage['/runtime.js'].lineData[22]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[23]++;
    var cmd = visit72_23_1(visit73_23_2(localCommands && localCommands[parts[0]]) || commands[parts[0]]);
    _$jscoverage['/runtime.js'].lineData[24]++;
    if (visit74_24_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[25]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[26]++;
      for (var i = 1; visit75_26_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[27]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[28]++;
        if (visit76_28_1(!cmd)) {
          _$jscoverage['/runtime.js'].lineData[29]++;
          break;
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[33]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[36]++;
  var utils = {
  'callCommand': function(engine, scope, option, buffer, name, line) {
  _$jscoverage['/runtime.js'].functionData[2]++;
  _$jscoverage['/runtime.js'].lineData[38]++;
  var commands = engine.config.commands;
  _$jscoverage['/runtime.js'].lineData[39]++;
  var error;
  _$jscoverage['/runtime.js'].lineData[40]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[41]++;
  if (visit77_41_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[42]++;
    return command1.call(engine, scope, option, buffer);
  } else {
    _$jscoverage['/runtime.js'].lineData[44]++;
    error = 'in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line;
    _$jscoverage['/runtime.js'].lineData[45]++;
    S.error(error);
  }
  _$jscoverage['/runtime.js'].lineData[47]++;
  return buffer;
}};
  _$jscoverage['/runtime.js'].lineData[62]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[63]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[64]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[65]++;
    config = visit78_65_1(config || {});
    _$jscoverage['/runtime.js'].lineData[67]++;
    if (visit79_67_1(config.name)) {
      _$jscoverage['/runtime.js'].lineData[68]++;
      self.name = config.name;
    }
    _$jscoverage['/runtime.js'].lineData[70]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[73]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[87]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[98]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[102]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[115]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[116]++;
  if (visit80_116_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[117]++;
    S.error('template "' + subTplName + '" does not exist, need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[119]++;
  var engine = new this.constructor(tpl, this.config);
  _$jscoverage['/runtime.js'].lineData[120]++;
  engine.name = subTplName;
  _$jscoverage['/runtime.js'].lineData[121]++;
  return engine;
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[129]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[130]++;
  if (visit81_130_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[131]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[141]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[142]++;
  config.commands = visit82_142_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[143]++;
  config.commands[commandName] = fn;
}, 
  render: function(data, callback, buffer, payload) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[155]++;
  var root = data;
  _$jscoverage['/runtime.js'].lineData[156]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[157]++;
  var tpl = self.tpl;
  _$jscoverage['/runtime.js'].lineData[158]++;
  var isTopRender = !payload;
  _$jscoverage['/runtime.js'].lineData[159]++;
  if (visit83_159_1(!(visit84_159_2(root && root.isScope)))) {
    _$jscoverage['/runtime.js'].lineData[160]++;
    root = new Scope(data);
  }
  _$jscoverage['/runtime.js'].lineData[162]++;
  var html = '';
  _$jscoverage['/runtime.js'].lineData[163]++;
  if (visit85_163_1(!buffer)) {
    _$jscoverage['/runtime.js'].lineData[164]++;
    callback = visit86_164_1(callback || function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[165]++;
  html = ret;
});
    _$jscoverage['/runtime.js'].lineData[167]++;
    buffer = new LinkedBuffer(callback).head;
  }
  _$jscoverage['/runtime.js'].lineData[169]++;
  payload = visit87_169_1(payload || {});
  _$jscoverage['/runtime.js'].lineData[170]++;
  payload.extendTplName = null;
  _$jscoverage['/runtime.js'].lineData[171]++;
  if (visit88_171_1(tpl.TPL_NAME && !self.name)) {
    _$jscoverage['/runtime.js'].lineData[172]++;
    self.name = tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[174]++;
  buffer = tpl.call(self, root, S, buffer, payload);
  _$jscoverage['/runtime.js'].lineData[175]++;
  var extendTplName = payload.extendTplName;
  _$jscoverage['/runtime.js'].lineData[177]++;
  if (visit89_177_1(extendTplName)) {
    _$jscoverage['/runtime.js'].lineData[178]++;
    nativeCommands.include.call(self, root, {
  params: [extendTplName]}, buffer, payload);
  }
  _$jscoverage['/runtime.js'].lineData[183]++;
  if (visit90_183_1(isTopRender)) {
    _$jscoverage['/runtime.js'].lineData[184]++;
    buffer.end();
    _$jscoverage['/runtime.js'].lineData[185]++;
    return html;
  } else {
    _$jscoverage['/runtime.js'].lineData[188]++;
    return buffer;
  }
}};
  _$jscoverage['/runtime.js'].lineData[193]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[195]++;
  return XTemplateRuntime;
});
