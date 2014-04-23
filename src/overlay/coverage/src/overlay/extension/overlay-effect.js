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
if (! _$jscoverage['/overlay/extension/overlay-effect.js']) {
  _$jscoverage['/overlay/extension/overlay-effect.js'] = {};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[6] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[7] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[9] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[10] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[16] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[18] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[21] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[22] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[23] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[26] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[45] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[47] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[48] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[49] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[50] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[51] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[53] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[54] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[55] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[56] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[60] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[61] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[65] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[66] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[67] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[68] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[69] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[70] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[75] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[76] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[77] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[82] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[83] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[87] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[88] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[90] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[91] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[92] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[94] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[99] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[100] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[106] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[107] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[111] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[122] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[123] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[130] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[133] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[163] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[164] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[165] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[172] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[174] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[178] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[182] = 0;
}
if (! _$jscoverage['/overlay/extension/overlay-effect.js'].functionData) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[0] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[1] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[2] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[3] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[4] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[5] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[6] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[7] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[8] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[9] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[10] = 0;
}
if (! _$jscoverage['/overlay/extension/overlay-effect.js'].branchData) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData = {};
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['22'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['47'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['85'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['90'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'][2] = new BranchData();
}
_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'][2].init(62, 26, 'typeof effect === \'string\'');
function visit35_164_2(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'][1].init(62, 46, 'typeof effect === \'string\' && !effects[effect]');
function visit34_164_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['90'][1].init(254, 6, 'target');
function visit33_90_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'][2].init(177, 17, 'effect === \'none\'');
function visit32_87_2(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'][1].init(177, 28, 'effect === \'none\' && !target');
function visit31_87_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['85'][1].init(85, 26, 'effectCfg.effect || \'none\'');
function visit30_85_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['47'][1].init(766, 4, 'show');
function visit29_47_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['22'][1].init(14, 18, 'self.__effectGhost');
function visit28_22_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[0]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[7]++;
  var effects = {
  fade: ['Out', 'In'], 
  slide: ['Up', 'Down']};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[9]++;
  function getGhost(self) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[1]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[10]++;
    var el = self.$el, ghost = el.clone(true);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[16]++;
    ghost.css({
  visibility: 'hidden', 
  overflow: 'hidden'}).addClass(self.get('prefixCls') + 'overlay-ghost');
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[18]++;
    return self.__afterCreateEffectGhost(ghost);
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[21]++;
  function processTarget(self, show) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[2]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[22]++;
    if (visit28_22_1(self.__effectGhost)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[23]++;
      self.__effectGhost.stop(1, 1);
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[26]++;
    var el = self.$el, $ = S.all, effectCfg = self.get('effect'), target = $(effectCfg.target), duration = effectCfg.duration, targetBox = {
  width: target.width(), 
  height: target.height()}, targetOffset = target.offset(), elBox = {
  width: el.width(), 
  height: el.height()}, elOffset = el.offset(), from, to, fromOffset, toOffset, ghost = getGhost(self), easing = effectCfg.easing;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[45]++;
    ghost.insertAfter(el);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[47]++;
    if (visit29_47_1(show)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[48]++;
      from = targetBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[49]++;
      fromOffset = targetOffset;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[50]++;
      to = elBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[51]++;
      toOffset = elOffset;
    } else {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[53]++;
      from = elBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[54]++;
      fromOffset = elOffset;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[55]++;
      to = targetBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[56]++;
      toOffset = targetOffset;
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[60]++;
    ghost.offset(toOffset);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[61]++;
    S.mix(to, {
  left: ghost.css('left'), 
  top: ghost.css('top')});
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[65]++;
    el.css('visibility', 'hidden');
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[66]++;
    ghost.css(from);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[67]++;
    ghost.offset(fromOffset);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[68]++;
    self.__effectGhost = ghost;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[69]++;
    ghost.css('visibility', 'visible');
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[70]++;
    ghost.animate(to, {
  Anim: effectCfg.Anim, 
  duration: duration, 
  easing: easing, 
  complete: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[3]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[75]++;
  self.__effectGhost = null;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[76]++;
  ghost.remove();
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[77]++;
  el.css('visibility', '');
}});
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[82]++;
  function processEffect(self, show) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[4]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[83]++;
    var el = self.$el, effectCfg = self.get('effect'), effect = visit30_85_1(effectCfg.effect || 'none'), target = effectCfg.target;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[87]++;
    if (visit31_87_1(visit32_87_2(effect === 'none') && !target)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[88]++;
      return;
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[90]++;
    if (visit33_90_1(target)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[91]++;
      processTarget(self, show);
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[92]++;
      return;
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[94]++;
    var duration = effectCfg.duration, easing = effectCfg.easing, index = show ? 1 : 0;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[99]++;
    el.stop(1, 1);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[100]++;
    el.css({
  visibility: 'visible', 
  display: show ? 'none' : 'block'});
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[106]++;
    var m = effect + effects[effect][index];
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[107]++;
    el[m]({
  duration: duration, 
  Anim: effectCfg.Anim, 
  complete: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[5]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[111]++;
  el.css({
  display: 'block', 
  visibility: ''});
}, 
  easing: easing});
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[122]++;
  function afterVisibleChange(e) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[6]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[123]++;
    processEffect(this, e.newVal);
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[130]++;
  function OverlayEffect() {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[7]++;
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[133]++;
  OverlayEffect.ATTRS = {
  effect: {
  value: {
  effect: '', 
  target: null, 
  duration: 0.5, 
  easing: 'easeOut'}, 
  setter: function(v) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[8]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[163]++;
  var effect = v.effect;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[164]++;
  if (visit34_164_1(visit35_164_2(typeof effect === 'string') && !effects[effect])) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[165]++;
    v.effect = '';
  }
}}};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[172]++;
  OverlayEffect.prototype = {
  __afterCreateEffectGhost: function(ghost) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[9]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[174]++;
  return ghost;
}, 
  __bindUI: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[10]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[178]++;
  this.on('afterVisibleChange', afterVisibleChange, this);
}};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[182]++;
  return OverlayEffect;
});
