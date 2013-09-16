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
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[12] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[15] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[25] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[43] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[46] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[52] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[56] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[80] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[86] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[92] = 0;
  _$jscoverage['/runtime.js'].lineData[95] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[97] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[102] = 0;
  _$jscoverage['/runtime.js'].lineData[104] = 0;
  _$jscoverage['/runtime.js'].lineData[108] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[111] = 0;
  _$jscoverage['/runtime.js'].lineData[115] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[117] = 0;
  _$jscoverage['/runtime.js'].lineData[118] = 0;
  _$jscoverage['/runtime.js'].lineData[119] = 0;
  _$jscoverage['/runtime.js'].lineData[120] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[122] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[125] = 0;
  _$jscoverage['/runtime.js'].lineData[129] = 0;
  _$jscoverage['/runtime.js'].lineData[130] = 0;
  _$jscoverage['/runtime.js'].lineData[131] = 0;
  _$jscoverage['/runtime.js'].lineData[135] = 0;
  _$jscoverage['/runtime.js'].lineData[137] = 0;
  _$jscoverage['/runtime.js'].lineData[140] = 0;
  _$jscoverage['/runtime.js'].lineData[141] = 0;
  _$jscoverage['/runtime.js'].lineData[143] = 0;
  _$jscoverage['/runtime.js'].lineData[179] = 0;
  _$jscoverage['/runtime.js'].lineData[180] = 0;
  _$jscoverage['/runtime.js'].lineData[181] = 0;
  _$jscoverage['/runtime.js'].lineData[183] = 0;
  _$jscoverage['/runtime.js'].lineData[196] = 0;
  _$jscoverage['/runtime.js'].lineData[197] = 0;
  _$jscoverage['/runtime.js'].lineData[198] = 0;
  _$jscoverage['/runtime.js'].lineData[199] = 0;
  _$jscoverage['/runtime.js'].lineData[200] = 0;
  _$jscoverage['/runtime.js'].lineData[201] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[203] = 0;
  _$jscoverage['/runtime.js'].lineData[206] = 0;
  _$jscoverage['/runtime.js'].lineData[220] = 0;
  _$jscoverage['/runtime.js'].lineData[231] = 0;
  _$jscoverage['/runtime.js'].lineData[235] = 0;
  _$jscoverage['/runtime.js'].lineData[240] = 0;
  _$jscoverage['/runtime.js'].lineData[248] = 0;
  _$jscoverage['/runtime.js'].lineData[257] = 0;
  _$jscoverage['/runtime.js'].lineData[267] = 0;
  _$jscoverage['/runtime.js'].lineData[268] = 0;
  _$jscoverage['/runtime.js'].lineData[270] = 0;
  _$jscoverage['/runtime.js'].lineData[274] = 0;
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
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['13'] = [];
  _$jscoverage['/runtime.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['15'] = [];
  _$jscoverage['/runtime.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['24'] = [];
  _$jscoverage['/runtime.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['30'] = [];
  _$jscoverage['/runtime.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['36'] = [];
  _$jscoverage['/runtime.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['41'] = [];
  _$jscoverage['/runtime.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['44'] = [];
  _$jscoverage['/runtime.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['46'] = [];
  _$jscoverage['/runtime.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['50'] = [];
  _$jscoverage['/runtime.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['56'] = [];
  _$jscoverage['/runtime.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['58'] = [];
  _$jscoverage['/runtime.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['73'] = [];
  _$jscoverage['/runtime.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['74'] = [];
  _$jscoverage['/runtime.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['76'] = [];
  _$jscoverage['/runtime.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['83'] = [];
  _$jscoverage['/runtime.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['86'] = [];
  _$jscoverage['/runtime.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['101'] = [];
  _$jscoverage['/runtime.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['108'] = [];
  _$jscoverage['/runtime.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['111'] = [];
  _$jscoverage['/runtime.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['120'] = [];
  _$jscoverage['/runtime.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['130'] = [];
  _$jscoverage['/runtime.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['140'] = [];
  _$jscoverage['/runtime.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['143'] = [];
  _$jscoverage['/runtime.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['180'] = [];
  _$jscoverage['/runtime.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['202'] = [];
  _$jscoverage['/runtime.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['267'] = [];
  _$jscoverage['/runtime.js'].branchData['267'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['267'][1].init(18, 15, '!keepDataFormat');
function visit47_267_1(result) {
  _$jscoverage['/runtime.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['202'][1].init(221, 19, 'config.macros || {}');
function visit46_202_1(result) {
  _$jscoverage['/runtime.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['180'][1].init(72, 4, '!tpl');
function visit45_180_1(result) {
  _$jscoverage['/runtime.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['143'][1].init(1239, 13, 'escape && id0');
function visit44_143_1(result) {
  _$jscoverage['/runtime.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['140'][2].init(1144, 17, 'id0 === undefined');
function visit43_140_2(result) {
  _$jscoverage['/runtime.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['140'][1].init(1122, 39, '!preserveUndefined && id0 === undefined');
function visit42_140_1(result) {
  _$jscoverage['/runtime.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['130'][1].init(92, 14, 'tmp2 === false');
function visit41_130_1(result) {
  _$jscoverage['/runtime.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['120'][1].init(268, 8, 'command1');
function visit40_120_1(result) {
  _$jscoverage['/runtime.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['111'][1].init(111, 12, 'escaped && exp');
function visit39_111_1(result) {
  _$jscoverage['/runtime.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['108'][1].init(21, 15, 'exp === undefined');
function visit38_108_1(result) {
  _$jscoverage['/runtime.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['101'][1].init(1543, 17, 'ret === undefined');
function visit37_101_1(result) {
  _$jscoverage['/runtime.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['86'][1].init(589, 27, 'typeof property == \'object\'');
function visit36_86_1(result) {
  _$jscoverage['/runtime.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['83'][1].init(450, 19, 'S.isArray(property)');
function visit35_83_1(result) {
  _$jscoverage['/runtime.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['76'][1].init(97, 18, 'property === false');
function visit34_76_1(result) {
  _$jscoverage['/runtime.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['74'][1].init(26, 32, '!options.params && !options.hash');
function visit33_74_1(result) {
  _$jscoverage['/runtime.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['73'][1].init(241, 8, '!command');
function visit32_73_1(result) {
  _$jscoverage['/runtime.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['58'][1].init(99, 22, 'typeof v == \'function\'');
function visit31_58_1(result) {
  _$jscoverage['/runtime.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['56'][1].init(458, 5, 'valid');
function visit30_56_1(result) {
  _$jscoverage['/runtime.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['50'][2].init(191, 20, 'typeof v != \'object\'');
function visit29_50_2(result) {
  _$jscoverage['/runtime.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['50'][1].init(191, 33, 'typeof v != \'object\' || !(p in v)');
function visit28_50_1(result) {
  _$jscoverage['/runtime.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['46'][1].init(53, 12, 'p === \'this\'');
function visit27_46_1(result) {
  _$jscoverage['/runtime.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['44'][1].init(78, 7, 'i < len');
function visit26_44_1(result) {
  _$jscoverage['/runtime.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['41'][1].init(491, 6, 'j < sl');
function visit25_41_1(result) {
  _$jscoverage['/runtime.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['36'][1].init(369, 18, 'parts[0] == \'root\'');
function visit24_36_1(result) {
  _$jscoverage['/runtime.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['30'][1].init(56, 10, 'depth || 0');
function visit23_30_1(result) {
  _$jscoverage['/runtime.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['24'][1].init(61, 13, 'parts === \'.\'');
function visit22_24_1(result) {
  _$jscoverage['/runtime.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][1].init(52, 4, '!cmd');
function visit21_15_1(result) {
  _$jscoverage['/runtime.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['13'][1].init(126, 7, 'i < len');
function visit20_13_1(result) {
  _$jscoverage['/runtime.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add('xtemplate/runtime', function(S, commands, undefined) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var escapeHtml = S.escapeHtml;
  _$jscoverage['/runtime.js'].lineData[9]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[10]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[11]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[12]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[13]++;
    for (var i = 0; visit20_13_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[14]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[15]++;
      if (visit21_15_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[16]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[19]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[22]++;
  function getProperty(parts, scopes, depth) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[24]++;
    if (visit22_24_1(parts === '.')) {
      _$jscoverage['/runtime.js'].lineData[25]++;
      parts = 'this';
    }
    _$jscoverage['/runtime.js'].lineData[27]++;
    parts = parts.split('.');
    _$jscoverage['/runtime.js'].lineData[28]++;
    var len = parts.length, i, j = visit23_30_1(depth || 0), v, p, valid, sl = scopes.length;
    _$jscoverage['/runtime.js'].lineData[36]++;
    if (visit24_36_1(parts[0] == 'root')) {
      _$jscoverage['/runtime.js'].lineData[37]++;
      j = sl - 1;
      _$jscoverage['/runtime.js'].lineData[38]++;
      parts.shift();
      _$jscoverage['/runtime.js'].lineData[39]++;
      len--;
    }
    _$jscoverage['/runtime.js'].lineData[41]++;
    for (; visit25_41_1(j < sl); j++) {
      _$jscoverage['/runtime.js'].lineData[42]++;
      v = scopes[j];
      _$jscoverage['/runtime.js'].lineData[43]++;
      valid = 1;
      _$jscoverage['/runtime.js'].lineData[44]++;
      for (i = 0; visit26_44_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[45]++;
        p = parts[i];
        _$jscoverage['/runtime.js'].lineData[46]++;
        if (visit27_46_1(p === 'this')) {
          _$jscoverage['/runtime.js'].lineData[47]++;
          continue;
        } else {
          _$jscoverage['/runtime.js'].lineData[50]++;
          if (visit28_50_1(visit29_50_2(typeof v != 'object') || !(p in v))) {
            _$jscoverage['/runtime.js'].lineData[51]++;
            valid = 0;
            _$jscoverage['/runtime.js'].lineData[52]++;
            break;
          }
        }
        _$jscoverage['/runtime.js'].lineData[54]++;
        v = v[p];
      }
      _$jscoverage['/runtime.js'].lineData[56]++;
      if (visit30_56_1(valid)) {
        _$jscoverage['/runtime.js'].lineData[58]++;
        if (visit31_58_1(typeof v == 'function')) {
          _$jscoverage['/runtime.js'].lineData[59]++;
          v = v.call(scopes[0]);
        }
        _$jscoverage['/runtime.js'].lineData[61]++;
        return [v];
      }
    }
    _$jscoverage['/runtime.js'].lineData[64]++;
    return false;
  }
  _$jscoverage['/runtime.js'].lineData[67]++;
  var utils = {
  'runBlockCommand': function(engine, scopes, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[3]++;
  _$jscoverage['/runtime.js'].lineData[69]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[70]++;
  var logFn = S[config.silent ? 'log' : 'error'];
  _$jscoverage['/runtime.js'].lineData[71]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[72]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[73]++;
  if (visit32_73_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[74]++;
    if (visit33_74_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[75]++;
      var property = getProperty(name, scopes);
      _$jscoverage['/runtime.js'].lineData[76]++;
      if (visit34_76_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[77]++;
        logFn("can not find property: '" + name + "' at line " + line);
        _$jscoverage['/runtime.js'].lineData[78]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[80]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[82]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[83]++;
      if (visit35_83_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[84]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[86]++;
        if (visit36_86_1(typeof property == 'object')) {
          _$jscoverage['/runtime.js'].lineData[87]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[89]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[91]++;
      S.error("can not find command module: " + name + "' at line " + line);
      _$jscoverage['/runtime.js'].lineData[92]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[95]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[96]++;
  try {
    _$jscoverage['/runtime.js'].lineData[97]++;
    ret = command.call(engine, scopes, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[99]++;
  S.error(e.message + ": '" + name + "' at line " + line);
}
  _$jscoverage['/runtime.js'].lineData[101]++;
  if (visit37_101_1(ret === undefined)) {
    _$jscoverage['/runtime.js'].lineData[102]++;
    ret = '';
  }
  _$jscoverage['/runtime.js'].lineData[104]++;
  return ret;
}, 
  'getExpression': function(exp, escaped) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[108]++;
  if (visit38_108_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[109]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[111]++;
  return visit39_111_1(escaped && exp) ? escapeHtml(exp) : exp;
}, 
  'getPropertyOrRunCommand': function(engine, scopes, options, name, depth, line, escape, preserveUndefined) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[115]++;
  var id0;
  _$jscoverage['/runtime.js'].lineData[116]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[117]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[118]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[119]++;
  var logFn = S[config.silent ? 'log' : 'error'];
  _$jscoverage['/runtime.js'].lineData[120]++;
  if (visit40_120_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[121]++;
    try {
      _$jscoverage['/runtime.js'].lineData[122]++;
      id0 = command1.call(engine, scopes, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[124]++;
  S.error(e.message + ": '" + name + "' at line " + line);
  _$jscoverage['/runtime.js'].lineData[125]++;
  return '';
}
  } else {
    _$jscoverage['/runtime.js'].lineData[129]++;
    var tmp2 = getProperty(name, scopes, depth);
    _$jscoverage['/runtime.js'].lineData[130]++;
    if (visit41_130_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[131]++;
      logFn("can not find property: '" + name + "' at line " + line, "warn");
      _$jscoverage['/runtime.js'].lineData[135]++;
      return preserveUndefined ? undefined : '';
    } else {
      _$jscoverage['/runtime.js'].lineData[137]++;
      id0 = tmp2[0];
    }
  }
  _$jscoverage['/runtime.js'].lineData[140]++;
  if (visit42_140_1(!preserveUndefined && visit43_140_2(id0 === undefined))) {
    _$jscoverage['/runtime.js'].lineData[141]++;
    id0 = '';
  }
  _$jscoverage['/runtime.js'].lineData[143]++;
  return visit44_143_1(escape && id0) ? escapeHtml(id0) : id0;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[179]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[180]++;
  if (visit45_180_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[181]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[183]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[196]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[7]++;
    _$jscoverage['/runtime.js'].lineData[197]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[198]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[199]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[200]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[201]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[202]++;
    config.macros = visit46_202_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[203]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[206]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[220]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[231]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[235]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scopes, config) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[240]++;
  return new this.constructor(tpl, config).render(scopes, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[248]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[257]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data, keepDataFormat) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[267]++;
  if (visit47_267_1(!keepDataFormat)) {
    _$jscoverage['/runtime.js'].lineData[268]++;
    data = [data];
  }
  _$jscoverage['/runtime.js'].lineData[270]++;
  return this.tpl(data, S);
}};
  _$jscoverage['/runtime.js'].lineData[274]++;
  return XTemplateRuntime;
}, {
  requires: ['./runtime/commands']});
