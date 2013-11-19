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
  _$jscoverage['/picker/control.js'].lineData[8] = 0;
  _$jscoverage['/picker/control.js'].lineData[14] = 0;
  _$jscoverage['/picker/control.js'].lineData[15] = 0;
  _$jscoverage['/picker/control.js'].lineData[16] = 0;
  _$jscoverage['/picker/control.js'].lineData[17] = 0;
  _$jscoverage['/picker/control.js'].lineData[19] = 0;
  _$jscoverage['/picker/control.js'].lineData[20] = 0;
  _$jscoverage['/picker/control.js'].lineData[21] = 0;
  _$jscoverage['/picker/control.js'].lineData[22] = 0;
  _$jscoverage['/picker/control.js'].lineData[25] = 0;
  _$jscoverage['/picker/control.js'].lineData[26] = 0;
  _$jscoverage['/picker/control.js'].lineData[27] = 0;
  _$jscoverage['/picker/control.js'].lineData[28] = 0;
  _$jscoverage['/picker/control.js'].lineData[31] = 0;
  _$jscoverage['/picker/control.js'].lineData[32] = 0;
  _$jscoverage['/picker/control.js'].lineData[33] = 0;
  _$jscoverage['/picker/control.js'].lineData[34] = 0;
  _$jscoverage['/picker/control.js'].lineData[37] = 0;
  _$jscoverage['/picker/control.js'].lineData[38] = 0;
  _$jscoverage['/picker/control.js'].lineData[39] = 0;
  _$jscoverage['/picker/control.js'].lineData[40] = 0;
  _$jscoverage['/picker/control.js'].lineData[43] = 0;
  _$jscoverage['/picker/control.js'].lineData[44] = 0;
  _$jscoverage['/picker/control.js'].lineData[45] = 0;
  _$jscoverage['/picker/control.js'].lineData[46] = 0;
  _$jscoverage['/picker/control.js'].lineData[49] = 0;
  _$jscoverage['/picker/control.js'].lineData[50] = 0;
  _$jscoverage['/picker/control.js'].lineData[51] = 0;
  _$jscoverage['/picker/control.js'].lineData[52] = 0;
  _$jscoverage['/picker/control.js'].lineData[55] = 0;
  _$jscoverage['/picker/control.js'].lineData[56] = 0;
  _$jscoverage['/picker/control.js'].lineData[57] = 0;
  _$jscoverage['/picker/control.js'].lineData[60] = 0;
  _$jscoverage['/picker/control.js'].lineData[61] = 0;
  _$jscoverage['/picker/control.js'].lineData[62] = 0;
  _$jscoverage['/picker/control.js'].lineData[65] = 0;
  _$jscoverage['/picker/control.js'].lineData[66] = 0;
  _$jscoverage['/picker/control.js'].lineData[67] = 0;
  _$jscoverage['/picker/control.js'].lineData[70] = 0;
  _$jscoverage['/picker/control.js'].lineData[71] = 0;
  _$jscoverage['/picker/control.js'].lineData[72] = 0;
  _$jscoverage['/picker/control.js'].lineData[75] = 0;
  _$jscoverage['/picker/control.js'].lineData[76] = 0;
  _$jscoverage['/picker/control.js'].lineData[77] = 0;
  _$jscoverage['/picker/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/control.js'].lineData[79] = 0;
  _$jscoverage['/picker/control.js'].lineData[80] = 0;
  _$jscoverage['/picker/control.js'].lineData[81] = 0;
  _$jscoverage['/picker/control.js'].lineData[82] = 0;
  _$jscoverage['/picker/control.js'].lineData[83] = 0;
  _$jscoverage['/picker/control.js'].lineData[85] = 0;
  _$jscoverage['/picker/control.js'].lineData[86] = 0;
  _$jscoverage['/picker/control.js'].lineData[91] = 0;
  _$jscoverage['/picker/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/control.js'].lineData[93] = 0;
  _$jscoverage['/picker/control.js'].lineData[94] = 0;
  _$jscoverage['/picker/control.js'].lineData[95] = 0;
  _$jscoverage['/picker/control.js'].lineData[98] = 0;
  _$jscoverage['/picker/control.js'].lineData[99] = 0;
  _$jscoverage['/picker/control.js'].lineData[100] = 0;
  _$jscoverage['/picker/control.js'].lineData[104] = 0;
  _$jscoverage['/picker/control.js'].lineData[105] = 0;
  _$jscoverage['/picker/control.js'].lineData[108] = 0;
  _$jscoverage['/picker/control.js'].lineData[109] = 0;
  _$jscoverage['/picker/control.js'].lineData[110] = 0;
  _$jscoverage['/picker/control.js'].lineData[113] = 0;
  _$jscoverage['/picker/control.js'].lineData[114] = 0;
  _$jscoverage['/picker/control.js'].lineData[115] = 0;
  _$jscoverage['/picker/control.js'].lineData[116] = 0;
  _$jscoverage['/picker/control.js'].lineData[117] = 0;
  _$jscoverage['/picker/control.js'].lineData[118] = 0;
  _$jscoverage['/picker/control.js'].lineData[121] = 0;
  _$jscoverage['/picker/control.js'].lineData[122] = 0;
  _$jscoverage['/picker/control.js'].lineData[124] = 0;
  _$jscoverage['/picker/control.js'].lineData[125] = 0;
  _$jscoverage['/picker/control.js'].lineData[126] = 0;
  _$jscoverage['/picker/control.js'].lineData[127] = 0;
  _$jscoverage['/picker/control.js'].lineData[129] = 0;
  _$jscoverage['/picker/control.js'].lineData[133] = 0;
  _$jscoverage['/picker/control.js'].lineData[134] = 0;
  _$jscoverage['/picker/control.js'].lineData[135] = 0;
  _$jscoverage['/picker/control.js'].lineData[136] = 0;
  _$jscoverage['/picker/control.js'].lineData[138] = 0;
  _$jscoverage['/picker/control.js'].lineData[148] = 0;
  _$jscoverage['/picker/control.js'].lineData[150] = 0;
  _$jscoverage['/picker/control.js'].lineData[151] = 0;
  _$jscoverage['/picker/control.js'].lineData[152] = 0;
  _$jscoverage['/picker/control.js'].lineData[153] = 0;
  _$jscoverage['/picker/control.js'].lineData[154] = 0;
  _$jscoverage['/picker/control.js'].lineData[155] = 0;
  _$jscoverage['/picker/control.js'].lineData[161] = 0;
  _$jscoverage['/picker/control.js'].lineData[162] = 0;
  _$jscoverage['/picker/control.js'].lineData[163] = 0;
  _$jscoverage['/picker/control.js'].lineData[166] = 0;
  _$jscoverage['/picker/control.js'].lineData[167] = 0;
  _$jscoverage['/picker/control.js'].lineData[168] = 0;
  _$jscoverage['/picker/control.js'].lineData[169] = 0;
  _$jscoverage['/picker/control.js'].lineData[171] = 0;
  _$jscoverage['/picker/control.js'].lineData[172] = 0;
  _$jscoverage['/picker/control.js'].lineData[174] = 0;
  _$jscoverage['/picker/control.js'].lineData[175] = 0;
  _$jscoverage['/picker/control.js'].lineData[180] = 0;
  _$jscoverage['/picker/control.js'].lineData[181] = 0;
  _$jscoverage['/picker/control.js'].lineData[183] = 0;
  _$jscoverage['/picker/control.js'].lineData[185] = 0;
  _$jscoverage['/picker/control.js'].lineData[186] = 0;
  _$jscoverage['/picker/control.js'].lineData[187] = 0;
  _$jscoverage['/picker/control.js'].lineData[189] = 0;
  _$jscoverage['/picker/control.js'].lineData[190] = 0;
  _$jscoverage['/picker/control.js'].lineData[191] = 0;
  _$jscoverage['/picker/control.js'].lineData[193] = 0;
  _$jscoverage['/picker/control.js'].lineData[196] = 0;
  _$jscoverage['/picker/control.js'].lineData[199] = 0;
  _$jscoverage['/picker/control.js'].lineData[201] = 0;
  _$jscoverage['/picker/control.js'].lineData[202] = 0;
  _$jscoverage['/picker/control.js'].lineData[204] = 0;
  _$jscoverage['/picker/control.js'].lineData[205] = 0;
  _$jscoverage['/picker/control.js'].lineData[207] = 0;
  _$jscoverage['/picker/control.js'].lineData[208] = 0;
  _$jscoverage['/picker/control.js'].lineData[210] = 0;
  _$jscoverage['/picker/control.js'].lineData[212] = 0;
  _$jscoverage['/picker/control.js'].lineData[214] = 0;
  _$jscoverage['/picker/control.js'].lineData[215] = 0;
  _$jscoverage['/picker/control.js'].lineData[217] = 0;
  _$jscoverage['/picker/control.js'].lineData[219] = 0;
  _$jscoverage['/picker/control.js'].lineData[221] = 0;
  _$jscoverage['/picker/control.js'].lineData[222] = 0;
  _$jscoverage['/picker/control.js'].lineData[224] = 0;
  _$jscoverage['/picker/control.js'].lineData[225] = 0;
  _$jscoverage['/picker/control.js'].lineData[227] = 0;
  _$jscoverage['/picker/control.js'].lineData[228] = 0;
  _$jscoverage['/picker/control.js'].lineData[230] = 0;
  _$jscoverage['/picker/control.js'].lineData[231] = 0;
  _$jscoverage['/picker/control.js'].lineData[233] = 0;
  _$jscoverage['/picker/control.js'].lineData[236] = 0;
  _$jscoverage['/picker/control.js'].lineData[238] = 0;
  _$jscoverage['/picker/control.js'].lineData[256] = 0;
  _$jscoverage['/picker/control.js'].lineData[257] = 0;
  _$jscoverage['/picker/control.js'].lineData[258] = 0;
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
}
if (! _$jscoverage['/picker/control.js'].branchData) {
  _$jscoverage['/picker/control.js'].branchData = {};
  _$jscoverage['/picker/control.js'].branchData['82'] = [];
  _$jscoverage['/picker/control.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['124'] = [];
  _$jscoverage['/picker/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['135'] = [];
  _$jscoverage['/picker/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['174'] = [];
  _$jscoverage['/picker/control.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['180'] = [];
  _$jscoverage['/picker/control.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['207'] = [];
  _$jscoverage['/picker/control.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['214'] = [];
  _$jscoverage['/picker/control.js'].branchData['214'][1] = new BranchData();
}
_$jscoverage['/picker/control.js'].branchData['214'][1].init(43, 7, 'ctrlKey');
function visit7_214_1(result) {
  _$jscoverage['/picker/control.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['207'][1].init(42, 7, 'ctrlKey');
function visit6_207_1(result) {
  _$jscoverage['/picker/control.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['180'][1].init(47, 8, '!ctrlKey');
function visit5_180_1(result) {
  _$jscoverage['/picker/control.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['174'][1].init(293, 17, 'this.get(\'clear\')');
function visit4_174_1(result) {
  _$jscoverage['/picker/control.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['135'][1].init(41, 18, '!this.get(\'clear\')');
function visit3_135_1(result) {
  _$jscoverage['/picker/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['124'][1].init(74, 2, '!v');
function visit2_124_1(result) {
  _$jscoverage['/picker/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['82'][1].init(259, 54, 'disabledDate && disabledDate(value, self.get(\'value\'))');
function visit1_82_1(result) {
  _$jscoverage['/picker/control.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/picker/control.js'].functionData[0]++;
  _$jscoverage['/picker/control.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/picker/control.js'].lineData[8]++;
  var Node = module.require('node'), GregorianCalendar = module.require('date/gregorian'), locale = module.require('i18n!date/picker'), Control = module.require('component/control'), PickerRender = module.require('./render'), MonthPanel = module.require('./month-panel/control');
  _$jscoverage['/picker/control.js'].lineData[14]++;
  var tap = Node.Gesture.tap;
  _$jscoverage['/picker/control.js'].lineData[15]++;
  var $ = Node.all;
  _$jscoverage['/picker/control.js'].lineData[16]++;
  var undefined = undefined;
  _$jscoverage['/picker/control.js'].lineData[17]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/picker/control.js'].lineData[19]++;
  function goStartMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[1]++;
    _$jscoverage['/picker/control.js'].lineData[20]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[21]++;
    next.setDayOfMonth(1);
    _$jscoverage['/picker/control.js'].lineData[22]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[25]++;
  function goEndMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[2]++;
    _$jscoverage['/picker/control.js'].lineData[26]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[27]++;
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    _$jscoverage['/picker/control.js'].lineData[28]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[31]++;
  function goMonth(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[3]++;
    _$jscoverage['/picker/control.js'].lineData[32]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[33]++;
    next.addMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[34]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[37]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[4]++;
    _$jscoverage['/picker/control.js'].lineData[38]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[39]++;
    next.addYear(direction);
    _$jscoverage['/picker/control.js'].lineData[40]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[43]++;
  function goWeek(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[5]++;
    _$jscoverage['/picker/control.js'].lineData[44]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[45]++;
    next.addWeekOfYear(direction);
    _$jscoverage['/picker/control.js'].lineData[46]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[49]++;
  function goDay(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[6]++;
    _$jscoverage['/picker/control.js'].lineData[50]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[51]++;
    next.addDayOfMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[52]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[55]++;
  function nextMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[7]++;
    _$jscoverage['/picker/control.js'].lineData[56]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[57]++;
    goMonth(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[60]++;
  function prevMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[8]++;
    _$jscoverage['/picker/control.js'].lineData[61]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[62]++;
    goMonth(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[65]++;
  function nextYear(e) {
    _$jscoverage['/picker/control.js'].functionData[9]++;
    _$jscoverage['/picker/control.js'].lineData[66]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[67]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[70]++;
  function prevYear(e) {
    _$jscoverage['/picker/control.js'].functionData[10]++;
    _$jscoverage['/picker/control.js'].lineData[71]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[72]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[75]++;
  function chooseCell(e) {
    _$jscoverage['/picker/control.js'].functionData[11]++;
    _$jscoverage['/picker/control.js'].lineData[76]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[77]++;
    self.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[78]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker/control.js'].lineData[79]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[80]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/control.js'].lineData[81]++;
    var value = self.dateTable[parseInt(td.attr('data-index'))];
    _$jscoverage['/picker/control.js'].lineData[82]++;
    if (visit1_82_1(disabledDate && disabledDate(value, self.get('value')))) {
      _$jscoverage['/picker/control.js'].lineData[83]++;
      return;
    }
    _$jscoverage['/picker/control.js'].lineData[85]++;
    self.set('value', value);
    _$jscoverage['/picker/control.js'].lineData[86]++;
    self.fire('select', {
  value: value});
  }
  _$jscoverage['/picker/control.js'].lineData[91]++;
  function showMonthPanel(e) {
    _$jscoverage['/picker/control.js'].functionData[12]++;
    _$jscoverage['/picker/control.js'].lineData[92]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[93]++;
    var monthPanel = this.get('monthPanel');
    _$jscoverage['/picker/control.js'].lineData[94]++;
    monthPanel.set('value', this.get('value'));
    _$jscoverage['/picker/control.js'].lineData[95]++;
    monthPanel.show();
  }
  _$jscoverage['/picker/control.js'].lineData[98]++;
  function setUpMonthPanel() {
    _$jscoverage['/picker/control.js'].functionData[13]++;
    _$jscoverage['/picker/control.js'].lineData[99]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[100]++;
    var monthPanel = new MonthPanel({
  locale: this.get('locale'), 
  render: self.get('el')});
    _$jscoverage['/picker/control.js'].lineData[104]++;
    monthPanel.on('select', onMonthPanelSelect, self);
    _$jscoverage['/picker/control.js'].lineData[105]++;
    return monthPanel;
  }
  _$jscoverage['/picker/control.js'].lineData[108]++;
  function onMonthPanelSelect(e) {
    _$jscoverage['/picker/control.js'].functionData[14]++;
    _$jscoverage['/picker/control.js'].lineData[109]++;
    this.set('value', e.value);
    _$jscoverage['/picker/control.js'].lineData[110]++;
    this.get('monthPanel').hide();
  }
  _$jscoverage['/picker/control.js'].lineData[113]++;
  function chooseToday(e) {
    _$jscoverage['/picker/control.js'].functionData[15]++;
    _$jscoverage['/picker/control.js'].lineData[114]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[115]++;
    this.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[116]++;
    var today = this.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[117]++;
    today.setTime(S.now());
    _$jscoverage['/picker/control.js'].lineData[118]++;
    this.set('value', today);
  }
  _$jscoverage['/picker/control.js'].lineData[121]++;
  function toggleClear() {
    _$jscoverage['/picker/control.js'].functionData[16]++;
    _$jscoverage['/picker/control.js'].lineData[122]++;
    var self = this, v = !self.get('clear');
    _$jscoverage['/picker/control.js'].lineData[124]++;
    if (visit2_124_1(!v)) {
      _$jscoverage['/picker/control.js'].lineData[125]++;
      var value = self.get('value');
      _$jscoverage['/picker/control.js'].lineData[126]++;
      value.setDayOfMonth(1);
      _$jscoverage['/picker/control.js'].lineData[127]++;
      self.set('clear', false);
    } else {
      _$jscoverage['/picker/control.js'].lineData[129]++;
      self.set('clear', true);
    }
  }
  _$jscoverage['/picker/control.js'].lineData[133]++;
  function onClearClick(e) {
    _$jscoverage['/picker/control.js'].functionData[17]++;
    _$jscoverage['/picker/control.js'].lineData[134]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[135]++;
    if (visit3_135_1(!this.get('clear'))) {
      _$jscoverage['/picker/control.js'].lineData[136]++;
      toggleClear.call(this);
    }
    _$jscoverage['/picker/control.js'].lineData[138]++;
    this.fire('select', {
  value: null});
  }
  _$jscoverage['/picker/control.js'].lineData[148]++;
  return Control.extend({
  bindUI: function() {
  _$jscoverage['/picker/control.js'].functionData[18]++;
  _$jscoverage['/picker/control.js'].lineData[150]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[151]++;
  self.get('nextMonthBtn').on(tap, nextMonth, self);
  _$jscoverage['/picker/control.js'].lineData[152]++;
  self.get('previousMonthBtn').on(tap, prevMonth, self);
  _$jscoverage['/picker/control.js'].lineData[153]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker/control.js'].lineData[154]++;
  self.get('previousYearBtn').on(tap, prevYear, self);
  _$jscoverage['/picker/control.js'].lineData[155]++;
  self.get('tbodyEl').delegate(tap, '.' + self.view.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker/control.js'].lineData[161]++;
  self.get('monthSelectEl').on(tap, showMonthPanel, self);
  _$jscoverage['/picker/control.js'].lineData[162]++;
  self.get('todayBtnEl').on(tap, chooseToday, self);
  _$jscoverage['/picker/control.js'].lineData[163]++;
  self.get('clearBtnEl').on(tap, onClearClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/picker/control.js'].functionData[19]++;
  _$jscoverage['/picker/control.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[167]++;
  var keyCode = e.keyCode;
  _$jscoverage['/picker/control.js'].lineData[168]++;
  var ctrlKey = e.ctrlKey;
  _$jscoverage['/picker/control.js'].lineData[169]++;
  switch (keyCode) {
    case KeyCode.SPACE:
      _$jscoverage['/picker/control.js'].lineData[171]++;
      self.set('clear', !self.get('clear'));
      _$jscoverage['/picker/control.js'].lineData[172]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[174]++;
  if (visit4_174_1(this.get('clear'))) {
    _$jscoverage['/picker/control.js'].lineData[175]++;
    switch (keyCode) {
      case KeyCode.DOWN:
      case KeyCode.UP:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        _$jscoverage['/picker/control.js'].lineData[180]++;
        if (visit5_180_1(!ctrlKey)) {
          _$jscoverage['/picker/control.js'].lineData[181]++;
          toggleClear.call(self);
        }
        _$jscoverage['/picker/control.js'].lineData[183]++;
        return true;
      case KeyCode.HOME:
        _$jscoverage['/picker/control.js'].lineData[185]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[186]++;
        goStartMonth(self);
        _$jscoverage['/picker/control.js'].lineData[187]++;
        return true;
      case KeyCode.END:
        _$jscoverage['/picker/control.js'].lineData[189]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[190]++;
        goEndMonth(self);
        _$jscoverage['/picker/control.js'].lineData[191]++;
        return true;
      case KeyCode.ENTER:
        _$jscoverage['/picker/control.js'].lineData[193]++;
        self.fire('select', {
  value: null});
        _$jscoverage['/picker/control.js'].lineData[196]++;
        return true;
    }
  }
  _$jscoverage['/picker/control.js'].lineData[199]++;
  switch (keyCode) {
    case KeyCode.DOWN:
      _$jscoverage['/picker/control.js'].lineData[201]++;
      goWeek(self, 1);
      _$jscoverage['/picker/control.js'].lineData[202]++;
      return true;
    case KeyCode.UP:
      _$jscoverage['/picker/control.js'].lineData[204]++;
      goWeek(self, -1);
      _$jscoverage['/picker/control.js'].lineData[205]++;
      return true;
    case KeyCode.LEFT:
      _$jscoverage['/picker/control.js'].lineData[207]++;
      if (visit6_207_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[208]++;
        goYear(self, -1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[210]++;
        goDay(self, -1);
      }
      _$jscoverage['/picker/control.js'].lineData[212]++;
      return true;
    case KeyCode.RIGHT:
      _$jscoverage['/picker/control.js'].lineData[214]++;
      if (visit7_214_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[215]++;
        goYear(self, 1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[217]++;
        goDay(self, 1);
      }
      _$jscoverage['/picker/control.js'].lineData[219]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/picker/control.js'].lineData[221]++;
      goStartMonth(self);
      _$jscoverage['/picker/control.js'].lineData[222]++;
      return true;
    case KeyCode.END:
      _$jscoverage['/picker/control.js'].lineData[224]++;
      goEndMonth(self);
      _$jscoverage['/picker/control.js'].lineData[225]++;
      return true;
    case KeyCode.PAGE_DOWN:
      _$jscoverage['/picker/control.js'].lineData[227]++;
      goMonth(self, 1);
      _$jscoverage['/picker/control.js'].lineData[228]++;
      return true;
    case KeyCode.PAGE_UP:
      _$jscoverage['/picker/control.js'].lineData[230]++;
      goMonth(self, -1);
      _$jscoverage['/picker/control.js'].lineData[231]++;
      return true;
    case KeyCode.ENTER:
      _$jscoverage['/picker/control.js'].lineData[233]++;
      self.fire('select', {
  value: self.get('value')});
      _$jscoverage['/picker/control.js'].lineData[236]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[238]++;
  return undefined;
}}, {
  xclass: 'date-picker', 
  ATTRS: {
  focusable: {
  value: true}, 
  value: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/picker/control.js'].functionData[20]++;
  _$jscoverage['/picker/control.js'].lineData[256]++;
  var date = new GregorianCalendar();
  _$jscoverage['/picker/control.js'].lineData[257]++;
  date.setTime(S.now());
  _$jscoverage['/picker/control.js'].lineData[258]++;
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
