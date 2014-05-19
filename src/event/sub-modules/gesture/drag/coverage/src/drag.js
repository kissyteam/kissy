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
if (! _$jscoverage['/drag.js']) {
  _$jscoverage['/drag.js'] = {};
  _$jscoverage['/drag.js'].lineData = [];
  _$jscoverage['/drag.js'].lineData[6] = 0;
  _$jscoverage['/drag.js'].lineData[7] = 0;
  _$jscoverage['/drag.js'].lineData[8] = 0;
  _$jscoverage['/drag.js'].lineData[9] = 0;
  _$jscoverage['/drag.js'].lineData[10] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[65] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[70] = 0;
  _$jscoverage['/drag.js'].lineData[71] = 0;
  _$jscoverage['/drag.js'].lineData[72] = 0;
  _$jscoverage['/drag.js'].lineData[73] = 0;
  _$jscoverage['/drag.js'].lineData[74] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[86] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[92] = 0;
  _$jscoverage['/drag.js'].lineData[93] = 0;
  _$jscoverage['/drag.js'].lineData[95] = 0;
  _$jscoverage['/drag.js'].lineData[99] = 0;
  _$jscoverage['/drag.js'].lineData[106] = 0;
  _$jscoverage['/drag.js'].lineData[107] = 0;
  _$jscoverage['/drag.js'].lineData[108] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[118] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
  _$jscoverage['/drag.js'].lineData[120] = 0;
  _$jscoverage['/drag.js'].lineData[121] = 0;
  _$jscoverage['/drag.js'].lineData[122] = 0;
  _$jscoverage['/drag.js'].lineData[123] = 0;
  _$jscoverage['/drag.js'].lineData[124] = 0;
  _$jscoverage['/drag.js'].lineData[125] = 0;
  _$jscoverage['/drag.js'].lineData[126] = 0;
  _$jscoverage['/drag.js'].lineData[127] = 0;
  _$jscoverage['/drag.js'].lineData[128] = 0;
  _$jscoverage['/drag.js'].lineData[129] = 0;
  _$jscoverage['/drag.js'].lineData[130] = 0;
  _$jscoverage['/drag.js'].lineData[131] = 0;
  _$jscoverage['/drag.js'].lineData[132] = 0;
  _$jscoverage['/drag.js'].lineData[135] = 0;
  _$jscoverage['/drag.js'].lineData[138] = 0;
  _$jscoverage['/drag.js'].lineData[140] = 0;
  _$jscoverage['/drag.js'].lineData[145] = 0;
  _$jscoverage['/drag.js'].lineData[146] = 0;
  _$jscoverage['/drag.js'].lineData[147] = 0;
  _$jscoverage['/drag.js'].lineData[149] = 0;
  _$jscoverage['/drag.js'].lineData[150] = 0;
  _$jscoverage['/drag.js'].lineData[154] = 0;
  _$jscoverage['/drag.js'].lineData[160] = 0;
  _$jscoverage['/drag.js'].lineData[161] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[163] = 0;
  _$jscoverage['/drag.js'].lineData[165] = 0;
  _$jscoverage['/drag.js'].lineData[166] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[172] = 0;
  _$jscoverage['/drag.js'].lineData[173] = 0;
  _$jscoverage['/drag.js'].lineData[174] = 0;
  _$jscoverage['/drag.js'].lineData[175] = 0;
  _$jscoverage['/drag.js'].lineData[176] = 0;
  _$jscoverage['/drag.js'].lineData[180] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[186] = 0;
  _$jscoverage['/drag.js'].lineData[190] = 0;
}
if (! _$jscoverage['/drag.js'].functionData) {
  _$jscoverage['/drag.js'].functionData = [];
  _$jscoverage['/drag.js'].functionData[0] = 0;
  _$jscoverage['/drag.js'].functionData[1] = 0;
  _$jscoverage['/drag.js'].functionData[2] = 0;
  _$jscoverage['/drag.js'].functionData[3] = 0;
  _$jscoverage['/drag.js'].functionData[4] = 0;
  _$jscoverage['/drag.js'].functionData[5] = 0;
  _$jscoverage['/drag.js'].functionData[6] = 0;
  _$jscoverage['/drag.js'].functionData[7] = 0;
  _$jscoverage['/drag.js'].functionData[8] = 0;
}
if (! _$jscoverage['/drag.js'].branchData) {
  _$jscoverage['/drag.js'].branchData = {};
  _$jscoverage['/drag.js'].branchData['73'] = [];
  _$jscoverage['/drag.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['78'] = [];
  _$jscoverage['/drag.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['79'] = [];
  _$jscoverage['/drag.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['81'] = [];
  _$jscoverage['/drag.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['86'] = [];
  _$jscoverage['/drag.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['87'] = [];
  _$jscoverage['/drag.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['92'] = [];
  _$jscoverage['/drag.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['109'] = [];
  _$jscoverage['/drag.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['120'] = [];
  _$jscoverage['/drag.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['162'] = [];
  _$jscoverage['/drag.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['177'] = [];
  _$jscoverage['/drag.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['178'] = [];
  _$jscoverage['/drag.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['180'] = [];
  _$jscoverage['/drag.js'].branchData['180'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['180'][1].init(538, 23, 'doc.body.releaseCapture');
function visit13_180_1(result) {
  _$jscoverage['/drag.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['178'][1].init(73, 14, 'velocityY || 0');
function visit12_178_1(result) {
  _$jscoverage['/drag.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['177'][1].init(29, 14, 'velocityX || 0');
function visit11_177_1(result) {
  _$jscoverage['/drag.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['162'][1].init(106, 15, '!self.isStarted');
function visit10_162_1(result) {
  _$jscoverage['/drag.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['120'][1].init(55, 9, 'ret || {}');
function visit9_120_1(result) {
  _$jscoverage['/drag.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['109'][1].init(103, 45, 'currentTime - self.lastTime > SAMPLE_INTERVAL');
function visit8_109_1(result) {
  _$jscoverage['/drag.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['92'][1].init(238, 19, 'doc.body.setCapture');
function visit7_92_1(result) {
  _$jscoverage['/drag.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['87'][1].init(18, 14, 'self.isStarted');
function visit6_87_1(result) {
  _$jscoverage['/drag.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['86'][1].init(614, 50, 'getDistance(currentTouch, startPos) > MIN_DISTANCE');
function visit5_86_1(result) {
  _$jscoverage['/drag.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['81'][1].init(35, 10, 'deltaY < 0');
function visit4_81_1(result) {
  _$jscoverage['/drag.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['79'][1].init(35, 10, 'deltaX < 0');
function visit3_79_1(result) {
  _$jscoverage['/drag.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['78'][1].init(226, 21, 'absDeltaX > absDeltaY');
function visit2_78_1(result) {
  _$jscoverage['/drag.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['73'][1].init(102, 15, '!self.direction');
function visit1_73_1(result) {
  _$jscoverage['/drag.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/drag.js'].functionData[0]++;
  _$jscoverage['/drag.js'].lineData[7]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/drag.js'].lineData[8]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/drag.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/drag.js'].lineData[10]++;
  var SingleTouch = GestureUtil.SingleTouch;
  _$jscoverage['/drag.js'].lineData[55]++;
  var DRAG_START = 'ksDragStart', DRAG_END = 'ksDragEnd', DRAG = 'ksDrag', SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
  _$jscoverage['/drag.js'].lineData[61]++;
  var doc = document;
  _$jscoverage['/drag.js'].lineData[62]++;
  var util = require('util');
  _$jscoverage['/drag.js'].lineData[64]++;
  function getDistance(p1, p2) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[65]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/drag.js'].lineData[67]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/drag.js'].lineData[70]++;
  function startDrag(self, e) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[71]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[72]++;
    var startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[73]++;
    if (visit1_73_1(!self.direction)) {
      _$jscoverage['/drag.js'].lineData[74]++;
      var deltaX = e.pageX - self.startPos.pageX, deltaY = e.pageY - self.startPos.pageY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
      _$jscoverage['/drag.js'].lineData[78]++;
      if (visit2_78_1(absDeltaX > absDeltaY)) {
        _$jscoverage['/drag.js'].lineData[79]++;
        self.direction = visit3_79_1(deltaX < 0) ? 'left' : 'right';
      } else {
        _$jscoverage['/drag.js'].lineData[81]++;
        self.direction = visit4_81_1(deltaY < 0) ? 'up' : 'down';
      }
    }
    _$jscoverage['/drag.js'].lineData[86]++;
    if (visit5_86_1(getDistance(currentTouch, startPos) > MIN_DISTANCE)) {
      _$jscoverage['/drag.js'].lineData[87]++;
      if (visit6_87_1(self.isStarted)) {
        _$jscoverage['/drag.js'].lineData[88]++;
        sample(self, e);
      } else {
        _$jscoverage['/drag.js'].lineData[92]++;
        if (visit7_92_1(doc.body.setCapture)) {
          _$jscoverage['/drag.js'].lineData[93]++;
          doc.body.setCapture();
        }
        _$jscoverage['/drag.js'].lineData[95]++;
        self.isStarted = true;
      }
      _$jscoverage['/drag.js'].lineData[99]++;
      DomEvent.fire(self.dragTarget, DRAG_START, getEventObject(self, e));
    } else {
    }
  }
  _$jscoverage['/drag.js'].lineData[106]++;
  function sample(self, e) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[107]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[108]++;
    var currentTime = e.timeStamp;
    _$jscoverage['/drag.js'].lineData[109]++;
    if (visit8_109_1(currentTime - self.lastTime > SAMPLE_INTERVAL)) {
      _$jscoverage['/drag.js'].lineData[110]++;
      self.lastPos = {
  pageX: currentTouch.pageX, 
  pageY: currentTouch.pageY};
      _$jscoverage['/drag.js'].lineData[114]++;
      self.lastTime = currentTime;
    }
  }
  _$jscoverage['/drag.js'].lineData[118]++;
  function getEventObject(self, e, ret) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[119]++;
    var startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[120]++;
    ret = visit9_120_1(ret || {});
    _$jscoverage['/drag.js'].lineData[121]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[122]++;
    ret.which = 1;
    _$jscoverage['/drag.js'].lineData[123]++;
    ret.pageX = currentTouch.pageX;
    _$jscoverage['/drag.js'].lineData[124]++;
    ret.pageY = currentTouch.pageY;
    _$jscoverage['/drag.js'].lineData[125]++;
    ret.originalEvent = e.originalEvent;
    _$jscoverage['/drag.js'].lineData[126]++;
    ret.deltaX = currentTouch.pageX - startPos.pageX;
    _$jscoverage['/drag.js'].lineData[127]++;
    ret.deltaY = currentTouch.pageY - startPos.pageY;
    _$jscoverage['/drag.js'].lineData[128]++;
    ret.startTime = self.startTime;
    _$jscoverage['/drag.js'].lineData[129]++;
    ret.startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[130]++;
    ret.gestureType = e.gestureType;
    _$jscoverage['/drag.js'].lineData[131]++;
    ret.direction = self.direction;
    _$jscoverage['/drag.js'].lineData[132]++;
    return ret;
  }
  _$jscoverage['/drag.js'].lineData[135]++;
  function Drag() {
    _$jscoverage['/drag.js'].functionData[5]++;
  }
  _$jscoverage['/drag.js'].lineData[138]++;
  util.extend(Drag, SingleTouch, {
  start: function() {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[140]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[145]++;
  Drag.superclass.start.apply(self, arguments);
  _$jscoverage['/drag.js'].lineData[146]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/drag.js'].lineData[147]++;
  self.lastTime = self.startTime;
  _$jscoverage['/drag.js'].lineData[149]++;
  self.dragTarget = touch.target;
  _$jscoverage['/drag.js'].lineData[150]++;
  self.startPos = self.lastPos = {
  pageX: touch.pageX, 
  pageY: touch.pageY};
  _$jscoverage['/drag.js'].lineData[154]++;
  self.direction = null;
}, 
  move: function(e) {
  _$jscoverage['/drag.js'].functionData[7]++;
  _$jscoverage['/drag.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[161]++;
  Drag.superclass.move.apply(self, arguments);
  _$jscoverage['/drag.js'].lineData[162]++;
  if (visit10_162_1(!self.isStarted)) {
    _$jscoverage['/drag.js'].lineData[163]++;
    startDrag(self, e);
  } else {
    _$jscoverage['/drag.js'].lineData[165]++;
    sample(self, e);
    _$jscoverage['/drag.js'].lineData[166]++;
    DomEvent.fire(self.dragTarget, DRAG, getEventObject(self, e));
  }
}, 
  end: function(e) {
  _$jscoverage['/drag.js'].functionData[8]++;
  _$jscoverage['/drag.js'].lineData[171]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[172]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/drag.js'].lineData[173]++;
  var currentTime = e.timeStamp;
  _$jscoverage['/drag.js'].lineData[174]++;
  var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
  _$jscoverage['/drag.js'].lineData[175]++;
  var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
  _$jscoverage['/drag.js'].lineData[176]++;
  DomEvent.fire(self.dragTarget, DRAG_END, getEventObject(self, e, {
  velocityX: visit11_177_1(velocityX || 0), 
  velocityY: visit12_178_1(velocityY || 0)}));
  _$jscoverage['/drag.js'].lineData[180]++;
  if (visit13_180_1(doc.body.releaseCapture)) {
    _$jscoverage['/drag.js'].lineData[181]++;
    doc.body.releaseCapture();
  }
}});
  _$jscoverage['/drag.js'].lineData[186]++;
  addGestureEvent([DRAG_START, DRAG, DRAG_END], {
  handle: new Drag()});
  _$jscoverage['/drag.js'].lineData[190]++;
  return {
  DRAG_START: DRAG_START, 
  DRAG: DRAG, 
  DRAG_END: DRAG_END};
});
