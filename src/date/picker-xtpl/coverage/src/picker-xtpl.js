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
  _$jscoverage['/picker-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[184] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[185] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[187] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[189] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[190] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[192] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[193] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[194] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[197] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[198] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[199] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[200] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[201] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[202] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[203] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[205] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[206] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[208] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[210] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[211] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[212] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[215] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[216] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[217] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[218] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[219] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[221] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[222] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[223] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[224] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[225] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[228] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[229] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[230] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[231] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[232] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[233] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[234] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[236] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[237] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[238] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[241] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[242] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[243] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[244] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[245] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[246] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[247] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[249] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[250] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[251] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[252] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[253] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[254] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[256] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[258] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[259] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[260] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[261] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[262] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[263] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[264] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[266] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[267] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[268] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[271] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[272] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[273] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[274] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[275] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[276] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[278] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[279] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[280] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[282] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[283] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[286] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[287] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[288] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[289] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[290] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[291] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[292] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[294] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[295] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[296] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[299] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[300] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[301] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[302] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[303] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[304] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[305] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[307] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[308] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[309] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[310] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[311] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[312] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[313] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[314] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[315] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[318] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[319] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[320] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[321] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[322] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[323] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[324] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[326] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[327] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[328] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[329] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[330] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[332] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[334] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[335] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[337] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[338] = 0;
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
  _$jscoverage['/picker-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['30'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['59'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['75'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['94'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['107'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['123'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['139'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['152'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['175'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['188'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['201'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['232'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['245'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['262'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['274'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['290'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['303'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['322'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['322'][1] = new BranchData();
}
_$jscoverage['/picker-xtpl.js'].branchData['322'][1].init(1945, 37, 'commandRet74 && commandRet74.isBuffer');
function visit20_322_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['303'][1].init(971, 37, 'commandRet69 && commandRet69.isBuffer');
function visit19_303_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['290'][1].init(384, 37, 'commandRet66 && commandRet66.isBuffer');
function visit18_290_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['274'][1].init(12421, 7, '!(id61)');
function visit17_274_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['262'][1].init(11958, 37, 'commandRet58 && commandRet58.isBuffer');
function visit16_262_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['245'][1].init(1171, 37, 'commandRet54 && commandRet54.isBuffer');
function visit15_245_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['232'][1].init(559, 37, 'commandRet51 && commandRet51.isBuffer');
function visit14_232_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['201'][1].init(1611, 37, 'commandRet44 && commandRet44.isBuffer');
function visit13_201_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['188'][1].init(999, 37, 'commandRet41 && commandRet41.isBuffer');
function visit12_188_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['175'][1].init(422, 37, 'commandRet38 && commandRet38.isBuffer');
function visit11_175_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['152'][1].init(6955, 37, 'commandRet32 && commandRet32.isBuffer');
function visit10_152_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['139'][1].init(6420, 37, 'commandRet29 && commandRet29.isBuffer');
function visit9_139_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['123'][1].init(5634, 37, 'commandRet25 && commandRet25.isBuffer');
function visit8_123_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['107'][1].init(4846, 37, 'commandRet21 && commandRet21.isBuffer');
function visit7_107_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['94'][1].init(4286, 37, 'commandRet18 && commandRet18.isBuffer');
function visit6_94_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['75'][1].init(3345, 37, 'commandRet13 && commandRet13.isBuffer');
function visit5_75_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['59'][1].init(2559, 35, 'commandRet9 && commandRet9.isBuffer');
function visit4_59_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['43'][1].init(1782, 35, 'commandRet5 && commandRet5.isBuffer');
function visit3_43_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['30'][1].init(1256, 35, 'commandRet2 && commandRet2.isBuffer');
function visit2_30_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['8'][1].init(142, 21, '"5.0.0" !== S.version');
function visit1_8_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker-xtpl.js'].lineData[8]++;
  if (visit1_8_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker-xtpl.js'].lineData[11]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker-xtpl.js'].lineData[22]++;
  buffer.write('<div class="');
  _$jscoverage['/picker-xtpl.js'].lineData[23]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[26]++;
  var params1 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[27]++;
  params1.push('header');
  _$jscoverage['/picker-xtpl.js'].lineData[28]++;
  option0.params = params1;
  _$jscoverage['/picker-xtpl.js'].lineData[29]++;
  var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
  _$jscoverage['/picker-xtpl.js'].lineData[30]++;
  if (visit2_30_1(commandRet2 && commandRet2.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[31]++;
    buffer = commandRet2;
    _$jscoverage['/picker-xtpl.js'].lineData[32]++;
    commandRet2 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[34]++;
  buffer.write(commandRet2, true);
  _$jscoverage['/picker-xtpl.js'].lineData[35]++;
  buffer.write('">\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[40]++;
  params4.push('prev-year-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[41]++;
  option3.params = params4;
  _$jscoverage['/picker-xtpl.js'].lineData[42]++;
  var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/picker-xtpl.js'].lineData[43]++;
  if (visit3_43_1(commandRet5 && commandRet5.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[44]++;
    buffer = commandRet5;
    _$jscoverage['/picker-xtpl.js'].lineData[45]++;
    commandRet5 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[47]++;
  buffer.write(commandRet5, true);
  _$jscoverage['/picker-xtpl.js'].lineData[48]++;
  buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[49]++;
  var id6 = scope.resolve(["previousYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[50]++;
  buffer.write(id6, true);
  _$jscoverage['/picker-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[52]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[55]++;
  var params8 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[56]++;
  params8.push('prev-month-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[57]++;
  option7.params = params8;
  _$jscoverage['/picker-xtpl.js'].lineData[58]++;
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/picker-xtpl.js'].lineData[59]++;
  if (visit4_59_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[60]++;
    buffer = commandRet9;
    _$jscoverage['/picker-xtpl.js'].lineData[61]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[63]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/picker-xtpl.js'].lineData[64]++;
  buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[65]++;
  var id10 = scope.resolve(["previousMonthLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[66]++;
  buffer.write(id10, true);
  _$jscoverage['/picker-xtpl.js'].lineData[67]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[68]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[71]++;
  var params12 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[72]++;
  params12.push('month-select');
  _$jscoverage['/picker-xtpl.js'].lineData[73]++;
  option11.params = params12;
  _$jscoverage['/picker-xtpl.js'].lineData[74]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 16);
  _$jscoverage['/picker-xtpl.js'].lineData[75]++;
  if (visit5_75_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[76]++;
    buffer = commandRet13;
    _$jscoverage['/picker-xtpl.js'].lineData[77]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[79]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/picker-xtpl.js'].lineData[80]++;
  buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       tabindex="-1"\r\n       hidefocus="on"\r\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[81]++;
  var id14 = scope.resolve(["monthSelectLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[82]++;
  buffer.write(id14, true);
  _$jscoverage['/picker-xtpl.js'].lineData[83]++;
  buffer.write('">\r\n        <span>');
  _$jscoverage['/picker-xtpl.js'].lineData[84]++;
  var id15 = scope.resolve(["monthYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[85]++;
  buffer.write(id15, true);
  _$jscoverage['/picker-xtpl.js'].lineData[86]++;
  buffer.write('</span>\r\n        <span class="');
  _$jscoverage['/picker-xtpl.js'].lineData[87]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[90]++;
  var params17 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[91]++;
  params17.push('month-select-arrow');
  _$jscoverage['/picker-xtpl.js'].lineData[92]++;
  option16.params = params17;
  _$jscoverage['/picker-xtpl.js'].lineData[93]++;
  var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 23);
  _$jscoverage['/picker-xtpl.js'].lineData[94]++;
  if (visit6_94_1(commandRet18 && commandRet18.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[95]++;
    buffer = commandRet18;
    _$jscoverage['/picker-xtpl.js'].lineData[96]++;
    commandRet18 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[98]++;
  buffer.write(commandRet18, true);
  _$jscoverage['/picker-xtpl.js'].lineData[99]++;
  buffer.write('">x</span>\r\n    </a>\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[100]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[103]++;
  var params20 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[104]++;
  params20.push('next-month-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[105]++;
  option19.params = params20;
  _$jscoverage['/picker-xtpl.js'].lineData[106]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 25);
  _$jscoverage['/picker-xtpl.js'].lineData[107]++;
  if (visit7_107_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[108]++;
    buffer = commandRet21;
    _$jscoverage['/picker-xtpl.js'].lineData[109]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[111]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker-xtpl.js'].lineData[112]++;
  buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[113]++;
  var id22 = scope.resolve(["nextMonthLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[114]++;
  buffer.write(id22, true);
  _$jscoverage['/picker-xtpl.js'].lineData[115]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[116]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[119]++;
  var params24 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[120]++;
  params24.push('next-year-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[121]++;
  option23.params = params24;
  _$jscoverage['/picker-xtpl.js'].lineData[122]++;
  var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 32);
  _$jscoverage['/picker-xtpl.js'].lineData[123]++;
  if (visit8_123_1(commandRet25 && commandRet25.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[124]++;
    buffer = commandRet25;
    _$jscoverage['/picker-xtpl.js'].lineData[125]++;
    commandRet25 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[127]++;
  buffer.write(commandRet25, true);
  _$jscoverage['/picker-xtpl.js'].lineData[128]++;
  buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[129]++;
  var id26 = scope.resolve(["nextYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[130]++;
  buffer.write(id26, true);
  _$jscoverage['/picker-xtpl.js'].lineData[131]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
  _$jscoverage['/picker-xtpl.js'].lineData[132]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[135]++;
  var params28 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[136]++;
  params28.push('body');
  _$jscoverage['/picker-xtpl.js'].lineData[137]++;
  option27.params = params28;
  _$jscoverage['/picker-xtpl.js'].lineData[138]++;
  var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 40);
  _$jscoverage['/picker-xtpl.js'].lineData[139]++;
  if (visit9_139_1(commandRet29 && commandRet29.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[140]++;
    buffer = commandRet29;
    _$jscoverage['/picker-xtpl.js'].lineData[141]++;
    commandRet29 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[143]++;
  buffer.write(commandRet29, true);
  _$jscoverage['/picker-xtpl.js'].lineData[144]++;
  buffer.write('">\r\n    <table class="');
  _$jscoverage['/picker-xtpl.js'].lineData[145]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[148]++;
  var params31 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[149]++;
  params31.push('table');
  _$jscoverage['/picker-xtpl.js'].lineData[150]++;
  option30.params = params31;
  _$jscoverage['/picker-xtpl.js'].lineData[151]++;
  var commandRet32 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 41);
  _$jscoverage['/picker-xtpl.js'].lineData[152]++;
  if (visit10_152_1(commandRet32 && commandRet32.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[153]++;
    buffer = commandRet32;
    _$jscoverage['/picker-xtpl.js'].lineData[154]++;
    commandRet32 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[156]++;
  buffer.write(commandRet32, true);
  _$jscoverage['/picker-xtpl.js'].lineData[157]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <thead>\r\n        <tr role="row">\r\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[158]++;
  var option33 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[161]++;
  var params34 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[162]++;
  var id35 = scope.resolve(["showWeekNumber"]);
  _$jscoverage['/picker-xtpl.js'].lineData[163]++;
  params34.push(id35);
  _$jscoverage['/picker-xtpl.js'].lineData[164]++;
  option33.params = params34;
  _$jscoverage['/picker-xtpl.js'].lineData[165]++;
  option33.fn = function(scope, buffer) {
  _$jscoverage['/picker-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker-xtpl.js'].lineData[167]++;
  buffer.write('\r\n            <th role="columnheader" class="');
  _$jscoverage['/picker-xtpl.js'].lineData[168]++;
  var option36 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[171]++;
  var params37 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[172]++;
  params37.push('column-header');
  _$jscoverage['/picker-xtpl.js'].lineData[173]++;
  option36.params = params37;
  _$jscoverage['/picker-xtpl.js'].lineData[174]++;
  var commandRet38 = callCommandUtil(engine, scope, option36, buffer, "getBaseCssClasses", 45);
  _$jscoverage['/picker-xtpl.js'].lineData[175]++;
  if (visit11_175_1(commandRet38 && commandRet38.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[176]++;
    buffer = commandRet38;
    _$jscoverage['/picker-xtpl.js'].lineData[177]++;
    commandRet38 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[179]++;
  buffer.write(commandRet38, true);
  _$jscoverage['/picker-xtpl.js'].lineData[180]++;
  buffer.write(' ');
  _$jscoverage['/picker-xtpl.js'].lineData[181]++;
  var option39 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[184]++;
  var params40 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[185]++;
  params40.push('week-number-header');
  _$jscoverage['/picker-xtpl.js'].lineData[186]++;
  option39.params = params40;
  _$jscoverage['/picker-xtpl.js'].lineData[187]++;
  var commandRet41 = callCommandUtil(engine, scope, option39, buffer, "getBaseCssClasses", 45);
  _$jscoverage['/picker-xtpl.js'].lineData[188]++;
  if (visit12_188_1(commandRet41 && commandRet41.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[189]++;
    buffer = commandRet41;
    _$jscoverage['/picker-xtpl.js'].lineData[190]++;
    commandRet41 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[192]++;
  buffer.write(commandRet41, true);
  _$jscoverage['/picker-xtpl.js'].lineData[193]++;
  buffer.write('">\r\n                <span class="');
  _$jscoverage['/picker-xtpl.js'].lineData[194]++;
  var option42 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[197]++;
  var params43 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[198]++;
  params43.push('column-header-inner');
  _$jscoverage['/picker-xtpl.js'].lineData[199]++;
  option42.params = params43;
  _$jscoverage['/picker-xtpl.js'].lineData[200]++;
  var commandRet44 = callCommandUtil(engine, scope, option42, buffer, "getBaseCssClasses", 46);
  _$jscoverage['/picker-xtpl.js'].lineData[201]++;
  if (visit13_201_1(commandRet44 && commandRet44.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[202]++;
    buffer = commandRet44;
    _$jscoverage['/picker-xtpl.js'].lineData[203]++;
    commandRet44 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[205]++;
  buffer.write(commandRet44, true);
  _$jscoverage['/picker-xtpl.js'].lineData[206]++;
  buffer.write('">x</span>\r\n            </th>\r\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[208]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[210]++;
  buffer = ifCommand.call(engine, scope, option33, buffer, 44, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[211]++;
  buffer.write('\r\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[212]++;
  var option45 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[215]++;
  var params46 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[216]++;
  var id47 = scope.resolve(["weekdays"]);
  _$jscoverage['/picker-xtpl.js'].lineData[217]++;
  params46.push(id47);
  _$jscoverage['/picker-xtpl.js'].lineData[218]++;
  option45.params = params46;
  _$jscoverage['/picker-xtpl.js'].lineData[219]++;
  option45.fn = function(scope, buffer) {
  _$jscoverage['/picker-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker-xtpl.js'].lineData[221]++;
  buffer.write('\r\n            <th role="columnheader" title="');
  _$jscoverage['/picker-xtpl.js'].lineData[222]++;
  var id48 = scope.resolve(["this"]);
  _$jscoverage['/picker-xtpl.js'].lineData[223]++;
  buffer.write(id48, true);
  _$jscoverage['/picker-xtpl.js'].lineData[224]++;
  buffer.write('" class="');
  _$jscoverage['/picker-xtpl.js'].lineData[225]++;
  var option49 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[228]++;
  var params50 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[229]++;
  params50.push('column-header');
  _$jscoverage['/picker-xtpl.js'].lineData[230]++;
  option49.params = params50;
  _$jscoverage['/picker-xtpl.js'].lineData[231]++;
  var commandRet51 = callCommandUtil(engine, scope, option49, buffer, "getBaseCssClasses", 50);
  _$jscoverage['/picker-xtpl.js'].lineData[232]++;
  if (visit14_232_1(commandRet51 && commandRet51.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[233]++;
    buffer = commandRet51;
    _$jscoverage['/picker-xtpl.js'].lineData[234]++;
    commandRet51 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[236]++;
  buffer.write(commandRet51, true);
  _$jscoverage['/picker-xtpl.js'].lineData[237]++;
  buffer.write('">\r\n                <span class="');
  _$jscoverage['/picker-xtpl.js'].lineData[238]++;
  var option52 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[241]++;
  var params53 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[242]++;
  params53.push('column-header-inner');
  _$jscoverage['/picker-xtpl.js'].lineData[243]++;
  option52.params = params53;
  _$jscoverage['/picker-xtpl.js'].lineData[244]++;
  var commandRet54 = callCommandUtil(engine, scope, option52, buffer, "getBaseCssClasses", 51);
  _$jscoverage['/picker-xtpl.js'].lineData[245]++;
  if (visit15_245_1(commandRet54 && commandRet54.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[246]++;
    buffer = commandRet54;
    _$jscoverage['/picker-xtpl.js'].lineData[247]++;
    commandRet54 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[249]++;
  buffer.write(commandRet54, true);
  _$jscoverage['/picker-xtpl.js'].lineData[250]++;
  buffer.write('">\r\n                    ');
  _$jscoverage['/picker-xtpl.js'].lineData[251]++;
  var id56 = scope.resolve(["xindex"]);
  _$jscoverage['/picker-xtpl.js'].lineData[252]++;
  var id55 = scope.resolve(["veryShortWeekdays", id56]);
  _$jscoverage['/picker-xtpl.js'].lineData[253]++;
  buffer.write(id55, true);
  _$jscoverage['/picker-xtpl.js'].lineData[254]++;
  buffer.write('\r\n                </span>\r\n            </th>\r\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[256]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[258]++;
  buffer = eachCommand.call(engine, scope, option45, buffer, 49, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[259]++;
  buffer.write('\r\n        </tr>\r\n        </thead>\r\n        <tbody>\r\n        ');
  _$jscoverage['/picker-xtpl.js'].lineData[260]++;
  var option57 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[261]++;
  var commandRet58 = callCommandUtil(engine, scope, option57, buffer, "renderDates", 59);
  _$jscoverage['/picker-xtpl.js'].lineData[262]++;
  if (visit16_262_1(commandRet58 && commandRet58.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[263]++;
    buffer = commandRet58;
    _$jscoverage['/picker-xtpl.js'].lineData[264]++;
    commandRet58 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[266]++;
  buffer.write(commandRet58, false);
  _$jscoverage['/picker-xtpl.js'].lineData[267]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>\r\n');
  _$jscoverage['/picker-xtpl.js'].lineData[268]++;
  var option59 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[271]++;
  var params60 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[272]++;
  var id61 = scope.resolve(["showToday"]);
  _$jscoverage['/picker-xtpl.js'].lineData[273]++;
  var exp63 = id61;
  _$jscoverage['/picker-xtpl.js'].lineData[274]++;
  if (visit17_274_1(!(id61))) {
    _$jscoverage['/picker-xtpl.js'].lineData[275]++;
    var id62 = scope.resolve(["showClear"]);
    _$jscoverage['/picker-xtpl.js'].lineData[276]++;
    exp63 = id62;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[278]++;
  params60.push(exp63);
  _$jscoverage['/picker-xtpl.js'].lineData[279]++;
  option59.params = params60;
  _$jscoverage['/picker-xtpl.js'].lineData[280]++;
  option59.fn = function(scope, buffer) {
  _$jscoverage['/picker-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker-xtpl.js'].lineData[282]++;
  buffer.write('\r\n<div class="');
  _$jscoverage['/picker-xtpl.js'].lineData[283]++;
  var option64 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[286]++;
  var params65 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[287]++;
  params65.push('footer');
  _$jscoverage['/picker-xtpl.js'].lineData[288]++;
  option64.params = params65;
  _$jscoverage['/picker-xtpl.js'].lineData[289]++;
  var commandRet66 = callCommandUtil(engine, scope, option64, buffer, "getBaseCssClasses", 64);
  _$jscoverage['/picker-xtpl.js'].lineData[290]++;
  if (visit18_290_1(commandRet66 && commandRet66.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[291]++;
    buffer = commandRet66;
    _$jscoverage['/picker-xtpl.js'].lineData[292]++;
    commandRet66 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[294]++;
  buffer.write(commandRet66, true);
  _$jscoverage['/picker-xtpl.js'].lineData[295]++;
  buffer.write('">\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[296]++;
  var option67 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[299]++;
  var params68 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[300]++;
  params68.push('today-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[301]++;
  option67.params = params68;
  _$jscoverage['/picker-xtpl.js'].lineData[302]++;
  var commandRet69 = callCommandUtil(engine, scope, option67, buffer, "getBaseCssClasses", 65);
  _$jscoverage['/picker-xtpl.js'].lineData[303]++;
  if (visit19_303_1(commandRet69 && commandRet69.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[304]++;
    buffer = commandRet69;
    _$jscoverage['/picker-xtpl.js'].lineData[305]++;
    commandRet69 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[307]++;
  buffer.write(commandRet69, true);
  _$jscoverage['/picker-xtpl.js'].lineData[308]++;
  buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#"\r\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[309]++;
  var id70 = scope.resolve(["todayTimeLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[310]++;
  buffer.write(id70, true);
  _$jscoverage['/picker-xtpl.js'].lineData[311]++;
  buffer.write('">');
  _$jscoverage['/picker-xtpl.js'].lineData[312]++;
  var id71 = scope.resolve(["todayLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[313]++;
  buffer.write(id71, true);
  _$jscoverage['/picker-xtpl.js'].lineData[314]++;
  buffer.write('</a>\r\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[315]++;
  var option72 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[318]++;
  var params73 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[319]++;
  params73.push('clear-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[320]++;
  option72.params = params73;
  _$jscoverage['/picker-xtpl.js'].lineData[321]++;
  var commandRet74 = callCommandUtil(engine, scope, option72, buffer, "getBaseCssClasses", 71);
  _$jscoverage['/picker-xtpl.js'].lineData[322]++;
  if (visit20_322_1(commandRet74 && commandRet74.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[323]++;
    buffer = commandRet74;
    _$jscoverage['/picker-xtpl.js'].lineData[324]++;
    commandRet74 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[326]++;
  buffer.write(commandRet74, true);
  _$jscoverage['/picker-xtpl.js'].lineData[327]++;
  buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#">');
  _$jscoverage['/picker-xtpl.js'].lineData[328]++;
  var id75 = scope.resolve(["clearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[329]++;
  buffer.write(id75, true);
  _$jscoverage['/picker-xtpl.js'].lineData[330]++;
  buffer.write('</a>\r\n</div>\r\n');
  _$jscoverage['/picker-xtpl.js'].lineData[332]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[334]++;
  buffer = ifCommand.call(engine, scope, option59, buffer, 63, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[335]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[337]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker-xtpl.js'].lineData[338]++;
  return t;
});
