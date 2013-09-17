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
if (! _$jscoverage['/exports.js']) {
  _$jscoverage['/exports.js'] = {};
  _$jscoverage['/exports.js'].lineData = [];
  _$jscoverage['/exports.js'].lineData[6] = 0;
  _$jscoverage['/exports.js'].lineData[8] = 0;
  _$jscoverage['/exports.js'].lineData[10] = 0;
  _$jscoverage['/exports.js'].lineData[11] = 0;
  _$jscoverage['/exports.js'].lineData[14] = 0;
  _$jscoverage['/exports.js'].lineData[15] = 0;
  _$jscoverage['/exports.js'].lineData[18] = 0;
  _$jscoverage['/exports.js'].lineData[19] = 0;
  _$jscoverage['/exports.js'].lineData[22] = 0;
  _$jscoverage['/exports.js'].lineData[23] = 0;
  _$jscoverage['/exports.js'].lineData[26] = 0;
  _$jscoverage['/exports.js'].lineData[34] = 0;
  _$jscoverage['/exports.js'].lineData[35] = 0;
  _$jscoverage['/exports.js'].lineData[38] = 0;
  _$jscoverage['/exports.js'].lineData[39] = 0;
  _$jscoverage['/exports.js'].lineData[40] = 0;
  _$jscoverage['/exports.js'].lineData[43] = 0;
  _$jscoverage['/exports.js'].lineData[44] = 0;
  _$jscoverage['/exports.js'].lineData[48] = 0;
  _$jscoverage['/exports.js'].lineData[52] = 0;
  _$jscoverage['/exports.js'].lineData[53] = 0;
  _$jscoverage['/exports.js'].lineData[54] = 0;
  _$jscoverage['/exports.js'].lineData[56] = 0;
  _$jscoverage['/exports.js'].lineData[58] = 0;
  _$jscoverage['/exports.js'].lineData[59] = 0;
  _$jscoverage['/exports.js'].lineData[61] = 0;
  _$jscoverage['/exports.js'].lineData[65] = 0;
  _$jscoverage['/exports.js'].lineData[69] = 0;
  _$jscoverage['/exports.js'].lineData[74] = 0;
  _$jscoverage['/exports.js'].lineData[75] = 0;
  _$jscoverage['/exports.js'].lineData[76] = 0;
}
if (! _$jscoverage['/exports.js'].functionData) {
  _$jscoverage['/exports.js'].functionData = [];
  _$jscoverage['/exports.js'].functionData[0] = 0;
  _$jscoverage['/exports.js'].functionData[1] = 0;
  _$jscoverage['/exports.js'].functionData[2] = 0;
  _$jscoverage['/exports.js'].functionData[3] = 0;
  _$jscoverage['/exports.js'].functionData[4] = 0;
  _$jscoverage['/exports.js'].functionData[5] = 0;
  _$jscoverage['/exports.js'].functionData[6] = 0;
  _$jscoverage['/exports.js'].functionData[7] = 0;
}
if (! _$jscoverage['/exports.js'].branchData) {
  _$jscoverage['/exports.js'].branchData = {};
  _$jscoverage['/exports.js'].branchData['29'] = [];
  _$jscoverage['/exports.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['31'] = [];
  _$jscoverage['/exports.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/exports.js'].branchData['34'] = [];
  _$jscoverage['/exports.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/exports.js'].branchData['38'] = [];
  _$jscoverage['/exports.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['53'] = [];
  _$jscoverage['/exports.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['56'] = [];
  _$jscoverage['/exports.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['59'] = [];
  _$jscoverage['/exports.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['61'] = [];
  _$jscoverage['/exports.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/exports.js'].branchData['74'] = [];
  _$jscoverage['/exports.js'].branchData['74'][1] = new BranchData();
}
_$jscoverage['/exports.js'].branchData['74'][1].init(2010, 11, 'S.UA.nodejs');
function visit11_74_1(result) {
  _$jscoverage['/exports.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['61'][1].init(61, 179, 'INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, "@").replace(INVALID_TOKENS_REG, "]").replace(INVALID_BRACES_REG, ""))');
function visit10_61_1(result) {
  _$jscoverage['/exports.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['59'][1].init(87, 4, 'data');
function visit9_59_1(result) {
  _$jscoverage['/exports.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['56'][1].init(97, 24, 'typeof data === "string"');
function visit8_56_1(result) {
  _$jscoverage['/exports.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['53'][1].init(18, 13, 'data === null');
function visit7_53_1(result) {
  _$jscoverage['/exports.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['38'][1].init(710, 10, 'nativeJson');
function visit6_38_1(result) {
  _$jscoverage['/exports.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['34'][2].init(644, 16, 'documentMode < 9');
function visit5_34_2(result) {
  _$jscoverage['/exports.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['34'][1].init(628, 32, 'documentMode && documentMode < 9');
function visit4_34_1(result) {
  _$jscoverage['/exports.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['31'][2].init(175, 26, 'typeof global === \'object\'');
function visit3_31_2(result) {
  _$jscoverage['/exports.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['31'][1].init(162, 39, 'UA.nodejs && typeof global === \'object\'');
function visit2_31_1(result) {
  _$jscoverage['/exports.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].branchData['29'][1].init(76, 18, 'win.document || {}');
function visit1_29_1(result) {
  _$jscoverage['/exports.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/exports.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/exports.js'].functionData[0]++;
  _$jscoverage['/exports.js'].lineData[8]++;
  S.add('empty', S.noop);
  _$jscoverage['/exports.js'].lineData[10]++;
  S.add('promise', function() {
  _$jscoverage['/exports.js'].functionData[1]++;
  _$jscoverage['/exports.js'].lineData[11]++;
  return S.Promise;
});
  _$jscoverage['/exports.js'].lineData[14]++;
  S.add('ua', function() {
  _$jscoverage['/exports.js'].functionData[2]++;
  _$jscoverage['/exports.js'].lineData[15]++;
  return S.UA;
});
  _$jscoverage['/exports.js'].lineData[18]++;
  S.add('uri', function() {
  _$jscoverage['/exports.js'].functionData[3]++;
  _$jscoverage['/exports.js'].lineData[19]++;
  return S.Uri;
});
  _$jscoverage['/exports.js'].lineData[22]++;
  S.add('path', function() {
  _$jscoverage['/exports.js'].functionData[4]++;
  _$jscoverage['/exports.js'].lineData[23]++;
  return S.Path;
});
  _$jscoverage['/exports.js'].lineData[26]++;
  var UA = S.UA, Env = S.Env, win = Env.host, doc = visit1_29_1(win.document || {}), documentMode = doc.documentMode, nativeJson = ((visit2_31_1(UA.nodejs && visit3_31_2(typeof global === 'object'))) ? global : win).JSON;
  _$jscoverage['/exports.js'].lineData[34]++;
  if (visit4_34_1(documentMode && visit5_34_2(documentMode < 9))) {
    _$jscoverage['/exports.js'].lineData[35]++;
    nativeJson = null;
  }
  _$jscoverage['/exports.js'].lineData[38]++;
  if (visit6_38_1(nativeJson)) {
    _$jscoverage['/exports.js'].lineData[39]++;
    S.add('json', function() {
  _$jscoverage['/exports.js'].functionData[5]++;
  _$jscoverage['/exports.js'].lineData[40]++;
  return S.JSON = nativeJson;
});
    _$jscoverage['/exports.js'].lineData[43]++;
    S.parseJson = function(data) {
  _$jscoverage['/exports.js'].functionData[6]++;
  _$jscoverage['/exports.js'].lineData[44]++;
  return nativeJson.parse(data);
};
  } else {
    _$jscoverage['/exports.js'].lineData[48]++;
    var INVALID_CHARS_REG = /^[\],:{}\s]*$/, INVALID_BRACES_REG = /(?:^|:|,)(?:\s*\[)+/g, INVALID_ESCAPES_REG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, INVALID_TOKENS_REG = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
    _$jscoverage['/exports.js'].lineData[52]++;
    S.parseJson = function(data) {
  _$jscoverage['/exports.js'].functionData[7]++;
  _$jscoverage['/exports.js'].lineData[53]++;
  if (visit7_53_1(data === null)) {
    _$jscoverage['/exports.js'].lineData[54]++;
    return data;
  }
  _$jscoverage['/exports.js'].lineData[56]++;
  if (visit8_56_1(typeof data === "string")) {
    _$jscoverage['/exports.js'].lineData[58]++;
    data = S.trim(data);
    _$jscoverage['/exports.js'].lineData[59]++;
    if (visit9_59_1(data)) {
      _$jscoverage['/exports.js'].lineData[61]++;
      if (visit10_61_1(INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, "@").replace(INVALID_TOKENS_REG, "]").replace(INVALID_BRACES_REG, "")))) {
        _$jscoverage['/exports.js'].lineData[65]++;
        return (new Function("return " + data))();
      }
    }
  }
  _$jscoverage['/exports.js'].lineData[69]++;
  return S.error("Invalid Json: " + data);
};
  }
  _$jscoverage['/exports.js'].lineData[74]++;
  if (visit11_74_1(S.UA.nodejs)) {
    _$jscoverage['/exports.js'].lineData[75]++;
    S.KISSY = S;
    _$jscoverage['/exports.js'].lineData[76]++;
    module.exports = S;
  }
})(KISSY);
