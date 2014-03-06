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
if (! _$jscoverage['/touch/tap.js']) {
  _$jscoverage['/touch/tap.js'] = {};
  _$jscoverage['/touch/tap.js'].lineData = [];
  _$jscoverage['/touch/tap.js'].lineData[6] = 0;
  _$jscoverage['/touch/tap.js'].lineData[7] = 0;
  _$jscoverage['/touch/tap.js'].lineData[8] = 0;
  _$jscoverage['/touch/tap.js'].lineData[9] = 0;
  _$jscoverage['/touch/tap.js'].lineData[11] = 0;
  _$jscoverage['/touch/tap.js'].lineData[21] = 0;
  _$jscoverage['/touch/tap.js'].lineData[22] = 0;
  _$jscoverage['/touch/tap.js'].lineData[25] = 0;
  _$jscoverage['/touch/tap.js'].lineData[26] = 0;
  _$jscoverage['/touch/tap.js'].lineData[27] = 0;
  _$jscoverage['/touch/tap.js'].lineData[28] = 0;
  _$jscoverage['/touch/tap.js'].lineData[30] = 0;
  _$jscoverage['/touch/tap.js'].lineData[31] = 0;
  _$jscoverage['/touch/tap.js'].lineData[32] = 0;
  _$jscoverage['/touch/tap.js'].lineData[36] = 0;
  _$jscoverage['/touch/tap.js'].lineData[37] = 0;
  _$jscoverage['/touch/tap.js'].lineData[40] = 0;
  _$jscoverage['/touch/tap.js'].lineData[42] = 0;
  _$jscoverage['/touch/tap.js'].lineData[43] = 0;
  _$jscoverage['/touch/tap.js'].lineData[45] = 0;
  _$jscoverage['/touch/tap.js'].lineData[47] = 0;
  _$jscoverage['/touch/tap.js'].lineData[49] = 0;
  _$jscoverage['/touch/tap.js'].lineData[50] = 0;
  _$jscoverage['/touch/tap.js'].lineData[55] = 0;
  _$jscoverage['/touch/tap.js'].lineData[56] = 0;
  _$jscoverage['/touch/tap.js'].lineData[57] = 0;
  _$jscoverage['/touch/tap.js'].lineData[60] = 0;
  _$jscoverage['/touch/tap.js'].lineData[62] = 0;
  _$jscoverage['/touch/tap.js'].lineData[65] = 0;
  _$jscoverage['/touch/tap.js'].lineData[67] = 0;
  _$jscoverage['/touch/tap.js'].lineData[68] = 0;
  _$jscoverage['/touch/tap.js'].lineData[70] = 0;
  _$jscoverage['/touch/tap.js'].lineData[74] = 0;
  _$jscoverage['/touch/tap.js'].lineData[77] = 0;
  _$jscoverage['/touch/tap.js'].lineData[78] = 0;
  _$jscoverage['/touch/tap.js'].lineData[80] = 0;
  _$jscoverage['/touch/tap.js'].lineData[84] = 0;
  _$jscoverage['/touch/tap.js'].lineData[87] = 0;
  _$jscoverage['/touch/tap.js'].lineData[89] = 0;
  _$jscoverage['/touch/tap.js'].lineData[90] = 0;
  _$jscoverage['/touch/tap.js'].lineData[94] = 0;
  _$jscoverage['/touch/tap.js'].lineData[95] = 0;
  _$jscoverage['/touch/tap.js'].lineData[98] = 0;
  _$jscoverage['/touch/tap.js'].lineData[99] = 0;
  _$jscoverage['/touch/tap.js'].lineData[102] = 0;
  _$jscoverage['/touch/tap.js'].lineData[104] = 0;
  _$jscoverage['/touch/tap.js'].lineData[113] = 0;
  _$jscoverage['/touch/tap.js'].lineData[114] = 0;
  _$jscoverage['/touch/tap.js'].lineData[117] = 0;
  _$jscoverage['/touch/tap.js'].lineData[118] = 0;
  _$jscoverage['/touch/tap.js'].lineData[119] = 0;
  _$jscoverage['/touch/tap.js'].lineData[121] = 0;
  _$jscoverage['/touch/tap.js'].lineData[129] = 0;
  _$jscoverage['/touch/tap.js'].lineData[132] = 0;
  _$jscoverage['/touch/tap.js'].lineData[134] = 0;
  _$jscoverage['/touch/tap.js'].lineData[136] = 0;
  _$jscoverage['/touch/tap.js'].lineData[138] = 0;
  _$jscoverage['/touch/tap.js'].lineData[140] = 0;
  _$jscoverage['/touch/tap.js'].lineData[141] = 0;
  _$jscoverage['/touch/tap.js'].lineData[148] = 0;
  _$jscoverage['/touch/tap.js'].lineData[155] = 0;
  _$jscoverage['/touch/tap.js'].lineData[156] = 0;
  _$jscoverage['/touch/tap.js'].lineData[157] = 0;
  _$jscoverage['/touch/tap.js'].lineData[167] = 0;
  _$jscoverage['/touch/tap.js'].lineData[168] = 0;
  _$jscoverage['/touch/tap.js'].lineData[180] = 0;
  _$jscoverage['/touch/tap.js'].lineData[184] = 0;
}
if (! _$jscoverage['/touch/tap.js'].functionData) {
  _$jscoverage['/touch/tap.js'].functionData = [];
  _$jscoverage['/touch/tap.js'].functionData[0] = 0;
  _$jscoverage['/touch/tap.js'].functionData[1] = 0;
  _$jscoverage['/touch/tap.js'].functionData[2] = 0;
  _$jscoverage['/touch/tap.js'].functionData[3] = 0;
  _$jscoverage['/touch/tap.js'].functionData[4] = 0;
  _$jscoverage['/touch/tap.js'].functionData[5] = 0;
  _$jscoverage['/touch/tap.js'].functionData[6] = 0;
  _$jscoverage['/touch/tap.js'].functionData[7] = 0;
  _$jscoverage['/touch/tap.js'].functionData[8] = 0;
}
if (! _$jscoverage['/touch/tap.js'].branchData) {
  _$jscoverage['/touch/tap.js'].branchData = {};
  _$jscoverage['/touch/tap.js'].branchData['26'] = [];
  _$jscoverage['/touch/tap.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['30'] = [];
  _$jscoverage['/touch/tap.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['67'] = [];
  _$jscoverage['/touch/tap.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['74'] = [];
  _$jscoverage['/touch/tap.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['75'] = [];
  _$jscoverage['/touch/tap.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['76'] = [];
  _$jscoverage['/touch/tap.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['89'] = [];
  _$jscoverage['/touch/tap.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['94'] = [];
  _$jscoverage['/touch/tap.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['117'] = [];
  _$jscoverage['/touch/tap.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['118'] = [];
  _$jscoverage['/touch/tap.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['121'] = [];
  _$jscoverage['/touch/tap.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['134'] = [];
  _$jscoverage['/touch/tap.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['138'] = [];
  _$jscoverage['/touch/tap.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['156'] = [];
  _$jscoverage['/touch/tap.js'].branchData['156'][1] = new BranchData();
}
_$jscoverage['/touch/tap.js'].branchData['156'][1].init(2354, 27, 'duration > SINGLE_TAP_DELAY');
function visit114_156_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['138'][1].init(155, 27, 'duration < SINGLE_TAP_DELAY');
function visit113_138_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['134'][1].init(1505, 11, 'lastEndTime');
function visit112_134_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['121'][1].init(33, 30, 'target.ownerDocument || target');
function visit111_121_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['118'][1].init(21, 8, 'S.UA.ios');
function visit110_118_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['117'][1].init(911, 47, 'eventObject.isDefaultPrevented() && S.UA.mobile');
function visit109_117_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['94'][1].init(202, 23, '!(lastXY = self.lastXY)');
function visit108_94_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['89'][1].init(103, 11, 'moreTouches');
function visit107_89_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['76'][1].init(87, 68, 'Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit106_76_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['75'][2].init(420, 68, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY');
function visit105_75_2(result) {
  _$jscoverage['/touch/tap.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['75'][1].init(32, 156, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit104_75_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['74'][1].init(385, 189, '!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit103_74_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['67'][1].init(70, 23, '!(lastXY = self.lastXY)');
function visit102_67_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['30'][1].init(142, 17, 'self.tapHoldTimer');
function visit101_30_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['26'][1].init(13, 19, 'self.singleTapTimer');
function visit100_26_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/tap.js'].functionData[0]++;
  _$jscoverage['/touch/tap.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/tap.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/tap.js'].lineData[9]++;
  var SingleTouch = require('./single-touch');
  _$jscoverage['/touch/tap.js'].lineData[11]++;
  var SINGLE_TAP_EVENT = 'singleTap', DOUBLE_TAP_EVENT = 'doubleTap', TAP_HOLD_EVENT = 'tapHold', TAP_EVENT = 'tap', TAP_HOLD_DELAY = 1000, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  _$jscoverage['/touch/tap.js'].lineData[21]++;
  function preventDefault(e) {
    _$jscoverage['/touch/tap.js'].functionData[1]++;
    _$jscoverage['/touch/tap.js'].lineData[22]++;
    e.preventDefault();
  }
  _$jscoverage['/touch/tap.js'].lineData[25]++;
  function clearTimers(self) {
    _$jscoverage['/touch/tap.js'].functionData[2]++;
    _$jscoverage['/touch/tap.js'].lineData[26]++;
    if (visit100_26_1(self.singleTapTimer)) {
      _$jscoverage['/touch/tap.js'].lineData[27]++;
      clearTimeout(self.singleTapTimer);
      _$jscoverage['/touch/tap.js'].lineData[28]++;
      self.singleTapTimer = 0;
    }
    _$jscoverage['/touch/tap.js'].lineData[30]++;
    if (visit101_30_1(self.tapHoldTimer)) {
      _$jscoverage['/touch/tap.js'].lineData[31]++;
      clearTimeout(self.tapHoldTimer);
      _$jscoverage['/touch/tap.js'].lineData[32]++;
      self.tapHoldTimer = 0;
    }
  }
  _$jscoverage['/touch/tap.js'].lineData[36]++;
  function Tap() {
    _$jscoverage['/touch/tap.js'].functionData[3]++;
    _$jscoverage['/touch/tap.js'].lineData[37]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/touch/tap.js'].lineData[40]++;
  S.extend(Tap, SingleTouch, {
  start: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[4]++;
  _$jscoverage['/touch/tap.js'].lineData[42]++;
  var self = this;
  _$jscoverage['/touch/tap.js'].lineData[43]++;
  Tap.superclass.start.call(self, e);
  _$jscoverage['/touch/tap.js'].lineData[45]++;
  clearTimers(self);
  _$jscoverage['/touch/tap.js'].lineData[47]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[49]++;
  self.tapHoldTimer = setTimeout(function() {
  _$jscoverage['/touch/tap.js'].functionData[5]++;
  _$jscoverage['/touch/tap.js'].lineData[50]++;
  var eventObj = S.mix({
  touch: currentTouch, 
  which: 1, 
  TAP_HOLD_DELAY: (S.now() - e.timeStamp) / 1000}, self.lastXY);
  _$jscoverage['/touch/tap.js'].lineData[55]++;
  self.tapHoldTimer = 0;
  _$jscoverage['/touch/tap.js'].lineData[56]++;
  self.lastXY = 0;
  _$jscoverage['/touch/tap.js'].lineData[57]++;
  DomEvent.fire(currentTouch.target, TAP_HOLD_EVENT, eventObj);
}, TAP_HOLD_DELAY);
  _$jscoverage['/touch/tap.js'].lineData[60]++;
  self.isStarted = true;
  _$jscoverage['/touch/tap.js'].lineData[62]++;
  return undefined;
}, 
  move: function() {
  _$jscoverage['/touch/tap.js'].functionData[6]++;
  _$jscoverage['/touch/tap.js'].lineData[65]++;
  var self = this, lastXY;
  _$jscoverage['/touch/tap.js'].lineData[67]++;
  if (visit102_67_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/touch/tap.js'].lineData[68]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[70]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[74]++;
  if (visit103_74_1(!currentTouch || visit104_75_1(visit105_75_2(Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY) || visit106_76_1(Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY)))) {
    _$jscoverage['/touch/tap.js'].lineData[77]++;
    clearTimers(self);
    _$jscoverage['/touch/tap.js'].lineData[78]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[80]++;
  return undefined;
}, 
  end: function(e, moreTouches) {
  _$jscoverage['/touch/tap.js'].functionData[7]++;
  _$jscoverage['/touch/tap.js'].lineData[84]++;
  var self = this, lastXY;
  _$jscoverage['/touch/tap.js'].lineData[87]++;
  clearTimers(self);
  _$jscoverage['/touch/tap.js'].lineData[89]++;
  if (visit107_89_1(moreTouches)) {
    _$jscoverage['/touch/tap.js'].lineData[90]++;
    return;
  }
  _$jscoverage['/touch/tap.js'].lineData[94]++;
  if (visit108_94_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/touch/tap.js'].lineData[95]++;
    return;
  }
  _$jscoverage['/touch/tap.js'].lineData[98]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[99]++;
  var target = touch.target;
  _$jscoverage['/touch/tap.js'].lineData[102]++;
  var eventObject = new DomEventObject(e.originalEvent);
  _$jscoverage['/touch/tap.js'].lineData[104]++;
  S.mix(eventObject, {
  type: TAP_EVENT, 
  which: 1, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/touch/tap.js'].lineData[113]++;
  eventObject.touch = touch;
  _$jscoverage['/touch/tap.js'].lineData[114]++;
  DomEvent.fire(target, TAP_EVENT, eventObject);
  _$jscoverage['/touch/tap.js'].lineData[117]++;
  if (visit109_117_1(eventObject.isDefaultPrevented() && S.UA.mobile)) {
    _$jscoverage['/touch/tap.js'].lineData[118]++;
    if (visit110_118_1(S.UA.ios)) {
      _$jscoverage['/touch/tap.js'].lineData[119]++;
      e.preventDefault();
    } else {
      _$jscoverage['/touch/tap.js'].lineData[121]++;
      DomEvent.on(visit111_121_1(target.ownerDocument || target), 'click', {
  fn: preventDefault, 
  once: 1});
    }
  }
  _$jscoverage['/touch/tap.js'].lineData[129]++;
  var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
  _$jscoverage['/touch/tap.js'].lineData[132]++;
  self.lastEndTime = time;
  _$jscoverage['/touch/tap.js'].lineData[134]++;
  if (visit112_134_1(lastEndTime)) {
    _$jscoverage['/touch/tap.js'].lineData[136]++;
    duration = time - lastEndTime;
    _$jscoverage['/touch/tap.js'].lineData[138]++;
    if (visit113_138_1(duration < SINGLE_TAP_DELAY)) {
      _$jscoverage['/touch/tap.js'].lineData[140]++;
      self.lastEndTime = 0;
      _$jscoverage['/touch/tap.js'].lineData[141]++;
      DomEvent.fire(target, DOUBLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
      _$jscoverage['/touch/tap.js'].lineData[148]++;
      return;
    }
  }
  _$jscoverage['/touch/tap.js'].lineData[155]++;
  duration = time - self.startTime;
  _$jscoverage['/touch/tap.js'].lineData[156]++;
  if (visit114_156_1(duration > SINGLE_TAP_DELAY)) {
    _$jscoverage['/touch/tap.js'].lineData[157]++;
    DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/touch/tap.js'].lineData[167]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/touch/tap.js'].functionData[8]++;
  _$jscoverage['/touch/tap.js'].lineData[168]++;
  DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
}, SINGLE_TAP_DELAY);
  }
}});
  _$jscoverage['/touch/tap.js'].lineData[180]++;
  eventHandleMap[TAP_EVENT] = eventHandleMap[DOUBLE_TAP_EVENT] = eventHandleMap[SINGLE_TAP_EVENT] = eventHandleMap[TAP_HOLD_EVENT] = {
  handle: new Tap()};
  _$jscoverage['/touch/tap.js'].lineData[184]++;
  return Tap;
});
