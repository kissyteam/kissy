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
  _$jscoverage['/overlay/popup.js'].lineData[8] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[9] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[11] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[12] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[16] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[17] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[18] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[19] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[20] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[24] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[26] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[27] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[28] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[29] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[31] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[34] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[37] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[38] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[39] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[40] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[41] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[45] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[46] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[47] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[48] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[49] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[53] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[54] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[55] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[56] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[57] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[58] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[60] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[64] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[67] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[68] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[69] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[70] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[73] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[74] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[75] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[84] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[86] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[89] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[90] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[91] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[93] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[99] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[101] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[102] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[104] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[110] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[114] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[115] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[116] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[118] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[119] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[121] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[122] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[126] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[128] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[143] = 0;
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
  _$jscoverage['/overlay/popup.js'].branchData['27'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['47'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['57'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['89'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['90'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['101'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['102'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['114'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['115'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['118'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['121'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['126'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['126'][1] = new BranchData();
}
_$jscoverage['/overlay/popup.js'].branchData['126'][1].init(552, 3, '$el');
function visit49_126_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['121'][1].init(277, 21, 'self._mouseLeavePopup');
function visit48_121_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['118'][1].init(142, 22, 'self.__mouseEnterPopup');
function visit47_118_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['115'][1].init(22, 17, 'self.__clickPopup');
function visit46_115_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['114'][1].init(125, 1, 't');
function visit45_114_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['102'][1].init(22, 35, 'self.get(\'triggerType\') === \'mouse\'');
function visit44_102_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['101'][1].init(96, 7, 'trigger');
function visit43_101_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['90'][1].init(22, 35, 'self.get(\'triggerType\') === \'mouse\'');
function visit42_90_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['89'][1].init(126, 7, 'trigger');
function visit41_89_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['57'][1].init(52, 18, 'self.get(\'toggle\')');
function visit40_57_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['47'][1].init(40, 17, 'self._hiddenTimer');
function visit39_47_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['27'][1].init(18, 5, 'timer');
function visit38_27_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/popup.js'].functionData[0]++;
  _$jscoverage['/overlay/popup.js'].lineData[7]++;
  var Overlay = require('./control');
  _$jscoverage['/overlay/popup.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/overlay/popup.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/overlay/popup.js'].lineData[11]++;
  function bindTriggerMouse() {
    _$jscoverage['/overlay/popup.js'].functionData[1]++;
    _$jscoverage['/overlay/popup.js'].lineData[12]++;
    var self = this, trigger = self.get('trigger'), timer;
    _$jscoverage['/overlay/popup.js'].lineData[16]++;
    self.__mouseEnterPopup = function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[2]++;
  _$jscoverage['/overlay/popup.js'].lineData[17]++;
  clearHiddenTimer.call(self);
  _$jscoverage['/overlay/popup.js'].lineData[18]++;
  timer = util.later(function() {
  _$jscoverage['/overlay/popup.js'].functionData[3]++;
  _$jscoverage['/overlay/popup.js'].lineData[19]++;
  showing.call(self, ev);
  _$jscoverage['/overlay/popup.js'].lineData[20]++;
  timer = undefined;
}, self.get('mouseDelay') * 1000);
};
    _$jscoverage['/overlay/popup.js'].lineData[24]++;
    trigger.on('mouseenter', self.__mouseEnterPopup);
    _$jscoverage['/overlay/popup.js'].lineData[26]++;
    self._mouseLeavePopup = function() {
  _$jscoverage['/overlay/popup.js'].functionData[4]++;
  _$jscoverage['/overlay/popup.js'].lineData[27]++;
  if (visit38_27_1(timer)) {
    _$jscoverage['/overlay/popup.js'].lineData[28]++;
    timer.cancel();
    _$jscoverage['/overlay/popup.js'].lineData[29]++;
    timer = undefined;
  }
  _$jscoverage['/overlay/popup.js'].lineData[31]++;
  setHiddenTimer.call(self);
};
    _$jscoverage['/overlay/popup.js'].lineData[34]++;
    trigger.on('mouseleave', self._mouseLeavePopup);
  }
  _$jscoverage['/overlay/popup.js'].lineData[37]++;
  function setHiddenTimer() {
    _$jscoverage['/overlay/popup.js'].functionData[5]++;
    _$jscoverage['/overlay/popup.js'].lineData[38]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[39]++;
    var delay = self.get('mouseDelay') * 1000;
    _$jscoverage['/overlay/popup.js'].lineData[40]++;
    self._hiddenTimer = util.later(function() {
  _$jscoverage['/overlay/popup.js'].functionData[6]++;
  _$jscoverage['/overlay/popup.js'].lineData[41]++;
  hiding.call(self);
}, delay);
  }
  _$jscoverage['/overlay/popup.js'].lineData[45]++;
  function clearHiddenTimer() {
    _$jscoverage['/overlay/popup.js'].functionData[7]++;
    _$jscoverage['/overlay/popup.js'].lineData[46]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[47]++;
    if (visit39_47_1(self._hiddenTimer)) {
      _$jscoverage['/overlay/popup.js'].lineData[48]++;
      self._hiddenTimer.cancel();
      _$jscoverage['/overlay/popup.js'].lineData[49]++;
      self._hiddenTimer = undefined;
    }
  }
  _$jscoverage['/overlay/popup.js'].lineData[53]++;
  function bindTriggerClick() {
    _$jscoverage['/overlay/popup.js'].functionData[8]++;
    _$jscoverage['/overlay/popup.js'].lineData[54]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[55]++;
    self.__clickPopup = function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[9]++;
  _$jscoverage['/overlay/popup.js'].lineData[56]++;
  ev.preventDefault();
  _$jscoverage['/overlay/popup.js'].lineData[57]++;
  if (visit40_57_1(self.get('toggle'))) {
    _$jscoverage['/overlay/popup.js'].lineData[58]++;
    (self.get('visible') ? hiding : showing).call(self, ev);
  } else {
    _$jscoverage['/overlay/popup.js'].lineData[60]++;
    showing.call(self, ev);
  }
};
    _$jscoverage['/overlay/popup.js'].lineData[64]++;
    self.get('trigger').on('click', self.__clickPopup);
  }
  _$jscoverage['/overlay/popup.js'].lineData[67]++;
  function showing(ev) {
    _$jscoverage['/overlay/popup.js'].functionData[10]++;
    _$jscoverage['/overlay/popup.js'].lineData[68]++;
    var self = this;
    _$jscoverage['/overlay/popup.js'].lineData[69]++;
    self.set('currentTrigger', Node.one(ev.target));
    _$jscoverage['/overlay/popup.js'].lineData[70]++;
    self.show();
  }
  _$jscoverage['/overlay/popup.js'].lineData[73]++;
  function hiding() {
    _$jscoverage['/overlay/popup.js'].functionData[11]++;
    _$jscoverage['/overlay/popup.js'].lineData[74]++;
    this.set('currentTrigger', undefined);
    _$jscoverage['/overlay/popup.js'].lineData[75]++;
    this.hide();
  }
  _$jscoverage['/overlay/popup.js'].lineData[84]++;
  return Overlay.extend({
  initializer: function() {
  _$jscoverage['/overlay/popup.js'].functionData[12]++;
  _$jscoverage['/overlay/popup.js'].lineData[86]++;
  var self = this, trigger = self.get('trigger');
  _$jscoverage['/overlay/popup.js'].lineData[89]++;
  if (visit41_89_1(trigger)) {
    _$jscoverage['/overlay/popup.js'].lineData[90]++;
    if (visit42_90_1(self.get('triggerType') === 'mouse')) {
      _$jscoverage['/overlay/popup.js'].lineData[91]++;
      bindTriggerMouse.call(self);
    } else {
      _$jscoverage['/overlay/popup.js'].lineData[93]++;
      bindTriggerClick.call(self);
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/overlay/popup.js'].functionData[13]++;
  _$jscoverage['/overlay/popup.js'].lineData[99]++;
  var self = this, trigger = self.get('trigger');
  _$jscoverage['/overlay/popup.js'].lineData[101]++;
  if (visit43_101_1(trigger)) {
    _$jscoverage['/overlay/popup.js'].lineData[102]++;
    if (visit44_102_1(self.get('triggerType') === 'mouse')) {
      _$jscoverage['/overlay/popup.js'].lineData[104]++;
      self.$el.on('mouseleave', setHiddenTimer, self).on('mouseenter', clearHiddenTimer, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/overlay/popup.js'].functionData[14]++;
  _$jscoverage['/overlay/popup.js'].lineData[110]++;
  var self = this, $el = self.$el, t = self.get('trigger');
  _$jscoverage['/overlay/popup.js'].lineData[114]++;
  if (visit45_114_1(t)) {
    _$jscoverage['/overlay/popup.js'].lineData[115]++;
    if (visit46_115_1(self.__clickPopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[116]++;
      t.detach('click', self.__clickPopup);
    }
    _$jscoverage['/overlay/popup.js'].lineData[118]++;
    if (visit47_118_1(self.__mouseEnterPopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[119]++;
      t.detach('mouseenter', self.__mouseEnterPopup);
    }
    _$jscoverage['/overlay/popup.js'].lineData[121]++;
    if (visit48_121_1(self._mouseLeavePopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[122]++;
      t.detach('mouseleave', self._mouseLeavePopup);
    }
  }
  _$jscoverage['/overlay/popup.js'].lineData[126]++;
  if (visit49_126_1($el)) {
    _$jscoverage['/overlay/popup.js'].lineData[128]++;
    $el.detach('mouseleave', setHiddenTimer, self).detach('mouseenter', clearHiddenTimer, self);
  }
}}, {
  ATTRS: {
  trigger: {
  setter: function(v) {
  _$jscoverage['/overlay/popup.js'].functionData[15]++;
  _$jscoverage['/overlay/popup.js'].lineData[143]++;
  return Node.all(v);
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
