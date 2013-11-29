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
if (! _$jscoverage['/kison/grammar.js']) {
  _$jscoverage['/kison/grammar.js'] = {};
  _$jscoverage['/kison/grammar.js'].lineData = [];
  _$jscoverage['/kison/grammar.js'].lineData[6] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[8] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[9] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[10] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[11] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[12] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[13] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[14] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[15] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[16] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[30] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[31] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[32] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[33] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[35] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[38] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[39] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[40] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[41] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[44] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[47] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[48] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[50] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[51] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[53] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[54] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[56] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[57] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[59] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[60] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[61] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[63] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[65] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[66] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[67] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[69] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[77] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[79] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[83] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[88] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[89] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[90] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[91] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[92] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[94] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[97] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[98] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[99] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[100] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[101] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[102] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[103] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[107] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[111] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[112] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[113] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[114] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[115] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[121] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[126] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[127] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[130] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[131] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[136] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[138] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[139] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[140] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[149] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[161] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[162] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[167] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[168] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[169] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[170] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[171] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[172] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[175] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[176] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[182] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[184] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[185] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[186] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[187] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[188] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[189] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[199] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[202] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[203] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[204] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[205] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[208] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[210] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[211] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[214] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[219] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[225] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[226] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[227] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[228] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[230] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[232] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[233] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[236] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[238] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[239] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[242] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[247] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[254] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[255] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[263] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[264] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[265] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[266] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[267] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[271] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[273] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[274] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[275] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[276] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[278] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[279] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[280] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[288] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[293] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[294] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[296] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[298] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[305] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[306] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[307] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[308] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[311] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[312] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[314] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[328] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[329] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[330] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[332] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[333] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[334] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[343] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[347] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[349] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[350] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[353] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[354] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[360] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[361] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[362] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[364] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[365] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[369] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[373] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[374] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[375] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[376] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[379] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[385] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[391] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[393] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[403] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[405] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[408] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[410] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[411] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[412] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[413] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[414] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[416] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[417] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[421] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[422] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[425] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[427] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[429] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[430] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[433] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[435] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[436] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[438] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[439] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[442] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[443] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[451] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[454] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[455] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[456] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[457] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[458] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[460] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[462] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[466] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[468] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[469] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[470] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[473] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[474] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[475] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[476] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[480] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[487] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[501] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[502] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[503] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[505] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[507] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[509] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[510] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[511] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[512] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[513] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[514] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[515] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[516] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[517] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[518] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[519] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[520] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[521] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[523] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[524] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[525] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[526] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[527] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[528] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[530] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[533] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[538] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[539] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[540] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[541] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[542] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[543] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[544] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[545] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[547] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[548] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[549] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[550] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[551] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[552] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[554] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[561] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[562] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[563] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[564] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[565] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[566] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[567] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[568] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[569] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[570] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[571] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[573] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[574] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[575] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[576] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[577] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[578] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[579] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[580] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[581] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[582] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[584] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[586] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[587] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[588] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[589] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[590] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[591] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[593] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[594] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[595] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[596] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[597] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[598] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[599] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[600] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[601] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[602] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[604] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[612] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[619] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[620] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[621] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[622] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[625] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[627] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[629] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[630] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[631] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[632] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[633] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[634] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[635] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[636] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[638] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[639] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[641] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[645] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[647] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[648] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[649] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[653] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[657] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[659] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[664] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[666] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[668] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[669] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[671] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[672] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[674] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[677] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[679] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[681] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[686] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[688] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[690] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[691] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[694] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[695] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[696] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[697] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[698] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[717] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[718] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[720] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[721] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[732] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[733] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[745] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[747] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[749] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[751] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[752] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[755] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[756] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[757] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[761] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[763] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[764] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[765] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[766] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[767] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[770] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[773] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[774] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[777] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[779] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[781] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[784] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[787] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[789] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[792] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[801] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[803] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[805] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[806] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[809] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[810] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[813] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[814] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[816] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[819] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[820] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[821] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[824] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[826] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[828] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[830] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[832] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[835] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[840] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].functionData) {
  _$jscoverage['/kison/grammar.js'].functionData = [];
  _$jscoverage['/kison/grammar.js'].functionData[0] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[1] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[2] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[3] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[4] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[5] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[6] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[7] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[8] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[9] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[10] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[11] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[12] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[13] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[14] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[15] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[16] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[17] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[18] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[19] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[20] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[21] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[22] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[23] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[24] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[25] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[26] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[27] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[28] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[29] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[30] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[31] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[32] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[33] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[34] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[35] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[36] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[37] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[38] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[39] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[40] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[41] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[42] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[43] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[44] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[45] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[46] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].branchData) {
  _$jscoverage['/kison/grammar.js'].branchData = {};
  _$jscoverage['/kison/grammar.js'].branchData['39'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['40'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['60'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['66'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['109'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['113'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['114'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['130'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['139'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['168'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['171'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['175'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['184'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['187'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['202'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['204'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['210'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['225'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['227'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['232'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['238'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['265'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['278'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['312'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['328'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['330'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['353'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['360'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['374'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['375'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['416'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['421'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['429'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['435'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['454'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['456'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['458'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['460'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['505'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['512'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['513'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['514'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['515'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['519'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['519'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['533'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['543'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['543'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['563'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['564'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['569'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['569'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['586'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['589'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['589'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['632'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['634'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['638'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['657'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['671'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['690'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['717'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['717'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['751'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['755'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['761'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['763'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['765'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['793'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['794'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['795'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['795'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['805'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['809'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['809'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['813'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['813'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['819'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['819'][1] = new BranchData();
}
_$jscoverage['/kison/grammar.js'].branchData['819'][1].init(1106, 3, 'len');
function visit74_819_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['819'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['813'][1].init(931, 17, 'ret !== undefined');
function visit73_813_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['813'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['809'][1].init(807, 13, 'reducedAction');
function visit72_809_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['809'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['805'][1].init(653, 7, 'i < len');
function visit71_805_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['795'][1].init(260, 31, 'production.rhs || production[1]');
function visit70_795_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['795'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['794'][1].init(186, 34, 'production.action || production[2]');
function visit69_794_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['793'][1].init(109, 34, 'production.symbol || production[0]');
function visit68_793_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['765'][1].init(65, 18, 'tableAction[state]');
function visit67_765_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['763'][1].init(488, 7, '!action');
function visit66_763_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['761'][1].init(419, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit65_761_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['755'][1].init(206, 7, '!symbol');
function visit64_755_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['751'][1].init(122, 7, '!symbol');
function visit63_751_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['717'][1].init(26, 22, '!(v instanceof Lexer)');
function visit62_717_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['717'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['690'][1].init(953, 18, 'cfg.compressSymbol');
function visit61_690_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['671'][1].init(129, 6, 'action');
function visit60_671_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['657'][1].init(20, 9, 'cfg || {}');
function visit59_657_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['638'][1].init(492, 32, 'type === GrammarConst.SHIFT_TYPE');
function visit58_638_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['634'][1].init(199, 33, 'type === GrammarConst.REDUCE_TYPE');
function visit57_634_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['632'][1].init(91, 33, 'type === GrammarConst.ACCEPT_TYPE');
function visit56_632_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['589'][2].init(200, 9, 'val !== t');
function visit55_589_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['589'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['589'][1].init(195, 14, 't && val !== t');
function visit54_589_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['586'][1].init(37, 14, 'gotos[i] || {}');
function visit53_586_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['569'][2].init(342, 31, 't.toString() !== val.toString()');
function visit52_569_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['569'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['569'][1].init(337, 36, 't && t.toString() !== val.toString()');
function visit51_569_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['564'][1].init(38, 15, 'action[i] || {}');
function visit50_564_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['563'][1].init(56, 21, '!nonTerminals[symbol]');
function visit49_563_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['543'][2].init(333, 31, 't.toString() !== val.toString()');
function visit48_543_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['543'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['543'][1].init(328, 36, 't && t.toString() !== val.toString()');
function visit47_543_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['533'][1].init(42, 15, 'action[i] || {}');
function visit46_533_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['519'][2].init(300, 31, 't.toString() !== val.toString()');
function visit45_519_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['519'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['519'][1].init(295, 36, 't && t.toString() !== val.toString()');
function visit44_519_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['515'][1].init(46, 15, 'action[i] || {}');
function visit43_515_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['514'][1].init(34, 35, 'item.get(\'lookAhead\')[mappedEndTag]');
function visit42_514_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['513'][1].init(30, 43, 'production.get(\'symbol\') === mappedStartTag');
function visit41_513_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['512'][1].init(118, 56, 'item.get(\'dotPosition\') === production.get(\'rhs\').length');
function visit40_512_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['505'][1].init(647, 19, 'i < itemSets.length');
function visit39_505_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['460'][1].init(44, 27, 'k < one.get(\'items\').length');
function visit38_460_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['458'][1].init(66, 21, 'one.equals(two, true)');
function visit37_458_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['456'][1].init(70, 19, 'j < itemSets.length');
function visit36_456_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['454'][1].init(111, 19, 'i < itemSets.length');
function visit35_454_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['435'][1].init(679, 10, 'index > -1');
function visit34_435_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['429'][1].init(483, 23, 'itemSetNew.size() === 0');
function visit33_429_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['421'][1].init(232, 23, 'itemSet.__cache[symbol]');
function visit32_421_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['416'][1].init(32, 16, '!itemSet.__cache');
function visit31_416_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['375'][1].init(22, 27, 'itemSets[i].equals(itemSet)');
function visit30_375_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['374'][1].init(79, 19, 'i < itemSets.length');
function visit29_374_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['360'][1].init(293, 16, 'itemIndex !== -1');
function visit28_360_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['353'][1].init(210, 16, 'markSymbol === x');
function visit27_353_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['330'][1].init(115, 46, 'cont || (!!findItem.addLookAhead(finalFirsts))');
function visit26_330_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['328'][1].init(629, 16, 'itemIndex !== -1');
function visit25_328_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['312'][1].init(30, 30, 'p2.get(\'symbol\') === dotSymbol');
function visit24_312_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['278'][1].init(292, 54, 'setSize(firsts) !== setSize(nonTerminal.get(\'firsts\'))');
function visit23_278_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['265'][1].init(99, 53, 'setSize(firsts) !== setSize(production.get(\'firsts\'))');
function visit22_265_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['238'][1].init(691, 21, '!nonTerminals[symbol]');
function visit21_238_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['232'][1].init(233, 19, '!self.isNullable(t)');
function visit20_232_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['227'][1].init(26, 16, '!nonTerminals[t]');
function visit19_227_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['225'][1].init(196, 23, 'symbol instanceof Array');
function visit18_225_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['210'][1].init(426, 21, '!nonTerminals[symbol]');
function visit17_210_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['204'][1].init(26, 19, '!self.isNullable(t)');
function visit16_204_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['202'][1].init(126, 23, 'symbol instanceof Array');
function visit15_202_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['187'][1].init(34, 26, 'production.get(\'nullable\')');
function visit14_187_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['184'][1].init(28, 37, '!nonTerminals[symbol].get(\'nullable\')');
function visit13_184_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['175'][1].init(300, 7, 'n === i');
function visit12_175_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['171'][1].init(34, 18, 'self.isNullable(t)');
function visit11_171_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['168'][1].init(26, 27, '!production.get(\'nullable\')');
function visit10_168_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['139'][1].init(26, 43, '!terminals[handle] && !nonTerminals[handle]');
function visit9_139_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['130'][1].init(137, 12, '!nonTerminal');
function visit8_130_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['114'][1].init(74, 5, 'token');
function visit7_114_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['113'][1].init(30, 21, 'rule.token || rule[0]');
function visit6_113_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['109'][1].init(85, 20, 'lexer && lexer.rules');
function visit5_109_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['66'][1].init(704, 43, 'action[GrammarConst.TO_INDEX] !== undefined');
function visit4_66_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['60'][1].init(445, 51, 'action[GrammarConst.PRODUCTION_INDEX] !== undefined');
function visit3_60_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['40'][1].init(18, 20, 'obj.equals(array[i])');
function visit2_40_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['39'][1].init(26, 16, 'i < array.length');
function visit1_39_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/grammar.js'].functionData[0]++;
  _$jscoverage['/kison/grammar.js'].lineData[8]++;
  var Base = require('base');
  _$jscoverage['/kison/grammar.js'].lineData[9]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/grammar.js'].lineData[10]++;
  var Item = require('./item');
  _$jscoverage['/kison/grammar.js'].lineData[11]++;
  var ItemSet = require('./item-set');
  _$jscoverage['/kison/grammar.js'].lineData[12]++;
  var NonTerminal = require('./non-terminal');
  _$jscoverage['/kison/grammar.js'].lineData[13]++;
  var Lexer = require('./lexer');
  _$jscoverage['/kison/grammar.js'].lineData[14]++;
  var Production = require('./production');
  _$jscoverage['/kison/grammar.js'].lineData[15]++;
  var logger = S.getLogger('s/kison');
  _$jscoverage['/kison/grammar.js'].lineData[16]++;
  var GrammarConst = {
  SHIFT_TYPE: 1, 
  REDUCE_TYPE: 2, 
  ACCEPT_TYPE: 0, 
  TYPE_INDEX: 0, 
  PRODUCTION_INDEX: 1, 
  TO_INDEX: 2}, serializeObject = Utils.serializeObject, mix = S.mix, END_TAG = Lexer.STATIC.END_TAG, START_TAG = '$START';
  _$jscoverage['/kison/grammar.js'].lineData[30]++;
  function setSize(set3) {
    _$jscoverage['/kison/grammar.js'].functionData[1]++;
    _$jscoverage['/kison/grammar.js'].lineData[31]++;
    var count = 0, i;
    _$jscoverage['/kison/grammar.js'].lineData[32]++;
    for (i in set3) {
      _$jscoverage['/kison/grammar.js'].lineData[33]++;
      count++;
    }
    _$jscoverage['/kison/grammar.js'].lineData[35]++;
    return count;
  }
  _$jscoverage['/kison/grammar.js'].lineData[38]++;
  function indexOf(obj, array) {
    _$jscoverage['/kison/grammar.js'].functionData[2]++;
    _$jscoverage['/kison/grammar.js'].lineData[39]++;
    for (var i = 0; visit1_39_1(i < array.length); i++) {
      _$jscoverage['/kison/grammar.js'].lineData[40]++;
      if (visit2_40_1(obj.equals(array[i]))) {
        _$jscoverage['/kison/grammar.js'].lineData[41]++;
        return i;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[44]++;
    return -1;
  }
  _$jscoverage['/kison/grammar.js'].lineData[47]++;
  function visualizeAction(action, productions, itemSets) {
    _$jscoverage['/kison/grammar.js'].functionData[3]++;
    _$jscoverage['/kison/grammar.js'].lineData[48]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[50]++;
        logger.debug('shift');
        _$jscoverage['/kison/grammar.js'].lineData[51]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[53]++;
        logger.debug('reduce');
        _$jscoverage['/kison/grammar.js'].lineData[54]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[56]++;
        logger.debug('accept');
        _$jscoverage['/kison/grammar.js'].lineData[57]++;
        break;
    }
    _$jscoverage['/kison/grammar.js'].lineData[59]++;
    logger.debug('from production:');
    _$jscoverage['/kison/grammar.js'].lineData[60]++;
    if (visit3_60_1(action[GrammarConst.PRODUCTION_INDEX] !== undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[61]++;
      logger.debug(productions[action[GrammarConst.PRODUCTION_INDEX]] + '');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[63]++;
      logger.debug('undefined');
    }
    _$jscoverage['/kison/grammar.js'].lineData[65]++;
    logger.debug('to itemSet:');
    _$jscoverage['/kison/grammar.js'].lineData[66]++;
    if (visit4_66_1(action[GrammarConst.TO_INDEX] !== undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[67]++;
      logger.debug(itemSets[action[GrammarConst.TO_INDEX]].toString(1));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[69]++;
      logger.debug('undefined');
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[77]++;
  return Base.extend({
  build: function() {
  _$jscoverage['/kison/grammar.js'].functionData[4]++;
  _$jscoverage['/kison/grammar.js'].lineData[79]++;
  var self = this, lexer = self.lexer, vs = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[83]++;
  vs.unshift({
  symbol: START_TAG, 
  rhs: [vs[0].symbol]});
  _$jscoverage['/kison/grammar.js'].lineData[88]++;
  S.each(vs, function(v, index) {
  _$jscoverage['/kison/grammar.js'].functionData[5]++;
  _$jscoverage['/kison/grammar.js'].lineData[89]++;
  v.symbol = lexer.mapSymbol(v.symbol);
  _$jscoverage['/kison/grammar.js'].lineData[90]++;
  var rhs = v.rhs;
  _$jscoverage['/kison/grammar.js'].lineData[91]++;
  S.each(rhs, function(r, index) {
  _$jscoverage['/kison/grammar.js'].functionData[6]++;
  _$jscoverage['/kison/grammar.js'].lineData[92]++;
  rhs[index] = lexer.mapSymbol(r);
});
  _$jscoverage['/kison/grammar.js'].lineData[94]++;
  vs[index] = new Production(v);
});
  _$jscoverage['/kison/grammar.js'].lineData[97]++;
  self.buildTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[98]++;
  self.buildNonTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[99]++;
  self.buildNullable();
  _$jscoverage['/kison/grammar.js'].lineData[100]++;
  self.buildFirsts();
  _$jscoverage['/kison/grammar.js'].lineData[101]++;
  self.buildItemSet();
  _$jscoverage['/kison/grammar.js'].lineData[102]++;
  self.buildLalrItemSets();
  _$jscoverage['/kison/grammar.js'].lineData[103]++;
  self.buildTable();
}, 
  buildTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[7]++;
  _$jscoverage['/kison/grammar.js'].lineData[107]++;
  var self = this, lexer = self.get('lexer'), rules = visit5_109_1(lexer && lexer.rules), terminals = self.get('terminals');
  _$jscoverage['/kison/grammar.js'].lineData[111]++;
  terminals[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[112]++;
  S.each(rules, function(rule) {
  _$jscoverage['/kison/grammar.js'].functionData[8]++;
  _$jscoverage['/kison/grammar.js'].lineData[113]++;
  var token = visit6_113_1(rule.token || rule[0]);
  _$jscoverage['/kison/grammar.js'].lineData[114]++;
  if (visit7_114_1(token)) {
    _$jscoverage['/kison/grammar.js'].lineData[115]++;
    terminals[token] = 1;
  }
});
}, 
  buildNonTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[9]++;
  _$jscoverage['/kison/grammar.js'].lineData[121]++;
  var self = this, terminals = self.get('terminals'), nonTerminals = self.get('nonTerminals'), productions = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[126]++;
  S.each(productions, function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[10]++;
  _$jscoverage['/kison/grammar.js'].lineData[127]++;
  var symbol = production.get('symbol'), nonTerminal = nonTerminals[symbol];
  _$jscoverage['/kison/grammar.js'].lineData[130]++;
  if (visit8_130_1(!nonTerminal)) {
    _$jscoverage['/kison/grammar.js'].lineData[131]++;
    nonTerminal = nonTerminals[symbol] = new NonTerminal({
  symbol: symbol});
  }
  _$jscoverage['/kison/grammar.js'].lineData[136]++;
  nonTerminal.get('productions').push(production);
  _$jscoverage['/kison/grammar.js'].lineData[138]++;
  S.each(production.get('handles'), function(handle) {
  _$jscoverage['/kison/grammar.js'].functionData[11]++;
  _$jscoverage['/kison/grammar.js'].lineData[139]++;
  if (visit9_139_1(!terminals[handle] && !nonTerminals[handle])) {
    _$jscoverage['/kison/grammar.js'].lineData[140]++;
    nonTerminals[handle] = new NonTerminal({
  symbol: handle});
  }
});
});
}, 
  buildNullable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[12]++;
  _$jscoverage['/kison/grammar.js'].lineData[149]++;
  var self = this, i, rhs, n, symbol, t, production, productions, nonTerminals = self.get('nonTerminals'), cont = true;
  _$jscoverage['/kison/grammar.js'].lineData[161]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[162]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[167]++;
    S.each(self.get('productions'), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[13]++;
  _$jscoverage['/kison/grammar.js'].lineData[168]++;
  if (visit10_168_1(!production.get('nullable'))) {
    _$jscoverage['/kison/grammar.js'].lineData[169]++;
    rhs = production.get('rhs');
    _$jscoverage['/kison/grammar.js'].lineData[170]++;
    for (i = 0 , n = 0; (t = rhs[i]); ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[171]++;
      if (visit11_171_1(self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[172]++;
        n++;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[175]++;
    if (visit12_175_1(n === i)) {
      _$jscoverage['/kison/grammar.js'].lineData[176]++;
      production.set('nullable', cont = true);
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[182]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[184]++;
      if (visit13_184_1(!nonTerminals[symbol].get('nullable'))) {
        _$jscoverage['/kison/grammar.js'].lineData[185]++;
        productions = nonTerminals[symbol].get('productions');
        _$jscoverage['/kison/grammar.js'].lineData[186]++;
        for (i = 0; (production = productions[i]); i++) {
          _$jscoverage['/kison/grammar.js'].lineData[187]++;
          if (visit14_187_1(production.get('nullable'))) {
            _$jscoverage['/kison/grammar.js'].lineData[188]++;
            nonTerminals[symbol].set('nullable', cont = true);
            _$jscoverage['/kison/grammar.js'].lineData[189]++;
            break;
          }
        }
      }
    }
  }
}, 
  isNullable: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[14]++;
  _$jscoverage['/kison/grammar.js'].lineData[199]++;
  var self = this, nonTerminals = self.get('nonTerminals');
  _$jscoverage['/kison/grammar.js'].lineData[202]++;
  if (visit15_202_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[203]++;
    for (var i = 0, t; (t = symbol[i]); ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[204]++;
      if (visit16_204_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[205]++;
        return false;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[208]++;
    return true;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[210]++;
    if (visit17_210_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[211]++;
      return false;
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[214]++;
      return nonTerminals[symbol].get('nullable');
    }
  }
}, 
  findFirst: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[15]++;
  _$jscoverage['/kison/grammar.js'].lineData[219]++;
  var self = this, firsts = {}, t, i, nonTerminals = self.get('nonTerminals');
  _$jscoverage['/kison/grammar.js'].lineData[225]++;
  if (visit18_225_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[226]++;
    for (i = 0; (t = symbol[i]); ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[227]++;
      if (visit19_227_1(!nonTerminals[t])) {
        _$jscoverage['/kison/grammar.js'].lineData[228]++;
        firsts[t] = 1;
      } else {
        _$jscoverage['/kison/grammar.js'].lineData[230]++;
        mix(firsts, nonTerminals[t].get('firsts'));
      }
      _$jscoverage['/kison/grammar.js'].lineData[232]++;
      if (visit20_232_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[233]++;
        break;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[236]++;
    return firsts;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[238]++;
    if (visit21_238_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[239]++;
      return [symbol];
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[242]++;
      return nonTerminals[symbol].get('firsts');
    }
  }
}, 
  buildFirsts: function() {
  _$jscoverage['/kison/grammar.js'].functionData[16]++;
  _$jscoverage['/kison/grammar.js'].lineData[247]++;
  var self = this, nonTerminal, nonTerminals = self.get('nonTerminals'), cont = true, symbol, firsts;
  _$jscoverage['/kison/grammar.js'].lineData[254]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[255]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[263]++;
    S.each(self.get('productions'), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[17]++;
  _$jscoverage['/kison/grammar.js'].lineData[264]++;
  var firsts = self.findFirst(production.get('rhs'));
  _$jscoverage['/kison/grammar.js'].lineData[265]++;
  if (visit22_265_1(setSize(firsts) !== setSize(production.get('firsts')))) {
    _$jscoverage['/kison/grammar.js'].lineData[266]++;
    production.set('firsts', firsts);
    _$jscoverage['/kison/grammar.js'].lineData[267]++;
    cont = true;
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[271]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[273]++;
      nonTerminal = nonTerminals[symbol];
      _$jscoverage['/kison/grammar.js'].lineData[274]++;
      firsts = {};
      _$jscoverage['/kison/grammar.js'].lineData[275]++;
      S.each(nonTerminal.get('productions'), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[18]++;
  _$jscoverage['/kison/grammar.js'].lineData[276]++;
  mix(firsts, production.get('firsts'));
});
      _$jscoverage['/kison/grammar.js'].lineData[278]++;
      if (visit23_278_1(setSize(firsts) !== setSize(nonTerminal.get('firsts')))) {
        _$jscoverage['/kison/grammar.js'].lineData[279]++;
        nonTerminal.set('firsts', firsts);
        _$jscoverage['/kison/grammar.js'].lineData[280]++;
        cont = true;
      }
    }
  }
}, 
  closure: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[19]++;
  _$jscoverage['/kison/grammar.js'].lineData[288]++;
  var self = this, items = itemSet.get('items'), productions = self.get('productions'), cont = 1;
  _$jscoverage['/kison/grammar.js'].lineData[293]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[294]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[296]++;
    S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[20]++;
  _$jscoverage['/kison/grammar.js'].lineData[298]++;
  var dotPosition = item.get('dotPosition'), production = item.get('production'), rhs = production.get('rhs'), dotSymbol = rhs[dotPosition], lookAhead = item.get('lookAhead'), finalFirsts = {};
  _$jscoverage['/kison/grammar.js'].lineData[305]++;
  S.each(lookAhead, function(_, ahead) {
  _$jscoverage['/kison/grammar.js'].functionData[21]++;
  _$jscoverage['/kison/grammar.js'].lineData[306]++;
  var rightRhs = rhs.slice(dotPosition + 1);
  _$jscoverage['/kison/grammar.js'].lineData[307]++;
  rightRhs.push(ahead);
  _$jscoverage['/kison/grammar.js'].lineData[308]++;
  S.mix(finalFirsts, self.findFirst(rightRhs));
});
  _$jscoverage['/kison/grammar.js'].lineData[311]++;
  S.each(productions, function(p2) {
  _$jscoverage['/kison/grammar.js'].functionData[22]++;
  _$jscoverage['/kison/grammar.js'].lineData[312]++;
  if (visit24_312_1(p2.get('symbol') === dotSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[314]++;
    var newItem = new Item({
  production: p2}), itemIndex = itemSet.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[328]++;
    if (visit25_328_1(itemIndex !== -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[329]++;
      findItem = itemSet.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[330]++;
      cont = visit26_330_1(cont || (!!findItem.addLookAhead(finalFirsts)));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[332]++;
      newItem.addLookAhead(finalFirsts);
      _$jscoverage['/kison/grammar.js'].lineData[333]++;
      itemSet.addItem(newItem);
      _$jscoverage['/kison/grammar.js'].lineData[334]++;
      cont = true;
    }
  }
});
});
  }
  _$jscoverage['/kison/grammar.js'].lineData[343]++;
  return itemSet;
}, 
  gotos: function(i, x) {
  _$jscoverage['/kison/grammar.js'].functionData[23]++;
  _$jscoverage['/kison/grammar.js'].lineData[347]++;
  var j = new ItemSet(), iItems = i.get('items');
  _$jscoverage['/kison/grammar.js'].lineData[349]++;
  S.each(iItems, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[24]++;
  _$jscoverage['/kison/grammar.js'].lineData[350]++;
  var production = item.get('production'), dotPosition = item.get('dotPosition'), markSymbol = production.get('rhs')[dotPosition];
  _$jscoverage['/kison/grammar.js'].lineData[353]++;
  if (visit27_353_1(markSymbol === x)) {
    _$jscoverage['/kison/grammar.js'].lineData[354]++;
    var newItem = new Item({
  production: production, 
  dotPosition: dotPosition + 1}), itemIndex = j.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[360]++;
    if (visit28_360_1(itemIndex !== -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[361]++;
      findItem = j.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[362]++;
      findItem.addLookAhead(item.get('lookAhead'));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[364]++;
      newItem.addLookAhead(item.get('lookAhead'));
      _$jscoverage['/kison/grammar.js'].lineData[365]++;
      j.addItem(newItem);
    }
  }
});
  _$jscoverage['/kison/grammar.js'].lineData[369]++;
  return this.closure(j);
}, 
  findItemSetIndex: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[25]++;
  _$jscoverage['/kison/grammar.js'].lineData[373]++;
  var itemSets = this.get('itemSets'), i;
  _$jscoverage['/kison/grammar.js'].lineData[374]++;
  for (i = 0; visit29_374_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[375]++;
    if (visit30_375_1(itemSets[i].equals(itemSet))) {
      _$jscoverage['/kison/grammar.js'].lineData[376]++;
      return i;
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[379]++;
  return -1;
}, 
  buildItemSet: function() {
  _$jscoverage['/kison/grammar.js'].functionData[26]++;
  _$jscoverage['/kison/grammar.js'].lineData[385]++;
  var self = this, lexer = self.lexer, itemSets = self.get('itemSets'), lookAheadTmp = {}, productions = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[391]++;
  lookAheadTmp[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[393]++;
  var initItemSet = self.closure(new ItemSet({
  items: [new Item({
  production: productions[0], 
  lookAhead: lookAheadTmp})]}));
  _$jscoverage['/kison/grammar.js'].lineData[403]++;
  itemSets.push(initItemSet);
  _$jscoverage['/kison/grammar.js'].lineData[405]++;
  var condition = true, symbols = S.merge(self.get('terminals'), self.get('nonTerminals'));
  _$jscoverage['/kison/grammar.js'].lineData[408]++;
  delete symbols[lexer.mapSymbol(END_TAG)];
  _$jscoverage['/kison/grammar.js'].lineData[410]++;
  while (condition) {
    _$jscoverage['/kison/grammar.js'].lineData[411]++;
    condition = false;
    _$jscoverage['/kison/grammar.js'].lineData[412]++;
    var itemSets2 = itemSets.concat();
    _$jscoverage['/kison/grammar.js'].lineData[413]++;
    S.each(itemSets2, function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[27]++;
  _$jscoverage['/kison/grammar.js'].lineData[414]++;
  S.each(symbols, function(v, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[28]++;
  _$jscoverage['/kison/grammar.js'].lineData[416]++;
  if (visit31_416_1(!itemSet.__cache)) {
    _$jscoverage['/kison/grammar.js'].lineData[417]++;
    itemSet.__cache = {};
  }
  _$jscoverage['/kison/grammar.js'].lineData[421]++;
  if (visit32_421_1(itemSet.__cache[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[422]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[425]++;
  var itemSetNew = self.gotos(itemSet, symbol);
  _$jscoverage['/kison/grammar.js'].lineData[427]++;
  itemSet.__cache[symbol] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[429]++;
  if (visit33_429_1(itemSetNew.size() === 0)) {
    _$jscoverage['/kison/grammar.js'].lineData[430]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[433]++;
  var index = self.findItemSetIndex(itemSetNew);
  _$jscoverage['/kison/grammar.js'].lineData[435]++;
  if (visit34_435_1(index > -1)) {
    _$jscoverage['/kison/grammar.js'].lineData[436]++;
    itemSetNew = itemSets[index];
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[438]++;
    itemSets.push(itemSetNew);
    _$jscoverage['/kison/grammar.js'].lineData[439]++;
    condition = true;
  }
  _$jscoverage['/kison/grammar.js'].lineData[442]++;
  itemSet.get('gotos')[symbol] = itemSetNew;
  _$jscoverage['/kison/grammar.js'].lineData[443]++;
  itemSetNew.addReverseGoto(symbol, itemSet);
});
});
  }
}, 
  buildLalrItemSets: function() {
  _$jscoverage['/kison/grammar.js'].functionData[29]++;
  _$jscoverage['/kison/grammar.js'].lineData[451]++;
  var itemSets = this.get('itemSets'), i, j, one, two;
  _$jscoverage['/kison/grammar.js'].lineData[454]++;
  for (i = 0; visit35_454_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[455]++;
    one = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[456]++;
    for (j = i + 1; visit36_456_1(j < itemSets.length); j++) {
      _$jscoverage['/kison/grammar.js'].lineData[457]++;
      two = itemSets[j];
      _$jscoverage['/kison/grammar.js'].lineData[458]++;
      if (visit37_458_1(one.equals(two, true))) {
        _$jscoverage['/kison/grammar.js'].lineData[460]++;
        for (var k = 0; visit38_460_1(k < one.get('items').length); k++) {
          _$jscoverage['/kison/grammar.js'].lineData[462]++;
          one.get('items')[k].addLookAhead(two.get('items')[k].get('lookAhead'));
        }
        _$jscoverage['/kison/grammar.js'].lineData[466]++;
        var oneGotos = one.get('gotos');
        _$jscoverage['/kison/grammar.js'].lineData[468]++;
        S.each(two.get('gotos'), function(item, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[30]++;
  _$jscoverage['/kison/grammar.js'].lineData[469]++;
  oneGotos[symbol] = item;
  _$jscoverage['/kison/grammar.js'].lineData[470]++;
  item.addReverseGoto(symbol, one);
});
        _$jscoverage['/kison/grammar.js'].lineData[473]++;
        S.each(two.get('reverseGotos'), function(items, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[31]++;
  _$jscoverage['/kison/grammar.js'].lineData[474]++;
  S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[32]++;
  _$jscoverage['/kison/grammar.js'].lineData[475]++;
  item.get('gotos')[symbol] = one;
  _$jscoverage['/kison/grammar.js'].lineData[476]++;
  one.addReverseGoto(symbol, item);
});
});
        _$jscoverage['/kison/grammar.js'].lineData[480]++;
        itemSets.splice(j--, 1);
      }
    }
  }
}, 
  buildTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[33]++;
  _$jscoverage['/kison/grammar.js'].lineData[487]++;
  var self = this, lexer = self.lexer, table = self.get('table'), itemSets = self.get('itemSets'), productions = self.get('productions'), mappedStartTag = lexer.mapSymbol(START_TAG), mappedEndTag = lexer.mapSymbol(END_TAG), gotos = {}, action = {}, nonTerminals, i, itemSet, t;
  _$jscoverage['/kison/grammar.js'].lineData[501]++;
  table.gotos = gotos;
  _$jscoverage['/kison/grammar.js'].lineData[502]++;
  table.action = action;
  _$jscoverage['/kison/grammar.js'].lineData[503]++;
  nonTerminals = self.get('nonTerminals');
  _$jscoverage['/kison/grammar.js'].lineData[505]++;
  for (i = 0; visit39_505_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[507]++;
    itemSet = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[509]++;
    S.each(itemSet.get('items'), function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[34]++;
  _$jscoverage['/kison/grammar.js'].lineData[510]++;
  var production = item.get('production');
  _$jscoverage['/kison/grammar.js'].lineData[511]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[512]++;
  if (visit40_512_1(item.get('dotPosition') === production.get('rhs').length)) {
    _$jscoverage['/kison/grammar.js'].lineData[513]++;
    if (visit41_513_1(production.get('symbol') === mappedStartTag)) {
      _$jscoverage['/kison/grammar.js'].lineData[514]++;
      if (visit42_514_1(item.get('lookAhead')[mappedEndTag])) {
        _$jscoverage['/kison/grammar.js'].lineData[515]++;
        action[i] = visit43_515_1(action[i] || {});
        _$jscoverage['/kison/grammar.js'].lineData[516]++;
        t = action[i][mappedEndTag];
        _$jscoverage['/kison/grammar.js'].lineData[517]++;
        val = [];
        _$jscoverage['/kison/grammar.js'].lineData[518]++;
        val[GrammarConst.TYPE_INDEX] = GrammarConst.ACCEPT_TYPE;
        _$jscoverage['/kison/grammar.js'].lineData[519]++;
        if (visit44_519_1(t && visit45_519_2(t.toString() !== val.toString()))) {
          _$jscoverage['/kison/grammar.js'].lineData[520]++;
          logger.debug(new Array(29).join('*'));
          _$jscoverage['/kison/grammar.js'].lineData[521]++;
          logger.debug('***** conflict in reduce: action already defined ->', 'warn');
          _$jscoverage['/kison/grammar.js'].lineData[523]++;
          logger.debug('***** current item:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[524]++;
          logger.debug(item.toString());
          _$jscoverage['/kison/grammar.js'].lineData[525]++;
          logger.debug('***** current action:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[526]++;
          visualizeAction(t, productions, itemSets);
          _$jscoverage['/kison/grammar.js'].lineData[527]++;
          logger.debug('***** will be overwritten ->', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[528]++;
          visualizeAction(val, productions, itemSets);
        }
        _$jscoverage['/kison/grammar.js'].lineData[530]++;
        action[i][mappedEndTag] = val;
      }
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[533]++;
      action[i] = visit46_533_1(action[i] || {});
      _$jscoverage['/kison/grammar.js'].lineData[538]++;
      S.each(item.get('lookAhead'), function(_, l) {
  _$jscoverage['/kison/grammar.js'].functionData[35]++;
  _$jscoverage['/kison/grammar.js'].lineData[539]++;
  t = action[i][l];
  _$jscoverage['/kison/grammar.js'].lineData[540]++;
  val = [];
  _$jscoverage['/kison/grammar.js'].lineData[541]++;
  val[GrammarConst.TYPE_INDEX] = GrammarConst.REDUCE_TYPE;
  _$jscoverage['/kison/grammar.js'].lineData[542]++;
  val[GrammarConst.PRODUCTION_INDEX] = S.indexOf(production, productions);
  _$jscoverage['/kison/grammar.js'].lineData[543]++;
  if (visit47_543_1(t && visit48_543_2(t.toString() !== val.toString()))) {
    _$jscoverage['/kison/grammar.js'].lineData[544]++;
    logger.debug(new Array(29).join('*'));
    _$jscoverage['/kison/grammar.js'].lineData[545]++;
    logger.debug('conflict in reduce: action already defined ->', 'warn');
    _$jscoverage['/kison/grammar.js'].lineData[547]++;
    logger.debug('***** current item:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[548]++;
    logger.debug(item.toString());
    _$jscoverage['/kison/grammar.js'].lineData[549]++;
    logger.debug('***** current action:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[550]++;
    visualizeAction(t, productions, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[551]++;
    logger.debug('***** will be overwritten ->', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[552]++;
    visualizeAction(val, productions, itemSets);
  }
  _$jscoverage['/kison/grammar.js'].lineData[554]++;
  action[i][l] = val;
});
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[561]++;
    S.each(itemSet.get('gotos'), function(anotherItemSet, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[36]++;
  _$jscoverage['/kison/grammar.js'].lineData[562]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[563]++;
  if (visit49_563_1(!nonTerminals[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[564]++;
    action[i] = visit50_564_1(action[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[565]++;
    val = [];
    _$jscoverage['/kison/grammar.js'].lineData[566]++;
    val[GrammarConst.TYPE_INDEX] = GrammarConst.SHIFT_TYPE;
    _$jscoverage['/kison/grammar.js'].lineData[567]++;
    val[GrammarConst.TO_INDEX] = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[568]++;
    t = action[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[569]++;
    if (visit51_569_1(t && visit52_569_2(t.toString() !== val.toString()))) {
      _$jscoverage['/kison/grammar.js'].lineData[570]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[571]++;
      logger.debug('conflict in shift: action already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[573]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[574]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[575]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[576]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[577]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[578]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[579]++;
      logger.debug('***** current action:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[580]++;
      visualizeAction(t, productions, itemSets);
      _$jscoverage['/kison/grammar.js'].lineData[581]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[582]++;
      visualizeAction(val, productions, itemSets);
    }
    _$jscoverage['/kison/grammar.js'].lineData[584]++;
    action[i][symbol] = val;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[586]++;
    gotos[i] = visit53_586_1(gotos[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[587]++;
    t = gotos[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[588]++;
    val = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[589]++;
    if (visit54_589_1(t && visit55_589_2(val !== t))) {
      _$jscoverage['/kison/grammar.js'].lineData[590]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[591]++;
      logger.debug('conflict in shift: goto already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[593]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[594]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[595]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[596]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[597]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[598]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[599]++;
      logger.debug('***** current goto state:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[600]++;
      logger.debug(t);
      _$jscoverage['/kison/grammar.js'].lineData[601]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[602]++;
      logger.debug(val);
    }
    _$jscoverage['/kison/grammar.js'].lineData[604]++;
    gotos[i][symbol] = val;
  }
});
  }
}, 
  visualizeTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[37]++;
  _$jscoverage['/kison/grammar.js'].lineData[612]++;
  var self = this, table = self.get('table'), gotos = table.gotos, action = table.action, productions = self.get('productions'), ret = [];
  _$jscoverage['/kison/grammar.js'].lineData[619]++;
  S.each(self.get('itemSets'), function(itemSet, i) {
  _$jscoverage['/kison/grammar.js'].functionData[38]++;
  _$jscoverage['/kison/grammar.js'].lineData[620]++;
  ret.push(new Array(70).join('*') + ' itemSet : ' + i);
  _$jscoverage['/kison/grammar.js'].lineData[621]++;
  ret.push(itemSet.toString());
  _$jscoverage['/kison/grammar.js'].lineData[622]++;
  ret.push('');
});
  _$jscoverage['/kison/grammar.js'].lineData[625]++;
  ret.push('');
  _$jscoverage['/kison/grammar.js'].lineData[627]++;
  ret.push(new Array(70).join('*') + ' table : ');
  _$jscoverage['/kison/grammar.js'].lineData[629]++;
  S.each(action, function(av, index) {
  _$jscoverage['/kison/grammar.js'].functionData[39]++;
  _$jscoverage['/kison/grammar.js'].lineData[630]++;
  S.each(av, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[40]++;
  _$jscoverage['/kison/grammar.js'].lineData[631]++;
  var str, type = v[GrammarConst.TYPE_INDEX];
  _$jscoverage['/kison/grammar.js'].lineData[632]++;
  if (visit56_632_1(type === GrammarConst.ACCEPT_TYPE)) {
    _$jscoverage['/kison/grammar.js'].lineData[633]++;
    str = 'acc';
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[634]++;
    if (visit57_634_1(type === GrammarConst.REDUCE_TYPE)) {
      _$jscoverage['/kison/grammar.js'].lineData[635]++;
      var production = productions[v[GrammarConst.PRODUCTION_INDEX]];
      _$jscoverage['/kison/grammar.js'].lineData[636]++;
      str = 'r, ' + production.get('symbol') + '=' + production.get('rhs').join(' ');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[638]++;
      if (visit58_638_1(type === GrammarConst.SHIFT_TYPE)) {
        _$jscoverage['/kison/grammar.js'].lineData[639]++;
        str = 's, ' + v[GrammarConst.TO_INDEX];
      }
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[641]++;
  ret.push('action[' + index + ']' + '[' + s + '] = ' + str);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[645]++;
  ret.push('');
  _$jscoverage['/kison/grammar.js'].lineData[647]++;
  S.each(gotos, function(sv, index) {
  _$jscoverage['/kison/grammar.js'].functionData[41]++;
  _$jscoverage['/kison/grammar.js'].lineData[648]++;
  S.each(sv, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[42]++;
  _$jscoverage['/kison/grammar.js'].lineData[649]++;
  ret.push('goto[' + index + ']' + '[' + s + '] = ' + v);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[653]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/grammar.js'].functionData[43]++;
  _$jscoverage['/kison/grammar.js'].lineData[657]++;
  cfg = visit59_657_1(cfg || {});
  _$jscoverage['/kison/grammar.js'].lineData[659]++;
  var self = this, table = self.get('table'), lexer = self.get('lexer'), lexerCode = lexer.genCode(cfg);
  _$jscoverage['/kison/grammar.js'].lineData[664]++;
  self.build();
  _$jscoverage['/kison/grammar.js'].lineData[666]++;
  var productions = [];
  _$jscoverage['/kison/grammar.js'].lineData[668]++;
  S.each(self.get('productions'), function(p) {
  _$jscoverage['/kison/grammar.js'].functionData[44]++;
  _$jscoverage['/kison/grammar.js'].lineData[669]++;
  var action = p.get('action'), ret = [p.get('symbol'), p.get('rhs')];
  _$jscoverage['/kison/grammar.js'].lineData[671]++;
  if (visit60_671_1(action)) {
    _$jscoverage['/kison/grammar.js'].lineData[672]++;
    ret.push(action);
  }
  _$jscoverage['/kison/grammar.js'].lineData[674]++;
  productions.push(ret);
});
  _$jscoverage['/kison/grammar.js'].lineData[677]++;
  var code = [];
  _$jscoverage['/kison/grammar.js'].lineData[679]++;
  code.push('/* Generated by kison from KISSY */');
  _$jscoverage['/kison/grammar.js'].lineData[681]++;
  code.push('var parser = {},' + 'S = KISSY,' + 'GrammarConst = ' + serializeObject(GrammarConst) + ';');
  _$jscoverage['/kison/grammar.js'].lineData[686]++;
  code.push(lexerCode);
  _$jscoverage['/kison/grammar.js'].lineData[688]++;
  code.push('parser.lexer = lexer;');
  _$jscoverage['/kison/grammar.js'].lineData[690]++;
  if (visit61_690_1(cfg.compressSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[691]++;
    code.push('lexer.symbolMap = ' + serializeObject(lexer.symbolMap) + ';');
  }
  _$jscoverage['/kison/grammar.js'].lineData[694]++;
  code.push('parser.productions = ' + serializeObject(productions) + ';');
  _$jscoverage['/kison/grammar.js'].lineData[695]++;
  code.push('parser.table = ' + serializeObject(table) + ';');
  _$jscoverage['/kison/grammar.js'].lineData[696]++;
  code.push('parser.parse = ' + parse.toString() + ';');
  _$jscoverage['/kison/grammar.js'].lineData[697]++;
  code.push('return parser;');
  _$jscoverage['/kison/grammar.js'].lineData[698]++;
  return code.join('\n');
}}, {
  ATTRS: {
  table: {
  value: {}}, 
  itemSets: {
  value: []}, 
  productions: {
  value: []}, 
  nonTerminals: {
  value: {}}, 
  lexer: {
  setter: function(v) {
  _$jscoverage['/kison/grammar.js'].functionData[45]++;
  _$jscoverage['/kison/grammar.js'].lineData[717]++;
  if (visit62_717_1(!(v instanceof Lexer))) {
    _$jscoverage['/kison/grammar.js'].lineData[718]++;
    v = new Lexer(v);
  }
  _$jscoverage['/kison/grammar.js'].lineData[720]++;
  this.lexer = v;
  _$jscoverage['/kison/grammar.js'].lineData[721]++;
  return v;
}}, 
  terminals: {
  value: {}}}});
  _$jscoverage['/kison/grammar.js'].lineData[732]++;
  function parse(input) {
    _$jscoverage['/kison/grammar.js'].functionData[46]++;
    _$jscoverage['/kison/grammar.js'].lineData[733]++;
    var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], stack = [0];
    _$jscoverage['/kison/grammar.js'].lineData[745]++;
    lexer.resetInput(input);
    _$jscoverage['/kison/grammar.js'].lineData[747]++;
    while (1) {
      _$jscoverage['/kison/grammar.js'].lineData[749]++;
      state = stack[stack.length - 1];
      _$jscoverage['/kison/grammar.js'].lineData[751]++;
      if (visit63_751_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[752]++;
        symbol = lexer.lex();
      }
      _$jscoverage['/kison/grammar.js'].lineData[755]++;
      if (visit64_755_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[756]++;
        S.log('it is not a valid input: ' + input, 'error');
        _$jscoverage['/kison/grammar.js'].lineData[757]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[761]++;
      action = visit65_761_1(tableAction[state] && tableAction[state][symbol]);
      _$jscoverage['/kison/grammar.js'].lineData[763]++;
      if (visit66_763_1(!action)) {
        _$jscoverage['/kison/grammar.js'].lineData[764]++;
        var expected = [], error;
        _$jscoverage['/kison/grammar.js'].lineData[765]++;
        if (visit67_765_1(tableAction[state])) {
          _$jscoverage['/kison/grammar.js'].lineData[766]++;
          for (var symbolForState in tableAction[state]) {
            _$jscoverage['/kison/grammar.js'].lineData[767]++;
            expected.push(self.lexer.mapReverseSymbol(symbolForState));
          }
        }
        _$jscoverage['/kison/grammar.js'].lineData[770]++;
        error = 'Syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
        _$jscoverage['/kison/grammar.js'].lineData[773]++;
        S.error(error);
        _$jscoverage['/kison/grammar.js'].lineData[774]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[777]++;
      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[779]++;
          stack.push(symbol);
          _$jscoverage['/kison/grammar.js'].lineData[781]++;
          valueStack.push(lexer.text);
          _$jscoverage['/kison/grammar.js'].lineData[784]++;
          stack.push(action[GrammarConst.TO_INDEX]);
          _$jscoverage['/kison/grammar.js'].lineData[787]++;
          symbol = null;
          _$jscoverage['/kison/grammar.js'].lineData[789]++;
          break;
        case GrammarConst.REDUCE_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[792]++;
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit68_793_1(production.symbol || production[0]), reducedAction = visit69_794_1(production.action || production[2]), reducedRhs = visit70_795_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];
          _$jscoverage['/kison/grammar.js'].lineData[801]++;
          ret = undefined;
          _$jscoverage['/kison/grammar.js'].lineData[803]++;
          self.$$ = $$;
          _$jscoverage['/kison/grammar.js'].lineData[805]++;
          for (; visit71_805_1(i < len); i++) {
            _$jscoverage['/kison/grammar.js'].lineData[806]++;
            self['$' + (len - i)] = valueStack[valueStack.length - 1 - i];
          }
          _$jscoverage['/kison/grammar.js'].lineData[809]++;
          if (visit72_809_1(reducedAction)) {
            _$jscoverage['/kison/grammar.js'].lineData[810]++;
            ret = reducedAction.call(self);
          }
          _$jscoverage['/kison/grammar.js'].lineData[813]++;
          if (visit73_813_1(ret !== undefined)) {
            _$jscoverage['/kison/grammar.js'].lineData[814]++;
            $$ = ret;
          } else {
            _$jscoverage['/kison/grammar.js'].lineData[816]++;
            $$ = self.$$;
          }
          _$jscoverage['/kison/grammar.js'].lineData[819]++;
          if (visit74_819_1(len)) {
            _$jscoverage['/kison/grammar.js'].lineData[820]++;
            stack = stack.slice(0, -1 * len * 2);
            _$jscoverage['/kison/grammar.js'].lineData[821]++;
            valueStack = valueStack.slice(0, -1 * len);
          }
          _$jscoverage['/kison/grammar.js'].lineData[824]++;
          stack.push(reducedSymbol);
          _$jscoverage['/kison/grammar.js'].lineData[826]++;
          valueStack.push($$);
          _$jscoverage['/kison/grammar.js'].lineData[828]++;
          var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
          _$jscoverage['/kison/grammar.js'].lineData[830]++;
          stack.push(newState);
          _$jscoverage['/kison/grammar.js'].lineData[832]++;
          break;
        case GrammarConst.ACCEPT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[835]++;
          return $$;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[840]++;
    return undefined;
  }
});
