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
if (! _$jscoverage['/node/anim.js']) {
  _$jscoverage['/node/anim.js'] = {};
  _$jscoverage['/node/anim.js'].lineData = [];
  _$jscoverage['/node/anim.js'].lineData[9] = 0;
  _$jscoverage['/node/anim.js'].lineData[10] = 0;
  _$jscoverage['/node/anim.js'].lineData[19] = 0;
  _$jscoverage['/node/anim.js'].lineData[20] = 0;
  _$jscoverage['/node/anim.js'].lineData[22] = 0;
  _$jscoverage['/node/anim.js'].lineData[23] = 0;
  _$jscoverage['/node/anim.js'].lineData[25] = 0;
  _$jscoverage['/node/anim.js'].lineData[26] = 0;
  _$jscoverage['/node/anim.js'].lineData[28] = 0;
  _$jscoverage['/node/anim.js'].lineData[31] = 0;
  _$jscoverage['/node/anim.js'].lineData[39] = 0;
  _$jscoverage['/node/anim.js'].lineData[41] = 0;
  _$jscoverage['/node/anim.js'].lineData[42] = 0;
  _$jscoverage['/node/anim.js'].lineData[44] = 0;
  _$jscoverage['/node/anim.js'].lineData[45] = 0;
  _$jscoverage['/node/anim.js'].lineData[46] = 0;
  _$jscoverage['/node/anim.js'].lineData[48] = 0;
  _$jscoverage['/node/anim.js'].lineData[51] = 0;
  _$jscoverage['/node/anim.js'].lineData[62] = 0;
  _$jscoverage['/node/anim.js'].lineData[63] = 0;
  _$jscoverage['/node/anim.js'].lineData[64] = 0;
  _$jscoverage['/node/anim.js'].lineData[66] = 0;
  _$jscoverage['/node/anim.js'].lineData[76] = 0;
  _$jscoverage['/node/anim.js'].lineData[77] = 0;
  _$jscoverage['/node/anim.js'].lineData[78] = 0;
  _$jscoverage['/node/anim.js'].lineData[80] = 0;
  _$jscoverage['/node/anim.js'].lineData[90] = 0;
  _$jscoverage['/node/anim.js'].lineData[91] = 0;
  _$jscoverage['/node/anim.js'].lineData[92] = 0;
  _$jscoverage['/node/anim.js'].lineData[94] = 0;
  _$jscoverage['/node/anim.js'].lineData[102] = 0;
  _$jscoverage['/node/anim.js'].lineData[103] = 0;
  _$jscoverage['/node/anim.js'].lineData[104] = 0;
  _$jscoverage['/node/anim.js'].lineData[105] = 0;
  _$jscoverage['/node/anim.js'].lineData[108] = 0;
  _$jscoverage['/node/anim.js'].lineData[116] = 0;
  _$jscoverage['/node/anim.js'].lineData[117] = 0;
  _$jscoverage['/node/anim.js'].lineData[118] = 0;
  _$jscoverage['/node/anim.js'].lineData[119] = 0;
  _$jscoverage['/node/anim.js'].lineData[122] = 0;
  _$jscoverage['/node/anim.js'].lineData[216] = 0;
  _$jscoverage['/node/anim.js'].lineData[228] = 0;
  _$jscoverage['/node/anim.js'].lineData[229] = 0;
  _$jscoverage['/node/anim.js'].lineData[231] = 0;
  _$jscoverage['/node/anim.js'].lineData[232] = 0;
  _$jscoverage['/node/anim.js'].lineData[234] = 0;
  _$jscoverage['/node/anim.js'].lineData[235] = 0;
  _$jscoverage['/node/anim.js'].lineData[238] = 0;
}
if (! _$jscoverage['/node/anim.js'].functionData) {
  _$jscoverage['/node/anim.js'].functionData = [];
  _$jscoverage['/node/anim.js'].functionData[0] = 0;
  _$jscoverage['/node/anim.js'].functionData[1] = 0;
  _$jscoverage['/node/anim.js'].functionData[2] = 0;
  _$jscoverage['/node/anim.js'].functionData[3] = 0;
  _$jscoverage['/node/anim.js'].functionData[4] = 0;
  _$jscoverage['/node/anim.js'].functionData[5] = 0;
  _$jscoverage['/node/anim.js'].functionData[6] = 0;
  _$jscoverage['/node/anim.js'].functionData[7] = 0;
  _$jscoverage['/node/anim.js'].functionData[8] = 0;
  _$jscoverage['/node/anim.js'].functionData[9] = 0;
  _$jscoverage['/node/anim.js'].functionData[10] = 0;
  _$jscoverage['/node/anim.js'].functionData[11] = 0;
  _$jscoverage['/node/anim.js'].functionData[12] = 0;
  _$jscoverage['/node/anim.js'].functionData[13] = 0;
  _$jscoverage['/node/anim.js'].functionData[14] = 0;
}
if (! _$jscoverage['/node/anim.js'].branchData) {
  _$jscoverage['/node/anim.js'].branchData = {};
  _$jscoverage['/node/anim.js'].branchData['22'] = [];
  _$jscoverage['/node/anim.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['25'] = [];
  _$jscoverage['/node/anim.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['44'] = [];
  _$jscoverage['/node/anim.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['103'] = [];
  _$jscoverage['/node/anim.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['104'] = [];
  _$jscoverage['/node/anim.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['117'] = [];
  _$jscoverage['/node/anim.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['118'] = [];
  _$jscoverage['/node/anim.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['231'] = [];
  _$jscoverage['/node/anim.js'].branchData['231'][1] = new BranchData();
}
_$jscoverage['/node/anim.js'].branchData['231'][1].init(96, 19, 'Dom[k] && !duration');
function visit9_231_1(result) {
  _$jscoverage['/node/anim.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['118'][1].init(22, 22, 'Anim.isPaused(self[i])');
function visit8_118_1(result) {
  _$jscoverage['/node/anim.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['117'][1].init(60, 15, 'i < self.length');
function visit7_117_1(result) {
  _$jscoverage['/node/anim.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['104'][1].init(22, 23, 'Anim.isRunning(self[i])');
function visit6_104_1(result) {
  _$jscoverage['/node/anim.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['103'][1].init(60, 15, 'i < self.length');
function visit5_103_1(result) {
  _$jscoverage['/node/anim.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['44'][1].init(108, 7, 'arg0.to');
function visit4_44_1(result) {
  _$jscoverage['/node/anim.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['25'][1].init(169, 14, 'i < ret.length');
function visit3_25_1(result) {
  _$jscoverage['/node/anim.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['22'][2].init(80, 7, 'i < num');
function visit2_22_2(result) {
  _$jscoverage['/node/anim.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['22'][1].init(69, 9, 'from || 0');
function visit1_22_1(result) {
  _$jscoverage['/node/anim.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].lineData[9]++;
KISSY.add('node/anim', function(S, Dom, Anim, Node, undefined) {
  _$jscoverage['/node/anim.js'].functionData[0]++;
  _$jscoverage['/node/anim.js'].lineData[10]++;
  var FX = [['height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'], ['width', 'margin-left', 'margin-right', 'padding-left', 'padding-right'], ['opacity']];
  _$jscoverage['/node/anim.js'].lineData[19]++;
  function getFxs(type, num, from) {
    _$jscoverage['/node/anim.js'].functionData[1]++;
    _$jscoverage['/node/anim.js'].lineData[20]++;
    var ret = [], obj = {};
    _$jscoverage['/node/anim.js'].lineData[22]++;
    for (var i = visit1_22_1(from || 0); visit2_22_2(i < num); i++) {
      _$jscoverage['/node/anim.js'].lineData[23]++;
      ret.push.apply(ret, FX[i]);
    }
    _$jscoverage['/node/anim.js'].lineData[25]++;
    for (i = 0; visit3_25_1(i < ret.length); i++) {
      _$jscoverage['/node/anim.js'].lineData[26]++;
      obj[ret[i]] = type;
    }
    _$jscoverage['/node/anim.js'].lineData[28]++;
    return obj;
  }
  _$jscoverage['/node/anim.js'].lineData[31]++;
  S.augment(Node, {
  animate: function(var_args) {
  _$jscoverage['/node/anim.js'].functionData[2]++;
  _$jscoverage['/node/anim.js'].lineData[39]++;
  var self = this, originArgs = S.makeArray(arguments);
  _$jscoverage['/node/anim.js'].lineData[41]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[3]++;
  _$jscoverage['/node/anim.js'].lineData[42]++;
  var args = S.clone(originArgs), arg0 = args[0];
  _$jscoverage['/node/anim.js'].lineData[44]++;
  if (visit4_44_1(arg0.to)) {
    _$jscoverage['/node/anim.js'].lineData[45]++;
    arg0.node = elem;
    _$jscoverage['/node/anim.js'].lineData[46]++;
    Anim(arg0).run();
  } else {
    _$jscoverage['/node/anim.js'].lineData[48]++;
    Anim.apply(undefined, [elem].concat(args)).run();
  }
});
  _$jscoverage['/node/anim.js'].lineData[51]++;
  return self;
}, 
  stop: function(end, clearQueue, queue) {
  _$jscoverage['/node/anim.js'].functionData[4]++;
  _$jscoverage['/node/anim.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[63]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[5]++;
  _$jscoverage['/node/anim.js'].lineData[64]++;
  Anim.stop(elem, end, clearQueue, queue);
});
  _$jscoverage['/node/anim.js'].lineData[66]++;
  return self;
}, 
  pause: function(end, queue) {
  _$jscoverage['/node/anim.js'].functionData[6]++;
  _$jscoverage['/node/anim.js'].lineData[76]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[77]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[7]++;
  _$jscoverage['/node/anim.js'].lineData[78]++;
  Anim.pause(elem, queue);
});
  _$jscoverage['/node/anim.js'].lineData[80]++;
  return self;
}, 
  resume: function(end, queue) {
  _$jscoverage['/node/anim.js'].functionData[8]++;
  _$jscoverage['/node/anim.js'].lineData[90]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[91]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[9]++;
  _$jscoverage['/node/anim.js'].lineData[92]++;
  Anim.resume(elem, queue);
});
  _$jscoverage['/node/anim.js'].lineData[94]++;
  return self;
}, 
  isRunning: function() {
  _$jscoverage['/node/anim.js'].functionData[10]++;
  _$jscoverage['/node/anim.js'].lineData[102]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[103]++;
  for (var i = 0; visit5_103_1(i < self.length); i++) {
    _$jscoverage['/node/anim.js'].lineData[104]++;
    if (visit6_104_1(Anim.isRunning(self[i]))) {
      _$jscoverage['/node/anim.js'].lineData[105]++;
      return true;
    }
  }
  _$jscoverage['/node/anim.js'].lineData[108]++;
  return false;
}, 
  isPaused: function() {
  _$jscoverage['/node/anim.js'].functionData[11]++;
  _$jscoverage['/node/anim.js'].lineData[116]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[117]++;
  for (var i = 0; visit7_117_1(i < self.length); i++) {
    _$jscoverage['/node/anim.js'].lineData[118]++;
    if (visit8_118_1(Anim.isPaused(self[i]))) {
      _$jscoverage['/node/anim.js'].lineData[119]++;
      return true;
    }
  }
  _$jscoverage['/node/anim.js'].lineData[122]++;
  return false;
}});
  _$jscoverage['/node/anim.js'].lineData[216]++;
  S.each({
  show: getFxs('show', 3), 
  hide: getFxs('hide', 3), 
  toggle: getFxs('toggle', 3), 
  fadeIn: getFxs('show', 3, 2), 
  fadeOut: getFxs('hide', 3, 2), 
  fadeToggle: getFxs('toggle', 3, 2), 
  slideDown: getFxs('show', 1), 
  slideUp: getFxs('hide', 1), 
  slideToggle: getFxs('toggle', 1)}, function(v, k) {
  _$jscoverage['/node/anim.js'].functionData[12]++;
  _$jscoverage['/node/anim.js'].lineData[228]++;
  Node.prototype[k] = function(duration, complete, easing) {
  _$jscoverage['/node/anim.js'].functionData[13]++;
  _$jscoverage['/node/anim.js'].lineData[229]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[231]++;
  if (visit9_231_1(Dom[k] && !duration)) {
    _$jscoverage['/node/anim.js'].lineData[232]++;
    Dom[k](self);
  } else {
    _$jscoverage['/node/anim.js'].lineData[234]++;
    S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[14]++;
  _$jscoverage['/node/anim.js'].lineData[235]++;
  Anim(elem, v, duration, easing, complete).run();
});
  }
  _$jscoverage['/node/anim.js'].lineData[238]++;
  return self;
};
});
}, {
  requires: ['dom', 'anim', './base']});
