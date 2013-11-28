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
if (! _$jscoverage['/loader/init.js']) {
  _$jscoverage['/loader/init.js'] = {};
  _$jscoverage['/loader/init.js'].lineData = [];
  _$jscoverage['/loader/init.js'].lineData[5] = 0;
  _$jscoverage['/loader/init.js'].lineData[6] = 0;
  _$jscoverage['/loader/init.js'].lineData[8] = 0;
  _$jscoverage['/loader/init.js'].lineData[9] = 0;
  _$jscoverage['/loader/init.js'].lineData[10] = 0;
  _$jscoverage['/loader/init.js'].lineData[11] = 0;
  _$jscoverage['/loader/init.js'].lineData[13] = 0;
  _$jscoverage['/loader/init.js'].lineData[15] = 0;
  _$jscoverage['/loader/init.js'].lineData[18] = 0;
  _$jscoverage['/loader/init.js'].lineData[21] = 0;
  _$jscoverage['/loader/init.js'].lineData[24] = 0;
  _$jscoverage['/loader/init.js'].lineData[25] = 0;
  _$jscoverage['/loader/init.js'].lineData[26] = 0;
  _$jscoverage['/loader/init.js'].lineData[29] = 0;
  _$jscoverage['/loader/init.js'].lineData[31] = 0;
  _$jscoverage['/loader/init.js'].lineData[32] = 0;
  _$jscoverage['/loader/init.js'].lineData[34] = 0;
  _$jscoverage['/loader/init.js'].lineData[37] = 0;
  _$jscoverage['/loader/init.js'].lineData[38] = 0;
  _$jscoverage['/loader/init.js'].lineData[40] = 0;
  _$jscoverage['/loader/init.js'].lineData[45] = 0;
  _$jscoverage['/loader/init.js'].lineData[46] = 0;
  _$jscoverage['/loader/init.js'].lineData[48] = 0;
  _$jscoverage['/loader/init.js'].lineData[51] = 0;
  _$jscoverage['/loader/init.js'].lineData[52] = 0;
  _$jscoverage['/loader/init.js'].lineData[54] = 0;
  _$jscoverage['/loader/init.js'].lineData[55] = 0;
  _$jscoverage['/loader/init.js'].lineData[56] = 0;
  _$jscoverage['/loader/init.js'].lineData[57] = 0;
  _$jscoverage['/loader/init.js'].lineData[58] = 0;
  _$jscoverage['/loader/init.js'].lineData[60] = 0;
  _$jscoverage['/loader/init.js'].lineData[64] = 0;
  _$jscoverage['/loader/init.js'].lineData[82] = 0;
  _$jscoverage['/loader/init.js'].lineData[85] = 0;
  _$jscoverage['/loader/init.js'].lineData[89] = 0;
  _$jscoverage['/loader/init.js'].lineData[90] = 0;
  _$jscoverage['/loader/init.js'].lineData[91] = 0;
  _$jscoverage['/loader/init.js'].lineData[95] = 0;
  _$jscoverage['/loader/init.js'].lineData[96] = 0;
  _$jscoverage['/loader/init.js'].lineData[99] = 0;
  _$jscoverage['/loader/init.js'].lineData[107] = 0;
  _$jscoverage['/loader/init.js'].lineData[110] = 0;
  _$jscoverage['/loader/init.js'].lineData[116] = 0;
  _$jscoverage['/loader/init.js'].lineData[118] = 0;
}
if (! _$jscoverage['/loader/init.js'].functionData) {
  _$jscoverage['/loader/init.js'].functionData = [];
  _$jscoverage['/loader/init.js'].functionData[0] = 0;
  _$jscoverage['/loader/init.js'].functionData[1] = 0;
  _$jscoverage['/loader/init.js'].functionData[2] = 0;
  _$jscoverage['/loader/init.js'].functionData[3] = 0;
  _$jscoverage['/loader/init.js'].functionData[4] = 0;
}
if (! _$jscoverage['/loader/init.js'].branchData) {
  _$jscoverage['/loader/init.js'].branchData = {};
  _$jscoverage['/loader/init.js'].branchData['6'] = [];
  _$jscoverage['/loader/init.js'].branchData['6'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['24'] = [];
  _$jscoverage['/loader/init.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['25'] = [];
  _$jscoverage['/loader/init.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['31'] = [];
  _$jscoverage['/loader/init.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['37'] = [];
  _$jscoverage['/loader/init.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['38'] = [];
  _$jscoverage['/loader/init.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['45'] = [];
  _$jscoverage['/loader/init.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['51'] = [];
  _$jscoverage['/loader/init.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['56'] = [];
  _$jscoverage['/loader/init.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['89'] = [];
  _$jscoverage['/loader/init.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['107'] = [];
  _$jscoverage['/loader/init.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['116'] = [];
  _$jscoverage['/loader/init.js'].branchData['116'][1] = new BranchData();
}
_$jscoverage['/loader/init.js'].branchData['116'][1].init(3298, 31, 'doc && doc.getElementsByTagName');
function visit446_116_1(result) {
  _$jscoverage['/loader/init.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['107'][1].init(3011, 11, 'S.UA.nodejs');
function visit445_107_1(result) {
  _$jscoverage['/loader/init.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['89'][1].init(209, 6, 'i >= 0');
function visit444_89_1(result) {
  _$jscoverage['/loader/init.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['56'][1].init(21, 23, 'part.match(baseTestReg)');
function visit443_56_1(result) {
  _$jscoverage['/loader/init.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['51'][1].init(179, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit442_51_1(result) {
  _$jscoverage['/loader/init.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['45'][1].init(611, 12, 'index === -1');
function visit441_45_1(result) {
  _$jscoverage['/loader/init.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['38'][1].init(455, 36, 'baseInfo.comboSep || defaultComboSep');
function visit440_38_1(result) {
  _$jscoverage['/loader/init.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['37'][1].init(388, 42, 'baseInfo.comboPrefix || defaultComboPrefix');
function visit439_37_1(result) {
  _$jscoverage['/loader/init.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['31'][1].init(250, 8, 'baseInfo');
function visit438_31_1(result) {
  _$jscoverage['/loader/init.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['25'][1].init(118, 23, '!src.match(baseTestReg)');
function visit437_25_1(result) {
  _$jscoverage['/loader/init.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['24'][1].init(88, 16, 'script.src || \'\'');
function visit436_24_1(result) {
  _$jscoverage['/loader/init.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['6'][1].init(15, 33, 'S.Env.host && S.Env.host.document');
function visit435_6_1(result) {
  _$jscoverage['/loader/init.js'].branchData['6'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].lineData[5]++;
(function(S) {
  _$jscoverage['/loader/init.js'].functionData[0]++;
  _$jscoverage['/loader/init.js'].lineData[6]++;
  var doc = visit435_6_1(S.Env.host && S.Env.host.document);
  _$jscoverage['/loader/init.js'].lineData[8]++;
  var Utils = S.Loader.Utils;
  _$jscoverage['/loader/init.js'].lineData[9]++;
  var TIMESTAMP = '@TIMESTAMP@';
  _$jscoverage['/loader/init.js'].lineData[10]++;
  var defaultComboPrefix = '??';
  _$jscoverage['/loader/init.js'].lineData[11]++;
  var defaultComboSep = ',';
  _$jscoverage['/loader/init.js'].lineData[13]++;
  function returnJson(s) {
    _$jscoverage['/loader/init.js'].functionData[1]++;
    _$jscoverage['/loader/init.js'].lineData[15]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/init.js'].lineData[18]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/init.js'].lineData[21]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/init.js'].functionData[2]++;
    _$jscoverage['/loader/init.js'].lineData[24]++;
    var src = visit436_24_1(script.src || '');
    _$jscoverage['/loader/init.js'].lineData[25]++;
    if (visit437_25_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/init.js'].lineData[26]++;
      return 0;
    }
    _$jscoverage['/loader/init.js'].lineData[29]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/init.js'].lineData[31]++;
    if (visit438_31_1(baseInfo)) {
      _$jscoverage['/loader/init.js'].lineData[32]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/init.js'].lineData[34]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/init.js'].lineData[37]++;
    var comboPrefix = visit439_37_1(baseInfo.comboPrefix || defaultComboPrefix);
    _$jscoverage['/loader/init.js'].lineData[38]++;
    var comboSep = visit440_38_1(baseInfo.comboSep || defaultComboSep);
    _$jscoverage['/loader/init.js'].lineData[40]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/init.js'].lineData[45]++;
    if (visit441_45_1(index === -1)) {
      _$jscoverage['/loader/init.js'].lineData[46]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/init.js'].lineData[48]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/init.js'].lineData[51]++;
      if (visit442_51_1(base.charAt(base.length - 1) !== '/')) {
        _$jscoverage['/loader/init.js'].lineData[52]++;
        base += '/';
      }
      _$jscoverage['/loader/init.js'].lineData[54]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/init.js'].lineData[55]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/init.js'].functionData[3]++;
  _$jscoverage['/loader/init.js'].lineData[56]++;
  if (visit443_56_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/init.js'].lineData[57]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/init.js'].lineData[58]++;
    return false;
  }
  _$jscoverage['/loader/init.js'].lineData[60]++;
  return undefined;
});
    }
    _$jscoverage['/loader/init.js'].lineData[64]++;
    return S.mix({
  base: base, 
  tag: Utils.getHash(TIMESTAMP + src)}, baseInfo);
  }
  _$jscoverage['/loader/init.js'].lineData[82]++;
  function getBaseInfo() {
    _$jscoverage['/loader/init.js'].functionData[4]++;
    _$jscoverage['/loader/init.js'].lineData[85]++;
    var scripts = doc.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/init.js'].lineData[89]++;
    for (i = scripts.length - 1; visit444_89_1(i >= 0); i--) {
      _$jscoverage['/loader/init.js'].lineData[90]++;
      if ((info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/init.js'].lineData[91]++;
        return info;
      }
    }
    _$jscoverage['/loader/init.js'].lineData[95]++;
    S.log('must load kissy by file name in browser environment: seed.js or seed-min.js', 'error');
    _$jscoverage['/loader/init.js'].lineData[96]++;
    return null;
  }
  _$jscoverage['/loader/init.js'].lineData[99]++;
  S.config({
  comboPrefix: defaultComboPrefix, 
  comboSep: defaultComboSep, 
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: TIMESTAMP});
  _$jscoverage['/loader/init.js'].lineData[107]++;
  if (visit445_107_1(S.UA.nodejs)) {
    _$jscoverage['/loader/init.js'].lineData[110]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/init.js'].lineData[116]++;
    if (visit446_116_1(doc && doc.getElementsByTagName)) {
      _$jscoverage['/loader/init.js'].lineData[118]++;
      S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40}, getBaseInfo()));
    }
  }
})(KISSY);
