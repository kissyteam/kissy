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
  _$jscoverage['/menu/control.js'].lineData[72] = 0;
  _$jscoverage['/menu/control.js'].lineData[73] = 0;
  _$jscoverage['/menu/control.js'].lineData[74] = 0;
  _$jscoverage['/menu/control.js'].lineData[75] = 0;
  _$jscoverage['/menu/control.js'].lineData[82] = 0;
  _$jscoverage['/menu/control.js'].lineData[85] = 0;
  _$jscoverage['/menu/control.js'].lineData[86] = 0;
  _$jscoverage['/menu/control.js'].lineData[87] = 0;
  _$jscoverage['/menu/control.js'].lineData[88] = 0;
  _$jscoverage['/menu/control.js'].lineData[90] = 0;
  _$jscoverage['/menu/control.js'].lineData[92] = 0;
  _$jscoverage['/menu/control.js'].lineData[110] = 0;
  _$jscoverage['/menu/control.js'].lineData[113] = 0;
  _$jscoverage['/menu/control.js'].lineData[116] = 0;
  _$jscoverage['/menu/control.js'].lineData[117] = 0;
  _$jscoverage['/menu/control.js'].lineData[120] = 0;
  _$jscoverage['/menu/control.js'].lineData[123] = 0;
  _$jscoverage['/menu/control.js'].lineData[124] = 0;
  _$jscoverage['/menu/control.js'].lineData[127] = 0;
  _$jscoverage['/menu/control.js'].lineData[130] = 0;
  _$jscoverage['/menu/control.js'].lineData[134] = 0;
  _$jscoverage['/menu/control.js'].lineData[135] = 0;
  _$jscoverage['/menu/control.js'].lineData[137] = 0;
  _$jscoverage['/menu/control.js'].lineData[141] = 0;
  _$jscoverage['/menu/control.js'].lineData[142] = 0;
  _$jscoverage['/menu/control.js'].lineData[145] = 0;
  _$jscoverage['/menu/control.js'].lineData[146] = 0;
  _$jscoverage['/menu/control.js'].lineData[149] = 0;
  _$jscoverage['/menu/control.js'].lineData[150] = 0;
  _$jscoverage['/menu/control.js'].lineData[152] = 0;
  _$jscoverage['/menu/control.js'].lineData[153] = 0;
  _$jscoverage['/menu/control.js'].lineData[155] = 0;
  _$jscoverage['/menu/control.js'].lineData[156] = 0;
  _$jscoverage['/menu/control.js'].lineData[159] = 0;
  _$jscoverage['/menu/control.js'].lineData[160] = 0;
  _$jscoverage['/menu/control.js'].lineData[162] = 0;
  _$jscoverage['/menu/control.js'].lineData[163] = 0;
  _$jscoverage['/menu/control.js'].lineData[165] = 0;
  _$jscoverage['/menu/control.js'].lineData[166] = 0;
  _$jscoverage['/menu/control.js'].lineData[168] = 0;
  _$jscoverage['/menu/control.js'].lineData[169] = 0;
  _$jscoverage['/menu/control.js'].lineData[174] = 0;
  _$jscoverage['/menu/control.js'].lineData[176] = 0;
  _$jscoverage['/menu/control.js'].lineData[187] = 0;
  _$jscoverage['/menu/control.js'].lineData[190] = 0;
  _$jscoverage['/menu/control.js'].lineData[191] = 0;
  _$jscoverage['/menu/control.js'].lineData[194] = 0;
  _$jscoverage['/menu/control.js'].lineData[195] = 0;
  _$jscoverage['/menu/control.js'].lineData[198] = 0;
  _$jscoverage['/menu/control.js'].lineData[200] = 0;
  _$jscoverage['/menu/control.js'].lineData[201] = 0;
  _$jscoverage['/menu/control.js'].lineData[202] = 0;
  _$jscoverage['/menu/control.js'].lineData[203] = 0;
  _$jscoverage['/menu/control.js'].lineData[207] = 0;
  _$jscoverage['/menu/control.js'].lineData[237] = 0;
  _$jscoverage['/menu/control.js'].lineData[238] = 0;
  _$jscoverage['/menu/control.js'].lineData[239] = 0;
  _$jscoverage['/menu/control.js'].lineData[241] = 0;
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
  _$jscoverage['/menu/control.js'].branchData['87'] = [];
  _$jscoverage['/menu/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['91'] = [];
  _$jscoverage['/menu/control.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['116'] = [];
  _$jscoverage['/menu/control.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['123'] = [];
  _$jscoverage['/menu/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['149'] = [];
  _$jscoverage['/menu/control.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['159'] = [];
  _$jscoverage['/menu/control.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['168'] = [];
  _$jscoverage['/menu/control.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['190'] = [];
  _$jscoverage['/menu/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['194'] = [];
  _$jscoverage['/menu/control.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['200'] = [];
  _$jscoverage['/menu/control.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['202'] = [];
  _$jscoverage['/menu/control.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['238'] = [];
  _$jscoverage['/menu/control.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['241'] = [];
  _$jscoverage['/menu/control.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['241'][2] = new BranchData();
}
_$jscoverage['/menu/control.js'].branchData['241'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit23_241_2(result) {
  _$jscoverage['/menu/control.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['241'][1].init(121, 32, 'menuItem && menuItem.el.id || \'\'');
function visit22_241_1(result) {
  _$jscoverage['/menu/control.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['238'][1].init(13, 15, 'e.target.isMenu');
function visit21_238_1(result) {
  _$jscoverage['/menu/control.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['202'][1].init(62, 55, 'child.containsElement && child.containsElement(element)');
function visit20_202_1(result) {
  _$jscoverage['/menu/control.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['200'][1].init(354, 9, 'i < count');
function visit19_200_1(result) {
  _$jscoverage['/menu/control.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['194'][1].init(169, 34, 'self.view.containsElement(element)');
function visit18_194_1(result) {
  _$jscoverage['/menu/control.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['190'][1].init(71, 33, '!self.get(\'visible\') || !self.$el');
function visit17_190_1(result) {
  _$jscoverage['/menu/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['168'][1].init(2135, 15, 'nextHighlighted');
function visit16_168_1(result) {
  _$jscoverage['/menu/control.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['159'][1].init(42, 16, '!highlightedItem');
function visit15_159_1(result) {
  _$jscoverage['/menu/control.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['149'][1].init(40, 16, '!highlightedItem');
function visit14_149_1(result) {
  _$jscoverage['/menu/control.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['123'][1].init(440, 9, 'len === 0');
function visit13_123_1(result) {
  _$jscoverage['/menu/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['116'][1].init(228, 59, 'highlightedItem && highlightedItem.handleKeyDownInternal(e)');
function visit12_116_1(result) {
  _$jscoverage['/menu/control.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['91'][1].init(253, 11, 'index !== o');
function visit11_91_1(result) {
  _$jscoverage['/menu/control.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['87'][2].init(85, 26, 'c.get(\'visible\') !== false');
function visit10_87_2(result) {
  _$jscoverage['/menu/control.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['87'][1].init(62, 50, '!c.get(\'disabled\') && (c.get(\'visible\') !== false)');
function visit9_87_1(result) {
  _$jscoverage['/menu/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['65'][1].init(148, 40, 'rootMenu && rootMenu._popupAutoHideTimer');
function visit8_65_1(result) {
  _$jscoverage['/menu/control.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['47'][1].init(81, 53, '!v && (highlightedItem = this.get(\'highlightedItem\'))');
function visit7_47_1(result) {
  _$jscoverage['/menu/control.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['34'][2].init(223, 36, 'ev && (highlightedItem = ev.prevVal)');
function visit6_34_2(result) {
  _$jscoverage['/menu/control.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['34'][1].init(218, 41, 'v && ev && (highlightedItem = ev.prevVal)');
function visit5_34_1(result) {
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
  if (visit5_34_1(v && visit6_34_2(ev && (highlightedItem = ev.prevVal)))) {
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
  if (visit7_47_1(!v && (highlightedItem = this.get('highlightedItem')))) {
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
  if (visit8_65_1(rootMenu && rootMenu._popupAutoHideTimer)) {
    _$jscoverage['/menu/control.js'].lineData[66]++;
    clearTimeout(rootMenu._popupAutoHideTimer);
    _$jscoverage['/menu/control.js'].lineData[67]++;
    rootMenu._popupAutoHideTimer = null;
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[6]++;
  _$jscoverage['/menu/control.js'].lineData[72]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[73]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[74]++;
  if ((highlightedItem = this.get('highlightedItem'))) {
    _$jscoverage['/menu/control.js'].lineData[75]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  _getNextEnabledHighlighted: function(index, dir) {
  _$jscoverage['/menu/control.js'].functionData[7]++;
  _$jscoverage['/menu/control.js'].lineData[82]++;
  var children = this.get('children'), len = children.length, o = index;
  _$jscoverage['/menu/control.js'].lineData[85]++;
  do {
    _$jscoverage['/menu/control.js'].lineData[86]++;
    var c = children[index];
    _$jscoverage['/menu/control.js'].lineData[87]++;
    if (visit9_87_1(!c.get('disabled') && (visit10_87_2(c.get('visible') !== false)))) {
      _$jscoverage['/menu/control.js'].lineData[88]++;
      return children[index];
    }
    _$jscoverage['/menu/control.js'].lineData[90]++;
    index = (index + dir + len) % len;
  } while (visit11_91_1(index !== o));
  _$jscoverage['/menu/control.js'].lineData[92]++;
  return undefined;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[8]++;
  _$jscoverage['/menu/control.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[113]++;
  var highlightedItem = self.get('highlightedItem');
  _$jscoverage['/menu/control.js'].lineData[116]++;
  if (visit12_116_1(highlightedItem && highlightedItem.handleKeyDownInternal(e))) {
    _$jscoverage['/menu/control.js'].lineData[117]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[120]++;
  var children = self.get('children'), len = children.length;
  _$jscoverage['/menu/control.js'].lineData[123]++;
  if (visit13_123_1(len === 0)) {
    _$jscoverage['/menu/control.js'].lineData[124]++;
    return undefined;
  }
  _$jscoverage['/menu/control.js'].lineData[127]++;
  var index, destIndex, nextHighlighted;
  _$jscoverage['/menu/control.js'].lineData[130]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/menu/control.js'].lineData[134]++;
      if ((highlightedItem = self.get('highlightedItem'))) {
        _$jscoverage['/menu/control.js'].lineData[135]++;
        highlightedItem.set('highlighted', false);
      }
      _$jscoverage['/menu/control.js'].lineData[137]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/menu/control.js'].lineData[141]++;
      nextHighlighted = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/menu/control.js'].lineData[142]++;
      break;
    case KeyCode.END:
      _$jscoverage['/menu/control.js'].lineData[145]++;
      nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
      _$jscoverage['/menu/control.js'].lineData[146]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/menu/control.js'].lineData[149]++;
      if (visit14_149_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[150]++;
        destIndex = len - 1;
      } else {
        _$jscoverage['/menu/control.js'].lineData[152]++;
        index = S.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[153]++;
        destIndex = (index - 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[155]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
      _$jscoverage['/menu/control.js'].lineData[156]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/menu/control.js'].lineData[159]++;
      if (visit15_159_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[160]++;
        destIndex = 0;
      } else {
        _$jscoverage['/menu/control.js'].lineData[162]++;
        index = S.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[163]++;
        destIndex = (index + 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[165]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
      _$jscoverage['/menu/control.js'].lineData[166]++;
      break;
  }
  _$jscoverage['/menu/control.js'].lineData[168]++;
  if (visit16_168_1(nextHighlighted)) {
    _$jscoverage['/menu/control.js'].lineData[169]++;
    nextHighlighted.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
    _$jscoverage['/menu/control.js'].lineData[174]++;
    return true;
  } else {
    _$jscoverage['/menu/control.js'].lineData[176]++;
    return undefined;
  }
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/control.js'].functionData[9]++;
  _$jscoverage['/menu/control.js'].lineData[187]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[190]++;
  if (visit17_190_1(!self.get('visible') || !self.$el)) {
    _$jscoverage['/menu/control.js'].lineData[191]++;
    return false;
  }
  _$jscoverage['/menu/control.js'].lineData[194]++;
  if (visit18_194_1(self.view.containsElement(element))) {
    _$jscoverage['/menu/control.js'].lineData[195]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[198]++;
  var children = self.get('children');
  _$jscoverage['/menu/control.js'].lineData[200]++;
  for (var i = 0, count = children.length; visit19_200_1(i < count); i++) {
    _$jscoverage['/menu/control.js'].lineData[201]++;
    var child = children[i];
    _$jscoverage['/menu/control.js'].lineData[202]++;
    if (visit20_202_1(child.containsElement && child.containsElement(element))) {
      _$jscoverage['/menu/control.js'].lineData[203]++;
      return true;
    }
  }
  _$jscoverage['/menu/control.js'].lineData[207]++;
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
  _$jscoverage['/menu/control.js'].lineData[237]++;
  function afterHighlightedItemChange(e) {
    _$jscoverage['/menu/control.js'].functionData[10]++;
    _$jscoverage['/menu/control.js'].lineData[238]++;
    if (visit21_238_1(e.target.isMenu)) {
      _$jscoverage['/menu/control.js'].lineData[239]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menu/control.js'].lineData[241]++;
      el.setAttribute('aria-activedescendant', visit22_241_1(visit23_241_2(menuItem && menuItem.el.id) || ''));
    }
  }
});
