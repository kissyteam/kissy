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
  _$jscoverage['/scrollbar/control.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[20] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[42] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[43] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[97] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[120] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[124] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[128] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[147] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[148] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[150] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[154] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[158] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[159] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[160] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[167] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[168] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[169] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[170] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[172] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[173] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[174] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[177] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[182] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[216] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[233] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[235] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[236] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[238] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[245] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[246] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[247] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[249] = 0;
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
  _$jscoverage['/scrollbar/control.js'].branchData['16'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['18'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['19'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['35'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['43'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['98'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['105'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['115'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['129'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['135'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['159'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['169'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['174'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['181'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['235'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['246'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['246'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['246'][1].init(86, 13, 'v < minLength');
function visit18_246_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['235'][1].init(88, 13, 'v < minLength');
function visit17_235_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['181'][1].init(18, 7, 'this.dd');
function visit16_181_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['174'][1].init(310, 38, 'self.hideFn && !scrollView.isScrolling');
function visit15_174_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['169'][1].init(133, 40, '!scrollView.allowScroll[self.scrollType]');
function visit14_169_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['159'][1].init(48, 11, 'self.hideFn');
function visit13_159_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['135'][2].init(245, 16, 'dragEl == target');
function visit12_135_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['135'][1].init(245, 44, 'dragEl == target || $dragEl.contains(target)');
function visit11_135_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['129'][1].init(48, 20, 'self.get(\'disabled\')');
function visit10_129_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['115'][2].init(300, 22, 'target == self.downBtn');
function visit9_115_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['115'][1].init(300, 56, 'target == self.downBtn || self.$downBtn.contains(target)');
function visit8_115_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['105'][1].init(18, 20, 'this.get(\'disabled\')');
function visit7_105_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['98'][1].init(48, 14, 'self.hideTimer');
function visit6_98_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['43'][1].init(341, 21, 'self.get(\'allowDrag\')');
function visit5_43_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['35'][1].init(152, 8, 'autoHide');
function visit4_35_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['19'][1].init(293, 20, 'scrollType == \'left\'');
function visit3_19_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['18'][1].init(211, 20, 'scrollType == \'left\'');
function visit2_18_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['16'][1].init(79, 23, 'self.get(\'axis\') == \'x\'');
function visit1_16_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[5]++;
KISSY.add('scroll-view/plugin/scrollbar/control', function(S, Node, Control, ScrollBarRender) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[11]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[13]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[1]++;
  _$jscoverage['/scrollbar/control.js'].lineData[15]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[16]++;
  var scrollType = self.scrollType = visit1_16_1(self.get('axis') == 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[17]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[18]++;
  self.pageXyProperty = visit2_18_1(scrollType == 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[19]++;
  var wh = self.whProperty = visit3_19_1(scrollType == 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[20]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[21]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[22]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[24]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[25]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[27]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[28]++;
  self.scrollWHProperty = 'scroll' + ucWH;
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[2]++;
  _$jscoverage['/scrollbar/control.js'].lineData[32]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.get('scrollView');
  _$jscoverage['/scrollbar/control.js'].lineData[35]++;
  if (visit4_35_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[36]++;
    self.hideFn = S.bind(self.hide, self);
  } else {
    _$jscoverage['/scrollbar/control.js'].lineData[38]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[3]++;
  _$jscoverage['/scrollbar/control.js'].lineData[40]++;
  b.on(Gesture.start, self.onUpDownBtnMouseDown, self).on(Gesture.end, self.onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[42]++;
    self.$trackEl.on(Gesture.start, self.onTrackElMouseDown, self);
    _$jscoverage['/scrollbar/control.js'].lineData[43]++;
    if (visit5_43_1(self.get('allowDrag'))) {
      _$jscoverage['/scrollbar/control.js'].lineData[44]++;
      S.use('dd', function(S, DD) {
  _$jscoverage['/scrollbar/control.js'].functionData[4]++;
  _$jscoverage['/scrollbar/control.js'].lineData[45]++;
  self.dd = new DD.Draggable({
  node: self.$dragEl, 
  disabled: self.get('disabled'), 
  groups: false, 
  halt: true}).on('drag', self.onDrag, self).on('dragstart', self.onDragStart, self);
});
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[60]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, self.afterScrollChange, self).on('scrollEnd' + SCROLLBAR_EVENT_NS, self.onScrollEnd, self).on('afterDisabledChange', self.onScrollViewDisabled, self);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[5]++;
  _$jscoverage['/scrollbar/control.js'].lineData[65]++;
  this.get('scrollView').detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[66]++;
  this.clearHideTimer();
}, 
  onScrollViewDisabled: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[6]++;
  _$jscoverage['/scrollbar/control.js'].lineData[70]++;
  this.set('disabled', e.newVal);
}, 
  onDragStart: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[7]++;
  _$jscoverage['/scrollbar/control.js'].lineData[74]++;
  var self = this, scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[76]++;
  self.startMousePos = self.dd.get('startMousePos')[self.scrollType];
  _$jscoverage['/scrollbar/control.js'].lineData[77]++;
  self.startScroll = scrollView.get(self.scrollProperty);
}, 
  onDrag: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[8]++;
  _$jscoverage['/scrollbar/control.js'].lineData[81]++;
  var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[86]++;
  scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[87]++;
  scrollView.scrollToWithBounds(scrollCfg);
}, 
  startHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[9]++;
  _$jscoverage['/scrollbar/control.js'].lineData[91]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[92]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[93]++;
  self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
}, 
  clearHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[10]++;
  _$jscoverage['/scrollbar/control.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[98]++;
  if (visit6_98_1(self.hideTimer)) {
    _$jscoverage['/scrollbar/control.js'].lineData[99]++;
    clearTimeout(self.hideTimer);
    _$jscoverage['/scrollbar/control.js'].lineData[100]++;
    self.hideTimer = null;
  }
}, 
  onUpDownBtnMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[11]++;
  _$jscoverage['/scrollbar/control.js'].lineData[105]++;
  if (visit7_105_1(this.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[106]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[108]++;
  e.halt();
  _$jscoverage['/scrollbar/control.js'].lineData[109]++;
  var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit8_115_1(visit9_115_2(target == self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
  _$jscoverage['/scrollbar/control.js'].lineData[116]++;
  clearInterval(self.mouseInterval);
  _$jscoverage['/scrollbar/control.js'].lineData[117]++;
  function doScroll() {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[118]++;
    var scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[119]++;
    scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
    _$jscoverage['/scrollbar/control.js'].lineData[120]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[123]++;
  self.mouseInterval = setInterval(doScroll, 100);
  _$jscoverage['/scrollbar/control.js'].lineData[124]++;
  doScroll();
}, 
  onTrackElMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[13]++;
  _$jscoverage['/scrollbar/control.js'].lineData[128]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[129]++;
  if (visit10_129_1(self.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[130]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[132]++;
  var target = e.target;
  _$jscoverage['/scrollbar/control.js'].lineData[133]++;
  var dragEl = self.dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[134]++;
  var $dragEl = self.$dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[135]++;
  if (visit11_135_1(visit12_135_2(dragEl == target) || $dragEl.contains(target))) {
    _$jscoverage['/scrollbar/control.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[138]++;
  var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[147]++;
  scrollCfg[scrollType] = per * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[148]++;
  scrollView.scrollToWithBounds(scrollCfg);
  _$jscoverage['/scrollbar/control.js'].lineData[150]++;
  e.halt();
}, 
  onUpDownBtnMouseUp: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[14]++;
  _$jscoverage['/scrollbar/control.js'].lineData[154]++;
  clearInterval(this.mouseInterval);
}, 
  onScrollEnd: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[158]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[159]++;
  if (visit13_159_1(self.hideFn)) {
    _$jscoverage['/scrollbar/control.js'].lineData[160]++;
    self.startHideTimer();
  }
}, 
  afterScrollChange: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[168]++;
  var scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[169]++;
  if (visit14_169_1(!scrollView.allowScroll[self.scrollType])) {
    _$jscoverage['/scrollbar/control.js'].lineData[170]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[172]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[173]++;
  self.set('visible', true);
  _$jscoverage['/scrollbar/control.js'].lineData[174]++;
  if (visit15_174_1(self.hideFn && !scrollView.isScrolling)) {
    _$jscoverage['/scrollbar/control.js'].lineData[175]++;
    self.startHideTimer();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[177]++;
  self.view.syncOnScrollChange();
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[181]++;
  if (visit16_181_1(this.dd)) {
    _$jscoverage['/scrollbar/control.js'].lineData[182]++;
    this.dd.set('disabled', v);
  }
}}, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  allowDrag: {
  value: false}, 
  axis: {
  view: 1}, 
  autoHide: {
  value: S.UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[216]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[233]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[235]++;
  if (visit17_235_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[236]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[238]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[245]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[246]++;
  if (visit18_246_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[247]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[249]++;
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
