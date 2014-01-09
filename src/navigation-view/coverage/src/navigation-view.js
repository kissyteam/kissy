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
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[65] = 0;
  _$jscoverage['/navigation-view.js'].lineData[66] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[68] = 0;
  _$jscoverage['/navigation-view.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view.js'].lineData[77] = 0;
  _$jscoverage['/navigation-view.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view.js'].lineData[89] = 0;
  _$jscoverage['/navigation-view.js'].lineData[91] = 0;
  _$jscoverage['/navigation-view.js'].lineData[92] = 0;
  _$jscoverage['/navigation-view.js'].lineData[93] = 0;
  _$jscoverage['/navigation-view.js'].lineData[94] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[101] = 0;
  _$jscoverage['/navigation-view.js'].lineData[102] = 0;
  _$jscoverage['/navigation-view.js'].lineData[103] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[115] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[117] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[119] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[126] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[146] = 0;
  _$jscoverage['/navigation-view.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view.js'].lineData[156] = 0;
  _$jscoverage['/navigation-view.js'].lineData[159] = 0;
  _$jscoverage['/navigation-view.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[170] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[172] = 0;
  _$jscoverage['/navigation-view.js'].lineData[173] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[175] = 0;
  _$jscoverage['/navigation-view.js'].lineData[176] = 0;
  _$jscoverage['/navigation-view.js'].lineData[177] = 0;
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
  _$jscoverage['/navigation-view.js'].branchData['64'] = [];
  _$jscoverage['/navigation-view.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['92'] = [];
  _$jscoverage['/navigation-view.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['100'] = [];
  _$jscoverage['/navigation-view.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['103'] = [];
  _$jscoverage['/navigation-view.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['116'] = [];
  _$jscoverage['/navigation-view.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['133'] = [];
  _$jscoverage['/navigation-view.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['159'] = [];
  _$jscoverage['/navigation-view.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['167'] = [];
  _$jscoverage['/navigation-view.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['169'] = [];
  _$jscoverage['/navigation-view.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['172'] = [];
  _$jscoverage['/navigation-view.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['172'][2] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['172'][2].init(50, 39, 'self.waitingView.uuid === nextView.uuid');
function visit39_172_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['172'][1].init(30, 59, 'self.waitingView && self.waitingView.uuid === nextView.uuid');
function visit38_172_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['169'][1].init(2309, 5, 'async');
function visit37_169_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['167'][1].init(2258, 25, 'this.viewStack.length > 1');
function visit36_167_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['159'][1].init(26, 6, '!async');
function visit35_159_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['133'][1].init(475, 5, 'async');
function visit34_133_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['116'][1].init(48, 25, 'this.viewStack.length > 1');
function visit33_116_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['103'][2].init(46, 39, 'self.waitingView.uuid === nextView.uuid');
function visit32_103_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['103'][1].init(26, 59, 'self.waitingView && self.waitingView.uuid === nextView.uuid');
function visit31_103_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['100'][1].init(2272, 5, 'async');
function visit30_100_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['92'][1].init(80, 6, '!async');
function visit29_92_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['64'][1].init(410, 5, 'async');
function visit28_64_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['64'][1].ranCondition(result);
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
  push: function(nextView, async) {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[46]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[47]++;
  var bar = this.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[48]++;
  var nextViewEl = nextView.get('el');
  _$jscoverage['/navigation-view.js'].lineData[49]++;
  nextViewEl.css('transform', 'translateX(-9999px) translateZ(0)');
  _$jscoverage['/navigation-view.js'].lineData[50]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[51]++;
  var activeView;
  _$jscoverage['/navigation-view.js'].lineData[52]++;
  var loadingEl = this.get('loadingEl');
  _$jscoverage['/navigation-view.js'].lineData[53]++;
  this.viewStack.push(nextView);
  _$jscoverage['/navigation-view.js'].lineData[54]++;
  if ((activeView = this.get('activeView'))) {
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[56]++;
    activeEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[57]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[64]++;
    if (visit28_64_1(async)) {
      _$jscoverage['/navigation-view.js'].lineData[65]++;
      loadingEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[66]++;
      loadingEl.css('left', '100%');
      _$jscoverage['/navigation-view.js'].lineData[67]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[68]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[75]++;
      this.set('activeView', null);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[77]++;
      nextViewEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[78]++;
      nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
      _$jscoverage['/navigation-view.js'].lineData[79]++;
      nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[86]++;
      this.set('activeView', nextView);
      _$jscoverage['/navigation-view.js'].lineData[87]++;
      self.waitingView = null;
    }
    _$jscoverage['/navigation-view.js'].lineData[89]++;
    bar.forward(nextView.get('title'));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[91]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[92]++;
    if (visit29_92_1(!async)) {
      _$jscoverage['/navigation-view.js'].lineData[93]++;
      nextView.get('el').css('transform', '');
      _$jscoverage['/navigation-view.js'].lineData[94]++;
      this.set('activeView', nextView);
      _$jscoverage['/navigation-view.js'].lineData[95]++;
      self.waitingView = null;
      _$jscoverage['/navigation-view.js'].lineData[96]++;
      loadingEl.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[100]++;
  if (visit30_100_1(async)) {
    _$jscoverage['/navigation-view.js'].lineData[101]++;
    self.waitingView = nextView;
    _$jscoverage['/navigation-view.js'].lineData[102]++;
    nextView.controller.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[103]++;
  if (visit31_103_1(self.waitingView && visit32_103_2(self.waitingView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[104]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[105]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[107]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[108]++;
    loadingEl.hide();
  }
});
  }
}, 
  pop: function(nextView, async) {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[115]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[116]++;
  if (visit33_116_1(this.viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[117]++;
    this.viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[119]++;
    var activeView;
    _$jscoverage['/navigation-view.js'].lineData[120]++;
    var loadingEl = this.get('loadingEl');
    _$jscoverage['/navigation-view.js'].lineData[121]++;
    var bar = this.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[123]++;
    if ((activeView = this.get('activeView'))) {
      _$jscoverage['/navigation-view.js'].lineData[124]++;
      var activeEl = this.animEl = activeView.get('el');
      _$jscoverage['/navigation-view.js'].lineData[125]++;
      activeEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[126]++;
      activeEl.animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[133]++;
      if (visit34_133_1(async)) {
        _$jscoverage['/navigation-view.js'].lineData[134]++;
        this.set('activeView', null);
        _$jscoverage['/navigation-view.js'].lineData[135]++;
        loadingEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[136]++;
        loadingEl.css('left', '-100%');
        _$jscoverage['/navigation-view.js'].lineData[137]++;
        loadingEl.show();
        _$jscoverage['/navigation-view.js'].lineData[138]++;
        loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      } else {
        _$jscoverage['/navigation-view.js'].lineData[146]++;
        var nextViewEl = nextView.get('el');
        _$jscoverage['/navigation-view.js'].lineData[147]++;
        nextViewEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[148]++;
        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
        _$jscoverage['/navigation-view.js'].lineData[149]++;
        nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
        _$jscoverage['/navigation-view.js'].lineData[156]++;
        this.set('activeView', nextView);
      }
    } else {
      _$jscoverage['/navigation-view.js'].lineData[159]++;
      if (visit35_159_1(!async)) {
        _$jscoverage['/navigation-view.js'].lineData[160]++;
        nextView.get('el').css('transform', '');
        _$jscoverage['/navigation-view.js'].lineData[161]++;
        this.set('activeView', nextView);
        _$jscoverage['/navigation-view.js'].lineData[162]++;
        self.waitingView = null;
        _$jscoverage['/navigation-view.js'].lineData[163]++;
        loadingEl.hide();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[167]++;
    bar.back(nextView.get('title'), visit36_167_1(this.viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[169]++;
    if (visit37_169_1(async)) {
      _$jscoverage['/navigation-view.js'].lineData[170]++;
      self.waitingView = nextView;
      _$jscoverage['/navigation-view.js'].lineData[171]++;
      nextView.controller.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[172]++;
  if (visit38_172_1(self.waitingView && visit39_172_2(self.waitingView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[173]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[174]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[175]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[176]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[177]++;
    loadingEl.hide();
  }
});
    }
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
