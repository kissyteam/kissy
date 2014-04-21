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
if (! _$jscoverage['/loader.js']) {
  _$jscoverage['/loader.js'] = {};
  _$jscoverage['/loader.js'].lineData = [];
  _$jscoverage['/loader.js'].lineData[6] = 0;
  _$jscoverage['/loader.js'].lineData[7] = 0;
  _$jscoverage['/loader.js'].lineData[11] = 0;
  _$jscoverage['/loader.js'].lineData[12] = 0;
  _$jscoverage['/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader.js'].lineData[16] = 0;
  _$jscoverage['/loader.js'].lineData[20] = 0;
  _$jscoverage['/loader.js'].lineData[43] = 0;
  _$jscoverage['/loader.js'].lineData[59] = 0;
  _$jscoverage['/loader.js'].lineData[64] = 0;
  _$jscoverage['/loader.js'].lineData[66] = 0;
  _$jscoverage['/loader.js'].lineData[68] = 0;
  _$jscoverage['/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader.js'].lineData[74] = 0;
  _$jscoverage['/loader.js'].lineData[76] = 0;
  _$jscoverage['/loader.js'].lineData[78] = 0;
  _$jscoverage['/loader.js'].lineData[79] = 0;
  _$jscoverage['/loader.js'].lineData[80] = 0;
  _$jscoverage['/loader.js'].lineData[83] = 0;
  _$jscoverage['/loader.js'].lineData[84] = 0;
  _$jscoverage['/loader.js'].lineData[87] = 0;
  _$jscoverage['/loader.js'].lineData[88] = 0;
  _$jscoverage['/loader.js'].lineData[89] = 0;
  _$jscoverage['/loader.js'].lineData[90] = 0;
  _$jscoverage['/loader.js'].lineData[91] = 0;
  _$jscoverage['/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader.js'].lineData[93] = 0;
  _$jscoverage['/loader.js'].lineData[95] = 0;
  _$jscoverage['/loader.js'].lineData[97] = 0;
  _$jscoverage['/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader.js'].lineData[103] = 0;
  _$jscoverage['/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader.js'].lineData[137] = 0;
  _$jscoverage['/loader.js'].lineData[148] = 0;
  _$jscoverage['/loader.js'].lineData[150] = 0;
  _$jscoverage['/loader.js'].lineData[151] = 0;
  _$jscoverage['/loader.js'].lineData[153] = 0;
  _$jscoverage['/loader.js'].lineData[154] = 0;
  _$jscoverage['/loader.js'].lineData[155] = 0;
}
if (! _$jscoverage['/loader.js'].functionData) {
  _$jscoverage['/loader.js'].functionData = [];
  _$jscoverage['/loader.js'].functionData[0] = 0;
  _$jscoverage['/loader.js'].functionData[1] = 0;
  _$jscoverage['/loader.js'].functionData[2] = 0;
  _$jscoverage['/loader.js'].functionData[3] = 0;
  _$jscoverage['/loader.js'].functionData[4] = 0;
  _$jscoverage['/loader.js'].functionData[5] = 0;
  _$jscoverage['/loader.js'].functionData[6] = 0;
  _$jscoverage['/loader.js'].functionData[7] = 0;
  _$jscoverage['/loader.js'].functionData[8] = 0;
}
if (! _$jscoverage['/loader.js'].branchData) {
  _$jscoverage['/loader.js'].branchData = {};
  _$jscoverage['/loader.js'].branchData['64'] = [];
  _$jscoverage['/loader.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['83'] = [];
  _$jscoverage['/loader.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['90'] = [];
  _$jscoverage['/loader.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['91'] = [];
  _$jscoverage['/loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['95'] = [];
  _$jscoverage['/loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['104'] = [];
  _$jscoverage['/loader.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['106'] = [];
  _$jscoverage['/loader.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['110'] = [];
  _$jscoverage['/loader.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['120'] = [];
  _$jscoverage['/loader.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['123'] = [];
  _$jscoverage['/loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['150'] = [];
  _$jscoverage['/loader.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['150'][2] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['150'][2].init(140, 50, 'mods[moduleName].status === Loader.Status.ATTACHED');
function visit213_150_2(result) {
  _$jscoverage['/loader.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['150'][1].init(120, 70, 'mods[moduleName] && mods[moduleName].status === Loader.Status.ATTACHED');
function visit212_150_1(result) {
  _$jscoverage['/loader.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['123'][1].init(152, 17, 'i < unloadModsLen');
function visit211_123_1(result) {
  _$jscoverage['/loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['120'][1].init(161, 13, 'unloadModsLen');
function visit210_120_1(result) {
  _$jscoverage['/loader.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['110'][1].init(36, 12, 'e.stack || e');
function visit209_110_1(result) {
  _$jscoverage['/loader.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['106'][1].init(96, 7, 'success');
function visit208_106_1(result) {
  _$jscoverage['/loader.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['104'][1].init(1067, 26, 'loader.isCompleteLoading()');
function visit207_104_1(result) {
  _$jscoverage['/loader.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['95'][1].init(36, 12, 'e.stack || e');
function visit206_95_1(result) {
  _$jscoverage['/loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['91'][1].init(26, 5, 'error');
function visit205_91_1(result) {
  _$jscoverage['/loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['90'][1].init(442, 16, 'errorList.length');
function visit204_90_1(result) {
  _$jscoverage['/loader.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['83'][1].init(118, 9, '\'@DEBUG@\'');
function visit203_83_1(result) {
  _$jscoverage['/loader.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['64'][1].init(137, 27, 'typeof success === \'object\'');
function visit202_64_1(result) {
  _$jscoverage['/loader.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader.js'].lineData[11]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[12]++;
  var mods = Env.mods = {};
  _$jscoverage['/loader.js'].lineData[14]++;
  Utils.mix(S, {
  getModule: function(modName) {
  _$jscoverage['/loader.js'].functionData[1]++;
  _$jscoverage['/loader.js'].lineData[16]++;
  return Utils.getOrCreateModuleInfo(modName);
}, 
  getPackage: function(packageName) {
  _$jscoverage['/loader.js'].functionData[2]++;
  _$jscoverage['/loader.js'].lineData[20]++;
  return S.Config.packages[packageName];
}, 
  add: function(name, factory, cfg) {
  _$jscoverage['/loader.js'].functionData[3]++;
  _$jscoverage['/loader.js'].lineData[43]++;
  ComboLoader.add(name, factory, cfg, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader.js'].functionData[4]++;
  _$jscoverage['/loader.js'].lineData[59]++;
  var normalizedModNames, loader, error, tryCount = 0;
  _$jscoverage['/loader.js'].lineData[64]++;
  if (visit202_64_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[66]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[68]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[71]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader.js'].lineData[72]++;
  modNames = Utils.normalizeModNamesWithAlias(modNames);
  _$jscoverage['/loader.js'].lineData[74]++;
  normalizedModNames = Utils.unalias(modNames);
  _$jscoverage['/loader.js'].lineData[76]++;
  var unloadedModNames = normalizedModNames;
  _$jscoverage['/loader.js'].lineData[78]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[5]++;
    _$jscoverage['/loader.js'].lineData[79]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[80]++;
    var errorList = [], start;
    _$jscoverage['/loader.js'].lineData[83]++;
    if (visit203_83_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[84]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[87]++;
    var unloadedMods = loader.calculate(unloadedModNames, errorList);
    _$jscoverage['/loader.js'].lineData[88]++;
    var unloadModsLen = unloadedMods.length;
    _$jscoverage['/loader.js'].lineData[89]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[90]++;
    if (visit204_90_1(errorList.length)) {
      _$jscoverage['/loader.js'].lineData[91]++;
      if (visit205_91_1(error)) {
        _$jscoverage['/loader.js'].lineData[92]++;
        try {
          _$jscoverage['/loader.js'].lineData[93]++;
          error.apply(S, errorList);
        }        catch (e) {
  _$jscoverage['/loader.js'].lineData[95]++;
  S.log(visit206_95_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[97]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[6]++;
  _$jscoverage['/loader.js'].lineData[98]++;
  throw e;
}, 0);
}
      }
      _$jscoverage['/loader.js'].lineData[102]++;
      S.log(errorList, 'error');
      _$jscoverage['/loader.js'].lineData[103]++;
      S.log('loader: load above modules error', 'error');
    } else {
      _$jscoverage['/loader.js'].lineData[104]++;
      if (visit207_104_1(loader.isCompleteLoading())) {
        _$jscoverage['/loader.js'].lineData[105]++;
        Utils.attachModsRecursively(normalizedModNames);
        _$jscoverage['/loader.js'].lineData[106]++;
        if (visit208_106_1(success)) {
          _$jscoverage['/loader.js'].lineData[107]++;
          try {
            _$jscoverage['/loader.js'].lineData[108]++;
            success.apply(S, Utils.getModules(modNames));
          }          catch (e) {
  _$jscoverage['/loader.js'].lineData[110]++;
  S.log(visit209_110_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[112]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[7]++;
  _$jscoverage['/loader.js'].lineData[113]++;
  throw e;
}, 0);
}
        }
      } else {
        _$jscoverage['/loader.js'].lineData[119]++;
        loader.callback = loadReady;
        _$jscoverage['/loader.js'].lineData[120]++;
        if (visit210_120_1(unloadModsLen)) {
          _$jscoverage['/loader.js'].lineData[121]++;
          logger.debug(tryCount + ' reload ');
          _$jscoverage['/loader.js'].lineData[122]++;
          unloadedModNames = [];
          _$jscoverage['/loader.js'].lineData[123]++;
          for (var i = 0; visit211_123_1(i < unloadModsLen); i++) {
            _$jscoverage['/loader.js'].lineData[124]++;
            unloadedModNames.push(unloadedMods[i].name);
          }
          _$jscoverage['/loader.js'].lineData[126]++;
          loader.use(unloadedMods);
        }
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[131]++;
  loader = new ComboLoader(loadReady);
  _$jscoverage['/loader.js'].lineData[136]++;
  loadReady();
  _$jscoverage['/loader.js'].lineData[137]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader.js'].functionData[8]++;
  _$jscoverage['/loader.js'].lineData[148]++;
  moduleName = Utils.normalizePath(refName, moduleName);
  _$jscoverage['/loader.js'].lineData[150]++;
  if (visit212_150_1(mods[moduleName] && visit213_150_2(mods[moduleName].status === Loader.Status.ATTACHED))) {
    _$jscoverage['/loader.js'].lineData[151]++;
    return mods[moduleName].exports;
  }
  _$jscoverage['/loader.js'].lineData[153]++;
  var moduleNames = Utils.normalizeModNames([moduleName], refName);
  _$jscoverage['/loader.js'].lineData[154]++;
  Utils.attachModsRecursively(moduleNames);
  _$jscoverage['/loader.js'].lineData[155]++;
  return Utils.getModules(moduleNames)[1];
}});
})(KISSY);
