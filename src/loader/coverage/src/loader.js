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
  _$jscoverage['/loader.js'].lineData[8] = 0;
  _$jscoverage['/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader.js'].lineData[35] = 0;
  _$jscoverage['/loader.js'].lineData[51] = 0;
  _$jscoverage['/loader.js'].lineData[56] = 0;
  _$jscoverage['/loader.js'].lineData[58] = 0;
  _$jscoverage['/loader.js'].lineData[60] = 0;
  _$jscoverage['/loader.js'].lineData[63] = 0;
  _$jscoverage['/loader.js'].lineData[64] = 0;
  _$jscoverage['/loader.js'].lineData[66] = 0;
  _$jscoverage['/loader.js'].lineData[68] = 0;
  _$jscoverage['/loader.js'].lineData[70] = 0;
  _$jscoverage['/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader.js'].lineData[75] = 0;
  _$jscoverage['/loader.js'].lineData[76] = 0;
  _$jscoverage['/loader.js'].lineData[79] = 0;
  _$jscoverage['/loader.js'].lineData[80] = 0;
  _$jscoverage['/loader.js'].lineData[81] = 0;
  _$jscoverage['/loader.js'].lineData[82] = 0;
  _$jscoverage['/loader.js'].lineData[83] = 0;
  _$jscoverage['/loader.js'].lineData[84] = 0;
  _$jscoverage['/loader.js'].lineData[85] = 0;
  _$jscoverage['/loader.js'].lineData[87] = 0;
  _$jscoverage['/loader.js'].lineData[89] = 0;
  _$jscoverage['/loader.js'].lineData[90] = 0;
  _$jscoverage['/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader.js'].lineData[95] = 0;
  _$jscoverage['/loader.js'].lineData[96] = 0;
  _$jscoverage['/loader.js'].lineData[97] = 0;
  _$jscoverage['/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader.js'].lineData[99] = 0;
  _$jscoverage['/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader.js'].lineData[118] = 0;
  _$jscoverage['/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader.js'].lineData[142] = 0;
  _$jscoverage['/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader.js'].lineData[145] = 0;
  _$jscoverage['/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader.js'].lineData[147] = 0;
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
}
if (! _$jscoverage['/loader.js'].branchData) {
  _$jscoverage['/loader.js'].branchData = {};
  _$jscoverage['/loader.js'].branchData['56'] = [];
  _$jscoverage['/loader.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['75'] = [];
  _$jscoverage['/loader.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['82'] = [];
  _$jscoverage['/loader.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['83'] = [];
  _$jscoverage['/loader.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['87'] = [];
  _$jscoverage['/loader.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['96'] = [];
  _$jscoverage['/loader.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['98'] = [];
  _$jscoverage['/loader.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['102'] = [];
  _$jscoverage['/loader.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['112'] = [];
  _$jscoverage['/loader.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['115'] = [];
  _$jscoverage['/loader.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['142'] = [];
  _$jscoverage['/loader.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['142'][2] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['142'][2].init(137, 50, 'mods[moduleName].status === Loader.Status.ATTACHED');
function visit222_142_2(result) {
  _$jscoverage['/loader.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['142'][1].init(117, 70, 'mods[moduleName] && mods[moduleName].status === Loader.Status.ATTACHED');
function visit221_142_1(result) {
  _$jscoverage['/loader.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['115'][1].init(149, 17, 'i < unloadModsLen');
function visit220_115_1(result) {
  _$jscoverage['/loader.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['112'][1].init(158, 13, 'unloadModsLen');
function visit219_112_1(result) {
  _$jscoverage['/loader.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['102'][1].init(35, 12, 'e.stack || e');
function visit218_102_1(result) {
  _$jscoverage['/loader.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['98'][1].init(94, 7, 'success');
function visit217_98_1(result) {
  _$jscoverage['/loader.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['96'][1].init(1041, 26, 'loader.isCompleteLoading()');
function visit216_96_1(result) {
  _$jscoverage['/loader.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['87'][1].init(35, 12, 'e.stack || e');
function visit215_87_1(result) {
  _$jscoverage['/loader.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['83'][1].init(25, 5, 'error');
function visit214_83_1(result) {
  _$jscoverage['/loader.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['82'][1].init(430, 16, 'errorList.length');
function visit213_82_1(result) {
  _$jscoverage['/loader.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['75'][1].init(113, 9, '\'@DEBUG@\'');
function visit212_75_1(result) {
  _$jscoverage['/loader.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['56'][1].init(131, 27, 'typeof success === \'object\'');
function visit211_56_1(result) {
  _$jscoverage['/loader.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[8]++;
  var Loader = S.Loader, Env = S.Env, mods = Env.mods = {}, Utils = Loader.Utils, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader.js'].lineData[14]++;
  Utils.mix(S, {
  add: function(name, factory, cfg) {
  _$jscoverage['/loader.js'].functionData[1]++;
  _$jscoverage['/loader.js'].lineData[35]++;
  ComboLoader.add(name, factory, cfg, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader.js'].functionData[2]++;
  _$jscoverage['/loader.js'].lineData[51]++;
  var normalizedModNames, loader, error, tryCount = 0;
  _$jscoverage['/loader.js'].lineData[56]++;
  if (visit211_56_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[58]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[60]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[63]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader.js'].lineData[64]++;
  modNames = Utils.normalizeModNamesWithAlias(modNames);
  _$jscoverage['/loader.js'].lineData[66]++;
  normalizedModNames = Utils.unalias(modNames);
  _$jscoverage['/loader.js'].lineData[68]++;
  var unloadedModNames = normalizedModNames;
  _$jscoverage['/loader.js'].lineData[70]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[3]++;
    _$jscoverage['/loader.js'].lineData[71]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[72]++;
    var errorList = [], start;
    _$jscoverage['/loader.js'].lineData[75]++;
    if (visit212_75_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[76]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[79]++;
    var unloadedMods = loader.calculate(unloadedModNames, errorList);
    _$jscoverage['/loader.js'].lineData[80]++;
    var unloadModsLen = unloadedMods.length;
    _$jscoverage['/loader.js'].lineData[81]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[82]++;
    if (visit213_82_1(errorList.length)) {
      _$jscoverage['/loader.js'].lineData[83]++;
      if (visit214_83_1(error)) {
        _$jscoverage['/loader.js'].lineData[84]++;
        try {
          _$jscoverage['/loader.js'].lineData[85]++;
          error.apply(S, errorList);
        }        catch (e) {
  _$jscoverage['/loader.js'].lineData[87]++;
  S.log(visit215_87_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[89]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[4]++;
  _$jscoverage['/loader.js'].lineData[90]++;
  throw e;
}, 0);
}
      }
      _$jscoverage['/loader.js'].lineData[94]++;
      S.log(errorList, 'error');
      _$jscoverage['/loader.js'].lineData[95]++;
      S.log('loader: load above modules error', 'error');
    } else {
      _$jscoverage['/loader.js'].lineData[96]++;
      if (visit216_96_1(loader.isCompleteLoading())) {
        _$jscoverage['/loader.js'].lineData[97]++;
        Utils.attachModsRecursively(normalizedModNames);
        _$jscoverage['/loader.js'].lineData[98]++;
        if (visit217_98_1(success)) {
          _$jscoverage['/loader.js'].lineData[99]++;
          try {
            _$jscoverage['/loader.js'].lineData[100]++;
            success.apply(S, Utils.getModules(modNames));
          }          catch (e) {
  _$jscoverage['/loader.js'].lineData[102]++;
  S.log(visit218_102_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[104]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[5]++;
  _$jscoverage['/loader.js'].lineData[105]++;
  throw e;
}, 0);
}
        }
      } else {
        _$jscoverage['/loader.js'].lineData[111]++;
        loader.callback = loadReady;
        _$jscoverage['/loader.js'].lineData[112]++;
        if (visit219_112_1(unloadModsLen)) {
          _$jscoverage['/loader.js'].lineData[113]++;
          logger.debug(tryCount + ' reload ');
          _$jscoverage['/loader.js'].lineData[114]++;
          unloadedModNames = [];
          _$jscoverage['/loader.js'].lineData[115]++;
          for (var i = 0; visit220_115_1(i < unloadModsLen); i++) {
            _$jscoverage['/loader.js'].lineData[116]++;
            unloadedModNames.push(unloadedMods[i].name);
          }
          _$jscoverage['/loader.js'].lineData[118]++;
          loader.use(unloadedMods);
        }
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[123]++;
  loader = new ComboLoader(loadReady);
  _$jscoverage['/loader.js'].lineData[128]++;
  loadReady();
  _$jscoverage['/loader.js'].lineData[129]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader.js'].functionData[6]++;
  _$jscoverage['/loader.js'].lineData[140]++;
  moduleName = Utils.normalizePath(refName, moduleName);
  _$jscoverage['/loader.js'].lineData[142]++;
  if (visit221_142_1(mods[moduleName] && visit222_142_2(mods[moduleName].status === Loader.Status.ATTACHED))) {
    _$jscoverage['/loader.js'].lineData[143]++;
    return mods[moduleName].exports;
  }
  _$jscoverage['/loader.js'].lineData[145]++;
  var moduleNames = Utils.normalizeModNames([moduleName], refName);
  _$jscoverage['/loader.js'].lineData[146]++;
  Utils.attachModsRecursively(moduleNames);
  _$jscoverage['/loader.js'].lineData[147]++;
  return Utils.getModules(moduleNames)[1];
}});
})(KISSY);
