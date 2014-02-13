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
  _$jscoverage['/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader.js'].lineData[16] = 0;
  _$jscoverage['/loader.js'].lineData[19] = 0;
  _$jscoverage['/loader.js'].lineData[23] = 0;
  _$jscoverage['/loader.js'].lineData[25] = 0;
  _$jscoverage['/loader.js'].lineData[26] = 0;
  _$jscoverage['/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader.js'].lineData[32] = 0;
  _$jscoverage['/loader.js'].lineData[36] = 0;
  _$jscoverage['/loader.js'].lineData[40] = 0;
  _$jscoverage['/loader.js'].lineData[44] = 0;
  _$jscoverage['/loader.js'].lineData[46] = 0;
  _$jscoverage['/loader.js'].lineData[67] = 0;
  _$jscoverage['/loader.js'].lineData[83] = 0;
  _$jscoverage['/loader.js'].lineData[91] = 0;
  _$jscoverage['/loader.js'].lineData[93] = 0;
  _$jscoverage['/loader.js'].lineData[95] = 0;
  _$jscoverage['/loader.js'].lineData[97] = 0;
  _$jscoverage['/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader.js'].lineData[132] = 0;
  _$jscoverage['/loader.js'].lineData[133] = 0;
  _$jscoverage['/loader.js'].lineData[134] = 0;
  _$jscoverage['/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader.js'].lineData[137] = 0;
  _$jscoverage['/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader.js'].lineData[142] = 0;
  _$jscoverage['/loader.js'].lineData[144] = 0;
  _$jscoverage['/loader.js'].lineData[145] = 0;
  _$jscoverage['/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader.js'].lineData[150] = 0;
  _$jscoverage['/loader.js'].lineData[155] = 0;
  _$jscoverage['/loader.js'].lineData[156] = 0;
  _$jscoverage['/loader.js'].lineData[158] = 0;
  _$jscoverage['/loader.js'].lineData[159] = 0;
  _$jscoverage['/loader.js'].lineData[162] = 0;
  _$jscoverage['/loader.js'].lineData[173] = 0;
  _$jscoverage['/loader.js'].lineData[174] = 0;
  _$jscoverage['/loader.js'].lineData[175] = 0;
  _$jscoverage['/loader.js'].lineData[176] = 0;
  _$jscoverage['/loader.js'].lineData[181] = 0;
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
  _$jscoverage['/loader.js'].functionData[10] = 0;
  _$jscoverage['/loader.js'].functionData[11] = 0;
  _$jscoverage['/loader.js'].functionData[12] = 0;
}
if (! _$jscoverage['/loader.js'].branchData) {
  _$jscoverage['/loader.js'].branchData = {};
  _$jscoverage['/loader.js'].branchData['25'] = [];
  _$jscoverage['/loader.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['91'] = [];
  _$jscoverage['/loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['115'] = [];
  _$jscoverage['/loader.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['121'] = [];
  _$jscoverage['/loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['123'] = [];
  _$jscoverage['/loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['124'] = [];
  _$jscoverage['/loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['131'] = [];
  _$jscoverage['/loader.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['132'] = [];
  _$jscoverage['/loader.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['133'] = [];
  _$jscoverage['/loader.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['155'] = [];
  _$jscoverage['/loader.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/loader.js'].branchData['173'] = [];
  _$jscoverage['/loader.js'].branchData['173'][1] = new BranchData();
}
_$jscoverage['/loader.js'].branchData['173'][1].init(17, 10, 'moduleName');
function visit196_173_1(result) {
  _$jscoverage['/loader.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['155'][1].init(2654, 4, 'sync');
function visit195_155_1(result) {
  _$jscoverage['/loader.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['133'][1].init(29, 4, 'sync');
function visit194_133_1(result) {
  _$jscoverage['/loader.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['132'][1].init(25, 5, 'error');
function visit193_132_1(result) {
  _$jscoverage['/loader.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['131'][1].init(826, 16, 'errorList.length');
function visit192_131_1(result) {
  _$jscoverage['/loader.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['124'][1].init(29, 4, 'sync');
function visit191_124_1(result) {
  _$jscoverage['/loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['123'][1].init(94, 7, 'success');
function visit190_123_1(result) {
  _$jscoverage['/loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['121'][1].init(412, 3, 'ret');
function visit189_121_1(result) {
  _$jscoverage['/loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['115'][1].init(138, 9, '\'@DEBUG@\'');
function visit188_115_1(result) {
  _$jscoverage['/loader.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['91'][1].init(247, 27, 'typeof success === \'object\'');
function visit187_91_1(result) {
  _$jscoverage['/loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].branchData['25'][1].init(76, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit186_25_1(result) {
  _$jscoverage['/loader.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader.js'].functionData[0]++;
  _$jscoverage['/loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader.js'].lineData[8]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, processImmediate = S.setImmediate, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader.js'].lineData[14]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader.js'].functionData[1]++;
    _$jscoverage['/loader.js'].lineData[15]++;
    this.fn = fn;
    _$jscoverage['/loader.js'].lineData[16]++;
    this.waitMods = {};
  }
  _$jscoverage['/loader.js'].lineData[19]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader.js'].functionData[2]++;
  _$jscoverage['/loader.js'].lineData[23]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader.js'].lineData[25]++;
  if (visit186_25_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader.js'].lineData[26]++;
    self.fn = null;
    _$jscoverage['/loader.js'].lineData[27]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader.js'].functionData[3]++;
  _$jscoverage['/loader.js'].lineData[32]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader.js'].functionData[4]++;
  _$jscoverage['/loader.js'].lineData[36]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader.js'].functionData[5]++;
  _$jscoverage['/loader.js'].lineData[40]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader.js'].lineData[44]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader.js'].lineData[46]++;
  S.mix(S, {
  add: function(name, factory, cfg) {
  _$jscoverage['/loader.js'].functionData[6]++;
  _$jscoverage['/loader.js'].lineData[67]++;
  ComboLoader.add(name, factory, cfg, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader.js'].functionData[7]++;
  _$jscoverage['/loader.js'].lineData[83]++;
  var normalizedModNames, loader, error, sync, tryCount = 0, finalSuccess, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader.js'].lineData[91]++;
  if (visit187_91_1(typeof success === 'object')) {
    _$jscoverage['/loader.js'].lineData[93]++;
    sync = success.sync;
    _$jscoverage['/loader.js'].lineData[95]++;
    error = success.error;
    _$jscoverage['/loader.js'].lineData[97]++;
    success = success.success;
  }
  _$jscoverage['/loader.js'].lineData[100]++;
  finalSuccess = function() {
  _$jscoverage['/loader.js'].functionData[8]++;
  _$jscoverage['/loader.js'].lineData[101]++;
  success.apply(S, Utils.getModules(modNames));
};
  _$jscoverage['/loader.js'].lineData[104]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader.js'].lineData[105]++;
  modNames = Utils.normalizeModNamesWithAlias(modNames);
  _$jscoverage['/loader.js'].lineData[107]++;
  normalizedModNames = Utils.unalias(modNames);
  _$jscoverage['/loader.js'].lineData[109]++;
  function loadReady() {
    _$jscoverage['/loader.js'].functionData[9]++;
    _$jscoverage['/loader.js'].lineData[110]++;
    ++tryCount;
    _$jscoverage['/loader.js'].lineData[111]++;
    var errorList = [], start, ret;
    _$jscoverage['/loader.js'].lineData[115]++;
    if (visit188_115_1('@DEBUG@')) {
      _$jscoverage['/loader.js'].lineData[116]++;
      start = +new Date();
    }
    _$jscoverage['/loader.js'].lineData[119]++;
    ret = Utils.checkModsLoadRecursively(normalizedModNames, undefined, errorList);
    _$jscoverage['/loader.js'].lineData[120]++;
    logger.debug(tryCount + ' check duration ' + (+new Date() - start));
    _$jscoverage['/loader.js'].lineData[121]++;
    if (visit189_121_1(ret)) {
      _$jscoverage['/loader.js'].lineData[122]++;
      Utils.attachModsRecursively(normalizedModNames);
      _$jscoverage['/loader.js'].lineData[123]++;
      if (visit190_123_1(success)) {
        _$jscoverage['/loader.js'].lineData[124]++;
        if (visit191_124_1(sync)) {
          _$jscoverage['/loader.js'].lineData[125]++;
          finalSuccess();
        } else {
          _$jscoverage['/loader.js'].lineData[128]++;
          processImmediate(finalSuccess);
        }
      }
    } else {
      _$jscoverage['/loader.js'].lineData[131]++;
      if (visit192_131_1(errorList.length)) {
        _$jscoverage['/loader.js'].lineData[132]++;
        if (visit193_132_1(error)) {
          _$jscoverage['/loader.js'].lineData[133]++;
          if (visit194_133_1(sync)) {
            _$jscoverage['/loader.js'].lineData[134]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader.js'].lineData[136]++;
            processImmediate(function() {
  _$jscoverage['/loader.js'].functionData[10]++;
  _$jscoverage['/loader.js'].lineData[137]++;
  error.apply(S, errorList);
});
          }
        }
        _$jscoverage['/loader.js'].lineData[141]++;
        S.log(errorList, 'error');
        _$jscoverage['/loader.js'].lineData[142]++;
        S.log('loader: load above modules error', 'error');
      } else {
        _$jscoverage['/loader.js'].lineData[144]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader.js'].lineData[145]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader.js'].lineData[146]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader.js'].lineData[150]++;
  loader = new ComboLoader(waitingModules);
  _$jscoverage['/loader.js'].lineData[155]++;
  if (visit195_155_1(sync)) {
    _$jscoverage['/loader.js'].lineData[156]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader.js'].lineData[158]++;
    processImmediate(function() {
  _$jscoverage['/loader.js'].functionData[11]++;
  _$jscoverage['/loader.js'].lineData[159]++;
  waitingModules.notifyAll();
});
  }
  _$jscoverage['/loader.js'].lineData[162]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader.js'].functionData[12]++;
  _$jscoverage['/loader.js'].lineData[173]++;
  if (visit196_173_1(moduleName)) {
    _$jscoverage['/loader.js'].lineData[174]++;
    var moduleNames = Utils.unalias(Utils.normalizeModNamesWithAlias([moduleName], refName));
    _$jscoverage['/loader.js'].lineData[175]++;
    Utils.attachModsRecursively(moduleNames);
    _$jscoverage['/loader.js'].lineData[176]++;
    return Utils.getModules(moduleNames)[1];
  }
}});
  _$jscoverage['/loader.js'].lineData[181]++;
  Env.mods = {};
})(KISSY);
