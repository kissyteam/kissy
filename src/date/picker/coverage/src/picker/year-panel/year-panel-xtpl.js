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
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js']) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['62'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['90'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['106'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['122'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['135'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['151'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['151'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['151'][1].init(6932, 37, 'commandRet33 && commandRet33.isBuffer');
function visit88_151_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['135'][1].init(6104, 37, 'commandRet29 && commandRet29.isBuffer');
function visit87_135_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['122'][1].init(5571, 37, 'commandRet26 && commandRet26.isBuffer');
function visit86_122_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['106'][1].init(4821, 37, 'commandRet22 && commandRet22.isBuffer');
function visit85_106_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['90'][1].init(4092, 37, 'commandRet18 && commandRet18.isBuffer');
function visit84_90_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['62'][1].init(2698, 37, 'commandRet10 && commandRet10.isBuffer');
function visit83_62_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'][1].init(1952, 35, 'commandRet6 && commandRet6.isBuffer');
function visit82_46_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['30'][1].init(1254, 35, 'commandRet2 && commandRet2.isBuffer');
function visit81_30_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
function visit80_8_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[8]++;
  if (visit80_8_1("1.50" !== S.version)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27]++;
  params1.push('header');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30]++;
  if (visit81_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35]++;
  buffer.write('">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37]++;
  buffer.write(id3, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39]++;
  var option4 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42]++;
  var params5 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43]++;
  params5.push('prev-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44]++;
  option4.params = params5;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45]++;
  var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46]++;
  if (visit82_46_1(commandRet6 && commandRet6.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47]++;
    buffer = commandRet6;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48]++;
    commandRet6 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50]++;
  buffer.write(commandRet6, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\n       href="#"\n       role="button"\n       title="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52]++;
  var id7 = scope.resolve(["previousDecadeLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53]++;
  buffer.write(id7, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n\n    <a class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58]++;
  var params9 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59]++;
  params9.push('decade-select');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60]++;
  option8.params = params9;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61]++;
  var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 10);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62]++;
  if (visit83_62_1(commandRet10 && commandRet10.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63]++;
    buffer = commandRet10;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64]++;
    commandRet10 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66]++;
  buffer.write(commandRet10, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67]++;
  buffer.write('"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68]++;
  var id11 = scope.resolve(["decadeSelectLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69]++;
  buffer.write(id11, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70]++;
  buffer.write('"\n       id="ks-date-picker-year-panel-decade-select-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71]++;
  var id12 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72]++;
  buffer.write(id12, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73]++;
  buffer.write('">\n            <span id="ks-date-picker-year-panel-decade-select-content-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74]++;
  var id13 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75]++;
  buffer.write(id13, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76]++;
  buffer.write('">\n                ');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77]++;
  var id14 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79]++;
  buffer.write('-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80]++;
  var id15 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81]++;
  buffer.write(id15, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82]++;
  buffer.write('\n            </span>\n        <span class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87]++;
  params17.push('decade-select-arrow');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89]++;
  var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 19);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90]++;
  if (visit84_90_1(commandRet18 && commandRet18.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91]++;
    buffer = commandRet18;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92]++;
    commandRet18 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94]++;
  buffer.write(commandRet18, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95]++;
  buffer.write('">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96]++;
  var id19 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97]++;
  buffer.write(id19, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99]++;
  var option20 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102]++;
  var params21 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103]++;
  params21.push('next-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104]++;
  option20.params = params21;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105]++;
  var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 23);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106]++;
  if (visit85_106_1(commandRet22 && commandRet22.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107]++;
    buffer = commandRet22;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108]++;
    commandRet22 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[110]++;
  buffer.write(commandRet22, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111]++;
  buffer.write('"\n       href="#"\n       role="button"\n       title="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112]++;
  var id23 = scope.resolve(["nextDecadeLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113]++;
  buffer.write(id23, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[114]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118]++;
  var params25 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119]++;
  params25.push('body');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120]++;
  option24.params = params25;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[121]++;
  var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 30);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[122]++;
  if (visit86_122_1(commandRet26 && commandRet26.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123]++;
    buffer = commandRet26;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[124]++;
    commandRet26 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[126]++;
  buffer.write(commandRet26, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127]++;
  buffer.write('">\n    <table class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[131]++;
  var params28 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132]++;
  params28.push('table');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133]++;
  option27.params = params28;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[134]++;
  var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 31);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[135]++;
  if (visit87_135_1(commandRet29 && commandRet29.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[136]++;
    buffer = commandRet29;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137]++;
    commandRet29 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[139]++;
  buffer.write(commandRet29, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140]++;
  buffer.write('" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141]++;
  var id30 = scope.resolve(["id"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142]++;
  buffer.write(id30, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[143]++;
  buffer.write('">\n        ');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[144]++;
  var option31 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[145]++;
  var params32 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146]++;
  params32.push('date/picker/year-panel/years-xtpl');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147]++;
  option31.params = params32;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[148]++;
  require("date/picker/year-panel/years-xtpl");
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[149]++;
  option31.params[0] = module.resolve(option31.params[0]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[150]++;
  var commandRet33 = includeCommand.call(engine, scope, option31, buffer, 33, payload);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151]++;
  if (visit88_151_1(commandRet33 && commandRet33.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[152]++;
    buffer = commandRet33;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[153]++;
    commandRet33 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155]++;
  buffer.write(commandRet33, false);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156]++;
  buffer.write('\n        </tbody>\n    </table>\n</div>');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[159]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160]++;
  return t;
});
