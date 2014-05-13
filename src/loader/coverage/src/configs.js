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
if (! _$jscoverage['/configs.js']) {
  _$jscoverage['/configs.js'] = {};
  _$jscoverage['/configs.js'].lineData = [];
  _$jscoverage['/configs.js'].lineData[6] = 0;
  _$jscoverage['/configs.js'].lineData[7] = 0;
  _$jscoverage['/configs.js'].lineData[16] = 0;
  _$jscoverage['/configs.js'].lineData[17] = 0;
  _$jscoverage['/configs.js'].lineData[21] = 0;
  _$jscoverage['/configs.js'].lineData[22] = 0;
  _$jscoverage['/configs.js'].lineData[26] = 0;
  _$jscoverage['/configs.js'].lineData[27] = 0;
  _$jscoverage['/configs.js'].lineData[29] = 0;
  _$jscoverage['/configs.js'].lineData[30] = 0;
  _$jscoverage['/configs.js'].lineData[31] = 0;
  _$jscoverage['/configs.js'].lineData[32] = 0;
  _$jscoverage['/configs.js'].lineData[34] = 0;
  _$jscoverage['/configs.js'].lineData[35] = 0;
  _$jscoverage['/configs.js'].lineData[37] = 0;
  _$jscoverage['/configs.js'].lineData[38] = 0;
  _$jscoverage['/configs.js'].lineData[42] = 0;
  _$jscoverage['/configs.js'].lineData[43] = 0;
  _$jscoverage['/configs.js'].lineData[45] = 0;
  _$jscoverage['/configs.js'].lineData[46] = 0;
  _$jscoverage['/configs.js'].lineData[47] = 0;
  _$jscoverage['/configs.js'].lineData[49] = 0;
  _$jscoverage['/configs.js'].lineData[52] = 0;
  _$jscoverage['/configs.js'].lineData[53] = 0;
  _$jscoverage['/configs.js'].lineData[54] = 0;
  _$jscoverage['/configs.js'].lineData[56] = 0;
  _$jscoverage['/configs.js'].lineData[59] = 0;
  _$jscoverage['/configs.js'].lineData[61] = 0;
  _$jscoverage['/configs.js'].lineData[63] = 0;
  _$jscoverage['/configs.js'].lineData[64] = 0;
  _$jscoverage['/configs.js'].lineData[66] = 0;
  _$jscoverage['/configs.js'].lineData[67] = 0;
  _$jscoverage['/configs.js'].lineData[69] = 0;
  _$jscoverage['/configs.js'].lineData[70] = 0;
  _$jscoverage['/configs.js'].lineData[71] = 0;
  _$jscoverage['/configs.js'].lineData[72] = 0;
  _$jscoverage['/configs.js'].lineData[74] = 0;
  _$jscoverage['/configs.js'].lineData[75] = 0;
  _$jscoverage['/configs.js'].lineData[77] = 0;
  _$jscoverage['/configs.js'].lineData[80] = 0;
  _$jscoverage['/configs.js'].lineData[81] = 0;
  _$jscoverage['/configs.js'].lineData[82] = 0;
  _$jscoverage['/configs.js'].lineData[85] = 0;
  _$jscoverage['/configs.js'].lineData[87] = 0;
  _$jscoverage['/configs.js'].lineData[91] = 0;
  _$jscoverage['/configs.js'].lineData[92] = 0;
  _$jscoverage['/configs.js'].lineData[93] = 0;
  _$jscoverage['/configs.js'].lineData[94] = 0;
  _$jscoverage['/configs.js'].lineData[95] = 0;
  _$jscoverage['/configs.js'].lineData[96] = 0;
  _$jscoverage['/configs.js'].lineData[98] = 0;
  _$jscoverage['/configs.js'].lineData[100] = 0;
  _$jscoverage['/configs.js'].lineData[101] = 0;
  _$jscoverage['/configs.js'].lineData[107] = 0;
  _$jscoverage['/configs.js'].lineData[108] = 0;
  _$jscoverage['/configs.js'].lineData[111] = 0;
  _$jscoverage['/configs.js'].lineData[112] = 0;
  _$jscoverage['/configs.js'].lineData[115] = 0;
  _$jscoverage['/configs.js'].lineData[121] = 0;
  _$jscoverage['/configs.js'].lineData[124] = 0;
  _$jscoverage['/configs.js'].lineData[125] = 0;
  _$jscoverage['/configs.js'].lineData[126] = 0;
  _$jscoverage['/configs.js'].lineData[127] = 0;
  _$jscoverage['/configs.js'].lineData[128] = 0;
  _$jscoverage['/configs.js'].lineData[129] = 0;
  _$jscoverage['/configs.js'].lineData[131] = 0;
  _$jscoverage['/configs.js'].lineData[135] = 0;
  _$jscoverage['/configs.js'].lineData[136] = 0;
  _$jscoverage['/configs.js'].lineData[137] = 0;
  _$jscoverage['/configs.js'].lineData[138] = 0;
  _$jscoverage['/configs.js'].lineData[140] = 0;
  _$jscoverage['/configs.js'].lineData[141] = 0;
  _$jscoverage['/configs.js'].lineData[142] = 0;
  _$jscoverage['/configs.js'].lineData[144] = 0;
  _$jscoverage['/configs.js'].lineData[147] = 0;
}
if (! _$jscoverage['/configs.js'].functionData) {
  _$jscoverage['/configs.js'].functionData = [];
  _$jscoverage['/configs.js'].functionData[0] = 0;
  _$jscoverage['/configs.js'].functionData[1] = 0;
  _$jscoverage['/configs.js'].functionData[2] = 0;
  _$jscoverage['/configs.js'].functionData[3] = 0;
  _$jscoverage['/configs.js'].functionData[4] = 0;
  _$jscoverage['/configs.js'].functionData[5] = 0;
  _$jscoverage['/configs.js'].functionData[6] = 0;
  _$jscoverage['/configs.js'].functionData[7] = 0;
  _$jscoverage['/configs.js'].functionData[8] = 0;
  _$jscoverage['/configs.js'].functionData[9] = 0;
  _$jscoverage['/configs.js'].functionData[10] = 0;
}
if (! _$jscoverage['/configs.js'].branchData) {
  _$jscoverage['/configs.js'].branchData = {};
  _$jscoverage['/configs.js'].branchData['16'] = [];
  _$jscoverage['/configs.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['37'] = [];
  _$jscoverage['/configs.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['42'] = [];
  _$jscoverage['/configs.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['46'] = [];
  _$jscoverage['/configs.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['66'] = [];
  _$jscoverage['/configs.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['69'] = [];
  _$jscoverage['/configs.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['70'] = [];
  _$jscoverage['/configs.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['71'] = [];
  _$jscoverage['/configs.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['74'] = [];
  _$jscoverage['/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['81'] = [];
  _$jscoverage['/configs.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['92'] = [];
  _$jscoverage['/configs.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['95'] = [];
  _$jscoverage['/configs.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['100'] = [];
  _$jscoverage['/configs.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['111'] = [];
  _$jscoverage['/configs.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['112'] = [];
  _$jscoverage['/configs.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['137'] = [];
  _$jscoverage['/configs.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/configs.js'].branchData['140'] = [];
  _$jscoverage['/configs.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['141'] = [];
  _$jscoverage['/configs.js'].branchData['141'][1] = new BranchData();
}
_$jscoverage['/configs.js'].branchData['141'][1].init(18, 22, 'base.charAt(0) === \'/\'');
function visit104_141_1(result) {
  _$jscoverage['/configs.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['140'][1].init(163, 12, 'locationPath');
function visit103_140_1(result) {
  _$jscoverage['/configs.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['137'][2].init(73, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit102_137_2(result) {
  _$jscoverage['/configs.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['137'][1].init(58, 51, 'isDirectory && base.charAt(base.length - 1) !== \'/\'');
function visit101_137_1(result) {
  _$jscoverage['/configs.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['112'][1].init(21, 36, 'corePackage && corePackage.getBase()');
function visit100_112_1(result) {
  _$jscoverage['/configs.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['111'][1].init(91, 5, '!base');
function visit99_111_1(result) {
  _$jscoverage['/configs.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['100'][1].init(270, 33, 'mod.status === Loader.Status.INIT');
function visit98_100_1(result) {
  _$jscoverage['/configs.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['95'][1].init(61, 3, 'url');
function visit97_95_1(result) {
  _$jscoverage['/configs.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['92'][1].init(14, 7, 'modules');
function visit96_92_1(result) {
  _$jscoverage['/configs.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['81'][1].init(656, 16, 'config === false');
function visit95_81_1(result) {
  _$jscoverage['/configs.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['74'][1].init(267, 14, 'packages[name]');
function visit94_74_1(result) {
  _$jscoverage['/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['71'][1].init(160, 4, 'base');
function visit93_71_1(result) {
  _$jscoverage['/configs.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['70'][1].init(117, 20, 'cfg.base || cfg.path');
function visit92_70_1(result) {
  _$jscoverage['/configs.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['69'][1].init(72, 15, 'cfg.name || key');
function visit91_69_1(result) {
  _$jscoverage['/configs.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['66'][1].init(90, 6, 'config');
function visit90_66_1(result) {
  _$jscoverage['/configs.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['46'][1].init(66, 41, 'Utils.startsWith(name, packageName + \'/\')');
function visit89_46_1(result) {
  _$jscoverage['/configs.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['42'][1].init(503, 20, 'name === packageName');
function visit88_42_1(result) {
  _$jscoverage['/configs.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['37'][1].init(390, 6, 'filter');
function visit87_37_1(result) {
  _$jscoverage['/configs.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['16'][1].init(258, 8, 'location');
function visit86_16_1(result) {
  _$jscoverage['/configs.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/configs.js'].functionData[0]++;
  _$jscoverage['/configs.js'].lineData[7]++;
  var Loader = S.Loader, Package = Loader.Package, Utils = Loader.Utils, host = S.Env.host, Config = S.Config, location = host.location, locationPath = '', configFns = Config.fns;
  _$jscoverage['/configs.js'].lineData[16]++;
  if (visit86_16_1(location)) {
    _$jscoverage['/configs.js'].lineData[17]++;
    locationPath = location.protocol + '//' + location.host + location.pathname;
  }
  _$jscoverage['/configs.js'].lineData[21]++;
  Config.loadModsFn = function(rs, config) {
  _$jscoverage['/configs.js'].functionData[1]++;
  _$jscoverage['/configs.js'].lineData[22]++;
  S.getScript(rs.url, config);
};
  _$jscoverage['/configs.js'].lineData[26]++;
  Config.resolveModFn = function(mod) {
  _$jscoverage['/configs.js'].functionData[2]++;
  _$jscoverage['/configs.js'].lineData[27]++;
  var name = mod.name, filter, t, url, subPath;
  _$jscoverage['/configs.js'].lineData[29]++;
  var packageInfo = mod.getPackage();
  _$jscoverage['/configs.js'].lineData[30]++;
  var packageBase = packageInfo.getBase();
  _$jscoverage['/configs.js'].lineData[31]++;
  var packageName = packageInfo.getName();
  _$jscoverage['/configs.js'].lineData[32]++;
  var extname = '.' + mod.getType();
  _$jscoverage['/configs.js'].lineData[34]++;
  name = name.replace(/\.css$/, '');
  _$jscoverage['/configs.js'].lineData[35]++;
  filter = packageInfo.filter;
  _$jscoverage['/configs.js'].lineData[37]++;
  if (visit87_37_1(filter)) {
    _$jscoverage['/configs.js'].lineData[38]++;
    filter = '-' + filter;
  }
  _$jscoverage['/configs.js'].lineData[42]++;
  if (visit88_42_1(name === packageName)) {
    _$jscoverage['/configs.js'].lineData[43]++;
    url = packageBase.substring(0, packageBase.length - 1) + filter + extname;
  } else {
    _$jscoverage['/configs.js'].lineData[45]++;
    subPath = name + filter + extname;
    _$jscoverage['/configs.js'].lineData[46]++;
    if (visit89_46_1(Utils.startsWith(name, packageName + '/'))) {
      _$jscoverage['/configs.js'].lineData[47]++;
      subPath = subPath.substring(packageName.length + 1);
    }
    _$jscoverage['/configs.js'].lineData[49]++;
    url = packageBase + subPath;
  }
  _$jscoverage['/configs.js'].lineData[52]++;
  if ((t = mod.getTag())) {
    _$jscoverage['/configs.js'].lineData[53]++;
    t += '.' + mod.getType();
    _$jscoverage['/configs.js'].lineData[54]++;
    url += '?t=' + t;
  }
  _$jscoverage['/configs.js'].lineData[56]++;
  return url;
};
  _$jscoverage['/configs.js'].lineData[59]++;
  configFns.requires = shortcut('requires');
  _$jscoverage['/configs.js'].lineData[61]++;
  configFns.alias = shortcut('alias');
  _$jscoverage['/configs.js'].lineData[63]++;
  configFns.packages = function(config) {
  _$jscoverage['/configs.js'].functionData[3]++;
  _$jscoverage['/configs.js'].lineData[64]++;
  var Config = this.Config, packages = Config.packages;
  _$jscoverage['/configs.js'].lineData[66]++;
  if (visit90_66_1(config)) {
    _$jscoverage['/configs.js'].lineData[67]++;
    Utils.each(config, function(cfg, key) {
  _$jscoverage['/configs.js'].functionData[4]++;
  _$jscoverage['/configs.js'].lineData[69]++;
  var name = cfg.name = visit91_69_1(cfg.name || key);
  _$jscoverage['/configs.js'].lineData[70]++;
  var base = visit92_70_1(cfg.base || cfg.path);
  _$jscoverage['/configs.js'].lineData[71]++;
  if (visit93_71_1(base)) {
    _$jscoverage['/configs.js'].lineData[72]++;
    cfg.base = normalizePath(base, true);
  }
  _$jscoverage['/configs.js'].lineData[74]++;
  if (visit94_74_1(packages[name])) {
    _$jscoverage['/configs.js'].lineData[75]++;
    packages[name].reset(cfg);
  } else {
    _$jscoverage['/configs.js'].lineData[77]++;
    packages[name] = new Package(cfg);
  }
});
    _$jscoverage['/configs.js'].lineData[80]++;
    return undefined;
  } else {
    _$jscoverage['/configs.js'].lineData[81]++;
    if (visit95_81_1(config === false)) {
      _$jscoverage['/configs.js'].lineData[82]++;
      Config.packages = {
  core: packages.core};
      _$jscoverage['/configs.js'].lineData[85]++;
      return undefined;
    } else {
      _$jscoverage['/configs.js'].lineData[87]++;
      return packages;
    }
  }
};
  _$jscoverage['/configs.js'].lineData[91]++;
  configFns.modules = function(modules) {
  _$jscoverage['/configs.js'].functionData[5]++;
  _$jscoverage['/configs.js'].lineData[92]++;
  if (visit96_92_1(modules)) {
    _$jscoverage['/configs.js'].lineData[93]++;
    Utils.each(modules, function(modCfg, modName) {
  _$jscoverage['/configs.js'].functionData[6]++;
  _$jscoverage['/configs.js'].lineData[94]++;
  var url = modCfg.url;
  _$jscoverage['/configs.js'].lineData[95]++;
  if (visit97_95_1(url)) {
    _$jscoverage['/configs.js'].lineData[96]++;
    modCfg.url = normalizePath(url);
  }
  _$jscoverage['/configs.js'].lineData[98]++;
  var mod = Utils.createModule(modName, modCfg);
  _$jscoverage['/configs.js'].lineData[100]++;
  if (visit98_100_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/configs.js'].lineData[101]++;
    Utils.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/configs.js'].lineData[107]++;
  configFns.base = function(base) {
  _$jscoverage['/configs.js'].functionData[7]++;
  _$jscoverage['/configs.js'].lineData[108]++;
  var self = this, corePackage = Config.packages.core;
  _$jscoverage['/configs.js'].lineData[111]++;
  if (visit99_111_1(!base)) {
    _$jscoverage['/configs.js'].lineData[112]++;
    return visit100_112_1(corePackage && corePackage.getBase());
  }
  _$jscoverage['/configs.js'].lineData[115]++;
  self.config('packages', {
  core: {
  base: base}});
  _$jscoverage['/configs.js'].lineData[121]++;
  return undefined;
};
  _$jscoverage['/configs.js'].lineData[124]++;
  function shortcut(attr) {
    _$jscoverage['/configs.js'].functionData[8]++;
    _$jscoverage['/configs.js'].lineData[125]++;
    return function(config) {
  _$jscoverage['/configs.js'].functionData[9]++;
  _$jscoverage['/configs.js'].lineData[126]++;
  var newCfg = {};
  _$jscoverage['/configs.js'].lineData[127]++;
  for (var name in config) {
    _$jscoverage['/configs.js'].lineData[128]++;
    newCfg[name] = {};
    _$jscoverage['/configs.js'].lineData[129]++;
    newCfg[name][attr] = config[name];
  }
  _$jscoverage['/configs.js'].lineData[131]++;
  S.config('modules', newCfg);
};
  }
  _$jscoverage['/configs.js'].lineData[135]++;
  function normalizePath(base, isDirectory) {
    _$jscoverage['/configs.js'].functionData[10]++;
    _$jscoverage['/configs.js'].lineData[136]++;
    base = Utils.normalizeSlash(base);
    _$jscoverage['/configs.js'].lineData[137]++;
    if (visit101_137_1(isDirectory && visit102_137_2(base.charAt(base.length - 1) !== '/'))) {
      _$jscoverage['/configs.js'].lineData[138]++;
      base += '/';
    }
    _$jscoverage['/configs.js'].lineData[140]++;
    if (visit103_140_1(locationPath)) {
      _$jscoverage['/configs.js'].lineData[141]++;
      if (visit104_141_1(base.charAt(0) === '/')) {
        _$jscoverage['/configs.js'].lineData[142]++;
        base = location.protocol + '//' + location.host + base;
      } else {
        _$jscoverage['/configs.js'].lineData[144]++;
        base = Utils.normalizePath(locationPath, base);
      }
    }
    _$jscoverage['/configs.js'].lineData[147]++;
    return base;
  }
})(KISSY);
