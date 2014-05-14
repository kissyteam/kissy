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
if (! _$jscoverage['/picker/year-panel/control.js']) {
  _$jscoverage['/picker/year-panel/control.js'] = {};
  _$jscoverage['/picker/year-panel/control.js'].lineData = [];
  _$jscoverage['/picker/year-panel/control.js'].lineData[6] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[7] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[8] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[11] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[12] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[13] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[14] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[18] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[19] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[22] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[25] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[57] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[117] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[126] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[130] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[131] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[133] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[134] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[140] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[160] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[165] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[170] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[175] = 0;
  _$jscoverage['/picker/year-panel/control.js'].lineData[180] = 0;
}
if (! _$jscoverage['/picker/year-panel/control.js'].functionData) {
  _$jscoverage['/picker/year-panel/control.js'].functionData = [];
  _$jscoverage['/picker/year-panel/control.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[1] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[2] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[3] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[4] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[5] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[6] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[7] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[8] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[9] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[10] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[11] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[12] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[13] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[14] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[15] = 0;
  _$jscoverage['/picker/year-panel/control.js'].functionData[16] = 0;
}
if (! _$jscoverage['/picker/year-panel/control.js'].branchData) {
  _$jscoverage['/picker/year-panel/control.js'].branchData = {};
  _$jscoverage['/picker/year-panel/control.js'].branchData['30'] = [];
  _$jscoverage['/picker/year-panel/control.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/control.js'].branchData['32'] = [];
  _$jscoverage['/picker/year-panel/control.js'].branchData['32'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/control.js'].branchData['32'][1].init(58, 5, 'j < 4');
function visit37_32_1(result) {
  _$jscoverage['/picker/year-panel/control.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/control.js'].branchData['30'][1].init(498, 5, 'i < 3');
function visit36_30_1(result) {
  _$jscoverage['/picker/year-panel/control.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker/year-panel/control.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/picker/year-panel/control.js'].lineData[8]++;
  var Node = require('node'), Control = require('component/control'), DecadePanel = require('../decade-panel/control');
  _$jscoverage['/picker/year-panel/control.js'].lineData[11]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/picker/year-panel/control.js'].lineData[12]++;
  var tap = TapGesture.TAP;
  _$jscoverage['/picker/year-panel/control.js'].lineData[13]++;
  var $ = Node.all;
  _$jscoverage['/picker/year-panel/control.js'].lineData[14]++;
  var DateFormat = require('date/format'), YearsTpl = require('./years-xtpl'), YearPanelTpl = require('./year-panel-xtpl');
  _$jscoverage['/picker/year-panel/control.js'].lineData[18]++;
  function prepareYears(self) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[1]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[19]++;
    var value = self.get('value');
    _$jscoverage['/picker/year-panel/control.js'].lineData[20]++;
    var currentYear = value.getYear();
    _$jscoverage['/picker/year-panel/control.js'].lineData[21]++;
    var startYear = parseInt(currentYear / 10, 10) * 10;
    _$jscoverage['/picker/year-panel/control.js'].lineData[22]++;
    var preYear = startYear - 1;
    _$jscoverage['/picker/year-panel/control.js'].lineData[23]++;
    var current = value.clone();
    _$jscoverage['/picker/year-panel/control.js'].lineData[24]++;
    var locale = self.get('locale');
    _$jscoverage['/picker/year-panel/control.js'].lineData[25]++;
    var yearFormat = locale.yearFormat;
    _$jscoverage['/picker/year-panel/control.js'].lineData[26]++;
    var dateLocale = value.getLocale();
    _$jscoverage['/picker/year-panel/control.js'].lineData[27]++;
    var dateFormatter = new DateFormat(yearFormat, dateLocale);
    _$jscoverage['/picker/year-panel/control.js'].lineData[28]++;
    var years = [];
    _$jscoverage['/picker/year-panel/control.js'].lineData[29]++;
    var index = 0;
    _$jscoverage['/picker/year-panel/control.js'].lineData[30]++;
    for (var i = 0; visit36_30_1(i < 3); i++) {
      _$jscoverage['/picker/year-panel/control.js'].lineData[31]++;
      years[i] = [];
      _$jscoverage['/picker/year-panel/control.js'].lineData[32]++;
      for (var j = 0; visit37_32_1(j < 4); j++) {
        _$jscoverage['/picker/year-panel/control.js'].lineData[33]++;
        current.setYear(preYear + index);
        _$jscoverage['/picker/year-panel/control.js'].lineData[34]++;
        years[i][j] = {
  content: preYear + index, 
  title: dateFormatter.format(current)};
        _$jscoverage['/picker/year-panel/control.js'].lineData[38]++;
        index++;
      }
    }
    _$jscoverage['/picker/year-panel/control.js'].lineData[41]++;
    self.years = years;
    _$jscoverage['/picker/year-panel/control.js'].lineData[42]++;
    return years;
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[45]++;
  function goYear(self, direction) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[2]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[46]++;
    var next = self.get('value').clone();
    _$jscoverage['/picker/year-panel/control.js'].lineData[47]++;
    next.addYear(direction);
    _$jscoverage['/picker/year-panel/control.js'].lineData[48]++;
    self.set('value', next);
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[51]++;
  function nextDecade(e) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[3]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[52]++;
    e.preventDefault();
    _$jscoverage['/picker/year-panel/control.js'].lineData[53]++;
    goYear(this, 10);
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[56]++;
  function prevDecade(e) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[4]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[57]++;
    e.preventDefault();
    _$jscoverage['/picker/year-panel/control.js'].lineData[58]++;
    goYear(this, -10);
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[61]++;
  function chooseCell(e) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[5]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[62]++;
    e.preventDefault();
    _$jscoverage['/picker/year-panel/control.js'].lineData[63]++;
    var td = $(e.currentTarget);
    _$jscoverage['/picker/year-panel/control.js'].lineData[64]++;
    var tr = td.parent();
    _$jscoverage['/picker/year-panel/control.js'].lineData[65]++;
    var tdIndex = td.index();
    _$jscoverage['/picker/year-panel/control.js'].lineData[66]++;
    var trIndex = tr.index();
    _$jscoverage['/picker/year-panel/control.js'].lineData[67]++;
    var value = this.get('value').clone();
    _$jscoverage['/picker/year-panel/control.js'].lineData[68]++;
    value.setYear(this.years[trIndex][tdIndex].content);
    _$jscoverage['/picker/year-panel/control.js'].lineData[69]++;
    this.set('value', value);
    _$jscoverage['/picker/year-panel/control.js'].lineData[70]++;
    this.fire('select', {
  value: value});
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[75]++;
  function showDecadePanel(e) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[6]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[76]++;
    e.preventDefault();
    _$jscoverage['/picker/year-panel/control.js'].lineData[77]++;
    var decadePanel = this.get('decadePanel');
    _$jscoverage['/picker/year-panel/control.js'].lineData[78]++;
    decadePanel.set('value', this.get('value'));
    _$jscoverage['/picker/year-panel/control.js'].lineData[79]++;
    decadePanel.show();
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[82]++;
  function setUpDecadePanel() {
    _$jscoverage['/picker/year-panel/control.js'].functionData[7]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[83]++;
    var self = this;
    _$jscoverage['/picker/year-panel/control.js'].lineData[84]++;
    var decadePanel = new DecadePanel({
  locale: this.get('locale'), 
  render: self.get('render')});
    _$jscoverage['/picker/year-panel/control.js'].lineData[88]++;
    decadePanel.on('select', onDecadePanelSelect, self);
    _$jscoverage['/picker/year-panel/control.js'].lineData[89]++;
    return decadePanel;
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[92]++;
  function onDecadePanelSelect(e) {
    _$jscoverage['/picker/year-panel/control.js'].functionData[8]++;
    _$jscoverage['/picker/year-panel/control.js'].lineData[93]++;
    this.set('value', e.value);
    _$jscoverage['/picker/year-panel/control.js'].lineData[94]++;
    this.get('decadePanel').hide();
  }
  _$jscoverage['/picker/year-panel/control.js'].lineData[97]++;
  return Control.extend({
  beforeCreateDom: function(renderData) {
  _$jscoverage['/picker/year-panel/control.js'].functionData[9]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[99]++;
  var self = this;
  _$jscoverage['/picker/year-panel/control.js'].lineData[100]++;
  var value = self.get('value');
  _$jscoverage['/picker/year-panel/control.js'].lineData[101]++;
  var currentYear = value.getYear();
  _$jscoverage['/picker/year-panel/control.js'].lineData[102]++;
  var startYear = parseInt(currentYear / 10, 10) * 10;
  _$jscoverage['/picker/year-panel/control.js'].lineData[103]++;
  var endYear = startYear + 9;
  _$jscoverage['/picker/year-panel/control.js'].lineData[104]++;
  var locale = self.get('locale');
  _$jscoverage['/picker/year-panel/control.js'].lineData[105]++;
  util.mix(renderData, {
  decadeSelectLabel: locale.decadeSelect, 
  years: prepareYears(self), 
  startYear: startYear, 
  endYear: endYear, 
  year: value.getYear(), 
  previousDecadeLabel: locale.previousDecade, 
  nextDecadeLabel: locale.nextDecade});
}, 
  bindUI: function() {
  _$jscoverage['/picker/year-panel/control.js'].functionData[10]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[117]++;
  var self = this;
  _$jscoverage['/picker/year-panel/control.js'].lineData[118]++;
  self.get('nextDecadeBtn').on(tap, nextDecade, self);
  _$jscoverage['/picker/year-panel/control.js'].lineData[119]++;
  self.get('previousDecadeBtn').on(tap, prevDecade, self);
  _$jscoverage['/picker/year-panel/control.js'].lineData[120]++;
  self.get('tbodyEl').delegate(tap, '.' + self.getBaseCssClass('cell'), chooseCell, self);
  _$jscoverage['/picker/year-panel/control.js'].lineData[126]++;
  self.get('decadeSelectEl').on(tap, showDecadePanel, self);
}, 
  _onSetValue: function(value) {
  _$jscoverage['/picker/year-panel/control.js'].functionData[11]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[130]++;
  var self = this;
  _$jscoverage['/picker/year-panel/control.js'].lineData[131]++;
  var currentYear = value.getYear();
  _$jscoverage['/picker/year-panel/control.js'].lineData[132]++;
  var startYear = parseInt(currentYear / 10, 10) * 10;
  _$jscoverage['/picker/year-panel/control.js'].lineData[133]++;
  var endYear = startYear + 9;
  _$jscoverage['/picker/year-panel/control.js'].lineData[134]++;
  util.mix(self.renderData, {
  startYear: startYear, 
  endYear: endYear, 
  years: prepareYears(self), 
  year: value.getYear()});
  _$jscoverage['/picker/year-panel/control.js'].lineData[140]++;
  self.get('tbodyEl').html(this.renderTpl(YearsTpl));
  _$jscoverage['/picker/year-panel/control.js'].lineData[141]++;
  self.get('decadeSelectContentEl').html(startYear + '-' + endYear);
}}, {
  xclass: 'date-picker-year-panel', 
  ATTRS: {
  contentTpl: {
  value: YearPanelTpl}, 
  focusable: {
  value: false}, 
  value: {
  render: 1}, 
  decadePanel: {
  valueFn: setUpDecadePanel}, 
  tbodyEl: {
  selector: function() {
  _$jscoverage['/picker/year-panel/control.js'].functionData[12]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[160]++;
  return '.' + this.getBaseCssClass('tbody');
}}, 
  previousDecadeBtn: {
  selector: function() {
  _$jscoverage['/picker/year-panel/control.js'].functionData[13]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[165]++;
  return '.' + this.getBaseCssClass('prev-decade-btn');
}}, 
  nextDecadeBtn: {
  selector: function() {
  _$jscoverage['/picker/year-panel/control.js'].functionData[14]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[170]++;
  return '.' + this.getBaseCssClass('next-decade-btn');
}}, 
  decadeSelectEl: {
  selector: function() {
  _$jscoverage['/picker/year-panel/control.js'].functionData[15]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[175]++;
  return '.' + this.getBaseCssClass('decade-select');
}}, 
  decadeSelectContentEl: {
  selector: function() {
  _$jscoverage['/picker/year-panel/control.js'].functionData[16]++;
  _$jscoverage['/picker/year-panel/control.js'].lineData[180]++;
  return '.' + this.getBaseCssClass('decade-select-content');
}}}});
});
