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
if (! _$jscoverage['/json.js']) {
  _$jscoverage['/json.js'] = {};
  _$jscoverage['/json.js'].lineData = [];
  _$jscoverage['/json.js'].lineData[6] = 0;
  _$jscoverage['/json.js'].lineData[7] = 0;
  _$jscoverage['/json.js'].lineData[12] = 0;
  _$jscoverage['/json.js'].lineData[13] = 0;
  _$jscoverage['/json.js'].lineData[16] = 0;
  _$jscoverage['/json.js'].lineData[17] = 0;
  _$jscoverage['/json.js'].lineData[18] = 0;
  _$jscoverage['/json.js'].lineData[19] = 0;
  _$jscoverage['/json.js'].lineData[22] = 0;
  _$jscoverage['/json.js'].lineData[23] = 0;
  _$jscoverage['/json.js'].lineData[27] = 0;
  _$jscoverage['/json.js'].lineData[31] = 0;
  _$jscoverage['/json.js'].lineData[32] = 0;
  _$jscoverage['/json.js'].lineData[33] = 0;
  _$jscoverage['/json.js'].lineData[35] = 0;
  _$jscoverage['/json.js'].lineData[37] = 0;
  _$jscoverage['/json.js'].lineData[38] = 0;
  _$jscoverage['/json.js'].lineData[40] = 0;
  _$jscoverage['/json.js'].lineData[44] = 0;
  _$jscoverage['/json.js'].lineData[48] = 0;
}
if (! _$jscoverage['/json.js'].functionData) {
  _$jscoverage['/json.js'].functionData = [];
  _$jscoverage['/json.js'].functionData[0] = 0;
  _$jscoverage['/json.js'].functionData[1] = 0;
  _$jscoverage['/json.js'].functionData[2] = 0;
  _$jscoverage['/json.js'].functionData[3] = 0;
}
if (! _$jscoverage['/json.js'].branchData) {
  _$jscoverage['/json.js'].branchData = {};
  _$jscoverage['/json.js'].branchData['8'] = [];
  _$jscoverage['/json.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['9'] = [];
  _$jscoverage['/json.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['12'] = [];
  _$jscoverage['/json.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['12'][2] = new BranchData();
  _$jscoverage['/json.js'].branchData['16'] = [];
  _$jscoverage['/json.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['32'] = [];
  _$jscoverage['/json.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['35'] = [];
  _$jscoverage['/json.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['38'] = [];
  _$jscoverage['/json.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/json.js'].branchData['40'] = [];
  _$jscoverage['/json.js'].branchData['40'][1] = new BranchData();
}
_$jscoverage['/json.js'].branchData['40'][1].init(61, 179, 'INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, \'@\').replace(INVALID_TOKENS_REG, \']\').replace(INVALID_BRACES_REG, \'\'))');
function visit9_40_1(result) {
  _$jscoverage['/json.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['38'][1].init(87, 4, 'data');
function visit8_38_1(result) {
  _$jscoverage['/json.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['35'][1].init(97, 24, 'typeof data === \'string\'');
function visit7_35_1(result) {
  _$jscoverage['/json.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['32'][1].init(18, 13, 'data === null');
function visit6_32_1(result) {
  _$jscoverage['/json.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['16'][1].init(285, 10, 'nativeJson');
function visit5_16_1(result) {
  _$jscoverage['/json.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['12'][2].init(219, 16, 'documentMode < 9');
function visit4_12_2(result) {
  _$jscoverage['/json.js'].branchData['12'][2].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['12'][1].init(203, 32, 'documentMode && documentMode < 9');
function visit3_12_1(result) {
  _$jscoverage['/json.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['9'][1].init(101, 27, 'typeof JSON === \'undefined\'');
function visit2_9_1(result) {
  _$jscoverage['/json.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].branchData['8'][1].init(54, 23, 'doc && doc.documentMode');
function visit1_8_1(result) {
  _$jscoverage['/json.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/json.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/json.js'].functionData[0]++;
  _$jscoverage['/json.js'].lineData[7]++;
  var doc = S.Env.host.document, documentMode = visit1_8_1(doc && doc.documentMode), nativeJson = visit2_9_1(typeof JSON === 'undefined') ? null : JSON;
  _$jscoverage['/json.js'].lineData[12]++;
  if (visit3_12_1(documentMode && visit4_12_2(documentMode < 9))) {
    _$jscoverage['/json.js'].lineData[13]++;
    nativeJson = null;
  }
  _$jscoverage['/json.js'].lineData[16]++;
  if (visit5_16_1(nativeJson)) {
    _$jscoverage['/json.js'].lineData[17]++;
    S.add('json', function() {
  _$jscoverage['/json.js'].functionData[1]++;
  _$jscoverage['/json.js'].lineData[18]++;
  S.JSON = nativeJson;
  _$jscoverage['/json.js'].lineData[19]++;
  return nativeJson;
});
    _$jscoverage['/json.js'].lineData[22]++;
    S.parseJson = function(data) {
  _$jscoverage['/json.js'].functionData[2]++;
  _$jscoverage['/json.js'].lineData[23]++;
  return nativeJson.parse(data);
};
  } else {
    _$jscoverage['/json.js'].lineData[27]++;
    var INVALID_CHARS_REG = /^[\],:{}\s]*$/, INVALID_BRACES_REG = /(?:^|:|,)(?:\s*\[)+/g, INVALID_ESCAPES_REG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, INVALID_TOKENS_REG = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
    _$jscoverage['/json.js'].lineData[31]++;
    S.parseJson = function(data) {
  _$jscoverage['/json.js'].functionData[3]++;
  _$jscoverage['/json.js'].lineData[32]++;
  if (visit6_32_1(data === null)) {
    _$jscoverage['/json.js'].lineData[33]++;
    return data;
  }
  _$jscoverage['/json.js'].lineData[35]++;
  if (visit7_35_1(typeof data === 'string')) {
    _$jscoverage['/json.js'].lineData[37]++;
    data = S.trim(data);
    _$jscoverage['/json.js'].lineData[38]++;
    if (visit8_38_1(data)) {
      _$jscoverage['/json.js'].lineData[40]++;
      if (visit9_40_1(INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, '@').replace(INVALID_TOKENS_REG, ']').replace(INVALID_BRACES_REG, '')))) {
        _$jscoverage['/json.js'].lineData[44]++;
        return (new Function('return ' + data))();
      }
    }
  }
  _$jscoverage['/json.js'].lineData[48]++;
  return S.error('Invalid Json: ' + data);
};
  }
})(KISSY);
