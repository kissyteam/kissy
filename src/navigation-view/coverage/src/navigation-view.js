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
  _$jscoverage['/navigation-view.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view.js'].lineData[19] = 0;
  _$jscoverage['/navigation-view.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view.js'].lineData[26] = 0;
  _$jscoverage['/navigation-view.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[33] = 0;
  _$jscoverage['/navigation-view.js'].lineData[34] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[47] = 0;
  _$jscoverage['/navigation-view.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view.js'].lineData[51] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[57] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[65] = 0;
  _$jscoverage['/navigation-view.js'].lineData[66] = 0;
  _$jscoverage['/navigation-view.js'].lineData[73] = 0;
  _$jscoverage['/navigation-view.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view.js'].lineData[77] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[89] = 0;
  _$jscoverage['/navigation-view.js'].lineData[90] = 0;
  _$jscoverage['/navigation-view.js'].lineData[91] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[98] = 0;
  _$jscoverage['/navigation-view.js'].lineData[99] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[101] = 0;
  _$jscoverage['/navigation-view.js'].lineData[102] = 0;
  _$jscoverage['/navigation-view.js'].lineData[103] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[117] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[119] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
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
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['80'] = [];
  _$jscoverage['/navigation-view.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['86'] = [];
  _$jscoverage['/navigation-view.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['98'] = [];
  _$jscoverage['/navigation-view.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['128'] = [];
  _$jscoverage['/navigation-view.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['132'] = [];
  _$jscoverage['/navigation-view.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['135'] = [];
  _$jscoverage['/navigation-view.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['135'][2] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['135'][2].init(46, 38, 'self.waitingView.uuid === subView.uuid');
function visit27_135_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['135'][1].init(26, 58, 'self.waitingView && self.waitingView.uuid === subView.uuid');
function visit26_135_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['132'][1].init(1465, 25, 'this.viewStack.length > 1');
function visit25_132_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['128'][1].init(1319, 16, 'self.waitingView');
function visit24_128_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['98'][1].init(48, 25, 'this.viewStack.length > 1');
function visit23_98_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['86'][2].init(42, 38, 'self.waitingView.uuid === subView.uuid');
function visit22_86_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['86'][1].init(22, 58, 'self.waitingView && self.waitingView.uuid === subView.uuid');
function visit21_86_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['80'][1].init(1378, 16, 'self.waitingView');
function visit20_80_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Controller = require('navigation-view/controller');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var SubView = require('navigation-view/sub-view');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var Bar = require('navigation-view/bar');
  _$jscoverage['/navigation-view.js'].lineData[11]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[12]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[13]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[19]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[21]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[23]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[26]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[27]++;
  this.control.setInternal('loadingEl', loadingEl);
}});
  _$jscoverage['/navigation-view.js'].lineData[31]++;
  return Container.extend({
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[2]++;
  _$jscoverage['/navigation-view.js'].lineData[33]++;
  this.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[34]++;
  var bar;
  _$jscoverage['/navigation-view.js'].lineData[35]++;
  this.setInternal('bar', bar = new Bar({
  elBefore: this.get('el')[0].firstChild}).render());
  _$jscoverage['/navigation-view.js'].lineData[38]++;
  bar.get('backBtn').on('click', this.onBack, this);
}, 
  onBack: function() {
  _$jscoverage['/navigation-view.js'].functionData[3]++;
  _$jscoverage['/navigation-view.js'].lineData[42]++;
  history.back();
}, 
  push: function(subView) {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[46]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[47]++;
  var bar = this.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[48]++;
  subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
  _$jscoverage['/navigation-view.js'].lineData[49]++;
  subView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[50]++;
  var activeView;
  _$jscoverage['/navigation-view.js'].lineData[51]++;
  var loadingEl = this.get('loadingEl');
  _$jscoverage['/navigation-view.js'].lineData[52]++;
  this.viewStack.push(subView);
  _$jscoverage['/navigation-view.js'].lineData[53]++;
  if ((activeView = this.get('activeView'))) {
    _$jscoverage['/navigation-view.js'].lineData[54]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    loadingEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[56]++;
    loadingEl.css('left', '100%');
    _$jscoverage['/navigation-view.js'].lineData[57]++;
    activeEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[58]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[65]++;
    loadingEl.show();
    _$jscoverage['/navigation-view.js'].lineData[66]++;
    loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[73]++;
    this.set('activeView', null);
    _$jscoverage['/navigation-view.js'].lineData[74]++;
    bar.forward(subView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[75]++;
    activeView.controller.leave();
  } else {
    _$jscoverage['/navigation-view.js'].lineData[77]++;
    bar.set('title', subView.get('title'));
  }
  _$jscoverage['/navigation-view.js'].lineData[80]++;
  if (visit20_80_1(self.waitingView)) {
    _$jscoverage['/navigation-view.js'].lineData[81]++;
    self.waitingView.controller.leave();
  }
  _$jscoverage['/navigation-view.js'].lineData[84]++;
  self.waitingView = subView;
  _$jscoverage['/navigation-view.js'].lineData[85]++;
  subView.controller.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[86]++;
  if (visit21_86_1(self.waitingView && visit22_86_2(self.waitingView.uuid === subView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[87]++;
    self.set('activeView', subView);
    _$jscoverage['/navigation-view.js'].lineData[88]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[89]++;
    bar.set('title', subView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[90]++;
    subView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[91]++;
    loadingEl.hide();
  }
});
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[98]++;
  if (visit23_98_1(this.viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[99]++;
    this.viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[100]++;
    var subView = this.viewStack[this.viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[101]++;
    subView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[102]++;
    var activeView;
    _$jscoverage['/navigation-view.js'].lineData[103]++;
    var loadingEl = this.get('loadingEl');
    _$jscoverage['/navigation-view.js'].lineData[104]++;
    var bar = this.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    if ((activeView = this.get('activeView'))) {
      _$jscoverage['/navigation-view.js'].lineData[107]++;
      this.animEl = activeView.get('el');
      _$jscoverage['/navigation-view.js'].lineData[108]++;
      this.animEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[109]++;
      this.animEl.animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[116]++;
      this.set('activeView', null);
      _$jscoverage['/navigation-view.js'].lineData[117]++;
      activeView.controller.leave();
      _$jscoverage['/navigation-view.js'].lineData[118]++;
      loadingEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[119]++;
      loadingEl.css('left', '-100%');
      _$jscoverage['/navigation-view.js'].lineData[120]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[121]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    } else {
      _$jscoverage['/navigation-view.js'].lineData[128]++;
      if (visit24_128_1(self.waitingView)) {
        _$jscoverage['/navigation-view.js'].lineData[129]++;
        self.waitingView.controller.leave();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[132]++;
    bar.back(subView.get('title'), visit25_132_1(this.viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[133]++;
    self.waitingView = subView;
    _$jscoverage['/navigation-view.js'].lineData[134]++;
    subView.controller.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[135]++;
  if (visit26_135_1(self.waitingView && visit27_135_2(self.waitingView.uuid === subView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[136]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[137]++;
    self.set('activeView', subView);
    _$jscoverage['/navigation-view.js'].lineData[138]++;
    bar.set('title', subView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[139]++;
    subView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[140]++;
    loadingEl.hide();
  }
});
  }
}}, {
  SubView: SubView, 
  Controller: Controller, 
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
