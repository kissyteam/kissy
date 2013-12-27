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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[9] = 0;
  _$jscoverage['/navigation-view.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view.js'].lineData[12] = 0;
  _$jscoverage['/navigation-view.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view.js'].lineData[36] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[61] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[66] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[68] = 0;
  _$jscoverage['/navigation-view.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view.js'].lineData[70] = 0;
  _$jscoverage['/navigation-view.js'].lineData[71] = 0;
  _$jscoverage['/navigation-view.js'].lineData[72] = 0;
  _$jscoverage['/navigation-view.js'].lineData[73] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[89] = 0;
  _$jscoverage['/navigation-view.js'].lineData[91] = 0;
  _$jscoverage['/navigation-view.js'].lineData[94] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[98] = 0;
  _$jscoverage['/navigation-view.js'].lineData[99] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view.js'].lineData[131] = 0;
  _$jscoverage['/navigation-view.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view.js'].functionData[9] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['61'] = [];
  _$jscoverage['/navigation-view.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['96'] = [];
  _$jscoverage['/navigation-view.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['105'] = [];
  _$jscoverage['/navigation-view.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['134'] = [];
  _$jscoverage['/navigation-view.js'].branchData['134'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['134'][1].init(26, 28, 'self.waitingView === subView');
function visit13_134_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['105'][1].init(48, 21, 'this.viewStack.length');
function visit12_105_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['96'][1].init(22, 28, 'self.waitingView === subView');
function visit11_96_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['61'][1].init(88, 23, 'subView.get(\'rendered\')');
function visit10_61_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var Bar = require('navigation-view/bar');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[11]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[12]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[18]++;
  var SubView = Control.extend({
  pause: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
}, 
  resume: function() {
  _$jscoverage['/navigation-view.js'].functionData[2]++;
}}, {
  xclass: 'navigation-sub-view', 
  ATTRS: {
  handleMouseEvents: {
  value: false}, 
  promise: {}, 
  focusable: {
  value: false}}});
  _$jscoverage['/navigation-view.js'].lineData[36]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[3]++;
  _$jscoverage['/navigation-view.js'].lineData[38]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[41]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[42]++;
  this.control.setInternal('loadingEl', loadingEl);
}});
  _$jscoverage['/navigation-view.js'].lineData[46]++;
  return Container.extend({
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[48]++;
  this.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[49]++;
  var bar;
  _$jscoverage['/navigation-view.js'].lineData[50]++;
  this.setInternal('bar', bar = new Bar({
  elBefore: this.get('el')[0].firstChild}).render());
  _$jscoverage['/navigation-view.js'].lineData[53]++;
  bar.get('backBtn').on('click', this.onBack, this);
}, 
  onBack: function() {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[56]++;
  this.pop();
}, 
  push: function(subView) {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[60]++;
  var bar = this.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[61]++;
  if (visit10_61_1(subView.get('rendered'))) {
    _$jscoverage['/navigation-view.js'].lineData[62]++;
    subView.resume();
  } else {
    _$jscoverage['/navigation-view.js'].lineData[64]++;
    this.addChild(subView);
  }
  _$jscoverage['/navigation-view.js'].lineData[66]++;
  subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
  _$jscoverage['/navigation-view.js'].lineData[67]++;
  var activeView;
  _$jscoverage['/navigation-view.js'].lineData[68]++;
  var loadingEl = this.get('loadingEl');
  _$jscoverage['/navigation-view.js'].lineData[69]++;
  if ((activeView = this.get('activeView'))) {
    _$jscoverage['/navigation-view.js'].lineData[70]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[71]++;
    this.viewStack.push(activeView);
    _$jscoverage['/navigation-view.js'].lineData[72]++;
    loadingEl.css('left', '100%');
    _$jscoverage['/navigation-view.js'].lineData[73]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[80]++;
    loadingEl.show();
    _$jscoverage['/navigation-view.js'].lineData[81]++;
    loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[88]++;
    this.set('activeView', null);
    _$jscoverage['/navigation-view.js'].lineData[89]++;
    bar.forward(subView.get('title'));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[91]++;
    bar.set('title', subView.get('title'));
  }
  _$jscoverage['/navigation-view.js'].lineData[94]++;
  self.waitingView = subView;
  _$jscoverage['/navigation-view.js'].lineData[95]++;
  subView.get('promise').then(function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[96]++;
  if (visit11_96_1(self.waitingView === subView)) {
    _$jscoverage['/navigation-view.js'].lineData[97]++;
    self.set('activeView', subView);
    _$jscoverage['/navigation-view.js'].lineData[98]++;
    subView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[99]++;
    loadingEl.hide();
  }
});
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[8]++;
  _$jscoverage['/navigation-view.js'].lineData[104]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[105]++;
  if (visit12_105_1(this.viewStack.length)) {
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    var subView = this.viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[107]++;
    subView.resume();
    _$jscoverage['/navigation-view.js'].lineData[108]++;
    var activeView;
    _$jscoverage['/navigation-view.js'].lineData[109]++;
    var loadingEl = this.get('loadingEl');
    _$jscoverage['/navigation-view.js'].lineData[110]++;
    var bar = this.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[111]++;
    if ((activeView = this.get('activeView'))) {
      _$jscoverage['/navigation-view.js'].lineData[112]++;
      this.viewStack.push(activeView);
      _$jscoverage['/navigation-view.js'].lineData[113]++;
      loadingEl.css('left', '-100%');
      _$jscoverage['/navigation-view.js'].lineData[114]++;
      activeView.get('el').animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[121]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[122]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[129]++;
      this.set('activeView', null);
    }
    _$jscoverage['/navigation-view.js'].lineData[131]++;
    bar.back(subView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[132]++;
    self.waitingView = subView;
    _$jscoverage['/navigation-view.js'].lineData[133]++;
    subView.get('promise').then(function() {
  _$jscoverage['/navigation-view.js'].functionData[9]++;
  _$jscoverage['/navigation-view.js'].lineData[134]++;
  if (visit13_134_1(self.waitingView === subView)) {
    _$jscoverage['/navigation-view.js'].lineData[135]++;
    self.set('activeView', subView);
    _$jscoverage['/navigation-view.js'].lineData[136]++;
    subView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[137]++;
    loadingEl.hide();
  }
});
  }
}}, {
  SubView: SubView, 
  xclass: 'navigation-view', 
  ATTRS: {
  activeView: {}, 
  loadingEl: {}, 
  handleMouseEvents: {
  value: false}, 
  focusable: {
  value: false}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  xclass: 'navigation-sub-view'}}}});
});
