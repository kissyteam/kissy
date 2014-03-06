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
if (! _$jscoverage['/touch/drag.js']) {
  _$jscoverage['/touch/drag.js'] = {};
  _$jscoverage['/touch/drag.js'].lineData = [];
  _$jscoverage['/touch/drag.js'].lineData[6] = 0;
  _$jscoverage['/touch/drag.js'].lineData[7] = 0;
  _$jscoverage['/touch/drag.js'].lineData[8] = 0;
  _$jscoverage['/touch/drag.js'].lineData[9] = 0;
  _$jscoverage['/touch/drag.js'].lineData[10] = 0;
  _$jscoverage['/touch/drag.js'].lineData[16] = 0;
  _$jscoverage['/touch/drag.js'].lineData[17] = 0;
  _$jscoverage['/touch/drag.js'].lineData[19] = 0;
  _$jscoverage['/touch/drag.js'].lineData[22] = 0;
  _$jscoverage['/touch/drag.js'].lineData[23] = 0;
  _$jscoverage['/touch/drag.js'].lineData[24] = 0;
  _$jscoverage['/touch/drag.js'].lineData[26] = 0;
  _$jscoverage['/touch/drag.js'].lineData[27] = 0;
  _$jscoverage['/touch/drag.js'].lineData[28] = 0;
  _$jscoverage['/touch/drag.js'].lineData[29] = 0;
  _$jscoverage['/touch/drag.js'].lineData[33] = 0;
  _$jscoverage['/touch/drag.js'].lineData[34] = 0;
  _$jscoverage['/touch/drag.js'].lineData[35] = 0;
  _$jscoverage['/touch/drag.js'].lineData[36] = 0;
  _$jscoverage['/touch/drag.js'].lineData[37] = 0;
  _$jscoverage['/touch/drag.js'].lineData[41] = 0;
  _$jscoverage['/touch/drag.js'].lineData[45] = 0;
  _$jscoverage['/touch/drag.js'].lineData[46] = 0;
  _$jscoverage['/touch/drag.js'].lineData[47] = 0;
  _$jscoverage['/touch/drag.js'].lineData[48] = 0;
  _$jscoverage['/touch/drag.js'].lineData[49] = 0;
  _$jscoverage['/touch/drag.js'].lineData[50] = 0;
  _$jscoverage['/touch/drag.js'].lineData[51] = 0;
  _$jscoverage['/touch/drag.js'].lineData[52] = 0;
  _$jscoverage['/touch/drag.js'].lineData[53] = 0;
  _$jscoverage['/touch/drag.js'].lineData[54] = 0;
  _$jscoverage['/touch/drag.js'].lineData[55] = 0;
  _$jscoverage['/touch/drag.js'].lineData[56] = 0;
  _$jscoverage['/touch/drag.js'].lineData[57] = 0;
  _$jscoverage['/touch/drag.js'].lineData[58] = 0;
  _$jscoverage['/touch/drag.js'].lineData[61] = 0;
  _$jscoverage['/touch/drag.js'].lineData[64] = 0;
  _$jscoverage['/touch/drag.js'].lineData[66] = 0;
  _$jscoverage['/touch/drag.js'].lineData[67] = 0;
  _$jscoverage['/touch/drag.js'].lineData[68] = 0;
  _$jscoverage['/touch/drag.js'].lineData[69] = 0;
  _$jscoverage['/touch/drag.js'].lineData[70] = 0;
  _$jscoverage['/touch/drag.js'].lineData[77] = 0;
  _$jscoverage['/touch/drag.js'].lineData[78] = 0;
  _$jscoverage['/touch/drag.js'].lineData[79] = 0;
  _$jscoverage['/touch/drag.js'].lineData[80] = 0;
  _$jscoverage['/touch/drag.js'].lineData[82] = 0;
  _$jscoverage['/touch/drag.js'].lineData[83] = 0;
  _$jscoverage['/touch/drag.js'].lineData[88] = 0;
  _$jscoverage['/touch/drag.js'].lineData[89] = 0;
  _$jscoverage['/touch/drag.js'].lineData[90] = 0;
  _$jscoverage['/touch/drag.js'].lineData[91] = 0;
  _$jscoverage['/touch/drag.js'].lineData[92] = 0;
  _$jscoverage['/touch/drag.js'].lineData[93] = 0;
  _$jscoverage['/touch/drag.js'].lineData[100] = 0;
  _$jscoverage['/touch/drag.js'].lineData[104] = 0;
}
if (! _$jscoverage['/touch/drag.js'].functionData) {
  _$jscoverage['/touch/drag.js'].functionData = [];
  _$jscoverage['/touch/drag.js'].functionData[0] = 0;
  _$jscoverage['/touch/drag.js'].functionData[1] = 0;
  _$jscoverage['/touch/drag.js'].functionData[2] = 0;
  _$jscoverage['/touch/drag.js'].functionData[3] = 0;
  _$jscoverage['/touch/drag.js'].functionData[4] = 0;
  _$jscoverage['/touch/drag.js'].functionData[5] = 0;
  _$jscoverage['/touch/drag.js'].functionData[6] = 0;
  _$jscoverage['/touch/drag.js'].functionData[7] = 0;
  _$jscoverage['/touch/drag.js'].functionData[8] = 0;
}
if (! _$jscoverage['/touch/drag.js'].branchData) {
  _$jscoverage['/touch/drag.js'].branchData = {};
  _$jscoverage['/touch/drag.js'].branchData['26'] = [];
  _$jscoverage['/touch/drag.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/touch/drag.js'].branchData['36'] = [];
  _$jscoverage['/touch/drag.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/touch/drag.js'].branchData['47'] = [];
  _$jscoverage['/touch/drag.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/touch/drag.js'].branchData['79'] = [];
  _$jscoverage['/touch/drag.js'].branchData['79'][1] = new BranchData();
}
_$jscoverage['/touch/drag.js'].branchData['79'][1].init(106, 15, '!self.isStarted');
function visit7_79_1(result) {
  _$jscoverage['/touch/drag.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/drag.js'].branchData['47'][1].init(55, 9, 'ret || {}');
function visit6_47_1(result) {
  _$jscoverage['/touch/drag.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/drag.js'].branchData['36'][1].init(103, 45, 'currentTime - self.lastTime > SAMPLE_INTERVAL');
function visit5_36_1(result) {
  _$jscoverage['/touch/drag.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/drag.js'].branchData['26'][1].init(155, 50, 'getDistance(currentTouch, startPos) > MIN_DISTANCE');
function visit4_26_1(result) {
  _$jscoverage['/touch/drag.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/drag.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/drag.js'].functionData[0]++;
  _$jscoverage['/touch/drag.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/drag.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/drag.js'].lineData[9]++;
  var SingleTouch = require('./single-touch');
  _$jscoverage['/touch/drag.js'].lineData[10]++;
  var dragStartEvent = 'dragStart', dragEndEvent = 'dragEnd', dragEvent = 'drag', SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
  _$jscoverage['/touch/drag.js'].lineData[16]++;
  function getDistance(p1, p2) {
    _$jscoverage['/touch/drag.js'].functionData[1]++;
    _$jscoverage['/touch/drag.js'].lineData[17]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/touch/drag.js'].lineData[19]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/touch/drag.js'].lineData[22]++;
  function startDrag(self, e) {
    _$jscoverage['/touch/drag.js'].functionData[2]++;
    _$jscoverage['/touch/drag.js'].lineData[23]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/touch/drag.js'].lineData[24]++;
    var startPos = self.startPos;
    _$jscoverage['/touch/drag.js'].lineData[26]++;
    if (visit4_26_1(getDistance(currentTouch, startPos) > MIN_DISTANCE)) {
      _$jscoverage['/touch/drag.js'].lineData[27]++;
      self.isStarted = true;
      _$jscoverage['/touch/drag.js'].lineData[28]++;
      sample(self, e);
      _$jscoverage['/touch/drag.js'].lineData[29]++;
      DomEvent.fire(currentTouch.target, dragStartEvent, getEventObject(self, e));
    }
  }
  _$jscoverage['/touch/drag.js'].lineData[33]++;
  function sample(self, e) {
    _$jscoverage['/touch/drag.js'].functionData[3]++;
    _$jscoverage['/touch/drag.js'].lineData[34]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/touch/drag.js'].lineData[35]++;
    var currentTime = e.timeStamp;
    _$jscoverage['/touch/drag.js'].lineData[36]++;
    if (visit5_36_1(currentTime - self.lastTime > SAMPLE_INTERVAL)) {
      _$jscoverage['/touch/drag.js'].lineData[37]++;
      self.lastPos = {
  pageX: currentTouch.pageX, 
  pageY: currentTouch.pageY};
      _$jscoverage['/touch/drag.js'].lineData[41]++;
      self.lastTime = currentTime;
    }
  }
  _$jscoverage['/touch/drag.js'].lineData[45]++;
  function getEventObject(self, e, ret) {
    _$jscoverage['/touch/drag.js'].functionData[4]++;
    _$jscoverage['/touch/drag.js'].lineData[46]++;
    var startPos = self.startPos;
    _$jscoverage['/touch/drag.js'].lineData[47]++;
    ret = visit6_47_1(ret || {});
    _$jscoverage['/touch/drag.js'].lineData[48]++;
    var currentTouch = self.lastTouches[0];
    _$jscoverage['/touch/drag.js'].lineData[49]++;
    ret.pageX = currentTouch.pageX;
    _$jscoverage['/touch/drag.js'].lineData[50]++;
    ret.pageY = currentTouch.pageY;
    _$jscoverage['/touch/drag.js'].lineData[51]++;
    ret.originalEvent = e.originalEvent;
    _$jscoverage['/touch/drag.js'].lineData[52]++;
    ret.deltaX = currentTouch.pageX - startPos.pageX;
    _$jscoverage['/touch/drag.js'].lineData[53]++;
    ret.deltaY = currentTouch.pageY - startPos.pageY;
    _$jscoverage['/touch/drag.js'].lineData[54]++;
    ret.startTime = self.startTime;
    _$jscoverage['/touch/drag.js'].lineData[55]++;
    ret.startPos = self.startPos;
    _$jscoverage['/touch/drag.js'].lineData[56]++;
    ret.isTouch = e.isTouch;
    _$jscoverage['/touch/drag.js'].lineData[57]++;
    ret.touch = currentTouch;
    _$jscoverage['/touch/drag.js'].lineData[58]++;
    return ret;
  }
  _$jscoverage['/touch/drag.js'].lineData[61]++;
  function Drag() {
    _$jscoverage['/touch/drag.js'].functionData[5]++;
  }
  _$jscoverage['/touch/drag.js'].lineData[64]++;
  S.extend(Drag, SingleTouch, {
  start: function() {
  _$jscoverage['/touch/drag.js'].functionData[6]++;
  _$jscoverage['/touch/drag.js'].lineData[66]++;
  var self = this;
  _$jscoverage['/touch/drag.js'].lineData[67]++;
  Drag.superclass.start.apply(self, arguments);
  _$jscoverage['/touch/drag.js'].lineData[68]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/touch/drag.js'].lineData[69]++;
  self.lastTime = self.startTime;
  _$jscoverage['/touch/drag.js'].lineData[70]++;
  self.startPos = self.lastPos = {
  pageX: touch.pageX, 
  pageY: touch.pageY};
}, 
  move: function(e) {
  _$jscoverage['/touch/drag.js'].functionData[7]++;
  _$jscoverage['/touch/drag.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/touch/drag.js'].lineData[78]++;
  Drag.superclass.move.apply(self, arguments);
  _$jscoverage['/touch/drag.js'].lineData[79]++;
  if (visit7_79_1(!self.isStarted)) {
    _$jscoverage['/touch/drag.js'].lineData[80]++;
    startDrag(self, e);
  } else {
    _$jscoverage['/touch/drag.js'].lineData[82]++;
    sample(self, e);
    _$jscoverage['/touch/drag.js'].lineData[83]++;
    DomEvent.fire(self.lastTouches[0].target, dragEvent, getEventObject(self, e));
  }
}, 
  end: function(e) {
  _$jscoverage['/touch/drag.js'].functionData[8]++;
  _$jscoverage['/touch/drag.js'].lineData[88]++;
  var self = this;
  _$jscoverage['/touch/drag.js'].lineData[89]++;
  var currentTouch = self.lastTouches[0];
  _$jscoverage['/touch/drag.js'].lineData[90]++;
  var currentTime = e.timeStamp;
  _$jscoverage['/touch/drag.js'].lineData[91]++;
  var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
  _$jscoverage['/touch/drag.js'].lineData[92]++;
  var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
  _$jscoverage['/touch/drag.js'].lineData[93]++;
  DomEvent.fire(currentTouch.target, dragEndEvent, getEventObject(self, e, {
  velocityX: velocityX, 
  velocityY: velocityY}));
}});
  _$jscoverage['/touch/drag.js'].lineData[100]++;
  eventHandleMap[dragStartEvent] = eventHandleMap[dragEvent] = eventHandleMap[dragEndEvent] = {
  handle: new Drag()};
  _$jscoverage['/touch/drag.js'].lineData[104]++;
  return Drag;
});
