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
  _$jscoverage['/touch/tap.js'].lineData[12] = 0;
  _$jscoverage['/touch/tap.js'].lineData[15] = 0;
  _$jscoverage['/touch/tap.js'].lineData[25] = 0;
  _$jscoverage['/touch/tap.js'].lineData[26] = 0;
  _$jscoverage['/touch/tap.js'].lineData[29] = 0;
  _$jscoverage['/touch/tap.js'].lineData[31] = 0;
  _$jscoverage['/touch/tap.js'].lineData[32] = 0;
  _$jscoverage['/touch/tap.js'].lineData[33] = 0;
  _$jscoverage['/touch/tap.js'].lineData[37] = 0;
  _$jscoverage['/touch/tap.js'].lineData[38] = 0;
  _$jscoverage['/touch/tap.js'].lineData[40] = 0;
  _$jscoverage['/touch/tap.js'].lineData[41] = 0;
  _$jscoverage['/touch/tap.js'].lineData[46] = 0;
  _$jscoverage['/touch/tap.js'].lineData[47] = 0;
  _$jscoverage['/touch/tap.js'].lineData[48] = 0;
  _$jscoverage['/touch/tap.js'].lineData[52] = 0;
  _$jscoverage['/touch/tap.js'].lineData[53] = 0;
  _$jscoverage['/touch/tap.js'].lineData[54] = 0;
  _$jscoverage['/touch/tap.js'].lineData[55] = 0;
  _$jscoverage['/touch/tap.js'].lineData[58] = 0;
  _$jscoverage['/touch/tap.js'].lineData[61] = 0;
  _$jscoverage['/touch/tap.js'].lineData[62] = 0;
  _$jscoverage['/touch/tap.js'].lineData[63] = 0;
  _$jscoverage['/touch/tap.js'].lineData[65] = 0;
  _$jscoverage['/touch/tap.js'].lineData[69] = 0;
  _$jscoverage['/touch/tap.js'].lineData[72] = 0;
  _$jscoverage['/touch/tap.js'].lineData[74] = 0;
  _$jscoverage['/touch/tap.js'].lineData[78] = 0;
  _$jscoverage['/touch/tap.js'].lineData[80] = 0;
  _$jscoverage['/touch/tap.js'].lineData[81] = 0;
  _$jscoverage['/touch/tap.js'].lineData[83] = 0;
  _$jscoverage['/touch/tap.js'].lineData[84] = 0;
  _$jscoverage['/touch/tap.js'].lineData[87] = 0;
  _$jscoverage['/touch/tap.js'].lineData[88] = 0;
  _$jscoverage['/touch/tap.js'].lineData[89] = 0;
  _$jscoverage['/touch/tap.js'].lineData[93] = 0;
  _$jscoverage['/touch/tap.js'].lineData[101] = 0;
  _$jscoverage['/touch/tap.js'].lineData[103] = 0;
  _$jscoverage['/touch/tap.js'].lineData[104] = 0;
  _$jscoverage['/touch/tap.js'].lineData[106] = 0;
  _$jscoverage['/touch/tap.js'].lineData[107] = 0;
  _$jscoverage['/touch/tap.js'].lineData[114] = 0;
  _$jscoverage['/touch/tap.js'].lineData[117] = 0;
  _$jscoverage['/touch/tap.js'].lineData[119] = 0;
  _$jscoverage['/touch/tap.js'].lineData[121] = 0;
  _$jscoverage['/touch/tap.js'].lineData[123] = 0;
  _$jscoverage['/touch/tap.js'].lineData[125] = 0;
  _$jscoverage['/touch/tap.js'].lineData[126] = 0;
  _$jscoverage['/touch/tap.js'].lineData[133] = 0;
  _$jscoverage['/touch/tap.js'].lineData[140] = 0;
  _$jscoverage['/touch/tap.js'].lineData[141] = 0;
  _$jscoverage['/touch/tap.js'].lineData[142] = 0;
  _$jscoverage['/touch/tap.js'].lineData[152] = 0;
  _$jscoverage['/touch/tap.js'].lineData[153] = 0;
  _$jscoverage['/touch/tap.js'].lineData[165] = 0;
  _$jscoverage['/touch/tap.js'].lineData[169] = 0;
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
}
if (! _$jscoverage['/touch/tap.js'].branchData) {
  _$jscoverage['/touch/tap.js'].branchData = {};
  _$jscoverage['/touch/tap.js'].branchData['32'] = [];
  _$jscoverage['/touch/tap.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['37'] = [];
  _$jscoverage['/touch/tap.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['53'] = [];
  _$jscoverage['/touch/tap.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['62'] = [];
  _$jscoverage['/touch/tap.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['69'] = [];
  _$jscoverage['/touch/tap.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['70'] = [];
  _$jscoverage['/touch/tap.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['71'] = [];
  _$jscoverage['/touch/tap.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['80'] = [];
  _$jscoverage['/touch/tap.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['87'] = [];
  _$jscoverage['/touch/tap.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['106'] = [];
  _$jscoverage['/touch/tap.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['119'] = [];
  _$jscoverage['/touch/tap.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['123'] = [];
  _$jscoverage['/touch/tap.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['141'] = [];
  _$jscoverage['/touch/tap.js'].branchData['141'][1] = new BranchData();
}
_$jscoverage['/touch/tap.js'].branchData['141'][1].init(2278, 27, 'duration > SINGLE_TAP_DELAY');
function visit115_141_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['123'][1].init(155, 27, 'duration < SINGLE_TAP_DELAY');
function visit114_123_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['119'][1].init(1429, 11, 'lastEndTime');
function visit113_119_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['106'][1].init(1005, 32, 'eventObject.isDefaultPrevented()');
function visit112_106_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['87'][1].init(275, 17, 'self.tapHoldTimer');
function visit111_87_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['80'][1].init(83, 23, '!(lastXY = self.lastXY)');
function visit110_80_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['71'][1].init(87, 68, 'Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit109_71_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['70'][2].init(404, 68, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY');
function visit108_70_2(result) {
  _$jscoverage['/touch/tap.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['70'][1].init(32, 156, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit107_70_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['69'][1].init(369, 189, '!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit106_69_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['62'][1].init(54, 23, '!(lastXY = self.lastXY)');
function visit105_62_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['53'][1].init(805, 19, 'self.singleTapTimer');
function visit104_53_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['37'][1].init(185, 17, 'self.tapHoldTimer');
function visit103_37_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['32'][1].init(46, 51, 'Tap.superclass.onTouchStart.call(self, e) === false');
function visit102_32_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['32'][1].ranCondition(result);
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
  function preventDefault(e) {
    _$jscoverage['/touch/tap.js'].functionData[1]++;
    _$jscoverage['/touch/tap.js'].lineData[12]++;
    e.preventDefault();
  }
  _$jscoverage['/touch/tap.js'].lineData[15]++;
  var SINGLE_TAP_EVENT = 'singleTap', DOUBLE_TAP_EVENT = 'doubleTap', TAP_HOLD_EVENT = 'tapHold', TAP_EVENT = 'tap', TAP_HOLD_DELAY = 1000, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  _$jscoverage['/touch/tap.js'].lineData[25]++;
  function Tap() {
    _$jscoverage['/touch/tap.js'].functionData[2]++;
    _$jscoverage['/touch/tap.js'].lineData[26]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/touch/tap.js'].lineData[29]++;
  S.extend(Tap, SingleTouch, {
  onTouchStart: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[3]++;
  _$jscoverage['/touch/tap.js'].lineData[31]++;
  var self = this;
  _$jscoverage['/touch/tap.js'].lineData[32]++;
  if (visit102_32_1(Tap.superclass.onTouchStart.call(self, e) === false)) {
    _$jscoverage['/touch/tap.js'].lineData[33]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[37]++;
  if (visit103_37_1(self.tapHoldTimer)) {
    _$jscoverage['/touch/tap.js'].lineData[38]++;
    clearTimeout(self.tapHoldTimer);
  }
  _$jscoverage['/touch/tap.js'].lineData[40]++;
  self.tapHoldTimer = setTimeout(function() {
  _$jscoverage['/touch/tap.js'].functionData[4]++;
  _$jscoverage['/touch/tap.js'].lineData[41]++;
  var eventObj = S.mix({
  touch: e.touches[0], 
  which: 1, 
  TAP_HOLD_DELAY: (S.now() - e.timeStamp) / 1000}, self.lastXY);
  _$jscoverage['/touch/tap.js'].lineData[46]++;
  self.tapHoldTimer = 0;
  _$jscoverage['/touch/tap.js'].lineData[47]++;
  self.lastXY = 0;
  _$jscoverage['/touch/tap.js'].lineData[48]++;
  DomEvent.fire(e.target, TAP_HOLD_EVENT, eventObj);
}, TAP_HOLD_DELAY);
  _$jscoverage['/touch/tap.js'].lineData[52]++;
  self.startTime = e.timeStamp;
  _$jscoverage['/touch/tap.js'].lineData[53]++;
  if (visit104_53_1(self.singleTapTimer)) {
    _$jscoverage['/touch/tap.js'].lineData[54]++;
    clearTimeout(self.singleTapTimer);
    _$jscoverage['/touch/tap.js'].lineData[55]++;
    self.singleTapTimer = 0;
  }
  _$jscoverage['/touch/tap.js'].lineData[58]++;
  return undefined;
}, 
  onTouchMove: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[5]++;
  _$jscoverage['/touch/tap.js'].lineData[61]++;
  var self = this, lastXY;
  _$jscoverage['/touch/tap.js'].lineData[62]++;
  if (visit105_62_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/touch/tap.js'].lineData[63]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[65]++;
  var currentTouch = e.changedTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[69]++;
  if (visit106_69_1(!currentTouch || visit107_70_1(visit108_70_2(Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY) || visit109_71_1(Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY)))) {
    _$jscoverage['/touch/tap.js'].lineData[72]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[74]++;
  return undefined;
}, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[6]++;
  _$jscoverage['/touch/tap.js'].lineData[78]++;
  var self = this, lastXY;
  _$jscoverage['/touch/tap.js'].lineData[80]++;
  if (visit110_80_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/touch/tap.js'].lineData[81]++;
    return;
  }
  _$jscoverage['/touch/tap.js'].lineData[83]++;
  var target = e.target;
  _$jscoverage['/touch/tap.js'].lineData[84]++;
  var touch = e.changedTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[87]++;
  if (visit111_87_1(self.tapHoldTimer)) {
    _$jscoverage['/touch/tap.js'].lineData[88]++;
    clearTimeout(self.tapHoldTimer);
    _$jscoverage['/touch/tap.js'].lineData[89]++;
    self.tapHoldTimer = 0;
  }
  _$jscoverage['/touch/tap.js'].lineData[93]++;
  var eventObject = new DomEventObject({
  type: TAP_EVENT, 
  which: 1, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/touch/tap.js'].lineData[101]++;
  eventObject.touch = touch;
  _$jscoverage['/touch/tap.js'].lineData[103]++;
  eventObject.originalEvent = e.originalEvent;
  _$jscoverage['/touch/tap.js'].lineData[104]++;
  DomEvent.fire(target, TAP_EVENT, eventObject);
  _$jscoverage['/touch/tap.js'].lineData[106]++;
  if (visit112_106_1(eventObject.isDefaultPrevented())) {
    _$jscoverage['/touch/tap.js'].lineData[107]++;
    DomEvent.on(target, 'click', {
  fn: preventDefault, 
  once: 1});
  }
  _$jscoverage['/touch/tap.js'].lineData[114]++;
  var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
  _$jscoverage['/touch/tap.js'].lineData[117]++;
  self.lastEndTime = time;
  _$jscoverage['/touch/tap.js'].lineData[119]++;
  if (visit113_119_1(lastEndTime)) {
    _$jscoverage['/touch/tap.js'].lineData[121]++;
    duration = time - lastEndTime;
    _$jscoverage['/touch/tap.js'].lineData[123]++;
    if (visit114_123_1(duration < SINGLE_TAP_DELAY)) {
      _$jscoverage['/touch/tap.js'].lineData[125]++;
      self.lastEndTime = 0;
      _$jscoverage['/touch/tap.js'].lineData[126]++;
      DomEvent.fire(target, DOUBLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
      _$jscoverage['/touch/tap.js'].lineData[133]++;
      return;
    }
  }
  _$jscoverage['/touch/tap.js'].lineData[140]++;
  duration = time - self.startTime;
  _$jscoverage['/touch/tap.js'].lineData[141]++;
  if (visit115_141_1(duration > SINGLE_TAP_DELAY)) {
    _$jscoverage['/touch/tap.js'].lineData[142]++;
    DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/touch/tap.js'].lineData[152]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/touch/tap.js'].functionData[7]++;
  _$jscoverage['/touch/tap.js'].lineData[153]++;
  DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
}, SINGLE_TAP_DELAY);
  }
}});
  _$jscoverage['/touch/tap.js'].lineData[165]++;
  eventHandleMap[TAP_EVENT] = eventHandleMap[DOUBLE_TAP_EVENT] = eventHandleMap[SINGLE_TAP_EVENT] = eventHandleMap[TAP_HOLD_EVENT] = {
  handle: new Tap()};
  _$jscoverage['/touch/tap.js'].lineData[169]++;
  return Tap;
});
