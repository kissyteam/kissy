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
  _$jscoverage['/menu/submenu.js'].lineData[11] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[14] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[15] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[18] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[19] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[20] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[21] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[23] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[24] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[35] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[39] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[40] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[41] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[42] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[47] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[48] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[49] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[50] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[55] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[56] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[60] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[61] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[65] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[66] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[71] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[72] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[73] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[75] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[81] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[82] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[87] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[88] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[89] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[90] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[100] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[102] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[103] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[105] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[106] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[107] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[109] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[110] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[111] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[112] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[118] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[119] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[121] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[135] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[142] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[144] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[145] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[146] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[147] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[148] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[156] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[157] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[160] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[162] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[166] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[168] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[169] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[175] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[178] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[182] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[186] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[188] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[189] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[222] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[223] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[224] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[225] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[227] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[230] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[231] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[245] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[246] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[250] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[258] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[259] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[260] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[263] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[264] = 0;
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
}
if (! _$jscoverage['/menu/submenu.js'].branchData) {
  _$jscoverage['/menu/submenu.js'].branchData = {};
  _$jscoverage['/menu/submenu.js'].branchData['18'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['18'][3] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['20'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['73'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['89'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['102'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['106'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['109'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['111'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['142'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['144'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['156'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['162'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['166'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['222'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['223'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['230'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['230'][1] = new BranchData();
}
_$jscoverage['/menu/submenu.js'].branchData['230'][1].init(29, 11, 'm.isControl');
function visit63_230_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['223'][1].init(40, 23, 'v.xclass || \'popupmenu\'');
function visit62_223_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['222'][1].init(29, 12, '!v.isControl');
function visit61_222_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['166'][1].init(196, 24, 'keyCode === KeyCode.LEFT');
function visit60_166_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['162'][1].init(1110, 30, '!menu.handleKeyDownInternal(e)');
function visit59_162_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['156'][1].init(589, 25, 'keyCode === KeyCode.ENTER');
function visit58_156_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['144'][1].init(54, 25, 'keyCode === KeyCode.RIGHT');
function visit57_144_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['142'][1].init(269, 20, '!hasKeyboardControl_');
function visit56_142_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['111'][1].init(359, 2, '!v');
function visit55_111_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['109'][1].init(266, 20, 'v && !e.fromKeyboard');
function visit54_109_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['106'][1].init(185, 11, 'e.fromMouse');
function visit53_106_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['102'][1].init(78, 2, '!e');
function visit52_102_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['89'][1].init(297, 20, '!menu.get(\'visible\')');
function visit51_89_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['73'][1].init(298, 19, 'menu.get(\'visible\')');
function visit50_73_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['20'][1].init(62, 24, '!self.get(\'highlighted\')');
function visit49_20_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['18'][3].init(118, 29, 'target.isMenuItem && e.newVal');
function visit48_18_3(result) {
  _$jscoverage['/menu/submenu.js'].branchData['18'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['18'][2].init(99, 15, 'target !== self');
function visit47_18_2(result) {
  _$jscoverage['/menu/submenu.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['18'][1].init(99, 48, 'target !== self && target.isMenuItem && e.newVal');
function visit46_18_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menu/submenu.js'].functionData[0]++;
  _$jscoverage['/menu/submenu.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/menu/submenu.js'].lineData[8]++;
  var MenuItem = require('./menuitem');
  _$jscoverage['/menu/submenu.js'].lineData[9]++;
  var SubMenuRender = require('./submenu-render');
  _$jscoverage['/menu/submenu.js'].lineData[11]++;
  var KeyCode = Node.KeyCode, MENU_DELAY = 0.15;
  _$jscoverage['/menu/submenu.js'].lineData[14]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/menu/submenu.js'].functionData[1]++;
    _$jscoverage['/menu/submenu.js'].lineData[15]++;
    var target = e.target, self = this;
    _$jscoverage['/menu/submenu.js'].lineData[18]++;
    if (visit46_18_1(visit47_18_2(target !== self) && visit48_18_3(target.isMenuItem && e.newVal))) {
      _$jscoverage['/menu/submenu.js'].lineData[19]++;
      self.clearHidePopupMenuTimers();
      _$jscoverage['/menu/submenu.js'].lineData[20]++;
      if (visit49_20_1(!self.get('highlighted'))) {
        _$jscoverage['/menu/submenu.js'].lineData[21]++;
        self.set('highlighted', true);
        _$jscoverage['/menu/submenu.js'].lineData[23]++;
        target.set('highlighted', false);
        _$jscoverage['/menu/submenu.js'].lineData[24]++;
        target.set('highlighted', true);
      }
    }
  }
  _$jscoverage['/menu/submenu.js'].lineData[35]++;
  return MenuItem.extend({
  isSubMenu: 1, 
  clearShowPopupMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[2]++;
  _$jscoverage['/menu/submenu.js'].lineData[39]++;
  var showTimer;
  _$jscoverage['/menu/submenu.js'].lineData[40]++;
  if ((showTimer = this._showTimer)) {
    _$jscoverage['/menu/submenu.js'].lineData[41]++;
    showTimer.cancel();
    _$jscoverage['/menu/submenu.js'].lineData[42]++;
    this._showTimer = null;
  }
}, 
  clearHidePopupMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[3]++;
  _$jscoverage['/menu/submenu.js'].lineData[47]++;
  var dismissTimer;
  _$jscoverage['/menu/submenu.js'].lineData[48]++;
  if ((dismissTimer = this._dismissTimer)) {
    _$jscoverage['/menu/submenu.js'].lineData[49]++;
    dismissTimer.cancel();
    _$jscoverage['/menu/submenu.js'].lineData[50]++;
    this._dismissTimer = null;
  }
}, 
  clearSubMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[4]++;
  _$jscoverage['/menu/submenu.js'].lineData[55]++;
  this.clearHidePopupMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[56]++;
  this.clearShowPopupMenuTimers();
}, 
  bindUI: function() {
  _$jscoverage['/menu/submenu.js'].functionData[5]++;
  _$jscoverage['/menu/submenu.js'].lineData[60]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[61]++;
  self.on('afterHighlightedChange', afterHighlightedChange, self);
}, 
  handleMouseLeaveInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[6]++;
  _$jscoverage['/menu/submenu.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[66]++;
  self.set('highlighted', false, {
  data: {
  fromMouse: 1}});
  _$jscoverage['/menu/submenu.js'].lineData[71]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[72]++;
  var menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[73]++;
  if (visit50_73_1(menu.get('visible'))) {
    _$jscoverage['/menu/submenu.js'].lineData[75]++;
    self._dismissTimer = S.later(hideMenu, self.get('menuDelay') * 1000, false, self);
  }
}, 
  handleMouseEnterInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[7]++;
  _$jscoverage['/menu/submenu.js'].lineData[81]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[82]++;
  self.set('highlighted', true, {
  data: {
  fromMouse: 1}});
  _$jscoverage['/menu/submenu.js'].lineData[87]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[88]++;
  var menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[89]++;
  if (visit51_89_1(!menu.get('visible'))) {
    _$jscoverage['/menu/submenu.js'].lineData[90]++;
    self._showTimer = S.later(showMenu, self.get('menuDelay') * 1000, false, self);
  }
}, 
  _onSetHighlighted: function(v, e) {
  _$jscoverage['/menu/submenu.js'].functionData[8]++;
  _$jscoverage['/menu/submenu.js'].lineData[100]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[102]++;
  if (visit52_102_1(!e)) {
    _$jscoverage['/menu/submenu.js'].lineData[103]++;
    return;
  }
  _$jscoverage['/menu/submenu.js'].lineData[105]++;
  self.callSuper(e);
  _$jscoverage['/menu/submenu.js'].lineData[106]++;
  if (visit53_106_1(e.fromMouse)) {
    _$jscoverage['/menu/submenu.js'].lineData[107]++;
    return;
  }
  _$jscoverage['/menu/submenu.js'].lineData[109]++;
  if (visit54_109_1(v && !e.fromKeyboard)) {
    _$jscoverage['/menu/submenu.js'].lineData[110]++;
    showMenu.call(self);
  } else {
    _$jscoverage['/menu/submenu.js'].lineData[111]++;
    if (visit55_111_1(!v)) {
      _$jscoverage['/menu/submenu.js'].lineData[112]++;
      hideMenu.call(self);
    }
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[9]++;
  _$jscoverage['/menu/submenu.js'].lineData[118]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[119]++;
  showMenu.call(self);
  _$jscoverage['/menu/submenu.js'].lineData[121]++;
  self.callSuper();
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/submenu.js'].functionData[10]++;
  _$jscoverage['/menu/submenu.js'].lineData[135]++;
  var self = this, menu = self.get('menu'), menuChildren, menuChild, hasKeyboardControl_ = menu.get('visible'), keyCode = e.keyCode;
  _$jscoverage['/menu/submenu.js'].lineData[142]++;
  if (visit56_142_1(!hasKeyboardControl_)) {
    _$jscoverage['/menu/submenu.js'].lineData[144]++;
    if (visit57_144_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/menu/submenu.js'].lineData[145]++;
      showMenu.call(self);
      _$jscoverage['/menu/submenu.js'].lineData[146]++;
      menuChildren = menu.get('children');
      _$jscoverage['/menu/submenu.js'].lineData[147]++;
      if ((menuChild = menuChildren[0])) {
        _$jscoverage['/menu/submenu.js'].lineData[148]++;
        menuChild.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
      }
    } else {
      _$jscoverage['/menu/submenu.js'].lineData[156]++;
      if (visit58_156_1(keyCode === KeyCode.ENTER)) {
        _$jscoverage['/menu/submenu.js'].lineData[157]++;
        return self.handleClickInternal(e);
      } else {
        _$jscoverage['/menu/submenu.js'].lineData[160]++;
        return undefined;
      }
    }
  } else {
    _$jscoverage['/menu/submenu.js'].lineData[162]++;
    if (visit59_162_1(!menu.handleKeyDownInternal(e))) {
      _$jscoverage['/menu/submenu.js'].lineData[166]++;
      if (visit60_166_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/menu/submenu.js'].lineData[168]++;
        self.set('highlighted', false);
        _$jscoverage['/menu/submenu.js'].lineData[169]++;
        self.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
      } else {
        _$jscoverage['/menu/submenu.js'].lineData[175]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/menu/submenu.js'].lineData[178]++;
  return true;
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/submenu.js'].functionData[11]++;
  _$jscoverage['/menu/submenu.js'].lineData[182]++;
  return this.get('menu').containsElement(element);
}, 
  destructor: function() {
  _$jscoverage['/menu/submenu.js'].functionData[12]++;
  _$jscoverage['/menu/submenu.js'].lineData[186]++;
  var self = this, menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[188]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[189]++;
  menu.destroy();
}}, {
  ATTRS: {
  menuDelay: {
  value: MENU_DELAY}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/menu/submenu.js'].functionData[13]++;
  _$jscoverage['/menu/submenu.js'].lineData[222]++;
  if (visit61_222_1(!v.isControl)) {
    _$jscoverage['/menu/submenu.js'].lineData[223]++;
    v.xclass = visit62_223_1(v.xclass || 'popupmenu');
    _$jscoverage['/menu/submenu.js'].lineData[224]++;
    v = this.createComponent(v);
    _$jscoverage['/menu/submenu.js'].lineData[225]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/menu/submenu.js'].lineData[227]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/menu/submenu.js'].functionData[14]++;
  _$jscoverage['/menu/submenu.js'].lineData[230]++;
  if (visit63_230_1(m.isControl)) {
    _$jscoverage['/menu/submenu.js'].lineData[231]++;
    m.setInternal('parent', this);
  }
}}, 
  xrender: {
  value: SubMenuRender}}, 
  xclass: 'submenu'});
  _$jscoverage['/menu/submenu.js'].lineData[245]++;
  function showMenu() {
    _$jscoverage['/menu/submenu.js'].functionData[15]++;
    _$jscoverage['/menu/submenu.js'].lineData[246]++;
    var self = this, menu = self.get('menu');
    _$jscoverage['/menu/submenu.js'].lineData[250]++;
    var align = {
  node: this.$el, 
  points: ['tr', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/menu/submenu.js'].lineData[258]++;
    S.mix(menu.get('align'), align, false);
    _$jscoverage['/menu/submenu.js'].lineData[259]++;
    menu.show();
    _$jscoverage['/menu/submenu.js'].lineData[260]++;
    self.el.setAttribute('aria-haspopup', menu.get('el').attr('id'));
  }
  _$jscoverage['/menu/submenu.js'].lineData[263]++;
  function hideMenu() {
    _$jscoverage['/menu/submenu.js'].functionData[16]++;
    _$jscoverage['/menu/submenu.js'].lineData[264]++;
    this.get('menu').hide();
  }
});
