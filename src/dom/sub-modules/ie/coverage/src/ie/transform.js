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
  _$jscoverage['/ie/transform.js'].lineData[10] = 0;
  _$jscoverage['/ie/transform.js'].lineData[12] = 0;
  _$jscoverage['/ie/transform.js'].lineData[14] = 0;
  _$jscoverage['/ie/transform.js'].lineData[15] = 0;
  _$jscoverage['/ie/transform.js'].lineData[16] = 0;
  _$jscoverage['/ie/transform.js'].lineData[18] = 0;
  _$jscoverage['/ie/transform.js'].lineData[19] = 0;
  _$jscoverage['/ie/transform.js'].lineData[20] = 0;
  _$jscoverage['/ie/transform.js'].lineData[21] = 0;
  _$jscoverage['/ie/transform.js'].lineData[23] = 0;
  _$jscoverage['/ie/transform.js'].lineData[24] = 0;
  _$jscoverage['/ie/transform.js'].lineData[26] = 0;
  _$jscoverage['/ie/transform.js'].lineData[35] = 0;
  _$jscoverage['/ie/transform.js'].lineData[37] = 0;
  _$jscoverage['/ie/transform.js'].lineData[41] = 0;
  _$jscoverage['/ie/transform.js'].lineData[55] = 0;
  _$jscoverage['/ie/transform.js'].lineData[56] = 0;
  _$jscoverage['/ie/transform.js'].lineData[57] = 0;
  _$jscoverage['/ie/transform.js'].lineData[58] = 0;
  _$jscoverage['/ie/transform.js'].lineData[59] = 0;
  _$jscoverage['/ie/transform.js'].lineData[60] = 0;
  _$jscoverage['/ie/transform.js'].lineData[61] = 0;
  _$jscoverage['/ie/transform.js'].lineData[75] = 0;
  _$jscoverage['/ie/transform.js'].lineData[77] = 0;
  _$jscoverage['/ie/transform.js'].lineData[79] = 0;
  _$jscoverage['/ie/transform.js'].lineData[83] = 0;
  _$jscoverage['/ie/transform.js'].lineData[84] = 0;
  _$jscoverage['/ie/transform.js'].lineData[88] = 0;
  _$jscoverage['/ie/transform.js'].lineData[94] = 0;
  _$jscoverage['/ie/transform.js'].lineData[98] = 0;
  _$jscoverage['/ie/transform.js'].lineData[99] = 0;
  _$jscoverage['/ie/transform.js'].lineData[103] = 0;
  _$jscoverage['/ie/transform.js'].lineData[104] = 0;
  _$jscoverage['/ie/transform.js'].lineData[106] = 0;
  _$jscoverage['/ie/transform.js'].lineData[112] = 0;
  _$jscoverage['/ie/transform.js'].lineData[113] = 0;
  _$jscoverage['/ie/transform.js'].lineData[115] = 0;
  _$jscoverage['/ie/transform.js'].lineData[130] = 0;
  _$jscoverage['/ie/transform.js'].lineData[131] = 0;
  _$jscoverage['/ie/transform.js'].lineData[132] = 0;
  _$jscoverage['/ie/transform.js'].lineData[133] = 0;
  _$jscoverage['/ie/transform.js'].lineData[134] = 0;
  _$jscoverage['/ie/transform.js'].lineData[136] = 0;
  _$jscoverage['/ie/transform.js'].lineData[137] = 0;
  _$jscoverage['/ie/transform.js'].lineData[138] = 0;
  _$jscoverage['/ie/transform.js'].lineData[139] = 0;
  _$jscoverage['/ie/transform.js'].lineData[141] = 0;
  _$jscoverage['/ie/transform.js'].lineData[144] = 0;
  _$jscoverage['/ie/transform.js'].lineData[148] = 0;
  _$jscoverage['/ie/transform.js'].lineData[149] = 0;
  _$jscoverage['/ie/transform.js'].lineData[150] = 0;
  _$jscoverage['/ie/transform.js'].lineData[158] = 0;
  _$jscoverage['/ie/transform.js'].lineData[159] = 0;
  _$jscoverage['/ie/transform.js'].lineData[160] = 0;
  _$jscoverage['/ie/transform.js'].lineData[161] = 0;
  _$jscoverage['/ie/transform.js'].lineData[162] = 0;
  _$jscoverage['/ie/transform.js'].lineData[163] = 0;
  _$jscoverage['/ie/transform.js'].lineData[165] = 0;
  _$jscoverage['/ie/transform.js'].lineData[166] = 0;
  _$jscoverage['/ie/transform.js'].lineData[169] = 0;
  _$jscoverage['/ie/transform.js'].lineData[170] = 0;
  _$jscoverage['/ie/transform.js'].lineData[173] = 0;
  _$jscoverage['/ie/transform.js'].lineData[174] = 0;
  _$jscoverage['/ie/transform.js'].lineData[175] = 0;
  _$jscoverage['/ie/transform.js'].lineData[176] = 0;
  _$jscoverage['/ie/transform.js'].lineData[179] = 0;
  _$jscoverage['/ie/transform.js'].lineData[180] = 0;
  _$jscoverage['/ie/transform.js'].lineData[181] = 0;
  _$jscoverage['/ie/transform.js'].lineData[182] = 0;
  _$jscoverage['/ie/transform.js'].lineData[183] = 0;
  _$jscoverage['/ie/transform.js'].lineData[184] = 0;
  _$jscoverage['/ie/transform.js'].lineData[187] = 0;
  _$jscoverage['/ie/transform.js'].lineData[188] = 0;
  _$jscoverage['/ie/transform.js'].lineData[191] = 0;
  _$jscoverage['/ie/transform.js'].lineData[192] = 0;
  _$jscoverage['/ie/transform.js'].lineData[195] = 0;
  _$jscoverage['/ie/transform.js'].lineData[196] = 0;
  _$jscoverage['/ie/transform.js'].lineData[197] = 0;
  _$jscoverage['/ie/transform.js'].lineData[198] = 0;
  _$jscoverage['/ie/transform.js'].lineData[201] = 0;
  _$jscoverage['/ie/transform.js'].lineData[202] = 0;
  _$jscoverage['/ie/transform.js'].lineData[205] = 0;
  _$jscoverage['/ie/transform.js'].lineData[206] = 0;
  _$jscoverage['/ie/transform.js'].lineData[209] = 0;
  _$jscoverage['/ie/transform.js'].lineData[210] = 0;
  _$jscoverage['/ie/transform.js'].lineData[211] = 0;
  _$jscoverage['/ie/transform.js'].lineData[212] = 0;
  _$jscoverage['/ie/transform.js'].lineData[213] = 0;
  _$jscoverage['/ie/transform.js'].lineData[214] = 0;
  _$jscoverage['/ie/transform.js'].lineData[215] = 0;
  _$jscoverage['/ie/transform.js'].lineData[216] = 0;
  _$jscoverage['/ie/transform.js'].lineData[218] = 0;
  _$jscoverage['/ie/transform.js'].lineData[221] = 0;
  _$jscoverage['/ie/transform.js'].lineData[224] = 0;
  _$jscoverage['/ie/transform.js'].lineData[225] = 0;
  _$jscoverage['/ie/transform.js'].lineData[232] = 0;
  _$jscoverage['/ie/transform.js'].lineData[233] = 0;
  _$jscoverage['/ie/transform.js'].lineData[234] = 0;
  _$jscoverage['/ie/transform.js'].lineData[236] = 0;
  _$jscoverage['/ie/transform.js'].lineData[239] = 0;
  _$jscoverage['/ie/transform.js'].lineData[241] = 0;
  _$jscoverage['/ie/transform.js'].lineData[242] = 0;
  _$jscoverage['/ie/transform.js'].lineData[243] = 0;
  _$jscoverage['/ie/transform.js'].lineData[244] = 0;
  _$jscoverage['/ie/transform.js'].lineData[246] = 0;
  _$jscoverage['/ie/transform.js'].lineData[249] = 0;
  _$jscoverage['/ie/transform.js'].lineData[254] = 0;
  _$jscoverage['/ie/transform.js'].lineData[255] = 0;
  _$jscoverage['/ie/transform.js'].lineData[256] = 0;
  _$jscoverage['/ie/transform.js'].lineData[257] = 0;
  _$jscoverage['/ie/transform.js'].lineData[258] = 0;
  _$jscoverage['/ie/transform.js'].lineData[260] = 0;
  _$jscoverage['/ie/transform.js'].lineData[264] = 0;
  _$jscoverage['/ie/transform.js'].lineData[268] = 0;
  _$jscoverage['/ie/transform.js'].lineData[269] = 0;
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
  _$jscoverage['/ie/transform.js'].branchData['14'] = [];
  _$jscoverage['/ie/transform.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['18'] = [];
  _$jscoverage['/ie/transform.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['19'] = [];
  _$jscoverage['/ie/transform.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['20'] = [];
  _$jscoverage['/ie/transform.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['20'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['23'] = [];
  _$jscoverage['/ie/transform.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['56'] = [];
  _$jscoverage['/ie/transform.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['77'] = [];
  _$jscoverage['/ie/transform.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['79'] = [];
  _$jscoverage['/ie/transform.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['85'] = [];
  _$jscoverage['/ie/transform.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['87'] = [];
  _$jscoverage['/ie/transform.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['98'] = [];
  _$jscoverage['/ie/transform.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['131'] = [];
  _$jscoverage['/ie/transform.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['133'] = [];
  _$jscoverage['/ie/transform.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['136'] = [];
  _$jscoverage['/ie/transform.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['138'] = [];
  _$jscoverage['/ie/transform.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['158'] = [];
  _$jscoverage['/ie/transform.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['175'] = [];
  _$jscoverage['/ie/transform.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['197'] = [];
  _$jscoverage['/ie/transform.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['233'] = [];
  _$jscoverage['/ie/transform.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['241'] = [];
  _$jscoverage['/ie/transform.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['243'] = [];
  _$jscoverage['/ie/transform.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['254'] = [];
  _$jscoverage['/ie/transform.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['255'] = [];
  _$jscoverage['/ie/transform.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['257'] = [];
  _$jscoverage['/ie/transform.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['269'] = [];
  _$jscoverage['/ie/transform.js'].branchData['269'][1] = new BranchData();
}
_$jscoverage['/ie/transform.js'].branchData['269'][1].init(17, 25, 'value.indexOf("deg") > -1');
function visit114_269_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['257'][1].init(64, 6, 'j < r2');
function visit113_257_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['255'][1].init(30, 6, 'k < c2');
function visit112_255_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['254'][1].init(370, 6, 'i < r1');
function visit111_254_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['243'][1].init(57, 20, 'i < arguments.length');
function visit110_243_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['241'][1].init(16, 20, 'arguments.length > 2');
function visit109_241_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['233'][1].init(14, 5, '!m[x]');
function visit108_233_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['197'][1].init(127, 14, 'val.length > 1');
function visit107_197_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['175'][1].init(153, 11, 'val[1] || 0');
function visit106_175_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['158'][1].init(343, 7, '++i < l');
function visit105_158_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['138'][1].init(64, 26, 'S.endsWith(origin[i], \'%\')');
function visit104_138_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['136'][1].init(186, 17, 'i < origin.length');
function visit103_136_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['133'][1].init(92, 18, 'origin.length == 1');
function visit102_133_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['131'][1].init(19, 19, 'origin || \'50% 50%\'');
function visit101_131_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['98'][1].init(2586, 9, 'matrixVal');
function visit100_98_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['87'][1].init(129, 36, 'currentStyle && !currentStyle.filter');
function visit99_87_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['85'][1].init(48, 166, '!matrixVal || currentStyle && !currentStyle.filter');
function visit98_85_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['79'][1].init(1612, 50, '!matrixVal && !S.trim(filter.replace(rMatrix, \'\'))');
function visit97_79_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['77'][3].init(1569, 22, 'elemStyle.filter || ""');
function visit96_77_3(result) {
  _$jscoverage['/ie/transform.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['77'][2].init(1530, 35, 'currentStyle && currentStyle.filter');
function visit95_77_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['77'][1].init(1530, 61, 'currentStyle && currentStyle.filter || elemStyle.filter || ""');
function visit94_77_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['56'][1].init(585, 5, 'value');
function visit93_56_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['23'][2].init(385, 28, 'dys[0].toLowerCase() == \'dy\'');
function visit92_23_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['23'][1].init(378, 35, 'dys && dys[0].toLowerCase() == \'dy\'');
function visit91_23_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['20'][2].init(260, 28, 'dxs[0].toLowerCase() == \'dx\'');
function visit90_20_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['20'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['20'][1].init(253, 35, 'dxs && dxs[0].toLowerCase() == \'dx\'');
function visit89_20_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['19'][1].init(197, 33, 'matrix[5] && matrix[5].split("=")');
function visit88_19_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['18'][1].init(135, 33, 'matrix[4] && matrix[4].split("=")');
function visit87_18_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['14'][1].init(115, 43, 'elemStyle && rMatrix.test(elemStyle.filter)');
function visit86_14_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].lineData[6]++;
KISSY.add('dom/ie/transform', function(S, Dom) {
  _$jscoverage['/ie/transform.js'].functionData[0]++;
  _$jscoverage['/ie/transform.js'].lineData[7]++;
  var cssHooks = Dom._cssHooks;
  _$jscoverage['/ie/transform.js'].lineData[8]++;
  var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;
  _$jscoverage['/ie/transform.js'].lineData[10]++;
  cssHooks.transform = {
  get: function(elem, computed) {
  _$jscoverage['/ie/transform.js'].functionData[1]++;
  _$jscoverage['/ie/transform.js'].lineData[12]++;
  var elemStyle = elem[computed ? 'currentStyle' : 'style'], matrix;
  _$jscoverage['/ie/transform.js'].lineData[14]++;
  if (visit86_14_1(elemStyle && rMatrix.test(elemStyle.filter))) {
    _$jscoverage['/ie/transform.js'].lineData[15]++;
    matrix = RegExp.$1.split(",");
    _$jscoverage['/ie/transform.js'].lineData[16]++;
    var dx = 0, dy = 0;
    _$jscoverage['/ie/transform.js'].lineData[18]++;
    var dxs = visit87_18_1(matrix[4] && matrix[4].split("="));
    _$jscoverage['/ie/transform.js'].lineData[19]++;
    var dys = visit88_19_1(matrix[5] && matrix[5].split("="));
    _$jscoverage['/ie/transform.js'].lineData[20]++;
    if (visit89_20_1(dxs && visit90_20_2(dxs[0].toLowerCase() == 'dx'))) {
      _$jscoverage['/ie/transform.js'].lineData[21]++;
      dx = parseFloat(dxs[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[23]++;
    if (visit91_23_1(dys && visit92_23_2(dys[0].toLowerCase() == 'dy'))) {
      _$jscoverage['/ie/transform.js'].lineData[24]++;
      dy = parseFloat(dys[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[26]++;
    matrix = [matrix[0].split("=")[1], matrix[2].split("=")[1], matrix[1].split("=")[1], matrix[3].split("=")[1], dx, dy];
  } else {
    _$jscoverage['/ie/transform.js'].lineData[35]++;
    return computed ? 'none' : '';
  }
  _$jscoverage['/ie/transform.js'].lineData[37]++;
  return 'matrix(' + matrix.join(',') + ')';
}, 
  set: function(elem, value) {
  _$jscoverage['/ie/transform.js'].functionData[2]++;
  _$jscoverage['/ie/transform.js'].lineData[41]++;
  var elemStyle = elem.style, currentStyle = elem.currentStyle, matrixVal, region = {
  width: elem.clientWidth, 
  height: elem.clientHeight}, center = {
  x: region.width / 2, 
  y: region.height / 2}, origin = parseOrigin(elem.style['transformOrigin'], region), filter;
  _$jscoverage['/ie/transform.js'].lineData[55]++;
  elemStyle.zoom = 1;
  _$jscoverage['/ie/transform.js'].lineData[56]++;
  if (visit93_56_1(value)) {
    _$jscoverage['/ie/transform.js'].lineData[57]++;
    value = matrix(value);
    _$jscoverage['/ie/transform.js'].lineData[58]++;
    var afterCenter = getCenterByOrigin(value, origin, center);
    _$jscoverage['/ie/transform.js'].lineData[59]++;
    afterCenter.x = afterCenter[0][0];
    _$jscoverage['/ie/transform.js'].lineData[60]++;
    afterCenter.y = afterCenter[1][0];
    _$jscoverage['/ie/transform.js'].lineData[61]++;
    matrixVal = ["progid:DXImageTransform.Microsoft.Matrix(" + "M11=" + value[0][0], "M12=" + value[0][1], "M21=" + value[1][0], "M22=" + value[1][1], "Dx=" + value[0][2], "Dy=" + value[1][2], 'SizingMethod="auto expand"'].join(',') + ')';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[75]++;
    matrixVal = '';
  }
  _$jscoverage['/ie/transform.js'].lineData[77]++;
  filter = visit94_77_1(visit95_77_2(currentStyle && currentStyle.filter) || visit96_77_3(elemStyle.filter || ""));
  _$jscoverage['/ie/transform.js'].lineData[79]++;
  if (visit97_79_1(!matrixVal && !S.trim(filter.replace(rMatrix, '')))) {
    _$jscoverage['/ie/transform.js'].lineData[83]++;
    elemStyle.removeAttribute('filter');
    _$jscoverage['/ie/transform.js'].lineData[84]++;
    if (visit98_85_1(!matrixVal || visit99_87_1(currentStyle && !currentStyle.filter))) {
      _$jscoverage['/ie/transform.js'].lineData[88]++;
      return;
    }
  }
  _$jscoverage['/ie/transform.js'].lineData[94]++;
  elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, matrixVal) : filter + (filter ? ', ' : '') + matrixVal;
  _$jscoverage['/ie/transform.js'].lineData[98]++;
  if (visit100_98_1(matrixVal)) {
    _$jscoverage['/ie/transform.js'].lineData[99]++;
    var realCenter = {
  x: elem.offsetWidth / 2, 
  y: elem.offsetHeight / 2};
    _$jscoverage['/ie/transform.js'].lineData[103]++;
    elemStyle.marginLeft = afterCenter.x - realCenter.x + 'px';
    _$jscoverage['/ie/transform.js'].lineData[104]++;
    elemStyle.marginTop = afterCenter.y - realCenter.y + 'px';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[106]++;
    elemStyle.marginLeft = elemStyle.marginTop = 0;
  }
}};
  _$jscoverage['/ie/transform.js'].lineData[112]++;
  function getCenterByOrigin(m, origin, center) {
    _$jscoverage['/ie/transform.js'].functionData[3]++;
    _$jscoverage['/ie/transform.js'].lineData[113]++;
    var w = origin[0], h = origin[1];
    _$jscoverage['/ie/transform.js'].lineData[115]++;
    return multipleMatrix([[1, 0, w], [0, 1, h], [0, 0, 1]], m, [[1, 0, -w], [0, 1, -h], [0, 0, 1]], [[center.x], [center.y], [1]]);
  }
  _$jscoverage['/ie/transform.js'].lineData[130]++;
  function parseOrigin(origin, region) {
    _$jscoverage['/ie/transform.js'].functionData[4]++;
    _$jscoverage['/ie/transform.js'].lineData[131]++;
    origin = visit101_131_1(origin || '50% 50%');
    _$jscoverage['/ie/transform.js'].lineData[132]++;
    origin = origin.split(/\s+/);
    _$jscoverage['/ie/transform.js'].lineData[133]++;
    if (visit102_133_1(origin.length == 1)) {
      _$jscoverage['/ie/transform.js'].lineData[134]++;
      origin[1] = origin[0];
    }
    _$jscoverage['/ie/transform.js'].lineData[136]++;
    for (var i = 0; visit103_136_1(i < origin.length); i++) {
      _$jscoverage['/ie/transform.js'].lineData[137]++;
      var val = parseFloat(origin[i]);
      _$jscoverage['/ie/transform.js'].lineData[138]++;
      if (visit104_138_1(S.endsWith(origin[i], '%'))) {
        _$jscoverage['/ie/transform.js'].lineData[139]++;
        origin[i] = val * region[i ? 'height' : 'width'] / 100;
      } else {
        _$jscoverage['/ie/transform.js'].lineData[141]++;
        origin[i] = val;
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[144]++;
    return origin;
  }
  _$jscoverage['/ie/transform.js'].lineData[148]++;
  function matrix(transform) {
    _$jscoverage['/ie/transform.js'].functionData[5]++;
    _$jscoverage['/ie/transform.js'].lineData[149]++;
    transform = transform.split(")");
    _$jscoverage['/ie/transform.js'].lineData[150]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]), curr;
    _$jscoverage['/ie/transform.js'].lineData[158]++;
    while (visit105_158_1(++i < l)) {
      _$jscoverage['/ie/transform.js'].lineData[159]++;
      split = transform[i].split("(");
      _$jscoverage['/ie/transform.js'].lineData[160]++;
      prop = trim(split[0]);
      _$jscoverage['/ie/transform.js'].lineData[161]++;
      val = split[1];
      _$jscoverage['/ie/transform.js'].lineData[162]++;
      curr = [1, 0, 0, 1, 0, 0];
      _$jscoverage['/ie/transform.js'].lineData[163]++;
      switch (prop) {
        case "translateX":
          _$jscoverage['/ie/transform.js'].lineData[165]++;
          curr[4] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[166]++;
          break;
        case "translateY":
          _$jscoverage['/ie/transform.js'].lineData[169]++;
          curr[5] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[170]++;
          break;
        case 'translate':
          _$jscoverage['/ie/transform.js'].lineData[173]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[174]++;
          curr[4] = parseInt(val[0], 10);
          _$jscoverage['/ie/transform.js'].lineData[175]++;
          curr[5] = parseInt(visit106_175_1(val[1] || 0), 10);
          _$jscoverage['/ie/transform.js'].lineData[176]++;
          break;
        case 'rotate':
          _$jscoverage['/ie/transform.js'].lineData[179]++;
          val = toRadian(val);
          _$jscoverage['/ie/transform.js'].lineData[180]++;
          curr[0] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[181]++;
          curr[1] = Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[182]++;
          curr[2] = -Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[183]++;
          curr[3] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[184]++;
          break;
        case 'scaleX':
          _$jscoverage['/ie/transform.js'].lineData[187]++;
          curr[0] = +val;
          _$jscoverage['/ie/transform.js'].lineData[188]++;
          break;
        case 'scaleY':
          _$jscoverage['/ie/transform.js'].lineData[191]++;
          curr[3] = +val;
          _$jscoverage['/ie/transform.js'].lineData[192]++;
          break;
        case 'scale':
          _$jscoverage['/ie/transform.js'].lineData[195]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[196]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[197]++;
          curr[3] = visit107_197_1(val.length > 1) ? +val[1] : +val[0];
          _$jscoverage['/ie/transform.js'].lineData[198]++;
          break;
        case "skewX":
          _$jscoverage['/ie/transform.js'].lineData[201]++;
          curr[2] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[202]++;
          break;
        case "skewY":
          _$jscoverage['/ie/transform.js'].lineData[205]++;
          curr[1] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[206]++;
          break;
        case 'matrix':
          _$jscoverage['/ie/transform.js'].lineData[209]++;
          val = val.split(",");
          _$jscoverage['/ie/transform.js'].lineData[210]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[211]++;
          curr[1] = +val[1];
          _$jscoverage['/ie/transform.js'].lineData[212]++;
          curr[2] = +val[2];
          _$jscoverage['/ie/transform.js'].lineData[213]++;
          curr[3] = +val[3];
          _$jscoverage['/ie/transform.js'].lineData[214]++;
          curr[4] = parseInt(val[4], 10);
          _$jscoverage['/ie/transform.js'].lineData[215]++;
          curr[5] = parseInt(val[5], 10);
          _$jscoverage['/ie/transform.js'].lineData[216]++;
          break;
      }
      _$jscoverage['/ie/transform.js'].lineData[218]++;
      ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
    }
    _$jscoverage['/ie/transform.js'].lineData[221]++;
    return ret;
  }
  _$jscoverage['/ie/transform.js'].lineData[224]++;
  function cssMatrixToComputableMatrix(matrix) {
    _$jscoverage['/ie/transform.js'].functionData[6]++;
    _$jscoverage['/ie/transform.js'].lineData[225]++;
    return [[matrix[0], matrix[2], matrix[4]], [matrix[1], matrix[3], matrix[5]], [0, 0, 1]];
  }
  _$jscoverage['/ie/transform.js'].lineData[232]++;
  function setMatrix(m, x, y, v) {
    _$jscoverage['/ie/transform.js'].functionData[7]++;
    _$jscoverage['/ie/transform.js'].lineData[233]++;
    if (visit108_233_1(!m[x])) {
      _$jscoverage['/ie/transform.js'].lineData[234]++;
      m[x] = [];
    }
    _$jscoverage['/ie/transform.js'].lineData[236]++;
    m[x][y] = v;
  }
  _$jscoverage['/ie/transform.js'].lineData[239]++;
  function multipleMatrix(m1, m2) {
    _$jscoverage['/ie/transform.js'].functionData[8]++;
    _$jscoverage['/ie/transform.js'].lineData[241]++;
    if (visit109_241_1(arguments.length > 2)) {
      _$jscoverage['/ie/transform.js'].lineData[242]++;
      var ret = m1;
      _$jscoverage['/ie/transform.js'].lineData[243]++;
      for (var i = 1; visit110_243_1(i < arguments.length); i++) {
        _$jscoverage['/ie/transform.js'].lineData[244]++;
        ret = multipleMatrix(ret, arguments[i]);
      }
      _$jscoverage['/ie/transform.js'].lineData[246]++;
      return ret;
    }
    _$jscoverage['/ie/transform.js'].lineData[249]++;
    var m = [], r1 = m1.length, r2 = m2.length, c2 = m2[0].length;
    _$jscoverage['/ie/transform.js'].lineData[254]++;
    for (i = 0; visit111_254_1(i < r1); i++) {
      _$jscoverage['/ie/transform.js'].lineData[255]++;
      for (var k = 0; visit112_255_1(k < c2); k++) {
        _$jscoverage['/ie/transform.js'].lineData[256]++;
        var sum = 0;
        _$jscoverage['/ie/transform.js'].lineData[257]++;
        for (var j = 0; visit113_257_1(j < r2); j++) {
          _$jscoverage['/ie/transform.js'].lineData[258]++;
          sum += m1[i][j] * m2[j][k];
        }
        _$jscoverage['/ie/transform.js'].lineData[260]++;
        setMatrix(m, i, k, sum);
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[264]++;
    return m;
  }
  _$jscoverage['/ie/transform.js'].lineData[268]++;
  function toRadian(value) {
    _$jscoverage['/ie/transform.js'].functionData[9]++;
    _$jscoverage['/ie/transform.js'].lineData[269]++;
    return visit114_269_1(value.indexOf("deg") > -1) ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value);
  }
}, {
  requires: ['dom/base']});
