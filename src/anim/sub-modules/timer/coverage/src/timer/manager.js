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
  _$jscoverage['/timer/manager.js'].lineData[18] = 0;
  _$jscoverage['/timer/manager.js'].lineData[19] = 0;
  _$jscoverage['/timer/manager.js'].lineData[20] = 0;
  _$jscoverage['/timer/manager.js'].lineData[21] = 0;
  _$jscoverage['/timer/manager.js'].lineData[22] = 0;
  _$jscoverage['/timer/manager.js'].lineData[23] = 0;
  _$jscoverage['/timer/manager.js'].lineData[24] = 0;
  _$jscoverage['/timer/manager.js'].lineData[28] = 0;
  _$jscoverage['/timer/manager.js'].lineData[29] = 0;
  _$jscoverage['/timer/manager.js'].lineData[31] = 0;
  _$jscoverage['/timer/manager.js'].lineData[32] = 0;
  _$jscoverage['/timer/manager.js'].lineData[36] = 0;
  _$jscoverage['/timer/manager.js'].lineData[42] = 0;
  _$jscoverage['/timer/manager.js'].lineData[44] = 0;
  _$jscoverage['/timer/manager.js'].lineData[45] = 0;
  _$jscoverage['/timer/manager.js'].lineData[47] = 0;
  _$jscoverage['/timer/manager.js'].lineData[48] = 0;
  _$jscoverage['/timer/manager.js'].lineData[52] = 0;
  _$jscoverage['/timer/manager.js'].lineData[56] = 0;
  _$jscoverage['/timer/manager.js'].lineData[58] = 0;
  _$jscoverage['/timer/manager.js'].lineData[59] = 0;
  _$jscoverage['/timer/manager.js'].lineData[60] = 0;
  _$jscoverage['/timer/manager.js'].lineData[65] = 0;
  _$jscoverage['/timer/manager.js'].lineData[69] = 0;
  _$jscoverage['/timer/manager.js'].lineData[73] = 0;
  _$jscoverage['/timer/manager.js'].lineData[74] = 0;
  _$jscoverage['/timer/manager.js'].lineData[75] = 0;
  _$jscoverage['/timer/manager.js'].lineData[76] = 0;
  _$jscoverage['/timer/manager.js'].lineData[77] = 0;
  _$jscoverage['/timer/manager.js'].lineData[79] = 0;
  _$jscoverage['/timer/manager.js'].lineData[86] = 0;
  _$jscoverage['/timer/manager.js'].lineData[88] = 0;
  _$jscoverage['/timer/manager.js'].lineData[89] = 0;
  _$jscoverage['/timer/manager.js'].lineData[90] = 0;
  _$jscoverage['/timer/manager.js'].lineData[95] = 0;
  _$jscoverage['/timer/manager.js'].lineData[99] = 0;
  _$jscoverage['/timer/manager.js'].lineData[101] = 0;
  _$jscoverage['/timer/manager.js'].lineData[104] = 0;
  _$jscoverage['/timer/manager.js'].lineData[105] = 0;
  _$jscoverage['/timer/manager.js'].lineData[106] = 0;
  _$jscoverage['/timer/manager.js'].lineData[108] = 0;
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
  _$jscoverage['/timer/manager.js'].branchData['18'] = [];
  _$jscoverage['/timer/manager.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['22'] = [];
  _$jscoverage['/timer/manager.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['24'] = [];
  _$jscoverage['/timer/manager.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['44'] = [];
  _$jscoverage['/timer/manager.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['59'] = [];
  _$jscoverage['/timer/manager.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['74'] = [];
  _$jscoverage['/timer/manager.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['76'] = [];
  _$jscoverage['/timer/manager.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['88'] = [];
  _$jscoverage['/timer/manager.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/timer/manager.js'].branchData['108'] = [];
  _$jscoverage['/timer/manager.js'].branchData['108'][1] = new BranchData();
}
_$jscoverage['/timer/manager.js'].branchData['108'][1].init(412, 18, 'flag === undefined');
function visit74_108_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['88'][1].init(78, 1, 't');
function visit73_88_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['76'][1].init(25, 16, 'self.runFrames()');
function visit72_76_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['74'][1].init(46, 11, '!self.timer');
function visit71_74_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['59'][1].init(118, 30, 'S.isEmptyObject(self.runnings)');
function visit70_59_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['44'][1].init(80, 17, 'self.runnings[kv]');
function visit69_44_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['24'][1].init(119, 107, 'win[vendors[x] + \'CancelAnimationFrame\'] || win[vendors[x] + \'CancelRequestAnimationFrame\']');
function visit68_24_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['22'][2].init(197, 18, 'x < vendors.length');
function visit67_22_2(result) {
  _$jscoverage['/timer/manager.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['22'][1].init(197, 46, 'x < vendors.length && !requestAnimationFrameFn');
function visit66_22_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].branchData['18'][1].init(435, 1, '0');
function visit65_18_1(result) {
  _$jscoverage['/timer/manager.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/manager.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/timer/manager.js'].functionData[0]++;
  _$jscoverage['/timer/manager.js'].lineData[7]++;
  var stamp = S.stamp, win = S.Env.host, INTERVAL = 15, requestAnimationFrameFn, cancelAnimationFrameFn;
  _$jscoverage['/timer/manager.js'].lineData[18]++;
  if (visit65_18_1(0)) {
    _$jscoverage['/timer/manager.js'].lineData[19]++;
    requestAnimationFrameFn = win.requestAnimationFrame;
    _$jscoverage['/timer/manager.js'].lineData[20]++;
    cancelAnimationFrameFn = win.cancelAnimationFrame;
    _$jscoverage['/timer/manager.js'].lineData[21]++;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    _$jscoverage['/timer/manager.js'].lineData[22]++;
    for (var x = 0; visit66_22_1(visit67_22_2(x < vendors.length) && !requestAnimationFrameFn); ++x) {
      _$jscoverage['/timer/manager.js'].lineData[23]++;
      requestAnimationFrameFn = win[vendors[x] + 'RequestAnimationFrame'];
      _$jscoverage['/timer/manager.js'].lineData[24]++;
      cancelAnimationFrameFn = visit68_24_1(win[vendors[x] + 'CancelAnimationFrame'] || win[vendors[x] + 'CancelRequestAnimationFrame']);
    }
  } else {
    _$jscoverage['/timer/manager.js'].lineData[28]++;
    requestAnimationFrameFn = function(fn) {
  _$jscoverage['/timer/manager.js'].functionData[1]++;
  _$jscoverage['/timer/manager.js'].lineData[29]++;
  return setTimeout(fn, INTERVAL);
};
    _$jscoverage['/timer/manager.js'].lineData[31]++;
    cancelAnimationFrameFn = function(timer) {
  _$jscoverage['/timer/manager.js'].functionData[2]++;
  _$jscoverage['/timer/manager.js'].lineData[32]++;
  clearTimeout(timer);
};
  }
  _$jscoverage['/timer/manager.js'].lineData[36]++;
  return {
  runnings: {}, 
  timer: null, 
  start: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[3]++;
  _$jscoverage['/timer/manager.js'].lineData[42]++;
  var self = this, kv = stamp(anim);
  _$jscoverage['/timer/manager.js'].lineData[44]++;
  if (visit69_44_1(self.runnings[kv])) {
    _$jscoverage['/timer/manager.js'].lineData[45]++;
    return;
  }
  _$jscoverage['/timer/manager.js'].lineData[47]++;
  self.runnings[kv] = anim;
  _$jscoverage['/timer/manager.js'].lineData[48]++;
  self.startTimer();
}, 
  stop: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[4]++;
  _$jscoverage['/timer/manager.js'].lineData[52]++;
  this.notRun(anim);
}, 
  notRun: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[5]++;
  _$jscoverage['/timer/manager.js'].lineData[56]++;
  var self = this, kv = stamp(anim);
  _$jscoverage['/timer/manager.js'].lineData[58]++;
  delete self.runnings[kv];
  _$jscoverage['/timer/manager.js'].lineData[59]++;
  if (visit70_59_1(S.isEmptyObject(self.runnings))) {
    _$jscoverage['/timer/manager.js'].lineData[60]++;
    self.stopTimer();
  }
}, 
  pause: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[6]++;
  _$jscoverage['/timer/manager.js'].lineData[65]++;
  this.notRun(anim);
}, 
  resume: function(anim) {
  _$jscoverage['/timer/manager.js'].functionData[7]++;
  _$jscoverage['/timer/manager.js'].lineData[69]++;
  this.start(anim);
}, 
  startTimer: function() {
  _$jscoverage['/timer/manager.js'].functionData[8]++;
  _$jscoverage['/timer/manager.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/timer/manager.js'].lineData[74]++;
  if (visit71_74_1(!self.timer)) {
    _$jscoverage['/timer/manager.js'].lineData[75]++;
    self.timer = requestAnimationFrameFn(function run() {
  _$jscoverage['/timer/manager.js'].functionData[9]++;
  _$jscoverage['/timer/manager.js'].lineData[76]++;
  if (visit72_76_1(self.runFrames())) {
    _$jscoverage['/timer/manager.js'].lineData[77]++;
    self.stopTimer();
  } else {
    _$jscoverage['/timer/manager.js'].lineData[79]++;
    self.timer = requestAnimationFrameFn(run);
  }
});
  }
}, 
  stopTimer: function() {
  _$jscoverage['/timer/manager.js'].functionData[10]++;
  _$jscoverage['/timer/manager.js'].lineData[86]++;
  var self = this, t = self.timer;
  _$jscoverage['/timer/manager.js'].lineData[88]++;
  if (visit73_88_1(t)) {
    _$jscoverage['/timer/manager.js'].lineData[89]++;
    cancelAnimationFrameFn(t);
    _$jscoverage['/timer/manager.js'].lineData[90]++;
    self.timer = 0;
  }
}, 
  runFrames: function() {
  _$jscoverage['/timer/manager.js'].functionData[11]++;
  _$jscoverage['/timer/manager.js'].lineData[95]++;
  var self = this, r, flag, runnings = self.runnings;
  _$jscoverage['/timer/manager.js'].lineData[99]++;
  for (r in runnings) {
    _$jscoverage['/timer/manager.js'].lineData[101]++;
    runnings[r].frame();
  }
  _$jscoverage['/timer/manager.js'].lineData[104]++;
  for (r in runnings) {
    _$jscoverage['/timer/manager.js'].lineData[105]++;
    flag = 0;
    _$jscoverage['/timer/manager.js'].lineData[106]++;
    break;
  }
  _$jscoverage['/timer/manager.js'].lineData[108]++;
  return visit74_108_1(flag === undefined);
}};
});
