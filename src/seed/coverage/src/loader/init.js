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
  _$jscoverage['/loader/init.js'].lineData[65] = 0;
  _$jscoverage['/loader/init.js'].lineData[66] = 0;
  _$jscoverage['/loader/init.js'].lineData[67] = 0;
  _$jscoverage['/loader/init.js'].lineData[69] = 0;
  _$jscoverage['/loader/init.js'].lineData[73] = 0;
  _$jscoverage['/loader/init.js'].lineData[75] = 0;
  _$jscoverage['/loader/init.js'].lineData[89] = 0;
  _$jscoverage['/loader/init.js'].lineData[92] = 0;
  _$jscoverage['/loader/init.js'].lineData[96] = 0;
  _$jscoverage['/loader/init.js'].lineData[97] = 0;
  _$jscoverage['/loader/init.js'].lineData[98] = 0;
  _$jscoverage['/loader/init.js'].lineData[102] = 0;
  _$jscoverage['/loader/init.js'].lineData[103] = 0;
  _$jscoverage['/loader/init.js'].lineData[106] = 0;
  _$jscoverage['/loader/init.js'].lineData[113] = 0;
  _$jscoverage['/loader/init.js'].lineData[116] = 0;
  _$jscoverage['/loader/init.js'].lineData[122] = 0;
  _$jscoverage['/loader/init.js'].lineData[124] = 0;
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
  _$jscoverage['/loader/init.js'].branchData['64'] = [];
  _$jscoverage['/loader/init.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['66'] = [];
  _$jscoverage['/loader/init.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['73'] = [];
  _$jscoverage['/loader/init.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['96'] = [];
  _$jscoverage['/loader/init.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['113'] = [];
  _$jscoverage['/loader/init.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['122'] = [];
  _$jscoverage['/loader/init.js'].branchData['122'][1] = new BranchData();
}
_$jscoverage['/loader/init.js'].branchData['122'][1].init(3509, 31, 'doc && doc.getElementsByTagName');
function visit467_122_1(result) {
  _$jscoverage['/loader/init.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['113'][1].init(3222, 11, 'S.UA.nodejs');
function visit466_113_1(result) {
  _$jscoverage['/loader/init.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['96'][1].init(209, 6, 'i >= 0');
function visit465_96_1(result) {
  _$jscoverage['/loader/init.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['73'][1].init(1679, 21, 'baseInfo.base || base');
function visit464_73_1(result) {
  _$jscoverage['/loader/init.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['66'][1].init(70, 17, 'queryIndex !== -1');
function visit463_66_1(result) {
  _$jscoverage['/loader/init.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['64'][1].init(1304, 20, '!(\'tag\' in baseInfo)');
function visit462_64_1(result) {
  _$jscoverage['/loader/init.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['56'][1].init(21, 23, 'part.match(baseTestReg)');
function visit461_56_1(result) {
  _$jscoverage['/loader/init.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['51'][1].init(179, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit460_51_1(result) {
  _$jscoverage['/loader/init.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['45'][1].init(611, 12, 'index === -1');
function visit459_45_1(result) {
  _$jscoverage['/loader/init.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['38'][1].init(455, 36, 'baseInfo.comboSep || defaultComboSep');
function visit458_38_1(result) {
  _$jscoverage['/loader/init.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['37'][1].init(388, 42, 'baseInfo.comboPrefix || defaultComboPrefix');
function visit457_37_1(result) {
  _$jscoverage['/loader/init.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['31'][1].init(250, 8, 'baseInfo');
function visit456_31_1(result) {
  _$jscoverage['/loader/init.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['25'][1].init(118, 23, '!src.match(baseTestReg)');
function visit455_25_1(result) {
  _$jscoverage['/loader/init.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['24'][1].init(88, 16, 'script.src || \'\'');
function visit454_24_1(result) {
  _$jscoverage['/loader/init.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['6'][1].init(15, 33, 'S.Env.host && S.Env.host.document');
function visit453_6_1(result) {
  _$jscoverage['/loader/init.js'].branchData['6'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].lineData[5]++;
(function(S) {
  _$jscoverage['/loader/init.js'].functionData[0]++;
  _$jscoverage['/loader/init.js'].lineData[6]++;
  var doc = visit453_6_1(S.Env.host && S.Env.host.document);
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
    var src = visit454_24_1(script.src || '');
    _$jscoverage['/loader/init.js'].lineData[25]++;
    if (visit455_25_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/init.js'].lineData[26]++;
      return 0;
    }
    _$jscoverage['/loader/init.js'].lineData[29]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/init.js'].lineData[31]++;
    if (visit456_31_1(baseInfo)) {
      _$jscoverage['/loader/init.js'].lineData[32]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/init.js'].lineData[34]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/init.js'].lineData[37]++;
    var comboPrefix = visit457_37_1(baseInfo.comboPrefix || defaultComboPrefix);
    _$jscoverage['/loader/init.js'].lineData[38]++;
    var comboSep = visit458_38_1(baseInfo.comboSep || defaultComboSep);
    _$jscoverage['/loader/init.js'].lineData[40]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/init.js'].lineData[45]++;
    if (visit459_45_1(index === -1)) {
      _$jscoverage['/loader/init.js'].lineData[46]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/init.js'].lineData[48]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/init.js'].lineData[51]++;
      if (visit460_51_1(base.charAt(base.length - 1) !== '/')) {
        _$jscoverage['/loader/init.js'].lineData[52]++;
        base += '/';
      }
      _$jscoverage['/loader/init.js'].lineData[54]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/init.js'].lineData[55]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/init.js'].functionData[3]++;
  _$jscoverage['/loader/init.js'].lineData[56]++;
  if (visit461_56_1(part.match(baseTestReg))) {
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
    if (visit462_64_1(!('tag' in baseInfo))) {
      _$jscoverage['/loader/init.js'].lineData[65]++;
      var queryIndex = src.lastIndexOf('?t=');
      _$jscoverage['/loader/init.js'].lineData[66]++;
      if (visit463_66_1(queryIndex !== -1)) {
        _$jscoverage['/loader/init.js'].lineData[67]++;
        var query = src.substring(queryIndex + 1);
        _$jscoverage['/loader/init.js'].lineData[69]++;
        baseInfo.tag = Utils.getHash(TIMESTAMP + query);
      }
    }
    _$jscoverage['/loader/init.js'].lineData[73]++;
    baseInfo.base = visit464_73_1(baseInfo.base || base);
    _$jscoverage['/loader/init.js'].lineData[75]++;
    return baseInfo;
  }
  _$jscoverage['/loader/init.js'].lineData[89]++;
  function getBaseInfo() {
    _$jscoverage['/loader/init.js'].functionData[4]++;
    _$jscoverage['/loader/init.js'].lineData[92]++;
    var scripts = doc.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/init.js'].lineData[96]++;
    for (i = scripts.length - 1; visit465_96_1(i >= 0); i--) {
      _$jscoverage['/loader/init.js'].lineData[97]++;
      if ((info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/init.js'].lineData[98]++;
        return info;
      }
    }
    _$jscoverage['/loader/init.js'].lineData[102]++;
    S.log('must load kissy by file name in browser environment: seed.js or seed-min.js', 'error');
    _$jscoverage['/loader/init.js'].lineData[103]++;
    return null;
  }
  _$jscoverage['/loader/init.js'].lineData[106]++;
  S.config({
  comboPrefix: defaultComboPrefix, 
  comboSep: defaultComboSep, 
  charset: 'utf-8', 
  lang: 'zh-cn'});
  _$jscoverage['/loader/init.js'].lineData[113]++;
  if (visit466_113_1(S.UA.nodejs)) {
    _$jscoverage['/loader/init.js'].lineData[116]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/init.js'].lineData[122]++;
    if (visit467_122_1(doc && doc.getElementsByTagName)) {
      _$jscoverage['/loader/init.js'].lineData[124]++;
      S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40}, getBaseInfo()));
    }
  }
})(KISSY);
