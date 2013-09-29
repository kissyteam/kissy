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
  _$jscoverage['/loader/init.js'].lineData[4] = 0;
  _$jscoverage['/loader/init.js'].lineData[5] = 0;
  _$jscoverage['/loader/init.js'].lineData[6] = 0;
  _$jscoverage['/loader/init.js'].lineData[8] = 0;
  _$jscoverage['/loader/init.js'].lineData[9] = 0;
  _$jscoverage['/loader/init.js'].lineData[12] = 0;
  _$jscoverage['/loader/init.js'].lineData[15] = 0;
  _$jscoverage['/loader/init.js'].lineData[18] = 0;
  _$jscoverage['/loader/init.js'].lineData[19] = 0;
  _$jscoverage['/loader/init.js'].lineData[20] = 0;
  _$jscoverage['/loader/init.js'].lineData[23] = 0;
  _$jscoverage['/loader/init.js'].lineData[25] = 0;
  _$jscoverage['/loader/init.js'].lineData[26] = 0;
  _$jscoverage['/loader/init.js'].lineData[28] = 0;
  _$jscoverage['/loader/init.js'].lineData[31] = 0;
  _$jscoverage['/loader/init.js'].lineData[32] = 0;
  _$jscoverage['/loader/init.js'].lineData[34] = 0;
  _$jscoverage['/loader/init.js'].lineData[39] = 0;
  _$jscoverage['/loader/init.js'].lineData[40] = 0;
  _$jscoverage['/loader/init.js'].lineData[42] = 0;
  _$jscoverage['/loader/init.js'].lineData[45] = 0;
  _$jscoverage['/loader/init.js'].lineData[46] = 0;
  _$jscoverage['/loader/init.js'].lineData[48] = 0;
  _$jscoverage['/loader/init.js'].lineData[49] = 0;
  _$jscoverage['/loader/init.js'].lineData[50] = 0;
  _$jscoverage['/loader/init.js'].lineData[51] = 0;
  _$jscoverage['/loader/init.js'].lineData[52] = 0;
  _$jscoverage['/loader/init.js'].lineData[54] = 0;
  _$jscoverage['/loader/init.js'].lineData[58] = 0;
  _$jscoverage['/loader/init.js'].lineData[74] = 0;
  _$jscoverage['/loader/init.js'].lineData[77] = 0;
  _$jscoverage['/loader/init.js'].lineData[81] = 0;
  _$jscoverage['/loader/init.js'].lineData[82] = 0;
  _$jscoverage['/loader/init.js'].lineData[83] = 0;
  _$jscoverage['/loader/init.js'].lineData[87] = 0;
  _$jscoverage['/loader/init.js'].lineData[88] = 0;
  _$jscoverage['/loader/init.js'].lineData[91] = 0;
  _$jscoverage['/loader/init.js'].lineData[97] = 0;
  _$jscoverage['/loader/init.js'].lineData[100] = 0;
  _$jscoverage['/loader/init.js'].lineData[105] = 0;
  _$jscoverage['/loader/init.js'].lineData[107] = 0;
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
  _$jscoverage['/loader/init.js'].branchData['5'] = [];
  _$jscoverage['/loader/init.js'].branchData['5'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['18'] = [];
  _$jscoverage['/loader/init.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['19'] = [];
  _$jscoverage['/loader/init.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['25'] = [];
  _$jscoverage['/loader/init.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['31'] = [];
  _$jscoverage['/loader/init.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['32'] = [];
  _$jscoverage['/loader/init.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['39'] = [];
  _$jscoverage['/loader/init.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['45'] = [];
  _$jscoverage['/loader/init.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['50'] = [];
  _$jscoverage['/loader/init.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['81'] = [];
  _$jscoverage['/loader/init.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['82'] = [];
  _$jscoverage['/loader/init.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['97'] = [];
  _$jscoverage['/loader/init.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['105'] = [];
  _$jscoverage['/loader/init.js'].branchData['105'][1] = new BranchData();
}
_$jscoverage['/loader/init.js'].branchData['105'][1].init(2984, 31, 'doc && doc.getElementsByTagName');
function visit447_105_1(result) {
  _$jscoverage['/loader/init.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['97'][1].init(2722, 11, 'S.UA.nodejs');
function visit446_97_1(result) {
  _$jscoverage['/loader/init.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['82'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit445_82_1(result) {
  _$jscoverage['/loader/init.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['81'][1].init(216, 6, 'i >= 0');
function visit444_81_1(result) {
  _$jscoverage['/loader/init.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['50'][1].init(22, 23, 'part.match(baseTestReg)');
function visit443_50_1(result) {
  _$jscoverage['/loader/init.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['45'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit442_45_1(result) {
  _$jscoverage['/loader/init.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['39'][1].init(652, 11, 'index == -1');
function visit441_39_1(result) {
  _$jscoverage['/loader/init.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['32'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit440_32_1(result) {
  _$jscoverage['/loader/init.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['31'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit439_31_1(result) {
  _$jscoverage['/loader/init.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['25'][1].init(260, 8, 'baseInfo');
function visit438_25_1(result) {
  _$jscoverage['/loader/init.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['19'][1].init(122, 23, '!src.match(baseTestReg)');
function visit437_19_1(result) {
  _$jscoverage['/loader/init.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['18'][1].init(91, 16, 'script.src || \'\'');
function visit436_18_1(result) {
  _$jscoverage['/loader/init.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['5'][1].init(16, 33, 'S.Env.host && S.Env.host.document');
function visit435_5_1(result) {
  _$jscoverage['/loader/init.js'].branchData['5'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].lineData[4]++;
(function(S) {
  _$jscoverage['/loader/init.js'].functionData[0]++;
  _$jscoverage['/loader/init.js'].lineData[5]++;
  var doc = visit435_5_1(S.Env.host && S.Env.host.document);
  _$jscoverage['/loader/init.js'].lineData[6]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader/init.js'].lineData[8]++;
  function returnJson(s) {
    _$jscoverage['/loader/init.js'].functionData[1]++;
    _$jscoverage['/loader/init.js'].lineData[9]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/init.js'].lineData[12]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/init.js'].lineData[15]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/init.js'].functionData[2]++;
    _$jscoverage['/loader/init.js'].lineData[18]++;
    var src = visit436_18_1(script.src || '');
    _$jscoverage['/loader/init.js'].lineData[19]++;
    if (visit437_19_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/init.js'].lineData[20]++;
      return 0;
    }
    _$jscoverage['/loader/init.js'].lineData[23]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/init.js'].lineData[25]++;
    if (visit438_25_1(baseInfo)) {
      _$jscoverage['/loader/init.js'].lineData[26]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/init.js'].lineData[28]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/init.js'].lineData[31]++;
    var comboPrefix = baseInfo.comboPrefix = visit439_31_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/init.js'].lineData[32]++;
    var comboSep = baseInfo.comboSep = visit440_32_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/init.js'].lineData[34]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/init.js'].lineData[39]++;
    if (visit441_39_1(index == -1)) {
      _$jscoverage['/loader/init.js'].lineData[40]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/init.js'].lineData[42]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/init.js'].lineData[45]++;
      if (visit442_45_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/init.js'].lineData[46]++;
        base += '/';
      }
      _$jscoverage['/loader/init.js'].lineData[48]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/init.js'].lineData[49]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/init.js'].functionData[3]++;
  _$jscoverage['/loader/init.js'].lineData[50]++;
  if (visit443_50_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/init.js'].lineData[51]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/init.js'].lineData[52]++;
    return false;
  }
  _$jscoverage['/loader/init.js'].lineData[54]++;
  return undefined;
});
    }
    _$jscoverage['/loader/init.js'].lineData[58]++;
    return S.mix({
  base: base}, baseInfo);
  }
  _$jscoverage['/loader/init.js'].lineData[74]++;
  function getBaseInfo() {
    _$jscoverage['/loader/init.js'].functionData[4]++;
    _$jscoverage['/loader/init.js'].lineData[77]++;
    var scripts = doc.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/init.js'].lineData[81]++;
    for (i = scripts.length - 1; visit444_81_1(i >= 0); i--) {
      _$jscoverage['/loader/init.js'].lineData[82]++;
      if (visit445_82_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/init.js'].lineData[83]++;
        return info;
      }
    }
    _$jscoverage['/loader/init.js'].lineData[87]++;
    logger.error('must load kissy by file name: seed.js or seed-min.js');
    _$jscoverage['/loader/init.js'].lineData[88]++;
    return null;
  }
  _$jscoverage['/loader/init.js'].lineData[91]++;
  S.config({
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: '@TIMESTAMP@'});
  _$jscoverage['/loader/init.js'].lineData[97]++;
  if (visit446_97_1(S.UA.nodejs)) {
    _$jscoverage['/loader/init.js'].lineData[100]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/init.js'].lineData[105]++;
    if (visit447_105_1(doc && doc.getElementsByTagName)) {
      _$jscoverage['/loader/init.js'].lineData[107]++;
      S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40}, getBaseInfo()));
    }
  }
})(KISSY);
