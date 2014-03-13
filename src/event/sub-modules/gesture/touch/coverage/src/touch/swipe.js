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
if (! _$jscoverage['/touch/swipe.js']) {
  _$jscoverage['/touch/swipe.js'] = {};
  _$jscoverage['/touch/swipe.js'].lineData = [];
  _$jscoverage['/touch/swipe.js'].lineData[6] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[7] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[8] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[9] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[10] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[11] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[17] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[18] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[29] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[30] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[32] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[33] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[36] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[37] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[39] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[43] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[44] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[47] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[48] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[52] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[53] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[54] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[55] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[56] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[57] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[59] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[62] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[107] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[110] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[113] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[117] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[118] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[119] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[121] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[123] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[124] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[126] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[127] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[131] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[134] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[136] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[137] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[140] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[148] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[149] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[152] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[153] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[156] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[160] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[161] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[162] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[164] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[168] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[172] = 0;
}
if (! _$jscoverage['/touch/swipe.js'].functionData) {
  _$jscoverage['/touch/swipe.js'].functionData = [];
  _$jscoverage['/touch/swipe.js'].functionData[0] = 0;
  _$jscoverage['/touch/swipe.js'].functionData[1] = 0;
  _$jscoverage['/touch/swipe.js'].functionData[2] = 0;
  _$jscoverage['/touch/swipe.js'].functionData[3] = 0;
  _$jscoverage['/touch/swipe.js'].functionData[4] = 0;
  _$jscoverage['/touch/swipe.js'].functionData[5] = 0;
}
if (! _$jscoverage['/touch/swipe.js'].branchData) {
  _$jscoverage['/touch/swipe.js'].branchData = {};
  _$jscoverage['/touch/swipe.js'].branchData['29'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['30'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['32'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['36'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['43'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['47'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['52'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['53'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['55'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['56'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['136'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['148'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['152'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['161'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['161'][1] = new BranchData();
}
_$jscoverage['/touch/swipe.js'].branchData['161'][1].init(46, 22, 'self.move(e) === false');
function visit38_161_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['152'][2].init(665, 22, 'absDeltaY > MAX_OFFSET');
function visit37_152_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['152'][1].init(644, 43, 'self.isHorizontal && absDeltaY > MAX_OFFSET');
function visit36_152_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['148'][2].init(550, 22, 'absDeltaX > MAX_OFFSET');
function visit35_148_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['148'][1].init(531, 41, 'self.isVertical && absDeltaX > MAX_OFFSET');
function visit34_148_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['136'][1].init(142, 36, 'time - self.startTime > MAX_DURATION');
function visit33_136_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['56'][1].init(25, 10, 'deltaY < 0');
function visit32_56_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['55'][1].init(1158, 15, 'self.isVertical');
function visit31_55_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['53'][1].init(25, 10, 'deltaX < 0');
function visit30_53_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['52'][1].init(1028, 17, 'self.isHorizontal');
function visit29_52_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['47'][2].init(153, 24, 'absDeltaX < MIN_DISTANCE');
function visit28_47_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['47'][1].init(132, 45, 'self.isHorizontal && absDeltaX < MIN_DISTANCE');
function visit27_47_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['43'][2].init(36, 24, 'absDeltaY < MIN_DISTANCE');
function visit26_43_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['43'][1].init(17, 43, 'self.isVertical && absDeltaY < MIN_DISTANCE');
function visit25_43_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['36'][1].init(178, 21, 'absDeltaY > absDeltaX');
function visit24_36_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['32'][1].init(63, 34, 'Math.max(absDeltaX, absDeltaY) < 5');
function visit23_32_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['30'][1].init(17, 36, 'self.isVertical && self.isHorizontal');
function visit22_30_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['29'][1].init(349, 3, 'ing');
function visit21_29_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/swipe.js'].functionData[0]++;
  _$jscoverage['/touch/swipe.js'].lineData[7]++;
  var GestureBase = require('event/gesture/base');
  _$jscoverage['/touch/swipe.js'].lineData[8]++;
  var addGestureEvent = GestureBase.addEvent;
  _$jscoverage['/touch/swipe.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/swipe.js'].lineData[10]++;
  var SingleTouch = GestureBase.SingleTouch;
  _$jscoverage['/touch/swipe.js'].lineData[11]++;
  var SWIPE = 'swipe', SWIPING = 'swiping', MAX_DURATION = 1000, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  _$jscoverage['/touch/swipe.js'].lineData[17]++;
  function fire(self, e, ing) {
    _$jscoverage['/touch/swipe.js'].functionData[1]++;
    _$jscoverage['/touch/swipe.js'].lineData[18]++;
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, direction;
    _$jscoverage['/touch/swipe.js'].lineData[29]++;
    if (visit21_29_1(ing)) {
      _$jscoverage['/touch/swipe.js'].lineData[30]++;
      if (visit22_30_1(self.isVertical && self.isHorizontal)) {
        _$jscoverage['/touch/swipe.js'].lineData[32]++;
        if (visit23_32_1(Math.max(absDeltaX, absDeltaY) < 5)) {
          _$jscoverage['/touch/swipe.js'].lineData[33]++;
          return undefined;
        }
        _$jscoverage['/touch/swipe.js'].lineData[36]++;
        if (visit24_36_1(absDeltaY > absDeltaX)) {
          _$jscoverage['/touch/swipe.js'].lineData[37]++;
          self.isHorizontal = 0;
        } else {
          _$jscoverage['/touch/swipe.js'].lineData[39]++;
          self.isVertical = 0;
        }
      }
    } else {
      _$jscoverage['/touch/swipe.js'].lineData[43]++;
      if (visit25_43_1(self.isVertical && visit26_43_2(absDeltaY < MIN_DISTANCE))) {
        _$jscoverage['/touch/swipe.js'].lineData[44]++;
        self.isVertical = 0;
      }
      _$jscoverage['/touch/swipe.js'].lineData[47]++;
      if (visit27_47_1(self.isHorizontal && visit28_47_2(absDeltaX < MIN_DISTANCE))) {
        _$jscoverage['/touch/swipe.js'].lineData[48]++;
        self.isHorizontal = 0;
      }
    }
    _$jscoverage['/touch/swipe.js'].lineData[52]++;
    if (visit29_52_1(self.isHorizontal)) {
      _$jscoverage['/touch/swipe.js'].lineData[53]++;
      direction = visit30_53_1(deltaX < 0) ? 'left' : 'right';
      _$jscoverage['/touch/swipe.js'].lineData[54]++;
      distance = absDeltaX;
    } else {
      _$jscoverage['/touch/swipe.js'].lineData[55]++;
      if (visit31_55_1(self.isVertical)) {
        _$jscoverage['/touch/swipe.js'].lineData[56]++;
        direction = visit32_56_1(deltaY < 0) ? 'up' : 'down';
        _$jscoverage['/touch/swipe.js'].lineData[57]++;
        distance = absDeltaY;
      } else {
        _$jscoverage['/touch/swipe.js'].lineData[59]++;
        return false;
      }
    }
    _$jscoverage['/touch/swipe.js'].lineData[62]++;
    DomEvent.fire(touch.target, ing ? SWIPING : SWIPE, {
  originalEvent: e.originalEvent, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  touch: touch, 
  direction: direction, 
  distance: distance, 
  duration: (e.timeStamp - self.startTime) / 1000});
    _$jscoverage['/touch/swipe.js'].lineData[107]++;
    return undefined;
  }
  _$jscoverage['/touch/swipe.js'].lineData[110]++;
  function Swipe() {
    _$jscoverage['/touch/swipe.js'].functionData[2]++;
  }
  _$jscoverage['/touch/swipe.js'].lineData[113]++;
  S.extend(Swipe, SingleTouch, {
  requiredGestureType: 'touch', 
  start: function() {
  _$jscoverage['/touch/swipe.js'].functionData[3]++;
  _$jscoverage['/touch/swipe.js'].lineData[117]++;
  var self = this;
  _$jscoverage['/touch/swipe.js'].lineData[118]++;
  Swipe.superclass.start.apply(self, arguments);
  _$jscoverage['/touch/swipe.js'].lineData[119]++;
  self.isStarted = true;
  _$jscoverage['/touch/swipe.js'].lineData[121]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/touch/swipe.js'].lineData[123]++;
  self.isHorizontal = 1;
  _$jscoverage['/touch/swipe.js'].lineData[124]++;
  self.isVertical = 1;
  _$jscoverage['/touch/swipe.js'].lineData[126]++;
  self.startX = touch.pageX;
  _$jscoverage['/touch/swipe.js'].lineData[127]++;
  self.startY = touch.pageY;
}, 
  move: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[4]++;
  _$jscoverage['/touch/swipe.js'].lineData[131]++;
  var self = this, time = e.timeStamp;
  _$jscoverage['/touch/swipe.js'].lineData[134]++;
  Swipe.superclass.move.apply(self, arguments);
  _$jscoverage['/touch/swipe.js'].lineData[136]++;
  if (visit33_136_1(time - self.startTime > MAX_DURATION)) {
    _$jscoverage['/touch/swipe.js'].lineData[137]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[140]++;
  var touch = self.lastTouches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
  _$jscoverage['/touch/swipe.js'].lineData[148]++;
  if (visit34_148_1(self.isVertical && visit35_148_2(absDeltaX > MAX_OFFSET))) {
    _$jscoverage['/touch/swipe.js'].lineData[149]++;
    self.isVertical = 0;
  }
  _$jscoverage['/touch/swipe.js'].lineData[152]++;
  if (visit36_152_1(self.isHorizontal && visit37_152_2(absDeltaY > MAX_OFFSET))) {
    _$jscoverage['/touch/swipe.js'].lineData[153]++;
    self.isHorizontal = 0;
  }
  _$jscoverage['/touch/swipe.js'].lineData[156]++;
  return fire(self, e, 1);
}, 
  end: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[5]++;
  _$jscoverage['/touch/swipe.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/touch/swipe.js'].lineData[161]++;
  if (visit38_161_1(self.move(e) === false)) {
    _$jscoverage['/touch/swipe.js'].lineData[162]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[164]++;
  return fire(self, e, 0);
}});
  _$jscoverage['/touch/swipe.js'].lineData[168]++;
  addGestureEvent([SWIPE, SWIPING], {
  handle: new Swipe()});
  _$jscoverage['/touch/swipe.js'].lineData[172]++;
  return {
  SWIPE: SWIPE, 
  SWIPING: SWIPING};
});
