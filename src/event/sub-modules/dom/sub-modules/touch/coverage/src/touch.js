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
  _$jscoverage['/touch.js'].lineData[25] = 0;
  _$jscoverage['/touch.js'].lineData[27] = 0;
  _$jscoverage['/touch.js'].lineData[28] = 0;
  _$jscoverage['/touch.js'].lineData[29] = 0;
  _$jscoverage['/touch.js'].lineData[32] = 0;
  _$jscoverage['/touch.js'].lineData[33] = 0;
  _$jscoverage['/touch.js'].lineData[34] = 0;
  _$jscoverage['/touch.js'].lineData[42] = 0;
  _$jscoverage['/touch.js'].lineData[44] = 0;
  _$jscoverage['/touch.js'].lineData[45] = 0;
  _$jscoverage['/touch.js'].lineData[51] = 0;
  _$jscoverage['/touch.js'].lineData[56] = 0;
  _$jscoverage['/touch.js'].lineData[61] = 0;
  _$jscoverage['/touch.js'].lineData[62] = 0;
  _$jscoverage['/touch.js'].lineData[63] = 0;
  _$jscoverage['/touch.js'].lineData[66] = 0;
  _$jscoverage['/touch.js'].lineData[67] = 0;
  _$jscoverage['/touch.js'].lineData[68] = 0;
  _$jscoverage['/touch.js'].lineData[71] = 0;
  _$jscoverage['/touch.js'].lineData[72] = 0;
  _$jscoverage['/touch.js'].lineData[74] = 0;
  _$jscoverage['/touch.js'].lineData[75] = 0;
  _$jscoverage['/touch.js'].lineData[76] = 0;
  _$jscoverage['/touch.js'].lineData[77] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[80] = 0;
  _$jscoverage['/touch.js'].lineData[81] = 0;
  _$jscoverage['/touch.js'].lineData[83] = 0;
  _$jscoverage['/touch.js'].lineData[86] = 0;
  _$jscoverage['/touch.js'].lineData[89] = 0;
  _$jscoverage['/touch.js'].lineData[90] = 0;
  _$jscoverage['/touch.js'].lineData[92] = 0;
  _$jscoverage['/touch.js'].lineData[93] = 0;
  _$jscoverage['/touch.js'].lineData[94] = 0;
  _$jscoverage['/touch.js'].lineData[96] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[98] = 0;
  _$jscoverage['/touch.js'].lineData[99] = 0;
  _$jscoverage['/touch.js'].lineData[100] = 0;
  _$jscoverage['/touch.js'].lineData[103] = 0;
  _$jscoverage['/touch.js'].lineData[106] = 0;
  _$jscoverage['/touch.js'].lineData[109] = 0;
  _$jscoverage['/touch.js'].lineData[110] = 0;
  _$jscoverage['/touch.js'].lineData[111] = 0;
  _$jscoverage['/touch.js'].lineData[112] = 0;
  _$jscoverage['/touch.js'].lineData[113] = 0;
  _$jscoverage['/touch.js'].lineData[115] = 0;
  _$jscoverage['/touch.js'].lineData[117] = 0;
  _$jscoverage['/touch.js'].lineData[118] = 0;
  _$jscoverage['/touch.js'].lineData[120] = 0;
  _$jscoverage['/touch.js'].lineData[122] = 0;
  _$jscoverage['/touch.js'].lineData[123] = 0;
  _$jscoverage['/touch.js'].lineData[125] = 0;
  _$jscoverage['/touch.js'].lineData[126] = 0;
  _$jscoverage['/touch.js'].lineData[128] = 0;
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
  _$jscoverage['/touch.js'].branchData['27'] = [];
  _$jscoverage['/touch.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['28'] = [];
  _$jscoverage['/touch.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['32'] = [];
  _$jscoverage['/touch.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['33'] = [];
  _$jscoverage['/touch.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['43'] = [];
  _$jscoverage['/touch.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['44'] = [];
  _$jscoverage['/touch.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['74'] = [];
  _$jscoverage['/touch.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['75'] = [];
  _$jscoverage['/touch.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['80'] = [];
  _$jscoverage['/touch.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['92'] = [];
  _$jscoverage['/touch.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['93'] = [];
  _$jscoverage['/touch.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['97'] = [];
  _$jscoverage['/touch.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['112'] = [];
  _$jscoverage['/touch.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['117'] = [];
  _$jscoverage['/touch.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['122'] = [];
  _$jscoverage['/touch.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['125'] = [];
  _$jscoverage['/touch.js'].branchData['125'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['125'][1].init(516, 23, 'eventHandleValue.remove');
function visit109_125_1(result) {
  _$jscoverage['/touch.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['122'][1].init(414, 20, 'eventHandleValue.add');
function visit108_122_1(result) {
  _$jscoverage['/touch.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['117'][1].init(244, 25, 'eventHandleValue.tearDown');
function visit107_117_1(result) {
  _$jscoverage['/touch.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['112'][1].init(89, 22, 'eventHandleValue.setup');
function visit106_112_1(result) {
  _$jscoverage['/touch.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['97'][1].init(182, 29, '!self.__ks_touch_action_count');
function visit105_97_1(result) {
  _$jscoverage['/touch.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['93'][1].init(18, 29, '!self.__ks_touch_action_count');
function visit104_93_1(result) {
  _$jscoverage['/touch.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['92'][1].init(73, 29, 'isMsPointerSupported && style');
function visit103_92_1(result) {
  _$jscoverage['/touch.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['80'][1].init(269, 29, '!self.__ks_touch_action_count');
function visit102_80_1(result) {
  _$jscoverage['/touch.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['75'][1].init(18, 23, '!self.__ks_touch_action');
function visit101_75_1(result) {
  _$jscoverage['/touch.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['74'][1].init(73, 29, 'isMsPointerSupported && style');
function visit100_74_1(result) {
  _$jscoverage['/touch.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['44'][1].init(158, 30, 'doc.__ks__pointer_events_count');
function visit99_44_1(result) {
  _$jscoverage['/touch.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['43'][1].init(44, 20, 't.ownerDocument || t');
function visit98_43_1(result) {
  _$jscoverage['/touch.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['33'][1].init(69, 30, 'doc.__ks__pointer_events_count');
function visit97_33_1(result) {
  _$jscoverage['/touch.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['32'][1].init(24, 26, 'this.ownerDocument || this');
function visit96_32_1(result) {
  _$jscoverage['/touch.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['28'][1].init(98, 35, 'doc.__ks__pointer_events_count || 0');
function visit95_28_1(result) {
  _$jscoverage['/touch.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['27'][1].init(24, 26, 'this.ownerDocument || this');
function visit94_27_1(result) {
  _$jscoverage['/touch.js'].branchData['27'][1].ranCondition(result);
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
  _$jscoverage['/touch.js'].lineData[25]++;
  eventHandleMap[moveEvent] = {
  setup: function() {
  _$jscoverage['/touch.js'].functionData[2]++;
  _$jscoverage['/touch.js'].lineData[27]++;
  var doc = visit94_27_1(this.ownerDocument || this);
  _$jscoverage['/touch.js'].lineData[28]++;
  doc.__ks__pointer_events_count = visit95_28_1(doc.__ks__pointer_events_count || 0);
  _$jscoverage['/touch.js'].lineData[29]++;
  doc.__ks__pointer_events_count++;
}, 
  tearDown: function() {
  _$jscoverage['/touch.js'].functionData[3]++;
  _$jscoverage['/touch.js'].lineData[32]++;
  var doc = visit96_32_1(this.ownerDocument || this);
  _$jscoverage['/touch.js'].lineData[33]++;
  if (visit97_33_1(doc.__ks__pointer_events_count)) {
    _$jscoverage['/touch.js'].lineData[34]++;
    doc.__ks__pointer_events_count--;
  }
}, 
  handle: {
  isActive: 1, 
  onTouchMove: function(e) {
  _$jscoverage['/touch.js'].functionData[4]++;
  _$jscoverage['/touch.js'].lineData[42]++;
  var t = e.target, doc = visit98_43_1(t.ownerDocument || t);
  _$jscoverage['/touch.js'].lineData[44]++;
  if (visit99_44_1(doc.__ks__pointer_events_count)) {
    _$jscoverage['/touch.js'].lineData[45]++;
    DomEvent.fire(t, moveEvent, e);
  }
}}};
  _$jscoverage['/touch.js'].lineData[51]++;
  eventHandleMap[endEvent] = {
  handle: {
  isActive: 1, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch.js'].functionData[5]++;
  _$jscoverage['/touch.js'].lineData[56]++;
  DomEvent.fire(e.target, endEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[61]++;
  function setupExtra(event) {
    _$jscoverage['/touch.js'].functionData[6]++;
    _$jscoverage['/touch.js'].lineData[62]++;
    setup.call(this, event);
    _$jscoverage['/touch.js'].lineData[63]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[66]++;
  function tearDownExtra(event) {
    _$jscoverage['/touch.js'].functionData[7]++;
    _$jscoverage['/touch.js'].lineData[67]++;
    tearDown.call(this, event);
    _$jscoverage['/touch.js'].lineData[68]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[71]++;
  function setup(event) {
    _$jscoverage['/touch.js'].functionData[8]++;
    _$jscoverage['/touch.js'].lineData[72]++;
    var self = this, style = self.style;
    _$jscoverage['/touch.js'].lineData[74]++;
    if (visit100_74_1(isMsPointerSupported && style)) {
      _$jscoverage['/touch.js'].lineData[75]++;
      if (visit101_75_1(!self.__ks_touch_action)) {
        _$jscoverage['/touch.js'].lineData[76]++;
        self.__ks_touch_action = style.msTouchAction;
        _$jscoverage['/touch.js'].lineData[77]++;
        self.__ks_user_select = style.msUserSelect;
        _$jscoverage['/touch.js'].lineData[78]++;
        style.msTouchAction = style.msUserSelect = 'none';
      }
      _$jscoverage['/touch.js'].lineData[80]++;
      if (visit102_80_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[81]++;
        self.__ks_touch_action_count = 1;
      } else {
        _$jscoverage['/touch.js'].lineData[83]++;
        self.__ks_touch_action_count++;
      }
    }
    _$jscoverage['/touch.js'].lineData[86]++;
    eventHandle.addDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[89]++;
  function tearDown(event) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[90]++;
    var self = this, style = self.style;
    _$jscoverage['/touch.js'].lineData[92]++;
    if (visit103_92_1(isMsPointerSupported && style)) {
      _$jscoverage['/touch.js'].lineData[93]++;
      if (visit104_93_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[94]++;
        S.error('touch event error for ie');
      }
      _$jscoverage['/touch.js'].lineData[96]++;
      self.__ks_touch_action_count--;
      _$jscoverage['/touch.js'].lineData[97]++;
      if (visit105_97_1(!self.__ks_touch_action_count)) {
        _$jscoverage['/touch.js'].lineData[98]++;
        style.msUserSelect = self.__ks_user_select;
        _$jscoverage['/touch.js'].lineData[99]++;
        style.msTouchAction = self.__ks_touch_action;
        _$jscoverage['/touch.js'].lineData[100]++;
        self.__ks_touch_action = '';
      }
    }
    _$jscoverage['/touch.js'].lineData[103]++;
    eventHandle.removeDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[106]++;
  var Special = DomEvent.Special, specialEvent, e, eventHandleValue;
  _$jscoverage['/touch.js'].lineData[109]++;
  for (e in eventHandleMap) {
    _$jscoverage['/touch.js'].lineData[110]++;
    specialEvent = {};
    _$jscoverage['/touch.js'].lineData[111]++;
    eventHandleValue = eventHandleMap[e];
    _$jscoverage['/touch.js'].lineData[112]++;
    if (visit106_112_1(eventHandleValue.setup)) {
      _$jscoverage['/touch.js'].lineData[113]++;
      specialEvent.setup = setupExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[115]++;
      specialEvent.setup = setup;
    }
    _$jscoverage['/touch.js'].lineData[117]++;
    if (visit107_117_1(eventHandleValue.tearDown)) {
      _$jscoverage['/touch.js'].lineData[118]++;
      specialEvent.tearDown = tearDownExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[120]++;
      specialEvent.tearDown = tearDown;
    }
    _$jscoverage['/touch.js'].lineData[122]++;
    if (visit108_122_1(eventHandleValue.add)) {
      _$jscoverage['/touch.js'].lineData[123]++;
      specialEvent.add = eventHandleValue.add;
    }
    _$jscoverage['/touch.js'].lineData[125]++;
    if (visit109_125_1(eventHandleValue.remove)) {
      _$jscoverage['/touch.js'].lineData[126]++;
      specialEvent.remove = eventHandleValue.remove;
    }
    _$jscoverage['/touch.js'].lineData[128]++;
    Special[e] = specialEvent;
  }
}, {
  requires: ['event/dom/base', './touch/handle-map', './touch/handle']});
