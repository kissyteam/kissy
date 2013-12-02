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
  _$jscoverage['/node/anim.js'].lineData[11] = 0;
  _$jscoverage['/node/anim.js'].lineData[12] = 0;
  _$jscoverage['/node/anim.js'].lineData[14] = 0;
  _$jscoverage['/node/anim.js'].lineData[23] = 0;
  _$jscoverage['/node/anim.js'].lineData[24] = 0;
  _$jscoverage['/node/anim.js'].lineData[26] = 0;
  _$jscoverage['/node/anim.js'].lineData[27] = 0;
  _$jscoverage['/node/anim.js'].lineData[29] = 0;
  _$jscoverage['/node/anim.js'].lineData[30] = 0;
  _$jscoverage['/node/anim.js'].lineData[32] = 0;
  _$jscoverage['/node/anim.js'].lineData[35] = 0;
  _$jscoverage['/node/anim.js'].lineData[42] = 0;
  _$jscoverage['/node/anim.js'].lineData[44] = 0;
  _$jscoverage['/node/anim.js'].lineData[45] = 0;
  _$jscoverage['/node/anim.js'].lineData[47] = 0;
  _$jscoverage['/node/anim.js'].lineData[48] = 0;
  _$jscoverage['/node/anim.js'].lineData[49] = 0;
  _$jscoverage['/node/anim.js'].lineData[51] = 0;
  _$jscoverage['/node/anim.js'].lineData[54] = 0;
  _$jscoverage['/node/anim.js'].lineData[65] = 0;
  _$jscoverage['/node/anim.js'].lineData[66] = 0;
  _$jscoverage['/node/anim.js'].lineData[67] = 0;
  _$jscoverage['/node/anim.js'].lineData[69] = 0;
  _$jscoverage['/node/anim.js'].lineData[79] = 0;
  _$jscoverage['/node/anim.js'].lineData[80] = 0;
  _$jscoverage['/node/anim.js'].lineData[81] = 0;
  _$jscoverage['/node/anim.js'].lineData[83] = 0;
  _$jscoverage['/node/anim.js'].lineData[93] = 0;
  _$jscoverage['/node/anim.js'].lineData[94] = 0;
  _$jscoverage['/node/anim.js'].lineData[95] = 0;
  _$jscoverage['/node/anim.js'].lineData[97] = 0;
  _$jscoverage['/node/anim.js'].lineData[105] = 0;
  _$jscoverage['/node/anim.js'].lineData[106] = 0;
  _$jscoverage['/node/anim.js'].lineData[107] = 0;
  _$jscoverage['/node/anim.js'].lineData[108] = 0;
  _$jscoverage['/node/anim.js'].lineData[111] = 0;
  _$jscoverage['/node/anim.js'].lineData[119] = 0;
  _$jscoverage['/node/anim.js'].lineData[120] = 0;
  _$jscoverage['/node/anim.js'].lineData[121] = 0;
  _$jscoverage['/node/anim.js'].lineData[122] = 0;
  _$jscoverage['/node/anim.js'].lineData[125] = 0;
  _$jscoverage['/node/anim.js'].lineData[229] = 0;
  _$jscoverage['/node/anim.js'].lineData[241] = 0;
  _$jscoverage['/node/anim.js'].lineData[242] = 0;
  _$jscoverage['/node/anim.js'].lineData[244] = 0;
  _$jscoverage['/node/anim.js'].lineData[245] = 0;
  _$jscoverage['/node/anim.js'].lineData[247] = 0;
  _$jscoverage['/node/anim.js'].lineData[248] = 0;
  _$jscoverage['/node/anim.js'].lineData[251] = 0;
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
  _$jscoverage['/node/anim.js'].branchData['26'] = [];
  _$jscoverage['/node/anim.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['29'] = [];
  _$jscoverage['/node/anim.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['47'] = [];
  _$jscoverage['/node/anim.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['106'] = [];
  _$jscoverage['/node/anim.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['107'] = [];
  _$jscoverage['/node/anim.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['120'] = [];
  _$jscoverage['/node/anim.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['121'] = [];
  _$jscoverage['/node/anim.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['244'] = [];
  _$jscoverage['/node/anim.js'].branchData['244'][1] = new BranchData();
}
_$jscoverage['/node/anim.js'].branchData['244'][1].init(93, 19, 'Dom[k] && !duration');
function visit9_244_1(result) {
  _$jscoverage['/node/anim.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['121'][1].init(21, 22, 'Anim.isPaused(self[i])');
function visit8_121_1(result) {
  _$jscoverage['/node/anim.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['120'][1].init(58, 15, 'i < self.length');
function visit7_120_1(result) {
  _$jscoverage['/node/anim.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['107'][1].init(21, 23, 'Anim.isRunning(self[i])');
function visit6_107_1(result) {
  _$jscoverage['/node/anim.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['106'][1].init(58, 15, 'i < self.length');
function visit5_106_1(result) {
  _$jscoverage['/node/anim.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['47'][1].init(105, 7, 'arg0.to');
function visit4_47_1(result) {
  _$jscoverage['/node/anim.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['29'][1].init(163, 14, 'i < ret.length');
function visit3_29_1(result) {
  _$jscoverage['/node/anim.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['26'][2].init(77, 7, 'i < num');
function visit2_26_2(result) {
  _$jscoverage['/node/anim.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['26'][1].init(66, 9, 'from || 0');
function visit1_26_1(result) {
  _$jscoverage['/node/anim.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].lineData[9]++;
KISSY.add(function(S, require) {
  _$jscoverage['/node/anim.js'].functionData[0]++;
  _$jscoverage['/node/anim.js'].lineData[10]++;
  var Node = require('./base');
  _$jscoverage['/node/anim.js'].lineData[11]++;
  var Dom = require('dom');
  _$jscoverage['/node/anim.js'].lineData[12]++;
  var Anim = require('anim');
  _$jscoverage['/node/anim.js'].lineData[14]++;
  var FX = [['height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'], ['width', 'margin-left', 'margin-right', 'padding-left', 'padding-right'], ['opacity']];
  _$jscoverage['/node/anim.js'].lineData[23]++;
  function getFxs(type, num, from) {
    _$jscoverage['/node/anim.js'].functionData[1]++;
    _$jscoverage['/node/anim.js'].lineData[24]++;
    var ret = [], obj = {};
    _$jscoverage['/node/anim.js'].lineData[26]++;
    for (var i = visit1_26_1(from || 0); visit2_26_2(i < num); i++) {
      _$jscoverage['/node/anim.js'].lineData[27]++;
      ret.push.apply(ret, FX[i]);
    }
    _$jscoverage['/node/anim.js'].lineData[29]++;
    for (i = 0; visit3_29_1(i < ret.length); i++) {
      _$jscoverage['/node/anim.js'].lineData[30]++;
      obj[ret[i]] = type;
    }
    _$jscoverage['/node/anim.js'].lineData[32]++;
    return obj;
  }
  _$jscoverage['/node/anim.js'].lineData[35]++;
  S.augment(Node, {
  animate: function() {
  _$jscoverage['/node/anim.js'].functionData[2]++;
  _$jscoverage['/node/anim.js'].lineData[42]++;
  var self = this, originArgs = S.makeArray(arguments);
  _$jscoverage['/node/anim.js'].lineData[44]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[3]++;
  _$jscoverage['/node/anim.js'].lineData[45]++;
  var args = S.clone(originArgs), arg0 = args[0];
  _$jscoverage['/node/anim.js'].lineData[47]++;
  if (visit4_47_1(arg0.to)) {
    _$jscoverage['/node/anim.js'].lineData[48]++;
    arg0.node = elem;
    _$jscoverage['/node/anim.js'].lineData[49]++;
    new Anim(arg0).run();
  } else {
    _$jscoverage['/node/anim.js'].lineData[51]++;
    Anim.apply(undefined, [elem].concat(args)).run();
  }
});
  _$jscoverage['/node/anim.js'].lineData[54]++;
  return self;
}, 
  stop: function(end, clearQueue, queue) {
  _$jscoverage['/node/anim.js'].functionData[4]++;
  _$jscoverage['/node/anim.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[66]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[5]++;
  _$jscoverage['/node/anim.js'].lineData[67]++;
  Anim.stop(elem, end, clearQueue, queue);
});
  _$jscoverage['/node/anim.js'].lineData[69]++;
  return self;
}, 
  pause: function(end, queue) {
  _$jscoverage['/node/anim.js'].functionData[6]++;
  _$jscoverage['/node/anim.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[80]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[7]++;
  _$jscoverage['/node/anim.js'].lineData[81]++;
  Anim.pause(elem, queue);
});
  _$jscoverage['/node/anim.js'].lineData[83]++;
  return self;
}, 
  resume: function(end, queue) {
  _$jscoverage['/node/anim.js'].functionData[8]++;
  _$jscoverage['/node/anim.js'].lineData[93]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[94]++;
  S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[9]++;
  _$jscoverage['/node/anim.js'].lineData[95]++;
  Anim.resume(elem, queue);
});
  _$jscoverage['/node/anim.js'].lineData[97]++;
  return self;
}, 
  isRunning: function() {
  _$jscoverage['/node/anim.js'].functionData[10]++;
  _$jscoverage['/node/anim.js'].lineData[105]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[106]++;
  for (var i = 0; visit5_106_1(i < self.length); i++) {
    _$jscoverage['/node/anim.js'].lineData[107]++;
    if (visit6_107_1(Anim.isRunning(self[i]))) {
      _$jscoverage['/node/anim.js'].lineData[108]++;
      return true;
    }
  }
  _$jscoverage['/node/anim.js'].lineData[111]++;
  return false;
}, 
  isPaused: function() {
  _$jscoverage['/node/anim.js'].functionData[11]++;
  _$jscoverage['/node/anim.js'].lineData[119]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[120]++;
  for (var i = 0; visit7_120_1(i < self.length); i++) {
    _$jscoverage['/node/anim.js'].lineData[121]++;
    if (visit8_121_1(Anim.isPaused(self[i]))) {
      _$jscoverage['/node/anim.js'].lineData[122]++;
      return true;
    }
  }
  _$jscoverage['/node/anim.js'].lineData[125]++;
  return false;
}});
  _$jscoverage['/node/anim.js'].lineData[229]++;
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
  _$jscoverage['/node/anim.js'].lineData[241]++;
  Node.prototype[k] = function(duration, complete, easing) {
  _$jscoverage['/node/anim.js'].functionData[13]++;
  _$jscoverage['/node/anim.js'].lineData[242]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[244]++;
  if (visit9_244_1(Dom[k] && !duration)) {
    _$jscoverage['/node/anim.js'].lineData[245]++;
    Dom[k](self);
  } else {
    _$jscoverage['/node/anim.js'].lineData[247]++;
    S.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[14]++;
  _$jscoverage['/node/anim.js'].lineData[248]++;
  new Anim(elem, v, duration, easing, complete).run();
});
  }
  _$jscoverage['/node/anim.js'].lineData[251]++;
  return self;
};
});
});
