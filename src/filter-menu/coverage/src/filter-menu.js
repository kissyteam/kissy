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
if (! _$jscoverage['/filter-menu.js']) {
  _$jscoverage['/filter-menu.js'] = {};
  _$jscoverage['/filter-menu.js'].lineData = [];
  _$jscoverage['/filter-menu.js'].lineData[6] = 0;
  _$jscoverage['/filter-menu.js'].lineData[7] = 0;
  _$jscoverage['/filter-menu.js'].lineData[8] = 0;
  _$jscoverage['/filter-menu.js'].lineData[10] = 0;
  _$jscoverage['/filter-menu.js'].lineData[18] = 0;
  _$jscoverage['/filter-menu.js'].lineData[20] = 0;
  _$jscoverage['/filter-menu.js'].lineData[23] = 0;
  _$jscoverage['/filter-menu.js'].lineData[27] = 0;
  _$jscoverage['/filter-menu.js'].lineData[28] = 0;
  _$jscoverage['/filter-menu.js'].lineData[31] = 0;
  _$jscoverage['/filter-menu.js'].lineData[35] = 0;
  _$jscoverage['/filter-menu.js'].lineData[40] = 0;
  _$jscoverage['/filter-menu.js'].lineData[41] = 0;
  _$jscoverage['/filter-menu.js'].lineData[42] = 0;
  _$jscoverage['/filter-menu.js'].lineData[43] = 0;
  _$jscoverage['/filter-menu.js'].lineData[46] = 0;
  _$jscoverage['/filter-menu.js'].lineData[47] = 0;
  _$jscoverage['/filter-menu.js'].lineData[52] = 0;
  _$jscoverage['/filter-menu.js'].lineData[53] = 0;
  _$jscoverage['/filter-menu.js'].lineData[54] = 0;
  _$jscoverage['/filter-menu.js'].lineData[55] = 0;
  _$jscoverage['/filter-menu.js'].lineData[62] = 0;
  _$jscoverage['/filter-menu.js'].lineData[70] = 0;
  _$jscoverage['/filter-menu.js'].lineData[76] = 0;
  _$jscoverage['/filter-menu.js'].lineData[78] = 0;
  _$jscoverage['/filter-menu.js'].lineData[79] = 0;
  _$jscoverage['/filter-menu.js'].lineData[82] = 0;
  _$jscoverage['/filter-menu.js'].lineData[86] = 0;
  _$jscoverage['/filter-menu.js'].lineData[88] = 0;
  _$jscoverage['/filter-menu.js'].lineData[89] = 0;
  _$jscoverage['/filter-menu.js'].lineData[94] = 0;
  _$jscoverage['/filter-menu.js'].lineData[95] = 0;
  _$jscoverage['/filter-menu.js'].lineData[96] = 0;
  _$jscoverage['/filter-menu.js'].lineData[97] = 0;
  _$jscoverage['/filter-menu.js'].lineData[99] = 0;
  _$jscoverage['/filter-menu.js'].lineData[100] = 0;
  _$jscoverage['/filter-menu.js'].lineData[103] = 0;
  _$jscoverage['/filter-menu.js'].lineData[104] = 0;
  _$jscoverage['/filter-menu.js'].lineData[106] = 0;
  _$jscoverage['/filter-menu.js'].lineData[108] = 0;
  _$jscoverage['/filter-menu.js'].lineData[111] = 0;
  _$jscoverage['/filter-menu.js'].lineData[112] = 0;
  _$jscoverage['/filter-menu.js'].lineData[118] = 0;
  _$jscoverage['/filter-menu.js'].lineData[120] = 0;
  _$jscoverage['/filter-menu.js'].lineData[122] = 0;
  _$jscoverage['/filter-menu.js'].lineData[125] = 0;
  _$jscoverage['/filter-menu.js'].lineData[129] = 0;
  _$jscoverage['/filter-menu.js'].lineData[133] = 0;
  _$jscoverage['/filter-menu.js'].lineData[134] = 0;
  _$jscoverage['/filter-menu.js'].lineData[135] = 0;
  _$jscoverage['/filter-menu.js'].lineData[139] = 0;
  _$jscoverage['/filter-menu.js'].lineData[140] = 0;
  _$jscoverage['/filter-menu.js'].lineData[142] = 0;
  _$jscoverage['/filter-menu.js'].lineData[145] = 0;
  _$jscoverage['/filter-menu.js'].lineData[147] = 0;
  _$jscoverage['/filter-menu.js'].lineData[148] = 0;
  _$jscoverage['/filter-menu.js'].lineData[153] = 0;
  _$jscoverage['/filter-menu.js'].lineData[163] = 0;
  _$jscoverage['/filter-menu.js'].lineData[164] = 0;
  _$jscoverage['/filter-menu.js'].lineData[165] = 0;
  _$jscoverage['/filter-menu.js'].lineData[166] = 0;
}
if (! _$jscoverage['/filter-menu.js'].functionData) {
  _$jscoverage['/filter-menu.js'].functionData = [];
  _$jscoverage['/filter-menu.js'].functionData[0] = 0;
  _$jscoverage['/filter-menu.js'].functionData[1] = 0;
  _$jscoverage['/filter-menu.js'].functionData[2] = 0;
  _$jscoverage['/filter-menu.js'].functionData[3] = 0;
  _$jscoverage['/filter-menu.js'].functionData[4] = 0;
  _$jscoverage['/filter-menu.js'].functionData[5] = 0;
  _$jscoverage['/filter-menu.js'].functionData[6] = 0;
  _$jscoverage['/filter-menu.js'].functionData[7] = 0;
  _$jscoverage['/filter-menu.js'].functionData[8] = 0;
}
if (! _$jscoverage['/filter-menu.js'].branchData) {
  _$jscoverage['/filter-menu.js'].branchData = {};
  _$jscoverage['/filter-menu.js'].branchData['42'] = [];
  _$jscoverage['/filter-menu.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['46'] = [];
  _$jscoverage['/filter-menu.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['52'] = [];
  _$jscoverage['/filter-menu.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['54'] = [];
  _$jscoverage['/filter-menu.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['78'] = [];
  _$jscoverage['/filter-menu.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['88'] = [];
  _$jscoverage['/filter-menu.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['94'] = [];
  _$jscoverage['/filter-menu.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['96'] = [];
  _$jscoverage['/filter-menu.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['101'] = [];
  _$jscoverage['/filter-menu.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['103'] = [];
  _$jscoverage['/filter-menu.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['103'][3] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['111'] = [];
  _$jscoverage['/filter-menu.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['112'] = [];
  _$jscoverage['/filter-menu.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['122'] = [];
  _$jscoverage['/filter-menu.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['130'] = [];
  _$jscoverage['/filter-menu.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['135'] = [];
  _$jscoverage['/filter-menu.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['142'] = [];
  _$jscoverage['/filter-menu.js'].branchData['142'][1] = new BranchData();
}
_$jscoverage['/filter-menu.js'].branchData['142'][1].init(29, 25, 'content.indexOf(str) > -1');
function visit22_142_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['135'][1].init(77, 4, '!str');
function visit21_135_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['130'][1].init(65, 44, 'str && new RegExp(S.escapeRegExp(str), \'ig\')');
function visit20_130_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['122'][1].init(1788, 46, 'oldEnteredItems.length !== enteredItems.length');
function visit19_122_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['112'][1].init(35, 14, 'match[2] || \'\'');
function visit18_112_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['111'][1].init(78, 5, 'match');
function visit17_111_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['103'][3].init(379, 30, 'content.indexOf(lastWord) > -1');
function visit16_103_3(result) {
  _$jscoverage['/filter-menu.js'].branchData['103'][3].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['103'][2].init(379, 42, 'content.indexOf(lastWord) > -1 && lastWord');
function visit15_103_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['103'][1].init(368, 53, 'content && content.indexOf(lastWord) > -1 && lastWord');
function visit14_103_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['101'][1].init(81, 27, 'item && item.get(\'content\')');
function visit13_101_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['96'][1].init(72, 5, 'match');
function visit12_96_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['94'][1].init(507, 22, '/[,\\uff0c]$/.test(str)');
function visit11_94_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['88'][1].init(316, 5, 'match');
function visit10_88_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['78'][1].init(327, 25, 'self.get(\'allowMultiple\')');
function visit9_78_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['54'][1].init(102, 15, 'highlightedItem');
function visit8_54_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['52'][2].init(696, 51, '!highlightedItem || !highlightedItem.get(\'visible\')');
function visit7_52_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['52'][1].init(688, 60, 'str && (!highlightedItem || !highlightedItem.get(\'visible\'))');
function visit6_52_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['46'][1].init(454, 23, '!str && highlightedItem');
function visit5_46_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['42'][1].init(335, 25, 'self.get(\'allowMultiple\')');
function visit4_42_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/filter-menu.js'].functionData[0]++;
  _$jscoverage['/filter-menu.js'].lineData[7]++;
  var Menu = require('menu');
  _$jscoverage['/filter-menu.js'].lineData[8]++;
  var FilterMenuRender = require('filter-menu/render');
  _$jscoverage['/filter-menu.js'].lineData[10]++;
  var HIT_CLS = 'menuitem-hit';
  _$jscoverage['/filter-menu.js'].lineData[18]++;
  return Menu.extend({
  bindUI: function() {
  _$jscoverage['/filter-menu.js'].functionData[1]++;
  _$jscoverage['/filter-menu.js'].lineData[20]++;
  var self = this, filterInput = self.get('filterInput');
  _$jscoverage['/filter-menu.js'].lineData[23]++;
  filterInput.on('valuechange', self.handleFilterEvent, self);
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/filter-menu.js'].functionData[2]++;
  _$jscoverage['/filter-menu.js'].lineData[27]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[28]++;
  self.callSuper(e);
  _$jscoverage['/filter-menu.js'].lineData[31]++;
  self.view.getKeyEventTarget()[0].select();
}, 
  handleFilterEvent: function() {
  _$jscoverage['/filter-menu.js'].functionData[3]++;
  _$jscoverage['/filter-menu.js'].lineData[35]++;
  var self = this, str, filterInput = self.get('filterInput'), highlightedItem = self.get('highlightedItem');
  _$jscoverage['/filter-menu.js'].lineData[40]++;
  self.set('filterStr', filterInput.val());
  _$jscoverage['/filter-menu.js'].lineData[41]++;
  str = filterInput.val();
  _$jscoverage['/filter-menu.js'].lineData[42]++;
  if (visit4_42_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[43]++;
    str = str.replace(/^.+,/, '');
  }
  _$jscoverage['/filter-menu.js'].lineData[46]++;
  if (visit5_46_1(!str && highlightedItem)) {
    _$jscoverage['/filter-menu.js'].lineData[47]++;
    highlightedItem.set('highlighted', false);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[52]++;
    if (visit6_52_1(str && (visit7_52_2(!highlightedItem || !highlightedItem.get('visible'))))) {
      _$jscoverage['/filter-menu.js'].lineData[53]++;
      highlightedItem = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/filter-menu.js'].lineData[54]++;
      if (visit8_54_1(highlightedItem)) {
        _$jscoverage['/filter-menu.js'].lineData[55]++;
        highlightedItem.set('highlighted', true);
      }
    }
  }
}, 
  '_onSetFilterStr': function(v) {
  _$jscoverage['/filter-menu.js'].functionData[4]++;
  _$jscoverage['/filter-menu.js'].lineData[62]++;
  this.filterItems(v);
}, 
  filterItems: function(str) {
  _$jscoverage['/filter-menu.js'].functionData[5]++;
  _$jscoverage['/filter-menu.js'].lineData[70]++;
  var self = this, prefixCls = self.get('prefixCls'), _placeholderEl = self.get('placeholderEl'), filterInput = self.get('filterInput');
  _$jscoverage['/filter-menu.js'].lineData[76]++;
  _placeholderEl[str ? 'hide' : 'show']();
  _$jscoverage['/filter-menu.js'].lineData[78]++;
  if (visit9_78_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[79]++;
    var enteredItems = [], lastWord;
    _$jscoverage['/filter-menu.js'].lineData[82]++;
    var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
    _$jscoverage['/filter-menu.js'].lineData[86]++;
    var items = [];
    _$jscoverage['/filter-menu.js'].lineData[88]++;
    if (visit10_88_1(match)) {
      _$jscoverage['/filter-menu.js'].lineData[89]++;
      items = match[1].split(/[,\uff0c]/);
    }
    _$jscoverage['/filter-menu.js'].lineData[94]++;
    if (visit11_94_1(/[,\uff0c]$/.test(str))) {
      _$jscoverage['/filter-menu.js'].lineData[95]++;
      enteredItems = [];
      _$jscoverage['/filter-menu.js'].lineData[96]++;
      if (visit12_96_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[97]++;
        enteredItems = items;
        _$jscoverage['/filter-menu.js'].lineData[99]++;
        lastWord = items[items.length - 1];
        _$jscoverage['/filter-menu.js'].lineData[100]++;
        var item = self.get('highlightedItem'), content = visit13_101_1(item && item.get('content'));
        _$jscoverage['/filter-menu.js'].lineData[103]++;
        if (visit14_103_1(content && visit15_103_2(visit16_103_3(content.indexOf(lastWord) > -1) && lastWord))) {
          _$jscoverage['/filter-menu.js'].lineData[104]++;
          enteredItems[enteredItems.length - 1] = content;
        }
        _$jscoverage['/filter-menu.js'].lineData[106]++;
        filterInput.val(enteredItems.join(',') + ',');
      }
      _$jscoverage['/filter-menu.js'].lineData[108]++;
      str = '';
    } else {
      _$jscoverage['/filter-menu.js'].lineData[111]++;
      if (visit17_111_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[112]++;
        str = visit18_112_1(match[2] || '');
      }
      _$jscoverage['/filter-menu.js'].lineData[118]++;
      enteredItems = items;
    }
    _$jscoverage['/filter-menu.js'].lineData[120]++;
    var oldEnteredItems = self.get('enteredItems');
    _$jscoverage['/filter-menu.js'].lineData[122]++;
    if (visit19_122_1(oldEnteredItems.length !== enteredItems.length)) {
      _$jscoverage['/filter-menu.js'].lineData[125]++;
      self.set('enteredItems', enteredItems);
    }
  }
  _$jscoverage['/filter-menu.js'].lineData[129]++;
  var children = self.get('children'), strExp = visit20_130_1(str && new RegExp(S.escapeRegExp(str), 'ig'));
  _$jscoverage['/filter-menu.js'].lineData[133]++;
  S.each(children, function(c) {
  _$jscoverage['/filter-menu.js'].functionData[6]++;
  _$jscoverage['/filter-menu.js'].lineData[134]++;
  var content = c.get('content');
  _$jscoverage['/filter-menu.js'].lineData[135]++;
  if (visit21_135_1(!str)) {
    _$jscoverage['/filter-menu.js'].lineData[139]++;
    c.get('el').html(content);
    _$jscoverage['/filter-menu.js'].lineData[140]++;
    c.set('visible', true);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[142]++;
    if (visit22_142_1(content.indexOf(str) > -1)) {
      _$jscoverage['/filter-menu.js'].lineData[145]++;
      c.set('visible', true);
      _$jscoverage['/filter-menu.js'].lineData[147]++;
      c.get('el').html(content.replace(strExp, function(m) {
  _$jscoverage['/filter-menu.js'].functionData[7]++;
  _$jscoverage['/filter-menu.js'].lineData[148]++;
  return '<span class="' + prefixCls + HIT_CLS + '">' + m + '<' + '/span>';
}));
    } else {
      _$jscoverage['/filter-menu.js'].lineData[153]++;
      c.set('visible', false);
    }
  }
});
}, 
  reset: function() {
  _$jscoverage['/filter-menu.js'].functionData[8]++;
  _$jscoverage['/filter-menu.js'].lineData[163]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[164]++;
  self.set('filterStr', '');
  _$jscoverage['/filter-menu.js'].lineData[165]++;
  self.set('enteredItems', []);
  _$jscoverage['/filter-menu.js'].lineData[166]++;
  self.get('filterInput').val('');
}}, {
  ATTRS: {
  allowTextSelection: {
  value: true}, 
  placeholder: {
  view: 1}, 
  filterStr: {}, 
  enteredItems: {
  value: []}, 
  allowMultiple: {
  value: false}, 
  xrender: {
  value: FilterMenuRender}}, 
  xclass: 'filter-menu'});
});
