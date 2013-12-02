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
  _$jscoverage['/class-list.js'].lineData[11] = 0;
  _$jscoverage['/class-list.js'].lineData[12] = 0;
  _$jscoverage['/class-list.js'].lineData[15] = 0;
  _$jscoverage['/class-list.js'].lineData[17] = 0;
  _$jscoverage['/class-list.js'].lineData[21] = 0;
  _$jscoverage['/class-list.js'].lineData[22] = 0;
  _$jscoverage['/class-list.js'].lineData[23] = 0;
  _$jscoverage['/class-list.js'].lineData[24] = 0;
  _$jscoverage['/class-list.js'].lineData[25] = 0;
  _$jscoverage['/class-list.js'].lineData[28] = 0;
  _$jscoverage['/class-list.js'].lineData[30] = 0;
  _$jscoverage['/class-list.js'].lineData[34] = 0;
  _$jscoverage['/class-list.js'].lineData[39] = 0;
  _$jscoverage['/class-list.js'].lineData[40] = 0;
  _$jscoverage['/class-list.js'].lineData[41] = 0;
  _$jscoverage['/class-list.js'].lineData[42] = 0;
  _$jscoverage['/class-list.js'].lineData[43] = 0;
  _$jscoverage['/class-list.js'].lineData[44] = 0;
  _$jscoverage['/class-list.js'].lineData[45] = 0;
  _$jscoverage['/class-list.js'].lineData[48] = 0;
  _$jscoverage['/class-list.js'].lineData[50] = 0;
  _$jscoverage['/class-list.js'].lineData[52] = 0;
  _$jscoverage['/class-list.js'].lineData[56] = 0;
  _$jscoverage['/class-list.js'].lineData[61] = 0;
  _$jscoverage['/class-list.js'].lineData[62] = 0;
  _$jscoverage['/class-list.js'].lineData[63] = 0;
  _$jscoverage['/class-list.js'].lineData[64] = 0;
  _$jscoverage['/class-list.js'].lineData[65] = 0;
  _$jscoverage['/class-list.js'].lineData[67] = 0;
  _$jscoverage['/class-list.js'].lineData[68] = 0;
  _$jscoverage['/class-list.js'].lineData[71] = 0;
  _$jscoverage['/class-list.js'].lineData[76] = 0;
  _$jscoverage['/class-list.js'].lineData[83] = 0;
  _$jscoverage['/class-list.js'].lineData[84] = 0;
  _$jscoverage['/class-list.js'].lineData[85] = 0;
  _$jscoverage['/class-list.js'].lineData[86] = 0;
  _$jscoverage['/class-list.js'].lineData[88] = 0;
  _$jscoverage['/class-list.js'].lineData[89] = 0;
  _$jscoverage['/class-list.js'].lineData[90] = 0;
  _$jscoverage['/class-list.js'].lineData[91] = 0;
  _$jscoverage['/class-list.js'].lineData[94] = 0;
  _$jscoverage['/class-list.js'].lineData[95] = 0;
  _$jscoverage['/class-list.js'].lineData[97] = 0;
  _$jscoverage['/class-list.js'].lineData[98] = 0;
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
  _$jscoverage['/class-list.js'].branchData['21'] = [];
  _$jscoverage['/class-list.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['23'] = [];
  _$jscoverage['/class-list.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['24'] = [];
  _$jscoverage['/class-list.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['39'] = [];
  _$jscoverage['/class-list.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['43'] = [];
  _$jscoverage['/class-list.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['44'] = [];
  _$jscoverage['/class-list.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['61'] = [];
  _$jscoverage['/class-list.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['64'] = [];
  _$jscoverage['/class-list.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['67'] = [];
  _$jscoverage['/class-list.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['83'] = [];
  _$jscoverage['/class-list.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['86'] = [];
  _$jscoverage['/class-list.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['87'] = [];
  _$jscoverage['/class-list.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['88'] = [];
  _$jscoverage['/class-list.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['90'] = [];
  _$jscoverage['/class-list.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['94'] = [];
  _$jscoverage['/class-list.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/class-list.js'].branchData['97'] = [];
  _$jscoverage['/class-list.js'].branchData['97'][1] = new BranchData();
}
_$jscoverage['/class-list.js'].branchData['97'][1].init(774, 14, 'removed.length');
function visit18_97_1(result) {
  _$jscoverage['/class-list.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['94'][1].init(683, 12, 'added.length');
function visit17_94_1(result) {
  _$jscoverage['/class-list.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['90'][1].init(329, 16, 'method === \'add\'');
function visit16_90_1(result) {
  _$jscoverage['/class-list.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['88'][1].init(233, 19, 'method === \'remove\'');
function visit15_88_1(result) {
  _$jscoverage['/class-list.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['87'][2].init(67, 15, 'force !== false');
function visit14_87_2(result) {
  _$jscoverage['/class-list.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['87'][1].init(57, 24, 'force !== false && \'add\'');
function visit13_87_1(result) {
  _$jscoverage['/class-list.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['86'][2].init(138, 14, 'force !== true');
function visit12_86_2(result) {
  _$jscoverage['/class-list.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['86'][1].init(138, 26, 'force !== true && \'remove\'');
function visit11_86_1(result) {
  _$jscoverage['/class-list.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['83'][1].init(230, 6, 'j < cl');
function visit10_83_1(result) {
  _$jscoverage['/class-list.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['67'][1].init(155, 30, 'className.indexOf(needle) >= 0');
function visit9_67_1(result) {
  _$jscoverage['/class-list.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['64'][1].init(92, 6, 'j < cl');
function visit8_64_1(result) {
  _$jscoverage['/class-list.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['61'][1].init(171, 15, 'elemClass && cl');
function visit7_61_1(result) {
  _$jscoverage['/class-list.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['44'][1].init(25, 56, 'normClassName.indexOf(SPACE + classNames[j] + SPACE) < 0');
function visit6_44_1(result) {
  _$jscoverage['/class-list.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['43'][1].init(134, 6, 'j < cl');
function visit5_43_1(result) {
  _$jscoverage['/class-list.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['39'][1].init(177, 9, 'elemClass');
function visit4_39_1(result) {
  _$jscoverage['/class-list.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['24'][1].init(25, 52, 'className.indexOf(SPACE + classNames[j] + SPACE) < 0');
function visit3_24_1(result) {
  _$jscoverage['/class-list.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['23'][1].init(98, 6, 'j < cl');
function visit2_23_1(result) {
  _$jscoverage['/class-list.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].branchData['21'][1].init(127, 9, 'elemClass');
function visit1_21_1(result) {
  _$jscoverage['/class-list.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/class-list.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/class-list.js'].functionData[0]++;
  _$jscoverage['/class-list.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/class-list.js'].lineData[8]++;
  var SPACE = ' ', RE_CLASS = /[\n\t\r]/g;
  _$jscoverage['/class-list.js'].lineData[11]++;
  function norm(elemClass) {
    _$jscoverage['/class-list.js'].functionData[1]++;
    _$jscoverage['/class-list.js'].lineData[12]++;
    return (SPACE + elemClass + SPACE).replace(RE_CLASS, SPACE);
  }
  _$jscoverage['/class-list.js'].lineData[15]++;
  return S.mix(Dom, {
  _hasClass: function(elem, classNames) {
  _$jscoverage['/class-list.js'].functionData[2]++;
  _$jscoverage['/class-list.js'].lineData[17]++;
  var elemClass = elem.className, className, cl, j;
  _$jscoverage['/class-list.js'].lineData[21]++;
  if (visit1_21_1(elemClass)) {
    _$jscoverage['/class-list.js'].lineData[22]++;
    className = norm(elemClass);
    _$jscoverage['/class-list.js'].lineData[23]++;
    for (j = 0 , cl = classNames.length; visit2_23_1(j < cl); j++) {
      _$jscoverage['/class-list.js'].lineData[24]++;
      if (visit3_24_1(className.indexOf(SPACE + classNames[j] + SPACE) < 0)) {
        _$jscoverage['/class-list.js'].lineData[25]++;
        return false;
      }
    }
    _$jscoverage['/class-list.js'].lineData[28]++;
    return true;
  }
  _$jscoverage['/class-list.js'].lineData[30]++;
  return false;
}, 
  _addClass: function(elem, classNames) {
  _$jscoverage['/class-list.js'].functionData[3]++;
  _$jscoverage['/class-list.js'].lineData[34]++;
  var elemClass = elem.className, normClassName, cl = classNames.length, setClass, j;
  _$jscoverage['/class-list.js'].lineData[39]++;
  if (visit4_39_1(elemClass)) {
    _$jscoverage['/class-list.js'].lineData[40]++;
    normClassName = norm(elemClass);
    _$jscoverage['/class-list.js'].lineData[41]++;
    setClass = elemClass;
    _$jscoverage['/class-list.js'].lineData[42]++;
    j = 0;
    _$jscoverage['/class-list.js'].lineData[43]++;
    for (; visit5_43_1(j < cl); j++) {
      _$jscoverage['/class-list.js'].lineData[44]++;
      if (visit6_44_1(normClassName.indexOf(SPACE + classNames[j] + SPACE) < 0)) {
        _$jscoverage['/class-list.js'].lineData[45]++;
        setClass += SPACE + classNames[j];
      }
    }
    _$jscoverage['/class-list.js'].lineData[48]++;
    setClass = S.trim(setClass);
  } else {
    _$jscoverage['/class-list.js'].lineData[50]++;
    setClass = classNames.join(' ');
  }
  _$jscoverage['/class-list.js'].lineData[52]++;
  elem.className = setClass;
}, 
  _removeClass: function(elem, classNames) {
  _$jscoverage['/class-list.js'].functionData[4]++;
  _$jscoverage['/class-list.js'].lineData[56]++;
  var elemClass = elem.className, className, cl = classNames.length, j, needle;
  _$jscoverage['/class-list.js'].lineData[61]++;
  if (visit7_61_1(elemClass && cl)) {
    _$jscoverage['/class-list.js'].lineData[62]++;
    className = norm(elemClass);
    _$jscoverage['/class-list.js'].lineData[63]++;
    j = 0;
    _$jscoverage['/class-list.js'].lineData[64]++;
    for (; visit8_64_1(j < cl); j++) {
      _$jscoverage['/class-list.js'].lineData[65]++;
      needle = SPACE + classNames[j] + SPACE;
      _$jscoverage['/class-list.js'].lineData[67]++;
      while (visit9_67_1(className.indexOf(needle) >= 0)) {
        _$jscoverage['/class-list.js'].lineData[68]++;
        className = className.replace(needle, SPACE);
      }
    }
    _$jscoverage['/class-list.js'].lineData[71]++;
    elem.className = S.trim(className);
  }
}, 
  '_toggleClass': function(elem, classNames, force) {
  _$jscoverage['/class-list.js'].functionData[5]++;
  _$jscoverage['/class-list.js'].lineData[76]++;
  var j, className, result, method, self = this, removed = [], added = [], cl = classNames.length;
  _$jscoverage['/class-list.js'].lineData[83]++;
  for (j = 0; visit10_83_1(j < cl); j++) {
    _$jscoverage['/class-list.js'].lineData[84]++;
    className = classNames[j];
    _$jscoverage['/class-list.js'].lineData[85]++;
    result = self._hasClass(elem, [className]);
    _$jscoverage['/class-list.js'].lineData[86]++;
    method = result ? visit11_86_1(visit12_86_2(force !== true) && 'remove') : visit13_87_1(visit14_87_2(force !== false) && 'add');
    _$jscoverage['/class-list.js'].lineData[88]++;
    if (visit15_88_1(method === 'remove')) {
      _$jscoverage['/class-list.js'].lineData[89]++;
      removed.push(className);
    } else {
      _$jscoverage['/class-list.js'].lineData[90]++;
      if (visit16_90_1(method === 'add')) {
        _$jscoverage['/class-list.js'].lineData[91]++;
        added.push(className);
      }
    }
  }
  _$jscoverage['/class-list.js'].lineData[94]++;
  if (visit17_94_1(added.length)) {
    _$jscoverage['/class-list.js'].lineData[95]++;
    self._addClass(elem, added);
  }
  _$jscoverage['/class-list.js'].lineData[97]++;
  if (visit18_97_1(removed.length)) {
    _$jscoverage['/class-list.js'].lineData[98]++;
    self._removeClass(elem, removed);
  }
}});
});
