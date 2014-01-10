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
  _$jscoverage['/navigation-view.js'].lineData[36] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[43] = 0;
  _$jscoverage['/navigation-view.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[47] = 0;
  _$jscoverage['/navigation-view.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view.js'].lineData[51] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[61] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[70] = 0;
  _$jscoverage['/navigation-view.js'].lineData[72] = 0;
  _$jscoverage['/navigation-view.js'].lineData[73] = 0;
  _$jscoverage['/navigation-view.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[82] = 0;
  _$jscoverage['/navigation-view.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[89] = 0;
  _$jscoverage['/navigation-view.js'].lineData[90] = 0;
  _$jscoverage['/navigation-view.js'].lineData[91] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[97] = 0;
  _$jscoverage['/navigation-view.js'].lineData[98] = 0;
  _$jscoverage['/navigation-view.js'].lineData[99] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[101] = 0;
  _$jscoverage['/navigation-view.js'].lineData[102] = 0;
  _$jscoverage['/navigation-view.js'].lineData[103] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[115] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[119] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view.js'].lineData[130] = 0;
  _$jscoverage['/navigation-view.js'].lineData[131] = 0;
  _$jscoverage['/navigation-view.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[142] = 0;
  _$jscoverage['/navigation-view.js'].lineData[143] = 0;
  _$jscoverage['/navigation-view.js'].lineData[144] = 0;
  _$jscoverage['/navigation-view.js'].lineData[151] = 0;
  _$jscoverage['/navigation-view.js'].lineData[154] = 0;
  _$jscoverage['/navigation-view.js'].lineData[155] = 0;
  _$jscoverage['/navigation-view.js'].lineData[156] = 0;
  _$jscoverage['/navigation-view.js'].lineData[157] = 0;
  _$jscoverage['/navigation-view.js'].lineData[158] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[168] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[170] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[172] = 0;
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
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['59'] = [];
  _$jscoverage['/navigation-view.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['87'] = [];
  _$jscoverage['/navigation-view.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['95'] = [];
  _$jscoverage['/navigation-view.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['98'] = [];
  _$jscoverage['/navigation-view.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['111'] = [];
  _$jscoverage['/navigation-view.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['128'] = [];
  _$jscoverage['/navigation-view.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['154'] = [];
  _$jscoverage['/navigation-view.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['162'] = [];
  _$jscoverage['/navigation-view.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['164'] = [];
  _$jscoverage['/navigation-view.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['167'] = [];
  _$jscoverage['/navigation-view.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['167'][2] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['167'][2].init(50, 39, 'self.waitingView.uuid === nextView.uuid');
function visit48_167_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['167'][1].init(30, 59, 'self.waitingView && self.waitingView.uuid === nextView.uuid');
function visit47_167_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['164'][1].init(2309, 5, 'async');
function visit46_164_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['162'][1].init(2258, 25, 'this.viewStack.length > 1');
function visit45_162_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['154'][1].init(26, 6, '!async');
function visit44_154_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['128'][1].init(475, 5, 'async');
function visit43_128_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['111'][1].init(48, 25, 'this.viewStack.length > 1');
function visit42_111_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['98'][2].init(46, 39, 'self.waitingView.uuid === nextView.uuid');
function visit41_98_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['98'][1].init(26, 59, 'self.waitingView && self.waitingView.uuid === nextView.uuid');
function visit40_98_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['95'][1].init(2272, 5, 'async');
function visit39_95_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['87'][1].init(80, 6, '!async');
function visit38_87_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['59'][1].init(410, 5, 'async');
function visit37_59_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['59'][1].ranCondition(result);
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
  var barCfg = this.get('barCfg');
  _$jscoverage['/navigation-view.js'].lineData[36]++;
  barCfg.elBefore = this.get('el')[0].firstChild;
  _$jscoverage['/navigation-view.js'].lineData[37]++;
  this.setInternal('bar', bar = new Bar(barCfg).render());
}, 
  push: function(nextView, async) {
  _$jscoverage['/navigation-view.js'].functionData[3]++;
  _$jscoverage['/navigation-view.js'].lineData[41]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[42]++;
  var bar = this.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[43]++;
  var nextViewEl = nextView.get('el');
  _$jscoverage['/navigation-view.js'].lineData[44]++;
  nextViewEl.css('transform', 'translateX(-9999px) translateZ(0)');
  _$jscoverage['/navigation-view.js'].lineData[45]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[46]++;
  var activeView;
  _$jscoverage['/navigation-view.js'].lineData[47]++;
  var loadingEl = this.get('loadingEl');
  _$jscoverage['/navigation-view.js'].lineData[48]++;
  this.viewStack.push(nextView);
  _$jscoverage['/navigation-view.js'].lineData[49]++;
  if ((activeView = this.get('activeView'))) {
    _$jscoverage['/navigation-view.js'].lineData[50]++;
    var activeEl = activeView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[51]++;
    activeEl.stop(true);
    _$jscoverage['/navigation-view.js'].lineData[52]++;
    activeEl.animate({
  transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
    _$jscoverage['/navigation-view.js'].lineData[59]++;
    if (visit37_59_1(async)) {
      _$jscoverage['/navigation-view.js'].lineData[60]++;
      loadingEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[61]++;
      loadingEl.css('left', '100%');
      _$jscoverage['/navigation-view.js'].lineData[62]++;
      loadingEl.show();
      _$jscoverage['/navigation-view.js'].lineData[63]++;
      loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[70]++;
      this.set('activeView', null);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[72]++;
      nextViewEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[73]++;
      nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
      _$jscoverage['/navigation-view.js'].lineData[74]++;
      nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[81]++;
      this.set('activeView', nextView);
      _$jscoverage['/navigation-view.js'].lineData[82]++;
      self.waitingView = null;
    }
    _$jscoverage['/navigation-view.js'].lineData[84]++;
    bar.forward(nextView.get('title'));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[86]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[87]++;
    if (visit38_87_1(!async)) {
      _$jscoverage['/navigation-view.js'].lineData[88]++;
      nextView.get('el').css('transform', '');
      _$jscoverage['/navigation-view.js'].lineData[89]++;
      this.set('activeView', nextView);
      _$jscoverage['/navigation-view.js'].lineData[90]++;
      self.waitingView = null;
      _$jscoverage['/navigation-view.js'].lineData[91]++;
      loadingEl.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[95]++;
  if (visit39_95_1(async)) {
    _$jscoverage['/navigation-view.js'].lineData[96]++;
    self.waitingView = nextView;
    _$jscoverage['/navigation-view.js'].lineData[97]++;
    nextView.controller.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[4]++;
  _$jscoverage['/navigation-view.js'].lineData[98]++;
  if (visit40_98_1(self.waitingView && visit41_98_2(self.waitingView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[99]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[100]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[101]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[102]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[103]++;
    loadingEl.hide();
  }
});
  }
}, 
  pop: function(nextView, async) {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[111]++;
  if (visit42_111_1(this.viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[112]++;
    this.viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[113]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[114]++;
    var activeView;
    _$jscoverage['/navigation-view.js'].lineData[115]++;
    var loadingEl = this.get('loadingEl');
    _$jscoverage['/navigation-view.js'].lineData[116]++;
    var bar = this.get('bar');
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    if ((activeView = this.get('activeView'))) {
      _$jscoverage['/navigation-view.js'].lineData[119]++;
      var activeEl = this.animEl = activeView.get('el');
      _$jscoverage['/navigation-view.js'].lineData[120]++;
      activeEl.stop(true);
      _$jscoverage['/navigation-view.js'].lineData[121]++;
      activeEl.animate({
  transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      _$jscoverage['/navigation-view.js'].lineData[128]++;
      if (visit43_128_1(async)) {
        _$jscoverage['/navigation-view.js'].lineData[129]++;
        this.set('activeView', null);
        _$jscoverage['/navigation-view.js'].lineData[130]++;
        loadingEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[131]++;
        loadingEl.css('left', '-100%');
        _$jscoverage['/navigation-view.js'].lineData[132]++;
        loadingEl.show();
        _$jscoverage['/navigation-view.js'].lineData[133]++;
        loadingEl.animate({
  left: '0'}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
      } else {
        _$jscoverage['/navigation-view.js'].lineData[141]++;
        var nextViewEl = nextView.get('el');
        _$jscoverage['/navigation-view.js'].lineData[142]++;
        nextViewEl.stop(true);
        _$jscoverage['/navigation-view.js'].lineData[143]++;
        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
        _$jscoverage['/navigation-view.js'].lineData[144]++;
        nextViewEl.animate({
  transform: ''}, {
  useTransition: true, 
  easing: 'ease-in-out', 
  duration: 0.25});
        _$jscoverage['/navigation-view.js'].lineData[151]++;
        this.set('activeView', nextView);
      }
    } else {
      _$jscoverage['/navigation-view.js'].lineData[154]++;
      if (visit44_154_1(!async)) {
        _$jscoverage['/navigation-view.js'].lineData[155]++;
        nextView.get('el').css('transform', '');
        _$jscoverage['/navigation-view.js'].lineData[156]++;
        this.set('activeView', nextView);
        _$jscoverage['/navigation-view.js'].lineData[157]++;
        self.waitingView = null;
        _$jscoverage['/navigation-view.js'].lineData[158]++;
        loadingEl.hide();
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[162]++;
    bar.back(nextView.get('title'), visit45_162_1(this.viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[164]++;
    if (visit46_164_1(async)) {
      _$jscoverage['/navigation-view.js'].lineData[165]++;
      self.waitingView = nextView;
      _$jscoverage['/navigation-view.js'].lineData[166]++;
      nextView.controller.promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[167]++;
  if (visit47_167_1(self.waitingView && visit48_167_2(self.waitingView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[168]++;
    self.waitingView = null;
    _$jscoverage['/navigation-view.js'].lineData[169]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[170]++;
    nextView.get('el').css('transform', '');
    _$jscoverage['/navigation-view.js'].lineData[171]++;
    bar.set('title', nextView.get('title'));
    _$jscoverage['/navigation-view.js'].lineData[172]++;
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
  barCfg: {}, 
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
