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
  _$jscoverage['/filter-menu.js'].lineData[8] = 0;
  _$jscoverage['/filter-menu.js'].lineData[16] = 0;
  _$jscoverage['/filter-menu.js'].lineData[18] = 0;
  _$jscoverage['/filter-menu.js'].lineData[21] = 0;
  _$jscoverage['/filter-menu.js'].lineData[25] = 0;
  _$jscoverage['/filter-menu.js'].lineData[26] = 0;
  _$jscoverage['/filter-menu.js'].lineData[29] = 0;
  _$jscoverage['/filter-menu.js'].lineData[33] = 0;
  _$jscoverage['/filter-menu.js'].lineData[38] = 0;
  _$jscoverage['/filter-menu.js'].lineData[39] = 0;
  _$jscoverage['/filter-menu.js'].lineData[40] = 0;
  _$jscoverage['/filter-menu.js'].lineData[41] = 0;
  _$jscoverage['/filter-menu.js'].lineData[44] = 0;
  _$jscoverage['/filter-menu.js'].lineData[45] = 0;
  _$jscoverage['/filter-menu.js'].lineData[50] = 0;
  _$jscoverage['/filter-menu.js'].lineData[51] = 0;
  _$jscoverage['/filter-menu.js'].lineData[52] = 0;
  _$jscoverage['/filter-menu.js'].lineData[53] = 0;
  _$jscoverage['/filter-menu.js'].lineData[60] = 0;
  _$jscoverage['/filter-menu.js'].lineData[68] = 0;
  _$jscoverage['/filter-menu.js'].lineData[74] = 0;
  _$jscoverage['/filter-menu.js'].lineData[76] = 0;
  _$jscoverage['/filter-menu.js'].lineData[77] = 0;
  _$jscoverage['/filter-menu.js'].lineData[80] = 0;
  _$jscoverage['/filter-menu.js'].lineData[84] = 0;
  _$jscoverage['/filter-menu.js'].lineData[86] = 0;
  _$jscoverage['/filter-menu.js'].lineData[87] = 0;
  _$jscoverage['/filter-menu.js'].lineData[92] = 0;
  _$jscoverage['/filter-menu.js'].lineData[93] = 0;
  _$jscoverage['/filter-menu.js'].lineData[94] = 0;
  _$jscoverage['/filter-menu.js'].lineData[95] = 0;
  _$jscoverage['/filter-menu.js'].lineData[97] = 0;
  _$jscoverage['/filter-menu.js'].lineData[98] = 0;
  _$jscoverage['/filter-menu.js'].lineData[101] = 0;
  _$jscoverage['/filter-menu.js'].lineData[102] = 0;
  _$jscoverage['/filter-menu.js'].lineData[104] = 0;
  _$jscoverage['/filter-menu.js'].lineData[106] = 0;
  _$jscoverage['/filter-menu.js'].lineData[109] = 0;
  _$jscoverage['/filter-menu.js'].lineData[110] = 0;
  _$jscoverage['/filter-menu.js'].lineData[116] = 0;
  _$jscoverage['/filter-menu.js'].lineData[118] = 0;
  _$jscoverage['/filter-menu.js'].lineData[120] = 0;
  _$jscoverage['/filter-menu.js'].lineData[123] = 0;
  _$jscoverage['/filter-menu.js'].lineData[127] = 0;
  _$jscoverage['/filter-menu.js'].lineData[131] = 0;
  _$jscoverage['/filter-menu.js'].lineData[132] = 0;
  _$jscoverage['/filter-menu.js'].lineData[133] = 0;
  _$jscoverage['/filter-menu.js'].lineData[137] = 0;
  _$jscoverage['/filter-menu.js'].lineData[138] = 0;
  _$jscoverage['/filter-menu.js'].lineData[140] = 0;
  _$jscoverage['/filter-menu.js'].lineData[143] = 0;
  _$jscoverage['/filter-menu.js'].lineData[145] = 0;
  _$jscoverage['/filter-menu.js'].lineData[146] = 0;
  _$jscoverage['/filter-menu.js'].lineData[151] = 0;
  _$jscoverage['/filter-menu.js'].lineData[161] = 0;
  _$jscoverage['/filter-menu.js'].lineData[162] = 0;
  _$jscoverage['/filter-menu.js'].lineData[163] = 0;
  _$jscoverage['/filter-menu.js'].lineData[164] = 0;
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
  _$jscoverage['/filter-menu.js'].branchData['40'] = [];
  _$jscoverage['/filter-menu.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['44'] = [];
  _$jscoverage['/filter-menu.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['50'] = [];
  _$jscoverage['/filter-menu.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['52'] = [];
  _$jscoverage['/filter-menu.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['76'] = [];
  _$jscoverage['/filter-menu.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['86'] = [];
  _$jscoverage['/filter-menu.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['92'] = [];
  _$jscoverage['/filter-menu.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['94'] = [];
  _$jscoverage['/filter-menu.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['99'] = [];
  _$jscoverage['/filter-menu.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['101'] = [];
  _$jscoverage['/filter-menu.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['109'] = [];
  _$jscoverage['/filter-menu.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['110'] = [];
  _$jscoverage['/filter-menu.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['120'] = [];
  _$jscoverage['/filter-menu.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['128'] = [];
  _$jscoverage['/filter-menu.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['133'] = [];
  _$jscoverage['/filter-menu.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['140'] = [];
  _$jscoverage['/filter-menu.js'].branchData['140'][1] = new BranchData();
}
_$jscoverage['/filter-menu.js'].branchData['140'][1].init(30, 25, 'content.indexOf(str) > -1');
function visit19_140_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['133'][1].init(79, 4, '!str');
function visit18_133_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['128'][1].init(66, 44, 'str && new RegExp(S.escapeRegExp(str), "ig")');
function visit17_128_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['120'][1].init(1832, 45, 'oldEnteredItems.length != enteredItems.length');
function visit16_120_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['110'][1].init(36, 14, 'match[2] || ""');
function visit15_110_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['109'][1].init(80, 5, 'match');
function visit14_109_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['101'][3].init(386, 30, 'content.indexOf(lastWord) > -1');
function visit13_101_3(result) {
  _$jscoverage['/filter-menu.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['101'][2].init(386, 42, 'content.indexOf(lastWord) > -1 && lastWord');
function visit12_101_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['101'][1].init(375, 53, 'content && content.indexOf(lastWord) > -1 && lastWord');
function visit11_101_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['99'][1].init(82, 27, 'item && item.get("content")');
function visit10_99_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['94'][1].init(74, 5, 'match');
function visit9_94_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['92'][1].init(523, 22, '/[,\\uff0c]$/.test(str)');
function visit8_92_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['86'][1].init(326, 5, 'match');
function visit7_86_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['76'][1].init(336, 25, 'self.get("allowMultiple")');
function visit6_76_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['52'][1].init(104, 15, 'highlightedItem');
function visit5_52_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['50'][2].init(714, 51, '!highlightedItem || !highlightedItem.get("visible")');
function visit4_50_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['50'][1].init(706, 60, 'str && (!highlightedItem || !highlightedItem.get("visible"))');
function visit3_50_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['44'][1].init(466, 23, '!str && highlightedItem');
function visit2_44_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['40'][1].init(343, 25, 'self.get(\'allowMultiple\')');
function visit1_40_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].lineData[6]++;
KISSY.add("filter-menu", function(S, Menu, FilterMenuRender) {
  _$jscoverage['/filter-menu.js'].functionData[0]++;
  _$jscoverage['/filter-menu.js'].lineData[8]++;
  var HIT_CLS = "menuitem-hit";
  _$jscoverage['/filter-menu.js'].lineData[16]++;
  return Menu.extend({
  bindUI: function() {
  _$jscoverage['/filter-menu.js'].functionData[1]++;
  _$jscoverage['/filter-menu.js'].lineData[18]++;
  var self = this, filterInput = self.get("filterInput");
  _$jscoverage['/filter-menu.js'].lineData[21]++;
  filterInput.on("valuechange", self.handleFilterEvent, self);
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/filter-menu.js'].functionData[2]++;
  _$jscoverage['/filter-menu.js'].lineData[25]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[26]++;
  self.callSuper(e);
  _$jscoverage['/filter-menu.js'].lineData[29]++;
  self.view.getKeyEventTarget()[0].select();
}, 
  handleFilterEvent: function() {
  _$jscoverage['/filter-menu.js'].functionData[3]++;
  _$jscoverage['/filter-menu.js'].lineData[33]++;
  var self = this, str, filterInput = self.get("filterInput"), highlightedItem = self.get("highlightedItem");
  _$jscoverage['/filter-menu.js'].lineData[38]++;
  self.set("filterStr", filterInput.val());
  _$jscoverage['/filter-menu.js'].lineData[39]++;
  str = filterInput.val();
  _$jscoverage['/filter-menu.js'].lineData[40]++;
  if (visit1_40_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[41]++;
    str = str.replace(/^.+,/, '');
  }
  _$jscoverage['/filter-menu.js'].lineData[44]++;
  if (visit2_44_1(!str && highlightedItem)) {
    _$jscoverage['/filter-menu.js'].lineData[45]++;
    highlightedItem.set('highlighted', false);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[50]++;
    if (visit3_50_1(str && (visit4_50_2(!highlightedItem || !highlightedItem.get("visible"))))) {
      _$jscoverage['/filter-menu.js'].lineData[51]++;
      highlightedItem = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/filter-menu.js'].lineData[52]++;
      if (visit5_52_1(highlightedItem)) {
        _$jscoverage['/filter-menu.js'].lineData[53]++;
        highlightedItem.set('highlighted', true);
      }
    }
  }
}, 
  '_onSetFilterStr': function(v) {
  _$jscoverage['/filter-menu.js'].functionData[4]++;
  _$jscoverage['/filter-menu.js'].lineData[60]++;
  this.filterItems(v);
}, 
  filterItems: function(str) {
  _$jscoverage['/filter-menu.js'].functionData[5]++;
  _$jscoverage['/filter-menu.js'].lineData[68]++;
  var self = this, prefixCls = self.get('prefixCls'), _placeholderEl = self.get("placeholderEl"), filterInput = self.get("filterInput");
  _$jscoverage['/filter-menu.js'].lineData[74]++;
  _placeholderEl[str ? "hide" : "show"]();
  _$jscoverage['/filter-menu.js'].lineData[76]++;
  if (visit6_76_1(self.get("allowMultiple"))) {
    _$jscoverage['/filter-menu.js'].lineData[77]++;
    var enteredItems = [], lastWord;
    _$jscoverage['/filter-menu.js'].lineData[80]++;
    var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
    _$jscoverage['/filter-menu.js'].lineData[84]++;
    var items = [];
    _$jscoverage['/filter-menu.js'].lineData[86]++;
    if (visit7_86_1(match)) {
      _$jscoverage['/filter-menu.js'].lineData[87]++;
      items = match[1].split(/[,\uff0c]/);
    }
    _$jscoverage['/filter-menu.js'].lineData[92]++;
    if (visit8_92_1(/[,\uff0c]$/.test(str))) {
      _$jscoverage['/filter-menu.js'].lineData[93]++;
      enteredItems = [];
      _$jscoverage['/filter-menu.js'].lineData[94]++;
      if (visit9_94_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[95]++;
        enteredItems = items;
        _$jscoverage['/filter-menu.js'].lineData[97]++;
        lastWord = items[items.length - 1];
        _$jscoverage['/filter-menu.js'].lineData[98]++;
        var item = self.get("highlightedItem"), content = visit10_99_1(item && item.get("content"));
        _$jscoverage['/filter-menu.js'].lineData[101]++;
        if (visit11_101_1(content && visit12_101_2(visit13_101_3(content.indexOf(lastWord) > -1) && lastWord))) {
          _$jscoverage['/filter-menu.js'].lineData[102]++;
          enteredItems[enteredItems.length - 1] = content;
        }
        _$jscoverage['/filter-menu.js'].lineData[104]++;
        filterInput.val(enteredItems.join(",") + ",");
      }
      _$jscoverage['/filter-menu.js'].lineData[106]++;
      str = '';
    } else {
      _$jscoverage['/filter-menu.js'].lineData[109]++;
      if (visit14_109_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[110]++;
        str = visit15_110_1(match[2] || "");
      }
      _$jscoverage['/filter-menu.js'].lineData[116]++;
      enteredItems = items;
    }
    _$jscoverage['/filter-menu.js'].lineData[118]++;
    var oldEnteredItems = self.get("enteredItems");
    _$jscoverage['/filter-menu.js'].lineData[120]++;
    if (visit16_120_1(oldEnteredItems.length != enteredItems.length)) {
      _$jscoverage['/filter-menu.js'].lineData[123]++;
      self.set("enteredItems", enteredItems);
    }
  }
  _$jscoverage['/filter-menu.js'].lineData[127]++;
  var children = self.get("children"), strExp = visit17_128_1(str && new RegExp(S.escapeRegExp(str), "ig"));
  _$jscoverage['/filter-menu.js'].lineData[131]++;
  S.each(children, function(c) {
  _$jscoverage['/filter-menu.js'].functionData[6]++;
  _$jscoverage['/filter-menu.js'].lineData[132]++;
  var content = c.get("content");
  _$jscoverage['/filter-menu.js'].lineData[133]++;
  if (visit18_133_1(!str)) {
    _$jscoverage['/filter-menu.js'].lineData[137]++;
    c.get('el').html(content);
    _$jscoverage['/filter-menu.js'].lineData[138]++;
    c.set("visible", true);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[140]++;
    if (visit19_140_1(content.indexOf(str) > -1)) {
      _$jscoverage['/filter-menu.js'].lineData[143]++;
      c.set("visible", true);
      _$jscoverage['/filter-menu.js'].lineData[145]++;
      c.get('el').html(content.replace(strExp, function(m) {
  _$jscoverage['/filter-menu.js'].functionData[7]++;
  _$jscoverage['/filter-menu.js'].lineData[146]++;
  return "<span class='" + prefixCls + HIT_CLS + "'>" + m + "<" + "/span>";
}));
    } else {
      _$jscoverage['/filter-menu.js'].lineData[151]++;
      c.set("visible", false);
    }
  }
});
}, 
  reset: function() {
  _$jscoverage['/filter-menu.js'].functionData[8]++;
  _$jscoverage['/filter-menu.js'].lineData[161]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[162]++;
  self.set("filterStr", "");
  _$jscoverage['/filter-menu.js'].lineData[163]++;
  self.set("enteredItems", []);
  _$jscoverage['/filter-menu.js'].lineData[164]++;
  self.get("filterInput").val("");
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
}, {
  requires: ['menu', 'filter-menu/render']});
