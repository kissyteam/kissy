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
if (! _$jscoverage['/swipe.js']) {
  _$jscoverage['/swipe.js'] = {};
  _$jscoverage['/swipe.js'].lineData = [];
  _$jscoverage['/swipe.js'].lineData[6] = 0;
  _$jscoverage['/swipe.js'].lineData[7] = 0;
  _$jscoverage['/swipe.js'].lineData[8] = 0;
  _$jscoverage['/swipe.js'].lineData[9] = 0;
  _$jscoverage['/swipe.js'].lineData[10] = 0;
  _$jscoverage['/swipe.js'].lineData[11] = 0;
  _$jscoverage['/swipe.js'].lineData[17] = 0;
  _$jscoverage['/swipe.js'].lineData[18] = 0;
  _$jscoverage['/swipe.js'].lineData[19] = 0;
  _$jscoverage['/swipe.js'].lineData[31] = 0;
  _$jscoverage['/swipe.js'].lineData[32] = 0;
  _$jscoverage['/swipe.js'].lineData[35] = 0;
  _$jscoverage['/swipe.js'].lineData[36] = 0;
  _$jscoverage['/swipe.js'].lineData[39] = 0;
  _$jscoverage['/swipe.js'].lineData[40] = 0;
  _$jscoverage['/swipe.js'].lineData[43] = 0;
  _$jscoverage['/swipe.js'].lineData[44] = 0;
  _$jscoverage['/swipe.js'].lineData[45] = 0;
  _$jscoverage['/swipe.js'].lineData[46] = 0;
  _$jscoverage['/swipe.js'].lineData[48] = 0;
  _$jscoverage['/swipe.js'].lineData[52] = 0;
  _$jscoverage['/swipe.js'].lineData[53] = 0;
  _$jscoverage['/swipe.js'].lineData[56] = 0;
  _$jscoverage['/swipe.js'].lineData[57] = 0;
  _$jscoverage['/swipe.js'].lineData[61] = 0;
  _$jscoverage['/swipe.js'].lineData[62] = 0;
  _$jscoverage['/swipe.js'].lineData[63] = 0;
  _$jscoverage['/swipe.js'].lineData[64] = 0;
  _$jscoverage['/swipe.js'].lineData[65] = 0;
  _$jscoverage['/swipe.js'].lineData[66] = 0;
  _$jscoverage['/swipe.js'].lineData[68] = 0;
  _$jscoverage['/swipe.js'].lineData[71] = 0;
  _$jscoverage['/swipe.js'].lineData[73] = 0;
  _$jscoverage['/swipe.js'].lineData[74] = 0;
  _$jscoverage['/swipe.js'].lineData[75] = 0;
  _$jscoverage['/swipe.js'].lineData[76] = 0;
  _$jscoverage['/swipe.js'].lineData[77] = 0;
  _$jscoverage['/swipe.js'].lineData[79] = 0;
  _$jscoverage['/swipe.js'].lineData[121] = 0;
  _$jscoverage['/swipe.js'].lineData[137] = 0;
  _$jscoverage['/swipe.js'].lineData[140] = 0;
  _$jscoverage['/swipe.js'].lineData[143] = 0;
  _$jscoverage['/swipe.js'].lineData[147] = 0;
  _$jscoverage['/swipe.js'].lineData[148] = 0;
  _$jscoverage['/swipe.js'].lineData[150] = 0;
  _$jscoverage['/swipe.js'].lineData[152] = 0;
  _$jscoverage['/swipe.js'].lineData[153] = 0;
  _$jscoverage['/swipe.js'].lineData[155] = 0;
  _$jscoverage['/swipe.js'].lineData[156] = 0;
  _$jscoverage['/swipe.js'].lineData[160] = 0;
  _$jscoverage['/swipe.js'].lineData[161] = 0;
  _$jscoverage['/swipe.js'].lineData[165] = 0;
  _$jscoverage['/swipe.js'].lineData[166] = 0;
  _$jscoverage['/swipe.js'].lineData[170] = 0;
  _$jscoverage['/swipe.js'].lineData[174] = 0;
}
if (! _$jscoverage['/swipe.js'].functionData) {
  _$jscoverage['/swipe.js'].functionData = [];
  _$jscoverage['/swipe.js'].functionData[0] = 0;
  _$jscoverage['/swipe.js'].functionData[1] = 0;
  _$jscoverage['/swipe.js'].functionData[2] = 0;
  _$jscoverage['/swipe.js'].functionData[3] = 0;
  _$jscoverage['/swipe.js'].functionData[4] = 0;
  _$jscoverage['/swipe.js'].functionData[5] = 0;
}
if (! _$jscoverage['/swipe.js'].branchData) {
  _$jscoverage['/swipe.js'].branchData = {};
  _$jscoverage['/swipe.js'].branchData['31'] = [];
  _$jscoverage['/swipe.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['35'] = [];
  _$jscoverage['/swipe.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['39'] = [];
  _$jscoverage['/swipe.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['43'] = [];
  _$jscoverage['/swipe.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['44'] = [];
  _$jscoverage['/swipe.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['45'] = [];
  _$jscoverage['/swipe.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['52'] = [];
  _$jscoverage['/swipe.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['56'] = [];
  _$jscoverage['/swipe.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['61'] = [];
  _$jscoverage['/swipe.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['62'] = [];
  _$jscoverage['/swipe.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['64'] = [];
  _$jscoverage['/swipe.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['65'] = [];
  _$jscoverage['/swipe.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['73'] = [];
  _$jscoverage['/swipe.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/swipe.js'].branchData['75'] = [];
  _$jscoverage['/swipe.js'].branchData['75'][1] = new BranchData();
}
_$jscoverage['/swipe.js'].branchData['75'][1].init(1634, 28, 'direction && !self.isStarted');
function visit18_75_1(result) {
  _$jscoverage['/swipe.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['73'][1].init(1573, 4, '!ing');
function visit17_73_1(result) {
  _$jscoverage['/swipe.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['65'][1].init(26, 10, 'deltaY < 0');
function visit16_65_1(result) {
  _$jscoverage['/swipe.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['64'][1].init(1374, 15, 'self.isVertical');
function visit15_64_1(result) {
  _$jscoverage['/swipe.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['62'][1].init(26, 10, 'deltaX < 0');
function visit14_62_1(result) {
  _$jscoverage['/swipe.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['61'][1].init(1241, 17, 'self.isHorizontal');
function visit13_61_1(result) {
  _$jscoverage['/swipe.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['56'][2].init(158, 24, 'absDeltaX < MIN_DISTANCE');
function visit12_56_2(result) {
  _$jscoverage['/swipe.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['56'][1].init(137, 45, 'self.isHorizontal && absDeltaX < MIN_DISTANCE');
function visit11_56_1(result) {
  _$jscoverage['/swipe.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['52'][2].init(37, 24, 'absDeltaY < MIN_DISTANCE');
function visit10_52_2(result) {
  _$jscoverage['/swipe.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['52'][1].init(18, 43, 'self.isVertical && absDeltaY < MIN_DISTANCE');
function visit9_52_1(result) {
  _$jscoverage['/swipe.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['45'][1].init(22, 21, 'absDeltaY > absDeltaX');
function visit8_45_1(result) {
  _$jscoverage['/swipe.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['44'][1].init(18, 36, 'self.isVertical && self.isHorizontal');
function visit7_44_1(result) {
  _$jscoverage['/swipe.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['43'][1].init(701, 3, 'ing');
function visit6_43_1(result) {
  _$jscoverage['/swipe.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['39'][2].init(613, 22, 'absDeltaY > MAX_OFFSET');
function visit5_39_2(result) {
  _$jscoverage['/swipe.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['39'][1].init(592, 43, 'self.isHorizontal && absDeltaY > MAX_OFFSET');
function visit4_39_1(result) {
  _$jscoverage['/swipe.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['35'][2].init(506, 22, 'absDeltaX > MAX_OFFSET');
function visit3_35_2(result) {
  _$jscoverage['/swipe.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['35'][1].init(487, 41, 'self.isVertical && absDeltaX > MAX_OFFSET');
function visit2_35_1(result) {
  _$jscoverage['/swipe.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].branchData['31'][1].init(394, 36, 'time - self.startTime > MAX_DURATION');
function visit1_31_1(result) {
  _$jscoverage['/swipe.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/swipe.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/swipe.js'].functionData[0]++;
  _$jscoverage['/swipe.js'].lineData[7]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/swipe.js'].lineData[8]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/swipe.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/swipe.js'].lineData[10]++;
  var SingleTouch = GestureUtil.SingleTouch;
  _$jscoverage['/swipe.js'].lineData[11]++;
  var SWIPE = 'swipe', SWIPE_START = 'swipeStart', SWIPE_END = 'swipeEnd', MAX_DURATION = 1000, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  _$jscoverage['/swipe.js'].lineData[17]++;
  var util = require('util');
  _$jscoverage['/swipe.js'].lineData[18]++;
  function fire(self, e, ing) {
    _$jscoverage['/swipe.js'].functionData[1]++;
    _$jscoverage['/swipe.js'].lineData[19]++;
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, time = e.timeStamp, direction;
    _$jscoverage['/swipe.js'].lineData[31]++;
    if (visit1_31_1(time - self.startTime > MAX_DURATION)) {
      _$jscoverage['/swipe.js'].lineData[32]++;
      return false;
    }
    _$jscoverage['/swipe.js'].lineData[35]++;
    if (visit2_35_1(self.isVertical && visit3_35_2(absDeltaX > MAX_OFFSET))) {
      _$jscoverage['/swipe.js'].lineData[36]++;
      self.isVertical = 0;
    }
    _$jscoverage['/swipe.js'].lineData[39]++;
    if (visit4_39_1(self.isHorizontal && visit5_39_2(absDeltaY > MAX_OFFSET))) {
      _$jscoverage['/swipe.js'].lineData[40]++;
      self.isHorizontal = 0;
    }
    _$jscoverage['/swipe.js'].lineData[43]++;
    if (visit6_43_1(ing)) {
      _$jscoverage['/swipe.js'].lineData[44]++;
      if (visit7_44_1(self.isVertical && self.isHorizontal)) {
        _$jscoverage['/swipe.js'].lineData[45]++;
        if (visit8_45_1(absDeltaY > absDeltaX)) {
          _$jscoverage['/swipe.js'].lineData[46]++;
          self.isHorizontal = 0;
        } else {
          _$jscoverage['/swipe.js'].lineData[48]++;
          self.isVertical = 0;
        }
      }
    } else {
      _$jscoverage['/swipe.js'].lineData[52]++;
      if (visit9_52_1(self.isVertical && visit10_52_2(absDeltaY < MIN_DISTANCE))) {
        _$jscoverage['/swipe.js'].lineData[53]++;
        self.isVertical = 0;
      }
      _$jscoverage['/swipe.js'].lineData[56]++;
      if (visit11_56_1(self.isHorizontal && visit12_56_2(absDeltaX < MIN_DISTANCE))) {
        _$jscoverage['/swipe.js'].lineData[57]++;
        self.isHorizontal = 0;
      }
    }
    _$jscoverage['/swipe.js'].lineData[61]++;
    if (visit13_61_1(self.isHorizontal)) {
      _$jscoverage['/swipe.js'].lineData[62]++;
      direction = visit14_62_1(deltaX < 0) ? 'left' : 'right';
      _$jscoverage['/swipe.js'].lineData[63]++;
      distance = absDeltaX;
    } else {
      _$jscoverage['/swipe.js'].lineData[64]++;
      if (visit15_64_1(self.isVertical)) {
        _$jscoverage['/swipe.js'].lineData[65]++;
        direction = visit16_65_1(deltaY < 0) ? 'up' : 'down';
        _$jscoverage['/swipe.js'].lineData[66]++;
        distance = absDeltaY;
      } else {
        _$jscoverage['/swipe.js'].lineData[68]++;
        return false;
      }
    }
    _$jscoverage['/swipe.js'].lineData[71]++;
    var event;
    _$jscoverage['/swipe.js'].lineData[73]++;
    if (visit17_73_1(!ing)) {
      _$jscoverage['/swipe.js'].lineData[74]++;
      event = SWIPE_END;
    } else {
      _$jscoverage['/swipe.js'].lineData[75]++;
      if (visit18_75_1(direction && !self.isStarted)) {
        _$jscoverage['/swipe.js'].lineData[76]++;
        self.isStarted = 1;
        _$jscoverage['/swipe.js'].lineData[77]++;
        event = SWIPE_START;
      } else {
        _$jscoverage['/swipe.js'].lineData[79]++;
        event = SWIPE;
      }
    }
    _$jscoverage['/swipe.js'].lineData[121]++;
    DomEvent.fire(touch.target, event, {
  originalEvent: e.originalEvent, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  direction: direction, 
  distance: distance, 
  duration: (e.timeStamp - self.startTime) / 1000});
    _$jscoverage['/swipe.js'].lineData[137]++;
    return undefined;
  }
  _$jscoverage['/swipe.js'].lineData[140]++;
  function Swipe() {
    _$jscoverage['/swipe.js'].functionData[2]++;
  }
  _$jscoverage['/swipe.js'].lineData[143]++;
  util.extend(Swipe, SingleTouch, {
  requiredGestureType: 'touch', 
  start: function() {
  _$jscoverage['/swipe.js'].functionData[3]++;
  _$jscoverage['/swipe.js'].lineData[147]++;
  var self = this;
  _$jscoverage['/swipe.js'].lineData[148]++;
  Swipe.superclass.start.apply(self, arguments);
  _$jscoverage['/swipe.js'].lineData[150]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/swipe.js'].lineData[152]++;
  self.isHorizontal = 1;
  _$jscoverage['/swipe.js'].lineData[153]++;
  self.isVertical = 1;
  _$jscoverage['/swipe.js'].lineData[155]++;
  self.startX = touch.pageX;
  _$jscoverage['/swipe.js'].lineData[156]++;
  self.startY = touch.pageY;
}, 
  move: function(e) {
  _$jscoverage['/swipe.js'].functionData[4]++;
  _$jscoverage['/swipe.js'].lineData[160]++;
  Swipe.superclass.move.apply(this, arguments);
  _$jscoverage['/swipe.js'].lineData[161]++;
  return fire(this, e, 1);
}, 
  end: function(e) {
  _$jscoverage['/swipe.js'].functionData[5]++;
  _$jscoverage['/swipe.js'].lineData[165]++;
  Swipe.superclass.end.apply(this, arguments);
  _$jscoverage['/swipe.js'].lineData[166]++;
  return fire(this, e, 0);
}});
  _$jscoverage['/swipe.js'].lineData[170]++;
  addGestureEvent([SWIPE, SWIPE_START, SWIPE_END], {
  handle: new Swipe()});
  _$jscoverage['/swipe.js'].lineData[174]++;
  return {
  SWIPE: SWIPE, 
  SWIPE_START: SWIPE_START, 
  SWIPE_END: SWIPE_END};
});
