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
if (! _$jscoverage['/anim.js']) {
  _$jscoverage['/anim.js'] = {};
  _$jscoverage['/anim.js'].lineData = [];
  _$jscoverage['/anim.js'].lineData[6] = 0;
  _$jscoverage['/anim.js'].lineData[8] = 0;
  _$jscoverage['/anim.js'].lineData[26] = 0;
  _$jscoverage['/anim.js'].lineData[27] = 0;
  _$jscoverage['/anim.js'].lineData[28] = 0;
  _$jscoverage['/anim.js'].lineData[29] = 0;
  _$jscoverage['/anim.js'].lineData[32] = 0;
  _$jscoverage['/anim.js'].lineData[33] = 0;
  _$jscoverage['/anim.js'].lineData[34] = 0;
  _$jscoverage['/anim.js'].lineData[35] = 0;
  _$jscoverage['/anim.js'].lineData[36] = 0;
  _$jscoverage['/anim.js'].lineData[37] = 0;
  _$jscoverage['/anim.js'].lineData[39] = 0;
  _$jscoverage['/anim.js'].lineData[40] = 0;
  _$jscoverage['/anim.js'].lineData[45] = 0;
  _$jscoverage['/anim.js'].lineData[48] = 0;
  _$jscoverage['/anim.js'].lineData[49] = 0;
  _$jscoverage['/anim.js'].lineData[51] = 0;
  _$jscoverage['/anim.js'].lineData[54] = 0;
  _$jscoverage['/anim.js'].lineData[55] = 0;
  _$jscoverage['/anim.js'].lineData[57] = 0;
  _$jscoverage['/anim.js'].lineData[58] = 0;
  _$jscoverage['/anim.js'].lineData[61] = 0;
  _$jscoverage['/anim.js'].lineData[62] = 0;
  _$jscoverage['/anim.js'].lineData[64] = 0;
  _$jscoverage['/anim.js'].lineData[68] = 0;
  _$jscoverage['/anim.js'].lineData[70] = 0;
  _$jscoverage['/anim.js'].lineData[73] = 0;
  _$jscoverage['/anim.js'].lineData[141] = 0;
  _$jscoverage['/anim.js'].lineData[142] = 0;
  _$jscoverage['/anim.js'].lineData[143] = 0;
  _$jscoverage['/anim.js'].lineData[151] = 0;
  _$jscoverage['/anim.js'].lineData[153] = 0;
  _$jscoverage['/anim.js'].lineData[164] = 0;
  _$jscoverage['/anim.js'].lineData[173] = 0;
  _$jscoverage['/anim.js'].lineData[185] = 0;
  _$jscoverage['/anim.js'].lineData[187] = 0;
  _$jscoverage['/anim.js'].lineData[189] = 0;
  _$jscoverage['/anim.js'].lineData[191] = 0;
  _$jscoverage['/anim.js'].lineData[193] = 0;
}
if (! _$jscoverage['/anim.js'].functionData) {
  _$jscoverage['/anim.js'].functionData = [];
  _$jscoverage['/anim.js'].functionData[0] = 0;
  _$jscoverage['/anim.js'].functionData[1] = 0;
  _$jscoverage['/anim.js'].functionData[2] = 0;
  _$jscoverage['/anim.js'].functionData[3] = 0;
  _$jscoverage['/anim.js'].functionData[4] = 0;
}
if (! _$jscoverage['/anim.js'].branchData) {
  _$jscoverage['/anim.js'].branchData = {};
  _$jscoverage['/anim.js'].branchData['28'] = [];
  _$jscoverage['/anim.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['32'] = [];
  _$jscoverage['/anim.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['36'] = [];
  _$jscoverage['/anim.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['39'] = [];
  _$jscoverage['/anim.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['48'] = [];
  _$jscoverage['/anim.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['54'] = [];
  _$jscoverage['/anim.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['57'] = [];
  _$jscoverage['/anim.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['68'] = [];
  _$jscoverage['/anim.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['145'] = [];
  _$jscoverage['/anim.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['147'] = [];
  _$jscoverage['/anim.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['149'] = [];
  _$jscoverage['/anim.js'].branchData['149'][1] = new BranchData();
}
_$jscoverage['/anim.js'].branchData['149'][1].init(102, 15, 'queue === false');
function visit14_149_1(result) {
  _$jscoverage['/anim.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['147'][2].init(155, 24, 'typeof queue == \'string\'');
function visit13_147_2(result) {
  _$jscoverage['/anim.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['147'][1].init(86, 118, 'typeof queue == \'string\' || queue === false');
function visit12_147_1(result) {
  _$jscoverage['/anim.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['145'][2].init(67, 14, 'queue === null');
function visit11_145_2(result) {
  _$jscoverage['/anim.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['145'][1].init(51, 205, 'queue === null || typeof queue == \'string\' || queue === false');
function visit10_145_1(result) {
  _$jscoverage['/anim.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['68'][1].init(1455, 41, 'config[\'useTransition\'] && TransitionAnim');
function visit9_68_1(result) {
  _$jscoverage['/anim.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['57'][1].init(211, 6, 'easing');
function visit8_57_1(result) {
  _$jscoverage['/anim.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['54'][1].init(110, 8, 'duration');
function visit7_54_1(result) {
  _$jscoverage['/anim.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['48'][1].init(696, 25, 'S.isPlainObject(duration)');
function visit6_48_1(result) {
  _$jscoverage['/anim.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['39'][2].init(204, 16, 'trimProp != prop');
function visit5_39_2(result) {
  _$jscoverage['/anim.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['39'][1].init(191, 29, '!trimProp || trimProp != prop');
function visit4_39_1(result) {
  _$jscoverage['/anim.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['36'][1].init(76, 8, 'trimProp');
function visit3_36_1(result) {
  _$jscoverage['/anim.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['32'][1].init(60, 21, 'typeof to == \'string\'');
function visit2_32_1(result) {
  _$jscoverage['/anim.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['28'][1].init(35, 9, 'node.node');
function visit1_28_1(result) {
  _$jscoverage['/anim.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].lineData[6]++;
KISSY.add('anim', function(S, Dom, AnimBase, TimerAnim, TransitionAnim) {
  _$jscoverage['/anim.js'].functionData[0]++;
  _$jscoverage['/anim.js'].lineData[8]++;
  var Utils = AnimBase.Utils, defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/anim.js'].lineData[26]++;
  function Anim(node, to, duration, easing, complete) {
    _$jscoverage['/anim.js'].functionData[1]++;
    _$jscoverage['/anim.js'].lineData[27]++;
    var config;
    _$jscoverage['/anim.js'].lineData[28]++;
    if (visit1_28_1(node.node)) {
      _$jscoverage['/anim.js'].lineData[29]++;
      config = node;
    } else {
      _$jscoverage['/anim.js'].lineData[32]++;
      if (visit2_32_1(typeof to == 'string')) {
        _$jscoverage['/anim.js'].lineData[33]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/anim.js'].lineData[34]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/anim.js'].functionData[2]++;
  _$jscoverage['/anim.js'].lineData[35]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/anim.js'].lineData[36]++;
  if (visit3_36_1(trimProp)) {
    _$jscoverage['/anim.js'].lineData[37]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/anim.js'].lineData[39]++;
  if (visit4_39_1(!trimProp || visit5_39_2(trimProp != prop))) {
    _$jscoverage['/anim.js'].lineData[40]++;
    delete to[prop];
  }
});
      } else {
        _$jscoverage['/anim.js'].lineData[45]++;
        to = S.clone(to);
      }
      _$jscoverage['/anim.js'].lineData[48]++;
      if (visit6_48_1(S.isPlainObject(duration))) {
        _$jscoverage['/anim.js'].lineData[49]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/anim.js'].lineData[51]++;
        config = {
  complete: complete};
        _$jscoverage['/anim.js'].lineData[54]++;
        if (visit7_54_1(duration)) {
          _$jscoverage['/anim.js'].lineData[55]++;
          config.duration = duration;
        }
        _$jscoverage['/anim.js'].lineData[57]++;
        if (visit8_57_1(easing)) {
          _$jscoverage['/anim.js'].lineData[58]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/anim.js'].lineData[61]++;
      config.node = node;
      _$jscoverage['/anim.js'].lineData[62]++;
      config.to = to;
    }
    _$jscoverage['/anim.js'].lineData[64]++;
    config = S.merge(defaultConfig, config, {
  useTransition: S.config('anim/useTransition')});
    _$jscoverage['/anim.js'].lineData[68]++;
    if (visit9_68_1(config['useTransition'] && TransitionAnim)) {
      _$jscoverage['/anim.js'].lineData[70]++;
      return new TransitionAnim(config);
    } else {
      _$jscoverage['/anim.js'].lineData[73]++;
      return new TimerAnim(config);
    }
  }
  _$jscoverage['/anim.js'].lineData[141]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/anim.js'].functionData[3]++;
  _$jscoverage['/anim.js'].lineData[142]++;
  Anim[action] = function(node, queue) {
  _$jscoverage['/anim.js'].functionData[4]++;
  _$jscoverage['/anim.js'].lineData[143]++;
  if (visit10_145_1(visit11_145_2(queue === null) || visit12_147_1(visit13_147_2(typeof queue == 'string') || visit14_149_1(queue === false)))) {
    _$jscoverage['/anim.js'].lineData[151]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/anim.js'].lineData[153]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/anim.js'].lineData[164]++;
  Anim.isRunning = Utils.isElRunning;
  _$jscoverage['/anim.js'].lineData[173]++;
  Anim.isPaused = Utils.isElPaused;
  _$jscoverage['/anim.js'].lineData[185]++;
  Anim.stop = Utils.stopEl;
  _$jscoverage['/anim.js'].lineData[187]++;
  Anim.Easing = TimerAnim.Easing;
  _$jscoverage['/anim.js'].lineData[189]++;
  S.Anim = Anim;
  _$jscoverage['/anim.js'].lineData[191]++;
  Anim.Q = AnimBase.Q;
  _$jscoverage['/anim.js'].lineData[193]++;
  return Anim;
}, {
  requires: ['dom', 'anim/base', 'anim/timer', KISSY.Features.isTransitionSupported() ? 'anim/transition' : '']});
