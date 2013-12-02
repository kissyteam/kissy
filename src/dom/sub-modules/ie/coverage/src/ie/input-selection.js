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
  _$jscoverage['/ie/input-selection.js'].lineData[6] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[7] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[8] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[15] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[17] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[19] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[20] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[22] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[23] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[24] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[25] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[27] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[31] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[35] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[37] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[39] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[40] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[42] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[43] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[44] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[45] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[47] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[52] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[56] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[57] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[61] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[62] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[63] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[64] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[65] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[68] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[71] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[72] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[75] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[77] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[78] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[79] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[80] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[82] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[87] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[88] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[89] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[90] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[91] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[93] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[94] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[95] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[96] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[98] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[100] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[105] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[106] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[107] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[111] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[112] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[115] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[118] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[119] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[122] = 0;
  _$jscoverage['/ie/input-selection.js'].lineData[124] = 0;
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
  _$jscoverage['/ie/input-selection.js'].branchData['19'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['24'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['39'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['44'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['61'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['64'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['77'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['90'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['93'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['95'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['106'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['111'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/ie/input-selection.js'].branchData['118'] = [];
  _$jscoverage['/ie/input-selection.js'].branchData['118'][1] = new BranchData();
}
_$jscoverage['/ie/input-selection.js'].branchData['118'][1].init(326, 22, 'testRange.text === ret');
function visit50_118_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['111'][1].init(124, 57, 'testRange.compareEndPoints(\'StartToEnd\', testRange) === 0');
function visit49_111_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['106'][1].init(13, 24, 'elem.type === \'textarea\'');
function visit48_106_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['95'][1].init(101, 5, 's > e');
function visit47_95_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['93'][1].init(144, 24, 'elem.type === \'textarea\'');
function visit46_93_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['90'][1].init(83, 13, 'start === end');
function visit45_90_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['77'][1].init(67, 24, 'elem.type === \'textarea\'');
function visit44_77_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['64'][1].init(142, 10, 'includeEnd');
function visit43_64_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['61'][1].init(157, 34, 'inputRange.inRange(selectionRange)');
function visit42_61_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['44'][1].init(240, 11, 'start > end');
function visit41_44_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['39'][1].init(125, 34, 'inputRange.inRange(selectionRange)');
function visit40_39_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['24'][1].init(245, 11, 'start > end');
function visit39_24_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].branchData['19'][1].init(125, 34, 'inputRange.inRange(selectionRange)');
function visit38_19_1(result) {
  _$jscoverage['/ie/input-selection.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/input-selection.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/input-selection.js'].functionData[0]++;
  _$jscoverage['/ie/input-selection.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/input-selection.js'].lineData[8]++;
  var propHooks = Dom._propHooks;
  _$jscoverage['/ie/input-selection.js'].lineData[15]++;
  propHooks.selectionStart = {
  set: function(elem, start) {
  _$jscoverage['/ie/input-selection.js'].functionData[1]++;
  _$jscoverage['/ie/input-selection.js'].lineData[17]++;
  var selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
  _$jscoverage['/ie/input-selection.js'].lineData[19]++;
  if (visit38_19_1(inputRange.inRange(selectionRange))) {
    _$jscoverage['/ie/input-selection.js'].lineData[20]++;
    var end = getStartEnd(elem, 1)[1], diff = getMovedDistance(elem, start, end);
    _$jscoverage['/ie/input-selection.js'].lineData[22]++;
    selectionRange.collapse(false);
    _$jscoverage['/ie/input-selection.js'].lineData[23]++;
    selectionRange.moveStart('character', -diff);
    _$jscoverage['/ie/input-selection.js'].lineData[24]++;
    if (visit39_24_1(start > end)) {
      _$jscoverage['/ie/input-selection.js'].lineData[25]++;
      selectionRange.collapse(true);
    }
    _$jscoverage['/ie/input-selection.js'].lineData[27]++;
    selectionRange.select();
  }
}, 
  get: function(elem) {
  _$jscoverage['/ie/input-selection.js'].functionData[2]++;
  _$jscoverage['/ie/input-selection.js'].lineData[31]++;
  return getStartEnd(elem)[0];
}};
  _$jscoverage['/ie/input-selection.js'].lineData[35]++;
  propHooks.selectionEnd = {
  set: function(elem, end) {
  _$jscoverage['/ie/input-selection.js'].functionData[3]++;
  _$jscoverage['/ie/input-selection.js'].lineData[37]++;
  var selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
  _$jscoverage['/ie/input-selection.js'].lineData[39]++;
  if (visit40_39_1(inputRange.inRange(selectionRange))) {
    _$jscoverage['/ie/input-selection.js'].lineData[40]++;
    var start = getStartEnd(elem)[0], diff = getMovedDistance(elem, start, end);
    _$jscoverage['/ie/input-selection.js'].lineData[42]++;
    selectionRange.collapse(true);
    _$jscoverage['/ie/input-selection.js'].lineData[43]++;
    selectionRange.moveEnd('character', diff);
    _$jscoverage['/ie/input-selection.js'].lineData[44]++;
    if (visit41_44_1(start > end)) {
      _$jscoverage['/ie/input-selection.js'].lineData[45]++;
      selectionRange.collapse(false);
    }
    _$jscoverage['/ie/input-selection.js'].lineData[47]++;
    selectionRange.select();
  }
}, 
  get: function(elem) {
  _$jscoverage['/ie/input-selection.js'].functionData[4]++;
  _$jscoverage['/ie/input-selection.js'].lineData[52]++;
  return getStartEnd(elem, 1)[1];
}};
  _$jscoverage['/ie/input-selection.js'].lineData[56]++;
  function getStartEnd(elem, includeEnd) {
    _$jscoverage['/ie/input-selection.js'].functionData[5]++;
    _$jscoverage['/ie/input-selection.js'].lineData[57]++;
    var start = 0, end = 0, selectionRange = getSelectionRange(elem), inputRange = getInputRange(elem);
    _$jscoverage['/ie/input-selection.js'].lineData[61]++;
    if (visit42_61_1(inputRange.inRange(selectionRange))) {
      _$jscoverage['/ie/input-selection.js'].lineData[62]++;
      inputRange.setEndPoint('EndToStart', selectionRange);
      _$jscoverage['/ie/input-selection.js'].lineData[63]++;
      start = getRangeText(elem, inputRange).length;
      _$jscoverage['/ie/input-selection.js'].lineData[64]++;
      if (visit43_64_1(includeEnd)) {
        _$jscoverage['/ie/input-selection.js'].lineData[65]++;
        end = start + getRangeText(elem, selectionRange).length;
      }
    }
    _$jscoverage['/ie/input-selection.js'].lineData[68]++;
    return [start, end];
  }
  _$jscoverage['/ie/input-selection.js'].lineData[71]++;
  function getSelectionRange(elem) {
    _$jscoverage['/ie/input-selection.js'].functionData[6]++;
    _$jscoverage['/ie/input-selection.js'].lineData[72]++;
    return elem.ownerDocument.selection.createRange();
  }
  _$jscoverage['/ie/input-selection.js'].lineData[75]++;
  function getInputRange(elem) {
    _$jscoverage['/ie/input-selection.js'].functionData[7]++;
    _$jscoverage['/ie/input-selection.js'].lineData[77]++;
    if (visit44_77_1(elem.type === 'textarea')) {
      _$jscoverage['/ie/input-selection.js'].lineData[78]++;
      var range = elem.document.body.createTextRange();
      _$jscoverage['/ie/input-selection.js'].lineData[79]++;
      range.moveToElementText(elem);
      _$jscoverage['/ie/input-selection.js'].lineData[80]++;
      return range;
    } else {
      _$jscoverage['/ie/input-selection.js'].lineData[82]++;
      return elem.createTextRange();
    }
  }
  _$jscoverage['/ie/input-selection.js'].lineData[87]++;
  function getMovedDistance(elem, s, e) {
    _$jscoverage['/ie/input-selection.js'].functionData[8]++;
    _$jscoverage['/ie/input-selection.js'].lineData[88]++;
    var start = Math.min(s, e);
    _$jscoverage['/ie/input-selection.js'].lineData[89]++;
    var end = Math.max(s, e);
    _$jscoverage['/ie/input-selection.js'].lineData[90]++;
    if (visit45_90_1(start === end)) {
      _$jscoverage['/ie/input-selection.js'].lineData[91]++;
      return 0;
    }
    _$jscoverage['/ie/input-selection.js'].lineData[93]++;
    if (visit46_93_1(elem.type === 'textarea')) {
      _$jscoverage['/ie/input-selection.js'].lineData[94]++;
      var l = elem.value.substring(start, end).replace(/\r\n/g, '\n').length;
      _$jscoverage['/ie/input-selection.js'].lineData[95]++;
      if (visit47_95_1(s > e)) {
        _$jscoverage['/ie/input-selection.js'].lineData[96]++;
        l = -l;
      }
      _$jscoverage['/ie/input-selection.js'].lineData[98]++;
      return l;
    } else {
      _$jscoverage['/ie/input-selection.js'].lineData[100]++;
      return e - s;
    }
  }
  _$jscoverage['/ie/input-selection.js'].lineData[105]++;
  function getRangeText(elem, range) {
    _$jscoverage['/ie/input-selection.js'].functionData[9]++;
    _$jscoverage['/ie/input-selection.js'].lineData[106]++;
    if (visit48_106_1(elem.type === 'textarea')) {
      _$jscoverage['/ie/input-selection.js'].lineData[107]++;
      var ret = range.text, testRange = range.duplicate();
      _$jscoverage['/ie/input-selection.js'].lineData[111]++;
      if (visit49_111_1(testRange.compareEndPoints('StartToEnd', testRange) === 0)) {
        _$jscoverage['/ie/input-selection.js'].lineData[112]++;
        return ret;
      }
      _$jscoverage['/ie/input-selection.js'].lineData[115]++;
      testRange.moveEnd('character', -1);
      _$jscoverage['/ie/input-selection.js'].lineData[118]++;
      if (visit50_118_1(testRange.text === ret)) {
        _$jscoverage['/ie/input-selection.js'].lineData[119]++;
        ret += '\r\n';
      }
      _$jscoverage['/ie/input-selection.js'].lineData[122]++;
      return ret;
    } else {
      _$jscoverage['/ie/input-selection.js'].lineData[124]++;
      return range.text;
    }
  }
});
