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
if (! _$jscoverage['/picker/picker-xtpl.js']) {
  _$jscoverage['/picker/picker-xtpl.js'] = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[182] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[183] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[184] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[185] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[187] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[189] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[190] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[191] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[192] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[193] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[194] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[195] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[196] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[197] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[198] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[199] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[200] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[201] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[202] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[203] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[204] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[205] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[206] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[207] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[208] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[209] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[210] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[211] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[212] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[213] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[214] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[215] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[216] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[217] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[218] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[219] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[220] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[221] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[222] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[223] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[224] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[225] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[226] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[227] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[228] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[229] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[230] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[231] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[232] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[234] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[235] = 0;
}
if (! _$jscoverage['/picker/picker-xtpl.js'].functionData) {
  _$jscoverage['/picker/picker-xtpl.js'].functionData = [];
  _$jscoverage['/picker/picker-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/picker-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/picker/picker-xtpl.js'].branchData) {
  _$jscoverage['/picker/picker-xtpl.js'].branchData = {};
  _$jscoverage['/picker/picker-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/picker/picker-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/picker/picker-xtpl.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/picker/picker-xtpl.js'].branchData['191'] = [];
  _$jscoverage['/picker/picker-xtpl.js'].branchData['191'][1] = new BranchData();
}
_$jscoverage['/picker/picker-xtpl.js'].branchData['191'][1].init(11108, 12, 'id67 || id68');
function visit30_191_1(result) {
  _$jscoverage['/picker/picker-xtpl.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/picker-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit29_9_2(result) {
  _$jscoverage['/picker/picker-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/picker-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit28_9_1(result) {
  _$jscoverage['/picker/picker-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/picker-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/picker-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/picker/picker-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[9]++;
  if (visit28_9_1(visit29_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/picker-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/picker-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, getExpressionUtil = utils.getExpression, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[15]++;
  buffer += '<div class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[16]++;
  var config1 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[17]++;
  var params2 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[18]++;
  params2.push('header');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[19]++;
  config1.params = params2;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[20]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, config1, "getBaseCssClasses", 0, 1, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[21]++;
  buffer += id0;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[22]++;
  buffer += '">\n    <a id="ks-date-picker-previous-year-btn-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[23]++;
  var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[24]++;
  buffer += getExpressionUtil(id3, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[25]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[26]++;
  var config5 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[27]++;
  var params6 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[28]++;
  params6.push('prev-year-btn');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[29]++;
  config5.params = params6;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[30]++;
  var id4 = getPropertyOrRunCommandUtil(engine, scope, config5, "getBaseCssClasses", 0, 3, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[31]++;
  buffer += id4;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[32]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[33]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousYearLabel", 0, 7, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[34]++;
  buffer += getExpressionUtil(id7, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[35]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-previous-month-btn-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[36]++;
  var id8 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 10, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[37]++;
  buffer += getExpressionUtil(id8, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[38]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[39]++;
  var config10 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[40]++;
  var params11 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[41]++;
  params11.push('prev-month-btn');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[42]++;
  config10.params = params11;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[43]++;
  var id9 = getPropertyOrRunCommandUtil(engine, scope, config10, "getBaseCssClasses", 0, 11, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[44]++;
  buffer += id9;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[45]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[46]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousMonthLabel", 0, 15, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[47]++;
  buffer += getExpressionUtil(id12, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[48]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n    <a class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[49]++;
  var config14 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[50]++;
  var params15 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[51]++;
  params15.push('month-select');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[52]++;
  config14.params = params15;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[53]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, config14, "getBaseCssClasses", 0, 18, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[54]++;
  buffer += id13;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[55]++;
  buffer += '"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[56]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "monthSelectLabel", 0, 23, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[57]++;
  buffer += getExpressionUtil(id16, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[58]++;
  buffer += '"\n       id="ks-date-picker-month-select-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[59]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 24, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[60]++;
  buffer += getExpressionUtil(id17, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[61]++;
  buffer += '">\n        <span id="ks-date-picker-month-select-content-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[62]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 25, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[63]++;
  buffer += getExpressionUtil(id18, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[64]++;
  buffer += '">';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[65]++;
  var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "monthYearLabel", 0, 25, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[66]++;
  buffer += getExpressionUtil(id19, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[67]++;
  buffer += '</span>\n        <span class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[68]++;
  var config21 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[69]++;
  var params22 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[70]++;
  params22.push('month-select-arrow');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[71]++;
  config21.params = params22;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[72]++;
  var id20 = getPropertyOrRunCommandUtil(engine, scope, config21, "getBaseCssClasses", 0, 26, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[73]++;
  buffer += id20;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[74]++;
  buffer += '">x</span>\n    </a>\n    <a id="ks-date-picker-next-month-btn-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[75]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 28, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[76]++;
  buffer += getExpressionUtil(id23, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[77]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[78]++;
  var config25 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[79]++;
  var params26 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[80]++;
  params26.push('next-month-btn');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[81]++;
  config25.params = params26;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[82]++;
  var id24 = getPropertyOrRunCommandUtil(engine, scope, config25, "getBaseCssClasses", 0, 29, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[83]++;
  buffer += id24;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[84]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[85]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextMonthLabel", 0, 33, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[86]++;
  buffer += getExpressionUtil(id27, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[87]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-next-year-btn-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[88]++;
  var id28 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 36, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[89]++;
  buffer += getExpressionUtil(id28, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[90]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[91]++;
  var config30 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[92]++;
  var params31 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[93]++;
  params31.push('next-year-btn');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[94]++;
  config30.params = params31;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[95]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scope, config30, "getBaseCssClasses", 0, 37, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[96]++;
  buffer += id29;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[97]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[98]++;
  var id32 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextYearLabel", 0, 41, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[99]++;
  buffer += getExpressionUtil(id32, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[100]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[101]++;
  var config34 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[102]++;
  var params35 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[103]++;
  params35.push('body');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[104]++;
  config34.params = params35;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[105]++;
  var id33 = getPropertyOrRunCommandUtil(engine, scope, config34, "getBaseCssClasses", 0, 45, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[106]++;
  buffer += id33;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[107]++;
  buffer += '">\n    <table class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[108]++;
  var config37 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[109]++;
  var params38 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[110]++;
  params38.push('table');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[111]++;
  config37.params = params38;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[112]++;
  var id36 = getPropertyOrRunCommandUtil(engine, scope, config37, "getBaseCssClasses", 0, 46, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[113]++;
  buffer += id36;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[114]++;
  buffer += '" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[115]++;
  var config39 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[116]++;
  var params40 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[117]++;
  var id41 = getPropertyOrRunCommandUtil(engine, scope, {}, "showWeekNumber", 0, 49, undefined, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[118]++;
  params40.push(id41);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[119]++;
  config39.params = params40;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[120]++;
  config39.fn = function(scope) {
  _$jscoverage['/picker/picker-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[121]++;
  var buffer = "";
  _$jscoverage['/picker/picker-xtpl.js'].lineData[122]++;
  buffer += '\n            <th role="columnheader" class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[123]++;
  var config43 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[124]++;
  var params44 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[125]++;
  params44.push('column-header');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[126]++;
  config43.params = params44;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[127]++;
  var id42 = getPropertyOrRunCommandUtil(engine, scope, config43, "getBaseCssClasses", 0, 50, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[128]++;
  buffer += id42;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[129]++;
  buffer += ' ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[130]++;
  var config46 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[131]++;
  var params47 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[132]++;
  params47.push('week-number-header');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[133]++;
  config46.params = params47;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[134]++;
  var id45 = getPropertyOrRunCommandUtil(engine, scope, config46, "getBaseCssClasses", 0, 50, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[135]++;
  buffer += id45;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[136]++;
  buffer += '">\n                <span class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[137]++;
  var config49 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[138]++;
  var params50 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[139]++;
  params50.push('column-header-inner');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[140]++;
  config49.params = params50;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[141]++;
  var id48 = getPropertyOrRunCommandUtil(engine, scope, config49, "getBaseCssClasses", 0, 51, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[142]++;
  buffer += id48;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[143]++;
  buffer += '">x</span>\n            </th>\n            ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[144]++;
  return buffer;
};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[146]++;
  buffer += runBlockCommandUtil(engine, scope, config39, "if", 49);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[147]++;
  buffer += '\n            ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[148]++;
  var config51 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[149]++;
  var params52 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[150]++;
  var id53 = getPropertyOrRunCommandUtil(engine, scope, {}, "weekdays", 0, 54, undefined, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[151]++;
  params52.push(id53);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[152]++;
  config51.params = params52;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[153]++;
  config51.fn = function(scope) {
  _$jscoverage['/picker/picker-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[154]++;
  var buffer = "";
  _$jscoverage['/picker/picker-xtpl.js'].lineData[155]++;
  buffer += '\n            <th role="columnheader" title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[156]++;
  var id54 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 55, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[157]++;
  buffer += getExpressionUtil(id54, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[158]++;
  buffer += '" class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[159]++;
  var config56 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[160]++;
  var params57 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[161]++;
  params57.push('column-header');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[162]++;
  config56.params = params57;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[163]++;
  var id55 = getPropertyOrRunCommandUtil(engine, scope, config56, "getBaseCssClasses", 0, 55, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[164]++;
  buffer += id55;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[165]++;
  buffer += '">\n                <span class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[166]++;
  var config59 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[167]++;
  var params60 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[168]++;
  params60.push('column-header-inner');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[169]++;
  config59.params = params60;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[170]++;
  var id58 = getPropertyOrRunCommandUtil(engine, scope, config59, "getBaseCssClasses", 0, 56, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[171]++;
  buffer += id58;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[172]++;
  buffer += '">\n                    ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[173]++;
  var id62 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 57, undefined, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[174]++;
  var id61 = getPropertyOrRunCommandUtil(engine, scope, {}, "veryShortWeekdays." + id62 + "", 0, 57, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[175]++;
  buffer += getExpressionUtil(id61, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[176]++;
  buffer += '\n                </span>\n            </th>\n            ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[177]++;
  return buffer;
};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[179]++;
  buffer += runBlockCommandUtil(engine, scope, config51, "each", 54);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[180]++;
  buffer += '\n        </tr>\n        </thead>\n        <tbody id="ks-date-picker-tbody-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[181]++;
  var id63 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 63, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[182]++;
  buffer += getExpressionUtil(id63, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[183]++;
  buffer += '">\n        ';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[184]++;
  var id64 = getPropertyOrRunCommandUtil(engine, scope, {}, "renderDates", 0, 64, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[185]++;
  buffer += getExpressionUtil(id64, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[186]++;
  buffer += '\n        </tbody>\n    </table>\n</div>\n';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[187]++;
  var config65 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[188]++;
  var params66 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[189]++;
  var id67 = getPropertyOrRunCommandUtil(engine, scope, {}, "showToday", 0, 68, undefined, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[190]++;
  var id68 = getPropertyOrRunCommandUtil(engine, scope, {}, "showClear", 0, 68, undefined, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[191]++;
  params66.push(visit30_191_1(id67 || id68));
  _$jscoverage['/picker/picker-xtpl.js'].lineData[192]++;
  config65.params = params66;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[193]++;
  config65.fn = function(scope) {
  _$jscoverage['/picker/picker-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[194]++;
  var buffer = "";
  _$jscoverage['/picker/picker-xtpl.js'].lineData[195]++;
  buffer += '\n<div class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[196]++;
  var config70 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[197]++;
  var params71 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[198]++;
  params71.push('footer');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[199]++;
  config70.params = params71;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[200]++;
  var id69 = getPropertyOrRunCommandUtil(engine, scope, config70, "getBaseCssClasses", 0, 69, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[201]++;
  buffer += id69;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[202]++;
  buffer += '">\n    <a class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[203]++;
  var config73 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[204]++;
  var params74 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[205]++;
  params74.push('today-btn');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[206]++;
  config73.params = params74;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[207]++;
  var id72 = getPropertyOrRunCommandUtil(engine, scope, config73, "getBaseCssClasses", 0, 70, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[208]++;
  buffer += id72;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[209]++;
  buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-today-btn-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[210]++;
  var id75 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 75, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[211]++;
  buffer += getExpressionUtil(id75, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[212]++;
  buffer += '"\n       title="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[213]++;
  var id76 = getPropertyOrRunCommandUtil(engine, scope, {}, "todayTimeLabel", 0, 76, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[214]++;
  buffer += getExpressionUtil(id76, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[215]++;
  buffer += '">';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[216]++;
  var id77 = getPropertyOrRunCommandUtil(engine, scope, {}, "todayLabel", 0, 76, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[217]++;
  buffer += getExpressionUtil(id77, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[218]++;
  buffer += '</a>\n    <a class="';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[219]++;
  var config79 = {};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[220]++;
  var params80 = [];
  _$jscoverage['/picker/picker-xtpl.js'].lineData[221]++;
  params80.push('clear-btn');
  _$jscoverage['/picker/picker-xtpl.js'].lineData[222]++;
  config79.params = params80;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[223]++;
  var id78 = getPropertyOrRunCommandUtil(engine, scope, config79, "getBaseCssClasses", 0, 77, true, undefined);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[224]++;
  buffer += id78;
  _$jscoverage['/picker/picker-xtpl.js'].lineData[225]++;
  buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-clear-btn-';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[226]++;
  var id81 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 82, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[227]++;
  buffer += getExpressionUtil(id81, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[228]++;
  buffer += '">';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[229]++;
  var id82 = getPropertyOrRunCommandUtil(engine, scope, {}, "clearLabel", 0, 82, undefined, false);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[230]++;
  buffer += getExpressionUtil(id82, true);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[231]++;
  buffer += '</a>\n</div>\n';
  _$jscoverage['/picker/picker-xtpl.js'].lineData[232]++;
  return buffer;
};
  _$jscoverage['/picker/picker-xtpl.js'].lineData[234]++;
  buffer += runBlockCommandUtil(engine, scope, config65, "if", 68);
  _$jscoverage['/picker/picker-xtpl.js'].lineData[235]++;
  return buffer;
};
});
