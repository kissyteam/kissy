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
  _$jscoverage['/base/utils.js'].lineData[8] = 0;
  _$jscoverage['/base/utils.js'].lineData[10] = 0;
  _$jscoverage['/base/utils.js'].lineData[11] = 0;
  _$jscoverage['/base/utils.js'].lineData[13] = 0;
  _$jscoverage['/base/utils.js'].lineData[14] = 0;
  _$jscoverage['/base/utils.js'].lineData[16] = 0;
  _$jscoverage['/base/utils.js'].lineData[19] = 0;
  _$jscoverage['/base/utils.js'].lineData[20] = 0;
  _$jscoverage['/base/utils.js'].lineData[22] = 0;
  _$jscoverage['/base/utils.js'].lineData[23] = 0;
  _$jscoverage['/base/utils.js'].lineData[24] = 0;
  _$jscoverage['/base/utils.js'].lineData[25] = 0;
  _$jscoverage['/base/utils.js'].lineData[30] = 0;
  _$jscoverage['/base/utils.js'].lineData[31] = 0;
  _$jscoverage['/base/utils.js'].lineData[33] = 0;
  _$jscoverage['/base/utils.js'].lineData[34] = 0;
  _$jscoverage['/base/utils.js'].lineData[36] = 0;
  _$jscoverage['/base/utils.js'].lineData[39] = 0;
  _$jscoverage['/base/utils.js'].lineData[41] = 0;
  _$jscoverage['/base/utils.js'].lineData[42] = 0;
  _$jscoverage['/base/utils.js'].lineData[44] = 0;
  _$jscoverage['/base/utils.js'].lineData[45] = 0;
  _$jscoverage['/base/utils.js'].lineData[47] = 0;
  _$jscoverage['/base/utils.js'].lineData[50] = 0;
  _$jscoverage['/base/utils.js'].lineData[51] = 0;
  _$jscoverage['/base/utils.js'].lineData[53] = 0;
  _$jscoverage['/base/utils.js'].lineData[54] = 0;
  _$jscoverage['/base/utils.js'].lineData[55] = 0;
  _$jscoverage['/base/utils.js'].lineData[56] = 0;
  _$jscoverage['/base/utils.js'].lineData[61] = 0;
  _$jscoverage['/base/utils.js'].lineData[62] = 0;
  _$jscoverage['/base/utils.js'].lineData[64] = 0;
  _$jscoverage['/base/utils.js'].lineData[65] = 0;
  _$jscoverage['/base/utils.js'].lineData[67] = 0;
  _$jscoverage['/base/utils.js'].lineData[70] = 0;
  _$jscoverage['/base/utils.js'].lineData[71] = 0;
  _$jscoverage['/base/utils.js'].lineData[75] = 0;
  _$jscoverage['/base/utils.js'].lineData[76] = 0;
  _$jscoverage['/base/utils.js'].lineData[78] = 0;
  _$jscoverage['/base/utils.js'].lineData[83] = 0;
  _$jscoverage['/base/utils.js'].lineData[92] = 0;
  _$jscoverage['/base/utils.js'].lineData[93] = 0;
  _$jscoverage['/base/utils.js'].lineData[97] = 0;
  _$jscoverage['/base/utils.js'].lineData[98] = 0;
  _$jscoverage['/base/utils.js'].lineData[102] = 0;
  _$jscoverage['/base/utils.js'].lineData[103] = 0;
  _$jscoverage['/base/utils.js'].lineData[104] = 0;
  _$jscoverage['/base/utils.js'].lineData[105] = 0;
  _$jscoverage['/base/utils.js'].lineData[106] = 0;
  _$jscoverage['/base/utils.js'].lineData[109] = 0;
  _$jscoverage['/base/utils.js'].lineData[112] = 0;
  _$jscoverage['/base/utils.js'].lineData[113] = 0;
  _$jscoverage['/base/utils.js'].lineData[114] = 0;
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
  _$jscoverage['/base/utils.js'].branchData['13'] = [];
  _$jscoverage['/base/utils.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['22'] = [];
  _$jscoverage['/base/utils.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['24'] = [];
  _$jscoverage['/base/utils.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['33'] = [];
  _$jscoverage['/base/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['44'] = [];
  _$jscoverage['/base/utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['53'] = [];
  _$jscoverage['/base/utils.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['55'] = [];
  _$jscoverage['/base/utils.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['64'] = [];
  _$jscoverage['/base/utils.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['71'] = [];
  _$jscoverage['/base/utils.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['76'] = [];
  _$jscoverage['/base/utils.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['77'] = [];
  _$jscoverage['/base/utils.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['93'] = [];
  _$jscoverage['/base/utils.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['98'] = [];
  _$jscoverage['/base/utils.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['102'] = [];
  _$jscoverage['/base/utils.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['103'] = [];
  _$jscoverage['/base/utils.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['105'] = [];
  _$jscoverage['/base/utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['113'] = [];
  _$jscoverage['/base/utils.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['113'][3] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['113'][3].init(45, 26, 'anim.config.queue == queue');
function visit32_113_3(result) {
  _$jscoverage['/base/utils.js'].branchData['113'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['113'][2].init(22, 19, 'queue === undefined');
function visit31_113_2(result) {
  _$jscoverage['/base/utils.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['113'][1].init(22, 49, 'queue === undefined || anim.config.queue == queue');
function visit30_113_1(result) {
  _$jscoverage['/base/utils.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['105'][1].init(116, 15, 'queue !== false');
function visit29_105_1(result) {
  _$jscoverage['/base/utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['103'][1].init(22, 19, 'queue === undefined');
function visit28_103_1(result) {
  _$jscoverage['/base/utils.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['102'][1].init(18, 10, 'clearQueue');
function visit27_102_1(result) {
  _$jscoverage['/base/utils.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['98'][1].init(79, 42, 'allRunning && !S.isEmptyObject(allRunning)');
function visit26_98_1(result) {
  _$jscoverage['/base/utils.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['93'][1].init(74, 34, 'paused && !S.isEmptyObject(paused)');
function visit25_93_1(result) {
  _$jscoverage['/base/utils.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['77'][1].init(39, 26, 'anim.config.queue == queue');
function visit24_77_1(result) {
  _$jscoverage['/base/utils.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['76'][2].init(18, 19, 'queue === undefined');
function visit23_76_2(result) {
  _$jscoverage['/base/utils.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['76'][1].init(18, 66, 'queue === undefined || anim.config.queue == queue');
function visit22_76_1(result) {
  _$jscoverage['/base/utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['71'][1].init(40, 18, 'action == \'resume\'');
function visit21_71_1(result) {
  _$jscoverage['/base/utils.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['64'][1].init(94, 6, 'paused');
function visit20_64_1(result) {
  _$jscoverage['/base/utils.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['55'][1].init(61, 23, 'S.isEmptyObject(paused)');
function visit19_55_1(result) {
  _$jscoverage['/base/utils.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['53'][1].init(94, 6, 'paused');
function visit18_53_1(result) {
  _$jscoverage['/base/utils.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['44'][1].init(94, 7, '!paused');
function visit17_44_1(result) {
  _$jscoverage['/base/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['33'][1].init(99, 10, 'allRunning');
function visit16_33_1(result) {
  _$jscoverage['/base/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['24'][1].init(65, 27, 'S.isEmptyObject(allRunning)');
function visit15_24_1(result) {
  _$jscoverage['/base/utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['22'][1].init(99, 10, 'allRunning');
function visit14_22_1(result) {
  _$jscoverage['/base/utils.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['13'][1].init(99, 11, '!allRunning');
function visit13_13_1(result) {
  _$jscoverage['/base/utils.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[6]++;
KISSY.add('anim/base/utils', function(S, Dom, Q, undefined) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[8]++;
  var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[10]++;
  function saveRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[1]++;
    _$jscoverage['/base/utils.js'].lineData[11]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[13]++;
    if (visit13_13_1(!allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[14]++;
      Dom.data(node, runningKey, allRunning = {});
    }
    _$jscoverage['/base/utils.js'].lineData[16]++;
    allRunning[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[19]++;
  function removeRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[2]++;
    _$jscoverage['/base/utils.js'].lineData[20]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[22]++;
    if (visit14_22_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[23]++;
      delete allRunning[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[24]++;
      if (visit15_24_1(S.isEmptyObject(allRunning))) {
        _$jscoverage['/base/utils.js'].lineData[25]++;
        Dom.removeData(node, runningKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[30]++;
  function isAnimRunning(anim) {
    _$jscoverage['/base/utils.js'].functionData[3]++;
    _$jscoverage['/base/utils.js'].lineData[31]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[33]++;
    if (visit16_33_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[34]++;
      return !!allRunning[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[36]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[39]++;
  var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[41]++;
  function savePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[4]++;
    _$jscoverage['/base/utils.js'].lineData[42]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[44]++;
    if (visit17_44_1(!paused)) {
      _$jscoverage['/base/utils.js'].lineData[45]++;
      Dom.data(node, pausedKey, paused = {});
    }
    _$jscoverage['/base/utils.js'].lineData[47]++;
    paused[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[50]++;
  function removePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[5]++;
    _$jscoverage['/base/utils.js'].lineData[51]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[53]++;
    if (visit18_53_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[54]++;
      delete paused[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[55]++;
      if (visit19_55_1(S.isEmptyObject(paused))) {
        _$jscoverage['/base/utils.js'].lineData[56]++;
        Dom.removeData(node, pausedKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[61]++;
  function isAnimPaused(anim) {
    _$jscoverage['/base/utils.js'].functionData[6]++;
    _$jscoverage['/base/utils.js'].lineData[62]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[64]++;
    if (visit20_64_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[65]++;
      return !!paused[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[67]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[70]++;
  function pauseOrResumeQueue(node, queue, action) {
    _$jscoverage['/base/utils.js'].functionData[7]++;
    _$jscoverage['/base/utils.js'].lineData[71]++;
    var allAnims = Dom.data(node, visit21_71_1(action == 'resume') ? pausedKey : runningKey), anims = S.merge(allAnims);
    _$jscoverage['/base/utils.js'].lineData[75]++;
    S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[8]++;
  _$jscoverage['/base/utils.js'].lineData[76]++;
  if (visit22_76_1(visit23_76_2(queue === undefined) || visit24_77_1(anim.config.queue == queue))) {
    _$jscoverage['/base/utils.js'].lineData[78]++;
    anim[action]();
  }
});
  }
  _$jscoverage['/base/utils.js'].lineData[83]++;
  return {
  saveRunningAnim: saveRunningAnim, 
  removeRunningAnim: removeRunningAnim, 
  isAnimPaused: isAnimPaused, 
  removePausedAnim: removePausedAnim, 
  savePausedAnim: savePausedAnim, 
  isAnimRunning: isAnimRunning, 
  'isElPaused': function(node) {
  _$jscoverage['/base/utils.js'].functionData[9]++;
  _$jscoverage['/base/utils.js'].lineData[92]++;
  var paused = Dom.data(node, pausedKey);
  _$jscoverage['/base/utils.js'].lineData[93]++;
  return visit25_93_1(paused && !S.isEmptyObject(paused));
}, 
  'isElRunning': function(node) {
  _$jscoverage['/base/utils.js'].functionData[10]++;
  _$jscoverage['/base/utils.js'].lineData[97]++;
  var allRunning = Dom.data(node, runningKey);
  _$jscoverage['/base/utils.js'].lineData[98]++;
  return visit26_98_1(allRunning && !S.isEmptyObject(allRunning));
}, 
  pauseOrResumeQueue: pauseOrResumeQueue, 
  stopEl: function(node, end, clearQueue, queue) {
  _$jscoverage['/base/utils.js'].functionData[11]++;
  _$jscoverage['/base/utils.js'].lineData[102]++;
  if (visit27_102_1(clearQueue)) {
    _$jscoverage['/base/utils.js'].lineData[103]++;
    if (visit28_103_1(queue === undefined)) {
      _$jscoverage['/base/utils.js'].lineData[104]++;
      Q.clearQueues(node);
    } else {
      _$jscoverage['/base/utils.js'].lineData[105]++;
      if (visit29_105_1(queue !== false)) {
        _$jscoverage['/base/utils.js'].lineData[106]++;
        Q.clearQueue(node, queue);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[109]++;
  var allRunning = Dom.data(node, runningKey), anims = S.merge(allRunning);
  _$jscoverage['/base/utils.js'].lineData[112]++;
  S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[12]++;
  _$jscoverage['/base/utils.js'].lineData[113]++;
  if (visit30_113_1(visit31_113_2(queue === undefined) || visit32_113_3(anim.config.queue == queue))) {
    _$jscoverage['/base/utils.js'].lineData[114]++;
    anim.stop(end);
  }
});
}};
}, {
  requires: ['dom', './queue']});
