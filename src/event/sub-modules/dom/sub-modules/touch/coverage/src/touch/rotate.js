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
if (! _$jscoverage['/touch/rotate.js']) {
  _$jscoverage['/touch/rotate.js'] = {};
  _$jscoverage['/touch/rotate.js'].lineData = [];
  _$jscoverage['/touch/rotate.js'].lineData[6] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[7] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[8] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[9] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[10] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[15] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[18] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[20] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[22] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[23] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[26] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[33] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[37] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[38] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[39] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[42] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[43] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[46] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[47] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[51] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[52] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[54] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[55] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[57] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[59] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[61] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[67] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[75] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[76] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[77] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[81] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[82] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[88] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[91] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[92] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[96] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[98] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[103] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[106] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[107] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[108] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[110] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[111] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[115] = 0;
}
if (! _$jscoverage['/touch/rotate.js'].functionData) {
  _$jscoverage['/touch/rotate.js'].functionData = [];
  _$jscoverage['/touch/rotate.js'].functionData[0] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[1] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[2] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[3] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[4] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[5] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[6] = 0;
  _$jscoverage['/touch/rotate.js'].functionData[7] = 0;
}
if (! _$jscoverage['/touch/rotate.js'].branchData) {
  _$jscoverage['/touch/rotate.js'].branchData = {};
  _$jscoverage['/touch/rotate.js'].branchData['22'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['33'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['42'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['46'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['54'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['91'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['106'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['106'][1] = new BranchData();
}
_$jscoverage['/touch/rotate.js'].branchData['106'][1].init(2851, 34, 'S.Features.isTouchEventSupported()');
function visit83_106_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['91'][1].init(87, 28, 'e.targetTouches.length === 2');
function visit82_91_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['54'][1].init(1168, 15, '!self.isStarted');
function visit81_54_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['46'][1].init(542, 42, 'Math.abs(negativeAngle - lastAngle) < diff');
function visit80_46_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['42'][1].init(354, 42, 'Math.abs(positiveAngle - lastAngle) < diff');
function visit79_42_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['33'][1].init(386, 23, 'lastAngle !== undefined');
function visit78_33_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['22'][1].init(47, 16, '!self.isTracking');
function visit77_22_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/rotate.js'].functionData[0]++;
  _$jscoverage['/touch/rotate.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/rotate.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/rotate.js'].lineData[9]++;
  var MultiTouch = require('./multi-touch');
  _$jscoverage['/touch/rotate.js'].lineData[10]++;
  var ROTATE_START = 'rotateStart', ROTATE = 'rotate', RAD_2_DEG = 180 / Math.PI, ROTATE_END = 'rotateEnd';
  _$jscoverage['/touch/rotate.js'].lineData[15]++;
  function Rotate() {
    _$jscoverage['/touch/rotate.js'].functionData[1]++;
  }
  _$jscoverage['/touch/rotate.js'].lineData[18]++;
  S.extend(Rotate, MultiTouch, {
  onTouchMove: function(e) {
  _$jscoverage['/touch/rotate.js'].functionData[2]++;
  _$jscoverage['/touch/rotate.js'].lineData[20]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[22]++;
  if (visit77_22_1(!self.isTracking)) {
    _$jscoverage['/touch/rotate.js'].lineData[23]++;
    return;
  }
  _$jscoverage['/touch/rotate.js'].lineData[26]++;
  var touches = e.touches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
  _$jscoverage['/touch/rotate.js'].lineData[33]++;
  if (visit78_33_1(lastAngle !== undefined)) {
    _$jscoverage['/touch/rotate.js'].lineData[37]++;
    var diff = Math.abs(angle - lastAngle);
    _$jscoverage['/touch/rotate.js'].lineData[38]++;
    var positiveAngle = (angle + 360) % 360;
    _$jscoverage['/touch/rotate.js'].lineData[39]++;
    var negativeAngle = (angle - 360) % 360;
    _$jscoverage['/touch/rotate.js'].lineData[42]++;
    if (visit79_42_1(Math.abs(positiveAngle - lastAngle) < diff)) {
      _$jscoverage['/touch/rotate.js'].lineData[43]++;
      angle = positiveAngle;
    } else {
      _$jscoverage['/touch/rotate.js'].lineData[46]++;
      if (visit80_46_1(Math.abs(negativeAngle - lastAngle) < diff)) {
        _$jscoverage['/touch/rotate.js'].lineData[47]++;
        angle = negativeAngle;
      }
    }
  }
  _$jscoverage['/touch/rotate.js'].lineData[51]++;
  self.lastTouches = touches;
  _$jscoverage['/touch/rotate.js'].lineData[52]++;
  self.lastAngle = angle;
  _$jscoverage['/touch/rotate.js'].lineData[54]++;
  if (visit81_54_1(!self.isStarted)) {
    _$jscoverage['/touch/rotate.js'].lineData[55]++;
    self.isStarted = true;
    _$jscoverage['/touch/rotate.js'].lineData[57]++;
    self.startAngle = angle;
    _$jscoverage['/touch/rotate.js'].lineData[59]++;
    self.target = self.getCommonTarget(e);
    _$jscoverage['/touch/rotate.js'].lineData[61]++;
    DomEvent.fire(self.target, ROTATE_START, S.mix(e, {
  angle: angle, 
  rotation: 0}));
  } else {
    _$jscoverage['/touch/rotate.js'].lineData[67]++;
    DomEvent.fire(self.target, ROTATE, S.mix(e, {
  angle: angle, 
  rotation: angle - self.startAngle}));
  }
}, 
  end: function() {
  _$jscoverage['/touch/rotate.js'].functionData[3]++;
  _$jscoverage['/touch/rotate.js'].lineData[75]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[76]++;
  self.lastAngle = undefined;
  _$jscoverage['/touch/rotate.js'].lineData[77]++;
  Rotate.superclass.end.apply(self, arguments);
}, 
  fireEnd: function(e) {
  _$jscoverage['/touch/rotate.js'].functionData[4]++;
  _$jscoverage['/touch/rotate.js'].lineData[81]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[82]++;
  DomEvent.fire(self.target, ROTATE_END, S.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/touch/rotate.js'].lineData[88]++;
  function prevent(e) {
    _$jscoverage['/touch/rotate.js'].functionData[5]++;
    _$jscoverage['/touch/rotate.js'].lineData[91]++;
    if (visit82_91_1(e.targetTouches.length === 2)) {
      _$jscoverage['/touch/rotate.js'].lineData[92]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/touch/rotate.js'].lineData[96]++;
  var r = new Rotate();
  _$jscoverage['/touch/rotate.js'].lineData[98]++;
  eventHandleMap[ROTATE_END] = eventHandleMap[ROTATE_START] = {
  handle: r};
  _$jscoverage['/touch/rotate.js'].lineData[103]++;
  var config = eventHandleMap[ROTATE] = {
  handle: r};
  _$jscoverage['/touch/rotate.js'].lineData[106]++;
  if (visit83_106_1(S.Features.isTouchEventSupported())) {
    _$jscoverage['/touch/rotate.js'].lineData[107]++;
    config.setup = function() {
  _$jscoverage['/touch/rotate.js'].functionData[6]++;
  _$jscoverage['/touch/rotate.js'].lineData[108]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/touch/rotate.js'].lineData[110]++;
    config.tearDown = function() {
  _$jscoverage['/touch/rotate.js'].functionData[7]++;
  _$jscoverage['/touch/rotate.js'].lineData[111]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/touch/rotate.js'].lineData[115]++;
  return Rotate;
});
