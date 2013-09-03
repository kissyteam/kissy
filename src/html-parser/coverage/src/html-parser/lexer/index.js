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
if (! _$jscoverage['/html-parser/lexer/index.js']) {
  _$jscoverage['/html-parser/lexer/index.js'] = {};
  _$jscoverage['/html-parser/lexer/index.js'].lineData = [];
  _$jscoverage['/html-parser/lexer/index.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[73] = 0;
}
if (! _$jscoverage['/html-parser/lexer/index.js'].functionData) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData = [];
  _$jscoverage['/html-parser/lexer/index.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].functionData[7] = 0;
}
if (! _$jscoverage['/html-parser/lexer/index.js'].branchData) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData = {};
  _$jscoverage['/html-parser/lexer/index.js'].branchData['16'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['37'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['38'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['56'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['57'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['65'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['66'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['66'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/index.js'].branchData['66'][1].init(18, 27, 'cs[i].position > c.position');
function visit13_66_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['65'][1].init(26, 13, 'i < cs.length');
function visit12_65_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['57'][1].init(18, 29, 'cs[i].position === c.position');
function visit11_57_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['56'][1].init(26, 13, 'i < cs.length');
function visit10_56_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['48'][1].init(82, 51, 'lineCursor = this.lineCursors[this.row(cursor) - 1]');
function visit9_48_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['38'][1].init(22, 32, 'cs[i].position > cursor.position');
function visit8_38_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['37'][1].init(70, 13, 'i < cs.length');
function visit7_37_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['26'][1].init(124, 11, 'index != -1');
function visit6_26_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['16'][1].init(18, 45, 'indexOfCursor(this.lineCursors, cursor) != -1');
function visit5_16_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].lineData[5]++;
KISSY.add("html-parser/lexer/index", function() {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[7]++;
  function Index() {
    _$jscoverage['/html-parser/lexer/index.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[8]++;
    this.lineCursors = [];
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[11]++;
  Index.prototype = {
  constructor: Index, 
  add: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[16]++;
  if (visit5_16_1(indexOfCursor(this.lineCursors, cursor) != -1)) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[17]++;
    return;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[19]++;
  var index = indexOfCursorForInsert(this.lineCursors, cursor);
  _$jscoverage['/html-parser/lexer/index.js'].lineData[20]++;
  this.lineCursors.splice(index, 0, cursor);
}, 
  remove: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[24]++;
  var cs = this.lineCursors;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[25]++;
  var index = indexOfCursor(this.lineCursors, cursor);
  _$jscoverage['/html-parser/lexer/index.js'].lineData[26]++;
  if (visit6_26_1(index != -1)) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[27]++;
    cs.splice(index, 1);
  }
}, 
  row: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[36]++;
  var cs = this.lineCursors;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[37]++;
  for (var i = 0; visit7_37_1(i < cs.length); i++) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[38]++;
    if (visit8_38_1(cs[i].position > cursor.position)) {
      _$jscoverage['/html-parser/lexer/index.js'].lineData[39]++;
      return i - 1;
    }
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[42]++;
  return i;
}, 
  col: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[46]++;
  var linePosition = 0, lineCursor;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[48]++;
  if (visit9_48_1(lineCursor = this.lineCursors[this.row(cursor) - 1])) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[49]++;
    linePosition = lineCursor.position;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[51]++;
  return cursor.position - linePosition;
}};
  _$jscoverage['/html-parser/lexer/index.js'].lineData[55]++;
  function indexOfCursor(cs, c) {
    _$jscoverage['/html-parser/lexer/index.js'].functionData[6]++;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[56]++;
    for (var i = 0; visit10_56_1(i < cs.length); i++) {
      _$jscoverage['/html-parser/lexer/index.js'].lineData[57]++;
      if (visit11_57_1(cs[i].position === c.position)) {
        _$jscoverage['/html-parser/lexer/index.js'].lineData[58]++;
        return i;
      }
    }
    _$jscoverage['/html-parser/lexer/index.js'].lineData[61]++;
    return -1;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[64]++;
  function indexOfCursorForInsert(cs, c) {
    _$jscoverage['/html-parser/lexer/index.js'].functionData[7]++;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[65]++;
    for (var i = 0; visit12_65_1(i < cs.length); i++) {
      _$jscoverage['/html-parser/lexer/index.js'].lineData[66]++;
      if (visit13_66_1(cs[i].position > c.position)) {
        _$jscoverage['/html-parser/lexer/index.js'].lineData[67]++;
        return i;
      }
    }
    _$jscoverage['/html-parser/lexer/index.js'].lineData[70]++;
    return i;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[73]++;
  return Index;
});
