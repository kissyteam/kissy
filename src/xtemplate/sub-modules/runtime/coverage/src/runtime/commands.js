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
if (! _$jscoverage['/runtime/commands.js']) {
  _$jscoverage['/runtime/commands.js'] = {};
  _$jscoverage['/runtime/commands.js'].lineData = [];
  _$jscoverage['/runtime/commands.js'].lineData[6] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[7] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[8] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[10] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[11] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[12] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[13] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[14] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[15] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[17] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[18] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[29] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[35] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[38] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[41] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[44] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[48] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[49] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[52] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[68] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[74] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[75] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[82] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[85] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[92] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[97] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[99] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[108] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[116] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[119] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[127] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[135] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[137] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[139] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[142] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[151] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[153] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[154] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[160] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[161] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[163] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[164] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[167] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[170] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[172] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[174] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[179] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[183] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].functionData) {
  _$jscoverage['/runtime/commands.js'].functionData = [];
  _$jscoverage['/runtime/commands.js'].functionData[0] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[1] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[2] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[3] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[4] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[5] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[6] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[7] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[8] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[9] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['14'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['16'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['17'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['30'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['37'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['39'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['41'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['48'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['59'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['67'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['77'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['82'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['92'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['93'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['96'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['110'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['116'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['125'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['126'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['151'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['153'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['163'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['163'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['163'][1].init(107, 6, '!macro');
function visit23_163_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['153'][1].init(80, 18, '!macros[macroName]');
function visit22_153_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['151'][1].init(210, 9, 'config.fn');
function visit21_151_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['126'][1].init(21, 24, 'myName === \'unspecified\'');
function visit20_126_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['125'][1].init(501, 28, 'subTplName.charAt(0) === \'.\'');
function visit19_125_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['116'][1].init(239, 11, 'config.hash');
function visit18_116_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['110'][2].init(69, 19, 'params.length !== 1');
function visit17_110_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['110'][1].init(58, 30, '!params || params.length !== 1');
function visit16_110_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['96'][1].init(254, 14, 'config.inverse');
function visit15_96_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['93'][1].init(21, 9, 'config.fn');
function visit14_93_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['92'][1].init(122, 6, 'param0');
function visit13_92_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['82'][1].init(345, 14, 'config.inverse');
function visit12_82_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['77'][1].init(122, 6, 'param0');
function visit11_77_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['67'][1].init(1624, 14, 'config.inverse');
function visit10_67_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['59'][1].init(184, 9, 'valueName');
function visit9_59_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['48'][1].init(325, 9, 'valueName');
function visit8_48_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['41'][1].init(86, 15, 'xindex < xcount');
function visit7_41_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['39'][1].init(60, 17, 'S.isArray(param0)');
function visit6_39_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['37'][1].init(344, 6, 'param0');
function visit5_37_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['30'][1].init(106, 21, 'params[2] || \'xindex\'');
function visit4_30_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['17'][1].init(99, 16, 'subPart === \'..\'');
function visit3_17_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['16'][1].init(56, 15, 'subPart === \'.\'');
function visit2_16_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['14'][1].init(132, 19, 'i < subParts.length');
function visit1_14_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime/commands.js'].functionData[0]++;
  _$jscoverage['/runtime/commands.js'].lineData[7]++;
  var commands;
  _$jscoverage['/runtime/commands.js'].lineData[8]++;
  var Scope = require('./scope');
  _$jscoverage['/runtime/commands.js'].lineData[10]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime/commands.js'].functionData[1]++;
    _$jscoverage['/runtime/commands.js'].lineData[11]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime/commands.js'].lineData[12]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime/commands.js'].lineData[13]++;
    parts.pop();
    _$jscoverage['/runtime/commands.js'].lineData[14]++;
    for (var i = 0; visit1_14_1(i < subParts.length); i++) {
      _$jscoverage['/runtime/commands.js'].lineData[15]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime/commands.js'].lineData[16]++;
      if (visit2_16_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[17]++;
        if (visit3_17_1(subPart === '..')) {
          _$jscoverage['/runtime/commands.js'].lineData[18]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime/commands.js'].lineData[20]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime/commands.js'].lineData[23]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime/commands.js'].lineData[26]++;
  commands = {
  'each': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[28]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[29]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[30]++;
  var xindexName = visit4_30_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[31]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[32]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[33]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[34]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[35]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[37]++;
  if (visit5_37_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[38]++;
    opScope = new Scope();
    _$jscoverage['/runtime/commands.js'].lineData[39]++;
    if (visit6_39_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[40]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[41]++;
      for (var xindex = 0; visit7_41_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[43]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[44]++;
        affix = opScope.affix = {
  xcount: xcount};
        _$jscoverage['/runtime/commands.js'].lineData[47]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[48]++;
        if (visit8_48_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[49]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[51]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[52]++;
        buffer += config.fn(opScope);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[55]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[56]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[57]++;
        affix = opScope.affix = {};
        _$jscoverage['/runtime/commands.js'].lineData[58]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[59]++;
        if (visit9_59_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[60]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[62]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[63]++;
        buffer += config.fn(opScope);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[67]++;
    if (visit10_67_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[68]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[70]++;
  return buffer;
}, 
  'with': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[74]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[75]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[76]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[77]++;
  if (visit11_77_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[79]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[80]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[81]++;
    buffer = config.fn(opScope);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[82]++;
    if (visit12_82_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[83]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[85]++;
  return buffer;
}, 
  'if': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[89]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[90]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[91]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[92]++;
  if (visit13_92_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[93]++;
    if (visit14_93_1(config.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[94]++;
      buffer = config.fn(scope);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[96]++;
    if (visit15_96_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[97]++;
      buffer = config.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[99]++;
  return buffer;
}, 
  'set': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[103]++;
  scope.mix(config.hash);
  _$jscoverage['/runtime/commands.js'].lineData[104]++;
  return '';
}, 
  include: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[108]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[110]++;
  if (visit16_110_1(!params || visit17_110_2(params.length !== 1))) {
    _$jscoverage['/runtime/commands.js'].lineData[111]++;
    S.error('include must has one param');
    _$jscoverage['/runtime/commands.js'].lineData[112]++;
    return '';
  }
  _$jscoverage['/runtime/commands.js'].lineData[116]++;
  if (visit18_116_1(config.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[117]++;
    var newScope = new Scope(config.hash);
    _$jscoverage['/runtime/commands.js'].lineData[118]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[119]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[122]++;
  var myName = this.config.name;
  _$jscoverage['/runtime/commands.js'].lineData[123]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[125]++;
  if (visit19_125_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[126]++;
    if (visit20_126_1(myName === 'unspecified')) {
      _$jscoverage['/runtime/commands.js'].lineData[127]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[128]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[130]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[133]++;
  var tpl = this.config.loader.call(this, subTplName);
  _$jscoverage['/runtime/commands.js'].lineData[135]++;
  config = S.merge(this.config);
  _$jscoverage['/runtime/commands.js'].lineData[137]++;
  config.name = subTplName;
  _$jscoverage['/runtime/commands.js'].lineData[139]++;
  config.commands = this.config.commands;
  _$jscoverage['/runtime/commands.js'].lineData[141]++;
  config.macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[142]++;
  return this.invokeEngine(tpl, scope, config);
}, 
  'macro': function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[146]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[147]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[148]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[149]++;
  var macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[151]++;
  if (visit21_151_1(config.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[153]++;
    if (visit22_153_1(!macros[macroName])) {
      _$jscoverage['/runtime/commands.js'].lineData[154]++;
      macros[macroName] = {
  paramNames: params1, 
  fn: config.fn};
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[160]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[161]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[163]++;
    if (visit23_163_1(!macro)) {
      _$jscoverage['/runtime/commands.js'].lineData[164]++;
      S.error('can not find macro:' + name);
    }
    _$jscoverage['/runtime/commands.js'].lineData[167]++;
    S.each(macro.paramNames, function(p, i) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[168]++;
  paramValues[p] = params1[i];
});
    _$jscoverage['/runtime/commands.js'].lineData[170]++;
    var newScope = new Scope(paramValues);
    _$jscoverage['/runtime/commands.js'].lineData[172]++;
    return macro.fn.call(this, newScope);
  }
  _$jscoverage['/runtime/commands.js'].lineData[174]++;
  return '';
}, 
  parse: function(scope, config) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[179]++;
  return commands.include.call(this, new Scope(), config);
}};
  _$jscoverage['/runtime/commands.js'].lineData[183]++;
  return commands;
});
