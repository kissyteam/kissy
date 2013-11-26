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
  _$jscoverage['/base/utils.js'].lineData[10] = 0;
  _$jscoverage['/base/utils.js'].lineData[12] = 0;
  _$jscoverage['/base/utils.js'].lineData[13] = 0;
  _$jscoverage['/base/utils.js'].lineData[15] = 0;
  _$jscoverage['/base/utils.js'].lineData[16] = 0;
  _$jscoverage['/base/utils.js'].lineData[18] = 0;
  _$jscoverage['/base/utils.js'].lineData[21] = 0;
  _$jscoverage['/base/utils.js'].lineData[22] = 0;
  _$jscoverage['/base/utils.js'].lineData[24] = 0;
  _$jscoverage['/base/utils.js'].lineData[25] = 0;
  _$jscoverage['/base/utils.js'].lineData[26] = 0;
  _$jscoverage['/base/utils.js'].lineData[27] = 0;
  _$jscoverage['/base/utils.js'].lineData[32] = 0;
  _$jscoverage['/base/utils.js'].lineData[33] = 0;
  _$jscoverage['/base/utils.js'].lineData[35] = 0;
  _$jscoverage['/base/utils.js'].lineData[36] = 0;
  _$jscoverage['/base/utils.js'].lineData[38] = 0;
  _$jscoverage['/base/utils.js'].lineData[41] = 0;
  _$jscoverage['/base/utils.js'].lineData[43] = 0;
  _$jscoverage['/base/utils.js'].lineData[44] = 0;
  _$jscoverage['/base/utils.js'].lineData[46] = 0;
  _$jscoverage['/base/utils.js'].lineData[47] = 0;
  _$jscoverage['/base/utils.js'].lineData[49] = 0;
  _$jscoverage['/base/utils.js'].lineData[52] = 0;
  _$jscoverage['/base/utils.js'].lineData[53] = 0;
  _$jscoverage['/base/utils.js'].lineData[55] = 0;
  _$jscoverage['/base/utils.js'].lineData[56] = 0;
  _$jscoverage['/base/utils.js'].lineData[57] = 0;
  _$jscoverage['/base/utils.js'].lineData[58] = 0;
  _$jscoverage['/base/utils.js'].lineData[63] = 0;
  _$jscoverage['/base/utils.js'].lineData[64] = 0;
  _$jscoverage['/base/utils.js'].lineData[66] = 0;
  _$jscoverage['/base/utils.js'].lineData[67] = 0;
  _$jscoverage['/base/utils.js'].lineData[69] = 0;
  _$jscoverage['/base/utils.js'].lineData[72] = 0;
  _$jscoverage['/base/utils.js'].lineData[73] = 0;
  _$jscoverage['/base/utils.js'].lineData[77] = 0;
  _$jscoverage['/base/utils.js'].lineData[78] = 0;
  _$jscoverage['/base/utils.js'].lineData[80] = 0;
  _$jscoverage['/base/utils.js'].lineData[85] = 0;
  _$jscoverage['/base/utils.js'].lineData[94] = 0;
  _$jscoverage['/base/utils.js'].lineData[95] = 0;
  _$jscoverage['/base/utils.js'].lineData[99] = 0;
  _$jscoverage['/base/utils.js'].lineData[100] = 0;
  _$jscoverage['/base/utils.js'].lineData[104] = 0;
  _$jscoverage['/base/utils.js'].lineData[105] = 0;
  _$jscoverage['/base/utils.js'].lineData[106] = 0;
  _$jscoverage['/base/utils.js'].lineData[107] = 0;
  _$jscoverage['/base/utils.js'].lineData[108] = 0;
  _$jscoverage['/base/utils.js'].lineData[111] = 0;
  _$jscoverage['/base/utils.js'].lineData[114] = 0;
  _$jscoverage['/base/utils.js'].lineData[115] = 0;
  _$jscoverage['/base/utils.js'].lineData[116] = 0;
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
  _$jscoverage['/base/utils.js'].branchData['15'] = [];
  _$jscoverage['/base/utils.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['24'] = [];
  _$jscoverage['/base/utils.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['26'] = [];
  _$jscoverage['/base/utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['35'] = [];
  _$jscoverage['/base/utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['46'] = [];
  _$jscoverage['/base/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['55'] = [];
  _$jscoverage['/base/utils.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['57'] = [];
  _$jscoverage['/base/utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['66'] = [];
  _$jscoverage['/base/utils.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['73'] = [];
  _$jscoverage['/base/utils.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['78'] = [];
  _$jscoverage['/base/utils.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['79'] = [];
  _$jscoverage['/base/utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['95'] = [];
  _$jscoverage['/base/utils.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['100'] = [];
  _$jscoverage['/base/utils.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['104'] = [];
  _$jscoverage['/base/utils.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['105'] = [];
  _$jscoverage['/base/utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['107'] = [];
  _$jscoverage['/base/utils.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['115'] = [];
  _$jscoverage['/base/utils.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['115'][3] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['115'][3].init(44, 26, 'anim.config.queue == queue');
function visit32_115_3(result) {
  _$jscoverage['/base/utils.js'].branchData['115'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['115'][2].init(21, 19, 'queue === undefined');
function visit31_115_2(result) {
  _$jscoverage['/base/utils.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['115'][1].init(21, 49, 'queue === undefined || anim.config.queue == queue');
function visit30_115_1(result) {
  _$jscoverage['/base/utils.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['107'][1].init(113, 15, 'queue !== false');
function visit29_107_1(result) {
  _$jscoverage['/base/utils.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['105'][1].init(21, 19, 'queue === undefined');
function visit28_105_1(result) {
  _$jscoverage['/base/utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['104'][1].init(17, 10, 'clearQueue');
function visit27_104_1(result) {
  _$jscoverage['/base/utils.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['100'][1].init(77, 42, 'allRunning && !S.isEmptyObject(allRunning)');
function visit26_100_1(result) {
  _$jscoverage['/base/utils.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['95'][1].init(72, 34, 'paused && !S.isEmptyObject(paused)');
function visit25_95_1(result) {
  _$jscoverage['/base/utils.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['79'][1].init(38, 26, 'anim.config.queue == queue');
function visit24_79_1(result) {
  _$jscoverage['/base/utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['78'][2].init(17, 19, 'queue === undefined');
function visit23_78_2(result) {
  _$jscoverage['/base/utils.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['78'][1].init(17, 65, 'queue === undefined || anim.config.queue == queue');
function visit22_78_1(result) {
  _$jscoverage['/base/utils.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['73'][1].init(39, 18, 'action == \'resume\'');
function visit21_73_1(result) {
  _$jscoverage['/base/utils.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['66'][1].init(91, 6, 'paused');
function visit20_66_1(result) {
  _$jscoverage['/base/utils.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['57'][1].init(59, 23, 'S.isEmptyObject(paused)');
function visit19_57_1(result) {
  _$jscoverage['/base/utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['55'][1].init(91, 6, 'paused');
function visit18_55_1(result) {
  _$jscoverage['/base/utils.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['46'][1].init(91, 7, '!paused');
function visit17_46_1(result) {
  _$jscoverage['/base/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['35'][1].init(96, 10, 'allRunning');
function visit16_35_1(result) {
  _$jscoverage['/base/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['26'][1].init(63, 27, 'S.isEmptyObject(allRunning)');
function visit15_26_1(result) {
  _$jscoverage['/base/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['24'][1].init(96, 10, 'allRunning');
function visit14_24_1(result) {
  _$jscoverage['/base/utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['15'][1].init(96, 11, '!allRunning');
function visit13_15_1(result) {
  _$jscoverage['/base/utils.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[7]++;
  var undefined = undefined, Q = require('./queue'), Dom = require('dom');
  _$jscoverage['/base/utils.js'].lineData[10]++;
  var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[12]++;
  function saveRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[1]++;
    _$jscoverage['/base/utils.js'].lineData[13]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[15]++;
    if (visit13_15_1(!allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[16]++;
      Dom.data(node, runningKey, allRunning = {});
    }
    _$jscoverage['/base/utils.js'].lineData[18]++;
    allRunning[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[21]++;
  function removeRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[2]++;
    _$jscoverage['/base/utils.js'].lineData[22]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[24]++;
    if (visit14_24_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[25]++;
      delete allRunning[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[26]++;
      if (visit15_26_1(S.isEmptyObject(allRunning))) {
        _$jscoverage['/base/utils.js'].lineData[27]++;
        Dom.removeData(node, runningKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[32]++;
  function isAnimRunning(anim) {
    _$jscoverage['/base/utils.js'].functionData[3]++;
    _$jscoverage['/base/utils.js'].lineData[33]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[35]++;
    if (visit16_35_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[36]++;
      return !!allRunning[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[38]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[41]++;
  var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[43]++;
  function savePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[4]++;
    _$jscoverage['/base/utils.js'].lineData[44]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[46]++;
    if (visit17_46_1(!paused)) {
      _$jscoverage['/base/utils.js'].lineData[47]++;
      Dom.data(node, pausedKey, paused = {});
    }
    _$jscoverage['/base/utils.js'].lineData[49]++;
    paused[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[52]++;
  function removePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[5]++;
    _$jscoverage['/base/utils.js'].lineData[53]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[55]++;
    if (visit18_55_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[56]++;
      delete paused[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[57]++;
      if (visit19_57_1(S.isEmptyObject(paused))) {
        _$jscoverage['/base/utils.js'].lineData[58]++;
        Dom.removeData(node, pausedKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[63]++;
  function isAnimPaused(anim) {
    _$jscoverage['/base/utils.js'].functionData[6]++;
    _$jscoverage['/base/utils.js'].lineData[64]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[66]++;
    if (visit20_66_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[67]++;
      return !!paused[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[69]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[72]++;
  function pauseOrResumeQueue(node, queue, action) {
    _$jscoverage['/base/utils.js'].functionData[7]++;
    _$jscoverage['/base/utils.js'].lineData[73]++;
    var allAnims = Dom.data(node, visit21_73_1(action == 'resume') ? pausedKey : runningKey), anims = S.merge(allAnims);
    _$jscoverage['/base/utils.js'].lineData[77]++;
    S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[8]++;
  _$jscoverage['/base/utils.js'].lineData[78]++;
  if (visit22_78_1(visit23_78_2(queue === undefined) || visit24_79_1(anim.config.queue == queue))) {
    _$jscoverage['/base/utils.js'].lineData[80]++;
    anim[action]();
  }
});
  }
  _$jscoverage['/base/utils.js'].lineData[85]++;
  return {
  saveRunningAnim: saveRunningAnim, 
  removeRunningAnim: removeRunningAnim, 
  isAnimPaused: isAnimPaused, 
  removePausedAnim: removePausedAnim, 
  savePausedAnim: savePausedAnim, 
  isAnimRunning: isAnimRunning, 
  'isElPaused': function(node) {
  _$jscoverage['/base/utils.js'].functionData[9]++;
  _$jscoverage['/base/utils.js'].lineData[94]++;
  var paused = Dom.data(node, pausedKey);
  _$jscoverage['/base/utils.js'].lineData[95]++;
  return visit25_95_1(paused && !S.isEmptyObject(paused));
}, 
  'isElRunning': function(node) {
  _$jscoverage['/base/utils.js'].functionData[10]++;
  _$jscoverage['/base/utils.js'].lineData[99]++;
  var allRunning = Dom.data(node, runningKey);
  _$jscoverage['/base/utils.js'].lineData[100]++;
  return visit26_100_1(allRunning && !S.isEmptyObject(allRunning));
}, 
  pauseOrResumeQueue: pauseOrResumeQueue, 
  stopEl: function(node, end, clearQueue, queue) {
  _$jscoverage['/base/utils.js'].functionData[11]++;
  _$jscoverage['/base/utils.js'].lineData[104]++;
  if (visit27_104_1(clearQueue)) {
    _$jscoverage['/base/utils.js'].lineData[105]++;
    if (visit28_105_1(queue === undefined)) {
      _$jscoverage['/base/utils.js'].lineData[106]++;
      Q.clearQueues(node);
    } else {
      _$jscoverage['/base/utils.js'].lineData[107]++;
      if (visit29_107_1(queue !== false)) {
        _$jscoverage['/base/utils.js'].lineData[108]++;
        Q.clearQueue(node, queue);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[111]++;
  var allRunning = Dom.data(node, runningKey), anims = S.merge(allRunning);
  _$jscoverage['/base/utils.js'].lineData[114]++;
  S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[12]++;
  _$jscoverage['/base/utils.js'].lineData[115]++;
  if (visit30_115_1(visit31_115_2(queue === undefined) || visit32_115_3(anim.config.queue == queue))) {
    _$jscoverage['/base/utils.js'].lineData[116]++;
    anim.stop(end);
  }
});
}};
});
