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
if (! _$jscoverage['/picker/month-panel/control.js']) {
  _$jscoverage['/picker/month-panel/control.js'] = {};
  _$jscoverage['/picker/month-panel/control.js'].lineData = [];
  _$jscoverage['/picker/month-panel/control.js'].lineData[6] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[7] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[10] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[13] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[14] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[15] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[17] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[18] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[19] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[20] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[21] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[22] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[23] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[24] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[28] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[37] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[52] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[68] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[70] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[82] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[85] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[86] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[91] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[95] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[96] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[97] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[100] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[102] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[103] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[104] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[109] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[113] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[114] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[115] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[116] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[122] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[126] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[127] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[128] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[129] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[149] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[154] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[159] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[164] = 0;
  _$jscoverage['/picker/month-panel/control.js'].lineData[169] = 0;
}
if (! _$jscoverage['/picker/month-panel/control.js'].functionData) {
  _$jscoverage['/picker/month-panel/control.js'].functionData = [];
  _$jscoverage['/picker/month-panel/control.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[1] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[2] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[3] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[4] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[5] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[6] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[7] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[8] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[9] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[10] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[11] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[12] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[13] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[14] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[15] = 0;
  _$jscoverage['/picker/month-panel/control.js'].functionData[16] = 0;
}
if (! _$jscoverage['/picker/month-panel/control.js'].branchData) {
  _$jscoverage['/picker/month-panel/control.js'].branchData = {};
  _$jscoverage['/picker/month-panel/control.js'].branchData['28'] = [];
  _$jscoverage['/picker/month-panel/control.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/control.js'].branchData['30'] = [];
  _$jscoverage['/picker/month-panel/control.js'].branchData['30'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/control.js'].branchData['30'][1].init(59, 5, 'j < 4');
function visit23_30_1(result) {
  _$jscoverage['/picker/month-panel/control.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/control.js'].branchData['28'][1].init(467, 5, 'i < 3');
function visit22_28_1(result) {
  _$jscoverage['/picker/month-panel/control.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker/month-panel/control.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[7]++;
  var Node = require('node'), Control = require('component/control'), YearPanel = require('../year-panel/control');
  _$jscoverage['/picker/month-panel/control.js'].lineData[10]++;
  var DateFormat = require('date/format'), MonthsTpl = require('./months-xtpl'), MonthPanelTpl = require('./month-panel-xtpl');
  _$jscoverage['/picker/month-panel/control.js'].lineData[13]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/picker/month-panel/control.js'].lineData[14]++;
  var tap = TapGesture.TAP;
  _$jscoverage['/picker/month-panel/control.js'].lineData[15]++;
  var $ = Node.all;
  _$jscoverage['/picker/month-panel/control.js'].lineData[17]++;
  function prepareMonths(self) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[1]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[18]++;
    var value = self.get('value');
    _$jscoverage['/picker/month-panel/control.js'].lineData[19]++;
    var currentMonth = value.getMonth();
    _$jscoverage['/picker/month-panel/control.js'].lineData[20]++;
    var current = value.clone();
    _$jscoverage['/picker/month-panel/control.js'].lineData[21]++;
    var locale = self.get('locale');
    _$jscoverage['/picker/month-panel/control.js'].lineData[22]++;
    var monthYearFormat = locale.monthYearFormat;
    _$jscoverage['/picker/month-panel/control.js'].lineData[23]++;
    var dateLocale = value.getLocale();
    _$jscoverage['/picker/month-panel/control.js'].lineData[24]++;
    var dateFormatter = new DateFormat(monthYearFormat, dateLocale);
    _$jscoverage['/picker/month-panel/control.js'].lineData[25]++;
    var months = [];
    _$jscoverage['/picker/month-panel/control.js'].lineData[26]++;
    var shortMonths = dateLocale.shortMonths;
    _$jscoverage['/picker/month-panel/control.js'].lineData[27]++;
    var index = 0;
    _$jscoverage['/picker/month-panel/control.js'].lineData[28]++;
    for (var i = 0; visit22_28_1(i < 3); i++) {
      _$jscoverage['/picker/month-panel/control.js'].lineData[29]++;
      months[i] = [];
      _$jscoverage['/picker/month-panel/control.js'].lineData[30]++;
      for (var j = 0; visit23_30_1(j < 4); j++) {
        _$jscoverage['/picker/month-panel/control.js'].lineData[31]++;
        current.setMonth(index);
        _$jscoverage['/picker/month-panel/control.js'].lineData[32]++;
        months[i][j] = {
  value: index, 
  content: shortMonths[index], 
  title: dateFormatter.format(current)};
        _$jscoverage['/picker/month-panel/control.js'].lineData[37]++;
        index++;
      }
    }
    _$jscoverage['/picker/month-panel/control.js'].lineData[40]++;
    S.mix(self.renderData, {
  months: months, 
  year: value.getYear(), 
  month: currentMonth});
    _$jscoverage['/picker/month-panel/control.js'].lineData[45]++;
    self.months = months;
    _$jscoverage['/picker/month-panel/control.js'].lineData[46]++;
    return months;
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[49]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[2]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[50]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/month-panel/control.js'].lineData[51]++;
    next.addYear(direction);
    _$jscoverage['/picker/month-panel/control.js'].lineData[52]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[55]++;
  function nextYear(e) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[3]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[56]++;
    e.preventDefault();
    _$jscoverage['/picker/month-panel/control.js'].lineData[57]++;
    goYear(this, 1);
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[60]++;
  function previousYear(e) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[4]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[61]++;
    e.preventDefault();
    _$jscoverage['/picker/month-panel/control.js'].lineData[62]++;
    goYear(this, -1);
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[65]++;
  function chooseCell(e) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[5]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[66]++;
    e.preventDefault();
    _$jscoverage['/picker/month-panel/control.js'].lineData[67]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/month-panel/control.js'].lineData[68]++;
    var tr = td.parent();
    _$jscoverage['/picker/month-panel/control.js'].lineData[69]++;
    var tdIndex = td.index();
    _$jscoverage['/picker/month-panel/control.js'].lineData[70]++;
    var trIndex = tr.index();
    _$jscoverage['/picker/month-panel/control.js'].lineData[71]++;
    var value = this.get('value').clone();
    _$jscoverage['/picker/month-panel/control.js'].lineData[72]++;
    value.setMonth(trIndex * 4 + tdIndex);
    _$jscoverage['/picker/month-panel/control.js'].lineData[73]++;
    this.fire('select', {
  value: value});
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[78]++;
  function showYearPanel(e) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[6]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[79]++;
    e.preventDefault();
    _$jscoverage['/picker/month-panel/control.js'].lineData[80]++;
    var yearPanel = this.get('yearPanel');
    _$jscoverage['/picker/month-panel/control.js'].lineData[81]++;
    yearPanel.set('value', this.get('value'));
    _$jscoverage['/picker/month-panel/control.js'].lineData[82]++;
    yearPanel.show();
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[85]++;
  function setUpYearPanel() {
    _$jscoverage['/picker/month-panel/control.js'].functionData[7]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[86]++;
    var self = this;
    _$jscoverage['/picker/month-panel/control.js'].lineData[87]++;
    var yearPanel = new YearPanel({
  locale: this.get('locale'), 
  render: self.get('render')});
    _$jscoverage['/picker/month-panel/control.js'].lineData[91]++;
    yearPanel.on('select', onYearPanelSelect, self);
    _$jscoverage['/picker/month-panel/control.js'].lineData[92]++;
    return yearPanel;
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[95]++;
  function onYearPanelSelect(e) {
    _$jscoverage['/picker/month-panel/control.js'].functionData[8]++;
    _$jscoverage['/picker/month-panel/control.js'].lineData[96]++;
    this.set('value', e.value);
    _$jscoverage['/picker/month-panel/control.js'].lineData[97]++;
    this.get('yearPanel').hide();
  }
  _$jscoverage['/picker/month-panel/control.js'].lineData[100]++;
  return Control.extend({
  beforeCreateDom: function(renderData) {
  _$jscoverage['/picker/month-panel/control.js'].functionData[9]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[102]++;
  var self = this;
  _$jscoverage['/picker/month-panel/control.js'].lineData[103]++;
  var locale = self.get('locale');
  _$jscoverage['/picker/month-panel/control.js'].lineData[104]++;
  S.mix(renderData, {
  yearSelectLabel: locale.yearSelect, 
  previousYearLabel: locale.previousYear, 
  nextYearLabel: locale.nextYear});
  _$jscoverage['/picker/month-panel/control.js'].lineData[109]++;
  prepareMonths(self);
}, 
  bindUI: function() {
  _$jscoverage['/picker/month-panel/control.js'].functionData[10]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[113]++;
  var self = this;
  _$jscoverage['/picker/month-panel/control.js'].lineData[114]++;
  self.get('nextYearBtn').on(tap, nextYear, self);
  _$jscoverage['/picker/month-panel/control.js'].lineData[115]++;
  self.get('previousYearBtn').on(tap, previousYear, self);
  _$jscoverage['/picker/month-panel/control.js'].lineData[116]++;
  self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker/month-panel/control.js'].lineData[122]++;
  self.get('yearSelectEl').on(tap, showYearPanel, self);
}, 
  _onSetValue: function(value) {
  _$jscoverage['/picker/month-panel/control.js'].functionData[11]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[126]++;
  var self = this;
  _$jscoverage['/picker/month-panel/control.js'].lineData[127]++;
  prepareMonths(self);
  _$jscoverage['/picker/month-panel/control.js'].lineData[128]++;
  self.get('tbodyEl').html(this.renderTpl(MonthsTpl));
  _$jscoverage['/picker/month-panel/control.js'].lineData[129]++;
  self.get('yearSelectContentEl').html(value.getYear());
}}, {
  xclass: 'date-picker-month-panel', 
  ATTRS: {
  contentTpl: {
  value: MonthPanelTpl}, 
  focusable: {
  value: false}, 
  value: {
  render: 1}, 
  yearPanel: {
  valueFn: setUpYearPanel}, 
  tbodyEl: {
  selector: function() {
  _$jscoverage['/picker/month-panel/control.js'].functionData[12]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[149]++;
  return '.' + this.getBaseCssClass('tbody');
}}, 
  previousYearBtn: {
  selector: function() {
  _$jscoverage['/picker/month-panel/control.js'].functionData[13]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[154]++;
  return '.' + this.getBaseCssClass('prev-year-btn');
}}, 
  nextYearBtn: {
  selector: function() {
  _$jscoverage['/picker/month-panel/control.js'].functionData[14]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[159]++;
  return '.' + this.getBaseCssClass('next-year-btn');
}}, 
  yearSelectEl: {
  selector: function() {
  _$jscoverage['/picker/month-panel/control.js'].functionData[15]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[164]++;
  return '.' + this.getBaseCssClass('year-select');
}}, 
  yearSelectContentEl: {
  selector: function() {
  _$jscoverage['/picker/month-panel/control.js'].functionData[16]++;
  _$jscoverage['/picker/month-panel/control.js'].lineData[169]++;
  return '.' + this.getBaseCssClass('year-select-content');
}}}});
});
