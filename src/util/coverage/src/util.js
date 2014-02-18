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
if (! _$jscoverage['/util.js']) {
  _$jscoverage['/util.js'] = {};
  _$jscoverage['/util.js'].lineData = [];
  _$jscoverage['/util.js'].lineData[7] = 0;
  _$jscoverage['/util.js'].lineData[8] = 0;
  _$jscoverage['/util.js'].lineData[13] = 0;
  _$jscoverage['/util.js'].lineData[14] = 0;
  _$jscoverage['/util.js'].lineData[15] = 0;
  _$jscoverage['/util.js'].lineData[16] = 0;
  _$jscoverage['/util.js'].lineData[17] = 0;
  _$jscoverage['/util.js'].lineData[18] = 0;
  _$jscoverage['/util.js'].lineData[19] = 0;
  _$jscoverage['/util.js'].lineData[21] = 0;
  _$jscoverage['/util.js'].lineData[33] = 0;
  _$jscoverage['/util.js'].lineData[34] = 0;
  _$jscoverage['/util.js'].lineData[36] = 0;
  _$jscoverage['/util.js'].lineData[37] = 0;
  _$jscoverage['/util.js'].lineData[39] = 0;
  _$jscoverage['/util.js'].lineData[41] = 0;
  _$jscoverage['/util.js'].lineData[43] = 0;
  _$jscoverage['/util.js'].lineData[44] = 0;
  _$jscoverage['/util.js'].lineData[46] = 0;
  _$jscoverage['/util.js'].lineData[47] = 0;
  _$jscoverage['/util.js'].lineData[49] = 0;
  _$jscoverage['/util.js'].lineData[50] = 0;
  _$jscoverage['/util.js'].lineData[52] = 0;
  _$jscoverage['/util.js'].lineData[53] = 0;
  _$jscoverage['/util.js'].lineData[56] = 0;
  _$jscoverage['/util.js'].lineData[73] = 0;
  _$jscoverage['/util.js'].lineData[75] = 0;
  _$jscoverage['/util.js'].lineData[77] = 0;
  _$jscoverage['/util.js'].lineData[78] = 0;
  _$jscoverage['/util.js'].lineData[79] = 0;
  _$jscoverage['/util.js'].lineData[80] = 0;
  _$jscoverage['/util.js'].lineData[82] = 0;
  _$jscoverage['/util.js'].lineData[86] = 0;
  _$jscoverage['/util.js'].lineData[87] = 0;
  _$jscoverage['/util.js'].lineData[91] = 0;
  _$jscoverage['/util.js'].lineData[92] = 0;
  _$jscoverage['/util.js'].lineData[97] = 0;
  _$jscoverage['/util.js'].lineData[98] = 0;
  _$jscoverage['/util.js'].lineData[104] = 0;
  _$jscoverage['/util.js'].lineData[106] = 0;
  _$jscoverage['/util.js'].lineData[107] = 0;
  _$jscoverage['/util.js'].lineData[109] = 0;
  _$jscoverage['/util.js'].lineData[110] = 0;
  _$jscoverage['/util.js'].lineData[111] = 0;
  _$jscoverage['/util.js'].lineData[112] = 0;
  _$jscoverage['/util.js'].lineData[114] = 0;
  _$jscoverage['/util.js'].lineData[115] = 0;
  _$jscoverage['/util.js'].lineData[116] = 0;
  _$jscoverage['/util.js'].lineData[122] = 0;
  _$jscoverage['/util.js'].lineData[124] = 0;
  _$jscoverage['/util.js'].lineData[134] = 0;
  _$jscoverage['/util.js'].lineData[135] = 0;
  _$jscoverage['/util.js'].lineData[136] = 0;
  _$jscoverage['/util.js'].lineData[138] = 0;
  _$jscoverage['/util.js'].lineData[139] = 0;
  _$jscoverage['/util.js'].lineData[141] = 0;
  _$jscoverage['/util.js'].lineData[143] = 0;
  _$jscoverage['/util.js'].lineData[149] = 0;
  _$jscoverage['/util.js'].lineData[152] = 0;
  _$jscoverage['/util.js'].lineData[154] = 0;
  _$jscoverage['/util.js'].lineData[155] = 0;
  _$jscoverage['/util.js'].lineData[157] = 0;
  _$jscoverage['/util.js'].lineData[158] = 0;
  _$jscoverage['/util.js'].lineData[159] = 0;
  _$jscoverage['/util.js'].lineData[160] = 0;
  _$jscoverage['/util.js'].lineData[162] = 0;
  _$jscoverage['/util.js'].lineData[164] = 0;
  _$jscoverage['/util.js'].lineData[165] = 0;
  _$jscoverage['/util.js'].lineData[169] = 0;
  _$jscoverage['/util.js'].lineData[171] = 0;
  _$jscoverage['/util.js'].lineData[172] = 0;
  _$jscoverage['/util.js'].lineData[176] = 0;
  _$jscoverage['/util.js'].lineData[178] = 0;
  _$jscoverage['/util.js'].lineData[179] = 0;
  _$jscoverage['/util.js'].lineData[181] = 0;
  _$jscoverage['/util.js'].lineData[182] = 0;
  _$jscoverage['/util.js'].lineData[189] = 0;
  _$jscoverage['/util.js'].lineData[190] = 0;
  _$jscoverage['/util.js'].lineData[192] = 0;
  _$jscoverage['/util.js'].lineData[193] = 0;
  _$jscoverage['/util.js'].lineData[194] = 0;
  _$jscoverage['/util.js'].lineData[197] = 0;
}
if (! _$jscoverage['/util.js'].functionData) {
  _$jscoverage['/util.js'].functionData = [];
  _$jscoverage['/util.js'].functionData[0] = 0;
  _$jscoverage['/util.js'].functionData[1] = 0;
  _$jscoverage['/util.js'].functionData[2] = 0;
  _$jscoverage['/util.js'].functionData[3] = 0;
  _$jscoverage['/util.js'].functionData[4] = 0;
  _$jscoverage['/util.js'].functionData[5] = 0;
  _$jscoverage['/util.js'].functionData[6] = 0;
}
if (! _$jscoverage['/util.js'].branchData) {
  _$jscoverage['/util.js'].branchData = {};
  _$jscoverage['/util.js'].branchData['33'] = [];
  _$jscoverage['/util.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['34'] = [];
  _$jscoverage['/util.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['36'] = [];
  _$jscoverage['/util.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'] = [];
  _$jscoverage['/util.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'][4] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'][5] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'][6] = new BranchData();
  _$jscoverage['/util.js'].branchData['39'][7] = new BranchData();
  _$jscoverage['/util.js'].branchData['41'] = [];
  _$jscoverage['/util.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['41'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['43'] = [];
  _$jscoverage['/util.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['44'] = [];
  _$jscoverage['/util.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['46'] = [];
  _$jscoverage['/util.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['46'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['47'] = [];
  _$jscoverage['/util.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['49'] = [];
  _$jscoverage['/util.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['49'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['50'] = [];
  _$jscoverage['/util.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['52'] = [];
  _$jscoverage['/util.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['52'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['56'] = [];
  _$jscoverage['/util.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['78'] = [];
  _$jscoverage['/util.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['97'] = [];
  _$jscoverage['/util.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['104'] = [];
  _$jscoverage['/util.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['107'] = [];
  _$jscoverage['/util.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['110'] = [];
  _$jscoverage['/util.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['134'] = [];
  _$jscoverage['/util.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['135'] = [];
  _$jscoverage['/util.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['138'] = [];
  _$jscoverage['/util.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['141'] = [];
  _$jscoverage['/util.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['142'] = [];
  _$jscoverage['/util.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['142'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['154'] = [];
  _$jscoverage['/util.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['154'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['160'] = [];
  _$jscoverage['/util.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['160'][4] = new BranchData();
  _$jscoverage['/util.js'].branchData['160'][5] = new BranchData();
  _$jscoverage['/util.js'].branchData['164'] = [];
  _$jscoverage['/util.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['171'] = [];
  _$jscoverage['/util.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['178'] = [];
  _$jscoverage['/util.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['181'] = [];
  _$jscoverage['/util.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['189'] = [];
  _$jscoverage['/util.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['189'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['194'] = [];
  _$jscoverage['/util.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['194'][3] = new BranchData();
}
_$jscoverage['/util.js'].branchData['194'][3].init(1555, 27, 'mismatchValues.length === 0');
function visit225_194_3(result) {
  _$jscoverage['/util.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['194'][2].init(1526, 25, 'mismatchKeys.length === 0');
function visit224_194_2(result) {
  _$jscoverage['/util.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['194'][1].init(1526, 56, 'mismatchKeys.length === 0 && mismatchValues.length === 0');
function visit223_194_1(result) {
  _$jscoverage['/util.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['189'][3].init(1339, 21, 'a.length !== b.length');
function visit222_189_3(result) {
  _$jscoverage['/util.js'].branchData['189'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['189'][2].init(1323, 37, 'S.isArray(b) && a.length !== b.length');
function visit221_189_2(result) {
  _$jscoverage['/util.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['189'][1].init(1307, 53, 'S.isArray(a) && S.isArray(b) && a.length !== b.length');
function visit220_189_1(result) {
  _$jscoverage['/util.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['181'][1].init(105, 65, '!S.equals(a[property], b[property], mismatchKeys, mismatchValues)');
function visit219_181_1(result) {
  _$jscoverage['/util.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['178'][1].init(18, 27, 'property === COMPARE_MARKER');
function visit218_178_1(result) {
  _$jscoverage['/util.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['171'][1].init(18, 43, '!hasKey(b, property) && hasKey(a, property)');
function visit217_171_1(result) {
  _$jscoverage['/util.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['164'][1].init(18, 43, '!hasKey(a, property) && hasKey(b, property)');
function visit216_164_1(result) {
  _$jscoverage['/util.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['160'][5].init(59, 26, 'obj[keyName] !== undefined');
function visit215_160_5(result) {
  _$jscoverage['/util.js'].branchData['160'][5].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['160'][4].init(37, 17, 'obj !== undefined');
function visit214_160_4(result) {
  _$jscoverage['/util.js'].branchData['160'][4].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['160'][3].init(21, 12, 'obj !== null');
function visit213_160_3(result) {
  _$jscoverage['/util.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['160'][2].init(21, 33, 'obj !== null && obj !== undefined');
function visit212_160_2(result) {
  _$jscoverage['/util.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['160'][1].init(21, 64, '(obj !== null && obj !== undefined) && obj[keyName] !== undefined');
function visit211_160_1(result) {
  _$jscoverage['/util.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['154'][3].init(71, 23, 'b[COMPARE_MARKER] === a');
function visit210_154_3(result) {
  _$jscoverage['/util.js'].branchData['154'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['154'][2].init(44, 23, 'a[COMPARE_MARKER] === b');
function visit209_154_2(result) {
  _$jscoverage['/util.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['154'][1].init(44, 50, 'a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a');
function visit208_154_1(result) {
  _$jscoverage['/util.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['142'][2].init(49, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit207_142_2(result) {
  _$jscoverage['/util.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['142'][1].init(42, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit206_142_1(result) {
  _$jscoverage['/util.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['141'][2].init(22, 18, 'k !== CLONE_MARKER');
function visit205_141_2(result) {
  _$jscoverage['/util.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['141'][1].init(22, 95, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit204_141_1(result) {
  _$jscoverage['/util.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['138'][1].init(2074, 13, 'isPlainObject');
function visit203_138_1(result) {
  _$jscoverage['/util.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['135'][1].init(29, 22, 'i < destination.length');
function visit202_135_1(result) {
  _$jscoverage['/util.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['134'][1].init(1895, 7, 'isArray');
function visit201_134_1(result) {
  _$jscoverage['/util.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['110'][1].init(90, 63, 'S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit200_110_1(result) {
  _$jscoverage['/util.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['107'][1].init(499, 25, 'typeof input === \'object\'');
function visit199_107_1(result) {
  _$jscoverage['/util.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['104'][1].init(372, 19, 'input[CLONE_MARKER]');
function visit198_104_1(result) {
  _$jscoverage['/util.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['97'][1].init(128, 6, '!input');
function visit197_97_1(result) {
  _$jscoverage['/util.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['78'][1].init(81, 15, 'v[CLONE_MARKER]');
function visit196_78_1(result) {
  _$jscoverage['/util.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['56'][1].init(943, 7, 'a === b');
function visit195_56_1(result) {
  _$jscoverage['/util.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['52'][3].init(779, 21, 'typeof b === \'object\'');
function visit194_52_3(result) {
  _$jscoverage['/util.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['52'][2].init(754, 21, 'typeof a === \'object\'');
function visit193_52_2(result) {
  _$jscoverage['/util.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['52'][1].init(754, 46, 'typeof a === \'object\' && typeof b === \'object\'');
function visit192_52_1(result) {
  _$jscoverage['/util.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['50'][1].init(25, 7, 'a === b');
function visit191_50_1(result) {
  _$jscoverage['/util.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['49'][3].init(665, 21, 'typeof b === \'number\'');
function visit190_49_3(result) {
  _$jscoverage['/util.js'].branchData['49'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['49'][2].init(640, 21, 'typeof a === \'number\'');
function visit189_49_2(result) {
  _$jscoverage['/util.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['49'][1].init(640, 46, 'typeof a === \'number\' && typeof b === \'number\'');
function visit188_49_1(result) {
  _$jscoverage['/util.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['47'][1].init(25, 7, 'a === b');
function visit187_47_1(result) {
  _$jscoverage['/util.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['46'][3].init(551, 21, 'typeof b === \'string\'');
function visit186_46_3(result) {
  _$jscoverage['/util.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['46'][2].init(526, 21, 'typeof a === \'string\'');
function visit185_46_2(result) {
  _$jscoverage['/util.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['46'][1].init(526, 46, 'typeof a === \'string\' && typeof b === \'string\'');
function visit184_46_1(result) {
  _$jscoverage['/util.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['44'][1].init(24, 27, 'a.getTime() === b.getTime()');
function visit183_44_1(result) {
  _$jscoverage['/util.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['43'][1].init(402, 38, 'a instanceof Date && b instanceof Date');
function visit182_43_1(result) {
  _$jscoverage['/util.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['41'][3].init(75, 9, 'b == null');
function visit181_41_3(result) {
  _$jscoverage['/util.js'].branchData['41'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['41'][2].init(62, 9, 'a == null');
function visit180_41_2(result) {
  _$jscoverage['/util.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['41'][1].init(62, 22, 'a == null && b == null');
function visit179_41_1(result) {
  _$jscoverage['/util.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][7].init(273, 10, 'b === null');
function visit178_39_7(result) {
  _$jscoverage['/util.js'].branchData['39'][7].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][6].init(254, 15, 'b === undefined');
function visit177_39_6(result) {
  _$jscoverage['/util.js'].branchData['39'][6].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][5].init(254, 29, 'b === undefined || b === null');
function visit176_39_5(result) {
  _$jscoverage['/util.js'].branchData['39'][5].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][4].init(240, 10, 'a === null');
function visit175_39_4(result) {
  _$jscoverage['/util.js'].branchData['39'][4].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][3].init(240, 43, 'a === null || b === undefined || b === null');
function visit174_39_3(result) {
  _$jscoverage['/util.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][2].init(221, 15, 'a === undefined');
function visit173_39_2(result) {
  _$jscoverage['/util.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][1].init(221, 62, 'a === undefined || a === null || b === undefined || b === null');
function visit172_39_1(result) {
  _$jscoverage['/util.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['36'][1].init(151, 7, 'a === b');
function visit171_36_1(result) {
  _$jscoverage['/util.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['34'][1].init(112, 20, 'mismatchValues || []');
function visit170_34_1(result) {
  _$jscoverage['/util.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['33'][1].init(63, 18, 'mismatchKeys || []');
function visit169_33_1(result) {
  _$jscoverage['/util.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util.js'].functionData[0]++;
  _$jscoverage['/util.js'].lineData[8]++;
  var TRUE = true, FALSE = false, CLONE_MARKER = '__~ks_cloned', COMPARE_MARKER = '__~ks_compared';
  _$jscoverage['/util.js'].lineData[13]++;
  require('util/array');
  _$jscoverage['/util.js'].lineData[14]++;
  require('util/escape');
  _$jscoverage['/util.js'].lineData[15]++;
  require('util/function');
  _$jscoverage['/util.js'].lineData[16]++;
  require('util/object');
  _$jscoverage['/util.js'].lineData[17]++;
  require('util/string');
  _$jscoverage['/util.js'].lineData[18]++;
  require('util/type');
  _$jscoverage['/util.js'].lineData[19]++;
  require('util/web');
  _$jscoverage['/util.js'].lineData[21]++;
  S.mix(S, {
  equals: function(a, b, mismatchKeys, mismatchValues) {
  _$jscoverage['/util.js'].functionData[1]++;
  _$jscoverage['/util.js'].lineData[33]++;
  mismatchKeys = visit169_33_1(mismatchKeys || []);
  _$jscoverage['/util.js'].lineData[34]++;
  mismatchValues = visit170_34_1(mismatchValues || []);
  _$jscoverage['/util.js'].lineData[36]++;
  if (visit171_36_1(a === b)) {
    _$jscoverage['/util.js'].lineData[37]++;
    return TRUE;
  }
  _$jscoverage['/util.js'].lineData[39]++;
  if (visit172_39_1(visit173_39_2(a === undefined) || visit174_39_3(visit175_39_4(a === null) || visit176_39_5(visit177_39_6(b === undefined) || visit178_39_7(b === null))))) {
    _$jscoverage['/util.js'].lineData[41]++;
    return visit179_41_1(visit180_41_2(a == null) && visit181_41_3(b == null));
  }
  _$jscoverage['/util.js'].lineData[43]++;
  if (visit182_43_1(a instanceof Date && b instanceof Date)) {
    _$jscoverage['/util.js'].lineData[44]++;
    return visit183_44_1(a.getTime() === b.getTime());
  }
  _$jscoverage['/util.js'].lineData[46]++;
  if (visit184_46_1(visit185_46_2(typeof a === 'string') && visit186_46_3(typeof b === 'string'))) {
    _$jscoverage['/util.js'].lineData[47]++;
    return (visit187_47_1(a === b));
  }
  _$jscoverage['/util.js'].lineData[49]++;
  if (visit188_49_1(visit189_49_2(typeof a === 'number') && visit190_49_3(typeof b === 'number'))) {
    _$jscoverage['/util.js'].lineData[50]++;
    return (visit191_50_1(a === b));
  }
  _$jscoverage['/util.js'].lineData[52]++;
  if (visit192_52_1(visit193_52_2(typeof a === 'object') && visit194_52_3(typeof b === 'object'))) {
    _$jscoverage['/util.js'].lineData[53]++;
    return compareObjects(a, b, mismatchKeys, mismatchValues);
  }
  _$jscoverage['/util.js'].lineData[56]++;
  return (visit195_56_1(a === b));
}, 
  clone: function(input, filter) {
  _$jscoverage['/util.js'].functionData[2]++;
  _$jscoverage['/util.js'].lineData[73]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/util.js'].lineData[75]++;
  S.each(memory, function(v) {
  _$jscoverage['/util.js'].functionData[3]++;
  _$jscoverage['/util.js'].lineData[77]++;
  v = v.input;
  _$jscoverage['/util.js'].lineData[78]++;
  if (visit196_78_1(v[CLONE_MARKER])) {
    _$jscoverage['/util.js'].lineData[79]++;
    try {
      _$jscoverage['/util.js'].lineData[80]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/util.js'].lineData[82]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/util.js'].lineData[86]++;
  memory = null;
  _$jscoverage['/util.js'].lineData[87]++;
  return ret;
}});
  _$jscoverage['/util.js'].lineData[91]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/util.js'].functionData[4]++;
    _$jscoverage['/util.js'].lineData[92]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/util.js'].lineData[97]++;
    if (visit197_97_1(!input)) {
      _$jscoverage['/util.js'].lineData[98]++;
      return destination;
    }
    _$jscoverage['/util.js'].lineData[104]++;
    if (visit198_104_1(input[CLONE_MARKER])) {
      _$jscoverage['/util.js'].lineData[106]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/util.js'].lineData[107]++;
      if (visit199_107_1(typeof input === 'object')) {
        _$jscoverage['/util.js'].lineData[109]++;
        var Constructor = input.constructor;
        _$jscoverage['/util.js'].lineData[110]++;
        if (visit200_110_1(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/util.js'].lineData[111]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/util.js'].lineData[112]++;
          if ((isArray = S.isArray(input))) {
            _$jscoverage['/util.js'].lineData[114]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/util.js'].lineData[115]++;
            if ((isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/util.js'].lineData[116]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/util.js'].lineData[122]++;
        input[CLONE_MARKER] = (stamp = S.guid('c'));
        _$jscoverage['/util.js'].lineData[124]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/util.js'].lineData[134]++;
    if (visit201_134_1(isArray)) {
      _$jscoverage['/util.js'].lineData[135]++;
      for (var i = 0; visit202_135_1(i < destination.length); i++) {
        _$jscoverage['/util.js'].lineData[136]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/util.js'].lineData[138]++;
      if (visit203_138_1(isPlainObject)) {
        _$jscoverage['/util.js'].lineData[139]++;
        for (k in input) {
          _$jscoverage['/util.js'].lineData[141]++;
          if (visit204_141_1(visit205_141_2(k !== CLONE_MARKER) && (visit206_142_1(!f || (visit207_142_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/util.js'].lineData[143]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/util.js'].lineData[149]++;
    return destination;
  }
  _$jscoverage['/util.js'].lineData[152]++;
  function compareObjects(a, b, mismatchKeys, mismatchValues) {
    _$jscoverage['/util.js'].functionData[5]++;
    _$jscoverage['/util.js'].lineData[154]++;
    if (visit208_154_1(visit209_154_2(a[COMPARE_MARKER] === b) && visit210_154_3(b[COMPARE_MARKER] === a))) {
      _$jscoverage['/util.js'].lineData[155]++;
      return TRUE;
    }
    _$jscoverage['/util.js'].lineData[157]++;
    a[COMPARE_MARKER] = b;
    _$jscoverage['/util.js'].lineData[158]++;
    b[COMPARE_MARKER] = a;
    _$jscoverage['/util.js'].lineData[159]++;
    var hasKey = function(obj, keyName) {
  _$jscoverage['/util.js'].functionData[6]++;
  _$jscoverage['/util.js'].lineData[160]++;
  return visit211_160_1((visit212_160_2(visit213_160_3(obj !== null) && visit214_160_4(obj !== undefined))) && visit215_160_5(obj[keyName] !== undefined));
};
    _$jscoverage['/util.js'].lineData[162]++;
    for (var property in b) {
      _$jscoverage['/util.js'].lineData[164]++;
      if (visit216_164_1(!hasKey(a, property) && hasKey(b, property))) {
        _$jscoverage['/util.js'].lineData[165]++;
        mismatchKeys.push('expected has key ' + property + '", but missing from actual.');
      }
    }
    _$jscoverage['/util.js'].lineData[169]++;
    for (property in a) {
      _$jscoverage['/util.js'].lineData[171]++;
      if (visit217_171_1(!hasKey(b, property) && hasKey(a, property))) {
        _$jscoverage['/util.js'].lineData[172]++;
        mismatchKeys.push('expected missing key "' + property + '", but present in actual.');
      }
    }
    _$jscoverage['/util.js'].lineData[176]++;
    for (property in b) {
      _$jscoverage['/util.js'].lineData[178]++;
      if (visit218_178_1(property === COMPARE_MARKER)) {
        _$jscoverage['/util.js'].lineData[179]++;
        continue;
      }
      _$jscoverage['/util.js'].lineData[181]++;
      if (visit219_181_1(!S.equals(a[property], b[property], mismatchKeys, mismatchValues))) {
        _$jscoverage['/util.js'].lineData[182]++;
        mismatchValues.push('"' + property + '" was "' + (b[property] ? (b[property].toString()) : b[property]) + '" in expected, but was "' + (a[property] ? (a[property].toString()) : a[property]) + '" in actual.');
      }
    }
    _$jscoverage['/util.js'].lineData[189]++;
    if (visit220_189_1(S.isArray(a) && visit221_189_2(S.isArray(b) && visit222_189_3(a.length !== b.length)))) {
      _$jscoverage['/util.js'].lineData[190]++;
      mismatchValues.push('arrays were not the same length');
    }
    _$jscoverage['/util.js'].lineData[192]++;
    delete a[COMPARE_MARKER];
    _$jscoverage['/util.js'].lineData[193]++;
    delete b[COMPARE_MARKER];
    _$jscoverage['/util.js'].lineData[194]++;
    return (visit223_194_1(visit224_194_2(mismatchKeys.length === 0) && visit225_194_3(mismatchValues.length === 0)));
  }
  _$jscoverage['/util.js'].lineData[197]++;
  return S;
});
