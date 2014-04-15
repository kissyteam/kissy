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
  _$jscoverage['/filter-menu.js'].lineData[48] = 0;
  _$jscoverage['/filter-menu.js'].lineData[52] = 0;
  _$jscoverage['/filter-menu.js'].lineData[53] = 0;
  _$jscoverage['/filter-menu.js'].lineData[54] = 0;
  _$jscoverage['/filter-menu.js'].lineData[61] = 0;
  _$jscoverage['/filter-menu.js'].lineData[65] = 0;
  _$jscoverage['/filter-menu.js'].lineData[69] = 0;
  _$jscoverage['/filter-menu.js'].lineData[77] = 0;
  _$jscoverage['/filter-menu.js'].lineData[83] = 0;
  _$jscoverage['/filter-menu.js'].lineData[85] = 0;
  _$jscoverage['/filter-menu.js'].lineData[86] = 0;
  _$jscoverage['/filter-menu.js'].lineData[89] = 0;
  _$jscoverage['/filter-menu.js'].lineData[93] = 0;
  _$jscoverage['/filter-menu.js'].lineData[95] = 0;
  _$jscoverage['/filter-menu.js'].lineData[96] = 0;
  _$jscoverage['/filter-menu.js'].lineData[101] = 0;
  _$jscoverage['/filter-menu.js'].lineData[102] = 0;
  _$jscoverage['/filter-menu.js'].lineData[103] = 0;
  _$jscoverage['/filter-menu.js'].lineData[104] = 0;
  _$jscoverage['/filter-menu.js'].lineData[106] = 0;
  _$jscoverage['/filter-menu.js'].lineData[107] = 0;
  _$jscoverage['/filter-menu.js'].lineData[110] = 0;
  _$jscoverage['/filter-menu.js'].lineData[111] = 0;
  _$jscoverage['/filter-menu.js'].lineData[113] = 0;
  _$jscoverage['/filter-menu.js'].lineData[115] = 0;
  _$jscoverage['/filter-menu.js'].lineData[118] = 0;
  _$jscoverage['/filter-menu.js'].lineData[119] = 0;
  _$jscoverage['/filter-menu.js'].lineData[125] = 0;
  _$jscoverage['/filter-menu.js'].lineData[127] = 0;
  _$jscoverage['/filter-menu.js'].lineData[129] = 0;
  _$jscoverage['/filter-menu.js'].lineData[132] = 0;
  _$jscoverage['/filter-menu.js'].lineData[136] = 0;
  _$jscoverage['/filter-menu.js'].lineData[140] = 0;
  _$jscoverage['/filter-menu.js'].lineData[141] = 0;
  _$jscoverage['/filter-menu.js'].lineData[142] = 0;
  _$jscoverage['/filter-menu.js'].lineData[146] = 0;
  _$jscoverage['/filter-menu.js'].lineData[147] = 0;
  _$jscoverage['/filter-menu.js'].lineData[149] = 0;
  _$jscoverage['/filter-menu.js'].lineData[152] = 0;
  _$jscoverage['/filter-menu.js'].lineData[154] = 0;
  _$jscoverage['/filter-menu.js'].lineData[155] = 0;
  _$jscoverage['/filter-menu.js'].lineData[160] = 0;
  _$jscoverage['/filter-menu.js'].lineData[170] = 0;
  _$jscoverage['/filter-menu.js'].lineData[171] = 0;
  _$jscoverage['/filter-menu.js'].lineData[172] = 0;
  _$jscoverage['/filter-menu.js'].lineData[173] = 0;
  _$jscoverage['/filter-menu.js'].lineData[184] = 0;
  _$jscoverage['/filter-menu.js'].lineData[190] = 0;
  _$jscoverage['/filter-menu.js'].lineData[205] = 0;
  _$jscoverage['/filter-menu.js'].lineData[206] = 0;
  _$jscoverage['/filter-menu.js'].lineData[212] = 0;
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
  _$jscoverage['/filter-menu.js'].branchData['42'] = [];
  _$jscoverage['/filter-menu.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['46'] = [];
  _$jscoverage['/filter-menu.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['48'] = [];
  _$jscoverage['/filter-menu.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['53'] = [];
  _$jscoverage['/filter-menu.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['85'] = [];
  _$jscoverage['/filter-menu.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['95'] = [];
  _$jscoverage['/filter-menu.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['101'] = [];
  _$jscoverage['/filter-menu.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['103'] = [];
  _$jscoverage['/filter-menu.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['108'] = [];
  _$jscoverage['/filter-menu.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['110'] = [];
  _$jscoverage['/filter-menu.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['118'] = [];
  _$jscoverage['/filter-menu.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['119'] = [];
  _$jscoverage['/filter-menu.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['129'] = [];
  _$jscoverage['/filter-menu.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['137'] = [];
  _$jscoverage['/filter-menu.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['142'] = [];
  _$jscoverage['/filter-menu.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['149'] = [];
  _$jscoverage['/filter-menu.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/filter-menu.js'].branchData['206'] = [];
  _$jscoverage['/filter-menu.js'].branchData['206'][1] = new BranchData();
}
_$jscoverage['/filter-menu.js'].branchData['206'][1].init(105, 37, 'placeholderEl && placeholderEl.html()');
function visit25_206_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['149'][1].init(30, 25, 'content.indexOf(str) > -1');
function visit24_149_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['142'][1].init(79, 4, '!str');
function visit23_142_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['137'][1].init(66, 44, 'str && new RegExp(S.escapeRegExp(str), \'ig\')');
function visit22_137_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['129'][1].init(1832, 46, 'oldEnteredItems.length !== enteredItems.length');
function visit21_129_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['119'][1].init(36, 14, 'match[2] || \'\'');
function visit20_119_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['118'][1].init(80, 5, 'match');
function visit19_118_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['110'][3].init(386, 30, 'content.indexOf(lastWord) > -1');
function visit18_110_3(result) {
  _$jscoverage['/filter-menu.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['110'][2].init(386, 42, 'content.indexOf(lastWord) > -1 && lastWord');
function visit17_110_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['110'][1].init(375, 53, 'content && content.indexOf(lastWord) > -1 && lastWord');
function visit16_110_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['108'][1].init(82, 27, 'item && item.get(\'content\')');
function visit15_108_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['103'][1].init(74, 5, 'match');
function visit14_103_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['101'][1].init(523, 22, '/[,\\uff0c]$/.test(str)');
function visit13_101_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['95'][1].init(326, 5, 'match');
function visit12_95_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['85'][1].init(336, 25, 'self.get(\'allowMultiple\')');
function visit11_85_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['53'][1].init(219, 15, 'highlightedItem');
function visit10_53_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['48'][2].init(594, 51, '!highlightedItem || !highlightedItem.get(\'visible\')');
function visit9_48_2(result) {
  _$jscoverage['/filter-menu.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['48'][1].init(586, 60, 'str && (!highlightedItem || !highlightedItem.get(\'visible\'))');
function visit8_48_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['46'][1].init(466, 23, '!str && highlightedItem');
function visit7_46_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/filter-menu.js'].branchData['42'][1].init(343, 25, 'self.get(\'allowMultiple\')');
function visit6_42_1(result) {
  _$jscoverage['/filter-menu.js'].branchData['42'][1].ranCondition(result);
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
  _$jscoverage['/filter-menu.js'].lineData[18]++;
  return Menu.extend([ContentBox], {
  bindUI: function() {
  _$jscoverage['/filter-menu.js'].functionData[1]++;
  _$jscoverage['/filter-menu.js'].lineData[20]++;
  var self = this, filterInput = self.get('filterInput');
  _$jscoverage['/filter-menu.js'].lineData[23]++;
  filterInput.on('input', self.handleFilterEvent, self);
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/filter-menu.js'].functionData[2]++;
  _$jscoverage['/filter-menu.js'].lineData[27]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[28]++;
  self.callSuper(e);
  _$jscoverage['/filter-menu.js'].lineData[31]++;
  self.getKeyEventTarget()[0].select();
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
  if (visit6_42_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[43]++;
    str = str.replace(/^.+,/, '');
  }
  _$jscoverage['/filter-menu.js'].lineData[46]++;
  if (visit7_46_1(!str && highlightedItem)) {
    _$jscoverage['/filter-menu.js'].lineData[47]++;
    highlightedItem.set('highlighted', false);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[48]++;
    if (visit8_48_1(str && (visit9_48_2(!highlightedItem || !highlightedItem.get('visible'))))) {
      _$jscoverage['/filter-menu.js'].lineData[52]++;
      highlightedItem = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/filter-menu.js'].lineData[53]++;
      if (visit10_53_1(highlightedItem)) {
        _$jscoverage['/filter-menu.js'].lineData[54]++;
        highlightedItem.set('highlighted', true);
      }
    }
  }
}, 
  _onSetFilterStr: function(v) {
  _$jscoverage['/filter-menu.js'].functionData[4]++;
  _$jscoverage['/filter-menu.js'].lineData[61]++;
  this.filterItems(v);
}, 
  _onSetPlaceholder: function(v) {
  _$jscoverage['/filter-menu.js'].functionData[5]++;
  _$jscoverage['/filter-menu.js'].lineData[65]++;
  this.get('placeholderEl').html(v);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/filter-menu.js'].functionData[6]++;
  _$jscoverage['/filter-menu.js'].lineData[69]++;
  return this.get('filterInput');
}, 
  filterItems: function(str) {
  _$jscoverage['/filter-menu.js'].functionData[7]++;
  _$jscoverage['/filter-menu.js'].lineData[77]++;
  var self = this, prefixCls = self.get('prefixCls'), _placeholderEl = self.get('placeholderEl'), filterInput = self.get('filterInput');
  _$jscoverage['/filter-menu.js'].lineData[83]++;
  _placeholderEl[str ? 'hide' : 'show']();
  _$jscoverage['/filter-menu.js'].lineData[85]++;
  if (visit11_85_1(self.get('allowMultiple'))) {
    _$jscoverage['/filter-menu.js'].lineData[86]++;
    var enteredItems = [], lastWord;
    _$jscoverage['/filter-menu.js'].lineData[89]++;
    var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
    _$jscoverage['/filter-menu.js'].lineData[93]++;
    var items = [];
    _$jscoverage['/filter-menu.js'].lineData[95]++;
    if (visit12_95_1(match)) {
      _$jscoverage['/filter-menu.js'].lineData[96]++;
      items = match[1].split(/[,\uff0c]/);
    }
    _$jscoverage['/filter-menu.js'].lineData[101]++;
    if (visit13_101_1(/[,\uff0c]$/.test(str))) {
      _$jscoverage['/filter-menu.js'].lineData[102]++;
      enteredItems = [];
      _$jscoverage['/filter-menu.js'].lineData[103]++;
      if (visit14_103_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[104]++;
        enteredItems = items;
        _$jscoverage['/filter-menu.js'].lineData[106]++;
        lastWord = items[items.length - 1];
        _$jscoverage['/filter-menu.js'].lineData[107]++;
        var item = self.get('highlightedItem'), content = visit15_108_1(item && item.get('content'));
        _$jscoverage['/filter-menu.js'].lineData[110]++;
        if (visit16_110_1(content && visit17_110_2(visit18_110_3(content.indexOf(lastWord) > -1) && lastWord))) {
          _$jscoverage['/filter-menu.js'].lineData[111]++;
          enteredItems[enteredItems.length - 1] = content;
        }
        _$jscoverage['/filter-menu.js'].lineData[113]++;
        filterInput.val(enteredItems.join(',') + ',');
      }
      _$jscoverage['/filter-menu.js'].lineData[115]++;
      str = '';
    } else {
      _$jscoverage['/filter-menu.js'].lineData[118]++;
      if (visit19_118_1(match)) {
        _$jscoverage['/filter-menu.js'].lineData[119]++;
        str = visit20_119_1(match[2] || '');
      }
      _$jscoverage['/filter-menu.js'].lineData[125]++;
      enteredItems = items;
    }
    _$jscoverage['/filter-menu.js'].lineData[127]++;
    var oldEnteredItems = self.get('enteredItems');
    _$jscoverage['/filter-menu.js'].lineData[129]++;
    if (visit21_129_1(oldEnteredItems.length !== enteredItems.length)) {
      _$jscoverage['/filter-menu.js'].lineData[132]++;
      self.set('enteredItems', enteredItems);
    }
  }
  _$jscoverage['/filter-menu.js'].lineData[136]++;
  var children = self.get('children'), strExp = visit22_137_1(str && new RegExp(S.escapeRegExp(str), 'ig'));
  _$jscoverage['/filter-menu.js'].lineData[140]++;
  S.each(children, function(c) {
  _$jscoverage['/filter-menu.js'].functionData[8]++;
  _$jscoverage['/filter-menu.js'].lineData[141]++;
  var content = c.get('content');
  _$jscoverage['/filter-menu.js'].lineData[142]++;
  if (visit23_142_1(!str)) {
    _$jscoverage['/filter-menu.js'].lineData[146]++;
    c.get('el').html(content);
    _$jscoverage['/filter-menu.js'].lineData[147]++;
    c.set('visible', true);
  } else {
    _$jscoverage['/filter-menu.js'].lineData[149]++;
    if (visit24_149_1(content.indexOf(str) > -1)) {
      _$jscoverage['/filter-menu.js'].lineData[152]++;
      c.set('visible', true);
      _$jscoverage['/filter-menu.js'].lineData[154]++;
      c.get('el').html(content.replace(strExp, function(m) {
  _$jscoverage['/filter-menu.js'].functionData[9]++;
  _$jscoverage['/filter-menu.js'].lineData[155]++;
  return '<span class="' + prefixCls + HIT_CLS + '">' + m + '<' + '/span>';
}));
    } else {
      _$jscoverage['/filter-menu.js'].lineData[160]++;
      c.set('visible', false);
    }
  }
});
}, 
  reset: function() {
  _$jscoverage['/filter-menu.js'].functionData[10]++;
  _$jscoverage['/filter-menu.js'].lineData[170]++;
  var self = this;
  _$jscoverage['/filter-menu.js'].lineData[171]++;
  self.set('filterStr', '');
  _$jscoverage['/filter-menu.js'].lineData[172]++;
  self.set('enteredItems', []);
  _$jscoverage['/filter-menu.js'].lineData[173]++;
  self.get('filterInput').val('');
}}, {
  ATTRS: {
  allowTextSelection: {
  value: true}, 
  filterInput: {
  selector: function() {
  _$jscoverage['/filter-menu.js'].functionData[11]++;
  _$jscoverage['/filter-menu.js'].lineData[184]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  filterInputWrap: {
  selector: function() {
  _$jscoverage['/filter-menu.js'].functionData[12]++;
  _$jscoverage['/filter-menu.js'].lineData[190]++;
  return ('.' + this.getBaseCssClass('input-wrap'));
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/filter-menu.js'].functionData[13]++;
  _$jscoverage['/filter-menu.js'].lineData[205]++;
  var placeholderEl = this.get('placeholderEl');
  _$jscoverage['/filter-menu.js'].lineData[206]++;
  return visit25_206_1(placeholderEl && placeholderEl.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/filter-menu.js'].functionData[14]++;
  _$jscoverage['/filter-menu.js'].lineData[212]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  filterStr: {}, 
  enteredItems: {
  value: []}, 
  allowMultiple: {
  value: false}, 
  contentTpl: {
  value: FilterMenuTpl}}, 
  xclass: 'filter-menu'});
});
