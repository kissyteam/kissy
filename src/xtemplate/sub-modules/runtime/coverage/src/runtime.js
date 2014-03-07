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
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[100] = 0;
  _$jscoverage['/runtime.js'].lineData[104] = 0;
  _$jscoverage['/runtime.js'].lineData[117] = 0;
  _$jscoverage['/runtime.js'].lineData[118] = 0;
  _$jscoverage['/runtime.js'].lineData[119] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[122] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[131] = 0;
  _$jscoverage['/runtime.js'].lineData[132] = 0;
  _$jscoverage['/runtime.js'].lineData[133] = 0;
  _$jscoverage['/runtime.js'].lineData[143] = 0;
  _$jscoverage['/runtime.js'].lineData[144] = 0;
  _$jscoverage['/runtime.js'].lineData[145] = 0;
  _$jscoverage['/runtime.js'].lineData[155] = 0;
  _$jscoverage['/runtime.js'].lineData[156] = 0;
  _$jscoverage['/runtime.js'].lineData[157] = 0;
  _$jscoverage['/runtime.js'].lineData[158] = 0;
  _$jscoverage['/runtime.js'].lineData[160] = 0;
  _$jscoverage['/runtime.js'].lineData[161] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[165] = 0;
  _$jscoverage['/runtime.js'].lineData[166] = 0;
  _$jscoverage['/runtime.js'].lineData[168] = 0;
  _$jscoverage['/runtime.js'].lineData[169] = 0;
  _$jscoverage['/runtime.js'].lineData[173] = 0;
  _$jscoverage['/runtime.js'].lineData[178] = 0;
  _$jscoverage['/runtime.js'].lineData[180] = 0;
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
  _$jscoverage['/runtime.js'].branchData['40'] = [];
  _$jscoverage['/runtime.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['67'] = [];
  _$jscoverage['/runtime.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['69'] = [];
  _$jscoverage['/runtime.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['118'] = [];
  _$jscoverage['/runtime.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['132'] = [];
  _$jscoverage['/runtime.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['144'] = [];
  _$jscoverage['/runtime.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['157'] = [];
  _$jscoverage['/runtime.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['157'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['160'] = [];
  _$jscoverage['/runtime.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['162'] = [];
  _$jscoverage['/runtime.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['168'] = [];
  _$jscoverage['/runtime.js'].branchData['168'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['168'][1].init(520, 13, 'extendTplName');
function visit84_168_1(result) {
  _$jscoverage['/runtime.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['162'][1].init(251, 31, 'self.tpl.TPL_NAME && !self.name');
function visit83_162_1(result) {
  _$jscoverage['/runtime.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['160'][1].init(178, 13, 'payload || {}');
function visit82_160_1(result) {
  _$jscoverage['/runtime.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['157'][2].init(77, 20, 'root && root.isScope');
function visit81_157_2(result) {
  _$jscoverage['/runtime.js'].branchData['157'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['157'][1].init(75, 23, '!(root && root.isScope)');
function visit80_157_1(result) {
  _$jscoverage['/runtime.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['144'][1].init(69, 21, 'config.commands || {}');
function visit79_144_1(result) {
  _$jscoverage['/runtime.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['132'][1].init(55, 15, 'config.commands');
function visit78_132_1(result) {
  _$jscoverage['/runtime.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['118'][1].init(62, 4, '!tpl');
function visit77_118_1(result) {
  _$jscoverage['/runtime.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['69'][1].init(134, 11, 'config.name');
function visit76_69_1(result) {
  _$jscoverage['/runtime.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(67, 12, 'config || {}');
function visit75_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['40'][1].init(150, 8, 'command1');
function visit74_40_1(result) {
  _$jscoverage['/runtime.js'].branchData['40'][1].ranCondition(result);
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
  'callCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[2]++;
  _$jscoverage['/runtime.js'].lineData[37]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[38]++;
  var commands = engine.config.commands;
  _$jscoverage['/runtime.js'].lineData[39]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[40]++;
  if (visit74_40_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[41]++;
    try {
      _$jscoverage['/runtime.js'].lineData[42]++;
      ret = command1.call(engine, scope, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[44]++;
  S.error('in file: ' + engine.name + ' ' + e.message + ': "' + name + '" at line ' + line);
}
  } else {
    _$jscoverage['/runtime.js'].lineData[47]++;
    S.error('in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line);
  }
  _$jscoverage['/runtime.js'].lineData[49]++;
  return ret;
}};
  _$jscoverage['/runtime.js'].lineData[64]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[65]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[66]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[67]++;
    config = visit75_67_1(config || {});
    _$jscoverage['/runtime.js'].lineData[69]++;
    if (visit76_69_1(config.name)) {
      _$jscoverage['/runtime.js'].lineData[70]++;
      self.name = config.name;
    }
    _$jscoverage['/runtime.js'].lineData[72]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[75]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[89]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[100]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[104]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[117]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[118]++;
  if (visit77_118_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[119]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[121]++;
  var engine = new this.constructor(tpl, this.config);
  _$jscoverage['/runtime.js'].lineData[122]++;
  engine.name = subTplName;
  _$jscoverage['/runtime.js'].lineData[123]++;
  return engine;
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[131]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[132]++;
  if (visit78_132_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[133]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[143]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[144]++;
  config.commands = visit79_144_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[145]++;
  config.commands[commandName] = fn;
}, 
  render: function(data, payload) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[155]++;
  var root = data;
  _$jscoverage['/runtime.js'].lineData[156]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[157]++;
  if (visit80_157_1(!(visit81_157_2(root && root.isScope)))) {
    _$jscoverage['/runtime.js'].lineData[158]++;
    root = new Scope(data);
  }
  _$jscoverage['/runtime.js'].lineData[160]++;
  payload = visit82_160_1(payload || {});
  _$jscoverage['/runtime.js'].lineData[161]++;
  payload.extendTplName = null;
  _$jscoverage['/runtime.js'].lineData[162]++;
  if (visit83_162_1(self.tpl.TPL_NAME && !self.name)) {
    _$jscoverage['/runtime.js'].lineData[163]++;
    self.name = self.tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[165]++;
  var html = self.tpl(root, S, payload);
  _$jscoverage['/runtime.js'].lineData[166]++;
  var extendTplName = payload.extendTplName;
  _$jscoverage['/runtime.js'].lineData[168]++;
  if (visit84_168_1(extendTplName)) {
    _$jscoverage['/runtime.js'].lineData[169]++;
    return nativeCommands.include.call(self, root, {
  params: [extendTplName]}, payload);
  } else {
    _$jscoverage['/runtime.js'].lineData[173]++;
    return html;
  }
}};
  _$jscoverage['/runtime.js'].lineData[178]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[180]++;
  return XTemplateRuntime;
});
