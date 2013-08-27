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
if (! _$jscoverage['/import-style.js']) {
  _$jscoverage['/import-style.js'] = {};
  _$jscoverage['/import-style.js'].lineData = [];
  _$jscoverage['/import-style.js'].lineData[6] = 0;
  _$jscoverage['/import-style.js'].lineData[7] = 0;
  _$jscoverage['/import-style.js'].lineData[9] = 0;
  _$jscoverage['/import-style.js'].lineData[10] = 0;
  _$jscoverage['/import-style.js'].lineData[11] = 0;
  _$jscoverage['/import-style.js'].lineData[13] = 0;
  _$jscoverage['/import-style.js'].lineData[20] = 0;
  _$jscoverage['/import-style.js'].lineData[21] = 0;
  _$jscoverage['/import-style.js'].lineData[22] = 0;
  _$jscoverage['/import-style.js'].lineData[23] = 0;
  _$jscoverage['/import-style.js'].lineData[25] = 0;
  _$jscoverage['/import-style.js'].lineData[26] = 0;
  _$jscoverage['/import-style.js'].lineData[27] = 0;
  _$jscoverage['/import-style.js'].lineData[31] = 0;
  _$jscoverage['/import-style.js'].lineData[32] = 0;
  _$jscoverage['/import-style.js'].lineData[33] = 0;
  _$jscoverage['/import-style.js'].lineData[34] = 0;
  _$jscoverage['/import-style.js'].lineData[35] = 0;
  _$jscoverage['/import-style.js'].lineData[36] = 0;
  _$jscoverage['/import-style.js'].lineData[37] = 0;
  _$jscoverage['/import-style.js'].lineData[38] = 0;
  _$jscoverage['/import-style.js'].lineData[40] = 0;
  _$jscoverage['/import-style.js'].lineData[41] = 0;
  _$jscoverage['/import-style.js'].lineData[42] = 0;
  _$jscoverage['/import-style.js'].lineData[43] = 0;
  _$jscoverage['/import-style.js'].lineData[45] = 0;
  _$jscoverage['/import-style.js'].lineData[46] = 0;
  _$jscoverage['/import-style.js'].lineData[47] = 0;
  _$jscoverage['/import-style.js'].lineData[48] = 0;
  _$jscoverage['/import-style.js'].lineData[49] = 0;
  _$jscoverage['/import-style.js'].lineData[50] = 0;
  _$jscoverage['/import-style.js'].lineData[52] = 0;
  _$jscoverage['/import-style.js'].lineData[56] = 0;
  _$jscoverage['/import-style.js'].lineData[57] = 0;
  _$jscoverage['/import-style.js'].lineData[58] = 0;
  _$jscoverage['/import-style.js'].lineData[61] = 0;
  _$jscoverage['/import-style.js'].lineData[62] = 0;
  _$jscoverage['/import-style.js'].lineData[63] = 0;
  _$jscoverage['/import-style.js'].lineData[67] = 0;
  _$jscoverage['/import-style.js'].lineData[68] = 0;
  _$jscoverage['/import-style.js'].lineData[73] = 0;
  _$jscoverage['/import-style.js'].lineData[74] = 0;
  _$jscoverage['/import-style.js'].lineData[80] = 0;
  _$jscoverage['/import-style.js'].lineData[81] = 0;
  _$jscoverage['/import-style.js'].lineData[82] = 0;
  _$jscoverage['/import-style.js'].lineData[83] = 0;
  _$jscoverage['/import-style.js'].lineData[84] = 0;
  _$jscoverage['/import-style.js'].lineData[86] = 0;
  _$jscoverage['/import-style.js'].lineData[87] = 0;
  _$jscoverage['/import-style.js'].lineData[89] = 0;
  _$jscoverage['/import-style.js'].lineData[90] = 0;
  _$jscoverage['/import-style.js'].lineData[91] = 0;
  _$jscoverage['/import-style.js'].lineData[92] = 0;
  _$jscoverage['/import-style.js'].lineData[93] = 0;
  _$jscoverage['/import-style.js'].lineData[94] = 0;
  _$jscoverage['/import-style.js'].lineData[96] = 0;
  _$jscoverage['/import-style.js'].lineData[98] = 0;
  _$jscoverage['/import-style.js'].lineData[99] = 0;
  _$jscoverage['/import-style.js'].lineData[100] = 0;
  _$jscoverage['/import-style.js'].lineData[101] = 0;
  _$jscoverage['/import-style.js'].lineData[103] = 0;
  _$jscoverage['/import-style.js'].lineData[104] = 0;
  _$jscoverage['/import-style.js'].lineData[106] = 0;
  _$jscoverage['/import-style.js'].lineData[107] = 0;
  _$jscoverage['/import-style.js'].lineData[108] = 0;
  _$jscoverage['/import-style.js'].lineData[112] = 0;
}
if (! _$jscoverage['/import-style.js'].functionData) {
  _$jscoverage['/import-style.js'].functionData = [];
  _$jscoverage['/import-style.js'].functionData[0] = 0;
  _$jscoverage['/import-style.js'].functionData[1] = 0;
  _$jscoverage['/import-style.js'].functionData[2] = 0;
  _$jscoverage['/import-style.js'].functionData[3] = 0;
  _$jscoverage['/import-style.js'].functionData[4] = 0;
  _$jscoverage['/import-style.js'].functionData[5] = 0;
}
if (! _$jscoverage['/import-style.js'].branchData) {
  _$jscoverage['/import-style.js'].branchData = {};
  _$jscoverage['/import-style.js'].branchData['10'] = [];
  _$jscoverage['/import-style.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['25'] = [];
  _$jscoverage['/import-style.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['26'] = [];
  _$jscoverage['/import-style.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['35'] = [];
  _$jscoverage['/import-style.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['41'] = [];
  _$jscoverage['/import-style.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['48'] = [];
  _$jscoverage['/import-style.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['52'] = [];
  _$jscoverage['/import-style.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['53'] = [];
  _$jscoverage['/import-style.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['55'] = [];
  _$jscoverage['/import-style.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['67'] = [];
  _$jscoverage['/import-style.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['82'] = [];
  _$jscoverage['/import-style.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['86'] = [];
  _$jscoverage['/import-style.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['90'] = [];
  _$jscoverage['/import-style.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['91'] = [];
  _$jscoverage['/import-style.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['99'] = [];
  _$jscoverage['/import-style.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['106'] = [];
  _$jscoverage['/import-style.js'].branchData['106'][1] = new BranchData();
}
_$jscoverage['/import-style.js'].branchData['106'][1].init(789, 7, 'isDebug');
function visit18_106_1(result) {
  _$jscoverage['/import-style.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['99'][1].init(557, 7, 'isDebug');
function visit17_99_1(result) {
  _$jscoverage['/import-style.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['91'][1].init(18, 15, '!cssCache[name]');
function visit16_91_1(result) {
  _$jscoverage['/import-style.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['90'][1].init(282, 22, 'mod.getType() == \'css\'');
function visit15_90_1(result) {
  _$jscoverage['/import-style.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['86'][1].init(188, 15, 'processed[name]');
function visit14_86_1(result) {
  _$jscoverage['/import-style.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['82'][1].init(49, 27, 'isDebug && stackCache[name]');
function visit13_82_1(result) {
  _$jscoverage['/import-style.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['67'][1].init(2201, 18, 'combinedUrl.length');
function visit12_67_1(result) {
  _$jscoverage['/import-style.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['55'][1].init(146, 42, 'combined[0].getPackage() != currentPackage');
function visit11_55_1(result) {
  _$jscoverage['/import-style.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['53'][2].init(99, 113, 'prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength');
function visit10_53_2(result) {
  _$jscoverage['/import-style.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['53'][1].init(65, 189, '(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() != currentPackage');
function visit9_53_1(result) {
  _$jscoverage['/import-style.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['52'][2].init(31, 31, 'combinedUrl.length > maxFileNum');
function visit8_52_2(result) {
  _$jscoverage['/import-style.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['52'][1].init(31, 255, '(combinedUrl.length > maxFileNum) || (prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() != currentPackage');
function visit7_52_1(result) {
  _$jscoverage['/import-style.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['48'][1].init(761, 21, 'combined.length === 1');
function visit6_48_1(result) {
  _$jscoverage['/import-style.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['41'][1].init(329, 67, '!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath)');
function visit5_41_1(result) {
  _$jscoverage['/import-style.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['35'][1].init(401, 18, 'i < cssList.length');
function visit4_35_1(result) {
  _$jscoverage['/import-style.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['26'][1].init(18, 14, 'Config.combine');
function visit3_26_1(result) {
  _$jscoverage['/import-style.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['25'][1].init(565, 14, 'cssList.length');
function visit2_25_1(result) {
  _$jscoverage['/import-style.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['10'][1].init(14, 27, 'typeof modNames == \'string\'');
function visit1_10_1(result) {
  _$jscoverage['/import-style.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/import-style.js'].functionData[0]++;
  _$jscoverage['/import-style.js'].lineData[7]++;
  var isDebug;
  _$jscoverage['/import-style.js'].lineData[9]++;
  function importStyle(modNames) {
    _$jscoverage['/import-style.js'].functionData[1]++;
    _$jscoverage['/import-style.js'].lineData[10]++;
    if (visit1_10_1(typeof modNames == 'string')) {
      _$jscoverage['/import-style.js'].lineData[11]++;
      modNames = modNames.split(',');
    }
    _$jscoverage['/import-style.js'].lineData[13]++;
    var cssList = [], doc = S.Env.host.document, Config = S.Config, cssCache = {}, stack = [], stackCache = {}, processed = {};
    _$jscoverage['/import-style.js'].lineData[20]++;
    isDebug = Config.debug;
    _$jscoverage['/import-style.js'].lineData[21]++;
    S.each(modNames, function(modName) {
  _$jscoverage['/import-style.js'].functionData[2]++;
  _$jscoverage['/import-style.js'].lineData[22]++;
  var mod = S.Loader.Utils.createModuleInfo(S, modName);
  _$jscoverage['/import-style.js'].lineData[23]++;
  collectCss(mod, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[25]++;
    if (visit2_25_1(cssList.length)) {
      _$jscoverage['/import-style.js'].lineData[26]++;
      if (visit3_26_1(Config.combine)) {
        _$jscoverage['/import-style.js'].lineData[27]++;
        var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
        _$jscoverage['/import-style.js'].lineData[31]++;
        var prefix = '';
        _$jscoverage['/import-style.js'].lineData[32]++;
        var suffix = '';
        _$jscoverage['/import-style.js'].lineData[33]++;
        var combined = [];
        _$jscoverage['/import-style.js'].lineData[34]++;
        var combinedUrl = [];
        _$jscoverage['/import-style.js'].lineData[35]++;
        for (var i = 0; visit4_35_1(i < cssList.length); i++) {
          _$jscoverage['/import-style.js'].lineData[36]++;
          var currentCss = cssList[i];
          _$jscoverage['/import-style.js'].lineData[37]++;
          var currentPackage = currentCss.getPackage();
          _$jscoverage['/import-style.js'].lineData[38]++;
          var packagePath = currentPackage.getPrefixUriForCombo();
          _$jscoverage['/import-style.js'].lineData[40]++;
          var fullpath = currentCss.getFullPath();
          _$jscoverage['/import-style.js'].lineData[41]++;
          if (visit5_41_1(!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath))) {
            _$jscoverage['/import-style.js'].lineData[42]++;
            document.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
            _$jscoverage['/import-style.js'].lineData[43]++;
            continue;
          }
          _$jscoverage['/import-style.js'].lineData[45]++;
          var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
          _$jscoverage['/import-style.js'].lineData[46]++;
          combined.push(currentCss);
          _$jscoverage['/import-style.js'].lineData[47]++;
          combinedUrl.push(path);
          _$jscoverage['/import-style.js'].lineData[48]++;
          if (visit6_48_1(combined.length === 1)) {
            _$jscoverage['/import-style.js'].lineData[49]++;
            prefix = packagePath + comboPrefix;
            _$jscoverage['/import-style.js'].lineData[50]++;
            suffix = '?t=' + encodeURIComponent(currentPackage.getTag()) + '.css';
          } else {
            _$jscoverage['/import-style.js'].lineData[52]++;
            if (visit7_52_1((visit8_52_2(combinedUrl.length > maxFileNum)) || visit9_53_1((visit10_53_2(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength)) || visit11_55_1(combined[0].getPackage() != currentPackage)))) {
              _$jscoverage['/import-style.js'].lineData[56]++;
              combined.pop();
              _$jscoverage['/import-style.js'].lineData[57]++;
              combinedUrl.pop();
              _$jscoverage['/import-style.js'].lineData[58]++;
              document.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
              _$jscoverage['/import-style.js'].lineData[61]++;
              combined = [];
              _$jscoverage['/import-style.js'].lineData[62]++;
              combinedUrl = [];
              _$jscoverage['/import-style.js'].lineData[63]++;
              i--;
            }
          }
        }
        _$jscoverage['/import-style.js'].lineData[67]++;
        if (visit12_67_1(combinedUrl.length)) {
          _$jscoverage['/import-style.js'].lineData[68]++;
          doc.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
        }
      } else {
        _$jscoverage['/import-style.js'].lineData[73]++;
        S.each(cssList, function(css) {
  _$jscoverage['/import-style.js'].functionData[3]++;
  _$jscoverage['/import-style.js'].lineData[74]++;
  doc.writeln('<link href="' + css.getFullPath() + '"  rel="stylesheet"/>');
});
      }
    }
  }
  _$jscoverage['/import-style.js'].lineData[80]++;
  function collectCss(mod, cssList, stack, cssCache, stackCache, processed) {
    _$jscoverage['/import-style.js'].functionData[4]++;
    _$jscoverage['/import-style.js'].lineData[81]++;
    var name = mod.getName();
    _$jscoverage['/import-style.js'].lineData[82]++;
    if (visit13_82_1(isDebug && stackCache[name])) {
      _$jscoverage['/import-style.js'].lineData[83]++;
      S.error('circular dependencies found: ' + stack);
      _$jscoverage['/import-style.js'].lineData[84]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[86]++;
    if (visit14_86_1(processed[name])) {
      _$jscoverage['/import-style.js'].lineData[87]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[89]++;
    processed[name] = 1;
    _$jscoverage['/import-style.js'].lineData[90]++;
    if (visit15_90_1(mod.getType() == 'css')) {
      _$jscoverage['/import-style.js'].lineData[91]++;
      if (visit16_91_1(!cssCache[name])) {
        _$jscoverage['/import-style.js'].lineData[92]++;
        mod.status = 4;
        _$jscoverage['/import-style.js'].lineData[93]++;
        cssList.push(mod);
        _$jscoverage['/import-style.js'].lineData[94]++;
        cssCache[name] = 1;
      }
      _$jscoverage['/import-style.js'].lineData[96]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[98]++;
    var requires = mod.getRequiredMods();
    _$jscoverage['/import-style.js'].lineData[99]++;
    if (visit17_99_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[100]++;
      stackCache[name] = 1;
      _$jscoverage['/import-style.js'].lineData[101]++;
      stack.push(name);
    }
    _$jscoverage['/import-style.js'].lineData[103]++;
    S.each(requires, function(r) {
  _$jscoverage['/import-style.js'].functionData[5]++;
  _$jscoverage['/import-style.js'].lineData[104]++;
  collectCss(r, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[106]++;
    if (visit18_106_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[107]++;
      stack.pop();
      _$jscoverage['/import-style.js'].lineData[108]++;
      delete stackCache[name];
    }
  }
  _$jscoverage['/import-style.js'].lineData[112]++;
  S.importStyle = importStyle;
})(KISSY);
