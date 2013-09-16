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
if (! _$jscoverage['/picker/month-panel/render.js']) {
  _$jscoverage['/picker/month-panel/render.js'] = {};
  _$jscoverage['/picker/month-panel/render.js'].lineData = [];
  _$jscoverage['/picker/month-panel/render.js'].lineData[6] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[7] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[8] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[9] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[10] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[11] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[12] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[13] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[14] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[15] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[16] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[17] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[18] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[19] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[20] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[21] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[22] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/render.js'].lineData[63] = 0;
}
if (! _$jscoverage['/picker/month-panel/render.js'].functionData) {
  _$jscoverage['/picker/month-panel/render.js'].functionData = [];
  _$jscoverage['/picker/month-panel/render.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/render.js'].functionData[1] = 0;
  _$jscoverage['/picker/month-panel/render.js'].functionData[2] = 0;
  _$jscoverage['/picker/month-panel/render.js'].functionData[3] = 0;
}
if (! _$jscoverage['/picker/month-panel/render.js'].branchData) {
  _$jscoverage['/picker/month-panel/render.js'].branchData = {};
  _$jscoverage['/picker/month-panel/render.js'].branchData['18'] = [];
  _$jscoverage['/picker/month-panel/render.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/render.js'].branchData['20'] = [];
  _$jscoverage['/picker/month-panel/render.js'].branchData['20'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/render.js'].branchData['20'][1].init(59, 5, 'j < 4');
function visit17_20_1(result) {
  _$jscoverage['/picker/month-panel/render.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/render.js'].branchData['18'][1].init(473, 5, 'i < 3');
function visit16_18_1(result) {
  _$jscoverage['/picker/month-panel/render.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/render.js'].lineData[6]++;
KISSY.add('date/picker/month-panel/render', function(S, Control, DateFormat, MonthsTpl, MonthPanelTpl) {
  _$jscoverage['/picker/month-panel/render.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/render.js'].lineData[7]++;
  function prepareMonths(control) {
    _$jscoverage['/picker/month-panel/render.js'].functionData[1]++;
    _$jscoverage['/picker/month-panel/render.js'].lineData[8]++;
    var value = control.get('value');
    _$jscoverage['/picker/month-panel/render.js'].lineData[9]++;
    var currentMonth = value.getMonth();
    _$jscoverage['/picker/month-panel/render.js'].lineData[10]++;
    var current = value.clone();
    _$jscoverage['/picker/month-panel/render.js'].lineData[11]++;
    var locale = control.get('locale');
    _$jscoverage['/picker/month-panel/render.js'].lineData[12]++;
    var monthYearFormat = locale.monthYearFormat;
    _$jscoverage['/picker/month-panel/render.js'].lineData[13]++;
    var dateLocale = value.getLocale();
    _$jscoverage['/picker/month-panel/render.js'].lineData[14]++;
    var dateFormatter = new DateFormat(monthYearFormat, dateLocale);
    _$jscoverage['/picker/month-panel/render.js'].lineData[15]++;
    var months = [];
    _$jscoverage['/picker/month-panel/render.js'].lineData[16]++;
    var shortMonths = dateLocale.shortMonths;
    _$jscoverage['/picker/month-panel/render.js'].lineData[17]++;
    var index = 0;
    _$jscoverage['/picker/month-panel/render.js'].lineData[18]++;
    for (var i = 0; visit16_18_1(i < 3); i++) {
      _$jscoverage['/picker/month-panel/render.js'].lineData[19]++;
      months[i] = [];
      _$jscoverage['/picker/month-panel/render.js'].lineData[20]++;
      for (var j = 0; visit17_20_1(j < 4); j++) {
        _$jscoverage['/picker/month-panel/render.js'].lineData[21]++;
        current.setMonth(index);
        _$jscoverage['/picker/month-panel/render.js'].lineData[22]++;
        months[i][j] = {
  value: index, 
  content: shortMonths[index], 
  title: dateFormatter.format(current)};
        _$jscoverage['/picker/month-panel/render.js'].lineData[27]++;
        index++;
      }
    }
    _$jscoverage['/picker/month-panel/render.js'].lineData[30]++;
    S.mix(control.view.renderData, {
  months: months, 
  year: value.getYear(), 
  month: currentMonth});
    _$jscoverage['/picker/month-panel/render.js'].lineData[35]++;
    control.months = months;
    _$jscoverage['/picker/month-panel/render.js'].lineData[36]++;
    return months;
  }
  _$jscoverage['/picker/month-panel/render.js'].lineData[39]++;
  return Control.getDefaultRender().extend({
  beforeCreateDom: function(renderData, childrenSelectors) {
  _$jscoverage['/picker/month-panel/render.js'].functionData[2]++;
  _$jscoverage['/picker/month-panel/render.js'].lineData[41]++;
  var control = this.control;
  _$jscoverage['/picker/month-panel/render.js'].lineData[42]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/month-panel/render.js'].lineData[43]++;
  S.mix(renderData, {
  yearSelectLabel: locale.yearSelect, 
  previousYearLabel: locale.previousYear, 
  nextYearLabel: locale.nextYear});
  _$jscoverage['/picker/month-panel/render.js'].lineData[48]++;
  S.mix(childrenSelectors, {
  tbodyEl: '#ks-date-picker-month-panel-tbody-{id}', 
  previousYearBtn: '#ks-date-picker-month-panel-previous-year-btn-{id}', 
  yearSelectEl: '#ks-date-picker-month-panel-year-select-{id}', 
  yearSelectContentEl: '#ks-date-picker-month-panel-year-select-content-{id}', 
  nextYearBtn: '#ks-date-picker-month-panel-next-year-btn-{id}'});
  _$jscoverage['/picker/month-panel/render.js'].lineData[56]++;
  prepareMonths(control);
}, 
  _onSetValue: function(value) {
  _$jscoverage['/picker/month-panel/render.js'].functionData[3]++;
  _$jscoverage['/picker/month-panel/render.js'].lineData[60]++;
  var control = this.control;
  _$jscoverage['/picker/month-panel/render.js'].lineData[61]++;
  prepareMonths(control);
  _$jscoverage['/picker/month-panel/render.js'].lineData[62]++;
  control.get('tbodyEl').html(this.renderTpl(MonthsTpl));
  _$jscoverage['/picker/month-panel/render.js'].lineData[63]++;
  control.get('yearSelectContentEl').html(value.getYear());
}}, {
  ATTRS: {
  contentTpl: {
  value: MonthPanelTpl}}});
}, {
  requires: ['component/control', 'date/format', './months-xtpl', './month-panel-xtpl']});
