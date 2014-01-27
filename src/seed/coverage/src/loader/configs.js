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
  _$jscoverage['/loader/configs.js'].lineData[18] = 0;
  _$jscoverage['/loader/configs.js'].lineData[19] = 0;
  _$jscoverage['/loader/configs.js'].lineData[23] = 0;
  _$jscoverage['/loader/configs.js'].lineData[24] = 0;
  _$jscoverage['/loader/configs.js'].lineData[28] = 0;
  _$jscoverage['/loader/configs.js'].lineData[29] = 0;
  _$jscoverage['/loader/configs.js'].lineData[33] = 0;
  _$jscoverage['/loader/configs.js'].lineData[34] = 0;
  _$jscoverage['/loader/configs.js'].lineData[35] = 0;
  _$jscoverage['/loader/configs.js'].lineData[36] = 0;
  _$jscoverage['/loader/configs.js'].lineData[38] = 0;
  _$jscoverage['/loader/configs.js'].lineData[40] = 0;
  _$jscoverage['/loader/configs.js'].lineData[41] = 0;
  _$jscoverage['/loader/configs.js'].lineData[44] = 0;
  _$jscoverage['/loader/configs.js'].lineData[45] = 0;
  _$jscoverage['/loader/configs.js'].lineData[46] = 0;
  _$jscoverage['/loader/configs.js'].lineData[48] = 0;
  _$jscoverage['/loader/configs.js'].lineData[49] = 0;
  _$jscoverage['/loader/configs.js'].lineData[50] = 0;
  _$jscoverage['/loader/configs.js'].lineData[51] = 0;
  _$jscoverage['/loader/configs.js'].lineData[53] = 0;
  _$jscoverage['/loader/configs.js'].lineData[56] = 0;
  _$jscoverage['/loader/configs.js'].lineData[58] = 0;
  _$jscoverage['/loader/configs.js'].lineData[59] = 0;
  _$jscoverage['/loader/configs.js'].lineData[60] = 0;
  _$jscoverage['/loader/configs.js'].lineData[61] = 0;
  _$jscoverage['/loader/configs.js'].lineData[62] = 0;
  _$jscoverage['/loader/configs.js'].lineData[64] = 0;
  _$jscoverage['/loader/configs.js'].lineData[67] = 0;
  _$jscoverage['/loader/configs.js'].lineData[68] = 0;
  _$jscoverage['/loader/configs.js'].lineData[71] = 0;
  _$jscoverage['/loader/configs.js'].lineData[72] = 0;
  _$jscoverage['/loader/configs.js'].lineData[74] = 0;
  _$jscoverage['/loader/configs.js'].lineData[75] = 0;
  _$jscoverage['/loader/configs.js'].lineData[76] = 0;
  _$jscoverage['/loader/configs.js'].lineData[80] = 0;
  _$jscoverage['/loader/configs.js'].lineData[81] = 0;
  _$jscoverage['/loader/configs.js'].lineData[82] = 0;
  _$jscoverage['/loader/configs.js'].lineData[85] = 0;
  _$jscoverage['/loader/configs.js'].lineData[86] = 0;
  _$jscoverage['/loader/configs.js'].lineData[87] = 0;
  _$jscoverage['/loader/configs.js'].lineData[88] = 0;
  _$jscoverage['/loader/configs.js'].lineData[90] = 0;
  _$jscoverage['/loader/configs.js'].lineData[92] = 0;
  _$jscoverage['/loader/configs.js'].lineData[93] = 0;
  _$jscoverage['/loader/configs.js'].lineData[95] = 0;
  _$jscoverage['/loader/configs.js'].lineData[98] = 0;
  _$jscoverage['/loader/configs.js'].lineData[99] = 0;
  _$jscoverage['/loader/configs.js'].lineData[100] = 0;
  _$jscoverage['/loader/configs.js'].lineData[101] = 0;
  _$jscoverage['/loader/configs.js'].lineData[103] = 0;
  _$jscoverage['/loader/configs.js'].lineData[107] = 0;
  _$jscoverage['/loader/configs.js'].lineData[108] = 0;
  _$jscoverage['/loader/configs.js'].lineData[109] = 0;
  _$jscoverage['/loader/configs.js'].lineData[110] = 0;
  _$jscoverage['/loader/configs.js'].lineData[111] = 0;
  _$jscoverage['/loader/configs.js'].lineData[112] = 0;
  _$jscoverage['/loader/configs.js'].lineData[113] = 0;
  _$jscoverage['/loader/configs.js'].lineData[114] = 0;
  _$jscoverage['/loader/configs.js'].lineData[116] = 0;
  _$jscoverage['/loader/configs.js'].lineData[118] = 0;
  _$jscoverage['/loader/configs.js'].lineData[119] = 0;
  _$jscoverage['/loader/configs.js'].lineData[125] = 0;
  _$jscoverage['/loader/configs.js'].lineData[126] = 0;
  _$jscoverage['/loader/configs.js'].lineData[130] = 0;
  _$jscoverage['/loader/configs.js'].lineData[131] = 0;
  _$jscoverage['/loader/configs.js'].lineData[134] = 0;
  _$jscoverage['/loader/configs.js'].lineData[135] = 0;
  _$jscoverage['/loader/configs.js'].lineData[137] = 0;
  _$jscoverage['/loader/configs.js'].lineData[139] = 0;
  _$jscoverage['/loader/configs.js'].lineData[140] = 0;
  _$jscoverage['/loader/configs.js'].lineData[146] = 0;
  _$jscoverage['/loader/configs.js'].lineData[148] = 0;
  _$jscoverage['/loader/configs.js'].lineData[151] = 0;
  _$jscoverage['/loader/configs.js'].lineData[152] = 0;
  _$jscoverage['/loader/configs.js'].lineData[153] = 0;
  _$jscoverage['/loader/configs.js'].lineData[154] = 0;
  _$jscoverage['/loader/configs.js'].lineData[155] = 0;
  _$jscoverage['/loader/configs.js'].lineData[157] = 0;
  _$jscoverage['/loader/configs.js'].lineData[158] = 0;
  _$jscoverage['/loader/configs.js'].lineData[162] = 0;
  _$jscoverage['/loader/configs.js'].lineData[163] = 0;
  _$jscoverage['/loader/configs.js'].lineData[165] = 0;
  _$jscoverage['/loader/configs.js'].lineData[167] = 0;
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
  _$jscoverage['/loader/configs.js'].functionData[10] = 0;
}
if (! _$jscoverage['/loader/configs.js'].branchData) {
  _$jscoverage['/loader/configs.js'].branchData = {};
  _$jscoverage['/loader/configs.js'].branchData['18'] = [];
  _$jscoverage['/loader/configs.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['40'] = [];
  _$jscoverage['/loader/configs.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['45'] = [];
  _$jscoverage['/loader/configs.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['60'] = [];
  _$jscoverage['/loader/configs.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['70'] = [];
  _$jscoverage['/loader/configs.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['71'] = [];
  _$jscoverage['/loader/configs.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['74'] = [];
  _$jscoverage['/loader/configs.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['75'] = [];
  _$jscoverage['/loader/configs.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['81'] = [];
  _$jscoverage['/loader/configs.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['85'] = [];
  _$jscoverage['/loader/configs.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['87'] = [];
  _$jscoverage['/loader/configs.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['92'] = [];
  _$jscoverage['/loader/configs.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['99'] = [];
  _$jscoverage['/loader/configs.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['109'] = [];
  _$jscoverage['/loader/configs.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['112'] = [];
  _$jscoverage['/loader/configs.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['118'] = [];
  _$jscoverage['/loader/configs.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['130'] = [];
  _$jscoverage['/loader/configs.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['139'] = [];
  _$jscoverage['/loader/configs.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['154'] = [];
  _$jscoverage['/loader/configs.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['157'] = [];
  _$jscoverage['/loader/configs.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/loader/configs.js'].branchData['162'] = [];
  _$jscoverage['/loader/configs.js'].branchData['162'][1] = new BranchData();
}
_$jscoverage['/loader/configs.js'].branchData['162'][1].init(94, 28, '!S.startsWith(base, \'file:\')');
function visit398_162_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['157'][1].init(177, 17, 'simulatedLocation');
function visit397_157_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['154'][2].init(90, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit396_154_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['154'][1].init(75, 51, 'isDirectory && base.charAt(base.length - 1) !== \'/\'');
function visit395_154_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['139'][1].init(301, 12, '!corePackage');
function visit394_139_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['130'][1].init(94, 5, '!base');
function visit393_130_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['118'][1].init(317, 33, 'mod.status === Loader.Status.INIT');
function visit392_118_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['112'][1].init(61, 4, 'path');
function visit391_112_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['109'][1].init(38, 7, 'modules');
function visit390_109_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['99'][1].init(1099, 16, 'config === false');
function visit389_99_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['92'][1].init(695, 8, 'ps[name]');
function visit388_92_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['87'][1].init(58, 27, '!cfg.ignorePackageNameInUri');
function visit387_87_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['85'][1].init(432, 4, 'path');
function visit386_85_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['81'][1].init(25, 8, 'm in cfg');
function visit385_81_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['75'][1].init(94, 20, 'cfg.base || cfg.path');
function visit384_75_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['74'][1].init(50, 15, 'cfg.name || key');
function visit383_74_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['71'][1].init(123, 6, 'config');
function visit382_71_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['70'][1].init(78, 21, 'Config.packages || {}');
function visit381_70_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['60'][1].init(42, 4, 'base');
function visit380_60_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['45'][1].init(464, 11, 'packageName');
function visit379_45_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['40'][1].init(354, 21, 'packageInfo.isDebug()');
function visit378_40_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['18'][2].init(309, 42, 'location && (locationHref = location.href)');
function visit377_18_2(result) {
  _$jscoverage['/loader/configs.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].branchData['18'][1].init(293, 58, '!S.UA.nodejs && location && (locationHref = location.href)');
function visit376_18_1(result) {
  _$jscoverage['/loader/configs.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/configs.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/configs.js'].functionData[0]++;
  _$jscoverage['/loader/configs.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, Package = Loader.Package, Utils = Loader.Utils, host = S.Env.host, Config = S.Config, location = host.location, simulatedLocation, locationHref, configFns = Config.fns;
  _$jscoverage['/loader/configs.js'].lineData[18]++;
  if (visit376_18_1(!S.UA.nodejs && visit377_18_2(location && (locationHref = location.href)))) {
    _$jscoverage['/loader/configs.js'].lineData[19]++;
    simulatedLocation = new S.Uri(locationHref);
  }
  _$jscoverage['/loader/configs.js'].lineData[23]++;
  Config.loadModsFn = function(rs, config) {
  _$jscoverage['/loader/configs.js'].functionData[1]++;
  _$jscoverage['/loader/configs.js'].lineData[24]++;
  S.getScript(rs.path, config);
};
  _$jscoverage['/loader/configs.js'].lineData[28]++;
  Config.resolveModFn = function(mod) {
  _$jscoverage['/loader/configs.js'].functionData[2]++;
  _$jscoverage['/loader/configs.js'].lineData[29]++;
  var name = mod.name, min = '-min', t, subPath;
  _$jscoverage['/loader/configs.js'].lineData[33]++;
  var packageInfo = mod.getPackage();
  _$jscoverage['/loader/configs.js'].lineData[34]++;
  var packageUri = packageInfo.getUri();
  _$jscoverage['/loader/configs.js'].lineData[35]++;
  var packageName = packageInfo.getName();
  _$jscoverage['/loader/configs.js'].lineData[36]++;
  var extname = '.' + mod.getType();
  _$jscoverage['/loader/configs.js'].lineData[38]++;
  name = Path.join(Path.dirname(name), Path.basename(name, extname));
  _$jscoverage['/loader/configs.js'].lineData[40]++;
  if (visit378_40_1(packageInfo.isDebug())) {
    _$jscoverage['/loader/configs.js'].lineData[41]++;
    min = '';
  }
  _$jscoverage['/loader/configs.js'].lineData[44]++;
  subPath = name + min + extname;
  _$jscoverage['/loader/configs.js'].lineData[45]++;
  if (visit379_45_1(packageName)) {
    _$jscoverage['/loader/configs.js'].lineData[46]++;
    subPath = Path.relative(packageName, subPath);
  }
  _$jscoverage['/loader/configs.js'].lineData[48]++;
  var uri = packageUri.resolve(subPath);
  _$jscoverage['/loader/configs.js'].lineData[49]++;
  if ((t = mod.getTag())) {
    _$jscoverage['/loader/configs.js'].lineData[50]++;
    t += '.' + mod.getType();
    _$jscoverage['/loader/configs.js'].lineData[51]++;
    uri.query.set('t', t);
  }
  _$jscoverage['/loader/configs.js'].lineData[53]++;
  return uri;
};
  _$jscoverage['/loader/configs.js'].lineData[56]++;
  var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];
  _$jscoverage['/loader/configs.js'].lineData[58]++;
  configFns.core = function(cfg) {
  _$jscoverage['/loader/configs.js'].functionData[3]++;
  _$jscoverage['/loader/configs.js'].lineData[59]++;
  var base = cfg.base;
  _$jscoverage['/loader/configs.js'].lineData[60]++;
  if (visit380_60_1(base)) {
    _$jscoverage['/loader/configs.js'].lineData[61]++;
    cfg.uri = normalizePath(base, true);
    _$jscoverage['/loader/configs.js'].lineData[62]++;
    delete cfg.base;
  }
  _$jscoverage['/loader/configs.js'].lineData[64]++;
  this.Env.corePackage.reset(cfg);
};
  _$jscoverage['/loader/configs.js'].lineData[67]++;
  configFns.packages = function(config) {
  _$jscoverage['/loader/configs.js'].functionData[4]++;
  _$jscoverage['/loader/configs.js'].lineData[68]++;
  var name, Config = this.Config, ps = Config.packages = visit381_70_1(Config.packages || {});
  _$jscoverage['/loader/configs.js'].lineData[71]++;
  if (visit382_71_1(config)) {
    _$jscoverage['/loader/configs.js'].lineData[72]++;
    S.each(config, function(cfg, key) {
  _$jscoverage['/loader/configs.js'].functionData[5]++;
  _$jscoverage['/loader/configs.js'].lineData[74]++;
  name = visit383_74_1(cfg.name || key);
  _$jscoverage['/loader/configs.js'].lineData[75]++;
  var path = visit384_75_1(cfg.base || cfg.path);
  _$jscoverage['/loader/configs.js'].lineData[76]++;
  var newConfig = {
  runtime: S, 
  name: name};
  _$jscoverage['/loader/configs.js'].lineData[80]++;
  S.each(PACKAGE_MEMBERS, function(m) {
  _$jscoverage['/loader/configs.js'].functionData[6]++;
  _$jscoverage['/loader/configs.js'].lineData[81]++;
  if (visit385_81_1(m in cfg)) {
    _$jscoverage['/loader/configs.js'].lineData[82]++;
    newConfig[m] = cfg[m];
  }
});
  _$jscoverage['/loader/configs.js'].lineData[85]++;
  if (visit386_85_1(path)) {
    _$jscoverage['/loader/configs.js'].lineData[86]++;
    path += '/';
    _$jscoverage['/loader/configs.js'].lineData[87]++;
    if (visit387_87_1(!cfg.ignorePackageNameInUri)) {
      _$jscoverage['/loader/configs.js'].lineData[88]++;
      path += name + '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[90]++;
    newConfig.uri = normalizePath(path, true);
  }
  _$jscoverage['/loader/configs.js'].lineData[92]++;
  if (visit388_92_1(ps[name])) {
    _$jscoverage['/loader/configs.js'].lineData[93]++;
    ps[name].reset(newConfig);
  } else {
    _$jscoverage['/loader/configs.js'].lineData[95]++;
    ps[name] = new Package(newConfig);
  }
});
    _$jscoverage['/loader/configs.js'].lineData[98]++;
    return undefined;
  } else {
    _$jscoverage['/loader/configs.js'].lineData[99]++;
    if (visit389_99_1(config === false)) {
      _$jscoverage['/loader/configs.js'].lineData[100]++;
      Config.packages = {};
      _$jscoverage['/loader/configs.js'].lineData[101]++;
      return undefined;
    } else {
      _$jscoverage['/loader/configs.js'].lineData[103]++;
      return ps;
    }
  }
};
  _$jscoverage['/loader/configs.js'].lineData[107]++;
  configFns.modules = function(modules) {
  _$jscoverage['/loader/configs.js'].functionData[7]++;
  _$jscoverage['/loader/configs.js'].lineData[108]++;
  var self = this;
  _$jscoverage['/loader/configs.js'].lineData[109]++;
  if (visit390_109_1(modules)) {
    _$jscoverage['/loader/configs.js'].lineData[110]++;
    S.each(modules, function(modCfg, modName) {
  _$jscoverage['/loader/configs.js'].functionData[8]++;
  _$jscoverage['/loader/configs.js'].lineData[111]++;
  var path = modCfg.path;
  _$jscoverage['/loader/configs.js'].lineData[112]++;
  if (visit391_112_1(path)) {
    _$jscoverage['/loader/configs.js'].lineData[113]++;
    modCfg.uri = normalizePath(path);
    _$jscoverage['/loader/configs.js'].lineData[114]++;
    delete modCfg.path;
  }
  _$jscoverage['/loader/configs.js'].lineData[116]++;
  var mod = Utils.createModuleInfo(self, modName, modCfg);
  _$jscoverage['/loader/configs.js'].lineData[118]++;
  if (visit392_118_1(mod.status === Loader.Status.INIT)) {
    _$jscoverage['/loader/configs.js'].lineData[119]++;
    S.mix(mod, modCfg);
  }
});
  }
};
  _$jscoverage['/loader/configs.js'].lineData[125]++;
  configFns.base = function(base) {
  _$jscoverage['/loader/configs.js'].functionData[9]++;
  _$jscoverage['/loader/configs.js'].lineData[126]++;
  var self = this, Config = self.Config, baseUri;
  _$jscoverage['/loader/configs.js'].lineData[130]++;
  if (visit393_130_1(!base)) {
    _$jscoverage['/loader/configs.js'].lineData[131]++;
    return Config.baseUri.toString();
  }
  _$jscoverage['/loader/configs.js'].lineData[134]++;
  baseUri = normalizePath(base, true);
  _$jscoverage['/loader/configs.js'].lineData[135]++;
  Config.baseUri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[137]++;
  var corePackage = self.Env.corePackage;
  _$jscoverage['/loader/configs.js'].lineData[139]++;
  if (visit394_139_1(!corePackage)) {
    _$jscoverage['/loader/configs.js'].lineData[140]++;
    corePackage = self.Env.corePackage = new Package({
  name: '', 
  runtime: S});
  }
  _$jscoverage['/loader/configs.js'].lineData[146]++;
  corePackage.uri = baseUri;
  _$jscoverage['/loader/configs.js'].lineData[148]++;
  return undefined;
};
  _$jscoverage['/loader/configs.js'].lineData[151]++;
  function normalizePath(base, isDirectory) {
    _$jscoverage['/loader/configs.js'].functionData[10]++;
    _$jscoverage['/loader/configs.js'].lineData[152]++;
    var baseUri;
    _$jscoverage['/loader/configs.js'].lineData[153]++;
    base = base.replace(/\\/g, '/');
    _$jscoverage['/loader/configs.js'].lineData[154]++;
    if (visit395_154_1(isDirectory && visit396_154_2(base.charAt(base.length - 1) !== '/'))) {
      _$jscoverage['/loader/configs.js'].lineData[155]++;
      base += '/';
    }
    _$jscoverage['/loader/configs.js'].lineData[157]++;
    if (visit397_157_1(simulatedLocation)) {
      _$jscoverage['/loader/configs.js'].lineData[158]++;
      baseUri = simulatedLocation.resolve(base);
    } else {
      _$jscoverage['/loader/configs.js'].lineData[162]++;
      if (visit398_162_1(!S.startsWith(base, 'file:'))) {
        _$jscoverage['/loader/configs.js'].lineData[163]++;
        base = 'file:' + base;
      }
      _$jscoverage['/loader/configs.js'].lineData[165]++;
      baseUri = new S.Uri(base);
    }
    _$jscoverage['/loader/configs.js'].lineData[167]++;
    return baseUri;
  }
})(KISSY);
