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
  _$jscoverage['/custom/target.js'].lineData[35] = 0;
  _$jscoverage['/custom/target.js'].lineData[38] = 0;
  _$jscoverage['/custom/target.js'].lineData[40] = 0;
  _$jscoverage['/custom/target.js'].lineData[53] = 0;
  _$jscoverage['/custom/target.js'].lineData[56] = 0;
  _$jscoverage['/custom/target.js'].lineData[57] = 0;
  _$jscoverage['/custom/target.js'].lineData[58] = 0;
  _$jscoverage['/custom/target.js'].lineData[63] = 0;
  _$jscoverage['/custom/target.js'].lineData[76] = 0;
  _$jscoverage['/custom/target.js'].lineData[81] = 0;
  _$jscoverage['/custom/target.js'].lineData[83] = 0;
  _$jscoverage['/custom/target.js'].lineData[85] = 0;
  _$jscoverage['/custom/target.js'].lineData[87] = 0;
  _$jscoverage['/custom/target.js'].lineData[89] = 0;
  _$jscoverage['/custom/target.js'].lineData[93] = 0;
  _$jscoverage['/custom/target.js'].lineData[96] = 0;
  _$jscoverage['/custom/target.js'].lineData[97] = 0;
  _$jscoverage['/custom/target.js'].lineData[100] = 0;
  _$jscoverage['/custom/target.js'].lineData[102] = 0;
  _$jscoverage['/custom/target.js'].lineData[104] = 0;
  _$jscoverage['/custom/target.js'].lineData[105] = 0;
  _$jscoverage['/custom/target.js'].lineData[113] = 0;
  _$jscoverage['/custom/target.js'].lineData[119] = 0;
  _$jscoverage['/custom/target.js'].lineData[121] = 0;
  _$jscoverage['/custom/target.js'].lineData[122] = 0;
  _$jscoverage['/custom/target.js'].lineData[127] = 0;
  _$jscoverage['/custom/target.js'].lineData[140] = 0;
  _$jscoverage['/custom/target.js'].lineData[143] = 0;
  _$jscoverage['/custom/target.js'].lineData[144] = 0;
  _$jscoverage['/custom/target.js'].lineData[145] = 0;
  _$jscoverage['/custom/target.js'].lineData[148] = 0;
  _$jscoverage['/custom/target.js'].lineData[158] = 0;
  _$jscoverage['/custom/target.js'].lineData[160] = 0;
  _$jscoverage['/custom/target.js'].lineData[161] = 0;
  _$jscoverage['/custom/target.js'].lineData[163] = 0;
  _$jscoverage['/custom/target.js'].lineData[173] = 0;
  _$jscoverage['/custom/target.js'].lineData[176] = 0;
  _$jscoverage['/custom/target.js'].lineData[177] = 0;
  _$jscoverage['/custom/target.js'].lineData[179] = 0;
  _$jscoverage['/custom/target.js'].lineData[188] = 0;
  _$jscoverage['/custom/target.js'].lineData[192] = 0;
  _$jscoverage['/custom/target.js'].lineData[204] = 0;
  _$jscoverage['/custom/target.js'].lineData[205] = 0;
  _$jscoverage['/custom/target.js'].lineData[206] = 0;
  _$jscoverage['/custom/target.js'].lineData[208] = 0;
  _$jscoverage['/custom/target.js'].lineData[209] = 0;
  _$jscoverage['/custom/target.js'].lineData[210] = 0;
  _$jscoverage['/custom/target.js'].lineData[211] = 0;
  _$jscoverage['/custom/target.js'].lineData[214] = 0;
  _$jscoverage['/custom/target.js'].lineData[226] = 0;
  _$jscoverage['/custom/target.js'].lineData[227] = 0;
  _$jscoverage['/custom/target.js'].lineData[228] = 0;
  _$jscoverage['/custom/target.js'].lineData[231] = 0;
  _$jscoverage['/custom/target.js'].lineData[232] = 0;
  _$jscoverage['/custom/target.js'].lineData[233] = 0;
  _$jscoverage['/custom/target.js'].lineData[234] = 0;
  _$jscoverage['/custom/target.js'].lineData[235] = 0;
  _$jscoverage['/custom/target.js'].lineData[238] = 0;
  _$jscoverage['/custom/target.js'].lineData[239] = 0;
  _$jscoverage['/custom/target.js'].lineData[240] = 0;
  _$jscoverage['/custom/target.js'].lineData[245] = 0;
  _$jscoverage['/custom/target.js'].lineData[249] = 0;
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
  _$jscoverage['/custom/target.js'].functionData[15] = 0;
}
if (! _$jscoverage['/custom/target.js'].branchData) {
  _$jscoverage['/custom/target.js'].branchData = {};
  _$jscoverage['/custom/target.js'].branchData['56'] = [];
  _$jscoverage['/custom/target.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['57'] = [];
  _$jscoverage['/custom/target.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['79'] = [];
  _$jscoverage['/custom/target.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['81'] = [];
  _$jscoverage['/custom/target.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['96'] = [];
  _$jscoverage['/custom/target.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['100'] = [];
  _$jscoverage['/custom/target.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['102'] = [];
  _$jscoverage['/custom/target.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['104'] = [];
  _$jscoverage['/custom/target.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['121'] = [];
  _$jscoverage['/custom/target.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['121'][3] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['160'] = [];
  _$jscoverage['/custom/target.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['176'] = [];
  _$jscoverage['/custom/target.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['188'] = [];
  _$jscoverage['/custom/target.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['192'] = [];
  _$jscoverage['/custom/target.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['210'] = [];
  _$jscoverage['/custom/target.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['232'] = [];
  _$jscoverage['/custom/target.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/custom/target.js'].branchData['234'] = [];
  _$jscoverage['/custom/target.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/custom/target.js'].branchData['234'][1].init(104, 11, 'customEvent');
function visit56_234_1(result) {
  _$jscoverage['/custom/target.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['232'][1].init(193, 4, 'type');
function visit55_232_1(result) {
  _$jscoverage['/custom/target.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['210'][1].init(232, 11, 'customEvent');
function visit54_210_1(result) {
  _$jscoverage['/custom/target.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['192'][1].init(21, 51, 'this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {})');
function visit53_192_1(result) {
  _$jscoverage['/custom/target.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['188'][1].init(21, 53, 'this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = [])');
function visit52_188_1(result) {
  _$jscoverage['/custom/target.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['176'][1].init(154, 11, 'index != -1');
function visit51_176_1(result) {
  _$jscoverage['/custom/target.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['160'][1].init(94, 34, '!S.inArray(anotherTarget, targets)');
function visit50_160_1(result) {
  _$jscoverage['/custom/target.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['121'][3].init(1352, 16, 'r2 !== undefined');
function visit49_121_3(result) {
  _$jscoverage['/custom/target.js'].branchData['121'][3].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['121'][2].init(1335, 13, 'ret !== false');
function visit48_121_2(result) {
  _$jscoverage['/custom/target.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['121'][1].init(1335, 33, 'ret !== false && r2 !== undefined');
function visit47_121_1(result) {
  _$jscoverage['/custom/target.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['104'][2].init(32, 44, 'customEventObservable.bubbles && !hasTargets');
function visit46_104_2(result) {
  _$jscoverage['/custom/target.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['104'][1].init(32, 78, 'customEventObservable.bubbles && !hasTargets || !customEventObservable.bubbles');
function visit45_104_1(result) {
  _$jscoverage['/custom/target.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['102'][1].init(28, 72, '!customEventObservable.hasObserver() && !customEventObservable.defaultFn');
function visit44_102_1(result) {
  _$jscoverage['/custom/target.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['100'][1].init(559, 21, 'customEventObservable');
function visit43_100_1(result) {
  _$jscoverage['/custom/target.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['96'][1].init(447, 37, '!customEventObservable && !hasTargets');
function visit42_96_1(result) {
  _$jscoverage['/custom/target.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['81'][1].init(195, 15, 'eventData || {}');
function visit41_81_1(result) {
  _$jscoverage['/custom/target.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['79'][1].init(126, 25, 'targets && targets.length');
function visit40_79_1(result) {
  _$jscoverage['/custom/target.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['57'][1].init(231, 22, '!customEvent && create');
function visit39_57_1(result) {
  _$jscoverage['/custom/target.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].branchData['56'][1].init(158, 54, 'customEventObservables && customEventObservables[type]');
function visit38_56_1(result) {
  _$jscoverage['/custom/target.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/custom/target.js'].lineData[6]++;
KISSY.add('event/custom/target', function(S, BaseEvent, CustomEventObservable) {
  _$jscoverage['/custom/target.js'].functionData[0]++;
  _$jscoverage['/custom/target.js'].lineData[7]++;
  var Utils = BaseEvent.Utils, splitAndRun = Utils.splitAndRun, undefined = undefined, KS_BUBBLE_TARGETS = '__~ks_bubble_targets';
  _$jscoverage['/custom/target.js'].lineData[35]++;
  function Target() {
    _$jscoverage['/custom/target.js'].functionData[1]++;
  }
  _$jscoverage['/custom/target.js'].lineData[38]++;
  var KS_CUSTOM_EVENTS = '__~ks_custom_events';
  _$jscoverage['/custom/target.js'].lineData[40]++;
  Target.prototype = {
  constructor: Target, 
  isTarget: 1, 
  getCustomEventObservable: function(type, create) {
  _$jscoverage['/custom/target.js'].functionData[2]++;
  _$jscoverage['/custom/target.js'].lineData[53]++;
  var target = this, customEvent, customEventObservables = target.getCustomEvents();
  _$jscoverage['/custom/target.js'].lineData[56]++;
  customEvent = visit38_56_1(customEventObservables && customEventObservables[type]);
  _$jscoverage['/custom/target.js'].lineData[57]++;
  if (visit39_57_1(!customEvent && create)) {
    _$jscoverage['/custom/target.js'].lineData[58]++;
    customEvent = customEventObservables[type] = new CustomEventObservable({
  currentTarget: target, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[63]++;
  return customEvent;
}, 
  fire: function(type, eventData) {
  _$jscoverage['/custom/target.js'].functionData[3]++;
  _$jscoverage['/custom/target.js'].lineData[76]++;
  var self = this, ret = undefined, targets = self.getTargets(), hasTargets = visit40_79_1(targets && targets.length);
  _$jscoverage['/custom/target.js'].lineData[81]++;
  eventData = visit41_81_1(eventData || {});
  _$jscoverage['/custom/target.js'].lineData[83]++;
  splitAndRun(type, function(type) {
  _$jscoverage['/custom/target.js'].functionData[4]++;
  _$jscoverage['/custom/target.js'].lineData[85]++;
  var r2, customEventObservable;
  _$jscoverage['/custom/target.js'].lineData[87]++;
  Utils.fillGroupsForEvent(type, eventData);
  _$jscoverage['/custom/target.js'].lineData[89]++;
  type = eventData.type;
  _$jscoverage['/custom/target.js'].lineData[93]++;
  customEventObservable = self.getCustomEventObservable(type);
  _$jscoverage['/custom/target.js'].lineData[96]++;
  if (visit42_96_1(!customEventObservable && !hasTargets)) {
    _$jscoverage['/custom/target.js'].lineData[97]++;
    return;
  }
  _$jscoverage['/custom/target.js'].lineData[100]++;
  if (visit43_100_1(customEventObservable)) {
    _$jscoverage['/custom/target.js'].lineData[102]++;
    if (visit44_102_1(!customEventObservable.hasObserver() && !customEventObservable.defaultFn)) {
      _$jscoverage['/custom/target.js'].lineData[104]++;
      if (visit45_104_1(visit46_104_2(customEventObservable.bubbles && !hasTargets) || !customEventObservable.bubbles)) {
        _$jscoverage['/custom/target.js'].lineData[105]++;
        return;
      }
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[113]++;
    customEventObservable = new CustomEventObservable({
  currentTarget: self, 
  type: type});
  }
  _$jscoverage['/custom/target.js'].lineData[119]++;
  r2 = customEventObservable.fire(eventData);
  _$jscoverage['/custom/target.js'].lineData[121]++;
  if (visit47_121_1(visit48_121_2(ret !== false) && visit49_121_3(r2 !== undefined))) {
    _$jscoverage['/custom/target.js'].lineData[122]++;
    ret = r2;
  }
});
  _$jscoverage['/custom/target.js'].lineData[127]++;
  return ret;
}, 
  publish: function(type, cfg) {
  _$jscoverage['/custom/target.js'].functionData[5]++;
  _$jscoverage['/custom/target.js'].lineData[140]++;
  var customEventObservable, self = this;
  _$jscoverage['/custom/target.js'].lineData[143]++;
  splitAndRun(type, function(t) {
  _$jscoverage['/custom/target.js'].functionData[6]++;
  _$jscoverage['/custom/target.js'].lineData[144]++;
  customEventObservable = self.getCustomEventObservable(t, true);
  _$jscoverage['/custom/target.js'].lineData[145]++;
  S.mix(customEventObservable, cfg);
});
  _$jscoverage['/custom/target.js'].lineData[148]++;
  return self;
}, 
  addTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[7]++;
  _$jscoverage['/custom/target.js'].lineData[158]++;
  var self = this, targets = self.getTargets();
  _$jscoverage['/custom/target.js'].lineData[160]++;
  if (visit50_160_1(!S.inArray(anotherTarget, targets))) {
    _$jscoverage['/custom/target.js'].lineData[161]++;
    targets.push(anotherTarget);
  }
  _$jscoverage['/custom/target.js'].lineData[163]++;
  return self;
}, 
  removeTarget: function(anotherTarget) {
  _$jscoverage['/custom/target.js'].functionData[8]++;
  _$jscoverage['/custom/target.js'].lineData[173]++;
  var self = this, targets = self.getTargets(), index = S.indexOf(anotherTarget, targets);
  _$jscoverage['/custom/target.js'].lineData[176]++;
  if (visit51_176_1(index != -1)) {
    _$jscoverage['/custom/target.js'].lineData[177]++;
    targets.splice(index, 1);
  }
  _$jscoverage['/custom/target.js'].lineData[179]++;
  return self;
}, 
  getTargets: function() {
  _$jscoverage['/custom/target.js'].functionData[9]++;
  _$jscoverage['/custom/target.js'].lineData[188]++;
  return visit52_188_1(this[KS_BUBBLE_TARGETS] || (this[KS_BUBBLE_TARGETS] = []));
}, 
  getCustomEvents: function() {
  _$jscoverage['/custom/target.js'].functionData[10]++;
  _$jscoverage['/custom/target.js'].lineData[192]++;
  return visit53_192_1(this[KS_CUSTOM_EVENTS] || (this[KS_CUSTOM_EVENTS] = {}));
}, 
  on: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[11]++;
  _$jscoverage['/custom/target.js'].lineData[204]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[205]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[12]++;
  _$jscoverage['/custom/target.js'].lineData[206]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvent;
  _$jscoverage['/custom/target.js'].lineData[208]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[209]++;
  customEvent = self.getCustomEventObservable(type, true);
  _$jscoverage['/custom/target.js'].lineData[210]++;
  if (visit54_210_1(customEvent)) {
    _$jscoverage['/custom/target.js'].lineData[211]++;
    customEvent.on(cfg);
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[214]++;
  return self;
}, 
  detach: function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[13]++;
  _$jscoverage['/custom/target.js'].lineData[226]++;
  var self = this;
  _$jscoverage['/custom/target.js'].lineData[227]++;
  Utils.batchForType(function(type, fn, context) {
  _$jscoverage['/custom/target.js'].functionData[14]++;
  _$jscoverage['/custom/target.js'].lineData[228]++;
  var cfg = Utils.normalizeParam(type, fn, context), customEvents, customEvent;
  _$jscoverage['/custom/target.js'].lineData[231]++;
  type = cfg.type;
  _$jscoverage['/custom/target.js'].lineData[232]++;
  if (visit55_232_1(type)) {
    _$jscoverage['/custom/target.js'].lineData[233]++;
    customEvent = self.getCustomEventObservable(type, true);
    _$jscoverage['/custom/target.js'].lineData[234]++;
    if (visit56_234_1(customEvent)) {
      _$jscoverage['/custom/target.js'].lineData[235]++;
      customEvent.detach(cfg);
    }
  } else {
    _$jscoverage['/custom/target.js'].lineData[238]++;
    customEvents = self.getCustomEvents();
    _$jscoverage['/custom/target.js'].lineData[239]++;
    S.each(customEvents, function(customEvent) {
  _$jscoverage['/custom/target.js'].functionData[15]++;
  _$jscoverage['/custom/target.js'].lineData[240]++;
  customEvent.detach(cfg);
});
  }
}, 0, type, fn, context);
  _$jscoverage['/custom/target.js'].lineData[245]++;
  return self;
}};
  _$jscoverage['/custom/target.js'].lineData[249]++;
  return Target;
}, {
  requires: ['event/base', './observable']});
