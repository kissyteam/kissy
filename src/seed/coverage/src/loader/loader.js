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
if (! _$jscoverage['/loader/loader.js']) {
  _$jscoverage['/loader/loader.js'] = {};
  _$jscoverage['/loader/loader.js'].lineData = [];
  _$jscoverage['/loader/loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/loader.js'].lineData[35] = 0;
  _$jscoverage['/loader/loader.js'].lineData[39] = 0;
  _$jscoverage['/loader/loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/loader.js'].lineData[49] = 0;
  _$jscoverage['/loader/loader.js'].lineData[70] = 0;
  _$jscoverage['/loader/loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/loader.js'].lineData[134] = 0;
  _$jscoverage['/loader/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/loader.js'].lineData[154] = 0;
  _$jscoverage['/loader/loader.js'].lineData[155] = 0;
  _$jscoverage['/loader/loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/loader.js'].lineData[177] = 0;
}
if (! _$jscoverage['/loader/loader.js'].functionData) {
  _$jscoverage['/loader/loader.js'].functionData = [];
  _$jscoverage['/loader/loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/loader.js'].functionData[12] = 0;
}
if (! _$jscoverage['/loader/loader.js'].branchData) {
  _$jscoverage['/loader/loader.js'].branchData = {};
  _$jscoverage['/loader/loader.js'].branchData['28'] = [];
  _$jscoverage['/loader/loader.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['94'] = [];
  _$jscoverage['/loader/loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['119'] = [];
  _$jscoverage['/loader/loader.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['121'] = [];
  _$jscoverage['/loader/loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['122'] = [];
  _$jscoverage['/loader/loader.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['129'] = [];
  _$jscoverage['/loader/loader.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['130'] = [];
  _$jscoverage['/loader/loader.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['131'] = [];
  _$jscoverage['/loader/loader.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['151'] = [];
  _$jscoverage['/loader/loader.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['169'] = [];
  _$jscoverage['/loader/loader.js'].branchData['169'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['169'][1].init(17, 10, 'moduleName');
function visit477_169_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['151'][1].init(2462, 4, 'sync');
function visit476_151_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['131'][1].init(29, 4, 'sync');
function visit475_131_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['130'][1].init(25, 5, 'error');
function visit474_130_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['129'][1].init(744, 16, 'errorList.length');
function visit473_129_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['122'][1].init(29, 4, 'sync');
function visit472_122_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['121'][1].init(97, 7, 'success');
function visit471_121_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['119'][1].init(327, 3, 'ret');
function visit470_119_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['94'][1].init(247, 24, 'S.isPlainObject(success)');
function visit469_94_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['28'][1].init(76, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit468_28_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader/loader.js'].lineData[8]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, processImmediate = S.setImmediate, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[15]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[16]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[22]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[26]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[28]++;
  if (visit468_28_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[29]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[30]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[35]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[39]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[43]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[47]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[49]++;
  S.mix(S, {
  add: function(name, factory, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[70]++;
  ComboLoader.add(name, factory, cfg, S, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[86]++;
  var normalizedModNames, loader, error, sync, tryCount = 0, finalSuccess, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[94]++;
  if (visit469_94_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[96]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[98]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[100]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[103]++;
  finalSuccess = function() {
  _$jscoverage['/loader/loader.js'].functionData[8]++;
  _$jscoverage['/loader/loader.js'].lineData[104]++;
  success.apply(S, Utils.getModules(S, modNames));
};
  _$jscoverage['/loader/loader.js'].lineData[107]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[108]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[110]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[112]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[9]++;
    _$jscoverage['/loader/loader.js'].lineData[113]++;
    ++tryCount;
    _$jscoverage['/loader/loader.js'].lineData[114]++;
    var errorList = [], start = S.now(), ret;
    _$jscoverage['/loader/loader.js'].lineData[117]++;
    ret = Utils.checkModsLoadRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[118]++;
    logger.debug(tryCount + ' check duration ' + (S.now() - start));
    _$jscoverage['/loader/loader.js'].lineData[119]++;
    if (visit470_119_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[120]++;
      Utils.attachModsRecursively(normalizedModNames, S);
      _$jscoverage['/loader/loader.js'].lineData[121]++;
      if (visit471_121_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[122]++;
        if (visit472_122_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[123]++;
          finalSuccess();
        } else {
          _$jscoverage['/loader/loader.js'].lineData[126]++;
          processImmediate(finalSuccess);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[129]++;
      if (visit473_129_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[130]++;
        if (visit474_130_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[131]++;
          if (visit475_131_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[132]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[134]++;
            processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[135]++;
  error.apply(S, errorList);
});
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[140]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader/loader.js'].lineData[141]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[142]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[146]++;
  loader = new ComboLoader(S, waitingModules);
  _$jscoverage['/loader/loader.js'].lineData[151]++;
  if (visit476_151_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[152]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[154]++;
    processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[155]++;
  waitingModules.notifyAll();
});
  }
  _$jscoverage['/loader/loader.js'].lineData[158]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[169]++;
  if (visit477_169_1(moduleName)) {
    _$jscoverage['/loader/loader.js'].lineData[170]++;
    var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName], refName));
    _$jscoverage['/loader/loader.js'].lineData[171]++;
    Utils.attachModsRecursively(moduleNames, S);
    _$jscoverage['/loader/loader.js'].lineData[172]++;
    return Utils.getModules(S, moduleNames)[1];
  }
}});
  _$jscoverage['/loader/loader.js'].lineData[177]++;
  Env.mods = {};
})(KISSY);
