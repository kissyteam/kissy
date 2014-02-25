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
if (! _$jscoverage['/modules.js']) {
  _$jscoverage['/modules.js'] = {};
  _$jscoverage['/modules.js'].lineData = [];
  _$jscoverage['/modules.js'].lineData[3] = 0;
  _$jscoverage['/modules.js'].lineData[4] = 0;
  _$jscoverage['/modules.js'].lineData[9] = 0;
  _$jscoverage['/modules.js'].lineData[13] = 0;
  _$jscoverage['/modules.js'].lineData[17] = 0;
  _$jscoverage['/modules.js'].lineData[21] = 0;
  _$jscoverage['/modules.js'].lineData[25] = 0;
  _$jscoverage['/modules.js'].lineData[29] = 0;
  _$jscoverage['/modules.js'].lineData[33] = 0;
  _$jscoverage['/modules.js'].lineData[37] = 0;
  _$jscoverage['/modules.js'].lineData[41] = 0;
  _$jscoverage['/modules.js'].lineData[45] = 0;
  _$jscoverage['/modules.js'].lineData[49] = 0;
  _$jscoverage['/modules.js'].lineData[53] = 0;
  _$jscoverage['/modules.js'].lineData[57] = 0;
  _$jscoverage['/modules.js'].lineData[61] = 0;
  _$jscoverage['/modules.js'].lineData[65] = 0;
  _$jscoverage['/modules.js'].lineData[69] = 0;
  _$jscoverage['/modules.js'].lineData[73] = 0;
  _$jscoverage['/modules.js'].lineData[77] = 0;
  _$jscoverage['/modules.js'].lineData[81] = 0;
  _$jscoverage['/modules.js'].lineData[85] = 0;
  _$jscoverage['/modules.js'].lineData[89] = 0;
  _$jscoverage['/modules.js'].lineData[93] = 0;
  _$jscoverage['/modules.js'].lineData[97] = 0;
  _$jscoverage['/modules.js'].lineData[101] = 0;
  _$jscoverage['/modules.js'].lineData[104] = 0;
  _$jscoverage['/modules.js'].lineData[119] = 0;
  _$jscoverage['/modules.js'].lineData[123] = 0;
  _$jscoverage['/modules.js'].lineData[127] = 0;
  _$jscoverage['/modules.js'].lineData[131] = 0;
  _$jscoverage['/modules.js'].lineData[135] = 0;
  _$jscoverage['/modules.js'].lineData[139] = 0;
  _$jscoverage['/modules.js'].lineData[142] = 0;
  _$jscoverage['/modules.js'].lineData[160] = 0;
  _$jscoverage['/modules.js'].lineData[164] = 0;
  _$jscoverage['/modules.js'].lineData[168] = 0;
  _$jscoverage['/modules.js'].lineData[172] = 0;
  _$jscoverage['/modules.js'].lineData[176] = 0;
  _$jscoverage['/modules.js'].lineData[180] = 0;
  _$jscoverage['/modules.js'].lineData[184] = 0;
  _$jscoverage['/modules.js'].lineData[188] = 0;
  _$jscoverage['/modules.js'].lineData[192] = 0;
  _$jscoverage['/modules.js'].lineData[196] = 0;
  _$jscoverage['/modules.js'].lineData[200] = 0;
  _$jscoverage['/modules.js'].lineData[204] = 0;
  _$jscoverage['/modules.js'].lineData[208] = 0;
  _$jscoverage['/modules.js'].lineData[212] = 0;
  _$jscoverage['/modules.js'].lineData[216] = 0;
  _$jscoverage['/modules.js'].lineData[220] = 0;
  _$jscoverage['/modules.js'].lineData[224] = 0;
  _$jscoverage['/modules.js'].lineData[228] = 0;
  _$jscoverage['/modules.js'].lineData[232] = 0;
  _$jscoverage['/modules.js'].lineData[235] = 0;
  _$jscoverage['/modules.js'].lineData[240] = 0;
  _$jscoverage['/modules.js'].lineData[244] = 0;
  _$jscoverage['/modules.js'].lineData[248] = 0;
  _$jscoverage['/modules.js'].lineData[252] = 0;
  _$jscoverage['/modules.js'].lineData[256] = 0;
  _$jscoverage['/modules.js'].lineData[260] = 0;
  _$jscoverage['/modules.js'].lineData[264] = 0;
  _$jscoverage['/modules.js'].lineData[268] = 0;
  _$jscoverage['/modules.js'].lineData[272] = 0;
  _$jscoverage['/modules.js'].lineData[276] = 0;
  _$jscoverage['/modules.js'].lineData[280] = 0;
  _$jscoverage['/modules.js'].lineData[284] = 0;
  _$jscoverage['/modules.js'].lineData[288] = 0;
  _$jscoverage['/modules.js'].lineData[292] = 0;
  _$jscoverage['/modules.js'].lineData[296] = 0;
  _$jscoverage['/modules.js'].lineData[301] = 0;
}
if (! _$jscoverage['/modules.js'].functionData) {
  _$jscoverage['/modules.js'].functionData = [];
  _$jscoverage['/modules.js'].functionData[0] = 0;
  _$jscoverage['/modules.js'].functionData[1] = 0;
}
if (! _$jscoverage['/modules.js'].branchData) {
  _$jscoverage['/modules.js'].branchData = {};
  _$jscoverage['/modules.js'].branchData['6'] = [];
  _$jscoverage['/modules.js'].branchData['6'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['108'] = [];
  _$jscoverage['/modules.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['152'] = [];
  _$jscoverage['/modules.js'].branchData['152'][1] = new BranchData();
}
_$jscoverage['/modules.js'].branchData['152'][1].init(310, 13, 'UA.ieMode < 9');
function visit12_152_1(result) {
  _$jscoverage['/modules.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['108'][1].init(37, 13, 'UA.ieMode < 9');
function visit11_108_1(result) {
  _$jscoverage['/modules.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['6'][1].init(17, 60, 'KISSY.Feature.getVendorCssPropPrefix(\'transition\') !== false');
function visit10_6_1(result) {
  _$jscoverage['/modules.js'].branchData['6'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].lineData[3]++;
(function(config, Feature, UA) {
  _$jscoverage['/modules.js'].functionData[0]++;
  _$jscoverage['/modules.js'].lineData[4]++;
  config({
  'anim/transition?': {
  alias: visit10_6_1(KISSY.Feature.getVendorCssPropPrefix('transition') !== false) ? 'anim/transition' : ''}});
  _$jscoverage['/modules.js'].lineData[9]++;
  config({
  anim: {
  requires: ['anim/base', 'anim/timer', 'anim/transition?']}});
  _$jscoverage['/modules.js'].lineData[13]++;
  config({
  'anim/base': {
  requires: ['dom', 'promise']}});
  _$jscoverage['/modules.js'].lineData[17]++;
  config({
  'anim/timer': {
  requires: ['dom', 'anim/base']}});
  _$jscoverage['/modules.js'].lineData[21]++;
  config({
  'anim/transition': {
  requires: ['dom', 'event/dom', 'anim/base']}});
  _$jscoverage['/modules.js'].lineData[25]++;
  config({
  attribute: {
  requires: ['event/custom']}});
  _$jscoverage['/modules.js'].lineData[29]++;
  config({
  base: {
  requires: ['attribute']}});
  _$jscoverage['/modules.js'].lineData[33]++;
  config({
  button: {
  requires: ['node', 'component/control']}});
  _$jscoverage['/modules.js'].lineData[37]++;
  config({
  color: {
  requires: ['attribute']}});
  _$jscoverage['/modules.js'].lineData[41]++;
  config({
  combobox: {
  requires: ['node', 'component/control', 'menu', 'attribute', 'io']}});
  _$jscoverage['/modules.js'].lineData[45]++;
  config({
  'component/container': {
  requires: ['component/control', 'component/manager']}});
  _$jscoverage['/modules.js'].lineData[49]++;
  config({
  'component/control': {
  requires: ['node', 'base', 'promise', 'component/manager', 'xtemplate/runtime']}});
  _$jscoverage['/modules.js'].lineData[53]++;
  config({
  'component/extension/align': {
  requires: ['node']}});
  _$jscoverage['/modules.js'].lineData[57]++;
  config({
  'component/extension/content-render': {
  requires: ['component/extension/content-xtpl']}});
  _$jscoverage['/modules.js'].lineData[61]++;
  config({
  'component/extension/delegate-children': {
  requires: ['node', 'component/manager']}});
  _$jscoverage['/modules.js'].lineData[65]++;
  config({
  'component/plugin/drag': {
  requires: ['dd']}});
  _$jscoverage['/modules.js'].lineData[69]++;
  config({
  'component/plugin/resize': {
  requires: ['resizable']}});
  _$jscoverage['/modules.js'].lineData[73]++;
  config({
  'date/format': {
  requires: ['date/gregorian', 'i18n!date']}});
  _$jscoverage['/modules.js'].lineData[77]++;
  config({
  'date/gregorian': {
  requires: ['i18n!date']}});
  _$jscoverage['/modules.js'].lineData[81]++;
  config({
  'date/picker': {
  requires: ['node', 'date/gregorian', 'i18n!date/picker', 'component/control', 'date/format', 'date/picker-xtpl']}});
  _$jscoverage['/modules.js'].lineData[85]++;
  config({
  'date/popup-picker': {
  requires: ['date/picker-xtpl', 'date/picker', 'component/extension/shim', 'component/extension/align']}});
  _$jscoverage['/modules.js'].lineData[89]++;
  config({
  dd: {
  requires: ['node', 'base']}});
  _$jscoverage['/modules.js'].lineData[93]++;
  config({
  'dd/plugin/constrain': {
  requires: ['node', 'base']}});
  _$jscoverage['/modules.js'].lineData[97]++;
  config({
  'dd/plugin/proxy': {
  requires: ['node', 'dd', 'base']}});
  _$jscoverage['/modules.js'].lineData[101]++;
  config({
  'dd/plugin/scroll': {
  requires: ['node', 'dd', 'base']}});
  _$jscoverage['/modules.js'].lineData[104]++;
  config({
  'dom/basic': {
  alias: ['dom/base', visit11_108_1(UA.ieMode < 9) ? 'dom/ie' : '', Feature.isClassListSupported() ? '' : 'dom/class-list']}, 
  dom: {
  alias: ['dom/basic', !Feature.isQuerySelectorSupported() ? 'dom/selector' : '']}});
  _$jscoverage['/modules.js'].lineData[119]++;
  config({
  'dom/class-list': {
  requires: ['dom/base']}});
  _$jscoverage['/modules.js'].lineData[123]++;
  config({
  'dom/ie': {
  requires: ['dom/base']}});
  _$jscoverage['/modules.js'].lineData[127]++;
  config({
  'dom/selector': {
  requires: ['dom/basic']}});
  _$jscoverage['/modules.js'].lineData[131]++;
  config({
  editor: {
  requires: ['node', 'html-parser', 'component/control']}});
  _$jscoverage['/modules.js'].lineData[135]++;
  config({
  event: {
  requires: ['event/dom', 'event/custom']}});
  _$jscoverage['/modules.js'].lineData[139]++;
  config({
  'event/custom': {
  requires: ['event/base']}});
  _$jscoverage['/modules.js'].lineData[142]++;
  config({
  'event/dom': {
  alias: ['event/dom/base', Feature.isTouchGestureSupported() ? 'event/dom/touch' : '', Feature.isDeviceMotionSupported() ? 'event/dom/shake' : '', Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange', visit12_152_1(UA.ieMode < 9) ? 'event/dom/ie' : '', Feature.isInputEventSupported() ? '' : 'event/dom/input', UA.ie ? '' : 'event/dom/focusin']}});
  _$jscoverage['/modules.js'].lineData[160]++;
  config({
  'event/dom/base': {
  requires: ['event/base', 'dom']}});
  _$jscoverage['/modules.js'].lineData[164]++;
  config({
  'event/dom/focusin': {
  requires: ['event/dom/base']}});
  _$jscoverage['/modules.js'].lineData[168]++;
  config({
  'event/dom/hashchange': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/modules.js'].lineData[172]++;
  config({
  'event/dom/ie': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/modules.js'].lineData[176]++;
  config({
  'event/dom/input': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/modules.js'].lineData[180]++;
  config({
  'event/dom/shake': {
  requires: ['event/dom/base']}});
  _$jscoverage['/modules.js'].lineData[184]++;
  config({
  'event/dom/touch': {
  requires: ['event/dom/base', 'dom']}});
  _$jscoverage['/modules.js'].lineData[188]++;
  config({
  feature: {
  requires: ['ua']}});
  _$jscoverage['/modules.js'].lineData[192]++;
  config({
  'filter-menu': {
  requires: ['menu', 'component/extension/content-xtpl', 'component/extension/content-render']}});
  _$jscoverage['/modules.js'].lineData[196]++;
  config({
  io: {
  requires: ['dom', 'event/custom', 'promise', 'event/dom']}});
  _$jscoverage['/modules.js'].lineData[200]++;
  config({
  menu: {
  requires: ['node', 'component/container', 'component/extension/delegate-children', 'component/control', 'component/extension/content-render', 'component/extension/content-xtpl', 'component/extension/align', 'component/extension/shim']}});
  _$jscoverage['/modules.js'].lineData[204]++;
  config({
  menubutton: {
  requires: ['node', 'button', 'component/extension/content-xtpl', 'component/extension/content-render', 'menu']}});
  _$jscoverage['/modules.js'].lineData[208]++;
  config({
  'navigation-view': {
  requires: ['node', 'component/container', 'component/extension/content-xtpl', 'component/extension/content-render']}});
  _$jscoverage['/modules.js'].lineData[212]++;
  config({
  'navigation-view/bar': {
  requires: ['component/control', 'button']}});
  _$jscoverage['/modules.js'].lineData[216]++;
  config({
  node: {
  requires: ['dom', 'event/dom', 'anim']}});
  _$jscoverage['/modules.js'].lineData[220]++;
  config({
  overlay: {
  requires: ['component/container', 'component/extension/shim', 'component/extension/align', 'node', 'component/extension/content-xtpl', 'component/extension/content-render']}});
  _$jscoverage['/modules.js'].lineData[224]++;
  config({
  resizable: {
  requires: ['node', 'base', 'dd']}});
  _$jscoverage['/modules.js'].lineData[228]++;
  config({
  'resizable/plugin/proxy': {
  requires: ['node', 'base']}});
  _$jscoverage['/modules.js'].lineData[232]++;
  config({
  router: {
  requires: ['uri', 'event/dom', 'event/custom']}});
  _$jscoverage['/modules.js'].lineData[235]++;
  config({
  'scroll-view': {
  alias: Feature.isTouchGestureSupported() ? 'scroll-view/drag' : 'scroll-view/base'}});
  _$jscoverage['/modules.js'].lineData[240]++;
  config({
  'scroll-view/base': {
  requires: ['node', 'anim', 'component/container', 'component/extension/content-render']}});
  _$jscoverage['/modules.js'].lineData[244]++;
  config({
  'scroll-view/drag': {
  requires: ['scroll-view/base', 'node', 'anim']}});
  _$jscoverage['/modules.js'].lineData[248]++;
  config({
  'scroll-view/plugin/pull-to-refresh': {
  requires: ['base']}});
  _$jscoverage['/modules.js'].lineData[252]++;
  config({
  'scroll-view/plugin/scrollbar': {
  requires: ['base', 'node', 'component/control']}});
  _$jscoverage['/modules.js'].lineData[256]++;
  config({
  separator: {
  requires: ['component/control']}});
  _$jscoverage['/modules.js'].lineData[260]++;
  config({
  'split-button': {
  requires: ['component/container', 'button', 'menubutton']}});
  _$jscoverage['/modules.js'].lineData[264]++;
  config({
  stylesheet: {
  requires: ['dom']}});
  _$jscoverage['/modules.js'].lineData[268]++;
  config({
  swf: {
  requires: ['dom', 'json', 'attribute']}});
  _$jscoverage['/modules.js'].lineData[272]++;
  config({
  tabs: {
  requires: ['component/container', 'toolbar', 'button']}});
  _$jscoverage['/modules.js'].lineData[276]++;
  config({
  toolbar: {
  requires: ['component/container', 'component/extension/delegate-children', 'node']}});
  _$jscoverage['/modules.js'].lineData[280]++;
  config({
  tree: {
  requires: ['node', 'component/container', 'component/extension/content-xtpl', 'component/extension/content-render', 'component/extension/delegate-children']}});
  _$jscoverage['/modules.js'].lineData[284]++;
  config({
  uri: {
  requires: ['path']}});
  _$jscoverage['/modules.js'].lineData[288]++;
  config({
  xtemplate: {
  requires: ['xtemplate/runtime', 'xtemplate/compiler']}});
  _$jscoverage['/modules.js'].lineData[292]++;
  config({
  'xtemplate/compiler': {
  requires: ['xtemplate/runtime']}});
  _$jscoverage['/modules.js'].lineData[296]++;
  config({
  'xtemplate/runtime': {
  requires: ['path']}});
})(function(c) {
  _$jscoverage['/modules.js'].functionData[1]++;
  _$jscoverage['/modules.js'].lineData[301]++;
  KISSY.config('modules', c);
}, KISSY.Feature, KISSY.UA);
