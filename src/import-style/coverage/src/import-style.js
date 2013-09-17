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
  _$jscoverage['/import-style.js'].lineData[7] = 0;
  _$jscoverage['/import-style.js'].lineData[8] = 0;
  _$jscoverage['/import-style.js'].lineData[15] = 0;
  _$jscoverage['/import-style.js'].lineData[16] = 0;
  _$jscoverage['/import-style.js'].lineData[17] = 0;
  _$jscoverage['/import-style.js'].lineData[19] = 0;
  _$jscoverage['/import-style.js'].lineData[26] = 0;
  _$jscoverage['/import-style.js'].lineData[27] = 0;
  _$jscoverage['/import-style.js'].lineData[28] = 0;
  _$jscoverage['/import-style.js'].lineData[29] = 0;
  _$jscoverage['/import-style.js'].lineData[31] = 0;
  _$jscoverage['/import-style.js'].lineData[32] = 0;
  _$jscoverage['/import-style.js'].lineData[33] = 0;
  _$jscoverage['/import-style.js'].lineData[37] = 0;
  _$jscoverage['/import-style.js'].lineData[38] = 0;
  _$jscoverage['/import-style.js'].lineData[39] = 0;
  _$jscoverage['/import-style.js'].lineData[40] = 0;
  _$jscoverage['/import-style.js'].lineData[41] = 0;
  _$jscoverage['/import-style.js'].lineData[42] = 0;
  _$jscoverage['/import-style.js'].lineData[43] = 0;
  _$jscoverage['/import-style.js'].lineData[44] = 0;
  _$jscoverage['/import-style.js'].lineData[46] = 0;
  _$jscoverage['/import-style.js'].lineData[47] = 0;
  _$jscoverage['/import-style.js'].lineData[48] = 0;
  _$jscoverage['/import-style.js'].lineData[49] = 0;
  _$jscoverage['/import-style.js'].lineData[51] = 0;
  _$jscoverage['/import-style.js'].lineData[52] = 0;
  _$jscoverage['/import-style.js'].lineData[53] = 0;
  _$jscoverage['/import-style.js'].lineData[54] = 0;
  _$jscoverage['/import-style.js'].lineData[55] = 0;
  _$jscoverage['/import-style.js'].lineData[56] = 0;
  _$jscoverage['/import-style.js'].lineData[58] = 0;
  _$jscoverage['/import-style.js'].lineData[62] = 0;
  _$jscoverage['/import-style.js'].lineData[63] = 0;
  _$jscoverage['/import-style.js'].lineData[64] = 0;
  _$jscoverage['/import-style.js'].lineData[67] = 0;
  _$jscoverage['/import-style.js'].lineData[68] = 0;
  _$jscoverage['/import-style.js'].lineData[69] = 0;
  _$jscoverage['/import-style.js'].lineData[73] = 0;
  _$jscoverage['/import-style.js'].lineData[74] = 0;
  _$jscoverage['/import-style.js'].lineData[79] = 0;
  _$jscoverage['/import-style.js'].lineData[80] = 0;
  _$jscoverage['/import-style.js'].lineData[86] = 0;
  _$jscoverage['/import-style.js'].lineData[87] = 0;
  _$jscoverage['/import-style.js'].lineData[88] = 0;
  _$jscoverage['/import-style.js'].lineData[89] = 0;
  _$jscoverage['/import-style.js'].lineData[90] = 0;
  _$jscoverage['/import-style.js'].lineData[92] = 0;
  _$jscoverage['/import-style.js'].lineData[93] = 0;
  _$jscoverage['/import-style.js'].lineData[95] = 0;
  _$jscoverage['/import-style.js'].lineData[96] = 0;
  _$jscoverage['/import-style.js'].lineData[97] = 0;
  _$jscoverage['/import-style.js'].lineData[98] = 0;
  _$jscoverage['/import-style.js'].lineData[99] = 0;
  _$jscoverage['/import-style.js'].lineData[100] = 0;
  _$jscoverage['/import-style.js'].lineData[102] = 0;
  _$jscoverage['/import-style.js'].lineData[104] = 0;
  _$jscoverage['/import-style.js'].lineData[105] = 0;
  _$jscoverage['/import-style.js'].lineData[106] = 0;
  _$jscoverage['/import-style.js'].lineData[107] = 0;
  _$jscoverage['/import-style.js'].lineData[109] = 0;
  _$jscoverage['/import-style.js'].lineData[110] = 0;
  _$jscoverage['/import-style.js'].lineData[112] = 0;
  _$jscoverage['/import-style.js'].lineData[113] = 0;
  _$jscoverage['/import-style.js'].lineData[114] = 0;
  _$jscoverage['/import-style.js'].lineData[118] = 0;
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
  _$jscoverage['/import-style.js'].branchData['16'] = [];
  _$jscoverage['/import-style.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['31'] = [];
  _$jscoverage['/import-style.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['32'] = [];
  _$jscoverage['/import-style.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['41'] = [];
  _$jscoverage['/import-style.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['47'] = [];
  _$jscoverage['/import-style.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['54'] = [];
  _$jscoverage['/import-style.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['58'] = [];
  _$jscoverage['/import-style.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['59'] = [];
  _$jscoverage['/import-style.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['61'] = [];
  _$jscoverage['/import-style.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['73'] = [];
  _$jscoverage['/import-style.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['88'] = [];
  _$jscoverage['/import-style.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['92'] = [];
  _$jscoverage['/import-style.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['96'] = [];
  _$jscoverage['/import-style.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['97'] = [];
  _$jscoverage['/import-style.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['105'] = [];
  _$jscoverage['/import-style.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['112'] = [];
  _$jscoverage['/import-style.js'].branchData['112'][1] = new BranchData();
}
_$jscoverage['/import-style.js'].branchData['112'][1].init(789, 7, 'isDebug');
function visit18_112_1(result) {
  _$jscoverage['/import-style.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['105'][1].init(557, 7, 'isDebug');
function visit17_105_1(result) {
  _$jscoverage['/import-style.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['97'][1].init(18, 15, '!cssCache[name]');
function visit16_97_1(result) {
  _$jscoverage['/import-style.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['96'][1].init(282, 22, 'mod.getType() == \'css\'');
function visit15_96_1(result) {
  _$jscoverage['/import-style.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['92'][1].init(188, 15, 'processed[name]');
function visit14_92_1(result) {
  _$jscoverage['/import-style.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['88'][1].init(49, 27, 'isDebug && stackCache[name]');
function visit13_88_1(result) {
  _$jscoverage['/import-style.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['73'][1].init(2201, 18, 'combinedUrl.length');
function visit12_73_1(result) {
  _$jscoverage['/import-style.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['61'][1].init(146, 42, 'combined[0].getPackage() != currentPackage');
function visit11_61_1(result) {
  _$jscoverage['/import-style.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['59'][2].init(99, 113, 'prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength');
function visit10_59_2(result) {
  _$jscoverage['/import-style.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['59'][1].init(65, 189, '(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() != currentPackage');
function visit9_59_1(result) {
  _$jscoverage['/import-style.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['58'][2].init(31, 31, 'combinedUrl.length > maxFileNum');
function visit8_58_2(result) {
  _$jscoverage['/import-style.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['58'][1].init(31, 255, '(combinedUrl.length > maxFileNum) || (prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() != currentPackage');
function visit7_58_1(result) {
  _$jscoverage['/import-style.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['54'][1].init(761, 21, 'combined.length === 1');
function visit6_54_1(result) {
  _$jscoverage['/import-style.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['47'][1].init(329, 67, '!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath)');
function visit5_47_1(result) {
  _$jscoverage['/import-style.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['41'][1].init(401, 18, 'i < cssList.length');
function visit4_41_1(result) {
  _$jscoverage['/import-style.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['32'][1].init(18, 14, 'Config.combine');
function visit3_32_1(result) {
  _$jscoverage['/import-style.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['31'][1].init(565, 14, 'cssList.length');
function visit2_31_1(result) {
  _$jscoverage['/import-style.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['16'][1].init(14, 27, 'typeof modNames == \'string\'');
function visit1_16_1(result) {
  _$jscoverage['/import-style.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/import-style.js'].functionData[0]++;
  _$jscoverage['/import-style.js'].lineData[8]++;
  var isDebug;
  _$jscoverage['/import-style.js'].lineData[15]++;
  function importStyle(modNames) {
    _$jscoverage['/import-style.js'].functionData[1]++;
    _$jscoverage['/import-style.js'].lineData[16]++;
    if (visit1_16_1(typeof modNames == 'string')) {
      _$jscoverage['/import-style.js'].lineData[17]++;
      modNames = modNames.split(',');
    }
    _$jscoverage['/import-style.js'].lineData[19]++;
    var cssList = [], doc = S.Env.host.document, Config = S.Config, cssCache = {}, stack = [], stackCache = {}, processed = {};
    _$jscoverage['/import-style.js'].lineData[26]++;
    isDebug = Config.debug;
    _$jscoverage['/import-style.js'].lineData[27]++;
    S.each(modNames, function(modName) {
  _$jscoverage['/import-style.js'].functionData[2]++;
  _$jscoverage['/import-style.js'].lineData[28]++;
  var mod = S.Loader.Utils.createModuleInfo(S, modName);
  _$jscoverage['/import-style.js'].lineData[29]++;
  collectCss(mod, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[31]++;
    if (visit2_31_1(cssList.length)) {
      _$jscoverage['/import-style.js'].lineData[32]++;
      if (visit3_32_1(Config.combine)) {
        _$jscoverage['/import-style.js'].lineData[33]++;
        var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
        _$jscoverage['/import-style.js'].lineData[37]++;
        var prefix = '';
        _$jscoverage['/import-style.js'].lineData[38]++;
        var suffix = '';
        _$jscoverage['/import-style.js'].lineData[39]++;
        var combined = [];
        _$jscoverage['/import-style.js'].lineData[40]++;
        var combinedUrl = [];
        _$jscoverage['/import-style.js'].lineData[41]++;
        for (var i = 0; visit4_41_1(i < cssList.length); i++) {
          _$jscoverage['/import-style.js'].lineData[42]++;
          var currentCss = cssList[i];
          _$jscoverage['/import-style.js'].lineData[43]++;
          var currentPackage = currentCss.getPackage();
          _$jscoverage['/import-style.js'].lineData[44]++;
          var packagePath = currentPackage.getPrefixUriForCombo();
          _$jscoverage['/import-style.js'].lineData[46]++;
          var fullpath = currentCss.getFullPath();
          _$jscoverage['/import-style.js'].lineData[47]++;
          if (visit5_47_1(!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath))) {
            _$jscoverage['/import-style.js'].lineData[48]++;
            document.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
            _$jscoverage['/import-style.js'].lineData[49]++;
            continue;
          }
          _$jscoverage['/import-style.js'].lineData[51]++;
          var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
          _$jscoverage['/import-style.js'].lineData[52]++;
          combined.push(currentCss);
          _$jscoverage['/import-style.js'].lineData[53]++;
          combinedUrl.push(path);
          _$jscoverage['/import-style.js'].lineData[54]++;
          if (visit6_54_1(combined.length === 1)) {
            _$jscoverage['/import-style.js'].lineData[55]++;
            prefix = packagePath + comboPrefix;
            _$jscoverage['/import-style.js'].lineData[56]++;
            suffix = '?t=' + encodeURIComponent(currentPackage.getTag()) + '.css';
          } else {
            _$jscoverage['/import-style.js'].lineData[58]++;
            if (visit7_58_1((visit8_58_2(combinedUrl.length > maxFileNum)) || visit9_59_1((visit10_59_2(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength)) || visit11_61_1(combined[0].getPackage() != currentPackage)))) {
              _$jscoverage['/import-style.js'].lineData[62]++;
              combined.pop();
              _$jscoverage['/import-style.js'].lineData[63]++;
              combinedUrl.pop();
              _$jscoverage['/import-style.js'].lineData[64]++;
              document.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
              _$jscoverage['/import-style.js'].lineData[67]++;
              combined = [];
              _$jscoverage['/import-style.js'].lineData[68]++;
              combinedUrl = [];
              _$jscoverage['/import-style.js'].lineData[69]++;
              i--;
            }
          }
        }
        _$jscoverage['/import-style.js'].lineData[73]++;
        if (visit12_73_1(combinedUrl.length)) {
          _$jscoverage['/import-style.js'].lineData[74]++;
          doc.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
        }
      } else {
        _$jscoverage['/import-style.js'].lineData[79]++;
        S.each(cssList, function(css) {
  _$jscoverage['/import-style.js'].functionData[3]++;
  _$jscoverage['/import-style.js'].lineData[80]++;
  doc.writeln('<link href="' + css.getFullPath() + '"  rel="stylesheet"/>');
});
      }
    }
  }
  _$jscoverage['/import-style.js'].lineData[86]++;
  function collectCss(mod, cssList, stack, cssCache, stackCache, processed) {
    _$jscoverage['/import-style.js'].functionData[4]++;
    _$jscoverage['/import-style.js'].lineData[87]++;
    var name = mod.getName();
    _$jscoverage['/import-style.js'].lineData[88]++;
    if (visit13_88_1(isDebug && stackCache[name])) {
      _$jscoverage['/import-style.js'].lineData[89]++;
      S.error('circular dependencies found: ' + stack);
      _$jscoverage['/import-style.js'].lineData[90]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[92]++;
    if (visit14_92_1(processed[name])) {
      _$jscoverage['/import-style.js'].lineData[93]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[95]++;
    processed[name] = 1;
    _$jscoverage['/import-style.js'].lineData[96]++;
    if (visit15_96_1(mod.getType() == 'css')) {
      _$jscoverage['/import-style.js'].lineData[97]++;
      if (visit16_97_1(!cssCache[name])) {
        _$jscoverage['/import-style.js'].lineData[98]++;
        mod.status = 4;
        _$jscoverage['/import-style.js'].lineData[99]++;
        cssList.push(mod);
        _$jscoverage['/import-style.js'].lineData[100]++;
        cssCache[name] = 1;
      }
      _$jscoverage['/import-style.js'].lineData[102]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[104]++;
    var requires = mod.getRequiredMods();
    _$jscoverage['/import-style.js'].lineData[105]++;
    if (visit17_105_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[106]++;
      stackCache[name] = 1;
      _$jscoverage['/import-style.js'].lineData[107]++;
      stack.push(name);
    }
    _$jscoverage['/import-style.js'].lineData[109]++;
    S.each(requires, function(r) {
  _$jscoverage['/import-style.js'].functionData[5]++;
  _$jscoverage['/import-style.js'].lineData[110]++;
  collectCss(r, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[112]++;
    if (visit18_112_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[113]++;
      stack.pop();
      _$jscoverage['/import-style.js'].lineData[114]++;
      delete stackCache[name];
    }
  }
  _$jscoverage['/import-style.js'].lineData[118]++;
  S.importStyle = importStyle;
})(KISSY);
