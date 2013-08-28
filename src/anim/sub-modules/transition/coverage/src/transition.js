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
  _$jscoverage['/transition.js'].lineData[10] = 0;
  _$jscoverage['/transition.js'].lineData[14] = 0;
  _$jscoverage['/transition.js'].lineData[16] = 0;
  _$jscoverage['/transition.js'].lineData[17] = 0;
  _$jscoverage['/transition.js'].lineData[18] = 0;
  _$jscoverage['/transition.js'].lineData[19] = 0;
  _$jscoverage['/transition.js'].lineData[20] = 0;
  _$jscoverage['/transition.js'].lineData[22] = 0;
  _$jscoverage['/transition.js'].lineData[27] = 0;
  _$jscoverage['/transition.js'].lineData[30] = 0;
  _$jscoverage['/transition.js'].lineData[31] = 0;
  _$jscoverage['/transition.js'].lineData[34] = 0;
  _$jscoverage['/transition.js'].lineData[36] = 0;
  _$jscoverage['/transition.js'].lineData[43] = 0;
  _$jscoverage['/transition.js'].lineData[44] = 0;
  _$jscoverage['/transition.js'].lineData[45] = 0;
  _$jscoverage['/transition.js'].lineData[48] = 0;
  _$jscoverage['/transition.js'].lineData[49] = 0;
  _$jscoverage['/transition.js'].lineData[51] = 0;
  _$jscoverage['/transition.js'].lineData[52] = 0;
  _$jscoverage['/transition.js'].lineData[54] = 0;
  _$jscoverage['/transition.js'].lineData[56] = 0;
  _$jscoverage['/transition.js'].lineData[57] = 0;
  _$jscoverage['/transition.js'].lineData[64] = 0;
  _$jscoverage['/transition.js'].lineData[68] = 0;
  _$jscoverage['/transition.js'].lineData[69] = 0;
  _$jscoverage['/transition.js'].lineData[70] = 0;
  _$jscoverage['/transition.js'].lineData[71] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[78] = 0;
  _$jscoverage['/transition.js'].lineData[80] = 0;
  _$jscoverage['/transition.js'].lineData[86] = 0;
  _$jscoverage['/transition.js'].lineData[90] = 0;
  _$jscoverage['/transition.js'].lineData[91] = 0;
  _$jscoverage['/transition.js'].lineData[92] = 0;
  _$jscoverage['/transition.js'].lineData[93] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[97] = 0;
  _$jscoverage['/transition.js'].lineData[98] = 0;
  _$jscoverage['/transition.js'].lineData[100] = 0;
  _$jscoverage['/transition.js'].lineData[107] = 0;
  _$jscoverage['/transition.js'].lineData[108] = 0;
  _$jscoverage['/transition.js'].lineData[112] = 0;
  _$jscoverage['/transition.js'].lineData[113] = 0;
  _$jscoverage['/transition.js'].lineData[115] = 0;
  _$jscoverage['/transition.js'].lineData[116] = 0;
  _$jscoverage['/transition.js'].lineData[117] = 0;
  _$jscoverage['/transition.js'].lineData[118] = 0;
  _$jscoverage['/transition.js'].lineData[119] = 0;
  _$jscoverage['/transition.js'].lineData[121] = 0;
  _$jscoverage['/transition.js'].lineData[123] = 0;
  _$jscoverage['/transition.js'].lineData[124] = 0;
  _$jscoverage['/transition.js'].lineData[129] = 0;
  _$jscoverage['/transition.js'].lineData[137] = 0;
  _$jscoverage['/transition.js'].lineData[138] = 0;
  _$jscoverage['/transition.js'].lineData[139] = 0;
  _$jscoverage['/transition.js'].lineData[140] = 0;
  _$jscoverage['/transition.js'].lineData[142] = 0;
  _$jscoverage['/transition.js'].lineData[146] = 0;
  _$jscoverage['/transition.js'].lineData[152] = 0;
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
  _$jscoverage['/transition.js'].branchData['19'] = [];
  _$jscoverage['/transition.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['43'] = [];
  _$jscoverage['/transition.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['51'] = [];
  _$jscoverage['/transition.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['54'] = [];
  _$jscoverage['/transition.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['68'] = [];
  _$jscoverage['/transition.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['70'] = [];
  _$jscoverage['/transition.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['92'] = [];
  _$jscoverage['/transition.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['97'] = [];
  _$jscoverage['/transition.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['112'] = [];
  _$jscoverage['/transition.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['117'] = [];
  _$jscoverage['/transition.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['123'] = [];
  _$jscoverage['/transition.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['139'] = [];
  _$jscoverage['/transition.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['149'] = [];
  _$jscoverage['/transition.js'].branchData['149'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['149'][1].init(7, 216, 'S.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit13_149_1(result) {
  _$jscoverage['/transition.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['139'][1].init(22, 7, '!finish');
function visit12_139_1(result) {
  _$jscoverage['/transition.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['123'][1].init(584, 12, 'allCompleted');
function visit11_123_1(result) {
  _$jscoverage['/transition.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['117'][1].init(22, 16, 'propData.pos !== 1');
function visit10_117_1(result) {
  _$jscoverage['/transition.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['112'][1].init(210, 26, '!propsData[e.propertyName]');
function visit9_112_1(result) {
  _$jscoverage['/transition.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['97'][1].init(116, 29, 'propData.duration >= tRunTime');
function visit8_97_1(result) {
  _$jscoverage['/transition.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['92'][1].init(63, 26, 'propData.delay >= tRunTime');
function visit7_92_1(result) {
  _$jscoverage['/transition.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['70'][1].init(1455, 8, 'original');
function visit6_70_1(result) {
  _$jscoverage['/transition.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['68'][1].init(1364, 30, 'original.indexOf(\'none\') != -1');
function visit5_68_1(result) {
  _$jscoverage['/transition.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['54'][1].init(246, 17, 'currentValue == v');
function visit4_54_1(result) {
  _$jscoverage['/transition.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['51'][1].init(120, 20, 'typeof v == \'number\'');
function visit3_51_1(result) {
  _$jscoverage['/transition.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['43'][1].init(278, 32, 'transform = _propsData.transform');
function visit2_43_1(result) {
  _$jscoverage['/transition.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['19'][1].init(18, 3, 'str');
function visit1_19_1(result) {
  _$jscoverage['/transition.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].lineData[6]++;
KISSY.add('anim/transition', function(S, Dom, Event, AnimBase) {
  _$jscoverage['/transition.js'].functionData[0]++;
  _$jscoverage['/transition.js'].lineData[7]++;
  var Features = S.Features;
  _$jscoverage['/transition.js'].lineData[8]++;
  var vendorPrefix = Features.getTransitionPrefix();
  _$jscoverage['/transition.js'].lineData[9]++;
  var R_UPPER = /([A-Z]|^ms)/g;
  _$jscoverage['/transition.js'].lineData[10]++;
  var TRANSITION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'TransitionEnd') : 'transitionend';
  _$jscoverage['/transition.js'].lineData[14]++;
  var TRANSITION = Features.getTransitionProperty();
  _$jscoverage['/transition.js'].lineData[16]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[17]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[18]++;
    S.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[2]++;
  _$jscoverage['/transition.js'].lineData[19]++;
  if (visit1_19_1(str)) {
    _$jscoverage['/transition.js'].lineData[20]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[22]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[27]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[30]++;
  function TransitionAnim(config) {
    _$jscoverage['/transition.js'].functionData[3]++;
    _$jscoverage['/transition.js'].lineData[31]++;
    TransitionAnim.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/transition.js'].lineData[34]++;
  S.extend(TransitionAnim, AnimBase, {
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[4]++;
  _$jscoverage['/transition.js'].lineData[36]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], transform, propsCss = {};
  _$jscoverage['/transition.js'].lineData[43]++;
  if (visit2_43_1(transform = _propsData.transform)) {
    _$jscoverage['/transition.js'].lineData[44]++;
    delete _propsData.transform;
    _$jscoverage['/transition.js'].lineData[45]++;
    _propsData[Features.getTransformProperty().replace(R_UPPER, '-$1').toLowerCase()] = transform;
  }
  _$jscoverage['/transition.js'].lineData[48]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[5]++;
  _$jscoverage['/transition.js'].lineData[49]++;
  var v = propData.value, currentValue = Dom.css(node, prop);
  _$jscoverage['/transition.js'].lineData[51]++;
  if (visit3_51_1(typeof v == 'number')) {
    _$jscoverage['/transition.js'].lineData[52]++;
    currentValue = parseFloat(currentValue);
  }
  _$jscoverage['/transition.js'].lineData[54]++;
  if (visit4_54_1(currentValue == v)) {
    _$jscoverage['/transition.js'].lineData[56]++;
    setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[6]++;
  _$jscoverage['/transition.js'].lineData[57]++;
  self._onTransitionEnd({
  originalEvent: {
  propertyName: prop}});
}, 0);
  }
  _$jscoverage['/transition.js'].lineData[64]++;
  propsCss[prop] = v;
});
  _$jscoverage['/transition.js'].lineData[68]++;
  if (visit5_68_1(original.indexOf('none') != -1)) {
    _$jscoverage['/transition.js'].lineData[69]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[70]++;
    if (visit6_70_1(original)) {
      _$jscoverage['/transition.js'].lineData[71]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[75]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[78]++;
  Event.on(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
  _$jscoverage['/transition.js'].lineData[80]++;
  Dom.css(node, propsCss);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[7]++;
  _$jscoverage['/transition.js'].lineData[86]++;
  var self = this, propsData = self._propsData, tmpPropsData = S.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[90]++;
  S.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[8]++;
  _$jscoverage['/transition.js'].lineData[91]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[92]++;
  if (visit7_92_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[93]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[95]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[96]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[97]++;
    if (visit8_97_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[98]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[100]++;
      delete propsData[prop];
    }
  }
});
}, 
  _onTransitionEnd: function(e) {
  _$jscoverage['/transition.js'].functionData[9]++;
  _$jscoverage['/transition.js'].lineData[107]++;
  e = e.originalEvent;
  _$jscoverage['/transition.js'].lineData[108]++;
  var self = this, allCompleted = 1, propsData = self._propsData;
  _$jscoverage['/transition.js'].lineData[112]++;
  if (visit9_112_1(!propsData[e.propertyName])) {
    _$jscoverage['/transition.js'].lineData[113]++;
    return;
  }
  _$jscoverage['/transition.js'].lineData[115]++;
  propsData[e.propertyName].pos = 1;
  _$jscoverage['/transition.js'].lineData[116]++;
  S.each(propsData, function(propData) {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[117]++;
  if (visit10_117_1(propData.pos !== 1)) {
    _$jscoverage['/transition.js'].lineData[118]++;
    allCompleted = 0;
    _$jscoverage['/transition.js'].lineData[119]++;
    return false;
  }
  _$jscoverage['/transition.js'].lineData[121]++;
  return undefined;
});
  _$jscoverage['/transition.js'].lineData[123]++;
  if (visit11_123_1(allCompleted)) {
    _$jscoverage['/transition.js'].lineData[124]++;
    self.stop(true);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[129]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[137]++;
  Event.detach(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
  _$jscoverage['/transition.js'].lineData[138]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[139]++;
  if (visit12_139_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[140]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[142]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[146]++;
  clear = visit13_149_1(S.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[152]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[156]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[160]++;
  return TransitionAnim;
}, {
  requires: ['dom', 'event', './base']});
