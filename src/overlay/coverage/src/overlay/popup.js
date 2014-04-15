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
if (! _$jscoverage['/overlay/popup.js']) {
  _$jscoverage['/overlay/popup.js'] = {};
  _$jscoverage['/overlay/popup.js'].lineData = [];
  _$jscoverage['/overlay/popup.js'].lineData[6] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[7] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[9] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[10] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[14] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[15] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[16] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[17] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[18] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[22] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[24] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[25] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[26] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[27] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[29] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[32] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[35] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[36] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[37] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[38] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[39] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[43] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[44] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[45] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[46] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[47] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[51] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[52] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[53] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[54] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[55] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[56] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[58] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[62] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[65] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[66] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[67] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[68] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[71] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[72] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[73] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[82] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[84] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[87] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[88] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[89] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[91] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[97] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[99] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[100] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[102] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[108] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[112] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[113] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[114] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[116] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[117] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[119] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[120] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[124] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[126] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[141] = 0;
}
if (! _$jscoverage['/overlay/popup.js'].functionData) {
  _$jscoverage['/overlay/popup.js'].functionData = [];
  _$jscoverage['/overlay/popup.js'].functionData[0] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[1] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[2] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[3] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[4] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[5] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[6] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[7] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[8] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[9] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[10] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[11] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[12] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[13] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[14] = 0;
  _$jscoverage['/overlay/popup.js'].functionData[15] = 0;
}
if (! _$jscoverage['/overlay/popup.js'].branchData) {
  _$jscoverage['/overlay/popup.js'].branchData = {};
  _$jscoverage['/overlay/popup.js'].branchData['25'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['45'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['55'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['87'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['88'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['99'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['100'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['112'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['113'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['116'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['119'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['124'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['124'][1] = new BranchData();
}
_$jscoverage['/overlay/popup.js'].branchData['124'][1].init(552, 3, '$el');
function visit51_124_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['119'][1].init(277, 21, 'self._mouseLeavePopup');
function visit50_119_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['116'][1].init(142, 22, 'self.__mouseEnterPopup');
function visit49_116_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['113'][1].init(22, 17, 'self.__clickPopup');
function visit48_113_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['112'][1].init(125, 1, 't');
function visit47_112_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['100'][1].init(22, 35, 'self.get(\'triggerType\') === \'mouse\'');
function visit46_100_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['99'][1].init(96, 7, 'trigger');
function visit45_99_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['88'][1].init(22, 35, 'self.get(\'triggerType\') === \'mouse\'');
function visit44_88_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['87'][1].init(126, 7, 'trigger');
function visit43_87_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['55'][1].init(52, 18, 'self.get(\'toggle\')');
function visit42_55_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['45'][1].init(40, 17, 'self._hiddenTimer');
function visit41_45_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['25'][1].init(18, 5, 'timer');
function visit40_25_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/popup.js'].functionData[0]++;
  _$jscoverage['/overlay/popup.js'].lineData[7]++;
  var Overlay = require('./control');
  _$jscoverage['/overlay/popup.js'].lineData[9]++;
  function bindTriggerMouse() {
    _$jscoverage['/overlay/popup.js'].functionData[1]++;
    _$jscoverage['/overlay/popup.js'].lineData[10]++;
    var self = this, trigger = self.get('trigger'), timer;
    _$jscoverage['/overlay/popup.js'].lineData[14]++;
    self.__mouseEnterPopup = function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[2]++;
  _$jscoverage['/overlay/popup.js'].lineData[15]++;
  clearHiddenTimer.call(self);
  _$jscoverage['/overlay/popup.js'].lineData[16]++;
  timer = S.later(function() {
  _$jscoverage['/overlay/popup.js'].functionData[3]++;
  _$jscoverage['/overlay/popup.js'].lineData[17]++;
  showing.call(self, ev);
  _$jscoverage['/overlay/popup.js'].lineData[18]++;
  timer = undefined;
}, self.get('mouseDelay') * 1000);
};
    _$jscoverage['/overlay/popup.js'].lineData[22]++;
    trigger.on('mouseenter', self.__mouseEnterPopup);
    _$jscoverage['/overlay/popup.js'].lineData[24]++;
    self._mouseLeavePopup = function() {
  _$jscoverage['/overlay/popup.js'].functionData[4]++;
  _$jscoverage['/overlay/popup.js'].lineData[25]++;
  if (visit40_25_1(timer)) {
    _$jscoverage['/overlay/popup.js'].lineData[26]++;
    timer.cancel();
    _$jscoverage['/overlay/popup.js'].lineData[27]++;
    timer = undefined;
  }
  _$jscoverage['/overlay/popup.js'].lineData[29]++;
  setHiddenTimer.call(self);
};
    _$jscoverage['/overlay/popup.js'].lineData[32]++;
    trigger.on('mouseleave', self._mouseLeavePopup);
  }
  _$jscoverage['/overlay/popup.js'].lineData[35]++;
  function setHiddenTimer() {
    _$jscoverage['/overlay/popup.js'].functionData[5]++;
    _$jscoverage['/overlay/popup.js'].lineData[36]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[37]++;
    var delay = self.get('mouseDelay') * 1000;
    _$jscoverage['/overlay/popup.js'].lineData[38]++;
    self._hiddenTimer = S.later(function() {
  _$jscoverage['/overlay/popup.js'].functionData[6]++;
  _$jscoverage['/overlay/popup.js'].lineData[39]++;
  hiding.call(self);
}, delay);
  }
  _$jscoverage['/overlay/popup.js'].lineData[43]++;
  function clearHiddenTimer() {
    _$jscoverage['/overlay/popup.js'].functionData[7]++;
    _$jscoverage['/overlay/popup.js'].lineData[44]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[45]++;
    if (visit41_45_1(self._hiddenTimer)) {
      _$jscoverage['/overlay/popup.js'].lineData[46]++;
      self._hiddenTimer.cancel();
      _$jscoverage['/overlay/popup.js'].lineData[47]++;
      self._hiddenTimer = undefined;
    }
  }
  _$jscoverage['/overlay/popup.js'].lineData[51]++;
  function bindTriggerClick() {
    _$jscoverage['/overlay/popup.js'].functionData[8]++;
    _$jscoverage['/overlay/popup.js'].lineData[52]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[53]++;
    self.__clickPopup = function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[9]++;
  _$jscoverage['/overlay/popup.js'].lineData[54]++;
  ev.preventDefault();
  _$jscoverage['/overlay/popup.js'].lineData[55]++;
  if (visit42_55_1(self.get('toggle'))) {
    _$jscoverage['/overlay/popup.js'].lineData[56]++;
    (self.get('visible') ? hiding : showing).call(self, ev);
  } else {
    _$jscoverage['/overlay/popup.js'].lineData[58]++;
    showing.call(self, ev);
  }
};
    _$jscoverage['/overlay/popup.js'].lineData[62]++;
    self.get('trigger').on('click', self.__clickPopup);
  }
  _$jscoverage['/overlay/popup.js'].lineData[65]++;
  function showing(ev) {
    _$jscoverage['/overlay/popup.js'].functionData[10]++;
    _$jscoverage['/overlay/popup.js'].lineData[66]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[67]++;
    self.set('currentTrigger', S.one(ev.target));
    _$jscoverage['/overlay/popup.js'].lineData[68]++;
    self.show();
  }
  _$jscoverage['/overlay/popup.js'].lineData[71]++;
  function hiding() {
    _$jscoverage['/overlay/popup.js'].functionData[11]++;
    _$jscoverage['/overlay/popup.js'].lineData[72]++;
    this.set('currentTrigger', undefined);
    _$jscoverage['/overlay/popup.js'].lineData[73]++;
    this.hide();
  }
  _$jscoverage['/overlay/popup.js'].lineData[82]++;
  return Overlay.extend({
  initializer: function() {
  _$jscoverage['/overlay/popup.js'].functionData[12]++;
  _$jscoverage['/overlay/popup.js'].lineData[84]++;
  var self = this, trigger = self.get('trigger');
  _$jscoverage['/overlay/popup.js'].lineData[87]++;
  if (visit43_87_1(trigger)) {
    _$jscoverage['/overlay/popup.js'].lineData[88]++;
    if (visit44_88_1(self.get('triggerType') === 'mouse')) {
      _$jscoverage['/overlay/popup.js'].lineData[89]++;
      bindTriggerMouse.call(self);
    } else {
      _$jscoverage['/overlay/popup.js'].lineData[91]++;
      bindTriggerClick.call(self);
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/overlay/popup.js'].functionData[13]++;
  _$jscoverage['/overlay/popup.js'].lineData[97]++;
  var self = this, trigger = self.get('trigger');
  _$jscoverage['/overlay/popup.js'].lineData[99]++;
  if (visit45_99_1(trigger)) {
    _$jscoverage['/overlay/popup.js'].lineData[100]++;
    if (visit46_100_1(self.get('triggerType') === 'mouse')) {
      _$jscoverage['/overlay/popup.js'].lineData[102]++;
      self.$el.on('mouseleave', setHiddenTimer, self).on('mouseenter', clearHiddenTimer, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/overlay/popup.js'].functionData[14]++;
  _$jscoverage['/overlay/popup.js'].lineData[108]++;
  var self = this, $el = self.$el, t = self.get('trigger');
  _$jscoverage['/overlay/popup.js'].lineData[112]++;
  if (visit47_112_1(t)) {
    _$jscoverage['/overlay/popup.js'].lineData[113]++;
    if (visit48_113_1(self.__clickPopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[114]++;
      t.detach('click', self.__clickPopup);
    }
    _$jscoverage['/overlay/popup.js'].lineData[116]++;
    if (visit49_116_1(self.__mouseEnterPopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[117]++;
      t.detach('mouseenter', self.__mouseEnterPopup);
    }
    _$jscoverage['/overlay/popup.js'].lineData[119]++;
    if (visit50_119_1(self._mouseLeavePopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[120]++;
      t.detach('mouseleave', self._mouseLeavePopup);
    }
  }
  _$jscoverage['/overlay/popup.js'].lineData[124]++;
  if (visit51_124_1($el)) {
    _$jscoverage['/overlay/popup.js'].lineData[126]++;
    $el.detach('mouseleave', setHiddenTimer, self).detach('mouseenter', clearHiddenTimer, self);
  }
}}, {
  ATTRS: {
  trigger: {
  setter: function(v) {
  _$jscoverage['/overlay/popup.js'].functionData[15]++;
  _$jscoverage['/overlay/popup.js'].lineData[141]++;
  return S.all(v);
}}, 
  triggerType: {
  value: 'click'}, 
  currentTrigger: {}, 
  mouseDelay: {
  value: 0.1}, 
  toggle: {
  value: false}}, 
  xclass: 'popup'});
});
