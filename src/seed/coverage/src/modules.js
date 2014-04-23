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
  _$jscoverage['/modules.js'].lineData[2] = 0;
  _$jscoverage['/modules.js'].lineData[3] = 0;
  _$jscoverage['/modules.js'].lineData[279] = 0;
  _$jscoverage['/modules.js'].lineData[286] = 0;
  _$jscoverage['/modules.js'].lineData[287] = 0;
  _$jscoverage['/modules.js'].lineData[288] = 0;
  _$jscoverage['/modules.js'].lineData[289] = 0;
  _$jscoverage['/modules.js'].lineData[290] = 0;
  _$jscoverage['/modules.js'].lineData[292] = 0;
  _$jscoverage['/modules.js'].lineData[294] = 0;
  _$jscoverage['/modules.js'].lineData[297] = 0;
  _$jscoverage['/modules.js'].lineData[298] = 0;
  _$jscoverage['/modules.js'].lineData[309] = 0;
  _$jscoverage['/modules.js'].lineData[316] = 0;
  _$jscoverage['/modules.js'].lineData[317] = 0;
  _$jscoverage['/modules.js'].lineData[320] = 0;
  _$jscoverage['/modules.js'].lineData[321] = 0;
  _$jscoverage['/modules.js'].lineData[324] = 0;
  _$jscoverage['/modules.js'].lineData[325] = 0;
  _$jscoverage['/modules.js'].lineData[328] = 0;
  _$jscoverage['/modules.js'].lineData[329] = 0;
  _$jscoverage['/modules.js'].lineData[332] = 0;
  _$jscoverage['/modules.js'].lineData[333] = 0;
  _$jscoverage['/modules.js'].lineData[336] = 0;
}
if (! _$jscoverage['/modules.js'].functionData) {
  _$jscoverage['/modules.js'].functionData = [];
  _$jscoverage['/modules.js'].functionData[0] = 0;
  _$jscoverage['/modules.js'].functionData[1] = 0;
}
if (! _$jscoverage['/modules.js'].branchData) {
  _$jscoverage['/modules.js'].branchData = {};
  _$jscoverage['/modules.js'].branchData['288'] = [];
  _$jscoverage['/modules.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['301'] = [];
  _$jscoverage['/modules.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['312'] = [];
  _$jscoverage['/modules.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['316'] = [];
  _$jscoverage['/modules.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['320'] = [];
  _$jscoverage['/modules.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['324'] = [];
  _$jscoverage['/modules.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['328'] = [];
  _$jscoverage['/modules.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['332'] = [];
  _$jscoverage['/modules.js'].branchData['332'][1] = new BranchData();
}
_$jscoverage['/modules.js'].branchData['332'][1].init(6637, 24, '!isTouchGestureSupported');
function visit17_332_1(result) {
  _$jscoverage['/modules.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['328'][1].init(6556, 22, '!win.DeviceMotionEvent');
function visit16_328_1(result) {
  _$jscoverage['/modules.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['324'][1].init(6472, 24, '!isTouchGestureSupported');
function visit15_324_1(result) {
  _$jscoverage['/modules.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['320'][1].init(6389, 24, '!isTouchGestureSupported');
function visit14_320_1(result) {
  _$jscoverage['/modules.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['316'][1].init(6302, 24, '!isTouchGestureSupported');
function visit13_316_1(result) {
  _$jscoverage['/modules.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['312'][1].init(101, 13, 'UA.ieMode < 9');
function visit12_312_1(result) {
  _$jscoverage['/modules.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['301'][1].init(31, 13, 'UA.ieMode < 9');
function visit11_301_1(result) {
  _$jscoverage['/modules.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['288'][1].init(19, 23, 'typeof name === "string"');
function visit10_288_1(result) {
  _$jscoverage['/modules.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].lineData[2]++;
(function(S) {
  _$jscoverage['/modules.js'].functionData[0]++;
  _$jscoverage['/modules.js'].lineData[3]++;
  S.config("requires", {
  "anim/base": ["dom", "promise"], 
  "anim/timer": ["dom", "./base"], 
  "anim/transition": ["anim/base"], 
  "attribute": ["event/custom"], 
  "base": ["attribute"], 
  "button": ["component/control"], 
  "color": ["attribute"], 
  "combobox": ["menu", "io"], 
  "combobox/multi-word": ["combobox"], 
  "component/container": ["component/control"], 
  "component/control": ["node", "event/gesture/base", "event/gesture/tap", "component/manager", "base", "xtemplate/runtime"], 
  "component/extension/align": ["node", "ua"], 
  "component/extension/content-box": ["component/extension/content-xtpl"], 
  "component/extension/delegate-children": ["component/manager", "event/gesture/base", "event/gesture/tap"], 
  "component/extension/shim": ["ua"], 
  "component/plugin/drag": ["dd"], 
  "component/plugin/resize": ["resizable"], 
  "date/format": ["i18n!date", "./gregorian/utils", "./gregorian/const", "./const"], 
  "date/gregorian": ["i18n!date"], 
  "date/picker": ["i18n!date/picker", "component/control", "date/picker-xtpl", "./gregorian/utils", "i18n!date", "./gregorian/const", "./const"], 
  "date/popup-picker": ["date/picker", "component/extension/shim", "component/extension/align"], 
  "dd": ["node", "base", "event/gesture/base", "event/gesture/drag"], 
  "dd/plugin/constrain": ["node", "base"], 
  "dd/plugin/proxy": ["dd"], 
  "dd/plugin/scroll": ["dd"], 
  "dom/base": ["ua"], 
  "dom/class-list": ["dom/base"], 
  "dom/ie": ["dom/base"], 
  "dom/selector": ["dom/basic"], 
  "event/base": ["util"], 
  "event/custom": ["event/base"], 
  "event/dom/base": ["event/base", "dom", "ua"], 
  "event/dom/focusin": ["event/dom/base"], 
  "event/dom/hashchange": ["event/dom/base"], 
  "event/dom/ie": ["event/dom/base"], 
  "event/dom/input": ["event/dom/base"], 
  "event/gesture/base": ["event/gesture/util"], 
  "event/gesture/drag": ["event/gesture/util"], 
  "event/gesture/edge-drag": ["event/gesture/util"], 
  "event/gesture/pinch": ["event/gesture/util"], 
  "event/gesture/rotate": ["event/gesture/util"], 
  "event/gesture/shake": ["event/dom/base"], 
  "event/gesture/swipe": ["event/gesture/util"], 
  "event/gesture/tap": ["event/gesture/util"], 
  "event/gesture/util": ["event/dom/base"], 
  "feature": ["util", "ua"], 
  "filter-menu": ["menu"], 
  "io": ["dom", "event/custom", "promise", "uri", "ua", "event/dom"], 
  "menu": ["component/container", "component/extension/delegate-children", "component/extension/content-box", "component/extension/align", "component/extension/shim"], 
  "menubutton": ["button", "menu"], 
  "navigation-view": ["component/container", "component/extension/content-box"], 
  "navigation-view/bar": ["button"], 
  "node": ["dom", "event/dom", "anim"], 
  "overlay": ["component/container", "component/extension/shim", "component/extension/align", "component/extension/content-box"], 
  "path": ["util"], 
  "resizable": ["dd"], 
  "resizable/plugin/proxy": ["node", "base"], 
  "router": ["event/dom", "uri", "event/custom"], 
  "scroll-view/base": ["anim/timer", "component/container", "component/extension/content-box"], 
  "scroll-view/plugin/pull-to-refresh": ["base"], 
  "scroll-view/plugin/scrollbar": ["component/control", "event/gesture/drag"], 
  "scroll-view/touch": ["scroll-view/base", "event/gesture/drag"], 
  "separator": ["component/control"], 
  "split-button": ["menubutton"], 
  "stylesheet": ["dom"], 
  "swf": ["dom", "json", "attribute"], 
  "tabs": ["toolbar", "button"], 
  "toolbar": ["component/container", "component/extension/delegate-children"], 
  "tree": ["component/container", "component/extension/content-box", "component/extension/delegate-children"], 
  "uri": ["path"], 
  "xtemplate": ["xtemplate/runtime"], 
  "xtemplate/runtime": ["util"]});
  _$jscoverage['/modules.js'].lineData[279]++;
  var Feature = S.Feature, UA = S.UA, win = window, isTouchGestureSupported = Feature.isTouchGestureSupported(), add = S.add, emptyObject = {};
  _$jscoverage['/modules.js'].lineData[286]++;
  function alias(name, aliasName) {
    _$jscoverage['/modules.js'].functionData[1]++;
    _$jscoverage['/modules.js'].lineData[287]++;
    var cfg;
    _$jscoverage['/modules.js'].lineData[288]++;
    if (visit10_288_1(typeof name === "string")) {
      _$jscoverage['/modules.js'].lineData[289]++;
      cfg = {};
      _$jscoverage['/modules.js'].lineData[290]++;
      cfg[name] = aliasName;
    } else {
      _$jscoverage['/modules.js'].lineData[292]++;
      cfg = name;
    }
    _$jscoverage['/modules.js'].lineData[294]++;
    S.config("alias", cfg);
  }
  _$jscoverage['/modules.js'].lineData[297]++;
  alias('anim', Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer');
  _$jscoverage['/modules.js'].lineData[298]++;
  alias({
  'dom/basic': ['dom/base', visit11_301_1(UA.ieMode < 9) ? 'dom/ie' : '', Feature.isClassListSupported() ? '' : 'dom/class-list'], 
  dom: ['dom/basic', Feature.isQuerySelectorSupported() ? '' : 'dom/selector']});
  _$jscoverage['/modules.js'].lineData[309]++;
  alias('event/dom', ['event/dom/base', Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange', visit12_312_1(UA.ieMode < 9) ? 'event/dom/ie' : '', Feature.isInputEventSupported() ? '' : 'event/dom/input', UA.ie ? '' : 'event/dom/focusin']);
  _$jscoverage['/modules.js'].lineData[316]++;
  if (visit13_316_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[317]++;
    add('event/gesture/edge-drag', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[320]++;
  if (visit14_320_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[321]++;
    add('event/gesture/pinch', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[324]++;
  if (visit15_324_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[325]++;
    add('event/gesture/rotate', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[328]++;
  if (visit16_328_1(!win.DeviceMotionEvent)) {
    _$jscoverage['/modules.js'].lineData[329]++;
    add('event/gesture/shake', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[332]++;
  if (visit17_332_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[333]++;
    add('event/gesture/swipe', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[336]++;
  alias('scroll-view', Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base');
})(KISSY);
