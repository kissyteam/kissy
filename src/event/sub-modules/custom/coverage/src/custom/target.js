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
  _$jscoverage['/custom/target.js'].lineData[8] = 0;
  _$jscoverage['/custom/target.js'].lineData[10] = 0;
  _$jscoverage['/custom/target.js'].lineData[39] = 0;
  _$jscoverage['/custom/target.js'].lineData[41] = 0;
  _$jscoverage['/custom/target.js'].lineData[52] = 0;
  _$jscoverage['/custom/target.js'].lineData[55] = 0;
  _$jscoverage['/custom/target.js'].lineData[56] = 0;
  _$jscoverage['/custom/target.js'].lineData[57] = 0;
  _$jscoverage['/custom/target.js'].lineData[62] = 0;
  _$jscoverage['/custom/target.js'].lineData[75] = 0;
  _$jscoverage['/custom/target.js'].lineData[80] = 0;
  _$jscoverage['/custom/target.js'].lineData[82] = 0;
  _$jscoverage['/custom/target.js'].lineData[84] = 0;
  _$jscoverage['/custom/target.js'].lineData[86] = 0;
  _$jscoverage['/custom/target.js'].lineData[88] = 0;
  _$jscoverage['/custom/target.js'].lineData[92] = 0;
  _$jscoverage['/custom/target.js'].lineData[95] = 0;
  _$jscoverage['/custom/target.js'].lineData[96] = 0;
  _$jscoverage['/custom/target.js'].lineData[99] = 0;
  _$jscoverage['/custom/target.js'].lineData[101] = 0;
  _$jscoverage['/custom/target.js'].lineData[103] = 0;
  _$jscoverage['/custom/target.js'].lineData[104] = 0;
  _$jscoverage['/custom/target.js'].lineData[112] = 0;
  _$jscoverage['/custom/target.js'].lineData[118] = 0;
  _$jscoverage['/custom/target.js'].lineData[120] = 0;
  _$jscoverage['/custom/target.js'].lineData[121] = 0;
  _$jscoverage['/custom/target.js'].lineData[126] = 0;
  _$jscoverage['/custom/target.js'].lineData[139] = 0;
  _$jscoverage['/custom/target.js'].lineData[142] = 0;
  _$jscoverage['/custom/target.js'].lineData[143] = 0;
  _$jscoverage['/custom/target.js'].lineData[144] = 0;
  _$jscoverage['/custom/target.js'].lineData[147] = 0;
  _$jscoverage['/custom/target.js'].lineData[157] = 0;
  _$jscoverage['/custom/target.js'].lineData[159] = 0;
  _$jscoverage['/custom/target.js'].lineData[160] = 0;
  _$jscoverage['/custom/target.js'].lineData[162] = 0;
  _$jscoverage['/custom/target.js'].lineData[172] = 0;
  _$jscoverage['/custom/target.js'].lineData[175] = 0;
  _$jscoverage['/custom/target.js'].lineData[176] = 0;
  _$jscoverage['/custom/target.js'].lineData[178] = 0;
  _$jscoverage['/custom/target.js'].lineData[187] = 0;
  _$jscoverage['/custom/target.js'].lineData[191] = 0;
  _$jscoverage['/custom/target.js'].lineData[203] = 0;
  _$jscoverage['/custom/target.js'].lineData[204] = 0;
  _$jscoverage['/custom/target.js'].lineData[205] = 0;
  _$jscoverage['/custom/target.js'].lineData[207] = 0;
  _$jscoverage['/custom/target.js'].lineData[208] = 0;
  _$jscoverage['/custom/target.js'].lineData[209] = 0;
  _$jscoverage['/custom/target.js'].lineData[210] = 0;
  _$jscoverage['/custom/target.js'].lineData[213] = 0;
  _$jscoverage['/custom/target.js'].lineData[225] = 0;
  _$jscoverage['/custom/target.js'].lineData[226] = 0;
  _$jscoverage['/custom/target.js'].lineData[227] = 0;
  _$jscoverage['/custom/target.js'].lineData[230] = 0;
  _$jscoverage['/custom/target.js'].lineData[231] = 0;
  _$jscoverage['/custom/target.js'].lineData[232] = 0;
  _$jscoverage['/custom/target.js'].lineData[233] = 0;
  _$jscoverage['/custom/target.js'].lineData[234] = 0;
  _$jscoverage['/custom/target.js'].lineData[237] = 0;
  _$jscoverage['/custom/target.js'].lineData[238] = 0;
  _$jscoverage['/custom/target.js'].lineData[239] = 0;
  _$jscoverage['/custom/target.js'].lineData[244] = 0;
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
  _$jscoverage['/custom/target.js'].functionData[13] = 0;
  _$jscoverage['/custom/target.js'].functionData[14] = 0;
}
if (! _$jscoverage['/custom/target.js'].branchData) {
  _$jscoverage['/custom/target.js'].branchData = {};
  _$jscoverage['/custom/target.js'].branchData['55'] = [];
  _$jscoverage['/custom/target.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['56'] = [];
  _$jscoverage['/custom/target.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['78'] = [];
  _$jscoverage['/custom/target.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['80'] = [];
  _$jscoverage['/custom/target.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['95'] = [];
  _$jscoverage['/custom/target.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['99'] = [];
  _$jscoverage['/custom/target.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['101'] = [];
  _$jscoverage['/custom/target.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['103'] = [];
  _$jscoverage['/custom/target.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['120'] = [];
  _$jscoverage['/custom/target.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['120'][3] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['159'] = [];
  _$jscoverage['/custom/target.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['175'] = [];
  _$jscoverage['/custom/target.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['187'] = [];
  _$jscoverage['/custom/target.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['191'] = [];
  _$jscoverage['/custom/target.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['209'] = [];
  _$jscoverage['/custom/target.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['231'] = [];
  _$jscoverage['/custom/target.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['233'] = [];
  _$jscoverage['/custom/target.js'].branchData['233'][1] = new BranchData();
}
_$jscoverage['/custom/target.js'].branchData['233'][1].init(102, 11, 'customEvent');
function visit56_233_1(result) {
  _$jscoverage['/custom/target.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['231'][1].init(188, 4, 'type');
function visit55_231_1(result) {
  _$jscoverage['/custom/target.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['209'][1].init(227, 11, 'customEvent');
function visit54_209_1(result) {
  _$jscoverage['/custom/target.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['191'][1].init(20, 55, 'this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {})');
function visit53_191_1(result) {
  _$jscoverage['/custom/target.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['187'][1].init(20, 57, 'this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = [])');
function visit52_187_1(result) {
  _$jscoverage['/custom/target.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['175'][1].init(150, 11, 'index != -1');
function visit51_175_1(result) {
  _$jscoverage['/custom/target.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['159'][1].init(91, 34, '!S.inArray(anotherTarget, targets)');
function visit50_159_1(result) {
  _$jscoverage['/custom/target.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['120'][3].init(1314, 16, 'r2 !== undefined');
function visit49_120_3(result) {
  _$jscoverage['/custom/target.js'].branchData['120'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['120'][2].init(1297, 13, 'ret !== false');
function visit48_120_2(result) {
  _$jscoverage['/custom/target.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['120'][1].init(1297, 33, 'ret !== false && r2 !== undefined');
function visit47_120_1(result) {
  _$jscoverage['/custom/target.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['103'][2].init(30, 44, 'customEventObservable.bubbles && !hasTargets');
function visit46_103_2(result) {
  _$jscoverage['/custom/target.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['103'][1].init(30, 78, 'customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles');
function visit45_103_1(result) {
  _$jscoverage['/custom/target.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['101'][1].init(26, 72, '!customEventObservable.hasObserver() && !customEventObservable.defaultFn');
function visit44_101_1(result) {
  _$jscoverage['/custom/target.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['99'][1].init(542, 21, 'customEventObservable');
function visit43_99_1(result) {
  _$jscoverage['/custom/target.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['95'][1].init(434, 37, '!customEventObservable && !hasTargets');
function visit42_95_1(result) {
  _$jscoverage['/custom/target.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['80'][1].init(189, 15, 'eventData || {}');
function visit41_80_1(result) {
  _$jscoverage['/custom/target.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['78'][1].init(123, 25, 'targets && targets.length');
function visit40_78_1(result) {
  _$jscoverage['/custom/target.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['56'][1].init(226, 22, '!customEvent && create');
function visit39_56_1(result) {
  _$jscoverage['/custom/target.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['55'][1].init(154, 54, 'customEventObservables && customEventObservables[type]');
function visit38_55_1(result) {
  _$jscoverage['/custom/target.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/custom/target.js'].functionData[0]++;
  _$jscoverage['/custom/target.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/custom/target.js'].lineData[8]++;
  var CustomEventObservable = require('./observable');
  _$jscoverage['/custom/target.js'].lineData[10]++;
  var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, undefined = undefined, KS_BUBBLE_TARGETS = '__~ks_bubble_targets';
  _$jscoverage['/custom/target.js'].lineData[39]++;
  var KS_CUSTOM_EVENTS = '__~ks_custom_events';
  _$jscoverage['/custom/target.js'].lineData[41]++;
  return {
  isTarget: 1, 
  getCustomEventObservable: function(type, create) {
  _$jscoverage['/custom/target.js'].functionData[1]++;
  _$jscoverage['/custom/target.js'].lineData[52]++;
  var target = this, customEvent, customEventObservables = target.getCustomEvents();
  _$jscoverage['/custom/target.js'].lineData[55]++;
  customEvent = visit38_55_1(customEventObservables && customEventObservables[type]);
  _$jscoverage['/custom/target.js'].lineData[56]++;
  if (visit39_56_1(!customEvent && create)) {
    _$jscoverage['/custom/target.js'].lineData[57]++;
    customEvent = customEventObservables[type] = new CustomEventObservable({
  currentTarget: target, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[62]++;
  return customEvent;
}, 
  fire: function(type, eventData) {
  _$jscoverage['/custom/target.js'].functionData[2]++;
  _$jscoverage['/custom/target.js'].lineData[75]++;
  var self = this, ret = undefined, targets = self.getTargets(), hasTargets = visit40_78_1(targets && targets.length);
  _$jscoverage['/custom/target.js'].lineData[80]++;
  eventData = visit41_80_1(eventData || {});
  _$jscoverage['/custom/target.js'].lineData[82]++;
  splitAndRun(type, function(type) {
  _$jscoverage['/custom/target.js'].functionData[3]++;
  _$jscoverage['/custom/target.js'].lineData[84]++;
  var r2, customEventObservable;
  _$jscoverage['/custom/target.js'].lineData[86]++;
  Utils.fillGroupsForEvent(type, eventData);
  _$jscoverage['/custom/target.js'].lineData[88]++;
  type = eventData.type;
  _$jscoverage['/custom/target.js'].lineData[92]++;
  customEventObservable = self.getCustomEventObservable(type);
  _$jscoverage['/custom/target.js'].lineData[95]++;
  if (visit42_95_1(!customEventObservable && !hasTargets)) {
    _$jscoverage['/custom/target.js'].lineData[96]++;
    return;
  }
  _$jscoverage['/custom/target.js'].lineData[99]++;
  if (visit43_99_1(customEventObservable)) {
    _$jscoverage['/custom/target.js'].lineData[101]++;
    if (visit44_101_1(!customEventObservable.hasObserver() && !customEventObservable.defaultFn)) {
      _$jscoverage['/custom/target.js'].lineData[103]++;
      if (visit45_103_1(visit46_103_2(customEventObservable.bubbles && !hasTargets) || !customEventObservable.bubbles)) {
        _$jscoverage['/custom/target.js'].lineData[104]++;
        return;
      }
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[112]++;
    customEventObservable = new CustomEventObservable({
  currentTarget: self, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[118]++;
  r2 = customEventObservable.fire(eventData);
  _$jscoverage['/custom/target.js'].lineData[120]++;
  if (visit47_120_1(visit48_120_2(ret !== false) && visit49_120_3(r2 !== undefined))) {
    _$jscoverage['/custom/target.js'].lineData[121]++;
    ret = r2;
  }
});
  _$jscoverage['/custom/target.js'].lineData[126]++;
  return ret;
}, 
  publish: function(type, cfg) {
  _$jscoverage['/custom/target.js'].functionData[4]++;
  _$jscoverage['/custom/target.js'].lineData[139]++;
  var customEventObservable, self = this;
  _$jscoverage['/custom/target.js'].lineData[142]++;
  splitAndRun(type, function(t) {
  _$jscoverage['/custom/target.js'].functionData[5]++;
  _$jscoverage['/custom/target.js'].lineData[143]++;
  customEventObservable = self.getCustomEventObservable(t, true);
  _$jscoverage['/custom/target.js'].lineData[144]++;
  S.mix(customEventObservable, cfg);
});
  _$jscoverage['/custom/target.js'].lineData[147]++;
  return self;
}, 
  addTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[6]++;
  _$jscoverage['/custom/target.js'].lineData[157]++;
  var self = this, targets = self.getTargets();
  _$jscoverage['/custom/target.js'].lineData[159]++;
  if (visit50_159_1(!S.inArray(anotherTarget, targets))) {
    _$jscoverage['/custom/target.js'].lineData[160]++;
    targets.push(anotherTarget);
  }
  _$jscoverage['/custom/target.js'].lineData[162]++;
  return self;
}, 
  removeTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[7]++;
  _$jscoverage['/custom/target.js'].lineData[172]++;
  var self = this, targets = self.getTargets(), index = S.indexOf(anotherTarget, targets);
  _$jscoverage['/custom/target.js'].lineData[175]++;
  if (visit51_175_1(index != -1)) {
    _$jscoverage['/custom/target.js'].lineData[176]++;
    targets.splice(index, 1);
  }
  _$jscoverage['/custom/target.js'].lineData[178]++;
  return self;
}, 
  getTargets: function() {
  _$jscoverage['/custom/target.js'].functionData[8]++;
  _$jscoverage['/custom/target.js'].lineData[187]++;
  return visit52_187_1(this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = []));
}, 
  getCustomEvents: function() {
  _$jscoverage['/custom/target.js'].functionData[9]++;
  _$jscoverage['/custom/target.js'].lineData[191]++;
  return visit53_191_1(this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {}));
}, 
  on: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[10]++;
  _$jscoverage['/custom/target.js'].lineData[203]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[204]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[11]++;
  _$jscoverage['/custom/target.js'].lineData[205]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvent;
  _$jscoverage['/custom/target.js'].lineData[207]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[208]++;
  customEvent = self.getCustomEventObservable(type, true);
  _$jscoverage['/custom/target.js'].lineData[209]++;
  if (visit54_209_1(customEvent)) {
    _$jscoverage['/custom/target.js'].lineData[210]++;
    customEvent.on(cfg);
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[213]++;
  return self;
}, 
  detach: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[12]++;
  _$jscoverage['/custom/target.js'].lineData[225]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[226]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[13]++;
  _$jscoverage['/custom/target.js'].lineData[227]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvents, customEvent;
  _$jscoverage['/custom/target.js'].lineData[230]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[231]++;
  if (visit55_231_1(type)) {
    _$jscoverage['/custom/target.js'].lineData[232]++;
    customEvent = self.getCustomEventObservable(type, true);
    _$jscoverage['/custom/target.js'].lineData[233]++;
    if (visit56_233_1(customEvent)) {
      _$jscoverage['/custom/target.js'].lineData[234]++;
      customEvent.detach(cfg);
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[237]++;
    customEvents = self.getCustomEvents();
    _$jscoverage['/custom/target.js'].lineData[238]++;
    S.each(customEvents, function(customEvent) {
  _$jscoverage['/custom/target.js'].functionData[14]++;
  _$jscoverage['/custom/target.js'].lineData[239]++;
  customEvent.detach(cfg);
});
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[244]++;
  return self;
}};
});
