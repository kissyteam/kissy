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
  _$jscoverage['/loader/init.js'].lineData[11] = 0;
  _$jscoverage['/loader/init.js'].lineData[12] = 0;
  _$jscoverage['/loader/init.js'].lineData[15] = 0;
  _$jscoverage['/loader/init.js'].lineData[18] = 0;
  _$jscoverage['/loader/init.js'].lineData[21] = 0;
  _$jscoverage['/loader/init.js'].lineData[22] = 0;
  _$jscoverage['/loader/init.js'].lineData[23] = 0;
  _$jscoverage['/loader/init.js'].lineData[26] = 0;
  _$jscoverage['/loader/init.js'].lineData[28] = 0;
  _$jscoverage['/loader/init.js'].lineData[29] = 0;
  _$jscoverage['/loader/init.js'].lineData[31] = 0;
  _$jscoverage['/loader/init.js'].lineData[34] = 0;
  _$jscoverage['/loader/init.js'].lineData[35] = 0;
  _$jscoverage['/loader/init.js'].lineData[37] = 0;
  _$jscoverage['/loader/init.js'].lineData[42] = 0;
  _$jscoverage['/loader/init.js'].lineData[43] = 0;
  _$jscoverage['/loader/init.js'].lineData[45] = 0;
  _$jscoverage['/loader/init.js'].lineData[48] = 0;
  _$jscoverage['/loader/init.js'].lineData[49] = 0;
  _$jscoverage['/loader/init.js'].lineData[51] = 0;
  _$jscoverage['/loader/init.js'].lineData[52] = 0;
  _$jscoverage['/loader/init.js'].lineData[53] = 0;
  _$jscoverage['/loader/init.js'].lineData[54] = 0;
  _$jscoverage['/loader/init.js'].lineData[55] = 0;
  _$jscoverage['/loader/init.js'].lineData[57] = 0;
  _$jscoverage['/loader/init.js'].lineData[61] = 0;
  _$jscoverage['/loader/init.js'].lineData[79] = 0;
  _$jscoverage['/loader/init.js'].lineData[82] = 0;
  _$jscoverage['/loader/init.js'].lineData[86] = 0;
  _$jscoverage['/loader/init.js'].lineData[87] = 0;
  _$jscoverage['/loader/init.js'].lineData[88] = 0;
  _$jscoverage['/loader/init.js'].lineData[92] = 0;
  _$jscoverage['/loader/init.js'].lineData[93] = 0;
  _$jscoverage['/loader/init.js'].lineData[96] = 0;
  _$jscoverage['/loader/init.js'].lineData[102] = 0;
  _$jscoverage['/loader/init.js'].lineData[105] = 0;
  _$jscoverage['/loader/init.js'].lineData[110] = 0;
  _$jscoverage['/loader/init.js'].lineData[112] = 0;
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
  _$jscoverage['/loader/init.js'].branchData['21'] = [];
  _$jscoverage['/loader/init.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['22'] = [];
  _$jscoverage['/loader/init.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['28'] = [];
  _$jscoverage['/loader/init.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['34'] = [];
  _$jscoverage['/loader/init.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['35'] = [];
  _$jscoverage['/loader/init.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['42'] = [];
  _$jscoverage['/loader/init.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['48'] = [];
  _$jscoverage['/loader/init.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['53'] = [];
  _$jscoverage['/loader/init.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['86'] = [];
  _$jscoverage['/loader/init.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['87'] = [];
  _$jscoverage['/loader/init.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['102'] = [];
  _$jscoverage['/loader/init.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['110'] = [];
  _$jscoverage['/loader/init.js'].branchData['110'][1] = new BranchData();
}
_$jscoverage['/loader/init.js'].branchData['110'][1].init(3212, 31, 'doc && doc.getElementsByTagName');
function visit452_110_1(result) {
  _$jscoverage['/loader/init.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['102'][1].init(2950, 11, 'S.UA.nodejs');
function visit451_102_1(result) {
  _$jscoverage['/loader/init.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['87'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit450_87_1(result) {
  _$jscoverage['/loader/init.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['86'][1].init(216, 6, 'i >= 0');
function visit449_86_1(result) {
  _$jscoverage['/loader/init.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['53'][1].init(22, 23, 'part.match(baseTestReg)');
function visit448_53_1(result) {
  _$jscoverage['/loader/init.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['48'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit447_48_1(result) {
  _$jscoverage['/loader/init.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['42'][1].init(652, 11, 'index == -1');
function visit446_42_1(result) {
  _$jscoverage['/loader/init.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['35'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit445_35_1(result) {
  _$jscoverage['/loader/init.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['34'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit444_34_1(result) {
  _$jscoverage['/loader/init.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['28'][1].init(260, 8, 'baseInfo');
function visit443_28_1(result) {
  _$jscoverage['/loader/init.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['22'][1].init(122, 23, '!src.match(baseTestReg)');
function visit442_22_1(result) {
  _$jscoverage['/loader/init.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['21'][1].init(91, 16, 'script.src || \'\'');
function visit441_21_1(result) {
  _$jscoverage['/loader/init.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['6'][1].init(16, 33, 'S.Env.host && S.Env.host.document');
function visit440_6_1(result) {
  _$jscoverage['/loader/init.js'].branchData['6'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].lineData[5]++;
(function(S) {
  _$jscoverage['/loader/init.js'].functionData[0]++;
  _$jscoverage['/loader/init.js'].lineData[6]++;
  var doc = visit440_6_1(S.Env.host && S.Env.host.document);
  _$jscoverage['/loader/init.js'].lineData[8]++;
  var Utils = S.Loader.Utils;
  _$jscoverage['/loader/init.js'].lineData[9]++;
  var TIMESTAMP = '@TIMESTAMP@';
  _$jscoverage['/loader/init.js'].lineData[11]++;
  function returnJson(s) {
    _$jscoverage['/loader/init.js'].functionData[1]++;
    _$jscoverage['/loader/init.js'].lineData[12]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/init.js'].lineData[15]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/init.js'].lineData[18]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/init.js'].functionData[2]++;
    _$jscoverage['/loader/init.js'].lineData[21]++;
    var src = visit441_21_1(script.src || '');
    _$jscoverage['/loader/init.js'].lineData[22]++;
    if (visit442_22_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/init.js'].lineData[23]++;
      return 0;
    }
    _$jscoverage['/loader/init.js'].lineData[26]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/init.js'].lineData[28]++;
    if (visit443_28_1(baseInfo)) {
      _$jscoverage['/loader/init.js'].lineData[29]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/init.js'].lineData[31]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/init.js'].lineData[34]++;
    var comboPrefix = baseInfo.comboPrefix = visit444_34_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/init.js'].lineData[35]++;
    var comboSep = baseInfo.comboSep = visit445_35_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/init.js'].lineData[37]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/init.js'].lineData[42]++;
    if (visit446_42_1(index == -1)) {
      _$jscoverage['/loader/init.js'].lineData[43]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/init.js'].lineData[45]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/init.js'].lineData[48]++;
      if (visit447_48_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/init.js'].lineData[49]++;
        base += '/';
      }
      _$jscoverage['/loader/init.js'].lineData[51]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/init.js'].lineData[52]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/init.js'].functionData[3]++;
  _$jscoverage['/loader/init.js'].lineData[53]++;
  if (visit448_53_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/init.js'].lineData[54]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/init.js'].lineData[55]++;
    return false;
  }
  _$jscoverage['/loader/init.js'].lineData[57]++;
  return undefined;
});
    }
    _$jscoverage['/loader/init.js'].lineData[61]++;
    return S.mix({
  base: base, 
  tag: Utils.getHash(TIMESTAMP + src)}, baseInfo);
  }
  _$jscoverage['/loader/init.js'].lineData[79]++;
  function getBaseInfo() {
    _$jscoverage['/loader/init.js'].functionData[4]++;
    _$jscoverage['/loader/init.js'].lineData[82]++;
    var scripts = doc.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/init.js'].lineData[86]++;
    for (i = scripts.length - 1; visit449_86_1(i >= 0); i--) {
      _$jscoverage['/loader/init.js'].lineData[87]++;
      if (visit450_87_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/init.js'].lineData[88]++;
        return info;
      }
    }
    _$jscoverage['/loader/init.js'].lineData[92]++;
    S.log('must load kissy by file name in browser environment: seed.js or seed-min.js', 'error');
    _$jscoverage['/loader/init.js'].lineData[93]++;
    return null;
  }
  _$jscoverage['/loader/init.js'].lineData[96]++;
  S.config({
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: TIMESTAMP});
  _$jscoverage['/loader/init.js'].lineData[102]++;
  if (visit451_102_1(S.UA.nodejs)) {
    _$jscoverage['/loader/init.js'].lineData[105]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/init.js'].lineData[110]++;
    if (visit452_110_1(doc && doc.getElementsByTagName)) {
      _$jscoverage['/loader/init.js'].lineData[112]++;
      S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40}, getBaseInfo()));
    }
  }
})(KISSY);
