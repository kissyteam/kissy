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
if (! _$jscoverage['/ie/submit.js']) {
  _$jscoverage['/ie/submit.js'] = {};
  _$jscoverage['/ie/submit.js'].lineData = [];
  _$jscoverage['/ie/submit.js'].lineData[6] = 0;
  _$jscoverage['/ie/submit.js'].lineData[8] = 0;
  _$jscoverage['/ie/submit.js'].lineData[11] = 0;
  _$jscoverage['/ie/submit.js'].lineData[13] = 0;
  _$jscoverage['/ie/submit.js'].lineData[15] = 0;
  _$jscoverage['/ie/submit.js'].lineData[16] = 0;
  _$jscoverage['/ie/submit.js'].lineData[21] = 0;
  _$jscoverage['/ie/submit.js'].lineData[24] = 0;
  _$jscoverage['/ie/submit.js'].lineData[26] = 0;
  _$jscoverage['/ie/submit.js'].lineData[27] = 0;
  _$jscoverage['/ie/submit.js'].lineData[29] = 0;
  _$jscoverage['/ie/submit.js'].lineData[30] = 0;
  _$jscoverage['/ie/submit.js'].lineData[31] = 0;
  _$jscoverage['/ie/submit.js'].lineData[32] = 0;
  _$jscoverage['/ie/submit.js'].lineData[33] = 0;
  _$jscoverage['/ie/submit.js'].lineData[43] = 0;
  _$jscoverage['/ie/submit.js'].lineData[44] = 0;
  _$jscoverage['/ie/submit.js'].lineData[48] = 0;
  _$jscoverage['/ie/submit.js'].lineData[49] = 0;
  _$jscoverage['/ie/submit.js'].lineData[50] = 0;
  _$jscoverage['/ie/submit.js'].lineData[57] = 0;
  _$jscoverage['/ie/submit.js'].lineData[58] = 0;
  _$jscoverage['/ie/submit.js'].lineData[59] = 0;
  _$jscoverage['/ie/submit.js'].lineData[66] = 0;
}
if (! _$jscoverage['/ie/submit.js'].functionData) {
  _$jscoverage['/ie/submit.js'].functionData = [];
  _$jscoverage['/ie/submit.js'].functionData[0] = 0;
  _$jscoverage['/ie/submit.js'].functionData[1] = 0;
  _$jscoverage['/ie/submit.js'].functionData[2] = 0;
  _$jscoverage['/ie/submit.js'].functionData[3] = 0;
  _$jscoverage['/ie/submit.js'].functionData[4] = 0;
  _$jscoverage['/ie/submit.js'].functionData[5] = 0;
}
if (! _$jscoverage['/ie/submit.js'].branchData) {
  _$jscoverage['/ie/submit.js'].branchData = {};
  _$jscoverage['/ie/submit.js'].branchData['15'] = [];
  _$jscoverage['/ie/submit.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['26'] = [];
  _$jscoverage['/ie/submit.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['31'] = [];
  _$jscoverage['/ie/submit.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['46'] = [];
  _$jscoverage['/ie/submit.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['46'][3] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['48'] = [];
  _$jscoverage['/ie/submit.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['59'] = [];
  _$jscoverage['/ie/submit.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/ie/submit.js'].branchData['61'] = [];
  _$jscoverage['/ie/submit.js'].branchData['61'][1] = new BranchData();
}
_$jscoverage['/ie/submit.js'].branchData['61'][1].init(78, 95, '!e.isPropagationStopped() && !e.synthetic');
function visit22_61_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['59'][1].init(40, 174, 'form.parentNode && !e.isPropagationStopped() && !e.synthetic');
function visit21_59_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['48'][1].init(166, 27, 'form && !form.__submit__fix');
function visit20_48_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['46'][3].init(101, 20, 'nodeName == \'button\'');
function visit19_46_3(result) {
  _$jscoverage['/ie/submit.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['46'][2].init(78, 19, 'nodeName == \'input\'');
function visit18_46_2(result) {
  _$jscoverage['/ie/submit.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['46'][1].init(78, 43, 'nodeName == \'input\' || nodeName == \'button\'');
function visit17_46_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['31'][1].init(22, 18, 'form.__submit__fix');
function visit16_31_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['26'][1].init(78, 25, 'getNodeName(el) == \'form\'');
function visit15_26_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].branchData['15'][1].init(78, 25, 'getNodeName(el) == \'form\'');
function visit14_15_1(result) {
  _$jscoverage['/ie/submit.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/submit.js'].lineData[6]++;
KISSY.add('event/dom/ie/submit', function(S, DomEvent, Dom) {
  _$jscoverage['/ie/submit.js'].functionData[0]++;
  _$jscoverage['/ie/submit.js'].lineData[8]++;
  var Special = DomEvent.Special, getNodeName = Dom.nodeName;
  _$jscoverage['/ie/submit.js'].lineData[11]++;
  Special['submit'] = {
  setup: function() {
  _$jscoverage['/ie/submit.js'].functionData[1]++;
  _$jscoverage['/ie/submit.js'].lineData[13]++;
  var el = this;
  _$jscoverage['/ie/submit.js'].lineData[15]++;
  if (visit14_15_1(getNodeName(el) == 'form')) {
    _$jscoverage['/ie/submit.js'].lineData[16]++;
    return false;
  }
  _$jscoverage['/ie/submit.js'].lineData[21]++;
  DomEvent.on(el, 'click keypress', detector);
}, 
  tearDown: function() {
  _$jscoverage['/ie/submit.js'].functionData[2]++;
  _$jscoverage['/ie/submit.js'].lineData[24]++;
  var el = this;
  _$jscoverage['/ie/submit.js'].lineData[26]++;
  if (visit15_26_1(getNodeName(el) == 'form')) {
    _$jscoverage['/ie/submit.js'].lineData[27]++;
    return false;
  }
  _$jscoverage['/ie/submit.js'].lineData[29]++;
  DomEvent.remove(el, 'click keypress', detector);
  _$jscoverage['/ie/submit.js'].lineData[30]++;
  S.each(Dom.query('form', el), function(form) {
  _$jscoverage['/ie/submit.js'].functionData[3]++;
  _$jscoverage['/ie/submit.js'].lineData[31]++;
  if (visit16_31_1(form.__submit__fix)) {
    _$jscoverage['/ie/submit.js'].lineData[32]++;
    form.__submit__fix = 0;
    _$jscoverage['/ie/submit.js'].lineData[33]++;
    DomEvent.remove(form, 'submit', {
  fn: submitBubble, 
  last: 1});
  }
});
}};
  _$jscoverage['/ie/submit.js'].lineData[43]++;
  function detector(e) {
    _$jscoverage['/ie/submit.js'].functionData[4]++;
    _$jscoverage['/ie/submit.js'].lineData[44]++;
    var t = e.target, nodeName = getNodeName(t), form = (visit17_46_1(visit18_46_2(nodeName == 'input') || visit19_46_3(nodeName == 'button'))) ? t.form : null;
    _$jscoverage['/ie/submit.js'].lineData[48]++;
    if (visit20_48_1(form && !form.__submit__fix)) {
      _$jscoverage['/ie/submit.js'].lineData[49]++;
      form.__submit__fix = 1;
      _$jscoverage['/ie/submit.js'].lineData[50]++;
      DomEvent.on(form, 'submit', {
  fn: submitBubble, 
  last: 1});
    }
  }
  _$jscoverage['/ie/submit.js'].lineData[57]++;
  function submitBubble(e) {
    _$jscoverage['/ie/submit.js'].functionData[5]++;
    _$jscoverage['/ie/submit.js'].lineData[58]++;
    var form = this;
    _$jscoverage['/ie/submit.js'].lineData[59]++;
    if (visit21_59_1(form.parentNode && visit22_61_1(!e.isPropagationStopped() && !e.synthetic))) {
      _$jscoverage['/ie/submit.js'].lineData[66]++;
      DomEvent.fire(form.parentNode, 'submit', e);
    }
  }
}, {
  requires: ['event/dom/base', 'dom']});
