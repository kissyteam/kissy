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
if (! _$jscoverage['/ie/input-selection.js']) {
  _$jscoverage['/ie/input-selection.js'] = {};
  _$jscoverage['/ie/input-selection.js'].lineData = [];
  _$jscoverage['/ie/input-selection.js'].lineData[5] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[6] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[14] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[16] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[18] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[19] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[21] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[22] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[23] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[24] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[26] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[30] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[34] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[36] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[38] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[39] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[41] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[42] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[43] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[44] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[46] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[51] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[55] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[56] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[60] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[61] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[62] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[63] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[64] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[67] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[70] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[71] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[74] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[76] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[77] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[78] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[79] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[81] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[86] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[87] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[88] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[89] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[90] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[92] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[93] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[94] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[95] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[97] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[99] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[104] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[105] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[106] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[110] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[111] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[114] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[117] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[118] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[121] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[123] = 0;
}
if (! _$jscoverage['/ie/input-selection.js'].functionData) {
  _$jscoverage['/ie/input-selection.js'].functionData = [];
  _$jscoverage['/ie/input-selection.js'].functionData[0] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[1] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[2] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[3] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[4] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[5] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[6] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[7] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[8] = 0;
  _$jscoverage['/ie/input-selection.js'].functionData[9] = 0;
}
if (! _$jscoverage['/ie/input-selection.js'].branchData) {
  _$jscoverage['/ie/input-selection.js'].branchData = {};
  _$jscoverage['/ie/input-selection.js'].branchData['18'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['23'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['38'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['43'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['60'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['63'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['76'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['89'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['92'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['94'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['105'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['110'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['117'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['117'][1] = new BranchData();
}
_$jscoverage['/ie/input-selection.js'].branchData['117'][1].init(337, 21, 'testRange.text == ret');
function visit50_117_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['110'][1].init(129, 56, 'testRange.compareEndPoints(\'StartToEnd\', testRange) == 0');
function visit49_110_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['105'][1].init(14, 23, 'elem.type == "textarea"');
function visit48_105_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['94'][1].init(103, 5, 's > e');
function visit47_94_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['92'][1].init(149, 23, 'elem.type == "textarea"');
function visit46_92_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['89'][1].init(86, 12, 'start == end');
function visit45_89_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['76'][1].init(69, 23, 'elem.type == \'textarea\'');
function visit44_76_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['63'][1].init(145, 10, 'includeEnd');
function visit43_63_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['60'][1].init(162, 34, 'inputRange.inRange(selectionRange)');
function visit42_60_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['43'][1].init(245, 11, 'start > end');
function visit41_43_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['38'][1].init(128, 34, 'inputRange.inRange(selectionRange)');
function visit40_38_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['23'][1].init(250, 11, 'start > end');
function visit39_23_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['18'][1].init(128, 34, 'inputRange.inRange(selectionRange)');
function visit38_18_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].lineData[5]++;
KISSY.add('dom/ie/input-selection', function(S, Dom) {
  _$jscoverage['/ie/input-selection.js'].functionData[0]++;
  _$jscoverage['/ie/input-selection.js'].lineData[6]++;
  var propHooks = Dom._propHooks;
  _$jscoverage['/ie/input-selection.js'].lineData[14]++;
  propHooks.selectionStart = {
  set: function(elem, start) {
  _$jscoverage['/ie/input-selection.js'].functionData[1]++;
  _$jscoverage['/ie/input-selection.js'].lineData[16]++;
  var selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
  _$jscoverage['/ie/input-selection.js'].lineData[18]++;
  if (visit38_18_1(inputRange.inRange(selectionRange))) {
    _$jscoverage['/ie/input-selection.js'].lineData[19]++;
    var end = getStartEnd(elem, 1)[1], diff = getMovedDistance(elem, start, end);
    _$jscoverage['/ie/input-selection.js'].lineData[21]++;
    selectionRange.collapse(false);
    _$jscoverage['/ie/input-selection.js'].lineData[22]++;
    selectionRange.moveStart('character', -diff);
    _$jscoverage['/ie/input-selection.js'].lineData[23]++;
    if (visit39_23_1(start > end)) {
      _$jscoverage['/ie/input-selection.js'].lineData[24]++;
      selectionRange.collapse(true);
    }
    _$jscoverage['/ie/input-selection.js'].lineData[26]++;
    selectionRange.select();
  }
}, 
  get: function(elem) {
  _$jscoverage['/ie/input-selection.js'].functionData[2]++;
  _$jscoverage['/ie/input-selection.js'].lineData[30]++;
  return getStartEnd(elem)[0];
}};
  _$jscoverage['/ie/input-selection.js'].lineData[34]++;
  propHooks.selectionEnd = {
  set: function(elem, end) {
  _$jscoverage['/ie/input-selection.js'].functionData[3]++;
  _$jscoverage['/ie/input-selection.js'].lineData[36]++;
  var selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
  _$jscoverage['/ie/input-selection.js'].lineData[38]++;
  if (visit40_38_1(inputRange.inRange(selectionRange))) {
    _$jscoverage['/ie/input-selection.js'].lineData[39]++;
    var start = getStartEnd(elem)[0], diff = getMovedDistance(elem, start, end);
    _$jscoverage['/ie/input-selection.js'].lineData[41]++;
    selectionRange.collapse(true);
    _$jscoverage['/ie/input-selection.js'].lineData[42]++;
    selectionRange.moveEnd('character', diff);
    _$jscoverage['/ie/input-selection.js'].lineData[43]++;
    if (visit41_43_1(start > end)) {
      _$jscoverage['/ie/input-selection.js'].lineData[44]++;
      selectionRange.collapse(false);
    }
    _$jscoverage['/ie/input-selection.js'].lineData[46]++;
    selectionRange.select();
  }
}, 
  get: function(elem) {
  _$jscoverage['/ie/input-selection.js'].functionData[4]++;
  _$jscoverage['/ie/input-selection.js'].lineData[51]++;
  return getStartEnd(elem, 1)[1];
}};
  _$jscoverage['/ie/input-selection.js'].lineData[55]++;
  function getStartEnd(elem, includeEnd) {
    _$jscoverage['/ie/input-selection.js'].functionData[5]++;
    _$jscoverage['/ie/input-selection.js'].lineData[56]++;
    var start = 0, end = 0, selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
    _$jscoverage['/ie/input-selection.js'].lineData[60]++;
    if (visit42_60_1(inputRange.inRange(selectionRange))) {
      _$jscoverage['/ie/input-selection.js'].lineData[61]++;
      inputRange.setEndPoint('EndToStart', selectionRange);
      _$jscoverage['/ie/input-selection.js'].lineData[62]++;
      start = getRangeText(elem, inputRange).length;
      _$jscoverage['/ie/input-selection.js'].lineData[63]++;
      if (visit43_63_1(includeEnd)) {
        _$jscoverage['/ie/input-selection.js'].lineData[64]++;
        end = start + getRangeText(elem, selectionRange).length;
      }
    }
    _$jscoverage['/ie/input-selection.js'].lineData[67]++;
    return [start, end];
  }
  _$jscoverage['/ie/input-selection.js'].lineData[70]++;
  function getSelectionRange(elem) {
    _$jscoverage['/ie/input-selection.js'].functionData[6]++;
    _$jscoverage['/ie/input-selection.js'].lineData[71]++;
    return elem.ownerDocument.selection.createRange();
  }
  _$jscoverage['/ie/input-selection.js'].lineData[74]++;
  function getInputRange(elem) {
    _$jscoverage['/ie/input-selection.js'].functionData[7]++;
    _$jscoverage['/ie/input-selection.js'].lineData[76]++;
    if (visit44_76_1(elem.type == 'textarea')) {
      _$jscoverage['/ie/input-selection.js'].lineData[77]++;
      var range = elem.document.body.createTextRange();
      _$jscoverage['/ie/input-selection.js'].lineData[78]++;
      range.moveToElementText(elem);
      _$jscoverage['/ie/input-selection.js'].lineData[79]++;
      return range;
    } else {
      _$jscoverage['/ie/input-selection.js'].lineData[81]++;
      return elem.createTextRange();
    }
  }
  _$jscoverage['/ie/input-selection.js'].lineData[86]++;
  function getMovedDistance(elem, s, e) {
    _$jscoverage['/ie/input-selection.js'].functionData[8]++;
    _$jscoverage['/ie/input-selection.js'].lineData[87]++;
    var start = Math.min(s, e);
    _$jscoverage['/ie/input-selection.js'].lineData[88]++;
    var end = Math.max(s, e);
    _$jscoverage['/ie/input-selection.js'].lineData[89]++;
    if (visit45_89_1(start == end)) {
      _$jscoverage['/ie/input-selection.js'].lineData[90]++;
      return 0;
    }
    _$jscoverage['/ie/input-selection.js'].lineData[92]++;
    if (visit46_92_1(elem.type == "textarea")) {
      _$jscoverage['/ie/input-selection.js'].lineData[93]++;
      var l = elem.value.substring(start, end).replace(/\r\n/g, '\n').length;
      _$jscoverage['/ie/input-selection.js'].lineData[94]++;
      if (visit47_94_1(s > e)) {
        _$jscoverage['/ie/input-selection.js'].lineData[95]++;
        l = -l;
      }
      _$jscoverage['/ie/input-selection.js'].lineData[97]++;
      return l;
    } else {
      _$jscoverage['/ie/input-selection.js'].lineData[99]++;
      return e - s;
    }
  }
  _$jscoverage['/ie/input-selection.js'].lineData[104]++;
  function getRangeText(elem, range) {
    _$jscoverage['/ie/input-selection.js'].functionData[9]++;
    _$jscoverage['/ie/input-selection.js'].lineData[105]++;
    if (visit48_105_1(elem.type == "textarea")) {
      _$jscoverage['/ie/input-selection.js'].lineData[106]++;
      var ret = range.text, testRange = range.duplicate();
      _$jscoverage['/ie/input-selection.js'].lineData[110]++;
      if (visit49_110_1(testRange.compareEndPoints('StartToEnd', testRange) == 0)) {
        _$jscoverage['/ie/input-selection.js'].lineData[111]++;
        return ret;
      }
      _$jscoverage['/ie/input-selection.js'].lineData[114]++;
      testRange.moveEnd('character', -1);
      _$jscoverage['/ie/input-selection.js'].lineData[117]++;
      if (visit50_117_1(testRange.text == ret)) {
        _$jscoverage['/ie/input-selection.js'].lineData[118]++;
        ret += '\r\n';
      }
      _$jscoverage['/ie/input-selection.js'].lineData[121]++;
      return ret;
    } else {
      _$jscoverage['/ie/input-selection.js'].lineData[123]++;
      return range.text;
    }
  }
}, {
  requires: ['dom/base']});
