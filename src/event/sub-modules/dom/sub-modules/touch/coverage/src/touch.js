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
if (! _$jscoverage['/touch.js']) {
  _$jscoverage['/touch.js'] = {};
  _$jscoverage['/touch.js'].lineData = [];
  _$jscoverage['/touch.js'].lineData[6] = 0;
  _$jscoverage['/touch.js'].lineData[7] = 0;
  _$jscoverage['/touch.js'].lineData[8] = 0;
  _$jscoverage['/touch.js'].lineData[9] = 0;
  _$jscoverage['/touch.js'].lineData[10] = 0;
  _$jscoverage['/touch.js'].lineData[11] = 0;
  _$jscoverage['/touch.js'].lineData[12] = 0;
  _$jscoverage['/touch.js'].lineData[13] = 0;
  _$jscoverage['/touch.js'].lineData[15] = 0;
  _$jscoverage['/touch.js'].lineData[19] = 0;
  _$jscoverage['/touch.js'].lineData[23] = 0;
  _$jscoverage['/touch.js'].lineData[27] = 0;
  _$jscoverage['/touch.js'].lineData[31] = 0;
  _$jscoverage['/touch.js'].lineData[35] = 0;
  _$jscoverage['/touch.js'].lineData[40] = 0;
  _$jscoverage['/touch.js'].lineData[41] = 0;
  _$jscoverage['/touch.js'].lineData[42] = 0;
  _$jscoverage['/touch.js'].lineData[45] = 0;
  _$jscoverage['/touch.js'].lineData[46] = 0;
  _$jscoverage['/touch.js'].lineData[48] = 0;
  _$jscoverage['/touch.js'].lineData[49] = 0;
  _$jscoverage['/touch.js'].lineData[50] = 0;
  _$jscoverage['/touch.js'].lineData[51] = 0;
  _$jscoverage['/touch.js'].lineData[52] = 0;
  _$jscoverage['/touch.js'].lineData[54] = 0;
  _$jscoverage['/touch.js'].lineData[55] = 0;
  _$jscoverage['/touch.js'].lineData[57] = 0;
  _$jscoverage['/touch.js'].lineData[60] = 0;
  _$jscoverage['/touch.js'].lineData[63] = 0;
  _$jscoverage['/touch.js'].lineData[64] = 0;
  _$jscoverage['/touch.js'].lineData[65] = 0;
  _$jscoverage['/touch.js'].lineData[68] = 0;
  _$jscoverage['/touch.js'].lineData[69] = 0;
  _$jscoverage['/touch.js'].lineData[71] = 0;
  _$jscoverage['/touch.js'].lineData[72] = 0;
  _$jscoverage['/touch.js'].lineData[73] = 0;
  _$jscoverage['/touch.js'].lineData[75] = 0;
  _$jscoverage['/touch.js'].lineData[76] = 0;
  _$jscoverage['/touch.js'].lineData[77] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[79] = 0;
  _$jscoverage['/touch.js'].lineData[82] = 0;
  _$jscoverage['/touch.js'].lineData[85] = 0;
  _$jscoverage['/touch.js'].lineData[88] = 0;
  _$jscoverage['/touch.js'].lineData[89] = 0;
  _$jscoverage['/touch.js'].lineData[90] = 0;
  _$jscoverage['/touch.js'].lineData[91] = 0;
  _$jscoverage['/touch.js'].lineData[92] = 0;
  _$jscoverage['/touch.js'].lineData[94] = 0;
  _$jscoverage['/touch.js'].lineData[96] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[99] = 0;
  _$jscoverage['/touch.js'].lineData[101] = 0;
  _$jscoverage['/touch.js'].lineData[102] = 0;
  _$jscoverage['/touch.js'].lineData[104] = 0;
  _$jscoverage['/touch.js'].lineData[105] = 0;
  _$jscoverage['/touch.js'].lineData[107] = 0;
}
if (! _$jscoverage['/touch.js'].functionData) {
  _$jscoverage['/touch.js'].functionData = [];
  _$jscoverage['/touch.js'].functionData[0] = 0;
  _$jscoverage['/touch.js'].functionData[1] = 0;
  _$jscoverage['/touch.js'].functionData[2] = 0;
  _$jscoverage['/touch.js'].functionData[3] = 0;
  _$jscoverage['/touch.js'].functionData[4] = 0;
  _$jscoverage['/touch.js'].functionData[5] = 0;
  _$jscoverage['/touch.js'].functionData[6] = 0;
  _$jscoverage['/touch.js'].functionData[7] = 0;
}
if (! _$jscoverage['/touch.js'].branchData) {
  _$jscoverage['/touch.js'].branchData = {};
  _$jscoverage['/touch.js'].branchData['48'] = [];
  _$jscoverage['/touch.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['49'] = [];
  _$jscoverage['/touch.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['54'] = [];
  _$jscoverage['/touch.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['71'] = [];
  _$jscoverage['/touch.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['72'] = [];
  _$jscoverage['/touch.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['76'] = [];
  _$jscoverage['/touch.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['91'] = [];
  _$jscoverage['/touch.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['96'] = [];
  _$jscoverage['/touch.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['101'] = [];
  _$jscoverage['/touch.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['104'] = [];
  _$jscoverage['/touch.js'].branchData['104'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['104'][1].init(516, 23, 'eventHandleValue.remove');
function visit88_104_1(result) {
  _$jscoverage['/touch.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['101'][1].init(414, 20, 'eventHandleValue.add');
function visit87_101_1(result) {
  _$jscoverage['/touch.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['96'][1].init(244, 25, 'eventHandleValue.tearDown');
function visit86_96_1(result) {
  _$jscoverage['/touch.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['91'][1].init(89, 22, 'eventHandleValue.setup');
function visit85_91_1(result) {
  _$jscoverage['/touch.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['76'][1].init(182, 29, '!self.__ks_touch_action_count');
function visit84_76_1(result) {
  _$jscoverage['/touch.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['72'][1].init(18, 29, '!self.__ks_touch_action_count');
function visit83_72_1(result) {
  _$jscoverage['/touch.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['71'][1].init(73, 29, 'isMsPointerSupported && style');
function visit82_71_1(result) {
  _$jscoverage['/touch.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['54'][1].init(269, 29, '!self.__ks_touch_action_count');
function visit81_54_1(result) {
  _$jscoverage['/touch.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['49'][1].init(18, 23, '!self.__ks_touch_action');
function visit80_49_1(result) {
  _$jscoverage['/touch.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['48'][1].init(73, 29, 'isMsPointerSupported && style');
function visit79_48_1(result) {
  _$jscoverage['/touch.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].lineData[6]++;
KISSY.add('event/dom/touch', function(S, DomEvent, eventHandleMap, eventHandle) {
  _$jscoverage['/touch.js'].functionData[0]++;
  _$jscoverage['/touch.js'].lineData[7]++;
  var isMsPointerSupported = S.Features.isMsPointerSupported();
  _$jscoverage['/touch.js'].lineData[8]++;
  var Gesture = DomEvent.Gesture;
  _$jscoverage['/touch.js'].lineData[9]++;
  var startEvent = Gesture.start = 'KSPointerDown';
  _$jscoverage['/touch.js'].lineData[10]++;
  var moveEvent = Gesture.move = 'KSPointerMove';
  _$jscoverage['/touch.js'].lineData[11]++;
  var endEvent = Gesture.end = 'KSPointerUp';
  _$jscoverage['/touch.js'].lineData[12]++;
  Gesture.tap = 'tap';
  _$jscoverage['/touch.js'].lineData[13]++;
  Gesture.doubleTap = 'doubleTap';
  _$jscoverage['/touch.js'].lineData[15]++;
  eventHandleMap[startEvent] = {
  handle: {
  isActive: 1, 
  onTouchStart: function(e) {
  _$jscoverage['/touch.js'].functionData[1]++;
  _$jscoverage['/touch.js'].lineData[19]++;
  DomEvent.fire(e.target, startEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[23]++;
  eventHandleMap[moveEvent] = {
  handle: {
  isActive: 1, 
  onTouchMove: function(e) {
  _$jscoverage['/touch.js'].functionData[2]++;
  _$jscoverage['/touch.js'].lineData[27]++;
  DomEvent.fire(e.target, moveEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[31]++;
  eventHandleMap[endEvent] = {
  handle: {
  isActive: 1, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch.js'].functionData[3]++;
  _$jscoverage['/touch.js'].lineData[35]++;
  DomEvent.fire(e.target, endEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[40]++;
  function setupExtra(event) {
    _$jscoverage['/touch.js'].functionData[4]++;
    _$jscoverage['/touch.js'].lineData[41]++;
    setup.call(this, event);
    _$jscoverage['/touch.js'].lineData[42]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[45]++;
  function setup(event) {
    _$jscoverage['/touch.js'].functionData[5]++;
    _$jscoverage['/touch.js'].lineData[46]++;
    var self = this, style = self.style;
    _$jscoverage['/touch.js'].lineData[48]++;
    if (visit79_48_1(isMsPointerSupported && style)) {
      _$jscoverage['/touch.js'].lineData[49]++;
      if (visit80_49_1(!self.__ks_touch_action)) {
        _$jscoverage['/touch.js'].lineData[50]++;
        self.__ks_touch_action = style.msTouchAction;
        _$jscoverage['/touch.js'].lineData[51]++;
        self.__ks_user_select = style.msUserSelect;
        _$jscoverage['/touch.js'].lineData[52]++;
        style.msTouchAction = style.msUserSelect = 'none';
      }
      _$jscoverage['/touch.js'].lineData[54]++;
      if (visit81_54_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[55]++;
        self.__ks_touch_action_count = 1;
      } else {
        _$jscoverage['/touch.js'].lineData[57]++;
        self.__ks_touch_action_count++;
      }
    }
    _$jscoverage['/touch.js'].lineData[60]++;
    eventHandle.addDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[63]++;
  function tearDownExtra(event) {
    _$jscoverage['/touch.js'].functionData[6]++;
    _$jscoverage['/touch.js'].lineData[64]++;
    tearDown.call(this, event);
    _$jscoverage['/touch.js'].lineData[65]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[68]++;
  function tearDown(event) {
    _$jscoverage['/touch.js'].functionData[7]++;
    _$jscoverage['/touch.js'].lineData[69]++;
    var self = this, style = self.style;
    _$jscoverage['/touch.js'].lineData[71]++;
    if (visit82_71_1(isMsPointerSupported && style)) {
      _$jscoverage['/touch.js'].lineData[72]++;
      if (visit83_72_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[73]++;
        S.error('touch event error for ie');
      }
      _$jscoverage['/touch.js'].lineData[75]++;
      self.__ks_touch_action_count--;
      _$jscoverage['/touch.js'].lineData[76]++;
      if (visit84_76_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[77]++;
        style.msUserSelect = self.__ks_user_select;
        _$jscoverage['/touch.js'].lineData[78]++;
        style.msTouchAction = self.__ks_touch_action;
        _$jscoverage['/touch.js'].lineData[79]++;
        self.__ks_touch_action = '';
      }
    }
    _$jscoverage['/touch.js'].lineData[82]++;
    eventHandle.removeDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[85]++;
  var Special = DomEvent.Special, specialEvent, e, eventHandleValue;
  _$jscoverage['/touch.js'].lineData[88]++;
  for (e in eventHandleMap) {
    _$jscoverage['/touch.js'].lineData[89]++;
    specialEvent = {};
    _$jscoverage['/touch.js'].lineData[90]++;
    eventHandleValue = eventHandleMap[e];
    _$jscoverage['/touch.js'].lineData[91]++;
    if (visit85_91_1(eventHandleValue.setup)) {
      _$jscoverage['/touch.js'].lineData[92]++;
      specialEvent.setup = setupExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[94]++;
      specialEvent.setup = setup;
    }
    _$jscoverage['/touch.js'].lineData[96]++;
    if (visit86_96_1(eventHandleValue.tearDown)) {
      _$jscoverage['/touch.js'].lineData[97]++;
      specialEvent.tearDown = tearDownExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[99]++;
      specialEvent.tearDown = tearDown;
    }
    _$jscoverage['/touch.js'].lineData[101]++;
    if (visit87_101_1(eventHandleValue.add)) {
      _$jscoverage['/touch.js'].lineData[102]++;
      specialEvent.add = eventHandleValue.add;
    }
    _$jscoverage['/touch.js'].lineData[104]++;
    if (visit88_104_1(eventHandleValue.remove)) {
      _$jscoverage['/touch.js'].lineData[105]++;
      specialEvent.remove = eventHandleValue.remove;
    }
    _$jscoverage['/touch.js'].lineData[107]++;
    Special[e] = specialEvent;
  }
}, {
  requires: ['event/dom/base', './touch/handle-map', './touch/handle']});
