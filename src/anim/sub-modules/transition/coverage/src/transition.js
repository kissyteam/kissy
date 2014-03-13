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
  _$jscoverage['/transition.js'].lineData[18] = 0;
  _$jscoverage['/transition.js'].lineData[20] = 0;
  _$jscoverage['/transition.js'].lineData[21] = 0;
  _$jscoverage['/transition.js'].lineData[22] = 0;
  _$jscoverage['/transition.js'].lineData[23] = 0;
  _$jscoverage['/transition.js'].lineData[24] = 0;
  _$jscoverage['/transition.js'].lineData[26] = 0;
  _$jscoverage['/transition.js'].lineData[29] = 0;
  _$jscoverage['/transition.js'].lineData[30] = 0;
  _$jscoverage['/transition.js'].lineData[31] = 0;
  _$jscoverage['/transition.js'].lineData[32] = 0;
  _$jscoverage['/transition.js'].lineData[33] = 0;
  _$jscoverage['/transition.js'].lineData[35] = 0;
  _$jscoverage['/transition.js'].lineData[40] = 0;
  _$jscoverage['/transition.js'].lineData[43] = 0;
  _$jscoverage['/transition.js'].lineData[44] = 0;
  _$jscoverage['/transition.js'].lineData[48] = 0;
  _$jscoverage['/transition.js'].lineData[49] = 0;
  _$jscoverage['/transition.js'].lineData[53] = 0;
  _$jscoverage['/transition.js'].lineData[54] = 0;
  _$jscoverage['/transition.js'].lineData[56] = 0;
  _$jscoverage['/transition.js'].lineData[57] = 0;
  _$jscoverage['/transition.js'].lineData[58] = 0;
  _$jscoverage['/transition.js'].lineData[59] = 0;
  _$jscoverage['/transition.js'].lineData[60] = 0;
  _$jscoverage['/transition.js'].lineData[62] = 0;
  _$jscoverage['/transition.js'].lineData[64] = 0;
  _$jscoverage['/transition.js'].lineData[65] = 0;
  _$jscoverage['/transition.js'].lineData[69] = 0;
  _$jscoverage['/transition.js'].lineData[70] = 0;
  _$jscoverage['/transition.js'].lineData[71] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[76] = 0;
  _$jscoverage['/transition.js'].lineData[77] = 0;
  _$jscoverage['/transition.js'].lineData[78] = 0;
  _$jscoverage['/transition.js'].lineData[80] = 0;
  _$jscoverage['/transition.js'].lineData[81] = 0;
  _$jscoverage['/transition.js'].lineData[82] = 0;
  _$jscoverage['/transition.js'].lineData[86] = 0;
  _$jscoverage['/transition.js'].lineData[88] = 0;
  _$jscoverage['/transition.js'].lineData[94] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[98] = 0;
  _$jscoverage['/transition.js'].lineData[99] = 0;
  _$jscoverage['/transition.js'].lineData[101] = 0;
  _$jscoverage['/transition.js'].lineData[103] = 0;
  _$jscoverage['/transition.js'].lineData[104] = 0;
  _$jscoverage['/transition.js'].lineData[109] = 0;
  _$jscoverage['/transition.js'].lineData[113] = 0;
  _$jscoverage['/transition.js'].lineData[114] = 0;
  _$jscoverage['/transition.js'].lineData[115] = 0;
  _$jscoverage['/transition.js'].lineData[116] = 0;
  _$jscoverage['/transition.js'].lineData[118] = 0;
  _$jscoverage['/transition.js'].lineData[119] = 0;
  _$jscoverage['/transition.js'].lineData[120] = 0;
  _$jscoverage['/transition.js'].lineData[126] = 0;
  _$jscoverage['/transition.js'].lineData[130] = 0;
  _$jscoverage['/transition.js'].lineData[131] = 0;
  _$jscoverage['/transition.js'].lineData[132] = 0;
  _$jscoverage['/transition.js'].lineData[133] = 0;
  _$jscoverage['/transition.js'].lineData[135] = 0;
  _$jscoverage['/transition.js'].lineData[136] = 0;
  _$jscoverage['/transition.js'].lineData[137] = 0;
  _$jscoverage['/transition.js'].lineData[138] = 0;
  _$jscoverage['/transition.js'].lineData[140] = 0;
  _$jscoverage['/transition.js'].lineData[147] = 0;
  _$jscoverage['/transition.js'].lineData[155] = 0;
  _$jscoverage['/transition.js'].lineData[157] = 0;
  _$jscoverage['/transition.js'].lineData[158] = 0;
  _$jscoverage['/transition.js'].lineData[159] = 0;
  _$jscoverage['/transition.js'].lineData[161] = 0;
  _$jscoverage['/transition.js'].lineData[165] = 0;
  _$jscoverage['/transition.js'].lineData[170] = 0;
  _$jscoverage['/transition.js'].lineData[171] = 0;
  _$jscoverage['/transition.js'].lineData[175] = 0;
  _$jscoverage['/transition.js'].lineData[177] = 0;
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
  _$jscoverage['/transition.js'].functionData[15] = 0;
  _$jscoverage['/transition.js'].functionData[16] = 0;
}
if (! _$jscoverage['/transition.js'].branchData) {
  _$jscoverage['/transition.js'].branchData = {};
  _$jscoverage['/transition.js'].branchData['23'] = [];
  _$jscoverage['/transition.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['32'] = [];
  _$jscoverage['/transition.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['48'] = [];
  _$jscoverage['/transition.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['53'] = [];
  _$jscoverage['/transition.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['58'] = [];
  _$jscoverage['/transition.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['64'] = [];
  _$jscoverage['/transition.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['77'] = [];
  _$jscoverage['/transition.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['98'] = [];
  _$jscoverage['/transition.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['101'] = [];
  _$jscoverage['/transition.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['113'] = [];
  _$jscoverage['/transition.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['115'] = [];
  _$jscoverage['/transition.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['132'] = [];
  _$jscoverage['/transition.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['137'] = [];
  _$jscoverage['/transition.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['158'] = [];
  _$jscoverage['/transition.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['168'] = [];
  _$jscoverage['/transition.js'].branchData['168'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['168'][1].init(7, 213, 'S.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit15_168_1(result) {
  _$jscoverage['/transition.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['158'][1].init(21, 7, '!finish');
function visit14_158_1(result) {
  _$jscoverage['/transition.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['137'][1].init(113, 29, 'propData.duration >= tRunTime');
function visit13_137_1(result) {
  _$jscoverage['/transition.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['132'][1].init(61, 26, 'propData.delay >= tRunTime');
function visit12_132_1(result) {
  _$jscoverage['/transition.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['115'][1].init(1134, 8, 'original');
function visit11_115_1(result) {
  _$jscoverage['/transition.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['113'][1].init(1044, 31, 'original.indexOf(\'none\') !== -1');
function visit10_113_1(result) {
  _$jscoverage['/transition.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['101'][1].init(241, 18, 'currentValue === v');
function visit9_101_1(result) {
  _$jscoverage['/transition.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['98'][1].init(117, 21, 'typeof v === \'number\'');
function visit8_98_1(result) {
  _$jscoverage['/transition.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['77'][1].init(37, 34, '!(self instanceof TransitionAnim)');
function visit7_77_1(result) {
  _$jscoverage['/transition.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['64'][1].init(685, 12, 'allCompleted');
function visit6_64_1(result) {
  _$jscoverage['/transition.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['58'][1].init(17, 18, 'propData.pos !== 1');
function visit5_58_1(result) {
  _$jscoverage['/transition.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['53'][1].init(359, 33, 'propsData[propertyName].pos === 1');
function visit4_53_1(result) {
  _$jscoverage['/transition.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['48'][1].init(169, 24, '!propsData[propertyName]');
function visit3_48_1(result) {
  _$jscoverage['/transition.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['32'][1].init(17, 3, 'str');
function visit2_32_1(result) {
  _$jscoverage['/transition.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['23'][1].init(109, 5, 'i < l');
function visit1_23_1(result) {
  _$jscoverage['/transition.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/transition.js'].functionData[0]++;
  _$jscoverage['/transition.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/transition.js'].lineData[8]++;
  var AnimBase = require('./base');
  _$jscoverage['/transition.js'].lineData[9]++;
  var Feature = S.Feature;
  _$jscoverage['/transition.js'].lineData[10]++;
  var getCssVendorInfo = Feature.getCssVendorInfo;
  _$jscoverage['/transition.js'].lineData[11]++;
  var transitionVendorInfo = getCssVendorInfo('transition');
  _$jscoverage['/transition.js'].lineData[12]++;
  var vendorPrefix = transitionVendorInfo.propertyNamePrefix;
  _$jscoverage['/transition.js'].lineData[13]++;
  var TRANSITION_END_EVENT = vendorPrefix ? ([vendorPrefix.toLowerCase() + 'TransitionEnd']) : ['transitionend', 'webkitTransitionEnd'];
  _$jscoverage['/transition.js'].lineData[18]++;
  var TRANSITION = transitionVendorInfo.propertyName;
  _$jscoverage['/transition.js'].lineData[20]++;
  function normalizeCssName(propsData) {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[21]++;
    var names = S.keys(propsData);
    _$jscoverage['/transition.js'].lineData[22]++;
    var newProps = {};
    _$jscoverage['/transition.js'].lineData[23]++;
    for (var i = 0, l = names.length; visit1_23_1(i < l); i++) {
      _$jscoverage['/transition.js'].lineData[24]++;
      newProps[getCssVendorInfo(names[i]).name] = propsData[names[i]];
    }
    _$jscoverage['/transition.js'].lineData[26]++;
    return newProps;
  }
  _$jscoverage['/transition.js'].lineData[29]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[2]++;
    _$jscoverage['/transition.js'].lineData[30]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[31]++;
    S.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[3]++;
  _$jscoverage['/transition.js'].lineData[32]++;
  if (visit2_32_1(str)) {
    _$jscoverage['/transition.js'].lineData[33]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[35]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[40]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[43]++;
  function onTransitionEnd(self, e) {
    _$jscoverage['/transition.js'].functionData[4]++;
    _$jscoverage['/transition.js'].lineData[44]++;
    var allCompleted = 1, propertyName = e.propertyName, propsData = self._propsData;
    _$jscoverage['/transition.js'].lineData[48]++;
    if (visit3_48_1(!propsData[propertyName])) {
      _$jscoverage['/transition.js'].lineData[49]++;
      return;
    }
    _$jscoverage['/transition.js'].lineData[53]++;
    if (visit4_53_1(propsData[propertyName].pos === 1)) {
      _$jscoverage['/transition.js'].lineData[54]++;
      return;
    }
    _$jscoverage['/transition.js'].lineData[56]++;
    propsData[propertyName].pos = 1;
    _$jscoverage['/transition.js'].lineData[57]++;
    S.each(propsData, function(propData) {
  _$jscoverage['/transition.js'].functionData[5]++;
  _$jscoverage['/transition.js'].lineData[58]++;
  if (visit5_58_1(propData.pos !== 1)) {
    _$jscoverage['/transition.js'].lineData[59]++;
    allCompleted = 0;
    _$jscoverage['/transition.js'].lineData[60]++;
    return false;
  }
  _$jscoverage['/transition.js'].lineData[62]++;
  return undefined;
});
    _$jscoverage['/transition.js'].lineData[64]++;
    if (visit6_64_1(allCompleted)) {
      _$jscoverage['/transition.js'].lineData[65]++;
      self.stop(true);
    }
  }
  _$jscoverage['/transition.js'].lineData[69]++;
  function bindEnd(el, fn, remove) {
    _$jscoverage['/transition.js'].functionData[6]++;
    _$jscoverage['/transition.js'].lineData[70]++;
    S.each(TRANSITION_END_EVENT, function(e) {
  _$jscoverage['/transition.js'].functionData[7]++;
  _$jscoverage['/transition.js'].lineData[71]++;
  el[remove ? 'removeEventListener' : 'addEventListener'](e, fn, false);
});
  }
  _$jscoverage['/transition.js'].lineData[75]++;
  function TransitionAnim(node, to, duration, easing, complete) {
    _$jscoverage['/transition.js'].functionData[8]++;
    _$jscoverage['/transition.js'].lineData[76]++;
    var self = this;
    _$jscoverage['/transition.js'].lineData[77]++;
    if (visit7_77_1(!(self instanceof TransitionAnim))) {
      _$jscoverage['/transition.js'].lineData[78]++;
      return new TransitionAnim(node, to, duration, easing, complete);
    }
    _$jscoverage['/transition.js'].lineData[80]++;
    TransitionAnim.superclass.constructor.apply(self, arguments);
    _$jscoverage['/transition.js'].lineData[81]++;
    self._onTransitionEnd = function(e) {
  _$jscoverage['/transition.js'].functionData[9]++;
  _$jscoverage['/transition.js'].lineData[82]++;
  onTransitionEnd(self, e);
};
  }
  _$jscoverage['/transition.js'].lineData[86]++;
  S.extend(TransitionAnim, AnimBase, {
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[88]++;
  var self = this, node = self.node, elStyle = node.style, _propsData, original = elStyle[TRANSITION], propsCss = {};
  _$jscoverage['/transition.js'].lineData[94]++;
  _propsData = self._propsData = normalizeCssName(self._propsData);
  _$jscoverage['/transition.js'].lineData[95]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[96]++;
  var v = propData.value, currentValue = Dom.css(node, prop);
  _$jscoverage['/transition.js'].lineData[98]++;
  if (visit8_98_1(typeof v === 'number')) {
    _$jscoverage['/transition.js'].lineData[99]++;
    currentValue = parseFloat(currentValue);
  }
  _$jscoverage['/transition.js'].lineData[101]++;
  if (visit9_101_1(currentValue === v)) {
    _$jscoverage['/transition.js'].lineData[103]++;
    setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[104]++;
  self._onTransitionEnd({
  propertyName: prop});
}, 0);
  }
  _$jscoverage['/transition.js'].lineData[109]++;
  propsCss[prop] = v;
});
  _$jscoverage['/transition.js'].lineData[113]++;
  if (visit10_113_1(original.indexOf('none') !== -1)) {
    _$jscoverage['/transition.js'].lineData[114]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[115]++;
    if (visit11_115_1(original)) {
      _$jscoverage['/transition.js'].lineData[116]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[118]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[119]++;
  bindEnd(node, self._onTransitionEnd);
  _$jscoverage['/transition.js'].lineData[120]++;
  Dom.css(node, propsCss);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[13]++;
  _$jscoverage['/transition.js'].lineData[126]++;
  var self = this, propsData = self._propsData, tmpPropsData = S.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[130]++;
  S.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[14]++;
  _$jscoverage['/transition.js'].lineData[131]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[132]++;
  if (visit12_132_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[133]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[135]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[136]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[137]++;
    if (visit13_137_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[138]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[140]++;
      delete propsData[prop];
    }
  }
});
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[15]++;
  _$jscoverage['/transition.js'].lineData[147]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[155]++;
  bindEnd(node, self._onTransitionEnd, 1);
  _$jscoverage['/transition.js'].lineData[157]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[16]++;
  _$jscoverage['/transition.js'].lineData[158]++;
  if (visit14_158_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[159]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[161]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[165]++;
  clear = visit15_168_1(S.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[170]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[171]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[175]++;
  S.mix(TransitionAnim, AnimBase.Statics);
  _$jscoverage['/transition.js'].lineData[177]++;
  return TransitionAnim;
});
