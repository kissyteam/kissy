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
if (! _$jscoverage['/base/observable.js']) {
  _$jscoverage['/base/observable.js'] = {};
  _$jscoverage['/base/observable.js'].lineData = [];
  _$jscoverage['/base/observable.js'].lineData[6] = 0;
  _$jscoverage['/base/observable.js'].lineData[14] = 0;
  _$jscoverage['/base/observable.js'].lineData[15] = 0;
  _$jscoverage['/base/observable.js'].lineData[16] = 0;
  _$jscoverage['/base/observable.js'].lineData[17] = 0;
  _$jscoverage['/base/observable.js'].lineData[18] = 0;
  _$jscoverage['/base/observable.js'].lineData[25] = 0;
  _$jscoverage['/base/observable.js'].lineData[34] = 0;
  _$jscoverage['/base/observable.js'].lineData[41] = 0;
  _$jscoverage['/base/observable.js'].lineData[42] = 0;
  _$jscoverage['/base/observable.js'].lineData[50] = 0;
  _$jscoverage['/base/observable.js'].lineData[54] = 0;
  _$jscoverage['/base/observable.js'].lineData[55] = 0;
  _$jscoverage['/base/observable.js'].lineData[56] = 0;
  _$jscoverage['/base/observable.js'].lineData[57] = 0;
  _$jscoverage['/base/observable.js'].lineData[60] = 0;
  _$jscoverage['/base/observable.js'].lineData[77] = 0;
  _$jscoverage['/base/observable.js'].lineData[79] = 0;
  _$jscoverage['/base/observable.js'].lineData[87] = 0;
  _$jscoverage['/base/observable.js'].lineData[88] = 0;
  _$jscoverage['/base/observable.js'].lineData[92] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
}
if (! _$jscoverage['/base/observable.js'].functionData) {
  _$jscoverage['/base/observable.js'].functionData = [];
  _$jscoverage['/base/observable.js'].functionData[0] = 0;
  _$jscoverage['/base/observable.js'].functionData[1] = 0;
  _$jscoverage['/base/observable.js'].functionData[2] = 0;
  _$jscoverage['/base/observable.js'].functionData[3] = 0;
  _$jscoverage['/base/observable.js'].functionData[4] = 0;
  _$jscoverage['/base/observable.js'].functionData[5] = 0;
  _$jscoverage['/base/observable.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/observable.js'].branchData) {
  _$jscoverage['/base/observable.js'].branchData = {};
  _$jscoverage['/base/observable.js'].branchData['54'] = [];
  _$jscoverage['/base/observable.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['55'] = [];
  _$jscoverage['/base/observable.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['79'] = [];
  _$jscoverage['/base/observable.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['87'] = [];
  _$jscoverage['/base/observable.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['87'][1].init(437, 29, 'observer.equals(observers[i])');
function visit5_87_1(result) {
  _$jscoverage['/base/observable.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['79'][1].init(92, 6, 'i >= 0');
function visit4_79_1(result) {
  _$jscoverage['/base/observable.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['55'][1].init(21, 25, 'observers[i] === observer');
function visit3_55_1(result) {
  _$jscoverage['/base/observable.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['54'][1].init(157, 7, 'i < len');
function visit2_54_1(result) {
  _$jscoverage['/base/observable.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[14]++;
  function Observable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[15]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[16]++;
    self.currentTarget = null;
    _$jscoverage['/base/observable.js'].lineData[17]++;
    S.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[18]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[25]++;
  Observable.prototype = {
  constructor: Observable, 
  hasObserver: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[34]++;
  return !!this.observers.length;
}, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[41]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[42]++;
  self.observers = [];
}, 
  removeObserver: function(observer) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[50]++;
  var self = this, i, observers = self.observers, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[54]++;
  for (i = 0; visit2_54_1(i < len); i++) {
    _$jscoverage['/base/observable.js'].lineData[55]++;
    if (visit3_55_1(observers[i] === observer)) {
      _$jscoverage['/base/observable.js'].lineData[56]++;
      observers.splice(i, 1);
      _$jscoverage['/base/observable.js'].lineData[57]++;
      break;
    }
  }
  _$jscoverage['/base/observable.js'].lineData[60]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[5]++;
}, 
  findObserver: function(observer) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[77]++;
  var observers = this.observers, i;
  _$jscoverage['/base/observable.js'].lineData[79]++;
  for (i = observers.length - 1; visit4_79_1(i >= 0); --i) {
    _$jscoverage['/base/observable.js'].lineData[87]++;
    if (visit5_87_1(observer.equals(observers[i]))) {
      _$jscoverage['/base/observable.js'].lineData[88]++;
      return i;
    }
  }
  _$jscoverage['/base/observable.js'].lineData[92]++;
  return -1;
}};
  _$jscoverage['/base/observable.js'].lineData[96]++;
  return Observable;
});
