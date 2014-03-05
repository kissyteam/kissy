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
  _$jscoverage['/touch/pinch.js'].lineData[10] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[14] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[15] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[17] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[20] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[23] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[25] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[27] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[29] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[32] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[33] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[36] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[38] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[39] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[40] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[41] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[42] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[48] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[57] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[58] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[59] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[65] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[67] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[72] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[73] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[74] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[78] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[81] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[82] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[83] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[85] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[86] = 0;
  _$jscoverage['/touch/pinch.js'].lineData[90] = 0;
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
  _$jscoverage['/touch/pinch.js'].branchData['32'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][3] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][4] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][5] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][6] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][7] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['32'][8] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['38'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['73'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/touch/pinch.js'].branchData['81'] = [];
  _$jscoverage['/touch/pinch.js'].branchData['81'][1] = new BranchData();
}
_$jscoverage['/touch/pinch.js'].branchData['81'][1].init(2126, 33, 'S.Feature.isTouchEventSupported()');
function visit74_81_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['73'][1].init(13, 28, 'e.targetTouches.length === 2');
function visit73_73_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['38'][1].init(412, 15, '!self.isStarted');
function visit72_38_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][8].init(267, 20, 'touches[1].pageY > 0');
function visit71_32_8(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][8].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][7].init(243, 20, 'touches[1].pageX > 0');
function visit70_32_7(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][7].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][6].init(243, 44, 'touches[1].pageX > 0 && touches[1].pageY > 0');
function visit69_32_6(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][6].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][5].init(219, 20, 'touches[0].pageY > 0');
function visit68_32_5(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][5].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][4].init(219, 68, 'touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0');
function visit67_32_4(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][4].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][3].init(195, 20, 'touches[0].pageX > 0');
function visit66_32_3(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][2].init(195, 92, 'touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0');
function visit65_32_2(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].branchData['32'][1].init(193, 95, '!(touches[0].pageX > 0 && touches[0].pageY > 0 && touches[1].pageX > 0 && touches[1].pageY > 0)');
function visit64_32_1(result) {
  _$jscoverage['/touch/pinch.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/pinch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/pinch.js'].functionData[0]++;
  _$jscoverage['/touch/pinch.js'].lineData[7]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/pinch.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/pinch.js'].lineData[9]++;
  var DoubleTouch = require('./double-touch');
  _$jscoverage['/touch/pinch.js'].lineData[10]++;
  var PINCH = 'pinch', PINCH_START = 'pinchStart', PINCH_END = 'pinchEnd';
  _$jscoverage['/touch/pinch.js'].lineData[14]++;
  function getDistance(p1, p2) {
    _$jscoverage['/touch/pinch.js'].functionData[1]++;
    _$jscoverage['/touch/pinch.js'].lineData[15]++;
    var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
    _$jscoverage['/touch/pinch.js'].lineData[17]++;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  _$jscoverage['/touch/pinch.js'].lineData[20]++;
  function Pinch() {
    _$jscoverage['/touch/pinch.js'].functionData[2]++;
  }
  _$jscoverage['/touch/pinch.js'].lineData[23]++;
  S.extend(Pinch, DoubleTouch, {
  move: function(e) {
  _$jscoverage['/touch/pinch.js'].functionData[3]++;
  _$jscoverage['/touch/pinch.js'].lineData[25]++;
  var self = this;
  _$jscoverage['/touch/pinch.js'].lineData[27]++;
  Pinch.superclass.move.apply(self, arguments);
  _$jscoverage['/touch/pinch.js'].lineData[29]++;
  var touches = self.lastTouches;
  _$jscoverage['/touch/pinch.js'].lineData[32]++;
  if (visit64_32_1(!(visit65_32_2(visit66_32_3(touches[0].pageX > 0) && visit67_32_4(visit68_32_5(touches[0].pageY > 0) && visit69_32_6(visit70_32_7(touches[1].pageX > 0) && visit71_32_8(touches[1].pageY > 0))))))) {
    _$jscoverage['/touch/pinch.js'].lineData[33]++;
    return;
  }
  _$jscoverage['/touch/pinch.js'].lineData[36]++;
  var distance = getDistance(touches[0], touches[1]);
  _$jscoverage['/touch/pinch.js'].lineData[38]++;
  if (visit72_38_1(!self.isStarted)) {
    _$jscoverage['/touch/pinch.js'].lineData[39]++;
    self.isStarted = true;
    _$jscoverage['/touch/pinch.js'].lineData[40]++;
    self.startDistance = distance;
    _$jscoverage['/touch/pinch.js'].lineData[41]++;
    var target = self.target = self.getCommonTarget(e);
    _$jscoverage['/touch/pinch.js'].lineData[42]++;
    DomEvent.fire(target, PINCH_START, S.mix(e, {
  distance: distance, 
  scale: 1}));
  } else {
    _$jscoverage['/touch/pinch.js'].lineData[48]++;
    DomEvent.fire(self.target, PINCH, S.mix(e, {
  distance: distance, 
  scale: distance / self.startDistance}));
  }
}, 
  end: function(e) {
  _$jscoverage['/touch/pinch.js'].functionData[4]++;
  _$jscoverage['/touch/pinch.js'].lineData[57]++;
  var self = this;
  _$jscoverage['/touch/pinch.js'].lineData[58]++;
  Pinch.superclass.end.apply(self, arguments);
  _$jscoverage['/touch/pinch.js'].lineData[59]++;
  DomEvent.fire(self.target, PINCH_END, S.mix(e, {
  touches: self.lastTouches}));
}});
  _$jscoverage['/touch/pinch.js'].lineData[65]++;
  var p = new Pinch();
  _$jscoverage['/touch/pinch.js'].lineData[67]++;
  eventHandleMap[PINCH_START] = eventHandleMap[PINCH_END] = {
  handle: p};
  _$jscoverage['/touch/pinch.js'].lineData[72]++;
  function prevent(e) {
    _$jscoverage['/touch/pinch.js'].functionData[5]++;
    _$jscoverage['/touch/pinch.js'].lineData[73]++;
    if (visit73_73_1(e.targetTouches.length === 2)) {
      _$jscoverage['/touch/pinch.js'].lineData[74]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/touch/pinch.js'].lineData[78]++;
  var config = eventHandleMap[PINCH] = {
  handle: p};
  _$jscoverage['/touch/pinch.js'].lineData[81]++;
  if (visit74_81_1(S.Feature.isTouchEventSupported())) {
    _$jscoverage['/touch/pinch.js'].lineData[82]++;
    config.setup = function() {
  _$jscoverage['/touch/pinch.js'].functionData[6]++;
  _$jscoverage['/touch/pinch.js'].lineData[83]++;
  this.addEventListener('touchmove', prevent, false);
};
    _$jscoverage['/touch/pinch.js'].lineData[85]++;
    config.tearDown = function() {
  _$jscoverage['/touch/pinch.js'].functionData[7]++;
  _$jscoverage['/touch/pinch.js'].lineData[86]++;
  this.removeEventListener('touchmove', prevent, false);
};
  }
  _$jscoverage['/touch/pinch.js'].lineData[90]++;
  return Pinch;
});
