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
if (! _$jscoverage['/transition.js']) {
  _$jscoverage['/transition.js'] = {};
  _$jscoverage['/transition.js'].lineData = [];
  _$jscoverage['/transition.js'].lineData[6] = 0;
  _$jscoverage['/transition.js'].lineData[7] = 0;
  _$jscoverage['/transition.js'].lineData[8] = 0;
  _$jscoverage['/transition.js'].lineData[9] = 0;
  _$jscoverage['/transition.js'].lineData[11] = 0;
  _$jscoverage['/transition.js'].lineData[12] = 0;
  _$jscoverage['/transition.js'].lineData[13] = 0;
  _$jscoverage['/transition.js'].lineData[14] = 0;
  _$jscoverage['/transition.js'].lineData[19] = 0;
  _$jscoverage['/transition.js'].lineData[21] = 0;
  _$jscoverage['/transition.js'].lineData[22] = 0;
  _$jscoverage['/transition.js'].lineData[23] = 0;
  _$jscoverage['/transition.js'].lineData[24] = 0;
  _$jscoverage['/transition.js'].lineData[25] = 0;
  _$jscoverage['/transition.js'].lineData[27] = 0;
  _$jscoverage['/transition.js'].lineData[32] = 0;
  _$jscoverage['/transition.js'].lineData[35] = 0;
  _$jscoverage['/transition.js'].lineData[36] = 0;
  _$jscoverage['/transition.js'].lineData[39] = 0;
  _$jscoverage['/transition.js'].lineData[41] = 0;
  _$jscoverage['/transition.js'].lineData[48] = 0;
  _$jscoverage['/transition.js'].lineData[49] = 0;
  _$jscoverage['/transition.js'].lineData[50] = 0;
  _$jscoverage['/transition.js'].lineData[53] = 0;
  _$jscoverage['/transition.js'].lineData[54] = 0;
  _$jscoverage['/transition.js'].lineData[56] = 0;
  _$jscoverage['/transition.js'].lineData[57] = 0;
  _$jscoverage['/transition.js'].lineData[59] = 0;
  _$jscoverage['/transition.js'].lineData[61] = 0;
  _$jscoverage['/transition.js'].lineData[62] = 0;
  _$jscoverage['/transition.js'].lineData[69] = 0;
  _$jscoverage['/transition.js'].lineData[73] = 0;
  _$jscoverage['/transition.js'].lineData[74] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[76] = 0;
  _$jscoverage['/transition.js'].lineData[80] = 0;
  _$jscoverage['/transition.js'].lineData[83] = 0;
  _$jscoverage['/transition.js'].lineData[85] = 0;
  _$jscoverage['/transition.js'].lineData[91] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[97] = 0;
  _$jscoverage['/transition.js'].lineData[98] = 0;
  _$jscoverage['/transition.js'].lineData[100] = 0;
  _$jscoverage['/transition.js'].lineData[101] = 0;
  _$jscoverage['/transition.js'].lineData[102] = 0;
  _$jscoverage['/transition.js'].lineData[103] = 0;
  _$jscoverage['/transition.js'].lineData[105] = 0;
  _$jscoverage['/transition.js'].lineData[112] = 0;
  _$jscoverage['/transition.js'].lineData[113] = 0;
  _$jscoverage['/transition.js'].lineData[117] = 0;
  _$jscoverage['/transition.js'].lineData[118] = 0;
  _$jscoverage['/transition.js'].lineData[122] = 0;
  _$jscoverage['/transition.js'].lineData[123] = 0;
  _$jscoverage['/transition.js'].lineData[125] = 0;
  _$jscoverage['/transition.js'].lineData[126] = 0;
  _$jscoverage['/transition.js'].lineData[127] = 0;
  _$jscoverage['/transition.js'].lineData[128] = 0;
  _$jscoverage['/transition.js'].lineData[129] = 0;
  _$jscoverage['/transition.js'].lineData[131] = 0;
  _$jscoverage['/transition.js'].lineData[133] = 0;
  _$jscoverage['/transition.js'].lineData[134] = 0;
  _$jscoverage['/transition.js'].lineData[139] = 0;
  _$jscoverage['/transition.js'].lineData[147] = 0;
  _$jscoverage['/transition.js'].lineData[148] = 0;
  _$jscoverage['/transition.js'].lineData[149] = 0;
  _$jscoverage['/transition.js'].lineData[150] = 0;
  _$jscoverage['/transition.js'].lineData[152] = 0;
  _$jscoverage['/transition.js'].lineData[156] = 0;
  _$jscoverage['/transition.js'].lineData[161] = 0;
  _$jscoverage['/transition.js'].lineData[162] = 0;
  _$jscoverage['/transition.js'].lineData[166] = 0;
}
if (! _$jscoverage['/transition.js'].functionData) {
  _$jscoverage['/transition.js'].functionData = [];
  _$jscoverage['/transition.js'].functionData[0] = 0;
  _$jscoverage['/transition.js'].functionData[1] = 0;
  _$jscoverage['/transition.js'].functionData[2] = 0;
  _$jscoverage['/transition.js'].functionData[3] = 0;
  _$jscoverage['/transition.js'].functionData[4] = 0;
  _$jscoverage['/transition.js'].functionData[5] = 0;
  _$jscoverage['/transition.js'].functionData[6] = 0;
  _$jscoverage['/transition.js'].functionData[7] = 0;
  _$jscoverage['/transition.js'].functionData[8] = 0;
  _$jscoverage['/transition.js'].functionData[9] = 0;
  _$jscoverage['/transition.js'].functionData[10] = 0;
  _$jscoverage['/transition.js'].functionData[11] = 0;
  _$jscoverage['/transition.js'].functionData[12] = 0;
}
if (! _$jscoverage['/transition.js'].branchData) {
  _$jscoverage['/transition.js'].branchData = {};
  _$jscoverage['/transition.js'].branchData['24'] = [];
  _$jscoverage['/transition.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['56'] = [];
  _$jscoverage['/transition.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['59'] = [];
  _$jscoverage['/transition.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['73'] = [];
  _$jscoverage['/transition.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['75'] = [];
  _$jscoverage['/transition.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['97'] = [];
  _$jscoverage['/transition.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['102'] = [];
  _$jscoverage['/transition.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['117'] = [];
  _$jscoverage['/transition.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['122'] = [];
  _$jscoverage['/transition.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['127'] = [];
  _$jscoverage['/transition.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['133'] = [];
  _$jscoverage['/transition.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['149'] = [];
  _$jscoverage['/transition.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['159'] = [];
  _$jscoverage['/transition.js'].branchData['159'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['159'][1].init(7, 213, 'S.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit13_159_1(result) {
  _$jscoverage['/transition.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['149'][1].init(21, 7, '!finish');
function visit12_149_1(result) {
  _$jscoverage['/transition.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['133'][1].init(790, 12, 'allCompleted');
function visit11_133_1(result) {
  _$jscoverage['/transition.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['127'][1].init(21, 18, 'propData.pos !== 1');
function visit10_127_1(result) {
  _$jscoverage['/transition.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['122'][1].init(416, 35, 'propsData[e.propertyName].pos === 1');
function visit9_122_1(result) {
  _$jscoverage['/transition.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['117'][1].init(204, 26, '!propsData[e.propertyName]');
function visit8_117_1(result) {
  _$jscoverage['/transition.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['102'][1].init(113, 29, 'propData.duration >= tRunTime');
function visit7_102_1(result) {
  _$jscoverage['/transition.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['97'][1].init(61, 26, 'propData.delay >= tRunTime');
function visit6_97_1(result) {
  _$jscoverage['/transition.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['75'][1].init(1436, 8, 'original');
function visit5_75_1(result) {
  _$jscoverage['/transition.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['73'][1].init(1346, 31, 'original.indexOf(\'none\') !== -1');
function visit4_73_1(result) {
  _$jscoverage['/transition.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['59'][1].init(241, 18, 'currentValue === v');
function visit3_59_1(result) {
  _$jscoverage['/transition.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['56'][1].init(117, 21, 'typeof v === \'number\'');
function visit2_56_1(result) {
  _$jscoverage['/transition.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['24'][1].init(17, 3, 'str');
function visit1_24_1(result) {
  _$jscoverage['/transition.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/transition.js'].functionData[0]++;
  _$jscoverage['/transition.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/transition.js'].lineData[8]++;
  var Event = require('event/dom');
  _$jscoverage['/transition.js'].lineData[9]++;
  var AnimBase = require('./base');
  _$jscoverage['/transition.js'].lineData[11]++;
  var Features = S.Features;
  _$jscoverage['/transition.js'].lineData[12]++;
  var vendorPrefix = Features.getVendorCssPropPrefix('transition');
  _$jscoverage['/transition.js'].lineData[13]++;
  var R_UPPER = /([A-Z]|^ms)/g;
  _$jscoverage['/transition.js'].lineData[14]++;
  var TRANSITION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'TransitionEnd') : 'transitionend webkitTransitionEnd';
  _$jscoverage['/transition.js'].lineData[19]++;
  var TRANSITION = Features.getVendorCssPropName('transition');
  _$jscoverage['/transition.js'].lineData[21]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[22]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[23]++;
    S.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[2]++;
  _$jscoverage['/transition.js'].lineData[24]++;
  if (visit1_24_1(str)) {
    _$jscoverage['/transition.js'].lineData[25]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[27]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[32]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[35]++;
  function TransitionAnim() {
    _$jscoverage['/transition.js'].functionData[3]++;
    _$jscoverage['/transition.js'].lineData[36]++;
    TransitionAnim.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/transition.js'].lineData[39]++;
  S.extend(TransitionAnim, AnimBase, {
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[4]++;
  _$jscoverage['/transition.js'].lineData[41]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], transform, propsCss = {};
  _$jscoverage['/transition.js'].lineData[48]++;
  if ((transform = _propsData.transform)) {
    _$jscoverage['/transition.js'].lineData[49]++;
    delete _propsData.transform;
    _$jscoverage['/transition.js'].lineData[50]++;
    _propsData[Features.getVendorCssPropName('transform').replace(R_UPPER, '-$1').toLowerCase()] = transform;
  }
  _$jscoverage['/transition.js'].lineData[53]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[5]++;
  _$jscoverage['/transition.js'].lineData[54]++;
  var v = propData.value, currentValue = Dom.css(node, prop);
  _$jscoverage['/transition.js'].lineData[56]++;
  if (visit2_56_1(typeof v === 'number')) {
    _$jscoverage['/transition.js'].lineData[57]++;
    currentValue = parseFloat(currentValue);
  }
  _$jscoverage['/transition.js'].lineData[59]++;
  if (visit3_59_1(currentValue === v)) {
    _$jscoverage['/transition.js'].lineData[61]++;
    setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[6]++;
  _$jscoverage['/transition.js'].lineData[62]++;
  self._onTransitionEnd({
  originalEvent: {
  propertyName: prop}});
}, 0);
  }
  _$jscoverage['/transition.js'].lineData[69]++;
  propsCss[prop] = v;
});
  _$jscoverage['/transition.js'].lineData[73]++;
  if (visit4_73_1(original.indexOf('none') !== -1)) {
    _$jscoverage['/transition.js'].lineData[74]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[75]++;
    if (visit5_75_1(original)) {
      _$jscoverage['/transition.js'].lineData[76]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[80]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[83]++;
  Event.on(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
  _$jscoverage['/transition.js'].lineData[85]++;
  Dom.css(node, propsCss);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[7]++;
  _$jscoverage['/transition.js'].lineData[91]++;
  var self = this, propsData = self._propsData, tmpPropsData = S.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[95]++;
  S.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[8]++;
  _$jscoverage['/transition.js'].lineData[96]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[97]++;
  if (visit6_97_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[98]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[100]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[101]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[102]++;
    if (visit7_102_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[103]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[105]++;
      delete propsData[prop];
    }
  }
});
}, 
  _onTransitionEnd: function(e) {
  _$jscoverage['/transition.js'].functionData[9]++;
  _$jscoverage['/transition.js'].lineData[112]++;
  e = e.originalEvent;
  _$jscoverage['/transition.js'].lineData[113]++;
  var self = this, allCompleted = 1, propsData = self._propsData;
  _$jscoverage['/transition.js'].lineData[117]++;
  if (visit8_117_1(!propsData[e.propertyName])) {
    _$jscoverage['/transition.js'].lineData[118]++;
    return;
  }
  _$jscoverage['/transition.js'].lineData[122]++;
  if (visit9_122_1(propsData[e.propertyName].pos === 1)) {
    _$jscoverage['/transition.js'].lineData[123]++;
    return;
  }
  _$jscoverage['/transition.js'].lineData[125]++;
  propsData[e.propertyName].pos = 1;
  _$jscoverage['/transition.js'].lineData[126]++;
  S.each(propsData, function(propData) {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[127]++;
  if (visit10_127_1(propData.pos !== 1)) {
    _$jscoverage['/transition.js'].lineData[128]++;
    allCompleted = 0;
    _$jscoverage['/transition.js'].lineData[129]++;
    return false;
  }
  _$jscoverage['/transition.js'].lineData[131]++;
  return undefined;
});
  _$jscoverage['/transition.js'].lineData[133]++;
  if (visit11_133_1(allCompleted)) {
    _$jscoverage['/transition.js'].lineData[134]++;
    self.stop(true);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[139]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[147]++;
  Event.detach(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
  _$jscoverage['/transition.js'].lineData[148]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[149]++;
  if (visit12_149_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[150]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[152]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[156]++;
  clear = visit13_159_1(S.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[161]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[162]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[166]++;
  return TransitionAnim;
});
