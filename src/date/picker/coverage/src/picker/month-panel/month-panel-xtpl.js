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
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js']) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'] = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[168] = 0;
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['59'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['75'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['91'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['120'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['133'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['146'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['159'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['159'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['159'][1].init(6990, 37, 'commandRet33 && commandRet33.isBuffer');
function visit34_159_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['146'][1].init(6397, 37, 'commandRet30 && commandRet30.isBuffer');
function visit33_146_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['133'][1].init(5830, 37, 'commandRet27 && commandRet27.isBuffer');
function visit32_133_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['120'][1].init(5295, 37, 'commandRet24 && commandRet24.isBuffer');
function visit31_120_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'][1].init(4533, 37, 'commandRet20 && commandRet20.isBuffer');
function visit30_104_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['91'][1].init(3970, 37, 'commandRet17 && commandRet17.isBuffer');
function visit29_91_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['75'][1].init(3297, 37, 'commandRet13 && commandRet13.isBuffer');
function visit28_75_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['59'][1].init(2536, 35, 'commandRet9 && commandRet9.isBuffer');
function visit27_59_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['43'][1].init(1782, 35, 'commandRet5 && commandRet5.isBuffer');
function visit26_43_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['30'][1].init(1256, 35, 'commandRet2 && commandRet2.isBuffer');
function visit25_30_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit24_8_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[8]++;
  if (visit24_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[27]++;
  params1.push('header');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30]++;
  if (visit25_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35]++;
  buffer.write('">\r\n    <a class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40]++;
  params4.push('prev-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[43]++;
  if (visit26_43_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[44]++;
    buffer = commandRet5;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49]++;
  var id6 = scope.resolve(["previousYearLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50]++;
  buffer.write(id6, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[52]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55]++;
  var params8 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56]++;
  params8.push('year-select');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57]++;
  option7.params = params8;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58]++;
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[59]++;
  if (visit27_59_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[60]++;
    buffer = commandRet9;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64]++;
  buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65]++;
  var id10 = scope.resolve(["yearSelectLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66]++;
  buffer.write(id10, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67]++;
  buffer.write('">\r\n        <span class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[68]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71]++;
  var params12 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72]++;
  params12.push('year-select-content');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73]++;
  option11.params = params12;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 14);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75]++;
  if (visit28_75_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76]++;
    buffer = commandRet13;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80]++;
  buffer.write('">');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81]++;
  var id14 = scope.resolve(["year"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83]++;
  buffer.write('</span>\r\n        <span class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[84]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87]++;
  var params16 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88]++;
  params16.push('year-select-arrow');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89]++;
  option15.params = params16;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90]++;
  var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 15);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91]++;
  if (visit29_91_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92]++;
    buffer = commandRet17;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[93]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96]++;
  buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97]++;
  var option18 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[100]++;
  var params19 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[101]++;
  params19.push('next-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102]++;
  option18.params = params19;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103]++;
  var commandRet20 = callCommandUtil(engine, scope, option18, buffer, "getBaseCssClasses", 18);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[104]++;
  if (visit30_104_1(commandRet20 && commandRet20.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[105]++;
    buffer = commandRet20;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[106]++;
    commandRet20 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[108]++;
  buffer.write(commandRet20, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[109]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[110]++;
  var id21 = scope.resolve(["nextYearLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[111]++;
  buffer.write(id21, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[112]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[113]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[116]++;
  var params23 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[117]++;
  params23.push('body');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[118]++;
  option22.params = params23;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[119]++;
  var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 25);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[120]++;
  if (visit31_120_1(commandRet24 && commandRet24.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[121]++;
    buffer = commandRet24;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[122]++;
    commandRet24 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[124]++;
  buffer.write(commandRet24, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[125]++;
  buffer.write('">\r\n    <table class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[126]++;
  var option25 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[129]++;
  var params26 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[130]++;
  params26.push('table');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[131]++;
  option25.params = params26;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[132]++;
  var commandRet27 = callCommandUtil(engine, scope, option25, buffer, "getBaseCssClasses", 26);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[133]++;
  if (visit32_133_1(commandRet27 && commandRet27.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[134]++;
    buffer = commandRet27;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[135]++;
    commandRet27 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[137]++;
  buffer.write(commandRet27, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[138]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[139]++;
  var option28 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[142]++;
  var params29 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[143]++;
  params29.push('tbody');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[144]++;
  option28.params = params29;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[145]++;
  var commandRet30 = callCommandUtil(engine, scope, option28, buffer, "getBaseCssClasses", 27);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[146]++;
  if (visit33_146_1(commandRet30 && commandRet30.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[147]++;
    buffer = commandRet30;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[148]++;
    commandRet30 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[150]++;
  buffer.write(commandRet30, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[151]++;
  buffer.write('">\r\n        ');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[152]++;
  var option31 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[153]++;
  var params32 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[154]++;
  params32.push('./months-xtpl');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[155]++;
  option31.params = params32;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[156]++;
  require("./months-xtpl");
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[157]++;
  option31.params[0] = module.resolve(option31.params[0]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[158]++;
  var commandRet33 = includeCommand.call(engine, scope, option31, buffer, 28, payload);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[159]++;
  if (visit34_159_1(commandRet33 && commandRet33.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[160]++;
    buffer = commandRet33;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[161]++;
    commandRet33 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[163]++;
  buffer.write(commandRet33, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[164]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[165]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[167]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[168]++;
  return t;
});
