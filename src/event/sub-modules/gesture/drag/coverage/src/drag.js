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
  _$jscoverage['/drag.js'].lineData[11] = 0;
  _$jscoverage['/drag.js'].lineData[16] = 0;
  _$jscoverage['/drag.js'].lineData[18] = 0;
  _$jscoverage['/drag.js'].lineData[19] = 0;
  _$jscoverage['/drag.js'].lineData[21] = 0;
  _$jscoverage['/drag.js'].lineData[24] = 0;
  _$jscoverage['/drag.js'].lineData[25] = 0;
  _$jscoverage['/drag.js'].lineData[26] = 0;
  _$jscoverage['/drag.js'].lineData[28] = 0;
  _$jscoverage['/drag.js'].lineData[29] = 0;
  _$jscoverage['/drag.js'].lineData[30] = 0;
  _$jscoverage['/drag.js'].lineData[34] = 0;
  _$jscoverage['/drag.js'].lineData[35] = 0;
  _$jscoverage['/drag.js'].lineData[37] = 0;
  _$jscoverage['/drag.js'].lineData[39] = 0;
  _$jscoverage['/drag.js'].lineData[43] = 0;
  _$jscoverage['/drag.js'].lineData[44] = 0;
  _$jscoverage['/drag.js'].lineData[45] = 0;
  _$jscoverage['/drag.js'].lineData[46] = 0;
  _$jscoverage['/drag.js'].lineData[47] = 0;
  _$jscoverage['/drag.js'].lineData[51] = 0;
  _$jscoverage['/drag.js'].lineData[55] = 0;
  _$jscoverage['/drag.js'].lineData[56] = 0;
  _$jscoverage['/drag.js'].lineData[57] = 0;
  _$jscoverage['/drag.js'].lineData[58] = 0;
  _$jscoverage['/drag.js'].lineData[59] = 0;
  _$jscoverage['/drag.js'].lineData[60] = 0;
  _$jscoverage['/drag.js'].lineData[61] = 0;
  _$jscoverage['/drag.js'].lineData[62] = 0;
  _$jscoverage['/drag.js'].lineData[63] = 0;
  _$jscoverage['/drag.js'].lineData[64] = 0;
  _$jscoverage['/drag.js'].lineData[65] = 0;
  _$jscoverage['/drag.js'].lineData[66] = 0;
  _$jscoverage['/drag.js'].lineData[67] = 0;
  _$jscoverage['/drag.js'].lineData[68] = 0;
  _$jscoverage['/drag.js'].lineData[71] = 0;
  _$jscoverage['/drag.js'].lineData[74] = 0;
  _$jscoverage['/drag.js'].lineData[76] = 0;
  _$jscoverage['/drag.js'].lineData[77] = 0;
  _$jscoverage['/drag.js'].lineData[78] = 0;
  _$jscoverage['/drag.js'].lineData[79] = 0;
  _$jscoverage['/drag.js'].lineData[81] = 0;
  _$jscoverage['/drag.js'].lineData[82] = 0;
  _$jscoverage['/drag.js'].lineData[89] = 0;
  _$jscoverage['/drag.js'].lineData[90] = 0;
  _$jscoverage['/drag.js'].lineData[91] = 0;
  _$jscoverage['/drag.js'].lineData[92] = 0;
  _$jscoverage['/drag.js'].lineData[94] = 0;
  _$jscoverage['/drag.js'].lineData[95] = 0;
  _$jscoverage['/drag.js'].lineData[100] = 0;
  _$jscoverage['/drag.js'].lineData[101] = 0;
  _$jscoverage['/drag.js'].lineData[102] = 0;
  _$jscoverage['/drag.js'].lineData[103] = 0;
  _$jscoverage['/drag.js'].lineData[104] = 0;
  _$jscoverage['/drag.js'].lineData[105] = 0;
  _$jscoverage['/drag.js'].lineData[109] = 0;
  _$jscoverage['/drag.js'].lineData[110] = 0;
  _$jscoverage['/drag.js'].lineData[115] = 0;
  _$jscoverage['/drag.js'].lineData[119] = 0;
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
  _$jscoverage['/drag.js'].branchData['28'] = [];
  _$jscoverage['/drag.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['29'] = [];
  _$jscoverage['/drag.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['34'] = [];
  _$jscoverage['/drag.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['46'] = [];
  _$jscoverage['/drag.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['57'] = [];
  _$jscoverage['/drag.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['91'] = [];
  _$jscoverage['/drag.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['106'] = [];
  _$jscoverage['/drag.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['107'] = [];
  _$jscoverage['/drag.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/drag.js'].branchData['109'] = [];
  _$jscoverage['/drag.js'].branchData['109'][1] = new BranchData();
}
_$jscoverage['/drag.js'].branchData['109'][1].init(538, 23, 'doc.body.releaseCapture');
function visit9_109_1(result) {
  _$jscoverage['/drag.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['107'][1].init(73, 14, 'velocityY || 0');
function visit8_107_1(result) {
  _$jscoverage['/drag.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['106'][1].init(29, 14, 'velocityX || 0');
function visit7_106_1(result) {
  _$jscoverage['/drag.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['91'][1].init(106, 15, '!self.isStarted');
function visit6_91_1(result) {
  _$jscoverage['/drag.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['57'][1].init(55, 9, 'ret || {}');
function visit5_57_1(result) {
  _$jscoverage['/drag.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['46'][1].init(103, 45, 'currentTime - self.lastTime > SAMPLE_INTERVAL');
function visit4_46_1(result) {
  _$jscoverage['/drag.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['34'][1].init(238, 19, 'doc.body.setCapture');
function visit3_34_1(result) {
  _$jscoverage['/drag.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['29'][1].init(18, 14, 'self.isStarted');
function visit2_29_1(result) {
  _$jscoverage['/drag.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/drag.js'].branchData['28'][1].init(155, 50, 'getDistance(currentTouch, startPos) > MIN_DISTANCE');
function visit1_28_1(result) {
  _$jscoverage['/drag.js'].branchData['28'][1].ranCondition(result);
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
  _$jscoverage['/drag.js'].lineData[11]++;
  var DRAG_START = 'gestureDragStart', DRAG_END = 'gestureDragEnd', DRAG = 'gestureDrag', SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
  _$jscoverage['/drag.js'].lineData[16]++;
  var doc = document;
  _$jscoverage['/drag.js'].lineData[18]++;
  function getDistance(p1, p2) {
    _$jscoverage['/drag.js'].functionData[1]++;
    _$jscoverage['/drag.js'].lineData[19]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/drag.js'].lineData[21]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/drag.js'].lineData[24]++;
  function startDrag(self, e) {
    _$jscoverage['/drag.js'].functionData[2]++;
    _$jscoverage['/drag.js'].lineData[25]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[26]++;
    var startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[28]++;
    if (visit1_28_1(getDistance(currentTouch, startPos) > MIN_DISTANCE)) {
      _$jscoverage['/drag.js'].lineData[29]++;
      if (visit2_29_1(self.isStarted)) {
        _$jscoverage['/drag.js'].lineData[30]++;
        sample(self, e);
      } else {
        _$jscoverage['/drag.js'].lineData[34]++;
        if (visit3_34_1(doc.body.setCapture)) {
          _$jscoverage['/drag.js'].lineData[35]++;
          doc.body.setCapture();
        }
        _$jscoverage['/drag.js'].lineData[37]++;
        self.isStarted = true;
      }
      _$jscoverage['/drag.js'].lineData[39]++;
      DomEvent.fire(self.dragTarget, DRAG_START, getEventObject(self, e));
    }
  }
  _$jscoverage['/drag.js'].lineData[43]++;
  function sample(self, e) {
    _$jscoverage['/drag.js'].functionData[3]++;
    _$jscoverage['/drag.js'].lineData[44]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[45]++;
    var currentTime = e.timeStamp;
    _$jscoverage['/drag.js'].lineData[46]++;
    if (visit4_46_1(currentTime - self.lastTime > SAMPLE_INTERVAL)) {
      _$jscoverage['/drag.js'].lineData[47]++;
      self.lastPos = {
  pageX: currentTouch.pageX, 
  pageY: currentTouch.pageY};
      _$jscoverage['/drag.js'].lineData[51]++;
      self.lastTime = currentTime;
    }
  }
  _$jscoverage['/drag.js'].lineData[55]++;
  function getEventObject(self, e, ret) {
    _$jscoverage['/drag.js'].functionData[4]++;
    _$jscoverage['/drag.js'].lineData[56]++;
    var startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[57]++;
    ret = visit5_57_1(ret || {});
    _$jscoverage['/drag.js'].lineData[58]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/drag.js'].lineData[59]++;
    ret.pageX = currentTouch.pageX;
    _$jscoverage['/drag.js'].lineData[60]++;
    ret.pageY = currentTouch.pageY;
    _$jscoverage['/drag.js'].lineData[61]++;
    ret.originalEvent = e.originalEvent;
    _$jscoverage['/drag.js'].lineData[62]++;
    ret.deltaX = currentTouch.pageX - startPos.pageX;
    _$jscoverage['/drag.js'].lineData[63]++;
    ret.deltaY = currentTouch.pageY - startPos.pageY;
    _$jscoverage['/drag.js'].lineData[64]++;
    ret.startTime = self.startTime;
    _$jscoverage['/drag.js'].lineData[65]++;
    ret.startPos = self.startPos;
    _$jscoverage['/drag.js'].lineData[66]++;
    ret.touch = currentTouch;
    _$jscoverage['/drag.js'].lineData[67]++;
    ret.gestureType = e.gestureType;
    _$jscoverage['/drag.js'].lineData[68]++;
    return ret;
  }
  _$jscoverage['/drag.js'].lineData[71]++;
  function Drag() {
    _$jscoverage['/drag.js'].functionData[5]++;
  }
  _$jscoverage['/drag.js'].lineData[74]++;
  S.extend(Drag, SingleTouch, {
  start: function() {
  _$jscoverage['/drag.js'].functionData[6]++;
  _$jscoverage['/drag.js'].lineData[76]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[77]++;
  Drag.superclass.start.apply(self, arguments);
  _$jscoverage['/drag.js'].lineData[78]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/drag.js'].lineData[79]++;
  self.lastTime = self.startTime;
  _$jscoverage['/drag.js'].lineData[81]++;
  self.dragTarget = touch.target;
  _$jscoverage['/drag.js'].lineData[82]++;
  self.startPos = self.lastPos = {
  pageX: touch.pageX, 
  pageY: touch.pageY};
}, 
  move: function(e) {
  _$jscoverage['/drag.js'].functionData[7]++;
  _$jscoverage['/drag.js'].lineData[89]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[90]++;
  Drag.superclass.move.apply(self, arguments);
  _$jscoverage['/drag.js'].lineData[91]++;
  if (visit6_91_1(!self.isStarted)) {
    _$jscoverage['/drag.js'].lineData[92]++;
    startDrag(self, e);
  } else {
    _$jscoverage['/drag.js'].lineData[94]++;
    sample(self, e);
    _$jscoverage['/drag.js'].lineData[95]++;
    DomEvent.fire(self.dragTarget, DRAG, getEventObject(self, e));
  }
}, 
  end: function(e) {
  _$jscoverage['/drag.js'].functionData[8]++;
  _$jscoverage['/drag.js'].lineData[100]++;
  var self = this;
  _$jscoverage['/drag.js'].lineData[101]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/drag.js'].lineData[102]++;
  var currentTime = e.timeStamp;
  _$jscoverage['/drag.js'].lineData[103]++;
  var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
  _$jscoverage['/drag.js'].lineData[104]++;
  var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
  _$jscoverage['/drag.js'].lineData[105]++;
  DomEvent.fire(self.dragTarget, DRAG_END, getEventObject(self, e, {
  velocityX: visit7_106_1(velocityX || 0), 
  velocityY: visit8_107_1(velocityY || 0)}));
  _$jscoverage['/drag.js'].lineData[109]++;
  if (visit9_109_1(doc.body.releaseCapture)) {
    _$jscoverage['/drag.js'].lineData[110]++;
    doc.body.releaseCapture();
  }
}});
  _$jscoverage['/drag.js'].lineData[115]++;
  addGestureEvent([DRAG_START, DRAG, DRAG_END], {
  handle: new Drag()});
  _$jscoverage['/drag.js'].lineData[119]++;
  return {
  DRAG_START: DRAG_START, 
  DRAG: DRAG, 
  DRAG_END: DRAG_END};
});
