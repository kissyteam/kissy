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
if (! _$jscoverage['/combobox/combobox-xtpl.js']) {
  _$jscoverage['/combobox/combobox-xtpl.js'] = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[180] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].functionData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].branchData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['79'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['168'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['168'][1] = new BranchData();
}
_$jscoverage['/combobox/combobox-xtpl.js'].branchData['168'][1].init(6845, 37, 'commandRet32 && commandRet32.isBuffer');
function visit8_168_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'][1].init(5365, 37, 'commandRet24 && commandRet24.isBuffer');
function visit7_128_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['97'][1].init(3990, 37, 'commandRet17 && commandRet17.isBuffer');
function visit6_97_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['79'][1].init(969, 37, 'commandRet14 && commandRet14.isBuffer');
function visit5_79_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'][1].init(379, 37, 'commandRet11 && commandRet11.isBuffer');
function visit4_66_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'][1].init(1786, 35, 'commandRet5 && commandRet5.isBuffer');
function visit3_43_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['30'][1].init(1260, 35, 'commandRet2 && commandRet2.isBuffer');
function visit2_30_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit1_8_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8]++;
  if (visit1_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27]++;
  params1.push('invalid-el');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30]++;
  if (visit2_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35]++;
  buffer.write('">\n    <div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40]++;
  params4.push('invalid-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43]++;
  if (visit3_43_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44]++;
    buffer = commandRet5;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48]++;
  buffer.write('"></div>\n</div>\n\n');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52]++;
  var params7 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53]++;
  var id8 = scope.resolve(["hasTrigger"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54]++;
  params7.push(id8);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55]++;
  option6.params = params7;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56]++;
  option6.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58]++;
  buffer.write('\n<div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62]++;
  var params10 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63]++;
  params10.push('trigger');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64]++;
  option9.params = params10;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65]++;
  var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 6);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66]++;
  if (visit4_66_1(commandRet11 && commandRet11.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67]++;
    buffer = commandRet11;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68]++;
    commandRet11 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70]++;
  buffer.write(commandRet11, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71]++;
  buffer.write('">\n    <div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75]++;
  var params13 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76]++;
  params13.push('trigger-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77]++;
  option12.params = params13;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78]++;
  var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79]++;
  if (visit5_79_1(commandRet14 && commandRet14.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80]++;
    buffer = commandRet14;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81]++;
    commandRet14 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[83]++;
  buffer.write(commandRet14, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84]++;
  buffer.write('">&#x25BC;</div>\n</div>\n');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88]++;
  buffer = ifCommand.call(engine, scope, option6, buffer, 5, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89]++;
  buffer.write('\n\n<div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93]++;
  var params16 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94]++;
  params16.push('input-wrap');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95]++;
  option15.params = params16;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96]++;
  var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97]++;
  if (visit6_97_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98]++;
    buffer = commandRet17;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[101]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102]++;
  buffer.write('">\n\n    <input id="ks-combobox-input-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104]++;
  buffer.write(id18, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105]++;
  buffer.write('"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[109]++;
  var params20 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110]++;
  var id21 = scope.resolve(["disabled"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111]++;
  params20.push(id21);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112]++;
  option19.params = params20;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113]++;
  option19.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115]++;
  buffer.write('\n    disabled\n    ');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[117]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119]++;
  buffer = ifCommand.call(engine, scope, option19, buffer, 20, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120]++;
  buffer.write('\n\n    autocomplete="off"\n    class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124]++;
  var params23 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125]++;
  params23.push('input');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126]++;
  option22.params = params23;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127]++;
  var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 25);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128]++;
  if (visit7_128_1(commandRet24 && commandRet24.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129]++;
    buffer = commandRet24;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130]++;
    commandRet24 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[132]++;
  buffer.write(commandRet24, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133]++;
  buffer.write('"\n\n    value="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134]++;
  var id25 = scope.resolve(["value"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135]++;
  buffer.write(id25, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[136]++;
  buffer.write('"\n    />\n\n\n    <label for="ks-combobox-input-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137]++;
  var id26 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138]++;
  buffer.write(id26, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[139]++;
  buffer.write('"\n            style=\'display:');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[140]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[143]++;
  var params28 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[144]++;
  var id29 = scope.resolve(["value"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[145]++;
  params28.push(id29);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[146]++;
  option27.params = params28;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[147]++;
  option27.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[149]++;
  buffer.write('none');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[151]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[153]++;
  option27.inverse = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[155]++;
  buffer.write('block');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[157]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[159]++;
  buffer = ifCommand.call(engine, scope, option27, buffer, 32, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[160]++;
  buffer.write(';\'\n    class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[161]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[164]++;
  var params31 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[165]++;
  params31.push('placeholder');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[166]++;
  option30.params = params31;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[167]++;
  var commandRet32 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 33);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[168]++;
  if (visit8_168_1(commandRet32 && commandRet32.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[169]++;
    buffer = commandRet32;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[170]++;
    commandRet32 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[172]++;
  buffer.write(commandRet32, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[173]++;
  buffer.write('">\n    ');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[174]++;
  var id33 = scope.resolve(["placeholder"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[175]++;
  buffer.write(id33, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[176]++;
  buffer.write('\n    </label>\n</div>\n');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[177]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[179]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[180]++;
  return t;
});
