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
if (! _$jscoverage['/touch/tap.js']) {
  _$jscoverage['/touch/tap.js'] = {};
  _$jscoverage['/touch/tap.js'].lineData = [];
  _$jscoverage['/touch/tap.js'].lineData[6] = 0;
  _$jscoverage['/touch/tap.js'].lineData[7] = 0;
  _$jscoverage['/touch/tap.js'].lineData[8] = 0;
  _$jscoverage['/touch/tap.js'].lineData[9] = 0;
  _$jscoverage['/touch/tap.js'].lineData[11] = 0;
  _$jscoverage['/touch/tap.js'].lineData[21] = 0;
  _$jscoverage['/touch/tap.js'].lineData[22] = 0;
  _$jscoverage['/touch/tap.js'].lineData[25] = 0;
  _$jscoverage['/touch/tap.js'].lineData[26] = 0;
  _$jscoverage['/touch/tap.js'].lineData[29] = 0;
  _$jscoverage['/touch/tap.js'].lineData[31] = 0;
  _$jscoverage['/touch/tap.js'].lineData[32] = 0;
  _$jscoverage['/touch/tap.js'].lineData[33] = 0;
  _$jscoverage['/touch/tap.js'].lineData[37] = 0;
  _$jscoverage['/touch/tap.js'].lineData[38] = 0;
  _$jscoverage['/touch/tap.js'].lineData[40] = 0;
  _$jscoverage['/touch/tap.js'].lineData[41] = 0;
  _$jscoverage['/touch/tap.js'].lineData[46] = 0;
  _$jscoverage['/touch/tap.js'].lineData[47] = 0;
  _$jscoverage['/touch/tap.js'].lineData[48] = 0;
  _$jscoverage['/touch/tap.js'].lineData[52] = 0;
  _$jscoverage['/touch/tap.js'].lineData[53] = 0;
  _$jscoverage['/touch/tap.js'].lineData[54] = 0;
  _$jscoverage['/touch/tap.js'].lineData[55] = 0;
  _$jscoverage['/touch/tap.js'].lineData[58] = 0;
  _$jscoverage['/touch/tap.js'].lineData[61] = 0;
  _$jscoverage['/touch/tap.js'].lineData[63] = 0;
  _$jscoverage['/touch/tap.js'].lineData[64] = 0;
  _$jscoverage['/touch/tap.js'].lineData[66] = 0;
  _$jscoverage['/touch/tap.js'].lineData[70] = 0;
  _$jscoverage['/touch/tap.js'].lineData[73] = 0;
  _$jscoverage['/touch/tap.js'].lineData[75] = 0;
  _$jscoverage['/touch/tap.js'].lineData[79] = 0;
  _$jscoverage['/touch/tap.js'].lineData[81] = 0;
  _$jscoverage['/touch/tap.js'].lineData[82] = 0;
  _$jscoverage['/touch/tap.js'].lineData[84] = 0;
  _$jscoverage['/touch/tap.js'].lineData[85] = 0;
  _$jscoverage['/touch/tap.js'].lineData[88] = 0;
  _$jscoverage['/touch/tap.js'].lineData[89] = 0;
  _$jscoverage['/touch/tap.js'].lineData[90] = 0;
  _$jscoverage['/touch/tap.js'].lineData[94] = 0;
  _$jscoverage['/touch/tap.js'].lineData[96] = 0;
  _$jscoverage['/touch/tap.js'].lineData[105] = 0;
  _$jscoverage['/touch/tap.js'].lineData[106] = 0;
  _$jscoverage['/touch/tap.js'].lineData[109] = 0;
  _$jscoverage['/touch/tap.js'].lineData[110] = 0;
  _$jscoverage['/touch/tap.js'].lineData[111] = 0;
  _$jscoverage['/touch/tap.js'].lineData[113] = 0;
  _$jscoverage['/touch/tap.js'].lineData[121] = 0;
  _$jscoverage['/touch/tap.js'].lineData[124] = 0;
  _$jscoverage['/touch/tap.js'].lineData[126] = 0;
  _$jscoverage['/touch/tap.js'].lineData[128] = 0;
  _$jscoverage['/touch/tap.js'].lineData[130] = 0;
  _$jscoverage['/touch/tap.js'].lineData[132] = 0;
  _$jscoverage['/touch/tap.js'].lineData[133] = 0;
  _$jscoverage['/touch/tap.js'].lineData[140] = 0;
  _$jscoverage['/touch/tap.js'].lineData[147] = 0;
  _$jscoverage['/touch/tap.js'].lineData[148] = 0;
  _$jscoverage['/touch/tap.js'].lineData[149] = 0;
  _$jscoverage['/touch/tap.js'].lineData[159] = 0;
  _$jscoverage['/touch/tap.js'].lineData[160] = 0;
  _$jscoverage['/touch/tap.js'].lineData[172] = 0;
  _$jscoverage['/touch/tap.js'].lineData[176] = 0;
}
if (! _$jscoverage['/touch/tap.js'].functionData) {
  _$jscoverage['/touch/tap.js'].functionData = [];
  _$jscoverage['/touch/tap.js'].functionData[0] = 0;
  _$jscoverage['/touch/tap.js'].functionData[1] = 0;
  _$jscoverage['/touch/tap.js'].functionData[2] = 0;
  _$jscoverage['/touch/tap.js'].functionData[3] = 0;
  _$jscoverage['/touch/tap.js'].functionData[4] = 0;
  _$jscoverage['/touch/tap.js'].functionData[5] = 0;
  _$jscoverage['/touch/tap.js'].functionData[6] = 0;
  _$jscoverage['/touch/tap.js'].functionData[7] = 0;
}
if (! _$jscoverage['/touch/tap.js'].branchData) {
  _$jscoverage['/touch/tap.js'].branchData = {};
  _$jscoverage['/touch/tap.js'].branchData['32'] = [];
  _$jscoverage['/touch/tap.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['37'] = [];
  _$jscoverage['/touch/tap.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['53'] = [];
  _$jscoverage['/touch/tap.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['63'] = [];
  _$jscoverage['/touch/tap.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['70'] = [];
  _$jscoverage['/touch/tap.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['71'] = [];
  _$jscoverage['/touch/tap.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['72'] = [];
  _$jscoverage['/touch/tap.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['81'] = [];
  _$jscoverage['/touch/tap.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['88'] = [];
  _$jscoverage['/touch/tap.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['109'] = [];
  _$jscoverage['/touch/tap.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['110'] = [];
  _$jscoverage['/touch/tap.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['113'] = [];
  _$jscoverage['/touch/tap.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['126'] = [];
  _$jscoverage['/touch/tap.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['130'] = [];
  _$jscoverage['/touch/tap.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/touch/tap.js'].branchData['148'] = [];
  _$jscoverage['/touch/tap.js'].branchData['148'][1] = new BranchData();
}
_$jscoverage['/touch/tap.js'].branchData['148'][1].init(2400, 27, 'duration > SINGLE_TAP_DELAY');
function visit120_148_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['130'][1].init(155, 27, 'duration < SINGLE_TAP_DELAY');
function visit119_130_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['126'][1].init(1551, 11, 'lastEndTime');
function visit118_126_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['113'][1].init(33, 30, 'target.ownerDocument || target');
function visit117_113_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['110'][1].init(21, 8, 'S.UA.ios');
function visit116_110_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['109'][1].init(957, 47, 'eventObject.isDefaultPrevented() && S.UA.mobile');
function visit115_109_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['88'][1].init(275, 17, 'self.tapHoldTimer');
function visit114_88_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['81'][1].init(83, 23, '!(lastXY = self.lastXY)');
function visit113_81_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['72'][1].init(87, 68, 'Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit112_72_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['71'][2].init(420, 68, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY');
function visit111_71_2(result) {
  _$jscoverage['/touch/tap.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['71'][1].init(32, 156, 'Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit110_71_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['70'][1].init(385, 189, '!currentTouch || Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY || Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY');
function visit109_70_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['63'][1].init(70, 23, '!(lastXY = self.lastXY)');
function visit108_63_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['53'][1].init(805, 19, 'self.singleTapTimer');
function visit107_53_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['37'][1].init(185, 17, 'self.tapHoldTimer');
function visit106_37_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].branchData['32'][1].init(46, 51, 'Tap.superclass.onTouchStart.call(self, e) === false');
function visit105_32_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/tap.js'].functionData[0]++;
  _$jscoverage['/touch/tap.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/tap.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/tap.js'].lineData[9]++;
  var SingleTouch = require('./single-touch');
  _$jscoverage['/touch/tap.js'].lineData[11]++;
  var SINGLE_TAP_EVENT = 'singleTap', DOUBLE_TAP_EVENT = 'doubleTap', TAP_HOLD_EVENT = 'tapHold', TAP_EVENT = 'tap', TAP_HOLD_DELAY = 1000, SINGLE_TAP_DELAY = 300, TOUCH_MOVE_SENSITIVITY = 5, DomEventObject = DomEvent.Object;
  _$jscoverage['/touch/tap.js'].lineData[21]++;
  function preventDefault(e) {
    _$jscoverage['/touch/tap.js'].functionData[1]++;
    _$jscoverage['/touch/tap.js'].lineData[22]++;
    e.preventDefault();
  }
  _$jscoverage['/touch/tap.js'].lineData[25]++;
  function Tap() {
    _$jscoverage['/touch/tap.js'].functionData[2]++;
    _$jscoverage['/touch/tap.js'].lineData[26]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/touch/tap.js'].lineData[29]++;
  S.extend(Tap, SingleTouch, {
  onTouchStart: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[3]++;
  _$jscoverage['/touch/tap.js'].lineData[31]++;
  var self = this;
  _$jscoverage['/touch/tap.js'].lineData[32]++;
  if (visit105_32_1(Tap.superclass.onTouchStart.call(self, e) === false)) {
    _$jscoverage['/touch/tap.js'].lineData[33]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[37]++;
  if (visit106_37_1(self.tapHoldTimer)) {
    _$jscoverage['/touch/tap.js'].lineData[38]++;
    clearTimeout(self.tapHoldTimer);
  }
  _$jscoverage['/touch/tap.js'].lineData[40]++;
  self.tapHoldTimer = setTimeout(function() {
  _$jscoverage['/touch/tap.js'].functionData[4]++;
  _$jscoverage['/touch/tap.js'].lineData[41]++;
  var eventObj = S.mix({
  touch: e.touches[0], 
  which: 1, 
  TAP_HOLD_DELAY: (S.now() - e.timeStamp) / 1000}, self.lastXY);
  _$jscoverage['/touch/tap.js'].lineData[46]++;
  self.tapHoldTimer = 0;
  _$jscoverage['/touch/tap.js'].lineData[47]++;
  self.lastXY = 0;
  _$jscoverage['/touch/tap.js'].lineData[48]++;
  DomEvent.fire(e.target, TAP_HOLD_EVENT, eventObj);
}, TAP_HOLD_DELAY);
  _$jscoverage['/touch/tap.js'].lineData[52]++;
  self.startTime = e.timeStamp;
  _$jscoverage['/touch/tap.js'].lineData[53]++;
  if (visit107_53_1(self.singleTapTimer)) {
    _$jscoverage['/touch/tap.js'].lineData[54]++;
    clearTimeout(self.singleTapTimer);
    _$jscoverage['/touch/tap.js'].lineData[55]++;
    self.singleTapTimer = 0;
  }
  _$jscoverage['/touch/tap.js'].lineData[58]++;
  return undefined;
}, 
  onTouchMove: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[5]++;
  _$jscoverage['/touch/tap.js'].lineData[61]++;
  var self = this, lastXY;
  _$jscoverage['/touch/tap.js'].lineData[63]++;
  if (visit108_63_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/touch/tap.js'].lineData[64]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[66]++;
  var currentTouch = e.changedTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[70]++;
  if (visit109_70_1(!currentTouch || visit110_71_1(visit111_71_2(Math.abs(currentTouch.pageX - lastXY.pageX) > TOUCH_MOVE_SENSITIVITY) || visit112_72_1(Math.abs(currentTouch.pageY - lastXY.pageY) > TOUCH_MOVE_SENSITIVITY)))) {
    _$jscoverage['/touch/tap.js'].lineData[73]++;
    return false;
  }
  _$jscoverage['/touch/tap.js'].lineData[75]++;
  return undefined;
}, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[6]++;
  _$jscoverage['/touch/tap.js'].lineData[79]++;
  var self = this, lastXY;
  _$jscoverage['/touch/tap.js'].lineData[81]++;
  if (visit113_81_1(!(lastXY = self.lastXY))) {
    _$jscoverage['/touch/tap.js'].lineData[82]++;
    return;
  }
  _$jscoverage['/touch/tap.js'].lineData[84]++;
  var target = e.target;
  _$jscoverage['/touch/tap.js'].lineData[85]++;
  var touch = e.changedTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[88]++;
  if (visit114_88_1(self.tapHoldTimer)) {
    _$jscoverage['/touch/tap.js'].lineData[89]++;
    clearTimeout(self.tapHoldTimer);
    _$jscoverage['/touch/tap.js'].lineData[90]++;
    self.tapHoldTimer = 0;
  }
  _$jscoverage['/touch/tap.js'].lineData[94]++;
  var eventObject = new DomEventObject(e.originalEvent);
  _$jscoverage['/touch/tap.js'].lineData[96]++;
  S.mix(eventObject, {
  type: TAP_EVENT, 
  which: 1, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/touch/tap.js'].lineData[105]++;
  eventObject.touch = touch;
  _$jscoverage['/touch/tap.js'].lineData[106]++;
  DomEvent.fire(target, TAP_EVENT, eventObject);
  _$jscoverage['/touch/tap.js'].lineData[109]++;
  if (visit115_109_1(eventObject.isDefaultPrevented() && S.UA.mobile)) {
    _$jscoverage['/touch/tap.js'].lineData[110]++;
    if (visit116_110_1(S.UA.ios)) {
      _$jscoverage['/touch/tap.js'].lineData[111]++;
      e.preventDefault();
    } else {
      _$jscoverage['/touch/tap.js'].lineData[113]++;
      DomEvent.on(visit117_113_1(target.ownerDocument || target), 'click', {
  fn: preventDefault, 
  once: 1});
    }
  }
  _$jscoverage['/touch/tap.js'].lineData[121]++;
  var lastEndTime = self.lastEndTime, time = e.timeStamp, duration;
  _$jscoverage['/touch/tap.js'].lineData[124]++;
  self.lastEndTime = time;
  _$jscoverage['/touch/tap.js'].lineData[126]++;
  if (visit118_126_1(lastEndTime)) {
    _$jscoverage['/touch/tap.js'].lineData[128]++;
    duration = time - lastEndTime;
    _$jscoverage['/touch/tap.js'].lineData[130]++;
    if (visit119_130_1(duration < SINGLE_TAP_DELAY)) {
      _$jscoverage['/touch/tap.js'].lineData[132]++;
      self.lastEndTime = 0;
      _$jscoverage['/touch/tap.js'].lineData[133]++;
      DomEvent.fire(target, DOUBLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
      _$jscoverage['/touch/tap.js'].lineData[140]++;
      return;
    }
  }
  _$jscoverage['/touch/tap.js'].lineData[147]++;
  duration = time - self.startTime;
  _$jscoverage['/touch/tap.js'].lineData[148]++;
  if (visit120_148_1(duration > SINGLE_TAP_DELAY)) {
    _$jscoverage['/touch/tap.js'].lineData[149]++;
    DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
  } else {
    _$jscoverage['/touch/tap.js'].lineData[159]++;
    self.singleTapTimer = setTimeout(function() {
  _$jscoverage['/touch/tap.js'].functionData[7]++;
  _$jscoverage['/touch/tap.js'].lineData[160]++;
  DomEvent.fire(target, SINGLE_TAP_EVENT, {
  touch: touch, 
  pageX: lastXY.pageX, 
  pageY: lastXY.pageY, 
  which: 1, 
  duration: duration / 1000});
}, SINGLE_TAP_DELAY);
  }
}});
  _$jscoverage['/touch/tap.js'].lineData[172]++;
  eventHandleMap[TAP_EVENT] = eventHandleMap[DOUBLE_TAP_EVENT] = eventHandleMap[SINGLE_TAP_EVENT] = eventHandleMap[TAP_HOLD_EVENT] = {
  handle: new Tap()};
  _$jscoverage['/touch/tap.js'].lineData[176]++;
  return Tap;
});
