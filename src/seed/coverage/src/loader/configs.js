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
  _$jscoverage['/loader/configs.js'].lineData[26] = 0;
  _$jscoverage['/loader/configs.js'].lineData[28] = 0;
  _$jscoverage['/loader/configs.js'].lineData[31] = 0;
  _$jscoverage['/loader/configs.js'].lineData[32] = 0;
  _$jscoverage['/loader/configs.js'].lineData[33] = 0;
  _$jscoverage['/loader/configs.js'].lineData[34] = 0;
  _$jscoverage['/loader/configs.js'].lineData[36] = 0;
  _$jscoverage['/loader/configs.js'].lineData[39] = 0;
  _$jscoverage['/loader/configs.js'].lineData[40] = 0;
  _$jscoverage['/loader/configs.js'].lineData[43] = 0;
  _$jscoverage['/loader/configs.js'].lineData[44] = 0;
  _$jscoverage['/loader/configs.js'].lineData[46] = 0;
  _$jscoverage['/loader/configs.js'].lineData[49] = 0;
  _$jscoverage['/loader/configs.js'].lineData[51] = 0;
  _$jscoverage['/loader/configs.js'].lineData[52] = 0;
  _$jscoverage['/loader/configs.js'].lineData[53] = 0;
  _$jscoverage['/loader/configs.js'].lineData[54] = 0;
  _$jscoverage['/loader/configs.js'].lineData[55] = 0;
  _$jscoverage['/loader/configs.js'].lineData[56] = 0;
  _$jscoverage['/loader/configs.js'].lineData[57] = 0;
  _$jscoverage['/loader/configs.js'].lineData[59] = 0;
  _$jscoverage['/loader/configs.js'].lineData[62] = 0;
  _$jscoverage['/loader/configs.js'].lineData[63] = 0;
  _$jscoverage['/loader/configs.js'].lineData[64] = 0;
  _$jscoverage['/loader/configs.js'].lineData[66] = 0;
  _$jscoverage['/loader/configs.js'].lineData[68] = 0;
  _$jscoverage['/loader/configs.js'].lineData[72] = 0;
  _$jscoverage['/loader/configs.js'].lineData[73] = 0;
  _$jscoverage['/loader/configs.js'].lineData[74] = 0;
  _$jscoverage['/loader/configs.js'].lineData[75] = 0;
  _$jscoverage['/loader/configs.js'].lineData[76] = 0;
  _$jscoverage['/loader/configs.js'].lineData[78] = 0;
  _$jscoverage['/loader/configs.js'].lineData[79] = 0;
  _$jscoverage['/loader/configs.js'].lineData[85] = 0;
  _$jscoverage['/loader/configs.js'].lineData[86] = 0;
  _$jscoverage['/loader/configs.js'].lineData[89] = 0;
  _$jscoverage['/loader/configs.js'].lineData[90] = 0;
  _$jscoverage['/loader/configs.js'].lineData[92] = 0;
  _$jscoverage['/loader/configs.js'].lineData[93] = 0;
  _$jscoverage['/loader/configs.js'].lineData[94] = 0;
  _$jscoverage['/loader/configs.js'].lineData[95] = 0;
  _$jscoverage['/loader/configs.js'].lineData[98] = 0;
  _$jscoverage['/loader/configs.js'].lineData[99] = 0;
  _$jscoverage['/loader/configs.js'].lineData[100] = 0;
  _$jscoverage['/loader/configs.js'].lineData[101] = 0;
  _$jscoverage['/loader/configs.js'].lineData[102] = 0;
  _$jscoverage['/loader/configs.js'].lineData[104] = 0;
  _$jscoverage['/loader/configs.js'].lineData[105] = 0;
  _$jscoverage['/loader/configs.js'].lineData[109] = 0;
  _$jscoverage['/loader/configs.js'].lineData[110] = 0;
  _$jscoverage['/loader/configs.js'].lineData[112] = 0;
  _$jscoverage['/loader/configs.js'].lineData[114] = 0;
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
  _$jscoverage['/loader/configs.js'].functionData[9] = 0;
}
if (! _$jscoverage['/loader/configs.js'].branchData) {
  _$jscoverage['/loader/configs.js'].branchData = {};
  _$jscoverage['/loader/configs.js'].branchData['15'] = [];
  _$jscoverage['/loader/configs.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['25'] = [];
  _$jscoverage['/loader/configs.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['28'] = [];
  _$jscoverage['/loader/configs.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['33'] = [];
  _$jscoverage['/loader/configs.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['36'] = [];
  _$jscoverage['/loader/configs.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['42'] = [];
  _$jscoverage['/loader/configs.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['43'] = [];
  _$jscoverage['/loader/configs.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['46'] = [];
  _$jscoverage['/loader/configs.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['49'] = [];
  _$jscoverage['/loader/configs.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['56'] = [];
  _$jscoverage['/loader/configs.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['63'] = [];
  _$jscoverage['/loader/configs.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['74'] = [];
  _$jscoverage['/loader/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['78'] = [];
  _$jscoverage['/loader/configs.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['89'] = [];
  _$jscoverage['/loader/configs.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['101'] = [];
  _$jscoverage['/loader/configs.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['104'] = [];
  _$jscoverage['/loader/configs.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['109'] = [];
  _$jscoverage['/loader/configs.js'].branchData['109'][1] = new BranchData();
}
_$jscoverage['/loader/configs.js'].branchData['109'][1].init(97, 28, '!S.startsWith(base, \'file:\')');
function visit372_109_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['104'][1].init(167, 17, 'simulatedLocation');
function visit371_104_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['101'][1].init(78, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit370_101_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['89'][1].init(97, 5, '!base');
function visit369_89_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['78'][1].init(140, 32, 'mod.status == Loader.Status.INIT');
function visit368_78_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['74'][1].init(40, 7, 'modules');
function visit367_74_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['63'][1].init(791, 16, 'config === false');
function visit366_63_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['56'][1].init(380, 8, 'ps[name]');
function visit365_56_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['49'][1].init(144, 20, 'cfg.base || cfg.path');
function visit364_49_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['46'][1].init(52, 15, 'cfg.name || key');
function visit363_46_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['43'][1].init(127, 6, 'config');
function visit362_43_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['42'][1].init(80, 21, 'Config.packages || {}');
function visit361_42_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['36'][2].init(210, 11, 'rules || []');
function visit360_36_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['36'][1].init(172, 29, 'Config.mappedComboRules || []');
function visit359_36_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['33'][1].init(49, 15, 'rules === false');
function visit358_33_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['28'][2].init(195, 11, 'rules || []');
function visit357_28_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['28'][1].init(162, 24, 'Config.mappedRules || []');
function visit356_28_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['25'][1].init(49, 15, 'rules === false');
function visit355_25_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['15'][2].init(236, 42, 'location && (locationHref = location.href)');
function visit354_15_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['15'][1].init(220, 58, '!S.UA.nodejs && location && (locationHref = location.href)');
function visit353_15_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/configs.js'].functionData[0]++;
  _$jscoverage['/loader/configs.js'].lineData[7]++;
  var Loader = S.Loader, Utils = Loader.Utils, host = S.Env.host, location = host.location, simulatedLocation, locationHref, configFns = S.Config.fns;
  _$jscoverage['/loader/configs.js'].lineData[15]++;
  if (visit353_15_1(!S.UA.nodejs && visit354_15_2(location && (locationHref = location.href)))) {
    _$jscoverage['/loader/configs.js'].lineData[16]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/loader/configs.js'].lineData[19]++;
  S.Config.loadModsFn = function(rs, config) {
  _$jscoverage['/loader/configs.js'].functionData[1]++;
  _$jscoverage['/loader/configs.js'].lineData[20]++;
  S.getScript(rs.fullpath, config);
};
  _$jscoverage['/loader/configs.js'].lineData[23]++;
  configFns.map = function(rules) {
  _$jscoverage['/loader/configs.js'].functionData[2]++;
  _$jscoverage['/loader/configs.js'].lineData[24]++;
  var Config = this.Config;
  _$jscoverage['/loader/configs.js'].lineData[25]++;
  if (visit355_25_1(rules === false)) {
    _$jscoverage['/loader/configs.js'].lineData[26]++;
    return Config.mappedRules = [];
  }
  _$jscoverage['/loader/configs.js'].lineData[28]++;
  return Config.mappedRules = (visit356_28_1(Config.mappedRules || [])).concat(visit357_28_2(rules || []));
};
  _$jscoverage['/loader/configs.js'].lineData[31]++;
  configFns.mapCombo = function(rules) {
  _$jscoverage['/loader/configs.js'].functionData[3]++;
  _$jscoverage['/loader/configs.js'].lineData[32]++;
  var Config = this.Config;
  _$jscoverage['/loader/configs.js'].lineData[33]++;
  if (visit358_33_1(rules === false)) {
    _$jscoverage['/loader/configs.js'].lineData[34]++;
    return Config.mappedComboRules = [];
  }
  _$jscoverage['/loader/configs.js'].lineData[36]++;
  return Config.mappedComboRules = (visit359_36_1(Config.mappedComboRules || [])).concat(visit360_36_2(rules || []));
};
  _$jscoverage['/loader/configs.js'].lineData[39]++;
  configFns.packages = function(config) {
  _$jscoverage['/loader/configs.js'].functionData[4]++;
  _$jscoverage['/loader/configs.js'].lineData[40]++;
  var name, Config = this.Config, ps = Config.packages = visit361_42_1(Config.packages || {});
  _$jscoverage['/loader/configs.js'].lineData[43]++;
  if (visit362_43_1(config)) {
    _$jscoverage['/loader/configs.js'].lineData[44]++;
    S.each(config, function(cfg, key) {
  _$jscoverage['/loader/configs.js'].functionData[5]++;
  _$jscoverage['/loader/configs.js'].lineData[46]++;
  name = visit363_46_1(cfg.name || key);
  _$jscoverage['/loader/configs.js'].lineData[49]++;
  var baseUri = normalizeBase(visit364_49_1(cfg.base || cfg.path));
  _$jscoverage['/loader/configs.js'].lineData[51]++;
  cfg.name = name;
  _$jscoverage['/loader/configs.js'].lineData[52]++;
  cfg.base = baseUri.toString();
  _$jscoverage['/loader/configs.js'].lineData[53]++;
  cfg.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[54]++;
  cfg.runtime = S;
  _$jscoverage['/loader/configs.js'].lineData[55]++;
  delete cfg.path;
  _$jscoverage['/loader/configs.js'].lineData[56]++;
  if (visit365_56_1(ps[name])) {
    _$jscoverage['/loader/configs.js'].lineData[57]++;
    ps[name].reset(cfg);
  } else {
    _$jscoverage['/loader/configs.js'].lineData[59]++;
    ps[name] = new Loader.Package(cfg);
  }
});
    _$jscoverage['/loader/configs.js'].lineData[62]++;
    return undefined;
  } else {
    _$jscoverage['/loader/configs.js'].lineData[63]++;
    if (visit366_63_1(config === false)) {
      _$jscoverage['/loader/configs.js'].lineData[64]++;
      Config.packages = {};
      _$jscoverage['/loader/configs.js'].lineData[66]++;
      return undefined;
    } else {
      _$jscoverage['/loader/configs.js'].lineData[68]++;
      return ps;
    }
  }
};
  _$jscoverage['/loader/configs.js'].lineData[72]++;
  configFns.modules = function(modules) {
  _$jscoverage['/loader/configs.js'].functionData[6]++;
  _$jscoverage['/loader/configs.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/loader/configs.js'].lineData[74]++;
  if (visit367_74_1(modules)) {
    _$jscoverage['/loader/configs.js'].lineData[75]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/loader/configs.js'].functionData[7]++;
  _$jscoverage['/loader/configs.js'].lineData[76]++;
  var mod = Utils.createModuleInfo(self, modName, modCfg);
  _$jscoverage['/loader/configs.js'].lineData[78]++;
  if (visit368_78_1(mod.status == Loader.Status.INIT)) {
    _$jscoverage['/loader/configs.js'].lineData[79]++;
    S.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/loader/configs.js'].lineData[85]++;
  configFns.base = function(base) {
  _$jscoverage['/loader/configs.js'].functionData[8]++;
  _$jscoverage['/loader/configs.js'].lineData[86]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/loader/configs.js'].lineData[89]++;
  if (visit369_89_1(!base)) {
    _$jscoverage['/loader/configs.js'].lineData[90]++;
    return Config.base;
  }
  _$jscoverage['/loader/configs.js'].lineData[92]++;
  baseUri = normalizeBase(base);
  _$jscoverage['/loader/configs.js'].lineData[93]++;
  Config.base = baseUri.toString();
  _$jscoverage['/loader/configs.js'].lineData[94]++;
  Config.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[95]++;
  return undefined;
};
  _$jscoverage['/loader/configs.js'].lineData[98]++;
  function normalizeBase(base) {
    _$jscoverage['/loader/configs.js'].functionData[9]++;
    _$jscoverage['/loader/configs.js'].lineData[99]++;
    var baseUri;
    _$jscoverage['/loader/configs.js'].lineData[100]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/loader/configs.js'].lineData[101]++;
    if (visit370_101_1(base.charAt(base.length - 1) != '/')) {
      _$jscoverage['/loader/configs.js'].lineData[102]++;
      base += '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[104]++;
    if (visit371_104_1(simulatedLocation)) {
      _$jscoverage['/loader/configs.js'].lineData[105]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/loader/configs.js'].lineData[109]++;
      if (visit372_109_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/loader/configs.js'].lineData[110]++;
        base = 'file:' + base;
      }
      _$jscoverage['/loader/configs.js'].lineData[112]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/loader/configs.js'].lineData[114]++;
    return baseUri;
  }
})(KISSY);
