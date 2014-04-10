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
if (! _$jscoverage['/tap.js']) {
  _$jscoverage['/tap.js'] = {};
  _$jscoverage['/tap.js'].lineData = [];
  _$jscoverage['/tap.js'].lineData[6] = 0;
  _$jscoverage['/tap.js'].lineData[7] = 0;
  _$jscoverage['/tap.js'].lineData[8] = 0;
  _$jscoverage['/tap.js'].lineData[9] = 0;
  _$jscoverage['/tap.js'].lineData[10] = 0;
  _$jscoverage['/tap.js'].lineData[11] = 0;
  _$jscoverage['/tap.js'].lineData[12] = 0;
  _$jscoverage['/tap.js'].lineData[22] = 0;
  _$jscoverage['/tap.js'].lineData[23] = 0;
  _$jscoverage['/tap.js'].lineData[26] = 0;
  _$jscoverage['/tap.js'].lineData[27] = 0;
  _$jscoverage['/tap.js'].lineData[28] = 0;
  _$jscoverage['/tap.js'].lineData[29] = 0;
  _$jscoverage['/tap.js'].lineData[31] = 0;
  _$jscoverage['/tap.js'].lineData[32] = 0;
  _$jscoverage['/tap.js'].lineData[33] = 0;
  _$jscoverage['/tap.js'].lineData[37] = 0;
  _$jscoverage['/tap.js'].lineData[38] = 0;
  _$jscoverage['/tap.js'].lineData[41] = 0;
  _$jscoverage['/tap.js'].lineData[43] = 0;
  _$jscoverage['/tap.js'].lineData[44] = 0;
  _$jscoverage['/tap.js'].lineData[46] = 0;
  _$jscoverage['/tap.js'].lineData[48] = 0;
  _$jscoverage['/tap.js'].lineData[50] = 0;
  _$jscoverage['/tap.js'].lineData[51] = 0;
  _$jscoverage['/tap.js'].lineData[56] = 0;
  _$jscoverage['/tap.js'].lineData[57] = 0;
  _$jscoverage['/tap.js'].lineData[58] = 0;
  _$jscoverage['/tap.js'].lineData[61] = 0;
  _$jscoverage['/tap.js'].lineData[63] = 0;
  _$jscoverage['/tap.js'].lineData[67] = 0;
  _$jscoverage['/tap.js'].lineData[69] = 0;
  _$jscoverage['/tap.js'].lineData[70] = 0;
  _$jscoverage['/tap.js'].lineData[72] = 0;
  _$jscoverage['/tap.js'].lineData[76] = 0;
  _$jscoverage['/tap.js'].lineData[79] = 0;
  _$jscoverage['/tap.js'].lineData[80] = 0;
  _$jscoverage['/tap.js'].lineData[82] = 0;
  _$jscoverage['/tap.js'].lineData[86] = 0;
  _$jscoverage['/tap.js'].lineData[89] = 0;
  _$jscoverage['/tap.js'].lineData[91] = 0;
  _$jscoverage['/tap.js'].lineData[92] = 0;
  _$jscoverage['/tap.js'].lineData[96] = 0;
  _$jscoverage['/tap.js'].lineData[97] = 0;
  _$jscoverage['/tap.js'].lineData[100] = 0;
  _$jscoverage['/tap.js'].lineData[101] = 0;
  _$jscoverage['/tap.js'].lineData[104] = 0;
  _$jscoverage['/tap.js'].lineData[106] = 0;
  _$jscoverage['/tap.js'].lineData[115] = 0;
  _$jscoverage['/tap.js'].lineData[116] = 0;
  _$jscoverage['/tap.js'].lineData[119] = 0;
  _$jscoverage['/tap.js'].lineData[120] = 0;
  _$jscoverage['/tap.js'].lineData[121] = 0;
  _$jscoverage['/tap.js'].lineData[123] = 0;
  _$jscoverage['/tap.js'].lineData[131] = 0;
  _$jscoverage['/tap.js'].lineData[134] = 0;
  _$jscoverage['/tap.js'].lineData[136] = 0;
  _$jscoverage['/tap.js'].lineData[138] = 0;
  _$jscoverage['/tap.js'].lineData[140] = 0;
  _$jscoverage['/tap.js'].lineData[142] = 0;
  _$jscoverage['/tap.js'].lineData[143] = 0;
  _$jscoverage['/tap.js'].lineData[150] = 0;
  _$jscoverage['/tap.js'].lineData[157] = 0;
  _$jscoverage['/tap.js'].lineData[158] = 0;
  _$jscoverage['/tap.js'].lineData[159] = 0;
  _$jscoverage['/tap.js'].lineData[169] = 0;
  _$jscoverage['/tap.js'].lineData[170] = 0;
  _$jscoverage['/tap.js'].lineData[182] = 0;
  _$jscoverage['/tap.js'].lineData[186] = 0;
}
if (! _$jscoverage['/tap.js'].functionData) {
  _$jscoverage['/tap.js'].functionData = [];
  _$jscoverage['/tap.js'].functionData[0] = 0;
  _$jscoverage['/tap.js'].functionData[1] = 0;
  _$jscoverage['/tap.js'].functionData[2] = 0;
  _$jscoverage['/tap.js'].functionData[3] = 0;
  _$jscoverage['/tap.js'].functionData[4] = 0;
  _$jscoverage['/tap.js'].functionData[5] = 0;
  _$jscoverage['/tap.js'].functionData[6] = 0;
  _$jscoverage['/tap.js'].functionData[7] = 0;
  _$jscoverage['/tap.js'].functionData[8] = 0;
}
if (! _$jscoverage['/tap.js'].branchData) {
  _$jscoverage['/tap.js'].branchData = {};
  _$jscoverage['/tap.js'].branchData['27'] = [];
  _$jscoverage['/tap.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['31'] = [];
  _$jscoverage['/tap.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['69'] = [];
  _$jscoverage['/tap.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['76'] = [];
  _$jscoverage['/tap.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['77'] = [];
  _$jscoverage['/tap.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/tap.js'].branchData['78'] = [];
  _$jscoverage['/tap.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['91'] = [];
  _$jscoverage['/tap.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['96'] = [];
  _$jscoverage['/tap.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['119'] = [];
  _$jscoverage['/tap.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['120'] = [];
  _$jscoverage['/tap.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['123'] = [];
  _$jscoverage['/tap.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['136'] = [];
  _$jscoverage['/tap.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['140'] = [];
  _$jscoverage['/tap.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['158'] = [];
  _$jscoverage['/tap.js'].branchData['158'][1] = new BranchData();
}
_$jscoverage['/tap.js'].branchData['158'][1].init(2350, 27, 'duration > SINGLE_TAP_DELAY');
function visit15_158_1(result) {
  _$jscoverage['/tap.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['140'][1].init(155, 27, 'duration < SINGLE_TAP_DELAY');
function visit14_140_1(result) {
  _$jscoverage['/tap.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['136'][1].init(1501, 11, 'lastEndTime');
function visit13_136_1(result) {
  _$jscoverage['/tap.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['123'][1].init(33, 30, 'target.ownerDocument || target');
function visit12_123_1(result) {
  _$jscoverage['/tap.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['120'][1].init(21, 6, 'UA.ios');
function visit11_120_1(result) {
  _$jscoverage['/tap.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['119'][1].init(911, 45, 'eventObject.isDefaultPrevented() && UA.mobile');
function visit10_119_1(result) {
  _$jscoverage['/tap.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['96'][1].init(202, 23, '!(lastXY = self.lastXY)');
function visit9_96_1(result) {
  _$jscoverage['/tap.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['91'][1].init(103, 11, 'moreTouches');
function visit8_91_1(result) {
  _$jscoverage['/tap.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['78'][1].init(87, 68, 'Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit7_78_1(result) {
  _$jscoverage['/tap.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['77'][2].init(420, 68, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY');
function visit6_77_2(result) {
  _$jscoverage['/tap.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['77'][1].init(32, 156, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit5_77_1(result) {
  _$jscoverage['/tap.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['76'][1].init(385, 189, '!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit4_76_1(result) {
  _$jscoverage['/tap.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['69'][1].init(70, 23, '!(lastXY = self.lastXY)');
function visit3_69_1(result) {
  _$jscoverage['/tap.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['31'][1].init(142, 17, 'self.tapHoldTimer');
function visit2_31_1(result) {
  _$jscoverage['/tap.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['27'][1].init(13, 19, 'self.singleTapTimer');
function visit1_27_1(result) {
  _$jscoverage['/tap.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tap.js'].functionData[0]++;
  _$jscoverage['/tap.js'].lineData[7]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/tap.js'].lineData[8]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/tap.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/tap.js'].lineData[10]++;
  var SingleTouch = GestureUtil.SingleTouch;
  _$jscoverage['/tap.js'].lineData[11]++;
  var UA = require('ua');
  _$jscoverage['/tap.js'].lineData[12]++;
  var SINGLE_TAP_EVENT = 'singleTap', DOUBLE_TAP_EVENT = 'doubleTap', TAP_HOLD_EVENT = 'tapHold', TAP_EVENT = 'tap', TAP_HOLD_DELAY = 1000, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  _$jscoverage['/tap.js'].lineData[22]++;
  function preventDefault(e) {
    _$jscoverage['/tap.js'].functionData[1]++;
    _$jscoverage['/tap.js'].lineData[23]++;
    e.preventDefault();
  }
  _$jscoverage['/tap.js'].lineData[26]++;
  function clearTimers(self) {
    _$jscoverage['/tap.js'].functionData[2]++;
    _$jscoverage['/tap.js'].lineData[27]++;
    if (visit1_27_1(self.singleTapTimer)) {
      _$jscoverage['/tap.js'].lineData[28]++;
      clearTimeout(self.singleTapTimer);
      _$jscoverage['/tap.js'].lineData[29]++;
      self.singleTapTimer = 0;
    }
    _$jscoverage['/tap.js'].lineData[31]++;
    if (visit2_31_1(self.tapHoldTimer)) {
      _$jscoverage['/tap.js'].lineData[32]++;
      clearTimeout(self.tapHoldTimer);
      _$jscoverage['/tap.js'].lineData[33]++;
      self.tapHoldTimer = 0;
    }
  }
  _$jscoverage['/tap.js'].lineData[37]++;
  function Tap() {
    _$jscoverage['/tap.js'].functionData[3]++;
    _$jscoverage['/tap.js'].lineData[38]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/tap.js'].lineData[41]++;
  S.extend(Tap, SingleTouch, {
  start: function(e) {
  _$jscoverage['/tap.js'].functionData[4]++;
  _$jscoverage['/tap.js'].lineData[43]++;
  var self = this;
  _$jscoverage['/tap.js'].lineData[44]++;
  Tap.superclass.start.call(self, e);
  _$jscoverage['/tap.js'].lineData[46]++;
  clearTimers(self);
  _$jscoverage['/tap.js'].lineData[48]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/tap.js'].lineData[50]++;
  self.tapHoldTimer = setTimeout(function() {
  _$jscoverage['/tap.js'].functionData[5]++;
  _$jscoverage['/tap.js'].lineData[51]++;
  var eventObj = S.mix({
  touch: currentTouch, 
  which: 1, 
  TAP_HOLD_DELAY: (S.now() - e.timeStamp) / 1000}, self.lastXY);
  _$jscoverage['/tap.js'].lineData[56]++;
  self.tapHoldTimer = 0;
  _$jscoverage['/tap.js'].lineData[57]++;
  self.lastXY = 0;
  _$jscoverage['/tap.js'].lineData[58]++;
  DomEvent.fire(currentTouch.target, TAP_HOLD_EVENT, eventObj);
}, TAP_HOLD_DELAY);
  _$jscoverage['/tap.js'].lineData[61]++;
  self.isStarted = true;
  _$jscoverage['/tap.js'].lineData[63]++;
  return undefined;
}, 
  move: function() {
  _$jscoverage['/tap.js'].functionData[6]++;
  _$jscoverage['/tap.js'].lineData[67]++;
  var self = this, lastXY;
  _$jscoverage['/tap.js'].lineData[69]++;
  if (visit3_69_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/tap.js'].lineData[70]++;
    return false;
  }
  _$jscoverage['/tap.js'].lineData[72]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/tap.js'].lineData[76]++;
  if (visit4_76_1(!currentTouch || visit5_77_1(visit6_77_2(Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY) || visit7_78_1(Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY)))) {
    _$jscoverage['/tap.js'].lineData[79]++;
    clearTimers(self);
    _$jscoverage['/tap.js'].lineData[80]++;
    return false;
  }
  _$jscoverage['/tap.js'].lineData[82]++;
  return undefined;
}, 
  end: function(e, moreTouches) {
  _$jscoverage['/tap.js'].functionData[7]++;
  _$jscoverage['/tap.js'].lineData[86]++;
  var self = this, lastXY;
  _$jscoverage['/tap.js'].lineData[89]++;
  clearTimers(self);
  _$jscoverage['/tap.js'].lineData[91]++;
  if (visit8_91_1(moreTouches)) {
    _$jscoverage['/tap.js'].lineData[92]++;
    return;
  }
  _$jscoverage['/tap.js'].lineData[96]++;
  if (visit9_96_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/tap.js'].lineData[97]++;
    return;
  }
  _$jscoverage['/tap.js'].lineData[100]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/tap.js'].lineData[101]++;
  var target = touch.target;
  _$jscoverage['/tap.js'].lineData[104]++;
  var eventObject = new DomEventObject(e.originalEvent);
  _$jscoverage['/tap.js'].lineData[106]++;
  S.mix(eventObject, {
  type: TAP_EVENT, 
  which: 1, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/tap.js'].lineData[115]++;
  eventObject.touch = touch;
  _$jscoverage['/tap.js'].lineData[116]++;
  DomEvent.fire(target, TAP_EVENT, eventObject);
  _$jscoverage['/tap.js'].lineData[119]++;
  if (visit10_119_1(eventObject.isDefaultPrevented() && UA.mobile)) {
    _$jscoverage['/tap.js'].lineData[120]++;
    if (visit11_120_1(UA.ios)) {
      _$jscoverage['/tap.js'].lineData[121]++;
      e.preventDefault();
    } else {
      _$jscoverage['/tap.js'].lineData[123]++;
      DomEvent.on(visit12_123_1(target.ownerDocument || target), 'click', {
  fn: preventDefault, 
  once: 1});
    }
  }
  _$jscoverage['/tap.js'].lineData[131]++;
  var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
  _$jscoverage['/tap.js'].lineData[134]++;
  self.lastEndTime = time;
  _$jscoverage['/tap.js'].lineData[136]++;
  if (visit13_136_1(lastEndTime)) {
    _$jscoverage['/tap.js'].lineData[138]++;
    duration = time - lastEndTime;
    _$jscoverage['/tap.js'].lineData[140]++;
    if (visit14_140_1(duration < SINGLE_TAP_DELAY)) {
      _$jscoverage['/tap.js'].lineData[142]++;
      self.lastEndTime = 0;
      _$jscoverage['/tap.js'].lineData[143]++;
      DomEvent.fire(target, DOUBLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
      _$jscoverage['/tap.js'].lineData[150]++;
      return;
    }
  }
  _$jscoverage['/tap.js'].lineData[157]++;
  duration = time - self.startTime;
  _$jscoverage['/tap.js'].lineData[158]++;
  if (visit15_158_1(duration > SINGLE_TAP_DELAY)) {
    _$jscoverage['/tap.js'].lineData[159]++;
    DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/tap.js'].lineData[169]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/tap.js'].functionData[8]++;
  _$jscoverage['/tap.js'].lineData[170]++;
  DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
}, SINGLE_TAP_DELAY);
  }
}});
  _$jscoverage['/tap.js'].lineData[182]++;
  addGestureEvent([TAP_EVENT, DOUBLE_TAP_EVENT, SINGLE_TAP_EVENT, TAP_HOLD_EVENT], {
  handle: new Tap()});
  _$jscoverage['/tap.js'].lineData[186]++;
  return {
  TAP: TAP_EVENT, 
  SINGLE_TAP: SINGLE_TAP_EVENT, 
  DOUBLE_TAP: DOUBLE_TAP_EVENT, 
  TAP_HOLD: TAP_HOLD_EVENT};
});
