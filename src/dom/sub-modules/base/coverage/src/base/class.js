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
if (! _$jscoverage['/base/class.js']) {
  _$jscoverage['/base/class.js'] = {};
  _$jscoverage['/base/class.js'].lineData = [];
  _$jscoverage['/base/class.js'].lineData[6] = 0;
  _$jscoverage['/base/class.js'].lineData[7] = 0;
  _$jscoverage['/base/class.js'].lineData[8] = 0;
  _$jscoverage['/base/class.js'].lineData[9] = 0;
  _$jscoverage['/base/class.js'].lineData[13] = 0;
  _$jscoverage['/base/class.js'].lineData[14] = 0;
  _$jscoverage['/base/class.js'].lineData[15] = 0;
  _$jscoverage['/base/class.js'].lineData[19] = 0;
  _$jscoverage['/base/class.js'].lineData[20] = 0;
  _$jscoverage['/base/class.js'].lineData[21] = 0;
  _$jscoverage['/base/class.js'].lineData[24] = 0;
  _$jscoverage['/base/class.js'].lineData[27] = 0;
  _$jscoverage['/base/class.js'].lineData[28] = 0;
  _$jscoverage['/base/class.js'].lineData[29] = 0;
  _$jscoverage['/base/class.js'].lineData[33] = 0;
  _$jscoverage['/base/class.js'].lineData[34] = 0;
  _$jscoverage['/base/class.js'].lineData[35] = 0;
  _$jscoverage['/base/class.js'].lineData[41] = 0;
  _$jscoverage['/base/class.js'].lineData[42] = 0;
  _$jscoverage['/base/class.js'].lineData[43] = 0;
  _$jscoverage['/base/class.js'].lineData[45] = 0;
  _$jscoverage['/base/class.js'].lineData[46] = 0;
  _$jscoverage['/base/class.js'].lineData[47] = 0;
  _$jscoverage['/base/class.js'].lineData[53] = 0;
  _$jscoverage['/base/class.js'].lineData[61] = 0;
  _$jscoverage['/base/class.js'].lineData[62] = 0;
  _$jscoverage['/base/class.js'].lineData[63] = 0;
  _$jscoverage['/base/class.js'].lineData[64] = 0;
  _$jscoverage['/base/class.js'].lineData[65] = 0;
  _$jscoverage['/base/class.js'].lineData[66] = 0;
  _$jscoverage['/base/class.js'].lineData[69] = 0;
  _$jscoverage['/base/class.js'].lineData[71] = 0;
  _$jscoverage['/base/class.js'].lineData[89] = 0;
  _$jscoverage['/base/class.js'].lineData[90] = 0;
  _$jscoverage['/base/class.js'].lineData[91] = 0;
  _$jscoverage['/base/class.js'].lineData[92] = 0;
  _$jscoverage['/base/class.js'].lineData[94] = 0;
  _$jscoverage['/base/class.js'].lineData[95] = 0;
  _$jscoverage['/base/class.js'].lineData[97] = 0;
  _$jscoverage['/base/class.js'].lineData[99] = 0;
  _$jscoverage['/base/class.js'].lineData[113] = 0;
  _$jscoverage['/base/class.js'].lineData[114] = 0;
  _$jscoverage['/base/class.js'].lineData[150] = 0;
}
if (! _$jscoverage['/base/class.js'].functionData) {
  _$jscoverage['/base/class.js'].functionData = [];
  _$jscoverage['/base/class.js'].functionData[0] = 0;
  _$jscoverage['/base/class.js'].functionData[1] = 0;
  _$jscoverage['/base/class.js'].functionData[2] = 0;
  _$jscoverage['/base/class.js'].functionData[3] = 0;
  _$jscoverage['/base/class.js'].functionData[4] = 0;
  _$jscoverage['/base/class.js'].functionData[5] = 0;
  _$jscoverage['/base/class.js'].functionData[6] = 0;
  _$jscoverage['/base/class.js'].functionData[7] = 0;
  _$jscoverage['/base/class.js'].functionData[8] = 0;
  _$jscoverage['/base/class.js'].functionData[9] = 0;
  _$jscoverage['/base/class.js'].functionData[10] = 0;
}
if (! _$jscoverage['/base/class.js'].branchData) {
  _$jscoverage['/base/class.js'].branchData = {};
  _$jscoverage['/base/class.js'].branchData['14'] = [];
  _$jscoverage['/base/class.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['19'] = [];
  _$jscoverage['/base/class.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['33'] = [];
  _$jscoverage['/base/class.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['46'] = [];
  _$jscoverage['/base/class.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['62'] = [];
  _$jscoverage['/base/class.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['63'] = [];
  _$jscoverage['/base/class.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['65'] = [];
  _$jscoverage['/base/class.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['92'] = [];
  _$jscoverage['/base/class.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base/class.js'].branchData['92'][2] = new BranchData();
}
_$jscoverage['/base/class.js'].branchData['92'][2].init(26, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit109_92_2(result) {
  _$jscoverage['/base/class.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['92'][1].init(26, 98, 'elem.nodeType === NodeType.ELEMENT_NODE && Dom._hasClass(elem, className)');
function visit108_92_1(result) {
  _$jscoverage['/base/class.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['65'][1].init(82, 43, 'className && !classList.contains(className)');
function visit107_65_1(result) {
  _$jscoverage['/base/class.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['63'][1].init(57, 5, 'i < l');
function visit106_63_1(result) {
  _$jscoverage['/base/class.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['62'][1].init(88, 16, 'classList.length');
function visit105_62_1(result) {
  _$jscoverage['/base/class.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['46'][1].init(22, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit104_46_1(result) {
  _$jscoverage['/base/class.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['33'][1].init(200, 5, 'i < l');
function visit103_33_1(result) {
  _$jscoverage['/base/class.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['19'][1].init(172, 5, 'i < l');
function visit102_19_1(result) {
  _$jscoverage['/base/class.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].branchData['14'][1].init(26, 9, 'str || \'\'');
function visit101_14_1(result) {
  _$jscoverage['/base/class.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/class.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/class.js'].functionData[0]++;
  _$jscoverage['/base/class.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/class.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/base/class.js'].lineData[9]++;
  var slice = [].slice, NodeType = Dom.NodeType, RE_SPLIT = /[\.\s]\s*\.?/;
  _$jscoverage['/base/class.js'].lineData[13]++;
  function strToArray(str) {
    _$jscoverage['/base/class.js'].functionData[1]++;
    _$jscoverage['/base/class.js'].lineData[14]++;
    str = util.trim(visit101_14_1(str || ''));
    _$jscoverage['/base/class.js'].lineData[15]++;
    var arr = str.split(RE_SPLIT), newArr = [], v, l = arr.length, i = 0;
    _$jscoverage['/base/class.js'].lineData[19]++;
    for (; visit102_19_1(i < l); i++) {
      _$jscoverage['/base/class.js'].lineData[20]++;
      if ((v = arr[i])) {
        _$jscoverage['/base/class.js'].lineData[21]++;
        newArr.push(v);
      }
    }
    _$jscoverage['/base/class.js'].lineData[24]++;
    return newArr;
  }
  _$jscoverage['/base/class.js'].lineData[27]++;
  function batchClassList(method) {
    _$jscoverage['/base/class.js'].functionData[2]++;
    _$jscoverage['/base/class.js'].lineData[28]++;
    return function(elem, classNames) {
  _$jscoverage['/base/class.js'].functionData[3]++;
  _$jscoverage['/base/class.js'].lineData[29]++;
  var i, l, className, classList = elem.classList, extraArgs = slice.call(arguments, 2);
  _$jscoverage['/base/class.js'].lineData[33]++;
  for (i = 0 , l = classNames.length; visit103_33_1(i < l); i++) {
    _$jscoverage['/base/class.js'].lineData[34]++;
    if ((className = classNames[i])) {
      _$jscoverage['/base/class.js'].lineData[35]++;
      classList[method].apply(classList, [className].concat(extraArgs));
    }
  }
};
  }
  _$jscoverage['/base/class.js'].lineData[41]++;
  function batchEls(method) {
    _$jscoverage['/base/class.js'].functionData[4]++;
    _$jscoverage['/base/class.js'].lineData[42]++;
    return function(selector, className) {
  _$jscoverage['/base/class.js'].functionData[5]++;
  _$jscoverage['/base/class.js'].lineData[43]++;
  var classNames = strToArray(className), extraArgs = slice.call(arguments, 2);
  _$jscoverage['/base/class.js'].lineData[45]++;
  Dom.query(selector).each(function(elem) {
  _$jscoverage['/base/class.js'].functionData[6]++;
  _$jscoverage['/base/class.js'].lineData[46]++;
  if (visit104_46_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base/class.js'].lineData[47]++;
    Dom[method].apply(Dom, [elem, classNames].concat(extraArgs));
  }
});
};
  }
  _$jscoverage['/base/class.js'].lineData[53]++;
  util.mix(Dom, {
  _hasClass: function(elem, classNames) {
  _$jscoverage['/base/class.js'].functionData[7]++;
  _$jscoverage['/base/class.js'].lineData[61]++;
  var i, l, className, classList = elem.classList;
  _$jscoverage['/base/class.js'].lineData[62]++;
  if (visit105_62_1(classList.length)) {
    _$jscoverage['/base/class.js'].lineData[63]++;
    for (i = 0 , l = classNames.length; visit106_63_1(i < l); i++) {
      _$jscoverage['/base/class.js'].lineData[64]++;
      className = classNames[i];
      _$jscoverage['/base/class.js'].lineData[65]++;
      if (visit107_65_1(className && !classList.contains(className))) {
        _$jscoverage['/base/class.js'].lineData[66]++;
        return false;
      }
    }
    _$jscoverage['/base/class.js'].lineData[69]++;
    return true;
  }
  _$jscoverage['/base/class.js'].lineData[71]++;
  return false;
}, 
  _addClass: batchClassList('add'), 
  _removeClass: batchClassList('remove'), 
  _toggleClass: batchClassList('toggle'), 
  hasClass: function(selector, className) {
  _$jscoverage['/base/class.js'].functionData[8]++;
  _$jscoverage['/base/class.js'].lineData[89]++;
  var ret = false;
  _$jscoverage['/base/class.js'].lineData[90]++;
  className = strToArray(className);
  _$jscoverage['/base/class.js'].lineData[91]++;
  Dom.query(selector).each(function(elem) {
  _$jscoverage['/base/class.js'].functionData[9]++;
  _$jscoverage['/base/class.js'].lineData[92]++;
  if (visit108_92_1(visit109_92_2(elem.nodeType === NodeType.ELEMENT_NODE) && Dom._hasClass(elem, className))) {
    _$jscoverage['/base/class.js'].lineData[94]++;
    ret = true;
    _$jscoverage['/base/class.js'].lineData[95]++;
    return false;
  }
  _$jscoverage['/base/class.js'].lineData[97]++;
  return undefined;
});
  _$jscoverage['/base/class.js'].lineData[99]++;
  return ret;
}, 
  replaceClass: function(selector, oldClassName, newClassName) {
  _$jscoverage['/base/class.js'].functionData[10]++;
  _$jscoverage['/base/class.js'].lineData[113]++;
  Dom.removeClass(selector, oldClassName);
  _$jscoverage['/base/class.js'].lineData[114]++;
  Dom.addClass(selector, newClassName);
}, 
  addClass: batchEls('_addClass'), 
  removeClass: batchEls('_removeClass'), 
  toggleClass: batchEls('_toggleClass')});
  _$jscoverage['/base/class.js'].lineData[150]++;
  return Dom;
});
