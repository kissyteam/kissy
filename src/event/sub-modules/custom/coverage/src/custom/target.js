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
  _$jscoverage['/custom/target.js'].lineData[31] = 0;
  _$jscoverage['/custom/target.js'].lineData[36] = 0;
  _$jscoverage['/custom/target.js'].lineData[38] = 0;
  _$jscoverage['/custom/target.js'].lineData[40] = 0;
  _$jscoverage['/custom/target.js'].lineData[42] = 0;
  _$jscoverage['/custom/target.js'].lineData[44] = 0;
  _$jscoverage['/custom/target.js'].lineData[48] = 0;
  _$jscoverage['/custom/target.js'].lineData[51] = 0;
  _$jscoverage['/custom/target.js'].lineData[52] = 0;
  _$jscoverage['/custom/target.js'].lineData[55] = 0;
  _$jscoverage['/custom/target.js'].lineData[57] = 0;
  _$jscoverage['/custom/target.js'].lineData[59] = 0;
  _$jscoverage['/custom/target.js'].lineData[60] = 0;
  _$jscoverage['/custom/target.js'].lineData[68] = 0;
  _$jscoverage['/custom/target.js'].lineData[74] = 0;
  _$jscoverage['/custom/target.js'].lineData[76] = 0;
  _$jscoverage['/custom/target.js'].lineData[77] = 0;
  _$jscoverage['/custom/target.js'].lineData[82] = 0;
  _$jscoverage['/custom/target.js'].lineData[89] = 0;
  _$jscoverage['/custom/target.js'].lineData[92] = 0;
  _$jscoverage['/custom/target.js'].lineData[93] = 0;
  _$jscoverage['/custom/target.js'].lineData[94] = 0;
  _$jscoverage['/custom/target.js'].lineData[97] = 0;
  _$jscoverage['/custom/target.js'].lineData[104] = 0;
  _$jscoverage['/custom/target.js'].lineData[106] = 0;
  _$jscoverage['/custom/target.js'].lineData[107] = 0;
  _$jscoverage['/custom/target.js'].lineData[109] = 0;
  _$jscoverage['/custom/target.js'].lineData[116] = 0;
  _$jscoverage['/custom/target.js'].lineData[119] = 0;
  _$jscoverage['/custom/target.js'].lineData[120] = 0;
  _$jscoverage['/custom/target.js'].lineData[122] = 0;
  _$jscoverage['/custom/target.js'].lineData[129] = 0;
  _$jscoverage['/custom/target.js'].lineData[130] = 0;
  _$jscoverage['/custom/target.js'].lineData[131] = 0;
  _$jscoverage['/custom/target.js'].lineData[133] = 0;
  _$jscoverage['/custom/target.js'].lineData[140] = 0;
  _$jscoverage['/custom/target.js'].lineData[141] = 0;
  _$jscoverage['/custom/target.js'].lineData[142] = 0;
  _$jscoverage['/custom/target.js'].lineData[144] = 0;
  _$jscoverage['/custom/target.js'].lineData[145] = 0;
  _$jscoverage['/custom/target.js'].lineData[146] = 0;
  _$jscoverage['/custom/target.js'].lineData[147] = 0;
  _$jscoverage['/custom/target.js'].lineData[150] = 0;
  _$jscoverage['/custom/target.js'].lineData[157] = 0;
  _$jscoverage['/custom/target.js'].lineData[158] = 0;
  _$jscoverage['/custom/target.js'].lineData[159] = 0;
  _$jscoverage['/custom/target.js'].lineData[162] = 0;
  _$jscoverage['/custom/target.js'].lineData[163] = 0;
  _$jscoverage['/custom/target.js'].lineData[164] = 0;
  _$jscoverage['/custom/target.js'].lineData[165] = 0;
  _$jscoverage['/custom/target.js'].lineData[166] = 0;
  _$jscoverage['/custom/target.js'].lineData[169] = 0;
  _$jscoverage['/custom/target.js'].lineData[170] = 0;
  _$jscoverage['/custom/target.js'].lineData[171] = 0;
  _$jscoverage['/custom/target.js'].lineData[176] = 0;
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
  _$jscoverage['/custom/target.js'].branchData['34'] = [];
  _$jscoverage['/custom/target.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['36'] = [];
  _$jscoverage['/custom/target.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['51'] = [];
  _$jscoverage['/custom/target.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['55'] = [];
  _$jscoverage['/custom/target.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['57'] = [];
  _$jscoverage['/custom/target.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['59'] = [];
  _$jscoverage['/custom/target.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['76'] = [];
  _$jscoverage['/custom/target.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['106'] = [];
  _$jscoverage['/custom/target.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['119'] = [];
  _$jscoverage['/custom/target.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['130'] = [];
  _$jscoverage['/custom/target.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['131'] = [];
  _$jscoverage['/custom/target.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['146'] = [];
  _$jscoverage['/custom/target.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['163'] = [];
  _$jscoverage['/custom/target.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['165'] = [];
  _$jscoverage['/custom/target.js'].branchData['165'][1] = new BranchData();
}
_$jscoverage['/custom/target.js'].branchData['165'][1].init(124, 11, 'customEvent');
function visit50_165_1(result) {
  _$jscoverage['/custom/target.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['163'][1].init(193, 4, 'type');
function visit49_163_1(result) {
  _$jscoverage['/custom/target.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['146'][1].init(252, 11, 'customEvent');
function visit48_146_1(result) {
  _$jscoverage['/custom/target.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['131'][1].init(44, 29, 'self[KS_BUBBLE_TARGETS] || []');
function visit47_131_1(result) {
  _$jscoverage['/custom/target.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['130'][1].init(48, 9, '!readOnly');
function visit46_130_1(result) {
  _$jscoverage['/custom/target.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['119'][1].init(154, 11, 'index != -1');
function visit45_119_1(result) {
  _$jscoverage['/custom/target.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['106'][1].init(94, 34, '!S.inArray(anotherTarget, targets)');
function visit44_106_1(result) {
  _$jscoverage['/custom/target.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['76'][1].init(1358, 13, 'ret !== false');
function visit43_76_1(result) {
  _$jscoverage['/custom/target.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['59'][2].init(32, 44, 'customEventObservable.bubbles && !hasTargets');
function visit42_59_2(result) {
  _$jscoverage['/custom/target.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['59'][1].init(32, 78, 'customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles');
function visit41_59_1(result) {
  _$jscoverage['/custom/target.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['57'][1].init(28, 72, '!customEventObservable.hasObserver() && !customEventObservable.defaultFn');
function visit40_57_1(result) {
  _$jscoverage['/custom/target.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['55'][1].init(582, 21, 'customEventObservable');
function visit39_55_1(result) {
  _$jscoverage['/custom/target.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['51'][1].init(470, 37, '!customEventObservable && !hasTargets');
function visit38_51_1(result) {
  _$jscoverage['/custom/target.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['36'][1].init(196, 15, 'eventData || {}');
function visit37_36_1(result) {
  _$jscoverage['/custom/target.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['34'][1].init(127, 25, 'targets && targets.length');
function visit36_34_1(result) {
  _$jscoverage['/custom/target.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].lineData[6]++;
KISSY.add('event/custom/target', function(S, BaseEvent, CustomEventObservable) {
  _$jscoverage['/custom/target.js'].functionData[0]++;
  _$jscoverage['/custom/target.js'].lineData[7]++;
  var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, KS_BUBBLE_TARGETS = '__~ks_bubble_targets';
  _$jscoverage['/custom/target.js'].lineData[23]++;
  return {
  isTarget: 1, 
  fire: function(type, eventData) {
  _$jscoverage['/custom/target.js'].functionData[1]++;
  _$jscoverage['/custom/target.js'].lineData[31]++;
  var self = this, ret = undefined, targets = self.getTargets(1), hasTargets = visit36_34_1(targets && targets.length);
  _$jscoverage['/custom/target.js'].lineData[36]++;
  eventData = visit37_36_1(eventData || {});
  _$jscoverage['/custom/target.js'].lineData[38]++;
  splitAndRun(type, function(type) {
  _$jscoverage['/custom/target.js'].functionData[2]++;
  _$jscoverage['/custom/target.js'].lineData[40]++;
  var r2, customEventObservable;
  _$jscoverage['/custom/target.js'].lineData[42]++;
  Utils.fillGroupsForEvent(type, eventData);
  _$jscoverage['/custom/target.js'].lineData[44]++;
  type = eventData.type;
  _$jscoverage['/custom/target.js'].lineData[48]++;
  customEventObservable = CustomEventObservable.getCustomEventObservable(self, type);
  _$jscoverage['/custom/target.js'].lineData[51]++;
  if (visit38_51_1(!customEventObservable && !hasTargets)) {
    _$jscoverage['/custom/target.js'].lineData[52]++;
    return;
  }
  _$jscoverage['/custom/target.js'].lineData[55]++;
  if (visit39_55_1(customEventObservable)) {
    _$jscoverage['/custom/target.js'].lineData[57]++;
    if (visit40_57_1(!customEventObservable.hasObserver() && !customEventObservable.defaultFn)) {
      _$jscoverage['/custom/target.js'].lineData[59]++;
      if (visit41_59_1(visit42_59_2(customEventObservable.bubbles && !hasTargets) || !customEventObservable.bubbles)) {
        _$jscoverage['/custom/target.js'].lineData[60]++;
        return;
      }
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[68]++;
    customEventObservable = new CustomEventObservable({
  currentTarget: self, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[74]++;
  r2 = customEventObservable.fire(eventData);
  _$jscoverage['/custom/target.js'].lineData[76]++;
  if (visit43_76_1(ret !== false)) {
    _$jscoverage['/custom/target.js'].lineData[77]++;
    ret = r2;
  }
});
  _$jscoverage['/custom/target.js'].lineData[82]++;
  return ret;
}, 
  publish: function(type, cfg) {
  _$jscoverage['/custom/target.js'].functionData[3]++;
  _$jscoverage['/custom/target.js'].lineData[89]++;
  var customEventObservable, self = this;
  _$jscoverage['/custom/target.js'].lineData[92]++;
  splitAndRun(type, function(t) {
  _$jscoverage['/custom/target.js'].functionData[4]++;
  _$jscoverage['/custom/target.js'].lineData[93]++;
  customEventObservable = CustomEventObservable.getCustomEventObservable(self, t, 1);
  _$jscoverage['/custom/target.js'].lineData[94]++;
  S.mix(customEventObservable, cfg);
});
  _$jscoverage['/custom/target.js'].lineData[97]++;
  return self;
}, 
  addTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[5]++;
  _$jscoverage['/custom/target.js'].lineData[104]++;
  var self = this, targets = self.getTargets();
  _$jscoverage['/custom/target.js'].lineData[106]++;
  if (visit44_106_1(!S.inArray(anotherTarget, targets))) {
    _$jscoverage['/custom/target.js'].lineData[107]++;
    targets.push(anotherTarget);
  }
  _$jscoverage['/custom/target.js'].lineData[109]++;
  return self;
}, 
  removeTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[6]++;
  _$jscoverage['/custom/target.js'].lineData[116]++;
  var self = this, targets = self.getTargets(), index = S.indexOf(anotherTarget, targets);
  _$jscoverage['/custom/target.js'].lineData[119]++;
  if (visit45_119_1(index != -1)) {
    _$jscoverage['/custom/target.js'].lineData[120]++;
    targets.splice(index, 1);
  }
  _$jscoverage['/custom/target.js'].lineData[122]++;
  return self;
}, 
  getTargets: function(readOnly) {
  _$jscoverage['/custom/target.js'].functionData[7]++;
  _$jscoverage['/custom/target.js'].lineData[129]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[130]++;
  if (visit46_130_1(!readOnly)) {
    _$jscoverage['/custom/target.js'].lineData[131]++;
    self[KS_BUBBLE_TARGETS] = visit47_131_1(self[KS_BUBBLE_TARGETS] || []);
  }
  _$jscoverage['/custom/target.js'].lineData[133]++;
  return self[KS_BUBBLE_TARGETS];
}, 
  on: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[8]++;
  _$jscoverage['/custom/target.js'].lineData[140]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[141]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[9]++;
  _$jscoverage['/custom/target.js'].lineData[142]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvent;
  _$jscoverage['/custom/target.js'].lineData[144]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[145]++;
  customEvent = CustomEventObservable.getCustomEventObservable(self, type, 1);
  _$jscoverage['/custom/target.js'].lineData[146]++;
  if (visit48_146_1(customEvent)) {
    _$jscoverage['/custom/target.js'].lineData[147]++;
    customEvent.on(cfg);
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[150]++;
  return self;
}, 
  detach: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[10]++;
  _$jscoverage['/custom/target.js'].lineData[157]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[158]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[11]++;
  _$jscoverage['/custom/target.js'].lineData[159]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvents, customEvent;
  _$jscoverage['/custom/target.js'].lineData[162]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[163]++;
  if (visit49_163_1(type)) {
    _$jscoverage['/custom/target.js'].lineData[164]++;
    customEvent = CustomEventObservable.getCustomEventObservable(self, type, 1);
    _$jscoverage['/custom/target.js'].lineData[165]++;
    if (visit50_165_1(customEvent)) {
      _$jscoverage['/custom/target.js'].lineData[166]++;
      customEvent.detach(cfg);
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[169]++;
    customEvents = CustomEventObservable.getCustomEventObservables(self);
    _$jscoverage['/custom/target.js'].lineData[170]++;
    S.each(customEvents, function(customEvent) {
  _$jscoverage['/custom/target.js'].functionData[12]++;
  _$jscoverage['/custom/target.js'].lineData[171]++;
  customEvent.detach(cfg);
});
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[176]++;
  return self;
}};
}, {
  requires: ['event/base', './observable']});
