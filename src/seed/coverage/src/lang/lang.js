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
  _$jscoverage['/lang/lang.js'].lineData[194] = 0;
  _$jscoverage['/lang/lang.js'].lineData[195] = 0;
  _$jscoverage['/lang/lang.js'].lineData[197] = 0;
  _$jscoverage['/lang/lang.js'].lineData[198] = 0;
  _$jscoverage['/lang/lang.js'].lineData[199] = 0;
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
  _$jscoverage['/lang/lang.js'].branchData['194'] = [];
  _$jscoverage['/lang/lang.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['199'] = [];
  _$jscoverage['/lang/lang.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['199'][3] = new BranchData();
}
_$jscoverage['/lang/lang.js'].branchData['199'][3].init(1575, 27, 'mismatchValues.length === 0');
function visit223_199_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['199'][2].init(1546, 25, 'mismatchKeys.length === 0');
function visit222_199_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['199'][1].init(1546, 56, 'mismatchKeys.length === 0 && mismatchValues.length === 0');
function visit221_199_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['194'][3].init(1355, 20, 'a.length != b.length');
function visit220_194_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['194'][2].init(1339, 36, 'S.isArray(b) && a.length != b.length');
function visit219_194_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['194'][1].init(1323, 52, 'S.isArray(a) && S.isArray(b) && a.length != b.length');
function visit218_194_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['187'][1].init(109, 65, '!S.equals(a[property], b[property], mismatchKeys, mismatchValues)');
function visit217_187_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['184'][1].init(20, 26, 'property == COMPARE_MARKER');
function visit216_184_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['177'][1].init(20, 43, '!hasKey(b, property) && hasKey(a, property)');
function visit215_177_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['170'][1].init(20, 43, '!hasKey(a, property) && hasKey(b, property)');
function visit214_170_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][5].init(60, 26, 'obj[keyName] !== undefined');
function visit213_166_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][4].init(38, 17, 'obj !== undefined');
function visit212_166_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][3].init(22, 12, 'obj !== null');
function visit211_166_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][2].init(22, 33, 'obj !== null && obj !== undefined');
function visit210_166_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['166'][1].init(22, 64, '(obj !== null && obj !== undefined) && obj[keyName] !== undefined');
function visit209_166_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['160'][3].init(73, 23, 'b[COMPARE_MARKER] === a');
function visit208_160_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['160'][2].init(46, 23, 'a[COMPARE_MARKER] === b');
function visit207_160_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['160'][1].init(46, 50, 'a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a');
function visit206_160_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['148'][2].init(50, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit205_148_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['148'][1].init(43, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit204_148_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['147'][2].init(24, 18, 'k !== CLONE_MARKER');
function visit203_147_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['147'][1].init(24, 96, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit202_147_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['144'][1].init(2090, 13, 'isPlainObject');
function visit201_144_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['141'][1].init(30, 22, 'i < destination.length');
function visit200_141_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['140'][1].init(1907, 7, 'isArray');
function visit199_140_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['122'][1].init(447, 38, 'isPlainObject = S.isPlainObject(input)');
function visit198_122_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['120'][1].init(320, 26, 'isArray = S.isArray(input)');
function visit197_120_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['116'][1].init(93, 63, 'S.inArray(constructor, [Boolean, String, Number, Date, RegExp])');
function visit196_116_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['113'][1].init(515, 25, 'typeof input === \'object\'');
function visit195_113_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['110'][1].init(385, 19, 'input[CLONE_MARKER]');
function visit194_110_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['103'][1].init(134, 6, '!input');
function visit193_103_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['92'][1].init(3359, 77, 'Date.now || function() {\n  return +new Date();\n}');
function visit192_92_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['71'][1].init(96, 15, 'v[CLONE_MARKER]');
function visit191_71_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['49'][1].init(1055, 7, 'a === b');
function visit190_49_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['45'][3].init(871, 21, 'typeof b === \'object\'');
function visit189_45_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['45'][2].init(846, 21, 'typeof a === \'object\'');
function visit188_45_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['45'][1].init(846, 46, 'typeof a === \'object\' && typeof b === \'object\'');
function visit187_45_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['43'][1].init(30, 6, 'a == b');
function visit186_43_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][3].init(745, 19, 'typeof b === \'number\'');
function visit185_42_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][2].init(722, 19, 'typeof a === \'number\'');
function visit184_42_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][1].init(722, 42, 'typeof a === \'number\' && typeof b === \'number\'');
function visit183_42_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['40'][1].init(30, 6, 'a == b');
function visit182_40_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][3].init(620, 20, 'typeof b == \'string\'');
function visit181_39_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][2].init(596, 20, 'typeof a == \'string\'');
function visit180_39_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][1].init(596, 44, 'typeof a == \'string\' && typeof b == \'string\'');
function visit179_39_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['37'][1].init(29, 26, 'a.getTime() == b.getTime()');
function visit178_37_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['36'][1].init(458, 38, 'a instanceof Date && b instanceof Date');
function visit177_36_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['34'][3].init(85, 9, 'b == null');
function visit176_34_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['34'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['34'][2].init(72, 9, 'a == null');
function visit175_34_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['34'][1].init(72, 22, 'a == null && b == null');
function visit174_34_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][7].init(309, 10, 'b === null');
function visit173_32_7(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][7].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][6].init(290, 15, 'b === undefined');
function visit172_32_6(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][6].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][5].init(290, 29, 'b === undefined || b === null');
function visit171_32_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][4].init(276, 10, 'a === null');
function visit170_32_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][3].init(276, 43, 'a === null || b === undefined || b === null');
function visit169_32_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][2].init(257, 15, 'a === undefined');
function visit168_32_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['32'][1].init(257, 62, 'a === undefined || a === null || b === undefined || b === null');
function visit167_32_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['29'][1].init(172, 7, 'a === b');
function visit166_29_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['27'][1].init(127, 20, 'mismatchValues || []');
function visit165_27_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['26'][1].init(73, 18, 'mismatchKeys || []');
function visit164_26_1(result) {
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
  mismatchKeys = visit164_26_1(mismatchKeys || []);
  _$jscoverage['/lang/lang.js'].lineData[27]++;
  mismatchValues = visit165_27_1(mismatchValues || []);
  _$jscoverage['/lang/lang.js'].lineData[29]++;
  if (visit166_29_1(a === b)) {
    _$jscoverage['/lang/lang.js'].lineData[30]++;
    return TRUE;
  }
  _$jscoverage['/lang/lang.js'].lineData[32]++;
  if (visit167_32_1(visit168_32_2(a === undefined) || visit169_32_3(visit170_32_4(a === null) || visit171_32_5(visit172_32_6(b === undefined) || visit173_32_7(b === null))))) {
    _$jscoverage['/lang/lang.js'].lineData[34]++;
    return visit174_34_1(visit175_34_2(a == null) && visit176_34_3(b == null));
  }
  _$jscoverage['/lang/lang.js'].lineData[36]++;
  if (visit177_36_1(a instanceof Date && b instanceof Date)) {
    _$jscoverage['/lang/lang.js'].lineData[37]++;
    return visit178_37_1(a.getTime() == b.getTime());
  }
  _$jscoverage['/lang/lang.js'].lineData[39]++;
  if (visit179_39_1(visit180_39_2(typeof a == 'string') && visit181_39_3(typeof b == 'string'))) {
    _$jscoverage['/lang/lang.js'].lineData[40]++;
    return (visit182_40_1(a == b));
  }
  _$jscoverage['/lang/lang.js'].lineData[42]++;
  if (visit183_42_1(visit184_42_2(typeof a === 'number') && visit185_42_3(typeof b === 'number'))) {
    _$jscoverage['/lang/lang.js'].lineData[43]++;
    return (visit186_43_1(a == b));
  }
  _$jscoverage['/lang/lang.js'].lineData[45]++;
  if (visit187_45_1(visit188_45_2(typeof a === 'object') && visit189_45_3(typeof b === 'object'))) {
    _$jscoverage['/lang/lang.js'].lineData[46]++;
    return compareObjects(a, b, mismatchKeys, mismatchValues);
  }
  _$jscoverage['/lang/lang.js'].lineData[49]++;
  return (visit190_49_1(a === b));
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
  if (visit191_71_1(v[CLONE_MARKER])) {
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
  now: visit192_92_1(Date.now || function() {
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
    if (visit193_103_1(!input)) {
      _$jscoverage['/lang/lang.js'].lineData[104]++;
      return destination;
    }
    _$jscoverage['/lang/lang.js'].lineData[110]++;
    if (visit194_110_1(input[CLONE_MARKER])) {
      _$jscoverage['/lang/lang.js'].lineData[112]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/lang/lang.js'].lineData[113]++;
      if (visit195_113_1(typeof input === 'object')) {
        _$jscoverage['/lang/lang.js'].lineData[115]++;
        var constructor = input.constructor;
        _$jscoverage['/lang/lang.js'].lineData[116]++;
        if (visit196_116_1(S.inArray(constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/lang/lang.js'].lineData[117]++;
          destination = new constructor(input.valueOf());
        } else {
          _$jscoverage['/lang/lang.js'].lineData[120]++;
          if (visit197_120_1(isArray = S.isArray(input))) {
            _$jscoverage['/lang/lang.js'].lineData[121]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/lang/lang.js'].lineData[122]++;
            if (visit198_122_1(isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/lang/lang.js'].lineData[123]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/lang/lang.js'].lineData[128]++;
        input[CLONE_MARKER] = (stamp = S.guid());
        _$jscoverage['/lang/lang.js'].lineData[130]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[140]++;
    if (visit199_140_1(isArray)) {
      _$jscoverage['/lang/lang.js'].lineData[141]++;
      for (var i = 0; visit200_141_1(i < destination.length); i++) {
        _$jscoverage['/lang/lang.js'].lineData[142]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/lang/lang.js'].lineData[144]++;
      if (visit201_144_1(isPlainObject)) {
        _$jscoverage['/lang/lang.js'].lineData[145]++;
        for (k in input) {
          _$jscoverage['/lang/lang.js'].lineData[147]++;
          if (visit202_147_1(visit203_147_2(k !== CLONE_MARKER) && (visit204_148_1(!f || (visit205_148_2(f.call(input, input[k], k, input) !== FALSE)))))) {
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
    if (visit206_160_1(visit207_160_2(a[COMPARE_MARKER] === b) && visit208_160_3(b[COMPARE_MARKER] === a))) {
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
  return visit209_166_1((visit210_166_2(visit211_166_3(obj !== null) && visit212_166_4(obj !== undefined))) && visit213_166_5(obj[keyName] !== undefined));
};
    _$jscoverage['/lang/lang.js'].lineData[168]++;
    for (var property in b) {
      _$jscoverage['/lang/lang.js'].lineData[170]++;
      if (visit214_170_1(!hasKey(a, property) && hasKey(b, property))) {
        _$jscoverage['/lang/lang.js'].lineData[171]++;
        mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[175]++;
    for (property in a) {
      _$jscoverage['/lang/lang.js'].lineData[177]++;
      if (visit215_177_1(!hasKey(b, property) && hasKey(a, property))) {
        _$jscoverage['/lang/lang.js'].lineData[178]++;
        mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[182]++;
    for (property in b) {
      _$jscoverage['/lang/lang.js'].lineData[184]++;
      if (visit216_184_1(property == COMPARE_MARKER)) {
        _$jscoverage['/lang/lang.js'].lineData[185]++;
        continue;
      }
      _$jscoverage['/lang/lang.js'].lineData[187]++;
      if (visit217_187_1(!S.equals(a[property], b[property], mismatchKeys, mismatchValues))) {
        _$jscoverage['/lang/lang.js'].lineData[188]++;
        mismatchValues.push("'" + property + "' was '" + (b[property] ? (b[property].toString()) : b[property]) + "' in expected, but was '" + (a[property] ? (a[property].toString()) : a[property]) + "' in actual.");
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[194]++;
    if (visit218_194_1(S.isArray(a) && visit219_194_2(S.isArray(b) && visit220_194_3(a.length != b.length)))) {
      _$jscoverage['/lang/lang.js'].lineData[195]++;
      mismatchValues.push('arrays were not the same length');
    }
    _$jscoverage['/lang/lang.js'].lineData[197]++;
    delete a[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[198]++;
    delete b[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[199]++;
    return (visit221_199_1(visit222_199_2(mismatchKeys.length === 0) && visit223_199_3(mismatchValues.length === 0)));
  }
})(KISSY);
