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
  _$jscoverage['/overlay/popup.js'].lineData[13] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[15] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[18] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[19] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[20] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[21] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[22] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[25] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[31] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[35] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[36] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[37] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[38] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[39] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[43] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[45] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[46] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[47] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[48] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[50] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[53] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[57] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[60] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[64] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[65] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[66] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[71] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[72] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[73] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[74] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[79] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[80] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[81] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[82] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[83] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[85] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[89] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[93] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[94] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[95] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[99] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[100] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[104] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[108] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[109] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[110] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[112] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[113] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[115] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[116] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[121] = 0;
  _$jscoverage['/overlay/popup.js'].lineData[135] = 0;
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
  _$jscoverage['/overlay/popup.js'].functionData[16] = 0;
}
if (! _$jscoverage['/overlay/popup.js'].branchData) {
  _$jscoverage['/overlay/popup.js'].branchData = {};
  _$jscoverage['/overlay/popup.js'].branchData['18'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['19'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['46'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['72'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['82'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['108'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['109'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['112'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/overlay/popup.js'].branchData['115'] = [];
  _$jscoverage['/overlay/popup.js'].branchData['115'][1] = new BranchData();
}
_$jscoverage['/overlay/popup.js'].branchData['115'][1].init(277, 21, 'self._mouseLeavePopup');
function visit42_115_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['112'][1].init(142, 22, 'self.__mouseEnterPopup');
function visit41_112_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['109'][1].init(22, 17, 'self.__clickPopup');
function visit40_109_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['108'][1].init(125, 1, 't');
function visit39_108_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['82'][1].init(60, 18, 'self.get(\'toggle\')');
function visit38_82_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['72'][1].init(48, 17, 'self._hiddenTimer');
function visit37_72_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['46'][1].init(22, 5, 'timer');
function visit36_46_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['19'][1].init(22, 35, 'self.get("triggerType") === \'mouse\'');
function visit35_19_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].branchData['18'][1].init(126, 7, 'trigger');
function visit34_18_1(result) {
  _$jscoverage['/overlay/popup.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/popup.js'].lineData[6]++;
KISSY.add('overlay/popup', function(S, Overlay, undefined) {
  _$jscoverage['/overlay/popup.js'].functionData[0]++;
  _$jscoverage['/overlay/popup.js'].lineData[13]++;
  return Overlay.extend({
  initializer: function() {
  _$jscoverage['/overlay/popup.js'].functionData[1]++;
  _$jscoverage['/overlay/popup.js'].lineData[15]++;
  var self = this, trigger = self.get("trigger");
  _$jscoverage['/overlay/popup.js'].lineData[18]++;
  if (visit34_18_1(trigger)) {
    _$jscoverage['/overlay/popup.js'].lineData[19]++;
    if (visit35_19_1(self.get("triggerType") === 'mouse')) {
      _$jscoverage['/overlay/popup.js'].lineData[20]++;
      self._bindTriggerMouse();
      _$jscoverage['/overlay/popup.js'].lineData[21]++;
      self.on('afterRenderUI', function() {
  _$jscoverage['/overlay/popup.js'].functionData[2]++;
  _$jscoverage['/overlay/popup.js'].lineData[22]++;
  self._bindContainerMouse();
});
    } else {
      _$jscoverage['/overlay/popup.js'].lineData[25]++;
      self._bindTriggerClick();
    }
  }
}, 
  _bindTriggerMouse: function() {
  _$jscoverage['/overlay/popup.js'].functionData[3]++;
  _$jscoverage['/overlay/popup.js'].lineData[31]++;
  var self = this, trigger = self.get("trigger"), timer;
  _$jscoverage['/overlay/popup.js'].lineData[35]++;
  self.__mouseEnterPopup = function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[4]++;
  _$jscoverage['/overlay/popup.js'].lineData[36]++;
  self._clearHiddenTimer();
  _$jscoverage['/overlay/popup.js'].lineData[37]++;
  timer = S.later(function() {
  _$jscoverage['/overlay/popup.js'].functionData[5]++;
  _$jscoverage['/overlay/popup.js'].lineData[38]++;
  self._showing(ev);
  _$jscoverage['/overlay/popup.js'].lineData[39]++;
  timer = undefined;
}, self.get('mouseDelay') * 1000);
};
  _$jscoverage['/overlay/popup.js'].lineData[43]++;
  trigger.on('mouseenter', self.__mouseEnterPopup);
  _$jscoverage['/overlay/popup.js'].lineData[45]++;
  self._mouseLeavePopup = function() {
  _$jscoverage['/overlay/popup.js'].functionData[6]++;
  _$jscoverage['/overlay/popup.js'].lineData[46]++;
  if (visit36_46_1(timer)) {
    _$jscoverage['/overlay/popup.js'].lineData[47]++;
    timer.cancel();
    _$jscoverage['/overlay/popup.js'].lineData[48]++;
    timer = undefined;
  }
  _$jscoverage['/overlay/popup.js'].lineData[50]++;
  self._setHiddenTimer();
};
  _$jscoverage['/overlay/popup.js'].lineData[53]++;
  trigger.on('mouseleave', self._mouseLeavePopup);
}, 
  _bindContainerMouse: function() {
  _$jscoverage['/overlay/popup.js'].functionData[7]++;
  _$jscoverage['/overlay/popup.js'].lineData[57]++;
  var self = this;
  _$jscoverage['/overlay/popup.js'].lineData[60]++;
  self.$el.on('mouseleave', self._setHiddenTimer, self).on('mouseenter', self._clearHiddenTimer, self);
}, 
  _setHiddenTimer: function() {
  _$jscoverage['/overlay/popup.js'].functionData[8]++;
  _$jscoverage['/overlay/popup.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/overlay/popup.js'].lineData[65]++;
  self._hiddenTimer = S.later(function() {
  _$jscoverage['/overlay/popup.js'].functionData[9]++;
  _$jscoverage['/overlay/popup.js'].lineData[66]++;
  self._hiding();
}, self.get('mouseDelay') * 1000);
}, 
  _clearHiddenTimer: function() {
  _$jscoverage['/overlay/popup.js'].functionData[10]++;
  _$jscoverage['/overlay/popup.js'].lineData[71]++;
  var self = this;
  _$jscoverage['/overlay/popup.js'].lineData[72]++;
  if (visit37_72_1(self._hiddenTimer)) {
    _$jscoverage['/overlay/popup.js'].lineData[73]++;
    self._hiddenTimer.cancel();
    _$jscoverage['/overlay/popup.js'].lineData[74]++;
    self._hiddenTimer = undefined;
  }
}, 
  _bindTriggerClick: function() {
  _$jscoverage['/overlay/popup.js'].functionData[11]++;
  _$jscoverage['/overlay/popup.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/overlay/popup.js'].lineData[80]++;
  self.__clickPopup = function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[12]++;
  _$jscoverage['/overlay/popup.js'].lineData[81]++;
  ev.preventDefault();
  _$jscoverage['/overlay/popup.js'].lineData[82]++;
  if (visit38_82_1(self.get('toggle'))) {
    _$jscoverage['/overlay/popup.js'].lineData[83]++;
    self[self.get('visible') ? '_hiding' : '_showing'](ev);
  } else {
    _$jscoverage['/overlay/popup.js'].lineData[85]++;
    self._showing(ev);
  }
};
  _$jscoverage['/overlay/popup.js'].lineData[89]++;
  self.get("trigger").on('click', self.__clickPopup);
}, 
  _showing: function(ev) {
  _$jscoverage['/overlay/popup.js'].functionData[13]++;
  _$jscoverage['/overlay/popup.js'].lineData[93]++;
  var self = this;
  _$jscoverage['/overlay/popup.js'].lineData[94]++;
  self.set('currentTrigger', S.one(ev.target));
  _$jscoverage['/overlay/popup.js'].lineData[95]++;
  self.show();
}, 
  _hiding: function() {
  _$jscoverage['/overlay/popup.js'].functionData[14]++;
  _$jscoverage['/overlay/popup.js'].lineData[99]++;
  this.set('currentTrigger', undefined);
  _$jscoverage['/overlay/popup.js'].lineData[100]++;
  this.hide();
}, 
  destructor: function() {
  _$jscoverage['/overlay/popup.js'].functionData[15]++;
  _$jscoverage['/overlay/popup.js'].lineData[104]++;
  var self = this, $el = self.$el, t = self.get("trigger");
  _$jscoverage['/overlay/popup.js'].lineData[108]++;
  if (visit39_108_1(t)) {
    _$jscoverage['/overlay/popup.js'].lineData[109]++;
    if (visit40_109_1(self.__clickPopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[110]++;
      t.detach('click', self.__clickPopup);
    }
    _$jscoverage['/overlay/popup.js'].lineData[112]++;
    if (visit41_112_1(self.__mouseEnterPopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[113]++;
      t.detach('mouseenter', self.__mouseEnterPopup);
    }
    _$jscoverage['/overlay/popup.js'].lineData[115]++;
    if (visit42_115_1(self._mouseLeavePopup)) {
      _$jscoverage['/overlay/popup.js'].lineData[116]++;
      t.detach('mouseleave', self._mouseLeavePopup);
    }
  }
  _$jscoverage['/overlay/popup.js'].lineData[121]++;
  $el.detach('mouseleave', self._setHiddenTimer, self).detach('mouseenter', self._clearHiddenTimer, self);
}}, {
  ATTRS: {
  trigger: {
  setter: function(v) {
  _$jscoverage['/overlay/popup.js'].functionData[16]++;
  _$jscoverage['/overlay/popup.js'].lineData[135]++;
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
}, {
  requires: ["./control"]});
