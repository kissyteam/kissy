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
if (! _$jscoverage['/table.js']) {
  _$jscoverage['/table.js'] = {};
  _$jscoverage['/table.js'].lineData = [];
  _$jscoverage['/table.js'].lineData[6] = 0;
  _$jscoverage['/table.js'].lineData[7] = 0;
  _$jscoverage['/table.js'].lineData[13] = 0;
  _$jscoverage['/table.js'].lineData[16] = 0;
  _$jscoverage['/table.js'].lineData[21] = 0;
  _$jscoverage['/table.js'].lineData[23] = 0;
  _$jscoverage['/table.js'].lineData[24] = 0;
  _$jscoverage['/table.js'].lineData[28] = 0;
  _$jscoverage['/table.js'].lineData[31] = 0;
  _$jscoverage['/table.js'].lineData[32] = 0;
  _$jscoverage['/table.js'].lineData[36] = 0;
  _$jscoverage['/table.js'].lineData[37] = 0;
  _$jscoverage['/table.js'].lineData[39] = 0;
  _$jscoverage['/table.js'].lineData[41] = 0;
  _$jscoverage['/table.js'].lineData[44] = 0;
  _$jscoverage['/table.js'].lineData[45] = 0;
  _$jscoverage['/table.js'].lineData[47] = 0;
  _$jscoverage['/table.js'].lineData[49] = 0;
  _$jscoverage['/table.js'].lineData[51] = 0;
  _$jscoverage['/table.js'].lineData[59] = 0;
  _$jscoverage['/table.js'].lineData[60] = 0;
  _$jscoverage['/table.js'].lineData[62] = 0;
  _$jscoverage['/table.js'].lineData[63] = 0;
  _$jscoverage['/table.js'].lineData[69] = 0;
  _$jscoverage['/table.js'].lineData[71] = 0;
  _$jscoverage['/table.js'].lineData[73] = 0;
  _$jscoverage['/table.js'].lineData[76] = 0;
  _$jscoverage['/table.js'].lineData[78] = 0;
  _$jscoverage['/table.js'].lineData[80] = 0;
  _$jscoverage['/table.js'].lineData[81] = 0;
  _$jscoverage['/table.js'].lineData[82] = 0;
  _$jscoverage['/table.js'].lineData[83] = 0;
  _$jscoverage['/table.js'].lineData[87] = 0;
  _$jscoverage['/table.js'].lineData[89] = 0;
  _$jscoverage['/table.js'].lineData[90] = 0;
  _$jscoverage['/table.js'].lineData[91] = 0;
  _$jscoverage['/table.js'].lineData[94] = 0;
  _$jscoverage['/table.js'].lineData[96] = 0;
  _$jscoverage['/table.js'].lineData[100] = 0;
  _$jscoverage['/table.js'].lineData[103] = 0;
  _$jscoverage['/table.js'].lineData[104] = 0;
  _$jscoverage['/table.js'].lineData[105] = 0;
  _$jscoverage['/table.js'].lineData[114] = 0;
  _$jscoverage['/table.js'].lineData[115] = 0;
  _$jscoverage['/table.js'].lineData[118] = 0;
  _$jscoverage['/table.js'].lineData[119] = 0;
  _$jscoverage['/table.js'].lineData[120] = 0;
  _$jscoverage['/table.js'].lineData[123] = 0;
  _$jscoverage['/table.js'].lineData[131] = 0;
  _$jscoverage['/table.js'].lineData[136] = 0;
  _$jscoverage['/table.js'].lineData[137] = 0;
  _$jscoverage['/table.js'].lineData[138] = 0;
  _$jscoverage['/table.js'].lineData[141] = 0;
  _$jscoverage['/table.js'].lineData[143] = 0;
  _$jscoverage['/table.js'].lineData[144] = 0;
  _$jscoverage['/table.js'].lineData[146] = 0;
  _$jscoverage['/table.js'].lineData[147] = 0;
  _$jscoverage['/table.js'].lineData[149] = 0;
  _$jscoverage['/table.js'].lineData[152] = 0;
  _$jscoverage['/table.js'].lineData[155] = 0;
  _$jscoverage['/table.js'].lineData[157] = 0;
  _$jscoverage['/table.js'].lineData[161] = 0;
  _$jscoverage['/table.js'].lineData[162] = 0;
  _$jscoverage['/table.js'].lineData[166] = 0;
  _$jscoverage['/table.js'].lineData[169] = 0;
  _$jscoverage['/table.js'].lineData[170] = 0;
  _$jscoverage['/table.js'].lineData[172] = 0;
  _$jscoverage['/table.js'].lineData[173] = 0;
  _$jscoverage['/table.js'].lineData[174] = 0;
  _$jscoverage['/table.js'].lineData[176] = 0;
  _$jscoverage['/table.js'].lineData[177] = 0;
  _$jscoverage['/table.js'].lineData[179] = 0;
  _$jscoverage['/table.js'].lineData[180] = 0;
  _$jscoverage['/table.js'].lineData[181] = 0;
  _$jscoverage['/table.js'].lineData[183] = 0;
  _$jscoverage['/table.js'].lineData[187] = 0;
  _$jscoverage['/table.js'].lineData[188] = 0;
  _$jscoverage['/table.js'].lineData[194] = 0;
  _$jscoverage['/table.js'].lineData[195] = 0;
  _$jscoverage['/table.js'].lineData[199] = 0;
  _$jscoverage['/table.js'].lineData[200] = 0;
  _$jscoverage['/table.js'].lineData[202] = 0;
  _$jscoverage['/table.js'].lineData[203] = 0;
  _$jscoverage['/table.js'].lineData[204] = 0;
  _$jscoverage['/table.js'].lineData[208] = 0;
  _$jscoverage['/table.js'].lineData[209] = 0;
  _$jscoverage['/table.js'].lineData[214] = 0;
  _$jscoverage['/table.js'].lineData[215] = 0;
  _$jscoverage['/table.js'].lineData[217] = 0;
  _$jscoverage['/table.js'].lineData[218] = 0;
  _$jscoverage['/table.js'].lineData[219] = 0;
  _$jscoverage['/table.js'].lineData[223] = 0;
  _$jscoverage['/table.js'].lineData[226] = 0;
  _$jscoverage['/table.js'].lineData[227] = 0;
  _$jscoverage['/table.js'].lineData[228] = 0;
  _$jscoverage['/table.js'].lineData[231] = 0;
  _$jscoverage['/table.js'].lineData[233] = 0;
  _$jscoverage['/table.js'].lineData[234] = 0;
  _$jscoverage['/table.js'].lineData[238] = 0;
  _$jscoverage['/table.js'].lineData[239] = 0;
  _$jscoverage['/table.js'].lineData[241] = 0;
  _$jscoverage['/table.js'].lineData[244] = 0;
  _$jscoverage['/table.js'].lineData[245] = 0;
  _$jscoverage['/table.js'].lineData[248] = 0;
  _$jscoverage['/table.js'].lineData[255] = 0;
  _$jscoverage['/table.js'].lineData[257] = 0;
  _$jscoverage['/table.js'].lineData[261] = 0;
  _$jscoverage['/table.js'].lineData[262] = 0;
  _$jscoverage['/table.js'].lineData[263] = 0;
  _$jscoverage['/table.js'].lineData[267] = 0;
  _$jscoverage['/table.js'].lineData[268] = 0;
  _$jscoverage['/table.js'].lineData[272] = 0;
  _$jscoverage['/table.js'].lineData[275] = 0;
  _$jscoverage['/table.js'].lineData[276] = 0;
  _$jscoverage['/table.js'].lineData[277] = 0;
  _$jscoverage['/table.js'].lineData[279] = 0;
  _$jscoverage['/table.js'].lineData[280] = 0;
  _$jscoverage['/table.js'].lineData[282] = 0;
  _$jscoverage['/table.js'].lineData[285] = 0;
  _$jscoverage['/table.js'].lineData[286] = 0;
  _$jscoverage['/table.js'].lineData[289] = 0;
  _$jscoverage['/table.js'].lineData[290] = 0;
  _$jscoverage['/table.js'].lineData[291] = 0;
  _$jscoverage['/table.js'].lineData[292] = 0;
  _$jscoverage['/table.js'].lineData[293] = 0;
  _$jscoverage['/table.js'].lineData[295] = 0;
  _$jscoverage['/table.js'].lineData[296] = 0;
  _$jscoverage['/table.js'].lineData[297] = 0;
  _$jscoverage['/table.js'].lineData[299] = 0;
  _$jscoverage['/table.js'].lineData[306] = 0;
  _$jscoverage['/table.js'].lineData[307] = 0;
  _$jscoverage['/table.js'].lineData[308] = 0;
  _$jscoverage['/table.js'].lineData[312] = 0;
  _$jscoverage['/table.js'].lineData[313] = 0;
  _$jscoverage['/table.js'].lineData[314] = 0;
  _$jscoverage['/table.js'].lineData[317] = 0;
  _$jscoverage['/table.js'].lineData[329] = 0;
  _$jscoverage['/table.js'].lineData[357] = 0;
  _$jscoverage['/table.js'].lineData[360] = 0;
  _$jscoverage['/table.js'].lineData[361] = 0;
  _$jscoverage['/table.js'].lineData[371] = 0;
  _$jscoverage['/table.js'].lineData[373] = 0;
  _$jscoverage['/table.js'].lineData[374] = 0;
  _$jscoverage['/table.js'].lineData[375] = 0;
  _$jscoverage['/table.js'].lineData[376] = 0;
  _$jscoverage['/table.js'].lineData[378] = 0;
  _$jscoverage['/table.js'].lineData[388] = 0;
  _$jscoverage['/table.js'].lineData[389] = 0;
  _$jscoverage['/table.js'].lineData[392] = 0;
  _$jscoverage['/table.js'].lineData[395] = 0;
  _$jscoverage['/table.js'].lineData[397] = 0;
  _$jscoverage['/table.js'].lineData[401] = 0;
  _$jscoverage['/table.js'].lineData[402] = 0;
  _$jscoverage['/table.js'].lineData[404] = 0;
  _$jscoverage['/table.js'].lineData[408] = 0;
  _$jscoverage['/table.js'].lineData[409] = 0;
  _$jscoverage['/table.js'].lineData[410] = 0;
  _$jscoverage['/table.js'].lineData[411] = 0;
  _$jscoverage['/table.js'].lineData[421] = 0;
  _$jscoverage['/table.js'].lineData[422] = 0;
  _$jscoverage['/table.js'].lineData[426] = 0;
  _$jscoverage['/table.js'].lineData[427] = 0;
  _$jscoverage['/table.js'].lineData[430] = 0;
  _$jscoverage['/table.js'].lineData[433] = 0;
  _$jscoverage['/table.js'].lineData[434] = 0;
  _$jscoverage['/table.js'].lineData[435] = 0;
  _$jscoverage['/table.js'].lineData[436] = 0;
  _$jscoverage['/table.js'].lineData[440] = 0;
  _$jscoverage['/table.js'].lineData[441] = 0;
  _$jscoverage['/table.js'].lineData[444] = 0;
  _$jscoverage['/table.js'].lineData[446] = 0;
  _$jscoverage['/table.js'].lineData[448] = 0;
  _$jscoverage['/table.js'].lineData[452] = 0;
  _$jscoverage['/table.js'].lineData[453] = 0;
  _$jscoverage['/table.js'].lineData[454] = 0;
  _$jscoverage['/table.js'].lineData[455] = 0;
  _$jscoverage['/table.js'].lineData[456] = 0;
  _$jscoverage['/table.js'].lineData[460] = 0;
  _$jscoverage['/table.js'].lineData[461] = 0;
  _$jscoverage['/table.js'].lineData[462] = 0;
  _$jscoverage['/table.js'].lineData[464] = 0;
  _$jscoverage['/table.js'].lineData[465] = 0;
  _$jscoverage['/table.js'].lineData[469] = 0;
  _$jscoverage['/table.js'].lineData[470] = 0;
  _$jscoverage['/table.js'].lineData[471] = 0;
  _$jscoverage['/table.js'].lineData[472] = 0;
  _$jscoverage['/table.js'].lineData[473] = 0;
  _$jscoverage['/table.js'].lineData[477] = 0;
  _$jscoverage['/table.js'].lineData[478] = 0;
  _$jscoverage['/table.js'].lineData[479] = 0;
  _$jscoverage['/table.js'].lineData[480] = 0;
  _$jscoverage['/table.js'].lineData[481] = 0;
  _$jscoverage['/table.js'].lineData[485] = 0;
  _$jscoverage['/table.js'].lineData[486] = 0;
  _$jscoverage['/table.js'].lineData[487] = 0;
  _$jscoverage['/table.js'].lineData[488] = 0;
  _$jscoverage['/table.js'].lineData[489] = 0;
  _$jscoverage['/table.js'].lineData[493] = 0;
  _$jscoverage['/table.js'].lineData[494] = 0;
  _$jscoverage['/table.js'].lineData[495] = 0;
  _$jscoverage['/table.js'].lineData[496] = 0;
  _$jscoverage['/table.js'].lineData[497] = 0;
  _$jscoverage['/table.js'].lineData[501] = 0;
  _$jscoverage['/table.js'].lineData[502] = 0;
  _$jscoverage['/table.js'].lineData[503] = 0;
  _$jscoverage['/table.js'].lineData[508] = 0;
  _$jscoverage['/table.js'].lineData[509] = 0;
  _$jscoverage['/table.js'].lineData[510] = 0;
  _$jscoverage['/table.js'].lineData[517] = 0;
  _$jscoverage['/table.js'].lineData[518] = 0;
  _$jscoverage['/table.js'].lineData[519] = 0;
  _$jscoverage['/table.js'].lineData[524] = 0;
  _$jscoverage['/table.js'].lineData[525] = 0;
  _$jscoverage['/table.js'].lineData[526] = 0;
  _$jscoverage['/table.js'].lineData[527] = 0;
  _$jscoverage['/table.js'].lineData[528] = 0;
  _$jscoverage['/table.js'].lineData[529] = 0;
  _$jscoverage['/table.js'].lineData[531] = 0;
  _$jscoverage['/table.js'].lineData[533] = 0;
  _$jscoverage['/table.js'].lineData[542] = 0;
  _$jscoverage['/table.js'].lineData[546] = 0;
  _$jscoverage['/table.js'].lineData[561] = 0;
}
if (! _$jscoverage['/table.js'].functionData) {
  _$jscoverage['/table.js'].functionData = [];
  _$jscoverage['/table.js'].functionData[0] = 0;
  _$jscoverage['/table.js'].functionData[1] = 0;
  _$jscoverage['/table.js'].functionData[2] = 0;
  _$jscoverage['/table.js'].functionData[3] = 0;
  _$jscoverage['/table.js'].functionData[4] = 0;
  _$jscoverage['/table.js'].functionData[5] = 0;
  _$jscoverage['/table.js'].functionData[6] = 0;
  _$jscoverage['/table.js'].functionData[7] = 0;
  _$jscoverage['/table.js'].functionData[8] = 0;
  _$jscoverage['/table.js'].functionData[9] = 0;
  _$jscoverage['/table.js'].functionData[10] = 0;
  _$jscoverage['/table.js'].functionData[11] = 0;
  _$jscoverage['/table.js'].functionData[12] = 0;
  _$jscoverage['/table.js'].functionData[13] = 0;
  _$jscoverage['/table.js'].functionData[14] = 0;
  _$jscoverage['/table.js'].functionData[15] = 0;
  _$jscoverage['/table.js'].functionData[16] = 0;
  _$jscoverage['/table.js'].functionData[17] = 0;
  _$jscoverage['/table.js'].functionData[18] = 0;
  _$jscoverage['/table.js'].functionData[19] = 0;
  _$jscoverage['/table.js'].functionData[20] = 0;
  _$jscoverage['/table.js'].functionData[21] = 0;
  _$jscoverage['/table.js'].functionData[22] = 0;
  _$jscoverage['/table.js'].functionData[23] = 0;
  _$jscoverage['/table.js'].functionData[24] = 0;
  _$jscoverage['/table.js'].functionData[25] = 0;
  _$jscoverage['/table.js'].functionData[26] = 0;
  _$jscoverage['/table.js'].functionData[27] = 0;
  _$jscoverage['/table.js'].functionData[28] = 0;
  _$jscoverage['/table.js'].functionData[29] = 0;
  _$jscoverage['/table.js'].functionData[30] = 0;
  _$jscoverage['/table.js'].functionData[31] = 0;
  _$jscoverage['/table.js'].functionData[32] = 0;
}
if (! _$jscoverage['/table.js'].branchData) {
  _$jscoverage['/table.js'].branchData = {};
  _$jscoverage['/table.js'].branchData['23'] = [];
  _$jscoverage['/table.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['28'] = [];
  _$jscoverage['/table.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['29'] = [];
  _$jscoverage['/table.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['36'] = [];
  _$jscoverage['/table.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['39'] = [];
  _$jscoverage['/table.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['42'] = [];
  _$jscoverage['/table.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['44'] = [];
  _$jscoverage['/table.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['60'] = [];
  _$jscoverage['/table.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['80'] = [];
  _$jscoverage['/table.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['82'] = [];
  _$jscoverage['/table.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['90'] = [];
  _$jscoverage['/table.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['104'] = [];
  _$jscoverage['/table.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['114'] = [];
  _$jscoverage['/table.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['118'] = [];
  _$jscoverage['/table.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['120'] = [];
  _$jscoverage['/table.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['132'] = [];
  _$jscoverage['/table.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['132'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['133'] = [];
  _$jscoverage['/table.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['133'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['136'] = [];
  _$jscoverage['/table.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['137'] = [];
  _$jscoverage['/table.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['143'] = [];
  _$jscoverage['/table.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['146'] = [];
  _$jscoverage['/table.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['158'] = [];
  _$jscoverage['/table.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['161'] = [];
  _$jscoverage['/table.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['169'] = [];
  _$jscoverage['/table.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['172'] = [];
  _$jscoverage['/table.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['176'] = [];
  _$jscoverage['/table.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['180'] = [];
  _$jscoverage['/table.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['189'] = [];
  _$jscoverage['/table.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['194'] = [];
  _$jscoverage['/table.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['201'] = [];
  _$jscoverage['/table.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['202'] = [];
  _$jscoverage['/table.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['208'] = [];
  _$jscoverage['/table.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['209'] = [];
  _$jscoverage['/table.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['216'] = [];
  _$jscoverage['/table.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['218'] = [];
  _$jscoverage['/table.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['227'] = [];
  _$jscoverage['/table.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['231'] = [];
  _$jscoverage['/table.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['233'] = [];
  _$jscoverage['/table.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['239'] = [];
  _$jscoverage['/table.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['244'] = [];
  _$jscoverage['/table.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['255'] = [];
  _$jscoverage['/table.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['261'] = [];
  _$jscoverage['/table.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['267'] = [];
  _$jscoverage['/table.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['277'] = [];
  _$jscoverage['/table.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['287'] = [];
  _$jscoverage['/table.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['288'] = [];
  _$jscoverage['/table.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['289'] = [];
  _$jscoverage['/table.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['293'] = [];
  _$jscoverage['/table.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['293'][4] = new BranchData();
  _$jscoverage['/table.js'].branchData['297'] = [];
  _$jscoverage['/table.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['297'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['308'] = [];
  _$jscoverage['/table.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['314'] = [];
  _$jscoverage['/table.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['333'] = [];
  _$jscoverage['/table.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['360'] = [];
  _$jscoverage['/table.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['361'] = [];
  _$jscoverage['/table.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['373'] = [];
  _$jscoverage['/table.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['375'] = [];
  _$jscoverage['/table.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['389'] = [];
  _$jscoverage['/table.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['398'] = [];
  _$jscoverage['/table.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['399'] = [];
  _$jscoverage['/table.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['410'] = [];
  _$jscoverage['/table.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['423'] = [];
  _$jscoverage['/table.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['424'] = [];
  _$jscoverage['/table.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['426'] = [];
  _$jscoverage['/table.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['441'] = [];
  _$jscoverage['/table.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['441'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['442'] = [];
  _$jscoverage['/table.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['442'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['443'] = [];
  _$jscoverage['/table.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['464'] = [];
  _$jscoverage['/table.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['509'] = [];
  _$jscoverage['/table.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['518'] = [];
  _$jscoverage['/table.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['524'] = [];
  _$jscoverage['/table.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['529'] = [];
  _$jscoverage['/table.js'].branchData['529'][1] = new BranchData();
}
_$jscoverage['/table.js'].branchData['529'][1].init(103, 105, '!statusChecker[content] || statusChecker[content].call(self, editor)');
function visit86_529_1(result) {
  _$jscoverage['/table.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['524'][1].init(30, 8, 'e.newVal');
function visit85_524_1(result) {
  _$jscoverage['/table.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['518'][1].init(94, 17, 'handlers[content]');
function visit84_518_1(result) {
  _$jscoverage['/table.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['509'][1].init(22, 41, 'S.inArray(Dom.nodeName(node), tableRules)');
function visit83_509_1(result) {
  _$jscoverage['/table.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['464'][1].init(246, 43, 'element && placeCursorInCell(element, true)');
function visit82_464_1(result) {
  _$jscoverage['/table.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['443'][1].init(59, 25, 'parent.nodeName() != \'td\'');
function visit81_443_1(result) {
  _$jscoverage['/table.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['442'][2].init(1048, 27, 'parent.nodeName() != \'body\'');
function visit80_442_2(result) {
  _$jscoverage['/table.js'].branchData['442'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['442'][1].init(64, 85, 'parent.nodeName() != \'body\' && parent.nodeName() != \'td\'');
function visit79_442_1(result) {
  _$jscoverage['/table.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['441'][2].init(981, 32, 'parent[0].childNodes.length == 1');
function visit78_441_2(result) {
  _$jscoverage['/table.js'].branchData['441'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['441'][1].init(981, 150, 'parent[0].childNodes.length == 1 && parent.nodeName() != \'body\' && parent.nodeName() != \'td\'');
function visit77_441_1(result) {
  _$jscoverage['/table.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['426'][1].init(315, 6, '!table');
function visit76_426_1(result) {
  _$jscoverage['/table.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['424'][1].init(161, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit75_424_1(result) {
  _$jscoverage['/table.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['423'][1].init(82, 40, 'selection && selection.getStartElement()');
function visit74_423_1(result) {
  _$jscoverage['/table.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['410'][1].init(120, 4, 'info');
function visit73_410_1(result) {
  _$jscoverage['/table.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['399'][1].init(148, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit72_399_1(result) {
  _$jscoverage['/table.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['398'][1].init(75, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit71_398_1(result) {
  _$jscoverage['/table.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['389'][1].init(24, 12, 'config || {}');
function visit70_389_1(result) {
  _$jscoverage['/table.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['375'][1].init(110, 1, 'v');
function visit69_375_1(result) {
  _$jscoverage['/table.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['373'][1].init(96, 8, 'cssClass');
function visit68_373_1(result) {
  _$jscoverage['/table.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['361'][1].init(64, 14, 'cssClass || ""');
function visit67_361_1(result) {
  _$jscoverage['/table.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['360'][2].init(186, 11, 'border <= 0');
function visit66_360_2(result) {
  _$jscoverage['/table.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['360'][1].init(175, 22, '!border || border <= 0');
function visit65_360_1(result) {
  _$jscoverage['/table.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['333'][1].init(-1, 14, 'UA[\'ie\'] === 6');
function visit64_333_1(result) {
  _$jscoverage['/table.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['314'][1].init(53, 15, 'info && info.tr');
function visit63_314_1(result) {
  _$jscoverage['/table.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['308'][1].init(53, 15, 'info && info.td');
function visit62_308_1(result) {
  _$jscoverage['/table.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['297'][2].init(83, 12, 'name == "tr"');
function visit61_297_2(result) {
  _$jscoverage['/table.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['297'][1].init(62, 33, 'table.contains(n) && name == "tr"');
function visit60_297_1(result) {
  _$jscoverage['/table.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['293'][4].init(100, 12, 'name == "th"');
function visit59_293_4(result) {
  _$jscoverage['/table.js'].branchData['293'][4].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['293'][3].init(84, 12, 'name == "td"');
function visit58_293_3(result) {
  _$jscoverage['/table.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['293'][2].init(84, 28, 'name == "td" || name == "th"');
function visit57_293_2(result) {
  _$jscoverage['/table.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['293'][1].init(62, 51, 'table.contains(n) && (name == "td" || name == "th")');
function visit56_293_1(result) {
  _$jscoverage['/table.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['289'][1].init(211, 6, '!table');
function visit55_289_1(result) {
  _$jscoverage['/table.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['288'][1].init(129, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit54_288_1(result) {
  _$jscoverage['/table.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['287'][1].init(66, 40, 'selection && selection.getStartElement()');
function visit53_287_1(result) {
  _$jscoverage['/table.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['277'][1].init(76, 89, '!range[\'moveToElementEditablePosition\'](cell, placeAtEnd ? true : undefined)');
function visit52_277_1(result) {
  _$jscoverage['/table.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['267'][1].init(430, 25, 'row[0].cells[cellIndex]');
function visit51_267_1(result) {
  _$jscoverage['/table.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['261'][2].init(243, 24, 'row[0].cells.length == 1');
function visit50_261_2(result) {
  _$jscoverage['/table.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['261'][1].init(229, 38, '!cellIndex && row[0].cells.length == 1');
function visit49_261_1(result) {
  _$jscoverage['/table.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['255'][1].init(502, 6, 'i >= 0');
function visit48_255_1(result) {
  _$jscoverage['/table.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['244'][1].init(146, 6, '!table');
function visit47_244_1(result) {
  _$jscoverage['/table.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['239'][1].init(512, 31, 'selectionOrCell instanceof Node');
function visit46_239_1(result) {
  _$jscoverage['/table.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['233'][1].init(73, 17, 'colsToDelete[i]');
function visit45_233_1(result) {
  _$jscoverage['/table.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['231'][1].init(198, 6, 'i >= 0');
function visit44_231_1(result) {
  _$jscoverage['/table.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['227'][1].init(14, 43, 'selectionOrCell instanceof Editor.Selection');
function visit43_227_1(result) {
  _$jscoverage['/table.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['218'][1].init(76, 10, 'targetCell');
function visit42_218_1(result) {
  _$jscoverage['/table.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['216'][1].init(47, 10, 'i < length');
function visit41_216_1(result) {
  _$jscoverage['/table.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['209'][1].init(28, 22, 'cellIndexList[0] > 0');
function visit40_209_1(result) {
  _$jscoverage['/table.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['208'][1].init(695, 12, '!targetIndex');
function visit39_208_1(result) {
  _$jscoverage['/table.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['202'][1].init(18, 47, 'cellIndexList[i] - cellIndexList[i - 1] > 1');
function visit38_202_1(result) {
  _$jscoverage['/table.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['201'][1].init(56, 10, 'i < length');
function visit37_201_1(result) {
  _$jscoverage['/table.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['194'][1].init(256, 10, 'i < length');
function visit36_194_1(result) {
  _$jscoverage['/table.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['189'][1].init(44, 40, 'cells[0] && cells[0].parent(\'table\')');
function visit35_189_1(result) {
  _$jscoverage['/table.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['180'][1].init(483, 12, 'insertBefore');
function visit34_180_1(result) {
  _$jscoverage['/table.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['176'][1].init(288, 9, '!UA[\'ie\']');
function visit33_176_1(result) {
  _$jscoverage['/table.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['172'][1].init(127, 37, '$row.cells.length < (cellIndex + 1)');
function visit32_172_1(result) {
  _$jscoverage['/table.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['169'][1].init(496, 24, 'i < table[0].rows.length');
function visit31_169_1(result) {
  _$jscoverage['/table.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['161'][1].init(249, 5, '!cell');
function visit30_161_1(result) {
  _$jscoverage['/table.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['158'][1].init(67, 95, 'startElement.closest(\'td\', undefined) || startElement.closest(\'th\', undefined)');
function visit29_158_1(result) {
  _$jscoverage['/table.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['146'][1].init(73, 25, 'table[0].rows.length == 1');
function visit28_146_1(result) {
  _$jscoverage['/table.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['143'][1].init(1598, 30, 'selectionOrRow instanceof Node');
function visit27_143_1(result) {
  _$jscoverage['/table.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['137'][1].init(22, 17, 'rowsToDelete[i]');
function visit26_137_1(result) {
  _$jscoverage['/table.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['136'][1].init(1349, 6, 'i >= 0');
function visit25_136_1(result) {
  _$jscoverage['/table.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['133'][3].init(127, 20, 'previousRowIndex > 0');
function visit24_133_3(result) {
  _$jscoverage['/table.js'].branchData['133'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['133'][2].init(126, 57, 'previousRowIndex > 0 && table[0].rows[previousRowIndex]');
function visit23_133_2(result) {
  _$jscoverage['/table.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['133'][1].init(80, 101, 'previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit22_133_1(result) {
  _$jscoverage['/table.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['132'][3].init(45, 23, 'nextRowIndex < rowCount');
function visit21_132_3(result) {
  _$jscoverage['/table.js'].branchData['132'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['132'][2].init(44, 56, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex]');
function visit20_132_2(result) {
  _$jscoverage['/table.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['132'][1].init(26, 182, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex] || previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit19_132_1(result) {
  _$jscoverage['/table.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['120'][2].init(226, 19, 'i == cellsCount - 1');
function visit18_120_2(result) {
  _$jscoverage['/table.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['120'][1].init(226, 54, 'i == cellsCount - 1 && (nextRowIndex = rowIndex + 1)');
function visit17_120_1(result) {
  _$jscoverage['/table.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['118'][1].init(117, 41, '!i && (previousRowIndex = rowIndex - 1)');
function visit16_118_1(result) {
  _$jscoverage['/table.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['114'][1].init(372, 14, 'i < cellsCount');
function visit15_114_1(result) {
  _$jscoverage['/table.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['104'][1].init(14, 42, 'selectionOrRow instanceof Editor.Selection');
function visit14_104_1(result) {
  _$jscoverage['/table.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['90'][1].init(133, 4, '!row');
function visit13_90_1(result) {
  _$jscoverage['/table.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['82'][1].init(59, 9, '!UA[\'ie\']');
function visit12_82_1(result) {
  _$jscoverage['/table.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['80'][1].init(130, 17, 'i < $cells.length');
function visit11_80_1(result) {
  _$jscoverage['/table.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['60'][2].init(437, 95, 'cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit10_60_2(result) {
  _$jscoverage['/table.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['60'][1].init(427, 105, 'parent && cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit9_60_1(result) {
  _$jscoverage['/table.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['44'][1].init(304, 11, 'nearestCell');
function visit8_44_1(result) {
  _$jscoverage['/table.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['42'][1].init(77, 97, 'startNode.closest(\'td\', undefined) || startNode.closest(\'th\', undefined)');
function visit7_42_1(result) {
  _$jscoverage['/table.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['39'][1].init(58, 15, 'range.collapsed');
function visit6_39_1(result) {
  _$jscoverage['/table.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['36'][1].init(929, 17, 'i < ranges.length');
function visit5_36_1(result) {
  _$jscoverage['/table.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['29'][1].init(65, 83, 'cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit4_29_1(result) {
  _$jscoverage['/table.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['28'][2].init(257, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit3_28_2(result) {
  _$jscoverage['/table.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['28'][1].init(257, 149, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit2_28_1(result) {
  _$jscoverage['/table.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['23'][1].init(64, 17, 'retval.length > 0');
function visit1_23_1(result) {
  _$jscoverage['/table.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].lineData[6]++;
KISSY.add("editor/plugin/table", function(S, Editor, DialogLoader) {
  _$jscoverage['/table.js'].functionData[0]++;
  _$jscoverage['/table.js'].lineData[7]++;
  var UA = S.UA, Dom = S.DOM, Node = S.Node, tableRules = ["tr", "th", "td", "tbody", "table"], cellNodeRegex = /^(?:td|th)$/;
  _$jscoverage['/table.js'].lineData[13]++;
  function getSelectedCells(selection) {
    _$jscoverage['/table.js'].functionData[1]++;
    _$jscoverage['/table.js'].lineData[16]++;
    var bookmarks = selection.createBookmarks(), ranges = selection.getRanges(), retval = [], database = {};
    _$jscoverage['/table.js'].lineData[21]++;
    function moveOutOfCellGuard(node) {
      _$jscoverage['/table.js'].functionData[2]++;
      _$jscoverage['/table.js'].lineData[23]++;
      if (visit1_23_1(retval.length > 0)) {
        _$jscoverage['/table.js'].lineData[24]++;
        return;
      }
      _$jscoverage['/table.js'].lineData[28]++;
      if (visit2_28_1(visit3_28_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit4_29_1(cellNodeRegex.test(node.nodeName()) && !node.data('selected_cell')))) {
        _$jscoverage['/table.js'].lineData[31]++;
        node._4e_setMarker(database, 'selected_cell', true, undefined);
        _$jscoverage['/table.js'].lineData[32]++;
        retval.push(node);
      }
    }
    _$jscoverage['/table.js'].lineData[36]++;
    for (var i = 0; visit5_36_1(i < ranges.length); i++) {
      _$jscoverage['/table.js'].lineData[37]++;
      var range = ranges[i];
      _$jscoverage['/table.js'].lineData[39]++;
      if (visit6_39_1(range.collapsed)) {
        _$jscoverage['/table.js'].lineData[41]++;
        var startNode = range.getCommonAncestor(), nearestCell = visit7_42_1(startNode.closest('td', undefined) || startNode.closest('th', undefined));
        _$jscoverage['/table.js'].lineData[44]++;
        if (visit8_44_1(nearestCell)) {
          _$jscoverage['/table.js'].lineData[45]++;
          retval.push(nearestCell);
        }
      } else {
        _$jscoverage['/table.js'].lineData[47]++;
        var walker = new Walker(range), node;
        _$jscoverage['/table.js'].lineData[49]++;
        walker.guard = moveOutOfCellGuard;
        _$jscoverage['/table.js'].lineData[51]++;
        while ((node = walker.next())) {
          _$jscoverage['/table.js'].lineData[59]++;
          var parent = node.parent();
          _$jscoverage['/table.js'].lineData[60]++;
          if (visit9_60_1(parent && visit10_60_2(cellNodeRegex.test(parent.nodeName()) && !parent.data('selected_cell')))) {
            _$jscoverage['/table.js'].lineData[62]++;
            parent._4e_setMarker(database, 'selected_cell', true, undefined);
            _$jscoverage['/table.js'].lineData[63]++;
            retval.push(parent);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[69]++;
    Editor.Utils.clearAllMarkers(database);
    _$jscoverage['/table.js'].lineData[71]++;
    selection.selectBookmarks(bookmarks);
    _$jscoverage['/table.js'].lineData[73]++;
    return retval;
  }
  _$jscoverage['/table.js'].lineData[76]++;
  function clearRow($tr) {
    _$jscoverage['/table.js'].functionData[3]++;
    _$jscoverage['/table.js'].lineData[78]++;
    var $cells = $tr.cells;
    _$jscoverage['/table.js'].lineData[80]++;
    for (var i = 0; visit11_80_1(i < $cells.length); i++) {
      _$jscoverage['/table.js'].lineData[81]++;
      $cells[i].innerHTML = '';
      _$jscoverage['/table.js'].lineData[82]++;
      if (visit12_82_1(!UA['ie'])) {
        _$jscoverage['/table.js'].lineData[83]++;
        (new Node($cells[i]))._4e_appendBogus(undefined);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[87]++;
  function insertRow(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[4]++;
    _$jscoverage['/table.js'].lineData[89]++;
    var row = selection.getStartElement().parent('tr');
    _$jscoverage['/table.js'].lineData[90]++;
    if (visit13_90_1(!row)) {
      _$jscoverage['/table.js'].lineData[91]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[94]++;
    var newRow = row.clone(true);
    _$jscoverage['/table.js'].lineData[96]++;
    newRow.insertBefore(row);
    _$jscoverage['/table.js'].lineData[100]++;
    clearRow(insertBefore ? newRow[0] : row[0]);
  }
  _$jscoverage['/table.js'].lineData[103]++;
  function deleteRows(selectionOrRow) {
    _$jscoverage['/table.js'].functionData[5]++;
    _$jscoverage['/table.js'].lineData[104]++;
    if (visit14_104_1(selectionOrRow instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[105]++;
      var cells = getSelectedCells(selectionOrRow), cellsCount = cells.length, rowsToDelete = [], cursorPosition, previousRowIndex, nextRowIndex;
      _$jscoverage['/table.js'].lineData[114]++;
      for (var i = 0; visit15_114_1(i < cellsCount); i++) {
        _$jscoverage['/table.js'].lineData[115]++;
        var row = cells[i].parent(), rowIndex = row[0].rowIndex;
        _$jscoverage['/table.js'].lineData[118]++;
        visit16_118_1(!i && (previousRowIndex = rowIndex - 1));
        _$jscoverage['/table.js'].lineData[119]++;
        rowsToDelete[rowIndex] = row;
        _$jscoverage['/table.js'].lineData[120]++;
        visit17_120_1(visit18_120_2(i == cellsCount - 1) && (nextRowIndex = rowIndex + 1));
      }
      _$jscoverage['/table.js'].lineData[123]++;
      var table = row.parent('table'), rows = table[0].rows, rowCount = rows.length;
      _$jscoverage['/table.js'].lineData[131]++;
      cursorPosition = new Node(visit19_132_1(visit20_132_2(visit21_132_3(nextRowIndex < rowCount) && table[0].rows[nextRowIndex]) || visit22_133_1(visit23_133_2(visit24_133_3(previousRowIndex > 0) && table[0].rows[previousRowIndex]) || table[0].parentNode)));
      _$jscoverage['/table.js'].lineData[136]++;
      for (i = rowsToDelete.length; visit25_136_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[137]++;
        if (visit26_137_1(rowsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[138]++;
          deleteRows(rowsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[141]++;
      return cursorPosition;
    } else {
      _$jscoverage['/table.js'].lineData[143]++;
      if (visit27_143_1(selectionOrRow instanceof Node)) {
        _$jscoverage['/table.js'].lineData[144]++;
        table = selectionOrRow.parent('table');
        _$jscoverage['/table.js'].lineData[146]++;
        if (visit28_146_1(table[0].rows.length == 1)) {
          _$jscoverage['/table.js'].lineData[147]++;
          table.remove();
        } else {
          _$jscoverage['/table.js'].lineData[149]++;
          selectionOrRow.remove();
        }
      }
    }
    _$jscoverage['/table.js'].lineData[152]++;
    return 0;
  }
  _$jscoverage['/table.js'].lineData[155]++;
  function insertColumn(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[6]++;
    _$jscoverage['/table.js'].lineData[157]++;
    var startElement = selection.getStartElement(), cell = visit29_158_1(startElement.closest('td', undefined) || startElement.closest('th', undefined));
    _$jscoverage['/table.js'].lineData[161]++;
    if (visit30_161_1(!cell)) {
      _$jscoverage['/table.js'].lineData[162]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[166]++;
    var table = cell.parent('table'), cellIndex = cell[0].cellIndex;
    _$jscoverage['/table.js'].lineData[169]++;
    for (var i = 0; visit31_169_1(i < table[0].rows.length); i++) {
      _$jscoverage['/table.js'].lineData[170]++;
      var $row = table[0].rows[i];
      _$jscoverage['/table.js'].lineData[172]++;
      if (visit32_172_1($row.cells.length < (cellIndex + 1))) {
        _$jscoverage['/table.js'].lineData[173]++;
        continue;
      }
      _$jscoverage['/table.js'].lineData[174]++;
      cell = new Node($row.cells[cellIndex].cloneNode(undefined));
      _$jscoverage['/table.js'].lineData[176]++;
      if (visit33_176_1(!UA['ie'])) {
        _$jscoverage['/table.js'].lineData[177]++;
        cell._4e_appendBogus(undefined);
      }
      _$jscoverage['/table.js'].lineData[179]++;
      var baseCell = new Node($row.cells[cellIndex]);
      _$jscoverage['/table.js'].lineData[180]++;
      if (visit34_180_1(insertBefore)) {
        _$jscoverage['/table.js'].lineData[181]++;
        cell.insertBefore(baseCell);
      } else {
        _$jscoverage['/table.js'].lineData[183]++;
        cell.insertAfter(baseCell);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[187]++;
  function getFocusElementAfterDelCols(cells) {
    _$jscoverage['/table.js'].functionData[7]++;
    _$jscoverage['/table.js'].lineData[188]++;
    var cellIndexList = [], table = visit35_189_1(cells[0] && cells[0].parent('table')), i, length, targetIndex, targetCell;
    _$jscoverage['/table.js'].lineData[194]++;
    for (i = 0 , length = cells.length; visit36_194_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[195]++;
      cellIndexList.push(cells[i][0].cellIndex);
    }
    _$jscoverage['/table.js'].lineData[199]++;
    cellIndexList.sort();
    _$jscoverage['/table.js'].lineData[200]++;
    for (i = 1 , length = cellIndexList.length; visit37_201_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[202]++;
      if (visit38_202_1(cellIndexList[i] - cellIndexList[i - 1] > 1)) {
        _$jscoverage['/table.js'].lineData[203]++;
        targetIndex = cellIndexList[i - 1] + 1;
        _$jscoverage['/table.js'].lineData[204]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[208]++;
    if (visit39_208_1(!targetIndex)) {
      _$jscoverage['/table.js'].lineData[209]++;
      targetIndex = visit40_209_1(cellIndexList[0] > 0) ? (cellIndexList[0] - 1) : (cellIndexList[cellIndexList.length - 1] + 1);
    }
    _$jscoverage['/table.js'].lineData[214]++;
    var rows = table[0].rows;
    _$jscoverage['/table.js'].lineData[215]++;
    for (i = 0 , length = rows.length; visit41_216_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[217]++;
      targetCell = rows[i].cells[targetIndex];
      _$jscoverage['/table.js'].lineData[218]++;
      if (visit42_218_1(targetCell)) {
        _$jscoverage['/table.js'].lineData[219]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[223]++;
    return targetCell ? new Node(targetCell) : table.prev();
  }
  _$jscoverage['/table.js'].lineData[226]++;
  function deleteColumns(selectionOrCell) {
    _$jscoverage['/table.js'].functionData[8]++;
    _$jscoverage['/table.js'].lineData[227]++;
    if (visit43_227_1(selectionOrCell instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[228]++;
      var colsToDelete = getSelectedCells(selectionOrCell), elementToFocus = getFocusElementAfterDelCols(colsToDelete);
      _$jscoverage['/table.js'].lineData[231]++;
      for (var i = colsToDelete.length - 1; visit44_231_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[233]++;
        if (visit45_233_1(colsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[234]++;
          deleteColumns(colsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[238]++;
      return elementToFocus;
    } else {
      _$jscoverage['/table.js'].lineData[239]++;
      if (visit46_239_1(selectionOrCell instanceof Node)) {
        _$jscoverage['/table.js'].lineData[241]++;
        var table = selectionOrCell.parent('table');
        _$jscoverage['/table.js'].lineData[244]++;
        if (visit47_244_1(!table)) {
          _$jscoverage['/table.js'].lineData[245]++;
          return null;
        }
        _$jscoverage['/table.js'].lineData[248]++;
        var cellIndex = selectionOrCell[0].cellIndex;
        _$jscoverage['/table.js'].lineData[255]++;
        for (i = table[0].rows.length - 1; visit48_255_1(i >= 0); i--) {
          _$jscoverage['/table.js'].lineData[257]++;
          var row = new Node(table[0].rows[i]);
          _$jscoverage['/table.js'].lineData[261]++;
          if (visit49_261_1(!cellIndex && visit50_261_2(row[0].cells.length == 1))) {
            _$jscoverage['/table.js'].lineData[262]++;
            deleteRows(row);
            _$jscoverage['/table.js'].lineData[263]++;
            continue;
          }
          _$jscoverage['/table.js'].lineData[267]++;
          if (visit51_267_1(row[0].cells[cellIndex])) {
            _$jscoverage['/table.js'].lineData[268]++;
            row[0].removeChild(row[0].cells[cellIndex]);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[272]++;
    return null;
  }
  _$jscoverage['/table.js'].lineData[275]++;
  function placeCursorInCell(cell, placeAtEnd) {
    _$jscoverage['/table.js'].functionData[9]++;
    _$jscoverage['/table.js'].lineData[276]++;
    var range = new Editor.Range(cell[0].ownerDocument);
    _$jscoverage['/table.js'].lineData[277]++;
    if (visit52_277_1(!range['moveToElementEditablePosition'](cell, placeAtEnd ? true : undefined))) {
      _$jscoverage['/table.js'].lineData[279]++;
      range.selectNodeContents(cell);
      _$jscoverage['/table.js'].lineData[280]++;
      range.collapse(placeAtEnd ? false : true);
    }
    _$jscoverage['/table.js'].lineData[282]++;
    range.select(true);
  }
  _$jscoverage['/table.js'].lineData[285]++;
  function getSel(editor) {
    _$jscoverage['/table.js'].functionData[10]++;
    _$jscoverage['/table.js'].lineData[286]++;
    var selection = editor.getSelection(), startElement = visit53_287_1(selection && selection.getStartElement()), table = visit54_288_1(startElement && startElement.closest('table', undefined));
    _$jscoverage['/table.js'].lineData[289]++;
    if (visit55_289_1(!table)) {
      _$jscoverage['/table.js'].lineData[290]++;
      return undefined;
    }
    _$jscoverage['/table.js'].lineData[291]++;
    var td = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[11]++;
  _$jscoverage['/table.js'].lineData[292]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[293]++;
  return visit56_293_1(table.contains(n) && (visit57_293_2(visit58_293_3(name == "td") || visit59_293_4(name == "th"))));
}, undefined);
    _$jscoverage['/table.js'].lineData[295]++;
    var tr = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[12]++;
  _$jscoverage['/table.js'].lineData[296]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[297]++;
  return visit60_297_1(table.contains(n) && visit61_297_2(name == "tr"));
}, undefined);
    _$jscoverage['/table.js'].lineData[299]++;
    return {
  table: table, 
  td: td, 
  tr: tr};
  }
  _$jscoverage['/table.js'].lineData[306]++;
  function ensureTd(editor) {
    _$jscoverage['/table.js'].functionData[13]++;
    _$jscoverage['/table.js'].lineData[307]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[308]++;
    return visit62_308_1(info && info.td);
  }
  _$jscoverage['/table.js'].lineData[312]++;
  function ensureTr(editor) {
    _$jscoverage['/table.js'].functionData[14]++;
    _$jscoverage['/table.js'].lineData[313]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[314]++;
    return visit63_314_1(info && info.tr);
  }
  _$jscoverage['/table.js'].lineData[317]++;
  var statusChecker = {
  "\u8868\u683c\u5c5e\u6027": getSel, 
  "\u5220\u9664\u8868\u683c": ensureTd, 
  "\u5220\u9664\u5217": ensureTd, 
  "\u5220\u9664\u884c": ensureTr, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': ensureTd, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': ensureTd};
  _$jscoverage['/table.js'].lineData[329]++;
  var showBorderClassName = 'ke_show_border', cssTemplate = (visit64_333_1(UA['ie'] === 6) ? ['table.%2,', 'table.%2 td, table.%2 th,', '{', 'border : #d3d3d3 1px dotted', '}'] : [' table.%2,', ' table.%2 > tr > td,  table.%2 > tr > th,', ' table.%2 > tbody > tr > td,  table.%2 > tbody > tr > th,', ' table.%2 > thead > tr > td,  table.%2 > thead > tr > th,', ' table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th', '{', 'border : #d3d3d3 1px dotted', '}']).join(''), cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName), extraDataFilter = {
  tags: {
  'table': function(element) {
  _$jscoverage['/table.js'].functionData[15]++;
  _$jscoverage['/table.js'].lineData[357]++;
  var cssClass = element.getAttribute("class"), border = parseInt(element.getAttribute("border"), 10);
  _$jscoverage['/table.js'].lineData[360]++;
  if (visit65_360_1(!border || visit66_360_2(border <= 0))) {
    _$jscoverage['/table.js'].lineData[361]++;
    element.setAttribute("class", S.trim((visit67_361_1(cssClass || "")) + ' ' + showBorderClassName));
  }
}}}, extraHTMLFilter = {
  tags: {
  'table': function(table) {
  _$jscoverage['/table.js'].functionData[16]++;
  _$jscoverage['/table.js'].lineData[371]++;
  var cssClass = table.getAttribute("class"), v;
  _$jscoverage['/table.js'].lineData[373]++;
  if (visit68_373_1(cssClass)) {
    _$jscoverage['/table.js'].lineData[374]++;
    v = S.trim(cssClass.replace(showBorderClassName, ""));
    _$jscoverage['/table.js'].lineData[375]++;
    if (visit69_375_1(v)) {
      _$jscoverage['/table.js'].lineData[376]++;
      table.setAttribute("class", v);
    } else {
      _$jscoverage['/table.js'].lineData[378]++;
      table.removeAttribute("class");
    }
  }
}}};
  _$jscoverage['/table.js'].lineData[388]++;
  function TablePlugin(config) {
    _$jscoverage['/table.js'].functionData[17]++;
    _$jscoverage['/table.js'].lineData[389]++;
    this.config = visit70_389_1(config || {});
  }
  _$jscoverage['/table.js'].lineData[392]++;
  S.augment(TablePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/table.js'].functionData[18]++;
  _$jscoverage['/table.js'].lineData[395]++;
  editor.addCustomStyle(cssStyleText);
  _$jscoverage['/table.js'].lineData[397]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit71_398_1(dataProcessor && dataProcessor.dataFilter), htmlFilter = visit72_399_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/table.js'].lineData[401]++;
  dataFilter.addRules(extraDataFilter);
  _$jscoverage['/table.js'].lineData[402]++;
  htmlFilter.addRules(extraHTMLFilter);
  _$jscoverage['/table.js'].lineData[404]++;
  var self = this, handlers = {
  "\u8868\u683c\u5c5e\u6027": function() {
  _$jscoverage['/table.js'].functionData[19]++;
  _$jscoverage['/table.js'].lineData[408]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[409]++;
  var info = getSel(editor);
  _$jscoverage['/table.js'].lineData[410]++;
  if (visit73_410_1(info)) {
    _$jscoverage['/table.js'].lineData[411]++;
    DialogLoader.useDialog(editor, "table", self.config, {
  selectedTable: info.table, 
  selectedTd: info.td});
  }
}, 
  "\u5220\u9664\u8868\u683c": function() {
  _$jscoverage['/table.js'].functionData[20]++;
  _$jscoverage['/table.js'].lineData[421]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[422]++;
  var selection = editor.getSelection(), startElement = visit74_423_1(selection && selection.getStartElement()), table = visit75_424_1(startElement && startElement.closest('table', undefined));
  _$jscoverage['/table.js'].lineData[426]++;
  if (visit76_426_1(!table)) {
    _$jscoverage['/table.js'].lineData[427]++;
    return;
  }
  _$jscoverage['/table.js'].lineData[430]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[433]++;
  selection.selectElement(table);
  _$jscoverage['/table.js'].lineData[434]++;
  var range = selection.getRanges()[0];
  _$jscoverage['/table.js'].lineData[435]++;
  range.collapse();
  _$jscoverage['/table.js'].lineData[436]++;
  selection.selectRanges([range]);
  _$jscoverage['/table.js'].lineData[440]++;
  var parent = table.parent();
  _$jscoverage['/table.js'].lineData[441]++;
  if (visit77_441_1(visit78_441_2(parent[0].childNodes.length == 1) && visit79_442_1(visit80_442_2(parent.nodeName() != 'body') && visit81_443_1(parent.nodeName() != 'td')))) {
    _$jscoverage['/table.js'].lineData[444]++;
    parent.remove();
  } else {
    _$jscoverage['/table.js'].lineData[446]++;
    table.remove();
  }
  _$jscoverage['/table.js'].lineData[448]++;
  editor.execCommand("save");
}, 
  '\u5220\u9664\u884c ': function() {
  _$jscoverage['/table.js'].functionData[21]++;
  _$jscoverage['/table.js'].lineData[452]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[453]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[454]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[455]++;
  placeCursorInCell(deleteRows(selection), undefined);
  _$jscoverage['/table.js'].lineData[456]++;
  editor.execCommand("save");
}, 
  '\u5220\u9664\u5217 ': function() {
  _$jscoverage['/table.js'].functionData[22]++;
  _$jscoverage['/table.js'].lineData[460]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[461]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[462]++;
  var selection = editor.getSelection(), element = deleteColumns(selection);
  _$jscoverage['/table.js'].lineData[464]++;
  visit82_464_1(element && placeCursorInCell(element, true));
  _$jscoverage['/table.js'].lineData[465]++;
  editor.execCommand("save");
}, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[23]++;
  _$jscoverage['/table.js'].lineData[469]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[470]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[471]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[472]++;
  insertRow(selection, true);
  _$jscoverage['/table.js'].lineData[473]++;
  editor.execCommand("save");
}, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[24]++;
  _$jscoverage['/table.js'].lineData[477]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[478]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[479]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[480]++;
  insertRow(selection, undefined);
  _$jscoverage['/table.js'].lineData[481]++;
  editor.execCommand("save");
}, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[25]++;
  _$jscoverage['/table.js'].lineData[485]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[486]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[487]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[488]++;
  insertColumn(selection, true);
  _$jscoverage['/table.js'].lineData[489]++;
  editor.execCommand("save");
}, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[26]++;
  _$jscoverage['/table.js'].lineData[493]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[494]++;
  editor.execCommand("save");
  _$jscoverage['/table.js'].lineData[495]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[496]++;
  insertColumn(selection, undefined);
  _$jscoverage['/table.js'].lineData[497]++;
  editor.execCommand("save");
}};
  _$jscoverage['/table.js'].lineData[501]++;
  var children = [];
  _$jscoverage['/table.js'].lineData[502]++;
  S.each(handlers, function(h, name) {
  _$jscoverage['/table.js'].functionData[27]++;
  _$jscoverage['/table.js'].lineData[503]++;
  children.push({
  content: name});
});
  _$jscoverage['/table.js'].lineData[508]++;
  editor.addContextMenu("table", function(node) {
  _$jscoverage['/table.js'].functionData[28]++;
  _$jscoverage['/table.js'].lineData[509]++;
  if (visit83_509_1(S.inArray(Dom.nodeName(node), tableRules))) {
    _$jscoverage['/table.js'].lineData[510]++;
    return true;
  }
}, {
  width: "120px", 
  children: children, 
  listeners: {
  click: function(e) {
  _$jscoverage['/table.js'].functionData[29]++;
  _$jscoverage['/table.js'].lineData[517]++;
  var content = e.target.get("content");
  _$jscoverage['/table.js'].lineData[518]++;
  if (visit84_518_1(handlers[content])) {
    _$jscoverage['/table.js'].lineData[519]++;
    handlers[content].apply(this);
  }
}, 
  beforeVisibleChange: function(e) {
  _$jscoverage['/table.js'].functionData[30]++;
  _$jscoverage['/table.js'].lineData[524]++;
  if (visit85_524_1(e.newVal)) {
    _$jscoverage['/table.js'].lineData[525]++;
    var self = this, children = self.get("children");
    _$jscoverage['/table.js'].lineData[526]++;
    var editor = self.get("editor");
    _$jscoverage['/table.js'].lineData[527]++;
    S.each(children, function(c) {
  _$jscoverage['/table.js'].functionData[31]++;
  _$jscoverage['/table.js'].lineData[528]++;
  var content = c.get("content");
  _$jscoverage['/table.js'].lineData[529]++;
  if (visit86_529_1(!statusChecker[content] || statusChecker[content].call(self, editor))) {
    _$jscoverage['/table.js'].lineData[531]++;
    c.set("disabled", false);
  } else {
    _$jscoverage['/table.js'].lineData[533]++;
    c.set("disabled", true);
  }
});
  }
}}});
  _$jscoverage['/table.js'].lineData[542]++;
  editor.addButton("table", {
  mode: Editor.Mode.WYSIWYG_MODE, 
  listeners: {
  click: function() {
  _$jscoverage['/table.js'].functionData[32]++;
  _$jscoverage['/table.js'].lineData[546]++;
  DialogLoader.useDialog(editor, "table", self.config, {
  selectedTable: 0, 
  selectedTd: 0});
}}, 
  tooltip: "\u63d2\u5165\u8868\u683c"});
}});
  _$jscoverage['/table.js'].lineData[561]++;
  return TablePlugin;
}, {
  requires: ['editor', './dialog-loader', './contextmenu']});
