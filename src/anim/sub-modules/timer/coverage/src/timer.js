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
  _$jscoverage['/timer.js'].lineData[19] = 0;
  _$jscoverage['/timer.js'].lineData[20] = 0;
  _$jscoverage['/timer.js'].lineData[21] = 0;
  _$jscoverage['/timer.js'].lineData[22] = 0;
  _$jscoverage['/timer.js'].lineData[24] = 0;
  _$jscoverage['/timer.js'].lineData[26] = 0;
  _$jscoverage['/timer.js'].lineData[27] = 0;
  _$jscoverage['/timer.js'].lineData[28] = 0;
  _$jscoverage['/timer.js'].lineData[29] = 0;
  _$jscoverage['/timer.js'].lineData[30] = 0;
  _$jscoverage['/timer.js'].lineData[35] = 0;
  _$jscoverage['/timer.js'].lineData[37] = 0;
  _$jscoverage['/timer.js'].lineData[41] = 0;
  _$jscoverage['/timer.js'].lineData[43] = 0;
  _$jscoverage['/timer.js'].lineData[44] = 0;
  _$jscoverage['/timer.js'].lineData[45] = 0;
  _$jscoverage['/timer.js'].lineData[46] = 0;
  _$jscoverage['/timer.js'].lineData[51] = 0;
  _$jscoverage['/timer.js'].lineData[52] = 0;
  _$jscoverage['/timer.js'].lineData[55] = 0;
  _$jscoverage['/timer.js'].lineData[56] = 0;
  _$jscoverage['/timer.js'].lineData[57] = 0;
  _$jscoverage['/timer.js'].lineData[58] = 0;
  _$jscoverage['/timer.js'].lineData[60] = 0;
  _$jscoverage['/timer.js'].lineData[62] = 0;
  _$jscoverage['/timer.js'].lineData[63] = 0;
  _$jscoverage['/timer.js'].lineData[65] = 0;
  _$jscoverage['/timer.js'].lineData[66] = 0;
  _$jscoverage['/timer.js'].lineData[71] = 0;
  _$jscoverage['/timer.js'].lineData[74] = 0;
  _$jscoverage['/timer.js'].lineData[78] = 0;
  _$jscoverage['/timer.js'].lineData[89] = 0;
  _$jscoverage['/timer.js'].lineData[90] = 0;
  _$jscoverage['/timer.js'].lineData[94] = 0;
  _$jscoverage['/timer.js'].lineData[95] = 0;
  _$jscoverage['/timer.js'].lineData[96] = 0;
  _$jscoverage['/timer.js'].lineData[97] = 0;
  _$jscoverage['/timer.js'].lineData[105] = 0;
  _$jscoverage['/timer.js'].lineData[107] = 0;
  _$jscoverage['/timer.js'].lineData[109] = 0;
  _$jscoverage['/timer.js'].lineData[111] = 0;
  _$jscoverage['/timer.js'].lineData[112] = 0;
  _$jscoverage['/timer.js'].lineData[113] = 0;
  _$jscoverage['/timer.js'].lineData[115] = 0;
  _$jscoverage['/timer.js'].lineData[116] = 0;
  _$jscoverage['/timer.js'].lineData[117] = 0;
  _$jscoverage['/timer.js'].lineData[120] = 0;
  _$jscoverage['/timer.js'].lineData[121] = 0;
  _$jscoverage['/timer.js'].lineData[123] = 0;
  _$jscoverage['/timer.js'].lineData[124] = 0;
  _$jscoverage['/timer.js'].lineData[125] = 0;
  _$jscoverage['/timer.js'].lineData[127] = 0;
  _$jscoverage['/timer.js'].lineData[129] = 0;
  _$jscoverage['/timer.js'].lineData[130] = 0;
  _$jscoverage['/timer.js'].lineData[134] = 0;
  _$jscoverage['/timer.js'].lineData[135] = 0;
  _$jscoverage['/timer.js'].lineData[139] = 0;
  _$jscoverage['/timer.js'].lineData[140] = 0;
  _$jscoverage['/timer.js'].lineData[141] = 0;
  _$jscoverage['/timer.js'].lineData[142] = 0;
  _$jscoverage['/timer.js'].lineData[143] = 0;
  _$jscoverage['/timer.js'].lineData[149] = 0;
  _$jscoverage['/timer.js'].lineData[155] = 0;
  _$jscoverage['/timer.js'].lineData[156] = 0;
  _$jscoverage['/timer.js'].lineData[157] = 0;
  _$jscoverage['/timer.js'].lineData[158] = 0;
  _$jscoverage['/timer.js'].lineData[160] = 0;
  _$jscoverage['/timer.js'].lineData[161] = 0;
  _$jscoverage['/timer.js'].lineData[163] = 0;
  _$jscoverage['/timer.js'].lineData[165] = 0;
  _$jscoverage['/timer.js'].lineData[171] = 0;
  _$jscoverage['/timer.js'].lineData[172] = 0;
  _$jscoverage['/timer.js'].lineData[174] = 0;
  _$jscoverage['/timer.js'].lineData[179] = 0;
  _$jscoverage['/timer.js'].lineData[184] = 0;
  _$jscoverage['/timer.js'].lineData[185] = 0;
  _$jscoverage['/timer.js'].lineData[186] = 0;
  _$jscoverage['/timer.js'].lineData[187] = 0;
  _$jscoverage['/timer.js'].lineData[188] = 0;
  _$jscoverage['/timer.js'].lineData[190] = 0;
  _$jscoverage['/timer.js'].lineData[191] = 0;
  _$jscoverage['/timer.js'].lineData[198] = 0;
  _$jscoverage['/timer.js'].lineData[202] = 0;
  _$jscoverage['/timer.js'].lineData[205] = 0;
  _$jscoverage['/timer.js'].lineData[207] = 0;
  _$jscoverage['/timer.js'].lineData[209] = 0;
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
  _$jscoverage['/timer.js'].functionData[10] = 0;
}
if (! _$jscoverage['/timer.js'].branchData) {
  _$jscoverage['/timer.js'].branchData = {};
  _$jscoverage['/timer.js'].branchData['21'] = [];
  _$jscoverage['/timer.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['28'] = [];
  _$jscoverage['/timer.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['45'] = [];
  _$jscoverage['/timer.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['55'] = [];
  _$jscoverage['/timer.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['65'] = [];
  _$jscoverage['/timer.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['89'] = [];
  _$jscoverage['/timer.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['115'] = [];
  _$jscoverage['/timer.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['120'] = [];
  _$jscoverage['/timer.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['120'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['128'] = [];
  _$jscoverage['/timer.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['134'] = [];
  _$jscoverage['/timer.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['135'] = [];
  _$jscoverage['/timer.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['160'] = [];
  _$jscoverage['/timer.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['163'] = [];
  _$jscoverage['/timer.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['169'] = [];
  _$jscoverage['/timer.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['172'] = [];
  _$jscoverage['/timer.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['185'] = [];
  _$jscoverage['/timer.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['190'] = [];
  _$jscoverage['/timer.js'].branchData['190'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['190'][1].init(159, 2, 'fx');
function visit103_190_1(result) {
  _$jscoverage['/timer.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['185'][1].init(188, 6, 'finish');
function visit102_185_1(result) {
  _$jscoverage['/timer.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['172'][1].init(881, 3, 'end');
function visit101_172_1(result) {
  _$jscoverage['/timer.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['169'][1].init(207, 25, 'remaining / duration || 0');
function visit100_169_1(result) {
  _$jscoverage['/timer.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['163'][1].init(287, 12, 'fx.pos === 1');
function visit99_163_1(result) {
  _$jscoverage['/timer.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['160'][1].init(176, 38, 'self.isRejected() || self.isResolved()');
function visit98_160_1(result) {
  _$jscoverage['/timer.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['135'][1].init(33, 19, 'parts[1] === \'-=\'');
function visit97_135_1(result) {
  _$jscoverage['/timer.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['134'][1].init(710, 8, 'parts[1]');
function visit96_134_1(result) {
  _$jscoverage['/timer.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['128'][1].init(229, 12, 'tmpCur === 0');
function visit95_128_1(result) {
  _$jscoverage['/timer.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['120'][3].init(153, 13, 'unit !== \'px\'');
function visit94_120_3(result) {
  _$jscoverage['/timer.js'].branchData['120'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['120'][2].init(153, 21, 'unit !== \'px\' && from');
function visit93_120_2(result) {
  _$jscoverage['/timer.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['120'][1].init(145, 29, 'unit && unit !== \'px\' && from');
function visit92_120_1(result) {
  _$jscoverage['/timer.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['115'][1].init(593, 5, 'parts');
function visit91_115_1(result) {
  _$jscoverage['/timer.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['89'][1].init(1742, 21, 'S.isPlainObject(node)');
function visit90_89_1(result) {
  _$jscoverage['/timer.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['65'][1].init(81, 19, '!(sh in _propsData)');
function visit89_65_1(result) {
  _$jscoverage['/timer.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['55'][1].init(121, 9, '_propData');
function visit88_55_1(result) {
  _$jscoverage['/timer.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['45'][1].init(128, 36, 'typeof _propData.easing === \'string\'');
function visit87_45_1(result) {
  _$jscoverage['/timer.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['28'][1].init(62, 18, 'prop !== camelProp');
function visit86_28_1(result) {
  _$jscoverage['/timer.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['21'][1].init(38, 29, '!(self instanceof TimerAnim)');
function visit85_21_1(result) {
  _$jscoverage['/timer.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer.js'].functionData[0]++;
  _$jscoverage['/timer.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/timer.js'].lineData[8]++;
  var AnimBase = require('./base');
  _$jscoverage['/timer.js'].lineData[9]++;
  var Easing = require('./timer/easing');
  _$jscoverage['/timer.js'].lineData[10]++;
  var AM = require('./timer/manager');
  _$jscoverage['/timer.js'].lineData[11]++;
  var Fx = require('./timer/fx');
  _$jscoverage['/timer.js'].lineData[12]++;
  var SHORT_HANDS = require('./timer/short-hand');
  _$jscoverage['/timer.js'].lineData[13]++;
  require('./timer/color');
  _$jscoverage['/timer.js'].lineData[14]++;
  require('./timer/transform');
  _$jscoverage['/timer.js'].lineData[16]++;
  var camelCase = Dom._camelCase, NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
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
    _$jscoverage['/timer.js'].lineData[26]++;
    S.each(to = self.config.to, function(v, prop) {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[27]++;
  var camelProp = camelCase(prop);
  _$jscoverage['/timer.js'].lineData[28]++;
  if (visit86_28_1(prop !== camelProp)) {
    _$jscoverage['/timer.js'].lineData[29]++;
    to[camelProp] = to[prop];
    _$jscoverage['/timer.js'].lineData[30]++;
    delete to[prop];
  }
});
  }
  _$jscoverage['/timer.js'].lineData[35]++;
  S.extend(TimerAnim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[37]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[41]++;
  S.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[43]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[44]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[45]++;
  if (visit87_45_1(typeof _propData.easing === 'string')) {
    _$jscoverage['/timer.js'].lineData[46]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[51]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[52]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/timer.js'].lineData[55]++;
  if (visit88_55_1(_propData)) {
    _$jscoverage['/timer.js'].lineData[56]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[57]++;
    origin = {};
    _$jscoverage['/timer.js'].lineData[58]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[60]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/timer.js'].lineData[62]++;
    Dom.css(node, p, val);
    _$jscoverage['/timer.js'].lineData[63]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/timer.js'].functionData[7]++;
  _$jscoverage['/timer.js'].lineData[65]++;
  if (visit89_65_1(!(sh in _propsData))) {
    _$jscoverage['/timer.js'].lineData[66]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/timer.js'].lineData[71]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/timer.js'].lineData[74]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/timer.js'].lineData[78]++;
  var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
  _$jscoverage['/timer.js'].lineData[89]++;
  if (visit90_89_1(S.isPlainObject(node))) {
    _$jscoverage['/timer.js'].lineData[90]++;
    isCustomFx = 1;
  }
  _$jscoverage['/timer.js'].lineData[94]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[95]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[96]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[97]++;
    propCfg = {
  isCustomFx: isCustomFx, 
  prop: prop, 
  anim: self, 
  fxType: _propData.fxType, 
  type: _propData.type, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[105]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[107]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[109]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[111]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[112]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[113]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[115]++;
    if (visit91_115_1(parts)) {
      _$jscoverage['/timer.js'].lineData[116]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[117]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[120]++;
      if (visit92_120_1(unit && visit93_120_2(visit94_120_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[121]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[123]++;
        do {
          _$jscoverage['/timer.js'].lineData[124]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[125]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[127]++;
          tmpCur = fx.cur();
        } while (visit95_128_1(tmpCur === 0));
        _$jscoverage['/timer.js'].lineData[129]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[130]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[134]++;
      if (visit96_134_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[135]++;
        to = ((visit97_135_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[139]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[140]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[141]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[142]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[143]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[8]++;
  _$jscoverage['/timer.js'].lineData[149]++;
  var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[155]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[156]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[157]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[158]++;
    fx.frame();
    _$jscoverage['/timer.js'].lineData[160]++;
    if (visit98_160_1(self.isRejected() || self.isResolved())) {
      _$jscoverage['/timer.js'].lineData[161]++;
      return;
    }
    _$jscoverage['/timer.js'].lineData[163]++;
    end &= visit99_163_1(fx.pos === 1);
  }
  _$jscoverage['/timer.js'].lineData[165]++;
  var currentTime = S.now(), duration = self.config.duration * 1000, remaining = Math.max(0, self.startTime + duration - currentTime), temp = visit100_169_1(remaining / duration || 0), percent = 1 - temp;
  _$jscoverage['/timer.js'].lineData[171]++;
  self.defer.notify([self, percent, remaining]);
  _$jscoverage['/timer.js'].lineData[172]++;
  if (visit101_172_1(end)) {
    _$jscoverage['/timer.js'].lineData[174]++;
    self.stop(end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[9]++;
  _$jscoverage['/timer.js'].lineData[179]++;
  var self = this, prop, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[184]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[185]++;
  if (visit102_185_1(finish)) {
    _$jscoverage['/timer.js'].lineData[186]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[187]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[188]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[190]++;
      if (visit103_190_1(fx)) {
        _$jscoverage['/timer.js'].lineData[191]++;
        fx.frame(1);
      }
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[10]++;
  _$jscoverage['/timer.js'].lineData[198]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[202]++;
  TimerAnim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[205]++;
  TimerAnim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[207]++;
  S.mix(TimerAnim, AnimBase.Statics);
  _$jscoverage['/timer.js'].lineData[209]++;
  return TimerAnim;
});
