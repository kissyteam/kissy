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
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[30] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[43] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[53] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[56] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[62] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[85] = 0;
  _$jscoverage['/runtime.js'].lineData[86] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[92] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[97] = 0;
  _$jscoverage['/runtime.js'].lineData[98] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[103] = 0;
  _$jscoverage['/runtime.js'].lineData[106] = 0;
  _$jscoverage['/runtime.js'].lineData[107] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[145] = 0;
  _$jscoverage['/runtime.js'].lineData[146] = 0;
  _$jscoverage['/runtime.js'].lineData[147] = 0;
  _$jscoverage['/runtime.js'].lineData[149] = 0;
  _$jscoverage['/runtime.js'].lineData[158] = 0;
  _$jscoverage['/runtime.js'].lineData[159] = 0;
  _$jscoverage['/runtime.js'].lineData[160] = 0;
  _$jscoverage['/runtime.js'].lineData[161] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[164] = 0;
  _$jscoverage['/runtime.js'].lineData[165] = 0;
  _$jscoverage['/runtime.js'].lineData[168] = 0;
  _$jscoverage['/runtime.js'].lineData[182] = 0;
  _$jscoverage['/runtime.js'].lineData[193] = 0;
  _$jscoverage['/runtime.js'].lineData[197] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[210] = 0;
  _$jscoverage['/runtime.js'].lineData[219] = 0;
  _$jscoverage['/runtime.js'].lineData[228] = 0;
  _$jscoverage['/runtime.js'].lineData[229] = 0;
  _$jscoverage['/runtime.js'].lineData[230] = 0;
  _$jscoverage['/runtime.js'].lineData[232] = 0;
  _$jscoverage['/runtime.js'].lineData[236] = 0;
  _$jscoverage['/runtime.js'].lineData[238] = 0;
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
  _$jscoverage['/runtime.js'].functionData[14] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['21'] = [];
  _$jscoverage['/runtime.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['23'] = [];
  _$jscoverage['/runtime.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['40'] = [];
  _$jscoverage['/runtime.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['41'] = [];
  _$jscoverage['/runtime.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['43'] = [];
  _$jscoverage['/runtime.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['50'] = [];
  _$jscoverage['/runtime.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['53'] = [];
  _$jscoverage['/runtime.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['68'] = [];
  _$jscoverage['/runtime.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['75'] = [];
  _$jscoverage['/runtime.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['78'] = [];
  _$jscoverage['/runtime.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['87'] = [];
  _$jscoverage['/runtime.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['97'] = [];
  _$jscoverage['/runtime.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['106'] = [];
  _$jscoverage['/runtime.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['109'] = [];
  _$jscoverage['/runtime.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['146'] = [];
  _$jscoverage['/runtime.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['164'] = [];
  _$jscoverage['/runtime.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['229'] = [];
  _$jscoverage['/runtime.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['229'][2] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['229'][2].init(48, 20, 'root && root.isScope');
function visit63_229_2(result) {
  _$jscoverage['/runtime.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['229'][1].init(46, 23, '!(root && root.isScope)');
function visit62_229_1(result) {
  _$jscoverage['/runtime.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['164'][1].init(215, 19, 'config.macros || {}');
function visit61_164_1(result) {
  _$jscoverage['/runtime.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['146'][1].init(70, 4, '!tpl');
function visit60_146_1(result) {
  _$jscoverage['/runtime.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['109'][1].init(1176, 13, 'escape && id0');
function visit59_109_1(result) {
  _$jscoverage['/runtime.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['106'][2].init(1084, 17, 'id0 === undefined');
function visit58_106_2(result) {
  _$jscoverage['/runtime.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['106'][1].init(1062, 39, '!preserveUndefined && id0 === undefined');
function visit57_106_1(result) {
  _$jscoverage['/runtime.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['97'][1].init(89, 14, 'tmp2 === false');
function visit56_97_1(result) {
  _$jscoverage['/runtime.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['87'][1].init(258, 8, 'command1');
function visit55_87_1(result) {
  _$jscoverage['/runtime.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['78'][1].init(113, 14, 'escaped && exp');
function visit54_78_1(result) {
  _$jscoverage['/runtime.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['75'][1].init(21, 17, 'exp === undefined');
function visit53_75_1(result) {
  _$jscoverage['/runtime.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['68'][1].init(1505, 17, 'ret === undefined');
function visit52_68_1(result) {
  _$jscoverage['/runtime.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['53'][1].init(576, 28, 'typeof property === \'object\'');
function visit51_53_1(result) {
  _$jscoverage['/runtime.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['50'][1].init(440, 19, 'S.isArray(property)');
function visit50_50_1(result) {
  _$jscoverage['/runtime.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['43'][1].init(94, 18, 'property === false');
function visit49_43_1(result) {
  _$jscoverage['/runtime.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['41'][1].init(25, 32, '!options.params && !options.hash');
function visit48_41_1(result) {
  _$jscoverage['/runtime.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['40'][1].init(232, 8, '!command');
function visit47_40_1(result) {
  _$jscoverage['/runtime.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][1].init(50, 4, '!cmd');
function visit46_23_1(result) {
  _$jscoverage['/runtime.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['21'][1].init(122, 7, 'i < len');
function visit45_21_1(result) {
  _$jscoverage['/runtime.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var commands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[8]++;
  var Scope = require('./runtime/scope');
  _$jscoverage['/runtime.js'].lineData[10]++;
  var escapeHtml = S.escapeHtml;
  _$jscoverage['/runtime.js'].lineData[11]++;
  var logger = S.getLogger('s/xtemplate');
  _$jscoverage['/runtime.js'].lineData[13]++;
  function info(s) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[14]++;
    logger.info(s);
  }
  _$jscoverage['/runtime.js'].lineData[17]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[18]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[19]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[20]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[21]++;
    for (var i = 0; visit45_21_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[22]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[23]++;
      if (visit46_23_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[24]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[27]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[30]++;
  function getProperty(name, scope, depth) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[31]++;
    return scope.resolve(name, depth);
  }
  _$jscoverage['/runtime.js'].lineData[34]++;
  var utils = {
  'runBlockCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[36]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[37]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[38]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[39]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[40]++;
  if (visit47_40_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[41]++;
    if (visit48_41_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[42]++;
      var property = getProperty(name, scope);
      _$jscoverage['/runtime.js'].lineData[43]++;
      if (visit49_43_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[44]++;
        logFn('can not find property: "' + name + '" at line ' + line);
        _$jscoverage['/runtime.js'].lineData[45]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[47]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[49]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[50]++;
      if (visit50_50_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[51]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[53]++;
        if (visit51_53_1(typeof property === 'object')) {
          _$jscoverage['/runtime.js'].lineData[54]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[56]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[58]++;
      S.error('can not find command module: ' + name + '" at line ' + line);
      _$jscoverage['/runtime.js'].lineData[59]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[62]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[63]++;
  try {
    _$jscoverage['/runtime.js'].lineData[64]++;
    ret = command.call(engine, scope, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[66]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
}
  _$jscoverage['/runtime.js'].lineData[68]++;
  if (visit52_68_1(ret === undefined)) {
    _$jscoverage['/runtime.js'].lineData[69]++;
    ret = '';
  }
  _$jscoverage['/runtime.js'].lineData[71]++;
  return ret;
}, 
  'getExpression': function(exp, escaped) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[75]++;
  if (visit53_75_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[76]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[78]++;
  return visit54_78_1(escaped && exp) ? escapeHtml(exp) : exp;
}, 
  'getPropertyOrRunCommand': function(engine, scope, options, name, depth, line, escape, preserveUndefined) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[82]++;
  var id0;
  _$jscoverage['/runtime.js'].lineData[83]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[84]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[85]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[86]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[87]++;
  if (visit55_87_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[88]++;
    try {
      _$jscoverage['/runtime.js'].lineData[89]++;
      id0 = command1.call(engine, scope, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[91]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
  _$jscoverage['/runtime.js'].lineData[92]++;
  return '';
}
  } else {
    _$jscoverage['/runtime.js'].lineData[96]++;
    var tmp2 = getProperty(name, scope, depth);
    _$jscoverage['/runtime.js'].lineData[97]++;
    if (visit56_97_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[98]++;
      logFn('can not find property: "' + name + '" at line ' + line, 'warn');
      _$jscoverage['/runtime.js'].lineData[101]++;
      return preserveUndefined ? undefined : '';
    } else {
      _$jscoverage['/runtime.js'].lineData[103]++;
      id0 = tmp2[0];
    }
  }
  _$jscoverage['/runtime.js'].lineData[106]++;
  if (visit57_106_1(!preserveUndefined && visit58_106_2(id0 === undefined))) {
    _$jscoverage['/runtime.js'].lineData[107]++;
    id0 = '';
  }
  _$jscoverage['/runtime.js'].lineData[109]++;
  return visit59_109_1(escape && id0) ? escapeHtml(id0) : id0;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[145]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[146]++;
  if (visit60_146_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[147]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[149]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[158]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[8]++;
    _$jscoverage['/runtime.js'].lineData[159]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[160]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[161]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[162]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[163]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[164]++;
    config.macros = visit61_164_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[165]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[168]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[182]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[193]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[197]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scope, config) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[202]++;
  return new this.constructor(tpl, config).render(scope, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[210]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[219]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[228]++;
  var root = data;
  _$jscoverage['/runtime.js'].lineData[229]++;
  if (visit62_229_1(!(visit63_229_2(root && root.isScope)))) {
    _$jscoverage['/runtime.js'].lineData[230]++;
    root = new Scope(data);
  }
  _$jscoverage['/runtime.js'].lineData[232]++;
  return this.tpl(root, S);
}};
  _$jscoverage['/runtime.js'].lineData[236]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[238]++;
  return XTemplateRuntime;
});
