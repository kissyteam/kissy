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
if (! _$jscoverage['/multi-word.js']) {
  _$jscoverage['/multi-word.js'] = {};
  _$jscoverage['/multi-word.js'].lineData = [];
  _$jscoverage['/multi-word.js'].lineData[6] = 0;
  _$jscoverage['/multi-word.js'].lineData[7] = 0;
  _$jscoverage['/multi-word.js'].lineData[10] = 0;
  _$jscoverage['/multi-word.js'].lineData[11] = 0;
  _$jscoverage['/multi-word.js'].lineData[13] = 0;
  _$jscoverage['/multi-word.js'].lineData[14] = 0;
  _$jscoverage['/multi-word.js'].lineData[17] = 0;
  _$jscoverage['/multi-word.js'].lineData[18] = 0;
  _$jscoverage['/multi-word.js'].lineData[19] = 0;
  _$jscoverage['/multi-word.js'].lineData[28] = 0;
  _$jscoverage['/multi-word.js'].lineData[30] = 0;
  _$jscoverage['/multi-word.js'].lineData[32] = 0;
  _$jscoverage['/multi-word.js'].lineData[33] = 0;
  _$jscoverage['/multi-word.js'].lineData[34] = 0;
  _$jscoverage['/multi-word.js'].lineData[35] = 0;
  _$jscoverage['/multi-word.js'].lineData[41] = 0;
  _$jscoverage['/multi-word.js'].lineData[50] = 0;
  _$jscoverage['/multi-word.js'].lineData[51] = 0;
  _$jscoverage['/multi-word.js'].lineData[52] = 0;
  _$jscoverage['/multi-word.js'].lineData[55] = 0;
  _$jscoverage['/multi-word.js'].lineData[57] = 0;
  _$jscoverage['/multi-word.js'].lineData[58] = 0;
  _$jscoverage['/multi-word.js'].lineData[61] = 0;
  _$jscoverage['/multi-word.js'].lineData[66] = 0;
  _$jscoverage['/multi-word.js'].lineData[78] = 0;
  _$jscoverage['/multi-word.js'].lineData[79] = 0;
  _$jscoverage['/multi-word.js'].lineData[80] = 0;
  _$jscoverage['/multi-word.js'].lineData[82] = 0;
  _$jscoverage['/multi-word.js'].lineData[85] = 0;
  _$jscoverage['/multi-word.js'].lineData[86] = 0;
  _$jscoverage['/multi-word.js'].lineData[88] = 0;
  _$jscoverage['/multi-word.js'].lineData[89] = 0;
  _$jscoverage['/multi-word.js'].lineData[90] = 0;
  _$jscoverage['/multi-word.js'].lineData[92] = 0;
  _$jscoverage['/multi-word.js'].lineData[96] = 0;
  _$jscoverage['/multi-word.js'].lineData[98] = 0;
  _$jscoverage['/multi-word.js'].lineData[100] = 0;
  _$jscoverage['/multi-word.js'].lineData[101] = 0;
  _$jscoverage['/multi-word.js'].lineData[105] = 0;
  _$jscoverage['/multi-word.js'].lineData[108] = 0;
  _$jscoverage['/multi-word.js'].lineData[111] = 0;
  _$jscoverage['/multi-word.js'].lineData[112] = 0;
  _$jscoverage['/multi-word.js'].lineData[171] = 0;
  _$jscoverage['/multi-word.js'].lineData[172] = 0;
  _$jscoverage['/multi-word.js'].lineData[187] = 0;
  _$jscoverage['/multi-word.js'].lineData[188] = 0;
  _$jscoverage['/multi-word.js'].lineData[189] = 0;
  _$jscoverage['/multi-word.js'].lineData[190] = 0;
  _$jscoverage['/multi-word.js'].lineData[191] = 0;
  _$jscoverage['/multi-word.js'].lineData[194] = 0;
  _$jscoverage['/multi-word.js'].lineData[195] = 0;
  _$jscoverage['/multi-word.js'].lineData[196] = 0;
  _$jscoverage['/multi-word.js'].lineData[198] = 0;
  _$jscoverage['/multi-word.js'].lineData[200] = 0;
  _$jscoverage['/multi-word.js'].lineData[205] = 0;
  _$jscoverage['/multi-word.js'].lineData[206] = 0;
  _$jscoverage['/multi-word.js'].lineData[207] = 0;
  _$jscoverage['/multi-word.js'].lineData[209] = 0;
  _$jscoverage['/multi-word.js'].lineData[210] = 0;
  _$jscoverage['/multi-word.js'].lineData[211] = 0;
  _$jscoverage['/multi-word.js'].lineData[212] = 0;
  _$jscoverage['/multi-word.js'].lineData[213] = 0;
  _$jscoverage['/multi-word.js'].lineData[214] = 0;
  _$jscoverage['/multi-word.js'].lineData[215] = 0;
  _$jscoverage['/multi-word.js'].lineData[217] = 0;
  _$jscoverage['/multi-word.js'].lineData[219] = 0;
  _$jscoverage['/multi-word.js'].lineData[220] = 0;
  _$jscoverage['/multi-word.js'].lineData[222] = 0;
  _$jscoverage['/multi-word.js'].lineData[223] = 0;
  _$jscoverage['/multi-word.js'].lineData[226] = 0;
  _$jscoverage['/multi-word.js'].lineData[230] = 0;
  _$jscoverage['/multi-word.js'].lineData[231] = 0;
  _$jscoverage['/multi-word.js'].lineData[235] = 0;
  _$jscoverage['/multi-word.js'].lineData[236] = 0;
  _$jscoverage['/multi-word.js'].lineData[239] = 0;
  _$jscoverage['/multi-word.js'].lineData[242] = 0;
  _$jscoverage['/multi-word.js'].lineData[243] = 0;
  _$jscoverage['/multi-word.js'].lineData[245] = 0;
  _$jscoverage['/multi-word.js'].lineData[247] = 0;
}
if (! _$jscoverage['/multi-word.js'].functionData) {
  _$jscoverage['/multi-word.js'].functionData = [];
  _$jscoverage['/multi-word.js'].functionData[0] = 0;
  _$jscoverage['/multi-word.js'].functionData[1] = 0;
  _$jscoverage['/multi-word.js'].functionData[2] = 0;
  _$jscoverage['/multi-word.js'].functionData[3] = 0;
  _$jscoverage['/multi-word.js'].functionData[4] = 0;
  _$jscoverage['/multi-word.js'].functionData[5] = 0;
  _$jscoverage['/multi-word.js'].functionData[6] = 0;
  _$jscoverage['/multi-word.js'].functionData[7] = 0;
}
if (! _$jscoverage['/multi-word.js'].branchData) {
  _$jscoverage['/multi-word.js'].branchData = {};
  _$jscoverage['/multi-word.js'].branchData['14'] = [];
  _$jscoverage['/multi-word.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['18'] = [];
  _$jscoverage['/multi-word.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['32'] = [];
  _$jscoverage['/multi-word.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['50'] = [];
  _$jscoverage['/multi-word.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['51'] = [];
  _$jscoverage['/multi-word.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['57'] = [];
  _$jscoverage['/multi-word.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['75'] = [];
  _$jscoverage['/multi-word.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['78'] = [];
  _$jscoverage['/multi-word.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['80'] = [];
  _$jscoverage['/multi-word.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['88'] = [];
  _$jscoverage['/multi-word.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['90'] = [];
  _$jscoverage['/multi-word.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['181'] = [];
  _$jscoverage['/multi-word.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['187'] = [];
  _$jscoverage['/multi-word.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['189'] = [];
  _$jscoverage['/multi-word.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['190'] = [];
  _$jscoverage['/multi-word.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['194'] = [];
  _$jscoverage['/multi-word.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['198'] = [];
  _$jscoverage['/multi-word.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['205'] = [];
  _$jscoverage['/multi-word.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['206'] = [];
  _$jscoverage['/multi-word.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['211'] = [];
  _$jscoverage['/multi-word.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['212'] = [];
  _$jscoverage['/multi-word.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['214'] = [];
  _$jscoverage['/multi-word.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['219'] = [];
  _$jscoverage['/multi-word.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['230'] = [];
  _$jscoverage['/multi-word.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['235'] = [];
  _$jscoverage['/multi-word.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['239'] = [];
  _$jscoverage['/multi-word.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['242'] = [];
  _$jscoverage['/multi-word.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/multi-word.js'].branchData['242'][2] = new BranchData();
}
_$jscoverage['/multi-word.js'].branchData['242'][2].init(58, 24, 'separatorType === SUFFIX');
function visit40_242_2(result) {
  _$jscoverage['/multi-word.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['242'][1].init(58, 57, 'separatorType === SUFFIX && strContainsChar(separator, c)');
function visit39_242_1(result) {
  _$jscoverage['/multi-word.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['239'][1].init(2141, 17, 'tokenIndex === -1');
function visit38_239_1(result) {
  _$jscoverage['/multi-word.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['235'][1].init(2067, 14, '!tokens.length');
function visit37_235_1(result) {
  _$jscoverage['/multi-word.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['230'][1].init(1965, 12, 'cache.length');
function visit36_230_1(result) {
  _$jscoverage['/multi-word.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['219'][1].init(26, 12, 'cache.length');
function visit35_219_1(result) {
  _$jscoverage['/multi-word.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['214'][1].init(62, 12, 'cache.length');
function visit34_214_1(result) {
  _$jscoverage['/multi-word.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['212'][1].init(22, 24, 'separatorType === SUFFIX');
function visit33_212_1(result) {
  _$jscoverage['/multi-word.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['211'][1].init(782, 29, 'strContainsChar(separator, c)');
function visit32_211_1(result) {
  _$jscoverage['/multi-word.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['206'][1].init(22, 12, 'cache.length');
function visit31_206_1(result) {
  _$jscoverage['/multi-word.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['205'][1].init(531, 55, 'allowWhitespaceAsStandaloneToken && rWhitespace.test(c)');
function visit30_205_1(result) {
  _$jscoverage['/multi-word.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['198'][1].init(304, 20, 'i === cursorPosition');
function visit29_198_1(result) {
  _$jscoverage['/multi-word.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['194'][1].init(200, 9, 'inLiteral');
function visit28_194_1(result) {
  _$jscoverage['/multi-word.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['190'][1].init(22, 13, 'c === literal');
function visit27_190_1(result) {
  _$jscoverage['/multi-word.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['189'][1].init(55, 7, 'literal');
function visit26_189_1(result) {
  _$jscoverage['/multi-word.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['187'][1].init(561, 19, 'i < inputVal.length');
function visit25_187_1(result) {
  _$jscoverage['/multi-word.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['181'][1].init(379, 24, 'separatorType !== SUFFIX');
function visit24_181_1(result) {
  _$jscoverage['/multi-word.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['90'][1].init(293, 22, 'separator.length === 1');
function visit23_90_1(result) {
  _$jscoverage['/multi-word.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['88'][1].init(149, 43, 'strContainsChar(separator, token.charAt(l))');
function visit22_88_1(result) {
  _$jscoverage['/multi-word.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['80'][2].init(104, 50, 'nextToken && rWhitespace.test(nextToken.charAt(0))');
function visit21_80_2(result) {
  _$jscoverage['/multi-word.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['80'][1].init(93, 62, 'value && !(nextToken && rWhitespace.test(nextToken.charAt(0)))');
function visit20_80_1(result) {
  _$jscoverage['/multi-word.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['78'][1].init(569, 24, 'separatorType !== SUFFIX');
function visit19_78_1(result) {
  _$jscoverage['/multi-word.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['75'][1].init(448, 28, 'tokens[tokenIndex + 1] || \'\'');
function visit18_75_1(result) {
  _$jscoverage['/multi-word.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['57'][2].init(744, 24, 'separatorType === SUFFIX');
function visit17_57_2(result) {
  _$jscoverage['/multi-word.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['57'][1].init(744, 71, 'separatorType === SUFFIX && strContainsChar(separator, token.charAt(l))');
function visit16_57_1(result) {
  _$jscoverage['/multi-word.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['51'][1].init(26, 43, 'strContainsChar(separator, token.charAt(0))');
function visit15_51_1(result) {
  _$jscoverage['/multi-word.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['50'][1].init(429, 24, 'separatorType !== SUFFIX');
function visit14_50_1(result) {
  _$jscoverage['/multi-word.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['32'][1].init(83, 27, 'self.get(\'alignWithCursor\')');
function visit13_32_1(result) {
  _$jscoverage['/multi-word.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['18'][2].init(26, 29, 'e.target === this.get(\'menu\')');
function visit12_18_2(result) {
  _$jscoverage['/multi-word.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['18'][1].init(14, 41, 'e.newVal && e.target === this.get(\'menu\')');
function visit11_18_1(result) {
  _$jscoverage['/multi-word.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['14'][2].init(22, 21, 'str.indexOf(c) !== -1');
function visit10_14_2(result) {
  _$jscoverage['/multi-word.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].branchData['14'][1].init(17, 26, 'c && str.indexOf(c) !== -1');
function visit9_14_1(result) {
  _$jscoverage['/multi-word.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/multi-word.js'].functionData[0]++;
  _$jscoverage['/multi-word.js'].lineData[7]++;
  var SUFFIX = 'suffix', rWhitespace = /\s|\xa0/;
  _$jscoverage['/multi-word.js'].lineData[10]++;
  var getCursor = require('./multi-word/cursor');
  _$jscoverage['/multi-word.js'].lineData[11]++;
  var ComboBox = require('combobox');
  _$jscoverage['/multi-word.js'].lineData[13]++;
  function strContainsChar(str, c) {
    _$jscoverage['/multi-word.js'].functionData[1]++;
    _$jscoverage['/multi-word.js'].lineData[14]++;
    return visit9_14_1(c && visit10_14_2(str.indexOf(c) !== -1));
  }
  _$jscoverage['/multi-word.js'].lineData[17]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/multi-word.js'].functionData[2]++;
    _$jscoverage['/multi-word.js'].lineData[18]++;
    if (visit11_18_1(e.newVal && visit12_18_2(e.target === this.get('menu')))) {
      _$jscoverage['/multi-word.js'].lineData[19]++;
      this.alignWithCursor();
    }
  }
  _$jscoverage['/multi-word.js'].lineData[28]++;
  return ComboBox.extend({
  syncUI: function() {
  _$jscoverage['/multi-word.js'].functionData[3]++;
  _$jscoverage['/multi-word.js'].lineData[30]++;
  var self = this, menu;
  _$jscoverage['/multi-word.js'].lineData[32]++;
  if (visit13_32_1(self.get('alignWithCursor'))) {
    _$jscoverage['/multi-word.js'].lineData[33]++;
    menu = self.get('menu');
    _$jscoverage['/multi-word.js'].lineData[34]++;
    menu.setInternal('align', null);
    _$jscoverage['/multi-word.js'].lineData[35]++;
    menu.on('beforeVisibleChange', beforeVisibleChange, this);
  }
}, 
  getCurrentValue: function() {
  _$jscoverage['/multi-word.js'].functionData[4]++;
  _$jscoverage['/multi-word.js'].lineData[41]++;
  var self = this, inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex, separator = self.get('separator'), separatorType = self.get('separatorType'), token = tokens[tokenIndex], l = token.length - 1;
  _$jscoverage['/multi-word.js'].lineData[50]++;
  if (visit14_50_1(separatorType !== SUFFIX)) {
    _$jscoverage['/multi-word.js'].lineData[51]++;
    if (visit15_51_1(strContainsChar(separator, token.charAt(0)))) {
      _$jscoverage['/multi-word.js'].lineData[52]++;
      token = token.slice(1);
    } else {
      _$jscoverage['/multi-word.js'].lineData[55]++;
      return undefined;
    }
  } else {
    _$jscoverage['/multi-word.js'].lineData[57]++;
    if (visit16_57_1(visit17_57_2(separatorType === SUFFIX) && strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/multi-word.js'].lineData[58]++;
      token = token.slice(0, l);
    }
  }
  _$jscoverage['/multi-word.js'].lineData[61]++;
  return token;
}, 
  setCurrentValue: function(value, setCfg) {
  _$jscoverage['/multi-word.js'].functionData[5]++;
  _$jscoverage['/multi-word.js'].lineData[66]++;
  var self = this, input = self.get('input'), inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = Math.max(0, inputDesc.tokenIndex), separator = self.get('separator'), cursorPosition, l, separatorType = self.get('separatorType'), nextToken = visit18_75_1(tokens[tokenIndex + 1] || ''), token = tokens[tokenIndex];
  _$jscoverage['/multi-word.js'].lineData[78]++;
  if (visit19_78_1(separatorType !== SUFFIX)) {
    _$jscoverage['/multi-word.js'].lineData[79]++;
    tokens[tokenIndex] = token.charAt(0) + value;
    _$jscoverage['/multi-word.js'].lineData[80]++;
    if (visit20_80_1(value && !(visit21_80_2(nextToken && rWhitespace.test(nextToken.charAt(0)))))) {
      _$jscoverage['/multi-word.js'].lineData[82]++;
      tokens[tokenIndex] += ' ';
    }
  } else {
    _$jscoverage['/multi-word.js'].lineData[85]++;
    tokens[tokenIndex] = value;
    _$jscoverage['/multi-word.js'].lineData[86]++;
    l = token.length - 1;
    _$jscoverage['/multi-word.js'].lineData[88]++;
    if (visit22_88_1(strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/multi-word.js'].lineData[89]++;
      tokens[tokenIndex] += token.charAt(l);
    } else {
      _$jscoverage['/multi-word.js'].lineData[90]++;
      if (visit23_90_1(separator.length === 1)) {
        _$jscoverage['/multi-word.js'].lineData[92]++;
        tokens[tokenIndex] += separator;
      }
    }
  }
  _$jscoverage['/multi-word.js'].lineData[96]++;
  cursorPosition = tokens.slice(0, tokenIndex + 1).join('').length;
  _$jscoverage['/multi-word.js'].lineData[98]++;
  self.set('value', tokens.join(''), setCfg);
  _$jscoverage['/multi-word.js'].lineData[100]++;
  input.prop('selectionStart', cursorPosition);
  _$jscoverage['/multi-word.js'].lineData[101]++;
  input.prop('selectionEnd', cursorPosition);
}, 
  alignWithCursor: function() {
  _$jscoverage['/multi-word.js'].functionData[6]++;
  _$jscoverage['/multi-word.js'].lineData[105]++;
  var self = this;
  _$jscoverage['/multi-word.js'].lineData[108]++;
  var menu = self.get('menu'), cursorOffset, input = self.get('input');
  _$jscoverage['/multi-word.js'].lineData[111]++;
  cursorOffset = getCursor(input);
  _$jscoverage['/multi-word.js'].lineData[112]++;
  menu.move(cursorOffset.left, cursorOffset.top);
}}, {
  ATTRS: {
  separator: {
  value: ',;'}, 
  separatorType: {
  value: SUFFIX}, 
  literal: {
  value: '"'}, 
  alignWithCursor: {}}, 
  xclass: 'multi-value-combobox'});
  _$jscoverage['/multi-word.js'].lineData[171]++;
  function getInputDesc(self) {
    _$jscoverage['/multi-word.js'].functionData[7]++;
    _$jscoverage['/multi-word.js'].lineData[172]++;
    var input = self.get('input'), inputVal = self.get('value'), tokens = [], cache = [], literal = self.get('literal'), separator = self.get('separator'), separatorType = self.get('separatorType'), inLiteral = false, allowWhitespaceAsStandaloneToken = visit24_181_1(separatorType !== SUFFIX), cursorPosition = input.prop('selectionStart'), i, c, tokenIndex = -1;
    _$jscoverage['/multi-word.js'].lineData[187]++;
    for (i = 0; visit25_187_1(i < inputVal.length); i++) {
      _$jscoverage['/multi-word.js'].lineData[188]++;
      c = inputVal.charAt(i);
      _$jscoverage['/multi-word.js'].lineData[189]++;
      if (visit26_189_1(literal)) {
        _$jscoverage['/multi-word.js'].lineData[190]++;
        if (visit27_190_1(c === literal)) {
          _$jscoverage['/multi-word.js'].lineData[191]++;
          inLiteral = !inLiteral;
        }
      }
      _$jscoverage['/multi-word.js'].lineData[194]++;
      if (visit28_194_1(inLiteral)) {
        _$jscoverage['/multi-word.js'].lineData[195]++;
        cache.push(c);
        _$jscoverage['/multi-word.js'].lineData[196]++;
        continue;
      }
      _$jscoverage['/multi-word.js'].lineData[198]++;
      if (visit29_198_1(i === cursorPosition)) {
        _$jscoverage['/multi-word.js'].lineData[200]++;
        tokenIndex = tokens.length;
      }
      _$jscoverage['/multi-word.js'].lineData[205]++;
      if (visit30_205_1(allowWhitespaceAsStandaloneToken && rWhitespace.test(c))) {
        _$jscoverage['/multi-word.js'].lineData[206]++;
        if (visit31_206_1(cache.length)) {
          _$jscoverage['/multi-word.js'].lineData[207]++;
          tokens.push(cache.join(''));
        }
        _$jscoverage['/multi-word.js'].lineData[209]++;
        cache = [];
        _$jscoverage['/multi-word.js'].lineData[210]++;
        cache.push(c);
      } else {
        _$jscoverage['/multi-word.js'].lineData[211]++;
        if (visit32_211_1(strContainsChar(separator, c))) {
          _$jscoverage['/multi-word.js'].lineData[212]++;
          if (visit33_212_1(separatorType === SUFFIX)) {
            _$jscoverage['/multi-word.js'].lineData[213]++;
            cache.push(c);
            _$jscoverage['/multi-word.js'].lineData[214]++;
            if (visit34_214_1(cache.length)) {
              _$jscoverage['/multi-word.js'].lineData[215]++;
              tokens.push(cache.join(''));
            }
            _$jscoverage['/multi-word.js'].lineData[217]++;
            cache = [];
          } else {
            _$jscoverage['/multi-word.js'].lineData[219]++;
            if (visit35_219_1(cache.length)) {
              _$jscoverage['/multi-word.js'].lineData[220]++;
              tokens.push(cache.join(''));
            }
            _$jscoverage['/multi-word.js'].lineData[222]++;
            cache = [];
            _$jscoverage['/multi-word.js'].lineData[223]++;
            cache.push(c);
          }
        } else {
          _$jscoverage['/multi-word.js'].lineData[226]++;
          cache.push(c);
        }
      }
    }
    _$jscoverage['/multi-word.js'].lineData[230]++;
    if (visit36_230_1(cache.length)) {
      _$jscoverage['/multi-word.js'].lineData[231]++;
      tokens.push(cache.join(''));
    }
    _$jscoverage['/multi-word.js'].lineData[235]++;
    if (visit37_235_1(!tokens.length)) {
      _$jscoverage['/multi-word.js'].lineData[236]++;
      tokens.push('');
    }
    _$jscoverage['/multi-word.js'].lineData[239]++;
    if (visit38_239_1(tokenIndex === -1)) {
      _$jscoverage['/multi-word.js'].lineData[242]++;
      if (visit39_242_1(visit40_242_2(separatorType === SUFFIX) && strContainsChar(separator, c))) {
        _$jscoverage['/multi-word.js'].lineData[243]++;
        tokens.push('');
      }
      _$jscoverage['/multi-word.js'].lineData[245]++;
      tokenIndex = tokens.length - 1;
    }
    _$jscoverage['/multi-word.js'].lineData[247]++;
    return {
  tokens: tokens, 
  cursorPosition: cursorPosition, 
  tokenIndex: tokenIndex};
  }
});
