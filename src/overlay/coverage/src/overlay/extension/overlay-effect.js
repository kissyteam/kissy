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
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[11] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[13] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[14] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[20] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[22] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[25] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[26] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[27] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[30] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[49] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[51] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[52] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[53] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[54] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[55] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[57] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[58] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[59] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[60] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[64] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[65] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[69] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[70] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[71] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[72] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[73] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[74] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[79] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[80] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[81] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[86] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[87] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[91] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[92] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[94] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[95] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[96] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[98] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[103] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[104] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[110] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[111] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[115] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[126] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[127] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[134] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[137] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[161] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[169] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[170] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[171] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[177] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[179] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[183] = 0;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[187] = 0;
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
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[11] = 0;
}
if (! _$jscoverage['/overlay/extension/overlay-effect.js'].branchData) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData = {};
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['26'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['51'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['89'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['94'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'] = [];
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'][2] = new BranchData();
}
_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'][2].init(62, 26, 'typeof effect === \'string\'');
function visit34_170_2(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'][1].init(62, 46, 'typeof effect === \'string\' && !effects[effect]');
function visit33_170_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['94'][1].init(254, 6, 'target');
function visit32_94_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'][2].init(177, 17, 'effect === \'none\'');
function visit31_91_2(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'][1].init(177, 28, 'effect === \'none\' && !target');
function visit30_91_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['89'][1].init(85, 26, 'effectCfg.effect || \'none\'');
function visit29_89_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['51'][1].init(780, 4, 'show');
function visit28_51_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].branchData['26'][1].init(14, 18, 'self.__effectGhost');
function visit27_26_1(result) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/overlay-effect.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[0]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[7]++;
  var effects = {
  fade: ['Out', 'In'], 
  slide: ['Up', 'Down']};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[13]++;
  function getGhost(self) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[1]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[14]++;
    var el = self.$el, ghost = el.clone(true);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[20]++;
    ghost.css({
  visibility: 'hidden', 
  overflow: 'hidden'}).addClass(self.get('prefixCls') + 'overlay-ghost');
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[22]++;
    return self.__afterCreateEffectGhost(ghost);
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[25]++;
  function processTarget(self, show) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[2]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[26]++;
    if (visit27_26_1(self.__effectGhost)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[27]++;
      self.__effectGhost.stop(1, 1);
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[30]++;
    var el = self.$el, $ = require('node').all, effectCfg = self.get('effect'), target = $(effectCfg.target), duration = effectCfg.duration, targetBox = {
  width: target.width(), 
  height: target.height()}, targetOffset = target.offset(), elBox = {
  width: el.width(), 
  height: el.height()}, elOffset = el.offset(), from, to, fromOffset, toOffset, ghost = getGhost(self), easing = effectCfg.easing;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[49]++;
    ghost.insertAfter(el);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[51]++;
    if (visit28_51_1(show)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[52]++;
      from = targetBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[53]++;
      fromOffset = targetOffset;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[54]++;
      to = elBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[55]++;
      toOffset = elOffset;
    } else {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[57]++;
      from = elBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[58]++;
      fromOffset = elOffset;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[59]++;
      to = targetBox;
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[60]++;
      toOffset = targetOffset;
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[64]++;
    ghost.offset(toOffset);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[65]++;
    util.mix(to, {
  left: ghost.css('left'), 
  top: ghost.css('top')});
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[69]++;
    el.css('visibility', 'hidden');
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[70]++;
    ghost.css(from);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[71]++;
    ghost.offset(fromOffset);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[72]++;
    self.__effectGhost = ghost;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[73]++;
    ghost.css('visibility', 'visible');
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[74]++;
    ghost.animate(to, {
  Anim: effectCfg.Anim, 
  duration: duration, 
  easing: easing, 
  complete: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[3]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[79]++;
  self.__effectGhost = null;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[80]++;
  ghost.remove();
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[81]++;
  el.css('visibility', '');
}});
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[86]++;
  function processEffect(self, show) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[4]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[87]++;
    var el = self.$el, effectCfg = self.get('effect'), effect = visit29_89_1(effectCfg.effect || 'none'), target = effectCfg.target;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[91]++;
    if (visit30_91_1(visit31_91_2(effect === 'none') && !target)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[92]++;
      return;
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[94]++;
    if (visit32_94_1(target)) {
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[95]++;
      processTarget(self, show);
      _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[96]++;
      return;
    }
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[98]++;
    var duration = effectCfg.duration, easing = effectCfg.easing, index = show ? 1 : 0;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[103]++;
    el.stop(1, 1);
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[104]++;
    el.css({
  visibility: 'visible', 
  display: show ? 'none' : 'block'});
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[110]++;
    var m = effect + effects[effect][index];
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[111]++;
    el[m]({
  duration: duration, 
  Anim: effectCfg.Anim, 
  complete: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[5]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[115]++;
  el.css({
  display: 'block', 
  visibility: ''});
}, 
  easing: easing});
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[126]++;
  function afterVisibleChange(e) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[6]++;
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[127]++;
    processEffect(this, e.newVal);
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[134]++;
  function OverlayEffect() {
    _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[7]++;
  }
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[137]++;
  OverlayEffect.ATTRS = {
  effect: {
  valueFn: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[8]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[161]++;
  return {
  effect: '', 
  target: null, 
  duration: 0.5, 
  easing: 'easeOut'};
}, 
  setter: function(v) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[9]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[169]++;
  var effect = v.effect;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[170]++;
  if (visit33_170_1(visit34_170_2(typeof effect === 'string') && !effects[effect])) {
    _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[171]++;
    v.effect = '';
  }
}}};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[177]++;
  OverlayEffect.prototype = {
  __afterCreateEffectGhost: function(ghost) {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[10]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[179]++;
  return ghost;
}, 
  __bindUI: function() {
  _$jscoverage['/overlay/extension/overlay-effect.js'].functionData[11]++;
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[183]++;
  this.on('afterVisibleChange', afterVisibleChange, this);
}};
  _$jscoverage['/overlay/extension/overlay-effect.js'].lineData[187]++;
  return OverlayEffect;
});
