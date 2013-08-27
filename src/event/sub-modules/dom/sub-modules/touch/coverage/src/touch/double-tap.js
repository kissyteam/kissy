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
if (! _$jscoverage['/touch/double-tap.js']) {
  _$jscoverage['/touch/double-tap.js'] = {};
  _$jscoverage['/touch/double-tap.js'].lineData = [];
  _$jscoverage['/touch/double-tap.js'].lineData[6] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[9] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[14] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[17] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[20] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[21] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[22] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[24] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[25] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[26] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[27] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[32] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[36] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[42] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[44] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[46] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[48] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[50] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[52] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[56] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[63] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[64] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[65] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[75] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[76] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[89] = 0;
  _$jscoverage['/touch/double-tap.js'].lineData[93] = 0;
}
if (! _$jscoverage['/touch/double-tap.js'].functionData) {
  _$jscoverage['/touch/double-tap.js'].functionData = [];
  _$jscoverage['/touch/double-tap.js'].functionData[0] = 0;
  _$jscoverage['/touch/double-tap.js'].functionData[1] = 0;
  _$jscoverage['/touch/double-tap.js'].functionData[2] = 0;
  _$jscoverage['/touch/double-tap.js'].functionData[3] = 0;
  _$jscoverage['/touch/double-tap.js'].functionData[4] = 0;
  _$jscoverage['/touch/double-tap.js'].functionData[5] = 0;
}
if (! _$jscoverage['/touch/double-tap.js'].branchData) {
  _$jscoverage['/touch/double-tap.js'].branchData = {};
  _$jscoverage['/touch/double-tap.js'].branchData['21'] = [];
  _$jscoverage['/touch/double-tap.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/touch/double-tap.js'].branchData['25'] = [];
  _$jscoverage['/touch/double-tap.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/touch/double-tap.js'].branchData['44'] = [];
  _$jscoverage['/touch/double-tap.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/touch/double-tap.js'].branchData['48'] = [];
  _$jscoverage['/touch/double-tap.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/touch/double-tap.js'].branchData['64'] = [];
  _$jscoverage['/touch/double-tap.js'].branchData['64'][1] = new BranchData();
}
_$jscoverage['/touch/double-tap.js'].branchData['64'][1].init(1182, 23, 'duration > MAX_DURATION');
function visit5_64_1(result) {
  _$jscoverage['/touch/double-tap.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/double-tap.js'].branchData['48'][1].init(175, 23, 'duration < MAX_DURATION');
function visit4_48_1(result) {
  _$jscoverage['/touch/double-tap.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/double-tap.js'].branchData['44'][1].init(374, 11, 'lastEndTime');
function visit3_44_1(result) {
  _$jscoverage['/touch/double-tap.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/double-tap.js'].branchData['25'][1].init(248, 19, 'self.singleTapTimer');
function visit2_25_1(result) {
  _$jscoverage['/touch/double-tap.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/double-tap.js'].branchData['21'][1].init(56, 66, 'DoubleTap.superclass.onTouchStart.apply(self, arguments) === false');
function visit1_21_1(result) {
  _$jscoverage['/touch/double-tap.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/double-tap.js'].lineData[6]++;
KISSY.add('event/dom/touch/double-tap', function(S, eventHandleMap, DomEvent, SingleTouch) {
  _$jscoverage['/touch/double-tap.js'].functionData[0]++;
  _$jscoverage['/touch/double-tap.js'].lineData[9]++;
  var SINGLE_TAP = 'singleTap', DOUBLE_TAP = 'doubleTap', MAX_DURATION = 300;
  _$jscoverage['/touch/double-tap.js'].lineData[14]++;
  function DoubleTap() {
    _$jscoverage['/touch/double-tap.js'].functionData[1]++;
  }
  _$jscoverage['/touch/double-tap.js'].lineData[17]++;
  S.extend(DoubleTap, SingleTouch, {
  onTouchStart: function(e) {
  _$jscoverage['/touch/double-tap.js'].functionData[2]++;
  _$jscoverage['/touch/double-tap.js'].lineData[20]++;
  var self = this;
  _$jscoverage['/touch/double-tap.js'].lineData[21]++;
  if (visit1_21_1(DoubleTap.superclass.onTouchStart.apply(self, arguments) === false)) {
    _$jscoverage['/touch/double-tap.js'].lineData[22]++;
    return false;
  }
  _$jscoverage['/touch/double-tap.js'].lineData[24]++;
  self.startTime = e.timeStamp;
  _$jscoverage['/touch/double-tap.js'].lineData[25]++;
  if (visit2_25_1(self.singleTapTimer)) {
    _$jscoverage['/touch/double-tap.js'].lineData[26]++;
    clearTimeout(self.singleTapTimer);
    _$jscoverage['/touch/double-tap.js'].lineData[27]++;
    self.singleTapTimer = 0;
  }
}, 
  onTouchMove: function() {
  _$jscoverage['/touch/double-tap.js'].functionData[3]++;
  _$jscoverage['/touch/double-tap.js'].lineData[32]++;
  return false;
}, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch/double-tap.js'].functionData[4]++;
  _$jscoverage['/touch/double-tap.js'].lineData[36]++;
  var self = this, lastEndTime = self.lastEndTime, time = e.timeStamp, target = e.target, touch = e.changedTouches[0], duration = time - self.startTime;
  _$jscoverage['/touch/double-tap.js'].lineData[42]++;
  self.lastEndTime = time;
  _$jscoverage['/touch/double-tap.js'].lineData[44]++;
  if (visit3_44_1(lastEndTime)) {
    _$jscoverage['/touch/double-tap.js'].lineData[46]++;
    duration = time - lastEndTime;
    _$jscoverage['/touch/double-tap.js'].lineData[48]++;
    if (visit4_48_1(duration < MAX_DURATION)) {
      _$jscoverage['/touch/double-tap.js'].lineData[50]++;
      self.lastEndTime = 0;
      _$jscoverage['/touch/double-tap.js'].lineData[52]++;
      DomEvent.fire(target, DOUBLE_TAP, {
  touch: touch, 
  duration: duration / 1000});
      _$jscoverage['/touch/double-tap.js'].lineData[56]++;
      return;
    }
  }
  _$jscoverage['/touch/double-tap.js'].lineData[63]++;
  duration = time - self.startTime;
  _$jscoverage['/touch/double-tap.js'].lineData[64]++;
  if (visit5_64_1(duration > MAX_DURATION)) {
    _$jscoverage['/touch/double-tap.js'].lineData[65]++;
    DomEvent.fire(target, SINGLE_TAP, {
  touch: touch, 
  pageX: touch.pageX, 
  which: 1, 
  pageY: touch.pageY, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/touch/double-tap.js'].lineData[75]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/touch/double-tap.js'].functionData[5]++;
  _$jscoverage['/touch/double-tap.js'].lineData[76]++;
  DomEvent.fire(target, SINGLE_TAP, {
  touch: touch, 
  pageX: touch.pageX, 
  which: 1, 
  pageY: touch.pageY, 
  duration: duration / 1000});
}, MAX_DURATION);
  }
}});
  _$jscoverage['/touch/double-tap.js'].lineData[89]++;
  eventHandleMap[SINGLE_TAP] = eventHandleMap[DOUBLE_TAP] = {
  handle: new DoubleTap()};
  _$jscoverage['/touch/double-tap.js'].lineData[93]++;
  return DoubleTap;
}, {
  requires: ['./handle-map', 'event/dom/base', './single-touch']});
