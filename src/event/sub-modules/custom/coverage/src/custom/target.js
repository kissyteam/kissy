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
  _$jscoverage['/custom/target.js'].lineData[9] = 0;
  _$jscoverage['/custom/target.js'].lineData[10] = 0;
  _$jscoverage['/custom/target.js'].lineData[38] = 0;
  _$jscoverage['/custom/target.js'].lineData[40] = 0;
  _$jscoverage['/custom/target.js'].lineData[51] = 0;
  _$jscoverage['/custom/target.js'].lineData[54] = 0;
  _$jscoverage['/custom/target.js'].lineData[55] = 0;
  _$jscoverage['/custom/target.js'].lineData[56] = 0;
  _$jscoverage['/custom/target.js'].lineData[61] = 0;
  _$jscoverage['/custom/target.js'].lineData[74] = 0;
  _$jscoverage['/custom/target.js'].lineData[79] = 0;
  _$jscoverage['/custom/target.js'].lineData[80] = 0;
  _$jscoverage['/custom/target.js'].lineData[81] = 0;
  _$jscoverage['/custom/target.js'].lineData[84] = 0;
  _$jscoverage['/custom/target.js'].lineData[86] = 0;
  _$jscoverage['/custom/target.js'].lineData[88] = 0;
  _$jscoverage['/custom/target.js'].lineData[90] = 0;
  _$jscoverage['/custom/target.js'].lineData[92] = 0;
  _$jscoverage['/custom/target.js'].lineData[96] = 0;
  _$jscoverage['/custom/target.js'].lineData[99] = 0;
  _$jscoverage['/custom/target.js'].lineData[100] = 0;
  _$jscoverage['/custom/target.js'].lineData[103] = 0;
  _$jscoverage['/custom/target.js'].lineData[105] = 0;
  _$jscoverage['/custom/target.js'].lineData[107] = 0;
  _$jscoverage['/custom/target.js'].lineData[108] = 0;
  _$jscoverage['/custom/target.js'].lineData[116] = 0;
  _$jscoverage['/custom/target.js'].lineData[122] = 0;
  _$jscoverage['/custom/target.js'].lineData[124] = 0;
  _$jscoverage['/custom/target.js'].lineData[125] = 0;
  _$jscoverage['/custom/target.js'].lineData[130] = 0;
  _$jscoverage['/custom/target.js'].lineData[143] = 0;
  _$jscoverage['/custom/target.js'].lineData[146] = 0;
  _$jscoverage['/custom/target.js'].lineData[147] = 0;
  _$jscoverage['/custom/target.js'].lineData[148] = 0;
  _$jscoverage['/custom/target.js'].lineData[151] = 0;
  _$jscoverage['/custom/target.js'].lineData[161] = 0;
  _$jscoverage['/custom/target.js'].lineData[163] = 0;
  _$jscoverage['/custom/target.js'].lineData[164] = 0;
  _$jscoverage['/custom/target.js'].lineData[166] = 0;
  _$jscoverage['/custom/target.js'].lineData[176] = 0;
  _$jscoverage['/custom/target.js'].lineData[179] = 0;
  _$jscoverage['/custom/target.js'].lineData[180] = 0;
  _$jscoverage['/custom/target.js'].lineData[182] = 0;
  _$jscoverage['/custom/target.js'].lineData[191] = 0;
  _$jscoverage['/custom/target.js'].lineData[195] = 0;
  _$jscoverage['/custom/target.js'].lineData[207] = 0;
  _$jscoverage['/custom/target.js'].lineData[208] = 0;
  _$jscoverage['/custom/target.js'].lineData[209] = 0;
  _$jscoverage['/custom/target.js'].lineData[211] = 0;
  _$jscoverage['/custom/target.js'].lineData[212] = 0;
  _$jscoverage['/custom/target.js'].lineData[213] = 0;
  _$jscoverage['/custom/target.js'].lineData[214] = 0;
  _$jscoverage['/custom/target.js'].lineData[217] = 0;
  _$jscoverage['/custom/target.js'].lineData[229] = 0;
  _$jscoverage['/custom/target.js'].lineData[230] = 0;
  _$jscoverage['/custom/target.js'].lineData[231] = 0;
  _$jscoverage['/custom/target.js'].lineData[234] = 0;
  _$jscoverage['/custom/target.js'].lineData[235] = 0;
  _$jscoverage['/custom/target.js'].lineData[236] = 0;
  _$jscoverage['/custom/target.js'].lineData[237] = 0;
  _$jscoverage['/custom/target.js'].lineData[238] = 0;
  _$jscoverage['/custom/target.js'].lineData[241] = 0;
  _$jscoverage['/custom/target.js'].lineData[242] = 0;
  _$jscoverage['/custom/target.js'].lineData[243] = 0;
  _$jscoverage['/custom/target.js'].lineData[248] = 0;
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
  _$jscoverage['/custom/target.js'].branchData['54'] = [];
  _$jscoverage['/custom/target.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['55'] = [];
  _$jscoverage['/custom/target.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['77'] = [];
  _$jscoverage['/custom/target.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['79'] = [];
  _$jscoverage['/custom/target.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['84'] = [];
  _$jscoverage['/custom/target.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['99'] = [];
  _$jscoverage['/custom/target.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['103'] = [];
  _$jscoverage['/custom/target.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['105'] = [];
  _$jscoverage['/custom/target.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['107'] = [];
  _$jscoverage['/custom/target.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['124'] = [];
  _$jscoverage['/custom/target.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['124'][3] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['163'] = [];
  _$jscoverage['/custom/target.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['179'] = [];
  _$jscoverage['/custom/target.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['191'] = [];
  _$jscoverage['/custom/target.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['195'] = [];
  _$jscoverage['/custom/target.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['213'] = [];
  _$jscoverage['/custom/target.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['235'] = [];
  _$jscoverage['/custom/target.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['237'] = [];
  _$jscoverage['/custom/target.js'].branchData['237'][1] = new BranchData();
}
_$jscoverage['/custom/target.js'].branchData['237'][1].init(104, 11, 'customEvent');
function visit57_237_1(result) {
  _$jscoverage['/custom/target.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['235'][1].init(193, 4, 'type');
function visit56_235_1(result) {
  _$jscoverage['/custom/target.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['213'][1].init(232, 11, 'customEvent');
function visit55_213_1(result) {
  _$jscoverage['/custom/target.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['195'][1].init(21, 55, 'this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {})');
function visit54_195_1(result) {
  _$jscoverage['/custom/target.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['191'][1].init(21, 57, 'this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = [])');
function visit53_191_1(result) {
  _$jscoverage['/custom/target.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['179'][1].init(157, 12, 'index !== -1');
function visit52_179_1(result) {
  _$jscoverage['/custom/target.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['163'][1].init(94, 37, '!util.inArray(anotherTarget, targets)');
function visit51_163_1(result) {
  _$jscoverage['/custom/target.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['124'][3].init(1352, 16, 'r2 !== undefined');
function visit50_124_3(result) {
  _$jscoverage['/custom/target.js'].branchData['124'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['124'][2].init(1335, 13, 'ret !== false');
function visit49_124_2(result) {
  _$jscoverage['/custom/target.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['124'][1].init(1335, 33, 'ret !== false && r2 !== undefined');
function visit48_124_1(result) {
  _$jscoverage['/custom/target.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['107'][2].init(32, 44, 'customEventObservable.bubbles && !hasTargets');
function visit47_107_2(result) {
  _$jscoverage['/custom/target.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['107'][1].init(32, 78, 'customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles');
function visit46_107_1(result) {
  _$jscoverage['/custom/target.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['105'][1].init(28, 72, '!customEventObservable.hasObserver() && !customEventObservable.defaultFn');
function visit45_105_1(result) {
  _$jscoverage['/custom/target.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['103'][1].init(559, 21, 'customEventObservable');
function visit44_103_1(result) {
  _$jscoverage['/custom/target.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['99'][1].init(447, 37, '!customEventObservable && !hasTargets');
function visit43_99_1(result) {
  _$jscoverage['/custom/target.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['84'][1].init(309, 15, 'eventData || {}');
function visit42_84_1(result) {
  _$jscoverage['/custom/target.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['79'][1].init(175, 18, 'type.isEventObject');
function visit41_79_1(result) {
  _$jscoverage['/custom/target.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['77'][1].init(114, 25, 'targets && targets.length');
function visit40_77_1(result) {
  _$jscoverage['/custom/target.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['55'][1].init(227, 22, '!customEvent && create');
function visit39_55_1(result) {
  _$jscoverage['/custom/target.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['54'][1].init(154, 54, 'customEventObservables && customEventObservables[type]');
function visit38_54_1(result) {
  _$jscoverage['/custom/target.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/custom/target.js'].functionData[0]++;
  _$jscoverage['/custom/target.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/custom/target.js'].lineData[8]++;
  var CustomEventObservable = require('./observable');
  _$jscoverage['/custom/target.js'].lineData[9]++;
  var util = require('util');
  _$jscoverage['/custom/target.js'].lineData[10]++;
  var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, KS_BUBBLE_TARGETS = '__~ks_bubble_targets';
  _$jscoverage['/custom/target.js'].lineData[38]++;
  var KS_CUSTOM_EVENTS = '__~ks_custom_events';
  _$jscoverage['/custom/target.js'].lineData[40]++;
  return {
  isTarget: 1, 
  getCustomEventObservable: function(type, create) {
  _$jscoverage['/custom/target.js'].functionData[1]++;
  _$jscoverage['/custom/target.js'].lineData[51]++;
  var self = this, customEvent, customEventObservables = self.getCustomEvents();
  _$jscoverage['/custom/target.js'].lineData[54]++;
  customEvent = visit38_54_1(customEventObservables && customEventObservables[type]);
  _$jscoverage['/custom/target.js'].lineData[55]++;
  if (visit39_55_1(!customEvent && create)) {
    _$jscoverage['/custom/target.js'].lineData[56]++;
    customEvent = customEventObservables[type] = new CustomEventObservable({
  currentTarget: self, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[61]++;
  return customEvent;
}, 
  fire: function(type, eventData) {
  _$jscoverage['/custom/target.js'].functionData[2]++;
  _$jscoverage['/custom/target.js'].lineData[74]++;
  var self = this, ret, targets = self.getTargets(), hasTargets = visit40_77_1(targets && targets.length);
  _$jscoverage['/custom/target.js'].lineData[79]++;
  if (visit41_79_1(type.isEventObject)) {
    _$jscoverage['/custom/target.js'].lineData[80]++;
    eventData = type;
    _$jscoverage['/custom/target.js'].lineData[81]++;
    type = type.type;
  }
  _$jscoverage['/custom/target.js'].lineData[84]++;
  eventData = visit42_84_1(eventData || {});
  _$jscoverage['/custom/target.js'].lineData[86]++;
  splitAndRun(type, function(type) {
  _$jscoverage['/custom/target.js'].functionData[3]++;
  _$jscoverage['/custom/target.js'].lineData[88]++;
  var r2, customEventObservable;
  _$jscoverage['/custom/target.js'].lineData[90]++;
  Utils.fillGroupsForEvent(type, eventData);
  _$jscoverage['/custom/target.js'].lineData[92]++;
  type = eventData.type;
  _$jscoverage['/custom/target.js'].lineData[96]++;
  customEventObservable = self.getCustomEventObservable(type);
  _$jscoverage['/custom/target.js'].lineData[99]++;
  if (visit43_99_1(!customEventObservable && !hasTargets)) {
    _$jscoverage['/custom/target.js'].lineData[100]++;
    return;
  }
  _$jscoverage['/custom/target.js'].lineData[103]++;
  if (visit44_103_1(customEventObservable)) {
    _$jscoverage['/custom/target.js'].lineData[105]++;
    if (visit45_105_1(!customEventObservable.hasObserver() && !customEventObservable.defaultFn)) {
      _$jscoverage['/custom/target.js'].lineData[107]++;
      if (visit46_107_1(visit47_107_2(customEventObservable.bubbles && !hasTargets) || !customEventObservable.bubbles)) {
        _$jscoverage['/custom/target.js'].lineData[108]++;
        return;
      }
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[116]++;
    customEventObservable = new CustomEventObservable({
  currentTarget: self, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[122]++;
  r2 = customEventObservable.fire(eventData);
  _$jscoverage['/custom/target.js'].lineData[124]++;
  if (visit48_124_1(visit49_124_2(ret !== false) && visit50_124_3(r2 !== undefined))) {
    _$jscoverage['/custom/target.js'].lineData[125]++;
    ret = r2;
  }
});
  _$jscoverage['/custom/target.js'].lineData[130]++;
  return ret;
}, 
  publish: function(type, cfg) {
  _$jscoverage['/custom/target.js'].functionData[4]++;
  _$jscoverage['/custom/target.js'].lineData[143]++;
  var customEventObservable, self = this;
  _$jscoverage['/custom/target.js'].lineData[146]++;
  splitAndRun(type, function(t) {
  _$jscoverage['/custom/target.js'].functionData[5]++;
  _$jscoverage['/custom/target.js'].lineData[147]++;
  customEventObservable = self.getCustomEventObservable(t, true);
  _$jscoverage['/custom/target.js'].lineData[148]++;
  util.mix(customEventObservable, cfg);
});
  _$jscoverage['/custom/target.js'].lineData[151]++;
  return self;
}, 
  addTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[6]++;
  _$jscoverage['/custom/target.js'].lineData[161]++;
  var self = this, targets = self.getTargets();
  _$jscoverage['/custom/target.js'].lineData[163]++;
  if (visit51_163_1(!util.inArray(anotherTarget, targets))) {
    _$jscoverage['/custom/target.js'].lineData[164]++;
    targets.push(anotherTarget);
  }
  _$jscoverage['/custom/target.js'].lineData[166]++;
  return self;
}, 
  removeTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[7]++;
  _$jscoverage['/custom/target.js'].lineData[176]++;
  var self = this, targets = self.getTargets(), index = util.indexOf(anotherTarget, targets);
  _$jscoverage['/custom/target.js'].lineData[179]++;
  if (visit52_179_1(index !== -1)) {
    _$jscoverage['/custom/target.js'].lineData[180]++;
    targets.splice(index, 1);
  }
  _$jscoverage['/custom/target.js'].lineData[182]++;
  return self;
}, 
  getTargets: function() {
  _$jscoverage['/custom/target.js'].functionData[8]++;
  _$jscoverage['/custom/target.js'].lineData[191]++;
  return visit53_191_1(this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = []));
}, 
  getCustomEvents: function() {
  _$jscoverage['/custom/target.js'].functionData[9]++;
  _$jscoverage['/custom/target.js'].lineData[195]++;
  return visit54_195_1(this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {}));
}, 
  on: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[10]++;
  _$jscoverage['/custom/target.js'].lineData[207]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[208]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[11]++;
  _$jscoverage['/custom/target.js'].lineData[209]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvent;
  _$jscoverage['/custom/target.js'].lineData[211]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[212]++;
  customEvent = self.getCustomEventObservable(type, true);
  _$jscoverage['/custom/target.js'].lineData[213]++;
  if (visit55_213_1(customEvent)) {
    _$jscoverage['/custom/target.js'].lineData[214]++;
    customEvent.on(cfg);
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[217]++;
  return self;
}, 
  detach: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[12]++;
  _$jscoverage['/custom/target.js'].lineData[229]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[230]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[13]++;
  _$jscoverage['/custom/target.js'].lineData[231]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvents, customEvent;
  _$jscoverage['/custom/target.js'].lineData[234]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[235]++;
  if (visit56_235_1(type)) {
    _$jscoverage['/custom/target.js'].lineData[236]++;
    customEvent = self.getCustomEventObservable(type, true);
    _$jscoverage['/custom/target.js'].lineData[237]++;
    if (visit57_237_1(customEvent)) {
      _$jscoverage['/custom/target.js'].lineData[238]++;
      customEvent.detach(cfg);
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[241]++;
    customEvents = self.getCustomEvents();
    _$jscoverage['/custom/target.js'].lineData[242]++;
    util.each(customEvents, function(customEvent) {
  _$jscoverage['/custom/target.js'].functionData[14]++;
  _$jscoverage['/custom/target.js'].lineData[243]++;
  customEvent.detach(cfg);
});
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[248]++;
  return self;
}};
});
