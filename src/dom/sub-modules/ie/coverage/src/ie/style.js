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
  _$jscoverage['/ie/style.js'].lineData[29] = 0;
  _$jscoverage['/ie/style.js'].lineData[32] = 0;
  _$jscoverage['/ie/style.js'].lineData[34] = 0;
  _$jscoverage['/ie/style.js'].lineData[35] = 0;
  _$jscoverage['/ie/style.js'].lineData[39] = 0;
  _$jscoverage['/ie/style.js'].lineData[45] = 0;
  _$jscoverage['/ie/style.js'].lineData[46] = 0;
  _$jscoverage['/ie/style.js'].lineData[47] = 0;
  _$jscoverage['/ie/style.js'].lineData[52] = 0;
  _$jscoverage['/ie/style.js'].lineData[61] = 0;
  _$jscoverage['/ie/style.js'].lineData[63] = 0;
  _$jscoverage['/ie/style.js'].lineData[69] = 0;
  _$jscoverage['/ie/style.js'].lineData[73] = 0;
  _$jscoverage['/ie/style.js'].lineData[78] = 0;
  _$jscoverage['/ie/style.js'].lineData[80] = 0;
  _$jscoverage['/ie/style.js'].lineData[84] = 0;
  _$jscoverage['/ie/style.js'].lineData[90] = 0;
  _$jscoverage['/ie/style.js'].lineData[97] = 0;
  _$jscoverage['/ie/style.js'].lineData[105] = 0;
  _$jscoverage['/ie/style.js'].lineData[108] = 0;
  _$jscoverage['/ie/style.js'].lineData[109] = 0;
  _$jscoverage['/ie/style.js'].lineData[110] = 0;
  _$jscoverage['/ie/style.js'].lineData[112] = 0;
  _$jscoverage['/ie/style.js'].lineData[113] = 0;
  _$jscoverage['/ie/style.js'].lineData[116] = 0;
  _$jscoverage['/ie/style.js'].lineData[119] = 0;
  _$jscoverage['/ie/style.js'].lineData[122] = 0;
  _$jscoverage['/ie/style.js'].lineData[124] = 0;
  _$jscoverage['/ie/style.js'].lineData[125] = 0;
  _$jscoverage['/ie/style.js'].lineData[128] = 0;
  _$jscoverage['/ie/style.js'].lineData[131] = 0;
  _$jscoverage['/ie/style.js'].lineData[136] = 0;
  _$jscoverage['/ie/style.js'].lineData[137] = 0;
  _$jscoverage['/ie/style.js'].lineData[140] = 0;
  _$jscoverage['/ie/style.js'].lineData[152] = 0;
  _$jscoverage['/ie/style.js'].lineData[154] = 0;
  _$jscoverage['/ie/style.js'].lineData[159] = 0;
  _$jscoverage['/ie/style.js'].lineData[162] = 0;
  _$jscoverage['/ie/style.js'].lineData[163] = 0;
  _$jscoverage['/ie/style.js'].lineData[166] = 0;
  _$jscoverage['/ie/style.js'].lineData[168] = 0;
  _$jscoverage['/ie/style.js'].lineData[170] = 0;
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
  _$jscoverage['/ie/style.js'].branchData['14'] = [];
  _$jscoverage['/ie/style.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['34'] = [];
  _$jscoverage['/ie/style.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['46'] = [];
  _$jscoverage['/ie/style.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['52'] = [];
  _$jscoverage['/ie/style.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['53'] = [];
  _$jscoverage['/ie/style.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['66'] = [];
  _$jscoverage['/ie/style.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['66'][3] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['73'] = [];
  _$jscoverage['/ie/style.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['73'][3] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['81'] = [];
  _$jscoverage['/ie/style.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['83'] = [];
  _$jscoverage['/ie/style.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['105'] = [];
  _$jscoverage['/ie/style.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['120'] = [];
  _$jscoverage['/ie/style.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['122'] = [];
  _$jscoverage['/ie/style.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['124'] = [];
  _$jscoverage['/ie/style.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['137'] = [];
  _$jscoverage['/ie/style.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['140'] = [];
  _$jscoverage['/ie/style.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['152'] = [];
  _$jscoverage['/ie/style.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['162'] = [];
  _$jscoverage['/ie/style.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['170'] = [];
  _$jscoverage['/ie/style.js'].branchData['170'][1] = new BranchData();
}
_$jscoverage['/ie/style.js'].branchData['170'][1].init(1440, 10, 'ret === \'\'');
function visit85_170_1(result) {
  _$jscoverage['/ie/style.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['162'][2].init(404, 8, 'ret || 0');
function visit84_162_2(result) {
  _$jscoverage['/ie/style.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['162'][1].init(373, 19, 'name === \'fontSize\'');
function visit83_162_1(result) {
  _$jscoverage['/ie/style.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['152'][1].init(785, 49, 'Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)');
function visit82_152_1(result) {
  _$jscoverage['/ie/style.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['140'][1].init(158, 48, 'elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name]');
function visit81_140_1(result) {
  _$jscoverage['/ie/style.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['137'][1].init(16, 22, 'cssProps[name] || name');
function visit80_137_1(result) {
  _$jscoverage['/ie/style.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['124'][2].init(78, 34, 'currentStyle[styleName] !== \'none\'');
function visit79_124_2(result) {
  _$jscoverage['/ie/style.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['124'][1].init(55, 57, 'BORDER_MAP[current] && currentStyle[styleName] !== \'none\'');
function visit78_124_1(result) {
  _$jscoverage['/ie/style.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['122'][2].init(285, 25, 'current.indexOf(\'px\') < 0');
function visit77_122_2(result) {
  _$jscoverage['/ie/style.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['122'][1].init(274, 36, 'current && current.indexOf(\'px\') < 0');
function visit76_122_1(result) {
  _$jscoverage['/ie/style.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['120'][2].init(84, 42, 'currentStyle && String(currentStyle[name])');
function visit75_120_2(result) {
  _$jscoverage['/ie/style.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['120'][1].init(84, 55, 'currentStyle && String(currentStyle[name]) || undefined');
function visit74_120_1(result) {
  _$jscoverage['/ie/style.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['105'][1].init(3882, 11, 'UA.ie === 8');
function visit73_105_1(result) {
  _$jscoverage['/ie/style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['83'][1].init(141, 37, 'currentStyle && !currentStyle[FILTER]');
function visit72_83_1(result) {
  _$jscoverage['/ie/style.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['81'][1].init(55, 179, '!opacity || currentStyle && !currentStyle[FILTER]');
function visit71_81_1(result) {
  _$jscoverage['/ie/style.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['73'][3].init(634, 8, 'val >= 1');
function visit70_73_3(result) {
  _$jscoverage['/ie/style.js'].branchData['73'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['73'][2].init(634, 20, 'val >= 1 || !opacity');
function visit69_73_2(result) {
  _$jscoverage['/ie/style.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['73'][1].init(634, 61, '(val >= 1 || !opacity) && !S.trim(filter.replace(R_ALPHA, \'\'))');
function visit68_73_1(result) {
  _$jscoverage['/ie/style.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['66'][3].init(39, 19, 'style[FILTER] || \'\'');
function visit67_66_3(result) {
  _$jscoverage['/ie/style.js'].branchData['66'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['66'][2].init(16, 36, 'currentStyle && currentStyle[FILTER]');
function visit66_66_2(result) {
  _$jscoverage['/ie/style.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['66'][1].init(224, 59, 'currentStyle && currentStyle[FILTER] || style[FILTER] || \'\'');
function visit65_66_1(result) {
  _$jscoverage['/ie/style.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['53'][1].init(-1, 31, 'computed && elem[CURRENT_STYLE]');
function visit64_53_1(result) {
  _$jscoverage['/ie/style.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['52'][1].init(40, 146, '(computed && elem[CURRENT_STYLE] ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || \'\'');
function visit63_52_1(result) {
  _$jscoverage['/ie/style.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['46'][1].init(13, 30, 'docElem.style[OPACITY] == null');
function visit62_46_1(result) {
  _$jscoverage['/ie/style.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['34'][1].init(17, 8, 'computed');
function visit61_34_1(result) {
  _$jscoverage['/ie/style.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['14'][1].init(149, 26, 'doc && doc.documentElement');
function visit60_14_1(result) {
  _$jscoverage['/ie/style.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/style.js'].functionData[0]++;
  _$jscoverage['/ie/style.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/style.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/ie/style.js'].lineData[9]++;
  var cssProps = Dom._cssProps, UA = S.UA, FLOAT = 'float', HUNDRED = 100, doc = S.Env.host.document, docElem = visit60_14_1(doc && doc.documentElement), OPACITY = 'opacity', STYLE = 'style', RE_POS = /^(top|right|bottom|left)$/, FILTER = 'filter', CURRENT_STYLE = 'currentStyle', RUNTIME_STYLE = 'runtimeStyle', LEFT = 'left', PX = 'px', cssHooks = Dom._cssHooks, backgroundPosition = 'backgroundPosition', R_OPACITY = /opacity\s*=\s*([^)]*)/, R_ALPHA = /alpha\([^)]*\)/i;
  _$jscoverage['/ie/style.js'].lineData[29]++;
  cssProps[FLOAT] = 'styleFloat';
  _$jscoverage['/ie/style.js'].lineData[32]++;
  cssHooks[backgroundPosition] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[1]++;
  _$jscoverage['/ie/style.js'].lineData[34]++;
  if (visit61_34_1(computed)) {
    _$jscoverage['/ie/style.js'].lineData[35]++;
    return elem[CURRENT_STYLE][backgroundPosition + 'X'] + ' ' + elem[CURRENT_STYLE][backgroundPosition + 'Y'];
  } else {
    _$jscoverage['/ie/style.js'].lineData[39]++;
    return elem[STYLE][backgroundPosition];
  }
}};
  _$jscoverage['/ie/style.js'].lineData[45]++;
  try {
    _$jscoverage['/ie/style.js'].lineData[46]++;
    if (visit62_46_1(docElem.style[OPACITY] == null)) {
      _$jscoverage['/ie/style.js'].lineData[47]++;
      cssHooks[OPACITY] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[2]++;
  _$jscoverage['/ie/style.js'].lineData[52]++;
  return R_OPACITY.test(visit63_52_1((visit64_53_1(computed && elem[CURRENT_STYLE]) ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || '')) ? (parseFloat(RegExp.$1) / HUNDRED) + '' : computed ? '1' : '';
}, 
  set: function(elem, val) {
  _$jscoverage['/ie/style.js'].functionData[3]++;
  _$jscoverage['/ie/style.js'].lineData[61]++;
  val = parseFloat(val);
  _$jscoverage['/ie/style.js'].lineData[63]++;
  var style = elem[STYLE], currentStyle = elem[CURRENT_STYLE], opacity = isNaN(val) ? '' : 'alpha(' + OPACITY + '=' + val * HUNDRED + ')', filter = S.trim(visit65_66_1(visit66_66_2(currentStyle && currentStyle[FILTER]) || visit67_66_3(style[FILTER] || '')));
  _$jscoverage['/ie/style.js'].lineData[69]++;
  style.zoom = 1;
  _$jscoverage['/ie/style.js'].lineData[73]++;
  if (visit68_73_1((visit69_73_2(visit70_73_3(val >= 1) || !opacity)) && !S.trim(filter.replace(R_ALPHA, '')))) {
    _$jscoverage['/ie/style.js'].lineData[78]++;
    style.removeAttribute(FILTER);
    _$jscoverage['/ie/style.js'].lineData[80]++;
    if (visit71_81_1(!opacity || visit72_83_1(currentStyle && !currentStyle[FILTER]))) {
      _$jscoverage['/ie/style.js'].lineData[84]++;
      return;
    }
  }
  _$jscoverage['/ie/style.js'].lineData[90]++;
  style.filter = R_ALPHA.test(filter) ? filter.replace(R_ALPHA, opacity) : filter + (filter ? ', ' : '') + opacity;
}};
    }
  }  catch (ex) {
  _$jscoverage['/ie/style.js'].lineData[97]++;
  logger.debug('IE filters ActiveX is disabled. ex = ' + ex);
}
  _$jscoverage['/ie/style.js'].lineData[105]++;
  var IE8 = visit73_105_1(UA.ie === 8), BORDER_MAP = {}, BORDERS = ['', 'Top', 'Left', 'Right', 'Bottom'];
  _$jscoverage['/ie/style.js'].lineData[108]++;
  BORDER_MAP.thin = IE8 ? '1px' : '2px';
  _$jscoverage['/ie/style.js'].lineData[109]++;
  BORDER_MAP.medium = IE8 ? '3px' : '4px';
  _$jscoverage['/ie/style.js'].lineData[110]++;
  BORDER_MAP.thick = IE8 ? '5px' : '6px';
  _$jscoverage['/ie/style.js'].lineData[112]++;
  S.each(BORDERS, function(b) {
  _$jscoverage['/ie/style.js'].functionData[4]++;
  _$jscoverage['/ie/style.js'].lineData[113]++;
  var name = 'border' + b + 'Width', styleName = 'border' + b + 'Style';
  _$jscoverage['/ie/style.js'].lineData[116]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[5]++;
  _$jscoverage['/ie/style.js'].lineData[119]++;
  var currentStyle = computed ? elem[CURRENT_STYLE] : 0, current = visit74_120_1(visit75_120_2(currentStyle && String(currentStyle[name])) || undefined);
  _$jscoverage['/ie/style.js'].lineData[122]++;
  if (visit76_122_1(current && visit77_122_2(current.indexOf('px') < 0))) {
    _$jscoverage['/ie/style.js'].lineData[124]++;
    if (visit78_124_1(BORDER_MAP[current] && visit79_124_2(currentStyle[styleName] !== 'none'))) {
      _$jscoverage['/ie/style.js'].lineData[125]++;
      current = BORDER_MAP[current];
    } else {
      _$jscoverage['/ie/style.js'].lineData[128]++;
      current = 0;
    }
  }
  _$jscoverage['/ie/style.js'].lineData[131]++;
  return current;
}};
});
  _$jscoverage['/ie/style.js'].lineData[136]++;
  Dom._getComputedStyle = function(elem, name) {
  _$jscoverage['/ie/style.js'].functionData[6]++;
  _$jscoverage['/ie/style.js'].lineData[137]++;
  name = visit80_137_1(cssProps[name] || name);
  _$jscoverage['/ie/style.js'].lineData[140]++;
  var ret = visit81_140_1(elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name]);
  _$jscoverage['/ie/style.js'].lineData[152]++;
  if (visit82_152_1(Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name))) {
    _$jscoverage['/ie/style.js'].lineData[154]++;
    var style = elem[STYLE], left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];
    _$jscoverage['/ie/style.js'].lineData[159]++;
    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
    _$jscoverage['/ie/style.js'].lineData[162]++;
    style[LEFT] = visit83_162_1(name === 'fontSize') ? '1em' : (visit84_162_2(ret || 0));
    _$jscoverage['/ie/style.js'].lineData[163]++;
    ret = style.pixelLeft + PX;
    _$jscoverage['/ie/style.js'].lineData[166]++;
    style[LEFT] = left;
    _$jscoverage['/ie/style.js'].lineData[168]++;
    elem[RUNTIME_STYLE][LEFT] = rsLeft;
  }
  _$jscoverage['/ie/style.js'].lineData[170]++;
  return visit85_170_1(ret === '') ? 'auto' : ret;
};
});
