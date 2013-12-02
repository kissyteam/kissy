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
  _$jscoverage['/html-parser/lexer/index.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[86] = 0;
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
  _$jscoverage['/html-parser/lexer/index.js'].branchData['21'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['29'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['40'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['41'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['60'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['65'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['74'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['76'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/index.js'].branchData['79'] = [];
  _$jscoverage['/html-parser/lexer/index.js'].branchData['79'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/index.js'].branchData['79'][1].init(151, 21, 'iPosition > cPosition');
function visit15_79_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['76'][1].init(61, 23, 'iPosition === cPosition');
function visit14_76_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['74'][1].init(61, 13, 'i < cs.length');
function visit13_74_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['65'][1].init(150, 21, 'iPosition < cPosition');
function visit12_65_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['62'][1].init(61, 23, 'iPosition === cPosition');
function visit11_62_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['60'][1].init(61, 13, 'i < cs.length');
function visit10_60_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['51'][1].init(120, 10, 'lineCursor');
function visit9_51_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['41'][1].init(21, 32, 'cs[i].position > cursor.position');
function visit8_41_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['40'][1].init(68, 13, 'i < cs.length');
function visit7_40_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['29'][1].init(121, 12, 'index !== -1');
function visit6_29_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].branchData['21'][1].init(91, 12, 'index !== -1');
function visit5_21_1(result) {
  _$jscoverage['/html-parser/lexer/index.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/index.js'].lineData[6]++;
KISSY.add(function() {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[12]++;
  function Index() {
    _$jscoverage['/html-parser/lexer/index.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[13]++;
    this.lineCursors = [];
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[16]++;
  Index.prototype = {
  constructor: Index, 
  add: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[20]++;
  var index = indexOfCursorForInsert(this.lineCursors, cursor);
  _$jscoverage['/html-parser/lexer/index.js'].lineData[21]++;
  if (visit5_21_1(index !== -1)) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[22]++;
    this.lineCursors.splice(index, 0, cursor.clone());
  }
}, 
  remove: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[27]++;
  var cs = this.lineCursors;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[28]++;
  var index = indexOfCursor(this.lineCursors, cursor);
  _$jscoverage['/html-parser/lexer/index.js'].lineData[29]++;
  if (visit6_29_1(index !== -1)) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[30]++;
    cs.splice(index, 1);
  }
}, 
  row: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[39]++;
  var cs = this.lineCursors;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[40]++;
  for (var i = 0; visit7_40_1(i < cs.length); i++) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[41]++;
    if (visit8_41_1(cs[i].position > cursor.position)) {
      _$jscoverage['/html-parser/lexer/index.js'].lineData[42]++;
      return i - 1;
    }
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[45]++;
  return i;
}, 
  col: function(cursor) {
  _$jscoverage['/html-parser/lexer/index.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/index.js'].lineData[49]++;
  var linePosition = 0, lineCursor = this.lineCursors[this.row(cursor) - 1];
  _$jscoverage['/html-parser/lexer/index.js'].lineData[51]++;
  if (visit9_51_1(lineCursor)) {
    _$jscoverage['/html-parser/lexer/index.js'].lineData[52]++;
    linePosition = lineCursor.position;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[54]++;
  return cursor.position - linePosition;
}};
  _$jscoverage['/html-parser/lexer/index.js'].lineData[58]++;
  function indexOfCursor(cs, c) {
    _$jscoverage['/html-parser/lexer/index.js'].functionData[6]++;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[59]++;
    var cPosition = c.position;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[60]++;
    for (var i = 0; visit10_60_1(i < cs.length); i++) {
      _$jscoverage['/html-parser/lexer/index.js'].lineData[61]++;
      var iPosition = cs[i].position;
      _$jscoverage['/html-parser/lexer/index.js'].lineData[62]++;
      if (visit11_62_1(iPosition === cPosition)) {
        _$jscoverage['/html-parser/lexer/index.js'].lineData[63]++;
        return i;
      } else {
        _$jscoverage['/html-parser/lexer/index.js'].lineData[65]++;
        if (visit12_65_1(iPosition < cPosition)) {
          _$jscoverage['/html-parser/lexer/index.js'].lineData[66]++;
          return -1;
        }
      }
    }
    _$jscoverage['/html-parser/lexer/index.js'].lineData[69]++;
    return -1;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[72]++;
  function indexOfCursorForInsert(cs, c) {
    _$jscoverage['/html-parser/lexer/index.js'].functionData[7]++;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[73]++;
    var cPosition = c.position;
    _$jscoverage['/html-parser/lexer/index.js'].lineData[74]++;
    for (var i = 0; visit13_74_1(i < cs.length); i++) {
      _$jscoverage['/html-parser/lexer/index.js'].lineData[75]++;
      var iPosition = cs[i].position;
      _$jscoverage['/html-parser/lexer/index.js'].lineData[76]++;
      if (visit14_76_1(iPosition === cPosition)) {
        _$jscoverage['/html-parser/lexer/index.js'].lineData[77]++;
        return -1;
      } else {
        _$jscoverage['/html-parser/lexer/index.js'].lineData[79]++;
        if (visit15_79_1(iPosition > cPosition)) {
          _$jscoverage['/html-parser/lexer/index.js'].lineData[80]++;
          return i;
        }
      }
    }
    _$jscoverage['/html-parser/lexer/index.js'].lineData[83]++;
    return i;
  }
  _$jscoverage['/html-parser/lexer/index.js'].lineData[86]++;
  return Index;
});
