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
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js']) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'] = {};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[183] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[185] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[189] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['51'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['64'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['70'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['85'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['103'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['116'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['134'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['147'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['165'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['165'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['165'][1].init(5834, 37, 'commandRet40 && commandRet40.isBuffer');
function visit25_165_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['147'][1].init(464, 37, 'commandRet37 && commandRet37.isBuffer');
function visit24_147_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['134'][1].init(4244, 14, '(id32) > (id33)');
function visit23_134_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['116'][1].init(464, 37, 'commandRet29 && commandRet29.isBuffer');
function visit22_116_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['103'][1].init(2807, 14, '(id24) < (id25)');
function visit21_103_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['85'][1].init(459, 37, 'commandRet21 && commandRet21.isBuffer');
function visit20_85_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['70'][1].init(201, 15, '(id15) <= (id16)');
function visit19_70_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['64'][1].init(1018, 15, '(id12) <= (id13)');
function visit18_64_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['51'][1].init(440, 35, 'commandRet9 && commandRet9.isBuffer');
function visit17_51_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit16_8_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[8]++;
  if (visit16_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[22]++;
  buffer.write('');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[27]++;
  var id2 = scope.resolve(["decades"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[28]++;
  params1.push(id2);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[29]++;
  option0.params = params1;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[30]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[32]++;
  buffer.write('\r\n<tr role="row">\r\n    ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[33]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[36]++;
  var params4 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[37]++;
  var id6 = scope.resolve(["xindex"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[38]++;
  var id5 = scope.resolve(["decades", id6]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[39]++;
  params4.push(id5);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[40]++;
  option3.params = params4;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[41]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[43]++;
  buffer.write('\r\n    <td role="gridcell"\r\n        class="');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[44]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[47]++;
  var params8 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[48]++;
  params8.push('cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[49]++;
  option7.params = params8;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[50]++;
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 5);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[51]++;
  if (visit17_51_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[52]++;
    buffer = commandRet9;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[53]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[55]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[56]++;
  buffer.write('\r\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[57]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[60]++;
  var params11 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[61]++;
  var id12 = scope.resolve(["startDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[62]++;
  var exp14 = id12;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[63]++;
  var id13 = scope.resolve(["year"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[64]++;
  exp14 = visit18_64_1((id12) <= (id13));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[65]++;
  var exp18 = exp14;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[66]++;
  if ((exp14)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[67]++;
    var id15 = scope.resolve(["year"]);
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[68]++;
    var exp17 = id15;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[69]++;
    var id16 = scope.resolve(["endDecade"]);
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[70]++;
    exp17 = visit19_70_1((id15) <= (id16));
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[71]++;
    exp18 = exp17;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[73]++;
  params11.push(exp18);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[74]++;
  option10.params = params11;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[75]++;
  option10.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[77]++;
  buffer.write('\r\n         ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[78]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[81]++;
  var params20 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[82]++;
  params20.push('selected-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[83]++;
  option19.params = params20;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[84]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[85]++;
  if (visit20_85_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[86]++;
    buffer = commandRet21;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[87]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[89]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[90]++;
  buffer.write('\r\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[92]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[94]++;
  buffer = ifCommand.call(engine, scope, option10, buffer, 6, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[95]++;
  buffer.write('\r\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[96]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[99]++;
  var params23 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[100]++;
  var id24 = scope.resolve(["startDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[101]++;
  var exp26 = id24;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[102]++;
  var id25 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[103]++;
  exp26 = visit21_103_1((id24) < (id25));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[104]++;
  params23.push(exp26);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[105]++;
  option22.params = params23;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[106]++;
  option22.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[108]++;
  buffer.write('\r\n         ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[109]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[112]++;
  var params28 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[113]++;
  params28.push('last-century-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[114]++;
  option27.params = params28;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[115]++;
  var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 10);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[116]++;
  if (visit22_116_1(commandRet29 && commandRet29.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[117]++;
    buffer = commandRet29;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[118]++;
    commandRet29 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[120]++;
  buffer.write(commandRet29, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[121]++;
  buffer.write('\r\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[123]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[125]++;
  buffer = ifCommand.call(engine, scope, option22, buffer, 9, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[126]++;
  buffer.write('\r\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[127]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[130]++;
  var params31 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[131]++;
  var id32 = scope.resolve(["endDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[132]++;
  var exp34 = id32;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[133]++;
  var id33 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[134]++;
  exp34 = visit23_134_1((id32) > (id33));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[135]++;
  params31.push(exp34);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[136]++;
  option30.params = params31;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[137]++;
  option30.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[139]++;
  buffer.write('\r\n         ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[140]++;
  var option35 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[143]++;
  var params36 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[144]++;
  params36.push('next-century-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[145]++;
  option35.params = params36;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[146]++;
  var commandRet37 = callCommandUtil(engine, scope, option35, buffer, "getBaseCssClasses", 13);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[147]++;
  if (visit24_147_1(commandRet37 && commandRet37.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[148]++;
    buffer = commandRet37;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[149]++;
    commandRet37 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[151]++;
  buffer.write(commandRet37, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[152]++;
  buffer.write('\r\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[154]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[156]++;
  buffer = ifCommand.call(engine, scope, option30, buffer, 12, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[157]++;
  buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[158]++;
  var option38 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[161]++;
  var params39 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[162]++;
  params39.push('decade');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[163]++;
  option38.params = params39;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[164]++;
  var commandRet40 = callCommandUtil(engine, scope, option38, buffer, "getBaseCssClasses", 19);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[165]++;
  if (visit25_165_1(commandRet40 && commandRet40.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[166]++;
    buffer = commandRet40;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[167]++;
    commandRet40 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[169]++;
  buffer.write(commandRet40, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[170]++;
  buffer.write('">\r\n            ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[171]++;
  var id41 = scope.resolve(["startDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[172]++;
  buffer.write(id41, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[173]++;
  buffer.write('-');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[174]++;
  var id42 = scope.resolve(["endDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[175]++;
  buffer.write(id42, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[176]++;
  buffer.write('\r\n        </a>\r\n    </td>\r\n    ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[178]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[180]++;
  buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[181]++;
  buffer.write('\r\n</tr>\r\n');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[183]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[185]++;
  buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[186]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[188]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[189]++;
  return t;
});
