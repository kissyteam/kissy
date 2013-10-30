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
  _$jscoverage['/loader/configs.js'].lineData[21] = 0;
  _$jscoverage['/loader/configs.js'].lineData[22] = 0;
  _$jscoverage['/loader/configs.js'].lineData[24] = 0;
  _$jscoverage['/loader/configs.js'].lineData[27] = 0;
  _$jscoverage['/loader/configs.js'].lineData[28] = 0;
  _$jscoverage['/loader/configs.js'].lineData[29] = 0;
  _$jscoverage['/loader/configs.js'].lineData[30] = 0;
  _$jscoverage['/loader/configs.js'].lineData[32] = 0;
  _$jscoverage['/loader/configs.js'].lineData[35] = 0;
  _$jscoverage['/loader/configs.js'].lineData[36] = 0;
  _$jscoverage['/loader/configs.js'].lineData[39] = 0;
  _$jscoverage['/loader/configs.js'].lineData[40] = 0;
  _$jscoverage['/loader/configs.js'].lineData[42] = 0;
  _$jscoverage['/loader/configs.js'].lineData[45] = 0;
  _$jscoverage['/loader/configs.js'].lineData[47] = 0;
  _$jscoverage['/loader/configs.js'].lineData[48] = 0;
  _$jscoverage['/loader/configs.js'].lineData[49] = 0;
  _$jscoverage['/loader/configs.js'].lineData[50] = 0;
  _$jscoverage['/loader/configs.js'].lineData[51] = 0;
  _$jscoverage['/loader/configs.js'].lineData[52] = 0;
  _$jscoverage['/loader/configs.js'].lineData[53] = 0;
  _$jscoverage['/loader/configs.js'].lineData[55] = 0;
  _$jscoverage['/loader/configs.js'].lineData[58] = 0;
  _$jscoverage['/loader/configs.js'].lineData[59] = 0;
  _$jscoverage['/loader/configs.js'].lineData[60] = 0;
  _$jscoverage['/loader/configs.js'].lineData[62] = 0;
  _$jscoverage['/loader/configs.js'].lineData[64] = 0;
  _$jscoverage['/loader/configs.js'].lineData[68] = 0;
  _$jscoverage['/loader/configs.js'].lineData[69] = 0;
  _$jscoverage['/loader/configs.js'].lineData[70] = 0;
  _$jscoverage['/loader/configs.js'].lineData[71] = 0;
  _$jscoverage['/loader/configs.js'].lineData[72] = 0;
  _$jscoverage['/loader/configs.js'].lineData[74] = 0;
  _$jscoverage['/loader/configs.js'].lineData[75] = 0;
  _$jscoverage['/loader/configs.js'].lineData[81] = 0;
  _$jscoverage['/loader/configs.js'].lineData[82] = 0;
  _$jscoverage['/loader/configs.js'].lineData[85] = 0;
  _$jscoverage['/loader/configs.js'].lineData[86] = 0;
  _$jscoverage['/loader/configs.js'].lineData[88] = 0;
  _$jscoverage['/loader/configs.js'].lineData[89] = 0;
  _$jscoverage['/loader/configs.js'].lineData[90] = 0;
  _$jscoverage['/loader/configs.js'].lineData[91] = 0;
  _$jscoverage['/loader/configs.js'].lineData[94] = 0;
  _$jscoverage['/loader/configs.js'].lineData[95] = 0;
  _$jscoverage['/loader/configs.js'].lineData[96] = 0;
  _$jscoverage['/loader/configs.js'].lineData[97] = 0;
  _$jscoverage['/loader/configs.js'].lineData[98] = 0;
  _$jscoverage['/loader/configs.js'].lineData[100] = 0;
  _$jscoverage['/loader/configs.js'].lineData[101] = 0;
  _$jscoverage['/loader/configs.js'].lineData[105] = 0;
  _$jscoverage['/loader/configs.js'].lineData[106] = 0;
  _$jscoverage['/loader/configs.js'].lineData[108] = 0;
  _$jscoverage['/loader/configs.js'].lineData[110] = 0;
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
  _$jscoverage['/loader/configs.js'].branchData['21'] = [];
  _$jscoverage['/loader/configs.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['24'] = [];
  _$jscoverage['/loader/configs.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['24'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['29'] = [];
  _$jscoverage['/loader/configs.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['32'] = [];
  _$jscoverage['/loader/configs.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['38'] = [];
  _$jscoverage['/loader/configs.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['39'] = [];
  _$jscoverage['/loader/configs.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['42'] = [];
  _$jscoverage['/loader/configs.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['45'] = [];
  _$jscoverage['/loader/configs.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['52'] = [];
  _$jscoverage['/loader/configs.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['59'] = [];
  _$jscoverage['/loader/configs.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['70'] = [];
  _$jscoverage['/loader/configs.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['74'] = [];
  _$jscoverage['/loader/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['85'] = [];
  _$jscoverage['/loader/configs.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['97'] = [];
  _$jscoverage['/loader/configs.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['100'] = [];
  _$jscoverage['/loader/configs.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['105'] = [];
  _$jscoverage['/loader/configs.js'].branchData['105'][1] = new BranchData();
}
_$jscoverage['/loader/configs.js'].branchData['105'][1].init(97, 28, '!S.startsWith(base, \'file:\')');
function visit370_105_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['100'][1].init(167, 17, 'simulatedLocation');
function visit369_100_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['97'][1].init(78, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit368_97_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['85'][1].init(97, 5, '!base');
function visit367_85_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['74'][1].init(140, 32, 'mod.status == Loader.Status.INIT');
function visit366_74_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['70'][1].init(40, 7, 'modules');
function visit365_70_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['59'][1].init(791, 16, 'config === false');
function visit364_59_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['52'][1].init(380, 8, 'ps[name]');
function visit363_52_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['45'][1].init(144, 20, 'cfg.base || cfg.path');
function visit362_45_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['42'][1].init(52, 15, 'cfg.name || key');
function visit361_42_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['39'][1].init(127, 6, 'config');
function visit360_39_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['38'][1].init(80, 21, 'Config.packages || {}');
function visit359_38_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['32'][2].init(210, 11, 'rules || []');
function visit358_32_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['32'][1].init(172, 29, 'Config.mappedComboRules || []');
function visit357_32_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['29'][1].init(49, 15, 'rules === false');
function visit356_29_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['24'][2].init(195, 11, 'rules || []');
function visit355_24_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['24'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['24'][1].init(162, 24, 'Config.mappedRules || []');
function visit354_24_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['21'][1].init(49, 15, 'rules === false');
function visit353_21_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['15'][2].init(236, 42, 'location && (locationHref = location.href)');
function visit352_15_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['15'][1].init(220, 58, '!S.UA.nodejs && location && (locationHref = location.href)');
function visit351_15_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/configs.js'].functionData[0]++;
  _$jscoverage['/loader/configs.js'].lineData[7]++;
  var Loader = S.Loader, Utils = Loader.Utils, host = S.Env.host, location = host.location, simulatedLocation, locationHref, configFns = S.Config.fns;
  _$jscoverage['/loader/configs.js'].lineData[15]++;
  if (visit351_15_1(!S.UA.nodejs && visit352_15_2(location && (locationHref = location.href)))) {
    _$jscoverage['/loader/configs.js'].lineData[16]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/loader/configs.js'].lineData[19]++;
  configFns.map = function(rules) {
  _$jscoverage['/loader/configs.js'].functionData[1]++;
  _$jscoverage['/loader/configs.js'].lineData[20]++;
  var Config = this.Config;
  _$jscoverage['/loader/configs.js'].lineData[21]++;
  if (visit353_21_1(rules === false)) {
    _$jscoverage['/loader/configs.js'].lineData[22]++;
    return Config.mappedRules = [];
  }
  _$jscoverage['/loader/configs.js'].lineData[24]++;
  return Config.mappedRules = (visit354_24_1(Config.mappedRules || [])).concat(visit355_24_2(rules || []));
};
  _$jscoverage['/loader/configs.js'].lineData[27]++;
  configFns.mapCombo = function(rules) {
  _$jscoverage['/loader/configs.js'].functionData[2]++;
  _$jscoverage['/loader/configs.js'].lineData[28]++;
  var Config = this.Config;
  _$jscoverage['/loader/configs.js'].lineData[29]++;
  if (visit356_29_1(rules === false)) {
    _$jscoverage['/loader/configs.js'].lineData[30]++;
    return Config.mappedComboRules = [];
  }
  _$jscoverage['/loader/configs.js'].lineData[32]++;
  return Config.mappedComboRules = (visit357_32_1(Config.mappedComboRules || [])).concat(visit358_32_2(rules || []));
};
  _$jscoverage['/loader/configs.js'].lineData[35]++;
  configFns.packages = function(config) {
  _$jscoverage['/loader/configs.js'].functionData[3]++;
  _$jscoverage['/loader/configs.js'].lineData[36]++;
  var name, Config = this.Config, ps = Config.packages = visit359_38_1(Config.packages || {});
  _$jscoverage['/loader/configs.js'].lineData[39]++;
  if (visit360_39_1(config)) {
    _$jscoverage['/loader/configs.js'].lineData[40]++;
    S.each(config, function(cfg, key) {
  _$jscoverage['/loader/configs.js'].functionData[4]++;
  _$jscoverage['/loader/configs.js'].lineData[42]++;
  name = visit361_42_1(cfg.name || key);
  _$jscoverage['/loader/configs.js'].lineData[45]++;
  var baseUri = normalizeBase(visit362_45_1(cfg.base || cfg.path));
  _$jscoverage['/loader/configs.js'].lineData[47]++;
  cfg.name = name;
  _$jscoverage['/loader/configs.js'].lineData[48]++;
  cfg.base = baseUri.toString();
  _$jscoverage['/loader/configs.js'].lineData[49]++;
  cfg.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[50]++;
  cfg.runtime = S;
  _$jscoverage['/loader/configs.js'].lineData[51]++;
  delete cfg.path;
  _$jscoverage['/loader/configs.js'].lineData[52]++;
  if (visit363_52_1(ps[name])) {
    _$jscoverage['/loader/configs.js'].lineData[53]++;
    ps[name].reset(cfg);
  } else {
    _$jscoverage['/loader/configs.js'].lineData[55]++;
    ps[name] = new Loader.Package(cfg);
  }
});
    _$jscoverage['/loader/configs.js'].lineData[58]++;
    return undefined;
  } else {
    _$jscoverage['/loader/configs.js'].lineData[59]++;
    if (visit364_59_1(config === false)) {
      _$jscoverage['/loader/configs.js'].lineData[60]++;
      Config.packages = {};
      _$jscoverage['/loader/configs.js'].lineData[62]++;
      return undefined;
    } else {
      _$jscoverage['/loader/configs.js'].lineData[64]++;
      return ps;
    }
  }
};
  _$jscoverage['/loader/configs.js'].lineData[68]++;
  configFns.modules = function(modules) {
  _$jscoverage['/loader/configs.js'].functionData[5]++;
  _$jscoverage['/loader/configs.js'].lineData[69]++;
  var self = this;
  _$jscoverage['/loader/configs.js'].lineData[70]++;
  if (visit365_70_1(modules)) {
    _$jscoverage['/loader/configs.js'].lineData[71]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/loader/configs.js'].functionData[6]++;
  _$jscoverage['/loader/configs.js'].lineData[72]++;
  var mod = Utils.createModuleInfo(self, modName, modCfg);
  _$jscoverage['/loader/configs.js'].lineData[74]++;
  if (visit366_74_1(mod.status == Loader.Status.INIT)) {
    _$jscoverage['/loader/configs.js'].lineData[75]++;
    S.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/loader/configs.js'].lineData[81]++;
  configFns.base = function(base) {
  _$jscoverage['/loader/configs.js'].functionData[7]++;
  _$jscoverage['/loader/configs.js'].lineData[82]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/loader/configs.js'].lineData[85]++;
  if (visit367_85_1(!base)) {
    _$jscoverage['/loader/configs.js'].lineData[86]++;
    return Config.base;
  }
  _$jscoverage['/loader/configs.js'].lineData[88]++;
  baseUri = normalizeBase(base);
  _$jscoverage['/loader/configs.js'].lineData[89]++;
  Config.base = baseUri.toString();
  _$jscoverage['/loader/configs.js'].lineData[90]++;
  Config.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[91]++;
  return undefined;
};
  _$jscoverage['/loader/configs.js'].lineData[94]++;
  function normalizeBase(base) {
    _$jscoverage['/loader/configs.js'].functionData[8]++;
    _$jscoverage['/loader/configs.js'].lineData[95]++;
    var baseUri;
    _$jscoverage['/loader/configs.js'].lineData[96]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/loader/configs.js'].lineData[97]++;
    if (visit368_97_1(base.charAt(base.length - 1) != '/')) {
      _$jscoverage['/loader/configs.js'].lineData[98]++;
      base += '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[100]++;
    if (visit369_100_1(simulatedLocation)) {
      _$jscoverage['/loader/configs.js'].lineData[101]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/loader/configs.js'].lineData[105]++;
      if (visit370_105_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/loader/configs.js'].lineData[106]++;
        base = 'file:' + base;
      }
      _$jscoverage['/loader/configs.js'].lineData[108]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/loader/configs.js'].lineData[110]++;
    return baseUri;
  }
})(KISSY);
