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
  _$jscoverage['/transition.js'].lineData[11] = 0;
  _$jscoverage['/transition.js'].lineData[12] = 0;
  _$jscoverage['/transition.js'].lineData[20] = 0;
  _$jscoverage['/transition.js'].lineData[21] = 0;
  _$jscoverage['/transition.js'].lineData[23] = 0;
  _$jscoverage['/transition.js'].lineData[24] = 0;
  _$jscoverage['/transition.js'].lineData[25] = 0;
  _$jscoverage['/transition.js'].lineData[27] = 0;
  _$jscoverage['/transition.js'].lineData[28] = 0;
  _$jscoverage['/transition.js'].lineData[31] = 0;
  _$jscoverage['/transition.js'].lineData[32] = 0;
  _$jscoverage['/transition.js'].lineData[37] = 0;
  _$jscoverage['/transition.js'].lineData[40] = 0;
  _$jscoverage['/transition.js'].lineData[41] = 0;
  _$jscoverage['/transition.js'].lineData[42] = 0;
  _$jscoverage['/transition.js'].lineData[43] = 0;
  _$jscoverage['/transition.js'].lineData[44] = 0;
  _$jscoverage['/transition.js'].lineData[51] = 0;
  _$jscoverage['/transition.js'].lineData[53] = 0;
  _$jscoverage['/transition.js'].lineData[61] = 0;
  _$jscoverage['/transition.js'].lineData[62] = 0;
  _$jscoverage['/transition.js'].lineData[63] = 0;
  _$jscoverage['/transition.js'].lineData[64] = 0;
  _$jscoverage['/transition.js'].lineData[65] = 0;
  _$jscoverage['/transition.js'].lineData[66] = 0;
  _$jscoverage['/transition.js'].lineData[67] = 0;
  _$jscoverage['/transition.js'].lineData[75] = 0;
  _$jscoverage['/transition.js'].lineData[76] = 0;
  _$jscoverage['/transition.js'].lineData[77] = 0;
  _$jscoverage['/transition.js'].lineData[78] = 0;
  _$jscoverage['/transition.js'].lineData[79] = 0;
  _$jscoverage['/transition.js'].lineData[81] = 0;
  _$jscoverage['/transition.js'].lineData[84] = 0;
  _$jscoverage['/transition.js'].lineData[87] = 0;
  _$jscoverage['/transition.js'].lineData[88] = 0;
  _$jscoverage['/transition.js'].lineData[89] = 0;
  _$jscoverage['/transition.js'].lineData[93] = 0;
  _$jscoverage['/transition.js'].lineData[94] = 0;
  _$jscoverage['/transition.js'].lineData[95] = 0;
  _$jscoverage['/transition.js'].lineData[96] = 0;
  _$jscoverage['/transition.js'].lineData[98] = 0;
  _$jscoverage['/transition.js'].lineData[101] = 0;
  _$jscoverage['/transition.js'].lineData[103] = 0;
  _$jscoverage['/transition.js'].lineData[105] = 0;
  _$jscoverage['/transition.js'].lineData[106] = 0;
  _$jscoverage['/transition.js'].lineData[107] = 0;
  _$jscoverage['/transition.js'].lineData[108] = 0;
  _$jscoverage['/transition.js'].lineData[109] = 0;
  _$jscoverage['/transition.js'].lineData[110] = 0;
  _$jscoverage['/transition.js'].lineData[111] = 0;
  _$jscoverage['/transition.js'].lineData[112] = 0;
  _$jscoverage['/transition.js'].lineData[115] = 0;
  _$jscoverage['/transition.js'].lineData[117] = 0;
  _$jscoverage['/transition.js'].lineData[118] = 0;
  _$jscoverage['/transition.js'].lineData[119] = 0;
  _$jscoverage['/transition.js'].lineData[120] = 0;
  _$jscoverage['/transition.js'].lineData[122] = 0;
  _$jscoverage['/transition.js'].lineData[124] = 0;
  _$jscoverage['/transition.js'].lineData[128] = 0;
  _$jscoverage['/transition.js'].lineData[136] = 0;
  _$jscoverage['/transition.js'].lineData[137] = 0;
  _$jscoverage['/transition.js'].lineData[139] = 0;
  _$jscoverage['/transition.js'].lineData[140] = 0;
  _$jscoverage['/transition.js'].lineData[141] = 0;
  _$jscoverage['/transition.js'].lineData[146] = 0;
  _$jscoverage['/transition.js'].lineData[147] = 0;
  _$jscoverage['/transition.js'].lineData[148] = 0;
  _$jscoverage['/transition.js'].lineData[149] = 0;
  _$jscoverage['/transition.js'].lineData[152] = 0;
  _$jscoverage['/transition.js'].lineData[155] = 0;
  _$jscoverage['/transition.js'].lineData[156] = 0;
  _$jscoverage['/transition.js'].lineData[160] = 0;
  _$jscoverage['/transition.js'].lineData[161] = 0;
  _$jscoverage['/transition.js'].lineData[168] = 0;
  _$jscoverage['/transition.js'].lineData[172] = 0;
  _$jscoverage['/transition.js'].lineData[173] = 0;
  _$jscoverage['/transition.js'].lineData[174] = 0;
  _$jscoverage['/transition.js'].lineData[175] = 0;
  _$jscoverage['/transition.js'].lineData[177] = 0;
  _$jscoverage['/transition.js'].lineData[178] = 0;
  _$jscoverage['/transition.js'].lineData[179] = 0;
  _$jscoverage['/transition.js'].lineData[180] = 0;
  _$jscoverage['/transition.js'].lineData[182] = 0;
  _$jscoverage['/transition.js'].lineData[189] = 0;
  _$jscoverage['/transition.js'].lineData[197] = 0;
  _$jscoverage['/transition.js'].lineData[198] = 0;
  _$jscoverage['/transition.js'].lineData[199] = 0;
  _$jscoverage['/transition.js'].lineData[202] = 0;
  _$jscoverage['/transition.js'].lineData[203] = 0;
  _$jscoverage['/transition.js'].lineData[204] = 0;
  _$jscoverage['/transition.js'].lineData[206] = 0;
  _$jscoverage['/transition.js'].lineData[210] = 0;
  _$jscoverage['/transition.js'].lineData[215] = 0;
  _$jscoverage['/transition.js'].lineData[216] = 0;
  _$jscoverage['/transition.js'].lineData[220] = 0;
  _$jscoverage['/transition.js'].lineData[223] = 0;
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
  _$jscoverage['/transition.js'].branchData['24'] = [];
  _$jscoverage['/transition.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['27'] = [];
  _$jscoverage['/transition.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['31'] = [];
  _$jscoverage['/transition.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['40'] = [];
  _$jscoverage['/transition.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['43'] = [];
  _$jscoverage['/transition.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['51'] = [];
  _$jscoverage['/transition.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['78'] = [];
  _$jscoverage['/transition.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['95'] = [];
  _$jscoverage['/transition.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['110'] = [];
  _$jscoverage['/transition.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['111'] = [];
  _$jscoverage['/transition.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['118'] = [];
  _$jscoverage['/transition.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['146'] = [];
  _$jscoverage['/transition.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['148'] = [];
  _$jscoverage['/transition.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['174'] = [];
  _$jscoverage['/transition.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['179'] = [];
  _$jscoverage['/transition.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['197'] = [];
  _$jscoverage['/transition.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['203'] = [];
  _$jscoverage['/transition.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/transition.js'].branchData['213'] = [];
  _$jscoverage['/transition.js'].branchData['213'][1] = new BranchData();
}
_$jscoverage['/transition.js'].branchData['213'][1].init(7, 204, 'util.trim(elStyle[TRANSITION].replace(new RegExp(\'(^|,)\' + \'\\\\s*(?:\' + propList.join(\'|\') + \')\\\\s+[^,]+\', \'gi\'), \'$1\')).replace(/^,|,,|,$/g, \'\') || \'none\'');
function visit18_213_1(result) {
  _$jscoverage['/transition.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['203'][1].init(21, 7, '!finish');
function visit17_203_1(result) {
  _$jscoverage['/transition.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['197'][1].init(250, 24, 'self._transitionEndTimer');
function visit16_197_1(result) {
  _$jscoverage['/transition.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['179'][1].init(113, 29, 'propData.duration >= tRunTime');
function visit15_179_1(result) {
  _$jscoverage['/transition.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['174'][1].init(61, 26, 'propData.delay >= tRunTime');
function visit14_174_1(result) {
  _$jscoverage['/transition.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['148'][1].init(781, 8, 'original');
function visit13_148_1(result) {
  _$jscoverage['/transition.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['146'][1].init(691, 31, 'original.indexOf(\'none\') !== -1');
function visit12_146_1(result) {
  _$jscoverage['/transition.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['118'][1].init(444, 11, '!vendorInfo');
function visit11_118_1(result) {
  _$jscoverage['/transition.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['111'][1].init(25, 69, '!util.startsWith(val.easing, \'cubic-bezier\') && !css3Anim[val.easing]');
function visit10_111_1(result) {
  _$jscoverage['/transition.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['110'][1].init(68, 30, 'typeof val.easing === \'string\'');
function visit9_110_1(result) {
  _$jscoverage['/transition.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['95'][1].init(38, 34, '!(self instanceof TransitionAnim)');
function visit8_95_1(result) {
  _$jscoverage['/transition.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['78'][1].init(17, 3, 'str');
function visit7_78_1(result) {
  _$jscoverage['/transition.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['51'][1].init(601, 25, 'vendorInfos[name] || null');
function visit6_51_1(result) {
  _$jscoverage['/transition.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['43'][1].init(149, 34, 'vendorName in documentElementStyle');
function visit5_43_1(result) {
  _$jscoverage['/transition.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['40'][1].init(137, 26, 'i < propertyPrefixesLength');
function visit4_40_1(result) {
  _$jscoverage['/transition.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['31'][1].init(252, 53, '!documentElementStyle || name in documentElementStyle');
function visit3_31_1(result) {
  _$jscoverage['/transition.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['27'][1].init(116, 19, 'name in vendorInfos');
function visit2_27_1(result) {
  _$jscoverage['/transition.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].branchData['24'][1].init(13, 24, 'name.indexOf(\'-\') !== -1');
function visit1_24_1(result) {
  _$jscoverage['/transition.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/transition.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/transition.js'].functionData[0]++;
  _$jscoverage['/transition.js'].lineData[7]++;
  function upperCase() {
    _$jscoverage['/transition.js'].functionData[1]++;
    _$jscoverage['/transition.js'].lineData[8]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/transition.js'].lineData[11]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/transition.js'].lineData[12]++;
  var propertyPrefixes = ['Webkit', 'Moz', 'O', 'ms'], propertyPrefixesLength = propertyPrefixes.length;
  _$jscoverage['/transition.js'].lineData[20]++;
  var vendorInfos = {};
  _$jscoverage['/transition.js'].lineData[21]++;
  var documentElementStyle = document.documentElement.style;
  _$jscoverage['/transition.js'].lineData[23]++;
  function getVendorInfo(name) {
    _$jscoverage['/transition.js'].functionData[2]++;
    _$jscoverage['/transition.js'].lineData[24]++;
    if (visit1_24_1(name.indexOf('-') !== -1)) {
      _$jscoverage['/transition.js'].lineData[25]++;
      name = name.replace(RE_DASH, upperCase);
    }
    _$jscoverage['/transition.js'].lineData[27]++;
    if (visit2_27_1(name in vendorInfos)) {
      _$jscoverage['/transition.js'].lineData[28]++;
      return vendorInfos[name];
    }
    _$jscoverage['/transition.js'].lineData[31]++;
    if (visit3_31_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/transition.js'].lineData[32]++;
      vendorInfos[name] = {
  propertyName: name, 
  propertyNamePrefix: ''};
    } else {
      _$jscoverage['/transition.js'].lineData[37]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      _$jscoverage['/transition.js'].lineData[40]++;
      for (var i = 0; visit4_40_1(i < propertyPrefixesLength); i++) {
        _$jscoverage['/transition.js'].lineData[41]++;
        var propertyNamePrefix = propertyPrefixes[i];
        _$jscoverage['/transition.js'].lineData[42]++;
        vendorName = propertyNamePrefix + upperFirstName;
        _$jscoverage['/transition.js'].lineData[43]++;
        if (visit5_43_1(vendorName in documentElementStyle)) {
          _$jscoverage['/transition.js'].lineData[44]++;
          vendorInfos[name] = {
  propertyName: vendorName, 
  propertyNamePrefix: propertyNamePrefix};
        }
      }
      _$jscoverage['/transition.js'].lineData[51]++;
      vendorInfos[name] = visit6_51_1(vendorInfos[name] || null);
    }
    _$jscoverage['/transition.js'].lineData[53]++;
    return vendorInfos[name];
  }
  _$jscoverage['/transition.js'].lineData[61]++;
  var util = S;
  _$jscoverage['/transition.js'].lineData[62]++;
  var Dom = require('dom');
  _$jscoverage['/transition.js'].lineData[63]++;
  var AnimBase = require('./base');
  _$jscoverage['/transition.js'].lineData[64]++;
  var transitionVendorInfo = getVendorInfo('transition');
  _$jscoverage['/transition.js'].lineData[65]++;
  var TRANSITION = transitionVendorInfo.propertyName;
  _$jscoverage['/transition.js'].lineData[66]++;
  var DEFAULT_EASING = 'linear';
  _$jscoverage['/transition.js'].lineData[67]++;
  var css3Anim = {
  ease: 1, 
  linear: 1, 
  'ease-in': 1, 
  'ease-out': 1, 
  'ease-in-out': 1};
  _$jscoverage['/transition.js'].lineData[75]++;
  function genTransition(propsData) {
    _$jscoverage['/transition.js'].functionData[3]++;
    _$jscoverage['/transition.js'].lineData[76]++;
    var str = '';
    _$jscoverage['/transition.js'].lineData[77]++;
    util.each(propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[4]++;
  _$jscoverage['/transition.js'].lineData[78]++;
  if (visit7_78_1(str)) {
    _$jscoverage['/transition.js'].lineData[79]++;
    str += ',';
  }
  _$jscoverage['/transition.js'].lineData[81]++;
  str += prop + ' ' + propData.duration + 's ' + propData.easing + ' ' + propData.delay + 's';
});
    _$jscoverage['/transition.js'].lineData[84]++;
    return str;
  }
  _$jscoverage['/transition.js'].lineData[87]++;
  function unCamelCase(propertyName) {
    _$jscoverage['/transition.js'].functionData[5]++;
    _$jscoverage['/transition.js'].lineData[88]++;
    return propertyName.replace(/[A-Z]/g, function(m) {
  _$jscoverage['/transition.js'].functionData[6]++;
  _$jscoverage['/transition.js'].lineData[89]++;
  return '-' + m.toLowerCase();
});
  }
  _$jscoverage['/transition.js'].lineData[93]++;
  function TransitionAnim(node, to, duration, easing, complete) {
    _$jscoverage['/transition.js'].functionData[7]++;
    _$jscoverage['/transition.js'].lineData[94]++;
    var self = this;
    _$jscoverage['/transition.js'].lineData[95]++;
    if (visit8_95_1(!(self instanceof TransitionAnim))) {
      _$jscoverage['/transition.js'].lineData[96]++;
      return new TransitionAnim(node, to, duration, easing, complete);
    }
    _$jscoverage['/transition.js'].lineData[98]++;
    TransitionAnim.superclass.constructor.apply(self, arguments);
  }
  _$jscoverage['/transition.js'].lineData[101]++;
  util.extend(TransitionAnim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/transition.js'].functionData[8]++;
  _$jscoverage['/transition.js'].lineData[103]++;
  var self = this, propsData = self._propsData;
  _$jscoverage['/transition.js'].lineData[105]++;
  var newProps = {};
  _$jscoverage['/transition.js'].lineData[106]++;
  var val;
  _$jscoverage['/transition.js'].lineData[107]++;
  var vendorInfo;
  _$jscoverage['/transition.js'].lineData[108]++;
  for (var propertyName in propsData) {
    _$jscoverage['/transition.js'].lineData[109]++;
    val = propsData[propertyName];
    _$jscoverage['/transition.js'].lineData[110]++;
    if (visit9_110_1(typeof val.easing === 'string')) {
      _$jscoverage['/transition.js'].lineData[111]++;
      if (visit10_111_1(!util.startsWith(val.easing, 'cubic-bezier') && !css3Anim[val.easing])) {
        _$jscoverage['/transition.js'].lineData[112]++;
        val.easing = DEFAULT_EASING;
      }
    } else {
      _$jscoverage['/transition.js'].lineData[115]++;
      val.easing = DEFAULT_EASING;
    }
    _$jscoverage['/transition.js'].lineData[117]++;
    vendorInfo = getVendorInfo(propertyName);
    _$jscoverage['/transition.js'].lineData[118]++;
    if (visit11_118_1(!vendorInfo)) {
      _$jscoverage['/transition.js'].lineData[119]++;
      S.log('unsupported css property for transition anim: ' + propertyName, 'error');
      _$jscoverage['/transition.js'].lineData[120]++;
      continue;
    }
    _$jscoverage['/transition.js'].lineData[122]++;
    newProps[unCamelCase(vendorInfo.propertyName)] = propsData[propertyName];
  }
  _$jscoverage['/transition.js'].lineData[124]++;
  self._propsData = newProps;
}, 
  doStart: function() {
  _$jscoverage['/transition.js'].functionData[9]++;
  _$jscoverage['/transition.js'].lineData[128]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, original = elStyle[TRANSITION], totalDuration = 0, propsCss = {};
  _$jscoverage['/transition.js'].lineData[136]++;
  util.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[10]++;
  _$jscoverage['/transition.js'].lineData[137]++;
  var v = propData.value;
  _$jscoverage['/transition.js'].lineData[139]++;
  Dom.css(node, prop, Dom.css(node, prop));
  _$jscoverage['/transition.js'].lineData[140]++;
  propsCss[prop] = v;
  _$jscoverage['/transition.js'].lineData[141]++;
  totalDuration = Math.max(propData.duration + propData.delay, totalDuration);
});
  _$jscoverage['/transition.js'].lineData[146]++;
  if (visit12_146_1(original.indexOf('none') !== -1)) {
    _$jscoverage['/transition.js'].lineData[147]++;
    original = '';
  } else {
    _$jscoverage['/transition.js'].lineData[148]++;
    if (visit13_148_1(original)) {
      _$jscoverage['/transition.js'].lineData[149]++;
      original += ',';
    }
  }
  _$jscoverage['/transition.js'].lineData[152]++;
  elStyle[TRANSITION] = original + genTransition(_propsData);
  _$jscoverage['/transition.js'].lineData[155]++;
  setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[11]++;
  _$jscoverage['/transition.js'].lineData[156]++;
  Dom.css(node, propsCss);
}, 0);
  _$jscoverage['/transition.js'].lineData[160]++;
  self._transitionEndTimer = setTimeout(function() {
  _$jscoverage['/transition.js'].functionData[12]++;
  _$jscoverage['/transition.js'].lineData[161]++;
  self.stop(true);
}, totalDuration * 1000);
}, 
  beforeResume: function() {
  _$jscoverage['/transition.js'].functionData[13]++;
  _$jscoverage['/transition.js'].lineData[168]++;
  var self = this, propsData = self._propsData, tmpPropsData = util.merge(propsData), runTime = self._runTime / 1000;
  _$jscoverage['/transition.js'].lineData[172]++;
  util.each(tmpPropsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[14]++;
  _$jscoverage['/transition.js'].lineData[173]++;
  var tRunTime = runTime;
  _$jscoverage['/transition.js'].lineData[174]++;
  if (visit14_174_1(propData.delay >= tRunTime)) {
    _$jscoverage['/transition.js'].lineData[175]++;
    propData.delay -= tRunTime;
  } else {
    _$jscoverage['/transition.js'].lineData[177]++;
    tRunTime -= propData.delay;
    _$jscoverage['/transition.js'].lineData[178]++;
    propData.delay = 0;
    _$jscoverage['/transition.js'].lineData[179]++;
    if (visit15_179_1(propData.duration >= tRunTime)) {
      _$jscoverage['/transition.js'].lineData[180]++;
      propData.duration -= tRunTime;
    } else {
      _$jscoverage['/transition.js'].lineData[182]++;
      delete propsData[prop];
    }
  }
});
}, 
  doStop: function(finish) {
  _$jscoverage['/transition.js'].functionData[15]++;
  _$jscoverage['/transition.js'].lineData[189]++;
  var self = this, node = self.node, elStyle = node.style, _propsData = self._propsData, propList = [], clear, propsCss = {};
  _$jscoverage['/transition.js'].lineData[197]++;
  if (visit16_197_1(self._transitionEndTimer)) {
    _$jscoverage['/transition.js'].lineData[198]++;
    clearTimeout(self._transitionEndTimer);
    _$jscoverage['/transition.js'].lineData[199]++;
    self._transitionEndTimer = null;
  }
  _$jscoverage['/transition.js'].lineData[202]++;
  util.each(_propsData, function(propData, prop) {
  _$jscoverage['/transition.js'].functionData[16]++;
  _$jscoverage['/transition.js'].lineData[203]++;
  if (visit17_203_1(!finish)) {
    _$jscoverage['/transition.js'].lineData[204]++;
    propsCss[prop] = Dom.css(node, prop);
  }
  _$jscoverage['/transition.js'].lineData[206]++;
  propList.push(prop);
});
  _$jscoverage['/transition.js'].lineData[210]++;
  clear = visit18_213_1(util.trim(elStyle[TRANSITION].replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'), '$1')).replace(/^,|,,|,$/g, '') || 'none');
  _$jscoverage['/transition.js'].lineData[215]++;
  elStyle[TRANSITION] = clear;
  _$jscoverage['/transition.js'].lineData[216]++;
  Dom.css(node, propsCss);
}});
  _$jscoverage['/transition.js'].lineData[220]++;
  util.mix(TransitionAnim, AnimBase.Statics);
  _$jscoverage['/transition.js'].lineData[223]++;
  module.exports = TransitionAnim;
});
