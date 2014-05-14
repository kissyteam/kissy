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
if (! _$jscoverage['/class-list.js']) {
  _$jscoverage['/class-list.js'] = {};
  _$jscoverage['/class-list.js'].lineData = [];
  _$jscoverage['/class-list.js'].lineData[6] = 0;
  _$jscoverage['/class-list.js'].lineData[7] = 0;
  _$jscoverage['/class-list.js'].lineData[8] = 0;
  _$jscoverage['/class-list.js'].lineData[9] = 0;
  _$jscoverage['/class-list.js'].lineData[12] = 0;
  _$jscoverage['/class-list.js'].lineData[13] = 0;
  _$jscoverage['/class-list.js'].lineData[16] = 0;
  _$jscoverage['/class-list.js'].lineData[18] = 0;
  _$jscoverage['/class-list.js'].lineData[22] = 0;
  _$jscoverage['/class-list.js'].lineData[23] = 0;
  _$jscoverage['/class-list.js'].lineData[24] = 0;
  _$jscoverage['/class-list.js'].lineData[25] = 0;
  _$jscoverage['/class-list.js'].lineData[26] = 0;
  _$jscoverage['/class-list.js'].lineData[29] = 0;
  _$jscoverage['/class-list.js'].lineData[31] = 0;
  _$jscoverage['/class-list.js'].lineData[35] = 0;
  _$jscoverage['/class-list.js'].lineData[40] = 0;
  _$jscoverage['/class-list.js'].lineData[41] = 0;
  _$jscoverage['/class-list.js'].lineData[42] = 0;
  _$jscoverage['/class-list.js'].lineData[43] = 0;
  _$jscoverage['/class-list.js'].lineData[44] = 0;
  _$jscoverage['/class-list.js'].lineData[45] = 0;
  _$jscoverage['/class-list.js'].lineData[46] = 0;
  _$jscoverage['/class-list.js'].lineData[49] = 0;
  _$jscoverage['/class-list.js'].lineData[51] = 0;
  _$jscoverage['/class-list.js'].lineData[53] = 0;
  _$jscoverage['/class-list.js'].lineData[57] = 0;
  _$jscoverage['/class-list.js'].lineData[62] = 0;
  _$jscoverage['/class-list.js'].lineData[63] = 0;
  _$jscoverage['/class-list.js'].lineData[64] = 0;
  _$jscoverage['/class-list.js'].lineData[65] = 0;
  _$jscoverage['/class-list.js'].lineData[66] = 0;
  _$jscoverage['/class-list.js'].lineData[68] = 0;
  _$jscoverage['/class-list.js'].lineData[69] = 0;
  _$jscoverage['/class-list.js'].lineData[72] = 0;
  _$jscoverage['/class-list.js'].lineData[77] = 0;
  _$jscoverage['/class-list.js'].lineData[84] = 0;
  _$jscoverage['/class-list.js'].lineData[85] = 0;
  _$jscoverage['/class-list.js'].lineData[86] = 0;
  _$jscoverage['/class-list.js'].lineData[87] = 0;
  _$jscoverage['/class-list.js'].lineData[89] = 0;
  _$jscoverage['/class-list.js'].lineData[90] = 0;
  _$jscoverage['/class-list.js'].lineData[91] = 0;
  _$jscoverage['/class-list.js'].lineData[92] = 0;
  _$jscoverage['/class-list.js'].lineData[95] = 0;
  _$jscoverage['/class-list.js'].lineData[96] = 0;
  _$jscoverage['/class-list.js'].lineData[98] = 0;
  _$jscoverage['/class-list.js'].lineData[99] = 0;
}
if (! _$jscoverage['/class-list.js'].functionData) {
  _$jscoverage['/class-list.js'].functionData = [];
  _$jscoverage['/class-list.js'].functionData[0] = 0;
  _$jscoverage['/class-list.js'].functionData[1] = 0;
  _$jscoverage['/class-list.js'].functionData[2] = 0;
  _$jscoverage['/class-list.js'].functionData[3] = 0;
  _$jscoverage['/class-list.js'].functionData[4] = 0;
  _$jscoverage['/class-list.js'].functionData[5] = 0;
}
if (! _$jscoverage['/class-list.js'].branchData) {
  _$jscoverage['/class-list.js'].branchData = {};
  _$jscoverage['/class-list.js'].branchData['22'] = [];
  _$jscoverage['/class-list.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['24'] = [];
  _$jscoverage['/class-list.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['25'] = [];
  _$jscoverage['/class-list.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['40'] = [];
  _$jscoverage['/class-list.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['44'] = [];
  _$jscoverage['/class-list.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['45'] = [];
  _$jscoverage['/class-list.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['62'] = [];
  _$jscoverage['/class-list.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['65'] = [];
  _$jscoverage['/class-list.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['68'] = [];
  _$jscoverage['/class-list.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['84'] = [];
  _$jscoverage['/class-list.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['87'] = [];
  _$jscoverage['/class-list.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['88'] = [];
  _$jscoverage['/class-list.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['89'] = [];
  _$jscoverage['/class-list.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['91'] = [];
  _$jscoverage['/class-list.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['95'] = [];
  _$jscoverage['/class-list.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['98'] = [];
  _$jscoverage['/class-list.js'].branchData['98'][1] = new BranchData();
}
_$jscoverage['/class-list.js'].branchData['98'][1].init(796, 14, 'removed.length');
function visit18_98_1(result) {
  _$jscoverage['/class-list.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['95'][1].init(702, 12, 'added.length');
function visit17_95_1(result) {
  _$jscoverage['/class-list.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['91'][1].init(336, 16, 'method === \'add\'');
function visit16_91_1(result) {
  _$jscoverage['/class-list.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['89'][1].init(238, 19, 'method === \'remove\'');
function visit15_89_1(result) {
  _$jscoverage['/class-list.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['88'][2].init(68, 15, 'force !== false');
function visit14_88_2(result) {
  _$jscoverage['/class-list.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['88'][1].init(58, 24, 'force !== false && \'add\'');
function visit13_88_1(result) {
  _$jscoverage['/class-list.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['87'][2].init(141, 14, 'force !== true');
function visit12_87_2(result) {
  _$jscoverage['/class-list.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['87'][1].init(141, 26, 'force !== true && \'remove\'');
function visit11_87_1(result) {
  _$jscoverage['/class-list.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['84'][1].init(238, 6, 'j < cl');
function visit10_84_1(result) {
  _$jscoverage['/class-list.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['68'][1].init(158, 30, 'className.indexOf(needle) >= 0');
function visit9_68_1(result) {
  _$jscoverage['/class-list.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['65'][1].init(95, 6, 'j < cl');
function visit8_65_1(result) {
  _$jscoverage['/class-list.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['62'][1].init(177, 15, 'elemClass && cl');
function visit7_62_1(result) {
  _$jscoverage['/class-list.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['45'][1].init(26, 56, 'normClassName.indexOf(SPACE + classNames[j] + SPACE) < 0');
function visit6_45_1(result) {
  _$jscoverage['/class-list.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['44'][1].init(138, 6, 'j < cl');
function visit5_44_1(result) {
  _$jscoverage['/class-list.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['40'][1].init(183, 9, 'elemClass');
function visit4_40_1(result) {
  _$jscoverage['/class-list.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['25'][1].init(26, 52, 'className.indexOf(SPACE + classNames[j] + SPACE) < 0');
function visit3_25_1(result) {
  _$jscoverage['/class-list.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['24'][1].init(100, 6, 'j < cl');
function visit2_24_1(result) {
  _$jscoverage['/class-list.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['22'][1].init(132, 9, 'elemClass');
function visit1_22_1(result) {
  _$jscoverage['/class-list.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/class-list.js'].functionData[0]++;
  _$jscoverage['/class-list.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/class-list.js'].lineData[8]++;
  var Dom = require('dom/base');
  _$jscoverage['/class-list.js'].lineData[9]++;
  var SPACE = ' ', RE_CLASS = /[\n\t\r]/g;
  _$jscoverage['/class-list.js'].lineData[12]++;
  function norm(elemClass) {
    _$jscoverage['/class-list.js'].functionData[1]++;
    _$jscoverage['/class-list.js'].lineData[13]++;
    return (SPACE + elemClass + SPACE).replace(RE_CLASS, SPACE);
  }
  _$jscoverage['/class-list.js'].lineData[16]++;
  return util.mix(Dom, {
  _hasClass: function(elem, classNames) {
  _$jscoverage['/class-list.js'].functionData[2]++;
  _$jscoverage['/class-list.js'].lineData[18]++;
  var elemClass = elem.className, className, cl, j;
  _$jscoverage['/class-list.js'].lineData[22]++;
  if (visit1_22_1(elemClass)) {
    _$jscoverage['/class-list.js'].lineData[23]++;
    className = norm(elemClass);
    _$jscoverage['/class-list.js'].lineData[24]++;
    for (j = 0 , cl = classNames.length; visit2_24_1(j < cl); j++) {
      _$jscoverage['/class-list.js'].lineData[25]++;
      if (visit3_25_1(className.indexOf(SPACE + classNames[j] + SPACE) < 0)) {
        _$jscoverage['/class-list.js'].lineData[26]++;
        return false;
      }
    }
    _$jscoverage['/class-list.js'].lineData[29]++;
    return true;
  }
  _$jscoverage['/class-list.js'].lineData[31]++;
  return false;
}, 
  _addClass: function(elem, classNames) {
  _$jscoverage['/class-list.js'].functionData[3]++;
  _$jscoverage['/class-list.js'].lineData[35]++;
  var elemClass = elem.className, normClassName, cl = classNames.length, setClass, j;
  _$jscoverage['/class-list.js'].lineData[40]++;
  if (visit4_40_1(elemClass)) {
    _$jscoverage['/class-list.js'].lineData[41]++;
    normClassName = norm(elemClass);
    _$jscoverage['/class-list.js'].lineData[42]++;
    setClass = elemClass;
    _$jscoverage['/class-list.js'].lineData[43]++;
    j = 0;
    _$jscoverage['/class-list.js'].lineData[44]++;
    for (; visit5_44_1(j < cl); j++) {
      _$jscoverage['/class-list.js'].lineData[45]++;
      if (visit6_45_1(normClassName.indexOf(SPACE + classNames[j] + SPACE) < 0)) {
        _$jscoverage['/class-list.js'].lineData[46]++;
        setClass += SPACE + classNames[j];
      }
    }
    _$jscoverage['/class-list.js'].lineData[49]++;
    setClass = util.trim(setClass);
  } else {
    _$jscoverage['/class-list.js'].lineData[51]++;
    setClass = classNames.join(' ');
  }
  _$jscoverage['/class-list.js'].lineData[53]++;
  elem.className = setClass;
}, 
  _removeClass: function(elem, classNames) {
  _$jscoverage['/class-list.js'].functionData[4]++;
  _$jscoverage['/class-list.js'].lineData[57]++;
  var elemClass = elem.className, className, cl = classNames.length, j, needle;
  _$jscoverage['/class-list.js'].lineData[62]++;
  if (visit7_62_1(elemClass && cl)) {
    _$jscoverage['/class-list.js'].lineData[63]++;
    className = norm(elemClass);
    _$jscoverage['/class-list.js'].lineData[64]++;
    j = 0;
    _$jscoverage['/class-list.js'].lineData[65]++;
    for (; visit8_65_1(j < cl); j++) {
      _$jscoverage['/class-list.js'].lineData[66]++;
      needle = SPACE + classNames[j] + SPACE;
      _$jscoverage['/class-list.js'].lineData[68]++;
      while (visit9_68_1(className.indexOf(needle) >= 0)) {
        _$jscoverage['/class-list.js'].lineData[69]++;
        className = className.replace(needle, SPACE);
      }
    }
    _$jscoverage['/class-list.js'].lineData[72]++;
    elem.className = util.trim(className);
  }
}, 
  _toggleClass: function(elem, classNames, force) {
  _$jscoverage['/class-list.js'].functionData[5]++;
  _$jscoverage['/class-list.js'].lineData[77]++;
  var j, className, result, method, self = this, removed = [], added = [], cl = classNames.length;
  _$jscoverage['/class-list.js'].lineData[84]++;
  for (j = 0; visit10_84_1(j < cl); j++) {
    _$jscoverage['/class-list.js'].lineData[85]++;
    className = classNames[j];
    _$jscoverage['/class-list.js'].lineData[86]++;
    result = self._hasClass(elem, [className]);
    _$jscoverage['/class-list.js'].lineData[87]++;
    method = result ? visit11_87_1(visit12_87_2(force !== true) && 'remove') : visit13_88_1(visit14_88_2(force !== false) && 'add');
    _$jscoverage['/class-list.js'].lineData[89]++;
    if (visit15_89_1(method === 'remove')) {
      _$jscoverage['/class-list.js'].lineData[90]++;
      removed.push(className);
    } else {
      _$jscoverage['/class-list.js'].lineData[91]++;
      if (visit16_91_1(method === 'add')) {
        _$jscoverage['/class-list.js'].lineData[92]++;
        added.push(className);
      }
    }
  }
  _$jscoverage['/class-list.js'].lineData[95]++;
  if (visit17_95_1(added.length)) {
    _$jscoverage['/class-list.js'].lineData[96]++;
    self._addClass(elem, added);
  }
  _$jscoverage['/class-list.js'].lineData[98]++;
  if (visit18_98_1(removed.length)) {
    _$jscoverage['/class-list.js'].lineData[99]++;
    self._removeClass(elem, removed);
  }
}});
});
