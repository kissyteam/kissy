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
  _$jscoverage['/transition.js'].lineData[18] = 0;
  _$jscoverage['/transition.js'].lineData[20] = 0;
  _$jscoverage['/transition.js'].lineData[21] = 0;
  _$jscoverage['/transition.js'].lineData[22] = 0;
  _$jscoverage['/transition.js'].lineData[23] = 0;
  _$jscoverage['/transition.js'].lineData[24] = 0;
  _$jscoverage['/transition.js'].lineData[26] = 0;
  _$jscoverage['/transition.js'].lineData[31] = 0;
  _$jscoverage['/transition.js'].lineData[34] = 0;
  _$jscoverage['/transition.js'].lineData[35] = 0;
  _$jscoverage['/transition.js'].lineData[38] = 0;
  _$jscoverage['/transition.js'].lineData[40] = 0;
  _$jscoverage['/transition.js'].lineData[47] = 0;
  _$jscoverage['/transition.js'].lineData[48] = 0;
  _$jscoverage['/transition.js'].lineData[49] = 0;
  _$jscoverage['/transition.js'].lineData[52] = 0;
  _$jscoverage['/transition.js'].lineData[53] = 0;
  _$jscoverage['/transition.js'].lineData[55] = 0;
  _$jscoverage['/transition.js'].lineData[56] = 0;
  _$jscoverage['/transition.js'].lineData[58] = 0;
  _$jscoverage['/transition.js'].lineData[60] = 0;
  _$jscoverage['/transition.js'].lineData[61] = 0;
  _$jscoverage['/transition.js'].lineData[68] = 0;
  _$jscoverage['/transition.js'].lineData[72] = 0;
  _$jscoverage['/transition.js'].lineData[73] = 0;
  _$jscoverage['/transition.js'].lineData[74] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[79] = 0;
  _$jscoverage['/transition.js'].lineData[82] = 0;
  _$jscoverage['/transition.js'].lineData[84] = 0;
  _$jscoverage['/transition.js'].lineData[90] = 0;
  _$jscoverage['/transition.js'].lineData[94] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[97] = 0;
  _$jscoverage['/transition.js'].lineData[99] = 0;
  _$jscoverage['/transition.js'].lineData[100] = 0;
  _$jscoverage['/transition.js'].lineData[101] = 0;
  _$jscoverage['/transition.js'].lineData[102] = 0;
  _$jscoverage['/transition.js'].lineData[104] = 0;
  _$jscoverage['/transition.js'].lineData[111] = 0;
  _$jscoverage['/transition.js'].lineData[112] = 0;
  _$jscoverage['/transition.js'].lineData[116] = 0;
  _$jscoverage['/transition.js'].lineData[117] = 0;
  _$jscoverage['/transition.js'].lineData[119] = 0;
  _$jscoverage['/transition.js'].lineData[120] = 0;
  _$jscoverage['/transition.js'].lineData[121] = 0;
  _$jscoverage['/transition.js'].lineData[122] = 0;
  _$jscoverage['/transition.js'].lineData[123] = 0;
  _$jscoverage['/transition.js'].lineData[125] = 0;
  _$jscoverage['/transition.js'].lineData[127] = 0;
  _$jscoverage['/transition.js'].lineData[128] = 0;
  _$jscoverage['/transition.js'].lineData[133] = 0;
  _$jscoverage['/transition.js'].lineData[141] = 0;
  _$jscoverage['/transition.js'].lineData[142] = 0;
  _$jscoverage['/transition.js'].lineData[143] = 0;
  _$jscoverage['/transition.js'].lineData[144] = 0;
  _$jscoverage['/transition.js'].lineData[146] = 0;
  _$jscoverage['/transition.js'].lineData[150] = 0;
  _$jscoverage['/transition.js'].lineData[155] = 0;
  _$jscoverage['/transition.js'].lineData[156] = 0;
  _$jscoverage['/transition.js'].lineData[160] = 0;
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
  _$jscoverage['/transition.js'].branchData['23'] = [];
  _$jscoverage['/transition.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['55'] = [];
  _$jscoverage['/transition.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['58'] = [];
  _$jscoverage['/transition.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['72'] = [];
  _$jscoverage['/transition.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['74'] = [];
  _$jscoverage['/transition.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['96'] = [];
  _$jscoverage['/transition.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['101'] = [];
  _$jscoverage['/transition.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['116'] = [];
  _$jscoverage['/transition.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['121'] = [];
  _$jscoverage['/transition.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['127'] = [];
  _$jscoverage['/transition.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['143'] = [];
  _$jscoverage['/transition.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['153'] = [];
  _$jscoverage['/transition.js'].branchData['153'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['153'][1].init(7, 213, 'S.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit12_153_1(result) {
  _$jscoverage['/transition.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['143'][1].init(21, 7, '!finish');
function visit11_143_1(result) {
  _$jscoverage['/transition.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['127'][1].init(569, 12, 'allCompleted');
function visit10_127_1(result) {
  _$jscoverage['/transition.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['121'][1].init(21, 18, 'propData.pos !== 1');
function visit9_121_1(result) {
  _$jscoverage['/transition.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['116'][1].init(204, 26, '!propsData[e.propertyName]');
function visit8_116_1(result) {
  _$jscoverage['/transition.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['101'][1].init(113, 29, 'propData.duration >= tRunTime');
function visit7_101_1(result) {
  _$jscoverage['/transition.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['96'][1].init(61, 26, 'propData.delay >= tRunTime');
function visit6_96_1(result) {
  _$jscoverage['/transition.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['74'][1].init(1425, 8, 'original');
function visit5_74_1(result) {
  _$jscoverage['/transition.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['72'][1].init(1335, 31, 'original.indexOf(\'none\') !== -1');
function visit4_72_1(result) {
  _$jscoverage['/transition.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['58'][1].init(241, 18, 'currentValue === v');
function visit3_58_1(result) {
  _$jscoverage['/transition.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['55'][1].init(117, 21, 'typeof v === \'number\'');
function visit2_55_1(result) {
  _$jscoverage['/transition.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['23'][1].init(17, 3, 'str');
function visit1_23_1(result) {
  _$jscoverage['/transition.js'].branchData['23'][1].ranCondition(result);
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
  var vendorPrefix = Features.getTransitionPrefix();
  _$jscoverage['/transition.js'].lineData[13]++;
  var R_UPPER = /([A-Z]|^ms)/g;
  _$jscoverage['/transition.js'].lineData[14]++;
  var TRANSITION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'TransitionEnd') : 'transitionend';
  _$jscoverage['/transition.js'].lineData[18]++;
  var TRANSITION = Features.getTransitionProperty();
  _$jscoverage['/transition.js'].lineData[20]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[21]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[22]++;
    S.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[2]++;
  _$jscoverage['/transition.js'].lineData[23]++;
  if (visit1_23_1(str)) {
    _$jscoverage['/transition.js'].lineData[24]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[26]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[31]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[34]++;
  function TransitionAnim() {
    _$jscoverage['/transition.js'].functionData[3]++;
    _$jscoverage['/transition.js'].lineData[35]++;
    TransitionAnim.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/transition.js'].lineData[38]++;
  S.extend(TransitionAnim, AnimBase, {
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[4]++;
  _$jscoverage['/transition.js'].lineData[40]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], transform, propsCss = {};
  _$jscoverage['/transition.js'].lineData[47]++;
  if ((transform = _propsData.transform)) {
    _$jscoverage['/transition.js'].lineData[48]++;
    delete _propsData.transform;
    _$jscoverage['/transition.js'].lineData[49]++;
    _propsData[Features.getTransformProperty().replace(R_UPPER, '-$1').toLowerCase()] = transform;
  }
  _$jscoverage['/transition.js'].lineData[52]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[5]++;
  _$jscoverage['/transition.js'].lineData[53]++;
  var v = propData.value, currentValue = Dom.css(node, prop);
  _$jscoverage['/transition.js'].lineData[55]++;
  if (visit2_55_1(typeof v === 'number')) {
    _$jscoverage['/transition.js'].lineData[56]++;
    currentValue = parseFloat(currentValue);
  }
  _$jscoverage['/transition.js'].lineData[58]++;
  if (visit3_58_1(currentValue === v)) {
    _$jscoverage['/transition.js'].lineData[60]++;
    setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[6]++;
  _$jscoverage['/transition.js'].lineData[61]++;
  self._onTransitionEnd({
  originalEvent: {
  propertyName: prop}});
}, 0);
  }
  _$jscoverage['/transition.js'].lineData[68]++;
  propsCss[prop] = v;
});
  _$jscoverage['/transition.js'].lineData[72]++;
  if (visit4_72_1(original.indexOf('none') !== -1)) {
    _$jscoverage['/transition.js'].lineData[73]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[74]++;
    if (visit5_74_1(original)) {
      _$jscoverage['/transition.js'].lineData[75]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[79]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[82]++;
  Event.on(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
  _$jscoverage['/transition.js'].lineData[84]++;
  Dom.css(node, propsCss);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[7]++;
  _$jscoverage['/transition.js'].lineData[90]++;
  var self = this, propsData = self._propsData, tmpPropsData = S.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[94]++;
  S.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[8]++;
  _$jscoverage['/transition.js'].lineData[95]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[96]++;
  if (visit6_96_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[97]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[99]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[100]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[101]++;
    if (visit7_101_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[102]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[104]++;
      delete propsData[prop];
    }
  }
});
}, 
  _onTransitionEnd: function(e) {
  _$jscoverage['/transition.js'].functionData[9]++;
  _$jscoverage['/transition.js'].lineData[111]++;
  e = e.originalEvent;
  _$jscoverage['/transition.js'].lineData[112]++;
  var self = this, allCompleted = 1, propsData = self._propsData;
  _$jscoverage['/transition.js'].lineData[116]++;
  if (visit8_116_1(!propsData[e.propertyName])) {
    _$jscoverage['/transition.js'].lineData[117]++;
    return;
  }
  _$jscoverage['/transition.js'].lineData[119]++;
  propsData[e.propertyName].pos = 1;
  _$jscoverage['/transition.js'].lineData[120]++;
  S.each(propsData, function(propData) {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[121]++;
  if (visit9_121_1(propData.pos !== 1)) {
    _$jscoverage['/transition.js'].lineData[122]++;
    allCompleted = 0;
    _$jscoverage['/transition.js'].lineData[123]++;
    return false;
  }
  _$jscoverage['/transition.js'].lineData[125]++;
  return undefined;
});
  _$jscoverage['/transition.js'].lineData[127]++;
  if (visit10_127_1(allCompleted)) {
    _$jscoverage['/transition.js'].lineData[128]++;
    self.stop(true);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[133]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[141]++;
  Event.detach(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
  _$jscoverage['/transition.js'].lineData[142]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[143]++;
  if (visit11_143_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[144]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[146]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[150]++;
  clear = visit12_153_1(S.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[155]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[156]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[160]++;
  return TransitionAnim;
});
