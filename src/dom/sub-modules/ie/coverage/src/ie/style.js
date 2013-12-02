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
  _$jscoverage['/ie/style.js'].lineData[28] = 0;
  _$jscoverage['/ie/style.js'].lineData[31] = 0;
  _$jscoverage['/ie/style.js'].lineData[33] = 0;
  _$jscoverage['/ie/style.js'].lineData[34] = 0;
  _$jscoverage['/ie/style.js'].lineData[38] = 0;
  _$jscoverage['/ie/style.js'].lineData[44] = 0;
  _$jscoverage['/ie/style.js'].lineData[45] = 0;
  _$jscoverage['/ie/style.js'].lineData[46] = 0;
  _$jscoverage['/ie/style.js'].lineData[51] = 0;
  _$jscoverage['/ie/style.js'].lineData[60] = 0;
  _$jscoverage['/ie/style.js'].lineData[62] = 0;
  _$jscoverage['/ie/style.js'].lineData[68] = 0;
  _$jscoverage['/ie/style.js'].lineData[72] = 0;
  _$jscoverage['/ie/style.js'].lineData[77] = 0;
  _$jscoverage['/ie/style.js'].lineData[79] = 0;
  _$jscoverage['/ie/style.js'].lineData[83] = 0;
  _$jscoverage['/ie/style.js'].lineData[89] = 0;
  _$jscoverage['/ie/style.js'].lineData[96] = 0;
  _$jscoverage['/ie/style.js'].lineData[104] = 0;
  _$jscoverage['/ie/style.js'].lineData[107] = 0;
  _$jscoverage['/ie/style.js'].lineData[108] = 0;
  _$jscoverage['/ie/style.js'].lineData[109] = 0;
  _$jscoverage['/ie/style.js'].lineData[111] = 0;
  _$jscoverage['/ie/style.js'].lineData[112] = 0;
  _$jscoverage['/ie/style.js'].lineData[115] = 0;
  _$jscoverage['/ie/style.js'].lineData[118] = 0;
  _$jscoverage['/ie/style.js'].lineData[121] = 0;
  _$jscoverage['/ie/style.js'].lineData[123] = 0;
  _$jscoverage['/ie/style.js'].lineData[124] = 0;
  _$jscoverage['/ie/style.js'].lineData[127] = 0;
  _$jscoverage['/ie/style.js'].lineData[130] = 0;
  _$jscoverage['/ie/style.js'].lineData[135] = 0;
  _$jscoverage['/ie/style.js'].lineData[136] = 0;
  _$jscoverage['/ie/style.js'].lineData[139] = 0;
  _$jscoverage['/ie/style.js'].lineData[151] = 0;
  _$jscoverage['/ie/style.js'].lineData[153] = 0;
  _$jscoverage['/ie/style.js'].lineData[158] = 0;
  _$jscoverage['/ie/style.js'].lineData[161] = 0;
  _$jscoverage['/ie/style.js'].lineData[162] = 0;
  _$jscoverage['/ie/style.js'].lineData[165] = 0;
  _$jscoverage['/ie/style.js'].lineData[167] = 0;
  _$jscoverage['/ie/style.js'].lineData[169] = 0;
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
  _$jscoverage['/ie/style.js'].branchData['33'] = [];
  _$jscoverage['/ie/style.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['45'] = [];
  _$jscoverage['/ie/style.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['51'] = [];
  _$jscoverage['/ie/style.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['52'] = [];
  _$jscoverage['/ie/style.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['65'] = [];
  _$jscoverage['/ie/style.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['65'][3] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['72'] = [];
  _$jscoverage['/ie/style.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['72'][3] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['80'] = [];
  _$jscoverage['/ie/style.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['82'] = [];
  _$jscoverage['/ie/style.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['104'] = [];
  _$jscoverage['/ie/style.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['119'] = [];
  _$jscoverage['/ie/style.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['121'] = [];
  _$jscoverage['/ie/style.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['123'] = [];
  _$jscoverage['/ie/style.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['136'] = [];
  _$jscoverage['/ie/style.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['139'] = [];
  _$jscoverage['/ie/style.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['151'] = [];
  _$jscoverage['/ie/style.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['161'] = [];
  _$jscoverage['/ie/style.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/ie/style.js'].branchData['169'] = [];
  _$jscoverage['/ie/style.js'].branchData['169'][1] = new BranchData();
}
_$jscoverage['/ie/style.js'].branchData['169'][1].init(1440, 10, 'ret === \'\'');
function visit85_169_1(result) {
  _$jscoverage['/ie/style.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['161'][2].init(404, 8, 'ret || 0');
function visit84_161_2(result) {
  _$jscoverage['/ie/style.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['161'][1].init(373, 19, 'name === \'fontSize\'');
function visit83_161_1(result) {
  _$jscoverage['/ie/style.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['151'][1].init(785, 49, 'Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)');
function visit82_151_1(result) {
  _$jscoverage['/ie/style.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['139'][1].init(158, 48, 'elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name]');
function visit81_139_1(result) {
  _$jscoverage['/ie/style.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['136'][1].init(16, 22, 'cssProps[name] || name');
function visit80_136_1(result) {
  _$jscoverage['/ie/style.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['123'][2].init(78, 34, 'currentStyle[styleName] !== \'none\'');
function visit79_123_2(result) {
  _$jscoverage['/ie/style.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['123'][1].init(55, 57, 'BORDER_MAP[current] && currentStyle[styleName] !== \'none\'');
function visit78_123_1(result) {
  _$jscoverage['/ie/style.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['121'][2].init(285, 25, 'current.indexOf(\'px\') < 0');
function visit77_121_2(result) {
  _$jscoverage['/ie/style.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['121'][1].init(274, 36, 'current && current.indexOf(\'px\') < 0');
function visit76_121_1(result) {
  _$jscoverage['/ie/style.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['119'][2].init(84, 42, 'currentStyle && String(currentStyle[name])');
function visit75_119_2(result) {
  _$jscoverage['/ie/style.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['119'][1].init(84, 55, 'currentStyle && String(currentStyle[name]) || undefined');
function visit74_119_1(result) {
  _$jscoverage['/ie/style.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['104'][1].init(3835, 11, 'UA.ie === 8');
function visit73_104_1(result) {
  _$jscoverage['/ie/style.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['82'][1].init(141, 37, 'currentStyle && !currentStyle[FILTER]');
function visit72_82_1(result) {
  _$jscoverage['/ie/style.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['80'][1].init(55, 179, '!opacity || currentStyle && !currentStyle[FILTER]');
function visit71_80_1(result) {
  _$jscoverage['/ie/style.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['72'][3].init(634, 8, 'val >= 1');
function visit70_72_3(result) {
  _$jscoverage['/ie/style.js'].branchData['72'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['72'][2].init(634, 20, 'val >= 1 || !opacity');
function visit69_72_2(result) {
  _$jscoverage['/ie/style.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['72'][1].init(634, 61, '(val >= 1 || !opacity) && !S.trim(filter.replace(R_ALPHA, \'\'))');
function visit68_72_1(result) {
  _$jscoverage['/ie/style.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['65'][3].init(39, 19, 'style[FILTER] || \'\'');
function visit67_65_3(result) {
  _$jscoverage['/ie/style.js'].branchData['65'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['65'][2].init(16, 36, 'currentStyle && currentStyle[FILTER]');
function visit66_65_2(result) {
  _$jscoverage['/ie/style.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['65'][1].init(224, 59, 'currentStyle && currentStyle[FILTER] || style[FILTER] || \'\'');
function visit65_65_1(result) {
  _$jscoverage['/ie/style.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['52'][1].init(-1, 31, 'computed && elem[CURRENT_STYLE]');
function visit64_52_1(result) {
  _$jscoverage['/ie/style.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['51'][1].init(40, 146, '(computed && elem[CURRENT_STYLE] ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || \'\'');
function visit63_51_1(result) {
  _$jscoverage['/ie/style.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['45'][1].init(13, 30, 'docElem.style[OPACITY] == null');
function visit62_45_1(result) {
  _$jscoverage['/ie/style.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['33'][1].init(17, 8, 'computed');
function visit61_33_1(result) {
  _$jscoverage['/ie/style.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/style.js'].branchData['14'][1].init(125, 26, 'doc && doc.documentElement');
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
  var cssProps = Dom._cssProps, UA = S.UA, HUNDRED = 100, doc = S.Env.host.document, docElem = visit60_14_1(doc && doc.documentElement), OPACITY = 'opacity', STYLE = 'style', RE_POS = /^(top|right|bottom|left)$/, FILTER = 'filter', CURRENT_STYLE = 'currentStyle', RUNTIME_STYLE = 'runtimeStyle', LEFT = 'left', PX = 'px', cssHooks = Dom._cssHooks, backgroundPosition = 'backgroundPosition', R_OPACITY = /opacity\s*=\s*([^)]*)/, R_ALPHA = /alpha\([^)]*\)/i;
  _$jscoverage['/ie/style.js'].lineData[28]++;
  cssProps.float = 'styleFloat';
  _$jscoverage['/ie/style.js'].lineData[31]++;
  cssHooks[backgroundPosition] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[1]++;
  _$jscoverage['/ie/style.js'].lineData[33]++;
  if (visit61_33_1(computed)) {
    _$jscoverage['/ie/style.js'].lineData[34]++;
    return elem[CURRENT_STYLE][backgroundPosition + 'X'] + ' ' + elem[CURRENT_STYLE][backgroundPosition + 'Y'];
  } else {
    _$jscoverage['/ie/style.js'].lineData[38]++;
    return elem[STYLE][backgroundPosition];
  }
}};
  _$jscoverage['/ie/style.js'].lineData[44]++;
  try {
    _$jscoverage['/ie/style.js'].lineData[45]++;
    if (visit62_45_1(docElem.style[OPACITY] == null)) {
      _$jscoverage['/ie/style.js'].lineData[46]++;
      cssHooks[OPACITY] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[2]++;
  _$jscoverage['/ie/style.js'].lineData[51]++;
  return R_OPACITY.test(visit63_51_1((visit64_52_1(computed && elem[CURRENT_STYLE]) ? elem[CURRENT_STYLE][FILTER] : elem[STYLE][FILTER]) || '')) ? (parseFloat(RegExp.$1) / HUNDRED) + '' : computed ? '1' : '';
}, 
  set: function(elem, val) {
  _$jscoverage['/ie/style.js'].functionData[3]++;
  _$jscoverage['/ie/style.js'].lineData[60]++;
  val = parseFloat(val);
  _$jscoverage['/ie/style.js'].lineData[62]++;
  var style = elem[STYLE], currentStyle = elem[CURRENT_STYLE], opacity = isNaN(val) ? '' : 'alpha(' + OPACITY + '=' + val * HUNDRED + ')', filter = S.trim(visit65_65_1(visit66_65_2(currentStyle && currentStyle[FILTER]) || visit67_65_3(style[FILTER] || '')));
  _$jscoverage['/ie/style.js'].lineData[68]++;
  style.zoom = 1;
  _$jscoverage['/ie/style.js'].lineData[72]++;
  if (visit68_72_1((visit69_72_2(visit70_72_3(val >= 1) || !opacity)) && !S.trim(filter.replace(R_ALPHA, '')))) {
    _$jscoverage['/ie/style.js'].lineData[77]++;
    style.removeAttribute(FILTER);
    _$jscoverage['/ie/style.js'].lineData[79]++;
    if (visit71_80_1(!opacity || visit72_82_1(currentStyle && !currentStyle[FILTER]))) {
      _$jscoverage['/ie/style.js'].lineData[83]++;
      return;
    }
  }
  _$jscoverage['/ie/style.js'].lineData[89]++;
  style.filter = R_ALPHA.test(filter) ? filter.replace(R_ALPHA, opacity) : filter + (filter ? ', ' : '') + opacity;
}};
    }
  }  catch (ex) {
  _$jscoverage['/ie/style.js'].lineData[96]++;
  logger.debug('IE filters ActiveX is disabled. ex = ' + ex);
}
  _$jscoverage['/ie/style.js'].lineData[104]++;
  var IE8 = visit73_104_1(UA.ie === 8), BORDER_MAP = {}, BORDERS = ['', 'Top', 'Left', 'Right', 'Bottom'];
  _$jscoverage['/ie/style.js'].lineData[107]++;
  BORDER_MAP.thin = IE8 ? '1px' : '2px';
  _$jscoverage['/ie/style.js'].lineData[108]++;
  BORDER_MAP.medium = IE8 ? '3px' : '4px';
  _$jscoverage['/ie/style.js'].lineData[109]++;
  BORDER_MAP.thick = IE8 ? '5px' : '6px';
  _$jscoverage['/ie/style.js'].lineData[111]++;
  S.each(BORDERS, function(b) {
  _$jscoverage['/ie/style.js'].functionData[4]++;
  _$jscoverage['/ie/style.js'].lineData[112]++;
  var name = 'border' + b + 'Width', styleName = 'border' + b + 'Style';
  _$jscoverage['/ie/style.js'].lineData[115]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/ie/style.js'].functionData[5]++;
  _$jscoverage['/ie/style.js'].lineData[118]++;
  var currentStyle = computed ? elem[CURRENT_STYLE] : 0, current = visit74_119_1(visit75_119_2(currentStyle && String(currentStyle[name])) || undefined);
  _$jscoverage['/ie/style.js'].lineData[121]++;
  if (visit76_121_1(current && visit77_121_2(current.indexOf('px') < 0))) {
    _$jscoverage['/ie/style.js'].lineData[123]++;
    if (visit78_123_1(BORDER_MAP[current] && visit79_123_2(currentStyle[styleName] !== 'none'))) {
      _$jscoverage['/ie/style.js'].lineData[124]++;
      current = BORDER_MAP[current];
    } else {
      _$jscoverage['/ie/style.js'].lineData[127]++;
      current = 0;
    }
  }
  _$jscoverage['/ie/style.js'].lineData[130]++;
  return current;
}};
});
  _$jscoverage['/ie/style.js'].lineData[135]++;
  Dom._getComputedStyle = function(elem, name) {
  _$jscoverage['/ie/style.js'].functionData[6]++;
  _$jscoverage['/ie/style.js'].lineData[136]++;
  name = visit80_136_1(cssProps[name] || name);
  _$jscoverage['/ie/style.js'].lineData[139]++;
  var ret = visit81_139_1(elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name]);
  _$jscoverage['/ie/style.js'].lineData[151]++;
  if (visit82_151_1(Dom._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name))) {
    _$jscoverage['/ie/style.js'].lineData[153]++;
    var style = elem[STYLE], left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];
    _$jscoverage['/ie/style.js'].lineData[158]++;
    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
    _$jscoverage['/ie/style.js'].lineData[161]++;
    style[LEFT] = visit83_161_1(name === 'fontSize') ? '1em' : (visit84_161_2(ret || 0));
    _$jscoverage['/ie/style.js'].lineData[162]++;
    ret = style.pixelLeft + PX;
    _$jscoverage['/ie/style.js'].lineData[165]++;
    style[LEFT] = left;
    _$jscoverage['/ie/style.js'].lineData[167]++;
    elem[RUNTIME_STYLE][LEFT] = rsLeft;
  }
  _$jscoverage['/ie/style.js'].lineData[169]++;
  return visit85_169_1(ret === '') ? 'auto' : ret;
};
});
