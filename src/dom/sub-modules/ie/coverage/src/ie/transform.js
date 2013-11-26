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
if (! _$jscoverage['/ie/transform.js']) {
  _$jscoverage['/ie/transform.js'] = {};
  _$jscoverage['/ie/transform.js'].lineData = [];
  _$jscoverage['/ie/transform.js'].lineData[6] = 0;
  _$jscoverage['/ie/transform.js'].lineData[7] = 0;
  _$jscoverage['/ie/transform.js'].lineData[8] = 0;
  _$jscoverage['/ie/transform.js'].lineData[9] = 0;
  _$jscoverage['/ie/transform.js'].lineData[11] = 0;
  _$jscoverage['/ie/transform.js'].lineData[13] = 0;
  _$jscoverage['/ie/transform.js'].lineData[15] = 0;
  _$jscoverage['/ie/transform.js'].lineData[16] = 0;
  _$jscoverage['/ie/transform.js'].lineData[17] = 0;
  _$jscoverage['/ie/transform.js'].lineData[19] = 0;
  _$jscoverage['/ie/transform.js'].lineData[20] = 0;
  _$jscoverage['/ie/transform.js'].lineData[21] = 0;
  _$jscoverage['/ie/transform.js'].lineData[22] = 0;
  _$jscoverage['/ie/transform.js'].lineData[24] = 0;
  _$jscoverage['/ie/transform.js'].lineData[25] = 0;
  _$jscoverage['/ie/transform.js'].lineData[27] = 0;
  _$jscoverage['/ie/transform.js'].lineData[36] = 0;
  _$jscoverage['/ie/transform.js'].lineData[38] = 0;
  _$jscoverage['/ie/transform.js'].lineData[42] = 0;
  _$jscoverage['/ie/transform.js'].lineData[56] = 0;
  _$jscoverage['/ie/transform.js'].lineData[57] = 0;
  _$jscoverage['/ie/transform.js'].lineData[58] = 0;
  _$jscoverage['/ie/transform.js'].lineData[59] = 0;
  _$jscoverage['/ie/transform.js'].lineData[60] = 0;
  _$jscoverage['/ie/transform.js'].lineData[61] = 0;
  _$jscoverage['/ie/transform.js'].lineData[62] = 0;
  _$jscoverage['/ie/transform.js'].lineData[76] = 0;
  _$jscoverage['/ie/transform.js'].lineData[78] = 0;
  _$jscoverage['/ie/transform.js'].lineData[80] = 0;
  _$jscoverage['/ie/transform.js'].lineData[84] = 0;
  _$jscoverage['/ie/transform.js'].lineData[85] = 0;
  _$jscoverage['/ie/transform.js'].lineData[89] = 0;
  _$jscoverage['/ie/transform.js'].lineData[95] = 0;
  _$jscoverage['/ie/transform.js'].lineData[99] = 0;
  _$jscoverage['/ie/transform.js'].lineData[100] = 0;
  _$jscoverage['/ie/transform.js'].lineData[104] = 0;
  _$jscoverage['/ie/transform.js'].lineData[105] = 0;
  _$jscoverage['/ie/transform.js'].lineData[107] = 0;
  _$jscoverage['/ie/transform.js'].lineData[113] = 0;
  _$jscoverage['/ie/transform.js'].lineData[114] = 0;
  _$jscoverage['/ie/transform.js'].lineData[116] = 0;
  _$jscoverage['/ie/transform.js'].lineData[131] = 0;
  _$jscoverage['/ie/transform.js'].lineData[132] = 0;
  _$jscoverage['/ie/transform.js'].lineData[133] = 0;
  _$jscoverage['/ie/transform.js'].lineData[134] = 0;
  _$jscoverage['/ie/transform.js'].lineData[135] = 0;
  _$jscoverage['/ie/transform.js'].lineData[137] = 0;
  _$jscoverage['/ie/transform.js'].lineData[138] = 0;
  _$jscoverage['/ie/transform.js'].lineData[139] = 0;
  _$jscoverage['/ie/transform.js'].lineData[140] = 0;
  _$jscoverage['/ie/transform.js'].lineData[142] = 0;
  _$jscoverage['/ie/transform.js'].lineData[145] = 0;
  _$jscoverage['/ie/transform.js'].lineData[149] = 0;
  _$jscoverage['/ie/transform.js'].lineData[150] = 0;
  _$jscoverage['/ie/transform.js'].lineData[151] = 0;
  _$jscoverage['/ie/transform.js'].lineData[159] = 0;
  _$jscoverage['/ie/transform.js'].lineData[160] = 0;
  _$jscoverage['/ie/transform.js'].lineData[161] = 0;
  _$jscoverage['/ie/transform.js'].lineData[162] = 0;
  _$jscoverage['/ie/transform.js'].lineData[163] = 0;
  _$jscoverage['/ie/transform.js'].lineData[164] = 0;
  _$jscoverage['/ie/transform.js'].lineData[166] = 0;
  _$jscoverage['/ie/transform.js'].lineData[167] = 0;
  _$jscoverage['/ie/transform.js'].lineData[170] = 0;
  _$jscoverage['/ie/transform.js'].lineData[171] = 0;
  _$jscoverage['/ie/transform.js'].lineData[174] = 0;
  _$jscoverage['/ie/transform.js'].lineData[175] = 0;
  _$jscoverage['/ie/transform.js'].lineData[176] = 0;
  _$jscoverage['/ie/transform.js'].lineData[177] = 0;
  _$jscoverage['/ie/transform.js'].lineData[180] = 0;
  _$jscoverage['/ie/transform.js'].lineData[181] = 0;
  _$jscoverage['/ie/transform.js'].lineData[182] = 0;
  _$jscoverage['/ie/transform.js'].lineData[183] = 0;
  _$jscoverage['/ie/transform.js'].lineData[184] = 0;
  _$jscoverage['/ie/transform.js'].lineData[185] = 0;
  _$jscoverage['/ie/transform.js'].lineData[188] = 0;
  _$jscoverage['/ie/transform.js'].lineData[189] = 0;
  _$jscoverage['/ie/transform.js'].lineData[192] = 0;
  _$jscoverage['/ie/transform.js'].lineData[193] = 0;
  _$jscoverage['/ie/transform.js'].lineData[196] = 0;
  _$jscoverage['/ie/transform.js'].lineData[197] = 0;
  _$jscoverage['/ie/transform.js'].lineData[198] = 0;
  _$jscoverage['/ie/transform.js'].lineData[199] = 0;
  _$jscoverage['/ie/transform.js'].lineData[202] = 0;
  _$jscoverage['/ie/transform.js'].lineData[203] = 0;
  _$jscoverage['/ie/transform.js'].lineData[206] = 0;
  _$jscoverage['/ie/transform.js'].lineData[207] = 0;
  _$jscoverage['/ie/transform.js'].lineData[210] = 0;
  _$jscoverage['/ie/transform.js'].lineData[211] = 0;
  _$jscoverage['/ie/transform.js'].lineData[212] = 0;
  _$jscoverage['/ie/transform.js'].lineData[213] = 0;
  _$jscoverage['/ie/transform.js'].lineData[214] = 0;
  _$jscoverage['/ie/transform.js'].lineData[215] = 0;
  _$jscoverage['/ie/transform.js'].lineData[216] = 0;
  _$jscoverage['/ie/transform.js'].lineData[217] = 0;
  _$jscoverage['/ie/transform.js'].lineData[219] = 0;
  _$jscoverage['/ie/transform.js'].lineData[222] = 0;
  _$jscoverage['/ie/transform.js'].lineData[225] = 0;
  _$jscoverage['/ie/transform.js'].lineData[226] = 0;
  _$jscoverage['/ie/transform.js'].lineData[233] = 0;
  _$jscoverage['/ie/transform.js'].lineData[234] = 0;
  _$jscoverage['/ie/transform.js'].lineData[235] = 0;
  _$jscoverage['/ie/transform.js'].lineData[237] = 0;
  _$jscoverage['/ie/transform.js'].lineData[240] = 0;
  _$jscoverage['/ie/transform.js'].lineData[242] = 0;
  _$jscoverage['/ie/transform.js'].lineData[243] = 0;
  _$jscoverage['/ie/transform.js'].lineData[244] = 0;
  _$jscoverage['/ie/transform.js'].lineData[245] = 0;
  _$jscoverage['/ie/transform.js'].lineData[247] = 0;
  _$jscoverage['/ie/transform.js'].lineData[250] = 0;
  _$jscoverage['/ie/transform.js'].lineData[255] = 0;
  _$jscoverage['/ie/transform.js'].lineData[256] = 0;
  _$jscoverage['/ie/transform.js'].lineData[257] = 0;
  _$jscoverage['/ie/transform.js'].lineData[258] = 0;
  _$jscoverage['/ie/transform.js'].lineData[259] = 0;
  _$jscoverage['/ie/transform.js'].lineData[261] = 0;
  _$jscoverage['/ie/transform.js'].lineData[265] = 0;
  _$jscoverage['/ie/transform.js'].lineData[269] = 0;
  _$jscoverage['/ie/transform.js'].lineData[270] = 0;
}
if (! _$jscoverage['/ie/transform.js'].functionData) {
  _$jscoverage['/ie/transform.js'].functionData = [];
  _$jscoverage['/ie/transform.js'].functionData[0] = 0;
  _$jscoverage['/ie/transform.js'].functionData[1] = 0;
  _$jscoverage['/ie/transform.js'].functionData[2] = 0;
  _$jscoverage['/ie/transform.js'].functionData[3] = 0;
  _$jscoverage['/ie/transform.js'].functionData[4] = 0;
  _$jscoverage['/ie/transform.js'].functionData[5] = 0;
  _$jscoverage['/ie/transform.js'].functionData[6] = 0;
  _$jscoverage['/ie/transform.js'].functionData[7] = 0;
  _$jscoverage['/ie/transform.js'].functionData[8] = 0;
  _$jscoverage['/ie/transform.js'].functionData[9] = 0;
}
if (! _$jscoverage['/ie/transform.js'].branchData) {
  _$jscoverage['/ie/transform.js'].branchData = {};
  _$jscoverage['/ie/transform.js'].branchData['15'] = [];
  _$jscoverage['/ie/transform.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['19'] = [];
  _$jscoverage['/ie/transform.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['20'] = [];
  _$jscoverage['/ie/transform.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['21'] = [];
  _$jscoverage['/ie/transform.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['24'] = [];
  _$jscoverage['/ie/transform.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['24'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['57'] = [];
  _$jscoverage['/ie/transform.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['78'] = [];
  _$jscoverage['/ie/transform.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['80'] = [];
  _$jscoverage['/ie/transform.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['86'] = [];
  _$jscoverage['/ie/transform.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['88'] = [];
  _$jscoverage['/ie/transform.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['99'] = [];
  _$jscoverage['/ie/transform.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['132'] = [];
  _$jscoverage['/ie/transform.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['134'] = [];
  _$jscoverage['/ie/transform.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['137'] = [];
  _$jscoverage['/ie/transform.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['139'] = [];
  _$jscoverage['/ie/transform.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['159'] = [];
  _$jscoverage['/ie/transform.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['176'] = [];
  _$jscoverage['/ie/transform.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['198'] = [];
  _$jscoverage['/ie/transform.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['234'] = [];
  _$jscoverage['/ie/transform.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['242'] = [];
  _$jscoverage['/ie/transform.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['244'] = [];
  _$jscoverage['/ie/transform.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['255'] = [];
  _$jscoverage['/ie/transform.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['256'] = [];
  _$jscoverage['/ie/transform.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['258'] = [];
  _$jscoverage['/ie/transform.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['270'] = [];
  _$jscoverage['/ie/transform.js'].branchData['270'][1] = new BranchData();
}
_$jscoverage['/ie/transform.js'].branchData['270'][1].init(16, 25, 'value.indexOf("deg") > -1');
function visit114_270_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['258'][1].init(62, 6, 'j < r2');
function visit113_258_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['256'][1].init(29, 6, 'k < c2');
function visit112_256_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['255'][1].init(355, 6, 'i < r1');
function visit111_255_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['244'][1].init(55, 20, 'i < arguments.length');
function visit110_244_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['242'][1].init(14, 20, 'arguments.length > 2');
function visit109_242_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['234'][1].init(13, 5, '!m[x]');
function visit108_234_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['198'][1].init(124, 14, 'val.length > 1');
function visit107_198_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['176'][1].init(150, 11, 'val[1] || 0');
function visit106_176_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['159'][1].init(333, 7, '++i < l');
function visit105_159_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['139'][1].init(62, 26, 'S.endsWith(origin[i], \'%\')');
function visit104_139_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['137'][1].init(180, 17, 'i < origin.length');
function visit103_137_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['134'][1].init(89, 18, 'origin.length == 1');
function visit102_134_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['132'][1].init(18, 19, 'origin || \'50% 50%\'');
function visit101_132_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['99'][1].init(2528, 9, 'matrixVal');
function visit100_99_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['88'][1].init(127, 36, 'currentStyle && !currentStyle.filter');
function visit99_88_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['86'][1].init(47, 164, '!matrixVal || currentStyle && !currentStyle.filter');
function visit98_86_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['80'][1].init(1573, 50, '!matrixVal && !S.trim(filter.replace(rMatrix, \'\'))');
function visit97_80_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['78'][3].init(1532, 22, 'elemStyle.filter || ""');
function visit96_78_3(result) {
  _$jscoverage['/ie/transform.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['78'][2].init(1493, 35, 'currentStyle && currentStyle.filter');
function visit95_78_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['78'][1].init(1493, 61, 'currentStyle && currentStyle.filter || elemStyle.filter || ""');
function visit94_78_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['57'][1].init(569, 5, 'value');
function visit93_57_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['24'][2].init(376, 28, 'dys[0].toLowerCase() == \'dy\'');
function visit92_24_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['24'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['24'][1].init(369, 35, 'dys && dys[0].toLowerCase() == \'dy\'');
function visit91_24_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['21'][2].init(254, 28, 'dxs[0].toLowerCase() == \'dx\'');
function visit90_21_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['21'][1].init(247, 35, 'dxs && dxs[0].toLowerCase() == \'dx\'');
function visit89_21_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['20'][1].init(192, 33, 'matrix[5] && matrix[5].split("=")');
function visit88_20_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['19'][1].init(131, 33, 'matrix[4] && matrix[4].split("=")');
function visit87_19_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['15'][1].init(112, 43, 'elemStyle && rMatrix.test(elemStyle.filter)');
function visit86_15_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/transform.js'].functionData[0]++;
  _$jscoverage['/ie/transform.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/transform.js'].lineData[8]++;
  var cssHooks = Dom._cssHooks;
  _$jscoverage['/ie/transform.js'].lineData[9]++;
  var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;
  _$jscoverage['/ie/transform.js'].lineData[11]++;
  cssHooks.transform = {
  get: function(elem, computed) {
  _$jscoverage['/ie/transform.js'].functionData[1]++;
  _$jscoverage['/ie/transform.js'].lineData[13]++;
  var elemStyle = elem[computed ? 'currentStyle' : 'style'], matrix;
  _$jscoverage['/ie/transform.js'].lineData[15]++;
  if (visit86_15_1(elemStyle && rMatrix.test(elemStyle.filter))) {
    _$jscoverage['/ie/transform.js'].lineData[16]++;
    matrix = RegExp.$1.split(",");
    _$jscoverage['/ie/transform.js'].lineData[17]++;
    var dx = 0, dy = 0;
    _$jscoverage['/ie/transform.js'].lineData[19]++;
    var dxs = visit87_19_1(matrix[4] && matrix[4].split("="));
    _$jscoverage['/ie/transform.js'].lineData[20]++;
    var dys = visit88_20_1(matrix[5] && matrix[5].split("="));
    _$jscoverage['/ie/transform.js'].lineData[21]++;
    if (visit89_21_1(dxs && visit90_21_2(dxs[0].toLowerCase() == 'dx'))) {
      _$jscoverage['/ie/transform.js'].lineData[22]++;
      dx = parseFloat(dxs[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[24]++;
    if (visit91_24_1(dys && visit92_24_2(dys[0].toLowerCase() == 'dy'))) {
      _$jscoverage['/ie/transform.js'].lineData[25]++;
      dy = parseFloat(dys[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[27]++;
    matrix = [matrix[0].split("=")[1], matrix[2].split("=")[1], matrix[1].split("=")[1], matrix[3].split("=")[1], dx, dy];
  } else {
    _$jscoverage['/ie/transform.js'].lineData[36]++;
    return computed ? 'none' : '';
  }
  _$jscoverage['/ie/transform.js'].lineData[38]++;
  return 'matrix(' + matrix.join(',') + ')';
}, 
  set: function(elem, value) {
  _$jscoverage['/ie/transform.js'].functionData[2]++;
  _$jscoverage['/ie/transform.js'].lineData[42]++;
  var elemStyle = elem.style, currentStyle = elem.currentStyle, matrixVal, region = {
  width: elem.clientWidth, 
  height: elem.clientHeight}, center = {
  x: region.width / 2, 
  y: region.height / 2}, origin = parseOrigin(elem.style['transformOrigin'], region), filter;
  _$jscoverage['/ie/transform.js'].lineData[56]++;
  elemStyle.zoom = 1;
  _$jscoverage['/ie/transform.js'].lineData[57]++;
  if (visit93_57_1(value)) {
    _$jscoverage['/ie/transform.js'].lineData[58]++;
    value = matrix(value);
    _$jscoverage['/ie/transform.js'].lineData[59]++;
    var afterCenter = getCenterByOrigin(value, origin, center);
    _$jscoverage['/ie/transform.js'].lineData[60]++;
    afterCenter.x = afterCenter[0][0];
    _$jscoverage['/ie/transform.js'].lineData[61]++;
    afterCenter.y = afterCenter[1][0];
    _$jscoverage['/ie/transform.js'].lineData[62]++;
    matrixVal = ["progid:DXImageTransform.Microsoft.Matrix(" + "M11=" + value[0][0], "M12=" + value[0][1], "M21=" + value[1][0], "M22=" + value[1][1], "Dx=" + value[0][2], "Dy=" + value[1][2], 'SizingMethod="auto expand"'].join(',') + ')';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[76]++;
    matrixVal = '';
  }
  _$jscoverage['/ie/transform.js'].lineData[78]++;
  filter = visit94_78_1(visit95_78_2(currentStyle && currentStyle.filter) || visit96_78_3(elemStyle.filter || ""));
  _$jscoverage['/ie/transform.js'].lineData[80]++;
  if (visit97_80_1(!matrixVal && !S.trim(filter.replace(rMatrix, '')))) {
    _$jscoverage['/ie/transform.js'].lineData[84]++;
    elemStyle.removeAttribute('filter');
    _$jscoverage['/ie/transform.js'].lineData[85]++;
    if (visit98_86_1(!matrixVal || visit99_88_1(currentStyle && !currentStyle.filter))) {
      _$jscoverage['/ie/transform.js'].lineData[89]++;
      return;
    }
  }
  _$jscoverage['/ie/transform.js'].lineData[95]++;
  elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, matrixVal) : filter + (filter ? ', ' : '') + matrixVal;
  _$jscoverage['/ie/transform.js'].lineData[99]++;
  if (visit100_99_1(matrixVal)) {
    _$jscoverage['/ie/transform.js'].lineData[100]++;
    var realCenter = {
  x: elem.offsetWidth / 2, 
  y: elem.offsetHeight / 2};
    _$jscoverage['/ie/transform.js'].lineData[104]++;
    elemStyle.marginLeft = afterCenter.x - realCenter.x + 'px';
    _$jscoverage['/ie/transform.js'].lineData[105]++;
    elemStyle.marginTop = afterCenter.y - realCenter.y + 'px';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[107]++;
    elemStyle.marginLeft = elemStyle.marginTop = 0;
  }
}};
  _$jscoverage['/ie/transform.js'].lineData[113]++;
  function getCenterByOrigin(m, origin, center) {
    _$jscoverage['/ie/transform.js'].functionData[3]++;
    _$jscoverage['/ie/transform.js'].lineData[114]++;
    var w = origin[0], h = origin[1];
    _$jscoverage['/ie/transform.js'].lineData[116]++;
    return multipleMatrix([[1, 0, w], [0, 1, h], [0, 0, 1]], m, [[1, 0, -w], [0, 1, -h], [0, 0, 1]], [[center.x], [center.y], [1]]);
  }
  _$jscoverage['/ie/transform.js'].lineData[131]++;
  function parseOrigin(origin, region) {
    _$jscoverage['/ie/transform.js'].functionData[4]++;
    _$jscoverage['/ie/transform.js'].lineData[132]++;
    origin = visit101_132_1(origin || '50% 50%');
    _$jscoverage['/ie/transform.js'].lineData[133]++;
    origin = origin.split(/\s+/);
    _$jscoverage['/ie/transform.js'].lineData[134]++;
    if (visit102_134_1(origin.length == 1)) {
      _$jscoverage['/ie/transform.js'].lineData[135]++;
      origin[1] = origin[0];
    }
    _$jscoverage['/ie/transform.js'].lineData[137]++;
    for (var i = 0; visit103_137_1(i < origin.length); i++) {
      _$jscoverage['/ie/transform.js'].lineData[138]++;
      var val = parseFloat(origin[i]);
      _$jscoverage['/ie/transform.js'].lineData[139]++;
      if (visit104_139_1(S.endsWith(origin[i], '%'))) {
        _$jscoverage['/ie/transform.js'].lineData[140]++;
        origin[i] = val * region[i ? 'height' : 'width'] / 100;
      } else {
        _$jscoverage['/ie/transform.js'].lineData[142]++;
        origin[i] = val;
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[145]++;
    return origin;
  }
  _$jscoverage['/ie/transform.js'].lineData[149]++;
  function matrix(transform) {
    _$jscoverage['/ie/transform.js'].functionData[5]++;
    _$jscoverage['/ie/transform.js'].lineData[150]++;
    transform = transform.split(")");
    _$jscoverage['/ie/transform.js'].lineData[151]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]), curr;
    _$jscoverage['/ie/transform.js'].lineData[159]++;
    while (visit105_159_1(++i < l)) {
      _$jscoverage['/ie/transform.js'].lineData[160]++;
      split = transform[i].split("(");
      _$jscoverage['/ie/transform.js'].lineData[161]++;
      prop = trim(split[0]);
      _$jscoverage['/ie/transform.js'].lineData[162]++;
      val = split[1];
      _$jscoverage['/ie/transform.js'].lineData[163]++;
      curr = [1, 0, 0, 1, 0, 0];
      _$jscoverage['/ie/transform.js'].lineData[164]++;
      switch (prop) {
        case "translateX":
          _$jscoverage['/ie/transform.js'].lineData[166]++;
          curr[4] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[167]++;
          break;
        case "translateY":
          _$jscoverage['/ie/transform.js'].lineData[170]++;
          curr[5] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[171]++;
          break;
        case 'translate':
          _$jscoverage['/ie/transform.js'].lineData[174]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[175]++;
          curr[4] = parseInt(val[0], 10);
          _$jscoverage['/ie/transform.js'].lineData[176]++;
          curr[5] = parseInt(visit106_176_1(val[1] || 0), 10);
          _$jscoverage['/ie/transform.js'].lineData[177]++;
          break;
        case 'rotate':
          _$jscoverage['/ie/transform.js'].lineData[180]++;
          val = toRadian(val);
          _$jscoverage['/ie/transform.js'].lineData[181]++;
          curr[0] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[182]++;
          curr[1] = Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[183]++;
          curr[2] = -Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[184]++;
          curr[3] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[185]++;
          break;
        case 'scaleX':
          _$jscoverage['/ie/transform.js'].lineData[188]++;
          curr[0] = +val;
          _$jscoverage['/ie/transform.js'].lineData[189]++;
          break;
        case 'scaleY':
          _$jscoverage['/ie/transform.js'].lineData[192]++;
          curr[3] = +val;
          _$jscoverage['/ie/transform.js'].lineData[193]++;
          break;
        case 'scale':
          _$jscoverage['/ie/transform.js'].lineData[196]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[197]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[198]++;
          curr[3] = visit107_198_1(val.length > 1) ? +val[1] : +val[0];
          _$jscoverage['/ie/transform.js'].lineData[199]++;
          break;
        case "skewX":
          _$jscoverage['/ie/transform.js'].lineData[202]++;
          curr[2] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[203]++;
          break;
        case "skewY":
          _$jscoverage['/ie/transform.js'].lineData[206]++;
          curr[1] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[207]++;
          break;
        case 'matrix':
          _$jscoverage['/ie/transform.js'].lineData[210]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[211]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[212]++;
          curr[1] = +val[1];
          _$jscoverage['/ie/transform.js'].lineData[213]++;
          curr[2] = +val[2];
          _$jscoverage['/ie/transform.js'].lineData[214]++;
          curr[3] = +val[3];
          _$jscoverage['/ie/transform.js'].lineData[215]++;
          curr[4] = parseInt(val[4], 10);
          _$jscoverage['/ie/transform.js'].lineData[216]++;
          curr[5] = parseInt(val[5], 10);
          _$jscoverage['/ie/transform.js'].lineData[217]++;
          break;
      }
      _$jscoverage['/ie/transform.js'].lineData[219]++;
      ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
    }
    _$jscoverage['/ie/transform.js'].lineData[222]++;
    return ret;
  }
  _$jscoverage['/ie/transform.js'].lineData[225]++;
  function cssMatrixToComputableMatrix(matrix) {
    _$jscoverage['/ie/transform.js'].functionData[6]++;
    _$jscoverage['/ie/transform.js'].lineData[226]++;
    return [[matrix[0], matrix[2], matrix[4]], [matrix[1], matrix[3], matrix[5]], [0, 0, 1]];
  }
  _$jscoverage['/ie/transform.js'].lineData[233]++;
  function setMatrix(m, x, y, v) {
    _$jscoverage['/ie/transform.js'].functionData[7]++;
    _$jscoverage['/ie/transform.js'].lineData[234]++;
    if (visit108_234_1(!m[x])) {
      _$jscoverage['/ie/transform.js'].lineData[235]++;
      m[x] = [];
    }
    _$jscoverage['/ie/transform.js'].lineData[237]++;
    m[x][y] = v;
  }
  _$jscoverage['/ie/transform.js'].lineData[240]++;
  function multipleMatrix(m1, m2) {
    _$jscoverage['/ie/transform.js'].functionData[8]++;
    _$jscoverage['/ie/transform.js'].lineData[242]++;
    if (visit109_242_1(arguments.length > 2)) {
      _$jscoverage['/ie/transform.js'].lineData[243]++;
      var ret = m1;
      _$jscoverage['/ie/transform.js'].lineData[244]++;
      for (var i = 1; visit110_244_1(i < arguments.length); i++) {
        _$jscoverage['/ie/transform.js'].lineData[245]++;
        ret = multipleMatrix(ret, arguments[i]);
      }
      _$jscoverage['/ie/transform.js'].lineData[247]++;
      return ret;
    }
    _$jscoverage['/ie/transform.js'].lineData[250]++;
    var m = [], r1 = m1.length, r2 = m2.length, c2 = m2[0].length;
    _$jscoverage['/ie/transform.js'].lineData[255]++;
    for (i = 0; visit111_255_1(i < r1); i++) {
      _$jscoverage['/ie/transform.js'].lineData[256]++;
      for (var k = 0; visit112_256_1(k < c2); k++) {
        _$jscoverage['/ie/transform.js'].lineData[257]++;
        var sum = 0;
        _$jscoverage['/ie/transform.js'].lineData[258]++;
        for (var j = 0; visit113_258_1(j < r2); j++) {
          _$jscoverage['/ie/transform.js'].lineData[259]++;
          sum += m1[i][j] * m2[j][k];
        }
        _$jscoverage['/ie/transform.js'].lineData[261]++;
        setMatrix(m, i, k, sum);
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[265]++;
    return m;
  }
  _$jscoverage['/ie/transform.js'].lineData[269]++;
  function toRadian(value) {
    _$jscoverage['/ie/transform.js'].functionData[9]++;
    _$jscoverage['/ie/transform.js'].lineData[270]++;
    return visit114_270_1(value.indexOf("deg") > -1) ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value);
  }
});
