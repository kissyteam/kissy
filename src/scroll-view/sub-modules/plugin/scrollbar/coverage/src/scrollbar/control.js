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
if (! _$jscoverage['/scrollbar/control.js']) {
  _$jscoverage['/scrollbar/control.js'] = {};
  _$jscoverage['/scrollbar/control.js'].lineData = [];
  _$jscoverage['/scrollbar/control.js'].lineData[5] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[42] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[97] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[103] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[104] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[124] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[125] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[139] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[140] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[142] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[144] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[153] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[154] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[156] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[160] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[164] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[165] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[166] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[173] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[174] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[176] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[178] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[179] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[180] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[183] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[187] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[188] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[218] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[235] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[237] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[238] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[240] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[247] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[248] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[249] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[251] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].functionData) {
  _$jscoverage['/scrollbar/control.js'].functionData = [];
  _$jscoverage['/scrollbar/control.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[3] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[4] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[5] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[20] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].branchData) {
  _$jscoverage['/scrollbar/control.js'].branchData = {};
  _$jscoverage['/scrollbar/control.js'].branchData['14'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['22'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['24'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['25'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['41'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['49'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['104'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['111'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['121'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['135'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['141'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['165'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['175'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['180'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['187'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['237'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['248'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['248'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['248'][1].init(86, 13, 'v < minLength');
function visit19_248_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['237'][1].init(88, 13, 'v < minLength');
function visit18_237_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['187'][1].init(18, 7, 'this.dd');
function visit17_187_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['180'][1].init(310, 38, 'self.hideFn && !scrollView.isScrolling');
function visit16_180_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['175'][1].init(133, 40, '!scrollView.allowScroll[self.scrollType]');
function visit15_175_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['165'][1].init(48, 11, 'self.hideFn');
function visit14_165_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['141'][2].init(245, 16, 'dragEl == target');
function visit13_141_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['141'][1].init(245, 44, 'dragEl == target || $dragEl.contains(target)');
function visit12_141_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['135'][1].init(48, 20, 'self.get(\'disabled\')');
function visit11_135_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['121'][2].init(300, 22, 'target == self.downBtn');
function visit10_121_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['121'][1].init(300, 56, 'target == self.downBtn || self.$downBtn.contains(target)');
function visit9_121_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['111'][1].init(18, 20, 'this.get(\'disabled\')');
function visit8_111_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['104'][1].init(48, 14, 'self.hideTimer');
function visit7_104_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['49'][1].init(341, 9, 'allowDrag');
function visit6_49_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['41'][1].init(152, 8, 'autoHide');
function visit5_41_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['25'][1].init(293, 20, 'scrollType == \'left\'');
function visit4_25_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['24'][1].init(211, 20, 'scrollType == \'left\'');
function visit3_24_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['22'][1].init(79, 23, 'self.get(\'axis\') == \'x\'');
function visit2_22_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['14'][1].init(172, 69, '!Features.isTouchEventSupported() && !Features.isMsPointerSupported()');
function visit1_14_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[5]++;
KISSY.add('scroll-view/plugin/scrollbar/control', function(S, Node, Control, ScrollBarRender) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[6]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[10]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[12]++;
  var Features = S.Features;
  _$jscoverage['/scrollbar/control.js'].lineData[14]++;
  var allowDrag = visit1_14_1(!Features.isTouchEventSupported() && !Features.isMsPointerSupported());
  _$jscoverage['/scrollbar/control.js'].lineData[19]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[1]++;
  _$jscoverage['/scrollbar/control.js'].lineData[21]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[22]++;
  var scrollType = self.scrollType = visit2_22_1(self.get('axis') == 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[23]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[24]++;
  self.pageXyProperty = visit3_24_1(scrollType == 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[25]++;
  var wh = self.whProperty = visit4_25_1(scrollType == 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[26]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[27]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[28]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[30]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[31]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[33]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[34]++;
  self.scrollWHProperty = 'scroll' + ucWH;
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[2]++;
  _$jscoverage['/scrollbar/control.js'].lineData[38]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.get('scrollView');
  _$jscoverage['/scrollbar/control.js'].lineData[41]++;
  if (visit5_41_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[42]++;
    self.hideFn = S.bind(self.hide, self);
  } else {
    _$jscoverage['/scrollbar/control.js'].lineData[44]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[3]++;
  _$jscoverage['/scrollbar/control.js'].lineData[46]++;
  b.on(Gesture.start, self.onUpDownBtnMouseDown, self).on(Gesture.end, self.onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[48]++;
    self.$trackEl.on(Gesture.start, self.onTrackElMouseDown, self);
    _$jscoverage['/scrollbar/control.js'].lineData[49]++;
    if (visit6_49_1(allowDrag)) {
      _$jscoverage['/scrollbar/control.js'].lineData[50]++;
      S.use('dd', function(S, DD) {
  _$jscoverage['/scrollbar/control.js'].functionData[4]++;
  _$jscoverage['/scrollbar/control.js'].lineData[51]++;
  self.dd = new DD.Draggable({
  node: self.$dragEl, 
  disabled: self.get('disabled'), 
  groups: false, 
  halt: true}).on('drag', self.onDrag, self).on('dragstart', self.onDragStart, self);
});
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[66]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, self.afterScrollChange, self).on('scrollEnd' + SCROLLBAR_EVENT_NS, self.onScrollEnd, self).on('afterDisabledChange', self.onScrollViewDisabled, self);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[5]++;
  _$jscoverage['/scrollbar/control.js'].lineData[71]++;
  this.get('scrollView').detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[72]++;
  this.clearHideTimer();
}, 
  onScrollViewDisabled: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[6]++;
  _$jscoverage['/scrollbar/control.js'].lineData[76]++;
  this.set('disabled', e.newVal);
}, 
  onDragStart: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[7]++;
  _$jscoverage['/scrollbar/control.js'].lineData[80]++;
  var self = this, scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[82]++;
  self.startMousePos = self.dd.get('startMousePos')[self.scrollType];
  _$jscoverage['/scrollbar/control.js'].lineData[83]++;
  self.startScroll = scrollView.get(self.scrollProperty);
}, 
  onDrag: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[8]++;
  _$jscoverage['/scrollbar/control.js'].lineData[87]++;
  var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[92]++;
  scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[93]++;
  scrollView.scrollToWithBounds(scrollCfg);
}, 
  startHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[9]++;
  _$jscoverage['/scrollbar/control.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[98]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[99]++;
  self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
}, 
  clearHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[10]++;
  _$jscoverage['/scrollbar/control.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[104]++;
  if (visit7_104_1(self.hideTimer)) {
    _$jscoverage['/scrollbar/control.js'].lineData[105]++;
    clearTimeout(self.hideTimer);
    _$jscoverage['/scrollbar/control.js'].lineData[106]++;
    self.hideTimer = null;
  }
}, 
  onUpDownBtnMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[11]++;
  _$jscoverage['/scrollbar/control.js'].lineData[111]++;
  if (visit8_111_1(this.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[112]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[114]++;
  e.halt();
  _$jscoverage['/scrollbar/control.js'].lineData[115]++;
  var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit9_121_1(visit10_121_2(target == self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
  _$jscoverage['/scrollbar/control.js'].lineData[122]++;
  clearInterval(self.mouseInterval);
  _$jscoverage['/scrollbar/control.js'].lineData[123]++;
  function doScroll() {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[124]++;
    var scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[125]++;
    scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
    _$jscoverage['/scrollbar/control.js'].lineData[126]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[129]++;
  self.mouseInterval = setInterval(doScroll, 100);
  _$jscoverage['/scrollbar/control.js'].lineData[130]++;
  doScroll();
}, 
  onTrackElMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[13]++;
  _$jscoverage['/scrollbar/control.js'].lineData[134]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[135]++;
  if (visit11_135_1(self.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[138]++;
  var target = e.target;
  _$jscoverage['/scrollbar/control.js'].lineData[139]++;
  var dragEl = self.dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[140]++;
  var $dragEl = self.$dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[141]++;
  if (visit12_141_1(visit13_141_2(dragEl == target) || $dragEl.contains(target))) {
    _$jscoverage['/scrollbar/control.js'].lineData[142]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[144]++;
  var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[153]++;
  scrollCfg[scrollType] = per * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[154]++;
  scrollView.scrollToWithBounds(scrollCfg);
  _$jscoverage['/scrollbar/control.js'].lineData[156]++;
  e.halt();
}, 
  onUpDownBtnMouseUp: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[14]++;
  _$jscoverage['/scrollbar/control.js'].lineData[160]++;
  clearInterval(this.mouseInterval);
}, 
  onScrollEnd: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[164]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[165]++;
  if (visit14_165_1(self.hideFn)) {
    _$jscoverage['/scrollbar/control.js'].lineData[166]++;
    self.startHideTimer();
  }
}, 
  afterScrollChange: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[173]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[174]++;
  var scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[175]++;
  if (visit15_175_1(!scrollView.allowScroll[self.scrollType])) {
    _$jscoverage['/scrollbar/control.js'].lineData[176]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[178]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[179]++;
  self.set('visible', true);
  _$jscoverage['/scrollbar/control.js'].lineData[180]++;
  if (visit16_180_1(self.hideFn && !scrollView.isScrolling)) {
    _$jscoverage['/scrollbar/control.js'].lineData[181]++;
    self.startHideTimer();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[183]++;
  self.view.syncOnScrollChange();
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[187]++;
  if (visit17_187_1(this.dd)) {
    _$jscoverage['/scrollbar/control.js'].lineData[188]++;
    this.dd.set('disabled', v);
  }
}}, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  axis: {
  view: 1}, 
  autoHide: {
  value: S.UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[218]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[235]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[237]++;
  if (visit18_237_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[238]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[240]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[247]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[248]++;
  if (visit19_248_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[249]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[251]++;
  return v;
}, 
  view: 1}, 
  dragLeft: {
  view: 1}, 
  dragTop: {
  view: 1}, 
  dragEl: {}, 
  downBtn: {}, 
  upBtn: {}, 
  trackEl: {}, 
  focusable: {
  value: false}, 
  xrender: {
  value: ScrollBarRender}}, 
  xclass: 'scrollbar'});
}, {
  requires: ['node', 'component/control', './render']});
