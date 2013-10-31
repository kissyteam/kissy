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
  _$jscoverage['/touch/rotate.js'].lineData[12] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[15] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[18] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[20] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[21] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[24] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[31] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[35] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[36] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[37] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[40] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[41] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[44] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[45] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[49] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[50] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[52] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[53] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[55] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[57] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[59] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[65] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[73] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[74] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[75] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[79] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[80] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[86] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[89] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[90] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[94] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[96] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[101] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[104] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[107] = 0;
  _$jscoverage['/touch/rotate.js'].lineData[111] = 0;
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
  _$jscoverage['/touch/rotate.js'].branchData['20'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['31'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['40'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['44'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['52'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/touch/rotate.js'].branchData['89'] = [];
  _$jscoverage['/touch/rotate.js'].branchData['89'][1] = new BranchData();
}
_$jscoverage['/touch/rotate.js'].branchData['89'][1].init(90, 21, 'e.touches.length == 2');
function visit72_89_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['52'][1].init(1203, 15, '!self.isStarted');
function visit71_52_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['44'][1].init(555, 42, 'Math.abs(negativeAngle - lastAngle) < diff');
function visit70_44_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['40'][1].init(363, 42, 'Math.abs(positiveAngle - lastAngle) < diff');
function visit69_40_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['31'][1].init(400, 23, 'lastAngle !== undefined');
function visit68_31_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].branchData['20'][1].init(50, 16, '!self.isTracking');
function visit67_20_1(result) {
  _$jscoverage['/touch/rotate.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/rotate.js'].lineData[6]++;
KISSY.add('event/dom/touch/rotate', function(S, eventHandleMap, MultiTouch, DomEvent, undefined) {
  _$jscoverage['/touch/rotate.js'].functionData[0]++;
  _$jscoverage['/touch/rotate.js'].lineData[7]++;
  var ROTATE_START = 'rotateStart', ROTATE = 'rotate', RAD_2_DEG = 180 / Math.PI, ROTATE_END = 'rotateEnd';
  _$jscoverage['/touch/rotate.js'].lineData[12]++;
  function Rotate() {
    _$jscoverage['/touch/rotate.js'].functionData[1]++;
  }
  _$jscoverage['/touch/rotate.js'].lineData[15]++;
  S.extend(Rotate, MultiTouch, {
  onTouchMove: function(e) {
  _$jscoverage['/touch/rotate.js'].functionData[2]++;
  _$jscoverage['/touch/rotate.js'].lineData[18]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[20]++;
  if (visit67_20_1(!self.isTracking)) {
    _$jscoverage['/touch/rotate.js'].lineData[21]++;
    return;
  }
  _$jscoverage['/touch/rotate.js'].lineData[24]++;
  var touches = e.touches, one = touches[0], two = touches[1], lastAngle = self.lastAngle, angle = Math.atan2(two.pageY - one.pageY, two.pageX - one.pageX) * RAD_2_DEG;
  _$jscoverage['/touch/rotate.js'].lineData[31]++;
  if (visit68_31_1(lastAngle !== undefined)) {
    _$jscoverage['/touch/rotate.js'].lineData[35]++;
    var diff = Math.abs(angle - lastAngle);
    _$jscoverage['/touch/rotate.js'].lineData[36]++;
    var positiveAngle = (angle + 360) % 360;
    _$jscoverage['/touch/rotate.js'].lineData[37]++;
    var negativeAngle = (angle - 360) % 360;
    _$jscoverage['/touch/rotate.js'].lineData[40]++;
    if (visit69_40_1(Math.abs(positiveAngle - lastAngle) < diff)) {
      _$jscoverage['/touch/rotate.js'].lineData[41]++;
      angle = positiveAngle;
    } else {
      _$jscoverage['/touch/rotate.js'].lineData[44]++;
      if (visit70_44_1(Math.abs(negativeAngle - lastAngle) < diff)) {
        _$jscoverage['/touch/rotate.js'].lineData[45]++;
        angle = negativeAngle;
      }
    }
  }
  _$jscoverage['/touch/rotate.js'].lineData[49]++;
  self.lastTouches = touches;
  _$jscoverage['/touch/rotate.js'].lineData[50]++;
  self.lastAngle = angle;
  _$jscoverage['/touch/rotate.js'].lineData[52]++;
  if (visit71_52_1(!self.isStarted)) {
    _$jscoverage['/touch/rotate.js'].lineData[53]++;
    self.isStarted = true;
    _$jscoverage['/touch/rotate.js'].lineData[55]++;
    self.startAngle = angle;
    _$jscoverage['/touch/rotate.js'].lineData[57]++;
    self.target = self.getCommonTarget(e);
    _$jscoverage['/touch/rotate.js'].lineData[59]++;
    DomEvent.fire(self.target, ROTATE_START, S.mix(e, {
  angle: angle, 
  rotation: 0}));
  } else {
    _$jscoverage['/touch/rotate.js'].lineData[65]++;
    DomEvent.fire(self.target, ROTATE, S.mix(e, {
  angle: angle, 
  rotation: angle - self.startAngle}));
  }
}, 
  end: function() {
  _$jscoverage['/touch/rotate.js'].functionData[3]++;
  _$jscoverage['/touch/rotate.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[74]++;
  self.lastAngle = undefined;
  _$jscoverage['/touch/rotate.js'].lineData[75]++;
  Rotate.superclass.end.apply(self, arguments);
}, 
  fireEnd: function(e) {
  _$jscoverage['/touch/rotate.js'].functionData[4]++;
  _$jscoverage['/touch/rotate.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/touch/rotate.js'].lineData[80]++;
  DomEvent.fire(self.target, ROTATE_END, S.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/touch/rotate.js'].lineData[86]++;
  function prevent(e) {
    _$jscoverage['/touch/rotate.js'].functionData[5]++;
    _$jscoverage['/touch/rotate.js'].lineData[89]++;
    if (visit72_89_1(e.touches.length == 2)) {
      _$jscoverage['/touch/rotate.js'].lineData[90]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/touch/rotate.js'].lineData[94]++;
  var r = new Rotate();
  _$jscoverage['/touch/rotate.js'].lineData[96]++;
  eventHandleMap[ROTATE_END] = eventHandleMap[ROTATE_START] = {
  handle: r};
  _$jscoverage['/touch/rotate.js'].lineData[101]++;
  eventHandleMap[ROTATE] = {
  handle: r, 
  add: function() {
  _$jscoverage['/touch/rotate.js'].functionData[6]++;
  _$jscoverage['/touch/rotate.js'].lineData[104]++;
  DomEvent.on(this, 'touchmove', prevent);
}, 
  remove: function() {
  _$jscoverage['/touch/rotate.js'].functionData[7]++;
  _$jscoverage['/touch/rotate.js'].lineData[107]++;
  DomEvent.detach(this, 'touchmove', prevent);
}};
  _$jscoverage['/touch/rotate.js'].lineData[111]++;
  return Rotate;
}, {
  requires: ['./handle-map', './multi-touch', 'event/dom/base']});
