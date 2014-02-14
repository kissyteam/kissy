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
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[26] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[30] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[52] = 0;
  _$jscoverage['/runtime.js'].lineData[53] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[55] = 0;
  _$jscoverage['/runtime.js'].lineData[56] = 0;
  _$jscoverage['/runtime.js'].lineData[57] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[62] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[80] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[86] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[92] = 0;
  _$jscoverage['/runtime.js'].lineData[95] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[97] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[105] = 0;
  _$jscoverage['/runtime.js'].lineData[106] = 0;
  _$jscoverage['/runtime.js'].lineData[108] = 0;
  _$jscoverage['/runtime.js'].lineData[112] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[119] = 0;
  _$jscoverage['/runtime.js'].lineData[120] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[133] = 0;
  _$jscoverage['/runtime.js'].lineData[135] = 0;
  _$jscoverage['/runtime.js'].lineData[136] = 0;
  _$jscoverage['/runtime.js'].lineData[139] = 0;
  _$jscoverage['/runtime.js'].lineData[140] = 0;
  _$jscoverage['/runtime.js'].lineData[143] = 0;
  _$jscoverage['/runtime.js'].lineData[179] = 0;
  _$jscoverage['/runtime.js'].lineData[180] = 0;
  _$jscoverage['/runtime.js'].lineData[181] = 0;
  _$jscoverage['/runtime.js'].lineData[183] = 0;
  _$jscoverage['/runtime.js'].lineData[192] = 0;
  _$jscoverage['/runtime.js'].lineData[193] = 0;
  _$jscoverage['/runtime.js'].lineData[194] = 0;
  _$jscoverage['/runtime.js'].lineData[195] = 0;
  _$jscoverage['/runtime.js'].lineData[196] = 0;
  _$jscoverage['/runtime.js'].lineData[197] = 0;
  _$jscoverage['/runtime.js'].lineData[198] = 0;
  _$jscoverage['/runtime.js'].lineData[199] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[216] = 0;
  _$jscoverage['/runtime.js'].lineData[227] = 0;
  _$jscoverage['/runtime.js'].lineData[231] = 0;
  _$jscoverage['/runtime.js'].lineData[236] = 0;
  _$jscoverage['/runtime.js'].lineData[244] = 0;
  _$jscoverage['/runtime.js'].lineData[253] = 0;
  _$jscoverage['/runtime.js'].lineData[262] = 0;
  _$jscoverage['/runtime.js'].lineData[263] = 0;
  _$jscoverage['/runtime.js'].lineData[264] = 0;
  _$jscoverage['/runtime.js'].lineData[266] = 0;
  _$jscoverage['/runtime.js'].lineData[270] = 0;
  _$jscoverage['/runtime.js'].lineData[272] = 0;
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
  _$jscoverage['/runtime.js'].functionData[15] = 0;
  _$jscoverage['/runtime.js'].functionData[16] = 0;
  _$jscoverage['/runtime.js'].functionData[17] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['20'] = [];
  _$jscoverage['/runtime.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['22'] = [];
  _$jscoverage['/runtime.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['34'] = [];
  _$jscoverage['/runtime.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['44'] = [];
  _$jscoverage['/runtime.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['57'] = [];
  _$jscoverage['/runtime.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['73'] = [];
  _$jscoverage['/runtime.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['74'] = [];
  _$jscoverage['/runtime.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['76'] = [];
  _$jscoverage['/runtime.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['83'] = [];
  _$jscoverage['/runtime.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['86'] = [];
  _$jscoverage['/runtime.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['105'] = [];
  _$jscoverage['/runtime.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['108'] = [];
  _$jscoverage['/runtime.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['120'] = [];
  _$jscoverage['/runtime.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['129'] = [];
  _$jscoverage['/runtime.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['135'] = [];
  _$jscoverage['/runtime.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['139'] = [];
  _$jscoverage['/runtime.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['180'] = [];
  _$jscoverage['/runtime.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['198'] = [];
  _$jscoverage['/runtime.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['263'] = [];
  _$jscoverage['/runtime.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['263'][2] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['263'][2].init(48, 20, 'root && root.isScope');
function visit66_263_2(result) {
  _$jscoverage['/runtime.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['263'][1].init(46, 23, '!(root && root.isScope)');
function visit65_263_1(result) {
  _$jscoverage['/runtime.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['198'][1].init(215, 19, 'config.macros || {}');
function visit64_198_1(result) {
  _$jscoverage['/runtime.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['180'][1].init(70, 4, '!tpl');
function visit63_180_1(result) {
  _$jscoverage['/runtime.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['139'][1].init(434, 12, '!onlyCommand');
function visit62_139_1(result) {
  _$jscoverage['/runtime.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['135'][1].init(273, 8, 'ret.find');
function visit61_135_1(result) {
  _$jscoverage['/runtime.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['129'][1].init(66, 30, 'options.hash || options.params');
function visit60_129_1(result) {
  _$jscoverage['/runtime.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['120'][1].init(185, 8, 'ret.find');
function visit59_120_1(result) {
  _$jscoverage['/runtime.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['108'][1].init(113, 14, 'escaped && exp');
function visit58_108_1(result) {
  _$jscoverage['/runtime.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['105'][1].init(21, 17, 'exp === undefined');
function visit57_105_1(result) {
  _$jscoverage['/runtime.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['86'][1].init(571, 28, 'typeof property === \'object\'');
function visit56_86_1(result) {
  _$jscoverage['/runtime.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['83'][1].init(435, 19, 'S.isArray(property)');
function visit55_83_1(result) {
  _$jscoverage['/runtime.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['76'][1].init(89, 18, 'property === false');
function visit54_76_1(result) {
  _$jscoverage['/runtime.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['74'][1].init(25, 32, '!options.params && !options.hash');
function visit53_74_1(result) {
  _$jscoverage['/runtime.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['73'][1].init(232, 8, '!command');
function visit52_73_1(result) {
  _$jscoverage['/runtime.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][1].init(165, 14, 'tmp2 === false');
function visit51_57_1(result) {
  _$jscoverage['/runtime.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['44'][1].init(473, 11, 'onlyCommand');
function visit50_44_1(result) {
  _$jscoverage['/runtime.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['34'][1].init(158, 8, 'command1');
function visit49_34_1(result) {
  _$jscoverage['/runtime.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['22'][1].init(50, 4, '!cmd');
function visit48_22_1(result) {
  _$jscoverage['/runtime.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][1].init(122, 7, 'i < len');
function visit47_20_1(result) {
  _$jscoverage['/runtime.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var commands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[8]++;
  var Scope = require('./runtime/scope');
  _$jscoverage['/runtime.js'].lineData[9]++;
  var escapeHtml = S.escapeHtml;
  _$jscoverage['/runtime.js'].lineData[10]++;
  var logger = S.getLogger('s/xtemplate');
  _$jscoverage['/runtime.js'].lineData[12]++;
  function info(s) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[13]++;
    logger.info(s);
  }
  _$jscoverage['/runtime.js'].lineData[16]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[17]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[18]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[19]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[20]++;
    for (var i = 0; visit47_20_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[21]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[22]++;
      if (visit48_22_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[23]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[26]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[29]++;
  function runInlineCommand(engine, scope, options, name, line, onlyCommand) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[30]++;
    var id0;
    _$jscoverage['/runtime.js'].lineData[31]++;
    var config = engine.config;
    _$jscoverage['/runtime.js'].lineData[32]++;
    var commands = config.commands;
    _$jscoverage['/runtime.js'].lineData[33]++;
    var command1 = findCommand(commands, name);
    _$jscoverage['/runtime.js'].lineData[34]++;
    if (visit49_34_1(command1)) {
      _$jscoverage['/runtime.js'].lineData[35]++;
      try {
        _$jscoverage['/runtime.js'].lineData[36]++;
        id0 = command1.call(engine, scope, options);
      }      catch (e) {
  _$jscoverage['/runtime.js'].lineData[38]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
}
      _$jscoverage['/runtime.js'].lineData[40]++;
      return {
  find: true, 
  value: id0};
    } else {
      _$jscoverage['/runtime.js'].lineData[44]++;
      if (visit50_44_1(onlyCommand)) {
        _$jscoverage['/runtime.js'].lineData[45]++;
        S.error('can not find command: ' + name + '" at line ' + line);
      }
    }
    _$jscoverage['/runtime.js'].lineData[47]++;
    return {
  find: false};
  }
  _$jscoverage['/runtime.js'].lineData[52]++;
  function getProperty(engine, scope, name, depth, line) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[53]++;
    var id0;
    _$jscoverage['/runtime.js'].lineData[54]++;
    var config = engine.config;
    _$jscoverage['/runtime.js'].lineData[55]++;
    var logFn = config.silent ? info : S.error;
    _$jscoverage['/runtime.js'].lineData[56]++;
    var tmp2 = scope.resolve(name, depth);
    _$jscoverage['/runtime.js'].lineData[57]++;
    if (visit51_57_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[58]++;
      logFn('can not find property: "' + name + '" at line ' + line, 'warn');
    } else {
      _$jscoverage['/runtime.js'].lineData[62]++;
      id0 = tmp2[0];
    }
    _$jscoverage['/runtime.js'].lineData[64]++;
    return id0;
  }
  _$jscoverage['/runtime.js'].lineData[67]++;
  var utils = {
  'runBlockCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[69]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[70]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[71]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[72]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[73]++;
  if (visit52_73_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[74]++;
    if (visit53_74_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[75]++;
      var property = scope.resolve(name);
      _$jscoverage['/runtime.js'].lineData[76]++;
      if (visit54_76_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[77]++;
        logFn('can not find property: "' + name + '" at line ' + line);
        _$jscoverage['/runtime.js'].lineData[78]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[80]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[82]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[83]++;
      if (visit55_83_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[84]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[86]++;
        if (visit56_86_1(typeof property === 'object')) {
          _$jscoverage['/runtime.js'].lineData[87]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[89]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[91]++;
      S.error('can not find command: ' + name + '" at line ' + line);
      _$jscoverage['/runtime.js'].lineData[92]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[95]++;
  var ret;
  _$jscoverage['/runtime.js'].lineData[96]++;
  try {
    _$jscoverage['/runtime.js'].lineData[97]++;
    ret = command.call(engine, scope, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[99]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
}
  _$jscoverage['/runtime.js'].lineData[101]++;
  return ret;
}, 
  'renderOutput': function(exp, escaped) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[105]++;
  if (visit57_105_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[106]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[108]++;
  return visit58_108_1(escaped && exp) ? escapeHtml(exp) : exp;
}, 
  'getProperty': function(engine, scope, name, depth, line) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[112]++;
  return getProperty(engine, scope, name, depth, line);
}, 
  'runInlineCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[116]++;
  var id0 = '', ret;
  _$jscoverage['/runtime.js'].lineData[119]++;
  ret = runInlineCommand(engine, scope, options, name, line);
  _$jscoverage['/runtime.js'].lineData[120]++;
  if (visit59_120_1(ret.find)) {
    _$jscoverage['/runtime.js'].lineData[121]++;
    id0 = ret.value;
  }
  _$jscoverage['/runtime.js'].lineData[123]++;
  return id0;
}, 
  'getPropertyOrRunCommand': function(engine, scope, options, name, depth, line) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[127]++;
  var id0, ret;
  _$jscoverage['/runtime.js'].lineData[129]++;
  var onlyCommand = visit60_129_1(options.hash || options.params);
  _$jscoverage['/runtime.js'].lineData[133]++;
  ret = runInlineCommand(engine, scope, options, name, line, onlyCommand);
  _$jscoverage['/runtime.js'].lineData[135]++;
  if (visit61_135_1(ret.find)) {
    _$jscoverage['/runtime.js'].lineData[136]++;
    id0 = ret.value;
  } else {
    _$jscoverage['/runtime.js'].lineData[139]++;
    if (visit62_139_1(!onlyCommand)) {
      _$jscoverage['/runtime.js'].lineData[140]++;
      id0 = getProperty(engine, scope, name, depth, line);
    }
  }
  _$jscoverage['/runtime.js'].lineData[143]++;
  return id0;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[179]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[180]++;
  if (visit63_180_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[181]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[183]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[192]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[11]++;
    _$jscoverage['/runtime.js'].lineData[193]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[194]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[195]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[196]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[197]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[198]++;
    config.macros = visit64_198_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[199]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[202]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[216]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[227]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[231]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scope, config) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[236]++;
  return new this.constructor(tpl, config).render(scope, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[15]++;
  _$jscoverage['/runtime.js'].lineData[244]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[16]++;
  _$jscoverage['/runtime.js'].lineData[253]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data) {
  _$jscoverage['/runtime.js'].functionData[17]++;
  _$jscoverage['/runtime.js'].lineData[262]++;
  var root = data;
  _$jscoverage['/runtime.js'].lineData[263]++;
  if (visit65_263_1(!(visit66_263_2(root && root.isScope)))) {
    _$jscoverage['/runtime.js'].lineData[264]++;
    root = new Scope(data);
  }
  _$jscoverage['/runtime.js'].lineData[266]++;
  return this.tpl(root, S);
}};
  _$jscoverage['/runtime.js'].lineData[270]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[272]++;
  return XTemplateRuntime;
});
