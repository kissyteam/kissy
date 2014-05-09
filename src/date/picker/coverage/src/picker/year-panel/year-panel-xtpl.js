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
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[179] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['60'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['77'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['97'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['111'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['128'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['142'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['156'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['169'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['169'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['169'][1].init(7038, 31, 'callRet34 && callRet34.isBuffer');
function visit47_169_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['156'][1].init(6521, 31, 'callRet31 && callRet31.isBuffer');
function visit46_156_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['142'][1].init(5950, 31, 'callRet28 && callRet28.isBuffer');
function visit45_142_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['128'][1].init(5411, 31, 'callRet25 && callRet25.isBuffer');
function visit44_128_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['111'][1].init(4637, 31, 'callRet21 && callRet21.isBuffer');
function visit43_111_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['97'][1].init(4068, 31, 'callRet18 && callRet18.isBuffer');
function visit42_97_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['77'][1].init(3216, 31, 'callRet13 && callRet13.isBuffer');
function visit41_77_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['60'][1].init(2437, 29, 'callRet9 && callRet9.isBuffer');
function visit40_60_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'][1].init(1670, 29, 'callRet5 && callRet5.isBuffer');
function visit39_43_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['29'][1].init(1139, 29, 'callRet2 && callRet2.isBuffer');
function visit38_29_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4]++;
  var yearPanel = function(scope, buffer, undefined) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[20]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[25]++;
  params1.push('header');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27]++;
  var callRet2;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28]++;
  callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29]++;
  if (visit38_29_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30]++;
    buffer = callRet2;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31]++;
    callRet2 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33]++;
  buffer.write(callRet2, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34]++;
  buffer.write('">\r\n    <a class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39]++;
  params4.push('prev-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40]++;
  option3.params = params4;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41]++;
  var callRet5;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42]++;
  callRet5 = callFnUtil(tpl, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43]++;
  if (visit39_43_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44]++;
    buffer = callRet5;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45]++;
    callRet5 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47]++;
  buffer.write(callRet5, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49]++;
  var id6 = scope.resolve(["previousDecadeLabel"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50]++;
  buffer.write(id6, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55]++;
  var params8 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[56]++;
  params8.push('decade-select');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[57]++;
  option7.params = params8;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58]++;
  var callRet9;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59]++;
  callRet9 = callFnUtil(tpl, scope, option7, buffer, ["getBaseCssClasses"], 0, 9);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60]++;
  if (visit40_60_1(callRet9 && callRet9.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61]++;
    buffer = callRet9;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62]++;
    callRet9 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64]++;
  buffer.write(callRet9, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65]++;
  buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66]++;
  var id10 = scope.resolve(["decadeSelectLabel"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67]++;
  buffer.write(id10, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68]++;
  buffer.write('">\r\n            <span class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73]++;
  params12.push('decade-select-content');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74]++;
  option11.params = params12;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75]++;
  var callRet13;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76]++;
  callRet13 = callFnUtil(tpl, scope, option11, buffer, ["getBaseCssClasses"], 0, 14);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77]++;
  if (visit41_77_1(callRet13 && callRet13.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78]++;
    buffer = callRet13;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79]++;
    callRet13 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81]++;
  buffer.write(callRet13, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82]++;
  buffer.write('">\r\n                ', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83]++;
  var id14 = scope.resolve(["startYear"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85]++;
  buffer.write('-', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86]++;
  var id15 = scope.resolve(["endYear"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87]++;
  buffer.write(id15, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88]++;
  buffer.write('\r\n            </span>\r\n        <span class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93]++;
  params17.push('decade-select-arrow');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95]++;
  var callRet18;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96]++;
  callRet18 = callFnUtil(tpl, scope, option16, buffer, ["getBaseCssClasses"], 0, 17);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97]++;
  if (visit42_97_1(callRet18 && callRet18.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98]++;
    buffer = callRet18;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99]++;
    callRet18 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101]++;
  buffer.write(callRet18, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102]++;
  buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106]++;
  var params20 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107]++;
  params20.push('next-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108]++;
  option19.params = params20;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109]++;
  var callRet21;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[110]++;
  callRet21 = callFnUtil(tpl, scope, option19, buffer, ["getBaseCssClasses"], 0, 20);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111]++;
  if (visit43_111_1(callRet21 && callRet21.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112]++;
    buffer = callRet21;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113]++;
    callRet21 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115]++;
  buffer.write(callRet21, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[117]++;
  var id22 = scope.resolve(["nextDecadeLabel"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118]++;
  buffer.write(id22, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123]++;
  var params24 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[124]++;
  params24.push('body');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[125]++;
  option23.params = params24;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[126]++;
  var callRet25;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127]++;
  callRet25 = callFnUtil(tpl, scope, option23, buffer, ["getBaseCssClasses"], 0, 27);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128]++;
  if (visit44_128_1(callRet25 && callRet25.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[129]++;
    buffer = callRet25;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[130]++;
    callRet25 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132]++;
  buffer.write(callRet25, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133]++;
  buffer.write('">\r\n    <table class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[134]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137]++;
  var params27 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[138]++;
  params27.push('table');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[139]++;
  option26.params = params27;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140]++;
  var callRet28;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141]++;
  callRet28 = callFnUtil(tpl, scope, option26, buffer, ["getBaseCssClasses"], 0, 28);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142]++;
  if (visit45_142_1(callRet28 && callRet28.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[143]++;
    buffer = callRet28;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[144]++;
    callRet28 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146]++;
  buffer.write(callRet28, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[148]++;
  var option29 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151]++;
  var params30 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[152]++;
  params30.push('tbody');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[153]++;
  option29.params = params30;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[154]++;
  var callRet31;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155]++;
  callRet31 = callFnUtil(tpl, scope, option29, buffer, ["getBaseCssClasses"], 0, 29);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156]++;
  if (visit46_156_1(callRet31 && callRet31.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157]++;
    buffer = callRet31;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[158]++;
    callRet31 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160]++;
  buffer.write(callRet31, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[161]++;
  buffer.write('">\r\n        ', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[162]++;
  var option32 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[163]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[164]++;
  params33.push('./years-xtpl');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[165]++;
  option32.params = params33;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[166]++;
  require("./years-xtpl");
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[167]++;
  var callRet34;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[168]++;
  callRet34 = includeCommand.call(tpl, scope, option32, buffer, 30);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[169]++;
  if (visit47_169_1(callRet34 && callRet34.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[170]++;
    buffer = callRet34;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[171]++;
    callRet34 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[173]++;
  buffer.write(callRet34, false);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[174]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[175]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[177]++;
  yearPanel.TPL_NAME = module.name;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[178]++;
  yearPanel.version = "5.0.0";
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[179]++;
  return yearPanel;
});
