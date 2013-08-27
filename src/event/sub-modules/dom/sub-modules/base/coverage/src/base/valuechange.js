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
if (! _$jscoverage['/base/valuechange.js']) {
  _$jscoverage['/base/valuechange.js'] = {};
  _$jscoverage['/base/valuechange.js'].lineData = [];
  _$jscoverage['/base/valuechange.js'].lineData[15] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[16] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[23] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[24] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[25] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[26] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[27] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[31] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[32] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[33] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[36] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[37] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[40] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[41] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[43] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[45] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[49] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[53] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[54] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[55] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[57] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[58] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[59] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[63] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[64] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[66] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[67] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[69] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[72] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[73] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[76] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[77] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[78] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[81] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[82] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[85] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[86] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[87] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[88] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[89] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[92] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[94] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[95] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[96] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[100] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[101] = 0;
  _$jscoverage['/base/valuechange.js'].lineData[104] = 0;
}
if (! _$jscoverage['/base/valuechange.js'].functionData) {
  _$jscoverage['/base/valuechange.js'].functionData = [];
  _$jscoverage['/base/valuechange.js'].functionData[0] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[1] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[2] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[3] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[4] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[5] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[6] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[7] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[8] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[9] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[10] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[11] = 0;
  _$jscoverage['/base/valuechange.js'].functionData[12] = 0;
}
if (! _$jscoverage['/base/valuechange.js'].branchData) {
  _$jscoverage['/base/valuechange.js'].branchData = {};
  _$jscoverage['/base/valuechange.js'].branchData['24'] = [];
  _$jscoverage['/base/valuechange.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/valuechange.js'].branchData['43'] = [];
  _$jscoverage['/base/valuechange.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/valuechange.js'].branchData['54'] = [];
  _$jscoverage['/base/valuechange.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/valuechange.js'].branchData['66'] = [];
  _$jscoverage['/base/valuechange.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/valuechange.js'].branchData['95'] = [];
  _$jscoverage['/base/valuechange.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/valuechange.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/base/valuechange.js'].branchData['95'][3] = new BranchData();
}
_$jscoverage['/base/valuechange.js'].branchData['95'][3].init(105, 22, 'nodeName == \'textarea\'');
function visit206_95_3(result) {
  _$jscoverage['/base/valuechange.js'].branchData['95'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].branchData['95'][2].init(82, 19, 'nodeName == \'input\'');
function visit205_95_2(result) {
  _$jscoverage['/base/valuechange.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].branchData['95'][1].init(82, 45, 'nodeName == \'input\' || nodeName == \'textarea\'');
function visit204_95_1(result) {
  _$jscoverage['/base/valuechange.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].branchData['66'][1].init(108, 18, 'ev.type == \'focus\'');
function visit203_66_1(result) {
  _$jscoverage['/base/valuechange.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].branchData['54'][1].init(14, 29, 'Dom.hasData(target, POLL_KEY)');
function visit202_54_1(result) {
  _$jscoverage['/base/valuechange.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].branchData['43'][1].init(93, 7, 'v !== h');
function visit201_43_1(result) {
  _$jscoverage['/base/valuechange.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].branchData['24'][1].init(14, 29, 'Dom.hasData(target, POLL_KEY)');
function visit200_24_1(result) {
  _$jscoverage['/base/valuechange.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/valuechange.js'].lineData[15]++;
KISSY.add('event/dom/base/valuechange', function(S, DomEvent, Dom, Special) {
  _$jscoverage['/base/valuechange.js'].functionData[0]++;
  _$jscoverage['/base/valuechange.js'].lineData[16]++;
  var VALUE_CHANGE = 'valuechange', getNodeName = Dom.nodeName, KEY = 'event/valuechange', HISTORY_KEY = KEY + '/history', POLL_KEY = KEY + '/poll', interval = 50;
  _$jscoverage['/base/valuechange.js'].lineData[23]++;
  function clearPollTimer(target) {
    _$jscoverage['/base/valuechange.js'].functionData[1]++;
    _$jscoverage['/base/valuechange.js'].lineData[24]++;
    if (visit200_24_1(Dom.hasData(target, POLL_KEY))) {
      _$jscoverage['/base/valuechange.js'].lineData[25]++;
      var poll = Dom.data(target, POLL_KEY);
      _$jscoverage['/base/valuechange.js'].lineData[26]++;
      clearTimeout(poll);
      _$jscoverage['/base/valuechange.js'].lineData[27]++;
      Dom.removeData(target, POLL_KEY);
    }
  }
  _$jscoverage['/base/valuechange.js'].lineData[31]++;
  function stopPoll(target) {
    _$jscoverage['/base/valuechange.js'].functionData[2]++;
    _$jscoverage['/base/valuechange.js'].lineData[32]++;
    Dom.removeData(target, HISTORY_KEY);
    _$jscoverage['/base/valuechange.js'].lineData[33]++;
    clearPollTimer(target);
  }
  _$jscoverage['/base/valuechange.js'].lineData[36]++;
  function stopPollHandler(ev) {
    _$jscoverage['/base/valuechange.js'].functionData[3]++;
    _$jscoverage['/base/valuechange.js'].lineData[37]++;
    clearPollTimer(ev.target);
  }
  _$jscoverage['/base/valuechange.js'].lineData[40]++;
  function checkChange(target) {
    _$jscoverage['/base/valuechange.js'].functionData[4]++;
    _$jscoverage['/base/valuechange.js'].lineData[41]++;
    var v = target.value, h = Dom.data(target, HISTORY_KEY);
    _$jscoverage['/base/valuechange.js'].lineData[43]++;
    if (visit201_43_1(v !== h)) {
      _$jscoverage['/base/valuechange.js'].lineData[45]++;
      DomEvent.fireHandler(target, VALUE_CHANGE, {
  prevVal: h, 
  newVal: v});
      _$jscoverage['/base/valuechange.js'].lineData[49]++;
      Dom.data(target, HISTORY_KEY, v);
    }
  }
  _$jscoverage['/base/valuechange.js'].lineData[53]++;
  function startPoll(target) {
    _$jscoverage['/base/valuechange.js'].functionData[5]++;
    _$jscoverage['/base/valuechange.js'].lineData[54]++;
    if (visit202_54_1(Dom.hasData(target, POLL_KEY))) {
      _$jscoverage['/base/valuechange.js'].lineData[55]++;
      return;
    }
    _$jscoverage['/base/valuechange.js'].lineData[57]++;
    Dom.data(target, POLL_KEY, setTimeout(function() {
  _$jscoverage['/base/valuechange.js'].functionData[6]++;
  _$jscoverage['/base/valuechange.js'].lineData[58]++;
  checkChange(target);
  _$jscoverage['/base/valuechange.js'].lineData[59]++;
  Dom.data(target, POLL_KEY, setTimeout(arguments.callee, interval));
}, interval));
  }
  _$jscoverage['/base/valuechange.js'].lineData[63]++;
  function startPollHandler(ev) {
    _$jscoverage['/base/valuechange.js'].functionData[7]++;
    _$jscoverage['/base/valuechange.js'].lineData[64]++;
    var target = ev.target;
    _$jscoverage['/base/valuechange.js'].lineData[66]++;
    if (visit203_66_1(ev.type == 'focus')) {
      _$jscoverage['/base/valuechange.js'].lineData[67]++;
      Dom.data(target, HISTORY_KEY, target.value);
    }
    _$jscoverage['/base/valuechange.js'].lineData[69]++;
    startPoll(target);
  }
  _$jscoverage['/base/valuechange.js'].lineData[72]++;
  function webkitSpeechChangeHandler(e) {
    _$jscoverage['/base/valuechange.js'].functionData[8]++;
    _$jscoverage['/base/valuechange.js'].lineData[73]++;
    checkChange(e.target);
  }
  _$jscoverage['/base/valuechange.js'].lineData[76]++;
  function monitor(target) {
    _$jscoverage['/base/valuechange.js'].functionData[9]++;
    _$jscoverage['/base/valuechange.js'].lineData[77]++;
    unmonitored(target);
    _$jscoverage['/base/valuechange.js'].lineData[78]++;
    DomEvent.on(target, 'blur', stopPollHandler);
    _$jscoverage['/base/valuechange.js'].lineData[81]++;
    DomEvent.on(target, 'webkitspeechchange', webkitSpeechChangeHandler);
    _$jscoverage['/base/valuechange.js'].lineData[82]++;
    DomEvent.on(target, 'mousedown keyup keydown focus', startPollHandler);
  }
  _$jscoverage['/base/valuechange.js'].lineData[85]++;
  function unmonitored(target) {
    _$jscoverage['/base/valuechange.js'].functionData[10]++;
    _$jscoverage['/base/valuechange.js'].lineData[86]++;
    stopPoll(target);
    _$jscoverage['/base/valuechange.js'].lineData[87]++;
    DomEvent.detach(target, 'blur', stopPollHandler);
    _$jscoverage['/base/valuechange.js'].lineData[88]++;
    DomEvent.detach(target, 'webkitspeechchange', webkitSpeechChangeHandler);
    _$jscoverage['/base/valuechange.js'].lineData[89]++;
    DomEvent.detach(target, 'mousedown keyup keydown focus', startPollHandler);
  }
  _$jscoverage['/base/valuechange.js'].lineData[92]++;
  Special[VALUE_CHANGE] = {
  setup: function() {
  _$jscoverage['/base/valuechange.js'].functionData[11]++;
  _$jscoverage['/base/valuechange.js'].lineData[94]++;
  var target = this, nodeName = getNodeName(target);
  _$jscoverage['/base/valuechange.js'].lineData[95]++;
  if (visit204_95_1(visit205_95_2(nodeName == 'input') || visit206_95_3(nodeName == 'textarea'))) {
    _$jscoverage['/base/valuechange.js'].lineData[96]++;
    monitor(target);
  }
}, 
  tearDown: function() {
  _$jscoverage['/base/valuechange.js'].functionData[12]++;
  _$jscoverage['/base/valuechange.js'].lineData[100]++;
  var target = this;
  _$jscoverage['/base/valuechange.js'].lineData[101]++;
  unmonitored(target);
}};
  _$jscoverage['/base/valuechange.js'].lineData[104]++;
  return DomEvent;
}, {
  requires: ['./dom-event', 'dom', './special']});
