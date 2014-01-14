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
  _$jscoverage['/loader/configs.js'].lineData[17] = 0;
  _$jscoverage['/loader/configs.js'].lineData[18] = 0;
  _$jscoverage['/loader/configs.js'].lineData[22] = 0;
  _$jscoverage['/loader/configs.js'].lineData[23] = 0;
  _$jscoverage['/loader/configs.js'].lineData[27] = 0;
  _$jscoverage['/loader/configs.js'].lineData[28] = 0;
  _$jscoverage['/loader/configs.js'].lineData[32] = 0;
  _$jscoverage['/loader/configs.js'].lineData[33] = 0;
  _$jscoverage['/loader/configs.js'].lineData[34] = 0;
  _$jscoverage['/loader/configs.js'].lineData[35] = 0;
  _$jscoverage['/loader/configs.js'].lineData[37] = 0;
  _$jscoverage['/loader/configs.js'].lineData[39] = 0;
  _$jscoverage['/loader/configs.js'].lineData[40] = 0;
  _$jscoverage['/loader/configs.js'].lineData[43] = 0;
  _$jscoverage['/loader/configs.js'].lineData[44] = 0;
  _$jscoverage['/loader/configs.js'].lineData[45] = 0;
  _$jscoverage['/loader/configs.js'].lineData[47] = 0;
  _$jscoverage['/loader/configs.js'].lineData[48] = 0;
  _$jscoverage['/loader/configs.js'].lineData[49] = 0;
  _$jscoverage['/loader/configs.js'].lineData[50] = 0;
  _$jscoverage['/loader/configs.js'].lineData[52] = 0;
  _$jscoverage['/loader/configs.js'].lineData[55] = 0;
  _$jscoverage['/loader/configs.js'].lineData[56] = 0;
  _$jscoverage['/loader/configs.js'].lineData[57] = 0;
  _$jscoverage['/loader/configs.js'].lineData[60] = 0;
  _$jscoverage['/loader/configs.js'].lineData[61] = 0;
  _$jscoverage['/loader/configs.js'].lineData[63] = 0;
  _$jscoverage['/loader/configs.js'].lineData[64] = 0;
  _$jscoverage['/loader/configs.js'].lineData[65] = 0;
  _$jscoverage['/loader/configs.js'].lineData[69] = 0;
  _$jscoverage['/loader/configs.js'].lineData[70] = 0;
  _$jscoverage['/loader/configs.js'].lineData[71] = 0;
  _$jscoverage['/loader/configs.js'].lineData[74] = 0;
  _$jscoverage['/loader/configs.js'].lineData[75] = 0;
  _$jscoverage['/loader/configs.js'].lineData[76] = 0;
  _$jscoverage['/loader/configs.js'].lineData[77] = 0;
  _$jscoverage['/loader/configs.js'].lineData[79] = 0;
  _$jscoverage['/loader/configs.js'].lineData[81] = 0;
  _$jscoverage['/loader/configs.js'].lineData[82] = 0;
  _$jscoverage['/loader/configs.js'].lineData[84] = 0;
  _$jscoverage['/loader/configs.js'].lineData[87] = 0;
  _$jscoverage['/loader/configs.js'].lineData[88] = 0;
  _$jscoverage['/loader/configs.js'].lineData[89] = 0;
  _$jscoverage['/loader/configs.js'].lineData[90] = 0;
  _$jscoverage['/loader/configs.js'].lineData[92] = 0;
  _$jscoverage['/loader/configs.js'].lineData[96] = 0;
  _$jscoverage['/loader/configs.js'].lineData[97] = 0;
  _$jscoverage['/loader/configs.js'].lineData[98] = 0;
  _$jscoverage['/loader/configs.js'].lineData[99] = 0;
  _$jscoverage['/loader/configs.js'].lineData[100] = 0;
  _$jscoverage['/loader/configs.js'].lineData[101] = 0;
  _$jscoverage['/loader/configs.js'].lineData[102] = 0;
  _$jscoverage['/loader/configs.js'].lineData[103] = 0;
  _$jscoverage['/loader/configs.js'].lineData[105] = 0;
  _$jscoverage['/loader/configs.js'].lineData[107] = 0;
  _$jscoverage['/loader/configs.js'].lineData[108] = 0;
  _$jscoverage['/loader/configs.js'].lineData[114] = 0;
  _$jscoverage['/loader/configs.js'].lineData[115] = 0;
  _$jscoverage['/loader/configs.js'].lineData[118] = 0;
  _$jscoverage['/loader/configs.js'].lineData[119] = 0;
  _$jscoverage['/loader/configs.js'].lineData[121] = 0;
  _$jscoverage['/loader/configs.js'].lineData[122] = 0;
  _$jscoverage['/loader/configs.js'].lineData[123] = 0;
  _$jscoverage['/loader/configs.js'].lineData[126] = 0;
  _$jscoverage['/loader/configs.js'].lineData[127] = 0;
  _$jscoverage['/loader/configs.js'].lineData[128] = 0;
  _$jscoverage['/loader/configs.js'].lineData[129] = 0;
  _$jscoverage['/loader/configs.js'].lineData[130] = 0;
  _$jscoverage['/loader/configs.js'].lineData[132] = 0;
  _$jscoverage['/loader/configs.js'].lineData[133] = 0;
  _$jscoverage['/loader/configs.js'].lineData[137] = 0;
  _$jscoverage['/loader/configs.js'].lineData[138] = 0;
  _$jscoverage['/loader/configs.js'].lineData[140] = 0;
  _$jscoverage['/loader/configs.js'].lineData[142] = 0;
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
  _$jscoverage['/loader/configs.js'].branchData['17'] = [];
  _$jscoverage['/loader/configs.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['17'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['39'] = [];
  _$jscoverage['/loader/configs.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['44'] = [];
  _$jscoverage['/loader/configs.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['59'] = [];
  _$jscoverage['/loader/configs.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['60'] = [];
  _$jscoverage['/loader/configs.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['63'] = [];
  _$jscoverage['/loader/configs.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['64'] = [];
  _$jscoverage['/loader/configs.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['70'] = [];
  _$jscoverage['/loader/configs.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['74'] = [];
  _$jscoverage['/loader/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['76'] = [];
  _$jscoverage['/loader/configs.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['81'] = [];
  _$jscoverage['/loader/configs.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['88'] = [];
  _$jscoverage['/loader/configs.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['98'] = [];
  _$jscoverage['/loader/configs.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['101'] = [];
  _$jscoverage['/loader/configs.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['107'] = [];
  _$jscoverage['/loader/configs.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['118'] = [];
  _$jscoverage['/loader/configs.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['129'] = [];
  _$jscoverage['/loader/configs.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['132'] = [];
  _$jscoverage['/loader/configs.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['137'] = [];
  _$jscoverage['/loader/configs.js'].branchData['137'][1] = new BranchData();
}
_$jscoverage['/loader/configs.js'].branchData['137'][1].init(94, 28, '!S.startsWith(base, \'file:\')');
function visit396_137_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['132'][1].init(177, 17, 'simulatedLocation');
function visit395_132_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['129'][2].init(90, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit394_129_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['129'][1].init(75, 51, 'isDirectory && base.charAt(base.length - 1) !== \'/\'');
function visit393_129_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['118'][1].init(93, 5, '!base');
function visit392_118_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['107'][1].init(317, 33, 'mod.status === Loader.Status.INIT');
function visit391_107_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['101'][1].init(61, 4, 'path');
function visit390_101_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['98'][1].init(38, 7, 'modules');
function visit389_98_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['88'][1].init(1106, 16, 'config === false');
function visit388_88_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['81'][1].init(695, 8, 'ps[name]');
function visit387_81_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['76'][1].init(58, 27, '!cfg.ignorePackageNameInUri');
function visit386_76_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['74'][1].init(432, 4, 'path');
function visit385_74_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['70'][1].init(25, 8, 'm in cfg');
function visit384_70_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['64'][1].init(94, 20, 'cfg.base || cfg.path');
function visit383_64_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['63'][1].init(50, 15, 'cfg.name || key');
function visit382_63_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['60'][1].init(123, 6, 'config');
function visit381_60_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['59'][1].init(78, 21, 'Config.packages || {}');
function visit380_59_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['44'][1].init(464, 11, 'packageName');
function visit379_44_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['39'][1].init(354, 21, 'packageInfo.isDebug()');
function visit378_39_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['17'][2].init(275, 42, 'location && (locationHref = location.href)');
function visit377_17_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['17'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['17'][1].init(259, 58, '!S.UA.nodejs && location && (locationHref = location.href)');
function visit376_17_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/configs.js'].functionData[0]++;
  _$jscoverage['/loader/configs.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, Utils = Loader.Utils, host = S.Env.host, Config = S.Config, location = host.location, simulatedLocation, locationHref, configFns = Config.fns;
  _$jscoverage['/loader/configs.js'].lineData[17]++;
  if (visit376_17_1(!S.UA.nodejs && visit377_17_2(location && (locationHref = location.href)))) {
    _$jscoverage['/loader/configs.js'].lineData[18]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/loader/configs.js'].lineData[22]++;
  Config.loadModsFn = function(rs, config) {
  _$jscoverage['/loader/configs.js'].functionData[1]++;
  _$jscoverage['/loader/configs.js'].lineData[23]++;
  S.getScript(rs.path, config);
};
  _$jscoverage['/loader/configs.js'].lineData[27]++;
  Config.resolveModFn = function(mod) {
  _$jscoverage['/loader/configs.js'].functionData[2]++;
  _$jscoverage['/loader/configs.js'].lineData[28]++;
  var name = mod.name, min = '-min', t, subPath;
  _$jscoverage['/loader/configs.js'].lineData[32]++;
  var packageInfo = mod.getPackage();
  _$jscoverage['/loader/configs.js'].lineData[33]++;
  var packageUri = packageInfo.getUri();
  _$jscoverage['/loader/configs.js'].lineData[34]++;
  var packageName = packageInfo.getName();
  _$jscoverage['/loader/configs.js'].lineData[35]++;
  var extname = '.' + mod.getType();
  _$jscoverage['/loader/configs.js'].lineData[37]++;
  name = Path.join(Path.dirname(name), Path.basename(name, extname));
  _$jscoverage['/loader/configs.js'].lineData[39]++;
  if (visit378_39_1(packageInfo.isDebug())) {
    _$jscoverage['/loader/configs.js'].lineData[40]++;
    min = '';
  }
  _$jscoverage['/loader/configs.js'].lineData[43]++;
  subPath = name + min + extname;
  _$jscoverage['/loader/configs.js'].lineData[44]++;
  if (visit379_44_1(packageName)) {
    _$jscoverage['/loader/configs.js'].lineData[45]++;
    subPath = Path.relative(packageName, subPath);
  }
  _$jscoverage['/loader/configs.js'].lineData[47]++;
  var uri = packageUri.resolve(subPath);
  _$jscoverage['/loader/configs.js'].lineData[48]++;
  if ((t = mod.getTag())) {
    _$jscoverage['/loader/configs.js'].lineData[49]++;
    t += '.' + mod.getType();
    _$jscoverage['/loader/configs.js'].lineData[50]++;
    uri.query.set('t', t);
  }
  _$jscoverage['/loader/configs.js'].lineData[52]++;
  return uri;
};
  _$jscoverage['/loader/configs.js'].lineData[55]++;
  var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];
  _$jscoverage['/loader/configs.js'].lineData[56]++;
  configFns.packages = function(config) {
  _$jscoverage['/loader/configs.js'].functionData[3]++;
  _$jscoverage['/loader/configs.js'].lineData[57]++;
  var name, Config = this.Config, ps = Config.packages = visit380_59_1(Config.packages || {});
  _$jscoverage['/loader/configs.js'].lineData[60]++;
  if (visit381_60_1(config)) {
    _$jscoverage['/loader/configs.js'].lineData[61]++;
    S.each(config, function(cfg, key) {
  _$jscoverage['/loader/configs.js'].functionData[4]++;
  _$jscoverage['/loader/configs.js'].lineData[63]++;
  name = visit382_63_1(cfg.name || key);
  _$jscoverage['/loader/configs.js'].lineData[64]++;
  var path = visit383_64_1(cfg.base || cfg.path);
  _$jscoverage['/loader/configs.js'].lineData[65]++;
  var newConfig = {
  runtime: S, 
  name: name};
  _$jscoverage['/loader/configs.js'].lineData[69]++;
  S.each(PACKAGE_MEMBERS, function(m) {
  _$jscoverage['/loader/configs.js'].functionData[5]++;
  _$jscoverage['/loader/configs.js'].lineData[70]++;
  if (visit384_70_1(m in cfg)) {
    _$jscoverage['/loader/configs.js'].lineData[71]++;
    newConfig[m] = cfg[m];
  }
});
  _$jscoverage['/loader/configs.js'].lineData[74]++;
  if (visit385_74_1(path)) {
    _$jscoverage['/loader/configs.js'].lineData[75]++;
    path += '/';
    _$jscoverage['/loader/configs.js'].lineData[76]++;
    if (visit386_76_1(!cfg.ignorePackageNameInUri)) {
      _$jscoverage['/loader/configs.js'].lineData[77]++;
      path += name + '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[79]++;
    newConfig.uri = normalizePath(path, true);
  }
  _$jscoverage['/loader/configs.js'].lineData[81]++;
  if (visit387_81_1(ps[name])) {
    _$jscoverage['/loader/configs.js'].lineData[82]++;
    ps[name].reset(newConfig);
  } else {
    _$jscoverage['/loader/configs.js'].lineData[84]++;
    ps[name] = new Loader.Package(newConfig);
  }
});
    _$jscoverage['/loader/configs.js'].lineData[87]++;
    return undefined;
  } else {
    _$jscoverage['/loader/configs.js'].lineData[88]++;
    if (visit388_88_1(config === false)) {
      _$jscoverage['/loader/configs.js'].lineData[89]++;
      Config.packages = {};
      _$jscoverage['/loader/configs.js'].lineData[90]++;
      return undefined;
    } else {
      _$jscoverage['/loader/configs.js'].lineData[92]++;
      return ps;
    }
  }
};
  _$jscoverage['/loader/configs.js'].lineData[96]++;
  configFns.modules = function(modules) {
  _$jscoverage['/loader/configs.js'].functionData[6]++;
  _$jscoverage['/loader/configs.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/loader/configs.js'].lineData[98]++;
  if (visit389_98_1(modules)) {
    _$jscoverage['/loader/configs.js'].lineData[99]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/loader/configs.js'].functionData[7]++;
  _$jscoverage['/loader/configs.js'].lineData[100]++;
  var path = modCfg.path;
  _$jscoverage['/loader/configs.js'].lineData[101]++;
  if (visit390_101_1(path)) {
    _$jscoverage['/loader/configs.js'].lineData[102]++;
    modCfg.uri = normalizePath(path);
    _$jscoverage['/loader/configs.js'].lineData[103]++;
    delete modCfg.path;
  }
  _$jscoverage['/loader/configs.js'].lineData[105]++;
  var mod = Utils.createModuleInfo(self, modName, modCfg);
  _$jscoverage['/loader/configs.js'].lineData[107]++;
  if (visit391_107_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/loader/configs.js'].lineData[108]++;
    S.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/loader/configs.js'].lineData[114]++;
  configFns.base = function(base) {
  _$jscoverage['/loader/configs.js'].functionData[8]++;
  _$jscoverage['/loader/configs.js'].lineData[115]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/loader/configs.js'].lineData[118]++;
  if (visit392_118_1(!base)) {
    _$jscoverage['/loader/configs.js'].lineData[119]++;
    return Config.baseUri.toString();
  }
  _$jscoverage['/loader/configs.js'].lineData[121]++;
  baseUri = normalizePath(base, true);
  _$jscoverage['/loader/configs.js'].lineData[122]++;
  Config.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[123]++;
  return undefined;
};
  _$jscoverage['/loader/configs.js'].lineData[126]++;
  function normalizePath(base, isDirectory) {
    _$jscoverage['/loader/configs.js'].functionData[9]++;
    _$jscoverage['/loader/configs.js'].lineData[127]++;
    var baseUri;
    _$jscoverage['/loader/configs.js'].lineData[128]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/loader/configs.js'].lineData[129]++;
    if (visit393_129_1(isDirectory && visit394_129_2(base.charAt(base.length - 1) !== '/'))) {
      _$jscoverage['/loader/configs.js'].lineData[130]++;
      base += '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[132]++;
    if (visit395_132_1(simulatedLocation)) {
      _$jscoverage['/loader/configs.js'].lineData[133]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/loader/configs.js'].lineData[137]++;
      if (visit396_137_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/loader/configs.js'].lineData[138]++;
        base = 'file:' + base;
      }
      _$jscoverage['/loader/configs.js'].lineData[140]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/loader/configs.js'].lineData[142]++;
    return baseUri;
  }
})(KISSY);
