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
if (! _$jscoverage['/input.js']) {
  _$jscoverage['/input.js'] = {};
  _$jscoverage['/input.js'].lineData = [];
  _$jscoverage['/input.js'].lineData[6] = 0;
  _$jscoverage['/input.js'].lineData[7] = 0;
  _$jscoverage['/input.js'].lineData[8] = 0;
  _$jscoverage['/input.js'].lineData[9] = 0;
  _$jscoverage['/input.js'].lineData[10] = 0;
  _$jscoverage['/input.js'].lineData[12] = 0;
  _$jscoverage['/input.js'].lineData[13] = 0;
  _$jscoverage['/input.js'].lineData[14] = 0;
  _$jscoverage['/input.js'].lineData[15] = 0;
  _$jscoverage['/input.js'].lineData[16] = 0;
  _$jscoverage['/input.js'].lineData[17] = 0;
  _$jscoverage['/input.js'].lineData[19] = 0;
  _$jscoverage['/input.js'].lineData[22] = 0;
  _$jscoverage['/input.js'].lineData[28] = 0;
  _$jscoverage['/input.js'].lineData[29] = 0;
  _$jscoverage['/input.js'].lineData[30] = 0;
  _$jscoverage['/input.js'].lineData[31] = 0;
  _$jscoverage['/input.js'].lineData[32] = 0;
  _$jscoverage['/input.js'].lineData[36] = 0;
  _$jscoverage['/input.js'].lineData[37] = 0;
  _$jscoverage['/input.js'].lineData[38] = 0;
  _$jscoverage['/input.js'].lineData[41] = 0;
  _$jscoverage['/input.js'].lineData[42] = 0;
  _$jscoverage['/input.js'].lineData[45] = 0;
  _$jscoverage['/input.js'].lineData[46] = 0;
  _$jscoverage['/input.js'].lineData[48] = 0;
  _$jscoverage['/input.js'].lineData[50] = 0;
  _$jscoverage['/input.js'].lineData[51] = 0;
  _$jscoverage['/input.js'].lineData[55] = 0;
  _$jscoverage['/input.js'].lineData[56] = 0;
  _$jscoverage['/input.js'].lineData[57] = 0;
  _$jscoverage['/input.js'].lineData[59] = 0;
  _$jscoverage['/input.js'].lineData[60] = 0;
  _$jscoverage['/input.js'].lineData[61] = 0;
  _$jscoverage['/input.js'].lineData[65] = 0;
  _$jscoverage['/input.js'].lineData[66] = 0;
  _$jscoverage['/input.js'].lineData[68] = 0;
  _$jscoverage['/input.js'].lineData[69] = 0;
  _$jscoverage['/input.js'].lineData[71] = 0;
  _$jscoverage['/input.js'].lineData[74] = 0;
  _$jscoverage['/input.js'].lineData[75] = 0;
  _$jscoverage['/input.js'].lineData[76] = 0;
  _$jscoverage['/input.js'].lineData[77] = 0;
  _$jscoverage['/input.js'].lineData[80] = 0;
  _$jscoverage['/input.js'].lineData[81] = 0;
  _$jscoverage['/input.js'].lineData[82] = 0;
  _$jscoverage['/input.js'].lineData[83] = 0;
  _$jscoverage['/input.js'].lineData[86] = 0;
  _$jscoverage['/input.js'].lineData[88] = 0;
  _$jscoverage['/input.js'].lineData[89] = 0;
  _$jscoverage['/input.js'].lineData[90] = 0;
  _$jscoverage['/input.js'].lineData[93] = 0;
  _$jscoverage['/input.js'].lineData[97] = 0;
  _$jscoverage['/input.js'].lineData[98] = 0;
  _$jscoverage['/input.js'].lineData[99] = 0;
  _$jscoverage['/input.js'].lineData[101] = 0;
  _$jscoverage['/input.js'].lineData[102] = 0;
  _$jscoverage['/input.js'].lineData[103] = 0;
  _$jscoverage['/input.js'].lineData[104] = 0;
  _$jscoverage['/input.js'].lineData[105] = 0;
  _$jscoverage['/input.js'].lineData[112] = 0;
  _$jscoverage['/input.js'].lineData[113] = 0;
  _$jscoverage['/input.js'].lineData[114] = 0;
  _$jscoverage['/input.js'].lineData[115] = 0;
  _$jscoverage['/input.js'].lineData[117] = 0;
}
if (! _$jscoverage['/input.js'].functionData) {
  _$jscoverage['/input.js'].functionData = [];
  _$jscoverage['/input.js'].functionData[0] = 0;
  _$jscoverage['/input.js'].functionData[1] = 0;
  _$jscoverage['/input.js'].functionData[2] = 0;
  _$jscoverage['/input.js'].functionData[3] = 0;
  _$jscoverage['/input.js'].functionData[4] = 0;
  _$jscoverage['/input.js'].functionData[5] = 0;
  _$jscoverage['/input.js'].functionData[6] = 0;
  _$jscoverage['/input.js'].functionData[7] = 0;
  _$jscoverage['/input.js'].functionData[8] = 0;
  _$jscoverage['/input.js'].functionData[9] = 0;
  _$jscoverage['/input.js'].functionData[10] = 0;
  _$jscoverage['/input.js'].functionData[11] = 0;
  _$jscoverage['/input.js'].functionData[12] = 0;
  _$jscoverage['/input.js'].functionData[13] = 0;
  _$jscoverage['/input.js'].functionData[14] = 0;
}
if (! _$jscoverage['/input.js'].branchData) {
  _$jscoverage['/input.js'].branchData = {};
  _$jscoverage['/input.js'].branchData['13'] = [];
  _$jscoverage['/input.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['14'] = [];
  _$jscoverage['/input.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['16'] = [];
  _$jscoverage['/input.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['17'] = [];
  _$jscoverage['/input.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['17'][2] = new BranchData();
  _$jscoverage['/input.js'].branchData['17'][3] = new BranchData();
  _$jscoverage['/input.js'].branchData['29'] = [];
  _$jscoverage['/input.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['48'] = [];
  _$jscoverage['/input.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['56'] = [];
  _$jscoverage['/input.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['68'] = [];
  _$jscoverage['/input.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['89'] = [];
  _$jscoverage['/input.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['98'] = [];
  _$jscoverage['/input.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['103'] = [];
  _$jscoverage['/input.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/input.js'].branchData['114'] = [];
  _$jscoverage['/input.js'].branchData['114'][1] = new BranchData();
}
_$jscoverage['/input.js'].branchData['114'][1].init(41, 36, 'canFireInput(t) && !t.__inputHandler');
function visit14_114_1(result) {
  _$jscoverage['/input.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['103'][1].init(26, 18, 'fel.__inputHandler');
function visit13_103_1(result) {
  _$jscoverage['/input.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['98'][1].init(46, 16, 'canFireInput(el)');
function visit12_98_1(result) {
  _$jscoverage['/input.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['89'][1].init(46, 16, 'canFireInput(el)');
function visit11_89_1(result) {
  _$jscoverage['/input.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['68'][1].init(108, 19, 'ev.type === \'focus\'');
function visit10_68_1(result) {
  _$jscoverage['/input.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['56'][1].init(14, 29, 'Dom.hasData(target, POLL_KEY)');
function visit9_56_1(result) {
  _$jscoverage['/input.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['48'][1].init(93, 7, 'v !== h');
function visit8_48_1(result) {
  _$jscoverage['/input.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['29'][1].init(14, 29, 'Dom.hasData(target, POLL_KEY)');
function visit7_29_1(result) {
  _$jscoverage['/input.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['17'][3].init(42, 21, 'n.type === \'password\'');
function visit6_17_3(result) {
  _$jscoverage['/input.js'].branchData['17'][3].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['17'][2].init(21, 17, 'n.type === \'text\'');
function visit5_17_2(result) {
  _$jscoverage['/input.js'].branchData['17'][2].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['17'][1].init(21, 42, 'n.type === \'text\' || n.type === \'password\'');
function visit4_17_1(result) {
  _$jscoverage['/input.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['16'][1].init(146, 20, 'nodeName === \'input\'');
function visit3_16_1(result) {
  _$jscoverage['/input.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['14'][1].init(72, 23, 'nodeName === \'textarea\'');
function visit2_14_1(result) {
  _$jscoverage['/input.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].branchData['13'][1].init(26, 16, 'n.nodeName || \'\'');
function visit1_13_1(result) {
  _$jscoverage['/input.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/input.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/input.js'].functionData[0]++;
  _$jscoverage['/input.js'].lineData[7]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/input.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/input.js'].lineData[9]++;
  var noop = S.noop;
  _$jscoverage['/input.js'].lineData[10]++;
  var Special = DomEvent.Special;
  _$jscoverage['/input.js'].lineData[12]++;
  function canFireInput(n) {
    _$jscoverage['/input.js'].functionData[1]++;
    _$jscoverage['/input.js'].lineData[13]++;
    var nodeName = (visit1_13_1(n.nodeName || '')).toLowerCase();
    _$jscoverage['/input.js'].lineData[14]++;
    if (visit2_14_1(nodeName === 'textarea')) {
      _$jscoverage['/input.js'].lineData[15]++;
      return true;
    } else {
      _$jscoverage['/input.js'].lineData[16]++;
      if (visit3_16_1(nodeName === 'input')) {
        _$jscoverage['/input.js'].lineData[17]++;
        return visit4_17_1(visit5_17_2(n.type === 'text') || visit6_17_3(n.type === 'password'));
      }
    }
    _$jscoverage['/input.js'].lineData[19]++;
    return false;
  }
  _$jscoverage['/input.js'].lineData[22]++;
  var INPUT_CHANGE = 'input', KEY = 'event/input', HISTORY_KEY = KEY + '/history', POLL_KEY = KEY + '/poll', interval = 50;
  _$jscoverage['/input.js'].lineData[28]++;
  function clearPollTimer(target) {
    _$jscoverage['/input.js'].functionData[2]++;
    _$jscoverage['/input.js'].lineData[29]++;
    if (visit7_29_1(Dom.hasData(target, POLL_KEY))) {
      _$jscoverage['/input.js'].lineData[30]++;
      var poll = Dom.data(target, POLL_KEY);
      _$jscoverage['/input.js'].lineData[31]++;
      clearTimeout(poll);
      _$jscoverage['/input.js'].lineData[32]++;
      Dom.removeData(target, POLL_KEY);
    }
  }
  _$jscoverage['/input.js'].lineData[36]++;
  function stopPoll(target) {
    _$jscoverage['/input.js'].functionData[3]++;
    _$jscoverage['/input.js'].lineData[37]++;
    Dom.removeData(target, HISTORY_KEY);
    _$jscoverage['/input.js'].lineData[38]++;
    clearPollTimer(target);
  }
  _$jscoverage['/input.js'].lineData[41]++;
  function stopPollHandler(ev) {
    _$jscoverage['/input.js'].functionData[4]++;
    _$jscoverage['/input.js'].lineData[42]++;
    clearPollTimer(ev.target);
  }
  _$jscoverage['/input.js'].lineData[45]++;
  function checkChange(target) {
    _$jscoverage['/input.js'].functionData[5]++;
    _$jscoverage['/input.js'].lineData[46]++;
    var v = target.value, h = Dom.data(target, HISTORY_KEY);
    _$jscoverage['/input.js'].lineData[48]++;
    if (visit8_48_1(v !== h)) {
      _$jscoverage['/input.js'].lineData[50]++;
      DomEvent.fire(target, INPUT_CHANGE);
      _$jscoverage['/input.js'].lineData[51]++;
      Dom.data(target, HISTORY_KEY, v);
    }
  }
  _$jscoverage['/input.js'].lineData[55]++;
  function startPoll(target) {
    _$jscoverage['/input.js'].functionData[6]++;
    _$jscoverage['/input.js'].lineData[56]++;
    if (visit9_56_1(Dom.hasData(target, POLL_KEY))) {
      _$jscoverage['/input.js'].lineData[57]++;
      return;
    }
    _$jscoverage['/input.js'].lineData[59]++;
    Dom.data(target, POLL_KEY, setTimeout(function check() {
  _$jscoverage['/input.js'].functionData[7]++;
  _$jscoverage['/input.js'].lineData[60]++;
  checkChange(target);
  _$jscoverage['/input.js'].lineData[61]++;
  Dom.data(target, POLL_KEY, setTimeout(check, interval));
}, interval));
  }
  _$jscoverage['/input.js'].lineData[65]++;
  function startPollHandler(ev) {
    _$jscoverage['/input.js'].functionData[8]++;
    _$jscoverage['/input.js'].lineData[66]++;
    var target = ev.target;
    _$jscoverage['/input.js'].lineData[68]++;
    if (visit10_68_1(ev.type === 'focus')) {
      _$jscoverage['/input.js'].lineData[69]++;
      Dom.data(target, HISTORY_KEY, target.value);
    }
    _$jscoverage['/input.js'].lineData[71]++;
    startPoll(target);
  }
  _$jscoverage['/input.js'].lineData[74]++;
  function monitor(target) {
    _$jscoverage['/input.js'].functionData[9]++;
    _$jscoverage['/input.js'].lineData[75]++;
    unmonitored(target);
    _$jscoverage['/input.js'].lineData[76]++;
    DomEvent.on(target, 'blur', stopPollHandler);
    _$jscoverage['/input.js'].lineData[77]++;
    DomEvent.on(target, 'mousedown keyup keydown focus', startPollHandler);
  }
  _$jscoverage['/input.js'].lineData[80]++;
  function unmonitored(target) {
    _$jscoverage['/input.js'].functionData[10]++;
    _$jscoverage['/input.js'].lineData[81]++;
    stopPoll(target);
    _$jscoverage['/input.js'].lineData[82]++;
    DomEvent.detach(target, 'blur', stopPollHandler);
    _$jscoverage['/input.js'].lineData[83]++;
    DomEvent.detach(target, 'mousedown keyup keydown focus', startPollHandler);
  }
  _$jscoverage['/input.js'].lineData[86]++;
  Special.input = {
  setup: function() {
  _$jscoverage['/input.js'].functionData[11]++;
  _$jscoverage['/input.js'].lineData[88]++;
  var el = this;
  _$jscoverage['/input.js'].lineData[89]++;
  if (visit11_89_1(canFireInput(el))) {
    _$jscoverage['/input.js'].lineData[90]++;
    monitor(el);
  } else {
    _$jscoverage['/input.js'].lineData[93]++;
    DomEvent.on(el, 'focusin', beforeActivate);
  }
}, 
  tearDown: function() {
  _$jscoverage['/input.js'].functionData[12]++;
  _$jscoverage['/input.js'].lineData[97]++;
  var el = this;
  _$jscoverage['/input.js'].lineData[98]++;
  if (visit12_98_1(canFireInput(el))) {
    _$jscoverage['/input.js'].lineData[99]++;
    unmonitored(el);
  } else {
    _$jscoverage['/input.js'].lineData[101]++;
    DomEvent.remove(el, 'focusin', beforeActivate);
    _$jscoverage['/input.js'].lineData[102]++;
    Dom.query('textarea,input', el).each(function(fel) {
  _$jscoverage['/input.js'].functionData[13]++;
  _$jscoverage['/input.js'].lineData[103]++;
  if (visit13_103_1(fel.__inputHandler)) {
    _$jscoverage['/input.js'].lineData[104]++;
    fel.__inputHandler = 0;
    _$jscoverage['/input.js'].lineData[105]++;
    DomEvent.remove(fel, 'input', noop);
  }
});
  }
}};
  _$jscoverage['/input.js'].lineData[112]++;
  function beforeActivate(e) {
    _$jscoverage['/input.js'].functionData[14]++;
    _$jscoverage['/input.js'].lineData[113]++;
    var t = e.target;
    _$jscoverage['/input.js'].lineData[114]++;
    if (visit14_114_1(canFireInput(t) && !t.__inputHandler)) {
      _$jscoverage['/input.js'].lineData[115]++;
      t.__inputHandler = 1;
      _$jscoverage['/input.js'].lineData[117]++;
      DomEvent.on(t, 'input', noop);
    }
  }
});
