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
if (! _$jscoverage['/ie/style.js']) {
  _$jscoverage['/ie/style.js'] = {};
  _$jscoverage['/ie/style.js'].lineData = [];
  _$jscoverage['/ie/style.js'].lineData[6] = 0;
  _$jscoverage['/ie/style.js'].lineData[7] = 0;
  _$jscoverage['/ie/style.js'].lineData[8] = 0;
  _$jscoverage['/ie/style.js'].lineData[9] = 0;
  _$jscoverage['/ie/style.js'].lineData[10] = 0;
  _$jscoverage['/ie/style.js'].lineData[30] = 0;
  _$jscoverage['/ie/style.js'].lineData[33] = 0;
  _$jscoverage['/ie/style.js'].lineData[35] = 0;
  _$jscoverage['/ie/style.js'].lineData[36] = 0;
  _$jscoverage['/ie/style.js'].lineData[40] = 0;
  _$jscoverage['/ie/style.js'].lineData[46] = 0;
  _$jscoverage['/ie/style.js'].lineData[47] = 0;
  _$jscoverage['/ie/style.js'].lineData[48] = 0;
  _$jscoverage['/ie/style.js'].lineData[53] = 0;
  _$jscoverage['/ie/style.js'].lineData[62] = 0;
  _$jscoverage['/ie/style.js'].lineData[64] = 0;
  _$jscoverage['/ie/style.js'].lineData[70] = 0;
  _$jscoverage['/ie/style.js'].lineData[74] = 0;
  _$jscoverage['/ie/style.js'].lineData[79] = 0;
  _$jscoverage['/ie/style.js'].lineData[81] = 0;
  _$jscoverage['/ie/style.js'].lineData[85] = 0;
  _$jscoverage['/ie/style.js'].lineData[91] = 0;
  _$jscoverage['/ie/style.js'].lineData[98] = 0;
  _$jscoverage['/ie/style.js'].lineData[106] = 0;
  _$jscoverage['/ie/style.js'].lineData[109] = 0;
  _$jscoverage['/ie/style.js'].lineData[110] = 0;
  _$jscoverage['/ie/style.js'].lineData[111] = 0;
  _$jscoverage['/ie/style.js'].lineData[113] = 0;
  _$jscoverage['/ie/style.js'].lineData[114] = 0;
  _$jscoverage['/ie/style.js'].lineData[117] = 0;
  _$jscoverage['/ie/style.js'].lineData[120] = 0;
  _$jscoverage['/ie/style.js'].lineData[123] = 0;
  _$jscoverage['/ie/style.js'].lineData[125] = 0;
  _$jscoverage['/ie/style.js'].lineData[126] = 0;
  _$jscoverage['/ie/style.js'].lineData[129] = 0;
  _$jscoverage['/ie/style.js'].lineData[132] = 0;
  _$jscoverage['/ie/style.js'].lineData[137] = 0;
  _$jscoverage['/ie/style.js'].lineData[138] = 0;
  _$jscoverage['/ie/style.js'].lineData[141] = 0;
  _$jscoverage['/ie/style.js'].lineData[153] = 0;
  _$jscoverage['/ie/style.js'].lineData[155] = 0;
  _$jscoverage['/ie/style.js'].lineData[160] = 0;
  _$jscoverage['/ie/style.js'].lineData[163] = 0;
  _$jscoverage['/ie/style.js'].lineData[164] = 0;
  _$jscoverage['/ie/style.js'].lineData[167] = 0;
  _$jscoverage['/ie/style.js'].lineData[169] = 0;
  _$jscoverage['/ie/style.js'].lineData[171] = 0;
}
if (! _$jscoverage['/ie/style.js'].functionData) {
  _$jscoverage['/ie/style.js'].functionData = [];
  _$jscoverage['/ie/style.js'].functionData[0] = 0;
  _$jscoverage['/ie/style.js'].functionData[1] = 0;
  _$jscoverage['/ie/style.js'].functionData[2] = 0;
  _$jscoverage['/ie/style.js'].functionData[3] = 0;
  _$jscoverage['/ie/style.js'].functionData[4] = 0;
  _$jscoverage['/ie/style.js'].functionData[5] = 0;
  _$jscoverage['/ie/style.js'].functionData[6] = 0;
}
if (! _$jscoverage['/ie/style.js'].branchData) {
  _$jscoverage['/ie/style.js'].branchData = {};
  _$jscoverage['/ie/style.js'].branchData['15'] = [];
  _$jscoverage['/ie/style.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['35'] = [];
  _$jscoverage['/ie/style.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['47'] = [];
  _$jscoverage['/ie/style.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['53'] = [];
  _$jscoverage['/ie/style.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['54'] = [];
  _$jscoverage['/ie/style.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['67'] = [];
  _$jscoverage['/ie/style.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['67'][3] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['74'] = [];
  _$jscoverage['/ie/style.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['74'][3] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['82'] = [];
  _$jscoverage['/ie/style.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['84'] = [];
  _$jscoverage['/ie/style.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['106'] = [];
  _$jscoverage['/ie/style.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['121'] = [];
  _$jscoverage['/ie/style.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['123'] = [];
  _$jscoverage['/ie/style.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['125'] = [];
  _$jscoverage['/ie/style.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['138'] = [];
  _$jscoverage['/ie/style.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['141'] = [];
  _$jscoverage['/ie/style.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['153'] = [];
  _$jscoverage['/ie/style.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['163'] = [];
  _$jscoverage['/ie/style.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['171'] = [];
  _$jscoverage['/ie/style.js'].branchData['171'][1] = new BranchData();
}
_$jscoverage['/ie/style.js'].branchData['171'][1].init(1474, 10, 'ret === \'\'');
function visit86_171_1(result) {
  _$jscoverage['/ie/style.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['163'][2].init(414, 8, 'ret || 0');
function visit85_163_2(result) {
  _$jscoverage['/ie/style.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['163'][1].init(383, 19, 'name === \'fontSize\'');
function visit84_163_1(result) {
  _$jscoverage['/ie/style.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['153'][1].init(801, 49, 'Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)');
function visit83_153_1(result) {
  _$jscoverage['/ie/style.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['141'][1].init(162, 48, 'elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name]');
function visit82_141_1(result) {
  _$jscoverage['/ie/style.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['138'][1].init(17, 22, 'cssProps[name] || name');
function visit81_138_1(result) {
  _$jscoverage['/ie/style.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['125'][2].init(80, 34, 'currentStyle[styleName] !== \'none\'');
function visit80_125_2(result) {
  _$jscoverage['/ie/style.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['125'][1].init(57, 57, 'BORDER_MAP[current] && currentStyle[styleName] !== \'none\'');
function visit79_125_1(result) {
  _$jscoverage['/ie/style.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['123'][2].init(290, 25, 'current.indexOf(\'px\') < 0');
function visit78_123_2(result) {
  _$jscoverage['/ie/style.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['123'][1].init(279, 36, 'current && current.indexOf(\'px\') < 0');
function visit77_123_1(result) {
  _$jscoverage['/ie/style.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['121'][2].init(85, 42, 'currentStyle && String(currentStyle[name])');
function visit76_121_2(result) {
  _$jscoverage['/ie/style.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['121'][1].init(85, 55, 'currentStyle && String(currentStyle[name]) || undefined');
function visit75_121_1(result) {
  _$jscoverage['/ie/style.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['106'][1].init(4027, 11, 'UA.ie === 8');
function visit74_106_1(result) {
  _$jscoverage['/ie/style.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['84'][1].init(143, 37, 'currentStyle && !currentStyle[FILTER]');
function visit73_84_1(result) {
  _$jscoverage['/ie/style.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['82'][1].init(56, 181, '!opacity || currentStyle && !currentStyle[FILTER]');
function visit72_82_1(result) {
  _$jscoverage['/ie/style.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['74'][3].init(650, 8, 'val >= 1');
function visit71_74_3(result) {
  _$jscoverage['/ie/style.js'].branchData['74'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['74'][2].init(650, 20, 'val >= 1 || !opacity');
function visit70_74_2(result) {
  _$jscoverage['/ie/style.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['74'][1].init(650, 64, '(val >= 1 || !opacity) && !util.trim(filter.replace(R_ALPHA, \'\'))');
function visit69_74_1(result) {
  _$jscoverage['/ie/style.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['67'][3].init(39, 19, 'style[FILTER] || \'\'');
function visit68_67_3(result) {
  _$jscoverage['/ie/style.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['67'][2].init(19, 36, 'currentStyle && currentStyle[FILTER]');
function visit67_67_2(result) {
  _$jscoverage['/ie/style.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['67'][1].init(230, 59, 'currentStyle && currentStyle[FILTER] || style[FILTER] || \'\'');
function visit66_67_1(result) {
  _$jscoverage['/ie/style.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['54'][1].init(-1, 31, 'computed && elem[CURRENT_STYLE]');
function visit65_54_1(result) {
  _$jscoverage['/ie/style.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['53'][1].init(41, 148, '(computed && elem[CURRENT_STYLE] ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || \'\'');
function visit64_53_1(result) {
  _$jscoverage['/ie/style.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['47'][1].init(14, 30, 'docElem.style[OPACITY] == null');
function visit63_47_1(result) {
  _$jscoverage['/ie/style.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['35'][1].init(18, 8, 'computed');
function visit62_35_1(result) {
  _$jscoverage['/ie/style.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['15'][1].init(163, 26, 'doc && doc.documentElement');
function visit61_15_1(result) {
  _$jscoverage['/ie/style.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/style.js'].functionData[0]++;
  _$jscoverage['/ie/style.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/ie/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/ie/style.js'].lineData[9]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/style.js'].lineData[10]++;
  var cssProps = Dom._cssProps, UA = require('ua'), FLOAT = 'float', HUNDRED = 100, doc = S.Env.host.document, docElem = visit61_15_1(doc && doc.documentElement), OPACITY = 'opacity', STYLE = 'style', RE_POS = /^(top|right|bottom|left)$/, FILTER = 'filter', CURRENT_STYLE = 'currentStyle', RUNTIME_STYLE = 'runtimeStyle', LEFT = 'left', PX = 'px', cssHooks = Dom._cssHooks, backgroundPosition = 'backgroundPosition', R_OPACITY = /opacity\s*=\s*([^)]*)/, R_ALPHA = /alpha\([^)]*\)/i;
  _$jscoverage['/ie/style.js'].lineData[30]++;
  cssProps[FLOAT] = 'styleFloat';
  _$jscoverage['/ie/style.js'].lineData[33]++;
  cssHooks[backgroundPosition] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[1]++;
  _$jscoverage['/ie/style.js'].lineData[35]++;
  if (visit62_35_1(computed)) {
    _$jscoverage['/ie/style.js'].lineData[36]++;
    return elem[CURRENT_STYLE][backgroundPosition + 'X'] + ' ' + elem[CURRENT_STYLE][backgroundPosition + 'Y'];
  } else {
    _$jscoverage['/ie/style.js'].lineData[40]++;
    return elem[STYLE][backgroundPosition];
  }
}};
  _$jscoverage['/ie/style.js'].lineData[46]++;
  try {
    _$jscoverage['/ie/style.js'].lineData[47]++;
    if (visit63_47_1(docElem.style[OPACITY] == null)) {
      _$jscoverage['/ie/style.js'].lineData[48]++;
      cssHooks[OPACITY] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[2]++;
  _$jscoverage['/ie/style.js'].lineData[53]++;
  return R_OPACITY.test(visit64_53_1((visit65_54_1(computed && elem[CURRENT_STYLE]) ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || '')) ? (parseFloat(RegExp.$1) / HUNDRED) + '' : computed ? '1' : '';
}, 
  set: function(elem, val) {
  _$jscoverage['/ie/style.js'].functionData[3]++;
  _$jscoverage['/ie/style.js'].lineData[62]++;
  val = parseFloat(val);
  _$jscoverage['/ie/style.js'].lineData[64]++;
  var style = elem[STYLE], currentStyle = elem[CURRENT_STYLE], opacity = isNaN(val) ? '' : 'alpha(' + OPACITY + '=' + val * HUNDRED + ')', filter = util.trim(visit66_67_1(visit67_67_2(currentStyle && currentStyle[FILTER]) || visit68_67_3(style[FILTER] || '')));
  _$jscoverage['/ie/style.js'].lineData[70]++;
  style.zoom = 1;
  _$jscoverage['/ie/style.js'].lineData[74]++;
  if (visit69_74_1((visit70_74_2(visit71_74_3(val >= 1) || !opacity)) && !util.trim(filter.replace(R_ALPHA, '')))) {
    _$jscoverage['/ie/style.js'].lineData[79]++;
    style.removeAttribute(FILTER);
    _$jscoverage['/ie/style.js'].lineData[81]++;
    if (visit72_82_1(!opacity || visit73_84_1(currentStyle && !currentStyle[FILTER]))) {
      _$jscoverage['/ie/style.js'].lineData[85]++;
      return;
    }
  }
  _$jscoverage['/ie/style.js'].lineData[91]++;
  style.filter = R_ALPHA.test(filter) ? filter.replace(R_ALPHA, opacity) : filter + (filter ? ', ' : '') + opacity;
}};
    }
  }  catch (ex) {
  _$jscoverage['/ie/style.js'].lineData[98]++;
  logger.debug('IE filters ActiveX is disabled. ex = ' + ex);
}
  _$jscoverage['/ie/style.js'].lineData[106]++;
  var IE8 = visit74_106_1(UA.ie === 8), BORDER_MAP = {}, BORDERS = ['', 'Top', 'Left', 'Right', 'Bottom'];
  _$jscoverage['/ie/style.js'].lineData[109]++;
  BORDER_MAP.thin = IE8 ? '1px' : '2px';
  _$jscoverage['/ie/style.js'].lineData[110]++;
  BORDER_MAP.medium = IE8 ? '3px' : '4px';
  _$jscoverage['/ie/style.js'].lineData[111]++;
  BORDER_MAP.thick = IE8 ? '5px' : '6px';
  _$jscoverage['/ie/style.js'].lineData[113]++;
  util.each(BORDERS, function(b) {
  _$jscoverage['/ie/style.js'].functionData[4]++;
  _$jscoverage['/ie/style.js'].lineData[114]++;
  var name = 'border' + b + 'Width', styleName = 'border' + b + 'Style';
  _$jscoverage['/ie/style.js'].lineData[117]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[5]++;
  _$jscoverage['/ie/style.js'].lineData[120]++;
  var currentStyle = computed ? elem[CURRENT_STYLE] : 0, current = visit75_121_1(visit76_121_2(currentStyle && String(currentStyle[name])) || undefined);
  _$jscoverage['/ie/style.js'].lineData[123]++;
  if (visit77_123_1(current && visit78_123_2(current.indexOf('px') < 0))) {
    _$jscoverage['/ie/style.js'].lineData[125]++;
    if (visit79_125_1(BORDER_MAP[current] && visit80_125_2(currentStyle[styleName] !== 'none'))) {
      _$jscoverage['/ie/style.js'].lineData[126]++;
      current = BORDER_MAP[current];
    } else {
      _$jscoverage['/ie/style.js'].lineData[129]++;
      current = 0;
    }
  }
  _$jscoverage['/ie/style.js'].lineData[132]++;
  return current;
}};
});
  _$jscoverage['/ie/style.js'].lineData[137]++;
  Dom._getComputedStyle = function(elem, name) {
  _$jscoverage['/ie/style.js'].functionData[6]++;
  _$jscoverage['/ie/style.js'].lineData[138]++;
  name = visit81_138_1(cssProps[name] || name);
  _$jscoverage['/ie/style.js'].lineData[141]++;
  var ret = visit82_141_1(elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name]);
  _$jscoverage['/ie/style.js'].lineData[153]++;
  if (visit83_153_1(Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name))) {
    _$jscoverage['/ie/style.js'].lineData[155]++;
    var style = elem[STYLE], left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];
    _$jscoverage['/ie/style.js'].lineData[160]++;
    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
    _$jscoverage['/ie/style.js'].lineData[163]++;
    style[LEFT] = visit84_163_1(name === 'fontSize') ? '1em' : (visit85_163_2(ret || 0));
    _$jscoverage['/ie/style.js'].lineData[164]++;
    ret = style.pixelLeft + PX;
    _$jscoverage['/ie/style.js'].lineData[167]++;
    style[LEFT] = left;
    _$jscoverage['/ie/style.js'].lineData[169]++;
    elem[RUNTIME_STYLE][LEFT] = rsLeft;
  }
  _$jscoverage['/ie/style.js'].lineData[171]++;
  return visit86_171_1(ret === '') ? 'auto' : ret;
};
});
