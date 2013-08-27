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
  _$jscoverage['/picker/control.js'].lineData[5] = 0;
  _$jscoverage['/picker/control.js'].lineData[6] = 0;
  _$jscoverage['/picker/control.js'].lineData[7] = 0;
  _$jscoverage['/picker/control.js'].lineData[8] = 0;
  _$jscoverage['/picker/control.js'].lineData[9] = 0;
  _$jscoverage['/picker/control.js'].lineData[11] = 0;
  _$jscoverage['/picker/control.js'].lineData[12] = 0;
  _$jscoverage['/picker/control.js'].lineData[13] = 0;
  _$jscoverage['/picker/control.js'].lineData[14] = 0;
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
  _$jscoverage['/picker/control.js'].lineData[52] = 0;
  _$jscoverage['/picker/control.js'].lineData[53] = 0;
  _$jscoverage['/picker/control.js'].lineData[54] = 0;
  _$jscoverage['/picker/control.js'].lineData[57] = 0;
  _$jscoverage['/picker/control.js'].lineData[58] = 0;
  _$jscoverage['/picker/control.js'].lineData[59] = 0;
  _$jscoverage['/picker/control.js'].lineData[62] = 0;
  _$jscoverage['/picker/control.js'].lineData[63] = 0;
  _$jscoverage['/picker/control.js'].lineData[64] = 0;
  _$jscoverage['/picker/control.js'].lineData[67] = 0;
  _$jscoverage['/picker/control.js'].lineData[68] = 0;
  _$jscoverage['/picker/control.js'].lineData[69] = 0;
  _$jscoverage['/picker/control.js'].lineData[70] = 0;
  _$jscoverage['/picker/control.js'].lineData[71] = 0;
  _$jscoverage['/picker/control.js'].lineData[72] = 0;
  _$jscoverage['/picker/control.js'].lineData[73] = 0;
  _$jscoverage['/picker/control.js'].lineData[74] = 0;
  _$jscoverage['/picker/control.js'].lineData[75] = 0;
  _$jscoverage['/picker/control.js'].lineData[77] = 0;
  _$jscoverage['/picker/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/control.js'].lineData[83] = 0;
  _$jscoverage['/picker/control.js'].lineData[84] = 0;
  _$jscoverage['/picker/control.js'].lineData[85] = 0;
  _$jscoverage['/picker/control.js'].lineData[86] = 0;
  _$jscoverage['/picker/control.js'].lineData[87] = 0;
  _$jscoverage['/picker/control.js'].lineData[90] = 0;
  _$jscoverage['/picker/control.js'].lineData[91] = 0;
  _$jscoverage['/picker/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/control.js'].lineData[96] = 0;
  _$jscoverage['/picker/control.js'].lineData[97] = 0;
  _$jscoverage['/picker/control.js'].lineData[100] = 0;
  _$jscoverage['/picker/control.js'].lineData[101] = 0;
  _$jscoverage['/picker/control.js'].lineData[102] = 0;
  _$jscoverage['/picker/control.js'].lineData[105] = 0;
  _$jscoverage['/picker/control.js'].lineData[106] = 0;
  _$jscoverage['/picker/control.js'].lineData[107] = 0;
  _$jscoverage['/picker/control.js'].lineData[108] = 0;
  _$jscoverage['/picker/control.js'].lineData[109] = 0;
  _$jscoverage['/picker/control.js'].lineData[110] = 0;
  _$jscoverage['/picker/control.js'].lineData[113] = 0;
  _$jscoverage['/picker/control.js'].lineData[114] = 0;
  _$jscoverage['/picker/control.js'].lineData[116] = 0;
  _$jscoverage['/picker/control.js'].lineData[117] = 0;
  _$jscoverage['/picker/control.js'].lineData[118] = 0;
  _$jscoverage['/picker/control.js'].lineData[119] = 0;
  _$jscoverage['/picker/control.js'].lineData[121] = 0;
  _$jscoverage['/picker/control.js'].lineData[125] = 0;
  _$jscoverage['/picker/control.js'].lineData[126] = 0;
  _$jscoverage['/picker/control.js'].lineData[127] = 0;
  _$jscoverage['/picker/control.js'].lineData[128] = 0;
  _$jscoverage['/picker/control.js'].lineData[130] = 0;
  _$jscoverage['/picker/control.js'].lineData[135] = 0;
  _$jscoverage['/picker/control.js'].lineData[137] = 0;
  _$jscoverage['/picker/control.js'].lineData[138] = 0;
  _$jscoverage['/picker/control.js'].lineData[139] = 0;
  _$jscoverage['/picker/control.js'].lineData[140] = 0;
  _$jscoverage['/picker/control.js'].lineData[141] = 0;
  _$jscoverage['/picker/control.js'].lineData[142] = 0;
  _$jscoverage['/picker/control.js'].lineData[148] = 0;
  _$jscoverage['/picker/control.js'].lineData[149] = 0;
  _$jscoverage['/picker/control.js'].lineData[150] = 0;
  _$jscoverage['/picker/control.js'].lineData[153] = 0;
  _$jscoverage['/picker/control.js'].lineData[154] = 0;
  _$jscoverage['/picker/control.js'].lineData[155] = 0;
  _$jscoverage['/picker/control.js'].lineData[156] = 0;
  _$jscoverage['/picker/control.js'].lineData[158] = 0;
  _$jscoverage['/picker/control.js'].lineData[159] = 0;
  _$jscoverage['/picker/control.js'].lineData[161] = 0;
  _$jscoverage['/picker/control.js'].lineData[162] = 0;
  _$jscoverage['/picker/control.js'].lineData[167] = 0;
  _$jscoverage['/picker/control.js'].lineData[168] = 0;
  _$jscoverage['/picker/control.js'].lineData[170] = 0;
  _$jscoverage['/picker/control.js'].lineData[172] = 0;
  _$jscoverage['/picker/control.js'].lineData[173] = 0;
  _$jscoverage['/picker/control.js'].lineData[174] = 0;
  _$jscoverage['/picker/control.js'].lineData[176] = 0;
  _$jscoverage['/picker/control.js'].lineData[177] = 0;
  _$jscoverage['/picker/control.js'].lineData[178] = 0;
  _$jscoverage['/picker/control.js'].lineData[180] = 0;
  _$jscoverage['/picker/control.js'].lineData[183] = 0;
  _$jscoverage['/picker/control.js'].lineData[186] = 0;
  _$jscoverage['/picker/control.js'].lineData[188] = 0;
  _$jscoverage['/picker/control.js'].lineData[189] = 0;
  _$jscoverage['/picker/control.js'].lineData[191] = 0;
  _$jscoverage['/picker/control.js'].lineData[192] = 0;
  _$jscoverage['/picker/control.js'].lineData[194] = 0;
  _$jscoverage['/picker/control.js'].lineData[195] = 0;
  _$jscoverage['/picker/control.js'].lineData[197] = 0;
  _$jscoverage['/picker/control.js'].lineData[199] = 0;
  _$jscoverage['/picker/control.js'].lineData[201] = 0;
  _$jscoverage['/picker/control.js'].lineData[202] = 0;
  _$jscoverage['/picker/control.js'].lineData[204] = 0;
  _$jscoverage['/picker/control.js'].lineData[206] = 0;
  _$jscoverage['/picker/control.js'].lineData[208] = 0;
  _$jscoverage['/picker/control.js'].lineData[209] = 0;
  _$jscoverage['/picker/control.js'].lineData[211] = 0;
  _$jscoverage['/picker/control.js'].lineData[212] = 0;
  _$jscoverage['/picker/control.js'].lineData[214] = 0;
  _$jscoverage['/picker/control.js'].lineData[215] = 0;
  _$jscoverage['/picker/control.js'].lineData[217] = 0;
  _$jscoverage['/picker/control.js'].lineData[218] = 0;
  _$jscoverage['/picker/control.js'].lineData[220] = 0;
  _$jscoverage['/picker/control.js'].lineData[223] = 0;
  _$jscoverage['/picker/control.js'].lineData[225] = 0;
  _$jscoverage['/picker/control.js'].lineData[236] = 0;
  _$jscoverage['/picker/control.js'].lineData[237] = 0;
  _$jscoverage['/picker/control.js'].lineData[238] = 0;
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
  _$jscoverage['/picker/control.js'].branchData['74'] = [];
  _$jscoverage['/picker/control.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['116'] = [];
  _$jscoverage['/picker/control.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['127'] = [];
  _$jscoverage['/picker/control.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['161'] = [];
  _$jscoverage['/picker/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['167'] = [];
  _$jscoverage['/picker/control.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['194'] = [];
  _$jscoverage['/picker/control.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/picker/control.js'].branchData['201'] = [];
  _$jscoverage['/picker/control.js'].branchData['201'][1] = new BranchData();
}
_$jscoverage['/picker/control.js'].branchData['201'][1].init(44, 7, 'ctrlKey');
function visit7_201_1(result) {
  _$jscoverage['/picker/control.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['194'][1].init(43, 7, 'ctrlKey');
function visit6_194_1(result) {
  _$jscoverage['/picker/control.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['167'][1].init(48, 8, '!ctrlKey');
function visit5_167_1(result) {
  _$jscoverage['/picker/control.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['161'][1].init(302, 17, 'this.get(\'clear\')');
function visit4_161_1(result) {
  _$jscoverage['/picker/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['127'][1].init(43, 18, '!this.get(\'clear\')');
function visit3_127_1(result) {
  _$jscoverage['/picker/control.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['116'][1].init(77, 2, '!v');
function visit2_116_1(result) {
  _$jscoverage['/picker/control.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].branchData['74'][1].init(266, 54, 'disabledDate && disabledDate(value, self.get(\'value\'))');
function visit1_74_1(result) {
  _$jscoverage['/picker/control.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/control.js'].lineData[5]++;
KISSY.add('date/picker/control', function(S, Node, GregorianCalendar, locale, Control, PickerRender, MonthPanel) {
  _$jscoverage['/picker/control.js'].functionData[0]++;
  _$jscoverage['/picker/control.js'].lineData[6]++;
  var tap = Node.Gesture.tap;
  _$jscoverage['/picker/control.js'].lineData[7]++;
  var $ = Node.all;
  _$jscoverage['/picker/control.js'].lineData[8]++;
  var undefined = undefined;
  _$jscoverage['/picker/control.js'].lineData[9]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/picker/control.js'].lineData[11]++;
  function goStartMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[1]++;
    _$jscoverage['/picker/control.js'].lineData[12]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[13]++;
    next.setDayOfMonth(1);
    _$jscoverage['/picker/control.js'].lineData[14]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[17]++;
  function goEndMonth(self) {
    _$jscoverage['/picker/control.js'].functionData[2]++;
    _$jscoverage['/picker/control.js'].lineData[18]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[19]++;
    next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
    _$jscoverage['/picker/control.js'].lineData[20]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[23]++;
  function goMonth(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[3]++;
    _$jscoverage['/picker/control.js'].lineData[24]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[25]++;
    next.addMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[26]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[29]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[4]++;
    _$jscoverage['/picker/control.js'].lineData[30]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[31]++;
    next.addYear(direction);
    _$jscoverage['/picker/control.js'].lineData[32]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[35]++;
  function goWeek(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[5]++;
    _$jscoverage['/picker/control.js'].lineData[36]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[37]++;
    next.addWeekOfYear(direction);
    _$jscoverage['/picker/control.js'].lineData[38]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[41]++;
  function goDay(self, direction) {
    _$jscoverage['/picker/control.js'].functionData[6]++;
    _$jscoverage['/picker/control.js'].lineData[42]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[43]++;
    next.addDayOfMonth(direction);
    _$jscoverage['/picker/control.js'].lineData[44]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/control.js'].lineData[47]++;
  function nextMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[7]++;
    _$jscoverage['/picker/control.js'].lineData[48]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[49]++;
    goMonth(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[52]++;
  function prevMonth(e) {
    _$jscoverage['/picker/control.js'].functionData[8]++;
    _$jscoverage['/picker/control.js'].lineData[53]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[54]++;
    goMonth(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[57]++;
  function nextYear(e) {
    _$jscoverage['/picker/control.js'].functionData[9]++;
    _$jscoverage['/picker/control.js'].lineData[58]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[59]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker/control.js'].lineData[62]++;
  function prevYear(e) {
    _$jscoverage['/picker/control.js'].functionData[10]++;
    _$jscoverage['/picker/control.js'].lineData[63]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[64]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker/control.js'].lineData[67]++;
  function chooseCell(e) {
    _$jscoverage['/picker/control.js'].functionData[11]++;
    _$jscoverage['/picker/control.js'].lineData[68]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[69]++;
    self.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[70]++;
    var disabledDate = self.get('disabledDate');
    _$jscoverage['/picker/control.js'].lineData[71]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[72]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/control.js'].lineData[73]++;
    var value = self.dateTable[parseInt(td.attr('data-index'))];
    _$jscoverage['/picker/control.js'].lineData[74]++;
    if (visit1_74_1(disabledDate && disabledDate(value, self.get('value')))) {
      _$jscoverage['/picker/control.js'].lineData[75]++;
      return;
    }
    _$jscoverage['/picker/control.js'].lineData[77]++;
    self.set('value', value);
    _$jscoverage['/picker/control.js'].lineData[78]++;
    self.fire('select', {
  value: value});
  }
  _$jscoverage['/picker/control.js'].lineData[83]++;
  function showMonthPanel(e) {
    _$jscoverage['/picker/control.js'].functionData[12]++;
    _$jscoverage['/picker/control.js'].lineData[84]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[85]++;
    var monthPanel = this.get('monthPanel');
    _$jscoverage['/picker/control.js'].lineData[86]++;
    monthPanel.set('value', this.get('value'));
    _$jscoverage['/picker/control.js'].lineData[87]++;
    monthPanel.show();
  }
  _$jscoverage['/picker/control.js'].lineData[90]++;
  function setUpMonthPanel() {
    _$jscoverage['/picker/control.js'].functionData[13]++;
    _$jscoverage['/picker/control.js'].lineData[91]++;
    var self = this;
    _$jscoverage['/picker/control.js'].lineData[92]++;
    var monthPanel = new MonthPanel({
  locale: this.get('locale'), 
  render: self.get('el')});
    _$jscoverage['/picker/control.js'].lineData[96]++;
    monthPanel.on('select', onMonthPanelSelect, self);
    _$jscoverage['/picker/control.js'].lineData[97]++;
    return monthPanel;
  }
  _$jscoverage['/picker/control.js'].lineData[100]++;
  function onMonthPanelSelect(e) {
    _$jscoverage['/picker/control.js'].functionData[14]++;
    _$jscoverage['/picker/control.js'].lineData[101]++;
    this.set('value', e.value);
    _$jscoverage['/picker/control.js'].lineData[102]++;
    this.get('monthPanel').hide();
  }
  _$jscoverage['/picker/control.js'].lineData[105]++;
  function chooseToday(e) {
    _$jscoverage['/picker/control.js'].functionData[15]++;
    _$jscoverage['/picker/control.js'].lineData[106]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[107]++;
    this.set('clear', false);
    _$jscoverage['/picker/control.js'].lineData[108]++;
    var today = this.get('value').clone();
    _$jscoverage['/picker/control.js'].lineData[109]++;
    today.setTime(S.now());
    _$jscoverage['/picker/control.js'].lineData[110]++;
    this.set('value', today);
  }
  _$jscoverage['/picker/control.js'].lineData[113]++;
  function toggleClear() {
    _$jscoverage['/picker/control.js'].functionData[16]++;
    _$jscoverage['/picker/control.js'].lineData[114]++;
    var self = this, v = !self.get('clear');
    _$jscoverage['/picker/control.js'].lineData[116]++;
    if (visit2_116_1(!v)) {
      _$jscoverage['/picker/control.js'].lineData[117]++;
      var value = self.get('value');
      _$jscoverage['/picker/control.js'].lineData[118]++;
      value.setDayOfMonth(1);
      _$jscoverage['/picker/control.js'].lineData[119]++;
      self.set('clear', false);
    } else {
      _$jscoverage['/picker/control.js'].lineData[121]++;
      self.set('clear', true);
    }
  }
  _$jscoverage['/picker/control.js'].lineData[125]++;
  function onClearClick(e) {
    _$jscoverage['/picker/control.js'].functionData[17]++;
    _$jscoverage['/picker/control.js'].lineData[126]++;
    e.preventDefault();
    _$jscoverage['/picker/control.js'].lineData[127]++;
    if (visit3_127_1(!this.get('clear'))) {
      _$jscoverage['/picker/control.js'].lineData[128]++;
      toggleClear.call(this);
    }
    _$jscoverage['/picker/control.js'].lineData[130]++;
    this.fire('select', {
  value: null});
  }
  _$jscoverage['/picker/control.js'].lineData[135]++;
  return Control.extend({
  bindUI: function() {
  _$jscoverage['/picker/control.js'].functionData[18]++;
  _$jscoverage['/picker/control.js'].lineData[137]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[138]++;
  self.get('nextMonthBtn').on(tap, nextMonth, self);
  _$jscoverage['/picker/control.js'].lineData[139]++;
  self.get('previousMonthBtn').on(tap, prevMonth, self);
  _$jscoverage['/picker/control.js'].lineData[140]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker/control.js'].lineData[141]++;
  self.get('previousYearBtn').on(tap, prevYear, self);
  _$jscoverage['/picker/control.js'].lineData[142]++;
  self.get('tbodyEl').delegate(tap, '.' + self.view.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker/control.js'].lineData[148]++;
  self.get('monthSelectEl').on(tap, showMonthPanel, self);
  _$jscoverage['/picker/control.js'].lineData[149]++;
  self.get('todayBtnEl').on(tap, chooseToday, self);
  _$jscoverage['/picker/control.js'].lineData[150]++;
  self.get('clearBtnEl').on(tap, onClearClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/picker/control.js'].functionData[19]++;
  _$jscoverage['/picker/control.js'].lineData[153]++;
  var self = this;
  _$jscoverage['/picker/control.js'].lineData[154]++;
  var keyCode = e.keyCode;
  _$jscoverage['/picker/control.js'].lineData[155]++;
  var ctrlKey = e.ctrlKey;
  _$jscoverage['/picker/control.js'].lineData[156]++;
  switch (keyCode) {
    case KeyCode.SPACE:
      _$jscoverage['/picker/control.js'].lineData[158]++;
      self.set('clear', !self.get('clear'));
      _$jscoverage['/picker/control.js'].lineData[159]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[161]++;
  if (visit4_161_1(this.get('clear'))) {
    _$jscoverage['/picker/control.js'].lineData[162]++;
    switch (keyCode) {
      case KeyCode.DOWN:
      case KeyCode.UP:
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        _$jscoverage['/picker/control.js'].lineData[167]++;
        if (visit5_167_1(!ctrlKey)) {
          _$jscoverage['/picker/control.js'].lineData[168]++;
          toggleClear.call(self);
        }
        _$jscoverage['/picker/control.js'].lineData[170]++;
        return true;
      case KeyCode.HOME:
        _$jscoverage['/picker/control.js'].lineData[172]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[173]++;
        goStartMonth(self);
        _$jscoverage['/picker/control.js'].lineData[174]++;
        return true;
      case KeyCode.END:
        _$jscoverage['/picker/control.js'].lineData[176]++;
        toggleClear.call(self);
        _$jscoverage['/picker/control.js'].lineData[177]++;
        goEndMonth(self);
        _$jscoverage['/picker/control.js'].lineData[178]++;
        return true;
      case KeyCode.ENTER:
        _$jscoverage['/picker/control.js'].lineData[180]++;
        self.fire('select', {
  value: null});
        _$jscoverage['/picker/control.js'].lineData[183]++;
        return true;
    }
  }
  _$jscoverage['/picker/control.js'].lineData[186]++;
  switch (keyCode) {
    case KeyCode.DOWN:
      _$jscoverage['/picker/control.js'].lineData[188]++;
      goWeek(self, 1);
      _$jscoverage['/picker/control.js'].lineData[189]++;
      return true;
    case KeyCode.UP:
      _$jscoverage['/picker/control.js'].lineData[191]++;
      goWeek(self, -1);
      _$jscoverage['/picker/control.js'].lineData[192]++;
      return true;
    case KeyCode.LEFT:
      _$jscoverage['/picker/control.js'].lineData[194]++;
      if (visit6_194_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[195]++;
        goYear(self, -1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[197]++;
        goDay(self, -1);
      }
      _$jscoverage['/picker/control.js'].lineData[199]++;
      return true;
    case KeyCode.RIGHT:
      _$jscoverage['/picker/control.js'].lineData[201]++;
      if (visit7_201_1(ctrlKey)) {
        _$jscoverage['/picker/control.js'].lineData[202]++;
        goYear(self, 1);
      } else {
        _$jscoverage['/picker/control.js'].lineData[204]++;
        goDay(self, 1);
      }
      _$jscoverage['/picker/control.js'].lineData[206]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/picker/control.js'].lineData[208]++;
      goStartMonth(self);
      _$jscoverage['/picker/control.js'].lineData[209]++;
      return true;
    case KeyCode.END:
      _$jscoverage['/picker/control.js'].lineData[211]++;
      goEndMonth(self);
      _$jscoverage['/picker/control.js'].lineData[212]++;
      return true;
    case KeyCode.PAGE_DOWN:
      _$jscoverage['/picker/control.js'].lineData[214]++;
      goMonth(self, 1);
      _$jscoverage['/picker/control.js'].lineData[215]++;
      return true;
    case KeyCode.PAGE_UP:
      _$jscoverage['/picker/control.js'].lineData[217]++;
      goMonth(self, -1);
      _$jscoverage['/picker/control.js'].lineData[218]++;
      return true;
    case KeyCode.ENTER:
      _$jscoverage['/picker/control.js'].lineData[220]++;
      self.fire('select', {
  value: self.get('value')});
      _$jscoverage['/picker/control.js'].lineData[223]++;
      return true;
  }
  _$jscoverage['/picker/control.js'].lineData[225]++;
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
  _$jscoverage['/picker/control.js'].lineData[236]++;
  var date = new GregorianCalendar();
  _$jscoverage['/picker/control.js'].lineData[237]++;
  date.setTime(S.now());
  _$jscoverage['/picker/control.js'].lineData[238]++;
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
