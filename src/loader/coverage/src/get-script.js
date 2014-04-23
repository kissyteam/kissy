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
  _$jscoverage['/get-script.js'].lineData[122] = 0;
  _$jscoverage['/get-script.js'].lineData[123] = 0;
  _$jscoverage['/get-script.js'].lineData[126] = 0;
  _$jscoverage['/get-script.js'].lineData[127] = 0;
  _$jscoverage['/get-script.js'].lineData[128] = 0;
  _$jscoverage['/get-script.js'].lineData[131] = 0;
  _$jscoverage['/get-script.js'].lineData[132] = 0;
  _$jscoverage['/get-script.js'].lineData[137] = 0;
  _$jscoverage['/get-script.js'].lineData[138] = 0;
  _$jscoverage['/get-script.js'].lineData[139] = 0;
  _$jscoverage['/get-script.js'].lineData[140] = 0;
  _$jscoverage['/get-script.js'].lineData[141] = 0;
  _$jscoverage['/get-script.js'].lineData[143] = 0;
  _$jscoverage['/get-script.js'].lineData[145] = 0;
  _$jscoverage['/get-script.js'].lineData[146] = 0;
  _$jscoverage['/get-script.js'].lineData[149] = 0;
  _$jscoverage['/get-script.js'].lineData[152] = 0;
  _$jscoverage['/get-script.js'].lineData[153] = 0;
  _$jscoverage['/get-script.js'].lineData[154] = 0;
  _$jscoverage['/get-script.js'].lineData[157] = 0;
  _$jscoverage['/get-script.js'].lineData[158] = 0;
  _$jscoverage['/get-script.js'].lineData[160] = 0;
  _$jscoverage['/get-script.js'].lineData[163] = 0;
  _$jscoverage['/get-script.js'].lineData[166] = 0;
  _$jscoverage['/get-script.js'].lineData[168] = 0;
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
  _$jscoverage['/get-script.js'].branchData['117'] = [];
  _$jscoverage['/get-script.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['117'][3] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['120'] = [];
  _$jscoverage['/get-script.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['122'] = [];
  _$jscoverage['/get-script.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['128'] = [];
  _$jscoverage['/get-script.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['129'] = [];
  _$jscoverage['/get-script.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['130'] = [];
  _$jscoverage['/get-script.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['137'] = [];
  _$jscoverage['/get-script.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['143'] = [];
  _$jscoverage['/get-script.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['152'] = [];
  _$jscoverage['/get-script.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['157'] = [];
  _$jscoverage['/get-script.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/get-script.js'].branchData['160'] = [];
  _$jscoverage['/get-script.js'].branchData['160'][1] = new BranchData();
}
_$jscoverage['/get-script.js'].branchData['160'][1].init(3540, 3, 'css');
function visit166_160_1(result) {
  _$jscoverage['/get-script.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['157'][1].init(3462, 9, '!headNode');
function visit165_157_1(result) {
  _$jscoverage['/get-script.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['152'][1].init(3305, 7, 'timeout');
function visit164_152_1(result) {
  _$jscoverage['/get-script.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['143'][1].init(3076, 3, 'css');
function visit163_143_1(result) {
  _$jscoverage['/get-script.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['137'][1].init(2886, 9, 'useNative');
function visit162_137_1(result) {
  _$jscoverage['/get-script.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['130'][1].init(43, 25, 'readyState === \'complete\'');
function visit161_130_1(result) {
  _$jscoverage['/get-script.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['129'][2].init(99, 23, 'readyState === \'loaded\'');
function visit160_129_2(result) {
  _$jscoverage['/get-script.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['129'][1].init(31, 69, 'readyState === \'loaded\' || readyState === \'complete\'');
function visit159_129_1(result) {
  _$jscoverage['/get-script.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['128'][1].init(65, 101, '!readyState || readyState === \'loaded\' || readyState === \'complete\'');
function visit158_128_1(result) {
  _$jscoverage['/get-script.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['122'][2].init(2449, 25, 'forceCssPoll && useNative');
function visit157_122_2(result) {
  _$jscoverage['/get-script.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['122'][1].init(2442, 32, 'css && forceCssPoll && useNative');
function visit156_122_1(result) {
  _$jscoverage['/get-script.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['120'][2].init(166, 30, '!Utils.trident && !Utils.gecko');
function visit155_120_2(result) {
  _$jscoverage['/get-script.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['120'][1].init(155, 41, '!webkit && !Utils.trident && !Utils.gecko');
function visit154_120_1(result) {
  _$jscoverage['/get-script.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['117'][3].init(69, 12, 'webkit < 536');
function visit153_117_3(result) {
  _$jscoverage['/get-script.js'].branchData['117'][3].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['117'][2].init(59, 22, 'webkit && webkit < 536');
function visit152_117_2(result) {
  _$jscoverage['/get-script.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['117'][1].init(38, 198, '(webkit && webkit < 536) || (!webkit && !Utils.trident && !Utils.gecko)');
function visit151_117_1(result) {
  _$jscoverage['/get-script.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['116'][1].init(2188, 237, 'S.Config.forceCssPoll || (webkit && webkit < 536) || (!webkit && !Utils.trident && !Utils.gecko)');
function visit150_116_1(result) {
  _$jscoverage['/get-script.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['88'][1].init(1251, 3, 'css');
function visit149_88_1(result) {
  _$jscoverage['/get-script.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['84'][1].init(1177, 7, 'charset');
function visit148_84_1(result) {
  _$jscoverage['/get-script.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['78'][1].init(1034, 5, 'attrs');
function visit147_78_1(result) {
  _$jscoverage['/get-script.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['72'][1].init(22, 5, 'timer');
function visit146_72_1(result) {
  _$jscoverage['/get-script.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['66'][1].init(695, 20, 'callbacks.length > 1');
function visit145_66_1(result) {
  _$jscoverage['/get-script.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['62'][1].init(608, 25, 'jsCssCallbacks[url] || []');
function visit144_62_1(result) {
  _$jscoverage['/get-script.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/get-script.js'].branchData['54'][1].init(335, 26, 'typeof config === \'object\'');
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
  var forceCssPoll = visit150_116_1(S.Config.forceCssPoll || visit151_117_1((visit152_117_2(webkit && visit153_117_3(webkit < 536))) || (visit154_120_1(!webkit && visit155_120_2(!Utils.trident && !Utils.gecko)))));
  _$jscoverage['/get-script.js'].lineData[122]++;
  if (visit156_122_1(css && visit157_122_2(forceCssPoll && useNative))) {
    _$jscoverage['/get-script.js'].lineData[123]++;
    useNative = false;
  }
  _$jscoverage['/get-script.js'].lineData[126]++;
  function onload() {
    _$jscoverage['/get-script.js'].functionData[6]++;
    _$jscoverage['/get-script.js'].lineData[127]++;
    var readyState = node.readyState;
    _$jscoverage['/get-script.js'].lineData[128]++;
    if (visit158_128_1(!readyState || visit159_129_1(visit160_129_2(readyState === 'loaded') || visit161_130_1(readyState === 'complete')))) {
      _$jscoverage['/get-script.js'].lineData[131]++;
      node.onreadystatechange = node.onload = null;
      _$jscoverage['/get-script.js'].lineData[132]++;
      end(0);
    }
  }
  _$jscoverage['/get-script.js'].lineData[137]++;
  if (visit162_137_1(useNative)) {
    _$jscoverage['/get-script.js'].lineData[138]++;
    node.onload = onload;
    _$jscoverage['/get-script.js'].lineData[139]++;
    node.onerror = function() {
  _$jscoverage['/get-script.js'].functionData[7]++;
  _$jscoverage['/get-script.js'].lineData[140]++;
  node.onerror = null;
  _$jscoverage['/get-script.js'].lineData[141]++;
  end(1);
};
  } else {
    _$jscoverage['/get-script.js'].lineData[143]++;
    if (visit163_143_1(css)) {
      _$jscoverage['/get-script.js'].lineData[145]++;
      Utils.pollCss(node, function() {
  _$jscoverage['/get-script.js'].functionData[8]++;
  _$jscoverage['/get-script.js'].lineData[146]++;
  end(0);
});
    } else {
      _$jscoverage['/get-script.js'].lineData[149]++;
      node.onreadystatechange = onload;
    }
  }
  _$jscoverage['/get-script.js'].lineData[152]++;
  if (visit164_152_1(timeout)) {
    _$jscoverage['/get-script.js'].lineData[153]++;
    timer = setTimeout(function() {
  _$jscoverage['/get-script.js'].functionData[9]++;
  _$jscoverage['/get-script.js'].lineData[154]++;
  end(1);
}, timeout * MILLISECONDS_OF_SECOND);
  }
  _$jscoverage['/get-script.js'].lineData[157]++;
  if (visit165_157_1(!headNode)) {
    _$jscoverage['/get-script.js'].lineData[158]++;
    headNode = Utils.docHead();
  }
  _$jscoverage['/get-script.js'].lineData[160]++;
  if (visit166_160_1(css)) {
    _$jscoverage['/get-script.js'].lineData[163]++;
    headNode.appendChild(node);
  } else {
    _$jscoverage['/get-script.js'].lineData[166]++;
    headNode.insertBefore(node, headNode.firstChild);
  }
  _$jscoverage['/get-script.js'].lineData[168]++;
  return node;
};
})(KISSY);
