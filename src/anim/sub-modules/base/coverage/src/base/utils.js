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
if (! _$jscoverage['/base/utils.js']) {
  _$jscoverage['/base/utils.js'] = {};
  _$jscoverage['/base/utils.js'].lineData = [];
  _$jscoverage['/base/utils.js'].lineData[6] = 0;
  _$jscoverage['/base/utils.js'].lineData[7] = 0;
  _$jscoverage['/base/utils.js'].lineData[11] = 0;
  _$jscoverage['/base/utils.js'].lineData[13] = 0;
  _$jscoverage['/base/utils.js'].lineData[14] = 0;
  _$jscoverage['/base/utils.js'].lineData[16] = 0;
  _$jscoverage['/base/utils.js'].lineData[17] = 0;
  _$jscoverage['/base/utils.js'].lineData[19] = 0;
  _$jscoverage['/base/utils.js'].lineData[22] = 0;
  _$jscoverage['/base/utils.js'].lineData[23] = 0;
  _$jscoverage['/base/utils.js'].lineData[25] = 0;
  _$jscoverage['/base/utils.js'].lineData[26] = 0;
  _$jscoverage['/base/utils.js'].lineData[27] = 0;
  _$jscoverage['/base/utils.js'].lineData[28] = 0;
  _$jscoverage['/base/utils.js'].lineData[33] = 0;
  _$jscoverage['/base/utils.js'].lineData[34] = 0;
  _$jscoverage['/base/utils.js'].lineData[36] = 0;
  _$jscoverage['/base/utils.js'].lineData[37] = 0;
  _$jscoverage['/base/utils.js'].lineData[39] = 0;
  _$jscoverage['/base/utils.js'].lineData[42] = 0;
  _$jscoverage['/base/utils.js'].lineData[44] = 0;
  _$jscoverage['/base/utils.js'].lineData[45] = 0;
  _$jscoverage['/base/utils.js'].lineData[47] = 0;
  _$jscoverage['/base/utils.js'].lineData[48] = 0;
  _$jscoverage['/base/utils.js'].lineData[50] = 0;
  _$jscoverage['/base/utils.js'].lineData[53] = 0;
  _$jscoverage['/base/utils.js'].lineData[54] = 0;
  _$jscoverage['/base/utils.js'].lineData[56] = 0;
  _$jscoverage['/base/utils.js'].lineData[57] = 0;
  _$jscoverage['/base/utils.js'].lineData[58] = 0;
  _$jscoverage['/base/utils.js'].lineData[59] = 0;
  _$jscoverage['/base/utils.js'].lineData[64] = 0;
  _$jscoverage['/base/utils.js'].lineData[65] = 0;
  _$jscoverage['/base/utils.js'].lineData[67] = 0;
  _$jscoverage['/base/utils.js'].lineData[68] = 0;
  _$jscoverage['/base/utils.js'].lineData[70] = 0;
  _$jscoverage['/base/utils.js'].lineData[73] = 0;
  _$jscoverage['/base/utils.js'].lineData[74] = 0;
  _$jscoverage['/base/utils.js'].lineData[78] = 0;
  _$jscoverage['/base/utils.js'].lineData[79] = 0;
  _$jscoverage['/base/utils.js'].lineData[81] = 0;
  _$jscoverage['/base/utils.js'].lineData[86] = 0;
  _$jscoverage['/base/utils.js'].lineData[95] = 0;
  _$jscoverage['/base/utils.js'].lineData[96] = 0;
  _$jscoverage['/base/utils.js'].lineData[100] = 0;
  _$jscoverage['/base/utils.js'].lineData[101] = 0;
  _$jscoverage['/base/utils.js'].lineData[105] = 0;
  _$jscoverage['/base/utils.js'].lineData[106] = 0;
  _$jscoverage['/base/utils.js'].lineData[107] = 0;
  _$jscoverage['/base/utils.js'].lineData[108] = 0;
  _$jscoverage['/base/utils.js'].lineData[109] = 0;
  _$jscoverage['/base/utils.js'].lineData[112] = 0;
  _$jscoverage['/base/utils.js'].lineData[115] = 0;
  _$jscoverage['/base/utils.js'].lineData[116] = 0;
  _$jscoverage['/base/utils.js'].lineData[117] = 0;
}
if (! _$jscoverage['/base/utils.js'].functionData) {
  _$jscoverage['/base/utils.js'].functionData = [];
  _$jscoverage['/base/utils.js'].functionData[0] = 0;
  _$jscoverage['/base/utils.js'].functionData[1] = 0;
  _$jscoverage['/base/utils.js'].functionData[2] = 0;
  _$jscoverage['/base/utils.js'].functionData[3] = 0;
  _$jscoverage['/base/utils.js'].functionData[4] = 0;
  _$jscoverage['/base/utils.js'].functionData[5] = 0;
  _$jscoverage['/base/utils.js'].functionData[6] = 0;
  _$jscoverage['/base/utils.js'].functionData[7] = 0;
  _$jscoverage['/base/utils.js'].functionData[8] = 0;
  _$jscoverage['/base/utils.js'].functionData[9] = 0;
  _$jscoverage['/base/utils.js'].functionData[10] = 0;
  _$jscoverage['/base/utils.js'].functionData[11] = 0;
  _$jscoverage['/base/utils.js'].functionData[12] = 0;
}
if (! _$jscoverage['/base/utils.js'].branchData) {
  _$jscoverage['/base/utils.js'].branchData = {};
  _$jscoverage['/base/utils.js'].branchData['16'] = [];
  _$jscoverage['/base/utils.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['25'] = [];
  _$jscoverage['/base/utils.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['27'] = [];
  _$jscoverage['/base/utils.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['36'] = [];
  _$jscoverage['/base/utils.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['47'] = [];
  _$jscoverage['/base/utils.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['56'] = [];
  _$jscoverage['/base/utils.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['58'] = [];
  _$jscoverage['/base/utils.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['67'] = [];
  _$jscoverage['/base/utils.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['74'] = [];
  _$jscoverage['/base/utils.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['79'] = [];
  _$jscoverage['/base/utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['80'] = [];
  _$jscoverage['/base/utils.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['96'] = [];
  _$jscoverage['/base/utils.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['101'] = [];
  _$jscoverage['/base/utils.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['105'] = [];
  _$jscoverage['/base/utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['106'] = [];
  _$jscoverage['/base/utils.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['108'] = [];
  _$jscoverage['/base/utils.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['116'] = [];
  _$jscoverage['/base/utils.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['116'][3] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['116'][3].init(44, 26, 'anim.config.queue == queue');
function visit32_116_3(result) {
  _$jscoverage['/base/utils.js'].branchData['116'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['116'][2].init(21, 19, 'queue === undefined');
function visit31_116_2(result) {
  _$jscoverage['/base/utils.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['116'][1].init(21, 49, 'queue === undefined || anim.config.queue == queue');
function visit30_116_1(result) {
  _$jscoverage['/base/utils.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['108'][1].init(113, 15, 'queue !== false');
function visit29_108_1(result) {
  _$jscoverage['/base/utils.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['106'][1].init(21, 19, 'queue === undefined');
function visit28_106_1(result) {
  _$jscoverage['/base/utils.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['105'][1].init(17, 10, 'clearQueue');
function visit27_105_1(result) {
  _$jscoverage['/base/utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['101'][1].init(77, 42, 'allRunning && !S.isEmptyObject(allRunning)');
function visit26_101_1(result) {
  _$jscoverage['/base/utils.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['96'][1].init(72, 34, 'paused && !S.isEmptyObject(paused)');
function visit25_96_1(result) {
  _$jscoverage['/base/utils.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['80'][1].init(38, 26, 'anim.config.queue == queue');
function visit24_80_1(result) {
  _$jscoverage['/base/utils.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['79'][2].init(17, 19, 'queue === undefined');
function visit23_79_2(result) {
  _$jscoverage['/base/utils.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['79'][1].init(17, 65, 'queue === undefined || anim.config.queue == queue');
function visit22_79_1(result) {
  _$jscoverage['/base/utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['74'][1].init(39, 18, 'action == \'resume\'');
function visit21_74_1(result) {
  _$jscoverage['/base/utils.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['67'][1].init(91, 6, 'paused');
function visit20_67_1(result) {
  _$jscoverage['/base/utils.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['58'][1].init(59, 23, 'S.isEmptyObject(paused)');
function visit19_58_1(result) {
  _$jscoverage['/base/utils.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['56'][1].init(91, 6, 'paused');
function visit18_56_1(result) {
  _$jscoverage['/base/utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['47'][1].init(91, 7, '!paused');
function visit17_47_1(result) {
  _$jscoverage['/base/utils.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['36'][1].init(96, 10, 'allRunning');
function visit16_36_1(result) {
  _$jscoverage['/base/utils.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['27'][1].init(63, 27, 'S.isEmptyObject(allRunning)');
function visit15_27_1(result) {
  _$jscoverage['/base/utils.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['25'][1].init(96, 10, 'allRunning');
function visit14_25_1(result) {
  _$jscoverage['/base/utils.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['16'][1].init(96, 11, '!allRunning');
function visit13_16_1(result) {
  _$jscoverage['/base/utils.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[7]++;
  var module = this, undefined = undefined, Q = module.require('./queue'), Dom = module.require('dom');
  _$jscoverage['/base/utils.js'].lineData[11]++;
  var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[13]++;
  function saveRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[1]++;
    _$jscoverage['/base/utils.js'].lineData[14]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[16]++;
    if (visit13_16_1(!allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[17]++;
      Dom.data(node, runningKey, allRunning = {});
    }
    _$jscoverage['/base/utils.js'].lineData[19]++;
    allRunning[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[22]++;
  function removeRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[2]++;
    _$jscoverage['/base/utils.js'].lineData[23]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[25]++;
    if (visit14_25_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[26]++;
      delete allRunning[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[27]++;
      if (visit15_27_1(S.isEmptyObject(allRunning))) {
        _$jscoverage['/base/utils.js'].lineData[28]++;
        Dom.removeData(node, runningKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[33]++;
  function isAnimRunning(anim) {
    _$jscoverage['/base/utils.js'].functionData[3]++;
    _$jscoverage['/base/utils.js'].lineData[34]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[36]++;
    if (visit16_36_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[37]++;
      return !!allRunning[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[39]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[42]++;
  var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[44]++;
  function savePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[4]++;
    _$jscoverage['/base/utils.js'].lineData[45]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[47]++;
    if (visit17_47_1(!paused)) {
      _$jscoverage['/base/utils.js'].lineData[48]++;
      Dom.data(node, pausedKey, paused = {});
    }
    _$jscoverage['/base/utils.js'].lineData[50]++;
    paused[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[53]++;
  function removePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[5]++;
    _$jscoverage['/base/utils.js'].lineData[54]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[56]++;
    if (visit18_56_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[57]++;
      delete paused[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[58]++;
      if (visit19_58_1(S.isEmptyObject(paused))) {
        _$jscoverage['/base/utils.js'].lineData[59]++;
        Dom.removeData(node, pausedKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[64]++;
  function isAnimPaused(anim) {
    _$jscoverage['/base/utils.js'].functionData[6]++;
    _$jscoverage['/base/utils.js'].lineData[65]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[67]++;
    if (visit20_67_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[68]++;
      return !!paused[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[70]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[73]++;
  function pauseOrResumeQueue(node, queue, action) {
    _$jscoverage['/base/utils.js'].functionData[7]++;
    _$jscoverage['/base/utils.js'].lineData[74]++;
    var allAnims = Dom.data(node, visit21_74_1(action == 'resume') ? pausedKey : runningKey), anims = S.merge(allAnims);
    _$jscoverage['/base/utils.js'].lineData[78]++;
    S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[8]++;
  _$jscoverage['/base/utils.js'].lineData[79]++;
  if (visit22_79_1(visit23_79_2(queue === undefined) || visit24_80_1(anim.config.queue == queue))) {
    _$jscoverage['/base/utils.js'].lineData[81]++;
    anim[action]();
  }
});
  }
  _$jscoverage['/base/utils.js'].lineData[86]++;
  return {
  saveRunningAnim: saveRunningAnim, 
  removeRunningAnim: removeRunningAnim, 
  isAnimPaused: isAnimPaused, 
  removePausedAnim: removePausedAnim, 
  savePausedAnim: savePausedAnim, 
  isAnimRunning: isAnimRunning, 
  'isElPaused': function(node) {
  _$jscoverage['/base/utils.js'].functionData[9]++;
  _$jscoverage['/base/utils.js'].lineData[95]++;
  var paused = Dom.data(node, pausedKey);
  _$jscoverage['/base/utils.js'].lineData[96]++;
  return visit25_96_1(paused && !S.isEmptyObject(paused));
}, 
  'isElRunning': function(node) {
  _$jscoverage['/base/utils.js'].functionData[10]++;
  _$jscoverage['/base/utils.js'].lineData[100]++;
  var allRunning = Dom.data(node, runningKey);
  _$jscoverage['/base/utils.js'].lineData[101]++;
  return visit26_101_1(allRunning && !S.isEmptyObject(allRunning));
}, 
  pauseOrResumeQueue: pauseOrResumeQueue, 
  stopEl: function(node, end, clearQueue, queue) {
  _$jscoverage['/base/utils.js'].functionData[11]++;
  _$jscoverage['/base/utils.js'].lineData[105]++;
  if (visit27_105_1(clearQueue)) {
    _$jscoverage['/base/utils.js'].lineData[106]++;
    if (visit28_106_1(queue === undefined)) {
      _$jscoverage['/base/utils.js'].lineData[107]++;
      Q.clearQueues(node);
    } else {
      _$jscoverage['/base/utils.js'].lineData[108]++;
      if (visit29_108_1(queue !== false)) {
        _$jscoverage['/base/utils.js'].lineData[109]++;
        Q.clearQueue(node, queue);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[112]++;
  var allRunning = Dom.data(node, runningKey), anims = S.merge(allRunning);
  _$jscoverage['/base/utils.js'].lineData[115]++;
  S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[12]++;
  _$jscoverage['/base/utils.js'].lineData[116]++;
  if (visit30_116_1(visit31_116_2(queue === undefined) || visit32_116_3(anim.config.queue == queue))) {
    _$jscoverage['/base/utils.js'].lineData[117]++;
    anim.stop(end);
  }
});
}};
});
