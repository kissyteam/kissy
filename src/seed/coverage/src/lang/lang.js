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
if (! _$jscoverage['/lang/lang.js']) {
  _$jscoverage['/lang/lang.js'] = {};
  _$jscoverage['/lang/lang.js'].lineData = [];
  _$jscoverage['/lang/lang.js'].lineData[7] = 0;
  _$jscoverage['/lang/lang.js'].lineData[8] = 0;
  _$jscoverage['/lang/lang.js'].lineData[13] = 0;
  _$jscoverage['/lang/lang.js'].lineData[25] = 0;
  _$jscoverage['/lang/lang.js'].lineData[26] = 0;
  _$jscoverage['/lang/lang.js'].lineData[28] = 0;
  _$jscoverage['/lang/lang.js'].lineData[29] = 0;
  _$jscoverage['/lang/lang.js'].lineData[31] = 0;
  _$jscoverage['/lang/lang.js'].lineData[33] = 0;
  _$jscoverage['/lang/lang.js'].lineData[35] = 0;
  _$jscoverage['/lang/lang.js'].lineData[36] = 0;
  _$jscoverage['/lang/lang.js'].lineData[38] = 0;
  _$jscoverage['/lang/lang.js'].lineData[39] = 0;
  _$jscoverage['/lang/lang.js'].lineData[41] = 0;
  _$jscoverage['/lang/lang.js'].lineData[42] = 0;
  _$jscoverage['/lang/lang.js'].lineData[44] = 0;
  _$jscoverage['/lang/lang.js'].lineData[45] = 0;
  _$jscoverage['/lang/lang.js'].lineData[48] = 0;
  _$jscoverage['/lang/lang.js'].lineData[65] = 0;
  _$jscoverage['/lang/lang.js'].lineData[67] = 0;
  _$jscoverage['/lang/lang.js'].lineData[69] = 0;
  _$jscoverage['/lang/lang.js'].lineData[70] = 0;
  _$jscoverage['/lang/lang.js'].lineData[71] = 0;
  _$jscoverage['/lang/lang.js'].lineData[72] = 0;
  _$jscoverage['/lang/lang.js'].lineData[74] = 0;
  _$jscoverage['/lang/lang.js'].lineData[78] = 0;
  _$jscoverage['/lang/lang.js'].lineData[79] = 0;
  _$jscoverage['/lang/lang.js'].lineData[92] = 0;
  _$jscoverage['/lang/lang.js'].lineData[96] = 0;
  _$jscoverage['/lang/lang.js'].lineData[97] = 0;
  _$jscoverage['/lang/lang.js'].lineData[102] = 0;
  _$jscoverage['/lang/lang.js'].lineData[103] = 0;
  _$jscoverage['/lang/lang.js'].lineData[109] = 0;
  _$jscoverage['/lang/lang.js'].lineData[111] = 0;
  _$jscoverage['/lang/lang.js'].lineData[112] = 0;
  _$jscoverage['/lang/lang.js'].lineData[114] = 0;
  _$jscoverage['/lang/lang.js'].lineData[115] = 0;
  _$jscoverage['/lang/lang.js'].lineData[116] = 0;
  _$jscoverage['/lang/lang.js'].lineData[119] = 0;
  _$jscoverage['/lang/lang.js'].lineData[120] = 0;
  _$jscoverage['/lang/lang.js'].lineData[121] = 0;
  _$jscoverage['/lang/lang.js'].lineData[122] = 0;
  _$jscoverage['/lang/lang.js'].lineData[128] = 0;
  _$jscoverage['/lang/lang.js'].lineData[130] = 0;
  _$jscoverage['/lang/lang.js'].lineData[140] = 0;
  _$jscoverage['/lang/lang.js'].lineData[141] = 0;
  _$jscoverage['/lang/lang.js'].lineData[142] = 0;
  _$jscoverage['/lang/lang.js'].lineData[144] = 0;
  _$jscoverage['/lang/lang.js'].lineData[145] = 0;
  _$jscoverage['/lang/lang.js'].lineData[147] = 0;
  _$jscoverage['/lang/lang.js'].lineData[149] = 0;
  _$jscoverage['/lang/lang.js'].lineData[155] = 0;
  _$jscoverage['/lang/lang.js'].lineData[158] = 0;
  _$jscoverage['/lang/lang.js'].lineData[160] = 0;
  _$jscoverage['/lang/lang.js'].lineData[161] = 0;
  _$jscoverage['/lang/lang.js'].lineData[163] = 0;
  _$jscoverage['/lang/lang.js'].lineData[164] = 0;
  _$jscoverage['/lang/lang.js'].lineData[165] = 0;
  _$jscoverage['/lang/lang.js'].lineData[166] = 0;
  _$jscoverage['/lang/lang.js'].lineData[168] = 0;
  _$jscoverage['/lang/lang.js'].lineData[170] = 0;
  _$jscoverage['/lang/lang.js'].lineData[171] = 0;
  _$jscoverage['/lang/lang.js'].lineData[175] = 0;
  _$jscoverage['/lang/lang.js'].lineData[177] = 0;
  _$jscoverage['/lang/lang.js'].lineData[178] = 0;
  _$jscoverage['/lang/lang.js'].lineData[182] = 0;
  _$jscoverage['/lang/lang.js'].lineData[184] = 0;
  _$jscoverage['/lang/lang.js'].lineData[185] = 0;
  _$jscoverage['/lang/lang.js'].lineData[187] = 0;
  _$jscoverage['/lang/lang.js'].lineData[188] = 0;
  _$jscoverage['/lang/lang.js'].lineData[195] = 0;
  _$jscoverage['/lang/lang.js'].lineData[196] = 0;
  _$jscoverage['/lang/lang.js'].lineData[198] = 0;
  _$jscoverage['/lang/lang.js'].lineData[199] = 0;
  _$jscoverage['/lang/lang.js'].lineData[200] = 0;
}
if (! _$jscoverage['/lang/lang.js'].functionData) {
  _$jscoverage['/lang/lang.js'].functionData = [];
  _$jscoverage['/lang/lang.js'].functionData[0] = 0;
  _$jscoverage['/lang/lang.js'].functionData[1] = 0;
  _$jscoverage['/lang/lang.js'].functionData[2] = 0;
  _$jscoverage['/lang/lang.js'].functionData[3] = 0;
  _$jscoverage['/lang/lang.js'].functionData[4] = 0;
  _$jscoverage['/lang/lang.js'].functionData[5] = 0;
  _$jscoverage['/lang/lang.js'].functionData[6] = 0;
  _$jscoverage['/lang/lang.js'].functionData[7] = 0;
}
if (! _$jscoverage['/lang/lang.js'].branchData) {
  _$jscoverage['/lang/lang.js'].branchData = {};
  _$jscoverage['/lang/lang.js'].branchData['25'] = [];
  _$jscoverage['/lang/lang.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['26'] = [];
  _$jscoverage['/lang/lang.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['28'] = [];
  _$jscoverage['/lang/lang.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'] = [];
  _$jscoverage['/lang/lang.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'][4] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'][5] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'][6] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['31'][7] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['33'] = [];
  _$jscoverage['/lang/lang.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['33'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['35'] = [];
  _$jscoverage['/lang/lang.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['36'] = [];
  _$jscoverage['/lang/lang.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['38'] = [];
  _$jscoverage['/lang/lang.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['38'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['39'] = [];
  _$jscoverage['/lang/lang.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['41'] = [];
  _$jscoverage['/lang/lang.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['41'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['42'] = [];
  _$jscoverage['/lang/lang.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['44'] = [];
  _$jscoverage['/lang/lang.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['44'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['48'] = [];
  _$jscoverage['/lang/lang.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['70'] = [];
  _$jscoverage['/lang/lang.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['91'] = [];
  _$jscoverage['/lang/lang.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['102'] = [];
  _$jscoverage['/lang/lang.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['109'] = [];
  _$jscoverage['/lang/lang.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['112'] = [];
  _$jscoverage['/lang/lang.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['115'] = [];
  _$jscoverage['/lang/lang.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['140'] = [];
  _$jscoverage['/lang/lang.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['141'] = [];
  _$jscoverage['/lang/lang.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['144'] = [];
  _$jscoverage['/lang/lang.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['147'] = [];
  _$jscoverage['/lang/lang.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['148'] = [];
  _$jscoverage['/lang/lang.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['160'] = [];
  _$jscoverage['/lang/lang.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['166'] = [];
  _$jscoverage['/lang/lang.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['166'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['166'][4] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['166'][5] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['170'] = [];
  _$jscoverage['/lang/lang.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['177'] = [];
  _$jscoverage['/lang/lang.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['184'] = [];
  _$jscoverage['/lang/lang.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['187'] = [];
  _$jscoverage['/lang/lang.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['195'] = [];
  _$jscoverage['/lang/lang.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['200'] = [];
  _$jscoverage['/lang/lang.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['200'][3] = new BranchData();
}
_$jscoverage['/lang/lang.js'].branchData['200'][3].init(1555, 27, 'mismatchValues.length === 0');
function visit225_200_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['200'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['200'][2].init(1526, 25, 'mismatchKeys.length === 0');
function visit224_200_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['200'][1].init(1526, 56, 'mismatchKeys.length === 0 && mismatchValues.length === 0');
function visit223_200_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['195'][3].init(1339, 21, 'a.length !== b.length');
function visit222_195_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['195'][2].init(1323, 37, 'S.isArray(b) && a.length !== b.length');
function visit221_195_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['195'][1].init(1307, 53, 'S.isArray(a) && S.isArray(b) && a.length !== b.length');
function visit220_195_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['187'][1].init(105, 65, '!S.equals(a[property], b[property], mismatchKeys, mismatchValues)');
function visit219_187_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['184'][1].init(18, 27, 'property === COMPARE_MARKER');
function visit218_184_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['177'][1].init(18, 43, '!hasKey(b, property) && hasKey(a, property)');
function visit217_177_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['170'][1].init(18, 43, '!hasKey(a, property) && hasKey(b, property)');
function visit216_170_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][5].init(59, 26, 'obj[keyName] !== undefined');
function visit215_166_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][4].init(37, 17, 'obj !== undefined');
function visit214_166_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][3].init(21, 12, 'obj !== null');
function visit213_166_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][2].init(21, 33, 'obj !== null && obj !== undefined');
function visit212_166_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][1].init(21, 64, '(obj !== null && obj !== undefined) && obj[keyName] !== undefined');
function visit211_166_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['160'][3].init(71, 23, 'b[COMPARE_MARKER] === a');
function visit210_160_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['160'][2].init(44, 23, 'a[COMPARE_MARKER] === b');
function visit209_160_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['160'][1].init(44, 50, 'a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a');
function visit208_160_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['148'][2].init(49, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit207_148_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['148'][1].init(42, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit206_148_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['147'][2].init(22, 18, 'k !== CLONE_MARKER');
function visit205_147_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['147'][1].init(22, 95, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit204_147_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['144'][1].init(2082, 13, 'isPlainObject');
function visit203_144_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['141'][1].init(29, 22, 'i < destination.length');
function visit202_141_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['140'][1].init(1903, 7, 'isArray');
function visit201_140_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['115'][1].init(90, 63, 'S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit200_115_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['112'][1].init(499, 25, 'typeof input === \'object\'');
function visit199_112_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['109'][1].init(372, 19, 'input[CLONE_MARKER]');
function visit198_109_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['102'][1].init(128, 6, '!input');
function visit197_102_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['91'][1].init(2990, 67, 'Date.now || function() {\n  return +new Date();\n}');
function visit196_91_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['70'][1].init(81, 15, 'v[CLONE_MARKER]');
function visit195_70_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['48'][1].init(943, 7, 'a === b');
function visit194_48_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['44'][3].init(779, 21, 'typeof b === \'object\'');
function visit193_44_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['44'][2].init(754, 21, 'typeof a === \'object\'');
function visit192_44_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['44'][1].init(754, 46, 'typeof a === \'object\' && typeof b === \'object\'');
function visit191_44_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][1].init(25, 7, 'a === b');
function visit190_42_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['41'][3].init(665, 21, 'typeof b === \'number\'');
function visit189_41_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['41'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['41'][2].init(640, 21, 'typeof a === \'number\'');
function visit188_41_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['41'][1].init(640, 46, 'typeof a === \'number\' && typeof b === \'number\'');
function visit187_41_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][1].init(25, 7, 'a === b');
function visit186_39_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['38'][3].init(551, 21, 'typeof b === \'string\'');
function visit185_38_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['38'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['38'][2].init(526, 21, 'typeof a === \'string\'');
function visit184_38_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['38'][1].init(526, 46, 'typeof a === \'string\' && typeof b === \'string\'');
function visit183_38_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['36'][1].init(24, 27, 'a.getTime() === b.getTime()');
function visit182_36_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['35'][1].init(402, 38, 'a instanceof Date && b instanceof Date');
function visit181_35_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['33'][3].init(75, 9, 'b == null');
function visit180_33_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['33'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['33'][2].init(62, 9, 'a == null');
function visit179_33_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['33'][1].init(62, 22, 'a == null && b == null');
function visit178_33_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][7].init(273, 10, 'b === null');
function visit177_31_7(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][7].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][6].init(254, 15, 'b === undefined');
function visit176_31_6(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][6].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][5].init(254, 29, 'b === undefined || b === null');
function visit175_31_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][4].init(240, 10, 'a === null');
function visit174_31_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][3].init(240, 43, 'a === null || b === undefined || b === null');
function visit173_31_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][2].init(221, 15, 'a === undefined');
function visit172_31_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][1].init(221, 62, 'a === undefined || a === null || b === undefined || b === null');
function visit171_31_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['28'][1].init(151, 7, 'a === b');
function visit170_28_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['26'][1].init(112, 20, 'mismatchValues || []');
function visit169_26_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['25'][1].init(63, 18, 'mismatchKeys || []');
function visit168_25_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/lang.js'].functionData[0]++;
  _$jscoverage['/lang/lang.js'].lineData[8]++;
  var TRUE = true, FALSE = false, CLONE_MARKER = '__~ks_cloned', COMPARE_MARKER = '__~ks_compared';
  _$jscoverage['/lang/lang.js'].lineData[13]++;
  S.mix(S, {
  equals: function(a, b, mismatchKeys, mismatchValues) {
  _$jscoverage['/lang/lang.js'].functionData[1]++;
  _$jscoverage['/lang/lang.js'].lineData[25]++;
  mismatchKeys = visit168_25_1(mismatchKeys || []);
  _$jscoverage['/lang/lang.js'].lineData[26]++;
  mismatchValues = visit169_26_1(mismatchValues || []);
  _$jscoverage['/lang/lang.js'].lineData[28]++;
  if (visit170_28_1(a === b)) {
    _$jscoverage['/lang/lang.js'].lineData[29]++;
    return TRUE;
  }
  _$jscoverage['/lang/lang.js'].lineData[31]++;
  if (visit171_31_1(visit172_31_2(a === undefined) || visit173_31_3(visit174_31_4(a === null) || visit175_31_5(visit176_31_6(b === undefined) || visit177_31_7(b === null))))) {
    _$jscoverage['/lang/lang.js'].lineData[33]++;
    return visit178_33_1(visit179_33_2(a == null) && visit180_33_3(b == null));
  }
  _$jscoverage['/lang/lang.js'].lineData[35]++;
  if (visit181_35_1(a instanceof Date && b instanceof Date)) {
    _$jscoverage['/lang/lang.js'].lineData[36]++;
    return visit182_36_1(a.getTime() === b.getTime());
  }
  _$jscoverage['/lang/lang.js'].lineData[38]++;
  if (visit183_38_1(visit184_38_2(typeof a === 'string') && visit185_38_3(typeof b === 'string'))) {
    _$jscoverage['/lang/lang.js'].lineData[39]++;
    return (visit186_39_1(a === b));
  }
  _$jscoverage['/lang/lang.js'].lineData[41]++;
  if (visit187_41_1(visit188_41_2(typeof a === 'number') && visit189_41_3(typeof b === 'number'))) {
    _$jscoverage['/lang/lang.js'].lineData[42]++;
    return (visit190_42_1(a === b));
  }
  _$jscoverage['/lang/lang.js'].lineData[44]++;
  if (visit191_44_1(visit192_44_2(typeof a === 'object') && visit193_44_3(typeof b === 'object'))) {
    _$jscoverage['/lang/lang.js'].lineData[45]++;
    return compareObjects(a, b, mismatchKeys, mismatchValues);
  }
  _$jscoverage['/lang/lang.js'].lineData[48]++;
  return (visit194_48_1(a === b));
}, 
  clone: function(input, filter) {
  _$jscoverage['/lang/lang.js'].functionData[2]++;
  _$jscoverage['/lang/lang.js'].lineData[65]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/lang/lang.js'].lineData[67]++;
  S.each(memory, function(v) {
  _$jscoverage['/lang/lang.js'].functionData[3]++;
  _$jscoverage['/lang/lang.js'].lineData[69]++;
  v = v.input;
  _$jscoverage['/lang/lang.js'].lineData[70]++;
  if (visit195_70_1(v[CLONE_MARKER])) {
    _$jscoverage['/lang/lang.js'].lineData[71]++;
    try {
      _$jscoverage['/lang/lang.js'].lineData[72]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/lang/lang.js'].lineData[74]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/lang/lang.js'].lineData[78]++;
  memory = null;
  _$jscoverage['/lang/lang.js'].lineData[79]++;
  return ret;
}, 
  now: visit196_91_1(Date.now || function() {
  _$jscoverage['/lang/lang.js'].functionData[4]++;
  _$jscoverage['/lang/lang.js'].lineData[92]++;
  return +new Date();
})});
  _$jscoverage['/lang/lang.js'].lineData[96]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/lang/lang.js'].functionData[5]++;
    _$jscoverage['/lang/lang.js'].lineData[97]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/lang/lang.js'].lineData[102]++;
    if (visit197_102_1(!input)) {
      _$jscoverage['/lang/lang.js'].lineData[103]++;
      return destination;
    }
    _$jscoverage['/lang/lang.js'].lineData[109]++;
    if (visit198_109_1(input[CLONE_MARKER])) {
      _$jscoverage['/lang/lang.js'].lineData[111]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/lang/lang.js'].lineData[112]++;
      if (visit199_112_1(typeof input === 'object')) {
        _$jscoverage['/lang/lang.js'].lineData[114]++;
        var Constructor = input.constructor;
        _$jscoverage['/lang/lang.js'].lineData[115]++;
        if (visit200_115_1(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/lang/lang.js'].lineData[116]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/lang/lang.js'].lineData[119]++;
          if ((isArray = S.isArray(input))) {
            _$jscoverage['/lang/lang.js'].lineData[120]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/lang/lang.js'].lineData[121]++;
            if ((isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/lang/lang.js'].lineData[122]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/lang/lang.js'].lineData[128]++;
        input[CLONE_MARKER] = (stamp = S.guid('c'));
        _$jscoverage['/lang/lang.js'].lineData[130]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[140]++;
    if (visit201_140_1(isArray)) {
      _$jscoverage['/lang/lang.js'].lineData[141]++;
      for (var i = 0; visit202_141_1(i < destination.length); i++) {
        _$jscoverage['/lang/lang.js'].lineData[142]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/lang/lang.js'].lineData[144]++;
      if (visit203_144_1(isPlainObject)) {
        _$jscoverage['/lang/lang.js'].lineData[145]++;
        for (k in input) {
          _$jscoverage['/lang/lang.js'].lineData[147]++;
          if (visit204_147_1(visit205_147_2(k !== CLONE_MARKER) && (visit206_148_1(!f || (visit207_148_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/lang/lang.js'].lineData[149]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[155]++;
    return destination;
  }
  _$jscoverage['/lang/lang.js'].lineData[158]++;
  function compareObjects(a, b, mismatchKeys, mismatchValues) {
    _$jscoverage['/lang/lang.js'].functionData[6]++;
    _$jscoverage['/lang/lang.js'].lineData[160]++;
    if (visit208_160_1(visit209_160_2(a[COMPARE_MARKER] === b) && visit210_160_3(b[COMPARE_MARKER] === a))) {
      _$jscoverage['/lang/lang.js'].lineData[161]++;
      return TRUE;
    }
    _$jscoverage['/lang/lang.js'].lineData[163]++;
    a[COMPARE_MARKER] = b;
    _$jscoverage['/lang/lang.js'].lineData[164]++;
    b[COMPARE_MARKER] = a;
    _$jscoverage['/lang/lang.js'].lineData[165]++;
    var hasKey = function(obj, keyName) {
  _$jscoverage['/lang/lang.js'].functionData[7]++;
  _$jscoverage['/lang/lang.js'].lineData[166]++;
  return visit211_166_1((visit212_166_2(visit213_166_3(obj !== null) && visit214_166_4(obj !== undefined))) && visit215_166_5(obj[keyName] !== undefined));
};
    _$jscoverage['/lang/lang.js'].lineData[168]++;
    for (var property in b) {
      _$jscoverage['/lang/lang.js'].lineData[170]++;
      if (visit216_170_1(!hasKey(a, property) && hasKey(b, property))) {
        _$jscoverage['/lang/lang.js'].lineData[171]++;
        mismatchKeys.push('expected has key ' + property + '", but missing from actual.');
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[175]++;
    for (property in a) {
      _$jscoverage['/lang/lang.js'].lineData[177]++;
      if (visit217_177_1(!hasKey(b, property) && hasKey(a, property))) {
        _$jscoverage['/lang/lang.js'].lineData[178]++;
        mismatchKeys.push('expected missing key "' + property + '", but present in actual.');
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[182]++;
    for (property in b) {
      _$jscoverage['/lang/lang.js'].lineData[184]++;
      if (visit218_184_1(property === COMPARE_MARKER)) {
        _$jscoverage['/lang/lang.js'].lineData[185]++;
        continue;
      }
      _$jscoverage['/lang/lang.js'].lineData[187]++;
      if (visit219_187_1(!S.equals(a[property], b[property], mismatchKeys, mismatchValues))) {
        _$jscoverage['/lang/lang.js'].lineData[188]++;
        mismatchValues.push('"' + property + '" was "' + (b[property] ? (b[property].toString()) : b[property]) + '" in expected, but was "' + (a[property] ? (a[property].toString()) : a[property]) + '" in actual.');
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[195]++;
    if (visit220_195_1(S.isArray(a) && visit221_195_2(S.isArray(b) && visit222_195_3(a.length !== b.length)))) {
      _$jscoverage['/lang/lang.js'].lineData[196]++;
      mismatchValues.push('arrays were not the same length');
    }
    _$jscoverage['/lang/lang.js'].lineData[198]++;
    delete a[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[199]++;
    delete b[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[200]++;
    return (visit223_200_1(visit224_200_2(mismatchKeys.length === 0) && visit225_200_3(mismatchValues.length === 0)));
  }
})(KISSY);
