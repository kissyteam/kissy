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
  _$jscoverage['/timer.js'].lineData[22] = 0;
  _$jscoverage['/timer.js'].lineData[24] = 0;
  _$jscoverage['/timer.js'].lineData[25] = 0;
  _$jscoverage['/timer.js'].lineData[26] = 0;
  _$jscoverage['/timer.js'].lineData[27] = 0;
  _$jscoverage['/timer.js'].lineData[28] = 0;
  _$jscoverage['/timer.js'].lineData[33] = 0;
  _$jscoverage['/timer.js'].lineData[35] = 0;
  _$jscoverage['/timer.js'].lineData[39] = 0;
  _$jscoverage['/timer.js'].lineData[41] = 0;
  _$jscoverage['/timer.js'].lineData[42] = 0;
  _$jscoverage['/timer.js'].lineData[43] = 0;
  _$jscoverage['/timer.js'].lineData[44] = 0;
  _$jscoverage['/timer.js'].lineData[49] = 0;
  _$jscoverage['/timer.js'].lineData[50] = 0;
  _$jscoverage['/timer.js'].lineData[53] = 0;
  _$jscoverage['/timer.js'].lineData[54] = 0;
  _$jscoverage['/timer.js'].lineData[55] = 0;
  _$jscoverage['/timer.js'].lineData[56] = 0;
  _$jscoverage['/timer.js'].lineData[58] = 0;
  _$jscoverage['/timer.js'].lineData[60] = 0;
  _$jscoverage['/timer.js'].lineData[61] = 0;
  _$jscoverage['/timer.js'].lineData[63] = 0;
  _$jscoverage['/timer.js'].lineData[64] = 0;
  _$jscoverage['/timer.js'].lineData[69] = 0;
  _$jscoverage['/timer.js'].lineData[72] = 0;
  _$jscoverage['/timer.js'].lineData[76] = 0;
  _$jscoverage['/timer.js'].lineData[87] = 0;
  _$jscoverage['/timer.js'].lineData[88] = 0;
  _$jscoverage['/timer.js'].lineData[92] = 0;
  _$jscoverage['/timer.js'].lineData[93] = 0;
  _$jscoverage['/timer.js'].lineData[94] = 0;
  _$jscoverage['/timer.js'].lineData[95] = 0;
  _$jscoverage['/timer.js'].lineData[103] = 0;
  _$jscoverage['/timer.js'].lineData[105] = 0;
  _$jscoverage['/timer.js'].lineData[107] = 0;
  _$jscoverage['/timer.js'].lineData[109] = 0;
  _$jscoverage['/timer.js'].lineData[110] = 0;
  _$jscoverage['/timer.js'].lineData[111] = 0;
  _$jscoverage['/timer.js'].lineData[113] = 0;
  _$jscoverage['/timer.js'].lineData[114] = 0;
  _$jscoverage['/timer.js'].lineData[115] = 0;
  _$jscoverage['/timer.js'].lineData[118] = 0;
  _$jscoverage['/timer.js'].lineData[119] = 0;
  _$jscoverage['/timer.js'].lineData[121] = 0;
  _$jscoverage['/timer.js'].lineData[122] = 0;
  _$jscoverage['/timer.js'].lineData[123] = 0;
  _$jscoverage['/timer.js'].lineData[125] = 0;
  _$jscoverage['/timer.js'].lineData[127] = 0;
  _$jscoverage['/timer.js'].lineData[128] = 0;
  _$jscoverage['/timer.js'].lineData[132] = 0;
  _$jscoverage['/timer.js'].lineData[133] = 0;
  _$jscoverage['/timer.js'].lineData[137] = 0;
  _$jscoverage['/timer.js'].lineData[138] = 0;
  _$jscoverage['/timer.js'].lineData[139] = 0;
  _$jscoverage['/timer.js'].lineData[140] = 0;
  _$jscoverage['/timer.js'].lineData[141] = 0;
  _$jscoverage['/timer.js'].lineData[147] = 0;
  _$jscoverage['/timer.js'].lineData[153] = 0;
  _$jscoverage['/timer.js'].lineData[154] = 0;
  _$jscoverage['/timer.js'].lineData[155] = 0;
  _$jscoverage['/timer.js'].lineData[156] = 0;
  _$jscoverage['/timer.js'].lineData[158] = 0;
  _$jscoverage['/timer.js'].lineData[159] = 0;
  _$jscoverage['/timer.js'].lineData[161] = 0;
  _$jscoverage['/timer.js'].lineData[163] = 0;
  _$jscoverage['/timer.js'].lineData[169] = 0;
  _$jscoverage['/timer.js'].lineData[170] = 0;
  _$jscoverage['/timer.js'].lineData[172] = 0;
  _$jscoverage['/timer.js'].lineData[177] = 0;
  _$jscoverage['/timer.js'].lineData[182] = 0;
  _$jscoverage['/timer.js'].lineData[183] = 0;
  _$jscoverage['/timer.js'].lineData[184] = 0;
  _$jscoverage['/timer.js'].lineData[185] = 0;
  _$jscoverage['/timer.js'].lineData[186] = 0;
  _$jscoverage['/timer.js'].lineData[188] = 0;
  _$jscoverage['/timer.js'].lineData[189] = 0;
  _$jscoverage['/timer.js'].lineData[196] = 0;
  _$jscoverage['/timer.js'].lineData[200] = 0;
  _$jscoverage['/timer.js'].lineData[201] = 0;
  _$jscoverage['/timer.js'].lineData[203] = 0;
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
  _$jscoverage['/timer.js'].branchData['26'] = [];
  _$jscoverage['/timer.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['43'] = [];
  _$jscoverage['/timer.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['53'] = [];
  _$jscoverage['/timer.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['63'] = [];
  _$jscoverage['/timer.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['87'] = [];
  _$jscoverage['/timer.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['113'] = [];
  _$jscoverage['/timer.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['118'] = [];
  _$jscoverage['/timer.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['118'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['126'] = [];
  _$jscoverage['/timer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['132'] = [];
  _$jscoverage['/timer.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['133'] = [];
  _$jscoverage['/timer.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['158'] = [];
  _$jscoverage['/timer.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['161'] = [];
  _$jscoverage['/timer.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['167'] = [];
  _$jscoverage['/timer.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['170'] = [];
  _$jscoverage['/timer.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['183'] = [];
  _$jscoverage['/timer.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['188'] = [];
  _$jscoverage['/timer.js'].branchData['188'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['188'][1].init(159, 2, 'fx');
function visit102_188_1(result) {
  _$jscoverage['/timer.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['183'][1].init(188, 6, 'finish');
function visit101_183_1(result) {
  _$jscoverage['/timer.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['170'][1].init(881, 3, 'end');
function visit100_170_1(result) {
  _$jscoverage['/timer.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['167'][1].init(207, 25, 'remaining / duration || 0');
function visit99_167_1(result) {
  _$jscoverage['/timer.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['161'][1].init(287, 12, 'fx.pos === 1');
function visit98_161_1(result) {
  _$jscoverage['/timer.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['158'][1].init(176, 38, 'self.isRejected() || self.isResolved()');
function visit97_158_1(result) {
  _$jscoverage['/timer.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['133'][1].init(33, 19, 'parts[1] === \'-=\'');
function visit96_133_1(result) {
  _$jscoverage['/timer.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['132'][1].init(710, 8, 'parts[1]');
function visit95_132_1(result) {
  _$jscoverage['/timer.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['126'][1].init(229, 12, 'tmpCur === 0');
function visit94_126_1(result) {
  _$jscoverage['/timer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['118'][3].init(153, 13, 'unit !== \'px\'');
function visit93_118_3(result) {
  _$jscoverage['/timer.js'].branchData['118'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['118'][2].init(153, 21, 'unit !== \'px\' && from');
function visit92_118_2(result) {
  _$jscoverage['/timer.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['118'][1].init(145, 29, 'unit && unit !== \'px\' && from');
function visit91_118_1(result) {
  _$jscoverage['/timer.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['113'][1].init(593, 5, 'parts');
function visit90_113_1(result) {
  _$jscoverage['/timer.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['87'][1].init(1742, 21, 'S.isPlainObject(node)');
function visit89_87_1(result) {
  _$jscoverage['/timer.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['63'][1].init(81, 19, '!(sh in _propsData)');
function visit88_63_1(result) {
  _$jscoverage['/timer.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['53'][1].init(121, 9, '_propData');
function visit87_53_1(result) {
  _$jscoverage['/timer.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['43'][1].init(128, 36, 'typeof _propData.easing === \'string\'');
function visit86_43_1(result) {
  _$jscoverage['/timer.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['26'][1].init(62, 18, 'prop !== camelProp');
function visit85_26_1(result) {
  _$jscoverage['/timer.js'].branchData['26'][1].ranCondition(result);
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
  function Anim() {
    _$jscoverage['/timer.js'].functionData[1]++;
    _$jscoverage['/timer.js'].lineData[20]++;
    var self = this, to;
    _$jscoverage['/timer.js'].lineData[22]++;
    Anim.superclass.constructor.apply(self, arguments);
    _$jscoverage['/timer.js'].lineData[24]++;
    S.each(to = self.to, function(v, prop) {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[25]++;
  var camelProp = camelCase(prop);
  _$jscoverage['/timer.js'].lineData[26]++;
  if (visit85_26_1(prop !== camelProp)) {
    _$jscoverage['/timer.js'].lineData[27]++;
    to[camelProp] = to[prop];
    _$jscoverage['/timer.js'].lineData[28]++;
    delete to[prop];
  }
});
  }
  _$jscoverage['/timer.js'].lineData[33]++;
  S.extend(Anim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[35]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[39]++;
  S.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[41]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[42]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[43]++;
  if (visit86_43_1(typeof _propData.easing === 'string')) {
    _$jscoverage['/timer.js'].lineData[44]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[49]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[50]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/timer.js'].lineData[53]++;
  if (visit87_53_1(_propData)) {
    _$jscoverage['/timer.js'].lineData[54]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[55]++;
    origin = {};
    _$jscoverage['/timer.js'].lineData[56]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[58]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/timer.js'].lineData[60]++;
    Dom.css(node, p, val);
    _$jscoverage['/timer.js'].lineData[61]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/timer.js'].functionData[7]++;
  _$jscoverage['/timer.js'].lineData[63]++;
  if (visit88_63_1(!(sh in _propsData))) {
    _$jscoverage['/timer.js'].lineData[64]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/timer.js'].lineData[69]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/timer.js'].lineData[72]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/timer.js'].lineData[76]++;
  var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
  _$jscoverage['/timer.js'].lineData[87]++;
  if (visit89_87_1(S.isPlainObject(node))) {
    _$jscoverage['/timer.js'].lineData[88]++;
    isCustomFx = 1;
  }
  _$jscoverage['/timer.js'].lineData[92]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[93]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[94]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[95]++;
    propCfg = {
  isCustomFx: isCustomFx, 
  prop: prop, 
  anim: self, 
  fxType: _propData.fxType, 
  type: _propData.type, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[103]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[105]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[107]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[109]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[110]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[111]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[113]++;
    if (visit90_113_1(parts)) {
      _$jscoverage['/timer.js'].lineData[114]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[115]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[118]++;
      if (visit91_118_1(unit && visit92_118_2(visit93_118_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[119]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[121]++;
        do {
          _$jscoverage['/timer.js'].lineData[122]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[123]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[125]++;
          tmpCur = fx.cur();
        } while (visit94_126_1(tmpCur === 0));
        _$jscoverage['/timer.js'].lineData[127]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[128]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[132]++;
      if (visit95_132_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[133]++;
        to = ((visit96_133_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[137]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[138]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[139]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[140]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[141]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[8]++;
  _$jscoverage['/timer.js'].lineData[147]++;
  var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[153]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[154]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[155]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[156]++;
    fx.frame();
    _$jscoverage['/timer.js'].lineData[158]++;
    if (visit97_158_1(self.isRejected() || self.isResolved())) {
      _$jscoverage['/timer.js'].lineData[159]++;
      return;
    }
    _$jscoverage['/timer.js'].lineData[161]++;
    end &= visit98_161_1(fx.pos === 1);
  }
  _$jscoverage['/timer.js'].lineData[163]++;
  var currentTime = S.now(), duration = self.config.duration * 1000, remaining = Math.max(0, self.startTime + duration - currentTime), temp = visit99_167_1(remaining / duration || 0), percent = 1 - temp;
  _$jscoverage['/timer.js'].lineData[169]++;
  self.defer.notify([self, percent, remaining]);
  _$jscoverage['/timer.js'].lineData[170]++;
  if (visit100_170_1(end)) {
    _$jscoverage['/timer.js'].lineData[172]++;
    self.stop(end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[9]++;
  _$jscoverage['/timer.js'].lineData[177]++;
  var self = this, prop, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[182]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[183]++;
  if (visit101_183_1(finish)) {
    _$jscoverage['/timer.js'].lineData[184]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[185]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[186]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[188]++;
      if (visit102_188_1(fx)) {
        _$jscoverage['/timer.js'].lineData[189]++;
        fx.frame(1);
      }
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[10]++;
  _$jscoverage['/timer.js'].lineData[196]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[200]++;
  Anim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[201]++;
  Anim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[203]++;
  return Anim;
});
