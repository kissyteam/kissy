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
  _$jscoverage['/loader.js'].lineData[13] = 0;
  _$jscoverage['/loader.js'].lineData[16] = 0;
  _$jscoverage['/loader.js'].lineData[21] = 0;
  _$jscoverage['/loader.js'].lineData[44] = 0;
  _$jscoverage['/loader.js'].lineData[60] = 0;
  _$jscoverage['/loader.js'].lineData[64] = 0;
  _$jscoverage['/loader.js'].lineData[66] = 0;
  _$jscoverage['/loader.js'].lineData[68] = 0;
  _$jscoverage['/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader.js'].lineData[73] = 0;
  _$jscoverage['/loader.js'].lineData[75] = 0;
  _$jscoverage['/loader.js'].lineData[76] = 0;
  _$jscoverage['/loader.js'].lineData[79] = 0;
  _$jscoverage['/loader.js'].lineData[81] = 0;
  _$jscoverage['/loader.js'].lineData[82] = 0;
  _$jscoverage['/loader.js'].lineData[83] = 0;
  _$jscoverage['/loader.js'].lineData[86] = 0;
  _$jscoverage['/loader.js'].lineData[87] = 0;
  _$jscoverage['/loader.js'].lineData[90] = 0;
  _$jscoverage['/loader.js'].lineData[91] = 0;
  _$jscoverage['/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader.js'].lineData[93] = 0;
  _$jscoverage['/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader.js'].lineData[95] = 0;
  _$jscoverage['/loader.js'].lineData[96] = 0;
  _$jscoverage['/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader.js'].lineData[146] = 0;
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
  _$jscoverage['/loader.js'].functionData[9] = 0;
}
if (! _$jscoverage['/loader.js'].branchData) {
  _$jscoverage['/loader.js'].branchData = {};
  _$jscoverage['/loader.js'].branchData['64'] = [];
  _$jscoverage['/loader.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['86'] = [];
  _$jscoverage['/loader.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['93'] = [];
  _$jscoverage['/loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['94'] = [];
  _$jscoverage['/loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['98'] = [];
  _$jscoverage['/loader.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['107'] = [];
  _$jscoverage['/loader.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['109'] = [];
  _$jscoverage['/loader.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['113'] = [];
  _$jscoverage['/loader.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['123'] = [];
  _$jscoverage['/loader.js'].branchData['123'][1] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['123'][1].init(158, 13, 'unloadModsLen');
function visit224_123_1(result) {
  _$jscoverage['/loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['113'][1].init(35, 12, 'e.stack || e');
function visit223_113_1(result) {
  _$jscoverage['/loader.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['109'][1].init(82, 7, 'success');
function visit222_109_1(result) {
  _$jscoverage['/loader.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['107'][1].init(1033, 26, 'loader.isCompleteLoading()');
function visit221_107_1(result) {
  _$jscoverage['/loader.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['98'][1].init(35, 12, 'e.stack || e');
function visit220_98_1(result) {
  _$jscoverage['/loader.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['94'][1].init(25, 5, 'error');
function visit219_94_1(result) {
  _$jscoverage['/loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['93'][1].init(422, 16, 'errorList.length');
function visit218_93_1(result) {
  _$jscoverage['/loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['86'][1].init(113, 9, '\'@DEBUG@\'');
function visit217_86_1(result) {
  _$jscoverage['/loader.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['64'][1].init(95, 27, 'typeof success === \'object\'');
function visit216_64_1(result) {
  _$jscoverage['/loader.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var Loader = S.Loader, Utils = Loader.Utils, createModule = Utils.createModule, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader.js'].lineData[11]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[13]++;
  Utils.mix(S, {
  getModule: function(modName) {
  _$jscoverage['/loader.js'].functionData[1]++;
  _$jscoverage['/loader.js'].lineData[16]++;
  return createModule(modName);
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
  var loader, error, tryCount = 0;
  _$jscoverage['/loader.js'].lineData[64]++;
  if (visit216_64_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[66]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[68]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[71]++;
  var mods = Utils.createModules(modNames);
  _$jscoverage['/loader.js'].lineData[73]++;
  var unloadedMods = [];
  _$jscoverage['/loader.js'].lineData[75]++;
  Utils.each(mods, function(mod) {
  _$jscoverage['/loader.js'].functionData[5]++;
  _$jscoverage['/loader.js'].lineData[76]++;
  unloadedMods.push.apply(unloadedMods, mod.getNormalizedModules());
});
  _$jscoverage['/loader.js'].lineData[79]++;
  var normalizedMods = unloadedMods;
  _$jscoverage['/loader.js'].lineData[81]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[6]++;
    _$jscoverage['/loader.js'].lineData[82]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[83]++;
    var errorList = [], start;
    _$jscoverage['/loader.js'].lineData[86]++;
    if (visit217_86_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[87]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[90]++;
    unloadedMods = loader.calculate(unloadedMods, errorList);
    _$jscoverage['/loader.js'].lineData[91]++;
    var unloadModsLen = unloadedMods.length;
    _$jscoverage['/loader.js'].lineData[92]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[93]++;
    if (visit218_93_1(errorList.length)) {
      _$jscoverage['/loader.js'].lineData[94]++;
      if (visit219_94_1(error)) {
        _$jscoverage['/loader.js'].lineData[95]++;
        try {
          _$jscoverage['/loader.js'].lineData[96]++;
          error.apply(S, errorList);
        }        catch (e) {
  _$jscoverage['/loader.js'].lineData[98]++;
  S.log(visit220_98_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[100]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[7]++;
  _$jscoverage['/loader.js'].lineData[101]++;
  throw e;
}, 0);
}
      }
      _$jscoverage['/loader.js'].lineData[105]++;
      S.log(errorList, 'error');
      _$jscoverage['/loader.js'].lineData[106]++;
      S.log('loader: load above modules error', 'error');
    } else {
      _$jscoverage['/loader.js'].lineData[107]++;
      if (visit221_107_1(loader.isCompleteLoading())) {
        _$jscoverage['/loader.js'].lineData[108]++;
        Utils.attachModules(normalizedMods);
        _$jscoverage['/loader.js'].lineData[109]++;
        if (visit222_109_1(success)) {
          _$jscoverage['/loader.js'].lineData[110]++;
          try {
            _$jscoverage['/loader.js'].lineData[111]++;
            success.apply(S, [S].concat(Utils.getModulesExports(mods)));
          }          catch (e) {
  _$jscoverage['/loader.js'].lineData[113]++;
  S.log(visit223_113_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[115]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[8]++;
  _$jscoverage['/loader.js'].lineData[116]++;
  throw e;
}, 0);
}
        }
      } else {
        _$jscoverage['/loader.js'].lineData[122]++;
        loader.callback = loadReady;
        _$jscoverage['/loader.js'].lineData[123]++;
        if (visit224_123_1(unloadModsLen)) {
          _$jscoverage['/loader.js'].lineData[124]++;
          logger.debug(tryCount + ' reload ');
          _$jscoverage['/loader.js'].lineData[125]++;
          loader.use(unloadedMods);
        }
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[130]++;
  loader = new ComboLoader(loadReady);
  _$jscoverage['/loader.js'].lineData[135]++;
  loadReady();
  _$jscoverage['/loader.js'].lineData[136]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader.js'].functionData[9]++;
  _$jscoverage['/loader.js'].lineData[146]++;
  return createModule(moduleName).getExports();
}});
})(KISSY);
