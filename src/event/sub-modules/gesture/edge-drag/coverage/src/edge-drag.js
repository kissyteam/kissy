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
if (! _$jscoverage['/edge-drag.js']) {
  _$jscoverage['/edge-drag.js'] = {};
  _$jscoverage['/edge-drag.js'].lineData = [];
  _$jscoverage['/edge-drag.js'].lineData[5] = 0;
  _$jscoverage['/edge-drag.js'].lineData[6] = 0;
  _$jscoverage['/edge-drag.js'].lineData[7] = 0;
  _$jscoverage['/edge-drag.js'].lineData[8] = 0;
  _$jscoverage['/edge-drag.js'].lineData[9] = 0;
  _$jscoverage['/edge-drag.js'].lineData[10] = 0;
  _$jscoverage['/edge-drag.js'].lineData[15] = 0;
  _$jscoverage['/edge-drag.js'].lineData[16] = 0;
  _$jscoverage['/edge-drag.js'].lineData[28] = 0;
  _$jscoverage['/edge-drag.js'].lineData[29] = 0;
  _$jscoverage['/edge-drag.js'].lineData[30] = 0;
  _$jscoverage['/edge-drag.js'].lineData[32] = 0;
  _$jscoverage['/edge-drag.js'].lineData[34] = 0;
  _$jscoverage['/edge-drag.js'].lineData[37] = 0;
  _$jscoverage['/edge-drag.js'].lineData[38] = 0;
  _$jscoverage['/edge-drag.js'].lineData[40] = 0;
  _$jscoverage['/edge-drag.js'].lineData[43] = 0;
  _$jscoverage['/edge-drag.js'].lineData[46] = 0;
  _$jscoverage['/edge-drag.js'].lineData[48] = 0;
  _$jscoverage['/edge-drag.js'].lineData[49] = 0;
  _$jscoverage['/edge-drag.js'].lineData[50] = 0;
  _$jscoverage['/edge-drag.js'].lineData[51] = 0;
  _$jscoverage['/edge-drag.js'].lineData[53] = 0;
  _$jscoverage['/edge-drag.js'].lineData[55] = 0;
  _$jscoverage['/edge-drag.js'].lineData[56] = 0;
  _$jscoverage['/edge-drag.js'].lineData[58] = 0;
  _$jscoverage['/edge-drag.js'].lineData[59] = 0;
  _$jscoverage['/edge-drag.js'].lineData[60] = 0;
  _$jscoverage['/edge-drag.js'].lineData[67] = 0;
  _$jscoverage['/edge-drag.js'].lineData[68] = 0;
  _$jscoverage['/edge-drag.js'].lineData[69] = 0;
  _$jscoverage['/edge-drag.js'].lineData[70] = 0;
  _$jscoverage['/edge-drag.js'].lineData[71] = 0;
  _$jscoverage['/edge-drag.js'].lineData[72] = 0;
  _$jscoverage['/edge-drag.js'].lineData[73] = 0;
  _$jscoverage['/edge-drag.js'].lineData[74] = 0;
  _$jscoverage['/edge-drag.js'].lineData[76] = 0;
  _$jscoverage['/edge-drag.js'].lineData[77] = 0;
  _$jscoverage['/edge-drag.js'].lineData[80] = 0;
  _$jscoverage['/edge-drag.js'].lineData[133] = 0;
  _$jscoverage['/edge-drag.js'].lineData[136] = 0;
  _$jscoverage['/edge-drag.js'].lineData[139] = 0;
  _$jscoverage['/edge-drag.js'].lineData[143] = 0;
  _$jscoverage['/edge-drag.js'].lineData[144] = 0;
  _$jscoverage['/edge-drag.js'].lineData[145] = 0;
  _$jscoverage['/edge-drag.js'].lineData[146] = 0;
  _$jscoverage['/edge-drag.js'].lineData[147] = 0;
  _$jscoverage['/edge-drag.js'].lineData[148] = 0;
  _$jscoverage['/edge-drag.js'].lineData[152] = 0;
  _$jscoverage['/edge-drag.js'].lineData[153] = 0;
  _$jscoverage['/edge-drag.js'].lineData[157] = 0;
  _$jscoverage['/edge-drag.js'].lineData[158] = 0;
  _$jscoverage['/edge-drag.js'].lineData[162] = 0;
  _$jscoverage['/edge-drag.js'].lineData[166] = 0;
}
if (! _$jscoverage['/edge-drag.js'].functionData) {
  _$jscoverage['/edge-drag.js'].functionData = [];
  _$jscoverage['/edge-drag.js'].functionData[0] = 0;
  _$jscoverage['/edge-drag.js'].functionData[1] = 0;
  _$jscoverage['/edge-drag.js'].functionData[2] = 0;
  _$jscoverage['/edge-drag.js'].functionData[3] = 0;
  _$jscoverage['/edge-drag.js'].functionData[4] = 0;
  _$jscoverage['/edge-drag.js'].functionData[5] = 0;
}
if (! _$jscoverage['/edge-drag.js'].branchData) {
  _$jscoverage['/edge-drag.js'].branchData = {};
  _$jscoverage['/edge-drag.js'].branchData['28'] = [];
  _$jscoverage['/edge-drag.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['29'] = [];
  _$jscoverage['/edge-drag.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['30'] = [];
  _$jscoverage['/edge-drag.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['32'] = [];
  _$jscoverage['/edge-drag.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['37'] = [];
  _$jscoverage['/edge-drag.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['37'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['48'] = [];
  _$jscoverage['/edge-drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['50'] = [];
  _$jscoverage['/edge-drag.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['50'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['55'] = [];
  _$jscoverage['/edge-drag.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['67'] = [];
  _$jscoverage['/edge-drag.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['67'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['69'] = [];
  _$jscoverage['/edge-drag.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['69'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['71'] = [];
  _$jscoverage['/edge-drag.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['71'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['73'] = [];
  _$jscoverage['/edge-drag.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['73'][3] = new BranchData();
}
_$jscoverage['/edge-drag.js'].branchData['73'][3].init(757, 24, 'y < invalidRegion.bottom');
function visit24_73_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['73'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['73'][2].init(735, 18, 'direction === \'up\'');
function visit23_73_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['73'][1].init(735, 46, 'direction === \'up\' && y < invalidRegion.bottom');
function visit22_73_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['71'][3].init(654, 21, 'y > invalidRegion.top');
function visit21_71_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['71'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['71'][2].init(630, 20, 'direction === \'down\'');
function visit20_71_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['71'][1].init(630, 45, 'direction === \'down\' && y > invalidRegion.top');
function visit19_71_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['69'][3].init(547, 23, 'x < invalidRegion.right');
function visit18_69_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['69'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['69'][2].init(523, 20, 'direction === \'left\'');
function visit17_69_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['69'][1].init(523, 47, 'direction === \'left\' && x < invalidRegion.right');
function visit16_69_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['67'][3].init(441, 22, 'x > invalidRegion.left');
function visit15_67_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['67'][2].init(416, 21, 'direction === \'right\'');
function visit14_67_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['67'][1].init(416, 47, 'direction === \'right\' && x > invalidRegion.left');
function visit13_67_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['55'][1].init(1212, 14, 'self.isStarted');
function visit12_55_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['50'][3].init(78, 21, 'direction === \'right\'');
function visit11_50_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['50'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['50'][2].init(54, 20, 'direction === \'left\'');
function visit10_50_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['50'][1].init(54, 45, 'direction === \'left\' || direction === \'right\'');
function visit9_50_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['48'][1].init(943, 5, '!move');
function visit8_48_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['37'][3].init(697, 20, 'direction === \'down\'');
function visit7_37_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['37'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['37'][2].init(675, 18, 'direction === \'up\'');
function visit6_37_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['37'][1].init(675, 42, 'direction === \'up\' || direction === \'down\'');
function visit5_37_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['32'][1].init(30, 10, 'deltaY < 0');
function visit4_32_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['30'][1].init(30, 10, 'deltaX < 0');
function visit3_30_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['29'][1].init(18, 21, 'absDeltaX > absDeltaY');
function visit2_29_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['28'][1].init(398, 10, '!direction');
function visit1_28_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/edge-drag.js'].functionData[0]++;
  _$jscoverage['/edge-drag.js'].lineData[6]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/edge-drag.js'].lineData[7]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/edge-drag.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/edge-drag.js'].lineData[9]++;
  var SingleTouch = GestureUtil.SingleTouch;
  _$jscoverage['/edge-drag.js'].lineData[10]++;
  var EDGE_DRAG_START = 'edgeDragStart', EDGE_DRAG = 'edgeDrag', EDGE_DRAG_END = 'edgeDragEnd', MIN_EDGE_DISTANCE = 60;
  _$jscoverage['/edge-drag.js'].lineData[15]++;
  function fire(self, e, move) {
    _$jscoverage['/edge-drag.js'].functionData[1]++;
    _$jscoverage['/edge-drag.js'].lineData[16]++;
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, event, direction = self.direction;
    _$jscoverage['/edge-drag.js'].lineData[28]++;
    if (visit1_28_1(!direction)) {
      _$jscoverage['/edge-drag.js'].lineData[29]++;
      if (visit2_29_1(absDeltaX > absDeltaY)) {
        _$jscoverage['/edge-drag.js'].lineData[30]++;
        direction = visit3_30_1(deltaX < 0) ? 'left' : 'right';
      } else {
        _$jscoverage['/edge-drag.js'].lineData[32]++;
        direction = visit4_32_1(deltaY < 0) ? 'up' : 'down';
      }
      _$jscoverage['/edge-drag.js'].lineData[34]++;
      self.direction = direction;
    }
    _$jscoverage['/edge-drag.js'].lineData[37]++;
    if (visit5_37_1(visit6_37_2(direction === 'up') || visit7_37_3(direction === 'down'))) {
      _$jscoverage['/edge-drag.js'].lineData[38]++;
      distance = absDeltaY;
    } else {
      _$jscoverage['/edge-drag.js'].lineData[40]++;
      distance = absDeltaX;
    }
    _$jscoverage['/edge-drag.js'].lineData[43]++;
    var velocityX, velocityY;
    _$jscoverage['/edge-drag.js'].lineData[46]++;
    var duration = (e.timeStamp - self.startTime);
    _$jscoverage['/edge-drag.js'].lineData[48]++;
    if (visit8_48_1(!move)) {
      _$jscoverage['/edge-drag.js'].lineData[49]++;
      event = EDGE_DRAG_END;
      _$jscoverage['/edge-drag.js'].lineData[50]++;
      if (visit9_50_1(visit10_50_2(direction === 'left') || visit11_50_3(direction === 'right'))) {
        _$jscoverage['/edge-drag.js'].lineData[51]++;
        velocityX = distance / duration;
      } else {
        _$jscoverage['/edge-drag.js'].lineData[53]++;
        velocityY = distance / duration;
      }
    } else {
      _$jscoverage['/edge-drag.js'].lineData[55]++;
      if (visit12_55_1(self.isStarted)) {
        _$jscoverage['/edge-drag.js'].lineData[56]++;
        event = EDGE_DRAG;
      } else {
        _$jscoverage['/edge-drag.js'].lineData[58]++;
        event = EDGE_DRAG_START;
        _$jscoverage['/edge-drag.js'].lineData[59]++;
        var win = window;
        _$jscoverage['/edge-drag.js'].lineData[60]++;
        var invalidRegion = {
  left: win.pageXOffset + MIN_EDGE_DISTANCE, 
  right: win.pageXOffset + win.innerWidth - MIN_EDGE_DISTANCE, 
  top: win.pageYOffset + MIN_EDGE_DISTANCE, 
  bottom: win.pageYOffset + win.innerHeight - MIN_EDGE_DISTANCE};
        _$jscoverage['/edge-drag.js'].lineData[67]++;
        if (visit13_67_1(visit14_67_2(direction === 'right') && visit15_67_3(x > invalidRegion.left))) {
          _$jscoverage['/edge-drag.js'].lineData[68]++;
          return false;
        } else {
          _$jscoverage['/edge-drag.js'].lineData[69]++;
          if (visit16_69_1(visit17_69_2(direction === 'left') && visit18_69_3(x < invalidRegion.right))) {
            _$jscoverage['/edge-drag.js'].lineData[70]++;
            return false;
          } else {
            _$jscoverage['/edge-drag.js'].lineData[71]++;
            if (visit19_71_1(visit20_71_2(direction === 'down') && visit21_71_3(y > invalidRegion.top))) {
              _$jscoverage['/edge-drag.js'].lineData[72]++;
              return false;
            } else {
              _$jscoverage['/edge-drag.js'].lineData[73]++;
              if (visit22_73_1(visit23_73_2(direction === 'up') && visit24_73_3(y < invalidRegion.bottom))) {
                _$jscoverage['/edge-drag.js'].lineData[74]++;
                return false;
              }
            }
          }
        }
        _$jscoverage['/edge-drag.js'].lineData[76]++;
        self.isStarted = 1;
        _$jscoverage['/edge-drag.js'].lineData[77]++;
        self.startTime = e.timeStamp;
      }
    }
    _$jscoverage['/edge-drag.js'].lineData[80]++;
    DomEvent.fire(touch.target, event, {
  originalEvent: e.originalEvent, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  touch: touch, 
  direction: direction, 
  distance: distance, 
  duration: duration / 1000, 
  velocityX: velocityX, 
  velocityY: velocityY});
    _$jscoverage['/edge-drag.js'].lineData[133]++;
    return undefined;
  }
  _$jscoverage['/edge-drag.js'].lineData[136]++;
  function EdgeDrag() {
    _$jscoverage['/edge-drag.js'].functionData[2]++;
  }
  _$jscoverage['/edge-drag.js'].lineData[139]++;
  S.extend(EdgeDrag, SingleTouch, {
  requiredGestureType: 'touch', 
  start: function() {
  _$jscoverage['/edge-drag.js'].functionData[3]++;
  _$jscoverage['/edge-drag.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/edge-drag.js'].lineData[144]++;
  EdgeDrag.superclass.start.apply(self, arguments);
  _$jscoverage['/edge-drag.js'].lineData[145]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/edge-drag.js'].lineData[146]++;
  self.direction = null;
  _$jscoverage['/edge-drag.js'].lineData[147]++;
  self.startX = touch.pageX;
  _$jscoverage['/edge-drag.js'].lineData[148]++;
  self.startY = touch.pageY;
}, 
  move: function(e) {
  _$jscoverage['/edge-drag.js'].functionData[4]++;
  _$jscoverage['/edge-drag.js'].lineData[152]++;
  EdgeDrag.superclass.move.apply(this, arguments);
  _$jscoverage['/edge-drag.js'].lineData[153]++;
  return fire(this, e, 1);
}, 
  end: function(e) {
  _$jscoverage['/edge-drag.js'].functionData[5]++;
  _$jscoverage['/edge-drag.js'].lineData[157]++;
  EdgeDrag.superclass.end.apply(this, arguments);
  _$jscoverage['/edge-drag.js'].lineData[158]++;
  return fire(this, e, 0);
}});
  _$jscoverage['/edge-drag.js'].lineData[162]++;
  addGestureEvent([EDGE_DRAG, EDGE_DRAG_END, EDGE_DRAG_START], {
  handle: new EdgeDrag()});
  _$jscoverage['/edge-drag.js'].lineData[166]++;
  return {
  EDGE_DRAG: EDGE_DRAG, 
  EDGE_DRAG_START: EDGE_DRAG_START, 
  EDGE_DRAG_END: EDGE_DRAG_END};
});
