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
  _$jscoverage['/import-style.js'].lineData[18] = 0;
  _$jscoverage['/import-style.js'].lineData[19] = 0;
  _$jscoverage['/import-style.js'].lineData[21] = 0;
  _$jscoverage['/import-style.js'].lineData[28] = 0;
  _$jscoverage['/import-style.js'].lineData[29] = 0;
  _$jscoverage['/import-style.js'].lineData[30] = 0;
  _$jscoverage['/import-style.js'].lineData[31] = 0;
  _$jscoverage['/import-style.js'].lineData[33] = 0;
  _$jscoverage['/import-style.js'].lineData[34] = 0;
  _$jscoverage['/import-style.js'].lineData[35] = 0;
  _$jscoverage['/import-style.js'].lineData[39] = 0;
  _$jscoverage['/import-style.js'].lineData[40] = 0;
  _$jscoverage['/import-style.js'].lineData[41] = 0;
  _$jscoverage['/import-style.js'].lineData[42] = 0;
  _$jscoverage['/import-style.js'].lineData[43] = 0;
  _$jscoverage['/import-style.js'].lineData[44] = 0;
  _$jscoverage['/import-style.js'].lineData[45] = 0;
  _$jscoverage['/import-style.js'].lineData[46] = 0;
  _$jscoverage['/import-style.js'].lineData[48] = 0;
  _$jscoverage['/import-style.js'].lineData[49] = 0;
  _$jscoverage['/import-style.js'].lineData[50] = 0;
  _$jscoverage['/import-style.js'].lineData[51] = 0;
  _$jscoverage['/import-style.js'].lineData[53] = 0;
  _$jscoverage['/import-style.js'].lineData[54] = 0;
  _$jscoverage['/import-style.js'].lineData[55] = 0;
  _$jscoverage['/import-style.js'].lineData[56] = 0;
  _$jscoverage['/import-style.js'].lineData[57] = 0;
  _$jscoverage['/import-style.js'].lineData[58] = 0;
  _$jscoverage['/import-style.js'].lineData[60] = 0;
  _$jscoverage['/import-style.js'].lineData[64] = 0;
  _$jscoverage['/import-style.js'].lineData[65] = 0;
  _$jscoverage['/import-style.js'].lineData[66] = 0;
  _$jscoverage['/import-style.js'].lineData[69] = 0;
  _$jscoverage['/import-style.js'].lineData[70] = 0;
  _$jscoverage['/import-style.js'].lineData[71] = 0;
  _$jscoverage['/import-style.js'].lineData[75] = 0;
  _$jscoverage['/import-style.js'].lineData[76] = 0;
  _$jscoverage['/import-style.js'].lineData[81] = 0;
  _$jscoverage['/import-style.js'].lineData[82] = 0;
  _$jscoverage['/import-style.js'].lineData[88] = 0;
  _$jscoverage['/import-style.js'].lineData[89] = 0;
  _$jscoverage['/import-style.js'].lineData[90] = 0;
  _$jscoverage['/import-style.js'].lineData[91] = 0;
  _$jscoverage['/import-style.js'].lineData[92] = 0;
  _$jscoverage['/import-style.js'].lineData[94] = 0;
  _$jscoverage['/import-style.js'].lineData[95] = 0;
  _$jscoverage['/import-style.js'].lineData[97] = 0;
  _$jscoverage['/import-style.js'].lineData[98] = 0;
  _$jscoverage['/import-style.js'].lineData[99] = 0;
  _$jscoverage['/import-style.js'].lineData[100] = 0;
  _$jscoverage['/import-style.js'].lineData[101] = 0;
  _$jscoverage['/import-style.js'].lineData[102] = 0;
  _$jscoverage['/import-style.js'].lineData[104] = 0;
  _$jscoverage['/import-style.js'].lineData[106] = 0;
  _$jscoverage['/import-style.js'].lineData[107] = 0;
  _$jscoverage['/import-style.js'].lineData[108] = 0;
  _$jscoverage['/import-style.js'].lineData[109] = 0;
  _$jscoverage['/import-style.js'].lineData[111] = 0;
  _$jscoverage['/import-style.js'].lineData[112] = 0;
  _$jscoverage['/import-style.js'].lineData[114] = 0;
  _$jscoverage['/import-style.js'].lineData[115] = 0;
  _$jscoverage['/import-style.js'].lineData[116] = 0;
  _$jscoverage['/import-style.js'].lineData[120] = 0;
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
  _$jscoverage['/import-style.js'].branchData['33'] = [];
  _$jscoverage['/import-style.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['34'] = [];
  _$jscoverage['/import-style.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['43'] = [];
  _$jscoverage['/import-style.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['49'] = [];
  _$jscoverage['/import-style.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['56'] = [];
  _$jscoverage['/import-style.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['60'] = [];
  _$jscoverage['/import-style.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['61'] = [];
  _$jscoverage['/import-style.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['63'] = [];
  _$jscoverage['/import-style.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['75'] = [];
  _$jscoverage['/import-style.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['90'] = [];
  _$jscoverage['/import-style.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['94'] = [];
  _$jscoverage['/import-style.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['98'] = [];
  _$jscoverage['/import-style.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['99'] = [];
  _$jscoverage['/import-style.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['107'] = [];
  _$jscoverage['/import-style.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['114'] = [];
  _$jscoverage['/import-style.js'].branchData['114'][1] = new BranchData();
}
_$jscoverage['/import-style.js'].branchData['114'][1].init(764, 7, 'isDebug');
function visit17_114_1(result) {
  _$jscoverage['/import-style.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['107'][1].init(539, 7, 'isDebug');
function visit16_107_1(result) {
  _$jscoverage['/import-style.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['99'][1].init(17, 15, '!cssCache[name]');
function visit15_99_1(result) {
  _$jscoverage['/import-style.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['98'][1].init(272, 23, 'mod.getType() === \'css\'');
function visit14_98_1(result) {
  _$jscoverage['/import-style.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['94'][1].init(182, 15, 'processed[name]');
function visit13_94_1(result) {
  _$jscoverage['/import-style.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['90'][1].init(47, 27, 'isDebug && stackCache[name]');
function visit12_90_1(result) {
  _$jscoverage['/import-style.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['75'][1].init(2151, 18, 'combinedUrl.length');
function visit11_75_1(result) {
  _$jscoverage['/import-style.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['63'][1].init(144, 43, 'combined[0].getPackage() !== currentPackage');
function visit10_63_1(result) {
  _$jscoverage['/import-style.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['61'][2].init(97, 112, 'prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength');
function visit9_61_2(result) {
  _$jscoverage['/import-style.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['61'][1].init(64, 188, '(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() !== currentPackage');
function visit8_61_1(result) {
  _$jscoverage['/import-style.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['60'][2].init(30, 31, 'combinedUrl.length > maxFileNum');
function visit7_60_2(result) {
  _$jscoverage['/import-style.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['60'][1].init(30, 253, '(combinedUrl.length > maxFileNum) || (prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() !== currentPackage');
function visit6_60_1(result) {
  _$jscoverage['/import-style.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['56'][1].init(743, 21, 'combined.length === 1');
function visit5_56_1(result) {
  _$jscoverage['/import-style.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['49'][1].init(323, 67, '!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath)');
function visit4_49_1(result) {
  _$jscoverage['/import-style.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['43'][1].init(392, 18, 'i < cssList.length');
function visit3_43_1(result) {
  _$jscoverage['/import-style.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['34'][1].init(17, 14, 'Config.combine');
function visit2_34_1(result) {
  _$jscoverage['/import-style.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['33'][1].init(602, 14, 'cssList.length');
function visit1_33_1(result) {
  _$jscoverage['/import-style.js'].branchData['33'][1].ranCondition(result);
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
    var Utils = S.Loader.Utils;
    _$jscoverage['/import-style.js'].lineData[18]++;
    modNames = Utils.getModNamesAsArray(modNames);
    _$jscoverage['/import-style.js'].lineData[19]++;
    modNames = Utils.normalizeModNames(S, modNames);
    _$jscoverage['/import-style.js'].lineData[21]++;
    var cssList = [], doc = S.Env.host.document, Config = S.Config, cssCache = {}, stack = [], stackCache = {}, processed = {};
    _$jscoverage['/import-style.js'].lineData[28]++;
    isDebug = Config.debug;
    _$jscoverage['/import-style.js'].lineData[29]++;
    S.each(modNames, function(modName) {
  _$jscoverage['/import-style.js'].functionData[2]++;
  _$jscoverage['/import-style.js'].lineData[30]++;
  var mod = S.Loader.Utils.createModuleInfo(S, modName);
  _$jscoverage['/import-style.js'].lineData[31]++;
  collectCss(mod, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[33]++;
    if (visit1_33_1(cssList.length)) {
      _$jscoverage['/import-style.js'].lineData[34]++;
      if (visit2_34_1(Config.combine)) {
        _$jscoverage['/import-style.js'].lineData[35]++;
        var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
        _$jscoverage['/import-style.js'].lineData[39]++;
        var prefix = '';
        _$jscoverage['/import-style.js'].lineData[40]++;
        var suffix = '';
        _$jscoverage['/import-style.js'].lineData[41]++;
        var combined = [];
        _$jscoverage['/import-style.js'].lineData[42]++;
        var combinedUrl = [];
        _$jscoverage['/import-style.js'].lineData[43]++;
        for (var i = 0; visit3_43_1(i < cssList.length); i++) {
          _$jscoverage['/import-style.js'].lineData[44]++;
          var currentCss = cssList[i];
          _$jscoverage['/import-style.js'].lineData[45]++;
          var currentPackage = currentCss.getPackage();
          _$jscoverage['/import-style.js'].lineData[46]++;
          var packagePath = currentPackage.getPrefixUriForCombo();
          _$jscoverage['/import-style.js'].lineData[48]++;
          var fullpath = currentCss.getFullPath();
          _$jscoverage['/import-style.js'].lineData[49]++;
          if (visit4_49_1(!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath))) {
            _$jscoverage['/import-style.js'].lineData[50]++;
            doc.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
            _$jscoverage['/import-style.js'].lineData[51]++;
            continue;
          }
          _$jscoverage['/import-style.js'].lineData[53]++;
          var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
          _$jscoverage['/import-style.js'].lineData[54]++;
          combined.push(currentCss);
          _$jscoverage['/import-style.js'].lineData[55]++;
          combinedUrl.push(path);
          _$jscoverage['/import-style.js'].lineData[56]++;
          if (visit5_56_1(combined.length === 1)) {
            _$jscoverage['/import-style.js'].lineData[57]++;
            prefix = packagePath + comboPrefix;
            _$jscoverage['/import-style.js'].lineData[58]++;
            suffix = '?t=' + encodeURIComponent(currentPackage.getTag()) + '.css';
          } else {
            _$jscoverage['/import-style.js'].lineData[60]++;
            if (visit6_60_1((visit7_60_2(combinedUrl.length > maxFileNum)) || visit8_61_1((visit9_61_2(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength)) || visit10_63_1(combined[0].getPackage() !== currentPackage)))) {
              _$jscoverage['/import-style.js'].lineData[64]++;
              combined.pop();
              _$jscoverage['/import-style.js'].lineData[65]++;
              combinedUrl.pop();
              _$jscoverage['/import-style.js'].lineData[66]++;
              doc.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
              _$jscoverage['/import-style.js'].lineData[69]++;
              combined = [];
              _$jscoverage['/import-style.js'].lineData[70]++;
              combinedUrl = [];
              _$jscoverage['/import-style.js'].lineData[71]++;
              i--;
            }
          }
        }
        _$jscoverage['/import-style.js'].lineData[75]++;
        if (visit11_75_1(combinedUrl.length)) {
          _$jscoverage['/import-style.js'].lineData[76]++;
          doc.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
        }
      } else {
        _$jscoverage['/import-style.js'].lineData[81]++;
        S.each(cssList, function(css) {
  _$jscoverage['/import-style.js'].functionData[3]++;
  _$jscoverage['/import-style.js'].lineData[82]++;
  doc.writeln('<link href="' + css.getFullPath() + '"  rel="stylesheet"/>');
});
      }
    }
  }
  _$jscoverage['/import-style.js'].lineData[88]++;
  function collectCss(mod, cssList, stack, cssCache, stackCache, processed) {
    _$jscoverage['/import-style.js'].functionData[4]++;
    _$jscoverage['/import-style.js'].lineData[89]++;
    var name = mod.getName();
    _$jscoverage['/import-style.js'].lineData[90]++;
    if (visit12_90_1(isDebug && stackCache[name])) {
      _$jscoverage['/import-style.js'].lineData[91]++;
      S.error('circular dependencies found: ' + stack);
      _$jscoverage['/import-style.js'].lineData[92]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[94]++;
    if (visit13_94_1(processed[name])) {
      _$jscoverage['/import-style.js'].lineData[95]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[97]++;
    processed[name] = 1;
    _$jscoverage['/import-style.js'].lineData[98]++;
    if (visit14_98_1(mod.getType() === 'css')) {
      _$jscoverage['/import-style.js'].lineData[99]++;
      if (visit15_99_1(!cssCache[name])) {
        _$jscoverage['/import-style.js'].lineData[100]++;
        mod.status = 4;
        _$jscoverage['/import-style.js'].lineData[101]++;
        cssList.push(mod);
        _$jscoverage['/import-style.js'].lineData[102]++;
        cssCache[name] = 1;
      }
      _$jscoverage['/import-style.js'].lineData[104]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[106]++;
    var requires = mod.getRequiredMods();
    _$jscoverage['/import-style.js'].lineData[107]++;
    if (visit16_107_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[108]++;
      stackCache[name] = 1;
      _$jscoverage['/import-style.js'].lineData[109]++;
      stack.push(name);
    }
    _$jscoverage['/import-style.js'].lineData[111]++;
    S.each(requires, function(r) {
  _$jscoverage['/import-style.js'].functionData[5]++;
  _$jscoverage['/import-style.js'].lineData[112]++;
  collectCss(r, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[114]++;
    if (visit17_114_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[115]++;
      stack.pop();
      _$jscoverage['/import-style.js'].lineData[116]++;
      delete stackCache[name];
    }
  }
  _$jscoverage['/import-style.js'].lineData[120]++;
  S.importStyle = importStyle;
})(KISSY);
