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
if (! _$jscoverage['/rotate.js']) {
  _$jscoverage['/rotate.js'] = {};
  _$jscoverage['/rotate.js'].lineData = [];
  _$jscoverage['/rotate.js'].lineData[6] = 0;
  _$jscoverage['/rotate.js'].lineData[7] = 0;
  _$jscoverage['/rotate.js'].lineData[8] = 0;
  _$jscoverage['/rotate.js'].lineData[9] = 0;
  _$jscoverage['/rotate.js'].lineData[10] = 0;
  _$jscoverage['/rotate.js'].lineData[11] = 0;
  _$jscoverage['/rotate.js'].lineData[15] = 0;
  _$jscoverage['/rotate.js'].lineData[16] = 0;
  _$jscoverage['/rotate.js'].lineData[18] = 0;
  _$jscoverage['/rotate.js'].lineData[21] = 0;
  _$jscoverage['/rotate.js'].lineData[25] = 0;
  _$jscoverage['/rotate.js'].lineData[26] = 0;
  _$jscoverage['/rotate.js'].lineData[27] = 0;
  _$jscoverage['/rotate.js'].lineData[34] = 0;
  _$jscoverage['/rotate.js'].lineData[38] = 0;
  _$jscoverage['/rotate.js'].lineData[39] = 0;
  _$jscoverage['/rotate.js'].lineData[40] = 0;
  _$jscoverage['/rotate.js'].lineData[43] = 0;
  _$jscoverage['/rotate.js'].lineData[44] = 0;
  _$jscoverage['/rotate.js'].lineData[45] = 0;
  _$jscoverage['/rotate.js'].lineData[47] = 0;
  _$jscoverage['/rotate.js'].lineData[51] = 0;
  _$jscoverage['/rotate.js'].lineData[53] = 0;
  _$jscoverage['/rotate.js'].lineData[54] = 0;
  _$jscoverage['/rotate.js'].lineData[56] = 0;
  _$jscoverage['/rotate.js'].lineData[58] = 0;
  _$jscoverage['/rotate.js'].lineData[87] = 0;
  _$jscoverage['/rotate.js'].lineData[92] = 0;
  _$jscoverage['/rotate.js'].lineData[100] = 0;
  _$jscoverage['/rotate.js'].lineData[101] = 0;
  _$jscoverage['/rotate.js'].lineData[102] = 0;
  _$jscoverage['/rotate.js'].lineData[103] = 0;
  _$jscoverage['/rotate.js'].lineData[109] = 0;
  _$jscoverage['/rotate.js'].lineData[112] = 0;
  _$jscoverage['/rotate.js'].lineData[113] = 0;
  _$jscoverage['/rotate.js'].lineData[117] = 0;
  _$jscoverage['/rotate.js'].lineData[119] = 0;
  _$jscoverage['/rotate.js'].lineData[123] = 0;
  _$jscoverage['/rotate.js'].lineData[126] = 0;
  _$jscoverage['/rotate.js'].lineData[127] = 0;
  _$jscoverage['/rotate.js'].lineData[128] = 0;
  _$jscoverage['/rotate.js'].lineData[130] = 0;
  _$jscoverage['/rotate.js'].lineData[131] = 0;
  _$jscoverage['/rotate.js'].lineData[135] = 0;
  _$jscoverage['/rotate.js'].lineData[137] = 0;
}
if (! _$jscoverage['/rotate.js'].functionData) {
  _$jscoverage['/rotate.js'].functionData = [];
  _$jscoverage['/rotate.js'].functionData[0] = 0;
  _$jscoverage['/rotate.js'].functionData[1] = 0;
  _$jscoverage['/rotate.js'].functionData[2] = 0;
  _$jscoverage['/rotate.js'].functionData[3] = 0;
  _$jscoverage['/rotate.js'].functionData[4] = 0;
  _$jscoverage['/rotate.js'].functionData[5] = 0;
  _$jscoverage['/rotate.js'].functionData[6] = 0;
}
if (! _$jscoverage['/rotate.js'].branchData) {
  _$jscoverage['/rotate.js'].branchData = {};
  _$jscoverage['/rotate.js'].branchData['34'] = [];
  _$jscoverage['/rotate.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['43'] = [];
  _$jscoverage['/rotate.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['45'] = [];
  _$jscoverage['/rotate.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['53'] = [];
  _$jscoverage['/rotate.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['112'] = [];
  _$jscoverage['/rotate.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['126'] = [];
  _$jscoverage['/rotate.js'].branchData['126'][1] = new BranchData();
}
_$jscoverage['/rotate.js'].branchData['126'][1].init(4165, 31, 'Feature.isTouchEventSupported()');
function visit6_126_1(result) {
  _$jscoverage['/rotate.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['112'][1].init(90, 28, 'e.targetTouches.length === 2');
function visit5_112_1(result) {
  _$jscoverage['/rotate.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['53'][1].init(1139, 15, '!self.isStarted');
function visit4_53_1(result) {
  _$jscoverage['/rotate.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['45'][1].init(482, 42, 'Math.abs(negativeAngle - lastAngle) < diff');
function visit3_45_1(result) {
  _$jscoverage['/rotate.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['43'][1].init(363, 42, 'Math.abs(positiveAngle - lastAngle) < diff');
function visit2_43_1(result) {
  _$jscoverage['/rotate.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['34'][1].init(390, 23, 'lastAngle !== undefined');
function visit1_34_1(result) {
  _$jscoverage['/rotate.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/rotate.js'].functionData[0]++;
  _$jscoverage['/rotate.js'].lineData[7]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/rotate.js'].lineData[8]++;
  var DoubleTouch = GestureUtil.DoubleTouch;
  _$jscoverage['/rotate.js'].lineData[9]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/rotate.js'].lineData[10]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/rotate.js'].lineData[11]++;
  var ROTATE_START = 'rotateStart', ROTATE = 'rotate', RAD_2_DEG = 180 / Math.PI, ROTATE_END = 'rotateEnd';
  _$jscoverage['/rotate.js'].lineData[15]++;
  var util = require('util');
  _$jscoverage['/rotate.js'].lineData[16]++;
  var Feature = require('feature');
  _$jscoverage['/rotate.js'].lineData[18]++;
  function Rotate() {
    _$jscoverage['/rotate.js'].functionData[1]++;
  }
  _$jscoverage['/rotate.js'].lineData[21]++;
  util.extend(Rotate, DoubleTouch, {
  requiredGestureType: 'touch', 
  move: function(e) {
  _$jscoverage['/rotate.js'].functionData[2]++;
  _$jscoverage['/rotate.js'].lineData[25]++;
  var self = this;
  _$jscoverage['/rotate.js'].lineData[26]++;
  Rotate.superclass.move.apply(self, arguments);
  _$jscoverage['/rotate.js'].lineData[27]++;
  var touches = self.lastTouches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
  _$jscoverage['/rotate.js'].lineData[34]++;
  if (visit1_34_1(lastAngle !== undefined)) {
    _$jscoverage['/rotate.js'].lineData[38]++;
    var diff = Math.abs(angle - lastAngle);
    _$jscoverage['/rotate.js'].lineData[39]++;
    var positiveAngle = (angle + 360) % 360;
    _$jscoverage['/rotate.js'].lineData[40]++;
    var negativeAngle = (angle - 360) % 360;
    _$jscoverage['/rotate.js'].lineData[43]++;
    if (visit2_43_1(Math.abs(positiveAngle - lastAngle) < diff)) {
      _$jscoverage['/rotate.js'].lineData[44]++;
      angle = positiveAngle;
    } else {
      _$jscoverage['/rotate.js'].lineData[45]++;
      if (visit3_45_1(Math.abs(negativeAngle - lastAngle) < diff)) {
        _$jscoverage['/rotate.js'].lineData[47]++;
        angle = negativeAngle;
      }
    }
  }
  _$jscoverage['/rotate.js'].lineData[51]++;
  self.lastAngle = angle;
  _$jscoverage['/rotate.js'].lineData[53]++;
  if (visit4_53_1(!self.isStarted)) {
    _$jscoverage['/rotate.js'].lineData[54]++;
    self.isStarted = true;
    _$jscoverage['/rotate.js'].lineData[56]++;
    self.startAngle = angle;
    _$jscoverage['/rotate.js'].lineData[58]++;
    self.target = self.getCommonTarget(e);
    _$jscoverage['/rotate.js'].lineData[87]++;
    DomEvent.fire(self.target, ROTATE_START, util.mix(e, {
  angle: angle, 
  rotation: 0}));
  } else {
    _$jscoverage['/rotate.js'].lineData[92]++;
    DomEvent.fire(self.target, ROTATE, util.mix(e, {
  angle: angle, 
  rotation: angle - self.startAngle}));
  }
}, 
  end: function(e) {
  _$jscoverage['/rotate.js'].functionData[3]++;
  _$jscoverage['/rotate.js'].lineData[100]++;
  var self = this;
  _$jscoverage['/rotate.js'].lineData[101]++;
  Rotate.superclass.end.apply(self, arguments);
  _$jscoverage['/rotate.js'].lineData[102]++;
  self.lastAngle = undefined;
  _$jscoverage['/rotate.js'].lineData[103]++;
  DomEvent.fire(self.target, ROTATE_END, util.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/rotate.js'].lineData[109]++;
  function prevent(e) {
    _$jscoverage['/rotate.js'].functionData[4]++;
    _$jscoverage['/rotate.js'].lineData[112]++;
    if (visit5_112_1(e.targetTouches.length === 2)) {
      _$jscoverage['/rotate.js'].lineData[113]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/rotate.js'].lineData[117]++;
  var r = new Rotate();
  _$jscoverage['/rotate.js'].lineData[119]++;
  addGestureEvent([ROTATE_END, ROTATE_START], {
  handle: r});
  _$jscoverage['/rotate.js'].lineData[123]++;
  var config = {
  handle: r};
  _$jscoverage['/rotate.js'].lineData[126]++;
  if (visit6_126_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/rotate.js'].lineData[127]++;
    config.setup = function() {
  _$jscoverage['/rotate.js'].functionData[5]++;
  _$jscoverage['/rotate.js'].lineData[128]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/rotate.js'].lineData[130]++;
    config.tearDown = function() {
  _$jscoverage['/rotate.js'].functionData[6]++;
  _$jscoverage['/rotate.js'].lineData[131]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/rotate.js'].lineData[135]++;
  addGestureEvent(ROTATE, config);
  _$jscoverage['/rotate.js'].lineData[137]++;
  return {
  ROTATE_START: ROTATE_START, 
  ROTATE: ROTATE, 
  ROTATE_END: ROTATE_END};
});
