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
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[162] = 0;
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
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['33'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['65'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['90'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['106'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['122'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['135'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['148'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['153'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['153'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['153'][1].init(6980, 37, 'commandRet32 && commandRet32.isBuffer');
function visit44_153_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['148'][1].init(6697, 10, 'moduleWrap');
function visit43_148_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['135'][1].init(6091, 37, 'commandRet28 && commandRet28.isBuffer');
function visit42_135_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['122'][1].init(5558, 37, 'commandRet25 && commandRet25.isBuffer');
function visit41_122_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['106'][1].init(4810, 37, 'commandRet21 && commandRet21.isBuffer');
function visit40_106_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['90'][1].init(4080, 37, 'commandRet17 && commandRet17.isBuffer');
function visit39_90_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['65'][1].init(2825, 37, 'commandRet10 && commandRet10.isBuffer');
function visit38_65_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['49'][1].init(2077, 35, 'commandRet6 && commandRet6.isBuffer');
function visit37_49_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['33'][1].init(1382, 35, 'commandRet2 && commandRet2.isBuffer');
function visit36_33_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit35_11_2(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit34_11_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit33_8_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[8]++;
  if (visit33_8_1("1.50" !== S.version)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[11]++;
  if (visit34_11_1(visit35_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[25]++;
  buffer.write('<div class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29]++;
  var params1 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30]++;
  params1.push('header');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31]++;
  option0.params = params1;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[33]++;
  if (visit36_33_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34]++;
    buffer = commandRet2;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[37]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[38]++;
  buffer.write('">\n    <a id="ks-date-picker-month-panel-previous-year-btn-');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40]++;
  buffer.write(id3, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42]++;
  var option4 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45]++;
  var params5 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[46]++;
  params5.push('prev-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47]++;
  option4.params = params5;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48]++;
  var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49]++;
  if (visit37_49_1(commandRet6 && commandRet6.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50]++;
    buffer = commandRet6;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51]++;
    commandRet6 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[53]++;
  buffer.write(commandRet6, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[54]++;
  buffer.write('"\n       href="#"\n       role="button"\n       title="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55]++;
  var id7 = scope.resolve(["previousYearLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56]++;
  buffer.write(id7, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n\n\n        <a class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61]++;
  var params9 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[62]++;
  params9.push('year-select');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63]++;
  option8.params = params9;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64]++;
  var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65]++;
  if (visit38_65_1(commandRet10 && commandRet10.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66]++;
    buffer = commandRet10;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67]++;
    commandRet10 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[69]++;
  buffer.write(commandRet10, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[70]++;
  buffer.write('"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71]++;
  var id11 = scope.resolve(["yearSelectLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72]++;
  buffer.write(id11, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73]++;
  buffer.write('"\n           id="ks-date-picker-month-panel-year-select-');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74]++;
  var id12 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75]++;
  buffer.write(id12, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76]++;
  buffer.write('">\n            <span id="ks-date-picker-month-panel-year-select-content-');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77]++;
  var id13 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[78]++;
  buffer.write(id13, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79]++;
  buffer.write('">');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80]++;
  var id14 = scope.resolve(["year"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82]++;
  buffer.write('</span>\n            <span class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[86]++;
  var params16 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87]++;
  params16.push('year-select-arrow');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88]++;
  option15.params = params16;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89]++;
  var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 18);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90]++;
  if (visit39_90_1(commandRet17 && commandRet17.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91]++;
    buffer = commandRet17;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92]++;
    commandRet17 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[94]++;
  buffer.write(commandRet17, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95]++;
  buffer.write('">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97]++;
  buffer.write(id18, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[98]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[99]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102]++;
  var params20 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103]++;
  params20.push('next-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[104]++;
  option19.params = params20;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[105]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 22);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[106]++;
  if (visit40_106_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[107]++;
    buffer = commandRet21;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[108]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[110]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[111]++;
  buffer.write('"\n       href="#"\n       role="button"\n       title="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[112]++;
  var id22 = scope.resolve(["nextYearLabel"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[113]++;
  buffer.write(id22, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[114]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[115]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[118]++;
  var params24 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[119]++;
  params24.push('body');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[120]++;
  option23.params = params24;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[121]++;
  var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 29);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[122]++;
  if (visit41_122_1(commandRet25 && commandRet25.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[123]++;
    buffer = commandRet25;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[124]++;
    commandRet25 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[126]++;
  buffer.write(commandRet25, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[127]++;
  buffer.write('">\n    <table class="');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[128]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[131]++;
  var params27 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[132]++;
  params27.push('table');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[133]++;
  option26.params = params27;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[134]++;
  var commandRet28 = callCommandUtil(engine, scope, option26, buffer, "getBaseCssClasses", 30);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[135]++;
  if (visit42_135_1(commandRet28 && commandRet28.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[136]++;
    buffer = commandRet28;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[137]++;
    commandRet28 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[139]++;
  buffer.write(commandRet28, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[140]++;
  buffer.write('" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[141]++;
  var id29 = scope.resolve(["id"]);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[142]++;
  buffer.write(id29, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[143]++;
  buffer.write('">\n        ');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[144]++;
  var option30 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[145]++;
  var params31 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[146]++;
  params31.push('date/picker/month-panel/months-xtpl');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[147]++;
  option30.params = params31;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[148]++;
  if (visit43_148_1(moduleWrap)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[149]++;
    require("date/picker/month-panel/months-xtpl");
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[150]++;
    option30.params[0] = moduleWrap.resolve(option30.params[0]);
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[152]++;
  var commandRet32 = includeCommand.call(engine, scope, option30, buffer, 32, payload);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[153]++;
  if (visit44_153_1(commandRet32 && commandRet32.isBuffer)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[154]++;
    buffer = commandRet32;
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[155]++;
    commandRet32 = undefined;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[157]++;
  buffer.write(commandRet32, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[158]++;
  buffer.write('\n        </tbody>\n    </table>\n</div>');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[159]++;
  return buffer;
};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[161]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[162]++;
  return t;
});
