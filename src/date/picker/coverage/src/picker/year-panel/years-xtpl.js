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
if (! _$jscoverage['/picker/year-panel/years-xtpl.js']) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[177] = 0;
}
if (! _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['20'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['54'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['80'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['110'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['127'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['140'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['158'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['158'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['158'][1].init(5772, 31, 'callRet37 && callRet37.isBuffer');
function visit61_158_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['140'][1].init(496, 31, 'callRet34 && callRet34.isBuffer');
function visit60_140_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['127'][1].init(4135, 14, '(id29) > (id30)');
function visit59_127_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['110'][1].init(496, 31, 'callRet26 && callRet26.isBuffer');
function visit58_110_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['97'][1].init(2671, 14, '(id21) < (id22)');
function visit57_97_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['80'][1].init(492, 31, 'callRet18 && callRet18.isBuffer');
function visit56_80_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'][1].init(1208, 16, '(id13) === (id14)');
function visit55_67_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['54'][1].init(635, 31, 'callRet10 && callRet10.isBuffer');
function visit54_54_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['20'][1].init(802, 21, '"5.0.0" !== S.version');
function visit53_20_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20]++;
  if (visit53_20_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[23]++;
  buffer.write('', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28]++;
  var id2 = scope.resolve(["years"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29]++;
  params1.push(id2);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30]++;
  option0.params = params1;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[31]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[32]++;
  buffer.write('\r\n<tr role="row">\r\n    ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37]++;
  var id6 = scope.resolve(["xindex"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38]++;
  var id5 = scope.resolve(["years", id6], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39]++;
  params4.push(id5);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40]++;
  option3.params = params4;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42]++;
  buffer.write('\r\n    <td role="gridcell"\r\n        title="', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43]++;
  var id7 = scope.resolve(["title"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[44]++;
  buffer.write(id7, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[45]++;
  buffer.write('"\r\n        class="', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49]++;
  var params9 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50]++;
  params9.push('cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51]++;
  option8.params = params9;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52]++;
  var callRet10;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53]++;
  callRet10 = callFnUtil(engine, scope, option8, buffer, ["getBaseCssClasses"], 0, 6);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[54]++;
  if (visit54_54_1(callRet10 && callRet10.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55]++;
    buffer = callRet10;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56]++;
    callRet10 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[58]++;
  buffer.write(callRet10, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[59]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64]++;
  var id13 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65]++;
  var exp15 = id13;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66]++;
  var id14 = scope.resolve(["year"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67]++;
  exp15 = visit55_67_1((id13) === (id14));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68]++;
  params12.push(exp15);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69]++;
  option11.params = params12;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[70]++;
  option11.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[71]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78]++;
  var callRet18;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79]++;
  callRet18 = callFnUtil(engine, scope, option16, buffer, ["getBaseCssClasses"], 0, 8);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[80]++;
  if (visit56_80_1(callRet18 && callRet18.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81]++;
    buffer = callRet18;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82]++;
    callRet18 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[84]++;
  buffer.write(callRet18, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[88]++;
  buffer = ifCommand.call(engine, scope, option11, buffer, 7, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[89]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93]++;
  var params20 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94]++;
  var id21 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95]++;
  var exp23 = id21;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96]++;
  var id22 = scope.resolve(["startYear"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97]++;
  exp23 = visit57_97_1((id21) < (id22));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98]++;
  params20.push(exp23);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99]++;
  option19.params = params20;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[100]++;
  option19.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[101]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105]++;
  var params25 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106]++;
  params25.push('last-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107]++;
  option24.params = params25;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108]++;
  var callRet26;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109]++;
  callRet26 = callFnUtil(engine, scope, option24, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[110]++;
  if (visit58_110_1(callRet26 && callRet26.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111]++;
    buffer = callRet26;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112]++;
    callRet26 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[114]++;
  buffer.write(callRet26, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[118]++;
  buffer = ifCommand.call(engine, scope, option19, buffer, 10, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[119]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[123]++;
  var params28 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[124]++;
  var id29 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[125]++;
  var exp31 = id29;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[126]++;
  var id30 = scope.resolve(["endYear"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[127]++;
  exp31 = visit59_127_1((id29) > (id30));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[128]++;
  params28.push(exp31);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[129]++;
  option27.params = params28;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[130]++;
  option27.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[131]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[132]++;
  var option32 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[135]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[136]++;
  params33.push('next-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[137]++;
  option32.params = params33;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[138]++;
  var callRet34;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[139]++;
  callRet34 = callFnUtil(engine, scope, option32, buffer, ["getBaseCssClasses"], 0, 14);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[140]++;
  if (visit60_140_1(callRet34 && callRet34.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[141]++;
    buffer = callRet34;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[142]++;
    callRet34 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[144]++;
  buffer.write(callRet34, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[145]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[146]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[148]++;
  buffer = ifCommand.call(engine, scope, option27, buffer, 13, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[149]++;
  buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[150]++;
  var option35 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[153]++;
  var params36 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[154]++;
  params36.push('year');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[155]++;
  option35.params = params36;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[156]++;
  var callRet37;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[157]++;
  callRet37 = callFnUtil(engine, scope, option35, buffer, ["getBaseCssClasses"], 0, 20);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[158]++;
  if (visit61_158_1(callRet37 && callRet37.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[159]++;
    buffer = callRet37;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[160]++;
    callRet37 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[162]++;
  buffer.write(callRet37, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[163]++;
  buffer.write('">\r\n            ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[164]++;
  var id38 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[165]++;
  buffer.write(id38, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[166]++;
  buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[167]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[169]++;
  buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[170]++;
  buffer.write('\r\n</tr>\r\n', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[171]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[173]++;
  buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[174]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[176]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[177]++;
  return t;
});
