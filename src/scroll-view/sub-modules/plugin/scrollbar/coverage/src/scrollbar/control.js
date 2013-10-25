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
  _$jscoverage['/scrollbar/control.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[75] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[96] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[107] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[125] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[127] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[128] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[139] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[142] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[143] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[144] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[145] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[147] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[156] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[157] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[159] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[163] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[167] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[168] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[169] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[176] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[177] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[178] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[179] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[182] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[183] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[184] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[186] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[190] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[191] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[229] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[246] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[248] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[249] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[251] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[258] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[259] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[260] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[262] = 0;
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
  _$jscoverage['/scrollbar/control.js'].branchData['15'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['25'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['27'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['28'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['44'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['52'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['107'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['114'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['124'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['138'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['144'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['168'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['178'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['183'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['190'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['248'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['259'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['259'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['259'][1].init(86, 13, 'v < minLength');
function visit19_259_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['248'][1].init(88, 13, 'v < minLength');
function visit18_248_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['190'][1].init(18, 7, 'this.dd');
function visit17_190_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['183'][1].init(310, 38, 'self.hideFn && !scrollView.isScrolling');
function visit16_183_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['178'][1].init(133, 40, '!scrollView.allowScroll[self.scrollType]');
function visit15_178_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['168'][1].init(48, 11, 'self.hideFn');
function visit14_168_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['144'][2].init(245, 16, 'dragEl == target');
function visit13_144_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['144'][1].init(245, 44, 'dragEl == target || $dragEl.contains(target)');
function visit12_144_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['138'][1].init(48, 20, 'self.get(\'disabled\')');
function visit11_138_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['124'][2].init(300, 22, 'target == self.downBtn');
function visit10_124_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['124'][1].init(300, 56, 'target == self.downBtn || self.$downBtn.contains(target)');
function visit9_124_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['114'][1].init(18, 20, 'this.get(\'disabled\')');
function visit8_114_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['107'][1].init(48, 14, 'self.hideTimer');
function visit7_107_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['52'][1].init(341, 9, 'allowDrag');
function visit6_52_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['44'][1].init(152, 8, 'autoHide');
function visit5_44_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['28'][1].init(293, 20, 'scrollType == \'left\'');
function visit4_28_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['27'][1].init(211, 20, 'scrollType == \'left\'');
function visit3_27_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['25'][1].init(79, 23, 'self.get(\'axis\') == \'x\'');
function visit2_25_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['15'][1].init(172, 69, '!Features.isTouchEventSupported() && !Features.isMsPointerSupported()');
function visit1_15_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add('scroll-view/plugin/scrollbar/control', function(S, Node, Control, ScrollBarRender) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[11]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[13]++;
  var Features = S.Features;
  _$jscoverage['/scrollbar/control.js'].lineData[15]++;
  var allowDrag = visit1_15_1(!Features.isTouchEventSupported() && !Features.isMsPointerSupported());
  _$jscoverage['/scrollbar/control.js'].lineData[22]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[1]++;
  _$jscoverage['/scrollbar/control.js'].lineData[24]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[25]++;
  var scrollType = self.scrollType = visit2_25_1(self.get('axis') == 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[26]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[27]++;
  self.pageXyProperty = visit3_27_1(scrollType == 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[28]++;
  var wh = self.whProperty = visit4_28_1(scrollType == 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[29]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[30]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[31]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[33]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[34]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[36]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[37]++;
  self.scrollWHProperty = 'scroll' + ucWH;
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[2]++;
  _$jscoverage['/scrollbar/control.js'].lineData[41]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.get('scrollView');
  _$jscoverage['/scrollbar/control.js'].lineData[44]++;
  if (visit5_44_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[45]++;
    self.hideFn = S.bind(self.hide, self);
  } else {
    _$jscoverage['/scrollbar/control.js'].lineData[47]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[3]++;
  _$jscoverage['/scrollbar/control.js'].lineData[49]++;
  b.on(Gesture.start, self.onUpDownBtnMouseDown, self).on(Gesture.end, self.onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[51]++;
    self.$trackEl.on(Gesture.start, self.onTrackElMouseDown, self);
    _$jscoverage['/scrollbar/control.js'].lineData[52]++;
    if (visit6_52_1(allowDrag)) {
      _$jscoverage['/scrollbar/control.js'].lineData[53]++;
      S.use('dd', function(S, DD) {
  _$jscoverage['/scrollbar/control.js'].functionData[4]++;
  _$jscoverage['/scrollbar/control.js'].lineData[54]++;
  self.dd = new DD.Draggable({
  node: self.$dragEl, 
  disabled: self.get('disabled'), 
  groups: false, 
  halt: true}).on('drag', self.onDrag, self).on('dragstart', self.onDragStart, self);
});
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[69]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, self.afterScrollChange, self).on('scrollEnd' + SCROLLBAR_EVENT_NS, self.onScrollEnd, self).on('afterDisabledChange', self.onScrollViewDisabled, self);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[5]++;
  _$jscoverage['/scrollbar/control.js'].lineData[74]++;
  this.get('scrollView').detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[75]++;
  this.clearHideTimer();
}, 
  onScrollViewDisabled: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[6]++;
  _$jscoverage['/scrollbar/control.js'].lineData[79]++;
  this.set('disabled', e.newVal);
}, 
  onDragStart: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[7]++;
  _$jscoverage['/scrollbar/control.js'].lineData[83]++;
  var self = this, scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[85]++;
  self.startMousePos = self.dd.get('startMousePos')[self.scrollType];
  _$jscoverage['/scrollbar/control.js'].lineData[86]++;
  self.startScroll = scrollView.get(self.scrollProperty);
}, 
  onDrag: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[8]++;
  _$jscoverage['/scrollbar/control.js'].lineData[90]++;
  var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[95]++;
  scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[96]++;
  scrollView.scrollToWithBounds(scrollCfg);
}, 
  startHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[9]++;
  _$jscoverage['/scrollbar/control.js'].lineData[100]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[101]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[102]++;
  self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
}, 
  clearHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[10]++;
  _$jscoverage['/scrollbar/control.js'].lineData[106]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[107]++;
  if (visit7_107_1(self.hideTimer)) {
    _$jscoverage['/scrollbar/control.js'].lineData[108]++;
    clearTimeout(self.hideTimer);
    _$jscoverage['/scrollbar/control.js'].lineData[109]++;
    self.hideTimer = null;
  }
}, 
  onUpDownBtnMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[11]++;
  _$jscoverage['/scrollbar/control.js'].lineData[114]++;
  if (visit8_114_1(this.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[115]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[117]++;
  e.halt();
  _$jscoverage['/scrollbar/control.js'].lineData[118]++;
  var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit9_124_1(visit10_124_2(target == self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
  _$jscoverage['/scrollbar/control.js'].lineData[125]++;
  clearInterval(self.mouseInterval);
  _$jscoverage['/scrollbar/control.js'].lineData[126]++;
  function doScroll() {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[127]++;
    var scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[128]++;
    scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
    _$jscoverage['/scrollbar/control.js'].lineData[129]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[132]++;
  self.mouseInterval = setInterval(doScroll, 100);
  _$jscoverage['/scrollbar/control.js'].lineData[133]++;
  doScroll();
}, 
  onTrackElMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[13]++;
  _$jscoverage['/scrollbar/control.js'].lineData[137]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[138]++;
  if (visit11_138_1(self.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[139]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[141]++;
  var target = e.target;
  _$jscoverage['/scrollbar/control.js'].lineData[142]++;
  var dragEl = self.dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[143]++;
  var $dragEl = self.$dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[144]++;
  if (visit12_144_1(visit13_144_2(dragEl == target) || $dragEl.contains(target))) {
    _$jscoverage['/scrollbar/control.js'].lineData[145]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[147]++;
  var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[156]++;
  scrollCfg[scrollType] = per * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[157]++;
  scrollView.scrollToWithBounds(scrollCfg);
  _$jscoverage['/scrollbar/control.js'].lineData[159]++;
  e.halt();
}, 
  onUpDownBtnMouseUp: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[14]++;
  _$jscoverage['/scrollbar/control.js'].lineData[163]++;
  clearInterval(this.mouseInterval);
}, 
  onScrollEnd: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[168]++;
  if (visit14_168_1(self.hideFn)) {
    _$jscoverage['/scrollbar/control.js'].lineData[169]++;
    self.startHideTimer();
  }
}, 
  afterScrollChange: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[176]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[177]++;
  var scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[178]++;
  if (visit15_178_1(!scrollView.allowScroll[self.scrollType])) {
    _$jscoverage['/scrollbar/control.js'].lineData[179]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[181]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[182]++;
  self.set('visible', true);
  _$jscoverage['/scrollbar/control.js'].lineData[183]++;
  if (visit16_183_1(self.hideFn && !scrollView.isScrolling)) {
    _$jscoverage['/scrollbar/control.js'].lineData[184]++;
    self.startHideTimer();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[186]++;
  self.view.syncOnScrollChange();
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[190]++;
  if (visit17_190_1(this.dd)) {
    _$jscoverage['/scrollbar/control.js'].lineData[191]++;
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
  _$jscoverage['/scrollbar/control.js'].lineData[229]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[246]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[248]++;
  if (visit18_248_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[249]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[251]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[258]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[259]++;
  if (visit19_259_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[260]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[262]++;
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
