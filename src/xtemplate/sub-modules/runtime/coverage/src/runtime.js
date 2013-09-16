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
  _$jscoverage['/runtime.js'].lineData[8] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[15] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[30] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[43] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[46] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[52] = 0;
  _$jscoverage['/runtime.js'].lineData[55] = 0;
  _$jscoverage['/runtime.js'].lineData[56] = 0;
  _$jscoverage['/runtime.js'].lineData[57] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[80] = 0;
  _$jscoverage['/runtime.js'].lineData[81] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[85] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[92] = 0;
  _$jscoverage['/runtime.js'].lineData[94] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[97] = 0;
  _$jscoverage['/runtime.js'].lineData[100] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[102] = 0;
  _$jscoverage['/runtime.js'].lineData[104] = 0;
  _$jscoverage['/runtime.js'].lineData[106] = 0;
  _$jscoverage['/runtime.js'].lineData[107] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[114] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[120] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[122] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[125] = 0;
  _$jscoverage['/runtime.js'].lineData[126] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[130] = 0;
  _$jscoverage['/runtime.js'].lineData[134] = 0;
  _$jscoverage['/runtime.js'].lineData[135] = 0;
  _$jscoverage['/runtime.js'].lineData[136] = 0;
  _$jscoverage['/runtime.js'].lineData[140] = 0;
  _$jscoverage['/runtime.js'].lineData[142] = 0;
  _$jscoverage['/runtime.js'].lineData[145] = 0;
  _$jscoverage['/runtime.js'].lineData[146] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[184] = 0;
  _$jscoverage['/runtime.js'].lineData[185] = 0;
  _$jscoverage['/runtime.js'].lineData[186] = 0;
  _$jscoverage['/runtime.js'].lineData[188] = 0;
  _$jscoverage['/runtime.js'].lineData[201] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[203] = 0;
  _$jscoverage['/runtime.js'].lineData[204] = 0;
  _$jscoverage['/runtime.js'].lineData[205] = 0;
  _$jscoverage['/runtime.js'].lineData[206] = 0;
  _$jscoverage['/runtime.js'].lineData[207] = 0;
  _$jscoverage['/runtime.js'].lineData[208] = 0;
  _$jscoverage['/runtime.js'].lineData[211] = 0;
  _$jscoverage['/runtime.js'].lineData[225] = 0;
  _$jscoverage['/runtime.js'].lineData[236] = 0;
  _$jscoverage['/runtime.js'].lineData[240] = 0;
  _$jscoverage['/runtime.js'].lineData[245] = 0;
  _$jscoverage['/runtime.js'].lineData[253] = 0;
  _$jscoverage['/runtime.js'].lineData[262] = 0;
  _$jscoverage['/runtime.js'].lineData[272] = 0;
  _$jscoverage['/runtime.js'].lineData[273] = 0;
  _$jscoverage['/runtime.js'].lineData[275] = 0;
  _$jscoverage['/runtime.js'].lineData[279] = 0;
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
  _$jscoverage['/runtime.js'].branchData['18'] = [];
  _$jscoverage['/runtime.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['20'] = [];
  _$jscoverage['/runtime.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['29'] = [];
  _$jscoverage['/runtime.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['35'] = [];
  _$jscoverage['/runtime.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['41'] = [];
  _$jscoverage['/runtime.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['46'] = [];
  _$jscoverage['/runtime.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['49'] = [];
  _$jscoverage['/runtime.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['51'] = [];
  _$jscoverage['/runtime.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['55'] = [];
  _$jscoverage['/runtime.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['61'] = [];
  _$jscoverage['/runtime.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['63'] = [];
  _$jscoverage['/runtime.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['78'] = [];
  _$jscoverage['/runtime.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['79'] = [];
  _$jscoverage['/runtime.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['81'] = [];
  _$jscoverage['/runtime.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['88'] = [];
  _$jscoverage['/runtime.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['91'] = [];
  _$jscoverage['/runtime.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['106'] = [];
  _$jscoverage['/runtime.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['113'] = [];
  _$jscoverage['/runtime.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['116'] = [];
  _$jscoverage['/runtime.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['125'] = [];
  _$jscoverage['/runtime.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['135'] = [];
  _$jscoverage['/runtime.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['145'] = [];
  _$jscoverage['/runtime.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['148'] = [];
  _$jscoverage['/runtime.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['185'] = [];
  _$jscoverage['/runtime.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['207'] = [];
  _$jscoverage['/runtime.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['272'] = [];
  _$jscoverage['/runtime.js'].branchData['272'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['272'][1].init(18, 15, '!keepDataFormat');
function visit47_272_1(result) {
  _$jscoverage['/runtime.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['207'][1].init(221, 19, 'config.macros || {}');
function visit46_207_1(result) {
  _$jscoverage['/runtime.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['185'][1].init(72, 4, '!tpl');
function visit45_185_1(result) {
  _$jscoverage['/runtime.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['148'][1].init(1235, 13, 'escape && id0');
function visit44_148_1(result) {
  _$jscoverage['/runtime.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['145'][2].init(1140, 17, 'id0 === undefined');
function visit43_145_2(result) {
  _$jscoverage['/runtime.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['145'][1].init(1118, 39, '!preserveUndefined && id0 === undefined');
function visit42_145_1(result) {
  _$jscoverage['/runtime.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['135'][1].init(92, 14, 'tmp2 === false');
function visit41_135_1(result) {
  _$jscoverage['/runtime.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['125'][1].init(264, 8, 'command1');
function visit40_125_1(result) {
  _$jscoverage['/runtime.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['116'][1].init(117, 14, 'escaped && exp');
function visit39_116_1(result) {
  _$jscoverage['/runtime.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['113'][1].init(22, 17, 'exp === undefined');
function visit38_113_1(result) {
  _$jscoverage['/runtime.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['106'][1].init(1539, 17, 'ret === undefined');
function visit37_106_1(result) {
  _$jscoverage['/runtime.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['91'][1].init(589, 27, 'typeof property == \'object\'');
function visit36_91_1(result) {
  _$jscoverage['/runtime.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['88'][1].init(450, 19, 'S.isArray(property)');
function visit35_88_1(result) {
  _$jscoverage['/runtime.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['81'][1].init(97, 18, 'property === false');
function visit34_81_1(result) {
  _$jscoverage['/runtime.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['79'][1].init(26, 32, '!options.params && !options.hash');
function visit33_79_1(result) {
  _$jscoverage['/runtime.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['78'][1].init(237, 8, '!command');
function visit32_78_1(result) {
  _$jscoverage['/runtime.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['63'][1].init(99, 22, 'typeof v == \'function\'');
function visit31_63_1(result) {
  _$jscoverage['/runtime.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['61'][1].init(458, 5, 'valid');
function visit30_61_1(result) {
  _$jscoverage['/runtime.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['55'][2].init(191, 20, 'typeof v != \'object\'');
function visit29_55_2(result) {
  _$jscoverage['/runtime.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['55'][1].init(191, 33, 'typeof v != \'object\' || !(p in v)');
function visit28_55_1(result) {
  _$jscoverage['/runtime.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['51'][1].init(53, 12, 'p === \'this\'');
function visit27_51_1(result) {
  _$jscoverage['/runtime.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['49'][1].init(78, 7, 'i < len');
function visit26_49_1(result) {
  _$jscoverage['/runtime.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['46'][1].init(491, 6, 'j < sl');
function visit25_46_1(result) {
  _$jscoverage['/runtime.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['41'][1].init(369, 18, 'parts[0] == \'root\'');
function visit24_41_1(result) {
  _$jscoverage['/runtime.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['35'][1].init(56, 10, 'depth || 0');
function visit23_35_1(result) {
  _$jscoverage['/runtime.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['29'][1].init(61, 13, 'parts === \'.\'');
function visit22_29_1(result) {
  _$jscoverage['/runtime.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][1].init(52, 4, '!cmd');
function visit21_20_1(result) {
  _$jscoverage['/runtime.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['18'][1].init(126, 7, 'i < len');
function visit20_18_1(result) {
  _$jscoverage['/runtime.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add('xtemplate/runtime', function(S, commands, undefined) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var escapeHtml = S.escapeHtml;
  _$jscoverage['/runtime.js'].lineData[8]++;
  var logger = S.getLogger('s/xtemplate');
  _$jscoverage['/runtime.js'].lineData[10]++;
  function info(s) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[11]++;
    logger.info(s);
  }
  _$jscoverage['/runtime.js'].lineData[14]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[15]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[16]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[17]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[18]++;
    for (var i = 0; visit20_18_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[19]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[20]++;
      if (visit21_20_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[21]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[24]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[27]++;
  function getProperty(parts, scopes, depth) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[29]++;
    if (visit22_29_1(parts === '.')) {
      _$jscoverage['/runtime.js'].lineData[30]++;
      parts = 'this';
    }
    _$jscoverage['/runtime.js'].lineData[32]++;
    parts = parts.split('.');
    _$jscoverage['/runtime.js'].lineData[33]++;
    var len = parts.length, i, j = visit23_35_1(depth || 0), v, p, valid, sl = scopes.length;
    _$jscoverage['/runtime.js'].lineData[41]++;
    if (visit24_41_1(parts[0] == 'root')) {
      _$jscoverage['/runtime.js'].lineData[42]++;
      j = sl - 1;
      _$jscoverage['/runtime.js'].lineData[43]++;
      parts.shift();
      _$jscoverage['/runtime.js'].lineData[44]++;
      len--;
    }
    _$jscoverage['/runtime.js'].lineData[46]++;
    for (; visit25_46_1(j < sl); j++) {
      _$jscoverage['/runtime.js'].lineData[47]++;
      v = scopes[j];
      _$jscoverage['/runtime.js'].lineData[48]++;
      valid = 1;
      _$jscoverage['/runtime.js'].lineData[49]++;
      for (i = 0; visit26_49_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[50]++;
        p = parts[i];
        _$jscoverage['/runtime.js'].lineData[51]++;
        if (visit27_51_1(p === 'this')) {
          _$jscoverage['/runtime.js'].lineData[52]++;
          continue;
        } else {
          _$jscoverage['/runtime.js'].lineData[55]++;
          if (visit28_55_1(visit29_55_2(typeof v != 'object') || !(p in v))) {
            _$jscoverage['/runtime.js'].lineData[56]++;
            valid = 0;
            _$jscoverage['/runtime.js'].lineData[57]++;
            break;
          }
        }
        _$jscoverage['/runtime.js'].lineData[59]++;
        v = v[p];
      }
      _$jscoverage['/runtime.js'].lineData[61]++;
      if (visit30_61_1(valid)) {
        _$jscoverage['/runtime.js'].lineData[63]++;
        if (visit31_63_1(typeof v == 'function')) {
          _$jscoverage['/runtime.js'].lineData[64]++;
          v = v.call(scopes[0]);
        }
        _$jscoverage['/runtime.js'].lineData[66]++;
        return [v];
      }
    }
    _$jscoverage['/runtime.js'].lineData[69]++;
    return false;
  }
  _$jscoverage['/runtime.js'].lineData[72]++;
  var utils = {
  'runBlockCommand': function(engine, scopes, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[74]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[75]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[76]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[77]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[78]++;
  if (visit32_78_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[79]++;
    if (visit33_79_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[80]++;
      var property = getProperty(name, scopes);
      _$jscoverage['/runtime.js'].lineData[81]++;
      if (visit34_81_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[82]++;
        logFn("can not find property: '" + name + "' at line " + line);
        _$jscoverage['/runtime.js'].lineData[83]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[85]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[87]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[88]++;
      if (visit35_88_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[89]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[91]++;
        if (visit36_91_1(typeof property == 'object')) {
          _$jscoverage['/runtime.js'].lineData[92]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[94]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[96]++;
      S.error("can not find command module: " + name + "' at line " + line);
      _$jscoverage['/runtime.js'].lineData[97]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[100]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[101]++;
  try {
    _$jscoverage['/runtime.js'].lineData[102]++;
    ret = command.call(engine, scopes, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[104]++;
  S.error(e.message + ": '" + name + "' at line " + line);
}
  _$jscoverage['/runtime.js'].lineData[106]++;
  if (visit37_106_1(ret === undefined)) {
    _$jscoverage['/runtime.js'].lineData[107]++;
    ret = '';
  }
  _$jscoverage['/runtime.js'].lineData[109]++;
  return ret;
}, 
  'getExpression': function(exp, escaped) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[113]++;
  if (visit38_113_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[114]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[116]++;
  return visit39_116_1(escaped && exp) ? escapeHtml(exp) : exp;
}, 
  'getPropertyOrRunCommand': function(engine, scopes, options, name, depth, line, escape, preserveUndefined) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[120]++;
  var id0;
  _$jscoverage['/runtime.js'].lineData[121]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[122]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[123]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[124]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[125]++;
  if (visit40_125_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[126]++;
    try {
      _$jscoverage['/runtime.js'].lineData[127]++;
      id0 = command1.call(engine, scopes, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[129]++;
  S.error(e.message + ": '" + name + "' at line " + line);
  _$jscoverage['/runtime.js'].lineData[130]++;
  return '';
}
  } else {
    _$jscoverage['/runtime.js'].lineData[134]++;
    var tmp2 = getProperty(name, scopes, depth);
    _$jscoverage['/runtime.js'].lineData[135]++;
    if (visit41_135_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[136]++;
      logFn("can not find property: '" + name + "' at line " + line, "warn");
      _$jscoverage['/runtime.js'].lineData[140]++;
      return preserveUndefined ? undefined : '';
    } else {
      _$jscoverage['/runtime.js'].lineData[142]++;
      id0 = tmp2[0];
    }
  }
  _$jscoverage['/runtime.js'].lineData[145]++;
  if (visit42_145_1(!preserveUndefined && visit43_145_2(id0 === undefined))) {
    _$jscoverage['/runtime.js'].lineData[146]++;
    id0 = '';
  }
  _$jscoverage['/runtime.js'].lineData[148]++;
  return visit44_148_1(escape && id0) ? escapeHtml(id0) : id0;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[184]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[185]++;
  if (visit45_185_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[186]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[188]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[201]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[8]++;
    _$jscoverage['/runtime.js'].lineData[202]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[203]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[204]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[205]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[206]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[207]++;
    config.macros = visit46_207_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[208]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[211]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[225]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[236]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[240]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scopes, config) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[245]++;
  return new this.constructor(tpl, config).render(scopes, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[253]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[262]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data, keepDataFormat) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[272]++;
  if (visit47_272_1(!keepDataFormat)) {
    _$jscoverage['/runtime.js'].lineData[273]++;
    data = [data];
  }
  _$jscoverage['/runtime.js'].lineData[275]++;
  return this.tpl(data, S);
}};
  _$jscoverage['/runtime.js'].lineData[279]++;
  return XTemplateRuntime;
}, {
  requires: ['./runtime/commands']});
