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
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[171] = 0;
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
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['59'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['75'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['94'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['123'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['136'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['149'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['162'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['162'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['162'][1].init(7169, 37, 'commandRet34 && commandRet34.isBuffer');
function visit52_162_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['149'][1].init(6578, 37, 'commandRet31 && commandRet31.isBuffer');
function visit51_149_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['136'][1].init(6011, 37, 'commandRet28 && commandRet28.isBuffer');
function visit50_136_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['123'][1].init(5476, 37, 'commandRet25 && commandRet25.isBuffer');
function visit49_123_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'][1].init(4712, 37, 'commandRet21 && commandRet21.isBuffer');
function visit48_107_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['94'][1].init(4147, 37, 'commandRet18 && commandRet18.isBuffer');
function visit47_94_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['75'][1].init(3311, 37, 'commandRet13 && commandRet13.isBuffer');
function visit46_75_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['59'][1].init(2542, 35, 'commandRet9 && commandRet9.isBuffer');
function visit45_59_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'][1].init(1784, 35, 'commandRet5 && commandRet5.isBuffer');
function visit44_43_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['30'][1].init(1256, 35, 'commandRet2 && commandRet2.isBuffer');
function visit43_30_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit42_8_1(result) {
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
  if (visit42_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
  if (visit43_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[35]++;
  buffer.write('">\r\n    <a class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[40]++;
  params4.push('prev-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43]++;
  if (visit44_43_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44]++;
    buffer = commandRet5;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[49]++;
  var id6 = scope.resolve(["previousDecadeLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50]++;
  buffer.write(id6, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
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
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59]++;
  if (visit45_59_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60]++;
    buffer = commandRet9;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64]++;
  buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65]++;
  var id10 = scope.resolve(["decadeSelectLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[66]++;
  buffer.write(id10, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67]++;
  buffer.write('">\r\n            <span class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72]++;
  params12.push('decade-select-content');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[73]++;
  option11.params = params12;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[74]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 14);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75]++;
  if (visit46_75_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76]++;
    buffer = commandRet13;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80]++;
  buffer.write('">\r\n                ');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81]++;
  var id14 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[83]++;
  buffer.write('-');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84]++;
  var id15 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85]++;
  buffer.write(id15, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86]++;
  buffer.write('\r\n            </span>\r\n        <span class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91]++;
  params17.push('decade-select-arrow');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[93]++;
  var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 17);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[94]++;
  if (visit47_94_1(commandRet18 && commandRet18.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95]++;
    buffer = commandRet18;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96]++;
    commandRet18 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98]++;
  buffer.write(commandRet18, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99]++;
  buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[103]++;
  var params20 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104]++;
  params20.push('next-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105]++;
  option19.params = params20;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 20);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[107]++;
  if (visit48_107_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[108]++;
    buffer = commandRet21;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113]++;
  var id22 = scope.resolve(["nextDecadeLabel"]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[114]++;
  buffer.write(id22, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119]++;
  var params24 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120]++;
  params24.push('body');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[121]++;
  option23.params = params24;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[122]++;
  var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 27);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123]++;
  if (visit49_123_1(commandRet25 && commandRet25.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[124]++;
    buffer = commandRet25;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[125]++;
    commandRet25 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127]++;
  buffer.write(commandRet25, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128]++;
  buffer.write('">\r\n    <table class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[129]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132]++;
  var params27 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133]++;
  params27.push('table');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[134]++;
  option26.params = params27;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[135]++;
  var commandRet28 = callCommandUtil(engine, scope, option26, buffer, "getBaseCssClasses", 28);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[136]++;
  if (visit50_136_1(commandRet28 && commandRet28.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137]++;
    buffer = commandRet28;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[138]++;
    commandRet28 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140]++;
  buffer.write(commandRet28, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142]++;
  var option29 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[145]++;
  var params30 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146]++;
  params30.push('tbody');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147]++;
  option29.params = params30;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[148]++;
  var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 29);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[149]++;
  if (visit51_149_1(commandRet31 && commandRet31.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[150]++;
    buffer = commandRet31;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151]++;
    commandRet31 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[153]++;
  buffer.write(commandRet31, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[154]++;
  buffer.write('">\r\n        ');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155]++;
  var option32 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157]++;
  params33.push('./years-xtpl');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[158]++;
  option32.params = params33;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[159]++;
  require("./years-xtpl");
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160]++;
  option32.params[0] = module.resolve(option32.params[0]);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[161]++;
  var commandRet34 = includeCommand.call(engine, scope, option32, buffer, 30, payload);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[162]++;
  if (visit52_162_1(commandRet34 && commandRet34.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[163]++;
    buffer = commandRet34;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[164]++;
    commandRet34 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[166]++;
  buffer.write(commandRet34, false);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[167]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[168]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[170]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[171]++;
  return t;
});
