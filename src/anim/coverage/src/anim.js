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
  _$jscoverage['/anim.js'].lineData[9] = 0;
  _$jscoverage['/anim.js'].lineData[10] = 0;
  _$jscoverage['/anim.js'].lineData[11] = 0;
  _$jscoverage['/anim.js'].lineData[43] = 0;
  _$jscoverage['/anim.js'].lineData[44] = 0;
  _$jscoverage['/anim.js'].lineData[45] = 0;
  _$jscoverage['/anim.js'].lineData[46] = 0;
  _$jscoverage['/anim.js'].lineData[49] = 0;
  _$jscoverage['/anim.js'].lineData[50] = 0;
  _$jscoverage['/anim.js'].lineData[51] = 0;
  _$jscoverage['/anim.js'].lineData[52] = 0;
  _$jscoverage['/anim.js'].lineData[53] = 0;
  _$jscoverage['/anim.js'].lineData[54] = 0;
  _$jscoverage['/anim.js'].lineData[56] = 0;
  _$jscoverage['/anim.js'].lineData[57] = 0;
  _$jscoverage['/anim.js'].lineData[62] = 0;
  _$jscoverage['/anim.js'].lineData[65] = 0;
  _$jscoverage['/anim.js'].lineData[66] = 0;
  _$jscoverage['/anim.js'].lineData[68] = 0;
  _$jscoverage['/anim.js'].lineData[71] = 0;
  _$jscoverage['/anim.js'].lineData[72] = 0;
  _$jscoverage['/anim.js'].lineData[74] = 0;
  _$jscoverage['/anim.js'].lineData[75] = 0;
  _$jscoverage['/anim.js'].lineData[78] = 0;
  _$jscoverage['/anim.js'].lineData[79] = 0;
  _$jscoverage['/anim.js'].lineData[81] = 0;
  _$jscoverage['/anim.js'].lineData[85] = 0;
  _$jscoverage['/anim.js'].lineData[86] = 0;
  _$jscoverage['/anim.js'].lineData[87] = 0;
  _$jscoverage['/anim.js'].lineData[89] = 0;
  _$jscoverage['/anim.js'].lineData[90] = 0;
  _$jscoverage['/anim.js'].lineData[158] = 0;
  _$jscoverage['/anim.js'].lineData[159] = 0;
  _$jscoverage['/anim.js'].lineData[160] = 0;
  _$jscoverage['/anim.js'].lineData[168] = 0;
  _$jscoverage['/anim.js'].lineData[170] = 0;
  _$jscoverage['/anim.js'].lineData[181] = 0;
  _$jscoverage['/anim.js'].lineData[190] = 0;
  _$jscoverage['/anim.js'].lineData[202] = 0;
  _$jscoverage['/anim.js'].lineData[204] = 0;
  _$jscoverage['/anim.js'].lineData[206] = 0;
  _$jscoverage['/anim.js'].lineData[208] = 0;
  _$jscoverage['/anim.js'].lineData[210] = 0;
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
  _$jscoverage['/anim.js'].branchData['45'] = [];
  _$jscoverage['/anim.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['49'] = [];
  _$jscoverage['/anim.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['53'] = [];
  _$jscoverage['/anim.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['56'] = [];
  _$jscoverage['/anim.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['65'] = [];
  _$jscoverage['/anim.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['71'] = [];
  _$jscoverage['/anim.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['74'] = [];
  _$jscoverage['/anim.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['85'] = [];
  _$jscoverage['/anim.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['162'] = [];
  _$jscoverage['/anim.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['164'] = [];
  _$jscoverage['/anim.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['166'] = [];
  _$jscoverage['/anim.js'].branchData['166'][1] = new BranchData();
}
_$jscoverage['/anim.js'].branchData['166'][1].init(101, 15, 'queue === false');
function visit14_166_1(result) {
  _$jscoverage['/anim.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['164'][2].init(150, 25, 'typeof queue === \'string\'');
function visit13_164_2(result) {
  _$jscoverage['/anim.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['164'][1].init(84, 117, 'typeof queue === \'string\' || queue === false');
function visit12_164_1(result) {
  _$jscoverage['/anim.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['162'][2].init(64, 14, 'queue === null');
function visit11_162_2(result) {
  _$jscoverage['/anim.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['162'][1].init(49, 202, 'queue === null || typeof queue === \'string\' || queue === false');
function visit10_162_1(result) {
  _$jscoverage['/anim.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['85'][1].init(1415, 38, 'config.useTransition && TransitionAnim');
function visit9_85_1(result) {
  _$jscoverage['/anim.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['74'][1].init(204, 6, 'easing');
function visit8_74_1(result) {
  _$jscoverage['/anim.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['71'][1].init(106, 8, 'duration');
function visit7_71_1(result) {
  _$jscoverage['/anim.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['65'][1].init(680, 25, 'S.isPlainObject(duration)');
function visit6_65_1(result) {
  _$jscoverage['/anim.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['56'][2].init(199, 17, 'trimProp !== prop');
function visit5_56_2(result) {
  _$jscoverage['/anim.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['56'][1].init(186, 30, '!trimProp || trimProp !== prop');
function visit4_56_1(result) {
  _$jscoverage['/anim.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['53'][1].init(74, 8, 'trimProp');
function visit3_53_1(result) {
  _$jscoverage['/anim.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['49'][1].init(58, 22, 'typeof to === \'string\'');
function visit2_49_1(result) {
  _$jscoverage['/anim.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['45'][1].init(33, 9, 'node.node');
function visit1_45_1(result) {
  _$jscoverage['/anim.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/anim.js'].functionData[0]++;
  _$jscoverage['/anim.js'].lineData[7]++;
  var AnimBase = require('anim/base'), TimerAnim = require('anim/timer');
  _$jscoverage['/anim.js'].lineData[9]++;
  var TransitionAnim = require('anim/transition?');
  _$jscoverage['/anim.js'].lineData[10]++;
  var logger = S.getLogger('s/anim');
  _$jscoverage['/anim.js'].lineData[11]++;
  var Utils = AnimBase.Utils, defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/anim.js'].lineData[43]++;
  function Anim(node, to, duration, easing, complete) {
    _$jscoverage['/anim.js'].functionData[1]++;
    _$jscoverage['/anim.js'].lineData[44]++;
    var config;
    _$jscoverage['/anim.js'].lineData[45]++;
    if (visit1_45_1(node.node)) {
      _$jscoverage['/anim.js'].lineData[46]++;
      config = node;
    } else {
      _$jscoverage['/anim.js'].lineData[49]++;
      if (visit2_49_1(typeof to === 'string')) {
        _$jscoverage['/anim.js'].lineData[50]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/anim.js'].lineData[51]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/anim.js'].functionData[2]++;
  _$jscoverage['/anim.js'].lineData[52]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/anim.js'].lineData[53]++;
  if (visit3_53_1(trimProp)) {
    _$jscoverage['/anim.js'].lineData[54]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/anim.js'].lineData[56]++;
  if (visit4_56_1(!trimProp || visit5_56_2(trimProp !== prop))) {
    _$jscoverage['/anim.js'].lineData[57]++;
    delete to[prop];
  }
});
      } else {
        _$jscoverage['/anim.js'].lineData[62]++;
        to = S.clone(to);
      }
      _$jscoverage['/anim.js'].lineData[65]++;
      if (visit6_65_1(S.isPlainObject(duration))) {
        _$jscoverage['/anim.js'].lineData[66]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/anim.js'].lineData[68]++;
        config = {
  complete: complete};
        _$jscoverage['/anim.js'].lineData[71]++;
        if (visit7_71_1(duration)) {
          _$jscoverage['/anim.js'].lineData[72]++;
          config.duration = duration;
        }
        _$jscoverage['/anim.js'].lineData[74]++;
        if (visit8_74_1(easing)) {
          _$jscoverage['/anim.js'].lineData[75]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/anim.js'].lineData[78]++;
      config.node = node;
      _$jscoverage['/anim.js'].lineData[79]++;
      config.to = to;
    }
    _$jscoverage['/anim.js'].lineData[81]++;
    config = S.merge(defaultConfig, config, {
  useTransition: S.config('anim/useTransition')});
    _$jscoverage['/anim.js'].lineData[85]++;
    if (visit9_85_1(config.useTransition && TransitionAnim)) {
      _$jscoverage['/anim.js'].lineData[86]++;
      logger.info('use transition anim');
      _$jscoverage['/anim.js'].lineData[87]++;
      return new TransitionAnim(config);
    } else {
      _$jscoverage['/anim.js'].lineData[89]++;
      logger.info('use js timer anim');
      _$jscoverage['/anim.js'].lineData[90]++;
      return new TimerAnim(config);
    }
  }
  _$jscoverage['/anim.js'].lineData[158]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/anim.js'].functionData[3]++;
  _$jscoverage['/anim.js'].lineData[159]++;
  Anim[action] = function(node, queue) {
  _$jscoverage['/anim.js'].functionData[4]++;
  _$jscoverage['/anim.js'].lineData[160]++;
  if (visit10_162_1(visit11_162_2(queue === null) || visit12_164_1(visit13_164_2(typeof queue === 'string') || visit14_166_1(queue === false)))) {
    _$jscoverage['/anim.js'].lineData[168]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/anim.js'].lineData[170]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/anim.js'].lineData[181]++;
  Anim.isRunning = Utils.isElRunning;
  _$jscoverage['/anim.js'].lineData[190]++;
  Anim.isPaused = Utils.isElPaused;
  _$jscoverage['/anim.js'].lineData[202]++;
  Anim.stop = Utils.stopEl;
  _$jscoverage['/anim.js'].lineData[204]++;
  Anim.Easing = TimerAnim.Easing;
  _$jscoverage['/anim.js'].lineData[206]++;
  S.Anim = Anim;
  _$jscoverage['/anim.js'].lineData[208]++;
  Anim.Q = AnimBase.Q;
  _$jscoverage['/anim.js'].lineData[210]++;
  return Anim;
});
