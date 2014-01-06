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
  _$jscoverage['/lang/lang.js'].lineData[117] = 0;
  _$jscoverage['/lang/lang.js'].lineData[119] = 0;
  _$jscoverage['/lang/lang.js'].lineData[120] = 0;
  _$jscoverage['/lang/lang.js'].lineData[121] = 0;
  _$jscoverage['/lang/lang.js'].lineData[127] = 0;
  _$jscoverage['/lang/lang.js'].lineData[129] = 0;
  _$jscoverage['/lang/lang.js'].lineData[139] = 0;
  _$jscoverage['/lang/lang.js'].lineData[140] = 0;
  _$jscoverage['/lang/lang.js'].lineData[141] = 0;
  _$jscoverage['/lang/lang.js'].lineData[143] = 0;
  _$jscoverage['/lang/lang.js'].lineData[144] = 0;
  _$jscoverage['/lang/lang.js'].lineData[146] = 0;
  _$jscoverage['/lang/lang.js'].lineData[148] = 0;
  _$jscoverage['/lang/lang.js'].lineData[154] = 0;
  _$jscoverage['/lang/lang.js'].lineData[157] = 0;
  _$jscoverage['/lang/lang.js'].lineData[159] = 0;
  _$jscoverage['/lang/lang.js'].lineData[160] = 0;
  _$jscoverage['/lang/lang.js'].lineData[162] = 0;
  _$jscoverage['/lang/lang.js'].lineData[163] = 0;
  _$jscoverage['/lang/lang.js'].lineData[164] = 0;
  _$jscoverage['/lang/lang.js'].lineData[165] = 0;
  _$jscoverage['/lang/lang.js'].lineData[167] = 0;
  _$jscoverage['/lang/lang.js'].lineData[169] = 0;
  _$jscoverage['/lang/lang.js'].lineData[170] = 0;
  _$jscoverage['/lang/lang.js'].lineData[174] = 0;
  _$jscoverage['/lang/lang.js'].lineData[176] = 0;
  _$jscoverage['/lang/lang.js'].lineData[177] = 0;
  _$jscoverage['/lang/lang.js'].lineData[181] = 0;
  _$jscoverage['/lang/lang.js'].lineData[183] = 0;
  _$jscoverage['/lang/lang.js'].lineData[184] = 0;
  _$jscoverage['/lang/lang.js'].lineData[186] = 0;
  _$jscoverage['/lang/lang.js'].lineData[187] = 0;
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
  _$jscoverage['/lang/lang.js'].branchData['139'] = [];
  _$jscoverage['/lang/lang.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['140'] = [];
  _$jscoverage['/lang/lang.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['143'] = [];
  _$jscoverage['/lang/lang.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['146'] = [];
  _$jscoverage['/lang/lang.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['147'] = [];
  _$jscoverage['/lang/lang.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['159'] = [];
  _$jscoverage['/lang/lang.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['159'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['159'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['165'] = [];
  _$jscoverage['/lang/lang.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['165'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['165'][4] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['165'][5] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['169'] = [];
  _$jscoverage['/lang/lang.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['176'] = [];
  _$jscoverage['/lang/lang.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['183'] = [];
  _$jscoverage['/lang/lang.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['186'] = [];
  _$jscoverage['/lang/lang.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['194'] = [];
  _$jscoverage['/lang/lang.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['199'] = [];
  _$jscoverage['/lang/lang.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/lang/lang.js'].branchData['199'][3] = new BranchData();
}
_$jscoverage['/lang/lang.js'].branchData['199'][3].init(1555, 27, 'mismatchValues.length === 0');
function visit234_199_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['199'][2].init(1526, 25, 'mismatchKeys.length === 0');
function visit233_199_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['199'][1].init(1526, 56, 'mismatchKeys.length === 0 && mismatchValues.length === 0');
function visit232_199_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['194'][3].init(1339, 21, 'a.length !== b.length');
function visit231_194_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['194'][2].init(1323, 37, 'S.isArray(b) && a.length !== b.length');
function visit230_194_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['194'][1].init(1307, 53, 'S.isArray(a) && S.isArray(b) && a.length !== b.length');
function visit229_194_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['186'][1].init(105, 65, '!S.equals(a[property], b[property], mismatchKeys, mismatchValues)');
function visit228_186_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['183'][1].init(18, 27, 'property === COMPARE_MARKER');
function visit227_183_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['176'][1].init(18, 43, '!hasKey(b, property) && hasKey(a, property)');
function visit226_176_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['169'][1].init(18, 43, '!hasKey(a, property) && hasKey(b, property)');
function visit225_169_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['165'][5].init(59, 26, 'obj[keyName] !== undefined');
function visit224_165_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['165'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['165'][4].init(37, 17, 'obj !== undefined');
function visit223_165_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['165'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['165'][3].init(21, 12, 'obj !== null');
function visit222_165_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['165'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['165'][2].init(21, 33, 'obj !== null && obj !== undefined');
function visit221_165_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['165'][1].init(21, 64, '(obj !== null && obj !== undefined) && obj[keyName] !== undefined');
function visit220_165_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['159'][3].init(71, 23, 'b[COMPARE_MARKER] === a');
function visit219_159_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['159'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['159'][2].init(44, 23, 'a[COMPARE_MARKER] === b');
function visit218_159_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['159'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['159'][1].init(44, 50, 'a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a');
function visit217_159_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['147'][2].init(49, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit216_147_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['147'][1].init(42, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit215_147_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['146'][2].init(22, 18, 'k !== CLONE_MARKER');
function visit214_146_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['146'][1].init(22, 95, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit213_146_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['143'][1].init(2074, 13, 'isPlainObject');
function visit212_143_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['140'][1].init(29, 22, 'i < destination.length');
function visit211_140_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['139'][1].init(1895, 7, 'isArray');
function visit210_139_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['115'][1].init(90, 63, 'S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit209_115_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['112'][1].init(499, 25, 'typeof input === \'object\'');
function visit208_112_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['109'][1].init(372, 19, 'input[CLONE_MARKER]');
function visit207_109_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['102'][1].init(128, 6, '!input');
function visit206_102_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['91'][1].init(2990, 67, 'Date.now || function() {\n  return +new Date();\n}');
function visit205_91_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['70'][1].init(81, 15, 'v[CLONE_MARKER]');
function visit204_70_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['48'][1].init(943, 7, 'a === b');
function visit203_48_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['44'][3].init(779, 21, 'typeof b === \'object\'');
function visit202_44_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['44'][2].init(754, 21, 'typeof a === \'object\'');
function visit201_44_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['44'][1].init(754, 46, 'typeof a === \'object\' && typeof b === \'object\'');
function visit200_44_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['42'][1].init(25, 7, 'a === b');
function visit199_42_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['41'][3].init(665, 21, 'typeof b === \'number\'');
function visit198_41_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['41'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['41'][2].init(640, 21, 'typeof a === \'number\'');
function visit197_41_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['41'][1].init(640, 46, 'typeof a === \'number\' && typeof b === \'number\'');
function visit196_41_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['39'][1].init(25, 7, 'a === b');
function visit195_39_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['38'][3].init(551, 21, 'typeof b === \'string\'');
function visit194_38_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['38'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['38'][2].init(526, 21, 'typeof a === \'string\'');
function visit193_38_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['38'][1].init(526, 46, 'typeof a === \'string\' && typeof b === \'string\'');
function visit192_38_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['36'][1].init(24, 27, 'a.getTime() === b.getTime()');
function visit191_36_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['35'][1].init(402, 38, 'a instanceof Date && b instanceof Date');
function visit190_35_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['33'][3].init(75, 9, 'b == null');
function visit189_33_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['33'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['33'][2].init(62, 9, 'a == null');
function visit188_33_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['33'][1].init(62, 22, 'a == null && b == null');
function visit187_33_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][7].init(273, 10, 'b === null');
function visit186_31_7(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][7].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][6].init(254, 15, 'b === undefined');
function visit185_31_6(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][6].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][5].init(254, 29, 'b === undefined || b === null');
function visit184_31_5(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][4].init(240, 10, 'a === null');
function visit183_31_4(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][3].init(240, 43, 'a === null || b === undefined || b === null');
function visit182_31_3(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][2].init(221, 15, 'a === undefined');
function visit181_31_2(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['31'][1].init(221, 62, 'a === undefined || a === null || b === undefined || b === null');
function visit180_31_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['28'][1].init(151, 7, 'a === b');
function visit179_28_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['26'][1].init(112, 20, 'mismatchValues || []');
function visit178_26_1(result) {
  _$jscoverage['/lang/lang.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/lang.js'].branchData['25'][1].init(63, 18, 'mismatchKeys || []');
function visit177_25_1(result) {
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
  mismatchKeys = visit177_25_1(mismatchKeys || []);
  _$jscoverage['/lang/lang.js'].lineData[26]++;
  mismatchValues = visit178_26_1(mismatchValues || []);
  _$jscoverage['/lang/lang.js'].lineData[28]++;
  if (visit179_28_1(a === b)) {
    _$jscoverage['/lang/lang.js'].lineData[29]++;
    return TRUE;
  }
  _$jscoverage['/lang/lang.js'].lineData[31]++;
  if (visit180_31_1(visit181_31_2(a === undefined) || visit182_31_3(visit183_31_4(a === null) || visit184_31_5(visit185_31_6(b === undefined) || visit186_31_7(b === null))))) {
    _$jscoverage['/lang/lang.js'].lineData[33]++;
    return visit187_33_1(visit188_33_2(a == null) && visit189_33_3(b == null));
  }
  _$jscoverage['/lang/lang.js'].lineData[35]++;
  if (visit190_35_1(a instanceof Date && b instanceof Date)) {
    _$jscoverage['/lang/lang.js'].lineData[36]++;
    return visit191_36_1(a.getTime() === b.getTime());
  }
  _$jscoverage['/lang/lang.js'].lineData[38]++;
  if (visit192_38_1(visit193_38_2(typeof a === 'string') && visit194_38_3(typeof b === 'string'))) {
    _$jscoverage['/lang/lang.js'].lineData[39]++;
    return (visit195_39_1(a === b));
  }
  _$jscoverage['/lang/lang.js'].lineData[41]++;
  if (visit196_41_1(visit197_41_2(typeof a === 'number') && visit198_41_3(typeof b === 'number'))) {
    _$jscoverage['/lang/lang.js'].lineData[42]++;
    return (visit199_42_1(a === b));
  }
  _$jscoverage['/lang/lang.js'].lineData[44]++;
  if (visit200_44_1(visit201_44_2(typeof a === 'object') && visit202_44_3(typeof b === 'object'))) {
    _$jscoverage['/lang/lang.js'].lineData[45]++;
    return compareObjects(a, b, mismatchKeys, mismatchValues);
  }
  _$jscoverage['/lang/lang.js'].lineData[48]++;
  return (visit203_48_1(a === b));
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
  if (visit204_70_1(v[CLONE_MARKER])) {
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
  now: visit205_91_1(Date.now || function() {
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
    if (visit206_102_1(!input)) {
      _$jscoverage['/lang/lang.js'].lineData[103]++;
      return destination;
    }
    _$jscoverage['/lang/lang.js'].lineData[109]++;
    if (visit207_109_1(input[CLONE_MARKER])) {
      _$jscoverage['/lang/lang.js'].lineData[111]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/lang/lang.js'].lineData[112]++;
      if (visit208_112_1(typeof input === 'object')) {
        _$jscoverage['/lang/lang.js'].lineData[114]++;
        var Constructor = input.constructor;
        _$jscoverage['/lang/lang.js'].lineData[115]++;
        if (visit209_115_1(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/lang/lang.js'].lineData[116]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/lang/lang.js'].lineData[117]++;
          if ((isArray = S.isArray(input))) {
            _$jscoverage['/lang/lang.js'].lineData[119]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/lang/lang.js'].lineData[120]++;
            if ((isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/lang/lang.js'].lineData[121]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/lang/lang.js'].lineData[127]++;
        input[CLONE_MARKER] = (stamp = S.guid('c'));
        _$jscoverage['/lang/lang.js'].lineData[129]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[139]++;
    if (visit210_139_1(isArray)) {
      _$jscoverage['/lang/lang.js'].lineData[140]++;
      for (var i = 0; visit211_140_1(i < destination.length); i++) {
        _$jscoverage['/lang/lang.js'].lineData[141]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/lang/lang.js'].lineData[143]++;
      if (visit212_143_1(isPlainObject)) {
        _$jscoverage['/lang/lang.js'].lineData[144]++;
        for (k in input) {
          _$jscoverage['/lang/lang.js'].lineData[146]++;
          if (visit213_146_1(visit214_146_2(k !== CLONE_MARKER) && (visit215_147_1(!f || (visit216_147_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/lang/lang.js'].lineData[148]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[154]++;
    return destination;
  }
  _$jscoverage['/lang/lang.js'].lineData[157]++;
  function compareObjects(a, b, mismatchKeys, mismatchValues) {
    _$jscoverage['/lang/lang.js'].functionData[6]++;
    _$jscoverage['/lang/lang.js'].lineData[159]++;
    if (visit217_159_1(visit218_159_2(a[COMPARE_MARKER] === b) && visit219_159_3(b[COMPARE_MARKER] === a))) {
      _$jscoverage['/lang/lang.js'].lineData[160]++;
      return TRUE;
    }
    _$jscoverage['/lang/lang.js'].lineData[162]++;
    a[COMPARE_MARKER] = b;
    _$jscoverage['/lang/lang.js'].lineData[163]++;
    b[COMPARE_MARKER] = a;
    _$jscoverage['/lang/lang.js'].lineData[164]++;
    var hasKey = function(obj, keyName) {
  _$jscoverage['/lang/lang.js'].functionData[7]++;
  _$jscoverage['/lang/lang.js'].lineData[165]++;
  return visit220_165_1((visit221_165_2(visit222_165_3(obj !== null) && visit223_165_4(obj !== undefined))) && visit224_165_5(obj[keyName] !== undefined));
};
    _$jscoverage['/lang/lang.js'].lineData[167]++;
    for (var property in b) {
      _$jscoverage['/lang/lang.js'].lineData[169]++;
      if (visit225_169_1(!hasKey(a, property) && hasKey(b, property))) {
        _$jscoverage['/lang/lang.js'].lineData[170]++;
        mismatchKeys.push('expected has key ' + property + '", but missing from actual.');
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[174]++;
    for (property in a) {
      _$jscoverage['/lang/lang.js'].lineData[176]++;
      if (visit226_176_1(!hasKey(b, property) && hasKey(a, property))) {
        _$jscoverage['/lang/lang.js'].lineData[177]++;
        mismatchKeys.push('expected missing key "' + property + '", but present in actual.');
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[181]++;
    for (property in b) {
      _$jscoverage['/lang/lang.js'].lineData[183]++;
      if (visit227_183_1(property === COMPARE_MARKER)) {
        _$jscoverage['/lang/lang.js'].lineData[184]++;
        continue;
      }
      _$jscoverage['/lang/lang.js'].lineData[186]++;
      if (visit228_186_1(!S.equals(a[property], b[property], mismatchKeys, mismatchValues))) {
        _$jscoverage['/lang/lang.js'].lineData[187]++;
        mismatchValues.push('"' + property + '" was "' + (b[property] ? (b[property].toString()) : b[property]) + '" in expected, but was "' + (a[property] ? (a[property].toString()) : a[property]) + '" in actual.');
      }
    }
    _$jscoverage['/lang/lang.js'].lineData[194]++;
    if (visit229_194_1(S.isArray(a) && visit230_194_2(S.isArray(b) && visit231_194_3(a.length !== b.length)))) {
      _$jscoverage['/lang/lang.js'].lineData[195]++;
      mismatchValues.push('arrays were not the same length');
    }
    _$jscoverage['/lang/lang.js'].lineData[197]++;
    delete a[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[198]++;
    delete b[COMPARE_MARKER];
    _$jscoverage['/lang/lang.js'].lineData[199]++;
    return (visit232_199_1(visit233_199_2(mismatchKeys.length === 0) && visit234_199_3(mismatchValues.length === 0)));
  }
})(KISSY);
