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
  _$jscoverage['/import-style.js'].lineData[10] = 0;
  _$jscoverage['/import-style.js'].lineData[11] = 0;
  _$jscoverage['/import-style.js'].lineData[12] = 0;
  _$jscoverage['/import-style.js'].lineData[13] = 0;
  _$jscoverage['/import-style.js'].lineData[18] = 0;
  _$jscoverage['/import-style.js'].lineData[19] = 0;
  _$jscoverage['/import-style.js'].lineData[27] = 0;
  _$jscoverage['/import-style.js'].lineData[28] = 0;
  _$jscoverage['/import-style.js'].lineData[30] = 0;
  _$jscoverage['/import-style.js'].lineData[31] = 0;
  _$jscoverage['/import-style.js'].lineData[33] = 0;
  _$jscoverage['/import-style.js'].lineData[40] = 0;
  _$jscoverage['/import-style.js'].lineData[41] = 0;
  _$jscoverage['/import-style.js'].lineData[42] = 0;
  _$jscoverage['/import-style.js'].lineData[43] = 0;
  _$jscoverage['/import-style.js'].lineData[45] = 0;
  _$jscoverage['/import-style.js'].lineData[46] = 0;
  _$jscoverage['/import-style.js'].lineData[47] = 0;
  _$jscoverage['/import-style.js'].lineData[51] = 0;
  _$jscoverage['/import-style.js'].lineData[52] = 0;
  _$jscoverage['/import-style.js'].lineData[53] = 0;
  _$jscoverage['/import-style.js'].lineData[54] = 0;
  _$jscoverage['/import-style.js'].lineData[55] = 0;
  _$jscoverage['/import-style.js'].lineData[56] = 0;
  _$jscoverage['/import-style.js'].lineData[57] = 0;
  _$jscoverage['/import-style.js'].lineData[58] = 0;
  _$jscoverage['/import-style.js'].lineData[60] = 0;
  _$jscoverage['/import-style.js'].lineData[61] = 0;
  _$jscoverage['/import-style.js'].lineData[62] = 0;
  _$jscoverage['/import-style.js'].lineData[63] = 0;
  _$jscoverage['/import-style.js'].lineData[65] = 0;
  _$jscoverage['/import-style.js'].lineData[66] = 0;
  _$jscoverage['/import-style.js'].lineData[67] = 0;
  _$jscoverage['/import-style.js'].lineData[68] = 0;
  _$jscoverage['/import-style.js'].lineData[69] = 0;
  _$jscoverage['/import-style.js'].lineData[70] = 0;
  _$jscoverage['/import-style.js'].lineData[71] = 0;
  _$jscoverage['/import-style.js'].lineData[74] = 0;
  _$jscoverage['/import-style.js'].lineData[78] = 0;
  _$jscoverage['/import-style.js'].lineData[79] = 0;
  _$jscoverage['/import-style.js'].lineData[80] = 0;
  _$jscoverage['/import-style.js'].lineData[83] = 0;
  _$jscoverage['/import-style.js'].lineData[84] = 0;
  _$jscoverage['/import-style.js'].lineData[85] = 0;
  _$jscoverage['/import-style.js'].lineData[89] = 0;
  _$jscoverage['/import-style.js'].lineData[90] = 0;
  _$jscoverage['/import-style.js'].lineData[95] = 0;
  _$jscoverage['/import-style.js'].lineData[96] = 0;
  _$jscoverage['/import-style.js'].lineData[102] = 0;
  _$jscoverage['/import-style.js'].lineData[103] = 0;
  _$jscoverage['/import-style.js'].lineData[104] = 0;
  _$jscoverage['/import-style.js'].lineData[105] = 0;
  _$jscoverage['/import-style.js'].lineData[106] = 0;
  _$jscoverage['/import-style.js'].lineData[108] = 0;
  _$jscoverage['/import-style.js'].lineData[109] = 0;
  _$jscoverage['/import-style.js'].lineData[111] = 0;
  _$jscoverage['/import-style.js'].lineData[112] = 0;
  _$jscoverage['/import-style.js'].lineData[113] = 0;
  _$jscoverage['/import-style.js'].lineData[114] = 0;
  _$jscoverage['/import-style.js'].lineData[115] = 0;
  _$jscoverage['/import-style.js'].lineData[116] = 0;
  _$jscoverage['/import-style.js'].lineData[118] = 0;
  _$jscoverage['/import-style.js'].lineData[120] = 0;
  _$jscoverage['/import-style.js'].lineData[121] = 0;
  _$jscoverage['/import-style.js'].lineData[122] = 0;
  _$jscoverage['/import-style.js'].lineData[123] = 0;
  _$jscoverage['/import-style.js'].lineData[125] = 0;
  _$jscoverage['/import-style.js'].lineData[126] = 0;
  _$jscoverage['/import-style.js'].lineData[128] = 0;
  _$jscoverage['/import-style.js'].lineData[129] = 0;
  _$jscoverage['/import-style.js'].lineData[130] = 0;
  _$jscoverage['/import-style.js'].lineData[134] = 0;
}
if (! _$jscoverage['/import-style.js'].functionData) {
  _$jscoverage['/import-style.js'].functionData = [];
  _$jscoverage['/import-style.js'].functionData[0] = 0;
  _$jscoverage['/import-style.js'].functionData[1] = 0;
  _$jscoverage['/import-style.js'].functionData[2] = 0;
  _$jscoverage['/import-style.js'].functionData[3] = 0;
  _$jscoverage['/import-style.js'].functionData[4] = 0;
  _$jscoverage['/import-style.js'].functionData[5] = 0;
  _$jscoverage['/import-style.js'].functionData[6] = 0;
  _$jscoverage['/import-style.js'].functionData[7] = 0;
}
if (! _$jscoverage['/import-style.js'].branchData) {
  _$jscoverage['/import-style.js'].branchData = {};
  _$jscoverage['/import-style.js'].branchData['11'] = [];
  _$jscoverage['/import-style.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['12'] = [];
  _$jscoverage['/import-style.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['19'] = [];
  _$jscoverage['/import-style.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['45'] = [];
  _$jscoverage['/import-style.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['46'] = [];
  _$jscoverage['/import-style.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['55'] = [];
  _$jscoverage['/import-style.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['61'] = [];
  _$jscoverage['/import-style.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['68'] = [];
  _$jscoverage['/import-style.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['70'] = [];
  _$jscoverage['/import-style.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['74'] = [];
  _$jscoverage['/import-style.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['75'] = [];
  _$jscoverage['/import-style.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['77'] = [];
  _$jscoverage['/import-style.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['89'] = [];
  _$jscoverage['/import-style.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['104'] = [];
  _$jscoverage['/import-style.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['108'] = [];
  _$jscoverage['/import-style.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['112'] = [];
  _$jscoverage['/import-style.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['113'] = [];
  _$jscoverage['/import-style.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['121'] = [];
  _$jscoverage['/import-style.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/import-style.js'].branchData['128'] = [];
  _$jscoverage['/import-style.js'].branchData['128'][1] = new BranchData();
}
_$jscoverage['/import-style.js'].branchData['128'][1].init(783, 7, 'isDebug');
function visit21_128_1(result) {
  _$jscoverage['/import-style.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['121'][1].init(553, 7, 'isDebug');
function visit20_121_1(result) {
  _$jscoverage['/import-style.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['113'][1].init(18, 15, '!cssCache[name]');
function visit19_113_1(result) {
  _$jscoverage['/import-style.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['112'][1].init(277, 23, 'mod.getType() === \'css\'');
function visit18_112_1(result) {
  _$jscoverage['/import-style.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['108'][1].init(183, 15, 'processed[name]');
function visit17_108_1(result) {
  _$jscoverage['/import-style.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['104'][1].init(44, 27, 'isDebug && stackCache[name]');
function visit16_104_1(result) {
  _$jscoverage['/import-style.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['89'][1].init(2260, 18, 'combinedUrl.length');
function visit15_89_1(result) {
  _$jscoverage['/import-style.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['77'][1].init(146, 43, 'combined[0].getPackage() !== currentPackage');
function visit14_77_1(result) {
  _$jscoverage['/import-style.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['75'][2].init(99, 113, 'prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength');
function visit13_75_2(result) {
  _$jscoverage['/import-style.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['75'][1].init(65, 190, '(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() !== currentPackage');
function visit12_75_1(result) {
  _$jscoverage['/import-style.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['74'][2].init(31, 31, 'combinedUrl.length > maxFileNum');
function visit11_74_2(result) {
  _$jscoverage['/import-style.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['74'][1].init(31, 256, '(combinedUrl.length > maxFileNum) || (prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) || combined[0].getPackage() !== currentPackage');
function visit10_74_1(result) {
  _$jscoverage['/import-style.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['70'][1].init(91, 23, 'currentPackage.getTag()');
function visit9_70_1(result) {
  _$jscoverage['/import-style.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['68'][1].init(737, 21, 'combined.length === 1');
function visit8_68_1(result) {
  _$jscoverage['/import-style.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['61'][1].init(312, 65, '!currentPackage.isCombine() || !startsWith(fullpath, packagePath)');
function visit7_61_1(result) {
  _$jscoverage['/import-style.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['55'][1].init(401, 18, 'i < cssList.length');
function visit6_55_1(result) {
  _$jscoverage['/import-style.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['46'][1].init(18, 14, 'Config.combine');
function visit5_46_1(result) {
  _$jscoverage['/import-style.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['45'][1].init(623, 14, 'cssList.length');
function visit4_45_1(result) {
  _$jscoverage['/import-style.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['19'][1].init(17, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit3_19_1(result) {
  _$jscoverage['/import-style.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['12'][1].init(18, 28, 'fn(arr[i], i, arr) === false');
function visit2_12_1(result) {
  _$jscoverage['/import-style.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].branchData['11'][1].init(26, 14, 'i < arr.length');
function visit1_11_1(result) {
  _$jscoverage['/import-style.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/import-style.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/import-style.js'].functionData[0]++;
  _$jscoverage['/import-style.js'].lineData[8]++;
  var isDebug;
  _$jscoverage['/import-style.js'].lineData[10]++;
  function each(arr, fn) {
    _$jscoverage['/import-style.js'].functionData[1]++;
    _$jscoverage['/import-style.js'].lineData[11]++;
    for (var i = 0; visit1_11_1(i < arr.length); i++) {
      _$jscoverage['/import-style.js'].lineData[12]++;
      if (visit2_12_1(fn(arr[i], i, arr) === false)) {
        _$jscoverage['/import-style.js'].lineData[13]++;
        return;
      }
    }
  }
  _$jscoverage['/import-style.js'].lineData[18]++;
  function startsWith(str, prefix) {
    _$jscoverage['/import-style.js'].functionData[2]++;
    _$jscoverage['/import-style.js'].lineData[19]++;
    return visit3_19_1(str.lastIndexOf(prefix, 0) === 0);
  }
  _$jscoverage['/import-style.js'].lineData[27]++;
  function importStyle(modNames) {
    _$jscoverage['/import-style.js'].functionData[3]++;
    _$jscoverage['/import-style.js'].lineData[28]++;
    var Utils = S.Loader.Utils;
    _$jscoverage['/import-style.js'].lineData[30]++;
    modNames = Utils.getModNamesAsArray(modNames);
    _$jscoverage['/import-style.js'].lineData[31]++;
    modNames = Utils.normalizeModNames(S, modNames);
    _$jscoverage['/import-style.js'].lineData[33]++;
    var cssList = [], doc = S.Env.host.document, Config = S.Config, cssCache = {}, stack = [], stackCache = {}, processed = {};
    _$jscoverage['/import-style.js'].lineData[40]++;
    isDebug = Config.debug;
    _$jscoverage['/import-style.js'].lineData[41]++;
    each(modNames, function(modName) {
  _$jscoverage['/import-style.js'].functionData[4]++;
  _$jscoverage['/import-style.js'].lineData[42]++;
  var mod = S.Loader.Utils.getOrCreateModuleInfo(S, modName);
  _$jscoverage['/import-style.js'].lineData[43]++;
  collectCss(mod, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[45]++;
    if (visit4_45_1(cssList.length)) {
      _$jscoverage['/import-style.js'].lineData[46]++;
      if (visit5_46_1(Config.combine)) {
        _$jscoverage['/import-style.js'].lineData[47]++;
        var comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
        _$jscoverage['/import-style.js'].lineData[51]++;
        var prefix = '';
        _$jscoverage['/import-style.js'].lineData[52]++;
        var suffix = '';
        _$jscoverage['/import-style.js'].lineData[53]++;
        var combined = [];
        _$jscoverage['/import-style.js'].lineData[54]++;
        var combinedUrl = [];
        _$jscoverage['/import-style.js'].lineData[55]++;
        for (var i = 0; visit6_55_1(i < cssList.length); i++) {
          _$jscoverage['/import-style.js'].lineData[56]++;
          var currentCss = cssList[i];
          _$jscoverage['/import-style.js'].lineData[57]++;
          var currentPackage = currentCss.getPackage();
          _$jscoverage['/import-style.js'].lineData[58]++;
          var packagePath = currentPackage.getBase();
          _$jscoverage['/import-style.js'].lineData[60]++;
          var fullpath = currentCss.getPath();
          _$jscoverage['/import-style.js'].lineData[61]++;
          if (visit7_61_1(!currentPackage.isCombine() || !startsWith(fullpath, packagePath))) {
            _$jscoverage['/import-style.js'].lineData[62]++;
            doc.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
            _$jscoverage['/import-style.js'].lineData[63]++;
            continue;
          }
          _$jscoverage['/import-style.js'].lineData[65]++;
          var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
          _$jscoverage['/import-style.js'].lineData[66]++;
          combined.push(currentCss);
          _$jscoverage['/import-style.js'].lineData[67]++;
          combinedUrl.push(path);
          _$jscoverage['/import-style.js'].lineData[68]++;
          if (visit8_68_1(combined.length === 1)) {
            _$jscoverage['/import-style.js'].lineData[69]++;
            prefix = packagePath + comboPrefix;
            _$jscoverage['/import-style.js'].lineData[70]++;
            if (visit9_70_1(currentPackage.getTag())) {
              _$jscoverage['/import-style.js'].lineData[71]++;
              suffix = '?t=' + encodeURIComponent(currentPackage.getTag()) + '.css';
            }
          } else {
            _$jscoverage['/import-style.js'].lineData[74]++;
            if (visit10_74_1((visit11_74_2(combinedUrl.length > maxFileNum)) || visit12_75_1((visit13_75_2(prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength)) || visit14_77_1(combined[0].getPackage() !== currentPackage)))) {
              _$jscoverage['/import-style.js'].lineData[78]++;
              combined.pop();
              _$jscoverage['/import-style.js'].lineData[79]++;
              combinedUrl.pop();
              _$jscoverage['/import-style.js'].lineData[80]++;
              doc.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
              _$jscoverage['/import-style.js'].lineData[83]++;
              combined = [];
              _$jscoverage['/import-style.js'].lineData[84]++;
              combinedUrl = [];
              _$jscoverage['/import-style.js'].lineData[85]++;
              i--;
            }
          }
        }
        _$jscoverage['/import-style.js'].lineData[89]++;
        if (visit15_89_1(combinedUrl.length)) {
          _$jscoverage['/import-style.js'].lineData[90]++;
          doc.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
        }
      } else {
        _$jscoverage['/import-style.js'].lineData[95]++;
        each(cssList, function(css) {
  _$jscoverage['/import-style.js'].functionData[5]++;
  _$jscoverage['/import-style.js'].lineData[96]++;
  doc.writeln('<link href="' + css.Path() + '"  rel="stylesheet"/>');
});
      }
    }
  }
  _$jscoverage['/import-style.js'].lineData[102]++;
  function collectCss(mod, cssList, stack, cssCache, stackCache, processed) {
    _$jscoverage['/import-style.js'].functionData[6]++;
    _$jscoverage['/import-style.js'].lineData[103]++;
    var name = mod.name;
    _$jscoverage['/import-style.js'].lineData[104]++;
    if (visit16_104_1(isDebug && stackCache[name])) {
      _$jscoverage['/import-style.js'].lineData[105]++;
      S.error('circular dependencies found: ' + stack);
      _$jscoverage['/import-style.js'].lineData[106]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[108]++;
    if (visit17_108_1(processed[name])) {
      _$jscoverage['/import-style.js'].lineData[109]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[111]++;
    processed[name] = 1;
    _$jscoverage['/import-style.js'].lineData[112]++;
    if (visit18_112_1(mod.getType() === 'css')) {
      _$jscoverage['/import-style.js'].lineData[113]++;
      if (visit19_113_1(!cssCache[name])) {
        _$jscoverage['/import-style.js'].lineData[114]++;
        mod.status = 4;
        _$jscoverage['/import-style.js'].lineData[115]++;
        cssList.push(mod);
        _$jscoverage['/import-style.js'].lineData[116]++;
        cssCache[name] = 1;
      }
      _$jscoverage['/import-style.js'].lineData[118]++;
      return;
    }
    _$jscoverage['/import-style.js'].lineData[120]++;
    var requires = mod.getRequiredMods();
    _$jscoverage['/import-style.js'].lineData[121]++;
    if (visit20_121_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[122]++;
      stackCache[name] = 1;
      _$jscoverage['/import-style.js'].lineData[123]++;
      stack.push(name);
    }
    _$jscoverage['/import-style.js'].lineData[125]++;
    each(requires, function(r) {
  _$jscoverage['/import-style.js'].functionData[7]++;
  _$jscoverage['/import-style.js'].lineData[126]++;
  collectCss(r, cssList, stack, cssCache, stackCache, processed);
});
    _$jscoverage['/import-style.js'].lineData[128]++;
    if (visit21_128_1(isDebug)) {
      _$jscoverage['/import-style.js'].lineData[129]++;
      stack.pop();
      _$jscoverage['/import-style.js'].lineData[130]++;
      delete stackCache[name];
    }
  }
  _$jscoverage['/import-style.js'].lineData[134]++;
  S.importStyle = importStyle;
})(KISSY);
