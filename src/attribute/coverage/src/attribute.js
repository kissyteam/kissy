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
  _$jscoverage['/attribute.js'].lineData[9] = 0;
  _$jscoverage['/attribute.js'].lineData[10] = 0;
  _$jscoverage['/attribute.js'].lineData[11] = 0;
  _$jscoverage['/attribute.js'].lineData[14] = 0;
  _$jscoverage['/attribute.js'].lineData[19] = 0;
  _$jscoverage['/attribute.js'].lineData[21] = 0;
  _$jscoverage['/attribute.js'].lineData[23] = 0;
  _$jscoverage['/attribute.js'].lineData[24] = 0;
  _$jscoverage['/attribute.js'].lineData[25] = 0;
  _$jscoverage['/attribute.js'].lineData[27] = 0;
  _$jscoverage['/attribute.js'].lineData[30] = 0;
  _$jscoverage['/attribute.js'].lineData[31] = 0;
  _$jscoverage['/attribute.js'].lineData[34] = 0;
  _$jscoverage['/attribute.js'].lineData[35] = 0;
  _$jscoverage['/attribute.js'].lineData[39] = 0;
  _$jscoverage['/attribute.js'].lineData[40] = 0;
  _$jscoverage['/attribute.js'].lineData[41] = 0;
  _$jscoverage['/attribute.js'].lineData[49] = 0;
  _$jscoverage['/attribute.js'].lineData[50] = 0;
  _$jscoverage['/attribute.js'].lineData[51] = 0;
  _$jscoverage['/attribute.js'].lineData[52] = 0;
  _$jscoverage['/attribute.js'].lineData[54] = 0;
  _$jscoverage['/attribute.js'].lineData[60] = 0;
  _$jscoverage['/attribute.js'].lineData[61] = 0;
  _$jscoverage['/attribute.js'].lineData[64] = 0;
  _$jscoverage['/attribute.js'].lineData[66] = 0;
  _$jscoverage['/attribute.js'].lineData[72] = 0;
  _$jscoverage['/attribute.js'].lineData[73] = 0;
  _$jscoverage['/attribute.js'].lineData[75] = 0;
  _$jscoverage['/attribute.js'].lineData[76] = 0;
  _$jscoverage['/attribute.js'].lineData[77] = 0;
  _$jscoverage['/attribute.js'].lineData[79] = 0;
  _$jscoverage['/attribute.js'].lineData[80] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[85] = 0;
  _$jscoverage['/attribute.js'].lineData[88] = 0;
  _$jscoverage['/attribute.js'].lineData[89] = 0;
  _$jscoverage['/attribute.js'].lineData[91] = 0;
  _$jscoverage['/attribute.js'].lineData[92] = 0;
  _$jscoverage['/attribute.js'].lineData[93] = 0;
  _$jscoverage['/attribute.js'].lineData[96] = 0;
  _$jscoverage['/attribute.js'].lineData[102] = 0;
  _$jscoverage['/attribute.js'].lineData[103] = 0;
  _$jscoverage['/attribute.js'].lineData[104] = 0;
  _$jscoverage['/attribute.js'].lineData[105] = 0;
  _$jscoverage['/attribute.js'].lineData[106] = 0;
  _$jscoverage['/attribute.js'].lineData[108] = 0;
  _$jscoverage['/attribute.js'].lineData[110] = 0;
  _$jscoverage['/attribute.js'].lineData[112] = 0;
  _$jscoverage['/attribute.js'].lineData[115] = 0;
  _$jscoverage['/attribute.js'].lineData[116] = 0;
  _$jscoverage['/attribute.js'].lineData[117] = 0;
  _$jscoverage['/attribute.js'].lineData[118] = 0;
  _$jscoverage['/attribute.js'].lineData[120] = 0;
  _$jscoverage['/attribute.js'].lineData[121] = 0;
  _$jscoverage['/attribute.js'].lineData[122] = 0;
  _$jscoverage['/attribute.js'].lineData[129] = 0;
  _$jscoverage['/attribute.js'].lineData[130] = 0;
  _$jscoverage['/attribute.js'].lineData[136] = 0;
  _$jscoverage['/attribute.js'].lineData[137] = 0;
  _$jscoverage['/attribute.js'].lineData[138] = 0;
  _$jscoverage['/attribute.js'].lineData[140] = 0;
  _$jscoverage['/attribute.js'].lineData[142] = 0;
  _$jscoverage['/attribute.js'].lineData[143] = 0;
  _$jscoverage['/attribute.js'].lineData[148] = 0;
  _$jscoverage['/attribute.js'].lineData[149] = 0;
  _$jscoverage['/attribute.js'].lineData[150] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[156] = 0;
  _$jscoverage['/attribute.js'].lineData[158] = 0;
  _$jscoverage['/attribute.js'].lineData[169] = 0;
  _$jscoverage['/attribute.js'].lineData[170] = 0;
  _$jscoverage['/attribute.js'].lineData[171] = 0;
  _$jscoverage['/attribute.js'].lineData[174] = 0;
  _$jscoverage['/attribute.js'].lineData[175] = 0;
  _$jscoverage['/attribute.js'].lineData[179] = 0;
  _$jscoverage['/attribute.js'].lineData[182] = 0;
  _$jscoverage['/attribute.js'].lineData[183] = 0;
  _$jscoverage['/attribute.js'].lineData[192] = 0;
  _$jscoverage['/attribute.js'].lineData[194] = 0;
  _$jscoverage['/attribute.js'].lineData[195] = 0;
  _$jscoverage['/attribute.js'].lineData[199] = 0;
  _$jscoverage['/attribute.js'].lineData[200] = 0;
  _$jscoverage['/attribute.js'].lineData[201] = 0;
  _$jscoverage['/attribute.js'].lineData[202] = 0;
  _$jscoverage['/attribute.js'].lineData[203] = 0;
  _$jscoverage['/attribute.js'].lineData[210] = 0;
  _$jscoverage['/attribute.js'].lineData[218] = 0;
  _$jscoverage['/attribute.js'].lineData[225] = 0;
  _$jscoverage['/attribute.js'].lineData[226] = 0;
  _$jscoverage['/attribute.js'].lineData[229] = 0;
  _$jscoverage['/attribute.js'].lineData[231] = 0;
  _$jscoverage['/attribute.js'].lineData[232] = 0;
  _$jscoverage['/attribute.js'].lineData[233] = 0;
  _$jscoverage['/attribute.js'].lineData[236] = 0;
  _$jscoverage['/attribute.js'].lineData[239] = 0;
  _$jscoverage['/attribute.js'].lineData[240] = 0;
  _$jscoverage['/attribute.js'].lineData[242] = 0;
  _$jscoverage['/attribute.js'].lineData[243] = 0;
  _$jscoverage['/attribute.js'].lineData[244] = 0;
  _$jscoverage['/attribute.js'].lineData[245] = 0;
  _$jscoverage['/attribute.js'].lineData[249] = 0;
  _$jscoverage['/attribute.js'].lineData[250] = 0;
  _$jscoverage['/attribute.js'].lineData[251] = 0;
  _$jscoverage['/attribute.js'].lineData[252] = 0;
  _$jscoverage['/attribute.js'].lineData[253] = 0;
  _$jscoverage['/attribute.js'].lineData[254] = 0;
  _$jscoverage['/attribute.js'].lineData[255] = 0;
  _$jscoverage['/attribute.js'].lineData[256] = 0;
  _$jscoverage['/attribute.js'].lineData[257] = 0;
  _$jscoverage['/attribute.js'].lineData[258] = 0;
  _$jscoverage['/attribute.js'].lineData[259] = 0;
  _$jscoverage['/attribute.js'].lineData[260] = 0;
  _$jscoverage['/attribute.js'].lineData[261] = 0;
  _$jscoverage['/attribute.js'].lineData[262] = 0;
  _$jscoverage['/attribute.js'].lineData[264] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[267] = 0;
  _$jscoverage['/attribute.js'].lineData[268] = 0;
  _$jscoverage['/attribute.js'].lineData[273] = 0;
  _$jscoverage['/attribute.js'].lineData[274] = 0;
  _$jscoverage['/attribute.js'].lineData[275] = 0;
  _$jscoverage['/attribute.js'].lineData[276] = 0;
  _$jscoverage['/attribute.js'].lineData[279] = 0;
  _$jscoverage['/attribute.js'].lineData[280] = 0;
  _$jscoverage['/attribute.js'].lineData[282] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[285] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[288] = 0;
  _$jscoverage['/attribute.js'].lineData[289] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[292] = 0;
  _$jscoverage['/attribute.js'].lineData[293] = 0;
  _$jscoverage['/attribute.js'].lineData[296] = 0;
  _$jscoverage['/attribute.js'].lineData[298] = 0;
  _$jscoverage['/attribute.js'].lineData[302] = 0;
  _$jscoverage['/attribute.js'].lineData[303] = 0;
  _$jscoverage['/attribute.js'].lineData[307] = 0;
  _$jscoverage['/attribute.js'].lineData[308] = 0;
  _$jscoverage['/attribute.js'].lineData[309] = 0;
  _$jscoverage['/attribute.js'].lineData[310] = 0;
  _$jscoverage['/attribute.js'].lineData[312] = 0;
  _$jscoverage['/attribute.js'].lineData[313] = 0;
  _$jscoverage['/attribute.js'].lineData[314] = 0;
  _$jscoverage['/attribute.js'].lineData[316] = 0;
  _$jscoverage['/attribute.js'].lineData[317] = 0;
  _$jscoverage['/attribute.js'].lineData[318] = 0;
  _$jscoverage['/attribute.js'].lineData[320] = 0;
  _$jscoverage['/attribute.js'].lineData[321] = 0;
  _$jscoverage['/attribute.js'].lineData[322] = 0;
  _$jscoverage['/attribute.js'].lineData[325] = 0;
  _$jscoverage['/attribute.js'].lineData[326] = 0;
  _$jscoverage['/attribute.js'].lineData[327] = 0;
  _$jscoverage['/attribute.js'].lineData[335] = 0;
  _$jscoverage['/attribute.js'].lineData[340] = 0;
  _$jscoverage['/attribute.js'].lineData[341] = 0;
  _$jscoverage['/attribute.js'].lineData[342] = 0;
  _$jscoverage['/attribute.js'].lineData[344] = 0;
  _$jscoverage['/attribute.js'].lineData[349] = 0;
  _$jscoverage['/attribute.js'].lineData[353] = 0;
  _$jscoverage['/attribute.js'].lineData[357] = 0;
  _$jscoverage['/attribute.js'].lineData[358] = 0;
  _$jscoverage['/attribute.js'].lineData[359] = 0;
  _$jscoverage['/attribute.js'].lineData[360] = 0;
  _$jscoverage['/attribute.js'].lineData[363] = 0;
  _$jscoverage['/attribute.js'].lineData[364] = 0;
  _$jscoverage['/attribute.js'].lineData[365] = 0;
  _$jscoverage['/attribute.js'].lineData[367] = 0;
  _$jscoverage['/attribute.js'].lineData[370] = 0;
  _$jscoverage['/attribute.js'].lineData[371] = 0;
  _$jscoverage['/attribute.js'].lineData[373] = 0;
  _$jscoverage['/attribute.js'].lineData[375] = 0;
  _$jscoverage['/attribute.js'].lineData[376] = 0;
  _$jscoverage['/attribute.js'].lineData[378] = 0;
  _$jscoverage['/attribute.js'].lineData[381] = 0;
  _$jscoverage['/attribute.js'].lineData[390] = 0;
  _$jscoverage['/attribute.js'].lineData[398] = 0;
  _$jscoverage['/attribute.js'].lineData[402] = 0;
  _$jscoverage['/attribute.js'].lineData[403] = 0;
  _$jscoverage['/attribute.js'].lineData[405] = 0;
  _$jscoverage['/attribute.js'].lineData[426] = 0;
  _$jscoverage['/attribute.js'].lineData[430] = 0;
  _$jscoverage['/attribute.js'].lineData[431] = 0;
  _$jscoverage['/attribute.js'].lineData[433] = 0;
  _$jscoverage['/attribute.js'].lineData[435] = 0;
  _$jscoverage['/attribute.js'].lineData[445] = 0;
  _$jscoverage['/attribute.js'].lineData[446] = 0;
  _$jscoverage['/attribute.js'].lineData[447] = 0;
  _$jscoverage['/attribute.js'].lineData[449] = 0;
  _$jscoverage['/attribute.js'].lineData[450] = 0;
  _$jscoverage['/attribute.js'].lineData[452] = 0;
  _$jscoverage['/attribute.js'].lineData[461] = 0;
  _$jscoverage['/attribute.js'].lineData[469] = 0;
  _$jscoverage['/attribute.js'].lineData[470] = 0;
  _$jscoverage['/attribute.js'].lineData[471] = 0;
  _$jscoverage['/attribute.js'].lineData[473] = 0;
  _$jscoverage['/attribute.js'].lineData[474] = 0;
  _$jscoverage['/attribute.js'].lineData[475] = 0;
  _$jscoverage['/attribute.js'].lineData[478] = 0;
  _$jscoverage['/attribute.js'].lineData[492] = 0;
  _$jscoverage['/attribute.js'].lineData[493] = 0;
  _$jscoverage['/attribute.js'].lineData[494] = 0;
  _$jscoverage['/attribute.js'].lineData[495] = 0;
  _$jscoverage['/attribute.js'].lineData[496] = 0;
  _$jscoverage['/attribute.js'].lineData[499] = 0;
  _$jscoverage['/attribute.js'].lineData[502] = 0;
  _$jscoverage['/attribute.js'].lineData[503] = 0;
  _$jscoverage['/attribute.js'].lineData[506] = 0;
  _$jscoverage['/attribute.js'].lineData[507] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[510] = 0;
  _$jscoverage['/attribute.js'].lineData[512] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[515] = 0;
  _$jscoverage['/attribute.js'].lineData[519] = 0;
  _$jscoverage['/attribute.js'].lineData[520] = 0;
  _$jscoverage['/attribute.js'].lineData[521] = 0;
  _$jscoverage['/attribute.js'].lineData[522] = 0;
  _$jscoverage['/attribute.js'].lineData[523] = 0;
  _$jscoverage['/attribute.js'].lineData[525] = 0;
  _$jscoverage['/attribute.js'].lineData[526] = 0;
  _$jscoverage['/attribute.js'].lineData[535] = 0;
  _$jscoverage['/attribute.js'].lineData[537] = 0;
  _$jscoverage['/attribute.js'].lineData[539] = 0;
  _$jscoverage['/attribute.js'].lineData[541] = 0;
  _$jscoverage['/attribute.js'].lineData[542] = 0;
  _$jscoverage['/attribute.js'].lineData[543] = 0;
  _$jscoverage['/attribute.js'].lineData[545] = 0;
  _$jscoverage['/attribute.js'].lineData[547] = 0;
  _$jscoverage['/attribute.js'].lineData[556] = 0;
  _$jscoverage['/attribute.js'].lineData[565] = 0;
  _$jscoverage['/attribute.js'].lineData[566] = 0;
  _$jscoverage['/attribute.js'].lineData[569] = 0;
  _$jscoverage['/attribute.js'].lineData[570] = 0;
  _$jscoverage['/attribute.js'].lineData[573] = 0;
  _$jscoverage['/attribute.js'].lineData[574] = 0;
  _$jscoverage['/attribute.js'].lineData[578] = 0;
  _$jscoverage['/attribute.js'].lineData[580] = 0;
  _$jscoverage['/attribute.js'].lineData[589] = 0;
  _$jscoverage['/attribute.js'].lineData[596] = 0;
  _$jscoverage['/attribute.js'].lineData[597] = 0;
  _$jscoverage['/attribute.js'].lineData[598] = 0;
  _$jscoverage['/attribute.js'].lineData[601] = 0;
  _$jscoverage['/attribute.js'].lineData[602] = 0;
  _$jscoverage['/attribute.js'].lineData[606] = 0;
  _$jscoverage['/attribute.js'].lineData[611] = 0;
  _$jscoverage['/attribute.js'].lineData[612] = 0;
  _$jscoverage['/attribute.js'].lineData[615] = 0;
  _$jscoverage['/attribute.js'].lineData[616] = 0;
  _$jscoverage['/attribute.js'].lineData[619] = 0;
  _$jscoverage['/attribute.js'].lineData[620] = 0;
  _$jscoverage['/attribute.js'].lineData[623] = 0;
  _$jscoverage['/attribute.js'].lineData[635] = 0;
  _$jscoverage['/attribute.js'].lineData[637] = 0;
  _$jscoverage['/attribute.js'].lineData[638] = 0;
  _$jscoverage['/attribute.js'].lineData[640] = 0;
  _$jscoverage['/attribute.js'].lineData[643] = 0;
  _$jscoverage['/attribute.js'].lineData[647] = 0;
  _$jscoverage['/attribute.js'].lineData[650] = 0;
  _$jscoverage['/attribute.js'].lineData[654] = 0;
  _$jscoverage['/attribute.js'].lineData[655] = 0;
  _$jscoverage['/attribute.js'].lineData[658] = 0;
  _$jscoverage['/attribute.js'].lineData[659] = 0;
  _$jscoverage['/attribute.js'].lineData[664] = 0;
  _$jscoverage['/attribute.js'].lineData[665] = 0;
  _$jscoverage['/attribute.js'].lineData[670] = 0;
  _$jscoverage['/attribute.js'].lineData[671] = 0;
  _$jscoverage['/attribute.js'].lineData[672] = 0;
  _$jscoverage['/attribute.js'].lineData[676] = 0;
  _$jscoverage['/attribute.js'].lineData[678] = 0;
  _$jscoverage['/attribute.js'].lineData[679] = 0;
  _$jscoverage['/attribute.js'].lineData[682] = 0;
  _$jscoverage['/attribute.js'].lineData[685] = 0;
  _$jscoverage['/attribute.js'].lineData[686] = 0;
  _$jscoverage['/attribute.js'].lineData[688] = 0;
  _$jscoverage['/attribute.js'].lineData[690] = 0;
  _$jscoverage['/attribute.js'].lineData[691] = 0;
  _$jscoverage['/attribute.js'].lineData[693] = 0;
  _$jscoverage['/attribute.js'].lineData[694] = 0;
  _$jscoverage['/attribute.js'].lineData[695] = 0;
  _$jscoverage['/attribute.js'].lineData[697] = 0;
  _$jscoverage['/attribute.js'].lineData[700] = 0;
  _$jscoverage['/attribute.js'].lineData[701] = 0;
  _$jscoverage['/attribute.js'].lineData[703] = 0;
  _$jscoverage['/attribute.js'].lineData[704] = 0;
  _$jscoverage['/attribute.js'].lineData[707] = 0;
  _$jscoverage['/attribute.js'].lineData[710] = 0;
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
}
if (! _$jscoverage['/attribute.js'].branchData) {
  _$jscoverage['/attribute.js'].branchData = {};
  _$jscoverage['/attribute.js'].branchData['10'] = [];
  _$jscoverage['/attribute.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['24'] = [];
  _$jscoverage['/attribute.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['31'] = [];
  _$jscoverage['/attribute.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['40'] = [];
  _$jscoverage['/attribute.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['51'] = [];
  _$jscoverage['/attribute.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['54'] = [];
  _$jscoverage['/attribute.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['62'] = [];
  _$jscoverage['/attribute.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['62'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['75'] = [];
  _$jscoverage['/attribute.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['76'] = [];
  _$jscoverage['/attribute.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['79'] = [];
  _$jscoverage['/attribute.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['91'] = [];
  _$jscoverage['/attribute.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['104'] = [];
  _$jscoverage['/attribute.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['105'] = [];
  _$jscoverage['/attribute.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['117'] = [];
  _$jscoverage['/attribute.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['142'] = [];
  _$jscoverage['/attribute.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['148'] = [];
  _$jscoverage['/attribute.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['149'] = [];
  _$jscoverage['/attribute.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'] = [];
  _$jscoverage['/attribute.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['169'] = [];
  _$jscoverage['/attribute.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['170'] = [];
  _$jscoverage['/attribute.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['174'] = [];
  _$jscoverage['/attribute.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['194'] = [];
  _$jscoverage['/attribute.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['199'] = [];
  _$jscoverage['/attribute.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['202'] = [];
  _$jscoverage['/attribute.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['242'] = [];
  _$jscoverage['/attribute.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['244'] = [];
  _$jscoverage['/attribute.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['250'] = [];
  _$jscoverage['/attribute.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['252'] = [];
  _$jscoverage['/attribute.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['261'] = [];
  _$jscoverage['/attribute.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['264'] = [];
  _$jscoverage['/attribute.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['288'] = [];
  _$jscoverage['/attribute.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['291'] = [];
  _$jscoverage['/attribute.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['292'] = [];
  _$jscoverage['/attribute.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['296'] = [];
  _$jscoverage['/attribute.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['313'] = [];
  _$jscoverage['/attribute.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['317'] = [];
  _$jscoverage['/attribute.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['320'] = [];
  _$jscoverage['/attribute.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['326'] = [];
  _$jscoverage['/attribute.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['341'] = [];
  _$jscoverage['/attribute.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['357'] = [];
  _$jscoverage['/attribute.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['364'] = [];
  _$jscoverage['/attribute.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['371'] = [];
  _$jscoverage['/attribute.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['376'] = [];
  _$jscoverage['/attribute.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['381'] = [];
  _$jscoverage['/attribute.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['390'] = [];
  _$jscoverage['/attribute.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['449'] = [];
  _$jscoverage['/attribute.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['473'] = [];
  _$jscoverage['/attribute.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['493'] = [];
  _$jscoverage['/attribute.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['495'] = [];
  _$jscoverage['/attribute.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['502'] = [];
  _$jscoverage['/attribute.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['506'] = [];
  _$jscoverage['/attribute.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['507'] = [];
  _$jscoverage['/attribute.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['525'] = [];
  _$jscoverage['/attribute.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['537'] = [];
  _$jscoverage['/attribute.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['541'] = [];
  _$jscoverage['/attribute.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['542'] = [];
  _$jscoverage['/attribute.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['565'] = [];
  _$jscoverage['/attribute.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['569'] = [];
  _$jscoverage['/attribute.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['573'] = [];
  _$jscoverage['/attribute.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['596'] = [];
  _$jscoverage['/attribute.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['611'] = [];
  _$jscoverage['/attribute.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['615'] = [];
  _$jscoverage['/attribute.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['615'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['619'] = [];
  _$jscoverage['/attribute.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['637'] = [];
  _$jscoverage['/attribute.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['638'] = [];
  _$jscoverage['/attribute.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['670'] = [];
  _$jscoverage['/attribute.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['672'] = [];
  _$jscoverage['/attribute.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['693'] = [];
  _$jscoverage['/attribute.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['700'] = [];
  _$jscoverage['/attribute.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['703'] = [];
  _$jscoverage['/attribute.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['703'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['703'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['703'][3].init(151, 10, 'e !== true');
function visit78_703_3(result) {
  _$jscoverage['/attribute.js'].branchData['703'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['703'][2].init(132, 15, 'e !== undefined');
function visit77_703_2(result) {
  _$jscoverage['/attribute.js'].branchData['703'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['703'][1].init(132, 29, 'e !== undefined && e !== true');
function visit76_703_1(result) {
  _$jscoverage['/attribute.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['700'][1].init(441, 52, 'validator && (validator = normalFn(self, validator))');
function visit75_700_1(result) {
  _$jscoverage['/attribute.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['693'][1].init(179, 4, 'path');
function visit74_693_1(result) {
  _$jscoverage['/attribute.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['672'][1].init(55, 88, 'val !== undefined');
function visit73_672_1(result) {
  _$jscoverage['/attribute.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['670'][1].init(171, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit72_670_1(result) {
  _$jscoverage['/attribute.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['638'][1].init(22, 18, 'self.hasAttr(name)');
function visit71_638_1(result) {
  _$jscoverage['/attribute.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['637'][1].init(50, 24, 'typeof name === \'string\'');
function visit70_637_1(result) {
  _$jscoverage['/attribute.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['619'][1].init(975, 4, 'path');
function visit69_619_1(result) {
  _$jscoverage['/attribute.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['615'][2].init(881, 17, 'ret !== undefined');
function visit68_615_2(result) {
  _$jscoverage['/attribute.js'].branchData['615'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['615'][1].init(858, 40, '!(name in attrVals) && ret !== undefined');
function visit67_615_1(result) {
  _$jscoverage['/attribute.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['611'][1].init(724, 43, 'getter && (getter = normalFn(self, getter))');
function visit66_611_1(result) {
  _$jscoverage['/attribute.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['596'][1].init(207, 24, 'name.indexOf(dot) !== -1');
function visit65_596_1(result) {
  _$jscoverage['/attribute.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['573'][1].init(687, 22, 'setValue !== undefined');
function visit64_573_1(result) {
  _$jscoverage['/attribute.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['569'][1].init(598, 20, 'setValue === INVALID');
function visit63_569_1(result) {
  _$jscoverage['/attribute.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['565'][1].init(457, 43, 'setter && (setter = normalFn(self, setter))');
function visit62_565_1(result) {
  _$jscoverage['/attribute.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['542'][1].init(22, 10, 'opts.error');
function visit61_542_1(result) {
  _$jscoverage['/attribute.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['541'][1].init(1830, 15, 'e !== undefined');
function visit60_541_1(result) {
  _$jscoverage['/attribute.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['537'][1].init(1721, 10, 'opts || {}');
function visit59_537_1(result) {
  _$jscoverage['/attribute.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['525'][1].init(1258, 16, 'attrNames.length');
function visit58_525_1(result) {
  _$jscoverage['/attribute.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['507'][1].init(26, 10, 'opts.error');
function visit57_507_1(result) {
  _$jscoverage['/attribute.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['506'][1].init(507, 13, 'errors.length');
function visit56_506_1(result) {
  _$jscoverage['/attribute.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['502'][1].init(132, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit55_502_1(result) {
  _$jscoverage['/attribute.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['495'][1].init(56, 10, 'opts || {}');
function visit54_495_1(result) {
  _$jscoverage['/attribute.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['493'][1].init(51, 21, 'S.isPlainObject(name)');
function visit53_493_1(result) {
  _$jscoverage['/attribute.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['473'][1].init(143, 18, 'self.hasAttr(name)');
function visit52_473_1(result) {
  _$jscoverage['/attribute.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['449'][1].init(177, 13, 'initialValues');
function visit51_449_1(result) {
  _$jscoverage['/attribute.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['390'][1].init(21, 35, 'this.__attrs || (this.__attrs = {})');
function visit50_390_1(result) {
  _$jscoverage['/attribute.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['381'][1].init(1076, 10, 'args || []');
function visit49_381_1(result) {
  _$jscoverage['/attribute.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['376'][1].init(871, 7, '!member');
function visit48_376_1(result) {
  _$jscoverage['/attribute.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['371'][1].init(612, 5, '!name');
function visit47_371_1(result) {
  _$jscoverage['/attribute.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['364'][1].init(114, 18, 'method.__wrapped__');
function visit46_364_1(result) {
  _$jscoverage['/attribute.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['357'][2].init(115, 26, 'typeof self === \'function\'');
function visit45_357_2(result) {
  _$jscoverage['/attribute.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['357'][1].init(115, 43, 'typeof self === \'function\' && self.__name__');
function visit44_357_1(result) {
  _$jscoverage['/attribute.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['341'][1].init(14, 6, 'config');
function visit43_341_1(result) {
  _$jscoverage['/attribute.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['326'][1].init(14, 5, 'attrs');
function visit42_326_1(result) {
  _$jscoverage['/attribute.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['320'][1].init(1610, 19, 'sx.extend || extend');
function visit41_320_1(result) {
  _$jscoverage['/attribute.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['317'][1].init(1500, 18, 'sxInheritedStatics');
function visit40_317_1(result) {
  _$jscoverage['/attribute.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['313'][1].init(57, 25, 'sx.inheritedStatics || {}');
function visit39_313_1(result) {
  _$jscoverage['/attribute.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['296'][1].init(82, 9, '\'@DEBUG@\'');
function visit38_296_1(result) {
  _$jscoverage['/attribute.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['292'][1].init(430, 32, 'px.hasOwnProperty(\'constructor\')');
function visit37_292_1(result) {
  _$jscoverage['/attribute.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['291'][1].init(386, 29, 'sx.name || \'AttributeDerived\'');
function visit36_291_1(result) {
  _$jscoverage['/attribute.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['288'][1].init(39, 18, 'sx.__hooks__ || {}');
function visit35_288_1(result) {
  _$jscoverage['/attribute.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['264'][1].init(565, 7, 'wrapped');
function visit34_264_1(result) {
  _$jscoverage['/attribute.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['261'][1].init(475, 13, 'v.__wrapped__');
function visit33_261_1(result) {
  _$jscoverage['/attribute.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['252'][1].init(56, 11, 'v.__owner__');
function visit32_252_1(result) {
  _$jscoverage['/attribute.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['250'][1].init(18, 23, 'typeof v === \'function\'');
function visit31_250_1(result) {
  _$jscoverage['/attribute.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['244'][1].init(22, 7, 'p in px');
function visit30_244_1(result) {
  _$jscoverage['/attribute.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['242'][1].init(96, 5, 'hooks');
function visit29_242_1(result) {
  _$jscoverage['/attribute.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['202'][1].init(159, 5, 'attrs');
function visit28_202_1(result) {
  _$jscoverage['/attribute.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['199'][1].init(406, 12, '!opts.silent');
function visit27_199_1(result) {
  _$jscoverage['/attribute.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['194'][1].init(309, 13, 'ret === FALSE');
function visit26_194_1(result) {
  _$jscoverage['/attribute.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['174'][1].init(18, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit25_174_1(result) {
  _$jscoverage['/attribute.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['170'][1].init(18, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit24_170_1(result) {
  _$jscoverage['/attribute.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['169'][1].init(1073, 11, 'opts.silent');
function visit23_169_1(result) {
  _$jscoverage['/attribute.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][2].init(116, 16, 'subVal === value');
function visit22_151_2(result) {
  _$jscoverage['/attribute.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][1].init(108, 24, 'path && subVal === value');
function visit21_151_1(result) {
  _$jscoverage['/attribute.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['149'][2].init(27, 17, 'prevVal === value');
function visit20_149_2(result) {
  _$jscoverage['/attribute.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['149'][1].init(18, 26, '!path && prevVal === value');
function visit19_149_1(result) {
  _$jscoverage['/attribute.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['148'][1].init(485, 11, '!opts.force');
function visit18_148_1(result) {
  _$jscoverage['/attribute.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['142'][1].init(310, 4, 'path');
function visit17_142_1(result) {
  _$jscoverage['/attribute.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['117'][1].init(90, 22, 'defaultBeforeFns[name]');
function visit16_117_1(result) {
  _$jscoverage['/attribute.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['105'][1].init(18, 21, 'prevVal === undefined');
function visit15_105_1(result) {
  _$jscoverage['/attribute.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['104'][1].init(40, 4, 'path');
function visit14_104_1(result) {
  _$jscoverage['/attribute.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['91'][1].init(35, 24, 'name.indexOf(\'.\') !== -1');
function visit13_91_1(result) {
  _$jscoverage['/attribute.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['79'][1].init(111, 15, 'o !== undefined');
function visit12_79_1(result) {
  _$jscoverage['/attribute.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['76'][1].init(30, 7, 'i < len');
function visit11_76_1(result) {
  _$jscoverage['/attribute.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['75'][1].init(70, 8, 'len >= 0');
function visit10_75_1(result) {
  _$jscoverage['/attribute.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['62'][3].init(18, 7, 'i < len');
function visit9_62_3(result) {
  _$jscoverage['/attribute.js'].branchData['62'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['62'][2].init(60, 15, 'o !== undefined');
function visit8_62_2(result) {
  _$jscoverage['/attribute.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['62'][1].init(48, 26, 'o !== undefined && i < len');
function visit7_62_1(result) {
  _$jscoverage['/attribute.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['54'][1].init(130, 9, 'ret || {}');
function visit6_54_1(result) {
  _$jscoverage['/attribute.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['51'][1].init(44, 20, '!doNotCreate && !ret');
function visit5_51_1(result) {
  _$jscoverage['/attribute.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['40'][1].init(21, 16, 'attrName || name');
function visit4_40_1(result) {
  _$jscoverage['/attribute.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['31'][1].init(17, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit3_31_1(result) {
  _$jscoverage['/attribute.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['24'][1].init(14, 26, 'typeof method === \'string\'');
function visit2_24_1(result) {
  _$jscoverage['/attribute.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['10'][1].init(14, 12, 'v === S.noop');
function visit1_10_1(result) {
  _$jscoverage['/attribute.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[9]++;
  function bind(v) {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[10]++;
    if (visit1_10_1(v === S.noop)) {
      _$jscoverage['/attribute.js'].lineData[11]++;
      return function() {
  _$jscoverage['/attribute.js'].functionData[2]++;
};
    } else {
      _$jscoverage['/attribute.js'].lineData[14]++;
      return S.bind(v);
    }
  }
  _$jscoverage['/attribute.js'].lineData[19]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[21]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[23]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[24]++;
    if (visit2_24_1(typeof method === 'string')) {
      _$jscoverage['/attribute.js'].lineData[25]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[27]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[30]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[31]++;
    return visit3_31_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[34]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[35]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[39]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[40]++;
    attrName = visit4_40_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[41]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[49]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[50]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[51]++;
    if (visit5_51_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[52]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[54]++;
    return visit6_54_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[60]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[61]++;
    for (var i = 0, len = path.length; visit7_62_1(visit8_62_2(o !== undefined) && visit9_62_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[64]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[66]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[72]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[73]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[75]++;
    if (visit10_75_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[76]++;
      for (var i = 0; visit11_76_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[77]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[79]++;
      if (visit12_79_1(o !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[80]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[82]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[85]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[88]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[89]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[91]++;
    if (visit13_91_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[92]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[93]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[96]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[102]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[103]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[104]++;
    if (visit14_104_1(path)) {
      _$jscoverage['/attribute.js'].lineData[105]++;
      if (visit15_105_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[106]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[108]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[110]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[112]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[115]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[116]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[117]++;
    if (visit16_117_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[118]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[120]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[121]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[122]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn, 
  defaultTargetOnly: true});
  }
  _$jscoverage['/attribute.js'].lineData[129]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[130]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[136]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[137]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[138]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[140]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[142]++;
    if (visit17_142_1(path)) {
      _$jscoverage['/attribute.js'].lineData[143]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[148]++;
    if (visit18_148_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[149]++;
      if (visit19_149_1(!path && visit20_149_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[150]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[151]++;
        if (visit21_151_1(path && visit22_151_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[152]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[156]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[158]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[169]++;
    if (visit23_169_1(opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[170]++;
      if (visit24_170_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[171]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[174]++;
      if (visit25_174_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[175]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[179]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[182]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[183]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[192]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[194]++;
    if (visit26_194_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[195]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[199]++;
    if (visit27_199_1(!opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[200]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[201]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[202]++;
      if (visit28_202_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[203]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[210]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[218]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[225]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[226]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[229]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[231]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[232]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[233]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[236]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[239]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[240]++;
    var hooks = SubClass.__hooks__;
    _$jscoverage['/attribute.js'].lineData[242]++;
    if (visit29_242_1(hooks)) {
      _$jscoverage['/attribute.js'].lineData[243]++;
      for (var p in hooks) {
        _$jscoverage['/attribute.js'].lineData[244]++;
        if (visit30_244_1(p in px)) {
          _$jscoverage['/attribute.js'].lineData[245]++;
          px[p] = hooks[p](px[p]);
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[249]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[250]++;
  if (visit31_250_1(typeof v === 'function')) {
    _$jscoverage['/attribute.js'].lineData[251]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[252]++;
    if (visit32_252_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[253]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[254]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[255]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[256]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[257]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[258]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[259]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[260]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[261]++;
      if (visit33_261_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[262]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[264]++;
    if (visit34_264_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[265]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[267]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[268]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[273]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[274]++;
    var SubClass = this;
    _$jscoverage['/attribute.js'].lineData[275]++;
    wrapProtoForSuper(px, SubClass);
    _$jscoverage['/attribute.js'].lineData[276]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[279]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[280]++;
  var SubClass, SuperClass = this;
  _$jscoverage['/attribute.js'].lineData[282]++;
  sx = S.merge(sx);
  _$jscoverage['/attribute.js'].lineData[284]++;
  px = S.merge(px);
  _$jscoverage['/attribute.js'].lineData[285]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[287]++;
  if ((hooks = SuperClass.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[288]++;
    sxHooks = sx.__hooks__ = visit35_288_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[289]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[291]++;
  var name = visit36_291_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[292]++;
  if (visit37_292_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[293]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[296]++;
    if (visit38_296_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[298]++;
      SubClass = new Function('return function ' + S.camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
    } else {
      _$jscoverage['/attribute.js'].lineData[302]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[303]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[307]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[308]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[309]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[310]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[312]++;
  if ((inheritedStatics = SuperClass.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[313]++;
    sxInheritedStatics = sx.inheritedStatics = visit39_313_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[314]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[316]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/attribute.js'].lineData[317]++;
  if (visit40_317_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[318]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[320]++;
  SubClass.extend = visit41_320_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[321]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[322]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[325]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[21]++;
    _$jscoverage['/attribute.js'].lineData[326]++;
    if (visit42_326_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[327]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[335]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[340]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[22]++;
    _$jscoverage['/attribute.js'].lineData[341]++;
    if (visit43_341_1(config)) {
      _$jscoverage['/attribute.js'].lineData[342]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[344]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[349]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  'callSuper': function() {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[353]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[357]++;
  if (visit44_357_1(visit45_357_2(typeof self === 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[358]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[359]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[360]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[363]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[364]++;
    if (visit46_364_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[365]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[367]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[370]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[371]++;
  if (visit47_371_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[373]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[375]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[376]++;
  if (visit48_376_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[378]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[381]++;
  return member.apply(obj, visit49_381_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[390]++;
  return visit50_390_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[398]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[402]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[403]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[405]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[426]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[430]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[431]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[433]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[435]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[445]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[446]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[447]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[449]++;
  if (visit51_449_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[450]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[452]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[461]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[469]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[470]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[471]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[473]++;
  if (visit52_473_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[474]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[475]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[478]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[492]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[493]++;
  if (visit53_493_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[494]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[495]++;
    opts = visit54_495_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[496]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[499]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[502]++;
      if (visit55_502_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[503]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[506]++;
    if (visit56_506_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[507]++;
      if (visit57_507_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[508]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[510]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[512]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[513]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[515]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[519]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[520]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[521]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[522]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[523]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[525]++;
    if (visit58_525_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[526]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[535]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[537]++;
  opts = visit59_537_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[539]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[541]++;
  if (visit60_541_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[542]++;
    if (visit61_542_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[543]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[545]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[547]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[556]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[565]++;
  if (visit62_565_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[566]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[569]++;
  if (visit63_569_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[570]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[573]++;
  if (visit64_573_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[574]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[578]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[580]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[589]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[596]++;
  if (visit65_596_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[597]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[598]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[601]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[602]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[606]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[611]++;
  if (visit66_611_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[612]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[615]++;
  if (visit67_615_1(!(name in attrVals) && visit68_615_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[616]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[619]++;
  if (visit69_619_1(path)) {
    _$jscoverage['/attribute.js'].lineData[620]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[623]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[635]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[637]++;
  if (visit70_637_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[638]++;
    if (visit71_638_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[640]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[643]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[647]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[650]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[654]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[655]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[658]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[659]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[664]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[36]++;
    _$jscoverage['/attribute.js'].lineData[665]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[670]++;
    if (visit72_670_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[671]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[672]++;
      if (visit73_672_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[676]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[678]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[679]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[682]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[685]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[37]++;
    _$jscoverage['/attribute.js'].lineData[686]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[688]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[690]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[691]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[693]++;
    if (visit74_693_1(path)) {
      _$jscoverage['/attribute.js'].lineData[694]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[695]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[697]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    _$jscoverage['/attribute.js'].lineData[700]++;
    if (visit75_700_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[701]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[703]++;
      if (visit76_703_1(visit77_703_2(e !== undefined) && visit78_703_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[704]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[707]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[710]++;
  return Attribute;
});
