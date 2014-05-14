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
  _$jscoverage['/filter-menu.js'].lineData[9] = 0;
  _$jscoverage['/filter-menu.js'].lineData[10] = 0;
  _$jscoverage['/filter-menu.js'].lineData[11] = 0;
  _$jscoverage['/filter-menu.js'].lineData[19] = 0;
  _$jscoverage['/filter-menu.js'].lineData[21] = 0;
  _$jscoverage['/filter-menu.js'].lineData[24] = 0;
  _$jscoverage['/filter-menu.js'].lineData[28] = 0;
  _$jscoverage['/filter-menu.js'].lineData[29] = 0;
  _$jscoverage['/filter-menu.js'].lineData[32] = 0;
  _$jscoverage['/filter-menu.js'].lineData[36] = 0;
  _$jscoverage['/filter-menu.js'].lineData[41] = 0;
  _$jscoverage['/filter-menu.js'].lineData[42] = 0;
  _$jscoverage['/filter-menu.js'].lineData[43] = 0;
  _$jscoverage['/filter-menu.js'].lineData[44] = 0;
  _$jscoverage['/filter-menu.js'].lineData[47] = 0;
  _$jscoverage['/filter-menu.js'].lineData[48] = 0;
  _$jscoverage['/filter-menu.js'].lineData[49] = 0;
  _$jscoverage['/filter-menu.js'].lineData[53] = 0;
  _$jscoverage['/filter-menu.js'].lineData[54] = 0;
  _$jscoverage['/filter-menu.js'].lineData[55] = 0;
  _$jscoverage['/filter-menu.js'].lineData[62] = 0;
  _$jscoverage['/filter-menu.js'].lineData[66] = 0;
  _$jscoverage['/filter-menu.js'].lineData[70] = 0;
  _$jscoverage['/filter-menu.js'].lineData[78] = 0;
  _$jscoverage['/filter-menu.js'].lineData[84] = 0;
  _$jscoverage['/filter-menu.js'].lineData[86] = 0;
  _$jscoverage['/filter-menu.js'].lineData[87] = 0;
  _$jscoverage['/filter-menu.js'].lineData[90] = 0;
  _$jscoverage['/filter-menu.js'].lineData[94] = 0;
  _$jscoverage['/filter-menu.js'].lineData[96] = 0;
  _$jscoverage['/filter-menu.js'].lineData[97] = 0;
  _$jscoverage['/filter-menu.js'].lineData[102] = 0;
  _$jscoverage['/filter-menu.js'].lineData[103] = 0;
  _$jscoverage['/filter-menu.js'].lineData[104] = 0;
  _$jscoverage['/filter-menu.js'].lineData[105] = 0;
  _$jscoverage['/filter-menu.js'].lineData[107] = 0;
  _$jscoverage['/filter-menu.js'].lineData[108] = 0;
  _$jscoverage['/filter-menu.js'].lineData[111] = 0;
  _$jscoverage['/filter-menu.js'].lineData[112] = 0;
  _$jscoverage['/filter-menu.js'].lineData[114] = 0;
  _$jscoverage['/filter-menu.js'].lineData[116] = 0;
  _$jscoverage['/filter-menu.js'].lineData[119] = 0;
  _$jscoverage['/filter-menu.js'].lineData[120] = 0;
  _$jscoverage['/filter-menu.js'].lineData[126] = 0;
  _$jscoverage['/filter-menu.js'].lineData[128] = 0;
  _$jscoverage['/filter-menu.js'].lineData[130] = 0;
  _$jscoverage['/filter-menu.js'].lineData[133] = 0;
  _$jscoverage['/filter-menu.js'].lineData[137] = 0;
  _$jscoverage['/filter-menu.js'].lineData[141] = 0;
  _$jscoverage['/filter-menu.js'].lineData[142] = 0;
  _$jscoverage['/filter-menu.js'].lineData[143] = 0;
  _$jscoverage['/filter-menu.js'].lineData[147] = 0;
  _$jscoverage['/filter-menu.js'].lineData[148] = 0;
  _$jscoverage['/filter-menu.js'].lineData[150] = 0;
  _$jscoverage['/filter-menu.js'].lineData[153] = 0;
  _$jscoverage['/filter-menu.js'].lineData[155] = 0;
  _$jscoverage['/filter-menu.js'].lineData[156] = 0;
  _$jscoverage['/filter-menu.js'].lineData[161] = 0;
  _$jscoverage['/filter-menu.js'].lineData[171] = 0;
  _$jscoverage['/filter-menu.js'].lineData[172] = 0;
  _$jscoverage['/filter-menu.js'].lineData[173] = 0;
  _$jscoverage['/filter-menu.js'].lineData[174] = 0;
  _$jscoverage['/filter-menu.js'].lineData[189] = 0;
  _$jscoverage['/filter-menu.js'].lineData[195] = 0;
  _$jscoverage['/filter-menu.js'].lineData[210] = 0;
  _$jscoverage['/filter-menu.js'].lineData[211] = 0;
  _$jscoverage['/filter-menu.js'].lineData[217] = 0;
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
  _$jscoverage['/filter-menu.js'].functionData[9] = 0;
  _$jscoverage['/filter-menu.js'].functionData[10] = 0;
  _$jscoverage['/filter-menu.js'].functionData[11] = 0;
  _$jscoverage['/filter-menu.js'].functionData[12] = 0;
  _$jscoverage['/filter-menu.js'].functionData[13] = 0;
  _$jscoverage['/filter-menu.js'].functionData[14] = 0;
}
if (! _$jscoverage['/filter-menu.js'].branchData) {
  _$jscoverage['/filter-menu.js'].branchData = {};
  _$jscoverage['/filter-menu.js'].branchData['43'] = [];
  _$jscoverage['/filter-menu.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['47'] = [];
  _$jscoverage['/filter-menu.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['49'] = [];
  _$jscoverage['/filter-menu.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['54'] = [];
  _$jscoverage['/filter-menu.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['86'] = [];
  _$jscoverage['/filter-menu.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['96'] = [];
  _$jscoverage['/filter-menu.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['102'] = [];
  _$jscoverage['/filter-menu.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['104'] = [];
  _$jscoverage['/filter-menu.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['109'] = [];
  _$jscoverage['/filter-menu.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['111'] = [];
  _$jscoverage['/filter-menu.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['111'][3] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['119'] = [];
  _$jscoverage['/filter-menu.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['120'] = [];
  _$jscoverage['/filter-menu.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['130'] = [];
  _$jscoverage['/filter-menu.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['138'] = [];
  _$jscoverage['/filter-menu.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['143'] = [];
  _$jscoverage['/filter-menu.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['150'] = [];
  _$jscoverage['/filter-menu.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['211'] = [];
  _$jscoverage['/filter-menu.js'].branchData['211'][1] = new BranchData();
}
_$jscoverage['/filter-menu.js'].branchData['211'][1].init(105, 37, 'placeholderEl && placeholderEl.html()');
function visit24_211_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['150'][1].init(30, 25, 'content.indexOf(str) > -1');
function visit23_150_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['143'][1].init(79, 4, '!str');
function visit22_143_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['138'][1].init(66, 47, 'str && new RegExp(util.escapeRegExp(str), \'ig\')');
function visit21_138_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['130'][1].init(1832, 46, 'oldEnteredItems.length !== enteredItems.length');
function visit20_130_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['120'][1].init(36, 14, 'match[2] || \'\'');
function visit19_120_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['119'][1].init(80, 5, 'match');
function visit18_119_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['111'][3].init(386, 30, 'content.indexOf(lastWord) > -1');
function visit17_111_3(result) {
  _$jscoverage['/filter-menu.js'].branchData['111'][3].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['111'][2].init(386, 42, 'content.indexOf(lastWord) > -1 && lastWord');
function visit16_111_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['111'][1].init(375, 53, 'content && content.indexOf(lastWord) > -1 && lastWord');
function visit15_111_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['109'][1].init(82, 27, 'item && item.get(\'content\')');
function visit14_109_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['104'][1].init(74, 5, 'match');
function visit13_104_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['102'][1].init(523, 22, '/[,\\uff0c]$/.test(str)');
function visit12_102_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['96'][1].init(326, 5, 'match');
function visit11_96_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['86'][1].init(336, 25, 'self.get(\'allowMultiple\')');
function visit10_86_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['54'][1].init(219, 15, 'highlightedItem');
function visit9_54_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['49'][2].init(594, 51, '!highlightedItem || !highlightedItem.get(\'visible\')');
function visit8_49_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['49'][1].init(586, 60, 'str && (!highlightedItem || !highlightedItem.get(\'visible\'))');
function visit7_49_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['47'][1].init(466, 23, '!str && highlightedItem');
function visit6_47_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['43'][1].init(343, 25, 'self.get(\'allowMultiple\')');
function visit5_43_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/filter-menu.js'].functionData[0]++;
  _$jscoverage['/filter-menu.js'].lineData[7]++;
  var Menu = require('menu');
  _$jscoverage['/filter-menu.js'].lineData[8]++;
  var FilterMenuTpl = require('./filter-menu/render-xtpl');
  _$jscoverage['/filter-menu.js'].lineData[9]++;
  var HIT_CLS = 'menuitem-hit';
  _$jscoverage['/filter-menu.js'].lineData[10]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/filter-menu.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/filter-menu.js'].lineData[19]++;
  return Menu.extend([ContentBox], {
  bindUI: function() {
  _$jscoverage['/filter-menu.js'].functionData[1]++;
  _$jscoverage['/filter-menu.js'].lineData[21]++;
  var self = this, filterInput = self.get('filterInput');
  _$jscoverage['/filter-menu.js'].lineData[24]++;
  filterInput.on('input', self.handleFilterEvent, self);
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/filter-menu.js'].functionData[2]++;
  _$jscoverage['/filter-menu.js'].lineData[28]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[29]++;
  self.callSuper(e);
  _$jscoverage['/filter-menu.js'].lineData[32]++;
  self.getKeyEventTarget()[0].select();
}, 
  handleFilterEvent: function() {
  _$jscoverage['/filter-menu.js'].functionData[3]++;
  _$jscoverage['/filter-menu.js'].lineData[36]++;
  var self = this, str, filterInput = self.get('filterInput'), highlightedItem = self.get('highlightedItem');
  _$jscoverage['/filter-menu.js'].lineData[41]++;
  self.set('filterStr', filterInput.val());
  _$jscoverage['/filter-menu.js'].lineData[42]++;
  str = filterInput.val();
  _$jscoverage['/filter-menu.js'].lineData[43]++;
  if (visit5_43_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[44]++;
    str = str.replace(/^.+,/, '');
  }
  _$jscoverage['/filter-menu.js'].lineData[47]++;
  if (visit6_47_1(!str && highlightedItem)) {
    _$jscoverage['/filter-menu.js'].lineData[48]++;
    highlightedItem.set('highlighted', false);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[49]++;
    if (visit7_49_1(str && (visit8_49_2(!highlightedItem || !highlightedItem.get('visible'))))) {
      _$jscoverage['/filter-menu.js'].lineData[53]++;
      highlightedItem = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/filter-menu.js'].lineData[54]++;
      if (visit9_54_1(highlightedItem)) {
        _$jscoverage['/filter-menu.js'].lineData[55]++;
        highlightedItem.set('highlighted', true);
      }
    }
  }
}, 
  _onSetFilterStr: function(v) {
  _$jscoverage['/filter-menu.js'].functionData[4]++;
  _$jscoverage['/filter-menu.js'].lineData[62]++;
  this.filterItems(v);
}, 
  _onSetPlaceholder: function(v) {
  _$jscoverage['/filter-menu.js'].functionData[5]++;
  _$jscoverage['/filter-menu.js'].lineData[66]++;
  this.get('placeholderEl').html(v);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/filter-menu.js'].functionData[6]++;
  _$jscoverage['/filter-menu.js'].lineData[70]++;
  return this.get('filterInput');
}, 
  filterItems: function(str) {
  _$jscoverage['/filter-menu.js'].functionData[7]++;
  _$jscoverage['/filter-menu.js'].lineData[78]++;
  var self = this, prefixCls = self.get('prefixCls'), _placeholderEl = self.get('placeholderEl'), filterInput = self.get('filterInput');
  _$jscoverage['/filter-menu.js'].lineData[84]++;
  _placeholderEl[str ? 'hide' : 'show']();
  _$jscoverage['/filter-menu.js'].lineData[86]++;
  if (visit10_86_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[87]++;
    var enteredItems = [], lastWord;
    _$jscoverage['/filter-menu.js'].lineData[90]++;
    var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
    _$jscoverage['/filter-menu.js'].lineData[94]++;
    var items = [];
    _$jscoverage['/filter-menu.js'].lineData[96]++;
    if (visit11_96_1(match)) {
      _$jscoverage['/filter-menu.js'].lineData[97]++;
      items = match[1].split(/[,\uff0c]/);
    }
    _$jscoverage['/filter-menu.js'].lineData[102]++;
    if (visit12_102_1(/[,\uff0c]$/.test(str))) {
      _$jscoverage['/filter-menu.js'].lineData[103]++;
      enteredItems = [];
      _$jscoverage['/filter-menu.js'].lineData[104]++;
      if (visit13_104_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[105]++;
        enteredItems = items;
        _$jscoverage['/filter-menu.js'].lineData[107]++;
        lastWord = items[items.length - 1];
        _$jscoverage['/filter-menu.js'].lineData[108]++;
        var item = self.get('highlightedItem'), content = visit14_109_1(item && item.get('content'));
        _$jscoverage['/filter-menu.js'].lineData[111]++;
        if (visit15_111_1(content && visit16_111_2(visit17_111_3(content.indexOf(lastWord) > -1) && lastWord))) {
          _$jscoverage['/filter-menu.js'].lineData[112]++;
          enteredItems[enteredItems.length - 1] = content;
        }
        _$jscoverage['/filter-menu.js'].lineData[114]++;
        filterInput.val(enteredItems.join(',') + ',');
      }
      _$jscoverage['/filter-menu.js'].lineData[116]++;
      str = '';
    } else {
      _$jscoverage['/filter-menu.js'].lineData[119]++;
      if (visit18_119_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[120]++;
        str = visit19_120_1(match[2] || '');
      }
      _$jscoverage['/filter-menu.js'].lineData[126]++;
      enteredItems = items;
    }
    _$jscoverage['/filter-menu.js'].lineData[128]++;
    var oldEnteredItems = self.get('enteredItems');
    _$jscoverage['/filter-menu.js'].lineData[130]++;
    if (visit20_130_1(oldEnteredItems.length !== enteredItems.length)) {
      _$jscoverage['/filter-menu.js'].lineData[133]++;
      self.set('enteredItems', enteredItems);
    }
  }
  _$jscoverage['/filter-menu.js'].lineData[137]++;
  var children = self.get('children'), strExp = visit21_138_1(str && new RegExp(util.escapeRegExp(str), 'ig'));
  _$jscoverage['/filter-menu.js'].lineData[141]++;
  util.each(children, function(c) {
  _$jscoverage['/filter-menu.js'].functionData[8]++;
  _$jscoverage['/filter-menu.js'].lineData[142]++;
  var content = c.get('content');
  _$jscoverage['/filter-menu.js'].lineData[143]++;
  if (visit22_143_1(!str)) {
    _$jscoverage['/filter-menu.js'].lineData[147]++;
    c.get('el').html(content);
    _$jscoverage['/filter-menu.js'].lineData[148]++;
    c.set('visible', true);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[150]++;
    if (visit23_150_1(content.indexOf(str) > -1)) {
      _$jscoverage['/filter-menu.js'].lineData[153]++;
      c.set('visible', true);
      _$jscoverage['/filter-menu.js'].lineData[155]++;
      c.get('el').html(content.replace(strExp, function(m) {
  _$jscoverage['/filter-menu.js'].functionData[9]++;
  _$jscoverage['/filter-menu.js'].lineData[156]++;
  return '<span class="' + prefixCls + HIT_CLS + '">' + m + '<' + '/span>';
}));
    } else {
      _$jscoverage['/filter-menu.js'].lineData[161]++;
      c.set('visible', false);
    }
  }
});
}, 
  reset: function() {
  _$jscoverage['/filter-menu.js'].functionData[10]++;
  _$jscoverage['/filter-menu.js'].lineData[171]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[172]++;
  self.set('filterStr', '');
  _$jscoverage['/filter-menu.js'].lineData[173]++;
  self.set('enteredItems', []);
  _$jscoverage['/filter-menu.js'].lineData[174]++;
  self.get('filterInput').val('');
}}, {
  ATTRS: {
  contentTpl: {
  value: FilterMenuTpl}, 
  allowTextSelection: {
  value: true}, 
  filterInput: {
  selector: function() {
  _$jscoverage['/filter-menu.js'].functionData[11]++;
  _$jscoverage['/filter-menu.js'].lineData[189]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  filterInputWrap: {
  selector: function() {
  _$jscoverage['/filter-menu.js'].functionData[12]++;
  _$jscoverage['/filter-menu.js'].lineData[195]++;
  return ('.' + this.getBaseCssClass('input-wrap'));
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/filter-menu.js'].functionData[13]++;
  _$jscoverage['/filter-menu.js'].lineData[210]++;
  var placeholderEl = this.get('placeholderEl');
  _$jscoverage['/filter-menu.js'].lineData[211]++;
  return visit24_211_1(placeholderEl && placeholderEl.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/filter-menu.js'].functionData[14]++;
  _$jscoverage['/filter-menu.js'].lineData[217]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  filterStr: {}, 
  enteredItems: {
  value: []}, 
  allowMultiple: {
  value: false}}, 
  xclass: 'filter-menu'});
});
