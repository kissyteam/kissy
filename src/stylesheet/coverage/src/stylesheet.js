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
if (! _$jscoverage['/stylesheet.js']) {
  _$jscoverage['/stylesheet.js'] = {};
  _$jscoverage['/stylesheet.js'].lineData = [];
  _$jscoverage['/stylesheet.js'].lineData[6] = 0;
  _$jscoverage['/stylesheet.js'].lineData[7] = 0;
  _$jscoverage['/stylesheet.js'].lineData[14] = 0;
  _$jscoverage['/stylesheet.js'].lineData[28] = 0;
  _$jscoverage['/stylesheet.js'].lineData[29] = 0;
  _$jscoverage['/stylesheet.js'].lineData[32] = 0;
  _$jscoverage['/stylesheet.js'].lineData[35] = 0;
  _$jscoverage['/stylesheet.js'].lineData[37] = 0;
  _$jscoverage['/stylesheet.js'].lineData[39] = 0;
  _$jscoverage['/stylesheet.js'].lineData[41] = 0;
  _$jscoverage['/stylesheet.js'].lineData[43] = 0;
  _$jscoverage['/stylesheet.js'].lineData[45] = 0;
  _$jscoverage['/stylesheet.js'].lineData[47] = 0;
  _$jscoverage['/stylesheet.js'].lineData[49] = 0;
  _$jscoverage['/stylesheet.js'].lineData[51] = 0;
  _$jscoverage['/stylesheet.js'].lineData[52] = 0;
  _$jscoverage['/stylesheet.js'].lineData[53] = 0;
  _$jscoverage['/stylesheet.js'].lineData[55] = 0;
  _$jscoverage['/stylesheet.js'].lineData[56] = 0;
  _$jscoverage['/stylesheet.js'].lineData[57] = 0;
  _$jscoverage['/stylesheet.js'].lineData[59] = 0;
  _$jscoverage['/stylesheet.js'].lineData[64] = 0;
  _$jscoverage['/stylesheet.js'].lineData[73] = 0;
  _$jscoverage['/stylesheet.js'].lineData[74] = 0;
  _$jscoverage['/stylesheet.js'].lineData[82] = 0;
  _$jscoverage['/stylesheet.js'].lineData[83] = 0;
  _$jscoverage['/stylesheet.js'].lineData[91] = 0;
  _$jscoverage['/stylesheet.js'].lineData[107] = 0;
  _$jscoverage['/stylesheet.js'].lineData[108] = 0;
  _$jscoverage['/stylesheet.js'].lineData[109] = 0;
  _$jscoverage['/stylesheet.js'].lineData[110] = 0;
  _$jscoverage['/stylesheet.js'].lineData[111] = 0;
  _$jscoverage['/stylesheet.js'].lineData[112] = 0;
  _$jscoverage['/stylesheet.js'].lineData[114] = 0;
  _$jscoverage['/stylesheet.js'].lineData[115] = 0;
  _$jscoverage['/stylesheet.js'].lineData[116] = 0;
  _$jscoverage['/stylesheet.js'].lineData[118] = 0;
  _$jscoverage['/stylesheet.js'].lineData[121] = 0;
  _$jscoverage['/stylesheet.js'].lineData[122] = 0;
  _$jscoverage['/stylesheet.js'].lineData[123] = 0;
  _$jscoverage['/stylesheet.js'].lineData[124] = 0;
  _$jscoverage['/stylesheet.js'].lineData[127] = 0;
  _$jscoverage['/stylesheet.js'].lineData[128] = 0;
  _$jscoverage['/stylesheet.js'].lineData[129] = 0;
  _$jscoverage['/stylesheet.js'].lineData[130] = 0;
  _$jscoverage['/stylesheet.js'].lineData[131] = 0;
  _$jscoverage['/stylesheet.js'].lineData[136] = 0;
  _$jscoverage['/stylesheet.js'].lineData[137] = 0;
  _$jscoverage['/stylesheet.js'].lineData[138] = 0;
  _$jscoverage['/stylesheet.js'].lineData[139] = 0;
  _$jscoverage['/stylesheet.js'].lineData[140] = 0;
  _$jscoverage['/stylesheet.js'].lineData[144] = 0;
  _$jscoverage['/stylesheet.js'].lineData[153] = 0;
  _$jscoverage['/stylesheet.js'].lineData[155] = 0;
  _$jscoverage['/stylesheet.js'].lineData[156] = 0;
  _$jscoverage['/stylesheet.js'].lineData[158] = 0;
  _$jscoverage['/stylesheet.js'].lineData[160] = 0;
  _$jscoverage['/stylesheet.js'].lineData[161] = 0;
  _$jscoverage['/stylesheet.js'].lineData[163] = 0;
  _$jscoverage['/stylesheet.js'].lineData[164] = 0;
  _$jscoverage['/stylesheet.js'].lineData[167] = 0;
  _$jscoverage['/stylesheet.js'].lineData[176] = 0;
  _$jscoverage['/stylesheet.js'].lineData[178] = 0;
  _$jscoverage['/stylesheet.js'].lineData[179] = 0;
  _$jscoverage['/stylesheet.js'].lineData[180] = 0;
  _$jscoverage['/stylesheet.js'].lineData[181] = 0;
  _$jscoverage['/stylesheet.js'].lineData[184] = 0;
  _$jscoverage['/stylesheet.js'].lineData[185] = 0;
  _$jscoverage['/stylesheet.js'].lineData[186] = 0;
  _$jscoverage['/stylesheet.js'].lineData[187] = 0;
  _$jscoverage['/stylesheet.js'].lineData[188] = 0;
  _$jscoverage['/stylesheet.js'].lineData[192] = 0;
  _$jscoverage['/stylesheet.js'].lineData[193] = 0;
  _$jscoverage['/stylesheet.js'].lineData[194] = 0;
  _$jscoverage['/stylesheet.js'].lineData[195] = 0;
  _$jscoverage['/stylesheet.js'].lineData[196] = 0;
  _$jscoverage['/stylesheet.js'].lineData[202] = 0;
}
if (! _$jscoverage['/stylesheet.js'].functionData) {
  _$jscoverage['/stylesheet.js'].functionData = [];
  _$jscoverage['/stylesheet.js'].functionData[0] = 0;
  _$jscoverage['/stylesheet.js'].functionData[1] = 0;
  _$jscoverage['/stylesheet.js'].functionData[2] = 0;
  _$jscoverage['/stylesheet.js'].functionData[3] = 0;
  _$jscoverage['/stylesheet.js'].functionData[4] = 0;
  _$jscoverage['/stylesheet.js'].functionData[5] = 0;
  _$jscoverage['/stylesheet.js'].functionData[6] = 0;
  _$jscoverage['/stylesheet.js'].functionData[7] = 0;
  _$jscoverage['/stylesheet.js'].functionData[8] = 0;
  _$jscoverage['/stylesheet.js'].functionData[9] = 0;
}
if (! _$jscoverage['/stylesheet.js'].branchData) {
  _$jscoverage['/stylesheet.js'].branchData = {};
  _$jscoverage['/stylesheet.js'].branchData['28'] = [];
  _$jscoverage['/stylesheet.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['35'] = [];
  _$jscoverage['/stylesheet.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['43'] = [];
  _$jscoverage['/stylesheet.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['51'] = [];
  _$jscoverage['/stylesheet.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['114'] = [];
  _$jscoverage['/stylesheet.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['115'] = [];
  _$jscoverage['/stylesheet.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['121'] = [];
  _$jscoverage['/stylesheet.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['123'] = [];
  _$jscoverage['/stylesheet.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['128'] = [];
  _$jscoverage['/stylesheet.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['129'] = [];
  _$jscoverage['/stylesheet.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['138'] = [];
  _$jscoverage['/stylesheet.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['155'] = [];
  _$jscoverage['/stylesheet.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['179'] = [];
  _$jscoverage['/stylesheet.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['185'] = [];
  _$jscoverage['/stylesheet.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['187'] = [];
  _$jscoverage['/stylesheet.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['193'] = [];
  _$jscoverage['/stylesheet.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['195'] = [];
  _$jscoverage['/stylesheet.js'].branchData['195'][1] = new BranchData();
}
_$jscoverage['/stylesheet.js'].branchData['195'][1].init(110, 13, 'sheet.addRule');
function visit17_195_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['193'][1].init(13, 16, 'sheet.insertRule');
function visit16_193_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['187'][1].init(86, 16, 'sheet.removeRule');
function visit15_187_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['185'][1].init(13, 16, 'sheet.deleteRule');
function visit14_185_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['179'][1].init(39, 10, 'base || \'\'');
function visit13_179_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['155'][1].init(81, 12, 'selectorText');
function visit12_155_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['138'][1].init(110, 3, 'css');
function visit11_138_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['129'][1].init(29, 28, 'sheet[rulesName][i] === rule');
function visit10_129_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['128'][1].init(156, 6, 'i >= 0');
function visit9_128_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['123'][1].init(79, 3, 'css');
function visit8_123_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['121'][1].init(493, 4, 'rule');
function visit7_121_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['115'][1].init(29, 28, 'i < multiSelector.length - 1');
function visit6_115_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['114'][1].init(269, 24, 'multiSelector.length > 1');
function visit5_114_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['51'][1].init(813, 6, 'i >= 0');
function visit4_51_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['43'][1].init(580, 30, 'sheet && (\'cssRules\' in sheet)');
function visit3_43_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['35'][1].init(436, 25, 'el.sheet || el.styleSheet');
function visit2_35_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['28'][1].init(232, 5, 'el.el');
function visit1_28_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/stylesheet.js'].functionData[0]++;
  _$jscoverage['/stylesheet.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/stylesheet.js'].lineData[14]++;
  function StyleSheet(el) {
    _$jscoverage['/stylesheet.js'].functionData[1]++;
    _$jscoverage['/stylesheet.js'].lineData[28]++;
    if (visit1_28_1(el.el)) {
      _$jscoverage['/stylesheet.js'].lineData[29]++;
      el = el.el;
    }
    _$jscoverage['/stylesheet.js'].lineData[32]++;
    el = this.el = Dom.get(el);
    _$jscoverage['/stylesheet.js'].lineData[35]++;
    var sheet = visit2_35_1(el.sheet || el.styleSheet);
    _$jscoverage['/stylesheet.js'].lineData[37]++;
    this.sheet = sheet;
    _$jscoverage['/stylesheet.js'].lineData[39]++;
    var cssRules = {};
    _$jscoverage['/stylesheet.js'].lineData[41]++;
    this.cssRules = cssRules;
    _$jscoverage['/stylesheet.js'].lineData[43]++;
    var rulesName = visit3_43_1(sheet && ('cssRules' in sheet)) ? 'cssRules' : 'rules';
    _$jscoverage['/stylesheet.js'].lineData[45]++;
    this.rulesName = rulesName;
    _$jscoverage['/stylesheet.js'].lineData[47]++;
    var domCssRules = sheet[rulesName];
    _$jscoverage['/stylesheet.js'].lineData[49]++;
    var i, rule, selectorText, styleDeclaration;
    _$jscoverage['/stylesheet.js'].lineData[51]++;
    for (i = domCssRules.length - 1; visit4_51_1(i >= 0); i--) {
      _$jscoverage['/stylesheet.js'].lineData[52]++;
      rule = domCssRules[i];
      _$jscoverage['/stylesheet.js'].lineData[53]++;
      selectorText = rule.selectorText;
      _$jscoverage['/stylesheet.js'].lineData[55]++;
      if ((styleDeclaration = cssRules[selectorText])) {
        _$jscoverage['/stylesheet.js'].lineData[56]++;
        styleDeclaration.style.cssText += ';' + styleDeclaration.style.cssText;
        _$jscoverage['/stylesheet.js'].lineData[57]++;
        deleteRule(sheet, i);
      } else {
        _$jscoverage['/stylesheet.js'].lineData[59]++;
        cssRules[selectorText] = rule;
      }
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[64]++;
  StyleSheet.prototype = {
  constructor: StyleSheet, 
  enable: function() {
  _$jscoverage['/stylesheet.js'].functionData[2]++;
  _$jscoverage['/stylesheet.js'].lineData[73]++;
  this.sheet.disabled = false;
  _$jscoverage['/stylesheet.js'].lineData[74]++;
  return this;
}, 
  disable: function() {
  _$jscoverage['/stylesheet.js'].functionData[3]++;
  _$jscoverage['/stylesheet.js'].lineData[82]++;
  this.sheet.disabled = true;
  _$jscoverage['/stylesheet.js'].lineData[83]++;
  return this;
}, 
  'isEnabled': function() {
  _$jscoverage['/stylesheet.js'].functionData[4]++;
  _$jscoverage['/stylesheet.js'].lineData[91]++;
  return !this.sheet.disabled;
}, 
  set: function(selectorText, css) {
  _$jscoverage['/stylesheet.js'].functionData[5]++;
  _$jscoverage['/stylesheet.js'].lineData[107]++;
  var sheet = this.sheet;
  _$jscoverage['/stylesheet.js'].lineData[108]++;
  var rulesName = this.rulesName;
  _$jscoverage['/stylesheet.js'].lineData[109]++;
  var cssRules = this.cssRules;
  _$jscoverage['/stylesheet.js'].lineData[110]++;
  var rule = cssRules[selectorText];
  _$jscoverage['/stylesheet.js'].lineData[111]++;
  var multiSelector = selectorText.split(/\s*,\s*/);
  _$jscoverage['/stylesheet.js'].lineData[112]++;
  var i;
  _$jscoverage['/stylesheet.js'].lineData[114]++;
  if (visit5_114_1(multiSelector.length > 1)) {
    _$jscoverage['/stylesheet.js'].lineData[115]++;
    for (i = 0; visit6_115_1(i < multiSelector.length - 1); i++) {
      _$jscoverage['/stylesheet.js'].lineData[116]++;
      this.set(multiSelector[i], css);
    }
    _$jscoverage['/stylesheet.js'].lineData[118]++;
    return this;
  }
  _$jscoverage['/stylesheet.js'].lineData[121]++;
  if (visit7_121_1(rule)) {
    _$jscoverage['/stylesheet.js'].lineData[122]++;
    css = toCssText(css, rule.style.cssText);
    _$jscoverage['/stylesheet.js'].lineData[123]++;
    if (visit8_123_1(css)) {
      _$jscoverage['/stylesheet.js'].lineData[124]++;
      rule.style.cssText = css;
    } else {
      _$jscoverage['/stylesheet.js'].lineData[127]++;
      delete cssRules[selectorText];
      _$jscoverage['/stylesheet.js'].lineData[128]++;
      for (i = sheet[rulesName].length - 1; visit9_128_1(i >= 0); i--) {
        _$jscoverage['/stylesheet.js'].lineData[129]++;
        if (visit10_129_1(sheet[rulesName][i] === rule)) {
          _$jscoverage['/stylesheet.js'].lineData[130]++;
          deleteRule(sheet, i);
          _$jscoverage['/stylesheet.js'].lineData[131]++;
          break;
        }
      }
    }
  } else {
    _$jscoverage['/stylesheet.js'].lineData[136]++;
    var len = sheet[rulesName].length;
    _$jscoverage['/stylesheet.js'].lineData[137]++;
    css = toCssText(css);
    _$jscoverage['/stylesheet.js'].lineData[138]++;
    if (visit11_138_1(css)) {
      _$jscoverage['/stylesheet.js'].lineData[139]++;
      insertRule(sheet, selectorText, css, len);
      _$jscoverage['/stylesheet.js'].lineData[140]++;
      cssRules[selectorText] = sheet[rulesName][len];
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[144]++;
  return this;
}, 
  get: function(selectorText) {
  _$jscoverage['/stylesheet.js'].functionData[6]++;
  _$jscoverage['/stylesheet.js'].lineData[153]++;
  var rule, css, selector, cssRules = this.cssRules;
  _$jscoverage['/stylesheet.js'].lineData[155]++;
  if (visit12_155_1(selectorText)) {
    _$jscoverage['/stylesheet.js'].lineData[156]++;
    rule = cssRules[selectorText];
    _$jscoverage['/stylesheet.js'].lineData[158]++;
    return rule ? rule.style.cssText : null;
  } else {
    _$jscoverage['/stylesheet.js'].lineData[160]++;
    css = [];
    _$jscoverage['/stylesheet.js'].lineData[161]++;
    for (selector in cssRules) {
      _$jscoverage['/stylesheet.js'].lineData[163]++;
      rule = cssRules[selector];
      _$jscoverage['/stylesheet.js'].lineData[164]++;
      css.push(rule.selectorText + ' {' + rule.style.cssText + '}');
    }
    _$jscoverage['/stylesheet.js'].lineData[167]++;
    return css.join('\n');
  }
}};
  _$jscoverage['/stylesheet.js'].lineData[176]++;
  var workerElement = document.createElement('p');
  _$jscoverage['/stylesheet.js'].lineData[178]++;
  function toCssText(css, base) {
    _$jscoverage['/stylesheet.js'].functionData[7]++;
    _$jscoverage['/stylesheet.js'].lineData[179]++;
    workerElement.style.cssText = visit13_179_1(base || '');
    _$jscoverage['/stylesheet.js'].lineData[180]++;
    Dom.css(workerElement, css);
    _$jscoverage['/stylesheet.js'].lineData[181]++;
    return workerElement.style.cssText;
  }
  _$jscoverage['/stylesheet.js'].lineData[184]++;
  function deleteRule(sheet, i) {
    _$jscoverage['/stylesheet.js'].functionData[8]++;
    _$jscoverage['/stylesheet.js'].lineData[185]++;
    if (visit14_185_1(sheet.deleteRule)) {
      _$jscoverage['/stylesheet.js'].lineData[186]++;
      sheet.deleteRule(i);
    } else {
      _$jscoverage['/stylesheet.js'].lineData[187]++;
      if (visit15_187_1(sheet.removeRule)) {
        _$jscoverage['/stylesheet.js'].lineData[188]++;
        sheet.removeRule(i);
      }
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[192]++;
  function insertRule(sheet, sel, css, i) {
    _$jscoverage['/stylesheet.js'].functionData[9]++;
    _$jscoverage['/stylesheet.js'].lineData[193]++;
    if (visit16_193_1(sheet.insertRule)) {
      _$jscoverage['/stylesheet.js'].lineData[194]++;
      sheet.insertRule(sel + ' {' + css + '}', i);
    } else {
      _$jscoverage['/stylesheet.js'].lineData[195]++;
      if (visit17_195_1(sheet.addRule)) {
        _$jscoverage['/stylesheet.js'].lineData[196]++;
        sheet.addRule(sel, css, i);
      }
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[202]++;
  return StyleSheet;
});
