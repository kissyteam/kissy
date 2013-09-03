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
  _$jscoverage['/anim.js'].lineData[7] = 0;
  _$jscoverage['/anim.js'].lineData[25] = 0;
  _$jscoverage['/anim.js'].lineData[26] = 0;
  _$jscoverage['/anim.js'].lineData[27] = 0;
  _$jscoverage['/anim.js'].lineData[28] = 0;
  _$jscoverage['/anim.js'].lineData[31] = 0;
  _$jscoverage['/anim.js'].lineData[32] = 0;
  _$jscoverage['/anim.js'].lineData[33] = 0;
  _$jscoverage['/anim.js'].lineData[34] = 0;
  _$jscoverage['/anim.js'].lineData[35] = 0;
  _$jscoverage['/anim.js'].lineData[36] = 0;
  _$jscoverage['/anim.js'].lineData[38] = 0;
  _$jscoverage['/anim.js'].lineData[39] = 0;
  _$jscoverage['/anim.js'].lineData[44] = 0;
  _$jscoverage['/anim.js'].lineData[47] = 0;
  _$jscoverage['/anim.js'].lineData[48] = 0;
  _$jscoverage['/anim.js'].lineData[50] = 0;
  _$jscoverage['/anim.js'].lineData[53] = 0;
  _$jscoverage['/anim.js'].lineData[54] = 0;
  _$jscoverage['/anim.js'].lineData[56] = 0;
  _$jscoverage['/anim.js'].lineData[57] = 0;
  _$jscoverage['/anim.js'].lineData[60] = 0;
  _$jscoverage['/anim.js'].lineData[61] = 0;
  _$jscoverage['/anim.js'].lineData[63] = 0;
  _$jscoverage['/anim.js'].lineData[67] = 0;
  _$jscoverage['/anim.js'].lineData[69] = 0;
  _$jscoverage['/anim.js'].lineData[72] = 0;
  _$jscoverage['/anim.js'].lineData[140] = 0;
  _$jscoverage['/anim.js'].lineData[141] = 0;
  _$jscoverage['/anim.js'].lineData[142] = 0;
  _$jscoverage['/anim.js'].lineData[150] = 0;
  _$jscoverage['/anim.js'].lineData[152] = 0;
  _$jscoverage['/anim.js'].lineData[163] = 0;
  _$jscoverage['/anim.js'].lineData[172] = 0;
  _$jscoverage['/anim.js'].lineData[184] = 0;
  _$jscoverage['/anim.js'].lineData[186] = 0;
  _$jscoverage['/anim.js'].lineData[188] = 0;
  _$jscoverage['/anim.js'].lineData[190] = 0;
  _$jscoverage['/anim.js'].lineData[192] = 0;
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
  _$jscoverage['/anim.js'].branchData['27'] = [];
  _$jscoverage['/anim.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['31'] = [];
  _$jscoverage['/anim.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['35'] = [];
  _$jscoverage['/anim.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['38'] = [];
  _$jscoverage['/anim.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['47'] = [];
  _$jscoverage['/anim.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['53'] = [];
  _$jscoverage['/anim.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['56'] = [];
  _$jscoverage['/anim.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['67'] = [];
  _$jscoverage['/anim.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['144'] = [];
  _$jscoverage['/anim.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['146'] = [];
  _$jscoverage['/anim.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['148'] = [];
  _$jscoverage['/anim.js'].branchData['148'][1] = new BranchData();
}
_$jscoverage['/anim.js'].branchData['148'][1].init(102, 15, 'queue === false');
function visit14_148_1(result) {
  _$jscoverage['/anim.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['146'][2].init(155, 24, 'typeof queue == \'string\'');
function visit13_146_2(result) {
  _$jscoverage['/anim.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['146'][1].init(86, 118, 'typeof queue == \'string\' || queue === false');
function visit12_146_1(result) {
  _$jscoverage['/anim.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['144'][2].init(67, 14, 'queue === null');
function visit11_144_2(result) {
  _$jscoverage['/anim.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['144'][1].init(51, 205, 'queue === null || typeof queue == \'string\' || queue === false');
function visit10_144_1(result) {
  _$jscoverage['/anim.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['67'][1].init(1455, 41, 'config[\'useTransition\'] && TransitionAnim');
function visit9_67_1(result) {
  _$jscoverage['/anim.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['56'][1].init(211, 6, 'easing');
function visit8_56_1(result) {
  _$jscoverage['/anim.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['53'][1].init(110, 8, 'duration');
function visit7_53_1(result) {
  _$jscoverage['/anim.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['47'][1].init(696, 25, 'S.isPlainObject(duration)');
function visit6_47_1(result) {
  _$jscoverage['/anim.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['38'][2].init(204, 16, 'trimProp != prop');
function visit5_38_2(result) {
  _$jscoverage['/anim.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['38'][1].init(191, 29, '!trimProp || trimProp != prop');
function visit4_38_1(result) {
  _$jscoverage['/anim.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['35'][1].init(76, 8, 'trimProp');
function visit3_35_1(result) {
  _$jscoverage['/anim.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['31'][1].init(60, 21, 'typeof to == \'string\'');
function visit2_31_1(result) {
  _$jscoverage['/anim.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['27'][1].init(35, 9, 'node.node');
function visit1_27_1(result) {
  _$jscoverage['/anim.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].lineData[6]++;
KISSY.add('anim', function(S, Dom, AnimBase, TimerAnim, TransitionAnim) {
  _$jscoverage['/anim.js'].functionData[0]++;
  _$jscoverage['/anim.js'].lineData[7]++;
  var Utils = AnimBase.Utils, defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/anim.js'].lineData[25]++;
  function Anim(node, to, duration, easing, complete) {
    _$jscoverage['/anim.js'].functionData[1]++;
    _$jscoverage['/anim.js'].lineData[26]++;
    var config;
    _$jscoverage['/anim.js'].lineData[27]++;
    if (visit1_27_1(node.node)) {
      _$jscoverage['/anim.js'].lineData[28]++;
      config = node;
    } else {
      _$jscoverage['/anim.js'].lineData[31]++;
      if (visit2_31_1(typeof to == 'string')) {
        _$jscoverage['/anim.js'].lineData[32]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/anim.js'].lineData[33]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/anim.js'].functionData[2]++;
  _$jscoverage['/anim.js'].lineData[34]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/anim.js'].lineData[35]++;
  if (visit3_35_1(trimProp)) {
    _$jscoverage['/anim.js'].lineData[36]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/anim.js'].lineData[38]++;
  if (visit4_38_1(!trimProp || visit5_38_2(trimProp != prop))) {
    _$jscoverage['/anim.js'].lineData[39]++;
    delete to[prop];
  }
});
      } else {
        _$jscoverage['/anim.js'].lineData[44]++;
        to = S.clone(to);
      }
      _$jscoverage['/anim.js'].lineData[47]++;
      if (visit6_47_1(S.isPlainObject(duration))) {
        _$jscoverage['/anim.js'].lineData[48]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/anim.js'].lineData[50]++;
        config = {
  complete: complete};
        _$jscoverage['/anim.js'].lineData[53]++;
        if (visit7_53_1(duration)) {
          _$jscoverage['/anim.js'].lineData[54]++;
          config.duration = duration;
        }
        _$jscoverage['/anim.js'].lineData[56]++;
        if (visit8_56_1(easing)) {
          _$jscoverage['/anim.js'].lineData[57]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/anim.js'].lineData[60]++;
      config.node = node;
      _$jscoverage['/anim.js'].lineData[61]++;
      config.to = to;
    }
    _$jscoverage['/anim.js'].lineData[63]++;
    config = S.merge(defaultConfig, config, {
  useTransition: S.config('anim/useTransition')});
    _$jscoverage['/anim.js'].lineData[67]++;
    if (visit9_67_1(config['useTransition'] && TransitionAnim)) {
      _$jscoverage['/anim.js'].lineData[69]++;
      return new TransitionAnim(config);
    } else {
      _$jscoverage['/anim.js'].lineData[72]++;
      return new TimerAnim(config);
    }
  }
  _$jscoverage['/anim.js'].lineData[140]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/anim.js'].functionData[3]++;
  _$jscoverage['/anim.js'].lineData[141]++;
  Anim[action] = function(node, queue) {
  _$jscoverage['/anim.js'].functionData[4]++;
  _$jscoverage['/anim.js'].lineData[142]++;
  if (visit10_144_1(visit11_144_2(queue === null) || visit12_146_1(visit13_146_2(typeof queue == 'string') || visit14_148_1(queue === false)))) {
    _$jscoverage['/anim.js'].lineData[150]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/anim.js'].lineData[152]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/anim.js'].lineData[163]++;
  Anim.isRunning = Utils.isElRunning;
  _$jscoverage['/anim.js'].lineData[172]++;
  Anim.isPaused = Utils.isElPaused;
  _$jscoverage['/anim.js'].lineData[184]++;
  Anim.stop = Utils.stopEl;
  _$jscoverage['/anim.js'].lineData[186]++;
  Anim.Easing = TimerAnim.Easing;
  _$jscoverage['/anim.js'].lineData[188]++;
  S.Anim = Anim;
  _$jscoverage['/anim.js'].lineData[190]++;
  Anim.Q = AnimBase.Q;
  _$jscoverage['/anim.js'].lineData[192]++;
  return Anim;
}, {
  requires: ['dom', 'anim/base', 'anim/timer', KISSY.Features.isTransitionSupported() ? 'anim/transition' : '']});
