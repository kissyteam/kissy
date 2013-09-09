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
  _$jscoverage['/loader/configs.js'].lineData[8] = 0;
  _$jscoverage['/loader/configs.js'].lineData[16] = 0;
  _$jscoverage['/loader/configs.js'].lineData[17] = 0;
  _$jscoverage['/loader/configs.js'].lineData[31] = 0;
  _$jscoverage['/loader/configs.js'].lineData[32] = 0;
  _$jscoverage['/loader/configs.js'].lineData[33] = 0;
  _$jscoverage['/loader/configs.js'].lineData[34] = 0;
  _$jscoverage['/loader/configs.js'].lineData[36] = 0;
  _$jscoverage['/loader/configs.js'].lineData[39] = 0;
  _$jscoverage['/loader/configs.js'].lineData[40] = 0;
  _$jscoverage['/loader/configs.js'].lineData[41] = 0;
  _$jscoverage['/loader/configs.js'].lineData[42] = 0;
  _$jscoverage['/loader/configs.js'].lineData[44] = 0;
  _$jscoverage['/loader/configs.js'].lineData[54] = 0;
  _$jscoverage['/loader/configs.js'].lineData[55] = 0;
  _$jscoverage['/loader/configs.js'].lineData[58] = 0;
  _$jscoverage['/loader/configs.js'].lineData[59] = 0;
  _$jscoverage['/loader/configs.js'].lineData[61] = 0;
  _$jscoverage['/loader/configs.js'].lineData[64] = 0;
  _$jscoverage['/loader/configs.js'].lineData[66] = 0;
  _$jscoverage['/loader/configs.js'].lineData[67] = 0;
  _$jscoverage['/loader/configs.js'].lineData[68] = 0;
  _$jscoverage['/loader/configs.js'].lineData[69] = 0;
  _$jscoverage['/loader/configs.js'].lineData[70] = 0;
  _$jscoverage['/loader/configs.js'].lineData[71] = 0;
  _$jscoverage['/loader/configs.js'].lineData[72] = 0;
  _$jscoverage['/loader/configs.js'].lineData[74] = 0;
  _$jscoverage['/loader/configs.js'].lineData[77] = 0;
  _$jscoverage['/loader/configs.js'].lineData[78] = 0;
  _$jscoverage['/loader/configs.js'].lineData[79] = 0;
  _$jscoverage['/loader/configs.js'].lineData[81] = 0;
  _$jscoverage['/loader/configs.js'].lineData[83] = 0;
  _$jscoverage['/loader/configs.js'].lineData[114] = 0;
  _$jscoverage['/loader/configs.js'].lineData[115] = 0;
  _$jscoverage['/loader/configs.js'].lineData[117] = 0;
  _$jscoverage['/loader/configs.js'].lineData[118] = 0;
  _$jscoverage['/loader/configs.js'].lineData[119] = 0;
  _$jscoverage['/loader/configs.js'].lineData[120] = 0;
  _$jscoverage['/loader/configs.js'].lineData[128] = 0;
  _$jscoverage['/loader/configs.js'].lineData[129] = 0;
  _$jscoverage['/loader/configs.js'].lineData[132] = 0;
  _$jscoverage['/loader/configs.js'].lineData[133] = 0;
  _$jscoverage['/loader/configs.js'].lineData[135] = 0;
  _$jscoverage['/loader/configs.js'].lineData[136] = 0;
  _$jscoverage['/loader/configs.js'].lineData[137] = 0;
  _$jscoverage['/loader/configs.js'].lineData[138] = 0;
  _$jscoverage['/loader/configs.js'].lineData[142] = 0;
  _$jscoverage['/loader/configs.js'].lineData[143] = 0;
  _$jscoverage['/loader/configs.js'].lineData[144] = 0;
  _$jscoverage['/loader/configs.js'].lineData[145] = 0;
  _$jscoverage['/loader/configs.js'].lineData[146] = 0;
  _$jscoverage['/loader/configs.js'].lineData[148] = 0;
  _$jscoverage['/loader/configs.js'].lineData[149] = 0;
  _$jscoverage['/loader/configs.js'].lineData[153] = 0;
  _$jscoverage['/loader/configs.js'].lineData[154] = 0;
  _$jscoverage['/loader/configs.js'].lineData[156] = 0;
  _$jscoverage['/loader/configs.js'].lineData[158] = 0;
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
  _$jscoverage['/loader/configs.js'].branchData['16'] = [];
  _$jscoverage['/loader/configs.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['16'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['33'] = [];
  _$jscoverage['/loader/configs.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['36'] = [];
  _$jscoverage['/loader/configs.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['41'] = [];
  _$jscoverage['/loader/configs.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['44'] = [];
  _$jscoverage['/loader/configs.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['57'] = [];
  _$jscoverage['/loader/configs.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['58'] = [];
  _$jscoverage['/loader/configs.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['61'] = [];
  _$jscoverage['/loader/configs.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['64'] = [];
  _$jscoverage['/loader/configs.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['71'] = [];
  _$jscoverage['/loader/configs.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['78'] = [];
  _$jscoverage['/loader/configs.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['117'] = [];
  _$jscoverage['/loader/configs.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['132'] = [];
  _$jscoverage['/loader/configs.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['145'] = [];
  _$jscoverage['/loader/configs.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['148'] = [];
  _$jscoverage['/loader/configs.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['153'] = [];
  _$jscoverage['/loader/configs.js'].branchData['153'][1] = new BranchData();
}
_$jscoverage['/loader/configs.js'].branchData['153'][1].init(97, 28, '!S.startsWith(base, \'file:\')');
function visit352_153_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['148'][1].init(167, 17, 'simulatedLocation');
function visit351_148_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['145'][1].init(78, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit350_145_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['132'][1].init(97, 5, '!base');
function visit349_132_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['117'][1].init(69, 7, 'modules');
function visit348_117_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['78'][1].init(787, 14, 'cfgs === false');
function visit347_78_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['71'][1].init(380, 8, 'ps[name]');
function visit346_71_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['64'][1].init(144, 20, 'cfg.base || cfg.path');
function visit345_64_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['61'][1].init(52, 15, 'cfg.name || key');
function visit344_61_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['58'][1].init(127, 4, 'cfgs');
function visit343_58_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['57'][1].init(80, 21, 'Config.packages || {}');
function visit342_57_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['44'][2].init(210, 11, 'rules || []');
function visit341_44_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['44'][1].init(172, 29, 'Config.mappedComboRules || []');
function visit340_44_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['41'][1].init(49, 15, 'rules === false');
function visit339_41_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['36'][2].init(195, 11, 'rules || []');
function visit338_36_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['36'][1].init(162, 24, 'Config.mappedRules || []');
function visit337_36_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['33'][1].init(49, 15, 'rules === false');
function visit336_33_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['16'][2].init(238, 42, 'location && (locationHref = location.href)');
function visit335_16_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['16'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['16'][1].init(222, 58, '!S.UA.nodejs && location && (locationHref = location.href)');
function visit334_16_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/configs.js'].functionData[0]++;
  _$jscoverage['/loader/configs.js'].lineData[8]++;
  var Loader = S.Loader, Utils = Loader.Utils, host = S.Env.host, location = host.location, simulatedLocation, locationHref, configFns = S.Config.fns;
  _$jscoverage['/loader/configs.js'].lineData[16]++;
  if (visit334_16_1(!S.UA.nodejs && visit335_16_2(location && (locationHref = location.href)))) {
    _$jscoverage['/loader/configs.js'].lineData[17]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/loader/configs.js'].lineData[31]++;
  configFns.map = function(rules) {
  _$jscoverage['/loader/configs.js'].functionData[1]++;
  _$jscoverage['/loader/configs.js'].lineData[32]++;
  var Config = this.Config;
  _$jscoverage['/loader/configs.js'].lineData[33]++;
  if (visit336_33_1(rules === false)) {
    _$jscoverage['/loader/configs.js'].lineData[34]++;
    return Config.mappedRules = [];
  }
  _$jscoverage['/loader/configs.js'].lineData[36]++;
  return Config.mappedRules = (visit337_36_1(Config.mappedRules || [])).concat(visit338_36_2(rules || []));
};
  _$jscoverage['/loader/configs.js'].lineData[39]++;
  configFns.mapCombo = function(rules) {
  _$jscoverage['/loader/configs.js'].functionData[2]++;
  _$jscoverage['/loader/configs.js'].lineData[40]++;
  var Config = this.Config;
  _$jscoverage['/loader/configs.js'].lineData[41]++;
  if (visit339_41_1(rules === false)) {
    _$jscoverage['/loader/configs.js'].lineData[42]++;
    return Config.mappedComboRules = [];
  }
  _$jscoverage['/loader/configs.js'].lineData[44]++;
  return Config.mappedComboRules = (visit340_44_1(Config.mappedComboRules || [])).concat(visit341_44_2(rules || []));
};
  _$jscoverage['/loader/configs.js'].lineData[54]++;
  configFns.packages = function(cfgs) {
  _$jscoverage['/loader/configs.js'].functionData[3]++;
  _$jscoverage['/loader/configs.js'].lineData[55]++;
  var name, Config = this.Config, ps = Config.packages = visit342_57_1(Config.packages || {});
  _$jscoverage['/loader/configs.js'].lineData[58]++;
  if (visit343_58_1(cfgs)) {
    _$jscoverage['/loader/configs.js'].lineData[59]++;
    S.each(cfgs, function(cfg, key) {
  _$jscoverage['/loader/configs.js'].functionData[4]++;
  _$jscoverage['/loader/configs.js'].lineData[61]++;
  name = visit344_61_1(cfg.name || key);
  _$jscoverage['/loader/configs.js'].lineData[64]++;
  var baseUri = normalizeBase(visit345_64_1(cfg.base || cfg.path));
  _$jscoverage['/loader/configs.js'].lineData[66]++;
  cfg.name = name;
  _$jscoverage['/loader/configs.js'].lineData[67]++;
  cfg.base = baseUri.toString();
  _$jscoverage['/loader/configs.js'].lineData[68]++;
  cfg.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[69]++;
  cfg.runtime = S;
  _$jscoverage['/loader/configs.js'].lineData[70]++;
  delete cfg.path;
  _$jscoverage['/loader/configs.js'].lineData[71]++;
  if (visit346_71_1(ps[name])) {
    _$jscoverage['/loader/configs.js'].lineData[72]++;
    ps[name].reset(cfg);
  } else {
    _$jscoverage['/loader/configs.js'].lineData[74]++;
    ps[name] = new Loader.Package(cfg);
  }
});
    _$jscoverage['/loader/configs.js'].lineData[77]++;
    return undefined;
  } else {
    _$jscoverage['/loader/configs.js'].lineData[78]++;
    if (visit347_78_1(cfgs === false)) {
      _$jscoverage['/loader/configs.js'].lineData[79]++;
      Config.packages = {};
      _$jscoverage['/loader/configs.js'].lineData[81]++;
      return undefined;
    } else {
      _$jscoverage['/loader/configs.js'].lineData[83]++;
      return ps;
    }
  }
};
  _$jscoverage['/loader/configs.js'].lineData[114]++;
  configFns.modules = function(modules) {
  _$jscoverage['/loader/configs.js'].functionData[5]++;
  _$jscoverage['/loader/configs.js'].lineData[115]++;
  var self = this, Env = self.Env;
  _$jscoverage['/loader/configs.js'].lineData[117]++;
  if (visit348_117_1(modules)) {
    _$jscoverage['/loader/configs.js'].lineData[118]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/loader/configs.js'].functionData[6]++;
  _$jscoverage['/loader/configs.js'].lineData[119]++;
  Utils.createModuleInfo(self, modName, modCfg);
  _$jscoverage['/loader/configs.js'].lineData[120]++;
  S.mix(Env.mods[modName], modCfg);
});
  }
};
  _$jscoverage['/loader/configs.js'].lineData[128]++;
  configFns.base = function(base) {
  _$jscoverage['/loader/configs.js'].functionData[7]++;
  _$jscoverage['/loader/configs.js'].lineData[129]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/loader/configs.js'].lineData[132]++;
  if (visit349_132_1(!base)) {
    _$jscoverage['/loader/configs.js'].lineData[133]++;
    return Config.base;
  }
  _$jscoverage['/loader/configs.js'].lineData[135]++;
  baseUri = normalizeBase(base);
  _$jscoverage['/loader/configs.js'].lineData[136]++;
  Config.base = baseUri.toString();
  _$jscoverage['/loader/configs.js'].lineData[137]++;
  Config.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[138]++;
  return undefined;
};
  _$jscoverage['/loader/configs.js'].lineData[142]++;
  function normalizeBase(base) {
    _$jscoverage['/loader/configs.js'].functionData[8]++;
    _$jscoverage['/loader/configs.js'].lineData[143]++;
    var baseUri;
    _$jscoverage['/loader/configs.js'].lineData[144]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/loader/configs.js'].lineData[145]++;
    if (visit350_145_1(base.charAt(base.length - 1) != '/')) {
      _$jscoverage['/loader/configs.js'].lineData[146]++;
      base += '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[148]++;
    if (visit351_148_1(simulatedLocation)) {
      _$jscoverage['/loader/configs.js'].lineData[149]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/loader/configs.js'].lineData[153]++;
      if (visit352_153_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/loader/configs.js'].lineData[154]++;
        base = 'file:' + base;
      }
      _$jscoverage['/loader/configs.js'].lineData[156]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/loader/configs.js'].lineData[158]++;
    return baseUri;
  }
})(KISSY);
