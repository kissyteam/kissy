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
if (! _$jscoverage['/index.js']) {
  _$jscoverage['/index.js'] = {};
  _$jscoverage['/index.js'].lineData = [];
  _$jscoverage['/index.js'].lineData[7] = 0;
  _$jscoverage['/index.js'].lineData[8] = 0;
  _$jscoverage['/index.js'].lineData[9] = 0;
  _$jscoverage['/index.js'].lineData[10] = 0;
  _$jscoverage['/index.js'].lineData[12] = 0;
  _$jscoverage['/index.js'].lineData[19] = 0;
  _$jscoverage['/index.js'].lineData[20] = 0;
  _$jscoverage['/index.js'].lineData[21] = 0;
  _$jscoverage['/index.js'].lineData[22] = 0;
  _$jscoverage['/index.js'].lineData[23] = 0;
  _$jscoverage['/index.js'].lineData[27] = 0;
  _$jscoverage['/index.js'].lineData[28] = 0;
  _$jscoverage['/index.js'].lineData[29] = 0;
  _$jscoverage['/index.js'].lineData[32] = 0;
  _$jscoverage['/index.js'].lineData[33] = 0;
  _$jscoverage['/index.js'].lineData[36] = 0;
  _$jscoverage['/index.js'].lineData[37] = 0;
  _$jscoverage['/index.js'].lineData[39] = 0;
  _$jscoverage['/index.js'].lineData[41] = 0;
  _$jscoverage['/index.js'].lineData[42] = 0;
  _$jscoverage['/index.js'].lineData[46] = 0;
  _$jscoverage['/index.js'].lineData[47] = 0;
  _$jscoverage['/index.js'].lineData[48] = 0;
  _$jscoverage['/index.js'].lineData[50] = 0;
  _$jscoverage['/index.js'].lineData[51] = 0;
  _$jscoverage['/index.js'].lineData[52] = 0;
  _$jscoverage['/index.js'].lineData[56] = 0;
  _$jscoverage['/index.js'].lineData[57] = 0;
  _$jscoverage['/index.js'].lineData[59] = 0;
  _$jscoverage['/index.js'].lineData[60] = 0;
  _$jscoverage['/index.js'].lineData[62] = 0;
  _$jscoverage['/index.js'].lineData[65] = 0;
  _$jscoverage['/index.js'].lineData[66] = 0;
  _$jscoverage['/index.js'].lineData[67] = 0;
  _$jscoverage['/index.js'].lineData[68] = 0;
  _$jscoverage['/index.js'].lineData[71] = 0;
  _$jscoverage['/index.js'].lineData[72] = 0;
  _$jscoverage['/index.js'].lineData[73] = 0;
  _$jscoverage['/index.js'].lineData[74] = 0;
  _$jscoverage['/index.js'].lineData[77] = 0;
  _$jscoverage['/index.js'].lineData[79] = 0;
  _$jscoverage['/index.js'].lineData[81] = 0;
  _$jscoverage['/index.js'].lineData[82] = 0;
  _$jscoverage['/index.js'].lineData[85] = 0;
  _$jscoverage['/index.js'].lineData[89] = 0;
  _$jscoverage['/index.js'].lineData[91] = 0;
  _$jscoverage['/index.js'].lineData[92] = 0;
  _$jscoverage['/index.js'].lineData[94] = 0;
  _$jscoverage['/index.js'].lineData[99] = 0;
}
if (! _$jscoverage['/index.js'].functionData) {
  _$jscoverage['/index.js'].functionData = [];
  _$jscoverage['/index.js'].functionData[0] = 0;
  _$jscoverage['/index.js'].functionData[1] = 0;
  _$jscoverage['/index.js'].functionData[2] = 0;
  _$jscoverage['/index.js'].functionData[3] = 0;
  _$jscoverage['/index.js'].functionData[4] = 0;
  _$jscoverage['/index.js'].functionData[5] = 0;
  _$jscoverage['/index.js'].functionData[6] = 0;
  _$jscoverage['/index.js'].functionData[7] = 0;
  _$jscoverage['/index.js'].functionData[8] = 0;
  _$jscoverage['/index.js'].functionData[9] = 0;
  _$jscoverage['/index.js'].functionData[10] = 0;
  _$jscoverage['/index.js'].functionData[11] = 0;
}
if (! _$jscoverage['/index.js'].branchData) {
  _$jscoverage['/index.js'].branchData = {};
  _$jscoverage['/index.js'].branchData['20'] = [];
  _$jscoverage['/index.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/index.js'].branchData['39'] = [];
  _$jscoverage['/index.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/index.js'].branchData['47'] = [];
  _$jscoverage['/index.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/index.js'].branchData['59'] = [];
  _$jscoverage['/index.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/index.js'].branchData['81'] = [];
  _$jscoverage['/index.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/index.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/index.js'].branchData['81'][3] = new BranchData();
  _$jscoverage['/index.js'].branchData['91'] = [];
  _$jscoverage['/index.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/index.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/index.js'].branchData['91'][3] = new BranchData();
}
_$jscoverage['/index.js'].branchData['91'][3].init(123, 23, 'nodeName === \'textarea\'');
function visit10_91_3(result) {
  _$jscoverage['/index.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['91'][2].init(99, 20, 'nodeName === \'input\'');
function visit9_91_2(result) {
  _$jscoverage['/index.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['91'][1].init(99, 47, 'nodeName === \'input\' || nodeName === \'textarea\'');
function visit8_91_1(result) {
  _$jscoverage['/index.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['81'][3].init(123, 23, 'nodeName === \'textarea\'');
function visit7_81_3(result) {
  _$jscoverage['/index.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['81'][2].init(99, 20, 'nodeName === \'input\'');
function visit6_81_2(result) {
  _$jscoverage['/index.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['81'][1].init(99, 47, 'nodeName === \'input\' || nodeName === \'textarea\'');
function visit5_81_1(result) {
  _$jscoverage['/index.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['59'][1].init(108, 19, 'ev.type === \'focus\'');
function visit4_59_1(result) {
  _$jscoverage['/index.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['47'][1].init(14, 29, 'Dom.hasData(target, POLL_KEY)');
function visit3_47_1(result) {
  _$jscoverage['/index.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['39'][1].init(93, 7, 'v !== h');
function visit2_39_1(result) {
  _$jscoverage['/index.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].branchData['20'][1].init(14, 29, 'Dom.hasData(target, POLL_KEY)');
function visit1_20_1(result) {
  _$jscoverage['/index.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/index.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/index.js'].functionData[0]++;
  _$jscoverage['/index.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/index.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/index.js'].lineData[10]++;
  var Special = DomEvent.Special;
  _$jscoverage['/index.js'].lineData[12]++;
  var INPUT_EVENT = 'input', getNodeName = Dom.nodeName, KEY = 'event/input', HISTORY_KEY = KEY + '/history', POLL_KEY = KEY + '/poll', interval = 50;
  _$jscoverage['/index.js'].lineData[19]++;
  function clearPollTimer(target) {
    _$jscoverage['/index.js'].functionData[1]++;
    _$jscoverage['/index.js'].lineData[20]++;
    if (visit1_20_1(Dom.hasData(target, POLL_KEY))) {
      _$jscoverage['/index.js'].lineData[21]++;
      var poll = Dom.data(target, POLL_KEY);
      _$jscoverage['/index.js'].lineData[22]++;
      clearTimeout(poll);
      _$jscoverage['/index.js'].lineData[23]++;
      Dom.removeData(target, POLL_KEY);
    }
  }
  _$jscoverage['/index.js'].lineData[27]++;
  function stopPoll(target) {
    _$jscoverage['/index.js'].functionData[2]++;
    _$jscoverage['/index.js'].lineData[28]++;
    Dom.removeData(target, HISTORY_KEY);
    _$jscoverage['/index.js'].lineData[29]++;
    clearPollTimer(target);
  }
  _$jscoverage['/index.js'].lineData[32]++;
  function stopPollHandler(ev) {
    _$jscoverage['/index.js'].functionData[3]++;
    _$jscoverage['/index.js'].lineData[33]++;
    clearPollTimer(ev.target);
  }
  _$jscoverage['/index.js'].lineData[36]++;
  function checkChange(target) {
    _$jscoverage['/index.js'].functionData[4]++;
    _$jscoverage['/index.js'].lineData[37]++;
    var v = target.value, h = Dom.data(target, HISTORY_KEY);
    _$jscoverage['/index.js'].lineData[39]++;
    if (visit2_39_1(v !== h)) {
      _$jscoverage['/index.js'].lineData[41]++;
      DomEvent.fire(target, INPUT_EVENT);
      _$jscoverage['/index.js'].lineData[42]++;
      Dom.data(target, HISTORY_KEY, v);
    }
  }
  _$jscoverage['/index.js'].lineData[46]++;
  function startPoll(target) {
    _$jscoverage['/index.js'].functionData[5]++;
    _$jscoverage['/index.js'].lineData[47]++;
    if (visit3_47_1(Dom.hasData(target, POLL_KEY))) {
      _$jscoverage['/index.js'].lineData[48]++;
      return;
    }
    _$jscoverage['/index.js'].lineData[50]++;
    Dom.data(target, POLL_KEY, setTimeout(function check() {
  _$jscoverage['/index.js'].functionData[6]++;
  _$jscoverage['/index.js'].lineData[51]++;
  checkChange(target);
  _$jscoverage['/index.js'].lineData[52]++;
  Dom.data(target, POLL_KEY, setTimeout(check, interval));
}, interval));
  }
  _$jscoverage['/index.js'].lineData[56]++;
  function startPollHandler(ev) {
    _$jscoverage['/index.js'].functionData[7]++;
    _$jscoverage['/index.js'].lineData[57]++;
    var target = ev.target;
    _$jscoverage['/index.js'].lineData[59]++;
    if (visit4_59_1(ev.type === 'focus')) {
      _$jscoverage['/index.js'].lineData[60]++;
      Dom.data(target, HISTORY_KEY, target.value);
    }
    _$jscoverage['/index.js'].lineData[62]++;
    startPoll(target);
  }
  _$jscoverage['/index.js'].lineData[65]++;
  function monitor(target) {
    _$jscoverage['/index.js'].functionData[8]++;
    _$jscoverage['/index.js'].lineData[66]++;
    unmonitored(target);
    _$jscoverage['/index.js'].lineData[67]++;
    DomEvent.on(target, 'blur', stopPollHandler);
    _$jscoverage['/index.js'].lineData[68]++;
    DomEvent.on(target, 'mousedown keyup keydown focus', startPollHandler);
  }
  _$jscoverage['/index.js'].lineData[71]++;
  function unmonitored(target) {
    _$jscoverage['/index.js'].functionData[9]++;
    _$jscoverage['/index.js'].lineData[72]++;
    stopPoll(target);
    _$jscoverage['/index.js'].lineData[73]++;
    DomEvent.detach(target, 'blur', stopPollHandler);
    _$jscoverage['/index.js'].lineData[74]++;
    DomEvent.detach(target, 'mousedown keyup keydown focus', startPollHandler);
  }
  _$jscoverage['/index.js'].lineData[77]++;
  Special[INPUT_EVENT] = {
  setup: function() {
  _$jscoverage['/index.js'].functionData[10]++;
  _$jscoverage['/index.js'].lineData[79]++;
  var target = this, nodeName = getNodeName(target);
  _$jscoverage['/index.js'].lineData[81]++;
  if (visit5_81_1(visit6_81_2(nodeName === 'input') || visit7_81_3(nodeName === 'textarea'))) {
    _$jscoverage['/index.js'].lineData[82]++;
    return monitor(target);
  } else {
    _$jscoverage['/index.js'].lineData[85]++;
    return false;
  }
}, 
  tearDown: function() {
  _$jscoverage['/index.js'].functionData[11]++;
  _$jscoverage['/index.js'].lineData[89]++;
  var target = this, nodeName = getNodeName(target);
  _$jscoverage['/index.js'].lineData[91]++;
  if (visit8_91_1(visit9_91_2(nodeName === 'input') || visit10_91_3(nodeName === 'textarea'))) {
    _$jscoverage['/index.js'].lineData[92]++;
    return monitor(target);
  } else {
    _$jscoverage['/index.js'].lineData[94]++;
    return false;
  }
}};
  _$jscoverage['/index.js'].lineData[99]++;
  return DomEvent;
});
