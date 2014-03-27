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
if (! _$jscoverage['/get-script.js']) {
  _$jscoverage['/get-script.js'] = {};
  _$jscoverage['/get-script.js'].lineData = [];
  _$jscoverage['/get-script.js'].lineData[6] = 0;
  _$jscoverage['/get-script.js'].lineData[7] = 0;
  _$jscoverage['/get-script.js'].lineData[43] = 0;
  _$jscoverage['/get-script.js'].lineData[46] = 0;
  _$jscoverage['/get-script.js'].lineData[54] = 0;
  _$jscoverage['/get-script.js'].lineData[55] = 0;
  _$jscoverage['/get-script.js'].lineData[56] = 0;
  _$jscoverage['/get-script.js'].lineData[57] = 0;
  _$jscoverage['/get-script.js'].lineData[58] = 0;
  _$jscoverage['/get-script.js'].lineData[59] = 0;
  _$jscoverage['/get-script.js'].lineData[62] = 0;
  _$jscoverage['/get-script.js'].lineData[64] = 0;
  _$jscoverage['/get-script.js'].lineData[66] = 0;
  _$jscoverage['/get-script.js'].lineData[67] = 0;
  _$jscoverage['/get-script.js'].lineData[70] = 0;
  _$jscoverage['/get-script.js'].lineData[72] = 0;
  _$jscoverage['/get-script.js'].lineData[73] = 0;
  _$jscoverage['/get-script.js'].lineData[74] = 0;
  _$jscoverage['/get-script.js'].lineData[78] = 0;
  _$jscoverage['/get-script.js'].lineData[79] = 0;
  _$jscoverage['/get-script.js'].lineData[80] = 0;
  _$jscoverage['/get-script.js'].lineData[84] = 0;
  _$jscoverage['/get-script.js'].lineData[85] = 0;
  _$jscoverage['/get-script.js'].lineData[88] = 0;
  _$jscoverage['/get-script.js'].lineData[89] = 0;
  _$jscoverage['/get-script.js'].lineData[90] = 0;
  _$jscoverage['/get-script.js'].lineData[92] = 0;
  _$jscoverage['/get-script.js'].lineData[93] = 0;
  _$jscoverage['/get-script.js'].lineData[96] = 0;
  _$jscoverage['/get-script.js'].lineData[98] = 0;
  _$jscoverage['/get-script.js'].lineData[99] = 0;
  _$jscoverage['/get-script.js'].lineData[101] = 0;
  _$jscoverage['/get-script.js'].lineData[102] = 0;
  _$jscoverage['/get-script.js'].lineData[103] = 0;
  _$jscoverage['/get-script.js'].lineData[104] = 0;
  _$jscoverage['/get-script.js'].lineData[107] = 0;
  _$jscoverage['/get-script.js'].lineData[110] = 0;
  _$jscoverage['/get-script.js'].lineData[116] = 0;
  _$jscoverage['/get-script.js'].lineData[118] = 0;
  _$jscoverage['/get-script.js'].lineData[119] = 0;
  _$jscoverage['/get-script.js'].lineData[122] = 0;
  _$jscoverage['/get-script.js'].lineData[123] = 0;
  _$jscoverage['/get-script.js'].lineData[124] = 0;
  _$jscoverage['/get-script.js'].lineData[127] = 0;
  _$jscoverage['/get-script.js'].lineData[128] = 0;
  _$jscoverage['/get-script.js'].lineData[133] = 0;
  _$jscoverage['/get-script.js'].lineData[134] = 0;
  _$jscoverage['/get-script.js'].lineData[135] = 0;
  _$jscoverage['/get-script.js'].lineData[136] = 0;
  _$jscoverage['/get-script.js'].lineData[137] = 0;
  _$jscoverage['/get-script.js'].lineData[139] = 0;
  _$jscoverage['/get-script.js'].lineData[141] = 0;
  _$jscoverage['/get-script.js'].lineData[142] = 0;
  _$jscoverage['/get-script.js'].lineData[145] = 0;
  _$jscoverage['/get-script.js'].lineData[148] = 0;
  _$jscoverage['/get-script.js'].lineData[149] = 0;
  _$jscoverage['/get-script.js'].lineData[150] = 0;
  _$jscoverage['/get-script.js'].lineData[153] = 0;
  _$jscoverage['/get-script.js'].lineData[154] = 0;
  _$jscoverage['/get-script.js'].lineData[156] = 0;
  _$jscoverage['/get-script.js'].lineData[159] = 0;
  _$jscoverage['/get-script.js'].lineData[162] = 0;
  _$jscoverage['/get-script.js'].lineData[164] = 0;
}
if (! _$jscoverage['/get-script.js'].functionData) {
  _$jscoverage['/get-script.js'].functionData = [];
  _$jscoverage['/get-script.js'].functionData[0] = 0;
  _$jscoverage['/get-script.js'].functionData[1] = 0;
  _$jscoverage['/get-script.js'].functionData[2] = 0;
  _$jscoverage['/get-script.js'].functionData[3] = 0;
  _$jscoverage['/get-script.js'].functionData[4] = 0;
  _$jscoverage['/get-script.js'].functionData[5] = 0;
  _$jscoverage['/get-script.js'].functionData[6] = 0;
  _$jscoverage['/get-script.js'].functionData[7] = 0;
  _$jscoverage['/get-script.js'].functionData[8] = 0;
  _$jscoverage['/get-script.js'].functionData[9] = 0;
}
if (! _$jscoverage['/get-script.js'].branchData) {
  _$jscoverage['/get-script.js'].branchData = {};
  _$jscoverage['/get-script.js'].branchData['54'] = [];
  _$jscoverage['/get-script.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['62'] = [];
  _$jscoverage['/get-script.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['66'] = [];
  _$jscoverage['/get-script.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['72'] = [];
  _$jscoverage['/get-script.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['78'] = [];
  _$jscoverage['/get-script.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['84'] = [];
  _$jscoverage['/get-script.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['88'] = [];
  _$jscoverage['/get-script.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['116'] = [];
  _$jscoverage['/get-script.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['116'][3] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['118'] = [];
  _$jscoverage['/get-script.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['124'] = [];
  _$jscoverage['/get-script.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['125'] = [];
  _$jscoverage['/get-script.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['126'] = [];
  _$jscoverage['/get-script.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['133'] = [];
  _$jscoverage['/get-script.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['139'] = [];
  _$jscoverage['/get-script.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['148'] = [];
  _$jscoverage['/get-script.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['153'] = [];
  _$jscoverage['/get-script.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['156'] = [];
  _$jscoverage['/get-script.js'].branchData['156'][1] = new BranchData();
}
_$jscoverage['/get-script.js'].branchData['156'][1].init(3239, 3, 'css');
function visit163_156_1(result) {
  _$jscoverage['/get-script.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['153'][1].init(3164, 9, '!headNode');
function visit162_153_1(result) {
  _$jscoverage['/get-script.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['148'][1].init(3012, 7, 'timeout');
function visit161_148_1(result) {
  _$jscoverage['/get-script.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['139'][1].init(2792, 3, 'css');
function visit160_139_1(result) {
  _$jscoverage['/get-script.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['133'][1].init(2608, 9, 'useNative');
function visit159_133_1(result) {
  _$jscoverage['/get-script.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['126'][1].init(42, 25, 'readyState === \'complete\'');
function visit158_126_1(result) {
  _$jscoverage['/get-script.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['125'][2].init(96, 23, 'readyState === \'loaded\'');
function visit157_125_2(result) {
  _$jscoverage['/get-script.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['125'][1].init(30, 68, 'readyState === \'loaded\' || readyState === \'complete\'');
function visit156_125_1(result) {
  _$jscoverage['/get-script.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['124'][1].init(63, 99, '!readyState || readyState === \'loaded\' || readyState === \'complete\'');
function visit155_124_1(result) {
  _$jscoverage['/get-script.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['118'][2].init(2186, 25, 'forceCssPoll && useNative');
function visit154_118_2(result) {
  _$jscoverage['/get-script.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['118'][1].init(2179, 32, 'css && forceCssPoll && useNative');
function visit153_118_1(result) {
  _$jscoverage['/get-script.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['116'][3].init(2151, 12, 'webkit < 536');
function visit152_116_3(result) {
  _$jscoverage['/get-script.js'].branchData['116'][3].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['116'][2].init(2141, 22, 'webkit && webkit < 536');
function visit151_116_2(result) {
  _$jscoverage['/get-script.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['116'][1].init(2115, 49, 'S.Config.forceCssPoll || (webkit && webkit < 536)');
function visit150_116_1(result) {
  _$jscoverage['/get-script.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['88'][1].init(1206, 3, 'css');
function visit149_88_1(result) {
  _$jscoverage['/get-script.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['84'][1].init(1136, 7, 'charset');
function visit148_84_1(result) {
  _$jscoverage['/get-script.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['78'][1].init(999, 5, 'attrs');
function visit147_78_1(result) {
  _$jscoverage['/get-script.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['72'][1].init(21, 5, 'timer');
function visit146_72_1(result) {
  _$jscoverage['/get-script.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['66'][1].init(672, 20, 'callbacks.length > 1');
function visit145_66_1(result) {
  _$jscoverage['/get-script.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['62'][1].init(589, 25, 'jsCssCallbacks[url] || []');
function visit144_62_1(result) {
  _$jscoverage['/get-script.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['54'][1].init(324, 26, 'typeof config === \'object\'');
function visit143_54_1(result) {
  _$jscoverage['/get-script.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/get-script.js'].functionData[0]++;
  _$jscoverage['/get-script.js'].lineData[7]++;
  var MILLISECONDS_OF_SECOND = 1000, doc = S.Env.host.document, Utils = S.Loader.Utils, jsCssCallbacks = {}, webkit = Utils.webkit, headNode;
  _$jscoverage['/get-script.js'].lineData[43]++;
  S.getScript = function(url, success, charset) {
  _$jscoverage['/get-script.js'].functionData[1]++;
  _$jscoverage['/get-script.js'].lineData[46]++;
  var config = success, css = Utils.endsWith(url, '.css'), error, timeout, attrs, callbacks, timer;
  _$jscoverage['/get-script.js'].lineData[54]++;
  if (visit143_54_1(typeof config === 'object')) {
    _$jscoverage['/get-script.js'].lineData[55]++;
    success = config.success;
    _$jscoverage['/get-script.js'].lineData[56]++;
    error = config.error;
    _$jscoverage['/get-script.js'].lineData[57]++;
    timeout = config.timeout;
    _$jscoverage['/get-script.js'].lineData[58]++;
    charset = config.charset;
    _$jscoverage['/get-script.js'].lineData[59]++;
    attrs = config.attrs;
  }
  _$jscoverage['/get-script.js'].lineData[62]++;
  callbacks = jsCssCallbacks[url] = visit144_62_1(jsCssCallbacks[url] || []);
  _$jscoverage['/get-script.js'].lineData[64]++;
  callbacks.push([success, error]);
  _$jscoverage['/get-script.js'].lineData[66]++;
  if (visit145_66_1(callbacks.length > 1)) {
    _$jscoverage['/get-script.js'].lineData[67]++;
    return callbacks.node;
  }
  _$jscoverage['/get-script.js'].lineData[70]++;
  var node = doc.createElement(css ? 'link' : 'script'), clearTimer = function() {
  _$jscoverage['/get-script.js'].functionData[2]++;
  _$jscoverage['/get-script.js'].lineData[72]++;
  if (visit146_72_1(timer)) {
    _$jscoverage['/get-script.js'].lineData[73]++;
    clearTimeout(timer);
    _$jscoverage['/get-script.js'].lineData[74]++;
    timer = undefined;
  }
};
  _$jscoverage['/get-script.js'].lineData[78]++;
  if (visit147_78_1(attrs)) {
    _$jscoverage['/get-script.js'].lineData[79]++;
    Utils.each(attrs, function(v, n) {
  _$jscoverage['/get-script.js'].functionData[3]++;
  _$jscoverage['/get-script.js'].lineData[80]++;
  node.setAttribute(n, v);
});
  }
  _$jscoverage['/get-script.js'].lineData[84]++;
  if (visit148_84_1(charset)) {
    _$jscoverage['/get-script.js'].lineData[85]++;
    node.charset = charset;
  }
  _$jscoverage['/get-script.js'].lineData[88]++;
  if (visit149_88_1(css)) {
    _$jscoverage['/get-script.js'].lineData[89]++;
    node.href = url;
    _$jscoverage['/get-script.js'].lineData[90]++;
    node.rel = 'stylesheet';
  } else {
    _$jscoverage['/get-script.js'].lineData[92]++;
    node.src = url;
    _$jscoverage['/get-script.js'].lineData[93]++;
    node.async = true;
  }
  _$jscoverage['/get-script.js'].lineData[96]++;
  callbacks.node = node;
  _$jscoverage['/get-script.js'].lineData[98]++;
  var end = function(error) {
  _$jscoverage['/get-script.js'].functionData[4]++;
  _$jscoverage['/get-script.js'].lineData[99]++;
  var index = error, fn;
  _$jscoverage['/get-script.js'].lineData[101]++;
  clearTimer();
  _$jscoverage['/get-script.js'].lineData[102]++;
  Utils.each(jsCssCallbacks[url], function(callback) {
  _$jscoverage['/get-script.js'].functionData[5]++;
  _$jscoverage['/get-script.js'].lineData[103]++;
  if ((fn = callback[index])) {
    _$jscoverage['/get-script.js'].lineData[104]++;
    fn.call(node);
  }
});
  _$jscoverage['/get-script.js'].lineData[107]++;
  delete jsCssCallbacks[url];
};
  _$jscoverage['/get-script.js'].lineData[110]++;
  var useNative = 'onload' in node;
  _$jscoverage['/get-script.js'].lineData[116]++;
  var forceCssPoll = visit150_116_1(S.Config.forceCssPoll || (visit151_116_2(webkit && visit152_116_3(webkit < 536))));
  _$jscoverage['/get-script.js'].lineData[118]++;
  if (visit153_118_1(css && visit154_118_2(forceCssPoll && useNative))) {
    _$jscoverage['/get-script.js'].lineData[119]++;
    useNative = false;
  }
  _$jscoverage['/get-script.js'].lineData[122]++;
  function onload() {
    _$jscoverage['/get-script.js'].functionData[6]++;
    _$jscoverage['/get-script.js'].lineData[123]++;
    var readyState = node.readyState;
    _$jscoverage['/get-script.js'].lineData[124]++;
    if (visit155_124_1(!readyState || visit156_125_1(visit157_125_2(readyState === 'loaded') || visit158_126_1(readyState === 'complete')))) {
      _$jscoverage['/get-script.js'].lineData[127]++;
      node.onreadystatechange = node.onload = null;
      _$jscoverage['/get-script.js'].lineData[128]++;
      end(0);
    }
  }
  _$jscoverage['/get-script.js'].lineData[133]++;
  if (visit159_133_1(useNative)) {
    _$jscoverage['/get-script.js'].lineData[134]++;
    node.onload = onload;
    _$jscoverage['/get-script.js'].lineData[135]++;
    node.onerror = function() {
  _$jscoverage['/get-script.js'].functionData[7]++;
  _$jscoverage['/get-script.js'].lineData[136]++;
  node.onerror = null;
  _$jscoverage['/get-script.js'].lineData[137]++;
  end(1);
};
  } else {
    _$jscoverage['/get-script.js'].lineData[139]++;
    if (visit160_139_1(css)) {
      _$jscoverage['/get-script.js'].lineData[141]++;
      Utils.pollCss(node, function() {
  _$jscoverage['/get-script.js'].functionData[8]++;
  _$jscoverage['/get-script.js'].lineData[142]++;
  end(0);
});
    } else {
      _$jscoverage['/get-script.js'].lineData[145]++;
      node.onreadystatechange = onload;
    }
  }
  _$jscoverage['/get-script.js'].lineData[148]++;
  if (visit161_148_1(timeout)) {
    _$jscoverage['/get-script.js'].lineData[149]++;
    timer = setTimeout(function() {
  _$jscoverage['/get-script.js'].functionData[9]++;
  _$jscoverage['/get-script.js'].lineData[150]++;
  end(1);
}, timeout * MILLISECONDS_OF_SECOND);
  }
  _$jscoverage['/get-script.js'].lineData[153]++;
  if (visit162_153_1(!headNode)) {
    _$jscoverage['/get-script.js'].lineData[154]++;
    headNode = Utils.docHead();
  }
  _$jscoverage['/get-script.js'].lineData[156]++;
  if (visit163_156_1(css)) {
    _$jscoverage['/get-script.js'].lineData[159]++;
    headNode.appendChild(node);
  } else {
    _$jscoverage['/get-script.js'].lineData[162]++;
    headNode.insertBefore(node, headNode.firstChild);
  }
  _$jscoverage['/get-script.js'].lineData[164]++;
  return node;
};
})(KISSY);
