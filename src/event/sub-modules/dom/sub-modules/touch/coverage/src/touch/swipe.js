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
  _$jscoverage['/touch/swipe.js'].lineData[16] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[17] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[28] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[29] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[31] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[32] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[35] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[36] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[38] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[42] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[43] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[46] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[47] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[51] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[52] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[53] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[54] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[55] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[56] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[58] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[61] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[106] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[109] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[112] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[114] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[115] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[118] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[119] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[120] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[122] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[124] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[125] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[127] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[128] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[132] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[135] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[137] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[138] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[141] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[149] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[150] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[153] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[154] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[157] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[161] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[162] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[163] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[165] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[169] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[173] = 0;
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
  _$jscoverage['/touch/swipe.js'].branchData['28'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['29'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['31'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['35'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['42'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['46'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['51'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['52'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['54'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['55'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['114'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['137'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['149'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['153'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['162'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['162'][1] = new BranchData();
}
_$jscoverage['/touch/swipe.js'].branchData['162'][1].init(46, 22, 'self.move(e) === false');
function visit99_162_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['153'][2].init(665, 22, 'absDeltaY > MAX_OFFSET');
function visit98_153_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['153'][1].init(644, 43, 'self.isHorizontal && absDeltaY > MAX_OFFSET');
function visit97_153_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['149'][2].init(550, 22, 'absDeltaX > MAX_OFFSET');
function visit96_149_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['149'][1].init(531, 41, 'self.isVertical && absDeltaX > MAX_OFFSET');
function visit95_149_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['137'][1].init(142, 36, 'time - self.startTime > MAX_DURATION');
function visit94_137_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['114'][1].init(16, 10, '!e.isTouch');
function visit93_114_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['55'][1].init(25, 10, 'deltaY < 0');
function visit92_55_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['54'][1].init(1158, 15, 'self.isVertical');
function visit91_54_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['52'][1].init(25, 10, 'deltaX < 0');
function visit90_52_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['51'][1].init(1028, 17, 'self.isHorizontal');
function visit89_51_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['46'][2].init(153, 24, 'absDeltaX < MIN_DISTANCE');
function visit88_46_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['46'][1].init(132, 45, 'self.isHorizontal && absDeltaX < MIN_DISTANCE');
function visit87_46_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['42'][2].init(36, 24, 'absDeltaY < MIN_DISTANCE');
function visit86_42_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['42'][1].init(17, 43, 'self.isVertical && absDeltaY < MIN_DISTANCE');
function visit85_42_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['35'][1].init(178, 21, 'absDeltaY > absDeltaX');
function visit84_35_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['31'][1].init(63, 34, 'Math.max(absDeltaX, absDeltaY) < 5');
function visit83_31_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['29'][1].init(17, 36, 'self.isVertical && self.isHorizontal');
function visit82_29_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['28'][1].init(349, 3, 'ing');
function visit81_28_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/swipe.js'].functionData[0]++;
  _$jscoverage['/touch/swipe.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/swipe.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/swipe.js'].lineData[9]++;
  var SingleTouch = require('./single-touch');
  _$jscoverage['/touch/swipe.js'].lineData[10]++;
  var event = 'swipe', ingEvent = 'swiping', MAX_DURATION = 1000, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  _$jscoverage['/touch/swipe.js'].lineData[16]++;
  function fire(self, e, ing) {
    _$jscoverage['/touch/swipe.js'].functionData[1]++;
    _$jscoverage['/touch/swipe.js'].lineData[17]++;
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, direction;
    _$jscoverage['/touch/swipe.js'].lineData[28]++;
    if (visit81_28_1(ing)) {
      _$jscoverage['/touch/swipe.js'].lineData[29]++;
      if (visit82_29_1(self.isVertical && self.isHorizontal)) {
        _$jscoverage['/touch/swipe.js'].lineData[31]++;
        if (visit83_31_1(Math.max(absDeltaX, absDeltaY) < 5)) {
          _$jscoverage['/touch/swipe.js'].lineData[32]++;
          return undefined;
        }
        _$jscoverage['/touch/swipe.js'].lineData[35]++;
        if (visit84_35_1(absDeltaY > absDeltaX)) {
          _$jscoverage['/touch/swipe.js'].lineData[36]++;
          self.isHorizontal = 0;
        } else {
          _$jscoverage['/touch/swipe.js'].lineData[38]++;
          self.isVertical = 0;
        }
      }
    } else {
      _$jscoverage['/touch/swipe.js'].lineData[42]++;
      if (visit85_42_1(self.isVertical && visit86_42_2(absDeltaY < MIN_DISTANCE))) {
        _$jscoverage['/touch/swipe.js'].lineData[43]++;
        self.isVertical = 0;
      }
      _$jscoverage['/touch/swipe.js'].lineData[46]++;
      if (visit87_46_1(self.isHorizontal && visit88_46_2(absDeltaX < MIN_DISTANCE))) {
        _$jscoverage['/touch/swipe.js'].lineData[47]++;
        self.isHorizontal = 0;
      }
    }
    _$jscoverage['/touch/swipe.js'].lineData[51]++;
    if (visit89_51_1(self.isHorizontal)) {
      _$jscoverage['/touch/swipe.js'].lineData[52]++;
      direction = visit90_52_1(deltaX < 0) ? 'left' : 'right';
      _$jscoverage['/touch/swipe.js'].lineData[53]++;
      distance = absDeltaX;
    } else {
      _$jscoverage['/touch/swipe.js'].lineData[54]++;
      if (visit91_54_1(self.isVertical)) {
        _$jscoverage['/touch/swipe.js'].lineData[55]++;
        direction = visit92_55_1(deltaY < 0) ? 'up' : 'down';
        _$jscoverage['/touch/swipe.js'].lineData[56]++;
        distance = absDeltaY;
      } else {
        _$jscoverage['/touch/swipe.js'].lineData[58]++;
        return false;
      }
    }
    _$jscoverage['/touch/swipe.js'].lineData[61]++;
    DomEvent.fire(touch.target, ing ? ingEvent : event, {
  originalEvent: e.originalEvent, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  touch: touch, 
  direction: direction, 
  distance: distance, 
  duration: (e.timeStamp - self.startTime) / 1000});
    _$jscoverage['/touch/swipe.js'].lineData[106]++;
    return undefined;
  }
  _$jscoverage['/touch/swipe.js'].lineData[109]++;
  function Swipe() {
    _$jscoverage['/touch/swipe.js'].functionData[2]++;
  }
  _$jscoverage['/touch/swipe.js'].lineData[112]++;
  S.extend(Swipe, SingleTouch, {
  start: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[3]++;
  _$jscoverage['/touch/swipe.js'].lineData[114]++;
  if (visit93_114_1(!e.isTouch)) {
    _$jscoverage['/touch/swipe.js'].lineData[115]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[118]++;
  var self = this;
  _$jscoverage['/touch/swipe.js'].lineData[119]++;
  Swipe.superclass.start.apply(self, arguments);
  _$jscoverage['/touch/swipe.js'].lineData[120]++;
  self.isStarted = true;
  _$jscoverage['/touch/swipe.js'].lineData[122]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/touch/swipe.js'].lineData[124]++;
  self.isHorizontal = 1;
  _$jscoverage['/touch/swipe.js'].lineData[125]++;
  self.isVertical = 1;
  _$jscoverage['/touch/swipe.js'].lineData[127]++;
  self.startX = touch.pageX;
  _$jscoverage['/touch/swipe.js'].lineData[128]++;
  self.startY = touch.pageY;
}, 
  move: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[4]++;
  _$jscoverage['/touch/swipe.js'].lineData[132]++;
  var self = this, time = e.timeStamp;
  _$jscoverage['/touch/swipe.js'].lineData[135]++;
  Swipe.superclass.move.apply(self, arguments);
  _$jscoverage['/touch/swipe.js'].lineData[137]++;
  if (visit94_137_1(time - self.startTime > MAX_DURATION)) {
    _$jscoverage['/touch/swipe.js'].lineData[138]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[141]++;
  var touch = self.lastTouches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
  _$jscoverage['/touch/swipe.js'].lineData[149]++;
  if (visit95_149_1(self.isVertical && visit96_149_2(absDeltaX > MAX_OFFSET))) {
    _$jscoverage['/touch/swipe.js'].lineData[150]++;
    self.isVertical = 0;
  }
  _$jscoverage['/touch/swipe.js'].lineData[153]++;
  if (visit97_153_1(self.isHorizontal && visit98_153_2(absDeltaY > MAX_OFFSET))) {
    _$jscoverage['/touch/swipe.js'].lineData[154]++;
    self.isHorizontal = 0;
  }
  _$jscoverage['/touch/swipe.js'].lineData[157]++;
  return fire(self, e, 1);
}, 
  end: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[5]++;
  _$jscoverage['/touch/swipe.js'].lineData[161]++;
  var self = this;
  _$jscoverage['/touch/swipe.js'].lineData[162]++;
  if (visit99_162_1(self.move(e) === false)) {
    _$jscoverage['/touch/swipe.js'].lineData[163]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[165]++;
  return fire(self, e, 0);
}});
  _$jscoverage['/touch/swipe.js'].lineData[169]++;
  eventHandleMap[event] = eventHandleMap[ingEvent] = {
  handle: new Swipe()};
  _$jscoverage['/touch/swipe.js'].lineData[173]++;
  return Swipe;
});
