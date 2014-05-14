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
if (! _$jscoverage['/timer.js']) {
  _$jscoverage['/timer.js'] = {};
  _$jscoverage['/timer.js'].lineData = [];
  _$jscoverage['/timer.js'].lineData[6] = 0;
  _$jscoverage['/timer.js'].lineData[7] = 0;
  _$jscoverage['/timer.js'].lineData[8] = 0;
  _$jscoverage['/timer.js'].lineData[9] = 0;
  _$jscoverage['/timer.js'].lineData[10] = 0;
  _$jscoverage['/timer.js'].lineData[11] = 0;
  _$jscoverage['/timer.js'].lineData[12] = 0;
  _$jscoverage['/timer.js'].lineData[13] = 0;
  _$jscoverage['/timer.js'].lineData[14] = 0;
  _$jscoverage['/timer.js'].lineData[16] = 0;
  _$jscoverage['/timer.js'].lineData[17] = 0;
  _$jscoverage['/timer.js'].lineData[19] = 0;
  _$jscoverage['/timer.js'].lineData[20] = 0;
  _$jscoverage['/timer.js'].lineData[21] = 0;
  _$jscoverage['/timer.js'].lineData[22] = 0;
  _$jscoverage['/timer.js'].lineData[24] = 0;
  _$jscoverage['/timer.js'].lineData[27] = 0;
  _$jscoverage['/timer.js'].lineData[29] = 0;
  _$jscoverage['/timer.js'].lineData[33] = 0;
  _$jscoverage['/timer.js'].lineData[35] = 0;
  _$jscoverage['/timer.js'].lineData[36] = 0;
  _$jscoverage['/timer.js'].lineData[37] = 0;
  _$jscoverage['/timer.js'].lineData[38] = 0;
  _$jscoverage['/timer.js'].lineData[43] = 0;
  _$jscoverage['/timer.js'].lineData[44] = 0;
  _$jscoverage['/timer.js'].lineData[47] = 0;
  _$jscoverage['/timer.js'].lineData[48] = 0;
  _$jscoverage['/timer.js'].lineData[49] = 0;
  _$jscoverage['/timer.js'].lineData[50] = 0;
  _$jscoverage['/timer.js'].lineData[52] = 0;
  _$jscoverage['/timer.js'].lineData[54] = 0;
  _$jscoverage['/timer.js'].lineData[55] = 0;
  _$jscoverage['/timer.js'].lineData[57] = 0;
  _$jscoverage['/timer.js'].lineData[58] = 0;
  _$jscoverage['/timer.js'].lineData[63] = 0;
  _$jscoverage['/timer.js'].lineData[66] = 0;
  _$jscoverage['/timer.js'].lineData[70] = 0;
  _$jscoverage['/timer.js'].lineData[81] = 0;
  _$jscoverage['/timer.js'].lineData[82] = 0;
  _$jscoverage['/timer.js'].lineData[86] = 0;
  _$jscoverage['/timer.js'].lineData[87] = 0;
  _$jscoverage['/timer.js'].lineData[88] = 0;
  _$jscoverage['/timer.js'].lineData[89] = 0;
  _$jscoverage['/timer.js'].lineData[97] = 0;
  _$jscoverage['/timer.js'].lineData[99] = 0;
  _$jscoverage['/timer.js'].lineData[101] = 0;
  _$jscoverage['/timer.js'].lineData[103] = 0;
  _$jscoverage['/timer.js'].lineData[104] = 0;
  _$jscoverage['/timer.js'].lineData[105] = 0;
  _$jscoverage['/timer.js'].lineData[107] = 0;
  _$jscoverage['/timer.js'].lineData[108] = 0;
  _$jscoverage['/timer.js'].lineData[109] = 0;
  _$jscoverage['/timer.js'].lineData[112] = 0;
  _$jscoverage['/timer.js'].lineData[113] = 0;
  _$jscoverage['/timer.js'].lineData[115] = 0;
  _$jscoverage['/timer.js'].lineData[116] = 0;
  _$jscoverage['/timer.js'].lineData[117] = 0;
  _$jscoverage['/timer.js'].lineData[119] = 0;
  _$jscoverage['/timer.js'].lineData[121] = 0;
  _$jscoverage['/timer.js'].lineData[122] = 0;
  _$jscoverage['/timer.js'].lineData[126] = 0;
  _$jscoverage['/timer.js'].lineData[127] = 0;
  _$jscoverage['/timer.js'].lineData[131] = 0;
  _$jscoverage['/timer.js'].lineData[132] = 0;
  _$jscoverage['/timer.js'].lineData[133] = 0;
  _$jscoverage['/timer.js'].lineData[134] = 0;
  _$jscoverage['/timer.js'].lineData[135] = 0;
  _$jscoverage['/timer.js'].lineData[141] = 0;
  _$jscoverage['/timer.js'].lineData[147] = 0;
  _$jscoverage['/timer.js'].lineData[148] = 0;
  _$jscoverage['/timer.js'].lineData[149] = 0;
  _$jscoverage['/timer.js'].lineData[150] = 0;
  _$jscoverage['/timer.js'].lineData[152] = 0;
  _$jscoverage['/timer.js'].lineData[153] = 0;
  _$jscoverage['/timer.js'].lineData[155] = 0;
  _$jscoverage['/timer.js'].lineData[157] = 0;
  _$jscoverage['/timer.js'].lineData[163] = 0;
  _$jscoverage['/timer.js'].lineData[164] = 0;
  _$jscoverage['/timer.js'].lineData[166] = 0;
  _$jscoverage['/timer.js'].lineData[171] = 0;
  _$jscoverage['/timer.js'].lineData[176] = 0;
  _$jscoverage['/timer.js'].lineData[177] = 0;
  _$jscoverage['/timer.js'].lineData[178] = 0;
  _$jscoverage['/timer.js'].lineData[179] = 0;
  _$jscoverage['/timer.js'].lineData[180] = 0;
  _$jscoverage['/timer.js'].lineData[182] = 0;
  _$jscoverage['/timer.js'].lineData[183] = 0;
  _$jscoverage['/timer.js'].lineData[190] = 0;
  _$jscoverage['/timer.js'].lineData[195] = 0;
  _$jscoverage['/timer.js'].lineData[198] = 0;
  _$jscoverage['/timer.js'].lineData[200] = 0;
  _$jscoverage['/timer.js'].lineData[203] = 0;
  _$jscoverage['/timer.js'].lineData[205] = 0;
}
if (! _$jscoverage['/timer.js'].functionData) {
  _$jscoverage['/timer.js'].functionData = [];
  _$jscoverage['/timer.js'].functionData[0] = 0;
  _$jscoverage['/timer.js'].functionData[1] = 0;
  _$jscoverage['/timer.js'].functionData[2] = 0;
  _$jscoverage['/timer.js'].functionData[3] = 0;
  _$jscoverage['/timer.js'].functionData[4] = 0;
  _$jscoverage['/timer.js'].functionData[5] = 0;
  _$jscoverage['/timer.js'].functionData[6] = 0;
  _$jscoverage['/timer.js'].functionData[7] = 0;
  _$jscoverage['/timer.js'].functionData[8] = 0;
  _$jscoverage['/timer.js'].functionData[9] = 0;
}
if (! _$jscoverage['/timer.js'].branchData) {
  _$jscoverage['/timer.js'].branchData = {};
  _$jscoverage['/timer.js'].branchData['21'] = [];
  _$jscoverage['/timer.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['37'] = [];
  _$jscoverage['/timer.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['47'] = [];
  _$jscoverage['/timer.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['57'] = [];
  _$jscoverage['/timer.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['81'] = [];
  _$jscoverage['/timer.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['107'] = [];
  _$jscoverage['/timer.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['112'] = [];
  _$jscoverage['/timer.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['112'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['120'] = [];
  _$jscoverage['/timer.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['126'] = [];
  _$jscoverage['/timer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['127'] = [];
  _$jscoverage['/timer.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['152'] = [];
  _$jscoverage['/timer.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['155'] = [];
  _$jscoverage['/timer.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['161'] = [];
  _$jscoverage['/timer.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['164'] = [];
  _$jscoverage['/timer.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['177'] = [];
  _$jscoverage['/timer.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['182'] = [];
  _$jscoverage['/timer.js'].branchData['182'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['182'][1].init(163, 2, 'fx');
function visit102_182_1(result) {
  _$jscoverage['/timer.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['177'][1].init(195, 6, 'finish');
function visit101_177_1(result) {
  _$jscoverage['/timer.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['164'][1].init(912, 3, 'end');
function visit100_164_1(result) {
  _$jscoverage['/timer.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['161'][1].init(218, 25, 'remaining / duration || 0');
function visit99_161_1(result) {
  _$jscoverage['/timer.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['155'][1].init(295, 12, 'fx.pos === 1');
function visit98_155_1(result) {
  _$jscoverage['/timer.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['152'][1].init(181, 38, 'self.isRejected() || self.isResolved()');
function visit97_152_1(result) {
  _$jscoverage['/timer.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['127'][1].init(33, 19, 'parts[1] === \'-=\'');
function visit96_127_1(result) {
  _$jscoverage['/timer.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['126'][1].init(729, 8, 'parts[1]');
function visit95_126_1(result) {
  _$jscoverage['/timer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['120'][1].init(234, 12, 'tmpCur === 0');
function visit94_120_1(result) {
  _$jscoverage['/timer.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['112'][3].init(158, 13, 'unit !== \'px\'');
function visit93_112_3(result) {
  _$jscoverage['/timer.js'].branchData['112'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['112'][2].init(158, 21, 'unit !== \'px\' && from');
function visit92_112_2(result) {
  _$jscoverage['/timer.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['112'][1].init(150, 29, 'unit && unit !== \'px\' && from');
function visit91_112_1(result) {
  _$jscoverage['/timer.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['107'][1].init(614, 5, 'parts');
function visit90_107_1(result) {
  _$jscoverage['/timer.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['81'][1].init(1810, 24, 'util.isPlainObject(node)');
function visit89_81_1(result) {
  _$jscoverage['/timer.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['57'][1].init(83, 19, '!(sh in _propsData)');
function visit88_57_1(result) {
  _$jscoverage['/timer.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['47'][1].init(125, 9, '_propData');
function visit87_47_1(result) {
  _$jscoverage['/timer.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['37'][1].init(132, 36, 'typeof _propData.easing === \'string\'');
function visit86_37_1(result) {
  _$jscoverage['/timer.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['21'][1].init(40, 29, '!(self instanceof TimerAnim)');
function visit85_21_1(result) {
  _$jscoverage['/timer.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer.js'].functionData[0]++;
  _$jscoverage['/timer.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/timer.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/timer.js'].lineData[9]++;
  var AnimBase = require('./base');
  _$jscoverage['/timer.js'].lineData[10]++;
  var Easing = require('./timer/easing');
  _$jscoverage['/timer.js'].lineData[11]++;
  var AM = require('./timer/manager');
  _$jscoverage['/timer.js'].lineData[12]++;
  var Fx = require('./timer/fx');
  _$jscoverage['/timer.js'].lineData[13]++;
  require('./timer/color');
  _$jscoverage['/timer.js'].lineData[14]++;
  require('./timer/transform');
  _$jscoverage['/timer.js'].lineData[16]++;
  var SHORT_HANDS = require('./timer/short-hand');
  _$jscoverage['/timer.js'].lineData[17]++;
  var NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
  _$jscoverage['/timer.js'].lineData[19]++;
  function TimerAnim(node, to, duration, easing, complete) {
    _$jscoverage['/timer.js'].functionData[1]++;
    _$jscoverage['/timer.js'].lineData[20]++;
    var self = this;
    _$jscoverage['/timer.js'].lineData[21]++;
    if (visit85_21_1(!(self instanceof TimerAnim))) {
      _$jscoverage['/timer.js'].lineData[22]++;
      return new TimerAnim(node, to, duration, easing, complete);
    }
    _$jscoverage['/timer.js'].lineData[24]++;
    TimerAnim.superclass.constructor.apply(self, arguments);
  }
  _$jscoverage['/timer.js'].lineData[27]++;
  util.extend(TimerAnim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[29]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[33]++;
  util.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[35]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[36]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[37]++;
  if (visit86_37_1(typeof _propData.easing === 'string')) {
    _$jscoverage['/timer.js'].lineData[38]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[43]++;
  util.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[44]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/timer.js'].lineData[47]++;
  if (visit87_47_1(_propData)) {
    _$jscoverage['/timer.js'].lineData[48]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[49]++;
    origin = {};
    _$jscoverage['/timer.js'].lineData[50]++;
    util.each(shortHands, function(sh) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[52]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/timer.js'].lineData[54]++;
    Dom.css(node, p, val);
    _$jscoverage['/timer.js'].lineData[55]++;
    util.each(origin, function(val, sh) {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[57]++;
  if (visit88_57_1(!(sh in _propsData))) {
    _$jscoverage['/timer.js'].lineData[58]++;
    _propsData[sh] = util.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/timer.js'].lineData[63]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/timer.js'].lineData[66]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/timer.js'].lineData[70]++;
  var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
  _$jscoverage['/timer.js'].lineData[81]++;
  if (visit89_81_1(util.isPlainObject(node))) {
    _$jscoverage['/timer.js'].lineData[82]++;
    isCustomFx = 1;
  }
  _$jscoverage['/timer.js'].lineData[86]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[87]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[88]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[89]++;
    propCfg = {
  isCustomFx: isCustomFx, 
  prop: prop, 
  anim: self, 
  fxType: _propData.fxType, 
  type: _propData.type, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[97]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[99]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[101]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[103]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[104]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[105]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[107]++;
    if (visit90_107_1(parts)) {
      _$jscoverage['/timer.js'].lineData[108]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[109]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[112]++;
      if (visit91_112_1(unit && visit92_112_2(visit93_112_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[113]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[115]++;
        do {
          _$jscoverage['/timer.js'].lineData[116]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[117]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[119]++;
          tmpCur = fx.cur();
        } while (visit94_120_1(tmpCur === 0));
        _$jscoverage['/timer.js'].lineData[121]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[122]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[126]++;
      if (visit95_126_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[127]++;
        to = ((visit96_127_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[131]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[132]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[133]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[134]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[135]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[7]++;
  _$jscoverage['/timer.js'].lineData[141]++;
  var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[147]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[148]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[149]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[150]++;
    fx.frame();
    _$jscoverage['/timer.js'].lineData[152]++;
    if (visit97_152_1(self.isRejected() || self.isResolved())) {
      _$jscoverage['/timer.js'].lineData[153]++;
      return;
    }
    _$jscoverage['/timer.js'].lineData[155]++;
    end &= visit98_155_1(fx.pos === 1);
  }
  _$jscoverage['/timer.js'].lineData[157]++;
  var currentTime = util.now(), duration = self.config.duration * 1000, remaining = Math.max(0, self.startTime + duration - currentTime), temp = visit99_161_1(remaining / duration || 0), percent = 1 - temp;
  _$jscoverage['/timer.js'].lineData[163]++;
  self.defer.notify([self, percent, remaining]);
  _$jscoverage['/timer.js'].lineData[164]++;
  if (visit100_164_1(end)) {
    _$jscoverage['/timer.js'].lineData[166]++;
    self.stop(end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[8]++;
  _$jscoverage['/timer.js'].lineData[171]++;
  var self = this, prop, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[176]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[177]++;
  if (visit101_177_1(finish)) {
    _$jscoverage['/timer.js'].lineData[178]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[179]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[180]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[182]++;
      if (visit102_182_1(fx)) {
        _$jscoverage['/timer.js'].lineData[183]++;
        fx.frame(1);
      }
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[9]++;
  _$jscoverage['/timer.js'].lineData[190]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[195]++;
  TimerAnim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[198]++;
  TimerAnim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[200]++;
  util.mix(TimerAnim, AnimBase.Statics);
  _$jscoverage['/timer.js'].lineData[203]++;
  S.Anim = TimerAnim;
  _$jscoverage['/timer.js'].lineData[205]++;
  return TimerAnim;
});
