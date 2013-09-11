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
  _$jscoverage['/loader/get-script.js'].lineData[21] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[53] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[61] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[62] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[65] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[66] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[67] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[68] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[69] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[70] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[73] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[75] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[77] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[78] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[81] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[83] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[84] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[85] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[89] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[90] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[91] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[95] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[96] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[99] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[100] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[101] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[103] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[104] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[107] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[109] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[110] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[112] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[113] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[114] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[115] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[118] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[122] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[123] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[126] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[127] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[128] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[131] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[132] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[137] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[138] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[139] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[140] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[141] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[145] = 0;
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
  _$jscoverage['/loader/get-script.js'].branchData['19'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['61'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['65'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['73'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['77'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['83'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['89'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['95'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['99'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['114'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['122'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['128'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['129'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['130'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['137'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['145'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['153'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['158'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['161'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['161'][1] = new BranchData();
}
_$jscoverage['/loader/get-script.js'].branchData['161'][1].init(3450, 3, 'css');
function visit423_161_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['158'][1].init(3360, 9, '!headNode');
function visit422_158_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['153'][1].init(3186, 7, 'timeout');
function visit421_153_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['145'][1].init(2972, 3, 'css');
function visit420_145_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['137'][1].init(2702, 9, 'useNative');
function visit419_137_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['130'][1].init(46, 24, 'readyState == "complete"');
function visit418_130_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['129'][2].init(111, 22, 'readyState == "loaded"');
function visit417_129_2(result) {
  _$jscoverage['/loader/get-script.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['129'][1].init(35, 71, 'readyState == "loaded" || readyState == "complete"');
function visit416_129_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['128'][1].init(73, 107, '!readyState || readyState == "loaded" || readyState == "complete"');
function visit415_128_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['122'][1].init(2223, 18, 'css && isOldWebKit');
function visit414_122_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['114'][1].init(30, 20, 'fn = callback[index]');
function visit413_114_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['99'][1].init(1493, 3, 'css');
function visit412_99_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['95'][1].init(1407, 7, 'charset');
function visit411_95_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['89'][1].init(1248, 5, 'attrs');
function visit410_89_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['83'][1].init(26, 5, 'timer');
function visit409_83_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['77'][1].init(874, 20, 'callbacks.length > 1');
function visit408_77_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['73'][1].init(779, 25, 'jsCssCallbacks[url] || []');
function visit407_73_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['65'][1].init(466, 23, 'S.isPlainObject(config)');
function visit406_65_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['61'][1].init(349, 53, 'S.startsWith(Path.extname(url).toLowerCase(), \'.css\')');
function visit405_61_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['19'][1].init(505, 15, 'UA.webkit < 536');
function visit404_19_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/get-script.js'].functionData[0]++;
  _$jscoverage['/loader/get-script.js'].lineData[7]++;
  var MILLISECONDS_OF_SECOND = 1000, doc = S.Env.host.document, Utils = S.Loader.Utils, Path = S.Path, jsCssCallbacks = {}, headNode, UA = S.UA, isOldWebKit = visit404_19_1(UA.webkit < 536);
  _$jscoverage['/loader/get-script.js'].lineData[21]++;
  S.mix(S, {
  getScript: function(url, success, charset) {
  _$jscoverage['/loader/get-script.js'].functionData[1]++;
  _$jscoverage['/loader/get-script.js'].lineData[53]++;
  var config = success, css = 0, error, timeout, attrs, callbacks, timer;
  _$jscoverage['/loader/get-script.js'].lineData[61]++;
  if (visit405_61_1(S.startsWith(Path.extname(url).toLowerCase(), '.css'))) {
    _$jscoverage['/loader/get-script.js'].lineData[62]++;
    css = 1;
  }
  _$jscoverage['/loader/get-script.js'].lineData[65]++;
  if (visit406_65_1(S.isPlainObject(config))) {
    _$jscoverage['/loader/get-script.js'].lineData[66]++;
    success = config['success'];
    _$jscoverage['/loader/get-script.js'].lineData[67]++;
    error = config['error'];
    _$jscoverage['/loader/get-script.js'].lineData[68]++;
    timeout = config['timeout'];
    _$jscoverage['/loader/get-script.js'].lineData[69]++;
    charset = config['charset'];
    _$jscoverage['/loader/get-script.js'].lineData[70]++;
    attrs = config['attrs'];
  }
  _$jscoverage['/loader/get-script.js'].lineData[73]++;
  callbacks = jsCssCallbacks[url] = visit407_73_1(jsCssCallbacks[url] || []);
  _$jscoverage['/loader/get-script.js'].lineData[75]++;
  callbacks.push([success, error]);
  _$jscoverage['/loader/get-script.js'].lineData[77]++;
  if (visit408_77_1(callbacks.length > 1)) {
    _$jscoverage['/loader/get-script.js'].lineData[78]++;
    return callbacks.node;
  }
  _$jscoverage['/loader/get-script.js'].lineData[81]++;
  var node = doc.createElement(css ? 'link' : 'script'), clearTimer = function() {
  _$jscoverage['/loader/get-script.js'].functionData[2]++;
  _$jscoverage['/loader/get-script.js'].lineData[83]++;
  if (visit409_83_1(timer)) {
    _$jscoverage['/loader/get-script.js'].lineData[84]++;
    timer.cancel();
    _$jscoverage['/loader/get-script.js'].lineData[85]++;
    timer = undefined;
  }
};
  _$jscoverage['/loader/get-script.js'].lineData[89]++;
  if (visit410_89_1(attrs)) {
    _$jscoverage['/loader/get-script.js'].lineData[90]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/loader/get-script.js'].functionData[3]++;
  _$jscoverage['/loader/get-script.js'].lineData[91]++;
  node.setAttribute(n, v);
});
  }
  _$jscoverage['/loader/get-script.js'].lineData[95]++;
  if (visit411_95_1(charset)) {
    _$jscoverage['/loader/get-script.js'].lineData[96]++;
    node.charset = charset;
  }
  _$jscoverage['/loader/get-script.js'].lineData[99]++;
  if (visit412_99_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[100]++;
    node.href = url;
    _$jscoverage['/loader/get-script.js'].lineData[101]++;
    node.rel = 'stylesheet';
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[103]++;
    node.src = url;
    _$jscoverage['/loader/get-script.js'].lineData[104]++;
    node.async = true;
  }
  _$jscoverage['/loader/get-script.js'].lineData[107]++;
  callbacks.node = node;
  _$jscoverage['/loader/get-script.js'].lineData[109]++;
  var end = function(error) {
  _$jscoverage['/loader/get-script.js'].functionData[4]++;
  _$jscoverage['/loader/get-script.js'].lineData[110]++;
  var index = error, fn;
  _$jscoverage['/loader/get-script.js'].lineData[112]++;
  clearTimer();
  _$jscoverage['/loader/get-script.js'].lineData[113]++;
  S.each(jsCssCallbacks[url], function(callback) {
  _$jscoverage['/loader/get-script.js'].functionData[5]++;
  _$jscoverage['/loader/get-script.js'].lineData[114]++;
  if (visit413_114_1(fn = callback[index])) {
    _$jscoverage['/loader/get-script.js'].lineData[115]++;
    fn.call(node);
  }
});
  _$jscoverage['/loader/get-script.js'].lineData[118]++;
  delete jsCssCallbacks[url];
}, useNative = 'onload' in node;
  _$jscoverage['/loader/get-script.js'].lineData[122]++;
  if (visit414_122_1(css && isOldWebKit)) {
    _$jscoverage['/loader/get-script.js'].lineData[123]++;
    useNative = false;
  }
  _$jscoverage['/loader/get-script.js'].lineData[126]++;
  function onload() {
    _$jscoverage['/loader/get-script.js'].functionData[6]++;
    _$jscoverage['/loader/get-script.js'].lineData[127]++;
    var readyState = node.readyState;
    _$jscoverage['/loader/get-script.js'].lineData[128]++;
    if (visit415_128_1(!readyState || visit416_129_1(visit417_129_2(readyState == "loaded") || visit418_130_1(readyState == "complete")))) {
      _$jscoverage['/loader/get-script.js'].lineData[131]++;
      node.onreadystatechange = node.onload = null;
      _$jscoverage['/loader/get-script.js'].lineData[132]++;
      end(0);
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[137]++;
  if (visit419_137_1(useNative)) {
    _$jscoverage['/loader/get-script.js'].lineData[138]++;
    node.onload = onload;
    _$jscoverage['/loader/get-script.js'].lineData[139]++;
    node.onerror = function() {
  _$jscoverage['/loader/get-script.js'].functionData[7]++;
  _$jscoverage['/loader/get-script.js'].lineData[140]++;
  node.onerror = null;
  _$jscoverage['/loader/get-script.js'].lineData[141]++;
  end(1);
};
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[145]++;
    if (visit420_145_1(css)) {
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
  if (visit421_153_1(timeout)) {
    _$jscoverage['/loader/get-script.js'].lineData[154]++;
    timer = S.later(function() {
  _$jscoverage['/loader/get-script.js'].functionData[9]++;
  _$jscoverage['/loader/get-script.js'].lineData[155]++;
  end(1);
}, timeout * MILLISECONDS_OF_SECOND);
  }
  _$jscoverage['/loader/get-script.js'].lineData[158]++;
  if (visit422_158_1(!headNode)) {
    _$jscoverage['/loader/get-script.js'].lineData[159]++;
    headNode = Utils.docHead();
  }
  _$jscoverage['/loader/get-script.js'].lineData[161]++;
  if (visit423_161_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[164]++;
    headNode.appendChild(node);
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[167]++;
    headNode.insertBefore(node, headNode.firstChild);
  }
  _$jscoverage['/loader/get-script.js'].lineData[169]++;
  return node;
}});
})(KISSY);
