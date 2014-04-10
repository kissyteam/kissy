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
  _$jscoverage['/rotate.js'].lineData[16] = 0;
  _$jscoverage['/rotate.js'].lineData[19] = 0;
  _$jscoverage['/rotate.js'].lineData[23] = 0;
  _$jscoverage['/rotate.js'].lineData[24] = 0;
  _$jscoverage['/rotate.js'].lineData[25] = 0;
  _$jscoverage['/rotate.js'].lineData[32] = 0;
  _$jscoverage['/rotate.js'].lineData[36] = 0;
  _$jscoverage['/rotate.js'].lineData[37] = 0;
  _$jscoverage['/rotate.js'].lineData[38] = 0;
  _$jscoverage['/rotate.js'].lineData[41] = 0;
  _$jscoverage['/rotate.js'].lineData[42] = 0;
  _$jscoverage['/rotate.js'].lineData[43] = 0;
  _$jscoverage['/rotate.js'].lineData[45] = 0;
  _$jscoverage['/rotate.js'].lineData[49] = 0;
  _$jscoverage['/rotate.js'].lineData[51] = 0;
  _$jscoverage['/rotate.js'].lineData[52] = 0;
  _$jscoverage['/rotate.js'].lineData[54] = 0;
  _$jscoverage['/rotate.js'].lineData[56] = 0;
  _$jscoverage['/rotate.js'].lineData[58] = 0;
  _$jscoverage['/rotate.js'].lineData[63] = 0;
  _$jscoverage['/rotate.js'].lineData[71] = 0;
  _$jscoverage['/rotate.js'].lineData[72] = 0;
  _$jscoverage['/rotate.js'].lineData[73] = 0;
  _$jscoverage['/rotate.js'].lineData[74] = 0;
  _$jscoverage['/rotate.js'].lineData[80] = 0;
  _$jscoverage['/rotate.js'].lineData[83] = 0;
  _$jscoverage['/rotate.js'].lineData[84] = 0;
  _$jscoverage['/rotate.js'].lineData[88] = 0;
  _$jscoverage['/rotate.js'].lineData[90] = 0;
  _$jscoverage['/rotate.js'].lineData[94] = 0;
  _$jscoverage['/rotate.js'].lineData[97] = 0;
  _$jscoverage['/rotate.js'].lineData[98] = 0;
  _$jscoverage['/rotate.js'].lineData[99] = 0;
  _$jscoverage['/rotate.js'].lineData[101] = 0;
  _$jscoverage['/rotate.js'].lineData[102] = 0;
  _$jscoverage['/rotate.js'].lineData[106] = 0;
  _$jscoverage['/rotate.js'].lineData[108] = 0;
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
  _$jscoverage['/rotate.js'].branchData['32'] = [];
  _$jscoverage['/rotate.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['41'] = [];
  _$jscoverage['/rotate.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['43'] = [];
  _$jscoverage['/rotate.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['51'] = [];
  _$jscoverage['/rotate.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['83'] = [];
  _$jscoverage['/rotate.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/rotate.js'].branchData['97'] = [];
  _$jscoverage['/rotate.js'].branchData['97'][1] = new BranchData();
}
_$jscoverage['/rotate.js'].branchData['97'][1].init(2839, 33, 'S.Feature.isTouchEventSupported()');
function visit6_97_1(result) {
  _$jscoverage['/rotate.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['83'][1].init(90, 28, 'e.targetTouches.length === 2');
function visit5_83_1(result) {
  _$jscoverage['/rotate.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['51'][1].init(1139, 15, '!self.isStarted');
function visit4_51_1(result) {
  _$jscoverage['/rotate.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['43'][1].init(482, 42, 'Math.abs(negativeAngle - lastAngle) < diff');
function visit3_43_1(result) {
  _$jscoverage['/rotate.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['41'][1].init(363, 42, 'Math.abs(positiveAngle - lastAngle) < diff');
function visit2_41_1(result) {
  _$jscoverage['/rotate.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/rotate.js'].branchData['32'][1].init(390, 23, 'lastAngle !== undefined');
function visit1_32_1(result) {
  _$jscoverage['/rotate.js'].branchData['32'][1].ranCondition(result);
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
  _$jscoverage['/rotate.js'].lineData[16]++;
  function Rotate() {
    _$jscoverage['/rotate.js'].functionData[1]++;
  }
  _$jscoverage['/rotate.js'].lineData[19]++;
  S.extend(Rotate, DoubleTouch, {
  requiredGestureType: 'touch', 
  move: function(e) {
  _$jscoverage['/rotate.js'].functionData[2]++;
  _$jscoverage['/rotate.js'].lineData[23]++;
  var self = this;
  _$jscoverage['/rotate.js'].lineData[24]++;
  Rotate.superclass.move.apply(self, arguments);
  _$jscoverage['/rotate.js'].lineData[25]++;
  var touches = self.lastTouches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
  _$jscoverage['/rotate.js'].lineData[32]++;
  if (visit1_32_1(lastAngle !== undefined)) {
    _$jscoverage['/rotate.js'].lineData[36]++;
    var diff = Math.abs(angle - lastAngle);
    _$jscoverage['/rotate.js'].lineData[37]++;
    var positiveAngle = (angle + 360) % 360;
    _$jscoverage['/rotate.js'].lineData[38]++;
    var negativeAngle = (angle - 360) % 360;
    _$jscoverage['/rotate.js'].lineData[41]++;
    if (visit2_41_1(Math.abs(positiveAngle - lastAngle) < diff)) {
      _$jscoverage['/rotate.js'].lineData[42]++;
      angle = positiveAngle;
    } else {
      _$jscoverage['/rotate.js'].lineData[43]++;
      if (visit3_43_1(Math.abs(negativeAngle - lastAngle) < diff)) {
        _$jscoverage['/rotate.js'].lineData[45]++;
        angle = negativeAngle;
      }
    }
  }
  _$jscoverage['/rotate.js'].lineData[49]++;
  self.lastAngle = angle;
  _$jscoverage['/rotate.js'].lineData[51]++;
  if (visit4_51_1(!self.isStarted)) {
    _$jscoverage['/rotate.js'].lineData[52]++;
    self.isStarted = true;
    _$jscoverage['/rotate.js'].lineData[54]++;
    self.startAngle = angle;
    _$jscoverage['/rotate.js'].lineData[56]++;
    self.target = self.getCommonTarget(e);
    _$jscoverage['/rotate.js'].lineData[58]++;
    DomEvent.fire(self.target, ROTATE_START, S.mix(e, {
  angle: angle, 
  rotation: 0}));
  } else {
    _$jscoverage['/rotate.js'].lineData[63]++;
    DomEvent.fire(self.target, ROTATE, S.mix(e, {
  angle: angle, 
  rotation: angle - self.startAngle}));
  }
}, 
  end: function(e) {
  _$jscoverage['/rotate.js'].functionData[3]++;
  _$jscoverage['/rotate.js'].lineData[71]++;
  var self = this;
  _$jscoverage['/rotate.js'].lineData[72]++;
  Rotate.superclass.end.apply(self, arguments);
  _$jscoverage['/rotate.js'].lineData[73]++;
  self.lastAngle = undefined;
  _$jscoverage['/rotate.js'].lineData[74]++;
  DomEvent.fire(self.target, ROTATE_END, S.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/rotate.js'].lineData[80]++;
  function prevent(e) {
    _$jscoverage['/rotate.js'].functionData[4]++;
    _$jscoverage['/rotate.js'].lineData[83]++;
    if (visit5_83_1(e.targetTouches.length === 2)) {
      _$jscoverage['/rotate.js'].lineData[84]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/rotate.js'].lineData[88]++;
  var r = new Rotate();
  _$jscoverage['/rotate.js'].lineData[90]++;
  addGestureEvent([ROTATE_END, ROTATE_START], {
  handle: r});
  _$jscoverage['/rotate.js'].lineData[94]++;
  var config = {
  handle: r};
  _$jscoverage['/rotate.js'].lineData[97]++;
  if (visit6_97_1(S.Feature.isTouchEventSupported())) {
    _$jscoverage['/rotate.js'].lineData[98]++;
    config.setup = function() {
  _$jscoverage['/rotate.js'].functionData[5]++;
  _$jscoverage['/rotate.js'].lineData[99]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/rotate.js'].lineData[101]++;
    config.tearDown = function() {
  _$jscoverage['/rotate.js'].functionData[6]++;
  _$jscoverage['/rotate.js'].lineData[102]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/rotate.js'].lineData[106]++;
  addGestureEvent(ROTATE, config);
  _$jscoverage['/rotate.js'].lineData[108]++;
  return {
  ROTATE_START: ROTATE_START, 
  ROTATE: ROTATE, 
  ROTATE_END: ROTATE_END};
});
