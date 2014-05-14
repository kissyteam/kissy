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
  _$jscoverage['/drag.js'].lineData[70] = 0;
  _$jscoverage['/drag.js'].lineData[76] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[84] = 0;
  _$jscoverage['/drag.js'].lineData[85] = 0;
  _$jscoverage['/drag.js'].lineData[86] = 0;
  _$jscoverage['/drag.js'].lineData[87] = 0;
  _$jscoverage['/drag.js'].lineData[88] = 0;
  _$jscoverage['/drag.js'].lineData[92] = 0;
  _$jscoverage['/drag.js'].lineData[93] = 0;
  _$jscoverage['/drag.js'].lineData[95] = 0;
  _$jscoverage['/drag.js'].lineData[100] = 0;
  _$jscoverage['/drag.js'].lineData[101] = 0;
  _$jscoverage['/drag.js'].lineData[102] = 0;
  _$jscoverage['/drag.js'].lineData[106] = 0;
  _$jscoverage['/drag.js'].lineData[107] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[111] = 0;
  _$jscoverage['/drag.js'].lineData[114] = 0;
  _$jscoverage['/drag.js'].lineData[118] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
  _$jscoverage['/drag.js'].lineData[120] = 0;
  _$jscoverage['/drag.js'].lineData[121] = 0;
  _$jscoverage['/drag.js'].lineData[122] = 0;
  _$jscoverage['/drag.js'].lineData[126] = 0;
  _$jscoverage['/drag.js'].lineData[130] = 0;
  _$jscoverage['/drag.js'].lineData[131] = 0;
  _$jscoverage['/drag.js'].lineData[132] = 0;
  _$jscoverage['/drag.js'].lineData[133] = 0;
  _$jscoverage['/drag.js'].lineData[134] = 0;
  _$jscoverage['/drag.js'].lineData[135] = 0;
  _$jscoverage['/drag.js'].lineData[136] = 0;
  _$jscoverage['/drag.js'].lineData[137] = 0;
  _$jscoverage['/drag.js'].lineData[138] = 0;
  _$jscoverage['/drag.js'].lineData[139] = 0;
  _$jscoverage['/drag.js'].lineData[140] = 0;
  _$jscoverage['/drag.js'].lineData[141] = 0;
  _$jscoverage['/drag.js'].lineData[142] = 0;
  _$jscoverage['/drag.js'].lineData[143] = 0;
  _$jscoverage['/drag.js'].lineData[144] = 0;
  _$jscoverage['/drag.js'].lineData[147] = 0;
  _$jscoverage['/drag.js'].lineData[150] = 0;
  _$jscoverage['/drag.js'].lineData[152] = 0;
  _$jscoverage['/drag.js'].lineData[153] = 0;
  _$jscoverage['/drag.js'].lineData[154] = 0;
  _$jscoverage['/drag.js'].lineData[155] = 0;
  _$jscoverage['/drag.js'].lineData[157] = 0;
  _$jscoverage['/drag.js'].lineData[158] = 0;
  _$jscoverage['/drag.js'].lineData[162] = 0;
  _$jscoverage['/drag.js'].lineData[166] = 0;
  _$jscoverage['/drag.js'].lineData[167] = 0;
  _$jscoverage['/drag.js'].lineData[168] = 0;
  _$jscoverage['/drag.js'].lineData[169] = 0;
  _$jscoverage['/drag.js'].lineData[171] = 0;
  _$jscoverage['/drag.js'].lineData[172] = 0;
  _$jscoverage['/drag.js'].lineData[177] = 0;
  _$jscoverage['/drag.js'].lineData[178] = 0;
  _$jscoverage['/drag.js'].lineData[179] = 0;
  _$jscoverage['/drag.js'].lineData[180] = 0;
  _$jscoverage['/drag.js'].lineData[181] = 0;
  _$jscoverage['/drag.js'].lineData[182] = 0;
  _$jscoverage['/drag.js'].lineData[186] = 0;
  _$jscoverage['/drag.js'].lineData[187] = 0;
  _$jscoverage['/drag.js'].lineData[192] = 0;
  _$jscoverage['/drag.js'].lineData[196] = 0;
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
  _$jscoverage['/drag.js'].branchData['87'] = [];
  _$jscoverage['/drag.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['92'] = [];
  _$jscoverage['/drag.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['93'] = [];
  _$jscoverage['/drag.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['95'] = [];
  _$jscoverage['/drag.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['100'] = [];
  _$jscoverage['/drag.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['101'] = [];
  _$jscoverage['/drag.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['106'] = [];
  _$jscoverage['/drag.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['121'] = [];
  _$jscoverage['/drag.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['132'] = [];
  _$jscoverage['/drag.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['168'] = [];
  _$jscoverage['/drag.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['183'] = [];
  _$jscoverage['/drag.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['184'] = [];
  _$jscoverage['/drag.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['186'] = [];
  _$jscoverage['/drag.js'].branchData['186'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['186'][1].init(538, 23, 'doc.body.releaseCapture');
function visit13_186_1(result) {
  _$jscoverage['/drag.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['184'][1].init(73, 14, 'velocityY || 0');
function visit12_184_1(result) {
  _$jscoverage['/drag.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['183'][1].init(29, 14, 'velocityX || 0');
function visit11_183_1(result) {
  _$jscoverage['/drag.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['168'][1].init(106, 15, '!self.isStarted');
function visit10_168_1(result) {
  _$jscoverage['/drag.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['132'][1].init(55, 9, 'ret || {}');
function visit9_132_1(result) {
  _$jscoverage['/drag.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['121'][1].init(103, 45, 'currentTime - self.lastTime > SAMPLE_INTERVAL');
function visit8_121_1(result) {
  _$jscoverage['/drag.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['106'][1].init(238, 19, 'doc.body.setCapture');
function visit7_106_1(result) {
  _$jscoverage['/drag.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['101'][1].init(18, 14, 'self.isStarted');
function visit6_101_1(result) {
  _$jscoverage['/drag.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['100'][1].init(614, 50, 'getDistance(currentTouch, startPos) > MIN_DISTANCE');
function visit5_100_1(result) {
  _$jscoverage['/drag.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['95'][1].init(35, 10, 'deltaY < 0');
function visit4_95_1(result) {
  _$jscoverage['/drag.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['93'][1].init(35, 10, 'deltaX < 0');
function visit3_93_1(result) {
  _$jscoverage['/drag.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['92'][1].init(226, 21, 'absDeltaX > absDeltaY');
function visit2_92_1(result) {
  _$jscoverage['/drag.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['87'][1].init(102, 15, '!self.direction');
function visit1_87_1(result) {
  _$jscoverage['/drag.js'].branchData['87'][1].ranCondition(result);
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
  _$jscoverage['/drag.js'].lineData[70]++;
  var DRAG_START = 'ksDragStart', DRAG_END = 'ksDragEnd', DRAG_PRE = 'ksDragging', DRAG = 'ksDrag', SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
  _$jscoverage['/drag.js'].lineData[76]++;
  var doc = document;
  _$jscoverage['/drag.js'].lineData[77]++;
  var util = require('util');
  _$jscoverage['/drag.js'].lineData[78]++;
  function getDistance(p1, p2) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[79]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/drag.js'].lineData[81]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/drag.js'].lineData[84]++;
  function startDrag(self, e) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[85]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[86]++;
    var startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[87]++;
    if (visit1_87_1(!self.direction)) {
      _$jscoverage['/drag.js'].lineData[88]++;
      var deltaX = e.pageX - self.startPos.pageX, deltaY = e.pageY - self.startPos.pageY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
      _$jscoverage['/drag.js'].lineData[92]++;
      if (visit2_92_1(absDeltaX > absDeltaY)) {
        _$jscoverage['/drag.js'].lineData[93]++;
        self.direction = visit3_93_1(deltaX < 0) ? 'left' : 'right';
      } else {
        _$jscoverage['/drag.js'].lineData[95]++;
        self.direction = visit4_95_1(deltaY < 0) ? 'up' : 'down';
      }
    }
    _$jscoverage['/drag.js'].lineData[100]++;
    if (visit5_100_1(getDistance(currentTouch, startPos) > MIN_DISTANCE)) {
      _$jscoverage['/drag.js'].lineData[101]++;
      if (visit6_101_1(self.isStarted)) {
        _$jscoverage['/drag.js'].lineData[102]++;
        sample(self, e);
      } else {
        _$jscoverage['/drag.js'].lineData[106]++;
        if (visit7_106_1(doc.body.setCapture)) {
          _$jscoverage['/drag.js'].lineData[107]++;
          doc.body.setCapture();
        }
        _$jscoverage['/drag.js'].lineData[109]++;
        self.isStarted = true;
      }
      _$jscoverage['/drag.js'].lineData[111]++;
      DomEvent.fire(self.dragTarget, DRAG_START, getEventObject(self, e));
    } else {
      _$jscoverage['/drag.js'].lineData[114]++;
      DomEvent.fire(self.dragTarget, DRAG_PRE, getEventObject(self, e));
    }
  }
  _$jscoverage['/drag.js'].lineData[118]++;
  function sample(self, e) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[119]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[120]++;
    var currentTime = e.timeStamp;
    _$jscoverage['/drag.js'].lineData[121]++;
    if (visit8_121_1(currentTime - self.lastTime > SAMPLE_INTERVAL)) {
      _$jscoverage['/drag.js'].lineData[122]++;
      self.lastPos = {
  pageX: currentTouch.pageX, 
  pageY: currentTouch.pageY};
      _$jscoverage['/drag.js'].lineData[126]++;
      self.lastTime = currentTime;
    }
  }
  _$jscoverage['/drag.js'].lineData[130]++;
  function getEventObject(self, e, ret) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[131]++;
    var startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[132]++;
    ret = visit9_132_1(ret || {});
    _$jscoverage['/drag.js'].lineData[133]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[134]++;
    ret.which = 1;
    _$jscoverage['/drag.js'].lineData[135]++;
    ret.pageX = currentTouch.pageX;
    _$jscoverage['/drag.js'].lineData[136]++;
    ret.pageY = currentTouch.pageY;
    _$jscoverage['/drag.js'].lineData[137]++;
    ret.originalEvent = e.originalEvent;
    _$jscoverage['/drag.js'].lineData[138]++;
    ret.deltaX = currentTouch.pageX - startPos.pageX;
    _$jscoverage['/drag.js'].lineData[139]++;
    ret.deltaY = currentTouch.pageY - startPos.pageY;
    _$jscoverage['/drag.js'].lineData[140]++;
    ret.startTime = self.startTime;
    _$jscoverage['/drag.js'].lineData[141]++;
    ret.startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[142]++;
    ret.gestureType = e.gestureType;
    _$jscoverage['/drag.js'].lineData[143]++;
    ret.direction = self.direction;
    _$jscoverage['/drag.js'].lineData[144]++;
    return ret;
  }
  _$jscoverage['/drag.js'].lineData[147]++;
  function Drag() {
    _$jscoverage['/drag.js'].functionData[5]++;
  }
  _$jscoverage['/drag.js'].lineData[150]++;
  util.extend(Drag, SingleTouch, {
  start: function() {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[152]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[153]++;
  Drag.superclass.start.apply(self, arguments);
  _$jscoverage['/drag.js'].lineData[154]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/drag.js'].lineData[155]++;
  self.lastTime = self.startTime;
  _$jscoverage['/drag.js'].lineData[157]++;
  self.dragTarget = touch.target;
  _$jscoverage['/drag.js'].lineData[158]++;
  self.startPos = self.lastPos = {
  pageX: touch.pageX, 
  pageY: touch.pageY};
  _$jscoverage['/drag.js'].lineData[162]++;
  self.direction = null;
}, 
  move: function(e) {
  _$jscoverage['/drag.js'].functionData[7]++;
  _$jscoverage['/drag.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[167]++;
  Drag.superclass.move.apply(self, arguments);
  _$jscoverage['/drag.js'].lineData[168]++;
  if (visit10_168_1(!self.isStarted)) {
    _$jscoverage['/drag.js'].lineData[169]++;
    startDrag(self, e);
  } else {
    _$jscoverage['/drag.js'].lineData[171]++;
    sample(self, e);
    _$jscoverage['/drag.js'].lineData[172]++;
    DomEvent.fire(self.dragTarget, DRAG, getEventObject(self, e));
  }
}, 
  end: function(e) {
  _$jscoverage['/drag.js'].functionData[8]++;
  _$jscoverage['/drag.js'].lineData[177]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[178]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/drag.js'].lineData[179]++;
  var currentTime = e.timeStamp;
  _$jscoverage['/drag.js'].lineData[180]++;
  var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
  _$jscoverage['/drag.js'].lineData[181]++;
  var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
  _$jscoverage['/drag.js'].lineData[182]++;
  DomEvent.fire(self.dragTarget, DRAG_END, getEventObject(self, e, {
  velocityX: visit11_183_1(velocityX || 0), 
  velocityY: visit12_184_1(velocityY || 0)}));
  _$jscoverage['/drag.js'].lineData[186]++;
  if (visit13_186_1(doc.body.releaseCapture)) {
    _$jscoverage['/drag.js'].lineData[187]++;
    doc.body.releaseCapture();
  }
}});
  _$jscoverage['/drag.js'].lineData[192]++;
  addGestureEvent([DRAG_START, DRAG, DRAG_END], {
  handle: new Drag()});
  _$jscoverage['/drag.js'].lineData[196]++;
  return {
  DRAG_PRE: DRAG_PRE, 
  DRAG_START: DRAG_START, 
  DRAG: DRAG, 
  DRAG_END: DRAG_END};
});
