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
if (! _$jscoverage['/ie/change.js']) {
  _$jscoverage['/ie/change.js'] = {};
  _$jscoverage['/ie/change.js'].lineData = [];
  _$jscoverage['/ie/change.js'].lineData[6] = 0;
  _$jscoverage['/ie/change.js'].lineData[7] = 0;
  _$jscoverage['/ie/change.js'].lineData[8] = 0;
  _$jscoverage['/ie/change.js'].lineData[9] = 0;
  _$jscoverage['/ie/change.js'].lineData[12] = 0;
  _$jscoverage['/ie/change.js'].lineData[13] = 0;
  _$jscoverage['/ie/change.js'].lineData[16] = 0;
  _$jscoverage['/ie/change.js'].lineData[17] = 0;
  _$jscoverage['/ie/change.js'].lineData[18] = 0;
  _$jscoverage['/ie/change.js'].lineData[21] = 0;
  _$jscoverage['/ie/change.js'].lineData[23] = 0;
  _$jscoverage['/ie/change.js'].lineData[24] = 0;
  _$jscoverage['/ie/change.js'].lineData[27] = 0;
  _$jscoverage['/ie/change.js'].lineData[30] = 0;
  _$jscoverage['/ie/change.js'].lineData[32] = 0;
  _$jscoverage['/ie/change.js'].lineData[35] = 0;
  _$jscoverage['/ie/change.js'].lineData[41] = 0;
  _$jscoverage['/ie/change.js'].lineData[45] = 0;
  _$jscoverage['/ie/change.js'].lineData[46] = 0;
  _$jscoverage['/ie/change.js'].lineData[47] = 0;
  _$jscoverage['/ie/change.js'].lineData[48] = 0;
  _$jscoverage['/ie/change.js'].lineData[49] = 0;
  _$jscoverage['/ie/change.js'].lineData[51] = 0;
  _$jscoverage['/ie/change.js'].lineData[54] = 0;
  _$jscoverage['/ie/change.js'].lineData[55] = 0;
  _$jscoverage['/ie/change.js'].lineData[56] = 0;
  _$jscoverage['/ie/change.js'].lineData[57] = 0;
  _$jscoverage['/ie/change.js'].lineData[58] = 0;
  _$jscoverage['/ie/change.js'].lineData[65] = 0;
  _$jscoverage['/ie/change.js'].lineData[67] = 0;
  _$jscoverage['/ie/change.js'].lineData[68] = 0;
  _$jscoverage['/ie/change.js'].lineData[69] = 0;
  _$jscoverage['/ie/change.js'].lineData[70] = 0;
  _$jscoverage['/ie/change.js'].lineData[71] = 0;
  _$jscoverage['/ie/change.js'].lineData[74] = 0;
  _$jscoverage['/ie/change.js'].lineData[75] = 0;
  _$jscoverage['/ie/change.js'].lineData[76] = 0;
  _$jscoverage['/ie/change.js'].lineData[81] = 0;
  _$jscoverage['/ie/change.js'].lineData[83] = 0;
  _$jscoverage['/ie/change.js'].lineData[84] = 0;
  _$jscoverage['/ie/change.js'].lineData[86] = 0;
  _$jscoverage['/ie/change.js'].lineData[90] = 0;
  _$jscoverage['/ie/change.js'].lineData[91] = 0;
  _$jscoverage['/ie/change.js'].lineData[92] = 0;
  _$jscoverage['/ie/change.js'].lineData[93] = 0;
  _$jscoverage['/ie/change.js'].lineData[95] = 0;
  _$jscoverage['/ie/change.js'].lineData[99] = 0;
  _$jscoverage['/ie/change.js'].lineData[100] = 0;
  _$jscoverage['/ie/change.js'].lineData[102] = 0;
  _$jscoverage['/ie/change.js'].lineData[109] = 0;
  _$jscoverage['/ie/change.js'].lineData[111] = 0;
  _$jscoverage['/ie/change.js'].lineData[112] = 0;
  _$jscoverage['/ie/change.js'].lineData[114] = 0;
}
if (! _$jscoverage['/ie/change.js'].functionData) {
  _$jscoverage['/ie/change.js'].functionData = [];
  _$jscoverage['/ie/change.js'].functionData[0] = 0;
  _$jscoverage['/ie/change.js'].functionData[1] = 0;
  _$jscoverage['/ie/change.js'].functionData[2] = 0;
  _$jscoverage['/ie/change.js'].functionData[3] = 0;
  _$jscoverage['/ie/change.js'].functionData[4] = 0;
  _$jscoverage['/ie/change.js'].functionData[5] = 0;
  _$jscoverage['/ie/change.js'].functionData[6] = 0;
  _$jscoverage['/ie/change.js'].functionData[7] = 0;
  _$jscoverage['/ie/change.js'].functionData[8] = 0;
  _$jscoverage['/ie/change.js'].functionData[9] = 0;
  _$jscoverage['/ie/change.js'].functionData[10] = 0;
}
if (! _$jscoverage['/ie/change.js'].branchData) {
  _$jscoverage['/ie/change.js'].branchData = {};
  _$jscoverage['/ie/change.js'].branchData['18'] = [];
  _$jscoverage['/ie/change.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['18'][3] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['24'] = [];
  _$jscoverage['/ie/change.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['27'] = [];
  _$jscoverage['/ie/change.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['46'] = [];
  _$jscoverage['/ie/change.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['47'] = [];
  _$jscoverage['/ie/change.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['56'] = [];
  _$jscoverage['/ie/change.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['67'] = [];
  _$jscoverage['/ie/change.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['70'] = [];
  _$jscoverage['/ie/change.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['83'] = [];
  _$jscoverage['/ie/change.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['92'] = [];
  _$jscoverage['/ie/change.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['106'] = [];
  _$jscoverage['/ie/change.js'].branchData['106'][1] = new BranchData();
}
_$jscoverage['/ie/change.js'].branchData['106'][1].init(167, 140, 'e.isPropagationStopped() || isCheckBoxOrRadio(self)');
function visit13_106_1(result) {
  _$jscoverage['/ie/change.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['92'][1].init(39, 38, 'isFormElement(t) && !t.__changeHandler');
function visit12_92_1(result) {
  _$jscoverage['/ie/change.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['83'][1].init(83, 14, 'this.__changed');
function visit11_83_1(result) {
  _$jscoverage['/ie/change.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['70'][1].init(78, 18, 'self.__changeTimer');
function visit10_70_1(result) {
  _$jscoverage['/ie/change.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['67'][1].init(69, 42, 'e.originalEvent.propertyName === \'checked\'');
function visit9_67_1(result) {
  _$jscoverage['/ie/change.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['56'][1].init(25, 19, 'fel.__changeHandler');
function visit8_56_1(result) {
  _$jscoverage['/ie/change.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['47'][1].init(21, 23, 'isCheckBoxOrRadio(self)');
function visit7_47_1(result) {
  _$jscoverage['/ie/change.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['46'][1].init(46, 19, 'isFormElement(self)');
function visit6_46_1(result) {
  _$jscoverage['/ie/change.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['27'][1].init(147, 23, 'isCheckBoxOrRadio(self)');
function visit5_27_1(result) {
  _$jscoverage['/ie/change.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['24'][1].init(46, 19, 'isFormElement(self)');
function visit4_24_1(result) {
  _$jscoverage['/ie/change.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['18'][3].init(67, 16, 'type === \'radio\'');
function visit3_18_3(result) {
  _$jscoverage['/ie/change.js'].branchData['18'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['18'][2].init(44, 19, 'type === \'checkbox\'');
function visit2_18_2(result) {
  _$jscoverage['/ie/change.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['18'][1].init(44, 39, 'type === \'checkbox\' || type === \'radio\'');
function visit1_18_1(result) {
  _$jscoverage['/ie/change.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/change.js'].functionData[0]++;
  _$jscoverage['/ie/change.js'].lineData[7]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/ie/change.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/ie/change.js'].lineData[9]++;
  var Special = DomEvent.Special, R_FORM_EL = /^(?:textarea|input|select)$/i;
  _$jscoverage['/ie/change.js'].lineData[12]++;
  function isFormElement(n) {
    _$jscoverage['/ie/change.js'].functionData[1]++;
    _$jscoverage['/ie/change.js'].lineData[13]++;
    return R_FORM_EL.test(n.nodeName);
  }
  _$jscoverage['/ie/change.js'].lineData[16]++;
  function isCheckBoxOrRadio(el) {
    _$jscoverage['/ie/change.js'].functionData[2]++;
    _$jscoverage['/ie/change.js'].lineData[17]++;
    var type = el.type;
    _$jscoverage['/ie/change.js'].lineData[18]++;
    return visit1_18_1(visit2_18_2(type === 'checkbox') || visit3_18_3(type === 'radio'));
  }
  _$jscoverage['/ie/change.js'].lineData[21]++;
  Special.change = {
  setup: function() {
  _$jscoverage['/ie/change.js'].functionData[3]++;
  _$jscoverage['/ie/change.js'].lineData[23]++;
  var self = this;
  _$jscoverage['/ie/change.js'].lineData[24]++;
  if (visit4_24_1(isFormElement(self))) {
    _$jscoverage['/ie/change.js'].lineData[27]++;
    if (visit5_27_1(isCheckBoxOrRadio(self))) {
      _$jscoverage['/ie/change.js'].lineData[30]++;
      DomEvent.on(self, 'propertychange', propertyChange);
      _$jscoverage['/ie/change.js'].lineData[32]++;
      DomEvent.on(self, 'click', onClick);
    } else {
      _$jscoverage['/ie/change.js'].lineData[35]++;
      return false;
    }
  } else {
    _$jscoverage['/ie/change.js'].lineData[41]++;
    DomEvent.on(self, 'beforeactivate', beforeActivate);
  }
}, 
  tearDown: function() {
  _$jscoverage['/ie/change.js'].functionData[4]++;
  _$jscoverage['/ie/change.js'].lineData[45]++;
  var self = this;
  _$jscoverage['/ie/change.js'].lineData[46]++;
  if (visit6_46_1(isFormElement(self))) {
    _$jscoverage['/ie/change.js'].lineData[47]++;
    if (visit7_47_1(isCheckBoxOrRadio(self))) {
      _$jscoverage['/ie/change.js'].lineData[48]++;
      DomEvent.remove(self, 'propertychange', propertyChange);
      _$jscoverage['/ie/change.js'].lineData[49]++;
      DomEvent.remove(self, 'click', onClick);
    } else {
      _$jscoverage['/ie/change.js'].lineData[51]++;
      return false;
    }
  } else {
    _$jscoverage['/ie/change.js'].lineData[54]++;
    DomEvent.remove(self, 'beforeactivate', beforeActivate);
    _$jscoverage['/ie/change.js'].lineData[55]++;
    Dom.query('textarea,input,select', self).each(function(fel) {
  _$jscoverage['/ie/change.js'].functionData[5]++;
  _$jscoverage['/ie/change.js'].lineData[56]++;
  if (visit8_56_1(fel.__changeHandler)) {
    _$jscoverage['/ie/change.js'].lineData[57]++;
    fel.__changeHandler = 0;
    _$jscoverage['/ie/change.js'].lineData[58]++;
    DomEvent.remove(fel, 'change', {
  fn: changeHandler, 
  last: 1});
  }
});
  }
}};
  _$jscoverage['/ie/change.js'].lineData[65]++;
  function propertyChange(e) {
    _$jscoverage['/ie/change.js'].functionData[6]++;
    _$jscoverage['/ie/change.js'].lineData[67]++;
    if (visit9_67_1(e.originalEvent.propertyName === 'checked')) {
      _$jscoverage['/ie/change.js'].lineData[68]++;
      var self = this;
      _$jscoverage['/ie/change.js'].lineData[69]++;
      self.__changed = 1;
      _$jscoverage['/ie/change.js'].lineData[70]++;
      if (visit10_70_1(self.__changeTimer)) {
        _$jscoverage['/ie/change.js'].lineData[71]++;
        clearTimeout(self.__changeTimer);
      }
      _$jscoverage['/ie/change.js'].lineData[74]++;
      self.__changeTimer = setTimeout(function() {
  _$jscoverage['/ie/change.js'].functionData[7]++;
  _$jscoverage['/ie/change.js'].lineData[75]++;
  self.__changed = 0;
  _$jscoverage['/ie/change.js'].lineData[76]++;
  self.__changeTimer = null;
}, 50);
    }
  }
  _$jscoverage['/ie/change.js'].lineData[81]++;
  function onClick(e) {
    _$jscoverage['/ie/change.js'].functionData[8]++;
    _$jscoverage['/ie/change.js'].lineData[83]++;
    if (visit11_83_1(this.__changed)) {
      _$jscoverage['/ie/change.js'].lineData[84]++;
      this.__changed = 0;
      _$jscoverage['/ie/change.js'].lineData[86]++;
      DomEvent.fire(this, 'change', e);
    }
  }
  _$jscoverage['/ie/change.js'].lineData[90]++;
  function beforeActivate(e) {
    _$jscoverage['/ie/change.js'].functionData[9]++;
    _$jscoverage['/ie/change.js'].lineData[91]++;
    var t = e.target;
    _$jscoverage['/ie/change.js'].lineData[92]++;
    if (visit12_92_1(isFormElement(t) && !t.__changeHandler)) {
      _$jscoverage['/ie/change.js'].lineData[93]++;
      t.__changeHandler = 1;
      _$jscoverage['/ie/change.js'].lineData[95]++;
      DomEvent.on(t, 'change', {
  fn: changeHandler, 
  last: 1});
    }
  }
  _$jscoverage['/ie/change.js'].lineData[99]++;
  function changeHandler(e) {
    _$jscoverage['/ie/change.js'].functionData[10]++;
    _$jscoverage['/ie/change.js'].lineData[100]++;
    var self = this;
    _$jscoverage['/ie/change.js'].lineData[102]++;
    if (visit13_106_1(e.isPropagationStopped() || isCheckBoxOrRadio(self))) {
      _$jscoverage['/ie/change.js'].lineData[109]++;
      return;
    }
    _$jscoverage['/ie/change.js'].lineData[111]++;
    var p;
    _$jscoverage['/ie/change.js'].lineData[112]++;
    if ((p = self.parentNode)) {
      _$jscoverage['/ie/change.js'].lineData[114]++;
      DomEvent.fire(p, 'change', e);
    }
  }
});
