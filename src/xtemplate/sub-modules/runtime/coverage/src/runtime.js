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
if (! _$jscoverage['/runtime.js']) {
  _$jscoverage['/runtime.js'] = {};
  _$jscoverage['/runtime.js'].lineData = [];
  _$jscoverage['/runtime.js'].lineData[6] = 0;
  _$jscoverage['/runtime.js'].lineData[7] = 0;
  _$jscoverage['/runtime.js'].lineData[9] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[12] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[26] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[43] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[46] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[52] = 0;
  _$jscoverage['/runtime.js'].lineData[53] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[55] = 0;
  _$jscoverage['/runtime.js'].lineData[56] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[60] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[81] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[85] = 0;
  _$jscoverage['/runtime.js'].lineData[86] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[90] = 0;
  _$jscoverage['/runtime.js'].lineData[92] = 0;
  _$jscoverage['/runtime.js'].lineData[94] = 0;
  _$jscoverage['/runtime.js'].lineData[95] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[98] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[103] = 0;
  _$jscoverage['/runtime.js'].lineData[104] = 0;
  _$jscoverage['/runtime.js'].lineData[107] = 0;
  _$jscoverage['/runtime.js'].lineData[108] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[111] = 0;
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[114] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[120] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[128] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[130] = 0;
  _$jscoverage['/runtime.js'].lineData[131] = 0;
  _$jscoverage['/runtime.js'].lineData[132] = 0;
  _$jscoverage['/runtime.js'].lineData[133] = 0;
  _$jscoverage['/runtime.js'].lineData[134] = 0;
  _$jscoverage['/runtime.js'].lineData[136] = 0;
  _$jscoverage['/runtime.js'].lineData[137] = 0;
  _$jscoverage['/runtime.js'].lineData[141] = 0;
  _$jscoverage['/runtime.js'].lineData[142] = 0;
  _$jscoverage['/runtime.js'].lineData[143] = 0;
  _$jscoverage['/runtime.js'].lineData[146] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[151] = 0;
  _$jscoverage['/runtime.js'].lineData[152] = 0;
  _$jscoverage['/runtime.js'].lineData[154] = 0;
  _$jscoverage['/runtime.js'].lineData[190] = 0;
  _$jscoverage['/runtime.js'].lineData[191] = 0;
  _$jscoverage['/runtime.js'].lineData[192] = 0;
  _$jscoverage['/runtime.js'].lineData[194] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[213] = 0;
  _$jscoverage['/runtime.js'].lineData[214] = 0;
  _$jscoverage['/runtime.js'].lineData[215] = 0;
  _$jscoverage['/runtime.js'].lineData[216] = 0;
  _$jscoverage['/runtime.js'].lineData[217] = 0;
  _$jscoverage['/runtime.js'].lineData[218] = 0;
  _$jscoverage['/runtime.js'].lineData[219] = 0;
  _$jscoverage['/runtime.js'].lineData[222] = 0;
  _$jscoverage['/runtime.js'].lineData[236] = 0;
  _$jscoverage['/runtime.js'].lineData[247] = 0;
  _$jscoverage['/runtime.js'].lineData[251] = 0;
  _$jscoverage['/runtime.js'].lineData[256] = 0;
  _$jscoverage['/runtime.js'].lineData[264] = 0;
  _$jscoverage['/runtime.js'].lineData[273] = 0;
  _$jscoverage['/runtime.js'].lineData[283] = 0;
  _$jscoverage['/runtime.js'].lineData[284] = 0;
  _$jscoverage['/runtime.js'].lineData[286] = 0;
  _$jscoverage['/runtime.js'].lineData[290] = 0;
}
if (! _$jscoverage['/runtime.js'].functionData) {
  _$jscoverage['/runtime.js'].functionData = [];
  _$jscoverage['/runtime.js'].functionData[0] = 0;
  _$jscoverage['/runtime.js'].functionData[1] = 0;
  _$jscoverage['/runtime.js'].functionData[2] = 0;
  _$jscoverage['/runtime.js'].functionData[3] = 0;
  _$jscoverage['/runtime.js'].functionData[4] = 0;
  _$jscoverage['/runtime.js'].functionData[5] = 0;
  _$jscoverage['/runtime.js'].functionData[6] = 0;
  _$jscoverage['/runtime.js'].functionData[7] = 0;
  _$jscoverage['/runtime.js'].functionData[8] = 0;
  _$jscoverage['/runtime.js'].functionData[9] = 0;
  _$jscoverage['/runtime.js'].functionData[10] = 0;
  _$jscoverage['/runtime.js'].functionData[11] = 0;
  _$jscoverage['/runtime.js'].functionData[12] = 0;
  _$jscoverage['/runtime.js'].functionData[13] = 0;
  _$jscoverage['/runtime.js'].functionData[14] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['20'] = [];
  _$jscoverage['/runtime.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['22'] = [];
  _$jscoverage['/runtime.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['31'] = [];
  _$jscoverage['/runtime.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['37'] = [];
  _$jscoverage['/runtime.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['43'] = [];
  _$jscoverage['/runtime.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['49'] = [];
  _$jscoverage['/runtime.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['52'] = [];
  _$jscoverage['/runtime.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['54'] = [];
  _$jscoverage['/runtime.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['59'] = [];
  _$jscoverage['/runtime.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['65'] = [];
  _$jscoverage['/runtime.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['67'] = [];
  _$jscoverage['/runtime.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['72'] = [];
  _$jscoverage['/runtime.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['85'] = [];
  _$jscoverage['/runtime.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['86'] = [];
  _$jscoverage['/runtime.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['88'] = [];
  _$jscoverage['/runtime.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['95'] = [];
  _$jscoverage['/runtime.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['98'] = [];
  _$jscoverage['/runtime.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['113'] = [];
  _$jscoverage['/runtime.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['120'] = [];
  _$jscoverage['/runtime.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['123'] = [];
  _$jscoverage['/runtime.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['132'] = [];
  _$jscoverage['/runtime.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['142'] = [];
  _$jscoverage['/runtime.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['151'] = [];
  _$jscoverage['/runtime.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['154'] = [];
  _$jscoverage['/runtime.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['191'] = [];
  _$jscoverage['/runtime.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['218'] = [];
  _$jscoverage['/runtime.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['283'] = [];
  _$jscoverage['/runtime.js'].branchData['283'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['283'][1].init(17, 15, '!keepDataFormat');
function visit48_283_1(result) {
  _$jscoverage['/runtime.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['218'][1].init(215, 19, 'config.macros || {}');
function visit47_218_1(result) {
  _$jscoverage['/runtime.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['191'][1].init(70, 4, '!tpl');
function visit46_191_1(result) {
  _$jscoverage['/runtime.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['154'][1].init(1178, 13, 'escape && id0');
function visit45_154_1(result) {
  _$jscoverage['/runtime.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['151'][2].init(1086, 17, 'id0 === undefined');
function visit44_151_2(result) {
  _$jscoverage['/runtime.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['151'][1].init(1064, 39, '!preserveUndefined && id0 === undefined');
function visit43_151_1(result) {
  _$jscoverage['/runtime.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['142'][1].init(90, 14, 'tmp2 === false');
function visit42_142_1(result) {
  _$jscoverage['/runtime.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['132'][1].init(258, 8, 'command1');
function visit41_132_1(result) {
  _$jscoverage['/runtime.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['123'][1].init(113, 14, 'escaped && exp');
function visit40_123_1(result) {
  _$jscoverage['/runtime.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['120'][1].init(21, 17, 'exp === undefined');
function visit39_120_1(result) {
  _$jscoverage['/runtime.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['113'][1].init(1507, 17, 'ret === undefined');
function visit38_113_1(result) {
  _$jscoverage['/runtime.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['98'][1].init(577, 28, 'typeof property === \'object\'');
function visit37_98_1(result) {
  _$jscoverage['/runtime.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['95'][1].init(441, 19, 'S.isArray(property)');
function visit36_95_1(result) {
  _$jscoverage['/runtime.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['88'][1].init(95, 18, 'property === false');
function visit35_88_1(result) {
  _$jscoverage['/runtime.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['86'][1].init(25, 32, '!options.params && !options.hash');
function visit34_86_1(result) {
  _$jscoverage['/runtime.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['85'][1].init(232, 8, '!command');
function visit33_85_1(result) {
  _$jscoverage['/runtime.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['72'][1].init(733, 12, 'endScopeFind');
function visit32_72_1(result) {
  _$jscoverage['/runtime.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(97, 23, 'typeof v === \'function\'');
function visit31_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['65'][1].init(482, 5, 'valid');
function visit30_65_1(result) {
  _$jscoverage['/runtime.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['59'][2].init(223, 21, 'typeof v !== \'object\'');
function visit29_59_2(result) {
  _$jscoverage['/runtime.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['59'][1].init(223, 34, 'typeof v !== \'object\' || !(p in v)');
function visit28_59_1(result) {
  _$jscoverage['/runtime.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['54'][1].init(51, 12, 'p === \'this\'');
function visit27_54_1(result) {
  _$jscoverage['/runtime.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['52'][1].init(75, 7, 'i < len');
function visit26_52_1(result) {
  _$jscoverage['/runtime.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['49'][1].init(503, 6, 'j < sl');
function visit25_49_1(result) {
  _$jscoverage['/runtime.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['43'][1].init(355, 19, 'parts[0] === \'root\'');
function visit24_43_1(result) {
  _$jscoverage['/runtime.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][1].init(54, 10, 'depth || 0');
function visit23_37_1(result) {
  _$jscoverage['/runtime.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['31'][1].init(59, 13, 'parts === \'.\'');
function visit22_31_1(result) {
  _$jscoverage['/runtime.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['22'][1].init(50, 4, '!cmd');
function visit21_22_1(result) {
  _$jscoverage['/runtime.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][1].init(122, 7, 'i < len');
function visit20_20_1(result) {
  _$jscoverage['/runtime.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var commands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[9]++;
  var escapeHtml = S.escapeHtml;
  _$jscoverage['/runtime.js'].lineData[10]++;
  var logger = S.getLogger('s/xtemplate');
  _$jscoverage['/runtime.js'].lineData[12]++;
  function info(s) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[13]++;
    logger.info(s);
  }
  _$jscoverage['/runtime.js'].lineData[16]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[17]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[18]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[19]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[20]++;
    for (var i = 0; visit20_20_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[21]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[22]++;
      if (visit21_22_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[23]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[26]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[29]++;
  function getProperty(parts, scopes, depth) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[31]++;
    if (visit22_31_1(parts === '.')) {
      _$jscoverage['/runtime.js'].lineData[32]++;
      parts = 'this';
    }
    _$jscoverage['/runtime.js'].lineData[34]++;
    parts = parts.split('.');
    _$jscoverage['/runtime.js'].lineData[35]++;
    var len = parts.length, i, j = visit23_37_1(depth || 0), v, p, valid, sl = scopes.length;
    _$jscoverage['/runtime.js'].lineData[43]++;
    if (visit24_43_1(parts[0] === 'root')) {
      _$jscoverage['/runtime.js'].lineData[44]++;
      j = sl - 1;
      _$jscoverage['/runtime.js'].lineData[45]++;
      parts.shift();
      _$jscoverage['/runtime.js'].lineData[46]++;
      len--;
    }
    _$jscoverage['/runtime.js'].lineData[48]++;
    var endScopeFind = 0;
    _$jscoverage['/runtime.js'].lineData[49]++;
    for (; visit25_49_1(j < sl); j++) {
      _$jscoverage['/runtime.js'].lineData[50]++;
      v = scopes[j];
      _$jscoverage['/runtime.js'].lineData[51]++;
      valid = 1;
      _$jscoverage['/runtime.js'].lineData[52]++;
      for (i = 0; visit26_52_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[53]++;
        p = parts[i];
        _$jscoverage['/runtime.js'].lineData[54]++;
        if (visit27_54_1(p === 'this')) {
          _$jscoverage['/runtime.js'].lineData[55]++;
          endScopeFind = 1;
          _$jscoverage['/runtime.js'].lineData[56]++;
          continue;
        } else {
          _$jscoverage['/runtime.js'].lineData[59]++;
          if (visit28_59_1(visit29_59_2(typeof v !== 'object') || !(p in v))) {
            _$jscoverage['/runtime.js'].lineData[60]++;
            valid = 0;
            _$jscoverage['/runtime.js'].lineData[61]++;
            break;
          }
        }
        _$jscoverage['/runtime.js'].lineData[63]++;
        v = v[p];
      }
      _$jscoverage['/runtime.js'].lineData[65]++;
      if (visit30_65_1(valid)) {
        _$jscoverage['/runtime.js'].lineData[67]++;
        if (visit31_67_1(typeof v === 'function')) {
          _$jscoverage['/runtime.js'].lineData[68]++;
          v = v.call(scopes[0]);
        }
        _$jscoverage['/runtime.js'].lineData[70]++;
        return [v];
      }
      _$jscoverage['/runtime.js'].lineData[72]++;
      if (visit32_72_1(endScopeFind)) {
        _$jscoverage['/runtime.js'].lineData[73]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[76]++;
    return false;
  }
  _$jscoverage['/runtime.js'].lineData[79]++;
  var utils = {
  'runBlockCommand': function(engine, scopes, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[81]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[82]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[83]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[84]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[85]++;
  if (visit33_85_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[86]++;
    if (visit34_86_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[87]++;
      var property = getProperty(name, scopes);
      _$jscoverage['/runtime.js'].lineData[88]++;
      if (visit35_88_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[89]++;
        logFn('can not find property: "' + name + '" at line ' + line);
        _$jscoverage['/runtime.js'].lineData[90]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[92]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[94]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[95]++;
      if (visit36_95_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[96]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[98]++;
        if (visit37_98_1(typeof property === 'object')) {
          _$jscoverage['/runtime.js'].lineData[99]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[101]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[103]++;
      S.error('can not find command module: ' + name + '" at line ' + line);
      _$jscoverage['/runtime.js'].lineData[104]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[107]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[108]++;
  try {
    _$jscoverage['/runtime.js'].lineData[109]++;
    ret = command.call(engine, scopes, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[111]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
}
  _$jscoverage['/runtime.js'].lineData[113]++;
  if (visit38_113_1(ret === undefined)) {
    _$jscoverage['/runtime.js'].lineData[114]++;
    ret = '';
  }
  _$jscoverage['/runtime.js'].lineData[116]++;
  return ret;
}, 
  'getExpression': function(exp, escaped) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[120]++;
  if (visit39_120_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[121]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[123]++;
  return visit40_123_1(escaped && exp) ? escapeHtml(exp) : exp;
}, 
  'getPropertyOrRunCommand': function(engine, scopes, options, name, depth, line, escape, preserveUndefined) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[127]++;
  var id0;
  _$jscoverage['/runtime.js'].lineData[128]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[129]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[130]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[131]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[132]++;
  if (visit41_132_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[133]++;
    try {
      _$jscoverage['/runtime.js'].lineData[134]++;
      id0 = command1.call(engine, scopes, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[136]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
  _$jscoverage['/runtime.js'].lineData[137]++;
  return '';
}
  } else {
    _$jscoverage['/runtime.js'].lineData[141]++;
    var tmp2 = getProperty(name, scopes, depth);
    _$jscoverage['/runtime.js'].lineData[142]++;
    if (visit42_142_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[143]++;
      logFn('can not find property: "' + name + '" at line ' + line, 'warn');
      _$jscoverage['/runtime.js'].lineData[146]++;
      return preserveUndefined ? undefined : '';
    } else {
      _$jscoverage['/runtime.js'].lineData[148]++;
      id0 = tmp2[0];
    }
  }
  _$jscoverage['/runtime.js'].lineData[151]++;
  if (visit43_151_1(!preserveUndefined && visit44_151_2(id0 === undefined))) {
    _$jscoverage['/runtime.js'].lineData[152]++;
    id0 = '';
  }
  _$jscoverage['/runtime.js'].lineData[154]++;
  return visit45_154_1(escape && id0) ? escapeHtml(id0) : id0;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[190]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[191]++;
  if (visit46_191_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[192]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[194]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[212]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[8]++;
    _$jscoverage['/runtime.js'].lineData[213]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[214]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[215]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[216]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[217]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[218]++;
    config.macros = visit47_218_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[219]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[222]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[236]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[247]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[251]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scopes, config) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[256]++;
  return new this.constructor(tpl, config).render(scopes, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[264]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[273]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data, keepDataFormat) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[283]++;
  if (visit48_283_1(!keepDataFormat)) {
    _$jscoverage['/runtime.js'].lineData[284]++;
    data = [data];
  }
  _$jscoverage['/runtime.js'].lineData[286]++;
  return this.tpl(data, S);
}};
  _$jscoverage['/runtime.js'].lineData[290]++;
  return XTemplateRuntime;
});
