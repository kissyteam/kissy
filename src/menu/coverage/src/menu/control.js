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
  _$jscoverage['/menu/control.js'].lineData[18] = 0;
  _$jscoverage['/menu/control.js'].lineData[24] = 0;
  _$jscoverage['/menu/control.js'].lineData[28] = 0;
  _$jscoverage['/menu/control.js'].lineData[29] = 0;
  _$jscoverage['/menu/control.js'].lineData[36] = 0;
  _$jscoverage['/menu/control.js'].lineData[40] = 0;
  _$jscoverage['/menu/control.js'].lineData[42] = 0;
  _$jscoverage['/menu/control.js'].lineData[51] = 0;
  _$jscoverage['/menu/control.js'].lineData[52] = 0;
  _$jscoverage['/menu/control.js'].lineData[53] = 0;
  _$jscoverage['/menu/control.js'].lineData[54] = 0;
  _$jscoverage['/menu/control.js'].lineData[59] = 0;
  _$jscoverage['/menu/control.js'].lineData[63] = 0;
  _$jscoverage['/menu/control.js'].lineData[64] = 0;
  _$jscoverage['/menu/control.js'].lineData[66] = 0;
  _$jscoverage['/menu/control.js'].lineData[67] = 0;
  _$jscoverage['/menu/control.js'].lineData[68] = 0;
  _$jscoverage['/menu/control.js'].lineData[70] = 0;
  _$jscoverage['/menu/control.js'].lineData[74] = 0;
  _$jscoverage['/menu/control.js'].lineData[75] = 0;
  _$jscoverage['/menu/control.js'].lineData[76] = 0;
  _$jscoverage['/menu/control.js'].lineData[77] = 0;
  _$jscoverage['/menu/control.js'].lineData[84] = 0;
  _$jscoverage['/menu/control.js'].lineData[87] = 0;
  _$jscoverage['/menu/control.js'].lineData[88] = 0;
  _$jscoverage['/menu/control.js'].lineData[89] = 0;
  _$jscoverage['/menu/control.js'].lineData[90] = 0;
  _$jscoverage['/menu/control.js'].lineData[92] = 0;
  _$jscoverage['/menu/control.js'].lineData[94] = 0;
  _$jscoverage['/menu/control.js'].lineData[112] = 0;
  _$jscoverage['/menu/control.js'].lineData[115] = 0;
  _$jscoverage['/menu/control.js'].lineData[118] = 0;
  _$jscoverage['/menu/control.js'].lineData[119] = 0;
  _$jscoverage['/menu/control.js'].lineData[122] = 0;
  _$jscoverage['/menu/control.js'].lineData[125] = 0;
  _$jscoverage['/menu/control.js'].lineData[126] = 0;
  _$jscoverage['/menu/control.js'].lineData[129] = 0;
  _$jscoverage['/menu/control.js'].lineData[132] = 0;
  _$jscoverage['/menu/control.js'].lineData[136] = 0;
  _$jscoverage['/menu/control.js'].lineData[137] = 0;
  _$jscoverage['/menu/control.js'].lineData[139] = 0;
  _$jscoverage['/menu/control.js'].lineData[143] = 0;
  _$jscoverage['/menu/control.js'].lineData[144] = 0;
  _$jscoverage['/menu/control.js'].lineData[147] = 0;
  _$jscoverage['/menu/control.js'].lineData[148] = 0;
  _$jscoverage['/menu/control.js'].lineData[151] = 0;
  _$jscoverage['/menu/control.js'].lineData[152] = 0;
  _$jscoverage['/menu/control.js'].lineData[154] = 0;
  _$jscoverage['/menu/control.js'].lineData[155] = 0;
  _$jscoverage['/menu/control.js'].lineData[157] = 0;
  _$jscoverage['/menu/control.js'].lineData[158] = 0;
  _$jscoverage['/menu/control.js'].lineData[161] = 0;
  _$jscoverage['/menu/control.js'].lineData[162] = 0;
  _$jscoverage['/menu/control.js'].lineData[164] = 0;
  _$jscoverage['/menu/control.js'].lineData[165] = 0;
  _$jscoverage['/menu/control.js'].lineData[167] = 0;
  _$jscoverage['/menu/control.js'].lineData[168] = 0;
  _$jscoverage['/menu/control.js'].lineData[170] = 0;
  _$jscoverage['/menu/control.js'].lineData[171] = 0;
  _$jscoverage['/menu/control.js'].lineData[176] = 0;
  _$jscoverage['/menu/control.js'].lineData[178] = 0;
  _$jscoverage['/menu/control.js'].lineData[189] = 0;
  _$jscoverage['/menu/control.js'].lineData[191] = 0;
  _$jscoverage['/menu/control.js'].lineData[194] = 0;
  _$jscoverage['/menu/control.js'].lineData[195] = 0;
  _$jscoverage['/menu/control.js'].lineData[198] = 0;
  _$jscoverage['/menu/control.js'].lineData[199] = 0;
  _$jscoverage['/menu/control.js'].lineData[202] = 0;
  _$jscoverage['/menu/control.js'].lineData[204] = 0;
  _$jscoverage['/menu/control.js'].lineData[205] = 0;
  _$jscoverage['/menu/control.js'].lineData[206] = 0;
  _$jscoverage['/menu/control.js'].lineData[207] = 0;
  _$jscoverage['/menu/control.js'].lineData[211] = 0;
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
  _$jscoverage['/menu/control.js'].functionData[11] = 0;
}
if (! _$jscoverage['/menu/control.js'].branchData) {
  _$jscoverage['/menu/control.js'].branchData = {};
  _$jscoverage['/menu/control.js'].branchData['40'] = [];
  _$jscoverage['/menu/control.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['53'] = [];
  _$jscoverage['/menu/control.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['66'] = [];
  _$jscoverage['/menu/control.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['89'] = [];
  _$jscoverage['/menu/control.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['93'] = [];
  _$jscoverage['/menu/control.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['118'] = [];
  _$jscoverage['/menu/control.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['125'] = [];
  _$jscoverage['/menu/control.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['151'] = [];
  _$jscoverage['/menu/control.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['161'] = [];
  _$jscoverage['/menu/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['170'] = [];
  _$jscoverage['/menu/control.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['194'] = [];
  _$jscoverage['/menu/control.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['198'] = [];
  _$jscoverage['/menu/control.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['204'] = [];
  _$jscoverage['/menu/control.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['206'] = [];
  _$jscoverage['/menu/control.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['239'] = [];
  _$jscoverage['/menu/control.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['242'] = [];
  _$jscoverage['/menu/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/menu/control.js'].branchData['242'][2] = new BranchData();
}
_$jscoverage['/menu/control.js'].branchData['242'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit25_242_2(result) {
  _$jscoverage['/menu/control.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['242'][1].init(121, 32, 'menuItem && menuItem.el.id || \'\'');
function visit24_242_1(result) {
  _$jscoverage['/menu/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['239'][1].init(13, 15, 'e.target.isMenu');
function visit23_239_1(result) {
  _$jscoverage['/menu/control.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['206'][1].init(62, 55, 'child.containsElement && child.containsElement(element)');
function visit22_206_1(result) {
  _$jscoverage['/menu/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['204'][1].init(400, 9, 'i < count');
function visit21_204_1(result) {
  _$jscoverage['/menu/control.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['198'][3].init(205, 18, '$el[0] === element');
function visit20_198_3(result) {
  _$jscoverage['/menu/control.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['198'][2].init(205, 43, '$el[0] === element || $el.contains(element)');
function visit19_198_2(result) {
  _$jscoverage['/menu/control.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['198'][1].init(197, 52, '$el && ($el[0] === element || $el.contains(element))');
function visit18_198_1(result) {
  _$jscoverage['/menu/control.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['194'][1].init(104, 28, '!self.get(\'visible\') || !$el');
function visit17_194_1(result) {
  _$jscoverage['/menu/control.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['170'][1].init(2135, 15, 'nextHighlighted');
function visit16_170_1(result) {
  _$jscoverage['/menu/control.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['161'][1].init(42, 16, '!highlightedItem');
function visit15_161_1(result) {
  _$jscoverage['/menu/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['151'][1].init(40, 16, '!highlightedItem');
function visit14_151_1(result) {
  _$jscoverage['/menu/control.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['125'][1].init(440, 9, 'len === 0');
function visit13_125_1(result) {
  _$jscoverage['/menu/control.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['118'][1].init(228, 59, 'highlightedItem && highlightedItem.handleKeyDownInternal(e)');
function visit12_118_1(result) {
  _$jscoverage['/menu/control.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['93'][1].init(253, 11, 'index !== o');
function visit11_93_1(result) {
  _$jscoverage['/menu/control.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['89'][2].init(85, 26, 'c.get(\'visible\') !== false');
function visit10_89_2(result) {
  _$jscoverage['/menu/control.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['89'][1].init(62, 50, '!c.get(\'disabled\') && (c.get(\'visible\') !== false)');
function visit9_89_1(result) {
  _$jscoverage['/menu/control.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['66'][1].init(148, 40, 'rootMenu && rootMenu._popupAutoHideTimer');
function visit8_66_1(result) {
  _$jscoverage['/menu/control.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['53'][1].init(83, 53, '!v && (highlightedItem = this.get(\'highlightedItem\'))');
function visit7_53_1(result) {
  _$jscoverage['/menu/control.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['40'][2].init(223, 36, 'ev && (highlightedItem = ev.prevVal)');
function visit6_40_2(result) {
  _$jscoverage['/menu/control.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/control.js'].branchData['40'][1].init(218, 41, 'v && ev && (highlightedItem = ev.prevVal)');
function visit5_40_1(result) {
  _$jscoverage['/menu/control.js'].branchData['40'][1].ranCondition(result);
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
  var KeyCode = Node.KeyCode;
  _$jscoverage['/menu/control.js'].lineData[18]++;
  return Container.extend([DelegateChildrenExtension], {
  isMenu: 1, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/menu/control.js'].functionData[1]++;
  _$jscoverage['/menu/control.js'].lineData[24]++;
  renderData.elAttrs.role = 'menu';
}, 
  bindUI: function() {
  _$jscoverage['/menu/control.js'].functionData[2]++;
  _$jscoverage['/menu/control.js'].lineData[28]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[29]++;
  self.on('afterHighlightedItemChange', afterHighlightedItemChange, self);
}, 
  _onSetHighlightedItem: function(v, ev) {
  _$jscoverage['/menu/control.js'].functionData[3]++;
  _$jscoverage['/menu/control.js'].lineData[36]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[40]++;
  if (visit5_40_1(v && visit6_40_2(ev && (highlightedItem = ev.prevVal)))) {
    _$jscoverage['/menu/control.js'].lineData[42]++;
    highlightedItem.set('highlighted', false, {
  data: {
  byPassSetHighlightedItem: 1}});
  }
}, 
  _onSetVisible: function(v, e) {
  _$jscoverage['/menu/control.js'].functionData[4]++;
  _$jscoverage['/menu/control.js'].lineData[51]++;
  this.callSuper(v, e);
  _$jscoverage['/menu/control.js'].lineData[52]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[53]++;
  if (visit7_53_1(!v && (highlightedItem = this.get('highlightedItem')))) {
    _$jscoverage['/menu/control.js'].lineData[54]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  getRootMenu: function() {
  _$jscoverage['/menu/control.js'].functionData[5]++;
  _$jscoverage['/menu/control.js'].lineData[59]++;
  return this;
}, 
  handleMouseEnterInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[6]++;
  _$jscoverage['/menu/control.js'].lineData[63]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[64]++;
  var rootMenu = this.getRootMenu();
  _$jscoverage['/menu/control.js'].lineData[66]++;
  if (visit8_66_1(rootMenu && rootMenu._popupAutoHideTimer)) {
    _$jscoverage['/menu/control.js'].lineData[67]++;
    clearTimeout(rootMenu._popupAutoHideTimer);
    _$jscoverage['/menu/control.js'].lineData[68]++;
    rootMenu._popupAutoHideTimer = null;
  }
  _$jscoverage['/menu/control.js'].lineData[70]++;
  this.focus();
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[7]++;
  _$jscoverage['/menu/control.js'].lineData[74]++;
  this.callSuper(e);
  _$jscoverage['/menu/control.js'].lineData[75]++;
  var highlightedItem;
  _$jscoverage['/menu/control.js'].lineData[76]++;
  if ((highlightedItem = this.get('highlightedItem'))) {
    _$jscoverage['/menu/control.js'].lineData[77]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  _getNextEnabledHighlighted: function(index, dir) {
  _$jscoverage['/menu/control.js'].functionData[8]++;
  _$jscoverage['/menu/control.js'].lineData[84]++;
  var children = this.get('children'), len = children.length, o = index;
  _$jscoverage['/menu/control.js'].lineData[87]++;
  do {
    _$jscoverage['/menu/control.js'].lineData[88]++;
    var c = children[index];
    _$jscoverage['/menu/control.js'].lineData[89]++;
    if (visit9_89_1(!c.get('disabled') && (visit10_89_2(c.get('visible') !== false)))) {
      _$jscoverage['/menu/control.js'].lineData[90]++;
      return children[index];
    }
    _$jscoverage['/menu/control.js'].lineData[92]++;
    index = (index + dir + len) % len;
  } while (visit11_93_1(index !== o));
  _$jscoverage['/menu/control.js'].lineData[94]++;
  return undefined;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/control.js'].functionData[9]++;
  _$jscoverage['/menu/control.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[115]++;
  var highlightedItem = self.get('highlightedItem');
  _$jscoverage['/menu/control.js'].lineData[118]++;
  if (visit12_118_1(highlightedItem && highlightedItem.handleKeyDownInternal(e))) {
    _$jscoverage['/menu/control.js'].lineData[119]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[122]++;
  var children = self.get('children'), len = children.length;
  _$jscoverage['/menu/control.js'].lineData[125]++;
  if (visit13_125_1(len === 0)) {
    _$jscoverage['/menu/control.js'].lineData[126]++;
    return undefined;
  }
  _$jscoverage['/menu/control.js'].lineData[129]++;
  var index, destIndex, nextHighlighted;
  _$jscoverage['/menu/control.js'].lineData[132]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/menu/control.js'].lineData[136]++;
      if ((highlightedItem = self.get('highlightedItem'))) {
        _$jscoverage['/menu/control.js'].lineData[137]++;
        highlightedItem.set('highlighted', false);
      }
      _$jscoverage['/menu/control.js'].lineData[139]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/menu/control.js'].lineData[143]++;
      nextHighlighted = self._getNextEnabledHighlighted(0, 1);
      _$jscoverage['/menu/control.js'].lineData[144]++;
      break;
    case KeyCode.END:
      _$jscoverage['/menu/control.js'].lineData[147]++;
      nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
      _$jscoverage['/menu/control.js'].lineData[148]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/menu/control.js'].lineData[151]++;
      if (visit14_151_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[152]++;
        destIndex = len - 1;
      } else {
        _$jscoverage['/menu/control.js'].lineData[154]++;
        index = S.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[155]++;
        destIndex = (index - 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[157]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
      _$jscoverage['/menu/control.js'].lineData[158]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/menu/control.js'].lineData[161]++;
      if (visit15_161_1(!highlightedItem)) {
        _$jscoverage['/menu/control.js'].lineData[162]++;
        destIndex = 0;
      } else {
        _$jscoverage['/menu/control.js'].lineData[164]++;
        index = S.indexOf(highlightedItem, children);
        _$jscoverage['/menu/control.js'].lineData[165]++;
        destIndex = (index + 1 + len) % len;
      }
      _$jscoverage['/menu/control.js'].lineData[167]++;
      nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
      _$jscoverage['/menu/control.js'].lineData[168]++;
      break;
  }
  _$jscoverage['/menu/control.js'].lineData[170]++;
  if (visit16_170_1(nextHighlighted)) {
    _$jscoverage['/menu/control.js'].lineData[171]++;
    nextHighlighted.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
    _$jscoverage['/menu/control.js'].lineData[176]++;
    return true;
  } else {
    _$jscoverage['/menu/control.js'].lineData[178]++;
    return undefined;
  }
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/control.js'].functionData[10]++;
  _$jscoverage['/menu/control.js'].lineData[189]++;
  var self = this;
  _$jscoverage['/menu/control.js'].lineData[191]++;
  var $el = self.$el;
  _$jscoverage['/menu/control.js'].lineData[194]++;
  if (visit17_194_1(!self.get('visible') || !$el)) {
    _$jscoverage['/menu/control.js'].lineData[195]++;
    return false;
  }
  _$jscoverage['/menu/control.js'].lineData[198]++;
  if (visit18_198_1($el && (visit19_198_2(visit20_198_3($el[0] === element) || $el.contains(element))))) {
    _$jscoverage['/menu/control.js'].lineData[199]++;
    return true;
  }
  _$jscoverage['/menu/control.js'].lineData[202]++;
  var children = self.get('children');
  _$jscoverage['/menu/control.js'].lineData[204]++;
  for (var i = 0, count = children.length; visit21_204_1(i < count); i++) {
    _$jscoverage['/menu/control.js'].lineData[205]++;
    var child = children[i];
    _$jscoverage['/menu/control.js'].lineData[206]++;
    if (visit22_206_1(child.containsElement && child.containsElement(element))) {
      _$jscoverage['/menu/control.js'].lineData[207]++;
      return true;
    }
  }
  _$jscoverage['/menu/control.js'].lineData[211]++;
  return false;
}}, {
  ATTRS: {
  highlightedItem: {
  value: null}, 
  defaultChildCfg: {
  value: {
  xclass: 'menuitem'}}}, 
  xclass: 'menu'});
  _$jscoverage['/menu/control.js'].lineData[238]++;
  function afterHighlightedItemChange(e) {
    _$jscoverage['/menu/control.js'].functionData[11]++;
    _$jscoverage['/menu/control.js'].lineData[239]++;
    if (visit23_239_1(e.target.isMenu)) {
      _$jscoverage['/menu/control.js'].lineData[240]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menu/control.js'].lineData[242]++;
      el.setAttribute('aria-activedescendant', visit24_242_1(visit25_242_2(menuItem && menuItem.el.id) || ''));
    }
  }
});
