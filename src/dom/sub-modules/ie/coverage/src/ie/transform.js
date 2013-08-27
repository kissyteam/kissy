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
  _$jscoverage['/ie/transform.js'].lineData[5] = 0;
  _$jscoverage['/ie/transform.js'].lineData[6] = 0;
  _$jscoverage['/ie/transform.js'].lineData[7] = 0;
  _$jscoverage['/ie/transform.js'].lineData[9] = 0;
  _$jscoverage['/ie/transform.js'].lineData[11] = 0;
  _$jscoverage['/ie/transform.js'].lineData[13] = 0;
  _$jscoverage['/ie/transform.js'].lineData[14] = 0;
  _$jscoverage['/ie/transform.js'].lineData[15] = 0;
  _$jscoverage['/ie/transform.js'].lineData[17] = 0;
  _$jscoverage['/ie/transform.js'].lineData[18] = 0;
  _$jscoverage['/ie/transform.js'].lineData[19] = 0;
  _$jscoverage['/ie/transform.js'].lineData[20] = 0;
  _$jscoverage['/ie/transform.js'].lineData[22] = 0;
  _$jscoverage['/ie/transform.js'].lineData[23] = 0;
  _$jscoverage['/ie/transform.js'].lineData[25] = 0;
  _$jscoverage['/ie/transform.js'].lineData[34] = 0;
  _$jscoverage['/ie/transform.js'].lineData[36] = 0;
  _$jscoverage['/ie/transform.js'].lineData[40] = 0;
  _$jscoverage['/ie/transform.js'].lineData[54] = 0;
  _$jscoverage['/ie/transform.js'].lineData[55] = 0;
  _$jscoverage['/ie/transform.js'].lineData[56] = 0;
  _$jscoverage['/ie/transform.js'].lineData[57] = 0;
  _$jscoverage['/ie/transform.js'].lineData[58] = 0;
  _$jscoverage['/ie/transform.js'].lineData[59] = 0;
  _$jscoverage['/ie/transform.js'].lineData[60] = 0;
  _$jscoverage['/ie/transform.js'].lineData[74] = 0;
  _$jscoverage['/ie/transform.js'].lineData[76] = 0;
  _$jscoverage['/ie/transform.js'].lineData[78] = 0;
  _$jscoverage['/ie/transform.js'].lineData[82] = 0;
  _$jscoverage['/ie/transform.js'].lineData[83] = 0;
  _$jscoverage['/ie/transform.js'].lineData[87] = 0;
  _$jscoverage['/ie/transform.js'].lineData[93] = 0;
  _$jscoverage['/ie/transform.js'].lineData[97] = 0;
  _$jscoverage['/ie/transform.js'].lineData[98] = 0;
  _$jscoverage['/ie/transform.js'].lineData[102] = 0;
  _$jscoverage['/ie/transform.js'].lineData[103] = 0;
  _$jscoverage['/ie/transform.js'].lineData[105] = 0;
  _$jscoverage['/ie/transform.js'].lineData[111] = 0;
  _$jscoverage['/ie/transform.js'].lineData[112] = 0;
  _$jscoverage['/ie/transform.js'].lineData[114] = 0;
  _$jscoverage['/ie/transform.js'].lineData[129] = 0;
  _$jscoverage['/ie/transform.js'].lineData[130] = 0;
  _$jscoverage['/ie/transform.js'].lineData[131] = 0;
  _$jscoverage['/ie/transform.js'].lineData[132] = 0;
  _$jscoverage['/ie/transform.js'].lineData[133] = 0;
  _$jscoverage['/ie/transform.js'].lineData[135] = 0;
  _$jscoverage['/ie/transform.js'].lineData[136] = 0;
  _$jscoverage['/ie/transform.js'].lineData[137] = 0;
  _$jscoverage['/ie/transform.js'].lineData[138] = 0;
  _$jscoverage['/ie/transform.js'].lineData[140] = 0;
  _$jscoverage['/ie/transform.js'].lineData[143] = 0;
  _$jscoverage['/ie/transform.js'].lineData[147] = 0;
  _$jscoverage['/ie/transform.js'].lineData[148] = 0;
  _$jscoverage['/ie/transform.js'].lineData[149] = 0;
  _$jscoverage['/ie/transform.js'].lineData[157] = 0;
  _$jscoverage['/ie/transform.js'].lineData[158] = 0;
  _$jscoverage['/ie/transform.js'].lineData[159] = 0;
  _$jscoverage['/ie/transform.js'].lineData[160] = 0;
  _$jscoverage['/ie/transform.js'].lineData[161] = 0;
  _$jscoverage['/ie/transform.js'].lineData[162] = 0;
  _$jscoverage['/ie/transform.js'].lineData[164] = 0;
  _$jscoverage['/ie/transform.js'].lineData[165] = 0;
  _$jscoverage['/ie/transform.js'].lineData[168] = 0;
  _$jscoverage['/ie/transform.js'].lineData[169] = 0;
  _$jscoverage['/ie/transform.js'].lineData[172] = 0;
  _$jscoverage['/ie/transform.js'].lineData[173] = 0;
  _$jscoverage['/ie/transform.js'].lineData[174] = 0;
  _$jscoverage['/ie/transform.js'].lineData[175] = 0;
  _$jscoverage['/ie/transform.js'].lineData[178] = 0;
  _$jscoverage['/ie/transform.js'].lineData[179] = 0;
  _$jscoverage['/ie/transform.js'].lineData[180] = 0;
  _$jscoverage['/ie/transform.js'].lineData[181] = 0;
  _$jscoverage['/ie/transform.js'].lineData[182] = 0;
  _$jscoverage['/ie/transform.js'].lineData[183] = 0;
  _$jscoverage['/ie/transform.js'].lineData[186] = 0;
  _$jscoverage['/ie/transform.js'].lineData[187] = 0;
  _$jscoverage['/ie/transform.js'].lineData[190] = 0;
  _$jscoverage['/ie/transform.js'].lineData[191] = 0;
  _$jscoverage['/ie/transform.js'].lineData[194] = 0;
  _$jscoverage['/ie/transform.js'].lineData[195] = 0;
  _$jscoverage['/ie/transform.js'].lineData[196] = 0;
  _$jscoverage['/ie/transform.js'].lineData[197] = 0;
  _$jscoverage['/ie/transform.js'].lineData[200] = 0;
  _$jscoverage['/ie/transform.js'].lineData[201] = 0;
  _$jscoverage['/ie/transform.js'].lineData[204] = 0;
  _$jscoverage['/ie/transform.js'].lineData[205] = 0;
  _$jscoverage['/ie/transform.js'].lineData[208] = 0;
  _$jscoverage['/ie/transform.js'].lineData[209] = 0;
  _$jscoverage['/ie/transform.js'].lineData[210] = 0;
  _$jscoverage['/ie/transform.js'].lineData[211] = 0;
  _$jscoverage['/ie/transform.js'].lineData[212] = 0;
  _$jscoverage['/ie/transform.js'].lineData[213] = 0;
  _$jscoverage['/ie/transform.js'].lineData[214] = 0;
  _$jscoverage['/ie/transform.js'].lineData[215] = 0;
  _$jscoverage['/ie/transform.js'].lineData[217] = 0;
  _$jscoverage['/ie/transform.js'].lineData[220] = 0;
  _$jscoverage['/ie/transform.js'].lineData[223] = 0;
  _$jscoverage['/ie/transform.js'].lineData[224] = 0;
  _$jscoverage['/ie/transform.js'].lineData[231] = 0;
  _$jscoverage['/ie/transform.js'].lineData[232] = 0;
  _$jscoverage['/ie/transform.js'].lineData[233] = 0;
  _$jscoverage['/ie/transform.js'].lineData[235] = 0;
  _$jscoverage['/ie/transform.js'].lineData[238] = 0;
  _$jscoverage['/ie/transform.js'].lineData[240] = 0;
  _$jscoverage['/ie/transform.js'].lineData[241] = 0;
  _$jscoverage['/ie/transform.js'].lineData[242] = 0;
  _$jscoverage['/ie/transform.js'].lineData[243] = 0;
  _$jscoverage['/ie/transform.js'].lineData[245] = 0;
  _$jscoverage['/ie/transform.js'].lineData[248] = 0;
  _$jscoverage['/ie/transform.js'].lineData[253] = 0;
  _$jscoverage['/ie/transform.js'].lineData[254] = 0;
  _$jscoverage['/ie/transform.js'].lineData[255] = 0;
  _$jscoverage['/ie/transform.js'].lineData[256] = 0;
  _$jscoverage['/ie/transform.js'].lineData[257] = 0;
  _$jscoverage['/ie/transform.js'].lineData[259] = 0;
  _$jscoverage['/ie/transform.js'].lineData[263] = 0;
  _$jscoverage['/ie/transform.js'].lineData[267] = 0;
  _$jscoverage['/ie/transform.js'].lineData[268] = 0;
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
  _$jscoverage['/ie/transform.js'].branchData['13'] = [];
  _$jscoverage['/ie/transform.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['17'] = [];
  _$jscoverage['/ie/transform.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['18'] = [];
  _$jscoverage['/ie/transform.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['19'] = [];
  _$jscoverage['/ie/transform.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['22'] = [];
  _$jscoverage['/ie/transform.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['55'] = [];
  _$jscoverage['/ie/transform.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['76'] = [];
  _$jscoverage['/ie/transform.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['76'][3] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['78'] = [];
  _$jscoverage['/ie/transform.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['84'] = [];
  _$jscoverage['/ie/transform.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['86'] = [];
  _$jscoverage['/ie/transform.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['97'] = [];
  _$jscoverage['/ie/transform.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['130'] = [];
  _$jscoverage['/ie/transform.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['132'] = [];
  _$jscoverage['/ie/transform.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['135'] = [];
  _$jscoverage['/ie/transform.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['137'] = [];
  _$jscoverage['/ie/transform.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['157'] = [];
  _$jscoverage['/ie/transform.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['174'] = [];
  _$jscoverage['/ie/transform.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['196'] = [];
  _$jscoverage['/ie/transform.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['232'] = [];
  _$jscoverage['/ie/transform.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['240'] = [];
  _$jscoverage['/ie/transform.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['242'] = [];
  _$jscoverage['/ie/transform.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['253'] = [];
  _$jscoverage['/ie/transform.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['254'] = [];
  _$jscoverage['/ie/transform.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['256'] = [];
  _$jscoverage['/ie/transform.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['268'] = [];
  _$jscoverage['/ie/transform.js'].branchData['268'][1] = new BranchData();
}
_$jscoverage['/ie/transform.js'].branchData['268'][1].init(17, 25, 'value.indexOf("deg") > -1');
function visit114_268_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['256'][1].init(64, 6, 'j < r2');
function visit113_256_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['254'][1].init(30, 6, 'k < c2');
function visit112_254_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['253'][1].init(370, 6, 'i < r1');
function visit111_253_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['242'][1].init(57, 20, 'i < arguments.length');
function visit110_242_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['240'][1].init(16, 20, 'arguments.length > 2');
function visit109_240_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['232'][1].init(14, 5, '!m[x]');
function visit108_232_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['196'][1].init(127, 14, 'val.length > 1');
function visit107_196_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['174'][1].init(153, 11, 'val[1] || 0');
function visit106_174_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['157'][1].init(343, 7, '++i < l');
function visit105_157_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['137'][1].init(64, 26, 'S.endsWith(origin[i], \'%\')');
function visit104_137_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['135'][1].init(186, 17, 'i < origin.length');
function visit103_135_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['132'][1].init(92, 18, 'origin.length == 1');
function visit102_132_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['130'][1].init(19, 19, 'origin || \'50% 50%\'');
function visit101_130_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['97'][1].init(2586, 9, 'matrixVal');
function visit100_97_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['86'][1].init(129, 36, 'currentStyle && !currentStyle.filter');
function visit99_86_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['84'][1].init(48, 166, '!matrixVal || currentStyle && !currentStyle.filter');
function visit98_84_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['78'][1].init(1612, 50, '!matrixVal && !S.trim(filter.replace(rMatrix, \'\'))');
function visit97_78_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['76'][3].init(1569, 22, 'elemStyle.filter || ""');
function visit96_76_3(result) {
  _$jscoverage['/ie/transform.js'].branchData['76'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['76'][2].init(1530, 35, 'currentStyle && currentStyle.filter');
function visit95_76_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['76'][1].init(1530, 61, 'currentStyle && currentStyle.filter || elemStyle.filter || ""');
function visit94_76_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['55'][1].init(585, 5, 'value');
function visit93_55_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['22'][2].init(385, 28, 'dys[0].toLowerCase() == \'dy\'');
function visit92_22_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['22'][1].init(378, 35, 'dys && dys[0].toLowerCase() == \'dy\'');
function visit91_22_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['19'][2].init(260, 28, 'dxs[0].toLowerCase() == \'dx\'');
function visit90_19_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['19'][1].init(253, 35, 'dxs && dxs[0].toLowerCase() == \'dx\'');
function visit89_19_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['18'][1].init(197, 33, 'matrix[5] && matrix[5].split("=")');
function visit88_18_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['17'][1].init(135, 33, 'matrix[4] && matrix[4].split("=")');
function visit87_17_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['13'][1].init(115, 43, 'elemStyle && rMatrix.test(elemStyle.filter)');
function visit86_13_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].lineData[5]++;
KISSY.add('dom/ie/transform', function(S, Dom) {
  _$jscoverage['/ie/transform.js'].functionData[0]++;
  _$jscoverage['/ie/transform.js'].lineData[6]++;
  var cssHooks = Dom._cssHooks;
  _$jscoverage['/ie/transform.js'].lineData[7]++;
  var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;
  _$jscoverage['/ie/transform.js'].lineData[9]++;
  cssHooks.transform = {
  get: function(elem, computed) {
  _$jscoverage['/ie/transform.js'].functionData[1]++;
  _$jscoverage['/ie/transform.js'].lineData[11]++;
  var elemStyle = elem[computed ? 'currentStyle' : 'style'], matrix;
  _$jscoverage['/ie/transform.js'].lineData[13]++;
  if (visit86_13_1(elemStyle && rMatrix.test(elemStyle.filter))) {
    _$jscoverage['/ie/transform.js'].lineData[14]++;
    matrix = RegExp.$1.split(",");
    _$jscoverage['/ie/transform.js'].lineData[15]++;
    var dx = 0, dy = 0;
    _$jscoverage['/ie/transform.js'].lineData[17]++;
    var dxs = visit87_17_1(matrix[4] && matrix[4].split("="));
    _$jscoverage['/ie/transform.js'].lineData[18]++;
    var dys = visit88_18_1(matrix[5] && matrix[5].split("="));
    _$jscoverage['/ie/transform.js'].lineData[19]++;
    if (visit89_19_1(dxs && visit90_19_2(dxs[0].toLowerCase() == 'dx'))) {
      _$jscoverage['/ie/transform.js'].lineData[20]++;
      dx = parseFloat(dxs[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[22]++;
    if (visit91_22_1(dys && visit92_22_2(dys[0].toLowerCase() == 'dy'))) {
      _$jscoverage['/ie/transform.js'].lineData[23]++;
      dy = parseFloat(dys[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[25]++;
    matrix = [matrix[0].split("=")[1], matrix[2].split("=")[1], matrix[1].split("=")[1], matrix[3].split("=")[1], dx, dy];
  } else {
    _$jscoverage['/ie/transform.js'].lineData[34]++;
    return computed ? 'none' : '';
  }
  _$jscoverage['/ie/transform.js'].lineData[36]++;
  return 'matrix(' + matrix.join(',') + ')';
}, 
  set: function(elem, value) {
  _$jscoverage['/ie/transform.js'].functionData[2]++;
  _$jscoverage['/ie/transform.js'].lineData[40]++;
  var elemStyle = elem.style, currentStyle = elem.currentStyle, matrixVal, region = {
  width: elem.clientWidth, 
  height: elem.clientHeight}, center = {
  x: region.width / 2, 
  y: region.height / 2}, origin = parseOrigin(elem.style['transformOrigin'], region), filter;
  _$jscoverage['/ie/transform.js'].lineData[54]++;
  elemStyle.zoom = 1;
  _$jscoverage['/ie/transform.js'].lineData[55]++;
  if (visit93_55_1(value)) {
    _$jscoverage['/ie/transform.js'].lineData[56]++;
    value = matrix(value);
    _$jscoverage['/ie/transform.js'].lineData[57]++;
    var afterCenter = getCenterByOrigin(value, origin, center);
    _$jscoverage['/ie/transform.js'].lineData[58]++;
    afterCenter.x = afterCenter[0][0];
    _$jscoverage['/ie/transform.js'].lineData[59]++;
    afterCenter.y = afterCenter[1][0];
    _$jscoverage['/ie/transform.js'].lineData[60]++;
    matrixVal = ["progid:DXImageTransform.Microsoft.Matrix(" + "M11=" + value[0][0], "M12=" + value[0][1], "M21=" + value[1][0], "M22=" + value[1][1], "Dx=" + value[0][2], "Dy=" + value[1][2], 'SizingMethod="auto expand"'].join(',') + ')';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[74]++;
    matrixVal = '';
  }
  _$jscoverage['/ie/transform.js'].lineData[76]++;
  filter = visit94_76_1(visit95_76_2(currentStyle && currentStyle.filter) || visit96_76_3(elemStyle.filter || ""));
  _$jscoverage['/ie/transform.js'].lineData[78]++;
  if (visit97_78_1(!matrixVal && !S.trim(filter.replace(rMatrix, '')))) {
    _$jscoverage['/ie/transform.js'].lineData[82]++;
    elemStyle.removeAttribute('filter');
    _$jscoverage['/ie/transform.js'].lineData[83]++;
    if (visit98_84_1(!matrixVal || visit99_86_1(currentStyle && !currentStyle.filter))) {
      _$jscoverage['/ie/transform.js'].lineData[87]++;
      return;
    }
  }
  _$jscoverage['/ie/transform.js'].lineData[93]++;
  elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, matrixVal) : filter + (filter ? ', ' : '') + matrixVal;
  _$jscoverage['/ie/transform.js'].lineData[97]++;
  if (visit100_97_1(matrixVal)) {
    _$jscoverage['/ie/transform.js'].lineData[98]++;
    var realCenter = {
  x: elem.offsetWidth / 2, 
  y: elem.offsetHeight / 2};
    _$jscoverage['/ie/transform.js'].lineData[102]++;
    elemStyle.marginLeft = afterCenter.x - realCenter.x + 'px';
    _$jscoverage['/ie/transform.js'].lineData[103]++;
    elemStyle.marginTop = afterCenter.y - realCenter.y + 'px';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[105]++;
    elemStyle.marginLeft = elemStyle.marginTop = 0;
  }
}};
  _$jscoverage['/ie/transform.js'].lineData[111]++;
  function getCenterByOrigin(m, origin, center) {
    _$jscoverage['/ie/transform.js'].functionData[3]++;
    _$jscoverage['/ie/transform.js'].lineData[112]++;
    var w = origin[0], h = origin[1];
    _$jscoverage['/ie/transform.js'].lineData[114]++;
    return multipleMatrix([[1, 0, w], [0, 1, h], [0, 0, 1]], m, [[1, 0, -w], [0, 1, -h], [0, 0, 1]], [[center.x], [center.y], [1]]);
  }
  _$jscoverage['/ie/transform.js'].lineData[129]++;
  function parseOrigin(origin, region) {
    _$jscoverage['/ie/transform.js'].functionData[4]++;
    _$jscoverage['/ie/transform.js'].lineData[130]++;
    origin = visit101_130_1(origin || '50% 50%');
    _$jscoverage['/ie/transform.js'].lineData[131]++;
    origin = origin.split(/\s+/);
    _$jscoverage['/ie/transform.js'].lineData[132]++;
    if (visit102_132_1(origin.length == 1)) {
      _$jscoverage['/ie/transform.js'].lineData[133]++;
      origin[1] = origin[0];
    }
    _$jscoverage['/ie/transform.js'].lineData[135]++;
    for (var i = 0; visit103_135_1(i < origin.length); i++) {
      _$jscoverage['/ie/transform.js'].lineData[136]++;
      var val = parseFloat(origin[i]);
      _$jscoverage['/ie/transform.js'].lineData[137]++;
      if (visit104_137_1(S.endsWith(origin[i], '%'))) {
        _$jscoverage['/ie/transform.js'].lineData[138]++;
        origin[i] = val * region[i ? 'height' : 'width'] / 100;
      } else {
        _$jscoverage['/ie/transform.js'].lineData[140]++;
        origin[i] = val;
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[143]++;
    return origin;
  }
  _$jscoverage['/ie/transform.js'].lineData[147]++;
  function matrix(transform) {
    _$jscoverage['/ie/transform.js'].functionData[5]++;
    _$jscoverage['/ie/transform.js'].lineData[148]++;
    transform = transform.split(")");
    _$jscoverage['/ie/transform.js'].lineData[149]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]), curr;
    _$jscoverage['/ie/transform.js'].lineData[157]++;
    while (visit105_157_1(++i < l)) {
      _$jscoverage['/ie/transform.js'].lineData[158]++;
      split = transform[i].split("(");
      _$jscoverage['/ie/transform.js'].lineData[159]++;
      prop = trim(split[0]);
      _$jscoverage['/ie/transform.js'].lineData[160]++;
      val = split[1];
      _$jscoverage['/ie/transform.js'].lineData[161]++;
      curr = [1, 0, 0, 1, 0, 0];
      _$jscoverage['/ie/transform.js'].lineData[162]++;
      switch (prop) {
        case "translateX":
          _$jscoverage['/ie/transform.js'].lineData[164]++;
          curr[4] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[165]++;
          break;
        case "translateY":
          _$jscoverage['/ie/transform.js'].lineData[168]++;
          curr[5] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[169]++;
          break;
        case 'translate':
          _$jscoverage['/ie/transform.js'].lineData[172]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[173]++;
          curr[4] = parseInt(val[0], 10);
          _$jscoverage['/ie/transform.js'].lineData[174]++;
          curr[5] = parseInt(visit106_174_1(val[1] || 0), 10);
          _$jscoverage['/ie/transform.js'].lineData[175]++;
          break;
        case 'rotate':
          _$jscoverage['/ie/transform.js'].lineData[178]++;
          val = toRadian(val);
          _$jscoverage['/ie/transform.js'].lineData[179]++;
          curr[0] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[180]++;
          curr[1] = Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[181]++;
          curr[2] = -Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[182]++;
          curr[3] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[183]++;
          break;
        case 'scaleX':
          _$jscoverage['/ie/transform.js'].lineData[186]++;
          curr[0] = +val;
          _$jscoverage['/ie/transform.js'].lineData[187]++;
          break;
        case 'scaleY':
          _$jscoverage['/ie/transform.js'].lineData[190]++;
          curr[3] = +val;
          _$jscoverage['/ie/transform.js'].lineData[191]++;
          break;
        case 'scale':
          _$jscoverage['/ie/transform.js'].lineData[194]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[195]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[196]++;
          curr[3] = visit107_196_1(val.length > 1) ? +val[1] : +val[0];
          _$jscoverage['/ie/transform.js'].lineData[197]++;
          break;
        case "skewX":
          _$jscoverage['/ie/transform.js'].lineData[200]++;
          curr[2] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[201]++;
          break;
        case "skewY":
          _$jscoverage['/ie/transform.js'].lineData[204]++;
          curr[1] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[205]++;
          break;
        case 'matrix':
          _$jscoverage['/ie/transform.js'].lineData[208]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[209]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[210]++;
          curr[1] = +val[1];
          _$jscoverage['/ie/transform.js'].lineData[211]++;
          curr[2] = +val[2];
          _$jscoverage['/ie/transform.js'].lineData[212]++;
          curr[3] = +val[3];
          _$jscoverage['/ie/transform.js'].lineData[213]++;
          curr[4] = parseInt(val[4], 10);
          _$jscoverage['/ie/transform.js'].lineData[214]++;
          curr[5] = parseInt(val[5], 10);
          _$jscoverage['/ie/transform.js'].lineData[215]++;
          break;
      }
      _$jscoverage['/ie/transform.js'].lineData[217]++;
      ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
    }
    _$jscoverage['/ie/transform.js'].lineData[220]++;
    return ret;
  }
  _$jscoverage['/ie/transform.js'].lineData[223]++;
  function cssMatrixToComputableMatrix(matrix) {
    _$jscoverage['/ie/transform.js'].functionData[6]++;
    _$jscoverage['/ie/transform.js'].lineData[224]++;
    return [[matrix[0], matrix[2], matrix[4]], [matrix[1], matrix[3], matrix[5]], [0, 0, 1]];
  }
  _$jscoverage['/ie/transform.js'].lineData[231]++;
  function setMatrix(m, x, y, v) {
    _$jscoverage['/ie/transform.js'].functionData[7]++;
    _$jscoverage['/ie/transform.js'].lineData[232]++;
    if (visit108_232_1(!m[x])) {
      _$jscoverage['/ie/transform.js'].lineData[233]++;
      m[x] = [];
    }
    _$jscoverage['/ie/transform.js'].lineData[235]++;
    m[x][y] = v;
  }
  _$jscoverage['/ie/transform.js'].lineData[238]++;
  function multipleMatrix(m1, m2) {
    _$jscoverage['/ie/transform.js'].functionData[8]++;
    _$jscoverage['/ie/transform.js'].lineData[240]++;
    if (visit109_240_1(arguments.length > 2)) {
      _$jscoverage['/ie/transform.js'].lineData[241]++;
      var ret = m1;
      _$jscoverage['/ie/transform.js'].lineData[242]++;
      for (var i = 1; visit110_242_1(i < arguments.length); i++) {
        _$jscoverage['/ie/transform.js'].lineData[243]++;
        ret = multipleMatrix(ret, arguments[i]);
      }
      _$jscoverage['/ie/transform.js'].lineData[245]++;
      return ret;
    }
    _$jscoverage['/ie/transform.js'].lineData[248]++;
    var m = [], r1 = m1.length, r2 = m2.length, c2 = m2[0].length;
    _$jscoverage['/ie/transform.js'].lineData[253]++;
    for (i = 0; visit111_253_1(i < r1); i++) {
      _$jscoverage['/ie/transform.js'].lineData[254]++;
      for (var k = 0; visit112_254_1(k < c2); k++) {
        _$jscoverage['/ie/transform.js'].lineData[255]++;
        var sum = 0;
        _$jscoverage['/ie/transform.js'].lineData[256]++;
        for (var j = 0; visit113_256_1(j < r2); j++) {
          _$jscoverage['/ie/transform.js'].lineData[257]++;
          sum += m1[i][j] * m2[j][k];
        }
        _$jscoverage['/ie/transform.js'].lineData[259]++;
        setMatrix(m, i, k, sum);
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[263]++;
    return m;
  }
  _$jscoverage['/ie/transform.js'].lineData[267]++;
  function toRadian(value) {
    _$jscoverage['/ie/transform.js'].functionData[9]++;
    _$jscoverage['/ie/transform.js'].lineData[268]++;
    return visit114_268_1(value.indexOf("deg") > -1) ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value);
  }
}, {
  requires: ['dom/base']});
