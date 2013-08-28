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
  _$jscoverage['/timer.js'].lineData[10] = 0;
  _$jscoverage['/timer.js'].lineData[11] = 0;
  _$jscoverage['/timer.js'].lineData[13] = 0;
  _$jscoverage['/timer.js'].lineData[15] = 0;
  _$jscoverage['/timer.js'].lineData[16] = 0;
  _$jscoverage['/timer.js'].lineData[17] = 0;
  _$jscoverage['/timer.js'].lineData[18] = 0;
  _$jscoverage['/timer.js'].lineData[19] = 0;
  _$jscoverage['/timer.js'].lineData[24] = 0;
  _$jscoverage['/timer.js'].lineData[26] = 0;
  _$jscoverage['/timer.js'].lineData[30] = 0;
  _$jscoverage['/timer.js'].lineData[32] = 0;
  _$jscoverage['/timer.js'].lineData[33] = 0;
  _$jscoverage['/timer.js'].lineData[34] = 0;
  _$jscoverage['/timer.js'].lineData[35] = 0;
  _$jscoverage['/timer.js'].lineData[40] = 0;
  _$jscoverage['/timer.js'].lineData[41] = 0;
  _$jscoverage['/timer.js'].lineData[44] = 0;
  _$jscoverage['/timer.js'].lineData[45] = 0;
  _$jscoverage['/timer.js'].lineData[46] = 0;
  _$jscoverage['/timer.js'].lineData[47] = 0;
  _$jscoverage['/timer.js'].lineData[49] = 0;
  _$jscoverage['/timer.js'].lineData[51] = 0;
  _$jscoverage['/timer.js'].lineData[52] = 0;
  _$jscoverage['/timer.js'].lineData[54] = 0;
  _$jscoverage['/timer.js'].lineData[55] = 0;
  _$jscoverage['/timer.js'].lineData[60] = 0;
  _$jscoverage['/timer.js'].lineData[63] = 0;
  _$jscoverage['/timer.js'].lineData[67] = 0;
  _$jscoverage['/timer.js'].lineData[78] = 0;
  _$jscoverage['/timer.js'].lineData[79] = 0;
  _$jscoverage['/timer.js'].lineData[83] = 0;
  _$jscoverage['/timer.js'].lineData[84] = 0;
  _$jscoverage['/timer.js'].lineData[85] = 0;
  _$jscoverage['/timer.js'].lineData[86] = 0;
  _$jscoverage['/timer.js'].lineData[93] = 0;
  _$jscoverage['/timer.js'].lineData[95] = 0;
  _$jscoverage['/timer.js'].lineData[97] = 0;
  _$jscoverage['/timer.js'].lineData[99] = 0;
  _$jscoverage['/timer.js'].lineData[100] = 0;
  _$jscoverage['/timer.js'].lineData[101] = 0;
  _$jscoverage['/timer.js'].lineData[103] = 0;
  _$jscoverage['/timer.js'].lineData[104] = 0;
  _$jscoverage['/timer.js'].lineData[105] = 0;
  _$jscoverage['/timer.js'].lineData[108] = 0;
  _$jscoverage['/timer.js'].lineData[109] = 0;
  _$jscoverage['/timer.js'].lineData[111] = 0;
  _$jscoverage['/timer.js'].lineData[112] = 0;
  _$jscoverage['/timer.js'].lineData[113] = 0;
  _$jscoverage['/timer.js'].lineData[115] = 0;
  _$jscoverage['/timer.js'].lineData[118] = 0;
  _$jscoverage['/timer.js'].lineData[119] = 0;
  _$jscoverage['/timer.js'].lineData[123] = 0;
  _$jscoverage['/timer.js'].lineData[124] = 0;
  _$jscoverage['/timer.js'].lineData[128] = 0;
  _$jscoverage['/timer.js'].lineData[129] = 0;
  _$jscoverage['/timer.js'].lineData[130] = 0;
  _$jscoverage['/timer.js'].lineData[131] = 0;
  _$jscoverage['/timer.js'].lineData[132] = 0;
  _$jscoverage['/timer.js'].lineData[138] = 0;
  _$jscoverage['/timer.js'].lineData[145] = 0;
  _$jscoverage['/timer.js'].lineData[146] = 0;
  _$jscoverage['/timer.js'].lineData[147] = 0;
  _$jscoverage['/timer.js'].lineData[148] = 0;
  _$jscoverage['/timer.js'].lineData[150] = 0;
  _$jscoverage['/timer.js'].lineData[151] = 0;
  _$jscoverage['/timer.js'].lineData[153] = 0;
  _$jscoverage['/timer.js'].lineData[156] = 0;
  _$jscoverage['/timer.js'].lineData[158] = 0;
  _$jscoverage['/timer.js'].lineData[163] = 0;
  _$jscoverage['/timer.js'].lineData[168] = 0;
  _$jscoverage['/timer.js'].lineData[169] = 0;
  _$jscoverage['/timer.js'].lineData[170] = 0;
  _$jscoverage['/timer.js'].lineData[171] = 0;
  _$jscoverage['/timer.js'].lineData[172] = 0;
  _$jscoverage['/timer.js'].lineData[173] = 0;
  _$jscoverage['/timer.js'].lineData[179] = 0;
  _$jscoverage['/timer.js'].lineData[183] = 0;
  _$jscoverage['/timer.js'].lineData[184] = 0;
  _$jscoverage['/timer.js'].lineData[186] = 0;
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
  _$jscoverage['/timer.js'].branchData['17'] = [];
  _$jscoverage['/timer.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['34'] = [];
  _$jscoverage['/timer.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['44'] = [];
  _$jscoverage['/timer.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['54'] = [];
  _$jscoverage['/timer.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['78'] = [];
  _$jscoverage['/timer.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['103'] = [];
  _$jscoverage['/timer.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['108'] = [];
  _$jscoverage['/timer.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['108'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['116'] = [];
  _$jscoverage['/timer.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['123'] = [];
  _$jscoverage['/timer.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['124'] = [];
  _$jscoverage['/timer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['150'] = [];
  _$jscoverage['/timer.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['153'] = [];
  _$jscoverage['/timer.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['156'] = [];
  _$jscoverage['/timer.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['169'] = [];
  _$jscoverage['/timer.js'].branchData['169'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['169'][1].init(195, 6, 'finish');
function visit104_169_1(result) {
  _$jscoverage['/timer.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['156'][2].init(536, 27, 'self.fire(\'step\') === false');
function visit103_156_2(result) {
  _$jscoverage['/timer.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['156'][1].init(536, 35, '(self.fire(\'step\') === false) || end');
function visit102_156_1(result) {
  _$jscoverage['/timer.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['153'][1].init(271, 11, 'fx.pos == 1');
function visit101_153_1(result) {
  _$jscoverage['/timer.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['150'][1].init(181, 14, 'self.__stopped');
function visit100_150_1(result) {
  _$jscoverage['/timer.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['124'][1].init(34, 19, 'parts[1] === \'-=\'');
function visit99_124_1(result) {
  _$jscoverage['/timer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['123'][1].init(783, 8, 'parts[1]');
function visit98_123_1(result) {
  _$jscoverage['/timer.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['116'][1].init(234, 11, 'tmpCur == 0');
function visit97_116_1(result) {
  _$jscoverage['/timer.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['108'][3].init(158, 13, 'unit !== \'px\'');
function visit96_108_3(result) {
  _$jscoverage['/timer.js'].branchData['108'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['108'][2].init(158, 21, 'unit !== \'px\' && from');
function visit95_108_2(result) {
  _$jscoverage['/timer.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['108'][1].init(150, 29, 'unit && unit !== \'px\' && from');
function visit94_108_1(result) {
  _$jscoverage['/timer.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['103'][1].init(526, 5, 'parts');
function visit93_103_1(result) {
  _$jscoverage['/timer.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['78'][1].init(1794, 21, 'S.isPlainObject(node)');
function visit92_78_1(result) {
  _$jscoverage['/timer.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['54'][1].init(83, 19, '!(sh in _propsData)');
function visit91_54_1(result) {
  _$jscoverage['/timer.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['44'][1].init(125, 9, '_propData');
function visit90_44_1(result) {
  _$jscoverage['/timer.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['34'][1].init(132, 35, 'typeof _propData.easing == \'string\'');
function visit89_34_1(result) {
  _$jscoverage['/timer.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['17'][1].init(64, 17, 'prop != camelProp');
function visit88_17_1(result) {
  _$jscoverage['/timer.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].lineData[6]++;
KISSY.add('anim/timer', function(S, Dom, Event, AnimBase, Easing, AM, Fx, SHORT_HANDS) {
  _$jscoverage['/timer.js'].functionData[0]++;
  _$jscoverage['/timer.js'].lineData[7]++;
  var camelCase = Dom._camelCase, NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
  _$jscoverage['/timer.js'].lineData[10]++;
  function Anim() {
    _$jscoverage['/timer.js'].functionData[1]++;
    _$jscoverage['/timer.js'].lineData[11]++;
    var self = this, to;
    _$jscoverage['/timer.js'].lineData[13]++;
    Anim.superclass.constructor.apply(self, arguments);
    _$jscoverage['/timer.js'].lineData[15]++;
    S.each(to = self.to, function(v, prop) {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[16]++;
  var camelProp = camelCase(prop);
  _$jscoverage['/timer.js'].lineData[17]++;
  if (visit88_17_1(prop != camelProp)) {
    _$jscoverage['/timer.js'].lineData[18]++;
    to[camelProp] = to[prop];
    _$jscoverage['/timer.js'].lineData[19]++;
    delete to[prop];
  }
});
  }
  _$jscoverage['/timer.js'].lineData[24]++;
  S.extend(Anim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[26]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[30]++;
  S.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[32]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[33]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[34]++;
  if (visit89_34_1(typeof _propData.easing == 'string')) {
    _$jscoverage['/timer.js'].lineData[35]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[40]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[41]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/timer.js'].lineData[44]++;
  if (visit90_44_1(_propData)) {
    _$jscoverage['/timer.js'].lineData[45]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[46]++;
    origin = {};
    _$jscoverage['/timer.js'].lineData[47]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[49]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/timer.js'].lineData[51]++;
    Dom.css(node, p, val);
    _$jscoverage['/timer.js'].lineData[52]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/timer.js'].functionData[7]++;
  _$jscoverage['/timer.js'].lineData[54]++;
  if (visit91_54_1(!(sh in _propsData))) {
    _$jscoverage['/timer.js'].lineData[55]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/timer.js'].lineData[60]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/timer.js'].lineData[63]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/timer.js'].lineData[67]++;
  var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
  _$jscoverage['/timer.js'].lineData[78]++;
  if (visit92_78_1(S.isPlainObject(node))) {
    _$jscoverage['/timer.js'].lineData[79]++;
    isCustomFx = 1;
  }
  _$jscoverage['/timer.js'].lineData[83]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[84]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[85]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[86]++;
    propCfg = {
  isCustomFx: isCustomFx, 
  prop: prop, 
  anim: self, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[93]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[95]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[97]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[99]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[100]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[101]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[103]++;
    if (visit93_103_1(parts)) {
      _$jscoverage['/timer.js'].lineData[104]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[105]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[108]++;
      if (visit94_108_1(unit && visit95_108_2(visit96_108_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[109]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[111]++;
        do {
          _$jscoverage['/timer.js'].lineData[112]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[113]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[115]++;
          tmpCur = fx.cur();
        } while (visit97_116_1(tmpCur == 0));
        _$jscoverage['/timer.js'].lineData[118]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[119]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[123]++;
      if (visit98_123_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[124]++;
        to = ((visit99_124_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[128]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[129]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[130]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[131]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[132]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[8]++;
  _$jscoverage['/timer.js'].lineData[138]++;
  var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[145]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[146]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[147]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[148]++;
    fx.frame();
    _$jscoverage['/timer.js'].lineData[150]++;
    if (visit100_150_1(self.__stopped)) {
      _$jscoverage['/timer.js'].lineData[151]++;
      return;
    }
    _$jscoverage['/timer.js'].lineData[153]++;
    end &= visit101_153_1(fx.pos == 1);
  }
  _$jscoverage['/timer.js'].lineData[156]++;
  if (visit102_156_1((visit103_156_2(self.fire('step') === false)) || end)) {
    _$jscoverage['/timer.js'].lineData[158]++;
    self['stop'](end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[9]++;
  _$jscoverage['/timer.js'].lineData[163]++;
  var self = this, prop, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[168]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[169]++;
  if (visit104_169_1(finish)) {
    _$jscoverage['/timer.js'].lineData[170]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[171]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[172]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[173]++;
      fx.frame(1);
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[10]++;
  _$jscoverage['/timer.js'].lineData[179]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[183]++;
  Anim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[184]++;
  Anim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[186]++;
  return Anim;
}, {
  requires: ['dom', 'event', './base', './timer/easing', './timer/manager', './timer/fx', './timer/short-hand', './timer/color', './timer/transform']});
