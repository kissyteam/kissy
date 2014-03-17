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
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[25] = 0;
  _$jscoverage['/runtime.js'].lineData[26] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[43] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[46] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[53] = 0;
  _$jscoverage['/runtime.js'].lineData[55] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[81] = 0;
  _$jscoverage['/runtime.js'].lineData[95] = 0;
  _$jscoverage['/runtime.js'].lineData[106] = 0;
  _$jscoverage['/runtime.js'].lineData[110] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[125] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[128] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[137] = 0;
  _$jscoverage['/runtime.js'].lineData[138] = 0;
  _$jscoverage['/runtime.js'].lineData[139] = 0;
  _$jscoverage['/runtime.js'].lineData[149] = 0;
  _$jscoverage['/runtime.js'].lineData[150] = 0;
  _$jscoverage['/runtime.js'].lineData[151] = 0;
  _$jscoverage['/runtime.js'].lineData[161] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[164] = 0;
  _$jscoverage['/runtime.js'].lineData[166] = 0;
  _$jscoverage['/runtime.js'].lineData[167] = 0;
  _$jscoverage['/runtime.js'].lineData[168] = 0;
  _$jscoverage['/runtime.js'].lineData[169] = 0;
  _$jscoverage['/runtime.js'].lineData[171] = 0;
  _$jscoverage['/runtime.js'].lineData[172] = 0;
  _$jscoverage['/runtime.js'].lineData[174] = 0;
  _$jscoverage['/runtime.js'].lineData[175] = 0;
  _$jscoverage['/runtime.js'].lineData[179] = 0;
  _$jscoverage['/runtime.js'].lineData[184] = 0;
  _$jscoverage['/runtime.js'].lineData[186] = 0;
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
  _$jscoverage['/runtime.js'].branchData['18'] = [];
  _$jscoverage['/runtime.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['19'] = [];
  _$jscoverage['/runtime.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['22'] = [];
  _$jscoverage['/runtime.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['23'] = [];
  _$jscoverage['/runtime.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['25'] = [];
  _$jscoverage['/runtime.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['27'] = [];
  _$jscoverage['/runtime.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['37'] = [];
  _$jscoverage['/runtime.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['46'] = [];
  _$jscoverage['/runtime.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['73'] = [];
  _$jscoverage['/runtime.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['75'] = [];
  _$jscoverage['/runtime.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['124'] = [];
  _$jscoverage['/runtime.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['138'] = [];
  _$jscoverage['/runtime.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['150'] = [];
  _$jscoverage['/runtime.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['163'] = [];
  _$jscoverage['/runtime.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['166'] = [];
  _$jscoverage['/runtime.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['168'] = [];
  _$jscoverage['/runtime.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['174'] = [];
  _$jscoverage['/runtime.js'].branchData['174'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['174'][1].init(520, 13, 'extendTplName');
function visit86_174_1(result) {
  _$jscoverage['/runtime.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['168'][1].init(251, 31, 'self.tpl.TPL_NAME && !self.name');
function visit85_168_1(result) {
  _$jscoverage['/runtime.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['166'][1].init(178, 13, 'payload || {}');
function visit84_166_1(result) {
  _$jscoverage['/runtime.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['163'][2].init(77, 20, 'root && root.isScope');
function visit83_163_2(result) {
  _$jscoverage['/runtime.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['163'][1].init(75, 23, '!(root && root.isScope)');
function visit82_163_1(result) {
  _$jscoverage['/runtime.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['150'][1].init(69, 21, 'config.commands || {}');
function visit81_150_1(result) {
  _$jscoverage['/runtime.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['138'][1].init(55, 15, 'config.commands');
function visit80_138_1(result) {
  _$jscoverage['/runtime.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['124'][1].init(62, 4, '!tpl');
function visit79_124_1(result) {
  _$jscoverage['/runtime.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['75'][1].init(134, 11, 'config.name');
function visit78_75_1(result) {
  _$jscoverage['/runtime.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['73'][1].init(67, 12, 'config || {}');
function visit77_73_1(result) {
  _$jscoverage['/runtime.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['46'][1].init(150, 8, 'command1');
function visit76_46_1(result) {
  _$jscoverage['/runtime.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][2].init(25, 9, 'str !== 0');
function visit75_37_2(result) {
  _$jscoverage['/runtime.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][1].init(17, 17, '!str && str !== 0');
function visit74_37_1(result) {
  _$jscoverage['/runtime.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['27'][1].init(58, 4, '!cmd');
function visit73_27_1(result) {
  _$jscoverage['/runtime.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['25'][1].init(65, 7, 'i < len');
function visit72_25_1(result) {
  _$jscoverage['/runtime.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][1].init(257, 3, 'cmd');
function visit71_23_1(result) {
  _$jscoverage['/runtime.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['22'][2].init(181, 40, 'localCommands && localCommands[parts[0]]');
function visit70_22_2(result) {
  _$jscoverage['/runtime.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['22'][1].init(181, 62, 'localCommands && localCommands[parts[0]] || commands[parts[0]]');
function visit69_22_1(result) {
  _$jscoverage['/runtime.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['19'][2].init(20, 36, 'localCommands && localCommands[name]');
function visit68_19_2(result) {
  _$jscoverage['/runtime.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['19'][1].init(20, 54, 'localCommands && localCommands[name] || commands[name]');
function visit67_19_1(result) {
  _$jscoverage['/runtime.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['18'][1].init(13, 24, 'name.indexOf(\'.\') === -1');
function visit66_18_1(result) {
  _$jscoverage['/runtime.js'].branchData['18'][1].ranCondition(result);
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
  _$jscoverage['/runtime.js'].lineData[17]++;
  function findCommand(localCommands, name) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[18]++;
    if (visit66_18_1(name.indexOf('.') === -1)) {
      _$jscoverage['/runtime.js'].lineData[19]++;
      return visit67_19_1(visit68_19_2(localCommands && localCommands[name]) || commands[name]);
    }
    _$jscoverage['/runtime.js'].lineData[21]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[22]++;
    var cmd = visit69_22_1(visit70_22_2(localCommands && localCommands[parts[0]]) || commands[parts[0]]);
    _$jscoverage['/runtime.js'].lineData[23]++;
    if (visit71_23_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[24]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[25]++;
      for (var i = 1; visit72_25_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[26]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[27]++;
        if (visit73_27_1(!cmd)) {
          _$jscoverage['/runtime.js'].lineData[28]++;
          break;
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[32]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[35]++;
  var utils = {
  'normalizeOutput': function(str) {
  _$jscoverage['/runtime.js'].functionData[2]++;
  _$jscoverage['/runtime.js'].lineData[37]++;
  if (visit74_37_1(!str && visit75_37_2(str !== 0))) {
    _$jscoverage['/runtime.js'].lineData[38]++;
    return '';
  }
  _$jscoverage['/runtime.js'].lineData[40]++;
  return str;
}, 
  'callCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[3]++;
  _$jscoverage['/runtime.js'].lineData[43]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[44]++;
  var commands = engine.config.commands;
  _$jscoverage['/runtime.js'].lineData[45]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[46]++;
  if (visit76_46_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[47]++;
    try {
      _$jscoverage['/runtime.js'].lineData[48]++;
      ret = command1.call(engine, scope, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[50]++;
  S.error('in file: ' + engine.name + ' ' + e.message + ': "' + name + '" at line ' + line);
}
  } else {
    _$jscoverage['/runtime.js'].lineData[53]++;
    S.error('in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line);
  }
  _$jscoverage['/runtime.js'].lineData[55]++;
  return ret;
}};
  _$jscoverage['/runtime.js'].lineData[70]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[71]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[72]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[73]++;
    config = visit77_73_1(config || {});
    _$jscoverage['/runtime.js'].lineData[75]++;
    if (visit78_75_1(config.name)) {
      _$jscoverage['/runtime.js'].lineData[76]++;
      self.name = config.name;
    }
    _$jscoverage['/runtime.js'].lineData[78]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[81]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[95]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[106]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[110]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[123]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[124]++;
  if (visit79_124_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[125]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[127]++;
  var engine = new this.constructor(tpl, this.config);
  _$jscoverage['/runtime.js'].lineData[128]++;
  engine.name = subTplName;
  _$jscoverage['/runtime.js'].lineData[129]++;
  return engine;
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[137]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[138]++;
  if (visit80_138_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[139]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[149]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[150]++;
  config.commands = visit81_150_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[151]++;
  config.commands[commandName] = fn;
}, 
  render: function(data, payload) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[161]++;
  var root = data;
  _$jscoverage['/runtime.js'].lineData[162]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[163]++;
  if (visit82_163_1(!(visit83_163_2(root && root.isScope)))) {
    _$jscoverage['/runtime.js'].lineData[164]++;
    root = new Scope(data);
  }
  _$jscoverage['/runtime.js'].lineData[166]++;
  payload = visit84_166_1(payload || {});
  _$jscoverage['/runtime.js'].lineData[167]++;
  payload.extendTplName = null;
  _$jscoverage['/runtime.js'].lineData[168]++;
  if (visit85_168_1(self.tpl.TPL_NAME && !self.name)) {
    _$jscoverage['/runtime.js'].lineData[169]++;
    self.name = self.tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[171]++;
  var html = self.tpl(root, S, payload);
  _$jscoverage['/runtime.js'].lineData[172]++;
  var extendTplName = payload.extendTplName;
  _$jscoverage['/runtime.js'].lineData[174]++;
  if (visit86_174_1(extendTplName)) {
    _$jscoverage['/runtime.js'].lineData[175]++;
    return nativeCommands.include.call(self, root, {
  params: [extendTplName]}, payload);
  } else {
    _$jscoverage['/runtime.js'].lineData[179]++;
    return html;
  }
}};
  _$jscoverage['/runtime.js'].lineData[184]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[186]++;
  return XTemplateRuntime;
});
