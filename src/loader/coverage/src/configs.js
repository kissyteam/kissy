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
  _$jscoverage['/configs.js'].lineData[18] = 0;
  _$jscoverage['/configs.js'].lineData[19] = 0;
  _$jscoverage['/configs.js'].lineData[23] = 0;
  _$jscoverage['/configs.js'].lineData[24] = 0;
  _$jscoverage['/configs.js'].lineData[28] = 0;
  _$jscoverage['/configs.js'].lineData[29] = 0;
  _$jscoverage['/configs.js'].lineData[33] = 0;
  _$jscoverage['/configs.js'].lineData[34] = 0;
  _$jscoverage['/configs.js'].lineData[35] = 0;
  _$jscoverage['/configs.js'].lineData[36] = 0;
  _$jscoverage['/configs.js'].lineData[38] = 0;
  _$jscoverage['/configs.js'].lineData[40] = 0;
  _$jscoverage['/configs.js'].lineData[41] = 0;
  _$jscoverage['/configs.js'].lineData[44] = 0;
  _$jscoverage['/configs.js'].lineData[45] = 0;
  _$jscoverage['/configs.js'].lineData[46] = 0;
  _$jscoverage['/configs.js'].lineData[48] = 0;
  _$jscoverage['/configs.js'].lineData[49] = 0;
  _$jscoverage['/configs.js'].lineData[50] = 0;
  _$jscoverage['/configs.js'].lineData[51] = 0;
  _$jscoverage['/configs.js'].lineData[53] = 0;
  _$jscoverage['/configs.js'].lineData[56] = 0;
  _$jscoverage['/configs.js'].lineData[58] = 0;
  _$jscoverage['/configs.js'].lineData[59] = 0;
  _$jscoverage['/configs.js'].lineData[60] = 0;
  _$jscoverage['/configs.js'].lineData[61] = 0;
  _$jscoverage['/configs.js'].lineData[62] = 0;
  _$jscoverage['/configs.js'].lineData[64] = 0;
  _$jscoverage['/configs.js'].lineData[67] = 0;
  _$jscoverage['/configs.js'].lineData[68] = 0;
  _$jscoverage['/configs.js'].lineData[71] = 0;
  _$jscoverage['/configs.js'].lineData[72] = 0;
  _$jscoverage['/configs.js'].lineData[74] = 0;
  _$jscoverage['/configs.js'].lineData[75] = 0;
  _$jscoverage['/configs.js'].lineData[76] = 0;
  _$jscoverage['/configs.js'].lineData[79] = 0;
  _$jscoverage['/configs.js'].lineData[80] = 0;
  _$jscoverage['/configs.js'].lineData[81] = 0;
  _$jscoverage['/configs.js'].lineData[84] = 0;
  _$jscoverage['/configs.js'].lineData[85] = 0;
  _$jscoverage['/configs.js'].lineData[86] = 0;
  _$jscoverage['/configs.js'].lineData[87] = 0;
  _$jscoverage['/configs.js'].lineData[89] = 0;
  _$jscoverage['/configs.js'].lineData[91] = 0;
  _$jscoverage['/configs.js'].lineData[92] = 0;
  _$jscoverage['/configs.js'].lineData[94] = 0;
  _$jscoverage['/configs.js'].lineData[97] = 0;
  _$jscoverage['/configs.js'].lineData[98] = 0;
  _$jscoverage['/configs.js'].lineData[99] = 0;
  _$jscoverage['/configs.js'].lineData[100] = 0;
  _$jscoverage['/configs.js'].lineData[102] = 0;
  _$jscoverage['/configs.js'].lineData[106] = 0;
  _$jscoverage['/configs.js'].lineData[107] = 0;
  _$jscoverage['/configs.js'].lineData[108] = 0;
  _$jscoverage['/configs.js'].lineData[109] = 0;
  _$jscoverage['/configs.js'].lineData[110] = 0;
  _$jscoverage['/configs.js'].lineData[111] = 0;
  _$jscoverage['/configs.js'].lineData[112] = 0;
  _$jscoverage['/configs.js'].lineData[114] = 0;
  _$jscoverage['/configs.js'].lineData[116] = 0;
  _$jscoverage['/configs.js'].lineData[117] = 0;
  _$jscoverage['/configs.js'].lineData[123] = 0;
  _$jscoverage['/configs.js'].lineData[124] = 0;
  _$jscoverage['/configs.js'].lineData[128] = 0;
  _$jscoverage['/configs.js'].lineData[129] = 0;
  _$jscoverage['/configs.js'].lineData[132] = 0;
  _$jscoverage['/configs.js'].lineData[133] = 0;
  _$jscoverage['/configs.js'].lineData[135] = 0;
  _$jscoverage['/configs.js'].lineData[137] = 0;
  _$jscoverage['/configs.js'].lineData[138] = 0;
  _$jscoverage['/configs.js'].lineData[143] = 0;
  _$jscoverage['/configs.js'].lineData[145] = 0;
  _$jscoverage['/configs.js'].lineData[148] = 0;
  _$jscoverage['/configs.js'].lineData[149] = 0;
  _$jscoverage['/configs.js'].lineData[150] = 0;
  _$jscoverage['/configs.js'].lineData[151] = 0;
  _$jscoverage['/configs.js'].lineData[152] = 0;
  _$jscoverage['/configs.js'].lineData[154] = 0;
  _$jscoverage['/configs.js'].lineData[155] = 0;
  _$jscoverage['/configs.js'].lineData[159] = 0;
  _$jscoverage['/configs.js'].lineData[160] = 0;
  _$jscoverage['/configs.js'].lineData[162] = 0;
  _$jscoverage['/configs.js'].lineData[164] = 0;
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
  _$jscoverage['/configs.js'].branchData['18'] = [];
  _$jscoverage['/configs.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['40'] = [];
  _$jscoverage['/configs.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['45'] = [];
  _$jscoverage['/configs.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['60'] = [];
  _$jscoverage['/configs.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['70'] = [];
  _$jscoverage['/configs.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['71'] = [];
  _$jscoverage['/configs.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['74'] = [];
  _$jscoverage['/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['75'] = [];
  _$jscoverage['/configs.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['80'] = [];
  _$jscoverage['/configs.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['84'] = [];
  _$jscoverage['/configs.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['86'] = [];
  _$jscoverage['/configs.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['91'] = [];
  _$jscoverage['/configs.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['98'] = [];
  _$jscoverage['/configs.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['107'] = [];
  _$jscoverage['/configs.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['110'] = [];
  _$jscoverage['/configs.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['116'] = [];
  _$jscoverage['/configs.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['128'] = [];
  _$jscoverage['/configs.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['137'] = [];
  _$jscoverage['/configs.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['151'] = [];
  _$jscoverage['/configs.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/configs.js'].branchData['154'] = [];
  _$jscoverage['/configs.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['159'] = [];
  _$jscoverage['/configs.js'].branchData['159'][1] = new BranchData();
}
_$jscoverage['/configs.js'].branchData['159'][1].init(94, 28, '!S.startsWith(base, \'file:\')');
function visit81_159_1(result) {
  _$jscoverage['/configs.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['154'][1].init(177, 17, 'simulatedLocation');
function visit80_154_1(result) {
  _$jscoverage['/configs.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['151'][2].init(90, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit79_151_2(result) {
  _$jscoverage['/configs.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['151'][1].init(75, 51, 'isDirectory && base.charAt(base.length - 1) !== \'/\'');
function visit78_151_1(result) {
  _$jscoverage['/configs.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['137'][1].init(301, 12, '!corePackage');
function visit77_137_1(result) {
  _$jscoverage['/configs.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['128'][1].init(94, 5, '!base');
function visit76_128_1(result) {
  _$jscoverage['/configs.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['116'][1].init(311, 33, 'mod.status === Loader.Status.INIT');
function visit75_116_1(result) {
  _$jscoverage['/configs.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['110'][1].init(61, 4, 'path');
function visit74_110_1(result) {
  _$jscoverage['/configs.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['107'][1].init(13, 7, 'modules');
function visit73_107_1(result) {
  _$jscoverage['/configs.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['98'][1].init(1067, 16, 'config === false');
function visit72_98_1(result) {
  _$jscoverage['/configs.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['91'][1].init(663, 8, 'ps[name]');
function visit71_91_1(result) {
  _$jscoverage['/configs.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['86'][1].init(58, 27, '!cfg.ignorePackageNameInUri');
function visit70_86_1(result) {
  _$jscoverage['/configs.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['84'][1].init(400, 4, 'path');
function visit69_84_1(result) {
  _$jscoverage['/configs.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['80'][1].init(25, 8, 'm in cfg');
function visit68_80_1(result) {
  _$jscoverage['/configs.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['75'][1].init(94, 20, 'cfg.base || cfg.path');
function visit67_75_1(result) {
  _$jscoverage['/configs.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['74'][1].init(50, 15, 'cfg.name || key');
function visit66_74_1(result) {
  _$jscoverage['/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['71'][1].init(123, 6, 'config');
function visit65_71_1(result) {
  _$jscoverage['/configs.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['70'][1].init(78, 21, 'Config.packages || {}');
function visit64_70_1(result) {
  _$jscoverage['/configs.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['60'][1].init(42, 4, 'base');
function visit63_60_1(result) {
  _$jscoverage['/configs.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['45'][1].init(464, 11, 'packageName');
function visit62_45_1(result) {
  _$jscoverage['/configs.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['40'][1].init(354, 21, 'packageInfo.isDebug()');
function visit61_40_1(result) {
  _$jscoverage['/configs.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['18'][1].init(293, 42, 'location && (locationHref = location.href)');
function visit60_18_1(result) {
  _$jscoverage['/configs.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/configs.js'].functionData[0]++;
  _$jscoverage['/configs.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, Package = Loader.Package, Utils = Loader.Utils, host = S.Env.host, Config = S.Config, location = host.location, simulatedLocation, locationHref, configFns = Config.fns;
  _$jscoverage['/configs.js'].lineData[18]++;
  if (visit60_18_1(location && (locationHref = location.href))) {
    _$jscoverage['/configs.js'].lineData[19]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/configs.js'].lineData[23]++;
  Config.loadModsFn = function(rs, config) {
  _$jscoverage['/configs.js'].functionData[1]++;
  _$jscoverage['/configs.js'].lineData[24]++;
  S.getScript(rs.path, config);
};
  _$jscoverage['/configs.js'].lineData[28]++;
  Config.resolveModFn = function(mod) {
  _$jscoverage['/configs.js'].functionData[2]++;
  _$jscoverage['/configs.js'].lineData[29]++;
  var name = mod.name, min = '-min', t, subPath;
  _$jscoverage['/configs.js'].lineData[33]++;
  var packageInfo = mod.getPackage();
  _$jscoverage['/configs.js'].lineData[34]++;
  var packageUri = packageInfo.getUri();
  _$jscoverage['/configs.js'].lineData[35]++;
  var packageName = packageInfo.getName();
  _$jscoverage['/configs.js'].lineData[36]++;
  var extname = '.' + mod.getType();
  _$jscoverage['/configs.js'].lineData[38]++;
  name = Path.join(Path.dirname(name), Path.basename(name, extname));
  _$jscoverage['/configs.js'].lineData[40]++;
  if (visit61_40_1(packageInfo.isDebug())) {
    _$jscoverage['/configs.js'].lineData[41]++;
    min = '';
  }
  _$jscoverage['/configs.js'].lineData[44]++;
  subPath = name + min + extname;
  _$jscoverage['/configs.js'].lineData[45]++;
  if (visit62_45_1(packageName)) {
    _$jscoverage['/configs.js'].lineData[46]++;
    subPath = Path.relative(packageName, subPath);
  }
  _$jscoverage['/configs.js'].lineData[48]++;
  var uri = packageUri.resolve(subPath);
  _$jscoverage['/configs.js'].lineData[49]++;
  if ((t = mod.getTag())) {
    _$jscoverage['/configs.js'].lineData[50]++;
    t += '.' + mod.getType();
    _$jscoverage['/configs.js'].lineData[51]++;
    uri.query.set('t', t);
  }
  _$jscoverage['/configs.js'].lineData[53]++;
  return uri;
};
  _$jscoverage['/configs.js'].lineData[56]++;
  var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];
  _$jscoverage['/configs.js'].lineData[58]++;
  configFns.core = function(cfg) {
  _$jscoverage['/configs.js'].functionData[3]++;
  _$jscoverage['/configs.js'].lineData[59]++;
  var base = cfg.base;
  _$jscoverage['/configs.js'].lineData[60]++;
  if (visit63_60_1(base)) {
    _$jscoverage['/configs.js'].lineData[61]++;
    cfg.uri = normalizePath(base, true);
    _$jscoverage['/configs.js'].lineData[62]++;
    delete cfg.base;
  }
  _$jscoverage['/configs.js'].lineData[64]++;
  this.Env.corePackage.reset(cfg);
};
  _$jscoverage['/configs.js'].lineData[67]++;
  configFns.packages = function(config) {
  _$jscoverage['/configs.js'].functionData[4]++;
  _$jscoverage['/configs.js'].lineData[68]++;
  var name, Config = this.Config, ps = Config.packages = visit64_70_1(Config.packages || {});
  _$jscoverage['/configs.js'].lineData[71]++;
  if (visit65_71_1(config)) {
    _$jscoverage['/configs.js'].lineData[72]++;
    S.each(config, function(cfg, key) {
  _$jscoverage['/configs.js'].functionData[5]++;
  _$jscoverage['/configs.js'].lineData[74]++;
  name = visit66_74_1(cfg.name || key);
  _$jscoverage['/configs.js'].lineData[75]++;
  var path = visit67_75_1(cfg.base || cfg.path);
  _$jscoverage['/configs.js'].lineData[76]++;
  var newConfig = {
  name: name};
  _$jscoverage['/configs.js'].lineData[79]++;
  S.each(PACKAGE_MEMBERS, function(m) {
  _$jscoverage['/configs.js'].functionData[6]++;
  _$jscoverage['/configs.js'].lineData[80]++;
  if (visit68_80_1(m in cfg)) {
    _$jscoverage['/configs.js'].lineData[81]++;
    newConfig[m] = cfg[m];
  }
});
  _$jscoverage['/configs.js'].lineData[84]++;
  if (visit69_84_1(path)) {
    _$jscoverage['/configs.js'].lineData[85]++;
    path += '/';
    _$jscoverage['/configs.js'].lineData[86]++;
    if (visit70_86_1(!cfg.ignorePackageNameInUri)) {
      _$jscoverage['/configs.js'].lineData[87]++;
      path += name + '/';
    }
    _$jscoverage['/configs.js'].lineData[89]++;
    newConfig.uri = normalizePath(path, true);
  }
  _$jscoverage['/configs.js'].lineData[91]++;
  if (visit71_91_1(ps[name])) {
    _$jscoverage['/configs.js'].lineData[92]++;
    ps[name].reset(newConfig);
  } else {
    _$jscoverage['/configs.js'].lineData[94]++;
    ps[name] = new Package(newConfig);
  }
});
    _$jscoverage['/configs.js'].lineData[97]++;
    return undefined;
  } else {
    _$jscoverage['/configs.js'].lineData[98]++;
    if (visit72_98_1(config === false)) {
      _$jscoverage['/configs.js'].lineData[99]++;
      Config.packages = {};
      _$jscoverage['/configs.js'].lineData[100]++;
      return undefined;
    } else {
      _$jscoverage['/configs.js'].lineData[102]++;
      return ps;
    }
  }
};
  _$jscoverage['/configs.js'].lineData[106]++;
  configFns.modules = function(modules) {
  _$jscoverage['/configs.js'].functionData[7]++;
  _$jscoverage['/configs.js'].lineData[107]++;
  if (visit73_107_1(modules)) {
    _$jscoverage['/configs.js'].lineData[108]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/configs.js'].functionData[8]++;
  _$jscoverage['/configs.js'].lineData[109]++;
  var path = modCfg.path;
  _$jscoverage['/configs.js'].lineData[110]++;
  if (visit74_110_1(path)) {
    _$jscoverage['/configs.js'].lineData[111]++;
    modCfg.uri = normalizePath(path);
    _$jscoverage['/configs.js'].lineData[112]++;
    delete modCfg.path;
  }
  _$jscoverage['/configs.js'].lineData[114]++;
  var mod = Utils.createModuleInfo(modName, modCfg);
  _$jscoverage['/configs.js'].lineData[116]++;
  if (visit75_116_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/configs.js'].lineData[117]++;
    S.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/configs.js'].lineData[123]++;
  configFns.base = function(base) {
  _$jscoverage['/configs.js'].functionData[9]++;
  _$jscoverage['/configs.js'].lineData[124]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/configs.js'].lineData[128]++;
  if (visit76_128_1(!base)) {
    _$jscoverage['/configs.js'].lineData[129]++;
    return Config.baseUri.toString();
  }
  _$jscoverage['/configs.js'].lineData[132]++;
  baseUri = normalizePath(base, true);
  _$jscoverage['/configs.js'].lineData[133]++;
  Config.baseUri = baseUri;
  _$jscoverage['/configs.js'].lineData[135]++;
  var corePackage = self.Env.corePackage;
  _$jscoverage['/configs.js'].lineData[137]++;
  if (visit77_137_1(!corePackage)) {
    _$jscoverage['/configs.js'].lineData[138]++;
    corePackage = self.Env.corePackage = new Package({
  name: ''});
  }
  _$jscoverage['/configs.js'].lineData[143]++;
  corePackage.uri = baseUri;
  _$jscoverage['/configs.js'].lineData[145]++;
  return undefined;
};
  _$jscoverage['/configs.js'].lineData[148]++;
  function normalizePath(base, isDirectory) {
    _$jscoverage['/configs.js'].functionData[10]++;
    _$jscoverage['/configs.js'].lineData[149]++;
    var baseUri;
    _$jscoverage['/configs.js'].lineData[150]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/configs.js'].lineData[151]++;
    if (visit78_151_1(isDirectory && visit79_151_2(base.charAt(base.length - 1) !== '/'))) {
      _$jscoverage['/configs.js'].lineData[152]++;
      base += '/';
    }
    _$jscoverage['/configs.js'].lineData[154]++;
    if (visit80_154_1(simulatedLocation)) {
      _$jscoverage['/configs.js'].lineData[155]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/configs.js'].lineData[159]++;
      if (visit81_159_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/configs.js'].lineData[160]++;
        base = 'file:' + base;
      }
      _$jscoverage['/configs.js'].lineData[162]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/configs.js'].lineData[164]++;
    return baseUri;
  }
})(KISSY);
