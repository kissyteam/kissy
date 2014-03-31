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
  _$jscoverage['/configs.js'].lineData[30] = 0;
  _$jscoverage['/configs.js'].lineData[31] = 0;
  _$jscoverage['/configs.js'].lineData[32] = 0;
  _$jscoverage['/configs.js'].lineData[33] = 0;
  _$jscoverage['/configs.js'].lineData[35] = 0;
  _$jscoverage['/configs.js'].lineData[36] = 0;
  _$jscoverage['/configs.js'].lineData[37] = 0;
  _$jscoverage['/configs.js'].lineData[41] = 0;
  _$jscoverage['/configs.js'].lineData[42] = 0;
  _$jscoverage['/configs.js'].lineData[44] = 0;
  _$jscoverage['/configs.js'].lineData[45] = 0;
  _$jscoverage['/configs.js'].lineData[46] = 0;
  _$jscoverage['/configs.js'].lineData[48] = 0;
  _$jscoverage['/configs.js'].lineData[51] = 0;
  _$jscoverage['/configs.js'].lineData[52] = 0;
  _$jscoverage['/configs.js'].lineData[53] = 0;
  _$jscoverage['/configs.js'].lineData[55] = 0;
  _$jscoverage['/configs.js'].lineData[58] = 0;
  _$jscoverage['/configs.js'].lineData[59] = 0;
  _$jscoverage['/configs.js'].lineData[60] = 0;
  _$jscoverage['/configs.js'].lineData[61] = 0;
  _$jscoverage['/configs.js'].lineData[62] = 0;
  _$jscoverage['/configs.js'].lineData[64] = 0;
  _$jscoverage['/configs.js'].lineData[65] = 0;
  _$jscoverage['/configs.js'].lineData[69] = 0;
  _$jscoverage['/configs.js'].lineData[72] = 0;
  _$jscoverage['/configs.js'].lineData[74] = 0;
  _$jscoverage['/configs.js'].lineData[76] = 0;
  _$jscoverage['/configs.js'].lineData[77] = 0;
  _$jscoverage['/configs.js'].lineData[79] = 0;
  _$jscoverage['/configs.js'].lineData[80] = 0;
  _$jscoverage['/configs.js'].lineData[82] = 0;
  _$jscoverage['/configs.js'].lineData[83] = 0;
  _$jscoverage['/configs.js'].lineData[84] = 0;
  _$jscoverage['/configs.js'].lineData[85] = 0;
  _$jscoverage['/configs.js'].lineData[86] = 0;
  _$jscoverage['/configs.js'].lineData[88] = 0;
  _$jscoverage['/configs.js'].lineData[90] = 0;
  _$jscoverage['/configs.js'].lineData[91] = 0;
  _$jscoverage['/configs.js'].lineData[93] = 0;
  _$jscoverage['/configs.js'].lineData[96] = 0;
  _$jscoverage['/configs.js'].lineData[97] = 0;
  _$jscoverage['/configs.js'].lineData[98] = 0;
  _$jscoverage['/configs.js'].lineData[99] = 0;
  _$jscoverage['/configs.js'].lineData[101] = 0;
  _$jscoverage['/configs.js'].lineData[105] = 0;
  _$jscoverage['/configs.js'].lineData[106] = 0;
  _$jscoverage['/configs.js'].lineData[107] = 0;
  _$jscoverage['/configs.js'].lineData[108] = 0;
  _$jscoverage['/configs.js'].lineData[109] = 0;
  _$jscoverage['/configs.js'].lineData[110] = 0;
  _$jscoverage['/configs.js'].lineData[112] = 0;
  _$jscoverage['/configs.js'].lineData[114] = 0;
  _$jscoverage['/configs.js'].lineData[115] = 0;
  _$jscoverage['/configs.js'].lineData[121] = 0;
  _$jscoverage['/configs.js'].lineData[122] = 0;
  _$jscoverage['/configs.js'].lineData[125] = 0;
  _$jscoverage['/configs.js'].lineData[126] = 0;
  _$jscoverage['/configs.js'].lineData[129] = 0;
  _$jscoverage['/configs.js'].lineData[133] = 0;
  _$jscoverage['/configs.js'].lineData[136] = 0;
  _$jscoverage['/configs.js'].lineData[137] = 0;
  _$jscoverage['/configs.js'].lineData[138] = 0;
  _$jscoverage['/configs.js'].lineData[139] = 0;
  _$jscoverage['/configs.js'].lineData[140] = 0;
  _$jscoverage['/configs.js'].lineData[141] = 0;
  _$jscoverage['/configs.js'].lineData[143] = 0;
  _$jscoverage['/configs.js'].lineData[147] = 0;
  _$jscoverage['/configs.js'].lineData[148] = 0;
  _$jscoverage['/configs.js'].lineData[149] = 0;
  _$jscoverage['/configs.js'].lineData[151] = 0;
  _$jscoverage['/configs.js'].lineData[152] = 0;
  _$jscoverage['/configs.js'].lineData[154] = 0;
  _$jscoverage['/configs.js'].lineData[155] = 0;
  _$jscoverage['/configs.js'].lineData[156] = 0;
  _$jscoverage['/configs.js'].lineData[158] = 0;
  _$jscoverage['/configs.js'].lineData[161] = 0;
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
  _$jscoverage['/configs.js'].functionData[11] = 0;
}
if (! _$jscoverage['/configs.js'].branchData) {
  _$jscoverage['/configs.js'].branchData = {};
  _$jscoverage['/configs.js'].branchData['16'] = [];
  _$jscoverage['/configs.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['36'] = [];
  _$jscoverage['/configs.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['41'] = [];
  _$jscoverage['/configs.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['45'] = [];
  _$jscoverage['/configs.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['59'] = [];
  _$jscoverage['/configs.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['61'] = [];
  _$jscoverage['/configs.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['64'] = [];
  _$jscoverage['/configs.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['78'] = [];
  _$jscoverage['/configs.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['79'] = [];
  _$jscoverage['/configs.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['82'] = [];
  _$jscoverage['/configs.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['83'] = [];
  _$jscoverage['/configs.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['84'] = [];
  _$jscoverage['/configs.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['85'] = [];
  _$jscoverage['/configs.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['86'] = [];
  _$jscoverage['/configs.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['90'] = [];
  _$jscoverage['/configs.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['97'] = [];
  _$jscoverage['/configs.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['106'] = [];
  _$jscoverage['/configs.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['109'] = [];
  _$jscoverage['/configs.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['114'] = [];
  _$jscoverage['/configs.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['125'] = [];
  _$jscoverage['/configs.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['126'] = [];
  _$jscoverage['/configs.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['148'] = [];
  _$jscoverage['/configs.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['151'] = [];
  _$jscoverage['/configs.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/configs.js'].branchData['154'] = [];
  _$jscoverage['/configs.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/configs.js'].branchData['155'] = [];
  _$jscoverage['/configs.js'].branchData['155'][1] = new BranchData();
}
_$jscoverage['/configs.js'].branchData['155'][1].init(17, 22, 'base.charAt(0) === \'/\'');
function visit105_155_1(result) {
  _$jscoverage['/configs.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['154'][1].init(211, 12, 'locationPath');
function visit104_154_1(result) {
  _$jscoverage['/configs.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['151'][2].init(124, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit103_151_2(result) {
  _$jscoverage['/configs.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['151'][1].init(109, 51, 'isDirectory && base.charAt(base.length - 1) !== \'/\'');
function visit102_151_1(result) {
  _$jscoverage['/configs.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['148'][1].init(13, 25, 'base.indexOf(\'\\\\\') !== -1');
function visit101_148_1(result) {
  _$jscoverage['/configs.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['126'][1].init(20, 36, 'corePackage && corePackage.getBase()');
function visit100_126_1(result) {
  _$jscoverage['/configs.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['125'][1].init(85, 5, '!base');
function visit99_125_1(result) {
  _$jscoverage['/configs.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['114'][1].init(267, 33, 'mod.status === Loader.Status.INIT');
function visit98_114_1(result) {
  _$jscoverage['/configs.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['109'][1].init(59, 3, 'url');
function visit97_109_1(result) {
  _$jscoverage['/configs.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['106'][1].init(13, 7, 'modules');
function visit96_106_1(result) {
  _$jscoverage['/configs.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['97'][1].init(805, 16, 'config === false');
function visit95_97_1(result) {
  _$jscoverage['/configs.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['90'][1].init(427, 8, 'ps[name]');
function visit94_90_1(result) {
  _$jscoverage['/configs.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['86'][1].init(34, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit93_86_1(result) {
  _$jscoverage['/configs.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['85'][1].init(25, 27, '!cfg.ignorePackageNameInUri');
function visit92_85_1(result) {
  _$jscoverage['/configs.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['84'][1].init(156, 4, 'base');
function visit91_84_1(result) {
  _$jscoverage['/configs.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['83'][1].init(114, 20, 'cfg.base || cfg.path');
function visit90_83_1(result) {
  _$jscoverage['/configs.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['82'][1].init(70, 15, 'cfg.name || key');
function visit89_82_1(result) {
  _$jscoverage['/configs.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['79'][1].init(105, 6, 'config');
function visit88_79_1(result) {
  _$jscoverage['/configs.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['78'][1].init(60, 21, 'Config.packages || {}');
function visit87_78_1(result) {
  _$jscoverage['/configs.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['64'][1].init(180, 12, '!corePackage');
function visit86_64_1(result) {
  _$jscoverage['/configs.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['61'][1].init(100, 4, 'base');
function visit85_61_1(result) {
  _$jscoverage['/configs.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['59'][1].init(20, 20, 'cfg.base || cfg.path');
function visit84_59_1(result) {
  _$jscoverage['/configs.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['45'][1].init(61, 11, 'packageName');
function visit83_45_1(result) {
  _$jscoverage['/configs.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['41'][1].init(469, 20, 'name === packageName');
function visit82_41_1(result) {
  _$jscoverage['/configs.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['36'][1].init(359, 21, 'packageInfo.isDebug()');
function visit81_36_1(result) {
  _$jscoverage['/configs.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].branchData['16'][1].init(248, 8, 'location');
function visit80_16_1(result) {
  _$jscoverage['/configs.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/configs.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/configs.js'].functionData[0]++;
  _$jscoverage['/configs.js'].lineData[7]++;
  var Loader = S.Loader, Package = Loader.Package, Utils = Loader.Utils, host = S.Env.host, Config = S.Config, location = host.location, locationPath = '', configFns = Config.fns;
  _$jscoverage['/configs.js'].lineData[16]++;
  if (visit80_16_1(location)) {
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
  var name = mod.name, min = '-min', t, url, subPath;
  _$jscoverage['/configs.js'].lineData[30]++;
  var packageInfo = mod.getPackage();
  _$jscoverage['/configs.js'].lineData[31]++;
  var packageBase = packageInfo.getBase();
  _$jscoverage['/configs.js'].lineData[32]++;
  var packageName = packageInfo.getName();
  _$jscoverage['/configs.js'].lineData[33]++;
  var extname = '.' + mod.getType();
  _$jscoverage['/configs.js'].lineData[35]++;
  name = name.replace(/\.css$/, '');
  _$jscoverage['/configs.js'].lineData[36]++;
  if (visit81_36_1(packageInfo.isDebug())) {
    _$jscoverage['/configs.js'].lineData[37]++;
    min = '';
  }
  _$jscoverage['/configs.js'].lineData[41]++;
  if (visit82_41_1(name === packageName)) {
    _$jscoverage['/configs.js'].lineData[42]++;
    url = packageBase.substring(0, packageBase.length - 1) + min + extname;
  } else {
    _$jscoverage['/configs.js'].lineData[44]++;
    subPath = name + min + extname;
    _$jscoverage['/configs.js'].lineData[45]++;
    if (visit83_45_1(packageName)) {
      _$jscoverage['/configs.js'].lineData[46]++;
      subPath = subPath.substring(packageName.length + 1);
    }
    _$jscoverage['/configs.js'].lineData[48]++;
    url = packageBase + subPath;
  }
  _$jscoverage['/configs.js'].lineData[51]++;
  if ((t = mod.getTag())) {
    _$jscoverage['/configs.js'].lineData[52]++;
    t += '.' + mod.getType();
    _$jscoverage['/configs.js'].lineData[53]++;
    url += '?t=' + t;
  }
  _$jscoverage['/configs.js'].lineData[55]++;
  return url;
};
  _$jscoverage['/configs.js'].lineData[58]++;
  configFns.core = function(cfg) {
  _$jscoverage['/configs.js'].functionData[3]++;
  _$jscoverage['/configs.js'].lineData[59]++;
  var base = visit84_59_1(cfg.base || cfg.path);
  _$jscoverage['/configs.js'].lineData[60]++;
  var corePackage = Config.corePackage;
  _$jscoverage['/configs.js'].lineData[61]++;
  if (visit85_61_1(base)) {
    _$jscoverage['/configs.js'].lineData[62]++;
    cfg.base = normalizePath(base, true);
  }
  _$jscoverage['/configs.js'].lineData[64]++;
  if (visit86_64_1(!corePackage)) {
    _$jscoverage['/configs.js'].lineData[65]++;
    corePackage = Config.corePackage = new Package({
  name: ''});
  }
  _$jscoverage['/configs.js'].lineData[69]++;
  corePackage.reset(cfg);
};
  _$jscoverage['/configs.js'].lineData[72]++;
  configFns.requires = shortcut('requires');
  _$jscoverage['/configs.js'].lineData[74]++;
  configFns.alias = shortcut('alias');
  _$jscoverage['/configs.js'].lineData[76]++;
  configFns.packages = function(config) {
  _$jscoverage['/configs.js'].functionData[4]++;
  _$jscoverage['/configs.js'].lineData[77]++;
  var Config = this.Config, ps = Config.packages = visit87_78_1(Config.packages || {});
  _$jscoverage['/configs.js'].lineData[79]++;
  if (visit88_79_1(config)) {
    _$jscoverage['/configs.js'].lineData[80]++;
    Utils.each(config, function(cfg, key) {
  _$jscoverage['/configs.js'].functionData[5]++;
  _$jscoverage['/configs.js'].lineData[82]++;
  var name = cfg.name = visit89_82_1(cfg.name || key);
  _$jscoverage['/configs.js'].lineData[83]++;
  var base = visit90_83_1(cfg.base || cfg.path);
  _$jscoverage['/configs.js'].lineData[84]++;
  if (visit91_84_1(base)) {
    _$jscoverage['/configs.js'].lineData[85]++;
    if (visit92_85_1(!cfg.ignorePackageNameInUri)) {
      _$jscoverage['/configs.js'].lineData[86]++;
      base += (visit93_86_1(base.charAt(base.length - 1) !== '/') ? '/' : '') + name;
    }
    _$jscoverage['/configs.js'].lineData[88]++;
    cfg.base = normalizePath(base, true);
  }
  _$jscoverage['/configs.js'].lineData[90]++;
  if (visit94_90_1(ps[name])) {
    _$jscoverage['/configs.js'].lineData[91]++;
    ps[name].reset(cfg);
  } else {
    _$jscoverage['/configs.js'].lineData[93]++;
    ps[name] = new Package(cfg);
  }
});
    _$jscoverage['/configs.js'].lineData[96]++;
    return undefined;
  } else {
    _$jscoverage['/configs.js'].lineData[97]++;
    if (visit95_97_1(config === false)) {
      _$jscoverage['/configs.js'].lineData[98]++;
      Config.packages = {};
      _$jscoverage['/configs.js'].lineData[99]++;
      return undefined;
    } else {
      _$jscoverage['/configs.js'].lineData[101]++;
      return ps;
    }
  }
};
  _$jscoverage['/configs.js'].lineData[105]++;
  configFns.modules = function(modules) {
  _$jscoverage['/configs.js'].functionData[6]++;
  _$jscoverage['/configs.js'].lineData[106]++;
  if (visit96_106_1(modules)) {
    _$jscoverage['/configs.js'].lineData[107]++;
    Utils.each(modules, function(modCfg, modName) {
  _$jscoverage['/configs.js'].functionData[7]++;
  _$jscoverage['/configs.js'].lineData[108]++;
  var url = modCfg.url;
  _$jscoverage['/configs.js'].lineData[109]++;
  if (visit97_109_1(url)) {
    _$jscoverage['/configs.js'].lineData[110]++;
    modCfg.url = normalizePath(url);
  }
  _$jscoverage['/configs.js'].lineData[112]++;
  var mod = Utils.createModuleInfo(modName, modCfg);
  _$jscoverage['/configs.js'].lineData[114]++;
  if (visit98_114_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/configs.js'].lineData[115]++;
    Utils.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/configs.js'].lineData[121]++;
  configFns.base = function(base) {
  _$jscoverage['/configs.js'].functionData[8]++;
  _$jscoverage['/configs.js'].lineData[122]++;
  var self = this, corePackage = Config.corePackage;
  _$jscoverage['/configs.js'].lineData[125]++;
  if (visit99_125_1(!base)) {
    _$jscoverage['/configs.js'].lineData[126]++;
    return visit100_126_1(corePackage && corePackage.getBase());
  }
  _$jscoverage['/configs.js'].lineData[129]++;
  self.config('core', {
  base: base});
  _$jscoverage['/configs.js'].lineData[133]++;
  return undefined;
};
  _$jscoverage['/configs.js'].lineData[136]++;
  function shortcut(attr) {
    _$jscoverage['/configs.js'].functionData[9]++;
    _$jscoverage['/configs.js'].lineData[137]++;
    return function(config) {
  _$jscoverage['/configs.js'].functionData[10]++;
  _$jscoverage['/configs.js'].lineData[138]++;
  var newCfg = {};
  _$jscoverage['/configs.js'].lineData[139]++;
  for (var name in config) {
    _$jscoverage['/configs.js'].lineData[140]++;
    newCfg[name] = {};
    _$jscoverage['/configs.js'].lineData[141]++;
    newCfg[name][attr] = config[name];
  }
  _$jscoverage['/configs.js'].lineData[143]++;
  S.config('modules', newCfg);
};
  }
  _$jscoverage['/configs.js'].lineData[147]++;
  function normalizePath(base, isDirectory) {
    _$jscoverage['/configs.js'].functionData[11]++;
    _$jscoverage['/configs.js'].lineData[148]++;
    if (visit101_148_1(base.indexOf('\\') !== -1)) {
      _$jscoverage['/configs.js'].lineData[149]++;
      base = base.replace(/\\/g, '/');
    }
    _$jscoverage['/configs.js'].lineData[151]++;
    if (visit102_151_1(isDirectory && visit103_151_2(base.charAt(base.length - 1) !== '/'))) {
      _$jscoverage['/configs.js'].lineData[152]++;
      base += '/';
    }
    _$jscoverage['/configs.js'].lineData[154]++;
    if (visit104_154_1(locationPath)) {
      _$jscoverage['/configs.js'].lineData[155]++;
      if (visit105_155_1(base.charAt(0) === '/')) {
        _$jscoverage['/configs.js'].lineData[156]++;
        base = location.protocol + '//' + location.host + base;
      } else {
        _$jscoverage['/configs.js'].lineData[158]++;
        base = Utils.normalizePath(locationPath, base);
      }
    }
    _$jscoverage['/configs.js'].lineData[161]++;
    return base;
  }
})(KISSY);
