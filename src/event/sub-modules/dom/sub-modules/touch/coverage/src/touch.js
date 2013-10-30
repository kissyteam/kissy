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
  _$jscoverage['/touch.js'].lineData[14] = 0;
  _$jscoverage['/touch.js'].lineData[19] = 0;
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
  _$jscoverage['/touch.js'].lineData[50] = 0;
  _$jscoverage['/touch.js'].lineData[55] = 0;
  _$jscoverage['/touch.js'].lineData[60] = 0;
  _$jscoverage['/touch.js'].lineData[61] = 0;
  _$jscoverage['/touch.js'].lineData[62] = 0;
  _$jscoverage['/touch.js'].lineData[65] = 0;
  _$jscoverage['/touch.js'].lineData[66] = 0;
  _$jscoverage['/touch.js'].lineData[67] = 0;
  _$jscoverage['/touch.js'].lineData[70] = 0;
  _$jscoverage['/touch.js'].lineData[71] = 0;
  _$jscoverage['/touch.js'].lineData[74] = 0;
  _$jscoverage['/touch.js'].lineData[75] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[81] = 0;
  _$jscoverage['/touch.js'].lineData[82] = 0;
  _$jscoverage['/touch.js'].lineData[83] = 0;
  _$jscoverage['/touch.js'].lineData[84] = 0;
  _$jscoverage['/touch.js'].lineData[85] = 0;
  _$jscoverage['/touch.js'].lineData[87] = 0;
  _$jscoverage['/touch.js'].lineData[89] = 0;
  _$jscoverage['/touch.js'].lineData[90] = 0;
  _$jscoverage['/touch.js'].lineData[92] = 0;
  _$jscoverage['/touch.js'].lineData[94] = 0;
  _$jscoverage['/touch.js'].lineData[95] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[98] = 0;
  _$jscoverage['/touch.js'].lineData[100] = 0;
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
  _$jscoverage['/touch.js'].branchData['84'] = [];
  _$jscoverage['/touch.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['89'] = [];
  _$jscoverage['/touch.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['94'] = [];
  _$jscoverage['/touch.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['97'] = [];
  _$jscoverage['/touch.js'].branchData['97'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['97'][1].init(516, 23, 'eventHandleValue.remove');
function visit107_97_1(result) {
  _$jscoverage['/touch.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['94'][1].init(414, 20, 'eventHandleValue.add');
function visit106_94_1(result) {
  _$jscoverage['/touch.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['89'][1].init(244, 25, 'eventHandleValue.tearDown');
function visit105_89_1(result) {
  _$jscoverage['/touch.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['84'][1].init(89, 22, 'eventHandleValue.setup');
function visit104_84_1(result) {
  _$jscoverage['/touch.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['43'][1].init(158, 30, 'doc.__ks__pointer_events_count');
function visit103_43_1(result) {
  _$jscoverage['/touch.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['42'][1].init(44, 20, 't.ownerDocument || t');
function visit102_42_1(result) {
  _$jscoverage['/touch.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['32'][1].init(69, 30, 'doc.__ks__pointer_events_count');
function visit101_32_1(result) {
  _$jscoverage['/touch.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['31'][1].init(24, 26, 'this.ownerDocument || this');
function visit100_31_1(result) {
  _$jscoverage['/touch.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['27'][1].init(98, 35, 'doc.__ks__pointer_events_count || 0');
function visit99_27_1(result) {
  _$jscoverage['/touch.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['26'][1].init(24, 26, 'this.ownerDocument || this');
function visit98_26_1(result) {
  _$jscoverage['/touch.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].lineData[6]++;
KISSY.add('event/dom/touch', function(S, DomEvent, eventHandleMap, eventHandle) {
  _$jscoverage['/touch.js'].functionData[0]++;
  _$jscoverage['/touch.js'].lineData[7]++;
  var Gesture = DomEvent.Gesture;
  _$jscoverage['/touch.js'].lineData[8]++;
  var startEvent = Gesture.start = 'KSPointerDown';
  _$jscoverage['/touch.js'].lineData[9]++;
  var moveEvent = Gesture.move = 'KSPointerMove';
  _$jscoverage['/touch.js'].lineData[10]++;
  var endEvent = Gesture.end = 'KSPointerUp';
  _$jscoverage['/touch.js'].lineData[11]++;
  Gesture.tap = 'tap';
  _$jscoverage['/touch.js'].lineData[12]++;
  Gesture.doubleTap = 'doubleTap';
  _$jscoverage['/touch.js'].lineData[14]++;
  eventHandleMap[startEvent] = {
  handle: {
  isActive: 1, 
  onTouchStart: function(e) {
  _$jscoverage['/touch.js'].functionData[1]++;
  _$jscoverage['/touch.js'].lineData[19]++;
  DomEvent.fire(e.target, startEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[24]++;
  eventHandleMap[moveEvent] = {
  setup: function() {
  _$jscoverage['/touch.js'].functionData[2]++;
  _$jscoverage['/touch.js'].lineData[26]++;
  var doc = visit98_26_1(this.ownerDocument || this);
  _$jscoverage['/touch.js'].lineData[27]++;
  doc.__ks__pointer_events_count = visit99_27_1(doc.__ks__pointer_events_count || 0);
  _$jscoverage['/touch.js'].lineData[28]++;
  doc.__ks__pointer_events_count++;
}, 
  tearDown: function() {
  _$jscoverage['/touch.js'].functionData[3]++;
  _$jscoverage['/touch.js'].lineData[31]++;
  var doc = visit100_31_1(this.ownerDocument || this);
  _$jscoverage['/touch.js'].lineData[32]++;
  if (visit101_32_1(doc.__ks__pointer_events_count)) {
    _$jscoverage['/touch.js'].lineData[33]++;
    doc.__ks__pointer_events_count--;
  }
}, 
  handle: {
  isActive: 1, 
  onTouchMove: function(e) {
  _$jscoverage['/touch.js'].functionData[4]++;
  _$jscoverage['/touch.js'].lineData[41]++;
  var t = e.target, doc = visit102_42_1(t.ownerDocument || t);
  _$jscoverage['/touch.js'].lineData[43]++;
  if (visit103_43_1(doc.__ks__pointer_events_count)) {
    _$jscoverage['/touch.js'].lineData[44]++;
    DomEvent.fire(t, moveEvent, e);
  }
}}};
  _$jscoverage['/touch.js'].lineData[50]++;
  eventHandleMap[endEvent] = {
  handle: {
  isActive: 1, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch.js'].functionData[5]++;
  _$jscoverage['/touch.js'].lineData[55]++;
  DomEvent.fire(e.target, endEvent, e);
}}};
  _$jscoverage['/touch.js'].lineData[60]++;
  function setupExtra(event) {
    _$jscoverage['/touch.js'].functionData[6]++;
    _$jscoverage['/touch.js'].lineData[61]++;
    setup.call(this, event);
    _$jscoverage['/touch.js'].lineData[62]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[65]++;
  function tearDownExtra(event) {
    _$jscoverage['/touch.js'].functionData[7]++;
    _$jscoverage['/touch.js'].lineData[66]++;
    tearDown.call(this, event);
    _$jscoverage['/touch.js'].lineData[67]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/touch.js'].lineData[70]++;
  function setup(event) {
    _$jscoverage['/touch.js'].functionData[8]++;
    _$jscoverage['/touch.js'].lineData[71]++;
    eventHandle.addDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[74]++;
  function tearDown(event) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[75]++;
    eventHandle.removeDocumentHandle(this, event);
  }
  _$jscoverage['/touch.js'].lineData[78]++;
  var Special = DomEvent.Special, specialEvent, e, eventHandleValue;
  _$jscoverage['/touch.js'].lineData[81]++;
  for (e in eventHandleMap) {
    _$jscoverage['/touch.js'].lineData[82]++;
    specialEvent = {};
    _$jscoverage['/touch.js'].lineData[83]++;
    eventHandleValue = eventHandleMap[e];
    _$jscoverage['/touch.js'].lineData[84]++;
    if (visit104_84_1(eventHandleValue.setup)) {
      _$jscoverage['/touch.js'].lineData[85]++;
      specialEvent.setup = setupExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[87]++;
      specialEvent.setup = setup;
    }
    _$jscoverage['/touch.js'].lineData[89]++;
    if (visit105_89_1(eventHandleValue.tearDown)) {
      _$jscoverage['/touch.js'].lineData[90]++;
      specialEvent.tearDown = tearDownExtra;
    } else {
      _$jscoverage['/touch.js'].lineData[92]++;
      specialEvent.tearDown = tearDown;
    }
    _$jscoverage['/touch.js'].lineData[94]++;
    if (visit106_94_1(eventHandleValue.add)) {
      _$jscoverage['/touch.js'].lineData[95]++;
      specialEvent.add = eventHandleValue.add;
    }
    _$jscoverage['/touch.js'].lineData[97]++;
    if (visit107_97_1(eventHandleValue.remove)) {
      _$jscoverage['/touch.js'].lineData[98]++;
      specialEvent.remove = eventHandleValue.remove;
    }
    _$jscoverage['/touch.js'].lineData[100]++;
    Special[e] = specialEvent;
  }
}, {
  requires: ['event/dom/base', './touch/handle-map', './touch/handle']});
