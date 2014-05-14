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
if (! _$jscoverage['/menu/control.js']) {
  _$jscoverage['/menu/control.js'] = {};
  _$jscoverage['/menu/control.js'].lineData = [];
  _$jscoverage['/menu/control.js'].lineData[6] = 0;
  _$jscoverage['/menu/control.js'].lineData[7] = 0;
  _$jscoverage['/menu/control.js'].lineData[8] = 0;
  _$jscoverage['/menu/control.js'].lineData[9] = 0;
  _$jscoverage['/menu/control.js'].lineData[10] = 0;
  _$jscoverage['/menu/control.js'].lineData[11] = 0;
  _$jscoverage['/menu/control.js'].lineData[19] = 0;
  _$jscoverage['/menu/control.js'].lineData[25] = 0;
  _$jscoverage['/menu/control.js'].lineData[29] = 0;
  _$jscoverage['/menu/control.js'].lineData[30] = 0;
  _$jscoverage['/menu/control.js'].lineData[37] = 0;
  _$jscoverage['/menu/control.js'].lineData[41] = 0;
  _$jscoverage['/menu/control.js'].lineData[43] = 0;
  _$jscoverage['/menu/control.js'].lineData[52] = 0;
  _$jscoverage['/menu/control.js'].lineData[53] = 0;
  _$jscoverage['/menu/control.js'].lineData[54] = 0;
  _$jscoverage['/menu/control.js'].lineData[55] = 0;
  _$jscoverage['/menu/control.js'].lineData[60] = 0;
  _$jscoverage['/menu/control.js'].lineData[64] = 0;
  _$jscoverage['/menu/control.js'].lineData[65] = 0;
  _$jscoverage['/menu/control.js'].lineData[67] = 0;
  _$jscoverage['/menu/control.js'].lineData[68] = 0;
  _$jscoverage['/menu/control.js'].lineData[69] = 0;
  _$jscoverage['/menu/control.js'].lineData[71] = 0;
  _$jscoverage['/menu/control.js'].lineData[75] = 0;
  _$jscoverage['/menu/control.js'].lineData[76] = 0;
  _$jscoverage['/menu/control.js'].lineData[77] = 0;
  _$jscoverage['/menu/control.js'].lineData[78] = 0;
  _$jscoverage['/menu/control.js'].lineData[85] = 0;
  _$jscoverage['/menu/control.js'].lineData[88] = 0;
  _$jscoverage['/menu/control.js'].lineData[89] = 0;
  _$jscoverage['/menu/control.js'].lineData[90] = 0;
  _$jscoverage['/menu/control.js'].lineData[91] = 0;
  _$jscoverage['/menu/control.js'].lineData[93] = 0;
  _$jscoverage['/menu/control.js'].lineData[95] = 0;
  _$jscoverage['/menu/control.js'].lineData[113] = 0;
  _$jscoverage['/menu/control.js'].lineData[116] = 0;
  _$jscoverage['/menu/control.js'].lineData[119] = 0;
  _$jscoverage['/menu/control.js'].lineData[120] = 0;
  _$jscoverage['/menu/control.js'].lineData[123] = 0;
  _$jscoverage['/menu/control.js'].lineData[126] = 0;
  _$jscoverage['/menu/control.js'].lineData[127] = 0;
  _$jscoverage['/menu/control.js'].lineData[130] = 0;
  _$jscoverage['/menu/control.js'].lineData[133] = 0;
  _$jscoverage['/menu/control.js'].lineData[137] = 0;
  _$jscoverage['/menu/control.js'].lineData[138] = 0;
  _$jscoverage['/menu/control.js'].lineData[140] = 0;
  _$jscoverage['/menu/control.js'].lineData[144] = 0;
  _$jscoverage['/menu/control.js'].lineData[145] = 0;
  _$jscoverage['/menu/control.js'].lineData[148] = 0;
  _$jscoverage['/menu/control.js'].lineData[149] = 0;
  _$jscoverage['/menu/control.js'].lineData[152] = 0;
  _$jscoverage['/menu/control.js'].lineData[153] = 0;
  _$jscoverage['/menu/control.js'].lineData[155] = 0;
  _$jscoverage['/menu/control.js'].lineData[156] = 0;
  _$jscoverage['/menu/control.js'].lineData[158] = 0;
  _$jscoverage['/menu/control.js'].lineData[159] = 0;
  _$jscoverage['/menu/control.js'].lineData[162] = 0;
  _$jscoverage['/menu/control.js'].lineData[163] = 0;
  _$jscoverage['/menu/control.js'].lineData[165] = 0;
  _$jscoverage['/menu/control.js'].lineData[166] = 0;
  _$jscoverage['/menu/control.js'].lineData[168] = 0;
  _$jscoverage['/menu/control.js'].lineData[169] = 0;
  _$jscoverage['/menu/control.js'].lineData[171] = 0;
  _$jscoverage['/menu/control.js'].lineData[172] = 0;
  _$jscoverage['/menu/control.js'].lineData[177] = 0;
  _$jscoverage['/menu/control.js'].lineData[179] = 0;
  _$jscoverage['/menu/control.js'].lineData[190] = 0;
  _$jscoverage['/menu/control.js'].lineData[192] = 0;
  _$jscoverage['/menu/control.js'].lineData[195] = 0;
  _$jscoverage['/menu/control.js'].lineData[196] = 0;
  _$jscoverage['/menu/control.js'].lineData[199] = 0;
  _$jscoverage['/menu/control.js'].lineData[200] = 0;
  _$jscoverage['/menu/control.js'].lineData[203] = 0;
  _$jscoverage['/menu/control.js'].lineData[205] = 0;
  _$jscoverage['/menu/control.js'].lineData[206] = 0;
  _$jscoverage['/menu/control.js'].lineData[207] = 0;
  _$jscoverage['/menu/control.js'].lineData[208] = 0;
  _$jscoverage['/menu/control.js'].lineData[212] = 0;
  _$jscoverage['/menu/control.js'].lineData[231] = 0;
  _$jscoverage['/menu/control.js'].lineData[241] = 0;
  _$jscoverage['/menu/control.js'].lineData[242] = 0;
  _$jscoverage['/menu/control.js'].lineData[243] = 0;
  _$jscoverage['/menu/control.js'].lineData[245] = 0;
}
if (! _$jscoverage['/menu/control.js'].functionData) {
  _$jscoverage['/menu/control.js'].functionData = [];
  _$jscoverage['/menu/control.js'].functionData[0] = 0;
  _$jscoverage['/menu/control.js'].functionData[1] = 0;
  _$jscoverage['/menu/control.js'].functionData[2] = 0;
  _$jscoverage['/menu/control.js'].functionData[3] = 0;
  _$jscoverage['/menu/control.js'].functionData[4] = 0;
  _$jscoverage['/menu/control.js'].functionData[5] = 0;
  _$jscoverage['/menu/control.js'].functionData[6] = 0;
  _$jscoverage['/menu/control.js'].functionData[7] = 0;
  _$jscoverage['/menu/control.js'].functionData[8] = 0;
  _$jscoverage['/menu/control.js'].functionData[9] = 0;
  _$jscoverage['/menu/control.js'].functionData[10] = 0;
  _$jscoverage['/menu/control.js'].functionData[11] = 0;
  _$jscoverage['/menu/control.js'].functionData[12] = 0;
}
if (! _$jscoverage['/menu/control.js'].branchData) {
  _$jscoverage['/menu/control.js'].branchData = {};
  _$jscoverage['/menu/control.js'].branchData['41'] = [];
  _$jscoverage['/menu/control.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['54'] = [];
  _$jscoverage['/menu/control.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['67'] = [];
  _$jscoverage['/menu/control.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['90'] = [];
  _$jscoverage['/menu/control.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['94'] = [];
  _$jscoverage['/menu/control.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['119'] = [];
  _$jscoverage['/menu/control.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['126'] = [];
  _$jscoverage['/menu/control.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['152'] = [];
  _$jscoverage['/menu/control.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['162'] = [];
  _$jscoverage['/menu/control.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['171'] = [];
  _$jscoverage['/menu/control.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['195'] = [];
  _$jscoverage['/menu/control.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['199'] = [];
  _$jscoverage['/menu/control.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['205'] = [];
  _$jscoverage['/menu/control.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['207'] = [];
  _$jscoverage['/menu/control.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['242'] = [];
  _$jscoverage['/menu/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['245'] = [];
  _$jscoverage['/menu/control.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['245'][2] = new BranchData();
}
_$jscoverage['/menu/control.js'].branchData['245'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit24_245_2(result) {
  _$jscoverage['/menu/control.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['245'][1].init(124, 32, 'menuItem && menuItem.el.id || \'\'');
function visit23_245_1(result) {
  _$jscoverage['/menu/control.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['242'][1].init(14, 15, 'e.target.isMenu');
function visit22_242_1(result) {
  _$jscoverage['/menu/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['207'][1].init(64, 55, 'child.containsElement && child.containsElement(element)');
function visit21_207_1(result) {
  _$jscoverage['/menu/control.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['205'][1].init(416, 9, 'i < count');
function visit20_205_1(result) {
  _$jscoverage['/menu/control.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['199'][3].init(215, 18, '$el[0] === element');
function visit19_199_3(result) {
  _$jscoverage['/menu/control.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['199'][2].init(215, 43, '$el[0] === element || $el.contains(element)');
function visit18_199_2(result) {
  _$jscoverage['/menu/control.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['199'][1].init(207, 52, '$el && ($el[0] === element || $el.contains(element))');
function visit17_199_1(result) {
  _$jscoverage['/menu/control.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['195'][1].init(110, 28, '!self.get(\'visible\') || !$el');
function visit16_195_1(result) {
  _$jscoverage['/menu/control.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['171'][1].init(2200, 15, 'nextHighlighted');
function visit15_171_1(result) {
  _$jscoverage['/menu/control.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['162'][1].init(43, 16, '!highlightedItem');
function visit14_162_1(result) {
  _$jscoverage['/menu/control.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['152'][1].init(41, 16, '!highlightedItem');
function visit13_152_1(result) {
  _$jscoverage['/menu/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['126'][1].init(454, 9, 'len === 0');
function visit12_126_1(result) {
  _$jscoverage['/menu/control.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['119'][1].init(235, 59, 'highlightedItem && highlightedItem.handleKeyDownInternal(e)');
function visit11_119_1(result) {
  _$jscoverage['/menu/control.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['94'][1].init(259, 11, 'index !== o');
function visit10_94_1(result) {
  _$jscoverage['/menu/control.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['90'][2].init(87, 26, 'c.get(\'visible\') !== false');
function visit9_90_2(result) {
  _$jscoverage['/menu/control.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['90'][1].init(64, 50, '!c.get(\'disabled\') && (c.get(\'visible\') !== false)');
function visit8_90_1(result) {
  _$jscoverage['/menu/control.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['67'][1].init(152, 40, 'rootMenu && rootMenu._popupAutoHideTimer');
function visit7_67_1(result) {
  _$jscoverage['/menu/control.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['54'][1].init(87, 53, '!v && (highlightedItem = this.get(\'highlightedItem\'))');
function visit6_54_1(result) {
  _$jscoverage['/menu/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['41'][2].init(228, 36, 'ev && (highlightedItem = ev.prevVal)');
function visit5_41_2(result) {
  _$jscoverage['/menu/control.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['41'][1].init(223, 41, 'v && ev && (highlightedItem = ev.prevVal)');
function visit4_41_1(result) {
  _$jscoverage['/menu/control.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menu/control.js'].functionData[0]++;
  _$jscoverage['/menu/control.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/menu/control.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/menu/control.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/menu/control.js'].lineData[10]++;
  var DelegateChildrenExtension = require('component/extension/delegate-children');
  _$jscoverage['/menu/control.js'].lineData[11]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/menu/control.js'].lineData[19]++;
  return Container.extend([DelegateChildrenExtension], {
  isMenu: 1, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/menu/control.js'].functionData[1]++;
  _$jscoverage['/menu/control.js'].lineData[25]++;
  renderData.elAttrs.role = 'menu';
}, 
  bindUI: function() {
  _$jscoverage['/menu/control.js'].functionData[2]++;
  _$jscoverage['/menu/control.js'].lineData[29]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[30]++;
  self.on('afterHighlightedItemChange', afterHighlightedItemChange, self);
}, 
  _onSetHighlightedItem: function(v, ev) {
  _$jscoverage['/menu/control.js'].functionData[3]++;
  _$jscoverage['/menu/control.js'].lineData[37]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[41]++;
  if (visit4_41_1(v && visit5_41_2(ev && (highlightedItem = ev.prevVal)))) {
    _$jscoverage['/menu/control.js'].lineData[43]++;
    highlightedItem.set('highlighted', false, {
  data: {
  byPassSetHighlightedItem: 1}});
  }
}, 
  _onSetVisible: function(v, e) {
  _$jscoverage['/menu/control.js'].functionData[4]++;
  _$jscoverage['/menu/control.js'].lineData[52]++;
  this.callSuper(v, e);
  _$jscoverage['/menu/control.js'].lineData[53]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[54]++;
  if (visit6_54_1(!v && (highlightedItem = this.get('highlightedItem')))) {
    _$jscoverage['/menu/control.js'].lineData[55]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  getRootMenu: function() {
  _$jscoverage['/menu/control.js'].functionData[5]++;
  _$jscoverage['/menu/control.js'].lineData[60]++;
  return this;
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[6]++;
  _$jscoverage['/menu/control.js'].lineData[64]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[65]++;
  var rootMenu = this.getRootMenu();
  _$jscoverage['/menu/control.js'].lineData[67]++;
  if (visit7_67_1(rootMenu && rootMenu._popupAutoHideTimer)) {
    _$jscoverage['/menu/control.js'].lineData[68]++;
    clearTimeout(rootMenu._popupAutoHideTimer);
    _$jscoverage['/menu/control.js'].lineData[69]++;
    rootMenu._popupAutoHideTimer = null;
  }
  _$jscoverage['/menu/control.js'].lineData[71]++;
  this.focus();
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[7]++;
  _$jscoverage['/menu/control.js'].lineData[75]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[76]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[77]++;
  if ((highlightedItem = this.get('highlightedItem'))) {
    _$jscoverage['/menu/control.js'].lineData[78]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  _getNextEnabledHighlighted: function(index, dir) {
  _$jscoverage['/menu/control.js'].functionData[8]++;
  _$jscoverage['/menu/control.js'].lineData[85]++;
  var children = this.get('children'), len = children.length, o = index;
  _$jscoverage['/menu/control.js'].lineData[88]++;
  do {
    _$jscoverage['/menu/control.js'].lineData[89]++;
    var c = children[index];
    _$jscoverage['/menu/control.js'].lineData[90]++;
    if (visit8_90_1(!c.get('disabled') && (visit9_90_2(c.get('visible') !== false)))) {
      _$jscoverage['/menu/control.js'].lineData[91]++;
      return children[index];
    }
    _$jscoverage['/menu/control.js'].lineData[93]++;
    index = (index + dir + len) % len;
  } while (visit10_94_1(index !== o));
  _$jscoverage['/menu/control.js'].lineData[95]++;
  return undefined;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[9]++;
  _$jscoverage['/menu/control.js'].lineData[113]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[116]++;
  var highlightedItem = self.get('highlightedItem');
  _$jscoverage['/menu/control.js'].lineData[119]++;
  if (visit11_119_1(highlightedItem && highlightedItem.handleKeyDownInternal(e))) {
    _$jscoverage['/menu/control.js'].lineData[120]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[123]++;
  var children = self.get('children'), len = children.length;
  _$jscoverage['/menu/control.js'].lineData[126]++;
  if (visit12_126_1(len === 0)) {
    _$jscoverage['/menu/control.js'].lineData[127]++;
    return undefined;
  }
  _$jscoverage['/menu/control.js'].lineData[130]++;
  var index, destIndex, nextHighlighted;
  _$jscoverage['/menu/control.js'].lineData[133]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/menu/control.js'].lineData[137]++;
      if ((highlightedItem = self.get('highlightedItem'))) {
        _$jscoverage['/menu/control.js'].lineData[138]++;
        highlightedItem.set('highlighted', false);
      }
      _$jscoverage['/menu/control.js'].lineData[140]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/menu/control.js'].lineData[144]++;
      nextHighlighted = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/menu/control.js'].lineData[145]++;
      break;
    case KeyCode.END:
      _$jscoverage['/menu/control.js'].lineData[148]++;
      nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
      _$jscoverage['/menu/control.js'].lineData[149]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/menu/control.js'].lineData[152]++;
      if (visit13_152_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[153]++;
        destIndex = len - 1;
      } else {
        _$jscoverage['/menu/control.js'].lineData[155]++;
        index = util.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[156]++;
        destIndex = (index - 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[158]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
      _$jscoverage['/menu/control.js'].lineData[159]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/menu/control.js'].lineData[162]++;
      if (visit14_162_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[163]++;
        destIndex = 0;
      } else {
        _$jscoverage['/menu/control.js'].lineData[165]++;
        index = util.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[166]++;
        destIndex = (index + 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[168]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
      _$jscoverage['/menu/control.js'].lineData[169]++;
      break;
  }
  _$jscoverage['/menu/control.js'].lineData[171]++;
  if (visit15_171_1(nextHighlighted)) {
    _$jscoverage['/menu/control.js'].lineData[172]++;
    nextHighlighted.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
    _$jscoverage['/menu/control.js'].lineData[177]++;
    return true;
  } else {
    _$jscoverage['/menu/control.js'].lineData[179]++;
    return undefined;
  }
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/control.js'].functionData[10]++;
  _$jscoverage['/menu/control.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[192]++;
  var $el = self.$el;
  _$jscoverage['/menu/control.js'].lineData[195]++;
  if (visit16_195_1(!self.get('visible') || !$el)) {
    _$jscoverage['/menu/control.js'].lineData[196]++;
    return false;
  }
  _$jscoverage['/menu/control.js'].lineData[199]++;
  if (visit17_199_1($el && (visit18_199_2(visit19_199_3($el[0] === element) || $el.contains(element))))) {
    _$jscoverage['/menu/control.js'].lineData[200]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[203]++;
  var children = self.get('children');
  _$jscoverage['/menu/control.js'].lineData[205]++;
  for (var i = 0, count = children.length; visit20_205_1(i < count); i++) {
    _$jscoverage['/menu/control.js'].lineData[206]++;
    var child = children[i];
    _$jscoverage['/menu/control.js'].lineData[207]++;
    if (visit21_207_1(child.containsElement && child.containsElement(element))) {
      _$jscoverage['/menu/control.js'].lineData[208]++;
      return true;
    }
  }
  _$jscoverage['/menu/control.js'].lineData[212]++;
  return false;
}}, {
  ATTRS: {
  highlightedItem: {
  value: null}, 
  defaultChildCfg: {
  valueFn: function() {
  _$jscoverage['/menu/control.js'].functionData[11]++;
  _$jscoverage['/menu/control.js'].lineData[231]++;
  return {
  xclass: 'menuitem'};
}}}, 
  xclass: 'menu'});
  _$jscoverage['/menu/control.js'].lineData[241]++;
  function afterHighlightedItemChange(e) {
    _$jscoverage['/menu/control.js'].functionData[12]++;
    _$jscoverage['/menu/control.js'].lineData[242]++;
    if (visit22_242_1(e.target.isMenu)) {
      _$jscoverage['/menu/control.js'].lineData[243]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menu/control.js'].lineData[245]++;
      el.setAttribute('aria-activedescendant', visit23_245_1(visit24_245_2(menuItem && menuItem.el.id) || ''));
    }
  }
});
