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
  _$jscoverage['/ie/change.js'].lineData[10] = 0;
  _$jscoverage['/ie/change.js'].lineData[11] = 0;
  _$jscoverage['/ie/change.js'].lineData[14] = 0;
  _$jscoverage['/ie/change.js'].lineData[15] = 0;
  _$jscoverage['/ie/change.js'].lineData[16] = 0;
  _$jscoverage['/ie/change.js'].lineData[19] = 0;
  _$jscoverage['/ie/change.js'].lineData[21] = 0;
  _$jscoverage['/ie/change.js'].lineData[22] = 0;
  _$jscoverage['/ie/change.js'].lineData[25] = 0;
  _$jscoverage['/ie/change.js'].lineData[28] = 0;
  _$jscoverage['/ie/change.js'].lineData[30] = 0;
  _$jscoverage['/ie/change.js'].lineData[33] = 0;
  _$jscoverage['/ie/change.js'].lineData[39] = 0;
  _$jscoverage['/ie/change.js'].lineData[43] = 0;
  _$jscoverage['/ie/change.js'].lineData[44] = 0;
  _$jscoverage['/ie/change.js'].lineData[45] = 0;
  _$jscoverage['/ie/change.js'].lineData[46] = 0;
  _$jscoverage['/ie/change.js'].lineData[47] = 0;
  _$jscoverage['/ie/change.js'].lineData[49] = 0;
  _$jscoverage['/ie/change.js'].lineData[52] = 0;
  _$jscoverage['/ie/change.js'].lineData[53] = 0;
  _$jscoverage['/ie/change.js'].lineData[54] = 0;
  _$jscoverage['/ie/change.js'].lineData[55] = 0;
  _$jscoverage['/ie/change.js'].lineData[56] = 0;
  _$jscoverage['/ie/change.js'].lineData[63] = 0;
  _$jscoverage['/ie/change.js'].lineData[65] = 0;
  _$jscoverage['/ie/change.js'].lineData[66] = 0;
  _$jscoverage['/ie/change.js'].lineData[70] = 0;
  _$jscoverage['/ie/change.js'].lineData[73] = 0;
  _$jscoverage['/ie/change.js'].lineData[74] = 0;
  _$jscoverage['/ie/change.js'].lineData[76] = 0;
  _$jscoverage['/ie/change.js'].lineData[80] = 0;
  _$jscoverage['/ie/change.js'].lineData[81] = 0;
  _$jscoverage['/ie/change.js'].lineData[82] = 0;
  _$jscoverage['/ie/change.js'].lineData[83] = 0;
  _$jscoverage['/ie/change.js'].lineData[85] = 0;
  _$jscoverage['/ie/change.js'].lineData[89] = 0;
  _$jscoverage['/ie/change.js'].lineData[90] = 0;
  _$jscoverage['/ie/change.js'].lineData[92] = 0;
  _$jscoverage['/ie/change.js'].lineData[99] = 0;
  _$jscoverage['/ie/change.js'].lineData[101] = 0;
  _$jscoverage['/ie/change.js'].lineData[102] = 0;
  _$jscoverage['/ie/change.js'].lineData[104] = 0;
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
}
if (! _$jscoverage['/ie/change.js'].branchData) {
  _$jscoverage['/ie/change.js'].branchData = {};
  _$jscoverage['/ie/change.js'].branchData['16'] = [];
  _$jscoverage['/ie/change.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['16'][2] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['16'][3] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['22'] = [];
  _$jscoverage['/ie/change.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['25'] = [];
  _$jscoverage['/ie/change.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['44'] = [];
  _$jscoverage['/ie/change.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['45'] = [];
  _$jscoverage['/ie/change.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['54'] = [];
  _$jscoverage['/ie/change.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['65'] = [];
  _$jscoverage['/ie/change.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['73'] = [];
  _$jscoverage['/ie/change.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['82'] = [];
  _$jscoverage['/ie/change.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['96'] = [];
  _$jscoverage['/ie/change.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/ie/change.js'].branchData['102'] = [];
  _$jscoverage['/ie/change.js'].branchData['102'][1] = new BranchData();
}
_$jscoverage['/ie/change.js'].branchData['102'][1].init(415, 18, 'p = fel.parentNode');
function visit13_102_1(result) {
  _$jscoverage['/ie/change.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['96'][1].init(171, 141, 'e.isPropagationStopped() || isCheckBoxOrRadio(fel)');
function visit12_96_1(result) {
  _$jscoverage['/ie/change.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['82'][1].init(41, 38, 'isFormElement(t) && !t.__changeHandler');
function visit11_82_1(result) {
  _$jscoverage['/ie/change.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['73'][1].init(149, 14, 'this.__changed');
function visit10_73_1(result) {
  _$jscoverage['/ie/change.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['65'][1].init(71, 41, 'e.originalEvent.propertyName == \'checked\'');
function visit9_65_1(result) {
  _$jscoverage['/ie/change.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['54'][1].init(26, 19, 'fel.__changeHandler');
function visit8_54_1(result) {
  _$jscoverage['/ie/change.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['45'][1].init(22, 21, 'isCheckBoxOrRadio(el)');
function visit7_45_1(result) {
  _$jscoverage['/ie/change.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['44'][1].init(46, 17, 'isFormElement(el)');
function visit6_44_1(result) {
  _$jscoverage['/ie/change.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['25'][1].init(150, 21, 'isCheckBoxOrRadio(el)');
function visit5_25_1(result) {
  _$jscoverage['/ie/change.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['22'][1].init(46, 17, 'isFormElement(el)');
function visit4_22_1(result) {
  _$jscoverage['/ie/change.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['16'][3].init(68, 15, 'type == \'radio\'');
function visit3_16_3(result) {
  _$jscoverage['/ie/change.js'].branchData['16'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['16'][2].init(46, 18, 'type == \'checkbox\'');
function visit2_16_2(result) {
  _$jscoverage['/ie/change.js'].branchData['16'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].branchData['16'][1].init(46, 37, 'type == \'checkbox\' || type == \'radio\'');
function visit1_16_1(result) {
  _$jscoverage['/ie/change.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/change.js'].lineData[6]++;
KISSY.add('event/dom/ie/change', function(S, DomEvent, Dom) {
  _$jscoverage['/ie/change.js'].functionData[0]++;
  _$jscoverage['/ie/change.js'].lineData[7]++;
  var Special = DomEvent.Special, R_FORM_EL = /^(?:textarea|input|select)$/i;
  _$jscoverage['/ie/change.js'].lineData[10]++;
  function isFormElement(n) {
    _$jscoverage['/ie/change.js'].functionData[1]++;
    _$jscoverage['/ie/change.js'].lineData[11]++;
    return R_FORM_EL.test(n.nodeName);
  }
  _$jscoverage['/ie/change.js'].lineData[14]++;
  function isCheckBoxOrRadio(el) {
    _$jscoverage['/ie/change.js'].functionData[2]++;
    _$jscoverage['/ie/change.js'].lineData[15]++;
    var type = el.type;
    _$jscoverage['/ie/change.js'].lineData[16]++;
    return visit1_16_1(visit2_16_2(type == 'checkbox') || visit3_16_3(type == 'radio'));
  }
  _$jscoverage['/ie/change.js'].lineData[19]++;
  Special['change'] = {
  setup: function() {
  _$jscoverage['/ie/change.js'].functionData[3]++;
  _$jscoverage['/ie/change.js'].lineData[21]++;
  var el = this;
  _$jscoverage['/ie/change.js'].lineData[22]++;
  if (visit4_22_1(isFormElement(el))) {
    _$jscoverage['/ie/change.js'].lineData[25]++;
    if (visit5_25_1(isCheckBoxOrRadio(el))) {
      _$jscoverage['/ie/change.js'].lineData[28]++;
      DomEvent.on(el, 'propertychange', propertyChange);
      _$jscoverage['/ie/change.js'].lineData[30]++;
      DomEvent.on(el, 'click', onClick);
    } else {
      _$jscoverage['/ie/change.js'].lineData[33]++;
      return false;
    }
  } else {
    _$jscoverage['/ie/change.js'].lineData[39]++;
    DomEvent.on(el, 'beforeactivate', beforeActivate);
  }
}, 
  tearDown: function() {
  _$jscoverage['/ie/change.js'].functionData[4]++;
  _$jscoverage['/ie/change.js'].lineData[43]++;
  var el = this;
  _$jscoverage['/ie/change.js'].lineData[44]++;
  if (visit6_44_1(isFormElement(el))) {
    _$jscoverage['/ie/change.js'].lineData[45]++;
    if (visit7_45_1(isCheckBoxOrRadio(el))) {
      _$jscoverage['/ie/change.js'].lineData[46]++;
      DomEvent.remove(el, 'propertychange', propertyChange);
      _$jscoverage['/ie/change.js'].lineData[47]++;
      DomEvent.remove(el, 'click', onClick);
    } else {
      _$jscoverage['/ie/change.js'].lineData[49]++;
      return false;
    }
  } else {
    _$jscoverage['/ie/change.js'].lineData[52]++;
    DomEvent.remove(el, 'beforeactivate', beforeActivate);
    _$jscoverage['/ie/change.js'].lineData[53]++;
    S.each(Dom.query('textarea,input,select', el), function(fel) {
  _$jscoverage['/ie/change.js'].functionData[5]++;
  _$jscoverage['/ie/change.js'].lineData[54]++;
  if (visit8_54_1(fel.__changeHandler)) {
    _$jscoverage['/ie/change.js'].lineData[55]++;
    fel.__changeHandler = 0;
    _$jscoverage['/ie/change.js'].lineData[56]++;
    DomEvent.remove(fel, 'change', {
  fn: changeHandler, 
  last: 1});
  }
});
  }
}};
  _$jscoverage['/ie/change.js'].lineData[63]++;
  function propertyChange(e) {
    _$jscoverage['/ie/change.js'].functionData[6]++;
    _$jscoverage['/ie/change.js'].lineData[65]++;
    if (visit9_65_1(e.originalEvent.propertyName == 'checked')) {
      _$jscoverage['/ie/change.js'].lineData[66]++;
      this.__changed = 1;
    }
  }
  _$jscoverage['/ie/change.js'].lineData[70]++;
  function onClick(e) {
    _$jscoverage['/ie/change.js'].functionData[7]++;
    _$jscoverage['/ie/change.js'].lineData[73]++;
    if (visit10_73_1(this.__changed)) {
      _$jscoverage['/ie/change.js'].lineData[74]++;
      this.__changed = 0;
      _$jscoverage['/ie/change.js'].lineData[76]++;
      DomEvent.fire(this, 'change', e);
    }
  }
  _$jscoverage['/ie/change.js'].lineData[80]++;
  function beforeActivate(e) {
    _$jscoverage['/ie/change.js'].functionData[8]++;
    _$jscoverage['/ie/change.js'].lineData[81]++;
    var t = e.target;
    _$jscoverage['/ie/change.js'].lineData[82]++;
    if (visit11_82_1(isFormElement(t) && !t.__changeHandler)) {
      _$jscoverage['/ie/change.js'].lineData[83]++;
      t.__changeHandler = 1;
      _$jscoverage['/ie/change.js'].lineData[85]++;
      DomEvent.on(t, 'change', {
  fn: changeHandler, 
  last: 1});
    }
  }
  _$jscoverage['/ie/change.js'].lineData[89]++;
  function changeHandler(e) {
    _$jscoverage['/ie/change.js'].functionData[9]++;
    _$jscoverage['/ie/change.js'].lineData[90]++;
    var fel = this;
    _$jscoverage['/ie/change.js'].lineData[92]++;
    if (visit12_96_1(e.isPropagationStopped() || isCheckBoxOrRadio(fel))) {
      _$jscoverage['/ie/change.js'].lineData[99]++;
      return;
    }
    _$jscoverage['/ie/change.js'].lineData[101]++;
    var p;
    _$jscoverage['/ie/change.js'].lineData[102]++;
    if (visit13_102_1(p = fel.parentNode)) {
      _$jscoverage['/ie/change.js'].lineData[104]++;
      DomEvent.fire(p, 'change', e);
    }
  }
}, {
  requires: ['event/dom/base', 'dom']});
