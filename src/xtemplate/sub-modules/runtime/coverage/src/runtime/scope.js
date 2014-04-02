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
if (! _$jscoverage['/runtime/scope.js']) {
  _$jscoverage['/runtime/scope.js'] = {};
  _$jscoverage['/runtime/scope.js'].lineData = [];
  _$jscoverage['/runtime/scope.js'].lineData[5] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[6] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[8] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[10] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[11] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[14] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[18] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[19] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[23] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[27] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[32] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[33] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[35] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[39] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[43] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[47] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[48] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[50] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[54] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[55] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[56] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[57] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[60] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[61] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[64] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[69] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[70] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[72] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[73] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[76] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[77] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[80] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[81] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[84] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[88] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[89] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[90] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[91] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[95] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[97] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[98] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[101] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[102] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[105] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[106] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[107] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[108] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[109] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[110] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[114] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[116] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[118] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[119] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[120] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[121] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[122] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[123] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[124] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[125] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[127] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[128] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[131] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[132] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[134] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[135] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[140] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[141] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[142] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[144] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[147] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[148] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[149] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[152] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[154] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[156] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[158] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[159] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[162] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[164] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[168] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].functionData) {
  _$jscoverage['/runtime/scope.js'].functionData = [];
  _$jscoverage['/runtime/scope.js'].functionData[0] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[1] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[2] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[3] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[4] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[5] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[6] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[7] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[8] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[9] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[10] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[11] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].branchData) {
  _$jscoverage['/runtime/scope.js'].branchData = {};
  _$jscoverage['/runtime/scope.js'].branchData['8'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['32'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['47'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['56'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['60'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['64'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['72'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['76'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['80'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['89'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['89'][4] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['90'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['97'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['105'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['108'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['109'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['121'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['123'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['127'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['128'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['140'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['140'][4] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['147'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['148'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['152'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['158'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['158'][1] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['158'][1].init(1563, 12, 'endScopeFind');
function visit65_158_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['152'][1].init(210, 23, 'typeof v === \'function\'');
function visit64_152_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['148'][1].init(26, 14, 'v && v.isScope');
function visit63_148_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['147'][1].init(1113, 5, 'valid');
function visit62_147_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['140'][4].init(146, 21, 'typeof v !== \'object\'');
function visit61_140_4(result) {
  _$jscoverage['/runtime/scope.js'].branchData['140'][4].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['140'][3].init(146, 34, 'typeof v !== \'object\' || !(p in v)');
function visit60_140_3(result) {
  _$jscoverage['/runtime/scope.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['140'][2].init(133, 9, 'v == null');
function visit59_140_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['140'][1].init(133, 47, 'v == null || typeof v !== \'object\' || !(p in v)');
function visit58_140_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['128'][1].init(30, 12, 'scope.has(p)');
function visit57_128_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['127'][1].init(203, 11, 'v === scope');
function visit56_127_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['123'][1].init(61, 12, 'p === \'this\'');
function visit55_123_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['121'][1].init(86, 7, 'i < len');
function visit54_121_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['109'][1].init(25, 16, 'scope && depth--');
function visit53_109_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['108'][1].init(617, 5, 'depth');
function visit52_108_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['105'][1].init(500, 19, 'parts[0] === \'root\'');
function visit51_105_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['97'][1].init(282, 24, 'typeof name === \'string\'');
function visit50_97_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['90'][1].init(22, 17, 'self.has(name[0])');
function visit49_90_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['89'][4].init(86, 17, 'name.length === 1');
function visit48_89_4(result) {
  _$jscoverage['/runtime/scope.js'].branchData['89'][4].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['89'][3].init(58, 24, 'typeof name !== \'string\'');
function visit47_89_3(result) {
  _$jscoverage['/runtime/scope.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['89'][2].init(58, 45, 'typeof name !== \'string\' && name.length === 1');
function visit46_89_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['89'][1].init(48, 55, '!depth && typeof name !== \'string\' && name.length === 1');
function visit45_89_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['80'][2].init(279, 24, 'typeof data === \'object\'');
function visit44_80_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['80'][1].init(279, 42, 'typeof data === \'object\' && (name in data)');
function visit43_80_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['76'][1].init(180, 24, 'affix && (name in affix)');
function visit42_76_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['72'][1].init(92, 15, 'name === \'this\'');
function visit41_72_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['64'][2].init(268, 24, 'typeof data === \'object\'');
function visit40_64_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['64'][1].init(268, 42, 'typeof data === \'object\' && (name in data)');
function visit39_64_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['60'][1].init(173, 24, 'affix && (name in affix)');
function visit38_60_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['56'][1].init(90, 15, 'name === \'this\'');
function visit37_56_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['47'][1].init(18, 11, '!this.affix');
function visit36_47_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['32'][1].init(18, 11, '!this.affix');
function visit35_32_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['8'][1].init(37, 10, 'data || {}');
function visit34_8_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[5]++;
KISSY.add(function(S) {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[6]++;
  function Scope(data, affix) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[8]++;
    this.data = visit34_8_1(data || {});
    _$jscoverage['/runtime/scope.js'].lineData[10]++;
    this.affix = affix;
    _$jscoverage['/runtime/scope.js'].lineData[11]++;
    this.root = this;
  }
  _$jscoverage['/runtime/scope.js'].lineData[14]++;
  Scope.prototype = {
  isScope: 1, 
  setParent: function(parentScope) {
  _$jscoverage['/runtime/scope.js'].functionData[2]++;
  _$jscoverage['/runtime/scope.js'].lineData[18]++;
  this.parent = parentScope;
  _$jscoverage['/runtime/scope.js'].lineData[19]++;
  this.root = parentScope.root;
}, 
  getParent: function() {
  _$jscoverage['/runtime/scope.js'].functionData[3]++;
  _$jscoverage['/runtime/scope.js'].lineData[23]++;
  return this.parent;
}, 
  getRoot: function() {
  _$jscoverage['/runtime/scope.js'].functionData[4]++;
  _$jscoverage['/runtime/scope.js'].lineData[27]++;
  return this.root;
}, 
  set: function(name, value) {
  _$jscoverage['/runtime/scope.js'].functionData[5]++;
  _$jscoverage['/runtime/scope.js'].lineData[32]++;
  if (visit35_32_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[33]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[35]++;
  this.affix[name] = value;
}, 
  setData: function(data) {
  _$jscoverage['/runtime/scope.js'].functionData[6]++;
  _$jscoverage['/runtime/scope.js'].lineData[39]++;
  this.data = data;
}, 
  getData: function() {
  _$jscoverage['/runtime/scope.js'].functionData[7]++;
  _$jscoverage['/runtime/scope.js'].lineData[43]++;
  return this.data;
}, 
  mix: function(v) {
  _$jscoverage['/runtime/scope.js'].functionData[8]++;
  _$jscoverage['/runtime/scope.js'].lineData[47]++;
  if (visit36_47_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[48]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[50]++;
  S.mix(this.affix, v);
}, 
  has: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[9]++;
  _$jscoverage['/runtime/scope.js'].lineData[54]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[55]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[56]++;
  if (visit37_56_1(name === 'this')) {
    _$jscoverage['/runtime/scope.js'].lineData[57]++;
    return true;
  }
  _$jscoverage['/runtime/scope.js'].lineData[60]++;
  if (visit38_60_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[61]++;
    return true;
  }
  _$jscoverage['/runtime/scope.js'].lineData[64]++;
  return visit39_64_1(visit40_64_2(typeof data === 'object') && (name in data));
}, 
  get: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[10]++;
  _$jscoverage['/runtime/scope.js'].lineData[69]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[70]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[72]++;
  if (visit41_72_1(name === 'this')) {
    _$jscoverage['/runtime/scope.js'].lineData[73]++;
    return this.data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[76]++;
  if (visit42_76_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[77]++;
    return affix[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[80]++;
  if (visit43_80_1(visit44_80_2(typeof data === 'object') && (name in data))) {
    _$jscoverage['/runtime/scope.js'].lineData[81]++;
    return data[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[84]++;
  return undefined;
}, 
  resolve: function(name, depth) {
  _$jscoverage['/runtime/scope.js'].functionData[11]++;
  _$jscoverage['/runtime/scope.js'].lineData[88]++;
  var self = this;
  _$jscoverage['/runtime/scope.js'].lineData[89]++;
  if (visit45_89_1(!depth && visit46_89_2(visit47_89_3(typeof name !== 'string') && visit48_89_4(name.length === 1)))) {
    _$jscoverage['/runtime/scope.js'].lineData[90]++;
    if (visit49_90_1(self.has(name[0]))) {
      _$jscoverage['/runtime/scope.js'].lineData[91]++;
      return self.get(name[0]);
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[95]++;
  var parts = name;
  _$jscoverage['/runtime/scope.js'].lineData[97]++;
  if (visit50_97_1(typeof name === 'string')) {
    _$jscoverage['/runtime/scope.js'].lineData[98]++;
    parts = name.split('.');
  }
  _$jscoverage['/runtime/scope.js'].lineData[101]++;
  var len, i, v, p, valid;
  _$jscoverage['/runtime/scope.js'].lineData[102]++;
  var scope = self;
  _$jscoverage['/runtime/scope.js'].lineData[105]++;
  if (visit51_105_1(parts[0] === 'root')) {
    _$jscoverage['/runtime/scope.js'].lineData[106]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[107]++;
    scope = scope.root;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[108]++;
    if (visit52_108_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[109]++;
      while (visit53_109_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[110]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[114]++;
  var endScopeFind = 0;
  _$jscoverage['/runtime/scope.js'].lineData[116]++;
  len = parts.length;
  _$jscoverage['/runtime/scope.js'].lineData[118]++;
  while (scope) {
    _$jscoverage['/runtime/scope.js'].lineData[119]++;
    valid = 1;
    _$jscoverage['/runtime/scope.js'].lineData[120]++;
    v = scope;
    _$jscoverage['/runtime/scope.js'].lineData[121]++;
    for (i = 0; visit54_121_1(i < len); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[122]++;
      p = parts[i];
      _$jscoverage['/runtime/scope.js'].lineData[123]++;
      if (visit55_123_1(p === 'this')) {
        _$jscoverage['/runtime/scope.js'].lineData[124]++;
        endScopeFind = 1;
        _$jscoverage['/runtime/scope.js'].lineData[125]++;
        continue;
      }
      _$jscoverage['/runtime/scope.js'].lineData[127]++;
      if (visit56_127_1(v === scope)) {
        _$jscoverage['/runtime/scope.js'].lineData[128]++;
        if (visit57_128_1(scope.has(p))) {
          _$jscoverage['/runtime/scope.js'].lineData[131]++;
          v = scope.get(p);
          _$jscoverage['/runtime/scope.js'].lineData[132]++;
          endScopeFind = 1;
        } else {
          _$jscoverage['/runtime/scope.js'].lineData[134]++;
          valid = 0;
          _$jscoverage['/runtime/scope.js'].lineData[135]++;
          break;
        }
      } else {
        _$jscoverage['/runtime/scope.js'].lineData[140]++;
        if (visit58_140_1(visit59_140_2(v == null) || visit60_140_3(visit61_140_4(typeof v !== 'object') || !(p in v)))) {
          _$jscoverage['/runtime/scope.js'].lineData[141]++;
          valid = 0;
          _$jscoverage['/runtime/scope.js'].lineData[142]++;
          break;
        }
        _$jscoverage['/runtime/scope.js'].lineData[144]++;
        v = v[p];
      }
    }
    _$jscoverage['/runtime/scope.js'].lineData[147]++;
    if (visit62_147_1(valid)) {
      _$jscoverage['/runtime/scope.js'].lineData[148]++;
      if (visit63_148_1(v && v.isScope)) {
        _$jscoverage['/runtime/scope.js'].lineData[149]++;
        v = v.data;
      }
      _$jscoverage['/runtime/scope.js'].lineData[152]++;
      if (visit64_152_1(typeof v === 'function')) {
        _$jscoverage['/runtime/scope.js'].lineData[154]++;
        v = v.call(this.data);
      }
      _$jscoverage['/runtime/scope.js'].lineData[156]++;
      return v;
    }
    _$jscoverage['/runtime/scope.js'].lineData[158]++;
    if (visit65_158_1(endScopeFind)) {
      _$jscoverage['/runtime/scope.js'].lineData[159]++;
      break;
    }
    _$jscoverage['/runtime/scope.js'].lineData[162]++;
    scope = scope.parent;
  }
  _$jscoverage['/runtime/scope.js'].lineData[164]++;
  return undefined;
}};
  _$jscoverage['/runtime/scope.js'].lineData[168]++;
  return Scope;
});
