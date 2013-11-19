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
  _$jscoverage['/timer.js'].lineData[15] = 0;
  _$jscoverage['/timer.js'].lineData[17] = 0;
  _$jscoverage['/timer.js'].lineData[20] = 0;
  _$jscoverage['/timer.js'].lineData[21] = 0;
  _$jscoverage['/timer.js'].lineData[23] = 0;
  _$jscoverage['/timer.js'].lineData[25] = 0;
  _$jscoverage['/timer.js'].lineData[26] = 0;
  _$jscoverage['/timer.js'].lineData[27] = 0;
  _$jscoverage['/timer.js'].lineData[28] = 0;
  _$jscoverage['/timer.js'].lineData[29] = 0;
  _$jscoverage['/timer.js'].lineData[34] = 0;
  _$jscoverage['/timer.js'].lineData[36] = 0;
  _$jscoverage['/timer.js'].lineData[40] = 0;
  _$jscoverage['/timer.js'].lineData[42] = 0;
  _$jscoverage['/timer.js'].lineData[43] = 0;
  _$jscoverage['/timer.js'].lineData[44] = 0;
  _$jscoverage['/timer.js'].lineData[45] = 0;
  _$jscoverage['/timer.js'].lineData[50] = 0;
  _$jscoverage['/timer.js'].lineData[51] = 0;
  _$jscoverage['/timer.js'].lineData[54] = 0;
  _$jscoverage['/timer.js'].lineData[55] = 0;
  _$jscoverage['/timer.js'].lineData[56] = 0;
  _$jscoverage['/timer.js'].lineData[57] = 0;
  _$jscoverage['/timer.js'].lineData[59] = 0;
  _$jscoverage['/timer.js'].lineData[61] = 0;
  _$jscoverage['/timer.js'].lineData[62] = 0;
  _$jscoverage['/timer.js'].lineData[64] = 0;
  _$jscoverage['/timer.js'].lineData[65] = 0;
  _$jscoverage['/timer.js'].lineData[70] = 0;
  _$jscoverage['/timer.js'].lineData[73] = 0;
  _$jscoverage['/timer.js'].lineData[77] = 0;
  _$jscoverage['/timer.js'].lineData[88] = 0;
  _$jscoverage['/timer.js'].lineData[89] = 0;
  _$jscoverage['/timer.js'].lineData[93] = 0;
  _$jscoverage['/timer.js'].lineData[94] = 0;
  _$jscoverage['/timer.js'].lineData[95] = 0;
  _$jscoverage['/timer.js'].lineData[96] = 0;
  _$jscoverage['/timer.js'].lineData[104] = 0;
  _$jscoverage['/timer.js'].lineData[106] = 0;
  _$jscoverage['/timer.js'].lineData[108] = 0;
  _$jscoverage['/timer.js'].lineData[110] = 0;
  _$jscoverage['/timer.js'].lineData[111] = 0;
  _$jscoverage['/timer.js'].lineData[112] = 0;
  _$jscoverage['/timer.js'].lineData[114] = 0;
  _$jscoverage['/timer.js'].lineData[115] = 0;
  _$jscoverage['/timer.js'].lineData[116] = 0;
  _$jscoverage['/timer.js'].lineData[119] = 0;
  _$jscoverage['/timer.js'].lineData[120] = 0;
  _$jscoverage['/timer.js'].lineData[122] = 0;
  _$jscoverage['/timer.js'].lineData[123] = 0;
  _$jscoverage['/timer.js'].lineData[124] = 0;
  _$jscoverage['/timer.js'].lineData[126] = 0;
  _$jscoverage['/timer.js'].lineData[128] = 0;
  _$jscoverage['/timer.js'].lineData[129] = 0;
  _$jscoverage['/timer.js'].lineData[133] = 0;
  _$jscoverage['/timer.js'].lineData[134] = 0;
  _$jscoverage['/timer.js'].lineData[138] = 0;
  _$jscoverage['/timer.js'].lineData[139] = 0;
  _$jscoverage['/timer.js'].lineData[140] = 0;
  _$jscoverage['/timer.js'].lineData[141] = 0;
  _$jscoverage['/timer.js'].lineData[142] = 0;
  _$jscoverage['/timer.js'].lineData[148] = 0;
  _$jscoverage['/timer.js'].lineData[154] = 0;
  _$jscoverage['/timer.js'].lineData[155] = 0;
  _$jscoverage['/timer.js'].lineData[156] = 0;
  _$jscoverage['/timer.js'].lineData[157] = 0;
  _$jscoverage['/timer.js'].lineData[159] = 0;
  _$jscoverage['/timer.js'].lineData[160] = 0;
  _$jscoverage['/timer.js'].lineData[162] = 0;
  _$jscoverage['/timer.js'].lineData[164] = 0;
  _$jscoverage['/timer.js'].lineData[170] = 0;
  _$jscoverage['/timer.js'].lineData[171] = 0;
  _$jscoverage['/timer.js'].lineData[173] = 0;
  _$jscoverage['/timer.js'].lineData[178] = 0;
  _$jscoverage['/timer.js'].lineData[183] = 0;
  _$jscoverage['/timer.js'].lineData[184] = 0;
  _$jscoverage['/timer.js'].lineData[185] = 0;
  _$jscoverage['/timer.js'].lineData[186] = 0;
  _$jscoverage['/timer.js'].lineData[187] = 0;
  _$jscoverage['/timer.js'].lineData[189] = 0;
  _$jscoverage['/timer.js'].lineData[190] = 0;
  _$jscoverage['/timer.js'].lineData[197] = 0;
  _$jscoverage['/timer.js'].lineData[201] = 0;
  _$jscoverage['/timer.js'].lineData[202] = 0;
  _$jscoverage['/timer.js'].lineData[204] = 0;
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
  _$jscoverage['/timer.js'].branchData['27'] = [];
  _$jscoverage['/timer.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['44'] = [];
  _$jscoverage['/timer.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['54'] = [];
  _$jscoverage['/timer.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['64'] = [];
  _$jscoverage['/timer.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['88'] = [];
  _$jscoverage['/timer.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['114'] = [];
  _$jscoverage['/timer.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['119'] = [];
  _$jscoverage['/timer.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['119'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['127'] = [];
  _$jscoverage['/timer.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['133'] = [];
  _$jscoverage['/timer.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['134'] = [];
  _$jscoverage['/timer.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['159'] = [];
  _$jscoverage['/timer.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['162'] = [];
  _$jscoverage['/timer.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['168'] = [];
  _$jscoverage['/timer.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['171'] = [];
  _$jscoverage['/timer.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['184'] = [];
  _$jscoverage['/timer.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['189'] = [];
  _$jscoverage['/timer.js'].branchData['189'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['189'][1].init(159, 2, 'fx');
function visit107_189_1(result) {
  _$jscoverage['/timer.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['184'][1].init(188, 6, 'finish');
function visit106_184_1(result) {
  _$jscoverage['/timer.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['171'][1].init(880, 3, 'end');
function visit105_171_1(result) {
  _$jscoverage['/timer.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['168'][1].init(207, 25, 'remaining / duration || 0');
function visit104_168_1(result) {
  _$jscoverage['/timer.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['162'][1].init(287, 11, 'fx.pos == 1');
function visit103_162_1(result) {
  _$jscoverage['/timer.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['159'][1].init(176, 38, 'self.isRejected() || self.isResolved()');
function visit102_159_1(result) {
  _$jscoverage['/timer.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['134'][1].init(33, 19, 'parts[1] === \'-=\'');
function visit101_134_1(result) {
  _$jscoverage['/timer.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['133'][1].init(709, 8, 'parts[1]');
function visit100_133_1(result) {
  _$jscoverage['/timer.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['127'][1].init(229, 11, 'tmpCur == 0');
function visit99_127_1(result) {
  _$jscoverage['/timer.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['119'][3].init(153, 13, 'unit !== \'px\'');
function visit98_119_3(result) {
  _$jscoverage['/timer.js'].branchData['119'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['119'][2].init(153, 21, 'unit !== \'px\' && from');
function visit97_119_2(result) {
  _$jscoverage['/timer.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['119'][1].init(145, 29, 'unit && unit !== \'px\' && from');
function visit96_119_1(result) {
  _$jscoverage['/timer.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['114'][1].init(593, 5, 'parts');
function visit95_114_1(result) {
  _$jscoverage['/timer.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['88'][1].init(1741, 21, 'S.isPlainObject(node)');
function visit94_88_1(result) {
  _$jscoverage['/timer.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['64'][1].init(81, 19, '!(sh in _propsData)');
function visit93_64_1(result) {
  _$jscoverage['/timer.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['54'][1].init(121, 9, '_propData');
function visit92_54_1(result) {
  _$jscoverage['/timer.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['44'][1].init(128, 35, 'typeof _propData.easing == \'string\'');
function visit91_44_1(result) {
  _$jscoverage['/timer.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['27'][1].init(62, 17, 'prop != camelProp');
function visit90_27_1(result) {
  _$jscoverage['/timer.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/timer.js'].functionData[0]++;
  _$jscoverage['/timer.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/timer.js'].lineData[8]++;
  var Dom = module.require('dom');
  _$jscoverage['/timer.js'].lineData[9]++;
  var AnimBase = module.require('./base');
  _$jscoverage['/timer.js'].lineData[10]++;
  var Easing = module.require('./timer/easing');
  _$jscoverage['/timer.js'].lineData[11]++;
  var AM = module.require('./timer/manager');
  _$jscoverage['/timer.js'].lineData[12]++;
  var Fx = module.require('./timer/fx');
  _$jscoverage['/timer.js'].lineData[13]++;
  var SHORT_HANDS = module.require('./timer/short-hand');
  _$jscoverage['/timer.js'].lineData[14]++;
  module.require('./timer/color');
  _$jscoverage['/timer.js'].lineData[15]++;
  module.require('./timer/transform');
  _$jscoverage['/timer.js'].lineData[17]++;
  var camelCase = Dom._camelCase, NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
  _$jscoverage['/timer.js'].lineData[20]++;
  function Anim() {
    _$jscoverage['/timer.js'].functionData[1]++;
    _$jscoverage['/timer.js'].lineData[21]++;
    var self = this, to;
    _$jscoverage['/timer.js'].lineData[23]++;
    Anim.superclass.constructor.apply(self, arguments);
    _$jscoverage['/timer.js'].lineData[25]++;
    S.each(to = self.to, function(v, prop) {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[26]++;
  var camelProp = camelCase(prop);
  _$jscoverage['/timer.js'].lineData[27]++;
  if (visit90_27_1(prop != camelProp)) {
    _$jscoverage['/timer.js'].lineData[28]++;
    to[camelProp] = to[prop];
    _$jscoverage['/timer.js'].lineData[29]++;
    delete to[prop];
  }
});
  }
  _$jscoverage['/timer.js'].lineData[34]++;
  S.extend(Anim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[36]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[40]++;
  S.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[42]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[43]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[44]++;
  if (visit91_44_1(typeof _propData.easing == 'string')) {
    _$jscoverage['/timer.js'].lineData[45]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[50]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[51]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/timer.js'].lineData[54]++;
  if (visit92_54_1(_propData)) {
    _$jscoverage['/timer.js'].lineData[55]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[56]++;
    origin = {};
    _$jscoverage['/timer.js'].lineData[57]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[59]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/timer.js'].lineData[61]++;
    Dom.css(node, p, val);
    _$jscoverage['/timer.js'].lineData[62]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/timer.js'].functionData[7]++;
  _$jscoverage['/timer.js'].lineData[64]++;
  if (visit93_64_1(!(sh in _propsData))) {
    _$jscoverage['/timer.js'].lineData[65]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/timer.js'].lineData[70]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/timer.js'].lineData[73]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/timer.js'].lineData[77]++;
  var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
  _$jscoverage['/timer.js'].lineData[88]++;
  if (visit94_88_1(S.isPlainObject(node))) {
    _$jscoverage['/timer.js'].lineData[89]++;
    isCustomFx = 1;
  }
  _$jscoverage['/timer.js'].lineData[93]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[94]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[95]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[96]++;
    propCfg = {
  isCustomFx: isCustomFx, 
  prop: prop, 
  anim: self, 
  fxType: _propData.fxType, 
  type: _propData.type, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[104]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[106]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[108]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[110]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[111]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[112]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[114]++;
    if (visit95_114_1(parts)) {
      _$jscoverage['/timer.js'].lineData[115]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[116]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[119]++;
      if (visit96_119_1(unit && visit97_119_2(visit98_119_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[120]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[122]++;
        do {
          _$jscoverage['/timer.js'].lineData[123]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[124]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[126]++;
          tmpCur = fx.cur();
        } while (visit99_127_1(tmpCur == 0));
        _$jscoverage['/timer.js'].lineData[128]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[129]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[133]++;
      if (visit100_133_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[134]++;
        to = ((visit101_134_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[138]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[139]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[140]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[141]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[142]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[8]++;
  _$jscoverage['/timer.js'].lineData[148]++;
  var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[154]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[155]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[156]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[157]++;
    fx.frame();
    _$jscoverage['/timer.js'].lineData[159]++;
    if (visit102_159_1(self.isRejected() || self.isResolved())) {
      _$jscoverage['/timer.js'].lineData[160]++;
      return;
    }
    _$jscoverage['/timer.js'].lineData[162]++;
    end &= visit103_162_1(fx.pos == 1);
  }
  _$jscoverage['/timer.js'].lineData[164]++;
  var currentTime = S.now(), duration = self.config.duration * 1000, remaining = Math.max(0, self.startTime + duration - currentTime), temp = visit104_168_1(remaining / duration || 0), percent = 1 - temp;
  _$jscoverage['/timer.js'].lineData[170]++;
  self.defer.notify([self, percent, remaining]);
  _$jscoverage['/timer.js'].lineData[171]++;
  if (visit105_171_1(end)) {
    _$jscoverage['/timer.js'].lineData[173]++;
    self['stop'](end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[9]++;
  _$jscoverage['/timer.js'].lineData[178]++;
  var self = this, prop, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[183]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[184]++;
  if (visit106_184_1(finish)) {
    _$jscoverage['/timer.js'].lineData[185]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[186]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[187]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[189]++;
      if (visit107_189_1(fx)) {
        _$jscoverage['/timer.js'].lineData[190]++;
        fx.frame(1);
      }
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[10]++;
  _$jscoverage['/timer.js'].lineData[197]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[201]++;
  Anim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[202]++;
  Anim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[204]++;
  return Anim;
});
