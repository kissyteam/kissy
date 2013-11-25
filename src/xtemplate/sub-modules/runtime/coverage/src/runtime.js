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
  _$jscoverage['/runtime.js'].lineData[57] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[80] = 0;
  _$jscoverage['/runtime.js'].lineData[81] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[85] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[90] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[93] = 0;
  _$jscoverage['/runtime.js'].lineData[94] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[98] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[102] = 0;
  _$jscoverage['/runtime.js'].lineData[103] = 0;
  _$jscoverage['/runtime.js'].lineData[104] = 0;
  _$jscoverage['/runtime.js'].lineData[106] = 0;
  _$jscoverage['/runtime.js'].lineData[108] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[111] = 0;
  _$jscoverage['/runtime.js'].lineData[115] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[118] = 0;
  _$jscoverage['/runtime.js'].lineData[122] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[125] = 0;
  _$jscoverage['/runtime.js'].lineData[126] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[128] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[131] = 0;
  _$jscoverage['/runtime.js'].lineData[132] = 0;
  _$jscoverage['/runtime.js'].lineData[136] = 0;
  _$jscoverage['/runtime.js'].lineData[137] = 0;
  _$jscoverage['/runtime.js'].lineData[138] = 0;
  _$jscoverage['/runtime.js'].lineData[142] = 0;
  _$jscoverage['/runtime.js'].lineData[144] = 0;
  _$jscoverage['/runtime.js'].lineData[147] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[150] = 0;
  _$jscoverage['/runtime.js'].lineData[186] = 0;
  _$jscoverage['/runtime.js'].lineData[187] = 0;
  _$jscoverage['/runtime.js'].lineData[188] = 0;
  _$jscoverage['/runtime.js'].lineData[190] = 0;
  _$jscoverage['/runtime.js'].lineData[208] = 0;
  _$jscoverage['/runtime.js'].lineData[209] = 0;
  _$jscoverage['/runtime.js'].lineData[210] = 0;
  _$jscoverage['/runtime.js'].lineData[211] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[213] = 0;
  _$jscoverage['/runtime.js'].lineData[214] = 0;
  _$jscoverage['/runtime.js'].lineData[215] = 0;
  _$jscoverage['/runtime.js'].lineData[218] = 0;
  _$jscoverage['/runtime.js'].lineData[232] = 0;
  _$jscoverage['/runtime.js'].lineData[243] = 0;
  _$jscoverage['/runtime.js'].lineData[247] = 0;
  _$jscoverage['/runtime.js'].lineData[252] = 0;
  _$jscoverage['/runtime.js'].lineData[260] = 0;
  _$jscoverage['/runtime.js'].lineData[269] = 0;
  _$jscoverage['/runtime.js'].lineData[279] = 0;
  _$jscoverage['/runtime.js'].lineData[280] = 0;
  _$jscoverage['/runtime.js'].lineData[282] = 0;
  _$jscoverage['/runtime.js'].lineData[286] = 0;
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
  _$jscoverage['/runtime.js'].branchData['48'] = [];
  _$jscoverage['/runtime.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['51'] = [];
  _$jscoverage['/runtime.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['53'] = [];
  _$jscoverage['/runtime.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['57'] = [];
  _$jscoverage['/runtime.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['63'] = [];
  _$jscoverage['/runtime.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['65'] = [];
  _$jscoverage['/runtime.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['80'] = [];
  _$jscoverage['/runtime.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['81'] = [];
  _$jscoverage['/runtime.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['83'] = [];
  _$jscoverage['/runtime.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['90'] = [];
  _$jscoverage['/runtime.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['93'] = [];
  _$jscoverage['/runtime.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['108'] = [];
  _$jscoverage['/runtime.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['115'] = [];
  _$jscoverage['/runtime.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['118'] = [];
  _$jscoverage['/runtime.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['127'] = [];
  _$jscoverage['/runtime.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['137'] = [];
  _$jscoverage['/runtime.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['147'] = [];
  _$jscoverage['/runtime.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['150'] = [];
  _$jscoverage['/runtime.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['187'] = [];
  _$jscoverage['/runtime.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['214'] = [];
  _$jscoverage['/runtime.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['279'] = [];
  _$jscoverage['/runtime.js'].branchData['279'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['279'][1].init(17, 15, '!keepDataFormat');
function visit47_279_1(result) {
  _$jscoverage['/runtime.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['214'][1].init(215, 19, 'config.macros || {}');
function visit46_214_1(result) {
  _$jscoverage['/runtime.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['187'][1].init(70, 4, '!tpl');
function visit45_187_1(result) {
  _$jscoverage['/runtime.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['150'][1].init(1206, 13, 'escape && id0');
function visit44_150_1(result) {
  _$jscoverage['/runtime.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['147'][2].init(1114, 17, 'id0 === undefined');
function visit43_147_2(result) {
  _$jscoverage['/runtime.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['147'][1].init(1092, 39, '!preserveUndefined && id0 === undefined');
function visit42_147_1(result) {
  _$jscoverage['/runtime.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['137'][1].init(90, 14, 'tmp2 === false');
function visit41_137_1(result) {
  _$jscoverage['/runtime.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['127'][1].init(258, 8, 'command1');
function visit40_127_1(result) {
  _$jscoverage['/runtime.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['118'][1].init(113, 14, 'escaped && exp');
function visit39_118_1(result) {
  _$jscoverage['/runtime.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['115'][1].init(21, 17, 'exp === undefined');
function visit38_115_1(result) {
  _$jscoverage['/runtime.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['108'][1].init(1506, 17, 'ret === undefined');
function visit37_108_1(result) {
  _$jscoverage['/runtime.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['93'][1].init(577, 27, 'typeof property == \'object\'');
function visit36_93_1(result) {
  _$jscoverage['/runtime.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['90'][1].init(441, 19, 'S.isArray(property)');
function visit35_90_1(result) {
  _$jscoverage['/runtime.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['83'][1].init(95, 18, 'property === false');
function visit34_83_1(result) {
  _$jscoverage['/runtime.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['81'][1].init(25, 32, '!options.params && !options.hash');
function visit33_81_1(result) {
  _$jscoverage['/runtime.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['80'][1].init(232, 8, '!command');
function visit32_80_1(result) {
  _$jscoverage['/runtime.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['65'][1].init(97, 22, 'typeof v == \'function\'');
function visit31_65_1(result) {
  _$jscoverage['/runtime.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['63'][1].init(443, 5, 'valid');
function visit30_63_1(result) {
  _$jscoverage['/runtime.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][2].init(185, 20, 'typeof v != \'object\'');
function visit29_57_2(result) {
  _$jscoverage['/runtime.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][1].init(185, 33, 'typeof v != \'object\' || !(p in v)');
function visit28_57_1(result) {
  _$jscoverage['/runtime.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['53'][1].init(51, 12, 'p === \'this\'');
function visit27_53_1(result) {
  _$jscoverage['/runtime.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['51'][1].init(75, 7, 'i < len');
function visit26_51_1(result) {
  _$jscoverage['/runtime.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['48'][1].init(472, 6, 'j < sl');
function visit25_48_1(result) {
  _$jscoverage['/runtime.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['43'][1].init(355, 18, 'parts[0] == \'root\'');
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
    if (visit24_43_1(parts[0] == 'root')) {
      _$jscoverage['/runtime.js'].lineData[44]++;
      j = sl - 1;
      _$jscoverage['/runtime.js'].lineData[45]++;
      parts.shift();
      _$jscoverage['/runtime.js'].lineData[46]++;
      len--;
    }
    _$jscoverage['/runtime.js'].lineData[48]++;
    for (; visit25_48_1(j < sl); j++) {
      _$jscoverage['/runtime.js'].lineData[49]++;
      v = scopes[j];
      _$jscoverage['/runtime.js'].lineData[50]++;
      valid = 1;
      _$jscoverage['/runtime.js'].lineData[51]++;
      for (i = 0; visit26_51_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[52]++;
        p = parts[i];
        _$jscoverage['/runtime.js'].lineData[53]++;
        if (visit27_53_1(p === 'this')) {
          _$jscoverage['/runtime.js'].lineData[54]++;
          continue;
        } else {
          _$jscoverage['/runtime.js'].lineData[57]++;
          if (visit28_57_1(visit29_57_2(typeof v != 'object') || !(p in v))) {
            _$jscoverage['/runtime.js'].lineData[58]++;
            valid = 0;
            _$jscoverage['/runtime.js'].lineData[59]++;
            break;
          }
        }
        _$jscoverage['/runtime.js'].lineData[61]++;
        v = v[p];
      }
      _$jscoverage['/runtime.js'].lineData[63]++;
      if (visit30_63_1(valid)) {
        _$jscoverage['/runtime.js'].lineData[65]++;
        if (visit31_65_1(typeof v == 'function')) {
          _$jscoverage['/runtime.js'].lineData[66]++;
          v = v.call(scopes[0]);
        }
        _$jscoverage['/runtime.js'].lineData[68]++;
        return [v];
      }
    }
    _$jscoverage['/runtime.js'].lineData[71]++;
    return false;
  }
  _$jscoverage['/runtime.js'].lineData[74]++;
  var utils = {
  'runBlockCommand': function(engine, scopes, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[76]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[77]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[78]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[79]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[80]++;
  if (visit32_80_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[81]++;
    if (visit33_81_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[82]++;
      var property = getProperty(name, scopes);
      _$jscoverage['/runtime.js'].lineData[83]++;
      if (visit34_83_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[84]++;
        logFn("can not find property: '" + name + "' at line " + line);
        _$jscoverage['/runtime.js'].lineData[85]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[87]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[89]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[90]++;
      if (visit35_90_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[91]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[93]++;
        if (visit36_93_1(typeof property == 'object')) {
          _$jscoverage['/runtime.js'].lineData[94]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[96]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[98]++;
      S.error("can not find command module: " + name + "' at line " + line);
      _$jscoverage['/runtime.js'].lineData[99]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[102]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[103]++;
  try {
    _$jscoverage['/runtime.js'].lineData[104]++;
    ret = command.call(engine, scopes, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[106]++;
  S.error(e.message + ": '" + name + "' at line " + line);
}
  _$jscoverage['/runtime.js'].lineData[108]++;
  if (visit37_108_1(ret === undefined)) {
    _$jscoverage['/runtime.js'].lineData[109]++;
    ret = '';
  }
  _$jscoverage['/runtime.js'].lineData[111]++;
  return ret;
}, 
  'getExpression': function(exp, escaped) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[115]++;
  if (visit38_115_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[116]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[118]++;
  return visit39_118_1(escaped && exp) ? escapeHtml(exp) : exp;
}, 
  'getPropertyOrRunCommand': function(engine, scopes, options, name, depth, line, escape, preserveUndefined) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[122]++;
  var id0;
  _$jscoverage['/runtime.js'].lineData[123]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[124]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[125]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[126]++;
  var logFn = config.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[127]++;
  if (visit40_127_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[128]++;
    try {
      _$jscoverage['/runtime.js'].lineData[129]++;
      id0 = command1.call(engine, scopes, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[131]++;
  S.error(e.message + ": '" + name + "' at line " + line);
  _$jscoverage['/runtime.js'].lineData[132]++;
  return '';
}
  } else {
    _$jscoverage['/runtime.js'].lineData[136]++;
    var tmp2 = getProperty(name, scopes, depth);
    _$jscoverage['/runtime.js'].lineData[137]++;
    if (visit41_137_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[138]++;
      logFn("can not find property: '" + name + "' at line " + line, "warn");
      _$jscoverage['/runtime.js'].lineData[142]++;
      return preserveUndefined ? undefined : '';
    } else {
      _$jscoverage['/runtime.js'].lineData[144]++;
      id0 = tmp2[0];
    }
  }
  _$jscoverage['/runtime.js'].lineData[147]++;
  if (visit42_147_1(!preserveUndefined && visit43_147_2(id0 === undefined))) {
    _$jscoverage['/runtime.js'].lineData[148]++;
    id0 = '';
  }
  _$jscoverage['/runtime.js'].lineData[150]++;
  return visit44_150_1(escape && id0) ? escapeHtml(id0) : id0;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[186]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[187]++;
  if (visit45_187_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[188]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[190]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[208]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[8]++;
    _$jscoverage['/runtime.js'].lineData[209]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[210]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[211]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[212]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[213]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[214]++;
    config.macros = visit46_214_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[215]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[218]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[232]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[243]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[247]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scopes, config) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[252]++;
  return new this.constructor(tpl, config).render(scopes, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[260]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[269]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data, keepDataFormat) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[279]++;
  if (visit47_279_1(!keepDataFormat)) {
    _$jscoverage['/runtime.js'].lineData[280]++;
    data = [data];
  }
  _$jscoverage['/runtime.js'].lineData[282]++;
  return this.tpl(data, S);
}};
  _$jscoverage['/runtime.js'].lineData[286]++;
  return XTemplateRuntime;
});
