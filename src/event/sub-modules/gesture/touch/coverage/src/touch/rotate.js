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
  _$jscoverage['/touch/rotate.js'].lineData[22] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[23] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[24] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[31] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[35] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[36] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[37] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[40] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[41] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[42] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[44] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[48] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[50] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[51] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[53] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[55] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[57] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[62] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[70] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[71] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[72] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[73] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[79] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[82] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[83] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[87] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[89] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[93] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[96] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[97] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[98] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[100] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[101] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[105] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[107] = 0;
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
}
if (! _$jscoverage['/touch/rotate.js'].branchData) {
  _$jscoverage['/touch/rotate.js'].branchData = {};
  _$jscoverage['/touch/rotate.js'].branchData['31'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['40'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['42'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['50'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['82'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['96'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['96'][1] = new BranchData();
}
_$jscoverage['/touch/rotate.js'].branchData['96'][1].init(2711, 33, 'S.Feature.isTouchEventSupported()');
function visit20_96_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['82'][1].init(87, 28, 'e.targetTouches.length === 2');
function visit19_82_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['50'][1].init(1106, 15, '!self.isStarted');
function visit18_50_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['42'][1].init(471, 42, 'Math.abs(negativeAngle - lastAngle) < diff');
function visit17_42_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['40'][1].init(354, 42, 'Math.abs(positiveAngle - lastAngle) < diff');
function visit16_40_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['31'][1].init(376, 23, 'lastAngle !== undefined');
function visit15_31_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/rotate.js'].functionData[0]++;
  _$jscoverage['/touch/rotate.js'].lineData[7]++;
  var addGestureEvent = require('event/gesture/base').addEvent;
  _$jscoverage['/touch/rotate.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/rotate.js'].lineData[9]++;
  var DoubleTouch = require('./double-touch');
  _$jscoverage['/touch/rotate.js'].lineData[10]++;
  var ROTATE_START = 'rotateStart', ROTATE = 'rotate', RAD_2_DEG = 180 / Math.PI, ROTATE_END = 'rotateEnd';
  _$jscoverage['/touch/rotate.js'].lineData[15]++;
  function Rotate() {
    _$jscoverage['/touch/rotate.js'].functionData[1]++;
  }
  _$jscoverage['/touch/rotate.js'].lineData[18]++;
  S.extend(Rotate, DoubleTouch, {
  requiredGestureType: 'touch', 
  move: function(e) {
  _$jscoverage['/touch/rotate.js'].functionData[2]++;
  _$jscoverage['/touch/rotate.js'].lineData[22]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[23]++;
  Rotate.superclass.move.apply(self, arguments);
  _$jscoverage['/touch/rotate.js'].lineData[24]++;
  var touches = self.lastTouches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
  _$jscoverage['/touch/rotate.js'].lineData[31]++;
  if (visit15_31_1(lastAngle !== undefined)) {
    _$jscoverage['/touch/rotate.js'].lineData[35]++;
    var diff = Math.abs(angle - lastAngle);
    _$jscoverage['/touch/rotate.js'].lineData[36]++;
    var positiveAngle = (angle + 360) % 360;
    _$jscoverage['/touch/rotate.js'].lineData[37]++;
    var negativeAngle = (angle - 360) % 360;
    _$jscoverage['/touch/rotate.js'].lineData[40]++;
    if (visit16_40_1(Math.abs(positiveAngle - lastAngle) < diff)) {
      _$jscoverage['/touch/rotate.js'].lineData[41]++;
      angle = positiveAngle;
    } else {
      _$jscoverage['/touch/rotate.js'].lineData[42]++;
      if (visit17_42_1(Math.abs(negativeAngle - lastAngle) < diff)) {
        _$jscoverage['/touch/rotate.js'].lineData[44]++;
        angle = negativeAngle;
      }
    }
  }
  _$jscoverage['/touch/rotate.js'].lineData[48]++;
  self.lastAngle = angle;
  _$jscoverage['/touch/rotate.js'].lineData[50]++;
  if (visit18_50_1(!self.isStarted)) {
    _$jscoverage['/touch/rotate.js'].lineData[51]++;
    self.isStarted = true;
    _$jscoverage['/touch/rotate.js'].lineData[53]++;
    self.startAngle = angle;
    _$jscoverage['/touch/rotate.js'].lineData[55]++;
    self.target = self.getCommonTarget(e);
    _$jscoverage['/touch/rotate.js'].lineData[57]++;
    DomEvent.fire(self.target, ROTATE_START, S.mix(e, {
  angle: angle, 
  rotation: 0}));
  } else {
    _$jscoverage['/touch/rotate.js'].lineData[62]++;
    DomEvent.fire(self.target, ROTATE, S.mix(e, {
  angle: angle, 
  rotation: angle - self.startAngle}));
  }
}, 
  end: function(e) {
  _$jscoverage['/touch/rotate.js'].functionData[3]++;
  _$jscoverage['/touch/rotate.js'].lineData[70]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[71]++;
  Rotate.superclass.end.apply(self, arguments);
  _$jscoverage['/touch/rotate.js'].lineData[72]++;
  self.lastAngle = undefined;
  _$jscoverage['/touch/rotate.js'].lineData[73]++;
  DomEvent.fire(self.target, ROTATE_END, S.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/touch/rotate.js'].lineData[79]++;
  function prevent(e) {
    _$jscoverage['/touch/rotate.js'].functionData[4]++;
    _$jscoverage['/touch/rotate.js'].lineData[82]++;
    if (visit19_82_1(e.targetTouches.length === 2)) {
      _$jscoverage['/touch/rotate.js'].lineData[83]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/touch/rotate.js'].lineData[87]++;
  var r = new Rotate();
  _$jscoverage['/touch/rotate.js'].lineData[89]++;
  addGestureEvent([ROTATE_END, ROTATE_START], {
  handle: r});
  _$jscoverage['/touch/rotate.js'].lineData[93]++;
  var config = {
  handle: r};
  _$jscoverage['/touch/rotate.js'].lineData[96]++;
  if (visit20_96_1(S.Feature.isTouchEventSupported())) {
    _$jscoverage['/touch/rotate.js'].lineData[97]++;
    config.setup = function() {
  _$jscoverage['/touch/rotate.js'].functionData[5]++;
  _$jscoverage['/touch/rotate.js'].lineData[98]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/touch/rotate.js'].lineData[100]++;
    config.tearDown = function() {
  _$jscoverage['/touch/rotate.js'].functionData[6]++;
  _$jscoverage['/touch/rotate.js'].lineData[101]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/touch/rotate.js'].lineData[105]++;
  addGestureEvent(ROTATE, config);
  _$jscoverage['/touch/rotate.js'].lineData[107]++;
  return {
  ROTATE_START: ROTATE_START, 
  ROTATE: ROTATE, 
  ROTATE_END: ROTATE_END};
});
