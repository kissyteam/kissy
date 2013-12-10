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
  _$jscoverage['/anim.js'].lineData[8] = 0;
  _$jscoverage['/anim.js'].lineData[9] = 0;
  _$jscoverage['/anim.js'].lineData[10] = 0;
  _$jscoverage['/anim.js'].lineData[11] = 0;
  _$jscoverage['/anim.js'].lineData[12] = 0;
  _$jscoverage['/anim.js'].lineData[42] = 0;
  _$jscoverage['/anim.js'].lineData[43] = 0;
  _$jscoverage['/anim.js'].lineData[44] = 0;
  _$jscoverage['/anim.js'].lineData[45] = 0;
  _$jscoverage['/anim.js'].lineData[48] = 0;
  _$jscoverage['/anim.js'].lineData[49] = 0;
  _$jscoverage['/anim.js'].lineData[50] = 0;
  _$jscoverage['/anim.js'].lineData[51] = 0;
  _$jscoverage['/anim.js'].lineData[52] = 0;
  _$jscoverage['/anim.js'].lineData[53] = 0;
  _$jscoverage['/anim.js'].lineData[55] = 0;
  _$jscoverage['/anim.js'].lineData[56] = 0;
  _$jscoverage['/anim.js'].lineData[61] = 0;
  _$jscoverage['/anim.js'].lineData[64] = 0;
  _$jscoverage['/anim.js'].lineData[65] = 0;
  _$jscoverage['/anim.js'].lineData[67] = 0;
  _$jscoverage['/anim.js'].lineData[70] = 0;
  _$jscoverage['/anim.js'].lineData[71] = 0;
  _$jscoverage['/anim.js'].lineData[73] = 0;
  _$jscoverage['/anim.js'].lineData[74] = 0;
  _$jscoverage['/anim.js'].lineData[77] = 0;
  _$jscoverage['/anim.js'].lineData[78] = 0;
  _$jscoverage['/anim.js'].lineData[80] = 0;
  _$jscoverage['/anim.js'].lineData[84] = 0;
  _$jscoverage['/anim.js'].lineData[85] = 0;
  _$jscoverage['/anim.js'].lineData[86] = 0;
  _$jscoverage['/anim.js'].lineData[88] = 0;
  _$jscoverage['/anim.js'].lineData[89] = 0;
  _$jscoverage['/anim.js'].lineData[157] = 0;
  _$jscoverage['/anim.js'].lineData[158] = 0;
  _$jscoverage['/anim.js'].lineData[159] = 0;
  _$jscoverage['/anim.js'].lineData[167] = 0;
  _$jscoverage['/anim.js'].lineData[169] = 0;
  _$jscoverage['/anim.js'].lineData[180] = 0;
  _$jscoverage['/anim.js'].lineData[189] = 0;
  _$jscoverage['/anim.js'].lineData[201] = 0;
  _$jscoverage['/anim.js'].lineData[203] = 0;
  _$jscoverage['/anim.js'].lineData[205] = 0;
  _$jscoverage['/anim.js'].lineData[207] = 0;
  _$jscoverage['/anim.js'].lineData[209] = 0;
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
  _$jscoverage['/anim.js'].branchData['44'] = [];
  _$jscoverage['/anim.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['48'] = [];
  _$jscoverage['/anim.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['52'] = [];
  _$jscoverage['/anim.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['55'] = [];
  _$jscoverage['/anim.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['64'] = [];
  _$jscoverage['/anim.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['70'] = [];
  _$jscoverage['/anim.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['73'] = [];
  _$jscoverage['/anim.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['84'] = [];
  _$jscoverage['/anim.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['161'] = [];
  _$jscoverage['/anim.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['163'] = [];
  _$jscoverage['/anim.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/anim.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/anim.js'].branchData['165'] = [];
  _$jscoverage['/anim.js'].branchData['165'][1] = new BranchData();
}
_$jscoverage['/anim.js'].branchData['165'][1].init(101, 15, 'queue === false');
function visit14_165_1(result) {
  _$jscoverage['/anim.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['163'][2].init(150, 25, 'typeof queue === \'string\'');
function visit13_163_2(result) {
  _$jscoverage['/anim.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['163'][1].init(84, 117, 'typeof queue === \'string\' || queue === false');
function visit12_163_1(result) {
  _$jscoverage['/anim.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['161'][2].init(64, 14, 'queue === null');
function visit11_161_2(result) {
  _$jscoverage['/anim.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['161'][1].init(49, 202, 'queue === null || typeof queue === \'string\' || queue === false');
function visit10_161_1(result) {
  _$jscoverage['/anim.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['84'][1].init(1415, 38, 'config.useTransition && TransitionAnim');
function visit9_84_1(result) {
  _$jscoverage['/anim.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['73'][1].init(204, 6, 'easing');
function visit8_73_1(result) {
  _$jscoverage['/anim.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['70'][1].init(106, 8, 'duration');
function visit7_70_1(result) {
  _$jscoverage['/anim.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['64'][1].init(680, 25, 'S.isPlainObject(duration)');
function visit6_64_1(result) {
  _$jscoverage['/anim.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['55'][2].init(199, 17, 'trimProp !== prop');
function visit5_55_2(result) {
  _$jscoverage['/anim.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['55'][1].init(186, 30, '!trimProp || trimProp !== prop');
function visit4_55_1(result) {
  _$jscoverage['/anim.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['52'][1].init(74, 8, 'trimProp');
function visit3_52_1(result) {
  _$jscoverage['/anim.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['48'][1].init(58, 22, 'typeof to === \'string\'');
function visit2_48_1(result) {
  _$jscoverage['/anim.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].branchData['44'][1].init(33, 9, 'node.node');
function visit1_44_1(result) {
  _$jscoverage['/anim.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/anim.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/anim.js'].functionData[0]++;
  _$jscoverage['/anim.js'].lineData[7]++;
  var AnimBase = require('anim/base');
  _$jscoverage['/anim.js'].lineData[8]++;
  var TimerAnim = require('anim/timer');
  _$jscoverage['/anim.js'].lineData[9]++;
  var TransitionAnim = require('anim/transition?');
  _$jscoverage['/anim.js'].lineData[10]++;
  var logger = S.getLogger('s/anim');
  _$jscoverage['/anim.js'].lineData[11]++;
  var Utils = AnimBase.Utils;
  _$jscoverage['/anim.js'].lineData[12]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/anim.js'].lineData[42]++;
  function Anim(node, to, duration, easing, complete) {
    _$jscoverage['/anim.js'].functionData[1]++;
    _$jscoverage['/anim.js'].lineData[43]++;
    var config;
    _$jscoverage['/anim.js'].lineData[44]++;
    if (visit1_44_1(node.node)) {
      _$jscoverage['/anim.js'].lineData[45]++;
      config = node;
    } else {
      _$jscoverage['/anim.js'].lineData[48]++;
      if (visit2_48_1(typeof to === 'string')) {
        _$jscoverage['/anim.js'].lineData[49]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/anim.js'].lineData[50]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/anim.js'].functionData[2]++;
  _$jscoverage['/anim.js'].lineData[51]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/anim.js'].lineData[52]++;
  if (visit3_52_1(trimProp)) {
    _$jscoverage['/anim.js'].lineData[53]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/anim.js'].lineData[55]++;
  if (visit4_55_1(!trimProp || visit5_55_2(trimProp !== prop))) {
    _$jscoverage['/anim.js'].lineData[56]++;
    delete to[prop];
  }
});
      } else {
        _$jscoverage['/anim.js'].lineData[61]++;
        to = S.clone(to);
      }
      _$jscoverage['/anim.js'].lineData[64]++;
      if (visit6_64_1(S.isPlainObject(duration))) {
        _$jscoverage['/anim.js'].lineData[65]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/anim.js'].lineData[67]++;
        config = {
  complete: complete};
        _$jscoverage['/anim.js'].lineData[70]++;
        if (visit7_70_1(duration)) {
          _$jscoverage['/anim.js'].lineData[71]++;
          config.duration = duration;
        }
        _$jscoverage['/anim.js'].lineData[73]++;
        if (visit8_73_1(easing)) {
          _$jscoverage['/anim.js'].lineData[74]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/anim.js'].lineData[77]++;
      config.node = node;
      _$jscoverage['/anim.js'].lineData[78]++;
      config.to = to;
    }
    _$jscoverage['/anim.js'].lineData[80]++;
    config = S.merge(defaultConfig, config, {
  useTransition: S.config('anim/useTransition')});
    _$jscoverage['/anim.js'].lineData[84]++;
    if (visit9_84_1(config.useTransition && TransitionAnim)) {
      _$jscoverage['/anim.js'].lineData[85]++;
      logger.info('use transition anim');
      _$jscoverage['/anim.js'].lineData[86]++;
      return new TransitionAnim(config);
    } else {
      _$jscoverage['/anim.js'].lineData[88]++;
      logger.info('use js timer anim');
      _$jscoverage['/anim.js'].lineData[89]++;
      return new TimerAnim(config);
    }
  }
  _$jscoverage['/anim.js'].lineData[157]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/anim.js'].functionData[3]++;
  _$jscoverage['/anim.js'].lineData[158]++;
  Anim[action] = function(node, queue) {
  _$jscoverage['/anim.js'].functionData[4]++;
  _$jscoverage['/anim.js'].lineData[159]++;
  if (visit10_161_1(visit11_161_2(queue === null) || visit12_163_1(visit13_163_2(typeof queue === 'string') || visit14_165_1(queue === false)))) {
    _$jscoverage['/anim.js'].lineData[167]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/anim.js'].lineData[169]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/anim.js'].lineData[180]++;
  Anim.isRunning = Utils.isElRunning;
  _$jscoverage['/anim.js'].lineData[189]++;
  Anim.isPaused = Utils.isElPaused;
  _$jscoverage['/anim.js'].lineData[201]++;
  Anim.stop = Utils.stopEl;
  _$jscoverage['/anim.js'].lineData[203]++;
  Anim.Easing = TimerAnim.Easing;
  _$jscoverage['/anim.js'].lineData[205]++;
  S.Anim = Anim;
  _$jscoverage['/anim.js'].lineData[207]++;
  Anim.Q = AnimBase.Q;
  _$jscoverage['/anim.js'].lineData[209]++;
  return Anim;
});
