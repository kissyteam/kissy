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
if (! _$jscoverage['/loader/get-script.js']) {
  _$jscoverage['/loader/get-script.js'] = {};
  _$jscoverage['/loader/get-script.js'].lineData = [];
  _$jscoverage['/loader/get-script.js'].lineData[6] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[7] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[44] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[47] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[55] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[56] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[59] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[60] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[61] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[62] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[63] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[64] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[67] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[69] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[71] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[72] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[75] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[77] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[78] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[79] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[83] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[84] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[85] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[89] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[90] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[93] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[94] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[95] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[97] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[98] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[101] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[103] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[104] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[106] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[107] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[108] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[109] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[112] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[115] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[121] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[123] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[124] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[127] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[128] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[129] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[132] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[133] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[138] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[139] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[140] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[141] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[142] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[144] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[146] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[147] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[150] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[153] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[154] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[155] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[158] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[159] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[161] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[164] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[167] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[169] = 0;
}
if (! _$jscoverage['/loader/get-script.js'].functionData) {
  _$jscoverage['/loader/get-script.js'].functionData = [];
  _$jscoverage['/loader/get-script.js'].functionData[0] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[1] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[2] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[3] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[4] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[5] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[6] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[7] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[8] = 0;
  _$jscoverage['/loader/get-script.js'].functionData[9] = 0;
}
if (! _$jscoverage['/loader/get-script.js'].branchData) {
  _$jscoverage['/loader/get-script.js'].branchData = {};
  _$jscoverage['/loader/get-script.js'].branchData['55'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['59'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['67'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['71'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['77'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['83'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['89'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['93'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['121'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['121'][3] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['123'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['129'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['130'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['131'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['138'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['144'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['153'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['158'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['161'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['161'][1] = new BranchData();
}
_$jscoverage['/loader/get-script.js'].branchData['161'][1].init(3301, 3, 'css');
function visit459_161_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['158'][1].init(3226, 9, '!headNode');
function visit458_158_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['153'][1].init(3077, 7, 'timeout');
function visit457_153_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['144'][1].init(2857, 3, 'css');
function visit456_144_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['138'][1].init(2673, 9, 'useNative');
function visit455_138_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['131'][1].init(42, 25, 'readyState === \'complete\'');
function visit454_131_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['130'][2].init(96, 23, 'readyState === \'loaded\'');
function visit453_130_2(result) {
  _$jscoverage['/loader/get-script.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['130'][1].init(30, 68, 'readyState === \'loaded\' || readyState === \'complete\'');
function visit452_130_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['129'][1].init(63, 99, '!readyState || readyState === \'loaded\' || readyState === \'complete\'');
function visit451_129_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['123'][2].init(2251, 25, 'forceCssPoll && useNative');
function visit450_123_2(result) {
  _$jscoverage['/loader/get-script.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['123'][1].init(2244, 32, 'css && forceCssPoll && useNative');
function visit449_123_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['121'][3].init(2213, 15, 'UA.webkit < 536');
function visit448_121_3(result) {
  _$jscoverage['/loader/get-script.js'].branchData['121'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['121'][2].init(2200, 28, 'UA.webkit && UA.webkit < 536');
function visit447_121_2(result) {
  _$jscoverage['/loader/get-script.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['121'][1].init(2174, 55, 'S.Config.forceCssPoll || (UA.webkit && UA.webkit < 536)');
function visit446_121_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['93'][1].init(1269, 3, 'css');
function visit445_93_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['89'][1].init(1199, 7, 'charset');
function visit444_89_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['83'][1].init(1066, 5, 'attrs');
function visit443_83_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['77'][1].init(21, 5, 'timer');
function visit442_77_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['71'][1].init(744, 20, 'callbacks.length > 1');
function visit441_71_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['67'][1].init(661, 25, 'jsCssCallbacks[url] || []');
function visit440_67_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['59'][1].init(399, 23, 'S.isPlainObject(config)');
function visit439_59_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['55'][1].init(298, 53, 'S.startsWith(Path.extname(url).toLowerCase(), \'.css\')');
function visit438_55_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/get-script.js'].functionData[0]++;
  _$jscoverage['/loader/get-script.js'].lineData[7]++;
  var MILLISECONDS_OF_SECOND = 1000, doc = S.Env.host.document, Utils = S.Loader.Utils, Path = S.Path, jsCssCallbacks = {}, headNode, UA = S.UA;
  _$jscoverage['/loader/get-script.js'].lineData[44]++;
  S.getScript = function(url, success, charset) {
  _$jscoverage['/loader/get-script.js'].functionData[1]++;
  _$jscoverage['/loader/get-script.js'].lineData[47]++;
  var config = success, css = 0, error, timeout, attrs, callbacks, timer;
  _$jscoverage['/loader/get-script.js'].lineData[55]++;
  if (visit438_55_1(S.startsWith(Path.extname(url).toLowerCase(), '.css'))) {
    _$jscoverage['/loader/get-script.js'].lineData[56]++;
    css = 1;
  }
  _$jscoverage['/loader/get-script.js'].lineData[59]++;
  if (visit439_59_1(S.isPlainObject(config))) {
    _$jscoverage['/loader/get-script.js'].lineData[60]++;
    success = config.success;
    _$jscoverage['/loader/get-script.js'].lineData[61]++;
    error = config.error;
    _$jscoverage['/loader/get-script.js'].lineData[62]++;
    timeout = config.timeout;
    _$jscoverage['/loader/get-script.js'].lineData[63]++;
    charset = config.charset;
    _$jscoverage['/loader/get-script.js'].lineData[64]++;
    attrs = config.attrs;
  }
  _$jscoverage['/loader/get-script.js'].lineData[67]++;
  callbacks = jsCssCallbacks[url] = visit440_67_1(jsCssCallbacks[url] || []);
  _$jscoverage['/loader/get-script.js'].lineData[69]++;
  callbacks.push([success, error]);
  _$jscoverage['/loader/get-script.js'].lineData[71]++;
  if (visit441_71_1(callbacks.length > 1)) {
    _$jscoverage['/loader/get-script.js'].lineData[72]++;
    return callbacks.node;
  }
  _$jscoverage['/loader/get-script.js'].lineData[75]++;
  var node = doc.createElement(css ? 'link' : 'script'), clearTimer = function() {
  _$jscoverage['/loader/get-script.js'].functionData[2]++;
  _$jscoverage['/loader/get-script.js'].lineData[77]++;
  if (visit442_77_1(timer)) {
    _$jscoverage['/loader/get-script.js'].lineData[78]++;
    timer.cancel();
    _$jscoverage['/loader/get-script.js'].lineData[79]++;
    timer = undefined;
  }
};
  _$jscoverage['/loader/get-script.js'].lineData[83]++;
  if (visit443_83_1(attrs)) {
    _$jscoverage['/loader/get-script.js'].lineData[84]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/loader/get-script.js'].functionData[3]++;
  _$jscoverage['/loader/get-script.js'].lineData[85]++;
  node.setAttribute(n, v);
});
  }
  _$jscoverage['/loader/get-script.js'].lineData[89]++;
  if (visit444_89_1(charset)) {
    _$jscoverage['/loader/get-script.js'].lineData[90]++;
    node.charset = charset;
  }
  _$jscoverage['/loader/get-script.js'].lineData[93]++;
  if (visit445_93_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[94]++;
    node.href = url;
    _$jscoverage['/loader/get-script.js'].lineData[95]++;
    node.rel = 'stylesheet';
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[97]++;
    node.src = url;
    _$jscoverage['/loader/get-script.js'].lineData[98]++;
    node.async = true;
  }
  _$jscoverage['/loader/get-script.js'].lineData[101]++;
  callbacks.node = node;
  _$jscoverage['/loader/get-script.js'].lineData[103]++;
  var end = function(error) {
  _$jscoverage['/loader/get-script.js'].functionData[4]++;
  _$jscoverage['/loader/get-script.js'].lineData[104]++;
  var index = error, fn;
  _$jscoverage['/loader/get-script.js'].lineData[106]++;
  clearTimer();
  _$jscoverage['/loader/get-script.js'].lineData[107]++;
  S.each(jsCssCallbacks[url], function(callback) {
  _$jscoverage['/loader/get-script.js'].functionData[5]++;
  _$jscoverage['/loader/get-script.js'].lineData[108]++;
  if ((fn = callback[index])) {
    _$jscoverage['/loader/get-script.js'].lineData[109]++;
    fn.call(node);
  }
});
  _$jscoverage['/loader/get-script.js'].lineData[112]++;
  delete jsCssCallbacks[url];
};
  _$jscoverage['/loader/get-script.js'].lineData[115]++;
  var useNative = 'onload' in node;
  _$jscoverage['/loader/get-script.js'].lineData[121]++;
  var forceCssPoll = visit446_121_1(S.Config.forceCssPoll || (visit447_121_2(UA.webkit && visit448_121_3(UA.webkit < 536))));
  _$jscoverage['/loader/get-script.js'].lineData[123]++;
  if (visit449_123_1(css && visit450_123_2(forceCssPoll && useNative))) {
    _$jscoverage['/loader/get-script.js'].lineData[124]++;
    useNative = false;
  }
  _$jscoverage['/loader/get-script.js'].lineData[127]++;
  function onload() {
    _$jscoverage['/loader/get-script.js'].functionData[6]++;
    _$jscoverage['/loader/get-script.js'].lineData[128]++;
    var readyState = node.readyState;
    _$jscoverage['/loader/get-script.js'].lineData[129]++;
    if (visit451_129_1(!readyState || visit452_130_1(visit453_130_2(readyState === 'loaded') || visit454_131_1(readyState === 'complete')))) {
      _$jscoverage['/loader/get-script.js'].lineData[132]++;
      node.onreadystatechange = node.onload = null;
      _$jscoverage['/loader/get-script.js'].lineData[133]++;
      end(0);
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[138]++;
  if (visit455_138_1(useNative)) {
    _$jscoverage['/loader/get-script.js'].lineData[139]++;
    node.onload = onload;
    _$jscoverage['/loader/get-script.js'].lineData[140]++;
    node.onerror = function() {
  _$jscoverage['/loader/get-script.js'].functionData[7]++;
  _$jscoverage['/loader/get-script.js'].lineData[141]++;
  node.onerror = null;
  _$jscoverage['/loader/get-script.js'].lineData[142]++;
  end(1);
};
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[144]++;
    if (visit456_144_1(css)) {
      _$jscoverage['/loader/get-script.js'].lineData[146]++;
      Utils.pollCss(node, function() {
  _$jscoverage['/loader/get-script.js'].functionData[8]++;
  _$jscoverage['/loader/get-script.js'].lineData[147]++;
  end(0);
});
    } else {
      _$jscoverage['/loader/get-script.js'].lineData[150]++;
      node.onreadystatechange = onload;
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[153]++;
  if (visit457_153_1(timeout)) {
    _$jscoverage['/loader/get-script.js'].lineData[154]++;
    timer = S.later(function() {
  _$jscoverage['/loader/get-script.js'].functionData[9]++;
  _$jscoverage['/loader/get-script.js'].lineData[155]++;
  end(1);
}, timeout * MILLISECONDS_OF_SECOND);
  }
  _$jscoverage['/loader/get-script.js'].lineData[158]++;
  if (visit458_158_1(!headNode)) {
    _$jscoverage['/loader/get-script.js'].lineData[159]++;
    headNode = Utils.docHead();
  }
  _$jscoverage['/loader/get-script.js'].lineData[161]++;
  if (visit459_161_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[164]++;
    headNode.appendChild(node);
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[167]++;
    headNode.insertBefore(node, headNode.firstChild);
  }
  _$jscoverage['/loader/get-script.js'].lineData[169]++;
  return node;
};
})(KISSY);
