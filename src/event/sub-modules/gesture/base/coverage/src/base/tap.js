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
if (! _$jscoverage['/base/tap.js']) {
  _$jscoverage['/base/tap.js'] = {};
  _$jscoverage['/base/tap.js'].lineData = [];
  _$jscoverage['/base/tap.js'].lineData[6] = 0;
  _$jscoverage['/base/tap.js'].lineData[7] = 0;
  _$jscoverage['/base/tap.js'].lineData[8] = 0;
  _$jscoverage['/base/tap.js'].lineData[9] = 0;
  _$jscoverage['/base/tap.js'].lineData[11] = 0;
  _$jscoverage['/base/tap.js'].lineData[21] = 0;
  _$jscoverage['/base/tap.js'].lineData[22] = 0;
  _$jscoverage['/base/tap.js'].lineData[25] = 0;
  _$jscoverage['/base/tap.js'].lineData[26] = 0;
  _$jscoverage['/base/tap.js'].lineData[27] = 0;
  _$jscoverage['/base/tap.js'].lineData[28] = 0;
  _$jscoverage['/base/tap.js'].lineData[30] = 0;
  _$jscoverage['/base/tap.js'].lineData[31] = 0;
  _$jscoverage['/base/tap.js'].lineData[32] = 0;
  _$jscoverage['/base/tap.js'].lineData[36] = 0;
  _$jscoverage['/base/tap.js'].lineData[37] = 0;
  _$jscoverage['/base/tap.js'].lineData[40] = 0;
  _$jscoverage['/base/tap.js'].lineData[42] = 0;
  _$jscoverage['/base/tap.js'].lineData[43] = 0;
  _$jscoverage['/base/tap.js'].lineData[45] = 0;
  _$jscoverage['/base/tap.js'].lineData[47] = 0;
  _$jscoverage['/base/tap.js'].lineData[49] = 0;
  _$jscoverage['/base/tap.js'].lineData[50] = 0;
  _$jscoverage['/base/tap.js'].lineData[55] = 0;
  _$jscoverage['/base/tap.js'].lineData[56] = 0;
  _$jscoverage['/base/tap.js'].lineData[57] = 0;
  _$jscoverage['/base/tap.js'].lineData[60] = 0;
  _$jscoverage['/base/tap.js'].lineData[62] = 0;
  _$jscoverage['/base/tap.js'].lineData[66] = 0;
  _$jscoverage['/base/tap.js'].lineData[68] = 0;
  _$jscoverage['/base/tap.js'].lineData[69] = 0;
  _$jscoverage['/base/tap.js'].lineData[71] = 0;
  _$jscoverage['/base/tap.js'].lineData[75] = 0;
  _$jscoverage['/base/tap.js'].lineData[78] = 0;
  _$jscoverage['/base/tap.js'].lineData[79] = 0;
  _$jscoverage['/base/tap.js'].lineData[81] = 0;
  _$jscoverage['/base/tap.js'].lineData[85] = 0;
  _$jscoverage['/base/tap.js'].lineData[88] = 0;
  _$jscoverage['/base/tap.js'].lineData[90] = 0;
  _$jscoverage['/base/tap.js'].lineData[91] = 0;
  _$jscoverage['/base/tap.js'].lineData[95] = 0;
  _$jscoverage['/base/tap.js'].lineData[96] = 0;
  _$jscoverage['/base/tap.js'].lineData[99] = 0;
  _$jscoverage['/base/tap.js'].lineData[100] = 0;
  _$jscoverage['/base/tap.js'].lineData[103] = 0;
  _$jscoverage['/base/tap.js'].lineData[105] = 0;
  _$jscoverage['/base/tap.js'].lineData[114] = 0;
  _$jscoverage['/base/tap.js'].lineData[115] = 0;
  _$jscoverage['/base/tap.js'].lineData[118] = 0;
  _$jscoverage['/base/tap.js'].lineData[119] = 0;
  _$jscoverage['/base/tap.js'].lineData[120] = 0;
  _$jscoverage['/base/tap.js'].lineData[122] = 0;
  _$jscoverage['/base/tap.js'].lineData[130] = 0;
  _$jscoverage['/base/tap.js'].lineData[133] = 0;
  _$jscoverage['/base/tap.js'].lineData[135] = 0;
  _$jscoverage['/base/tap.js'].lineData[137] = 0;
  _$jscoverage['/base/tap.js'].lineData[139] = 0;
  _$jscoverage['/base/tap.js'].lineData[141] = 0;
  _$jscoverage['/base/tap.js'].lineData[142] = 0;
  _$jscoverage['/base/tap.js'].lineData[149] = 0;
  _$jscoverage['/base/tap.js'].lineData[156] = 0;
  _$jscoverage['/base/tap.js'].lineData[157] = 0;
  _$jscoverage['/base/tap.js'].lineData[158] = 0;
  _$jscoverage['/base/tap.js'].lineData[168] = 0;
  _$jscoverage['/base/tap.js'].lineData[169] = 0;
  _$jscoverage['/base/tap.js'].lineData[181] = 0;
  _$jscoverage['/base/tap.js'].lineData[185] = 0;
}
if (! _$jscoverage['/base/tap.js'].functionData) {
  _$jscoverage['/base/tap.js'].functionData = [];
  _$jscoverage['/base/tap.js'].functionData[0] = 0;
  _$jscoverage['/base/tap.js'].functionData[1] = 0;
  _$jscoverage['/base/tap.js'].functionData[2] = 0;
  _$jscoverage['/base/tap.js'].functionData[3] = 0;
  _$jscoverage['/base/tap.js'].functionData[4] = 0;
  _$jscoverage['/base/tap.js'].functionData[5] = 0;
  _$jscoverage['/base/tap.js'].functionData[6] = 0;
  _$jscoverage['/base/tap.js'].functionData[7] = 0;
  _$jscoverage['/base/tap.js'].functionData[8] = 0;
}
if (! _$jscoverage['/base/tap.js'].branchData) {
  _$jscoverage['/base/tap.js'].branchData = {};
  _$jscoverage['/base/tap.js'].branchData['26'] = [];
  _$jscoverage['/base/tap.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['30'] = [];
  _$jscoverage['/base/tap.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['68'] = [];
  _$jscoverage['/base/tap.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['75'] = [];
  _$jscoverage['/base/tap.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['76'] = [];
  _$jscoverage['/base/tap.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['77'] = [];
  _$jscoverage['/base/tap.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['90'] = [];
  _$jscoverage['/base/tap.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['95'] = [];
  _$jscoverage['/base/tap.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['118'] = [];
  _$jscoverage['/base/tap.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['119'] = [];
  _$jscoverage['/base/tap.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['122'] = [];
  _$jscoverage['/base/tap.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['135'] = [];
  _$jscoverage['/base/tap.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['139'] = [];
  _$jscoverage['/base/tap.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/tap.js'].branchData['157'] = [];
  _$jscoverage['/base/tap.js'].branchData['157'][1] = new BranchData();
}
_$jscoverage['/base/tap.js'].branchData['157'][1].init(2354, 27, 'duration > SINGLE_TAP_DELAY');
function visit80_157_1(result) {
  _$jscoverage['/base/tap.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['139'][1].init(155, 27, 'duration < SINGLE_TAP_DELAY');
function visit79_139_1(result) {
  _$jscoverage['/base/tap.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['135'][1].init(1505, 11, 'lastEndTime');
function visit78_135_1(result) {
  _$jscoverage['/base/tap.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['122'][1].init(33, 30, 'target.ownerDocument || target');
function visit77_122_1(result) {
  _$jscoverage['/base/tap.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['119'][1].init(21, 8, 'S.UA.ios');
function visit76_119_1(result) {
  _$jscoverage['/base/tap.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['118'][1].init(911, 47, 'eventObject.isDefaultPrevented() && S.UA.mobile');
function visit75_118_1(result) {
  _$jscoverage['/base/tap.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['95'][1].init(202, 23, '!(lastXY = self.lastXY)');
function visit74_95_1(result) {
  _$jscoverage['/base/tap.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['90'][1].init(103, 11, 'moreTouches');
function visit73_90_1(result) {
  _$jscoverage['/base/tap.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['77'][1].init(87, 68, 'Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit72_77_1(result) {
  _$jscoverage['/base/tap.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['76'][2].init(420, 68, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY');
function visit71_76_2(result) {
  _$jscoverage['/base/tap.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['76'][1].init(32, 156, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit70_76_1(result) {
  _$jscoverage['/base/tap.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['75'][1].init(385, 189, '!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit69_75_1(result) {
  _$jscoverage['/base/tap.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['68'][1].init(70, 23, '!(lastXY = self.lastXY)');
function visit68_68_1(result) {
  _$jscoverage['/base/tap.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['30'][1].init(142, 17, 'self.tapHoldTimer');
function visit67_30_1(result) {
  _$jscoverage['/base/tap.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].branchData['26'][1].init(13, 19, 'self.singleTapTimer');
function visit66_26_1(result) {
  _$jscoverage['/base/tap.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/tap.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/tap.js'].functionData[0]++;
  _$jscoverage['/base/tap.js'].lineData[7]++;
  var addGestureEvent = require('./add-event');
  _$jscoverage['/base/tap.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/base/tap.js'].lineData[9]++;
  var SingleTouch = require('./single-touch');
  _$jscoverage['/base/tap.js'].lineData[11]++;
  var SINGLE_TAP_EVENT = 'singleTap', DOUBLE_TAP_EVENT = 'doubleTap', TAP_HOLD_EVENT = 'tapHold', TAP_EVENT = 'tap', TAP_HOLD_DELAY = 1000, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  _$jscoverage['/base/tap.js'].lineData[21]++;
  function preventDefault(e) {
    _$jscoverage['/base/tap.js'].functionData[1]++;
    _$jscoverage['/base/tap.js'].lineData[22]++;
    e.preventDefault();
  }
  _$jscoverage['/base/tap.js'].lineData[25]++;
  function clearTimers(self) {
    _$jscoverage['/base/tap.js'].functionData[2]++;
    _$jscoverage['/base/tap.js'].lineData[26]++;
    if (visit66_26_1(self.singleTapTimer)) {
      _$jscoverage['/base/tap.js'].lineData[27]++;
      clearTimeout(self.singleTapTimer);
      _$jscoverage['/base/tap.js'].lineData[28]++;
      self.singleTapTimer = 0;
    }
    _$jscoverage['/base/tap.js'].lineData[30]++;
    if (visit67_30_1(self.tapHoldTimer)) {
      _$jscoverage['/base/tap.js'].lineData[31]++;
      clearTimeout(self.tapHoldTimer);
      _$jscoverage['/base/tap.js'].lineData[32]++;
      self.tapHoldTimer = 0;
    }
  }
  _$jscoverage['/base/tap.js'].lineData[36]++;
  function Tap() {
    _$jscoverage['/base/tap.js'].functionData[3]++;
    _$jscoverage['/base/tap.js'].lineData[37]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/base/tap.js'].lineData[40]++;
  S.extend(Tap, SingleTouch, {
  start: function(e) {
  _$jscoverage['/base/tap.js'].functionData[4]++;
  _$jscoverage['/base/tap.js'].lineData[42]++;
  var self = this;
  _$jscoverage['/base/tap.js'].lineData[43]++;
  Tap.superclass.start.call(self, e);
  _$jscoverage['/base/tap.js'].lineData[45]++;
  clearTimers(self);
  _$jscoverage['/base/tap.js'].lineData[47]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/base/tap.js'].lineData[49]++;
  self.tapHoldTimer = setTimeout(function() {
  _$jscoverage['/base/tap.js'].functionData[5]++;
  _$jscoverage['/base/tap.js'].lineData[50]++;
  var eventObj = S.mix({
  touch: currentTouch, 
  which: 1, 
  TAP_HOLD_DELAY: (S.now() - e.timeStamp) / 1000}, self.lastXY);
  _$jscoverage['/base/tap.js'].lineData[55]++;
  self.tapHoldTimer = 0;
  _$jscoverage['/base/tap.js'].lineData[56]++;
  self.lastXY = 0;
  _$jscoverage['/base/tap.js'].lineData[57]++;
  DomEvent.fire(currentTouch.target, TAP_HOLD_EVENT, eventObj);
}, TAP_HOLD_DELAY);
  _$jscoverage['/base/tap.js'].lineData[60]++;
  self.isStarted = true;
  _$jscoverage['/base/tap.js'].lineData[62]++;
  return undefined;
}, 
  move: function() {
  _$jscoverage['/base/tap.js'].functionData[6]++;
  _$jscoverage['/base/tap.js'].lineData[66]++;
  var self = this, lastXY;
  _$jscoverage['/base/tap.js'].lineData[68]++;
  if (visit68_68_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/base/tap.js'].lineData[69]++;
    return false;
  }
  _$jscoverage['/base/tap.js'].lineData[71]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/base/tap.js'].lineData[75]++;
  if (visit69_75_1(!currentTouch || visit70_76_1(visit71_76_2(Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY) || visit72_77_1(Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY)))) {
    _$jscoverage['/base/tap.js'].lineData[78]++;
    clearTimers(self);
    _$jscoverage['/base/tap.js'].lineData[79]++;
    return false;
  }
  _$jscoverage['/base/tap.js'].lineData[81]++;
  return undefined;
}, 
  end: function(e, moreTouches) {
  _$jscoverage['/base/tap.js'].functionData[7]++;
  _$jscoverage['/base/tap.js'].lineData[85]++;
  var self = this, lastXY;
  _$jscoverage['/base/tap.js'].lineData[88]++;
  clearTimers(self);
  _$jscoverage['/base/tap.js'].lineData[90]++;
  if (visit73_90_1(moreTouches)) {
    _$jscoverage['/base/tap.js'].lineData[91]++;
    return;
  }
  _$jscoverage['/base/tap.js'].lineData[95]++;
  if (visit74_95_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/base/tap.js'].lineData[96]++;
    return;
  }
  _$jscoverage['/base/tap.js'].lineData[99]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/base/tap.js'].lineData[100]++;
  var target = touch.target;
  _$jscoverage['/base/tap.js'].lineData[103]++;
  var eventObject = new DomEventObject(e.originalEvent);
  _$jscoverage['/base/tap.js'].lineData[105]++;
  S.mix(eventObject, {
  type: TAP_EVENT, 
  which: 1, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/base/tap.js'].lineData[114]++;
  eventObject.touch = touch;
  _$jscoverage['/base/tap.js'].lineData[115]++;
  DomEvent.fire(target, TAP_EVENT, eventObject);
  _$jscoverage['/base/tap.js'].lineData[118]++;
  if (visit75_118_1(eventObject.isDefaultPrevented() && S.UA.mobile)) {
    _$jscoverage['/base/tap.js'].lineData[119]++;
    if (visit76_119_1(S.UA.ios)) {
      _$jscoverage['/base/tap.js'].lineData[120]++;
      e.preventDefault();
    } else {
      _$jscoverage['/base/tap.js'].lineData[122]++;
      DomEvent.on(visit77_122_1(target.ownerDocument || target), 'click', {
  fn: preventDefault, 
  once: 1});
    }
  }
  _$jscoverage['/base/tap.js'].lineData[130]++;
  var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
  _$jscoverage['/base/tap.js'].lineData[133]++;
  self.lastEndTime = time;
  _$jscoverage['/base/tap.js'].lineData[135]++;
  if (visit78_135_1(lastEndTime)) {
    _$jscoverage['/base/tap.js'].lineData[137]++;
    duration = time - lastEndTime;
    _$jscoverage['/base/tap.js'].lineData[139]++;
    if (visit79_139_1(duration < SINGLE_TAP_DELAY)) {
      _$jscoverage['/base/tap.js'].lineData[141]++;
      self.lastEndTime = 0;
      _$jscoverage['/base/tap.js'].lineData[142]++;
      DomEvent.fire(target, DOUBLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
      _$jscoverage['/base/tap.js'].lineData[149]++;
      return;
    }
  }
  _$jscoverage['/base/tap.js'].lineData[156]++;
  duration = time - self.startTime;
  _$jscoverage['/base/tap.js'].lineData[157]++;
  if (visit80_157_1(duration > SINGLE_TAP_DELAY)) {
    _$jscoverage['/base/tap.js'].lineData[158]++;
    DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/base/tap.js'].lineData[168]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/base/tap.js'].functionData[8]++;
  _$jscoverage['/base/tap.js'].lineData[169]++;
  DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
}, SINGLE_TAP_DELAY);
  }
}});
  _$jscoverage['/base/tap.js'].lineData[181]++;
  addGestureEvent([TAP_EVENT, DOUBLE_TAP_EVENT, SINGLE_TAP_EVENT, TAP_HOLD_EVENT], {
  handle: new Tap()});
  _$jscoverage['/base/tap.js'].lineData[185]++;
  return {
  tap: TAP_EVENT, 
  TAP: TAP_EVENT, 
  singleTap: SINGLE_TAP_EVENT, 
  SINGLE_TAP: SINGLE_TAP_EVENT, 
  DOUBLE_TAP: DOUBLE_TAP_EVENT, 
  doubleTap: DOUBLE_TAP_EVENT, 
  TAP_HOLD: TAP_HOLD_EVENT};
});
