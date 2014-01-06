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
if (! _$jscoverage['/picker/decade-panel/render.js']) {
  _$jscoverage['/picker/decade-panel/render.js'] = {};
  _$jscoverage['/picker/decade-panel/render.js'].lineData = [];
  _$jscoverage['/picker/decade-panel/render.js'].lineData[6] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[7] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[11] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[12] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[13] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[14] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[15] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[16] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[17] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[18] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[19] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[20] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[21] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[22] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[29] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[38] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[40] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[41] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[42] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[47] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[56] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[57] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[58] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[59] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[61] = 0;
}
if (! _$jscoverage['/picker/decade-panel/render.js'].functionData) {
  _$jscoverage['/picker/decade-panel/render.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/render.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].functionData[1] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].functionData[2] = 0;
  _$jscoverage['/picker/decade-panel/render.js'].functionData[3] = 0;
}
if (! _$jscoverage['/picker/decade-panel/render.js'].branchData) {
  _$jscoverage['/picker/decade-panel/render.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/render.js'].branchData['19'] = [];
  _$jscoverage['/picker/decade-panel/render.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/render.js'].branchData['21'] = [];
  _$jscoverage['/picker/decade-panel/render.js'].branchData['21'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/render.js'].branchData['21'][1].init(58, 5, 'j < 4');
function visit19_21_1(result) {
  _$jscoverage['/picker/decade-panel/render.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/render.js'].branchData['19'][1].init(297, 5, 'i < 3');
function visit18_19_1(result) {
  _$jscoverage['/picker/decade-panel/render.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker/decade-panel/render.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[7]++;
  var Control = require('component/control'), DecadePanelTpl = require('./decade-panel-xtpl'), MonthsTpl = require('./decades-xtpl');
  _$jscoverage['/picker/decade-panel/render.js'].lineData[11]++;
  function prepareYears(control, view) {
    _$jscoverage['/picker/decade-panel/render.js'].functionData[1]++;
    _$jscoverage['/picker/decade-panel/render.js'].lineData[12]++;
    var value = control.get('value');
    _$jscoverage['/picker/decade-panel/render.js'].lineData[13]++;
    var currentYear = value.getYear();
    _$jscoverage['/picker/decade-panel/render.js'].lineData[14]++;
    var startYear = parseInt(currentYear / 100, 10) * 100;
    _$jscoverage['/picker/decade-panel/render.js'].lineData[15]++;
    var preYear = startYear - 10;
    _$jscoverage['/picker/decade-panel/render.js'].lineData[16]++;
    var endYear = startYear + 99;
    _$jscoverage['/picker/decade-panel/render.js'].lineData[17]++;
    var decades = [];
    _$jscoverage['/picker/decade-panel/render.js'].lineData[18]++;
    var index = 0;
    _$jscoverage['/picker/decade-panel/render.js'].lineData[19]++;
    for (var i = 0; visit18_19_1(i < 3); i++) {
      _$jscoverage['/picker/decade-panel/render.js'].lineData[20]++;
      decades[i] = [];
      _$jscoverage['/picker/decade-panel/render.js'].lineData[21]++;
      for (var j = 0; visit19_21_1(j < 4); j++) {
        _$jscoverage['/picker/decade-panel/render.js'].lineData[22]++;
        decades[i][j] = {
  startDecade: preYear + index * 10, 
  endDecade: preYear + index * 10 + 9};
        _$jscoverage['/picker/decade-panel/render.js'].lineData[26]++;
        index++;
      }
    }
    _$jscoverage['/picker/decade-panel/render.js'].lineData[29]++;
    control.decades = decades;
    _$jscoverage['/picker/decade-panel/render.js'].lineData[30]++;
    S.mix(view.renderData, {
  startYear: startYear, 
  endYear: endYear, 
  year: currentYear, 
  decades: decades});
  }
  _$jscoverage['/picker/decade-panel/render.js'].lineData[38]++;
  return Control.getDefaultRender().extend({
  beforeCreateDom: function(renderData, childrenSelectors) {
  _$jscoverage['/picker/decade-panel/render.js'].functionData[2]++;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[40]++;
  var control = this.control;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[41]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/decade-panel/render.js'].lineData[42]++;
  prepareYears(control, this);
  _$jscoverage['/picker/decade-panel/render.js'].lineData[43]++;
  S.mix(renderData, {
  previousCenturyLabel: locale.previousCentury, 
  nextCenturyLabel: locale.nextCentury});
  _$jscoverage['/picker/decade-panel/render.js'].lineData[47]++;
  S.mix(childrenSelectors, {
  tbodyEl: '#ks-date-picker-decade-panel-tbody-{id}', 
  previousCenturyBtn: '#ks-date-picker-decade-panel-previous-century-btn-{id}', 
  centuryEl: '#ks-date-picker-decade-panel-century-{id}', 
  nextCenturyBtn: '#ks-date-picker-decade-panel-next-century-btn-{id}'});
}, 
  _onSetValue: function() {
  _$jscoverage['/picker/decade-panel/render.js'].functionData[3]++;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[56]++;
  var control = this.control;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[57]++;
  prepareYears(control, this);
  _$jscoverage['/picker/decade-panel/render.js'].lineData[58]++;
  var startYear = this.renderData.startYear;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[59]++;
  var endYear = this.renderData.endYear;
  _$jscoverage['/picker/decade-panel/render.js'].lineData[60]++;
  control.get('tbodyEl').html(this.renderTpl(MonthsTpl));
  _$jscoverage['/picker/decade-panel/render.js'].lineData[61]++;
  control.get('centuryEl').html(startYear + '-' + endYear);
}}, {
  ATTRS: {
  contentTpl: {
  value: DecadePanelTpl}}});
});
