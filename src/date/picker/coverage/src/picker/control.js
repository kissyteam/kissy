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
if (! _$jscoverage['/picker/control.js']) {
  _$jscoverage['/picker/control.js'] = {};
  _$jscoverage['/picker/control.js'].lineData = [];
  _$jscoverage['/picker/control.js'].lineData[6] = 0;
  _$jscoverage['/picker/control.js'].lineData[7] = 0;
  _$jscoverage['/picker/control.js'].lineData[13] = 0;
  _$jscoverage['/picker/control.js'].lineData[14] = 0;
  _$jscoverage['/picker/control.js'].lineData[15] = 0;
  _$jscoverage['/picker/control.js'].lineData[17] = 0;
  _$jscoverage['/picker/control.js'].lineData[18] = 0;
  _$jscoverage['/picker/control.js'].lineData[19] = 0;
  _$jscoverage['/picker/control.js'].lineData[20] = 0;
  _$jscoverage['/picker/control.js'].lineData[23] = 0;
  _$jscoverage['/picker/control.js'].lineData[24] = 0;
  _$jscoverage['/picker/control.js'].lineData[25] = 0;
  _$jscoverage['/picker/control.js'].lineData[26] = 0;
  _$jscoverage['/picker/control.js'].lineData[29] = 0;
  _$jscoverage['/picker/control.js'].lineData[30] = 0;
  _$jscoverage['/picker/control.js'].lineData[31] = 0;
  _$jscoverage['/picker/control.js'].lineData[32] = 0;
  _$jscoverage['/picker/control.js'].lineData[35] = 0;
  _$jscoverage['/picker/control.js'].lineData[36] = 0;
  _$jscoverage['/picker/control.js'].lineData[37] = 0;
  _$jscoverage['/picker/control.js'].lineData[38] = 0;
  _$jscoverage['/picker/control.js'].lineData[41] = 0;
  _$jscoverage['/picker/control.js'].lineData[42] = 0;
  _$jscoverage['/picker/control.js'].lineData[43] = 0;
  _$jscoverage['/picker/control.js'].lineData[44] = 0;
  _$jscoverage['/picker/control.js'].lineData[47] = 0;
  _$jscoverage['/picker/control.js'].lineData[48] = 0;
  _$jscoverage['/picker/control.js'].lineData[49] = 0;
  _$jscoverage['/picker/control.js'].lineData[50] = 0;
  _$jscoverage['/picker/control.js'].lineData[53] = 0;
  _$jscoverage['/picker/control.js'].lineData[54] = 0;
  _$jscoverage['/picker/control.js'].lineData[55] = 0;
  _$jscoverage['/picker/control.js'].lineData[58] = 0;
  _$jscoverage['/picker/control.js'].lineData[59] = 0;
  _$jscoverage['/picker/control.js'].lineData[60] = 0;
  _$jscoverage['/picker/control.js'].lineData[63] = 0;
  _$jscoverage['/picker/control.js'].lineData[64] = 0;
  _$jscoverage['/picker/control.js'].lineData[65] = 0;
  _$jscoverage['/picker/control.js'].lineData[68] = 0;
  _$jscoverage['/picker/control.js'].lineData[69] = 0;
  _$jscoverage['/picker/control.js'].lineData[70] = 0;
  _$jscoverage['/picker/control.js'].lineData[73] = 0;
  _$jscoverage['/picker/control.js'].lineData[74] = 0;
  _$jscoverage['/picker/control.js'].lineData[75] = 0;
  _$jscoverage['/picker/control.js'].lineData[76] = 0;
  _$jscoverage['/picker/control.js'].lineData[77] = 0;
  _$jscoverage['/picker/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/control.js'].lineData[79] = 0;
  _$jscoverage['/picker/control.js'].lineData[80] = 0;
  _$jscoverage['/picker/control.js'].lineData[81] = 0;
  _$jscoverage['/picker/control.js'].lineData[84] = 0;
  _$jscoverage['/picker/control.js'].lineData[85] = 0;
  _$jscoverage['/picker/control.js'].lineData[86] = 0;
  _$jscoverage['/picker/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/control.js'].lineData[93] = 0;
  _$jscoverage['/picker/control.js'].lineData[94] = 0;
  _$jscoverage['/picker/control.js'].lineData[95] = 0;
  _$jscoverage['/picker/control.js'].lineData[96] = 0;
  _$jscoverage['/picker/control.js'].lineData[99] = 0;
  _$jscoverage['/picker/control.js'].lineData[100] = 0;
  _$jscoverage['/picker/control.js'].lineData[101] = 0;
  _$jscoverage['/picker/control.js'].lineData[105] = 0;
  _$jscoverage['/picker/control.js'].lineData[106] = 0;
  _$jscoverage['/picker/control.js'].lineData[109] = 0;
  _$jscoverage['/picker/control.js'].lineData[110] = 0;
  _$jscoverage['/picker/control.js'].lineData[111] = 0;
  _$jscoverage['/picker/control.js'].lineData[114] = 0;
  _$jscoverage['/picker/control.js'].lineData[115] = 0;
  _$jscoverage['/picker/control.js'].lineData[116] = 0;
  _$jscoverage['/picker/control.js'].lineData[117] = 0;
  _$jscoverage['/picker/control.js'].lineData[118] = 0;
  _$jscoverage['/picker/control.js'].lineData[119] = 0;
  _$jscoverage['/picker/control.js'].lineData[122] = 0;
  _$jscoverage['/picker/control.js'].lineData[123] = 0;
  _$jscoverage['/picker/control.js'].lineData[125] = 0;
  _$jscoverage['/picker/control.js'].lineData[126] = 0;
  _$jscoverage['/picker/control.js'].lineData[127] = 0;
  _$jscoverage['/picker/control.js'].lineData[128] = 0;
  _$jscoverage['/picker/control.js'].lineData[130] = 0;
  _$jscoverage['/picker/control.js'].lineData[134] = 0;
  _$jscoverage['/picker/control.js'].lineData[135] = 0;
  _$jscoverage['/picker/control.js'].lineData[136] = 0;
  _$jscoverage['/picker/control.js'].lineData[137] = 0;
  _$jscoverage['/picker/control.js'].lineData[139] = 0;
  _$jscoverage['/picker/control.js'].lineData[149] = 0;
  _$jscoverage['/picker/control.js'].lineData[151] = 0;
  _$jscoverage['/picker/control.js'].lineData[152] = 0;
  _$jscoverage['/picker/control.js'].lineData[153] = 0;
  _$jscoverage['/picker/control.js'].lineData[154] = 0;
  _$jscoverage['/picker/control.js'].lineData[155] = 0;
  _$jscoverage['/picker/control.js'].lineData[156] = 0;
  _$jscoverage['/picker/control.js'].lineData[162] = 0;
  _$jscoverage['/picker/control.js'].lineData[163] = 0;
  _$jscoverage['/picker/control.js'].lineData[164] = 0;
  _$jscoverage['/picker/control.js'].lineData[167] = 0;
  _$jscoverage['/picker/control.js'].lineData[168] = 0;
  _$jscoverage['/picker/control.js'].lineData[169] = 0;
  _$jscoverage['/picker/control.js'].lineData[170] = 0;
  _$jscoverage['/picker/control.js'].lineData[172] = 0;
  _$jscoverage['/picker/control.js'].lineData[173] = 0;
  _$jscoverage['/picker/control.js'].lineData[175] = 0;
  _$jscoverage['/picker/control.js'].lineData[176] = 0;
  _$jscoverage['/picker/control.js'].lineData[181] = 0;
  _$jscoverage['/picker/control.js'].lineData[182] = 0;
  _$jscoverage['/picker/control.js'].lineData[184] = 0;
  _$jscoverage['/picker/control.js'].lineData[186] = 0;
  _$jscoverage['/picker/control.js'].lineData[187] = 0;
  _$jscoverage['/picker/control.js'].lineData[188] = 0;
  _$jscoverage['/picker/control.js'].lineData[190] = 0;
  _$jscoverage['/picker/control.js'].lineData[191] = 0;
  _$jscoverage['/picker/control.js'].lineData[192] = 0;
  _$jscoverage['/picker/control.js'].lineData[194] = 0;
  _$jscoverage['/picker/control.js'].lineData[197] = 0;
  _$jscoverage['/picker/control.js'].lineData[200] = 0;
  _$jscoverage['/picker/control.js'].lineData[202] = 0;
  _$jscoverage['/picker/control.js'].lineData[203] = 0;
  _$jscoverage['/picker/control.js'].lineData[205] = 0;
  _$jscoverage['/picker/control.js'].lineData[206] = 0;
  _$jscoverage['/picker/control.js'].lineData[208] = 0;
  _$jscoverage['/picker/control.js'].lineData[209] = 0;
  _$jscoverage['/picker/control.js'].lineData[211] = 0;
  _$jscoverage['/picker/control.js'].lineData[213] = 0;
  _$jscoverage['/picker/control.js'].lineData[215] = 0;
  _$jscoverage['/picker/control.js'].lineData[216] = 0;
  _$jscoverage['/picker/control.js'].lineData[218] = 0;
  _$jscoverage['/picker/control.js'].lineData[220] = 0;
  _$jscoverage['/picker/control.js'].lineData[222] = 0;
  _$jscoverage['/picker/control.js'].lineData[223] = 0;
  _$jscoverage['/picker/control.js'].lineData[225] = 0;
  _$jscoverage['/picker/control.js'].lineData[226] = 0;
  _$jscoverage['/picker/control.js'].lineData[228] = 0;
  _$jscoverage['/picker/control.js'].lineData[229] = 0;
  _$jscoverage['/picker/control.js'].lineData[231] = 0;
  _$jscoverage['/picker/control.js'].lineData[232] = 0;
  _$jscoverage['/picker/control.js'].lineData[234] = 0;
  _$jscoverage['/picker/control.js'].lineData[237] = 0;
  _$jscoverage['/picker/control.js'].lineData[239] = 0;
  _$jscoverage['/picker/control.js'].lineData[257] = 0;
  _$jscoverage['/picker/control.js'].lineData[258] = 0;
  _$jscoverage['/picker/control.js'].lineData[259] = 0;
}
if (! _$jscoverage['/picker/control.js'].functionData) {
  _$jscoverage['/picker/control.js'].functionData = [];
  _$jscoverage['/picker/control.js'].functionData[0] = 0;
  _$jscoverage['/picker/control.js'].functionData[1] = 0;
  _$jscoverage['/picker/control.js'].functionData[2] = 0;
  _$jscoverage['/picker/control.js'].functionData[3] = 0;
  _$jscoverage['/picker/control.js'].functionData[4] = 0;
  _$jscoverage['/picker/control.js'].functionData[5] = 0;
  _$jscoverage['/picker/control.js'].functionData[6] = 0;
  _$jscoverage['/picker/control.js'].functionData[7] = 0;
  _$jscoverage['/picker/control.js'].functionData[8] = 0;
  _$jscoverage['/picker/control.js'].functionData[9] = 0;
  _$jscoverage['/picker/control.js'].functionData[10] = 0;
  _$jscoverage['/picker/control.js'].functionData[11] = 0;
  _$jscoverage['/picker/control.js'].functionData[12] = 0;
  _$jscoverage['/picker/control.js'].functionData[13] = 0;
  _$jscoverage['/picker/control.js'].functionData[14] = 0;
  _$jscoverage['/picker/control.js'].functionData[15] = 0;
  _$jscoverage['/picker/control.js'].functionData[16] = 0;
  _$jscoverage['/picker/control.js'].functionData[17] = 0;
  _$jscoverage['/picker/control.js'].functionData[18] = 0;
  _$jscoverage['/picker/control.js'].functionData[19] = 0;
  _$jscoverage['/picker/control.js'].functionData[20] = 0;
  _$jscoverage['/picker/control.js'].functionData[21] = 0;
}
if (! _$jscoverage['/picker/control.js'].branchData) {
  _$jscoverage['/picker/control.js'].branchData = {};
  _$jscoverage['/picker/control.js'].branchData['80'] = [];
  _$jscoverage['/picker/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['125'] = [];
  _$jscoverage['/picker/control.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['136'] = [];
  _$jscoverage['/picker/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['175'] = [];
  _$jscoverage['/picker/control.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['181'] = [];
  _$jscoverage['/picker/control.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['208'] = [];
  _$jscoverage['/picker/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['215'] = [];
  _$jscoverage['/picker/control.js'].branchData['215'][1] = new BranchData();
}
_$jscoverage['/picker/control.js'].branchData['215'][1].init(43, 7, 'ctrlKey');
function visit7_215_1(result) {
  _$jscoverage['/picker/control.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['208'][1].init(42, 7, 'ctrlKey');
function visit6_208_1(result) {
  _$jscoverage['/picker/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['181'][1].init(47, 8, '!ctrlKey');
function visit5_181_1(result) {
  _$jscoverage['/picker/control.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['175'][1].init(293, 17, 'this.get(\'clear\')');
function visit4_175_1(result) {
  _$jscoverage['/picker/control.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['136'][1].init(41, 18, '!this.get(\'clear\')');
function visit3_136_1(result) {
  _$jscoverage['/picker/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['125'][1].init(74, 2, '!v');
function visit2_125_1(result) {
  _$jscoverage['/picker/control.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['80'][1].init(262, 54, 'disabledDate && disabledDate(value, self.get(\'value\'))');
function visit1_80_1(result) {
  _$jscoverage['/picker/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker/control.js'].functionData[0]++;
  _$jscoverage['/picker/control.js'].lineData[7]++;
  var Node = require('node'), GregorianCalendar = require('date/gregorian'), locale = require('i18n!date/picker'), Control = require('component/control'), PickerRender = require('./render'), MonthPanel = require('./month-panel/control');
  _$jscoverage['/picker/control.js'].lineData[13]++;
  var tap = Node.Gesture.tap;
  _$jscoverage['/picker/control.js'].lineData[14]++;
  var $ = Node.all;
  _$jscoverage['/picker/control.js'].lineData[15]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/picker/control.js'].lineData[17]++;
  function goStartMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[1]++;
    _$jscoverage['/picker/control.js'].lineData[18]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[19]++;
    next.setDayOfMonth(1);
    _$jscoverage['/picker/control.js'].lineData[20]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[23]++;
  function goEndMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[2]++;
    _$jscoverage['/picker/control.js'].lineData[24]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[25]++;
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    _$jscoverage['/picker/control.js'].lineData[26]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[29]++;
  function goMonth(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[3]++;
    _$jscoverage['/picker/control.js'].lineData[30]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[31]++;
    next.addMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[32]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[35]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[4]++;
    _$jscoverage['/picker/control.js'].lineData[36]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[37]++;
    next.addYear(direction);
    _$jscoverage['/picker/control.js'].lineData[38]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[41]++;
  function goWeek(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[5]++;
    _$jscoverage['/picker/control.js'].lineData[42]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[43]++;
    next.addWeekOfYear(direction);
    _$jscoverage['/picker/control.js'].lineData[44]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[47]++;
  function goDay(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[6]++;
    _$jscoverage['/picker/control.js'].lineData[48]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[49]++;
    next.addDayOfMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[50]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[53]++;
  function nextMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[7]++;
    _$jscoverage['/picker/control.js'].lineData[54]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[55]++;
    goMonth(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[58]++;
  function prevMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[8]++;
    _$jscoverage['/picker/control.js'].lineData[59]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[60]++;
    goMonth(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[63]++;
  function nextYear(e) {
    _$jscoverage['/picker/control.js'].functionData[9]++;
    _$jscoverage['/picker/control.js'].lineData[64]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[65]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[68]++;
  function prevYear(e) {
    _$jscoverage['/picker/control.js'].functionData[10]++;
    _$jscoverage['/picker/control.js'].lineData[69]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[70]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[73]++;
  function chooseCell(e) {
    _$jscoverage['/picker/control.js'].functionData[11]++;
    _$jscoverage['/picker/control.js'].lineData[74]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[75]++;
    self.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[76]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker/control.js'].lineData[77]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[78]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/control.js'].lineData[79]++;
    var value = self.dateTable[parseInt(td.attr('data-index'), 10)];
    _$jscoverage['/picker/control.js'].lineData[80]++;
    if (visit1_80_1(disabledDate && disabledDate(value, self.get('value')))) {
      _$jscoverage['/picker/control.js'].lineData[81]++;
      return;
    }
    _$jscoverage['/picker/control.js'].lineData[84]++;
    setTimeout(function() {
  _$jscoverage['/picker/control.js'].functionData[12]++;
  _$jscoverage['/picker/control.js'].lineData[85]++;
  self.set('value', value);
  _$jscoverage['/picker/control.js'].lineData[86]++;
  self.fire('select', {
  value: value});
}, 0);
  }
  _$jscoverage['/picker/control.js'].lineData[92]++;
  function showMonthPanel(e) {
    _$jscoverage['/picker/control.js'].functionData[13]++;
    _$jscoverage['/picker/control.js'].lineData[93]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[94]++;
    var monthPanel = this.get('monthPanel');
    _$jscoverage['/picker/control.js'].lineData[95]++;
    monthPanel.set('value', this.get('value'));
    _$jscoverage['/picker/control.js'].lineData[96]++;
    monthPanel.show();
  }
  _$jscoverage['/picker/control.js'].lineData[99]++;
  function setUpMonthPanel() {
    _$jscoverage['/picker/control.js'].functionData[14]++;
    _$jscoverage['/picker/control.js'].lineData[100]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[101]++;
    var monthPanel = new MonthPanel({
  locale: this.get('locale'), 
  render: self.get('el')});
    _$jscoverage['/picker/control.js'].lineData[105]++;
    monthPanel.on('select', onMonthPanelSelect, self);
    _$jscoverage['/picker/control.js'].lineData[106]++;
    return monthPanel;
  }
  _$jscoverage['/picker/control.js'].lineData[109]++;
  function onMonthPanelSelect(e) {
    _$jscoverage['/picker/control.js'].functionData[15]++;
    _$jscoverage['/picker/control.js'].lineData[110]++;
    this.set('value', e.value);
    _$jscoverage['/picker/control.js'].lineData[111]++;
    this.get('monthPanel').hide();
  }
  _$jscoverage['/picker/control.js'].lineData[114]++;
  function chooseToday(e) {
    _$jscoverage['/picker/control.js'].functionData[16]++;
    _$jscoverage['/picker/control.js'].lineData[115]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[116]++;
    this.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[117]++;
    var today = this.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[118]++;
    today.setTime(S.now());
    _$jscoverage['/picker/control.js'].lineData[119]++;
    this.set('value', today);
  }
  _$jscoverage['/picker/control.js'].lineData[122]++;
  function toggleClear() {
    _$jscoverage['/picker/control.js'].functionData[17]++;
    _$jscoverage['/picker/control.js'].lineData[123]++;
    var self = this, v = !self.get('clear');
    _$jscoverage['/picker/control.js'].lineData[125]++;
    if (visit2_125_1(!v)) {
      _$jscoverage['/picker/control.js'].lineData[126]++;
      var value = self.get('value');
      _$jscoverage['/picker/control.js'].lineData[127]++;
      value.setDayOfMonth(1);
      _$jscoverage['/picker/control.js'].lineData[128]++;
      self.set('clear', false);
    } else {
      _$jscoverage['/picker/control.js'].lineData[130]++;
      self.set('clear', true);
    }
  }
  _$jscoverage['/picker/control.js'].lineData[134]++;
  function onClearClick(e) {
    _$jscoverage['/picker/control.js'].functionData[18]++;
    _$jscoverage['/picker/control.js'].lineData[135]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[136]++;
    if (visit3_136_1(!this.get('clear'))) {
      _$jscoverage['/picker/control.js'].lineData[137]++;
      toggleClear.call(this);
    }
    _$jscoverage['/picker/control.js'].lineData[139]++;
    this.fire('select', {
  value: null});
  }
  _$jscoverage['/picker/control.js'].lineData[149]++;
  return Control.extend({
  bindUI: function() {
  _$jscoverage['/picker/control.js'].functionData[19]++;
  _$jscoverage['/picker/control.js'].lineData[151]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[152]++;
  self.get('nextMonthBtn').on(tap, nextMonth, self);
  _$jscoverage['/picker/control.js'].lineData[153]++;
  self.get('previousMonthBtn').on(tap, prevMonth, self);
  _$jscoverage['/picker/control.js'].lineData[154]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker/control.js'].lineData[155]++;
  self.get('previousYearBtn').on(tap, prevYear, self);
  _$jscoverage['/picker/control.js'].lineData[156]++;
  self.get('tbodyEl').delegate(tap, '.' + self.view.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker/control.js'].lineData[162]++;
  self.get('monthSelectEl').on(tap, showMonthPanel, self);
  _$jscoverage['/picker/control.js'].lineData[163]++;
  self.get('todayBtnEl').on(tap, chooseToday, self);
  _$jscoverage['/picker/control.js'].lineData[164]++;
  self.get('clearBtnEl').on(tap, onClearClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/picker/control.js'].functionData[20]++;
  _$jscoverage['/picker/control.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[168]++;
  var keyCode = e.keyCode;
  _$jscoverage['/picker/control.js'].lineData[169]++;
  var ctrlKey = e.ctrlKey;
  _$jscoverage['/picker/control.js'].lineData[170]++;
  switch (keyCode) {
    case KeyCode.SPACE:
      _$jscoverage['/picker/control.js'].lineData[172]++;
      self.set('clear', !self.get('clear'));
      _$jscoverage['/picker/control.js'].lineData[173]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[175]++;
  if (visit4_175_1(this.get('clear'))) {
    _$jscoverage['/picker/control.js'].lineData[176]++;
    switch (keyCode) {
      case KeyCode.DOWN:
      case KeyCode.UP:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        _$jscoverage['/picker/control.js'].lineData[181]++;
        if (visit5_181_1(!ctrlKey)) {
          _$jscoverage['/picker/control.js'].lineData[182]++;
          toggleClear.call(self);
        }
        _$jscoverage['/picker/control.js'].lineData[184]++;
        return true;
      case KeyCode.HOME:
        _$jscoverage['/picker/control.js'].lineData[186]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[187]++;
        goStartMonth(self);
        _$jscoverage['/picker/control.js'].lineData[188]++;
        return true;
      case KeyCode.END:
        _$jscoverage['/picker/control.js'].lineData[190]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[191]++;
        goEndMonth(self);
        _$jscoverage['/picker/control.js'].lineData[192]++;
        return true;
      case KeyCode.ENTER:
        _$jscoverage['/picker/control.js'].lineData[194]++;
        self.fire('select', {
  value: null});
        _$jscoverage['/picker/control.js'].lineData[197]++;
        return true;
    }
  }
  _$jscoverage['/picker/control.js'].lineData[200]++;
  switch (keyCode) {
    case KeyCode.DOWN:
      _$jscoverage['/picker/control.js'].lineData[202]++;
      goWeek(self, 1);
      _$jscoverage['/picker/control.js'].lineData[203]++;
      return true;
    case KeyCode.UP:
      _$jscoverage['/picker/control.js'].lineData[205]++;
      goWeek(self, -1);
      _$jscoverage['/picker/control.js'].lineData[206]++;
      return true;
    case KeyCode.LEFT:
      _$jscoverage['/picker/control.js'].lineData[208]++;
      if (visit6_208_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[209]++;
        goYear(self, -1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[211]++;
        goDay(self, -1);
      }
      _$jscoverage['/picker/control.js'].lineData[213]++;
      return true;
    case KeyCode.RIGHT:
      _$jscoverage['/picker/control.js'].lineData[215]++;
      if (visit7_215_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[216]++;
        goYear(self, 1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[218]++;
        goDay(self, 1);
      }
      _$jscoverage['/picker/control.js'].lineData[220]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/picker/control.js'].lineData[222]++;
      goStartMonth(self);
      _$jscoverage['/picker/control.js'].lineData[223]++;
      return true;
    case KeyCode.END:
      _$jscoverage['/picker/control.js'].lineData[225]++;
      goEndMonth(self);
      _$jscoverage['/picker/control.js'].lineData[226]++;
      return true;
    case KeyCode.PAGE_DOWN:
      _$jscoverage['/picker/control.js'].lineData[228]++;
      goMonth(self, 1);
      _$jscoverage['/picker/control.js'].lineData[229]++;
      return true;
    case KeyCode.PAGE_UP:
      _$jscoverage['/picker/control.js'].lineData[231]++;
      goMonth(self, -1);
      _$jscoverage['/picker/control.js'].lineData[232]++;
      return true;
    case KeyCode.ENTER:
      _$jscoverage['/picker/control.js'].lineData[234]++;
      self.fire('select', {
  value: self.get('value')});
      _$jscoverage['/picker/control.js'].lineData[237]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[239]++;
  return undefined;
}}, {
  xclass: 'date-picker', 
  ATTRS: {
  focusable: {
  value: true}, 
  value: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/picker/control.js'].functionData[21]++;
  _$jscoverage['/picker/control.js'].lineData[257]++;
  var date = new GregorianCalendar();
  _$jscoverage['/picker/control.js'].lineData[258]++;
  date.setTime(S.now());
  _$jscoverage['/picker/control.js'].lineData[259]++;
  return date;
}}, 
  previousMonthBtn: {}, 
  monthSelectEl: {}, 
  monthPanel: {
  valueFn: setUpMonthPanel}, 
  nextMonthBtn: {}, 
  tbodyEl: {}, 
  todayBtnEl: {}, 
  dateRender: {}, 
  disabledDate: {}, 
  locale: {
  value: locale}, 
  showToday: {
  view: 1, 
  value: true}, 
  showClear: {
  view: 1, 
  value: true}, 
  clear: {
  view: 1, 
  value: false}, 
  showWeekNumber: {
  view: 1, 
  value: true}, 
  xrender: {
  value: PickerRender}}});
});
