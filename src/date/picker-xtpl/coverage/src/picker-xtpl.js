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
  _$jscoverage['/picker-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[83] = 0;
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
  _$jscoverage['/picker-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[182] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[183] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[185] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[186] = 0;
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
  _$jscoverage['/picker-xtpl.js'].lineData[202] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[203] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[204] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[205] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[206] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[207] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[208] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[210] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[211] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[212] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[215] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[216] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[217] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[218] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[219] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[220] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[221] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[223] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[224] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[226] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[228] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[229] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[230] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[233] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[234] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[235] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[236] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[237] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[239] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[240] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[241] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[242] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[243] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[246] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[247] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[248] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[249] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[250] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[251] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[252] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[254] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[255] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[256] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[259] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[260] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[261] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[262] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[263] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[264] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[265] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[267] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[268] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[269] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[270] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[271] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[272] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[274] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[276] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[277] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[278] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[279] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[280] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[281] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[282] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[283] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[284] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[285] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[287] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[288] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[289] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[292] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[293] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[294] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[295] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[296] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[297] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[299] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[300] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[301] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[303] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[304] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[307] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[308] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[309] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[310] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[311] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[312] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[313] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[315] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[316] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[317] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[320] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[321] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[322] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[323] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[324] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[325] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[326] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[328] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[329] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[330] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[331] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[332] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[333] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[334] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[335] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[336] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[337] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[338] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[339] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[342] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[343] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[344] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[345] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[346] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[347] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[348] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[350] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[351] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[352] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[353] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[354] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[355] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[356] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[357] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[359] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[361] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[362] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[364] = 0;
  _$jscoverage['/picker-xtpl.js'].lineData[365] = 0;
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
  _$jscoverage['/picker-xtpl.js'].branchData['46'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['65'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['81'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['106'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['122'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['141'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['157'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['170'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['193'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['206'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['219'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['250'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['263'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['283'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['295'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['311'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['324'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/picker-xtpl.js'].branchData['346'] = [];
  _$jscoverage['/picker-xtpl.js'].branchData['346'][1] = new BranchData();
}
_$jscoverage['/picker-xtpl.js'].branchData['346'][1].init(2094, 37, 'commandRet82 && commandRet82.isBuffer');
function visit20_346_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['324'][1].init(967, 37, 'commandRet76 && commandRet76.isBuffer');
function visit19_324_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['311'][1].init(382, 37, 'commandRet73 && commandRet73.isBuffer');
function visit18_311_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['295'][1].init(13392, 7, '!(id68)');
function visit17_295_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['283'][1].init(12937, 37, 'commandRet65 && commandRet65.isBuffer');
function visit16_283_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['263'][1].init(1167, 37, 'commandRet60 && commandRet60.isBuffer');
function visit15_263_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['250'][1].init(557, 37, 'commandRet57 && commandRet57.isBuffer');
function visit14_250_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['219'][1].init(1607, 37, 'commandRet50 && commandRet50.isBuffer');
function visit13_219_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['206'][1].init(997, 37, 'commandRet47 && commandRet47.isBuffer');
function visit12_206_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['193'][1].init(420, 37, 'commandRet44 && commandRet44.isBuffer');
function visit11_193_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['170'][1].init(7829, 37, 'commandRet38 && commandRet38.isBuffer');
function visit10_170_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['157'][1].init(7296, 37, 'commandRet35 && commandRet35.isBuffer');
function visit9_157_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['141'][1].init(6526, 37, 'commandRet31 && commandRet31.isBuffer');
function visit8_141_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['122'][1].init(5595, 37, 'commandRet26 && commandRet26.isBuffer');
function visit7_122_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['106'][1].init(4881, 37, 'commandRet22 && commandRet22.isBuffer');
function visit6_106_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['81'][1].init(3642, 37, 'commandRet15 && commandRet15.isBuffer');
function visit5_81_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['65'][1].init(2865, 37, 'commandRet11 && commandRet11.isBuffer');
function visit4_65_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['46'][1].init(1937, 35, 'commandRet6 && commandRet6.isBuffer');
function visit3_46_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['30'][1].init(1254, 35, 'commandRet2 && commandRet2.isBuffer');
function visit2_30_1(result) {
  _$jscoverage['/picker-xtpl.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker-xtpl.js'].branchData['8'][1].init(142, 20, '"1.50" !== S.version');
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
  if (visit1_8_1("1.50" !== S.version)) {
    _$jscoverage['/picker-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
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
  buffer.write('">\n    <a id="ks-date-picker-previous-year-btn-');
  _$jscoverage['/picker-xtpl.js'].lineData[36]++;
  var id3 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[37]++;
  buffer.write(id3, true);
  _$jscoverage['/picker-xtpl.js'].lineData[38]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker-xtpl.js'].lineData[39]++;
  var option4 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[42]++;
  var params5 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[43]++;
  params5.push('prev-year-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[44]++;
  option4.params = params5;
  _$jscoverage['/picker-xtpl.js'].lineData[45]++;
  var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/picker-xtpl.js'].lineData[46]++;
  if (visit3_46_1(commandRet6 && commandRet6.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[47]++;
    buffer = commandRet6;
    _$jscoverage['/picker-xtpl.js'].lineData[48]++;
    commandRet6 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[50]++;
  buffer.write(commandRet6, true);
  _$jscoverage['/picker-xtpl.js'].lineData[51]++;
  buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[52]++;
  var id7 = scope.resolve(["previousYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[53]++;
  buffer.write(id7, true);
  _$jscoverage['/picker-xtpl.js'].lineData[54]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-previous-month-btn-');
  _$jscoverage['/picker-xtpl.js'].lineData[55]++;
  var id8 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[56]++;
  buffer.write(id8, true);
  _$jscoverage['/picker-xtpl.js'].lineData[57]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker-xtpl.js'].lineData[58]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[61]++;
  var params10 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[62]++;
  params10.push('prev-month-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[63]++;
  option9.params = params10;
  _$jscoverage['/picker-xtpl.js'].lineData[64]++;
  var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 11);
  _$jscoverage['/picker-xtpl.js'].lineData[65]++;
  if (visit4_65_1(commandRet11 && commandRet11.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[66]++;
    buffer = commandRet11;
    _$jscoverage['/picker-xtpl.js'].lineData[67]++;
    commandRet11 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[69]++;
  buffer.write(commandRet11, true);
  _$jscoverage['/picker-xtpl.js'].lineData[70]++;
  buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[71]++;
  var id12 = scope.resolve(["previousMonthLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[72]++;
  buffer.write(id12, true);
  _$jscoverage['/picker-xtpl.js'].lineData[73]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[74]++;
  var option13 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[77]++;
  var params14 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[78]++;
  params14.push('month-select');
  _$jscoverage['/picker-xtpl.js'].lineData[79]++;
  option13.params = params14;
  _$jscoverage['/picker-xtpl.js'].lineData[80]++;
  var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 18);
  _$jscoverage['/picker-xtpl.js'].lineData[81]++;
  if (visit5_81_1(commandRet15 && commandRet15.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[82]++;
    buffer = commandRet15;
    _$jscoverage['/picker-xtpl.js'].lineData[83]++;
    commandRet15 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[85]++;
  buffer.write(commandRet15, true);
  _$jscoverage['/picker-xtpl.js'].lineData[86]++;
  buffer.write('"\n       role="button"\n       href="#"\n       tabindex="-1"\n       hidefocus="on"\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[87]++;
  var id16 = scope.resolve(["monthSelectLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[88]++;
  buffer.write(id16, true);
  _$jscoverage['/picker-xtpl.js'].lineData[89]++;
  buffer.write('"\n       id="ks-date-picker-month-select-');
  _$jscoverage['/picker-xtpl.js'].lineData[90]++;
  var id17 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[91]++;
  buffer.write(id17, true);
  _$jscoverage['/picker-xtpl.js'].lineData[92]++;
  buffer.write('">\n        <span id="ks-date-picker-month-select-content-');
  _$jscoverage['/picker-xtpl.js'].lineData[93]++;
  var id18 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[94]++;
  buffer.write(id18, true);
  _$jscoverage['/picker-xtpl.js'].lineData[95]++;
  buffer.write('">');
  _$jscoverage['/picker-xtpl.js'].lineData[96]++;
  var id19 = scope.resolve(["monthYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[97]++;
  buffer.write(id19, true);
  _$jscoverage['/picker-xtpl.js'].lineData[98]++;
  buffer.write('</span>\n        <span class="');
  _$jscoverage['/picker-xtpl.js'].lineData[99]++;
  var option20 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[102]++;
  var params21 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[103]++;
  params21.push('month-select-arrow');
  _$jscoverage['/picker-xtpl.js'].lineData[104]++;
  option20.params = params21;
  _$jscoverage['/picker-xtpl.js'].lineData[105]++;
  var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 26);
  _$jscoverage['/picker-xtpl.js'].lineData[106]++;
  if (visit6_106_1(commandRet22 && commandRet22.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[107]++;
    buffer = commandRet22;
    _$jscoverage['/picker-xtpl.js'].lineData[108]++;
    commandRet22 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[110]++;
  buffer.write(commandRet22, true);
  _$jscoverage['/picker-xtpl.js'].lineData[111]++;
  buffer.write('">x</span>\n    </a>\n    <a id="ks-date-picker-next-month-btn-');
  _$jscoverage['/picker-xtpl.js'].lineData[112]++;
  var id23 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[113]++;
  buffer.write(id23, true);
  _$jscoverage['/picker-xtpl.js'].lineData[114]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker-xtpl.js'].lineData[115]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[118]++;
  var params25 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[119]++;
  params25.push('next-month-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[120]++;
  option24.params = params25;
  _$jscoverage['/picker-xtpl.js'].lineData[121]++;
  var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 29);
  _$jscoverage['/picker-xtpl.js'].lineData[122]++;
  if (visit7_122_1(commandRet26 && commandRet26.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[123]++;
    buffer = commandRet26;
    _$jscoverage['/picker-xtpl.js'].lineData[124]++;
    commandRet26 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[126]++;
  buffer.write(commandRet26, true);
  _$jscoverage['/picker-xtpl.js'].lineData[127]++;
  buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[128]++;
  var id27 = scope.resolve(["nextMonthLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[129]++;
  buffer.write(id27, true);
  _$jscoverage['/picker-xtpl.js'].lineData[130]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n    <a id="ks-date-picker-next-year-btn-');
  _$jscoverage['/picker-xtpl.js'].lineData[131]++;
  var id28 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[132]++;
  buffer.write(id28, true);
  _$jscoverage['/picker-xtpl.js'].lineData[133]++;
  buffer.write('"\n       class="');
  _$jscoverage['/picker-xtpl.js'].lineData[134]++;
  var option29 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[137]++;
  var params30 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[138]++;
  params30.push('next-year-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[139]++;
  option29.params = params30;
  _$jscoverage['/picker-xtpl.js'].lineData[140]++;
  var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 37);
  _$jscoverage['/picker-xtpl.js'].lineData[141]++;
  if (visit8_141_1(commandRet31 && commandRet31.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[142]++;
    buffer = commandRet31;
    _$jscoverage['/picker-xtpl.js'].lineData[143]++;
    commandRet31 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[145]++;
  buffer.write(commandRet31, true);
  _$jscoverage['/picker-xtpl.js'].lineData[146]++;
  buffer.write('"\n       href="#"\n       tabindex="-1"\n       role="button"\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[147]++;
  var id32 = scope.resolve(["nextYearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[148]++;
  buffer.write(id32, true);
  _$jscoverage['/picker-xtpl.js'].lineData[149]++;
  buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
  _$jscoverage['/picker-xtpl.js'].lineData[150]++;
  var option33 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[153]++;
  var params34 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[154]++;
  params34.push('body');
  _$jscoverage['/picker-xtpl.js'].lineData[155]++;
  option33.params = params34;
  _$jscoverage['/picker-xtpl.js'].lineData[156]++;
  var commandRet35 = callCommandUtil(engine, scope, option33, buffer, "getBaseCssClasses", 45);
  _$jscoverage['/picker-xtpl.js'].lineData[157]++;
  if (visit9_157_1(commandRet35 && commandRet35.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[158]++;
    buffer = commandRet35;
    _$jscoverage['/picker-xtpl.js'].lineData[159]++;
    commandRet35 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[161]++;
  buffer.write(commandRet35, true);
  _$jscoverage['/picker-xtpl.js'].lineData[162]++;
  buffer.write('">\n    <table class="');
  _$jscoverage['/picker-xtpl.js'].lineData[163]++;
  var option36 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[166]++;
  var params37 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[167]++;
  params37.push('table');
  _$jscoverage['/picker-xtpl.js'].lineData[168]++;
  option36.params = params37;
  _$jscoverage['/picker-xtpl.js'].lineData[169]++;
  var commandRet38 = callCommandUtil(engine, scope, option36, buffer, "getBaseCssClasses", 46);
  _$jscoverage['/picker-xtpl.js'].lineData[170]++;
  if (visit10_170_1(commandRet38 && commandRet38.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[171]++;
    buffer = commandRet38;
    _$jscoverage['/picker-xtpl.js'].lineData[172]++;
    commandRet38 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[174]++;
  buffer.write(commandRet38, true);
  _$jscoverage['/picker-xtpl.js'].lineData[175]++;
  buffer.write('" cellspacing="0" role="grid">\n        <thead>\n        <tr role="row">\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[176]++;
  var option39 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[179]++;
  var params40 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[180]++;
  var id41 = scope.resolve(["showWeekNumber"]);
  _$jscoverage['/picker-xtpl.js'].lineData[181]++;
  params40.push(id41);
  _$jscoverage['/picker-xtpl.js'].lineData[182]++;
  option39.params = params40;
  _$jscoverage['/picker-xtpl.js'].lineData[183]++;
  option39.fn = function(scope, buffer) {
  _$jscoverage['/picker-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker-xtpl.js'].lineData[185]++;
  buffer.write('\n            <th role="columnheader" class="');
  _$jscoverage['/picker-xtpl.js'].lineData[186]++;
  var option42 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[189]++;
  var params43 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[190]++;
  params43.push('column-header');
  _$jscoverage['/picker-xtpl.js'].lineData[191]++;
  option42.params = params43;
  _$jscoverage['/picker-xtpl.js'].lineData[192]++;
  var commandRet44 = callCommandUtil(engine, scope, option42, buffer, "getBaseCssClasses", 50);
  _$jscoverage['/picker-xtpl.js'].lineData[193]++;
  if (visit11_193_1(commandRet44 && commandRet44.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[194]++;
    buffer = commandRet44;
    _$jscoverage['/picker-xtpl.js'].lineData[195]++;
    commandRet44 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[197]++;
  buffer.write(commandRet44, true);
  _$jscoverage['/picker-xtpl.js'].lineData[198]++;
  buffer.write(' ');
  _$jscoverage['/picker-xtpl.js'].lineData[199]++;
  var option45 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[202]++;
  var params46 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[203]++;
  params46.push('week-number-header');
  _$jscoverage['/picker-xtpl.js'].lineData[204]++;
  option45.params = params46;
  _$jscoverage['/picker-xtpl.js'].lineData[205]++;
  var commandRet47 = callCommandUtil(engine, scope, option45, buffer, "getBaseCssClasses", 50);
  _$jscoverage['/picker-xtpl.js'].lineData[206]++;
  if (visit12_206_1(commandRet47 && commandRet47.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[207]++;
    buffer = commandRet47;
    _$jscoverage['/picker-xtpl.js'].lineData[208]++;
    commandRet47 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[210]++;
  buffer.write(commandRet47, true);
  _$jscoverage['/picker-xtpl.js'].lineData[211]++;
  buffer.write('">\n                <span class="');
  _$jscoverage['/picker-xtpl.js'].lineData[212]++;
  var option48 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[215]++;
  var params49 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[216]++;
  params49.push('column-header-inner');
  _$jscoverage['/picker-xtpl.js'].lineData[217]++;
  option48.params = params49;
  _$jscoverage['/picker-xtpl.js'].lineData[218]++;
  var commandRet50 = callCommandUtil(engine, scope, option48, buffer, "getBaseCssClasses", 51);
  _$jscoverage['/picker-xtpl.js'].lineData[219]++;
  if (visit13_219_1(commandRet50 && commandRet50.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[220]++;
    buffer = commandRet50;
    _$jscoverage['/picker-xtpl.js'].lineData[221]++;
    commandRet50 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[223]++;
  buffer.write(commandRet50, true);
  _$jscoverage['/picker-xtpl.js'].lineData[224]++;
  buffer.write('">x</span>\n            </th>\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[226]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[228]++;
  buffer = ifCommand.call(engine, scope, option39, buffer, 49, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[229]++;
  buffer.write('\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[230]++;
  var option51 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[233]++;
  var params52 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[234]++;
  var id53 = scope.resolve(["weekdays"]);
  _$jscoverage['/picker-xtpl.js'].lineData[235]++;
  params52.push(id53);
  _$jscoverage['/picker-xtpl.js'].lineData[236]++;
  option51.params = params52;
  _$jscoverage['/picker-xtpl.js'].lineData[237]++;
  option51.fn = function(scope, buffer) {
  _$jscoverage['/picker-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker-xtpl.js'].lineData[239]++;
  buffer.write('\n            <th role="columnheader" title="');
  _$jscoverage['/picker-xtpl.js'].lineData[240]++;
  var id54 = scope.resolve(["this"]);
  _$jscoverage['/picker-xtpl.js'].lineData[241]++;
  buffer.write(id54, true);
  _$jscoverage['/picker-xtpl.js'].lineData[242]++;
  buffer.write('" class="');
  _$jscoverage['/picker-xtpl.js'].lineData[243]++;
  var option55 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[246]++;
  var params56 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[247]++;
  params56.push('column-header');
  _$jscoverage['/picker-xtpl.js'].lineData[248]++;
  option55.params = params56;
  _$jscoverage['/picker-xtpl.js'].lineData[249]++;
  var commandRet57 = callCommandUtil(engine, scope, option55, buffer, "getBaseCssClasses", 55);
  _$jscoverage['/picker-xtpl.js'].lineData[250]++;
  if (visit14_250_1(commandRet57 && commandRet57.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[251]++;
    buffer = commandRet57;
    _$jscoverage['/picker-xtpl.js'].lineData[252]++;
    commandRet57 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[254]++;
  buffer.write(commandRet57, true);
  _$jscoverage['/picker-xtpl.js'].lineData[255]++;
  buffer.write('">\n                <span class="');
  _$jscoverage['/picker-xtpl.js'].lineData[256]++;
  var option58 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[259]++;
  var params59 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[260]++;
  params59.push('column-header-inner');
  _$jscoverage['/picker-xtpl.js'].lineData[261]++;
  option58.params = params59;
  _$jscoverage['/picker-xtpl.js'].lineData[262]++;
  var commandRet60 = callCommandUtil(engine, scope, option58, buffer, "getBaseCssClasses", 56);
  _$jscoverage['/picker-xtpl.js'].lineData[263]++;
  if (visit15_263_1(commandRet60 && commandRet60.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[264]++;
    buffer = commandRet60;
    _$jscoverage['/picker-xtpl.js'].lineData[265]++;
    commandRet60 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[267]++;
  buffer.write(commandRet60, true);
  _$jscoverage['/picker-xtpl.js'].lineData[268]++;
  buffer.write('">\n                    ');
  _$jscoverage['/picker-xtpl.js'].lineData[269]++;
  var id62 = scope.resolve(["xindex"]);
  _$jscoverage['/picker-xtpl.js'].lineData[270]++;
  var id61 = scope.resolve(["veryShortWeekdays", id62]);
  _$jscoverage['/picker-xtpl.js'].lineData[271]++;
  buffer.write(id61, true);
  _$jscoverage['/picker-xtpl.js'].lineData[272]++;
  buffer.write('\n                </span>\n            </th>\n            ');
  _$jscoverage['/picker-xtpl.js'].lineData[274]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[276]++;
  buffer = eachCommand.call(engine, scope, option51, buffer, 54, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[277]++;
  buffer.write('\n        </tr>\n        </thead>\n        <tbody id="ks-date-picker-tbody-');
  _$jscoverage['/picker-xtpl.js'].lineData[278]++;
  var id63 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[279]++;
  buffer.write(id63, true);
  _$jscoverage['/picker-xtpl.js'].lineData[280]++;
  buffer.write('">\n        ');
  _$jscoverage['/picker-xtpl.js'].lineData[281]++;
  var option64 = {};
  _$jscoverage['/picker-xtpl.js'].lineData[282]++;
  var commandRet65 = callCommandUtil(engine, scope, option64, buffer, "renderDates", 64);
  _$jscoverage['/picker-xtpl.js'].lineData[283]++;
  if (visit16_283_1(commandRet65 && commandRet65.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[284]++;
    buffer = commandRet65;
    _$jscoverage['/picker-xtpl.js'].lineData[285]++;
    commandRet65 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[287]++;
  buffer.write(commandRet65, false);
  _$jscoverage['/picker-xtpl.js'].lineData[288]++;
  buffer.write('\n        </tbody>\n    </table>\n</div>\n');
  _$jscoverage['/picker-xtpl.js'].lineData[289]++;
  var option66 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[292]++;
  var params67 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[293]++;
  var id68 = scope.resolve(["showToday"]);
  _$jscoverage['/picker-xtpl.js'].lineData[294]++;
  var exp70 = id68;
  _$jscoverage['/picker-xtpl.js'].lineData[295]++;
  if (visit17_295_1(!(id68))) {
    _$jscoverage['/picker-xtpl.js'].lineData[296]++;
    var id69 = scope.resolve(["showClear"]);
    _$jscoverage['/picker-xtpl.js'].lineData[297]++;
    exp70 = id69;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[299]++;
  params67.push(exp70);
  _$jscoverage['/picker-xtpl.js'].lineData[300]++;
  option66.params = params67;
  _$jscoverage['/picker-xtpl.js'].lineData[301]++;
  option66.fn = function(scope, buffer) {
  _$jscoverage['/picker-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker-xtpl.js'].lineData[303]++;
  buffer.write('\n<div class="');
  _$jscoverage['/picker-xtpl.js'].lineData[304]++;
  var option71 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[307]++;
  var params72 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[308]++;
  params72.push('footer');
  _$jscoverage['/picker-xtpl.js'].lineData[309]++;
  option71.params = params72;
  _$jscoverage['/picker-xtpl.js'].lineData[310]++;
  var commandRet73 = callCommandUtil(engine, scope, option71, buffer, "getBaseCssClasses", 69);
  _$jscoverage['/picker-xtpl.js'].lineData[311]++;
  if (visit18_311_1(commandRet73 && commandRet73.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[312]++;
    buffer = commandRet73;
    _$jscoverage['/picker-xtpl.js'].lineData[313]++;
    commandRet73 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[315]++;
  buffer.write(commandRet73, true);
  _$jscoverage['/picker-xtpl.js'].lineData[316]++;
  buffer.write('">\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[317]++;
  var option74 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[320]++;
  var params75 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[321]++;
  params75.push('today-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[322]++;
  option74.params = params75;
  _$jscoverage['/picker-xtpl.js'].lineData[323]++;
  var commandRet76 = callCommandUtil(engine, scope, option74, buffer, "getBaseCssClasses", 70);
  _$jscoverage['/picker-xtpl.js'].lineData[324]++;
  if (visit19_324_1(commandRet76 && commandRet76.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[325]++;
    buffer = commandRet76;
    _$jscoverage['/picker-xtpl.js'].lineData[326]++;
    commandRet76 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[328]++;
  buffer.write(commandRet76, true);
  _$jscoverage['/picker-xtpl.js'].lineData[329]++;
  buffer.write('"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-today-btn-');
  _$jscoverage['/picker-xtpl.js'].lineData[330]++;
  var id77 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[331]++;
  buffer.write(id77, true);
  _$jscoverage['/picker-xtpl.js'].lineData[332]++;
  buffer.write('"\n       title="');
  _$jscoverage['/picker-xtpl.js'].lineData[333]++;
  var id78 = scope.resolve(["todayTimeLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[334]++;
  buffer.write(id78, true);
  _$jscoverage['/picker-xtpl.js'].lineData[335]++;
  buffer.write('">');
  _$jscoverage['/picker-xtpl.js'].lineData[336]++;
  var id79 = scope.resolve(["todayLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[337]++;
  buffer.write(id79, true);
  _$jscoverage['/picker-xtpl.js'].lineData[338]++;
  buffer.write('</a>\n    <a class="');
  _$jscoverage['/picker-xtpl.js'].lineData[339]++;
  var option80 = {
  escape: 1};
  _$jscoverage['/picker-xtpl.js'].lineData[342]++;
  var params81 = [];
  _$jscoverage['/picker-xtpl.js'].lineData[343]++;
  params81.push('clear-btn');
  _$jscoverage['/picker-xtpl.js'].lineData[344]++;
  option80.params = params81;
  _$jscoverage['/picker-xtpl.js'].lineData[345]++;
  var commandRet82 = callCommandUtil(engine, scope, option80, buffer, "getBaseCssClasses", 77);
  _$jscoverage['/picker-xtpl.js'].lineData[346]++;
  if (visit20_346_1(commandRet82 && commandRet82.isBuffer)) {
    _$jscoverage['/picker-xtpl.js'].lineData[347]++;
    buffer = commandRet82;
    _$jscoverage['/picker-xtpl.js'].lineData[348]++;
    commandRet82 = undefined;
  }
  _$jscoverage['/picker-xtpl.js'].lineData[350]++;
  buffer.write(commandRet82, true);
  _$jscoverage['/picker-xtpl.js'].lineData[351]++;
  buffer.write('"\n       role="button"\n       hidefocus="on"\n       tabindex="-1"\n       href="#"\n       id="ks-date-picker-clear-btn-');
  _$jscoverage['/picker-xtpl.js'].lineData[352]++;
  var id83 = scope.resolve(["id"]);
  _$jscoverage['/picker-xtpl.js'].lineData[353]++;
  buffer.write(id83, true);
  _$jscoverage['/picker-xtpl.js'].lineData[354]++;
  buffer.write('">');
  _$jscoverage['/picker-xtpl.js'].lineData[355]++;
  var id84 = scope.resolve(["clearLabel"]);
  _$jscoverage['/picker-xtpl.js'].lineData[356]++;
  buffer.write(id84, true);
  _$jscoverage['/picker-xtpl.js'].lineData[357]++;
  buffer.write('</a>\n</div>\n');
  _$jscoverage['/picker-xtpl.js'].lineData[359]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[361]++;
  buffer = ifCommand.call(engine, scope, option66, buffer, 68, payload);
  _$jscoverage['/picker-xtpl.js'].lineData[362]++;
  return buffer;
};
  _$jscoverage['/picker-xtpl.js'].lineData[364]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker-xtpl.js'].lineData[365]++;
  return t;
});
