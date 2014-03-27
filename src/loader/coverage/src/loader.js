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
  _$jscoverage['/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader.js'].lineData[36] = 0;
  _$jscoverage['/loader.js'].lineData[52] = 0;
  _$jscoverage['/loader.js'].lineData[59] = 0;
  _$jscoverage['/loader.js'].lineData[61] = 0;
  _$jscoverage['/loader.js'].lineData[63] = 0;
  _$jscoverage['/loader.js'].lineData[65] = 0;
  _$jscoverage['/loader.js'].lineData[68] = 0;
  _$jscoverage['/loader.js'].lineData[69] = 0;
  _$jscoverage['/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader.js'].lineData[73] = 0;
  _$jscoverage['/loader.js'].lineData[75] = 0;
  _$jscoverage['/loader.js'].lineData[77] = 0;
  _$jscoverage['/loader.js'].lineData[78] = 0;
  _$jscoverage['/loader.js'].lineData[79] = 0;
  _$jscoverage['/loader.js'].lineData[83] = 0;
  _$jscoverage['/loader.js'].lineData[84] = 0;
  _$jscoverage['/loader.js'].lineData[87] = 0;
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
  _$jscoverage['/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader.js'].lineData[117] = 0;
  _$jscoverage['/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader.js'].lineData[127] = 0;
  _$jscoverage['/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader.js'].lineData[144] = 0;
  _$jscoverage['/loader.js'].lineData[147] = 0;
  _$jscoverage['/loader.js'].lineData[158] = 0;
  _$jscoverage['/loader.js'].lineData[160] = 0;
  _$jscoverage['/loader.js'].lineData[161] = 0;
  _$jscoverage['/loader.js'].lineData[163] = 0;
  _$jscoverage['/loader.js'].lineData[164] = 0;
  _$jscoverage['/loader.js'].lineData[165] = 0;
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
  _$jscoverage['/loader.js'].branchData['59'] = [];
  _$jscoverage['/loader.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['83'] = [];
  _$jscoverage['/loader.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['89'] = [];
  _$jscoverage['/loader.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['91'] = [];
  _$jscoverage['/loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['92'] = [];
  _$jscoverage['/loader.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['96'] = [];
  _$jscoverage['/loader.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['108'] = [];
  _$jscoverage['/loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['109'] = [];
  _$jscoverage['/loader.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['110'] = [];
  _$jscoverage['/loader.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['114'] = [];
  _$jscoverage['/loader.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['140'] = [];
  _$jscoverage['/loader.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['160'] = [];
  _$jscoverage['/loader.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['160'][2] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['160'][2].init(137, 50, 'mods[moduleName].status === Loader.Status.ATTACHED');
function visit207_160_2(result) {
  _$jscoverage['/loader.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['160'][1].init(117, 70, 'mods[moduleName] && mods[moduleName].status === Loader.Status.ATTACHED');
function visit206_160_1(result) {
  _$jscoverage['/loader.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['140'][1].init(3324, 4, 'sync');
function visit205_140_1(result) {
  _$jscoverage['/loader.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['114'][1].init(39, 12, 'e.stack || e');
function visit204_114_1(result) {
  _$jscoverage['/loader.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['110'][1].init(29, 4, 'sync');
function visit203_110_1(result) {
  _$jscoverage['/loader.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['109'][1].init(25, 5, 'error');
function visit202_109_1(result) {
  _$jscoverage['/loader.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['108'][1].init(1197, 16, 'errorList.length');
function visit201_108_1(result) {
  _$jscoverage['/loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['96'][1].init(39, 12, 'e.stack || e');
function visit200_96_1(result) {
  _$jscoverage['/loader.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['92'][1].init(29, 4, 'sync');
function visit199_92_1(result) {
  _$jscoverage['/loader.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['91'][1].init(94, 7, 'success');
function visit198_91_1(result) {
  _$jscoverage['/loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['89'][1].init(412, 3, 'ret');
function visit197_89_1(result) {
  _$jscoverage['/loader.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['83'][1].init(138, 9, '\'@DEBUG@\'');
function visit196_83_1(result) {
  _$jscoverage['/loader.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['59'][1].init(183, 27, 'typeof success === \'object\'');
function visit195_59_1(result) {
  _$jscoverage['/loader.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[8]++;
  var Loader = S.Loader, Env = S.Env, mods = Env.mods = {}, Utils = Loader.Utils, processImmediate = S.setImmediate, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader.js'].lineData[15]++;
  Utils.mix(S, {
  add: function(name, factory, cfg) {
  _$jscoverage['/loader.js'].functionData[1]++;
  _$jscoverage['/loader.js'].lineData[36]++;
  ComboLoader.add(name, factory, cfg, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader.js'].functionData[2]++;
  _$jscoverage['/loader.js'].lineData[52]++;
  var normalizedModNames, loader, error, sync, tryCount = 0, finalSuccess;
  _$jscoverage['/loader.js'].lineData[59]++;
  if (visit195_59_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[61]++;
    sync = success.sync;
    _$jscoverage['/loader.js'].lineData[63]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[65]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[68]++;
  finalSuccess = function() {
  _$jscoverage['/loader.js'].functionData[3]++;
  _$jscoverage['/loader.js'].lineData[69]++;
  success.apply(S, Utils.getModules(modNames));
};
  _$jscoverage['/loader.js'].lineData[72]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader.js'].lineData[73]++;
  modNames = Utils.normalizeModNamesWithAlias(modNames);
  _$jscoverage['/loader.js'].lineData[75]++;
  normalizedModNames = Utils.unalias(modNames);
  _$jscoverage['/loader.js'].lineData[77]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[4]++;
    _$jscoverage['/loader.js'].lineData[78]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[79]++;
    var errorList = [], start, ret;
    _$jscoverage['/loader.js'].lineData[83]++;
    if (visit196_83_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[84]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[87]++;
    ret = Utils.checkModsLoadRecursively(normalizedModNames, undefined, errorList);
    _$jscoverage['/loader.js'].lineData[88]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[89]++;
    if (visit197_89_1(ret)) {
      _$jscoverage['/loader.js'].lineData[90]++;
      Utils.attachModsRecursively(normalizedModNames);
      _$jscoverage['/loader.js'].lineData[91]++;
      if (visit198_91_1(success)) {
        _$jscoverage['/loader.js'].lineData[92]++;
        if (visit199_92_1(sync)) {
          _$jscoverage['/loader.js'].lineData[93]++;
          try {
            _$jscoverage['/loader.js'].lineData[94]++;
            finalSuccess();
          }          catch (e) {
  _$jscoverage['/loader.js'].lineData[96]++;
  S.log(visit200_96_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[98]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[5]++;
  _$jscoverage['/loader.js'].lineData[99]++;
  throw e;
}, 0);
}
        } else {
          _$jscoverage['/loader.js'].lineData[105]++;
          processImmediate(finalSuccess);
        }
      }
    } else {
      _$jscoverage['/loader.js'].lineData[108]++;
      if (visit201_108_1(errorList.length)) {
        _$jscoverage['/loader.js'].lineData[109]++;
        if (visit202_109_1(error)) {
          _$jscoverage['/loader.js'].lineData[110]++;
          if (visit203_110_1(sync)) {
            _$jscoverage['/loader.js'].lineData[111]++;
            try {
              _$jscoverage['/loader.js'].lineData[112]++;
              error.apply(S, errorList);
            }            catch (e) {
  _$jscoverage['/loader.js'].lineData[114]++;
  S.log(visit204_114_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[116]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[6]++;
  _$jscoverage['/loader.js'].lineData[117]++;
  throw e;
}, 0);
}
          } else {
            _$jscoverage['/loader.js'].lineData[121]++;
            processImmediate(function() {
  _$jscoverage['/loader.js'].functionData[7]++;
  _$jscoverage['/loader.js'].lineData[122]++;
  error.apply(S, errorList);
});
          }
        }
        _$jscoverage['/loader.js'].lineData[126]++;
        S.log(errorList, 'error');
        _$jscoverage['/loader.js'].lineData[127]++;
        S.log('loader: load above modules error', 'error');
      } else {
        _$jscoverage['/loader.js'].lineData[129]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader.js'].lineData[130]++;
        loader.callback = loadReady;
        _$jscoverage['/loader.js'].lineData[131]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[135]++;
  loader = new ComboLoader(loadReady);
  _$jscoverage['/loader.js'].lineData[140]++;
  if (visit205_140_1(sync)) {
    _$jscoverage['/loader.js'].lineData[141]++;
    loader.flush();
  } else {
    _$jscoverage['/loader.js'].lineData[143]++;
    processImmediate(function() {
  _$jscoverage['/loader.js'].functionData[8]++;
  _$jscoverage['/loader.js'].lineData[144]++;
  loader.flush();
});
  }
  _$jscoverage['/loader.js'].lineData[147]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader.js'].functionData[9]++;
  _$jscoverage['/loader.js'].lineData[158]++;
  moduleName = Utils.normalizePath(refName, moduleName);
  _$jscoverage['/loader.js'].lineData[160]++;
  if (visit206_160_1(mods[moduleName] && visit207_160_2(mods[moduleName].status === Loader.Status.ATTACHED))) {
    _$jscoverage['/loader.js'].lineData[161]++;
    return mods[moduleName].exports;
  }
  _$jscoverage['/loader.js'].lineData[163]++;
  var moduleNames = Utils.normalizeModNames([moduleName], refName);
  _$jscoverage['/loader.js'].lineData[164]++;
  Utils.attachModsRecursively(moduleNames);
  _$jscoverage['/loader.js'].lineData[165]++;
  return Utils.getModules(moduleNames)[1];
}});
})(KISSY);
