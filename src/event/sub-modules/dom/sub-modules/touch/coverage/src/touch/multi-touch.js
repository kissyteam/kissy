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
if (! _$jscoverage['/touch/multi-touch.js']) {
  _$jscoverage['/touch/multi-touch.js'] = {};
  _$jscoverage['/touch/multi-touch.js'].lineData = [];
  _$jscoverage['/touch/multi-touch.js'].lineData[6] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[7] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[9] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[12] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[18] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[22] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[23] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[25] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[26] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[31] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[35] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[36] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[37] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[38] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[45] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[48] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[49] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[51] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[52] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[55] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[56] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[57] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[59] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[61] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[62] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[66] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[71] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[72] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[74] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[75] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[76] = 0;
  _$jscoverage['/touch/multi-touch.js'].lineData[82] = 0;
}
if (! _$jscoverage['/touch/multi-touch.js'].functionData) {
  _$jscoverage['/touch/multi-touch.js'].functionData = [];
  _$jscoverage['/touch/multi-touch.js'].functionData[0] = 0;
  _$jscoverage['/touch/multi-touch.js'].functionData[1] = 0;
  _$jscoverage['/touch/multi-touch.js'].functionData[2] = 0;
  _$jscoverage['/touch/multi-touch.js'].functionData[3] = 0;
  _$jscoverage['/touch/multi-touch.js'].functionData[4] = 0;
  _$jscoverage['/touch/multi-touch.js'].functionData[5] = 0;
  _$jscoverage['/touch/multi-touch.js'].functionData[6] = 0;
}
if (! _$jscoverage['/touch/multi-touch.js'].branchData) {
  _$jscoverage['/touch/multi-touch.js'].branchData = {};
  _$jscoverage['/touch/multi-touch.js'].branchData['22'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['25'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['36'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['48'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['51'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['56'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['71'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/touch/multi-touch.js'].branchData['74'] = [];
  _$jscoverage['/touch/multi-touch.js'].branchData['74'][1] = new BranchData();
}
_$jscoverage['/touch/multi-touch.js'].branchData['74'][1].init(63, 14, 'self.isStarted');
function visit64_74_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['71'][1].init(251, 15, 'self.isTracking');
function visit63_71_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['56'][1].init(21, 20, 'Dom.contains(t2, t1)');
function visit62_56_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['51'][1].init(204, 20, 'Dom.contains(t1, t2)');
function visit61_51_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['48'][1].init(134, 9, 't1 === t2');
function visit60_48_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['36'][1].init(46, 16, '!self.isTracking');
function visit59_36_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['25'][1].init(301, 35, 'touchesCount > requiredTouchesCount');
function visit58_25_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].branchData['22'][1].init(194, 37, 'touchesCount === requiredTouchesCount');
function visit57_22_1(result) {
  _$jscoverage['/touch/multi-touch.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/multi-touch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/multi-touch.js'].functionData[0]++;
  _$jscoverage['/touch/multi-touch.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/touch/multi-touch.js'].lineData[9]++;
  function MultiTouch() {
    _$jscoverage['/touch/multi-touch.js'].functionData[1]++;
  }
  _$jscoverage['/touch/multi-touch.js'].lineData[12]++;
  MultiTouch.prototype = {
  constructor: MultiTouch, 
  requiredTouchCount: 2, 
  onTouchStart: function(e) {
  _$jscoverage['/touch/multi-touch.js'].functionData[2]++;
  _$jscoverage['/touch/multi-touch.js'].lineData[18]++;
  var self = this, requiredTouchesCount = self.requiredTouchCount, touches = e.touches, touchesCount = touches.length;
  _$jscoverage['/touch/multi-touch.js'].lineData[22]++;
  if (visit57_22_1(touchesCount === requiredTouchesCount)) {
    _$jscoverage['/touch/multi-touch.js'].lineData[23]++;
    self.start();
  } else {
    _$jscoverage['/touch/multi-touch.js'].lineData[25]++;
    if (visit58_25_1(touchesCount > requiredTouchesCount)) {
      _$jscoverage['/touch/multi-touch.js'].lineData[26]++;
      self.end(e);
    }
  }
}, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch/multi-touch.js'].functionData[3]++;
  _$jscoverage['/touch/multi-touch.js'].lineData[31]++;
  this.end(e);
}, 
  start: function() {
  _$jscoverage['/touch/multi-touch.js'].functionData[4]++;
  _$jscoverage['/touch/multi-touch.js'].lineData[35]++;
  var self = this;
  _$jscoverage['/touch/multi-touch.js'].lineData[36]++;
  if (visit59_36_1(!self.isTracking)) {
    _$jscoverage['/touch/multi-touch.js'].lineData[37]++;
    self.isTracking = true;
    _$jscoverage['/touch/multi-touch.js'].lineData[38]++;
    self.isStarted = false;
  }
}, 
  fireEnd: S.noop, 
  getCommonTarget: function(e) {
  _$jscoverage['/touch/multi-touch.js'].functionData[5]++;
  _$jscoverage['/touch/multi-touch.js'].lineData[45]++;
  var touches = e.touches, t1 = touches[0].target, t2 = touches[1].target;
  _$jscoverage['/touch/multi-touch.js'].lineData[48]++;
  if (visit60_48_1(t1 === t2)) {
    _$jscoverage['/touch/multi-touch.js'].lineData[49]++;
    return t1;
  }
  _$jscoverage['/touch/multi-touch.js'].lineData[51]++;
  if (visit61_51_1(Dom.contains(t1, t2))) {
    _$jscoverage['/touch/multi-touch.js'].lineData[52]++;
    return t1;
  }
  _$jscoverage['/touch/multi-touch.js'].lineData[55]++;
  while (1) {
    _$jscoverage['/touch/multi-touch.js'].lineData[56]++;
    if (visit62_56_1(Dom.contains(t2, t1))) {
      _$jscoverage['/touch/multi-touch.js'].lineData[57]++;
      return t2;
    }
    _$jscoverage['/touch/multi-touch.js'].lineData[59]++;
    t2 = t2.parentNode;
  }
  _$jscoverage['/touch/multi-touch.js'].lineData[61]++;
  S.error('getCommonTarget error!');
  _$jscoverage['/touch/multi-touch.js'].lineData[62]++;
  return undefined;
}, 
  end: function(e) {
  _$jscoverage['/touch/multi-touch.js'].functionData[6]++;
  _$jscoverage['/touch/multi-touch.js'].lineData[66]++;
  var self = this;
  _$jscoverage['/touch/multi-touch.js'].lineData[71]++;
  if (visit63_71_1(self.isTracking)) {
    _$jscoverage['/touch/multi-touch.js'].lineData[72]++;
    self.isTracking = false;
    _$jscoverage['/touch/multi-touch.js'].lineData[74]++;
    if (visit64_74_1(self.isStarted)) {
      _$jscoverage['/touch/multi-touch.js'].lineData[75]++;
      self.isStarted = false;
      _$jscoverage['/touch/multi-touch.js'].lineData[76]++;
      self.fireEnd(e);
    }
  }
}};
  _$jscoverage['/touch/multi-touch.js'].lineData[82]++;
  return MultiTouch;
});
