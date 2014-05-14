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
if (! _$jscoverage['/pinch.js']) {
  _$jscoverage['/pinch.js'] = {};
  _$jscoverage['/pinch.js'].lineData = [];
  _$jscoverage['/pinch.js'].lineData[6] = 0;
  _$jscoverage['/pinch.js'].lineData[7] = 0;
  _$jscoverage['/pinch.js'].lineData[8] = 0;
  _$jscoverage['/pinch.js'].lineData[9] = 0;
  _$jscoverage['/pinch.js'].lineData[10] = 0;
  _$jscoverage['/pinch.js'].lineData[11] = 0;
  _$jscoverage['/pinch.js'].lineData[12] = 0;
  _$jscoverage['/pinch.js'].lineData[15] = 0;
  _$jscoverage['/pinch.js'].lineData[16] = 0;
  _$jscoverage['/pinch.js'].lineData[17] = 0;
  _$jscoverage['/pinch.js'].lineData[19] = 0;
  _$jscoverage['/pinch.js'].lineData[22] = 0;
  _$jscoverage['/pinch.js'].lineData[25] = 0;
  _$jscoverage['/pinch.js'].lineData[29] = 0;
  _$jscoverage['/pinch.js'].lineData[31] = 0;
  _$jscoverage['/pinch.js'].lineData[33] = 0;
  _$jscoverage['/pinch.js'].lineData[36] = 0;
  _$jscoverage['/pinch.js'].lineData[37] = 0;
  _$jscoverage['/pinch.js'].lineData[40] = 0;
  _$jscoverage['/pinch.js'].lineData[69] = 0;
  _$jscoverage['/pinch.js'].lineData[70] = 0;
  _$jscoverage['/pinch.js'].lineData[71] = 0;
  _$jscoverage['/pinch.js'].lineData[72] = 0;
  _$jscoverage['/pinch.js'].lineData[73] = 0;
  _$jscoverage['/pinch.js'].lineData[79] = 0;
  _$jscoverage['/pinch.js'].lineData[88] = 0;
  _$jscoverage['/pinch.js'].lineData[89] = 0;
  _$jscoverage['/pinch.js'].lineData[90] = 0;
  _$jscoverage['/pinch.js'].lineData[96] = 0;
  _$jscoverage['/pinch.js'].lineData[98] = 0;
  _$jscoverage['/pinch.js'].lineData[102] = 0;
  _$jscoverage['/pinch.js'].lineData[103] = 0;
  _$jscoverage['/pinch.js'].lineData[104] = 0;
  _$jscoverage['/pinch.js'].lineData[108] = 0;
  _$jscoverage['/pinch.js'].lineData[111] = 0;
  _$jscoverage['/pinch.js'].lineData[112] = 0;
  _$jscoverage['/pinch.js'].lineData[113] = 0;
  _$jscoverage['/pinch.js'].lineData[115] = 0;
  _$jscoverage['/pinch.js'].lineData[116] = 0;
  _$jscoverage['/pinch.js'].lineData[120] = 0;
  _$jscoverage['/pinch.js'].lineData[122] = 0;
}
if (! _$jscoverage['/pinch.js'].functionData) {
  _$jscoverage['/pinch.js'].functionData = [];
  _$jscoverage['/pinch.js'].functionData[0] = 0;
  _$jscoverage['/pinch.js'].functionData[1] = 0;
  _$jscoverage['/pinch.js'].functionData[2] = 0;
  _$jscoverage['/pinch.js'].functionData[3] = 0;
  _$jscoverage['/pinch.js'].functionData[4] = 0;
  _$jscoverage['/pinch.js'].functionData[5] = 0;
  _$jscoverage['/pinch.js'].functionData[6] = 0;
  _$jscoverage['/pinch.js'].functionData[7] = 0;
}
if (! _$jscoverage['/pinch.js'].branchData) {
  _$jscoverage['/pinch.js'].branchData = {};
  _$jscoverage['/pinch.js'].branchData['36'] = [];
  _$jscoverage['/pinch.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][3] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][4] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][5] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][6] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][7] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['36'][8] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['69'] = [];
  _$jscoverage['/pinch.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['103'] = [];
  _$jscoverage['/pinch.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/pinch.js'].branchData['111'] = [];
  _$jscoverage['/pinch.js'].branchData['111'][1] = new BranchData();
}
_$jscoverage['/pinch.js'].branchData['111'][1].init(3412, 31, 'Feature.isTouchEventSupported()');
function visit11_111_1(result) {
  _$jscoverage['/pinch.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['103'][1].init(14, 28, 'e.targetTouches.length === 2');
function visit10_103_1(result) {
  _$jscoverage['/pinch.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['69'][1].init(1519, 15, '!self.isStarted');
function visit9_69_1(result) {
  _$jscoverage['/pinch.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][8].init(276, 20, 'touches[1].pageY > 0');
function visit8_36_8(result) {
  _$jscoverage['/pinch.js'].branchData['36'][8].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][7].init(252, 20, 'touches[1].pageX > 0');
function visit7_36_7(result) {
  _$jscoverage['/pinch.js'].branchData['36'][7].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][6].init(252, 44, 'touches[1].pageX > 0 && touches[1].pageY > 0');
function visit6_36_6(result) {
  _$jscoverage['/pinch.js'].branchData['36'][6].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][5].init(228, 20, 'touches[0].pageY > 0');
function visit5_36_5(result) {
  _$jscoverage['/pinch.js'].branchData['36'][5].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][4].init(228, 68, 'touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0');
function visit4_36_4(result) {
  _$jscoverage['/pinch.js'].branchData['36'][4].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][3].init(204, 20, 'touches[0].pageX > 0');
function visit3_36_3(result) {
  _$jscoverage['/pinch.js'].branchData['36'][3].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][2].init(204, 92, 'touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0');
function visit2_36_2(result) {
  _$jscoverage['/pinch.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].branchData['36'][1].init(202, 95, '!(touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0)');
function visit1_36_1(result) {
  _$jscoverage['/pinch.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/pinch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/pinch.js'].functionData[0]++;
  _$jscoverage['/pinch.js'].lineData[7]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/pinch.js'].lineData[8]++;
  var DoubleTouch = GestureUtil.DoubleTouch;
  _$jscoverage['/pinch.js'].lineData[9]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/pinch.js'].lineData[10]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/pinch.js'].lineData[11]++;
  var Feature = require('feature');
  _$jscoverage['/pinch.js'].lineData[12]++;
  var PINCH = 'pinch', PINCH_START = 'pinchStart', PINCH_END = 'pinchEnd';
  _$jscoverage['/pinch.js'].lineData[15]++;
  var util = require('util');
  _$jscoverage['/pinch.js'].lineData[16]++;
  function getDistance(p1, p2) {
    _$jscoverage['/pinch.js'].functionData[1]++;
    _$jscoverage['/pinch.js'].lineData[17]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/pinch.js'].lineData[19]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/pinch.js'].lineData[22]++;
  function Pinch() {
    _$jscoverage['/pinch.js'].functionData[2]++;
  }
  _$jscoverage['/pinch.js'].lineData[25]++;
  util.extend(Pinch, DoubleTouch, {
  requiredGestureType: 'touch', 
  move: function(e) {
  _$jscoverage['/pinch.js'].functionData[3]++;
  _$jscoverage['/pinch.js'].lineData[29]++;
  var self = this;
  _$jscoverage['/pinch.js'].lineData[31]++;
  Pinch.superclass.move.apply(self, arguments);
  _$jscoverage['/pinch.js'].lineData[33]++;
  var touches = self.lastTouches;
  _$jscoverage['/pinch.js'].lineData[36]++;
  if (visit1_36_1(!(visit2_36_2(visit3_36_3(touches[0].pageX > 0) && visit4_36_4(visit5_36_5(touches[0].pageY > 0) && visit6_36_6(visit7_36_7(touches[1].pageX > 0) && visit8_36_8(touches[1].pageY > 0))))))) {
    _$jscoverage['/pinch.js'].lineData[37]++;
    return;
  }
  _$jscoverage['/pinch.js'].lineData[40]++;
  var distance = getDistance(touches[0], touches[1]);
  _$jscoverage['/pinch.js'].lineData[69]++;
  if (visit9_69_1(!self.isStarted)) {
    _$jscoverage['/pinch.js'].lineData[70]++;
    self.isStarted = true;
    _$jscoverage['/pinch.js'].lineData[71]++;
    self.startDistance = distance;
    _$jscoverage['/pinch.js'].lineData[72]++;
    var target = self.target = self.getCommonTarget(e);
    _$jscoverage['/pinch.js'].lineData[73]++;
    DomEvent.fire(target, PINCH_START, util.mix(e, {
  distance: distance, 
  scale: 1}));
  } else {
    _$jscoverage['/pinch.js'].lineData[79]++;
    DomEvent.fire(self.target, PINCH, util.mix(e, {
  distance: distance, 
  scale: distance / self.startDistance}));
  }
}, 
  end: function(e) {
  _$jscoverage['/pinch.js'].functionData[4]++;
  _$jscoverage['/pinch.js'].lineData[88]++;
  var self = this;
  _$jscoverage['/pinch.js'].lineData[89]++;
  Pinch.superclass.end.apply(self, arguments);
  _$jscoverage['/pinch.js'].lineData[90]++;
  DomEvent.fire(self.target, PINCH_END, util.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/pinch.js'].lineData[96]++;
  var p = new Pinch();
  _$jscoverage['/pinch.js'].lineData[98]++;
  addGestureEvent([PINCH_START, PINCH_END], {
  handle: p});
  _$jscoverage['/pinch.js'].lineData[102]++;
  function prevent(e) {
    _$jscoverage['/pinch.js'].functionData[5]++;
    _$jscoverage['/pinch.js'].lineData[103]++;
    if (visit10_103_1(e.targetTouches.length === 2)) {
      _$jscoverage['/pinch.js'].lineData[104]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/pinch.js'].lineData[108]++;
  var config = {
  handle: p};
  _$jscoverage['/pinch.js'].lineData[111]++;
  if (visit11_111_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/pinch.js'].lineData[112]++;
    config.setup = function() {
  _$jscoverage['/pinch.js'].functionData[6]++;
  _$jscoverage['/pinch.js'].lineData[113]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/pinch.js'].lineData[115]++;
    config.tearDown = function() {
  _$jscoverage['/pinch.js'].functionData[7]++;
  _$jscoverage['/pinch.js'].lineData[116]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/pinch.js'].lineData[120]++;
  addGestureEvent(PINCH, config);
  _$jscoverage['/pinch.js'].lineData[122]++;
  return {
  PINCH: PINCH, 
  PINCH_START: PINCH_START, 
  PINCH_END: PINCH_END};
});
