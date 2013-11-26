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
  _$jscoverage['/scrollbar/control.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[104] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[121] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[131] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[142] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[143] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[145] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[146] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[147] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[148] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[149] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[151] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[160] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[161] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[163] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[167] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[171] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[172] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[173] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[180] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[182] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[183] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[185] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[186] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[187] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[188] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[190] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[194] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[195] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[233] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[250] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[252] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[253] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[255] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[262] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[263] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[264] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[266] = 0;
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
  _$jscoverage['/scrollbar/control.js'].branchData['29'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['31'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['32'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['48'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['56'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['111'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['118'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['128'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['142'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['148'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['172'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['182'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['187'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['194'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['252'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['263'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['263'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['263'][1].init(84, 13, 'v < minLength');
function visit18_263_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['252'][1].init(85, 13, 'v < minLength');
function visit17_252_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['194'][1].init(17, 7, 'this.dd');
function visit16_194_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['187'][1].init(301, 38, 'self.hideFn && !scrollView.isScrolling');
function visit15_187_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['182'][1].init(129, 40, '!scrollView.allowScroll[self.scrollType]');
function visit14_182_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['172'][1].init(46, 11, 'self.hideFn');
function visit13_172_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['148'][2].init(237, 16, 'dragEl == target');
function visit12_148_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['148'][1].init(237, 44, 'dragEl == target || $dragEl.contains(target)');
function visit11_148_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['142'][1].init(46, 20, 'self.get(\'disabled\')');
function visit10_142_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['128'][2].init(294, 22, 'target == self.downBtn');
function visit9_128_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['128'][1].init(294, 56, 'target == self.downBtn || self.$downBtn.contains(target)');
function visit8_128_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['118'][1].init(17, 20, 'this.get(\'disabled\')');
function visit7_118_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['111'][1].init(46, 14, 'self.hideTimer');
function visit6_111_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['56'][1].init(335, 9, 'allowDrag');
function visit5_56_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['48'][1].init(148, 8, 'autoHide');
function visit4_48_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['32'][1].init(288, 20, 'scrollType == \'left\'');
function visit3_32_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['31'][1].init(207, 20, 'scrollType == \'left\'');
function visit2_31_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['29'][1].init(77, 23, 'self.get(\'axis\') == \'x\'');
function visit1_29_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var ScrollBarRender = require('./render');
  _$jscoverage['/scrollbar/control.js'].lineData[11]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[13]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[15]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[17]++;
  var Features = S.Features;
  _$jscoverage['/scrollbar/control.js'].lineData[19]++;
  var allowDrag = !Features.isTouchGestureSupported();
  _$jscoverage['/scrollbar/control.js'].lineData[26]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[1]++;
  _$jscoverage['/scrollbar/control.js'].lineData[28]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[29]++;
  var scrollType = self.scrollType = visit1_29_1(self.get('axis') == 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[30]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[31]++;
  self.pageXyProperty = visit2_31_1(scrollType == 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[32]++;
  var wh = self.whProperty = visit3_32_1(scrollType == 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[33]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[34]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[35]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[37]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[38]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[40]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[41]++;
  self.scrollWHProperty = 'scroll' + ucWH;
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[2]++;
  _$jscoverage['/scrollbar/control.js'].lineData[45]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.get('scrollView');
  _$jscoverage['/scrollbar/control.js'].lineData[48]++;
  if (visit4_48_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[49]++;
    self.hideFn = S.bind(self.hide, self);
  } else {
    _$jscoverage['/scrollbar/control.js'].lineData[51]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[3]++;
  _$jscoverage['/scrollbar/control.js'].lineData[53]++;
  b.on(Gesture.start, self.onUpDownBtnMouseDown, self).on(Gesture.end, self.onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[55]++;
    self.$trackEl.on(Gesture.start, self.onTrackElMouseDown, self);
    _$jscoverage['/scrollbar/control.js'].lineData[56]++;
    if (visit5_56_1(allowDrag)) {
      _$jscoverage['/scrollbar/control.js'].lineData[57]++;
      S.use('dd', function(S, DD) {
  _$jscoverage['/scrollbar/control.js'].functionData[4]++;
  _$jscoverage['/scrollbar/control.js'].lineData[58]++;
  self.dd = new DD.Draggable({
  node: self.$dragEl, 
  disabled: self.get('disabled'), 
  groups: false, 
  halt: true}).on('drag', self.onDrag, self).on('dragstart', self.onDragStart, self);
});
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[73]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, self.afterScrollChange, self).on('scrollEnd' + SCROLLBAR_EVENT_NS, self.onScrollEnd, self).on('afterDisabledChange', self.onScrollViewDisabled, self);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[5]++;
  _$jscoverage['/scrollbar/control.js'].lineData[78]++;
  this.get('scrollView').detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[79]++;
  this.clearHideTimer();
}, 
  onScrollViewDisabled: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[6]++;
  _$jscoverage['/scrollbar/control.js'].lineData[83]++;
  this.set('disabled', e.newVal);
}, 
  onDragStart: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[7]++;
  _$jscoverage['/scrollbar/control.js'].lineData[87]++;
  var self = this, scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[89]++;
  self.startMousePos = self.dd.get('startMousePos')[self.scrollType];
  _$jscoverage['/scrollbar/control.js'].lineData[90]++;
  self.startScroll = scrollView.get(self.scrollProperty);
}, 
  onDrag: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[8]++;
  _$jscoverage['/scrollbar/control.js'].lineData[94]++;
  var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[99]++;
  scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[100]++;
  scrollView.scrollToWithBounds(scrollCfg);
}, 
  startHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[9]++;
  _$jscoverage['/scrollbar/control.js'].lineData[104]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[105]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[106]++;
  self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
}, 
  clearHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[10]++;
  _$jscoverage['/scrollbar/control.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[111]++;
  if (visit6_111_1(self.hideTimer)) {
    _$jscoverage['/scrollbar/control.js'].lineData[112]++;
    clearTimeout(self.hideTimer);
    _$jscoverage['/scrollbar/control.js'].lineData[113]++;
    self.hideTimer = null;
  }
}, 
  onUpDownBtnMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[11]++;
  _$jscoverage['/scrollbar/control.js'].lineData[118]++;
  if (visit7_118_1(this.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[119]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[121]++;
  e.halt();
  _$jscoverage['/scrollbar/control.js'].lineData[122]++;
  var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit8_128_1(visit9_128_2(target == self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
  _$jscoverage['/scrollbar/control.js'].lineData[129]++;
  clearInterval(self.mouseInterval);
  _$jscoverage['/scrollbar/control.js'].lineData[130]++;
  function doScroll() {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[131]++;
    var scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[132]++;
    scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
    _$jscoverage['/scrollbar/control.js'].lineData[133]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[136]++;
  self.mouseInterval = setInterval(doScroll, 100);
  _$jscoverage['/scrollbar/control.js'].lineData[137]++;
  doScroll();
}, 
  onTrackElMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[13]++;
  _$jscoverage['/scrollbar/control.js'].lineData[141]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[142]++;
  if (visit10_142_1(self.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[143]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[145]++;
  var target = e.target;
  _$jscoverage['/scrollbar/control.js'].lineData[146]++;
  var dragEl = self.dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[147]++;
  var $dragEl = self.$dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[148]++;
  if (visit11_148_1(visit12_148_2(dragEl == target) || $dragEl.contains(target))) {
    _$jscoverage['/scrollbar/control.js'].lineData[149]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[151]++;
  var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[160]++;
  scrollCfg[scrollType] = per * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[161]++;
  scrollView.scrollToWithBounds(scrollCfg);
  _$jscoverage['/scrollbar/control.js'].lineData[163]++;
  e.halt();
}, 
  onUpDownBtnMouseUp: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[14]++;
  _$jscoverage['/scrollbar/control.js'].lineData[167]++;
  clearInterval(this.mouseInterval);
}, 
  onScrollEnd: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[171]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[172]++;
  if (visit13_172_1(self.hideFn)) {
    _$jscoverage['/scrollbar/control.js'].lineData[173]++;
    self.startHideTimer();
  }
}, 
  afterScrollChange: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[180]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[181]++;
  var scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[182]++;
  if (visit14_182_1(!scrollView.allowScroll[self.scrollType])) {
    _$jscoverage['/scrollbar/control.js'].lineData[183]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[185]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[186]++;
  self.set('visible', true);
  _$jscoverage['/scrollbar/control.js'].lineData[187]++;
  if (visit15_187_1(self.hideFn && !scrollView.isScrolling)) {
    _$jscoverage['/scrollbar/control.js'].lineData[188]++;
    self.startHideTimer();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[190]++;
  self.view.syncOnScrollChange();
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[194]++;
  if (visit16_194_1(this.dd)) {
    _$jscoverage['/scrollbar/control.js'].lineData[195]++;
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
  _$jscoverage['/scrollbar/control.js'].lineData[233]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[250]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[252]++;
  if (visit17_252_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[253]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[255]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[262]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[263]++;
  if (visit18_263_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[264]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[266]++;
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
});
