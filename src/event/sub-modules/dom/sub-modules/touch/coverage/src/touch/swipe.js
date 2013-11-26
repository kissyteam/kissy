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
  _$jscoverage['/touch/swipe.js'].lineData[11] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[18] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[19] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[30] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[31] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[33] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[34] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[37] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[38] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[40] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[44] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[45] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[48] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[49] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[53] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[54] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[55] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[56] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[57] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[58] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[60] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[63] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[105] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[108] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[111] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[114] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[115] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[116] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[118] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[119] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[121] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[122] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[124] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[125] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[127] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[128] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[130] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[134] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[144] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[145] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[148] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[149] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[152] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[153] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[156] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[160] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[161] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[162] = 0;
  _$jscoverage['/touch/swipe.js'].lineData[164] = 0;
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
  _$jscoverage['/touch/swipe.js'].branchData['30'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['31'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['33'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['37'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['44'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['48'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['53'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['54'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['56'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['57'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['115'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['127'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['144'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['148'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['152'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/touch/swipe.js'].branchData['161'] = [];
  _$jscoverage['/touch/swipe.js'].branchData['161'][1] = new BranchData();
}
_$jscoverage['/touch/swipe.js'].branchData['161'][1].init(46, 29, 'self.onTouchMove(e) === false');
function visit103_161_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['152'][2].init(605, 22, 'absDeltaY > MAX_OFFSET');
function visit102_152_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['152'][1].init(584, 43, 'self.isHorizontal && absDeltaY > MAX_OFFSET');
function visit101_152_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['148'][2].init(490, 22, 'absDeltaX > MAX_OFFSET');
function visit100_148_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['148'][1].init(471, 41, 'self.isVertical && absDeltaX > MAX_OFFSET');
function visit99_148_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['144'][1].init(370, 36, 'time - self.startTime > MAX_DURATION');
function visit98_144_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['127'][1].init(401, 29, 'e.type.indexOf(\'mouse\') != -1');
function visit97_127_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['115'][1].init(46, 62, 'Swipe.superclass.onTouchStart.apply(self, arguments) === false');
function visit96_115_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['57'][1].init(25, 10, 'deltaY < 0');
function visit95_57_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['56'][1].init(1158, 15, 'self.isVertical');
function visit94_56_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['54'][1].init(25, 10, 'deltaX < 0');
function visit93_54_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['53'][1].init(1028, 17, 'self.isHorizontal');
function visit92_53_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['48'][2].init(153, 24, 'absDeltaX < MIN_DISTANCE');
function visit91_48_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['48'][1].init(132, 45, 'self.isHorizontal && absDeltaX < MIN_DISTANCE');
function visit90_48_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['44'][2].init(36, 24, 'absDeltaY < MIN_DISTANCE');
function visit89_44_2(result) {
  _$jscoverage['/touch/swipe.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['44'][1].init(17, 43, 'self.isVertical && absDeltaY < MIN_DISTANCE');
function visit88_44_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['37'][1].init(178, 21, 'absDeltaY > absDeltaX');
function visit87_37_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['33'][1].init(63, 34, 'Math.max(absDeltaX, absDeltaY) < 5');
function visit86_33_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['31'][1].init(17, 36, 'self.isVertical && self.isHorizontal');
function visit85_31_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/swipe.js'].branchData['30'][1].init(349, 3, 'ing');
function visit84_30_1(result) {
  _$jscoverage['/touch/swipe.js'].branchData['30'][1].ranCondition(result);
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
  _$jscoverage['/touch/swipe.js'].lineData[11]++;
  var event = 'swipe', undefined = undefined, ingEvent = 'swiping', MAX_DURATION = 1000, MAX_OFFSET = 35, MIN_DISTANCE = 50;
  _$jscoverage['/touch/swipe.js'].lineData[18]++;
  function fire(self, e, ing) {
    _$jscoverage['/touch/swipe.js'].functionData[1]++;
    _$jscoverage['/touch/swipe.js'].lineData[19]++;
    var touches = e.changedTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, direction;
    _$jscoverage['/touch/swipe.js'].lineData[30]++;
    if (visit84_30_1(ing)) {
      _$jscoverage['/touch/swipe.js'].lineData[31]++;
      if (visit85_31_1(self.isVertical && self.isHorizontal)) {
        _$jscoverage['/touch/swipe.js'].lineData[33]++;
        if (visit86_33_1(Math.max(absDeltaX, absDeltaY) < 5)) {
          _$jscoverage['/touch/swipe.js'].lineData[34]++;
          return undefined;
        }
        _$jscoverage['/touch/swipe.js'].lineData[37]++;
        if (visit87_37_1(absDeltaY > absDeltaX)) {
          _$jscoverage['/touch/swipe.js'].lineData[38]++;
          self.isHorizontal = 0;
        } else {
          _$jscoverage['/touch/swipe.js'].lineData[40]++;
          self.isVertical = 0;
        }
      }
    } else {
      _$jscoverage['/touch/swipe.js'].lineData[44]++;
      if (visit88_44_1(self.isVertical && visit89_44_2(absDeltaY < MIN_DISTANCE))) {
        _$jscoverage['/touch/swipe.js'].lineData[45]++;
        self.isVertical = 0;
      }
      _$jscoverage['/touch/swipe.js'].lineData[48]++;
      if (visit90_48_1(self.isHorizontal && visit91_48_2(absDeltaX < MIN_DISTANCE))) {
        _$jscoverage['/touch/swipe.js'].lineData[49]++;
        self.isHorizontal = 0;
      }
    }
    _$jscoverage['/touch/swipe.js'].lineData[53]++;
    if (visit92_53_1(self.isHorizontal)) {
      _$jscoverage['/touch/swipe.js'].lineData[54]++;
      direction = visit93_54_1(deltaX < 0) ? 'left' : 'right';
      _$jscoverage['/touch/swipe.js'].lineData[55]++;
      distance = absDeltaX;
    } else {
      _$jscoverage['/touch/swipe.js'].lineData[56]++;
      if (visit94_56_1(self.isVertical)) {
        _$jscoverage['/touch/swipe.js'].lineData[57]++;
        direction = visit95_57_1(deltaY < 0) ? 'up' : 'down';
        _$jscoverage['/touch/swipe.js'].lineData[58]++;
        distance = absDeltaY;
      } else {
        _$jscoverage['/touch/swipe.js'].lineData[60]++;
        return false;
      }
    }
    _$jscoverage['/touch/swipe.js'].lineData[63]++;
    DomEvent.fire(e.target, ing ? ingEvent : event, {
  originalEvent: e.originalEvent, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  touch: touch, 
  direction: direction, 
  distance: distance, 
  duration: (e.timeStamp - self.startTime) / 1000});
    _$jscoverage['/touch/swipe.js'].lineData[105]++;
    return undefined;
  }
  _$jscoverage['/touch/swipe.js'].lineData[108]++;
  function Swipe() {
    _$jscoverage['/touch/swipe.js'].functionData[2]++;
  }
  _$jscoverage['/touch/swipe.js'].lineData[111]++;
  S.extend(Swipe, SingleTouch, {
  onTouchStart: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[3]++;
  _$jscoverage['/touch/swipe.js'].lineData[114]++;
  var self = this;
  _$jscoverage['/touch/swipe.js'].lineData[115]++;
  if (visit96_115_1(Swipe.superclass.onTouchStart.apply(self, arguments) === false)) {
    _$jscoverage['/touch/swipe.js'].lineData[116]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[118]++;
  var touch = e.touches[0];
  _$jscoverage['/touch/swipe.js'].lineData[119]++;
  self.startTime = e.timeStamp;
  _$jscoverage['/touch/swipe.js'].lineData[121]++;
  self.isHorizontal = 1;
  _$jscoverage['/touch/swipe.js'].lineData[122]++;
  self.isVertical = 1;
  _$jscoverage['/touch/swipe.js'].lineData[124]++;
  self.startX = touch.pageX;
  _$jscoverage['/touch/swipe.js'].lineData[125]++;
  this.startY = touch.pageY;
  _$jscoverage['/touch/swipe.js'].lineData[127]++;
  if (visit97_127_1(e.type.indexOf('mouse') != -1)) {
    _$jscoverage['/touch/swipe.js'].lineData[128]++;
    e.preventDefault();
  }
  _$jscoverage['/touch/swipe.js'].lineData[130]++;
  return undefined;
}, 
  onTouchMove: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[4]++;
  _$jscoverage['/touch/swipe.js'].lineData[134]++;
  var self = this, touch = e.changedTouches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), time = e.timeStamp;
  _$jscoverage['/touch/swipe.js'].lineData[144]++;
  if (visit98_144_1(time - self.startTime > MAX_DURATION)) {
    _$jscoverage['/touch/swipe.js'].lineData[145]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[148]++;
  if (visit99_148_1(self.isVertical && visit100_148_2(absDeltaX > MAX_OFFSET))) {
    _$jscoverage['/touch/swipe.js'].lineData[149]++;
    self.isVertical = 0;
  }
  _$jscoverage['/touch/swipe.js'].lineData[152]++;
  if (visit101_152_1(self.isHorizontal && visit102_152_2(absDeltaY > MAX_OFFSET))) {
    _$jscoverage['/touch/swipe.js'].lineData[153]++;
    self.isHorizontal = 0;
  }
  _$jscoverage['/touch/swipe.js'].lineData[156]++;
  return fire(self, e, 1);
}, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch/swipe.js'].functionData[5]++;
  _$jscoverage['/touch/swipe.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/touch/swipe.js'].lineData[161]++;
  if (visit103_161_1(self.onTouchMove(e) === false)) {
    _$jscoverage['/touch/swipe.js'].lineData[162]++;
    return false;
  }
  _$jscoverage['/touch/swipe.js'].lineData[164]++;
  return fire(self, e, 0);
}});
  _$jscoverage['/touch/swipe.js'].lineData[169]++;
  eventHandleMap[event] = eventHandleMap[ingEvent] = {
  handle: new Swipe()};
  _$jscoverage['/touch/swipe.js'].lineData[173]++;
  return Swipe;
});
