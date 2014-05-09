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
  _$jscoverage['/tap.js'].lineData[52] = 0;
  _$jscoverage['/tap.js'].lineData[62] = 0;
  _$jscoverage['/tap.js'].lineData[63] = 0;
  _$jscoverage['/tap.js'].lineData[66] = 0;
  _$jscoverage['/tap.js'].lineData[67] = 0;
  _$jscoverage['/tap.js'].lineData[68] = 0;
  _$jscoverage['/tap.js'].lineData[69] = 0;
  _$jscoverage['/tap.js'].lineData[71] = 0;
  _$jscoverage['/tap.js'].lineData[72] = 0;
  _$jscoverage['/tap.js'].lineData[73] = 0;
  _$jscoverage['/tap.js'].lineData[77] = 0;
  _$jscoverage['/tap.js'].lineData[78] = 0;
  _$jscoverage['/tap.js'].lineData[81] = 0;
  _$jscoverage['/tap.js'].lineData[83] = 0;
  _$jscoverage['/tap.js'].lineData[84] = 0;
  _$jscoverage['/tap.js'].lineData[86] = 0;
  _$jscoverage['/tap.js'].lineData[88] = 0;
  _$jscoverage['/tap.js'].lineData[90] = 0;
  _$jscoverage['/tap.js'].lineData[91] = 0;
  _$jscoverage['/tap.js'].lineData[95] = 0;
  _$jscoverage['/tap.js'].lineData[96] = 0;
  _$jscoverage['/tap.js'].lineData[97] = 0;
  _$jscoverage['/tap.js'].lineData[100] = 0;
  _$jscoverage['/tap.js'].lineData[102] = 0;
  _$jscoverage['/tap.js'].lineData[106] = 0;
  _$jscoverage['/tap.js'].lineData[108] = 0;
  _$jscoverage['/tap.js'].lineData[109] = 0;
  _$jscoverage['/tap.js'].lineData[111] = 0;
  _$jscoverage['/tap.js'].lineData[115] = 0;
  _$jscoverage['/tap.js'].lineData[118] = 0;
  _$jscoverage['/tap.js'].lineData[119] = 0;
  _$jscoverage['/tap.js'].lineData[121] = 0;
  _$jscoverage['/tap.js'].lineData[125] = 0;
  _$jscoverage['/tap.js'].lineData[128] = 0;
  _$jscoverage['/tap.js'].lineData[130] = 0;
  _$jscoverage['/tap.js'].lineData[131] = 0;
  _$jscoverage['/tap.js'].lineData[135] = 0;
  _$jscoverage['/tap.js'].lineData[136] = 0;
  _$jscoverage['/tap.js'].lineData[139] = 0;
  _$jscoverage['/tap.js'].lineData[140] = 0;
  _$jscoverage['/tap.js'].lineData[143] = 0;
  _$jscoverage['/tap.js'].lineData[145] = 0;
  _$jscoverage['/tap.js'].lineData[154] = 0;
  _$jscoverage['/tap.js'].lineData[157] = 0;
  _$jscoverage['/tap.js'].lineData[158] = 0;
  _$jscoverage['/tap.js'].lineData[159] = 0;
  _$jscoverage['/tap.js'].lineData[161] = 0;
  _$jscoverage['/tap.js'].lineData[169] = 0;
  _$jscoverage['/tap.js'].lineData[172] = 0;
  _$jscoverage['/tap.js'].lineData[174] = 0;
  _$jscoverage['/tap.js'].lineData[176] = 0;
  _$jscoverage['/tap.js'].lineData[178] = 0;
  _$jscoverage['/tap.js'].lineData[180] = 0;
  _$jscoverage['/tap.js'].lineData[181] = 0;
  _$jscoverage['/tap.js'].lineData[187] = 0;
  _$jscoverage['/tap.js'].lineData[194] = 0;
  _$jscoverage['/tap.js'].lineData[195] = 0;
  _$jscoverage['/tap.js'].lineData[196] = 0;
  _$jscoverage['/tap.js'].lineData[205] = 0;
  _$jscoverage['/tap.js'].lineData[206] = 0;
  _$jscoverage['/tap.js'].lineData[217] = 0;
  _$jscoverage['/tap.js'].lineData[221] = 0;
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
  _$jscoverage['/tap.js'].branchData['67'] = [];
  _$jscoverage['/tap.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['71'] = [];
  _$jscoverage['/tap.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['108'] = [];
  _$jscoverage['/tap.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['115'] = [];
  _$jscoverage['/tap.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['116'] = [];
  _$jscoverage['/tap.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/tap.js'].branchData['117'] = [];
  _$jscoverage['/tap.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['130'] = [];
  _$jscoverage['/tap.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['135'] = [];
  _$jscoverage['/tap.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['157'] = [];
  _$jscoverage['/tap.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['158'] = [];
  _$jscoverage['/tap.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['161'] = [];
  _$jscoverage['/tap.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['174'] = [];
  _$jscoverage['/tap.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['178'] = [];
  _$jscoverage['/tap.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/tap.js'].branchData['195'] = [];
  _$jscoverage['/tap.js'].branchData['195'][1] = new BranchData();
}
_$jscoverage['/tap.js'].branchData['195'][1].init(2326, 27, 'duration > SINGLE_TAP_DELAY');
function visit15_195_1(result) {
  _$jscoverage['/tap.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['178'][1].init(159, 27, 'duration < SINGLE_TAP_DELAY');
function visit14_178_1(result) {
  _$jscoverage['/tap.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['174'][1].init(1500, 11, 'lastEndTime');
function visit13_174_1(result) {
  _$jscoverage['/tap.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['161'][1].init(34, 30, 'target.ownerDocument || target');
function visit12_161_1(result) {
  _$jscoverage['/tap.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['158'][1].init(22, 6, 'UA.ios');
function visit11_158_1(result) {
  _$jscoverage['/tap.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['157'][1].init(893, 45, 'eventObject.isDefaultPrevented() && UA.mobile');
function visit10_157_1(result) {
  _$jscoverage['/tap.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['135'][1].init(213, 23, '!(lastXY = self.lastXY)');
function visit9_135_1(result) {
  _$jscoverage['/tap.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['130'][1].init(109, 11, 'moreTouches');
function visit8_130_1(result) {
  _$jscoverage['/tap.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['117'][1].init(88, 68, 'Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit7_117_1(result) {
  _$jscoverage['/tap.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['116'][2].init(431, 68, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY');
function visit6_116_2(result) {
  _$jscoverage['/tap.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['116'][1].init(33, 157, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit5_116_1(result) {
  _$jscoverage['/tap.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['115'][1].init(395, 191, '!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit4_115_1(result) {
  _$jscoverage['/tap.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['108'][1].init(73, 23, '!(lastXY = self.lastXY)');
function visit3_108_1(result) {
  _$jscoverage['/tap.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['71'][1].init(147, 17, 'self.tapHoldTimer');
function visit2_71_1(result) {
  _$jscoverage['/tap.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/tap.js'].branchData['67'][1].init(14, 19, 'self.singleTapTimer');
function visit1_67_1(result) {
  _$jscoverage['/tap.js'].branchData['67'][1].ranCondition(result);
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
  _$jscoverage['/tap.js'].lineData[52]++;
  var SINGLE_TAP = 'singleTap', DOUBLE_TAP = 'doubleTap', TAP_HOLD = 'tapHold', TAP = 'tap', TAP_HOLD_DELAY = 1000, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  _$jscoverage['/tap.js'].lineData[62]++;
  function preventDefault(e) {
    _$jscoverage['/tap.js'].functionData[1]++;
    _$jscoverage['/tap.js'].lineData[63]++;
    e.preventDefault();
  }
  _$jscoverage['/tap.js'].lineData[66]++;
  function clearTimers(self) {
    _$jscoverage['/tap.js'].functionData[2]++;
    _$jscoverage['/tap.js'].lineData[67]++;
    if (visit1_67_1(self.singleTapTimer)) {
      _$jscoverage['/tap.js'].lineData[68]++;
      clearTimeout(self.singleTapTimer);
      _$jscoverage['/tap.js'].lineData[69]++;
      self.singleTapTimer = 0;
    }
    _$jscoverage['/tap.js'].lineData[71]++;
    if (visit2_71_1(self.tapHoldTimer)) {
      _$jscoverage['/tap.js'].lineData[72]++;
      clearTimeout(self.tapHoldTimer);
      _$jscoverage['/tap.js'].lineData[73]++;
      self.tapHoldTimer = 0;
    }
  }
  _$jscoverage['/tap.js'].lineData[77]++;
  function Tap() {
    _$jscoverage['/tap.js'].functionData[3]++;
    _$jscoverage['/tap.js'].lineData[78]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/tap.js'].lineData[81]++;
  S.extend(Tap, SingleTouch, {
  start: function(e) {
  _$jscoverage['/tap.js'].functionData[4]++;
  _$jscoverage['/tap.js'].lineData[83]++;
  var self = this;
  _$jscoverage['/tap.js'].lineData[84]++;
  Tap.superclass.start.call(self, e);
  _$jscoverage['/tap.js'].lineData[86]++;
  clearTimers(self);
  _$jscoverage['/tap.js'].lineData[88]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/tap.js'].lineData[90]++;
  self.tapHoldTimer = setTimeout(function() {
  _$jscoverage['/tap.js'].functionData[5]++;
  _$jscoverage['/tap.js'].lineData[91]++;
  var eventObj = S.mix({
  which: 1, 
  duration: (S.now() - e.timeStamp) / 1000}, self.lastXY);
  _$jscoverage['/tap.js'].lineData[95]++;
  self.tapHoldTimer = 0;
  _$jscoverage['/tap.js'].lineData[96]++;
  self.lastXY = 0;
  _$jscoverage['/tap.js'].lineData[97]++;
  DomEvent.fire(currentTouch.target, TAP_HOLD, eventObj);
}, TAP_HOLD_DELAY);
  _$jscoverage['/tap.js'].lineData[100]++;
  self.isStarted = true;
  _$jscoverage['/tap.js'].lineData[102]++;
  return undefined;
}, 
  move: function() {
  _$jscoverage['/tap.js'].functionData[6]++;
  _$jscoverage['/tap.js'].lineData[106]++;
  var self = this, lastXY;
  _$jscoverage['/tap.js'].lineData[108]++;
  if (visit3_108_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/tap.js'].lineData[109]++;
    return false;
  }
  _$jscoverage['/tap.js'].lineData[111]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/tap.js'].lineData[115]++;
  if (visit4_115_1(!currentTouch || visit5_116_1(visit6_116_2(Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY) || visit7_117_1(Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY)))) {
    _$jscoverage['/tap.js'].lineData[118]++;
    clearTimers(self);
    _$jscoverage['/tap.js'].lineData[119]++;
    return false;
  }
  _$jscoverage['/tap.js'].lineData[121]++;
  return undefined;
}, 
  end: function(e, moreTouches) {
  _$jscoverage['/tap.js'].functionData[7]++;
  _$jscoverage['/tap.js'].lineData[125]++;
  var self = this, lastXY;
  _$jscoverage['/tap.js'].lineData[128]++;
  clearTimers(self);
  _$jscoverage['/tap.js'].lineData[130]++;
  if (visit8_130_1(moreTouches)) {
    _$jscoverage['/tap.js'].lineData[131]++;
    return;
  }
  _$jscoverage['/tap.js'].lineData[135]++;
  if (visit9_135_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/tap.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/tap.js'].lineData[139]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/tap.js'].lineData[140]++;
  var target = touch.target;
  _$jscoverage['/tap.js'].lineData[143]++;
  var eventObject = new DomEventObject(e.originalEvent);
  _$jscoverage['/tap.js'].lineData[145]++;
  S.mix(eventObject, {
  type: TAP, 
  which: 1, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/tap.js'].lineData[154]++;
  DomEvent.fire(target, TAP, eventObject);
  _$jscoverage['/tap.js'].lineData[157]++;
  if (visit10_157_1(eventObject.isDefaultPrevented() && UA.mobile)) {
    _$jscoverage['/tap.js'].lineData[158]++;
    if (visit11_158_1(UA.ios)) {
      _$jscoverage['/tap.js'].lineData[159]++;
      e.preventDefault();
    } else {
      _$jscoverage['/tap.js'].lineData[161]++;
      DomEvent.on(visit12_161_1(target.ownerDocument || target), 'click', {
  fn: preventDefault, 
  once: 1});
    }
  }
  _$jscoverage['/tap.js'].lineData[169]++;
  var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
  _$jscoverage['/tap.js'].lineData[172]++;
  self.lastEndTime = time;
  _$jscoverage['/tap.js'].lineData[174]++;
  if (visit13_174_1(lastEndTime)) {
    _$jscoverage['/tap.js'].lineData[176]++;
    duration = time - lastEndTime;
    _$jscoverage['/tap.js'].lineData[178]++;
    if (visit14_178_1(duration < SINGLE_TAP_DELAY)) {
      _$jscoverage['/tap.js'].lineData[180]++;
      self.lastEndTime = 0;
      _$jscoverage['/tap.js'].lineData[181]++;
      DomEvent.fire(target, DOUBLE_TAP, {
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
      _$jscoverage['/tap.js'].lineData[187]++;
      return;
    }
  }
  _$jscoverage['/tap.js'].lineData[194]++;
  duration = time - self.startTime;
  _$jscoverage['/tap.js'].lineData[195]++;
  if (visit15_195_1(duration > SINGLE_TAP_DELAY)) {
    _$jscoverage['/tap.js'].lineData[196]++;
    DomEvent.fire(target, SINGLE_TAP, {
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/tap.js'].lineData[205]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/tap.js'].functionData[8]++;
  _$jscoverage['/tap.js'].lineData[206]++;
  DomEvent.fire(target, SINGLE_TAP, {
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: (S.now() - self.startTime) / 1000});
}, SINGLE_TAP_DELAY);
  }
}});
  _$jscoverage['/tap.js'].lineData[217]++;
  addGestureEvent([TAP, DOUBLE_TAP, SINGLE_TAP, TAP_HOLD], {
  handle: new Tap()});
  _$jscoverage['/tap.js'].lineData[221]++;
  return {
  TAP: TAP, 
  SINGLE_TAP: SINGLE_TAP, 
  DOUBLE_TAP: DOUBLE_TAP, 
  TAP_HOLD: TAP_HOLD};
});
