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
  _$jscoverage['/loader/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/loader.js'].lineData[34] = 0;
  _$jscoverage['/loader/loader.js'].lineData[38] = 0;
  _$jscoverage['/loader/loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/loader.js'].lineData[137] = 0;
  _$jscoverage['/loader/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/loader.js'].lineData[163] = 0;
  _$jscoverage['/loader/loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/loader.js'].lineData[171] = 0;
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
  _$jscoverage['/loader/loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['92'] = [];
  _$jscoverage['/loader/loader.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['113'] = [];
  _$jscoverage['/loader/loader.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['114'] = [];
  _$jscoverage['/loader/loader.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['115'] = [];
  _$jscoverage['/loader/loader.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['124'] = [];
  _$jscoverage['/loader/loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['125'] = [];
  _$jscoverage['/loader/loader.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['126'] = [];
  _$jscoverage['/loader/loader.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['146'] = [];
  _$jscoverage['/loader/loader.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['164'] = [];
  _$jscoverage['/loader/loader.js'].branchData['164'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['164'][1].init(118, 43, 'Utils.attachModsRecursively(moduleNames, S)');
function visit457_164_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['146'][1].init(2442, 4, 'sync');
function visit456_146_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['126'][1].init(30, 4, 'sync');
function visit455_126_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['125'][1].init(26, 5, 'error');
function visit454_125_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['124'][1].init(832, 16, 'errorList.length');
function visit453_124_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['115'][1].init(30, 4, 'sync');
function visit452_115_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['114'][1].init(26, 7, 'success');
function visit451_114_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['113'][1].init(331, 3, 'ret');
function visit450_113_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['92'][1].init(225, 24, 'S.isPlainObject(success)');
function visit449_92_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['27'][1].init(79, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit448_27_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, logger = S.getLogger('s/loader'), Utils = Loader.Utils, processImmediate = S.setImmediate, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[14]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[15]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[21]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[25]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[27]++;
  if (visit448_27_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[28]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[29]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[34]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[38]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[42]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[46]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[48]++;
  S.mix(S, {
  add: function(name, fn, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[69]++;
  ComboLoader.add(name, fn, cfg, S);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[85]++;
  var normalizedModNames, loader, error, sync, tryCount = 0, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[92]++;
  if (visit449_92_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[94]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[96]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[98]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[101]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[102]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[104]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[106]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[8]++;
    _$jscoverage['/loader/loader.js'].lineData[107]++;
    ++tryCount;
    _$jscoverage['/loader/loader.js'].lineData[108]++;
    var errorList = [], start = S.now(), ret;
    _$jscoverage['/loader/loader.js'].lineData[111]++;
    ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[112]++;
    logger.debug(tryCount + ' check duration ' + (S.now() - start));
    _$jscoverage['/loader/loader.js'].lineData[113]++;
    if (visit450_113_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[114]++;
      if (visit451_114_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[115]++;
        if (visit452_115_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[116]++;
          success.apply(S, Utils.getModules(S, modNames));
        } else {
          _$jscoverage['/loader/loader.js'].lineData[119]++;
          processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[9]++;
  _$jscoverage['/loader/loader.js'].lineData[120]++;
  success.apply(S, Utils.getModules(S, modNames));
});
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[124]++;
      if (visit453_124_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[125]++;
        if (visit454_125_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[126]++;
          if (visit455_126_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[127]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[129]++;
            processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[130]++;
  error.apply(S, errorList);
});
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[135]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader/loader.js'].lineData[136]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[137]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[141]++;
  loader = new ComboLoader(S, waitingModules);
  _$jscoverage['/loader/loader.js'].lineData[146]++;
  if (visit456_146_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[147]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[149]++;
    processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[150]++;
  waitingModules.notifyAll();
});
  }
  _$jscoverage['/loader/loader.js'].lineData[153]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[163]++;
  var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName]));
  _$jscoverage['/loader/loader.js'].lineData[164]++;
  if (visit457_164_1(Utils.attachModsRecursively(moduleNames, S))) {
    _$jscoverage['/loader/loader.js'].lineData[165]++;
    return Utils.getModules(S, moduleNames)[1];
  }
  _$jscoverage['/loader/loader.js'].lineData[167]++;
  return undefined;
}});
  _$jscoverage['/loader/loader.js'].lineData[171]++;
  Env.mods = {};
})(KISSY);
