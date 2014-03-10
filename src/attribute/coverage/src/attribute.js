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
if (! _$jscoverage['/attribute.js']) {
  _$jscoverage['/attribute.js'] = {};
  _$jscoverage['/attribute.js'].lineData = [];
  _$jscoverage['/attribute.js'].lineData[6] = 0;
  _$jscoverage['/attribute.js'].lineData[7] = 0;
  _$jscoverage['/attribute.js'].lineData[8] = 0;
  _$jscoverage['/attribute.js'].lineData[10] = 0;
  _$jscoverage['/attribute.js'].lineData[11] = 0;
  _$jscoverage['/attribute.js'].lineData[12] = 0;
  _$jscoverage['/attribute.js'].lineData[15] = 0;
  _$jscoverage['/attribute.js'].lineData[19] = 0;
  _$jscoverage['/attribute.js'].lineData[20] = 0;
  _$jscoverage['/attribute.js'].lineData[23] = 0;
  _$jscoverage['/attribute.js'].lineData[24] = 0;
  _$jscoverage['/attribute.js'].lineData[28] = 0;
  _$jscoverage['/attribute.js'].lineData[30] = 0;
  _$jscoverage['/attribute.js'].lineData[32] = 0;
  _$jscoverage['/attribute.js'].lineData[33] = 0;
  _$jscoverage['/attribute.js'].lineData[34] = 0;
  _$jscoverage['/attribute.js'].lineData[36] = 0;
  _$jscoverage['/attribute.js'].lineData[39] = 0;
  _$jscoverage['/attribute.js'].lineData[40] = 0;
  _$jscoverage['/attribute.js'].lineData[43] = 0;
  _$jscoverage['/attribute.js'].lineData[44] = 0;
  _$jscoverage['/attribute.js'].lineData[48] = 0;
  _$jscoverage['/attribute.js'].lineData[49] = 0;
  _$jscoverage['/attribute.js'].lineData[50] = 0;
  _$jscoverage['/attribute.js'].lineData[58] = 0;
  _$jscoverage['/attribute.js'].lineData[59] = 0;
  _$jscoverage['/attribute.js'].lineData[60] = 0;
  _$jscoverage['/attribute.js'].lineData[61] = 0;
  _$jscoverage['/attribute.js'].lineData[63] = 0;
  _$jscoverage['/attribute.js'].lineData[69] = 0;
  _$jscoverage['/attribute.js'].lineData[70] = 0;
  _$jscoverage['/attribute.js'].lineData[73] = 0;
  _$jscoverage['/attribute.js'].lineData[75] = 0;
  _$jscoverage['/attribute.js'].lineData[81] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[84] = 0;
  _$jscoverage['/attribute.js'].lineData[85] = 0;
  _$jscoverage['/attribute.js'].lineData[86] = 0;
  _$jscoverage['/attribute.js'].lineData[88] = 0;
  _$jscoverage['/attribute.js'].lineData[89] = 0;
  _$jscoverage['/attribute.js'].lineData[91] = 0;
  _$jscoverage['/attribute.js'].lineData[94] = 0;
  _$jscoverage['/attribute.js'].lineData[97] = 0;
  _$jscoverage['/attribute.js'].lineData[98] = 0;
  _$jscoverage['/attribute.js'].lineData[100] = 0;
  _$jscoverage['/attribute.js'].lineData[101] = 0;
  _$jscoverage['/attribute.js'].lineData[102] = 0;
  _$jscoverage['/attribute.js'].lineData[105] = 0;
  _$jscoverage['/attribute.js'].lineData[111] = 0;
  _$jscoverage['/attribute.js'].lineData[112] = 0;
  _$jscoverage['/attribute.js'].lineData[113] = 0;
  _$jscoverage['/attribute.js'].lineData[114] = 0;
  _$jscoverage['/attribute.js'].lineData[115] = 0;
  _$jscoverage['/attribute.js'].lineData[117] = 0;
  _$jscoverage['/attribute.js'].lineData[119] = 0;
  _$jscoverage['/attribute.js'].lineData[121] = 0;
  _$jscoverage['/attribute.js'].lineData[124] = 0;
  _$jscoverage['/attribute.js'].lineData[125] = 0;
  _$jscoverage['/attribute.js'].lineData[126] = 0;
  _$jscoverage['/attribute.js'].lineData[127] = 0;
  _$jscoverage['/attribute.js'].lineData[129] = 0;
  _$jscoverage['/attribute.js'].lineData[130] = 0;
  _$jscoverage['/attribute.js'].lineData[131] = 0;
  _$jscoverage['/attribute.js'].lineData[138] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[145] = 0;
  _$jscoverage['/attribute.js'].lineData[146] = 0;
  _$jscoverage['/attribute.js'].lineData[147] = 0;
  _$jscoverage['/attribute.js'].lineData[149] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[157] = 0;
  _$jscoverage['/attribute.js'].lineData[158] = 0;
  _$jscoverage['/attribute.js'].lineData[159] = 0;
  _$jscoverage['/attribute.js'].lineData[160] = 0;
  _$jscoverage['/attribute.js'].lineData[161] = 0;
  _$jscoverage['/attribute.js'].lineData[165] = 0;
  _$jscoverage['/attribute.js'].lineData[167] = 0;
  _$jscoverage['/attribute.js'].lineData[178] = 0;
  _$jscoverage['/attribute.js'].lineData[179] = 0;
  _$jscoverage['/attribute.js'].lineData[180] = 0;
  _$jscoverage['/attribute.js'].lineData[183] = 0;
  _$jscoverage['/attribute.js'].lineData[184] = 0;
  _$jscoverage['/attribute.js'].lineData[188] = 0;
  _$jscoverage['/attribute.js'].lineData[191] = 0;
  _$jscoverage['/attribute.js'].lineData[192] = 0;
  _$jscoverage['/attribute.js'].lineData[201] = 0;
  _$jscoverage['/attribute.js'].lineData[203] = 0;
  _$jscoverage['/attribute.js'].lineData[204] = 0;
  _$jscoverage['/attribute.js'].lineData[208] = 0;
  _$jscoverage['/attribute.js'].lineData[209] = 0;
  _$jscoverage['/attribute.js'].lineData[210] = 0;
  _$jscoverage['/attribute.js'].lineData[211] = 0;
  _$jscoverage['/attribute.js'].lineData[212] = 0;
  _$jscoverage['/attribute.js'].lineData[219] = 0;
  _$jscoverage['/attribute.js'].lineData[227] = 0;
  _$jscoverage['/attribute.js'].lineData[234] = 0;
  _$jscoverage['/attribute.js'].lineData[235] = 0;
  _$jscoverage['/attribute.js'].lineData[238] = 0;
  _$jscoverage['/attribute.js'].lineData[240] = 0;
  _$jscoverage['/attribute.js'].lineData[241] = 0;
  _$jscoverage['/attribute.js'].lineData[242] = 0;
  _$jscoverage['/attribute.js'].lineData[245] = 0;
  _$jscoverage['/attribute.js'].lineData[248] = 0;
  _$jscoverage['/attribute.js'].lineData[249] = 0;
  _$jscoverage['/attribute.js'].lineData[251] = 0;
  _$jscoverage['/attribute.js'].lineData[252] = 0;
  _$jscoverage['/attribute.js'].lineData[253] = 0;
  _$jscoverage['/attribute.js'].lineData[254] = 0;
  _$jscoverage['/attribute.js'].lineData[258] = 0;
  _$jscoverage['/attribute.js'].lineData[259] = 0;
  _$jscoverage['/attribute.js'].lineData[260] = 0;
  _$jscoverage['/attribute.js'].lineData[261] = 0;
  _$jscoverage['/attribute.js'].lineData[262] = 0;
  _$jscoverage['/attribute.js'].lineData[263] = 0;
  _$jscoverage['/attribute.js'].lineData[264] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[266] = 0;
  _$jscoverage['/attribute.js'].lineData[267] = 0;
  _$jscoverage['/attribute.js'].lineData[268] = 0;
  _$jscoverage['/attribute.js'].lineData[269] = 0;
  _$jscoverage['/attribute.js'].lineData[270] = 0;
  _$jscoverage['/attribute.js'].lineData[271] = 0;
  _$jscoverage['/attribute.js'].lineData[273] = 0;
  _$jscoverage['/attribute.js'].lineData[274] = 0;
  _$jscoverage['/attribute.js'].lineData[276] = 0;
  _$jscoverage['/attribute.js'].lineData[277] = 0;
  _$jscoverage['/attribute.js'].lineData[282] = 0;
  _$jscoverage['/attribute.js'].lineData[283] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[285] = 0;
  _$jscoverage['/attribute.js'].lineData[288] = 0;
  _$jscoverage['/attribute.js'].lineData[289] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[293] = 0;
  _$jscoverage['/attribute.js'].lineData[294] = 0;
  _$jscoverage['/attribute.js'].lineData[296] = 0;
  _$jscoverage['/attribute.js'].lineData[297] = 0;
  _$jscoverage['/attribute.js'].lineData[298] = 0;
  _$jscoverage['/attribute.js'].lineData[300] = 0;
  _$jscoverage['/attribute.js'].lineData[301] = 0;
  _$jscoverage['/attribute.js'].lineData[302] = 0;
  _$jscoverage['/attribute.js'].lineData[305] = 0;
  _$jscoverage['/attribute.js'].lineData[307] = 0;
  _$jscoverage['/attribute.js'].lineData[311] = 0;
  _$jscoverage['/attribute.js'].lineData[312] = 0;
  _$jscoverage['/attribute.js'].lineData[316] = 0;
  _$jscoverage['/attribute.js'].lineData[317] = 0;
  _$jscoverage['/attribute.js'].lineData[318] = 0;
  _$jscoverage['/attribute.js'].lineData[319] = 0;
  _$jscoverage['/attribute.js'].lineData[321] = 0;
  _$jscoverage['/attribute.js'].lineData[322] = 0;
  _$jscoverage['/attribute.js'].lineData[323] = 0;
  _$jscoverage['/attribute.js'].lineData[325] = 0;
  _$jscoverage['/attribute.js'].lineData[326] = 0;
  _$jscoverage['/attribute.js'].lineData[327] = 0;
  _$jscoverage['/attribute.js'].lineData[329] = 0;
  _$jscoverage['/attribute.js'].lineData[330] = 0;
  _$jscoverage['/attribute.js'].lineData[331] = 0;
  _$jscoverage['/attribute.js'].lineData[334] = 0;
  _$jscoverage['/attribute.js'].lineData[335] = 0;
  _$jscoverage['/attribute.js'].lineData[336] = 0;
  _$jscoverage['/attribute.js'].lineData[344] = 0;
  _$jscoverage['/attribute.js'].lineData[349] = 0;
  _$jscoverage['/attribute.js'].lineData[350] = 0;
  _$jscoverage['/attribute.js'].lineData[351] = 0;
  _$jscoverage['/attribute.js'].lineData[353] = 0;
  _$jscoverage['/attribute.js'].lineData[358] = 0;
  _$jscoverage['/attribute.js'].lineData[362] = 0;
  _$jscoverage['/attribute.js'].lineData[366] = 0;
  _$jscoverage['/attribute.js'].lineData[367] = 0;
  _$jscoverage['/attribute.js'].lineData[368] = 0;
  _$jscoverage['/attribute.js'].lineData[369] = 0;
  _$jscoverage['/attribute.js'].lineData[372] = 0;
  _$jscoverage['/attribute.js'].lineData[373] = 0;
  _$jscoverage['/attribute.js'].lineData[374] = 0;
  _$jscoverage['/attribute.js'].lineData[376] = 0;
  _$jscoverage['/attribute.js'].lineData[379] = 0;
  _$jscoverage['/attribute.js'].lineData[380] = 0;
  _$jscoverage['/attribute.js'].lineData[382] = 0;
  _$jscoverage['/attribute.js'].lineData[384] = 0;
  _$jscoverage['/attribute.js'].lineData[385] = 0;
  _$jscoverage['/attribute.js'].lineData[387] = 0;
  _$jscoverage['/attribute.js'].lineData[390] = 0;
  _$jscoverage['/attribute.js'].lineData[399] = 0;
  _$jscoverage['/attribute.js'].lineData[407] = 0;
  _$jscoverage['/attribute.js'].lineData[411] = 0;
  _$jscoverage['/attribute.js'].lineData[412] = 0;
  _$jscoverage['/attribute.js'].lineData[414] = 0;
  _$jscoverage['/attribute.js'].lineData[435] = 0;
  _$jscoverage['/attribute.js'].lineData[439] = 0;
  _$jscoverage['/attribute.js'].lineData[440] = 0;
  _$jscoverage['/attribute.js'].lineData[442] = 0;
  _$jscoverage['/attribute.js'].lineData[444] = 0;
  _$jscoverage['/attribute.js'].lineData[454] = 0;
  _$jscoverage['/attribute.js'].lineData[455] = 0;
  _$jscoverage['/attribute.js'].lineData[456] = 0;
  _$jscoverage['/attribute.js'].lineData[458] = 0;
  _$jscoverage['/attribute.js'].lineData[459] = 0;
  _$jscoverage['/attribute.js'].lineData[461] = 0;
  _$jscoverage['/attribute.js'].lineData[470] = 0;
  _$jscoverage['/attribute.js'].lineData[478] = 0;
  _$jscoverage['/attribute.js'].lineData[479] = 0;
  _$jscoverage['/attribute.js'].lineData[480] = 0;
  _$jscoverage['/attribute.js'].lineData[482] = 0;
  _$jscoverage['/attribute.js'].lineData[483] = 0;
  _$jscoverage['/attribute.js'].lineData[484] = 0;
  _$jscoverage['/attribute.js'].lineData[487] = 0;
  _$jscoverage['/attribute.js'].lineData[501] = 0;
  _$jscoverage['/attribute.js'].lineData[502] = 0;
  _$jscoverage['/attribute.js'].lineData[503] = 0;
  _$jscoverage['/attribute.js'].lineData[504] = 0;
  _$jscoverage['/attribute.js'].lineData[505] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[511] = 0;
  _$jscoverage['/attribute.js'].lineData[512] = 0;
  _$jscoverage['/attribute.js'].lineData[515] = 0;
  _$jscoverage['/attribute.js'].lineData[516] = 0;
  _$jscoverage['/attribute.js'].lineData[517] = 0;
  _$jscoverage['/attribute.js'].lineData[519] = 0;
  _$jscoverage['/attribute.js'].lineData[521] = 0;
  _$jscoverage['/attribute.js'].lineData[522] = 0;
  _$jscoverage['/attribute.js'].lineData[524] = 0;
  _$jscoverage['/attribute.js'].lineData[528] = 0;
  _$jscoverage['/attribute.js'].lineData[529] = 0;
  _$jscoverage['/attribute.js'].lineData[530] = 0;
  _$jscoverage['/attribute.js'].lineData[531] = 0;
  _$jscoverage['/attribute.js'].lineData[532] = 0;
  _$jscoverage['/attribute.js'].lineData[534] = 0;
  _$jscoverage['/attribute.js'].lineData[535] = 0;
  _$jscoverage['/attribute.js'].lineData[544] = 0;
  _$jscoverage['/attribute.js'].lineData[546] = 0;
  _$jscoverage['/attribute.js'].lineData[548] = 0;
  _$jscoverage['/attribute.js'].lineData[550] = 0;
  _$jscoverage['/attribute.js'].lineData[551] = 0;
  _$jscoverage['/attribute.js'].lineData[552] = 0;
  _$jscoverage['/attribute.js'].lineData[554] = 0;
  _$jscoverage['/attribute.js'].lineData[556] = 0;
  _$jscoverage['/attribute.js'].lineData[565] = 0;
  _$jscoverage['/attribute.js'].lineData[574] = 0;
  _$jscoverage['/attribute.js'].lineData[575] = 0;
  _$jscoverage['/attribute.js'].lineData[578] = 0;
  _$jscoverage['/attribute.js'].lineData[579] = 0;
  _$jscoverage['/attribute.js'].lineData[582] = 0;
  _$jscoverage['/attribute.js'].lineData[583] = 0;
  _$jscoverage['/attribute.js'].lineData[587] = 0;
  _$jscoverage['/attribute.js'].lineData[589] = 0;
  _$jscoverage['/attribute.js'].lineData[598] = 0;
  _$jscoverage['/attribute.js'].lineData[605] = 0;
  _$jscoverage['/attribute.js'].lineData[606] = 0;
  _$jscoverage['/attribute.js'].lineData[607] = 0;
  _$jscoverage['/attribute.js'].lineData[610] = 0;
  _$jscoverage['/attribute.js'].lineData[611] = 0;
  _$jscoverage['/attribute.js'].lineData[615] = 0;
  _$jscoverage['/attribute.js'].lineData[620] = 0;
  _$jscoverage['/attribute.js'].lineData[621] = 0;
  _$jscoverage['/attribute.js'].lineData[624] = 0;
  _$jscoverage['/attribute.js'].lineData[625] = 0;
  _$jscoverage['/attribute.js'].lineData[628] = 0;
  _$jscoverage['/attribute.js'].lineData[629] = 0;
  _$jscoverage['/attribute.js'].lineData[632] = 0;
  _$jscoverage['/attribute.js'].lineData[644] = 0;
  _$jscoverage['/attribute.js'].lineData[646] = 0;
  _$jscoverage['/attribute.js'].lineData[647] = 0;
  _$jscoverage['/attribute.js'].lineData[649] = 0;
  _$jscoverage['/attribute.js'].lineData[652] = 0;
  _$jscoverage['/attribute.js'].lineData[656] = 0;
  _$jscoverage['/attribute.js'].lineData[659] = 0;
  _$jscoverage['/attribute.js'].lineData[663] = 0;
  _$jscoverage['/attribute.js'].lineData[664] = 0;
  _$jscoverage['/attribute.js'].lineData[667] = 0;
  _$jscoverage['/attribute.js'].lineData[668] = 0;
  _$jscoverage['/attribute.js'].lineData[673] = 0;
  _$jscoverage['/attribute.js'].lineData[674] = 0;
  _$jscoverage['/attribute.js'].lineData[679] = 0;
  _$jscoverage['/attribute.js'].lineData[680] = 0;
  _$jscoverage['/attribute.js'].lineData[681] = 0;
  _$jscoverage['/attribute.js'].lineData[685] = 0;
  _$jscoverage['/attribute.js'].lineData[687] = 0;
  _$jscoverage['/attribute.js'].lineData[688] = 0;
  _$jscoverage['/attribute.js'].lineData[691] = 0;
  _$jscoverage['/attribute.js'].lineData[694] = 0;
  _$jscoverage['/attribute.js'].lineData[695] = 0;
  _$jscoverage['/attribute.js'].lineData[697] = 0;
  _$jscoverage['/attribute.js'].lineData[699] = 0;
  _$jscoverage['/attribute.js'].lineData[700] = 0;
  _$jscoverage['/attribute.js'].lineData[702] = 0;
  _$jscoverage['/attribute.js'].lineData[703] = 0;
  _$jscoverage['/attribute.js'].lineData[704] = 0;
  _$jscoverage['/attribute.js'].lineData[706] = 0;
  _$jscoverage['/attribute.js'].lineData[709] = 0;
  _$jscoverage['/attribute.js'].lineData[710] = 0;
  _$jscoverage['/attribute.js'].lineData[712] = 0;
  _$jscoverage['/attribute.js'].lineData[713] = 0;
  _$jscoverage['/attribute.js'].lineData[716] = 0;
  _$jscoverage['/attribute.js'].lineData[719] = 0;
}
if (! _$jscoverage['/attribute.js'].functionData) {
  _$jscoverage['/attribute.js'].functionData = [];
  _$jscoverage['/attribute.js'].functionData[0] = 0;
  _$jscoverage['/attribute.js'].functionData[1] = 0;
  _$jscoverage['/attribute.js'].functionData[2] = 0;
  _$jscoverage['/attribute.js'].functionData[3] = 0;
  _$jscoverage['/attribute.js'].functionData[4] = 0;
  _$jscoverage['/attribute.js'].functionData[5] = 0;
  _$jscoverage['/attribute.js'].functionData[6] = 0;
  _$jscoverage['/attribute.js'].functionData[7] = 0;
  _$jscoverage['/attribute.js'].functionData[8] = 0;
  _$jscoverage['/attribute.js'].functionData[9] = 0;
  _$jscoverage['/attribute.js'].functionData[10] = 0;
  _$jscoverage['/attribute.js'].functionData[11] = 0;
  _$jscoverage['/attribute.js'].functionData[12] = 0;
  _$jscoverage['/attribute.js'].functionData[13] = 0;
  _$jscoverage['/attribute.js'].functionData[14] = 0;
  _$jscoverage['/attribute.js'].functionData[15] = 0;
  _$jscoverage['/attribute.js'].functionData[16] = 0;
  _$jscoverage['/attribute.js'].functionData[17] = 0;
  _$jscoverage['/attribute.js'].functionData[18] = 0;
  _$jscoverage['/attribute.js'].functionData[19] = 0;
  _$jscoverage['/attribute.js'].functionData[20] = 0;
  _$jscoverage['/attribute.js'].functionData[21] = 0;
  _$jscoverage['/attribute.js'].functionData[22] = 0;
  _$jscoverage['/attribute.js'].functionData[23] = 0;
  _$jscoverage['/attribute.js'].functionData[24] = 0;
  _$jscoverage['/attribute.js'].functionData[25] = 0;
  _$jscoverage['/attribute.js'].functionData[26] = 0;
  _$jscoverage['/attribute.js'].functionData[27] = 0;
  _$jscoverage['/attribute.js'].functionData[28] = 0;
  _$jscoverage['/attribute.js'].functionData[29] = 0;
  _$jscoverage['/attribute.js'].functionData[30] = 0;
  _$jscoverage['/attribute.js'].functionData[31] = 0;
  _$jscoverage['/attribute.js'].functionData[32] = 0;
  _$jscoverage['/attribute.js'].functionData[33] = 0;
  _$jscoverage['/attribute.js'].functionData[34] = 0;
  _$jscoverage['/attribute.js'].functionData[35] = 0;
  _$jscoverage['/attribute.js'].functionData[36] = 0;
  _$jscoverage['/attribute.js'].functionData[37] = 0;
  _$jscoverage['/attribute.js'].functionData[38] = 0;
  _$jscoverage['/attribute.js'].functionData[39] = 0;
}
if (! _$jscoverage['/attribute.js'].branchData) {
  _$jscoverage['/attribute.js'].branchData = {};
  _$jscoverage['/attribute.js'].branchData['11'] = [];
  _$jscoverage['/attribute.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['33'] = [];
  _$jscoverage['/attribute.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['40'] = [];
  _$jscoverage['/attribute.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['49'] = [];
  _$jscoverage['/attribute.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['60'] = [];
  _$jscoverage['/attribute.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['63'] = [];
  _$jscoverage['/attribute.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['71'] = [];
  _$jscoverage['/attribute.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['71'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['84'] = [];
  _$jscoverage['/attribute.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['85'] = [];
  _$jscoverage['/attribute.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['88'] = [];
  _$jscoverage['/attribute.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['100'] = [];
  _$jscoverage['/attribute.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['113'] = [];
  _$jscoverage['/attribute.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['114'] = [];
  _$jscoverage['/attribute.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['126'] = [];
  _$jscoverage['/attribute.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'] = [];
  _$jscoverage['/attribute.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['157'] = [];
  _$jscoverage['/attribute.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['158'] = [];
  _$jscoverage['/attribute.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['158'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['160'] = [];
  _$jscoverage['/attribute.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['178'] = [];
  _$jscoverage['/attribute.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['179'] = [];
  _$jscoverage['/attribute.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['183'] = [];
  _$jscoverage['/attribute.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['203'] = [];
  _$jscoverage['/attribute.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['208'] = [];
  _$jscoverage['/attribute.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['211'] = [];
  _$jscoverage['/attribute.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['251'] = [];
  _$jscoverage['/attribute.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['253'] = [];
  _$jscoverage['/attribute.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['259'] = [];
  _$jscoverage['/attribute.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['261'] = [];
  _$jscoverage['/attribute.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['270'] = [];
  _$jscoverage['/attribute.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['273'] = [];
  _$jscoverage['/attribute.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['297'] = [];
  _$jscoverage['/attribute.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['300'] = [];
  _$jscoverage['/attribute.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['301'] = [];
  _$jscoverage['/attribute.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['305'] = [];
  _$jscoverage['/attribute.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['322'] = [];
  _$jscoverage['/attribute.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['326'] = [];
  _$jscoverage['/attribute.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['329'] = [];
  _$jscoverage['/attribute.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['335'] = [];
  _$jscoverage['/attribute.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['350'] = [];
  _$jscoverage['/attribute.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['366'] = [];
  _$jscoverage['/attribute.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['373'] = [];
  _$jscoverage['/attribute.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['380'] = [];
  _$jscoverage['/attribute.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['385'] = [];
  _$jscoverage['/attribute.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['390'] = [];
  _$jscoverage['/attribute.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['399'] = [];
  _$jscoverage['/attribute.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['458'] = [];
  _$jscoverage['/attribute.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['482'] = [];
  _$jscoverage['/attribute.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['502'] = [];
  _$jscoverage['/attribute.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['504'] = [];
  _$jscoverage['/attribute.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['511'] = [];
  _$jscoverage['/attribute.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['515'] = [];
  _$jscoverage['/attribute.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['516'] = [];
  _$jscoverage['/attribute.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['534'] = [];
  _$jscoverage['/attribute.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['546'] = [];
  _$jscoverage['/attribute.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['550'] = [];
  _$jscoverage['/attribute.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['551'] = [];
  _$jscoverage['/attribute.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['574'] = [];
  _$jscoverage['/attribute.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['578'] = [];
  _$jscoverage['/attribute.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['582'] = [];
  _$jscoverage['/attribute.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['605'] = [];
  _$jscoverage['/attribute.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['620'] = [];
  _$jscoverage['/attribute.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['624'] = [];
  _$jscoverage['/attribute.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['624'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['628'] = [];
  _$jscoverage['/attribute.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['646'] = [];
  _$jscoverage['/attribute.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['647'] = [];
  _$jscoverage['/attribute.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['679'] = [];
  _$jscoverage['/attribute.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['681'] = [];
  _$jscoverage['/attribute.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['702'] = [];
  _$jscoverage['/attribute.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['709'] = [];
  _$jscoverage['/attribute.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['712'] = [];
  _$jscoverage['/attribute.js'].branchData['712'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['712'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['712'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['712'][3].init(151, 10, 'e !== true');
function visit78_712_3(result) {
  _$jscoverage['/attribute.js'].branchData['712'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['712'][2].init(132, 15, 'e !== undefined');
function visit77_712_2(result) {
  _$jscoverage['/attribute.js'].branchData['712'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['712'][1].init(132, 29, 'e !== undefined && e !== true');
function visit76_712_1(result) {
  _$jscoverage['/attribute.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['709'][1].init(441, 52, 'validator && (validator = normalFn(self, validator))');
function visit75_709_1(result) {
  _$jscoverage['/attribute.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['702'][1].init(179, 4, 'path');
function visit74_702_1(result) {
  _$jscoverage['/attribute.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['681'][1].init(55, 88, 'val !== undefined');
function visit73_681_1(result) {
  _$jscoverage['/attribute.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['679'][1].init(171, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit72_679_1(result) {
  _$jscoverage['/attribute.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['647'][1].init(22, 18, 'self.hasAttr(name)');
function visit71_647_1(result) {
  _$jscoverage['/attribute.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['646'][1].init(50, 24, 'typeof name === \'string\'');
function visit70_646_1(result) {
  _$jscoverage['/attribute.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['628'][1].init(975, 4, 'path');
function visit69_628_1(result) {
  _$jscoverage['/attribute.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['624'][2].init(881, 17, 'ret !== undefined');
function visit68_624_2(result) {
  _$jscoverage['/attribute.js'].branchData['624'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['624'][1].init(858, 40, '!(name in attrVals) && ret !== undefined');
function visit67_624_1(result) {
  _$jscoverage['/attribute.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['620'][1].init(724, 43, 'getter && (getter = normalFn(self, getter))');
function visit66_620_1(result) {
  _$jscoverage['/attribute.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['605'][1].init(207, 24, 'name.indexOf(dot) !== -1');
function visit65_605_1(result) {
  _$jscoverage['/attribute.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['582'][1].init(687, 22, 'setValue !== undefined');
function visit64_582_1(result) {
  _$jscoverage['/attribute.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['578'][1].init(598, 20, 'setValue === INVALID');
function visit63_578_1(result) {
  _$jscoverage['/attribute.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['574'][1].init(457, 43, 'setter && (setter = normalFn(self, setter))');
function visit62_574_1(result) {
  _$jscoverage['/attribute.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['551'][1].init(22, 10, 'opts.error');
function visit61_551_1(result) {
  _$jscoverage['/attribute.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['550'][1].init(1830, 15, 'e !== undefined');
function visit60_550_1(result) {
  _$jscoverage['/attribute.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['546'][1].init(1721, 10, 'opts || {}');
function visit59_546_1(result) {
  _$jscoverage['/attribute.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['534'][1].init(1258, 16, 'attrNames.length');
function visit58_534_1(result) {
  _$jscoverage['/attribute.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['516'][1].init(26, 10, 'opts.error');
function visit57_516_1(result) {
  _$jscoverage['/attribute.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['515'][1].init(507, 13, 'errors.length');
function visit56_515_1(result) {
  _$jscoverage['/attribute.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['511'][1].init(132, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit55_511_1(result) {
  _$jscoverage['/attribute.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['504'][1].init(56, 10, 'opts || {}');
function visit54_504_1(result) {
  _$jscoverage['/attribute.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['502'][1].init(51, 21, 'S.isPlainObject(name)');
function visit53_502_1(result) {
  _$jscoverage['/attribute.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['482'][1].init(143, 18, 'self.hasAttr(name)');
function visit52_482_1(result) {
  _$jscoverage['/attribute.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['458'][1].init(177, 13, 'initialValues');
function visit51_458_1(result) {
  _$jscoverage['/attribute.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['399'][1].init(21, 35, 'this.__attrs || (this.__attrs = {})');
function visit50_399_1(result) {
  _$jscoverage['/attribute.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['390'][1].init(1076, 10, 'args || []');
function visit49_390_1(result) {
  _$jscoverage['/attribute.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['385'][1].init(871, 7, '!member');
function visit48_385_1(result) {
  _$jscoverage['/attribute.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['380'][1].init(612, 5, '!name');
function visit47_380_1(result) {
  _$jscoverage['/attribute.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['373'][1].init(114, 18, 'method.__wrapped__');
function visit46_373_1(result) {
  _$jscoverage['/attribute.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['366'][2].init(115, 26, 'typeof self === \'function\'');
function visit45_366_2(result) {
  _$jscoverage['/attribute.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['366'][1].init(115, 43, 'typeof self === \'function\' && self.__name__');
function visit44_366_1(result) {
  _$jscoverage['/attribute.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['350'][1].init(14, 6, 'config');
function visit43_350_1(result) {
  _$jscoverage['/attribute.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['335'][1].init(14, 5, 'attrs');
function visit42_335_1(result) {
  _$jscoverage['/attribute.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['329'][1].init(1608, 19, 'sx.extend || extend');
function visit41_329_1(result) {
  _$jscoverage['/attribute.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['326'][1].init(1498, 18, 'sxInheritedStatics');
function visit40_326_1(result) {
  _$jscoverage['/attribute.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['322'][1].init(57, 25, 'sx.inheritedStatics || {}');
function visit39_322_1(result) {
  _$jscoverage['/attribute.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['305'][1].init(82, 9, '\'@DEBUG@\'');
function visit38_305_1(result) {
  _$jscoverage['/attribute.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['301'][1].init(430, 32, 'px.hasOwnProperty(\'constructor\')');
function visit37_301_1(result) {
  _$jscoverage['/attribute.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['300'][1].init(386, 29, 'sx.name || \'AttributeDerived\'');
function visit36_300_1(result) {
  _$jscoverage['/attribute.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['297'][1].init(39, 18, 'sx.__hooks__ || {}');
function visit35_297_1(result) {
  _$jscoverage['/attribute.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['273'][1].init(565, 7, 'wrapped');
function visit34_273_1(result) {
  _$jscoverage['/attribute.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['270'][1].init(475, 13, 'v.__wrapped__');
function visit33_270_1(result) {
  _$jscoverage['/attribute.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['261'][1].init(56, 11, 'v.__owner__');
function visit32_261_1(result) {
  _$jscoverage['/attribute.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['259'][1].init(18, 23, 'typeof v === \'function\'');
function visit31_259_1(result) {
  _$jscoverage['/attribute.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['253'][1].init(22, 7, 'p in px');
function visit30_253_1(result) {
  _$jscoverage['/attribute.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['251'][1].init(96, 5, 'hooks');
function visit29_251_1(result) {
  _$jscoverage['/attribute.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['211'][1].init(159, 5, 'attrs');
function visit28_211_1(result) {
  _$jscoverage['/attribute.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['208'][1].init(406, 12, '!opts.silent');
function visit27_208_1(result) {
  _$jscoverage['/attribute.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['203'][1].init(309, 13, 'ret === FALSE');
function visit26_203_1(result) {
  _$jscoverage['/attribute.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['183'][1].init(18, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit25_183_1(result) {
  _$jscoverage['/attribute.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['179'][1].init(18, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit24_179_1(result) {
  _$jscoverage['/attribute.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['178'][1].init(1073, 11, 'opts.silent');
function visit23_178_1(result) {
  _$jscoverage['/attribute.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['160'][2].init(116, 16, 'subVal === value');
function visit22_160_2(result) {
  _$jscoverage['/attribute.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['160'][1].init(108, 24, 'path && subVal === value');
function visit21_160_1(result) {
  _$jscoverage['/attribute.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['158'][2].init(27, 17, 'prevVal === value');
function visit20_158_2(result) {
  _$jscoverage['/attribute.js'].branchData['158'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['158'][1].init(18, 26, '!path && prevVal === value');
function visit19_158_1(result) {
  _$jscoverage['/attribute.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['157'][1].init(485, 11, '!opts.force');
function visit18_157_1(result) {
  _$jscoverage['/attribute.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][1].init(310, 4, 'path');
function visit17_151_1(result) {
  _$jscoverage['/attribute.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['126'][1].init(90, 22, 'defaultBeforeFns[name]');
function visit16_126_1(result) {
  _$jscoverage['/attribute.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['114'][1].init(18, 21, 'prevVal === undefined');
function visit15_114_1(result) {
  _$jscoverage['/attribute.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['113'][1].init(40, 4, 'path');
function visit14_113_1(result) {
  _$jscoverage['/attribute.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['100'][1].init(35, 24, 'name.indexOf(\'.\') !== -1');
function visit13_100_1(result) {
  _$jscoverage['/attribute.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['88'][1].init(111, 15, 'o !== undefined');
function visit12_88_1(result) {
  _$jscoverage['/attribute.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['85'][1].init(30, 7, 'i < len');
function visit11_85_1(result) {
  _$jscoverage['/attribute.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['84'][1].init(70, 8, 'len >= 0');
function visit10_84_1(result) {
  _$jscoverage['/attribute.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['71'][3].init(18, 7, 'i < len');
function visit9_71_3(result) {
  _$jscoverage['/attribute.js'].branchData['71'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['71'][2].init(60, 15, 'o !== undefined');
function visit8_71_2(result) {
  _$jscoverage['/attribute.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['71'][1].init(48, 26, 'o !== undefined && i < len');
function visit7_71_1(result) {
  _$jscoverage['/attribute.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['63'][1].init(130, 9, 'ret || {}');
function visit6_63_1(result) {
  _$jscoverage['/attribute.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['60'][1].init(44, 20, '!doNotCreate && !ret');
function visit5_60_1(result) {
  _$jscoverage['/attribute.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['49'][1].init(21, 16, 'attrName || name');
function visit4_49_1(result) {
  _$jscoverage['/attribute.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['40'][1].init(17, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit3_40_1(result) {
  _$jscoverage['/attribute.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['33'][1].init(14, 26, 'typeof method === \'string\'');
function visit2_33_1(result) {
  _$jscoverage['/attribute.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['11'][1].init(14, 12, 'v === S.noop');
function visit1_11_1(result) {
  _$jscoverage['/attribute.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/attribute.js'].lineData[8]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[10]++;
  function bind(v) {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[11]++;
    if (visit1_11_1(v === S.noop)) {
      _$jscoverage['/attribute.js'].lineData[12]++;
      return function() {
  _$jscoverage['/attribute.js'].functionData[2]++;
};
    } else {
      _$jscoverage['/attribute.js'].lineData[15]++;
      return S.bind(v);
    }
  }
  _$jscoverage['/attribute.js'].lineData[19]++;
  function replaceToUpper() {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[20]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/attribute.js'].lineData[23]++;
  function camelCase(name) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[24]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/attribute.js'].lineData[28]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[30]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[32]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[33]++;
    if (visit2_33_1(typeof method === 'string')) {
      _$jscoverage['/attribute.js'].lineData[34]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[36]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[39]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[40]++;
    return visit3_40_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[43]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[44]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[48]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[49]++;
    attrName = visit4_49_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[50]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[58]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[59]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[60]++;
    if (visit5_60_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[61]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[63]++;
    return visit6_63_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[69]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[70]++;
    for (var i = 0, len = path.length; visit7_71_1(visit8_71_2(o !== undefined) && visit9_71_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[73]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[75]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[81]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[82]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[84]++;
    if (visit10_84_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[85]++;
      for (var i = 0; visit11_85_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[86]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[88]++;
      if (visit12_88_1(o !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[89]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[91]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[94]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[97]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[98]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[100]++;
    if (visit13_100_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[101]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[102]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[105]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[111]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[112]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[113]++;
    if (visit14_113_1(path)) {
      _$jscoverage['/attribute.js'].lineData[114]++;
      if (visit15_114_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[115]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[117]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[119]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[121]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[124]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[125]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[126]++;
    if (visit16_126_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[127]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[129]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[130]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[131]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn, 
  defaultTargetOnly: true});
  }
  _$jscoverage['/attribute.js'].lineData[138]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[139]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[145]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[146]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[147]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[149]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[151]++;
    if (visit17_151_1(path)) {
      _$jscoverage['/attribute.js'].lineData[152]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[157]++;
    if (visit18_157_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[158]++;
      if (visit19_158_1(!path && visit20_158_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[159]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[160]++;
        if (visit21_160_1(path && visit22_160_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[161]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[165]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[167]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[178]++;
    if (visit23_178_1(opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[179]++;
      if (visit24_179_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[180]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[183]++;
      if (visit25_183_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[184]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[188]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[191]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[192]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[201]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[203]++;
    if (visit26_203_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[204]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[208]++;
    if (visit27_208_1(!opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[209]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[210]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[211]++;
      if (visit28_211_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[212]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[219]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[227]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[234]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[17]++;
    _$jscoverage['/attribute.js'].lineData[235]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[238]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[240]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[241]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[242]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[245]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[248]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[249]++;
    var hooks = SubClass.__hooks__;
    _$jscoverage['/attribute.js'].lineData[251]++;
    if (visit29_251_1(hooks)) {
      _$jscoverage['/attribute.js'].lineData[252]++;
      for (var p in hooks) {
        _$jscoverage['/attribute.js'].lineData[253]++;
        if (visit30_253_1(p in px)) {
          _$jscoverage['/attribute.js'].lineData[254]++;
          px[p] = hooks[p](px[p]);
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[258]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[259]++;
  if (visit31_259_1(typeof v === 'function')) {
    _$jscoverage['/attribute.js'].lineData[260]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[261]++;
    if (visit32_261_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[262]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[263]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[264]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[265]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[266]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[267]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[268]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[269]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[270]++;
      if (visit33_270_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[271]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[273]++;
    if (visit34_273_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[274]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[276]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[277]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[282]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[20]++;
    _$jscoverage['/attribute.js'].lineData[283]++;
    var SubClass = this;
    _$jscoverage['/attribute.js'].lineData[284]++;
    wrapProtoForSuper(px, SubClass);
    _$jscoverage['/attribute.js'].lineData[285]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[288]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[21]++;
  _$jscoverage['/attribute.js'].lineData[289]++;
  var SubClass, SuperClass = this;
  _$jscoverage['/attribute.js'].lineData[291]++;
  sx = S.merge(sx);
  _$jscoverage['/attribute.js'].lineData[293]++;
  px = S.merge(px);
  _$jscoverage['/attribute.js'].lineData[294]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[296]++;
  if ((hooks = SuperClass.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[297]++;
    sxHooks = sx.__hooks__ = visit35_297_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[298]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[300]++;
  var name = visit36_300_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[301]++;
  if (visit37_301_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[302]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[305]++;
    if (visit38_305_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[307]++;
      SubClass = new Function('return function ' + camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
    } else {
      _$jscoverage['/attribute.js'].lineData[311]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[22]++;
  _$jscoverage['/attribute.js'].lineData[312]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[316]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[317]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[318]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[319]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[321]++;
  if ((inheritedStatics = SuperClass.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[322]++;
    sxInheritedStatics = sx.inheritedStatics = visit39_322_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[323]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[325]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/attribute.js'].lineData[326]++;
  if (visit40_326_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[327]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[329]++;
  SubClass.extend = visit41_329_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[330]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[331]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[334]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[23]++;
    _$jscoverage['/attribute.js'].lineData[335]++;
    if (visit42_335_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[336]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[344]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[349]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[24]++;
    _$jscoverage['/attribute.js'].lineData[350]++;
    if (visit43_350_1(config)) {
      _$jscoverage['/attribute.js'].lineData[351]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[353]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[358]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  'callSuper': function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[362]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[366]++;
  if (visit44_366_1(visit45_366_2(typeof self === 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[367]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[368]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[369]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[372]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[373]++;
    if (visit46_373_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[374]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[376]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[379]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[380]++;
  if (visit47_380_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[382]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[384]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[385]++;
  if (visit48_385_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[387]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[390]++;
  return member.apply(obj, visit49_390_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[399]++;
  return visit50_399_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[407]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[411]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[412]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[414]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[435]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[439]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[440]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[442]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[444]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[454]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[455]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[456]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[458]++;
  if (visit51_458_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[459]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[461]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[470]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[478]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[479]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[480]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[482]++;
  if (visit52_482_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[483]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[484]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[487]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[501]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[502]++;
  if (visit53_502_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[503]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[504]++;
    opts = visit54_504_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[505]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[508]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[511]++;
      if (visit55_511_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[512]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[515]++;
    if (visit56_515_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[516]++;
      if (visit57_516_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[517]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[519]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[521]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[522]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[524]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[528]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[529]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[530]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[531]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[532]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[534]++;
    if (visit58_534_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[535]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[544]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[546]++;
  opts = visit59_546_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[548]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[550]++;
  if (visit60_550_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[551]++;
    if (visit61_551_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[552]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[554]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[556]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[565]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[574]++;
  if (visit62_574_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[575]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[578]++;
  if (visit63_578_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[579]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[582]++;
  if (visit64_582_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[583]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[587]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[589]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[36]++;
  _$jscoverage['/attribute.js'].lineData[598]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[605]++;
  if (visit65_605_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[606]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[607]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[610]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[611]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[615]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[620]++;
  if (visit66_620_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[621]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[624]++;
  if (visit67_624_1(!(name in attrVals) && visit68_624_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[625]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[628]++;
  if (visit69_628_1(path)) {
    _$jscoverage['/attribute.js'].lineData[629]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[632]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[37]++;
  _$jscoverage['/attribute.js'].lineData[644]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[646]++;
  if (visit70_646_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[647]++;
    if (visit71_647_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[649]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[652]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[656]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[659]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[663]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[664]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[667]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[668]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[673]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[38]++;
    _$jscoverage['/attribute.js'].lineData[674]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[679]++;
    if (visit72_679_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[680]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[681]++;
      if (visit73_681_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[685]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[687]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[688]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[691]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[694]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[39]++;
    _$jscoverage['/attribute.js'].lineData[695]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[697]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[699]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[700]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[702]++;
    if (visit74_702_1(path)) {
      _$jscoverage['/attribute.js'].lineData[703]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[704]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[706]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    _$jscoverage['/attribute.js'].lineData[709]++;
    if (visit75_709_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[710]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[712]++;
      if (visit76_712_1(visit77_712_2(e !== undefined) && visit78_712_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[713]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[716]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[719]++;
  return Attribute;
});
