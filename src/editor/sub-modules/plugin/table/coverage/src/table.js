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
  _$jscoverage['/table.js'].lineData[8] = 0;
  _$jscoverage['/table.js'].lineData[9] = 0;
  _$jscoverage['/table.js'].lineData[10] = 0;
  _$jscoverage['/table.js'].lineData[11] = 0;
  _$jscoverage['/table.js'].lineData[12] = 0;
  _$jscoverage['/table.js'].lineData[13] = 0;
  _$jscoverage['/table.js'].lineData[19] = 0;
  _$jscoverage['/table.js'].lineData[22] = 0;
  _$jscoverage['/table.js'].lineData[27] = 0;
  _$jscoverage['/table.js'].lineData[29] = 0;
  _$jscoverage['/table.js'].lineData[30] = 0;
  _$jscoverage['/table.js'].lineData[34] = 0;
  _$jscoverage['/table.js'].lineData[36] = 0;
  _$jscoverage['/table.js'].lineData[37] = 0;
  _$jscoverage['/table.js'].lineData[41] = 0;
  _$jscoverage['/table.js'].lineData[42] = 0;
  _$jscoverage['/table.js'].lineData[44] = 0;
  _$jscoverage['/table.js'].lineData[46] = 0;
  _$jscoverage['/table.js'].lineData[49] = 0;
  _$jscoverage['/table.js'].lineData[50] = 0;
  _$jscoverage['/table.js'].lineData[53] = 0;
  _$jscoverage['/table.js'].lineData[55] = 0;
  _$jscoverage['/table.js'].lineData[57] = 0;
  _$jscoverage['/table.js'].lineData[65] = 0;
  _$jscoverage['/table.js'].lineData[66] = 0;
  _$jscoverage['/table.js'].lineData[67] = 0;
  _$jscoverage['/table.js'].lineData[68] = 0;
  _$jscoverage['/table.js'].lineData[74] = 0;
  _$jscoverage['/table.js'].lineData[76] = 0;
  _$jscoverage['/table.js'].lineData[78] = 0;
  _$jscoverage['/table.js'].lineData[81] = 0;
  _$jscoverage['/table.js'].lineData[83] = 0;
  _$jscoverage['/table.js'].lineData[85] = 0;
  _$jscoverage['/table.js'].lineData[86] = 0;
  _$jscoverage['/table.js'].lineData[87] = 0;
  _$jscoverage['/table.js'].lineData[88] = 0;
  _$jscoverage['/table.js'].lineData[93] = 0;
  _$jscoverage['/table.js'].lineData[95] = 0;
  _$jscoverage['/table.js'].lineData[96] = 0;
  _$jscoverage['/table.js'].lineData[97] = 0;
  _$jscoverage['/table.js'].lineData[101] = 0;
  _$jscoverage['/table.js'].lineData[103] = 0;
  _$jscoverage['/table.js'].lineData[107] = 0;
  _$jscoverage['/table.js'].lineData[110] = 0;
  _$jscoverage['/table.js'].lineData[111] = 0;
  _$jscoverage['/table.js'].lineData[112] = 0;
  _$jscoverage['/table.js'].lineData[113] = 0;
  _$jscoverage['/table.js'].lineData[123] = 0;
  _$jscoverage['/table.js'].lineData[124] = 0;
  _$jscoverage['/table.js'].lineData[125] = 0;
  _$jscoverage['/table.js'].lineData[127] = 0;
  _$jscoverage['/table.js'].lineData[128] = 0;
  _$jscoverage['/table.js'].lineData[130] = 0;
  _$jscoverage['/table.js'].lineData[131] = 0;
  _$jscoverage['/table.js'].lineData[132] = 0;
  _$jscoverage['/table.js'].lineData[135] = 0;
  _$jscoverage['/table.js'].lineData[136] = 0;
  _$jscoverage['/table.js'].lineData[143] = 0;
  _$jscoverage['/table.js'].lineData[148] = 0;
  _$jscoverage['/table.js'].lineData[149] = 0;
  _$jscoverage['/table.js'].lineData[150] = 0;
  _$jscoverage['/table.js'].lineData[154] = 0;
  _$jscoverage['/table.js'].lineData[156] = 0;
  _$jscoverage['/table.js'].lineData[157] = 0;
  _$jscoverage['/table.js'].lineData[159] = 0;
  _$jscoverage['/table.js'].lineData[160] = 0;
  _$jscoverage['/table.js'].lineData[163] = 0;
  _$jscoverage['/table.js'].lineData[167] = 0;
  _$jscoverage['/table.js'].lineData[170] = 0;
  _$jscoverage['/table.js'].lineData[172] = 0;
  _$jscoverage['/table.js'].lineData[176] = 0;
  _$jscoverage['/table.js'].lineData[177] = 0;
  _$jscoverage['/table.js'].lineData[181] = 0;
  _$jscoverage['/table.js'].lineData[184] = 0;
  _$jscoverage['/table.js'].lineData[185] = 0;
  _$jscoverage['/table.js'].lineData[187] = 0;
  _$jscoverage['/table.js'].lineData[188] = 0;
  _$jscoverage['/table.js'].lineData[190] = 0;
  _$jscoverage['/table.js'].lineData[192] = 0;
  _$jscoverage['/table.js'].lineData[193] = 0;
  _$jscoverage['/table.js'].lineData[196] = 0;
  _$jscoverage['/table.js'].lineData[197] = 0;
  _$jscoverage['/table.js'].lineData[198] = 0;
  _$jscoverage['/table.js'].lineData[200] = 0;
  _$jscoverage['/table.js'].lineData[205] = 0;
  _$jscoverage['/table.js'].lineData[206] = 0;
  _$jscoverage['/table.js'].lineData[212] = 0;
  _$jscoverage['/table.js'].lineData[213] = 0;
  _$jscoverage['/table.js'].lineData[217] = 0;
  _$jscoverage['/table.js'].lineData[218] = 0;
  _$jscoverage['/table.js'].lineData[220] = 0;
  _$jscoverage['/table.js'].lineData[221] = 0;
  _$jscoverage['/table.js'].lineData[222] = 0;
  _$jscoverage['/table.js'].lineData[226] = 0;
  _$jscoverage['/table.js'].lineData[227] = 0;
  _$jscoverage['/table.js'].lineData[232] = 0;
  _$jscoverage['/table.js'].lineData[233] = 0;
  _$jscoverage['/table.js'].lineData[235] = 0;
  _$jscoverage['/table.js'].lineData[236] = 0;
  _$jscoverage['/table.js'].lineData[237] = 0;
  _$jscoverage['/table.js'].lineData[241] = 0;
  _$jscoverage['/table.js'].lineData[244] = 0;
  _$jscoverage['/table.js'].lineData[245] = 0;
  _$jscoverage['/table.js'].lineData[246] = 0;
  _$jscoverage['/table.js'].lineData[247] = 0;
  _$jscoverage['/table.js'].lineData[250] = 0;
  _$jscoverage['/table.js'].lineData[252] = 0;
  _$jscoverage['/table.js'].lineData[253] = 0;
  _$jscoverage['/table.js'].lineData[257] = 0;
  _$jscoverage['/table.js'].lineData[258] = 0;
  _$jscoverage['/table.js'].lineData[260] = 0;
  _$jscoverage['/table.js'].lineData[263] = 0;
  _$jscoverage['/table.js'].lineData[264] = 0;
  _$jscoverage['/table.js'].lineData[268] = 0;
  _$jscoverage['/table.js'].lineData[275] = 0;
  _$jscoverage['/table.js'].lineData[277] = 0;
  _$jscoverage['/table.js'].lineData[281] = 0;
  _$jscoverage['/table.js'].lineData[282] = 0;
  _$jscoverage['/table.js'].lineData[283] = 0;
  _$jscoverage['/table.js'].lineData[287] = 0;
  _$jscoverage['/table.js'].lineData[288] = 0;
  _$jscoverage['/table.js'].lineData[293] = 0;
  _$jscoverage['/table.js'].lineData[296] = 0;
  _$jscoverage['/table.js'].lineData[297] = 0;
  _$jscoverage['/table.js'].lineData[298] = 0;
  _$jscoverage['/table.js'].lineData[300] = 0;
  _$jscoverage['/table.js'].lineData[301] = 0;
  _$jscoverage['/table.js'].lineData[303] = 0;
  _$jscoverage['/table.js'].lineData[306] = 0;
  _$jscoverage['/table.js'].lineData[307] = 0;
  _$jscoverage['/table.js'].lineData[310] = 0;
  _$jscoverage['/table.js'].lineData[311] = 0;
  _$jscoverage['/table.js'].lineData[313] = 0;
  _$jscoverage['/table.js'].lineData[314] = 0;
  _$jscoverage['/table.js'].lineData[315] = 0;
  _$jscoverage['/table.js'].lineData[317] = 0;
  _$jscoverage['/table.js'].lineData[318] = 0;
  _$jscoverage['/table.js'].lineData[319] = 0;
  _$jscoverage['/table.js'].lineData[321] = 0;
  _$jscoverage['/table.js'].lineData[328] = 0;
  _$jscoverage['/table.js'].lineData[329] = 0;
  _$jscoverage['/table.js'].lineData[330] = 0;
  _$jscoverage['/table.js'].lineData[334] = 0;
  _$jscoverage['/table.js'].lineData[335] = 0;
  _$jscoverage['/table.js'].lineData[336] = 0;
  _$jscoverage['/table.js'].lineData[339] = 0;
  _$jscoverage['/table.js'].lineData[351] = 0;
  _$jscoverage['/table.js'].lineData[373] = 0;
  _$jscoverage['/table.js'].lineData[376] = 0;
  _$jscoverage['/table.js'].lineData[377] = 0;
  _$jscoverage['/table.js'].lineData[387] = 0;
  _$jscoverage['/table.js'].lineData[389] = 0;
  _$jscoverage['/table.js'].lineData[390] = 0;
  _$jscoverage['/table.js'].lineData[391] = 0;
  _$jscoverage['/table.js'].lineData[392] = 0;
  _$jscoverage['/table.js'].lineData[394] = 0;
  _$jscoverage['/table.js'].lineData[404] = 0;
  _$jscoverage['/table.js'].lineData[405] = 0;
  _$jscoverage['/table.js'].lineData[408] = 0;
  _$jscoverage['/table.js'].lineData[411] = 0;
  _$jscoverage['/table.js'].lineData[413] = 0;
  _$jscoverage['/table.js'].lineData[417] = 0;
  _$jscoverage['/table.js'].lineData[418] = 0;
  _$jscoverage['/table.js'].lineData[420] = 0;
  _$jscoverage['/table.js'].lineData[424] = 0;
  _$jscoverage['/table.js'].lineData[425] = 0;
  _$jscoverage['/table.js'].lineData[426] = 0;
  _$jscoverage['/table.js'].lineData[427] = 0;
  _$jscoverage['/table.js'].lineData[437] = 0;
  _$jscoverage['/table.js'].lineData[438] = 0;
  _$jscoverage['/table.js'].lineData[442] = 0;
  _$jscoverage['/table.js'].lineData[443] = 0;
  _$jscoverage['/table.js'].lineData[446] = 0;
  _$jscoverage['/table.js'].lineData[449] = 0;
  _$jscoverage['/table.js'].lineData[450] = 0;
  _$jscoverage['/table.js'].lineData[451] = 0;
  _$jscoverage['/table.js'].lineData[452] = 0;
  _$jscoverage['/table.js'].lineData[456] = 0;
  _$jscoverage['/table.js'].lineData[457] = 0;
  _$jscoverage['/table.js'].lineData[460] = 0;
  _$jscoverage['/table.js'].lineData[462] = 0;
  _$jscoverage['/table.js'].lineData[464] = 0;
  _$jscoverage['/table.js'].lineData[468] = 0;
  _$jscoverage['/table.js'].lineData[469] = 0;
  _$jscoverage['/table.js'].lineData[470] = 0;
  _$jscoverage['/table.js'].lineData[471] = 0;
  _$jscoverage['/table.js'].lineData[472] = 0;
  _$jscoverage['/table.js'].lineData[476] = 0;
  _$jscoverage['/table.js'].lineData[477] = 0;
  _$jscoverage['/table.js'].lineData[478] = 0;
  _$jscoverage['/table.js'].lineData[480] = 0;
  _$jscoverage['/table.js'].lineData[481] = 0;
  _$jscoverage['/table.js'].lineData[483] = 0;
  _$jscoverage['/table.js'].lineData[487] = 0;
  _$jscoverage['/table.js'].lineData[488] = 0;
  _$jscoverage['/table.js'].lineData[489] = 0;
  _$jscoverage['/table.js'].lineData[490] = 0;
  _$jscoverage['/table.js'].lineData[491] = 0;
  _$jscoverage['/table.js'].lineData[495] = 0;
  _$jscoverage['/table.js'].lineData[496] = 0;
  _$jscoverage['/table.js'].lineData[497] = 0;
  _$jscoverage['/table.js'].lineData[498] = 0;
  _$jscoverage['/table.js'].lineData[499] = 0;
  _$jscoverage['/table.js'].lineData[503] = 0;
  _$jscoverage['/table.js'].lineData[504] = 0;
  _$jscoverage['/table.js'].lineData[505] = 0;
  _$jscoverage['/table.js'].lineData[506] = 0;
  _$jscoverage['/table.js'].lineData[507] = 0;
  _$jscoverage['/table.js'].lineData[511] = 0;
  _$jscoverage['/table.js'].lineData[512] = 0;
  _$jscoverage['/table.js'].lineData[513] = 0;
  _$jscoverage['/table.js'].lineData[514] = 0;
  _$jscoverage['/table.js'].lineData[515] = 0;
  _$jscoverage['/table.js'].lineData[519] = 0;
  _$jscoverage['/table.js'].lineData[520] = 0;
  _$jscoverage['/table.js'].lineData[521] = 0;
  _$jscoverage['/table.js'].lineData[526] = 0;
  _$jscoverage['/table.js'].lineData[527] = 0;
  _$jscoverage['/table.js'].lineData[528] = 0;
  _$jscoverage['/table.js'].lineData[535] = 0;
  _$jscoverage['/table.js'].lineData[536] = 0;
  _$jscoverage['/table.js'].lineData[537] = 0;
  _$jscoverage['/table.js'].lineData[542] = 0;
  _$jscoverage['/table.js'].lineData[543] = 0;
  _$jscoverage['/table.js'].lineData[544] = 0;
  _$jscoverage['/table.js'].lineData[545] = 0;
  _$jscoverage['/table.js'].lineData[546] = 0;
  _$jscoverage['/table.js'].lineData[547] = 0;
  _$jscoverage['/table.js'].lineData[549] = 0;
  _$jscoverage['/table.js'].lineData[551] = 0;
  _$jscoverage['/table.js'].lineData[560] = 0;
  _$jscoverage['/table.js'].lineData[564] = 0;
  _$jscoverage['/table.js'].lineData[579] = 0;
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
  _$jscoverage['/table.js'].branchData['8'] = [];
  _$jscoverage['/table.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['29'] = [];
  _$jscoverage['/table.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['34'] = [];
  _$jscoverage['/table.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['35'] = [];
  _$jscoverage['/table.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['41'] = [];
  _$jscoverage['/table.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['44'] = [];
  _$jscoverage['/table.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['47'] = [];
  _$jscoverage['/table.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['49'] = [];
  _$jscoverage['/table.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['66'] = [];
  _$jscoverage['/table.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['85'] = [];
  _$jscoverage['/table.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['87'] = [];
  _$jscoverage['/table.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['96'] = [];
  _$jscoverage['/table.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['112'] = [];
  _$jscoverage['/table.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['123'] = [];
  _$jscoverage['/table.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['127'] = [];
  _$jscoverage['/table.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['131'] = [];
  _$jscoverage['/table.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['144'] = [];
  _$jscoverage['/table.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['144'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['145'] = [];
  _$jscoverage['/table.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['148'] = [];
  _$jscoverage['/table.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['149'] = [];
  _$jscoverage['/table.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['156'] = [];
  _$jscoverage['/table.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['159'] = [];
  _$jscoverage['/table.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['173'] = [];
  _$jscoverage['/table.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['176'] = [];
  _$jscoverage['/table.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['184'] = [];
  _$jscoverage['/table.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['187'] = [];
  _$jscoverage['/table.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['192'] = [];
  _$jscoverage['/table.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['197'] = [];
  _$jscoverage['/table.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['207'] = [];
  _$jscoverage['/table.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['212'] = [];
  _$jscoverage['/table.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['219'] = [];
  _$jscoverage['/table.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['220'] = [];
  _$jscoverage['/table.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['226'] = [];
  _$jscoverage['/table.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['227'] = [];
  _$jscoverage['/table.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['234'] = [];
  _$jscoverage['/table.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['236'] = [];
  _$jscoverage['/table.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['246'] = [];
  _$jscoverage['/table.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['250'] = [];
  _$jscoverage['/table.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['252'] = [];
  _$jscoverage['/table.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['258'] = [];
  _$jscoverage['/table.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['263'] = [];
  _$jscoverage['/table.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['275'] = [];
  _$jscoverage['/table.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['281'] = [];
  _$jscoverage['/table.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['281'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['287'] = [];
  _$jscoverage['/table.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['298'] = [];
  _$jscoverage['/table.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['308'] = [];
  _$jscoverage['/table.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['309'] = [];
  _$jscoverage['/table.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['310'] = [];
  _$jscoverage['/table.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['315'] = [];
  _$jscoverage['/table.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['315'][3] = new BranchData();
  _$jscoverage['/table.js'].branchData['315'][4] = new BranchData();
  _$jscoverage['/table.js'].branchData['319'] = [];
  _$jscoverage['/table.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['319'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['330'] = [];
  _$jscoverage['/table.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['336'] = [];
  _$jscoverage['/table.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['355'] = [];
  _$jscoverage['/table.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['376'] = [];
  _$jscoverage['/table.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['376'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['377'] = [];
  _$jscoverage['/table.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['389'] = [];
  _$jscoverage['/table.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['391'] = [];
  _$jscoverage['/table.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['405'] = [];
  _$jscoverage['/table.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['414'] = [];
  _$jscoverage['/table.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['415'] = [];
  _$jscoverage['/table.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['426'] = [];
  _$jscoverage['/table.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['439'] = [];
  _$jscoverage['/table.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['440'] = [];
  _$jscoverage['/table.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['442'] = [];
  _$jscoverage['/table.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['457'] = [];
  _$jscoverage['/table.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['458'] = [];
  _$jscoverage['/table.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['458'][2] = new BranchData();
  _$jscoverage['/table.js'].branchData['459'] = [];
  _$jscoverage['/table.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['480'] = [];
  _$jscoverage['/table.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['527'] = [];
  _$jscoverage['/table.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['536'] = [];
  _$jscoverage['/table.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['542'] = [];
  _$jscoverage['/table.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/table.js'].branchData['547'] = [];
  _$jscoverage['/table.js'].branchData['547'][1] = new BranchData();
}
_$jscoverage['/table.js'].branchData['547'][1].init(101, 104, '!statusChecker[content] || statusChecker[content].call(self, editor)');
function visit86_547_1(result) {
  _$jscoverage['/table.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['542'][1].init(29, 8, 'e.newVal');
function visit85_542_1(result) {
  _$jscoverage['/table.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['536'][1].init(92, 17, 'handlers[content]');
function visit84_536_1(result) {
  _$jscoverage['/table.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['527'][1].init(21, 41, 'S.inArray(Dom.nodeName(node), tableRules)');
function visit83_527_1(result) {
  _$jscoverage['/table.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['480'][1].init(245, 7, 'element');
function visit82_480_1(result) {
  _$jscoverage['/table.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['459'][1].init(59, 26, 'parent.nodeName() !== \'td\'');
function visit81_459_1(result) {
  _$jscoverage['/table.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['458'][2].init(1027, 28, 'parent.nodeName() !== \'body\'');
function visit80_458_2(result) {
  _$jscoverage['/table.js'].branchData['458'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['458'][1].init(64, 86, 'parent.nodeName() !== \'body\' && parent.nodeName() !== \'td\'');
function visit79_458_1(result) {
  _$jscoverage['/table.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['457'][2].init(960, 33, 'parent[0].childNodes.length === 1');
function visit78_457_2(result) {
  _$jscoverage['/table.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['457'][1].init(960, 151, 'parent[0].childNodes.length === 1 && parent.nodeName() !== \'body\' && parent.nodeName() !== \'td\'');
function visit77_457_1(result) {
  _$jscoverage['/table.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['442'][1].init(309, 6, '!table');
function visit76_442_1(result) {
  _$jscoverage['/table.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['440'][1].init(159, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit75_440_1(result) {
  _$jscoverage['/table.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['439'][1].init(81, 40, 'selection && selection.getStartElement()');
function visit74_439_1(result) {
  _$jscoverage['/table.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['426'][1].init(117, 4, 'info');
function visit73_426_1(result) {
  _$jscoverage['/table.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['415'][1].init(146, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit72_415_1(result) {
  _$jscoverage['/table.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['414'][1].init(74, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit71_414_1(result) {
  _$jscoverage['/table.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['405'][1].init(23, 12, 'config || {}');
function visit70_405_1(result) {
  _$jscoverage['/table.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['391'][1].init(108, 1, 'v');
function visit69_391_1(result) {
  _$jscoverage['/table.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['389'][1].init(93, 8, 'cssClass');
function visit68_389_1(result) {
  _$jscoverage['/table.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['377'][1].init(63, 14, 'cssClass || \'\'');
function visit67_377_1(result) {
  _$jscoverage['/table.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['376'][2].init(182, 11, 'border <= 0');
function visit66_376_2(result) {
  _$jscoverage['/table.js'].branchData['376'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['376'][1].init(171, 22, '!border || border <= 0');
function visit65_376_1(result) {
  _$jscoverage['/table.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['355'][1].init(-1, 11, 'UA.ie === 6');
function visit64_355_1(result) {
  _$jscoverage['/table.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['336'][1].init(51, 15, 'info && info.tr');
function visit63_336_1(result) {
  _$jscoverage['/table.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['330'][1].init(51, 15, 'info && info.td');
function visit62_330_1(result) {
  _$jscoverage['/table.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['319'][2].init(81, 13, 'name === \'tr\'');
function visit61_319_2(result) {
  _$jscoverage['/table.js'].branchData['319'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['319'][1].init(60, 34, 'table.contains(n) && name === \'tr\'');
function visit60_319_1(result) {
  _$jscoverage['/table.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['315'][4].init(99, 13, 'name === \'th\'');
function visit59_315_4(result) {
  _$jscoverage['/table.js'].branchData['315'][4].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['315'][3].init(82, 13, 'name === \'td\'');
function visit58_315_3(result) {
  _$jscoverage['/table.js'].branchData['315'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['315'][2].init(82, 30, 'name === \'td\' || name === \'th\'');
function visit57_315_2(result) {
  _$jscoverage['/table.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['315'][1].init(60, 53, 'table.contains(n) && (name === \'td\' || name === \'th\')');
function visit56_315_1(result) {
  _$jscoverage['/table.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['310'][1].init(207, 6, '!table');
function visit55_310_1(result) {
  _$jscoverage['/table.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['309'][1].init(127, 56, 'startElement && startElement.closest(\'table\', undefined)');
function visit54_309_1(result) {
  _$jscoverage['/table.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['308'][1].init(65, 40, 'selection && selection.getStartElement()');
function visit53_308_1(result) {
  _$jscoverage['/table.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['298'][1].init(74, 85, '!range.moveToElementEditablePosition(cell, placeAtEnd ? true : undefined)');
function visit52_298_1(result) {
  _$jscoverage['/table.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['287'][1].init(419, 25, 'row[0].cells[cellIndex]');
function visit51_287_1(result) {
  _$jscoverage['/table.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['281'][2].init(237, 25, 'row[0].cells.length === 1');
function visit50_281_2(result) {
  _$jscoverage['/table.js'].branchData['281'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['281'][1].init(223, 39, '!cellIndex && row[0].cells.length === 1');
function visit49_281_1(result) {
  _$jscoverage['/table.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['275'][1].init(502, 6, 'i >= 0');
function visit48_275_1(result) {
  _$jscoverage['/table.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['263'][1].init(141, 6, '!table');
function visit47_263_1(result) {
  _$jscoverage['/table.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['258'][1].init(510, 31, 'selectionOrCell instanceof Node');
function visit46_258_1(result) {
  _$jscoverage['/table.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['252'][1].init(71, 17, 'colsToDelete[i]');
function visit45_252_1(result) {
  _$jscoverage['/table.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['250'][1].init(190, 6, 'i >= 0');
function visit44_250_1(result) {
  _$jscoverage['/table.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['246'][1].init(28, 43, 'selectionOrCell instanceof Editor.Selection');
function visit43_246_1(result) {
  _$jscoverage['/table.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['236'][1].init(74, 10, 'targetCell');
function visit42_236_1(result) {
  _$jscoverage['/table.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['234'][1].init(46, 10, 'i < length');
function visit41_234_1(result) {
  _$jscoverage['/table.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['227'][1].init(27, 22, 'cellIndexList[0] > 0');
function visit40_227_1(result) {
  _$jscoverage['/table.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['226'][1].init(674, 12, '!targetIndex');
function visit39_226_1(result) {
  _$jscoverage['/table.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['220'][1].init(17, 47, 'cellIndexList[i] - cellIndexList[i - 1] > 1');
function visit38_220_1(result) {
  _$jscoverage['/table.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['219'][1].init(55, 10, 'i < length');
function visit37_219_1(result) {
  _$jscoverage['/table.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['212'][1].init(249, 10, 'i < length');
function visit36_212_1(result) {
  _$jscoverage['/table.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['207'][1].init(43, 40, 'cells[0] && cells[0].parent(\'table\')');
function visit35_207_1(result) {
  _$jscoverage['/table.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['197'][1].init(501, 12, 'insertBefore');
function visit34_197_1(result) {
  _$jscoverage['/table.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['192'][1].init(297, 7, '!OLD_IE');
function visit33_192_1(result) {
  _$jscoverage['/table.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['187'][1].init(124, 37, '$row.cells.length < (cellIndex + 1)');
function visit32_187_1(result) {
  _$jscoverage['/table.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['184'][1].init(482, 24, 'i < table[0].rows.length');
function visit31_184_1(result) {
  _$jscoverage['/table.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['176'][1].init(243, 5, '!cell');
function visit30_176_1(result) {
  _$jscoverage['/table.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['173'][1].init(66, 94, 'startElement.closest(\'td\', undefined) || startElement.closest(\'th\', undefined)');
function visit29_173_1(result) {
  _$jscoverage['/table.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['159'][1].init(70, 26, 'table[0].rows.length === 1');
function visit28_159_1(result) {
  _$jscoverage['/table.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['156'][1].init(1694, 30, 'selectionOrRow instanceof Node');
function visit27_156_1(result) {
  _$jscoverage['/table.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['149'][1].init(21, 17, 'rowsToDelete[i]');
function visit26_149_1(result) {
  _$jscoverage['/table.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['148'][1].init(1414, 6, 'i >= 0');
function visit25_148_1(result) {
  _$jscoverage['/table.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['145'][3].init(125, 20, 'previousRowIndex > 0');
function visit24_145_3(result) {
  _$jscoverage['/table.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['145'][2].init(124, 57, 'previousRowIndex > 0 && table[0].rows[previousRowIndex]');
function visit23_145_2(result) {
  _$jscoverage['/table.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['145'][1].init(79, 100, 'previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit22_145_1(result) {
  _$jscoverage['/table.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['144'][3].init(44, 23, 'nextRowIndex < rowCount');
function visit21_144_3(result) {
  _$jscoverage['/table.js'].branchData['144'][3].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['144'][2].init(43, 56, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex]');
function visit20_144_2(result) {
  _$jscoverage['/table.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['144'][1].init(25, 180, 'nextRowIndex < rowCount && table[0].rows[nextRowIndex] || previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode');
function visit19_144_1(result) {
  _$jscoverage['/table.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['131'][1].init(262, 20, 'i === cellsCount - 1');
function visit18_131_1(result) {
  _$jscoverage['/table.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['127'][1].init(113, 2, '!i');
function visit17_127_1(result) {
  _$jscoverage['/table.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['123'][1].init(383, 14, 'i < cellsCount');
function visit16_123_1(result) {
  _$jscoverage['/table.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['112'][1].init(32, 42, 'selectionOrRow instanceof Editor.Selection');
function visit15_112_1(result) {
  _$jscoverage['/table.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['96'][1].init(130, 4, '!row');
function visit14_96_1(result) {
  _$jscoverage['/table.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['87'][1].init(57, 7, '!OLD_IE');
function visit13_87_1(result) {
  _$jscoverage['/table.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['85'][1].init(126, 17, 'i < $cells.length');
function visit12_85_1(result) {
  _$jscoverage['/table.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['66'][2].init(428, 70, 'cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit11_66_2(result) {
  _$jscoverage['/table.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['66'][1].init(418, 80, 'parent && cellNodeRegex.test(parent.nodeName()) && !parent.data(\'selected_cell\')');
function visit10_66_1(result) {
  _$jscoverage['/table.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['49'][1].init(299, 11, 'nearestCell');
function visit9_49_1(result) {
  _$jscoverage['/table.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['47'][1].init(76, 96, 'startNode.closest(\'td\', undefined) || startNode.closest(\'th\', undefined)');
function visit8_47_1(result) {
  _$jscoverage['/table.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['44'][1].init(55, 15, 'range.collapsed');
function visit7_44_1(result) {
  _$jscoverage['/table.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['41'][1].init(890, 17, 'i < ranges.length');
function visit6_41_1(result) {
  _$jscoverage['/table.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['35'][1].init(65, 66, 'cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit5_35_1(result) {
  _$jscoverage['/table.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['34'][2].init(250, 46, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit4_34_2(result) {
  _$jscoverage['/table.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['34'][1].init(250, 132, 'node[0].nodeType === Dom.NodeType.ELEMENT_NODE && cellNodeRegex.test(node.nodeName()) && !node.data(\'selected_cell\')');
function visit3_34_1(result) {
  _$jscoverage['/table.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['29'][1].init(62, 17, 'retval.length > 0');
function visit2_29_1(result) {
  _$jscoverage['/table.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].branchData['8'][1].init(54, 16, 'S.UA.ieMode < 11');
function visit1_8_1(result) {
  _$jscoverage['/table.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/table.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/table.js'].functionData[0]++;
  _$jscoverage['/table.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/table.js'].lineData[8]++;
  var OLD_IE = visit1_8_1(S.UA.ieMode < 11);
  _$jscoverage['/table.js'].lineData[9]++;
  var Walker = Editor.Walker;
  _$jscoverage['/table.js'].lineData[10]++;
  var DialogLoader = require('./dialog-loader');
  _$jscoverage['/table.js'].lineData[11]++;
  require('./contextmenu');
  _$jscoverage['/table.js'].lineData[12]++;
  require('./button');
  _$jscoverage['/table.js'].lineData[13]++;
  var UA = S.UA, Dom = S.DOM, Node = S.Node, tableRules = ['tr', 'th', 'td', 'tbody', 'table'], cellNodeRegex = /^(?:td|th)$/;
  _$jscoverage['/table.js'].lineData[19]++;
  function getSelectedCells(selection) {
    _$jscoverage['/table.js'].functionData[1]++;
    _$jscoverage['/table.js'].lineData[22]++;
    var bookmarks = selection.createBookmarks(), ranges = selection.getRanges(), retval = [], database = {};
    _$jscoverage['/table.js'].lineData[27]++;
    function moveOutOfCellGuard(node) {
      _$jscoverage['/table.js'].functionData[2]++;
      _$jscoverage['/table.js'].lineData[29]++;
      if (visit2_29_1(retval.length > 0)) {
        _$jscoverage['/table.js'].lineData[30]++;
        return;
      }
      _$jscoverage['/table.js'].lineData[34]++;
      if (visit3_34_1(visit4_34_2(node[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit5_35_1(cellNodeRegex.test(node.nodeName()) && !node.data('selected_cell')))) {
        _$jscoverage['/table.js'].lineData[36]++;
        node._4eSetMarker(database, 'selected_cell', true, undefined);
        _$jscoverage['/table.js'].lineData[37]++;
        retval.push(node);
      }
    }
    _$jscoverage['/table.js'].lineData[41]++;
    for (var i = 0; visit6_41_1(i < ranges.length); i++) {
      _$jscoverage['/table.js'].lineData[42]++;
      var range = ranges[i];
      _$jscoverage['/table.js'].lineData[44]++;
      if (visit7_44_1(range.collapsed)) {
        _$jscoverage['/table.js'].lineData[46]++;
        var startNode = range.getCommonAncestor(), nearestCell = visit8_47_1(startNode.closest('td', undefined) || startNode.closest('th', undefined));
        _$jscoverage['/table.js'].lineData[49]++;
        if (visit9_49_1(nearestCell)) {
          _$jscoverage['/table.js'].lineData[50]++;
          retval.push(nearestCell);
        }
      } else {
        _$jscoverage['/table.js'].lineData[53]++;
        var walker = new Walker(range), node;
        _$jscoverage['/table.js'].lineData[55]++;
        walker.guard = moveOutOfCellGuard;
        _$jscoverage['/table.js'].lineData[57]++;
        while ((node = walker.next())) {
          _$jscoverage['/table.js'].lineData[65]++;
          var parent = node.parent();
          _$jscoverage['/table.js'].lineData[66]++;
          if (visit10_66_1(parent && visit11_66_2(cellNodeRegex.test(parent.nodeName()) && !parent.data('selected_cell')))) {
            _$jscoverage['/table.js'].lineData[67]++;
            parent._4eSetMarker(database, 'selected_cell', true, undefined);
            _$jscoverage['/table.js'].lineData[68]++;
            retval.push(parent);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[74]++;
    Editor.Utils.clearAllMarkers(database);
    _$jscoverage['/table.js'].lineData[76]++;
    selection.selectBookmarks(bookmarks);
    _$jscoverage['/table.js'].lineData[78]++;
    return retval;
  }
  _$jscoverage['/table.js'].lineData[81]++;
  function clearRow($tr) {
    _$jscoverage['/table.js'].functionData[3]++;
    _$jscoverage['/table.js'].lineData[83]++;
    var $cells = $tr.cells;
    _$jscoverage['/table.js'].lineData[85]++;
    for (var i = 0; visit12_85_1(i < $cells.length); i++) {
      _$jscoverage['/table.js'].lineData[86]++;
      $cells[i].innerHTML = '';
      _$jscoverage['/table.js'].lineData[87]++;
      if (visit13_87_1(!OLD_IE)) {
        _$jscoverage['/table.js'].lineData[88]++;
        (new Node($cells[i]))._4eAppendBogus(undefined);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[93]++;
  function insertRow(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[4]++;
    _$jscoverage['/table.js'].lineData[95]++;
    var row = selection.getStartElement().parent('tr');
    _$jscoverage['/table.js'].lineData[96]++;
    if (visit14_96_1(!row)) {
      _$jscoverage['/table.js'].lineData[97]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[101]++;
    var newRow = row.clone(true);
    _$jscoverage['/table.js'].lineData[103]++;
    newRow.insertBefore(row);
    _$jscoverage['/table.js'].lineData[107]++;
    clearRow(insertBefore ? newRow[0] : row[0]);
  }
  _$jscoverage['/table.js'].lineData[110]++;
  function deleteRows(selectionOrRow) {
    _$jscoverage['/table.js'].functionData[5]++;
    _$jscoverage['/table.js'].lineData[111]++;
    var table;
    _$jscoverage['/table.js'].lineData[112]++;
    if (visit15_112_1(selectionOrRow instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[113]++;
      var cells = getSelectedCells(selectionOrRow), cellsCount = cells.length, rowsToDelete = [], cursorPosition, previousRowIndex, row, nextRowIndex;
      _$jscoverage['/table.js'].lineData[123]++;
      for (var i = 0; visit16_123_1(i < cellsCount); i++) {
        _$jscoverage['/table.js'].lineData[124]++;
        row = cells[i].parent();
        _$jscoverage['/table.js'].lineData[125]++;
        var rowIndex = row[0].rowIndex;
        _$jscoverage['/table.js'].lineData[127]++;
        if (visit17_127_1(!i)) {
          _$jscoverage['/table.js'].lineData[128]++;
          (previousRowIndex = rowIndex - 1);
        }
        _$jscoverage['/table.js'].lineData[130]++;
        rowsToDelete[rowIndex] = row;
        _$jscoverage['/table.js'].lineData[131]++;
        if (visit18_131_1(i === cellsCount - 1)) {
          _$jscoverage['/table.js'].lineData[132]++;
          (nextRowIndex = rowIndex + 1);
        }
      }
      _$jscoverage['/table.js'].lineData[135]++;
      table = row.parent('table');
      _$jscoverage['/table.js'].lineData[136]++;
      var rows = table[0].rows, rowCount = rows.length;
      _$jscoverage['/table.js'].lineData[143]++;
      cursorPosition = new Node(visit19_144_1(visit20_144_2(visit21_144_3(nextRowIndex < rowCount) && table[0].rows[nextRowIndex]) || visit22_145_1(visit23_145_2(visit24_145_3(previousRowIndex > 0) && table[0].rows[previousRowIndex]) || table[0].parentNode)));
      _$jscoverage['/table.js'].lineData[148]++;
      for (i = rowsToDelete.length; visit25_148_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[149]++;
        if (visit26_149_1(rowsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[150]++;
          deleteRows(rowsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[154]++;
      return cursorPosition;
    } else {
      _$jscoverage['/table.js'].lineData[156]++;
      if (visit27_156_1(selectionOrRow instanceof Node)) {
        _$jscoverage['/table.js'].lineData[157]++;
        table = selectionOrRow.parent('table');
        _$jscoverage['/table.js'].lineData[159]++;
        if (visit28_159_1(table[0].rows.length === 1)) {
          _$jscoverage['/table.js'].lineData[160]++;
          table.remove();
        } else {
          _$jscoverage['/table.js'].lineData[163]++;
          selectionOrRow.remove();
        }
      }
    }
    _$jscoverage['/table.js'].lineData[167]++;
    return 0;
  }
  _$jscoverage['/table.js'].lineData[170]++;
  function insertColumn(selection, insertBefore) {
    _$jscoverage['/table.js'].functionData[6]++;
    _$jscoverage['/table.js'].lineData[172]++;
    var startElement = selection.getStartElement(), cell = visit29_173_1(startElement.closest('td', undefined) || startElement.closest('th', undefined));
    _$jscoverage['/table.js'].lineData[176]++;
    if (visit30_176_1(!cell)) {
      _$jscoverage['/table.js'].lineData[177]++;
      return;
    }
    _$jscoverage['/table.js'].lineData[181]++;
    var table = cell.parent('table'), cellIndex = cell[0].cellIndex;
    _$jscoverage['/table.js'].lineData[184]++;
    for (var i = 0; visit31_184_1(i < table[0].rows.length); i++) {
      _$jscoverage['/table.js'].lineData[185]++;
      var $row = table[0].rows[i];
      _$jscoverage['/table.js'].lineData[187]++;
      if (visit32_187_1($row.cells.length < (cellIndex + 1))) {
        _$jscoverage['/table.js'].lineData[188]++;
        continue;
      }
      _$jscoverage['/table.js'].lineData[190]++;
      cell = new Node($row.cells[cellIndex].cloneNode(undefined));
      _$jscoverage['/table.js'].lineData[192]++;
      if (visit33_192_1(!OLD_IE)) {
        _$jscoverage['/table.js'].lineData[193]++;
        cell._4eAppendBogus(undefined);
      }
      _$jscoverage['/table.js'].lineData[196]++;
      var baseCell = new Node($row.cells[cellIndex]);
      _$jscoverage['/table.js'].lineData[197]++;
      if (visit34_197_1(insertBefore)) {
        _$jscoverage['/table.js'].lineData[198]++;
        cell.insertBefore(baseCell);
      } else {
        _$jscoverage['/table.js'].lineData[200]++;
        cell.insertAfter(baseCell);
      }
    }
  }
  _$jscoverage['/table.js'].lineData[205]++;
  function getFocusElementAfterDelCols(cells) {
    _$jscoverage['/table.js'].functionData[7]++;
    _$jscoverage['/table.js'].lineData[206]++;
    var cellIndexList = [], table = visit35_207_1(cells[0] && cells[0].parent('table')), i, length, targetIndex, targetCell;
    _$jscoverage['/table.js'].lineData[212]++;
    for (i = 0 , length = cells.length; visit36_212_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[213]++;
      cellIndexList.push(cells[i][0].cellIndex);
    }
    _$jscoverage['/table.js'].lineData[217]++;
    cellIndexList.sort();
    _$jscoverage['/table.js'].lineData[218]++;
    for (i = 1 , length = cellIndexList.length; visit37_219_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[220]++;
      if (visit38_220_1(cellIndexList[i] - cellIndexList[i - 1] > 1)) {
        _$jscoverage['/table.js'].lineData[221]++;
        targetIndex = cellIndexList[i - 1] + 1;
        _$jscoverage['/table.js'].lineData[222]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[226]++;
    if (visit39_226_1(!targetIndex)) {
      _$jscoverage['/table.js'].lineData[227]++;
      targetIndex = visit40_227_1(cellIndexList[0] > 0) ? (cellIndexList[0] - 1) : (cellIndexList[cellIndexList.length - 1] + 1);
    }
    _$jscoverage['/table.js'].lineData[232]++;
    var rows = table[0].rows;
    _$jscoverage['/table.js'].lineData[233]++;
    for (i = 0 , length = rows.length; visit41_234_1(i < length); i++) {
      _$jscoverage['/table.js'].lineData[235]++;
      targetCell = rows[i].cells[targetIndex];
      _$jscoverage['/table.js'].lineData[236]++;
      if (visit42_236_1(targetCell)) {
        _$jscoverage['/table.js'].lineData[237]++;
        break;
      }
    }
    _$jscoverage['/table.js'].lineData[241]++;
    return targetCell ? new Node(targetCell) : table.prev();
  }
  _$jscoverage['/table.js'].lineData[244]++;
  function deleteColumns(selectionOrCell) {
    _$jscoverage['/table.js'].functionData[8]++;
    _$jscoverage['/table.js'].lineData[245]++;
    var i;
    _$jscoverage['/table.js'].lineData[246]++;
    if (visit43_246_1(selectionOrCell instanceof Editor.Selection)) {
      _$jscoverage['/table.js'].lineData[247]++;
      var colsToDelete = getSelectedCells(selectionOrCell), elementToFocus = getFocusElementAfterDelCols(colsToDelete);
      _$jscoverage['/table.js'].lineData[250]++;
      for (i = colsToDelete.length - 1; visit44_250_1(i >= 0); i--) {
        _$jscoverage['/table.js'].lineData[252]++;
        if (visit45_252_1(colsToDelete[i])) {
          _$jscoverage['/table.js'].lineData[253]++;
          deleteColumns(colsToDelete[i]);
        }
      }
      _$jscoverage['/table.js'].lineData[257]++;
      return elementToFocus;
    } else {
      _$jscoverage['/table.js'].lineData[258]++;
      if (visit46_258_1(selectionOrCell instanceof Node)) {
        _$jscoverage['/table.js'].lineData[260]++;
        var table = selectionOrCell.parent('table');
        _$jscoverage['/table.js'].lineData[263]++;
        if (visit47_263_1(!table)) {
          _$jscoverage['/table.js'].lineData[264]++;
          return null;
        }
        _$jscoverage['/table.js'].lineData[268]++;
        var cellIndex = selectionOrCell[0].cellIndex;
        _$jscoverage['/table.js'].lineData[275]++;
        for (i = table[0].rows.length - 1; visit48_275_1(i >= 0); i--) {
          _$jscoverage['/table.js'].lineData[277]++;
          var row = new Node(table[0].rows[i]);
          _$jscoverage['/table.js'].lineData[281]++;
          if (visit49_281_1(!cellIndex && visit50_281_2(row[0].cells.length === 1))) {
            _$jscoverage['/table.js'].lineData[282]++;
            deleteRows(row);
            _$jscoverage['/table.js'].lineData[283]++;
            continue;
          }
          _$jscoverage['/table.js'].lineData[287]++;
          if (visit51_287_1(row[0].cells[cellIndex])) {
            _$jscoverage['/table.js'].lineData[288]++;
            row[0].removeChild(row[0].cells[cellIndex]);
          }
        }
      }
    }
    _$jscoverage['/table.js'].lineData[293]++;
    return null;
  }
  _$jscoverage['/table.js'].lineData[296]++;
  function placeCursorInCell(cell, placeAtEnd) {
    _$jscoverage['/table.js'].functionData[9]++;
    _$jscoverage['/table.js'].lineData[297]++;
    var range = new Editor.Range(cell[0].ownerDocument);
    _$jscoverage['/table.js'].lineData[298]++;
    if (visit52_298_1(!range.moveToElementEditablePosition(cell, placeAtEnd ? true : undefined))) {
      _$jscoverage['/table.js'].lineData[300]++;
      range.selectNodeContents(cell);
      _$jscoverage['/table.js'].lineData[301]++;
      range.collapse(placeAtEnd ? false : true);
    }
    _$jscoverage['/table.js'].lineData[303]++;
    range.select(true);
  }
  _$jscoverage['/table.js'].lineData[306]++;
  function getSel(editor) {
    _$jscoverage['/table.js'].functionData[10]++;
    _$jscoverage['/table.js'].lineData[307]++;
    var selection = editor.getSelection(), startElement = visit53_308_1(selection && selection.getStartElement()), table = visit54_309_1(startElement && startElement.closest('table', undefined));
    _$jscoverage['/table.js'].lineData[310]++;
    if (visit55_310_1(!table)) {
      _$jscoverage['/table.js'].lineData[311]++;
      return undefined;
    }
    _$jscoverage['/table.js'].lineData[313]++;
    var td = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[11]++;
  _$jscoverage['/table.js'].lineData[314]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[315]++;
  return visit56_315_1(table.contains(n) && (visit57_315_2(visit58_315_3(name === 'td') || visit59_315_4(name === 'th'))));
}, undefined);
    _$jscoverage['/table.js'].lineData[317]++;
    var tr = startElement.closest(function(n) {
  _$jscoverage['/table.js'].functionData[12]++;
  _$jscoverage['/table.js'].lineData[318]++;
  var name = Dom.nodeName(n);
  _$jscoverage['/table.js'].lineData[319]++;
  return visit60_319_1(table.contains(n) && visit61_319_2(name === 'tr'));
}, undefined);
    _$jscoverage['/table.js'].lineData[321]++;
    return {
  table: table, 
  td: td, 
  tr: tr};
  }
  _$jscoverage['/table.js'].lineData[328]++;
  function ensureTd(editor) {
    _$jscoverage['/table.js'].functionData[13]++;
    _$jscoverage['/table.js'].lineData[329]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[330]++;
    return visit62_330_1(info && info.td);
  }
  _$jscoverage['/table.js'].lineData[334]++;
  function ensureTr(editor) {
    _$jscoverage['/table.js'].functionData[14]++;
    _$jscoverage['/table.js'].lineData[335]++;
    var info = getSel(editor);
    _$jscoverage['/table.js'].lineData[336]++;
    return visit63_336_1(info && info.tr);
  }
  _$jscoverage['/table.js'].lineData[339]++;
  var statusChecker = {
  '\u8868\u683c\u5c5e\u6027': getSel, 
  '\u5220\u9664\u8868\u683c': ensureTd, 
  '\u5220\u9664\u5217': ensureTd, 
  '\u5220\u9664\u884c': ensureTr, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': ensureTr, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': ensureTd, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': ensureTd};
  _$jscoverage['/table.js'].lineData[351]++;
  var showBorderClassName = 'ke_show_border', cssTemplate = (visit64_355_1(UA.ie === 6) ? ['table.%2,', 'table.%2 td, table.%2 th,', '{', 'border : #d3d3d3 1px dotted', '}'] : [' table.%2,', ' table.%2 > tr > td,  table.%2 > tr > th,', ' table.%2 > tbody > tr > td, ' + ' table.%2 > tbody > tr > th,', ' table.%2 > thead > tr > td,  table.%2 > thead > tr > th,', ' table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th', '{', 'border : #d3d3d3 1px dotted', '}']).join(''), cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName), extraDataFilter = {
  tags: {
  'table': function(element) {
  _$jscoverage['/table.js'].functionData[15]++;
  _$jscoverage['/table.js'].lineData[373]++;
  var cssClass = element.getAttribute('class'), border = parseInt(element.getAttribute('border'), 10);
  _$jscoverage['/table.js'].lineData[376]++;
  if (visit65_376_1(!border || visit66_376_2(border <= 0))) {
    _$jscoverage['/table.js'].lineData[377]++;
    element.setAttribute('class', S.trim((visit67_377_1(cssClass || '')) + ' ' + showBorderClassName));
  }
}}}, extraHTMLFilter = {
  tags: {
  'table': function(table) {
  _$jscoverage['/table.js'].functionData[16]++;
  _$jscoverage['/table.js'].lineData[387]++;
  var cssClass = table.getAttribute('class'), v;
  _$jscoverage['/table.js'].lineData[389]++;
  if (visit68_389_1(cssClass)) {
    _$jscoverage['/table.js'].lineData[390]++;
    v = S.trim(cssClass.replace(showBorderClassName, ''));
    _$jscoverage['/table.js'].lineData[391]++;
    if (visit69_391_1(v)) {
      _$jscoverage['/table.js'].lineData[392]++;
      table.setAttribute('class', v);
    } else {
      _$jscoverage['/table.js'].lineData[394]++;
      table.removeAttribute('class');
    }
  }
}}};
  _$jscoverage['/table.js'].lineData[404]++;
  function TablePlugin(config) {
    _$jscoverage['/table.js'].functionData[17]++;
    _$jscoverage['/table.js'].lineData[405]++;
    this.config = visit70_405_1(config || {});
  }
  _$jscoverage['/table.js'].lineData[408]++;
  S.augment(TablePlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/table.js'].functionData[18]++;
  _$jscoverage['/table.js'].lineData[411]++;
  editor.addCustomStyle(cssStyleText);
  _$jscoverage['/table.js'].lineData[413]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit71_414_1(dataProcessor && dataProcessor.dataFilter), htmlFilter = visit72_415_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/table.js'].lineData[417]++;
  dataFilter.addRules(extraDataFilter);
  _$jscoverage['/table.js'].lineData[418]++;
  htmlFilter.addRules(extraHTMLFilter);
  _$jscoverage['/table.js'].lineData[420]++;
  var self = this, handlers = {
  '\u8868\u683c\u5c5e\u6027': function() {
  _$jscoverage['/table.js'].functionData[19]++;
  _$jscoverage['/table.js'].lineData[424]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[425]++;
  var info = getSel(editor);
  _$jscoverage['/table.js'].lineData[426]++;
  if (visit73_426_1(info)) {
    _$jscoverage['/table.js'].lineData[427]++;
    DialogLoader.useDialog(editor, 'table', self.config, {
  selectedTable: info.table, 
  selectedTd: info.td});
  }
}, 
  '\u5220\u9664\u8868\u683c': function() {
  _$jscoverage['/table.js'].functionData[20]++;
  _$jscoverage['/table.js'].lineData[437]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[438]++;
  var selection = editor.getSelection(), startElement = visit74_439_1(selection && selection.getStartElement()), table = visit75_440_1(startElement && startElement.closest('table', undefined));
  _$jscoverage['/table.js'].lineData[442]++;
  if (visit76_442_1(!table)) {
    _$jscoverage['/table.js'].lineData[443]++;
    return;
  }
  _$jscoverage['/table.js'].lineData[446]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[449]++;
  selection.selectElement(table);
  _$jscoverage['/table.js'].lineData[450]++;
  var range = selection.getRanges()[0];
  _$jscoverage['/table.js'].lineData[451]++;
  range.collapse();
  _$jscoverage['/table.js'].lineData[452]++;
  selection.selectRanges([range]);
  _$jscoverage['/table.js'].lineData[456]++;
  var parent = table.parent();
  _$jscoverage['/table.js'].lineData[457]++;
  if (visit77_457_1(visit78_457_2(parent[0].childNodes.length === 1) && visit79_458_1(visit80_458_2(parent.nodeName() !== 'body') && visit81_459_1(parent.nodeName() !== 'td')))) {
    _$jscoverage['/table.js'].lineData[460]++;
    parent.remove();
  } else {
    _$jscoverage['/table.js'].lineData[462]++;
    table.remove();
  }
  _$jscoverage['/table.js'].lineData[464]++;
  editor.execCommand('save');
}, 
  '\u5220\u9664\u884c ': function() {
  _$jscoverage['/table.js'].functionData[21]++;
  _$jscoverage['/table.js'].lineData[468]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[469]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[470]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[471]++;
  placeCursorInCell(deleteRows(selection), undefined);
  _$jscoverage['/table.js'].lineData[472]++;
  editor.execCommand('save');
}, 
  '\u5220\u9664\u5217 ': function() {
  _$jscoverage['/table.js'].functionData[22]++;
  _$jscoverage['/table.js'].lineData[476]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[477]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[478]++;
  var selection = editor.getSelection(), element = deleteColumns(selection);
  _$jscoverage['/table.js'].lineData[480]++;
  if (visit82_480_1(element)) {
    _$jscoverage['/table.js'].lineData[481]++;
    placeCursorInCell(element, true);
  }
  _$jscoverage['/table.js'].lineData[483]++;
  editor.execCommand('save');
}, 
  '\u5728\u4e0a\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[23]++;
  _$jscoverage['/table.js'].lineData[487]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[488]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[489]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[490]++;
  insertRow(selection, true);
  _$jscoverage['/table.js'].lineData[491]++;
  editor.execCommand('save');
}, 
  '\u5728\u4e0b\u65b9\u63d2\u5165\u884c': function() {
  _$jscoverage['/table.js'].functionData[24]++;
  _$jscoverage['/table.js'].lineData[495]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[496]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[497]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[498]++;
  insertRow(selection, undefined);
  _$jscoverage['/table.js'].lineData[499]++;
  editor.execCommand('save');
}, 
  '\u5728\u5de6\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[25]++;
  _$jscoverage['/table.js'].lineData[503]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[504]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[505]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[506]++;
  insertColumn(selection, true);
  _$jscoverage['/table.js'].lineData[507]++;
  editor.execCommand('save');
}, 
  '\u5728\u53f3\u4fa7\u63d2\u5165\u5217': function() {
  _$jscoverage['/table.js'].functionData[26]++;
  _$jscoverage['/table.js'].lineData[511]++;
  this.hide();
  _$jscoverage['/table.js'].lineData[512]++;
  editor.execCommand('save');
  _$jscoverage['/table.js'].lineData[513]++;
  var selection = editor.getSelection();
  _$jscoverage['/table.js'].lineData[514]++;
  insertColumn(selection, undefined);
  _$jscoverage['/table.js'].lineData[515]++;
  editor.execCommand('save');
}};
  _$jscoverage['/table.js'].lineData[519]++;
  var children = [];
  _$jscoverage['/table.js'].lineData[520]++;
  S.each(handlers, function(h, name) {
  _$jscoverage['/table.js'].functionData[27]++;
  _$jscoverage['/table.js'].lineData[521]++;
  children.push({
  content: name});
});
  _$jscoverage['/table.js'].lineData[526]++;
  editor.addContextMenu('table', function(node) {
  _$jscoverage['/table.js'].functionData[28]++;
  _$jscoverage['/table.js'].lineData[527]++;
  if (visit83_527_1(S.inArray(Dom.nodeName(node), tableRules))) {
    _$jscoverage['/table.js'].lineData[528]++;
    return true;
  }
}, {
  width: '120px', 
  children: children, 
  listeners: {
  click: function(e) {
  _$jscoverage['/table.js'].functionData[29]++;
  _$jscoverage['/table.js'].lineData[535]++;
  var content = e.target.get('content');
  _$jscoverage['/table.js'].lineData[536]++;
  if (visit84_536_1(handlers[content])) {
    _$jscoverage['/table.js'].lineData[537]++;
    handlers[content].apply(this);
  }
}, 
  beforeVisibleChange: function(e) {
  _$jscoverage['/table.js'].functionData[30]++;
  _$jscoverage['/table.js'].lineData[542]++;
  if (visit85_542_1(e.newVal)) {
    _$jscoverage['/table.js'].lineData[543]++;
    var self = this, children = self.get('children');
    _$jscoverage['/table.js'].lineData[544]++;
    var editor = self.get('editor');
    _$jscoverage['/table.js'].lineData[545]++;
    S.each(children, function(c) {
  _$jscoverage['/table.js'].functionData[31]++;
  _$jscoverage['/table.js'].lineData[546]++;
  var content = c.get('content');
  _$jscoverage['/table.js'].lineData[547]++;
  if (visit86_547_1(!statusChecker[content] || statusChecker[content].call(self, editor))) {
    _$jscoverage['/table.js'].lineData[549]++;
    c.set('disabled', false);
  } else {
    _$jscoverage['/table.js'].lineData[551]++;
    c.set('disabled', true);
  }
});
  }
}}});
  _$jscoverage['/table.js'].lineData[560]++;
  editor.addButton('table', {
  mode: Editor.Mode.WYSIWYG_MODE, 
  listeners: {
  click: function() {
  _$jscoverage['/table.js'].functionData[32]++;
  _$jscoverage['/table.js'].lineData[564]++;
  DialogLoader.useDialog(editor, 'table', self.config, {
  selectedTable: 0, 
  selectedTd: 0});
}}, 
  tooltip: '\u63d2\u5165\u8868\u683c'});
}});
  _$jscoverage['/table.js'].lineData[579]++;
  return TablePlugin;
});
