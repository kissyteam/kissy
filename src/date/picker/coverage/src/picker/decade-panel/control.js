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
if (! _$jscoverage['/picker/decade-panel/control.js']) {
  _$jscoverage['/picker/decade-panel/control.js'] = {};
  _$jscoverage['/picker/decade-panel/control.js'].lineData = [];
  _$jscoverage['/picker/decade-panel/control.js'].lineData[6] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[7] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[8] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[9] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[10] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[11] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[15] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[16] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[17] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[18] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[19] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[20] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[21] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[22] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[23] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[24] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[25] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[33] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[34] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[42] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[44] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[45] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[48] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[49] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[50] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[53] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[54] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[55] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[58] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[59] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[61] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[62] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[63] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[65] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[73] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[75] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[76] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[82] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[91] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[93] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[94] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[104] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[105] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[106] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[107] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[124] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[129] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[134] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[139] = 0;
}
if (! _$jscoverage['/picker/decade-panel/control.js'].functionData) {
  _$jscoverage['/picker/decade-panel/control.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/control.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[1] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[2] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[3] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[4] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[5] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[6] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[7] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[8] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[9] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[10] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[11] = 0;
  _$jscoverage['/picker/decade-panel/control.js'].functionData[12] = 0;
}
if (! _$jscoverage['/picker/decade-panel/control.js'].branchData) {
  _$jscoverage['/picker/decade-panel/control.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/control.js'].branchData['23'] = [];
  _$jscoverage['/picker/decade-panel/control.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/control.js'].branchData['25'] = [];
  _$jscoverage['/picker/decade-panel/control.js'].branchData['25'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/control.js'].branchData['25'][1].init(60, 5, 'j < 4');
function visit2_25_1(result) {
  _$jscoverage['/picker/decade-panel/control.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/control.js'].branchData['23'][1].init(303, 5, 'i < 3');
function visit1_23_1(result) {
  _$jscoverage['/picker/decade-panel/control.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/picker/decade-panel/control.js'].lineData[8]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/picker/decade-panel/control.js'].lineData[9]++;
  var tap = TapGesture.TAP;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[10]++;
  var $ = Node.all;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[11]++;
  var Control = require('component/control'), DecadePanelTpl = require('./decade-panel-xtpl'), MonthsTpl = require('./decades-xtpl');
  _$jscoverage['/picker/decade-panel/control.js'].lineData[15]++;
  function prepareYears(self, view) {
    _$jscoverage['/picker/decade-panel/control.js'].functionData[1]++;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[16]++;
    var value = self.get('value');
    _$jscoverage['/picker/decade-panel/control.js'].lineData[17]++;
    var currentYear = value.getYear();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[18]++;
    var startYear = parseInt(currentYear / 100, 10) * 100;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[19]++;
    var preYear = startYear - 10;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[20]++;
    var endYear = startYear + 99;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[21]++;
    var decades = [];
    _$jscoverage['/picker/decade-panel/control.js'].lineData[22]++;
    var index = 0;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[23]++;
    for (var i = 0; visit1_23_1(i < 3); i++) {
      _$jscoverage['/picker/decade-panel/control.js'].lineData[24]++;
      decades[i] = [];
      _$jscoverage['/picker/decade-panel/control.js'].lineData[25]++;
      for (var j = 0; visit2_25_1(j < 4); j++) {
        _$jscoverage['/picker/decade-panel/control.js'].lineData[26]++;
        decades[i][j] = {
  startDecade: preYear + index * 10, 
  endDecade: preYear + index * 10 + 9};
        _$jscoverage['/picker/decade-panel/control.js'].lineData[30]++;
        index++;
      }
    }
    _$jscoverage['/picker/decade-panel/control.js'].lineData[33]++;
    self.decades = decades;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[34]++;
    S.mix(view.renderData, {
  startYear: startYear, 
  endYear: endYear, 
  year: currentYear, 
  decades: decades});
  }
  _$jscoverage['/picker/decade-panel/control.js'].lineData[42]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/decade-panel/control.js'].functionData[2]++;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[43]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[44]++;
    next.addYear(direction);
    _$jscoverage['/picker/decade-panel/control.js'].lineData[45]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/decade-panel/control.js'].lineData[48]++;
  function nextCentury(e) {
    _$jscoverage['/picker/decade-panel/control.js'].functionData[3]++;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[49]++;
    e.preventDefault();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[50]++;
    goYear(this, 100);
  }
  _$jscoverage['/picker/decade-panel/control.js'].lineData[53]++;
  function previousCentury(e) {
    _$jscoverage['/picker/decade-panel/control.js'].functionData[4]++;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[54]++;
    e.preventDefault();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[55]++;
    goYear(this, -100);
  }
  _$jscoverage['/picker/decade-panel/control.js'].lineData[58]++;
  function chooseCell(e) {
    _$jscoverage['/picker/decade-panel/control.js'].functionData[5]++;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[59]++;
    e.preventDefault();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[60]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/decade-panel/control.js'].lineData[61]++;
    var tr = td.parent();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[62]++;
    var tdIndex = td.index();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[63]++;
    var trIndex = tr.index();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[64]++;
    var value = this.get('value').clone();
    _$jscoverage['/picker/decade-panel/control.js'].lineData[65]++;
    var y = value.getYear() % 10;
    _$jscoverage['/picker/decade-panel/control.js'].lineData[66]++;
    value.setYear(this.decades[trIndex][tdIndex].startDecade + y);
    _$jscoverage['/picker/decade-panel/control.js'].lineData[67]++;
    this.set('value', value);
    _$jscoverage['/picker/decade-panel/control.js'].lineData[68]++;
    this.fire('select', {
  value: value});
  }
  _$jscoverage['/picker/decade-panel/control.js'].lineData[73]++;
  return Control.extend({
  beforeCreateDom: function(renderData, childrenSelectors) {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[6]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[75]++;
  var self = this;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[76]++;
  var locale = self.get('locale');
  _$jscoverage['/picker/decade-panel/control.js'].lineData[77]++;
  prepareYears(self, this);
  _$jscoverage['/picker/decade-panel/control.js'].lineData[78]++;
  S.mix(renderData, {
  previousCenturyLabel: locale.previousCentury, 
  nextCenturyLabel: locale.nextCentury});
  _$jscoverage['/picker/decade-panel/control.js'].lineData[82]++;
  S.mix(childrenSelectors, {
  tbodyEl: '#ks-date-picker-decade-panel-tbody-{id}', 
  previousCenturyBtn: '#ks-date-picker-decade-panel-previous-century-btn-{id}', 
  centuryEl: '#ks-date-picker-decade-panel-century-{id}', 
  nextCenturyBtn: '#ks-date-picker-decade-panel-next-century-btn-{id}'});
}, 
  bindUI: function() {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[7]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[91]++;
  var self = this;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[92]++;
  self.get('nextCenturyBtn').on(tap, nextCentury, self);
  _$jscoverage['/picker/decade-panel/control.js'].lineData[93]++;
  self.get('previousCenturyBtn').on(tap, previousCentury, self);
  _$jscoverage['/picker/decade-panel/control.js'].lineData[94]++;
  self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
}, 
  _onSetValue: function() {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[8]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[104]++;
  prepareYears(self, this);
  _$jscoverage['/picker/decade-panel/control.js'].lineData[105]++;
  var startYear = this.renderData.startYear;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[106]++;
  var endYear = this.renderData.endYear;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[107]++;
  self.get('tbodyEl').html(this.renderTpl(MonthsTpl));
  _$jscoverage['/picker/decade-panel/control.js'].lineData[108]++;
  self.get('centuryEl').html(startYear + '-' + endYear);
}}, {
  xclass: 'date-picker-decade-panel', 
  ATTRS: {
  contentTpl: {
  value: DecadePanelTpl}, 
  focusable: {
  value: false}, 
  value: {
  render: 1}, 
  tbodyEl: {
  selector: function() {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[9]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[124]++;
  return '.' + this.getBaseCssClass('tbody');
}}, 
  previousCenturyBtn: {
  selector: function() {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[10]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[129]++;
  return '.' + this.getBaseCssClass('prev-century-btn');
}}, 
  nextCenturyBtn: {
  selector: function() {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[11]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[134]++;
  return '.' + this.getBaseCssClass('next-century-btn');
}}, 
  centuryEl: {
  selector: function() {
  _$jscoverage['/picker/decade-panel/control.js'].functionData[12]++;
  _$jscoverage['/picker/decade-panel/control.js'].lineData[139]++;
  return '.' + this.getBaseCssClass('century');
}}}});
});
