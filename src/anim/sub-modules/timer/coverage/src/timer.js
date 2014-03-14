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
  _$jscoverage['/timer.js'].lineData[15] = 0;
  _$jscoverage['/timer.js'].lineData[17] = 0;
  _$jscoverage['/timer.js'].lineData[18] = 0;
  _$jscoverage['/timer.js'].lineData[19] = 0;
  _$jscoverage['/timer.js'].lineData[20] = 0;
  _$jscoverage['/timer.js'].lineData[22] = 0;
  _$jscoverage['/timer.js'].lineData[25] = 0;
  _$jscoverage['/timer.js'].lineData[27] = 0;
  _$jscoverage['/timer.js'].lineData[31] = 0;
  _$jscoverage['/timer.js'].lineData[33] = 0;
  _$jscoverage['/timer.js'].lineData[34] = 0;
  _$jscoverage['/timer.js'].lineData[35] = 0;
  _$jscoverage['/timer.js'].lineData[36] = 0;
  _$jscoverage['/timer.js'].lineData[40] = 0;
  _$jscoverage['/timer.js'].lineData[51] = 0;
  _$jscoverage['/timer.js'].lineData[52] = 0;
  _$jscoverage['/timer.js'].lineData[56] = 0;
  _$jscoverage['/timer.js'].lineData[57] = 0;
  _$jscoverage['/timer.js'].lineData[58] = 0;
  _$jscoverage['/timer.js'].lineData[59] = 0;
  _$jscoverage['/timer.js'].lineData[67] = 0;
  _$jscoverage['/timer.js'].lineData[69] = 0;
  _$jscoverage['/timer.js'].lineData[71] = 0;
  _$jscoverage['/timer.js'].lineData[73] = 0;
  _$jscoverage['/timer.js'].lineData[74] = 0;
  _$jscoverage['/timer.js'].lineData[75] = 0;
  _$jscoverage['/timer.js'].lineData[77] = 0;
  _$jscoverage['/timer.js'].lineData[78] = 0;
  _$jscoverage['/timer.js'].lineData[79] = 0;
  _$jscoverage['/timer.js'].lineData[82] = 0;
  _$jscoverage['/timer.js'].lineData[83] = 0;
  _$jscoverage['/timer.js'].lineData[85] = 0;
  _$jscoverage['/timer.js'].lineData[86] = 0;
  _$jscoverage['/timer.js'].lineData[87] = 0;
  _$jscoverage['/timer.js'].lineData[89] = 0;
  _$jscoverage['/timer.js'].lineData[91] = 0;
  _$jscoverage['/timer.js'].lineData[92] = 0;
  _$jscoverage['/timer.js'].lineData[96] = 0;
  _$jscoverage['/timer.js'].lineData[97] = 0;
  _$jscoverage['/timer.js'].lineData[101] = 0;
  _$jscoverage['/timer.js'].lineData[102] = 0;
  _$jscoverage['/timer.js'].lineData[103] = 0;
  _$jscoverage['/timer.js'].lineData[104] = 0;
  _$jscoverage['/timer.js'].lineData[105] = 0;
  _$jscoverage['/timer.js'].lineData[111] = 0;
  _$jscoverage['/timer.js'].lineData[117] = 0;
  _$jscoverage['/timer.js'].lineData[118] = 0;
  _$jscoverage['/timer.js'].lineData[119] = 0;
  _$jscoverage['/timer.js'].lineData[120] = 0;
  _$jscoverage['/timer.js'].lineData[122] = 0;
  _$jscoverage['/timer.js'].lineData[123] = 0;
  _$jscoverage['/timer.js'].lineData[125] = 0;
  _$jscoverage['/timer.js'].lineData[127] = 0;
  _$jscoverage['/timer.js'].lineData[133] = 0;
  _$jscoverage['/timer.js'].lineData[134] = 0;
  _$jscoverage['/timer.js'].lineData[136] = 0;
  _$jscoverage['/timer.js'].lineData[141] = 0;
  _$jscoverage['/timer.js'].lineData[146] = 0;
  _$jscoverage['/timer.js'].lineData[147] = 0;
  _$jscoverage['/timer.js'].lineData[148] = 0;
  _$jscoverage['/timer.js'].lineData[149] = 0;
  _$jscoverage['/timer.js'].lineData[150] = 0;
  _$jscoverage['/timer.js'].lineData[152] = 0;
  _$jscoverage['/timer.js'].lineData[153] = 0;
  _$jscoverage['/timer.js'].lineData[160] = 0;
  _$jscoverage['/timer.js'].lineData[165] = 0;
  _$jscoverage['/timer.js'].lineData[168] = 0;
  _$jscoverage['/timer.js'].lineData[170] = 0;
  _$jscoverage['/timer.js'].lineData[172] = 0;
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
}
if (! _$jscoverage['/timer.js'].branchData) {
  _$jscoverage['/timer.js'].branchData = {};
  _$jscoverage['/timer.js'].branchData['19'] = [];
  _$jscoverage['/timer.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['35'] = [];
  _$jscoverage['/timer.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['51'] = [];
  _$jscoverage['/timer.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['77'] = [];
  _$jscoverage['/timer.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['82'] = [];
  _$jscoverage['/timer.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['90'] = [];
  _$jscoverage['/timer.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['96'] = [];
  _$jscoverage['/timer.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['97'] = [];
  _$jscoverage['/timer.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['122'] = [];
  _$jscoverage['/timer.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['125'] = [];
  _$jscoverage['/timer.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['131'] = [];
  _$jscoverage['/timer.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['134'] = [];
  _$jscoverage['/timer.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['147'] = [];
  _$jscoverage['/timer.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['152'] = [];
  _$jscoverage['/timer.js'].branchData['152'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['152'][1].init(159, 2, 'fx');
function visit100_152_1(result) {
  _$jscoverage['/timer.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['147'][1].init(188, 6, 'finish');
function visit99_147_1(result) {
  _$jscoverage['/timer.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['134'][1].init(881, 3, 'end');
function visit98_134_1(result) {
  _$jscoverage['/timer.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['131'][1].init(207, 25, 'remaining / duration || 0');
function visit97_131_1(result) {
  _$jscoverage['/timer.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['125'][1].init(287, 12, 'fx.pos === 1');
function visit96_125_1(result) {
  _$jscoverage['/timer.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['122'][1].init(176, 38, 'self.isRejected() || self.isResolved()');
function visit95_122_1(result) {
  _$jscoverage['/timer.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['97'][1].init(33, 19, 'parts[1] === \'-=\'');
function visit94_97_1(result) {
  _$jscoverage['/timer.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['96'][1].init(710, 8, 'parts[1]');
function visit93_96_1(result) {
  _$jscoverage['/timer.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['90'][1].init(229, 12, 'tmpCur === 0');
function visit92_90_1(result) {
  _$jscoverage['/timer.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['82'][3].init(153, 13, 'unit !== \'px\'');
function visit91_82_3(result) {
  _$jscoverage['/timer.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['82'][2].init(153, 21, 'unit !== \'px\' && from');
function visit90_82_2(result) {
  _$jscoverage['/timer.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['82'][1].init(145, 29, 'unit && unit !== \'px\' && from');
function visit89_82_1(result) {
  _$jscoverage['/timer.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['77'][1].init(593, 5, 'parts');
function visit88_77_1(result) {
  _$jscoverage['/timer.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['51'][1].init(688, 21, 'S.isPlainObject(node)');
function visit87_51_1(result) {
  _$jscoverage['/timer.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['35'][1].init(128, 36, 'typeof _propData.easing === \'string\'');
function visit86_35_1(result) {
  _$jscoverage['/timer.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['19'][1].init(38, 29, '!(self instanceof TimerAnim)');
function visit85_19_1(result) {
  _$jscoverage['/timer.js'].branchData['19'][1].ranCondition(result);
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
  require('./timer/color');
  _$jscoverage['/timer.js'].lineData[13]++;
  require('./timer/transform');
  _$jscoverage['/timer.js'].lineData[15]++;
  var NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
  _$jscoverage['/timer.js'].lineData[17]++;
  function TimerAnim(node, to, duration, easing, complete) {
    _$jscoverage['/timer.js'].functionData[1]++;
    _$jscoverage['/timer.js'].lineData[18]++;
    var self = this;
    _$jscoverage['/timer.js'].lineData[19]++;
    if (visit85_19_1(!(self instanceof TimerAnim))) {
      _$jscoverage['/timer.js'].lineData[20]++;
      return new TimerAnim(node, to, duration, easing, complete);
    }
    _$jscoverage['/timer.js'].lineData[22]++;
    TimerAnim.superclass.constructor.apply(self, arguments);
  }
  _$jscoverage['/timer.js'].lineData[25]++;
  S.extend(TimerAnim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[27]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[31]++;
  S.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[33]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[34]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[35]++;
  if (visit86_35_1(typeof _propData.easing === 'string')) {
    _$jscoverage['/timer.js'].lineData[36]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[40]++;
  var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
  _$jscoverage['/timer.js'].lineData[51]++;
  if (visit87_51_1(S.isPlainObject(node))) {
    _$jscoverage['/timer.js'].lineData[52]++;
    isCustomFx = 1;
  }
  _$jscoverage['/timer.js'].lineData[56]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[57]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[58]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[59]++;
    propCfg = {
  isCustomFx: isCustomFx, 
  prop: prop, 
  anim: self, 
  fxType: _propData.fxType, 
  type: _propData.type, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[67]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[69]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[71]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[73]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[74]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[75]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[77]++;
    if (visit88_77_1(parts)) {
      _$jscoverage['/timer.js'].lineData[78]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[79]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[82]++;
      if (visit89_82_1(unit && visit90_82_2(visit91_82_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[83]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[85]++;
        do {
          _$jscoverage['/timer.js'].lineData[86]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[87]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[89]++;
          tmpCur = fx.cur();
        } while (visit92_90_1(tmpCur === 0));
        _$jscoverage['/timer.js'].lineData[91]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[92]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[96]++;
      if (visit93_96_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[97]++;
        to = ((visit94_97_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[101]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[102]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[103]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[104]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[105]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[111]++;
  var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[117]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[118]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[119]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[120]++;
    fx.frame();
    _$jscoverage['/timer.js'].lineData[122]++;
    if (visit95_122_1(self.isRejected() || self.isResolved())) {
      _$jscoverage['/timer.js'].lineData[123]++;
      return;
    }
    _$jscoverage['/timer.js'].lineData[125]++;
    end &= visit96_125_1(fx.pos === 1);
  }
  _$jscoverage['/timer.js'].lineData[127]++;
  var currentTime = S.now(), duration = self.config.duration * 1000, remaining = Math.max(0, self.startTime + duration - currentTime), temp = visit97_131_1(remaining / duration || 0), percent = 1 - temp;
  _$jscoverage['/timer.js'].lineData[133]++;
  self.defer.notify([self, percent, remaining]);
  _$jscoverage['/timer.js'].lineData[134]++;
  if (visit98_134_1(end)) {
    _$jscoverage['/timer.js'].lineData[136]++;
    self.stop(end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[141]++;
  var self = this, prop, fx, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[146]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[147]++;
  if (visit99_147_1(finish)) {
    _$jscoverage['/timer.js'].lineData[148]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[149]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[150]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[152]++;
      if (visit100_152_1(fx)) {
        _$jscoverage['/timer.js'].lineData[153]++;
        fx.frame(1);
      }
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[160]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[165]++;
  TimerAnim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[168]++;
  TimerAnim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[170]++;
  S.mix(TimerAnim, AnimBase.Statics);
  _$jscoverage['/timer.js'].lineData[172]++;
  return TimerAnim;
});
