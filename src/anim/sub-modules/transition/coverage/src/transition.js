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
  _$jscoverage['/transition.js'].lineData[11] = 0;
  _$jscoverage['/transition.js'].lineData[12] = 0;
  _$jscoverage['/transition.js'].lineData[13] = 0;
  _$jscoverage['/transition.js'].lineData[14] = 0;
  _$jscoverage['/transition.js'].lineData[15] = 0;
  _$jscoverage['/transition.js'].lineData[23] = 0;
  _$jscoverage['/transition.js'].lineData[24] = 0;
  _$jscoverage['/transition.js'].lineData[25] = 0;
  _$jscoverage['/transition.js'].lineData[26] = 0;
  _$jscoverage['/transition.js'].lineData[27] = 0;
  _$jscoverage['/transition.js'].lineData[29] = 0;
  _$jscoverage['/transition.js'].lineData[32] = 0;
  _$jscoverage['/transition.js'].lineData[35] = 0;
  _$jscoverage['/transition.js'].lineData[36] = 0;
  _$jscoverage['/transition.js'].lineData[37] = 0;
  _$jscoverage['/transition.js'].lineData[41] = 0;
  _$jscoverage['/transition.js'].lineData[42] = 0;
  _$jscoverage['/transition.js'].lineData[43] = 0;
  _$jscoverage['/transition.js'].lineData[44] = 0;
  _$jscoverage['/transition.js'].lineData[46] = 0;
  _$jscoverage['/transition.js'].lineData[49] = 0;
  _$jscoverage['/transition.js'].lineData[51] = 0;
  _$jscoverage['/transition.js'].lineData[53] = 0;
  _$jscoverage['/transition.js'].lineData[54] = 0;
  _$jscoverage['/transition.js'].lineData[55] = 0;
  _$jscoverage['/transition.js'].lineData[56] = 0;
  _$jscoverage['/transition.js'].lineData[57] = 0;
  _$jscoverage['/transition.js'].lineData[58] = 0;
  _$jscoverage['/transition.js'].lineData[59] = 0;
  _$jscoverage['/transition.js'].lineData[60] = 0;
  _$jscoverage['/transition.js'].lineData[63] = 0;
  _$jscoverage['/transition.js'].lineData[65] = 0;
  _$jscoverage['/transition.js'].lineData[66] = 0;
  _$jscoverage['/transition.js'].lineData[67] = 0;
  _$jscoverage['/transition.js'].lineData[69] = 0;
  _$jscoverage['/transition.js'].lineData[71] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[83] = 0;
  _$jscoverage['/transition.js'].lineData[84] = 0;
  _$jscoverage['/transition.js'].lineData[86] = 0;
  _$jscoverage['/transition.js'].lineData[87] = 0;
  _$jscoverage['/transition.js'].lineData[88] = 0;
  _$jscoverage['/transition.js'].lineData[93] = 0;
  _$jscoverage['/transition.js'].lineData[94] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[99] = 0;
  _$jscoverage['/transition.js'].lineData[102] = 0;
  _$jscoverage['/transition.js'].lineData[103] = 0;
  _$jscoverage['/transition.js'].lineData[107] = 0;
  _$jscoverage['/transition.js'].lineData[108] = 0;
  _$jscoverage['/transition.js'].lineData[115] = 0;
  _$jscoverage['/transition.js'].lineData[119] = 0;
  _$jscoverage['/transition.js'].lineData[120] = 0;
  _$jscoverage['/transition.js'].lineData[121] = 0;
  _$jscoverage['/transition.js'].lineData[122] = 0;
  _$jscoverage['/transition.js'].lineData[124] = 0;
  _$jscoverage['/transition.js'].lineData[125] = 0;
  _$jscoverage['/transition.js'].lineData[126] = 0;
  _$jscoverage['/transition.js'].lineData[127] = 0;
  _$jscoverage['/transition.js'].lineData[129] = 0;
  _$jscoverage['/transition.js'].lineData[136] = 0;
  _$jscoverage['/transition.js'].lineData[144] = 0;
  _$jscoverage['/transition.js'].lineData[145] = 0;
  _$jscoverage['/transition.js'].lineData[146] = 0;
  _$jscoverage['/transition.js'].lineData[149] = 0;
  _$jscoverage['/transition.js'].lineData[150] = 0;
  _$jscoverage['/transition.js'].lineData[151] = 0;
  _$jscoverage['/transition.js'].lineData[153] = 0;
  _$jscoverage['/transition.js'].lineData[157] = 0;
  _$jscoverage['/transition.js'].lineData[162] = 0;
  _$jscoverage['/transition.js'].lineData[163] = 0;
  _$jscoverage['/transition.js'].lineData[167] = 0;
  _$jscoverage['/transition.js'].lineData[170] = 0;
  _$jscoverage['/transition.js'].lineData[172] = 0;
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
  _$jscoverage['/transition.js'].functionData[13] = 0;
  _$jscoverage['/transition.js'].functionData[14] = 0;
}
if (! _$jscoverage['/transition.js'].branchData) {
  _$jscoverage['/transition.js'].branchData = {};
  _$jscoverage['/transition.js'].branchData['26'] = [];
  _$jscoverage['/transition.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['43'] = [];
  _$jscoverage['/transition.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['58'] = [];
  _$jscoverage['/transition.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['59'] = [];
  _$jscoverage['/transition.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['66'] = [];
  _$jscoverage['/transition.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['93'] = [];
  _$jscoverage['/transition.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['95'] = [];
  _$jscoverage['/transition.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['121'] = [];
  _$jscoverage['/transition.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['126'] = [];
  _$jscoverage['/transition.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['144'] = [];
  _$jscoverage['/transition.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['150'] = [];
  _$jscoverage['/transition.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['160'] = [];
  _$jscoverage['/transition.js'].branchData['160'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['160'][1].init(7, 219, 'util.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit12_160_1(result) {
  _$jscoverage['/transition.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['150'][1].init(22, 7, '!finish');
function visit11_150_1(result) {
  _$jscoverage['/transition.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['144'][1].init(259, 24, 'self._transitionEndTimer');
function visit10_144_1(result) {
  _$jscoverage['/transition.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['126'][1].init(116, 29, 'propData.duration >= tRunTime');
function visit9_126_1(result) {
  _$jscoverage['/transition.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['121'][1].init(63, 26, 'propData.delay >= tRunTime');
function visit8_121_1(result) {
  _$jscoverage['/transition.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['95'][1].init(802, 8, 'original');
function visit7_95_1(result) {
  _$jscoverage['/transition.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['93'][1].init(710, 31, 'original.indexOf(\'none\') !== -1');
function visit6_93_1(result) {
  _$jscoverage['/transition.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['66'][1].init(457, 11, '!vendorInfo');
function visit5_66_1(result) {
  _$jscoverage['/transition.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['59'][1].init(26, 69, '!util.startsWith(val.easing, \'cubic-bezier\') && !css3Anim[val.easing]');
function visit4_59_1(result) {
  _$jscoverage['/transition.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['58'][1].init(70, 30, 'typeof val.easing === \'string\'');
function visit3_58_1(result) {
  _$jscoverage['/transition.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['43'][1].init(40, 34, '!(self instanceof TransitionAnim)');
function visit2_43_1(result) {
  _$jscoverage['/transition.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['26'][1].init(18, 3, 'str');
function visit1_26_1(result) {
  _$jscoverage['/transition.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/transition.js'].functionData[0]++;
  _$jscoverage['/transition.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/transition.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/transition.js'].lineData[9]++;
  var AnimBase = require('./base');
  _$jscoverage['/transition.js'].lineData[10]++;
  var Feature = require('feature');
  _$jscoverage['/transition.js'].lineData[11]++;
  var getCssVendorInfo = Feature.getCssVendorInfo;
  _$jscoverage['/transition.js'].lineData[12]++;
  var transitionVendorInfo = getCssVendorInfo('transition');
  _$jscoverage['/transition.js'].lineData[13]++;
  var TRANSITION = transitionVendorInfo.propertyName;
  _$jscoverage['/transition.js'].lineData[14]++;
  var DEFAULT_EASING = 'linear';
  _$jscoverage['/transition.js'].lineData[15]++;
  var css3Anim = {
  ease: 1, 
  linear: 1, 
  'ease-in': 1, 
  'ease-out': 1, 
  'ease-in-out': 1};
  _$jscoverage['/transition.js'].lineData[23]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[24]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[25]++;
    util.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[2]++;
  _$jscoverage['/transition.js'].lineData[26]++;
  if (visit1_26_1(str)) {
    _$jscoverage['/transition.js'].lineData[27]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[29]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[32]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[35]++;
  function unCamelCase(propertyName) {
    _$jscoverage['/transition.js'].functionData[3]++;
    _$jscoverage['/transition.js'].lineData[36]++;
    return propertyName.replace(/[A-Z]/g, function(m) {
  _$jscoverage['/transition.js'].functionData[4]++;
  _$jscoverage['/transition.js'].lineData[37]++;
  return '-' + m.toLowerCase();
});
  }
  _$jscoverage['/transition.js'].lineData[41]++;
  function TransitionAnim(node, to, duration, easing, complete) {
    _$jscoverage['/transition.js'].functionData[5]++;
    _$jscoverage['/transition.js'].lineData[42]++;
    var self = this;
    _$jscoverage['/transition.js'].lineData[43]++;
    if (visit2_43_1(!(self instanceof TransitionAnim))) {
      _$jscoverage['/transition.js'].lineData[44]++;
      return new TransitionAnim(node, to, duration, easing, complete);
    }
    _$jscoverage['/transition.js'].lineData[46]++;
    TransitionAnim.superclass.constructor.apply(self, arguments);
  }
  _$jscoverage['/transition.js'].lineData[49]++;
  util.extend(TransitionAnim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/transition.js'].functionData[6]++;
  _$jscoverage['/transition.js'].lineData[51]++;
  var self = this, propsData = self._propsData;
  _$jscoverage['/transition.js'].lineData[53]++;
  var newProps = {};
  _$jscoverage['/transition.js'].lineData[54]++;
  var val;
  _$jscoverage['/transition.js'].lineData[55]++;
  var vendorInfo;
  _$jscoverage['/transition.js'].lineData[56]++;
  for (var propertyName in propsData) {
    _$jscoverage['/transition.js'].lineData[57]++;
    val = propsData[propertyName];
    _$jscoverage['/transition.js'].lineData[58]++;
    if (visit3_58_1(typeof val.easing === 'string')) {
      _$jscoverage['/transition.js'].lineData[59]++;
      if (visit4_59_1(!util.startsWith(val.easing, 'cubic-bezier') && !css3Anim[val.easing])) {
        _$jscoverage['/transition.js'].lineData[60]++;
        val.easing = DEFAULT_EASING;
      }
    } else {
      _$jscoverage['/transition.js'].lineData[63]++;
      val.easing = DEFAULT_EASING;
    }
    _$jscoverage['/transition.js'].lineData[65]++;
    vendorInfo = getCssVendorInfo(propertyName);
    _$jscoverage['/transition.js'].lineData[66]++;
    if (visit5_66_1(!vendorInfo)) {
      _$jscoverage['/transition.js'].lineData[67]++;
      S.error('unsupported css property for transition anim: ' + propertyName);
    }
    _$jscoverage['/transition.js'].lineData[69]++;
    newProps[unCamelCase(vendorInfo.propertyName)] = propsData[propertyName];
  }
  _$jscoverage['/transition.js'].lineData[71]++;
  self._propsData = newProps;
}, 
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[7]++;
  _$jscoverage['/transition.js'].lineData[75]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], totalDuration = 0, propsCss = {};
  _$jscoverage['/transition.js'].lineData[83]++;
  util.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[8]++;
  _$jscoverage['/transition.js'].lineData[84]++;
  var v = propData.value;
  _$jscoverage['/transition.js'].lineData[86]++;
  Dom.css(node, prop, Dom.css(node, prop));
  _$jscoverage['/transition.js'].lineData[87]++;
  propsCss[prop] = v;
  _$jscoverage['/transition.js'].lineData[88]++;
  totalDuration = Math.max(propData.duration + propData.delay, totalDuration);
});
  _$jscoverage['/transition.js'].lineData[93]++;
  if (visit6_93_1(original.indexOf('none') !== -1)) {
    _$jscoverage['/transition.js'].lineData[94]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[95]++;
    if (visit7_95_1(original)) {
      _$jscoverage['/transition.js'].lineData[96]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[99]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[102]++;
  setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[9]++;
  _$jscoverage['/transition.js'].lineData[103]++;
  Dom.css(node, propsCss);
}, 0);
  _$jscoverage['/transition.js'].lineData[107]++;
  self._transitionEndTimer = setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[108]++;
  self.stop(true);
}, totalDuration * 1000);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[115]++;
  var self = this, propsData = self._propsData, tmpPropsData = util.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[119]++;
  util.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[120]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[121]++;
  if (visit8_121_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[122]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[124]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[125]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[126]++;
    if (visit9_126_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[127]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[129]++;
      delete propsData[prop];
    }
  }
});
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[13]++;
  _$jscoverage['/transition.js'].lineData[136]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[144]++;
  if (visit10_144_1(self._transitionEndTimer)) {
    _$jscoverage['/transition.js'].lineData[145]++;
    clearTimeout(self._transitionEndTimer);
    _$jscoverage['/transition.js'].lineData[146]++;
    self._transitionEndTimer = null;
  }
  _$jscoverage['/transition.js'].lineData[149]++;
  util.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[14]++;
  _$jscoverage['/transition.js'].lineData[150]++;
  if (visit11_150_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[151]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[153]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[157]++;
  clear = visit12_160_1(util.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[162]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[163]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[167]++;
  util.mix(TransitionAnim, AnimBase.Statics);
  _$jscoverage['/transition.js'].lineData[170]++;
  S.Anim = TransitionAnim;
  _$jscoverage['/transition.js'].lineData[172]++;
  return TransitionAnim;
});
