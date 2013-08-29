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
  _$jscoverage['/touch.js'].lineData[20] = 0;
  _$jscoverage['/touch.js'].lineData[24] = 0;
  _$jscoverage['/touch.js'].lineData[26] = 0;
  _$jscoverage['/touch.js'].lineData[27] = 0;
  _$jscoverage['/touch.js'].lineData[28] = 0;
  _$jscoverage['/touch.js'].lineData[31] = 0;
  _$jscoverage['/touch.js'].lineData[32] = 0;
  _$jscoverage['/touch.js'].lineData[33] = 0;
  _$jscoverage['/touch.js'].lineData[41] = 0;
  _$jscoverage['/touch.js'].lineData[43] = 0;
  _$jscoverage['/touch.js'].lineData[44] = 0;
  _$jscoverage['/touch.js'].lineData[49] = 0;
  _$jscoverage['/touch.js'].lineData[54] = 0;
  _$jscoverage['/touch.js'].lineData[59] = 0;
  _$jscoverage['/touch.js'].lineData[60] = 0;
  _$jscoverage['/touch.js'].lineData[61] = 0;
  _$jscoverage['/touch.js'].lineData[64] = 0;
  _$jscoverage['/touch.js'].lineData[65] = 0;
  _$jscoverage['/touch.js'].lineData[66] = 0;
  _$jscoverage['/touch.js'].lineData[69] = 0;
  _$jscoverage['/touch.js'].lineData[70] = 0;
  _$jscoverage['/touch.js'].lineData[72] = 0;
  _$jscoverage['/touch.js'].lineData[73] = 0;
  _$jscoverage['/touch.js'].lineData[74] = 0;
  _$jscoverage['/touch.js'].lineData[75] = 0;
  _$jscoverage['/touch.js'].lineData[76] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[79] = 0;
  _$jscoverage['/touch.js'].lineData[81] = 0;
  _$jscoverage['/touch.js'].lineData[84] = 0;
  _$jscoverage['/touch.js'].lineData[87] = 0;
  _$jscoverage['/touch.js'].lineData[88] = 0;
  _$jscoverage['/touch.js'].lineData[90] = 0;
  _$jscoverage['/touch.js'].lineData[91] = 0;
  _$jscoverage['/touch.js'].lineData[92] = 0;
  _$jscoverage['/touch.js'].lineData[94] = 0;
  _$jscoverage['/touch.js'].lineData[95] = 0;
  _$jscoverage['/touch.js'].lineData[96] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[98] = 0;
  _$jscoverage['/touch.js'].lineData[101] = 0;
  _$jscoverage['/touch.js'].lineData[104] = 0;
  _$jscoverage['/touch.js'].lineData[107] = 0;
  _$jscoverage['/touch.js'].lineData[108] = 0;
  _$jscoverage['/touch.js'].lineData[109] = 0;
  _$jscoverage['/touch.js'].lineData[110] = 0;
  _$jscoverage['/touch.js'].lineData[111] = 0;
  _$jscoverage['/touch.js'].lineData[113] = 0;
  _$jscoverage['/touch.js'].lineData[115] = 0;
  _$jscoverage['/touch.js'].lineData[116] = 0;
  _$jscoverage['/touch.js'].lineData[118] = 0;
  _$jscoverage['/touch.js'].lineData[120] = 0;
  _$jscoverage['/touch.js'].lineData[121] = 0;
  _$jscoverage['/touch.js'].lineData[123] = 0;
  _$jscoverage['/touch.js'].lineData[124] = 0;
  _$jscoverage['/touch.js'].lineData[126] = 0;
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
  _$jscoverage['/touch.js'].functionData[8] = 0;
  _$jscoverage['/touch.js'].functionData[9] = 0;
}
if (! _$jscoverage['/touch.js'].branchData) {
  _$jscoverage['/touch.js'].branchData = {};
  _$jscoverage['/touch.js'].branchData['26'] = [];
  _$jscoverage['/touch.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['27'] = [];
  _$jscoverage['/touch.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['31'] = [];
  _$jscoverage['/touch.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['32'] = [];
  _$jscoverage['/touch.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['42'] = [];
  _$jscoverage['/touch.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['43'] = [];
  _$jscoverage['/touch.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['72'] = [];
  _$jscoverage['/touch.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['73'] = [];
  _$jscoverage['/touch.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['78'] = [];
  _$jscoverage['/touch.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['90'] = [];
  _$jscoverage['/touch.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['91'] = [];
  _$jscoverage['/touch.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['95'] = [];
  _$jscoverage['/touch.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['110'] = [];
  _$jscoverage['/touch.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['115'] = [];
  _$jscoverage['/touch.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['120'] = [];
  _$jscoverage['/touch.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['123'] = [];
  _$jscoverage['/touch.js'].branchData['123'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['123'][1].init(516, 23, 'eventHandleValue.remove');
function visit100_123_1(result) {
  _$jscoverage['/touch.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['120'][1].init(414, 20, 'eventHandleValue.add');
function visit99_120_1(result) {
  _$jscoverage['/touch.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['115'][1].init(244, 25, 'eventHandleValue.tearDown');
function visit98_115_1(result) {
  _$jscoverage['/touch.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['110'][1].init(89, 22, 'eventHandleValue.setup');
function visit97_110_1(result) {
  _$jscoverage['/touch.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['95'][1].init(182, 29, '!self.__ks_touch_action_count');
function visit96_95_1(result) {
  _$jscoverage['/touch.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['91'][1].init(18, 29, '!self.__ks_touch_action_count');
function visit95_91_1(result) {
  _$jscoverage['/touch.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['90'][1].init(73, 29, 'isMsPointerSupported && style');
function visit94_90_1(result) {
  _$jscoverage['/touch.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['78'][1].init(269, 29, '!self.__ks_touch_action_count');
function visit93_78_1(result) {
  _$jscoverage['/touch.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['73'][1].init(18, 23, '!self.__ks_touch_action');
function visit92_73_1(result) {
  _$jscoverage['/touch.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['72'][1].init(73, 29, 'isMsPointerSupported && style');
function visit91_72_1(result) {
  _$jscoverage['/touch.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['43'][1].init(158, 30, 'doc.__ks__pointer_events_count');
function visit90_43_1(result) {
  _$jscoverage['/touch.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['42'][1].init(44, 20, 't.ownerDocument || t');
function visit89_42_1(result) {
  _$jscoverage['/touch.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['32'][1].init(69, 30, 'doc.__ks__pointer_events_count');
function visit88_32_1(result) {
  _$jscoverage['/touch.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['31'][1].init(24, 26, 'this.ownerDocument || this');
function visit87_31_1(result) {
  _$jscoverage['/touch.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['27'][1].init(98, 35, 'doc.__ks__pointer_events_count || 0');
function visit86_27_1(result) {
  _$jscoverage['/touch.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['26'][1].init(24, 26, 'this.ownerDocument || this');
function visit85_26_1(result) {
  _$jscoverage['/touch.js'].branchData['26'][1].ranCondition(result);
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
  _$jscoverage['/touch.js'].lineData[20]++;
  DomEvent.fire(e.target, startEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[24]++;
  eventHandleMap[moveEvent] = {
  setup: function() {
  _$jscoverage['/touch.js'].functionData[2]++;
  _$jscoverage['/touch.js'].lineData[26]++;
  var doc = visit85_26_1(this.ownerDocument || this);
  _$jscoverage['/touch.js'].lineData[27]++;
  doc.__ks__pointer_events_count = visit86_27_1(doc.__ks__pointer_events_count || 0);
  _$jscoverage['/touch.js'].lineData[28]++;
  doc.__ks__pointer_events_count++;
}, 
  tearDown: function() {
  _$jscoverage['/touch.js'].functionData[3]++;
  _$jscoverage['/touch.js'].lineData[31]++;
  var doc = visit87_31_1(this.ownerDocument || this);
  _$jscoverage['/touch.js'].lineData[32]++;
  if (visit88_32_1(doc.__ks__pointer_events_count)) {
    _$jscoverage['/touch.js'].lineData[33]++;
    doc.__ks__pointer_events_count--;
  }
}, 
  handle: {
  isActive: 1, 
  onTouchMove: function(e) {
  _$jscoverage['/touch.js'].functionData[4]++;
  _$jscoverage['/touch.js'].lineData[41]++;
  var t = e.target, doc = visit89_42_1(t.ownerDocument || t);
  _$jscoverage['/touch.js'].lineData[43]++;
  if (visit90_43_1(doc.__ks__pointer_events_count)) {
    _$jscoverage['/touch.js'].lineData[44]++;
    DomEvent.fire(t, moveEvent, e);
  }
}}};
  _$jscoverage['/touch.js'].lineData[49]++;
  eventHandleMap[endEvent] = {
  handle: {
  isActive: 1, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch.js'].functionData[5]++;
  _$jscoverage['/touch.js'].lineData[54]++;
  DomEvent.fire(e.target, endEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[59]++;
  function setupExtra(event) {
    _$jscoverage['/touch.js'].functionData[6]++;
    _$jscoverage['/touch.js'].lineData[60]++;
    setup.call(this, event);
    _$jscoverage['/touch.js'].lineData[61]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[64]++;
  function tearDownExtra(event) {
    _$jscoverage['/touch.js'].functionData[7]++;
    _$jscoverage['/touch.js'].lineData[65]++;
    tearDown.call(this, event);
    _$jscoverage['/touch.js'].lineData[66]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[69]++;
  function setup(event) {
    _$jscoverage['/touch.js'].functionData[8]++;
    _$jscoverage['/touch.js'].lineData[70]++;
    var self = this, style = self.style;
    _$jscoverage['/touch.js'].lineData[72]++;
    if (visit91_72_1(isMsPointerSupported && style)) {
      _$jscoverage['/touch.js'].lineData[73]++;
      if (visit92_73_1(!self.__ks_touch_action)) {
        _$jscoverage['/touch.js'].lineData[74]++;
        self.__ks_touch_action = style.msTouchAction;
        _$jscoverage['/touch.js'].lineData[75]++;
        self.__ks_user_select = style.msUserSelect;
        _$jscoverage['/touch.js'].lineData[76]++;
        style.msTouchAction = style.msUserSelect = 'none';
      }
      _$jscoverage['/touch.js'].lineData[78]++;
      if (visit93_78_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[79]++;
        self.__ks_touch_action_count = 1;
      } else {
        _$jscoverage['/touch.js'].lineData[81]++;
        self.__ks_touch_action_count++;
      }
    }
    _$jscoverage['/touch.js'].lineData[84]++;
    eventHandle.addDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[87]++;
  function tearDown(event) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[88]++;
    var self = this, style = self.style;
    _$jscoverage['/touch.js'].lineData[90]++;
    if (visit94_90_1(isMsPointerSupported && style)) {
      _$jscoverage['/touch.js'].lineData[91]++;
      if (visit95_91_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[92]++;
        S.error('touch event error for ie');
      }
      _$jscoverage['/touch.js'].lineData[94]++;
      self.__ks_touch_action_count--;
      _$jscoverage['/touch.js'].lineData[95]++;
      if (visit96_95_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[96]++;
        style.msUserSelect = self.__ks_user_select;
        _$jscoverage['/touch.js'].lineData[97]++;
        style.msTouchAction = self.__ks_touch_action;
        _$jscoverage['/touch.js'].lineData[98]++;
        self.__ks_touch_action = '';
      }
    }
    _$jscoverage['/touch.js'].lineData[101]++;
    eventHandle.removeDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[104]++;
  var Special = DomEvent.Special, specialEvent, e, eventHandleValue;
  _$jscoverage['/touch.js'].lineData[107]++;
  for (e in eventHandleMap) {
    _$jscoverage['/touch.js'].lineData[108]++;
    specialEvent = {};
    _$jscoverage['/touch.js'].lineData[109]++;
    eventHandleValue = eventHandleMap[e];
    _$jscoverage['/touch.js'].lineData[110]++;
    if (visit97_110_1(eventHandleValue.setup)) {
      _$jscoverage['/touch.js'].lineData[111]++;
      specialEvent.setup = setupExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[113]++;
      specialEvent.setup = setup;
    }
    _$jscoverage['/touch.js'].lineData[115]++;
    if (visit98_115_1(eventHandleValue.tearDown)) {
      _$jscoverage['/touch.js'].lineData[116]++;
      specialEvent.tearDown = tearDownExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[118]++;
      specialEvent.tearDown = tearDown;
    }
    _$jscoverage['/touch.js'].lineData[120]++;
    if (visit99_120_1(eventHandleValue.add)) {
      _$jscoverage['/touch.js'].lineData[121]++;
      specialEvent.add = eventHandleValue.add;
    }
    _$jscoverage['/touch.js'].lineData[123]++;
    if (visit100_123_1(eventHandleValue.remove)) {
      _$jscoverage['/touch.js'].lineData[124]++;
      specialEvent.remove = eventHandleValue.remove;
    }
    _$jscoverage['/touch.js'].lineData[126]++;
    Special[e] = specialEvent;
  }
}, {
  requires: ['event/dom/base', './touch/handle-map', './touch/handle']});
