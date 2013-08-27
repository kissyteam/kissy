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
if (! _$jscoverage['/timer/manager.js']) {
  _$jscoverage['/timer/manager.js'] = {};
  _$jscoverage['/timer/manager.js'].lineData = [];
  _$jscoverage['/timer/manager.js'].lineData[6] = 0;
  _$jscoverage['/timer/manager.js'].lineData[7] = 0;
  _$jscoverage['/timer/manager.js'].lineData[8] = 0;
  _$jscoverage['/timer/manager.js'].lineData[12] = 0;
  _$jscoverage['/timer/manager.js'].lineData[14] = 0;
  _$jscoverage['/timer/manager.js'].lineData[17] = 0;
  _$jscoverage['/timer/manager.js'].lineData[18] = 0;
  _$jscoverage['/timer/manager.js'].lineData[19] = 0;
  _$jscoverage['/timer/manager.js'].lineData[20] = 0;
  _$jscoverage['/timer/manager.js'].lineData[21] = 0;
  _$jscoverage['/timer/manager.js'].lineData[22] = 0;
  _$jscoverage['/timer/manager.js'].lineData[23] = 0;
  _$jscoverage['/timer/manager.js'].lineData[27] = 0;
  _$jscoverage['/timer/manager.js'].lineData[28] = 0;
  _$jscoverage['/timer/manager.js'].lineData[30] = 0;
  _$jscoverage['/timer/manager.js'].lineData[31] = 0;
  _$jscoverage['/timer/manager.js'].lineData[35] = 0;
  _$jscoverage['/timer/manager.js'].lineData[39] = 0;
  _$jscoverage['/timer/manager.js'].lineData[41] = 0;
  _$jscoverage['/timer/manager.js'].lineData[42] = 0;
  _$jscoverage['/timer/manager.js'].lineData[44] = 0;
  _$jscoverage['/timer/manager.js'].lineData[45] = 0;
  _$jscoverage['/timer/manager.js'].lineData[48] = 0;
  _$jscoverage['/timer/manager.js'].lineData[51] = 0;
  _$jscoverage['/timer/manager.js'].lineData[53] = 0;
  _$jscoverage['/timer/manager.js'].lineData[54] = 0;
  _$jscoverage['/timer/manager.js'].lineData[55] = 0;
  _$jscoverage['/timer/manager.js'].lineData[59] = 0;
  _$jscoverage['/timer/manager.js'].lineData[62] = 0;
  _$jscoverage['/timer/manager.js'].lineData[65] = 0;
  _$jscoverage['/timer/manager.js'].lineData[66] = 0;
  _$jscoverage['/timer/manager.js'].lineData[67] = 0;
  _$jscoverage['/timer/manager.js'].lineData[68] = 0;
  _$jscoverage['/timer/manager.js'].lineData[69] = 0;
  _$jscoverage['/timer/manager.js'].lineData[71] = 0;
  _$jscoverage['/timer/manager.js'].lineData[77] = 0;
  _$jscoverage['/timer/manager.js'].lineData[79] = 0;
  _$jscoverage['/timer/manager.js'].lineData[80] = 0;
  _$jscoverage['/timer/manager.js'].lineData[81] = 0;
  _$jscoverage['/timer/manager.js'].lineData[85] = 0;
  _$jscoverage['/timer/manager.js'].lineData[89] = 0;
  _$jscoverage['/timer/manager.js'].lineData[90] = 0;
  _$jscoverage['/timer/manager.js'].lineData[91] = 0;
  _$jscoverage['/timer/manager.js'].lineData[93] = 0;
}
if (! _$jscoverage['/timer/manager.js'].functionData) {
  _$jscoverage['/timer/manager.js'].functionData = [];
  _$jscoverage['/timer/manager.js'].functionData[0] = 0;
  _$jscoverage['/timer/manager.js'].functionData[1] = 0;
  _$jscoverage['/timer/manager.js'].functionData[2] = 0;
  _$jscoverage['/timer/manager.js'].functionData[3] = 0;
  _$jscoverage['/timer/manager.js'].functionData[4] = 0;
  _$jscoverage['/timer/manager.js'].functionData[5] = 0;
  _$jscoverage['/timer/manager.js'].functionData[6] = 0;
  _$jscoverage['/timer/manager.js'].functionData[7] = 0;
  _$jscoverage['/timer/manager.js'].functionData[8] = 0;
  _$jscoverage['/timer/manager.js'].functionData[9] = 0;
  _$jscoverage['/timer/manager.js'].functionData[10] = 0;
  _$jscoverage['/timer/manager.js'].functionData[11] = 0;
}
if (! _$jscoverage['/timer/manager.js'].branchData) {
  _$jscoverage['/timer/manager.js'].branchData = {};
  _$jscoverage['/timer/manager.js'].branchData['17'] = [];
  _$jscoverage['/timer/manager.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['21'] = [];
  _$jscoverage['/timer/manager.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['23'] = [];
  _$jscoverage['/timer/manager.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['41'] = [];
  _$jscoverage['/timer/manager.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['54'] = [];
  _$jscoverage['/timer/manager.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['66'] = [];
  _$jscoverage['/timer/manager.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['68'] = [];
  _$jscoverage['/timer/manager.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['79'] = [];
  _$jscoverage['/timer/manager.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['93'] = [];
  _$jscoverage['/timer/manager.js'].branchData['93'][1] = new BranchData();
}
_$jscoverage['/timer/manager.js'].branchData['93'][1].init(252, 18, 'flag === undefined');
function visit71_93_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['79'][1].init(81, 1, 't');
function visit70_79_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['68'][1].init(26, 16, 'self.runFrames()');
function visit69_68_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['66'][1].init(48, 11, '!self.timer');
function visit68_66_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['54'][1].init(122, 30, 'S.isEmptyObject(self.runnings)');
function visit67_54_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['41'][1].init(83, 17, 'self.runnings[kv]');
function visit66_41_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['23'][1].init(121, 108, 'win[vendors[x] + \'CancelAnimationFrame\'] || win[vendors[x] + \'CancelRequestAnimationFrame\']');
function visit65_23_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['21'][2].init(207, 18, 'x < vendors.length');
function visit64_21_2(result) {
  _$jscoverage['/timer/manager.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['21'][1].init(207, 46, 'x < vendors.length && !requestAnimationFrameFn');
function visit63_21_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['17'][1].init(445, 1, '0');
function visit62_17_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].lineData[6]++;
KISSY.add('anim/timer/manager', function(S, undefined) {
  _$jscoverage['/timer/manager.js'].functionData[0]++;
  _$jscoverage['/timer/manager.js'].lineData[7]++;
  var stamp = S.stamp;
  _$jscoverage['/timer/manager.js'].lineData[8]++;
  var win = S.Env.host;
  _$jscoverage['/timer/manager.js'].lineData[12]++;
  var INTERVAL = 15;
  _$jscoverage['/timer/manager.js'].lineData[14]++;
  var requestAnimationFrameFn, cancelAnimationFrameFn;
  _$jscoverage['/timer/manager.js'].lineData[17]++;
  if (visit62_17_1(0)) {
    _$jscoverage['/timer/manager.js'].lineData[18]++;
    requestAnimationFrameFn = win['requestAnimationFrame'];
    _$jscoverage['/timer/manager.js'].lineData[19]++;
    cancelAnimationFrameFn = win['cancelAnimationFrame'];
    _$jscoverage['/timer/manager.js'].lineData[20]++;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    _$jscoverage['/timer/manager.js'].lineData[21]++;
    for (var x = 0; visit63_21_1(visit64_21_2(x < vendors.length) && !requestAnimationFrameFn); ++x) {
      _$jscoverage['/timer/manager.js'].lineData[22]++;
      requestAnimationFrameFn = win[vendors[x] + 'RequestAnimationFrame'];
      _$jscoverage['/timer/manager.js'].lineData[23]++;
      cancelAnimationFrameFn = visit65_23_1(win[vendors[x] + 'CancelAnimationFrame'] || win[vendors[x] + 'CancelRequestAnimationFrame']);
    }
  } else {
    _$jscoverage['/timer/manager.js'].lineData[27]++;
    requestAnimationFrameFn = function(fn) {
  _$jscoverage['/timer/manager.js'].functionData[1]++;
  _$jscoverage['/timer/manager.js'].lineData[28]++;
  return setTimeout(fn, INTERVAL);
};
    _$jscoverage['/timer/manager.js'].lineData[30]++;
    cancelAnimationFrameFn = function(timer) {
  _$jscoverage['/timer/manager.js'].functionData[2]++;
  _$jscoverage['/timer/manager.js'].lineData[31]++;
  clearTimeout(timer);
};
  }
  _$jscoverage['/timer/manager.js'].lineData[35]++;
  return {
  runnings: {}, 
  timer: null, 
  start: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[3]++;
  _$jscoverage['/timer/manager.js'].lineData[39]++;
  var self = this, kv = stamp(anim);
  _$jscoverage['/timer/manager.js'].lineData[41]++;
  if (visit66_41_1(self.runnings[kv])) {
    _$jscoverage['/timer/manager.js'].lineData[42]++;
    return;
  }
  _$jscoverage['/timer/manager.js'].lineData[44]++;
  self.runnings[kv] = anim;
  _$jscoverage['/timer/manager.js'].lineData[45]++;
  self.startTimer();
}, 
  stop: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[4]++;
  _$jscoverage['/timer/manager.js'].lineData[48]++;
  this.notRun(anim);
}, 
  notRun: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[5]++;
  _$jscoverage['/timer/manager.js'].lineData[51]++;
  var self = this, kv = stamp(anim);
  _$jscoverage['/timer/manager.js'].lineData[53]++;
  delete self.runnings[kv];
  _$jscoverage['/timer/manager.js'].lineData[54]++;
  if (visit67_54_1(S.isEmptyObject(self.runnings))) {
    _$jscoverage['/timer/manager.js'].lineData[55]++;
    self.stopTimer();
  }
}, 
  pause: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[6]++;
  _$jscoverage['/timer/manager.js'].lineData[59]++;
  this.notRun(anim);
}, 
  resume: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[7]++;
  _$jscoverage['/timer/manager.js'].lineData[62]++;
  this.start(anim);
}, 
  startTimer: function() {
  _$jscoverage['/timer/manager.js'].functionData[8]++;
  _$jscoverage['/timer/manager.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/timer/manager.js'].lineData[66]++;
  if (visit68_66_1(!self.timer)) {
    _$jscoverage['/timer/manager.js'].lineData[67]++;
    self.timer = requestAnimationFrameFn(function run() {
  _$jscoverage['/timer/manager.js'].functionData[9]++;
  _$jscoverage['/timer/manager.js'].lineData[68]++;
  if (visit69_68_1(self.runFrames())) {
    _$jscoverage['/timer/manager.js'].lineData[69]++;
    self.stopTimer();
  } else {
    _$jscoverage['/timer/manager.js'].lineData[71]++;
    self.timer = requestAnimationFrameFn(run);
  }
});
  }
}, 
  stopTimer: function() {
  _$jscoverage['/timer/manager.js'].functionData[10]++;
  _$jscoverage['/timer/manager.js'].lineData[77]++;
  var self = this, t = self.timer;
  _$jscoverage['/timer/manager.js'].lineData[79]++;
  if (visit70_79_1(t)) {
    _$jscoverage['/timer/manager.js'].lineData[80]++;
    cancelAnimationFrameFn(t);
    _$jscoverage['/timer/manager.js'].lineData[81]++;
    self.timer = 0;
  }
}, 
  runFrames: function() {
  _$jscoverage['/timer/manager.js'].functionData[11]++;
  _$jscoverage['/timer/manager.js'].lineData[85]++;
  var self = this, r, flag, runnings = self.runnings;
  _$jscoverage['/timer/manager.js'].lineData[89]++;
  for (r in runnings) {
    _$jscoverage['/timer/manager.js'].lineData[90]++;
    runnings[r].frame();
    _$jscoverage['/timer/manager.js'].lineData[91]++;
    flag = 0;
  }
  _$jscoverage['/timer/manager.js'].lineData[93]++;
  return visit71_93_1(flag === undefined);
}};
});
