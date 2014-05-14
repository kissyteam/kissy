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
  _$jscoverage['/configs.js'].lineData[31] = 0;
  _$jscoverage['/configs.js'].lineData[32] = 0;
  _$jscoverage['/configs.js'].lineData[33] = 0;
  _$jscoverage['/configs.js'].lineData[34] = 0;
  _$jscoverage['/configs.js'].lineData[36] = 0;
  _$jscoverage['/configs.js'].lineData[38] = 0;
  _$jscoverage['/configs.js'].lineData[39] = 0;
  _$jscoverage['/configs.js'].lineData[41] = 0;
  _$jscoverage['/configs.js'].lineData[42] = 0;
  _$jscoverage['/configs.js'].lineData[45] = 0;
  _$jscoverage['/configs.js'].lineData[49] = 0;
  _$jscoverage['/configs.js'].lineData[50] = 0;
  _$jscoverage['/configs.js'].lineData[51] = 0;
  _$jscoverage['/configs.js'].lineData[54] = 0;
  _$jscoverage['/configs.js'].lineData[56] = 0;
  _$jscoverage['/configs.js'].lineData[57] = 0;
  _$jscoverage['/configs.js'].lineData[60] = 0;
  _$jscoverage['/configs.js'].lineData[61] = 0;
  _$jscoverage['/configs.js'].lineData[62] = 0;
  _$jscoverage['/configs.js'].lineData[64] = 0;
  _$jscoverage['/configs.js'].lineData[67] = 0;
  _$jscoverage['/configs.js'].lineData[69] = 0;
  _$jscoverage['/configs.js'].lineData[71] = 0;
  _$jscoverage['/configs.js'].lineData[72] = 0;
  _$jscoverage['/configs.js'].lineData[74] = 0;
  _$jscoverage['/configs.js'].lineData[75] = 0;
  _$jscoverage['/configs.js'].lineData[77] = 0;
  _$jscoverage['/configs.js'].lineData[78] = 0;
  _$jscoverage['/configs.js'].lineData[79] = 0;
  _$jscoverage['/configs.js'].lineData[80] = 0;
  _$jscoverage['/configs.js'].lineData[82] = 0;
  _$jscoverage['/configs.js'].lineData[83] = 0;
  _$jscoverage['/configs.js'].lineData[85] = 0;
  _$jscoverage['/configs.js'].lineData[88] = 0;
  _$jscoverage['/configs.js'].lineData[89] = 0;
  _$jscoverage['/configs.js'].lineData[90] = 0;
  _$jscoverage['/configs.js'].lineData[93] = 0;
  _$jscoverage['/configs.js'].lineData[95] = 0;
  _$jscoverage['/configs.js'].lineData[99] = 0;
  _$jscoverage['/configs.js'].lineData[100] = 0;
  _$jscoverage['/configs.js'].lineData[101] = 0;
  _$jscoverage['/configs.js'].lineData[102] = 0;
  _$jscoverage['/configs.js'].lineData[103] = 0;
  _$jscoverage['/configs.js'].lineData[104] = 0;
  _$jscoverage['/configs.js'].lineData[106] = 0;
  _$jscoverage['/configs.js'].lineData[108] = 0;
  _$jscoverage['/configs.js'].lineData[109] = 0;
  _$jscoverage['/configs.js'].lineData[115] = 0;
  _$jscoverage['/configs.js'].lineData[116] = 0;
  _$jscoverage['/configs.js'].lineData[119] = 0;
  _$jscoverage['/configs.js'].lineData[120] = 0;
  _$jscoverage['/configs.js'].lineData[123] = 0;
  _$jscoverage['/configs.js'].lineData[129] = 0;
  _$jscoverage['/configs.js'].lineData[132] = 0;
  _$jscoverage['/configs.js'].lineData[133] = 0;
  _$jscoverage['/configs.js'].lineData[134] = 0;
  _$jscoverage['/configs.js'].lineData[135] = 0;
  _$jscoverage['/configs.js'].lineData[136] = 0;
  _$jscoverage['/configs.js'].lineData[137] = 0;
  _$jscoverage['/configs.js'].lineData[139] = 0;
  _$jscoverage['/configs.js'].lineData[143] = 0;
  _$jscoverage['/configs.js'].lineData[144] = 0;
  _$jscoverage['/configs.js'].lineData[145] = 0;
  _$jscoverage['/configs.js'].lineData[146] = 0;
  _$jscoverage['/configs.js'].lineData[148] = 0;
  _$jscoverage['/configs.js'].lineData[149] = 0;
  _$jscoverage['/configs.js'].lineData[150] = 0;
  _$jscoverage['/configs.js'].lineData[152] = 0;
  _$jscoverage['/configs.js'].lineData[155] = 0;
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
  _$jscoverage['/configs.js'].branchData['36'] = [];
  _$jscoverage['/configs.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['41'] = [];
  _$jscoverage['/configs.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['49'] = [];
  _$jscoverage['/configs.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['51'] = [];
  _$jscoverage['/configs.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['74'] = [];
  _$jscoverage['/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['77'] = [];
  _$jscoverage['/configs.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['78'] = [];
  _$jscoverage['/configs.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['79'] = [];
  _$jscoverage['/configs.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['82'] = [];
  _$jscoverage['/configs.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['89'] = [];
  _$jscoverage['/configs.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['100'] = [];
  _$jscoverage['/configs.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['103'] = [];
  _$jscoverage['/configs.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['108'] = [];
  _$jscoverage['/configs.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['119'] = [];
  _$jscoverage['/configs.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['120'] = [];
  _$jscoverage['/configs.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['145'] = [];
  _$jscoverage['/configs.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/configs.js'].branchData['148'] = [];
  _$jscoverage['/configs.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['149'] = [];
  _$jscoverage['/configs.js'].branchData['149'][1] = new BranchData();
}
_$jscoverage['/configs.js'].branchData['149'][1].init(18, 22, 'base.charAt(0) === \'/\'');
function visit105_149_1(result) {
  _$jscoverage['/configs.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['148'][1].init(163, 12, 'locationPath');
function visit104_148_1(result) {
  _$jscoverage['/configs.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['145'][2].init(73, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit103_145_2(result) {
  _$jscoverage['/configs.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['145'][1].init(58, 51, 'isDirectory && base.charAt(base.length - 1) !== \'/\'');
function visit102_145_1(result) {
  _$jscoverage['/configs.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['120'][1].init(21, 36, 'corePackage && corePackage.getBase()');
function visit101_120_1(result) {
  _$jscoverage['/configs.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['119'][1].init(91, 5, '!base');
function visit100_119_1(result) {
  _$jscoverage['/configs.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['108'][1].init(270, 33, 'mod.status === Loader.Status.INIT');
function visit99_108_1(result) {
  _$jscoverage['/configs.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['103'][1].init(61, 3, 'url');
function visit98_103_1(result) {
  _$jscoverage['/configs.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['100'][1].init(14, 7, 'modules');
function visit97_100_1(result) {
  _$jscoverage['/configs.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['89'][1].init(656, 16, 'config === false');
function visit96_89_1(result) {
  _$jscoverage['/configs.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['82'][1].init(267, 14, 'packages[name]');
function visit95_82_1(result) {
  _$jscoverage['/configs.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['79'][1].init(160, 4, 'base');
function visit94_79_1(result) {
  _$jscoverage['/configs.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['78'][1].init(117, 20, 'cfg.base || cfg.path');
function visit93_78_1(result) {
  _$jscoverage['/configs.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['77'][1].init(72, 15, 'cfg.name || key');
function visit92_77_1(result) {
  _$jscoverage['/configs.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['74'][1].init(90, 6, 'config');
function visit91_74_1(result) {
  _$jscoverage['/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['51'][1].init(754, 20, 'name === packageName');
function visit90_51_1(result) {
  _$jscoverage['/configs.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['49'][1].init(665, 22, 'packageName === \'core\'');
function visit89_49_1(result) {
  _$jscoverage['/configs.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['41'][1].init(149, 6, 'filter');
function visit88_41_1(result) {
  _$jscoverage['/configs.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['36'][1].init(339, 8, '!subPath');
function visit87_36_1(result) {
  _$jscoverage['/configs.js'].branchData['36'][1].ranCondition(result);
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
  var name = mod.name, filter, t, url, subPath = mod.path;
  _$jscoverage['/configs.js'].lineData[31]++;
  var packageInfo = mod.getPackage();
  _$jscoverage['/configs.js'].lineData[32]++;
  var packageBase = packageInfo.getBase();
  _$jscoverage['/configs.js'].lineData[33]++;
  var packageName = packageInfo.name;
  _$jscoverage['/configs.js'].lineData[34]++;
  var extname = '.' + mod.getType();
  _$jscoverage['/configs.js'].lineData[36]++;
  if (visit87_36_1(!subPath)) {
    _$jscoverage['/configs.js'].lineData[38]++;
    name = name.replace(/\.css$/, '');
    _$jscoverage['/configs.js'].lineData[39]++;
    filter = packageInfo.filter;
    _$jscoverage['/configs.js'].lineData[41]++;
    if (visit88_41_1(filter)) {
      _$jscoverage['/configs.js'].lineData[42]++;
      filter = '-' + filter;
    }
    _$jscoverage['/configs.js'].lineData[45]++;
    subPath = name + filter + extname;
  }
  _$jscoverage['/configs.js'].lineData[49]++;
  if (visit89_49_1(packageName === 'core')) {
    _$jscoverage['/configs.js'].lineData[50]++;
    url = packageBase + subPath;
  } else {
    _$jscoverage['/configs.js'].lineData[51]++;
    if (visit90_51_1(name === packageName)) {
      _$jscoverage['/configs.js'].lineData[54]++;
      url = packageBase.substring(0, packageBase.length - 1) + filter + extname;
    } else {
      _$jscoverage['/configs.js'].lineData[56]++;
      subPath = subPath.substring(packageName.length + 1);
      _$jscoverage['/configs.js'].lineData[57]++;
      url = packageBase + subPath;
    }
  }
  _$jscoverage['/configs.js'].lineData[60]++;
  if ((t = mod.getTag())) {
    _$jscoverage['/configs.js'].lineData[61]++;
    t += extname;
    _$jscoverage['/configs.js'].lineData[62]++;
    url += '?t=' + t;
  }
  _$jscoverage['/configs.js'].lineData[64]++;
  return url;
};
  _$jscoverage['/configs.js'].lineData[67]++;
  configFns.requires = shortcut('requires');
  _$jscoverage['/configs.js'].lineData[69]++;
  configFns.alias = shortcut('alias');
  _$jscoverage['/configs.js'].lineData[71]++;
  configFns.packages = function(config) {
  _$jscoverage['/configs.js'].functionData[3]++;
  _$jscoverage['/configs.js'].lineData[72]++;
  var Config = this.Config, packages = Config.packages;
  _$jscoverage['/configs.js'].lineData[74]++;
  if (visit91_74_1(config)) {
    _$jscoverage['/configs.js'].lineData[75]++;
    Utils.each(config, function(cfg, key) {
  _$jscoverage['/configs.js'].functionData[4]++;
  _$jscoverage['/configs.js'].lineData[77]++;
  var name = cfg.name = visit92_77_1(cfg.name || key);
  _$jscoverage['/configs.js'].lineData[78]++;
  var base = visit93_78_1(cfg.base || cfg.path);
  _$jscoverage['/configs.js'].lineData[79]++;
  if (visit94_79_1(base)) {
    _$jscoverage['/configs.js'].lineData[80]++;
    cfg.base = normalizePath(base, true);
  }
  _$jscoverage['/configs.js'].lineData[82]++;
  if (visit95_82_1(packages[name])) {
    _$jscoverage['/configs.js'].lineData[83]++;
    packages[name].reset(cfg);
  } else {
    _$jscoverage['/configs.js'].lineData[85]++;
    packages[name] = new Package(cfg);
  }
});
    _$jscoverage['/configs.js'].lineData[88]++;
    return undefined;
  } else {
    _$jscoverage['/configs.js'].lineData[89]++;
    if (visit96_89_1(config === false)) {
      _$jscoverage['/configs.js'].lineData[90]++;
      Config.packages = {
  core: packages.core};
      _$jscoverage['/configs.js'].lineData[93]++;
      return undefined;
    } else {
      _$jscoverage['/configs.js'].lineData[95]++;
      return packages;
    }
  }
};
  _$jscoverage['/configs.js'].lineData[99]++;
  configFns.modules = function(modules) {
  _$jscoverage['/configs.js'].functionData[5]++;
  _$jscoverage['/configs.js'].lineData[100]++;
  if (visit97_100_1(modules)) {
    _$jscoverage['/configs.js'].lineData[101]++;
    Utils.each(modules, function(modCfg, modName) {
  _$jscoverage['/configs.js'].functionData[6]++;
  _$jscoverage['/configs.js'].lineData[102]++;
  var url = modCfg.url;
  _$jscoverage['/configs.js'].lineData[103]++;
  if (visit98_103_1(url)) {
    _$jscoverage['/configs.js'].lineData[104]++;
    modCfg.url = normalizePath(url);
  }
  _$jscoverage['/configs.js'].lineData[106]++;
  var mod = Utils.createModule(modName, modCfg);
  _$jscoverage['/configs.js'].lineData[108]++;
  if (visit99_108_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/configs.js'].lineData[109]++;
    Utils.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/configs.js'].lineData[115]++;
  configFns.base = function(base) {
  _$jscoverage['/configs.js'].functionData[7]++;
  _$jscoverage['/configs.js'].lineData[116]++;
  var self = this, corePackage = Config.packages.core;
  _$jscoverage['/configs.js'].lineData[119]++;
  if (visit100_119_1(!base)) {
    _$jscoverage['/configs.js'].lineData[120]++;
    return visit101_120_1(corePackage && corePackage.getBase());
  }
  _$jscoverage['/configs.js'].lineData[123]++;
  self.config('packages', {
  core: {
  base: base}});
  _$jscoverage['/configs.js'].lineData[129]++;
  return undefined;
};
  _$jscoverage['/configs.js'].lineData[132]++;
  function shortcut(attr) {
    _$jscoverage['/configs.js'].functionData[8]++;
    _$jscoverage['/configs.js'].lineData[133]++;
    return function(config) {
  _$jscoverage['/configs.js'].functionData[9]++;
  _$jscoverage['/configs.js'].lineData[134]++;
  var newCfg = {};
  _$jscoverage['/configs.js'].lineData[135]++;
  for (var name in config) {
    _$jscoverage['/configs.js'].lineData[136]++;
    newCfg[name] = {};
    _$jscoverage['/configs.js'].lineData[137]++;
    newCfg[name][attr] = config[name];
  }
  _$jscoverage['/configs.js'].lineData[139]++;
  S.config('modules', newCfg);
};
  }
  _$jscoverage['/configs.js'].lineData[143]++;
  function normalizePath(base, isDirectory) {
    _$jscoverage['/configs.js'].functionData[10]++;
    _$jscoverage['/configs.js'].lineData[144]++;
    base = Utils.normalizeSlash(base);
    _$jscoverage['/configs.js'].lineData[145]++;
    if (visit102_145_1(isDirectory && visit103_145_2(base.charAt(base.length - 1) !== '/'))) {
      _$jscoverage['/configs.js'].lineData[146]++;
      base += '/';
    }
    _$jscoverage['/configs.js'].lineData[148]++;
    if (visit104_148_1(locationPath)) {
      _$jscoverage['/configs.js'].lineData[149]++;
      if (visit105_149_1(base.charAt(0) === '/')) {
        _$jscoverage['/configs.js'].lineData[150]++;
        base = location.protocol + '//' + location.host + base;
      } else {
        _$jscoverage['/configs.js'].lineData[152]++;
        base = Utils.normalizePath(locationPath, base);
      }
    }
    _$jscoverage['/configs.js'].lineData[155]++;
    return base;
  }
})(KISSY);
