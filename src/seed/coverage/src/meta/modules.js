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
if (! _$jscoverage['/meta/modules.js']) {
  _$jscoverage['/meta/modules.js'] = {};
  _$jscoverage['/meta/modules.js'].lineData = [];
  _$jscoverage['/meta/modules.js'].lineData[2] = 0;
  _$jscoverage['/meta/modules.js'].lineData[4] = 0;
  _$jscoverage['/meta/modules.js'].lineData[8] = 0;
  _$jscoverage['/meta/modules.js'].lineData[12] = 0;
  _$jscoverage['/meta/modules.js'].lineData[16] = 0;
  _$jscoverage['/meta/modules.js'].lineData[20] = 0;
  _$jscoverage['/meta/modules.js'].lineData[24] = 0;
  _$jscoverage['/meta/modules.js'].lineData[28] = 0;
  _$jscoverage['/meta/modules.js'].lineData[32] = 0;
  _$jscoverage['/meta/modules.js'].lineData[36] = 0;
  _$jscoverage['/meta/modules.js'].lineData[40] = 0;
  _$jscoverage['/meta/modules.js'].lineData[44] = 0;
  _$jscoverage['/meta/modules.js'].lineData[48] = 0;
  _$jscoverage['/meta/modules.js'].lineData[52] = 0;
  _$jscoverage['/meta/modules.js'].lineData[56] = 0;
  _$jscoverage['/meta/modules.js'].lineData[60] = 0;
  _$jscoverage['/meta/modules.js'].lineData[64] = 0;
  _$jscoverage['/meta/modules.js'].lineData[68] = 0;
  _$jscoverage['/meta/modules.js'].lineData[72] = 0;
  _$jscoverage['/meta/modules.js'].lineData[76] = 0;
  _$jscoverage['/meta/modules.js'].lineData[80] = 0;
  _$jscoverage['/meta/modules.js'].lineData[84] = 0;
  _$jscoverage['/meta/modules.js'].lineData[88] = 0;
  _$jscoverage['/meta/modules.js'].lineData[91] = 0;
  _$jscoverage['/meta/modules.js'].lineData[106] = 0;
  _$jscoverage['/meta/modules.js'].lineData[110] = 0;
  _$jscoverage['/meta/modules.js'].lineData[114] = 0;
  _$jscoverage['/meta/modules.js'].lineData[118] = 0;
  _$jscoverage['/meta/modules.js'].lineData[122] = 0;
  _$jscoverage['/meta/modules.js'].lineData[126] = 0;
  _$jscoverage['/meta/modules.js'].lineData[129] = 0;
  _$jscoverage['/meta/modules.js'].lineData[145] = 0;
  _$jscoverage['/meta/modules.js'].lineData[149] = 0;
  _$jscoverage['/meta/modules.js'].lineData[153] = 0;
  _$jscoverage['/meta/modules.js'].lineData[157] = 0;
  _$jscoverage['/meta/modules.js'].lineData[161] = 0;
  _$jscoverage['/meta/modules.js'].lineData[165] = 0;
  _$jscoverage['/meta/modules.js'].lineData[169] = 0;
  _$jscoverage['/meta/modules.js'].lineData[173] = 0;
  _$jscoverage['/meta/modules.js'].lineData[177] = 0;
  _$jscoverage['/meta/modules.js'].lineData[181] = 0;
  _$jscoverage['/meta/modules.js'].lineData[185] = 0;
  _$jscoverage['/meta/modules.js'].lineData[189] = 0;
  _$jscoverage['/meta/modules.js'].lineData[193] = 0;
  _$jscoverage['/meta/modules.js'].lineData[197] = 0;
  _$jscoverage['/meta/modules.js'].lineData[201] = 0;
  _$jscoverage['/meta/modules.js'].lineData[205] = 0;
  _$jscoverage['/meta/modules.js'].lineData[208] = 0;
  _$jscoverage['/meta/modules.js'].lineData[216] = 0;
  _$jscoverage['/meta/modules.js'].lineData[220] = 0;
  _$jscoverage['/meta/modules.js'].lineData[224] = 0;
  _$jscoverage['/meta/modules.js'].lineData[228] = 0;
  _$jscoverage['/meta/modules.js'].lineData[232] = 0;
  _$jscoverage['/meta/modules.js'].lineData[236] = 0;
  _$jscoverage['/meta/modules.js'].lineData[240] = 0;
  _$jscoverage['/meta/modules.js'].lineData[244] = 0;
  _$jscoverage['/meta/modules.js'].lineData[248] = 0;
  _$jscoverage['/meta/modules.js'].lineData[252] = 0;
  _$jscoverage['/meta/modules.js'].lineData[256] = 0;
  _$jscoverage['/meta/modules.js'].lineData[260] = 0;
  _$jscoverage['/meta/modules.js'].lineData[264] = 0;
  _$jscoverage['/meta/modules.js'].lineData[268] = 0;
  _$jscoverage['/meta/modules.js'].lineData[273] = 0;
}
if (! _$jscoverage['/meta/modules.js'].functionData) {
  _$jscoverage['/meta/modules.js'].functionData = [];
  _$jscoverage['/meta/modules.js'].functionData[0] = 0;
  _$jscoverage['/meta/modules.js'].functionData[1] = 0;
}
if (! _$jscoverage['/meta/modules.js'].branchData) {
  _$jscoverage['/meta/modules.js'].branchData = {};
  _$jscoverage['/meta/modules.js'].branchData['133'] = [];
  _$jscoverage['/meta/modules.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/meta/modules.js'].branchData['211'] = [];
  _$jscoverage['/meta/modules.js'].branchData['211'][1] = new BranchData();
}
_$jscoverage['/meta/modules.js'].branchData['211'][1].init(-1, 65, 'Features.isTouchEventSupported() || Features.isMsPointerSupported()');
function visit495_211_1(result) {
  _$jscoverage['/meta/modules.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/meta/modules.js'].branchData['133'][1].init(45, 67, 'Features.isTouchEventSupported() || Features.isMsPointerSupported()');
function visit494_133_1(result) {
  _$jscoverage['/meta/modules.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/meta/modules.js'].lineData[2]++;
(function(config, Features, UA) {
  _$jscoverage['/meta/modules.js'].functionData[0]++;
  _$jscoverage['/meta/modules.js'].lineData[4]++;
  config({
  'anim': {
  requires: ['dom', 'anim/base', 'anim/timer', KISSY.Features.isTransitionSupported() ? "anim/transition" : ""]}});
  _$jscoverage['/meta/modules.js'].lineData[8]++;
  config({
  'anim/base': {
  requires: ['dom', 'event/custom']}});
  _$jscoverage['/meta/modules.js'].lineData[12]++;
  config({
  'anim/timer': {
  requires: ['dom', 'anim/base']}});
  _$jscoverage['/meta/modules.js'].lineData[16]++;
  config({
  'anim/transition': {
  requires: ['dom', 'event', 'anim/base']}});
  _$jscoverage['/meta/modules.js'].lineData[20]++;
  config({
  'base': {
  requires: ['event/custom']}});
  _$jscoverage['/meta/modules.js'].lineData[24]++;
  config({
  'button': {
  requires: ['node', 'component/control']}});
  _$jscoverage['/meta/modules.js'].lineData[28]++;
  config({
  'color': {
  requires: ['base']}});
  _$jscoverage['/meta/modules.js'].lineData[32]++;
  config({
  'combobox': {
  requires: ['node', 'component/control', 'menu', 'base', 'io']}});
  _$jscoverage['/meta/modules.js'].lineData[36]++;
  config({
  'component/container': {
  requires: ['component/control', 'component/manager']}});
  _$jscoverage['/meta/modules.js'].lineData[40]++;
  config({
  'component/control': {
  requires: ['node', 'base', 'promise', 'component/manager', 'xtemplate/runtime']}});
  _$jscoverage['/meta/modules.js'].lineData[44]++;
  config({
  'component/extension/align': {
  requires: ['node']}});
  _$jscoverage['/meta/modules.js'].lineData[48]++;
  config({
  'component/extension/delegate-children': {
  requires: ['node', 'component/manager']}});
  _$jscoverage['/meta/modules.js'].lineData[52]++;
  config({
  'component/plugin/drag': {
  requires: ['base', 'dd']}});
  _$jscoverage['/meta/modules.js'].lineData[56]++;
  config({
  'component/plugin/resize': {
  requires: ['resizable']}});
  _$jscoverage['/meta/modules.js'].lineData[60]++;
  config({
  'date/format': {
  requires: ['date/gregorian', 'i18n!date']}});
  _$jscoverage['/meta/modules.js'].lineData[64]++;
  config({
  'date/gregorian': {
  requires: ['i18n!date']}});
  _$jscoverage['/meta/modules.js'].lineData[68]++;
  config({
  'date/picker': {
  requires: ['node', 'date/gregorian', 'i18n!date/picker', 'component/control', 'date/format']}});
  _$jscoverage['/meta/modules.js'].lineData[72]++;
  config({
  'date/popup-picker': {
  requires: ['date/picker', 'component/extension/align', 'component/extension/shim']}});
  _$jscoverage['/meta/modules.js'].lineData[76]++;
  config({
  'dd': {
  requires: ['node', 'base']}});
  _$jscoverage['/meta/modules.js'].lineData[80]++;
  config({
  'dd/plugin/constrain': {
  requires: ['base', 'node']}});
  _$jscoverage['/meta/modules.js'].lineData[84]++;
  config({
  'dd/plugin/proxy': {
  requires: ['node', 'base', 'dd']}});
  _$jscoverage['/meta/modules.js'].lineData[88]++;
  config({
  'dd/plugin/scroll': {
  requires: ['dd', 'base', 'node']}});
  _$jscoverage['/meta/modules.js'].lineData[91]++;
  config({
  "dom/basic": {
  "alias": ['dom/base', Features.isIELessThan(9) ? 'dom/ie' : '', Features.isClassListSupported() ? '' : 'dom/class-list']}, 
  "dom": {
  "alias": ['dom/basic', !Features.isQuerySelectorSupported() ? 'dom/selector' : '']}});
  _$jscoverage['/meta/modules.js'].lineData[106]++;
  config({
  'dom/class-list': {
  requires: ['dom/base']}});
  _$jscoverage['/meta/modules.js'].lineData[110]++;
  config({
  'dom/ie': {
  requires: ['dom/base']}});
  _$jscoverage['/meta/modules.js'].lineData[114]++;
  config({
  'dom/selector': {
  requires: ['dom/basic']}});
  _$jscoverage['/meta/modules.js'].lineData[118]++;
  config({
  'editor': {
  requires: ['node', 'html-parser', 'component/control']}});
  _$jscoverage['/meta/modules.js'].lineData[122]++;
  config({
  'event': {
  requires: ['event/dom', 'event/custom']}});
  _$jscoverage['/meta/modules.js'].lineData[126]++;
  config({
  'event/custom': {
  requires: ['event/base']}});
  _$jscoverage['/meta/modules.js'].lineData[129]++;
  config({
  "event/dom": {
  "alias": ["event/dom/base", visit494_133_1(Features.isTouchEventSupported() || Features.isMsPointerSupported()) ? 'event/dom/touch' : '', Features.isDeviceMotionSupported() ? 'event/dom/shake' : '', Features.isHashChangeSupported() ? '' : 'event/dom/hashchange', Features.isIELessThan(9) ? 'event/dom/ie' : '', UA.ie ? '' : 'event/dom/focusin']}});
  _$jscoverage['/meta/modules.js'].lineData[145]++;
  config({
  'event/dom/base': {
  requires: ['event/base', 'dom']}});
  _$jscoverage['/meta/modules.js'].lineData[149]++;
  config({
  'event/dom/focusin': {
  requires: ['event/dom/base']}});
  _$jscoverage['/meta/modules.js'].lineData[153]++;
  config({
  'event/dom/hashchange': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/meta/modules.js'].lineData[157]++;
  config({
  'event/dom/ie': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/meta/modules.js'].lineData[161]++;
  config({
  'event/dom/shake': {
  requires: ['event/dom/base']}});
  _$jscoverage['/meta/modules.js'].lineData[165]++;
  config({
  'event/dom/touch': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/meta/modules.js'].lineData[169]++;
  config({
  'filter-menu': {
  requires: ['menu', 'node', 'component/extension/content-render']}});
  _$jscoverage['/meta/modules.js'].lineData[173]++;
  config({
  'io': {
  requires: ['dom', 'event/custom', 'event']}});
  _$jscoverage['/meta/modules.js'].lineData[177]++;
  config({
  'kison': {
  requires: ['base']}});
  _$jscoverage['/meta/modules.js'].lineData[181]++;
  config({
  'menu': {
  requires: ['node', 'component/container', 'component/extension/delegate-children', 'component/control', 'component/extension/content-render', 'component/extension/align', 'component/extension/shim']}});
  _$jscoverage['/meta/modules.js'].lineData[185]++;
  config({
  'menubutton': {
  requires: ['node', 'button', 'component/extension/content-render', 'menu']}});
  _$jscoverage['/meta/modules.js'].lineData[189]++;
  config({
  'mvc': {
  requires: ['base', 'node', 'io', 'json']}});
  _$jscoverage['/meta/modules.js'].lineData[193]++;
  config({
  'node': {
  requires: ['dom', 'event/dom', 'anim']}});
  _$jscoverage['/meta/modules.js'].lineData[197]++;
  config({
  'overlay': {
  requires: ['component/container', 'component/extension/shim', 'component/extension/align', 'node', 'component/extension/content-render']}});
  _$jscoverage['/meta/modules.js'].lineData[201]++;
  config({
  'resizable': {
  requires: ['node', 'base', 'dd']}});
  _$jscoverage['/meta/modules.js'].lineData[205]++;
  config({
  'resizable/plugin/proxy': {
  requires: ['base', 'node']}});
  _$jscoverage['/meta/modules.js'].lineData[208]++;
  config({
  "scroll-view": {
  "alias": [visit495_211_1(Features.isTouchEventSupported() || Features.isMsPointerSupported()) ? 'scroll-view/drag' : 'scroll-view/base']}});
  _$jscoverage['/meta/modules.js'].lineData[216]++;
  config({
  'scroll-view/base': {
  requires: ['node', 'anim', 'component/container', 'component/extension/content-render']}});
  _$jscoverage['/meta/modules.js'].lineData[220]++;
  config({
  'scroll-view/drag': {
  requires: ['scroll-view/base', 'node', 'anim']}});
  _$jscoverage['/meta/modules.js'].lineData[224]++;
  config({
  'scroll-view/plugin/pull-to-refresh': {
  requires: ['base']}});
  _$jscoverage['/meta/modules.js'].lineData[228]++;
  config({
  'scroll-view/plugin/scrollbar': {
  requires: ['base', 'node', 'component/control']}});
  _$jscoverage['/meta/modules.js'].lineData[232]++;
  config({
  'separator': {
  requires: ['component/control']}});
  _$jscoverage['/meta/modules.js'].lineData[236]++;
  config({
  'split-button': {
  requires: ['component/container', 'button', 'menubutton']}});
  _$jscoverage['/meta/modules.js'].lineData[240]++;
  config({
  'stylesheet': {
  requires: ['dom']}});
  _$jscoverage['/meta/modules.js'].lineData[244]++;
  config({
  'swf': {
  requires: ['dom', 'json', 'base']}});
  _$jscoverage['/meta/modules.js'].lineData[248]++;
  config({
  'tabs': {
  requires: ['component/container', 'toolbar', 'button']}});
  _$jscoverage['/meta/modules.js'].lineData[252]++;
  config({
  'toolbar': {
  requires: ['component/container', 'component/extension/delegate-children', 'node']}});
  _$jscoverage['/meta/modules.js'].lineData[256]++;
  config({
  'tree': {
  requires: ['node', 'component/container', 'component/extension/content-render', 'component/extension/delegate-children']}});
  _$jscoverage['/meta/modules.js'].lineData[260]++;
  config({
  'xtemplate': {
  requires: ['xtemplate/runtime', 'xtemplate/compiler']}});
  _$jscoverage['/meta/modules.js'].lineData[264]++;
  config({
  'xtemplate/compiler': {
  requires: ['xtemplate/runtime']}});
  _$jscoverage['/meta/modules.js'].lineData[268]++;
  config({
  'xtemplate/nodejs': {
  requires: ['xtemplate']}});
})(function(c) {
  _$jscoverage['/meta/modules.js'].functionData[1]++;
  _$jscoverage['/meta/modules.js'].lineData[273]++;
  KISSY.config('modules', c);
}, KISSY.Features, KISSY.UA);
