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
  _$jscoverage['/loader.js'].lineData[58] = 0;
  _$jscoverage['/loader.js'].lineData[60] = 0;
  _$jscoverage['/loader.js'].lineData[62] = 0;
  _$jscoverage['/loader.js'].lineData[64] = 0;
  _$jscoverage['/loader.js'].lineData[67] = 0;
  _$jscoverage['/loader.js'].lineData[68] = 0;
  _$jscoverage['/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader.js'].lineData[74] = 0;
  _$jscoverage['/loader.js'].lineData[76] = 0;
  _$jscoverage['/loader.js'].lineData[77] = 0;
  _$jscoverage['/loader.js'].lineData[78] = 0;
  _$jscoverage['/loader.js'].lineData[82] = 0;
  _$jscoverage['/loader.js'].lineData[83] = 0;
  _$jscoverage['/loader.js'].lineData[86] = 0;
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
  _$jscoverage['/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader.js'].lineData[134] = 0;
  _$jscoverage['/loader.js'].lineData[139] = 0;
  _$jscoverage['/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader.js'].lineData[142] = 0;
  _$jscoverage['/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader.js'].lineData[157] = 0;
  _$jscoverage['/loader.js'].lineData[158] = 0;
  _$jscoverage['/loader.js'].lineData[159] = 0;
  _$jscoverage['/loader.js'].lineData[163] = 0;
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
  _$jscoverage['/loader.js'].branchData['58'] = [];
  _$jscoverage['/loader.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['82'] = [];
  _$jscoverage['/loader.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['88'] = [];
  _$jscoverage['/loader.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['90'] = [];
  _$jscoverage['/loader.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['91'] = [];
  _$jscoverage['/loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['95'] = [];
  _$jscoverage['/loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['107'] = [];
  _$jscoverage['/loader.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['108'] = [];
  _$jscoverage['/loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['109'] = [];
  _$jscoverage['/loader.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['113'] = [];
  _$jscoverage['/loader.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['139'] = [];
  _$jscoverage['/loader.js'].branchData['139'][1] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['139'][1].init(3324, 4, 'sync');
function visit205_139_1(result) {
  _$jscoverage['/loader.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['113'][1].init(39, 12, 'e.stack || e');
function visit204_113_1(result) {
  _$jscoverage['/loader.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['109'][1].init(29, 4, 'sync');
function visit203_109_1(result) {
  _$jscoverage['/loader.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['108'][1].init(25, 5, 'error');
function visit202_108_1(result) {
  _$jscoverage['/loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['107'][1].init(1197, 16, 'errorList.length');
function visit201_107_1(result) {
  _$jscoverage['/loader.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['95'][1].init(39, 12, 'e.stack || e');
function visit200_95_1(result) {
  _$jscoverage['/loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['91'][1].init(29, 4, 'sync');
function visit199_91_1(result) {
  _$jscoverage['/loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['90'][1].init(94, 7, 'success');
function visit198_90_1(result) {
  _$jscoverage['/loader.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['88'][1].init(412, 3, 'ret');
function visit197_88_1(result) {
  _$jscoverage['/loader.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['82'][1].init(138, 9, '\'@DEBUG@\'');
function visit196_82_1(result) {
  _$jscoverage['/loader.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['58'][1].init(183, 27, 'typeof success === \'object\'');
function visit195_58_1(result) {
  _$jscoverage['/loader.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[8]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, processImmediate = S.setImmediate, ComboLoader = Loader.ComboLoader;
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
  var normalizedModNames, loader, error, sync, tryCount = 0, finalSuccess;
  _$jscoverage['/loader.js'].lineData[58]++;
  if (visit195_58_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[60]++;
    sync = success.sync;
    _$jscoverage['/loader.js'].lineData[62]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[64]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[67]++;
  finalSuccess = function() {
  _$jscoverage['/loader.js'].functionData[3]++;
  _$jscoverage['/loader.js'].lineData[68]++;
  success.apply(S, Utils.getModules(modNames));
};
  _$jscoverage['/loader.js'].lineData[71]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader.js'].lineData[72]++;
  modNames = Utils.normalizeModNamesWithAlias(modNames);
  _$jscoverage['/loader.js'].lineData[74]++;
  normalizedModNames = Utils.unalias(modNames);
  _$jscoverage['/loader.js'].lineData[76]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[4]++;
    _$jscoverage['/loader.js'].lineData[77]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[78]++;
    var errorList = [], start, ret;
    _$jscoverage['/loader.js'].lineData[82]++;
    if (visit196_82_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[83]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[86]++;
    ret = Utils.checkModsLoadRecursively(normalizedModNames, undefined, errorList);
    _$jscoverage['/loader.js'].lineData[87]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[88]++;
    if (visit197_88_1(ret)) {
      _$jscoverage['/loader.js'].lineData[89]++;
      Utils.attachModsRecursively(normalizedModNames);
      _$jscoverage['/loader.js'].lineData[90]++;
      if (visit198_90_1(success)) {
        _$jscoverage['/loader.js'].lineData[91]++;
        if (visit199_91_1(sync)) {
          _$jscoverage['/loader.js'].lineData[92]++;
          try {
            _$jscoverage['/loader.js'].lineData[93]++;
            finalSuccess();
          }          catch (e) {
  _$jscoverage['/loader.js'].lineData[95]++;
  S.log(visit200_95_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[97]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[5]++;
  _$jscoverage['/loader.js'].lineData[98]++;
  throw e;
}, 0);
}
        } else {
          _$jscoverage['/loader.js'].lineData[104]++;
          processImmediate(finalSuccess);
        }
      }
    } else {
      _$jscoverage['/loader.js'].lineData[107]++;
      if (visit201_107_1(errorList.length)) {
        _$jscoverage['/loader.js'].lineData[108]++;
        if (visit202_108_1(error)) {
          _$jscoverage['/loader.js'].lineData[109]++;
          if (visit203_109_1(sync)) {
            _$jscoverage['/loader.js'].lineData[110]++;
            try {
              _$jscoverage['/loader.js'].lineData[111]++;
              error.apply(S, errorList);
            }            catch (e) {
  _$jscoverage['/loader.js'].lineData[113]++;
  S.log(visit204_113_1(e.stack || e), 'error');
  _$jscoverage['/loader.js'].lineData[115]++;
  setTimeout(function() {
  _$jscoverage['/loader.js'].functionData[6]++;
  _$jscoverage['/loader.js'].lineData[116]++;
  throw e;
}, 0);
}
          } else {
            _$jscoverage['/loader.js'].lineData[120]++;
            processImmediate(function() {
  _$jscoverage['/loader.js'].functionData[7]++;
  _$jscoverage['/loader.js'].lineData[121]++;
  error.apply(S, errorList);
});
          }
        }
        _$jscoverage['/loader.js'].lineData[125]++;
        S.log(errorList, 'error');
        _$jscoverage['/loader.js'].lineData[126]++;
        S.log('loader: load above modules error', 'error');
      } else {
        _$jscoverage['/loader.js'].lineData[128]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader.js'].lineData[129]++;
        loader.callback = loadReady;
        _$jscoverage['/loader.js'].lineData[130]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[134]++;
  loader = new ComboLoader(loadReady);
  _$jscoverage['/loader.js'].lineData[139]++;
  if (visit205_139_1(sync)) {
    _$jscoverage['/loader.js'].lineData[140]++;
    loader.flush();
  } else {
    _$jscoverage['/loader.js'].lineData[142]++;
    processImmediate(function() {
  _$jscoverage['/loader.js'].functionData[8]++;
  _$jscoverage['/loader.js'].lineData[143]++;
  loader.flush();
});
  }
  _$jscoverage['/loader.js'].lineData[146]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader.js'].functionData[9]++;
  _$jscoverage['/loader.js'].lineData[157]++;
  var moduleNames = Utils.normalizeModNames([moduleName], refName);
  _$jscoverage['/loader.js'].lineData[158]++;
  Utils.attachModsRecursively(moduleNames);
  _$jscoverage['/loader.js'].lineData[159]++;
  return Utils.getModules(moduleNames)[1];
}});
  _$jscoverage['/loader.js'].lineData[163]++;
  Env.mods = {};
})(KISSY);
