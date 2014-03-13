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
if (! _$jscoverage['/picker-xtpl.js']) {
  _$jscoverage['/picker-xtpl.js'] = {};
  _$jscoverage['/picker-xtpl.js'].lineData = [];
  _$jscoverage['/picker-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[182] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[183] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[184] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[185] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[189] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[190] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[191] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[192] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[193] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[194] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[195] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[197] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[198] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[199] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[200] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[201] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[202] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[203] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[204] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[205] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[206] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[207] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[208] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[209] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[210] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[211] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[212] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[213] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[214] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[215] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[216] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[217] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[218] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[219] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[220] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[221] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[222] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[223] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[224] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[225] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[226] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[227] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[228] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[229] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[230] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[231] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[232] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[233] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[234] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[235] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[236] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[237] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[238] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[239] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[240] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[241] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[242] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[243] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[245] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[246] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[248] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[249] = 0;
}
if (! _$jscoverage['/picker-xtpl.js'].functionData) {
  _$jscoverage['/picker-xtpl.js'].functionData = [];
  _$jscoverage['/picker-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/picker-xtpl.js'].branchData) {
  _$jscoverage['/picker-xtpl.js'].branchData = {};
  _$jscoverage['/picker-xtpl.js'].branchData['10'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['194'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['202'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['202'][1] = new BranchData();
}
_$jscoverage['/picker-xtpl.js'].branchData['202'][1].init(9969, 12, 'id67 || id68');
function visit5_202_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['194'][2].init(9647, 10, 'id64 === 0');
function visit4_194_2(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['194'][1].init(9639, 18, 'id64 || id64 === 0');
function visit3_194_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['10'][2].init(226, 29, 'typeof module !== "undefined"');
function visit2_10_2(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['10'][1].init(226, 45, 'typeof module !== "undefined" && module.kissy');
function visit1_10_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker-xtpl.js'].lineData[4]++;
  var t = function(scope, S, payload, undefined) {
  _$jscoverage['/picker-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker-xtpl.js'].lineData[5]++;
  var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker-xtpl.js'].lineData[10]++;
  if (visit1_10_1(visit2_10_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker-xtpl.js'].lineData[11]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[13]++;
  var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
  _$jscoverage['/picker-xtpl.js'].lineData[24]++;
  buffer += '<div class="';
  _$jscoverage['/picker-xtpl.js'].lineData[25]++;
  var option1 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[26]++;
  var params2 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[27]++;
  params2.push('header');
  _$jscoverage['/picker-xtpl.js'].lineData[28]++;
  option1.params = params2;
  _$jscoverage['/picker-xtpl.js'].lineData[29]++;
  var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
  _$jscoverage['/picker-xtpl.js'].lineData[30]++;
  buffer += escapeHtml(id0);
  _$jscoverage['/picker-xtpl.js'].lineData[31]++;
  buffer += '">\n    <a id="ks-date-picker-previous-year-btn-';
  _$jscoverage['/picker-xtpl.js'].lineData[32]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[33]++;
  buffer += escapeHtml(id3);
  _$jscoverage['/picker-xtpl.js'].lineData[34]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker-xtpl.js'].lineData[35]++;
  var option5 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[36]++;
  var params6 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[37]++;
  params6.push('prev-year-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[38]++;
  option5.params = params6;
  _$jscoverage['/picker-xtpl.js'].lineData[39]++;
  var id4 = callCommandUtil(engine, scope, option5, "getBaseCssClasses", 3);
  _$jscoverage['/picker-xtpl.js'].lineData[40]++;
  buffer += escapeHtml(id4);
  _$jscoverage['/picker-xtpl.js'].lineData[41]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker-xtpl.js'].lineData[42]++;
  var id7 = scope.resolve(["previousYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[43]++;
  buffer += escapeHtml(id7);
  _$jscoverage['/picker-xtpl.js'].lineData[44]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-previous-month-btn-';
  _$jscoverage['/picker-xtpl.js'].lineData[45]++;
  var id8 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[46]++;
  buffer += escapeHtml(id8);
  _$jscoverage['/picker-xtpl.js'].lineData[47]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker-xtpl.js'].lineData[48]++;
  var option10 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[49]++;
  var params11 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[50]++;
  params11.push('prev-month-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[51]++;
  option10.params = params11;
  _$jscoverage['/picker-xtpl.js'].lineData[52]++;
  var id9 = callCommandUtil(engine, scope, option10, "getBaseCssClasses", 11);
  _$jscoverage['/picker-xtpl.js'].lineData[53]++;
  buffer += escapeHtml(id9);
  _$jscoverage['/picker-xtpl.js'].lineData[54]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker-xtpl.js'].lineData[55]++;
  var id12 = scope.resolve(["previousMonthLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[56]++;
  buffer += escapeHtml(id12);
  _$jscoverage['/picker-xtpl.js'].lineData[57]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n    <a class="';
  _$jscoverage['/picker-xtpl.js'].lineData[58]++;
  var option14 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[59]++;
  var params15 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[60]++;
  params15.push('month-select');
  _$jscoverage['/picker-xtpl.js'].lineData[61]++;
  option14.params = params15;
  _$jscoverage['/picker-xtpl.js'].lineData[62]++;
  var id13 = callCommandUtil(engine, scope, option14, "getBaseCssClasses", 18);
  _$jscoverage['/picker-xtpl.js'].lineData[63]++;
  buffer += escapeHtml(id13);
  _$jscoverage['/picker-xtpl.js'].lineData[64]++;
  buffer += '"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="';
  _$jscoverage['/picker-xtpl.js'].lineData[65]++;
  var id16 = scope.resolve(["monthSelectLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[66]++;
  buffer += escapeHtml(id16);
  _$jscoverage['/picker-xtpl.js'].lineData[67]++;
  buffer += '"\n       id="ks-date-picker-month-select-';
  _$jscoverage['/picker-xtpl.js'].lineData[68]++;
  var id17 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[69]++;
  buffer += escapeHtml(id17);
  _$jscoverage['/picker-xtpl.js'].lineData[70]++;
  buffer += '">\n        <span id="ks-date-picker-month-select-content-';
  _$jscoverage['/picker-xtpl.js'].lineData[71]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[72]++;
  buffer += escapeHtml(id18);
  _$jscoverage['/picker-xtpl.js'].lineData[73]++;
  buffer += '">';
  _$jscoverage['/picker-xtpl.js'].lineData[74]++;
  var id19 = scope.resolve(["monthYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[75]++;
  buffer += escapeHtml(id19);
  _$jscoverage['/picker-xtpl.js'].lineData[76]++;
  buffer += '</span>\n        <span class="';
  _$jscoverage['/picker-xtpl.js'].lineData[77]++;
  var option21 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[78]++;
  var params22 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[79]++;
  params22.push('month-select-arrow');
  _$jscoverage['/picker-xtpl.js'].lineData[80]++;
  option21.params = params22;
  _$jscoverage['/picker-xtpl.js'].lineData[81]++;
  var id20 = callCommandUtil(engine, scope, option21, "getBaseCssClasses", 26);
  _$jscoverage['/picker-xtpl.js'].lineData[82]++;
  buffer += escapeHtml(id20);
  _$jscoverage['/picker-xtpl.js'].lineData[83]++;
  buffer += '">x</span>\n    </a>\n    <a id="ks-date-picker-next-month-btn-';
  _$jscoverage['/picker-xtpl.js'].lineData[84]++;
  var id23 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[85]++;
  buffer += escapeHtml(id23);
  _$jscoverage['/picker-xtpl.js'].lineData[86]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker-xtpl.js'].lineData[87]++;
  var option25 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[88]++;
  var params26 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[89]++;
  params26.push('next-month-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[90]++;
  option25.params = params26;
  _$jscoverage['/picker-xtpl.js'].lineData[91]++;
  var id24 = callCommandUtil(engine, scope, option25, "getBaseCssClasses", 29);
  _$jscoverage['/picker-xtpl.js'].lineData[92]++;
  buffer += escapeHtml(id24);
  _$jscoverage['/picker-xtpl.js'].lineData[93]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker-xtpl.js'].lineData[94]++;
  var id27 = scope.resolve(["nextMonthLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[95]++;
  buffer += escapeHtml(id27);
  _$jscoverage['/picker-xtpl.js'].lineData[96]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-next-year-btn-';
  _$jscoverage['/picker-xtpl.js'].lineData[97]++;
  var id28 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[98]++;
  buffer += escapeHtml(id28);
  _$jscoverage['/picker-xtpl.js'].lineData[99]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker-xtpl.js'].lineData[100]++;
  var option30 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[101]++;
  var params31 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[102]++;
  params31.push('next-year-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[103]++;
  option30.params = params31;
  _$jscoverage['/picker-xtpl.js'].lineData[104]++;
  var id29 = callCommandUtil(engine, scope, option30, "getBaseCssClasses", 37);
  _$jscoverage['/picker-xtpl.js'].lineData[105]++;
  buffer += escapeHtml(id29);
  _$jscoverage['/picker-xtpl.js'].lineData[106]++;
  buffer += '"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="';
  _$jscoverage['/picker-xtpl.js'].lineData[107]++;
  var id32 = scope.resolve(["nextYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[108]++;
  buffer += escapeHtml(id32);
  _$jscoverage['/picker-xtpl.js'].lineData[109]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
  _$jscoverage['/picker-xtpl.js'].lineData[110]++;
  var option34 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[111]++;
  var params35 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[112]++;
  params35.push('body');
  _$jscoverage['/picker-xtpl.js'].lineData[113]++;
  option34.params = params35;
  _$jscoverage['/picker-xtpl.js'].lineData[114]++;
  var id33 = callCommandUtil(engine, scope, option34, "getBaseCssClasses", 45);
  _$jscoverage['/picker-xtpl.js'].lineData[115]++;
  buffer += escapeHtml(id33);
  _$jscoverage['/picker-xtpl.js'].lineData[116]++;
  buffer += '">\n    <table class="';
  _$jscoverage['/picker-xtpl.js'].lineData[117]++;
  var option37 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[118]++;
  var params38 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[119]++;
  params38.push('table');
  _$jscoverage['/picker-xtpl.js'].lineData[120]++;
  option37.params = params38;
  _$jscoverage['/picker-xtpl.js'].lineData[121]++;
  var id36 = callCommandUtil(engine, scope, option37, "getBaseCssClasses", 46);
  _$jscoverage['/picker-xtpl.js'].lineData[122]++;
  buffer += escapeHtml(id36);
  _$jscoverage['/picker-xtpl.js'].lineData[123]++;
  buffer += '" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ';
  _$jscoverage['/picker-xtpl.js'].lineData[124]++;
  var option39 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[125]++;
  var params40 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[126]++;
  var id41 = scope.resolve(["showWeekNumber"]);
  _$jscoverage['/picker-xtpl.js'].lineData[127]++;
  params40.push(id41);
  _$jscoverage['/picker-xtpl.js'].lineData[128]++;
  option39.params = params40;
  _$jscoverage['/picker-xtpl.js'].lineData[129]++;
  option39.fn = function(scope) {
  _$jscoverage['/picker-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker-xtpl.js'].lineData[130]++;
  var buffer = "";
  _$jscoverage['/picker-xtpl.js'].lineData[131]++;
  buffer += '\n            <th role="columnheader" class="';
  _$jscoverage['/picker-xtpl.js'].lineData[132]++;
  var option43 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[133]++;
  var params44 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[134]++;
  params44.push('column-header');
  _$jscoverage['/picker-xtpl.js'].lineData[135]++;
  option43.params = params44;
  _$jscoverage['/picker-xtpl.js'].lineData[136]++;
  var id42 = callCommandUtil(engine, scope, option43, "getBaseCssClasses", 50);
  _$jscoverage['/picker-xtpl.js'].lineData[137]++;
  buffer += escapeHtml(id42);
  _$jscoverage['/picker-xtpl.js'].lineData[138]++;
  buffer += ' ';
  _$jscoverage['/picker-xtpl.js'].lineData[139]++;
  var option46 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[140]++;
  var params47 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[141]++;
  params47.push('week-number-header');
  _$jscoverage['/picker-xtpl.js'].lineData[142]++;
  option46.params = params47;
  _$jscoverage['/picker-xtpl.js'].lineData[143]++;
  var id45 = callCommandUtil(engine, scope, option46, "getBaseCssClasses", 50);
  _$jscoverage['/picker-xtpl.js'].lineData[144]++;
  buffer += escapeHtml(id45);
  _$jscoverage['/picker-xtpl.js'].lineData[145]++;
  buffer += '">\n                <span class="';
  _$jscoverage['/picker-xtpl.js'].lineData[146]++;
  var option49 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[147]++;
  var params50 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[148]++;
  params50.push('column-header-inner');
  _$jscoverage['/picker-xtpl.js'].lineData[149]++;
  option49.params = params50;
  _$jscoverage['/picker-xtpl.js'].lineData[150]++;
  var id48 = callCommandUtil(engine, scope, option49, "getBaseCssClasses", 51);
  _$jscoverage['/picker-xtpl.js'].lineData[151]++;
  buffer += escapeHtml(id48);
  _$jscoverage['/picker-xtpl.js'].lineData[152]++;
  buffer += '">x</span>\n            </th>\n            ';
  _$jscoverage['/picker-xtpl.js'].lineData[153]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[155]++;
  buffer += ifCommand.call(engine, scope, option39, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[156]++;
  buffer += '\n            ';
  _$jscoverage['/picker-xtpl.js'].lineData[157]++;
  var option51 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[158]++;
  var params52 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[159]++;
  var id53 = scope.resolve(["weekdays"]);
  _$jscoverage['/picker-xtpl.js'].lineData[160]++;
  params52.push(id53);
  _$jscoverage['/picker-xtpl.js'].lineData[161]++;
  option51.params = params52;
  _$jscoverage['/picker-xtpl.js'].lineData[162]++;
  option51.fn = function(scope) {
  _$jscoverage['/picker-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker-xtpl.js'].lineData[163]++;
  var buffer = "";
  _$jscoverage['/picker-xtpl.js'].lineData[164]++;
  buffer += '\n            <th role="columnheader" title="';
  _$jscoverage['/picker-xtpl.js'].lineData[165]++;
  var id54 = scope.resolve(["this"]);
  _$jscoverage['/picker-xtpl.js'].lineData[166]++;
  buffer += escapeHtml(id54);
  _$jscoverage['/picker-xtpl.js'].lineData[167]++;
  buffer += '" class="';
  _$jscoverage['/picker-xtpl.js'].lineData[168]++;
  var option56 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[169]++;
  var params57 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[170]++;
  params57.push('column-header');
  _$jscoverage['/picker-xtpl.js'].lineData[171]++;
  option56.params = params57;
  _$jscoverage['/picker-xtpl.js'].lineData[172]++;
  var id55 = callCommandUtil(engine, scope, option56, "getBaseCssClasses", 55);
  _$jscoverage['/picker-xtpl.js'].lineData[173]++;
  buffer += escapeHtml(id55);
  _$jscoverage['/picker-xtpl.js'].lineData[174]++;
  buffer += '">\n                <span class="';
  _$jscoverage['/picker-xtpl.js'].lineData[175]++;
  var option59 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[176]++;
  var params60 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[177]++;
  params60.push('column-header-inner');
  _$jscoverage['/picker-xtpl.js'].lineData[178]++;
  option59.params = params60;
  _$jscoverage['/picker-xtpl.js'].lineData[179]++;
  var id58 = callCommandUtil(engine, scope, option59, "getBaseCssClasses", 56);
  _$jscoverage['/picker-xtpl.js'].lineData[180]++;
  buffer += escapeHtml(id58);
  _$jscoverage['/picker-xtpl.js'].lineData[181]++;
  buffer += '">\n                    ';
  _$jscoverage['/picker-xtpl.js'].lineData[182]++;
  var id62 = scope.resolve(["xindex"]);
  _$jscoverage['/picker-xtpl.js'].lineData[183]++;
  var id61 = scope.resolve("veryShortWeekdays." + id62 + "");
  _$jscoverage['/picker-xtpl.js'].lineData[184]++;
  buffer += escapeHtml(id61);
  _$jscoverage['/picker-xtpl.js'].lineData[185]++;
  buffer += '\n                </span>\n            </th>\n            ';
  _$jscoverage['/picker-xtpl.js'].lineData[186]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[188]++;
  buffer += eachCommand.call(engine, scope, option51, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[189]++;
  buffer += '\n        </tr>\n        </thead>\n        <tbody id="ks-date-picker-tbody-';
  _$jscoverage['/picker-xtpl.js'].lineData[190]++;
  var id63 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[191]++;
  buffer += escapeHtml(id63);
  _$jscoverage['/picker-xtpl.js'].lineData[192]++;
  buffer += '">\n        ';
  _$jscoverage['/picker-xtpl.js'].lineData[193]++;
  var id64 = callCommandUtil(engine, scope, undefined, "renderDates", 64);
  _$jscoverage['/picker-xtpl.js'].lineData[194]++;
  if (visit3_194_1(id64 || visit4_194_2(id64 === 0))) {
    _$jscoverage['/picker-xtpl.js'].lineData[195]++;
    buffer += id64;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[197]++;
  buffer += '\n        </tbody>\n    </table>\n</div>\n';
  _$jscoverage['/picker-xtpl.js'].lineData[198]++;
  var option65 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[199]++;
  var params66 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[200]++;
  var id67 = scope.resolve(["showToday"]);
  _$jscoverage['/picker-xtpl.js'].lineData[201]++;
  var id68 = scope.resolve(["showClear"]);
  _$jscoverage['/picker-xtpl.js'].lineData[202]++;
  params66.push(visit5_202_1(id67 || id68));
  _$jscoverage['/picker-xtpl.js'].lineData[203]++;
  option65.params = params66;
  _$jscoverage['/picker-xtpl.js'].lineData[204]++;
  option65.fn = function(scope) {
  _$jscoverage['/picker-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker-xtpl.js'].lineData[205]++;
  var buffer = "";
  _$jscoverage['/picker-xtpl.js'].lineData[206]++;
  buffer += '\n<div class="';
  _$jscoverage['/picker-xtpl.js'].lineData[207]++;
  var option70 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[208]++;
  var params71 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[209]++;
  params71.push('footer');
  _$jscoverage['/picker-xtpl.js'].lineData[210]++;
  option70.params = params71;
  _$jscoverage['/picker-xtpl.js'].lineData[211]++;
  var id69 = callCommandUtil(engine, scope, option70, "getBaseCssClasses", 69);
  _$jscoverage['/picker-xtpl.js'].lineData[212]++;
  buffer += escapeHtml(id69);
  _$jscoverage['/picker-xtpl.js'].lineData[213]++;
  buffer += '">\n    <a class="';
  _$jscoverage['/picker-xtpl.js'].lineData[214]++;
  var option73 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[215]++;
  var params74 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[216]++;
  params74.push('today-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[217]++;
  option73.params = params74;
  _$jscoverage['/picker-xtpl.js'].lineData[218]++;
  var id72 = callCommandUtil(engine, scope, option73, "getBaseCssClasses", 70);
  _$jscoverage['/picker-xtpl.js'].lineData[219]++;
  buffer += escapeHtml(id72);
  _$jscoverage['/picker-xtpl.js'].lineData[220]++;
  buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-today-btn-';
  _$jscoverage['/picker-xtpl.js'].lineData[221]++;
  var id75 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[222]++;
  buffer += escapeHtml(id75);
  _$jscoverage['/picker-xtpl.js'].lineData[223]++;
  buffer += '"\n       title="';
  _$jscoverage['/picker-xtpl.js'].lineData[224]++;
  var id76 = scope.resolve(["todayTimeLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[225]++;
  buffer += escapeHtml(id76);
  _$jscoverage['/picker-xtpl.js'].lineData[226]++;
  buffer += '">';
  _$jscoverage['/picker-xtpl.js'].lineData[227]++;
  var id77 = scope.resolve(["todayLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[228]++;
  buffer += escapeHtml(id77);
  _$jscoverage['/picker-xtpl.js'].lineData[229]++;
  buffer += '</a>\n    <a class="';
  _$jscoverage['/picker-xtpl.js'].lineData[230]++;
  var option79 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[231]++;
  var params80 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[232]++;
  params80.push('clear-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[233]++;
  option79.params = params80;
  _$jscoverage['/picker-xtpl.js'].lineData[234]++;
  var id78 = callCommandUtil(engine, scope, option79, "getBaseCssClasses", 77);
  _$jscoverage['/picker-xtpl.js'].lineData[235]++;
  buffer += escapeHtml(id78);
  _$jscoverage['/picker-xtpl.js'].lineData[236]++;
  buffer += '"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-clear-btn-';
  _$jscoverage['/picker-xtpl.js'].lineData[237]++;
  var id81 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[238]++;
  buffer += escapeHtml(id81);
  _$jscoverage['/picker-xtpl.js'].lineData[239]++;
  buffer += '">';
  _$jscoverage['/picker-xtpl.js'].lineData[240]++;
  var id82 = scope.resolve(["clearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[241]++;
  buffer += escapeHtml(id82);
  _$jscoverage['/picker-xtpl.js'].lineData[242]++;
  buffer += '</a>\n</div>\n';
  _$jscoverage['/picker-xtpl.js'].lineData[243]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[245]++;
  buffer += ifCommand.call(engine, scope, option65, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[246]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[248]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker-xtpl.js'].lineData[249]++;
  return t;
});
