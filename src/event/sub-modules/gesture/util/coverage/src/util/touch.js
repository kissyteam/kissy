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
if (! _$jscoverage['/util/touch.js']) {
  _$jscoverage['/util/touch.js'] = {};
  _$jscoverage['/util/touch.js'].lineData = [];
  _$jscoverage['/util/touch.js'].lineData[6] = 0;
  _$jscoverage['/util/touch.js'].lineData[7] = 0;
  _$jscoverage['/util/touch.js'].lineData[10] = 0;
  _$jscoverage['/util/touch.js'].lineData[13] = 0;
  _$jscoverage['/util/touch.js'].lineData[19] = 0;
  _$jscoverage['/util/touch.js'].lineData[23] = 0;
  _$jscoverage['/util/touch.js'].lineData[24] = 0;
  _$jscoverage['/util/touch.js'].lineData[25] = 0;
  _$jscoverage['/util/touch.js'].lineData[26] = 0;
  _$jscoverage['/util/touch.js'].lineData[29] = 0;
  _$jscoverage['/util/touch.js'].lineData[30] = 0;
  _$jscoverage['/util/touch.js'].lineData[31] = 0;
  _$jscoverage['/util/touch.js'].lineData[32] = 0;
  _$jscoverage['/util/touch.js'].lineData[34] = 0;
  _$jscoverage['/util/touch.js'].lineData[36] = 0;
  _$jscoverage['/util/touch.js'].lineData[40] = 0;
  _$jscoverage['/util/touch.js'].lineData[41] = 0;
  _$jscoverage['/util/touch.js'].lineData[42] = 0;
  _$jscoverage['/util/touch.js'].lineData[45] = 0;
  _$jscoverage['/util/touch.js'].lineData[46] = 0;
  _$jscoverage['/util/touch.js'].lineData[50] = 0;
  _$jscoverage['/util/touch.js'].lineData[55] = 0;
  _$jscoverage['/util/touch.js'].lineData[56] = 0;
  _$jscoverage['/util/touch.js'].lineData[57] = 0;
  _$jscoverage['/util/touch.js'].lineData[58] = 0;
  _$jscoverage['/util/touch.js'].lineData[59] = 0;
  _$jscoverage['/util/touch.js'].lineData[71] = 0;
}
if (! _$jscoverage['/util/touch.js'].functionData) {
  _$jscoverage['/util/touch.js'].functionData = [];
  _$jscoverage['/util/touch.js'].functionData[0] = 0;
  _$jscoverage['/util/touch.js'].functionData[1] = 0;
  _$jscoverage['/util/touch.js'].functionData[2] = 0;
  _$jscoverage['/util/touch.js'].functionData[3] = 0;
  _$jscoverage['/util/touch.js'].functionData[4] = 0;
  _$jscoverage['/util/touch.js'].functionData[5] = 0;
}
if (! _$jscoverage['/util/touch.js'].branchData) {
  _$jscoverage['/util/touch.js'].branchData = {};
  _$jscoverage['/util/touch.js'].branchData['23'] = [];
  _$jscoverage['/util/touch.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/util/touch.js'].branchData['24'] = [];
  _$jscoverage['/util/touch.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/util/touch.js'].branchData['32'] = [];
  _$jscoverage['/util/touch.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/util/touch.js'].branchData['41'] = [];
  _$jscoverage['/util/touch.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/util/touch.js'].branchData['55'] = [];
  _$jscoverage['/util/touch.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/util/touch.js'].branchData['57'] = [];
  _$jscoverage['/util/touch.js'].branchData['57'][1] = new BranchData();
}
_$jscoverage['/util/touch.js'].branchData['57'][1].init(64, 14, 'self.isStarted');
function visit74_57_1(result) {
  _$jscoverage['/util/touch.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/touch.js'].branchData['55'][1].init(258, 15, 'self.isTracking');
function visit73_55_1(result) {
  _$jscoverage['/util/touch.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/touch.js'].branchData['41'][1].init(48, 16, '!self.isTracking');
function visit72_41_1(result) {
  _$jscoverage['/util/touch.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/touch.js'].branchData['32'][1].init(589, 35, 'touchesCount > requiredTouchesCount');
function visit71_32_1(result) {
  _$jscoverage['/util/touch.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/touch.js'].branchData['24'][1].init(22, 16, '!self.isTracking');
function visit70_24_1(result) {
  _$jscoverage['/util/touch.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/touch.js'].branchData['23'][1].init(199, 37, 'touchesCount === requiredTouchesCount');
function visit69_23_1(result) {
  _$jscoverage['/util/touch.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/touch.js'].lineData[6]++;
KISSY.add(function() {
  _$jscoverage['/util/touch.js'].functionData[0]++;
  _$jscoverage['/util/touch.js'].lineData[7]++;
  var noop = function() {
  _$jscoverage['/util/touch.js'].functionData[1]++;
};
  _$jscoverage['/util/touch.js'].lineData[10]++;
  function Touch() {
    _$jscoverage['/util/touch.js'].functionData[2]++;
  }
  _$jscoverage['/util/touch.js'].lineData[13]++;
  Touch.prototype = {
  constructor: Touch, 
  requiredTouchCount: 0, 
  onTouchStart: function(e) {
  _$jscoverage['/util/touch.js'].functionData[3]++;
  _$jscoverage['/util/touch.js'].lineData[19]++;
  var self = this, requiredTouchesCount = self.requiredTouchCount, touches = e.touches, touchesCount = touches.length;
  _$jscoverage['/util/touch.js'].lineData[23]++;
  if (visit69_23_1(touchesCount === requiredTouchesCount)) {
    _$jscoverage['/util/touch.js'].lineData[24]++;
    if (visit70_24_1(!self.isTracking)) {
      _$jscoverage['/util/touch.js'].lineData[25]++;
      self.isTracking = true;
      _$jscoverage['/util/touch.js'].lineData[26]++;
      self.isStarted = false;
    }
    _$jscoverage['/util/touch.js'].lineData[29]++;
    self.lastTouches = e.touches;
    _$jscoverage['/util/touch.js'].lineData[30]++;
    self.startTime = e.timeStamp;
    _$jscoverage['/util/touch.js'].lineData[31]++;
    return self.start(e);
  } else {
    _$jscoverage['/util/touch.js'].lineData[32]++;
    if (visit71_32_1(touchesCount > requiredTouchesCount)) {
      _$jscoverage['/util/touch.js'].lineData[34]++;
      self.onTouchEnd(e, true);
    }
  }
  _$jscoverage['/util/touch.js'].lineData[36]++;
  return undefined;
}, 
  onTouchMove: function(e) {
  _$jscoverage['/util/touch.js'].functionData[4]++;
  _$jscoverage['/util/touch.js'].lineData[40]++;
  var self = this;
  _$jscoverage['/util/touch.js'].lineData[41]++;
  if (visit72_41_1(!self.isTracking)) {
    _$jscoverage['/util/touch.js'].lineData[42]++;
    return undefined;
  }
  _$jscoverage['/util/touch.js'].lineData[45]++;
  self.lastTouches = e.touches;
  _$jscoverage['/util/touch.js'].lineData[46]++;
  return self.move(e);
}, 
  onTouchEnd: function(e, moreTouches) {
  _$jscoverage['/util/touch.js'].functionData[5]++;
  _$jscoverage['/util/touch.js'].lineData[50]++;
  var self = this;
  _$jscoverage['/util/touch.js'].lineData[55]++;
  if (visit73_55_1(self.isTracking)) {
    _$jscoverage['/util/touch.js'].lineData[56]++;
    self.isTracking = false;
    _$jscoverage['/util/touch.js'].lineData[57]++;
    if (visit74_57_1(self.isStarted)) {
      _$jscoverage['/util/touch.js'].lineData[58]++;
      self.isStarted = false;
      _$jscoverage['/util/touch.js'].lineData[59]++;
      self.end(e, moreTouches);
    }
  }
}, 
  start: noop, 
  move: noop, 
  end: noop};
  _$jscoverage['/util/touch.js'].lineData[71]++;
  return Touch;
});
