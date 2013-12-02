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
  _$jscoverage['/base/utils.js'].lineData[9] = 0;
  _$jscoverage['/base/utils.js'].lineData[11] = 0;
  _$jscoverage['/base/utils.js'].lineData[12] = 0;
  _$jscoverage['/base/utils.js'].lineData[14] = 0;
  _$jscoverage['/base/utils.js'].lineData[15] = 0;
  _$jscoverage['/base/utils.js'].lineData[17] = 0;
  _$jscoverage['/base/utils.js'].lineData[20] = 0;
  _$jscoverage['/base/utils.js'].lineData[21] = 0;
  _$jscoverage['/base/utils.js'].lineData[23] = 0;
  _$jscoverage['/base/utils.js'].lineData[24] = 0;
  _$jscoverage['/base/utils.js'].lineData[25] = 0;
  _$jscoverage['/base/utils.js'].lineData[26] = 0;
  _$jscoverage['/base/utils.js'].lineData[31] = 0;
  _$jscoverage['/base/utils.js'].lineData[32] = 0;
  _$jscoverage['/base/utils.js'].lineData[34] = 0;
  _$jscoverage['/base/utils.js'].lineData[35] = 0;
  _$jscoverage['/base/utils.js'].lineData[37] = 0;
  _$jscoverage['/base/utils.js'].lineData[40] = 0;
  _$jscoverage['/base/utils.js'].lineData[42] = 0;
  _$jscoverage['/base/utils.js'].lineData[43] = 0;
  _$jscoverage['/base/utils.js'].lineData[45] = 0;
  _$jscoverage['/base/utils.js'].lineData[46] = 0;
  _$jscoverage['/base/utils.js'].lineData[48] = 0;
  _$jscoverage['/base/utils.js'].lineData[51] = 0;
  _$jscoverage['/base/utils.js'].lineData[52] = 0;
  _$jscoverage['/base/utils.js'].lineData[54] = 0;
  _$jscoverage['/base/utils.js'].lineData[55] = 0;
  _$jscoverage['/base/utils.js'].lineData[56] = 0;
  _$jscoverage['/base/utils.js'].lineData[57] = 0;
  _$jscoverage['/base/utils.js'].lineData[62] = 0;
  _$jscoverage['/base/utils.js'].lineData[63] = 0;
  _$jscoverage['/base/utils.js'].lineData[65] = 0;
  _$jscoverage['/base/utils.js'].lineData[66] = 0;
  _$jscoverage['/base/utils.js'].lineData[68] = 0;
  _$jscoverage['/base/utils.js'].lineData[71] = 0;
  _$jscoverage['/base/utils.js'].lineData[72] = 0;
  _$jscoverage['/base/utils.js'].lineData[76] = 0;
  _$jscoverage['/base/utils.js'].lineData[77] = 0;
  _$jscoverage['/base/utils.js'].lineData[79] = 0;
  _$jscoverage['/base/utils.js'].lineData[84] = 0;
  _$jscoverage['/base/utils.js'].lineData[93] = 0;
  _$jscoverage['/base/utils.js'].lineData[94] = 0;
  _$jscoverage['/base/utils.js'].lineData[98] = 0;
  _$jscoverage['/base/utils.js'].lineData[99] = 0;
  _$jscoverage['/base/utils.js'].lineData[103] = 0;
  _$jscoverage['/base/utils.js'].lineData[104] = 0;
  _$jscoverage['/base/utils.js'].lineData[105] = 0;
  _$jscoverage['/base/utils.js'].lineData[106] = 0;
  _$jscoverage['/base/utils.js'].lineData[107] = 0;
  _$jscoverage['/base/utils.js'].lineData[110] = 0;
  _$jscoverage['/base/utils.js'].lineData[113] = 0;
  _$jscoverage['/base/utils.js'].lineData[114] = 0;
  _$jscoverage['/base/utils.js'].lineData[115] = 0;
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
  _$jscoverage['/base/utils.js'].branchData['14'] = [];
  _$jscoverage['/base/utils.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['23'] = [];
  _$jscoverage['/base/utils.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['25'] = [];
  _$jscoverage['/base/utils.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['34'] = [];
  _$jscoverage['/base/utils.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['45'] = [];
  _$jscoverage['/base/utils.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['54'] = [];
  _$jscoverage['/base/utils.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['56'] = [];
  _$jscoverage['/base/utils.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['65'] = [];
  _$jscoverage['/base/utils.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['72'] = [];
  _$jscoverage['/base/utils.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['77'] = [];
  _$jscoverage['/base/utils.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['78'] = [];
  _$jscoverage['/base/utils.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['94'] = [];
  _$jscoverage['/base/utils.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['99'] = [];
  _$jscoverage['/base/utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['103'] = [];
  _$jscoverage['/base/utils.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['104'] = [];
  _$jscoverage['/base/utils.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['106'] = [];
  _$jscoverage['/base/utils.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['114'] = [];
  _$jscoverage['/base/utils.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['114'][3] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['114'][3].init(44, 27, 'anim.config.queue === queue');
function visit32_114_3(result) {
  _$jscoverage['/base/utils.js'].branchData['114'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['114'][2].init(21, 19, 'queue === undefined');
function visit31_114_2(result) {
  _$jscoverage['/base/utils.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['114'][1].init(21, 50, 'queue === undefined || anim.config.queue === queue');
function visit30_114_1(result) {
  _$jscoverage['/base/utils.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['106'][1].init(113, 15, 'queue !== false');
function visit29_106_1(result) {
  _$jscoverage['/base/utils.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['104'][1].init(21, 19, 'queue === undefined');
function visit28_104_1(result) {
  _$jscoverage['/base/utils.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['103'][1].init(17, 10, 'clearQueue');
function visit27_103_1(result) {
  _$jscoverage['/base/utils.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['99'][1].init(77, 42, 'allRunning && !S.isEmptyObject(allRunning)');
function visit26_99_1(result) {
  _$jscoverage['/base/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['94'][1].init(72, 34, 'paused && !S.isEmptyObject(paused)');
function visit25_94_1(result) {
  _$jscoverage['/base/utils.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['78'][1].init(38, 27, 'anim.config.queue === queue');
function visit24_78_1(result) {
  _$jscoverage['/base/utils.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['77'][2].init(17, 19, 'queue === undefined');
function visit23_77_2(result) {
  _$jscoverage['/base/utils.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['77'][1].init(17, 66, 'queue === undefined || anim.config.queue === queue');
function visit22_77_1(result) {
  _$jscoverage['/base/utils.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['72'][1].init(39, 19, 'action === \'resume\'');
function visit21_72_1(result) {
  _$jscoverage['/base/utils.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['65'][1].init(91, 6, 'paused');
function visit20_65_1(result) {
  _$jscoverage['/base/utils.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['56'][1].init(59, 23, 'S.isEmptyObject(paused)');
function visit19_56_1(result) {
  _$jscoverage['/base/utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['54'][1].init(91, 6, 'paused');
function visit18_54_1(result) {
  _$jscoverage['/base/utils.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['45'][1].init(91, 7, '!paused');
function visit17_45_1(result) {
  _$jscoverage['/base/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['34'][1].init(96, 10, 'allRunning');
function visit16_34_1(result) {
  _$jscoverage['/base/utils.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['25'][1].init(63, 27, 'S.isEmptyObject(allRunning)');
function visit15_25_1(result) {
  _$jscoverage['/base/utils.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['23'][1].init(96, 10, 'allRunning');
function visit14_23_1(result) {
  _$jscoverage['/base/utils.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['14'][1].init(96, 11, '!allRunning');
function visit13_14_1(result) {
  _$jscoverage['/base/utils.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[7]++;
  var Q = require('./queue'), Dom = require('dom');
  _$jscoverage['/base/utils.js'].lineData[9]++;
  var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[11]++;
  function saveRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[1]++;
    _$jscoverage['/base/utils.js'].lineData[12]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[14]++;
    if (visit13_14_1(!allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[15]++;
      Dom.data(node, runningKey, allRunning = {});
    }
    _$jscoverage['/base/utils.js'].lineData[17]++;
    allRunning[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[20]++;
  function removeRunningAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[2]++;
    _$jscoverage['/base/utils.js'].lineData[21]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[23]++;
    if (visit14_23_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[24]++;
      delete allRunning[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[25]++;
      if (visit15_25_1(S.isEmptyObject(allRunning))) {
        _$jscoverage['/base/utils.js'].lineData[26]++;
        Dom.removeData(node, runningKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[31]++;
  function isAnimRunning(anim) {
    _$jscoverage['/base/utils.js'].functionData[3]++;
    _$jscoverage['/base/utils.js'].lineData[32]++;
    var node = anim.node, allRunning = Dom.data(node, runningKey);
    _$jscoverage['/base/utils.js'].lineData[34]++;
    if (visit16_34_1(allRunning)) {
      _$jscoverage['/base/utils.js'].lineData[35]++;
      return !!allRunning[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[37]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[40]++;
  var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');
  _$jscoverage['/base/utils.js'].lineData[42]++;
  function savePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[4]++;
    _$jscoverage['/base/utils.js'].lineData[43]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[45]++;
    if (visit17_45_1(!paused)) {
      _$jscoverage['/base/utils.js'].lineData[46]++;
      Dom.data(node, pausedKey, paused = {});
    }
    _$jscoverage['/base/utils.js'].lineData[48]++;
    paused[S.stamp(anim)] = anim;
  }
  _$jscoverage['/base/utils.js'].lineData[51]++;
  function removePausedAnim(anim) {
    _$jscoverage['/base/utils.js'].functionData[5]++;
    _$jscoverage['/base/utils.js'].lineData[52]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[54]++;
    if (visit18_54_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[55]++;
      delete paused[S.stamp(anim)];
      _$jscoverage['/base/utils.js'].lineData[56]++;
      if (visit19_56_1(S.isEmptyObject(paused))) {
        _$jscoverage['/base/utils.js'].lineData[57]++;
        Dom.removeData(node, pausedKey);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[62]++;
  function isAnimPaused(anim) {
    _$jscoverage['/base/utils.js'].functionData[6]++;
    _$jscoverage['/base/utils.js'].lineData[63]++;
    var node = anim.node, paused = Dom.data(node, pausedKey);
    _$jscoverage['/base/utils.js'].lineData[65]++;
    if (visit20_65_1(paused)) {
      _$jscoverage['/base/utils.js'].lineData[66]++;
      return !!paused[S.stamp(anim)];
    }
    _$jscoverage['/base/utils.js'].lineData[68]++;
    return 0;
  }
  _$jscoverage['/base/utils.js'].lineData[71]++;
  function pauseOrResumeQueue(node, queue, action) {
    _$jscoverage['/base/utils.js'].functionData[7]++;
    _$jscoverage['/base/utils.js'].lineData[72]++;
    var allAnims = Dom.data(node, visit21_72_1(action === 'resume') ? pausedKey : runningKey), anims = S.merge(allAnims);
    _$jscoverage['/base/utils.js'].lineData[76]++;
    S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[8]++;
  _$jscoverage['/base/utils.js'].lineData[77]++;
  if (visit22_77_1(visit23_77_2(queue === undefined) || visit24_78_1(anim.config.queue === queue))) {
    _$jscoverage['/base/utils.js'].lineData[79]++;
    anim[action]();
  }
});
  }
  _$jscoverage['/base/utils.js'].lineData[84]++;
  return {
  saveRunningAnim: saveRunningAnim, 
  removeRunningAnim: removeRunningAnim, 
  isAnimPaused: isAnimPaused, 
  removePausedAnim: removePausedAnim, 
  savePausedAnim: savePausedAnim, 
  isAnimRunning: isAnimRunning, 
  'isElPaused': function(node) {
  _$jscoverage['/base/utils.js'].functionData[9]++;
  _$jscoverage['/base/utils.js'].lineData[93]++;
  var paused = Dom.data(node, pausedKey);
  _$jscoverage['/base/utils.js'].lineData[94]++;
  return visit25_94_1(paused && !S.isEmptyObject(paused));
}, 
  'isElRunning': function(node) {
  _$jscoverage['/base/utils.js'].functionData[10]++;
  _$jscoverage['/base/utils.js'].lineData[98]++;
  var allRunning = Dom.data(node, runningKey);
  _$jscoverage['/base/utils.js'].lineData[99]++;
  return visit26_99_1(allRunning && !S.isEmptyObject(allRunning));
}, 
  pauseOrResumeQueue: pauseOrResumeQueue, 
  stopEl: function(node, end, clearQueue, queue) {
  _$jscoverage['/base/utils.js'].functionData[11]++;
  _$jscoverage['/base/utils.js'].lineData[103]++;
  if (visit27_103_1(clearQueue)) {
    _$jscoverage['/base/utils.js'].lineData[104]++;
    if (visit28_104_1(queue === undefined)) {
      _$jscoverage['/base/utils.js'].lineData[105]++;
      Q.clearQueues(node);
    } else {
      _$jscoverage['/base/utils.js'].lineData[106]++;
      if (visit29_106_1(queue !== false)) {
        _$jscoverage['/base/utils.js'].lineData[107]++;
        Q.clearQueue(node, queue);
      }
    }
  }
  _$jscoverage['/base/utils.js'].lineData[110]++;
  var allRunning = Dom.data(node, runningKey), anims = S.merge(allRunning);
  _$jscoverage['/base/utils.js'].lineData[113]++;
  S.each(anims, function(anim) {
  _$jscoverage['/base/utils.js'].functionData[12]++;
  _$jscoverage['/base/utils.js'].lineData[114]++;
  if (visit30_114_1(visit31_114_2(queue === undefined) || visit32_114_3(anim.config.queue === queue))) {
    _$jscoverage['/base/utils.js'].lineData[115]++;
    anim.stop(end);
  }
});
}};
});
