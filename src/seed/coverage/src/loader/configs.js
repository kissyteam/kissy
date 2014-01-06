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
if (! _$jscoverage['/loader/configs.js']) {
  _$jscoverage['/loader/configs.js'] = {};
  _$jscoverage['/loader/configs.js'].lineData = [];
  _$jscoverage['/loader/configs.js'].lineData[6] = 0;
  _$jscoverage['/loader/configs.js'].lineData[7] = 0;
  _$jscoverage['/loader/configs.js'].lineData[15] = 0;
  _$jscoverage['/loader/configs.js'].lineData[16] = 0;
  _$jscoverage['/loader/configs.js'].lineData[19] = 0;
  _$jscoverage['/loader/configs.js'].lineData[20] = 0;
  _$jscoverage['/loader/configs.js'].lineData[23] = 0;
  _$jscoverage['/loader/configs.js'].lineData[24] = 0;
  _$jscoverage['/loader/configs.js'].lineData[25] = 0;
  _$jscoverage['/loader/configs.js'].lineData[28] = 0;
  _$jscoverage['/loader/configs.js'].lineData[29] = 0;
  _$jscoverage['/loader/configs.js'].lineData[31] = 0;
  _$jscoverage['/loader/configs.js'].lineData[32] = 0;
  _$jscoverage['/loader/configs.js'].lineData[33] = 0;
  _$jscoverage['/loader/configs.js'].lineData[37] = 0;
  _$jscoverage['/loader/configs.js'].lineData[38] = 0;
  _$jscoverage['/loader/configs.js'].lineData[39] = 0;
  _$jscoverage['/loader/configs.js'].lineData[42] = 0;
  _$jscoverage['/loader/configs.js'].lineData[43] = 0;
  _$jscoverage['/loader/configs.js'].lineData[44] = 0;
  _$jscoverage['/loader/configs.js'].lineData[45] = 0;
  _$jscoverage['/loader/configs.js'].lineData[47] = 0;
  _$jscoverage['/loader/configs.js'].lineData[49] = 0;
  _$jscoverage['/loader/configs.js'].lineData[50] = 0;
  _$jscoverage['/loader/configs.js'].lineData[52] = 0;
  _$jscoverage['/loader/configs.js'].lineData[55] = 0;
  _$jscoverage['/loader/configs.js'].lineData[56] = 0;
  _$jscoverage['/loader/configs.js'].lineData[57] = 0;
  _$jscoverage['/loader/configs.js'].lineData[58] = 0;
  _$jscoverage['/loader/configs.js'].lineData[60] = 0;
  _$jscoverage['/loader/configs.js'].lineData[64] = 0;
  _$jscoverage['/loader/configs.js'].lineData[65] = 0;
  _$jscoverage['/loader/configs.js'].lineData[66] = 0;
  _$jscoverage['/loader/configs.js'].lineData[67] = 0;
  _$jscoverage['/loader/configs.js'].lineData[68] = 0;
  _$jscoverage['/loader/configs.js'].lineData[70] = 0;
  _$jscoverage['/loader/configs.js'].lineData[71] = 0;
  _$jscoverage['/loader/configs.js'].lineData[77] = 0;
  _$jscoverage['/loader/configs.js'].lineData[78] = 0;
  _$jscoverage['/loader/configs.js'].lineData[81] = 0;
  _$jscoverage['/loader/configs.js'].lineData[82] = 0;
  _$jscoverage['/loader/configs.js'].lineData[84] = 0;
  _$jscoverage['/loader/configs.js'].lineData[85] = 0;
  _$jscoverage['/loader/configs.js'].lineData[86] = 0;
  _$jscoverage['/loader/configs.js'].lineData[89] = 0;
  _$jscoverage['/loader/configs.js'].lineData[90] = 0;
  _$jscoverage['/loader/configs.js'].lineData[91] = 0;
  _$jscoverage['/loader/configs.js'].lineData[92] = 0;
  _$jscoverage['/loader/configs.js'].lineData[93] = 0;
  _$jscoverage['/loader/configs.js'].lineData[95] = 0;
  _$jscoverage['/loader/configs.js'].lineData[96] = 0;
  _$jscoverage['/loader/configs.js'].lineData[100] = 0;
  _$jscoverage['/loader/configs.js'].lineData[101] = 0;
  _$jscoverage['/loader/configs.js'].lineData[103] = 0;
  _$jscoverage['/loader/configs.js'].lineData[105] = 0;
}
if (! _$jscoverage['/loader/configs.js'].functionData) {
  _$jscoverage['/loader/configs.js'].functionData = [];
  _$jscoverage['/loader/configs.js'].functionData[0] = 0;
  _$jscoverage['/loader/configs.js'].functionData[1] = 0;
  _$jscoverage['/loader/configs.js'].functionData[2] = 0;
  _$jscoverage['/loader/configs.js'].functionData[3] = 0;
  _$jscoverage['/loader/configs.js'].functionData[4] = 0;
  _$jscoverage['/loader/configs.js'].functionData[5] = 0;
  _$jscoverage['/loader/configs.js'].functionData[6] = 0;
  _$jscoverage['/loader/configs.js'].functionData[7] = 0;
  _$jscoverage['/loader/configs.js'].functionData[8] = 0;
}
if (! _$jscoverage['/loader/configs.js'].branchData) {
  _$jscoverage['/loader/configs.js'].branchData = {};
  _$jscoverage['/loader/configs.js'].branchData['15'] = [];
  _$jscoverage['/loader/configs.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['27'] = [];
  _$jscoverage['/loader/configs.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['28'] = [];
  _$jscoverage['/loader/configs.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['31'] = [];
  _$jscoverage['/loader/configs.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['32'] = [];
  _$jscoverage['/loader/configs.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['38'] = [];
  _$jscoverage['/loader/configs.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['42'] = [];
  _$jscoverage['/loader/configs.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['44'] = [];
  _$jscoverage['/loader/configs.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['49'] = [];
  _$jscoverage['/loader/configs.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['56'] = [];
  _$jscoverage['/loader/configs.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['66'] = [];
  _$jscoverage['/loader/configs.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['70'] = [];
  _$jscoverage['/loader/configs.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['81'] = [];
  _$jscoverage['/loader/configs.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['92'] = [];
  _$jscoverage['/loader/configs.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['95'] = [];
  _$jscoverage['/loader/configs.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['100'] = [];
  _$jscoverage['/loader/configs.js'].branchData['100'][1] = new BranchData();
}
_$jscoverage['/loader/configs.js'].branchData['100'][1].init(94, 28, '!S.startsWith(base, \'file:\')');
function visit392_100_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['95'][1].init(162, 17, 'simulatedLocation');
function visit391_95_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['92'][1].init(75, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit390_92_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['81'][1].init(93, 5, '!base');
function visit389_81_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['70'][1].init(137, 33, 'mod.status === Loader.Status.INIT');
function visit388_70_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['66'][1].init(38, 7, 'modules');
function visit387_66_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['56'][1].init(1100, 16, 'config === false');
function visit386_56_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['49'][1].init(689, 8, 'ps[name]');
function visit385_49_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['44'][1].init(58, 27, '!cfg.ignorePackageNameInUri');
function visit384_44_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['42'][1].init(432, 4, 'path');
function visit383_42_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['38'][1].init(25, 8, 'm in cfg');
function visit382_38_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['32'][1].init(94, 20, 'cfg.base || cfg.path');
function visit381_32_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['31'][1].init(50, 15, 'cfg.name || key');
function visit380_31_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['28'][1].init(123, 6, 'config');
function visit379_28_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['27'][1].init(78, 21, 'Config.packages || {}');
function visit378_27_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['15'][2].init(227, 42, 'location && (locationHref = location.href)');
function visit377_15_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['15'][1].init(211, 58, '!S.UA.nodejs && location && (locationHref = location.href)');
function visit376_15_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/configs.js'].functionData[0]++;
  _$jscoverage['/loader/configs.js'].lineData[7]++;
  var Loader = S.Loader, Utils = Loader.Utils, host = S.Env.host, location = host.location, simulatedLocation, locationHref, configFns = S.Config.fns;
  _$jscoverage['/loader/configs.js'].lineData[15]++;
  if (visit376_15_1(!S.UA.nodejs && visit377_15_2(location && (locationHref = location.href)))) {
    _$jscoverage['/loader/configs.js'].lineData[16]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/loader/configs.js'].lineData[19]++;
  S.Config.loadModsFn = function(rs, config) {
  _$jscoverage['/loader/configs.js'].functionData[1]++;
  _$jscoverage['/loader/configs.js'].lineData[20]++;
  S.getScript(rs.path, config);
};
  _$jscoverage['/loader/configs.js'].lineData[23]++;
  var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];
  _$jscoverage['/loader/configs.js'].lineData[24]++;
  configFns.packages = function(config) {
  _$jscoverage['/loader/configs.js'].functionData[2]++;
  _$jscoverage['/loader/configs.js'].lineData[25]++;
  var name, Config = this.Config, ps = Config.packages = visit378_27_1(Config.packages || {});
  _$jscoverage['/loader/configs.js'].lineData[28]++;
  if (visit379_28_1(config)) {
    _$jscoverage['/loader/configs.js'].lineData[29]++;
    S.each(config, function(cfg, key) {
  _$jscoverage['/loader/configs.js'].functionData[3]++;
  _$jscoverage['/loader/configs.js'].lineData[31]++;
  name = visit380_31_1(cfg.name || key);
  _$jscoverage['/loader/configs.js'].lineData[32]++;
  var path = visit381_32_1(cfg.base || cfg.path);
  _$jscoverage['/loader/configs.js'].lineData[33]++;
  var newConfig = {
  runtime: S, 
  name: name};
  _$jscoverage['/loader/configs.js'].lineData[37]++;
  S.each(PACKAGE_MEMBERS, function(m) {
  _$jscoverage['/loader/configs.js'].functionData[4]++;
  _$jscoverage['/loader/configs.js'].lineData[38]++;
  if (visit382_38_1(m in cfg)) {
    _$jscoverage['/loader/configs.js'].lineData[39]++;
    newConfig[m] = cfg[m];
  }
});
  _$jscoverage['/loader/configs.js'].lineData[42]++;
  if (visit383_42_1(path)) {
    _$jscoverage['/loader/configs.js'].lineData[43]++;
    path += '/';
    _$jscoverage['/loader/configs.js'].lineData[44]++;
    if (visit384_44_1(!cfg.ignorePackageNameInUri)) {
      _$jscoverage['/loader/configs.js'].lineData[45]++;
      path += name + '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[47]++;
    newConfig.uri = normalizeBase(path);
  }
  _$jscoverage['/loader/configs.js'].lineData[49]++;
  if (visit385_49_1(ps[name])) {
    _$jscoverage['/loader/configs.js'].lineData[50]++;
    ps[name].reset(newConfig);
  } else {
    _$jscoverage['/loader/configs.js'].lineData[52]++;
    ps[name] = new Loader.Package(newConfig);
  }
});
    _$jscoverage['/loader/configs.js'].lineData[55]++;
    return undefined;
  } else {
    _$jscoverage['/loader/configs.js'].lineData[56]++;
    if (visit386_56_1(config === false)) {
      _$jscoverage['/loader/configs.js'].lineData[57]++;
      Config.packages = {};
      _$jscoverage['/loader/configs.js'].lineData[58]++;
      return undefined;
    } else {
      _$jscoverage['/loader/configs.js'].lineData[60]++;
      return ps;
    }
  }
};
  _$jscoverage['/loader/configs.js'].lineData[64]++;
  configFns.modules = function(modules) {
  _$jscoverage['/loader/configs.js'].functionData[5]++;
  _$jscoverage['/loader/configs.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/loader/configs.js'].lineData[66]++;
  if (visit387_66_1(modules)) {
    _$jscoverage['/loader/configs.js'].lineData[67]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/loader/configs.js'].functionData[6]++;
  _$jscoverage['/loader/configs.js'].lineData[68]++;
  var mod = Utils.createModuleInfo(self, modName, modCfg);
  _$jscoverage['/loader/configs.js'].lineData[70]++;
  if (visit388_70_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/loader/configs.js'].lineData[71]++;
    S.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/loader/configs.js'].lineData[77]++;
  configFns.base = function(base) {
  _$jscoverage['/loader/configs.js'].functionData[7]++;
  _$jscoverage['/loader/configs.js'].lineData[78]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/loader/configs.js'].lineData[81]++;
  if (visit389_81_1(!base)) {
    _$jscoverage['/loader/configs.js'].lineData[82]++;
    return Config.baseUri.toString();
  }
  _$jscoverage['/loader/configs.js'].lineData[84]++;
  baseUri = normalizeBase(base);
  _$jscoverage['/loader/configs.js'].lineData[85]++;
  Config.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[86]++;
  return undefined;
};
  _$jscoverage['/loader/configs.js'].lineData[89]++;
  function normalizeBase(base) {
    _$jscoverage['/loader/configs.js'].functionData[8]++;
    _$jscoverage['/loader/configs.js'].lineData[90]++;
    var baseUri;
    _$jscoverage['/loader/configs.js'].lineData[91]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/loader/configs.js'].lineData[92]++;
    if (visit390_92_1(base.charAt(base.length - 1) !== '/')) {
      _$jscoverage['/loader/configs.js'].lineData[93]++;
      base += '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[95]++;
    if (visit391_95_1(simulatedLocation)) {
      _$jscoverage['/loader/configs.js'].lineData[96]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/loader/configs.js'].lineData[100]++;
      if (visit392_100_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/loader/configs.js'].lineData[101]++;
        base = 'file:' + base;
      }
      _$jscoverage['/loader/configs.js'].lineData[103]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/loader/configs.js'].lineData[105]++;
    return baseUri;
  }
})(KISSY);
