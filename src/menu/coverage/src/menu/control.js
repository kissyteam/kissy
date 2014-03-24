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
  _$jscoverage['/menu/control.js'].lineData[12] = 0;
  _$jscoverage['/menu/control.js'].lineData[20] = 0;
  _$jscoverage['/menu/control.js'].lineData[30] = 0;
  _$jscoverage['/menu/control.js'].lineData[34] = 0;
  _$jscoverage['/menu/control.js'].lineData[36] = 0;
  _$jscoverage['/menu/control.js'].lineData[45] = 0;
  _$jscoverage['/menu/control.js'].lineData[46] = 0;
  _$jscoverage['/menu/control.js'].lineData[47] = 0;
  _$jscoverage['/menu/control.js'].lineData[48] = 0;
  _$jscoverage['/menu/control.js'].lineData[53] = 0;
  _$jscoverage['/menu/control.js'].lineData[54] = 0;
  _$jscoverage['/menu/control.js'].lineData[58] = 0;
  _$jscoverage['/menu/control.js'].lineData[62] = 0;
  _$jscoverage['/menu/control.js'].lineData[63] = 0;
  _$jscoverage['/menu/control.js'].lineData[65] = 0;
  _$jscoverage['/menu/control.js'].lineData[66] = 0;
  _$jscoverage['/menu/control.js'].lineData[67] = 0;
  _$jscoverage['/menu/control.js'].lineData[69] = 0;
  _$jscoverage['/menu/control.js'].lineData[73] = 0;
  _$jscoverage['/menu/control.js'].lineData[74] = 0;
  _$jscoverage['/menu/control.js'].lineData[75] = 0;
  _$jscoverage['/menu/control.js'].lineData[76] = 0;
  _$jscoverage['/menu/control.js'].lineData[83] = 0;
  _$jscoverage['/menu/control.js'].lineData[86] = 0;
  _$jscoverage['/menu/control.js'].lineData[87] = 0;
  _$jscoverage['/menu/control.js'].lineData[88] = 0;
  _$jscoverage['/menu/control.js'].lineData[89] = 0;
  _$jscoverage['/menu/control.js'].lineData[91] = 0;
  _$jscoverage['/menu/control.js'].lineData[93] = 0;
  _$jscoverage['/menu/control.js'].lineData[111] = 0;
  _$jscoverage['/menu/control.js'].lineData[114] = 0;
  _$jscoverage['/menu/control.js'].lineData[117] = 0;
  _$jscoverage['/menu/control.js'].lineData[118] = 0;
  _$jscoverage['/menu/control.js'].lineData[121] = 0;
  _$jscoverage['/menu/control.js'].lineData[124] = 0;
  _$jscoverage['/menu/control.js'].lineData[125] = 0;
  _$jscoverage['/menu/control.js'].lineData[128] = 0;
  _$jscoverage['/menu/control.js'].lineData[131] = 0;
  _$jscoverage['/menu/control.js'].lineData[135] = 0;
  _$jscoverage['/menu/control.js'].lineData[136] = 0;
  _$jscoverage['/menu/control.js'].lineData[138] = 0;
  _$jscoverage['/menu/control.js'].lineData[142] = 0;
  _$jscoverage['/menu/control.js'].lineData[143] = 0;
  _$jscoverage['/menu/control.js'].lineData[146] = 0;
  _$jscoverage['/menu/control.js'].lineData[147] = 0;
  _$jscoverage['/menu/control.js'].lineData[150] = 0;
  _$jscoverage['/menu/control.js'].lineData[151] = 0;
  _$jscoverage['/menu/control.js'].lineData[153] = 0;
  _$jscoverage['/menu/control.js'].lineData[154] = 0;
  _$jscoverage['/menu/control.js'].lineData[156] = 0;
  _$jscoverage['/menu/control.js'].lineData[157] = 0;
  _$jscoverage['/menu/control.js'].lineData[160] = 0;
  _$jscoverage['/menu/control.js'].lineData[161] = 0;
  _$jscoverage['/menu/control.js'].lineData[163] = 0;
  _$jscoverage['/menu/control.js'].lineData[164] = 0;
  _$jscoverage['/menu/control.js'].lineData[166] = 0;
  _$jscoverage['/menu/control.js'].lineData[167] = 0;
  _$jscoverage['/menu/control.js'].lineData[169] = 0;
  _$jscoverage['/menu/control.js'].lineData[170] = 0;
  _$jscoverage['/menu/control.js'].lineData[175] = 0;
  _$jscoverage['/menu/control.js'].lineData[177] = 0;
  _$jscoverage['/menu/control.js'].lineData[188] = 0;
  _$jscoverage['/menu/control.js'].lineData[191] = 0;
  _$jscoverage['/menu/control.js'].lineData[192] = 0;
  _$jscoverage['/menu/control.js'].lineData[195] = 0;
  _$jscoverage['/menu/control.js'].lineData[196] = 0;
  _$jscoverage['/menu/control.js'].lineData[199] = 0;
  _$jscoverage['/menu/control.js'].lineData[201] = 0;
  _$jscoverage['/menu/control.js'].lineData[202] = 0;
  _$jscoverage['/menu/control.js'].lineData[203] = 0;
  _$jscoverage['/menu/control.js'].lineData[204] = 0;
  _$jscoverage['/menu/control.js'].lineData[208] = 0;
  _$jscoverage['/menu/control.js'].lineData[238] = 0;
  _$jscoverage['/menu/control.js'].lineData[239] = 0;
  _$jscoverage['/menu/control.js'].lineData[240] = 0;
  _$jscoverage['/menu/control.js'].lineData[242] = 0;
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
}
if (! _$jscoverage['/menu/control.js'].branchData) {
  _$jscoverage['/menu/control.js'].branchData = {};
  _$jscoverage['/menu/control.js'].branchData['34'] = [];
  _$jscoverage['/menu/control.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['47'] = [];
  _$jscoverage['/menu/control.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['65'] = [];
  _$jscoverage['/menu/control.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['88'] = [];
  _$jscoverage['/menu/control.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['92'] = [];
  _$jscoverage['/menu/control.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['117'] = [];
  _$jscoverage['/menu/control.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['124'] = [];
  _$jscoverage['/menu/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['150'] = [];
  _$jscoverage['/menu/control.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['160'] = [];
  _$jscoverage['/menu/control.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['169'] = [];
  _$jscoverage['/menu/control.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['191'] = [];
  _$jscoverage['/menu/control.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['195'] = [];
  _$jscoverage['/menu/control.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['201'] = [];
  _$jscoverage['/menu/control.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['203'] = [];
  _$jscoverage['/menu/control.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['239'] = [];
  _$jscoverage['/menu/control.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['242'] = [];
  _$jscoverage['/menu/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['242'][2] = new BranchData();
}
_$jscoverage['/menu/control.js'].branchData['242'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit26_242_2(result) {
  _$jscoverage['/menu/control.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['242'][1].init(121, 32, 'menuItem && menuItem.el.id || \'\'');
function visit25_242_1(result) {
  _$jscoverage['/menu/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['239'][1].init(13, 15, 'e.target.isMenu');
function visit24_239_1(result) {
  _$jscoverage['/menu/control.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['203'][1].init(62, 55, 'child.containsElement && child.containsElement(element)');
function visit23_203_1(result) {
  _$jscoverage['/menu/control.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['201'][1].init(354, 9, 'i < count');
function visit22_201_1(result) {
  _$jscoverage['/menu/control.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['195'][1].init(169, 34, 'self.view.containsElement(element)');
function visit21_195_1(result) {
  _$jscoverage['/menu/control.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['191'][1].init(71, 33, '!self.get(\'visible\') || !self.$el');
function visit20_191_1(result) {
  _$jscoverage['/menu/control.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['169'][1].init(2135, 15, 'nextHighlighted');
function visit19_169_1(result) {
  _$jscoverage['/menu/control.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['160'][1].init(42, 16, '!highlightedItem');
function visit18_160_1(result) {
  _$jscoverage['/menu/control.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['150'][1].init(40, 16, '!highlightedItem');
function visit17_150_1(result) {
  _$jscoverage['/menu/control.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['124'][1].init(440, 9, 'len === 0');
function visit16_124_1(result) {
  _$jscoverage['/menu/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['117'][1].init(228, 59, 'highlightedItem && highlightedItem.handleKeyDownInternal(e)');
function visit15_117_1(result) {
  _$jscoverage['/menu/control.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['92'][1].init(253, 11, 'index !== o');
function visit14_92_1(result) {
  _$jscoverage['/menu/control.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['88'][2].init(85, 26, 'c.get(\'visible\') !== false');
function visit13_88_2(result) {
  _$jscoverage['/menu/control.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['88'][1].init(62, 50, '!c.get(\'disabled\') && (c.get(\'visible\') !== false)');
function visit12_88_1(result) {
  _$jscoverage['/menu/control.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['65'][1].init(148, 40, 'rootMenu && rootMenu._popupAutoHideTimer');
function visit11_65_1(result) {
  _$jscoverage['/menu/control.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['47'][1].init(81, 53, '!v && (highlightedItem = this.get(\'highlightedItem\'))');
function visit10_47_1(result) {
  _$jscoverage['/menu/control.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['34'][2].init(223, 36, 'ev && (highlightedItem = ev.prevVal)');
function visit9_34_2(result) {
  _$jscoverage['/menu/control.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['34'][1].init(218, 41, 'v && ev && (highlightedItem = ev.prevVal)');
function visit8_34_1(result) {
  _$jscoverage['/menu/control.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menu/control.js'].functionData[0]++;
  _$jscoverage['/menu/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/menu/control.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/menu/control.js'].lineData[9]++;
  var DelegateChildrenExtension = require('component/extension/delegate-children');
  _$jscoverage['/menu/control.js'].lineData[10]++;
  var MenuRender = require('./menu-render');
  _$jscoverage['/menu/control.js'].lineData[12]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/menu/control.js'].lineData[20]++;
  return Container.extend([DelegateChildrenExtension], {
  isMenu: 1, 
  _onSetHighlightedItem: function(v, ev) {
  _$jscoverage['/menu/control.js'].functionData[1]++;
  _$jscoverage['/menu/control.js'].lineData[30]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[34]++;
  if (visit8_34_1(v && visit9_34_2(ev && (highlightedItem = ev.prevVal)))) {
    _$jscoverage['/menu/control.js'].lineData[36]++;
    highlightedItem.set('highlighted', false, {
  data: {
  byPassSetHighlightedItem: 1}});
  }
}, 
  _onSetVisible: function(v, e) {
  _$jscoverage['/menu/control.js'].functionData[2]++;
  _$jscoverage['/menu/control.js'].lineData[45]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[46]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[47]++;
  if (visit10_47_1(!v && (highlightedItem = this.get('highlightedItem')))) {
    _$jscoverage['/menu/control.js'].lineData[48]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  bindUI: function() {
  _$jscoverage['/menu/control.js'].functionData[3]++;
  _$jscoverage['/menu/control.js'].lineData[53]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[54]++;
  self.on('afterHighlightedItemChange', afterHighlightedItemChange, self);
}, 
  getRootMenu: function() {
  _$jscoverage['/menu/control.js'].functionData[4]++;
  _$jscoverage['/menu/control.js'].lineData[58]++;
  return this;
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[5]++;
  _$jscoverage['/menu/control.js'].lineData[62]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[63]++;
  var rootMenu = this.getRootMenu();
  _$jscoverage['/menu/control.js'].lineData[65]++;
  if (visit11_65_1(rootMenu && rootMenu._popupAutoHideTimer)) {
    _$jscoverage['/menu/control.js'].lineData[66]++;
    clearTimeout(rootMenu._popupAutoHideTimer);
    _$jscoverage['/menu/control.js'].lineData[67]++;
    rootMenu._popupAutoHideTimer = null;
  }
  _$jscoverage['/menu/control.js'].lineData[69]++;
  this.focus();
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[6]++;
  _$jscoverage['/menu/control.js'].lineData[73]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[74]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[75]++;
  if ((highlightedItem = this.get('highlightedItem'))) {
    _$jscoverage['/menu/control.js'].lineData[76]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  _getNextEnabledHighlighted: function(index, dir) {
  _$jscoverage['/menu/control.js'].functionData[7]++;
  _$jscoverage['/menu/control.js'].lineData[83]++;
  var children = this.get('children'), len = children.length, o = index;
  _$jscoverage['/menu/control.js'].lineData[86]++;
  do {
    _$jscoverage['/menu/control.js'].lineData[87]++;
    var c = children[index];
    _$jscoverage['/menu/control.js'].lineData[88]++;
    if (visit12_88_1(!c.get('disabled') && (visit13_88_2(c.get('visible') !== false)))) {
      _$jscoverage['/menu/control.js'].lineData[89]++;
      return children[index];
    }
    _$jscoverage['/menu/control.js'].lineData[91]++;
    index = (index + dir + len) % len;
  } while (visit14_92_1(index !== o));
  _$jscoverage['/menu/control.js'].lineData[93]++;
  return undefined;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[8]++;
  _$jscoverage['/menu/control.js'].lineData[111]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[114]++;
  var highlightedItem = self.get('highlightedItem');
  _$jscoverage['/menu/control.js'].lineData[117]++;
  if (visit15_117_1(highlightedItem && highlightedItem.handleKeyDownInternal(e))) {
    _$jscoverage['/menu/control.js'].lineData[118]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[121]++;
  var children = self.get('children'), len = children.length;
  _$jscoverage['/menu/control.js'].lineData[124]++;
  if (visit16_124_1(len === 0)) {
    _$jscoverage['/menu/control.js'].lineData[125]++;
    return undefined;
  }
  _$jscoverage['/menu/control.js'].lineData[128]++;
  var index, destIndex, nextHighlighted;
  _$jscoverage['/menu/control.js'].lineData[131]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/menu/control.js'].lineData[135]++;
      if ((highlightedItem = self.get('highlightedItem'))) {
        _$jscoverage['/menu/control.js'].lineData[136]++;
        highlightedItem.set('highlighted', false);
      }
      _$jscoverage['/menu/control.js'].lineData[138]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/menu/control.js'].lineData[142]++;
      nextHighlighted = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/menu/control.js'].lineData[143]++;
      break;
    case KeyCode.END:
      _$jscoverage['/menu/control.js'].lineData[146]++;
      nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
      _$jscoverage['/menu/control.js'].lineData[147]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/menu/control.js'].lineData[150]++;
      if (visit17_150_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[151]++;
        destIndex = len - 1;
      } else {
        _$jscoverage['/menu/control.js'].lineData[153]++;
        index = S.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[154]++;
        destIndex = (index - 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[156]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
      _$jscoverage['/menu/control.js'].lineData[157]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/menu/control.js'].lineData[160]++;
      if (visit18_160_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[161]++;
        destIndex = 0;
      } else {
        _$jscoverage['/menu/control.js'].lineData[163]++;
        index = S.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[164]++;
        destIndex = (index + 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[166]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
      _$jscoverage['/menu/control.js'].lineData[167]++;
      break;
  }
  _$jscoverage['/menu/control.js'].lineData[169]++;
  if (visit19_169_1(nextHighlighted)) {
    _$jscoverage['/menu/control.js'].lineData[170]++;
    nextHighlighted.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
    _$jscoverage['/menu/control.js'].lineData[175]++;
    return true;
  } else {
    _$jscoverage['/menu/control.js'].lineData[177]++;
    return undefined;
  }
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/control.js'].functionData[9]++;
  _$jscoverage['/menu/control.js'].lineData[188]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[191]++;
  if (visit20_191_1(!self.get('visible') || !self.$el)) {
    _$jscoverage['/menu/control.js'].lineData[192]++;
    return false;
  }
  _$jscoverage['/menu/control.js'].lineData[195]++;
  if (visit21_195_1(self.view.containsElement(element))) {
    _$jscoverage['/menu/control.js'].lineData[196]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[199]++;
  var children = self.get('children');
  _$jscoverage['/menu/control.js'].lineData[201]++;
  for (var i = 0, count = children.length; visit22_201_1(i < count); i++) {
    _$jscoverage['/menu/control.js'].lineData[202]++;
    var child = children[i];
    _$jscoverage['/menu/control.js'].lineData[203]++;
    if (visit23_203_1(child.containsElement && child.containsElement(element))) {
      _$jscoverage['/menu/control.js'].lineData[204]++;
      return true;
    }
  }
  _$jscoverage['/menu/control.js'].lineData[208]++;
  return false;
}}, {
  ATTRS: {
  highlightedItem: {
  value: null}, 
  xrender: {
  value: MenuRender}, 
  defaultChildCfg: {
  value: {
  xclass: 'menuitem'}}}, 
  xclass: 'menu'});
  _$jscoverage['/menu/control.js'].lineData[238]++;
  function afterHighlightedItemChange(e) {
    _$jscoverage['/menu/control.js'].functionData[10]++;
    _$jscoverage['/menu/control.js'].lineData[239]++;
    if (visit24_239_1(e.target.isMenu)) {
      _$jscoverage['/menu/control.js'].lineData[240]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menu/control.js'].lineData[242]++;
      el.setAttribute('aria-activedescendant', visit25_242_1(visit26_242_2(menuItem && menuItem.el.id) || ''));
    }
  }
});
