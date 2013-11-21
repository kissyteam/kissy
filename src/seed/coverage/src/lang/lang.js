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
  _$jscoverage['/lang/lang.js'].lineData[9] = 0;
  _$jscoverage['/lang/lang.js'].lineData[14] = 0;
  _$jscoverage['/lang/lang.js'].lineData[26] = 0;
  _$jscoverage['/lang/lang.js'].lineData[27] = 0;
  _$jscoverage['/lang/lang.js'].lineData[29] = 0;
  _$jscoverage['/lang/lang.js'].lineData[30] = 0;
  _$jscoverage['/lang/lang.js'].lineData[32] = 0;
  _$jscoverage['/lang/lang.js'].lineData[34] = 0;
  _$jscoverage['/lang/lang.js'].lineData[36] = 0;
  _$jscoverage['/lang/lang.js'].lineData[37] = 0;
  _$jscoverage['/lang/lang.js'].lineData[39] = 0;
  _$jscoverage['/lang/lang.js'].lineData[40] = 0;
  _$jscoverage['/lang/lang.js'].lineData[42] = 0;
  _$jscoverage['/lang/lang.js'].lineData[43] = 0;
  _$jscoverage['/lang/lang.js'].lineData[45] = 0;
  _$jscoverage['/lang/lang.js'].lineData[46] = 0;
  _$jscoverage['/lang/lang.js'].lineData[49] = 0;
  _$jscoverage['/lang/lang.js'].lineData[66] = 0;
  _$jscoverage['/lang/lang.js'].lineData[68] = 0;
  _$jscoverage['/lang/lang.js'].lineData[70] = 0;
  _$jscoverage['/lang/lang.js'].lineData[71] = 0;
  _$jscoverage['/lang/lang.js'].lineData[72] = 0;
  _$jscoverage['/lang/lang.js'].lineData[73] = 0;
  _$jscoverage['/lang/lang.js'].lineData[75] = 0;
  _$jscoverage['/lang/lang.js'].lineData[79] = 0;
  _$jscoverage['/lang/lang.js'].lineData[80] = 0;
  _$jscoverage['/lang/lang.js'].lineData[93] = 0;
  _$jscoverage['/lang/lang.js'].lineData[97] = 0;
  _$jscoverage['/lang/lang.js'].lineData[98] = 0;
  _$jscoverage['/lang/lang.js'].lineData[103] = 0;
  _$jscoverage['/lang/lang.js'].lineData[104] = 0;
  _$jscoverage['/lang/lang.js'].lineData[110] = 0;
  _$jscoverage['/lang/lang.js'].lineData[112] = 0;
  _$jscoverage['/lang/lang.js'].lineData[113] = 0;
  _$jscoverage['/lang/lang.js'].lineData[115] = 0;
  _$jscoverage['/lang/lang.js'].lineData[116] = 0;
  _$jscoverage['/lang/lang.js'].lineData[117] = 0;
  _$jscoverage['/lang/lang.js'].lineData[120] = 0;
  _$jscoverage['/lang/lang.js'].lineData[121] = 0;
  _$jscoverage['/lang/lang.js'].lineData[122] = 0;
  _$jscoverage['/lang/lang.js'].lineData[123] = 0;
  _$jscoverage['/lang/lang.js'].lineData[129] = 0;
  _$jscoverage['/lang/lang.js'].lineData[131] = 0;
  _$jscoverage['/lang/lang.js'].lineData[141] = 0;
  _$jscoverage['/lang/lang.js'].lineData[142] = 0;
  _$jscoverage['/lang/lang.js'].lineData[143] = 0;
  _$jscoverage['/lang/lang.js'].lineData[145] = 0;
  _$jscoverage['/lang/lang.js'].lineData[146] = 0;
  _$jscoverage['/lang/lang.js'].lineData[148] = 0;
  _$jscoverage['/lang/lang.js'].lineData[150] = 0;
  _$jscoverage['/lang/lang.js'].lineData[156] = 0;
  _$jscoverage['/lang/lang.js'].lineData[159] = 0;
  _$jscoverage['/lang/lang.js'].lineData[161] = 0;
  _$jscoverage['/lang/lang.js'].lineData[162] = 0;
  _$jscoverage['/lang/lang.js'].lineData[164] = 0;
  _$jscoverage['/lang/lang.js'].lineData[165] = 0;
  _$jscoverage['/lang/lang.js'].lineData[166] = 0;
  _$jscoverage['/lang/lang.js'].lineData[167] = 0;
  _$jscoverage['/lang/lang.js'].lineData[169] = 0;
  _$jscoverage['/lang/lang.js'].lineData[171] = 0;
  _$jscoverage['/lang/lang.js'].lineData[172] = 0;
  _$jscoverage['/lang/lang.js'].lineData[176] = 0;
  _$jscoverage['/lang/lang.js'].lineData[178] = 0;
  _$jscoverage['/lang/lang.js'].lineData[179] = 0;
  _$jscoverage['/lang/lang.js'].lineData[183] = 0;
  _$jscoverage['/lang/lang.js'].lineData[185] = 0;
  _$jscoverage['/lang/lang.js'].lineData[186] = 0;
  _$jscoverage['/lang/lang.js'].lineData[188] = 0;
  _$jscoverage['/lang/lang.js'].lineData[189] = 0;
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
  _$jscoverage['/lang/lang.js'].branchData['26'] = [];
  _$jscoverage['/lang/lang.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['27'] = [];
  _$jscoverage['/lang/lang.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['29'] = [];
  _$jscoverage['/lang/lang.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'] = [];
  _$jscoverage['/lang/lang.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'][4] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'][5] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'][6] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['32'][7] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['34'] = [];
  _$jscoverage['/lang/lang.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['34'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['36'] = [];
  _$jscoverage['/lang/lang.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['37'] = [];
  _$jscoverage['/lang/lang.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['39'] = [];
  _$jscoverage['/lang/lang.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['39'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['40'] = [];
  _$jscoverage['/lang/lang.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['42'] = [];
  _$jscoverage['/lang/lang.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['42'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['43'] = [];
  _$jscoverage['/lang/lang.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['45'] = [];
  _$jscoverage['/lang/lang.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['49'] = [];
  _$jscoverage['/lang/lang.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['71'] = [];
  _$jscoverage['/lang/lang.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['92'] = [];
  _$jscoverage['/lang/lang.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['103'] = [];
  _$jscoverage['/lang/lang.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['110'] = [];
  _$jscoverage['/lang/lang.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['113'] = [];
  _$jscoverage['/lang/lang.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['116'] = [];
  _$jscoverage['/lang/lang.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['120'] = [];
  _$jscoverage['/lang/lang.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['122'] = [];
  _$jscoverage['/lang/lang.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['141'] = [];
  _$jscoverage['/lang/lang.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['142'] = [];
  _$jscoverage['/lang/lang.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['145'] = [];
  _$jscoverage['/lang/lang.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['148'] = [];
  _$jscoverage['/lang/lang.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['149'] = [];
  _$jscoverage['/lang/lang.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['161'] = [];
  _$jscoverage['/lang/lang.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['161'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['167'] = [];
  _$jscoverage['/lang/lang.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['167'][4] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['167'][5] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['171'] = [];
  _$jscoverage['/lang/lang.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['178'] = [];
  _$jscoverage['/lang/lang.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['185'] = [];
  _$jscoverage['/lang/lang.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['188'] = [];
  _$jscoverage['/lang/lang.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['195'] = [];
  _$jscoverage['/lang/lang.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['200'] = [];
  _$jscoverage['/lang/lang.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['200'][3] = new BranchData();
}
_$jscoverage['/lang/lang.js'].branchData['200'][3].init(1534, 27, 'mismatchValues.length === 0');
function visit224_200_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['200'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['200'][2].init(1505, 25, 'mismatchKeys.length === 0');
function visit223_200_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['200'][1].init(1505, 56, 'mismatchKeys.length === 0 && mismatchValues.length === 0');
function visit222_200_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['195'][3].init(1319, 20, 'a.length != b.length');
function visit221_195_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['195'][2].init(1303, 36, 'S.isArray(b) && a.length != b.length');
function visit220_195_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['195'][1].init(1287, 52, 'S.isArray(a) && S.isArray(b) && a.length != b.length');
function visit219_195_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['188'][1].init(104, 65, '!S.equals(a[property], b[property], mismatchKeys, mismatchValues)');
function visit218_188_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['185'][1].init(18, 26, 'property == COMPARE_MARKER');
function visit217_185_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['178'][1].init(18, 43, '!hasKey(b, property) && hasKey(a, property)');
function visit216_178_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['171'][1].init(18, 43, '!hasKey(a, property) && hasKey(b, property)');
function visit215_171_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['167'][5].init(59, 26, 'obj[keyName] !== undefined');
function visit214_167_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['167'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['167'][4].init(37, 17, 'obj !== undefined');
function visit213_167_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['167'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['167'][3].init(21, 12, 'obj !== null');
function visit212_167_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['167'][2].init(21, 33, 'obj !== null && obj !== undefined');
function visit211_167_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['167'][1].init(21, 64, '(obj !== null && obj !== undefined) && obj[keyName] !== undefined');
function visit210_167_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['161'][3].init(71, 23, 'b[COMPARE_MARKER] === a');
function visit209_161_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['161'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['161'][2].init(44, 23, 'a[COMPARE_MARKER] === b');
function visit208_161_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['161'][1].init(44, 50, 'a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a');
function visit207_161_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['149'][2].init(49, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit206_149_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['149'][1].init(42, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit205_149_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['148'][2].init(22, 18, 'k !== CLONE_MARKER');
function visit204_148_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['148'][1].init(22, 95, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit203_148_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['145'][1].init(2078, 13, 'isPlainObject');
function visit202_145_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['142'][1].init(29, 22, 'i < destination.length');
function visit201_142_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['141'][1].init(1899, 7, 'isArray');
function visit200_141_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['122'][1].init(438, 38, 'isPlainObject = S.isPlainObject(input)');
function visit199_122_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['120'][1].init(313, 26, 'isArray = S.isArray(input)');
function visit198_120_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['116'][1].init(90, 63, 'S.inArray(constructor, [Boolean, String, Number, Date, RegExp])');
function visit197_116_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['113'][1].init(499, 25, 'typeof input === \'object\'');
function visit196_113_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['110'][1].init(372, 19, 'input[CLONE_MARKER]');
function visit195_110_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['103'][1].init(128, 6, '!input');
function visit194_103_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['92'][1].init(2985, 67, 'Date.now || function() {\n  return +new Date();\n}');
function visit193_92_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['71'][1].init(81, 15, 'v[CLONE_MARKER]');
function visit192_71_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['49'][1].init(938, 7, 'a === b');
function visit191_49_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['45'][3].init(774, 21, 'typeof b === \'object\'');
function visit190_45_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['45'][2].init(749, 21, 'typeof a === \'object\'');
function visit189_45_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['45'][1].init(749, 46, 'typeof a === \'object\' && typeof b === \'object\'');
function visit188_45_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['43'][1].init(25, 6, 'a == b');
function visit187_43_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][3].init(661, 21, 'typeof b === \'number\'');
function visit186_42_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][2].init(636, 21, 'typeof a === \'number\'');
function visit185_42_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][1].init(636, 46, 'typeof a === \'number\' && typeof b === \'number\'');
function visit184_42_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['40'][1].init(25, 6, 'a == b');
function visit183_40_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][3].init(549, 20, 'typeof b == \'string\'');
function visit182_39_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][2].init(525, 20, 'typeof a == \'string\'');
function visit181_39_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][1].init(525, 44, 'typeof a == \'string\' && typeof b == \'string\'');
function visit180_39_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['37'][1].init(24, 26, 'a.getTime() == b.getTime()');
function visit179_37_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['36'][1].init(402, 38, 'a instanceof Date && b instanceof Date');
function visit178_36_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['34'][3].init(75, 9, 'b == null');
function visit177_34_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['34'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['34'][2].init(62, 9, 'a == null');
function visit176_34_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['34'][1].init(62, 22, 'a == null && b == null');
function visit175_34_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][7].init(273, 10, 'b === null');
function visit174_32_7(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][7].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][6].init(254, 15, 'b === undefined');
function visit173_32_6(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][6].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][5].init(254, 29, 'b === undefined || b === null');
function visit172_32_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][4].init(240, 10, 'a === null');
function visit171_32_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][3].init(240, 43, 'a === null || b === undefined || b === null');
function visit170_32_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][2].init(221, 15, 'a === undefined');
function visit169_32_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][1].init(221, 62, 'a === undefined || a === null || b === undefined || b === null');
function visit168_32_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['29'][1].init(151, 7, 'a === b');
function visit167_29_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['27'][1].init(112, 20, 'mismatchValues || []');
function visit166_27_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['26'][1].init(63, 18, 'mismatchKeys || []');
function visit165_26_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/lang.js'].functionData[0]++;
  _$jscoverage['/lang/lang.js'].lineData[9]++;
  var TRUE = true, FALSE = false, CLONE_MARKER = '__~ks_cloned', COMPARE_MARKER = '__~ks_compared';
  _$jscoverage['/lang/lang.js'].lineData[14]++;
  S.mix(S, {
  equals: function(a, b, mismatchKeys, mismatchValues) {
  _$jscoverage['/lang/lang.js'].functionData[1]++;
  _$jscoverage['/lang/lang.js'].lineData[26]++;
  mismatchKeys = visit165_26_1(mismatchKeys || []);
  _$jscoverage['/lang/lang.js'].lineData[27]++;
  mismatchValues = visit166_27_1(mismatchValues || []);
  _$jscoverage['/lang/lang.js'].lineData[29]++;
  if (visit167_29_1(a === b)) {
    _$jscoverage['/lang/lang.js'].lineData[30]++;
    return TRUE;
  }
  _$jscoverage['/lang/lang.js'].lineData[32]++;
  if (visit168_32_1(visit169_32_2(a === undefined) || visit170_32_3(visit171_32_4(a === null) || visit172_32_5(visit173_32_6(b === undefined) || visit174_32_7(b === null))))) {
    _$jscoverage['/lang/lang.js'].lineData[34]++;
    return visit175_34_1(visit176_34_2(a == null) && visit177_34_3(b == null));
  }
  _$jscoverage['/lang/lang.js'].lineData[36]++;
  if (visit178_36_1(a instanceof Date && b instanceof Date)) {
    _$jscoverage['/lang/lang.js'].lineData[37]++;
    return visit179_37_1(a.getTime() == b.getTime());
  }
  _$jscoverage['/lang/lang.js'].lineData[39]++;
  if (visit180_39_1(visit181_39_2(typeof a == 'string') && visit182_39_3(typeof b == 'string'))) {
    _$jscoverage['/lang/lang.js'].lineData[40]++;
    return (visit183_40_1(a == b));
  }
  _$jscoverage['/lang/lang.js'].lineData[42]++;
  if (visit184_42_1(visit185_42_2(typeof a === 'number') && visit186_42_3(typeof b === 'number'))) {
    _$jscoverage['/lang/lang.js'].lineData[43]++;
    return (visit187_43_1(a == b));
  }
  _$jscoverage['/lang/lang.js'].lineData[45]++;
  if (visit188_45_1(visit189_45_2(typeof a === 'object') && visit190_45_3(typeof b === 'object'))) {
    _$jscoverage['/lang/lang.js'].lineData[46]++;
    return compareObjects(a, b, mismatchKeys, mismatchValues);
  }
  _$jscoverage['/lang/lang.js'].lineData[49]++;
  return (visit191_49_1(a === b));
}, 
  clone: function(input, filter) {
  _$jscoverage['/lang/lang.js'].functionData[2]++;
  _$jscoverage['/lang/lang.js'].lineData[66]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/lang/lang.js'].lineData[68]++;
  S.each(memory, function(v) {
  _$jscoverage['/lang/lang.js'].functionData[3]++;
  _$jscoverage['/lang/lang.js'].lineData[70]++;
  v = v.input;
  _$jscoverage['/lang/lang.js'].lineData[71]++;
  if (visit192_71_1(v[CLONE_MARKER])) {
    _$jscoverage['/lang/lang.js'].lineData[72]++;
    try {
      _$jscoverage['/lang/lang.js'].lineData[73]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/lang/lang.js'].lineData[75]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/lang/lang.js'].lineData[79]++;
  memory = null;
  _$jscoverage['/lang/lang.js'].lineData[80]++;
  return ret;
}, 
  now: visit193_92_1(Date.now || function() {
  _$jscoverage['/lang/lang.js'].functionData[4]++;
  _$jscoverage['/lang/lang.js'].lineData[93]++;
  return +new Date();
})});
  _$jscoverage['/lang/lang.js'].lineData[97]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/lang/lang.js'].functionData[5]++;
    _$jscoverage['/lang/lang.js'].lineData[98]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/lang/lang.js'].lineData[103]++;
    if (visit194_103_1(!input)) {
      _$jscoverage['/lang/lang.js'].lineData[104]++;
      return destination;
    }
    _$jscoverage['/lang/lang.js'].lineData[110]++;
    if (visit195_110_1(input[CLONE_MARKER])) {
      _$jscoverage['/lang/lang.js'].lineData[112]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/lang/lang.js'].lineData[113]++;
      if (visit196_113_1(typeof input === 'object')) {
        _$jscoverage['/lang/lang.js'].lineData[115]++;
        var constructor = input.constructor;
        _$jscoverage['/lang/lang.js'].lineData[116]++;
        if (visit197_116_1(S.inArray(constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/lang/lang.js'].lineData[117]++;
          destination = new constructor(input.valueOf());
        } else {
          _$jscoverage['/lang/lang.js'].lineData[120]++;
          if (visit198_120_1(isArray = S.isArray(input))) {
            _$jscoverage['/lang/lang.js'].lineData[121]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/lang/lang.js'].lineData[122]++;
            if (visit199_122_1(isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/lang/lang.js'].lineData[123]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/lang/lang.js'].lineData[129]++;
        input[CLONE_MARKER] = (stamp = S.guid('c'));
        _$jscoverage['/lang/lang.js'].lineData[131]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[141]++;
    if (visit200_141_1(isArray)) {
      _$jscoverage['/lang/lang.js'].lineData[142]++;
      for (var i = 0; visit201_142_1(i < destination.length); i++) {
        _$jscoverage['/lang/lang.js'].lineData[143]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/lang/lang.js'].lineData[145]++;
      if (visit202_145_1(isPlainObject)) {
        _$jscoverage['/lang/lang.js'].lineData[146]++;
        for (k in input) {
          _$jscoverage['/lang/lang.js'].lineData[148]++;
          if (visit203_148_1(visit204_148_2(k !== CLONE_MARKER) && (visit205_149_1(!f || (visit206_149_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/lang/lang.js'].lineData[150]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[156]++;
    return destination;
  }
  _$jscoverage['/lang/lang.js'].lineData[159]++;
  function compareObjects(a, b, mismatchKeys, mismatchValues) {
    _$jscoverage['/lang/lang.js'].functionData[6]++;
    _$jscoverage['/lang/lang.js'].lineData[161]++;
    if (visit207_161_1(visit208_161_2(a[COMPARE_MARKER] === b) && visit209_161_3(b[COMPARE_MARKER] === a))) {
      _$jscoverage['/lang/lang.js'].lineData[162]++;
      return TRUE;
    }
    _$jscoverage['/lang/lang.js'].lineData[164]++;
    a[COMPARE_MARKER] = b;
    _$jscoverage['/lang/lang.js'].lineData[165]++;
    b[COMPARE_MARKER] = a;
    _$jscoverage['/lang/lang.js'].lineData[166]++;
    var hasKey = function(obj, keyName) {
  _$jscoverage['/lang/lang.js'].functionData[7]++;
  _$jscoverage['/lang/lang.js'].lineData[167]++;
  return visit210_167_1((visit211_167_2(visit212_167_3(obj !== null) && visit213_167_4(obj !== undefined))) && visit214_167_5(obj[keyName] !== undefined));
};
    _$jscoverage['/lang/lang.js'].lineData[169]++;
    for (var property in b) {
      _$jscoverage['/lang/lang.js'].lineData[171]++;
      if (visit215_171_1(!hasKey(a, property) && hasKey(b, property))) {
        _$jscoverage['/lang/lang.js'].lineData[172]++;
        mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[176]++;
    for (property in a) {
      _$jscoverage['/lang/lang.js'].lineData[178]++;
      if (visit216_178_1(!hasKey(b, property) && hasKey(a, property))) {
        _$jscoverage['/lang/lang.js'].lineData[179]++;
        mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[183]++;
    for (property in b) {
      _$jscoverage['/lang/lang.js'].lineData[185]++;
      if (visit217_185_1(property == COMPARE_MARKER)) {
        _$jscoverage['/lang/lang.js'].lineData[186]++;
        continue;
      }
      _$jscoverage['/lang/lang.js'].lineData[188]++;
      if (visit218_188_1(!S.equals(a[property], b[property], mismatchKeys, mismatchValues))) {
        _$jscoverage['/lang/lang.js'].lineData[189]++;
        mismatchValues.push("'" + property + "' was '" + (b[property] ? (b[property].toString()) : b[property]) + "' in expected, but was '" + (a[property] ? (a[property].toString()) : a[property]) + "' in actual.");
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[195]++;
    if (visit219_195_1(S.isArray(a) && visit220_195_2(S.isArray(b) && visit221_195_3(a.length != b.length)))) {
      _$jscoverage['/lang/lang.js'].lineData[196]++;
      mismatchValues.push('arrays were not the same length');
    }
    _$jscoverage['/lang/lang.js'].lineData[198]++;
    delete a[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[199]++;
    delete b[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[200]++;
    return (visit222_200_1(visit223_200_2(mismatchKeys.length === 0) && visit224_200_3(mismatchValues.length === 0)));
  }
})(KISSY);
