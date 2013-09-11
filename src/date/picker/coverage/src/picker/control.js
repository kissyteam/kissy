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
  _$jscoverage['/picker/control.js'].lineData[9] = 0;
  _$jscoverage['/picker/control.js'].lineData[10] = 0;
  _$jscoverage['/picker/control.js'].lineData[12] = 0;
  _$jscoverage['/picker/control.js'].lineData[13] = 0;
  _$jscoverage['/picker/control.js'].lineData[14] = 0;
  _$jscoverage['/picker/control.js'].lineData[15] = 0;
  _$jscoverage['/picker/control.js'].lineData[18] = 0;
  _$jscoverage['/picker/control.js'].lineData[19] = 0;
  _$jscoverage['/picker/control.js'].lineData[20] = 0;
  _$jscoverage['/picker/control.js'].lineData[21] = 0;
  _$jscoverage['/picker/control.js'].lineData[24] = 0;
  _$jscoverage['/picker/control.js'].lineData[25] = 0;
  _$jscoverage['/picker/control.js'].lineData[26] = 0;
  _$jscoverage['/picker/control.js'].lineData[27] = 0;
  _$jscoverage['/picker/control.js'].lineData[30] = 0;
  _$jscoverage['/picker/control.js'].lineData[31] = 0;
  _$jscoverage['/picker/control.js'].lineData[32] = 0;
  _$jscoverage['/picker/control.js'].lineData[33] = 0;
  _$jscoverage['/picker/control.js'].lineData[36] = 0;
  _$jscoverage['/picker/control.js'].lineData[37] = 0;
  _$jscoverage['/picker/control.js'].lineData[38] = 0;
  _$jscoverage['/picker/control.js'].lineData[39] = 0;
  _$jscoverage['/picker/control.js'].lineData[42] = 0;
  _$jscoverage['/picker/control.js'].lineData[43] = 0;
  _$jscoverage['/picker/control.js'].lineData[44] = 0;
  _$jscoverage['/picker/control.js'].lineData[45] = 0;
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
  _$jscoverage['/picker/control.js'].lineData[71] = 0;
  _$jscoverage['/picker/control.js'].lineData[72] = 0;
  _$jscoverage['/picker/control.js'].lineData[73] = 0;
  _$jscoverage['/picker/control.js'].lineData[74] = 0;
  _$jscoverage['/picker/control.js'].lineData[75] = 0;
  _$jscoverage['/picker/control.js'].lineData[76] = 0;
  _$jscoverage['/picker/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/control.js'].lineData[79] = 0;
  _$jscoverage['/picker/control.js'].lineData[84] = 0;
  _$jscoverage['/picker/control.js'].lineData[85] = 0;
  _$jscoverage['/picker/control.js'].lineData[86] = 0;
  _$jscoverage['/picker/control.js'].lineData[87] = 0;
  _$jscoverage['/picker/control.js'].lineData[88] = 0;
  _$jscoverage['/picker/control.js'].lineData[91] = 0;
  _$jscoverage['/picker/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/control.js'].lineData[93] = 0;
  _$jscoverage['/picker/control.js'].lineData[97] = 0;
  _$jscoverage['/picker/control.js'].lineData[98] = 0;
  _$jscoverage['/picker/control.js'].lineData[101] = 0;
  _$jscoverage['/picker/control.js'].lineData[102] = 0;
  _$jscoverage['/picker/control.js'].lineData[103] = 0;
  _$jscoverage['/picker/control.js'].lineData[106] = 0;
  _$jscoverage['/picker/control.js'].lineData[107] = 0;
  _$jscoverage['/picker/control.js'].lineData[108] = 0;
  _$jscoverage['/picker/control.js'].lineData[109] = 0;
  _$jscoverage['/picker/control.js'].lineData[110] = 0;
  _$jscoverage['/picker/control.js'].lineData[111] = 0;
  _$jscoverage['/picker/control.js'].lineData[114] = 0;
  _$jscoverage['/picker/control.js'].lineData[115] = 0;
  _$jscoverage['/picker/control.js'].lineData[117] = 0;
  _$jscoverage['/picker/control.js'].lineData[118] = 0;
  _$jscoverage['/picker/control.js'].lineData[119] = 0;
  _$jscoverage['/picker/control.js'].lineData[120] = 0;
  _$jscoverage['/picker/control.js'].lineData[122] = 0;
  _$jscoverage['/picker/control.js'].lineData[126] = 0;
  _$jscoverage['/picker/control.js'].lineData[127] = 0;
  _$jscoverage['/picker/control.js'].lineData[128] = 0;
  _$jscoverage['/picker/control.js'].lineData[129] = 0;
  _$jscoverage['/picker/control.js'].lineData[131] = 0;
  _$jscoverage['/picker/control.js'].lineData[136] = 0;
  _$jscoverage['/picker/control.js'].lineData[138] = 0;
  _$jscoverage['/picker/control.js'].lineData[139] = 0;
  _$jscoverage['/picker/control.js'].lineData[140] = 0;
  _$jscoverage['/picker/control.js'].lineData[141] = 0;
  _$jscoverage['/picker/control.js'].lineData[142] = 0;
  _$jscoverage['/picker/control.js'].lineData[143] = 0;
  _$jscoverage['/picker/control.js'].lineData[149] = 0;
  _$jscoverage['/picker/control.js'].lineData[150] = 0;
  _$jscoverage['/picker/control.js'].lineData[151] = 0;
  _$jscoverage['/picker/control.js'].lineData[154] = 0;
  _$jscoverage['/picker/control.js'].lineData[155] = 0;
  _$jscoverage['/picker/control.js'].lineData[156] = 0;
  _$jscoverage['/picker/control.js'].lineData[157] = 0;
  _$jscoverage['/picker/control.js'].lineData[159] = 0;
  _$jscoverage['/picker/control.js'].lineData[160] = 0;
  _$jscoverage['/picker/control.js'].lineData[162] = 0;
  _$jscoverage['/picker/control.js'].lineData[163] = 0;
  _$jscoverage['/picker/control.js'].lineData[168] = 0;
  _$jscoverage['/picker/control.js'].lineData[169] = 0;
  _$jscoverage['/picker/control.js'].lineData[171] = 0;
  _$jscoverage['/picker/control.js'].lineData[173] = 0;
  _$jscoverage['/picker/control.js'].lineData[174] = 0;
  _$jscoverage['/picker/control.js'].lineData[175] = 0;
  _$jscoverage['/picker/control.js'].lineData[177] = 0;
  _$jscoverage['/picker/control.js'].lineData[178] = 0;
  _$jscoverage['/picker/control.js'].lineData[179] = 0;
  _$jscoverage['/picker/control.js'].lineData[181] = 0;
  _$jscoverage['/picker/control.js'].lineData[184] = 0;
  _$jscoverage['/picker/control.js'].lineData[187] = 0;
  _$jscoverage['/picker/control.js'].lineData[189] = 0;
  _$jscoverage['/picker/control.js'].lineData[190] = 0;
  _$jscoverage['/picker/control.js'].lineData[192] = 0;
  _$jscoverage['/picker/control.js'].lineData[193] = 0;
  _$jscoverage['/picker/control.js'].lineData[195] = 0;
  _$jscoverage['/picker/control.js'].lineData[196] = 0;
  _$jscoverage['/picker/control.js'].lineData[198] = 0;
  _$jscoverage['/picker/control.js'].lineData[200] = 0;
  _$jscoverage['/picker/control.js'].lineData[202] = 0;
  _$jscoverage['/picker/control.js'].lineData[203] = 0;
  _$jscoverage['/picker/control.js'].lineData[205] = 0;
  _$jscoverage['/picker/control.js'].lineData[207] = 0;
  _$jscoverage['/picker/control.js'].lineData[209] = 0;
  _$jscoverage['/picker/control.js'].lineData[210] = 0;
  _$jscoverage['/picker/control.js'].lineData[212] = 0;
  _$jscoverage['/picker/control.js'].lineData[213] = 0;
  _$jscoverage['/picker/control.js'].lineData[215] = 0;
  _$jscoverage['/picker/control.js'].lineData[216] = 0;
  _$jscoverage['/picker/control.js'].lineData[218] = 0;
  _$jscoverage['/picker/control.js'].lineData[219] = 0;
  _$jscoverage['/picker/control.js'].lineData[221] = 0;
  _$jscoverage['/picker/control.js'].lineData[224] = 0;
  _$jscoverage['/picker/control.js'].lineData[226] = 0;
  _$jscoverage['/picker/control.js'].lineData[237] = 0;
  _$jscoverage['/picker/control.js'].lineData[238] = 0;
  _$jscoverage['/picker/control.js'].lineData[239] = 0;
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
  _$jscoverage['/picker/control.js'].branchData['75'] = [];
  _$jscoverage['/picker/control.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['117'] = [];
  _$jscoverage['/picker/control.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['128'] = [];
  _$jscoverage['/picker/control.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['162'] = [];
  _$jscoverage['/picker/control.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['168'] = [];
  _$jscoverage['/picker/control.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['195'] = [];
  _$jscoverage['/picker/control.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['202'] = [];
  _$jscoverage['/picker/control.js'].branchData['202'][1] = new BranchData();
}
_$jscoverage['/picker/control.js'].branchData['202'][1].init(44, 7, 'ctrlKey');
function visit7_202_1(result) {
  _$jscoverage['/picker/control.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['195'][1].init(43, 7, 'ctrlKey');
function visit6_195_1(result) {
  _$jscoverage['/picker/control.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['168'][1].init(48, 8, '!ctrlKey');
function visit5_168_1(result) {
  _$jscoverage['/picker/control.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['162'][1].init(302, 17, 'this.get(\'clear\')');
function visit4_162_1(result) {
  _$jscoverage['/picker/control.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['128'][1].init(43, 18, '!this.get(\'clear\')');
function visit3_128_1(result) {
  _$jscoverage['/picker/control.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['117'][1].init(77, 2, '!v');
function visit2_117_1(result) {
  _$jscoverage['/picker/control.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['75'][1].init(266, 54, 'disabledDate && disabledDate(value, self.get(\'value\'))');
function visit1_75_1(result) {
  _$jscoverage['/picker/control.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].lineData[6]++;
KISSY.add('date/picker/control', function(S, Node, GregorianCalendar, locale, Control, PickerRender, MonthPanel) {
  _$jscoverage['/picker/control.js'].functionData[0]++;
  _$jscoverage['/picker/control.js'].lineData[7]++;
  var tap = Node.Gesture.tap;
  _$jscoverage['/picker/control.js'].lineData[8]++;
  var $ = Node.all;
  _$jscoverage['/picker/control.js'].lineData[9]++;
  var undefined = undefined;
  _$jscoverage['/picker/control.js'].lineData[10]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/picker/control.js'].lineData[12]++;
  function goStartMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[1]++;
    _$jscoverage['/picker/control.js'].lineData[13]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[14]++;
    next.setDayOfMonth(1);
    _$jscoverage['/picker/control.js'].lineData[15]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[18]++;
  function goEndMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[2]++;
    _$jscoverage['/picker/control.js'].lineData[19]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[20]++;
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    _$jscoverage['/picker/control.js'].lineData[21]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[24]++;
  function goMonth(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[3]++;
    _$jscoverage['/picker/control.js'].lineData[25]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[26]++;
    next.addMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[27]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[30]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[4]++;
    _$jscoverage['/picker/control.js'].lineData[31]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[32]++;
    next.addYear(direction);
    _$jscoverage['/picker/control.js'].lineData[33]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[36]++;
  function goWeek(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[5]++;
    _$jscoverage['/picker/control.js'].lineData[37]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[38]++;
    next.addWeekOfYear(direction);
    _$jscoverage['/picker/control.js'].lineData[39]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[42]++;
  function goDay(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[6]++;
    _$jscoverage['/picker/control.js'].lineData[43]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[44]++;
    next.addDayOfMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[45]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[48]++;
  function nextMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[7]++;
    _$jscoverage['/picker/control.js'].lineData[49]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[50]++;
    goMonth(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[53]++;
  function prevMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[8]++;
    _$jscoverage['/picker/control.js'].lineData[54]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[55]++;
    goMonth(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[58]++;
  function nextYear(e) {
    _$jscoverage['/picker/control.js'].functionData[9]++;
    _$jscoverage['/picker/control.js'].lineData[59]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[60]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[63]++;
  function prevYear(e) {
    _$jscoverage['/picker/control.js'].functionData[10]++;
    _$jscoverage['/picker/control.js'].lineData[64]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[65]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[68]++;
  function chooseCell(e) {
    _$jscoverage['/picker/control.js'].functionData[11]++;
    _$jscoverage['/picker/control.js'].lineData[69]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[70]++;
    self.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[71]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker/control.js'].lineData[72]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[73]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/control.js'].lineData[74]++;
    var value = self.dateTable[parseInt(td.attr('data-index'))];
    _$jscoverage['/picker/control.js'].lineData[75]++;
    if (visit1_75_1(disabledDate && disabledDate(value, self.get('value')))) {
      _$jscoverage['/picker/control.js'].lineData[76]++;
      return;
    }
    _$jscoverage['/picker/control.js'].lineData[78]++;
    self.set('value', value);
    _$jscoverage['/picker/control.js'].lineData[79]++;
    self.fire('select', {
  value: value});
  }
  _$jscoverage['/picker/control.js'].lineData[84]++;
  function showMonthPanel(e) {
    _$jscoverage['/picker/control.js'].functionData[12]++;
    _$jscoverage['/picker/control.js'].lineData[85]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[86]++;
    var monthPanel = this.get('monthPanel');
    _$jscoverage['/picker/control.js'].lineData[87]++;
    monthPanel.set('value', this.get('value'));
    _$jscoverage['/picker/control.js'].lineData[88]++;
    monthPanel.show();
  }
  _$jscoverage['/picker/control.js'].lineData[91]++;
  function setUpMonthPanel() {
    _$jscoverage['/picker/control.js'].functionData[13]++;
    _$jscoverage['/picker/control.js'].lineData[92]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[93]++;
    var monthPanel = new MonthPanel({
  locale: this.get('locale'), 
  render: self.get('el')});
    _$jscoverage['/picker/control.js'].lineData[97]++;
    monthPanel.on('select', onMonthPanelSelect, self);
    _$jscoverage['/picker/control.js'].lineData[98]++;
    return monthPanel;
  }
  _$jscoverage['/picker/control.js'].lineData[101]++;
  function onMonthPanelSelect(e) {
    _$jscoverage['/picker/control.js'].functionData[14]++;
    _$jscoverage['/picker/control.js'].lineData[102]++;
    this.set('value', e.value);
    _$jscoverage['/picker/control.js'].lineData[103]++;
    this.get('monthPanel').hide();
  }
  _$jscoverage['/picker/control.js'].lineData[106]++;
  function chooseToday(e) {
    _$jscoverage['/picker/control.js'].functionData[15]++;
    _$jscoverage['/picker/control.js'].lineData[107]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[108]++;
    this.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[109]++;
    var today = this.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[110]++;
    today.setTime(S.now());
    _$jscoverage['/picker/control.js'].lineData[111]++;
    this.set('value', today);
  }
  _$jscoverage['/picker/control.js'].lineData[114]++;
  function toggleClear() {
    _$jscoverage['/picker/control.js'].functionData[16]++;
    _$jscoverage['/picker/control.js'].lineData[115]++;
    var self = this, v = !self.get('clear');
    _$jscoverage['/picker/control.js'].lineData[117]++;
    if (visit2_117_1(!v)) {
      _$jscoverage['/picker/control.js'].lineData[118]++;
      var value = self.get('value');
      _$jscoverage['/picker/control.js'].lineData[119]++;
      value.setDayOfMonth(1);
      _$jscoverage['/picker/control.js'].lineData[120]++;
      self.set('clear', false);
    } else {
      _$jscoverage['/picker/control.js'].lineData[122]++;
      self.set('clear', true);
    }
  }
  _$jscoverage['/picker/control.js'].lineData[126]++;
  function onClearClick(e) {
    _$jscoverage['/picker/control.js'].functionData[17]++;
    _$jscoverage['/picker/control.js'].lineData[127]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[128]++;
    if (visit3_128_1(!this.get('clear'))) {
      _$jscoverage['/picker/control.js'].lineData[129]++;
      toggleClear.call(this);
    }
    _$jscoverage['/picker/control.js'].lineData[131]++;
    this.fire('select', {
  value: null});
  }
  _$jscoverage['/picker/control.js'].lineData[136]++;
  return Control.extend({
  bindUI: function() {
  _$jscoverage['/picker/control.js'].functionData[18]++;
  _$jscoverage['/picker/control.js'].lineData[138]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[139]++;
  self.get('nextMonthBtn').on(tap, nextMonth, self);
  _$jscoverage['/picker/control.js'].lineData[140]++;
  self.get('previousMonthBtn').on(tap, prevMonth, self);
  _$jscoverage['/picker/control.js'].lineData[141]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker/control.js'].lineData[142]++;
  self.get('previousYearBtn').on(tap, prevYear, self);
  _$jscoverage['/picker/control.js'].lineData[143]++;
  self.get('tbodyEl').delegate(tap, '.' + self.view.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker/control.js'].lineData[149]++;
  self.get('monthSelectEl').on(tap, showMonthPanel, self);
  _$jscoverage['/picker/control.js'].lineData[150]++;
  self.get('todayBtnEl').on(tap, chooseToday, self);
  _$jscoverage['/picker/control.js'].lineData[151]++;
  self.get('clearBtnEl').on(tap, onClearClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/picker/control.js'].functionData[19]++;
  _$jscoverage['/picker/control.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[155]++;
  var keyCode = e.keyCode;
  _$jscoverage['/picker/control.js'].lineData[156]++;
  var ctrlKey = e.ctrlKey;
  _$jscoverage['/picker/control.js'].lineData[157]++;
  switch (keyCode) {
    case KeyCode.SPACE:
      _$jscoverage['/picker/control.js'].lineData[159]++;
      self.set('clear', !self.get('clear'));
      _$jscoverage['/picker/control.js'].lineData[160]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[162]++;
  if (visit4_162_1(this.get('clear'))) {
    _$jscoverage['/picker/control.js'].lineData[163]++;
    switch (keyCode) {
      case KeyCode.DOWN:
      case KeyCode.UP:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        _$jscoverage['/picker/control.js'].lineData[168]++;
        if (visit5_168_1(!ctrlKey)) {
          _$jscoverage['/picker/control.js'].lineData[169]++;
          toggleClear.call(self);
        }
        _$jscoverage['/picker/control.js'].lineData[171]++;
        return true;
      case KeyCode.HOME:
        _$jscoverage['/picker/control.js'].lineData[173]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[174]++;
        goStartMonth(self);
        _$jscoverage['/picker/control.js'].lineData[175]++;
        return true;
      case KeyCode.END:
        _$jscoverage['/picker/control.js'].lineData[177]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[178]++;
        goEndMonth(self);
        _$jscoverage['/picker/control.js'].lineData[179]++;
        return true;
      case KeyCode.ENTER:
        _$jscoverage['/picker/control.js'].lineData[181]++;
        self.fire('select', {
  value: null});
        _$jscoverage['/picker/control.js'].lineData[184]++;
        return true;
    }
  }
  _$jscoverage['/picker/control.js'].lineData[187]++;
  switch (keyCode) {
    case KeyCode.DOWN:
      _$jscoverage['/picker/control.js'].lineData[189]++;
      goWeek(self, 1);
      _$jscoverage['/picker/control.js'].lineData[190]++;
      return true;
    case KeyCode.UP:
      _$jscoverage['/picker/control.js'].lineData[192]++;
      goWeek(self, -1);
      _$jscoverage['/picker/control.js'].lineData[193]++;
      return true;
    case KeyCode.LEFT:
      _$jscoverage['/picker/control.js'].lineData[195]++;
      if (visit6_195_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[196]++;
        goYear(self, -1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[198]++;
        goDay(self, -1);
      }
      _$jscoverage['/picker/control.js'].lineData[200]++;
      return true;
    case KeyCode.RIGHT:
      _$jscoverage['/picker/control.js'].lineData[202]++;
      if (visit7_202_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[203]++;
        goYear(self, 1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[205]++;
        goDay(self, 1);
      }
      _$jscoverage['/picker/control.js'].lineData[207]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/picker/control.js'].lineData[209]++;
      goStartMonth(self);
      _$jscoverage['/picker/control.js'].lineData[210]++;
      return true;
    case KeyCode.END:
      _$jscoverage['/picker/control.js'].lineData[212]++;
      goEndMonth(self);
      _$jscoverage['/picker/control.js'].lineData[213]++;
      return true;
    case KeyCode.PAGE_DOWN:
      _$jscoverage['/picker/control.js'].lineData[215]++;
      goMonth(self, 1);
      _$jscoverage['/picker/control.js'].lineData[216]++;
      return true;
    case KeyCode.PAGE_UP:
      _$jscoverage['/picker/control.js'].lineData[218]++;
      goMonth(self, -1);
      _$jscoverage['/picker/control.js'].lineData[219]++;
      return true;
    case KeyCode.ENTER:
      _$jscoverage['/picker/control.js'].lineData[221]++;
      self.fire('select', {
  value: self.get('value')});
      _$jscoverage['/picker/control.js'].lineData[224]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[226]++;
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
  _$jscoverage['/picker/control.js'].lineData[237]++;
  var date = new GregorianCalendar();
  _$jscoverage['/picker/control.js'].lineData[238]++;
  date.setTime(S.now());
  _$jscoverage['/picker/control.js'].lineData[239]++;
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
}, {
  requires: ['node', 'date/gregorian', 'i18n!date/picker', 'component/control', './render', './month-panel/control']});
