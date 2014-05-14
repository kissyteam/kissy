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
  _$jscoverage['/node/anim.js'].lineData[13] = 0;
  _$jscoverage['/node/anim.js'].lineData[15] = 0;
  _$jscoverage['/node/anim.js'].lineData[24] = 0;
  _$jscoverage['/node/anim.js'].lineData[25] = 0;
  _$jscoverage['/node/anim.js'].lineData[27] = 0;
  _$jscoverage['/node/anim.js'].lineData[28] = 0;
  _$jscoverage['/node/anim.js'].lineData[30] = 0;
  _$jscoverage['/node/anim.js'].lineData[31] = 0;
  _$jscoverage['/node/anim.js'].lineData[33] = 0;
  _$jscoverage['/node/anim.js'].lineData[36] = 0;
  _$jscoverage['/node/anim.js'].lineData[43] = 0;
  _$jscoverage['/node/anim.js'].lineData[47] = 0;
  _$jscoverage['/node/anim.js'].lineData[48] = 0;
  _$jscoverage['/node/anim.js'].lineData[49] = 0;
  _$jscoverage['/node/anim.js'].lineData[50] = 0;
  _$jscoverage['/node/anim.js'].lineData[52] = 0;
  _$jscoverage['/node/anim.js'].lineData[53] = 0;
  _$jscoverage['/node/anim.js'].lineData[54] = 0;
  _$jscoverage['/node/anim.js'].lineData[58] = 0;
  _$jscoverage['/node/anim.js'].lineData[59] = 0;
  _$jscoverage['/node/anim.js'].lineData[60] = 0;
  _$jscoverage['/node/anim.js'].lineData[62] = 0;
  _$jscoverage['/node/anim.js'].lineData[63] = 0;
  _$jscoverage['/node/anim.js'].lineData[64] = 0;
  _$jscoverage['/node/anim.js'].lineData[66] = 0;
  _$jscoverage['/node/anim.js'].lineData[69] = 0;
  _$jscoverage['/node/anim.js'].lineData[80] = 0;
  _$jscoverage['/node/anim.js'].lineData[81] = 0;
  _$jscoverage['/node/anim.js'].lineData[82] = 0;
  _$jscoverage['/node/anim.js'].lineData[84] = 0;
  _$jscoverage['/node/anim.js'].lineData[94] = 0;
  _$jscoverage['/node/anim.js'].lineData[95] = 0;
  _$jscoverage['/node/anim.js'].lineData[96] = 0;
  _$jscoverage['/node/anim.js'].lineData[98] = 0;
  _$jscoverage['/node/anim.js'].lineData[108] = 0;
  _$jscoverage['/node/anim.js'].lineData[109] = 0;
  _$jscoverage['/node/anim.js'].lineData[110] = 0;
  _$jscoverage['/node/anim.js'].lineData[112] = 0;
  _$jscoverage['/node/anim.js'].lineData[120] = 0;
  _$jscoverage['/node/anim.js'].lineData[121] = 0;
  _$jscoverage['/node/anim.js'].lineData[122] = 0;
  _$jscoverage['/node/anim.js'].lineData[123] = 0;
  _$jscoverage['/node/anim.js'].lineData[126] = 0;
  _$jscoverage['/node/anim.js'].lineData[134] = 0;
  _$jscoverage['/node/anim.js'].lineData[135] = 0;
  _$jscoverage['/node/anim.js'].lineData[136] = 0;
  _$jscoverage['/node/anim.js'].lineData[137] = 0;
  _$jscoverage['/node/anim.js'].lineData[140] = 0;
  _$jscoverage['/node/anim.js'].lineData[234] = 0;
  _$jscoverage['/node/anim.js'].lineData[246] = 0;
  _$jscoverage['/node/anim.js'].lineData[247] = 0;
  _$jscoverage['/node/anim.js'].lineData[249] = 0;
  _$jscoverage['/node/anim.js'].lineData[250] = 0;
  _$jscoverage['/node/anim.js'].lineData[252] = 0;
  _$jscoverage['/node/anim.js'].lineData[253] = 0;
  _$jscoverage['/node/anim.js'].lineData[254] = 0;
  _$jscoverage['/node/anim.js'].lineData[256] = 0;
  _$jscoverage['/node/anim.js'].lineData[257] = 0;
  _$jscoverage['/node/anim.js'].lineData[260] = 0;
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
}
if (! _$jscoverage['/node/anim.js'].branchData) {
  _$jscoverage['/node/anim.js'].branchData = {};
  _$jscoverage['/node/anim.js'].branchData['27'] = [];
  _$jscoverage['/node/anim.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['30'] = [];
  _$jscoverage['/node/anim.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['45'] = [];
  _$jscoverage['/node/anim.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['49'] = [];
  _$jscoverage['/node/anim.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['50'] = [];
  _$jscoverage['/node/anim.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['53'] = [];
  _$jscoverage['/node/anim.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['54'] = [];
  _$jscoverage['/node/anim.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['58'] = [];
  _$jscoverage['/node/anim.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['62'] = [];
  _$jscoverage['/node/anim.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['121'] = [];
  _$jscoverage['/node/anim.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['122'] = [];
  _$jscoverage['/node/anim.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['135'] = [];
  _$jscoverage['/node/anim.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['136'] = [];
  _$jscoverage['/node/anim.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['249'] = [];
  _$jscoverage['/node/anim.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['253'] = [];
  _$jscoverage['/node/anim.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/node/anim.js'].branchData['254'] = [];
  _$jscoverage['/node/anim.js'].branchData['254'][1] = new BranchData();
}
_$jscoverage['/node/anim.js'].branchData['254'][1].init(44, 21, 'duration.Anim || Anim');
function visit17_254_1(result) {
  _$jscoverage['/node/anim.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['253'][1].init(75, 28, 'typeof duration === \'object\'');
function visit16_253_1(result) {
  _$jscoverage['/node/anim.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['249'][1].init(96, 19, 'Dom[k] && !duration');
function visit15_249_1(result) {
  _$jscoverage['/node/anim.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['136'][1].init(22, 22, 'Anim.isPaused(self[i])');
function visit14_136_1(result) {
  _$jscoverage['/node/anim.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['135'][1].init(60, 15, 'i < self.length');
function visit13_135_1(result) {
  _$jscoverage['/node/anim.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['122'][1].init(22, 23, 'Anim.isRunning(self[i])');
function visit12_122_1(result) {
  _$jscoverage['/node/anim.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['121'][1].init(60, 15, 'i < self.length');
function visit11_121_1(result) {
  _$jscoverage['/node/anim.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['62'][1].init(173, 7, 'arg0.to');
function visit10_62_1(result) {
  _$jscoverage['/node/anim.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['58'][1].init(537, 5, 'i < l');
function visit9_58_1(result) {
  _$jscoverage['/node/anim.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['54'][1].init(40, 16, 'cfg.Anim || Anim');
function visit8_54_1(result) {
  _$jscoverage['/node/anim.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['53'][1].init(60, 3, 'cfg');
function visit7_53_1(result) {
  _$jscoverage['/node/anim.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['50'][1].init(36, 16, 'cfg.Anim || Anim');
function visit6_50_1(result) {
  _$jscoverage['/node/anim.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['49'][1].init(264, 6, 'cfg.to');
function visit5_49_1(result) {
  _$jscoverage['/node/anim.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['45'][1].init(79, 15, 'self.length > 1');
function visit4_45_1(result) {
  _$jscoverage['/node/anim.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['30'][1].init(169, 14, 'i < ret.length');
function visit3_30_1(result) {
  _$jscoverage['/node/anim.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['27'][2].init(80, 7, 'i < num');
function visit2_27_2(result) {
  _$jscoverage['/node/anim.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/node/anim.js'].branchData['27'][1].init(69, 9, 'from || 0');
function visit1_27_1(result) {
  _$jscoverage['/node/anim.js'].branchData['27'][1].ranCondition(result);
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
  _$jscoverage['/node/anim.js'].lineData[13]++;
  var util = require('util');
  _$jscoverage['/node/anim.js'].lineData[15]++;
  var FX = [['height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'], ['width', 'margin-left', 'margin-right', 'padding-left', 'padding-right'], ['opacity']];
  _$jscoverage['/node/anim.js'].lineData[24]++;
  function getFxs(type, num, from) {
    _$jscoverage['/node/anim.js'].functionData[1]++;
    _$jscoverage['/node/anim.js'].lineData[25]++;
    var ret = [], obj = {};
    _$jscoverage['/node/anim.js'].lineData[27]++;
    for (var i = visit1_27_1(from || 0); visit2_27_2(i < num); i++) {
      _$jscoverage['/node/anim.js'].lineData[28]++;
      ret.push.apply(ret, FX[i]);
    }
    _$jscoverage['/node/anim.js'].lineData[30]++;
    for (i = 0; visit3_30_1(i < ret.length); i++) {
      _$jscoverage['/node/anim.js'].lineData[31]++;
      obj[ret[i]] = type;
    }
    _$jscoverage['/node/anim.js'].lineData[33]++;
    return obj;
  }
  _$jscoverage['/node/anim.js'].lineData[36]++;
  util.augment(Node, {
  animate: function() {
  _$jscoverage['/node/anim.js'].functionData[2]++;
  _$jscoverage['/node/anim.js'].lineData[43]++;
  var self = this, l = self.length, needClone = visit4_45_1(self.length > 1), originArgs = util.makeArray(arguments);
  _$jscoverage['/node/anim.js'].lineData[47]++;
  var cfg = originArgs[0];
  _$jscoverage['/node/anim.js'].lineData[48]++;
  var AnimConstructor = Anim;
  _$jscoverage['/node/anim.js'].lineData[49]++;
  if (visit5_49_1(cfg.to)) {
    _$jscoverage['/node/anim.js'].lineData[50]++;
    AnimConstructor = visit6_50_1(cfg.Anim || Anim);
  } else {
    _$jscoverage['/node/anim.js'].lineData[52]++;
    cfg = originArgs[1];
    _$jscoverage['/node/anim.js'].lineData[53]++;
    if (visit7_53_1(cfg)) {
      _$jscoverage['/node/anim.js'].lineData[54]++;
      AnimConstructor = visit8_54_1(cfg.Anim || Anim);
    }
  }
  _$jscoverage['/node/anim.js'].lineData[58]++;
  for (var i = 0; visit9_58_1(i < l); i++) {
    _$jscoverage['/node/anim.js'].lineData[59]++;
    var elem = self[i];
    _$jscoverage['/node/anim.js'].lineData[60]++;
    var args = needClone ? util.clone(originArgs) : originArgs, arg0 = args[0];
    _$jscoverage['/node/anim.js'].lineData[62]++;
    if (visit10_62_1(arg0.to)) {
      _$jscoverage['/node/anim.js'].lineData[63]++;
      arg0.node = elem;
      _$jscoverage['/node/anim.js'].lineData[64]++;
      new AnimConstructor(arg0).run();
    } else {
      _$jscoverage['/node/anim.js'].lineData[66]++;
      AnimConstructor.apply(undefined, [elem].concat(args)).run();
    }
  }
  _$jscoverage['/node/anim.js'].lineData[69]++;
  return self;
}, 
  stop: function(end, clearQueue, queue) {
  _$jscoverage['/node/anim.js'].functionData[3]++;
  _$jscoverage['/node/anim.js'].lineData[80]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[81]++;
  util.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[4]++;
  _$jscoverage['/node/anim.js'].lineData[82]++;
  Anim.stop(elem, end, clearQueue, queue);
});
  _$jscoverage['/node/anim.js'].lineData[84]++;
  return self;
}, 
  pause: function(end, queue) {
  _$jscoverage['/node/anim.js'].functionData[5]++;
  _$jscoverage['/node/anim.js'].lineData[94]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[95]++;
  util.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[6]++;
  _$jscoverage['/node/anim.js'].lineData[96]++;
  Anim.pause(elem, queue);
});
  _$jscoverage['/node/anim.js'].lineData[98]++;
  return self;
}, 
  resume: function(end, queue) {
  _$jscoverage['/node/anim.js'].functionData[7]++;
  _$jscoverage['/node/anim.js'].lineData[108]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[109]++;
  util.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[8]++;
  _$jscoverage['/node/anim.js'].lineData[110]++;
  Anim.resume(elem, queue);
});
  _$jscoverage['/node/anim.js'].lineData[112]++;
  return self;
}, 
  isRunning: function() {
  _$jscoverage['/node/anim.js'].functionData[9]++;
  _$jscoverage['/node/anim.js'].lineData[120]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[121]++;
  for (var i = 0; visit11_121_1(i < self.length); i++) {
    _$jscoverage['/node/anim.js'].lineData[122]++;
    if (visit12_122_1(Anim.isRunning(self[i]))) {
      _$jscoverage['/node/anim.js'].lineData[123]++;
      return true;
    }
  }
  _$jscoverage['/node/anim.js'].lineData[126]++;
  return false;
}, 
  isPaused: function() {
  _$jscoverage['/node/anim.js'].functionData[10]++;
  _$jscoverage['/node/anim.js'].lineData[134]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[135]++;
  for (var i = 0; visit13_135_1(i < self.length); i++) {
    _$jscoverage['/node/anim.js'].lineData[136]++;
    if (visit14_136_1(Anim.isPaused(self[i]))) {
      _$jscoverage['/node/anim.js'].lineData[137]++;
      return true;
    }
  }
  _$jscoverage['/node/anim.js'].lineData[140]++;
  return false;
}});
  _$jscoverage['/node/anim.js'].lineData[234]++;
  util.each({
  show: getFxs('show', 3), 
  hide: getFxs('hide', 3), 
  toggle: getFxs('toggle', 3), 
  fadeIn: getFxs('show', 3, 2), 
  fadeOut: getFxs('hide', 3, 2), 
  fadeToggle: getFxs('toggle', 3, 2), 
  slideDown: getFxs('show', 1), 
  slideUp: getFxs('hide', 1), 
  slideToggle: getFxs('toggle', 1)}, function(v, k) {
  _$jscoverage['/node/anim.js'].functionData[11]++;
  _$jscoverage['/node/anim.js'].lineData[246]++;
  Node.prototype[k] = function(duration, complete, easing) {
  _$jscoverage['/node/anim.js'].functionData[12]++;
  _$jscoverage['/node/anim.js'].lineData[247]++;
  var self = this;
  _$jscoverage['/node/anim.js'].lineData[249]++;
  if (visit15_249_1(Dom[k] && !duration)) {
    _$jscoverage['/node/anim.js'].lineData[250]++;
    Dom[k](self);
  } else {
    _$jscoverage['/node/anim.js'].lineData[252]++;
    var AnimConstructor = Anim;
    _$jscoverage['/node/anim.js'].lineData[253]++;
    if (visit16_253_1(typeof duration === 'object')) {
      _$jscoverage['/node/anim.js'].lineData[254]++;
      AnimConstructor = visit17_254_1(duration.Anim || Anim);
    }
    _$jscoverage['/node/anim.js'].lineData[256]++;
    util.each(self, function(elem) {
  _$jscoverage['/node/anim.js'].functionData[13]++;
  _$jscoverage['/node/anim.js'].lineData[257]++;
  new AnimConstructor(elem, v, duration, easing, complete).run();
});
  }
  _$jscoverage['/node/anim.js'].lineData[260]++;
  return self;
};
});
});
