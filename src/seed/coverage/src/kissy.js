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
if (! _$jscoverage['/kissy.js']) {
  _$jscoverage['/kissy.js'] = {};
  _$jscoverage['/kissy.js'].lineData = [];
  _$jscoverage['/kissy.js'].lineData[26] = 0;
  _$jscoverage['/kissy.js'].lineData[27] = 0;
  _$jscoverage['/kissy.js'].lineData[32] = 0;
  _$jscoverage['/kissy.js'].lineData[107] = 0;
  _$jscoverage['/kissy.js'].lineData[113] = 0;
  _$jscoverage['/kissy.js'].lineData[114] = 0;
  _$jscoverage['/kissy.js'].lineData[115] = 0;
  _$jscoverage['/kissy.js'].lineData[116] = 0;
  _$jscoverage['/kissy.js'].lineData[117] = 0;
  _$jscoverage['/kissy.js'].lineData[119] = 0;
  _$jscoverage['/kissy.js'].lineData[123] = 0;
  _$jscoverage['/kissy.js'].lineData[124] = 0;
  _$jscoverage['/kissy.js'].lineData[125] = 0;
  _$jscoverage['/kissy.js'].lineData[126] = 0;
  _$jscoverage['/kissy.js'].lineData[128] = 0;
  _$jscoverage['/kissy.js'].lineData[131] = 0;
  _$jscoverage['/kissy.js'].lineData[132] = 0;
  _$jscoverage['/kissy.js'].lineData[134] = 0;
  _$jscoverage['/kissy.js'].lineData[138] = 0;
  _$jscoverage['/kissy.js'].lineData[149] = 0;
  _$jscoverage['/kissy.js'].lineData[150] = 0;
  _$jscoverage['/kissy.js'].lineData[151] = 0;
  _$jscoverage['/kissy.js'].lineData[152] = 0;
  _$jscoverage['/kissy.js'].lineData[154] = 0;
  _$jscoverage['/kissy.js'].lineData[155] = 0;
  _$jscoverage['/kissy.js'].lineData[156] = 0;
  _$jscoverage['/kissy.js'].lineData[157] = 0;
  _$jscoverage['/kissy.js'].lineData[158] = 0;
  _$jscoverage['/kissy.js'].lineData[159] = 0;
  _$jscoverage['/kissy.js'].lineData[162] = 0;
  _$jscoverage['/kissy.js'].lineData[163] = 0;
  _$jscoverage['/kissy.js'].lineData[164] = 0;
  _$jscoverage['/kissy.js'].lineData[165] = 0;
  _$jscoverage['/kissy.js'].lineData[166] = 0;
  _$jscoverage['/kissy.js'].lineData[167] = 0;
  _$jscoverage['/kissy.js'].lineData[171] = 0;
  _$jscoverage['/kissy.js'].lineData[172] = 0;
  _$jscoverage['/kissy.js'].lineData[175] = 0;
  _$jscoverage['/kissy.js'].lineData[176] = 0;
  _$jscoverage['/kissy.js'].lineData[177] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
  _$jscoverage['/kissy.js'].lineData[185] = 0;
  _$jscoverage['/kissy.js'].lineData[194] = 0;
  _$jscoverage['/kissy.js'].lineData[196] = 0;
  _$jscoverage['/kissy.js'].lineData[206] = 0;
  _$jscoverage['/kissy.js'].lineData[210] = 0;
  _$jscoverage['/kissy.js'].lineData[211] = 0;
  _$jscoverage['/kissy.js'].lineData[216] = 0;
}
if (! _$jscoverage['/kissy.js'].functionData) {
  _$jscoverage['/kissy.js'].functionData = [];
  _$jscoverage['/kissy.js'].functionData[0] = 0;
  _$jscoverage['/kissy.js'].functionData[1] = 0;
  _$jscoverage['/kissy.js'].functionData[2] = 0;
  _$jscoverage['/kissy.js'].functionData[3] = 0;
  _$jscoverage['/kissy.js'].functionData[4] = 0;
  _$jscoverage['/kissy.js'].functionData[5] = 0;
  _$jscoverage['/kissy.js'].functionData[6] = 0;
  _$jscoverage['/kissy.js'].functionData[7] = 0;
}
if (! _$jscoverage['/kissy.js'].branchData) {
  _$jscoverage['/kissy.js'].branchData = {};
  _$jscoverage['/kissy.js'].branchData['113'] = [];
  _$jscoverage['/kissy.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['116'] = [];
  _$jscoverage['/kissy.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['124'] = [];
  _$jscoverage['/kissy.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['125'] = [];
  _$jscoverage['/kissy.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['131'] = [];
  _$jscoverage['/kissy.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['149'] = [];
  _$jscoverage['/kissy.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['151'] = [];
  _$jscoverage['/kissy.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['152'] = [];
  _$jscoverage['/kissy.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['154'] = [];
  _$jscoverage['/kissy.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['156'] = [];
  _$jscoverage['/kissy.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['157'] = [];
  _$jscoverage['/kissy.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['162'] = [];
  _$jscoverage['/kissy.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['164'] = [];
  _$jscoverage['/kissy.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['165'] = [];
  _$jscoverage['/kissy.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['171'] = [];
  _$jscoverage['/kissy.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['175'] = [];
  _$jscoverage['/kissy.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['175'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['176'] = [];
  _$jscoverage['/kissy.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['194'] = [];
  _$jscoverage['/kissy.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['206'] = [];
  _$jscoverage['/kissy.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['210'] = [];
  _$jscoverage['/kissy.js'].branchData['210'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['210'][1].init(6725, 9, '\'@DEBUG@\'');
function visit52_210_1(result) {
  _$jscoverage['/kissy.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['206'][1].init(22, 12, 'pre || EMPTY');
function visit51_206_1(result) {
  _$jscoverage['/kissy.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['194'][1].init(18, 9, '\'@DEBUG@\'');
function visit50_194_1(result) {
  _$jscoverage['/kissy.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['176'][1].init(30, 19, 'cat && console[cat]');
function visit49_176_1(result) {
  _$jscoverage['/kissy.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['175'][3].init(1084, 22, 'console.log && matched');
function visit48_175_3(result) {
  _$jscoverage['/kissy.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['175'][2].init(1051, 29, 'host[\'console\'] !== undefined');
function visit47_175_2(result) {
  _$jscoverage['/kissy.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['175'][1].init(1051, 55, 'host[\'console\'] !== undefined && console.log && matched');
function visit46_175_1(result) {
  _$jscoverage['/kissy.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['171'][1].init(860, 7, 'matched');
function visit45_171_1(result) {
  _$jscoverage['/kissy.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['165'][1].init(34, 21, 'logger.match(list[i])');
function visit44_165_1(result) {
  _$jscoverage['/kissy.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['164'][1].init(76, 15, 'i < list.length');
function visit43_164_1(result) {
  _$jscoverage['/kissy.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['162'][1].init(483, 25, 'list = loggerCfg.excludes');
function visit42_162_1(result) {
  _$jscoverage['/kissy.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['157'][1].init(34, 21, 'logger.match(list[i])');
function visit41_157_1(result) {
  _$jscoverage['/kissy.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['156'][1].init(76, 15, 'i < list.length');
function visit40_156_1(result) {
  _$jscoverage['/kissy.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['154'][1].init(120, 25, 'list = loggerCfg.includes');
function visit39_154_1(result) {
  _$jscoverage['/kissy.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['152'][1].init(38, 21, 'S.Config.logger || {}');
function visit38_152_1(result) {
  _$jscoverage['/kissy.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['151'][1].init(56, 6, 'logger');
function visit37_151_1(result) {
  _$jscoverage['/kissy.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['149'][1].init(18, 9, '\'@DEBUG@\'');
function visit36_149_1(result) {
  _$jscoverage['/kissy.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['131'][1].init(26, 3, 'cfg');
function visit35_131_1(result) {
  _$jscoverage['/kissy.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['125'][1].init(26, 3, 'cfg');
function visit34_125_1(result) {
  _$jscoverage['/kissy.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['124'][1].init(68, 25, 'configValue === undefined');
function visit33_124_1(result) {
  _$jscoverage['/kissy.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['116'][1].init(66, 2, 'fn');
function visit32_116_1(result) {
  _$jscoverage['/kissy.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['113'][1].init(188, 22, 'S.isObject(configName)');
function visit31_113_1(result) {
  _$jscoverage['/kissy.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].lineData[26]++;
var KISSY = (function(undefined) {
  _$jscoverage['/kissy.js'].functionData[0]++;
  _$jscoverage['/kissy.js'].lineData[27]++;
  var host = this, S, guid = 0, EMPTY = '';
  _$jscoverage['/kissy.js'].lineData[32]++;
  S = {
  __BUILD_TIME: '@TIMESTAMP@', 
  Env: {
  host: host}, 
  Config: {
  debug: '@DEBUG@', 
  fns: {}}, 
  version: '@VERSION@', 
  config: function(configName, configValue) {
  _$jscoverage['/kissy.js'].functionData[1]++;
  _$jscoverage['/kissy.js'].lineData[107]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[113]++;
  if (visit31_113_1(S.isObject(configName))) {
    _$jscoverage['/kissy.js'].lineData[114]++;
    S.each(configName, function(configValue, p) {
  _$jscoverage['/kissy.js'].functionData[2]++;
  _$jscoverage['/kissy.js'].lineData[115]++;
  fn = configFns[p];
  _$jscoverage['/kissy.js'].lineData[116]++;
  if (visit32_116_1(fn)) {
    _$jscoverage['/kissy.js'].lineData[117]++;
    fn.call(self, configValue);
  } else {
    _$jscoverage['/kissy.js'].lineData[119]++;
    Config[p] = configValue;
  }
});
  } else {
    _$jscoverage['/kissy.js'].lineData[123]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[124]++;
    if (visit33_124_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[125]++;
      if (visit34_125_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[126]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[128]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[131]++;
      if (visit35_131_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[132]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[134]++;
        Config[configName] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[138]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[3]++;
  _$jscoverage['/kissy.js'].lineData[149]++;
  if (visit36_149_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[150]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[151]++;
    if (visit37_151_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[152]++;
      var loggerCfg = visit38_152_1(S.Config.logger || {}), list, i;
      _$jscoverage['/kissy.js'].lineData[154]++;
      if (visit39_154_1(list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[155]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[156]++;
        for (i = 0; visit40_156_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[157]++;
          if (visit41_157_1(logger.match(list[i]))) {
            _$jscoverage['/kissy.js'].lineData[158]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[159]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[162]++;
        if (visit42_162_1(list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[163]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[164]++;
          for (i = 0; visit43_164_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[165]++;
            if (visit44_165_1(logger.match(list[i]))) {
              _$jscoverage['/kissy.js'].lineData[166]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[167]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[171]++;
      if (visit45_171_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[172]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[175]++;
    if (visit46_175_1(visit47_175_2(host['console'] !== undefined) && visit48_175_3(console.log && matched))) {
      _$jscoverage['/kissy.js'].lineData[176]++;
      console[visit49_176_1(cat && console[cat]) ? cat : 'log'](msg);
      _$jscoverage['/kissy.js'].lineData[177]++;
      return msg;
    }
  }
}, 
  'getLogger': function(logger) {
  _$jscoverage['/kissy.js'].functionData[4]++;
  _$jscoverage['/kissy.js'].lineData[183]++;
  return {
  log: function(msg, cat) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[185]++;
  return S.log(msg, cat, logger);
}};
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[194]++;
  if (visit50_194_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[196]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[7]++;
  _$jscoverage['/kissy.js'].lineData[206]++;
  return (visit51_206_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[210]++;
  if (visit52_210_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[211]++;
    S.Config.logger = {
  excludes: [/^s\/.*/]};
  }
  _$jscoverage['/kissy.js'].lineData[216]++;
  return S;
})();
