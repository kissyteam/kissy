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
  _$jscoverage['/loader/get-script.js'].lineData[79] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[84] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[86] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[87] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[88] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[92] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[93] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[94] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[98] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[99] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[102] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[103] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[104] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[106] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[107] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[110] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[112] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[113] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[115] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[116] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[117] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[118] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[121] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[125] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[126] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[129] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[130] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[131] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[134] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[135] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[140] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[141] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[142] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[143] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[144] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[148] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[149] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[150] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[153] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[156] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[157] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[158] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[161] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[162] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[164] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[167] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[170] = 0;
  _$jscoverage['/loader/get-script.js'].lineData[172] = 0;
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
  _$jscoverage['/loader/get-script.js'].branchData['86'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['92'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['98'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['102'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['117'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['125'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['131'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['132'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['133'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['140'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['148'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['156'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['161'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/loader/get-script.js'].branchData['164'] = [];
  _$jscoverage['/loader/get-script.js'].branchData['164'][1] = new BranchData();
}
_$jscoverage['/loader/get-script.js'].branchData['164'][1].init(3653, 3, 'css');
function visit391_164_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['161'][1].init(3563, 9, '!headNode');
function visit390_161_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['156'][1].init(3389, 7, 'timeout');
function visit389_156_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['148'][1].init(3175, 3, 'css');
function visit388_148_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['140'][1].init(2905, 9, 'useNative');
function visit387_140_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['133'][1].init(46, 24, 'readyState == "complete"');
function visit386_133_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['132'][2].init(111, 22, 'readyState == "loaded"');
function visit385_132_2(result) {
  _$jscoverage['/loader/get-script.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['132'][1].init(35, 71, 'readyState == "loaded" || readyState == "complete"');
function visit384_132_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['131'][1].init(73, 107, '!readyState || readyState == "loaded" || readyState == "complete"');
function visit383_131_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['125'][1].init(2426, 18, 'css && isOldWebKit');
function visit382_125_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['117'][1].init(30, 20, 'fn = callback[index]');
function visit381_117_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['102'][1].init(1696, 3, 'css');
function visit380_102_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['98'][1].init(1610, 7, 'charset');
function visit379_98_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['92'][1].init(1451, 5, 'attrs');
function visit378_92_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['86'][1].init(26, 5, 'timer');
function visit377_86_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['77'][1].init(874, 20, 'callbacks.length > 1');
function visit376_77_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['73'][1].init(779, 25, 'jsCssCallbacks[url] || []');
function visit375_73_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['65'][1].init(466, 23, 'S.isPlainObject(config)');
function visit374_65_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['61'][1].init(349, 53, 'S.startsWith(Path.extname(url).toLowerCase(), \'.css\')');
function visit373_61_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].branchData['19'][1].init(505, 15, 'UA.webkit < 536');
function visit372_19_1(result) {
  _$jscoverage['/loader/get-script.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/get-script.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/get-script.js'].functionData[0]++;
  _$jscoverage['/loader/get-script.js'].lineData[7]++;
  var MILLISECONDS_OF_SECOND = 1000, doc = S.Env.host.document, Utils = S.Loader.Utils, Path = S.Path, jsCssCallbacks = {}, headNode, UA = S.UA, isOldWebKit = visit372_19_1(UA.webkit < 536);
  _$jscoverage['/loader/get-script.js'].lineData[21]++;
  S.mix(S, {
  getScript: function(url, success, charset) {
  _$jscoverage['/loader/get-script.js'].functionData[1]++;
  _$jscoverage['/loader/get-script.js'].lineData[53]++;
  var config = success, css = 0, error, timeout, attrs, callbacks, timer;
  _$jscoverage['/loader/get-script.js'].lineData[61]++;
  if (visit373_61_1(S.startsWith(Path.extname(url).toLowerCase(), '.css'))) {
    _$jscoverage['/loader/get-script.js'].lineData[62]++;
    css = 1;
  }
  _$jscoverage['/loader/get-script.js'].lineData[65]++;
  if (visit374_65_1(S.isPlainObject(config))) {
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
  callbacks = jsCssCallbacks[url] = visit375_73_1(jsCssCallbacks[url] || []);
  _$jscoverage['/loader/get-script.js'].lineData[75]++;
  callbacks.push([success, error]);
  _$jscoverage['/loader/get-script.js'].lineData[77]++;
  if (visit376_77_1(callbacks.length > 1)) {
    _$jscoverage['/loader/get-script.js'].lineData[79]++;
    return callbacks.node;
  } else {
  }
  _$jscoverage['/loader/get-script.js'].lineData[84]++;
  var node = doc.createElement(css ? 'link' : 'script'), clearTimer = function() {
  _$jscoverage['/loader/get-script.js'].functionData[2]++;
  _$jscoverage['/loader/get-script.js'].lineData[86]++;
  if (visit377_86_1(timer)) {
    _$jscoverage['/loader/get-script.js'].lineData[87]++;
    timer.cancel();
    _$jscoverage['/loader/get-script.js'].lineData[88]++;
    timer = undefined;
  }
};
  _$jscoverage['/loader/get-script.js'].lineData[92]++;
  if (visit378_92_1(attrs)) {
    _$jscoverage['/loader/get-script.js'].lineData[93]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/loader/get-script.js'].functionData[3]++;
  _$jscoverage['/loader/get-script.js'].lineData[94]++;
  node.setAttribute(n, v);
});
  }
  _$jscoverage['/loader/get-script.js'].lineData[98]++;
  if (visit379_98_1(charset)) {
    _$jscoverage['/loader/get-script.js'].lineData[99]++;
    node.charset = charset;
  }
  _$jscoverage['/loader/get-script.js'].lineData[102]++;
  if (visit380_102_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[103]++;
    node.href = url;
    _$jscoverage['/loader/get-script.js'].lineData[104]++;
    node.rel = 'stylesheet';
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[106]++;
    node.src = url;
    _$jscoverage['/loader/get-script.js'].lineData[107]++;
    node.async = true;
  }
  _$jscoverage['/loader/get-script.js'].lineData[110]++;
  callbacks.node = node;
  _$jscoverage['/loader/get-script.js'].lineData[112]++;
  var end = function(error) {
  _$jscoverage['/loader/get-script.js'].functionData[4]++;
  _$jscoverage['/loader/get-script.js'].lineData[113]++;
  var index = error, fn;
  _$jscoverage['/loader/get-script.js'].lineData[115]++;
  clearTimer();
  _$jscoverage['/loader/get-script.js'].lineData[116]++;
  S.each(jsCssCallbacks[url], function(callback) {
  _$jscoverage['/loader/get-script.js'].functionData[5]++;
  _$jscoverage['/loader/get-script.js'].lineData[117]++;
  if (visit381_117_1(fn = callback[index])) {
    _$jscoverage['/loader/get-script.js'].lineData[118]++;
    fn.call(node);
  }
});
  _$jscoverage['/loader/get-script.js'].lineData[121]++;
  delete jsCssCallbacks[url];
}, useNative = 'onload' in node;
  _$jscoverage['/loader/get-script.js'].lineData[125]++;
  if (visit382_125_1(css && isOldWebKit)) {
    _$jscoverage['/loader/get-script.js'].lineData[126]++;
    useNative = false;
  }
  _$jscoverage['/loader/get-script.js'].lineData[129]++;
  function onload() {
    _$jscoverage['/loader/get-script.js'].functionData[6]++;
    _$jscoverage['/loader/get-script.js'].lineData[130]++;
    var readyState = node.readyState;
    _$jscoverage['/loader/get-script.js'].lineData[131]++;
    if (visit383_131_1(!readyState || visit384_132_1(visit385_132_2(readyState == "loaded") || visit386_133_1(readyState == "complete")))) {
      _$jscoverage['/loader/get-script.js'].lineData[134]++;
      node.onreadystatechange = node.onload = null;
      _$jscoverage['/loader/get-script.js'].lineData[135]++;
      end(0);
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[140]++;
  if (visit387_140_1(useNative)) {
    _$jscoverage['/loader/get-script.js'].lineData[141]++;
    node.onload = onload;
    _$jscoverage['/loader/get-script.js'].lineData[142]++;
    node.onerror = function() {
  _$jscoverage['/loader/get-script.js'].functionData[7]++;
  _$jscoverage['/loader/get-script.js'].lineData[143]++;
  node.onerror = null;
  _$jscoverage['/loader/get-script.js'].lineData[144]++;
  end(1);
};
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[148]++;
    if (visit388_148_1(css)) {
      _$jscoverage['/loader/get-script.js'].lineData[149]++;
      Utils.pollCss(node, function() {
  _$jscoverage['/loader/get-script.js'].functionData[8]++;
  _$jscoverage['/loader/get-script.js'].lineData[150]++;
  end(0);
});
    } else {
      _$jscoverage['/loader/get-script.js'].lineData[153]++;
      node.onreadystatechange = onload;
    }
  }
  _$jscoverage['/loader/get-script.js'].lineData[156]++;
  if (visit389_156_1(timeout)) {
    _$jscoverage['/loader/get-script.js'].lineData[157]++;
    timer = S.later(function() {
  _$jscoverage['/loader/get-script.js'].functionData[9]++;
  _$jscoverage['/loader/get-script.js'].lineData[158]++;
  end(1);
}, timeout * MILLISECONDS_OF_SECOND);
  }
  _$jscoverage['/loader/get-script.js'].lineData[161]++;
  if (visit390_161_1(!headNode)) {
    _$jscoverage['/loader/get-script.js'].lineData[162]++;
    headNode = Utils.docHead();
  }
  _$jscoverage['/loader/get-script.js'].lineData[164]++;
  if (visit391_164_1(css)) {
    _$jscoverage['/loader/get-script.js'].lineData[167]++;
    headNode.appendChild(node);
  } else {
    _$jscoverage['/loader/get-script.js'].lineData[170]++;
    headNode.insertBefore(node, headNode.firstChild);
  }
  _$jscoverage['/loader/get-script.js'].lineData[172]++;
  return node;
}});
})(KISSY);
