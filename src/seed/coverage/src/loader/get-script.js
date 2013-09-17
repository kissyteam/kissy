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
  _$jscoverage['/loader/get-script.js'].lineData[49] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[52] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[60] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[61] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[64] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[65] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[66] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[67] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[68] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[69] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[72] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[74] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[76] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[77] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[80] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[82] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[83] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[84] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[88] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[89] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[90] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[94] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[95] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[98] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[99] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[100] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[102] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[103] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[106] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[108] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[109] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[111] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[112] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[113] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[114] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[117] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[121] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[122] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[125] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[126] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[127] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[130] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[131] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[136] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[137] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[138] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[139] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[140] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[144] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[145] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[146] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[149] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[152] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[153] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[154] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[157] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[158] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[160] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[163] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[166] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[168] = 0;
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
  _$jscoverage['/loader/get-script.js'].branchData['60'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['64'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['72'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['76'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['82'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['88'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['94'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['98'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['113'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['121'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['127'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['128'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['129'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['136'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['144'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['152'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['157'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['160'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['160'][1] = new BranchData();
}
_$jscoverage['/loader/get-script.js'].branchData['160'][1].init(3066, 3, 'css');
function visit423_160_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['157'][1].init(2988, 9, '!headNode');
function visit422_157_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['152'][1].init(2834, 7, 'timeout');
function visit421_152_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['144'][1].init(2648, 3, 'css');
function visit420_144_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['136'][1].init(2410, 9, 'useNative');
function visit419_136_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['129'][1].init(42, 24, 'readyState == "complete"');
function visit418_129_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['128'][2].init(99, 22, 'readyState == "loaded"');
function visit417_128_2(result) {
  _$jscoverage['/loader/get-script.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['128'][1].init(31, 67, 'readyState == "loaded" || readyState == "complete"');
function visit416_128_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['127'][1].init(65, 99, '!readyState || readyState == "loaded" || readyState == "complete"');
function visit415_127_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['121'][1].init(1983, 18, 'css && isOldWebKit');
function visit414_121_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['113'][1].init(26, 20, 'fn = callback[index]');
function visit413_113_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['98'][1].init(1333, 3, 'css');
function visit412_98_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['94'][1].init(1259, 7, 'charset');
function visit411_94_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['88'][1].init(1120, 5, 'attrs');
function visit410_88_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['82'][1].init(22, 5, 'timer');
function visit409_82_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['76'][1].init(786, 20, 'callbacks.length > 1');
function visit408_76_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['72'][1].init(699, 25, 'jsCssCallbacks[url] || []');
function visit407_72_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['64'][1].init(414, 23, 'S.isPlainObject(config)');
function visit406_64_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['60'][1].init(309, 53, 'S.startsWith(Path.extname(url).toLowerCase(), \'.css\')');
function visit405_60_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['60'][1].ranCondition(result);
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
  _$jscoverage['/loader/get-script.js'].lineData[49]++;
  S.getScript = function(url, success, charset) {
  _$jscoverage['/loader/get-script.js'].functionData[1]++;
  _$jscoverage['/loader/get-script.js'].lineData[52]++;
  var config = success, css = 0, error, timeout, attrs, callbacks, timer;
  _$jscoverage['/loader/get-script.js'].lineData[60]++;
  if (visit405_60_1(S.startsWith(Path.extname(url).toLowerCase(), '.css'))) {
    _$jscoverage['/loader/get-script.js'].lineData[61]++;
    css = 1;
  }
  _$jscoverage['/loader/get-script.js'].lineData[64]++;
  if (visit406_64_1(S.isPlainObject(config))) {
    _$jscoverage['/loader/get-script.js'].lineData[65]++;
    success = config['success'];
    _$jscoverage['/loader/get-script.js'].lineData[66]++;
    error = config['error'];
    _$jscoverage['/loader/get-script.js'].lineData[67]++;
    timeout = config['timeout'];
    _$jscoverage['/loader/get-script.js'].lineData[68]++;
    charset = config['charset'];
    _$jscoverage['/loader/get-script.js'].lineData[69]++;
    attrs = config['attrs'];
  }
  _$jscoverage['/loader/get-script.js'].lineData[72]++;
  callbacks = jsCssCallbacks[url] = visit407_72_1(jsCssCallbacks[url] || []);
  _$jscoverage['/loader/get-script.js'].lineData[74]++;
  callbacks.push([success, error]);
  _$jscoverage['/loader/get-script.js'].lineData[76]++;
  if (visit408_76_1(callbacks.length > 1)) {
    _$jscoverage['/loader/get-script.js'].lineData[77]++;
    return callbacks.node;
  }
  _$jscoverage['/loader/get-script.js'].lineData[80]++;
  var node = doc.createElement(css ? 'link' : 'script'), clearTimer = function() {
  _$jscoverage['/loader/get-script.js'].functionData[2]++;
  _$jscoverage['/loader/get-script.js'].lineData[82]++;
  if (visit409_82_1(timer)) {
    _$jscoverage['/loader/get-script.js'].lineData[83]++;
    timer.cancel();
    _$jscoverage['/loader/get-script.js'].lineData[84]++;
    timer = undefined;
  }
};
  _$jscoverage['/loader/get-script.js'].lineData[88]++;
  if (visit410_88_1(attrs)) {
    _$jscoverage['/loader/get-script.js'].lineData[89]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/loader/get-script.js'].functionData[3]++;
  _$jscoverage['/loader/get-script.js'].lineData[90]++;
  node.setAttribute(n, v);
});
  }
  _$jscoverage['/loader/get-script.js'].lineData[94]++;
  if (visit411_94_1(charset)) {
    _$jscoverage['/loader/get-script.js'].lineData[95]++;
    node.charset = charset;
  }
  _$jscoverage['/loader/get-script.js'].lineData[98]++;
  if (visit412_98_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[99]++;
    node.href = url;
    _$jscoverage['/loader/get-script.js'].lineData[100]++;
    node.rel = 'stylesheet';
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[102]++;
    node.src = url;
    _$jscoverage['/loader/get-script.js'].lineData[103]++;
    node.async = true;
  }
  _$jscoverage['/loader/get-script.js'].lineData[106]++;
  callbacks.node = node;
  _$jscoverage['/loader/get-script.js'].lineData[108]++;
  var end = function(error) {
  _$jscoverage['/loader/get-script.js'].functionData[4]++;
  _$jscoverage['/loader/get-script.js'].lineData[109]++;
  var index = error, fn;
  _$jscoverage['/loader/get-script.js'].lineData[111]++;
  clearTimer();
  _$jscoverage['/loader/get-script.js'].lineData[112]++;
  S.each(jsCssCallbacks[url], function(callback) {
  _$jscoverage['/loader/get-script.js'].functionData[5]++;
  _$jscoverage['/loader/get-script.js'].lineData[113]++;
  if (visit413_113_1(fn = callback[index])) {
    _$jscoverage['/loader/get-script.js'].lineData[114]++;
    fn.call(node);
  }
});
  _$jscoverage['/loader/get-script.js'].lineData[117]++;
  delete jsCssCallbacks[url];
}, useNative = 'onload' in node;
  _$jscoverage['/loader/get-script.js'].lineData[121]++;
  if (visit414_121_1(css && isOldWebKit)) {
    _$jscoverage['/loader/get-script.js'].lineData[122]++;
    useNative = false;
  }
  _$jscoverage['/loader/get-script.js'].lineData[125]++;
  function onload() {
    _$jscoverage['/loader/get-script.js'].functionData[6]++;
    _$jscoverage['/loader/get-script.js'].lineData[126]++;
    var readyState = node.readyState;
    _$jscoverage['/loader/get-script.js'].lineData[127]++;
    if (visit415_127_1(!readyState || visit416_128_1(visit417_128_2(readyState == "loaded") || visit418_129_1(readyState == "complete")))) {
      _$jscoverage['/loader/get-script.js'].lineData[130]++;
      node.onreadystatechange = node.onload = null;
      _$jscoverage['/loader/get-script.js'].lineData[131]++;
      end(0);
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[136]++;
  if (visit419_136_1(useNative)) {
    _$jscoverage['/loader/get-script.js'].lineData[137]++;
    node.onload = onload;
    _$jscoverage['/loader/get-script.js'].lineData[138]++;
    node.onerror = function() {
  _$jscoverage['/loader/get-script.js'].functionData[7]++;
  _$jscoverage['/loader/get-script.js'].lineData[139]++;
  node.onerror = null;
  _$jscoverage['/loader/get-script.js'].lineData[140]++;
  end(1);
};
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[144]++;
    if (visit420_144_1(css)) {
      _$jscoverage['/loader/get-script.js'].lineData[145]++;
      Utils.pollCss(node, function() {
  _$jscoverage['/loader/get-script.js'].functionData[8]++;
  _$jscoverage['/loader/get-script.js'].lineData[146]++;
  end(0);
});
    } else {
      _$jscoverage['/loader/get-script.js'].lineData[149]++;
      node.onreadystatechange = onload;
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[152]++;
  if (visit421_152_1(timeout)) {
    _$jscoverage['/loader/get-script.js'].lineData[153]++;
    timer = S.later(function() {
  _$jscoverage['/loader/get-script.js'].functionData[9]++;
  _$jscoverage['/loader/get-script.js'].lineData[154]++;
  end(1);
}, timeout * MILLISECONDS_OF_SECOND);
  }
  _$jscoverage['/loader/get-script.js'].lineData[157]++;
  if (visit422_157_1(!headNode)) {
    _$jscoverage['/loader/get-script.js'].lineData[158]++;
    headNode = Utils.docHead();
  }
  _$jscoverage['/loader/get-script.js'].lineData[160]++;
  if (visit423_160_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[163]++;
    headNode.appendChild(node);
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[166]++;
    headNode.insertBefore(node, headNode.firstChild);
  }
  _$jscoverage['/loader/get-script.js'].lineData[168]++;
  return node;
};
})(KISSY);
