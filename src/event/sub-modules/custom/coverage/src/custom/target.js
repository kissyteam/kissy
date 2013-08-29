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
if (! _$jscoverage['/custom/target.js']) {
  _$jscoverage['/custom/target.js'] = {};
  _$jscoverage['/custom/target.js'].lineData = [];
  _$jscoverage['/custom/target.js'].lineData[6] = 0;
  _$jscoverage['/custom/target.js'].lineData[7] = 0;
  _$jscoverage['/custom/target.js'].lineData[23] = 0;
  _$jscoverage['/custom/target.js'].lineData[30] = 0;
  _$jscoverage['/custom/target.js'].lineData[35] = 0;
  _$jscoverage['/custom/target.js'].lineData[37] = 0;
  _$jscoverage['/custom/target.js'].lineData[39] = 0;
  _$jscoverage['/custom/target.js'].lineData[41] = 0;
  _$jscoverage['/custom/target.js'].lineData[43] = 0;
  _$jscoverage['/custom/target.js'].lineData[47] = 0;
  _$jscoverage['/custom/target.js'].lineData[50] = 0;
  _$jscoverage['/custom/target.js'].lineData[51] = 0;
  _$jscoverage['/custom/target.js'].lineData[54] = 0;
  _$jscoverage['/custom/target.js'].lineData[56] = 0;
  _$jscoverage['/custom/target.js'].lineData[58] = 0;
  _$jscoverage['/custom/target.js'].lineData[59] = 0;
  _$jscoverage['/custom/target.js'].lineData[67] = 0;
  _$jscoverage['/custom/target.js'].lineData[73] = 0;
  _$jscoverage['/custom/target.js'].lineData[75] = 0;
  _$jscoverage['/custom/target.js'].lineData[76] = 0;
  _$jscoverage['/custom/target.js'].lineData[81] = 0;
  _$jscoverage['/custom/target.js'].lineData[88] = 0;
  _$jscoverage['/custom/target.js'].lineData[91] = 0;
  _$jscoverage['/custom/target.js'].lineData[92] = 0;
  _$jscoverage['/custom/target.js'].lineData[93] = 0;
  _$jscoverage['/custom/target.js'].lineData[96] = 0;
  _$jscoverage['/custom/target.js'].lineData[103] = 0;
  _$jscoverage['/custom/target.js'].lineData[105] = 0;
  _$jscoverage['/custom/target.js'].lineData[106] = 0;
  _$jscoverage['/custom/target.js'].lineData[108] = 0;
  _$jscoverage['/custom/target.js'].lineData[115] = 0;
  _$jscoverage['/custom/target.js'].lineData[118] = 0;
  _$jscoverage['/custom/target.js'].lineData[119] = 0;
  _$jscoverage['/custom/target.js'].lineData[121] = 0;
  _$jscoverage['/custom/target.js'].lineData[128] = 0;
  _$jscoverage['/custom/target.js'].lineData[129] = 0;
  _$jscoverage['/custom/target.js'].lineData[130] = 0;
  _$jscoverage['/custom/target.js'].lineData[132] = 0;
  _$jscoverage['/custom/target.js'].lineData[139] = 0;
  _$jscoverage['/custom/target.js'].lineData[140] = 0;
  _$jscoverage['/custom/target.js'].lineData[141] = 0;
  _$jscoverage['/custom/target.js'].lineData[143] = 0;
  _$jscoverage['/custom/target.js'].lineData[144] = 0;
  _$jscoverage['/custom/target.js'].lineData[145] = 0;
  _$jscoverage['/custom/target.js'].lineData[146] = 0;
  _$jscoverage['/custom/target.js'].lineData[149] = 0;
  _$jscoverage['/custom/target.js'].lineData[156] = 0;
  _$jscoverage['/custom/target.js'].lineData[157] = 0;
  _$jscoverage['/custom/target.js'].lineData[158] = 0;
  _$jscoverage['/custom/target.js'].lineData[161] = 0;
  _$jscoverage['/custom/target.js'].lineData[162] = 0;
  _$jscoverage['/custom/target.js'].lineData[163] = 0;
  _$jscoverage['/custom/target.js'].lineData[164] = 0;
  _$jscoverage['/custom/target.js'].lineData[165] = 0;
  _$jscoverage['/custom/target.js'].lineData[168] = 0;
  _$jscoverage['/custom/target.js'].lineData[169] = 0;
  _$jscoverage['/custom/target.js'].lineData[170] = 0;
  _$jscoverage['/custom/target.js'].lineData[175] = 0;
}
if (! _$jscoverage['/custom/target.js'].functionData) {
  _$jscoverage['/custom/target.js'].functionData = [];
  _$jscoverage['/custom/target.js'].functionData[0] = 0;
  _$jscoverage['/custom/target.js'].functionData[1] = 0;
  _$jscoverage['/custom/target.js'].functionData[2] = 0;
  _$jscoverage['/custom/target.js'].functionData[3] = 0;
  _$jscoverage['/custom/target.js'].functionData[4] = 0;
  _$jscoverage['/custom/target.js'].functionData[5] = 0;
  _$jscoverage['/custom/target.js'].functionData[6] = 0;
  _$jscoverage['/custom/target.js'].functionData[7] = 0;
  _$jscoverage['/custom/target.js'].functionData[8] = 0;
  _$jscoverage['/custom/target.js'].functionData[9] = 0;
  _$jscoverage['/custom/target.js'].functionData[10] = 0;
  _$jscoverage['/custom/target.js'].functionData[11] = 0;
  _$jscoverage['/custom/target.js'].functionData[12] = 0;
}
if (! _$jscoverage['/custom/target.js'].branchData) {
  _$jscoverage['/custom/target.js'].branchData = {};
  _$jscoverage['/custom/target.js'].branchData['33'] = [];
  _$jscoverage['/custom/target.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['35'] = [];
  _$jscoverage['/custom/target.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['50'] = [];
  _$jscoverage['/custom/target.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['54'] = [];
  _$jscoverage['/custom/target.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['56'] = [];
  _$jscoverage['/custom/target.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['58'] = [];
  _$jscoverage['/custom/target.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['75'] = [];
  _$jscoverage['/custom/target.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['105'] = [];
  _$jscoverage['/custom/target.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['118'] = [];
  _$jscoverage['/custom/target.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['129'] = [];
  _$jscoverage['/custom/target.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['130'] = [];
  _$jscoverage['/custom/target.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['145'] = [];
  _$jscoverage['/custom/target.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['162'] = [];
  _$jscoverage['/custom/target.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['164'] = [];
  _$jscoverage['/custom/target.js'].branchData['164'][1] = new BranchData();
}
_$jscoverage['/custom/target.js'].branchData['164'][1].init(124, 11, 'customEvent');
function visit57_164_1(result) {
  _$jscoverage['/custom/target.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['162'][1].init(193, 4, 'type');
function visit56_162_1(result) {
  _$jscoverage['/custom/target.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['145'][1].init(252, 11, 'customEvent');
function visit55_145_1(result) {
  _$jscoverage['/custom/target.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['130'][1].init(44, 29, 'self[KS_BUBBLE_TARGETS] || []');
function visit54_130_1(result) {
  _$jscoverage['/custom/target.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['129'][1].init(48, 9, '!readOnly');
function visit53_129_1(result) {
  _$jscoverage['/custom/target.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['118'][1].init(154, 11, 'index != -1');
function visit52_118_1(result) {
  _$jscoverage['/custom/target.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['105'][1].init(94, 34, '!S.inArray(anotherTarget, targets)');
function visit51_105_1(result) {
  _$jscoverage['/custom/target.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['75'][3].init(1375, 16, 'r2 !== undefined');
function visit50_75_3(result) {
  _$jscoverage['/custom/target.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['75'][2].init(1358, 13, 'ret !== false');
function visit49_75_2(result) {
  _$jscoverage['/custom/target.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['75'][1].init(1358, 33, 'ret !== false && r2 !== undefined');
function visit48_75_1(result) {
  _$jscoverage['/custom/target.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['58'][2].init(32, 44, 'customEventObservable.bubbles && !hasTargets');
function visit47_58_2(result) {
  _$jscoverage['/custom/target.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['58'][1].init(32, 78, 'customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles');
function visit46_58_1(result) {
  _$jscoverage['/custom/target.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['56'][1].init(28, 72, '!customEventObservable.hasObserver() && !customEventObservable.defaultFn');
function visit45_56_1(result) {
  _$jscoverage['/custom/target.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['54'][1].init(582, 21, 'customEventObservable');
function visit44_54_1(result) {
  _$jscoverage['/custom/target.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['50'][1].init(470, 37, '!customEventObservable && !hasTargets');
function visit43_50_1(result) {
  _$jscoverage['/custom/target.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['35'][1].init(196, 15, 'eventData || {}');
function visit42_35_1(result) {
  _$jscoverage['/custom/target.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['33'][1].init(127, 25, 'targets && targets.length');
function visit41_33_1(result) {
  _$jscoverage['/custom/target.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].lineData[6]++;
KISSY.add('event/custom/target', function(S, BaseEvent, CustomEventObservable) {
  _$jscoverage['/custom/target.js'].functionData[0]++;
  _$jscoverage['/custom/target.js'].lineData[7]++;
  var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, undefined = undefined, KS_BUBBLE_TARGETS = '__~ks_bubble_targets';
  _$jscoverage['/custom/target.js'].lineData[23]++;
  return {
  isTarget: 1, 
  fire: function(type, eventData) {
  _$jscoverage['/custom/target.js'].functionData[1]++;
  _$jscoverage['/custom/target.js'].lineData[30]++;
  var self = this, ret = undefined, targets = self.getTargets(1), hasTargets = visit41_33_1(targets && targets.length);
  _$jscoverage['/custom/target.js'].lineData[35]++;
  eventData = visit42_35_1(eventData || {});
  _$jscoverage['/custom/target.js'].lineData[37]++;
  splitAndRun(type, function(type) {
  _$jscoverage['/custom/target.js'].functionData[2]++;
  _$jscoverage['/custom/target.js'].lineData[39]++;
  var r2, customEventObservable;
  _$jscoverage['/custom/target.js'].lineData[41]++;
  Utils.fillGroupsForEvent(type, eventData);
  _$jscoverage['/custom/target.js'].lineData[43]++;
  type = eventData.type;
  _$jscoverage['/custom/target.js'].lineData[47]++;
  customEventObservable = CustomEventObservable.getCustomEventObservable(self, type);
  _$jscoverage['/custom/target.js'].lineData[50]++;
  if (visit43_50_1(!customEventObservable && !hasTargets)) {
    _$jscoverage['/custom/target.js'].lineData[51]++;
    return;
  }
  _$jscoverage['/custom/target.js'].lineData[54]++;
  if (visit44_54_1(customEventObservable)) {
    _$jscoverage['/custom/target.js'].lineData[56]++;
    if (visit45_56_1(!customEventObservable.hasObserver() && !customEventObservable.defaultFn)) {
      _$jscoverage['/custom/target.js'].lineData[58]++;
      if (visit46_58_1(visit47_58_2(customEventObservable.bubbles && !hasTargets) || !customEventObservable.bubbles)) {
        _$jscoverage['/custom/target.js'].lineData[59]++;
        return;
      }
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[67]++;
    customEventObservable = new CustomEventObservable({
  currentTarget: self, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[73]++;
  r2 = customEventObservable.fire(eventData);
  _$jscoverage['/custom/target.js'].lineData[75]++;
  if (visit48_75_1(visit49_75_2(ret !== false) && visit50_75_3(r2 !== undefined))) {
    _$jscoverage['/custom/target.js'].lineData[76]++;
    ret = r2;
  }
});
  _$jscoverage['/custom/target.js'].lineData[81]++;
  return ret;
}, 
  publish: function(type, cfg) {
  _$jscoverage['/custom/target.js'].functionData[3]++;
  _$jscoverage['/custom/target.js'].lineData[88]++;
  var customEventObservable, self = this;
  _$jscoverage['/custom/target.js'].lineData[91]++;
  splitAndRun(type, function(t) {
  _$jscoverage['/custom/target.js'].functionData[4]++;
  _$jscoverage['/custom/target.js'].lineData[92]++;
  customEventObservable = CustomEventObservable.getCustomEventObservable(self, t, 1);
  _$jscoverage['/custom/target.js'].lineData[93]++;
  S.mix(customEventObservable, cfg);
});
  _$jscoverage['/custom/target.js'].lineData[96]++;
  return self;
}, 
  addTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[5]++;
  _$jscoverage['/custom/target.js'].lineData[103]++;
  var self = this, targets = self.getTargets();
  _$jscoverage['/custom/target.js'].lineData[105]++;
  if (visit51_105_1(!S.inArray(anotherTarget, targets))) {
    _$jscoverage['/custom/target.js'].lineData[106]++;
    targets.push(anotherTarget);
  }
  _$jscoverage['/custom/target.js'].lineData[108]++;
  return self;
}, 
  removeTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[6]++;
  _$jscoverage['/custom/target.js'].lineData[115]++;
  var self = this, targets = self.getTargets(), index = S.indexOf(anotherTarget, targets);
  _$jscoverage['/custom/target.js'].lineData[118]++;
  if (visit52_118_1(index != -1)) {
    _$jscoverage['/custom/target.js'].lineData[119]++;
    targets.splice(index, 1);
  }
  _$jscoverage['/custom/target.js'].lineData[121]++;
  return self;
}, 
  getTargets: function(readOnly) {
  _$jscoverage['/custom/target.js'].functionData[7]++;
  _$jscoverage['/custom/target.js'].lineData[128]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[129]++;
  if (visit53_129_1(!readOnly)) {
    _$jscoverage['/custom/target.js'].lineData[130]++;
    self[KS_BUBBLE_TARGETS] = visit54_130_1(self[KS_BUBBLE_TARGETS] || []);
  }
  _$jscoverage['/custom/target.js'].lineData[132]++;
  return self[KS_BUBBLE_TARGETS];
}, 
  on: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[8]++;
  _$jscoverage['/custom/target.js'].lineData[139]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[140]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[9]++;
  _$jscoverage['/custom/target.js'].lineData[141]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvent;
  _$jscoverage['/custom/target.js'].lineData[143]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[144]++;
  customEvent = CustomEventObservable.getCustomEventObservable(self, type, 1);
  _$jscoverage['/custom/target.js'].lineData[145]++;
  if (visit55_145_1(customEvent)) {
    _$jscoverage['/custom/target.js'].lineData[146]++;
    customEvent.on(cfg);
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[149]++;
  return self;
}, 
  detach: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[10]++;
  _$jscoverage['/custom/target.js'].lineData[156]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[157]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[11]++;
  _$jscoverage['/custom/target.js'].lineData[158]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvents, customEvent;
  _$jscoverage['/custom/target.js'].lineData[161]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[162]++;
  if (visit56_162_1(type)) {
    _$jscoverage['/custom/target.js'].lineData[163]++;
    customEvent = CustomEventObservable.getCustomEventObservable(self, type, 1);
    _$jscoverage['/custom/target.js'].lineData[164]++;
    if (visit57_164_1(customEvent)) {
      _$jscoverage['/custom/target.js'].lineData[165]++;
      customEvent.detach(cfg);
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[168]++;
    customEvents = CustomEventObservable.getCustomEventObservables(self);
    _$jscoverage['/custom/target.js'].lineData[169]++;
    S.each(customEvents, function(customEvent) {
  _$jscoverage['/custom/target.js'].functionData[12]++;
  _$jscoverage['/custom/target.js'].lineData[170]++;
  customEvent.detach(cfg);
});
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[175]++;
  return self;
}};
}, {
  requires: ['event/base', './observable']});
