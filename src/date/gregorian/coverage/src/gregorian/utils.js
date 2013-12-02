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
if (! _$jscoverage['/gregorian/utils.js']) {
  _$jscoverage['/gregorian/utils.js'] = {};
  _$jscoverage['/gregorian/utils.js'].lineData = [];
  _$jscoverage['/gregorian/utils.js'].lineData[6] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[7] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[8] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[25] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[26] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[31] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[33] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[34] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[36] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[39] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[40] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[41] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[42] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[43] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[44] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[46] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[47] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[48] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[49] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[50] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[51] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[52] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[54] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[57] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[58] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[61] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[64] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[66] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[67] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[69] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[74] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[79] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[81] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[87] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[88] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[89] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[90] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[91] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[92] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[94] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[95] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[96] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[98] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[102] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[103] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[105] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[115] = 0;
  _$jscoverage['/gregorian/utils.js'].lineData[119] = 0;
}
if (! _$jscoverage['/gregorian/utils.js'].functionData) {
  _$jscoverage['/gregorian/utils.js'].functionData = [];
  _$jscoverage['/gregorian/utils.js'].functionData[0] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[1] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[2] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[3] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[4] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[5] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[6] = 0;
  _$jscoverage['/gregorian/utils.js'].functionData[7] = 0;
}
if (! _$jscoverage['/gregorian/utils.js'].branchData) {
  _$jscoverage['/gregorian/utils.js'].branchData = {};
  _$jscoverage['/gregorian/utils.js'].branchData['33'] = [];
  _$jscoverage['/gregorian/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['57'] = [];
  _$jscoverage['/gregorian/utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['57'][3] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['57'][4] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['66'] = [];
  _$jscoverage['/gregorian/utils.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['69'] = [];
  _$jscoverage['/gregorian/utils.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['69'][3] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['94'] = [];
  _$jscoverage['/gregorian/utils.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/gregorian/utils.js'].branchData['95'] = [];
  _$jscoverage['/gregorian/utils.js'].branchData['95'][1] = new BranchData();
}
_$jscoverage['/gregorian/utils.js'].branchData['95'][1].init(21, 31, 'ACCUMULATED_DAYS[i] <= daysDiff');
function visit11_95_1(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['94'][1].init(376, 27, 'i < ACCUMULATED_DAYS.length');
function visit10_94_1(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['69'][3].init(123, 16, 'year % 400 === 0');
function visit9_69_3(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['69'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['69'][2].init(101, 16, 'year % 100 !== 0');
function visit8_69_2(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['69'][1].init(101, 39, '(year % 100 !== 0) || (year % 400 === 0)');
function visit7_69_1(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['66'][1].init(18, 15, '(year & 3) !== 0');
function visit6_66_1(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['57'][4].init(530, 8, 'n1 === 4');
function visit5_57_4(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['57'][4].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['57'][3].init(516, 10, 'n100 === 4');
function visit4_57_3(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['57'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['57'][2].init(516, 22, 'n100 === 4 || n1 === 4');
function visit3_57_2(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['57'][1].init(514, 25, '!(n100 === 4 || n1 === 4)');
function visit2_57_1(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].branchData['33'][1].init(76, 14, 'fixedDate >= 0');
function visit1_33_1(result) {
  _$jscoverage['/gregorian/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/gregorian/utils.js'].functionData[0]++;
  _$jscoverage['/gregorian/utils.js'].lineData[7]++;
  var Const = require('./const');
  _$jscoverage['/gregorian/utils.js'].lineData[8]++;
  var ACCUMULATED_DAYS_IN_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], ACCUMULATED_DAYS_IN_MONTH_LEAP = [0, 31, 59 + 1, 90 + 1, 120 + 1, 151 + 1, 181 + 1, 212 + 1, 243 + 1, 273 + 1, 304 + 1, 334 + 1], DAYS_OF_YEAR = 365, DAYS_OF_4YEAR = 365 * 4 + 1, DAYS_OF_100YEAR = DAYS_OF_4YEAR * 25 - 1, DAYS_OF_400YEAR = DAYS_OF_100YEAR * 4 + 1, Utils = {};
  _$jscoverage['/gregorian/utils.js'].lineData[25]++;
  function getDayOfYear(year, month, dayOfMonth) {
    _$jscoverage['/gregorian/utils.js'].functionData[1]++;
    _$jscoverage['/gregorian/utils.js'].lineData[26]++;
    return dayOfMonth + (isLeapYear(year) ? ACCUMULATED_DAYS_IN_MONTH_LEAP[month] : ACCUMULATED_DAYS_IN_MONTH[month]);
  }
  _$jscoverage['/gregorian/utils.js'].lineData[31]++;
  function getDayOfWeekFromFixedDate(fixedDate) {
    _$jscoverage['/gregorian/utils.js'].functionData[2]++;
    _$jscoverage['/gregorian/utils.js'].lineData[33]++;
    if (visit1_33_1(fixedDate >= 0)) {
      _$jscoverage['/gregorian/utils.js'].lineData[34]++;
      return fixedDate % 7;
    }
    _$jscoverage['/gregorian/utils.js'].lineData[36]++;
    return mod(fixedDate, 7);
  }
  _$jscoverage['/gregorian/utils.js'].lineData[39]++;
  function getGregorianYearFromFixedDate(fixedDate) {
    _$jscoverage['/gregorian/utils.js'].functionData[3]++;
    _$jscoverage['/gregorian/utils.js'].lineData[40]++;
    var d0;
    _$jscoverage['/gregorian/utils.js'].lineData[41]++;
    var d1, d2, d3;
    _$jscoverage['/gregorian/utils.js'].lineData[42]++;
    var n400, n100, n4, n1;
    _$jscoverage['/gregorian/utils.js'].lineData[43]++;
    var year;
    _$jscoverage['/gregorian/utils.js'].lineData[44]++;
    d0 = fixedDate - 1;
    _$jscoverage['/gregorian/utils.js'].lineData[46]++;
    n400 = floorDivide(d0 / DAYS_OF_400YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[47]++;
    d1 = mod(d0, DAYS_OF_400YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[48]++;
    n100 = floorDivide(d1 / DAYS_OF_100YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[49]++;
    d2 = mod(d1, DAYS_OF_100YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[50]++;
    n4 = floorDivide(d2 / DAYS_OF_4YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[51]++;
    d3 = mod(d2, DAYS_OF_4YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[52]++;
    n1 = floorDivide(d3 / DAYS_OF_YEAR);
    _$jscoverage['/gregorian/utils.js'].lineData[54]++;
    year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
    _$jscoverage['/gregorian/utils.js'].lineData[57]++;
    if (visit2_57_1(!(visit3_57_2(visit4_57_3(n100 === 4) || visit5_57_4(n1 === 4))))) {
      _$jscoverage['/gregorian/utils.js'].lineData[58]++;
      ++year;
    }
    _$jscoverage['/gregorian/utils.js'].lineData[61]++;
    return year;
  }
  _$jscoverage['/gregorian/utils.js'].lineData[64]++;
  S.mix(Utils, {
  'isLeapYear': function(year) {
  _$jscoverage['/gregorian/utils.js'].functionData[4]++;
  _$jscoverage['/gregorian/utils.js'].lineData[66]++;
  if (visit6_66_1((year & 3) !== 0)) {
    _$jscoverage['/gregorian/utils.js'].lineData[67]++;
    return false;
  }
  _$jscoverage['/gregorian/utils.js'].lineData[69]++;
  return visit7_69_1((visit8_69_2(year % 100 !== 0)) || (visit9_69_3(year % 400 === 0)));
}, 
  mod: function(x, y) {
  _$jscoverage['/gregorian/utils.js'].functionData[5]++;
  _$jscoverage['/gregorian/utils.js'].lineData[74]++;
  return (x - y * floorDivide(x / y));
}, 
  getFixedDate: function(year, month, dayOfMonth) {
  _$jscoverage['/gregorian/utils.js'].functionData[6]++;
  _$jscoverage['/gregorian/utils.js'].lineData[79]++;
  var prevYear = year - 1;
  _$jscoverage['/gregorian/utils.js'].lineData[81]++;
  return DAYS_OF_YEAR * prevYear + floorDivide(prevYear / 4) - floorDivide(prevYear / 100) + floorDivide(prevYear / 400) + getDayOfYear(year, month, dayOfMonth);
}, 
  getGregorianDateFromFixedDate: function(fixedDate) {
  _$jscoverage['/gregorian/utils.js'].functionData[7]++;
  _$jscoverage['/gregorian/utils.js'].lineData[87]++;
  var year = getGregorianYearFromFixedDate(fixedDate);
  _$jscoverage['/gregorian/utils.js'].lineData[88]++;
  var jan1 = Utils.getFixedDate(year, Const.JANUARY, 1);
  _$jscoverage['/gregorian/utils.js'].lineData[89]++;
  var isLeap = isLeapYear(year);
  _$jscoverage['/gregorian/utils.js'].lineData[90]++;
  var ACCUMULATED_DAYS = isLeap ? ACCUMULATED_DAYS_IN_MONTH_LEAP : ACCUMULATED_DAYS_IN_MONTH;
  _$jscoverage['/gregorian/utils.js'].lineData[91]++;
  var daysDiff = fixedDate - jan1;
  _$jscoverage['/gregorian/utils.js'].lineData[92]++;
  var month, i;
  _$jscoverage['/gregorian/utils.js'].lineData[94]++;
  for (i = 0; visit10_94_1(i < ACCUMULATED_DAYS.length); i++) {
    _$jscoverage['/gregorian/utils.js'].lineData[95]++;
    if (visit11_95_1(ACCUMULATED_DAYS[i] <= daysDiff)) {
      _$jscoverage['/gregorian/utils.js'].lineData[96]++;
      month = i;
    } else {
      _$jscoverage['/gregorian/utils.js'].lineData[98]++;
      break;
    }
  }
  _$jscoverage['/gregorian/utils.js'].lineData[102]++;
  var dayOfMonth = fixedDate - jan1 - ACCUMULATED_DAYS[month] + 1;
  _$jscoverage['/gregorian/utils.js'].lineData[103]++;
  var dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);
  _$jscoverage['/gregorian/utils.js'].lineData[105]++;
  return {
  year: year, 
  month: month, 
  dayOfMonth: dayOfMonth, 
  dayOfWeek: dayOfWeek, 
  isLeap: isLeap};
}});
  _$jscoverage['/gregorian/utils.js'].lineData[115]++;
  var floorDivide = Math.floor, isLeapYear = Utils.isLeapYear, mod = Utils.mod;
  _$jscoverage['/gregorian/utils.js'].lineData[119]++;
  return Utils;
});
