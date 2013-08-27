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
  _$jscoverage['/stylesheet.js'].lineData[13] = 0;
  _$jscoverage['/stylesheet.js'].lineData[27] = 0;
  _$jscoverage['/stylesheet.js'].lineData[28] = 0;
  _$jscoverage['/stylesheet.js'].lineData[31] = 0;
  _$jscoverage['/stylesheet.js'].lineData[34] = 0;
  _$jscoverage['/stylesheet.js'].lineData[36] = 0;
  _$jscoverage['/stylesheet.js'].lineData[38] = 0;
  _$jscoverage['/stylesheet.js'].lineData[40] = 0;
  _$jscoverage['/stylesheet.js'].lineData[42] = 0;
  _$jscoverage['/stylesheet.js'].lineData[44] = 0;
  _$jscoverage['/stylesheet.js'].lineData[46] = 0;
  _$jscoverage['/stylesheet.js'].lineData[48] = 0;
  _$jscoverage['/stylesheet.js'].lineData[50] = 0;
  _$jscoverage['/stylesheet.js'].lineData[51] = 0;
  _$jscoverage['/stylesheet.js'].lineData[52] = 0;
  _$jscoverage['/stylesheet.js'].lineData[54] = 0;
  _$jscoverage['/stylesheet.js'].lineData[55] = 0;
  _$jscoverage['/stylesheet.js'].lineData[56] = 0;
  _$jscoverage['/stylesheet.js'].lineData[58] = 0;
  _$jscoverage['/stylesheet.js'].lineData[63] = 0;
  _$jscoverage['/stylesheet.js'].lineData[72] = 0;
  _$jscoverage['/stylesheet.js'].lineData[73] = 0;
  _$jscoverage['/stylesheet.js'].lineData[81] = 0;
  _$jscoverage['/stylesheet.js'].lineData[82] = 0;
  _$jscoverage['/stylesheet.js'].lineData[90] = 0;
  _$jscoverage['/stylesheet.js'].lineData[106] = 0;
  _$jscoverage['/stylesheet.js'].lineData[107] = 0;
  _$jscoverage['/stylesheet.js'].lineData[108] = 0;
  _$jscoverage['/stylesheet.js'].lineData[109] = 0;
  _$jscoverage['/stylesheet.js'].lineData[110] = 0;
  _$jscoverage['/stylesheet.js'].lineData[111] = 0;
  _$jscoverage['/stylesheet.js'].lineData[113] = 0;
  _$jscoverage['/stylesheet.js'].lineData[114] = 0;
  _$jscoverage['/stylesheet.js'].lineData[115] = 0;
  _$jscoverage['/stylesheet.js'].lineData[117] = 0;
  _$jscoverage['/stylesheet.js'].lineData[120] = 0;
  _$jscoverage['/stylesheet.js'].lineData[121] = 0;
  _$jscoverage['/stylesheet.js'].lineData[122] = 0;
  _$jscoverage['/stylesheet.js'].lineData[123] = 0;
  _$jscoverage['/stylesheet.js'].lineData[126] = 0;
  _$jscoverage['/stylesheet.js'].lineData[127] = 0;
  _$jscoverage['/stylesheet.js'].lineData[128] = 0;
  _$jscoverage['/stylesheet.js'].lineData[129] = 0;
  _$jscoverage['/stylesheet.js'].lineData[130] = 0;
  _$jscoverage['/stylesheet.js'].lineData[135] = 0;
  _$jscoverage['/stylesheet.js'].lineData[136] = 0;
  _$jscoverage['/stylesheet.js'].lineData[137] = 0;
  _$jscoverage['/stylesheet.js'].lineData[138] = 0;
  _$jscoverage['/stylesheet.js'].lineData[139] = 0;
  _$jscoverage['/stylesheet.js'].lineData[143] = 0;
  _$jscoverage['/stylesheet.js'].lineData[152] = 0;
  _$jscoverage['/stylesheet.js'].lineData[154] = 0;
  _$jscoverage['/stylesheet.js'].lineData[155] = 0;
  _$jscoverage['/stylesheet.js'].lineData[157] = 0;
  _$jscoverage['/stylesheet.js'].lineData[159] = 0;
  _$jscoverage['/stylesheet.js'].lineData[160] = 0;
  _$jscoverage['/stylesheet.js'].lineData[162] = 0;
  _$jscoverage['/stylesheet.js'].lineData[163] = 0;
  _$jscoverage['/stylesheet.js'].lineData[166] = 0;
  _$jscoverage['/stylesheet.js'].lineData[175] = 0;
  _$jscoverage['/stylesheet.js'].lineData[177] = 0;
  _$jscoverage['/stylesheet.js'].lineData[178] = 0;
  _$jscoverage['/stylesheet.js'].lineData[179] = 0;
  _$jscoverage['/stylesheet.js'].lineData[180] = 0;
  _$jscoverage['/stylesheet.js'].lineData[183] = 0;
  _$jscoverage['/stylesheet.js'].lineData[184] = 0;
  _$jscoverage['/stylesheet.js'].lineData[185] = 0;
  _$jscoverage['/stylesheet.js'].lineData[186] = 0;
  _$jscoverage['/stylesheet.js'].lineData[187] = 0;
  _$jscoverage['/stylesheet.js'].lineData[191] = 0;
  _$jscoverage['/stylesheet.js'].lineData[192] = 0;
  _$jscoverage['/stylesheet.js'].lineData[193] = 0;
  _$jscoverage['/stylesheet.js'].lineData[194] = 0;
  _$jscoverage['/stylesheet.js'].lineData[195] = 0;
  _$jscoverage['/stylesheet.js'].lineData[201] = 0;
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
  _$jscoverage['/stylesheet.js'].branchData['27'] = [];
  _$jscoverage['/stylesheet.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['34'] = [];
  _$jscoverage['/stylesheet.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['42'] = [];
  _$jscoverage['/stylesheet.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['50'] = [];
  _$jscoverage['/stylesheet.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['54'] = [];
  _$jscoverage['/stylesheet.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['113'] = [];
  _$jscoverage['/stylesheet.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['114'] = [];
  _$jscoverage['/stylesheet.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['120'] = [];
  _$jscoverage['/stylesheet.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['122'] = [];
  _$jscoverage['/stylesheet.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['127'] = [];
  _$jscoverage['/stylesheet.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['128'] = [];
  _$jscoverage['/stylesheet.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['137'] = [];
  _$jscoverage['/stylesheet.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['154'] = [];
  _$jscoverage['/stylesheet.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['178'] = [];
  _$jscoverage['/stylesheet.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['184'] = [];
  _$jscoverage['/stylesheet.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['186'] = [];
  _$jscoverage['/stylesheet.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['192'] = [];
  _$jscoverage['/stylesheet.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/stylesheet.js'].branchData['194'] = [];
  _$jscoverage['/stylesheet.js'].branchData['194'][1] = new BranchData();
}
_$jscoverage['/stylesheet.js'].branchData['194'][1].init(113, 13, 'sheet.addRule');
function visit18_194_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['192'][1].init(14, 16, 'sheet.insertRule');
function visit17_192_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['186'][1].init(89, 16, 'sheet.removeRule');
function visit16_186_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['184'][1].init(14, 16, 'sheet.deleteRule');
function visit15_184_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['178'][1].init(40, 10, 'base || ""');
function visit14_178_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['154'][1].init(84, 12, 'selectorText');
function visit13_154_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['137'][1].init(113, 3, 'css');
function visit12_137_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['128'][1].init(30, 27, 'sheet[rulesName][i] == rule');
function visit11_128_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['127'][1].init(159, 6, 'i >= 0');
function visit10_127_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['122'][1].init(81, 3, 'css');
function visit9_122_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['120'][1].init(508, 4, 'rule');
function visit8_120_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['114'][1].init(30, 28, 'i < multiSelector.length - 1');
function visit7_114_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['113'][1].init(277, 24, 'multiSelector.length > 1');
function visit6_113_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['54'][1].init(120, 41, 'styleDeclaration = cssRules[selectorText]');
function visit5_54_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['50'][1].init(853, 6, 'i >= 0');
function visit4_50_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['42'][1].init(612, 30, 'sheet && (\'cssRules\' in sheet)');
function visit3_42_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['34'][1].init(460, 25, 'el.sheet || el.styleSheet');
function visit2_34_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].branchData['27'][1].init(246, 5, 'el.el');
function visit1_27_1(result) {
  _$jscoverage['/stylesheet.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/stylesheet.js'].lineData[6]++;
KISSY.add("stylesheet", function(S, Dom) {
  _$jscoverage['/stylesheet.js'].functionData[0]++;
  _$jscoverage['/stylesheet.js'].lineData[13]++;
  function StyleSheet(el) {
    _$jscoverage['/stylesheet.js'].functionData[1]++;
    _$jscoverage['/stylesheet.js'].lineData[27]++;
    if (visit1_27_1(el.el)) {
      _$jscoverage['/stylesheet.js'].lineData[28]++;
      el = el.el;
    }
    _$jscoverage['/stylesheet.js'].lineData[31]++;
    el = this['el'] = Dom.get(el);
    _$jscoverage['/stylesheet.js'].lineData[34]++;
    var sheet = visit2_34_1(el.sheet || el.styleSheet);
    _$jscoverage['/stylesheet.js'].lineData[36]++;
    this.sheet = sheet;
    _$jscoverage['/stylesheet.js'].lineData[38]++;
    var cssRules = {};
    _$jscoverage['/stylesheet.js'].lineData[40]++;
    this.cssRules = cssRules;
    _$jscoverage['/stylesheet.js'].lineData[42]++;
    var rulesName = visit3_42_1(sheet && ('cssRules' in sheet)) ? 'cssRules' : 'rules';
    _$jscoverage['/stylesheet.js'].lineData[44]++;
    this.rulesName = rulesName;
    _$jscoverage['/stylesheet.js'].lineData[46]++;
    var domCssRules = sheet[rulesName];
    _$jscoverage['/stylesheet.js'].lineData[48]++;
    var i, rule, selectorText, styleDeclaration;
    _$jscoverage['/stylesheet.js'].lineData[50]++;
    for (i = domCssRules.length - 1; visit4_50_1(i >= 0); i--) {
      _$jscoverage['/stylesheet.js'].lineData[51]++;
      rule = domCssRules[i];
      _$jscoverage['/stylesheet.js'].lineData[52]++;
      selectorText = rule.selectorText;
      _$jscoverage['/stylesheet.js'].lineData[54]++;
      if (visit5_54_1(styleDeclaration = cssRules[selectorText])) {
        _$jscoverage['/stylesheet.js'].lineData[55]++;
        styleDeclaration.style.cssText += ";" + styleDeclaration.style.cssText;
        _$jscoverage['/stylesheet.js'].lineData[56]++;
        deleteRule(sheet, i);
      } else {
        _$jscoverage['/stylesheet.js'].lineData[58]++;
        cssRules[selectorText] = rule;
      }
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[63]++;
  StyleSheet.prototype = {
  constructor: StyleSheet, 
  enable: function() {
  _$jscoverage['/stylesheet.js'].functionData[2]++;
  _$jscoverage['/stylesheet.js'].lineData[72]++;
  this.sheet.disabled = false;
  _$jscoverage['/stylesheet.js'].lineData[73]++;
  return this;
}, 
  disable: function() {
  _$jscoverage['/stylesheet.js'].functionData[3]++;
  _$jscoverage['/stylesheet.js'].lineData[81]++;
  this.sheet.disabled = true;
  _$jscoverage['/stylesheet.js'].lineData[82]++;
  return this;
}, 
  'isEnabled': function() {
  _$jscoverage['/stylesheet.js'].functionData[4]++;
  _$jscoverage['/stylesheet.js'].lineData[90]++;
  return !this.sheet.disabled;
}, 
  set: function(selectorText, css) {
  _$jscoverage['/stylesheet.js'].functionData[5]++;
  _$jscoverage['/stylesheet.js'].lineData[106]++;
  var sheet = this.sheet;
  _$jscoverage['/stylesheet.js'].lineData[107]++;
  var rulesName = this.rulesName;
  _$jscoverage['/stylesheet.js'].lineData[108]++;
  var cssRules = this.cssRules;
  _$jscoverage['/stylesheet.js'].lineData[109]++;
  var rule = cssRules[selectorText];
  _$jscoverage['/stylesheet.js'].lineData[110]++;
  var multiSelector = selectorText.split(/\s*,\s*/);
  _$jscoverage['/stylesheet.js'].lineData[111]++;
  var i;
  _$jscoverage['/stylesheet.js'].lineData[113]++;
  if (visit6_113_1(multiSelector.length > 1)) {
    _$jscoverage['/stylesheet.js'].lineData[114]++;
    for (i = 0; visit7_114_1(i < multiSelector.length - 1); i++) {
      _$jscoverage['/stylesheet.js'].lineData[115]++;
      this.set(multiSelector[i], css);
    }
    _$jscoverage['/stylesheet.js'].lineData[117]++;
    return this;
  }
  _$jscoverage['/stylesheet.js'].lineData[120]++;
  if (visit8_120_1(rule)) {
    _$jscoverage['/stylesheet.js'].lineData[121]++;
    css = toCssText(css, rule.style.cssText);
    _$jscoverage['/stylesheet.js'].lineData[122]++;
    if (visit9_122_1(css)) {
      _$jscoverage['/stylesheet.js'].lineData[123]++;
      rule.style.cssText = css;
    } else {
      _$jscoverage['/stylesheet.js'].lineData[126]++;
      delete cssRules[selectorText];
      _$jscoverage['/stylesheet.js'].lineData[127]++;
      for (i = sheet[rulesName].length - 1; visit10_127_1(i >= 0); i--) {
        _$jscoverage['/stylesheet.js'].lineData[128]++;
        if (visit11_128_1(sheet[rulesName][i] == rule)) {
          _$jscoverage['/stylesheet.js'].lineData[129]++;
          deleteRule(sheet, i);
          _$jscoverage['/stylesheet.js'].lineData[130]++;
          break;
        }
      }
    }
  } else {
    _$jscoverage['/stylesheet.js'].lineData[135]++;
    var len = sheet[rulesName].length;
    _$jscoverage['/stylesheet.js'].lineData[136]++;
    css = toCssText(css);
    _$jscoverage['/stylesheet.js'].lineData[137]++;
    if (visit12_137_1(css)) {
      _$jscoverage['/stylesheet.js'].lineData[138]++;
      insertRule(sheet, selectorText, css, len);
      _$jscoverage['/stylesheet.js'].lineData[139]++;
      cssRules[selectorText] = sheet[rulesName][len];
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[143]++;
  return this;
}, 
  get: function(selectorText) {
  _$jscoverage['/stylesheet.js'].functionData[6]++;
  _$jscoverage['/stylesheet.js'].lineData[152]++;
  var rule, css, selector, cssRules = this.cssRules;
  _$jscoverage['/stylesheet.js'].lineData[154]++;
  if (visit13_154_1(selectorText)) {
    _$jscoverage['/stylesheet.js'].lineData[155]++;
    rule = cssRules[selectorText];
    _$jscoverage['/stylesheet.js'].lineData[157]++;
    return rule ? rule.style.cssText : null;
  } else {
    _$jscoverage['/stylesheet.js'].lineData[159]++;
    css = [];
    _$jscoverage['/stylesheet.js'].lineData[160]++;
    for (selector in cssRules) {
      _$jscoverage['/stylesheet.js'].lineData[162]++;
      rule = cssRules[selector];
      _$jscoverage['/stylesheet.js'].lineData[163]++;
      css.push(rule.selectorText + " {" + rule.style.cssText + "}");
    }
    _$jscoverage['/stylesheet.js'].lineData[166]++;
    return css.join("\n");
  }
}};
  _$jscoverage['/stylesheet.js'].lineData[175]++;
  var workerElement = document.createElement("p");
  _$jscoverage['/stylesheet.js'].lineData[177]++;
  function toCssText(css, base) {
    _$jscoverage['/stylesheet.js'].functionData[7]++;
    _$jscoverage['/stylesheet.js'].lineData[178]++;
    workerElement.style.cssText = visit14_178_1(base || "");
    _$jscoverage['/stylesheet.js'].lineData[179]++;
    Dom.css(workerElement, css);
    _$jscoverage['/stylesheet.js'].lineData[180]++;
    return workerElement.style.cssText;
  }
  _$jscoverage['/stylesheet.js'].lineData[183]++;
  function deleteRule(sheet, i) {
    _$jscoverage['/stylesheet.js'].functionData[8]++;
    _$jscoverage['/stylesheet.js'].lineData[184]++;
    if (visit15_184_1(sheet.deleteRule)) {
      _$jscoverage['/stylesheet.js'].lineData[185]++;
      sheet.deleteRule(i);
    } else {
      _$jscoverage['/stylesheet.js'].lineData[186]++;
      if (visit16_186_1(sheet.removeRule)) {
        _$jscoverage['/stylesheet.js'].lineData[187]++;
        sheet.removeRule(i);
      }
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[191]++;
  function insertRule(sheet, sel, css, i) {
    _$jscoverage['/stylesheet.js'].functionData[9]++;
    _$jscoverage['/stylesheet.js'].lineData[192]++;
    if (visit17_192_1(sheet.insertRule)) {
      _$jscoverage['/stylesheet.js'].lineData[193]++;
      sheet.insertRule(sel + ' {' + css + '}', i);
    } else {
      _$jscoverage['/stylesheet.js'].lineData[194]++;
      if (visit18_194_1(sheet.addRule)) {
        _$jscoverage['/stylesheet.js'].lineData[195]++;
        sheet.addRule(sel, css, i);
      }
    }
  }
  _$jscoverage['/stylesheet.js'].lineData[201]++;
  return StyleSheet;
}, {
  requires: ['dom']});
