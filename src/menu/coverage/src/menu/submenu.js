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
if (! _$jscoverage['/menu/submenu.js']) {
  _$jscoverage['/menu/submenu.js'] = {};
  _$jscoverage['/menu/submenu.js'].lineData = [];
  _$jscoverage['/menu/submenu.js'].lineData[6] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[7] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[8] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[9] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[10] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[11] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[13] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[16] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[17] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[20] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[21] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[22] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[23] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[25] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[26] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[37] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[41] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[43] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[44] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[45] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[46] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[48] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[55] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[56] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[60] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[61] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[62] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[63] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[68] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[69] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[70] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[71] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[76] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[77] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[81] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[82] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[87] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[88] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[89] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[91] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[97] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[98] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[103] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[104] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[105] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[106] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[116] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[117] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[119] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[120] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[122] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[123] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[125] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[126] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[127] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[128] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[134] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[136] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[150] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[157] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[159] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[160] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[161] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[162] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[163] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[169] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[171] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[173] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[175] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[179] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[181] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[182] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[188] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[191] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[195] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[199] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[201] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[202] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[238] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[239] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[240] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[241] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[242] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[244] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[247] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[248] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[258] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[259] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[263] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[271] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[272] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[273] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[276] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[277] = 0;
}
if (! _$jscoverage['/menu/submenu.js'].functionData) {
  _$jscoverage['/menu/submenu.js'].functionData = [];
  _$jscoverage['/menu/submenu.js'].functionData[0] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[1] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[2] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[3] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[4] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[5] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[6] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[7] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[8] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[9] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[10] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[11] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[12] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[13] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[14] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[15] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[16] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[17] = 0;
}
if (! _$jscoverage['/menu/submenu.js'].branchData) {
  _$jscoverage['/menu/submenu.js'].branchData = {};
  _$jscoverage['/menu/submenu.js'].branchData['20'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['20'][2] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['20'][3] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['22'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['89'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['105'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['119'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['122'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['125'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['127'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['157'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['159'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['169'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['175'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['179'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['238'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['239'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['240'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['247'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['247'][1] = new BranchData();
}
_$jscoverage['/menu/submenu.js'].branchData['247'][1].init(30, 11, 'm.isControl');
function visit61_247_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['240'][1].init(41, 23, 'v.xclass || \'popupmenu\'');
function visit60_240_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['239'][1].init(68, 12, '!v.isControl');
function visit59_239_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['238'][1].init(30, 7, 'v || {}');
function visit58_238_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['179'][1].init(200, 24, 'keyCode === KeyCode.LEFT');
function visit57_179_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['175'][1].init(1100, 30, '!menu.handleKeyDownInternal(e)');
function visit56_175_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['169'][1].init(543, 25, 'keyCode === KeyCode.ENTER');
function visit55_169_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['159'][1].init(56, 25, 'keyCode === KeyCode.RIGHT');
function visit54_159_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['157'][1].init(277, 20, '!hasKeyboardControl_');
function visit53_157_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['127'][1].init(374, 2, '!v');
function visit52_127_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['125'][1].init(279, 20, 'v && !e.fromKeyboard');
function visit51_125_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['122'][1].init(195, 11, 'e.fromMouse');
function visit50_122_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['119'][1].init(120, 2, '!e');
function visit49_119_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['105'][1].init(306, 20, '!menu.get(\'visible\')');
function visit48_105_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['89'][1].init(307, 19, 'menu.get(\'visible\')');
function visit47_89_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['22'][1].init(64, 24, '!self.get(\'highlighted\')');
function visit46_22_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['20'][3].init(122, 29, 'target.isMenuItem && e.newVal');
function visit45_20_3(result) {
  _$jscoverage['/menu/submenu.js'].branchData['20'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['20'][2].init(103, 15, 'target !== self');
function visit44_20_2(result) {
  _$jscoverage['/menu/submenu.js'].branchData['20'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['20'][1].init(103, 48, 'target !== self && target.isMenuItem && e.newVal');
function visit43_20_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menu/submenu.js'].functionData[0]++;
  _$jscoverage['/menu/submenu.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/menu/submenu.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/menu/submenu.js'].lineData[9]++;
  var SubMenuTpl = require('./submenu-xtpl');
  _$jscoverage['/menu/submenu.js'].lineData[10]++;
  var MenuItem = require('./menuitem');
  _$jscoverage['/menu/submenu.js'].lineData[11]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/menu/submenu.js'].lineData[13]++;
  var KeyCode = Node.KeyCode, MENU_DELAY = 0.15;
  _$jscoverage['/menu/submenu.js'].lineData[16]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/menu/submenu.js'].functionData[1]++;
    _$jscoverage['/menu/submenu.js'].lineData[17]++;
    var target = e.target, self = this;
    _$jscoverage['/menu/submenu.js'].lineData[20]++;
    if (visit43_20_1(visit44_20_2(target !== self) && visit45_20_3(target.isMenuItem && e.newVal))) {
      _$jscoverage['/menu/submenu.js'].lineData[21]++;
      self.clearHidePopupMenuTimers();
      _$jscoverage['/menu/submenu.js'].lineData[22]++;
      if (visit46_22_1(!self.get('highlighted'))) {
        _$jscoverage['/menu/submenu.js'].lineData[23]++;
        self.set('highlighted', true);
        _$jscoverage['/menu/submenu.js'].lineData[25]++;
        target.set('highlighted', false);
        _$jscoverage['/menu/submenu.js'].lineData[26]++;
        target.set('highlighted', true);
      }
    }
  }
  _$jscoverage['/menu/submenu.js'].lineData[37]++;
  return MenuItem.extend([ContentBox], {
  isSubMenu: 1, 
  decorateDom: function(el) {
  _$jscoverage['/menu/submenu.js'].functionData[2]++;
  _$jscoverage['/menu/submenu.js'].lineData[41]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/menu/submenu.js'].lineData[43]++;
  var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
  _$jscoverage['/menu/submenu.js'].lineData[44]++;
  var docBody = popupMenuEl[0].ownerDocument.body;
  _$jscoverage['/menu/submenu.js'].lineData[45]++;
  docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
  _$jscoverage['/menu/submenu.js'].lineData[46]++;
  var PopupMenuClass = this.getComponentConstructorByNode(prefixCls, popupMenuEl);
  _$jscoverage['/menu/submenu.js'].lineData[48]++;
  self.setInternal('menu', new PopupMenuClass({
  srcNode: popupMenuEl, 
  prefixCls: prefixCls}));
}, 
  bindUI: function() {
  _$jscoverage['/menu/submenu.js'].functionData[3]++;
  _$jscoverage['/menu/submenu.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[56]++;
  self.on('afterHighlightedChange', afterHighlightedChange, self);
}, 
  clearShowPopupMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[4]++;
  _$jscoverage['/menu/submenu.js'].lineData[60]++;
  var showTimer;
  _$jscoverage['/menu/submenu.js'].lineData[61]++;
  if ((showTimer = this._showTimer)) {
    _$jscoverage['/menu/submenu.js'].lineData[62]++;
    showTimer.cancel();
    _$jscoverage['/menu/submenu.js'].lineData[63]++;
    this._showTimer = null;
  }
}, 
  clearHidePopupMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[5]++;
  _$jscoverage['/menu/submenu.js'].lineData[68]++;
  var dismissTimer;
  _$jscoverage['/menu/submenu.js'].lineData[69]++;
  if ((dismissTimer = this._dismissTimer)) {
    _$jscoverage['/menu/submenu.js'].lineData[70]++;
    dismissTimer.cancel();
    _$jscoverage['/menu/submenu.js'].lineData[71]++;
    this._dismissTimer = null;
  }
}, 
  clearSubMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[6]++;
  _$jscoverage['/menu/submenu.js'].lineData[76]++;
  this.clearHidePopupMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[77]++;
  this.clearShowPopupMenuTimers();
}, 
  handleMouseLeaveInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[7]++;
  _$jscoverage['/menu/submenu.js'].lineData[81]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[82]++;
  self.set('highlighted', false, {
  data: {
  fromMouse: 1}});
  _$jscoverage['/menu/submenu.js'].lineData[87]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[88]++;
  var menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[89]++;
  if (visit47_89_1(menu.get('visible'))) {
    _$jscoverage['/menu/submenu.js'].lineData[91]++;
    self._dismissTimer = util.later(hideMenu, self.get('menuDelay') * 1000, false, self);
  }
}, 
  handleMouseEnterInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[8]++;
  _$jscoverage['/menu/submenu.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[98]++;
  self.set('highlighted', true, {
  data: {
  fromMouse: 1}});
  _$jscoverage['/menu/submenu.js'].lineData[103]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[104]++;
  var menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[105]++;
  if (visit48_105_1(!menu.get('visible'))) {
    _$jscoverage['/menu/submenu.js'].lineData[106]++;
    self._showTimer = util.later(showMenu, self.get('menuDelay') * 1000, false, self);
  }
}, 
  _onSetHighlighted: function(v, e) {
  _$jscoverage['/menu/submenu.js'].functionData[9]++;
  _$jscoverage['/menu/submenu.js'].lineData[116]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[117]++;
  self.callSuper(v, e);
  _$jscoverage['/menu/submenu.js'].lineData[119]++;
  if (visit49_119_1(!e)) {
    _$jscoverage['/menu/submenu.js'].lineData[120]++;
    return;
  }
  _$jscoverage['/menu/submenu.js'].lineData[122]++;
  if (visit50_122_1(e.fromMouse)) {
    _$jscoverage['/menu/submenu.js'].lineData[123]++;
    return;
  }
  _$jscoverage['/menu/submenu.js'].lineData[125]++;
  if (visit51_125_1(v && !e.fromKeyboard)) {
    _$jscoverage['/menu/submenu.js'].lineData[126]++;
    showMenu.call(self);
  } else {
    _$jscoverage['/menu/submenu.js'].lineData[127]++;
    if (visit52_127_1(!v)) {
      _$jscoverage['/menu/submenu.js'].lineData[128]++;
      hideMenu.call(self);
    }
  }
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/menu/submenu.js'].functionData[10]++;
  _$jscoverage['/menu/submenu.js'].lineData[134]++;
  showMenu.call(this);
  _$jscoverage['/menu/submenu.js'].lineData[136]++;
  this.callSuper(e);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/submenu.js'].functionData[11]++;
  _$jscoverage['/menu/submenu.js'].lineData[150]++;
  var self = this, menu = self.get('menu'), menuChildren, menuChild, hasKeyboardControl_ = menu.get('visible'), keyCode = e.keyCode;
  _$jscoverage['/menu/submenu.js'].lineData[157]++;
  if (visit53_157_1(!hasKeyboardControl_)) {
    _$jscoverage['/menu/submenu.js'].lineData[159]++;
    if (visit54_159_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/menu/submenu.js'].lineData[160]++;
      showMenu.call(self);
      _$jscoverage['/menu/submenu.js'].lineData[161]++;
      menuChildren = menu.get('children');
      _$jscoverage['/menu/submenu.js'].lineData[162]++;
      if ((menuChild = menuChildren[0])) {
        _$jscoverage['/menu/submenu.js'].lineData[163]++;
        menuChild.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
      }
    } else {
      _$jscoverage['/menu/submenu.js'].lineData[169]++;
      if (visit55_169_1(keyCode === KeyCode.ENTER)) {
        _$jscoverage['/menu/submenu.js'].lineData[171]++;
        return self.handleClickInternal(e);
      } else {
        _$jscoverage['/menu/submenu.js'].lineData[173]++;
        return undefined;
      }
    }
  } else {
    _$jscoverage['/menu/submenu.js'].lineData[175]++;
    if (visit56_175_1(!menu.handleKeyDownInternal(e))) {
      _$jscoverage['/menu/submenu.js'].lineData[179]++;
      if (visit57_179_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/menu/submenu.js'].lineData[181]++;
        self.set('highlighted', false);
        _$jscoverage['/menu/submenu.js'].lineData[182]++;
        self.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
      } else {
        _$jscoverage['/menu/submenu.js'].lineData[188]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/menu/submenu.js'].lineData[191]++;
  return true;
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/submenu.js'].functionData[12]++;
  _$jscoverage['/menu/submenu.js'].lineData[195]++;
  return this.get('menu').containsElement(element);
}, 
  destructor: function() {
  _$jscoverage['/menu/submenu.js'].functionData[13]++;
  _$jscoverage['/menu/submenu.js'].lineData[199]++;
  var self = this, menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[201]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[202]++;
  menu.destroy();
}}, {
  ATTRS: {
  contentTpl: {
  value: SubMenuTpl}, 
  menuDelay: {
  value: MENU_DELAY}, 
  menu: {
  getter: function(v) {
  _$jscoverage['/menu/submenu.js'].functionData[14]++;
  _$jscoverage['/menu/submenu.js'].lineData[238]++;
  v = visit58_238_1(v || {});
  _$jscoverage['/menu/submenu.js'].lineData[239]++;
  if (visit59_239_1(!v.isControl)) {
    _$jscoverage['/menu/submenu.js'].lineData[240]++;
    v.xclass = visit60_240_1(v.xclass || 'popupmenu');
    _$jscoverage['/menu/submenu.js'].lineData[241]++;
    v = this.createComponent(v);
    _$jscoverage['/menu/submenu.js'].lineData[242]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/menu/submenu.js'].lineData[244]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/menu/submenu.js'].functionData[15]++;
  _$jscoverage['/menu/submenu.js'].lineData[247]++;
  if (visit61_247_1(m.isControl)) {
    _$jscoverage['/menu/submenu.js'].lineData[248]++;
    m.setInternal('parent', this);
  }
}}}, 
  xclass: 'submenu'});
  _$jscoverage['/menu/submenu.js'].lineData[258]++;
  function showMenu() {
    _$jscoverage['/menu/submenu.js'].functionData[16]++;
    _$jscoverage['/menu/submenu.js'].lineData[259]++;
    var self = this, menu = self.get('menu');
    _$jscoverage['/menu/submenu.js'].lineData[263]++;
    var align = {
  node: this.$el, 
  points: ['tr', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/menu/submenu.js'].lineData[271]++;
    util.mix(menu.get('align'), align, false);
    _$jscoverage['/menu/submenu.js'].lineData[272]++;
    menu.show();
    _$jscoverage['/menu/submenu.js'].lineData[273]++;
    self.el.setAttribute('aria-haspopup', menu.get('el').attr('id'));
  }
  _$jscoverage['/menu/submenu.js'].lineData[276]++;
  function hideMenu() {
    _$jscoverage['/menu/submenu.js'].functionData[17]++;
    _$jscoverage['/menu/submenu.js'].lineData[277]++;
    this.get('menu').hide();
  }
});
