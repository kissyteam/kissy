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
  _$jscoverage['/transition.js'].lineData[19] = 0;
  _$jscoverage['/transition.js'].lineData[20] = 0;
  _$jscoverage['/transition.js'].lineData[28] = 0;
  _$jscoverage['/transition.js'].lineData[29] = 0;
  _$jscoverage['/transition.js'].lineData[30] = 0;
  _$jscoverage['/transition.js'].lineData[31] = 0;
  _$jscoverage['/transition.js'].lineData[32] = 0;
  _$jscoverage['/transition.js'].lineData[34] = 0;
  _$jscoverage['/transition.js'].lineData[37] = 0;
  _$jscoverage['/transition.js'].lineData[40] = 0;
  _$jscoverage['/transition.js'].lineData[41] = 0;
  _$jscoverage['/transition.js'].lineData[46] = 0;
  _$jscoverage['/transition.js'].lineData[47] = 0;
  _$jscoverage['/transition.js'].lineData[51] = 0;
  _$jscoverage['/transition.js'].lineData[52] = 0;
  _$jscoverage['/transition.js'].lineData[54] = 0;
  _$jscoverage['/transition.js'].lineData[55] = 0;
  _$jscoverage['/transition.js'].lineData[56] = 0;
  _$jscoverage['/transition.js'].lineData[57] = 0;
  _$jscoverage['/transition.js'].lineData[58] = 0;
  _$jscoverage['/transition.js'].lineData[60] = 0;
  _$jscoverage['/transition.js'].lineData[62] = 0;
  _$jscoverage['/transition.js'].lineData[63] = 0;
  _$jscoverage['/transition.js'].lineData[67] = 0;
  _$jscoverage['/transition.js'].lineData[68] = 0;
  _$jscoverage['/transition.js'].lineData[69] = 0;
  _$jscoverage['/transition.js'].lineData[73] = 0;
  _$jscoverage['/transition.js'].lineData[74] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[79] = 0;
  _$jscoverage['/transition.js'].lineData[80] = 0;
  _$jscoverage['/transition.js'].lineData[81] = 0;
  _$jscoverage['/transition.js'].lineData[82] = 0;
  _$jscoverage['/transition.js'].lineData[84] = 0;
  _$jscoverage['/transition.js'].lineData[85] = 0;
  _$jscoverage['/transition.js'].lineData[86] = 0;
  _$jscoverage['/transition.js'].lineData[90] = 0;
  _$jscoverage['/transition.js'].lineData[92] = 0;
  _$jscoverage['/transition.js'].lineData[94] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[97] = 0;
  _$jscoverage['/transition.js'].lineData[98] = 0;
  _$jscoverage['/transition.js'].lineData[99] = 0;
  _$jscoverage['/transition.js'].lineData[100] = 0;
  _$jscoverage['/transition.js'].lineData[101] = 0;
  _$jscoverage['/transition.js'].lineData[104] = 0;
  _$jscoverage['/transition.js'].lineData[106] = 0;
  _$jscoverage['/transition.js'].lineData[107] = 0;
  _$jscoverage['/transition.js'].lineData[108] = 0;
  _$jscoverage['/transition.js'].lineData[110] = 0;
  _$jscoverage['/transition.js'].lineData[112] = 0;
  _$jscoverage['/transition.js'].lineData[116] = 0;
  _$jscoverage['/transition.js'].lineData[123] = 0;
  _$jscoverage['/transition.js'].lineData[124] = 0;
  _$jscoverage['/transition.js'].lineData[126] = 0;
  _$jscoverage['/transition.js'].lineData[127] = 0;
  _$jscoverage['/transition.js'].lineData[128] = 0;
  _$jscoverage['/transition.js'].lineData[130] = 0;
  _$jscoverage['/transition.js'].lineData[132] = 0;
  _$jscoverage['/transition.js'].lineData[133] = 0;
  _$jscoverage['/transition.js'].lineData[138] = 0;
  _$jscoverage['/transition.js'].lineData[142] = 0;
  _$jscoverage['/transition.js'].lineData[143] = 0;
  _$jscoverage['/transition.js'].lineData[144] = 0;
  _$jscoverage['/transition.js'].lineData[145] = 0;
  _$jscoverage['/transition.js'].lineData[148] = 0;
  _$jscoverage['/transition.js'].lineData[149] = 0;
  _$jscoverage['/transition.js'].lineData[151] = 0;
  _$jscoverage['/transition.js'].lineData[152] = 0;
  _$jscoverage['/transition.js'].lineData[159] = 0;
  _$jscoverage['/transition.js'].lineData[163] = 0;
  _$jscoverage['/transition.js'].lineData[164] = 0;
  _$jscoverage['/transition.js'].lineData[165] = 0;
  _$jscoverage['/transition.js'].lineData[166] = 0;
  _$jscoverage['/transition.js'].lineData[168] = 0;
  _$jscoverage['/transition.js'].lineData[169] = 0;
  _$jscoverage['/transition.js'].lineData[170] = 0;
  _$jscoverage['/transition.js'].lineData[171] = 0;
  _$jscoverage['/transition.js'].lineData[173] = 0;
  _$jscoverage['/transition.js'].lineData[180] = 0;
  _$jscoverage['/transition.js'].lineData[188] = 0;
  _$jscoverage['/transition.js'].lineData[190] = 0;
  _$jscoverage['/transition.js'].lineData[191] = 0;
  _$jscoverage['/transition.js'].lineData[192] = 0;
  _$jscoverage['/transition.js'].lineData[194] = 0;
  _$jscoverage['/transition.js'].lineData[198] = 0;
  _$jscoverage['/transition.js'].lineData[203] = 0;
  _$jscoverage['/transition.js'].lineData[204] = 0;
  _$jscoverage['/transition.js'].lineData[208] = 0;
  _$jscoverage['/transition.js'].lineData[210] = 0;
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
  _$jscoverage['/transition.js'].functionData[17] = 0;
  _$jscoverage['/transition.js'].functionData[18] = 0;
  _$jscoverage['/transition.js'].functionData[19] = 0;
}
if (! _$jscoverage['/transition.js'].branchData) {
  _$jscoverage['/transition.js'].branchData = {};
  _$jscoverage['/transition.js'].branchData['31'] = [];
  _$jscoverage['/transition.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['46'] = [];
  _$jscoverage['/transition.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['51'] = [];
  _$jscoverage['/transition.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['56'] = [];
  _$jscoverage['/transition.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['62'] = [];
  _$jscoverage['/transition.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['81'] = [];
  _$jscoverage['/transition.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['99'] = [];
  _$jscoverage['/transition.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['100'] = [];
  _$jscoverage['/transition.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['107'] = [];
  _$jscoverage['/transition.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['127'] = [];
  _$jscoverage['/transition.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['130'] = [];
  _$jscoverage['/transition.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['142'] = [];
  _$jscoverage['/transition.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['144'] = [];
  _$jscoverage['/transition.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['165'] = [];
  _$jscoverage['/transition.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['170'] = [];
  _$jscoverage['/transition.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['191'] = [];
  _$jscoverage['/transition.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['201'] = [];
  _$jscoverage['/transition.js'].branchData['201'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['201'][1].init(7, 213, 'S.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit17_201_1(result) {
  _$jscoverage['/transition.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['191'][1].init(21, 7, '!finish');
function visit16_191_1(result) {
  _$jscoverage['/transition.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['170'][1].init(113, 29, 'propData.duration >= tRunTime');
function visit15_170_1(result) {
  _$jscoverage['/transition.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['165'][1].init(61, 26, 'propData.delay >= tRunTime');
function visit14_165_1(result) {
  _$jscoverage['/transition.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['144'][1].init(1126, 8, 'original');
function visit13_144_1(result) {
  _$jscoverage['/transition.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['142'][1].init(1036, 31, 'original.indexOf(\'none\') !== -1');
function visit12_142_1(result) {
  _$jscoverage['/transition.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['130'][1].init(292, 18, 'currentValue === v');
function visit11_130_1(result) {
  _$jscoverage['/transition.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['127'][1].init(168, 21, 'typeof v === \'number\'');
function visit10_127_1(result) {
  _$jscoverage['/transition.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['107'][1].init(444, 11, '!vendorInfo');
function visit9_107_1(result) {
  _$jscoverage['/transition.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['100'][1].init(25, 66, '!S.startsWith(val.easing, \'cubic-bezier\') && !css3Anim[val.easing]');
function visit8_100_1(result) {
  _$jscoverage['/transition.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['99'][1].init(68, 30, 'typeof val.easing === \'string\'');
function visit7_99_1(result) {
  _$jscoverage['/transition.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['81'][1].init(38, 34, '!(self instanceof TransitionAnim)');
function visit6_81_1(result) {
  _$jscoverage['/transition.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['62'][1].init(686, 12, 'allCompleted');
function visit5_62_1(result) {
  _$jscoverage['/transition.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['56'][1].init(17, 18, 'propData.pos !== 1');
function visit4_56_1(result) {
  _$jscoverage['/transition.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['51'][1].init(360, 33, 'propsData[propertyName].pos === 1');
function visit3_51_1(result) {
  _$jscoverage['/transition.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['46'][1].init(170, 24, '!propsData[propertyName]');
function visit2_46_1(result) {
  _$jscoverage['/transition.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['31'][1].init(17, 3, 'str');
function visit1_31_1(result) {
  _$jscoverage['/transition.js'].branchData['31'][1].ranCondition(result);
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
  _$jscoverage['/transition.js'].lineData[19]++;
  var DEFAULT_EASING = 'ease-in';
  _$jscoverage['/transition.js'].lineData[20]++;
  var css3Anim = {
  ease: 1, 
  linear: 1, 
  'ease-in': 1, 
  'ease-out': 1, 
  'ease-in-out': 1};
  _$jscoverage['/transition.js'].lineData[28]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[29]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[30]++;
    S.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[2]++;
  _$jscoverage['/transition.js'].lineData[31]++;
  if (visit1_31_1(str)) {
    _$jscoverage['/transition.js'].lineData[32]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[34]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[37]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[40]++;
  function onTransitionEnd(self, e) {
    _$jscoverage['/transition.js'].functionData[3]++;
    _$jscoverage['/transition.js'].lineData[41]++;
    var allCompleted = 1, propertyName = e.propertyName, propsData = self._propsData;
    _$jscoverage['/transition.js'].lineData[46]++;
    if (visit2_46_1(!propsData[propertyName])) {
      _$jscoverage['/transition.js'].lineData[47]++;
      return;
    }
    _$jscoverage['/transition.js'].lineData[51]++;
    if (visit3_51_1(propsData[propertyName].pos === 1)) {
      _$jscoverage['/transition.js'].lineData[52]++;
      return;
    }
    _$jscoverage['/transition.js'].lineData[54]++;
    propsData[propertyName].pos = 1;
    _$jscoverage['/transition.js'].lineData[55]++;
    S.each(propsData, function(propData) {
  _$jscoverage['/transition.js'].functionData[4]++;
  _$jscoverage['/transition.js'].lineData[56]++;
  if (visit4_56_1(propData.pos !== 1)) {
    _$jscoverage['/transition.js'].lineData[57]++;
    allCompleted = 0;
    _$jscoverage['/transition.js'].lineData[58]++;
    return false;
  }
  _$jscoverage['/transition.js'].lineData[60]++;
  return undefined;
});
    _$jscoverage['/transition.js'].lineData[62]++;
    if (visit5_62_1(allCompleted)) {
      _$jscoverage['/transition.js'].lineData[63]++;
      self.stop(true);
    }
  }
  _$jscoverage['/transition.js'].lineData[67]++;
  function bindEnd(el, fn, remove) {
    _$jscoverage['/transition.js'].functionData[5]++;
    _$jscoverage['/transition.js'].lineData[68]++;
    S.each(TRANSITION_END_EVENT, function(e) {
  _$jscoverage['/transition.js'].functionData[6]++;
  _$jscoverage['/transition.js'].lineData[69]++;
  el[remove ? 'removeEventListener' : 'addEventListener'](e, fn, false);
});
  }
  _$jscoverage['/transition.js'].lineData[73]++;
  function unCamelCase(propertyName) {
    _$jscoverage['/transition.js'].functionData[7]++;
    _$jscoverage['/transition.js'].lineData[74]++;
    return propertyName.replace(/[A-Z]/g, function(m) {
  _$jscoverage['/transition.js'].functionData[8]++;
  _$jscoverage['/transition.js'].lineData[75]++;
  return '-' + m.toLowerCase();
});
  }
  _$jscoverage['/transition.js'].lineData[79]++;
  function TransitionAnim(node, to, duration, easing, complete) {
    _$jscoverage['/transition.js'].functionData[9]++;
    _$jscoverage['/transition.js'].lineData[80]++;
    var self = this;
    _$jscoverage['/transition.js'].lineData[81]++;
    if (visit6_81_1(!(self instanceof TransitionAnim))) {
      _$jscoverage['/transition.js'].lineData[82]++;
      return new TransitionAnim(node, to, duration, easing, complete);
    }
    _$jscoverage['/transition.js'].lineData[84]++;
    TransitionAnim.superclass.constructor.apply(self, arguments);
    _$jscoverage['/transition.js'].lineData[85]++;
    self._onTransitionEnd = function(e) {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[86]++;
  onTransitionEnd(self, e);
};
  }
  _$jscoverage['/transition.js'].lineData[90]++;
  S.extend(TransitionAnim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[92]++;
  var self = this, propsData = self._propsData;
  _$jscoverage['/transition.js'].lineData[94]++;
  var newProps = {};
  _$jscoverage['/transition.js'].lineData[95]++;
  var val;
  _$jscoverage['/transition.js'].lineData[96]++;
  var vendorInfo;
  _$jscoverage['/transition.js'].lineData[97]++;
  for (var propertyName in propsData) {
    _$jscoverage['/transition.js'].lineData[98]++;
    val = propsData[propertyName];
    _$jscoverage['/transition.js'].lineData[99]++;
    if (visit7_99_1(typeof val.easing === 'string')) {
      _$jscoverage['/transition.js'].lineData[100]++;
      if (visit8_100_1(!S.startsWith(val.easing, 'cubic-bezier') && !css3Anim[val.easing])) {
        _$jscoverage['/transition.js'].lineData[101]++;
        val.easing = DEFAULT_EASING;
      }
    } else {
      _$jscoverage['/transition.js'].lineData[104]++;
      val.easing = DEFAULT_EASING;
    }
    _$jscoverage['/transition.js'].lineData[106]++;
    vendorInfo = getCssVendorInfo(propertyName);
    _$jscoverage['/transition.js'].lineData[107]++;
    if (visit9_107_1(!vendorInfo)) {
      _$jscoverage['/transition.js'].lineData[108]++;
      S.error('unsupported css property for transition anim: ' + propertyName);
    }
    _$jscoverage['/transition.js'].lineData[110]++;
    newProps[unCamelCase(vendorInfo.propertyName)] = propsData[propertyName];
  }
  _$jscoverage['/transition.js'].lineData[112]++;
  self._propsData = newProps;
}, 
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[116]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], propsCss = {};
  _$jscoverage['/transition.js'].lineData[123]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[13]++;
  _$jscoverage['/transition.js'].lineData[124]++;
  var v = propData.value, currentValue = Dom.css(node, prop);
  _$jscoverage['/transition.js'].lineData[126]++;
  Dom.css(node, prop, currentValue);
  _$jscoverage['/transition.js'].lineData[127]++;
  if (visit10_127_1(typeof v === 'number')) {
    _$jscoverage['/transition.js'].lineData[128]++;
    currentValue = parseFloat(currentValue);
  }
  _$jscoverage['/transition.js'].lineData[130]++;
  if (visit11_130_1(currentValue === v)) {
    _$jscoverage['/transition.js'].lineData[132]++;
    setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[14]++;
  _$jscoverage['/transition.js'].lineData[133]++;
  self._onTransitionEnd({
  propertyName: prop});
}, 0);
  }
  _$jscoverage['/transition.js'].lineData[138]++;
  propsCss[prop] = v;
});
  _$jscoverage['/transition.js'].lineData[142]++;
  if (visit12_142_1(original.indexOf('none') !== -1)) {
    _$jscoverage['/transition.js'].lineData[143]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[144]++;
    if (visit13_144_1(original)) {
      _$jscoverage['/transition.js'].lineData[145]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[148]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[149]++;
  bindEnd(node, self._onTransitionEnd);
  _$jscoverage['/transition.js'].lineData[151]++;
  setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[15]++;
  _$jscoverage['/transition.js'].lineData[152]++;
  Dom.css(node, propsCss);
}, 0);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[16]++;
  _$jscoverage['/transition.js'].lineData[159]++;
  var self = this, propsData = self._propsData, tmpPropsData = S.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[163]++;
  S.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[17]++;
  _$jscoverage['/transition.js'].lineData[164]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[165]++;
  if (visit14_165_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[166]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[168]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[169]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[170]++;
    if (visit15_170_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[171]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[173]++;
      delete propsData[prop];
    }
  }
});
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[18]++;
  _$jscoverage['/transition.js'].lineData[180]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[188]++;
  bindEnd(node, self._onTransitionEnd, 1);
  _$jscoverage['/transition.js'].lineData[190]++;
  S.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[19]++;
  _$jscoverage['/transition.js'].lineData[191]++;
  if (visit16_191_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[192]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[194]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[198]++;
  clear = visit17_201_1(S.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[203]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[204]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[208]++;
  S.mix(TransitionAnim, AnimBase.Statics);
  _$jscoverage['/transition.js'].lineData[210]++;
  return TransitionAnim;
});
