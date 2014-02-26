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
if (! _$jscoverage['/touch/pinch.js']) {
  _$jscoverage['/touch/pinch.js'] = {};
  _$jscoverage['/touch/pinch.js'].lineData = [];
  _$jscoverage['/touch/pinch.js'].lineData[6] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[7] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[8] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[9] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[11] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[15] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[16] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[18] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[21] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[24] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[26] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[28] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[29] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[32] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[35] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[36] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[39] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[41] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[43] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[44] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[45] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[46] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[47] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[53] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[62] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[63] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[69] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[71] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[76] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[77] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[78] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[82] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[85] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[86] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[87] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[89] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[90] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[94] = 0;
}
if (! _$jscoverage['/touch/pinch.js'].functionData) {
  _$jscoverage['/touch/pinch.js'].functionData = [];
  _$jscoverage['/touch/pinch.js'].functionData[0] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[1] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[2] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[3] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[4] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[5] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[6] = 0;
  _$jscoverage['/touch/pinch.js'].functionData[7] = 0;
}
if (! _$jscoverage['/touch/pinch.js'].branchData) {
  _$jscoverage['/touch/pinch.js'].branchData = {};
  _$jscoverage['/touch/pinch.js'].branchData['28'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][3] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][4] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][5] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][6] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][7] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['35'][8] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['43'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['77'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['85'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['85'][1] = new BranchData();
}
_$jscoverage['/touch/pinch.js'].branchData['85'][1].init(2130, 34, 'S.Features.isTouchEventSupported()');
function visit76_85_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['77'][1].init(13, 28, 'e.targetTouches.length === 2');
function visit75_77_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['43'][1].init(463, 15, '!self.isStarted');
function visit74_43_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][8].init(277, 20, 'touches[1].pageY > 0');
function visit73_35_8(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][8].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][7].init(253, 20, 'touches[1].pageX > 0');
function visit72_35_7(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][7].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][6].init(253, 44, 'touches[1].pageX > 0 && touches[1].pageY > 0');
function visit71_35_6(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][6].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][5].init(229, 20, 'touches[0].pageY > 0');
function visit70_35_5(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][5].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][4].init(229, 68, 'touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0');
function visit69_35_4(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][4].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][3].init(205, 20, 'touches[0].pageX > 0');
function visit68_35_3(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][2].init(205, 92, 'touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0');
function visit67_35_2(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['35'][1].init(203, 95, '!(touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0)');
function visit66_35_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['28'][1].init(47, 16, '!self.isTracking');
function visit65_28_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/pinch.js'].functionData[0]++;
  _$jscoverage['/touch/pinch.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/pinch.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/pinch.js'].lineData[9]++;
  var MultiTouch = require('./multi-touch');
  _$jscoverage['/touch/pinch.js'].lineData[11]++;
  var PINCH = 'pinch', PINCH_START = 'pinchStart', PINCH_END = 'pinchEnd';
  _$jscoverage['/touch/pinch.js'].lineData[15]++;
  function getDistance(p1, p2) {
    _$jscoverage['/touch/pinch.js'].functionData[1]++;
    _$jscoverage['/touch/pinch.js'].lineData[16]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/touch/pinch.js'].lineData[18]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/touch/pinch.js'].lineData[21]++;
  function Pinch() {
    _$jscoverage['/touch/pinch.js'].functionData[2]++;
  }
  _$jscoverage['/touch/pinch.js'].lineData[24]++;
  S.extend(Pinch, MultiTouch, {
  onTouchMove: function(e) {
  _$jscoverage['/touch/pinch.js'].functionData[3]++;
  _$jscoverage['/touch/pinch.js'].lineData[26]++;
  var self = this;
  _$jscoverage['/touch/pinch.js'].lineData[28]++;
  if (visit65_28_1(!self.isTracking)) {
    _$jscoverage['/touch/pinch.js'].lineData[29]++;
    return;
  }
  _$jscoverage['/touch/pinch.js'].lineData[32]++;
  var touches = e.touches;
  _$jscoverage['/touch/pinch.js'].lineData[35]++;
  if (visit66_35_1(!(visit67_35_2(visit68_35_3(touches[0].pageX > 0) && visit69_35_4(visit70_35_5(touches[0].pageY > 0) && visit71_35_6(visit72_35_7(touches[1].pageX > 0) && visit73_35_8(touches[1].pageY > 0))))))) {
    _$jscoverage['/touch/pinch.js'].lineData[36]++;
    return;
  }
  _$jscoverage['/touch/pinch.js'].lineData[39]++;
  var distance = getDistance(touches[0], touches[1]);
  _$jscoverage['/touch/pinch.js'].lineData[41]++;
  self.lastTouches = touches;
  _$jscoverage['/touch/pinch.js'].lineData[43]++;
  if (visit74_43_1(!self.isStarted)) {
    _$jscoverage['/touch/pinch.js'].lineData[44]++;
    self.isStarted = true;
    _$jscoverage['/touch/pinch.js'].lineData[45]++;
    self.startDistance = distance;
    _$jscoverage['/touch/pinch.js'].lineData[46]++;
    var target = self.target = self.getCommonTarget(e);
    _$jscoverage['/touch/pinch.js'].lineData[47]++;
    DomEvent.fire(target, PINCH_START, S.mix(e, {
  distance: distance, 
  scale: 1}));
  } else {
    _$jscoverage['/touch/pinch.js'].lineData[53]++;
    DomEvent.fire(self.target, PINCH, S.mix(e, {
  distance: distance, 
  scale: distance / self.startDistance}));
  }
}, 
  fireEnd: function(e) {
  _$jscoverage['/touch/pinch.js'].functionData[4]++;
  _$jscoverage['/touch/pinch.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/touch/pinch.js'].lineData[63]++;
  DomEvent.fire(self.target, PINCH_END, S.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/touch/pinch.js'].lineData[69]++;
  var p = new Pinch();
  _$jscoverage['/touch/pinch.js'].lineData[71]++;
  eventHandleMap[PINCH_START] = eventHandleMap[PINCH_END] = {
  handle: p};
  _$jscoverage['/touch/pinch.js'].lineData[76]++;
  function prevent(e) {
    _$jscoverage['/touch/pinch.js'].functionData[5]++;
    _$jscoverage['/touch/pinch.js'].lineData[77]++;
    if (visit75_77_1(e.targetTouches.length === 2)) {
      _$jscoverage['/touch/pinch.js'].lineData[78]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/touch/pinch.js'].lineData[82]++;
  var config = eventHandleMap[PINCH] = {
  handle: p};
  _$jscoverage['/touch/pinch.js'].lineData[85]++;
  if (visit76_85_1(S.Features.isTouchEventSupported())) {
    _$jscoverage['/touch/pinch.js'].lineData[86]++;
    config.setup = function() {
  _$jscoverage['/touch/pinch.js'].functionData[6]++;
  _$jscoverage['/touch/pinch.js'].lineData[87]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/touch/pinch.js'].lineData[89]++;
    config.tearDown = function() {
  _$jscoverage['/touch/pinch.js'].functionData[7]++;
  _$jscoverage['/touch/pinch.js'].lineData[90]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/touch/pinch.js'].lineData[94]++;
  return Pinch;
});
