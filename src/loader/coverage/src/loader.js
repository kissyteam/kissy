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
  _$jscoverage['/loader.js'].lineData[12] = 0;
  _$jscoverage['/loader.js'].lineData[13] = 0;
  _$jscoverage['/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader.js'].lineData[17] = 0;
  _$jscoverage['/loader.js'].lineData[21] = 0;
  _$jscoverage['/loader.js'].lineData[44] = 0;
  _$jscoverage['/loader.js'].lineData[60] = 0;
  _$jscoverage['/loader.js'].lineData[65] = 0;
  _$jscoverage['/loader.js'].lineData[67] = 0;
  _$jscoverage['/loader.js'].lineData[69] = 0;
  _$jscoverage['/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader.js'].lineData[73] = 0;
  _$jscoverage['/loader.js'].lineData[75] = 0;
  _$jscoverage['/loader.js'].lineData[77] = 0;
  _$jscoverage['/loader.js'].lineData[79] = 0;
  _$jscoverage['/loader.js'].lineData[80] = 0;
  _$jscoverage['/loader.js'].lineData[81] = 0;
  _$jscoverage['/loader.js'].lineData[84] = 0;
  _$jscoverage['/loader.js'].lineData[85] = 0;
  _$jscoverage['/loader.js'].lineData[88] = 0;
  _$jscoverage['/loader.js'].lineData[89] = 0;
  _$jscoverage['/loader.js'].lineData[90] = 0;
  _$jscoverage['/loader.js'].lineData[91] = 0;
  _$jscoverage['/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader.js'].lineData[93] = 0;
  _$jscoverage['/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader.js'].lineData[96] = 0;
  _$jscoverage['/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader.js'].lineData[99] = 0;
  _$jscoverage['/loader.js'].lineData[103] = 0;
  _$jscoverage['/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader.js'].lineData[127] = 0;
  _$jscoverage['/loader.js'].lineData[132] = 0;
  _$jscoverage['/loader.js'].lineData[137] = 0;
  _$jscoverage['/loader.js'].lineData[138] = 0;
  _$jscoverage['/loader.js'].lineData[151] = 0;
  _$jscoverage['/loader.js'].lineData[152] = 0;
  _$jscoverage['/loader.js'].lineData[154] = 0;
  _$jscoverage['/loader.js'].lineData[155] = 0;
  _$jscoverage['/loader.js'].lineData[156] = 0;
  _$jscoverage['/loader.js'].lineData[158] = 0;
  _$jscoverage['/loader.js'].lineData[159] = 0;
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
  _$jscoverage['/loader.js'].branchData['65'] = [];
  _$jscoverage['/loader.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['84'] = [];
  _$jscoverage['/loader.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['91'] = [];
  _$jscoverage['/loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['92'] = [];
  _$jscoverage['/loader.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['96'] = [];
  _$jscoverage['/loader.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['105'] = [];
  _$jscoverage['/loader.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['107'] = [];
  _$jscoverage['/loader.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['111'] = [];
  _$jscoverage['/loader.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['121'] = [];
  _$jscoverage['/loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['124'] = [];
  _$jscoverage['/loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['151'] = [];
  _$jscoverage['/loader.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/loader.js'].branchData['155'] = [];
  _$jscoverage['/loader.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['159'] = [];
  _$jscoverage['/loader.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['159'][2] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['159'][2].init(427, 30, 'mod.status === Status.ATTACHED');
function visit228_159_2(result) {
  _$jscoverage['/loader.js'].branchData['159'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['159'][1].init(427, 47, 'mod.status === Status.ATTACHED || insideRequire');
function visit227_159_1(result) {
  _$jscoverage['/loader.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['155'][1].init(271, 6, 'attach');
function visit226_155_1(result) {
  _$jscoverage['/loader.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['151'][2].init(72, 43, 'mods[moduleName].status === Status.ATTACHED');
function visit225_151_2(result) {
  _$jscoverage['/loader.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['151'][1].init(52, 63, 'mods[moduleName] && mods[moduleName].status === Status.ATTACHED');
function visit224_151_1(result) {
  _$jscoverage['/loader.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['124'][1].init(152, 17, 'i < unloadModsLen');
function visit223_124_1(result) {
  _$jscoverage['/loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['121'][1].init(161, 13, 'unloadModsLen');
function visit222_121_1(result) {
  _$jscoverage['/loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['111'][1].init(36, 12, 'e.stack || e');
function visit221_111_1(result) {
  _$jscoverage['/loader.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['107'][1].init(96, 7, 'success');
function visit220_107_1(result) {
  _$jscoverage['/loader.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['105'][1].init(1067, 26, 'loader.isCompleteLoading()');
function visit219_105_1(result) {
  _$jscoverage['/loader.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['96'][1].init(36, 12, 'e.stack || e');
function visit218_96_1(result) {
  _$jscoverage['/loader.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['92'][1].init(26, 5, 'error');
function visit217_92_1(result) {
  _$jscoverage['/loader.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['91'][1].init(442, 16, 'errorList.length');
function visit216_91_1(result) {
  _$jscoverage['/loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['84'][1].init(118, 9, '\'@DEBUG@\'');
function visit215_84_1(result) {
  _$jscoverage['/loader.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['65'][1].init(137, 27, 'typeof success === \'object\'');
function visit214_65_1(result) {
  _$jscoverage['/loader.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, Status = Loader.Status, Utils = Loader.Utils, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader.js'].lineData[12]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[13]++;
  var mods = Env.mods = {};
  _$jscoverage['/loader.js'].lineData[15]++;
  Utils.mix(S, {
  getModule: function(modName) {
  _$jscoverage['/loader.js'].functionData[1]++;
  _$jscoverage['/loader.js'].lineData[17]++;
  return Utils.getOrCreateModuleInfo(modName);
}, 
  getPackage: function(packageName) {
  _$jscoverage['/loader.js'].functionData[2]++;
  _$jscoverage['/loader.js'].lineData[21]++;
  return S.Config.packages[packageName];
}, 
  add: function(name, factory, cfg) {
  _$jscoverage['/loader.js'].functionData[3]++;
  _$jscoverage['/loader.js'].lineData[44]++;
  ComboLoader.add(name, factory, cfg, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader.js'].functionData[4]++;
  _$jscoverage['/loader.js'].lineData[60]++;
  var normalizedModNames, loader, error, tryCount = 0;
  _$jscoverage['/loader.js'].lineData[65]++;
  if (visit214_65_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[67]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[69]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[72]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader.js'].lineData[73]++;
  modNames = Utils.normalizeModNamesWithAlias(modNames);
  _$jscoverage['/loader.js'].lineData[75]++;
  normalizedModNames = Utils.unalias(modNames);
  _$jscoverage['/loader.js'].lineData[77]++;
  var unloadedModNames = normalizedModNames;
  _$jscoverage['/loader.js'].lineData[79]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[5]++;
    _$jscoverage['/loader.js'].lineData[80]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[81]++;
    var errorList = [], start;
    _$jscoverage['/loader.js'].lineData[84]++;
    if (visit215_84_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[85]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[88]++;
    var unloadedMods = loader.calculate(unloadedModNames, errorList);
    _$jscoverage['/loader.js'].lineData[89]++;
    var unloadModsLen = unloadedMods.length;
    _$jscoverage['/loader.js'].lineData[90]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[91]++;
    if (visit216_91_1(errorList.length)) {
      _$jscoverage['/loader.js'].lineData[92]++;
      if (visit217_92_1(error)) {
        _$jscoverage['/loader.js'].lineData[93]++;
        try {
          _$jscoverage['/loader.js'].lineData[94]++;
          error.apply(S, errorList);
        }        catch (e) {
  _$jscoverage['/loader.js'].lineData[96]++;
  S.log(visit218_96_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[98]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[6]++;
  _$jscoverage['/loader.js'].lineData[99]++;
  throw e;
}, 0);
}
      }
      _$jscoverage['/loader.js'].lineData[103]++;
      S.log(errorList, 'error');
      _$jscoverage['/loader.js'].lineData[104]++;
      S.log('loader: load above modules error', 'error');
    } else {
      _$jscoverage['/loader.js'].lineData[105]++;
      if (visit219_105_1(loader.isCompleteLoading())) {
        _$jscoverage['/loader.js'].lineData[106]++;
        Utils.attachModsRecursively(normalizedModNames);
        _$jscoverage['/loader.js'].lineData[107]++;
        if (visit220_107_1(success)) {
          _$jscoverage['/loader.js'].lineData[108]++;
          try {
            _$jscoverage['/loader.js'].lineData[109]++;
            success.apply(S, Utils.getModules(modNames));
          }          catch (e) {
  _$jscoverage['/loader.js'].lineData[111]++;
  S.log(visit221_111_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[113]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[7]++;
  _$jscoverage['/loader.js'].lineData[114]++;
  throw e;
}, 0);
}
        }
      } else {
        _$jscoverage['/loader.js'].lineData[120]++;
        loader.callback = loadReady;
        _$jscoverage['/loader.js'].lineData[121]++;
        if (visit222_121_1(unloadModsLen)) {
          _$jscoverage['/loader.js'].lineData[122]++;
          logger.debug(tryCount + ' reload ');
          _$jscoverage['/loader.js'].lineData[123]++;
          unloadedModNames = [];
          _$jscoverage['/loader.js'].lineData[124]++;
          for (var i = 0; visit223_124_1(i < unloadModsLen); i++) {
            _$jscoverage['/loader.js'].lineData[125]++;
            unloadedModNames.push(unloadedMods[i].name);
          }
          _$jscoverage['/loader.js'].lineData[127]++;
          loader.use(unloadedMods);
        }
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[132]++;
  loader = new ComboLoader(loadReady);
  _$jscoverage['/loader.js'].lineData[137]++;
  loadReady();
  _$jscoverage['/loader.js'].lineData[138]++;
  return S;
}, 
  require: function(moduleName, attach, insideRequire) {
  _$jscoverage['/loader.js'].functionData[8]++;
  _$jscoverage['/loader.js'].lineData[151]++;
  if (visit224_151_1(mods[moduleName] && visit225_151_2(mods[moduleName].status === Status.ATTACHED))) {
    _$jscoverage['/loader.js'].lineData[152]++;
    return mods[moduleName].exports;
  }
  _$jscoverage['/loader.js'].lineData[154]++;
  var moduleNames = Utils.normalizeModNames([moduleName]);
  _$jscoverage['/loader.js'].lineData[155]++;
  if (visit226_155_1(attach)) {
    _$jscoverage['/loader.js'].lineData[156]++;
    Utils.attachModsRecursively(moduleNames);
  }
  _$jscoverage['/loader.js'].lineData[158]++;
  var mod = S.getModule(moduleNames[0]);
  _$jscoverage['/loader.js'].lineData[159]++;
  return visit227_159_1(visit228_159_2(mod.status === Status.ATTACHED) || insideRequire) ? mod.exports : undefined;
}});
})(KISSY);
